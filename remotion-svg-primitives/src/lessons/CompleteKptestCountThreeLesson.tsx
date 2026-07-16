// kptest-count-three — the Complete wrapper (scene + audio tracks + captions)
// + the lesson registry descriptor. Registers BY DESCRIPTOR (the registry
// auto-discovers `lessonComposition`); ROOT.tsx / Composition.tsx are NOT
// touched (conflict-free merge-back under parallel runs).

import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import { video } from "../theme";
import type { LessonComposition } from "./lessonRegistryTypes";
import { KptestCountThreeLessonScene } from "./kptestCountThreeLessonScene";
import {
  kptestCountThreeCueAccessors,
  kptestCountThreeCues,
  kptestCountThreeDuration,
  kptestCountThreeVoiceClips,
} from "./kptestCountThreeLessonTimeline";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonBgmLayer } from "../lesson-media/LessonBgmLayer";
import {
  assertConcurrentAudioBudget,
  LessonSfxLayer,
  type SfxEvent,
} from "../lesson-media/LessonSfxLayer";
import {
  LessonCaptionLayer,
  type CaptionCue,
} from "../lesson-media/LessonCaptionLayer";
import { spansToWindows } from "../lesson-media/audioMix";
import audioCues from "../../lesson-data/kptest-count-three/audio-cues.json";
import {
  COUNT_WORD_TOKEN_INDICES,
  REVEAL_TA_DA_OFFSET,
} from "./kptestCountThree/layout";

const { cStart, cueOf } = kptestCountThreeCueAccessors;
const countCue = cueOf("count-climb");
const countStart = countCue.startFrame;
const revealStart = cStart("cardinality");

// ── Bed-duck windows — derived from the per-cue voice CLIP spans (v4). ───────
const voiceSpans: Array<[number, number]> = kptestCountThreeVoiceClips.map(
  (clip) => [clip.fromFrame, clip.fromFrame + clip.durationInFrames],
);
const bedWindows = spansToWindows(voiceSpans);

// ── Captions — presence tracks SPEECH, not the cue window (gap dropout). ─────
// The mechanical cueToCaption would clamp a learner-response gap cue's ribbon
// to its endFrame; here every cue's gapFrames is 0 (no typed gap), so the clamp
// is a no-op and the ribbon naturally ends at the cue's endFrame. We still
// build our OWN caption array to end-anchor each entrance fade at the speech
// ONSET (fromFrame = narrationStartFrame − FADE/2) so the kit's centered
// crossfade COMPLETES exactly when speech begins, not a half-window late.
const CAPTION_FADE_FRAMES = 6;
const captionCues: CaptionCue[] = kptestCountThreeCues.map((cue) => ({
  text: cue.caption,
  fromFrame: cue.narrationStartFrame - CAPTION_FADE_FRAMES / 2,
  toFrame: cue.gapFrames > 0 ? cue.narrationEndFrame : cue.endFrame,
}));

// ── SFX — composer-owned frames = the cue's count-word token onsets (the SAME
// frames the counted apples land) + the cardinal climax pop. audio-cues.json:
// count-climb = tick perStep risingPitch (3 ticks, one per spoken 一/二/三,
// ascending semitones); cardinality = a single ta-da reward on the climax pop.
const sfxEvents: SfxEvent[] = [
  ...COUNT_WORD_TOKEN_INDICES.map((idx, i) => ({
    sound: "tick" as const,
    fromFrame: countStart + (countCue.tokenOnsets?.[idx] ?? 0),
    semitones: i * 2, // risingPitch — each count a step higher
  })),
  {
    sound: "ta-da" as const,
    fromFrame: revealStart + REVEAL_TA_DA_OFFSET,
  },
];
assertConcurrentAudioBudget(sfxEvents); // throws at module load if >6 overlap (none do)

// ── Default props (lessonComposition contract) ───────────────────────────────
const completeKptestCountThreeLessonDefaultProps: Record<string, unknown> = {};

export const CompleteKptestCountThreeLesson: FC<Record<string, unknown>> = () => (
  <AbsoluteFill>
    <KptestCountThreeLessonScene />
    {/* v4 per-cue voice — one <Sequence from> per clip; never a continuous WAV */}
    <LessonAudioLayer voiceClips={kptestCountThreeVoiceClips} />
    {/* bed — MECHANICAL envelope; duck windows derived from the clip spans */}
    <LessonBgmLayer
      bed={audioCues.bed}
      windows={bedWindows}
      totalFrames={kptestCountThreeDuration}
    />
    {/* discrete one-shot SFX at composer-owned motion frames (count ticks +
        the cardinal reward), sitting below the narration */}
    <LessonSfxLayer events={sfxEvents} />
    {/* bottom ribbon — speech-tracked (dropped only through any typed gap) */}
    <LessonCaptionLayer cues={captionCues} />
  </AbsoluteFill>
);

export const lessonComposition: LessonComposition = {
  id: "CompleteKptestCountThreeLesson",
  component: CompleteKptestCountThreeLesson,
  durationInFrames: kptestCountThreeDuration,
  defaultProps: completeKptestCountThreeLessonDefaultProps,
  width: video.width,
  height: video.height,
  fps: video.fps,
};
