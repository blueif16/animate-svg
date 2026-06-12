# audio-captions — kptest-compare-more-fewer

Wave 2b. Narration is COMMENTARY ON THE VISUAL. The two 比-utterances (五比三多 / 三比五少) are voiced **acquisition targets** (pedagogy §4 carve-out) — the voice says each in FULL; the matching/surplus insight stays picture-delivered (voice names the ACTION, never pre-says "five is more"). Rate ≈ 0.30 s/Chinese-char. Budgets from visual-design §motion. Window = W3.5 max(narration+gap, motion)+tail — these s-estimates are length hints only.

| cue | narration (TTS reads) | caption | budget s | chars | est s | gap |
|---|---|---|---|---|---|---|
| intro | 谁多谁少，我们来比一比。 | 谁多谁少，我们来比一比。 | 2.5 | 11 | 3.3 | — |
| two-groups | 上面五个，下面三个，两群点点。 | 上面五个，下面三个 | 4.0 | 13 | 3.9 | — |
| match | 每个上面的点，向下找一个朋友。 | 每个上面的点，向下找一个朋友 | 5.5 | 14 | 4.2 | — |
| more-direction | 五比三多。五比三多。五比三多。 | 五比三多 | 5.5 | 15 | 4.5 | — |
| echo-more | 跟我说：五比三多。 | 跟我说：五比三多 | 5.5 | 8 | 2.7 | learner-response 4s |
| more-replay | 五比三多。五比三多。五比三多。 | 五比三多 | 5.5 | 15 | 4.5 | — |
| fewer-direction | 三比五少。同样的点，倒过来看，三比五少。 | 三比五少 | 7.0 | 18 | 5.4 | — |
| echo-fewer | 跟我说：三比五少。 | 跟我说：三比五少 | 5.5 | 8 | 2.7 | learner-response 4s |
| fewer-replay | 三比五少。同样的点，倒过来看，三比五少。 | 三比五少 | 5.5 | 18 | 5.4 | — |
| not-by-size | 看起来变多了吗？再连一连，上面还是多两个。 | 看起来变多了吗？ | 6.0 | 19 | 5.7 | — |
| recap | 都想起来了吗？五比三多。三比五少。 | 五比三多 · 三比五少 | 7.0 | 16 | 4.8 | — |

## ASR-risk note (≤5 lines)
- 五比三多 / 三比五少 are 4-CJK-glyph phrases → align fine (not single-char). They are frozen acquisition targets — **W3a must NOT revert/delete them**, only re-roll if matchScore is low.
- `more-replay` / `fewer-replay` reuse the `more-direction` / `fewer-direction` clips verbatim (identical narration/phrase/caption) — no new TTS roll; reuse the voiced clip.
- Repeated target ×3 uses `。` breath-groups (not a comma list) to dodge the Aoede comma-list run-on; echo prompts use `跟我说：<target>` then a typed `learner-response` gap (no in-text ellipsis — would drone).
- Target leads each model/keystone cue (onset ≤0.5s) so the read-along sweep stays synced; in `fewer-direction` the keystone framing sits BETWEEN the two target says.
