// kptest-first-second-third — Complete composition wrapper (Wave 4a).
// Composes the scene + v4 per-cue voice + caption + bed + SFX layers.
// Registration: exports `lessonComposition` for auto-discovery by `lessons:registry`.
// DO NOT hand-edit src/Root.tsx — auto-discovered, conflict-free.

import React from "react";
import { AbsoluteFill } from "remotion";
import type { SfxEvent } from "../lesson-media/LessonSfxLayer";
import {
  LessonAudioLayer,
  LessonBgmLayer,
  LessonCaptionLayer,
  LessonSfxLayer,
} from "../lesson-media/components";
import { spansToWindows } from "../lesson-media/audioMix";
import type { LessonComposition } from "./lessonRegistryTypes";
import { KptestFirstSecondThirdLessonScene } from "./kptestFirstSecondThirdLessonScene";
import {
  kptestFirstSecondThirdCues,
  kptestFirstSecondThirdDuration,
  kptestFirstSecondThirdVoiceClips,
  kptestFirstSecondThirdLessonCaptionCues,
} from "./kptestFirstSecondThirdLessonTimeline";
import {
  SWEEP_STEP_FRAMES,
  SFX_POPIN_OFFSET,
  SFX_CHIP_POPIN_OFFSET,
  SFX_REWARD_OFFSET,
  SFX_ASK_POPIN_OFFSET,
} from "./kptestFirstSecondThird/layout";
import { cueMap } from "@studio/narration-kit";

// ─── AUDIO CUES (keyed values from audio-cues.json) ─────────────────────────
const BED_KEY = "math-calm-68-cmaj";

// ─── CUE MAP ─────────────────────────────────────────────────────────────────
const c = cueMap(kptestFirstSecondThirdCues);

const cStart = (id: string): number => c[id]?.startFrame ?? 0;

// ─── VOICE-OVER SPANS for bed-duck windows ────────────────────────────────────
// Build spans from the voice clips: [fromFrame, fromFrame + durationInFrames]
const voiceoverSpans = kptestFirstSecondThirdVoiceClips.map((clip) => [
  clip.fromFrame,
  clip.fromFrame + clip.durationInFrames,
] as [number, number]);

// ─── SFX EVENTS ──────────────────────────────────────────────────────────────
// Per audio-cues.json. Frames = cueStart + named layout offset (NEVER literals).

const sfxEvents: SfxEvent[] = [
  // arrive-first: pop at animal walk-in settle
  {
    sound: "pop",
    fromFrame: cStart("arrive-first") + SFX_POPIN_OFFSET + 54, // settle frame
  },
  // name-first: pop-2 when chip attaches
  {
    sound: "pop",
    fromFrame: cStart("name-first") + SFX_CHIP_POPIN_OFFSET,
  },
  // arrive-second: pop at animal settle
  {
    sound: "pop",
    fromFrame: cStart("arrive-second") + SFX_POPIN_OFFSET + 54,
  },
  // count-second: woodblock per step (2 steps, rising pitch)
  {
    sound: "woodblock-count" as "pop", // key per audio-cues.json
    fromFrame: cStart("count-second") + SWEEP_STEP_FRAMES * 0,
    semitones: 0,
  },
  {
    sound: "woodblock-count" as "pop",
    fromFrame: cStart("count-second") + SWEEP_STEP_FRAMES * 1,
    semitones: 2,
  },
  // arrive-third: pop at animal settle
  {
    sound: "pop",
    fromFrame: cStart("arrive-third") + SFX_POPIN_OFFSET + 54,
  },
  // count-third: woodblock per step (3 steps, rising pitch)
  {
    sound: "woodblock-count" as "pop",
    fromFrame: cStart("count-third") + SWEEP_STEP_FRAMES * 0,
    semitones: 0,
  },
  {
    sound: "woodblock-count" as "pop",
    fromFrame: cStart("count-third") + SWEEP_STEP_FRAMES * 1,
    semitones: 2,
  },
  {
    sound: "woodblock-count" as "pop",
    fromFrame: cStart("count-third") + SWEEP_STEP_FRAMES * 2,
    semitones: 4,
  },
  // ask-second: pop as affordance pops in
  {
    sound: "pop",
    fromFrame: cStart("ask-second") + SFX_ASK_POPIN_OFFSET,
  },
  // reveal-second: ta-da on chip glow-pulse
  {
    sound: "ta-da",
    fromFrame: cStart("reveal-second") + SFX_REWARD_OFFSET,
  },
  // ask-third: pop as affordance pops in
  {
    sound: "pop",
    fromFrame: cStart("ask-third") + SFX_ASK_POPIN_OFFSET,
  },
  // reveal-third: chime on chip glow-pulse
  {
    sound: "chime",
    fromFrame: cStart("reveal-third") + SFX_REWARD_OFFSET,
  },
  // recap-count: woodblock per step (3 steps, rising pitch)
  {
    sound: "woodblock-count" as "pop",
    fromFrame: cStart("recap-count") + SWEEP_STEP_FRAMES * 0,
    semitones: 0,
  },
  {
    sound: "woodblock-count" as "pop",
    fromFrame: cStart("recap-count") + SWEEP_STEP_FRAMES * 1,
    semitones: 2,
  },
  {
    sound: "woodblock-count" as "pop",
    fromFrame: cStart("recap-count") + SWEEP_STEP_FRAMES * 2,
    semitones: 4,
  },
];

// ─── COMPOSITION ─────────────────────────────────────────────────────────────

export const CompleteKptestFirstSecondThirdLesson: React.FC = () => (
  <AbsoluteFill>
    <KptestFirstSecondThirdLessonScene cues={kptestFirstSecondThirdCues} />
    <LessonAudioLayer voiceClips={kptestFirstSecondThirdVoiceClips} />
    <LessonCaptionLayer cues={kptestFirstSecondThirdLessonCaptionCues} />
    <LessonBgmLayer
      bed={BED_KEY}
      windows={spansToWindows(voiceoverSpans)}
      totalFrames={kptestFirstSecondThirdDuration}
    />
    <LessonSfxLayer events={sfxEvents} />
  </AbsoluteFill>
);

export const completeKptestFirstSecondThirdLessonDefaultProps: Record<
  string,
  unknown
> = {};

// ─── REGISTRATION DESCRIPTOR (auto-discovered by lessons:registry) ───────────
export const lessonComposition: LessonComposition = {
  id: "CompleteKptestFirstSecondThirdLesson",
  component: CompleteKptestFirstSecondThirdLesson,
  durationInFrames: kptestFirstSecondThirdDuration,
  defaultProps: completeKptestFirstSecondThirdLessonDefaultProps,
};
