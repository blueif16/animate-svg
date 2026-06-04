import type { AlignedLessonCue } from "@studio/narration-kit";
import { cueMap } from "@studio/narration-kit";
import type {
  Bbox,
  ElementSnapshot,
  KeyFrame,
  LessonManifest,
  SceneElement,
} from "../manifestTypes";
import { tenOnesMakeOneTenAlignedCues } from "../generated/tenOnesMakeOneTenTiming";
import {
  BADGE_Y,
  BUNDLE_ASSET_WIDTH,
  BUNDLE_BADGE_FADE_DURATION,
  BUNDLE_COMPRESS_REL_START,
  BUNDLE_GAP,
  BUNDLE_MORPH_REL_START,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FASTER_GHOST_FADE_DURATION,
  FASTER_LABEL_EXIT_DURATION,
  FASTER_ONE_BADGE_DURATION,
  FASTER_ONE_BADGE_REL_START,
  FASTER_ONE_TALLY_DURATION,
  FASTER_ONE_TALLY_REL_START,
  FASTER_SLIDE_DURATION,
  FEELS_SLOW_TALLY_DURATION,
  FEELS_SLOW_TALLY_REL_START,
  LABEL_X,
  LABEL_Y,
  LEFT_HALF_CX,
  OPENING_ENTER_DURATION,
  PEEK_LABEL_X,
  PEEK_LABEL_Y,
  RECAP_SENTENCE_DURATION,
  RECAP_SENTENCE_REL_START,
  RECAP_SLIDE_BACK_DURATION,
  RENAME_LABEL_DURATION,
  RENAME_LABEL_REL_START,
  RIGHT_HALF_CX,
  ROW_GAP,
  STICK_COUNT,
  STICK_LENGTH,
  STICK_THICKNESS,
  STICKS_ORIGIN_X,
  STICKS_ORIGIN_Y,
  STILL_LABEL_DURATION,
  STILL_LABEL_REL_START,
  STILL_PEEK_HOLD_DURATION,
  STILL_PEEK_IN_DURATION,
  STILL_PEEK_OUT_DURATION,
  TALLY_X,
  TALLY_Y,
  ZONES,
} from "./layout";

const cues = cueMap(tenOnesMakeOneTenAlignedCues);

// ---------------------------------------------------------------------------
// Pure-TS easing — bezier solver mirroring Remotion's Easing.bezier so opacity
// curves match the scene without importing Remotion at runtime.
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
    if (x <= 0) {
      return 0;
    }
    if (x >= 1) {
      return 1;
    }
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const dx = sampleCurveX(t) - x;
      const d = sampleDerivativeX(t);
      if (Math.abs(dx) < 1e-6) {
        break;
      }
      if (Math.abs(d) < 1e-6) {
        break;
      }
      t -= dx / d;
    }
    return sampleCurveY(t);
  };
};

const EASE = {
  outCubic: cubicBezier(0.33, 1, 0.68, 1),
  outQuint: cubicBezier(0.22, 1, 0.36, 1),
  inOutCubic: cubicBezier(0.65, 0, 0.35, 1),
  overshoot: cubicBezier(0.34, 1.56, 0.64, 1),
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = (t) => t,
) => {
  const safeEnd = Math.max(start + 1, end);
  const t = clamp01((frame - start) / (safeEnd - start));
  return easing(t);
};

const reveal = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE.outCubic,
) => progress(frame, start, start + Math.max(1, duration), easing);

const clampToCue = (start: number, duration: number, cueEnd: number) => {
  const cappedDuration = Math.max(1, Math.min(duration, cueEnd - start));
  return { duration: cappedDuration, start };
};

// ---------------------------------------------------------------------------
// Cue lookups
// ---------------------------------------------------------------------------
const opening = cues["opening"];
const countToTen = cues["count-to-ten"];
const feelsSlow = cues["feels-slow"];
const bundleAction = cues["bundle-action"];
const renameBundle = cues["rename-bundle"];
const stillTenOnes = cues["still-ten-ones"];
const fasterCount = cues["faster-count"];
const recap = cues["recap"];

