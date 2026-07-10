# kptest-count-three — Audio / Captions (W2b)

Calibration: Aoede Mandarin slow ~0.30s/char (clause pauses mostly subsumed; punctuation adds a small breath). Narration is COMMENTARY ON THE VISUAL — count-climb points at each arriving apple with one count word per apple and names no total; cardinality names the cardinal total AFTER the picture shows 3→whole. Cue windows are W3.5's `max(narration,visual)+tail`, NOT W2b char math. No §3 hold table. No ellipses (`…`/`...` forbidden — they drone); breath/stress pauses are `。`/`！`/`——`.

## Narration / caption

| cue | role | narration (verbatim) | caption break plan (>~14 chars) | chars | est sec | motionSec | fit ±20% |
|---|---|---|---|---:|---:|---:|---|
| topic-intro | teacher | 跟老师一起，数一数，到三。 | one line (10) | 10 | 3.0 | 3.5 | ✓ 3.0∈[2.8,4.2] |
| count-climb | teacher | 一！这是一个大大的苹果。又来一个苹果，是二！再放一个。看好啦，这最后一个，是三！ | `一！这是一个大大的苹果。` / `又来一个苹果，是二！` / `再放一个。看好啦，这最后一个，是三！` | 32 | ~12 | 13.5 | ✓ ~12∈[10.8,16.2] |
| cardinality | teacher | 现在有几个苹果呢？一起看——一共——是三个！ | `现在有几个苹果呢？` / `一起看——一共——是三个！` | 16 | 6.6 | 6.5 | ✓ 6.6∈[5.2,7.8] |

Caption text is the verbatim narration; the JSON `caption` field carries the single-string line and the composer renders the ribbon (the break plan above shows the natural phrase breaks, ≤14 chars each). Cumulative cue windows ≈ topic 3.6 + count 13.8 + card 7.0 + tails ≈ ~25–26 s — matches the brief's ~25 s SCOPE (not padded; the count-climb tri-arrival IS pedagogy-earned practice, that's the ~13.5 s cue). Coverage of 三 = 2 spoken (count-climb ending, cardinality total) + 1 numeral-on-screen via the visual; `一`×2 and `二`×1 in count-climb match storyboard exposures (一1/二1/三2 spoken).

## ASR risk (<5 lines)
- All three count words (一/二/三) sit MID-clause (`一！` head-of-cue, `是二`/`是三` verb-carried), never as bare single-char utterance terminators → no single-Mandarin-char hazard. ✓
- count-climb is broken into `。`/`！`/`——` breath groups (NOT a 3-item comma run-on) — matches the brief's "avoid 三项目 comma lists, use 和/breath-groups" and gives ASR token boundaries. No mitigation needed. ✓
- cardinality `三个` is multi-char (量词+数), preceded by the cardinal-sense carrier `一共`, so the last-number-said-is-the-total (cardinal) is disambiguated from count-climb's count-on `是三` — not a bare card, no mitigation needed. ✓
- Pure Mandarin, no L2 targets → `phrase` = `narration`. No mitigation required on any cue; W3a may apply as-is.
