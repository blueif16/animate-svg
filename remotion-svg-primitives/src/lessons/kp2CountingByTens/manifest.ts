// kp2-counting-by-tens — bbox manifest (pure TS, no React/Remotion).
// Mirrors the scene's opacity gates and geometry, wired to the SAME layout.ts
// constants — "same in → same out." bboxAt(frame) returns null when opacity = 0.

import { cueMap } from "@studio/narration-kit";
import type {
  Bbox,
  KeyFrame,
  LessonManifest,
  SceneElement,
} from "../manifestTypes";
import { kp2CountingByTensCues } from "../kp2CountingByTensLessonTimeline";
import {
  BADGE_Y,
  BUNDLE_FINAL_WIDTH,
  BUNDLE_OFFSCREEN_RIGHT_CX,
  BUNDLE_THREE_LEFT_CX,
  BUNDLE_THREE_MID_CX,
  BUNDLE_THREE_RIGHT_CX,
  BUNDLE_TWO_LEFT_CX,
  BUNDLE_TWO_RIGHT_CX,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COUNT_BADGE_SIZE,
  FAST_BADGES_FADE_DUR,
  FAST_COMPRESS_DUR,
  FAST_COMPRESS_REL_START,
  FAST_ONE_BADGE_DUR,
  FAST_ONE_BADGE_REL_START,
  FAST_RIGHT_TALLY_DUR,
  FAST_RIGHT_TALLY_REL_START,
  FAST_SLOW_TALLY_SLIDE_DUR,
  FAST_VS_MARK_REL_START,
  FAST_WRAP_DUR,
  FAST_WRAP_REL_START,
  getRowStickX,
  LABEL_X,
  LABEL_Y,
  RECALL_BUNDLE_BOUNCY_DUR,
  RECALL_LABEL_DUR,
  RECALL_LABEL_REL_START,
  ROW_GAP,
  SLOW_BADGE_BASE_DELAY,
  SLOW_COUNT_BADGE_FADE_DUR,
  SLOW_COUNT_STRIDE,
  SLOW_TALLY_DUR,
  SLOW_TALLY_REL_START,
  STICKS_ORIGIN_X,
  STICKS_ORIGIN_Y,
  STICK_COUNT,
  STICK_LENGTH,
  STICK_THICKNESS,
  TALLY_LEFT_CX,
  TALLY_RIGHT_CX,
  TALLY_Y,
  THREE_BADGE_C_DUR,
  THREE_BADGE_C_REL_START,
  THREE_BUNDLE_C_SLIDE_DUR,
  THREE_BUNDLE_C_SLIDE_REL_START,
  THREE_BUNDLE_SHIFT_DUR,
  THREE_BUNDLE_SHIFT_REL_START,
  THREE_LABEL_DUR,
  THREE_LABEL_REL_START,
  TWO_BADGE_A_DUR,
  TWO_BADGE_A_REL_START,
  TWO_BADGE_B_DUR,
  TWO_BADGE_B_REL_START,
  TWO_BUNDLE_A_SLIDE_DUR,
  TWO_BUNDLE_A_SLIDE_REL_START,
  TWO_BUNDLE_B_SLIDE_DUR,
  TWO_BUNDLE_B_SLIDE_REL_START,
  TWO_EXIT_DUR,
  TWO_LABEL_DUR,
  TWO_LABEL_REL_START,
  UNTIE_LABEL_EXIT_DUR,
  UNTIE_OPEN_DUR,
  UNTIE_OPEN_REL_START,
  RECAP_LABEL_FADE_REL_START,
  RECAP_LABEL_FADE_DUR,
  RECAP_UNDERLINE_REL_START,
  VS_MARK_X,
  VS_MARK_Y,
} from "./layout";

const cues = cueMap(kp2CountingByTensCues);

// ─── PURE-TS EASING HELPERS ─────────────────────────────────────────────────
const cubicBezier = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): ((t: number) => number) => {
  const sampleCurveX = (t: number) =>
    3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const sampleCurveY = (t: number) =>
    3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  const sampleDerivativeX = (t: number) =>
    3 * (1 - t) * (1 - t) * x1 +
    6 * (1 - t) * t * (x2 - x1) +
    3 * t * t * (1 - x2);
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const dx = sampleCurveX(t) - x;
      const d = sampleDerivativeX(t);
      if (Math.abs(dx) < 1e-6) break;
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    return sampleCurveY(t);
  };
};

