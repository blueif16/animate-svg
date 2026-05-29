import { interpolate, useCurrentFrame } from "remotion";

type GlowPulseProps = {
  /** Bounding box of target — used for opt-in opacity envelope only; filter applies via consumer's filter prop. */
  startFrame: number;
  durationInFrames?: number;
  /** Number of pulses across the duration. Default 1. */
  pulses?: number;
  children: React.ReactNode;
};

/**
 * Wraps children in a group that pulses via filter="url(#fx-glow-pulse)"
 * with an opacity envelope. The glow filter itself is static; the pulse is
 * delivered by opacity modulation.
 *
 * Children render normally; the glow is rendered as a sibling pre-pass via
 * `filter` on the wrapper group. Existing children render on top.
 */
export const GlowPulse = ({
  startFrame,
  durationInFrames = 36,
  pulses = 1,
  children,
}: GlowPulseProps) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const cycle = durationInFrames / pulses;
  const phase = ((localFrame % cycle) / cycle); // 0..1
  const opacity = interpolate(phase, [0, 0.5, 1], [0, 0.55, 0]);

  return (
    <>
      <g filter="url(#fx-glow-pulse)" opacity={opacity}>
        {children}
      </g>
      {children}
    </>
  );
};
