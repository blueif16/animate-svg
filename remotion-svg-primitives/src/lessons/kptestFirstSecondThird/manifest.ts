// kptest-first-second-third — bbox manifest (pure TS, no React/Remotion).
// Mirrors the scene's opacity gates and geometry, wired to the SAME layout.ts
// constants — "same in → same out." bboxAt(frame) returns null when opacity = 0.
//
// Zones used:
//   objects  — animals, flag, ground line (the queue)
//   labels   — ordinal chips, intro card text
//   marks    — sweep finger, your-turn affordance (zone-marks, full-bleed allowed)
//   decoration — background fills, ground line stroke

import { cueMap } from "@studio/narration-kit";
import type {
  Bbox,
  KeyFrame,
  LessonManifest,
  SceneElement,
} from "../manifestTypes";
import { kptestFirstSecondThirdCues } from "../kptestFirstSecondThirdLessonTimeline";
import {
  ANIMAL_CX,
  ANIMAL_CY,
  ANIMAL_H,
  ANIMAL_STEP_FORWARD_DX,
  ANIMAL_W,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CHIP_H,
  CHIP_W,
  CHIP_Y,
  CHIP_ATTACH_REL_NAME_FIRST,
  CHIP_ATTACH_REL_COUNT,
  FLAG_CX,
  FLAG_CY,
  FLAG_H,
  FLAG_W,
  INTRO_CARD_CX,
  INTRO_CARD_CY,
  INTRO_REVEAL_START_REL,
  INTRO_REVEAL_DUR,
  REVEAL_STEP_FORWARD_REL,
  REVEAL_STEP_FORWARD_DUR,
  REVEAL_STEP_DWELL,
  REVEAL_STEP_BACK_REL_OFFSET,
  REVEAL_STEP_BACK_DUR,
  ANIMAL_WALK_REL_START,
  ANIMAL_WALK_DUR,
  ANIMAL_WALK_ENTER_FROM_X,
  SWEEP_STEP_FRAMES,
  ZONE_CAPTION,
  ZONE_CHIPS,
  ZONE_OBJECTS,
} from "./layout";

const cues = cueMap(kptestFirstSecondThirdCues);

// Helper: linear interpolate, clamped
const lerp = (t: number, from: number, to: number): number =>
  from + Math.min(1, Math.max(0, t)) * (to - from);

// Helper: progress within a [start, end] frame window, clamped 0..1
const progressIn = (frame: number, start: number, end: number): number =>
  Math.min(1, Math.max(0, (frame - start) / Math.max(1, end - start)));

// Load-bearing elements: the 3 animals, 3 chips, the flag, the intro card.

// ─── INTRO CARD ───────────────────────────────────────────────
const INTRO_CARD_W = 760;
const INTRO_CARD_H = 320;

const introCardElement: SceneElement = {
  id: "intro-card",
  zone: "labels",
  bboxAt: (frame) => {
    const c = cues["intro"];
    if (!c) return null;
    const revealStart = c.startFrame + INTRO_REVEAL_START_REL;
    const p = progressIn(frame, revealStart, revealStart + INTRO_REVEAL_DUR);
    if (p === 0) return null;
    // Card is time-disjoint: gone by end of intro cue (never overlaps queue)
    if (frame > c.endFrame) return null;
    const bbox: Bbox = [
      INTRO_CARD_CX - INTRO_CARD_W / 2,
      INTRO_CARD_CY - INTRO_CARD_H / 2,
      INTRO_CARD_W,
      INTRO_CARD_H,
    ];
    return { bbox, opacity: p };
  },
};

// ─── FLAG ─────────────────────────────────────────────────────
const flagElement: SceneElement = {
  id: "flag",
  zone: "objects",
  bboxAt: (frame) => {
    const arriveCue = cues["arrive-first"];
    if (!arriveCue) return null;
    // Flag is present from arrive-first onwards
    if (frame < arriveCue.startFrame) return null;
    const bbox: Bbox = [
      FLAG_CX - FLAG_W / 2,
      FLAG_CY - FLAG_H / 2,
      FLAG_W,
      FLAG_H,
    ];
    return { bbox, opacity: 1 };
  },
};

// ─── ANIMALS ─────────────────────────────────────────────────
// Animal walk-in: arrives from stage right
const makeAnimalElement = (
  idx: number,
  arriveCueId: string,
  revealCueId: string | null,
): SceneElement => ({
  id: `animal-${idx + 1}`,
  zone: "objects",
  bboxAt: (frame) => {
    const arriveCue = cues[arriveCueId];
    if (!arriveCue) return null;
    if (frame < arriveCue.startFrame) return null;

    const targetX = ANIMAL_CX[idx];
    const walkStart = arriveCue.startFrame + ANIMAL_WALK_REL_START;
    const walkEnd = walkStart + ANIMAL_WALK_DUR;

    let animalX: number;
    if (frame < walkStart) {
      return null; // not yet visible
    } else if (frame <= walkEnd) {
      // Walking in from stage right
      const t = progressIn(frame, walkStart, walkEnd);
      animalX = lerp(t, ANIMAL_WALK_ENTER_FROM_X, targetX);
    } else {
      animalX = targetX;
    }

    // Reveal step-forward: animal steps ahead of line
    if (revealCueId) {
      const revealCue = cues[revealCueId];
      if (revealCue) {
        const stepFwdStart = revealCue.startFrame + REVEAL_STEP_FORWARD_REL;
        const stepFwdEnd = stepFwdStart + REVEAL_STEP_FORWARD_DUR;
        const stepBackStart = revealCue.startFrame + REVEAL_STEP_BACK_REL_OFFSET;
        const stepBackEnd = stepBackStart + REVEAL_STEP_BACK_DUR;

        if (frame >= stepFwdStart && frame < stepBackEnd) {
          const dwellEnd = stepFwdStart + REVEAL_STEP_FORWARD_DUR + REVEAL_STEP_DWELL;
          if (frame <= stepFwdEnd) {
            const t = progressIn(frame, stepFwdStart, stepFwdEnd);
            animalX = targetX - lerp(t, 0, ANIMAL_STEP_FORWARD_DX);
          } else if (frame <= dwellEnd) {
            animalX = targetX - ANIMAL_STEP_FORWARD_DX;
          } else if (frame >= stepBackStart && frame <= stepBackEnd) {
            const t = progressIn(frame, stepBackStart, stepBackEnd);
            animalX = targetX - lerp(1 - t, 0, ANIMAL_STEP_FORWARD_DX);
          } else {
            animalX = targetX - ANIMAL_STEP_FORWARD_DX;
          }
        }
      }
    }

    const bbox: Bbox = [
      animalX - ANIMAL_W / 2,
      ANIMAL_CY - ANIMAL_H / 2,
      ANIMAL_W,
      ANIMAL_H,
    ];
    return { bbox, opacity: 1 };
  },
});

