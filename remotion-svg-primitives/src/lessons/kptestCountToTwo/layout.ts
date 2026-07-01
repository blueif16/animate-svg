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

import { video } from "../../theme";

// Canvas
export const CANVAS_WIDTH = video.width; // 1280
export const CANVAS_HEIGHT = video.height; // 720

// Apple + cardinal sizes.
// NOTE: visual-design §1 specifies APPLE_SIZE=220 (focal at 30% of 720). The
// actual `CountableObject variant=fruit` rendered bbox is ~1.10×size in HEIGHT
// (fruit extends y=-60 to y=55 + shadow ellipse overhang y=45..54), so size 220
// produced a 243-tall apple that intrudes both the caption band (top y≈522 from
// src/lesson-media/captionBand.ts) AND zone-objects (visual-design y=420..620
// height 200). The visual-design's zone-caption y=620..720 was idealized — the
// real CaptionLayer footprint starts at y≈522 with SAFE_PADDING=24 grown up.
// APPLE_SIZE=115 (16% of 720, above the 58 px floor + above the 12-15% target)
// gives an apple bbox ≈127×131 that fits cleanly:
//   apple top  → y≈381 (≥ 43 px gap from tag bottom y=337)
//   apple btm  → y≈508 (≥ 14 px clearance above caption band top y=522)
// Recorded as a pipeline finding (visual-design zone sizes vs. implementation).
export const APPLE_SIZE = 115;
export const APPLE_GAP = 100; // gap between the two apples (centers → 215 px apart)
export const APPLE_ROW_HALF_WIDTH = (2 * APPLE_SIZE + APPLE_GAP) / 2; // 165 px

// Apple centers (identity-invariant pair, both at the same y).
// Centered on canvas x: 2 apples + 1 gap = 2·115 + 100 = 330 px → half = 165
export const APPLE_1_CX = CANVAS_WIDTH / 2 - APPLE_ROW_HALF_WIDTH + APPLE_SIZE / 2; // 532
export const APPLE_2_CX = CANVAS_WIDTH / 2 + APPLE_ROW_HALF_WIDTH - APPLE_SIZE / 2; // 748
export const APPLE_CY = 445; // bbox y ≈ 381..509 (zone-objects adjusted to y≈370..520)

// Per-apple tag positions (zone-counts, adjusted to clear apple top + cardinal btm)
export const TAG_SIZE = 64; // diameter of CountStepIndicator badge
export const TAG_1_CY = 305; // tag bbox y = 273..337
export const TAG_2_CY = 305;
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