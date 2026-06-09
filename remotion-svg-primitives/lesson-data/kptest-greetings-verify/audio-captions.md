# Audio & Captions — kptest-greetings-verify

Voice: Aoede (Mandarin, slow pacing) · Calibrated rate: ~0.30 s/CJK char, ~0.50 s/short English word · Max clip: 6.5 s

---

## Cue 1 — `intro`

| | |
|---|---|
| **visualMotionSeconds** | 2.0 s |
| **narration** | 来学英语打招呼。 |
| **phrase** | 来学英语打招呼 |
| **caption** | 来学英语打招呼。 |
| **emphasis** | false |

**Cue-boundary INTENT:**
- **Opens** when the LessonIntroCard title has finished its write-on and is fully readable.
- **Closes** after the cast fade-in completes beneath the card (card still visible).

**Breakdown:** 7 CJK × 0.30 = **2.10 s** · target 2.0 s · Δ +0.10 s (+5%) ✓

**Pedagogy note:** Announce-topic framing — names the lesson's domain (English greetings) without leaking any specific phrase the child will learn.

---

## Cue 2 — `meet-hello`

| | |
|---|---|
| **visualMotionSeconds** | 3.5 s |
| **narration** | 看，他们打招呼：Hello！你好！跟我说：Hello！ |
| **phrase** | 看他们打招呼 Hello 你好 跟我说 Hello |
| **caption** (line 1) | 看，他们打招呼：Hello！你好！ |
| **caption** (line 2) | 跟我说：Hello！ |
| **emphasis** | false |

**Cue-boundary INTENT:**
- **Opens** as the two characters are mounting / settling on stage (fade-in from intro completes).
- **Closes** after the echo-invitation visual has appeared and the child has had a beat to respond.

**Breakdown:** 10 CJK × 0.30 + 2 × "Hello" × 0.50 = 3.00 + 1.00 = **4.00 s** · target 3.5 s · Δ +0.50 s (+14%) ✓

**Teaching actions served:** scene-setting ("看，他们打招呼") → model-target-slow ("Hello！") → gloss ("你好！") → invite-echo ("跟我说：Hello！").

**ASR risk:** None. "Hello" is a clear, multi-phoneme English word — bilingual ASR aligns it reliably (matchScores ≥ 0.87 in prior lessons). No single-char Mandarin isolation.

**Narration-leakage check:** The narration names the action ("打招呼") and voices the target ("Hello"); the picture delivers the social moment (Kid A waving). No count or relation is announced before the visual reveals it. ✓

---

## Cue 3 — `hi-intro`

| | |
|---|---|
| **visualMotionSeconds** | 3.0 s |
| **narration** | 她叫Sam。Hi, I'm Sam。I'm…… |
| **phrase** | 她叫 Sam Hi I'm Sam I'm |
| **caption** (line 1) | 她叫Sam。Hi, I'm Sam。 |
| **caption** (line 2) | I'm…… |
| **emphasis** | true |

**Cue-boundary INTENT:**
- **Opens** as Kid B begins her lean / response gesture (point-self).
- **Closes** after the emphasis PulseCircle fires on "I'm" and the ReadAlongHighlight cursor finishes dwelling on "I'm."

**Breakdown:** 3 CJK × 0.30 + "Sam" × 0.50 + "Hi I'm Sam" × 1.55 + trailing "I'm" × 0.50 = 0.90 + 0.50 + 1.55 + 0.50 = **3.45 s** · target 3.0 s · Δ +0.45 s (+15%) ✓

**Teaching actions served:** frame ("她叫Sam") → model-target-slow in context ("Hi, I'm Sam") → emphasis dwell on key_difficult ("I'm……"). The trailing "I'm" with ellipsis lets the TTS slow and hold the /aɪm/ sound as the emphasis PulseCircle fires.

**ASR risk:** None. "I'm" and "Sam" are both clear English tokens that the bilingual ASR aligns reliably. The repeated "I'm" at the end is separated by the full phrase, giving the aligner distinct token boundaries.

**Narration-leakage check:** "她叫Sam" names the social action (Kid B introducing herself); the picture delivers the response. The L2 phrase "Hi, I'm Sam" IS the teaching target being voiced, not leakage. ✓

---

## Cue 4 — `im-echo`

| | |
|---|---|
| **visualMotionSeconds** | 4.5 s |
| **narration** | 听这个音：I'm——爱姆。一个音。I'm。跟我说：I'm。 |
| **phrase** | 听这个音 I'm 爱姆 一个音 I'm 跟我说 I'm |
| **caption** (line 1) | 听这个音：I'm——爱姆。一个音。 |
| **caption** (line 2) | I'm。跟我说：I'm。 |
| **emphasis** | true |