const EASE = {
  outCubic: cubicBezier(0.33, 1, 0.68, 1),
  outQuint: cubicBezier(0.22, 1, 0.36, 1),
  inOutCubic: cubicBezier(0.65, 0, 0.35, 1),
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = (t) => t,
): number => {
  const safeEnd = Math.max(start + 1, end);
  return easing(clamp01((frame - start) / (safeEnd - start)));
};
const reveal = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE.outCubic,
) => progress(frame, start, start + Math.max(1, duration), easing);

// ─── ELEMENTS ───────────────────────────────────────────────────────────────

const introCardElement: SceneElement = {
  id: "intro-card",
  zone: "labels",
  bboxAt: (frame) => {
    const c = cues["intro"];
    if (!c) return null;
    // Gone by end of intro cue
    if (frame < c.startFrame || frame > c.endFrame) return null;
    // Bbox size matching TopicIntroCard
    const bbox: Bbox = [640 - 380, 360 - 160, 760, 320];
    return { bbox, opacity: 1 };
  },
};

const bundleAElement: SceneElement = {
  id: "bundle-a",
  zone: "objects",
  bboxAt: (frame) => {
    const bundleRecall = cues["bundle-recall"];
    if (!bundleRecall) return null;
    if (frame < bundleRecall.startFrame) return null;

    const untieReveal = cues["untie-reveal"];
    const fastVsSlow = cues["fast-vs-slow"];
    const twoTens = cues["two-tens"];
    const threeTens = cues["three-tens"];

    // 1. Layout determination
    const untieOpenStart = untieReveal.startFrame + UNTIE_OPEN_REL_START;
    const untieOpenEnd = untieOpenStart + UNTIE_OPEN_DUR;
    const fastCompressStart = fastVsSlow.startFrame + FAST_COMPRESS_REL_START;
    const fastWrapEnd = fastVsSlow.startFrame + FAST_WRAP_REL_START + FAST_WRAP_DUR;

    let isRow = false;
    let compress = 0;

    if (frame < untieOpenStart) {
      isRow = false;
    } else if (frame < untieOpenEnd) {
      isRow = frame >= untieOpenStart + UNTIE_OPEN_DUR / 2;
    } else if (frame < fastCompressStart) {
      isRow = true;
    } else if (frame < fastWrapEnd) {
      const compressWindowStart = fastCompressStart;
      const compressWindowDur = FAST_COMPRESS_DUR;
      compress = progress(
        frame,
        compressWindowStart,
        compressWindowStart + compressWindowDur,
        EASE.inOutCubic,
      );
      const wrapStart = fastVsSlow.startFrame + FAST_WRAP_REL_START;
      isRow = frame < wrapStart;
    } else {
      isRow = false;
    }

    // 2. Position determination
    const twoSlideAStart = twoTens.startFrame + TWO_BUNDLE_A_SLIDE_REL_START;
    const twoSlideA = reveal(
      frame,
      twoSlideAStart,
      TWO_BUNDLE_A_SLIDE_DUR,
      EASE.inOutCubic,
    );
    const threeShiftStart = threeTens.startFrame + THREE_BUNDLE_SHIFT_REL_START;
    const threeShift = reveal(
      frame,
      threeShiftStart,
      THREE_BUNDLE_SHIFT_DUR,
      EASE.inOutCubic,
    );

    let bundleAX: number;
    if (frame >= threeTens.startFrame) {
      bundleAX = lerp(BUNDLE_TWO_LEFT_CX, BUNDLE_THREE_LEFT_CX, threeShift);
    } else if (frame >= twoTens.startFrame) {
      bundleAX = lerp(STICKS_ORIGIN_X, BUNDLE_TWO_LEFT_CX, twoSlideA);
    } else {
      bundleAX = STICKS_ORIGIN_X;
    }

    // 3. Dimension determination
    let w: number;
    if (isRow) {
      w = (STICK_COUNT - 1) * ROW_GAP + STICK_THICKNESS;
    } else if (frame >= fastCompressStart && frame < fastWrapEnd) {
      const startW = (STICK_COUNT - 1) * ROW_GAP + STICK_THICKNESS;
      w = lerp(startW, BUNDLE_FINAL_WIDTH, compress);
    } else {
      w = BUNDLE_FINAL_WIDTH;
    }

    const h = STICK_LENGTH;

    // Scale physics for bundle-recall entry
    let scale = 1;
    if (frame < bundleRecall.startFrame + RECALL_BUNDLE_BOUNCY_DUR) {
      const p = reveal(
        frame,
        bundleRecall.startFrame,
        RECALL_BUNDLE_BOUNCY_DUR,
        EASE.outQuint,
      );
      scale = lerp(0.92, 1.0, p); // Simplified bouncy for manifest bounding box
    }

    return {
      bbox: [
        bundleAX - (w * scale) / 2,
        STICKS_ORIGIN_Y - (h * scale) / 2,
        w * scale,
        h * scale,
      ],
      opacity: 1,
    };
  },
};

