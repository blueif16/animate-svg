// kptest-greetings-verify — bbox manifest (pure TS, no React/Remotion).
//
// The single source of truth for what load-bearing element lives at which frame.
// Both the fast `lesson:check` collision pass and the contact-sheet frame picker
// import this. Every bboxAt(frame) mirrors the scene's opacity gates + geometry,
// wired to the SAME layout.ts constants the scene uses.

import type { AlignedLessonCue } from "@studio/narration-kit";
import { cueMap } from "@studio/narration-kit";
import type {
  Bbox,
  ElementSnapshot,
  KeyFrame,
  LessonManifest,
  SceneElement,
} from "../manifestTypes";
import { kptestGreetingsVerifyCues } from "../kptestGreetingsVerifyLessonTimeline";
import {
  BUBBLE_CY,
  BUBBLE_H,
  BUBBLE_W,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  EXCHANGE_REL_START,
  FACE_WIDTH,
  FAREWELL_READALONG_REL_START,
  IM_SLOW_READALONG_REL_START,
  INTRO_CARD_DUR,
  INTRO_CARD_FADE_OUT_DUR,
  INTRO_CARD_REL_START,
  KID_A_CX,
  KID_B_CX,
  NAMECARD_CY,
  NAMECARD_H,
  NAMECARD_W,
  PARTING_DISTANCE,
  PREDICTIVE_PAUSE_FRAMES,
  READALONG_CY,
  READALONG_ITEM_GAP,
  READALONG_ITEM_RADIUS,
  READALONG_REL_START,
  READALONG_WORD_SIZE,
  RECAP_CY,
  RECAP_ITEM_RADIUS,
  RECAP_LINE_GAP,
  RECAP_PULSE_BELOW_OFFSET,
  RECAP_PULSE_CX,
  RECAP_PULSE_RADIUS,
  RECAP_PULSE_REL_START,
  RECAP_PULSE_SPREAD,
  RECAP_STACK_REL_START,
  STAGE_CX,
  STAGE_CY,
  STAGE_FADE_IN_DUR,
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
// Cue lookups.
// ---------------------------------------------------------------------------
const cues = cueMap(kptestGreetingsVerifyCues);
const cIntro = cues["topic-intro"];
const cGreet = cues["greet"];
const cSlow = cues["im-slow-model"];
const cChoral = cues["im-choral-echo"];
const cGap = cues["im-learner-gap"];
const cFarewell = cues["farewell"];
const cRecap1 = cues["recap-1"];
const cRecap2 = cues["recap-2"];

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
    reveal(frame, cIntro.endFrame - INTRO_CARD_FADE_OUT_DUR, INTRO_CARD_FADE_OUT_DUR);
  return clamp01(Math.min(appear, fadeOut));
};

const stageOpacity = (frame: number): number => {
  if (frame < cGreet.startFrame) return 0;
  return clamp01(reveal(frame, cGreet.startFrame, STAGE_FADE_IN_DUR));
};

const recapCastOpacity = (frame: number): number => {
  if (frame < cRecap1.startFrame) return 0;
  return 1;
};

// Parting progress for farewell (mirrors the scene's interpolate).
const partingProgress = (frame: number): number => {
  if (frame < cFarewell.startFrame || frame >= cFarewell.endFrame) return 0;
  const t = clamp01(
    (frame - cFarewell.startFrame - EXCHANGE_REL_START) / 24,
  );
  return t; // linear approximation of EASE.inOutCubic for bbox purposes
};

// Figure box (square face footprint).
const FIGURE_BOX = FACE_WIDTH;

// Speech-bubble footprint per side.
const bubbleBox = (
  side: "left" | "right",
  speakerGap: number = KID_B_CX - KID_A_CX,
): Bbox => {
  const slotCx =
    side === "left"
      ? STAGE_CX - speakerGap / 2
      : STAGE_CX + speakerGap / 2;
  const inward = side === "left" ? 1 : -1;
  const bubbleCx = slotCx + inward * (FACE_WIDTH / 2) * 0.2;
  return centeredBox(bubbleCx, BUBBLE_CY, BUBBLE_W, BUBBLE_H);
};

// Read-along row footprint.
const readAlongRowBox = (
  n: number,
  itemGap: number,
  cy: number,
  glyphHeight = READALONG_WORD_SIZE * 1.32,
): Bbox => {
  const width = (n - 1) * itemGap + READALONG_ITEM_RADIUS * 2 + 24;
  return centeredBox(STAGE_CX, cy, width, glyphHeight);
};

