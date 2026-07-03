// W3.5 reconciled lesson timeline for kptest-count-to-two.
// v4 cue-anchored audio: each cue owns its measured clip + typed timeline
// hold; there is no continuous WAV and no detect-silences step.
//
// Window = max(narrationFrames + gapFrames, round(visualMotionSeconds*fps)) + tailFrames.
// Chain end-to-end from frame 0; the composer reads THIS module for cues +
// voice-clip placements + caption cues.
//
// CUE-ID TRUTH (self-scan C2): the ONE cue-id vocabulary is the frozen AUDIO
// truth kptestCountToTwoClips (announce-topic / cue-1-count / cue-2-cardinality).
// The composer previously invented a 4-id vocabulary (lesson-intro /
// first-apple-one / second-apple-two / cardinality) that did not exist in the
// audio, so reconcile threw at import. VISUAL_MOTION_SECONDS below is keyed to
// the frozen ids (values from visual-design.md §"per-cue motion budget"); the
// budget map is the ONE place this lesson's cue-id union is declared, and it is
// cross-checked against the frozen clips at import so drift can never ship.

import {
  cueToCaption,
  reconcileClipTimeline,
  type CaptionCue,
  type VoiceClip,
} from "@studio/narration-kit";
import { kptestCountToTwoClips } from "./generated/kptestCountToTwoClips";
import { makeCueAccessors } from "./_cues/cueAccessors";

const FPS = 30;
const TAIL_FRAMES = 9;

// One entry per cue id in kptestCountToTwoClips (the frozen audio truth), seconds
// from visual-design.md §"per-cue motion budget". No design row was folded into a
// typed gap (ClipCue carries no `gap`), so every cue gets its own motion budget.
const VISUAL_MOTION_SECONDS = {
  "announce-topic": 2.2,
  "cue-1-count": 5.0,
  "cue-2-cardinality": 6.0,
} as const;

// The cue-id UNION — emitted from the reconcile's budget map (the ONE place cue
// ids are declared for this lesson). A typo in scene/wrapper code is a COMPILE
// error against this union; a stale id throws at runtime via makeCueAccessors.
export type KptestCountToTwoCueId = keyof typeof VISUAL_MOTION_SECONDS;
export const KPTEST_COUNT_TO_TWO_CUE_IDS = Object.keys(
  VISUAL_MOTION_SECONDS,
) as KptestCountToTwoCueId[];

// Cross-check: the budget map keys must EXACTLY equal the frozen audio truth's
// cue ids — ONE emitted vocabulary. reconcileClipTimeline already THROWS on a
// clip id with no budget; this catches the other direction (a stale/renamed
// budget id not present in the frozen clips).
const FROZEN_CLIP_IDS = new Set(kptestCountToTwoClips.map((clip) => clip.id));
for (const id of KPTEST_COUNT_TO_TWO_CUE_IDS) {
  if (!FROZEN_CLIP_IDS.has(id)) {
    throw new Error(
      `[kptestCountToTwoLessonTimeline] budget id "${id}" is not a frozen cue id ` +
        `(${[...FROZEN_CLIP_IDS].join(", ")}). VISUAL_MOTION_SECONDS drifted from the audio truth.`,
    );
  }
}

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

// Throwing, union-typed accessors bound to THIS lesson's reconciled cues — the
// single entry point scene + wrapper use to resolve a cue id to a frame.
export const kptestCountToTwoCueAccessors = makeCueAccessors(
  reconciled.cues,
  KPTEST_COUNT_TO_TWO_CUE_IDS,
);
