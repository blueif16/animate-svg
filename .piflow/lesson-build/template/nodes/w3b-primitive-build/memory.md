# node: w3b-primitive-build — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into w3b-primitive-build's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill /
     `memory-slices`. Lessons below are grounded in REAL run evidence (`.piflow/lesson-build/runs/*`), never
     invented — recurrence is COUNTED from traces, not asserted. -->

_status: 3 lessons (all real, evidence-backed; recurrence 1–2)_

## Current behavior
<!-- what w3b-primitive-build reliably does now (1–3 lines), updated from traces. -->
Real runs (`mig-e2e-1`, `e10e11-accept-1`, `e10-w3a-1`, `e10-w3a-3` — all `kptest-count-to-two`) reach `ok`
cleanly: honest zero-gap compositions, correct identity-preserving picks (`cardinal-consolidation` over a
cross-fade), `registry:check-lesson` GREEN, dual-form citations once the header-literal issue (below) is
avoided.

## Known failure modes
<!-- the generalized LESSON + WHY (not the diff). Reflect on failures, not successes.
     Write each recurring failure as a lesson block in THIS exact shape (the recurrence reader parses it, and
     the machine `sig:` is what flips a residual LAPSE→SKILL once it recurs; a block with no `sig:` is skipped):
       ### <symptom signature>
       sig: w3b-primitive-build::<key>
       recurrence: <N>            (cross-run count)
       [[<okf-slice-key>]]        (the code-map slice the fixer reads)
       **Root:** <why it happens>
       **Prevention:** <the generalized guard> -->

### Aesthetic-stills claim was unverifiable by a text-only judge — no hard floor for C5
sig: w3b-primitive-build::gap-false-positive|no-still-hard-floor
recurrence: 1
[[primitive-registry]]
**Root:** criteria.md's C5 ("Aesthetic quality independently VERIFIED") was SOFT-ONLY — the blind judge reads
only the artifact/tier-2-log prose and cannot SEE a PNG, so a claim like "stills rendered; finger-cover passed"
with zero still ever written to disk passed undetected, on exactly the highest-stakes path (a new primitive
shipping a bad/unverified look becomes a PERMANENT catalog defect every future lesson inherits). Proven by an
adversarial verification pass, 2026-07-09.
**Prevention:** a third `optimize.measure` op, `aesthetic-stills-floor`
(`scripts/measure/check-aesthetic-stills.mjs`), now runs every pass: it STRUCTURALLY detects a shipped
primitive (registry ids now vs. the git HEAD revision of `primitive-registry.json` — never a keyword scan of
this artifact's prose, unlike `check-lesson-primitives.mjs`'s own 5-alternative `REUSE_VERDICT` anti-vacuous
guard) and FAILS when `out/<lessonId>/primitive-checks/` holds zero stills. Never trust C5 (soft/judge) alone
to catch a missing still again — existence is now a hard, structural floor; C5 only judges the QUALITY of
stills that genuinely exist.

### Table-header literal parsed as a phantom component citation
sig: w3b-primitive-build::gate-false-positive|header-literal-as-component
recurrence: 1
[[primitive-registry]]
**Root:** `check-lesson-primitives.mjs`'s citation extractor matches ANY `` (`PascalName`) `` pattern in the
artifact text, including inside the table's OWN header row — a header literally reading
`` primitive (kebab-id (`ComponentName`)) `` gets parsed as a citation of a component named "ComponentName",
which is not registered, so the gate fails on the header itself (`e10-w3a-3`: "Initial gate failure: table
header used literal `ComponentName` which the gate's regex parsed as a phantom component"; reproduced +
fixed in the SAME lesson, log at `remotion-svg-primitives/lesson-data/kptest-count-to-two/_logs/w3b-primitive-build.md:35,39`).
**Prevention:** never write a literal `` (`ComponentName`) `` (or any bare PascalCase placeholder in
backtick-paren form) in the table's own header row — phrase the header as plain prose with no backtick-paren
pattern (e.g. `primitive (catalog id → component)`, the fix the same run landed). Dual-form citation applies to
DATA rows only, never the header.

### Sandbox EPERM on `npm run` under `--sandbox local`
sig: w3b-primitive-build::sandbox|npm-run-eperm
recurrence: 2
**Root:** the seatbelt sandbox denies read access into `node_modules/**` for the subprocess `npm run` spawns to
resolve itself, so any `npm run registry:*` invocation fails outright inside the sandboxed node; invoking the
underlying `node scripts/registry/<x>.mjs` directly (bypassing npm's own resolution step) is unaffected and
runs green. Observed independently in TWO real runs of the same lesson (`mig-e2e-1`, `e10e11-accept-1`) — both
self-corrected to the direct-node workaround without being told to.
**Prevention:** this node's own `optimize.measure` ops (`lesson-registry-liveness`,
`registry-structural-drift`) already invoke `node scripts/registry/*.mjs` directly for exactly this reason —
never wire a future measure or hook for this node via `npm run`. **Open question for the orchestrator:** this
constraint is not w3b-specific (any sandboxed node whose `bash` use needs `npm` would hit it) — it likely
belongs in the SYSTEM-level `.piflow/lesson-build/template/memory.md` too; flagged as a consolidation item
since this file is scoped to w3b-primitive-build only.

## Active invariants
<!-- hard rules w3b-primitive-build must keep (e.g. writes only within its owns/readScope). -->
- Writes ONLY within its declared `contract.owns` (shape-primitives/, the generated registry files, its own
  `lesson-data/<id>/` + `out/<id>/primitive-checks/` paths) — never another lesson's files, never hand-edits
  the generated structural fields of `primitive-registry.json`/`catalog-digest.md` (those are `registry:build`
  output; only `intent`/`useWhen`/`avoidWhen`/`variants`/`status` prose is hand-authored).
- A REUSE is valid only as a real, LIVE registry member cited in dual form — never a name-matched guess, never
  a brief-hinted name taken on faith (the brief/upstream hint can name a deprecated or nonexistent primitive).
- A new primitive ships ONLY behind a named, unmet teaching demand, serves exactly ONE teaching intention, adds
  no frame/motion literal to its public API, and is never committed without test stills the node itself looked
  at (declaring aesthetic quality from code alone is a hard-floor breach, not a judgment call — now ALSO a hard,
  structural `optimize.measure` gate, `aesthetic-stills-floor`, not merely a soft rule; see the lesson above).
- The topic-intro card is resolved HERE (reuse or design), never deferred to the composer.

## Open threads
<!-- unresolved; drop each when absorbed. -->
- Promote the `npm-run-eperm` lesson to the SYSTEM memory.md (cross-node sandbox constraint) — see the lesson's
  own note above; out of scope for this node-scoped file to write directly.
- `registry:check` (the broader structural gate) is currently measured every run via
  `registry-structural-drift`; if this proves too slow/noisy in practice, consider gating it to
  gap-shipping runs only (a follow-on tuning question, not yet evidenced as a problem).

## History
git log --grep '^skillsys(w3b-primitive-build)'
