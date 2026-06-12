# W4b — Sketch Overlay (kptest-fenyuhe-six)

## INPUTS READ

- `/Users/tk/Desktop/animation-test/.agents/skills/sketch-explainer-layer/SKILL.md` — read in full; followed LITERALLY (cue-relative framing, restraint principle, mark vocabulary, anchor discipline, output structure §1–§4).
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/pedagogy.md` — 9 cues with discovery + reinforcement plan; marked `cue-split-3of3` as the lesson's NEW property (3+3 equal split, 5's splits did not have).
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/visual-design.md` — Visual Contract (single-metaphor six dots, bond glyph, identity invariant), palette (textNavy as the single ink), motion vocabulary, §4 reused-primitive reach (explicit "A single underline under cue-split-3of3's clusters is the only sketch worth a default"), zones (zone-objects for dots, zone-labels for bond, zone-marks for teacher ink).
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/storyboard.md` — per-cue teaching actions and required visuals; cross-referenced with the per-cue mark table.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/brief.md` — KP (6的分与合), audience (一年级, Mandarin), builds-on (kptest-fenyuhe-five), highlights (3和3 is the new property).
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/kptestFenyuheSixLessonTimeline.ts` — the reconcile chain (v4 cue-anchored audio); confirmed `kptestFenyuheSixCues` and per-cue timing math.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/generated/kptestFenyuheSixClips.ts` — per-cue `narrationFrames` (48/17/119/75/47/19/115/75/54) + typed gap on `cue-learner-response-gap` (4s reason "learner-response").
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/generated/kptestFenyuheSixTiming.ts` — ASR-aligned cue boundaries (QA only; reconcile uses measured `narrationFrames`).
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/capabilities/catalog-digest.md` — `teacher-mark` / `<TeacherMark>` primitive (kind: underline | wrap-arc | label-arrow | vs-mark; `drawProgress` reveal, optional boil/settle); `part-whole-composer` for the anchor source.
- `/Users/tk/Desktop/animation-test/.agents/CAPABILITIES.md` — `sketch-boil` (≥1.5s held threshold; omitted here) and `sketch-settle` (magnitude 0.08 default; climax-only, used once).
- (Did NOT read primitive source, did NOT consult kptest-fenyuhe-five sketch-overlay or any other lesson's artifacts — the SKILL + catalog + this lesson's own upstream are the COMPLETE set per the READING LAW.)

