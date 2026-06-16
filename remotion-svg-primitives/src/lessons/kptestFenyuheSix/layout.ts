// kptest-fenyuhe-six layout constants (pure TS, no React).
// v4 cue-anchored audio: the reconciled timeline exports 6 cues
// (routine-reprise / split-1-and-5 / split-2-and-4 / split-3-and-3 /
// aggregator-prompt / recap) — the 9 visual storyboard beats are folded
// into these 6 cue windows (the 3 echo beats live inside the previous
// split cue's typed `gap: { reason: "learner-response" }` silence).
//
// All coordinates are in the 1280×720 composition space (matches the rest
// of the project: video.width × video.height). Frame offsets are in 30fps
// units and are RELATIVE to cue.startFrame (or cue.endFrame for
// end-aligned) — NEVER a master-timeline literal.

import { fitUnitsToZone } from "../../layout";
import { video } from "../../theme";

// ---------------------------------------------------------------------------
// Canvas — fixed 1280×720 @ 30fps (project-wide).
// ---------------------------------------------------------------------------
export const CANVAS_WIDTH = video.width;
export const CANVAS_HEIGHT = video.height;

// ---------------------------------------------------------------------------
// Fixed positions and sizes (in 1280×720 pixels) — visual-design.md §0.5
// zones. These are the disjoint rectangles the kid-eye skill demands.
// Z-order rules live in visual-design.md §1.
//
// Disjointness:
//   - ZONE_TITLE    (y=120-280) — title card (cue-routine-reprise phase A)
//   - ZONE_LABELS   (y=80-267)  — bond glyph (per split cue) + prompt label
//                                  (cue-aggregator-prompt); prompt sits in
//                                  the lower half of ZONE_LABELS so it
//                                  doesn't overlap the bond glyph
//   - ZONE_OBJECTS  (y=267-520) — six identity-invariant dots
//   - ZONE_RECAP_ROW (y=280-533) — three recap sub-beats (slightly extends
//                                  into ZONE_OBJECTS' y-range; the recap
//                                  hides the main six dots so they don't
//                                  co-render)
//   - ZONE_CAPTION  (y=627-700) — bottom-anchored caption ribbon
// ---------------------------------------------------------------------------
export const ZONE_TITLE = { x: 107, y: 120, width: 1067, height: 160 };
export const ZONE_LABELS = { x: 160, y: 80, width: 960, height: 187 };
export const ZONE_OBJECTS = { x: 80, y: 267, width: 1120, height: 253 };
export const ZONE_PROMPT = { x: 160, y: 200, width: 960, height: 60 };
export const ZONE_RECAP_ROW = { x: 80, y: 280, width: 1120, height: 253 };
export const ZONE_CAPTION = { x: 53, y: 627, width: 1173, height: 73 };

// ---------------------------------------------------------------------------
// Target sizes for legibility (in 1280×720 pixels, scaled from the
// visual-design 1920×1080 targets). The kids-eye minimums are honored — the
// 180px bond glyph becomes 120px, the 120px title becomes 80px. The six
// teaching dots are NOT hand-sized here — they auto-size to ZONE_OBJECTS via
// `fitUnitsToZone` (helper defaults: 96px target / 86px floor / 43px gap).
// ---------------------------------------------------------------------------
export const BOND_GLYPH_TARGET_SIZE = 120;
export const TITLE_TARGET_SIZE = 80;
export const BODY_LABEL_MIN_SIZE = 36;
export const CAPTION_LINE_MIN_SIZE = 48;

