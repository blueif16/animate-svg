import type { CaptionCue } from "../lesson-media/LessonCaptionLayer";
import type { LabelWindow } from "../lesson-media/LessonCaptionLayer";
import {
  kp2v2CountingByTensAlignedCues,
  kp2v2CountingByTensAlignedDuration,
} from "./generated/kp2v2CountingByTensTiming";
import {
  C2_LABEL_DURATION,
  C2_LABEL_REL_START,
  C3_LABEL_DURATION,
  C3_LABEL_REL_START,
  C4_LABEL_DURATION,
  C4_LABEL_REL_START,
  TAIL_HOLD_FRAMES,
} from "./kp2v2CountingByTens/layout";
import { cueMap, cueToCaption } from "./timingTypes";

// ASR-aligned audio runs 24.87s (746 frames). The brief targets a 35–55s
// total; audio-captions Wave 2b explicitly directs the composer to extend
// duration via per-cue holds rather than adding a sixth cue. We add a
// silent tail (TAIL_HOLD_FRAMES) during which cue 5's picture (both rows +
// both pills + the single sparkle) holds — the speed contrast keeps
// teaching after the voice is silent.
export const completeKp2v2CountingByTensLessonDuration =
  kp2v2CountingByTensAlignedDuration + TAIL_HOLD_FRAMES;

export const kp2v2CountingByTensLessonAudioDefaults = {
  teacherAudioSrc: "audio/kp2v2-counting-by-tens-voice.wav",
} satisfies {
  teacherAudioSrc: string | null;
};

// Voiceover span — the audio plays once across the aligned-cue window only.
// The tail hold is intentionally silent (audio-captions §"Cue Boundary
// Intent" + Notes for downstream waves).
export const kp2v2CountingByTensLessonVoiceoverSpans: Array<[number, number]> =
  kp2v2CountingByTensAlignedCues.length > 0
    ? [
        [
          kp2v2CountingByTensAlignedCues[0].startFrame,
          kp2v2CountingByTensAlignedCues[
            kp2v2CountingByTensAlignedCues.length - 1
          ].endFrame,
        ],
      ]
    : [];

export const kp2v2CountingByTensLessonCaptionCues: CaptionCue[] =
  kp2v2CountingByTensAlignedCues.map(cueToCaption);

// Label windows — programmatic caption suppression per the project's
// "one on-screen representation per beat" rule. Cues 2/3/4 each render a
// LabelCallout (一个十 / 两个十 / 三个十). The label is fully on screen
// from [cueStart + LABEL_REL_START + LABEL_DURATION] through the end of
// cue 4 (labels fade together at cue 5 start). Beat 5's tally pills are
// NOT captions — they are the contrast made visible — so cue 5 does not
// suppress its caption.
const cuesByIdLookup = cueMap(kp2v2CountingByTensAlignedCues);

const labelWindowFor = (
  cueId: string,
  relStart: number,
  duration: number,
  endFrameOverride: number,
): LabelWindow | null => {
  const cue = cuesByIdLookup[cueId];
  if (!cue) {
    return null;
  }
  return {
    startFrame: cue.startFrame + relStart + duration,
    endFrame: endFrameOverride,
  };
};

const labelsFadeEnd = cuesByIdLookup["tens-are-the-faster-way"]?.startFrame ?? 0;

export const kp2v2CountingByTensLessonLabelWindows: LabelWindow[] = (
  [
    labelWindowFor(
      "bundle-is-one-count",
      C2_LABEL_REL_START,
      C2_LABEL_DURATION,
      labelsFadeEnd,
    ),
    labelWindowFor(
      "tens-count-like-ones",
      C3_LABEL_REL_START,
      C3_LABEL_DURATION,
      labelsFadeEnd,
    ),
    labelWindowFor(
      "pattern-holds",
      C4_LABEL_REL_START,
      C4_LABEL_DURATION,
      labelsFadeEnd,
    ),
  ].filter(Boolean) as LabelWindow[]
);
