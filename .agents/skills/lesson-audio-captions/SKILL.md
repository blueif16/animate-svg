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
- `lesson-data/<id>/script-cues.json` — machine-readable CuePlan that drives Wave 3a's voice generation. One row per cue: `id`, `narration`, optional `notes`.

## The targeting rule

For each cue, the Visual Contract declares `visualMotionSeconds`. Write narration that, when spoken at the calibrated voice rate, lands within ±20% of that value.

Calibration: for Aoede Mandarin slow pacing, the empirical rate is roughly **0.28–0.32s per Chinese character** (NOT 0.42s/char — that estimate was wrong, see kp1-fen-yu-he-intro post-mortem). 4s of visual motion ≈ 13–14 characters of narration. Use this as a starting point. For a **mixed L1+L2 line**, the embedded L2 words add their own spoken time (a 1–2 syllable English word ≈ 0.4–0.7s) — count them on top of the Chinese-char estimate. If the lesson uses a different voice or language, calibrate by generating one short clip and measuring. These are LENGTH hints only; the real cue window is Wave 3.5's.

## Narration-leakage rule (pedagogy §4)

Narrator NAMES the action or the unit; the picture DELIVERS the count. Never write a line that announces what the visual is supposed to make the child notice.

Bad: "There are three bundles." (the picture shows three bundles arriving — the count was given before the child counted)
Good: "再加一捆。" (the narrator names the action; the picture delivers count 3 by the bundle's arrival)

If you cannot write narration that respects this rule for a cue, the visual is doing the wrong thing — flag back to Wave 2a, do not paper over.

**Language / L2 carve-out (pedagogy §4 / §9).** When the discovery IS an utterance the child must acquire — an English word, a sound, a tone — *the narration MUST voice that target*. Saying "Hello" / "I'm Sam" / "Goodbye" is the teaching act, not leakage: the child learns the sound by hearing it. The leakage rule still applies to everything that is not the target (don't narrate a count or a relation the picture reveals). Concretely, for a language lesson it is correct — and required — to write mixed lines like `看，他们见面，打招呼：Hello！` (Chinese frames the moment, the L2 word is the target). This is the natural shape; do not Chinese-only it.

## ASR risk flags

Single-character utterances (e.g., bare "分", "合"), 1-syllable Mandarin words, and homophone-rich sentences risk ASR low-confidence alignment in Wave 3a. For each risky cue, propose a mitigation:

- Pair the single-character term with a multi-character companion in the same cue ("分开" before bare "分").
- Move the risky term off the end of the utterance.
- Insert a sentence-internal break (period or em-dash) to give ASR a token boundary.

If a mitigation is rejected (e.g., pedagogy requires the bare term), document the decision and flag for Wave 3a's audit.

**L2 / mixed-language is NOT an ASR risk to strip.** The ASR model is Chinese-English bilingual and `voice.json`'s `tokenPattern` matches both scripts (`[㐀-鿿]|[A-Za-z']+`), so an English target word in narration aligns fine (verified: hello/I'm/goodbye align with matchScores ≥0.87). Put the L2 word in `narration` AND `caption`, and include it in `phrase` (it is a real token to match). **Wave 3a must NOT revert or delete a deliberate L2 target word** — for a language lesson it is the frozen teaching content, not a transcription hazard. (Only genuine ASR hazards — bare single Mandarin chars, homophone runs — get mitigated.) One real Aoede quirk to design around: a 3-item comma list (`A，B，C，`) runs on / repeats — break repeated targets into separate breath-groups (`。`) instead.

## Captions

Each cue carries one caption. Caption text is the spoken narration verbatim, broken at natural phrase boundaries if longer than ~14 chars. Captions display through the entire cue window (start to end), not just the narration window — they linger ≤0.3s past audio end as Wave 3.5's tail kicks in. Composer wires this via the caption layer reading the cue boundaries.

## Reinforcement & replay (pedagogy §8)

If `pedagogy.md`/`storyboard.md` mark a cue as reinforcement, the narration realizes it — that is real teaching content, not filler:

- **Replay cues reuse the same clip.** When the storyboard marks a cue `replay of <id>`, do NOT write fresh narration — emit the SAME `narration`/`phrase`/`caption` so Wave 3a/3.5 can reuse the identical voiced clip (the child meets the target again, identically; no new TTS roll). Note the replay so the composer plays the same audio.
- **Choral / modeling lines.** "跟我说：Hello… Hello!" — model then invite the echo; a slow, repeated target is correct here, not an ASR hazard (break repeats into `。` breath-groups).
- **Reason per cue, don't template.** How many repeats, where — comes from pedagogy's `reinforcement` line, not a fixed rule. A new sound wants several; an obvious thing wants none.

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