// ---------------------------------------------------------------------------
// Motion timing offsets (in frames) — all RELATIVE to cue.startFrame.
// Convert seconds to frames at 30fps: frames = seconds * 30.
//
// v4 schedule per split cue (the model + echo fuse into one cue window):
//   0..BOND_APPEAR_END   bond glyph "一和五" / "二和四" / "三和三" appears
//                          (fade-in BOND_FADE_IN_FRAMES, then held)
//   BOND_APPEAR_END..SPLIT_END   split motion (default SPLIT_MOTION_DURATION_FRAMES,
//                                climax CLIMAX_SPLIT_MOTION_DURATION_FRAMES for 3|3)
//   SPLIT_END..REC_VOICE_END  held split (bond still visible during voice;
//                                then bond fades out and pointer fades in)
//   REC_VOICE_END..RECOMBINE_START  held silence + pointer affordance
//                                  (echo's "your turn" retrieval window)
//   RECOMBINE_START..RECOMBINE_END  recombine motion
// ---------------------------------------------------------------------------

// Common — all split cues share these.
export const BOND_FADE_IN_FRAMES = 12; // bond glyph fade-in (snap reads as a write-on)
export const BOND_APPEAR_DURATION_FRAMES = 30; // total: 12 fade-in + 18 hold-before-split
export const BOND_HOLD_AFTER_SPLIT_FRAMES = 18; // bond held briefly after split completes
export const BOND_FADE_OUT_FRAMES = 12; // bond fades out before pointer fades in

// Split motion: 30 frames at EASE.inOutCubic (default), or
// CLIMAX_SPLIT_MOTION_DURATION_FRAMES at EASE.outQuint (cue-split-3-and-3 only).
export const SPLIT_MOTION_DURATION_FRAMES = 30;
export const CLIMAX_SPLIT_MOTION_DURATION_FRAMES = 30;
export const RECOMBINE_MOTION_DURATION_FRAMES = 30;

// Per-cue split start — the bond-appear end (which is also the split-motion
// start). All split cues use the same BOND_APPEAR_DURATION_FRAMES so the
// split always begins 30f into the cue.
export const SPLIT_START_FRAMES = BOND_APPEAR_DURATION_FRAMES;

// Pointer fade-in (12f) and pointer hold (variable per cue length).
export const POINTER_FADE_IN_FRAMES = 12;
export const POINTER_FADE_OUT_FRAMES = 12;

// Underline (climax mark) — TeacherMark timing per sketch-overlay §3.
// Lands AFTER the 3|3 split has settled (motion ends at SPLIT_END), with
// 15 frames of post-climax dwell before the underline begins. Draws over
// 24 frames (climax gesture). Fades 9 frames before the recombine ends.
export const UNDERLINE_POST_CLIMAX_DWELL_FRAMES = 15;
export const UNDERLINE_DRAW_DURATION_FRAMES = 24;
export const UNDERLINE_FADE_OUT_FRAMES = 9;

// Recap (cue-recap) sub-beat allocation — total 309 frames. Voice-driven:
// the live highlight walks 1|5 → 2|4 → 3|3 across the cue.
//   0..RECAP_BEAT_ONE_AND_FIVE_FRAMES       — beat 0 active (1|5)
//   ...RECAP_BEAT_ONE_AND_FIVE_FRAMES..(+TWO_AND_FOUR)  — beat 1 active (2|4)
//   ...(+TWO_AND_FOUR)..309                 — beat 2 active (3|3)
export const RECAP_BEAT_ONE_AND_FIVE_FRAMES = 90;
export const RECAP_BEAT_TWO_AND_FOUR_FRAMES = 90;
export const RECAP_BEAT_THREE_AND_THREE_FRAMES = 129;
// 90 + 90 + 129 = 309 (matches the recap cue length 1675 - 1366 = 309).

// Ring envelope per sub-beat — fade-in / fade-out within each sub-beat.
export const RECAP_RING_FADE_IN_FRAMES = 9;
export const RECAP_RING_FADE_OUT_FRAMES = 12;

// routine-reprise (cue 1) — 180 frames total. Title alone + 6 dots enter
// as a row.
export const ROUTINE_REPRISE_TITLE_DURATION_FRAMES = 60; // 2.0s
export const ROUTINE_REPRISE_DOT_ENTER_FRAMES = 60; // 6 dots enter (12f one-by-one fade-in, 48f hold)
export const ROUTINE_REPRISE_DOT_HOLD_FRAMES = 60; // 2.0s (held row after enter)

