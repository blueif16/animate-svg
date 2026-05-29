// fen-yu-he — layout + motion constants (Wave 4 composer).
//
// PURE TS. No React, no Remotion imports. This module is the SINGLE SOURCE
// of every position, size, motion offset, and interpolation helper the scene
// uses. The scene (FenYuHeLessonScene.tsx) imports from here; the manifest
// (manifest.ts) imports from here. Same constants in, same bbox out — that is
// what lets `npm run lesson:check` catch scene/manifest drift.
//
// COORDINATE SPACE: the 1280x720 composition viewBox (top-left origin), the
// same space as visual-design.md §1.5 zones. All offsets in this file are
// CUE-RELATIVE FRAME OFFSETS (frames after a cue's startFrame) or
// END-RELATIVE (frames before a cue's endFrame) — never master-timeline
// absolutes. The scene resolves them against fenYuHeCues[id].startFrame /
// endFrame at render time.

// Import the anchor helper from the counting MODULE directly (not the
// shape-primitives barrel). The barrel re-exports sketch.tsx / literacy.tsx,
// which import "remotion"; pulling those in would make this PURE TS module
// (consumed by the pure manifest, loaded outside a Remotion bundle) drag in
// Remotion and trip the multi-version guard. counting.tsx itself imports only
// ../theme + ./shared (both Remotion-free), so this path stays pure.
import { getFenHeDiagramAnchors } from "../../shape-primitives/counting";

// ---------------------------------------------------------------------------
// Generic helpers (pure)
// ---------------------------------------------------------------------------

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Linear progress over [from, to], clamped to [0, 1]. */
export const progress = (frame: number, from: number, to: number): number => {
  if (to <= from) {
    return frame >= to ? 1 : 0;
  }
  return clamp01((frame - from) / (to - from));
};

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

export const CANVAS = { width: 1280, height: 720 } as const;

// ---------------------------------------------------------------------------
// Zones (visual-design.md §1.5) — kept here so the manifest can publish them.
// ---------------------------------------------------------------------------

export const ZONES = {
  title: [0, 40, 1280, 200],
  stage: [240, 250, 800, 320],
  diagram: [440, 120, 400, 300],
  // Column compressed (caption-clearance fix): row0 top ≈126, row3 bottom ≈528.
  column: [820, 120, 420, 415],
  divider: [632, 250, 16, 320],
  // Caption ribbon — WORST CASE (2-line). The kit CaptionLayer is bottom-
  // anchored (container padding bottom 46 -> ribbon bottom y=674) and GROWS
  // upward for 2-line lines. Geometry: fontSize 34 * lineHeight 1.25 = 42.5/line
  // -> 2 lines = 85; + ribbon padding (16 top + 18 bottom) + border (4*2) = 127
  // -> ribbon top = 674 - 127 = 547. We register the full worst-case band so
  // the QC caption check flags ANY load-bearing element sitting under a 2-line
  // ribbon. Kept full-width (the ribbon is centred but its extent varies); the
  // load-bearing y extent is what matters. Top padded down to 545 for margin.
  caption: [0, 545, 1280, 175],
} as const;

// ---------------------------------------------------------------------------
// Intro title (zone-title) — composed from two LabelCallout instances.
// ---------------------------------------------------------------------------

export const TITLE = {
  cx: 640,
  titleY: 132,
  titleFontSize: 72, // >= primary-label-min 48
  teaserY: 210,
  teaserFontSize: 40, // >= body-label-min 36
  // approx text box used by the manifest (the LabelCallout text is centered)
  titleHalfWidth: 300,
  titleHalfHeight: 48,
  teaserHalfWidth: 360,
  teaserHalfHeight: 30,
  // cue-relative motion
  appearStart: 8,
  appearDuration: 22,
  fadeOutBeforeEnd: 16, // begin clearing this many frames before cue end
  fadeOutDuration: 12,
} as const;

// ---------------------------------------------------------------------------
// Candy stage (zone-stage). The SAME five CountableObject instances live the
// whole video; only their x/y/state change per cue. Two stage modes:
//   centered  — five-whole, split-into-two, recombine-inverse, read-fen-he-shi
//   left      — first-ordered-split, slide-one-at-a-time, ordered-column-*,
//               order-matters (candies hold the left two-thirds; the results
//               column holds the right third).
// ---------------------------------------------------------------------------

