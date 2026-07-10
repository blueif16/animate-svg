# node: w3-5-reconcile — memory
<!-- Leg A · OPTIMIZER-FACING. The optimize/enhance loop READS + UPDATES this from run traces + git.
     NEVER injected into w3-5-reconcile's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the `memory-slices`
     skill (MODE B) / the optimize/enhance loop's MEMORIZE step. -->

_status: 0 lessons (no observed run-time failure yet); 2 open threads (a pre-spec-upgrade artifact + a
log/artifact staleness on the SAME sampled gold run, neither a node defect — see Open threads)_

## Current behavior
<!-- what w3-5-reconcile reliably does now (1–3 lines), updated from traces. -->
The one sampled genuine run with real content (`kptest-count-to-two`, run `ctt-2`, reused from an earlier fresh
pass — `status: ok`) read `visual-design.md`'s per-cue motion-budget table faithfully: the TS artifact's
`VISUAL_MOTION_SECONDS` (3 cues — `announce-topic`/`cue-1-count`/`cue-2-cardinality` @ 2.2/5.0/6.0s) matches
visual-design.md's own table 1:1, id-for-id and value-for-value (verified by direct inspection while hardening
this runway). It emitted the CURRENT export shape (`as const` budget map + `FROZEN_CLIP_IDS` cross-check +
`CueAccessors`), and the animatic gate verdict was PASS on every cue. **CORRECTION (this line previously said
the tier-2 log's own reconcile-math table quoted the SAME values verbatim — that was WRONG:** the on-disk
`_logs/w3-5-reconcile.md` for this lesson is STALE, describing a superseded 4-cue vocabulary/values that
predates a self-correcting fix baked into the TS artifact's own header comment; see Open threads.) Every other
run dir under `.piflow/lesson-build/runs/` shows this node `pending`/`reused` with an empty `events.jsonl` — no
other real execution trace exists yet. Too small an N (1) to call any of this a settled pattern; it is the
current baseline, not a verified rate.

## Known failure modes
<!-- the generalized LESSON + WHY (not the diff). Reflect on failures, not successes.
     Write each recurring failure as a lesson block in THIS exact shape (the recurrence reader parses it, and
     the machine `sig:` is what flips a residual LAPSE→SKILL once it recurs; a block with no `sig:` is skipped):
       ### <symptom signature>
       sig: w3-5-reconcile::<key>          (the machine key = signatureOf output; node::sorted-anomalies|reason)
       recurrence: <N>            (cross-run count)
       [[<okf-slice-key>]]        (the code-map slice the fixer reads)
       **Root:** <why it happens>
       **Prevention:** <the generalized guard> -->
(none yet — the one sampled run was clean. The historical `Record<string, number>` pattern found in
`kptest-fenyuhe-six`'s on-disk artifact predates this node's CURRENT prompt/spec entirely — it was correct
under its THEN-contract, so it is not logged here as a node failure; see Open threads.)

## Active invariants
<!-- hard rules w3-5-reconcile must keep (e.g. writes only within its owns/readScope). -->
- Writes ONLY `<Camel>LessonTimeline.ts` + `_logs/w3-5-reconcile.md` under its own `lessonId` — never another
  lesson's files (prompt.md READING LAW: no cross-lesson reads, no learning from a prior lesson's timeline "to
  see the pattern").
- `VISUAL_MOTION_SECONDS` is declared `as const`, never `Record<string, number>` — see `criteria.md`'s red-flag
  exemplar for why an index-signature type silently disables the cue-id compile-time safety net.
- `FROZEN_CLIP_IDS` cross-check + `makeCueAccessors` throwing resolver are non-negotiable — no `?? 0` fallback,
  ever (`optimize.measure` gates both; `checks.post` blocks the run on either regressing).
- `criteria.md` (this node's judge-facing bar) and this `memory.md` are NEVER injected into w3-5-reconcile's own
  prompt — seeing the bar or its own failure history voids the clean-room signal.
- `narrationFrames`/`gapFrames`/`tokenOnsets` are frozen input — read verbatim off the generated Clips module,
  never locally recomputed (the audio truth is FROZEN after W3a; see prompt.md line 4).

## Open threads
<!-- unresolved; drop each when absorbed. -->
- **`kptest-fenyuhe-six`'s on-disk `LessonTimeline.ts` predates the `c487c5e` (2026-07-03) throwing-accessor
  upgrade** and still shows `VISUAL_MOTION_SECONDS: Record<string, number>` with no `FROZEN_CLIP_IDS`/
  `CueAccessors` — confirmed by direct inspection while building this runway (measures.md §4). Not a fresh
  regression (the file predates the spec change) and NOT hand-filed as an `issues/` entry — a genuine issue's
  `firstSeen`/`lastSeen`/`id` are tool-stamped against a REAL judged run (`postProcessJudgeDrafts`), and this is
  a repo-observation, not a triage-pass finding. A real `piflowctl optimize triage --node w3-5-reconcile` pass
  (or a manual re-run of this node for `kptest-fenyuhe-six`) should surface it properly and create `issues/`
  lazily on first draft. Flagging here so the finding isn't lost.
- **`issues/` scaffolded EMPTY via `.gitkeep`, never a `.md` placeholder.** `listIssues`
  (`optimize/substrate/issues.ts:404-410`) parses EVERY `.md` file under `issues/` as a candidate Issue with no
  per-file try/catch (`parseIssueFile` is fail-closed — a missing frontmatter key throws), so a `README.md`
  scaffold would break the very first `piflowctl optimize triage --node w3-5-reconcile` pass. **Consolidation
  item for the orchestrator:** at least `w0-pedagogy/issues/README.md`, `w3c-sound-asset/issues/README.md`,
  `w5-render/issues/README.md`, and `w6-verification/issues/README.md` (sibling lanes, checked read-only) use
  exactly this unsafe pattern — worth a fleet-wide fix (swap each `README.md` → `.gitkeep`) before the first
  real triage pass on any of those nodes.
- **`criteria.md`'s C1 anchors on visual-design.md's `| cue | discovery ref | visualMotionSeconds | motion
  intent |` table shape**, confirmed against `kptest-count-to-two` only. If w2a-visual-design's own
  criteria/prompt allows a materially different table shape for other lessons, C1's evidence-quoting
  instruction may need a second anchor point (measures.md §5 open question).
- **`_logs/w3-5-reconcile.md` for `kptest-count-to-two` is STALE relative to the CURRENT on-disk
  `kptestCountToTwoLessonTimeline.ts`/`kptestCountToTwoClips.ts`** — confirmed by direct inspection while
  hardening this runway (2026-07-09, an adversarial-pass finding). The log's own INPUTS-READ line + reconcile-
  math table describe a SUPERSEDED 4-cue vocabulary (`lesson-intro`/`first-apple-one`/`second-apple-two`/
  `cardinality` @ narrationFrames `[77,80,98,80]`, visual budget 2.0/2.5/3.0/3.5s) that the CURRENT TS
  artifact's own header comment says was corrected ("The composer previously invented a 4-id vocabulary … that
  did not exist in the audio, so reconcile threw at import") to the REAL 3-cue vocabulary (`announce-topic`/
  `cue-1-count`/`cue-2-cardinality` @ narrationFrames `[63,175,168]` per the current `kptestCountToTwoClips.ts`,
  visual budget 2.2/5.0/6.0s per visual-design.md's real table — these DO match). The log's comprehension-floor
  section also cites a storyboard "Reinforcement plan" quote that no longer exists — the CURRENT
  `storyboard.md` `exposures` ledger is `{}` (empty, "insight lesson, not §9"), so the correct current C4
  behavior is the `SKIP` case, not the WARN narrative the stale log shows. Net effect: for the ONE sampled `ok`
  run this node's `memory.md`/`criteria.md` cite as gold, the ARTIFACT and its own TIER-2 LOG are mutually
  inconsistent — a live `piflowctl optimize triage --node w3-5-reconcile` pass (or a fresh re-run of this node
  for `kptest-count-to-two`) would be expected to flag this for real (a C1/C4/C5 FAIL against the current
  inputs read alongside the stale log). This is a PRODUCT/DATA staleness defect (`remotion-svg-primitives/
  lesson-data/kptest-count-to-two/_logs/w3-5-reconcile.md` needs regenerating), not a node/measure defect — not
  hand-filed as an `issues/` entry per the same convention as the fenyuhe-six thread above; flagging here so the
  finding isn't lost. `criteria.md`'s gold exemplar has been re-annotated to quote ONLY the verified-matching
  TS-artifact + visual-design.md pair (never the stale log) and to use the storyboard's real empty-ledger SKIP
  case for C4, with a RECOMPUTED (not quoted-from-the-stale-log) reconcile-math table for C5.

## History
git log --grep '^skillsys(w3-5-reconcile)' — this node's own fix commits (none yet as of this writing).
git log --grep '^optimize(w3-5-reconcile)' — the mechanized adopt path's commits for this node (none yet).
`c487c5e` (2026-07-03) "W3.5 emits the cue-id-union + throwing-accessor timeline pattern" — a WORKFLOW/prompt
commit (not `skillsys(w3-5-reconcile)`-prefixed) that is nonetheless the load-bearing prevention this node's
Active invariants + `criteria.md`'s red-flag exemplar cite; check plain `git log -- .piflow/lesson-build/template/
nodes/w3-5-reconcile` too, since not every relevant change carries the `skillsys`/`optimize` prefix yet.
