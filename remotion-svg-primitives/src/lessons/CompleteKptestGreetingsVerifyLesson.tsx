// kptest-greetings-verify — Complete composition wrapper.
//
// Wraps the lesson scene with audio layers:
//   - LessonAudioLayer (voice narration from the frozen WAV)
//   - LessonBgmLayer (mechanical ducked bed)
//   - LessonSfxLayer (composer-owned SFX frames from audio-cues.json)
//   - LessonCaptionLayer (Chinese narration ribbon)
//   - Intro sting + outro resolve (audio-cues.json intro/outro)

import { AbsoluteFill, Html5Audio, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonBgmLayer } from "../lesson-media/LessonBgmLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { LessonSfxLayer, type SfxEvent } from "../lesson-media/LessonSfxLayer";
import { spansToWindows } from "../lesson-media/audioMix";
import { mediaSrc } from "../lesson-media/mediaSrc";
import { KptestGreetingsVerifyLessonScene } from "./kptestGreetingsVerifyLessonScene";
import {
  EXCHANGE_REL_START,
  RECAP_PULSE_REL_START,
} from "./kptestGreetingsVerify/layout";
import {
  kptestGreetingsVerifyCues,
  kptestGreetingsVerifyDuration,
  kptestGreetingsVerifyLessonCaptionCues,
  kptestGreetingsVerifyVoiceClips,
} from "./kptestGreetingsVerifyLessonTimeline";
import { cueMap } from "./timingTypes";

export type CompleteKptestGreetingsVerifyLessonProps = {
  showCaptions?: boolean;
  // v4: voice is per-cue clips (kptestGreetingsVerifyVoiceClips). This toggles
  // the whole voice track off for a silent preview.
  playVoice?: boolean;
};

export const completeKptestGreetingsVerifyLessonDefaultProps: CompleteKptestGreetingsVerifyLessonProps =
  {
    showCaptions: true,
    playVoice: true,
  };

export const completeKptestGreetingsVerifyLessonDuration =
  kptestGreetingsVerifyDuration;

export const CompleteKptestGreetingsVerifyLesson = ({
  showCaptions = true,
  playVoice = true,
}: CompleteKptestGreetingsVerifyLessonProps) => {
  const cues = cueMap(kptestGreetingsVerifyCues);
  const voiceClips = playVoice ? kptestGreetingsVerifyVoiceClips : [];
  // Bed-duck windows: the bed lifts in every silent hold (motion holds, the
  // learner-response gap) for free, derived from the per-cue clip spans.
  const voiceSpans = voiceClips.map(
    (c): [number, number] => [c.fromFrame, c.fromFrame + c.durationInFrames],
  );

  // ---- SFX events (audio-cues.json → composer-owned frames).
  // Every fromFrame derives from cue starts + layout.ts offsets. ----
  const sfxEvents: SfxEvent[] = [
    // greet — transition whoosh as characters approach + first bubble pops.
    {
      sound: "whoosh",
      fromFrame: cues["greet"].startFrame + EXCHANGE_REL_START,
      volume: 0.45,
    },
    // farewell — transition whoosh as characters part.
    {
      sound: "whoosh",
      fromFrame: cues["farewell"].startFrame + EXCHANGE_REL_START,
      volume: 0.4,
    },
    // recap — ta-da reward as the recap arc closes.
    {
      sound: "ta-da",
      fromFrame: cues["recap-1"].startFrame + RECAP_PULSE_REL_START,
      volume: 0.55,
    },
  ];

  // Intro section-lift sting (audio-cues.json intro.sting).
  const INTRO_STING_OFFSET_FRAMES = 2;
  const INTRO_STING_VOLUME = 0.5;

  // Outro resolve sting (audio-cues.json outro.resolve).
  const OUTRO_RESOLVE_OFFSET_FRAMES = RECAP_PULSE_REL_START - 4;
  const OUTRO_RESOLVE_VOLUME = 0.55;

  return (
    <AbsoluteFill>
      <Sequence durationInFrames={completeKptestGreetingsVerifyLessonDuration}>
        <KptestGreetingsVerifyLessonScene />
      </Sequence>

      <LessonAudioLayer voiceClips={voiceClips} />

      <LessonBgmLayer
        bed="literacy-playful-76"
        windows={spansToWindows(voiceSpans)}
        totalFrames={completeKptestGreetingsVerifyLessonDuration}
      />
      <LessonSfxLayer events={sfxEvents} />

      {/* Intro sting — calm rise as the lesson opens. */}
      <Sequence
        from={cues["topic-intro"].startFrame + INTRO_STING_OFFSET_FRAMES}
      >
        <Html5Audio
          src={mediaSrc("audio/_stings/kids-section-lift.wav")}
          volume={INTRO_STING_VOLUME}
        />
      </Sequence>

      {/* Outro resolve — soft rising swell over the recap close. */}
      <Sequence
        from={cues["recap-1"].startFrame + OUTRO_RESOLVE_OFFSET_FRAMES}
      >
        <Html5Audio
          src={mediaSrc("audio/_stings/kids-outro-resolve.wav")}
          volume={OUTRO_RESOLVE_VOLUME}
        />
      </Sequence>

      {showCaptions ? (
        <LessonCaptionLayer cues={kptestGreetingsVerifyLessonCaptionCues} />
      ) : null}
    </AbsoluteFill>
  );
};
