# node: w1-storyboard — GOLD CRITERIA (the QUALITY bar above the hard floor)
<!-- JUDGE / OPTIMIZER-FACING. Consumed by the optimize substrate's judge stage (`optimize.criteria`
     in node.json) and the human eye. NEVER injected into w1-storyboard's runtime prompt — seeing the
     bar teaches-to-the-test and voids the clean-room signal the loop depends on (the same law as
     `.agents/TEACHING-ACTIONS.md`'s own discipline and nodes/*/memory.md). Authored via the method in
     `piflow-overlord/references/building-measures.md`. -->

## What this file is (read before judging)

`tools/storyboard-lint.mjs` (wired as `optimize.measure[]`) is a PRIOR, separate stage: every cue
carries its 5 output-contract fields, the discovery set isn't grossly undercounted, no cue's stage
exceeds pedagogy's own ceiling, no duration/frame literal leaks in, and the exposures ledger exists.
**None of the marks below is a schema, count, or regex check** — those already passed; a storyboard
that fails any of them never reaches this file. This is the QUALITY stage, ONE step ABOVE that floor.

These marks judge what code cannot: whether the cue spine is the **real teaching rhythm** pedagogy
asked for, or a technically-valid document that would still ship a narrated slideshow. This is the
single failure the lesson-storyboard SKILL itself names as the most common: *"producing one cue per
idea — present it, next slide. That yields a narrated slideshow that covers the content and teaches
none of it."* Every criterion below exists to make THAT failure unable to hide behind a clean-looking
artifact.

**Aggregation.** Required marks (C1–C5, C6, C7, C8) are the floor of *quality* above the hard floor —
miss one and the storyboard is not good, revise it. C9 (Aspirational) is the headroom discriminator:
a storyboard can clear every Required mark and still be merely competent — C9 is what separates
competent transcription from a spine that visibly improved on what pedagogy handed it.

**How to score each mark.** PASS requires *quotable evidence in storyboard.md* (or, for a discovery-
fidelity check, a side-by-side quote against pedagogy.md) — no quote, no pass. Judge only what is
OBSERVABLE in the artifact; never credit unstated intent.

---

## 1. What w1-storyboard is, and its LEVERAGE on the eventual lesson video

**Core responsibility.** w1-storyboard is the SECOND node (after w0-pedagogy's discovery gate). It
reads `pedagogy.md` (the discovery list) + `.agents/TEACHING-ACTIONS.md` (the teaching-move registry)
and writes ONE artifact, `storyboard.md`: the ordered cue spine — stable cue IDs, each carrying a
discovery ref, a stage (carried from pedagogy, never exceeded), the teaching action(s) it performs, the
narration-beat INTENT (no copy), the required visual (read off the teaching move's `requires`), and a
machine-readable `exposures` ledger. It decides the teaching VERB and the reinforcement RHYTHM before
any layout exists.

**Leverage on lesson quality (the sentence that seeds every soft criterion).** *Every later wave —
visual-design's zones, audio-captions' narration, voice/ASR's per-cue clips, the composer's scene code
— binds to the cue IDs and teaching-action tags this node commits. A storyboard that silently drops a
discovery, starves a co-equal target, bundles all wait-times into one shared beat, or decides the
teaching verb AFTER the layout is already implied, produces a structurally under-taught video that no
downstream craft can repair — the SKILL's own "narrated slideshow" failure is invisible in any single
cue and only visible across the WHOLE spine.* w1-storyboard emits a lean markdown spec, but it is the
single point where "does this lesson actually TEACH, rhythmically" is decided.

**Grounded in a real regression, not a hypothetical.** `memory.md` records the PRE-W1FIX defect on
kptest-fenyuhe-six: a storyboard with the SAME cue count as pedagogy's discovery count nonetheless
silently dropped the routine-reprise discovery, starved two of three co-equal splits of their
retrieval beat, and bundled three per-target wait-times into one shared cue. Every one of C3, C4, C5
below exists directly because of that regression, cited by quote in its own entry.

---

## 2. The CHECKLIST — coverage (did the spine ENGAGE each dimension at all?)

Run this FIRST, before grading. Not the graded bar; it asks only *"did the spine attempt this
dimension, yes or no?"* so a silently-skipped dimension has a concrete target it is failing against.

- [ ] **Reinforcement rhythm** — an acquisition/insight target that pedagogy's reinforcement plan
  calls for gets a REAL sequence of cues (model → practice/retrieval → recall), not one cue that
  states the content and moves on.
- [ ] **Teaching verb decided first** — every cue names a real move from TEACHING-ACTIONS.md before its
  required-visual is described.
- [ ] **Discovery fidelity** — the discovery SET is complete and verbatim-referenced; none invented,
  none silently dropped, none re-decided.
- [ ] **Co-equal breadth** — parallel/co-equal targets get matching cue-shape and exposure treatment;
  no target is starved while a peer gets extra cues.
- [ ] **Echo/wait-time is a real, separately-held beat** — `invite-echo` pairs with its own
  `learner-response-gap`, one per target, never bundled.
- [ ] **Required-visual is grounded in the LIVE catalog**, read off the teaching move's `requires`,
  never a stale brief-suggested name or an invented one.
- [ ] **Exactly one functional closing retrieval recap** (or two closers with explicitly distinct
  retrieval functions, named as such).
- [ ] **The exposures ledger is traceable** — every count reconciles to an enumerable set of real cues,
  not an aspirational guess.
- [ ] **Stage discipline** — no cue's declared stage exceeds what pedagogy carried for that discovery.
- [ ] **Judgment beyond transcription** — the spine visibly resolves a tension pedagogy/the SKILL left
  open (a fragment repaired to a complete relation, a genuinely well-scoped gap flag), rather than
  purely restating pedagogy verbatim.

---

## 3. The CRITERIA / RUBRIC (graded; Required = R, Aspirational = A)

### C1 · Reinforcement rhythm is REAL, not a narrated slideshow — **REQUIRED, top leverage**
**PASS —** Quote a place where an acquisition target gets a model cue AND a genuinely separate
retrieval beat (an echo/wait-time cue, or an ask-then-reveal pair) realizing pedagogy's own
reinforcement line — not one cue that states the content and advances. A pedagogy-sanctioned bundle
(e.g. a split+合 model folded into one cue, per kptest-fenyuhe-six's own pedagogy: *"W1 may bundle a
split+合 model into one cue... or split them, as the choreography requires"*) still passes provided the
RETRIEVAL beat is separate and real.
**FAIL —** The SKILL's own named failure: *"producing one cue per idea — present it, next slide...
covers the content and teaches none of it."* A reinforcement-tagged discovery realized as a single
inert cue with no retrieval beat.
> **Why this can't be gamed.** Cue COUNT alone proves nothing — a spine can pad cue count without ever
> creating a real retrieval gap (a decorative "recap" cue that just restates content is not retrieval).
> The pass requires the retrieval beat to be independently identifiable (an echo/gap tag, or a picture-
> answers-after-a-held-question pair) — a surrogate ("this cue mentions reinforcement") does not earn it.

### C2 · The teaching VERB is decided before any layout — **REQUIRED**
**PASS —** Quote a cue where the required-visual is visibly DERIVED from its named teaching action's
`requires` (e.g. `count-on` ⇒ "exactly one new item per spoken number, in sync" driving the visual, not
the other way around).
**FAIL —** A cue whose required-visual reads as a layout/composition decision with a teaching-action tag
bolted on after the fact, or a cue with no teaching action at all (SKILL Discipline: *"A cue whose only
purpose is to say a sentence... is filler — fold or cut it"*).

### C3 · Discovery fidelity — the discovery SET is kept, verbatim, never silently re-decided — **REQUIRED, top leverage**
**PASS —** Every `discovery ref` quotes (or closely paraphrases without altering meaning) pedagogy's OWN
discovery sentence for that beat, and the full discovery SET is present (at most one sanctioned
closing-recap merge, per the SKILL's explicit fold rule). Quote the pedagogy sentence and its storyboard
echo side by side.
**FAIL (the documented regression) —** memory.md's PRE-W1FIX case: a storyboard whose cue COUNT matched
pedagogy's discovery count nonetheless never referenced the routine-reprise discovery anywhere — it was
silently replaced by an ad hoc reinterpretation folded into a different cue. The cue existed; the
DISCOVERY did not.
> **Why the hard floor can't catch this.** `storyboard-lint.mjs`'s discovery-coverage check only counts
> discovery-ref LINES — it cannot tell a genuine discovery from a same-count substitution. This
> criterion is the only place a silent content-swap is caught, which is exactly why it is Required, not
> Aspirational: a hard floor with the same count and a wrong content set would otherwise slip through.

### C4 · Reinforcement breadth is CO-EQUAL across parallel targets — **REQUIRED**
**PASS —** Quote that pedagogy-declared co-equal targets get matching cue-shape/exposure treatment
(SKILL §8 "breadth before depth" — kptest-fenyuhe-six: each of 1和5/2和4/3和3 gets exactly one model +
one echo cue; the 3和3 highlight is expressed as extra DWELL on its echo, never an extra cue).
**FAIL (the documented regression) —** PRE-W1FIX gave 3和3 alone a dedicated `cue-reveal-answer` while
1和5 and 2和4 got no equivalent — one target starred, its co-equal peers starved.

### C5 · The echo/wait-time is a REAL, separately-held beat — **REQUIRED**
**PASS —** Quote an echo cue pairing `invite-echo` with its OWN `learner-response-gap`, one dedicated
cue per target (kptest-fenyuhe-six: `echo-1-and-5`, `echo-2-and-4`, `echo-3-and-3` — three separate
held silences, each ≥3–5s per TEACHING-ACTIONS.md).
**FAIL (the documented regression) —** PRE-W1FIX bundled ALL THREE per-target wait-times into ONE shared
`cue-learner-response-gap` — a single vague retrieval window standing in for three distinct bonds.

### C6 · Required-visual names LIVE catalog vocabulary, read off the teaching move's `requires` — **REQUIRED**
**PASS —** Quote a required-visual that cites a name the run confirmed against `catalog-digest.md` (or
explicitly flags a genuine, precisely-scoped gap for W3b) — never a brief-suggested name propagated
without confirming it is still live (a brief's continuity note can name a since-deprecated primitive).
**FAIL —** A required-visual copied verbatim from the brief's Continuity section with no catalog check,
or one vague enough that W3b must re-derive what was actually needed.

#### C6a · The required-visual is stated as a RELATION, not a per-lesson literal — **ASPIRATIONAL**
**PASS —** The required-visual is phrased so it would generalize to a DIFFERENT lesson using the same
teaching move (e.g. "countables + the per-item tag, not badge-and-highlight double" — a relation) rather
than a lesson-specific literal description that only makes sense for this one artifact.
**FAIL —** A required-visual so tightly bound to this lesson's specific nouns that it could not be
recognized as an instance of the teaching move's general `requires`.

### C7 · Exactly ONE functional closing retrieval recap — **REQUIRED**
**PASS —** Quote that the spine ships exactly one retrieval recap, OR — when two closers exist — that
they carry EXPLICITLY DISTINCT retrieval functions, named as such (kptest-fenyuhe-six: `aggregator-prompt`
= "ACTIVE PRODUCTION from a blank prompt" vs `recap` = "canonical replay for closure" — the one case the
SKILL sanctions two closers).
**FAIL —** Two "show them all again" cues back to back with no named functional distinction — the
SKILL's forbidden case.

### C8 · The exposures ledger is TRACEABLE, not aspirational — **REQUIRED**
**PASS —** Quote that each target's exposure count reconciles to an enumerable set of real cues in the
spine (model + echo + recap, each countable by name) — SKILL: *"keep it accurate to the actual cues,
not aspirational."*
**FAIL —** A ledger count that does not reconcile to any named cue set (invented, or copied from a
pedagogy target list without checking the realized spine).

### C9 · The spine exercises JUDGMENT beyond transcription — **ASPIRATIONAL**
**PASS —** Quote a place where the storyboard visibly RESOLVES a tension the SKILL or pedagogy left
open, rather than transcribing verbatim — e.g. repairing a fragment pedagogy stated as a stranded token
into the complete relation (SKILL: *"repair the intent to the complete relation here"*), or naming a
required-visual gap precisely enough that W3b needs no further derivation. The real near-miss precedent:
kptest-first-second-third recognized that the SKILL's "target at the cue HEAD" anchor rule assumes
head-anchoring is the only reliable anchor, and — for a dedicated short cue whose exact narrationFrames
make TAIL-anchoring equally reliable — resolved a genuine Mandarin word-order tension the SKILL had not
anticipated, without inventing an unnatural phrasing to force compliance.
**FAIL —** Competent, faithful, mechanical transcription everywhere, with no visible point where the
spine improved on or resolved a tension in what it was handed; a vague gap flag that dumps the judgment
call onto the next wave instead of scoping it.

---

## Calibration note — which marks a typical current good run is expected to FAIL

A typical current *good* run (the post-fix fixtures: kptest-fenyuhe-six, kptest-compare-more-fewer,
kptest-greetings-verify, kptest-first-second-third, kptest-count-to-two) reliably clears the
**fidelity-and-discipline cluster — C1, C2, C3, C4, C5, C7, C8** — because these are exactly the
failures the PRE-W1FIX regression surfaced, fixed, and fenced (memory.md). C6/C6a are usually clean on
catalog-confirmed vocabulary but the RELATION-phrasing sub-mark (C6a) is inconsistently reached. **C9 is
the discriminator expected to stay unmet on most runs** — most good runs are faithful, disciplined
transcriptions of pedagogy + TEACHING-ACTIONS.md, which is exactly what C1–C8 reward; visibly RESOLVING
an open tension (not just following a rule) is rarer. kptest-first-second-third's tail-anchoring
resolution is the closest real instance on file, and even it stops short of the higher bar (proactively
catching and fixing a breadth-starvation risk pedagogy's own reinforcement plan under-specified, not
just resolving an anchor-position tension). When a run clears C9 convincingly, that is the signal a
genuinely excellent storyboard — not merely a correct one — was produced.

---

## 4. GOLD — an annotated exemplar (off-distribution, so the judge calibrates on the bar, not the answer)

> A storyboard for a lesson unlike any current test case — an early-childhood L2 politeness routine
> (please / thank you), condensed to essence. Read it, then the quote-map against every criterion.

**Lesson shape (paragraph).** *A child wants a bun from the baker. She asks nicely ("please"), the
baker hands it over (the insight: politeness gets a response — shown, not told), and she thanks the
baker ("thank you"). Please and thank-you are co-equal acquisition targets, each earning one model cue
and one held echo cue; the handover is a single insight cue between them; the recap replays both
phrases in the same exchange order that opened the lesson.*

```
### announce-topic
- stage: represent
- teaching action(s): announce-topic
- narration beat intent: name the lesson ("今天学说'请'和'谢谢'") — the title reads alone; the baker
  and the child enter only after it has read.
- required visual: LessonIntroCard (announce-topic requires: title reads alone, cast enters after).

### ask-please
- discovery ref: "asking nicely has a word — 'please' — you say when you want something."
- stage: concrete
- teaching action(s): model-target-slow
- narration beat intent: the child voices "please" slowly, isolated in its own breath-group, pointing
  at the bun.
- required visual: DialogueExchange turn; ReadAlongHighlight surfaces "please" (per model-target-slow
  requires: target isolated, big/held).

### echo-please
- discovery ref: "the child retrieves 'please' by saying it back."
- stage: concrete
- teaching action(s): invite-echo -> learner-response-gap
- narration beat intent: NO voice — a true >=3-5s silent gap (baked into the WAV at zero TTS cost) for
  the child to echo "please". The held visual IS the prompt.
- required visual: held ReadAlongHighlight "please" + a "your turn" PulseCircle affordance through the
  gap.

### baker-hands-bun
- discovery ref: "the baker gives the bun because she asked nicely — politeness gets a response,
  discovered by watching, never announced."
- stage: represent
- teaching action(s): reveal
- narration beat intent: NO pre-announcement of the cause; the picture delivers the handover; narration
  only frames the moment ("看").
- required visual: DialogueExchange handover beat; the bun changes hands as the sole focal change (per
  reveal requires: the picture carries the insight, narration must not pre-say it).

### ask-thankyou
- discovery ref: "receiving something nice has its own word — 'thank you' — said right after."
- stage: concrete
- teaching action(s): model-target-slow
- narration beat intent: same shape as ask-please (co-equal target) — the child voices "thank you"
  slowly, isolated, holding the bun.
- required visual: identical structure to ask-please: DialogueExchange + ReadAlongHighlight on "thank
  you". No compression versus the please cue.

### echo-thankyou
- discovery ref: "the child retrieves 'thank you' by saying it back."
- stage: concrete
- teaching action(s): invite-echo -> learner-response-gap
- narration beat intent: NO voice — the same >=3-5s held silence as echo-please (co-equal treatment,
  no shortening).
- required visual: held ReadAlongHighlight "thank you" + the same "your turn" affordance.

### recap
- discovery ref: "please, receive, thank you is ONE polite exchange, not two separate drills."
- stage: represent
- teaching action(s): spaced-recall
- narration beat intent: recap both phrases in the SAME exchange order they occurred — please -> (the
  handover, wordless) -> thank you.
- required visual: RecapSpotlight walking both phrases in order with ONE live highlight following the
  currently-spoken item.

exposures:
  please: 3
  thank you: 3
```

### How this gold spine passes each mark (quote-anchored)

| # | Mark | The line that earns the PASS |
|---|------|-------------------------------|
| C1 | Real reinforcement rhythm | `ask-please` (model) + `echo-please` (a genuinely separate, held retrieval beat) — not one cue that states "please" and moves on; same for thank-you. |
| C2 | Verb decided first | `echo-please`'s required visual ("held ReadAlongHighlight + a 'your turn' PulseCircle") is DERIVED from `invite-echo`/`learner-response-gap`'s `requires`, not an arbitrary layout choice. |
| C3 | Discovery fidelity | Every `discovery ref` states the exact discovery in full; the handover discovery (`baker-hands-bun`) is present and not silently folded into the please/thank-you acquisition cues. |
| C4 | Co-equal breadth | `ask-thankyou`/`echo-thankyou` are IDENTICAL in shape and cue-count to `ask-please`/`echo-please` — "no compression versus the please cue." |
| C5 | Real echo/wait-time | `echo-please` and `echo-thankyou` are each their OWN cue with `learner-response-gap`, never bundled into one shared gap. |
| C6 | Live catalog vocabulary | `DialogueExchange`, `ReadAlongHighlight`, `RecapSpotlight`, `PulseCircle` are all named as registered, reused components — none invented, none copied uncritically from a hypothetical brief. |
| C6a | Relation-phrased | "held ReadAlongHighlight + a 'your turn' PulseCircle affordance through the gap" reads as a RELATION (any invite-echo cue needs this), not a please-specific literal. |
| C7 | One functional recap | Exactly one `recap` cue; no second closer competing for the same retrieval function. |
| C8 | Traceable exposures | `please: 3` = ask-please (model) + echo-please (retrieval) + recap (recall) — three NAMED cues, not a guess; same for thank-you. |
| C9 | Judgment beyond transcription | The recap is explicitly ordered "please -> (the handover, wordless) -> thank you" — the spine recognized the wordless handover beat belongs IN the recap's sequence (closing the causal loop: politeness -> response -> gratitude) even though the handover itself carries no acquisition target to recall, a resolution the SKILL's "recap re-presents the target set" language does not spell out verbatim. |

---

## 5. Wiring + readiness (how these plug into triage, per the runway)

- **HARD** → `optimize/substrate/w1-storyboard.storyboard-lint.json` (node.json `optimize.measure`): the
  5-field completeness check, the discovery-coverage floor, the stage-ceiling check, the duration/frame-
  literal check, and the exposures-ledger-presence check — plus the reused trace detectors + digest
  anomalies + `deriveStatus` + return-schema enforcement (all zero-new-code, per building-measures.md
  Part D). These are the axes triage cites as "detector + evidence line".
- **SOFT** → this file's checklist + rubric + gold (§2–§4) as the blind judge's references — JUDGING
  only, never injected into w1-storyboard's own prompt.
- **VALIDITY confirmed before wiring (test-the-measure, not skipped):** every hard-measure rule above was
  run against REAL fixtures both ways during authoring — clean (`ok:true`, zero issues) on 5 current-
  contract storyboard.md's (kptest-fenyuhe-six, -compare-more-fewer, -greetings-verify,
  -first-second-third, -count-to-two — only one true minor gap surfaced: `count-to-two`'s
  `announce-topic` cue never declares a `stage`), and firing REAL issues on two known-bad artifacts: the
  documented PRE-W1FIX regression on kptest-fenyuhe-six (2 duration-literal hits — the bug also silently
  shortened the wait-time constant from ≥3-5s to ≥3s, a previously-undocumented finding) and the legacy
  `kp1-fen-yu-he-intro/storyboard.md` (15 duration/frame-literal hits from its per-cue "**Estimated
  duration**: N–Ms" annotations — the exact defect class this rule exists to catch). A measure that
  silently passes a wrong artifact is worse than none; none of these did.

- **CORRECTION (adversarial pass, 2026-07-09) — the claim above was itself unverified on one axis.** The
  "clean on 5 current-contract fixtures" claim was true only by ACCIDENT for `kptest-count-to-two`:
  `parsePedagogyCues` returned `[]` on its pedagogy.md (a bare fenced `cue-id:`-keyed block — a 5th real
  corpus variant the parser's fenced fallback only matched on the literal token `cue:`), which silently
  degraded `discovery-coverage-floor` + `stage-ceiling-exceeded` to no-ops on the very fixture cited as
  evidence they worked, and surfaced only a non-blocking `pedagogy-unparseable` ADVISORY — invisible to
  `ok`, easy to miss, and never noticed here. Four fixes landed in `tools/storyboard-lint.mjs`, each
  re-verified against the corpus:
  1. **`cue-id:` support** — the fenced-block parser now accepts `cue:` and `cue-id:` as the same label.
     Before: `kptest-count-to-two` → `pedagogyDiscoveryCount: 0` (silent no-op). After: `→ 2` (correct),
     with the SAME single pre-existing gap (`announce-topic` missing `stage`) as the only issue — the
     coverage-floor/stage-ceiling checks are no longer blind on this fixture.
  2. **`pedagogy-unparseable` is now a BLOCKING issue, never an advisory** — a pedagogy.md matching NONE
     of the 5 known shapes now fails the report (`ok:false`) instead of passing quietly. Confirmed on the
     legacy `kp1-fen-yu-he-intro/pedagogy.md` (predates the contract, still genuinely unparseable): now
     reports `pedagogy-unparseable` as an issue alongside its other real defects, where it used to be a
     drop-in advisory only.
  3. **Non-empty/placeholder enforcement on the 5 required fields** — a field whose LABEL is present but
     whose VALUE is empty (`discovery ref:` with nothing after it) or a bare placeholder (`required
     visual: TODO`) now counts as MISSING; before, presence-of-label was the only test, so both passed
     silently. Verified against a constructed fixture carrying both defects: OLD tool → `ok:true`, zero
     issues; NEW tool → `ok:false`, both flagged (`cue-missing-required-field` for each).
  4. **Token-scoped duration whitelist** — the whitelist forgave the fixed `3-5s`/`≥3-5s` wait-time
     constant by VALUE alone, with no check it was actually citing the constant; a per-cue
     `**Estimated duration**: 3-5s` annotation (the SAME violation class as the PRE-W1FIX/legacy
     regressions, just phrased to match the whitelisted value) sailed through untouched. The exemption
     now additionally requires the citing LINE to carry one of the wait-time vocabulary tokens (gap /
     silence / wait / learner-response / invite-echo / retrieve) — true of all 6 real citations across
     the 5 current-contract fixtures (still exempted), false of a context-free literal (now flagged). On
     the same constructed fixture: OLD tool did not flag the gamed `3-5s`; NEW tool fires
     `duration-or-frame-literal` on it.
  All 5 current-contract fixtures were re-run after the fix and remain exactly as originally claimed
  (4 fully clean, `count-to-two` with its one pre-existing gap only) — the correction closes a blind spot
  in the MEASURE, not a regression in the corpus. See `memory.md`'s
  `pedagogy-cue-id-variant-blind` lesson for the recurrence record.
