import { AbsoluteFill, Html5Audio, Sequence } from "remotion";
import { LessonAudioLayer } from "../../lesson-media/LessonAudioLayer";
import { LessonBgmLayer } from "../../lesson-media/LessonBgmLayer";
import { LessonCaptionLayer } from "../../lesson-media/LessonCaptionLayer";
import { LessonSfxLayer, type SfxEvent } from "../../lesson-media/LessonSfxLayer";
import { spansToWindows } from "../../lesson-media/audioMix";
import { mediaSrc } from "../../lesson-media/mediaSrc";
import { Kp1HelloGreetingsLessonScene } from "./kp1HelloGreetingsLessonScene";
import {
  EXCHANGE_REL_START,
  INTER_TURN_GAP,
  PER_TURN_FRAMES,
  RECAP_PULSE_REL_START,
} from "./kp1HelloGreetings/layout";
import {
  kp1HelloGreetingsCues,
  kp1HelloGreetingsDuration,
  kp1HelloGreetingsLessonAudioDefaults,
  kp1HelloGreetingsLessonCaptionCues,
  kp1HelloGreetingsLessonVoiceoverSpans,
} from "./kp1HelloGreetingsLessonTimeline";
import { cueMap } from "../timingTypes";

export type CompleteKp1HelloGreetingsLessonProps = {
  showCaptions?: boolean;
  teacherAudioSrc?: string | null;
};

export const completeKp1HelloGreetingsLessonDefaultProps: CompleteKp1HelloGreetingsLessonProps =
  {
    showCaptions: true,
    teacherAudioSrc: kp1HelloGreetingsLessonAudioDefaults.teacherAudioSrc,
  };

export const completeKp1HelloGreetingsLessonDuration =
  kp1HelloGreetingsDuration;

export const CompleteKp1HelloGreetingsLesson = ({
  showCaptions = true,
  teacherAudioSrc = kp1HelloGreetingsLessonAudioDefaults.teacherAudioSrc,
}: CompleteKp1HelloGreetingsLessonProps) => {
  // ---- Sound layer (audio-cues.json → CAPABILITIES.md#lesson-music-bed /
  //      #lesson-sfx-layer). The bed is MECHANICAL; SFX frames are composer-
  //      owned, derived from cue starts + the SAME layout.ts offsets the motion
  //      uses — NEVER a literal. ----
  const cues = cueMap(kp1HelloGreetingsCues);

  const sfxEvents: SfxEvent[] = [
    // intro — a soft whoosh as the topic card resolves in (audio-cues "transition").
    {
      sound: "whoosh",
      fromFrame: cues.intro.startFrame + EXCHANGE_REL_START,
      volume: 0.5,
    },
    // meet-hello — pop on the "Hello!" bubble entrance (turn 0 opens at exchange start).
    {
      sound: "pop",
      fromFrame: cues["meet-hello"].startFrame + EXCHANGE_REL_START,
    },
    // intro-self — pop on the "Hi! I'm Sam." bubble entrance.
    {
      sound: "pop",
      fromFrame: cues["intro-self"].startFrame + EXCHANGE_REL_START,
    },
    // part-goodbye — pop on the FIRST farewell bubble; the second farewell bubble
    // pop one turn-step later (both waves, both bubbles).
    {
      sound: "pop",
      fromFrame: cues["part-goodbye"].startFrame + EXCHANGE_REL_START,
    },
    {
      sound: "pop",
      fromFrame:
        cues["part-goodbye"].startFrame +
        EXCHANGE_REL_START +
        PER_TURN_FRAMES +
        INTER_TURN_GAP,
      volume: 0.85,
    },
    // recap — a warm chime as the arc closes (audio-cues "reward"), landing with
    // the closing coral pulse.
    {
      sound: "chime",
      fromFrame: cues.recap.startFrame + RECAP_PULSE_REL_START,
    },
  ];

  // Intro section-lift sting (audio-cues.json intro.sting): a calm rise as the
  // lesson opens. Cue-relative one-shot; does not duck.
  const INTRO_STING_OFFSET_FRAMES = 2;
  const INTRO_STING_VOLUME = 0.55;

  // Outro "resolve" sting (audio-cues.json outro.resolve): a soft rising swell
  // over the recap close. Cue-relative one-shot; does not duck.
  const OUTRO_RESOLVE_OFFSET_FRAMES = RECAP_PULSE_REL_START - 4;
  const OUTRO_RESOLVE_VOLUME = 0.6;

  return (
    <AbsoluteFill>
      <Sequence durationInFrames={completeKp1HelloGreetingsLessonDuration}>
        <Kp1HelloGreetingsLessonScene />
      </Sequence>

      <LessonAudioLayer
        teacherAudioSrc={teacherAudioSrc}
        teacherDurationInFrames={completeKp1HelloGreetingsLessonDuration}
        voiceoverSpans={
          teacherAudioSrc ? kp1HelloGreetingsLessonVoiceoverSpans : []
        }
      />

      <LessonBgmLayer
        bed="literacy-playful-76"
        windows={spansToWindows(
          teacherAudioSrc ? kp1HelloGreetingsLessonVoiceoverSpans : [],
        )}
        totalFrames={completeKp1HelloGreetingsLessonDuration}
      />
      <LessonSfxLayer events={sfxEvents} />

      <Sequence from={cues.intro.startFrame + INTRO_STING_OFFSET_FRAMES}>
        <Html5Audio
          src={mediaSrc("audio/_stings/kids-section-lift.wav")}
          volume={INTRO_STING_VOLUME}
        />
      </Sequence>

      <Sequence from={cues.recap.startFrame + OUTRO_RESOLVE_OFFSET_FRAMES}>
        <Html5Audio
          src={mediaSrc("audio/_stings/kids-outro-resolve.wav")}
          volume={OUTRO_RESOLVE_VOLUME}
        />
      </Sequence>

      {showCaptions ? (
        <LessonCaptionLayer cues={kp1HelloGreetingsLessonCaptionCues} />
      ) : null}
    </AbsoluteFill>
  );
};