const animal1Element = makeAnimalElement(0, "arrive-first", "reveal-second");
const animal2Element = makeAnimalElement(1, "arrive-second", "reveal-second");
const animal3Element = makeAnimalElement(2, "arrive-third", "reveal-third");

// ─── CHIPS ────────────────────────────────────────────────────
// Each chip attaches at a cue-relative offset and persists
const makeChipElement = (
  idx: number,
  attachCueId: string,
  attachRelOffset: number,
): SceneElement => ({
  id: `chip-${idx + 1}`,
  zone: "labels",
  bboxAt: (frame) => {
    const attachCue = cues[attachCueId];
    if (!attachCue) return null;
    const attachFrame = attachCue.startFrame + attachRelOffset;
    if (frame < attachFrame) return null;
    const p = progressIn(frame, attachFrame, attachFrame + 9);
    const bbox: Bbox = [
      ANIMAL_CX[idx] - CHIP_W / 2,
      CHIP_Y - CHIP_H / 2,
      CHIP_W,
      CHIP_H,
    ];
    return { bbox, opacity: p };
  },
});

const chip1Element = makeChipElement(0, "name-first", CHIP_ATTACH_REL_NAME_FIRST);
const chip2Element = makeChipElement(1, "count-second", CHIP_ATTACH_REL_COUNT);
const chip3Element = makeChipElement(2, "count-third", CHIP_ATTACH_REL_COUNT);

// ─── KEY FRAMES ───────────────────────────────────────────────
const keyFrames: readonly KeyFrame[] = [
  {
    id: "intro-full",
    cueId: "intro",
    offset: INTRO_REVEAL_DUR + 6,
    label: "intro card fully visible",
  },
  {
    id: "arrive-first-settled",
    cueId: "arrive-first",
    offset: 63,
    label: "animal 1 settled at flag",
  },
  {
    id: "name-first-chip",
    cueId: "name-first",
    offset: CHIP_ATTACH_REL_NAME_FIRST + 15,
    label: "第一 chip attached and held",
  },
  {
    id: "count-second-chip",
    cueId: "count-second",
    offset: CHIP_ATTACH_REL_COUNT + 15,
    label: "第二 chip attaches",
  },
  {
    id: "count-third-chip",
    cueId: "count-third",
    offset: CHIP_ATTACH_REL_COUNT + SWEEP_STEP_FRAMES * 2 + 15,
    label: "第三 chip attaches",
  },
  {
    id: "ask-second-affordance",
    cueId: "ask-second",
    offset: 15,
    label: "your-turn affordance visible",
  },
  {
    id: "reveal-second-peak",
    cueId: "reveal-second",
    offset: REVEAL_STEP_FORWARD_DUR + 15,
    label: "animal 2 stepped forward, chip pulsing",
  },
  {
    id: "ask-third-affordance",
    cueId: "ask-third",
    offset: 15,
    label: "your-turn affordance visible",
  },
  {
    id: "reveal-third-peak",
    cueId: "reveal-third",
    offset: REVEAL_STEP_FORWARD_DUR + 15,
    label: "animal 3 stepped forward, chip pulsing",
  },
  {
    id: "recap-count-mid",
    cueId: "recap-count",
    offset: 48 + 15,
    label: "recap sweep at 第二",
  },
];

// ─── MANIFEST ─────────────────────────────────────────────────
export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kptest-first-second-third",
  composition: "CompleteKptestFirstSecondThirdLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kptestFirstSecondThirdCues,
  keyFrames,
  elements: [
    introCardElement,
    flagElement,
    animal1Element,
    animal2Element,
    animal3Element,
    chip1Element,
    chip2Element,
    chip3Element,
  ],
  zones: {
    objects: [ZONE_OBJECTS.x, ZONE_OBJECTS.y, ZONE_OBJECTS.w, ZONE_OBJECTS.h],
    labels: [ZONE_CHIPS.x, ZONE_CHIPS.y, ZONE_CHIPS.w, ZONE_CHIPS.h],
    caption: [ZONE_CAPTION.x, ZONE_CAPTION.y, ZONE_CAPTION.w, ZONE_CAPTION.h],
  },
  // Intentional overlaps: none — zones are disjoint; intro card is time-disjoint
  allowedOverlaps: [],
};

