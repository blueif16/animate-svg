# node: w3-5-reconcile — QUALITY BAR (the ceiling above the mechanical-floor gates)
<!-- JUDGE / OPTIMIZER-FACING. Consumed by `piflowctl optimize triage --node w3-5-reconcile` (buildJudgePrompt
     reads this file VERBATIM as the judging reference) and by `piflowctl optimize gate` (the fixer's candidate
     judge). NEVER injected into w3-5-reconcile's runtime prompt — a producer that sees its own grading rubric
     teaches-to-the-test and voids the clean-room signal the loop depends on (same law as w0-classify/criteria.md,
     w4a-composer/criteria.md, and .agents/skill-system-criteria.md). Wired via node.json
     `optimize.criteria: "nodes/w3-5-reconcile/criteria.md"`.

     PROVENANCE: the Purpose/Acceptance-criteria/Red-flags below are a working copy of the "W3.5 reconcile"
     section already authored in the product-wide `.agents/skill-system-criteria.md` (lines 269-292) — reused
     VERBATIM, not reinvented, per the "reuse over re-mint" rule (same move w4a-composer/criteria.md made).
     That consolidated file remains the human-facing reference across the lesson-build map; THIS file is what
     the optimize substrate actually reads for w3-5-reconcile today. It carries TWO additions the source lacked:
     (1) the mechanical invariants below are now ALSO hard-gated via `node.json` `optimize.measure` (13 checks —
     see measures.md), so this file's job narrows to what code cannot verify; (2) an Exemplars block — the
     source section had none. Keep the two in sync by hand when either is edited (the w4a-composer memory.md
     open-thread names the same maintenance debt for this whole file family). -->

## What this file is (read before judging)

The **mechanical floor is a PRIOR, separate stage.** `node.json`'s `checks.post` (5 checks, BLOCKING — they gate
the run itself) plus `optimize.measure` (13 checks, NON-BLOCKING — they mirror the same 5 for named evidence in
the measure report, PLUS 8 new checks: two guard the `VISUAL_MOTION_SECONDS` typing against exactly the
regression a real historical artifact shows below, one guards the frozen-clip-id cross-check, and five assert
every required export a downstream consumer imports by name) already assert: `reconcileClipTimeline(` and
`makeCueAccessors(` are called; no legacy timing mechanism (`PADDED_CUE_DURATIONS_FRAMES` / detect-silence /
`ASR_CORRECTIONS`) or silent `?? 0` fallback survives; the budget map is NOT typed `Record<string, number>`
(which would erase the cue-id keys and silently disable the whole compile-time safety net) and IS `as const`;
`FROZEN_CLIP_IDS` (the other-direction cross-check) is present; and all five required exports
(`Cues`/`Duration`/`VoiceClips`/`LessonCaptionCues`/`CueAccessors`) exist. **None of the marks below is that
floor** — passing it earns nothing here.

This node is UNUSUALLY mechanical (its own prompt calls the algorithm "a TRIVIAL, deterministic chain") — the
formula, the chaining, and the accessor shape are ALL hard-gated. So the soft judge's whole job narrows to the
one place real judgment still enters: **is `VISUAL_MOTION_SECONDS` a FAITHFUL, complete transcription of
visual-design.md's own per-cue motion-budget table** (a transcription error is invisible to every mechanical
check — a wrong-but-plausible number, or a dropped/double-counted row, still compiles, still passes every
regex, and still reconciles to a valid-looking timeline that silently caps the cue's motion at the wrong
length) — plus the smaller judgment calls around it: frozen-input discipline, honest handling of the
comprehension-floor advisory, and an auditable tier-2 log.

**EVIDENCE LAW (anti-hallucination).** Every mark requires a QUOTED value from BOTH `visual-design.md`'s
per-cue motion-budget table AND the emitted `VISUAL_MOTION_SECONDS` map (or the tier-2 log's reconcile-math
table) — no quote from both sides ⇒ FAIL. Cite the evidence BEFORE marking. A clean `checks.post`/`optimize.measure`
pass is NOT itself evidence the budget values are faithful — see "Vacuous green" below.

---

## Purpose
_(verbatim from `.agents/skill-system-criteria.md` line 271)_

The single source of truth for every cue's one shared window (start/end frames, narration sub-window,
hold/gap), consumed identically by the composer (visuals), the audio layer (per-cue voice clips), and captions
— so all three are frame-locked and cannot drift.

