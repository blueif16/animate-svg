import { AbsoluteFill, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { TenOnesMakeOneTenLessonScene } from "./TenOnesMakeOneTenLessonScene";
import {
  completeTenOnesMakeOneTenLessonDuration,
  tenOnesMakeOneTenLessonAudioDefaults,
  tenOnesMakeOneTenLessonCaptionCues,
  tenOnesMakeOneTenLessonVoiceoverSpans,
} from "./tenOnesMakeOneTenLessonTimeline";

export type CompleteTenOnesMakeOneTenLessonProps = {
  showCaptions?: boolean;
  teacherAudioSrc?: string | null;
};

export const completeTenOnesMakeOneTenLessonDefaultProps: CompleteTenOnesMakeOneTenLessonProps =
  {
    showCaptions: true,
    teacherAudioSrc: tenOnesMakeOneTenLessonAudioDefaults.teacherAudioSrc,
  };

export const CompleteTenOnesMakeOneTenLesson = ({
  showCaptions = true,
  teacherAudioSrc = tenOnesMakeOneTenLessonAudioDefaults.teacherAudioSrc,
}: CompleteTenOnesMakeOneTenLessonProps) => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={completeTenOnesMakeOneTenLessonDuration}>
        <TenOnesMakeOneTenLessonScene />
      </Sequence>

      <LessonAudioLayer
        teacherAudioSrc={teacherAudioSrc}
        teacherDurationInFrames={completeTenOnesMakeOneTenLessonDuration}
        voiceoverSpans={
          teacherAudioSrc ? tenOnesMakeOneTenLessonVoiceoverSpans : []
        }
      />

      {showCaptions ? (
        <LessonCaptionLayer cues={tenOnesMakeOneTenLessonCaptionCues} />
      ) : null}
    </AbsoluteFill>
  );
};
