// W3.5 cue-timeline reconcile — THE single shared, deterministic timeline for
// kptest-count-three. Each cue's window = max(narrationFrames+gapFrames,
// round(visualMotionSeconds*fps)) + tailFrames, chained end-to-end. The clip
// plays at the cue START for narrationFrames; the rest of the window is FREE
// silence (a motion hold and/or a typed gap). No padded-cue-duration table,
// no continuous WAV, no silence-detection snapping, no ASR correction spans.
//
// Audio truth = ./generated/kptestCountThreeClips (frozen, do-not-edit; no
// typed `gap` on any ClipCue here → all gapFrames are 0). Visual budget =
// lesson-data/kptest-count-three/visual-design.md "Per-cue motion budget".

import {
  cueToCaption,
  reconcileClipTimeline,
  type CaptionCue,
  type VoiceClip,
} from "@studio/narration-kit";
import { kptestCountThreeClips } from "./generated/kptestCountThreeClips";
import { makeCueAccessors } from "./_cues/cueAccessors";

const FPS = 30;
const TAIL_FRAMES = 9;

// visualMotionSeconds per cue, ONE entry per frozen clip id (the audio truth),
// from visual-design §"Per-cue motion budget". No W2b beat folded into a typed
// gap on a carrying cue, so every clip id gets an entry.
const VISUAL_MOTION_SECONDS = {
  "topic-intro": 3.5,
  "count-climb": 13.5,
  cardinality: 6.5,
} as const;

export type KptestCountThreeCueId = keyof typeof VISUAL_MOTION_SECONDS;

export const KPTEST_COUNT_THREE_CUE_IDS = Object.keys(
  VISUAL_MOTION_SECONDS,
) as KptestCountThreeCueId[];

// Every budget key MUST be a frozen clip id (the clips are the audio truth); a
// typo/stale id here THROWS at import. The other direction (every clip has a
// budget) is enforced by reconcileClipTimeline throwing on an unbudgeted clip.
const FROZEN_CLIP_IDS = new Set(kptestCountThreeClips.map((c) => c.id));
for (const id of KPTEST_COUNT_THREE_CUE_IDS) {
  if (!FROZEN_CLIP_IDS.has(id)) {
    throw new Error("VISUAL_MOTION_SECONDS id not a frozen cue id: " + id);
  }
}

const reconciled = reconcileClipTimeline({
  clips: kptestCountThreeClips,
  visualBudgets: VISUAL_MOTION_SECONDS,
  fps: FPS,
  tailFrames: TAIL_FRAMES,
});

export const kptestCountThreeCues = reconciled.cues;
export const kptestCountThreeDuration: number = reconciled.durationFrames;
export const kptestCountThreeVoiceClips: VoiceClip[] = reconciled.voiceClips;
export const kptestCountThreeLessonCaptionCues: CaptionCue[] =
  reconciled.cues.map(cueToCaption);
export const kptestCountThreeCueAccessors = makeCueAccessors(
  reconciled.cues,
  KPTEST_COUNT_THREE_CUE_IDS,
);
