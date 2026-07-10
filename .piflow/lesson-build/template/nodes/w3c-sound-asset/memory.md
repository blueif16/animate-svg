# node: w3c-sound-asset — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into w3c-sound-asset's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: 2 lessons (both from real historical runs, recurrence computed from `_logs/sound-asset.md` grep, not asserted)_

## Current behavior
DEFAULT=REUSE holds in every sampled run: every requested key across 14/15 sampled lessons resolves cleanly in
one fast pass, zero gap-mints observed. Log evidence density varies widely run-to-run (lesson 2).

## Known failure modes

### No machine gate asserted registry membership
sig: w3c-sound-asset::no-registry-membership-gate
recurrence: 1
[[sound-design-sfx]]
**Root:** `checks.post` was always `[]` — resolution was pure self-report, nothing re-checked a claimed "all
resolve" against the real `_beds|_sfx|_stings _index.json`. The `kptest-compare-more-fewer` run flagged this
itself: "W3c has no machine gate that asserts every audio-cues.json key ∈ library _index.json."
**Prevention:** `optimize.measure` now wires `sound-asset-gap-scan` (`scripts/gap-scan-lint.mjs`), cross-checking
every key against the indexes + the vlog_test manifest/generated sidecars, folding counts into the substrate
measure report for triage. Non-blocking (measure, not a live gate) pending validation across more real runs.

### A malformed/schema-violating audio-cues.json was silently reported fully resolved
sig: w3c-sound-asset::unvalidated-input-passed
recurrence: 1
[[sound-design-sfx]]
**Root:** `kptest-classroom-objects/audio-cues.json` is both invalid JSON (unclosed `sfx` object) AND
schema-malformed (bed/intro.sting/outro.resolve wrapped as `{key:"..."}` objects) — yet its `sound-asset.md`
claimed full resolution. Nothing validated the input before the model reasoned about it.
**Prevention:** `checks.pre` now runs `json-parses` on the injected `audio-cues.json` (blocks before the model
spends a turn). `gap-scan-lint.mjs` also flags a non-string bed/sting/sfx value or non-boolean `outro.resolve`
as a `schemaViolation`, independent of the parse check.

## Active invariants
- Writes ONLY `_logs/sound-asset.md` under the lesson's own `lesson-data/<id>/`; the shared-sound library and
  vlog_test pipeline are read-only from here (a genuine mint runs the vlog_test generator, never a direct
  write into the library).
- The SFX vocabulary is NOT fixed to `pop`/`chime`/`whoosh`/`tick`/`ta-da` in practice — the live
  `_sfx/_index.json` carries 37 names. A key outside the SKILL's illustrative list is not automatically a
  defect; check it against the LIVE index, never the SKILL's list.

## Open threads
- `gap-scan-lint.mjs` is newly wired (this pass) — unvalidated against a real gap-mint run. Reconsider
  promoting it from `optimize.measure` (retrospective) to a live `checks.post` gate-run once proven stable.
- criteria.md C5 (metadata sanity) has never been reached by any sampled real run — watch whether the loop can
  climb to it once real judge passes accumulate.

## History
git log --grep '^skillsys(w3c-sound-asset)'
