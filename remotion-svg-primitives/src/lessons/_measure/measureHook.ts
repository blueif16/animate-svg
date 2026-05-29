// Lesson-agnostic measurement instrumentation for the machine-gated
// verification pass (docs/proposals/machine-gated-verification.md §2.2–2.3).
//
// PURPOSE. The fast `lesson:check` path derives every bbox from layout.ts with
// LINEAR progress, so it under-estimates any element whose scene easing
// OVERSHOOTS its endpoint (the migrating whole-card peaks at scale 1.06; every
// `PopIn motion="bouncy"` entrance peaks ~4.6% over). This module lets the
// opt-in `--measured` pass capture the TRUE, transform-aware geometry of each
// load-bearing element at the motion-peak frame, mapped into composition pixel
// space — exactly the frames the linear envelope mis-measures.
//
// HOW IT STAYS INERT. Nothing here runs unless `window.__MEASURE__` is set.
// `window.__MEASURE__` is only ever set by the measured-pass harness
// (scripts/lesson-measured.mjs) via renderStill's `inputProps`/injection; a
// normal `lesson:render` or Studio session never sets it, so a normal render is
// byte-for-byte unaffected. `measureProps(id)` returns a plain
// `{ "data-mid": id }` attribute object in BOTH modes — it is a stable DOM tag,
// not behavior — so spreading it onto an element is safe and invisible.
//
// COORDINATE SPACE. `el.getBBox()` returns the element's bbox in its own SVG
// user space (transform-aware for transforms INSIDE the element, but NOT for
// ancestor transforms like the migrating card's `scale(...)` wrapper). To get
// composition pixels we multiply the bbox corners by `el.getScreenCTM()`
// (user-space → screen px) and then by the inverse of the root <svg>'s screen
// CTM (screen px → composition viewBox px). For fen-yu-he the viewBox is 1:1
// with the composition size so this is near-identity, but doing the full CTM
// math keeps the hook correct for any future lesson with a root transform or a
// non-1:1 viewBox (proposal §9 "getBBox under SSR" risk).

import { useLayoutEffect, useState } from "react";
import {
  continueRender,
  delayRender,
  getInputProps,
  useCurrentFrame,
} from "remotion";

// The flag the measured-pass harness sets on the SSR page. Declared loosely so
// this module needs no DOM lib augmentation and stays lint-clean under tsc.
type MeasureWindow = Window & {
  __MEASURE__?: boolean;
  __MEASURE_RESULTS__?: MeasuredElement[];
};

export type MeasuredElement = {
  id: string;
  // [x, y, width, height] in composition pixel space (top-left origin).
  bbox: [number, number, number, number];
};

// The single console line the harness greps out of onBrowserLog. A unique
// prefix keeps it unambiguous among Remotion's own browser logs.
export const MEASURE_LOG_PREFIX = "MEASURE_BBOX";

// The measured-pass harness can't run a page-init script through the public
// renderStill API, so it signals the pass via `inputProps.__measure`. We mirror
// that onto `window.__MEASURE__` here — the documented, lesson-agnostic gate the
// rest of this module reads. A normal render passes no such input prop, so the
// flag stays false and every code path below is inert.
const syncMeasureFlag = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const input = getInputProps() as { __measure?: unknown };
    if (input && input.__measure) {
      (window as MeasureWindow).__MEASURE__ = true;
    }
  } catch {
    // getInputProps can throw outside a Remotion context; treat as not-measuring.
  }
};

const isMeasuring = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  syncMeasureFlag();
  return Boolean((window as MeasureWindow).__MEASURE__);
};

/**
 * Stable DOM tag for a load-bearing element. Spread onto the OUTERMOST element
 * (the `<g>` / wrapper) of each registered manifest element:
 *
 *   <g {...measureProps("glyph-whole")} transform={...}> ... </g>
 *
 * The `id` MUST match the element's `manifest.elements[].id` so the measured
 * pass can join captured geometry back to the manifest by id. Returns the same
 * object in normal and measured renders — it is inert markup, never behavior.
 */
export const measureProps = (id: string): { "data-mid": string } => ({
  "data-mid": id,
});