export const CANDY = {
  count: 5,
  // Centered-stage size (five-whole / split / recombine / read): the candies
  // are the sole focal object, so they run large (teaching-unit-target).
  size: 96, // 13% of 720 short-side — teaching-unit-target
  // Left-stage size (ordered cues): four candies must pack STRICTLY left of the
  // divider with a >=20px gap, so they shrink. 76 keeps each well above the
  // ~72px floor while letting 4 fit left of dividerX with the gap (see
  // leftStagePositions). Pitch 84 leaves an 8px gap between adjacent candies.
  leftSize: 76,
  leftPitch: 84,
  variant: "fruit" as const,
  color: "reward" as const,
  baselineY: 410, // centered-stage candy-centre y
  readDropY: 500, // read-fen-he-shi: candies drop + dim under the diagram
} as const;

// Centred-stage x positions (origin = composition x).
export const CENTER_STAGE = {
  dividerX: 640,
  // five intact, even row centred on 640 (gap 86)
  heapX: [468, 554, 640, 726, 812] as const,
  // demonstrated split = 1 | 4 (left 1, right 4). Candy index 0 is the left
  // part; indices 1..4 are the right part. Same instances, only x changes.
  splitX: [486, 712, 786, 860, 934] as const,
} as const;

// Left-stage geometry (candies hold left two-thirds, divider in left third).
export const LEFT_STAGE = {
  dividerX: 470,
  baselineY: 420,
  // Minimum clear gap between a candy's edge and the divider line.
  dividerGap: 20,
} as const;

// Slide-one-at-a-time: which candy index crosses on each of the 4 read-beats
// and the ordered split sequence. Slide N transitions state[N] -> state[N+1].
export const SLIDE_SEQUENCE = ["1-4", "2-3", "3-2", "4-1"] as const;
export type SlideStateKey = (typeof SLIDE_SEQUENCE)[number];

/** Left / right counts for a slide-state key like "2-3". */
export const splitCounts = (key: SlideStateKey): [number, number] => {
  const [l, r] = key.split("-").map((n) => Number(n));
  return [l, r];
};

/**
 * Computed left-stage x for all 5 candy instances given the left count L (1..4).
 *
 * INVARIANT BY CONSTRUCTION: the L left candies sit STRICTLY left of the
 * divider with a >= dividerGap clear gap (packed leftward from the line at
 * leftPitch); the (5-L) right candies sit STRICTLY right with the same gap
 * (packed rightward). The candy that crosses on a given slide is just the
 * boundary instance changing side — same 5 instances, only x changes, so the
 * manifest bbox (which calls this) cannot drift from the scene.
 *
 * Candy index 0..L-1 = left part (index 0 = innermost-left, nearest the line);
 * index L..4 = right part (index L = innermost-right). This keeps the ordering
 * stable across L so exactly ONE instance changes side per +1 step.
 */
export const leftStagePositions = (leftCount: number): number[] => {
  const L = Math.max(0, Math.min(CANDY.count, Math.round(leftCount)));
  const half = CANDY.leftSize / 2;
  // Inner edge x of the first candy on each side (one half + gap off the line).
  const leftInner = LEFT_STAGE.dividerX - LEFT_STAGE.dividerGap - half;
  const rightInner = LEFT_STAGE.dividerX + LEFT_STAGE.dividerGap + half;
  const out: number[] = Array.from({ length: CANDY.count }, () => 0);
  // Left part: index 0 nearest the line, then march left at leftPitch.
  for (let i = 0; i < L; i += 1) {
    out[i] = leftInner - i * CANDY.leftPitch;
  }
  // Right part: index L nearest the line, then march right at leftPitch.
  for (let i = L; i < CANDY.count; i += 1) {
    out[i] = rightInner + (i - L) * CANDY.leftPitch;
  }
  return out;
};

/** Left-stage x array for a slide-state key like "2-3" (left count = first n). */
export const leftStageStateX = (key: SlideStateKey): number[] => {
  const [l] = splitCounts(key);
  return leftStagePositions(l);
};

// ---------------------------------------------------------------------------
// Large 分合式 diagram (zone-diagram) — read-fen-he-shi. renderNumbers=false,
// the three NumberCards are placed externally by the scene so they can MIGRATE
// down into the column at first-ordered-split (identity-preserved glyphs).
// ---------------------------------------------------------------------------

