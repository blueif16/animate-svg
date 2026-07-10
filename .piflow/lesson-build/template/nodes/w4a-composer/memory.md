# node: w4a-composer — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into w4a-composer's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: 2 lessons (self-grade laundering [hardened], optimize wiring gap [fixed this session])_

## Current behavior
Composes the lesson scene (layout.ts/manifest.ts/Scene/Complete wrapper) from the reconciled cue timeline, then
its own POST `run` op re-runs `lesson:check`/`lesson-measured.mjs` and the POST `checks` gate re-reads the FRESH
`bbox-manifest.json` for `measured.method`, `summary.measuredCollisionCount`, `summary.captionIntrusionCount` —
a nonzero/skipped value BLOCKS the node regardless of what the model's own return/log claims.

## Known failure modes

### Self-graded "0 collisions" while the manifest disagreed (composer self-grade laundering)
sig: w4a-composer::self-grade-laundering
recurrence: 3 (per `.agents/tracked-systems.md`'s lesson-build open-thread note — "W4a reports '0 collisions'
while its own manifest says measuredCollisionCount:8"; not independently re-grepped against raw run traces this
session — a fast-follow if it resurfaces)
[[composer-scene-assembly]]
**Root:** the model's own self-report/tier-2 log can diverge from the actually-regenerated `bbox-manifest.json`
— it trusts a stale read, a misremembered number, or the JSON without ever rendering + looking (the exact
"Self-graded GREEN" / "Vacuous green" red flags in criteria.md). Nothing structurally forced the two to agree.
**Prevention:** verify against the ARTIFACT, never the self-report — now enforced TWICE: (1) the live run's own
`checks.post` (landed `97cea13`) regex-reads `bbox-manifest.json` directly with `policy.fail:block`, so a
node claiming ok with a nonzero count is forced to `blocked`; (2) `optimize.measure` (added this session, see
"optimize wiring gap" below) mirrors the same 3 content gates into the substrate hard-measure report so triage
sees the identical signal on a finished run. **Residual ceiling gap, by design of what a hard gate CAN check:**
the regex only asserts the NUMBER is 0 — it cannot catch a blanket zone-pair exemption swallowing a real overlap
("Vacuous green") or a justification citing a different element than the one that failed ("Justification
laundering"). Those live in criteria.md's red flags and need an actual judge pass (now reachable — see below).

### `optimize` block was entirely absent (measure + criteria both unwired)
sig: w4a-composer::optimize-block-unwired
recurrence: 1 (first observed + fixed this session, 2026-07-09; not yet proven to recur)
[[composer-scene-assembly]]
**Root:** `node.json` had no `optimize.measure` and no `optimize.criteria`/`optimize.judge`. Consequence:
`piflowctl optimize triage --node w4a-composer` would HALT (`buildJudgePrompt` throws "no optimize.criteria
configured"), and `runSubstrateMeasure` degraded to an EMPTY op[] — none of this node's own collision/caption/
method axes reached the optimize substrate's hard-measure report, only generic trace/digest signals. The SAME
gap was verified across ALL 13 sibling node.json files in this template (none had an `optimize` key) —
flagged to the orchestrator as a workflow-wide runway gap, not unique to this node.
**Prevention:** wired `optimize.measure` (mirrors the 3 content gates + the 5 existence/parse floor checks
already in `checks.post`) and `optimize.criteria: "nodes/w4a-composer/criteria.md"` (a working copy of the
already-authored `.agents/skill-system-criteria.md` W4a block — reused, not reinvented). Watch for regression:
if node.json is edited later and the `optimize` block or the criteria.md path goes stale, the loop silently
reverts to blind — re-run `piflowctl optimize triage --node w4a-composer --dry-run` to confirm it still resolves.

## Active invariants
- The POST `run` op (regenerate `bbox-manifest.json` via `lesson-measured.mjs`) MUST fire before the POST
  `checks` gate evaluates it (node-lifecycle.ts's ops-then-verify order) — reordering would re-introduce the
  stale-read version of the laundering bug.
- `optimize.measure`'s gate paths mirror `checks.post` verbatim; if a live-run check's path/param changes, the
  measure mirror must change with it or the two silently diverge.
- criteria.md is a working COPY of `.agents/skill-system-criteria.md`'s W4a block, not a live reference — an
  edit to one does not propagate to the other; reconcile by hand.

## Open threads
- criteria.md's gold exemplar slot is still PENDING (no fabricated example authored — see the file's own note);
  fill it from a real validated re-compose, not from imagination.
- The consolidated `.agents/skill-system-criteria.md`'s heading grammar (`## W4a composer — ...`, no trailing
  `(node-id)`) does not match `optimize/criteria.ts`'s `parseCriteria()` grammar — irrelevant to the live
  `buildJudgePrompt` path (reads the file verbatim) but would matter if that parser is ever wired up product-wide.
- Sibling nodes likely need the identical `optimize.measure`/`optimize.criteria` wiring fix — a cross-node
  consolidation item, not resolved here.

## History
git log --grep '^skillsys(w4a-composer)' ; git log --grep '^optimize(w4a-composer)'
