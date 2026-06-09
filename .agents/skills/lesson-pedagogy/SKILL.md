---
name: lesson-pedagogy
description: Pedagogy gate for every Remotion lesson video. Before storyboard, visual design, or composition, the lesson decides what the child is supposed to discover at each beat — and forces every downstream visual choice to serve that one discovery. Pairs with kids-eye (viewing) and visual-discipline (layout); answers the prior question of what we are even teaching.
---

# Lesson Pedagogy

`kids-eye` enforces viewing. `visual-discipline` enforces layout. `early-childhood-visual-taste` sets palette and motion. None of them ask the question that comes before all of them: **what is the child supposed to discover at this beat that they didn't know walking in?**

This file is the first gate. It runs before storyboard. Every downstream wave reads its output and refuses to advance until the pedagogy decision is concrete.

It exists because our other skills already say "no decoration," "every element carries a unique signal," "text earns existence," and "render-and-grade against the contract." Those rules are sound. They produced wrong scenes anyway — because they were applied to the wrong teaching object. The pedagogy gate fixes that by deciding the teaching object *first*.

## 1. The teaching question

For each cue / beat, answer in one sentence, written down:

> *What does the child discover or notice at this beat that they didn't know walking in?*

The honest answer is one of four shapes:

- **A new unit.** ("This bundle is now called *one ten*.")
- **A new operation on a unit they already have.** ("We can count tens the same way we count ones: 一个十, 两个十, 三个十.")
- **A relation between two units they already have.** ("Ten ones equal one ten.")
- **A felt property of an existing unit that motivates the next move.** A setup beat where the discovery is the *cost* or *limit* of how the child has been operating so far — long, slow, awkward, error-prone. The beat introduces no new fact; it makes the child notice a property of what they already know, so the next beat's new content lands as relief. ("Counting ten loose ones is a long walk." — the child has counted by ones since age 3; the beat doesn't teach counting, it makes the *labor of it* visible so the bundle's collapse-to-one-count is felt as a win.)

If the honest answer is "the spoken sentence," the cue is narration, not teaching — fold it into an adjacent cue or delete it. Narration without discovery is filler.

If the answer is two of the four shapes, the cue carries two metaphors — split it. (See `visual-discipline` §2 one-metaphor rule.)

Setup beats (the fourth shape) earn their place only when the next beat needs the contrast. A setup beat with no follow-up is decoration — drop it. A setup beat whose felt property is *already obvious from the brief* (no child needs convincing that counting one hundred by ones is slow — they know) is also redundant; drop it and start at the new-content beat.

## 2. What I'm teaching vs what is just logically correct

The most common pedagogy bug in our pipeline is a beat that shows what's **mathematically true** instead of what the child is **learning to do**.

Examples of the bug:

- A "1+1+1 = 3 tens" badge group over three bundles. Mathematically true. But the lesson is *counting by tens*, and the child is learning to count *one-ten, two-tens, three-tens* — so the badges have to count bundles (1, 2, 3), not announce unit-cost (1, 1, 1). The unit-cost reading is the *teacher's* knowledge of why counting-by-tens works; it's a different lesson.
- A "10 ones = 1 ten" equation chip beside a bundle the child just watched form. The bundling motion IS the proof. The chip restates the proof in a notation the child can't yet read — pulling the eye away from the discovery they just made.
- An addition-style "5 + 2 → 7" caption over a single-row counting cue. Mathematically true. But the cue is teaching *counting through ten* (5, 6, 7…), not *combining two groups* — different cognitive operation, different visual.

