# Teaching-action vocabulary

The **single registry of teaching MOVES** — the verbs a lesson script is made of. This is the
pedagogical twin of `CAPABILITIES.md`: `CAPABILITIES.md` declares what we can **render**; this
declares what we can **teach with**, and what each move **requires** (audio + visual/layout +
component). The two meet at the gap-scan: a move names what it needs, the capability registry
says whether we already have it.

> **Why this exists.** Without it, the storyboard jumps straight from a cue's *discovery* to a
> *component* ("two kids + speech bubbles"), skipping the teaching verb in the middle. Two
> failures follow: (1) the lesson comes out as a sequence of *moments*, not *teaching moves* — a
> narrated slideshow; (2) the gap-scan reads an already-drawn layout, so gaps are **layout-driven**
> ("this scene references a missing component") instead of **teaching-driven** ("this lesson needs
> a *model-the-sound-slowly* move and no capability satisfies it"). Planning teaching-first, then
> diffing moves against capabilities, fixes both — and dissolves whole defect classes (e.g. cast
> on top of the title) by baking the requirement into the move.

## How to read / use it (which node touches it)

- **Storyboard (W1)** — tag **each cue with its teaching action(s)** from the Index below
  (audience-first; still no layout, no copy, no frames). One cue may chain a few moves
  (e.g. `model-target-slow → gloss → invite-echo`). How *many* reinforcement moves and where is
  **reasoned in `lesson-pedagogy` §8** — this file is the menu + each move's requirement, not the
  dosage.
- **Visual-design (W2a) + composer (W4a)** — **honor each move's `requires`**, especially the
  **layout/legibility** constraints. These are load-bearing, not polish: if a move says "the
  target reads alone, nothing on top," a contract row or scene that violates it is wrong.
- **Gap-scan (W3b)** — for every teaching action the storyboard used, read its `requires`
  capability and **diff against `catalog-digest.md`**. If nothing in the catalog satisfies it,
  *that* is the named gap (and may become a new primitive/component — REUSE is still the default).

## Index — the moves

Each entry: **what it is** · **when** (lesson kind / difficulty) · **pace** · **requires**
(`audio` | `visual/layout` | `component`). Requirements name an existing capability where one
exists; otherwise they describe the demand for W3b to resolve.

### announce-topic
Open the lesson by naming what we'll learn (title + section + KP teaser). · *when:* every lesson
opens with it (CLAUDE.md). · *pace:* brief; **reads first, alone**. · *requires:*
**visual/layout** = while the title/teaser is reading, it is the **only readable thing on screen**;
the cast and teaching objects **enter after it has read** (sequence in time — **never** overlay
art on the title). `component` = `LessonIntroCard`. *(This requirement is what prevents the
cast-on-title occlusion; see `kids-eye` z-order legibility.)*

### stage-the-moment
Show the concrete situation the language lives in — **who** acts, **to whom**, **when**. · *when:*
language/L2, dialogue, any "in context" beat. · *pace:* let the moment read before the target is
voiced. · *requires:* `component` = `DialogueExchange` turn; an **identity-invariant** cast
(same characters across the lesson).

### model-target-slow
The teacher **voices the target utterance** (a word / sound / tone) slowly and clearly so the
child can hear and copy it. The canonical language/L2 delivery move. · *when:* acquisition — a new
word or the lesson's key-difficult sound. · *pace:* **slow, held — ~9–15s incl. 2–3 models**
(~3–5s each), the target delivered **slower than the ~0.30s/char narration default**; one target
at a time; a brief **predictive pause BEFORE revealing the target** beats a pause after. ·
*requires:* **audio** = voice says the target slowly, **isolated in its own breath-group**
(a comma-run blurs it); **visual/layout** = the target glyph **big, centered, nothing on top**,
held at least its spoken length; `component` = a large glyph / `DialogueExchange` emphasis turn.
**"Slow" is delivery + dwell, NEVER an in-text ellipsis.** Get slowness from (a) saying the target
in its own breath-group, (b) repeating it across **2–3 separate models** (own short cue each), and
(c) a typed `gap` (`reason: "beat"`/`"learner-response"`) between models — the cue window holds the
big glyph through the silence. Writing `I'm…… Sam` to force a pause makes Gemini hold the vowel
into a ~5s drone (the audio gate flags `🔴 DRONE`) — it does not model the sound, it ruins it.

### gloss
Right after the target is voiced, **say what it means** in the child's language ("Hello 就是你好"). ·
*when:* any new L2 word, once. · *pace:* immediately after the model, slow — **~3–4s**. ·
*requires:* **audio**
= one L1 gloss line; **visual/layout** = the L1 meaning shown **beside/under** the target, never
over it.

### invite-echo
Model the target, then **invite the child to repeat** ("跟我说：Hello"). Sets the call-and-response
rhythm. · *when:* acquisition reinforcement (`lesson-pedagogy` §8 choral move). · *pace:* model →
**a real ≥3–5s SILENT child-response gap** (the wait-time — see `learner-response-gap`), then
reveal; choral repeats themselves run ~3–5s × 2. · *requires:* **audio** = model line + a held
silent beat realized as the echo cue's `gap: { reason: "learner-response" }` (baked into the WAV at
zero TTS cost — `docs/pipeline-architecture.md` §10); **visual/layout** = a clear "your turn" cue.

