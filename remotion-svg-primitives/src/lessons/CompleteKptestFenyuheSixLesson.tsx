// kptest-fenyuhe-six — Complete composition wrapper.
//
// v4 cue-anchored audio: 6 cues with one measured voice clip each (the
// reconcile chains them). The Complete wrapper mounts:
//   - LessonAudioLayer (per-cue voice clips; one <Sequence from={fromFrame}>
//     per clip — the kit mounts them automatically)
//   - LessonBgmLayer (mechanical ducked bed, derived from voice spans)
//   - LessonSfxLayer (composer-owned SFX frames from audio-cues.json)
//   - LessonCaptionLayer (caption ribbon from the reconciled captions)
//
// Audio is FROZEN after Wave 3a: the per-cue clips are the canonical
// narration. SFX frames derive from cue starts + layout.ts offsets (no
// frame literals). The intro sting and outro resolve play on top.

import { AbsoluteFill, Html5Audio, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonBgmLayer } from "../lesson-media/LessonBgmLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { LessonSfxLayer, type SfxEvent } from "../lesson-media/LessonSfxLayer";
import { spansToWindows } from "../lesson-media/audioMix";
import { mediaSrc } from "../lesson-media/mediaSrc";
import { KptestFenyuheSixLessonScene } from "./kptestFenyuheSixLessonScene";
import {
  kptestFenyuheSixCues,
  kptestFenyuheSixDuration,
  kptestFenyuheSixLessonCaptionCues,
  kptestFenyuheSixVoiceClips,
} from "./kptestFenyuheSixLessonTimeline";
import { cueMap } from "./timingTypes";
import {
  CLIMAX_GLIN_DURATION_FRAMES,
  RECAP_BEAT_ONE_AND_FIVE_FRAMES,
  RECAP_BEAT_THREE_AND_THREE_FRAMES,
  RECAP_BEAT_TWO_AND_FOUR_FRAMES,
  SPLIT_MOTION_DURATION_FRAMES,
  SPLIT_START_FRAMES,
} from "./kptestFenyuheSix/layout";

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
  // Per audio-cues.json: split-3-and-3 fires a "ta-da" reward at the
  // climax; recap fires a "chime" at its start. Every fromFrame derives
  // from cue starts + layout.ts offsets.
  const sfxEvents: SfxEvent[] = [
    {
      sound: "ta-da",
      fromFrame:
        cues["split-3-and-3"].startFrame +
        SPLIT_START_FRAMES +
        SPLIT_MOTION_DURATION_FRAMES,
      volume: 0.55,
    },
    {
      sound: "chime",
      fromFrame: cues["recap"].startFrame,
      volume: 0.5,
    },
  ];

  // Intro section-lift sting (audio-cues.json intro.sting = "mandarin-accent").
  // Fires 2 frames after the lesson starts — a calm rise as the lesson opens.
  const INTRO_STING_OFFSET_FRAMES = 2;
  const INTRO_STING_VOLUME = 0.45;

  // Outro resolve (audio-cues.json outro.resolve = true). Fires near the end
  // of the recap's last sub-beat.
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
        totalFrames={completeKptestFenyuheSixLessonDuration}
        windows={spansToWindows(voiceSpans)}
      />
      <LessonSfxLayer events={sfxEvents} />

      {/* Intro sting — calm rise as the lesson opens. */}
      <Sequence
        from={cues["routine-reprise"].startFrame + INTRO_STING_OFFSET_FRAMES}
      >
        <Html5Audio
          src={mediaSrc("audio/_stings/kids-section-lift.wav")}
          volume={INTRO_STING_VOLUME}
        />
      </Sequence>

      {/* Outro resolve — soft rising swell over the recap close. */}
      <Sequence
        from={cues["recap"].startFrame + OUTRO_RESOLVE_OFFSET_FRAMES}
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

// Suppress unused-import warnings for layout constants consumed only by the
// scene/manifest cross-references. The lesson does NOT re-introduce the v3
// REVEAL_ANSWER_THREE_THREE_DISPLAY_FRAMES / CUES constants — those belong
// to the old (pre-v4) timeline, replaced here by the v4 cue ids.
void CLIMAX_GLIN_DURATION_FRAMES;