## Acceptance criteria (what good looks like)
_(verbatim from `.agents/skill-system-criteria.md` lines 273-281 — the mechanical bullets are now ALSO
hard-gated per "What this file is" above; they stay here as the full acceptance record.)_
- Cue windows are COMPUTED, not authored: the module imports the per-cue clip truth and a per-cue motion-budget map and calls the kit reconcile helper (reconcileClipTimeline). No cue start/end frame is hand-typed or copied from any other file.
- The reconcile formula is the v4 cue-anchored one verbatim: `cueFrames = max(narrationFrames + gapFrames, motionFrames) + tail`, cues chained end-to-end from frame 0, tail ≤ ~9 frames / 0.3s. The duration export equals the last cue's endFrame.
- EXACTLY ONE per-cue entry in each direction — parity is judged against the CLIP MODULE: every cue in the generated clip module appears in the visual-motion-budget map and the output cue list, matching IDs (a missing budget should throw, not silently default). visual-design may legitimately budget MORE beats than reach voice — W2b folds echo/wait beats into a typed gap on a carrying cue; those design-only rows get NO budget entry and their dwell must be covered by the carrying cue's gapFrames. Dropping them is a conscious, logged decision, never a silent omission.
- Three views derived from the SAME reconciled object — Cues, per-cue VoiceClips, CaptionCues all flow from one reconcile call; captions mapped from reconciled cues (not re-authored); each VoiceClip anchored to its own cue's startFrame for its measured narration length only.
- Narration audio treated as frozen input: narrationFrames come straight from the measured/trimmed clip module; the module reads them rather than re-deriving from ASR or raw WAVs. Any intra-cue pause is a typed gap.
- The motion budget per cue is a sensible floor sourced from visual-design's visualMotionSeconds (seconds), and where narration exceeds it the window stretches to fit the spoken span plus tail (max() actually binds, visible per cue).
- Self-documenting about inputs and discipline: a header names its two inputs (clip truth + visual-design budgets) and states the cue-as-unit law.
- Pure and deterministic: no Date.now/Math.random/fs/network, no per-lesson hardcoded topic strings or magic frame constants beyond FPS and the tail; same inputs → byte-identical output.

## Red flags (negative criteria — counterweight the positive-only bias)
_(verbatim from `.agents/skill-system-criteria.md` lines 283-291)_
- Re-introduces any banned legacy mechanism: a PADDED_CUE_DURATIONS_FRAMES table, a single continuous voice WAV/Sequence, detect-silences / ASR-boundary snapping, or a continuous-audio drift path.
- Cue start/end frames hand-typed, copy-pasted, or duplicated in a second file (composer/audio/captions computing their own boundaries).
- narrationFrames or cue lengths recomputed from ASR text, raw WAV duration, or audio-captions estimates instead of read from the frozen measured clip module.
- Formula deviates: tail folded INTO motionFrames or applied inconsistently, max() replaced by sum or narration-only/motion-only, gaps dropped, or cues not chained contiguously.
- Budget/clip mismatch passes silently — a cue missing from the budget map gets a hidden default, or a cue in one list absent from the other.
- Captions or VoiceClips authored independently of the reconciled cues (separate caption timing, voice clip fromFrame ≠ its cue startFrame, or durationInFrames padded beyond the measured clip).
- Lesson-specific contamination: topic words, Chinese strings, or specific frame totals baked into the reconcile logic.
- No tier-2 log (`_logs/w3-5-reconcile.md`) — the animatic-gate verdict and the comprehension-floor advisory result are unauditable without it.

**Additional red flags (new — the transcription-fidelity + honesty class the mechanical checks cannot see):**
- **Vacuous green** — every `checks.post`/`optimize.measure` gate passes (calls present, no legacy patterns, exports present) while `VISUAL_MOTION_SECONDS`'s actual seconds values silently diverge from visual-design.md's own per-cue table — a typo, a swapped row, a unit slip (frames read as seconds), or a value that was never actually read from the table at all. Mechanically invisible; only a side-by-side quote catches it.
- **Silent fold-in ambiguity resolved by guessing** — a design row that visual-design.md does NOT explicitly mark as folded into a carrying cue's `gap` is simply dropped from `VISUAL_MOTION_SECONDS` with no `pipelineFindings` entry explaining the call, instead of the honest options (add its own entry, or cite the specific gap it rides and say so).
- **tokenOnsets silently touched** — any local recomputation, rounding, or clearing of a ClipCue's `tokenOnsets`/`targetTokens` instead of passing them through the reconcile call unchanged (they are cue-LOCAL and must survive the cue re-chain verbatim; W4a's spoken-enumeration sync depends on them arriving untouched).
- **Comprehension-floor advisory rubber-stamped or fabricated** — a `SKIP`/`WARN` line present but not actually computed against storyboard.md's `exposures` ledger and lesson-pedagogy §8's floors, or a justification that doesn't quote the storyboard's own stated design intent.

