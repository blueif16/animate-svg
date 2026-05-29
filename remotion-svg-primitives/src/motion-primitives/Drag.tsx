import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type DragProps = {
  /** Frames to stagger each successive child by. Default 3. */
  staggerFrames?: number;
  /**
   * Overshoot graduation: tip-child gets `tipOvershootMultiplier`× the root
   * child's overshoot. Pass-through prop name customizable via `overshootProp`.
   */
  tipOvershootMultiplier?: number;
  /** Name of the prop on children to add stagger to. Default "startFrame". */
  delayProp?: string;
  /** Optional: name of the prop on children that controls overshoot amplitude. */
  overshootProp?: string;
  children: ReactNode;
};

/**
 * Frank-and-Ollie appendage drag helper. Takes an ordered chain of children
 * (root → tip) and stagger-shifts their `startFrame` prop by `staggerFrames`
 * each, optionally graduating overshoot amplitude root → tip.
 *
 * Caller passes children that accept the named delay prop (default `startFrame`).
 * Drag clones each with `delayProp += staggerFrames * index`.
 *
 * If an overshootProp is supplied AND the child has a numeric value for it,
 * the value scales linearly from 1.0× at root to `tipOvershootMultiplier`× at tip.
 *
 * See research/svg-animation-craft-round2-2026-05-27.md §"Appendage drag".
 */
export const Drag = ({
  staggerFrames = 3,
  tipOvershootMultiplier = 1.12,
  delayProp = "startFrame",
  overshootProp,
  children,
}: DragProps) => {
  const arr = Children.toArray(children);
  const n = arr.length;
  return (
    <>
      {arr.map((child, i) => {
        if (!isValidElement(child)) return child;
        const baseDelay = (child.props as Record<string, unknown>)[delayProp];
        const nextDelay =
          typeof baseDelay === "number" ? baseDelay + staggerFrames * i : staggerFrames * i;
        const overrides: Record<string, unknown> = { [delayProp]: nextDelay };
        if (overshootProp) {
          const baseOver = (child.props as Record<string, unknown>)[overshootProp];
          if (typeof baseOver === "number") {
            const tipFrac = n > 1 ? i / (n - 1) : 0;
            const mult = 1 + (tipOvershootMultiplier - 1) * tipFrac;
            overrides[overshootProp] = baseOver * mult;
          }
        }
        return cloneElement(child as ReactElement, overrides);
      })}
    </>
  );
};
