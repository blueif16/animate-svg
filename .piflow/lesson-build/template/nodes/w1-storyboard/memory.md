# node: w1-storyboard — memory
<!-- Leg A · OPTIMIZER-FACING. The triage/fixer loop READS + UPDATES this from run traces + logs.
     NEVER injected into w1-storyboard's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = memory-slices.
     w1-storyboard is a PROSE node (no owned code slice — its "logic" is the SKILL + node.json/prompt.md,
     not a `packages/*` module) — every lesson below is tagged `prose — no code anchor` in place of an
     `[[okf-slice]]` link, per the okf-slices convention for a node with nothing in `.agents/okf/topics/`
     to point at. -->

_status: 4 lessons on file (2026-07-09) — 3 seeded from real evidence at runway-authoring time, before
any triage pass had run, plus 1 added same-day from an adversarial hardening pass over the runway itself.
Sources: the documented PRE-W1FIX regression on kptest-fenyuhe-six (preserved at
`_prior-runs/kptest-fenyuhe-six/storyboard.PRE-W1FIX.md`, diffed against the fix in
`remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/_logs/w1-storyboard.md`), the legacy
`kp1-fen-yu-he-intro/storyboard.md` artifact (predates the current lesson-storyboard SKILL contract), and
the adversarial pass's own proof that `parsePedagogyCues` silently no-op'd on `kptest-count-to-two`'s
`cue-id:` pedagogy variant (now fixed — see the `runway|pedagogy-cue-id-variant-blind` lesson below). No
node.json/prompt.md edit has landed yet — these are OPEN content-quality lessons the runway's hard
measures (`tools/storyboard-lint.mjs`) now catch mechanically; they are recorded here so triage doesn't
re-diagnose them as new the first time they recur.

## Current behavior
<!-- what w1-storyboard reliably does now, updated from traces. -->
No live-run trace sampled yet under the current node.json contract (5 real fixtures reviewed — the
mature ones — all pass the current hard-measure set clean; see criteria.md §5 "Wiring + readiness").
Update this section after the first real optimize pass.

## Known failure modes
<!-- the generalized LESSON + WHY (not the diff). Write each recurring failure in this exact shape:
       ### <symptom signature>
       sig: w1-storyboard::<key>
       recurrence: <N>
       prose — no code anchor
       **Root:** <why it happens>
       **Prevention:** <the generalized guard> -->

