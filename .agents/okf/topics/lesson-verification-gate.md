---
type: subsystem
key: lesson-verification-gate
title: Lesson verification gate (lesson-check orchestrator + freeze/contact-sheet/critic/bbox toolchain)
description: How w6-verification's actual toolchain works — lesson-check.mjs orchestrates the static adoption lints, the contact sheet, and per-primitive checks; lesson-freeze-check.mjs guards W3a's frozen audio truth; lesson-critic-sheets.mjs + lesson-bbox-overlay.mjs are the two review surfaces a human/vision-critic reads before verification.md is written.
resource: remotion-svg-primitives/scripts/lesson-check.mjs
aliases: [lesson-check, freeze-check, contact-sheet, critic-sheets, bbox-overlay, w6-verification, lesson:check, lesson:freeze-check, lesson:contact-sheet, lesson:bbox]
seeds: [remotion-svg-primitives/scripts/lesson-check.mjs, remotion-svg-primitives/scripts/lesson-freeze-check.mjs, remotion-svg-primitives/scripts/make-contact-sheet.mjs, remotion-svg-primitives/scripts/lesson-critic-sheets.mjs, remotion-svg-primitives/scripts/lesson-bbox-overlay.mjs, remotion-svg-primitives/scripts/lesson-primitive-checks.mjs, remotion-svg-primitives/scripts/_padded-cues-extract.ts]
symbols: [main, runAdoptionLints, checkPropAdoption]
tags: [verification, lesson-check, freeze-check, contact-sheet, critic, bbox, w6-verification, w3a-voice-asr]
timestamp: 2026-07-09
---

# Why / how it works (the lifecycle, end to end)
`lesson-check.mjs`'s `main()` is the QC orchestrator `npm run lesson:check` runs: it always runs
`runAdoptionLints()` first (static source-level checks — e.g. is a primitive prop actually wired, not just
imported — printed via `printAdoptionLintResults`), then, given a `--config <pipeline.json>`, shells out to
`make-contact-sheet.mjs` (review artifacts first, so a later gate-fail still leaves them to inspect) and
`lesson-primitive-checks.mjs`, before finally invoking the MEASURED bbox pass (the true getBBox-vs-manifest
bijection gate — the render is the one source of truth, never a `bboxAt` mirror). `lesson-freeze-check.mjs` is
a separate, earlier gate that runs at the END of W3a: it treats the COMMITTED `<X>Clips.ts` as audio truth and
fails loudly on any per-cue-narrationFrames divergence between it, the freeze log, and any intermediate voice
JSON — the taint detector for an EPERM-partial write silently rolling one source forward without the others.
`make-contact-sheet.mjs` renders one dense mosaic (5 samples/cue, downscaled ~320px, for a human) PLUS full-res
`critique-frames/*.png`; `lesson-critic-sheets.mjs` re-packs those same native-res frames into large 3x3-tile
"stage" sheets sized for a vision-model critic (one sheet per 9 cues) since the human mosaic's downscaled tiles
are too small for a model to resolve overlaps. `lesson-bbox-overlay.mjs` is the companion review surface to
[[render-pipeline]]'s `lesson-measured.mjs`: it draws the SAME measured getBBox boxes onto the rendered frame
(solid = true footprint, red = undeclared/bijection-break) so a human can verify a collision claim by eye, not
just trust the number. `_padded-cues-extract.ts` is the shared `tsx`-subprocess helper (native-TS-stripper
workaround) both contact-sheet scripts use to resolve the reconciled cue window per cue.

