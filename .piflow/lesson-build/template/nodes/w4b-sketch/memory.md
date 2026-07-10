# node: w4b-sketch — memory
<!-- Leg A · OPTIMIZER-FACING. The triage/fixer loop READS + UPDATES this from run traces.
     NEVER injected into w4b-sketch's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = memory-slices
     skill (MODE B). Code-map twin: [[sketch-overlay-marks]] (the TeacherMark primitive this node's
     spec targets — resolve there for the component signature/props, never duplicate it here). -->

_status: new — no runs recorded yet_

## Current behavior
<!-- what w4b-sketch reliably does now (1–3 lines), updated from traces. -->

## Known failure modes
<!-- the generalized LESSON + WHY (not the diff). Reflect on failures, not successes.
     Write each recurring failure as a lesson block in THIS exact shape (the recurrence reader parses it, and
     the machine `sig:` is what flips a residual LAPSE→SKILL once it recurs; a block with no `sig:` is skipped):
       ### <symptom signature>
       sig: w4b-sketch::<key>          (the machine key = signatureOf output; node::sorted-anomalies|reason)
       recurrence: <N>            (cross-run count)
       [[sketch-overlay-marks]]        (the code-map slice the fixer reads)
       **Root:** <why it happens>
       **Prevention:** <the generalized guard> -->

## Active invariants
<!-- hard rules w4b-sketch must keep (e.g. writes only within its owns/readScope). -->
- Every offset in the per-cue mark table is CUE-RELATIVE (an offset from `cues[id].startFrame`, or a
  `cueLength`-formula); a master-timeline absolute frame anywhere in `sketch-overlay.md` is a hard
  failure the node exists to prevent (ASR realignment moves absolute frames between runs).
- Mark vocabulary is closed: `underline | wrap-arc | label-arrow | vs-mark`. Do not invent a kind.
- Restraint is the rule: total marks (counting multi-instance rows) ≤ `floor(cueCount × 0.6)`; most
  cues should carry ZERO marks. A shipped mark without a stated unique-signal sentence is a defect.
- `readScope` does not include `src/` — this node writes a PROSE SPEC only; it never touches scene
  code (the composer, `w4a-composer`, is the sole consumer that turns the spec into `<TeacherMark>`
  instances — see `[[composer-scene-assembly]]`).
- Every mark row must carry what the composer's resolution formula needs (`cueId`,
  `drawOnRelativeStart`, `drawOnDuration`, `fadeOutRelativeStart`) and must note the manifest
  (`SceneElement`) registration requirement — a mark that reaches the composer without it is invisible
  to the collision gate (`npm run lesson:check`) and can silently occlude a label.

## Open threads
<!-- unresolved; drop each when absorbed. -->

## History
git log --grep '^skillsys(w4b-sketch)' && git log --grep '^optimize(w4b-sketch)'
