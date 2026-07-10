---
type: subsystem
key: primitive-registry
title: Primitive registry (code-as-truth build + agent-facing catalog digest)
description: How w3b-primitive-build's new SVG primitives get derived into the registry from the shape-primitives barrel (never hand-edited) and rendered into catalog-digest.md, the sole authoritative primitive inventory every other node's prompt cites.
resource: remotion-svg-primitives/src/capabilities/schema.ts
aliases: [registry, catalog-digest, primitive-registry.json, shape-primitives, w3b-primitive-build]
seeds: [remotion-svg-primitives/src/capabilities/schema.ts, remotion-svg-primitives/src/capabilities/primitive-registry.json, remotion-svg-primitives/scripts/registry/build-registry.mjs, remotion-svg-primitives/scripts/registry/catalog-digest.mjs, remotion-svg-primitives/src/shape-primitives/index.ts, remotion-svg-primitives/src/motion-primitives/index.ts, remotion-svg-primitives/scripts/registry/families.mjs, remotion-svg-primitives/scripts/registry/code-unions.mjs, remotion-svg-primitives/scripts/registry/check-lesson-primitives.mjs, remotion-svg-primitives/scripts/registry/drift-report.mjs, remotion-svg-primitives/scripts/registry/check-deprecated-refs.mjs, remotion-svg-primitives/scripts/registry/check-gallery.mjs, remotion-svg-primitives/scripts/registry/schema-check.mjs, remotion-svg-primitives/scripts/registry/build-icon-assets.mjs, remotion-svg-primitives/scripts/registry/build-recency.mjs, remotion-svg-primitives/scripts/registry/export-schema.mjs, remotion-svg-primitives/scripts/build-lesson-registry.mjs, remotion-svg-primitives/scripts/import-origin-icons.mjs]
symbols: [primitiveRegistrySchema, PrimitiveRegistry, buildPrimitives, MODULE_KIND, parseUnion, registryComponents, styleSourceFiles]
tags: [registry, primitives, catalog, w3b-primitive-build]
timestamp: 2026-07-09
---

