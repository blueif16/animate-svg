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
};

/**
 * Look up the ordered stroke data for a glyph char. Returns `undefined` for an
 * unknown char — the caller decides how to handle a missing glyph (the writer
 * renders nothing for an empty stroke list). Lesson-agnostic: the caller passes
 * whatever char its content needs.
 */
export const glyphStrokesFor = (char: string): GlyphStrokeData | undefined =>
  GLYPH_STROKES[char];
