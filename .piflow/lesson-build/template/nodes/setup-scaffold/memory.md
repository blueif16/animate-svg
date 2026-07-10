# node: setup-scaffold — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into setup-scaffold's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: 4 lessons (state-promote fields dropped [recurring, hard-caught], sandbox write-permission friction
[recurring, unmitigated], optimize block unwired [fixed 2026-07-09], adversarial-pass hard-measure holes
[closed 2026-07-10 — see below; the "unwired" lesson's own Prevention text is now stale, corrected there])_

## Current behavior
Verifies `brief.md` already exists (blocks if not), scaffolds `pipeline.json` via the shared
`npm run lesson:scaffold` when missing (idempotent skip when already present), and promotes
`camelLessonId`/`composition` — copied verbatim from pipeline.json's `voice.constPrefix`/`composition` — into
run state every later wave's file paths resolve against.

## Known failure modes

### Structured return drops `camelLessonId`/`composition` while the summary claims both were promoted
sig: setup-scaffold::state-promote-fields-dropped
recurrence: 2 (`kp3-tens-and-ones-place-r2` and `-r3`, identical signature both times — not independently
re-checked against other lessons this session; a fast-follow if a 3rd lesson trips it)
[[lesson-pipeline-scaffold]]
**Root:** the model computes and NARRATES both values correctly in free-text (`summary`: "Promoted
camelLessonId=voice.constPrefix=kp3TensAndOnesPlace and composition=CompleteKp3TensAndOnesPlaceLesson verbatim
from pipeline.json") but omits them from the actual structured return object — a self-report/reality split, not
a computation failure. `returnSchemaInvalid` on both runs: `"/ must have required property 'camelLessonId'"`,
`"/ must have required property 'composition'"`.
**Prevention:** already HARD-caught live — `contract.returnMode:"required"` + the return schema's
`required:["camelLessonId","composition",...]` correctly forces `status=blocked` on both observed runs (verified
against `run.json`, not the model's self-report). No new gate needed; this lesson exists so a fixer sharpening
`prompt.md`'s STATE PROMOTE section (already the most heavily-worded paragraph in the prompt) has a concrete
before/after target instead of guessing at the failure mode. Residual: recurring across 2/2 hit runs suggests a
SKILL gap (the executor slips on this specific model+prompt pairing), not a one-off LAPSE — candidate for a
stronger structural nudge (e.g. restating the exact JSON key names immediately before the fenced-tail
instruction) rather than a prose-tone edit.

### Sandbox write/exec permission friction (`EPERM`/`Operation not permitted`) burns tool-call budget
sig: setup-scaffold::sandbox-write-permission-friction
recurrence: 2, wide severity spread (`kp3-tens-and-ones-place-r1`: 68 EPERM-pattern hits, ~20 escalating bash
diagnostic calls — `whoami`/`id`/`ls -laO`/repeated `mkdir`/`touch` attempts — trying to write
`_logs/setup-scaffold.md`, run never reached a terminal status in the captured trace; `-r3`: 4 hits, a python
importer-cache `Operation not permitted` during a `verify`-style command, logged and the node proceeded to a
clean scaffold regardless)
[[lesson-pipeline-scaffold]]
**Root:** unconfirmed — looks like a local-sandbox (seatbelt) write-scope or exec granularity issue distinct
from anything this node's own `node.json` controls (`_logs/setup-scaffold.md` IS already declared under
`contract.owns`). Not root-caused this session; NOT this node's own `owns`/`readScope` mis-declaration as far as
the contract goes.
**Prevention:** none authored yet — this is an infra/sandbox-level finding, out of this node's own fix surface
(prompt/contract edits can't repair a sandbox permission grant). Flagged to the orchestrator as a
cross-cutting concern: EVERY node in this template writes a `_logs/<wave>.md` under the same lesson-data
convention, so if this is systemic it likely affects sibling nodes too, with severity apparently varying by
run/host state rather than lesson. Watch for recurrence; if it fires again, the fix surface is almost certainly
`@piflow/core`'s local-sandbox layer or this repo's `--sandbox` config, not this node's prompt.

### `optimize` block was entirely absent (measure + criteria both unwired)
sig: setup-scaffold::optimize-block-unwired
recurrence: 1 (first observed + fixed this session, 2026-07-09)
[[lesson-pipeline-scaffold]]
**Root:** `node.json` had no `optimize.measure` and no `optimize.criteria`. Consequence: `piflowctl optimize
triage --node setup-scaffold` would HALT (`buildJudgePrompt` throws "no optimize.criteria configured"), and
`runSubstrateMeasure` degraded to an empty op[] — none of this node's own leverage axes reached the substrate
hard-measure report. The identical gap was independently found across the OTHER 13 sibling `node.json` files in
this template (per `w4a-composer/memory.md`'s own note) — a workflow-wide runway gap, not unique to this node.
**Prevention:** wired `optimize.measure` (ONE new check: `brief-not-authored-by-node`, a trace-regex gate — this
paragraph originally explained why the other two real leverage checks, lessonId/constPrefix fidelity and
no-leftover-template-tokens, could NOT be safely wired the same way, citing a `ResolveCtx`-never-loads-args
crash risk. **STALE as of 2026-07-10 — see the `hard-measure-adversarial-holes` lesson below**: the SDK was
fixed upstream (args now threaded + graceful degrade, not a crash) and C2/C3 are now hard-wired via a script
that avoids the `{{arg.*}}` dependency entirely. Corrected here rather than left to mislead the next reader.) and
`optimize.criteria: "nodes/setup-scaffold/criteria.md"`
(freshly authored — `.agents/skill-system-criteria.md` explicitly omits setup-scaffold as "trivial", so there was
no existing block to copy, unlike w4a-composer's case). Watch for regression: if `node.json` is edited later and
the `optimize` block or the criteria path goes stale, the loop silently reverts to blind — re-run `piflowctl
optimize triage --node setup-scaffold --dry-run` to confirm it still resolves.

### Adversarial pass proved 3 hard-measure holes: bash-redirect evasion, vacuous-pass on a missing trace, unmeasured `</item>` leak
sig: setup-scaffold::hard-measure-adversarial-holes
recurrence: 1 (first observed + closed this session, 2026-07-10)
[[lesson-pipeline-scaffold]]
**Root:** the ONLY wired gate (`brief-not-authored-by-node`) keyed write/edit tool events only, so the node's
own step-2 `bash` scaffold tool redirecting/tee-ing/sed-i-ing into brief.md hit `false` — a vacuous PASS, PROVEN
live against a constructed evasion. No measure asserted the trace itself was found/well-formed (a missing/
truncated events.jsonl would let every regex-absent gate vacuously pass). The real `</item>` return-string leak
(issues/zesty-caramel.md, run kp3-tens-and-ones-place-r3) was named only in a judge-facing issue file, never
measured. C2 (lessonId + promote-fidelity)/C3 (no-leftover-tokens) still lived soft-only.
**Prevention:** added `brief-not-mutated-via-bash` + `no-item-tag-leak-in-return` gates, and a `hard-checks`
op (`scripts/measure/hard-checks.mjs`) providing `traceFound`/`traceTruncated` liveness (checked across BOTH
the `.pi` and legacy `_pi` layouts) + hard C2/C3. Lessons id derived IN-SCRIPT from run.json's own artifact
paths, never `{{arg.*}}` (see criteria.md's "Substrate gap" UPDATE). Live-testing against the REAL run corpus
caught 2 bugs of its OWN before landing: (1) the bash-mutation regex's operator→target gap was wide enough to
spill past the command string's closing JSON quote into an unrelated `ls` stdout echo that happened to list
`brief.md` — a false positive on run kp3-tens-and-ones-place-r3, fixed by excluding `{}:` from the gap class;
(2) trace-liveness was originally gated behind successful lessonId derivation, so it silently read
`traceFound:0` on kp3-tens-and-ones-place-r1 (status:"running", `artifacts:[]`) even though its 470KB trace
genuinely exists — decoupled so liveness runs unconditionally. Both fixes re-verified clean against every real
trace in runs/ (kp3-r1/r2/r3, ctt-1/2) — zero false hits, zero false misses on the one real defect (r2/r3's
`</item>` leak fires; a clean run does not).
**Residual, honestly scoped:** the bash-mutation gate only catches the 3 NAMED evasion idioms (redirect/tee/
sed-i), not every mutation idiom (`cp`/`mv` untested); it and the plain regex-absent gates still only read the
CURRENT `.pi` layout (only the liveness check itself covers `_pi`) — a run genuinely on the legacy layout would
have its regex gates vacuously pass while liveness correctly reports `traceFound:1` (inconsistent but honestly
documented, not claimed as full coverage). No real run in this repo has been observed using the `_pi` layout for
events (confirmed: `_pi/<node>/` here holds `prompt.md`/`tools.ts` staging, never `events.jsonl`).

## Active invariants
- `optimize.measure` op paths avoid `{{arg.*}}`/`{{state.*}}` tokens — NOT because they crash anymore (the SDK
  now degrades gracefully, `@piflow/core` `9442c31`+`7b97c14`), but because every run sampled in this repo has
  no persisted `.pi/run.json` args block, so such a token would be silently REJECTED (never evaluated). Derive
  any per-lesson value IN-SCRIPT from run.json's own recorded `artifacts[].path` instead (`hard-checks.mjs`).
- `criteria.md` is this node's OWN fixture (not a copy of a shared block, since none existed) — an edit to the
  shared `.agents/skill-system-criteria.md` does not propagate here and vice versa; reconcile by hand if the
  shared doc later grows a setup-scaffold entry.

## Open threads
- `state-promote-fields-dropped` recurred 2/2 observed hit runs — worth a prompt-sharpening fix attempt (a
  fixer's job, not this session's) once the loop is exercised for real.
- `sandbox-write-permission-friction` is NOT root-caused; needs a dedicated look at the local-sandbox/seatbelt
  layer, likely a cross-node consolidation item rather than a per-node fix.
- Cross-node consolidation: verify whether OTHER sibling nodes' `optimize` wiring (per `w4a-composer`'s
  identical finding) has since been fixed workflow-wide, and whether `.agents/skill-system-criteria.md` should
  gain a setup-scaffold entry now that one exists node-locally.
- Every real trace in this repo independently shows `detectors.truncatedLines:2` (the SDK's own trace detector,
  corroborating this session's `traceTruncated` finding) — worth a dedicated look at whether this is a systemic
  pi-runtime JSONL-flush artifact affecting every node, not just setup-scaffold; out of this node's own scope.
- The bash-mutation/item-tag gates' `.pi`-only scope (see the hard-measure-adversarial-holes residual note) is a
  known, honestly-documented gap, not a claimed full fix — widen to cover `_pi` too if a real run is ever
  observed on that layout.

## History
git log --grep '^skillsys(setup-scaffold)' ; git log --grep '^optimize(setup-scaffold)'
