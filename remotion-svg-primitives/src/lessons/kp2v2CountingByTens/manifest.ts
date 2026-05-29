import type { AlignedLessonCue } from "@studio/narration-kit";
import { cueMap } from "@studio/narration-kit";
import type {
  Bbox,
  ElementSnapshot,
  KeyFrame,
  LessonManifest,
  SceneElement,
} from "../manifestTypes";
import { kp2v2CountingByTensAlignedCues } from "../generated/kp2v2CountingByTensTiming";
import {
  BADGE_Y,
  BOTTOM_BUNDLE_ROW_Y,
  BUNDLE_BAND_HEIGHT,
  BUNDLE_WIDTH,
  C1_BADGE_CASCADE_REL_START,
  C1_PER_TICK_DURATION,
  C1_STICKS_FADE_IN_DURATION,
  C1_TICK_POP_DURATION,
  C2_BADGES_FADE_OUT_DURATION,
  C2_BADGE_DURATION,
  C2_BADGE_REL_START,
  C2_COMPRESS_DURATION,
  C2_COMPRESS_REL_START,
  C2_LABEL_DURATION,
  C2_LABEL_REL_START,
  C2_WRAP_DURATION,
  C2_WRAP_REL_START,
  C3_BADGE_DURATION,
  C3_BADGE_REL_START,
  C3_BUNDLE_ENTER_DURATION,
  C3_BUNDLE_ENTER_REL_START,
  C3_LABEL_DURATION,
  C3_LABEL_REL_START,
  C3_TRANSLATE_DURATION,
  C4_BADGE_DURATION,
  C4_BADGE_REL_START,
  C4_BUNDLE_ENTER_DURATION,
  C4_BUNDLE_ENTER_REL_START,
  C4_LABEL_DURATION,
  C4_LABEL_REL_START,
  C4_TRANSLATE_DURATION,
  C5_LOOSE_ROW_DURATION,
  C5_LOOSE_ROW_REL_START,
  C5_PER_BUNDLE_BADGE_FADE_DURATION,
  C5_PER_BUNDLE_LABEL_FADE_DURATION,
  C5_REFLOW_DURATION,
  C5_TEN_PILL_DURATION,
  C5_TEN_PILL_REL_START,
  C5_THREE_PILL_DURATION,
  C5_THREE_PILL_REL_START,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LABEL_Y,
  LOOSE_ROW_WIDTH,
  ROW_GAP,
  STICK_COUNT,
  STICK_LENGTH,
  TEACHING_ROW_Y_SINGLE,
  THREE_PILL_Y,
  TOP_LOOSE_ROW_Y,
  ZONES,
  bundleSlotX,
  looseRowStickX,
} from "./layout";

const cues = cueMap(kp2v2CountingByTensAlignedCues);

// ---------------------------------------------------------------------------
// Pure-TS easing helpers — mirror Remotion's Easing.bezier for the scene.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Cue lookups (must mirror scene exactly).
// ---------------------------------------------------------------------------
const c1 = cues["loose-count-felt"];
const c2 = cues["bundle-is-one-count"];
const c3 = cues["tens-count-like-ones"];
const c4 = cues["pattern-holds"];
const c5 = cues["tens-are-the-faster-way"];

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------
const centeredBox = (
  cx: number,
  cy: number,
  w: number,
  h: number,
): Bbox => [cx - w / 2, cy - h / 2, w, h];

const snapshot = (bbox: Bbox, opacity: number): ElementSnapshot | null => {
  if (opacity <= 0) return null;
  return { bbox, opacity: clamp01(opacity) };
};

// StepTally pillWidth from counting.tsx (must match exactly).
const stepTallyPillWidth = (steps: number, size: number, hasLabel: boolean) => {
  const valueFontSize = size * 0.62;
  const labelFontSize = size * 0.42;
  const valueText = String(Math.max(0, Math.floor(steps)));
  const approxValueWidth = valueText.length * valueFontSize * 0.62;
  const labelWidth = hasLabel ? labelFontSize * 1.2 : 0;
  const innerGap = hasLabel ? 10 : 0;
  const horizontalPadding = 28;
  return approxValueWidth + innerGap + labelWidth + horizontalPadding * 2;
};

// ---------------------------------------------------------------------------
// Resolvers that mirror the scene's helpers
// ---------------------------------------------------------------------------
const bundleX = (index: number, totalBundles: number): number =>
  bundleSlotX(index, totalBundles);

const bundleCountAtFrame = (frame: number): number => {
  if (frame < c2.startFrame + C2_WRAP_REL_START) return 0;
  if (frame < c3.startFrame + C3_BUNDLE_ENTER_REL_START) return 1;
  if (frame < c4.startFrame + C4_BUNDLE_ENTER_REL_START) return 2;
  return 3;
};

