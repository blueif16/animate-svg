import type { ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING } from "./curves";

export type PopMotion = "snap" | "bouncy" | "settle";

type PopInProps = {
  children: ReactNode;
  delay?: number;
  motion?: PopMotion;
  originX?: number;
  originY?: number;
  scaleFrom?: number;
  transform?: string;
};

// "snap" keeps PopIn's legacy spring (damping:12) so existing lessons stay
// pixel-identical. "bouncy" pairs SPRING.snappy with a three-stop anticipation
// curve (0.9 → 1.06 → 1.0) — reach for it on accent moments only. "settle" is
// the slow, no-bounce variant for calmer reveals.
const LEGACY_SNAP_CONFIG = { damping: 12, mass: 0.55, stiffness: 170 };

export const PopIn: React.FC<PopInProps> = ({
  children,
  delay = 0,
  motion = "snap",
  originX = 0,
  originY = 0,
  scaleFrom = 0.72,
  transform,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - delay;
  const springConfig =
    motion === "bouncy"
      ? SPRING.snappy
      : motion === "settle"
        ? SPRING.smooth
        : LEGACY_SNAP_CONFIG;
  const entrance = spring({
    fps,
    frame: localFrame,
    config: springConfig,
  });
  const scale =
    motion === "bouncy"
      ? interpolate(entrance, [0, 0.5, 0.8, 1], [scaleFrom, 0.9, 1.06, 1])
      : interpolate(entrance, [0, 1], [scaleFrom, 1]);
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