// ---------------------------------------------------------------------------
// Elements
// ---------------------------------------------------------------------------
const elements: SceneElement[] = [
  // ---- Intro card (labels) ----
  {
    id: "intro-card",
    zone: "labels",
    bboxAt: (frame) =>
      snapshot(
        centeredBox(TITLE_CX, TITLE_CY, TITLE_SIZE * 8, TITLE_SIZE * 3.2),
        introCardOpacity(frame),
      ),
  },

  // ---- Characters for greet–farewell (objects) ----
  // Hidden when a DialogueExchange is active (the exchange renders its own
  // figure slots; no double-rendering). Visible during im-choral-echo and
  // im-learner-gap (no exchange) for the "your turn" hold.
  {
    id: "kid-a",
    zone: "objects",
    bboxAt: (frame) => {
      if (cueActive(cRecap1, frame) || cueActive(cRecap2, frame)) return null;
      if (cueActive(cGreet, frame) || cueActive(cSlow, frame) || cueActive(cFarewell, frame)) return null;
      const op = stageOpacity(frame);
      const pP = partingProgress(frame);
      const cx = KID_A_CX - pP * PARTING_DISTANCE;
      return snapshot(centeredBox(cx, STAGE_CY, FIGURE_BOX, FIGURE_BOX), op);
    },
  },
  {
    id: "kid-b",
    zone: "objects",
    bboxAt: (frame) => {
      if (cueActive(cRecap1, frame) || cueActive(cRecap2, frame)) return null;
      if (cueActive(cGreet, frame) || cueActive(cSlow, frame) || cueActive(cFarewell, frame)) return null;
      const op = stageOpacity(frame);
      const pP = partingProgress(frame);
      const cx = KID_B_CX + pP * PARTING_DISTANCE;
      return snapshot(centeredBox(cx, STAGE_CY, FIGURE_BOX, FIGURE_BOX), op);
    },
  },

  // ---- DialogueExchange bubbles (objects) ----
  {
    id: "exchange-greet",
    zone: "objects",
    bboxAt: (frame) => {
      const bubbleOpen = cGreet.startFrame + EXCHANGE_REL_START;
      if (!cueActive(cGreet, frame) || frame < bubbleOpen) return null;
      const op = reveal(frame, bubbleOpen, 10);
      // Two bubbles side by side; take the union box.
      const left = bubbleBox("left");
      const right = bubbleBox("right");
      const x = Math.min(left[0], right[0]);
      const w = Math.max(left[0] + left[2], right[0] + right[2]) - x;
      return snapshot([x, left[1], w, left[3]], op);
    },
  },
  {
    id: "exchange-slow",
    zone: "objects",
    bboxAt: (frame) => {
      const bubbleOpen =
        cSlow.startFrame + PREDICTIVE_PAUSE_FRAMES + EXCHANGE_REL_START;
      if (!cueActive(cSlow, frame) || frame < bubbleOpen) return null;
      const op = reveal(frame, bubbleOpen, 10);
      return snapshot(bubbleBox("right"), op);
    },
  },
  {
    id: "exchange-farewell",
    zone: "objects",
    bboxAt: (frame) => {
      const bubbleOpen = cFarewell.startFrame + EXCHANGE_REL_START;
      if (!cueActive(cFarewell, frame) || frame < bubbleOpen) return null;
      const op = reveal(frame, bubbleOpen, 10);
      const pP = partingProgress(frame);
      const sg = (KID_B_CX - KID_A_CX) + PARTING_DISTANCE * 2 * pP;
      const left = bubbleBox("left", sg);
      const right = bubbleBox("right", sg);
      const x = Math.min(left[0], right[0]);
      const w = Math.max(left[0] + left[2], right[0] + right[2]) - x;
      return snapshot([x, left[1], w, left[3]], op);
    },
  },

  // ---- Name card "Sam" (labels) ----
  {
    id: "namecard-sam",
    zone: "labels",
    bboxAt: (frame) => {
      const open =
        cSlow.startFrame + PREDICTIVE_PAUSE_FRAMES + EXCHANGE_REL_START;
      if (!cueActive(cSlow, frame) || frame < open) return null;
      const op = reveal(frame, open, 12);
      return snapshot(
        centeredBox(KID_B_CX, NAMECARD_CY, NAMECARD_W, NAMECARD_H),
        op,
      );
    },
  },

  // ---- Read-along rows (labels) ----
  {
    id: "rah-greet",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cGreet.startFrame + READALONG_REL_START;
      if (!cueActive(cGreet, frame) || frame < start) return null;
      return snapshot(
        readAlongRowBox(2, READALONG_ITEM_GAP, READALONG_CY),
        reveal(frame, start, 8),
      );
    },
  },
  {
    id: "rah-slow",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cSlow.startFrame + IM_SLOW_READALONG_REL_START;
      if (!cueActive(cSlow, frame) || frame < start) return null;
      return snapshot(
        readAlongRowBox(3, READALONG_ITEM_GAP, READALONG_CY),
        reveal(frame, start, 8),
      );
    },
  },
  {
    id: "rah-choral",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cChoral.startFrame + 8;
      if (!cueActive(cChoral, frame) || frame < start) return null;
      return snapshot(
        readAlongRowBox(2, READALONG_ITEM_GAP, READALONG_CY),
        reveal(frame, start, 8),
      );
    },
  },
  {
    id: "rah-gap",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cGap.startFrame + 4;
      if (!cueActive(cGap, frame) || frame < start) return null;
      return snapshot(
        readAlongRowBox(2, READALONG_ITEM_GAP, READALONG_CY),
        reveal(frame, start, 8),
      );
    },
  },
  {
    id: "rah-farewell",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cFarewell.startFrame + FAREWELL_READALONG_REL_START;
      if (!cueActive(cFarewell, frame) || frame < start) return null;
      return snapshot(
        readAlongRowBox(2, READALONG_ITEM_GAP + 60, READALONG_CY),
        reveal(frame, start, 8),
      );
    },
  },
  {
    id: "rah-recap",
    zone: "labels",
    bboxAt: (frame) => {
      const start = cRecap1.startFrame + RECAP_STACK_REL_START;
      const recapActive =
        cueActive(cRecap1, frame) || cueActive(cRecap2, frame);
      if (!recapActive || frame < start) return null;
      const height = RECAP_LINE_GAP * 2 + RECAP_ITEM_RADIUS * 2 + 40;
      return snapshot(
        centeredBox(STAGE_CX, RECAP_CY, 520, height),
        reveal(frame, start, 8),
      );
    },
  },

  // ---- Recap pulse (marks) ----
  {
    id: "recap-pulse",
    zone: "marks",
    bboxAt: (frame) => {
      const start = cRecap1.startFrame + RECAP_PULSE_REL_START;
      const recapActive =
        cueActive(cRecap1, frame) || cueActive(cRecap2, frame);
      if (!recapActive || frame < start) return null;
      // Pulse positioned BELOW the recap text stack (matches scene).
      const pulseCy = RECAP_CY + RECAP_LINE_GAP + RECAP_PULSE_BELOW_OFFSET;
      const r = RECAP_PULSE_RADIUS + RECAP_PULSE_SPREAD;
      return snapshot(centeredBox(RECAP_PULSE_CX, pulseCy, r * 2, r * 2), 0.7);
    },
  },

  // ---- Recap cast (objects) ----
  {
    id: "recap-kid-a",
    zone: "objects",
    bboxAt: (frame) => {
      const recapActive =
        cueActive(cRecap1, frame) || cueActive(cRecap2, frame);
      if (!recapActive) return null;
      return snapshot(
        centeredBox(
          KID_A_CX - PARTING_DISTANCE,
          STAGE_CY,
          FIGURE_BOX,
          FIGURE_BOX,
        ),
        recapCastOpacity(frame),
      );
    },
  },
  {
    id: "recap-kid-b",
    zone: "objects",
    bboxAt: (frame) => {
      const recapActive =
        cueActive(cRecap1, frame) || cueActive(cRecap2, frame);
      if (!recapActive) return null;
      return snapshot(
        centeredBox(
          KID_B_CX + PARTING_DISTANCE,
          STAGE_CY,
          FIGURE_BOX,
          FIGURE_BOX,
        ),
        recapCastOpacity(frame),
      );
    },
  },
];

