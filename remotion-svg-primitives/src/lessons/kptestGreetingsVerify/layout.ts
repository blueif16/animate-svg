// kptest-greetings-verify — layout constants (pure TS, no React/Remotion).
//
// The single source of geometry + cue-relative motion offsets for the scene AND
// the manifest. Composition is 1280×720 @ 30fps (src/theme.ts `video`). EVERY
// frame in the scene derives from cues[id].startFrame + one of these *_REL_*
// offsets; ZERO master-timeline literals live in the scene.
//
// Zones (visual-design §2, translated from 1920×1080 spec to 1280×720 canvas):
//   zone-characters — the two kid figures (DialogueExchange or manual)
//   zone-bubbles    — speech bubbles (owned by DialogueExchange)
//   zone-text       — ReadAlongHighlight swept text
//   zone-intro      — LessonIntroCard (topic-intro only)
//   zone-recap      — recap stack (recap-1 + recap-2 only)
//   zone-caption    — narration ribbon (LessonCaptionLayer, outside SVG)
//   zone-marks      — PulseCircle emphasis marks

import { video } from "../../theme";

export const CANVAS_WIDTH = video.width; // 1280
export const CANVAS_HEIGHT = video.height; // 720

// ---------------------------------------------------------------------------
// zone-characters — the two identity-invariant kid figures.
// DialogueExchange places speakers ±speakerGap/2 around STAGE_CX/STAGE_CY.
// Kid A (boy-face) is LEFT, Kid B (girl-face) is RIGHT.
// ---------------------------------------------------------------------------
export const STAGE_CX = CANVAS_WIDTH / 2; // 640
export const STAGE_CY = 280; // figure centers; room for bubbles above + RAH below
export const SPEAKER_GAP = 520; // gap between the two figure centers
export const FIGURE_RADIUS = 110; // 220px face — reads as a PERSON (kids-eye §1)
export const FACE_WIDTH = FIGURE_RADIUS * 2;

// Figure centers (derived).
export const KID_A_CX = STAGE_CX - SPEAKER_GAP / 2; // 380 (Kid A / boy, left)
export const KID_B_CX = STAGE_CX + SPEAKER_GAP / 2; // 900 (Kid B / girl, right)

// Farewell parting motion — characters slide apart from their greet positions.
export const PARTING_DISTANCE = 120; // extra pixels each kid moves outward

// School-gate backdrop — subtle context behind zone-characters.
export const GATE_PILLAR_W = 32;
export const GATE_PILLAR_H = 260;
export const GATE_ARCH_HEIGHT = 40;
export const GATE_PILLAR_LEFT_X = KID_A_CX - 120;
export const GATE_PILLAR_RIGHT_X = KID_B_CX + 120;
export const GATE_TOP_Y = STAGE_CY - FIGURE_RADIUS - 60;

// Bubble geometry (derived from DialogueExchange internal layout).
export const BUBBLE_RISE = 90;
export const BUBBLE_CY = STAGE_CY - (FIGURE_RADIUS + BUBBLE_RISE); // ~100
export const BUBBLE_W = 260;
export const BUBBLE_H = 110;

// ---------------------------------------------------------------------------
// zone-text — the swept English phrase row (ReadAlongHighlight).
// Sits below zone-characters, above the caption ribbon.
// ---------------------------------------------------------------------------
export const READALONG_CY = 510;
export const READALONG_ITEM_RADIUS = 48;
export const READALONG_WORD_SIZE = 50; // ≥86px-equiv at activeScale swell
export const READALONG_ITEM_GAP = 280; // word centers
export const READALONG_PER_BEAT_FRAMES = 16;

// ---------------------------------------------------------------------------
// zone-intro — LessonIntroCard (topic-intro only). Centered.
// ---------------------------------------------------------------------------
export const TITLE_CX = CANVAS_WIDTH / 2;
export const TITLE_CY = 320;
export const TITLE_SIZE = 88;

// ---------------------------------------------------------------------------
// zone-recap — recap stack (recap-1 + recap-2). Replaces zone-bubbles +
// zone-text. Three phrases vertically arranged, single live marker.
// ---------------------------------------------------------------------------
export const RECAP_CY = 440;
export const RECAP_LINE_GAP = 68;
export const RECAP_ITEM_GAP = 200;
export const RECAP_WORD_SIZE = 44;
export const RECAP_ITEM_RADIUS = 44;
export const RECAP_PER_BEAT_FRAMES = 12;

// Recap emphasis pulse — positioned BELOW the recap text stack (one line-gap
// + offset below RECAP_CY) to avoid collision with the RAH rows.
export const RECAP_PULSE_CX = CANVAS_WIDTH / 2;
export const RECAP_PULSE_BELOW_OFFSET = 48; // below the bottom text row
export const RECAP_PULSE_RADIUS = 36;
export const RECAP_PULSE_SPREAD = 14;
export const RECAP_PULSE_DUR = 24;
export const RECAP_PULSE_REPEAT = 2;

// ---------------------------------------------------------------------------
// Name card (im-slow-model only) — the "Sam" tag under Kid B.
// ---------------------------------------------------------------------------
export const NAMECARD_W = 148;
export const NAMECARD_H = 48;
export const NAMECARD_FONT = 30;
export const NAMECARD_DROP = 36; // below figure bottom
export const NAMECARD_CY = STAGE_CY + FIGURE_RADIUS + NAMECARD_DROP;

// ---------------------------------------------------------------------------
// Per-cue MOTION offsets (cue-relative frames). The scene reads
// cues[id].startFrame + these; never an absolute literal.
// ---------------------------------------------------------------------------

// topic-intro — title card resolves in, holds for narration reading.
export const INTRO_CARD_REL_START = 4;
export const INTRO_CARD_DUR = 40; // progress 0→1 over ~1.3s
export const INTRO_CARD_FADE_OUT_DUR = 14;

// Gate backdrop fade-in (greet cue).
export const GATE_FADE_IN_DUR = 16;
export const GATE_FADE_REL_START = 0;

// Character slide-in (greet cue).
export const CHAR_SLIDE_IN_DUR = 20;
export const CHAR_SLIDE_REL_START = 2;

// DialogueExchange atFrame offsets + pacing. One exchange per teaching cue.
export const EXCHANGE_REL_START = 6; // first bubble after cue opens
export const PER_TURN_FRAMES = 38; // DialogueExchange perTurnDurationFrames
export const INTER_TURN_GAP = 6; // DialogueExchange interTurnGapFrames

// ReadAlongHighlight atFrame offsets.
export const READALONG_REL_START = 12; // sweep starts after bubble lands
export const IM_SLOW_READALONG_REL_START = 16; // slightly later for predictive pause
export const CHORAL_READALONG_REL_START = 8;
export const GAP_GLOW_REL_START = 4; // glow brightens on prompt
export const FAREWELL_READALONG_REL_START = 14;

// Recap atFrame + pulse.
export const RECAP_STACK_REL_START = 6;
export const RECAP_PULSE_REL_START = 56; // fires near the end of recap-2

// Stage opacity — the figures are visible from greet start through farewell end.
export const STAGE_FADE_IN_DUR = 16;

// "Your turn" glow appear (im-choral-echo).
export const YOUR_TURN_GLOW_REL_START = 36;
export const YOUR_TURN_GLOW_DUR = 16;

// im-slow-model predictive pause duration.
export const PREDICTIVE_PAUSE_FRAMES = 15;
