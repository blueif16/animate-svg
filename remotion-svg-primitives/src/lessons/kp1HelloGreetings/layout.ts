// kp1-hello-greetings — layout constants (pure TS, no React/Remotion).
//
// The single source of geometry + cue-relative motion offsets for the scene AND
// the manifest. Composition is 1280×720 @ 30fps (src/theme.ts `video`; the repo
// standard — visual-design.md's 1920×1080 numbers are %-of-short-side and are
// translated here, see W3b pipeline finding). EVERY frame in the scene derives
// from cues[id].startFrame + one of these *_REL_START offsets; ZERO master-
// timeline literals live in the scene.
//
// Zones (visual-design §1.5, translated to 1280×720):
//   zone-stage     — the two kid figures + their bubbles (DialogueExchange)
//   zone-readalong — the swept English phrase row (ReadAlongHighlight), low band
//   zone-title     — the intro topic card (LessonIntroCard), intro only
//   zone-caption   — Chinese narration ribbon (LessonCaptionLayer, outside SVG)
//   zone-marks     — the 2 coral PulseCircles (DialogueExchange owns #1; recap #2)

import { video } from "../../theme";

export const CANVAS_WIDTH = video.width; // 1280
export const CANVAS_HEIGHT = video.height; // 720

// ---------------------------------------------------------------------------
// zone-stage — the two identity-invariant kid figures + their speech bubbles.
// DialogueExchange is placed at STAGE_CX/STAGE_CY and lays the two speakers out
// ±speakerGap/2 around it, bubbles rising above each figure. The two kids are
// the SAME IconAsset instances every cue (intro → recap): identity invariant.
// ---------------------------------------------------------------------------
export const STAGE_CX = CANVAS_WIDTH / 2; // 640
export const STAGE_CY = 272; // figure centers; lifted so the figure → nameCard
// → read-along stack all fit above the bottom-docked caption ribbon (~y560).
export const SPEAKER_GAP = 560; // gap between the two figure centers
export const FIGURE_RADIUS = 120; // 240px face — reads as a PERSON (kids-eye §1)
export const FACE_WIDTH = FIGURE_RADIUS * 2;

// Figure centers (derived; used by the manifest bbox + part-goodbye drift).
export const KID_LEFT_CX = STAGE_CX - SPEAKER_GAP / 2; // 360
export const KID_RIGHT_CX = STAGE_CX + SPEAKER_GAP / 2; // 920

// Bubble center y, derived from DialogueExchange's internal layout
// (bubbleY = -(figureRadius + BUBBLE_RISE=96) relative to the stage center).
export const BUBBLE_RISE = 96;
export const BUBBLE_CY = STAGE_CY - (FIGURE_RADIUS + BUBBLE_RISE); // 102
export const BUBBLE_W = 280; // SpeechBubble intrinsic width
export const BUBBLE_H = 116; // SpeechBubble intrinsic height

// ---------------------------------------------------------------------------
// zone-readalong — the swept English phrase row. One ReadAlongHighlight per
// teaching cue, placed at this center. Items are whole WORDS (Hello! / I'm /
// Goodbye!) so the gap is generous to keep them from touching at swell.
// ---------------------------------------------------------------------------
// Read-along band sits BELOW the figures + name card (bottom ≈ y458) and ABOVE
// the caption ribbon (HTML overlay; top edge ≈ y560). Centered at 510 so the
// swept words — including the swelled "I'm" — clear both: never under the name
// card, never occluded by the ribbon.
export const READALONG_CY = 510;
export const READALONG_ITEM_RADIUS = 48;
export const READALONG_WORD_SIZE = 50; // ≥86px-equiv cap-height at the 1.28 swell
export const READALONG_ITEM_GAP = 300; // word centers; wide for long farewells
export const READALONG_PER_BEAT_FRAMES = 16;

