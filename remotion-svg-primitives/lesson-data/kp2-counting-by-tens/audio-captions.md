# Audio & Captions Plan — kp2-counting-by-tens

Wave 2b artifact. Narration text is authoritative in `script-cues.json` (do **not** edit). This document specifies pacing **intent**, captions, sfx, BGM, and ASR risk flags for Wave 3 (voice + ASR) and Wave 4 (composer + sketch-layer). All cue durations below are **estimates, not contracts** — only the post-ASR timing module (`src/lessons/generated/kp2CountingByTensTiming.ts`) is authoritative for the composer.

---

## §1  Voice & tone direction

Voice settings come from `lesson-data/_shared/voice.json`:
- **Model**: `gemini-3.1-flash-live-preview`
- **Voice name**: `Aoede`
- **Mode**: `perCue` (one TTS clip per cue)
- **Inter-cue gap**: `0.25 s` (default)
- **Prompt template**: 温柔、清晰、面对6岁孩子，节奏适中偏慢，亲切，每个字发清楚 — unchanged from `_shared/voice.json`. Do not override.

Tone for KP2: warm, slow, kind, age-6 friendly. Continuity rule — the same teacher voice the child just heard in KP1.

Pacing reminder: KP2's script avoids any literal enumerated count (1, 2, 3 … 10). The phrase `一根一根` in `slow-count-ones` is a stand-in for the slow count (reduplicated rhythm, not enumeration). The visuals carry the actual count via `CountStepIndicator` badges. **If a future revision adds an enumerated count (e.g. "一、二、三…"), each "一" needs ~0.5s breathing room and the cue duration must be re-estimated upward.**

---

## §2  Per-cue plan

Calibration: KP1's slow Mandarin voice runs ~0.35–0.50s per Chinese character on conversational lines (8-char cue ≈ 3.5s). KP2 narration is short and conversational throughout — no count-to-ten cue this time. Durations below add a small post-narration hold so each beat lands.

| cue id | narration (authoritative in script-cues.json) | caption | est. narration (s) | post-narration hold (s) | **est. cue total (s) — INTENT** | ASR risk |
| --- | --- | --- | --- | --- | --- | --- |
| bundle-recall | 看，这是我们的一个十。 | 看，这是我们的一个十。 | 3.8 | 1.0 | **4.8** | Low |
| untie-reveal | 把它打开，里面有十根。 | 把它打开，里面有十根。 | 4.0 | 1.0 | **5.0** | Low |
| slow-count-ones | 一根一根地数，要数十次。 | 一根一根地数，要数十次。 | 4.8 | 1.2 | **6.0** | **High** (3× `一` adjacency + reduplication `一根一根`) |
| fast-vs-slow *(climax)* | 捆起来，只要数一次。 | 捆起来，只要数一次。 | 3.8 | 1.8 | **5.6** | Med (short utterance + 一/次 collision) |
| two-tens | 再加一捆，就是两个十。 | 再加一捆，就是两个十。 | 4.2 | 1.0 | **5.2** | Low |
| three-tens | 再加一捆，就是三个十。 | 再加一捆，就是三个十。 | 4.2 | 1.0 | **5.2** | Low (near-duplicate of two-tens — see §3) |
| recap *(takeaway)* | 一捆一捆地数，更快。 | 一捆一捆地数，更快。 | 3.8 | 2.0 | **5.8** | Med (reduplication `一捆一捆`) |

**Estimated total cue time (sum of cue totals)**: 4.8 + 5.0 + 6.0 + 5.6 + 5.2 + 5.2 + 5.8 = **37.6 s**.

**Inter-cue gaps**: 6 gaps × 0.25 s shared default = **1.5 s** total silence between cues.

**Estimated grand runtime**: 37.6 + 1.5 = **~39.1 s**. Comfortably inside the 35–55s target band; close to the lower edge, which is correct for a 7-cue lesson with no count-to-ten beat.

Pacing notes:
- `fast-vs-slow` is the climax and gets the longest post-narration hold (1.8s) so the re-tie gesture and the dual `StepTally` contrast can settle visibly.
- `recap` holds 2.0s after the voice ends so the child can repeat the takeaway aloud.
- `slow-count-ones` gets an extra-long narration estimate (4.8s) because the reduplicated `一根一根` will be spoken slowly — and because it visually orchestrates the slow count of 10 sticks via `CountStepIndicator` badges and `StepTally` filling, the *visuals* may need more than 4.8s. The composer should be prepared to extend the post-narration hold on this cue if the choreography needs more time. **This is the most likely cue to need a hold extension after ASR.**

---

## §3  ASR risk concerns (overall)

