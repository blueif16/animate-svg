import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";
import { SparkleBurst } from "./SparkleBurst";

export type AssetMorphDirection = "bundle" | "unbundle";

export type AssetMorphProps = {
  /**
   * Master frame at which the swap COMPLETES (`direction="bundle"`) or BEGINS
   * (`direction="unbundle"`). The composer passes `cues[id].startFrame + offset`
   * — never a literal. The crossfade + FX mask occupy a window of
   * `durationInFrames` frames ending at (bundle) or starting at (unbundle) this
   * frame.
   */
  atFrame: number;
  /** Crossfade + FX-mask window length in frames. 6–12 typical. Default 10. */
  durationInFrames?: number;
  /**
   * `"bundle"`: the parametric `from` becomes the asset `to` (e.g. ten sticks →
   * one roped bundle). `"unbundle"`: reverse — the asset `to` becomes the
   * parametric `from` (one bundle → ten sticks fanning out).
   */
  direction?: AssetMorphDirection;
  /**
   * The shared visual center of `from` and `to`, in the local coordinate
   * system. The FX burst fires here and the arriving element's settle scales
   * about it. The caller MUST position `from` and `to` so their visual centers
   * coincide at this point — that bbox/position match is what makes the swap
   * read as identity-preserving ("the sticks BECAME the bundle"), not a cut.
   */
  centerX?: number;
  centerY?: number;
  /** The parametric source node (e.g. `<StickGroup layout="bundle" .../>`). */
  from: React.ReactNode;
  /** The asset target node (e.g. `<IconAsset name="stick-bundle-roped" .../>`). */
  to: React.ReactNode;
  /**
   * Fire the built-in `<SparkleBurst>` mask over the swap. Default `true`.
   * Set `false` when the composer fires its own FX from `audio-cues.json` at
   * the same frame and a second burst would double up.
   */
  fx?: boolean;
  fxColor?: string;
  fxRadius?: number;
  fxCount?: number;
  /**
   * Tiny anticipation→overshoot→rest scale on the ARRIVING element so it lands
   * like a pop, not a fade. Default `true`. Scales about (centerX, centerY).
   */
  settle?: boolean;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * AssetMorph — a frame-driven, FX-masked crossfade between a PARAMETRIC source
 * and a generated ASSET, so a thing the child has been reasoning about
 * transforms into its fixed-form illustrated counterpart (and back) without a
 * visible cut.
 *
 * The teaching mechanics stay parametric: `from` animates under the caller's
 * control (sticks gather, fan, count). At the morph instant this component
 * front-fades `from` out, back-fades `to` in over a brief overlap, and fires a
 * `<SparkleBurst>` whose peak masks the overlap — the eye reads continuity. The
 * arriving element gets a small settle so it "lands". Everything is keyed off
 * `useCurrentFrame()`, so the same composition frame renders identically.
 *
 * Lesson-agnostic: it knows nothing of sticks or bundles — the caller supplies
 * both nodes and the shared center. The canonical use is ten ones → one ten
 * (see CAPABILITIES.md#asset-morph for the gather→morph→hold→unbundle recipe).
 */
export const AssetMorph: React.FC<AssetMorphProps> = ({
  atFrame,
  durationInFrames = 10,
  direction = "bundle",
  centerX = 0,
  centerY = 0,
  from,
  to,
  fx = true,
  fxColor = colors.reward,
  fxRadius = 120,
  fxCount = 12,
  settle = true,
}) => {
  const frame = useCurrentFrame();
  const D = Math.max(1, durationInFrames);

  // bundle: the window ENDS at atFrame (asset fully present there).
  // unbundle: the window STARTS at atFrame (asset begins dissolving there).
  const windowStart = direction === "bundle" ? atFrame - D : atFrame;
  const t = interpolate(frame, [windowStart, windowStart + D], [0, 1], CLAMP);

  // Departing element clears in the first ~45%; arriving element fades in from
  // ~35%. The ~10% overlap is hidden under the FX burst.
  const departOpacity = interpolate(t, [0, 0.45], [1, 0], CLAMP);
  const arriveOpacity = interpolate(t, [0.35, 1], [0, 1], CLAMP);
  const arriveScale = settle
    ? interpolate(t, [0.35, 0.72, 1], [0.86, 1.06, 1], CLAMP)
    : 1;
  const settleTransform = `translate(${centerX} ${centerY}) scale(${arriveScale}) translate(${-centerX} ${-centerY})`;

  const fromIsArriving = direction === "unbundle";
  const fromOpacity = fromIsArriving ? arriveOpacity : departOpacity;
  const toOpacity = fromIsArriving ? departOpacity : arriveOpacity;

  // FX rises as the departing element clears and lingers a touch past the swap.
  const fxStart = windowStart + D * 0.3;
  const fxDuration = Math.round(D * 1.6);

  return (
    <g>
      <g
        opacity={fromOpacity}
        transform={fromIsArriving && settle ? settleTransform : undefined}
      >
        {from}
      </g>
      <g
        opacity={toOpacity}
        transform={!fromIsArriving && settle ? settleTransform : undefined}
      >
        {to}
      </g>
      {fx ? (
        <SparkleBurst
          color={fxColor}
          count={fxCount}
          durationInFrames={fxDuration}
          radius={fxRadius}
          startFrame={fxStart}
          x={centerX}
          y={centerY}
        />
      ) : null}
    </g>
  );
};
