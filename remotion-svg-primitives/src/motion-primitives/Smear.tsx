import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "./curves";

type SmearProps = {
  /** Start of motion (viewBox coords). */
  startX: number;
  startY: number;
  /** End of motion. */
  endX: number;
  endY: number;
  /** Motion window — Smear is visible only during this range. */
  startFrame: number;
  endFrame: number;
  /** Stroke / fill color. Defaults to currentColor. */
  color?: string;
  /** Thickness of the smear band. Default 12. */
  thickness?: number;
  /** Tail opacity (head is at full color, tail fades). Default 0.65. */
  opacity?: number;
};

/**
 * Motion-blur substitute. Renders a single arc-shape <path> connecting start
 * and end positions during a high-velocity window. Cheaper and more
 * stylistically faithful to 2D animation than CSS filter:blur(). Becker's
 * "smear frame" technique — see research/svg-animation-craft-round2-2026-05-27.md.
 *
 * The smear's geometry is a stadium-shaped path:
 *   M startX startY L endX endY L endX+perpX*t endY+perpY*t L startX+perpX*t startY+perpY*t Z
 * tail opacity is achieved via a linearGradient along the band.
 *
 * Render this in addition to the moving primitive — the primitive paints on
 * top of the smear at the head end.
 */
export const Smear = ({
  startX,
  startY,
  endX,
  endY,
  startFrame,
  endFrame,
  color = "currentColor",
  thickness = 12,
  opacity = 0.65,
}: SmearProps) => {
  const frame = useCurrentFrame();
  if (frame < startFrame || frame > endFrame) return null;
  const localProgress = (frame - startFrame) / Math.max(1, endFrame - startFrame);
  const envelopeOpacity =
    interpolate(localProgress, [0, 0.2, 0.8, 1], [0, opacity, opacity, 0], {
      easing: EASE.outCubic,
    });

  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.max(1, Math.hypot(dx, dy));
  const px = (-dy / len) * (thickness / 2);
  const py = (dx / len) * (thickness / 2);

  const d = `M ${startX + px} ${startY + py} L ${endX + px} ${endY + py} L ${endX - px} ${endY - py} L ${startX - px} ${startY - py} Z`;

  return <path d={d} fill={color} opacity={envelopeOpacity} />;
};
