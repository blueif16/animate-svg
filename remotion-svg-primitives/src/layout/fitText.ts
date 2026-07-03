// The SINGLE measured-text-fitting module for the lesson pipeline. Any string
// that is NOT author-controlled (a title, teaser, caption, label read off a
// brief) is sized by MEASUREMENT between a kids-eye role floor and a cap, so it
// can never silently overflow its zone or render below the legibility floor.
// Closes the field's "text is solved, we measure nothing" gap
// (research/remotion-vendor-best-practices-2026-07-03.md §5 opportunity #1;
// vendor L1/L2). It is the ONLY text-measurement path — never add a second.
//
// Three behaviours, all wrapping @remotion/layout-utils:
//   (a) KIDS-EYE ROLE FLOORS as the lower clamp. Fitting may shrink text only
//       to the role floor (width-relative: scaled by compositionWidth /
//       REFERENCE_WIDTH). Below the floor the API returns the FLOOR size plus an
//       explicit `overflow` flag so the caller re-layouts — never sub-floor text
//       (kids-eye §1: sub-minimum renders are a redesign signal, not a fallback).
//   (b) CJK-AWARE splitting. A CJK run breaks per character, a Latin run per
//       word, mixed handled — pure space-splitting treats a spaceless Chinese
//       sentence as one unbreakable word (the named remotion scan C3 failure)
//       and never wraps.
//   (c) FONT-LOADED gate. Measurement only runs after the font is provably
//       loaded — `useFontGate()` holds a `delayRender` handle and releases it on
//       `document.fonts.ready`, so a measure taken before the fonts load (which
//       would silently use fallback metrics) can never be captured in a rendered
//       frame (vendor L2 recipe). `measureWithFont` also EXPOSES layout-utils'
//       `validateFontIsLoaded` differential assertion (a second measure with the
//       fallback font that THROWS on identical boxes), but it is OPT-IN and OFF
//       by default: for our mixed Latin+CJK system-font STACK it false-positives
//       (a CJK string's declared and fallback family both resolve to the same
//       system CJK fallback → identical boxes → wrong throw). Enable it only for
//       a single dedicated web font that must load. `useFontGate` is the gate.
//
// SPLIT BY CONCERN: the wrap/clamp CORE is PURE and takes an injected
// `measure(text, fontSize)` — testable with no DOM (see fitText.test.ts). The
// PRODUCTION glue (`measureWithFont`, `useFontGate`) binds the real browser
// measurement; those functions touch the DOM/Remotion only when CALLED (at
// render time), so importing this module in Node (tsc, registry build) is safe.
//
// Lesson-AGNOSTIC: roles / text / box / width in — no lesson strings, no topic,
// no hardcoded canvas literal (REFERENCE_WIDTH comes from theme.video.width).

import {useEffect, useState} from "react";
import {measureText} from "@remotion/layout-utils";
import {continueRender, delayRender} from "remotion";

import {sizing, video} from "../theme";

// ===========================================================================
// Role floors — kids-eye is the authority
// ===========================================================================

// The reference width the floors are expressed at: the FIXED lesson canvas
// (theme.video.width = 1280). Floors scale by compositionWidth / REFERENCE_WIDTH
// so the API is resolution-agnostic and lesson-agnostic. This deliberately uses
// the canvas width, NOT a hardcoded 1080 — kids-eye/theme.ts are the floor
// authority and the composition is fixed at 1280×720; a 1080 reference would put
// the headline floor (84) ABOVE the LessonIntroCard default title (96 → 99.6),
// making every title read as "at floor". At 1280 the floors sit below the
// component defaults, so a title can shrink before it overflows.
export const REFERENCE_WIDTH = video.width; // 1280

export type TextRole = "headline" | "supporting" | "label" | "caption";

