// layout.ts — pure layout constants + interpolation helpers for
// kptest-compare-more-fewer. NO React, NO Remotion. The scene AND the manifest
// both import from here so a single source drives the picture and its bbox.
//
// COORDINATE SPACE. The composition is theme.video = 1280×720 (NOT the
// 1920×1080 the visual-design block assumed — see pipeline finding). Every
// number below is in that 1280×720 space. Zones, dot size, and separations are
// scaled proportionally from the visual-design intent so the contract still
// reads: dot ≥ 8% short-side, two rows separated, phrase above, > to the right,
// turn-cue below.
//
// ZERO FRAME LITERALS downstream: this file holds only RELATIVE offsets (frames
// after a cue's startFrame). The scene adds them to cues[id].startFrame; it
// never writes an absolute master-timeline frame.
//
// PURITY. This module imports NOTHING from the component barrels — pulling
// `../../shape-primitives` here would drag the whole React/Remotion tree into
// the pure-TS manifest-extract harness and trip Remotion's multi-version guard.
// The paired-column placement is therefore computed inline with the SAME
// left-aligned formula `getPairedColumnPlacement` uses (see
// CAPABILITIES.md#paired-column-layout); the SCENE still renders via the
// registered helper, this just mirrors its geometry for layout/manifest math.

export const FPS = 30;
export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// ---------------------------------------------------------------------------
// Shared interpolation helpers (the manifest uses these too, so bbox math and
// scene math can never drift).
// ---------------------------------------------------------------------------
export const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * clamp01(t);
/** Linear 0..1 progress of `frame` across [start, start+duration]. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
): number => clamp01(duration <= 0 ? 1 : (frame - start) / duration);

// ---------------------------------------------------------------------------
// The teaching object — ONE invariant 5-over-3 dot pairing for the whole spine.
// ---------------------------------------------------------------------------
export const DOT_DIAMETER = 92; // 12.8% of the 720 short side; clears the 8% (58px) floor.
export const TOP_COUNT = 5;
export const BOTTOM_COUNT = 3;
export const COLUMN_GAP = 130; // adjacent column centers
export const ROW_GAP = 176; // vertical gap between the two rows (reads as TWO groups)

// Block center. The 5-wide row spans 4·130 = 520 (±260), so it sits left of
// canvas-center to leave the right margin for the > symbol + a balanced frame.
export const OBJECTS_CX = 560;
export const OBJECTS_CY = 384;

// Matched placement, computed inline with getPairedColumnPlacement's formula:
// both rows LEFT-aligned to column 0 (so every overhanging item lands in a
// partnerless column), the whole block centered about local x=0; top row at
// -ROW_GAP/2, bottom at +ROW_GAP/2.
const COLUMNS = Math.max(TOP_COUNT, BOTTOM_COUNT);
/** Column-center x (local, about 0), left→right. */
const columnLocalX = (c: number): number =>
  (c - (COLUMNS - 1) / 2) * COLUMN_GAP;
const TOP_LOCAL_Y = -ROW_GAP / 2;
const BOTTOM_LOCAL_Y = ROW_GAP / 2;

// not-by-size spreads the bottom row WIDER (row looks longer) — a visual lie.
// The spread fans about the MATCHED-bottom center (cols 0-2) so the 3 blue dots
// widen IN PLACE. SPREAD_GAP is capped so the rightmost fanned dot stays clear
// of the surplus columns (col3 ghost left-edge ≈ 644): 430 + 165 + 46 = 641 <
// 644. This keeps the surplus ghosts on the normal bottom-row line, in their
// own columns, never under a fanned dot and never down in the caption band.
export const SPREAD_GAP = 165; // matched 3-dot span 260 → spread span 330 (clearly longer, clears the surplus columns)
export const SPREAD_CENTER_X =
  (OBJECTS_CX + columnLocalX(0) + OBJECTS_CX + columnLocalX(BOTTOM_COUNT - 1)) /
  2; // center of the matched bottom 3 (cols 0..2)

/** Absolute (canvas) center of a top-row dot at column c, in [0..TOP_COUNT). */
export const topDot = (c: number): { x: number; y: number } => ({
  x: OBJECTS_CX + columnLocalX(c),
  y: OBJECTS_CY + TOP_LOCAL_Y,
});
/** Absolute center of a bottom-row dot at column c, in the MATCHED layout. */
export const bottomDot = (c: number): { x: number; y: number } => ({
  x: OBJECTS_CX + columnLocalX(c),
  y: OBJECTS_CY + BOTTOM_LOCAL_Y,
});
/** Bottom-row dot x at column c when SPREAD wide (not-by-size), fanned about
 *  the matched-bottom center so it widens in place. */
export const bottomDotSpreadX = (c: number): number =>
  SPREAD_CENTER_X + (c - (BOTTOM_COUNT - 1) / 2) * SPREAD_GAP;

// The surplus columns live only on the top row — the partnerless pair
// (columns [min(top,bottom) .. max-1], i.e. [3, 4] for 5-over-3).
export const OVERHANG_COLUMNS = Array.from(
  { length: COLUMNS - Math.min(TOP_COUNT, BOTTOM_COUNT) },
  (_, i) => Math.min(TOP_COUNT, BOTTOM_COUNT) + i,
);
// Center of the surplus pair (for the pulse ring + recap ring).
export const surplusCenter = (): { x: number; y: number } => {
  const xs = OVERHANG_COLUMNS.map((c) => topDot(c).x);
  return {
    x: xs.reduce((a, b) => a + b, 0) / xs.length,
    y: topDot(OVERHANG_COLUMNS[0]).y,
  };
};
// Center of the short (bottom) row — the 少 focus.
export const shortRowCenter = (): { x: number; y: number } => ({
  x: (bottomDot(0).x + bottomDot(BOTTOM_COUNT - 1).x) / 2,
  y: bottomDot(0).y,
});

