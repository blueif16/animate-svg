// kptest-count-three — LAYOUT CONSTANTS (the ONE place geometry lives).
//
// Every zone, position, and cue-relative motion OFFSET is a named constant
// here. Scene code consumes `cues[id].startFrame + <const>` — ZERO frame
// literals, ZERO raw motion literals (every curve a named EASE.*/PopIn).
// Pure TS, no React / hooks / measurement. Geometry is read back off the
// render by the measured pass, so the manifest stays metadata-only.
//
// Zones are the kids-eye §1.5 zones from visual-design.md. The 3 apples live
// the whole video as ONE countable-object group; the 三 glyph is ONE travelling
// NumberCard instance (per-apple count tag #3 → cardinal total — identity
// preserved, no cross-fade).

import { fitUnitsToZone } from "../../layout";

// ── Zones (1280×720 canvas, top-left origin, user units) ────────────────────
// visual-design §1.5 (zone-objects, zone-badges, zone-total, caption). The
// intro card gets its own centered planning zone (it reads ALONE in topic-intro
// and is gone before the apples enter count-climb — time-disjoint, announce-topic).
export const ZONE_OBJECTS = {
  x: 305,
  y: 320,
  width: 670,
  height: 160,
} as const;

export const ZONE_BADGES = {
  x: 290,
  y: 226,
  width: 700,
  height: 64,
} as const;

export const ZONE_TOTAL = {
  x: 520,
  y: 36,
  width: 240,
  height: 140,
} as const;

// ── Apple row (3 identical apples, ONE horizontal group, identity-invariant) ─
// fitUnitsToZone(zone-objects, 3, target≈155) → unit + centres. The zone height
// (160) caps the unit; the resulting apple (~155px) clears the 58px hardMin and
// lands at the ~21% short-side target (visual-design kids-eye §1 "grow-it").
export const APPLE_FIT = fitUnitsToZone(ZONE_OBJECTS, 3, {
  targetUnit: 155,
  minGap: 43,
});

// Apple centres (row of 3, centered in zone-objects). APPLE_Y is the shared
// row centre (the group's vertical midline, used as the Breathe origin).
export const APPLE_POSITIONS = APPLE_FIT.positions;
export const APPLE_Y = APPLE_POSITIONS[0]?.y ?? 400;
export const ROW_CX =
  ((APPLE_POSITIONS[0]?.x ?? 0) +
    (APPLE_POSITIONS[APPLE_POSITIONS.length - 1]?.x ?? 0)) /
  2;

// ── Per-item count tags 一 / 二 / 三 (one per apple COLUMN) ────────────────────
// Slotted ABOVE each apple, aligned to the apple's column x (alignment carries
// "tag belongs to apple"). Sitting in the zone-badges band (y 226–290), the
// tag card (96) clears the apples (top 320) by ≥14px and clears zone-total's
// bottom by ≥38px — the badges occupy their own horizontal band, never on a
// glyph. Square 96px card → glyph ≈ 54px (clears the 48px primary-label floor).
export const TAG_Y = ZONE_BADGES.y + ZONE_BADGES.height / 2; // 258 — band centre
export const TAG_CARD = 96; // square; one per-apple count tag

// ── Cardinal total 三 ──────────────────────────────────────────────────────
// The SAME 三 glyph instance lives the whole video (identity-invariant):
// per-item #3 tag (card 96, above apple 3) → migrates UP to zone-total and
// rescales to the cardinal total (card 132). One glyph, one identity, only
// role/position/size change (NO fresh pop, NO fade-out/fade-in of 三). The
// resting total (card 132) fits zone-total h=140; the bouncy settle-pop peak
// (×1.06) reaches card 140 — still inside the zone (visual-design: "w tolerates
// the bouncy 1.06× overshoot"; h=140 likewise tolerates it).
export const TOTAL_X = ZONE_TOTAL.x + ZONE_TOTAL.width / 2; // 640 — zone-total centre x
export const TOTAL_Y = ZONE_TOTAL.y + ZONE_TOTAL.height / 2; // 106 — zone-total centre y
export const TOTAL_CARD = 132; // square; the cardinal glyph (glyph ≈ 74px climax)
export const TAG_TO_TOTAL_SCALE = TOTAL_CARD / TAG_CARD; // 1.375 — per-item tag grows into the total
// Where the converging coral guide lines ATTACH (the total card's resting
// bottom edge) — so the lines meet the total, never crossing its face.
export const LINE_END_Y = TOTAL_Y + (TAG_CARD * TAG_TO_TOTAL_SCALE) / 2; // 172

