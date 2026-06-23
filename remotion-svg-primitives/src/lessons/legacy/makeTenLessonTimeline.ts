import type { CaptionCue } from "../../lesson-media/LessonCaptionLayer";
import {
  makeTenLessonAlignedCues,
  makeTenLessonAlignedDuration,
} from "./generated/makeTenLessonTiming";
import { cueToCaption } from "../timingTypes";

export const completeMakeTenLessonDuration = makeTenLessonAlignedDuration;

export const makeTenLessonAudioDefaults = {
  teacherAudioSrc: "audio/make-10-6-and-4-voice.wav",
} satisfies {
  teacherAudioSrc: string | null;
};

export const makeTenLessonVoiceoverSpans: Array<[number, number]> =
  makeTenLessonAlignedCues.length > 0
    ? [
        [
          makeTenLessonAlignedCues[0].startFrame,
          makeTenLessonAlignedCues[makeTenLessonAlignedCues.length - 1]
            .endFrame,
        ],
      ]
    : [];

export const makeTenLessonCaptionCues: CaptionCue[] =
  makeTenLessonAlignedCues.map(cueToCaption);
