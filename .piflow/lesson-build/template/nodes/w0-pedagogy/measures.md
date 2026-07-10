# w0-pedagogy — MEASURES (the runway build: hard + soft, wired)

> Authored via the method in `piflow-overlord/references/building-measures.md`. This is the reasoning + wiring
> record; the operational judge-facing fixture it produces is `criteria.md` (pointed to from `node.json`
> `optimize.judge`), and the operational hard gates it produces are already wired into `node.json`
> `optimize.measure`. Read `criteria.md` for the soft rubric itself — it is not repeated here.

## 1. What w0-pedagogy is, and its LEVERAGE on the eventual lesson

**Core responsibility.** w0-pedagogy is the FIRST node in `lesson-build` (deps: `setup-scaffold` only). It
reads one lesson's `brief.md` and writes `pedagogy.md`: a one-line `lesson kind:` header plus, per cue, four
lines in fixed order — `discovery` / `stage` / `focal` / `reinforcement` — per
`.agents/skills/lesson-pedagogy/SKILL.md` §10's Wave-0 output contract. It touches no code, no primitives, no
timing — pure pedagogy reasoning. Every downstream wave (storyboard, visual-design, audio-captions, composer)
"refuses to advance" without it (prompt.md) and builds its own artifacts by directly quoting or re-deriving from
`pedagogy.md`'s discovery sentences.

**Expected outcome.** A discovery spine that names, per beat, the ONE thing a child leaves knowing, at the right
cognitive stage, with a reinforcement plan proportional to how hard that thing actually is to learn — so
storyboard can allocate cues, visual-design can pick a focal element per beat, and audio-captions can phrase
narration that prepares rather than delivers.

**Leverage on lesson quality (the one sentence that seeds every soft criterion).** *A subtly wrong-but-valid
pedagogy plan — a mislabeled lesson kind, a discovery that is really narration, a stage reached too early, an
unreasoned or templated reinforcement plan, a starved co-equal routine, a fragmentary retrieval — is invisible
to a "did it produce a well-formed artifact" check, and every later wave then builds elaborate, technically
polished scenes around the WRONG teaching object; the finished video can render cleanly and still teach the
wrong thing, or nothing, with no way to recover short of redoing the whole pipeline.* This is not hypothetical:
see §4 below — it happened once for real, and the fix is now a standing lesson in `memory.md`.

**Ambiguity flagged (not papered over).** Like a first node in any pipeline, w0-pedagogy's soft scores are
*forecasts* of a video this node never renders or sees — confirmed only downstream. State that when reporting
scores (Law 5, leverage-not-locality); it is inherent to being first, not a defect in the measure.

---

## 2. HARD measures (the FLOOR — deterministic, reused where possible; 6 thin wrappers proposed + wired)

The floor: *is the artifact structurally complete, honestly self-contained (no leaked self-audit), and did
w0-pedagogy produce it cleanly (no over-think, no blind read)?*

### 2a. REUSE — already computed, already reaches triage, zero new SDK code
The optimize substrate's `runNodeMeasure` (`packages/core/src/optimize/substrate/measure.ts:111`) folds these
into `<runDir>/optimize/substrate/measure.w0-pedagogy.json`, which the judge/triage reads:

| Signal | Source (anchor) | What it catches for w0-pedagogy |
|---|---|---|
| **digest anomalies** | `projectRunDigest` `observe/telemetry.ts:377`; kinds `telemetry.ts:41` | `mega-think`/`slow` catch a stalled pure-reasoning turn; `tool-loop`/`loop-score` a repeated read; `cost-spike` a token blow-up on a node whose target output is ≤8k chars (prompt.md). |
| **trace detectors** | `analyzeTraceFile` `substrate/trace-metrics.ts:277` → `TraceMetricsReport:79` | `thinkingStalls`, `toolLoops`, `truncatedLines` — raw spans of the same anomalies above. |
| **blind-spot + READ-ONCE** | `piflowctl trace <run> w0-pedagogy` | **advertised-but-unread**: this node's ONLY declared input is `brief.md` (`inject`); a `pedagogy.md` produced without evidence of reading it is a deterministic red flag. **re-reads**: this node has no `bash`/`ls` tool, so a re-read would show up as a repeated `read` on the same path. |
| **verified status** | `deriveStatus` `observe/read.ts:62` | `pedagogy.md` missing/empty on a clean exit → downgraded to `blocked` — already the workflow's own `checks.post` `non-empty`, restated here as the same floor the optimizer reads too. |
| **return-schema enforcement** | `node.json` `return` | `status` enum, `outputArtifacts`/`summary`/`pipelineFindings` required, types enforced — a FREE floor, not duplicated below. |

Agent-facing reads of the same data (no new code): `piflowctl telemetry <run> w0-pedagogy` (tokens · ctx% · call
counts · anomalies · per-turn table) and `piflowctl trace <run> w0-pedagogy` (element tree + blind-spot rollup).

### 2b. THIN NEW WRAPPERS — 6 ops WIRED into `node.json` `optimize.measure` (config, not SDK code)
`pedagogy.md` is markdown prose, not JSON, so the only usable `CHECK_KINDS` (`packages/core/src/checks.ts`) are
`regex-present`/`regex-absent` — a single-argument `new RegExp(String(param))`, **no flags**: every pattern
below is written without `^`/`$`/`(?i)`/`(?m)` (none of which the real predicate can honor), matching the exact
lowercase field vocabulary SKILL.md's Wave-0 output template mandates.

