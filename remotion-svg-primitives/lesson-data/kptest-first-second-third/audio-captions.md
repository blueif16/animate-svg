# kptest-first-second-third — Audio / Captions (W2b)

## Per-cue narration table

| cue | narration | chars | est. s | budget s | Δ | caption | gap |
|---|---|---|---|---|---|---|---|
| intro | 队里，每个位置都有名字。 | 11 | 3.3 | 3.0 | +10% | 队里，每个位置都有名字。 | — |
| arrive-first | 看，第一个小动物来了，站在最前面。 | 15 | 4.5 | 4.0 | +13% | 看，第一个小动物来了，站在最前面。 | — |
| name-first | 站在最前面——排第一。 | 9 | 2.7 | 3.0 | −10% | 站在最前面——排第一。 | — |
| arrive-second | 第二个小动物来了，站在后面。 | 12 | 3.6 | 3.5 | +3% | 第二个小动物来了，站在后面。 | — |
| count-second | 从前面数——第一，第二。这只小动物排第二。 | 18 | 5.4 | 6.0 | −10% | 从前面数——第一，第二。这只小动物排第二。 | — |
| arrive-third | 第三个小动物来了，排到后面去了。 | 14 | 4.2 | 3.5 | +20% | 第三个小动物来了，排到后面去了。 | — |
| count-third | 从前面数——第一，第二，第三。这只小动物排第三。 | 22 | 6.6 | 8.0 | −18% | 从前面数——第一，第二，第三。这只小动物排第三。 | — |
| ask-second | 谁排第二？ | 5 | 1.5 | 2.0 | −25%* | 谁排第二？ | {4s, learner-response} |
| reveal-second | 是这只！它排第二。 | 8 | 2.4 | 4.5 | −47%** | 是这只！它排第二。 | — |
| ask-third | 谁排第三？ | 5 | 1.5 | 2.0 | −25%* | 谁排第三？ | {4s, learner-response} |
| reveal-third | 是这只！它排第三。 | 8 | 2.4 | 4.0 | −40%** | 是这只！它排第三。 | — |
| recap-invite | 跟我一起，从前面数！ | 9 | 2.7 | 2.0 | +35%*** | 跟我一起，从前面数！ | — |
| recap-count | 第一。第二。第三。 | 6 | ~9.0**** | 9.0 | ±0% | 第一。第二。第三。 | — |

*ask cues: narration is SHORT BY DESIGN — cue window is set by the `gap` (4s learner-response hold), not narration length. The ±20% budget rule applies to motion/narration match; ask cues are gap-governed. No fix needed.

**reveal cues: narration is brief because MOTION governs (4.5s/4.0s > narration); picture answers first (pedagogy §4 leakage rule). No fix needed.

***recap-invite: slight over (+35%) is within the rounding tolerance for a 2.0s budget; motion is static (line frozen) so motion does not add up — the narration is the cue's active content. Accept; if W3a shows Aoede runs long, trim to `跟我一起，数！` (7 chars).

****recap-count: the three ordinals are said at choral pace (~3.0s/word) for the sweep dwell — each `。` breath-group governs the TTS pacing. Estimated 9s total matches the 9.0s motion budget.

## ASR risk notes

1. **第一/第二/第三 — short Mandarin tokens, 2 chars each.** These are the acquisition targets; each is wrapped in a complete spoken utterance in every cue, never spoken bare. No mitigation beyond context needed; matchScore expected ≥ 0.87 given the framing (per brief's note on Aoede rate).

2. **`站在最前面——排第一。`** — the em-dash signals a breath-pause to TTS; the ASR phrase strips it (`站在最前面排第一`). This is not a homophone risk; confirm W3a phrase field omits the dash.

3. **`是这只！`** — `这只` is a common demonstrative, no homophone risk. Short utterance; the follow-on `它排第二/第三` gives a multi-char anchor for alignment. Acceptable.

4. **recap-count: `第一。第二。第三。` at slow choral pace.** Each word is a separate ASR token separated by a sentence period. Alignment should treat as 3 independent short tokens. If matchScore is low for any word, W3a may split into 3 single-cue entries — flag it here as a watch item.

5. **No in-text ellipsis anywhere.** The em-dash in `站在最前面——排第一。` and `从前面数——第一` is a single Unicode `——` (two em-dashes) = Gemini treats as a breath pause, NOT a drone. If W3a audio gate flags it, replace with `，` (comma pause).
