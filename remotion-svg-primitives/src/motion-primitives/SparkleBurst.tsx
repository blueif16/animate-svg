import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

type SparkleBurstProps = {
  x: number;
  y: number;
  startFrame?: number;
  durationInFrames?: number;
  color?: string;
  count?: number;
  radius?: number;
};

const starPath = (outerRadius: number, innerRadius: number) => {
  const points = Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;

    return `${Math.cos(angle) * radius},${Math.sin(angle) * radius}`;
  });

  return `M ${points.join(" L ")} Z`;
};

export const SparkleBurst: React.FC<SparkleBurstProps> = ({
  x,
  y,
  startFrame = 0,
  durationInFrames = 36,
  color = colors.reward,
  count = 10,
  radius = 92,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const opacity = interpolate(progress, [0, 0.25, 1], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const burstRadius = interpolate(progress, [0, 1], [10, radius], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g opacity={opacity}>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
        const distance = burstRadius * (0.78 + (index % 3) * 0.11);
        const size = 9 + (index % 3) * 3;
        const sparkleX = x + Math.cos(angle) * distance;
        const sparkleY = y + Math.sin(angle) * distance;

        return (
          <path
            d={starPath(size, size * 0.42)}
            fill={index % 2 === 0 ? color : colors.sunshine}
            key={index}
            stroke={colors.textNavy}
            strokeLinejoin="round"
            strokeWidth={2}
            transform={`translate(${sparkleX} ${sparkleY}) rotate(${index * 21})`}
          />
        );
      })}
    </g>
  );
};
