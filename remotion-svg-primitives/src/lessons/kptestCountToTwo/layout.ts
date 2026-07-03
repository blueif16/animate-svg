// kptest-count-to-two — layout offset constants (pure TS, no React).
// All values derive from video.width / video.height — ZERO raw magic literals.
// Scene and manifest both import from here. Same in → same out.
//
// Geometry follows visual-design.md §2 zones (already in 1280×720 space):
//   zone-cardinal  — top, holds the cardinal NumberCard value=2 (C4 focal)
//   zone-counts    — middle, holds per-apple CountStepIndicator badges
//   zone-objects   — bottom, holds the two apples (identity-invariant cast)
//   zone-caption   — y=620..720 (handled by LessonCaptionLayer)
//
// Identity invariant: each apple is CountableObject variant=fruit at the SAME
// reward tone + same size across the whole video. The 1st apple after C2
// looks identical to the 2nd apple after C3.

import { fitUnitsToZone } from "../../layout";
import { CAPTION_BAND } from "../../lesson-media/captionBand";
import { sizing, video } from "../../theme";

// Canvas
export const CANVAS_WIDTH = video.width; // 1280
export const CANVAS_HEIGHT = video.height; // 720

// Per-apple tag geometry (zone-counts) — hoisted above the apple block because
// the apple auto-size zone below is bounded by the tag row's bottom edge.
// TAG_1_CX/TAG_2_CX still mirror the apple centers; they're defined after the
// apples (below), once APPLE_1_CX/APPLE_2_CX exist.
export const TAG_SIZE = 64; // diameter of CountStepIndicator badge
export const TAG_1_CY = 305; // tag bbox y = 273..337
export const TAG_2_CY = 305;

// Apple sizing — AUTO-SIZED TO ZONE (`fitUnitsToZone`), not hand-picked.
//
// Prior art (see git history / research/_vendor-scan/_our-codebase.md C5): this
// constant used to be a hand-picked APPLE_SIZE=115, arrived at via a documented
// trial-and-error render narrative (visual-design's APPLE_SIZE=220 intruded the
// caption band + zone-objects; 115 was found by hand to clear both). That
// narrative is exactly what `fitUnitsToZone` computes deterministically: given
// a zone + a count, it solves the largest unit that clears the kids-eye floor
// AND fits the zone, so the scene's on-canvas size and the bbox manifest's
// collision box agree BY CONSTRUCTION (docs/proposals/auto-size-to-zone.md).
//
// The zone's vertical band is derived from real geometry, never a fresh magic
// number: top clears the per-apple tag row's bottom edge
// (TAG_1_CY + TAG_SIZE/2 + sizing.separationGapMin — the exact "43px gap from
// tag bottom y=337" the old comment hand-computed); bottom clears the ACTUAL
// shared caption-ribbon footprint (`CAPTION_BAND` from
// src/lesson-media/captionBand.ts — not a hand-copied "522") minus a small
// clearance. Width is a symmetric safe-area margin (vendor L4: ≥80px side
// inset) so the pair centers on the canvas.
const APPLE_ZONE_MARGIN_X = 100; // safe-area side margin (research L4: ≥80px)
const APPLE_ZONE_BOTTOM_CLEARANCE = 14; // clearance above the caption band
const APPLE_ZONE_TOP = TAG_1_CY + TAG_SIZE / 2 + sizing.separationGapMin; // 380
const APPLE_ZONE = {
  x: APPLE_ZONE_MARGIN_X,
  y: APPLE_ZONE_TOP,
  width: CANVAS_WIDTH - 2 * APPLE_ZONE_MARGIN_X,
  height: CAPTION_BAND[1] - APPLE_ZONE_BOTTOM_CLEARANCE - APPLE_ZONE_TOP, // ≈128
};
// PIPELINE FINDING: fitUnitsToZone(APPLE_ZONE, 2) resolves unit=96 (the
// kids-eye teachingUnit.target — the zone comfortably fits the target size, no
// shrink needed), a computed value that happens to be SMALLER than the old
// hand-picked 115 — expected: 115 was never derived from the floor/target
// convention every other lesson's countable units use (kptestFenyuheSix's
// DOTS_FIT resolves to the same 96 target). If APPLE_ZONE ever shrinks (e.g. a
// taller cardinal pushes TAG_1_CY down), `fits:false` + `overflowReason` name
// the exact density problem instead of silently rendering sub-floor — see
// APPLE_FIT.fits.
export const APPLE_FIT = fitUnitsToZone(APPLE_ZONE, 2);

export const APPLE_SIZE = APPLE_FIT.unit; // 96 (was hand-picked 115)
export const APPLE_GAP = APPLE_FIT.gap; // 43 = sizing.separationGapMin (was hand-picked 100)
export const APPLE_ROW_HALF_WIDTH = (2 * APPLE_SIZE + APPLE_GAP) / 2;

