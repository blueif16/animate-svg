# kptest-first-second-third — storyboard (W1)

**Lesson shape.** A queue poses an order question the child can't yet answer; three animals arrive one at a time, and each arrival is counted FROM the fixed front marker until the newcomer earns its ordinal word (第一 → 第二 → 第三); two retrieval questions run the mapping in reverse (word → who) across a held wait-time; one choral count-along sweep closes all three targets. Pedagogy's c2–c4 are each realized as an **arrive → name/count pair** (carrier framing moved to its own preceding beat so the count/naming phrase owns its cue — syncable-target rule), c5/c6 as an **ask → reveal pair** (the prompt + wait-time is its own cue; the picture answers in the NEXT cue), and the close as **invite → choral sweep**. Same discovery set and order as pedagogy; no discovery added or dropped. The queue orientation and the ONE fixed front marker persist unchanged through every cue (pedagogy global constraint — every count sweep originates at the marker).

### intro

- **discovery ref:** "A line poses an order question — '谁排第几?' — that the child can't yet answer precisely; positions in a line have their own names."
- **stage:** represent
- **teaching action(s):** `announce-topic`
- **narration beat (intent):** name the topic — positions in a line have their own names, the first three ordinal words — and pose the motivating order question, left unanswered. No animal named, no answer hinted.
- **required visual:** `lesson-intro-card` (title + section eyebrow + the order question as the KP teaser). Beat-ordering note for W2a/W4a: the card reads ALONE; the queue stage and cast enter only at `arrive-first` — never overlaid on the title.

### arrive-first

- **discovery ref:** "The position nearest the front marker has a name: the animal standing there 排第一."
- **stage:** concrete
- **teaching action(s):** `stage-the-moment`
- **narration beat (intent):** frame the moment — the first animal walks up and settles exactly at the front marker; establish "the front" as the place the marker shows. No ordinal word voiced yet.
- **required visual:** queue ground line + ONE fixed front marker (demand D2); `countable-object` (variant: animal) #1 walk-in and settle (`pop-in` settle physics); cast is identity-invariant from here to the end.

### name-first

