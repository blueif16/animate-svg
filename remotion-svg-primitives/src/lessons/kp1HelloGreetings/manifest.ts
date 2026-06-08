// kp1-hello-greetings — bbox manifest (pure TS, no React/Remotion).
//
// The single source of truth for what load-bearing element lives at which frame.
// Both the fast `lesson:check` collision pass and the contact-sheet frame picker
// import this. Every bboxAt(frame) mirrors the scene's opacity gates + geometry,
// wired to the SAME layout.ts constants the scene uses (same in → same out). If
// the scene drifts from this manifest, the check flags it — that is the point.
//
// Zones (manifestTypes.ZoneName, mapped onto this language lesson):
//   objects  — the teaching figures + their bubbles (the performed routine)
//   labels   — text marks: the intro card, the read-along rows, the name card
//   marks    — the recap emphasis pulse (zone-marks)

import type { AlignedLessonCue } from "@studio/narration-kit";
import { cueMap } from "@studio/narration-kit";
import type {
  Bbox,
  ElementSnapshot,
  KeyFrame,
  LessonManifest,
  SceneElement,
} from "../manifestTypes";
import { kp1HelloGreetingsCues } from "../kp1HelloGreetingsLessonTimeline";
import {
  BUBBLE_CY,
  BUBBLE_H,
  BUBBLE_W,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  EXCHANGE_REL_START,
  FACE_WIDTH,
  INTER_TURN_GAP,
  INTRO_CARD_DUR,
  INTRO_CARD_FADE_OUT_DUR,
  INTRO_CARD_REL_START,
  INTRO_CAST_DUR,
  INTRO_CAST_REL_START,
  KID_LEFT_CX,
  KID_RIGHT_CX,
  NAMECARD_H,
  NAMECARD_W,
  PER_TURN_FRAMES,
  READALONG_CY,
  READALONG_ITEM_GAP,
  READALONG_ITEM_RADIUS,
  READALONG_REL_START,
  READALONG_WORD_SIZE,
  RECAP_ARC_REL_START,
  RECAP_CY,
  RECAP_ITEM_RADIUS,
  RECAP_LINE_GAP,
  RECAP_PULSE_CX,
  RECAP_PULSE_CY,
  RECAP_PULSE_RADIUS,
  RECAP_PULSE_REL_START,
  RECAP_PULSE_SPREAD,
  STAGE_CX,
  STAGE_CY,
  TITLE_CX,
  TITLE_CY,
  TITLE_SIZE,
} from "./layout";

// ---------------------------------------------------------------------------
// Helpers — mirror the scene's clamp/reveal so opacity gates match exactly.
// ---------------------------------------------------------------------------
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const reveal = (frame: number, start: number, duration: number): number =>
  clamp01((frame - start) / Math.max(1, duration));

const centeredBox = (cx: number, cy: number, w: number, h: number): Bbox => [
  cx - w / 2,
  cy - h / 2,
  w,
  h,
];

const snapshot = (bbox: Bbox, opacity: number): ElementSnapshot | null => {
  if (opacity <= 0) return null;
  return { bbox, opacity: clamp01(opacity) };
};

// ---------------------------------------------------------------------------
// Cue lookups — must mirror the scene.
// ---------------------------------------------------------------------------
const cues = cueMap(kp1HelloGreetingsCues);
const cIntro = cues["intro"];
const cMeet = cues["meet-hello"];
const cSelf = cues["intro-self"];
const cPart = cues["part-goodbye"];
const cRecap = cues["recap"];

const cueActive = (cue: AlignedLessonCue, frame: number): boolean =>
  frame >= cue.startFrame && frame < cue.endFrame;

// ---------------------------------------------------------------------------
// Opacity mirrors of the scene.
// ---------------------------------------------------------------------------
const introCardOpacity = (frame: number): number => {
  const appear = reveal(
    frame,
    cIntro.startFrame + INTRO_CARD_REL_START,
    INTRO_CARD_DUR,
  );
  const fadeOut =
    1 -
    reveal(
      frame,
      cIntro.endFrame - INTRO_CARD_FADE_OUT_DUR,
      INTRO_CARD_FADE_OUT_DUR,
    );
  return clamp01(Math.min(appear, fadeOut));
};

const introCastOpacity = (frame: number): number => {
  if (frame >= cMeet.startFrame) return 0;
  return clamp01(
    reveal(frame, cIntro.startFrame + INTRO_CAST_REL_START, INTRO_CAST_DUR),
  );
};

// DialogueExchange figure-slot footprint (per side). The figure is FACE_WIDTH
// wide centered on the slot; the slot center is STAGE_CX ± SPEAKER_GAP/2.
const FIGURE_BOX_W = FACE_WIDTH;
const FIGURE_BOX_H = FACE_WIDTH; // square-ish face footprint

// Speech-bubble footprint for the active speaker of a turn. The bubble sits at
// BUBBLE_CY above the speaker's slot, nudged slightly inward (figureRadius*0.2).
const bubbleBox = (side: "left" | "right"): Bbox => {
  const slotCx = side === "left" ? KID_LEFT_CX : KID_RIGHT_CX;
  const inward = side === "left" ? 1 : -1;
  const bubbleCx = slotCx + inward * (FACE_WIDTH / 2) * 0.2;
  return centeredBox(bubbleCx, BUBBLE_CY, BUBBLE_W, BUBBLE_H);
};