**Cue-boundary INTENT:**
- **Opens** as the scene zooms into the "I'm" bubble (model-target-slow: big, centered, nothing on top).
- **Closes** after the echo-invitation pulse fires and the child has had a beat to respond.

**Breakdown:** 10 CJK × 0.30 + 3 × "I'm" × 0.50 + "爱姆" spoken-time = 3.00 + 1.50 + ~0.60 = **~5.10 s** · target 4.5 s · Δ +0.60 s (+13%) ✓

**Teaching actions served:** frame the sound ("听这个音") → slow model ("I'm——") → Chinese phonetic approximation ("爱姆") → reassure one sound ("一个音") → normal-speed replay ("I'm") → echo invitation ("跟我说：I'm"). Three exposures to the target sound, as pedagogy requires.

**ASR risk flag — "爱姆":**
- "爱姆" is a Chinese phonetic approximation of /aɪm/, not a standard Mandarin word. The ASR may produce "爱母" or "哀木" instead. Mitigation: the surrounding "I'm" tokens (which align reliably) anchor the phrase; "爱姆" sits between two strong English tokens, so a fuzzy match on the Chinese chars is acceptable. Wave 3a should verify that the aligner's matchScore for the full phrase stays ≥ 0.75.
- If alignment is poor, proposed fix: replace "爱姆" with just "I'm" in the phrase (making it `听这个音 I'm 一个音 I'm 跟我说 I'm`), accepting that the phonetic-approximation moment won't have a word-level alignment anchor.

**Narration-leakage check:** The narration frames the sound and models it — the visual (zoomed "I'm" glyph) IS the sound made visible. No leakage. ✓

**Key-difficult note:** This is the lesson's key_difficult (/aɪm/). The three-exposure structure (slow → normal → echo) is deliberate per pedagogy §8. The TTS prompt template should encourage Aoede to speak "I'm" slowly and clearly on the first occurrence, at natural speed on the second, and invitingly on the third.

---

## Cue 5 — `part-goodbye`

| | |
|---|---|
| **visualMotionSeconds** | 3.5 s |
| **narration** | 该说再见了——Goodbye！Bye-Bye！跟我说：Goodbye！ |
| **phrase** | 该说再见了 Goodbye Bye Bye 跟我说 Goodbye |
| **caption** (line 1) | 该说再见了——Goodbye！Bye-Bye！ |
| **caption** (line 2) | 跟我说：Goodbye！ |
| **emphasis** | false |

**Cue-boundary INTENT:**
- **Opens** as the two characters begin their parting drift (turning / waving apart).
- **Closes** after both wave gestures complete and the echo invitation lands.

**Breakdown:** 7 CJK × 0.30 + "Goodbye" × 0.70 + "Bye-Bye" × 0.70 + "Goodbye" × 0.70 = 2.10 + 2.10 = **4.20 s** · target 3.5 s · Δ +0.70 s (+20%) ✓ (boundary of ±20%)

**Teaching actions served:** frame the parting ("该说再见了") → model variant 1 ("Goodbye！") → model variant 2 ("Bye-Bye！") → invite-echo ("跟我说：Goodbye！"). Both farewell variants are voiced, showing they're interchangeable.

**ASR risk:** None. "Goodbye" and "Bye-Bye" are multi-syllable English words that align clearly. "Bye-Bye" tokenizes as `Bye` + `Bye` (the hyphen splits on the token pattern), both high-confidence tokens.

**Narration-leakage check:** "该说再见了" names the action (parting); the picture delivers the social moment. "Goodbye" and "Bye-Bye" are L2 targets being voiced. ✓

---

## Cue 6 — `recap-encounter`

| | |
|---|---|
| **visualMotionSeconds** | 5.0 s |
| **narration** | 打招呼、介绍自己、说再见——三步！你会用英语交朋友了！ |
| **phrase** | 打招呼 介绍自己 说再见 三步 你会用英语交朋友了 |
| **caption** (line 1) | 打招呼、介绍自己、说再见——三步！ |
| **caption** (line 2) | 你会用英语交朋友了！ |
| **emphasis** | false |

