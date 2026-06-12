# Audio Captions for kptest-whats-your-name

## Narration Targeting Rule
For each cue, the Visual Contract declares `visualMotionSeconds`. Write narration that, when spoken at the calibrated voice rate, lands within ±20% of that value.
Calibration: for Aoede Mandarin slow pacing, the empirical rate is roughly 0.28–0.32s per Chinese character.

## Per-Cue Analysis

| cue | narration | caption | characters | estimated seconds (0.3s/char) | visual budget (s) | delta (s) | ASR risk | narration-leakage check |
|-----|-----------|---------|------------|-------------------------------|-------------------|-----------|----------|--------------------------|
| ask | 听，他在问名字 | 听，他在问名字 | 6 | 1.8 | 1.8 | 0.0 | low | Names asking moment; picture delivers "What's your name?" and /wɒts/ pronunciation. |
| answer | 说自己的名字 | 说自己的名字 | 6 | 1.8 | 1.8 | 0.0 | low | Names answering moment; picture delivers "My name's ___." and /neɪmz/ pronunciation. |
| ask‑swap | 现在轮到你问 | 现在轮到你问 | 6 | 1.8 | 1.8 | 0.0 | low | Names swapped asking moment; picture delivers question. |
| answer‑swap | 现在轮到你答 | 现在轮到你答 | 6 | 1.8 | 1.8 | 0.0 | low | Names swapped answering moment; picture delivers answer. |
| recap | 这样问答认识朋友 | 这样问答认识朋友 | 8 | 2.4 | 2.5 | -0.1 | low | Names the arc as a whole; picture displays sequence of four turns. |

## Caption Plan
Each cue carries one caption. Caption text is the spoken narration verbatim, broken at natural phrase boundaries if longer than ~14 chars. All captions here are short (<14 chars), so they display verbatim through the entire cue window.

## Gap Plan (Learner-Response Waits)
Cues with `invite-echo` teaching action require a learner-response gap after the narration clip.
- ask: gap 4.0s, reason "learner-response"
- answer: gap 4.0s, reason "learner-response"
- ask‑swap: gap 4.0s, reason "learner-response"
- answer‑swap: gap 4.0s, reason "learner-response"
- recap: no gap (spaced-recall does not mandate a silent response gap in this lesson)

## ASR Risk Flags
All cues have low ASR risk: no single-character utterations, no homophone-rich sentences, no embedded L2 targets that would desync (all narration is Chinese framing only). The ASR model is Chinese-English bilingual and token pattern matches both scripts, but since narration contains no English targets, alignment risk is minimal.

## Totals
- Total narration characters: 32
- Estimated total narration seconds: 9.6s