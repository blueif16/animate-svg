# w0-pedagogy — MEASURES (the runway build: hard + soft, wired)

> Authored via the method in `piflow-overlord/references/building-measures.md`. This is the reasoning + wiring
> record; the operational judge-facing fixture it produces is `criteria.md` (pointed to from `node.json`
> `optimize.criteria`, the canonical key — `optimize.judge` is a back-compat read alias only), and the
> operational hard gates it produces are already wired into `node.json` `optimize.measure`. Read `criteria.md`
> for the soft rubric itself — it is not repeated here.
>
> **2026-07-09 hardening (adversarial pass closed):** the 5 `regex-present "<field>:\s*\S"` ops described in
> §2b below (2a–2b, pre-2026-07-09) were PROVEN gameable — a header with an empty/TODO/placeholder value
> satisfies `\s*\S` — and, independently, were ALWAYS silently dropped (`ops.rejected`, never evaluated) on
> every run sampled in this repo because their `path` resolved `{{arg.lessonId}}`, which no sampled run.json
> (including the most recent, 2026-07-07) persists. Both are fixed by ONE new op,
> `pedagogy-field-content-valid` (`scripts/measure/check-field-content.mjs`), which derives the artifact path
> from `<run>/.pi/run.json`'s persisted `artifacts[].path` (needs no `{{arg.*}}` token) and validates REAL
> content per field, not header-token presence. §2b below is kept as the historical record of what was replaced
> and why; the "not proven to FIRE on a real bad case" caveat it raised is now closed (see §4).

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

### 2b. THIN NEW WRAPPERS — WIRED into `node.json` `optimize.measure` (config/a thin script, not new SDK code)

**HISTORICAL (pre-2026-07-09, REPLACED — kept as the record of what changed and why).** `pedagogy.md` is
markdown prose, not JSON, so the original wrapper reached for the only usable `CHECK_KINDS`
(`packages/core/src/checks.ts`): `regex-present`/`regex-absent` — a single-argument `new RegExp(String(param))`,
**no flags** (no `^`/`$`/`(?i)`/`(?m)`). Five ops keyed on `"<field>:\s*\S"` per field (`lesson kind`,
`discovery`, `stage`, `focal`, `reinforcement`). **This was PROVEN gameable** (an adversarial pass, closed
2026-07-09): with no per-line anchor, `\s*\S` is satisfied by ANY non-whitespace one character after the
colon — a placeholder value ("TODO", "TBD") or even a blank field whose `\s*` bled across the newline into the
NEXT field's label both read as "present". It was also, independently, silently INERT: the op's `path` resolved
`{{arg.lessonId}}`, which the substrate measure stage resolves against the run's *persisted* args
(`readRunArgs`, `measure.ts`) — and no run.json sampled in this repo (oldest through the newest, 2026-07-07)
persists an `args` block, so all five ops dropped into `ops.rejected` on every real run, never evaluated.

**CURRENT — `pedagogy-field-content-valid`** (`run` body → `scripts/measure/check-field-content.mjs {{RUN}}`,
`writes` → `{{RUN}}/optimize/substrate/w0-pedagogy-field-content.json`). One script replaces all five ops:
- Derives the pedagogy.md path IN-SCRIPT from `<run>/.pi/run.json`'s persisted `nodes.w0-pedagogy.artifacts[]`
  (always written — the runner stats every declared artifact at verdict time) instead of `{{arg.lessonId}}` —
  robust across every run in this repo's history, not just future arg-persisted ones. The op's own `args` is
  just `{{RUN}}`, which always resolves, so the op itself is never dropped.
- Validates REAL content per occurrence: non-empty, not a placeholder-token match (`TODO`/`TBD`/`N/A`/…), and a
  minimum length/word-count floor for free-text fields (`lesson kind`/`discovery`/`focal`/`reinforcement`);
  `stage` is validated against its closed `concrete|represent|symbolize` enum (its leading token, so a
  legitimate trailing parenthetical annotation is not penalized) — a check no length floor could safely apply
  (SKILL-legit `stage` values are single short words).