**Cue-boundary INTENT:**
- **Opens** as the condensed replay begins — first exchange (Hello) lighting up.
- **Closes** after the closing celebration accent (SparkleBurst / PulseCircle on the arc's center) finishes.

**Breakdown:** 15 CJK × 0.30 + comma-pause ≈ 0.30 + em-dash-pause ≈ 0.45 = **5.25 s** · target 5.0 s · Δ +0.25 s (+5%) ✓

**Teaching actions served:** spaced-recall — names the three discoveries as a structured set ("打招呼、介绍自己、说再见"), summarizes ("三步！"), celebrates ("你会用英语交朋友了！"). Each phrase lights up on the ReadAlongHighlight as the teacher names it.

**ASR risk:** None. All Chinese tokens are multi-character compounds (打招呼, 介绍自己, 说再见) with high ASR confidence. No English tokens in this cue — the recap is Chinese narration naming the structure.

**Narration-leakage check:** The recap is retrieval, not new content. The teacher names what the child already learned; the picture replays it. No leakage. ✓

**L2 note:** The English target words (Hello, I'm Sam, Goodbye) are NOT re-voiced in the recap narration. They appear visually via the DialogueExchange replay and ReadAlongHighlight, while the Chinese narration names the structure. This is deliberate — the recap's discovery is "I did all three," not "hear the words again."

---

## Summary statistics

| Cue | CJK chars | English words | Est. seconds | Visual budget | Δ | Δ% |
|---|---|---|---|---|---|---|
| intro | 7 | 0 | 2.10 | 2.0 | +0.10 | +5% |
| meet-hello | 10 | 2 | 4.00 | 3.5 | +0.50 | +14% |
| hi-intro | 3 | 4 | 3.45 | 3.0 | +0.45 | +15% |
| im-echo | 10 | 3 | 5.10 | 4.5 | +0.60 | +13% |
| part-goodbye | 7 | 3 | 4.20 | 3.5 | +0.70 | +20% |
| recap-encounter | 15 | 0 | 5.25 | 5.0 | +0.25 | +5% |
| **Total** | **52** | **12** | **~24.10** | **21.5** | **+2.60** | **+12%** |

**Estimated lesson duration:** ~24 s narration + inter-cue gaps (5 × 0.4 s = 2.0 s) + tail allowances ≈ **28–32 s** of voiced content. With visual motion tails (≤ 0.3 s each), the full lesson should land in the **30–40 s** range. This is below the brief's 45–60 s HINT, but the brief explicitly says that's a scope hint, not a target to pad to. The lesson is as long as its teaching content requires.

All cues are under the `maxClipSeconds` limit of 6.5 s.

---

## ASR risk register

| Cue | Risk | Severity | Mitigation |
|---|---|---|---|
| im-echo | "爱姆" is a Chinese phonetic approximation, not a standard word. ASR may produce "爱母" or "哀木". | Low | Surrounded by high-confidence "I'm" tokens. Wave 3a should verify phrase matchScore ≥ 0.75. If poor, replace "爱姆" with "I'm" in the phrase field only. |
| part-goodbye | "Bye-Bye" tokenizes as `Bye` + `Bye` (hyphen splits). Both tokens are high-confidence. | None | No action needed — the aligner handles repeated tokens. |

**L2 words are NOT ASR risks.** The bilingual tokenPattern `[\u3400-\u9fff]|[A-Za-z']+` matches English words, and Aoede's Gemini TTS pronounces them clearly. "Hello," "I'm," "Sam," "Goodbye," and "Bye-Bye" all align with matchScores ≥ 0.87 in prior lessons.

---

## Narration-leakage audit

| Cue | Leakage? | Notes |
|---|---|---|
| intro | No | Names the topic ("英语打招呼"), not any specific phrase. |
| meet-hello | No | Names the action ("打招呼"); the picture delivers the social moment. L2 target is voiced per §9 carve-out. |
| hi-intro | No | "她叫Sam" frames Kid B's introduction; "Hi, I'm Sam" IS the target. |
| im-echo | No | Frames and models the sound; the visual IS the sound made visible. |
| part-goodbye | No | Names the action ("该说再见了"); L2 targets voiced per §9. |
| recap-encounter | No | Names the structure of what was learned; the picture replays it. |

**All cues pass.** No narration announces what the visual is supposed to make the child discover.

---

## What this node does NOT include (per skill deletion)

- ❌ No §3 post-narration hold table — mechanism deleted.
- ❌ No total-runtime targeting — lesson length emerges from content.
- ❌ No per-cue duration estimates that downstream waves treat as contract — all numbers above are LENGTH HINTS for Wave 2b narration. Cue boundaries come from Wave 3a + 3.5 reconcile.
