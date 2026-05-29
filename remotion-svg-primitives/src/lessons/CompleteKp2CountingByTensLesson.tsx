import { AbsoluteFill, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { StylePreset } from "../styles";
import { Kp2CountingByTensLessonScene } from "./Kp2CountingByTensLessonScene";
import {
  completeKp2CountingByTensLessonDuration,
  kp2CountingByTensLessonAudioDefaults,
  kp2CountingByTensLessonCaptionCues,
  kp2CountingByTensLessonLabelWindows,
  kp2CountingByTensLessonVoiceoverSpans,
} from "./kp2CountingByTensLessonTimeline";

export type CompleteKp2CountingByTensLessonProps = {
  showCaptions?: boolean;
  teacherAudioSrc?: string | null;
};

export const completeKp2CountingByTensLessonDefaultProps: CompleteKp2CountingByTensLessonProps =
  {
    showCaptions: true,
    teacherAudioSrc: kp2CountingByTensLessonAudioDefaults.teacherAudioSrc,
  };

export const CompleteKp2CountingByTensLesson = ({
  showCaptions = true,
  teacherAudioSrc = kp2CountingByTensLessonAudioDefaults.teacherAudioSrc,
}: CompleteKp2CountingByTensLessonProps) => {
  return (
    <StylePreset style="ink-wash">
      <AbsoluteFill>
        <Sequence durationInFrames={completeKp2CountingByTensLessonDuration}>
          <Kp2CountingByTensLessonScene />
        </Sequence>

        <LessonAudioLayer
          teacherAudioSrc={teacherAudioSrc}
          teacherDurationInFrames={completeKp2CountingByTensLessonDuration}
          voiceoverSpans={
            teacherAudioSrc ? kp2CountingByTensLessonVoiceoverSpans : []
          }
        />

        {showCaptions ? (
          <LessonCaptionLayer
            cues={kp2CountingByTensLessonCaptionCues}
            labelWindows={kp2CountingByTensLessonLabelWindows}
          />
        ) : null}
      </AbsoluteFill>
    </StylePreset>
  );
};
