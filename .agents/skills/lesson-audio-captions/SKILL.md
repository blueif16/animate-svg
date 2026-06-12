---
name: lesson-audio-captions
description: Use when writing per-cue teacher narration and captions for a Remotion lesson. The narration is COMMENTARY ON THE VISUAL — Wave 2a's per-cue motion budget is the input, and you write narration to fit each cue's budget. No invented hold timings.
---

# Lesson Audio Captions

Narration is the teacher's voice over the visual. The visual is the teaching tool; words are commentary. This skill turns the Visual Contract's per-cue motion budgets into narration text the TTS generator can speak.

See `docs/pipeline-architecture.md` for the full rationale.

## Inputs

- `lesson-data/<id>/pedagogy.md` — per-cue discovery sentences (read-only). Every line of narration must respect §4 narration-leakage.
- `lesson-data/<id>/storyboard.md` — cue IDs, narration beats, required visuals.
- `lesson-data/<id>/visual-design.md` — **THE BUDGET**: per-cue `visualMotionSeconds` declared in the Visual Contract. Each cue's narration targets this number.
- `lesson-data/_shared/voice.json` — voice config (Aoede / pacing / character cap).

## Outputs

- `lesson-data/<id>/audio-captions.md` — per-cue narration table + ASR risk flags + caption plan.
- `lesson-data/<id>/script-cues.json` — machine-readable CuePlan that drives Wave 3a's voice generation. One row per cue: `id`, `narration`, `phrase`, `caption`, optional `emphasis`, optional `gap`.

## The targeting rule

For each cue, the Visual Contract declares `visualMotionSeconds`. Write narration that, when spoken at the calibrated voice rate, lands within ±20% of that value.

Calibration: for Aoede Mandarin slow pacing, the empirical rate is roughly **0.28–0.32s per Chinese character** (NOT 0.42s/char — that estimate was wrong, see kp1-fen-yu-he-intro post-mortem). 4s of visual motion ≈ 13–14 characters of narration. Use this as a starting point. For a **mixed L1+L2 line**, the embedded L2 words add their own spoken time (a 1–2 syllable English word ≈ 0.4–0.7s) — count them on top of the Chinese-char estimate. If the lesson uses a different voice or language, calibrate by generating one short clip and measuring. These are LENGTH hints only; the real cue window is Wave 3.5's.

## Narration-leakage rule (pedagogy §4)

Narrator NAMES the action or the unit; the picture DELIVERS the count. Never write a line that announces what the visual is supposed to make the child notice.

