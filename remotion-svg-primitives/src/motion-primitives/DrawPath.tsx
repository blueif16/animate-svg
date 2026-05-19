import type { SVGProps } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

type DrawPathProps = Omit<
  SVGProps<SVGPathElement>,
  "d" | "pathLength" | "strokeDasharray" | "strokeDashoffset"
> & {
  d: string;
  startFrame?: number;
  durationInFrames?: number;
  progress?: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const DrawPath: React.FC<DrawPathProps> = ({
  d,
  startFrame = 0,
  durationInFrames = 60,
  progress,
  fill = "none",
  stroke = colors.textNavy,
  strokeLinecap = "round",
  strokeLinejoin = "round",
  ...pathProps
}) => {
  const frame = useCurrentFrame();
  const reveal =
    progress ??
    interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <path
      d={d}
      fill={fill}
      pathLength={1}
      stroke={stroke}
      strokeDasharray={1}
      strokeDashoffset={1 - clamp01(reveal)}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      {...pathProps}
    />
  );
};