export const BIG_DIAGRAM = {
  cx: 640,
  cy: 262,
  width: 240,
  whole: 5,
  parts: [1, 4] as [number, number],
} as const;

// ---------------------------------------------------------------------------
// Results column (zone-column) — four small 分合式 stacked in slide order.
// Row 0 is the migration target for the big-diagram glyphs.
// ---------------------------------------------------------------------------

/** Full vertical extent (top card top -> bottom card bottom) of a 分合式 of
 *  the given width and verticalReachRatio. Same sizing FenHeDiagram uses
 *  internally and the bbox helper uses, so pitch derived from this cannot drift
 *  from the render. height = verticalReach (width*ratio) + cardHeight
 *  (width*0.36*1.18). Ratio defaults to 0.65 (FenHeDiagram's default). */
export const fenHeDiagramHeight = (
  width: number,
  verticalReachRatio = 0.65,
): number => width * verticalReachRatio + width * 0.36 * 1.18;

// Compact column variant. SIZED TO CLEAR THE WORST-CASE 2-LINE CAPTION BAND
// (post-render-feedback fix). The bottom-anchored caption ribbon grows TALLER
// for 2-line captions; its worst-case top edge is y≈547 (see ZONES.caption).
// At the previous width 130 / ratio 0.40 / gap 16 the four-row stack spanned
// 476.9px (row3 bottom ≈ 598), so row 3 ("4|1") sat ~51px INSIDE the 2-line
// ribbon and got covered. We compress the stack so all four rows clear the
// band with margin while keeping single-digit glyphs legible:
//   width 125 -> card = 125*0.36 = 45px -> glyph ~25.2px AFTER padding.
//   verticalReachRatio 0.32 -> diagram height ~93.1px.
//   gap 10 -> rowPitch 103.1; 4 rows span 3*103.1 + 93.1 = 402.4px.
//   topY centres the stack with row0 top ≈ 126 and row3 BOTTOM ≈ 528.4 —
//   18.6px clear of the 2-line caption top (547). 1→4 column stays readable.
const COLUMN_WIDTH = 125;
const COLUMN_REACH_RATIO = 0.32;
const COLUMN_ROW_GAP = 10; // clear gap between adjacent diagrams

export const COLUMN = {
  cx: 1030,
  width: COLUMN_WIDTH,
  // Vertical-reach ratio for the compact column diagrams (TASK 2). Passed to
  // both FenHeDiagram and getFenHeDiagramAnchors so cards land on the same
  // anchors the scene draws AND the migrating glyphs target.
  reachRatio: COLUMN_REACH_RATIO,
  rowPitch: fenHeDiagramHeight(COLUMN_WIDTH, COLUMN_REACH_RATIO) + COLUMN_ROW_GAP,
  rowGap: COLUMN_ROW_GAP,
  // centre-y of row 0. Row0 top sits at ≈126 (just inside zone-column top 120);
  // topY = 126 + diaH/2 = 126 + 93.10/2 = 172.55. With pitch 103.10 the four
  // rows land at cy 172.6 / 275.6 / 378.8 / 481.8, so row3 BOTTOM ≈ 528.4 —
  // clear of the worst-case 2-line caption top (547). See ZONES.caption.
  topY: 172.55,
  // the four rows' part values, top -> bottom, in ordered-method order
  rows: [
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
  ] as ReadonlyArray<[number, number]>,
  whole: 5,
} as const;

/** Centre-y of column row `i` (0-based). */
export const columnRowY = (i: number): number => COLUMN.topY + i * COLUMN.rowPitch;

// ---------------------------------------------------------------------------
// Diagram numeral anchor helpers (scene-space). The diagram primitive returns
// anchors in LOCAL space; add the diagram's scene translation to get scene
// coords. Used for BOTH the migrating NumberCards and the read-direction
// sketch arrows (so the arrows land on the same glyphs the diagram draws).
// ---------------------------------------------------------------------------

export type ScenePoint = { x: number; y: number };

