import type { Bbox, ZoneName } from "../../manifestTypes";
import { video } from "../../../theme";

// ---------------------------------------------------------------------------
// Composition — 1280×720 @ 30fps. Zones from visual-design §1.5.
// ---------------------------------------------------------------------------
export const CANVAS_WIDTH = video.width;
export const CANVAS_HEIGHT = video.height;

// ---------------------------------------------------------------------------
// Teaching unit — the 5-dot row (zone-stage). Identity-invariant across
// fen-show / fen-name / he-show / he-name and dimmed-backed in fenheshi-intro.
// Visual-design §1: 84 px diameter, 140 px center-to-center, 240 px gap
// between clusters post-split.
// ---------------------------------------------------------------------------
export const DOT_COUNT = 5;
export const DOT_DIAMETER = 84;
export const DOT_SPACING = 140;

// Row center.
export const DOT_ROW_CX = 640;
export const DOT_ROW_Y = 360;

// Per-dot x in the joined (un-split) state — symmetric around DOT_ROW_CX.
export const dotJoinedX = (index: number): number =>
  DOT_ROW_CX + (index - (DOT_COUNT - 1) / 2) * DOT_SPACING;

// Per-dot x in the split state — left cluster {0,1} eases left, right
// cluster {2,3,4} eases right so a 240 px gap opens between them.
// The cluster gap is measured edge-to-edge of the dot centers; we shift
// each cluster outward by half the extra gap.
export const SPLIT_EXTRA_GAP = 240 - DOT_SPACING; // 100 px additional gap
const SPLIT_SHIFT = SPLIT_EXTRA_GAP / 2;
export const dotSplitX = (index: number): number => {
  const base = dotJoinedX(index);
  return index < 2 ? base - SPLIT_SHIFT : base + SPLIT_SHIFT;
};

// Cluster centers (split state) used by count chip anchors above each cluster.
export const LEFT_CLUSTER_CX =
  (dotSplitX(0) + dotSplitX(1)) / 2; // ≈ 450
export const RIGHT_CLUSTER_CX =
  (dotSplitX(2) + dotSplitX(3) + dotSplitX(4)) / 3; // ≈ 780

// ---------------------------------------------------------------------------
// Count chips (zone-chips) — the "5" / "2" / "3" glyphs above clusters
// BEFORE they migrate. Visual-design §1: 80 px glyph height, well above
// 36 px body-label minimum.
// ---------------------------------------------------------------------------
export const CHIP_WIDTH = 92;
export const CHIP_HEIGHT = 110;
export const CHIP_Y = 220; // zone-chips middle (y=150..240)

// Chip x in zone-chips:
//   "5" chip — centered above the whole row.
//   "2" chip — centered above the left cluster.
//   "3" chip — centered above the right cluster.
export const CHIP_WHOLE_X = DOT_ROW_CX;
export const CHIP_LEFT_X = LEFT_CLUSTER_CX;
export const CHIP_RIGHT_X = RIGHT_CLUSTER_CX;

// ---------------------------------------------------------------------------
// 分合式 diagram (zone-diagram) — geometry parameters consumed by the
// FenHeDiagram primitive AND by the migration target calculation in the
// scene. The same diagramWidth feeds getFenHeDiagramAnchors().
// ---------------------------------------------------------------------------

// Single centered diagram (fenheshi-intro, fenheshi-read).
export const SINGLE_DIAGRAM_WIDTH = 280;
export const SINGLE_DIAGRAM_CX = 640;
// Diagram y so the whole-number card sits high enough that the migrating
// "5" travels visibly upward from zone-chips (chips at y=220, whole anchor
// y = SINGLE_DIAGRAM_CY - verticalReach/2). Pick CY so whole anchor lands
// near y=210 → CY = 210 + (0.65*280)/2 = 210 + 91 = 301.
export const SINGLE_DIAGRAM_CY = 320;

// Four-diagram row (five-1-4, five-3-2-and-4-1).
// Density target: four diagrams + three gaps fit within ~1040 px (visual
// design §1). diagram_width=220, gap=80 → 4*220 + 3*80 = 1120 px = 87.5%.
// Diagrams centered horizontally on x=640.
export const ROW_DIAGRAM_WIDTH = 220;
export const ROW_DIAGRAM_GAP = 80;
export const ROW_DIAGRAM_CY = 360;
export const ROW_DIAGRAM_TOTAL_WIDTH =
  4 * ROW_DIAGRAM_WIDTH + 3 * ROW_DIAGRAM_GAP;
export const ROW_DIAGRAM_START_CX =
  640 - ROW_DIAGRAM_TOTAL_WIDTH / 2 + ROW_DIAGRAM_WIDTH / 2;