# Why / how it works (the lifecycle, end to end)
`w3b-primitive-build` is the ONLY node allowed to add a new SVG primitive or reusable component. The registry is
CODE-AS-TRUTH: `build-registry.mjs`'s `buildPrimitives()` derives `component`/`kind`/`source`/`motionVocabulary`
from TWO barrels — `src/shape-primitives/index.ts` (raw SVG shapes) AND `src/motion-primitives/index.ts`
([[motion-primitives-library]]'s 18-component set; never hand-edited — `primitive-registry.json`'s own header
comment says so), validated against `schema.ts`'s `primitiveRegistrySchema` (a zod discriminated union); only
`intent`/`useWhen`/`avoidWhen`/`variants` are hand-authored prose carried forward by component id across
regenerations. `catalog-digest.mjs` then renders the registry into `catalog-digest.md`, the agent-facing
"visual menu" every OTHER node's prompt cites as the sole authoritative primitive inventory (never primitive
source, never a guess). `npm run registry:check` chains the FULL gate set, not just `build-registry.mjs`:
`build-icon-assets`→`build-registry`→`catalog-digest`→`export-schema` (each `--check`), then
`check-gallery.mjs` ([[component-gallery-preview]]'s drift gate), `check-deprecated-refs.mjs` (a deprecated
primitive must be uncitable), and `build-lesson-registry.mjs --check` (the SEPARATE lesson-composition registry
— `_lessonRegistry.generated.tsx`, which Root.tsx maps into `<Composition>` elements — riding the same gate
chain though it derives from `Complete*Lesson.tsx`'s `lessonComposition` marker, not the primitive barrels).
`families.mjs` (`MODULE_KIND`/`KIND_ORDER`) is the ONE shared family map `drift-report.mjs` and others read (a
2026-06-12 fix killed a second, drifting copy). `code-unions.mjs` is the shared TS-union parser several of
these scripts use to stay in sync with `schema.ts`'s discriminated union without re-parsing TS by hand.
`import-origin-icons.mjs` is the one-off importer feeding `build-icon-assets.mjs`'s icon source set.

# Anchors
SCHEMA
- `remotion-svg-primitives/src/capabilities/schema.ts:164` — `primitiveRegistrySchema` — the zod contract every registry entry must satisfy
- `remotion-svg-primitives/src/capabilities/schema.ts:68` — `primitiveSchema` — one primitive's discriminated-union shape
BUILD (code → registry, TWO barrels)
- `remotion-svg-primitives/scripts/registry/build-registry.mjs:103` — `buildPrimitives()` — derives component/kind/source/motionVocabulary from BOTH barrels, never hand-edited
- `remotion-svg-primitives/src/shape-primitives/index.ts:129` — `export { TeacherMark } from "./sketch"` — one shape-primitives barrel entry (representative)
- `remotion-svg-primitives/src/motion-primitives/index.ts:1` — `export { AbstractionLadder } from "./AbstractionLadder"` — the SECOND barrel build-registry.mjs scans ([[motion-primitives-library]] owns the components themselves)
DIGEST (registry → agent-facing menu)
- `remotion-svg-primitives/scripts/registry/catalog-digest.mjs:22` — `registryPath` — reads primitive-registry.json, renders catalog-digest.md (the "visual menu" every other node's prompt cites)
GATES (the full `registry:check` chain beyond build-registry itself)
- `remotion-svg-primitives/scripts/registry/families.mjs:14` — `MODULE_KIND` — the one shared family map (kills the 2026-06-12 second-copy drift)
- `remotion-svg-primitives/scripts/registry/code-unions.mjs:29` — `parseUnion` — shared TS discriminated-union parser other gate scripts reuse
- `remotion-svg-primitives/scripts/registry/check-lesson-primitives.mjs:43` — `registryComponents` — cross-checks a lesson's primitive usage against the registry
- `remotion-svg-primitives/scripts/registry/drift-report.mjs:233` — `styleSourceFiles` — part of the human-facing drift report
- `remotion-svg-primitives/scripts/build-lesson-registry.mjs:1` — the SEPARATE lesson-composition registry (`_lessonRegistry.generated.tsx`), riding the same `registry:check`/`registry:build` chain but deriving from `Complete*Lesson.tsx`'s opt-in `lessonComposition` marker, not the primitive barrels

# Freshness (anti-drift)
anchors ✓ (every line opened + confirmed) · scope = the seeds above · re-derive when they change · DRIFT NOTE:
this slice is the product-side twin of the SDK-generic `capability-registry-harness` skill — that skill
documents the PATTERN (code-as-truth, auto-detect, drift gate); this card anchors THIS repo's concrete instance.
`registry:check` (package.json) is the drift gate that must pass before w3b hands off to w4a. Seeds were
BROADENED 2026-07-09 to cover the full gate chain (previously only build-registry.mjs+catalog-digest.mjs were
seeded) — `check-deprecated-refs.mjs`/`check-gallery.mjs`/`schema-check.mjs`/`build-icon-assets.mjs`/
`build-recency.mjs`/`export-schema.mjs`/`import-origin-icons.mjs` are seed-tracked (HEALTH/existence) but not
individually anchored — each is a thin, single-purpose CLI script with no additional symbol worth citing beyond
what's already anchored above.

<!-- okf:auto-start -->
> _Auto-generated by `_generate.mjs` — do not hand-edit between the markers; re-run `--write`._

### Final state — file set (seeds)

| File | exists |
|---|---|
| `remotion-svg-primitives/src/capabilities/schema.ts` | ✓ |
| `remotion-svg-primitives/src/capabilities/primitive-registry.json` | ✓ |
| `remotion-svg-primitives/scripts/registry/build-registry.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/catalog-digest.mjs` | ✓ |
| `remotion-svg-primitives/src/shape-primitives/index.ts` | ✓ |
| `remotion-svg-primitives/src/motion-primitives/index.ts` | ✓ |
| `remotion-svg-primitives/scripts/registry/families.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/code-unions.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/check-lesson-primitives.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/drift-report.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/check-deprecated-refs.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/check-gallery.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/schema-check.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/build-icon-assets.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/build-recency.mjs` | ✓ |
| `remotion-svg-primitives/scripts/registry/export-schema.mjs` | ✓ |
| `remotion-svg-primitives/scripts/build-lesson-registry.mjs` | ✓ |
| `remotion-svg-primitives/scripts/import-origin-icons.mjs` | ✓ |

### Evolution arc

- `3ca1d9a` 2026-05-19 — feat: motion primitives (DrawPath, FollowPath, PopIn, PulseCircle, SparkleBurst)
- `9b9effb` 2026-05-19 — feat: shape primitives (counting, interaction, literacy) and demos
- `47953f9` 2026-05-29 — feat(motion): motion-primitives library
- `4603f20` 2026-05-29 — feat(lessons): new lessons, timelines, generated timing + primitives
- `b8c1125` 2026-06-03 — feat(registry): code-as-truth capability registry harness for SVG primitives
- `e91b1a9` 2026-06-03 — fix(registry): fail the gate on stranded shape-barrel exports
- `d9ee1a9` 2026-06-03 — feat(primitives): add RegionSplit fraction primitive + clarify hanzi-card prose
- `d86cd7f` 2026-06-03 — feat(primitives): add PlaceValueMat + ConservationBundle (counting family)
- `3270995` 2026-06-03 — feat(primitives): add UnmatchedSlot + getPairedColumnPlacement (interaction)
- `7ace2a7` 2026-06-03 — feat(primitives): add PitchPlayhead + ListenIcon (literacy family)
- `1f0bc19` 2026-06-03 — feat(assets): generate→trace asset track — IconAsset + first asset
- `f35959f` 2026-06-03 — feat(assets): AssetMorph magic-transition + share 68-icon origin library
- `aad4203` 2026-06-03 — feat: ConservationMorphBundle + 5 curriculum-driven capabilities; wire morph into wrap lesson
- `ca0d5e8` 2026-06-04 — feat(capabilities): 6 curriculum-driven special components for Math/Chinese/English §1.1–1.5
- `489aa9a` 2026-06-04 — feat(gallery): newest-first component gallery + asset sheet + self-completing gate
- `c691486` 2026-06-04 — feat(quality): real SVG hand in pointer-hand-arrow + deprecation/legacy mechanism
- `a3bc85e` 2026-06-08 — feat(capabilities): LessonIntroCard primitive + girl-face asset + gallery demos
- `130c009` 2026-06-09 — feat(lessons): auto-discover lesson registration (kill the shared-file merge surface)
- `215a020` 2026-06-09 — skillsys(lesson-build,registry): condense node context — lean-artifact law + discipline shrink + lean catalog-digest
- `0ec94bb` 2026-06-10 — skillsys(lesson-build,registry): gate every lesson-named component against the registry (kill phantom REUSE)
- `ca2ab54` 2026-06-10 — skillsys(registry): sweep lesson-media/styles/transitions into the registry — complete component universe
- `a019410` 2026-06-10 — skillsys(registry): RecapSpotlight — build+register the spaced-recall recap-stack primitive
- `0266ad8` 2026-06-11 — skillsys(primitive-builder): registry:check-lesson resolves bare-kebab citations + anti-vacuous guard (was a silent 0-citations pass) + mandate dual-form kebab-id (Component)
- `2df6085` 2026-06-12 — fix(registry): one shared family map (families.mjs) — kill the drift-report's own second-copy drift
- `437a08a` 2026-06-16 — feat(gallery+layout): honest true-size previews + auto-size-to-zone foundation
- `4f06be4` 2026-06-16 — skillsys(capability-registry-harness): a DEPRECATED capability is invisible to + unciteable by agents, from the ground start
- `79d5be5` 2026-06-20 — chore(registry): drop the meaningless 'experimental' status — all 27 working components are stable
- `fc67b78` 2026-07-01 — feat(primitive): add CardinalConsolidation cardinality-reveal primitive
- `4d879f9` 2026-07-03 — docs(capabilities): register fit-text capability
- `e0ca8ea` 2026-07-03 — feat(registry): derive lesson duration via calculateMetadata from <X>Cues
- `b22e194` 2026-07-03 — merge fix/lane-a-timing-truth: cue-id truth + W3a freeze gate + calculateMetadata (#2 #12 #5)

### Lessons — memory cluster

**Alias matches** (review — may include false positives):
- [[audio-kit-shared-architecture]]
- [[build-reusable-not-lesson-patches]]
- [[capability-gap-filler-workflow]]
- [[capability-gapfill-via-agents-not-script]]
- [[capability-preview-surface]]
- [[capability-registry-harness]]
- [[cross-subject-special-components-shipped]]
- [[hermes-self-improving-skill-system]]
- [[hermes-tracked-systems-registry]]
- [[pi-runner-watchdog-and-sandbox]]
- [[pipeline-slim-robustness-sprint]]
- [[primitive-visual-quality-initiative]]
- [[sound-asset-library-status]]
- [[teaching-action-vocabulary-gap]]
- [[transform-workflow-to-pi-skill]]
- [[worktree-isolation-and-auto-discovery]]

### Code anchors / blast radius (codegraph)

- `styleSourceFiles` (remotion-svg-primitives/scripts/registry/drift-report.mjs:233) — 1 caller in `remotion-svg-primitives/scripts/registry/drift-report.mjs`; ⚠ no covering tests found
- `buildPrimitives` (remotion-svg-primitives/scripts/registry/build-registry.mjs:103) — 1 caller in `remotion-svg-primitives/scripts/registry/build-registry.mjs`; ⚠ no covering tests found
- `registryComponents` (remotion-svg-primitives/scripts/registry/check-lesson-primitives.mjs:43) — 1 caller in `remotion-svg-primitives/scripts/registry/check-lesson-primitives.mjs`; ⚠ no covering tests found
- `parseUnion` (remotion-svg-primitives/scripts/registry/code-unions.mjs:29) — 1 caller in `remotion-svg-primitives/scripts/registry/drift-report.mjs`; ⚠ no covering tests found

<sub>derived 2026-07-10 · arc=31 commits · files=18 · lessons=16</sub>
<!-- okf:auto-end -->
