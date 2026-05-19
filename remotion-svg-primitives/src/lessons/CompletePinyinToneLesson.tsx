import { AbsoluteFill, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { PinyinToneLessonScene } from "./PinyinToneLessonScene";
import {
  completePinyinToneLessonDuration,
  pinyinToneLessonAudioDefaults,
  pinyinToneLessonCaptionCues,
  pinyinToneLessonVoiceoverSpans,
} from "./pinyinToneLessonTimeline";

export type CompletePinyinToneLessonProps = {
  showCaptions?: boolean;
  teacherAudioSrc?: string | null;
};

export const completePinyinToneLessonDefaultProps: CompletePinyinToneLessonProps =
  {
    showCaptions: true,
    teacherAudioSrc: pinyinToneLessonAudioDefaults.teacherAudioSrc,
  };

export const CompletePinyinToneLesson = ({
  showCaptions = true,
  teacherAudioSrc = pinyinToneLessonAudioDefaults.teacherAudioSrc,
}: CompletePinyinToneLessonProps) => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={completePinyinToneLessonDuration}>
        <PinyinToneLessonScene />
      </Sequence>

      <LessonAudioLayer
        teacherAudioSrc={teacherAudioSrc}
        teacherDurationInFrames={completePinyinToneLessonDuration}
        voiceoverSpans={teacherAudioSrc ? pinyinToneLessonVoiceoverSpans : []}
      />

      {showCaptions ? (
        <LessonCaptionLayer cues={pinyinToneLessonCaptionCues} />
      ) : null}
    </AbsoluteFill>
  );
};