// aggregator-prompt (cue 5) — 216 frames total. Held silent ≥4s (the
// `gap: { reason: "learner-response" }`).
export const AGGREGATOR_PROMPT_FADE_IN_FRAMES = 18; // prompt + ring + mic fade in
export const AGGREGATOR_PROMPT_HOLD_FRAMES = 0; // remainder of cue — derived from cue length

// ---------------------------------------------------------------------------
// Sunshine transient ring geometry — used for the cue-split-3-and-3 "single
// transient sunshine highlight" (visual-design §3 climax) and for the
// recap's per-active-sub-beat ring (visual-design §4 "transient sunshine
// ring on the active bond slot").
// ---------------------------------------------------------------------------

export const RECAP_RING_RADIUS = 180;
// The 3|3 climax — a single GlintFlash (4-point star) at the 3|3 cluster's
// center, fired when the climax split motion settles. Window:
//   start = SPLIT_START + CLIMAX_SPLIT_MOTION_DURATION_FRAMES (60)
//   duration = 18 frames.
export const CLIMAX_GLIN_DURATION_FRAMES = 18;

// ---------------------------------------------------------------------------
// Question-prompt composition (cue-aggregator-prompt).
//   - a localized prompt LABEL "6可以分成几和几？"
//   - a PulseCircle (eye-drawer) ring
//   - a mic glyph
// Three readable parts per the learner-response-gap rule; a bare low-
// opacity glow is FORBIDDEN.
// ---------------------------------------------------------------------------

export const QUESTION_PROMPT_RING_RADIUS = 200;
export const QUESTION_PROMPT_MIC_SIZE = 50;
export const QUESTION_PROMPT_RING_CYCLE_FRAMES = 60; // 2 pulses per cycle

// ---------------------------------------------------------------------------
// Dot layout type and helpers — used by the main scene's six-dot identity-
// invariant group (cues 1–5) to compute per-frame x positions from the
// cue's current target layout + motion-progress. The six dots are the same
// React instances throughout; only the layout (row ↔ split) interpolates.
// ---------------------------------------------------------------------------

export type DotLayout = "WHOLE" | "SPLIT_1_5" | "SPLIT_2_4" | "SPLIT_3_3";

// Number of dots in the left cluster for a given layout.
export const LEFT_COUNT_FOR: Record<DotLayout, number> = {
  WHOLE: 6,
  SPLIT_1_5: 1,
  SPLIT_2_4: 2,
  SPLIT_3_3: 3,
};

// Cluster gap for the main scene — sized so a 1|5 split still reads cleanly.
export const MAIN_CLUSTER_GAP = 56;

// In-row gap between adjacent dots WITHIN a split cluster (left/right group of
// a 1|5, 2|4, 3|3 split). The WHOLE (single-row) layout no longer uses this —
// it auto-sizes to ZONE_OBJECTS via `fitUnitsToZone` defaults (43px gap). This
// tight 22px gap keeps each split cluster compact so the two groups read as
// distinct.
export const MAIN_DOT_GAP = 22;

// ---------------------------------------------------------------------------
// SINGLE SOURCE OF TRUTH for the six teaching dots' size + WHOLE-row centers
// (docs/proposals/auto-size-to-zone.md §Design.1, rollout phase 3). Both the
// scene AND the bbox manifest read `dotSize` / `dotCenters` from this one call,
// so on-canvas sizes and collision boxes agree BY CONSTRUCTION.
//
// Phase 3: NO per-lesson size constants. The dots auto-size to ZONE_OBJECTS via
// the helper's DEFAULTS (96px target unit / 86px kids-eye floor / 43px
// separation gap, from theme.sizing). At count=6 the zone is wide enough that
// the unit hits the 96px target: 6×96 + 5×43 = 791px wide, centered on
// ZONE_OBJECTS (cy === DOT_Y).
// ---------------------------------------------------------------------------
const DOTS_FIT = fitUnitsToZone(ZONE_OBJECTS, 6);

