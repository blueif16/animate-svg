import { useCurrentFrame } from "remotion";
import { SparkleBurst } from "../motion-primitives/SparkleBurst";
import { colors } from "../theme";

type SparkleProps = {
  /** Anchor x/y in viewBox units. */
  x: number;
  y: number;
  /** Frames between sparkle emits. Default 36 (≈ 1.2s @ 30fps). */
  intervalFrames?: number;
  /** Frames per individual sparkle burst. Default 24. */
  burstFrames?: number;
  /** Sparkle radius. Default 64. */
  radius?: number;
  /** Sparkle count per burst. Default 8. */
  count?: number;
  /** Sparkle color. Default colors.reward. */
  color?: string;
  /** Active window start frame (absolute). Default 0. */
  startFrame?: number;
  /** Active window end frame (absolute, exclusive). Default Infinity. */
  endFrame?: number;
};

/**
 * Recurring sparkle emitter over a frame window. Wraps SparkleBurst with a
 * frame-modulo trigger. Deterministic — same frame → same sparkle.
 *
 * Use to add "magic" presence on a resting primitive without changing its
 * identity. See research brief §"Sparkle = animated turbulent-displace on a
 * glitter layer + card-wipe shards".
 */
export const Sparkle = ({
  x,
  y,
  intervalFrames = 36,
  burstFrames = 24,
  radius = 64,
  count = 8,
  color = colors.reward,
  startFrame = 0,
  endFrame = Number.POSITIVE_INFINITY,
}: SparkleProps) => {
  const frame = useCurrentFrame();
  if (frame < startFrame || frame >= endFrame) return null;
  const localFrame = frame - startFrame;
  const cycleStart = Math.floor(localFrame / intervalFrames) * intervalFrames;
  return (
    <SparkleBurst
      color={color}
      count={count}
      durationInFrames={burstFrames}
      radius={radius}
      startFrame={startFrame + cycleStart}
      x={x}
      y={y}
    />
  );
};
