import { AbsoluteFill } from "remotion";

import { LessonAudioLayer } from "../../lesson-media/LessonAudioLayer";
import { LessonCaptionLayer } from "../../lesson-media/LessonCaptionLayer";
import { colors } from "../../theme";

import { FenYuHeLessonScene } from "./FenYuHeLessonScene";
import {
  fenYuHeDuration,
  fenYuHeLessonAudioDefaults,
  fenYuHeLessonCaptionCues,
  fenYuHeLessonVoiceoverSpans,
} from "./fenYuHeLessonTimeline";

export const completeFenYuHeLessonDuration = fenYuHeDuration;

export const completeFenYuHeLessonDefaultProps = {
  teacherAudioSrc: fenYuHeLessonAudioDefaults.teacherAudioSrc,
} as const;

type Props = {
  teacherAudioSrc?: string | null;
};

export const CompleteFenYuHeLesson: React.FC<Props> = ({
  teacherAudioSrc = fenYuHeLessonAudioDefaults.teacherAudioSrc,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <FenYuHeLessonScene />
      <LessonCaptionLayer cues={fenYuHeLessonCaptionCues} />
      <LessonAudioLayer
        teacherAudioSrc={teacherAudioSrc}
        teacherDurationInFrames={fenYuHeDuration}
        voiceoverSpans={fenYuHeLessonVoiceoverSpans}
      />
    </AbsoluteFill>
  );
};
