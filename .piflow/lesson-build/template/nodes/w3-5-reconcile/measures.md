# w3-5-reconcile — MEASURES (runway proposal, per `piflow-overlord/references/building-measures.md`)

> DRAFT for human review. This is the measurement RUNWAY for **w3-5-reconcile**, authored via the method in
> `piflow-overlord/references/building-measures.md` (Part C, steps 1-8) so its runway passes COVERAGE · WIRING ·
> VALIDITY · GROUNDING (`measurement-runway.md`) before the optimize loop touches this node. The HARD checks are
> now WIRED into `node.json` `optimize.measure` (13 ops); the SOFT rubric is authored + wired at
> `nodes/w3-5-reconcile/criteria.md` (`optimize.criteria`). This file is the human-facing rationale/proposal
> record — same split as `game-omni/docs/measures/w0-measures.md` vs `nodes/w0-classify/criteria.md`.
>
> **Location note (owed to the orchestrator):** the game-omni precedent puts this file at repo-root
> `docs/measures/<node>-measures.md`. This lane's write-scope is confined to
> `.piflow/lesson-build/template/nodes/w3-5-reconcile/` (13 sibling agents run in parallel over this same
> template), so it lives here instead. Consolidate into a shared `docs/measures/` alongside the other 13 nodes'
> equivalents once the orchestrator merges all lanes.

---

## 1. What w3-5-reconcile is, and its LEVERAGE on the eventual lesson