// ---------------------------------------------------------------------------
// Shared helpers replicating scene-level group transforms
// ---------------------------------------------------------------------------
const bundleGroupXAt = (frame: number) => {
  const slideToRightT = reveal(
    frame,
    fasterCount.startFrame,
    FASTER_SLIDE_DURATION,
    EASE.inOutCubic,
  );
  const slideBackT = reveal(
    frame,
    recap.startFrame,
    RECAP_SLIDE_BACK_DURATION,
    EASE.inOutCubic,
  );
  if (frame >= recap.startFrame) {
    return lerp(RIGHT_HALF_CX, STICKS_ORIGIN_X, slideBackT);
  }
  if (frame >= fasterCount.startFrame) {
    return lerp(STICKS_ORIGIN_X, RIGHT_HALF_CX, slideToRightT);
  }
  return STICKS_ORIGIN_X;
};

const bundleGroupScaleAt = (frame: number) => {
  const slideToRightT = reveal(
    frame,
    fasterCount.startFrame,
    FASTER_SLIDE_DURATION,
    EASE.inOutCubic,
  );
  const slideBackT = reveal(
    frame,
    recap.startFrame,
    RECAP_SLIDE_BACK_DURATION,
    EASE.inOutCubic,
  );
  if (frame >= recap.startFrame) {
    return lerp(0.9, 1, slideBackT);
  }
  if (frame >= fasterCount.startFrame) {
    return lerp(1, 0.9, slideToRightT);
  }
  return 1;
};

const openingEntryOpacityAt = (frame: number) =>
  reveal(frame, opening.startFrame, OPENING_ENTER_DURATION);

const badgeFadeOutAt = (frame: number) =>
  1 - reveal(frame, bundleAction.startFrame, BUNDLE_BADGE_FADE_DURATION);

const peekLabelOpacityAt = (frame: number): number => {
  const stillStart = stillTenOnes.startFrame;
  const stillEnd = stillTenOnes.endFrame;
  const peekOutEnd = Math.min(stillStart + STILL_PEEK_OUT_DURATION, stillEnd);
  const peekHoldEnd = Math.min(
    peekOutEnd + STILL_PEEK_HOLD_DURATION,
    stillEnd,
  );
  const peekInEnd = Math.min(peekHoldEnd + STILL_PEEK_IN_DURATION, stillEnd);
  if (frame < stillStart || frame >= fasterCount.startFrame) {
    return 0;
  }
  const peekStart = stillStart + STILL_LABEL_REL_START;
  if (frame >= peekStart && frame <= peekHoldEnd) {
    return reveal(frame, peekStart, STILL_LABEL_DURATION);
  }
  if (frame > peekHoldEnd && frame <= peekInEnd) {
    return 1 - progress(frame, peekHoldEnd, peekInEnd, EASE.inOutCubic);
  }
  return 0;
};

const labelOpacityAt = (frame: number) => {
  const labelEnter = reveal(
    frame,
    renameBundle.startFrame + RENAME_LABEL_REL_START,
    RENAME_LABEL_DURATION,
  );
  const labelExit =
    1 - reveal(frame, fasterCount.startFrame, FASTER_LABEL_EXIT_DURATION);
  return labelEnter * labelExit;
};

const LABEL_FONT_SIZE = 64;

// ---------------------------------------------------------------------------
// Bbox geometry helpers
// ---------------------------------------------------------------------------
const centeredBox = (
  cx: number,
  cy: number,
  w: number,
  h: number,
): Bbox => [cx - w / 2, cy - h / 2, w, h];

const snapshot = (bbox: Bbox, opacity: number): ElementSnapshot | null => {
  if (opacity <= 0) {
    return null;
  }
  return { bbox, opacity: clamp01(opacity) };
};

// StepTally pillWidth from counting.tsx
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
// Element bbox functions
// ---------------------------------------------------------------------------
// Frame at which the gathered ones hand off to the held roped-bundle asset.
const morphHandoffFrame = bundleAction.startFrame + BUNDLE_MORPH_REL_START;

const sticksRow: SceneElement = {
  id: "sticks-row",
  zone: "objects",
  bboxAt: (frame) => {
    if (frame < opening.startFrame) {
      return null;
    }
    // Once the magic-transition takes over, the asset element (below) owns the
    // footprint — the parametric sticks are gone (AssetMorph crossfades them out).
    if (frame >= morphHandoffFrame) {
      return null;
    }
    const opacity = openingEntryOpacityAt(frame);
    if (opacity <= 0) {
      return null;
    }
    const groupX = bundleGroupXAt(frame);
    const scale = bundleGroupScaleAt(frame);
    // The cluster converges to "bundle" layout once the gather begins.
    const inBundle = frame >= bundleAction.startFrame + BUNDLE_COMPRESS_REL_START;
    const inScatter = frame < opening.endFrame;
    let halfWidth: number;
    let halfHeight: number;
    if (inScatter) {
      halfWidth = 180 + STICK_THICKNESS / 2;
      halfHeight = 180 * 0.55 + STICK_LENGTH / 2;
    } else if (inBundle) {
      halfWidth =
        ((STICK_COUNT - 1) * BUNDLE_GAP + STICK_THICKNESS) / 2;
      halfHeight = STICK_LENGTH / 2;
    } else {
      halfWidth =
        ((STICK_COUNT - 1) * ROW_GAP + STICK_THICKNESS) / 2;
      halfHeight = STICK_LENGTH / 2;
    }
    const w = halfWidth * 2 * scale;
    const h = halfHeight * 2 * scale;
    return snapshot(centeredBox(groupX, STICKS_ORIGIN_Y, w, h), opacity);
  },
};