# Anchors
ORCHESTRATOR (w6-verification)
- `remotion-svg-primitives/scripts/lesson-check.mjs:391` — `main` — runs adoption lints, then contact-sheet + primitive-checks + the measured bbox pass, in that order
- `remotion-svg-primitives/scripts/lesson-check.mjs:343` — `runAdoptionLints` — static source-level lint set (props actually wired, not just imported)
FREEZE GUARD (w3a-voice-asr, end-of-wave)
- `remotion-svg-primitives/scripts/lesson-freeze-check.mjs:117` — `main` — cross-artifact narrationFrames diff; treats committed `<X>Clips.ts` as truth, fails loudly on any divergence
REVIEW SURFACES (human + vision critic)
- `remotion-svg-primitives/scripts/make-contact-sheet.mjs:123` — `main` — dense human mosaic + full-res `critique-frames/*.png` sidecar
- `remotion-svg-primitives/scripts/lesson-critic-sheets.mjs:70` — `main` — repacks critique-frames into 3x3 large-tile stage sheets for the vision critic
- `remotion-svg-primitives/scripts/lesson-bbox-overlay.mjs:123` — `main` — draws measured getBBox boxes on the rendered frame (companion to [[render-pipeline]]'s lesson-measured.mjs)
SHARED HELPER
- `remotion-svg-primitives/scripts/_padded-cues-extract.ts:63` — `main` — tsx-subprocess cue-window resolver both contact-sheet scripts call

# Freshness (anti-drift)
anchors ✓ (every line opened + confirmed) · scope = the seeds above · re-derive when they change · DRIFT NOTE:
this is the FIRST card for w6-verification — none of the other 8 (pre-existing) cards touch this wave. The
measured bbox pass itself (getBBox-vs-manifest bijection, LUFS check) is [[render-pipeline]]'s `lesson-measured.mjs`
territory; this card owns the ORCHESTRATION + REVIEW-SURFACE layer wrapped around it, not the measurement math.
`lesson-primitive-checks.mjs` is seeded but not separately anchored — it is a thin per-primitive prop-check
runner `lesson-check.mjs` shells out to, no distinct symbol beyond its own `main`.

<!-- okf:auto-start -->
> _Auto-generated by `_generate.mjs` — do not hand-edit between the markers; re-run `--write`._

### Final state — file set (seeds)

| File | exists |
|---|---|
| `remotion-svg-primitives/scripts/lesson-check.mjs` | ✓ |
| `remotion-svg-primitives/scripts/lesson-freeze-check.mjs` | ✓ |
| `remotion-svg-primitives/scripts/make-contact-sheet.mjs` | ✓ |
| `remotion-svg-primitives/scripts/lesson-critic-sheets.mjs` | ✓ |
| `remotion-svg-primitives/scripts/lesson-bbox-overlay.mjs` | ✓ |
| `remotion-svg-primitives/scripts/lesson-primitive-checks.mjs` | ✓ |
| `remotion-svg-primitives/scripts/_padded-cues-extract.ts` | ✓ |

### Evolution arc

- `eec41f1` 2026-05-29 — chore(pipeline): lesson scripts + check/verification tooling
- `f36c5bb` 2026-06-08 — skillsys(audio): v4 cue-anchored audio — each cue owns its clip, killing continuous-WAV drift + the ellipsis drone
- `f52b3b1` 2026-06-11 — skillsys(lesson-build): animatic gate no-scene fallback — runs at W3.5 from the timeline module alone (was always-fails-fresh, rendering a W4-registered scene)
- `437a08a` 2026-06-16 — feat(gallery+layout): honest true-size previews + auto-size-to-zone foundation
- `75398c5` 2026-06-16 — feat(verification): true-footprint bbox overlay + binding gate; Node-24-proof lesson:check
- `38925e7` 2026-06-23 — refactor(check): measured pass is THE bbox check — delete the fast linear path
- `0fee1b6` 2026-06-23 — refactor(check): enforce metadata-only — drop bboxAt/keyFrames from the type + dead code
- `ea6208f` 2026-06-27 — fix(render): disable webpack persistent cache on every bundle (enableCaching:false)
- `a8ef1dc` 2026-07-03 — feat(voice): W3a freeze gate diffs the accepted log vs committed Clips.ts
- `b7ed0ae` 2026-07-03 — feat(check): add lesson-agnostic adoption lints for onset + zone-fit adoption
- `b22e194` 2026-07-03 — merge fix/lane-a-timing-truth: cue-id truth + W3a freeze gate + calculateMetadata (#2 #12 #5)

### Lessons — memory cluster

**Alias matches** (review — may include false positives):
- [[critic-layer-direction]]
- [[diagnose-root-cause-never-guess]]
- [[hermes-self-improving-skill-system]]
- [[lesson-build-workflow-draft]]
- [[piflow-lesson-build-port]]
- [[pipeline-slim-robustness-sprint]]
- [[teaching-action-vocabulary-gap]]
- [[validation-is-the-real-run-not-tests]]
- [[verification-gate-architecture]]
- [[videos-disposable-system-is-product]]
- [[vision-image-mcp]]

### Code anchors / blast radius (codegraph)

- `runAdoptionLints` (remotion-svg-primitives/scripts/lesson-check.mjs:343) — 1 caller in `remotion-svg-primitives/scripts/lesson-check.mjs`; ⚠ no covering tests found
- `checkPropAdoption` (remotion-svg-primitives/scripts/lesson-check.mjs:270) — 2 callers in `remotion-svg-primitives/scripts/lesson-check.mjs`; tests: `remotion-svg-primitives/scripts/lesson-check.test.mjs`
- `main` (.piflow/lesson-build/template/nodes/w3c-sound-asset/scripts/gap-scan-lint.mjs:66) — 1 caller in `.piflow/lesson-build/template/nodes/w3c-sound-asset/scripts/gap-scan-lint.mjs`; ⚠ no covering tests found
- `main` (.piflow/lesson-build/template/nodes/w2b-audio-captions/scripts/measure.mjs:180) — 1 caller in `.piflow/lesson-build/template/nodes/w2b-audio-captions/scripts/measure.mjs`; ⚠ no covering tests found
- `main` (remotion-svg-primitives/scripts/lesson-check.mjs:391) — 1 caller in `remotion-svg-primitives/scripts/lesson-check.mjs`; ⚠ no covering tests found

<sub>derived 2026-07-10 · arc=11 commits · files=7 · lessons=11</sub>
<!-- okf:auto-end -->
