import { AudioLayer, type VoiceClip } from "@studio/narration-kit";

type VoiceoverSpan = [number, number];

type Props = {
  bgmSrc?: string | null;
  bgmVolume?: number;
  duckedBgmVolume?: number;
  // v4 (preferred): per-cue voice clips, each anchored to its cue window.
  voiceClips?: VoiceClip[];
  // legacy single-WAV path (kept for pre-v4 lessons / silent-preview toggles).
  teacherAudioSrc?: string | null;
  teacherAudioVolume?: number;
  teacherDurationInFrames?: number;
  teacherFromFrame?: number;
  voiceoverSpans?: VoiceoverSpan[];
};

// Thin wrapper around the kit's AudioLayer. Keeps the animation-test API names
// (teacher*) for the legacy single-WAV path; v4 lessons pass voiceClips and the
// kit mounts one Sequence per cue.
export const LessonAudioLayer = ({
  bgmSrc,
  bgmVolume,
  duckedBgmVolume,
  voiceClips,
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
    voiceClips={voiceClips}
    voiceSrc={teacherAudioSrc}
    voiceVolume={teacherAudioVolume}
    voiceDurationInFrames={teacherDurationInFrames}
    voiceFromFrame={teacherFromFrame}
    voiceoverSpans={voiceoverSpans}
  />
);
