import type { AlignedLessonCue } from "@studio/narration-kit";
import { cueMap } from "@studio/narration-kit";
import type {
  Bbox,
  ElementSnapshot,
  KeyFrame,
  LessonManifest,
  SceneElement,
} from "../../manifestTypes";
import { kp1FenYuHeIntroCues } from "../kp1FenYuHeIntroLessonTimeline";
import { getFenHeDiagramAnchors } from "../../../shape-primitives/counting";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CHIP_HEIGHT,
  CHIP_LEFT_X,
  CHIP_RIGHT_X,
  CHIP_WHOLE_X,
  CHIP_WIDTH,
  CHIP_Y,
  DOT_COUNT,
  DOT_DIAMETER,
  DOT_ROW_Y,
  DOT_SPACING,
  FENHESHI_DOTS_DIM_DUR,
  FENHESHI_DOTS_DISMISS_DUR,
  FENHESHI_DOTS_DISMISS_REL_START,
  FENHESHI_LINE_LEFT_DUR,
  FENHESHI_LINE_LEFT_REL_START,
  FENHESHI_MIGRATE_2_REL_START,
  FENHESHI_MIGRATE_3_REL_START,
  FENHESHI_MIGRATE_5_REL_START,
  FENHESHI_MIGRATE_DUR,
  FENHESHI_STRIP_FADE_OUT_DUR,
  FENHESHI_TERM_DUR,
  FENHESHI_TERM_REL_START,
  FEN_DOTS_FADE_IN_DUR,
  FEN_NAME_CHIP_2_REL_START,
  FEN_NAME_CHIP_3_REL_START,
  FEN_NAME_CHIP_5_REL_START,
  FEN_NAME_CHIP_DUR,
  FEN_NAME_TERM_DUR,
  FEN_NAME_TERM_REL_START,
  FEN_SPLIT_DUR,
  FEN_SPLIT_REL_START,
  FIVE14_NEW_DUR,
  FIVE14_NEW_REL_START,
  FIVE14_SLIDE_DUR,
  FIVE14_SLIDE_REL_START,
  FIVE14_TERM_FADE_OUT_DUR,
  FIVE32_NEW_32_DUR,
  FIVE32_NEW_32_REL_START,
  FIVE32_NEW_41_DUR,
  FIVE32_NEW_41_REL_START,
  HE_NAME_ARROW_DUR,
  HE_NAME_ARROW_REL_START,
  HE_NAME_FEN_DUR,
  HE_NAME_FEN_REL_START,
  HE_NAME_HE_DUR,
  HE_NAME_HE_REL_START,
  HE_NAME_STRIP_CARDS_DUR,
  HE_NAME_STRIP_CARDS_REL_START,
  HE_SHOW_CHIPS_FADE_OUT_DUR,
  HE_SHOW_REJOIN_DUR,
  HE_SHOW_REJOIN_REL_START,
  HE_SHOW_TERM_FADE_OUT_DUR,
  INTRO_PREVIEW_DOT_DIAMETER,
  INTRO_PREVIEW_FADE_DUR,
  INTRO_PREVIEW_FADE_IN_REL_START,
  INTRO_PREVIEW_Y,
  INTRO_SUBTITLE_DUR,
  INTRO_SUBTITLE_REL_START,
  INTRO_SUBTITLE_Y,
  INTRO_TITLE_DUR,
  INTRO_TITLE_REL_START,
  INTRO_TITLE_Y,
  LABEL_CX,
  LABEL_Y,
  READ_ARROW_BOTTOM_Y,
  READ_ARROW_LEFT_X,
  READ_ARROW_RIGHT_X,
  READ_ARROW_TOP_Y,
  READ_LABEL_DOWN_X,
  READ_LABEL_UP_X,
  OUTRO_DIAGRAMS_SLIDE_DUR,
  OUTRO_DIAGRAMS_SLIDE_REL_START,
  OUTRO_DIAGRAM_CY,
  OUTRO_DIAGRAM_WIDTH,
  OUTRO_STRIP_CARD_H,
  OUTRO_STRIP_CARD_W,
  OUTRO_STRIP_CX,
  OUTRO_STRIP_FADE_DUR,
  OUTRO_STRIP_FADE_REL_START,
  OUTRO_STRIP_LEFT_CX,
  OUTRO_STRIP_RIGHT_CX,
  OUTRO_STRIP_Y,
  OUTRO_TITLE_CX,
  OUTRO_TITLE_DUR,
  OUTRO_TITLE_REL_START,
  OUTRO_TITLE_Y,
  PRIMARY_LABEL_FONT_SIZE,
  READ_DOWN_DUR,
  READ_DOWN_REL_START,
  READ_FENCHENG_DUR,
  READ_FENCHENG_REL_START,
  READ_UP_DUR,
  READ_UP_REL_START,
  READ_ZUCHENG_DUR,
  READ_ZUCHENG_REL_START,
  ROW_DIAGRAM_CY,
  ROW_DIAGRAM_WIDTH,
  SINGLE_DIAGRAM_CX,
  SINGLE_DIAGRAM_CY,
  SINGLE_DIAGRAM_WIDTH,
  STRIP_CARD_H,
  STRIP_CARD_W,
  STRIP_LEFT_CX,
  STRIP_RIGHT_CX,
  STRIP_TERM_FEN_X,
  STRIP_TERM_HE_X,
  STRIP_TERM_Y,
  STRIP_WHOLE_CX,
  STRIP_Y,
  SUBTITLE_FONT_SIZE,
  TERM_FONT_SIZE,
  TITLE_FONT_SIZE,
  ZONES,
  dotJoinedX,
  dotSplitX,
  outroDiagramCX,
  rowDiagramCX,
} from "./layout";

