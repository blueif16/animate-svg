// kptestCompareMoreFewerLessonTimeline — the ONE shared cue timeline (v4 cue-anchored).
//
// W3.5 reconcile: the cue is the unit of coordination. Each cue's window is
//   cueFrames = max(narrationFrames + gapFrames, round(visualMotionSeconds*fps)) + tail
// computed mechanically by the kit `reconcileClipTimeline` over the MEASURED per-cue
// clips (`kptestCompareMoreFewerClips` — the audio truth) and the per-cue motion
// budgets read from lesson-data/kptest-compare-more-fewer/visual-design.md.
//
// Audio (per-cue clips), visuals, and captions all read THIS file. There is NO
// continuous WAV, NO PADDED_CUE_DURATIONS_FRAMES, NO Silences import, NO ASR
// boundary correction. Each cue owns its measured clip mounted in its own
// <Sequence from={fromFrame}>; the rest of the window is FREE silence (motion hold
// and/or the cue's typed gap). The brief Length is a HINT only — the true length is
// sum(cueFrames) and drift is accepted.

import {
  reconcileClipTimeline,
  type PlacedCue,
  type VisualBudgetMap,
  type VoiceClip,
} from "@studio/narration-kit";

import { kptestCompareMoreFewerClips } from "./generated/kptestCompareMoreFewerClips";

export const kptestCompareMoreFewerFps = 30;

// Per-cue visualMotionSeconds — the MINIMUM motion time for each beat, read
// VERBATIM from visual-design.md §"Per-cue motion budget". Intent only; the
// reconcile takes max(this, narration+gap) per cue.
const visualBudgets: VisualBudgetMap = {
  intro: 2.5,
  "two-groups": 4.0,
  match: 5.5,
  "more-direction": 5.5,
  "echo-more": 5.5,
  "more-replay": 5.5,
  "fewer-direction": 7.0,
  "echo-fewer": 5.5,
  "fewer-replay": 5.5,
  "not-by-size": 6.0,
  recap: 7.0,
};

const reconciled = reconcileClipTimeline({
  clips: kptestCompareMoreFewerClips,
  visualBudgets,
  fps: kptestCompareMoreFewerFps,
});

// The reconciled per-cue windows (startFrame/endFrame + narration/hold sub-windows).
// Audio, visuals, and captions all read these — the single shared timeline.
export const kptestCompareMoreFewerCues: PlacedCue[] = reconciled.cues;

// Per-cue voice placements: the AudioLayer mounts ONE <Sequence from={fromFrame}>
// per clip (no continuous WAV — a clip can never cross a cue boundary).
export const kptestCompareMoreFewerVoiceClips: VoiceClip[] =
  reconciled.voiceClips;

// Total composition length = last cue's endFrame. Emergent — not the brief HINT.
export const kptestCompareMoreFewerDurationFrames: number =
  reconciled.durationFrames;
