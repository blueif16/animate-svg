// kptest-fenyuhe-six — Complete composition wrapper.
//
// Wraps the lesson scene with the v4 cue-anchored audio layers:
//   - LessonAudioLayer (per-cue voice clips; one <Sequence from={fromFrame}>
//     per clip — the kit mounts them automatically)
//   - LessonBgmLayer (mechanical ducked bed, derived from voice spans)
//   - LessonSfxLayer (composer-owned SFX frames from audio-cues.json)
//   - LessonCaptionLayer (caption ribbon from the reconciled captions)
//
// Audio is FROZEN after Wave 3a: the per-cue clips are the canonical
// narration. SFX frames derive from cue starts + layout.ts offsets (no
// frame literals). The intro sting and outro resolve play on top.

import { AbsoluteFill, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonBgmLayer } from "../lesson-media/LessonBgmLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { LessonSfxLayer, type SfxEvent } from "../lesson-media/LessonSfxLayer";
import { spansToWindows } from "../lesson-media/audioMix";
import { Html5Audio } from "remotion";
import { mediaSrc } from "../lesson-media/mediaSrc";
import { KptestFenyuheSixLessonScene } from "./kptestFenyuheSixLessonScene";
import {
  kptestFenyuheSixCues,
  kptestFenyuheSixDuration,
  kptestFenyuheSixLessonCaptionCues,
  kptestFenyuheSixVoiceClips,
} from "./kptestFenyuheSixLessonTimeline";
import { cueMap } from "./timingTypes";
import { ANNOUNCE_TITLE_DURATION_FRAMES, REVEAL_ANSWER_THREE_THREE_DISPLAY_FRAMES, RECAP_BEAT_ONE_AND_FIVE_FRAMES, RECAP_BEAT_TWO_AND_FOUR_FRAMES, RECAP_BEAT_THREE_AND_THREE_FRAMES } from "./kptestFenyuheSix/layout";

export type CompleteKptestFenyuheSixLessonProps = {
  showCaptions?: boolean;
  // v4: voice is per-cue clips (kptestFenyuheSixVoiceClips). This toggles
  // the whole voice track off for a silent preview.
  playVoice?: boolean;
};

export const completeKptestFenyuheSixLessonDefaultProps: CompleteKptestFenyuheSixLessonProps =
  {
    showCaptions: true,
    playVoice: true,
  };

export const completeKptestFenyuheSixLessonDuration = kptestFenyuheSixDuration;

export const CompleteKptestFenyuheSixLesson = ({
  showCaptions = true,
  playVoice = true,
}: CompleteKptestFenyuheSixLessonProps) => {
  const cues = cueMap(kptestFenyuheSixCues);
  const voiceClips = playVoice ? kptestFenyuheSixVoiceClips : [];
  // Bed-duck windows derived from the per-cue clip spans.
  const voiceSpans: Array<[number, number]> = voiceClips.map(
    (c): [number, number] => [c.fromFrame, c.fromFrame + c.durationInFrames],
  );

  // ---- SFX events (audio-cues.json → composer-owned frames) ----
  // Every fromFrame derives from cue starts + layout.ts offsets.
  // Per audio-cues.json: cue-announce-split-1of5 fires a "pop" on the
  // bond-glyph "一和五" appearance; cue-reveal-answer fires a "ta-da" on
  // the 3|3 answer reveal.
  const sfxEvents: SfxEvent[] = [];

  // SFX #1: pop on the bond "一和五" entrance (cue-announce-split-1of5's
  // bond phase begins at title-end). The bond phase is the model's
  // audible "一和五" spoken word; the pop accents its appearance.
  sfxEvents.push({
    sound: "pop",
    fromFrame:
      cues["cue-announce-split-1of5"].startFrame +
      ANNOUNCE_TITLE_DURATION_FRAMES,
    volume: 0.5,
  });

  // SFX #2: ta-da on the 3|3 reveal-answer midpoint (the highlight
  // moment per visual-design §2 "single transient sunshine highlight at
  // midpoint").
  sfxEvents.push({
    sound: "ta-da",
    fromFrame:
      cues["cue-reveal-answer"].startFrame +
      Math.floor(REVEAL_ANSWER_THREE_THREE_DISPLAY_FRAMES / 2),
    volume: 0.55,
  });

  // Intro section-lift sting (audio-cues.json intro.sting = "mandarin-accent").
  // Fires 2 frames after the lesson starts — a calm rise as the lesson opens.
  const INTRO_STING_OFFSET_FRAMES = 2;
  const INTRO_STING_VOLUME = 0.45;

  // Outro resolve (audio-cues.json outro.resolve = true). The recap is
  // the lesson's closing arc; the resolve fires near the end of the
  // recap's last sub-beat.
  const OUTRO_RESOLVE_OFFSET_FRAMES =
    RECAP_BEAT_ONE_AND_FIVE_FRAMES +
    RECAP_BEAT_TWO_AND_FOUR_FRAMES +
    RECAP_BEAT_THREE_AND_THREE_FRAMES -
    6;
  const OUTRO_RESOLVE_VOLUME = 0.5;

  return (
    <AbsoluteFill>
      <Sequence durationInFrames={completeKptestFenyuheSixLessonDuration}>
        <KptestFenyuheSixLessonScene />
      </Sequence>

      <LessonAudioLayer voiceClips={voiceClips} />

      <LessonBgmLayer
        bed="math-calm-68-cmaj"
        windows={spansToWindows(voiceSpans)}
        totalFrames={completeKptestFenyuheSixLessonDuration}
      />
      <LessonSfxLayer events={sfxEvents} />

      {/* Intro sting — calm rise as the lesson opens. */}
      <Sequence
        from={cues["cue-announce-split-1of5"].startFrame + INTRO_STING_OFFSET_FRAMES}
      >
        <Html5Audio
          src={mediaSrc("audio/_stings/kids-section-lift.wav")}
          volume={INTRO_STING_VOLUME}
        />
      </Sequence>

      {/* Outro resolve — soft rising swell over the recap close. */}
      <Sequence
        from={cues["cue-spaced-recap-all-three"].startFrame + OUTRO_RESOLVE_OFFSET_FRAMES}
      >
        <Html5Audio
          src={mediaSrc("audio/_stings/kids-outro-resolve.wav")}
          volume={OUTRO_RESOLVE_VOLUME}
        />
      </Sequence>

      {showCaptions ? (
        <LessonCaptionLayer cues={kptestFenyuheSixLessonCaptionCues} />
      ) : null}
    </AbsoluteFill>
  );
};

// Lesson registration descriptor — auto-discovered by `npm run lessons:registry`.
// Stays in this file (not a hand-edit to src/Root.tsx) per the W4a contract.
import type { LessonComposition } from "./lessonRegistryTypes";
export const lessonComposition: LessonComposition = {
  id: "CompleteKptestFenyuheSixLesson",
  component: CompleteKptestFenyuheSixLesson,
  durationInFrames: kptestFenyuheSixDuration,
  defaultProps: completeKptestFenyuheSixLessonDefaultProps,
};