export const bigDiagramAnchors = () => {
  const a = getFenHeDiagramAnchors(BIG_DIAGRAM.width);
  return {
    whole: { x: BIG_DIAGRAM.cx + a.whole.x, y: BIG_DIAGRAM.cy + a.whole.y },
    leftPart: {
      x: BIG_DIAGRAM.cx + a.leftPart.x,
      y: BIG_DIAGRAM.cy + a.leftPart.y,
    },
    rightPart: {
      x: BIG_DIAGRAM.cx + a.rightPart.x,
      y: BIG_DIAGRAM.cy + a.rightPart.y,
    },
  };
};

/** Scene-space anchors of column row `i`. Uses the compact column reachRatio
 *  so the migrating glyphs (and read-direction sketch) land EXACTLY on the
 *  same anchors the column FenHeDiagram draws. */
export const columnRowAnchors = (i: number) => {
  const a = getFenHeDiagramAnchors(COLUMN.width, COLUMN.reachRatio);
  const cy = columnRowY(i);
  return {
    whole: { x: COLUMN.cx + a.whole.x, y: cy + a.whole.y },
    leftPart: { x: COLUMN.cx + a.leftPart.x, y: cy + a.leftPart.y },
    rightPart: { x: COLUMN.cx + a.rightPart.x, y: cy + a.rightPart.y },
  };
};

// NumberCard size used by FenHeDiagram internally is width*0.36, height*1.18.
export const bigCardSize = {
  width: BIG_DIAGRAM.width * 0.36,
  height: BIG_DIAGRAM.width * 0.36 * 1.18,
};
export const columnCardSize = {
  width: COLUMN.width * 0.36,
  height: COLUMN.width * 0.36 * 1.18,
};

/**
 * LINEAR envelope of the migrating WHOLE glyph card (`glyph-whole`) at `frame`,
 * mirroring the scene's MigratingGlyphs whole card with RESTING scale (1.0).
 * Position lerps big-diagram whole anchor -> column row-0 whole anchor over the
 * migration window; size scales bigCardSize -> columnCardSize over the same
 * window. Uses LINEAR progress like every other helper here.
 *
 * NOTE (machine-gated-verification §1.1): the SCENE applies a bouncy overshoot
 * (scale up to 1.06 at the entrance peak) that this linear envelope does NOT
 * capture — that is precisely the divergence the --measured pass exists to
 * catch. The manifest registering this card at resting size is correct for the
 * fast path; the measured pass reports the true overshot bbox via getBBox.
 *
 * Mounted from read.startFrame (when the card lands) through the migration in
 * first-ordered-split (it hands off to the column diagram at slide.startFrame).
 */
export const wholeGlyphBboxAt = (
  frame: number,
  readStart: number,
  firstSplitStart: number,
  slideStart: number,
): Bbox | null => {
  if (frame < readStart || frame >= slideStart) {
    return null;
  }
  const big = bigDiagramAnchors().whole;
  const col0 = columnRowAnchors(0).whole;
  const migrateFrom = firstSplitStart + MOTION.firstSplit.migrateStart;
  const m = progress(frame, migrateFrom, migrateFrom + MOTION.firstSplit.migrateDuration);
  const sizeScale = lerp(1, COLUMN.width / BIG_DIAGRAM.width, m);
  const cx = lerp(big.x, col0.x, m);
  const cy = lerp(big.y, col0.y, m);
  const w = bigCardSize.width * sizeScale;
  const h = bigCardSize.height * sizeScale;
  return [cx - w / 2, cy - h / 2, w, h];
};

// ---------------------------------------------------------------------------
// Per-cue motion offsets (CUE-RELATIVE frames). Every offset is "frames after
// the cue's startFrame" unless named *BeforeEnd. Sized to fit inside each
// cue's reconciled window (all windows comfortably exceed these — see
// fenYuHeLessonTimeline reconcile). Curves are named EASE.* in the scene.
// ---------------------------------------------------------------------------