// ---------------------------------------------------------------------------
// Zones (canvas coords). Disjoint while co-present.
// ---------------------------------------------------------------------------
// zone-phrase — the spoken 比-utterance row, ABOVE the objects.
export const PHRASE_CX = 560;
export const PHRASE_CY = 150;
export const PHRASE_ITEM_GAP = 96; // 4 hanzi → span 3·96 = 288
export const PHRASE_ITEM_RADIUS = 40;
export const PHRASE_FONT = 64; // > 48px primary-label min

// zone-symbol — the > glyph, RIGHT of the rows, off the dots.
export const SYMBOL_CX = 930;
export const SYMBOL_CY = OBJECTS_CY;
export const SYMBOL_SIZE = 132; // > 90px tall min

// zone-amount — transient "5"/"3" tags beside each row (two-groups only).
export const AMOUNT_X = OBJECTS_CX + 360; // right of the matched rows
export const AMOUNT_TOP_Y = topDot(0).y;
export const AMOUNT_BOTTOM_Y = bottomDot(0).y;
export const AMOUNT_CARD_W = 76;
export const AMOUNT_CARD_H = 92;

// zone-turn — the "your turn" affordance, BELOW the objects (echo cues).
export const TURN_CX = 560;
export const TURN_CY = 600;

// Intro card — centered on the canvas (dots absent in intro).
export const INTRO_CX = CANVAS_W / 2;
export const INTRO_CY = CANVAS_H / 2;
export const INTRO_TITLE_SIZE = 92;

// ---------------------------------------------------------------------------
// Per-cue RELATIVE frame offsets (frames after cues[id].startFrame). Every
// scene frame = cues[id].startFrame + one of these; clamp against endFrame.
// ---------------------------------------------------------------------------

// intro: title reads ALONE first (announce-topic.requires). No cast here.
export const INTRO_TITLE_IN_DUR = 22; // progress ramp of the card

// two-groups: 5 top dots then 3 bottom dots PopIn row-by-row, then amount tags.
export const TWO_TOP_START = 6; // first top dot enters
export const TWO_DOT_STAGGER = 5; // per-dot stagger within a row
export const TWO_BOTTOM_START = 40; // bottom row begins after the top row reads
export const TWO_AMOUNT_START = 96; // "5"/"3" tags fade after both rows are in
export const TWO_AMOUNT_DUR = 16;

// match: 3 pair lines grow top→bottom (staggered), then 2 ghosts; HOLD surplus.
export const MATCH_LINE_START = 8;
export const MATCH_LINE_STAGGER = 18;
export const MATCH_LINE_DUR = 26;
export const MATCH_GHOST_START = 86; // after all 3 lines land
export const MATCH_GHOST_DUR = 20;

// more-direction / more-replay: > reveal + surplus pulse + read-along sweep.
export const SYMBOL_IN_START = 8;
export const SYMBOL_IN_DUR = 16;
export const SURPLUS_PULSE_START = 10; // pulse fires near narration onset
export const SURPLUS_PULSE_DUR = 34; // one pulse-ring envelope (more model + replay)
export const READALONG_START = 4; // phrase sweep onset (≤0.5s, synced to target lead)
export const READALONG_PER_BEAT = 15; // frames per phrase token-beat

// echo-more / echo-fewer: turn-cue held through the 120-frame learner-response gap.
export const TURN_IN_START = 4;
export const TURN_IN_DUR = 14;

// fewer-direction / fewer-replay: focus slides surplus→short row; > re-reads 少.
export const FOCUS_SLIDE_START = 30; // keystone: framing sits between the two says
export const FOCUS_SLIDE_DUR = 40;
export const FOCUS_PULSE_DUR = 40; // focus-pulse ring envelope (slides surplus→short row)

// not-by-size: bottom row spreads wide, then re-pairs; still 2 leftover.
export const SPREAD_START = 8;
export const SPREAD_DUR = 34;
export const REPAIR_LINE_START = 52; // re-pair after the spread reads
export const REPAIR_LINE_STAGGER = 14;
export const REPAIR_LINE_DUR = 22;
export const REPAIR_GHOST_START = 110;
export const REPAIR_GHOST_DUR = 18;

// recap: ONE live highlight walks surplus→五比三多, then short row→三比五少.
export const RECAP_BEAT_1_START = 10; // surplus + first phrase lights
export const RECAP_BEAT_2_START = 110; // short row + second phrase lights
export const RECAP_RING_DUR = 80; // each ring's draw-in/clear envelope

// SFX offsets (composer-owned frames) — fired at the motion they accompany.
export const SFX_TWO_GROUPS_POP = TWO_TOP_START; // first dot pop
export const SFX_MATCH_CHIME = MATCH_GHOST_START; // surplus revealed
export const SFX_NOT_BY_SIZE_CHIME = REPAIR_GHOST_START; // surplus survives the spread

// ---------------------------------------------------------------------------
// Phrase tokens — the on-screen acquisition strings. MUST be a subset of the
// cue's own spoken phrase (script-cues.json), in spoken order. Each is the
// 4-hanzi 比-utterance the cue voices.
// ---------------------------------------------------------------------------
export const MORE_PHRASE = ["五", "比", "三", "多"] as const; // 五比三多
export const FEWER_PHRASE = ["三", "比", "五", "少"] as const; // 三比五少
