import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";
import { fontFamily } from "../shape-primitives/shared";
import { AssetMorph } from "./AssetMorph";
import { PopIn } from "./PopIn";
import { EASE } from "./curves";

export type PictographEvolutionMode = "morph" | "crossfade";

export type PictographEvolutionProps = {
  /**
   * The ordered representation stages of the character's evolution, drawn IN
   * PLACE on the shared center: typically `[objectPicture, ancientGlyph,
   * modernChar]` — the caller passes an `<IconAsset>` / an ancient-glyph node /
   * a `<HanziCard>` (or any `ReactNode`). The component bakes NONE of them. Min
   * 2. Every stage MUST be authored so its visual center coincides with
   * (`centerX`,`centerY`) — that bbox match is what makes each swap read as the
   * SAME thing changing shape (实物→古文字→今字), not a cut. `stageSize` is the
   * nominal footprint each stage is sized to (the caller scales its node to it).
   */
  stages: ReactNode[];
  /**
   * `"morph"` (default): each consecutive stage transition is an `<AssetMorph>`
   * FX-masked sparkle crossfade sharing the stage center — the object BECOMES
   * the ancient glyph BECOMES the modern char. `"crossfade"`: a plainer opacity
   * dissolve between consecutive stages (no sparkle mask), for calmer reveals.
   */
  mode?: PictographEvolutionMode;
  /**
   * When true, after the LAST stage has settled, ghost the FIRST stage (the real
   * object) behind it so the child SEES the modern character's shape echoing the
   * object's shape — the 字形与事物形状相似 payoff. The ghost fades in via a named
   * `EASE.*` curve and sits at the SAME shared center, behind the final stage.
   * Default false.
   */
  silhouetteOverlap?: boolean;
  /**
   * Optional caption node UNDER each stage (实物 / 古文字 / 今字 — the caller
   * localizes; never baked). Index-aligned with `stages`; a sparse array
   * (only some stages captioned) is fine. Each label fades in with its stage.
   */
  stageLabels?: Array<ReactNode | undefined>;
  /**
   * Local (cue-relative) frame. The component derives WHICH transition is active
   * (by stage INDEX) and its local progress from `atFrame`,
   * `perStageDurationFrames`, and `interStageGapFrames` — ZERO frame literals.
   * The composer passes `cues[id].startFrame + offset`; this component never
   * reads a master-timeline literal.
   */
  atFrame: number;
  /**
   * Frames each stage HOLDS before the transition INTO the next stage begins.
   * Stage 0 settles first; the morph into stage 1 begins
   * `perStageDurationFrames` (+ gap) later, and so on. Default 40.
   */
  perStageDurationFrames?: number;
  /**
   * Extra frames the transition itself occupies between one stage's hold ending
   * and the next stage's hold beginning (the AssetMorph / crossfade window).
   * Default 12.
   */
  interStageGapFrames?: number;
  /** Shared visual center of every stage + each morph's FX burst. */
  centerX?: number;
  centerY?: number;
  /** Nominal footprint each stage is sized to (informs the ghost + label
   *  placement only — the caller sizes its own nodes). Default 220. */
  stageSize?: number;
  /** Opacity of the silhouette-overlap ghost of stage 0 (0..1). Default 0.32. */
  silhouetteOpacity?: number;
  /** Sparkle/FX color for the morph masks. Default reward. */
  fxColor?: string;
  /** Ink color for the default stage labels. Default textNavy. */
  inkColor?: string;
  /** Overall placement of the component's origin in the parent coordinate
   *  system. The shared center is offset from here by centerX/centerY. */
  x?: number;
  y?: number;
  /** Optional extra transform applied to the whole component group. */
  transform?: string;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Drop from the shared stage center to a stage's caption baseline, scaled off
// the nominal stage footprint so labels clear the art on every stage.
const LABEL_DROP = 0.72; // × stageSize, below center

/**
 * PictographEvolution — reveals that a Chinese character's shape GREW from the
 * thing it pictures: it walks an ordered list of caller-supplied representation
 * stages (实物 → 古代象形字 → 现代汉字) drawn on ONE shared center, morphing the
 * SAME form from each stage into the next, and (the payoff) optionally ghosts
 * the original object behind the final character so the child SEES 字形与事物形状
 * 相似 — the 字理演变 / 象形字 teaching beat.
 *
 * Each consecutive transition is an `<AssetMorph>` (FX-masked sparkle crossfade
 * sharing the stage center — exactly its contract) so the change reads as one
 * thing reshaping, not a cut; the first stage enters with `<PopIn>` and the
 * silhouette ghost fades in via named `EASE.*` motion. WHICH transition is
 * active at a given frame is derived from the stage INDEX and the per-stage
 * durations — ZERO frame literals — and `mode="crossfade"` swaps the sparkle
 * mask for a plain opacity dissolve.
 *
 * Lesson-agnostic & prop-driven: it bakes NO character, object, or string — the
 * caller passes every `stages[]` node (an `<IconAsset>` object, an ancient-glyph
 * node, a `<HanziCard>`), the localized `stageLabels[]`, and `atFrame` from a
 * cue offset. The SAME component drives 日 (sun), 山 (mountain), 水 (water), or
 * any pictograph — only the props change.
 */
export const PictographEvolution: React.FC<PictographEvolutionProps> = ({
  stages,
  mode = "morph",
  silhouetteOverlap = false,
  stageLabels,
  atFrame,
  perStageDurationFrames = 40,
  interStageGapFrames = 12,
  centerX = 0,
  centerY = 0,
  stageSize = 220,
  silhouetteOpacity = 0.32,
  fxColor,
  inkColor,
  x = 0,
  y = 0,
  transform,
}) => {
  const frame = useCurrentFrame();
  const local = frame - atFrame;
  const D = Math.max(1, perStageDurationFrames);
  const gap = Math.max(1, interStageGapFrames);
  // One stage occupies its hold (D) plus the transition INTO the next (gap).
  const step = D + gap;
  const fx = fxColor ?? colors.reward;
  const ink = inkColor ?? colors.textNavy;

  const n = stages.length;
  // A single stage is a degenerate evolution — just place it (still useful as a
  // caller fallback). Two or more drives the morph chain.
  const last = Math.max(0, n - 1);

  // The transition INTO stage k (for k >= 1) COMPLETES at local frame
  // `k * step`. AssetMorph(direction="bundle") wants the swap to COMPLETE at its
  // `atFrame`, occupying the preceding `gap` frames — so transition k's
  // AssetMorph.atFrame is `atFrame + k * step` (cue-relative; never a literal).
  const transitionCompleteLocal = (k: number) => k * step;

  // The silhouette ghost begins fading in once the LAST stage has settled, over
  // a window of one hold. Derived from the last transition's completion frame —
  // never a literal.
  const lastCompleteLocal = transitionCompleteLocal(last);
  const ghostOpacity =
    silhouetteOverlap && n >= 2
      ? interpolate(
          local,
          [lastCompleteLocal + D * 0.15, lastCompleteLocal + D * 0.85],
          [0, silhouetteOpacity],
          { ...CLAMP, easing: EASE.enter },
        )
      : 0;

  // Per-stage caption reveal: a stage's label fades in as that stage settles and
  // (until it is the final stage) fades back out as the NEXT transition fires,
  // so only the current stage's caption shows. Derived from the stage's
  // transition-complete frame.
  const labelOpacityOf = (k: number) => {
    const inAt = transitionCompleteLocal(k);
    const appear = interpolate(
      local,
      [inAt - gap * 0.5, inAt + D * 0.3],
      [0, 1],
      { ...CLAMP, easing: EASE.enter },
    );
    if (k >= last) {
      return appear;
    }
    const outAt = transitionCompleteLocal(k + 1);
    const fade = interpolate(local, [outAt - gap * 0.5, outAt], [1, 0], CLAMP);
    return appear * fade;
  };

  return (
    <g transform={`translate(${x} ${y})${transform ? ` ${transform}` : ""}`}>
      {/* Silhouette ghost of the ORIGINAL object behind the final character —
          the 字形与事物相似 payoff. Drawn FIRST so it sits behind everything;
          only present once the last stage has settled. */}
      {ghostOpacity > 0 ? (
        <g opacity={ghostOpacity}>{stages[0]}</g>
      ) : null}

      {/* Stage 0 entrance: a PopIn settle. It then becomes stage 1 via the first
          AssetMorph (which front-fades stage 0 out under its mask). With only one
          stage this is the whole component. */}
      <PopIn motion="settle" originX={centerX} originY={centerY}>
        {stages[0]}
      </PopIn>

      {/* Each consecutive transition is one AssetMorph (mode="morph") or a plain
          crossfade (mode="crossfade"), sharing the stage center so the form
          reshapes in place. Transition k carries stages[k-1] → stages[k] and
          COMPLETES at atFrame + k*step. */}
      {stages.slice(1).map((stageNode, idx) => {
        const k = idx + 1; // arriving-stage index (1..last)
        const completeLocal = transitionCompleteLocal(k);
        if (mode === "crossfade") {
          // Plain opacity dissolve over the `gap` window ending at completion.
          const winStart = completeLocal - gap;
          const t = interpolate(
            local,
            [winStart, completeLocal],
            [0, 1],
            { ...CLAMP, easing: EASE.balanced },
          );
          const arriveOpacity = interpolate(t, [0.25, 1], [0, 1], CLAMP);
          if (t <= 0) {
            return null;
          }
          return (
            <g key={k} opacity={arriveOpacity}>
              {stageNode}
            </g>
          );
        }
        return (
          <AssetMorph
            atFrame={atFrame + completeLocal}
            centerX={centerX}
            centerY={centerY}
            direction="bundle"
            durationInFrames={gap}
            from={stages[k - 1]}
            fxColor={fx}
            key={k}
            to={stageNode}
          />
        );
      })}

      {/* Per-stage captions under the shared center (kids-eye: caption below the
          art, never over it). Caller-localized; bakes no string. */}
      {stageLabels
        ? stages.map((_, k) => {
            const node = stageLabels[k];
            if (node === undefined || node === null) {
              return null;
            }
            const op = labelOpacityOf(k);
            if (op <= 0) {
              return null;
            }
            return (
              <g
                key={`lbl-${k}`}
                opacity={op}
                transform={`translate(${centerX} ${centerY + stageSize * LABEL_DROP})`}
              >
                <text
                  dominantBaseline="middle"
                  fill={ink}
                  fontFamily={fontFamily}
                  fontSize={36}
                  fontWeight={900}
                  textAnchor="middle"
                  x={0}
                  y={0}
                >
                  {node}
                </text>
              </g>
            );
          })
        : null}
    </g>
  );
};