export const MOTION = {
  // five-whole: staggered pop-in of the 5 candies
  fiveWhole: { popStart: 6, popStagger: 4, popSpan: 16 },

  // split-into-two: divider draws on, then candies separate
  split: {
    dividerStart: 6,
    dividerDuration: 12,
    separateStart: 18,
    separateDuration: 26,
  },

  // recombine-inverse: candies slide back in, divider fades
  recombine: {
    mergeStart: 4,
    mergeDuration: 26,
    dividerFadeStart: 8,
    dividerFadeDuration: 16,
  },

  // read-fen-he-shi (ACCENT #1): candies drop+dim, whole card lands (bouncy),
  // diagonals draw on, part cards fade in.
  read: {
    candyDropStart: 2,
    candyDropDuration: 18,
    wholeLandStart: 10, // PopIn delay (bouncy)
    lineStart: 24,
    lineDuration: 26,
    partFadeStart: 30,
    partFadeDuration: 16,
  },

  // first-ordered-split: candies travel centre->left + settle to 1|4; the big
  // diagram's 3 glyphs migrate down into column row 0; column scaffold shows.
  firstSplit: {
    candyMoveStart: 6,
    candyMoveDuration: 30,
    migrateStart: 10,
    migrateDuration: 34,
  },

  // slide-one-at-a-time: 4 slides. Each slide window is derived from the cue
  // length at runtime (cueLen / 4); within each slide the candy crosses then
  // the next column row freezes in. These are FRACTIONS of one slide window.
  slide: {
    crossFrac: 0.62, // candy finishes crossing at 62% of the slide window
    rowFreezeStartFrac: 0.5, // the new column row starts fading in at 50%
    rowFreezeEndFrac: 0.95,
  },

  // ordered-column-complete: a navy emphasis travels down the 4 left-part
  // numbers; per-number dwell is cueLen/4 at runtime.
  columnComplete: { underlineDuration: 10 },

  // order-matters (ACCENT #2): top row lights, bottom row lights, others dim,
  // then the vs-mark draws. Fractions of the cue window.
  orderMatters: {
    dimStartFrac: 0.05,
    dimDuration: 12,
    topLightStartFrac: 0.12,
    bottomLightStartFrac: 0.42,
    lightDuration: 14,
  },
} as const;

// Sketch-overlay.md cue-relative schedule (frames after cue start).
export const SKETCH = {
  read: {
    // A 分合式 reads TWO ways. We show this with TWO spatially-distinct,
    // text-labelled arrows that never overlap each other or any numeral card:
    //   分成 — a DOWN arrow on the LEFT, just outside the left limb (whole "5"
    //          down to the left part "1"). Drawn first.
    //   组成 — an UP arrow on the RIGHT, just outside the right limb (right
    //          part "4" up to the whole "5"). Drawn second.
    // Both arrow shafts are parked OUTWARD of the three card bounding boxes by
    // `outwardX`, so no arrow crosses a glyph. Each arrow carries its own text
    // label (分成 / 组成) that fades in/out with it. All offsets cue-relative.
    arrow1Start: 30, // 分成 (down, left) draws first
    arrow2Start: 66, // 组成 (up, right) draws after
    drawDuration: 18,
    fadeBeforeEnd: 8,
    // Shaft horizontal offset OUTSIDE each limb's part card (added left of the
    // left part, right of the right part). 70 clears the ~43px card half-width
    // plus margin, so the shaft never crosses the card.
    outwardX: 70,
    // Vertical insets so the shaft runs from just below the whole down to just
    // above the part (arrowhead points INTO the target glyph region).
    topInsetY: 16, // below the whole card centre by this much (start, down arrow)
    bottomInsetY: 10, // above the part card centre by this much (end, down arrow)
    // Text labels beside each arrow (navy, >= 36px). The label is its OWN
    // component and must NOT overlap its arrow. The label-arrow primitive bows
    // OUTWARD (away from the diagram) by arc = min(40, len*0.22) ≈ 28.6px at
    // len 130, so a label that merely sits `labelGapX` outboard of the SHAFT
    // would collide with the bow (arc 28.6 > old gap 34 minus label halfWidth).
    // We push the label centre fully clear of the outermost bow point:
    //   labelGapX >= arc + clearGap + labelHalfWidth
    //              = 28.6 + 18 + 24 ≈ 71  -> use 74 for margin.
    labelFontSize: 38,
    labelGapX: 74, // label centre sits this far outboard of the arrow shaft,
    // clearing the arrow's outward bow (≈28.6px) with an explicit gap.
    // Outermost bow distance from the shaft (must be < labelGapX - labelHalfW).
    labelArc: 40, // matches sketch.tsx label-arrow `arc = min(40, len*0.22)`
    labelClearGap: 18, // minimum clear gap between bow outer edge and label box
    labelText: { fen: "分成", zu: "组成" },
  },
  orderMatters: {
    drawStartFrac: 0.55,
    drawDuration: 14,
    fadeBeforeEnd: 8,
    settleMagnitude: 0.08,
    // vs-mark sits in the clear gap LEFT of the column (between the candy
    // stage right edge ~748 and the column's leftmost card edge ~960), on the
    // vertical mid-line between the two contrasted rows. NEVER on a numeral
    // card — the manifest collision check verifies this.
    vsX: 878,
    vsRowA: 0,
    vsRowB: 3,
    vsArmLength: 20, // arrowheadSize(14) + 6, per TeacherMark vs-mark geometry
  },
} as const;

