# node: setup-scaffold — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into setup-scaffold's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: 3 lessons (state-promote fields dropped [recurring, hard-caught], sandbox write-permission friction
[recurring, unmitigated], optimize block unwired [fixed this session])_

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
**Prevention:** wired `optimize.measure` (ONE new check: `brief-not-authored-by-node`, a trace-regex gate — see
`criteria.md`'s "Substrate gap" section for why the other two real leverage checks, lessonId/constPrefix
fidelity and no-leftover-template-tokens, could NOT be safely wired the same way: `runSubstrateMeasure`'s
`ResolveCtx` never loads the run's `args`, so a check path keyed on the run's lesson-id arg throws
`MissingArgError` uncaught and crashes measurement for the whole node) and
`optimize.criteria: "nodes/setup-scaffold/criteria.md"`
(freshly authored — `.agents/skill-system-criteria.md` explicitly omits setup-scaffold as "trivial", so there was
no existing block to copy, unlike w4a-composer's case). Watch for regression: if `node.json` is edited later and
the `optimize` block or the criteria path goes stale, the loop silently reverts to blind — re-run `piflowctl
optimize triage --node setup-scaffold --dry-run` to confirm it still resolves.

## Active invariants
- `optimize.measure`'s one gate path is bare RUN-relative (`.pi/nodes/setup-scaffold/events.jsonl`), never
  `{{arg.*}}`/`{{state.*}}`-keyed — see the substrate-gap note above; violating this crashes measurement.
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

## History
git log --grep '^skillsys(setup-scaffold)' ; git log --grep '^optimize(setup-scaffold)'
