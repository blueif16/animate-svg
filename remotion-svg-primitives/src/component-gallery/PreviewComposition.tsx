import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  Internals,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FXDefs } from "../fx";
import { colors, typography, video } from "../theme";
import { demoProps } from "./demoProps";

// =========================================================================
// PreviewComposition — renders ONE registered component, by id, for the static
// gallery's previews. TWO modes (the `mode` inputProp):
//
//   "fit"  (default) — the demo fitted to fill the 760×440 cell. The grid
//          thumbnail: shows the craft + variants. Size is NOT the point here.
//   "size" — the component at its DETERMINED DEFAULT size, placed 1:1 inside a
//          to-scale 1280×720 frame so you read its REAL on-canvas size. For a
//          primitive used in groups it shows ONE unit AND the typical group
//          (the unit repeated) — because one unit alone is misleadingly tiny;
//          the group is how it actually appears. A composite (no `unit`) shows
//          its single focal render.
//
// HONEST SIZE, no parallel number: "size" reads the component's REAL default
// (the demo renders at default props at 1:1) — there is NO hand-typed
// `footprint` value to drift, and NO chrome: just the frame outline. No
// safe-area dashes, no squeeze/"stress" view, no legibility warning tags. If a
// default renders too small in the frame, the FIX is to bump the component's
// default size — not to flag it in the gallery.
//
// LOOPING (fit only): a one-shot effect fires early then sits idle, so its gif
// reads dead. A demo can declare `loopFrames`; its subtree renders inside
// <LoopedFrame>, a pure TimelineContext override (SVG-safe) that resets
// useCurrentFrame() each cycle so the effect VISIBLY re-fires. "size" is a still.
//
// Registered ONLY in PreviewRoot (the gallery:previews bundler entry).
// =========================================================================

const FONT = typography.fontFamily;