**Core responsibility.** w3-5-reconcile reads the frozen per-cue audio truth
(`src/lessons/generated/<Camel>Clips.ts`, W3a's measured clips) and a per-cue motion-seconds budget it
transcribes from `visual-design.md`, and writes ONE artifact per lesson:
`src/lessons/<Camel>LessonTimeline.ts` — the reconciled cue windows (`cueFrames = max(narrationFrames +
gapFrames, motionFrames) + tail`, chained end-to-end) plus the throwing cue-id accessors every downstream scene
resolves frames through. It is the ONE place cue durations are decided, and every other wave (composer, sketch
overlay, render, verification) reads THIS module rather than re-deriving timing.

**Expected outcome.** A byte-identical-on-replay, deterministic timeline that faithfully encodes the design's
motion intent, never re-touches the frozen audio truth, and gives every downstream consumer a compile-time-safe
way to resolve a cue id to a frame (no silent `?? 0` fallback ever reaching production).

**Leverage on lesson quality (the seed sentence).** *A subtly-wrong-but-valid cue window silently caps or
starves a cue's motion for the rest of the pipeline — the composer trims flourishes to fit whatever window this
node decided, so an under-budgeted cue is permanently rushed and an over-budgeted one drags, and neither shows
up as an error anywhere downstream (the composer's own criteria explicitly forbid it from ever extending a
cue).* Unlike w0-classify (a creative routing decision), this node's core algorithm is FIXED by spec — its
leverage risk is narrower and concentrated almost entirely in ONE step: whether `VISUAL_MOTION_SECONDS` is a
FAITHFUL transcription of visual-design.md's own per-cue table. A transcription slip here is invisible to every
downstream node (the composer trusts this module completely, per its own criteria: "Honors the reconciled
timeline as-is").

**Ambiguity flagged.** This node's OWN prompt calls its algorithm "a TRIVIAL, deterministic chain" — and the
formula, chaining, and accessor shape genuinely ARE hard-gateable in full (§2 below). That is unusual for a
producing node and narrows this runway's soft half considerably: most of what would be a soft criterion
elsewhere (formula correctness, export shape, no-legacy-mechanism) is fully mechanical here. The soft rubric
(§3, and its wired form `criteria.md`) is deliberately SMALL — five criteria, not eight — because that is the
honest size of the judgment this node actually exercises.

---

## 2. HARD measures (the FLOOR — deterministic; wired into `optimize.measure`)

### 2a. REUSE — already computed, reaches triage with zero new config
| Signal | Source (anchor) | What it catches here |
|---|---|---|
| **digest anomalies** | `projectRunDigest` `observe/telemetry.ts:377` | `failed`/`tool-loop`/`cost-spike` etc. — the coarse, node-status-level signal. A `checks.post` BLOCKING failure surfaces here only as `failed` — no per-check detail, which is exactly why §2b mirrors the 5 existing `checks.post` checks into `optimize.measure` below (WIRING law). |
| **trace detectors** | `analyzeTraceFile` `substrate/trace-metrics.ts:277` | `thinkingStalls`/`toolLoops`/`truncatedLines` — over-think or repeat-probe confusion on a node that should be near-mechanical. |
| **blind-spot + READ-ONCE** | `piflowctl trace <run> w3-5-reconcile` | advertised-but-unread: this node's `readScope` includes the whole `src` tree + `out/<lessonId>` — did it actually read the Clips module and visual-design.md it depends on, or hallucinate values? |
| **verified status** | `deriveStatus` `observe/read.ts:62` | the two declared artifacts (LessonTimeline.ts, the tier-2 log) missing/empty → `blocked`, regardless of self-report. |
| **return-schema enforcement** | `node.json` `return` | `status` enum, required `outputArtifacts`/`pipelineFindings` — a free floor, not duplicated here. |
| **the animatic gate's own verdict** | `npm run lesson:animatic` (POST `run` op, already BLOCKING via `onFailure:"block"`) | the per-cue clip-fits-its-window verdict (`out/<lessonId>/<lessonId>-animatic.json`'s `verdict.pass`/`failingCues`/per-row `overrunFrames`/`underrunFrames`) — genuinely the sharpest existing hard signal for "did the reconcile actually produce workable windows," reused as-is. **Known gap (§5 open question):** its rich per-cue overrun/underrun NUMBERS are not yet folded as `graded` metrics into the measure report — see §5. |

### 2b. `optimize.measure` — 13 ops now WIRED into `node.json` (5 mirrored + 8 new)
`runSubstrateMeasure` (`packages/core/src/optimize/substrate/measure.ts:89-98`) reads ONLY the node's
`optimize.measure` op[] — it does **not** read `checks.post` at all. So a `checks.post` BLOCKING gate protects
the RUN but its individual verdict never reaches the triage measure report (only the coarse `failed` digest
anomaly does). This is a genuine WIRING gap the runway pre-flight names — closed by mirroring:

| id | mirrors / new | what it catches |
|---|---|---|
| `reconcile-call-present` | mirrors existing `checks.post` | `reconcileClipTimeline(` called |
| `cue-accessors-call-present` | mirrors existing `checks.post` | `makeCueAccessors(` called |
| `no-legacy-timing-mechanisms` | mirrors existing `checks.post` | no `PADDED_CUE_DURATIONS_FRAMES`/detect-silence/`ASR_CORRECTIONS` |
| `no-silent-cue-fallback` | mirrors existing `checks.post` | no `?? 0` fallback |
| `timeline-non-empty` | mirrors existing `checks.post` | artifact not empty |
| `motion-budget-not-index-signature` | **NEW** | `VISUAL_MOTION_SECONDS` is NOT typed `Record<string, number>` — an index-signature type ERASES the literal cue-id keys, silently disabling the whole `keyof typeof` compile-time safety net prompt.md line 22 mandates. Grounded in a REAL historical drift (§4). |
| `motion-budget-as-const` | **NEW** | the budget map IS declared `as const` per prompt.md line 21/26. |
| `frozen-clip-crosscheck-present` | **NEW** | `FROZEN_CLIP_IDS` (the other-direction cross-check — a stale/renamed budget id throws) is present; `reconcileClipTimeline` only throws the OTHER direction (a clip with no budget). |
| `export-cues-present` / `export-duration-present` / `export-voiceclips-present` / `export-captioncues-present` / `export-cueaccessors-present` | **NEW** (5 ops) | each of the FIVE required exports (prompt.md lines 27-31) that w4a-composer/w4b-sketch import BY NAME exists — a missing one is a downstream TS compile break several nodes later; catching it HERE is strictly cheaper. |

**Honestly NOT hard (left to the soft judge, §3):** whether `VISUAL_MOTION_SECONDS`'s VALUES faithfully match
visual-design.md's per-cue table (visual-design.md is free-form markdown with an embedded table, not a
JSON/schema surface a deterministic check can diff against without a bespoke parser I have no scope to add —
see §5); whether a folded-into-a-gap row was correctly identified and omitted vs. silently dropped; whether the
comprehension-floor advisory was honestly computed; whether the tier-2 log is a genuinely auditable trace.

### 2c. Scope fence note (why no new script/parser was added)
Two of the checks above (`motion-budget-not-index-signature`/`-as-const`) were the highest-value NEW additions
this pass surfaced, grounded in a REAL historical artifact (§4) rather than a hypothetical. A tempting further
hard measure — mechanically diffing `VISUAL_MOTION_SECONDS`'s values against visual-design.md's motion-budget
TABLE — was considered and DECLINED for two reasons: (1) it would need a markdown-table parser, i.e. a new
script under `remotion-svg-primitives/scripts/`, which is outside this lane's write-scope
(`.piflow/lesson-build/template/nodes/w3-5-reconcile/` only — 13 sibling agents run in parallel over the same
template); (2) even with a parser, the "did a design row get correctly folded into a gap vs. silently dropped"
judgment call is not a pure diff — it requires reading whether the row's beat maps to an actual typed `gap` on
the frozen ClipCue, which is exactly the kind of relational judgment §3's C1/C3 exist for. Flagged as an open
question for the human in §5.

---

## 3. SOFT measures (the CEILING) — see `nodes/w3-5-reconcile/criteria.md` for the full wired rubric

