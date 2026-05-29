import { Easing } from "remotion";

// Named bezier curves for interpolate({ easing }). Single source of truth for
// entrance/exit/balanced/overshoot motion across all lessons.
export const EASE = {
  // Soft enter for reveals and slide-ins. Default for most appearances.
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  // Balanced both-sides curve for value mappings (e.g. scale 0→1→0).
  balanced: Easing.bezier(0.45, 0, 0.55, 1),
  // Overshoot for snap accents — bounces past 1.0 before settling.
  overshoot: Easing.bezier(0.34, 1.56, 0.64, 1),
  // Smooth cubic out for value sweeps without overshoot.
  outCubic: Easing.bezier(0.33, 1, 0.68, 1),
  // Sharper out-quint for tight, fast-settling moves.
  outQuint: Easing.bezier(0.22, 1, 0.36, 1),
  // Symmetric in-out cubic for back-and-forth value sweeps.
  inOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

export type EaseName = keyof typeof EASE;

// Named spring() configs. Pick by feel:
//   snappy — default appearance spring. Tight, no visible overshoot.
//   bouncy — for accent moments only (countable spawn, reveal of new concept).
//   smooth — slow, settles without bounce. Use for camera-like moves.
export const SPRING = {
  snappy: { damping: 14, mass: 0.55, stiffness: 180 },
  bouncy: { damping: 8, mass: 0.55, stiffness: 180 },
  smooth: { damping: 20, mass: 0.55, stiffness: 200 },
} as const;

export type SpringName = keyof typeof SPRING;