// Read-along row footprint for n words at itemGap, centered on STAGE_CX. The
// height tracks the REAL swept-glyph row (word cap-height × the active swell),
// NOT the itemRadius cell — the cell radius only governs cursor/glow geometry,
// so using it would inflate the bbox into a phantom collision with the name
// card row directly above. width keeps the radius term (the end words extend a
// half-cell past their centers).
const readAlongRowBox = (
  n: number,
  itemGap: number,
  itemRadius: number,
  cy: number,
  glyphHeight = READALONG_WORD_SIZE * 1.32,
): Bbox => {
  const width = (n - 1) * itemGap + itemRadius * 2 + 24;
  return centeredBox(STAGE_CX, cy, width, glyphHeight);
};

// ---------------------------------------------------------------------------
// Elements
// ---------------------------------------------------------------------------
const elements: SceneElement[] = [
  // Intro topic card (zone-title / labels).
  {
    id: "intro-card",
    zone: "labels",
    bboxAt: (frame) => {
      const op = introCardOpacity(frame);
      // Card spans title + section eyebrow + teaser; ~3.6× titleSize tall.
      return snapshot(
        centeredBox(TITLE_CX, TITLE_CY, TITLE_SIZE * 8.4, TITLE_SIZE * 3.2),
        op,
      );
    },
  },
  // Intro cast — the two kid faces beneath the card (objects).
  {
    id: "kid-left",
    zone: "objects",
    bboxAt: (frame) => {
      // Cast reveal during intro; from meet-hello on, the exchange owns the
      // figure (registered separately as exchange-* / recap-cast).
      const op = introCastOpacity(frame);
      return snapshot(
        centeredBox(KID_LEFT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        op,
      );
    },
  },
  {
    id: "kid-right",
    zone: "objects",
    bboxAt: (frame) => {
      const op = introCastOpacity(frame);
      return snapshot(
        centeredBox(KID_RIGHT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        op,
      );
    },
  },

  // meet-hello — left kid figure + her "Hello!" bubble (objects).
  {
    id: "meet-figure-left",
    zone: "objects",
    bboxAt: (frame) => {
      if (!cueActive(cMeet, frame)) return null;
      const op = reveal(frame, cMeet.startFrame, 16);
      return snapshot(
        centeredBox(KID_LEFT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        op,
      );
    },
  },
  {
    id: "meet-figure-right",
    zone: "objects",
    bboxAt: (frame) => {
      if (!cueActive(cMeet, frame)) return null;
      const op = reveal(frame, cMeet.startFrame, 16);
      return snapshot(
        centeredBox(KID_RIGHT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        op,
      );
    },
  },
  {
    id: "meet-bubble",
    zone: "objects",
    bboxAt: (frame) => {
      const bubbleOpen = cMeet.startFrame + EXCHANGE_REL_START;
      if (!cueActive(cMeet, frame) || frame < bubbleOpen) return null;
      const op = reveal(frame, bubbleOpen, 10);
      return snapshot(bubbleBox("left"), op);
    },
  },

  // intro-self — both figures + boy reply bubble + "Sam" name card (objects/labels).
  {
    id: "self-figure-left",
    zone: "objects",
    bboxAt: (frame) => {
      if (!cueActive(cSelf, frame)) return null;
      return snapshot(
        centeredBox(KID_LEFT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        1,
      );
    },
  },
  {
    id: "self-figure-right",
    zone: "objects",
    bboxAt: (frame) => {
      if (!cueActive(cSelf, frame)) return null;
      return snapshot(
        centeredBox(KID_RIGHT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        1,
      );
    },
  },
  {
    id: "self-bubble",
    zone: "objects",
    bboxAt: (frame) => {
      const bubbleOpen = cSelf.startFrame + EXCHANGE_REL_START;
      if (!cueActive(cSelf, frame) || frame < bubbleOpen) return null;
      const op = reveal(frame, bubbleOpen, 10);
      return snapshot(bubbleBox("right"), op);
    },
  },
  {
    id: "self-namecard",
    zone: "labels",
    bboxAt: (frame) => {
      const bubbleOpen = cSelf.startFrame + EXCHANGE_REL_START;
      if (!cueActive(cSelf, frame) || frame < bubbleOpen) return null;
      const op = reveal(frame, bubbleOpen, 10);
      // Name card drops below the right figure (figureBottom + NAMECARD_DROP).
      const cy = STAGE_CY + FACE_WIDTH / 2 + 40;
      return snapshot(centeredBox(KID_RIGHT_CX, cy, NAMECARD_W, NAMECARD_H), op);
    },
  },

  // part-goodbye — both figures + two farewell bubbles (objects).
  {
    id: "part-figure-left",
    zone: "objects",
    bboxAt: (frame) => {
      if (!cueActive(cPart, frame)) return null;
      return snapshot(
        centeredBox(KID_LEFT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        1,
      );
    },
  },
  {
    id: "part-figure-right",
    zone: "objects",
    bboxAt: (frame) => {
      if (!cueActive(cPart, frame)) return null;
      return snapshot(
        centeredBox(KID_RIGHT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        1,
      );
    },
  },
  {
    id: "part-bubble-left",
    zone: "objects",
    bboxAt: (frame) => {
      const bubbleOpen = cPart.startFrame + EXCHANGE_REL_START;
      if (!cueActive(cPart, frame) || frame < bubbleOpen) return null;
      const op = reveal(frame, bubbleOpen, 10);
      return snapshot(bubbleBox("left"), op);
    },
  },
  {
    id: "part-bubble-right",
    zone: "objects",
    bboxAt: (frame) => {
      // Turn 1 (right) opens after one whole turn step.
      const bubbleOpen =
        cPart.startFrame + EXCHANGE_REL_START + PER_TURN_FRAMES + INTER_TURN_GAP;
      if (!cueActive(cPart, frame) || frame < bubbleOpen) return null;
      const op = reveal(frame, bubbleOpen, 10);
      return snapshot(bubbleBox("right"), op);
    },
  },

  // recap — the two kids stay present (objects).
  {
    id: "recap-figure-left",
    zone: "objects",
    bboxAt: (frame) => {
      if (!cueActive(cRecap, frame)) return null;
      return snapshot(
        centeredBox(KID_LEFT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        1,
      );
    },
  },
  {
    id: "recap-figure-right",
    zone: "objects",
    bboxAt: (frame) => {
      if (!cueActive(cRecap, frame)) return null;
      return snapshot(
        centeredBox(KID_RIGHT_CX, STAGE_CY, FIGURE_BOX_W, FIGURE_BOX_H),
        1,
      );
    },
  },

  // Read-along rows (labels) — one per teaching cue.
  {
    id: "readalong-meet",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cMeet.startFrame + READALONG_REL_START;
      if (!cueActive(cMeet, frame) || frame < start) return null;
      const op = reveal(frame, start, 8);
      return snapshot(
        readAlongRowBox(1, READALONG_ITEM_GAP, READALONG_ITEM_RADIUS, READALONG_CY),
        op,
      );
    },
  },
  {
    id: "readalong-self",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cSelf.startFrame + 18;
      if (!cueActive(cSelf, frame) || frame < start) return null;
      const op = reveal(frame, start, 8);
      return snapshot(
        readAlongRowBox(3, READALONG_ITEM_GAP, READALONG_ITEM_RADIUS, READALONG_CY),
        op,
      );
    },
  },
  {
    id: "readalong-part",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cPart.startFrame + READALONG_REL_START;
      if (!cueActive(cPart, frame) || frame < start) return null;
      const op = reveal(frame, start, 8);
      return snapshot(
        readAlongRowBox(
          2,
          READALONG_ITEM_GAP + 80,
          READALONG_ITEM_RADIUS,
          READALONG_CY,
        ),
        op,
      );
    },
  },
  {
    id: "readalong-recap",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cRecap.startFrame + RECAP_ARC_REL_START;
      if (!cueActive(cRecap, frame) || frame < start) return null;
      const op = reveal(frame, start, 8);
      // Three stacked rows; height spans the two line gaps + the top/bottom item
      // radii + padding.
      const height = RECAP_LINE_GAP * 2 + RECAP_ITEM_RADIUS * 2 + 40;
      return snapshot(centeredBox(STAGE_CX, RECAP_CY, 540, height), op);
    },
  },

  // recap closing pulse (marks).
  {
    id: "recap-pulse",
    zone: "marks",
    bboxAt: (frame) => {
      const start = cRecap.startFrame + RECAP_PULSE_REL_START;
      if (!cueActive(cRecap, frame) || frame < start) return null;
      const r = RECAP_PULSE_RADIUS + RECAP_PULSE_SPREAD;
      return snapshot(centeredBox(RECAP_PULSE_CX, RECAP_PULSE_CY, r * 2, r * 2), 0.7);
    },
  },
];

// ---------------------------------------------------------------------------
// Key frames — action-aware samples for the contact sheet.
// ---------------------------------------------------------------------------
const keyFrames: KeyFrame[] = [
  { id: "intro:card", cueId: "intro", offset: 30, label: "topic card settled + cast appearing" },
  { id: "meet-hello:wave", cueId: "meet-hello", offset: 24, label: "girl waves, Hello! bubble + read-along" },
  { id: "intro-self:emphasis", cueId: "intro-self", offset: 28, label: "boy 'Hi! I'm Sam.' + coral I'm pulse + Sam card" },
  { id: "part-goodbye:both", cueId: "part-goodbye", offset: 56, label: "both kids wave, two farewell bubbles up" },
  { id: "recap:arc", cueId: "recap", offset: 50, label: "three-phrase arc swept + closing pulse" },
];

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kp1-hello-greetings",
  composition: "CompleteKp1HelloGreetingsLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kp1HelloGreetingsCues,
  keyFrames,
  elements,
};
