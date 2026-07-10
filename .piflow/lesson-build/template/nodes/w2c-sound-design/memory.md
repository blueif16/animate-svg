# node: w2c-sound-design — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into w2c-sound-design's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: 2 lessons (both AudioCues shape drift; recurrence 2 each, found by direct git/log-backed review of
this product's existing lesson-data/* outputs — no optimize round has run against this node yet)_

## Current behavior
<!-- what w2c-sound-design reliably does now (1–3 lines), updated from traces. -->
Reliably reads the three shared-library `_index.json` files (never guesses a key) and reasons carefully
about bed/toneSafe/density choices (see e.g. `kptest-compare-more-fewer/_logs/sound-design.md`'s explicit
toneSafe judgment call). Less reliable at emitting the EXACT `AudioCues` shape the composer expects.

## Known failure modes
<!-- the generalized LESSON + WHY (not the diff). Reflect on failures, not successes.
     Write each recurring failure as a lesson block in THIS exact shape (the recurrence reader parses it, and
     the machine `sig:` is what flips a residual LAPSE→SKILL once it recurs; a block with no `sig:` is skipped):
       ### <symptom signature>
       sig: w2c-sound-design::<key>          (the machine key = signatureOf output; node::sorted-anomalies|reason)
       recurrence: <N>            (cross-run count)
       [[<okf-slice-key>]]        (the code-map slice the fixer reads)
       **Root:** <why it happens>
       **Prevention:** <the generalized guard> -->

### `{key:"..."}` wrapper objects + invented event names instead of the closed vocabulary
sig: w2c-sound-design::schema-shape-drift
recurrence: 2
[[sound-design-sfx]]
**Root:** the executor treats `bed`/`sting`/`sound` as "an asset reference" and reaches for a `{key:
"..."}` wrapper describing the reference conceptually, rather than the schema's plain string; it likewise
invents `event` names that describe the SPECIFIC visual motion (`objectLift`, `title-settle`,
`highlight-empty`) instead of mapping onto the composer's closed `popin|count|transition|reward` vocabulary.
Both are "explain the motion in my own words" failures instead of "quote the fixed enum." Observed in
`kptest-classroom-objects/audio-cues.json` (every `sound`/`bed`/`sting`/`resolve` value nested in a `{key:
…}` object; events `objectLift`/`wordAppear`/`inviteStart`) and `kptest-make-ten/audio-cues.json` (events
`title-settle`/`highlight-empty`/`slide-in-dots`; `outro.resolve` given the string `"sting-outro-resolve"`
instead of `true`). The `kptest-classroom-objects` instance is further aggravated: its `audio-cues.json` is
not even valid JSON (a stray `]` at line 142 where a `}` belongs) — the already-wired `json-parses` check
should have caught this outright; that it didn't suggests that historical run's post-checks were elided
(a companion/dev profile), a separate cross-cutting WIRING gap.
**Prevention:** `contract.schema` now points every `audio-cues.json` at the sibling `audio-cues.schema.json`
(draft-2020-12; `additionalProperties:false` at every level; `sfx[].event` a closed enum) — confirmed via a
direct ajv test to reject both historical instances with precise, quotable errors (see `criteria.md`
"Wiring + readiness"). CAVEAT: the gate silently SKIPS if ajv fails to resolve a 2020-12 build — CONFIRMED
true in this environment today (only ajv v6.12.6/draft-07 resolves from `@piflow/core`'s dependency chain).
Re-verify this gate is LIVE (not skipped) before trusting it in triage.

### Required `lessonId` field silently omitted
sig: w2c-sound-design::missing-lessonid
recurrence: 2
[[sound-design-sfx]]
**Root:** the SKILL never explicitly calls out `lessonId` as a required verbatim echo-back (unlike, e.g.,
w0-classify's SKILL, which states its analogous field's copy-verbatim rule outright) — the executor writes
the SEMANTIC content (bed/sfx) carefully but treats the identity field as bookkeeping and drops it under
budget pressure. Observed in `kp2-counting-by-tens/audio-cues.json` (otherwise schema-clean) and
`kptest-make-ten/audio-cues.json`.
**Prevention:** caught by the same `contract.schema` gate (`required: ["lessonId", "bed", "sfx"]`). If this
recurs AFTER the gate is confirmed live, escalate to the SKILL itself: add an explicit "OUTPUT ARTIFACT —
first field `lessonId`, copied verbatim from `{{arg.lessonId}}`" line to `lesson-sound-design/SKILL.md`,
mirroring how sibling SKILLs state this rule outright rather than leaving it implicit in the schema alone.

## Active invariants
<!-- hard rules w2c-sound-design must keep (e.g. writes only within its owns/readScope). -->
- Writes ONLY within `contract.owns` (`audio-cues.json` + its own `_logs/w2c-sound-design.md`) — never
  another lesson's files, never a code/asset file (asset gaps are named for `w3c-sound-asset`, never built
  here).
- Zero frame literals anywhere in `audio-cues.json` — the schema has no frame field; the composer owns
  timing.
- `toneSafe:true` implies no melodic sting/motif under narration (the tone-language guard).
- Density: ≤1 motivated SFX per beat; `ta-da` at most once per lesson; never a sound over instruction words.
- Every `bed`/`sting`/`sound` key must resolve in the shared library's `_index.json` files — never invented.

## Open threads
<!-- unresolved; drop each when absorbed. -->
- **Registry-membership + density-ceiling hard measure — DEFERRED, not a node defect.** Two more
  deterministic invariants (key-registry membership; the ≤1-per-cue / ≤1-ta-da ceilings) are specified in
  `criteria.md` "Wiring + readiness" but cannot be wired as an `optimize.measure` op today: that stage's
  `ResolveCtx` (`packages/core/src/optimize/substrate/measure.ts:122`) carries no `{{arg.*}}`, and no plain
  `lessonId` state channel is promoted anywhere in this template (only `camelLessonId`/`composition`, by
  `setup-scaffold`) — so a measure op has no way to know WHICH lesson's `audio-cues.json` to check. Owed to
  the orchestrator as a cross-node consolidation item (touches `setup-scaffold` or the SDK, outside this
  node's own scope).
- **ajv 2020-12 resolvability — an SDK/environment-wide gap, not node-specific.** See the schema-shape-drift
  lesson's CAVEAT above; re-verify after any change to `@piflow/core`'s or the environment's ajv dependency.

## History
git log --grep '^skillsys(w2c-sound-design)'
git log --grep '^optimize(w2c-sound-design)'