// ---------------------------------------------------------------------------
// Pure-TS easing helpers — mirror Remotion's Easing.bezier so the manifest
// produces the same bboxAt(frame) values the scene renders at runtime.
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
  enter: cubicBezier(0.16, 1, 0.3, 1),
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
): number => {
  const safeEnd = Math.max(start + 1, end);
  return easing(clamp01((frame - start) / (safeEnd - start)));
};

const reveal = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE.outCubic,
): number => progress(frame, start, start + Math.max(1, duration), easing);

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

// ---------------------------------------------------------------------------
// Cue lookups — must mirror scene
// ---------------------------------------------------------------------------
const cues = cueMap(kp1FenYuHeIntroCues);
const cIntro = cues["intro"];
const cFenShow = cues["fen-show"];
const cFenName = cues["fen-name"];
const cHeShow = cues["he-show"];
const cHeName = cues["he-name"];
const cFenheshiIntro = cues["fenheshi-intro"];
const cFenheshiRead = cues["fenheshi-read"];
const cFive14 = cues["five-1-4"];
const cFive32 = cues["five-3-2-and-4-1"];
const cOutro = cues["outro"];

// ---------------------------------------------------------------------------
// Mirrors of the scene's helpers — re-implemented here so this module is
// pure TS (no React/Remotion). Same numeric outputs as the scene's.
// ---------------------------------------------------------------------------
const dotRowMountFrame = () => cFenShow.startFrame;
const dotRowDismissFrame = () =>
  cFenheshiIntro.startFrame + FENHESHI_DOTS_DISMISS_REL_START;

const dotX = (index: number, frame: number): number => {
  const fenSplitStart = cFenShow.startFrame + FEN_SPLIT_REL_START;
  const fenSplitEnd = fenSplitStart + FEN_SPLIT_DUR;
  const heRejoinStart = cHeShow.startFrame + HE_SHOW_REJOIN_REL_START;
  const heRejoinEnd = heRejoinStart + HE_SHOW_REJOIN_DUR;
  if (frame < fenSplitStart) return dotJoinedX(index);
  if (frame < fenSplitEnd) {
    const t = reveal(frame, fenSplitStart, FEN_SPLIT_DUR, EASE.inOutCubic);
    return lerp(dotJoinedX(index), dotSplitX(index), t);
  }
  if (frame < heRejoinStart) return dotSplitX(index);
  if (frame < heRejoinEnd) {
    const t = reveal(frame, heRejoinStart, HE_SHOW_REJOIN_DUR, EASE.inOutCubic);
    return lerp(dotSplitX(index), dotJoinedX(index), t);
  }
  return dotJoinedX(index);
};

const dotRowOpacity = (frame: number): number => {
  if (frame < dotRowMountFrame()) return 0;
  const fadeIn = reveal(frame, dotRowMountFrame(), FEN_DOTS_FADE_IN_DUR);
  if (frame < cFenheshiIntro.startFrame) return fadeIn;
  const dim =
    1 - reveal(frame, cFenheshiIntro.startFrame, FENHESHI_DOTS_DIM_DUR) * 0.75;
  if (frame < dotRowDismissFrame()) return dim;
  const dismiss =
    1 - reveal(frame, dotRowDismissFrame(), FENHESHI_DOTS_DISMISS_DUR);
  return 0.25 * dismiss;
};

type ChipKind = "whole" | "left" | "right";

const chipAnchorX = (kind: ChipKind): number => {
  if (kind === "whole") return CHIP_WHOLE_X;
  if (kind === "left") return CHIP_LEFT_X;
  return CHIP_RIGHT_X;
};

const fixedDiagramAnchors = getFenHeDiagramAnchors(SINGLE_DIAGRAM_WIDTH);

const chipDiagramTargetX = (kind: ChipKind): number => {
  if (kind === "whole") return SINGLE_DIAGRAM_CX + fixedDiagramAnchors.whole.x;
  if (kind === "left")
    return SINGLE_DIAGRAM_CX + fixedDiagramAnchors.leftPart.x;
  return SINGLE_DIAGRAM_CX + fixedDiagramAnchors.rightPart.x;
};