### The measure itself silently no-op'd on a real pedagogy.md variant (a RUNWAY defect, not a content one)
sig: w1-storyboard::runway|pedagogy-cue-id-variant-blind
recurrence: 1
prose — no code anchor
**Root:** an adversarial pass (2026-07-09) proved `tools/storyboard-lint.mjs`'s `parsePedagogyCues`
returned `[]` on `kptest-count-to-two/pedagogy.md` — the SAME fixture criteria.md §5 cited as evidence
the hard measure was validated. That fixture's pedagogy uses a bare fenced ` ```\ncue-id: cue-1-count\n…```
` block (a 5th real corpus variant); the fenced-fallback regex matched only the literal `cue:` token, so
`cue-id:` silently produced zero pedagogy cues. `discovery-coverage-floor` and `stage-ceiling-exceeded`
are both gated `if (pedagogyCount > 0)`, so BOTH degraded to no-ops on this run while the tool reported
only a non-blocking `pedagogy-unparseable` ADVISORY (invisible to `ok`) — a fail-OPEN on a hard measure
that could not evaluate its own input, exactly the class of defect `measurement-runway.md`'s VALIDITY
check exists to catch, and it was missed at authoring time because nobody re-ran the tool against the
fixture's own real pedagogy.md (only its storyboard.md side was checked).
**Prevention:** `parsePedagogyCues` now accepts `cue:` and `cue-id:` as the same label; a genuinely
unparseable pedagogy.md now surfaces `pedagogy-unparseable` as a BLOCKING issue (never an advisory-only
pass) so a future 6th variant fails loud instead of degrading its cross-reference checks silently. Test-
the-measure DISCIPLINE going forward: validating a hard measure means running it against BOTH sides of
every cited fixture pair (pedagogy.md AND storyboard.md), not just the artifact under test — a clean
`ok:true` can hide a `pedagogyDiscoveryCount: 0` no-op if only the top-level verdict is read.

### A same cue-COUNT hides a silently dropped or re-decided discovery
sig: w1-storyboard::design|discovery-drop-same-count
recurrence: 1
prose — no code anchor
**Root:** the PRE-W1FIX storyboard on kptest-fenyuhe-six carried 9 cues — numerically matching
pedagogy's 9 discoveries — yet never referenced the routine-reprise discovery ("6 will be split the
same way 5 was... transferring to a new whole") anywhere; it was silently replaced by folding
announce-topic straight into the first split cue. A count-based coverage check cannot catch this
(9 == 9); only reading the discovery CONTENT against pedagogy's, side by side, surfaces the swap. Two
of that same run's cues also carried the wrong stage (`concrete` where pedagogy said `represent` for
the routine-reprise and the recap) — a second, related fidelity break in the same run.
**Prevention:** `tools/storyboard-lint.mjs`'s `discovery-coverage-floor` (count-based) and
`stage-ceiling-exceeded` checks are now wired as the COARSE backstop (catch gross undercounting / gross
stage overreach); the precise "right discovery, verbatim, per cue" fidelity check is criteria.md C3 —
deliberately Required, not Aspirational, because a hard floor with a matching count and swapped content
would otherwise slip through undetected (see criteria.md C3's anti-Goodhart note).

### Co-equal targets starved of matching reinforcement + wait-times bundled across targets
sig: w1-storyboard::design|coequal-breadth-starved
recurrence: 1
prose — no code anchor
**Root:** the same PRE-W1FIX run gave the 3和3 split a dedicated `cue-reveal-answer` (revealing ONLY
3和3 as "the answer") while its co-equal peers 1和5/2和4 got no equivalent beat — one target starred,
two starved, breaking SKILL §8 "breadth before depth". The same run ALSO bundled all three per-target
wait-times into ONE shared `cue-learner-response-gap` instead of a dedicated echo cue per target (SKILL:
"an invite-echo gets its OWN cue — the wait-time is a real beat"). Both are the same underlying lapse:
treating co-equal targets as fungible instead of giving each its own matching beat.
**Prevention:** criteria.md C4 (co-equal breadth) and C5 (echo/wait-time is its own beat) are both
Required, quote-anchored directly against this regression's failure signatures. No hard-measure floor
covers this (co-equal treatment requires reading WHICH target a beat serves, a judgment call) — it is
criteria-only by design.

### Duration/frame literals leak into storyboard.md despite the "NO durations" law
sig: w1-storyboard::discipline|duration-literal-leak
recurrence: 2
prose — no code anchor
**Root:** two independent real instances. (1) The legacy `kp1-fen-yu-he-intro/storyboard.md` (predates
the current SKILL contract) carries a per-cue `**Estimated duration**: N–Ms` annotation on every one of
its 10 cues — a wholesale violation of "timing is decided only by W3.5". (2) The PRE-W1FIX run on
kptest-fenyuhe-six — while under the CURRENT contract — silently shortened the mandated `learner-
response-gap` wait-time constant from the TEACHING-ACTIONS.md value (`≥3-5s`) to a bare `≥3s`, a subtler
instance of the same discipline gap (deciding/altering a timing value at W1 instead of citing the fixed
registry constant untouched). Both are a producer treating a timing NUMBER as its own to decide or
adjust, rather than either omitting it entirely or citing the fixed constant verbatim.
**Prevention:** `tools/storyboard-lint.mjs`'s `duration-or-frame-literal` hard check now fires on both
shapes (validated directly against both real artifacts during authoring — see criteria.md §5). The
check whitelists exactly the fixed `3-5s`/`≥3-5s` citation and the verbatim reconcile-formula quote, so
a genuine per-cue estimate or an altered constant still trips it while the two known-legitimate citation
patterns (the wait-time constant, and a backward-looking "~30-60s ago" spaced-recall interval) do not.

## Active invariants
<!-- hard rules w1-storyboard must keep. -->
- Every cue's `discovery ref` must be checkable against pedagogy.md's OWN discovery sentence for that
  beat — never silently reworded into a different claim, even when the cue COUNT still matches (see the
  discovery-drop lesson above).
- Co-equal targets (as pedagogy declares them) get matching cue-shape and exposure treatment; a
  highlighted/keystone target earns extra DWELL, never extra unmatched cues (see the breadth lesson).
- No duration/frame literal anywhere in storyboard.md except the fixed `≥3-5s`/`3-5s` wait-time constant
  and a verbatim citation of the Wave-3.5 reconcile formula — timing is W3.5's alone.

## Open threads
<!-- unresolved; drop each when absorbed. -->
- **`invite-echo` has no blessed CHORAL variant in TEACHING-ACTIONS.md.** Its `requires` mandates a
  real ≥3–5s silent gap, but a choral/count-along close is simultaneous (no gap) — flagged independently
  by kptest-first-second-third's pipelineFindings ("invite-echo lacks a choral/count-along variant").
  `storyboard-lint.mjs`'s `echo-without-gap-tag` advisory currently tolerates this via an explicit
  "choral" note in the cue body; the real fix (blessing the variant in TEACHING-ACTIONS.md) is outside
  this node's owned files.
- **A pedagogy that FOLDS the recap role into a teaching cue, rather than emitting it as a separate
  closer, is a legitimate case the SKILL's recap-merge prose doesn't explicitly name** (kptest-
  count-to-two: cue-2's end-recall absorbs both the insight AND the recap role; the run correctly did
  NOT force a second closer). Watch for a future run treating this fold as "the SKILL's two-closer rule
  applies" and wrongly duplicating the recap — no hard measure catches this; it is a C7 judgment call.
- **Tail-anchoring for a syncable target is a real, positive precedent, not yet codified.** kptest-
  first-second-third resolved a genuine tension between the SKILL's head-anchor rule and natural
  Mandarin ordinal word order (target at the utterance END) by using a dedicated short cue whose exact
  narrationFrames make tail-anchoring equally reliable. Worth watching whether this recurs as a durable
  pattern (candidate for criteria.md C9 exemplar refresh, or for the SKILL itself to bless the
  tail-anchor alternative).

## History
git log --grep '^skillsys(w1-storyboard)'
