import type { CaptionCue } from "../lesson-media/LessonCaptionLayer";
import {
  comparisonLessonAlignedCues,
  comparisonLessonAlignedDuration,
} from "./generated/comparisonLessonTiming";
import { cueToCaption } from "./timingTypes";

export const completeComparisonLessonDuration = comparisonLessonAlignedDuration;

export const comparisonLessonAudioDefaults = {
  teacherAudioSrc: "audio/comparison-5-gt-3-voice.wav",
} satisfies {
  teacherAudioSrc: string | null;
};

export const comparisonLessonVoiceoverSpans: Array<[number, number]> =
  comparisonLessonAlignedCues.length > 0
    ? [
        [
          comparisonLessonAlignedCues[0].startFrame,
          comparisonLessonAlignedCues[comparisonLessonAlignedCues.length - 1]
            .endFrame,
        ],
      ]
    : [];

export const comparisonLessonTeacherScript = [
  "我们来比一比。",
  "左边有五个星星，右边有三个积木。",
  "先一一配对。",
  "配完以后，左边还剩两个。",
  "所以，五大于三。",
];

export const comparisonLessonCaptionCues: CaptionCue[] =
  comparisonLessonAlignedCues.map(cueToCaption);
