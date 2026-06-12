// kptest-fenyuhe-six layout constants (pure TS, no React).
// All coordinates are in the 1280×720 composition space (matches the rest of
// the project: video.width × video.height). The visual-design.md coordinates
// are 1920×1080 — multiply by 2/3 to land in this space. Frame offsets are
// already in 30fps units and need no scaling.
//
// All frame offsets are RELATIVE to cue.startFrame (or cue.endFrame for
// end-aligned) — never a master-timeline literal.

import { video } from "../../theme";

// ---------------------------------------------------------------------------
// Canvas — fixed 1280×720 @ 30fps (project-wide).
// ---------------------------------------------------------------------------
export const CANVAS_WIDTH = video.width;
export const CANVAS_HEIGHT = video.height;

// ---------------------------------------------------------------------------
// Fixed positions and sizes (in 1280×720 pixels) — visual-design.md §0.5 zones.
// These are the disjoint rectangles the kid-eye skill demands. Z-order rules
// live in visual-design.md §1.
// ---------------------------------------------------------------------------
export const ZONE_TITLE = { x: 107, y: 120, width: 1067, height: 160 };
export const ZONE_LABELS = { x: 160, y: 80, width: 960, height: 187 };
export const ZONE_OBJECTS = { x: 80, y: 267, width: 1120, height: 253 };
export const ZONE_QUESTION = { x: 160, y: 293, width: 960, height: 160 };
export const ZONE_RECAP_ROW = { x: 80, y: 280, width: 1120, height: 253 };
export const ZONE_CAPTION = { x: 53, y: 627, width: 1173, height: 73 };

// ---------------------------------------------------------------------------
// Target sizes for legibility (in 1280×720 pixels, scaled from the
// visual-design 1920×1080 targets). The kids-eye minimums are honored — the
// 130px teaching unit becomes 86px (the visual-design minimum), the 180px
// bond glyph becomes 120px, the 120px title becomes 80px.
// ---------------------------------------------------------------------------
export const BOND_GLYPH_TARGET_SIZE = 120; // rendered height
export const TITLE_TARGET_SIZE = 80; // rendered height
export const TEACHING_UNIT_TARGET_SIZE = 86; // dot diameter (visual-design min ≥ 86 px)
export const BODY_LABEL_MIN_SIZE = 36; // for recall prompt (kept at minimum)
export const CAPTION_LINE_MIN_SIZE = 48; // caption ribbon

// ---------------------------------------------------------------------------
// Motion timing offsets (in frames) — visual-design.md §2 per-cue budgets.
// Convert seconds to frames at 30fps: frames = seconds * 30.
// These are the minimum times each phase needs to land for a 6-year-old.
// Offsets are from cue.startFrame unless noted.
// ---------------------------------------------------------------------------

// cue-announce-split-1of5
export const ANNOUNCE_TITLE_DURATION_FRAMES = 60; // 2.0s
export const ANNOUNCE_BOND_ONE_AND_FIVE_DURATION_FRAMES = 60; // 2.0s
export const ANNOUNCE_SPLIT_ONE_FIVE_DWELL_FRAMES = 75; // 2.5s

// cue-conserve-1of5
export const CONSERVE_ONE_FIVE_BOND_HE_DURATION_FRAMES = 45; // 1.5s
export const CONSERVE_ONE_FIVE_MERGE_DWELL_FRAMES = 90; // 3.0s

// cue-split-2of4
export const SPLIT_TWO_FOUR_BOND_TWO_AND_FOUR_DURATION_FRAMES = 54; // 1.8s
export const SPLIT_TWO_FOUR_DWELL_FRAMES = 81; // 2.7s

// cue-conserve-2of4
export const CONSERVE_TWO_FOUR_BOND_HE_DURATION_FRAMES = 45; // 1.5s
export const CONSERVE_TWO_FOUR_MERGE_DWELL_FRAMES = 90; // 3.0s

// cue-split-3of3
export const SPLIT_THREE_THREE_BOND_THREE_AND_THREE_DURATION_FRAMES = 60; // 2.0s
export const SPLIT_THREE_THREE_DWELL_FRAMES = 90; // 3.0s

// cue-conserve-3of3
export const CONSERVE_THREE_THREE_BOND_HE_DURATION_FRAMES = 45; // 1.5s
export const CONSERVE_THREE_THREE_MERGE_DWELL_FRAMES = 90; // 3.0s

// cue-learner-response-gap
export const LEARNER_RESPONSE_QUESTION_DISPLAY_FRAMES = 60; // 2.0s
// Held silent visual extends to fill the remaining cue window (≥3s per
// pedagogy §8 acquisition floor; cue 7's gap: {seconds:4, reason:...}).

