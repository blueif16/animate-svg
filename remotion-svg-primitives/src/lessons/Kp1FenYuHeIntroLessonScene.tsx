import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Breathe, FXDefs, GlintFlash } from "../fx";
import { EASE } from "../motion-primitives";
import {
  FenHeDiagram,
  LabelCallout,
  NumberCard,
  TeacherMark,
  UnitBlock,
  getFenHeDiagramAnchors,
} from "../shape-primitives";
import { colors, typography } from "../theme";
import { kp1FenYuHeIntroCues } from "./kp1FenYuHeIntroLessonTimeline";
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
  DOT_ROW_CX,
  DOT_ROW_Y,
  FENHESHI_DOTS_DIM_DUR,
  FENHESHI_DOTS_DISMISS_DUR,
  FENHESHI_DOTS_DISMISS_REL_START,
  FENHESHI_LINE_LEFT_DUR,
  FENHESHI_LINE_LEFT_REL_START,
  FENHESHI_LINE_RIGHT_DUR,
  FENHESHI_LINE_RIGHT_REL_START,
  FENHESHI_MIGRATE_2_REL_START,
  FENHESHI_MIGRATE_3_REL_START,
  FENHESHI_MIGRATE_5_REL_START,
  FENHESHI_MIGRATE_DUR,
  FENHESHI_SPARKLE_DUR,
  FENHESHI_SPARKLE_REL_START,
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
  FIVE32_SHIFT_DUR,
  FIVE32_SHIFT_REL_START,
  FIVE32_UNDERLINE_DUR,
  FIVE32_UNDERLINE_REL_START,
  HE_NAME_ARROW_DUR,
  HE_NAME_ARROW_REL_START,
  HE_NAME_ARROW_REPULSE_DUR,
  HE_NAME_ARROW_REPULSE_REL_START,
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
  INTRO_PREVIEW_JOIN_DUR,
  INTRO_PREVIEW_JOIN_REL_START,
  INTRO_PREVIEW_SPLIT_DUR,
  INTRO_PREVIEW_SPLIT_REL_START,
  INTRO_PREVIEW_Y,
  INTRO_SUBTITLE_DUR,
  INTRO_SUBTITLE_REL_START,
  INTRO_SUBTITLE_Y,
  INTRO_TITLE_DUR,
  INTRO_TITLE_REL_START,
  INTRO_TITLE_Y,
  LABEL_CX,
  LABEL_Y,
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
  OUTRO_STRIP_TERM_Y,
  OUTRO_STRIP_Y,
  OUTRO_TERM_FONT_SIZE,
  OUTRO_TITLE_CX,
  OUTRO_TITLE_DUR,
  OUTRO_TITLE_REL_START,
  OUTRO_TITLE_Y,
  PRIMARY_LABEL_FONT_SIZE,
  READ_ARROW_BOTTOM_Y,
  READ_ARROW_LEFT_X,
  READ_ARROW_RIGHT_X,
  READ_ARROW_TOP_Y,
  READ_DOWN_DUR,
  READ_DOWN_REL_START,
  READ_FENCHENG_DUR,
  READ_FENCHENG_REL_START,
  READ_LABEL_DOWN_X,
  READ_LABEL_UP_X,
  READ_UP_DUR,
  READ_UP_REL_START,
  READ_ZUCHENG_DUR,
  READ_ZUCHENG_REL_START,
  ROW_DIAGRAM_CY,
  ROW_DIAGRAM_WIDTH,
  SINGLE_DIAGRAM_CX,
  SINGLE_DIAGRAM_CY,
  SINGLE_DIAGRAM_WIDTH,
  STRIP_ARROWHEAD_SIZE,
  STRIP_ARROW_LEFT_X1,
  STRIP_ARROW_LEFT_X2,
  STRIP_ARROW_RIGHT_X1,
  STRIP_ARROW_RIGHT_X2,
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
  dotJoinedX,
  dotSplitX,
  introPreviewJoinedX,
  introPreviewSplitX,
  outroDiagramCX,
  rowDiagramCX,
} from "./kp1FenYuHeIntro/layout";
import { cueMap } from "./timingTypes";

// ---------------------------------------------------------------------------
// Cue lookup — every absolute frame in this file derives from
// cues[id].startFrame + a named REL_* constant from layout.ts. ZERO
// master-timeline literals.
// ---------------------------------------------------------------------------
const cues = cueMap(kp1FenYuHeIntroCues);

const c = {
  intro: () => cues["intro"],
  fenShow: () => cues["fen-show"],
  fenName: () => cues["fen-name"],
  heShow: () => cues["he-show"],
  heName: () => cues["he-name"],
  fenheshiIntro: () => cues["fenheshi-intro"],
  fenheshiRead: () => cues["fenheshi-read"],
  five14: () => cues["five-1-4"],
  five32: () => cues["five-3-2-and-4-1"],
  outro: () => cues["outro"],
};

// ---------------------------------------------------------------------------
// Easing + interpolation helpers. Every progress() call passes a named
// EASE.* curve from src/motion-primitives/curves.ts.
// ---------------------------------------------------------------------------
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = (t) => t,
) =>
  interpolate(frame, [start, Math.max(start + 1, end)], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const reveal = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE.outCubic,
) => progress(frame, start, start + Math.max(1, duration), easing);

// ---------------------------------------------------------------------------
// Dot row helpers
// ---------------------------------------------------------------------------

// Dot row mounts at start of fen-show (fade in) and lives through
// fenheshi-intro (where it dims to a backing layer then dismisses).
const dotRowMountFrame = () => c.fenShow().startFrame;
const dotRowDismissFrame = () =>
  c.fenheshiIntro().startFrame + FENHESHI_DOTS_DISMISS_REL_START;
const dotRowDismissEndFrame = () =>
  dotRowDismissFrame() + FENHESHI_DOTS_DISMISS_DUR;

// Per-dot x position at frame. Two motions:
//   1. fen-show: joined → split (frames FEN_SPLIT_REL_START..+FEN_SPLIT_DUR)
//   2. he-show: split → joined (HE_SHOW_REJOIN_REL_START..+HE_SHOW_REJOIN_DUR)
// Held in whichever state was last set in between.
const dotX = (index: number, frame: number): number => {
  // fen-show split
  const fenSplitStart = c.fenShow().startFrame + FEN_SPLIT_REL_START;
  const fenSplitEnd = fenSplitStart + FEN_SPLIT_DUR;
  // he-show rejoin
  const heRejoinStart = c.heShow().startFrame + HE_SHOW_REJOIN_REL_START;
  const heRejoinEnd = heRejoinStart + HE_SHOW_REJOIN_DUR;

  // Before any motion → joined
  if (frame < fenSplitStart) {
    return dotJoinedX(index);
  }
  // During fen-show split
  if (frame < fenSplitEnd) {
    const t = reveal(frame, fenSplitStart, FEN_SPLIT_DUR, EASE.inOutCubic);
    return lerp(dotJoinedX(index), dotSplitX(index), t);
  }
  // Held split (through fen-name, into start of he-show before rejoin)
  if (frame < heRejoinStart) {
    return dotSplitX(index);
  }
  // During he-show rejoin
  if (frame < heRejoinEnd) {
    const t = reveal(frame, heRejoinStart, HE_SHOW_REJOIN_DUR, EASE.inOutCubic);
    return lerp(dotSplitX(index), dotJoinedX(index), t);
  }
  // After rejoin (he-name through fenheshi-intro) → joined
  return dotJoinedX(index);
};

