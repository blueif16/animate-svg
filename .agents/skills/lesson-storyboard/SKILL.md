---
name: lesson-storyboard
description: Wave 1 — turn pedagogy.md into the cue spine for ANY lesson (math, language/L2, …): cue IDs in order, per-cue narration-beat INTENT (no copy), and required visuals (real component vocabulary). This is where the pedagogy's reinforcement rhythm becomes an actual sequence of cues. NO durations, NO frames, NO code.
---

# Lesson Storyboard

Shape the lesson's beats before any visual design or implementation. The storyboard is the **cue spine** — the ordered list of cues every later wave binds to (visuals, voice, captions, timing all key off these IDs). It is subject-agnostic: the same skill serves a counting lesson and an English-greetings lesson.

## Input

- `lesson-data/<id>/pedagogy.md` — the gate output: `lesson kind`, and per cue a `discovery` / `stage` / `focal` / `reinforcement` line. **Read it fully.** The storyboard realizes the rhythm pedagogy reasoned about; it does not re-decide **what** is taught (the discovery set, stages, order). Fidelity is to the discoveries — NOT blind transcription of fragmentary phrasing or redundant beats: articulating each beat's narration INTENT as a complete utterance, and resolving two beats that would ship as near-identical, is W1's own job, not a re-decision of the teaching.
- `.agents/TEACHING-ACTIONS.md` — the **teaching-move registry**. The storyboard is composed FROM these moves: tag each cue with the teaching action(s) it performs. This is the audience-first script layer — moves, not layout.
- `lesson-data/<id>/brief.md` — knowledge point, audience, out-of-scope fence.

## Output (`lesson-data/<id>/storyboard.md`)

A short lesson-shape paragraph, then one `### <cue-id>` block per cue **in play order**, each with:

- **discovery ref** — the exact `discovery` sentence from pedagogy.md this cue serves (verbatim). One cue, one discovery.
- **stage** — carried from pedagogy.md (no cue may exceed it).
- **teaching action(s)** — the move(s) this cue performs, from `.agents/TEACHING-ACTIONS.md` (e.g. `announce-topic`; `model-target-slow → gloss → invite-echo`; `reveal`; `spaced-recall`). Decide the *teaching verb* before the layout. A cue with no teaching action is filler (fold or cut it). This is what makes the rhythm reviewable and what the Wave-3 gap-scan maps to capabilities.
- **narration beat (INTENT, no copy)** — what the narration is *for* at this beat (follows from the teaching action: name the moment / model the target / invite the echo / recap). NEVER the actual words and NEVER a duration — copy is Wave 2b, timing is Wave 3.5. For a relation / bond / part–whole / retrieval beat, the intent must name the COMPLETE relation — the WHOLE and its parts, both directions (e.g. "voice the 6→1-and-5 split and the 1-and-5→6 recombine as one bond"), never a stranded token ("say 一和五"). State it REFERENTIALLY: the literal target glyph/string is pedagogy's (the §4 acquisition target) and Wave 2b's to own, so W1 stays in intent-not-copy territory even when naming the relation in full. If pedagogy or any upstream draft phrased the discovery as a fragment, repair the intent to the complete relation here — that is articulating intent, not re-deciding the teaching.
- **required visual** — the real component/primitive vocabulary the beat needs. Read it OFF the teaching action's `requires` (e.g. `model-target-slow` ⇒ target glyph big+centered+nothing-on-top; `track-read-along` ⇒ `ReadAlongHighlight`). Name existing capabilities where you can; flag a genuine gap for Wave 3 (named as a demand, not built). **Name the LIVE catalog vocabulary, NOT the brief's Continuity primitive names** — a brief's "reuse `Foo`" can name a primitive the catalog has since DEPRECATED; do not propagate a stale name. When unsure a name is current, name the demand and let the Wave-3 gap-scan resolve it to the live successor (it diffs against the catalog-digest, which only shows live entries).

No durations. No frames. No code. No invented copy.

## The cue spine carries the reinforcement rhythm

This is the heart of the skill, and the most common failure: producing **one cue per idea** — present it, next slide. That yields a narrated slideshow that *covers* the content and *teaches* none of it (and runs absurdly short). The storyboard is where pedagogy's `reinforcement` reasoning becomes **real cues**.