Full checklist + the five graded criteria (C1 motion-budget fidelity, C2 frozen-input discipline, C3 silent-drop
discipline, C4 comprehension-floor honesty, C5 auditable tier-2 log) + gold/red-flag exemplars live in
`criteria.md` (not duplicated here to avoid a three-way sync burden with `.agents/skill-system-criteria.md`,
which already carries this node's canonical Purpose/Acceptance-criteria/Red-flags — `criteria.md` is a working
copy of THAT, per the same "reuse over re-mint" move `w4a-composer/criteria.md` made). Summary:

- **C1 (Required, top leverage)** — every `VISUAL_MOTION_SECONDS` value traces to visual-design.md's own
  per-cue table (quoted both sides); a folded-into-a-gap row is correctly omitted, not silently dropped.
- **C2 (Required)** — narrationFrames/gapFrames/tokenOnsets are read verbatim off the frozen Clips module,
  never locally adjusted.
- **C3 (Required)** — any non-obvious budget/clip mapping judgment call is surfaced in `pipelineFindings`.
- **C4 (Aspirational)** — the comprehension-floor advisory is honestly computed against the exposures ledger,
  with a quoted justification, not rubber-stamped.
- **C5 (Aspirational)** — the tier-2 log carries a genuinely auditable per-cue reconcile-math table.

---

## 4. VALIDITY — replaying a KNOWN-BAD artifact to confirm the measures FIRE and DISCRIMINATE

Per the runway pre-flight (do not trust an unfired measure): `_prior-runs/kptest-fenyuhe-six/pre-suffix-20260612/
kptestFenyuheSixLessonTimeline.ts` is a REAL historical artifact predating commit `c487c5e` (2026-07-03,
"W3.5 emits the cue-id-union + throwing-accessor timeline pattern") — the exact commit that introduced the
invariants `motion-budget-not-index-signature`/`-as-const`/`frozen-clip-crosscheck-present`/
`export-cueaccessors-present` now guard. Confirmed by direct inspection (not asserted):
- `VISUAL_MOTION_SECONDS: Record<string, number> = {...}` → WOULD FAIL `motion-budget-not-index-signature`
  (hits) and `motion-budget-as-const` (no `as const` present).
- No `FROZEN_CLIP_IDS`, no `makeCueAccessors` call, no `CueAccessors`/`CueId`/`_CUE_IDS` export anywhere → WOULD
  FAIL `frozen-clip-crosscheck-present` and `export-cueaccessors-present`.
- `reconcileClipTimeline(` IS present, and none of the banned legacy strings appear → correctly PASSES the 5
  mirrored checks — proving the new checks discriminate a DIFFERENT failure mode than the existing ones, not a
  redundant re-test of the same thing.

**Interesting live finding (not a fabricated defect, not filed as an issue — see `memory.md` Open threads):**
the CURRENT on-disk `remotion-svg-primitives/src/lessons/kptestFenyuheSixLessonTimeline.ts` (as of this
writing, post-`c487c5e`) still shows the SAME `Record<string, number>` pattern with no throwing accessors — it
has not been regenerated since the spec upgrade. A future `piflowctl optimize triage --node w3-5-reconcile`
pass (or a manual re-run of this node for that lesson) would be expected to surface this for real; recorded here
so the finding isn't lost, not hand-authored as an Issue (see `memory.md`'s note on why `issues/` is left
unpopulated).

The soft side's VALIDITY (does C1 actually discriminate a plausible-but-wrong number?) could not be replayed the
same way — it needs a live judge turn over a deliberately-mistranscribed budget map, which is `piflow-triage`'s
job at first real use, not something this pass can execute without spawning that agent.

---

## 5. Open questions for the human
- Should the animatic sidecar's per-cue `overrunFrames`/`underrunFrames` (§2a) be folded into `optimize.measure`
  as a GRADED numeric metric? Doing so today would need a `run`-bodied op that re-invokes (or cheaply
  re-extracts) the sidecar, which means a new script file under `remotion-svg-primitives/scripts/` — outside
  this lane's write-scope. Worth a follow-up pass with wider scope, or a small inline `node -e` extractor if the
  orchestrator prefers no new script file.
- `motion-budget-not-index-signature`/`-as-const`/`frozen-clip-crosscheck-present`/`export-*-present` are
  currently NON-BLOCKING (measure-only). Given they guard a REAL historical regression class, are they mature
  enough to also promote into `checks.post` (blocking) once live-fired at least once? (Deliberately NOT done in
  this pass — promoting to blocking changes RUN behavior, a bigger step than "prepare the runway.")
- The C1 motion-budget-fidelity soft criterion is this node's single highest-leverage judgment call, but
  visual-design.md's per-cue table format is not perfectly uniform across all 14+ existing lesson-data
  directories (checked kptest-count-to-two only). Confirm the table's `| cue | discovery ref | visualMotionSeconds
  | motion intent |` shape (or an equivalent) is the actual convention w2a-visual-design's own criteria/prompt
  enforces, so `criteria.md`'s C1 anchors on a format that will not itself drift.
