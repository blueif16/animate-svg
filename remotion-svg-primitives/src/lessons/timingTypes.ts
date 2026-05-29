// Re-export from @studio/narration-kit so existing lessons keep the
// `./timingTypes` import path. New code can import from the kit directly.
export type {
  AlignedLessonCue,
  AlignmentConfidence,
  CaptionCue,
} from "@studio/narration-kit";

export { cueToCaption, cueMap } from "@studio/narration-kit";
