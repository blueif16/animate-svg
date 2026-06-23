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
- Minimum sizes — the floors live in `kids-eye` §1 (anchored to `src/theme.ts` `sizing`), NOT here. Do not restate a px number that can drift from them; read the floor from kids-eye §1 and pick the matching `sizing` token (`minFontPx` body floor, `captionFontPx` primary/caption floor, `typeScale.*` ramp). Primary labels and captions clear `captionFontPx`; badges/count steps clear `minFontPx`; nothing renders below `minFontPx`.

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
- Most cues should have ZERO marks — restraint clarifies, clutter confuses. The mark-budget ceiling is owned by `sketch-explainer-layer` (total ≤ floor(cueCount × 0.6)); honor that, do not restate a separate per-cue number here.
- Marks anchor to zones (per `kids-eye` §1.5). Marks may TRACE OVER zone-objects (e.g. wrap-arc following a tie path) but never SIT INSIDE zone-labels or duplicate what a label says.
- **Optional `boil` for marks that linger** — `<TeacherMark boil={{ magnitude: 1, holdFrames: 4 }}>` makes a long-held mark wobble subtly so it reads as a teacher's hand, not a frozen overlay. Decorative-only, opt-in, at most one or two per video. Full reach guide: `CAPABILITIES.md#sketch-boil`. See also `sketch-explainer-layer` §1.1.

## Primitive form & shading

The taste bar a primitive must meet to read as the thing it claims to be at real render size (source: `research/svg-illustration-craft-2026-06-03.md` §B/§D). A flat circle pretending to be a fruit fails this bar; the primitive-builder owns clearing it (CLAUDE.md "PRIMITIVE QUALITY IS OWNED BY WAVE 3").

- **DESIGN THE SILHOUETTE / SHAPES FIRST.** Lock a readable shape before any detail — if the silhouette doesn't read at glance, no shading saves it.
- **One light source, from above.** Every form is lit consistently; lighter = raised, darker = inset.
- **Name the value zones and layer them:** highlight → core shadow (the terminator, the darkest band) → reflected light → contact/occlusion shadow (the dark seat where it meets the ground). The contact shadow is the cheapest "it doesn't float" win.
- **Collapse to ~3 value groups** (lights / mediums / darks); squint-test the grouping. Softer edges read rounder.
- **60-30-10 palette, judged relative to neighbors** — color reads differently in context; always test the primitive against its actual neighbors, not in isolation. (This composes with the 4-meaningful-color rule above.)

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
