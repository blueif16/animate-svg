// glyphStrokes.ts — the SHARED, lesson-agnostic stroke-order data lookup that
// drives <GlyphStrokeWriter>. The WRITER component bakes no glyph; this data
// module is the reusable artifact that says, for each character, the ORDERED
// sequence of pen strokes (笔顺), each stroke's path (its curve + 方向), and
// optional 起笔/收笔 dot anchors.
//
// COORDINATE SYSTEM — every path is authored in a normalized 0..100 box
// (top-left origin, y DOWN, like SVG). The writer scales this box to whatever
// StrokeGuideCell size the caller asks for, so the SAME data renders crisp at
// any render size. Author once, reuse everywhere.
//
// LESSON-AGNOSTIC: this is pure geometry + ordering keyed by the glyph char.
// No lesson topic, no copy, no frame numbers. A digit is a digit whether the
// lesson is 1~5的书写 or any future numeral lesson; a comparison symbol is the
// same glyph in 比大小 or anywhere it appears.

export type GlyphPoint = { x: number; y: number };

export type GlyphStroke = {
  /** The stroke path, in the normalized 0..100 box. The writer scales it. */
  d: string;
  /** 起笔 — where the pen lands to begin this stroke (normalized box coords). */
  startDot?: GlyphPoint;
  /** 收笔 — where the pen lifts at the end of this stroke (normalized box). */
  endDot?: GlyphPoint;
};

export type GlyphStrokeData = {
  /** The ORDERED strokes (笔顺). Index 0 is drawn first. */
  strokes: GlyphStroke[];
};

// The normalized authoring box. Paths live inside [INSET, BOX-INSET] so the
// glyph breathes inside the writing cell rather than touching the grid lines.
export const GLYPH_BOX = 100;

// ---------------------------------------------------------------------------
// The lookup. Each entry's strokes are authored so the pen DIRECTION reads
// correctly when animated start→end (the misconception target for 2 and 3:
// 弧度变形 / 写反). `startDot`/`endDot` mark 起笔/收笔.
// ---------------------------------------------------------------------------
//
// Digits use a tall body roughly spanning y∈[16,84], x∈[28,72] — a single-cell
// numeral. Comparison symbols span the cell width x∈[22,78] in two strokes.

