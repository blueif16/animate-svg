# node: w0-pedagogy — GOLD CRITERIA (the QUALITY bar above the structural floor)
<!-- JUDGE / OPTIMIZER-FACING. Consumed by the optimize loop's soft scoring, a verify/judge pass, and the
     human eye. NEVER injected into w0-pedagogy's runtime prompt — a gold example in the pedagogy node's
     context collapses judgment into copying and voids the clean-room signal (the same law as
     w0-classify/criteria.md, .agents/skill-system-criteria.md, and nodes/*/memory.md). Discovered BY
     CONVENTION at nodes/w0-pedagogy/criteria.md and pointed to from node.json `optimize.criteria` (the canonical
     key; `optimize.judge` is a back-compat READ alias only — this node authors the canonical spelling).
     Maintenance = the optimize/enhance skill (the same loop that owns memory.md). -->

## What this file is (read before judging)

The **structural floor is a PRIOR, separate stage**: `node.json` `contract.artifacts` + `checks.post`
(non-empty) gate the run itself, and `optimize.measure` (`pedagogy-field-content-valid` — lesson-kind + every
discovery/stage/focal/reinforcement occurrence carries REAL non-placeholder content, not just its header token
— plus `no-self-audit-leakage`) folds deterministic invariants into `optimize/substrate/measure.w0-pedagogy.json`
for triage. **None of the marks below is a presence, format, or field-name check** — those already passed, and
passing them earns NOTHING here.

These marks judge the one thing the floor cannot: **the LESSON this pedagogy plan makes POSSIBLE.**
w0-pedagogy is the FIRST node — "no downstream wave advances without this" (prompt.md) — and it emits prose,
not code, but it sets the teaching object every later wave (storyboard, visual-design, audio-captions,
composer) builds its cue IDs, Visual Contract rows, and narration phrasing directly against. A *subtly
wrong-but-well-formed* `pedagogy.md` — a mislabeled lesson kind, a discovery that is really narration, a stage
reached too early, an unreasoned or templated reinforcement plan, a starved co-equal routine, a fragmentary
retrieval — is invisible to "did it produce a well-formed artifact" and freezes every later wave building
elaborate, technically polished scenes around the WRONG teaching object. The eventual video can render cleanly
and still teach the wrong thing, or nothing, with no way to recover short of redoing the whole pipeline. So the
judge reads ONLY `pedagogy.md` + the raw `brief.md` and asks, as **a senior early-childhood curriculum designer
who has never seen this pipeline** would: *reading only this plan, would you forecast a child who watches the
finished video actually learns what it claims to teach — or has the plan already foreclosed that?*

**These scores are FORECASTS, not measurements.** w0-pedagogy can only be judged on the *teaching ceiling it
sets*, never on the rendered video (a whole-pipeline outcome, and one this node never sees). Grade it as a
downstream forecast, and **say so when you report** — a mark that passes here is a bet later waves confirm, not
a proof. (One such bet was WRONG once for real — see `memory.md`'s `w0-pedagogy::lesson-kind|...` lesson: a
`math-insight` label on an acquisition-fact lesson rendered as a broken narration fragment two waves later.
That is why C1 below is tagged top leverage.)

**EVIDENCE LAW (anti-hallucination).** Every PASS requires a QUOTED line of `pedagogy.md` (or, where the
consequence is downstream and therefore a forecast, a named specific consequence) — no quote ⇒ FAIL. Cite the
evidence BEFORE you mark, never mark then rationalize. Judge only what is OBSERVABLE in the artifact text;
never credit unstated intent.

---

## The checklist — dimensions a great pedagogy plan covers (flag any it silently skips)

- [ ] The `lesson kind:` header is declared AND honestly matches what the brief's content demands (an insight
  the picture reveals vs. an L2 utterance vs. a fact/bond to be drilled) — not merely present.
- [ ] Every `discovery` line states what the child KNOWS LEAVING the beat that they did not know walking in —
  never a restatement of the narration, never "show X".
- [ ] Each discovery fits exactly ONE of SKILL §1's four shapes, and a setup beat earns its place via a
  following beat's contrast (never decoration, never redundant with the brief's own stated obviousness).
- [ ] `stage` never exceeds the lesson's declared ceiling, and the brief's out-of-scope boundary is honored AT
  the stage level, not merely by incidental absence of a symbol.
- [ ] `focal` names the ONE element that CHANGES during the beat — never a static tableau, never two bundled
  cognitive tasks in one cue.
- [ ] `reinforcement` is REASONED per cue, proportional to novelty/difficulty, never templated; acquisition
  targets show the time-floor discipline; the lesson's length emerges from that need.
- [ ] When the brief enumerates several co-equal routines/targets, each earns its own staged delivery + a
  recap retrieval, airtime stays roughly balanced, and the hardest gets a surplus ON TOP of, never instead of,
  the shared baseline.
- [ ] A spaced-recall/retrieval beat brings targets back for genuine RETRIEVAL, not just re-exposure; every
  relation/retrieval beat is a COMPLETE utterance naming the whole, never a fragment.
- [ ] No self-audit / checklist prose is smuggled into the artifact itself (that belongs in the structured
  return + tier-2 log — this dimension is ALSO a hard floor, `no-self-audit-leakage`; a soft judge should never
  need to catch it, but flag it if seen).

---

## The eight criteria (each keyed on a DECISION/RELATION, never mere PRESENCE)

**Required (R)** must ALL pass for a *sound* pedagogy plan. **Aspirational (A)** are the discriminators that
separate a *correct* plan from one that *sets up a genuinely great lesson* — they are NOT required to pass and
NEVER block soundness; they are the headroom the optimize loop climbs toward.

### C1 · Lesson-kind honesty — the header sets the correct carve-out for the WHOLE lesson (R, top leverage)
**PASS —** The declared `lesson kind:` matches what the brief's content actually asks the child to DO: an
insight the picture reveals gets `math-insight`; an utterance/sound to be acquired gets `language/L2`; a
FACT/BOND to be drilled (memorized, produced on demand) gets an acquisition-flavored kind, correctly triggering
SKILL §4's full-naming carve-out and §8's time-floor — never left as a bare insight or L2 label it doesn't fit.
Quote the header and the brief evidence that confirms it.
**Failure signature —** A fact/bond/word the child must MEMORIZE is labeled `math-insight` (or any
non-acquisition kind), silently forcing the §4 leakage rule to suppress the very thing the beat exists to
drill — the child can never hear the fact said in full because the plan thinks it is an aha the picture alone
should reveal.
**Grounding —** SKILL.md §4 (acquisition carve-out) + §9 (L2) + Wave-0 output header. **Why this cannot be
gamed:** the header can carry REAL content (the hard floor, `pedagogy-field-content-valid`) while still being
WRONG — a valid-looking, non-placeholder `lesson kind:` value earns nothing here; only a kind that is actually
correct for the brief's content, forecast against everything the rest of the plan does with it, passes.

### C2 · Each discovery is real teaching, not narration restated (R)
**PASS —** The `discovery` line states what the child KNOWS LEAVING the beat that they didn't know walking in,
in the shape of one of SKILL §1's four (new unit / new operation / relation / felt-property setup) — never "the
spoken sentence." Quote a discovery line and name its shape.
**Failure signature —** A discovery indistinguishable from what the narration already says; an empty/fuzzy
discovery fitting none of the four shapes; a setup beat with no follow-up payoff.
**Grounding —** SKILL §1 ("If the honest answer is 'the spoken sentence,' the cue is narration, not teaching").

### C3 · Stage discipline holds the lesson's ceiling (R)
**PASS —** No cue's `stage` exceeds the lesson's reached ceiling; the brief's out-of-scope boundary (e.g. "no
+/−/=") is honored AT the stage level, not merely by incidental absence of a symbol. Quote a stage line and the
ceiling it respects.
**Failure signature —** A beat introduces a digit/equation/symbol before concrete+represent are earned, "even as
a fun fact"; an out-of-scope operator appears despite no cue explicitly naming it.
**Grounding —** SKILL §3 (concrete → represent → symbolize).

### C4 · Focal is a genuine change, one cognitive task per cue (R)
**PASS —** `focal` names the ONE element that changes during the beat (a motion, a count advancing, a state
flipping) and the cue asks exactly one cognitive thing. Quote the focal and confirm nothing else in the cue also
changes or is asked.
**Failure signature —** A static end-frame the child merely reads rather than watches; two verbs bundled into
one beat (count AND name; transform AND read-result).
**Grounding —** SKILL §5 (one cognitive task per beat) + §6 (the visual change IS the teaching).

### C5 · Reinforcement is reasoned and proportional, never templated (R; A for the acquisition time-floor)
**PASS (R) —** The `reinforcement` line states HOW MUCH this specific discovery needs and WHICH move(s) (or
honestly "none"), visibly proportional to novelty/difficulty — not copy-pasted across cues regardless of
content.
**PASS (A, aspirational) —** For an acquisition target, the plan clears SKILL §8's time-floor (≥6–10 spaced
exposures, a real ≥3–5s wait-time gap, a later spaced recall) AND states the lesson's length as EMERGENT from
that need, never fit to the brief's length hint.
**Failure signature —** A reinforcement line identical in wording/shape across cues regardless of difficulty; a
one-pass slideshow on content that is clearly acquisition (memorized facts given a single clean exposure); a
"3× repeat" claim that is actually one crammed cue.
**Grounding —** SKILL §8 (reason about difficulty/novelty; the acquisition time-floor; length emerges).

### C6 · Breadth before depth — co-equal routines share airtime (R, when the brief enumerates ≥2 co-equal targets)
**PASS —** Each co-equal routine/target gets its own staged delivery AND a recap retrieval; the hardest earns a
SURPLUS on top of, never instead of, the shared baseline; a whole-set tally shows no routine starved. Quote the
tally or the parallel structure across routines.
**Failure signature —** The hard/highlighted item gets several dedicated cues while a co-equal sibling is
name-checked or compressed to a single short cue.
**Grounding —** SKILL §8 ("Breadth before depth — never starve a co-equal routine to over-drill the hard one").

### C7 · Retrieval is genuine — spaced, and complete utterances, never fragments (R)
**PASS —** A spaced-recall beat brings targets back for RETRIEVAL (not mere re-exposure); every relation or
retrieval beat is written as the COMPLETE utterance a teacher would actually say, naming the whole it decomposes
(never a stranded token or a bare list). Quote the retrieval beat and the complete utterance it plans.
**Failure signature —** A recap that is only re-display, never retrieval; a relation planned as a fragment (e.g.
a beat that would render as "一和五，分成。") or a bare list without the whole it decomposes.
**Grounding —** SKILL §8's complete-utterance rule — generalized in `skillsys(lesson-pedagogy)` commit `a3b38fe`
after exactly this failure rendered downstream (see `memory.md`). **This criterion is this node's own
documented lesson**, not a hypothetical.

### C8 · Latent teaching economy — an elegant highlight that never trades away balance (A, aspirational apex)
**PASS —** The plan finds an economical way to register a special/harder case (extra DWELL, a placement in the
model sequence, a felt-property device) that PRESERVES co-equal airtime rather than trading it away for extra
cues — a sign the plan is not merely correct but efficiently elegant. Reaching further: the device also sets up
a discovery or contrast a LATER, separate lesson can pay off — not only resolving within this lesson's own
runtime.
**Failure signature —** The plan can only highlight a special case by giving it strictly more cues than its
co-equal siblings (no economical alternative found), or attempts no highlight at all when the content clearly
has one worth registering.
**Grounding —** SKILL §8 taken to its aspirational edge; the *within-lesson* half of this mark is directly
demonstrated in the GOLD below (extra dwell, not extra cues); the *cross-lesson hook* half is the permanent
headroom — see the Calibration note.

---

## The apex (aspirational, near-unachievable — do NOT award by default)

Reserve top marks for a plan that is not merely sound but **SETS UP A GENUINELY GREAT LESSON**: the right kind
for the right carve-out (C1) + discoveries that are real teaching, correctly staged (C2+C3) + a focal that
truly changes, one task per beat (C4) + reinforcement that clears the acquisition floor and lets length emerge
(C5-A) + balanced co-equal airtime (C6) + genuine, complete-utterance retrieval (C7) + an elegant highlight that
also reaches across lessons (C8, both halves). A plan can pass EVERY Required mark and still not reach the apex
— that is BY DESIGN; the apex is the permanent headroom the loop climbs toward.

## Calibration note — which marks a typical current good run is expected to FAIL

A typical good w0-pedagogy run *reliably passes* the **correctness cluster — C1 (lesson-kind honesty), C2 (real
discoveries), C3 (stage discipline), C4 (focal + one task), C6 (breadth before depth)** — the marks that are
mechanical once the kind is right and the SKILL is followed literally. It is *expected to STALL* on the
**depth/elaboration cluster: C5-A (the full acquisition time-floor, which a rushed plan under-serves even when
it reasons correctly about WHICH moves to use) and C8's second half (a cross-lesson hook — the current real gold
below reaches C8's within-lesson half only: it economizes the highlight, but sets up nothing for any lesson
beyond `kptest-fenyuhe-six` itself)**. When a run clears C5-A fully AND finds a genuine cross-lesson hook, THAT
is the signal a genuinely great plan was produced — hold C8's second half above what the current best run
reaches; do not lower it to make a good-but-not-great plan look complete.

---

## GOLD — real exemplar: `kptest-fenyuhe-six` (VALIDATED `a3b38fe`, post-fix)

> The REAL, validated `pedagogy.md` for `kptest-fenyuhe-six` (six splitting into 1和5 / 2和4 / 3和3). Quoted
> verbatim from `remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/pedagogy.md`. Future test lessons are a
> different topic/KP, so this real artifact still calibrates the judge's eye without answer-leaking a live case.

```
lesson kind: **math-acquisition** (part–whole bonds for 6; the three splits + their 合 are facts the child must
produce on demand, not an insight the picture reveals)
...
stage ceiling: **concrete** for every split beat (operate on six dots); **represent** for the routine reprise
and the recap... **Never symbolize** — no digits, no equation form, no +/−/=.

### Cue 2 — Split 1和5 cycle (model)
discovery: 6 can be split into 1 and 5, and 1 and 5 combine back into 6 — a new bond the child can produce on
demand.
stage: concrete
focal: one dot separates from the other five; the two groups then recombine into the six (split + 合 back as
one continuous motion sequence)
reinforcement: model — voice says "6可以分成1和5；1和5合成6"; picture delivers the parts; the cue ends with a
learner-response wait.

## Reinforcement plan
- Co-equal airtime. All three splits earn the same shape (one model, one wait). The 3和3 highlight earns extra
  dwell on its symmetric hold, NOT extra cues — to preserve co-equal cue counts across the three routines.
- Voice names the bond fully (the §4 acquisition carve-out). The complete utterances "6可以分成1和5" /
  "1和5合成6" name the whole being decomposed — never a fragment like "一和五" spoken without its whole.

### Cue 8 — Aggregator prompt (spaced retrieval of the set)
discovery: the child retrieves the set of all three splits of 6 ... in response to one prompt.
reinforcement: ≥3–5s wait ... co-equal retrieval across all three splits (none starved — a 1和5-only or
3和3-only answer is partial).
```

### How the GOLD passes each criterion (quote-anchored)

| # | Criterion | The line that earns the PASS |
|---|-----------|------------------------------|
| C1 | Lesson-kind honesty (R) | `lesson kind: **math-acquisition** (... facts the child must produce on demand, not an insight the picture reveals)` — correctly names the brief's three bonds as acquisition targets, not insights, triggering the right carve-out. |
| C2 | Real discovery (R) | Cue 2's `discovery: 6 can be split into 1 and 5, and 1 and 5 combine back into 6 — a new bond the child can produce on demand` — states the bond the child leaves owning, a relation-shape (§1), not a restatement of the voice line. |
| C3 | Stage discipline (R) | `stage ceiling: concrete ... represent ... Never symbolize — no digits, no equation form` + the artifact's own "Stage audit" note that no numerals appear on screen. |
| C4 | Focal + one task (R) | Cue 2's `focal: one dot separates from the other five; the two groups then recombine ... as one continuous motion sequence` — one changing element, one task (watch the split-then-合). |
| C5 | Reinforcement reasoned + time-floor (R+**A**) | "Each of 1和5, 2和4, 3和3 is a fact ... gets a model + a learner-response wait-time gap" + "Wait-time floor. ≥3–5s of held silence" — clears the acquisition floor; "Cue boundaries ... owned by W1 — this list is the discovery spine, not the final cue count" states length as emergent. |
| C6 | Breadth before depth (R) | "Co-equal airtime. All three splits earn the same shape ... The 3和3 highlight earns extra dwell ... NOT extra cues" + Cue 8's "co-equal retrieval across all three splits (none starved)". |
| C7 | Genuine complete-utterance retrieval (R) | "The complete utterances '6可以分成1和5' / '1和5合成6' name the whole being decomposed — never a fragment" + Cue 8's aggregator RETRIEVAL prompt (the child supplies the set, not a re-display). |
| C8 | Latent teaching economy (**A**, within-lesson half only) | "The 3和3 highlight is expressed as longer dwell on its hold (cue 7), not as a fourth model cue" — an elegant, balance-preserving highlight. **Does NOT reach C8's cross-lesson half** — see Calibration note; the gold's own text names only a backward link ("builds on kptest-fenyuhe-five"), no forward hook. |

---

## RED-FLAG — real known-bad exemplar: `kptest-fenyuhe-six` PRE-FIX (surfaced by `a3b38fe`)

> The REAL prior artifact, `_prior-runs/kptest-fenyuhe-six/pedagogy.PRE-FIX.md` — the file the `a3b38fe`
> post-mortem fixed. Quoted verbatim. This is the VALIDITY proof: a soft judge reading only this text must FAIL
> it on the criteria below even though the file is well-formed prose that would pass every hard-floor check.

```
lesson kind: math-insight

> The acquisition-flavored reinforcement (per §8) is for the three math facts (1+5=6, 2+4=6, 3+3=6 as
> part-whole relations), not for Chinese words. The child already speaks Chinese. The §4 narration-leakage
> rule applies normally — the picture delivers the split, the narration names the result.

### cue-announce-split-1of5
discovery:     the lesson is about 6, and 6 can be split into one and five — the most uneven split.
reinforcement: one pass (modeled once; 1和5 will be re-encountered in conserve and in the recap)

## Audit checklist (every downstream subagent runs this against its own output)
1. Each cue corresponds to exactly one `discovery` sentence above.
2. No cue smuggles in arithmetic operators ...
[... 9 numbered self-audit items ...]
```

### How the RED-FLAG fails (quote-anchored)

| # | Criterion | Why it FAILS |
|---|-----------|---------------|
| C1 | Lesson-kind honesty (R) | `lesson kind: math-insight` — labels three memorized part-whole bonds as an insight the picture reveals. The file's own preamble even argues it explicitly ("The §4 narration-leakage rule applies normally"), self-justifying the wrong carve-out. |
| C5 | Reinforcement reasoned + time-floor (R) | Every split/conserve cue reads `reinforcement: one pass` — three facts the brief demands the child produce on demand get a SINGLE clean exposure each (model + conserve + recap ≈ 3 touches), well under SKILL §8's ≥6–10 spaced-exposure acquisition floor. This is the correctness of an INSIGHT lesson applied to ACQUISITION content — the direct downstream consequence of the C1 mislabel. |
| C7 | Genuine complete-utterance retrieval (R) | **Forecast, evidenced by the landed fix commit rather than this file's own prose** (per the "these are forecasts" framing above): `a3b38fe`'s own "why" states the RENDERED narration two waves downstream came out as *"一和五，分成。"* — a fragment that drops the whole (6) and suppresses the conserved total ("还是六" self-banned). The root is legible here: a `math-insight` label forces §4's leakage rule onto a fact the plan should have voiced in full, and this file's cue prose never overrides that with an explicit full-utterance instruction the way the GOLD's "voice names the bond fully" line does. |

**Also fires the HARD floor, independently of the soft judge.** The `## Audit checklist` section (9 numbered
self-audit items baked into the artifact) is exactly what `node.json`'s `no-self-audit-leakage` measure exists
to catch — this file is the real known-bad case that check was validated against (see `node.json`'s
`optimize.measure` note). A soft judge should never need to flag this; it is included here only to show the
hard/soft boundary holding on a real file (structural leakage ⇒ hard fail; lesson-kind/reinforcement/retrieval
⇒ soft fail — two different layers, two different failures, same known-bad artifact).

> This exemplar shows the leverage law concretely: ONE wrong header line (C1) cascades into an under-reinforced
> plan (C5) and a downstream narration defect (C7) — three failures from one root, none visible to a
> "well-formed artifact" check, all visible to a judge reading the plan as a curriculum designer would.
