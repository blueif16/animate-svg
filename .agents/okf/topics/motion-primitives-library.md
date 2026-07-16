---
type: subsystem
key: motion-primitives-library
title: Motion primitives + ambient FX library (the curves/pathMath vocabulary + the reusable component set)
description: The shared animation vocabulary every scene reads instead of raw literals — curves.ts's named EASE/SPRING set, pathMath.ts's path-sampling math, glyphStrokes.ts's stroke-order data, the 18-component motion-primitives set they drive, the fx/ ambient-decoration layer (sibling-Defs + filter URL pattern), and the transitions/ + three-effects preset that ride the same primitives between/around scenes.
resource: remotion-svg-primitives/src/motion-primitives/curves.ts
aliases: [EASE, SPRING, motion-primitives, pathMath, glyphStrokes, fx, FXDefs, transitions, three-effects, curves.ts]
seeds: [remotion-svg-primitives/src/motion-primitives/curves.ts, remotion-svg-primitives/src/motion-primitives/pathMath.ts, remotion-svg-primitives/src/motion-primitives/glyphStrokes.ts, remotion-svg-primitives/src/motion-primitives/index.ts, remotion-svg-primitives/src/fx/FXDefs.tsx, remotion-svg-primitives/src/fx/index.ts, remotion-svg-primitives/src/lessons/transitions/TopicIntroCard.tsx, remotion-svg-primitives/src/lessons/transitions/index.ts, remotion-svg-primitives/src/three-effects/preset-kids.ts]
symbols: [EASE, SPRING, getSampledPoint, GLYPH_STROKES, glyphStrokesFor, FXDefs, TopicIntroCard, kidsPreset]
tags: [motion, curves, fx, transitions, three-effects, primitives]
timestamp: 2026-07-09
---

# Why / how it works (the lifecycle, end to end)
`curves.ts` is the ONE named-curve vocabulary every card in this repo's prose cites as law ("every curve a named
EASE/SPRING, never a raw literal"): `EASE` (cubic-bezier presets) and `SPRING` (Remotion spring configs) are the
only two exports scene/motion code is allowed to reach for. `pathMath.ts`'s `getSampledPoint()` underlies the
path-following primitives (`DrawPath`, `FollowPath`) — sampling a point + tangent along an SVG path at a given
progress, frame-driven, no `Date.now`. `glyphStrokes.ts` is stroke-order DATA (`GLYPH_STROKES`, keyed by
character) feeding `GlyphStrokeWriter`/`GlyphStrokeData` — the handwriting-simulation primitive. The
`motion-primitives/index.ts` barrel (18 components: `AbstractionLadder`, `AssetMorph`,
`ConservationMorphBundle`, `DialogueExchange`, `Drag`, `DrawPath`, `FollowPath`, `GlyphStrokeWriter`,
`MatchPairsBoard`, `OrderedRowSpotlight`, `PartWholeComposer`, `PictographEvolution`, `PopIn`, `PulseCircle`,
`ReadAlongHighlight`, `Smear`, `SparkleBurst`, `VocabFlashcard`) is ALSO one of the two barrels
`build-registry.mjs` scans (`motionBarrel`, alongside the shape-primitives barrel [[primitive-registry]]
already covers) — so these are code-as-truth registry members too, just a distinct family from raw SVG shapes.
`fx/` is a separate, smaller ambient-decoration layer (`Sparkle`, `ShineSweep`, `GlintFlash`, `GlowPulse`,
`Breathe`) sharing ONE `FXDefs` component that renders shared SVG filter/gradient defs ONCE per scene root —
consumers reference filter IDs (`filter="url(#fx-...)"`) rather than each FX component cloning its own defs (the
documented "sibling-Defs + filter URL" convention). `fx` is re-exported from the top-level `src/index.ts`
alongside `styles`, so it is part of the Remotion root's public surface, not a demo-only utility.
`lessons/transitions/` (`TopicIntroCard`, `SectionHandoff`) are scene-to-scene transition components the
composer wires between sections, and `three-effects/preset-kids.ts`'s `kidsPreset` is the one local preset over
the vendored `@studio/three-effects` decorative-3D package — both consume the same curve/FX vocabulary rather
than inventing their own.

