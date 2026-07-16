# node: w2a-visual-design — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into w2a-visual-design's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: 4 lessons (lean-artifact overflow · zone-disjoint asserted-not-computed · identity-break in
comparison · measure itself was fail-open) — memory.md is over its ~40-line cap; a compaction pass is owed._

## Current behavior
w2a-visual-design reliably produces a schema-valid, non-empty Visual Contract (measurement block, zones,
palette/motion, per-cue choreography). Real runs range from lean and disciplined (`kp2-counting-by-tens`,
9.4k chars) to badly over-scoped (`ten-ones-make-one-ten`, 30.3k chars) — see lessons below.

## Known failure modes
<!-- the generalized LESSON + WHY (not the diff). Reflect on failures, not successes.
     Write each recurring failure as a lesson block in THIS exact shape (the recurrence reader parses it, and
     the machine `sig:` is what flips a residual LAPSE->SKILL once it recurs; a block with no `sig:` is skipped):
       ### <symptom signature>
       sig: w2a-visual-design::<key>
       recurrence: <N>
       [[<okf-slice-key>]]
       **Root:** <why it happens>
       **Prevention:** <the generalized guard> -->

### Artifact blows the LEAN char-ceiling by folding in out-of-scope content
sig: w2a-visual-design::lean-artifact-overflow
recurrence: 1
prose — no code anchor (this is a prose node with no owned code slice; its runway is `criteria.md` +
`measure/visual-design-lint.mjs`, not an OKF code slice).
**Root:** the real `ten-ones-make-one-ten` run shipped at 30,305 chars (2.4x the ~13k target) — it inlined a
full BundleWrap primitive-redesign spec (SS5, W3b's job, not this node's) and a verbose per-element
SS6 self-check narrating "carries signal X — PASS" for ~15 elements, both explicitly forbidden by the LEAN
ARTIFACT rule (prompt.md: "Put ALL self-audit / self-check results in your structured return + the tier-2
log — NEVER as prose sections inside the artifact"). This run likely predates the current prompt's LEAN
clause (the `kp2-counting-by-tens` run, same template generation, is lean at 9.4k) — unconfirmed whether it
recurs under the CURRENT prompt.
**Prevention:** the hard `char-ceiling` check in `visual-design-lint.mjs` now fires `warn` at >13k chars and
`severe` at >20k, feeding triage directly — a regression is caught even if the root cause (over-scoping into
another node's job) recurs in a new form.

### Zone disjointness NARRATED as PASS while the actual coordinates overlap
sig: w2a-visual-design::zone-disjoint-asserted-not-computed
recurrence: 1
prose — no code anchor.
**Root:** the same real `ten-ones-make-one-ten` run's own SS6 self-check claims "zones declared, disjoint...
every element anchored... PASS" for every zone pair, yet its own declared coordinates
(`zone-objects y=180..480`, `zone-tally y=460..520`, `zone-labels y=500..610`) have TWO genuine ~20px
overlaps — found live by re-running this node's own hard measure against the real artifact. The model
computed each zone's box independently and never actually cross-checked pairwise ranges against each other,
despite narrating that it did — kids-eye SS1.5 names this exact failure mode: "Disjoint is COMPUTED, not
asserted... a zone whose box sits inside or overlaps a co-present zone's box is an automatic FAIL."
**Prevention:** the hard `zone-disjoint` check now computes real pairwise AABB intersection (excluding the
exempt `zone-marks`) instead of trusting the artifact's own narrated conclusion — "verified, not trusted"
applied to the node's own self-audit, not just to the driver's artifact-existence check.

### Comparison/contrast cue breaks the identity-invariant via a color/shape substitute
sig: w2a-visual-design::identity-break-in-comparison
recurrence: 1
prose — no code anchor.
**Root:** the same real lesson's OWN preamble documents that its prior (pre-REDO) run's `faster-count`
comparison cue used "10 gray strokes on the left vs orange bundle on right" — recoloring/reshaping one side
of a comparison to signal "the other one" instead of reusing the identical primitive at a different
scale/opacity, directly violating kids-eye SS4 ("color changing across the transformation for no semantic
reason... forbidden") and visual-discipline SS6. The REDO fixed it correctly (same `SmallStick` at
`colors.reward`, only `scale=0.6, opacity=0.55` differ) — that fix is the pattern to reuse.
**Prevention:** C1/C2 in `criteria.md` grade exactly this (metaphor singularity + identity-invariant); a
future comparison/contrast cue that substitutes color or shape instead of scale/opacity should be flagged as
a REGRESSION of this same signature, not a fresh defect.

### The hard measure itself was fail-open — severe/parse-fail/skip could still report ok:true
sig: w2a-visual-design::measure-fail-open-hardened
recurrence: 1
prose — no code anchor (the runway is `measure/visual-design-lint.mjs`, not a code slice).
**Root:** an adversarial pass proved `visual-design-lint.mjs`'s own `ok` field ignored `charCheck.status
==='severe'` entirely; silently downgraded an unboxed declared zone (real kp2's `zone-tally-*` wildcard) to
an advisory while still computing `pass`; and reported `cueCoverage.status:'skipped'` (no/unreadable
`--storyboard`) as `ok:true` with zero issues — three fail-open false-greens, plus a bare `.includes()`
cue-match a producer could satisfy by just listing cue names with no real content.
**Prevention:** `ok` now folds `severe`/zone-`parse-fail`/cue-`fail` (2026-07-09); a declared zone box that
never parses is a hard fail unless it resolves as a same-prefix wildcard shorthand or is marked
`(unused)`; a cue only counts as covered if a mention carries real content (not glued to another cue name
with nothing between). If a HISTORICAL run that used to show `ok:true` now shows `parse-fail`/`fail`, that
is the runway getting stricter, not this node regressing — check `issues[]` before assuming a regression.

## Active invariants
- Writes ONLY `visual-design.md` + its own `_logs/w2a-visual-design.md` (per `contract.owns`) — never another
  lesson's files.
- `zone-marks` is the one zone permitted to overlap another (full-bleed, trace-over-only) — every other zone
  pair must be arithmetically disjoint.

## Open threads
- Confirm whether the lean-artifact-overflow + BundleWrap-redesign-scope-creep lessons are relics of an
  OLDER prompt.md generation or can still occur under the CURRENT prompt — no run has been observed yet
  under the current template + the new hard measures.

## History
git log --grep '^skillsys(w2a-visual-design)'