// ---------------------------------------------------------------------------
// Read-direction arrow geometry (read-fen-he-shi). Two spatially-distinct,
// labelled arrows derived from the big-diagram anchors. Scene AND manifest
// both call this so the rendered arrows and their bboxes cannot drift.
//   分成 (down, LEFT): from near the whole down to near the left part, shaft
//                       parked `outwardX` LEFT of the left part card.
//   组成 (up, RIGHT):   from near the right part up to near the whole, shaft
//                       parked `outwardX` RIGHT of the right part card.
// ---------------------------------------------------------------------------
export type ReadArrowGeometry = {
  start: ScenePoint;
  end: ScenePoint;
  label: ScenePoint;
};

export const readArrowGeometry = (which: 1 | 2): ReadArrowGeometry => {
  const a = bigDiagramAnchors();
  const r = SKETCH.read;
  if (which === 1) {
    // 分成 — DOWN on the LEFT. Shaft at the left part's x, pushed outward-left.
    const shaftX = a.leftPart.x - r.outwardX;
    return {
      start: { x: shaftX, y: a.whole.y + r.topInsetY },
      end: { x: shaftX, y: a.leftPart.y - r.bottomInsetY },
      // label centred outboard (further left), on the arrow's vertical mid.
      label: {
        x: shaftX - r.labelGapX,
        y: (a.whole.y + a.leftPart.y) / 2,
      },
    };
  }
  // 组成 — UP on the RIGHT. Shaft at the right part's x, pushed outward-right.
  const shaftX = a.rightPart.x + r.outwardX;
  return {
    start: { x: shaftX, y: a.rightPart.y - r.bottomInsetY },
    end: { x: shaftX, y: a.whole.y + r.topInsetY },
    label: {
      x: shaftX + r.labelGapX,
      y: (a.whole.y + a.rightPart.y) / 2,
    },
  };
};

// Bbox of ONE read arrow (shaft + outward bow + arrowhead) — the arrow ALONE,
// NOT its text label. Registered as its own manifest element so the QC gate can
// see an arrow∩label overlap (they are different components). The arrow is a
// near-vertical label-arrow that bows OUTWARD by `labelArc`; we pad the shaft
// x outward by the bow and inward by the arrowhead/strokeWidth.
export const readArrowBbox = (which: 1 | 2): Bbox => {
  const g = readArrowGeometry(which);
  const r = SKETCH.read;
  const shaftX = g.start.x; // vertical shaft: start.x === end.x
  const stroke = 8; // label-arrow strokeWidth ~6 + round cap padding
  const head = 16; // arrowhead reach
  // Bow goes OUTWARD (away from the diagram): left for arrow 1, right for 2.
  const outward = which === 1 ? -1 : 1;
  const bowOuterX = shaftX + outward * r.labelArc;
  const xs = [shaftX - stroke, shaftX + stroke, bowOuterX];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(g.start.y, g.end.y) - head;
  const maxY = Math.max(g.start.y, g.end.y) + head;
  return [minX, minY, maxX - minX, maxY - minY];
};

// Bbox of ONE read label (the 分成 / 组成 text glyphs ALONE). Registered as its
// own manifest element in the "labels" zone so an arrow(marks)∩label(labels)
// overlap is flagged — an arrow and its label are DIFFERENT components and must
// never overlap.
export const readLabelBbox = (which: 1 | 2): Bbox => {
  const g = readArrowGeometry(which);
  const fontSize = SKETCH.read.labelFontSize;
  const text = which === 1 ? SKETCH.read.labelText.fen : SKETCH.read.labelText.zu;
  const halfW = (text.length * fontSize * 0.62) / 2;
  const halfH = fontSize * 0.62;
  return [g.label.x - halfW, g.label.y - halfH, halfW * 2, halfH * 2];
};