// Resolved dot size (px == canvas units) — replaces the hand-picked dotSize.
export const dotSize = DOTS_FIT.unit;
// CENTERS of the six dots in the WHOLE (single-row) layout, in canvas coords.
export const dotCenters = DOTS_FIT.positions;

// Compute the 6 x-positions for a target layout, centered on the dot row's
// horizontal center (ZONE_OBJECTS center). Used by the identity-invariant
// group; positions are interpolated per frame between the previous layout
// and the new layout. The WHOLE row returns the helper-derived `dotCenters`
// directly (96px unit / 43px gap); the split clusters lay out from the same
// `dotSize` at the tight in-cluster `MAIN_DOT_GAP`.
export function mainDotPositionsForLayout(layout: DotLayout): number[] {
  const cx = ZONE_OBJECTS.x + ZONE_OBJECTS.width / 2;

  if (layout === "WHOLE") {
    return dotCenters.map((p) => p.x);
  }

  const left = LEFT_COUNT_FOR[layout];
  const right = 6 - left;
  const leftWidth = left * dotSize + (left - 1) * MAIN_DOT_GAP;
  const rightWidth = right * dotSize + (right - 1) * MAIN_DOT_GAP;
  const totalWidth = leftWidth + MAIN_CLUSTER_GAP + rightWidth;
  const leftEdge = cx - totalWidth / 2;
  const positions: number[] = [];
  for (let i = 0; i < left; i += 1) {
    positions.push(leftEdge + i * (dotSize + MAIN_DOT_GAP) + dotSize / 2);
  }
  const rightEdge = leftEdge + leftWidth + MAIN_CLUSTER_GAP;
  for (let i = 0; i < right; i += 1) {
    positions.push(rightEdge + i * (dotSize + MAIN_DOT_GAP) + dotSize / 2);
  }
  return positions;
}

// Bounding box of the six dots across EVERY layout they occupy (WHOLE + the
// three splits), derived from the same helper `dotSize` / `dotCenters` (and the
// split-cluster constants the split branch above uses). The dots animate, so
// the manifest's static envelope is this union — a TIGHT, by-construction
// mirror of the scene's real dot footprint (replaces the loose full-ZONE box).
function sixDotsBboxRectFn(): readonly [number, number, number, number] {
  const layouts: DotLayout[] = ["WHOLE", "SPLIT_1_5", "SPLIT_2_4", "SPLIT_3_3"];
  let minX = Infinity;
  let maxX = -Infinity;
  for (const layout of layouts) {
    const xs = mainDotPositionsForLayout(layout);
    minX = Math.min(minX, xs[0] - dotSize / 2);
    maxX = Math.max(maxX, xs[xs.length - 1] + dotSize / 2);
  }
  // y-center of the dot row (computed from ZONE_OBJECTS directly; the exported
  // DOT_Y alias is defined later in this module — same value).
  const cy = ZONE_OBJECTS.y + ZONE_OBJECTS.height / 2;
  return [minX, cy - dotSize / 2, maxX - minX, dotSize] as const;
}
export const sixDotsBboxRect = sixDotsBboxRectFn();

// Compute the 6 x-positions for a recap sub-beat, centered on the sub-
// beat's x position. The sub-beat shows the X+Y grouping: 1|5, 2|4, or 3|3.
export function recapSubBeatDotPositions(
  beatIndex: 0 | 1 | 2,
): { x: number; y: number }[] {
  const cx = getRecapBeatX(beatIndex);
  const cy = RECAP_BEAT_Y;
  // Recap dots are a SEPARATE, smaller cast (RECAP_DOT_SIZE) from the main six
  // teaching dots — named distinctly so they do not shadow the helper-derived
  // module-level `dotSize` export.
  const recapDotSize = RECAP_DOT_SIZE;
  const recapDotGap = RECAP_DOT_GAP;
  const clusterGap = RECAP_CLUSTER_GAP;
  const left = RECAP_PARTITIONS[beatIndex];
  const right = 6 - left;

  const leftWidth = left * recapDotSize + (left - 1) * recapDotGap;
  const rightWidth = right * recapDotSize + (right - 1) * recapDotGap;
  const totalWidth = leftWidth + clusterGap + rightWidth;
  const leftEdge = cx - totalWidth / 2;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < left; i += 1) {
    positions.push({
      x: leftEdge + i * (recapDotSize + recapDotGap) + recapDotSize / 2,
      y: cy,
    });
  }
  const rightEdge = leftEdge + leftWidth + clusterGap;
  for (let i = 0; i < right; i += 1) {
    positions.push({
      x: rightEdge + i * (recapDotSize + recapDotGap) + recapDotSize / 2,
      y: cy,
    });
  }
  return positions;
}