- **discovery ref:** same discovery as `arrive-first` (pair realizes pedagogy c2).
- **stage:** concrete
- **teaching action(s):** `model-target-slow`
- **narration beat (intent):** ONE complete natural utterance binding the-animal-at-the-front-marker to the first ordinal word (the §4 acquisition target; wording is W2b's). The target word is the utterance's final salient token — anchor the chip attach/pulse to this clip's narration TAIL (per-cue clip narrationFrames make narration-end anchoring exact).
- **required visual:** `ordinal-label-token` chip for 第一 (hanzi word form, no digit glyph — demand D1) attaching to animal 1 after its settle, pulsing on the voiced word; chip big and legible, nothing on top (`model-target-slow` layout law).

### arrive-second

- **discovery ref:** "The next position behind earns its name by COUNTING FROM THE FRONT — 第一、第二 — so the new arrival 排第二."
- **stage:** concrete
- **teaching action(s):** `stage-the-moment`
- **narration beat (intent):** frame the second animal settling BEHIND animal 1, and wonder what this new position is called — sets up the count, gives no answer.
- **required visual:** `countable-object` animal #2 walk-in + settle behind #1; animal 1 and its 第一 chip persist unchanged.

### count-second

- **discovery ref:** same discovery as `arrive-second` (pair realizes pedagogy c3).
- **stage:** concrete
- **teaching action(s):** `count-on` → `model-target-slow`
- **narration beat (intent):** the count phrase IS this cue's whole narration, starting at the cue head: count the positions from the front marker — first ordinal (recount), second ordinal (new) — then close with the complete utterance that the new arrival 排第二. One spoken ordinal = one chip event (pedagogy §7 sync).
- **required visual:** `ordered-row-spotlight` sweep originating AT the front marker (count/say steps only, no write step — demand D3); 第一 chip pulses on its spoken word; `ordinal-label-token` 第二 attaches on its word; exactly ONE live highlight at any moment.

### arrive-third

- **discovery ref:** "The rule holds for every new arrival: recount from the front and the newest one 排第三."
- **stage:** concrete
- **teaching action(s):** `stage-the-moment`
- **narration beat (intent):** frame the third animal settling at the back of the line; invite the same recount-from-the-front. No ordinal voiced yet.
- **required visual:** `countable-object` animal #3 settles behind #2; line of three + existing chips persist.

### count-third

- **discovery ref:** same discovery as `arrive-third` (pair realizes pedagogy c4 — the brief's one beat completes).
- **stage:** concrete
- **teaching action(s):** `count-on` → `model-target-slow`
- **narration beat (intent):** full front-to-back count phrase heading the cue — first, second (recounts), third (new) — closing with the complete utterance that the newest animal 排第三.
- **required visual:** `ordered-row-spotlight` full sweep from the front marker; 第一/第二 chips pulse on their spoken words; 第三 `ordinal-label-token` attaches last, on its word.

### ask-second

- **discovery ref:** "The mapping runs in reverse: given the WORD 第二, the child can find WHO by counting from the front themselves."
- **stage:** concrete
- **teaching action(s):** `learner-response-gap` (retrieval prompt + wait-time)
- **narration beat (intent):** voice the retrieval question carrying the word 第二 ("who stands second" intent) and STOP — never name or hint who. Then a typed `gap` (reason: learner-response, the ≥3–5s wait) held in silence on this cue.
- **required visual:** line fully static through the gap (any motion leaks the answer); a clear "your turn" affordance held through the silence (reuse candidates: `icon-asset` `question-mark-circle` + `pulse-circle`).

### reveal-second

- **discovery ref:** same discovery as `ask-second` (pair realizes pedagogy c5).
- **stage:** concrete
- **teaching action(s):** `reveal`
- **narration beat (intent):** the PICTURE answers first at the cue head (animal 2 steps forward) — only then the complete confirming utterance that this one 排第二 (§4 leakage rule: narration never pre-says the answer).
- **required visual:** animal 2 steps forward of the line (settle physics); its 第二 chip pulses (`glow-pulse`); `sparkle-burst` on the confirm; animal 2 steps back so the line is restored before `ask-third`.

### ask-third

- **discovery ref:** "The same find-by-word works for any of the three words — here 第三."
- **stage:** concrete
- **teaching action(s):** `learner-response-gap` — same prompt+wait pattern as `ask-second` with target 第三 (visual-pattern reuse; narration differs by target, so not a clip-level `replay`).
- **narration beat (intent):** the question carrying the word 第三, then the second typed learner-response gap, line static.
- **required visual:** same "your turn" affordance pattern as `ask-second`.

### reveal-third

- **discovery ref:** same discovery as `ask-third` (pair realizes pedagogy c6).
- **stage:** concrete
- **teaching action(s):** `reveal`
- **narration beat (intent):** picture answers first (animal 3 steps forward), then the complete confirming utterance that it 排第三.
- **required visual:** same pattern as `reveal-second`, on animal 3 + its 第三 chip.

### recap-invite

- **discovery ref:** "none new — integration: 第一、第二、第三 is a count you can say from the front of any line (generalizes beyond this queue; closes all three targets)."
- **stage:** concrete
- **teaching action(s):** `invite-echo` (choral count-ALONG variant — simultaneous, no silent gap: the slow sweep in the next cue is the child's speaking window)
- **narration beat (intent):** invite the child to count from the front together (choral framing only; the counting itself starts in the next cue).
- **required visual:** full line static; a clear "count with me" affordance (reuse candidate: `pointer-hand-arrow` poised at the front marker, ready to sweep).

### recap-count

- **discovery ref:** same discovery as `recap-invite` (pair realizes pedagogy c7 — the ONE closing retrieval recap, split only to give the sweep a clean cue head).
- **stage:** concrete
- **teaching action(s):** `spaced-recall` + `count-on`
- **narration beat (intent):** ONE slow front-to-back choral count — the three ordinal words in canonical order as the entire narration, paced for the child to chant along; nothing else said, nothing else moves.
- **required visual:** `ordered-row-spotlight` slow sweep from the front marker; each chip pulses exactly on its spoken word; ONE live marker only (`spaced-recall` law).

## Demands for W3b (named, not built — REUSE first)

| id | demand | reuse-first candidate |
| --- | --- | --- |
| D1 | `ordinal-label-token` must render the ordinal WORD as hanzi (第一/第二/第三) — never a digit glyph (brief: no written digits as teaching objects) | verify the existing value prop accepts hanzi; only if digit-only is it a gap |
| D2 | ONE fixed, unambiguous FRONT-of-queue marker, legible at render size in every cue | `icon-asset` `journey-path-flag` (+ ground line); if it doesn't read as "front", name a gap |
| D3 | `ordered-row-spotlight` usable as a count/say sweep only (no 写/write/digit step) | verify props allow omitting the write step |
| D4 | THREE visually distinct, identity-stable animal countables (the child must tell who is who to answer "谁排第二") | `countable-object` variant=animal — verify it parameterizes distinct looks; else a gap (countables stay hand-coded, never generated) |

```
exposures:
  第一: 4
  第二: 5
  第三: 4
  count-from-front-rule: 5
```