// Dot row opacity. Three phases:
//   1. Fade in over FEN_DOTS_FADE_IN_DUR at start of fen-show
//   2. Held at 1.0 through fen-name, he-show, he-name
//   3. Dim to 0.25 over FENHESHI_DOTS_DIM_DUR at start of fenheshi-intro
//   4. Dismiss to 0 over FENHESHI_DOTS_DISMISS_DUR at FENHESHI_DOTS_DISMISS_REL_START
const dotRowOpacity = (frame: number): number => {
  if (frame < dotRowMountFrame()) return 0;
  const fadeIn = reveal(frame, dotRowMountFrame(), FEN_DOTS_FADE_IN_DUR);
  if (frame < c.fenheshiIntro().startFrame) return fadeIn;

  // Dim to backing layer
  const dim =
    1 -
    reveal(frame, c.fenheshiIntro().startFrame, FENHESHI_DOTS_DIM_DUR) * 0.75;

  if (frame < dotRowDismissFrame()) return dim;

  // Dismiss
  const dismiss =
    1 - reveal(frame, dotRowDismissFrame(), FENHESHI_DOTS_DISMISS_DUR);
  return 0.25 * dismiss;
};

// ---------------------------------------------------------------------------
// Count chip helpers (the "5"/"2"/"3" glyphs above the dots in fen-name).
// These are the SAME instances that migrate into the diagram in fenheshi-intro.
// Keys: chip-whole-5, chip-part-2, chip-part-3.
// ---------------------------------------------------------------------------

type ChipKind = "whole" | "left" | "right";

// Anchor x for a chip at the zone-chips (above-dot) position.
const chipAnchorX = (kind: ChipKind): number => {
  if (kind === "whole") return CHIP_WHOLE_X;
  if (kind === "left") return CHIP_LEFT_X;
  return CHIP_RIGHT_X;
};

// Migration target — diagram anchor in absolute composition coordinates.
const diagramAnchors = getFenHeDiagramAnchors(SINGLE_DIAGRAM_WIDTH);

const chipDiagramTargetX = (kind: ChipKind): number => {
  if (kind === "whole") return SINGLE_DIAGRAM_CX + diagramAnchors.whole.x;
  if (kind === "left") return SINGLE_DIAGRAM_CX + diagramAnchors.leftPart.x;
  return SINGLE_DIAGRAM_CX + diagramAnchors.rightPart.x;
};

const chipDiagramTargetY = (kind: ChipKind): number => {
  if (kind === "whole") return SINGLE_DIAGRAM_CY + diagramAnchors.whole.y;
  if (kind === "left") return SINGLE_DIAGRAM_CY + diagramAnchors.leftPart.y;
  return SINGLE_DIAGRAM_CY + diagramAnchors.rightPart.y;
};

// Chip mount frame — appear in fen-name (chip 5 first, then 2, then 3).
const chipMountFrame = (kind: ChipKind): number => {
  if (kind === "whole") {
    return c.fenName().startFrame + FEN_NAME_CHIP_5_REL_START;
  }
  if (kind === "left") {
    return c.fenName().startFrame + FEN_NAME_CHIP_2_REL_START;
  }
  return c.fenName().startFrame + FEN_NAME_CHIP_3_REL_START;
};

// Chip migration start frame — staggered in fenheshi-intro.
const chipMigrationStart = (kind: ChipKind): number => {
  if (kind === "whole") {
    return c.fenheshiIntro().startFrame + FENHESHI_MIGRATE_5_REL_START;
  }
  if (kind === "left") {
    return c.fenheshiIntro().startFrame + FENHESHI_MIGRATE_2_REL_START;
  }
  return c.fenheshiIntro().startFrame + FENHESHI_MIGRATE_3_REL_START;
};

// Migration target — diagram anchor for a chip kind, parameterised by the
// diagram's current centroid + width. Once migration completes the chip is
// "attached" to the centered diagram; from five-1-4 onward we follow the
// centered diagram's slide/shrink so the chip stays inside it.
const chipDiagramAttachedX = (kind: ChipKind, frame: number): number => {
  const w = centeredDiagramWidth(frame);
  const anchors = getFenHeDiagramAnchors(w);
  const cx = centeredDiagramX(frame);
  if (kind === "whole") return cx + anchors.whole.x;
  if (kind === "left") return cx + anchors.leftPart.x;
  return cx + anchors.rightPart.x;
};

const chipDiagramAttachedY = (kind: ChipKind, frame: number): number => {
  const w = centeredDiagramWidth(frame);
  const anchors = getFenHeDiagramAnchors(w);
  const cy = centeredDiagramY(frame);
  if (kind === "whole") return cy + anchors.whole.y;
  if (kind === "left") return cy + anchors.leftPart.y;
  return cy + anchors.rightPart.y;
};

// Chip x at frame.
const chipX = (kind: ChipKind, frame: number): number => {
  const migStart = chipMigrationStart(kind);
  const migEnd = migStart + FENHESHI_MIGRATE_DUR;
  if (frame < migStart) {
    return chipAnchorX(kind);
  }
  if (frame < migEnd) {
    const t = reveal(frame, migStart, FENHESHI_MIGRATE_DUR, EASE.outQuint);
    return lerp(chipAnchorX(kind), chipDiagramTargetX(kind), t);
  }
  return chipDiagramAttachedX(kind, frame);
};

// Chip y at frame.
const chipY = (kind: ChipKind, frame: number): number => {
  const migStart = chipMigrationStart(kind);
  const migEnd = migStart + FENHESHI_MIGRATE_DUR;
  if (frame < migStart) {
    return CHIP_Y;
  }
  if (frame < migEnd) {
    const t = reveal(frame, migStart, FENHESHI_MIGRATE_DUR, EASE.outQuint);
    return lerp(CHIP_Y, chipDiagramTargetY(kind), t);
  }
  return chipDiagramAttachedY(kind, frame);
};

// Chip scale-factor relative to the centered diagram's width vs the
// original SINGLE_DIAGRAM_WIDTH. When the diagram shrinks for the row,
// the chip glyph scales with it so the numeral keeps proportional sizing
// inside its diagram. Only applies AFTER migration completes.
const chipDiagramScale = (kind: ChipKind, frame: number): number => {
  const migEnd = chipMigrationStart(kind) + FENHESHI_MIGRATE_DUR;
  if (frame < migEnd) return 1;
  return centeredDiagramWidth(frame) / SINGLE_DIAGRAM_WIDTH;
};

// Chip opacity. Appear via PopIn-style snap (interpolated 0→1) at mount.
// Held at 1.0 through migration and beyond — the chip stays present forever
// as the diagram's NumberCard.
const chipOpacity = (kind: ChipKind, frame: number): number => {
  if (frame < chipMountFrame(kind)) return 0;
  return reveal(frame, chipMountFrame(kind), FEN_NAME_CHIP_DUR, EASE.outQuint);
};

// Chip scale — snap-on at mount (overshoot to 1.05, settle to 1.0).
const chipScale = (kind: ChipKind, frame: number): number => {
  const mount = chipMountFrame(kind);
  if (frame < mount) return 0.6;
  const t = reveal(frame, mount, FEN_NAME_CHIP_DUR, EASE.overshoot);
  return lerp(0.6, 1, t);
};

