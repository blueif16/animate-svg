import type { Bbox, ZoneName } from "../manifestTypes";
import { video } from "../../theme";

// ---------------------------------------------------------------------------
// Layout — composition is 1280×720. Zones come from visual-design §1.5.
// ---------------------------------------------------------------------------
export const CANVAS_WIDTH = video.width;
export const CANVAS_HEIGHT = video.height;

export const STICKS_ORIGIN_X = 640;
export const STICKS_ORIGIN_Y = 330;
export const STICK_COUNT = 10;

export const STICK_LENGTH = 120;
export const STICK_THICKNESS = 18;
export const ROW_GAP = 72;
export const BUNDLE_GAP = 18;
export const SCATTER_RADIUS = 180;

export const BUNDLE_FINAL_WIDTH =
  (STICK_COUNT - 1) * BUNDLE_GAP + STICK_THICKNESS + 12;

export const LEFT_HALF_CX = 380;
export const RIGHT_HALF_CX = 900;

export const LABEL_X = 640;
export const LABEL_Y = 545;

// The conservation-peek "10" sits ABOVE the bundle (over the revealed ten ones)
// so it labels the count being x-rayed, and never overlaps the "一个十" unit
// label that lingers BELOW the bundle (y=545) during the same window.
export const PEEK_LABEL_X = 640;
export const PEEK_LABEL_Y = 150;

export const TALLY_X = 640;
export const TALLY_Y = 490;

export const BADGE_Y = 130;

// ---------------------------------------------------------------------------
// Motion budgets — named offsets relative to cue start. Every constant below
// is in FRAMES.
// ---------------------------------------------------------------------------

export const OPENING_ENTER_DURATION = 30;

export const SCATTER_TO_ROW_REL_START = 0;

export const COUNT_PER_STICK_DURATION = 5;
export const COUNT_FLASH_DURATION = 4;

export const FEELS_SLOW_TALLY_REL_START = 4;
export const FEELS_SLOW_TALLY_DURATION = 14;

export const BUNDLE_BADGE_FADE_DURATION = 12;
export const BUNDLE_COMPRESS_REL_START = 0;
export const BUNDLE_COMPRESS_DURATION = 28;
// The magic-transition: ten gathered ones BECOME the roped-bundle asset. The
// morph COMPLETES at bundle-action.start + BUNDLE_MORPH_REL_AT (after the gather
// finishes), and AssetMorph's FX-masked crossfade occupies the BUNDLE_MORPH_DURATION
// frames ending there. BUNDLE_MORPH_REL_START is the first frame the morph
// window touches (where the persistent StickGroup hands off to the component).
export const BUNDLE_MORPH_REL_AT = 40;
export const BUNDLE_MORPH_DURATION = 12;
export const BUNDLE_MORPH_REL_START = BUNDLE_MORPH_REL_AT - BUNDLE_MORPH_DURATION;
// On-screen render width of the stick-bundle-roped asset, sized so its visible
// bundle ≈ the gathered ten ones' bbox at the shared center (identity-preserving).
export const BUNDLE_ASSET_WIDTH = 300;

export const RENAME_LABEL_REL_START = 4;
export const RENAME_LABEL_DURATION = 18;
export const RENAME_PULSE_REL_START = 18;
export const RENAME_PULSE_DURATION = 30;

export const STILL_PEEK_OUT_DURATION = 24;
export const STILL_PEEK_HOLD_DURATION = 36;
export const STILL_PEEK_IN_DURATION = 24;
export const STILL_LABEL_REL_START = 12;
export const STILL_LABEL_DURATION = 12;

export const FASTER_SLIDE_DURATION = 30;
export const FASTER_GHOST_FADE_DURATION = 18;
export const FASTER_ONE_BADGE_REL_START = 32;
export const FASTER_ONE_BADGE_DURATION = 14;
export const FASTER_ONE_TALLY_REL_START = 36;
export const FASTER_ONE_TALLY_DURATION = 16;
// "一个十" label dissolves as faster-count starts — the bundle's existence
// on the right and the "1 步" pill below it already encode "one ten", so the
// text label is redundant during the contrast and would collide with the bow.
export const FASTER_LABEL_EXIT_DURATION = 12;

export const RECAP_SLIDE_BACK_DURATION = 24;
export const RECAP_LABEL_EXIT_DURATION = 18;
export const RECAP_SENTENCE_REL_START = 20;
export const RECAP_SENTENCE_DURATION = 20;
export const RECAP_UNDERLINE_REL_START = 60;
export const RECAP_UNDERLINE_DURATION = 18;
export const RECAP_PULSE_REL_START = 70;
export const RECAP_PULSE_DURATION = 30;

// Zones from visual-design §1.5 — composition pixel space (top-left origin).
export const ZONES: Partial<Record<ZoneName, Bbox>> = {
  objects: [160, 180, 960, 300],
  badges: [160, 90, 960, 80],
  tally: [160, 460, 960, 60],
  labels: [160, 500, 960, 110],
  marks: [0, 0, CANVAS_WIDTH, CANVAS_HEIGHT],
};