// cue-reveal-answer
export const REVEAL_ANSWER_THREE_THREE_DISPLAY_FRAMES = 105; // 3.5s
// Includes the single transient sunshine highlight at midpoint (~52.5f).

// cue-spaced-recap-all-three
export const RECAP_BEAT_ONE_AND_FIVE_FRAMES = 60; // 2.0s
export const RECAP_BEAT_TWO_AND_FOUR_FRAMES = 60; // 2.0s
export const RECAP_BEAT_THREE_AND_THREE_FRAMES = 75; // 2.5s

// ---------------------------------------------------------------------------
// Motion-window offsets and durations for each cue's dot-layout transition.
// The motion window STARTS at cue.startFrame + MOTION_START_FRAMES (i.e. AFTER
// the bond-glyph phase) and lasts MOTION_DURATION_FRAMES. The bond-glyph phase
// is implicit (= the cue's BOND_*_DURATION_FRAMES, defined above). Everything
// is cue-relative — never a master-timeline literal.
// ---------------------------------------------------------------------------

export const SPLIT_MOTION_DURATION_FRAMES = 30; // EASE.inOutCubic
export const MERGE_MOTION_DURATION_FRAMES = 30; // EASE.inOutCubic
export const CLIMAX_SPLIT_MOTION_DURATION_FRAMES = 30; // EASE.outQuint (cue 5 only)
export const DOT_FADE_IN_FRAMES = 12; // dots fade in over this many frames

// Per-cue motion-window table (cue-relative start, duration):
//
//   cue-announce-split-1of5: start = 120f (title 60 + bond 60), dur = 30f
//   cue-conserve-1of5:       start = 45f,                       dur = 30f
//   cue-split-2of4:          start = 54f,                       dur = 30f
//   cue-conserve-2of4:       start = 45f,                       dur = 30f
//   cue-split-3of3:          start = 60f,                       dur = 30f (CLIMAX)
//   cue-conserve-3of3:       start = 45f,                       dur = 30f
//   cue-reveal-answer:       start = 0f,                        dur = 30f
//   cue-spaced-recap-all-three: driven per-sub-beat, no single window

// The 3|3 reveal-answer motion starts immediately (no bond phase in cue 8).
export const REVEAL_ANSWER_MOTION_START_FRAMES = 0;

// ---------------------------------------------------------------------------
// Recap (cue-spaced-recap-all-three) sub-beat constants.
// Recap sub-beats are 3 small clusters side by side in ZONE_RECAP_ROW. Each
// sub-beat shows the six dots in its X+Y grouping. Dot size is smaller than
// the main scene so all three sub-beats fit in 1/3 of the recap row each.
// ---------------------------------------------------------------------------

export const RECAP_DOT_SIZE = 42; // small recap dots
export const RECAP_DOT_GAP = 8;
export const RECAP_CLUSTER_GAP = 28;
// Recap sub-beat partitions: 0=1|5, 1=2|4, 2=3|3
export const RECAP_PARTITIONS: readonly [number, number, number] = [1, 2, 3];

// ---------------------------------------------------------------------------
// Sunshine transient ring geometry — used for the cue-reveal-answer "single
// transient sunshine highlight at midpoint" (visual-design §2) and for the
// recap's per-active-sub-beat ring (visual-design §4 "transient sunshine
// ring on the active bond slot").
// ---------------------------------------------------------------------------

export const RECAP_RING_RADIUS = 180;
export const REVEAL_ANSWER_RING_RADIUS = 280;

// ---------------------------------------------------------------------------
// Question-prompt ring (cue-learner-response-gap). A breathing PulseCircle
// draws the eye to the "your turn" affordance; a mic glyph sits next to the
// label per the learner-response-gap composition rule.
// ---------------------------------------------------------------------------

export const QUESTION_PROMPT_RING_RADIUS = 200;
export const QUESTION_PROMPT_MIC_SIZE = 50;

// ---------------------------------------------------------------------------
// Dot layout type and helpers — used by the main scene's six-dot identity-
// invariant group (cues 1–8) to compute per-frame x positions from the cue's
// current target layout + motion-progress.
// ---------------------------------------------------------------------------

export type DotLayout = "WHOLE" | "SPLIT_1_5" | "SPLIT_2_4" | "SPLIT_3_3";

// Number of dots in the left cluster for a given layout.
export const LEFT_COUNT_FOR: Record<DotLayout, number> = {
  WHOLE: 6,
  SPLIT_1_5: 1,
  SPLIT_2_4: 2,
  SPLIT_3_3: 3,
};

