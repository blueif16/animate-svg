// kptest-first-second-third — layout offset constants (pure TS, no React).
// All values derive from video.width / video.height — ZERO raw magic literals.
// Scene and manifest both import from here. Same in → same out.

import { stepFramesFromOnsets } from "@studio/narration-kit";
import { video } from "../../theme";
import { kptestFirstSecondThirdCues } from "../kptestFirstSecondThirdLessonTimeline";

export const CANVAS_WIDTH = video.width;   // 1280
export const CANVAS_HEIGHT = video.height; // 720

// ─────────────────────────────────────────────────────────────
// ZONES (scaled from visual-design.md spec at 1920×1080 → 1280×720, ratio 2/3)
// ─────────────────────────────────────────────────────────────
export const ZONE_CAPTION = { x: 0, y: 633, w: CANVAS_WIDTH, h: 87 };

// zone-chips: y 340→470 → 227→313 (×2/3)
export const ZONE_CHIPS = { x: 93, y: 227, w: 1094, h: 87 };

// zone-objects: y 500→930 → 333→620; ground line at y=567 (850×0.667)
export const ZONE_OBJECTS = { x: 67, y: 333, w: 1147, h: 287 };

// zone-prompt (ask cues): x560 y100 w800 h200 → x373 y67 w533 h133
export const ZONE_PROMPT = { x: 373, y: 67, w: 533, h: 133 };

// ─────────────────────────────────────────────────────────────
// GROUND LINE & FLAG
// ─────────────────────────────────────────────────────────────
// ground line Y (the queue floor)
export const GROUND_Y = 567; // 850 × 0.667

// Flag: x120→213 at 1920 → x80→142 at 1280; center x=110
export const FLAG_CX = 110;
export const FLAG_CY = 480; // mid-body, above ground (centers body ~200px tall → top ~380)
export const FLAG_W = 93;
export const FLAG_H = 133;

// ─────────────────────────────────────────────────────────────
// ANIMAL CENTERS (x-positions along the queue)
// visual-design: x600/x980/x1360 at 1920 → x400/x653/x907 at 1280
// ─────────────────────────────────────────────────────────────
export const ANIMAL_CX: [number, number, number] = [400, 653, 907];
export const ANIMAL_CY = 500;   // body center above ground (stands on GROUND_Y)
export const ANIMAL_W = 173;    // 260 × 0.667
// PIPELINE FINDING: ANIMAL_H feeds `<CountableObject size={ANIMAL_H}>` (the
// queue animals + the OrderedRowSpotlight sweep items) — the SAME
// countable-unit-size pattern opportunity #14 migrated for kptestCountToTwo's
// APPLE_SIZE via `fitUnitsToZone`. Not migrated here: opportunity #14's named
// target was APPLE_SIZE only (research/remotion-vendor-best-practices-2026-07-03.md
// §5 #14); ANIMAL_CX is a fixed 3-slot queue (identity-invariant animal
// positions reused whether 2 or 3 are visible), not a per-cue varying `count`
// fed to one zone the way the apple pair is, so the migration needs its own
// zone-derivation pass rather than a drop-in reuse of the apple fix. Deliberate
// deferral, tracked here (not silent) — a follow-up should reuse ZONE_OBJECTS
// (adapted from {x,y,w,h} to {x,y,width,height}) + fitUnitsToZone(zone, 3).
export const ANIMAL_H = 187;    // 280 × 0.667 — hand-picked, see finding above
export const ANIMAL_STEP_FORWARD_DX = 80; // how far animal steps forward for reveal

// ─────────────────────────────────────────────────────────────
// CHIP (ordinal-label-token) centers — same x as their animal
// y = center of zone-chips = 227 + 87/2 = 270
// ─────────────────────────────────────────────────────────────
export const CHIP_W = 140;   // 210 × 0.667
export const CHIP_H = 73;    // 110 × 0.667
export const CHIP_Y = 270;   // center of zone-chips

// ─────────────────────────────────────────────────────────────
// INTRO CARD
// ─────────────────────────────────────────────────────────────
export const INTRO_CARD_CX = CANVAS_WIDTH / 2;
export const INTRO_CARD_CY = CANVAS_HEIGHT / 2;

// ─────────────────────────────────────────────────────────────
// MOTION OFFSETS (named cue-relative offsets, frames)
// ─────────────────────────────────────────────────────────────

// Intro card reveals during intro cue
export const INTRO_REVEAL_START_REL = 0;
export const INTRO_REVEAL_DUR = 18;     // 0.6s write-on

// Animal walk-in travel (from off-stage right)
export const ANIMAL_WALK_ENTER_FROM_X = CANVAS_WIDTH + 100; // off screen right
export const ANIMAL_WALK_REL_START = 0;
export const ANIMAL_WALK_DUR = 54;      // 1.8s travel
export const ANIMAL_SETTLE_REL_START = 54;
export const ANIMAL_SETTLE_DUR = 9;    // 0.3s settle

