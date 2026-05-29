import type { Bbox, ZoneName } from "../manifestTypes";
import { video } from "../../theme";

// ---------------------------------------------------------------------------
// Composition — 1280×720 @ 30fps. Zones from visual-design §1.5.
// ---------------------------------------------------------------------------
export const CANVAS_WIDTH = video.width;
export const CANVAS_HEIGHT = video.height;

// ---------------------------------------------------------------------------
// Teaching unit geometry — straight from visual-design §1 (kids-eye block).
// Single stick: length=100, thickness=14. Loose row gap=110. Bundle gap=18.
// Identity-invariant across the entire video: every SmallStick uses these.
// ---------------------------------------------------------------------------
export const STICK_COUNT = 10;
export const STICK_LENGTH = 100;
export const STICK_THICKNESS = 14;
export const ROW_GAP = 110;
export const BUNDLE_GAP = 18;

// Derived widths. Loose row: 9 * 110 + 14 = 1004 px (≈ 78% of 1280, within
// visual-design §3 occupancy target). Bundle width: 9 * 18 + 14 = 176 px.
export const LOOSE_ROW_WIDTH =
  (STICK_COUNT - 1) * ROW_GAP + STICK_THICKNESS;
export const BUNDLE_WIDTH =
  (STICK_COUNT - 1) * BUNDLE_GAP + STICK_THICKNESS;
export const BUNDLE_BAND_HEIGHT = BUNDLE_WIDTH * 0.32;

// ---------------------------------------------------------------------------
// Single-row y (Beats 1–4): the teaching unit sits at vertical center of
// zone-objects (y=200..520, h=320 → cy=360).
// ---------------------------------------------------------------------------
export const TEACHING_ROW_Y_SINGLE = 360;

// ---------------------------------------------------------------------------
// Beat 5 side-by-side layout. zone-objects splits vertically: top row of 10
// loose sticks at y=280, bottom row of 3 bundles at y=510. The 230 px
// separation accommodates the bundle's top bow (extends ~1.4 * bandHeight
// above wrap center, ~78 px for a 56-px band) and leaves a clear gap for
// the "三步" tally pill between the rows (placed at THREE_PILL_Y = 390).
// Bundle-row stick bottom (y=560) intentionally extends ~40 px past
// zone-objects (y=520) — the zone bounds are advisory, the bow geometry
// is fixed. Two clear rows beats strict zone-fit at lesson scale.
// ---------------------------------------------------------------------------
export const TOP_LOOSE_ROW_Y = 280;
export const BOTTOM_BUNDLE_ROW_Y = 510;
export const THREE_PILL_Y = 390;

// ---------------------------------------------------------------------------
// Bundle-row x positioning. Beats 2..4 grow the row 1 → 2 → 3 bundles. The
// row is always centered on x=640. Slot spacing chosen so 3 bundles + gaps
// fit zone-objects (h=1120) comfortably and the row reads as a row, not a
// crowd: 3*176 + 2*80 = 688 px wide, ≈ 54% of 1280. Per visual-design §5
// risk #5: ONE positioning function used across cues, never per-cue ad-hoc.
// ---------------------------------------------------------------------------
export const BUNDLE_SLOT_SPACING = BUNDLE_WIDTH + 80; // 256 px between bundle centers

/**
 * Centered slot x for bundle `index` (0-based) in a row of `totalBundles`.
 * Use this for both the scene and the manifest so they cannot drift.
 */
export const bundleSlotX = (index: number, totalBundles: number): number => {
  const rowWidth = (totalBundles - 1) * BUNDLE_SLOT_SPACING;
  return 640 - rowWidth / 2 + index * BUNDLE_SLOT_SPACING;
};

// ---------------------------------------------------------------------------
// Zone anchors — composition pixel space.
// Badges sit at y=156 (centered in zone-badges y=120..192).
// Labels sit at y=580 (centered in zone-labels y=540..620).
// Tally pills sit at y=140 (centered in zone-tally y=110..180).
// ---------------------------------------------------------------------------
export const BADGE_Y = 156;
export const LABEL_Y = 580;
export const TALLY_Y = 140;

// Per-stick x for the loose row in Beat 1 (centered on x=640).
export const looseRowStickX = (index: number): number =>
  640 + (index - (STICK_COUNT - 1) / 2) * ROW_GAP;

// ---------------------------------------------------------------------------
// Motion budgets — every constant below is in FRAMES, cue-relative.
// The composer reads cues[id].startFrame/endFrame from the timing module and
// adds these offsets. ZERO master-timeline literals.
//
// Sized against the ASR cue lengths: cue 1 = 201f, cue 2 = 116f, cue 3 = 87f,
// cue 4 = 77f, cue 5 = 162f, plus the tail hold the composer adds via
// completeKp2v2CountingByTensLessonDuration (1080f total, audio ends 746f).
// ---------------------------------------------------------------------------