// ---------------------------------------------------------------------------
// 分 term in zone-label (fen-name): writes on after chips. Fades out at start
// of he-show (the action is un-naming itself).
// ---------------------------------------------------------------------------
const fenTermOpacity = (frame: number): number => {
  const start = c.fenName().startFrame + FEN_NAME_TERM_REL_START;
  const fadeOutStart = c.heShow().startFrame;
  const fadeIn = reveal(frame, start, FEN_NAME_TERM_DUR);
  const fadeOut = 1 - reveal(frame, fadeOutStart, HE_SHOW_TERM_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

// ---------------------------------------------------------------------------
// he-name count strip + two-headed arrow + 分/合 labels.
// All elements appear in he-name and clear at start of fenheshi-intro.
// ---------------------------------------------------------------------------

const stripCardsOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    c.heName().startFrame + HE_NAME_STRIP_CARDS_REL_START,
    HE_NAME_STRIP_CARDS_DUR,
  );
  const fadeOut =
    1 - reveal(frame, c.fenheshiIntro().startFrame, FENHESHI_STRIP_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const stripArrowProgress = (frame: number): number =>
  reveal(
    frame,
    c.heName().startFrame + HE_NAME_ARROW_REL_START,
    HE_NAME_ARROW_DUR,
  );

const stripArrowOpacity = (frame: number): number => {
  const fadeIn = stripArrowProgress(frame);
  const fadeOut =
    1 - reveal(frame, c.fenheshiIntro().startFrame, FENHESHI_STRIP_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

// Soft bell envelope (0 → 1 → 0) keyed to the spoken phrase "方向相反".
// Drives a halo and a brief stroke-width bump on the existing two-headed
// arrow. No new geometry, no new primitive — fills the 19s→22.9s static
// hold inside he-name with a semantically-aligned breath of motion.
const stripArrowPulse = (frame: number): number => {
  const start = c.heName().startFrame + HE_NAME_ARROW_REPULSE_REL_START;
  const t = (frame - start) / HE_NAME_ARROW_REPULSE_DUR;
  if (t <= 0 || t >= 1) return 0;
  return Math.sin(Math.PI * t);
};

const stripFenOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    c.heName().startFrame + HE_NAME_FEN_REL_START,
    HE_NAME_FEN_DUR,
  );
  const fadeOut =
    1 - reveal(frame, c.fenheshiIntro().startFrame, FENHESHI_STRIP_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const stripHeOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    c.heName().startFrame + HE_NAME_HE_REL_START,
    HE_NAME_HE_DUR,
  );
  const fadeOut =
    1 - reveal(frame, c.fenheshiIntro().startFrame, FENHESHI_STRIP_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

// chips-fade-out at he-show start — also clears the chip-2 and chip-3
// glyphs (they re-appear in zone-strip as separate strip cards). chip-5
// stays present and migrates. visual-design §"he-show": "the '2' and '3'
// chips fade out across the first ~30% of the cue".
//
// They MUST come back for fenheshi-intro: chip-part-2 and chip-part-3 are
// the load-bearing migrating glyphs that land at the bottom of the 分合式
// diagram. We fade them back in just before their migration starts.
const heShowChipFadeOut = (kind: ChipKind, frame: number): number => {
  if (kind === "whole") return 1; // chip 5 persists
  const fadeOutStart = c.heShow().startFrame;
  const fadeOut =
    1 - reveal(frame, fadeOutStart, HE_SHOW_CHIPS_FADE_OUT_DUR);
  // Re-appear at the start of fenheshi-intro, slightly before their
  // migration begins so they're already at full opacity when they move.
  const migStart = chipMigrationStart(kind);
  const fadeInStart = Math.max(c.fenheshiIntro().startFrame, migStart - 12);
  const fadeIn = reveal(frame, fadeInStart, 12);
  return Math.max(fadeOut, fadeIn);
};

// ---------------------------------------------------------------------------
// Single FenHe diagram (centered) — appears in fenheshi-intro as the
// migration target geometry, persists into fenheshi-read, then slides
// leftward in five-1-4.
// ---------------------------------------------------------------------------

// Stroke progress for left diagonal — written in fenheshi-intro starting
// at FENHESHI_LINE_LEFT_REL_START, held thereafter.
const diagramLeftLineProgress = (frame: number): number =>
  reveal(
    frame,
    c.fenheshiIntro().startFrame + FENHESHI_LINE_LEFT_REL_START,
    FENHESHI_LINE_LEFT_DUR,
  );

const diagramRightLineProgress = (frame: number): number =>
  reveal(
    frame,
    c.fenheshiIntro().startFrame + FENHESHI_LINE_RIGHT_REL_START,
    FENHESHI_LINE_RIGHT_DUR,
  );

// Where the centered diagram sits — through fenheshi-intro, fenheshi-read.
// In five-1-4 it slides leftward to become the leftmost of a 2-diagram row.
// In five-3-2-and-4-1 it shifts further leftward to become the leftmost of
// a 4-diagram row.
const centeredDiagramX = (frame: number): number => {
  // five-1-4: slide from centered to leftmost-of-2 position
  const slide14Start = c.five14().startFrame + FIVE14_SLIDE_REL_START;
  const slide14End = slide14Start + FIVE14_SLIDE_DUR;
  // five-3-2-and-4-1: shift from leftmost-of-2 to leftmost-of-4 position
  const shift32Start = c.five32().startFrame + FIVE32_SHIFT_REL_START;
  const shift32End = shift32Start + FIVE32_SHIFT_DUR;

  if (frame < slide14Start) return SINGLE_DIAGRAM_CX;
  if (frame < slide14End) {
    const t = reveal(frame, slide14Start, FIVE14_SLIDE_DUR, EASE.enter);
    return lerp(SINGLE_DIAGRAM_CX, rowDiagramCX(0), t);
  }
  if (frame < shift32Start) return rowDiagramCX(0);
  if (frame < shift32End) {
    const t = reveal(frame, shift32Start, FIVE32_SHIFT_DUR, EASE.enter);
    return lerp(rowDiagramCX(0), rowDiagramCX(0), t); // already aligned for 4-row at slot 0
  }
  return rowDiagramCX(0);
};

// The (2,3) diagram dims after slide-14 begins.
const centeredDiagramDimmed = (frame: number): boolean =>
  frame >= c.five14().startFrame + FIVE14_SLIDE_REL_START;

// Diagram width — shrinks from SINGLE_DIAGRAM_WIDTH to ROW_DIAGRAM_WIDTH
// during the five-1-4 slide so the four-row variant fits.
const centeredDiagramWidth = (frame: number): number => {
  const slide14Start = c.five14().startFrame + FIVE14_SLIDE_REL_START;
  const slide14End = slide14Start + FIVE14_SLIDE_DUR;
  if (frame < slide14Start) return SINGLE_DIAGRAM_WIDTH;
  if (frame < slide14End) {
    const t = reveal(frame, slide14Start, FIVE14_SLIDE_DUR, EASE.enter);
    return lerp(SINGLE_DIAGRAM_WIDTH, ROW_DIAGRAM_WIDTH, t);
  }
  return ROW_DIAGRAM_WIDTH;
};

const centeredDiagramY = (frame: number): number => {
  const slide14Start = c.five14().startFrame + FIVE14_SLIDE_REL_START;
  const slide14End = slide14Start + FIVE14_SLIDE_DUR;
  if (frame < slide14Start) return SINGLE_DIAGRAM_CY;
  if (frame < slide14End) {
    const t = reveal(frame, slide14Start, FIVE14_SLIDE_DUR, EASE.enter);
    return lerp(SINGLE_DIAGRAM_CY, ROW_DIAGRAM_CY, t);
  }
  return ROW_DIAGRAM_CY;
};

// ---------------------------------------------------------------------------
// New diagrams (1,4), (3,2), (4,1) — drawn via FenHeDiagram with
// renderNumbers=true. Each has an entrance progress driven by reveal().
// ---------------------------------------------------------------------------

// (1,4) appears in slot 1 of the row, starting FIVE14_NEW_REL_START.
const diagram14Progress = (frame: number): number =>
  reveal(frame, c.five14().startFrame + FIVE14_NEW_REL_START, FIVE14_NEW_DUR);

const diagram14Opacity = (frame: number): number => diagram14Progress(frame);

// (3,2) appears in slot 2.
const diagram32Progress = (frame: number): number =>
  reveal(frame, c.five32().startFrame + FIVE32_NEW_32_REL_START, FIVE32_NEW_32_DUR);

const diagram32Opacity = (frame: number): number => diagram32Progress(frame);

// (4,1) appears in slot 3.
const diagram41Progress = (frame: number): number =>
  reveal(frame, c.five32().startFrame + FIVE32_NEW_41_REL_START, FIVE32_NEW_41_DUR);

const diagram41Opacity = (frame: number): number => diagram41Progress(frame);

// ---------------------------------------------------------------------------
// 分合式 term in zone-label.
// ---------------------------------------------------------------------------
const fenheshiTermOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    c.fenheshiIntro().startFrame + FENHESHI_TERM_REL_START,
    FENHESHI_TERM_DUR,
  );
  const fadeOut =
    1 - reveal(frame, c.five14().startFrame, FIVE14_TERM_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

// 分成 / 组成 term in zone-label (fenheshi-read).
// Both labels stay visible through end of cue; they fade out together
// when five-1-4 begins. Spatial separation (left vs right of LABEL_CX)
// prevents the previous "overlay at same coords" visual collision.
const fenchengOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    c.fenheshiRead().startFrame + READ_FENCHENG_REL_START,
    READ_FENCHENG_DUR,
  );
  const fadeOut = 1 - reveal(frame, c.five14().startFrame, FIVE14_TERM_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

const zuchengOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    c.fenheshiRead().startFrame + READ_ZUCHENG_REL_START,
    READ_ZUCHENG_DUR,
  );
  const fadeOut = 1 - reveal(frame, c.five14().startFrame, FIVE14_TERM_FADE_OUT_DUR);
  return fadeIn * fadeOut;
};

// ---------------------------------------------------------------------------
// fenheshi-read sketch sweeps — 3 marks total per sketch-overlay.md.
// The two read-arrows are SPATIALLY DISTINCT (left vs right of the
// diagram) and BOTH PERSIST through the cue. The kid sees ↓ + 分成 first,
// then ↑ + 组成 lands beside it — bidirectional relationship visible at
// once, no same-coords overlay. Both fade out with the diagram in five-1-4.
// ---------------------------------------------------------------------------
const readDownMark = (frame: number) => {
  const cue = c.fenheshiRead();
  const drawStart = cue.startFrame + READ_DOWN_REL_START;
  const drawEnd = drawStart + READ_DOWN_DUR;
  const drawProgress = progress(frame, drawStart, drawEnd);
  const fadeIn = reveal(frame, drawStart, READ_DOWN_DUR);
  const fadeOut = 1 - reveal(frame, c.five14().startFrame, FIVE14_TERM_FADE_OUT_DUR);
  return { drawProgress, opacity: fadeIn * fadeOut * 0.92 };
};

const readUpMark = (frame: number) => {
  const cue = c.fenheshiRead();
  const drawStart = cue.startFrame + READ_UP_REL_START;
  const drawEnd = drawStart + READ_UP_DUR;
  const drawProgress = progress(frame, drawStart, drawEnd);
  const fadeIn = reveal(frame, drawStart, READ_UP_DUR);
  const fadeOut = 1 - reveal(frame, c.five14().startFrame, FIVE14_TERM_FADE_OUT_DUR);
  return { drawProgress, opacity: fadeIn * fadeOut * 0.92 };
};

// Closure underline beneath the four diagrams (five-3-2-and-4-1).
const underlineMark = (frame: number) => {
  const cue = c.five32();
  const drawStart = cue.startFrame + FIVE32_UNDERLINE_REL_START;
  const drawEnd = drawStart + FIVE32_UNDERLINE_DUR;
  const fadeStart = cue.endFrame - 16;
  const fadeEnd = Math.min(fadeStart + 8, cue.endFrame);
  const drawProgress = progress(frame, drawStart, drawEnd);
  let opacity = 0;
  if (frame >= drawStart && frame < fadeStart) opacity = 0.92;
  else if (frame >= fadeStart && frame < fadeEnd) {
    opacity = lerp(0.92, 0, progress(frame, fadeStart, fadeEnd));
  }
  return { drawProgress, opacity };
};

// Sparkle accent at the moment the 分合式 settles in fenheshi-intro.
const sparkleOpacity = (frame: number): number => {
  const start = c.fenheshiIntro().startFrame + FENHESHI_SPARKLE_REL_START;
  const halfway = start + FENHESHI_SPARKLE_DUR / 2;
  if (frame < start || frame > start + FENHESHI_SPARKLE_DUR) return 0;
  if (frame <= halfway) return progress(frame, start, halfway, EASE.outQuint);
  return 1 - progress(frame, halfway, start + FENHESHI_SPARKLE_DUR, EASE.outQuint);
};

// ---------------------------------------------------------------------------
// Intro (zone-intro) — mini preview + title + subtitle.
// ---------------------------------------------------------------------------
const introPreviewOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    c.intro().startFrame + INTRO_PREVIEW_FADE_IN_REL_START,
    INTRO_PREVIEW_FADE_DUR,
  );
  // Clears at end of intro (before fen-show mounts the real row).
  const cueEnd = c.intro().endFrame;
  const fadeOut = 1 - reveal(frame, cueEnd - 18, 18);
  return fadeIn * fadeOut;
};

