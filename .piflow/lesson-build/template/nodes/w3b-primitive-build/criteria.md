# node: w3b-primitive-build — GOLD CRITERIA (the QUALITY bar above the registry-liveness floor)
<!-- JUDGE / OPTIMIZER-FACING. Consumed by the optimize loop's soft scoring, a verify/judge pass, and the
     human eye. NEVER injected into w3b-primitive-build's runtime prompt — a gold example in the builder's
     context collapses judgment into copying and voids the clean-room signal (the same law as
     .agents/skill-system-criteria.md and nodes/*/memory.md). Discovered via `node.json` `optimize.criteria`,
     read by both the triage agent and the gate. Maintenance = the optimize/enhance skill (the same loop that
     owns memory.md). Built via the method in `piflow-overlord/references/building-measures.md`. -->

## What this file is (read before judging)

The **registry-liveness floor is a PRIOR, separate stage**: the workflow's own `checks.post` asserts
`primitive-gap-scan.md` is non-empty, and `node.json` `optimize.measure` re-runs the immutable oracle
(`check-lesson-primitives.mjs`) out-of-band — `lesson-registry-liveness` (every cited component is a real,
LIVE registry member, non-vacuously) and `registry-structural-drift` (the whole catalog stayed in sync) — and
folds both into `optimize/substrate/measure.w3b-primitive-build.json` for triage. **None of the marks below is
a membership, liveness, non-empty, or schema check** — those already passed, and passing THEM earns nothing
here.

These marks judge the one thing the floor cannot: **whether this scan actually hands the composer a visual
world that can carry the lesson's teaching to a genuinely great end product.** w3b's leverage is unusual among
the pipeline's nodes — it does not just route or spec, it can also SHIP CODE (a new primitive), so its ceiling
cuts two ways: a wrong or lazy REUSE call quietly degrades what the composer can build with, and a badly-built
GAP ships a permanent, reusable capability every FUTURE lesson inherits. The judge reads
`primitive-gap-scan.md` + (when a gap shipped) the new primitive's source, its registry prose, and its test
stills, and asks, as **a senior visual-craft practitioner who has never seen this pipeline** would: *reading
only this scan and what it shipped, would you forecast the composer can build a truly legible, focused,
delightful teaching moment from it — or has this scan already foreclosed that?*

**EVIDENCE LAW (anti-hallucination).** Every PASS requires a QUOTED line of the artifact (or the shipped
primitive's own code/props/registry prose) or a NAMED downstream consequence — no quote ⇒ FAIL. Cite the
evidence BEFORE you mark, never mark then rationalize; a confident-sounding "result" line never moves a mark
on its own. Judge only what is OBSERVABLE; never credit unstated intent.

---

## The checklist — dimensions a great gap-scan (and any shipped gap) covers (flag any it silently skips)

- [ ] Every demand traces to a real teaching ACTION's `requires`, not an already-drawn layout.
- [ ] Every REUSE is genuine — a live registry id AND its actual `useWhen`/variant semantically fits the demand.
- [ ] A GAP ships only when the compose-first reading truly cannot satisfy the demand — no speculative build.
- [ ] Any shipped primitive serves exactly ONE teaching intention — no grab-bag, no default-on flourish.
- [ ] Aesthetic quality is independently VERIFIED via test stills at real render size + worst-case multiplicity.
- [ ] The topic-intro card is resolved here, with title-alone-then-cast sequencing honored.
- [ ] Every row cites the machine-verifiable DUAL form — never a bare kebab id, never a bare Pascal name.
- [ ] The scan shows awareness of what W4a needs downstream (identity invariants, zero frame/motion literals).

---

## The ten criteria (each keyed on a DECISION/RELATION, never mere PRESENCE)

**Required (R)** must ALL pass for `SCAN_SOUND`. **Aspirational (A)** are the discriminators that separate a
*correct* scan from one that *sets up greatness* — they are NOT required to pass and NEVER block soundness;
they are the headroom the optimize loop climbs toward.

### C1 · Teaching-driven demand coverage (R)
**PASS —** every demand row traces to a named teaching ACTION in the storyboard + that move's `requires`
capability (cross-checked against visual-design), and every teaching action the storyboard actually used has a
corresponding demand row — nothing silently dropped. Quote the move and the demand it produced.
**Failure signature —** a demand invented from visual-design's drawn layout with no teaching action behind it
(layout-driven, not teaching-driven); or a storyboard move used with NO matching demand row (a silent gap in
the SCAN itself, not the catalog).
**Grounding —** primitive-builder SKILL "The teaching-driven gap-scan" (the diff is teaching-demand ↔ catalog,
never drawn-scene ↔ missing import).

### C2 · REUSE is genuine membership AND semantic fit — not name-matching (R, top leverage, the anti-Goodhart flagship)
**PASS —** the cited entry's own `useWhen` / `avoidWhen` (quoted from catalog-digest.md), not merely its live
registry membership, actually satisfies the demand. Quote the digest sentence that earns the pick.
**Failure signature —** a citation that is enum-valid and LIVE (passes `lesson-registry-liveness` cleanly) yet
whose own `avoidWhen` contradicts the use — e.g. citing `number-line-track` for discrete-object counting when
its digest row says "not for counting discrete objects with no linear scale; use a `countable-object` set or
`stick-group`"; or `count-step-indicator` (transient, pops-and-fades) used where the demand needs a PERSISTENT
per-item tag (`number-card`'s job) — the real, documented `kptest-count-to-two` distinction between these two.
**Grounding —** primitive-builder SKILL "REUSE is membership, not belief." **Why this CANNOT be gamed:**
`lesson-registry-liveness` (the hard floor) can ONLY confirm the id exists and is live — it has no way to know
whether the picked entry's variant/mode actually fits the demand. A scan can cite a real, live, WRONG-fit
primitive and sail through the hard gate while still routing the composer to the wrong tool. This criterion is
the only thing that catches it; passing the hard floor earns nothing here.

### C3 · Gap discipline — a GAP ships only when truly unmet (R)
**PASS —** the gap row (or the zero-gap result line) states precisely which teaching capability NO catalog
entry — singular or composed — satisfies; reuse → compose → build-primitive → generate-asset was walked in
order and stopped at the first hit. Quote the stated unmet capability.
**Failure signature —** a new primitive shipped for a demand that composing two existing catalog primitives
already serves (the REUSE-default violated); or a hand-rolled one-off SVG in the scene standing in for what
should have been a named, registered gap.
**Grounding —** primitive-builder SKILL "Default = reuse / compose" (the fixed visual-source order; most
lessons stop at compose).

### C4 · Single-teaching-intention discipline (R when any gap ships; N/A on a genuine zero-gap pass)
**PASS —** the artifact (or its tier-2 log) states the Step-1 ONE-teaching-intention sentence as a single
clause with no "and," and every visual element in the shipped primitive completes the single-intention test —
INCLUDING naming and CUTTING at least the obvious tempting extras (an arrow, a sparkle, a ring, a tally) that
did not survive the test. Quote the intention sentence and one cut extra.
**Failure signature —** a shipped primitive bundling ≥2 unrelated teaching jobs; any flourish that defaults ON
or auto-enables from context instead of being an explicit caller opt-in; or an artifact showing NO evidence the
test was ever applied (nothing named as considered-and-cut is itself a tell for any primitive beyond the
most trivial).
**Grounding —** primitive-builder SKILL "Building a named gap — the two-step law" + "the single-intention test"
+ "Forbidden when authoring a component."

### C5 · Aesthetic quality independently VERIFIED (R when any gap ships)
**PASS —** test stills exist for the single hardest frame AND the worst-case multiplicity, and the artifact/log
states a SPECIFIC finger-cover-test verdict (recognizable at lesson scale, at that multiplicity) — not merely
"stills rendered." Quote the verdict and what was checked.
**Failure signature —** stills exist only at one easy/sparse frame; "looks fine" asserted with no finger-cover
verdict; or a primitive shipped with declared aesthetic quality but no still at all (a hard-floor breach
disguised as a soft judgment call — this gate is the ONLY check for "does it look like what it claims to be").
**Grounding —** primitive-builder SKILL "Aesthetic quality is YOURS (the W3→W4 boundary gate)."

### C6 · Topic-intro ownership + sequencing (R)
**PASS —** the artifact explicitly resolves the intro card — REUSE-confirmed fit, or a designed composition
when the normalized card doesn't fit this subject — AND states the title-alone-first / cast-enters-after
sequencing. Quote the resolution and the sequencing note.
**Failure signature —** the intro is silently left for the composer to improvise; or the sequencing note is
absent (risking the cast occluding the title, the exact bug this law prevents).
**Grounding —** primitive-builder SKILL "Topic-intro card ownership" (W3b's job, never the composer's).

### C7 · Machine-verifiable citation discipline (R)
**PASS —** every reuse/gap row cites the DUAL form `` kebab-id (`ComponentName`) `` — not a bare kebab id, not
a bare Pascal name — so the registry oracle can actually resolve and verify it. Quote one compliant row.
**Failure signature —** any row (or, as real evidence shows, the TABLE HEADER itself — see memory.md) breaking
dual form; a name asserted with no id at all.
**Grounding —** primitive-builder SKILL "Output" (the DUAL form is "the only machine-verifiable citation");
`check-lesson-primitives.mjs`'s own anti-vacuous guard.

### C8 · Downstream-foreclosure awareness (leverage-aware reuse) (R)
**PASS —** the artifact's reasoning shows the picks preserve what W4a needs — the SAME primitive instance
persists across a transform (identity invariant), and any shipped primitive's public API takes
`atFrame`/`progress`/offsets with zero baked frame or motion literals. Quote a line showing this awareness.
**Failure signature —** a reuse pick whose OWN catalog note documents it cannot do what the demand needs (the
choice foreseeably forces a W4a workaround); or a shipped primitive with a baked frame/easing literal.
**Grounding —** primitive-builder SKILL "preserving every existing non-negotiable" (ZERO frame/motion literals;
lesson-agnostic + prop-driven).

### C9 · Composition elegance + primitive craft that sets up greatness (A)
**PASS —** the reuse composition is the SMALLEST necessary set — no primitive stacked in "just in case" with no
single-intention job of its own — AND/OR any shipped gap reads, to a senior visual-craft eye, as a genuinely
well-designed, clearly reusable capability future lessons would WANT to reach for, not merely a passable one.
Quote what makes it more than adequate.
**Failure signature —** a workable-but-generic composition padded with an extra primitive doing no real work;
or a shipped gap that is correct and lesson-agnostic on paper yet reads as narrowly built for this one lesson's
feel, unlikely to be reused.
**Grounding —** primitive-builder SKILL "REUSE > compose > build-primitive > make-asset" read for CRAFT, not
just for legality — the aspirational reach beyond "it passes."

### C10 · Pipeline findings carry real signal (A)
**PASS —** a genuine, generalizable workflow observation is surfaced (an ambiguous catalog `useWhen`, a
teaching move whose `requires` doesn't map cleanly, a citation-format gotcha worth fencing in the skill) OR an
honest "none this pass" when nothing arose. Quote the finding.
**Failure signature —** a "finding" that is really a per-lesson complaint, or one that just restates the verdict
table.
**Grounding —** primitive-builder SKILL "Separate the backlog from the verdict."

---

## The apex (aspirational, near-unachievable — do NOT award by default)

Reserve top marks for a scan that is not merely correct but **SETS UP THE CATALOG'S OWN FUTURE**: teaching
fidelity (C1) + fit-verified reuse (C2) + disciplined gap-or-none (C3) +, when a gap ships, a single-intention
build a senior craftsperson would call genuinely well-made and reach for again (C4 + C5 + C9) + intro ownership
honored (C6) + clean machine-verifiable citations (C7) + real downstream awareness (C8) + a genuine pipeline
signal (C10). A scan can pass EVERY Required mark and still not reach the apex — that is BY DESIGN; the apex is
the permanent headroom the loop climbs toward. It must stay above what the current best run reaches, so the
loop can never fully satisfy the bar and plateau.

---

## Calibration note — which marks a typical current good run is expected to FAIL

A typical current *good* w3b run reliably passes the **correctness cluster — C1 (teaching-driven), C2 (fit,
not just membership), C3 (gap discipline), C6 (intro ownership), C7 (dual-form citations), C8 (downstream
awareness)** — the marks the SKILL fences hard and the real `kptest-count-to-two` runs already demonstrate
(zero-gap composition, correct identity-preserving `cardinal-consolidation` pick, dual-form table). It is
*expected to STALL on* **C9 (composition elegance / genuinely covetable primitive craft) and C10 (a real,
non-trivial pipeline finding)** — the discriminators that separate a correct, workable scan from an
exceptional one. Concretely: most real passes are honest zero-gap compositions that correctly reuse the
catalog, but rarely does a run's reasoning read as craft-level elegant, and "no new pipeline findings" is the
common (adequate, not exceptional) outcome. When a run clears C9/C10 too, THAT is the signal of a genuinely
great pass — hold them above the current best run; do not lower them to make a good-but-not-great run look
complete.

---

## GOLD — annotated exemplar: "the hour hand" (off-distribution, so the judge calibrates on the bar)

> A gap-scan for a lesson UNLIKE any current test case (telling time to the hour — no existing pipeline lesson
> teaches this), so the judge cannot pattern-match the answer. The demand names are invented for this exemplar;
> the cited REUSE ids are REAL, live catalog entries (verified against `catalog-digest.md`). Read it, then the
> quote-map. The example IS the specification — it calibrates the judge's eye for "a scan that sets up
> greatness," including the two-step law for a genuine gap.

**Lesson:** *kp-hour-time — "the big hand points straight up and the little hand tells you the hour."*

```markdown
# primitive-gap-scan — kp-hour-time

## result
**one gap** — telling time to the hour has no existing catalog primitive; every other demand is satisfied by
composing existing primitives.

## demand → primitive REUSE table
| demand | primitive (catalog id → component) |
|---|---|
| topic intro (title alone, then the clock cast enters) | `lesson-intro-card` (`LessonIntroCard`) |
| the hour hand sweeping to point at the hour number | `clock-face-hour` (`ClockFaceHour`) — GAP, see below |
| sketch emphasis circling the hour numeral once it's reached | `teacher-mark` (`TeacherMark`) |
| the clock face and numerals entering at the start of the beat | `pop-in` (`PopIn`) |
| a light idle hold on the clock while the teacher talks about it | `breathe` (`Breathe`) |

## storyboard gap flags — resolution
1. **hour-hand-points-to-the-hour** → NO existing primitive teaches "the position of a rotating hand names a
   discrete quantity" (`number-line-track` moves a badge along a line, not a hand around a dial; nothing else
   in `counting`/`interaction`/`sketch` rotates a pointer against a labeled ring). GAP: `clock-face-hour`
   (`ClockFaceHour`).

## clock-face-hour — the two-step build
**Step 1 — ONE teaching intention:** "the hour hand's angular position names the hour it points nearest to" —
the single thing the child must see that no existing component delivers.
**Step 2 — single-intention test applied to every candidate element:**
- 12 numeral labels around the ring, an hour-hand that rotates via `atFrame`/`progress` to the target hour →
  KEPT (required to deliver the intention).
- A minute hand → CUT. Completing the sentence: "this element is required to deliver hour-position-naming,
  because without it the child would not see ___" fails — a minute hand teaches a DIFFERENT, unrelated concept
  (minutes) this gap was never named for. A future lesson that needs it is a SEPARATE gap.
- A digital "3:00" readout under the dial → CUT. Same test failure: it duplicates the analog teaching object
  instead of serving the ONE intention; it is the canonical "drawing it out based on whatever was on hand."
- A ticking second-hand / chime sound → CUT. Neither serves hour-position; both are uncorrelated overlays the
  SKILL forbids baking in — a caller wanting a chime opt-in prop is a separate, explicit decision, not default.
- Result: `ClockFaceHour` renders the ring, 12 numerals, and ONE hour hand only. Props: `hour` (1–12),
  `handProgress` (0–1, cue-relative), zero frame literals, zero baked easing (uses `EASE.balanced`).

**Aesthetic verification:** test stills rendered for hour=12 (numerals crowd tightest at the ring's top,
worst-case label density) and hour=6 (hand fully extended downward, longest visual reach) at real 1280×720
render size, under `out/kp-hour-time/primitive-checks/`. Finger-cover test: covering the hand still leaves the
ring+numerals legible as a clock; covering any single numeral does not break recognizing it as a clock —
`ClockFaceHour` passes both.

## implementation helpers (not catalog primitives)
- `EASE.balanced` — the hand's rotation curve.

## pipeline findings
- None this pass — the catalog's `counting`/`interaction` families have no time-telling primitive today; this
  gap is a genuinely new subject, not a hole in an existing family.
```

### How "the hour hand" passes each criterion (quote-anchored)

| # | Criterion | The line that earns the PASS |
|---|---|---|
| C1 | Teaching-driven coverage | Every demand row traces to a named beat (intro, hour-hand-sweep, sketch emphasis, entrance, idle hold); the ONE genuine gap is read straight off the storyboard's own gap flag, not a drawn layout. |
| C2 | Fit, not just membership | `lesson-intro-card`, `teacher-mark`, `pop-in`, `breathe` are cited for exactly the job their own `useWhen` describes (topic intro / hand-drawn emphasis / entrance physics / idle hold) — no digest `avoidWhen` is contradicted. |
| C3 | Gap discipline | The gap resolution explicitly states NO existing primitive rotates a pointer against a labeled ring — checked against the real families (`counting`, `interaction`, `sketch`) before concluding GAP, not assumed. |
| C4 | Single-intention discipline | The Step-2 walkthrough names FOUR tempting extras (minute hand, digital readout, second-hand, chime) and CUTS each with the completed test sentence — the discipline is demonstrated, not merely claimed. |
| C5 | Aesthetic verification | Two specific worst-case stills named (hour=12 label-density, hour=6 hand-reach) with a stated finger-cover verdict for BOTH the hand and a single numeral — not a bare "stills rendered." |
| C6 | Intro ownership | `lesson-intro-card` is explicitly resolved as REUSE with "title alone, then the clock cast enters" sequencing stated in the demand row itself. |
| C7 | Dual-form citations | Every row is `` kebab-id (`Component`) `` — including the new `clock-face-hour` (`ClockFaceHour`) gap row, cited the same dual way the moment it's named. |
| C8 | Downstream awareness | `handProgress` (cue-relative progress) + zero frame literals + `EASE.balanced` (a named curve, never a bare bezier) are stated as the new primitive's public API — exactly what W4a needs to drive it without a workaround. |
| C9 | Composition elegance (A) | The shipped primitive does ONE job precisely (ring + numerals + one hand) with FOUR plausible extras explicitly refused — the kind of restraint that makes a primitive genuinely reusable rather than a kitchen-sink component future lessons must fight around. |
| C10 | Pipeline findings (A) | Honest "none this pass" — correctly distinguishes a genuinely new subject-gap from a hole in an existing family, which IS itself a real (if negative) finding, not padding. |

> This exemplar clears every Required mark AND both Aspirational discriminators (C9 restraint + C10 honest
> null finding) — it is the apex made concrete for the two-step gap-build path. A typical good run reaches the
> Required cluster and STALLS on C9/C10; that gap is the signal, not a defect to paper over.