export const rowDiagramCX = (index: number): number =>
  ROW_DIAGRAM_START_CX + index * (ROW_DIAGRAM_WIDTH + ROW_DIAGRAM_GAP);

// ---------------------------------------------------------------------------
// he-name count strip (zone-strip).
// Strip y centered in zone-strip (y=480..540 → y=510).
// Five-twos-threes arrangement: "5" centered, two-headed arrow flanking it
// to "2" on the left and "3" on the right.
// ---------------------------------------------------------------------------
export const STRIP_Y = 510;
export const STRIP_WHOLE_CX = 640;
export const STRIP_LEFT_CX = 460;
export const STRIP_RIGHT_CX = 820;
export const STRIP_CARD_W = 80;
export const STRIP_CARD_H = 96;
// Two-headed arrow geometry — drawn as two segments + two arrowheads.
// Endpoints sit just inside each part-card.
export const STRIP_ARROW_LEFT_X1 = STRIP_LEFT_CX + STRIP_CARD_W / 2 + 8;
export const STRIP_ARROW_LEFT_X2 = STRIP_WHOLE_CX - STRIP_CARD_W / 2 - 8;
export const STRIP_ARROW_RIGHT_X1 = STRIP_WHOLE_CX + STRIP_CARD_W / 2 + 8;
export const STRIP_ARROW_RIGHT_X2 = STRIP_RIGHT_CX - STRIP_CARD_W / 2 - 8;
export const STRIP_ARROWHEAD_SIZE = 14;
// 分 / 合 labels sit just above the strip near each arrowhead.
export const STRIP_TERM_Y = STRIP_Y - 56;
export const STRIP_TERM_FEN_X =
  (STRIP_ARROW_LEFT_X1 + STRIP_ARROW_LEFT_X2) / 2;
export const STRIP_TERM_HE_X =
  (STRIP_ARROW_RIGHT_X1 + STRIP_ARROW_RIGHT_X2) / 2;

// ---------------------------------------------------------------------------
// zone-label — term labels under the diagram. Visual-design §1.5 zone-label
// y=560..610, but the caption ribbon (zone-caption) at the bottom of the
// canvas renders as a pill that visually extends UP into zone-label space
// (ribbon top edge ≈ y=540 for a two-line caption). We raise LABEL_Y above
// that ceiling so terms remain readable. Diagram bottom edge ≈ y=470 at
// SINGLE_DIAGRAM_CY=320 + half-height, leaving room for a y=520 label.
// ---------------------------------------------------------------------------
export const LABEL_Y = 520;
export const LABEL_CX = 640;

// ---------------------------------------------------------------------------
// Intro (zone-intro) — title + subtitle + mini dot preview.
// ---------------------------------------------------------------------------
export const INTRO_SUBTITLE_Y = 230;
export const INTRO_PREVIEW_Y = 320;
export const INTRO_TITLE_Y = 470;
export const INTRO_PREVIEW_DOT_DIAMETER = 48;
export const INTRO_PREVIEW_SPACING = 76;
export const INTRO_PREVIEW_SPLIT_SHIFT = 70;
export const introPreviewJoinedX = (index: number): number =>
  640 + (index - (DOT_COUNT - 1) / 2) * INTRO_PREVIEW_SPACING;
export const introPreviewSplitX = (index: number): number => {
  const base = introPreviewJoinedX(index);
  return index < 2 ? base - INTRO_PREVIEW_SPLIT_SHIFT : base + INTRO_PREVIEW_SPLIT_SHIFT;
};

// ---------------------------------------------------------------------------
// Outro (zone-outro) — three-up recap.
// ---------------------------------------------------------------------------
// Left half: compact replay strip with 5/2/3 + two-headed arrow + 分/合.
export const OUTRO_STRIP_CX = 340;
export const OUTRO_STRIP_Y = 280;
export const OUTRO_STRIP_CARD_W = 56;
export const OUTRO_STRIP_CARD_H = 68;
export const OUTRO_STRIP_LEFT_CX = OUTRO_STRIP_CX - 110;
export const OUTRO_STRIP_RIGHT_CX = OUTRO_STRIP_CX + 110;
export const OUTRO_STRIP_TERM_Y = OUTRO_STRIP_Y - 50;
// Right half: compact row of four 分合式.
export const OUTRO_DIAGRAM_WIDTH = 120;
export const OUTRO_DIAGRAM_GAP = 36;
export const OUTRO_DIAGRAM_CY = 320;
export const OUTRO_DIAGRAM_TOTAL =
  4 * OUTRO_DIAGRAM_WIDTH + 3 * OUTRO_DIAGRAM_GAP;
export const OUTRO_DIAGRAM_START_CX =
  940 - OUTRO_DIAGRAM_TOTAL / 2 + OUTRO_DIAGRAM_WIDTH / 2;