const introPreviewDotX = (index: number, frame: number): number => {
  const splitStart = c.intro().startFrame + INTRO_PREVIEW_SPLIT_REL_START;
  const splitEnd = splitStart + INTRO_PREVIEW_SPLIT_DUR;
  const joinStart = c.intro().startFrame + INTRO_PREVIEW_JOIN_REL_START;
  const joinEnd = joinStart + INTRO_PREVIEW_JOIN_DUR;

  if (frame < splitStart) return introPreviewJoinedX(index);
  if (frame < splitEnd) {
    const t = reveal(frame, splitStart, INTRO_PREVIEW_SPLIT_DUR, EASE.inOutCubic);
    return lerp(introPreviewJoinedX(index), introPreviewSplitX(index), t);
  }
  if (frame < joinStart) return introPreviewSplitX(index);
  if (frame < joinEnd) {
    const t = reveal(frame, joinStart, INTRO_PREVIEW_JOIN_DUR, EASE.inOutCubic);
    return lerp(introPreviewSplitX(index), introPreviewJoinedX(index), t);
  }
  return introPreviewJoinedX(index);
};

const introTitleOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    c.intro().startFrame + INTRO_TITLE_REL_START,
    INTRO_TITLE_DUR,
  );
  const cueEnd = c.intro().endFrame;
  const fadeOut = 1 - reveal(frame, cueEnd - 18, 18);
  return fadeIn * fadeOut;
};