---

## The graded criteria (Required = floor of *quality* above the mechanical gates; Aspirational = discriminators)

### C1 · Motion-budget fidelity to visual-design.md (R, top leverage)
**PASS —** every `VISUAL_MOTION_SECONDS` entry's value is a faithful reading of its cue's own row in
visual-design.md's per-cue motion-budget table (quote BOTH the table row and the emitted value — they must
match, not merely be "close"), AND every design row visual-design.md marks as folded into a carrying cue's
typed `gap` correctly earns NO separate budget entry (no double-count, no dropped beat with no explanation).
**FAIL —** a value that does not match its table row (a typo, a swapped cue, seconds read as frames or vice
versa), a design row silently dropped with no corresponding `gap` on any ClipCue and no `pipelineFindings`
entry, or a budget entry invented for a cue the design table never budgeted.
**Why this cannot be gamed —** `checks.post`/`optimize.measure` already confirm the KEYS match the frozen clip
ids (§"What this file is"); passing that earns nothing here. The only way to pass C1 is for the VALUES to
actually trace back to the design doc — a plausible-looking but fabricated number clears every mechanical gate
and still fails C1.

### C2 · Frozen-input discipline (R)
**PASS —** `narrationFrames`/`gapFrames` are read verbatim off the generated Clips module with zero local
arithmetic (no rounding, no padding, no "safety margin"); any `tokenOnsets`/`targetTokens` on a ClipCue flow
through the reconcile call completely unchanged (quote the ClipCue's onsets and confirm the reconciled cue
carries the identical array).
**FAIL —** any local adjustment to a narration/gap value before it reaches `reconcileClipTimeline`, or a
`tokenOnsets` array that has been recomputed, rounded, reordered, or dropped between the ClipCue and the
reconciled cue.

### C3 · Silent-drop discipline — every non-obvious call is surfaced (R)
**PASS —** any cue where the budget/clip mapping required a judgment call (a design row folded into a gap, a
cue whose motion vs narration relationship is non-obvious, an ambiguous design-table row) is named explicitly in
`pipelineFindings`, with the reasoning a downstream reader would need.
**FAIL —** a judgment call made silently — the reconcile "just works" on inspection but a design row's fate
(kept / folded / dropped) is not traceable from the artifact + log alone.

### C4 · Comprehension-floor advisory — honest, computed, not rubber-stamped (A)
**PASS —** when storyboard.md declares an `exposures` ledger, each target's count is compared against
lesson-pedagogy §8's floor with the actual arithmetic shown (count vs floor, wait-time vs floor in seconds),
and any under-floor WARN carries a substantive justification quoting the storyboard's own stated design intent
(not a bare "acceptable" or "by design"). When no ledger exists, the log prints the explicit `SKIP` line.
**FAIL —** a WARN/pass asserted with no visible arithmetic, a justification that doesn't quote the storyboard,
or the advisory section silently omitted when a ledger IS present.

### C5 · Tier-2 log is a genuinely auditable reconcile trace (A)
**PASS —** `_logs/w3-5-reconcile.md` includes a per-cue table (narration / gap / visualMotion(s) / motion(f) /
content=max(...) / cue=content+tail / start / end) a reader can re-derive the reconciled frames from without
re-running anything, plus the animatic-gate verdict per cue.
**FAIL —** the log summarizes in prose ("all cues fit their windows") with no per-cue numbers a reader could
independently check.

**The apex (aspirational, near-unachievable — do NOT award by default).** A run that passes C1-C3 AND clears
BOTH C4 and C5 with the same rigor the `kptest-count-to-two` gold below shows (quoted arithmetic, quoted
justification, a real per-cue table) is the ceiling this node can reach — most runs will clear C1-C3 (the
mechanical-adjacent Required marks) and vary on C4/C5 depending on how much the log invests in auditability.

---

