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

Calibration: for Aoede Mandarin slow pacing, the empirical rate is roughly **0.28–0.32s per Chinese character** (NOT 0.42s/char — that estimate was wrong, see kp1-fen-yu-he-intro post-mortem). 4s of visual motion ≈ 13–14 characters of narration. Use this as a starting point. If the lesson uses a different voice, calibrate by generating one short clip and measuring.

## Narration-leakage rule (pedagogy §4)

Narrator NAMES the action or the unit; the picture DELIVERS the count. Never write a line that announces what the visual is supposed to make the child notice.

Bad: "There are three bundles." (the picture shows three bundles arriving — the count was given before the child counted)
Good: "再加一捆。" (the narrator names the action; the picture delivers count 3 by the bundle's arrival)

If you cannot write narration that respects this rule for a cue, the visual is doing the wrong thing — flag back to Wave 2a, do not paper over.

## ASR risk flags

Single-character utterances (e.g., bare "分", "合"), 1-syllable Mandarin words, and homophone-rich sentences risk ASR low-confidence alignment in Wave 3a. For each risky cue, propose a mitigation:

- Pair the single-character term with a multi-character companion in the same cue ("分开" before bare "分").
- Move the risky term off the end of the utterance.
- Insert a sentence-internal break (period or em-dash) to give ASR a token boundary.

If a mitigation is rejected (e.g., pedagogy requires the bare term), document the decision and flag for Wave 3a's audit.

## Captions

Each cue carries one caption. Caption text is the spoken narration verbatim, broken at natural phrase boundaries if longer than ~14 chars. Captions display through the entire cue window (start to end), not just the narration window — they linger ≤0.3s past audio end as Wave 3.5's tail kicks in. Composer wires this via the caption layer reading the cue boundaries.

## What this skill does NOT do anymore

- ❌ **No §3 post-narration hold table.** That mechanism is deleted. See `docs/pipeline-architecture.md` §6.
- ❌ **No total-runtime targeting.** The lesson is as long as max(visual, narration) summed across cues. Do not pad to hit a brief-level "target length."
- ❌ **No per-cue duration ESTIMATES that downstream waves treat as contract.** Your char-rate math is a hint for narration LENGTH; cue boundaries come from Wave 3a + 3.5.

## Report back

- Total narration char count + estimated total seconds (calibrated rate).
- Per-cue: characters, estimated seconds, visual budget target (from visual-design), absolute / signed delta.
- ASR risk flags + proposed mitigations.
- Any narration-leakage fixes you made vs the storyboard draft.