const bundleTranslateX = (index: number, frame: number): number => {
  const currentCount = bundleCountAtFrame(frame);
  const baseX = bundleX(index, Math.max(1, currentCount));
  if (frame >= c3.startFrame && frame < c3.startFrame + C3_TRANSLATE_DURATION) {
    const t = reveal(frame, c3.startFrame, C3_TRANSLATE_DURATION, EASE.inOutCubic);
    return lerp(bundleX(index, 1), bundleX(index, 2), t);
  }
  if (frame >= c4.startFrame && frame < c4.startFrame + C4_TRANSLATE_DURATION) {
    const t = reveal(frame, c4.startFrame, C4_TRANSLATE_DURATION, EASE.inOutCubic);
    return lerp(bundleX(index, 2), bundleX(index, 3), t);
  }
  return baseX;
};

const bundleRowY = (frame: number): number => {
  if (frame < c5.startFrame) return TEACHING_ROW_Y_SINGLE;
  const t = reveal(frame, c5.startFrame, C5_REFLOW_DURATION, EASE.inOutCubic);
  return lerp(TEACHING_ROW_Y_SINGLE, BOTTOM_BUNDLE_ROW_Y, t);
};

const bundleEntranceOpacity = (index: number, frame: number): number => {
  if (index === 0) {
    return reveal(frame, c2.startFrame + C2_WRAP_REL_START, C2_WRAP_DURATION);
  }
  if (index === 1) {
    return reveal(
      frame,
      c3.startFrame + C3_BUNDLE_ENTER_REL_START,
      C3_BUNDLE_ENTER_DURATION,
    );
  }
  return reveal(
    frame,
    c4.startFrame + C4_BUNDLE_ENTER_REL_START,
    C4_BUNDLE_ENTER_DURATION,
  );
};

const bundleEntranceSlideX = (index: number, frame: number): number => {
  if (index === 0) return 0;
  const start =
    index === 1
      ? c3.startFrame + C3_BUNDLE_ENTER_REL_START
      : c4.startFrame + C4_BUNDLE_ENTER_REL_START;
  const duration =
    index === 1 ? C3_BUNDLE_ENTER_DURATION : C4_BUNDLE_ENTER_DURATION;
  const t = reveal(frame, start, duration, EASE.outCubic);
  return lerp(320, 0, t);
};

const bundleBadgeOpacity = (index: number, frame: number): number => {
  const enterStart =
    index === 0
      ? c2.startFrame + C2_BADGE_REL_START
      : index === 1
        ? c3.startFrame + C3_BADGE_REL_START
        : c4.startFrame + C4_BADGE_REL_START;
  const enterDur =
    index === 0
      ? C2_BADGE_DURATION
      : index === 1
        ? C3_BADGE_DURATION
        : C4_BADGE_DURATION;
  const enter = reveal(frame, enterStart, enterDur);
  const fadeOut =
    1 - reveal(frame, c5.startFrame, C5_PER_BUNDLE_BADGE_FADE_DURATION);
  return enter * fadeOut;
};

const bundleLabelOpacity = (index: number, frame: number): number => {
  const enterStart =
    index === 0
      ? c2.startFrame + C2_LABEL_REL_START
      : index === 1
        ? c3.startFrame + C3_LABEL_REL_START
        : c4.startFrame + C4_LABEL_REL_START;
  const enterDur =
    index === 0
      ? C2_LABEL_DURATION
      : index === 1
        ? C3_LABEL_DURATION
        : C4_LABEL_DURATION;
  const enter = reveal(frame, enterStart, enterDur);
  const fadeOut =
    1 - reveal(frame, c5.startFrame, C5_PER_BUNDLE_LABEL_FADE_DURATION);
  return enter * fadeOut;
};

const looseRowOpacityCue1 = (frame: number): number =>
  reveal(frame, c1.startFrame, C1_STICKS_FADE_IN_DURATION);

const c1BadgesFadeOut = (frame: number): number =>
  1 - reveal(frame, c2.startFrame, C2_BADGES_FADE_OUT_DURATION);

const c1BadgeProgress = (index: number, frame: number): number => {
  const start =
    c1.startFrame + C1_BADGE_CASCADE_REL_START + index * C1_PER_TICK_DURATION;
  return reveal(frame, start, C1_TICK_POP_DURATION);
};

const c1RowVisible = (frame: number): boolean =>
  frame < c2.startFrame + C2_COMPRESS_REL_START + C2_COMPRESS_DURATION;

const bundle0Visible = (frame: number): boolean =>
  frame >= c2.startFrame + C2_COMPRESS_REL_START + C2_COMPRESS_DURATION;

