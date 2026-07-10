---
type: subsystem
key: composer-scene-assembly
title: Composer scene assembly (layout + manifest + Scene + Complete-composition)
description: How w4a-composer assembles one lesson's final Remotion composition from the four per-lesson files sharing manifestTypes.ts's declared/measured contract — layout.ts geometry, manifest.ts metadata, LessonScene.tsx render tree, CompleteLesson.tsx top-level wrapper.
resource: remotion-svg-primitives/src/lessons/manifestTypes.ts
aliases: [composer, LessonScene, CompleteLesson, layout.ts, manifest.ts, LESSON_MANIFEST, w4a-composer]
seeds: [remotion-svg-primitives/src/lessons/manifestTypes.ts, remotion-svg-primitives/src/lessons/kptestCountToTwoLessonScene.tsx, remotion-svg-primitives/src/lessons/kptestCountToTwo/layout.ts, remotion-svg-primitives/src/lessons/kptestCountToTwo/manifest.ts, remotion-svg-primitives/src/lessons/CompleteKptestCountToTwoLesson.tsx, remotion-svg-primitives/src/layout/fitToZone.ts, remotion-svg-primitives/src/layout/fitText.ts]
symbols: [LessonManifest, ZoneName, LESSON_MANIFEST, KptestCountToTwoLessonScene, CompleteKptestCountToTwoLesson, fitUnitsToZone, fitTextBox]
tags: [composer, scene, layout, manifest, w4a-composer]
timestamp: 2026-07-09
---

# Why / how it works (the lifecycle, end to end)
`w4a-composer` assembles one lesson's final composition from four per-lesson files sharing one contract
(`manifestTypes.ts`): `layout.ts` declares pixel geometry (zones, safe areas, fit-to-zone math) driven ONLY by
frame math (never a raw literal — every frame reads off the reconciled cues via `cueAccessors`, every curve a
named EASE/SPRING); `manifest.ts` exports the metadata-only `LESSON_MANIFEST` (which elements are load-bearing +
their zone, NOT their geometry — the measured pass reads geometry back off the render, never mirrored in the
manifest, enforcing a declared⟺measured bijection); `<CamelId>LessonScene.tsx` is the actual React/Remotion
scene tree (rows, badges, cardinal displays) reading `layout.ts` constants + the reconciled cues;
`Complete<CamelId>Lesson.tsx` is the top-level composition wrapper that layers voiceover spans (from
cueAccessors) + SFX events (from `audio-cues.json`, feeding `LessonSfxLayer`) on top of the scene. Every lesson
repeats this four-file pattern.

# Anchors
CONTRACT
- `remotion-svg-primitives/src/lessons/manifestTypes.ts:32` — `LessonManifest` type — metadata-only manifest contract (declared elements + zone, not geometry)
- `remotion-svg-primitives/src/lessons/manifestTypes.ts:13` — `ZoneName` — the fixed zone vocabulary (objects/badges/tally/labels/caption/marks/decoration)
LAYOUT (per-lesson)
- `remotion-svg-primitives/src/lessons/kptestCountToTwo/layout.ts:20` — `CANVAS_WIDTH`/`CANVAS_HEIGHT` — canvas geometry constants
- `remotion-svg-primitives/src/lessons/kptestCountToTwo/layout.ts:68` — `APPLE_FIT` — `fitUnitsToZone()` result, the zone-fitting pattern every layout.ts follows
SHARED LAYOUT MATH (the fit-to-zone math the per-lesson layout.ts files above actually call)
- `remotion-svg-primitives/src/layout/fitToZone.ts:98` — `fitUnitsToZone` — the shared zone-fitting function every per-lesson `layout.ts` calls (previously uncited by this card)
- `remotion-svg-primitives/src/layout/fitText.ts:230` — `fitTextBox` — the shared text-fitting math (role floors, CJK-aware wrap) layout.ts also draws on
MANIFEST (per-lesson)
- `remotion-svg-primitives/src/lessons/kptestCountToTwo/manifest.ts:22` — `LESSON_MANIFEST` — this lesson's declared elements
SCENE (per-lesson)
- `remotion-svg-primitives/src/lessons/kptestCountToTwoLessonScene.tsx:249` — `KptestCountToTwoLessonScene` — the scene component
COMPOSITION (per-lesson)
- `remotion-svg-primitives/src/lessons/CompleteKptestCountToTwoLesson.tsx:113` — `CompleteKptestCountToTwoLesson` — top-level composition wrapper
- `remotion-svg-primitives/src/lessons/CompleteKptestCountToTwoLesson.tsx:52` — `cStart`/`cEnd` from cueAccessors — voiceover span placement
- `remotion-svg-primitives/src/lessons/CompleteKptestCountToTwoLesson.tsx:64` — `sfxEvents` — reads audio-cues.json into LessonSfxLayer events (→ [[sound-design-sfx]])