- Line-anchored (the script's own regex uses the `m` flag) — a value-less field can no longer read as its
  neighbor's presence.
- Fails CLOSED: a missing run.json/node-record/artifact/unreadable file, or any field carrying non-content, is
  a nonzero exit + `ok:false` in the written report — never a silent pass.
- **Honest gap, unchanged from before:** this still proves per-occurrence VALIDITY, not 1:1 balance across
  discovery/stage/focal/reinforcement within one cue — that would need counting+comparing occurrences per cue
  block, a sharper structural check than "every occurrence found is individually valid". FOLLOW-ON, not built
  here (still no `CHECK_KINDS` primitive needed — the script already has the file in hand and COULD be extended
  to group by cue block; deferred to keep this pass scoped to the named hole).

**`no-self-audit-leakage`** (`regex-absent`, `"[Aa]udit checklist|[Ss]elf-check|[Ss]elf-audit|✓|\\[[ xX]\\]"`,
UNCHANGED) — catches prompt.md's own named anti-pattern (self-audit prose belongs in the structured return +
tier-2 log, never inside the artifact). **VALIDATED against a real known-bad file**: fires true on
`_prior-runs/kptest-fenyuhe-six/pedagogy.PRE-FIX.md` (a literal `## Audit checklist`, 9 numbered items) and
false (passes) on the real fixed gold — a genuine FIRE + DISCRIMINATE proof, not a theoretical claim. **Residual
gap named, not fixed here:** this op's `path` still resolves `{{arg.lessonId}}` and is therefore ALSO silently
dropped on every run in this repo, for the identical reason the five field-presence ops were — out of this
pass's named scope (it is a `regex-absent`, not one of the named gameable `regex-present` ops), but a real gap;
a follow-up should fold it into `check-field-content.mjs` the same way.

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
flag exemplars live in `criteria.md`, wired via `node.json` `optimize.criteria` (the canonical key). Not
restated here. Summary of the
provenance: every criterion is grounded in a named section of `.agents/skills/lesson-pedagogy/SKILL.md`; the
gold and red-flag exemplars are REAL project artifacts (`kptest-fenyuhe-six`'s post-fix `pedagogy.md` and its
`PRE-FIX` predecessor), not invented — including a real, git-documented root→fix→verify record
(`skillsys(lesson-pedagogy)` commit `a3b38fe`) that IS the validity proof for C1/C5/C7 together (§4 below).

---

## 4. Wiring + readiness (how these plug into triage, per the runway)

- **HARD** → `optimize/substrate/measure.w0-pedagogy.json` (§2): `pedagogy-field-content-valid` +
  `no-self-audit-leakage` + reused trace detectors + digest anomalies — the axes triage cites as "detector +
  evidence line".
- **SOFT** → `criteria.md`'s checklist + rubric + gold + red-flag as the blind judge's references — JUDGING
  only, never injected into w0-pedagogy's prompt.
- **VALIDITY confirmed (2026-07-09, do NOT re-skip this check on a future edit):** `no-self-audit-leakage` FIRES
  on the real `PRE-FIX` file and PASSES on the real fixed gold (§2b) — a genuine known-bad replay, not a
  theoretical claim. `pedagogy-field-content-valid` is now ALSO replay-proven (the prior caveat here — "not
  proven to FIRE on a real bad case" — is CLOSED): (a) `CHECK_KINDS['regex-present']` called directly against a
  constructed `discovery: TODO` / `focal:` (blank) / `reinforcement: TBD` artifact showed the OLD regex passing
  every one of the five fields (the exact adversarial-pass evasion); (b) `runSubstrateMeasure` called directly
  against a real run (`kp3-tens-and-ones-place-r3`) showed all six OLD ops dropping into `ops.rejected`
  (`{{arg.lessonId}}` unresolved) — never evaluated at all; (c) the NEW script, run against the same constructed
  gamed artifact (wired through a scratch run dir), FAILS closed (`fieldsInvalid: 5`, nonzero exit) and, run
  against the real good artifact (`kptest-count-to-two/pedagogy.md`), PASSES (`fieldsInvalid: 0`) — a genuine
  FIRE + DISCRIMINATE proof on both fronts, not a theoretical claim.
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
