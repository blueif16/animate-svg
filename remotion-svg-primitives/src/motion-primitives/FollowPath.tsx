import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { FollowPathSpec } from "./pathMath";
import { getSampledPoint } from "./pathMath";

type FollowPathProps = {
  path: FollowPathSpec;
  children: ReactNode;
  startFrame?: number;
  durationInFrames?: number;
  progress?: number;
  rotateToPath?: boolean;
  offsetX?: number;
  offsetY?: number;
};

export const FollowPath: React.FC<FollowPathProps> = ({
  path,
  children,
  startFrame = 0,
  durationInFrames = 80,
  progress,
  rotateToPath = true,
  offsetX = 0,
  offsetY = 0,
}) => {
  const frame = useCurrentFrame();
  const pathProgress =
    progress ??
    interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const { point, angle } = getSampledPoint(path, pathProgress);
  const rotation = rotateToPath ? ` rotate(${angle})` : "";

  return (
    <g
      transform={`translate(${point.x + offsetX} ${point.y + offsetY})${rotation}`}
    >
      {children}
    </g>
  );
};