const chipDiagramTargetY = (kind: ChipKind): number => {
  if (kind === "whole") return SINGLE_DIAGRAM_CY + fixedDiagramAnchors.whole.y;
  if (kind === "left")
    return SINGLE_DIAGRAM_CY + fixedDiagramAnchors.leftPart.y;
  return SINGLE_DIAGRAM_CY + fixedDiagramAnchors.rightPart.y;
};

const chipMountFrame = (kind: ChipKind): number => {
  if (kind === "whole") return cFenName.startFrame + FEN_NAME_CHIP_5_REL_START;
  if (kind === "left") return cFenName.startFrame + FEN_NAME_CHIP_2_REL_START;
  return cFenName.startFrame + FEN_NAME_CHIP_3_REL_START;
};

const chipMigrationStart = (kind: ChipKind): number => {
  if (kind === "whole") {
    return cFenheshiIntro.startFrame + FENHESHI_MIGRATE_5_REL_START;
  }
  if (kind === "left") {
    return cFenheshiIntro.startFrame + FENHESHI_MIGRATE_2_REL_START;
  }
  return cFenheshiIntro.startFrame + FENHESHI_MIGRATE_3_REL_START;
};

const centeredDiagramX = (frame: number): number => {
  const slide14Start = cFive14.startFrame + FIVE14_SLIDE_REL_START;
  const slide14End = slide14Start + FIVE14_SLIDE_DUR;
  if (frame < slide14Start) return SINGLE_DIAGRAM_CX;
  if (frame < slide14End) {
    const t = reveal(frame, slide14Start, FIVE14_SLIDE_DUR, EASE.enter);
    return lerp(SINGLE_DIAGRAM_CX, rowDiagramCX(0), t);
  }
  return rowDiagramCX(0);
};

const centeredDiagramY = (frame: number): number => {
  const slide14Start = cFive14.startFrame + FIVE14_SLIDE_REL_START;
  const slide14End = slide14Start + FIVE14_SLIDE_DUR;
  if (frame < slide14Start) return SINGLE_DIAGRAM_CY;
  if (frame < slide14End) {
    const t = reveal(frame, slide14Start, FIVE14_SLIDE_DUR, EASE.enter);
    return lerp(SINGLE_DIAGRAM_CY, ROW_DIAGRAM_CY, t);
  }
  return ROW_DIAGRAM_CY;
};

const centeredDiagramWidth = (frame: number): number => {
  const slide14Start = cFive14.startFrame + FIVE14_SLIDE_REL_START;
  const slide14End = slide14Start + FIVE14_SLIDE_DUR;
  if (frame < slide14Start) return SINGLE_DIAGRAM_WIDTH;
  if (frame < slide14End) {
    const t = reveal(frame, slide14Start, FIVE14_SLIDE_DUR, EASE.enter);
    return lerp(SINGLE_DIAGRAM_WIDTH, ROW_DIAGRAM_WIDTH, t);
  }
  return ROW_DIAGRAM_WIDTH;
};

const chipDiagramAttachedX = (kind: ChipKind, frame: number): number => {
  const w = centeredDiagramWidth(frame);
  const a = getFenHeDiagramAnchors(w);
  const cx = centeredDiagramX(frame);
  if (kind === "whole") return cx + a.whole.x;
  if (kind === "left") return cx + a.leftPart.x;
  return cx + a.rightPart.x;
};

const chipDiagramAttachedY = (kind: ChipKind, frame: number): number => {
  const w = centeredDiagramWidth(frame);
  const a = getFenHeDiagramAnchors(w);
  const cy = centeredDiagramY(frame);
  if (kind === "whole") return cy + a.whole.y;
  if (kind === "left") return cy + a.leftPart.y;
  return cy + a.rightPart.y;
};

const chipX = (kind: ChipKind, frame: number): number => {
  const migStart = chipMigrationStart(kind);
  const migEnd = migStart + FENHESHI_MIGRATE_DUR;
  if (frame < migStart) return chipAnchorX(kind);
  if (frame < migEnd) {
    const t = reveal(frame, migStart, FENHESHI_MIGRATE_DUR, EASE.outQuint);
    return lerp(chipAnchorX(kind), chipDiagramTargetX(kind), t);
  }
  return chipDiagramAttachedX(kind, frame);
};

const chipY = (kind: ChipKind, frame: number): number => {
  const migStart = chipMigrationStart(kind);
  const migEnd = migStart + FENHESHI_MIGRATE_DUR;
  if (frame < migStart) return CHIP_Y;
  if (frame < migEnd) {
    const t = reveal(frame, migStart, FENHESHI_MIGRATE_DUR, EASE.outQuint);
    return lerp(CHIP_Y, chipDiagramTargetY(kind), t);
  }
  return chipDiagramAttachedY(kind, frame);
};

const chipOpacity = (kind: ChipKind, frame: number): number => {
  if (frame < chipMountFrame(kind)) return 0;
  return reveal(frame, chipMountFrame(kind), FEN_NAME_CHIP_DUR, EASE.outQuint);
};