export const outroDiagramCX = (index: number): number =>
  OUTRO_DIAGRAM_START_CX + index * (OUTRO_DIAGRAM_WIDTH + OUTRO_DIAGRAM_GAP);
// Bottom title.
export const OUTRO_TITLE_Y = 540;
export const OUTRO_TITLE_CX = 640;

// ---------------------------------------------------------------------------
// Typography sizes (from visual-design §3).
// ---------------------------------------------------------------------------
export const PRIMARY_LABEL_FONT_SIZE = 56;
export const TITLE_FONT_SIZE = 60;
export const SUBTITLE_FONT_SIZE = 38;
export const TERM_FONT_SIZE = 48;
export const OUTRO_TERM_FONT_SIZE = 32;
export const READING_TERM_FONT_SIZE = 48;

// ---------------------------------------------------------------------------
// Motion budgets — every constant below is in FRAMES, cue-relative.
// The scene reads padded cues[id].startFrame/endFrame from the timeline and
// adds these offsets. ZERO master-timeline literals.
// ---------------------------------------------------------------------------

// intro (~7.5s padded)
export const INTRO_SUBTITLE_REL_START = 4;
export const INTRO_SUBTITLE_DUR = 12;
export const INTRO_PREVIEW_FADE_IN_REL_START = 10;
export const INTRO_PREVIEW_FADE_DUR = 12;
export const INTRO_PREVIEW_SPLIT_REL_START = 30;
export const INTRO_PREVIEW_SPLIT_DUR = 24;
export const INTRO_PREVIEW_JOIN_REL_START = 80;
export const INTRO_PREVIEW_JOIN_DUR = 24;
export const INTRO_TITLE_REL_START = 30;
export const INTRO_TITLE_DUR = 12;

// fen-show (~10s padded)
export const FEN_DOTS_FADE_IN_DUR = 12;
export const FEN_SPLIT_REL_START = 30;
export const FEN_SPLIT_DUR = 24;

// fen-name (~12s padded)
export const FEN_NAME_CHIP_5_REL_START = 6;
export const FEN_NAME_CHIP_2_REL_START = 28;
export const FEN_NAME_CHIP_3_REL_START = 46;
export const FEN_NAME_CHIP_DUR = 16;
export const FEN_NAME_TERM_REL_START = 76;
export const FEN_NAME_TERM_DUR = 14;

// he-show (~9s padded)
// fen-name 分 term + chips fade out as he-show starts.
export const HE_SHOW_CHIPS_FADE_OUT_DUR = 18;
export const HE_SHOW_TERM_FADE_OUT_DUR = 14;
export const HE_SHOW_REJOIN_REL_START = 12;
export const HE_SHOW_REJOIN_DUR = 24;

// he-name (~12s padded)
export const HE_NAME_STRIP_CARDS_REL_START = 6;
export const HE_NAME_STRIP_CARDS_DUR = 16;
export const HE_NAME_ARROW_REL_START = 32;
export const HE_NAME_ARROW_DUR = 18;
export const HE_NAME_FEN_REL_START = 58;
export const HE_NAME_FEN_DUR = 12;
export const HE_NAME_HE_REL_START = 70;
export const HE_NAME_HE_DUR = 12;
// Re-pulse during "方向相反" (~ASR seg 3, tokens 3-6 at REL 130→185 in he-name).
// 200ms-rule lead: pulse-onset 6 frames before the spoken "方".
// Envelope is a soft bell (sin π·t) over the duration; halo + stroke fattening
// on the existing two-headed arrow, NO new geometry.
export const HE_NAME_ARROW_REPULSE_REL_START = 128;
export const HE_NAME_ARROW_REPULSE_DUR = 40;

// fenheshi-intro (~15s padded — LOAD-BEARING CUE)
// Dot row dims to backing layer.
export const FENHESHI_DOTS_DIM_DUR = 18;
// Strip exits (he-name elements fade out).
export const FENHESHI_STRIP_FADE_OUT_DUR = 14;
// Migrating glyphs — sequenced 5, 2, 3.
// "5" travels first (zone-chips → top of diagram).
// External NumberCard instances (key chip-whole-5/chip-part-2/chip-part-3)
// interpolate their x/y to the diagram anchor positions.
export const FENHESHI_MIGRATE_5_REL_START = 30;
export const FENHESHI_MIGRATE_DUR = 30;
export const FENHESHI_MIGRATE_2_REL_START = 60;
export const FENHESHI_MIGRATE_3_REL_START = 84;
// Diagonals draw on once their lower endpoint is in motion.
export const FENHESHI_LINE_LEFT_REL_START = 78;
export const FENHESHI_LINE_LEFT_DUR = 24;
export const FENHESHI_LINE_RIGHT_REL_START = 102;
export const FENHESHI_LINE_RIGHT_DUR = 24;
// Settle sparkle — single accent of the entire video.
export const FENHESHI_SPARKLE_REL_START = 130;
export const FENHESHI_SPARKLE_DUR = 14;
// 分合式 term label.
export const FENHESHI_TERM_REL_START = 140;
export const FENHESHI_TERM_DUR = 14;
// Dot row dismisses after settle.
export const FENHESHI_DOTS_DISMISS_REL_START = 160;
export const FENHESHI_DOTS_DISMISS_DUR = 16;

