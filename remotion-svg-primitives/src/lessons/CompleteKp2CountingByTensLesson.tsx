// kp2-counting-by-tens — Complete composition wrapper (Wave 4a).
// Composes the scene + v4 per-cue voice + caption + bed + SFX layers.
// Registration: exports `lessonComposition` for auto-discovery by `lessons:registry`.

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
import { Kp2CountingByTensLessonScene } from "./kp2CountingByTensLessonScene";
import {
  kp2CountingByTensCues,
  kp2CountingByTensDuration,
  kp2CountingByTensVoiceClips,
  kp2CountingByTensLessonCaptionCues,
} from "./kp2CountingByTensLessonTimeline";
import {
  SLOW_BADGE_BASE_DELAY,
  SLOW_COUNT_STRIDE,
  FAST_ONE_BADGE_REL_START,
  TWO_BUNDLE_B_SLIDE_REL_START,
  THREE_BUNDLE_C_SLIDE_REL_START,
  RECAP_LABEL_FADE_REL_START,
} from "./kp2CountingByTens/layout";
import { cueMap } from "@studio/narration-kit";

// ─── AUDIO CUES (keyed values from audio-cues.json) ─────────────────────────
const BED_KEY = "math-calm-68-cmaj";

// ─── CUE MAP ─────────────────────────────────────────────────────────────────
const c = cueMap(kp2CountingByTensCues);
const cStart = (id: string): number => c[id]?.startFrame ?? 0;

// ─── VOICE-OVER SPANS for bed-duck windows ────────────────────────────────────
const voiceoverSpans = kp2CountingByTensVoiceClips.map((clip) => [
  clip.fromFrame,
  clip.fromFrame + clip.durationInFrames,
] as [number, number]);

// ─── SFX EVENTS ──────────────────────────────────────────────────────────────
// Per audio-cues.json. Frames = cueStart + named layout offset (NEVER literals).
const sfxEvents: SfxEvent[] = [
  // bundle-recall: pop when bundle is shown
  {
    sound: "pop",
    fromFrame: cStart("bundle-recall"),
  },
  // untie-reveal: whoosh transition
  {
    sound: "whoosh",
    fromFrame: cStart("untie-reveal"),
  },
  // slow-count-ones: tick sound per active step with rising pitch
  ...Array.from({ length: 10 }, (_, index) => ({
    sound: "tick" as "pop",
    fromFrame: cStart("slow-count-ones") + SLOW_BADGE_BASE_DELAY + index * SLOW_COUNT_STRIDE,
    semitones: index * 2, // rising pitch
  })),
  // fast-vs-slow: sparkle at climax badge pop
  {
    sound: "sparkle",
    fromFrame: cStart("fast-vs-slow") + FAST_ONE_BADGE_REL_START,
  },
  // two-tens: pop as bundle B slides in
  {
    sound: "pop",
    fromFrame: cStart("two-tens") + TWO_BUNDLE_B_SLIDE_REL_START,
  },
  // three-tens: pop as bundle C slides in
  {
    sound: "pop",
    fromFrame: cStart("three-tens") + THREE_BUNDLE_C_SLIDE_REL_START,
  },
  // recap: ta-da at takeaway start
  {
    sound: "ta-da",
    fromFrame: cStart("recap") + RECAP_LABEL_FADE_REL_START,
  },
];

// ─── COMPOSITION ─────────────────────────────────────────────────────────────
export const CompleteKp2CountingByTensLesson: React.FC = () => (
  <AbsoluteFill>
    <Kp2CountingByTensLessonScene cues={kp2CountingByTensCues} />
    <LessonAudioLayer voiceClips={kp2CountingByTensVoiceClips} />
    <LessonCaptionLayer cues={kp2CountingByTensLessonCaptionCues} />
    <LessonBgmLayer
      bed={BED_KEY}
      windows={spansToWindows(voiceoverSpans)}
      totalFrames={kp2CountingByTensDuration}
    />
    <LessonSfxLayer events={sfxEvents} />
  </AbsoluteFill>
);

export const completeKp2CountingByTensLessonDefaultProps: Record<
  string,
  unknown
> = {};

const lessonComp: LessonComposition = {
  id: "CompleteKp2CountingByTensLesson",
  component: CompleteKp2CountingByTensLesson,
  durationInFrames: kp2CountingByTensDuration,
  defaultProps: completeKp2CountingByTensLessonDefaultProps,
};
export { lessonComp as lessonComposition };
