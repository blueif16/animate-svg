import { useEffect, useRef, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender } from "remotion";
import { FXDefs } from "../fx";
import { colors, typography } from "../theme";
import { demoProps } from "./demoProps";

// =========================================================================
// PreviewComposition — renders ONE registered component, by id, for the static
// gallery's per-component poster + animated loop.
//
// It REUSES the exact same `demoProps[id].render()` the studio ComponentGallery
// uses (the registry-enforced demo map). `render()` returns SVG content centered
// on (0,0); demo variant strips vary widely in size (a single NumberCard vs the
// 1720-wide LessonIntroCard strip). So instead of a fixed viewBox that would
// clip the wide ones, we MEASURE the rendered content's getBBox() once and apply
// a uniform fit transform — every demo is framed to the same small canvas with a
// consistent margin. Frame-driven motion/fx animate naturally across the clip;
// progress-pinned primitives show their meaningfully-complete state. NO new data
// model — the id and its demo are the only inputs.
//
// Registered ONLY in PreviewRoot (the dedicated bundler entry for
// `npm run gallery:previews`), never in the app Root.
// =========================================================================

const FONT = typography.fontFamily;

export const PREVIEW_WIDTH = 760;
export const PREVIEW_HEIGHT = 440;
export const PREVIEW_DURATION = 64; // ~2.1s loop @ 30fps — small + enough motion
export const PREVIEW_FPS = 30;
export const PREVIEW_POSTER_FRAME = 22; // matches the studio still frame intent
const MARGIN = 40; // padding around the measured content, in canvas units

export type PreviewInput = { id: string };

export const PreviewComposition: React.FC<PreviewInput> = ({ id }) => {
  const demo = demoProps[id];
  const contentRef = useRef<SVGGElement>(null);
  // transform that fits the measured content into the canvas with a margin.
  const [fit, setFit] = useState<string | null>(null);
  // hold the render until the fit transform is measured (so stills/gifs capture
  // the framed layout, not the pre-measure unscaled flash).
  const [handle] = useState(() => delayRender("measure preview bbox"));

  // Measure the content's natural bbox after mount, then scale+translate it so
  // its center lands at the canvas center and it fits within MARGIN on all sides.
  useEffect(() => {
    const g = contentRef.current;
    if (!g) {
      continueRender(handle);
      return;
    }
    try {
      const bbox = g.getBBox();
      if (bbox && bbox.width > 0 && bbox.height > 0) {
        const availW = PREVIEW_WIDTH - MARGIN * 2;
        const availH = PREVIEW_HEIGHT - MARGIN * 2;
        // never UP-scale past 1 (keeps small primitives at true render size);
        // only shrink the oversize strips to fit.
        const scale = Math.min(1, availW / bbox.width, availH / bbox.height);
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        setFit(`scale(${scale}) translate(${-cx} ${-cy})`);
      }
      continueRender(handle);
    } catch (err) {
      cancelRender(err);
    }
    // measure once per id; the bbox is frame-stable for these strips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      <svg
        height={PREVIEW_HEIGHT}
        viewBox={`${-PREVIEW_WIDTH / 2} ${-PREVIEW_HEIGHT / 2} ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
        width={PREVIEW_WIDTH}
      >
        <FXDefs />
        {demo ? (
          // Outer group applies the fit transform; inner ref group is what we
          // measure (its untransformed natural bbox).
          <g transform={fit ?? undefined}>
            <g ref={contentRef}>{demo.render()}</g>
          </g>
        ) : (
          <text
            dominantBaseline="middle"
            fill={colors.coral}
            fontFamily={FONT}
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            x={0}
            y={0}
          >
            {`UNMAPPED: ${id}`}
          </text>
        )}
      </svg>
    </AbsoluteFill>
  );
};