// fenheshi-read (~13s padded)
// Carrying the same diagram instance from fenheshi-intro (held).
// Two arrows + two labels, spatially distinct on opposite sides of the
// diagram so the direction reversal is the visible event. The downward
// pair (arrow + 分成) sits to the LEFT of the diagram; the upward pair
// (arrow + 组成) sits to the RIGHT. Both stay visible to end of cue,
// then fade together when five-1-4 begins.
export const READ_DOWN_REL_START = 8;
export const READ_DOWN_DUR = 24;
export const READ_FENCHENG_REL_START = 8;
export const READ_FENCHENG_DUR = 12;
// Note: no fenche fade-out within cue — labels persist with the diagram
// and fade together when five-1-4 begins.
export const READ_UP_REL_START = 100;
export const READ_UP_DUR = 24;
export const READ_ZUCHENG_REL_START = 100;
export const READ_ZUCHENG_DUR = 12;

// Read arrow + label geometry. Arrows are vertical lines OUTSIDE the
// diagram's diagonal lines (chip-2 left edge ≈ x=500, chip-3 right edge
// ≈ x=780) so they don't collide with diagram strokes or chip glyphs.
// Arrowhead at the END point: down-arrow head at the bottom, up-arrow
// head at the top — direction is what the kid is supposed to read.
export const READ_ARROW_LEFT_X = 470;
export const READ_ARROW_RIGHT_X = 810;
export const READ_ARROW_TOP_Y = 200;
export const READ_ARROW_BOTTOM_Y = 460;
// Labels sit under each arrow (left and right of LABEL_CX), not stacked
// at LABEL_CX where they'd visually overlay.
export const READ_LABEL_DOWN_X = READ_ARROW_LEFT_X;
export const READ_LABEL_UP_X = READ_ARROW_RIGHT_X;

// five-1-4 (~10.5s padded)
// Held (2,3) diagram slides leftward and dims.
export const FIVE14_SLIDE_REL_START = 4;
export const FIVE14_SLIDE_DUR = 24;
// 分合式 term label clears.
export const FIVE14_TERM_FADE_OUT_DUR = 14;
// New (1,4) diagram appears to the right.
export const FIVE14_NEW_REL_START = 32;
export const FIVE14_NEW_DUR = 26;

// five-3-2-and-4-1 (~14s padded)
// Existing (2,3) and (1,4) shift leftward; (3,2) then (4,1) arrive.
export const FIVE32_SHIFT_REL_START = 4;
export const FIVE32_SHIFT_DUR = 24;
export const FIVE32_NEW_32_REL_START = 30;
export const FIVE32_NEW_32_DUR = 24;
export const FIVE32_NEW_41_REL_START = 60;
export const FIVE32_NEW_41_DUR = 24;
// Underline beneath the four diagrams writes on after the last lands.
export const FIVE32_UNDERLINE_REL_START = 90;
export const FIVE32_UNDERLINE_DUR = 24;

// outro (~9s padded)
// All four diagrams shrink-and-slide into outro positions.
// Replay strip fades in left.
// Title writes on at the bottom.
export const OUTRO_DIAGRAMS_SLIDE_REL_START = 0;
export const OUTRO_DIAGRAMS_SLIDE_DUR = 30;
export const OUTRO_STRIP_FADE_REL_START = 12;
export const OUTRO_STRIP_FADE_DUR = 18;
export const OUTRO_TITLE_REL_START = 48;
export const OUTRO_TITLE_DUR = 18;

// ---------------------------------------------------------------------------
// Zones — composition pixel space (top-left origin) from visual-design §1.5.
// (Scaled to the 1280×720 actual canvas; the visual-design used 1920×1080
// math in §1.5 but referenced the 1280×720 canvas — these zones reflect the
// rendered composition.)
// ---------------------------------------------------------------------------
export const ZONES: Partial<Record<ZoneName, Bbox>> = {
  objects: [80, 270, 1120, 200], // zone-stage — dot row
  badges: [80, 160, 1120, 100], // zone-chips — count chips
  tally: [80, 460, 1120, 90], // zone-strip — he-name count strip
  labels: [80, 560, 1120, 80], // zone-label — term labels
  marks: [0, 0, CANVAS_WIDTH, CANVAS_HEIGHT],
};
