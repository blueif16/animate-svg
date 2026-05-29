import type { CaptionCue } from "../lesson-media/LessonCaptionLayer";
import {
  tenOnesMakeOneTenAlignedCues,
  tenOnesMakeOneTenAlignedDuration,
} from "./generated/tenOnesMakeOneTenTiming";
import { cueToCaption } from "./timingTypes";

// Derived from the ASR-aligned timing module. Do NOT hardcode a duration
// here — when ASR realigns, this single import keeps the whole scene synced.
export const completeTenOnesMakeOneTenLessonDuration =
  tenOnesMakeOneTenAlignedDuration;

export const tenOnesMakeOneTenLessonAudioDefaults = {
  teacherAudioSrc: "audio/ten-ones-make-one-ten-voice.wav",
} satisfies {
  teacherAudioSrc: string | null;
};

export const tenOnesMakeOneTenLessonVoiceoverSpans: Array<[number, number]> =
  tenOnesMakeOneTenAlignedCues.length > 0
    ? [
        [
          tenOnesMakeOneTenAlignedCues[0].startFrame,
          tenOnesMakeOneTenAlignedCues[tenOnesMakeOneTenAlignedCues.length - 1]
            .endFrame,
        ],
      ]
    : [];

export const tenOnesMakeOneTenLessonCaptionCues: CaptionCue[] =
  tenOnesMakeOneTenAlignedCues.map(cueToCaption);