### track-read-along
Surface the **exact phrase as it is spoken** and move a cursor across it, so the child follows the
text token-by-token. · *when:* any cue with a spoken target phrase. · *requires:* `component` =
`ReadAlongHighlight` (the live cursor sits **only on the currently-spoken token**); **visual/layout**
= the phrase row legible at min type size.

### reveal
The **picture delivers** an insight the narration only *prepared* — the math-insight move. · *when:*
math/insight beats. · *requires:* **visual** = the focal change carries the discovery; **audio** =
narration must **not pre-say** the answer the picture reveals (`lesson-pedagogy` §4 leakage rule).

### count-on
Count items **one at a time**, the number said **as each item appears** (one increment per spoken
number). · *when:* any beat where a count is spoken. · *pace:* a **per-item dwell of ≥2–3s** (hold
each new item / word on screen long enough to read; longer for harder items). · *requires:*
**visual** = exactly one new item per spoken number, in sync; `component` = countables +
(optional) a single count badge — not both a badge and a highlight for the same signal
(`kids-eye` §2).

### contrast
Put the **right beside the wrong** for a confusion the child must disambiguate (the "I'm" /aɪm/
beside the wrong [em]). · *when:* the difficulty is a confusion, not a void. · *requires:*
**visual/layout** = both shown together, the **correct one marked**; the wrong one clearly subordinate.

### spaced-recall
Bring earlier targets **back together later** so they are *retrieved*, not just re-shown (the
cumulative recap). · *when:* almost every lesson closes with it (`lesson-pedagogy` §8). · *pace:*
~3–5s per item retrieved → a whole-set recap of **~15–30s**. · *requires:*
**visual/layout** = the live highlight / punctuation lands on the **currently-spoken** item — a
marker sitting on a stale/earlier row is a bug; `component` = a recap stack + a **single** live marker.

### replay
Meet an earlier cue again **identically** — reuse its same voiced clip AND its visual. The cheapest,
most consistent reinforcement. · *when:* a target being memorized (`lesson-pedagogy` §8). ·
*requires:* nothing new — the storyboard marks the cue `replay of <cue-id>`; W2b/W3a reuse the clip.

### learner-response-gap
A planned silent beat where the child answers **before** the reveal — the **wait-time**. One
*reason* among several for intentional, typed silence (others live outside the teaching menu:
letting an animation land, a breath, a beat — see `docs/pipeline-architecture.md` §10). · *when:*
every acquisition target, paired with `invite-echo`. · *pace:* **≥3–5s of held SILENCE** (longer
for L2); prompt (~2s) → silent gap (3–5s) → reveal (~3s). · *requires:* **audio** = a true
zero-narration window, now a SHIPPED mechanism (no longer a follow-up): the storyboard gives the
echo+wait its **own `echo-*` cue**, and audio-captions puts a `gap: { seconds, reason:
"learner-response" }` on it. The voice generator bakes that as **zero-cost local silence** into the
frozen WAV (never a TTS call), the reconcile absorbs it into the cue window, and the composer holds
a "your turn" affordance through it. **visual/layout** = a clear "your turn" cue through the gap.

## Adding a move

1. **Real, named gap** — an existing move doesn't already cover it (don't split hairs; `invite-echo`
   covers most call-and-response).
2. **Add one Index entry** with its `requires` (audio | visual/layout | component).
3. **If the move needs a NEW component** capability, that's a `CAPABILITIES.md` / registry gap —
   name it as a demand for W3b; **do not** bake a component into this file.
4. **Cross-link, don't duplicate:** reinforcement moves' *reasoning/dosage* lives in
   `lesson-pedagogy` §8; their *requirement* lives here. Keep each fact in its one home.