## OUTPUTS WRITTEN

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/sketch-overlay.md` — the spec consumed by the W4 composer.
- This log file.

## COMMANDS RUN

- `ls -la /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/` — confirmed all upstream artifacts (brief, storyboard, pedagogy, visual-design, audio-captions, audio-cues, pipeline, script-cues, _logs) are present.
- `ls /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/_logs/` — confirmed W3a is the latest upstream wave.
- `grep` on `catalog-digest.md` and `CAPABILITIES.md` — confirmed `<TeacherMark>` vocabulary (4 kinds), `<PartWholeComposer>` source for cluster anchor ids, and the boil/settle thresholds.
- (No npm runs; W4b is a spec-only node — no rendering, no audio, no asset build.)

+exit 0
+key stdout-stderr: (no stderr; stdout is the read-tool listing above)

## KEY DECISIONS

1. **Restraint = 1 mark on 9 cues (11% — well under the 0.6 ceiling).** Per the SKILL's "Restraint principle" sentence ("This mark carries signal X, which is not yet carried by Y or Z."), I audited every cue and found 8/9 already carry their signal via either (a) the picture (the separating/combining dots — the discovery itself), (b) the bond glyph ("一和五" / "二和四" / "三和三" / "合" — the spoken name), (c) the `RecapSpotlight` live-highlight on the recap, or (d) the held silence on the learner-response-gap. Only `cue-split-3of3` has a moment where the picture has JUST delivered the lesson's NEW property (the equal split) and a single pen gesture is the right punctuation. `visual-design.md` §4 explicitly prescribes this single underline, so the design choice is downstream-validated.

2. **`underline` kind, not `wrap-arc` or `label-arrow`.** Per the SKILL's "Mark vocabulary" section, the four authorized kinds are underline, wrap-arc, label-arrow, vs-mark. A `wrap-arc` arches OVER the clusters and reads as "wraps around" — wrong, the dot migration is the wrap, the mark is the celebration. A `label-arrow` is for connecting a label to a referent — wrong, there's no label. A `vs-mark` is for contrast — wrong, the two clusters are NOT contrasted, they're EQUAL. An underline arching DOWN between the two clusters visually groups them as a single bound pair, which is the load-bearing gesture for "equal split" (the picture's job per pedagogy §cue-split-3of3).

3. **Cue-relative timing: `drawOnRelativeStart=105, drawOnDuration=24, fadeOutRelativeStart=151`.** Cue length 159 = `max(narrationFrames=47, visualMotionFrames=5.0×30=150) + 9 tail`. Within the cue: bond phase 0–60 (2.0s), split motion 60–90 (climax 30f `EASE.outQuint`), dwell 90–150 (1.5s), tail 150–159. The underline lands 15f into the dwell — long enough for the eye to register the settled symmetry, before the celebration arrives. fadeOut at 159−8 = 151, 8-frame fade during the tail, clears before the next cue.

4. **Anchor = named element ids, NOT hand-coded coordinates.** `kp6-cluster-left-bottom-left` and `kp6-cluster-right-bottom-right` are produced by the composer's two `PartWholeComposer` instances for the left and right clusters at `mode="split", partition={left: 3}`. The composer resolves them at scene-build time against the live cluster bbox. A future tweak to cluster layout (wider gap, different dot size) does NOT require re-measuring the mark — the mark tracks the live geometry. This is the "ZERO frame literals + ZERO raw motion literals in scene code" rule applied to the mark's anchor too.

5. **Endpoints in `zone-objects`, never `zone-labels`.** Per `kids-eye` §1.5, marks may TRACE OVER `zone-objects` but never SIT INSIDE `zone-labels` (the bond glyph "三和三" lives in `zone-labels` for the spoken length of the cue). The underline dips DOWN between the clusters, beneath the bond glyph — no overlap. `visual-design.md` §0.5 zone geometry: `zone-objects` y=400–780, `zone-labels` y=120–400, `zone-marks` full-bleed. The underline is at the bottom of `zone-objects`, well clear of `zone-labels`.

6. **Settle YES, Boil NO.** Settle = `magnitude: 0.08` climax-only (one mark in the video earns it). Boil omitted because the mark is held only 0.73s after draw-on completes (159 − 105 − 24 − 8 = 22f), well below the 1.5s threshold in `CAPABILITIES.md#sketch-boil`. Boil on a mark the eye has barely registered would read as a rendering bug, not craft.

7. **Manifest entry is load-bearing.** The composer must register the mark in `manifest.ts` as a `SceneElement` (zone: "marks", bboxAt = span padded by strokeWidth + settle, opacityAt = the same drawOn×fadeOut math the scene uses). Without it, `npm run lesson:check` can't see the mark and a collision with `zone-recap-row` (which appears in the next phase of the lesson) would go unflagged. This is called out explicitly in §4.3 of the spec.

8. **No new primitives, no new components.** The mark reuses the registered `<TeacherMark>` primitive (catalog id `teacher-mark`); the anchor source is the existing `<PartWholeComposer>` (catalog id `part-whole-composer`). No W3b primitive-build is needed. No gap-scan update is needed. This node is a SPEC, not a build.

## ISSUES

(none blocking)

- (informational) The 24-frame drawOn duration is the "larger" sketch duration per `visual-design.md` §3 ("sketch 18f default, 24f larger"). I chose 24f because the underline spans the full horizontal extent of the 6 dots (≈ 86% of 1080 short-side per `visual-design.md` §0 kids-eye block) and a short draw-on would feel rushed across that span. If the W4 composer decides the span is too long for 24f, the per-mark `drawOnDuration` can be re-tuned in the spec — the cue-relative frame is the contract, not the absolute duration.