const beat5LooseRowOpacity = (frame: number): number =>
  reveal(
    frame,
    c5.startFrame + C5_LOOSE_ROW_REL_START,
    C5_LOOSE_ROW_DURATION,
  );

const tenPillOpacity = (frame: number): number =>
  reveal(frame, c5.startFrame + C5_TEN_PILL_REL_START, C5_TEN_PILL_DURATION);

const threePillOpacity = (frame: number): number =>
  reveal(
    frame,
    c5.startFrame + C5_THREE_PILL_REL_START,
    C5_THREE_PILL_DURATION,
  );

// ---------------------------------------------------------------------------
// Elements
// ---------------------------------------------------------------------------
const LABEL_FONT_SIZE = 44;

const c1LooseRow: SceneElement = {
  id: "c1-loose-row",
  zone: "objects",
  bboxAt: (frame) => {
    if (!c1RowVisible(frame)) return null;
    const opacity = looseRowOpacityCue1(frame);
    if (opacity <= 0) return null;
    // During compress, the row width shrinks from LOOSE_ROW_WIDTH toward
    // BUNDLE_WIDTH. We approximate via the compress factor.
    const compress =
      frame < c2.startFrame + C2_COMPRESS_REL_START
        ? 0
        : reveal(
            frame,
            c2.startFrame + C2_COMPRESS_REL_START,
            C2_COMPRESS_DURATION,
            EASE.inOutCubic,
          );
    const w = lerp(LOOSE_ROW_WIDTH, BUNDLE_WIDTH, compress);
    return snapshot(
      centeredBox(640, TEACHING_ROW_Y_SINGLE, w, STICK_LENGTH),
      opacity,
    );
  },
};

const c1Badges: SceneElement = {
  id: "c1-badges",
  zone: "badges",
  bboxAt: (frame) => {
    const fade = c1BadgesFadeOut(frame);
    if (fade <= 0) return null;
    // Use the average across the 10 badges' progresses to flag visibility.
    let anyVisible = false;
    for (let i = 0; i < STICK_COUNT; i += 1) {
      if (c1BadgeProgress(i, frame) > 0) {
        anyVisible = true;
        break;
      }
    }
    if (!anyVisible) return null;
    const size = 48;
    const w = (STICK_COUNT - 1) * ROW_GAP + size;
    return snapshot(centeredBox(640, BADGE_Y, w, size), fade);
  },
};

const bundleSticks = (index: number): SceneElement => ({
  id: `bundle-${index}-sticks`,
  zone: "objects",
  bboxAt: (frame) => {
    if (index === 0 && !bundle0Visible(frame)) return null;
    const opacity = bundleEntranceOpacity(index, frame);
    if (opacity <= 0) return null;
    const x = bundleTranslateX(index, frame) + bundleEntranceSlideX(index, frame);
    const y = bundleRowY(frame);
    return snapshot(
      centeredBox(x, y, BUNDLE_WIDTH, STICK_LENGTH),
      opacity,
    );
  },
});

const bundleWrapEl = (index: number): SceneElement => ({
  id: `bundle-${index}-wrap`,
  zone: "objects",
  bboxAt: (frame) => {
    if (index === 0 && !bundle0Visible(frame)) return null;
    const opacity = bundleEntranceOpacity(index, frame);
    if (opacity <= 0) return null;
    const x = bundleTranslateX(index, frame) + bundleEntranceSlideX(index, frame);
    const y = bundleRowY(frame);
    // BundleWrap primitive vertical extent (see counting.tsx
    // BundleWrapBowKnot): anchorY = -0.68 * bandHeight; loopCenterY +
    // loopRy = -0.69 * bandHeight magnitude → bow top ≈ -1.37 * bandHeight.
    // Rope half-height ≈ 0.6 * bandHeight downward (ropeStroke/2 + offset).
    const top = -BUNDLE_BAND_HEIGHT * 1.4;
    const bottom = BUNDLE_BAND_HEIGHT * 0.6;
    const cy = y + (top + bottom) / 2;
    const h = bottom - top;
    return snapshot(centeredBox(x, cy, BUNDLE_WIDTH, h), opacity);
  },
});

const bundleBadge = (index: number): SceneElement => ({
  id: `bundle-${index}-badge`,
  zone: "badges",
  bboxAt: (frame) => {
    const opacity = bundleBadgeOpacity(index, frame);
    if (opacity <= 0) return null;
    const x = bundleTranslateX(index, frame) + bundleEntranceSlideX(index, frame);
    const size = 48;
    return snapshot(centeredBox(x, BADGE_Y, size, size), opacity);
  },
});