const bundleBElement: SceneElement = {
  id: "bundle-b",
  zone: "objects",
  bboxAt: (frame) => {
    const twoTens = cues["two-tens"];
    const threeTens = cues["three-tens"];
    if (!twoTens || frame < twoTens.startFrame) return null;

    const twoSlideBStart = twoTens.startFrame + TWO_BUNDLE_B_SLIDE_REL_START;
    const twoSlideB = reveal(
      frame,
      twoSlideBStart,
      TWO_BUNDLE_B_SLIDE_DUR,
      EASE.outCubic,
    );

    const threeShiftStart = threeTens.startFrame + THREE_BUNDLE_SHIFT_REL_START;
    const threeShift = reveal(
      frame,
      threeShiftStart,
      THREE_BUNDLE_SHIFT_DUR,
      EASE.inOutCubic,
    );

    let bundleBX: number;
    if (frame >= threeTens.startFrame) {
      bundleBX = lerp(BUNDLE_TWO_RIGHT_CX, BUNDLE_THREE_MID_CX, threeShift);
    } else {
      bundleBX = lerp(BUNDLE_OFFSCREEN_RIGHT_CX, BUNDLE_TWO_RIGHT_CX, twoSlideB);
    }

    const bbox: Bbox = [
      bundleBX - BUNDLE_FINAL_WIDTH / 2,
      STICKS_ORIGIN_Y - STICK_LENGTH / 2,
      BUNDLE_FINAL_WIDTH,
      STICK_LENGTH,
    ];
    return { bbox, opacity: 1 };
  },
};

const bundleCElement: SceneElement = {
  id: "bundle-c",
  zone: "objects",
  bboxAt: (frame) => {
    const threeTens = cues["three-tens"];
    if (!threeTens || frame < threeTens.startFrame) return null;

    const threeSlideCStart = threeTens.startFrame + THREE_BUNDLE_C_SLIDE_REL_START;
    const threeSlideC = reveal(
      frame,
      threeSlideCStart,
      THREE_BUNDLE_C_SLIDE_DUR,
      EASE.outCubic,
    );

    const bundleCX = lerp(BUNDLE_OFFSCREEN_RIGHT_CX, BUNDLE_THREE_RIGHT_CX, threeSlideC);

    const bbox: Bbox = [
      bundleCX - BUNDLE_FINAL_WIDTH / 2,
      STICKS_ORIGIN_Y - STICK_LENGTH / 2,
      BUNDLE_FINAL_WIDTH,
      STICK_LENGTH,
    ];
    return { bbox, opacity: 1 };
  },
};

const makeSlowBadgeElement = (index: number): SceneElement => ({
  id: `badge-${index}`,
  zone: "badges",
  bboxAt: (frame) => {
    const slowCount = cues["slow-count-ones"];
    const fastVsSlow = cues["fast-vs-slow"];
    if (!slowCount || !fastVsSlow) return null;

    const startFrame = slowCount.startFrame + SLOW_BADGE_BASE_DELAY + index * SLOW_COUNT_STRIDE;
    if (frame < startFrame) return null;

    const fadeOut = 1 - reveal(frame, fastVsSlow.startFrame, FAST_BADGES_FADE_DUR, EASE.outCubic);
    if (fadeOut <= 0.001) return null;

    const appear = reveal(frame, startFrame, SLOW_COUNT_BADGE_FADE_DUR, EASE.outQuint);
    const opacity = appear * fadeOut;

    const x = getRowStickX(index);
    const bbox: Bbox = [
      x - COUNT_BADGE_SIZE / 2,
      BADGE_Y - COUNT_BADGE_SIZE / 2,
      COUNT_BADGE_SIZE,
      COUNT_BADGE_SIZE,
    ];
    return { bbox, opacity };
  },
});