// Tail breathing room a cue keeps clear of motion (matches reconcile TAIL).
export const CUE_TAIL_FRAMES = 9;

// ---------------------------------------------------------------------------
// Pure bbox helpers (manifest + scene share these so they cannot drift).
// All return composition-pixel bboxes [x, y, w, h] or null. They use LINEAR
// progress (no easing). This is a FAST PRE-FILTER, not ground truth: where the
// scene's easing OVERSHOOTS its endpoint (PopIn motion="bouncy" peaks ~4.6% over;
// the migrating whole-card peaks at scale 1.06) the linear bbox UNDER-estimates
// the real rendered box by a few px per edge — measured +5.18px W × +6.11px H on
// glyph-whole @frame 450 (docs/proposals/machine-gated-verification.md §1.3). The
// opt-in `npm run lesson:check -- --measured` pass renders motion-peak frames and
// reads each element's TRUE getBBox() to catch the overshoot/between-keyframe
// overlaps this envelope misses. Bbox here is for cross-zone collision detection,
// not pixel-exact rendering.
// ---------------------------------------------------------------------------

export type Bbox = readonly [number, number, number, number];

const CANDY_R = CANDY.size / 2; // visual half-extent of one candy

/** Bbox of the whole live candy group at `frame`. null before they appear. */
export const candyGroupBboxAt = (
  frame: number,
  startFrame: number, // five-whole start
  positionsAt: (frame: number) => Array<{ x: number; y: number; on: boolean }>,
): Bbox | null => {
  if (frame < startFrame) {
    return null;
  }
  const ps = positionsAt(frame).filter((p) => p.on);
  if (ps.length === 0) {
    return null;
  }
  const minX = Math.min(...ps.map((p) => p.x)) - CANDY_R;
  const maxX = Math.max(...ps.map((p) => p.x)) + CANDY_R;
  const minY = Math.min(...ps.map((p) => p.y)) - CANDY_R;
  const maxY = Math.max(...ps.map((p) => p.y)) + CANDY_R;
  return [minX, minY, maxX - minX, maxY - minY];
};

/** Bbox of a 分合式 diagram (lines + 3 cards) centred at (cx, cy), given its
 *  diagramWidth and verticalReachRatio. Mirrors FenHeDiagram's internal sizing.
 *  Ratio defaults to 0.65 (FenHeDiagram's default) so the big-diagram caller is
 *  unchanged; the compact column passes COLUMN.reachRatio. */
export const fenHeDiagramBbox = (
  cx: number,
  cy: number,
  width: number,
  verticalReachRatio = 0.65,
): Bbox => {
  const verticalReach = width * verticalReachRatio;
  const cardW = width * 0.36;
  const cardH = cardW * 1.18;
  const top = cy - verticalReach / 2 - cardH / 2;
  const bottom = cy + verticalReach / 2 + cardH / 2;
  const left = cx - width / 2;
  const right = cx + width / 2;
  return [left, top, right - left, bottom - top];
};

/** Bbox of the intro title block (both lines). */
export const titleBbox = (): Bbox => {
  const top = TITLE.titleY - TITLE.titleHalfHeight;
  const bottom = TITLE.teaserY + TITLE.teaserHalfHeight;
  const halfW = Math.max(TITLE.titleHalfWidth, TITLE.teaserHalfWidth);
  return [TITLE.cx - halfW, top, halfW * 2, bottom - top];
};

// Minimal cue window shape the pure helpers need (subset of AlignedLessonCue).
export type CueWindow = { startFrame: number; endFrame: number };

/**
 * Pure per-candy positions at `frame`, mirroring the scene's CandyStage
 * endpoints with LINEAR progress. Returns x/y and an `on` flag (opacity > ~0).
 * The manifest feeds this into candyGroupBboxAt. The scene renders the same
 * endpoints with EASE.* — monotone, same start/end, so the bbox envelope holds.
 */
