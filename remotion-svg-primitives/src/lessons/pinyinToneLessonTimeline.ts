import type { CaptionCue } from "../lesson-media/LessonCaptionLayer";
import {
  pinyinToneLessonAlignedCues,
  pinyinToneLessonAlignedDuration,
} from "./generated/pinyinToneLessonTiming";
import { cueToCaption } from "./timingTypes";

export const completePinyinToneLessonDuration =
  pinyinToneLessonAlignedDuration;

export const pinyinToneLessonAudioDefaults = {
  teacherAudioSrc: "audio/pinyin-four-tones-voice.wav",
} satisfies {
  teacherAudioSrc: string | null;
};

export const pinyinToneLessonVoiceoverSpans: Array<[number, number]> =
  pinyinToneLessonAlignedCues.length > 0
    ? [
        [
          pinyinToneLessonAlignedCues[0].startFrame,
          pinyinToneLessonAlignedCues[pinyinToneLessonAlignedCues.length - 1]
            .endFrame,
        ],
      ]
    : [];

export const pinyinToneLessonTeacherScript = [
  "今天我们来听拼音的四个声调。",
  "一声，声音平平的：mā。",
  "二声，声音往上扬：má。",
  "三声，先低再起来：mǎ。",
  "四声，声音往下落：mà。",
  "看声调，就能读准拼音。",
];

export const pinyinToneLessonCaptionCues: CaptionCue[] =
  pinyinToneLessonAlignedCues.map(cueToCaption);
