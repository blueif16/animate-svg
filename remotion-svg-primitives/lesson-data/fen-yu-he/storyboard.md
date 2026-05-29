# fen-yu-he — storyboard (Wave 1)

Inputs: `lesson-data/fen-yu-he/pedagogy.md`, `lesson-data/fen-yu-he/brief.md`.
Output of this wave: the canonical cue IDs, the narration-beat *intent* per cue (what the
teacher is doing/saying — NOT final wording, that is Wave 2b), and the required visuals per
cue. **No durations of any kind** appear here — duration is set later by Wave 2a's per-cue
`visualMotionSeconds` and Wave 3.5's reconcile. Estimating seconds now would mislead Wave 2b.

The cue list is the pedagogy gate's ten beats, adopted one-to-one and in order. Each cue maps
to exactly one pedagogy `discovery` sentence — no beat is split or merged. The first cue is the
CLAUDE.md-mandated structural topic-intro and carries no discovery.

---

## Cue order (10 cues)

`intro-title` → `five-whole` → `split-into-two` → `recombine-inverse` → `read-fen-he-shi` →
`first-ordered-split` → `slide-one-at-a-time` → `ordered-column-complete` → `order-matters`

(`order-matters` is the final teaching cue; the recap punctuation lives inside it per pedagogy
§5, so there is no separate recap cue.)

---

## intro-title

**Maps to:** pedagogy `intro-title` (structural, no discovery).
**Narration-beat intent:** Announce the topic only. Teacher names the lesson — "5 的分与合" —
and gives a one-line teaser of what the child is about to do (take five apart and put it back
together). Welcoming, sets expectation; teaches nothing. All-Mandarin (digits spoken 五).
**Required visuals:**
- The lesson title text + a short KP teaser line, composed from intro primitives (per CLAUDE.md
  every lesson opens with a topic-announce card). Text is the focal element here and only here.
- Clean stage, no candies and no 分合式 yet — the teaching objects must arrive *after* the card.

## five-whole

**Maps to:** "These five candies in the middle are one group of five — the whole we are about
to take apart."
**Narration-beat intent:** Point at the group and name it as one whole of five — "这是五颗糖,
是一个整体的五". Establish that *this* five is the thing we will operate on. Teacher counts or
gestures across the five so the spoken count matches the five on screen.
**Required visuals:**
- Five identical countable candies arriving and settling as **one centered heap** in the
  middle of the stage. This is the felt "intact 5".
- Nothing else moves. No divider line, no 分合式, no left/right framing yet.
- The five candies are the stable identity reused for every later cue (same objects slide,
  separate, recombine) — they are introduced once, here.

## split-into-two

**Maps to:** "One line drawn down the middle splits the five candies into a left part and a
right part — the same five, now in two heaps."
**Narration-beat intent:** Narrate the *act* of dividing — "从中间分开,分成左右两堆". Use a
companion word with 分 (分开 / 分成), never the bare character (ASR + brief constraint). Name
that it is still the same five, just in two heaps now.
**Required visuals:**
- A dividing line appears down the middle of the heap (the changing focal element).
- The five candies separate into a left part and a right part — **the same candies**, only the
  gap and the line are new; no candy is added or removed.
- The candies' own identity is unchanged (no recolor, no resize) — only their grouping changes.

## recombine-inverse

**Maps to:** "Push the two heaps back together and the line goes away — the same candies make
five again, so splitting can be undone."
**Narration-beat intent:** Narrate undoing the split — "再合起来,又变回五". Use a companion
word with 合 (合起来 / 组成), never the bare character. The point is felt, not defined: this is
the reverse of the previous cue on the *same* candies — do not say or label "互逆".
**Required visuals:**
- The two heaps slide back into **one centered heap** — the literal reverse of `split-into-two`
  on the same five candies (the changing focal element is the inward motion).
- The dividing line disappears as the heaps merge.
- Same candies, motion reversed; the heap returns to the `five-whole` state.

## read-fen-he-shi

**Maps to:** "A split can be written as a 分合式 … and read two ways: top-down '五分成 X 和 Y',
bottom-up 'X 和 Y 组成五'."
**Narration-beat intent:** Introduce the symbolic form and teach how to read it **both
directions**: top-down "五分成…和…" (uses 分成), bottom-up "…和…组成五" (uses 组成). Reading
order matches the mouth and the on-screen draw direction (brief constraint). This is the
lesson's central new representation — the one accent-pulse moment is reserved for its entry.
**Required visuals:**
- A 分合式 diagram draws in **above** the candy heaps: the whole `5` on top, two slanting lines
  descending, the two part-numbers below (the changing focal element).
- The diagram is the first stand-in for the concrete split the child just watched, so the candy
  heaps quiet and the diagram is the entrance accent.
- The two reading directions are cued visually (e.g. emphasis traveling top→down then
  bottom→up) so the picture delivers the structure the narration names.

## first-ordered-split

