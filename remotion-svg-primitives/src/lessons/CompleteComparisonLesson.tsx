import { AbsoluteFill, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { ComparisonLessonScene } from "./ComparisonLessonScene";
import {
  completeComparisonLessonDuration,
  comparisonLessonAudioDefaults,
  comparisonLessonCaptionCues,
  comparisonLessonVoiceoverSpans,
} from "./comparisonLessonTimeline";

export type CompleteComparisonLessonProps = {
  showCaptions?: boolean;
  teacherAudioSrc?: string | null;
};

export const completeComparisonLessonDefaultProps: CompleteComparisonLessonProps =
  {
    showCaptions: true,
    teacherAudioSrc: comparisonLessonAudioDefaults.teacherAudioSrc,
  };

export const CompleteComparisonLesson = ({
  showCaptions = true,
  teacherAudioSrc = comparisonLessonAudioDefaults.teacherAudioSrc,
}: CompleteComparisonLessonProps) => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={completeComparisonLessonDuration}>
        <ComparisonLessonScene />
      </Sequence>

      <LessonAudioLayer
        teacherAudioSrc={teacherAudioSrc}
        teacherDurationInFrames={completeComparisonLessonDuration}
        voiceoverSpans={
          teacherAudioSrc ? comparisonLessonVoiceoverSpans : []
        }
      />

      {showCaptions ? (
        <LessonCaptionLayer cues={comparisonLessonCaptionCues} />
      ) : null}
    </AbsoluteFill>
  );
};