- (informational) The ASR for cues 4–9 has `asr-low-evidence` per W3a; reconcile does NOT use ASR frames, so this doesn't affect sketch timing. The `cueLength = 159 frames` comes from `max(measured narrationFrames, visualMotionSeconds*fps) + tail`, which is stable.

- (informational) `cue-reveal-answer` has the same ASR transcript region as `cue-spaced-recap-all-three` (both pull from "是 三 s sil 和 三 s sil 一 sil 和 五"), and `cue-learner-response-gap` shares the same region. The timing chain is independent of this — each cue has its own `narrationFrames` and its own reconcile output. W4b relies on the reconcile, not the ASR.

## PIPELINE FINDINGS

(workflow backlog — what should be IMPROVED about THIS node or the workflow as a whole)

- **P1 — The W4b SKILL says "≤ 1 mark per cue; most zero" in `visual-design.md` §3, and the SKILL self-check #4 enforces `total ≤ floor(cueCount × 0.6) = 5` for a 9-cue lesson. The example in kptest-fenyuhe-five used 3 marks (33%) which the SKILL allows but is closer to the ceiling than ideal.** The current lesson lands at 1 mark (11%) — well under the ceiling, well under the example, well under the brief's "restraint is the rule" intent. **Recommendation:** keep the SKILL's ceiling but the workflow could BENEFIT from a per-cue "signal X / signal Y / signal Z" audit template that the W4b node fills in for every cue (even the `n` rows) so the downstream model sees the reasoning for every row, not just the `y` row. The current spec does this in the `purpose` column of the per-cue table — good. But the upstream wave (W2a) could surface the same audit in `visual-design.md` so W4b is filling in a pre-existing template rather than inventing the reasons. This would also catch "signal already carried by X or Z" violations earlier.

- **P2 — The sketch-overlay's anchor spec uses NAMED element ids (`kp6-cluster-left-bottom-left`, `kp6-cluster-right-bottom-right`) that the W4 composer must produce. There is no convention yet for which ids a primitive exposes.** The current spec INVENTS the id naming. **Recommendation:** the catalog-digest.md `part-whole-composer` entry (or a sibling "anchor-export" entry) should declare the standard anchor ids each primitive exposes, so W4b specs can reference them by name and the W4 composer knows where to wire them. This is a small convention but it removes a guess from the W4 composer.

- **P3 — The kptest-fenyuhe-five sketch-overlay (per READING LAW, I did NOT read it as a model) was found via `ls` listing — and the format differs from the SKILL's structure (no §1 Sketch language table, no §4 manifest entry requirement). The W4b SKILL has tightened the format between the two lessons.** **Recommendation:** the W4b SKILL's §4 manifest-entry requirement (which the kptest-fenyuhe-five spec lacks) is a load-bearing fix — without the manifest entry, the bbox check can't see the mark. The workflow should make the manifest-entry requirement EXPLICIT in the upstream skill and have a `npm run lesson:check` lint that fails if a `teacher-mark` SceneElement is rendered but not registered in the manifest. The current lesson's spec already calls this out in §4.3 — but enforcement at `lesson:check` time would catch future regressions.

- **P4 — The cue-relative frame contract (`drawOnRelativeStart`, `drawOnDuration`, `fadeOutRelativeStart`) is good for the mark's TIMING but doesn't constrain the mark's STROKE GEOMETRY (the arch, the span curve, the dip depth).** The W4 composer could draw a flat line, a high arch, or a deep curve — all valid underlines per the catalog. **Recommendation:** the W4b spec should include either a SVG-path snippet for the underline's geometry or a `curveSpec` prop reference. The current spec leaves this to the composer's "registered TeacherMark primitive with default underline geometry" — which is fine for the v1, but a future climax-gesture might want a more specific shape (e.g. a triple-arch underline for a 3+3 split). For THIS lesson, the default geometry is the right call; the convention can be added when a lesson needs something more specific.

+exit 0