// Cue 1 — loose-count-felt (201f). Sticks fade in over the first 18f, then
// the 10-badge cascade starts 12f later and walks across the cue length.
export const C1_STICKS_FADE_IN_DURATION = 18;
export const C1_BADGE_CASCADE_REL_START = 30;
// 10 ticks paced across ~140 frames (the bulk of the cue), 14f per tick.
// Each tick: badge pops on in 10f, stick highlight active for 8f, then back
// to "counted" for the remaining 6f before the next tick.
export const C1_PER_TICK_DURATION = 14;
export const C1_TICK_POP_DURATION = 10;
export const C1_TICK_ACTIVE_DURATION = 8;

// Cue 2 — bundle-is-one-count (116f). Phase budget:
//   first ~16f: badges fade out
//   middle ~70f: sticks compress (row→bundle), then bundle wrap fades on
//   last ~30f: "1" badge pops on, then 一个十 label fades on
export const C2_BADGES_FADE_OUT_DURATION = 16;
export const C2_COMPRESS_REL_START = 8;
export const C2_COMPRESS_DURATION = 30;
export const C2_WRAP_REL_START = 38;
export const C2_WRAP_DURATION = 24;
export const C2_BADGE_REL_START = 70;
export const C2_BADGE_DURATION = 14;
export const C2_LABEL_REL_START = 86;
export const C2_LABEL_DURATION = 18;

// Cue 3 — tens-count-like-ones (87f). Bundle 1 translates leftward, bundle 2
// slides in from right, "2" badge pops on, 两个十 label fades on.
export const C3_TRANSLATE_DURATION = 22;
export const C3_BUNDLE_ENTER_REL_START = 18;
export const C3_BUNDLE_ENTER_DURATION = 24;
export const C3_BADGE_REL_START = 46;
export const C3_BADGE_DURATION = 14;
export const C3_LABEL_REL_START = 60;
export const C3_LABEL_DURATION = 18;

// Cue 4 — pattern-holds (77f). Identical shape to cue 3.
export const C4_TRANSLATE_DURATION = 22;
export const C4_BUNDLE_ENTER_REL_START = 14;
export const C4_BUNDLE_ENTER_DURATION = 22;
export const C4_BADGE_REL_START = 40;
export const C4_BADGE_DURATION = 14;
export const C4_LABEL_REL_START = 54;
export const C4_LABEL_DURATION = 18;

// Cue 5 — tens-are-the-faster-way (162f + tail hold). Reflow the 3-bundle
// row downward, fade in the loose row above, stagger the two tally pills.
export const C5_REFLOW_DURATION = 26;
export const C5_PER_BUNDLE_BADGE_FADE_DURATION = 18;
export const C5_PER_BUNDLE_LABEL_FADE_DURATION = 18;
export const C5_LOOSE_ROW_REL_START = 22;
export const C5_LOOSE_ROW_DURATION = 22;
// Pill timing — the script "数'一'要走十步，数'十'只走三步" puts "十步" first
// and "三步" second. ASR-aligned cue starts at frame 584; the words "十步"
// and "三步" land roughly at the cue's 38% and 78% marks (sherpa-onnx
// targetTokens give the rough phoneme spread). The pills enter just before
// each word so the picture delivers before the mouth names.
export const C5_TEN_PILL_REL_START = 56;
export const C5_TEN_PILL_DURATION = 14;
export const C5_THREE_PILL_REL_START = 116;
export const C5_THREE_PILL_DURATION = 14;
// One sparkle (visual-design §4 — at most one in the whole video). Lights
// the "三步" pill as the speed argument lands. 12f burst.
export const C5_SPARKLE_REL_START = 130;
export const C5_SPARKLE_DURATION = 14;

// ---------------------------------------------------------------------------
// Tail hold — after cue 5 ends (audio finishes), the picture must keep
// teaching through the silence. Composer derives this from
// kp2v2CountingByTensLessonTailHoldFrames; we re-export it for the manifest.
// ---------------------------------------------------------------------------
export const TAIL_HOLD_FRAMES = 334; // ~11.1s @ 30fps — brings total to ~36s

// ---------------------------------------------------------------------------
// Zones — from visual-design §1.5.
// ---------------------------------------------------------------------------
export const ZONES: Partial<Record<ZoneName, Bbox>> = {
  objects: [80, 200, 1120, 320],
  badges: [80, 120, 1120, 72],
  tally: [80, 110, 1120, 70],
  labels: [80, 540, 1120, 80],
  marks: [0, 0, CANVAS_WIDTH, CANVAS_HEIGHT],
};