// Role floors in canvas px at REFERENCE_WIDTH. kids-eye WINS where it disagrees
// with the vendor brief (research §5 / kids-eye §1): supporting & caption =
// theme.sizing.captionFontPx (48, stricter than the brief's 44), label =
// theme.sizing.minFontPx (36, stricter than the brief's 32 and the codified
// legibility FLOOR). headline (kids-eye names no headline role) takes the vendor
// L4 headline floor (84) as a canvas-unit floor — below the 96 default title so
// a title shrinks toward it before overflowing.
export const ROLE_FLOORS: Record<TextRole, number> = {
  headline: 84,
  supporting: sizing.captionFontPx, // 48
  caption: sizing.captionFontPx, // 48
  label: sizing.minFontPx, // 36
};

/** The role's floor in px, scaled to `compositionWidth` (default the canvas). */
export const roleFloorPx = (
  role: TextRole,
  compositionWidth: number = REFERENCE_WIDTH,
): number => ROLE_FLOORS[role] * (compositionWidth / REFERENCE_WIDTH);

// ===========================================================================
// CJK-aware segmentation (pure)
// ===========================================================================

/**
 * A break-allowed unit. `spaceBefore` is true only where the original text had
 * whitespace before this segment (a Latin word boundary) — so the wrapper adds
 * a measured space between same-line Latin words but never between CJK chars.
 */
export type Segment = {text: string; spaceBefore: boolean};

// CJK ideographs + Japanese kana + Korean Hangul. A line may break before ANY
// such character. (Kinsoku punctuation refinement is intentionally out of scope
// — per-ideograph breaking is the load-bearing fix for the space-split bug.)
const CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

/** True if `ch` (a single code point) is a CJK ideograph / kana / hangul char. */
export const isCJK = (ch: string): boolean => CJK_RE.test(ch);

// Split one whitespace-delimited word into break units: each CJK char is its
// own unit; consecutive non-CJK (Latin/digit/punct) chars group into one unit.
// Iterates by CODE POINT so supplementary-plane ideographs are handled.
const splitWordByScript = (word: string): string[] => {
  const out: string[] = [];
  let latinRun = "";
  for (const ch of Array.from(word)) {
    if (isCJK(ch)) {
      if (latinRun) {
        out.push(latinRun);
        latinRun = "";
      }
      out.push(ch);
    } else {
      latinRun += ch;
    }
  }
  if (latinRun) out.push(latinRun);
  return out;
};

/**
 * Segment `text` into break-allowed units: CJK per character, Latin per word,
 * mixed handled. `spaceBefore` marks the first unit of each non-first
 * whitespace word (where a rendered space belongs). Pure & deterministic.
 */
export const segmentText = (text: string): Segment[] => {
  const segments: Segment[] = [];
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  words.forEach((word, wi) => {
    const subs = splitWordByScript(word);
    subs.forEach((sub, si) => {
      segments.push({text: sub, spaceBefore: wi > 0 && si === 0});
    });
  });
  return segments;
};

// ===========================================================================
// Wrap simulation + fit (pure, measure injected)
// ===========================================================================

/** Measure the rendered width of `text` at `fontSize` (px). Injected so the
 *  core is testable without a DOM; production binds `measureWithFont`. */
export type MeasureFn = (text: string, fontSize: number) => number;

/**
 * Greedily wrap `segments` into lines no wider than `maxWidth` at `fontSize`.
 * A rendered space is inserted only where `spaceBefore` is set (Latin word
 * boundaries), never between CJK chars. `exceedsBox` is true when the wrap needs
 * more than `maxLines`, OR when any single unbreakable segment is itself wider
 * than the box (so the caller's binary search shrinks the font). Pure.
 */