## The checklist (coverage — did the output silently skip a dimension?)
- [ ] Every cue's motion-seconds value is traceable to visual-design.md's own per-cue table (not invented, not misattributed).
- [ ] A design row folded into a carrying cue's typed gap correctly gets no separate budget entry (no double-count).
- [ ] narrationFrames/gapFrames are read verbatim from the frozen Clips module, never recomputed or padded.
- [ ] tokenOnsets (when present on a ClipCue) pass through unchanged — no local recompute, no silent drop.
- [ ] The cue-id union derives FROM VISUAL_MOTION_SECONDS's own keys (not a hand-typed parallel list that could drift).
- [ ] The FROZEN_CLIP_IDS throw message actually names the bad id + the valid set (a debuggable failure, not a generic one).
- [ ] The comprehension-floor advisory (when an exposures ledger exists) is computed and justified, not skipped or rubber-stamped.
- [ ] The tier-2 log's per-cue reconcile math is a real, checkable table, not a prose paraphrase.
- [ ] Any silently-ambiguous design row is surfaced in pipelineFindings, never silently resolved by guessing.

---

## Exemplars
_(the source `.agents/skill-system-criteria.md` W3.5 section has none yet — added here; per this file's own
provenance note, port back on the next sync.)_

- 🟢 **Gold** — `kptest-count-to-two`, run `ctt-2` (status `ok`) · REAL artifact, VALIDATED (animatic gate PASS,
  every clip fit its cue window)
  > `src/lessons/kptestCountToTwoLessonTimeline.ts:33-37`:
  > ```ts
  > const VISUAL_MOTION_SECONDS = {
  >   "announce-topic": 2.2,
  >   "cue-1-count": 5.0,
  >   "cue-2-cardinality": 6.0,
  > } as const;
  > ```
  > `_logs/w3-5-reconcile.md` INPUTS READ: _"visual-design.md — §5 per-cue motion budget table: C1=2.0s,
  > C2=2.5s, C3=3.0s, C4=3.5s"_ and its own per-cue reconcile-math table quotes the SAME four values in the
  > `visualMotion(s)` column, cue-for-cue — a side-by-side match, not a coincidence of shape.
  >
  > Comprehension-floor advisory (C4): _"`一` (count 1) = 2 exposures < 6 floor — WARN. Storyboard
  > §'Reinforcement plan' justifies: 'Math-insight, not L2 acquisition … no later beat in THIS lesson to recall
  > into → no recap, no echo, no learner-response-gap, no equation.' Brief explicitly caps the count at 1→2."_ —
  > the arithmetic (2 < 6) is shown AND the justification quotes the storyboard's own design intent.

  _Why gold:_ C1 passes because the log itself proves the side-by-side match (not merely "the keys line up");
  C2 passes (no narrationFrames arithmetic anywhere, `gap:0` on every ClipCue, tokenOnsets not touched since
  this lesson's clips carry none); C4/C5 both clear the apex bar — the WARNs are computed + storyboard-quoted,
  and the reconcile-math table is a real per-cue frame-by-frame derivation a reader can check by hand.

- 🔴 **Red-flag** — `_prior-runs/kptest-fenyuhe-six/pre-suffix-20260612/kptestFenyuheSixLessonTimeline.ts` ·
  the pre-`c487c5e` architecture (fixed 2026-07-03, commit `c487c5e` "W3.5 emits the cue-id-union +
  throwing-accessor timeline pattern") · REAL artifact, superseded
  > ```ts
  > const VISUAL_MOTION_SECONDS: Record<string, number> = {
  >   "cue-announce-split-1of5": 6.5,
  >   ...
  > };
  > ```
  > No `<Pascal>CueId` export, no `<UPPER_SNAKE>_CUE_IDS` export, no `FROZEN_CLIP_IDS` cross-check, no
  > `makeCueAccessors` call or `CueAccessors` export anywhere in the file.

  _Why red:_ `Record<string, number>` is an index-signature type — it ERASES the literal cue-id keys, so
  `keyof typeof VISUAL_MOTION_SECONDS` would degrade to bare `string` even if the rest of the pattern were
  added; combined with the total absence of the cross-check/accessor machinery, a stale or renamed cue id here
  had NO compile-time or throw-time defense — exactly the silent-drift class `optimize.measure`'s
  `motion-budget-not-index-signature` / `motion-budget-as-const` / `frozen-clip-crosscheck-present` /
  `export-cueaccessors-present` checks now catch. **Caveat for the fixer:** this file predates the current
  prompt spec entirely (it is not a fresh-run regression) — the interesting fact for the optimize loop is that
  `remotion-svg-primitives/src/lessons/kptestFenyuheSixLessonTimeline.ts` (the CURRENT on-disk artifact for
  this lesson, as of this writing) has NOT been regenerated since `c487c5e` and still shows the same
  `Record<string, number>` pattern with no throwing accessors — a live drift, not just a historical one. See
  `memory.md`'s Open threads.