const introSubtitleOpacity = (frame: number): number => {
  const fadeIn = reveal(
    frame,
    c.intro().startFrame + INTRO_SUBTITLE_REL_START,
    INTRO_SUBTITLE_DUR,
  );
  const cueEnd = c.intro().endFrame;
  const fadeOut = 1 - reveal(frame, cueEnd - 18, 18);
  return fadeIn * fadeOut;
};

// ---------------------------------------------------------------------------
// Outro — shrunk replay strip on left + four mini-diagrams on right + title.
// Everything from the previous cue (large four-diagram row + sketch
// underline) fades out at start of outro; the outro mini composition
// fades in.
// ---------------------------------------------------------------------------
const outroEnterFrame = () => c.outro().startFrame;

const outroDiagramsOpacity = (frame: number): number =>
  reveal(
    frame,
    outroEnterFrame() + OUTRO_DIAGRAMS_SLIDE_REL_START,
    OUTRO_DIAGRAMS_SLIDE_DUR,
  );

const outroStripOpacity = (frame: number): number =>
  reveal(
    frame,
    outroEnterFrame() + OUTRO_STRIP_FADE_REL_START,
    OUTRO_STRIP_FADE_DUR,
  );

const outroTitleOpacity = (frame: number): number =>
  reveal(
    frame,
    outroEnterFrame() + OUTRO_TITLE_REL_START,
    OUTRO_TITLE_DUR,
  );