const climaxBadgeElement: SceneElement = {
  id: "climax-badge",
  zone: "badges",
  bboxAt: (frame) => {
    const fastVsSlow = cues["fast-vs-slow"];
    const twoTens = cues["two-tens"];
    if (!fastVsSlow || !twoTens) return null;

    const startFrame = fastVsSlow.startFrame + FAST_ONE_BADGE_REL_START;
    if (frame < startFrame) return null;

    const fadeOut = 1 - reveal(frame, twoTens.startFrame, TWO_EXIT_DUR, EASE.outCubic);
    if (fadeOut <= 0.001) return null;

    const opacity = reveal(frame, startFrame, FAST_ONE_BADGE_DUR, EASE.outCubic) * fadeOut;
    const bbox: Bbox = [
      STICKS_ORIGIN_X - COUNT_BADGE_SIZE / 2,
      BADGE_Y - COUNT_BADGE_SIZE / 2,
      COUNT_BADGE_SIZE,
      COUNT_BADGE_SIZE,
    ];
    return { bbox, opacity };
  },
};

const makeBundleBadgeElement = (
  id: string,
  cueId: string,
  badgeRelStart: number,
  badgeDur: number,
  getX: (frame: number) => number | null,
): SceneElement => ({
  id,
  zone: "badges",
  bboxAt: (frame) => {
    const c = cues[cueId];
    if (!c || frame < c.startFrame) return null;

    const x = getX(frame);
    if (x === null) return null;

    const opacity = reveal(frame, c.startFrame + badgeRelStart, badgeDur, EASE.outCubic);
    if (opacity <= 0.001) return null;

    const bbox: Bbox = [
      x - COUNT_BADGE_SIZE / 2,
      BADGE_Y - COUNT_BADGE_SIZE / 2,
      COUNT_BADGE_SIZE,
      COUNT_BADGE_SIZE,
    ];
    return { bbox, opacity };
  },
});

// ─── TALLIES ─────────────────────────────────────────────────────────────────
const slowTallyElement: SceneElement = {
  id: "slow-tally",
  zone: "tally",
  bboxAt: (frame) => {
    const slowCount = cues["slow-count-ones"];
    const fastVsSlow = cues["fast-vs-slow"];
    const twoTens = cues["two-tens"];
    if (!slowCount || !fastVsSlow || !twoTens) return null;

    const startFrame = slowCount.startFrame + SLOW_TALLY_REL_START;
    if (frame < startFrame) return null;

    const slowTallyEnter = reveal(frame, startFrame, SLOW_TALLY_DUR, EASE.outCubic);
    const slowTallyFadeOut = 1 - reveal(frame, twoTens.startFrame, TWO_EXIT_DUR, EASE.outCubic);
    const opacity = slowTallyEnter * slowTallyFadeOut;
    if (opacity <= 0.001) return null;

    const slideT = reveal(frame, fastVsSlow.startFrame, FAST_SLOW_TALLY_SLIDE_DUR, EASE.inOutCubic);
    const x = lerp(640, TALLY_LEFT_CX, slideT);

    const w = 180;
    const h = 70;
    const bbox: Bbox = [x - w / 2, TALLY_Y - h / 2, w, h];
    return { bbox, opacity };
  },
};

const fastTallyElement: SceneElement = {
  id: "fast-tally",
  zone: "tally",
  bboxAt: (frame) => {
    const fastVsSlow = cues["fast-vs-slow"];
    const twoTens = cues["two-tens"];
    if (!fastVsSlow || !twoTens) return null;

    const startFrame = fastVsSlow.startFrame + FAST_RIGHT_TALLY_REL_START;
    if (frame < startFrame) return null;

    const fastTallyEnter = reveal(frame, startFrame, FAST_RIGHT_TALLY_DUR, EASE.outCubic);
    const fastTallyFadeOut = 1 - reveal(frame, twoTens.startFrame, TWO_EXIT_DUR, EASE.outCubic);
    const opacity = fastTallyEnter * fastTallyFadeOut;
    if (opacity <= 0.001) return null;

    const w = 120;
    const h = 70;
    const bbox: Bbox = [TALLY_RIGHT_CX - w / 2, TALLY_Y - h / 2, w, h];
    return { bbox, opacity };
  },
};