const LoopedFrame: React.FC<{ loopFrames: number; children: ReactNode }> = ({
  loopFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const { id } = useVideoConfig();
  const timeline = useContext(Internals.TimelineContext);
  const looped = ((frame % loopFrames) + loopFrames) % loopFrames;
  const value = useMemo(
    () =>
      timeline
        ? { ...timeline, frame: { ...timeline.frame, [id]: looped } }
        : null,
    [timeline, id, looped],
  );
  if (!value) return <>{children}</>;
  return (
    <Internals.TimelineContext.Provider value={value}>
      {children}
    </Internals.TimelineContext.Provider>
  );
};

export const PREVIEW_WIDTH = 760;
export const PREVIEW_HEIGHT = 440;
export const PREVIEW_DURATION = 90;
export const PREVIEW_FPS = 30;
export const PREVIEW_POSTER_FRAME = 16;
const MARGIN = 36; // fit-mode padding around the measured content, in cell units

// Real lesson canvas (src/theme.ts). "size" mode draws it 1:1 so a component's
// default reads at its true relative size.
const CANVAS_W = video.width; // 1280
const CANVAS_H = video.height; // 720
const GROUP_COUNT = 6; // typical multiplicity for the "group" row
const UNIT_Y = CANVAS_H * 0.31; // single-unit row
const GROUP_Y = CANVAS_H * 0.64; // group row

export type PreviewMode = "fit" | "size";
export type PreviewInput = {
  id: string;
  mode?: PreviewMode;
};

export const PreviewComposition: React.FC<PreviewInput> = ({
  id,
  mode = "fit",
}) => {
  const demo = demoProps[id];
  const measureRef = useRef<SVGGElement>(null);
  // fit: the scale-to-fill transform. size: the measured unit box {w,h}.
  const [fitTransform, setFitTransform] = useState<string | null>(null);
  const [box, setBox] = useState<{ w: number; h: number; cx: number; cy: number } | null>(null);
  const [handle] = useState(() => delayRender("measure preview bbox"));

  // FIT: measure the whole demo, scale it to FILL the cell (no upscale cap).
  // SIZE: measure ONE unit (default size) so the group row can be spaced; the
  // unit/group then render at 1:1 in the to-scale canvas.
  useEffect(() => {
    const g = measureRef.current;
    if (!g) {
      continueRender(handle);
      return;
    }
    try {
      const bbox = g.getBBox();
      if (bbox && bbox.width > 0 && bbox.height > 0) {
        if (mode === "fit") {
          const cx = bbox.x + bbox.width / 2;
          const cy = bbox.y + bbox.height / 2;
          const availW = PREVIEW_WIDTH - MARGIN * 2;
          const availH = PREVIEW_HEIGHT - MARGIN * 2;
          const scale = Math.min(availW / bbox.width, availH / bbox.height);
          setFitTransform(`scale(${scale}) translate(${-cx} ${-cy})`);
        } else {
          setBox({
            w: bbox.width,
            h: bbox.height,
            cx: bbox.x + bbox.width / 2,
            cy: bbox.y + bbox.height / 2,
          });
        }
      }
      continueRender(handle);
    } catch (err) {
      cancelRender(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode]);

  if (!demo) {
    const vb =
      mode === "size"
        ? `0 0 ${CANVAS_W} ${CANVAS_H}`
        : `${-PREVIEW_WIDTH / 2} ${-PREVIEW_HEIGHT / 2} ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`;
    return (
      <AbsoluteFill style={{ backgroundColor: colors.white }}>
        <svg height={PREVIEW_HEIGHT} viewBox={vb} width={PREVIEW_WIDTH}>
          <text
            dominantBaseline="middle"
            fill={colors.coral}
            fontFamily={FONT}
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            x={mode === "size" ? CANVAS_W / 2 : 0}
            y={mode === "size" ? CANVAS_H / 2 : 0}
          >
            {`UNMAPPED: ${id}`}
          </text>
        </svg>
      </AbsoluteFill>
    );
  }

  // ----------------------------- SIZE MODE -----------------------------
  if (mode === "size") {
    // A primitive used in groups declares `unit` (one instance at default size);
    // we then show one unit + a row of GROUP_COUNT. A composite has no `unit` —
    // its `render()` IS the focal element, shown once.
    const hasUnit = typeof demo.unit === "function";
    const unitNode = hasUnit ? demo.unit!() : demo.render();
    const slot = box ? box.w * 1.18 : 0; // group spacing once measured
    // composite: recenter on the measured centroid (composites aren't always
    // origin-centered). unit demos render centered on (0,0) already.
    const compositeXform = box
      ? `translate(${CANVAS_W / 2 - box.cx} ${CANVAS_H / 2 - box.cy})`
      : `translate(${CANVAS_W / 2} ${CANVAS_H / 2})`;

    return (
      <AbsoluteFill style={{ backgroundColor: colors.white }}>
        <svg height={PREVIEW_HEIGHT} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} width={PREVIEW_WIDTH}>
          <FXDefs />
          {/* to-scale canvas bounds (clean outline only) */}
          <rect
            fill="none"
            height={CANVAS_H - 4}
            stroke={colors.softGrayBlue}
            strokeWidth={4}
            width={CANVAS_W - 4}
            x={2}
            y={2}
          />
          {hasUnit ? (
            <>
              {/* one unit at default size (also the measure target) */}
              <g transform={`translate(${CANVAS_W / 2} ${UNIT_Y})`}>
                <g ref={measureRef}>{unitNode}</g>
              </g>
              {/* the typical group: GROUP_COUNT copies of the unit at default size */}
              {box
                ? Array.from({ length: GROUP_COUNT }, (_, i) => (
                    <g
                      key={i}
                      transform={`translate(${CANVAS_W / 2 + (i - (GROUP_COUNT - 1) / 2) * slot} ${GROUP_Y})`}
                    >
                      {demo.unit!()}
                    </g>
                  ))
                : null}
            </>
          ) : (
            // composite / single-use: the focal render once, at 1:1, recentered.
            <g transform={compositeXform}>
              <g ref={measureRef}>{unitNode}</g>
            </g>
          )}
        </svg>
      </AbsoluteFill>
    );
  }

  // ------------------------------ FIT MODE ------------------------------
  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <svg
        height={PREVIEW_HEIGHT}
        viewBox={`${-PREVIEW_WIDTH / 2} ${-PREVIEW_HEIGHT / 2} ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
        width={PREVIEW_WIDTH}
      >
        <FXDefs />
        <g transform={fitTransform ?? undefined}>
          <g ref={measureRef}>
            {demo.loopFrames ? (
              <LoopedFrame loopFrames={demo.loopFrames}>
                {demo.render()}
              </LoopedFrame>
            ) : (
              demo.render()
            )}
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
