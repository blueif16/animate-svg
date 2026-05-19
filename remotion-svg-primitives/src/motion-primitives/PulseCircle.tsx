import { useCurrentFrame } from "remotion";
import { colors } from "../theme";

type PulseCircleProps = {
  cx: number;
  cy: number;
  radius: number;
  color?: string;
  startFrame?: number;
  durationInFrames?: number;
  repeatCount?: number;
  spread?: number;
};

export const PulseCircle: React.FC<PulseCircleProps> = ({
  cx,
  cy,
  radius,
  color = colors.coral,
  startFrame = 0,
  durationInFrames = 34,
  repeatCount = 2,
  spread = 34,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const active =
    localFrame >= 0 && localFrame <= durationInFrames * repeatCount;
  const cycleFrame = active ? localFrame % durationInFrames : 0;
  const progress = cycleFrame / durationInFrames;
  const pulseRadius = radius + progress * spread;
  const opacity = active ? (1 - progress) * 0.72 : 0;

  return (
    <circle
      cx={cx}
      cy={cy}
      fill="none"
      opacity={opacity}
      r={pulseRadius}
      stroke={color}
      strokeWidth={6}
    />
  );
};