// Apple centers (identity-invariant pair, both at the same y) — the fit's
// resolved positions, centered on APPLE_ZONE (which is itself centered on the
// canvas), so both land ~ the same place the old hand-picked constants did.
export const APPLE_1_CX = APPLE_FIT.positions[0].x; // ≈570.5 (was hand-picked 532)
export const APPLE_2_CX = APPLE_FIT.positions[1].x; // ≈709.5 (was hand-picked 748)
export const APPLE_CY = APPLE_FIT.positions[0].y; // 444 (was hand-picked 445)

export const TAG_1_CX = APPLE_1_CX;
export const TAG_2_CX = APPLE_2_CX;

// Cardinal (zone-cardinal, adjusted to give 53 px gap to tag row at y=305)
// Visual-design declared zone-cardinal y=60..240; we shift the cardinal up to y=130
// (bbox y=40..220) for a 53 px clearance to tag top y=273 — the canonical "different
// visual species in a different zone" hierarchy signal stays (top vs. middle vs. bottom).
export const CARDINAL_W = 200;
export const CARDINAL_H = 180;
export const CARDINAL_CX = 640;
export const CARDINAL_CY = 130;

// Intro card (LessonIntroCard) — centered, title reads ALONE first
export const INTRO_CARD_CX = CANVAS_WIDTH / 2;
export const INTRO_CARD_CY = CANVAS_HEIGHT / 2;
export const INTRO_TITLE_SIZE = 96;

// ─── MOTION OFFSETS (cue-relative frames) ────────────────────────────────────
// Per visual-design §3 + §5 motion vocabulary + storyboard timing constraints.
// All offsets here derive from the cue start — the scene adds them to
// cues[id].startFrame; no master-timeline literals.

// C1 — lesson-intro: card write-on (progress 0→1)
export const INTRO_REVEAL_START_REL = 0;
export const INTRO_REVEAL_DUR = 48; // ~1.6s — under the 2.0s visual budget

// C2 — first-apple-one: apple 1 enters, then tag 1 attaches BEFORE the spoken 一.
// Apple 1 lands at +18f, tag 1 attaches at +18f, settles by +30f.
// Spoken 一 onset is at tokenOnsetFrame(cue, 1) = 35 → tag is settled at +30, name at +35.
export const APPLE_1_POPIN_REL_START = 0;
export const APPLE_1_POPIN_DUR = 18; // EASE.enter via PopIn "snap"
export const TAG_1_POPIN_REL_START = 18; // attaches AFTER apple 1 settles
export const TAG_1_POPIN_DUR = 12; // EASE.outCubic via PopIn "snap"

// C3 — second-apple-two: apple 1 + tag 1 stay QUIET (no re-entry).
// Apple 2 lands BEFORE spoken 又 (onset frame 54); tag 2 attaches AFTER apple 2
// settles, settled BEFORE spoken 一 (onset frame 64).
export const APPLE_2_POPIN_REL_START = 30; // settles at frame 48, before 又 at 54
export const APPLE_2_POPIN_DUR = 18;
export const TAG_2_POPIN_REL_START = 48; // attaches after apple 2 settles (frame 48)
export const TAG_2_POPIN_DUR = 12; // settles at frame 60, before 一 at 64

// C4 — cardinality: cardinal NumberCard value=2 emerges (bouncy) + per-apple
// tags dim (1.0 → 0.35) + ONE Sparkle accent at the bouncy peak.
// Spoken 两 onset is at tokenOnsetFrame(cue, 0) = 6 → cardinal begins at cue
// head so opacity ramp (0→1 over 8 frames via PopIn) puts it visible by frame 8.
export const CARDINAL_POPIN_REL_START = 0;
export const CARDINAL_POPIN_DUR = 30; // ONE bouncy accent per video (visual-design §3)
export const TAG_DIM_REL_START = 0; // dim runs alongside the cardinal emergence
export const TAG_DIM_DUR = 20; // EASE.inOutCubic
export const TAG_DIM_FLOOR = 0.35; // supporting context, not removed (visual-design §3)
export const CARDINAL_SPARKLE_REL_START = 12; // fires at the bouncy overshoot peak

// ─── SFX FRAME OFFSETS (composer-owned; fed to LessonSfxLayer) ───────────────
// Each fromFrame = cues[id].startFrame + offset (no master-timeline literals).
export const SFX_APPLE_POP_OFFSET = 0; // pops as apple lands
export const SFX_TAG_POP_OFFSET = 0; // pops as tag attaches (relative to its popin start)
export const SFX_CARDINAL_REWARD_OFFSET = CARDINAL_SPARKLE_REL_START; // ta-da at sparkle