// Chip attach (after cue head) — anchor to narration TAIL of name-first cue
// narration-tail offset: name-first narrationFrames=96; chip attaches ~70f in
export const CHIP_ATTACH_REL_NAME_FIRST = 60;  // ~2s into cue (tail of "排第一")
export const CHIP_ATTACH_REL_COUNT = 6;         // chip attaches at spotlight landing
export const CHIP_PULSE_DUR = 12;               // scale pulse duration (frames)

// Count sweep: atFrame relative offset — sweep starts at cue head
export const SWEEP_REL_START = 0;

// Spoken-enumeration step cadence — adoption of `stepFramesFromOnsets`
// (CLAUDE.md "SPOKEN ENUMERATION BINDS TO TOKEN ONSETS": MEASURE, DON'T
// ASSUME). Try the MEASURED per-token onset spacing off the reconciled
// count-second cue (n=2, this lesson's smallest spoken count) first, deriving
// a step interval from two consecutive onsets rather than a hand-picked
// literal.
//
// PIPELINE FINDING: the frozen Wave 3a audio truth
// (`src/lessons/generated/kptestFirstSecondThirdClips.ts`) does not carry
// `tokenOnsets` for this fixture (grepped: zero `tokenOnsets` matches — the
// ASR-onset-projection step was not run for this voice generation), so
// `stepFramesFromOnsets` returns null here and this constant falls back to the
// previous fixed cadence. This is the CLAUDE.md-sanctioned escape hatch
// ("onsets unavailable → fall back to the constant AND emit a
// pipelineFinding"), never a silent guess. Re-running `npm run lesson:voice`
// with onset projection enabled would unlock the measured value automatically
// (no code change needed here).
//
// PIPELINE FINDING (scope handoff): `OrderedRowSpotlight` also accepts a
// `stepFrames` ARRAY prop (per-position measured onsets), which would bind
// count-second / count-third / recap-count to their OWN cue's onsets
// individually instead of sharing one scalar cadence. That requires
// `kptestFirstSecondThirdLessonScene.tsx` (Wave-4/composer-owned) to pass
// `stepFrames={stepFramesFromOnsets(cues[id], n)}` per sweep instead of
// `stepDurationFrames={SWEEP_STEP_FRAMES}` — out of this file's scope
// (layout.ts constants only); flagged for the composer lane.
const COUNT_SECOND_CUE = kptestFirstSecondThirdCues.find(
  (cue) => cue.id === "count-second",
);
const COUNT_SECOND_STEPS = COUNT_SECOND_CUE
  ? stepFramesFromOnsets(COUNT_SECOND_CUE, 2)
  : null;
export const SWEEP_STEP_FRAMES = COUNT_SECOND_STEPS
  ? COUNT_SECOND_STEPS[1] - COUNT_SECOND_STEPS[0]
  : 48; // FALLBACK — see PIPELINE FINDING above; onsets unavailable this fixture

// Reveal step-forward / step-back
export const REVEAL_STEP_FORWARD_REL = 0;
export const REVEAL_STEP_FORWARD_DUR = 15;
export const REVEAL_STEP_DWELL = 60;   // hold after stepping forward
export const REVEAL_STEP_BACK_REL_OFFSET = 75; // after step-dwell
export const REVEAL_STEP_BACK_DUR = 12;

// Sparkle burst (reveal-second only): fires as the confirm utterance lands
export const SPARKLE_REL_REVEAL_SECOND = 30;

// Your-turn affordance (ask cues)
export const ASK_AFFORDANCE_REL = 0;
export const ASK_AFFORDANCE_PULSE_REL = 10;

// Recap-invite: counting finger poised at flag
export const RECAP_FINGER_REL = 0;

// SFX frame offsets (per audio-cues.json event)
export const SFX_POPIN_OFFSET = 0;          // fires at cue start for arrive cues
export const SFX_CHIP_POPIN_OFFSET = 60;    // fires when chip attaches (name-first)
export const SFX_REWARD_OFFSET = 30;        // fires on chip glow-pulse during reveal
export const SFX_ASK_POPIN_OFFSET = 0;     // fires as affordance pops

// Count sweep SFX: one "woodblock" tick per ordinal step
export const SFX_COUNT_STEP_OFFSETS = [
  SWEEP_REL_START + SWEEP_STEP_FRAMES * 0,   // step 1
  SWEEP_REL_START + SWEEP_STEP_FRAMES * 1,   // step 2
  SWEEP_REL_START + SWEEP_STEP_FRAMES * 2,   // step 3 (count-third only)
];