Bad: "There are three bundles." (the picture shows three bundles arriving — the count was given before the child counted)
Good: "再加一捆。" (the narrator names the action; the picture delivers count 3 by the bundle's arrival)

If you cannot write narration that respects this rule for a cue, the visual is doing the wrong thing — flag back to Wave 2a, do not paper over.

**Language / L2 carve-out (pedagogy §4 / §9).** When the discovery IS an utterance the child must acquire — an English word, a sound, a tone — *the narration MUST voice that target*. Saying "Hello" / "I'm Sam" / "Goodbye" is the teaching act, not leakage: the child learns the sound by hearing it. The leakage rule still applies to everything that is not the target (don't narrate a count or a relation the picture reveals). Concretely, for a language lesson it is correct — and required — to write mixed lines like `看，他们见面，打招呼：Hello！` (Chinese frames the moment, the L2 word is the target). This is the natural shape; do not Chinese-only it.

## Every narration line is a complete, grammatical utterance

A narration line is one whole sentence a fluent speaker of that language would actually say aloud — correct word order, with every term the line is about present. Naming the target is necessary but NOT sufficient: the LINE must stand on its own, not a stranded token with a dangling verb that leans on the picture to finish it.

The defect (language-agnostic): **a beat that teaches a RELATION — a part–whole bond, a transformation, a comparison, a question→answer, a greeting→reply — voiced as a stranded fragment that drops a term the relation BINDS.** A relation binds two-or-more terms (e.g. a whole and its parts; a before and an after; two quantities being compared; a prompt and its response). Speaking only some of those terms with the binding verb left dangling is the broken-fragment defect — the same class as a leak, in the opposite direction. State the relation as the FULL utterance that names every term it binds, in the direction(s) the beat teaches; never the bare term(s) with the relation stranded.

Concrete illustration (this lesson is 分与合, a part–whole bond — read these as e.g., not as the rule):

- Decompose direction — name the whole being split: `六可以分成一和五。` ✅  — not `一和五，分成。` ❌ (the whole 六 dropped, 分成 left dangling).
- Recombine / conserve direction — name the recombined whole: `一和五合起来是六。` ✅  — not `一和五，合起来。` ❌ (the conserved whole 六 dropped).
- Retrieve / recap — each item is a full utterance, or the set framed by what binds it: `六可以分成一和五、二和四、三和三。` ✅  — not the bare list `一和五。二和四。三和三。` ❌.

(For other relation kinds the same shape holds: a comparison says the full claim `六比五多一` ✅, not a stranded `多一` ❌; an L2 greeting beat says the whole utterance `Hello!` / `跟我说：Hello`, where the lone word IS the complete utterance.)

The lone-word carve-out above is the special case where the target IS a complete utterance on its own ("Hello"); a relation is not — speaking its terms without the whole it binds is the broken-fragment defect. If pedagogy/storyboard already state the relation as a complete utterance, carry it verbatim; never compress it to the bare terms to save characters. **"Carry it verbatim; never compress" means never DROP a term the relation binds to save chars — it does NOT mean the terse template IS the target. A complete-but-flat line is not finished: the finalized line must still pass `## Register` below.**

**Read-aloud self-check (every cue, before you finalize):** read each `narration` line out loud as if you were the teacher. If it is not a sentence a person would actually say — a fragment, a dangling verb, a missing term the relation binds, scrambled order — it is broken; rewrite it complete. A line that only passes because the picture "fills in" the missing term still fails: the spoken line itself must stand. The same read-aloud now confirms BOTH completeness AND register: that it sounds like a warm teacher speaking to a child, not a label being read — and that no single sentence-template is stamped across multiple cues (see `## Register` below).

**Place a syncable target at the HEAD of its cue, never buried at the tail.** The composer can only anchor a target's visual reveal (the gesture or swell that fires on the word) to `cue.startFrame + a small offset`, and the bilingual ASR timestamps only the carrier-language tokens, **not** an embedded L2 target — so the target's true spoken onset is invisible to the timeline. If a target sits at the END of its cue's line — schematically `<carrier framing>：<TARGET>`, where the carrier runs several seconds first — the picture fires the reveal seconds before the mouth says it (the desync a viewer notices). So when a cue's target must land on its animation: **lead the cue's narration with the target** (the L2 word inside the first ~0.5s, any framing/gloss after), **or** give the target its OWN short cue (the carrier framing becomes a separate preceding beat). Keep a syncable target's spoken onset within ~0.5s of its cue start. A long carrier sentence + a tail-buried target in one cue IS the desync bug — split it (this pairs with the storyboard giving such a target its own cue, like an echo cue). A pure-framing carrier line with no target to land can sit anywhere; only the target's onset is load-bearing.

## Register — the teacher's voice

**Completeness is necessary but NOT sufficient.** A line that is complete + on-budget but flat is not done. Narration must sound like a warm teacher speaking TO a 4–6-year-old, not a label being read aloud. The robotic stamp — same sentence frame repeated across cues, 书面语 stiffness, a procedure announced at the content instead of an invitation to the child — is a NAMED defect this section exists to kill.

**Persona.** Default = a warm, encouraging teacher voice: second person, gentle, talking to one small child. A lesson MAY override the persona via a brief-level `**Teacher.**` field (mirrors how `**Style.**` works); absent that field, use the warm default. The persona is a MANNER, never a script — it is topic-agnostic and reused verbatim across every lesson.

**The five register laws** (general rule + a tiny SHAPE illustration — never a copyable line):

1. **Speak TO the child, not AT the content.** Direct address — lead with an invitation or a look-hook (shape: `我们一起…` / `你看…` / `猜猜看…`), not a third-person statement of fact.
2. **Hand the thinking over with a guiding question** at least once per teaching arc — elicit, don't only declare (shape: `你发现了什么？` / `你是怎么知道的？` / `谁来告诉我？`).
3. **State the reverse / the insight in your OWN warm words** — a small discovery, never a cloned mirror clause of the forward line (shape: the recombine after a split is a `抱在一起又变回…` moment, not a stamped second sentence).
4. **Vary every repeated beat — identical template across N cues is a NAMED defect (the "stamp").** Same pedagogy, fresh connective/framing each time (shape: `再看…` / `这次最特别…` / `还可以这样…`). Stamping one sentence frame across 3 cues is the canonical failure this section exists to kill.
5. **Short, concrete, positive.** Natural spoken particles where a real teacher would (shape: `呀` / `啦` / `吧`); never 书面语 stiffness, never an abstract framing where a concrete one fits.

**Orthogonality guard (critical — do not let warmth break the existing discipline).** Register is layered ON TOP of the complete-utterance rule, the ASR-safety rules, the no-drone / no-ellipsis rule, and the length budget. Warmth NEVER licenses dropping a term the relation binds, re-introducing a `……` drone, breaking ASR-safety, or blowing the budget. A line must be warm AND complete AND ASR-safe AND on-budget; spoken particles add ~0 chars and don't move the budget. (The read-aloud self-check above now confirms BOTH completeness and register.)

**Exemplars are SHAPE, not copy — read these as SHAPE; never copy a phrase into a lesson.** Two before/after pairs, purely to illustrate the transform:

- A stamped relation → a warm, varied version. ❌ `<whole>可以分成<a>和<b>。<a>和<b>合成<whole>。` (×3, identical) → ✅ first split: a look-hook + the split, then the recombine as a `抱在一起又变回…` discovery; second split: `再看…还可以这样分…` with a *different* image (`手拉手`); third: genuine affect (`这次最特别啦…`). Same pedagogy, three fresh frames.
- A bare quiz → a guiding question handed to the child. ❌ `<whole>可以分成几和几？` → ✅ `那现在，谁来告诉我——<whole>可以分成几和几呀？`

## ASR risk flags

Single-character utterances (e.g., bare "分", "合"), 1-syllable Mandarin words, and homophone-rich sentences risk ASR low-confidence alignment in Wave 3a. For each risky cue, propose a mitigation:

- Pair the single-character term with a multi-character companion in the same cue ("分开" before bare "分").
- Move the risky term off the end of the utterance.
- Insert a sentence-internal break (period or em-dash) to give ASR a token boundary.

If a mitigation is rejected (e.g., pedagogy requires the bare term), document the decision and flag for Wave 3a's audit.

**L2 / mixed-language is NOT an ASR risk to strip.** The ASR model is Chinese-English bilingual and `voice.json`'s `tokenPattern` matches both scripts (`[㐀-鿿]|[A-Za-z']+`), so an English target word in narration aligns fine (verified: hello/I'm/goodbye align with matchScores ≥0.87). Put the L2 word in `narration` AND `caption`, and include it in `phrase` (it is a real token to match). **Wave 3a must NOT revert or delete a deliberate L2 target word** — for a language lesson it is the frozen teaching content, not a transcription hazard. (Only genuine ASR hazards — bare single Mandarin chars, homophone runs — get mitigated.) One real Aoede quirk to design around: a 3-item comma list (`A，B，C，`) runs on / repeats — break repeated targets into separate breath-groups (`。`) instead.

**NEVER write an in-text ellipsis to make a pause — it becomes a held-vowel DRONE.** Gemini renders `I'm…… Sam` / `I'm...... Sam` as a sustained ~5s held `Iiiii`/`mmmm` tone (the listener hears irritating "white noise"), not a beat of silence. This is a hard defect (the deterministic audio gate flags it as `🔴 DRONE`). An intra-cue pause has exactly two correct forms: (1) a **typed `gap`** on the cue (`{ seconds, reason }`) — the reconcile holds the cue window open with FREE silence after the clip; or (2) **split into sub-beats** (a `model-target-slow` cue that says the target at natural pace, then a `learner-response`/`beat` gap, then the next sub-beat as its own short cue). Say each word at a natural pace; never stretch one with dots.

## Captions

Each cue carries one caption. Caption text is the spoken narration verbatim, broken at natural phrase boundaries if longer than ~14 chars. Captions display through the entire cue window (start to end), not just the narration window — they linger ≤0.3s past audio end as Wave 3.5's tail kicks in. Composer wires this via the caption layer reading the cue boundaries.

## Reinforcement & replay (pedagogy §8)

If `pedagogy.md`/`storyboard.md` mark a cue as reinforcement, the narration realizes it — that is real teaching content, not filler:

- **Replay cues reuse the same clip.** When the storyboard marks a cue `replay of <id>`, do NOT write fresh narration — emit the SAME `narration`/`phrase`/`caption` so Wave 3a/3.5 can reuse the identical voiced clip (the child meets the target again, identically; no new TTS roll). Note the replay so the composer plays the same audio.
- **Choral / modeling lines.** "跟我说：Hello… Hello!" — model then invite the echo; a slow, repeated target is correct here, not an ASR hazard (break repeats into `。` breath-groups).
- **The wait-time is a `gap`, authored — not narrated.** When the storyboard marks an `echo-*` cue (an `invite-echo` with its wait-time), the cue's `narration` is the **prompt only** ("跟我说：Hello"); the held silence is a `gap: { "seconds": <3–5>, "reason": "learner-response" }` on that cue. In v4 cue-anchored audio a gap is a **typed timeline hold**: the cue's clip plays at the cue start, then the reconcile holds the window open for `gap.seconds` of FREE silence (no audio scheduled across it — never baked into a WAV, never a TTS call). The composer fills it with a "your turn" affordance. **Never** express a pause by writing "……" or padding the narration (that drones — see the held-vowel rule above). Other intentional silences use the same field with a different reason — `"animation-hold"` to let a visual land, `"breath"`, `"beat"`. (`docs/pipeline-architecture.md` §10 + the v4 changelog.)
- **Reason per cue, don't template.** How many repeats, where, how long each wait — comes from pedagogy's `reinforcement` line + §8 floors, not a fixed rule. A new foreign sound wants the high end (≥5s wait); an obvious thing wants none.

## What this skill does NOT do anymore

- ❌ **No §3 post-narration hold table.** That mechanism is deleted. See `docs/pipeline-architecture.md` §6.
- ❌ **No total-runtime targeting.** The lesson is as long as max(visual, narration) summed across cues. Do not pad to hit a brief-level "target length." **But "no padding" is not "rush":** if pedagogy called for reinforcement (replays, choral repeats, spaced recall), those are real cues with real narration — write them. A language lesson taught properly is long *because it reinforces*, not because it was padded. Length emerges from the teaching — neither padded nor starved.

  **Acquisition cues carry the FULL move sequence, sized to the floors — never minimized.** When pedagogy marks a cue as an acquisition target (a sound/word/phrase the child must produce), its narration carries the whole arc — **model → repeat → pause → echo → (wait-time) → recap** — and is sized to each move's time budget in `.agents/TEACHING-ACTIONS.md` (`model-target-slow` ~9–15s incl. 2–3 slower-than-default models, `gloss` ~3–4s, `invite-echo` + a real ≥3–5s SILENT child-response gap, `spaced-recall` ~15–30s). Do **not** shrink an acquisition line to its terse minimum. Going far UNDER the comprehension floor (one terse line, three crammed exposures, no wait-time) is **starvation, not "accepted drift"** — flag it back, don't ship it. (The genuine anti-FILLER rule above still holds: more time means more REAL reinforcement + wait-time, never padding.)
- ❌ **No per-cue duration ESTIMATES that downstream waves treat as contract.** Your char-rate math is a hint for narration LENGTH; cue boundaries come from Wave 3a + 3.5.

## Report back

- Total narration char count + estimated total seconds (calibrated rate).
- Per-cue: characters, estimated seconds, visual budget target (from visual-design), absolute / signed delta.
- ASR risk flags + proposed mitigations.
- Any narration-leakage fixes you made vs the storyboard draft.
- Read-aloud confirmation: one line stating you read every cue's narration aloud and each is a complete, grammatical utterance that names every term its relation binds — no stranded token, no dangling verb, no dropped term (e.g. a whole, a result, a reply) — naming any line you rewrote from a fragment to a complete sentence.
- Register confirmation: one line stating each cue's narration passes the five register laws (`## Register`) — warm teacher voice, no stamped template across cues — and naming any cue you de-stamped or warmed from a flat draft.