// Cluster gap for the main scene (the visible gap between left and right
// clusters when a split is held). Sized so a 1|5 split still reads cleanly
// (the single left dot is well to the left of the 5-dot cluster).
export const MAIN_CLUSTER_GAP = 56;

// Compute the 6 x-positions for a target layout, centered on the dot row's
// horizontal center (ZONE_OBJECTS center). Used by the identity-invariant
// group; positions are interpolated per frame between the previous layout
// and the new layout.
export function mainDotPositionsForLayout(layout: DotLayout): number[] {
  const cx = ZONE_OBJECTS.x + ZONE_OBJECTS.width / 2;
  const dotSize = TEACHING_UNIT_TARGET_SIZE;
  const dotGap = 22;

  if (layout === "WHOLE") {
    const totalWidth = 6 * dotSize + 5 * dotGap;
    const startX = cx - totalWidth / 2;
    return Array.from(
      { length: 6 },
      (_, i) => startX + i * (dotSize + dotGap) + dotSize / 2,
    );
  }

  const left = LEFT_COUNT_FOR[layout];
  const right = 6 - left;
  const leftWidth = left * dotSize + (left - 1) * dotGap;
  const rightWidth = right * dotSize + (right - 1) * dotGap;
  const totalWidth = leftWidth + MAIN_CLUSTER_GAP + rightWidth;
  const leftEdge = cx - totalWidth / 2;
  const positions: number[] = [];
  for (let i = 0; i < left; i += 1) {
    positions.push(leftEdge + i * (dotSize + dotGap) + dotSize / 2);
  }
  const rightEdge = leftEdge + leftWidth + MAIN_CLUSTER_GAP;
  for (let i = 0; i < right; i += 1) {
    positions.push(rightEdge + i * (dotSize + dotGap) + dotSize / 2);
  }
  return positions;
}

// Compute the 6 x-positions for a recap sub-beat, centered on the sub-beat's
// x position. The sub-beat shows the X+Y grouping: 1|5, 2|4, or 3|3.
export function recapSubBeatDotPositions(
  beatIndex: 0 | 1 | 2,
): { x: number; y: number }[] {
  const cx = getRecapBeatX(beatIndex);
  const cy = RECAP_BEAT_Y;
  const dotSize = RECAP_DOT_SIZE;
  const dotGap = RECAP_DOT_GAP;
  const clusterGap = RECAP_CLUSTER_GAP;
  const left = RECAP_PARTITIONS[beatIndex];
  const right = 6 - left;

  const leftWidth = left * dotSize + (left - 1) * dotGap;
  const rightWidth = right * dotSize + (right - 1) * dotGap;
  const totalWidth = leftWidth + clusterGap + rightWidth;
  const leftEdge = cx - totalWidth / 2;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < left; i += 1) {
    positions.push({
      x: leftEdge + i * (dotSize + dotGap) + dotSize / 2,
      y: cy,
    });
  }
  const rightEdge = leftEdge + leftWidth + clusterGap;
  for (let i = 0; i < right; i += 1) {
    positions.push({
      x: rightEdge + i * (dotSize + dotGap) + dotSize / 2,
      y: cy,
    });
  }
  return positions;
}

// ---------------------------------------------------------------------------
// Anchored positions (one per zone, no React). Computed once from the zone
// definitions; the scene + manifest import them.
// ---------------------------------------------------------------------------

// y-center for the main dot row (used by both scene and manifest).
export const DOT_Y = ZONE_OBJECTS.y + ZONE_OBJECTS.height / 2;

// Bond glyph position: centered in ZONE_LABELS.
export const BOND_GLYPH_X = ZONE_LABELS.x + ZONE_LABELS.width / 2;
export const BOND_GLYPH_Y = ZONE_LABELS.y + ZONE_LABELS.height / 2;

// Title position: centered in ZONE_TITLE.
export const TITLE_X = ZONE_TITLE.x + ZONE_TITLE.width / 2;
export const TITLE_Y = ZONE_TITLE.y + ZONE_TITLE.height / 2;

// Question prompt position: centered in ZONE_QUESTION.
export const QUESTION_PROMPT_X = ZONE_QUESTION.x + ZONE_QUESTION.width / 2;
export const QUESTION_PROMPT_Y = ZONE_QUESTION.y + ZONE_QUESTION.height / 2;

// Recap beat positions: each beat is centered in its third of ZONE_RECAP_ROW.
export function getRecapBeatX(beatIndex: 0 | 1 | 2): number {
  const zone = ZONE_RECAP_ROW;
  const beatWidth = zone.width / 3;
  return zone.x + beatIndex * beatWidth + beatWidth / 2;
}
export const RECAP_BEAT_Y = ZONE_RECAP_ROW.y + ZONE_RECAP_ROW.height / 2;
