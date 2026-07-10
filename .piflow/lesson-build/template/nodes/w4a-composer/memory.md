# node: w4a-composer — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into w4a-composer's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: 2 lessons (self-grade laundering [hardened further this session — stale-manifest + vacuous-green],
optimize wiring gap [fixed, then found fragile + rebuilt same session])_

## Current behavior
Composes the lesson scene (layout.ts/manifest.ts/Scene/Complete wrapper) from the reconciled cue timeline, then
its own POST `run` op re-runs `lesson:check`/`lesson-measured.mjs` and the POST `checks` gate re-reads the FRESH
`bbox-manifest.json` for `measured.method`, `summary.measuredCollisionCount`, `summary.captionIntrusionCount` —
a nonzero/skipped value BLOCKS the node regardless of what the model's own return/log claims. The OPTIMIZE
substrate's own hard measure (`optimize.measure` → `scripts/measure.mjs`) independently recomputes those SAME
facts in-script, plus freshness + bijection + exemption-list guards (see below) — it never reads `checks.post`.

## Known failure modes

### Self-graded "0 collisions" while the manifest disagreed / vacuous or stale green (self-grade laundering)
sig: w4a-composer::self-grade-laundering
recurrence: 5 (3 per `.agents/tracked-systems.md`'s lesson-build open-thread note, not re-grepped this session;
+2 for two further concrete sub-modes an adversarial pass proved 2026-07-09 against the OPTIMIZER's own
measure — both fixed, see Prevention)
[[composer-scene-assembly]]
**Root:** the model's self-report — AND the regenerated `bbox-manifest.json` itself — can diverge from ground
truth in more ways than "the model didn't look": (a) STALE MANIFEST — `lesson-measured.mjs`'s `main().catch`
swallows ANY crash to exit 0 WITHOUT reaching its own "AUGMENT bbox-manifest.json" write, leaving a PRIOR run's
already-clean file on disk with nothing computed this run; (b) VACUOUS GREEN — the collision/caption counts are
computed AFTER applying the composer's OWN `manifest.ts` `allowedOverlaps` + zone tags, so a broken
measure-id↔manifest-id bijection (an element falling through to zone "decoration") or a phantom exemption pair
silently voids detection for exactly the element that would have failed (the f1258 class in criteria.md).
**Prevention:** verify against the ARTIFACT, never the self-report — TWO independent layers: (1) the live run's
own `checks.post` (landed `97cea13`) regex-reads `bbox-manifest.json` with `policy.fail:block` — UNCHANGED this
session, and still exposed to (a) (see Open threads' residual); (2) `optimize.measure` (`scripts/measure.mjs`,
rewritten 2026-07-09) asserts `measured.ranAt` is at-or-after THIS run's own node `startedAt` (closes (a) for
the optimizer's signal — a stale file now FAILS `manifest-fresh` even though the 3 old floor numbers still read
clean); asserts `measured.gates.bboxBinding.pass` (closes half of (b) — "every measureProps id registered
load-bearing"); flags any `manifest.ts allowedOverlaps` pair referencing an id absent from that file's own
`elements[]` (closes the dead/phantom-exemption half of (b)). **Residual ceiling gap, honestly still open:** no
hard gate can tell whether a *present-and-valid* exemption is *justified* — that stays criteria.md's "Vacuous
green"/"Justification laundering" red flags + gold exemplar, the soft judge's call, not a deterministic one.

### `optimize` block was entirely absent — then the first fix's wiring itself proved fragile
sig: w4a-composer::optimize-block-unwired
recurrence: 2 (absent+fixed 2026-07-09; the fix's OWN token-keyed wiring was proven fragile + rebuilt the same
session — not yet proven to recur across a third session)
[[composer-scene-assembly]]
**Root:** `node.json` originally had no `optimize.measure`/`optimize.criteria` at all. The FIRST fix wired 7
`gate`-body checks keyed on `{{arg.lessonId}}` (3 of them) and `{{state.composition}}`/`{{state.camelLessonId}}`
(4 of them) — but `runSubstrateMeasure`'s token resolution REJECTS an op (never crashes, but never fires)
whenever a run's `.pi/run.json` is argless (`{{arg.*}}`) or `.pi/state.json` is `{}` (`{{state.*}}`) — BOTH
real, confirmed conditions in this repo (the latter independently proven this session by the sibling
`w3-5-reconcile` lane for its own node). The "fix" silently degraded to zero evidence on exactly the
older/edge-case runs it most needed to cover.
**Prevention:** `scripts/measure.mjs` now discovers lessonId/camelLessonId/every artifact path IN-SCRIPT from
`<RUN>/.pi/run.json`'s own recorded artifacts (falling back to `.pi/state.json` only when that list is empty)
— NEVER an `{{arg.*}}`/`{{state.*}}` token in the op's own args. Watch for regression: if `optimize.measure`
reverts to a token-keyed `gate` array, re-run `piflowctl optimize triage --node w4a-composer --dry-run` against
an OLD run dir to confirm it still resolves.

## Active invariants
- The POST `run` op (regenerate `bbox-manifest.json` via `lesson-measured.mjs`) MUST fire before the POST
  `checks` gate evaluates it (node-lifecycle.ts's ops-then-verify order) — reordering would re-introduce the
  stale-read version of the laundering bug.
- `scripts/measure.mjs` re-derives the method/collision/caption floor INDEPENDENTLY of `checks.post` (no longer
  a verbatim mirror) — if a live-run check's path/param changes, update the script's own read to match, or the
  two can drift in what each considers "clean."
- criteria.md is a working COPY of `.agents/skill-system-criteria.md`'s W4a block, not a live reference — an
  edit to one does not propagate to the other; reconcile by hand.

## Open threads
- **RESIDUAL (product defect, out of this node-dir's scope):** `lesson-measured.mjs`'s `main().catch` exits 0
  on ANY crash — the root cause hardened AROUND, not fixed. The LIVE run's own `checks.post` has NO freshness
  check and stays exposed to the same stale-manifest false-green during an actual live run (only the
  optimizer's replay-time signal is closed). Needs a product-side change; flagged for a product-triage pass.
- criteria.md's gold exemplar slot is still PENDING (no fabricated example authored — see the file's own note);
  fill it from a real validated re-compose, not from imagination.
- Sibling nodes likely need the identical run.json-discovery + freshness/bijection hardening — a cross-node
  consolidation item (w3-5-reconcile already did its own narrower version this session; this node's fuller
  version — stale + vacuous-green — is the more complete template to copy from).

## History
git log --grep '^skillsys(w4a-composer)' ; git log --grep '^optimize(w4a-composer)'
