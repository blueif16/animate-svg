// Spatial & motion timing constants for kp2-counting-by-tens (Wave 4a).
// This is pure TS (no React, no Remotion imports). Both the scene and the
// manifest import from this file.

import { video } from "../../theme";

export const CANVAS_WIDTH = video.width;
export const CANVAS_HEIGHT = video.height;

// ─── SPATIAL CONSTANTS ───────────────────────────────────────────────────────
export const STICKS_ORIGIN_X = 640;
export const STICKS_ORIGIN_Y = 330;
export const STICK_COUNT = 10;

export const STICK_LENGTH = 120;
export const STICK_THICKNESS = 18;
export const ROW_GAP = 100;
export const BUNDLE_GAP = 18;

export const BUNDLE_FINAL_WIDTH =
  (STICK_COUNT - 1) * BUNDLE_GAP + STICK_THICKNESS + 12;

// Zones from visual-design §1.5
export const TALLY_LEFT_CX = 370;
export const TALLY_RIGHT_CX = 910;
export const TALLY_Y = 535;

export const VS_MARK_X = 640;
export const VS_MARK_Y = 535;

// Bundle horizontal positions for extension cues.
export const BUNDLE_TWO_LEFT_CX = 530;
export const BUNDLE_TWO_RIGHT_CX = 750;
export const BUNDLE_THREE_LEFT_CX = 340;
export const BUNDLE_THREE_MID_CX = 640;
export const BUNDLE_THREE_RIGHT_CX = 940;
export const BUNDLE_OFFSCREEN_RIGHT_CX = 1480;

// Label position
export const LABEL_X = 640;
export const LABEL_Y = 600;

// Badges above the bundle
export const BADGE_Y = 130;
export const COUNT_BADGE_SIZE = 60;
export const COUNT_BADGE_BIG_SIZE = 60;

// ─── TIMING CONSTANTS (CUE-RELATIVE OFFSETS) ──────────────────────────────────
// slow-count-ones walk pacing
export const SLOW_COUNT_STRIDE = 9;
export const SLOW_COUNT_FLASH = 5;
export const SLOW_COUNT_BADGE_FADE_DUR = 12;
export const SLOW_BADGE_BASE_DELAY = 6;
export const SLOW_TALLY_REL_START = 78;
export const SLOW_TALLY_DUR = 18;

// bundle-recall
export const RECALL_BUNDLE_BOUNCY_DUR = 24;
export const RECALL_LABEL_REL_START = 18;
export const RECALL_LABEL_DUR = 16;

// untie-reveal
export const UNTIE_OPEN_REL_START = 0;
export const UNTIE_OPEN_DUR = 60;
export const UNTIE_LABEL_EXIT_DUR = 24;

// fast-vs-slow
export const FAST_BADGES_FADE_DUR = 14;
export const FAST_COMPRESS_REL_START = 12;
export const FAST_COMPRESS_DUR = 28;
export const FAST_WRAP_REL_START = 18;
export const FAST_WRAP_DUR = 30;
export const FAST_ONE_BADGE_REL_START = 50;
export const FAST_ONE_BADGE_DUR = 12;
export const FAST_SLOW_TALLY_SLIDE_DUR = 18;
export const FAST_RIGHT_TALLY_REL_START = 48;
export const FAST_RIGHT_TALLY_DUR = 16;
export const FAST_GLINT_REL_START = 50;
export const FAST_GLINT_DUR = 14;
export const FAST_VS_MARK_REL_START = 50;
export const FAST_VS_MARK_DUR = 14;

// two-tens
export const TWO_EXIT_DUR = 14;
export const TWO_BUNDLE_A_SLIDE_REL_START = 4;
export const TWO_BUNDLE_A_SLIDE_DUR = 20;
export const TWO_BUNDLE_B_SLIDE_REL_START = 18;
export const TWO_BUNDLE_B_SLIDE_DUR = 28;
export const TWO_BADGE_A_REL_START = 48;
export const TWO_BADGE_A_DUR = 12;
export const TWO_BADGE_B_REL_START = 58;
export const TWO_BADGE_B_DUR = 12;
export const TWO_LABEL_REL_START = 66;
export const TWO_LABEL_DUR = 18;
export const TWO_SMEAR_REL_START = 18;
export const TWO_SMEAR_REL_END = 46;

// three-tens
export const THREE_BUNDLE_SHIFT_REL_START = 4;
export const THREE_BUNDLE_SHIFT_DUR = 20;
export const THREE_BUNDLE_C_SLIDE_REL_START = 18;
export const THREE_BUNDLE_C_SLIDE_DUR = 26;
export const THREE_BADGE_C_REL_START = 46;
export const THREE_BADGE_C_DUR = 12;
export const THREE_LABEL_REL_START = 56;
export const THREE_LABEL_DUR = 18;
export const THREE_SMEAR_REL_START = 18;
export const THREE_SMEAR_REL_END = 44;

// recap
export const RECAP_LABEL_FADE_REL_START = 4;
export const RECAP_LABEL_FADE_DUR = 18;
export const RECAP_PULSE_REL_START = 28;
export const RECAP_UNDERLINE_REL_START = 46;
export const RECAP_UNDERLINE_DUR = 18;

// Helper function to calculate row stick X positions
export const getRowStickX = (index: number) =>
  STICKS_ORIGIN_X + (index - (STICK_COUNT - 1) / 2) * ROW_GAP;
