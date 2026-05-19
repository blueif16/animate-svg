import { Html5Audio, interpolate, Sequence } from "remotion";
import { mediaSrc } from "./mediaSrc";

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

const volumeAtFrame = (
  frame: number,
  spans: VoiceoverSpan[],
  baseVolume: number,
  duckedVolume: number,
) => {
  const fadeFrames = 8;

  for (const [start, end] of spans) {
    if (frame >= start && frame <= end) {
      return duckedVolume;
    }

    if (frame >= start - fadeFrames && frame < start) {
      return interpolate(
        frame,
        [start - fadeFrames, start],
        [baseVolume, duckedVolume],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      );
    }

    if (frame > end && frame <= end + fadeFrames) {
      return interpolate(
        frame,
        [end, end + fadeFrames],
        [duckedVolume, baseVolume],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      );
    }
  }

  return baseVolume;
};

export const LessonAudioLayer = ({
  bgmSrc,
  bgmVolume = 0.14,
  duckedBgmVolume = 0.04,
  teacherAudioSrc,
  teacherAudioVolume = 1,
  teacherDurationInFrames,
  teacherFromFrame = 0,
  voiceoverSpans,
}: Props) => {
  return (
    <>
      {bgmSrc ? (
        <Html5Audio
          loop
          src={mediaSrc(bgmSrc)}
          volume={(frame) =>
            volumeAtFrame(frame, voiceoverSpans, bgmVolume, duckedBgmVolume)
          }
        />
      ) : null}

      {teacherAudioSrc ? (
        <Sequence
          durationInFrames={teacherDurationInFrames}
          from={teacherFromFrame}
        >
          <Html5Audio
            src={mediaSrc(teacherAudioSrc)}
            volume={teacherAudioVolume}
          />
        </Sequence>
      ) : null}
    </>
  );
};
