# Storyboard — kptest-count-three

**Lesson shape.** A four-beat counting lesson for ages 3–5 (Mandarin medium). Three identical apples arrive one at a time; each landing earns the next number word (一, 二, 三) via a tag that attaches to the apple. The three-beat counting rhythm is the acquisition loop — each beat applies the same "new object → next number" rule, building pattern expectation through repetition. After the third apple, a single prominent "3" replaces the per-apple tags, delivering the cardinality insight: the last number names the whole group. A brief title beat opens the video before the first apple.

---

### intro-title

- **discovery ref** — none (topic-intro beat; establishes title and lesson context before teaching begins)
- **stage** — concrete
- **narration beat (INTENT)** — announce the lesson topic: we are going to learn to count. Brief, inviting, no count words yet.
- **required visual** — title text ("数一数") rendered as a text element. Clean background, no teaching objects present. Title reads first, then exits before `count-apple-1` begins.

> Beat ordering note for composer: title sequence completes before any countable appears. The cast/teaching objects must not crowd the title.

---

### count-apple-1

- **discovery ref** — "One object gets exactly one number word. This apple is 'one' (一)."
- **stage** — concrete → represent
- **narration beat (INTENT)** — name the first apple's arrival and its number. The narration *names the action* (one apple arrives); the visual *delivers the count* (the child sees the apple and watches the tag attach). Narration does NOT count ahead of the visual.
- **required visual** — `CountableObject variant="fruit"` enters via `PopIn` (motion="snap"). `NumberCard value={1}` attaches as a tag to the apple after it lands — the tag's arrival is a separate visual event from the apple's entrance. Everything else is empty/stable so the child's eye tracks the new arrival.

---

### count-apple-2

- **discovery ref** — "The counting sequence grows by exactly one with each new object. After 'one' comes 'two' (二) — and this second apple is the 'two.'"
- **stage** — represent
- **narration beat (INTENT)** — model "one more" arriving and name the new count. The narration signals that the sequence is growing ("再来一个" / one more); the visual confirms it with a new apple and a new tag. Narration names the action, not the total ahead of time.
- **required visual** — second `CountableObject variant="fruit"` enters via `PopIn` (motion="snap"), positioned beside the first. `NumberCard value={2}` attaches as a tag to the second apple. The first apple and its "1" tag remain stable and quiet (no re-animation, no highlight) — previously placed objects are background.

> **Reinforcement role:** second application of the same counting rule. The child begins to form the expectation "each new thing gets the next number." This is practice, not decoration — the repetition from `count-apple-1` is the acquisition mechanism.

---

### count-apple-3

- **discovery ref** — "The rule holds again: a third object gets the third number word (三). By now the child can anticipate the count before the tag appears."
- **stage** — represent
- **narration beat (INTENT)** — name the third arrival. By this beat the child may anticipate "三" before the narrator says it or the tag appears. The narration delivers the expected number word, confirming the pattern.
- **required visual** — third `CountableObject variant="fruit"` enters via `PopIn` (motion="snap"), positioned beside the second. `NumberCard value={3}` attaches as a tag. The first two apples and their tags remain stable. The three-beat rhythm (一, 二, 三) is now a visible pattern the child has experienced three times.

> **Reinforcement role:** third and final counting beat. The three-beat rhythm is the natural acquisition loop for "counting to three" — this third repetition is what separates a pattern from a coincidence for a 3–5 year old.

---

### cardinality-three

- **discovery ref** — "The last number we said — 'three' — is not just a label for the third apple. It names how many apples there are altogether."
- **stage** — symbolize
- **narration beat (INTENT)** — recap the count and deliver the cardinality insight: we finished counting, and "three" means the whole group. The narration names the total, which is appropriate here because the insight is *what "three" means*, not *what the number is*.
- **required visual** — the per-apple `NumberCard` tags (1, 2, 3) recede or dim. A single prominent `NumberCard value={3}` (larger size) appears as the group-level symbol, centered or elevated above the row of three apples. The three apples remain visible but stable (wrapped in `Breathe`). This visual transition — individual labels yielding to one group symbol — is the change that delivers the cardinality insight. A hold follows for the child to absorb.

> **Reinforcement role:** insight beat — one clean delivery plus a hold. No replay needed. The three preceding counting beats already primed the child to be thinking about "three"; the cardinality moment lands as the *answer* to a question the counting rhythm implicitly posed.

---

## Reinforcement summary

| Cue | Reinforcement type | Reasoning |
|---|---|---|
| `count-apple-1` | acquisition (1 of 3) | First application of "new object → next number" |
| `count-apple-2` | acquisition (2 of 3) | Second application; pattern forming |
| `count-apple-3` | acquisition (3 of 3) | Third application; pattern confirmed |
| `cardinality-three` | insight delivery + hold | One clean delivery; replay would not help an insight |

No replay cues needed — the three-beat counting rhythm IS the reinforcement. No cumulative recap needed — the cardinality insight is the natural endpoint and the lesson's scope (count-and-total to three) is fully served.

## Required-visual gaps flagged for Wave 3

None. All required visuals are covered by existing capabilities:
- `CountableObject variant="fruit"` — the apple (counting.tsx)
- `NumberCard` — number tags and the cardinality "3" (counting.tsx)
- `PopIn motion="snap"` — entrance animation (PopIn.tsx)
- `Breathe` — moving hold for the apple group during cardinality (fx/)
- `FocusPointer` — optional signaling for focal elements (_signal/)
- `LessonSfxLayer` — pop SFX on each apple arrival (lesson-media/)
- `LessonBgmLayer` — music bed (lesson-media/)