const heShowChipFadeOut = (kind: ChipKind, frame: number): number => {
  if (kind === "whole") return 1;
  const fadeOut =
    1 - reveal(frame, cHeShow.startFrame, HE_SHOW_CHIPS_FADE_OUT_DUR);
  const migStart = chipMigrationStart(kind);
  const fadeInStart = Math.max(cFenheshiIntro.startFrame, migStart - 12);
  const fadeIn = reveal(frame, fadeInStart, 12);
  return Math.max(fadeOut, fadeIn);
};

const chipDiagramScale = (kind: ChipKind, frame: number): number => {
  const migEnd = chipMigrationStart(kind) + FENHESHI_MIGRATE_DUR;
  if (frame < migEnd) return 1;
  return centeredDiagramWidth(frame) / SINGLE_DIAGRAM_WIDTH;
};

const bigRowFadeOut = (frame: number): number =>
  1 - reveal(frame, cOutro.startFrame + OUTRO_DIAGRAMS_SLIDE_REL_START, OUTRO_DIAGRAMS_SLIDE_DUR);

const fenTermOpacity = (frame: number): number => {
  const start = cFenName.startFrame + FEN_NAME_TERM_REL_START;
  const fadeIn = reveal(frame, start, FEN_NAME_TERM_DUR);
  const fadeOut = 1 - reveal(frame, cHeShow.startFrame, HE_SHOW_TERM_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const fenheshiTermOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    cFenheshiIntro.startFrame + FENHESHI_TERM_REL_START,
    FENHESHI_TERM_DUR,
  );
  const fadeOut = 1 - reveal(frame, cFive14.startFrame, FIVE14_TERM_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const fenchengOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    cFenheshiRead.startFrame + READ_FENCHENG_REL_START,
    READ_FENCHENG_DUR,
  );
  const fadeOut = 1 - reveal(frame, cFive14.startFrame, FIVE14_TERM_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const zuchengOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    cFenheshiRead.startFrame + READ_ZUCHENG_REL_START,
    READ_ZUCHENG_DUR,
  );
  const fadeOut = 1 - reveal(frame, cFive14.startFrame, FIVE14_TERM_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const stripCardsOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    cHeName.startFrame + HE_NAME_STRIP_CARDS_REL_START,
    HE_NAME_STRIP_CARDS_DUR,
  );
  const fadeOut = 1 - reveal(frame, cFenheshiIntro.startFrame, FENHESHI_STRIP_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const stripFenOpacity = (frame: number): number => {
  const fadeIn = reveal(frame, cHeName.startFrame + HE_NAME_FEN_REL_START, HE_NAME_FEN_DUR);
  const fadeOut = 1 - reveal(frame, cFenheshiIntro.startFrame, FENHESHI_STRIP_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const stripHeOpacity = (frame: number): number => {
  const fadeIn = reveal(frame, cHeName.startFrame + HE_NAME_HE_REL_START, HE_NAME_HE_DUR);
  const fadeOut = 1 - reveal(frame, cFenheshiIntro.startFrame, FENHESHI_STRIP_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const stripArrowOpacity = (frame: number): number => {
  const fadeIn = reveal(frame, cHeName.startFrame + HE_NAME_ARROW_REL_START, HE_NAME_ARROW_DUR);
  const fadeOut = 1 - reveal(frame, cFenheshiIntro.startFrame, FENHESHI_STRIP_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const introPreviewOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    cIntro.startFrame + INTRO_PREVIEW_FADE_IN_REL_START,
    INTRO_PREVIEW_FADE_DUR,
  );
  const fadeOut = 1 - reveal(frame, cIntro.endFrame - 18, 18);
  return fadeIn * fadeOut;
};

const introTitleOpacity = (frame: number): number => {
  const fadeIn = reveal(frame, cIntro.startFrame + INTRO_TITLE_REL_START, INTRO_TITLE_DUR);
  const fadeOut = 1 - reveal(frame, cIntro.endFrame - 18, 18);
  return fadeIn * fadeOut;
};

const introSubtitleOpacity = (frame: number): number => {
  const fadeIn = reveal(frame, cIntro.startFrame + INTRO_SUBTITLE_REL_START, INTRO_SUBTITLE_DUR);
  const fadeOut = 1 - reveal(frame, cIntro.endFrame - 18, 18);
  return fadeIn * fadeOut;
};

const diagram14Opacity = (frame: number): number =>
  reveal(frame, cFive14.startFrame + FIVE14_NEW_REL_START, FIVE14_NEW_DUR);

const diagram32Opacity = (frame: number): number =>
  reveal(frame, cFive32.startFrame + FIVE32_NEW_32_REL_START, FIVE32_NEW_32_DUR);

const diagram41Opacity = (frame: number): number =>
  reveal(frame, cFive32.startFrame + FIVE32_NEW_41_REL_START, FIVE32_NEW_41_DUR);

const outroDiagramsOpacity = (frame: number): number =>
  reveal(frame, cOutro.startFrame + OUTRO_DIAGRAMS_SLIDE_REL_START, OUTRO_DIAGRAMS_SLIDE_DUR);

const outroStripOpacity = (frame: number): number =>
  reveal(frame, cOutro.startFrame + OUTRO_STRIP_FADE_REL_START, OUTRO_STRIP_FADE_DUR);

const outroTitleOpacity = (frame: number): number =>
  reveal(frame, cOutro.startFrame + OUTRO_TITLE_REL_START, OUTRO_TITLE_DUR);

// ---------------------------------------------------------------------------
// Element registrations — only LOAD-BEARING items from visual-design §3
// Visual Contract. Decorative elements (sparkle, arrowheads, etc.) omitted.
// ---------------------------------------------------------------------------

// 5-dot row aggregated bbox — spans the leftmost to rightmost dot at any
// frame. The dots are identity-invariant; we register them as ONE element
// so the manifest reflects the same "one teaching unit" model the scene
// uses.
const dotRowElement: SceneElement = {
  id: "dot-row",
  zone: "objects",
  bboxAt: (frame) => {
    const opacity = dotRowOpacity(frame);
    if (opacity <= 0) return null;
    const leftX = dotX(0, frame);
    const rightX = dotX(DOT_COUNT - 1, frame);
    const width = rightX - leftX + DOT_DIAMETER;
    const cx = (leftX + rightX) / 2;
    return snapshot(centeredBox(cx, DOT_ROW_Y, width, DOT_DIAMETER), opacity);
  },
};

// Chips are identity-invariant carriers — they enter as "badges" above the
// dots in fen-name, but their load-bearing role is to BECOME the
// part-number glyphs INSIDE the diagram in fenheshi-intro and beyond. We
// register them in the "objects" zone because their semantic identity is
// "part of the teaching object" — the manifest collision check would
// otherwise flag chip-whole-5 vs diagram-23 as a violation when, in fact,
// chip-whole-5 IS the diagram's whole-number. Same-zone overlap is
// allowed by manifestTypes.isZoneOverlapAllowed.
const chipElement = (kind: ChipKind, id: string): SceneElement => ({
  id,
  zone: "objects",
  bboxAt: (frame) => {
    const op = chipOpacity(kind, frame) * heShowChipFadeOut(kind, frame) * bigRowFadeOut(frame);
    if (op <= 0) return null;
    const scale = chipDiagramScale(kind, frame);
    const w = CHIP_WIDTH * scale;
    const h = CHIP_HEIGHT * scale;
    return snapshot(centeredBox(chipX(kind, frame), chipY(kind, frame), w, h), op);
  },
});

const fenTermElement: SceneElement = {
  id: "term-fen",
  zone: "labels",
  bboxAt: (frame) => {
    const op = fenTermOpacity(frame);
    if (op <= 0) return null;
    const w = PRIMARY_LABEL_FONT_SIZE * 1.2; // "分" 1 char
    return snapshot(centeredBox(LABEL_CX, LABEL_Y, w, PRIMARY_LABEL_FONT_SIZE * 1.2), op);
  },
};

const fenheshiTermElement: SceneElement = {
  id: "term-fenheshi",
  zone: "labels",
  bboxAt: (frame) => {
    const op = fenheshiTermOpacity(frame);
    if (op <= 0) return null;
    const w = PRIMARY_LABEL_FONT_SIZE * 3 * 0.62; // 3-char compound
    return snapshot(centeredBox(LABEL_CX, LABEL_Y, w, PRIMARY_LABEL_FONT_SIZE * 1.2), op);
  },
};

const fenchengElement: SceneElement = {
  id: "term-fencheng",
  zone: "labels",
  bboxAt: (frame) => {
    const op = fenchengOpacity(frame);
    if (op <= 0) return null;
    const w = PRIMARY_LABEL_FONT_SIZE * 2 * 0.62;
    return snapshot(centeredBox(READ_LABEL_DOWN_X, LABEL_Y, w, PRIMARY_LABEL_FONT_SIZE * 1.2), op);
  },
};

const zuchengElement: SceneElement = {
  id: "term-zucheng",
  zone: "labels",
  bboxAt: (frame) => {
    const op = zuchengOpacity(frame);
    if (op <= 0) return null;
    const w = PRIMARY_LABEL_FONT_SIZE * 2 * 0.62;
    return snapshot(centeredBox(READ_LABEL_UP_X, LABEL_Y, w, PRIMARY_LABEL_FONT_SIZE * 1.2), op);
  },
};

const stripCardElement = (
  id: string,
  cx: number,
): SceneElement => ({
  id,
  zone: "tally",
  bboxAt: (frame) => {
    const op = stripCardsOpacity(frame);
    if (op <= 0) return null;
    return snapshot(centeredBox(cx, STRIP_Y, STRIP_CARD_W, STRIP_CARD_H), op);
  },
});

const stripArrowElement: SceneElement = {
  id: "strip-arrow",
  zone: "tally",
  bboxAt: (frame) => {
    const op = stripArrowOpacity(frame);
    if (op <= 0) return null;
    return snapshot(
      [STRIP_LEFT_CX + STRIP_CARD_W / 2, STRIP_Y - 12, STRIP_RIGHT_CX - STRIP_LEFT_CX - STRIP_CARD_W, 24],
      op,
    );
  },
};

const stripFenElement: SceneElement = {
  id: "strip-term-fen",
  zone: "labels",
  bboxAt: (frame) => {
    const op = stripFenOpacity(frame);
    if (op <= 0) return null;
    return snapshot(
      centeredBox(STRIP_TERM_FEN_X, STRIP_TERM_Y, TERM_FONT_SIZE * 1.2, TERM_FONT_SIZE * 1.2),
      op,
    );
  },
};

const stripHeElement: SceneElement = {
  id: "strip-term-he",
  zone: "labels",
  bboxAt: (frame) => {
    const op = stripHeOpacity(frame);
    if (op <= 0) return null;
    return snapshot(
      centeredBox(STRIP_TERM_HE_X, STRIP_TERM_Y, TERM_FONT_SIZE * 1.2, TERM_FONT_SIZE * 1.2),
      op,
    );
  },
};

const introTitleElement: SceneElement = {
  id: "intro-title",
  zone: "labels",
  bboxAt: (frame) => {
    const op = introTitleOpacity(frame);
    if (op <= 0) return null;
    const w = TITLE_FONT_SIZE * 3 * 0.62; // "分与合"
    return snapshot(centeredBox(LABEL_CX, INTRO_TITLE_Y, w, TITLE_FONT_SIZE * 1.2), op);
  },
};

const introSubtitleElement: SceneElement = {
  id: "intro-subtitle",
  zone: "labels",
  bboxAt: (frame) => {
    const op = introSubtitleOpacity(frame);
    if (op <= 0) return null;
    const w = SUBTITLE_FONT_SIZE * 9 * 0.62; // "5以内数 · 分与合"
    return snapshot(centeredBox(LABEL_CX, INTRO_SUBTITLE_Y, w, SUBTITLE_FONT_SIZE * 1.2), op);
  },
};

const introPreviewElement: SceneElement = {
  id: "intro-preview-row",
  zone: "objects",
  bboxAt: (frame) => {
    const op = introPreviewOpacity(frame);
    if (op <= 0) return null;
    const w = 6 * DOT_SPACING; // approximate span
    return snapshot(centeredBox(LABEL_CX, INTRO_PREVIEW_Y, w, INTRO_PREVIEW_DOT_DIAMETER), op);
  },
};

// Centered diagram (the (2,3) diagonals + the migrating chips serve as the
// numbers). The diagram's bbox extends from whole anchor to part anchors.
const centeredDiagramElement: SceneElement = {
  id: "diagram-23",
  zone: "objects",
  bboxAt: (frame) => {
    const visibleStart = cFenheshiIntro.startFrame + FENHESHI_LINE_LEFT_REL_START;
    if (frame < visibleStart) return null;
    // Compute combined opacity: based on diagonal progress and outro fade.
    const lineProgress = reveal(
      frame,
      cFenheshiIntro.startFrame + FENHESHI_LINE_LEFT_REL_START,
      FENHESHI_LINE_LEFT_DUR,
    );
    const op = lineProgress * bigRowFadeOut(frame);
    if (op <= 0) return null;
    const w = centeredDiagramWidth(frame);
    const a = getFenHeDiagramAnchors(w);
    const cx = centeredDiagramX(frame);
    const cy = centeredDiagramY(frame);
    const left = cx + a.leftPart.x - w * 0.18;
    const right = cx + a.rightPart.x + w * 0.18;
    const top = cy + a.whole.y - w * 0.21;
    const bottom = cy + a.leftPart.y + w * 0.21;
    return snapshot([left, top, right - left, bottom - top], op);
  },
};

// Family of three NEW diagrams (1,4) (3,2) (4,1).
const newDiagramElement = (
  id: string,
  slot: number,
  opacityFn: (f: number) => number,
): SceneElement => ({
  id,
  zone: "objects",
  bboxAt: (frame) => {
    const op = opacityFn(frame) * bigRowFadeOut(frame);
    if (op <= 0) return null;
    const cx = rowDiagramCX(slot);
    const cy = ROW_DIAGRAM_CY;
    const a = getFenHeDiagramAnchors(ROW_DIAGRAM_WIDTH);
    const left = cx + a.leftPart.x - ROW_DIAGRAM_WIDTH * 0.18;
    const right = cx + a.rightPart.x + ROW_DIAGRAM_WIDTH * 0.18;
    const top = cy + a.whole.y - ROW_DIAGRAM_WIDTH * 0.21;
    const bottom = cy + a.leftPart.y + ROW_DIAGRAM_WIDTH * 0.21;
    return snapshot([left, top, right - left, bottom - top], op);
  },
});

// Sketch marks — fenheshi-read read-arrows are vertical lines OUTSIDE the
// diagram diagonals, with a small horizontal arc bend (perpendicular to
// the line) that the TeacherMark "label-arrow" kind adds. The bbox here
// accounts for that arc: arrowhead size + the perpendicular curve bulge
// (~40 px max from sketch.tsx).
const READ_ARROW_BBOX_PAD_X = 50;
const READ_ARROW_BBOX_PAD_Y = 14;

const downSweepElement: SceneElement = {
  id: "mark-fenheshi-read-downward",
  zone: "marks",
  bboxAt: (frame) => {
    const drawStart = cFenheshiRead.startFrame + READ_DOWN_REL_START;
    const fadeIn = reveal(frame, drawStart, READ_DOWN_DUR);
    const fadeOut = 1 - reveal(frame, cFive14.startFrame, FIVE14_TERM_FADE_OUT_DUR);
    const op = fadeIn * fadeOut * 0.92 * bigRowFadeOut(frame);
    if (op <= 0) return null;
    return snapshot(
      [
        READ_ARROW_LEFT_X - READ_ARROW_BBOX_PAD_X,
        READ_ARROW_TOP_Y - READ_ARROW_BBOX_PAD_Y,
        2 * READ_ARROW_BBOX_PAD_X,
        READ_ARROW_BOTTOM_Y - READ_ARROW_TOP_Y + 2 * READ_ARROW_BBOX_PAD_Y,
      ],
      op,
    );
  },
};

const upSweepElement: SceneElement = {
  id: "mark-fenheshi-read-upward",
  zone: "marks",
  bboxAt: (frame) => {
    const drawStart = cFenheshiRead.startFrame + READ_UP_REL_START;
    const fadeIn = reveal(frame, drawStart, READ_UP_DUR);
    const fadeOut = 1 - reveal(frame, cFive14.startFrame, FIVE14_TERM_FADE_OUT_DUR);
    const op = fadeIn * fadeOut * 0.92 * bigRowFadeOut(frame);
    if (op <= 0) return null;
    return snapshot(
      [
        READ_ARROW_RIGHT_X - READ_ARROW_BBOX_PAD_X,
        READ_ARROW_TOP_Y - READ_ARROW_BBOX_PAD_Y,
        2 * READ_ARROW_BBOX_PAD_X,
        READ_ARROW_BOTTOM_Y - READ_ARROW_TOP_Y + 2 * READ_ARROW_BBOX_PAD_Y,
      ],
      op,
    );
  },
};

const underlineElement: SceneElement = {
  id: "mark-five-splits-underline",
  zone: "marks",
  bboxAt: (frame) => {
    const drawStart = cFive32.startFrame + 90; // FIVE32_UNDERLINE_REL_START
    const drawEnd = drawStart + 24; // FIVE32_UNDERLINE_DUR
    const fadeStart = cFive32.endFrame - 16;
    const fadeEnd = Math.min(fadeStart + 8, cFive32.endFrame);
    let op = 0;
    if (frame >= drawStart && frame < fadeStart) op = 0.92;
    else if (frame >= fadeStart && frame < fadeEnd) {
      op = lerp(0.92, 0, progress(frame, fadeStart, fadeEnd));
    } else if (frame >= drawStart && frame < drawEnd) {
      op = 0.92;
    }
    op *= bigRowFadeOut(frame);
    if (op <= 0) return null;
    const a = getFenHeDiagramAnchors(ROW_DIAGRAM_WIDTH);
    const left = rowDiagramCX(0) - ROW_DIAGRAM_WIDTH / 2 - 8;
    const right = rowDiagramCX(3) + ROW_DIAGRAM_WIDTH / 2 + 8;
    const yBase = ROW_DIAGRAM_CY + a.leftPart.y + 60;
    return snapshot([left, yBase - 12, right - left, 24], op);
  },
};

// Outro elements
const outroDiagramElement = (id: string, slot: number): SceneElement => ({
  id,
  zone: "objects",
  bboxAt: (frame) => {
    const op = outroDiagramsOpacity(frame);
    if (op <= 0) return null;
    const cx = outroDiagramCX(slot);
    const a = getFenHeDiagramAnchors(OUTRO_DIAGRAM_WIDTH);
    const left = cx + a.leftPart.x - OUTRO_DIAGRAM_WIDTH * 0.18;
    const right = cx + a.rightPart.x + OUTRO_DIAGRAM_WIDTH * 0.18;
    const top = OUTRO_DIAGRAM_CY + a.whole.y - OUTRO_DIAGRAM_WIDTH * 0.21;
    const bottom = OUTRO_DIAGRAM_CY + a.leftPart.y + OUTRO_DIAGRAM_WIDTH * 0.21;
    return snapshot([left, top, right - left, bottom - top], op);
  },
});

const outroStripElement: SceneElement = {
  id: "outro-strip",
  zone: "tally",
  bboxAt: (frame) => {
    const op = outroStripOpacity(frame);
    if (op <= 0) return null;
    const w = OUTRO_STRIP_RIGHT_CX - OUTRO_STRIP_LEFT_CX + OUTRO_STRIP_CARD_W;
    const cx = OUTRO_STRIP_CX;
    return snapshot(centeredBox(cx, OUTRO_STRIP_Y, w, OUTRO_STRIP_CARD_H), op);
  },
};

const outroTitleElement: SceneElement = {
  id: "outro-title",
  zone: "labels",
  bboxAt: (frame) => {
    const op = outroTitleOpacity(frame);
    if (op <= 0) return null;
    const w = TITLE_FONT_SIZE * 6 * 0.62; // "5 的分与合"
    return snapshot(
      centeredBox(OUTRO_TITLE_CX, OUTRO_TITLE_Y, w, TITLE_FONT_SIZE * 1.2),
      op,
    );
  },
};

// ---------------------------------------------------------------------------
// Key frames — one anchor frame per cue, snapped at the cue's pedagogical
// peak (typically midway-into the cue's choreography).
// ---------------------------------------------------------------------------
const keyFrames: readonly KeyFrame[] = [
  {
    id: "intro:title-shown",
    cueId: "intro",
    offset: 60,
    label: "subtitle, mini preview cycling, title 分与合 visible",
  },
  {
    id: "fen-show:split",
    cueId: "fen-show",
    offset: 80,
    label: "5 dots separated into 2|3 clusters",
  },
  {
    id: "fen-name:chips-and-term",
    cueId: "fen-name",
    offset: 110,
    label: "chips 5/2/3 above clusters; 分 term written below",
  },
  {
    id: "he-show:rejoin",
    cueId: "he-show",
    offset: 50,
    label: "clusters rejoining into single row",
  },
  {
    id: "he-name:strip-arrow-terms",
    cueId: "he-name",
    offset: 130,
    label: "count strip 5/2/3 with two-headed arrow; 分 / 合 labels",
  },
  {
    id: "fenheshi-intro:migrating",
    cueId: "fenheshi-intro",
    offset: 85,
    label: "5 settled at top, 2 mid-migration, dots dimmed backing",
  },
  {
    id: "fenheshi-intro:settled",
    cueId: "fenheshi-intro",
    offset: 150,
    label: "完成 — 分合式 fully formed; term label writing on",
  },
  {
    id: "fenheshi-read:downward",
    cueId: "fenheshi-read",
    offset: 40,
    label: "downward sweep over diagram; 分成 term visible",
  },
  {
    id: "fenheshi-read:upward",
    cueId: "fenheshi-read",
    offset: 140,
    label: "upward sweep; 组成 term visible",
  },
  {
    id: "five-1-4:both",
    cueId: "five-1-4",
    offset: 80,
    label: "(2,3) slid left and dim; (1,4) drawn to the right",
  },
  {
    id: "five-3-2-and-4-1:full-row",
    cueId: "five-3-2-and-4-1",
    offset: 130,
    label: "four diagrams in a row; underline writing on",
  },
  {
    id: "outro:three-up",
    cueId: "outro",
    offset: 60,
    label: "replay strip + four mini diagrams + 5 的分与合 title",
  },
];

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------
const elements: readonly SceneElement[] = [
  dotRowElement,
  chipElement("whole", "chip-whole-5"),
  chipElement("left", "chip-part-2"),
  chipElement("right", "chip-part-3"),
  fenTermElement,
  fenheshiTermElement,
  fenchengElement,
  zuchengElement,
  stripCardElement("strip-card-2", STRIP_LEFT_CX),
  stripCardElement("strip-card-5", STRIP_WHOLE_CX),
  stripCardElement("strip-card-3", STRIP_RIGHT_CX),
  stripArrowElement,
  stripFenElement,
  stripHeElement,
  introTitleElement,
  introSubtitleElement,
  introPreviewElement,
  centeredDiagramElement,
  newDiagramElement("diagram-14", 1, diagram14Opacity),
  newDiagramElement("diagram-32", 2, diagram32Opacity),
  newDiagramElement("diagram-41", 3, diagram41Opacity),
  downSweepElement,
  upSweepElement,
  underlineElement,
  outroStripElement,
  outroDiagramElement("outro-diagram-23", 0),
  outroDiagramElement("outro-diagram-14", 1),
  outroDiagramElement("outro-diagram-32", 2),
  outroDiagramElement("outro-diagram-41", 3),
  outroTitleElement,
];

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kp1-fen-yu-he-intro",
  composition: "CompleteKp1FenYuHeIntroLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kp1FenYuHeIntroCues as readonly AlignedLessonCue[],
  keyFrames,
  elements,
  zones: ZONES,
};
