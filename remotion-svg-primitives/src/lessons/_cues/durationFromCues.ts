// durationFromCues — a lesson's composition length is a PURE FUNCTION of its
// reconciled cues array: the last cue's endFrame (cues chain end-to-end from
// frame 0, so this equals the kit's reconciled.durationFrames). Wired through
// Remotion `calculateMetadata` (see _lessonRegistry.generated.tsx) so a stale
// duration constant can never diverge from the timeline the scene actually reads.
//
// PURE: no fs / network / Date.now. Lesson-agnostic.

import type { AlignedLessonCue } from "@studio/narration-kit";

export const durationFromCues = (
  cues: readonly AlignedLessonCue[],
): number => (cues.length > 0 ? cues[cues.length - 1].endFrame : 0);
