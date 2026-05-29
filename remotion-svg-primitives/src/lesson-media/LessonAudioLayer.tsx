import { AudioLayer } from "@studio/narration-kit";

type VoiceoverSpan = [number, number];

type Props = {
  bgmSrc?: string | null;
  bgmVolume?: number;
  duckedBgmVolume?: number;
  teacherAudioSrc?: string | null;
  teacherAudioVolume?: number;
  teacherDurationInFrames: number;
  teacherFromFrame?: number;
  voiceoverSpans: VoiceoverSpan[];
};

// Thin wrapper around the kit's AudioLayer. Keeps the animation-test API
// (teacherAudioSrc / teacherDurationInFrames / teacherFromFrame /
// teacherAudioVolume) so existing lesson scenes do not have to change.
export const LessonAudioLayer = ({
  bgmSrc,
  bgmVolume,
  duckedBgmVolume,
  teacherAudioSrc,
  teacherAudioVolume,
  teacherDurationInFrames,
  teacherFromFrame,
  voiceoverSpans,
}: Props) => (
  <AudioLayer
    bgmSrc={bgmSrc}
    bgmVolume={bgmVolume}
    duckedBgmVolume={duckedBgmVolume}
    voiceSrc={teacherAudioSrc}
    voiceVolume={teacherAudioVolume}
    voiceDurationInFrames={teacherDurationInFrames}
    voiceFromFrame={teacherFromFrame}
    voiceoverSpans={voiceoverSpans}
  />
);