**Maps to:** "Start the ordered hunt at the smallest left part — left 1, right 4 — and freeze
it as the first 分合式 in a column."
**Narration-beat intent:** Announce the method's starting rule — begin at the *smallest* left
part: "先从左边一个开始 — 左边一个,右边四个". Name that we are locking this first split down as
the top of a list. Spoken counts (一 / 四) match the on-screen counts exactly.
**Required visuals:**
- The candy heaps show the **1 | 4** split (left part = 1, right part = 4).
- Its 分合式 (5 over 1 and 4) forms and settles into the **top slot of a results column** on
  the stage — establishing the column that the next cue will fill downward.
- The column has visible room below the first entry, signaling more rows are coming.

## slide-one-at-a-time

**Maps to:** "Move exactly one candy from right to left and you get the next split — (1,4) →
(2,3) → (3,2) → (4,1) — each slide producing one new 分合式 below the last."
**Narration-beat intent:** This is the ordered-method engine cue. Narrate **one slide at a
time** — move a single candy right→left, read the new split, freeze it as the next row, repeat.
Use connective rhythm words ("再挪一个", "又", "下一种") per brief. The left count ticks 1→2→3→4
and the right count ticks 4→3→2→1; every number spoken is shown. Do **not** announce "一共四种"
yet — that payoff belongs to the next cue.
**Required visuals:**
- A **single** candy slides across the divider, right → left (the changing focal element),
  repeated to walk (1,4) → (2,3) → (3,2) → (4,1).
- After each slide, the left/right candy counts update and a new 分合式 freezes into the **next
  row down** in the results column, beneath the previous one.
- Same candies throughout — they are moved, never created/destroyed. By the end the column holds
  four 分合式 stacked in slide order, and the candies show the final 4 | 1 state.

## ordered-column-complete

**Maps to:** "Read top to bottom and the four 分合式 climb 1,2,3,4 on the left — every split is
here once, none missed, none repeated, so 5 has exactly four ways."
**Narration-beat intent:** Now name the payoff the column already shows — read down the
left-part numbers 一、二、三、四 and conclude that because we went in order, nothing is skipped or
repeated, so 五 has exactly four ways. The completeness is *read off the sorted column*, not
asserted ahead of it (pedagogy §4). "四种 / 四种分法" is allowed here, not earlier.
**Required visuals:**
- The completed **column of four 分合式 held still**, with the left-part numbers reading
  1, 2, 3, 4 down the side (the felt "in order, complete").
- A light emphasis traveling down the left-part numbers to make the 1-2-3-4 climb readable; the
  "共四种" sense comes from the sorted order, no new counter symbol required.
- The candy heaps quiet — the column is the focal object now.

## order-matters

**Maps to:** "Left 1 right 4 and left 4 right 1 are two different rows in the column — swapping
which side has more is a *different* split, not the same one."
**Narration-beat intent:** Distinguish (1,4) from (4,1): swapping which side holds more gives a
*different* split, which is exactly why the count is four and not two. This is the recap
punctuation (the second reserved accent). Narration contrasts the top row and bottom row using
their shown numbers; no new symbol or definition.
**Required visuals:**
- The **top row (1,4)** and the **bottom row (4,1)** of the column highlight **in turn** to show
  they are two distinct entries (the changing focal element).
- Everything else in the column **dims** while the two rows are contrasted.
- No new diagram is drawn — this cue reads the existing column; it closes the lesson on the
  "order makes them different" point.

---

## Storyboard-level notes carried forward (not Wave 1's to resolve)

- **Identity-preservation across cues.** The five candies are one stable set from `five-whole`
  onward — they separate (`split-into-two`), recombine (`recombine-inverse`), then slide one at a
  time (`slide-one-at-a-time`). No cue may cross-fade them out and a new set in. Likewise the
  first 分合式's numerals (`read-fen-he-shi` / `first-ordered-split`) are the kind of "picture
  becomes symbol" migration the pipeline cares about — flagged here for Wave 2a/4, not designed
  here.
- **Accent budget.** Two pulses are available (pedagogy §5): reserve them for the 分合式's first
  entry (`read-fen-he-shi` / `first-ordered-split`) and the recap contrast (`order-matters`).
  No other cue gets an entrance accent.
- **ASR / narration constraints (for Wave 2b, recorded not resolved).** 分 / 合 always appear
  with a companion word (分开/分成, 合起来/组成); all-Mandarin, digits spoken in Chinese (五, not
  "5", no English); 分合式 read top-down "分成" / bottom-up "组成"; ordered-method cue leans on
  connective rhythm words (再 / 又 / 下一种). Spoken count must equal on-screen count at every
  beat, especially during `slide-one-at-a-time`.
- **No durations here on purpose.** `slide-one-at-a-time` is visually the heaviest cue (four
  slides + four freezes), but assigning it a second-count is Wave 2a's job from
  `visualMotionSeconds`, not Wave 1's.