// ── Intro card ──────────────────────────────────────────────────────────────
export const ZONE_INTRO = {
  x: 240,
  y: 180,
  width: 800,
  height: 320,
} as const;
export const INTRO_CX = ZONE_INTRO.x + ZONE_INTRO.width / 2; // 640
export const INTRO_CY = ZONE_INTRO.y + ZONE_INTRO.height / 2; // 340

// ── Copy (count words + topic — never a spoken SENTENCE) ───────────────────
// COUNT_WORDS are the count numerals themselves (on-screen ⊆ each cue's spoken
// phrase). INTRO_TITLE / INTRO_TEASER are a SUBSET of the topic-intro phrase's
// spoken tokens, in spoken order ("数一数" ∈ "跟老师一起，数一数，到三。";
// "一起数到三" picks 一/起/数/到/三 — every token the cue speaks) — no on-screen
// string shows a word the cue's audio never says.
export const COUNT_WORDS = ["一", "二", "三"] as const;
// Indices of the COUNT numerals (一 / 二 / 三) inside the count-climb cue's
// targetTokens — distinguishing them from the classifier 一 (一个/又一个/最后一个).
// count-climb targetTokens: ["一"(0),"这"(1),"是"(2),"一"(3),"个"(4),… "二"(17),… "三"(31)].
export const COUNT_WORD_TOKEN_INDICES = [0, 17, 31] as const;
export const INTRO_TITLE = "数一数";
export const INTRO_TEASER = "一起数到三";

// ── Cue-relative motion OFFSETS (frames). Consumed as cues[id].startFrame + ─
// These are NON-spoken-motion constants (entrance pops, settles, decorations).
// The spoken count enumeration itself is bound to the measured count-word
// token onsets in the SCENE (cue.tokenOnsets[idx] + cue.startFrame), NOT a
// constant — see the scene's appleOnset derivation (the count-on hard rule).

// intro: reveal-in (~1.2s), then a held read, then a short fade so the title is
// fully gone before the cast (apples) enters in count-climb.
export const INTRO_REVEAL_FRAMES = 36;
export const INTRO_FADE_OUT_FRAMES = 12;

// apple entrance: apple arrives AT its spoken count word (count-on "in sync"
// — one item per spoken number). APPLE_ENTRANCE_LEAD=0 means the apple's PopIn
// begins on the count-word onset; the snap bloom unfolds as the word lands.
export const APPLE_ENTRANCE_LEAD = 0;

// per-item count tag entrance / the 三 ordinal tag entrance (NON-spoken motion
// wrappers around the onset-synced appearance — a 0.6→1 scale + fade over a
// short named window, eased).
export const TAG_ENTRANCE_FRAMES = 10;
export const TAG_ENTRANCE_FROM_SCALE = 0.6;

// cardinality-reveal sub-phase offsets (cue-local, relative to the cardinality
// cue start). The PICTURE reveals first: coral lines gather + 一,二 recede →
// the 三 migrates up + rescales → the cardinal glyph bouncy settle-pops (the
// ONE climax accent). The narration names the total ("是三个") only AFTER —
// 三 is spoken at cue-local 207, so the pop (ending at cue-local 196) leads it.
export const REVEAL_LINE_DRAW_START = 120; // lines gather as the "一共" lead-in lands
export const REVEAL_LINE_DRAW_FRAMES = 24; // converging lines stroke on
export const REVEAL_LINE_FADE_IN_FRAMES = 6; // lines appear with the draw
export const REVEAL_LINE_FADE_OUT_START = 165; // lines dissolve as the 三 arrives
export const REVEAL_LINE_FADE_OUT_FRAMES = 15;
export const REVEAL_ORD_RECEDE_START = 138; // 一,二 recede as they consolidate
export const REVEAL_ORD_RECEDE_FRAMES = 12;
export const REVEAL_THREE_MIG_START = 150; // 三 migrates UP after the recede clears
export const REVEAL_THREE_MIG_FRAMES = 28; // → arrives at the total by cue-local 178
export const REVEAL_THREE_POP_START =
  REVEAL_THREE_MIG_START + REVEAL_THREE_MIG_FRAMES; // 178 — settle-pop climax begins
export const REVEAL_THREE_POP_PEAK = REVEAL_THREE_POP_START + 8; // 186 — climax apex
export const REVEAL_THREE_POP_END = REVEAL_THREE_POP_START + 18; // 196 — settles (precedes 三@207)
export const REVEAL_TA_DA_OFFSET = REVEAL_THREE_POP_PEAK; // SFX reward fires on the climax pop
export const REVEAL_SETTLE_FRAME = REVEAL_THREE_POP_END; // reached by cue-local 196