const bundleLabel = (index: number, text: string): SceneElement => ({
  id: `bundle-${index}-label`,
  zone: "labels",
  bboxAt: (frame) => {
    const opacity = bundleLabelOpacity(index, frame);
    if (opacity <= 0) return null;
    const x = bundleTranslateX(index, frame) + bundleEntranceSlideX(index, frame);
    const w = text.length * LABEL_FONT_SIZE * 0.62;
    const h = LABEL_FONT_SIZE * 1.2;
    return snapshot(centeredBox(x, LABEL_Y, w, h), opacity);
  },
});

const beat5LooseRow: SceneElement = {
  id: "beat5-loose-row",
  zone: "objects",
  bboxAt: (frame) => {
    const opacity = beat5LooseRowOpacity(frame);
    if (opacity <= 0) return null;
    return snapshot(
      centeredBox(640, TOP_LOOSE_ROW_Y, LOOSE_ROW_WIDTH, STICK_LENGTH),
      opacity,
    );
  },
};

const tenPill: SceneElement = {
  id: "tally-ten-bu",
  // The two pills are above their respective rows. Place in "labels" zone
  // (not "tally") because visual-design's literal y=110..180 tally zone
  // only fits the "十步" pill; "三步" must sit between the two rows.
  // Manifest collision check is informational — we document the intent.
  zone: "labels",
  bboxAt: (frame) => {
    const opacity = tenPillOpacity(frame);
    if (opacity <= 0) return null;
    const size = 52;
    const w = stepTallyPillWidth(10, size, true);
    return snapshot(centeredBox(640, TOP_LOOSE_ROW_Y - 70, w, size), opacity);
  },
};

const threePill: SceneElement = {
  id: "tally-three-bu",
  zone: "labels",
  bboxAt: (frame) => {
    const opacity = threePillOpacity(frame);
    if (opacity <= 0) return null;
    const size = 52;
    const w = stepTallyPillWidth(3, size, true);
    return snapshot(centeredBox(640, THREE_PILL_Y, w, size), opacity);
  },
};

// ---------------------------------------------------------------------------
// Key frames
// ---------------------------------------------------------------------------
const keyFrames: readonly KeyFrame[] = [
  {
    id: "loose-count-felt:cascade-mid",
    cueId: "loose-count-felt",
    offset: 80,
    label:
      "row of 10 sticks, ~5 count badges revealed above (1..5), cascade walking",
  },
  {
    id: "loose-count-felt:full",
    cueId: "loose-count-felt",
    offset: 170,
    label: "row of 10 sticks + all 10 count badges visible; felt-labor hold",
  },
  {
    id: "bundle-is-one-count:wrap",
    cueId: "bundle-is-one-count",
    offset: 50,
    label:
      "sticks compressed into bundle layout; coral rope tying with top bow forming",
  },
  {
    id: "bundle-is-one-count:landed",
    cueId: "bundle-is-one-count",
    offset: 100,
    label:
      "bundle settled at center, 一个十 label below, '1' badge above bundle",
  },
  {
    id: "tens-count-like-ones:two",
    cueId: "tens-count-like-ones",
    offset: 75,
    label:
      "two bundles side-by-side; badges 1, 2 above; labels 一个十, 两个十 below",
  },
  {
    id: "pattern-holds:three",
    cueId: "pattern-holds",
    offset: 70,
    label:
      "three bundles in row; badges 1, 2, 3 above; labels 一个十, 两个十, 三个十 below",
  },
  {
    id: "tens-are-the-faster-way:both-rows",
    cueId: "tens-are-the-faster-way",
    offset: 60,
    label:
      "loose row of 10 fading in above; 3-bundle row reflowing below; no pills yet",
  },
  {
    id: "tens-are-the-faster-way:climax",
    cueId: "tens-are-the-faster-way",
    offset: 140,
    label:
      "both rows settled; '十步' pill above loose row; '三步' pill above bundle row; sparkle on '三步'",
  },
];

const elements: readonly SceneElement[] = [
  c1LooseRow,
  c1Badges,
  bundleSticks(0),
  bundleSticks(1),
  bundleSticks(2),
  bundleWrapEl(0),
  bundleWrapEl(1),
  bundleWrapEl(2),
  bundleBadge(0),
  bundleBadge(1),
  bundleBadge(2),
  bundleLabel(0, "一个十"),
  bundleLabel(1, "两个十"),
  bundleLabel(2, "三个十"),
  beat5LooseRow,
  tenPill,
  threePill,
];

// Silence unused-import diagnostics on these layout constants — they're
// referenced via the scene/manifest pairing for future expansion (per-stick
// badge bboxes for cue 1 cascade) but not registered as individual elements
// to keep collision noise manageable.
void looseRowStickX;

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kp2v2-counting-by-tens",
  composition: "CompleteKp2v2CountingByTensLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kp2v2CountingByTensAlignedCues as readonly AlignedLessonCue[],
  keyFrames,
  elements,
  zones: ZONES,
};