1. **`lesson-kind-header-present`** (`regex-present`, `"lesson kind:\\s*\\S"`) — the mandatory header exists at
   all. Presence only; correctness is soft (`criteria.md` C1).
2–4. **`discovery-field-present` / `stage-field-present` / `focal-field-present` / `reinforcement-field-present`**
   (`regex-present`, one per field name) — the four-line cue vocabulary appears at all somewhere in the doc.
   **Honest gap:** these prove existence, NOT that every cue carries all four in 1:1 balance — no `CHECK_KINDS`
   entry can count/compare occurrences today (would need a new `regex-count`/`balanced-count` kind — FOLLOW-ON,
   not built here per the "propose, don't invent a function" law).
5. **`no-self-audit-leakage`** (`regex-absent`, `"[Aa]udit checklist|[Ss]elf-check|[Ss]elf-audit|✓|\\[[ xX]\\]"`)
   — catches prompt.md's own named anti-pattern (self-audit prose belongs in the structured return + tier-2
   log, never inside the artifact). **VALIDATED against a real known-bad file**: fires true on
   `_prior-runs/kptest-fenyuhe-six/pedagogy.PRE-FIX.md` (a literal `## Audit checklist`, 9 numbered items) and
   false (passes) on the real fixed gold — a genuine FIRE + DISCRIMINATE proof, not a theoretical claim.

**Honestly NOT hard (leave to the soft judge, `criteria.md`):** whether the DECLARED lesson kind is the RIGHT
one for the brief (C1); whether a discovery is real teaching vs. restated narration (C2); stage-ceiling
rightness beyond mere presence (C3); whether reinforcement is proportional/reasoned rather than templated (C5);
breadth-before-depth balance (C6); genuine vs. fragmentary retrieval (C7); any latent teaching economy (C8). None
of these is a schema/count/format check — all require reading the prose's MEANING.

**Also honestly NOT buildable today (a real gap, named rather than silently skipped):**
- A **char-length ceiling** (prompt.md's own "Target ≤ 8k chars") has no `CHECK_KINDS` entry — would need a
  `max-bytes`/`byte-ceiling` kind. FOLLOW-ON.
- **Per-cue 1:1 field balance** (every cue block has ALL FOUR lines, not just "each line exists somewhere") —
  would need a `regex-count`/`balanced-count` kind comparing four occurrence counts. FOLLOW-ON.

---

## 3. SOFT measures (the CEILING) — see `criteria.md`

The checklist (9 dims) + 8 graded criteria (C1–C8, Required/Aspirational tagged, quote-anchored) + gold + red-
flag exemplars live in `criteria.md`, wired via `node.json` `optimize.judge`. Not restated here. Summary of the
provenance: every criterion is grounded in a named section of `.agents/skills/lesson-pedagogy/SKILL.md`; the
gold and red-flag exemplars are REAL project artifacts (`kptest-fenyuhe-six`'s post-fix `pedagogy.md` and its
`PRE-FIX` predecessor), not invented — including a real, git-documented root→fix→verify record
(`skillsys(lesson-pedagogy)` commit `a3b38fe`) that IS the validity proof for C1/C5/C7 together (§4 below).

---

## 4. Wiring + readiness (how these plug into triage, per the runway)

- **HARD** → `optimize/substrate/measure.w0-pedagogy.json` (§2): the 6 wired regex ops + reused trace
  detectors + digest anomalies — the axes triage cites as "detector + evidence line".
- **SOFT** → `criteria.md`'s checklist + rubric + gold + red-flag as the blind judge's references — JUDGING
  only, never injected into w0-pedagogy's prompt.
- **VALIDITY confirmed (do NOT re-skip this check on a future edit):** `no-self-audit-leakage` FIRES on the real
  `PRE-FIX` file and PASSES on the real fixed gold (§2b#5) — a genuine known-bad replay, not a theoretical claim.
  The four field-presence checks and the header check are un-replayed against a genuinely malformed artifact
  (none exists in this repo's history yet — every sampled real run, pre- and post-fix, used the correct cue
  vocabulary); they are LOW-bar structural floors by construction (presence of a mandated literal string), so
  their risk of silently passing a wrong artifact is small but not zero — the honest caveat is that they have
  not been proven to FIRE on a real bad case the way `no-self-audit-leakage` has.
- **Recurrence grounding** — the C1/C5/C7 cluster's real-world failure + fix is recorded in `memory.md`
  (`w0-pedagogy::lesson-kind|acquisition-mislabeled-as-insight`, recurrence 1, already fixed at the SKILL level
  in `a3b38fe`); kept as a standing lesson so a regression is recognized as this pattern recurring.

## Open questions for the human
- Should the two named FOLLOW-ON `CHECK_KINDS` (`max-bytes` byte-ceiling; `regex-count`/`balanced-count` for
  per-cue field balance) be built into `packages/core/src/checks.ts`, or is the soft judge's checklist (which
  already flags a cue silently missing a dimension) sufficient coverage for now? Building them would let
  per-cue completeness move from soft to hard, freeing the judge to focus purely on meaning.
- `criteria.md` C6 (breadth-before-depth) is stated as Required "when the brief enumerates ≥2 co-equal targets"
  — confirm this conditional-Required framing (vs. an unconditional Required that vacuously passes on a
  single-target lesson) is the intended shape before the loop starts scoring against it.