// Map a single point from an element's user space into composition viewBox px,
// via screen space: composition = inverse(rootScreenCTM) · elScreenCTM · point.
const toCompositionPoint = (
  x: number,
  y: number,
  elCtm: DOMMatrix,
  rootInverse: DOMMatrix,
): { x: number; y: number } => {
  const screenX = elCtm.a * x + elCtm.c * y + elCtm.e;
  const screenY = elCtm.b * x + elCtm.d * y + elCtm.f;
  return {
    x: rootInverse.a * screenX + rootInverse.c * screenY + rootInverse.e,
    y: rootInverse.b * screenX + rootInverse.d * screenY + rootInverse.f,
  };
};

const measureAll = (): MeasuredElement[] => {
  const out: MeasuredElement[] = [];
  const tagged = document.querySelectorAll<SVGGraphicsElement>("[data-mid]");
  for (const el of Array.from(tagged)) {
    const id = el.getAttribute("data-mid");
    if (!id) {
      continue;
    }
    // getBBox/getScreenCTM exist only on SVG graphics elements; skip anything
    // else defensively so a stray data-mid never throws during a render.
    if (
      typeof el.getBBox !== "function" ||
      typeof el.getScreenCTM !== "function"
    ) {
      continue;
    }
    const box = el.getBBox();
    const elCtm = el.getScreenCTM();
    const rootSvg = el.ownerSVGElement;
    const rootCtm = rootSvg?.getScreenCTM?.() ?? null;
    if (!elCtm || !rootCtm) {
      continue;
    }
    const rootInverse = rootCtm.inverse();
    // Map all four corners (a rotation/skew in any ancestor would make a single
    // corner pair insufficient; we take the axis-aligned hull of all four).
    const corners = [
      [box.x, box.y],
      [box.x + box.width, box.y],
      [box.x, box.y + box.height],
      [box.x + box.width, box.y + box.height],
    ].map(([px, py]) => toCompositionPoint(px, py, elCtm, rootInverse));
    const xs = corners.map((c) => c.x);
    const ys = corners.map((c) => c.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    out.push({
      id,
      bbox: [
        Number(minX.toFixed(2)),
        Number(minY.toFixed(2)),
        Number((maxX - minX).toFixed(2)),
        Number((maxY - minY).toFixed(2)),
      ],
    });
  }
  return out;
};

/**
 * Inert in normal renders. When `window.__MEASURE__` is set (measured pass
 * only), walk every `[data-mid]` element, compute its composition-px bbox via
 * getBBox + getScreenCTM, stash the array on `window.__MEASURE_RESULTS__`, and
 * console.log one `MEASURE_BBOX <json>` line for the harness's onBrowserLog to
 * capture. Call once from the scene root AFTER the children have mounted (a
 * lesson scene already re-renders per frame; this runs every render but only
 * does work under the flag).
 *
 * Returns the measured array (empty when not measuring) so a caller could also
 * read it directly if ever embedded in a non-SSR context.
 */
export const runMeasureHook = (): MeasuredElement[] => {
  if (!isMeasuring()) {
    return [];
  }
  const results = measureAll();
  (window as MeasureWindow).__MEASURE_RESULTS__ = results;
  // One line, JSON payload. The harness greps MEASURE_LOG_PREFIX out of the
  // browser console via renderStill's onBrowserLog.
  console.log(`${MEASURE_LOG_PREFIX} ${JSON.stringify(results)}`);
  return results;
};

/**
 * React hook a lesson scene root mounts ONCE (no JSX needed, so it lives in
 * this `.ts` module). Inert in normal renders.
 *
 * Under the `--measured` pass, Remotion captures a still SYNCHRONOUSLY and does
 * not wait for a plain `useEffect` to flush — so we must (a) run the measure in
 * a `useLayoutEffect` (fires after the DOM commits, before paint) and (b) hold
 * the render open with `delayRender()`/`continueRender()` so the harness's
 * `onBrowserLog` reliably receives the `MEASURE_BBOX` console line before the
 * screenshot is taken (proposal §2.3). A normal render never sets
 * `window.__MEASURE__`, so `delayRender` is never called and the render is
 * byte-for-byte unaffected.
 */
export const useMeasureHook = (): void => {
  const frame = useCurrentFrame();
  // One delayRender handle per frame while measuring; null otherwise.
  const [handle] = useState<number | null>(() =>
    isMeasuring() ? delayRender(`measure-${frame}`) : null,
  );
  useLayoutEffect(() => {
    if (!isMeasuring()) {
      return;
    }
    runMeasureHook();
    if (handle !== null) {
      continueRender(handle);
    }
    // frame is intentionally a dependency so the measure re-runs per sampled
    // frame; handle is created once per mount.
  }, [frame, handle]);
};