// ---------------------------------------------------------------------------
// Key frames — action-aware samples for the contact sheet.
// ---------------------------------------------------------------------------
const keyFrames: KeyFrame[] = [
  {
    id: "intro:card",
    cueId: "topic-intro",
    offset: 30,
    label: "topic card settled, reading hold",
  },
  {
    id: "greet:hello-hi",
    cueId: "greet",
    offset: 40,
    label: "Kid A 'Hello!' + Kid B 'Hi!' bubbles + RAH",
  },
  {
    id: "im-slow:emphasis",
    cueId: "im-slow-model",
    offset: 50,
    label: "Kid B 'I'm Sam' emphasis + PulseCircle + slow RAH",
  },
  {
    id: "choral:your-turn",
    cueId: "im-choral-echo",
    offset: 50,
    label: "RAH 'I'm Sam' + your-turn glow",
  },
  {
    id: "gap:silence",
    cueId: "im-learner-gap",
    offset: 60,
    label: "RAH 'I'm Sam' glowing through silence",
  },
  {
    id: "farewell:parting",
    cueId: "farewell",
    offset: 50,
    label: "characters parting + Goodbye/Bye-Bye bubbles",
  },
  {
    id: "recap:arc",
    cueId: "recap-1",
    offset: 50,
    label: "recap stack + phrase 1 active",
  },
];

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kptest-greetings-verify",
  composition: "CompleteKptestGreetingsVerifyLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kptestGreetingsVerifyCues,
  keyFrames,
  elements,
};