// ─── LABELS ──────────────────────────────────────────────────────────────────
const makeLabelElement = (
  id: string,
  cueId: string,
  labelRelStart: number,
  labelDur: number,
  textLength: number,
  exitCueId?: string,
  exitRelStart?: number,
  exitDur?: number,
): SceneElement => ({
  id,
  zone: "labels",
  bboxAt: (frame) => {
    const c = cues[cueId];
    if (!c || frame < c.startFrame) return null;

    const enter = reveal(frame, c.startFrame + labelRelStart, labelDur, EASE.outCubic);
    let exit = 1;
    if (exitCueId && exitRelStart !== undefined && exitDur !== undefined) {
      const ec = cues[exitCueId];
      if (ec) {
        exit = 1 - reveal(frame, ec.startFrame + exitRelStart, exitDur, EASE.outCubic);
      }
    }

    const opacity = enter * exit;
    if (opacity <= 0.001) return null;

    const w = textLength * 56;
    const h = 60;
    const bbox: Bbox = [LABEL_X - w / 2, LABEL_Y - h / 2, w, h];
    return { bbox, opacity };
  },
});

// ─── SKETCH MARKS ────────────────────────────────────────────────────────────
const markVsElement: SceneElement = {
  id: "mark-fast-vs-slow-vs",
  zone: "marks",
  bboxAt: (frame) => {
    const fastVsSlow = cues["fast-vs-slow"];
    if (!fastVsSlow) return null;

    const start = fastVsSlow.startFrame + FAST_VS_MARK_REL_START;
    const end = fastVsSlow.endFrame;
    if (frame < start || frame > end) return null;

    const fadeOutStart = Math.max(start, end - 8);
    const fadeOut = progress(frame, fadeOutStart, end);
    const opacity = (1 - fadeOut) * 0.92;
    if (opacity <= 0.001) return null;

    // vs-mark area centered on (640, 535)
    const bbox: Bbox = [VS_MARK_X - 40, VS_MARK_Y - 40, 80, 80];
    return { bbox, opacity };
  },
};

const markUnderlineElement: SceneElement = {
  id: "mark-recap-geng-kuai-underline",
  zone: "marks",
  bboxAt: (frame) => {
    const recap = cues["recap"];
    if (!recap) return null;

    const start = recap.startFrame + RECAP_UNDERLINE_REL_START;
    const end = recap.endFrame;
    if (frame < start || frame > end) return null;

    const fadeOutStart = Math.max(start, end - 8);
    const fadeOut = progress(frame, fadeOutStart, end);
    const opacity = (1 - fadeOut) * 0.92;
    if (opacity <= 0.001) return null;

    // span from 640 to 760 at y=632
    const bbox: Bbox = [640, 628, 120, 8];
    return { bbox, opacity };
  },
};

