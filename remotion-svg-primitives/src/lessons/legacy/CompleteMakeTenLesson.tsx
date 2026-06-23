import { AbsoluteFill, Sequence } from "remotion";
import { LessonAudioLayer } from "../../lesson-media/LessonAudioLayer";
import { LessonCaptionLayer } from "../../lesson-media/LessonCaptionLayer";
import { MakeTenLessonScene } from "./MakeTenLessonScene";
import {
  completeMakeTenLessonDuration,
  makeTenLessonAudioDefaults,
  makeTenLessonCaptionCues,
  makeTenLessonVoiceoverSpans,
} from "./makeTenLessonTimeline";

export type CompleteMakeTenLessonProps = {
  showCaptions?: boolean;
  teacherAudioSrc?: string | null;
};

export const completeMakeTenLessonDefaultProps: CompleteMakeTenLessonProps = {
  showCaptions: true,
  teacherAudioSrc: makeTenLessonAudioDefaults.teacherAudioSrc,
};

export const CompleteMakeTenLesson = ({
  showCaptions = true,
  teacherAudioSrc = makeTenLessonAudioDefaults.teacherAudioSrc,
}: CompleteMakeTenLessonProps) => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={completeMakeTenLessonDuration}>
        <MakeTenLessonScene />
      </Sequence>

      <LessonAudioLayer
        teacherAudioSrc={teacherAudioSrc}
        teacherDurationInFrames={completeMakeTenLessonDuration}
        voiceoverSpans={teacherAudioSrc ? makeTenLessonVoiceoverSpans : []}
      />

      {showCaptions ? (
        <LessonCaptionLayer cues={makeTenLessonCaptionCues} />
      ) : null}
    </AbsoluteFill>
  );
};
