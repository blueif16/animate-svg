// W3.5 reconciled lesson timeline for kptest-count-to-two.
// v4 cue-anchored audio: each cue owns its measured clip + typed timeline
// hold; there is no continuous WAV and no detect-silences step.
//
// Window = max(narrationFrames + gapFrames, round(visualMotionSeconds*fps)) + tailFrames.
// Chain end-to-end from frame 0; the composer reads THIS module for cues +
// voice-clip placements + caption cues.

import {
  cueToCaption,
  reconcileClipTimeline,
  type CaptionCue,
  type VoiceClip,
} from "@studio/narration-kit";
import { kptestCountToTwoClips } from "./generated/kptestCountToTwoClips";

const FPS = 30;
const TAIL_FRAMES = 9;

// One entry per cue id in kptestCountToTwoClips, seconds from visual-design.md §5.
// No design row was folded into a typed gap (ClipCue carries no `gap`), so every
// cue gets its own visualMotionSeconds.
const VISUAL_MOTION_SECONDS: Record<string, number> = {
  "lesson-intro": 2.0,
  "first-apple-one": 2.5,
  "second-apple-two": 3.0,
  cardinality: 3.5,
};

const reconciled = reconcileClipTimeline({
  clips: kptestCountToTwoClips,
  visualBudgets: VISUAL_MOTION_SECONDS,
  fps: FPS,
  tailFrames: TAIL_FRAMES,
});

export const kptestCountToTwoCues = reconciled.cues;
export const kptestCountToTwoDuration: number = reconciled.durationFrames;
export const kptestCountToTwoVoiceClips: VoiceClip[] = reconciled.voiceClips;
export const kptestCountToTwoLessonCaptionCues: CaptionCue[] =
  reconciled.cues.map(cueToCaption);