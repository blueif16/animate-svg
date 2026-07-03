// kptest-count-to-two — Complete composition wrapper (Wave 4a composer).
// Composes the scene + v4 per-cue voice + caption + bed + SFX layers.
// Registration: exports `lessonComposition` for auto-discovery by `lessons:registry`.
// DO NOT hand-edit src/Root.tsx — auto-discovered, conflict-free.
//
// Audio is FROZEN after Wave 3a: the per-cue clips are the canonical narration.
// SFX frames derive from cue starts + layout.ts offsets (no frame literals).
// The intro sting (audio-cues.json intro.sting = "mandarin-accent") and
// outro resolve play on top of the bed.

import React from "react";
import { AbsoluteFill, Html5Audio, Sequence } from "remotion";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonBgmLayer } from "../lesson-media/LessonBgmLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { LessonSfxLayer, type SfxEvent } from "../lesson-media/LessonSfxLayer";
import { spansToWindows } from "../lesson-media/audioMix";
import { mediaSrc } from "../lesson-media/mediaSrc";
import type { LessonComposition } from "./lessonRegistryTypes";
import { KptestCountToTwoLessonScene } from "./kptestCountToTwoLessonScene";
import {
  kptestCountToTwoCues,
  kptestCountToTwoDuration,
  kptestCountToTwoLessonCaptionCues,
  kptestCountToTwoVoiceClips,
} from "./kptestCountToTwoLessonTimeline";
import { cueMap } from "./timingTypes";
import {
  APPLE_1_POPIN_REL_START,
  APPLE_2_POPIN_REL_START,
  CARDINAL_SPARKLE_REL_START,
  SFX_APPLE_POP_OFFSET,
  SFX_CARDINAL_REWARD_OFFSET,
  SFX_TAG_POP_OFFSET,
  TAG_1_POPIN_REL_START,
  TAG_2_POPIN_REL_START,
} from "./kptestCountToTwo/layout";
import audioCuesRaw from "../../lesson-data/kptest-count-to-two/audio-cues.json";

// ─── AUDIO CUES (keyed values from audio-cues.json) ──────────────────────────
const audioCues = audioCuesRaw as {
  bed: string;
  intro: { sting: string };
  outro: { resolve: boolean };
  sfx: Array<{ cue: string; event: string; sound: string }>;
};
const BED_KEY = audioCues.bed;

// ─── CUE MAP ─────────────────────────────────────────────────────────────────
const c = cueMap(kptestCountToTwoCues);
const cStart = (id: string): number => c[id]?.startFrame ?? 0;

// ─── VOICE-OVER SPANS for bed-duck windows (mechanical envelope) ────────────
const voiceoverSpans: Array<[number, number]> = kptestCountToTwoVoiceClips.map(
  (clip) => [clip.fromFrame, clip.fromFrame + clip.durationInFrames],
);

// ─── SFX EVENTS (composer-owned frames from audio-cues.json + layout.ts) ────
// Each fromFrame = cues[id].startFrame + named layout offset (NEVER a literal).
// Per audio-cues.json: C4 fires a "ta-da" reward at the cardinal reveal moment.
const sfxEvents: SfxEvent[] = [
  // C2: apple 1 pops as it lands
  {
    sound: "pop",
    fromFrame: cStart("first-apple-one") + APPLE_1_POPIN_REL_START + SFX_APPLE_POP_OFFSET,
    volume: 0.5,
  },
  // C2: tag 1 pops as it attaches
  {
    sound: "pop",
    fromFrame: cStart("first-apple-one") + TAG_1_POPIN_REL_START + SFX_TAG_POP_OFFSET,
    volume: 0.5,
  },
  // C3: apple 2 pops as it lands
  {
    sound: "pop",
    fromFrame: cStart("second-apple-two") + APPLE_2_POPIN_REL_START + SFX_APPLE_POP_OFFSET,
    volume: 0.5,
  },
  // C3: tag 2 pops as it attaches
  {
    sound: "pop",
    fromFrame: cStart("second-apple-two") + TAG_2_POPIN_REL_START + SFX_TAG_POP_OFFSET,
    volume: 0.5,
  },
  // C4: ta-da reward at the cardinal bouncy peak (audio-cues.json)
  {
    sound: "ta-da",
    fromFrame: cStart("cardinality") + SFX_CARDINAL_REWARD_OFFSET,
    volume: 0.55,
  },
];

// ─── INTRO / OUTRO STINGS (audio-cues.json → composer-owned frames) ─────────
// Intro section-lift sting (intro.sting = "mandarin-accent") — fires 2 frames
// after the lesson starts as a calm rise.
const INTRO_STING_OFFSET_FRAMES = 2;
const INTRO_STING_VOLUME = 0.45;

// Outro resolve (outro.resolve = true) — fires near the end of the cardinality
// cue as a soft resolve on the resolved "cardinal 2" state.
const OUTRO_RESOLVE_OFFSET_FRAMES =
  Math.max(0, c["cardinality"]?.endFrame ?? 0) -
  (c["cardinality"]?.startFrame ?? 0) -
  18; // ~0.6s before cue end
const OUTRO_RESOLVE_VOLUME = 0.5;

// ─── COMPOSITION ─────────────────────────────────────────────────────────────

export const CompleteKptestCountToTwoLesson: React.FC = () => (
  <AbsoluteFill>
    <KptestCountToTwoLessonScene cues={kptestCountToTwoCues} />
    <LessonAudioLayer voiceClips={kptestCountToTwoVoiceClips} />
    <LessonCaptionLayer cues={kptestCountToTwoLessonCaptionCues} />
    <LessonBgmLayer
      bed={BED_KEY}
      totalFrames={kptestCountToTwoDuration}
      windows={spansToWindows(voiceoverSpans)}
    />
    <LessonSfxLayer events={sfxEvents} />

    {/* Intro sting — calm rise as the lesson opens. */}
    <Sequence
      from={cStart("lesson-intro") + INTRO_STING_OFFSET_FRAMES}
    >
      <Html5Audio
        src={mediaSrc("audio/_stings/kids-section-lift.wav")}
        volume={INTRO_STING_VOLUME}
      />
    </Sequence>

    {/* Outro resolve — soft rising swell over the cardinal-2 close. */}
    <Sequence from={cStart("cardinality") + OUTRO_RESOLVE_OFFSET_FRAMES}>
      <Html5Audio
        src={mediaSrc("audio/_stings/kids-outro-resolve.wav")}
        volume={OUTRO_RESOLVE_VOLUME}
      />
    </Sequence>
  </AbsoluteFill>
);

export const completeKptestCountToTwoLessonDefaultProps: Record<
  string,
  unknown
> = {};

// ─── REGISTRATION DESCRIPTOR (auto-discovered by lessons:registry) ───────────
export const lessonComposition: LessonComposition = {
  id: "CompleteKptestCountToTwoLesson",
  component: CompleteKptestCountToTwoLesson,
  durationInFrames: kptestCountToTwoDuration,
  defaultProps: completeKptestCountToTwoLessonDefaultProps,
};

// Suppress unused-import warning for CARDINAL_SPARKLE_REL_START — the SFX uses
// SFX_CARDINAL_REWARD_OFFSET which is defined as the same constant.
void CARDINAL_SPARKLE_REL_START;