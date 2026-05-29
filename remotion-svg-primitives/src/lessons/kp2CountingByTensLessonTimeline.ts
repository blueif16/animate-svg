import type {
  CaptionCue,
  LabelWindow,
} from "../lesson-media/LessonCaptionLayer";
import {
  kp2CountingByTensAlignedCues,
  kp2CountingByTensAlignedDuration,
} from "./generated/kp2CountingByTensTiming";
import { getKp2CountingByTensLabelWindows } from "./Kp2CountingByTensLessonScene";
import { type AlignedLessonCue, cueToCaption } from "./timingTypes";

// Derived from the ASR-aligned timing module. Do NOT hardcode a duration
// here — when ASR realigns, this single import keeps the whole scene synced.
export const completeKp2CountingByTensLessonDuration =
  kp2CountingByTensAlignedDuration;

export const kp2CountingByTensLessonAudioDefaults = {
  teacherAudioSrc: "audio/kp2-counting-by-tens-voice.wav",
} satisfies {
  teacherAudioSrc: string | null;
};

export const kp2CountingByTensLessonVoiceoverSpans: Array<[number, number]> =
  kp2CountingByTensAlignedCues.length > 0
    ? [
        [
          kp2CountingByTensAlignedCues[0].startFrame,
          kp2CountingByTensAlignedCues[
            kp2CountingByTensAlignedCues.length - 1
          ].endFrame,
        ],
      ]
    : [];

// Cast at the boundary — silencedetect-corrected `confidence` literal isn't
// in the @studio/narration-kit type union yet. Orchestrator decision is to
// keep upstream timing module as-is. Functional fields are unaffected.
const alignedCues = kp2CountingByTensAlignedCues as unknown as AlignedLessonCue[];

export const kp2CountingByTensLessonCaptionCues: CaptionCue[] =
  alignedCues.map(cueToCaption);

// Frame windows during which an in-canvas LabelCallout is on screen.
// LessonCaptionLayer reads this and suppresses the caption ribbon for any
// caption cue whose midpoint falls inside one of these windows — programmatic
// enforcement of the pedagogy "one on-screen representation per beat" rule.
export const kp2CountingByTensLessonLabelWindows: LabelWindow[] =
  getKp2CountingByTensLabelWindows(alignedCues);