export const candyPositionsAt = (
  frame: number,
  cues: Record<string, CueWindow>,
): Array<{ x: number; y: number; on: boolean }> => {
  const out: Array<{ x: number; y: number; on: boolean }> = Array.from(
    { length: CANDY.count },
    () => ({
      x: CENTER_STAGE.dividerX as number,
      y: CANDY.baselineY as number,
      on: false,
    }),
  );

  const fiveWhole = cues["five-whole"];
  const split = cues["split-into-two"];
  const recombine = cues["recombine-inverse"];
  const read = cues["read-fen-he-shi"];
  const firstSplit = cues["first-ordered-split"];
  const slide = cues["slide-one-at-a-time"];
  const columnComplete = cues["ordered-column-complete"];

  if (frame < fiveWhole.startFrame) {
    return out;
  }

  if (frame < split.startFrame) {
    for (let i = 0; i < CANDY.count; i += 1) {
      const start =
        fiveWhole.startFrame +
        MOTION.fiveWhole.popStart +
        i * MOTION.fiveWhole.popStagger;
      const p = progress(frame, start, start + MOTION.fiveWhole.popSpan);
      out[i] = { x: CENTER_STAGE.heapX[i], y: CANDY.baselineY, on: p > 0.05 };
    }
    return out;
  }

  if (frame < recombine.startFrame) {
    const from = split.startFrame + MOTION.split.separateStart;
    const p = progress(frame, from, from + MOTION.split.separateDuration);
    for (let i = 0; i < CANDY.count; i += 1) {
      out[i] = {
        x: lerp(CENTER_STAGE.heapX[i], CENTER_STAGE.splitX[i], p),
        y: CANDY.baselineY,
        on: true,
      };
    }
    return out;
  }

  if (frame < read.startFrame) {
    const from = recombine.startFrame + MOTION.recombine.mergeStart;
    const p = progress(frame, from, from + MOTION.recombine.mergeDuration);
    for (let i = 0; i < CANDY.count; i += 1) {
      out[i] = {
        x: lerp(CENTER_STAGE.splitX[i], CENTER_STAGE.heapX[i], p),
        y: CANDY.baselineY,
        on: true,
      };
    }
    return out;
  }

  if (frame < firstSplit.startFrame) {
    const from = read.startFrame + MOTION.read.candyDropStart;
    const p = progress(frame, from, from + MOTION.read.candyDropDuration);
    for (let i = 0; i < CANDY.count; i += 1) {
      out[i] = {
        x: CENTER_STAGE.heapX[i],
        y: lerp(CANDY.baselineY, CANDY.readDropY, p),
        on: lerp(1, 0.5, p) > 0.05,
      };
    }
    return out;
  }

  if (frame < slide.startFrame) {
    const from = firstSplit.startFrame + MOTION.firstSplit.candyMoveStart;
    const p = progress(frame, from, from + MOTION.firstSplit.candyMoveDuration);
    const target = leftStageStateX("1-4");
    for (let i = 0; i < CANDY.count; i += 1) {
      out[i] = {
        x: lerp(CENTER_STAGE.heapX[i], target[i], p),
        y: lerp(CANDY.readDropY, LEFT_STAGE.baselineY, p),
        on: true,
      };
    }
    return out;
  }

  if (frame < columnComplete.startFrame) {
    const cueLen = slide.endFrame - slide.startFrame;
    const usable = cueLen - CUE_TAIL_FRAMES;
    const slideWindow = usable / SLIDE_SEQUENCE.length;
    const local = frame - slide.startFrame;
    const idx = Math.min(
      SLIDE_SEQUENCE.length - 1,
      Math.floor(local / slideWindow),
    );
    const within = local - idx * slideWindow;
    const fromKey = SLIDE_SEQUENCE[idx];
    const toKey = SLIDE_SEQUENCE[Math.min(SLIDE_SEQUENCE.length - 1, idx + 1)];
    const crossTo = slideWindow * MOTION.slide.crossFrac;
    const p = progress(within, 0, crossTo);
    const fromX = leftStageStateX(fromKey);
    const toX = leftStageStateX(toKey);
    for (let i = 0; i < CANDY.count; i += 1) {
      out[i] = {
        x: lerp(fromX[i], toX[i], p),
        y: LEFT_STAGE.baselineY,
        on: true,
      };
    }
    return out;
  }

  // final hold (ordered-column-complete + order-matters)
  const finalX = leftStageStateX("4-1");
  for (let i = 0; i < CANDY.count; i += 1) {
    out[i] = { x: finalX[i], y: LEFT_STAGE.baselineY, on: true };
  }
  return out;
};
