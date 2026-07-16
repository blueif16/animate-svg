# node: w2b-audio-captions — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into w2b-audio-captions's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: measurement-runway hardened 2026-07-10 — no live optimize-loop runs recorded yet_

## Current behavior
<!-- what w2b-audio-captions reliably does now (1–3 lines), updated from traces. -->

## Known failure modes
<!-- the generalized LESSON + WHY (not the diff). Reflect on failures, not successes.
     Write each recurring failure as a lesson block in THIS exact shape (the recurrence reader parses it, and
     the machine `sig:` is what flips a residual LAPSE→SKILL once it recurs; a block with no `sig:` is skipped):
       ### <symptom signature>
       sig: w2b-audio-captions::<key>          (the machine key = signatureOf output; node::sorted-anomalies|reason)
       recurrence: <N>            (cross-run count)
       [[<okf-slice-key>]]        (the code-map slice the fixer reads)
       **Root:** <why it happens>
       **Prevention:** <the generalized guard> -->

### optimize.criteria key absent — buildJudgePrompt throws, triage never runs
sig: w2b-audio-captions::optimize-criteria-unwired
recurrence: 1
[[voice-asr-pipeline]]
**Root:** `optimize` declared `measure` only; `criteria.md` existed but no `optimize.criteria` pointed at it,
and the runway checklist wrongly marked WIRING `[x]` on convention (a file at the expected path) alone.
**Prevention:** authoring `criteria.md` + adding `"criteria": "nodes/<id>/criteria.md"` are ONE edit — prove
via `buildJudgePrompt`/`optimize triage` before marking WIRING `[x]`; convention is never proof of wiring.

### budget-fit measure blind to the markdown-table format — false-green 0%
sig: w2b-audio-captions::budget-fit-table-format-blind
recurrence: 1
[[voice-asr-pipeline]]
**Root:** `parseMotionBudget` read only the `motion-budget:` prose block; a pipe-table naming
`visualMotionSeconds` (`kp2-counting-by-tens`, `-compare-more-fewer`, `-count-to-two`, `-first-second-third`)
silently returned `checked:0`, and the zero-initialized `budgetFitWorstAbsPct` then read as a false "on
budget" 0% — 12/17 real lessons hit this.
**Prevention:** now also parses the table convention AND fails CLOSED (`budgetFitWorstAbsPct:null` +
`budgetFitSkipped:1` on zero-checked) so a future format drift is an explicit "couldn't measure" signal, not
a silent pass. Residual (stage-keyed budgets, not cue-id-keyed): `criteria.md`'s validity note.

## Active invariants
<!-- hard rules w2b-audio-captions must keep (e.g. writes only within its owns/readScope). -->

## Open threads
<!-- unresolved; drop each when absorbed. -->

## History
git log --grep '^skillsys(w2b-audio-captions)'
