import { AbsoluteFill, Html5Audio, Sequence } from "remotion";
import { LessonAudioLayer } from "../../lesson-media/LessonAudioLayer";
import { LessonBgmLayer } from "../../lesson-media/LessonBgmLayer";
import { LessonSfxLayer, type SfxEvent } from "../../lesson-media/LessonSfxLayer";
import { spansToWindows } from "../../lesson-media/audioMix";
import { mediaSrc } from "../../lesson-media/mediaSrc";
import { LessonCaptionLayer } from "../../lesson-media/LessonCaptionLayer";
import { ComparisonLessonScene } from "./ComparisonLessonScene";
import { comparisonLessonAlignedCues } from "./generated/comparisonLessonTiming";
import { cueMap } from "../timingTypes";
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
  // Sound layer (audio-cues.json → CAPABILITIES.md#lesson-music-bed / #lesson-sfx-layer).
  // SFX frame derives from the "result" cue, never a literal; one ta-da, in the
  // outro beat after the win lands.
  const cues = cueMap(comparisonLessonAlignedCues);
  const RESULT_TADA_OFFSET_FRAMES = 6;
  const sfxEvents: SfxEvent[] = [
    {
      sound: "ta-da",
      fromFrame: cues.result.startFrame + RESULT_TADA_OFFSET_FRAMES,
    },
  ];

  // Outro "resolve" sting (audio-cues.json outro.resolve): a soft rising swell
  // over the win. Cue-relative one-shot; does not duck.
  const OUTRO_STING_OFFSET_FRAMES = 4;
  const OUTRO_STING_VOLUME = 0.6;

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

      <LessonBgmLayer
        bed="math-calm-68-cmaj"
        windows={spansToWindows(
          teacherAudioSrc ? comparisonLessonVoiceoverSpans : [],
        )}
        totalFrames={completeComparisonLessonDuration}
      />
      <LessonSfxLayer events={sfxEvents} />

      <Sequence from={cues.result.startFrame + OUTRO_STING_OFFSET_FRAMES}>
        <Html5Audio
          src={mediaSrc("audio/_stings/soft-rise.wav")}
          volume={OUTRO_STING_VOLUME}
        />
      </Sequence>

      {showCaptions ? (
        <LessonCaptionLayer cues={comparisonLessonCaptionCues} />
      ) : null}
    </AbsoluteFill>
  );
};