- Read each cue's `reinforcement` line. If a discovery needs reinforcement, **allocate the cues that deliver it** — a model cue, then a replay/practice cue, then (later) a recall cue. The rhythm is a *sequence of cues*, not a note inside one.
- **Reason per discovery; never apply a fixed template.** An acquisition beat (a new word/sound — most language/L2 content) typically becomes several cues: present → model again / choral → spaced recall in the recap. An insight beat (a relation that clicks) is often one cue plus a callback. A different lesson → a different spine. Do not stamp "I-do/we-do/you-do" on everything; use it only where pedagogy called for practice.
- **Replay can be a replicate, not a re-author.** A reinforcement cue may simply *replay an earlier cue* — same target, same intent — so the child meets it again identically. Note it as `replay of <cue-id>` so Wave 2b/3 can reuse the same voiced clip + visual instead of generating new ones (cheap, consistent). This is the easiest reinforcement and often the right one.
- **A cumulative recap** that re-practices the lesson's targets together (spaced recall) is almost always warranted — it is retrieval, not decoration. **Ship exactly ONE closing retrieval recap, not two near-identical closers.** When pedagogy emits more than one closing beat that each re-present the WHOLE target set (e.g. an aggregator/answer-reveal prompt AND a separate replay recap), realize them as ONE retrieval-recap cue — prompt → wait-time → reveal/confirm all targets in canonical order — because the aggregator's prompt+wait IS the recap's retrieval. Keep two closers ONLY if they carry genuinely distinct retrieval functions (active production-from-a-blank-prompt vs. canonical replay-for-closure), and then make that distinction explicit in teaching action, narration intent, and required visual so they never read as the same beat twice. Never ship two "show all three again" cues back-to-back.
- **An invite-echo gets its OWN cue (the wait-time is a real beat).** When a cue invites the child to repeat (`invite-echo` / `learner-response-gap`), make the prompt its own `echo-<target>` cue — the *reveal* / next target is the following cue. A two-variant echo (Goodbye, then Bye-Bye) → **two** `echo-*` cues, each followed by its own wait. This is what lets the ≥3–5s wait-time become real silence downstream (audio-captions puts a `learner-response` `gap` on the echo cue; it bakes into the WAV at zero cost — `docs/pipeline-architecture.md` §10). Don't bury the echo+wait inside a model cue.
- **Pace is a downstream consequence, not your job to pad** — you set how many beats the teaching needs; the length emerges at Wave 3.5. Don't pad cues to hit a length; don't starve the teaching to keep it short.
- **Balance the spine across co-equal routines (pedagogy §8 "breadth before depth").** When the knowledge point enumerates several co-equal routines/targets, give EACH its own staged delivery cue + a recap retrieval; the `key_difficult` gets its EXTRA practice cue(s) *on top*, not *instead*. Don't allocate several cues to the hard target while a co-equal routine is squeezed into one short cue — tally cues per routine before finalizing and confirm none is starved. The spine should read as "all of them were taught," not "one drilled, the rest mentioned."
- **A syncable target word gets its onset at the cue start.** When the picture must animate a target in sync with its sound (a gesture fires on the word, a read-along swells on it), that target is the cue's FIRST spoken token — either its own short cue, or leading the cue with the carrier framing trimmed or moved to a preceding beat. The composer can only anchor the reveal to the cue start, and the ASR can't timestamp an L2 target embedded in a carrier-language sentence — so a target buried at the tail of a long carrier line desyncs by seconds. Same reasoning as an echo cue getting its own beat (`lesson-audio-captions` "Place a syncable target at the HEAD of its cue").

## Discipline

- Keep pedagogy's cue order and discovery SET; never invent a discovery or silently drop one. You MAY fold two adjacent closing beats that re-present the same full target set into one retrieval recap (see the recap rule above) — that realizes both, it does not drop either; any other merge of distinct discoveries is forbidden.
- A cue whose only purpose is to say a sentence (no discovery, no reinforcement role) is filler — fold or cut it (pedagogy §1).
- Every lesson opens with a short topic-intro beat (the `announce-topic` move) — see CLAUDE.md. Its `requires` is binding: the title/teaser **reads alone first**, the cast/teaching objects **enter after** (never overlaid on the title). Flag this as a beat-ordering note for the composer, not just a single frame.
- Language/L2 spine: the target word/sound is delivered by the **voice** (pedagogy §4 carve-out / §9); the **picture** delivers the moment + a trackable read-along. Plan beats that let the child *hear it, see it, and meet it again* — not one flashcard per word.

## Exposure ledger (machine-readable, for the comprehension-floor advisory)

End the storyboard with a small `exposures` block: per acquisition target, the count of spaced encounters across the spine (model + choral + individual + recap all count). This is what the Wave-3.5 reconcile reads to WARN when an acquisition lesson lands under its `lesson-pedagogy` §8 floor — so keep it accurate to the actual cues, not aspirational.

```
exposures:
  I'm: 8
  Hello: 7
  Goodbye: 5
```

## Report back

- The ordered cue list (ids) + each cue's discovery ref + its teaching action(s).
- Which cues are reinforcement cues (and which are `replay of <id>`), with the one-line reasoning tying them to pedagogy's `reinforcement` lines.
- The `exposures` ledger (per target).
- Any required-visual gaps flagged for Wave 3 (named demands only) — sourced from the teaching actions' `requires`.
