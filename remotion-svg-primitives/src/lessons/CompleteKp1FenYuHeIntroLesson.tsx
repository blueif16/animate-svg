import { AbsoluteFill, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { Kp1FenYuHeIntroLessonScene } from "./Kp1FenYuHeIntroLessonScene";
import {
  kp1FenYuHeIntroDuration,
  kp1FenYuHeIntroLessonAudioDefaults,
  kp1FenYuHeIntroLessonCaptionCues,
  kp1FenYuHeIntroLessonVoiceoverSpans,
} from "./kp1FenYuHeIntroLessonTimeline";

export type CompleteKp1FenYuHeIntroLessonProps = {
  showCaptions?: boolean;
  teacherAudioSrc?: string | null;
};

export const completeKp1FenYuHeIntroLessonDefaultProps: CompleteKp1FenYuHeIntroLessonProps =
  {
    showCaptions: true,
    teacherAudioSrc: kp1FenYuHeIntroLessonAudioDefaults.teacherAudioSrc,
  };

export const completeKp1FenYuHeIntroLessonDuration = kp1FenYuHeIntroDuration;

export const CompleteKp1FenYuHeIntroLesson = ({
  showCaptions = true,
  teacherAudioSrc = kp1FenYuHeIntroLessonAudioDefaults.teacherAudioSrc,
}: CompleteKp1FenYuHeIntroLessonProps) => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={completeKp1FenYuHeIntroLessonDuration}>
        <Kp1FenYuHeIntroLessonScene />
      </Sequence>

      <LessonAudioLayer
        teacherAudioSrc={teacherAudioSrc}
        teacherDurationInFrames={completeKp1FenYuHeIntroLessonDuration}
        voiceoverSpans={
          teacherAudioSrc ? kp1FenYuHeIntroLessonVoiceoverSpans : []
        }
      />

      {showCaptions ? (
        <LessonCaptionLayer cues={kp1FenYuHeIntroLessonCaptionCues} />
      ) : null}
    </AbsoluteFill>
  );
};
