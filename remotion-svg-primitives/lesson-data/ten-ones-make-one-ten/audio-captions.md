# Audio & Captions Plan — ten-ones-make-one-ten

Wave 2b artifact. Narration text is authoritative in `script-cues.json`; this document specifies pacing, captions, sfx, music, and cue-boundary frames for Wave 3 (sketch-layer) and Wave 4 (composer).

Voice settings come from `lesson-data/_shared/voice.json` (model `gemini-3.1-flash-live-preview`, voice `Aoede`, default `gapSeconds: 0.25`). Cue-level gap overrides below indicate intent for the composer; the rendered audio will rely on the per-cue clip lengths plus shared gap, so the composer should pad with silence where this plan asks for >0.25s.

Pacing target: ~2.5 Chinese chars/sec (warmer than adult news, age 6–7). The `count-to-ten` cue is intentionally slower — one beat per spoken digit — so each "1" lands visibly.

---

## 1. Pacing table

| cue id | narration text | est. narration (s) | post-narration hold (s) | total cue (s) | gap before next cue (s) |
| --- | --- | --- | --- | --- | --- |
| opening | 看，这里有许多小棒。 | 4.2 | 0.8 | 5.0 | 0.3 |
| count-one-by-one | 我们一根一根地数。 | 4.2 | 0.6 | 4.8 | 0.3 |
| count-to-ten | 一，二，三，一直数到十。 | 11.0 | 1.2 | 12.2 | 0.4 |
| feels-slow | 数了十次，才数完。 | 3.8 | 1.2 | 5.0 | 0.5 |
| bundle-action *(climax)* | 我们把这十根捆在一起。 | 4.8 | 2.2 | 7.0 | 0.6 |
| rename-bundle | 这一捆，就叫一个十。 | 4.2 | 1.4 | 5.6 | 0.3 |
| still-ten-ones | 捆里还是十根小棒哦。 | 4.2 | 1.2 | 5.4 | 0.3 |
| faster-count | 现在数一捆，只要数一次。 | 4.8 | 1.4 | 6.2 | 0.6 |
| recap *(takeaway)* | 十个一，就是一个十。 | 4.2 | 2.0 | 6.2 | 0.0 |
| **totals** | — | **45.4** | **12.0** | **57.4** | **3.3** |

**Grand runtime = 57.4 + 3.3 = 60.7 s.** Within the 60–90s budget, leaving comfortable headroom for ASR drift on the `count-to-ten` beat.

Pacing notes:
- `count-to-ten` is the only non-conversational cue: assume ~1.0s per spoken digit plus brief opening/closing breath. The Gemini voice should be prompted (via existing `promptTemplate` — no change needed here) to read this cue with deliberate spacing.
- Climax `bundle-action` gets the longest hold (2.2s) so the tie/wrap gesture can complete and settle before the rename. Larger 0.6s gap before `rename-bundle` lets the silence frame the moment.
- `recap` holds 2.0s on the takeaway sentence so the child can repeat it aloud after the voice ends.

---

## 2. Caption styling intent

Rules below are lesson-agnostic and should be reusable by the composer for any first-grade lesson.