// Assemble the manifest elements
const elements: SceneElement[] = [
  introCardElement,
  bundleAElement,
  bundleBElement,
  bundleCElement,
  ...Array.from({ length: STICK_COUNT }, (_, index) => makeSlowBadgeElement(index)),
  climaxBadgeElement,

  // Two-tens badges
  makeBundleBadgeElement("badge-two-a", "two-tens", TWO_BADGE_A_REL_START, TWO_BADGE_A_DUR, (frame) => {
    const twoSlideAStart = cues["two-tens"].startFrame + TWO_BUNDLE_A_SLIDE_REL_START;
    const twoSlideA = reveal(frame, twoSlideAStart, TWO_BUNDLE_A_SLIDE_DUR, EASE.inOutCubic);
    return lerp(STICKS_ORIGIN_X, BUNDLE_TWO_LEFT_CX, twoSlideA);
  }),
  makeBundleBadgeElement("badge-two-b", "two-tens", TWO_BADGE_B_REL_START, TWO_BADGE_B_DUR, (frame) => {
    const twoSlideBStart = cues["two-tens"].startFrame + TWO_BUNDLE_B_SLIDE_REL_START;
    const twoSlideB = reveal(frame, twoSlideBStart, TWO_BUNDLE_B_SLIDE_DUR, EASE.outCubic);
    return lerp(BUNDLE_OFFSCREEN_RIGHT_CX, BUNDLE_TWO_RIGHT_CX, twoSlideB);
  }),

  // Three-tens badges (A, B, C)
  makeBundleBadgeElement("badge-three-a", "three-tens", TWO_BADGE_A_REL_START, TWO_BADGE_A_DUR, (frame) => {
    const threeShiftStart = cues["three-tens"].startFrame + THREE_BUNDLE_SHIFT_REL_START;
    const threeShift = reveal(frame, threeShiftStart, THREE_BUNDLE_SHIFT_DUR, EASE.inOutCubic);
    return lerp(BUNDLE_TWO_LEFT_CX, BUNDLE_THREE_LEFT_CX, threeShift);
  }),
  makeBundleBadgeElement("badge-three-b", "three-tens", TWO_BADGE_B_REL_START, TWO_BADGE_B_DUR, (frame) => {
    const threeShiftStart = cues["three-tens"].startFrame + THREE_BUNDLE_SHIFT_REL_START;
    const threeShift = reveal(frame, threeShiftStart, THREE_BUNDLE_SHIFT_DUR, EASE.inOutCubic);
    return lerp(BUNDLE_TWO_RIGHT_CX, BUNDLE_THREE_MID_CX, threeShift);
  }),
  makeBundleBadgeElement("badge-three-c", "three-tens", THREE_BADGE_C_REL_START, THREE_BADGE_C_DUR, (frame) => {
    const threeSlideCStart = cues["three-tens"].startFrame + THREE_BUNDLE_C_SLIDE_REL_START;
    const threeSlideC = reveal(frame, threeSlideCStart, THREE_BUNDLE_C_SLIDE_DUR, EASE.outCubic);
    return lerp(BUNDLE_OFFSCREEN_RIGHT_CX, BUNDLE_THREE_RIGHT_CX, threeSlideC);
  }),

  slowTallyElement,
  fastTallyElement,

  // Labels
  makeLabelElement("label-recall", "bundle-recall", RECALL_LABEL_REL_START, RECALL_LABEL_DUR, 3, "untie-reveal", 0, UNTIE_LABEL_EXIT_DUR),
  makeLabelElement("label-two", "two-tens", TWO_LABEL_REL_START, TWO_LABEL_DUR, 3, "three-tens", THREE_LABEL_REL_START, THREE_LABEL_DUR),
  makeLabelElement("label-three", "three-tens", THREE_LABEL_REL_START, THREE_LABEL_DUR, 3, "recap", RECAP_LABEL_FADE_REL_START, RECAP_LABEL_FADE_DUR),
  makeLabelElement("label-takeaway", "recap", RECAP_LABEL_FADE_REL_START, RECAP_LABEL_FADE_DUR, 9),

  markVsElement,
  markUnderlineElement,
];

// ─── KEY FRAMES ──────────────────────────────────────────────────────────────
const keyFrames: KeyFrame[] = [
  { id: "intro:hold", cueId: "intro", offset: 15, label: "Intro Title" },
  { id: "recall:hold", cueId: "bundle-recall", offset: 40, label: "Bundle Recall" },
  { id: "untie:mid", cueId: "untie-reveal", offset: 30, label: "Untie Reveal mid" },
  { id: "slow-count:badge-5", cueId: "slow-count-ones", offset: 50, label: "Counting stick 5" },
  { id: "slow-count:tally", cueId: "slow-count-ones", offset: 88, label: "Slow tally shown" },
  { id: "climax:tied", cueId: "fast-vs-slow", offset: 60, label: "Bundle tied with rope, tallies compared" },
  { id: "two-tens:hold", cueId: "two-tens", offset: 70, label: "Two bundles present" },
  { id: "three-tens:hold", cueId: "three-tens", offset: 70, label: "Three bundles present" },
  { id: "recap:spaced-recall", cueId: "recap", offset: 50, label: "Recap and Takeaway label" },
];

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kp2-counting-by-tens",
  composition: "CompleteKp2CountingByTensLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kp2CountingByTensCues,
  keyFrames,
  elements,
  allowedOverlaps: [
    // Underlines / marks sit on or under text/shapes intentionally
    ["mark-recap-geng-kuai-underline", "label-takeaway"],
    ["mark-fast-vs-slow-vs", "slow-tally"],
    ["mark-fast-vs-slow-vs", "fast-tally"],
  ],
};
