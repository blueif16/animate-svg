import type { ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type PopInProps = {
  children: ReactNode;
  delay?: number;
  originX?: number;
  originY?: number;
  scaleFrom?: number;
  transform?: string;
};

export const PopIn: React.FC<PopInProps> = ({
  children,
  delay = 0,
  originX = 0,
  originY = 0,
  scaleFrom = 0.72,
  transform,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - delay;
  const entrance = spring({
    fps,
    frame: localFrame,
    config: {
      damping: 12,
      stiffness: 170,
      mass: 0.55,
    },
  });
  const scale = interpolate(entrance, [0, 1], [scaleFrom, 1]);
  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const baseTransform = `translate(${originX} ${originY}) scale(${scale}) translate(${-originX} ${-originY})`;

  return (
    <g
      opacity={opacity}
      transform={`${baseTransform}${transform ? ` ${transform}` : ""}`}
    >
      {children}
    </g>
  );
};