- **Source text**: render the full `caption` field (punctuation included), never the punctuation-stripped `phrase`.
- **Font**: warm rounded Chinese sans (PingFang SC / Source Han Sans Rounded equivalent). Weight: medium (500–600).
- **Size**: ~64–72px on a 1920×1080 canvas; ~3.5–4% of canvas height.
- **Line length max**: ≤14 Chinese chars per line. All captions here are ≤12 chars, so each renders as a single line — no wrapping needed.
- **Position**: bottom-center, baseline anchored ~10% from bottom edge. Safe-area: keep at least 80px clearance from bottom; no overlap with primitive visuals (sticks and bundle occupy the central 60% vertical band).
- **Color**: dark neutral (#2A2A2A or similar warm dark) on a soft cream/off-white pill background (#FFF7EC at ~85% opacity) with 12–16px rounded corners and ~24px horizontal padding. Subtle drop shadow (y: 2px, blur: 8px, 8% opacity) to lift the pill from the scene.
- **Fade timing**: caption fades/slides in 6 frames (0.2s) before its cue's narration starts and fades out 6 frames after narration ends — so it stays present through the post-narration hold but exits before the next cue's caption appears.
- **Emphasis cues** (`bundle-action`, `recap`): bump size +10% (~72→80px), shift pill background to a warmer accent (#FFEFD1) and the text weight to 700. Add a 4px underline beneath the final clause ("捆在一起" / "一个十"). Caption emphasis is secondary — the on-screen primitive remains the focal point.

---

## 3. SFX plan (per cue)

Light touch. Most cues run on narration alone.

| cue | sfx |
| --- | --- |
| opening | very soft "settle" — short woodblock/felt thud as the sticks arrive (one hit, -18 dB under voice). |
| count-one-by-one | none |
| count-to-ten | a single soft "tick" per count beat (10 ticks, light wood-tap, -20 dB). Ticks align with each digit, not continuous. |
| feels-slow | none — silence does the work |
| bundle-action *(climax)* | one warm "tup" / cloth-wrap sound as the tie closes (single hit at ~70% through narration, -14 dB — slightly louder, this is the climax) |
| rename-bundle | very soft chime / single bell-like tone at the label write-on (-18 dB) |
| still-ten-ones | none |
| faster-count | one short "tick" when the single "1" badge pops above the bundle (-20 dB) |
| recap | none — let the takeaway sit in clean voice |

Do not stack sfx across cues. If any cue feels noisy in review, drop the sfx — narration always wins.

---

## 4. Background music plan

**Recommendation: very soft BGM, on.** A warm, slow felt-piano or marimba loop in a major key (C or F major), tempo ~70 BPM, no melody longer than 4 bars (so it stays background and doesn't compete with the voice). Level: **-22 dB under voice** for normal cues, **duck to -28 dB** during the `bundle-action` climax and the `recap` so the silence around those moments stays clean. Enter fade-in over the first 1.5s (during the `opening` settle). Exit fade-out over the final 1.5s, ending at the same frame as the recap hold finishes. Why on: first-grade attention sustains better with gentle musical bed; total runtime is 60s so a single loop with one duck cycle is enough — no fatigue risk. If the producer prefers silence, dropping BGM entirely is acceptable because narration + sfx already carry the rhythm.

---

## 5. Cue-boundary timing for Wave 3 (sketch-layer) — 30 fps

Cue 1 starts at frame 0. Each subsequent cue starts at `previous start + previous total cue seconds × 30 + previous gap × 30`. End frame = next cue's start (or final-cue end = lesson end).

| cue id | start (s) | end (s) | start (frame) | end (frame) |
| --- | --- | --- | --- | --- |
| opening | 0.0 | 5.0 | 0 | 150 |
| count-one-by-one | 5.3 | 10.1 | 159 | 303 |
| count-to-ten | 10.4 | 22.6 | 312 | 678 |
| feels-slow | 23.0 | 28.0 | 690 | 840 |
| bundle-action | 28.5 | 35.5 | 855 | 1065 |
| rename-bundle | 36.1 | 41.7 | 1083 | 1251 |
| still-ten-ones | 42.0 | 47.4 | 1260 | 1422 |
| faster-count | 47.7 | 53.9 | 1431 | 1617 |
| recap | 54.5 | 60.7 | 1635 | 1821 |

`start` is when the cue's narration begins; `end` is when the post-narration hold ends. The interval between one cue's `end` and the next cue's `start` is the inter-cue gap (silence). Total lesson length: **1821 frames ≈ 60.7s**. Wave 3 sketch overlays should fall inside each cue's `[start, end]` window unless an overlay intentionally bridges the gap into the next cue's opening (e.g. a teacher arc finishing during the climax silence).

Note for Wave 4 composer: these are *planned* boundaries. After per-cue Gemini TTS clips are rendered and ASR-aligned, the actual word-level start times may shift by ±2–4 frames per cue. The composer should treat this table as the choreography target and let ASR alignment fine-tune within it; if any clip exceeds its planned `narration` by more than 0.4s, extend that cue's hold by the overshoot and recompute downstream frames.

---

## 6. ASR alignment notes

Verified: every `phrase` field in `script-cues.json` is punctuation-free Simplified Chinese with no Latin characters or digits. Token pattern `[\u3400-\u9fff]` in `voice.json` will match all characters cleanly.

Flagged for the storyboard owner (do not silently edit — recommend only):

1. **`count-to-ten` / phrase `一二三一直数到十`**: contains the digit-words 一/二/三/十 used both as counted items *and* as part of "一直". The token sequence `一二三一直` has two adjacent `一` tokens (positions 3 and 4), which can cause the ASR aligner to collapse them into a single emission. Recommended phrase tweak (if alignment is unstable in test run): replace the `phrase` with `一 二 三 数 到 十` (still punctuation-free, ASCII spaces stripped by tokenizer) or change narration to `一、二、三，数到十。` so the spoken pause is unambiguous. Suggest tweak; do not change unilaterally.

2. **`still-ten-ones` / narration `捆里还是十根小棒哦`**: the trailing 哦 is a very short, soft particle that ASR may drop. This is acceptable because the `caption` field carries it visually; flag for awareness only — no change recommended.

3. **`faster-count` / phrase `现在数一捆只要数一次`** and **`recap` / phrase `十个一就是一个十`**: both contain three `一` characters in close proximity. The ASR aligner should still produce one event per character because `tokenPattern` is per-character, but token-confidence on the trailing `一` may be low. If the test alignment drops a `一`, the composer can fall back to evenly distributing the cue's duration across the spoken characters — no script change needed.

No other ASR concerns. Phrases are well-formed and conform to the pipeline's `scriptField: "narration"` / phrase-without-punctuation convention used elsewhere in `lesson-data/`.
