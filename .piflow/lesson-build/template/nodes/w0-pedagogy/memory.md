# node: w0-pedagogy — memory
<!-- Leg A · OPTIMIZER-FACING. The optimize/enhance loop READS + UPDATES this from run traces + git.
     NEVER injected into w0-pedagogy's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: 1 lesson (lesson-kind mislabeling → acquisition-fact leakage), already fixed at the SKILL level; verify it does not regress_

## Current behavior
<!-- what w0-pedagogy reliably does now (1–3 lines), updated from traces. -->
The one sampled post-piflow-port run (`kptest-count-to-two`, run `count-to-two-001`) split the brief's single
"one beat" into two cues per SKILL §5 (one-cognitive-task-per-beat: the counting ACTION vs the cardinality
RELATION are two distinct §1 shapes), reported zero issues, and did no exploratory `ls`/probe turns before
writing. Too small an N to call this a settled pattern — just the current baseline.

## Known failure modes
<!-- the generalized LESSON + WHY (not the diff). Reflect on failures, not successes.
     Write each recurring failure as a lesson block in THIS exact shape (the recurrence reader parses it, and
     the machine `sig:` is what flips a residual LAPSE→SKILL once it recurs; a block with no `sig:` is skipped):
       ### <symptom signature>
       sig: w0-pedagogy::<key>          (the machine key = signatureOf output; node::sorted-anomalies|reason)
       recurrence: <N>            (cross-run count)
       [[<okf-slice-key>]]        (the code-map slice the fixer reads)
       **Root:** <why it happens>
       **Prevention:** <the generalized guard> -->

### Wrong lesson-kind silently forces the L2-only leakage carve-out onto an L1 acquisition fact, fragmenting it downstream
sig: w0-pedagogy::lesson-kind|acquisition-mislabeled-as-insight
recurrence: 1
prose — no code anchor (the fix landed in the `lesson-pedagogy` SKILL prose, not in this node's own
node.json/prompt.md; there is no OKF code slice for a pure-reasoning node)
**Root:** `kptest-fenyuhe-six` (2026-06-11) declared `lesson kind: math-insight` for a lesson whose three
part-whole bonds (1和5/2和4/3和3) are acquisition targets the child must produce on demand, not an insight the
picture reveals. §4's leakage carve-out was written as L2-only ("a word or sound"), so a math *fact/bond* being
drilled didn't trigger it — the voice self-banned naming the whole ("还是六"), and the rendered narration came
out as a broken fragment ("一和五，分成。") that dropped the conserved total. The wrong w0 label was invisible
locally (the artifact was well-formed) and only surfaced as a downstream narration defect — the exact leverage
risk this node carries as the FIRST node (see `criteria.md` C1).
**Prevention:** landed `skillsys(lesson-pedagogy)` commit `a3b38fe` — generalized §4's carve-out to any
acquisition target (fact/bond/word/sound, named in FULL = delivery, not leakage) and generalized §8's
complete-utterance rule to EVERY relation/retrieval beat, not just the final one. Verified by a clean-room M3
re-run + independent judge (regenerated `pedagogy.md` names the whole, voices the conserved total). Kept as a
standing lesson here (not deleted on fix) so a regression — a future lesson mislabeled `math-insight` when its
content is really acquisition — is recognized as THIS pattern recurring, not a fresh defect.

## Active invariants
<!-- hard rules w0-pedagogy must keep (e.g. writes only within its owns/readScope). -->
- Writes ONLY `pedagogy.md` + `_logs/w0-pedagogy.md` under its own `lessonId` — never another lesson's files
  (prompt.md READING LAW: no cross-lesson reads, no learning from a prior lesson's artifacts).
- No `mkdir`/`ls`/bash existence-probe before `write` — the node has no `bash` tool at all (`tools.allow`:
  read/write/edit/submit_result only) and `write` creates missing parent dirs; a blocked-on-missing-bash status
  is a prompt-discipline violation, not a legitimate block.
- `criteria.md` (this node's judge-facing gold + rubric) and this `memory.md` are NEVER injected into
  w0-pedagogy's own prompt — seeing the bar or its own failure history voids the clean-room signal.
- No self-audit / ✓-checklist / audit section inside `pedagogy.md` itself — the structured return + tier-2 log
  are the only legal home for self-checks (enforced by `node.json` `optimize.measure` `no-self-audit-leakage`).

## Open threads
<!-- unresolved; drop each when absorbed. -->
- **SKILL §9/§10 has no named `lesson kind` for L1 fact-drilling.** Self-reported in `kptest-fenyuhe-six`'s
  tier-2 log pipelineFindings (2026-06-12): §9 frames the acquisition carve-out around L2 (words/sounds); a
  lesson acquiring L1 math FACTS (e.g. number bonds) had to coin `math-acquisition` ad hoc. Still true as of this
  writing — `SKILL.md` §9/§10's `lesson kind:` line is still `<math-insight | language/L2 | ...>` with no third
  named slot. Low urgency (the coinage works, downstream waves key off the header line regardless of exact
  wording) but worth a SKILL edit if `math-acquisition` (or a sibling) recurs across lessons.

## History
git log --grep '^skillsys(w0-pedagogy)' — this node's own commits (none yet as of this writing).
git log --grep '^skillsys(lesson-pedagogy)' — the SKILL this node's prompt points to as its operating
system-prompt; a defect fixed there (e.g. `a3b38fe`) IS a w0-pedagogy fix and won't show under the node's own
scope name. Check BOTH.