// The held roped-bundle ASSET (post-morph), and the conservation x-ray that
// occupies the same center during the still-ten-ones peek. The IconAsset is
// rendered at BUNDLE_ASSET_WIDTH, centered on the group origin; the swap to the
// ConservationBundle peek crossfades in place, so the footprint stays present.
const bundleAssetEl: SceneElement = {
  id: "bundle-asset",
  zone: "objects",
  bboxAt: (frame) => {
    if (frame < morphHandoffFrame) {
      return null;
    }
    const opacity = openingEntryOpacityAt(frame);
    if (opacity <= 0) {
      return null;
    }
    const groupX = bundleGroupXAt(frame);
    const scale = bundleGroupScaleAt(frame);
    // The asset is square (512×512 viewBox) rendered at BUNDLE_ASSET_WIDTH; its
    // visible diagonal bundle fills most of the box. Use the render box.
    const w = BUNDLE_ASSET_WIDTH * scale;
    const h = BUNDLE_ASSET_WIDTH * scale;
    return snapshot(centeredBox(groupX, STICKS_ORIGIN_Y, w, h), opacity);
  },
};

const countBadgesEl: SceneElement = {
  id: "count-badges",
  zone: "badges",
  bboxAt: (frame) => {
    const fade = badgeFadeOutAt(frame);
    if (frame < countToTen.startFrame || fade <= 0) {
      return null;
    }
    const size = 50;
    const w = (STICK_COUNT - 1) * ROW_GAP + size;
    const h = size;
    return snapshot(centeredBox(STICKS_ORIGIN_X, BADGE_Y, w, h), fade);
  },
};

const tally10El: SceneElement = {
  id: "tally-10",
  zone: "tally",
  bboxAt: (frame) => {
    const tallyEnter = reveal(
      frame,
      feelsSlow.startFrame + FEELS_SLOW_TALLY_REL_START,
      FEELS_SLOW_TALLY_DURATION,
      EASE.overshoot,
    );
    const opacity = tallyEnter * badgeFadeOutAt(frame);
    if (opacity <= 0) {
      return null;
    }
    const size = 48;
    const w = stepTallyPillWidth(10, size, true);
    return snapshot(centeredBox(TALLY_X, TALLY_Y, w, size), opacity);
  },
};

const tally1El: SceneElement = {
  id: "tally-1",
  zone: "tally",
  bboxAt: (frame) => {
    const oneTallyEnter = reveal(
      frame,
      fasterCount.startFrame + FASTER_ONE_TALLY_REL_START,
      FASTER_ONE_TALLY_DURATION,
    );
    const oneSideExit =
      1 - reveal(frame, recap.startFrame, RECAP_SLIDE_BACK_DURATION);
    const opacity = oneTallyEnter * oneSideExit;
    if (opacity <= 0) {
      return null;
    }
    const size = 48;
    const w = stepTallyPillWidth(1, size, true);
    return snapshot(centeredBox(RIGHT_HALF_CX, TALLY_Y, w, size), opacity);
  },
};

const tally10GhostEl: SceneElement = {
  id: "tally-10-ghost",
  zone: "tally",
  bboxAt: (frame) => {
    const ghostFadeIn = reveal(
      frame,
      fasterCount.startFrame,
      FASTER_GHOST_FADE_DURATION,
    );
    const ghostFadeOut =
      1 - reveal(frame, recap.startFrame, FASTER_GHOST_FADE_DURATION);
    const opacity = ghostFadeIn * ghostFadeOut * 0.55;
    if (opacity <= 0) {
      return null;
    }
    const size = 44;
    const w = stepTallyPillWidth(10, size, true) * 0.6;
    const cy = STICKS_ORIGIN_Y + 120 * 0.6;
    return snapshot(centeredBox(LEFT_HALF_CX, cy, w, size * 0.6), opacity);
  },
};

