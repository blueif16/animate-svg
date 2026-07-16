# node: w3c-sound-asset — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into w3c-sound-asset's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: 3 lessons (recurrence computed from `_logs/sound-asset.md` grep + the adversarial-pass fixture proofs, not asserted)_

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
**Prevention:** `optimize.measure` wires `sound-asset-gap-scan` (`scripts/gap-scan-lint.mjs`) against the
indexes + the vlog_test GENERATED sidecar, folding counts into the substrate measure report. HARDENED this
pass (membership-only was gameable): (a) `statSync`s the real `.wav`+`.license.txt` before counting a key
resolved — a never-produced mint now fails, not passes; (b) hard-fails a zero-key `audio-cues.json` (every
lesson needs ≥1 `bed`) instead of a silent `totalKeys:0` — reproduced against `kptest-compare-more-fewer`'s
current `{}` input; (c) cross-checks the log's own comma-grouped byte counts against the real stat() size.
Validated via constructed + real lesson-data fixtures; not yet exercised via a live `piflowctl optimize` run.

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

### A measure op's OWN documentation note broke its execution
sig: w3c-sound-asset::measure-op-note-token-literal
recurrence: 1
[[sound-design-sfx]]
**Root:** `optimize.measure[0].note` (free-text) literally contained `{{arg.lessonId}}` to explain an engine
limitation in prose. `resolveDeep` walks the WHOLE op object incl. `note`, and a real run's `run.json` has no
persisted `args` (verified on a real run dir), so the token threw `MissingArgError` and dropped the ENTIRE op
into `ops.rejected` — the script never ran, silently, for every run of this product to date.
**Prevention:** the note now carries zero literal `{{…}}` tokens. General rule for ANY `optimize.measure` op:
never embed a literal `{{…}}` in prose — `resolveDeep` can't tell "text about a token" from "a token," and one
unresolvable string anywhere in the op silently voids the whole measure.

## Active invariants
- Writes ONLY `_logs/sound-asset.md` under the lesson's own `lesson-data/<id>/`; the shared-sound library and
  vlog_test pipeline are read-only from here (a genuine mint runs the vlog_test generator, never a direct
  write into the library).
- The SFX vocabulary is NOT fixed to `pop`/`chime`/`whoosh`/`tick`/`ta-da` in practice — the live
  `_sfx/_index.json` carries 37 names. A key outside the SKILL's illustrative list is not automatically a
  defect; check it against the LIVE index, never the SKILL's list.

## Open threads
- Hardened + fixture-validated this pass; still needs a LIVE `piflowctl optimize` run to confirm
  `ops.rejected` no longer fires in practice (only standalone-resolver-tested so far).
- `kptest-compare-more-fewer`'s `audio-cues.json` is `{}` on disk today though its log (+ this file's old
  calibration note) describe 4 resolved keys — likely fixture/product-data drift, not this measure's to fix;
  flagged for a product-triage pass.
- criteria.md C5 (metadata sanity) has never been reached by any sampled real run.

## History
git log --grep '^skillsys(w3c-sound-asset)'