export const wrapSegments = ({
  segments,
  fontSize,
  maxWidth,
  maxLines,
  measure,
}: {
  segments: Segment[];
  fontSize: number;
  maxWidth: number;
  maxLines: number;
  measure: MeasureFn;
}): {lines: string[]; exceedsBox: boolean} => {
  const lines: string[] = [];
  let current = "";
  for (const seg of segments) {
    const sep = current !== "" && seg.spaceBefore ? " " : "";
    const candidate = current === "" ? seg.text : current + sep + seg.text;
    if (current === "" || measure(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = seg.text; // new line starts here; any leading space is dropped
    }
  }
  if (current !== "") lines.push(current);
  const anyLineOverflows = lines.some((l) => measure(l, fontSize) > maxWidth);
  return {lines, exceedsBox: lines.length > maxLines || anyLineOverflows};
};

/** Font-size search resolution: 0.1px steps (fontSize * PRECISION is integer). */
const PRECISION = 10;

/** Default CSS line-height used when deriving/checking a box height budget. */
export const DEFAULT_LINE_HEIGHT = 1.15;

export type FitTextBoxOptions = {
  /** The string to fit (measured, not author-controlled). */
  text: string;
  /** kids-eye role → the lower floor the fit may not shrink below. */
  role: TextRole;
  /** The target box in canvas px. `height` is optional (bounds line count). */
  box: {width: number; height?: number};
  /** Composition width for floor scaling. Default REFERENCE_WIDTH (the canvas). */
  compositionWidth?: number;
  /** Max lines the text may wrap into. Default 2. */
  maxLines?: number;
  /** The ceiling font size — text never grows past this. Default 2000. */
  cap?: number;
  /** CSS line-height for the optional box-height budget. Default 1.15. */
  lineHeight?: number;
  /** Injected width measurement. Production: `measureWithFont(style)`. */
  measure: MeasureFn;
};

export type FitTextBoxResult = {
  /** The chosen font size (px). Guaranteed >= the (width-scaled) role floor. */
  fontSize: number;
  /** The exact lines to render at `fontSize` (order-preserving). */
  lines: string[];
  /** True when the text could NOT fit at/above the floor — render at the floor
   *  and RE-LAYOUT (shorter copy / bigger zone); never render sub-floor. */
  overflow: boolean;
  /** True when `fontSize` is exactly the role floor. */
  atFloor: boolean;
};

/**
 * Fit `text` into `box` at the LARGEST font size in [floor, cap] that wraps
 * within `maxLines` (and, if given, `box.height`), using CJK-aware wrapping.
 * When nothing fits at/above the floor, returns the floor size + `overflow:true`
 * and the wrap AT the floor — never a smaller size. Pure (measure injected).
 */
export const fitTextBox = ({
  text,
  role,
  box,
  compositionWidth = REFERENCE_WIDTH,
  maxLines = 2,
  cap = 2000,
  lineHeight = DEFAULT_LINE_HEIGHT,
  measure,
}: FitTextBoxOptions): FitTextBoxResult => {
  const floor = roleFloorPx(role, compositionWidth);
  const segments = segmentText(text);

  const heightFits = (lines: string[], fontSize: number): boolean =>
    box.height == null || lines.length * fontSize * lineHeight <= box.height;

  // Binary search the largest fontSize in [floor, cap] that fits.
  let left = Math.round(floor * PRECISION);
  const right0 = Math.round(Math.max(floor, cap) * PRECISION);
  let right = right0;
  let best: {fontSize: number; lines: string[]} | null = null;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const fontSize = mid / PRECISION;
    const {lines, exceedsBox} = wrapSegments({
      segments,
      fontSize,
      maxWidth: box.width,
      maxLines,
      measure,
    });
    if (!exceedsBox && heightFits(lines, fontSize)) {
      best = {fontSize, lines};
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (best) {
    return {
      fontSize: best.fontSize,
      lines: best.lines,
      overflow: false,
      atFloor: Math.abs(best.fontSize - floor) < 1 / PRECISION,
    };
  }

  // Nothing fits at/above the floor → render AT the floor and signal overflow so
  // the caller re-layouts. Never sub-floor.
  const atFloor = wrapSegments({
    segments,
    fontSize: floor,
    maxWidth: box.width,
    maxLines,
    measure,
  });
  return {fontSize: floor, lines: atFloor.lines, overflow: true, atFloor: true};
};

export type FitTextLineOptions = {
  text: string;
  role: TextRole;
  /** The width to fit within (canvas px). */
  withinWidth: number;
  compositionWidth?: number;
  /** The ceiling font size. Default 2000. */
  cap?: number;
  measure: MeasureFn;
};

export type FitTextLineResult = {
  fontSize: number;
  overflow: boolean;
  atFloor: boolean;
};

/**
 * Single-line proportional fit (vendor `fitText`): measure once, scale linearly
 * to `withinWidth`, cap, then clamp UP to the role floor with an overflow flag.
 * For a one-line title/label where wrapping is not wanted.
 */
export const fitTextLine = ({
  text,
  role,
  withinWidth,
  compositionWidth = REFERENCE_WIDTH,
  cap = 2000,
  measure,
}: FitTextLineOptions): FitTextLineResult => {
  const floor = roleFloorPx(role, compositionWidth);
  const SAMPLE = 100;
  const sampleWidth = measure(text, SAMPLE);
  const raw = sampleWidth > 0 ? (withinWidth / sampleWidth) * SAMPLE : cap;
  const capped = Math.min(cap, raw);
  if (capped < floor) {
    return {fontSize: floor, overflow: true, atFloor: true};
  }
  return {
    fontSize: capped,
    overflow: false,
    atFloor: Math.abs(capped - floor) < 1e-6,
  };
};

// ===========================================================================
// Production glue — bind the real browser measurement, gate on font load
// ===========================================================================

export type FontStyle = {
  fontFamily: string;
  fontWeight?: number | string;
  letterSpacing?: string;
  /**
   * Opt-in differential fallback-font assertion (vendor L2). Default FALSE.
   * Layout-utils measures a second time with the fallback font and THROWS on
   * identical boxes (>4 unique chars). For a mixed Latin+CJK SYSTEM stack this
   * false-positives — a CJK string's declared family and the null fallback both
   * resolve to the same system CJK font, so the boxes match and it wrongly
   * throws. Enable ONLY for a single dedicated web font. The load gate is
   * `useFontGate`, not this assertion.
   */
  validateFontIsLoaded?: boolean;
};

/**
 * Build a {@link MeasureFn} bound to @remotion/layout-utils `measureText` with a
 * shared font style. `validateFontIsLoaded` defaults to FALSE (see FontStyle —
 * it false-positives on a mixed CJK system stack); `useFontGate` is the load
 * gate. Only callable in the browser (Remotion render / studio / gallery).
 */
export const measureWithFont =
  (style: FontStyle): MeasureFn =>
  (text, fontSize) =>
    measureText({
      text,
      fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacing,
      validateFontIsLoaded: style.validateFontIsLoaded ?? false,
    }).width;

/**
 * Block the render until the document's fonts are provably loaded, then allow
 * measurement. The vendor L2 recipe (recorder `WaitForFonts`, template-tiktok
 * font-before-fetch): hold a `delayRender` handle and resolve it on
 * `document.fonts.ready`, so a measure taken before the font loads (which would
 * silently use fallback metrics) cannot be captured in a rendered frame.
 *
 * Returns `true` once fonts are ready. If already loaded (system fonts) or if
 * there is no FontFaceSet (Node/tests), returns true immediately and blocks
 * nothing. Pair the measure call with `validateFontIsLoaded: true` (the default
 * in `measureWithFont`) as the belt-and-braces assertion.
 */
export const useFontGate = (): boolean => {
  const supported =
    typeof document !== "undefined" &&
    typeof (document as Document & {fonts?: FontFaceSet}).fonts !== "undefined";

  const [ready, setReady] = useState<boolean>(
    () => !supported || document.fonts.status === "loaded",
  );
  const [handle] = useState<number | null>(() =>
    !supported || document.fonts.status === "loaded"
      ? null
      : delayRender("fitText: awaiting document.fonts.ready"),
  );

  useEffect(() => {
    if (ready || !supported) return;
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      setReady(true);
      if (handle !== null) continueRender(handle);
    };
    document.fonts.ready.then(finish).catch(finish);
    return () => {
      cancelled = true;
    };
  }, [ready, supported, handle]);

  return ready;
};
