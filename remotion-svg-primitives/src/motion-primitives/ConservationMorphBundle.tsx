import { ConservationBundle, type ThemeColor } from "../shape-primitives";
import { EASE } from "./curves";
import { AssetMorph } from "./AssetMorph";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type ConservationMorphBundleProps = {
  /**
   * Master frame at which the gather→bundle morph COMPLETES (the asset is fully
   * present here). The caller passes `cues[id].startFrame + offset` — never a
   * literal — exactly like {@link AssetMorph}'s `atFrame`.
   */
  morphAtFrame: number;
  /** FX-masked crossfade window for the morph, in frames. 6–14. Default 10. */
  morphDurationInFrames?: number;
  /**
   * The PARAMETRIC source the child has been reasoning about (e.g. a gathered
   * `<StickGroup layout="bundle">`). It animates under the caller's control up
   * to `morphAtFrame`; the component only owns the masked swap into the asset.
   */
  from: React.ReactNode;
  /**
   * The fixed-form asset the `from` BECOMES and is held as (e.g.
   * `<IconAsset name="stick-bundle-roped" .../>`). Caller sizes it so its
   * visible bundle ≈ the gathered `from`'s bbox at `centerX`/`centerY`.
   */
  asset: React.ReactNode;
  /** Shared visual center of `from`, `asset`, and the peek, in local units. */
  centerX?: number;
  centerY?: number;
  /**
   * The conservation PEEK, driven 0..1 by the caller from the "ten ones are
   * still inside" cue. 0 = solid held asset; as it rises the asset crossfades
   * down and a {@link ConservationBundle} x-ray rises in its place, ghosting the
   * wrap and revealing the `count` inner ones; bring it back to 0 to re-solidify
   * the asset. The component owns BOTH the asset↔peek crossfade AND the x-ray
   * reveal — the caller supplies only the 0..1 progress.
   */
  peekProgress?: number;
  /** Inner-ones count revealed by the peek. Default 10 (one ten). */
  count?: number;
  /** Peek wrap-band color (ConservationBundle `color`). */
  peekColor?: ThemeColor;
  /** Peek inner-stick color. */
  peekStickColor?: ThemeColor;
  /** Peek inner-stick length / thickness — match the source units so the peek's
   *  ones read as the same ones that bundled. */
  peekStickLength?: number;
  peekStickThickness?: number;
  /** Highlight the revealed inner ones (ConservationBundle `highlightInside`). */
  peekHighlightInside?: boolean;
  /** Fire AssetMorph's built-in SparkleBurst over the swap. Default `true`. Set
   *  `false` when the composer fires its own FX at the same frame. */
  fx?: boolean;
  fxColor?: string;
  fxRadius?: number;
};

/**
 * ConservationMorphBundle — the "ten ones → one roped ten, that still IS ten
 * ones" beat as ONE self-contained, registered teaching unit.
 *
 * It composes three registered capabilities into a single frame-driven move:
 *   1. {@link AssetMorph} (`direction="bundle"`) FX-masks the gathered parametric
 *      `from` becoming the held `asset` — the magic transition.
 *   2. The `asset` is held after the morph (its silhouette is the new unit).
 *   3. {@link ConservationBundle} provides the conservation x-ray: as
 *      `peekProgress` rises the held asset crossfades down and the bundle
 *      ghosts to reveal the `count` ones living inside — defusing "a ten is just
 *      one thing now" — then re-solidifies as `peekProgress` falls.
 *
 * Why a component and not scene math: the asset↔peek crossfade (and its pairing
 * with the AssetMorph swap) is reusable craft — hand-rolling that opacity blend
 * in a lesson scene would be inlining a special component. It is owned here once.
 *
 * Lesson-agnostic + prop-driven: it bakes no topic, value, or Chinese string —
 * `from`, `asset`, `count`, colors, and sizing all come from props, and every
 * frame is the caller's `morphAtFrame` / `peekProgress` (cue-relative). ZERO
 * frame literals, ZERO raw motion literals — the only curve is named `EASE.*`.
 */
export const ConservationMorphBundle: React.FC<ConservationMorphBundleProps> = ({
  morphAtFrame,
  morphDurationInFrames = 10,
  from,
  asset,
  centerX = 0,
  centerY = 0,
  peekProgress = 0,
  count = 10,
  peekColor,
  peekStickColor,
  peekStickLength,
  peekStickThickness,
  peekHighlightInside = false,
  fx = true,
  fxColor,
  fxRadius,
}) => {
  // The peek's x-ray reveal is eased so the ones fade in like a curtain lifting,
  // not a linear dissolve. The asset crossfades against the SAME eased curve so
  // the held bundle and the x-ray never both read as solid at once.
  const peek = EASE.outCubic(clamp01(peekProgress));

  // Before the peek opens, the asset is whatever AssetMorph renders (sticks pre
  // morph, bundle post). Once the peek opens we fade the held asset down to let
  // the x-ray show through. AssetMorph already owns the pre-morph crossfade, so
  // we only attenuate AFTER the morph has completed.
  const heldAssetOpacity = 1 - peek;

  return (
    <g>
      <g opacity={heldAssetOpacity}>
        <AssetMorph
          atFrame={morphAtFrame}
          centerX={centerX}
          centerY={centerY}
          direction="bundle"
          durationInFrames={morphDurationInFrames}
          from={from}
          fx={fx}
          fxColor={fxColor}
          fxRadius={fxRadius}
          to={asset}
        />
      </g>
      {peek > 0 ? (
        <g opacity={peek} transform={`translate(${centerX} ${centerY})`}>
          <ConservationBundle
            color={peekColor}
            count={count}
            highlightInside={peekHighlightInside}
            stickColor={peekStickColor}
            stickLength={peekStickLength}
            stickThickness={peekStickThickness}
            xrayProgress={peek}
          />
        </g>
      ) : null}
    </g>
  );
};