// recap stacks the three phrases as the begin→middle→end arc. Raised well above
// the caption ribbon (bottom-docked) so the three-row arc reads as its own band
// and never collides with the Chinese narration ribbon.
export const RECAP_LINE_GAP = 72;
export const RECAP_ITEM_GAP = 240;
export const RECAP_WORD_SIZE = 42;
export const RECAP_ITEM_RADIUS = 42;
export const RECAP_CY = 480; // rows at 408 / 480 / 552 — clear of figures + ribbon
export const RECAP_PER_BEAT_FRAMES = 12;

// ---------------------------------------------------------------------------
// zone-title — intro topic card (LessonIntroCard). Centered; resolves in over
// the intro cue, fades out before meet-hello mounts the stage.
// ---------------------------------------------------------------------------
export const TITLE_CX = CANVAS_WIDTH / 2;
export const TITLE_CY = 320;
export const TITLE_SIZE = 92;

// ---------------------------------------------------------------------------
// Name card (intro-self only) — the "Sam" tag under the right kid. Sized so its
// text clears the 36px body-label floor. Geometry mirrored in the manifest.
// ---------------------------------------------------------------------------
export const NAMECARD_W = 160;
export const NAMECARD_H = 52;
export const NAMECARD_FONT = 32;
// DialogueExchange drops the name card to figureBottom + NAMECARD_DROP(=40).
export const NAMECARD_DROP = 40;
export const NAMECARD_CY = STAGE_CY + FIGURE_RADIUS + NAMECARD_DROP; // card center

// ---------------------------------------------------------------------------
// recap closing PulseCircle (pulse #2 of 2) — coral punctuation centered on the
// arc's MIDDLE row ("I'm Sam.", the key phrase). A focused ring that punctuates
// the close without enveloping all three rows (kept clear of the top/bottom
// phrases so it reads as ONE accent, not a frame around the whole arc).
// ---------------------------------------------------------------------------
export const RECAP_PULSE_CX = CANVAS_WIDTH / 2;
export const RECAP_PULSE_CY = RECAP_CY; // arc center = middle row center
export const RECAP_PULSE_RADIUS = 60;
export const RECAP_PULSE_SPREAD = 22;

// ---------------------------------------------------------------------------
// Per-cue MOTION offsets (cue-relative frames). The scene reads cues[id].start
// + these; never an absolute literal. Durations are kid-readable, fit each cue's
// reconciled window (motion-driven cues from visual-design §1 motion-budget).
// ---------------------------------------------------------------------------

// intro — title card resolves in, then the two kid faces settle beneath it.
export const INTRO_CARD_REL_START = 4;
export const INTRO_CARD_DUR = 40; // progress 0→1 over ~1.3s, calm settle
export const INTRO_CAST_REL_START = 22; // kid faces fade in beneath the card
export const INTRO_CAST_DUR = 24;
export const INTRO_CARD_FADE_OUT_DUR = 14; // card clears at end of intro

// The DialogueExchange + read-along motion is driven internally BY INDEX from
// atFrame; these are the cue-relative atFrame OFFSETS + the per-turn pacing.
// One exchange instance per teaching cue (its turns reset per cue).
export const EXCHANGE_REL_START = 6; // wave + first bubble pop after cue opens
export const PER_TURN_FRAMES = 40; // DialogueExchange perTurnDurationFrames
export const INTER_TURN_GAP = 6; // DialogueExchange interTurnGapFrames

export const READALONG_REL_START = 12; // sweep begins after the bubble lands

// intro-self read-along: "I'm" held as ONE swelling unit — its beat weight is
// the biggest in the lesson so the one hard sound is the slowest, largest mark.
export const INTRO_SELF_READALONG_REL_START = 18;

// recap — the three-phrase arc sweep, then the closing coral pulse.
export const RECAP_ARC_REL_START = 10;
export const RECAP_PULSE_REL_START = 64; // fires near the end, over the settled arc
export const RECAP_PULSE_DUR = 26;
export const RECAP_PULSE_REPEAT = 2;

// Stage fade-in (kids appear for meet-hello and stay through recap). The two
// kids cross from intro (quiet cast) straight into the live exchange — they are
// never destroyed/recreated (identity invariant), so the stage opacity ramps
// once at meet-hello start and holds 1 thereafter.
export const STAGE_FADE_IN_DUR = 16;