const labelYigeshi: SceneElement = {
  id: "label-yigeshi",
  zone: "labels",
  bboxAt: (frame) => {
    const opacity = labelOpacityAt(frame);
    if (opacity <= 0) {
      return null;
    }
    const w = 3 * LABEL_FONT_SIZE * 0.62;
    const h = LABEL_FONT_SIZE * 1.2;
    return snapshot(centeredBox(LABEL_X, LABEL_Y, w, h), opacity);
  },
};

const labelPeek10: SceneElement = {
  id: "label-peek-10",
  // The peek "10" now sits above the bundle (PEEK_LABEL_Y), labelling the
  // revealed ten ones in the badges band rather than stacking in the labels zone.
  zone: "badges",
  bboxAt: (frame) => {
    const opacity = peekLabelOpacityAt(frame);
    if (opacity <= 0) {
      return null;
    }
    const fontSize = 40;
    const w = 2 * fontSize * 0.62;
    const h = fontSize * 1.2;
    return snapshot(centeredBox(PEEK_LABEL_X, PEEK_LABEL_Y, w, h), opacity);
  },
};

const labelTakeaway: SceneElement = {
  id: "label-takeaway",
  zone: "labels",
  bboxAt: (frame) => {
    const opacity = reveal(
      frame,
      recap.startFrame + RECAP_SENTENCE_REL_START,
      RECAP_SENTENCE_DURATION,
    );
    if (opacity <= 0) {
      return null;
    }
    const fontSize = 64;
    const text = "十个一 = 一个十";
    const w = text.length * fontSize * 0.62;
    const h = fontSize * 1.2;
    return snapshot(centeredBox(LABEL_X, LABEL_Y, w, h), opacity);
  },
};

const badgeOne: SceneElement = {
  id: "badge-one",
  zone: "badges",
  bboxAt: (frame) => {
    const oneBadgeEnter = reveal(
      frame,
      fasterCount.startFrame + FASTER_ONE_BADGE_REL_START,
      FASTER_ONE_BADGE_DURATION,
      EASE.overshoot,
    );
    const oneSideExit =
      1 - reveal(frame, recap.startFrame, RECAP_SLIDE_BACK_DURATION);
    const opacity = oneBadgeEnter * oneSideExit;
    if (opacity <= 0) {
      return null;
    }
    const size = 56;
    return snapshot(centeredBox(RIGHT_HALF_CX, BADGE_Y, size, size), opacity);
  },
};

// ---------------------------------------------------------------------------
// Sketch marks — same cue-relative timing schedule as the scene.
// ---------------------------------------------------------------------------
type MarkSpec = {
  cueId: string;
  drawRelStart: number;
  drawDuration: number;
  fadeOutRelStart: number;
};

const markVisibility = (frame: number, spec: MarkSpec): number => {
  const cue = cues[spec.cueId];
  if (!cue) {
    return 0;
  }
  const cueStart = cue.startFrame;
  const cueEnd = cue.endFrame;
  const drawWindow = clampToCue(
    cueStart + spec.drawRelStart,
    spec.drawDuration,
    cueEnd,
  );
  if (frame < drawWindow.start || frame > cueEnd) {
    return 0;
  }
  const fadeOutStart = Math.min(cueStart + spec.fadeOutRelStart, cueEnd - 8);
  const fadeOut = progress(frame, fadeOutStart, fadeOutStart + 8);
  const opacity = (1 - fadeOut) * 0.92;
  return Math.max(0, opacity);
};

const markFeelsSlowUnderline: SceneElement = {
  id: "mark-feels-slow-underline",
  zone: "marks",
  bboxAt: (frame) => {
    const opacity = markVisibility(frame, {
      cueId: "feels-slow",
      drawDuration: 24,
      drawRelStart: 4,
      fadeOutRelStart: 80,
    });
    if (opacity <= 0) {
      return null;
    }
    const strokeHalf = 2 + 3;
    return snapshot(
      [340 - strokeHalf, 420 - strokeHalf, 600 + strokeHalf * 2, strokeHalf * 2],
      opacity,
    );
  },
};

const markBundleWrapArc: SceneElement = {
  id: "mark-bundle-wrap-arc",
  zone: "marks",
  bboxAt: (frame) => {
    const opacity = markVisibility(frame, {
      cueId: "bundle-action",
      drawDuration: 22,
      drawRelStart: 14,
      fadeOutRelStart: 64,
    });
    if (opacity <= 0) {
      return null;
    }
    const strokeHalf = 2 + 5;
    const top = 330 - 36 - strokeHalf;
    const bottom = 330 + strokeHalf;
    return snapshot(
      [565 - strokeHalf, top, 150 + strokeHalf * 2, bottom - top],
      opacity,
    );
  },
};

