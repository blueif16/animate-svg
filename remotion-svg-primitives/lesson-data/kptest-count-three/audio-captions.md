# Audio & Captions — kptest-count-three

**Voice:** Aoede (Mandarin, slow pacing)
**Calibrated rate:** ~0.30 s/Chinese character (range 0.28–0.32)
**Lesson kind:** math-insight (counting to three + cardinality); Mandarin-only, §9 L2 carve-out does NOT apply.

---

## Per-cue narration

| # | Cue ID | Narration | Phrase (ASR) | Caption | visualMotionSeconds | est. narrationSeconds | Δ (narr − visual) |
|---|--------|-----------|--------------|---------|---------------------|-----------------------|---------------------|
| 1 | `intro-title` | 来，数一数。 | 来数一数 | 来，数一数。 | 2.0 | 2.0 | 0.0 |
| 2 | `count-apple-1` | 看，一个苹果。 | 看一个苹果 | 看，一个苹果。 | 2.5 | 1.8 | −0.7 |
| 3 | `count-apple-2` | 再来一个，两个。 | 再来一个两个 | 再来一个，两个。 | 2.0 | 2.4 | +0.4 |
| 4 | `count-apple-3` | 还有一个，三个。 | 还有一个三个 | 还有一个，三个。 | 2.0 | 2.4 | +0.4 |
| 5 | `cardinality-three` | 数完啦！一共三个苹果。 | 数完啦一共三个苹果 | 数完啦！一共三个苹果。 | 3.5 | 3.2 | −0.3 |

**Estimation method:** chars × 0.30 s/char + ~0.2 s per sentence-internal comma/exclamation pause.

### Totals

- Total narration chars: 38 (+ 3 sentence-final particles)
- Total estimated narration: ~11.8 s
- Total visual motion budget: 12.0 s
- Signed delta: −0.2 s (narration is 0.2 s shorter than visual total; Wave 3.5 reconcile will set each cue to max(narration, visual) + tail)

---

## Cue-boundary INTENT

Cue boundaries are semantic — they describe what each cue accomplishes, not absolute frame numbers. Wave 3.5 reconcile derives the final `cueSeconds = max(narrationSeconds, visualMotionSeconds) + tail`.

1. **`intro-title`** — The lesson opens. Title text "数一数" resolves on screen. Narration invites the child to start counting. Boundary: title has appeared and the child has registered "we're starting." Title exits cleanly before the next cue.

2. **`count-apple-1`** — First counting beat. Apple #1 enters (PopIn snap) and its "1" NumberCard tag attaches. Narration names the action ("看，一个苹果"). Boundary: apple has landed, tag has attached, child has connected apple ↔ number.

3. **`count-apple-2`** — Second counting beat. Apple #2 enters beside #1; tag "2" attaches. Narration signals sequence growth ("再来一个") then names the count ("两个"). Previously placed apple #1 + tag "1" remain stable background. Boundary: new apple and tag landed, the two-beat rhythm is forming.

4. **`count-apple-3`** — Third counting beat. Apple #3 enters beside #2; tag "3" attaches. Narration names the final arrival ("还有一个") and count ("三个"). The three-beat pattern (一, 二, 三) is now complete. Boundary: all three apples visible with tags, the counting rhythm has been experienced three times.

5. **`cardinality-three`** — Cardinality insight. Per-apple tags dim to softGrayBlue. Large "3" NumberCard enters above the row (PopIn bouncy — the one accent moment). Narration recaps and delivers the insight: "数完啦！一共三个苹果。" Boundary: cardinal "3" has landed, child has processing time to connect the big "3" to the group below.

---

## Narration-leakage review (pedagogy §4)

The rule: narrator NAMES the action or the unit; the picture DELIVERS the count.

| Cue | Leakage check | Pass? |
|-----|--------------|-------|
| `intro-title` | "来，数一数" — invitation to count, no count word leaked. | ✓ |
| `count-apple-1` | "看，一个苹果" — draws attention to the apple as it arrives; "一个" is spoken simultaneously with the apple's landing + tag, not ahead of it. | ✓ |
| `count-apple-2` | "再来一个" names the action (one more arrives); "两个" names the count as tag "2" attaches — simultaneous with visual delivery, not ahead. | ✓ |
| `count-apple-3` | "还有一个" names the action; "三个" names the count as tag "3" attaches — simultaneous. By the third beat the child may anticipate "三" before the narrator says it; the narration confirms, never leads. | ✓ |
| `cardinality-three` | "数完啦！一共三个苹果" — naming the total is correct here per pedagogy §4: the insight IS what "three" means, and the child already knows the count is three from the visual tags. | ✓ |

No leakage corrections were needed vs. the storyboard draft.

---

## ASR risk flags

| Cue | Risky token | Risk | Mitigation | Status |
|-----|------------|------|-----------|--------|
| `count-apple-1` | 一 (in "一个苹果") | Single-char number word | Part of extremely common multi-char pair "一个" — ASR should align with high confidence. | Low risk — no fix needed. |
| `count-apple-2` | 两 (in "两个") | Single-char number word | Followed by "个" forming common pair "两个". Not utterance-final. | Low risk — no fix needed. |
| `count-apple-3` | 三 (in "三个") | Single-char number word | Followed by "个" forming common pair "三个". Not utterance-final. | Low risk — no fix needed. |
| `cardinality-three` | 三 (in "三个苹果") | Single-char number word | Embedded in 4-char phrase "三个苹果" — strong surrounding context. | Low risk — no fix needed. |

**Summary:** All single-character number words are paired with adjacent multi-character context ("个" + following noun). No bare single-char utterances exist in the script. No mitigations required; no cues need structural changes for ASR.

**3-item comma-list check:** No cue contains a three-item comma list (A，B，C，). The brief's Aoede run-on warning is not triggered by any narration line.

---

## Reinforcement notes (pedagogy §8)

The three counting cues (`count-apple-1`, `count-apple-2`, `count-apple-3`) form the acquisition loop — each applies the same "new object → next number" rule to a new instance. They are NOT replay cues (no `replay of <id>` marker in the storyboard); each has unique narration that advances the counting sequence. The repetition is in the STRUCTURE (same visual pattern, same rhythm), not in reusing the same audio clip.

`cardinality-three` is an insight beat — one clean delivery plus a hold. No replay needed.

---

## Caption plan

Each cue carries one caption row. Caption text matches the narration verbatim (including punctuation). The caption layer displays the caption through the entire cue window (start to end), lingering ≤ 0.3 s past audio end via Wave 3.5's tail.

- Captions appear in `zone-caption` (bottom-docked, 1600 × 140, centered).
- Font size ≥ 56 px rendered (caption-line-min from kids-eye §1).
- No caption splitting needed — all cues are ≤ 10 chars (well under the ~14-char split threshold).
- emphasis: `cardinality-three` caption may use the theme's emphasis style (composer's discretion).
