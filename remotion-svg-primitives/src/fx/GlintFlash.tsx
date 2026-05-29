import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

type GlintFlashProps = {
  x: number;
  y: number;
  startFrame: number;
  durationInFrames?: number;
  size?: number;
  color?: string;
};

/**
 * Single glint flash — a 4-point star that grows in, holds, fades out.
 * Use sparingly to spark on an event ("answer found", "match made"). For
 * a recurring sparkle, use <Sparkle> instead.
 *
 * Total envelope: scale 0 → 1 → 0 across durationInFrames; opacity 0 → 1 → 0.
 */
export const GlintFlash = ({
  x,
  y,
  startFrame,
  durationInFrames = 18,
  size = 24,
  color = colors.sunshine,
}: GlintFlashProps) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(progress, [0, 0.4, 1], [0, 1, 0]);
  const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  // 4-point star path centered at origin.
  const s = size;
  const t = size * 0.18;
  const d = `M 0 ${-s} L ${t} ${-t} L ${s} 0 L ${t} ${t} L 0 ${s} L ${-t} ${t} L ${-s} 0 L ${-t} ${-t} Z`;

  return (
    <g
      filter="url(#fx-glint)"
      opacity={opacity}
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <path d={d} fill={color} />
    </g>
  );
};