const markRenameArrow: SceneElement = {
  id: "mark-rename-arrow",
  zone: "marks",
  bboxAt: (frame) => {
    const opacity = markVisibility(frame, {
      cueId: "rename-bundle",
      drawDuration: 18,
      drawRelStart: 26,
      fadeOutRelStart: 90,
    });
    if (opacity <= 0) {
      return null;
    }
    return snapshot([640 - 20, 420, 40, 520 - 420], opacity);
  },
};

const markFasterVs: SceneElement = {
  id: "mark-faster-vs",
  zone: "marks",
  bboxAt: (frame) => {
    const opacity = markVisibility(frame, {
      cueId: "faster-count",
      drawDuration: 12,
      drawRelStart: 50,
      fadeOutRelStart: 92,
    });
    if (opacity <= 0) {
      return null;
    }
    return snapshot([640 - 20, 360 - 20, 40, 40], opacity);
  },
};

const markRecapUnderline: SceneElement = {
  id: "mark-recap-underline",
  zone: "marks",
  bboxAt: (frame) => {
    const opacity = markVisibility(frame, {
      cueId: "recap",
      drawDuration: 18,
      drawRelStart: 78,
      fadeOutRelStart: 118,
    });
    if (opacity <= 0) {
      return null;
    }
    const strokeHalf = 2 + 4;
    return snapshot(
      [680 - strokeHalf, 600 - strokeHalf, 120 + strokeHalf * 2, strokeHalf * 2],
      opacity,
    );
  },
};

// ---------------------------------------------------------------------------
// Key frames — labels describe what to look for at each snapshot.
// ---------------------------------------------------------------------------
const keyFrames: readonly KeyFrame[] = [
  {
    id: "opening:hold",
    cueId: "opening",
    offset: 80,
    label: "scatter of 10 sticks settled in zone-objects; no badges, no tally",
  },
  {
    id: "count-to-ten:mid",
    cueId: "count-to-ten",
    offset: 30,
    label: "row of 10 sticks with some count badges revealed above",
  },
  {
    id: "feels-slow:hold",
    cueId: "feels-slow",
    offset: 60,
    label: "row of 10, full badge row, 10步 tally pill, feels-slow underline drawn",
  },
  {
    id: "bundle-action:climax",
    cueId: "bundle-action",
    offset: 40,
    label: "sticks gathered + SparkleBurst masking the morph into the roped-bundle asset; badges/tally faded out",
  },
  {
    id: "bundle-action:post",
    cueId: "bundle-action",
    offset: 70,
    label: "roped-bundle ASSET fully present (IconAsset stick-bundle-roped); arc traced over",
  },
  {
    id: "rename-bundle:hold",
    cueId: "rename-bundle",
    offset: 70,
    label: "bundle centered with 一个十 label below in zone-labels; arrow drawn",
  },
  {
    id: "still-ten-ones:peek",
    cueId: "still-ten-ones",
    offset: 50,
    label: "bundle x-rayed open (ConservationBundle) revealing the ten ones inside; peek '10' label above the bundle (badges band)",
  },
  {
    id: "faster-count:contrast",
    cueId: "faster-count",
    offset: 80,
    label: "left ghost row of 10 + 10步 ghost tally vs right bundle + 1 badge + 1步 tally",
  },
  {
    id: "recap:takeaway",
    cueId: "recap",
    offset: 100,
    label: "bundle back at center; takeaway sentence 十个一 = 一个十 with underline",
  },
];

export const KEY_FRAMES = keyFrames;

const elements: readonly SceneElement[] = [
  sticksRow,
  bundleAssetEl,
  countBadgesEl,
  tally10El,
  tally1El,
  tally10GhostEl,
  labelYigeshi,
  labelPeek10,
  labelTakeaway,
  badgeOne,
  markFeelsSlowUnderline,
  markBundleWrapArc,
  markRenameArrow,
  markFasterVs,
  markRecapUnderline,
];

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "ten-ones-make-one-ten",
  composition: "CompleteTenOnesMakeOneTenLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: tenOnesMakeOneTenAlignedCues as readonly AlignedLessonCue[],
  keyFrames,
  elements,
  zones: ZONES,
};
