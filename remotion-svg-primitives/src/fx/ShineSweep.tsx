import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../motion-primitives/curves";

type ShineSweepProps = {
  /** Bounding box of the target — sweep is clipped to this. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Sweep cycle start frame (absolute). */
  startFrame: number;
  /** Total cycle duration (frames). One sweep per cycle. Default 60. */
  durationInFrames?: number;
  /** Tilt of the sweep band, degrees. Default -22 (top-right to bottom-left). */
  angleDeg?: number;
  /** Sweep band width as fraction of target width. Default 0.3. */
  bandWidth?: number;
};

/**
 * White diagonal shine sweep clipped to a rectangular target. Composes via
 * mix-blend-mode "screen" on the SVG <g>. References fx-shine-gradient from
 * <FXDefs>. See research brief §"Cinematic shine sweep" (SonduckFilm).
 *
 * Opacity envelope: 0 → 0.6 → 0 across the cycle; gradient offset slides
 * 0% → 120% so the shine exits past the target before resetting.
 */
export const ShineSweep = ({
  x,
  y,
  width,
  height,
  startFrame,
  durationInFrames = 60,
  angleDeg = -22,
  bandWidth = 0.3,
}: ShineSweepProps) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = interpolate(progress, [0, 0.25, 0.75, 1], [0, 0.6, 0.6, 0], {
    easing: EASE.outCubic,
  });
  const offsetPct = interpolate(progress, [0, 1], [-20, 120]);
  const bandPx = width * bandWidth;

  return (
    <g opacity={opacity} style={{ mixBlendMode: "screen" }}>
      <g transform={`translate(${x + width / 2} ${y + height / 2}) rotate(${angleDeg}) translate(${-(x + width / 2)} ${-(y + height / 2)})`}>
        <rect
          fill="url(#fx-shine-gradient)"
          height={height * 1.5}
          width={bandPx}
          x={x + (width * (offsetPct / 100))}
          y={y - height * 0.25}
        />
      </g>
    </g>
  );
};