Three cues to watch in Wave 3. Apply the proposed fix only if the listed trigger fires.

### 3.1  `slow-count-ones` — HIGH risk

- **Phrase**: `一根一根地数要数十次`
- **Why risky**: The reduplication `一根一根` puts two `一` tokens with two `根` tokens in immediate alternation. KP1's `count-one-by-one` cue used the same pattern (`我们一根一根地数`) and Gemini's transcript collapsed it to `我们一根根的数` — losing one `一` token and substituting `的` for `地`. ASR match score dropped to 0.837. KP2's cue lands this pattern in a more exposed position (no surrounding context to absorb the loss), and adds a trailing `要数十次` which contains another `一`-family character (`十`) at very low energy at end-of-utterance.
- **Proposed fix (apply if matchScore < 0.8 OR duration < 4.0s OR audible truncation of "一根一根" → "一根")**: Re-word narration to `慢慢地数，要数十次。` (phrase: `慢慢地数要数十次`). Preserves teaching meaning (slow count of ones) and removes the `一根一根` reduplication. Caption updates to match. Trade-off: loses the "stick-by-stick" lexical specificity, but the visual carries it (10 `SmallStick` revealed one at a time with badges 1–10).
- **Alternative softer fix**: Insert an explicit comma break — `一根，一根地数，要数十次。` (phrase: `一根一根地数要数十次` unchanged because punctuation is stripped). The comma forces a TTS breath between the two `一根` blocks. Lower risk to teaching meaning, smaller chance of fixing the underlying tokenizer collapse.

### 3.2  `fast-vs-slow` — MED risk (climax — verify carefully)

- **Phrase**: `捆起来只要数一次`
- **Why risky**: Short utterance (8 chars). Gemini's slow Mandarin voice has been observed to compress very short cues, occasionally dropping the final particle or final character. Here the final `次` is the most teaching-load-bearing character ("only ONE count"). Also contains a `一次` collision (`一` + `次`) that can blur in fast diction.
- **Proposed fix (apply if matchScore < 0.8 OR `次` is audibly truncated OR cue duration < 3.0s)**: Re-word to `捆起来，就只要数一次了。` (phrase: `捆起来就只要数一次了`). Adds `就 … 了` framing characters that pad the utterance and protect the trailing `次`. Total chars 8 → 11, est. +1.0s — still within budget. Caption updates to match.
- **Climax-specific note**: This cue is `emphasis: true` in script-cues.json. The orchestrator MUST verify both audible quality and matchScore on this cue before approving Wave 4 composer.

### 3.3  `recap` — MED risk (takeaway — verify carefully)

- **Phrase**: `一捆一捆地数更快`
- **Why risky**: Same reduplication shape as `slow-count-ones` (`一捆一捆`) — two `一` adjacent to `捆`. ASR may collapse to `一捆地数` (single `一捆`). Also `emphasis: true` — drops here damage the takeaway.
- **Proposed fix (apply if matchScore < 0.8 OR `一捆一捆` audibly collapses OR duration < 3.0s)**: Re-word to `一捆一捆地数，更快一些。` (phrase: `一捆一捆地数更快一些`). Adds `一些` to extend trailing silence and give ASR more confidence on the final reduplication boundary; the takeaway meaning is preserved with slightly softer emphasis. Caption updates to match.
- **Alternative**: `数十比数一更快。` (phrase: `数十比数一更快`) — flatter, more directly states the comparison. Use only if the reduplication form fails repeatedly.

### Non-risks worth noting (no action required)

- `two-tens` and `three-tens` are near-duplicate sentence forms (`再加一捆，就是X个十`). This is intentional teaching — repeated structure helps a 6yo hear the pattern. Both phrases tokenize cleanly with no adjacent-`一` collisions outside the literal `一捆` (which KP1 demonstrated tokenizes fine).
- `bundle-recall` and `untie-reveal` are short and structurally simple; KP1's matching cue forms (`这一捆就叫一个十`, `捆里还是十根小棒哦`) aligned at matchScore 1.0.

---

## §4  Captions plan

Captions = the exact `caption` field from `script-cues.json` (punctuation preserved). Identical to narration in every cue.

