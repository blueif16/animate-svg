---
name: early-childhood-visual-taste
description: Visual taste — palette, tone, motion vocabulary — for early-childhood Remotion math lessons. Companion to kids-eye (viewer-first) and visual-discipline (Contract mechanics). Use during Wave 2 visual-design to set the lesson's visual language AFTER the kids-eye measurement block and BEFORE the Visual Contract.
---

# Early Childhood Visual Taste

Purpose: Keep the lesson warm, simple, and legible for young learners (6–7岁). Sets the visual *language* — palette, tone, motion — that the Visual Contract (`visual-discipline` §1) builds on.

## Order of operations (visual-design subagent)

1. Read `kids-eye` SKILL.md → emit the §1 measurement block + §1.5 zones.
2. Read this file → declare palette + motion vocabulary from the rules below.
3. Read `visual-discipline` SKILL.md → emit the §1 Visual Contract.
4. Only then write per-cue choreography.

Skipping steps 1–3 and jumping to per-cue choreography is the root cause of every "label overlaps art" and "comparison breaks identity" bug.

## Palette (theme keys from `src/theme.ts`)

Pull all colors from `theme.colors` via `resolveColor`. Never inline hex values in scene code.

For early-math lessons:
- **`cream`** `#FFF7E6` — canvas background. Warm, low-contrast vs ink, never competes with the teaching object.
- **`reward`** `#FFB84D` — teaching unit color (sticks, dots, the primary countable). Default object color.
- **`coral`** `#FF8A65` — action / transformation accent (the rope that ties, the operator that combines).
- **`textNavy`** `#24324B` — ink: text, outlines, sketch marks. Anything that "speaks."
- **`sunshine`** `#FFD85A` — transient highlight ("this one is being counted"). Never persistent identity.
- **`softGrayBlue`** `#B5C0D0` — dimmed/inactive state ONLY. Never used as a replacement color for the teaching unit in a comparison (see kids-eye §4).

Hard rule: **at most 4 meaningful colors per scene**, plus cream as background. A fifth color signals you're decorating, not teaching.

## Typography

- Sans-serif, rounded, friendly. Use `fontFamily` constant from `src/shape-primitives/shared.tsx`.
- No decorative or display typefaces. The text serves the math; it doesn't compete with the visuals.
- Minimum sizes (per `kids-eye` §1):
  - primary labels (一个十, 十个一 = 一个十): ≥ 48 px
  - badges, count steps: ≥ 36 px
  - caption ribbon: ≥ 56 px (it's load-bearing for accessibility)

## Motion vocabulary

Slow, big, readable. When in doubt, slower.

This skill sets *intent* — the frame counts and named curve per type of move. The concrete API (which `EASE.*` to import, the `PopIn` variants, the spring configs) lives in `CAPABILITIES.md#motion-vocabulary` and `#popin-motion-variants`.

- **Default small move:** 12 frames, `EASE.outCubic`. (badge appear, label fade-in)
- **Default big move:** 24 frames, `EASE.inOutCubic`. (stick reflow, bundle settle)
- **Climax move:** 30 frames, `EASE.outQuint`. The bundling action is the only one allowed this much weight.
- **Slide-in / fade-on entrance:** 16–20 frames, `EASE.enter`. The catch-all entrance curve.
- **Sketch marks draw-on:** 18 frames default, 24 for larger gestures (wrap arc, long underline). Never fade-in — always stroke-on.

For countable entrances, prefer `<PopIn motion=...>` over hand-rolled springs. `motion="snap"` is the default; reserve `motion="bouncy"` for ONE accent moment per video (the new concept being introduced).

Reserve emphasis (sparkle, scale pulse, color flash, `motion="bouncy"`) for ONE moment per video — the climax. Adding emphasis to multiple cues dilutes the climax.

## Sketch (teacher-mark) tone

- One ink color: `textNavy`. No other colors on sketch marks.
- Stroke: 4 px nominal, opacity 0.92, subtle hand-jitter (±1.5 px), round caps.
- One mark per cue maximum. Most cues should have zero marks — restraint clarifies; clutter confuses.
- Marks anchor to zones (per `kids-eye` §1.5). Marks may TRACE OVER zone-objects (e.g. wrap-arc following a tie path) but never SIT INSIDE zone-labels or duplicate what a label says.
- **Optional `boil` for marks that linger** — `<TeacherMark boil={{ magnitude: 1, holdFrames: 4 }}>` makes a long-held mark wobble subtly so it reads as a teacher's hand, not a frozen overlay. Decorative-only, opt-in, at most one or two per video. Full reach guide: `CAPABILITIES.md#sketch-boil`. See also `sketch-explainer-layer` §1.1.

## Anti-patterns specific to early-math

- **Cartoon characters as teacher proxies.** No mascots, no anthropomorphized sticks. The teacher is implicit (voice + sketch marks); the teaching object stays as itself.
- **Decorative environment.** No grass, sky, classroom borders. Cream canvas, the teaching object, the ink. That's it.
- **"Celebratory" color shifts.** The bundle doesn't turn rainbow when the kid "gets it." Identity is preserved across the transformation (`kids-eye` §4).
- **Multiple emphasis effects in one cue.** Pick ONE: scale pulse OR sparkle OR color flash. Not all three.

## What this skill does NOT cover

- Frame timing → `audio-captions` (intent) + actual ASR cue boundaries (Wave 3)
- Layout zones → `kids-eye` §1.5
- Element-by-element existence test → `visual-discipline` §3 / `kids-eye` §2
- Comparison identity → `kids-eye` §4
- Render-and-critique loop → `visual-discipline` §8

## Style overlays

Default lessons have no aesthetic identity — that is intentional, not a gap. If a brief picks a style (e.g., `**Style.** ink-wash`), read `.agents/styles/<id>/` end-to-end. The bundle's `animation.md` declares motion tweaks that take precedence over the default vocabulary recommendations in this skill. Identity-invariance and kids-eye fences still apply unconditionally — styles modify appearance, not teaching semantics.

See CAPABILITIES.md#style-overlay-system for the full registry.
