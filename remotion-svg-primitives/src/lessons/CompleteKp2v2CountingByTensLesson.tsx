import { AbsoluteFill, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { Kp2v2CountingByTensLessonScene } from "./Kp2v2CountingByTensLessonScene";
import {
  completeKp2v2CountingByTensLessonDuration,
  kp2v2CountingByTensLessonAudioDefaults,
  kp2v2CountingByTensLessonCaptionCues,
  kp2v2CountingByTensLessonLabelWindows,
  kp2v2CountingByTensLessonVoiceoverSpans,
} from "./kp2v2CountingByTensLessonTimeline";

export type CompleteKp2v2CountingByTensLessonProps = {
  showCaptions?: boolean;
  teacherAudioSrc?: string | null;
};

export const completeKp2v2CountingByTensLessonDefaultProps: CompleteKp2v2CountingByTensLessonProps =
  {
    showCaptions: true,
    teacherAudioSrc: kp2v2CountingByTensLessonAudioDefaults.teacherAudioSrc,
  };

export const CompleteKp2v2CountingByTensLesson = ({
  showCaptions = true,
  teacherAudioSrc = kp2v2CountingByTensLessonAudioDefaults.teacherAudioSrc,
}: CompleteKp2v2CountingByTensLessonProps) => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={completeKp2v2CountingByTensLessonDuration}>
        <Kp2v2CountingByTensLessonScene />
      </Sequence>

      <LessonAudioLayer
        teacherAudioSrc={teacherAudioSrc}
        teacherDurationInFrames={completeKp2v2CountingByTensLessonDuration}
        voiceoverSpans={
          teacherAudioSrc ? kp2v2CountingByTensLessonVoiceoverSpans : []
        }
      />

      {showCaptions ? (
        <LessonCaptionLayer
          cues={kp2v2CountingByTensLessonCaptionCues}
          labelWindows={kp2v2CountingByTensLessonLabelWindows}
        />
      ) : null}
    </AbsoluteFill>
  );
};