// The big four-diagram row + underline fades out as the outro composition
// fades in (cross-fade). We use the SAME OUTRO_DIAGRAMS_SLIDE_DUR window.
const bigRowFadeOut = (frame: number): number =>
  1 -
  reveal(
    frame,
    outroEnterFrame() + OUTRO_DIAGRAMS_SLIDE_REL_START,
    OUTRO_DIAGRAMS_SLIDE_DUR,
  );

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
export const Kp1FenYuHeIntroLessonScene = () => {
  const frame = useCurrentFrame();

  // ---- intro state ----
  const introPreview = introPreviewOpacity(frame);
  const introTitle = introTitleOpacity(frame);
  const introSubtitle = introSubtitleOpacity(frame);

  // ---- dot row state ----
  const dotOpacity = dotRowOpacity(frame);
  const dotsRendered =
    frame >= dotRowMountFrame() && frame < dotRowDismissEndFrame();

  // ---- chip state (load-bearing migrating glyphs) ----
  // chipScale handles snap-on at mount; chipDiagramScale handles shrink to
  // row size after migration. We multiply them so both apply.
  const chipWhole = {
    x: chipX("whole", frame),
    y: chipY("whole", frame),
    opacity: chipOpacity("whole", frame),
    scale: chipScale("whole", frame) * chipDiagramScale("whole", frame),
  };
  const chipLeft = {
    x: chipX("left", frame),
    y: chipY("left", frame),
    opacity:
      chipOpacity("left", frame) * heShowChipFadeOut("left", frame),
    scale: chipScale("left", frame) * chipDiagramScale("left", frame),
  };
  const chipRight = {
    x: chipX("right", frame),
    y: chipY("right", frame),
    opacity:
      chipOpacity("right", frame) * heShowChipFadeOut("right", frame),
    scale: chipScale("right", frame) * chipDiagramScale("right", frame),
  };

  // ---- 分 term in zone-label (fen-name) ----
  const fenTerm = fenTermOpacity(frame);

  // ---- he-name strip ----
  const stripCards = stripCardsOpacity(frame);
  const stripArrow = stripArrowOpacity(frame);
  const stripArrowDraw = stripArrowProgress(frame);
  const stripArrowRepulse = stripArrowPulse(frame);
  const stripFen = stripFenOpacity(frame);
  const stripHe = stripHeOpacity(frame);

  // ---- diagonals + diagram ----
  const lineLeftProgress = diagramLeftLineProgress(frame);
  const lineRightProgress = diagramRightLineProgress(frame);
  const centeredDX = centeredDiagramX(frame);
  const centeredDY = centeredDiagramY(frame);
  const centeredDW = centeredDiagramWidth(frame);
  const centeredDimmed = centeredDiagramDimmed(frame);

  // Whether the centered diagram is rendered AT ALL. It first becomes
  // visible when the chip-5 begins migrating in fenheshi-intro (the
  // diagonals start drawing after FENHESHI_LINE_LEFT_REL_START).
  const centeredVisible = frame >= c.fenheshiIntro().startFrame + FENHESHI_LINE_LEFT_REL_START;

  // ---- 分合式 term ----
  const fenheshiTerm = fenheshiTermOpacity(frame);

  // ---- 分成 / 组成 ----
  const fencheng = fenchengOpacity(frame);
  const zucheng = zuchengOpacity(frame);

  // ---- new diagrams ----
  const d14Op = diagram14Opacity(frame);
  const d14Pr = diagram14Progress(frame);
  const d32Op = diagram32Opacity(frame);
  const d32Pr = diagram32Progress(frame);
  const d41Op = diagram41Opacity(frame);
  const d41Pr = diagram41Progress(frame);

  // ---- sketch marks ----
  const downMark = readDownMark(frame);
  const upMark = readUpMark(frame);
  const underline = underlineMark(frame);

  // ---- sparkle ----
  const sparkle = sparkleOpacity(frame);

  // ---- outro ----
  const outroDiagrams = outroDiagramsOpacity(frame);
  const outroStrip = outroStripOpacity(frame);
  const outroTitle = outroTitleOpacity(frame);
  const bigRowOpacity = bigRowFadeOut(frame);

  // After outro begins, the centered diagram + (1,4) + (3,2) + (4,1) all
  // cross-fade out as the mini outro versions fade in. The same opacity
  // factor applies to all (including the migrating chip glyphs that are
  // attached to the centered diagram from fenheshi-intro onward).
  const centeredOpacity = (centeredDimmed ? 0.55 : 1) * bigRowOpacity;
  const d14CombinedOp = d14Op * bigRowOpacity;
  const d32CombinedOp = d32Op * bigRowOpacity;
  const d41CombinedOp = d41Op * bigRowOpacity;

  // Migrating chip glyphs follow the centered diagram into outro fade-out.
  chipWhole.opacity *= bigRowOpacity;
  chipLeft.opacity *= bigRowOpacity;
  chipRight.opacity *= bigRowOpacity;

  // Sweep mark opacities clamped to bigRowOpacity so they also fade with
  // the row when outro starts.
  const downOpacity = downMark.opacity * bigRowOpacity;
  const upOpacity = upMark.opacity * bigRowOpacity;
  const underlineOpacity = underline.opacity * bigRowOpacity;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.cream,
        color: colors.textNavy,
        fontFamily: typography.fontFamily,
        overflow: "hidden",
      }}
    >
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        <FXDefs />

        {/* =================================================================
            INTRO — title, subtitle, mini preview
            ================================================================ */}
        {introSubtitle > 0 ? (
          <g opacity={introSubtitle}>
            <LabelCallout
              color="softGrayBlue"
              fontSize={SUBTITLE_FONT_SIZE}
              fontWeight={700}
              progress={introSubtitle}
              text="5以内数 · 分与合"
              x={LABEL_CX}
              y={INTRO_SUBTITLE_Y}
            />
          </g>
        ) : null}

        {introPreview > 0
          ? Array.from({ length: DOT_COUNT }, (_, index) => (
              <g
                key={`intro-preview-dot-${index}`}
                opacity={introPreview}
                transform={`translate(${introPreviewDotX(index, frame)} ${INTRO_PREVIEW_Y})`}
              >
                <UnitBlock
                  color={colors.reward}
                  size={INTRO_PREVIEW_DOT_DIAMETER}
                  variant="dot"
                />
              </g>
            ))
          : null}

        {introTitle > 0 ? (
          <g opacity={introTitle}>
            <LabelCallout
              color="textNavy"
              fontSize={TITLE_FONT_SIZE}
              fontWeight={900}
              progress={introTitle}
              text="分与合"
              x={LABEL_CX}
              y={INTRO_TITLE_Y}
            />
          </g>
        ) : null}

        {/* =================================================================
            DOT ROW — the 5 dots. Identity-invariant: same 5 instances
            from fen-show through fenheshi-intro. Keys dot-0..dot-4.
            Wrapped in <Breathe> so the row never sits perfectly still
            during the long holds in fen-name / he-name / fenheshi-intro.
            See CAPABILITIES.md#magic-fx-library, rule-#6 moving hold.
            ================================================================ */}
        {dotsRendered ? (
          <Breathe
            amplitudeScale={0.005}
            bpm={15}
            drift={0.6}
            originX={DOT_ROW_CX}
            originY={DOT_ROW_Y}
            phaseSeed="kp1-dot-row"
          >
            {Array.from({ length: DOT_COUNT }, (_, index) => (
              <g
                key={`dot-${index}`}
                opacity={dotOpacity}
                transform={`translate(${dotX(index, frame)} ${DOT_ROW_Y})`}
              >
                <UnitBlock
                  color={colors.reward}
                  size={DOT_DIAMETER}
                  variant="dot"
                />
              </g>
            ))}
          </Breathe>
        ) : null}

        {/* =================================================================
            COUNT CHIPS — chip-whole-5, chip-part-2, chip-part-3.
            These are THE migrating glyphs. Mounted in fen-name at zone-chips
            anchors; their x/y interpolates into the diagram anchor positions
            during fenheshi-intro. Same React keys throughout.
            ================================================================ */}
        {chipWhole.opacity > 0 ? (
          <g
            key="chip-whole-5"
            opacity={chipWhole.opacity}
            transform={`translate(${chipWhole.x} ${chipWhole.y}) scale(${chipWhole.scale})`}
          >
            <NumberCard
              color={colors.white}
              height={CHIP_HEIGHT}
              value={5}
              width={CHIP_WIDTH}
            />
          </g>
        ) : null}
        {chipLeft.opacity > 0 ? (
          <g
            key="chip-part-2"
            opacity={chipLeft.opacity}
            transform={`translate(${chipLeft.x} ${chipLeft.y}) scale(${chipLeft.scale})`}
          >
            <NumberCard
              color={colors.white}
              height={CHIP_HEIGHT}
              value={2}
              width={CHIP_WIDTH}
            />
          </g>
        ) : null}
        {chipRight.opacity > 0 ? (
          <g
            key="chip-part-3"
            opacity={chipRight.opacity}
            transform={`translate(${chipRight.x} ${chipRight.y}) scale(${chipRight.scale})`}
          >
            <NumberCard
              color={colors.white}
              height={CHIP_HEIGHT}
              value={3}
              width={CHIP_WIDTH}
            />
          </g>
        ) : null}

        {/* =================================================================
            分 TERM (fen-name) — fades in after chips land, fades out at
            start of he-show (the action "un-names" itself).
            ================================================================ */}
        {fenTerm > 0 ? (
          <g opacity={fenTerm}>
            <LabelCallout
              color="textNavy"
              fontSize={PRIMARY_LABEL_FONT_SIZE}
              fontWeight={900}
              progress={fenTerm}
              text="分"
              x={LABEL_CX}
              y={LABEL_Y}
            />
          </g>
        ) : null}

        {/* =================================================================
            HE-NAME STRIP — count strip 5/2/3 + two-headed arrow + 分/合
            All cleared at start of fenheshi-intro. Wrapped in <Breathe>
            so the strip + arrow + labels share one calm pulse during the
            extended he-name static hold (~19s–22.9s in kp1). See rule #6.
            ================================================================ */}
        <Breathe
          amplitudeScale={0.005}
          bpm={15}
          drift={0.5}
          originX={STRIP_WHOLE_CX}
          originY={STRIP_Y}
          phaseSeed="kp1-he-name-strip"
        >
        {stripCards > 0 ? (
          <>
            <g
              key="strip-card-2"
              opacity={stripCards}
              transform={`translate(${STRIP_LEFT_CX} ${STRIP_Y})`}
            >
              <NumberCard
                color={colors.white}
                height={STRIP_CARD_H}
                value={2}
                width={STRIP_CARD_W}
              />
            </g>
            <g
              key="strip-card-5"
              opacity={stripCards}
              transform={`translate(${STRIP_WHOLE_CX} ${STRIP_Y})`}
            >
              <NumberCard
                color={colors.white}
                height={STRIP_CARD_H}
                value={5}
                width={STRIP_CARD_W}
              />
            </g>
            <g
              key="strip-card-3"
              opacity={stripCards}
              transform={`translate(${STRIP_RIGHT_CX} ${STRIP_Y})`}
            >
              <NumberCard
                color={colors.white}
                height={STRIP_CARD_H}
                value={3}
                width={STRIP_CARD_W}
              />
            </g>
          </>
        ) : null}
        {stripArrow > 0 ? (
          <g opacity={stripArrow}>
            {/* Halo lines under the arrow segments, breathing in/out on
                "方向相反" to fill the static hold with semantically-aligned
                motion. Wider stroke, soft coral, only visible during pulse. */}
            {stripArrowRepulse > 0 ? (
              <g opacity={stripArrowRepulse * 0.45}>
                <line
                  stroke={colors.coral}
                  strokeLinecap="round"
                  strokeWidth={6 + stripArrowRepulse * 10}
                  x1={STRIP_ARROW_LEFT_X1}
                  x2={STRIP_ARROW_LEFT_X2}
                  y1={STRIP_Y}
                  y2={STRIP_Y}
                />
                <line
                  stroke={colors.coral}
                  strokeLinecap="round"
                  strokeWidth={6 + stripArrowRepulse * 10}
                  x1={STRIP_ARROW_RIGHT_X1}
                  x2={STRIP_ARROW_RIGHT_X2}
                  y1={STRIP_Y}
                  y2={STRIP_Y}
                />
              </g>
            ) : null}
            {/* Left arrow segment: STRIP_ARROW_LEFT_X1 → STRIP_ARROW_LEFT_X2 */}
            <line
              pathLength={1}
              stroke={colors.coral}
              strokeDasharray={1}
              strokeDashoffset={1 - stripArrowDraw}
              strokeLinecap="round"
              strokeWidth={6 + stripArrowRepulse * 1.5}
              x1={STRIP_ARROW_LEFT_X1}
              x2={STRIP_ARROW_LEFT_X2}
              y1={STRIP_Y}
              y2={STRIP_Y}
            />
            {/* Left arrowhead (points leftward, toward "2") */}
            <polyline
              fill="none"
              opacity={stripArrowDraw > 0.9 ? 1 : 0}
              points={`${STRIP_ARROW_LEFT_X1 + STRIP_ARROWHEAD_SIZE},${STRIP_Y - STRIP_ARROWHEAD_SIZE * 0.6} ${STRIP_ARROW_LEFT_X1},${STRIP_Y} ${STRIP_ARROW_LEFT_X1 + STRIP_ARROWHEAD_SIZE},${STRIP_Y + STRIP_ARROWHEAD_SIZE * 0.6}`}
              stroke={colors.coral}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={6 + stripArrowRepulse * 1.5}
            />
            {/* Right arrow segment: STRIP_ARROW_RIGHT_X1 → STRIP_ARROW_RIGHT_X2 */}
            <line
              pathLength={1}
              stroke={colors.coral}
              strokeDasharray={1}
              strokeDashoffset={1 - stripArrowDraw}
              strokeLinecap="round"
              strokeWidth={6 + stripArrowRepulse * 1.5}
              x1={STRIP_ARROW_RIGHT_X1}
              x2={STRIP_ARROW_RIGHT_X2}
              y1={STRIP_Y}
              y2={STRIP_Y}
            />
            {/* Right arrowhead (points rightward, toward "3") */}
            <polyline
              fill="none"
              opacity={stripArrowDraw > 0.9 ? 1 : 0}
              points={`${STRIP_ARROW_RIGHT_X2 - STRIP_ARROWHEAD_SIZE},${STRIP_Y - STRIP_ARROWHEAD_SIZE * 0.6} ${STRIP_ARROW_RIGHT_X2},${STRIP_Y} ${STRIP_ARROW_RIGHT_X2 - STRIP_ARROWHEAD_SIZE},${STRIP_Y + STRIP_ARROWHEAD_SIZE * 0.6}`}
              stroke={colors.coral}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={6 + stripArrowRepulse * 1.5}
            />
          </g>
        ) : null}
        {stripFen > 0 ? (
          <g opacity={stripFen}>
            <LabelCallout
              color="textNavy"
              fontSize={TERM_FONT_SIZE}
              fontWeight={900}
              progress={stripFen}
              text="分"
              x={STRIP_TERM_FEN_X}
              y={STRIP_TERM_Y}
            />
          </g>
        ) : null}
        {stripHe > 0 ? (
          <g opacity={stripHe}>
            <LabelCallout
              color="textNavy"
              fontSize={TERM_FONT_SIZE}
              fontWeight={900}
              progress={stripHe}
              text="合"
              x={STRIP_TERM_HE_X}
              y={STRIP_TERM_Y}
            />
          </g>
        ) : null}
        </Breathe>

        {/* =================================================================
            CENTERED 分合式 — diagonals only (numbers are the migrating
            chip-* instances above). Persists through fenheshi-intro,
            fenheshi-read, then slides leftward in five-1-4 / five-3-2-and-4-1.
            renderNumbers=false: identity-preserved migration.
            ================================================================ */}
        {centeredVisible && centeredOpacity > 0 ? (
          <Breathe
            amplitudeScale={0.005}
            bpm={15}
            drift={0.5}
            originX={centeredDX}
            originY={centeredDY}
            phaseSeed="kp1-centered-diagram"
          >
            <g
              key="diagram-23"
              opacity={centeredOpacity}
              transform={`translate(${centeredDX} ${centeredDY})`}
            >
              <FenHeDiagram
                diagramWidth={centeredDW}
                lineColor="textNavy"
                parts={[2, 3]}
                progress={Math.max(lineLeftProgress, lineRightProgress)}
                renderNumbers={false}
                whole={5}
              />
            </g>
          </Breathe>
        ) : null}

        {/* When the centered diagram has slid into the row (five-1-4
            onward), the chip glyphs scale down to the row diagram size so
            they read as part of a row member. The chip x/y still anchor
            on the same React keys so identity is preserved — only the
            scale prop changes. */}

        {/* =================================================================
            分合式 TERM
            ================================================================ */}
        {fenheshiTerm > 0 ? (
          <g opacity={fenheshiTerm}>
            <LabelCallout
              color="textNavy"
              fontSize={PRIMARY_LABEL_FONT_SIZE}
              fontWeight={900}
              progress={fenheshiTerm}
              text="分合式"
              underline={true}
              x={LABEL_CX}
              y={LABEL_Y}
            />
          </g>
        ) : null}

        {/* =================================================================
            分成 / 组成 (fenheshi-read) — spatially separated under their
            respective arrows so both directions read at a glance and no
            two terms ever share a pixel coordinate.
            ================================================================ */}
        {fencheng > 0 ? (
          <g opacity={fencheng}>
            <LabelCallout
              color="textNavy"
              fontSize={PRIMARY_LABEL_FONT_SIZE}
              fontWeight={900}
              progress={fencheng}
              text="分成"
              x={READ_LABEL_DOWN_X}
              y={LABEL_Y}
            />
          </g>
        ) : null}
        {zucheng > 0 ? (
          <g opacity={zucheng}>
            <LabelCallout
              color="textNavy"
              fontSize={PRIMARY_LABEL_FONT_SIZE}
              fontWeight={900}
              progress={zucheng}
              text="组成"
              x={READ_LABEL_UP_X}
              y={LABEL_Y}
            />
          </g>
        ) : null}

        {/* =================================================================
            FENHESHI-READ direction arrows — vertical arrows OUTSIDE the
            diagonals. Down-arrow on the LEFT (paired with 分成), up-arrow
            on the RIGHT (paired with 组成). Both persist through the cue
            so the bidirectional 分成/组成 relationship is visible at once.
            ================================================================ */}
        {downOpacity > 0 ? (
          <TeacherMark
            anchor={{
              kind: "span",
              start: { x: READ_ARROW_LEFT_X, y: READ_ARROW_TOP_Y },
              end: { x: READ_ARROW_LEFT_X, y: READ_ARROW_BOTTOM_Y },
            }}
            drawProgress={downMark.drawProgress}
            kind="label-arrow"
            opacity={downOpacity}
            strokeColor="textNavy"
            strokeWidth={5}
          />
        ) : null}
        {upOpacity > 0 ? (
          <TeacherMark
            anchor={{
              kind: "span",
              start: { x: READ_ARROW_RIGHT_X, y: READ_ARROW_BOTTOM_Y },
              end: { x: READ_ARROW_RIGHT_X, y: READ_ARROW_TOP_Y },
            }}
            drawProgress={upMark.drawProgress}
            kind="label-arrow"
            opacity={upOpacity}
            strokeColor="textNavy"
            strokeWidth={5}
          />
        ) : null}

        {/* =================================================================
            NEW DIAGRAMS — (1,4), (3,2), (4,1)
            Rendered with renderNumbers=true (their numbers don't migrate
            from anywhere — they belong to the diagram).
            ================================================================ */}
        {d14CombinedOp > 0 ? (
          <g opacity={d14CombinedOp} transform={`translate(${rowDiagramCX(1)} ${ROW_DIAGRAM_CY})`}>
            <FenHeDiagram
              diagramWidth={ROW_DIAGRAM_WIDTH}
              dimmed={frame >= c.five32().startFrame + FIVE32_SHIFT_REL_START}
              lineColor="textNavy"
              parts={[1, 4]}
              progress={d14Pr}
              whole={5}
            />
          </g>
        ) : null}
        {d32CombinedOp > 0 ? (
          <g opacity={d32CombinedOp} transform={`translate(${rowDiagramCX(2)} ${ROW_DIAGRAM_CY})`}>
            <FenHeDiagram
              diagramWidth={ROW_DIAGRAM_WIDTH}
              lineColor="textNavy"
              parts={[3, 2]}
              progress={d32Pr}
              whole={5}
            />
          </g>
        ) : null}
        {d41CombinedOp > 0 ? (
          <g opacity={d41CombinedOp} transform={`translate(${rowDiagramCX(3)} ${ROW_DIAGRAM_CY})`}>
            <FenHeDiagram
              diagramWidth={ROW_DIAGRAM_WIDTH}
              lineColor="textNavy"
              parts={[4, 1]}
              progress={d41Pr}
              whole={5}
            />
          </g>
        ) : null}

        {/* =================================================================
            CLOSURE UNDERLINE — beneath the four diagrams at end of
            five-3-2-and-4-1. Boiled for hand-feel.
            ================================================================ */}
        {underlineOpacity > 0 ? (
          <TeacherMark
            anchor={{
              kind: "span",
              start: {
                x: rowDiagramCX(0) - ROW_DIAGRAM_WIDTH / 2,
                y: ROW_DIAGRAM_CY + diagramAnchors.leftPart.y + 60,
              },
              end: {
                x: rowDiagramCX(3) + ROW_DIAGRAM_WIDTH / 2,
                y: ROW_DIAGRAM_CY + diagramAnchors.leftPart.y + 60,
              },
            }}
            boil={{ holdFrames: 5, magnitude: 4 }}
            drawProgress={underline.drawProgress}
            kind="underline"
            opacity={underlineOpacity}
            strokeColor="textNavy"
            strokeWidth={4}
          />
        ) : null}

        {/* =================================================================
            SPARKLE — single accent of the entire video, fenheshi-intro
            ================================================================ */}
        {sparkle > 0 ? (
          <g opacity={sparkle}>
            <GlintFlash
              color={colors.sunshine}
              durationInFrames={FENHESHI_SPARKLE_DUR}
              size={56}
              startFrame={c.fenheshiIntro().startFrame + FENHESHI_SPARKLE_REL_START}
              x={SINGLE_DIAGRAM_CX}
              y={SINGLE_DIAGRAM_CY}
            />
          </g>
        ) : null}

        {/* =================================================================
            OUTRO — compact replay strip on left, four mini-diagrams on
            right, title at bottom. All driven by the outro cue's
            startFrame + REL offsets.
            ================================================================ */}
        {outroStrip > 0 ? (
          <g opacity={outroStrip}>
            <g transform={`translate(${OUTRO_STRIP_LEFT_CX} ${OUTRO_STRIP_Y})`}>
              <NumberCard
                color={colors.white}
                height={OUTRO_STRIP_CARD_H}
                value={2}
                width={OUTRO_STRIP_CARD_W}
              />
            </g>
            <g transform={`translate(${OUTRO_STRIP_CX} ${OUTRO_STRIP_Y})`}>
              <NumberCard
                color={colors.white}
                height={OUTRO_STRIP_CARD_H}
                value={5}
                width={OUTRO_STRIP_CARD_W}
              />
            </g>
            <g transform={`translate(${OUTRO_STRIP_RIGHT_CX} ${OUTRO_STRIP_Y})`}>
              <NumberCard
                color={colors.white}
                height={OUTRO_STRIP_CARD_H}
                value={3}
                width={OUTRO_STRIP_CARD_W}
              />
            </g>
            <LabelCallout
              color="textNavy"
              fontSize={OUTRO_TERM_FONT_SIZE}
              fontWeight={900}
              progress={1}
              text="分"
              x={(OUTRO_STRIP_LEFT_CX + OUTRO_STRIP_CX) / 2}
              y={OUTRO_STRIP_TERM_Y}
            />
            <LabelCallout
              color="textNavy"
              fontSize={OUTRO_TERM_FONT_SIZE}
              fontWeight={900}
              progress={1}
              text="合"
              x={(OUTRO_STRIP_CX + OUTRO_STRIP_RIGHT_CX) / 2}
              y={OUTRO_STRIP_TERM_Y}
            />
          </g>
        ) : null}

        {outroDiagrams > 0 ? (
          <>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.4}
              originX={outroDiagramCX(0)}
              originY={OUTRO_DIAGRAM_CY}
              phaseSeed="kp1-outro-d23"
            >
              <g
                opacity={outroDiagrams}
                transform={`translate(${outroDiagramCX(0)} ${OUTRO_DIAGRAM_CY})`}
              >
                <FenHeDiagram
                  diagramWidth={OUTRO_DIAGRAM_WIDTH}
                  lineColor="textNavy"
                  parts={[2, 3]}
                  progress={1}
                  whole={5}
                />
              </g>
            </Breathe>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.4}
              originX={outroDiagramCX(1)}
              originY={OUTRO_DIAGRAM_CY}
              phaseSeed="kp1-outro-d14"
            >
              <g
                opacity={outroDiagrams}
                transform={`translate(${outroDiagramCX(1)} ${OUTRO_DIAGRAM_CY})`}
              >
                <FenHeDiagram
                  diagramWidth={OUTRO_DIAGRAM_WIDTH}
                  lineColor="textNavy"
                  parts={[1, 4]}
                  progress={1}
                  whole={5}
                />
              </g>
            </Breathe>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.4}
              originX={outroDiagramCX(2)}
              originY={OUTRO_DIAGRAM_CY}
              phaseSeed="kp1-outro-d32"
            >
              <g
                opacity={outroDiagrams}
                transform={`translate(${outroDiagramCX(2)} ${OUTRO_DIAGRAM_CY})`}
              >
                <FenHeDiagram
                  diagramWidth={OUTRO_DIAGRAM_WIDTH}
                  lineColor="textNavy"
                  parts={[3, 2]}
                  progress={1}
                  whole={5}
                />
              </g>
            </Breathe>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.4}
              originX={outroDiagramCX(3)}
              originY={OUTRO_DIAGRAM_CY}
              phaseSeed="kp1-outro-d41"
            >
              <g
                opacity={outroDiagrams}
                transform={`translate(${outroDiagramCX(3)} ${OUTRO_DIAGRAM_CY})`}
              >
                <FenHeDiagram
                  diagramWidth={OUTRO_DIAGRAM_WIDTH}
                  lineColor="textNavy"
                  parts={[4, 1]}
                  progress={1}
                  whole={5}
                />
              </g>
            </Breathe>
          </>
        ) : null}

        {outroTitle > 0 ? (
          <g opacity={outroTitle}>
            <LabelCallout
              color="textNavy"
              fontSize={TITLE_FONT_SIZE}
              fontWeight={900}
              progress={outroTitle}
              text="5 的分与合"
              x={OUTRO_TITLE_CX}
              y={OUTRO_TITLE_Y}
            />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
