// kptest-fenyuhe-six — reconciled cue timeline (Wave 3.5, v4 cue-anchored audio).
//
// THE CUE IS THE UNIT OF COORDINATION — and in v4 that holds for AUDIO too.
// Each cue owns a MEASURED audio clip anchored to its own window; the
// reconcile chains them via the kit's `reconcileClipTimeline`:
//
//   cueFrames = max(narrationFrames + gapFrames, motionFrames) + tailFrames
//
// The clip plays at the cue START for `narrationFrames`; the rest of the
// window is FREE silence (a motion hold and/or a typed `gap`). No
// continuous-WAV span, no detect-silences step, no PADDED_CUE_DURATIONS_FRAMES.
// Audio, visuals, and captions all read THIS module.

import {
  cueToCaption,
  reconcileClipTimeline,
  type CaptionCue,
  type VoiceClip,
} from "@studio/narration-kit";

import { kptestFenyuheSixClips } from "./generated/kptestFenyuheSixClips";

const FPS = 30;
const TAIL_FRAMES = 9;

// Per-cue visual motion budget (seconds) from
// lesson-data/kptest-fenyuhe-six/visual-design.md §5 "Per-cue motion budget".
// Keys MUST match the CLIP MODULE cue ids (the 6 cues with WAVs). The three
// echo beats (echo-1-and-5 / echo-2-and-4 / echo-3-and-3) were folded by W2b
// into typed gaps on the carrying split cues (per the v4 brief) — their
// dwell lives in those cues' `gapFrames`, NOT in a separate visual budget row.
const VISUAL_MOTION_SECONDS: Record<string, number> = {
  "routine-reprise": 3.3,
  "split-1-and-5": 5.0,
  "split-2-and-4": 5.0,
  "split-3-and-3": 6.0,
  "aggregator-prompt": 6.5,
  "recap": 10.0,
};

const reconciled = reconcileClipTimeline({
  clips: kptestFenyuheSixClips,
  visualBudgets: VISUAL_MOTION_SECONDS,
  fps: FPS,
  tailFrames: TAIL_FRAMES,
});

// Reconciled cue list — the single source of truth for visuals, captions, audio.
export const kptestFenyuheSixCues = reconciled.cues;

// Total composition length = the last reconciled cue's endFrame.
export const kptestFenyuheSixDuration: number = reconciled.durationFrames;

// Per-cue voice clips, each anchored to its cue window. Consumed by
// LessonAudioLayer (one Sequence per clip) and to derive the bed-duck windows.
export const kptestFenyuheSixVoiceClips: VoiceClip[] = reconciled.voiceClips;

// Caption cues derived from the SAME reconciled windows — captions cannot drift
// from visuals because they read this timeline.
export const kptestFenyuheSixLessonCaptionCues: CaptionCue[] =
  reconciled.cues.map(cueToCaption);