# Freshness (anti-drift)
anchors ✓ (every line opened + confirmed) · scope = the seeds above · re-derive when they change · DRIFT NOTE:
the four-file pattern (layout/manifest/Scene/Complete) is PER-LESSON generated code — kptestCountToTwo is cited
as the representative instance; a new lesson repeats the same shape under its own CamelId.
[[sketch-overlay-marks]] is layered into the Scene file too (`<TeacherMark>` components) but is authored/anchored
separately since it's W4b's contribution, not W4a's. Seeds BROADENED 2026-07-09 to add `src/layout/fitToZone.ts`
+ `fitText.ts` — the shared math this card's own prose already described ("fit-to-zone math") but never anchored;
these are generic, lesson-agnostic utilities (own `test:layout`/`test:fittext` npm scripts) every per-lesson
`layout.ts` calls into, not per-lesson code themselves.

<!-- okf:auto-start -->
> _Auto-generated by `_generate.mjs` — do not hand-edit between the markers; re-run `--write`._

### Final state — file set (seeds)

| File | exists |
|---|---|
| `remotion-svg-primitives/src/lessons/manifestTypes.ts` | ✓ |
| `remotion-svg-primitives/src/lessons/kptestCountToTwoLessonScene.tsx` | ✓ |
| `remotion-svg-primitives/src/lessons/kptestCountToTwo/layout.ts` | ✓ |
| `remotion-svg-primitives/src/lessons/kptestCountToTwo/manifest.ts` | ✓ |
| `remotion-svg-primitives/src/lessons/CompleteKptestCountToTwoLesson.tsx` | ✓ |
| `remotion-svg-primitives/src/layout/fitToZone.ts` | ✓ |
| `remotion-svg-primitives/src/layout/fitText.ts` | ✓ |

### Evolution arc

- `4603f20` 2026-05-29 — feat(lessons): new lessons, timelines, generated timing + primitives
- `bdc387f` 2026-06-12 — skillsys(measured-gate): collision exemptions are manifest-declared element-id pairs — the blanket objects:labels zone exemption is dead
- `437a08a` 2026-06-16 — feat(gallery+layout): honest true-size previews + auto-size-to-zone foundation
- `75398c5` 2026-06-16 — feat(verification): true-footprint bbox overlay + binding gate; Node-24-proof lesson:check
- `3941bd4` 2026-06-23 — refactor(lesson-check): single-source ALLOWED_OVERLAP_PAIRS
- `448884c` 2026-06-23 — refactor(check): measured pass is self-sufficient — derives opacity + bijection without bboxAt
- `0fee1b6` 2026-06-23 — refactor(check): enforce metadata-only — drop bboxAt/keyFrames from the type + dead code
- `3bfba64` 2026-07-01 — test(lesson): add kptest-count-to-two fixture from piflow template run
- `eb34d6d` 2026-07-03 — feat(layout): add fitText — CJK-aware measured text fitting with role-floor clamp
- `c25c4b6` 2026-07-03 — fix(lessons): adopt throwing cue accessors; re-key count-to-two to its 3-cue audio truth
- `8db6189` 2026-07-03 — fix(layout): default fitText's validateFontIsLoaded off — CJK false-positive
- `c7777c2` 2026-07-03 — fix(kptest-count-to-two): adopt fitUnitsToZone for APPLE_SIZE
- `dcefdad` 2026-07-03 — merge fix/lane-d-adoption-lints: onset + zone-fit adoption lints (#3 #14)
- `dc8fdfc` 2026-07-03 — feat(measured-gate): legibility gate — width-relative safe-area + per-role type floors (#4)
- `b22e194` 2026-07-03 — merge fix/lane-a-timing-truth: cue-id truth + W3a freeze gate + calculateMetadata (#2 #12 #5)
- `de706c5` 2026-07-03 — merge feat/lane-c-measured-gates: legibility + caption hard-kill measured gates (#4 #13)

### Lessons — memory cluster

**Alias matches** (review — may include false positives):
- [[audio-kit-shared-architecture]]
- [[build-reusable-not-lesson-patches]]
- [[cross-subject-special-components-shipped]]
- [[decoration-restraint-slim-to-bone]]
- [[diagnose-root-cause-never-guess]]
- [[generic-mechanisms-go-in-sdk]]
- [[lesson-build-workflow-draft]]
- [[pi-runner-node22-and-minimax-flags]]
- [[pi-runner-watchdog-and-sandbox]]
- [[piflow-lesson-build-port]]
- [[pipeline-slim-robustness-sprint]]
- [[primitive-visual-quality-initiative]]
- [[verification-gate-architecture]]
- [[worktree-isolation-and-auto-discovery]]

### Code anchors / blast radius (codegraph)

- `LessonManifest` (remotion-svg-primitives/src/lessons/manifestTypes.ts:32) — 12 callers in `remotion-svg-primitives/src/lessons/kp2CountingByTens/manifest.ts`, `remotion-svg-primitives/src/lessons/kptestCompareMoreFewer/manifest.ts`, `remotion-svg-primitives/src/lessons/kptestCountToTwo/manifest.ts`, `remotion-svg-primitives/src/lessons/kptestFenyuheSix/manifest.ts` +2 more; ⚠ no covering tests found
- `KptestCountToTwoLessonScene` (remotion-svg-primitives/src/lessons/kptestCountToTwoLessonScene.tsx:251) — 2 callers in `remotion-svg-primitives/src/lessons/CompleteKptestCountToTwoLesson.tsx`; ⚠ no covering tests found

<sub>derived 2026-07-10 · arc=16 commits · files=7 · lessons=14</sub>
<!-- okf:auto-end -->