// Recap (cue-recap) constants.
export const RECAP_DOT_SIZE = 42;
export const RECAP_DOT_GAP = 8;
export const RECAP_CLUSTER_GAP = 28;
// Recap sub-beat partitions: 0=1|5, 1=2|4, 2=3|3
export const RECAP_PARTITIONS: readonly [number, number, number] = [1, 2, 3];

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

// Question prompt position: centered in ZONE_PROMPT (in ZONE_LABELS, above
// the dot row, so the prompt and the held whole are visually disjoint).
export const QUESTION_PROMPT_X = ZONE_PROMPT.x + ZONE_PROMPT.width / 2;
export const QUESTION_PROMPT_Y = ZONE_PROMPT.y + ZONE_PROMPT.height / 2;

// Recap beat positions: each beat is centered in its third of ZONE_RECAP_ROW.
export function getRecapBeatX(beatIndex: 0 | 1 | 2): number {
  const zone = ZONE_RECAP_ROW;
  const beatWidth = zone.width / 3;
  return zone.x + beatIndex * beatWidth + beatWidth / 2;
}
export const RECAP_BEAT_Y = ZONE_RECAP_ROW.y + ZONE_RECAP_ROW.height / 2;

// ---------------------------------------------------------------------------
// Per-cue motion schedules (cue-relative frame boundaries).
// v4: derived from the cue's own (startFrame, endFrame) plus narrationFrames
// (the voice plays from cue.startFrame for narrationFrames; the rest of the
// window is free silence / motion hold / typed gap).
// ---------------------------------------------------------------------------

// Per-cue narrator duration (frames) — read from the clips module by the
// scene. The layout file declares the SHAPE of the motion schedule, the
// scene imports the actual frame numbers from the timeline.

export type SplitCueSchedule = {
  /** Cue id (e.g. "split-1-and-5"). */
  cueId: string;
  /** Frame at which the split motion ENDS (= SPLIT_START_FRAMES + motion duration). */
  splitEnd: number;
  /** Frame at which the voice ENDS (cue-relative). The held-with-bond phase
   *  ends here. */
  voiceEnd: number;
  /** Frame at which the recombine motion STARTS (cue-relative). */
  recombineStart: number;
  /** Frame at which the recombine motion ENDS (= cue length). */
  recombineEnd: number;
};

// Compute the motion schedule for a v4 split cue. Inputs:
//   - cueLength: total cue length in frames (cue.endFrame - cue.startFrame)
//   - narrationFrames: voice length in frames
//   - isClimax: whether this is the 3|3 climax (different split duration)
export function splitCueSchedule(
  cueId: string,
  cueLength: number,
  narrationFrames: number,
  isClimax: boolean,
): SplitCueSchedule {
  const splitDuration = isClimax
    ? CLIMAX_SPLIT_MOTION_DURATION_FRAMES
    : SPLIT_MOTION_DURATION_FRAMES;
  const splitEnd = SPLIT_START_FRAMES + splitDuration;
  const voiceEnd = Math.min(narrationFrames, cueLength - RECOMBINE_MOTION_DURATION_FRAMES);
  const recombineStart = cueLength - RECOMBINE_MOTION_DURATION_FRAMES;
  return {
    cueId,
    splitEnd,
    voiceEnd,
    recombineStart,
    recombineEnd: cueLength,
  };
}