Caption styling (reuse KP1's lesson-agnostic styling — do **not** introduce new tokens):

- **Source text**: render `caption` field including punctuation. Never the punctuation-stripped `phrase`.
- **Font**: warm rounded Chinese sans (PingFang SC / Source Han Sans Rounded equivalent). Weight: medium (500–600). Refer to `early-childhood-visual-taste` tokens.
- **Size**: ~64–72px on 1920×1080 (~3.5–4% of canvas height). All captions here are ≤12 chars, single line, no wrapping.
- **Position**: bottom-center, baseline ~10% from bottom edge. Safe-area: ≥80px clearance from bottom. The lower band must not overlap the primitive visuals (sticks/bundles occupy central 60% vertical band).
- **Color**: dark neutral (#2A2A2A) on cream/off-white pill background (#FFF7EC at ~85% opacity), 12–16px rounded corners, ~24px horizontal padding. Subtle drop shadow (y:2px, blur:8px, 8% opacity).
- **Fade timing**: caption fades in 6 frames (0.2s) before its cue's narration starts, fades out 6 frames after narration ends — so it remains present through the post-narration hold but exits before the next caption appears. **All fade frames are cue-relative; composer derives them from `cues[id].startFrame` and `cues[id].endFrame`, never from master-timeline literals.**
- **Emphasis** (`fast-vs-slow`, `recap`): size +10% (~72→80px), pill background to warmer accent (#FFEFD1), text weight 700. Add a 4px underline beneath the final clause (`只要数一次` / `更快`). Caption emphasis remains secondary to the on-screen primitive.

No absolute frame numbers. Composer derives all caption timing from the ASR-aligned cue boundaries.

---

## §5  Background music intent

**Recommendation: stay consistent with KP1.** KP1's `audio-captions.md` recommended soft BGM (warm felt-piano / marimba, ~70 BPM, -22dB under voice, duck to -28dB on climax/recap, 1.5s fade-in and fade-out). KP1's `pipeline.json` does not declare a BGM track — the actual KP1 render used voice-only.

For KP2, mirror KP1's *delivered* state: **voice-only, no BGM**. Rationale:
1. KP1 shipped without BGM, so KP2 with BGM would break audio continuity in the KP1→KP2 sequence — a 6yo would hear "the same teacher but now music started, did I miss something?"
2. KP2's total runtime is ~39s, even shorter than KP1's ~37s rendered. There is no attention-sustain need that voice alone cannot meet.
3. The teaching contrast (slow count vs fast count) lives in the rhythm of the narration and the visible primitive motion. BGM would compete with that rhythm.

If a future producer decides to add BGM to the whole KP1→KP6 sequence in one pass, they should retro-fit it to KP1 first, then apply the same loop and ducking spec to KP2. Do not introduce BGM in KP2 alone.

---

## §6  Total estimated runtime

| component | est. seconds |
| --- | --- |
| Sum of cue totals (§2) | 37.6 |
| Inter-cue gaps (6 × 0.25s) | 1.5 |
| **Estimated grand runtime** | **~39.1 s** |

Target band: **35–55 s**. **Estimate sits at ~39 s — inside the band, near the lower edge.** No cuts or extensions needed.

If post-ASR the actual runtime drops below 35s (likely cause: voice runs faster than estimated on the short cues), the orchestrator can extend the `fast-vs-slow` and `recap` post-narration holds by +0.5–1.0s each — both are emphasis cues and benefit from extra dwell. **Do not extend `slow-count-ones` further than already estimated unless the choreography (10-step badge reveal) requires more time after the visual-design pass; the cue is already at 6.0s.**

If the actual runtime exceeds 55s (unlikely with this script), trim the `bundle-recall` post-hold from 1.0s → 0.5s and the `untie-reveal` post-hold from 1.0s → 0.5s — both are setup cues with no climax dependency.

---

## §7  Handoff to Wave 3 (orchestrator must verify)

The orchestrator (not this subagent, not a downstream subagent) must, after `npm run lesson:voice` produces `gemini-voice.json` and the timing module:

1. Read `transcriptText` vs `script` in `lesson-data/kp2-counting-by-tens/gemini-voice.json`. Confirm every cue's narration is present and recognizable.
2. Read `matchScore`, `asrText`, and `duration` for each cue in `src/lessons/generated/kp2CountingByTensTiming.ts`.
3. Apply the per-cue fix triggers from §3:
   - `slow-count-ones`: matchScore < 0.8 OR duration < 4.0s OR `一根一根` collapses → swap narration per §3.1.
   - `fast-vs-slow`: matchScore < 0.8 OR `次` truncated OR duration < 3.0s → swap narration per §3.2.
   - `recap`: matchScore < 0.8 OR `一捆一捆` collapses OR duration < 3.0s → swap narration per §3.3.
4. If any fix is applied, edit `script-cues.json` (with the orchestrator's explicit decision), re-run `npm run lesson:voice`, and re-verify.
5. Silent passes (matchScore < 0.8 with no recorded decision) are forbidden by project rules.

This file is INTENT only. Wave 4 composer trusts only the ASR-aligned timing module.