The fix is always: name the lesson concretely (in §1's sentence), then verify every on-screen element supports *that* lesson, not the adjacent math.

## 3. The cognitive ladder: concrete → represent → symbolize

A 5–7 year old learns a new unit in three stages. Skipping a stage is the second most common pedagogy bug.

```
stage 1 — concrete:    the child operates on real objects (sticks, bundles, fingers, dots)
stage 2 — represent:   the child reads a stand-in for the object (a row, a length, a count badge)
stage 3 — symbolize:   the child reads the symbol (the digit 10, the word 十, the equation)
```

Every cue is at one stage. **A cue must not require its viewer to operate at a stage above the one the lesson has reached.**

- KP1 ("ten ones make one ten") earns stage 1 and 2: the child watches sticks become a bundle, and reads "10 步 / 1 步" comparison pills.
- KP2 ("counting by tens") earns stage 2 for the new unit: the child reads bundles as units and counts them as 1, 2, 3. The digit-symbol "20, 30" belongs to a later KP — do not introduce it here, even if the math is identical.
- The equation form `2 × 10 = 20` belongs to a much later KP — do not introduce it here, even as a "fun fact."

If a beat reaches above the current stage, it's either teaching the wrong lesson or smuggling a second lesson in.

## 4. No narration leakage

The video has no quiz interaction, so "answer leakage" looks different here: the failure mode is **the narration announcing what the picture is supposed to make the child notice**.

Bad:
- Narrator says "*there are three bundles*" while the picture shows three bundles arriving one by one. The child doesn't have to count — the count was given.
- Narrator says "*these are the same — ten*" while the bundle is unwrapping. The relation was named before the child saw it.

Good:
- Narrator says "*再加一捆*" ("one more bundle") while the third bundle slides in. The narration *names the action*; the picture *delivers the count*. The child does the counting work.
- Narrator says "*一个十*" *after* the rope ties. The picture made the unit; the narration names it.

Rule: the narration **prepares or names**; the picture **delivers**. If the narration delivers, the picture is decoration.

**Language / L2 carve-out.** This rule assumes the discovery is something the *picture* makes the child notice (a count, a relation, a transformation). When the discovery IS an utterance — a word or sound the child must acquire (an English "I'm", a pinyin tone) — *voicing the target is the delivery, not leakage.* The teacher must say it for the child to hear and copy it; a silent picture of a meeting teaches no pronunciation. There the division of labor flips: the **voice delivers the sound**, the **picture delivers the moment** (who says it, when, to whom). See §9. The leakage rule still bites for everything that is NOT the target utterance — do not narrate the count, the relation, or the answer the picture is built to reveal.

## 5. One cognitive task per beat

Each cue asks the child to do **one** mental thing. Common pairs that look like one task but are two:

- Count the items AND read the unit name. (Pick one — do the count one beat, name the unit the next beat.)
- Compare two quantities AND identify the larger. (Comparison IS identification; don't ask twice in the same beat.)
- Watch a transformation AND read its result label. (The transformation IS the proof; the result label belongs in the *next* beat.)

If a cue has two badges, two labels, two tally pills, and a sketch mark all entering during the same window, it almost certainly asks for two cognitive tasks. Audit by listing what the child has to *do* during the cue. If the list has two verbs, split the cue.

## 6. Learning through doing — the visual change is the teaching

A teaching cue is not a tableau the child reads; it is a *change* the child watches. The teaching idea lives in **what moved, what appeared, what transformed** during the cue — not in the static frame at the end.

This has practical consequences for visual design:

- The element that carries the teaching this beat **must change** during the beat. If nothing changes, the beat teaches nothing.
- The element that changes is the **focal element**. Everything else should be quiet (no entry animation, no pulse, no glow). Reserve motion for the focal element. (`early-childhood-visual-taste` motion vocabulary already enforces "two pulses max per video" — pedagogy says *which two*: the entry of the central teaching object, and the recap punctuation.)
- "Hold and look at it" is a valid beat **only** when the previous beat just delivered the change and the child needs a moment to absorb it. Holding is integration, not teaching.

The change need not be spatial. A focal element that is a **count sequence advancing one tick at a time**, a **counter incrementing**, a **state flipping** (dimmed → bright, locked → unlocked), or a **named label attaching to an object that was previously nameless** are all valid focal changes. The discipline is "*something the child can name as different at the end of the beat than at the start*," not "*something moved across the screen*." A setup beat (§1's fourth shape) often has a temporal-only focal — the running count is what changes; the sticks themselves are static.

## 7. Match the spoken count to the visual count

A small but load-bearing instance of §1: when a beat involves counting, the on-screen count display **must match what the mouth says**.

- Narrator says "*一个十, 两个十, 三个十*" → badges read 1, 2, 3 ordinal over each bundle in turn.
- Narrator says "*一, 二, 三, 四… 十*" → badges read 1..10 over each stick in turn.
- Narrator says "*十个一*" → the display shows 10 ones grouped as one set, not 1 ten (different beat).

This is just §1 enforced for the smallest unit (the count). Apply it whenever a number is being said aloud.

## 8. Reinforcement and rhythm — reason about it, never template it

Deciding *what* the child discovers (§1) is half the job. The other half is deciding **how much encountering that discovery needs before the child owns it** — and at what pace. A single clean pass (show it once, move on) is a slideshow, not a lesson. Children learn a new thing by **meeting it more than once**: hearing it again, seeing it again, doing it, with a beat to let it land. A lesson that races through one exposure per idea has *covered* the content and *taught* none of it.

This is a **judgment, not a recipe. Never hard-code "repeat each thing N times."** Reason about THIS discovery:

- **How new and how hard is it for this child?** A brand-new foreign *sound* the mouth has never made ("I'm"), a counter-intuitive relation, a tricky tone — these need several exposures and a slow model. Something the child half-knows, or that the brief says is obvious, needs little or none. Reinforcement is **proportional to difficulty and novelty**, decided per discovery.
- **Is the difficulty *acquisition* or *insight*?** Acquisition (a thing to be drilled into memory/muscle — a word, a sound, a fact) wants repetition and practice. Insight (a thing that clicks once — a relation, a "so that's why") wants one clean delivery plus a later recall. Most language/L2 content is acquisition — see §9.
- **Pace for absorption.** Leave time after a delivery for it to land; do not cut to the next idea on the same breath. Equally, do not pad a thin discovery to fill time. **The lesson's length EMERGES from the reinforcement its content genuinely needs** — never rushed to a target, never padded to one. (The brief's Length is a hint, not a budget.)

**Comprehension time-FLOOR (acquisition targets).** "Length emerges / don't pad" sets a CEILING; it does not license STARVING comprehension. A new *acquisition* target — a sound, word, or phrase the child must PRODUCE — has a TIME FLOOR no honest plan goes under: roughly **≥6–10 spaced exposures** (model, choral repeat, individual attempt, and recap ALL count toward the total), each with a per-item **dwell** of a few seconds, a real **wait-time gap of ≥3–5s of held silence** after any "now you say it" prompt for the child to answer, and a later **recap** that retrieves it. **Crammed exposures don't count** — three "Hello"s jammed into one 5s cue is one exposure, not three. Decide the AMOUNT by reasoning from difficulty/novelty (a brand-new foreign sound wants the high end; a near-cognate the low), and **teach few words deeply — 2–5 new items for ages 6–9** (recycle, don't add more). **Spacing/interleaving beats massing**: interleave a phrase's repeats with the other phrases plus an end recap, rather than drilling it in one block. Honest reinforcement at these floors is why a real acquisition lesson runs in MINUTES; landing one at tens of seconds is starvation, not "accepted drift." Floors are research-backed DEFAULTS, not hard-codes — per-behavior time budgets live in `.agents/TEACHING-ACTIONS.md`; basis + numbers in `research/teaching-tempo-pacing-2026-06-08.md`.

Reinforcement moves are a **palette the planner picks from by reasoning** — none mandatory, none default. (These, plus the *delivery* moves — announce-topic, model-target-slow, gloss, reveal, count-on, track-read-along — make up the full teaching-move menu in `.agents/TEACHING-ACTIONS.md`, where each move's capability requirement is declared. **Here** we reason WHICH moves and HOW MANY; **there** is what each one REQUIRES.)

- **Replay / replicate.** Meet the exact same beat again — replay the same clip (its audio AND its visual), identical. Cheapest and most consistent; strong for a target word or sound being memorized. Replicating a prior cue's clip costs no new generation.
- **Choral invitation.** The teacher models, then invites the echo — "跟我说：Hello." Sets the call-and-response rhythm even before a literal answer-gap is recorded.
- **Gradual release (I do → we do → you do).** Model it, do it together, hand it to the child — when a skill is being *practiced*, not merely met. One option where it fits, **not** the shape of every lesson.
- **Spaced recall.** Bring the target back later (a recap, a callback) so it is *retrieved*, not just re-shown. Retrieval beats re-exposure for retention.
- **Contrast / minimal pair.** Put the right beside the wrong when the difficulty is a confusion (the "I'm" /aɪm/ vs the wrong [em]).
- **Learner-response gap (the wait-time).** A real planned beat: held silence of ≥3–5s after a "now you say it" prompt for the child to answer back before the reveal. Plan it for every acquisition target — it is the wait-time floor above, not an afterthought. (Its true SILENT-timeline mechanism — a beat that is neither narration nor motion — is a reconcile follow-up; today plan it via `invite-echo`'s held beat and note where the genuine gap belongs.)

Decide the moves and their placement by reasoning about the specific discoveries, and **write the reasoning down** (Wave-0 output below) so downstream waves build the rhythm you chose instead of defaulting to one-pass coverage. A different lesson, child, or difficulty → a different rhythm. That variability is the point; freezing it into a fixed template is the bug.

## 9. Language and L2 lessons

Math lessons teach an *insight the picture reveals*, and §4 keeps the narration from giving it away. **Language lessons are different in kind** — do not force them through the math mold:

- **The discovery is often the utterance itself** — a word, a phrase, a sound. The child acquires it by **hearing it and copying it**, so the teacher **must voice the target** (the §4 carve-out). A picture of two kids meeting teaches the *moment*; only the *voice* teaches how "Hello" sounds.
- **Division of labor flips:** the **voice delivers the target sound**; the **picture delivers the moment** (who says it, when, to whom) plus a trackable form (a read-along the child follows). Both needed; neither decoration.
- **Acquisition ⇒ reinforcement-heavy (§8).** A child cannot acquire a new sound from one hearing. Expect language beats to want replay, choral repeats, and spaced recall far more than a math insight beat does — this is the canonical §8 case, and why a real language lesson runs much longer than a one-pass slideshow.
- **L1 + L2 mix is normal and fully supported.** Teacher framing in the child's language with target words in the L2, in the *same* narration line, is the natural shape and the voice+ASR stack handles it (the model is bilingual; alignment matches both). Do **not** strip the L2 word out of narration to satisfy a single-language assumption — voicing it IS the lesson. (See `lesson-audio-captions` and the voice config's mixed-language `tokenPattern`.)

When a lesson is language/L2, declare it in `pedagogy.md` so every downstream wave plans for the spoken target + the heavier reinforcement, instead of a silent-picture math beat.

## 10. Where this lives in the pipeline

```
Wave 0 — lesson-pedagogy  ← THIS SKILL
   ↓ output: pedagogy.md (one paragraph per cue: "what does the child discover here")
Wave 1 — lesson-storyboard
   ↓ reads pedagogy.md; uses each beat's discovery sentence to write cue IDs + narration beats
Wave 2a — visual-design (kids-eye + visual-discipline + early-childhood-visual-taste)
   ↓ reads pedagogy.md; every Visual Contract row references the discovery sentence it serves
Wave 2b — audio-captions
   ↓ reads pedagogy.md; narration phrasing respects §4 narration-leakage
Wave 4 — composer
   ↓ before declaring done, reruns the §1 question on the rendered scene: does this still teach what pedagogy.md said it should?
```

### Wave 0 output (`lesson-data/<id>/pedagogy.md`)

First, a one-line header declaring the lesson kind, so downstream waves plan the right shape:

```
lesson kind: <math-insight | language/L2 | ...>   (per §9 — drives reinforcement weight + the §4 carve-out)
```

Then one paragraph per cue. Each paragraph has these lines, in this exact order:

```
discovery:     <one sentence — what the child discovers at this beat that they didn't know walking in>
stage:         <concrete | represent | symbolize — per §3>
focal:         <the one element whose change carries the discovery; everything else is supporting>
reinforcement: <how much this discovery needs + which move(s), per §8 — or "none (insight, one pass)">
```

If `discovery` is fuzzy or doesn't fit one of the three shapes in §1, the cue isn't done. Tighten it or fold it. The `reinforcement` line is REASONED per cue (§8), never a copied template — a lesson with several acquisition beats will have several cues that replay/practice, and that is what makes it long enough to teach.

### Downstream gate

`lesson-storyboard`, `visual-design`, and `remotion-lesson-composer` refuse to advance if `pedagogy.md` is missing or any cue's `discovery` line is empty. The orchestrator does not delegate the §1 question — it is the orchestrator's first decision, before any subagent is spawned.

## 11. Audit (run before each downstream wave reports back)

A subagent that produces visual content confirms in its own words:

1. Every cue in its output corresponds to exactly one `discovery` sentence from `pedagogy.md`.
2. Every on-screen element answers "*what discovery does this support?*" with a single named cue, **not** "the math behind the lesson" or "for visual interest."
3. No element shows a stage above the cue's declared `stage` (§3).
4. The narration prepares or names; the picture delivers (§4). No element is mute scaffolding for a sentence the narrator already finished.
5. The focal element is the one that changes; supporting elements are quiet (§6).

If any of the five fails, **redesign the contract** — do not patch the choreography. Patching choreography against a wrong teaching object is how lessons reach Wave 6 still teaching the wrong thing.

## 12. Final rule

The lesson is what the child discovers, not what the script says or the picture shows. If the child watched the cue and learned nothing new, the cue does not exist — no matter how clean the JSX, how aligned the ASR, how saturated the color. Decide the discovery first. Then design the picture that delivers it. Then write the JSX that draws it.
