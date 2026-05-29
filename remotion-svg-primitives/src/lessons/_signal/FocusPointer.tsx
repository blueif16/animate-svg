// Signaling primitive (Mayer signaling principle — see research/pedagogy-engagement.md).
//
// PEDAGOGY. "People learn better when cues highlight the essential material."
// For a 6-year-old, the cheapest such cue is a finger/arrow that appears at the
// focal element right as the narration about it begins, holds, then leaves. This
// is the reusable mechanism: each cue may declare ONE focal anchor; FocusPointer
// reveals a PointerHandArrow toward it ~6 frames after the cue's narration onset,
// holds, and fades before the cue ends.
//
// LESSON-AGNOSTIC. No lesson topic, copy, or absolute frame here. The anchor and
// cue window are passed in; every internal frame is CUE-RELATIVE (cueStartFrame /
// cueEndFrame + named offsets), honoring the ZERO-FRAME-LITERALS rule.
//
// COMPOSES, does not reinvent. Reuses <PointerHandArrow> from shape-primitives
// and EASE.* from motion-primitives. Lives under src/lessons/_signal (a leaf
// consumed by scenes) so it can import shape-primitives without creating the
// motion→shape import cycle.
//
// VERIFICATION. Tagged with measureProps(id) so the --measured gate can confirm
// the pointer doesn't cover a teaching element. A pointer is signaling chrome
// (zone "marks": marks∩objects is an allowed overlap), so it is intentionally
// NOT registered as a load-bearing manifest element.

import { interpolate } from "remotion";

import { EASE } from "../../motion-primitives";
import {
  PointerHandArrow,
  type PointerDirection,
  type PointerHandArrowVariant,
} from "../../shape-primitives";
import { measureProps } from "../_measure/measureHook";

// Cue-relative timing constants (named, not magic). All in frames @30fps.
const ONSET_OFFSET_FRAMES = 6; // appear ~0.2s after cue start ≈ narration onset
const REVEAL_FRAMES = 8; // ease-in glide toward the anchor
const FADE_FRAMES = 9; // ease-out before the cue ends (~0.3s)
const FADE_TAIL_FRAMES = 3; // gone this many frames before the hard cue end

// The per-cue declaration a lesson authors (the "focal element" of the cue).
export type FocusPointerSpec = {
  cueId: string;
  anchorX: number; // focal element centre, composition px
  anchorY: number;
  direction?: PointerDirection; // way the pointer points (default "down")
  variant?: PointerHandArrowVariant;
  onsetOffsetFrames?: number; // override the ~6-frame onset if a cue needs it
};

export type FocusPointerProps = FocusPointerSpec & {
  frame: number; // absolute current frame
  cueStartFrame: number;
  cueEndFrame: number;
  size?: number;
  gap?: number; // distance from the anchor to the pointer tip
  id?: string; // measureProps tag; defaults to focus-<cueId>
};

// Place the pointer body offset from the anchor, OPPOSITE the pointing
// direction, so the tip sits `gap` px from the focal element.
const placePointer = (
  direction: PointerDirection,
  anchorX: number,
  anchorY: number,
  offset: number,
): { x: number; y: number } => {
  switch (direction) {
    case "up":
      return { x: anchorX, y: anchorY + offset };
    case "left":
      return { x: anchorX + offset, y: anchorY };
    case "right":
      return { x: anchorX - offset, y: anchorY };
    case "down":
    default:
      return { x: anchorX, y: anchorY - offset };
  }
};

export const FocusPointer = ({
  cueId,
  anchorX,
  anchorY,
  direction = "down",
  variant = "hand",
  onsetOffsetFrames = ONSET_OFFSET_FRAMES,
  frame,
  cueStartFrame,
  cueEndFrame,
  size = 86,
  gap = 26,
  id,
}: FocusPointerProps) => {
  const onset = cueStartFrame + onsetOffsetFrames;
  const fadeEnd = cueEndFrame - FADE_TAIL_FRAMES;
  const fadeStart = fadeEnd - FADE_FRAMES;

  // Not on screen outside [onset, fadeEnd].
  if (frame < onset || frame >= fadeEnd) {
    return null;
  }

  // Reveal glide in (eased), hold at 1, ease out before cue end.
  const revealIn = interpolate(
    frame,
    [onset, onset + REVEAL_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.enter },
  );
  const fadeOut = interpolate(frame, [fadeStart, fadeEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const reveal = Math.min(revealIn, fadeOut);

  const { x, y } = placePointer(direction, anchorX, anchorY, gap + size / 2);

  return (
    <g {...measureProps(id ?? `focus-${cueId}`)} opacity={fadeOut}>
      <PointerHandArrow
        direction={direction}
        progress={reveal}
        size={size}
        variant={variant}
        x={x}
        y={y}
      />
    </g>
  );
};