# Anchors
CURVE VOCABULARY (the law every scene/primitive obeys)
- `remotion-svg-primitives/src/motion-primitives/curves.ts:5` — `EASE` — the named cubic-bezier preset set
- `remotion-svg-primitives/src/motion-primitives/curves.ts:26` — `SPRING` — the named Remotion spring-config set
PATH + STROKE MATH
- `remotion-svg-primitives/src/motion-primitives/pathMath.ts:162` — `getSampledPoint` — point+tangent sampling along an SVG path by progress, underlies DrawPath/FollowPath
- `remotion-svg-primitives/src/motion-primitives/glyphStrokes.ts:46` — `GLYPH_STROKES` — stroke-order data keyed by character
- `remotion-svg-primitives/src/motion-primitives/glyphStrokes.ts:777` — `glyphStrokesFor` — lookup feeding GlyphStrokeWriter
BARREL (registry-scanned — second barrel [[primitive-registry]]'s build-registry.mjs reads)
- `remotion-svg-primitives/src/motion-primitives/index.ts:1` — `export { AbstractionLadder } from "./AbstractionLadder"` — representative entry; 18 components total, one file each
AMBIENT FX (sibling-Defs + filter URL)
- `remotion-svg-primitives/src/fx/FXDefs.tsx:16` — `FXDefs` — shared filter/gradient defs, render once per scene root
- `remotion-svg-primitives/src/fx/index.ts:1` — barrel — Sparkle/ShineSweep/GlintFlash/GlowPulse/Breathe, re-exported from `src/index.ts`
TRANSITIONS + 3D PRESET
- `remotion-svg-primitives/src/lessons/transitions/TopicIntroCard.tsx:18` — `TopicIntroCard` — scene-to-scene transition the composer wires between sections
- `remotion-svg-primitives/src/three-effects/preset-kids.ts:16` — `kidsPreset` — the one local preset over the vendored `@studio/three-effects` package

# Freshness (anti-drift)
anchors ✓ (every line opened + confirmed) · scope = the seeds above · re-derive when they change · DRIFT NOTE:
this was previously COMPLETELY uncarded despite being the vocabulary [[composer-scene-assembly]]'s own prose
already cites ("every curve a named EASE/SPRING"). [[primitive-registry]]'s seeds list only the shape-primitives
barrel, not the motion-primitives barrel `build-registry.mjs` ALSO scans — that card's seeds were broadened to
add it (registry-build coverage), but the ACTUAL animation mechanics (curves/pathMath/glyphStrokes) and the
fx/transitions/three-effects layer live here instead, since they're a distinct concern from the registry
build/catalog pipeline. [[sketch-overlay-marks]]'s `TeacherMark` is a SHAPE primitive (sketch.tsx), not part of
this motion-primitives family, despite the thematic adjacency.

<!-- okf:auto-start -->
> _Auto-generated by `_generate.mjs` — do not hand-edit between the markers; re-run `--write`._

### Final state — file set (seeds)

| File | exists |
|---|---|
| `remotion-svg-primitives/src/motion-primitives/curves.ts` | ✓ |
| `remotion-svg-primitives/src/motion-primitives/pathMath.ts` | ✓ |
| `remotion-svg-primitives/src/motion-primitives/glyphStrokes.ts` | ✓ |
| `remotion-svg-primitives/src/motion-primitives/index.ts` | ✓ |
| `remotion-svg-primitives/src/fx/FXDefs.tsx` | ✓ |
| `remotion-svg-primitives/src/fx/index.ts` | ✓ |
| `remotion-svg-primitives/src/lessons/transitions/TopicIntroCard.tsx` | ✓ |
| `remotion-svg-primitives/src/lessons/transitions/index.ts` | ✓ |
| `remotion-svg-primitives/src/three-effects/preset-kids.ts` | ✓ |

### Evolution arc

- `3ca1d9a` 2026-05-19 — feat: motion primitives (DrawPath, FollowPath, PopIn, PulseCircle, SparkleBurst)
- `47953f9` 2026-05-29 — feat(motion): motion-primitives library
- `264aa47` 2026-05-29 — feat(fx): magic FX library
- `01eff27` 2026-05-29 — feat(3d): three-effects kids preset
- `4603f20` 2026-05-29 — feat(lessons): new lessons, timelines, generated timing + primitives
- `f35959f` 2026-06-03 — feat(assets): AssetMorph magic-transition + share 68-icon origin library
- `aad4203` 2026-06-03 — feat: ConservationMorphBundle + 5 curriculum-driven capabilities; wire morph into wrap lesson
- `ca0d5e8` 2026-06-04 — feat(capabilities): 6 curriculum-driven special components for Math/Chinese/English §1.1–1.5
- `dc06956` 2026-06-04 — feat(capabilities): hanzi/基本笔画 stroke data + 16 pictograph & stationery assets
- `ca2ab54` 2026-06-10 — skillsys(registry): sweep lesson-media/styles/transitions into the registry — complete component universe

### Lessons — memory cluster

**Alias matches** (review — may include false positives):
- [[always-gitignore-generated-artifacts]]
- [[audio-kit-shared-architecture]]
- [[capability-gap-filler-workflow]]
- [[capability-gapfill-via-agents-not-script]]
- [[capability-registry-harness]]
- [[cross-subject-special-components-shipped]]
- [[decoration-restraint-slim-to-bone]]
- [[lesson-build-workflow-draft]]
- [[pedagogy-quick-wins]]
- [[pipeline-slim-robustness-sprint]]
- [[primitive-visual-quality-initiative]]
- [[sound-asset-library-status]]
- [[teaching-action-vocabulary-gap]]

### Code anchors / blast radius (codegraph)

- `SPRING` (remotion-svg-primitives/src/motion-primitives/curves.ts:26) — 3 callers in `remotion-svg-primitives/src/lessons/legacy/ComparisonLessonScene.tsx`, `remotion-svg-primitives/src/lessons/legacy/MakeTenLessonScene.tsx`, `remotion-svg-primitives/src/motion-primitives/PopIn.tsx`; ⚠ no covering tests found
- `TopicIntroCard` (remotion-svg-primitives/src/lessons/transitions/TopicIntroCard.tsx:18) — 1 caller in `remotion-svg-primitives/src/lessons/transitions/index.ts`; ⚠ no covering tests found
- `glyphStrokesFor` (remotion-svg-primitives/src/motion-primitives/glyphStrokes.ts:777) — 9 callers in `remotion-svg-primitives/src/scenes/GlyphStrokeDataDemo.tsx`, `remotion-svg-primitives/src/scenes/GlyphStrokeWriterDemo.tsx`, `remotion-svg-primitives/src/component-gallery/demoProps.tsx`, `remotion-svg-primitives/src/motion-primitives/index.ts`; ⚠ no covering tests found

<sub>derived 2026-07-10 · arc=10 commits · files=9 · lessons=13</sub>
<!-- okf:auto-end -->