export const GLYPH_STROKES: Record<string, GlyphStrokeData> = {
  // 0 — one continuous oval, drawn counter-clockwise from the top (起笔 top).
  "0": {
    strokes: [
      {
        d: "M 50 16 C 30 16 28 36 28 50 C 28 64 30 84 50 84 C 70 84 72 64 72 50 C 72 36 70 16 50 16 Z",
        startDot: { x: 50, y: 16 },
        endDot: { x: 50, y: 16 },
      },
    ],
  },

  // 1 — a small lead-in flag then the long vertical down. Two strokes.
  "1": {
    strokes: [
      {
        d: "M 38 28 L 52 18",
        startDot: { x: 38, y: 28 },
        endDot: { x: 52, y: 18 },
      },
      {
        d: "M 52 18 L 52 84",
        startDot: { x: 52, y: 18 },
        endDot: { x: 52, y: 84 },
      },
    ],
  },

  // 2 — THE misconception glyph. Stroke 1: the TOP ARC — pen starts upper-left,
  // sweeps up-over-and-down to the RIGHT then curls back down-left (a hook that
  // opens to the LOWER-LEFT). Stroke 2: the BOTTOM HORIZONTAL — sweeps left→RIGHT
  // along the baseline. If the arc curls the wrong way the 2 reads as a reversed
  // 2 — this geometry fixes the arc direction at the data layer.
  "2": {
    strokes: [
      {
        d: "M 30 34 C 32 18 56 14 68 26 C 78 36 72 50 58 60 L 32 80",
        startDot: { x: 30, y: 34 },
        endDot: { x: 32, y: 80 },
      },
      {
        d: "M 32 82 L 74 82",
        startDot: { x: 32, y: 82 },
        endDot: { x: 74, y: 82 },
      },
    ],
  },

  // 3 — TWO STACKED HALF-CIRCLES (the 两个半圆 difficulty). Stroke 1: the upper
  // bowl opens LEFT, ending at the waist. Stroke 2: the lower bowl, larger,
  // also opens LEFT, from the waist down and around to close near the start.
  "3": {
    strokes: [
      {
        d: "M 30 26 C 40 14 66 16 70 30 C 72 42 60 50 48 50",
        startDot: { x: 30, y: 26 },
        endDot: { x: 48, y: 50 },
      },
      {
        d: "M 48 50 C 64 50 74 60 72 72 C 68 86 38 88 28 74",
        startDot: { x: 48, y: 50 },
        endDot: { x: 28, y: 74 },
      },
    ],
  },

  // 4 — Stroke 1: the diagonal down-left from the top, then the horizontal
  // cross-bar. Stroke 2: the long vertical down on the right. Two strokes.
  "4": {
    strokes: [
      {
        d: "M 58 16 L 26 64 L 76 64",
        startDot: { x: 58, y: 16 },
        endDot: { x: 76, y: 64 },
      },
      {
        d: "M 60 30 L 60 84",
        startDot: { x: 60, y: 30 },
        endDot: { x: 60, y: 84 },
      },
    ],
  },

  // 5 — Stroke 1: the top cap going RIGHT then the vertical drop to the waist.
  // Stroke 2: the big lower bowl curving right and down, opening LEFT. Two
  // strokes (the canonical 5的两笔 order).
  "5": {
    strokes: [
      {
        d: "M 68 18 L 34 18 L 32 46",
        startDot: { x: 68, y: 18 },
        endDot: { x: 32, y: 46 },
      },
      {
        d: "M 32 46 C 48 40 70 44 72 62 C 74 80 48 88 30 78",
        startDot: { x: 32, y: 46 },
        endDot: { x: 30, y: 78 },
      },
    ],
  },

  // 6 — one stroke: down the left curve, then loop the lower bowl closed.
  "6": {
    strokes: [
      {
        d: "M 64 18 C 44 24 30 44 30 62 C 30 80 46 86 56 84 C 70 82 74 66 66 58 C 58 50 38 52 32 64",
        startDot: { x: 64, y: 18 },
        endDot: { x: 32, y: 64 },
      },
    ],
  },

  // 7 — Stroke 1: the top horizontal going RIGHT. Stroke 2: the long diagonal
  // down-left. Two strokes.
  "7": {
    strokes: [
      {
        d: "M 28 18 L 74 18",
        startDot: { x: 28, y: 18 },
        endDot: { x: 74, y: 18 },
      },
      {
        d: "M 74 18 L 44 84",
        startDot: { x: 74, y: 18 },
        endDot: { x: 44, y: 84 },
      },
    ],
  },

  // 8 — one continuous figure-eight from the top, crossing at the waist.
  "8": {
    strokes: [
      {
        d: "M 50 50 C 34 44 32 18 50 18 C 68 18 66 44 50 50 C 32 56 30 84 50 84 C 70 84 68 56 50 50 Z",
        startDot: { x: 50, y: 50 },
        endDot: { x: 50, y: 50 },
      },
    ],
  },

  // 9 — one stroke: the upper bowl closed first, then the tail down the right.
  "9": {
    strokes: [
      {
        d: "M 68 40 C 62 28 42 28 36 40 C 30 52 42 62 56 58 C 64 56 70 48 70 36 C 70 60 66 76 40 84",
        startDot: { x: 68, y: 40 },
        endDot: { x: 40, y: 84 },
      },
    ],
  },

  // = — TWO horizontals, top then bottom, each swept left→RIGHT (笔顺 + 方向).
  // The difficulty is 把符号画成图 / 笔画不匀 — two even, parallel, equal-length
  // strokes fix that.
  "=": {
    strokes: [
      {
        d: "M 24 40 L 76 40",
        startDot: { x: 24, y: 40 },
        endDot: { x: 76, y: 40 },
      },
      {
        d: "M 24 62 L 76 62",
        startDot: { x: 24, y: 62 },
        endDot: { x: 76, y: 62 },
      },
    ],
  },

  // > — the OPEN side faces LEFT (point on the right). Stroke 1: upper arm from
  // upper-left down to the right point. Stroke 2: from that point down to the
  // lower-left. Two strokes meeting at the point.
  ">": {
    strokes: [
      {
        d: "M 26 26 L 76 50",
        startDot: { x: 26, y: 26 },
        endDot: { x: 76, y: 50 },
      },
      {
        d: "M 76 50 L 26 74",
        startDot: { x: 76, y: 50 },
        endDot: { x: 26, y: 74 },
      },
    ],
  },

  // < — the OPEN side faces RIGHT (point on the left). Stroke 1: upper arm from
  // upper-right down to the left point. Stroke 2: from that point down to the
  // lower-right. Two strokes meeting at the point.
  "<": {
    strokes: [
      {
        d: "M 74 26 L 24 50",
        startDot: { x: 74, y: 26 },
        endDot: { x: 24, y: 50 },
      },
      {
        d: "M 24 50 L 74 74",
        startDot: { x: 24, y: 50 },
        endDot: { x: 74, y: 74 },
      },
    ],
  },

  // ===========================================================================
  // 汉字基本笔画 (BASIC STROKES) — each is a SINGLE-STROKE "glyph", keyed by the
  // 笔画 NAME (a multi-char string, never a single Chinese char), so a lesson can
  // demo one stroke in isolation (横/竖/撇/捺/点/横折/弯钩). KEYING CONVENTION:
  // basic strokes are keyed by their pinyin-free 笔画名 string ("横", "横折",
  // "弯钩", …); the looked-up data is one stroke. Characters below are keyed by
  // the single hanzi char. `glyphStrokesFor(key)` handles both — it's a plain
  // string lookup. Each stroke is authored to read with the correct 方向 when
  // animated start→end (起笔 → 收笔), large and centered in the cell.
  // ===========================================================================

  // 横 héng — the horizontal: pen lands left, sweeps RIGHT, lifts slightly
  // higher (the 起笔顿 → 行笔 → 收笔 shape, kept simple as a near-level line).
  "横": {
    strokes: [
      {
        d: "M 22 52 L 78 48",
        startDot: { x: 22, y: 52 },
        endDot: { x: 78, y: 48 },
      },
    ],
  },

  // 竖 shù — the vertical: pen lands top, drops straight DOWN, lifts at the
  // bottom (悬针/垂露 simplified to a clean vertical).
  "竖": {
    strokes: [
      {
        d: "M 50 18 L 50 82",
        startDot: { x: 50, y: 18 },
        endDot: { x: 50, y: 82 },
      },
    ],
  },

  // 撇 piě — the left-falling: pen lands UPPER-RIGHT, sweeps DOWN-LEFT, thinning
  // and curving out to the lower-left (撇出).
  "撇": {
    strokes: [
      {
        d: "M 66 20 C 56 38 44 56 26 78",
        startDot: { x: 66, y: 20 },
        endDot: { x: 26, y: 78 },
      },
    ],
  },

  // 捺 nà — the right-falling: pen lands UPPER-LEFT, sweeps DOWN-RIGHT, pressing
  // then flaring out to a foot at the lower-right (捺脚/出锋).
  "捺": {
    strokes: [
      {
        d: "M 30 22 C 42 40 54 58 76 76",
        startDot: { x: 30, y: 22 },
        endDot: { x: 76, y: 76 },
      },
    ],
  },

  // 点 diǎn — the dot: a short tick pressing from upper-left DOWN to the right
  // (起笔轻、收笔重). Authored centered so it reads as one deliberate dot.
  "点": {
    strokes: [
      {
        d: "M 44 42 C 48 48 53 55 58 62",
        startDot: { x: 44, y: 42 },
        endDot: { x: 58, y: 62 },
      },
    ],
  },

  // 横折 héngzhé — ONE continuous stroke: horizontal RIGHT, then a turn (折) and
  // straight DOWN. The corner is the teaching point — it's one pen-down stroke,
  // not two. 起笔 at the left end, 收笔 at the bottom.
  "横折": {
    strokes: [
      {
        d: "M 26 26 L 74 26 L 74 80",
        startDot: { x: 26, y: 26 },
        endDot: { x: 74, y: 80 },
      },
    ],
  },

  // 弯钩 wāngōu — ONE stroke: a gentle vertical curve bowing right then back,
  // ending in a small HOOK that flicks up-LEFT (钩 at the foot). 起笔 top, 收笔 at
  // the hook tip.
  "弯钩": {
    strokes: [
      {
        d: "M 56 18 C 62 36 62 58 52 74 C 48 80 42 78 40 72",
        startDot: { x: 56, y: 18 },
        endDot: { x: 40, y: 72 },
      },
    ],
  },

  // ===========================================================================
  // 汉字 (CHARACTERS) — 统编版 G1 §1.1–1.5 write-list. Keyed by the single hanzi
  // char. 现代规范笔顺 (modern standard stroke order); each char centered in the
  // 田字格 and sized to breathe inside the cell.
  // ===========================================================================

  // 一 yī — one horizontal (先横). 1 stroke.
  "一": {
    strokes: [
      {
        d: "M 20 50 L 80 47",
        startDot: { x: 20, y: 50 },
        endDot: { x: 80, y: 47 },
      },
    ],
  },

  // 二 èr — two horizontals, TOP then BOTTOM (先上后下), the lower one a touch
  // wider. 2 strokes.
  "二": {
    strokes: [
      {
        d: "M 30 34 L 70 32",
        startDot: { x: 30, y: 34 },
        endDot: { x: 70, y: 32 },
      },
      {
        d: "M 22 68 L 78 66",
        startDot: { x: 22, y: 68 },
        endDot: { x: 78, y: 66 },
      },
    ],
  },

  // 三 sān — three horizontals TOP→BOTTOM (先上后下); the bottom one widest. 3
  // strokes.
  "三": {
    strokes: [
      {
        d: "M 32 28 L 68 26",
        startDot: { x: 32, y: 28 },
        endDot: { x: 68, y: 26 },
      },
      {
        d: "M 36 50 L 64 49",
        startDot: { x: 36, y: 50 },
        endDot: { x: 64, y: 49 },
      },
      {
        d: "M 22 74 L 78 72",
        startDot: { x: 22, y: 74 },
        endDot: { x: 78, y: 72 },
      },
    ],
  },

  // 四 sì — 5 strokes, 先外后内再封口: 1 竖(left side) · 2 横折(top + right side,
  // one stroke) · 3 撇(inner left-falling) · 4 竖弯/乚(inner, drops then turns
  // right along the bottom) · 5 横(closes the bottom). The interior 撇 sits left,
  // the 竖弯 right, then the floor seals it.
  "四": {
    strokes: [
      // 1 竖 — left wall, top→bottom.
      {
        d: "M 26 24 L 26 76",
        startDot: { x: 26, y: 24 },
        endDot: { x: 26, y: 76 },
      },
      // 2 横折 — top edge RIGHT then turn DOWN the right wall (one stroke).
      {
        d: "M 26 24 L 74 24 L 74 76",
        startDot: { x: 26, y: 24 },
        endDot: { x: 74, y: 76 },
      },
      // 3 撇 — inner left-falling, upper area, sweeping down-left.
      {
        d: "M 44 36 C 41 48 39 56 36 64",
        startDot: { x: 44, y: 36 },
        endDot: { x: 36, y: 64 },
      },
      // 4 竖弯(乚) — inner right element: drops then hooks right along the floor.
      {
        d: "M 60 36 L 60 60 C 60 66 64 66 68 64",
        startDot: { x: 60, y: 36 },
        endDot: { x: 68, y: 64 },
      },
      // 5 横 — the floor, sealing the box (封口) left→right.
      {
        d: "M 26 76 L 74 76",
        startDot: { x: 26, y: 76 },
        endDot: { x: 74, y: 76 },
      },
    ],
  },

  // 五 wǔ — 4 strokes: 1 横(top) · 2 竖(left vertical of the middle) · 3 横折
  // (the middle horizontal RIGHT then turn DOWN — one stroke) · 4 横(long
  // bottom). 先横后竖, then the 折, then seal the base.
  "五": {
    strokes: [
      // 1 横 — top bar.
      {
        d: "M 28 24 L 72 22",
        startDot: { x: 28, y: 24 },
        endDot: { x: 72, y: 22 },
      },
      // 2 竖 — the left vertical down toward the middle bar.
      {
        d: "M 42 24 L 36 56",
        startDot: { x: 42, y: 24 },
        endDot: { x: 36, y: 56 },
      },
      // 3 横折 — middle horizontal RIGHT then turn straight DOWN (one stroke).
      {
        d: "M 36 56 L 68 54 L 68 76",
        startDot: { x: 36, y: 56 },
        endDot: { x: 68, y: 76 },
      },
      // 4 横 — the long bottom bar sealing the base.
      {
        d: "M 24 78 L 78 76",
        startDot: { x: 24, y: 78 },
        endDot: { x: 78, y: 76 },
      },
    ],
  },

  // 上 shàng — 3 strokes: 1 竖(the tall middle vertical) · 2 横(short top
  // horizontal off the vertical) · 3 横(long bottom horizontal). The 竖 leads
  // (现代规范笔顺 — vertical first), then the two horizontals top→bottom.
  "上": {
    strokes: [
      // 1 竖 — the vertical stem.
      {
        d: "M 44 30 L 44 76",
        startDot: { x: 44, y: 30 },
        endDot: { x: 44, y: 76 },
      },
      // 2 横 — short top horizontal branching RIGHT off the stem.
      {
        d: "M 44 44 L 70 42",
        startDot: { x: 44, y: 44 },
        endDot: { x: 70, y: 42 },
      },
      // 3 横 — the long base horizontal.
      {
        d: "M 24 76 L 78 74",
        startDot: { x: 24, y: 76 },
        endDot: { x: 78, y: 74 },
      },
    ],
  },

  // 下 xià — 3 strokes: 1 横(long top horizontal) · 2 竖(vertical dropping from
  // the bar) · 3 点(a dot to the right of the vertical). 先横后竖, dot last.
  "下": {
    strokes: [
      // 1 横 — the long top bar.
      {
        d: "M 22 30 L 78 28",
        startDot: { x: 22, y: 30 },
        endDot: { x: 78, y: 28 },
      },
      // 2 竖 — vertical dropping from the middle of the bar.
      {
        d: "M 46 30 L 46 80",
        startDot: { x: 46, y: 30 },
        endDot: { x: 46, y: 80 },
      },
      // 3 点 — the dot to the right of the stem.
      {
        d: "M 58 46 C 61 51 64 56 67 62",
        startDot: { x: 58, y: 46 },
        endDot: { x: 67, y: 62 },
      },
    ],
  },

  // 日 rì — 4 strokes, 先外后内再封口: 1 竖(left wall) · 2 横折(top + right wall,
  // one stroke) · 3 横(middle horizontal) · 4 横(bottom horizontal, 封口). A tall
  // narrow box with one divider.
  "日": {
    strokes: [
      // 1 竖 — left wall.
      {
        d: "M 34 20 L 34 80",
        startDot: { x: 34, y: 20 },
        endDot: { x: 34, y: 80 },
      },
      // 2 横折 — top edge RIGHT then DOWN the right wall (one stroke).
      {
        d: "M 34 20 L 66 20 L 66 80",
        startDot: { x: 34, y: 20 },
        endDot: { x: 66, y: 80 },
      },
      // 3 横 — the middle divider.
      {
        d: "M 34 50 L 66 50",
        startDot: { x: 34, y: 50 },
        endDot: { x: 66, y: 50 },
      },
      // 4 横 — the floor, sealing the box.
      {
        d: "M 34 80 L 66 80",
        startDot: { x: 34, y: 80 },
        endDot: { x: 66, y: 80 },
      },
    ],
  },

  // 田 tián — 5 strokes, 先外后内再封口: 1 竖(left wall) · 2 横折(top + right wall,
  // one stroke) · 3 横(the inner cross's HORIZONTAL) · 4 竖(the inner cross's
  // VERTICAL) · 5 横(bottom, 封口). Inner 十 is 横 then 竖.
  "田": {
    strokes: [
      // 1 竖 — left wall.
      {
        d: "M 26 22 L 26 78",
        startDot: { x: 26, y: 22 },
        endDot: { x: 26, y: 78 },
      },
      // 2 横折 — top edge RIGHT then DOWN the right wall (one stroke).
      {
        d: "M 26 22 L 74 22 L 74 78",
        startDot: { x: 26, y: 22 },
        endDot: { x: 74, y: 78 },
      },
      // 3 横 — the inner cross's horizontal divider.
      {
        d: "M 26 50 L 74 50",
        startDot: { x: 26, y: 50 },
        endDot: { x: 74, y: 50 },
      },
      // 4 竖 — the inner cross's vertical divider.
      {
        d: "M 50 22 L 50 78",
        startDot: { x: 50, y: 22 },
        endDot: { x: 50, y: 78 },
      },
      // 5 横 — the floor, sealing the box.
      {
        d: "M 26 78 L 74 78",
        startDot: { x: 26, y: 78 },
        endDot: { x: 74, y: 78 },
      },
    ],
  },

  // 禾 hé — 5 strokes: 1 撇(the short top slash) · 2 横(the horizontal) · 3 竖
  // (the long central vertical) · 4 撇(left-falling under the bar) · 5 捺(right-
  // falling). 先撇后捺 for the bottom pair; the top 丿 leads (木 with a 丿 hat).
  "禾": {
    strokes: [
      // 1 撇 — the short top slash leaning left.
      {
        d: "M 56 16 C 50 22 44 26 38 30",
        startDot: { x: 56, y: 16 },
        endDot: { x: 38, y: 30 },
      },
      // 2 横 — the horizontal bar.
      {
        d: "M 24 40 L 76 38",
        startDot: { x: 24, y: 40 },
        endDot: { x: 76, y: 38 },
      },
      // 3 竖 — the long central vertical.
      {
        d: "M 50 28 L 50 84",
        startDot: { x: 50, y: 28 },
        endDot: { x: 50, y: 84 },
      },
      // 4 撇 — left-falling from the bar/stem crossing down-left.
      {
        d: "M 50 52 C 42 60 34 68 24 78",
        startDot: { x: 50, y: 52 },
        endDot: { x: 24, y: 78 },
      },
      // 5 捺 — right-falling, pressing out to a foot.
      {
        d: "M 50 52 C 58 60 66 68 76 78",
        startDot: { x: 50, y: 52 },
        endDot: { x: 76, y: 78 },
      },
    ],
  },

  // 火 huǒ — 4 strokes: 点、撇、撇、捺. 1 点(left dot) · 2 撇(the short right-side
  // slash) · 3 撇(the long central/left falling) · 4 捺(the long right falling).
  // The two top dots flank the stem, then 先撇后捺 for the big legs.
  "火": {
    strokes: [
      // 1 点 — the LEFT dot, tilting down-left.
      {
        d: "M 38 28 C 34 33 31 38 28 44",
        startDot: { x: 38, y: 28 },
        endDot: { x: 28, y: 44 },
      },
      // 2 撇 — the short RIGHT slash, leaning down-left toward the stem.
      {
        d: "M 66 26 C 62 33 58 40 53 48",
        startDot: { x: 66, y: 26 },
        endDot: { x: 53, y: 48 },
      },
      // 3 撇 — the long central-left falling stroke (the left leg).
      {
        d: "M 52 34 C 46 50 38 64 24 80",
        startDot: { x: 52, y: 34 },
        endDot: { x: 24, y: 80 },
      },
      // 4 捺 — the long right falling, pressing out to a foot (the right leg).
      {
        d: "M 48 46 C 56 56 66 68 78 80",
        startDot: { x: 48, y: 46 },
        endDot: { x: 78, y: 80 },
      },
    ],
  },

  // 云 yún — 4 strokes: 1 横(short top) · 2 横(longer second horizontal) · 3 撇折
  // (撇 down-left then turn 折 right — one stroke) · 4 点(the dot inside). 先上
  // 后下 for the two bars, then 撇折, dot last.
  "云": {
    strokes: [
      // 1 横 — short top bar.
      {
        d: "M 34 30 L 66 28",
        startDot: { x: 34, y: 30 },
        endDot: { x: 66, y: 28 },
      },
      // 2 横 — the longer second bar.
      {
        d: "M 24 48 L 76 46",
        startDot: { x: 24, y: 48 },
        endDot: { x: 76, y: 46 },
      },
      // 3 撇折 — slants DOWN-LEFT then turns (折) RIGHT along the base (one stroke).
      {
        d: "M 46 56 C 41 64 37 70 34 76 L 70 76",
        startDot: { x: 46, y: 56 },
        endDot: { x: 70, y: 76 },
      },
      // 4 点 — the dot tucked above the base turn.
      {
        d: "M 54 60 C 57 64 60 68 63 72",
        startDot: { x: 54, y: 60 },
        endDot: { x: 63, y: 72 },
      },
    ],
  },

  // 虫 chóng — 6 strokes: 1 竖(of the top 口) · 2 横折(top + right of the 口,
  // one stroke) · 3 横(closing the 口's bottom) · 4 竖(the long central vertical
  // through) · 5 横(the bottom horizontal) · 6 点(the dot at lower-right).
  // 先外后内 for the 口, then the stem, base bar, and dot.
  "虫": {
    strokes: [
      // 1 竖 — left wall of the top 口.
      {
        d: "M 38 22 L 38 50",
        startDot: { x: 38, y: 22 },
        endDot: { x: 38, y: 50 },
      },
      // 2 横折 — top of the 口 RIGHT then DOWN the right wall (one stroke).
      {
        d: "M 38 22 L 62 22 L 62 50",
        startDot: { x: 38, y: 22 },
        endDot: { x: 62, y: 50 },
      },
      // 3 横 — the bottom of the top 口.
      {
        d: "M 38 50 L 62 50",
        startDot: { x: 38, y: 50 },
        endDot: { x: 62, y: 50 },
      },
      // 4 竖 — the long central vertical running through the whole char.
      {
        d: "M 50 22 L 50 80",
        startDot: { x: 50, y: 22 },
        endDot: { x: 50, y: 80 },
      },
      // 5 横 — the bottom horizontal bar.
      {
        d: "M 26 72 L 70 70",
        startDot: { x: 26, y: 72 },
        endDot: { x: 70, y: 70 },
      },
      // 6 点 — the dot at the lower-right.
      {
        d: "M 64 62 C 68 67 72 72 76 78",
        startDot: { x: 64, y: 62 },
        endDot: { x: 76, y: 78 },
      },
    ],
  },

  // 山 shān — 3 strokes: 竖、竖折、竖. 1 竖(the tall MIDDLE peak, leads) · 2 竖折
  // (left peak: drop DOWN then turn RIGHT along the base — one stroke) · 3 竖(the
  // right peak). 先中间后两边 — the middle vertical first.
  "山": {
    strokes: [
      // 1 竖 — the tall central peak (tallest), drawn first.
      {
        d: "M 50 24 L 50 76",
        startDot: { x: 50, y: 24 },
        endDot: { x: 50, y: 76 },
      },
      // 2 竖折 — left side drops DOWN then turns (折) RIGHT along the base (one
      // stroke), sweeping under to the right wall.
      {
        d: "M 26 40 L 26 78 L 74 78",
        startDot: { x: 26, y: 40 },
        endDot: { x: 74, y: 78 },
      },
      // 3 竖 — the right peak, top→bottom into the base corner.
      {
        d: "M 74 36 L 74 78",
        startDot: { x: 74, y: 36 },
        endDot: { x: 74, y: 78 },
      },
    ],
  },
};

/**
 * Look up the ordered stroke data for a glyph char. Returns `undefined` for an
 * unknown char — the caller decides how to handle a missing glyph (the writer
 * renders nothing for an empty stroke list). Lesson-agnostic: the caller passes
 * whatever char its content needs.
 */
export const glyphStrokesFor = (char: string): GlyphStrokeData | undefined =>
  GLYPH_STROKES[char];
