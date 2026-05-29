# Lesson brief — kp3-tens-and-ones-place

## Knowledge point
**数位与位置值** — place value. A digit's POSITION carries meaning.

- 从右边起，第一位是个位 (the rightmost position is the ones place / 个位)
- 第二位是十位 (the next position to the left is the tens place / 十位)
- A digit in 十位 means that many TENS; a digit in 个位 means that many ONES
- When we write "10": the "1" sits in 十位 → 1 个十; the "0" sits in 个位 → 0 个一. The 0 is a PLACEHOLDER — it tells us "no leftover ones."

This is KP3 in the "11~20的认识" sequence. It is the unit's 重点 (key point). It directly builds on KP1 (`ten-ones-make-one-ten`) and KP2 (`kp2-counting-by-tens`). The child knows:
- 10 个一 = 1 个十
- "十" is a counting unit; counting by tens is faster than counting by ones

KP3's job is to introduce *the written digit* as a positional system. The bundle from KP1 acquires a *home* (the 十位 column), and a new symbol (the placeholder 0) shows up in the 个位 column to record "no leftover ones."

## Audience
- Age 6–7 (一年级 / first grade)
- Has already seen KP1 (`ten-ones-make-one-ten`) and KP2 (`kp2-counting-by-tens`)
- Recognizes 小棒, the bundling action, "一个十"
- Has NOT yet been taught: place value, the written digit "10" as two characters, 十位 / 个位 vocabulary, two-digit writing, 11–20

## Target length
**40–60 seconds.** Single knowledge point but the unit's 重点 — give it room. Cut anything that doesn't directly serve the *positional* meaning of "10".

## Key teaching moment
The single moment the whole video exists for:

> **Two-column counter (计数器) — left column labeled 十位, right column labeled 个位. The bundle from KP1 slides over to the 十位 column → places 1 bead/bundle in 十位. The 个位 column gets a 0. We write the digits below: "1" under 十位, "0" under 个位 → the written number "10" is born, with positional meaning visible.**

The 0 must earn its place — visibly. When the "1" drops into 十位, the 个位 slot fills with a "0" that *visibly arrives*, accompanied by a teacher arrow and the line "0 表示个位上没有零散的一."

## What the video must do
1. Recall the bundle from KP1 (familiar orange sticks + coral rope) — establish identity continuity.
2. Introduce a two-column counter (计数器). Left column labeled 十位, right column labeled 个位. Each column has a digit slot beneath it.
3. Slide the bundle into the 十位 column (single satisfying motion). Show 1 bundle = 1 个十 = the digit "1" appears in the 十位 slot beneath the column.
4. Resolve the 个位 column — there are no leftover ones, so a "0" arrives in the 个位 slot. Teacher arrow + line "0 表示个位上没有零散的一."
5. Read the assembled digits left to right: "10" — the 十位 "1" and the 个位 "0" together name the number. The "10" must be visible as TWO characters in TWO slots, not as a single glyph.
6. End with a one-line takeaway: 1 个十、0 个一，写成 "10".

## What the video must NOT do
- Do NOT pretend "10" is just the number ten with no internal structure. The WHOLE point is the structure.
- Do NOT introduce 11–20 — that is the next unit, not this video.
- Do NOT use 100s / 百位 — out of scope.
- Do NOT skip the placeholder-0 explanation. Many kids drop the 0 and write just "1"; this video must inoculate against that.
- Do NOT re-teach the bundling action — KP1 owns that. Here the bundle exists as a given.
- Do NOT say "数位" as if introducing a brand-new abstract noun — use it only after the child has seen two columns labeled.

## Visual continuity with KP1 + KP2
- Reuse the orange `SmallStick` + coral `BundleWrap` ("rope" style with top-center bow). The same bundle the child saw tied in KP1 is the one that occupies 十位 here. Not a different graphic, not a new abstraction.
- **Identity-invariant**: every stick is the same orange `SmallStick`. A bundle in KP3 looks exactly like a KP1 bundle. Color and shape do not change.
- Reuse the cream canvas, navy ink, navy `TeacherMark` strokes.

## Visual idiom
- Two-column counter (计数器): two labeled columns with column headers 十位 / 个位 and digit slots beneath. Visual distinction between the column *contents* (bundles vs single sticks) must be obvious at a glance — a 6-year-old must read "this column holds bundles; that column holds single sticks."
- The placeholder 0: when digit slots are empty, the 个位 slot shows a faint outline. When the "1" drops into 十位, the 个位 slot fills with a "0" that visibly arrives.
- Big, slow motion. Each transition is one satisfying gesture.
- Two emphasis beats allowed (this lesson is 重点):
  - (a) bundle arriving in 十位 column
  - (b) the placeholder 0 being explained

## Required NEW primitive
- A `PlaceValueCounter` / `TwoColumnAbacus` primitive in `src/shape-primitives/counting.tsx`:
  - Props: column count, column labels (e.g. `["十位", "个位"]`), per-column content slot (bundle | sticks | empty), per-column digit slot (digit | placeholder | empty), digit-slot reveal progress.
  - Lesson-agnostic: do NOT hardcode "十位" / "个位" / "1" / "0" inside the primitive. The lesson scene passes them as props.
  - Wave 3 primitive-builder runs a finger-cover test (per kids-eye §3): cover everything except this primitive. Can a 6-year-old read "this is a place to put bundles vs single sticks"? Two labeled columns + clear visual distinction between contents.

## Lesson-agnostic rule
Primitives stay in `remotion-svg-primitives/src/shape-primitives/` and remain prop-driven and reusable. Do not hardcode "kp3-tens-and-ones-place" copy, timings, or paths into any primitive or shared component. Anything lesson-specific lives only under `lesson-data/kp3-tens-and-ones-place/` or `src/lessons/Kp3TensAndOnesPlaceLessonScene.tsx` (and `CompleteKp3TensAndOnesPlaceLesson.tsx`).

## ASR concerns (flag in audio-captions)
The following terms risk ASR ambiguity or homophone collisions in Mandarin TTS+ASR:

- 数位 (shùwèi) — abstract noun, low frequency in early-childhood TTS corpora. Use sparingly; prefer demonstration over naming.
- 十位 (shíwèi) / 个位 (gèwèi) — these are the new vocabulary; the lesson must NAME them, but pair every utterance with the visible column label so the child grounds the term in the visual.
- 占位 (zhànwèi) — "placeholder." Risky to say baldly. Prefer the line "0 表示个位上没有零散的一" which is concrete.
- "10" — when spoken in Mandarin it's "shí," which is a 1-character utterance and easy for ASR to mis-align. Prefer reading the assembled number as "一个十、零个一" or "shí" only when paired with visible digit slots filling.

Audio-captions must propose alternate phrasings if any of the above risks an ASR low-score. The orchestrator will apply the fix or record a decision before voice runs.

## Pipeline context
- Lesson ID: `kp3-tens-and-ones-place`
- Pipeline config: `lesson-data/kp3-tens-and-ones-place/pipeline.json` (already scaffolded)
- Cue plan output (Wave 1 → 2b): `lesson-data/kp3-tens-and-ones-place/script-cues.json`
- Composition name: `CompleteKp3TensAndOnesPlaceLesson`
- Generated timing module: `src/lessons/generated/kp3TensAndOnesPlaceTiming.ts`
- FPS: 30
- Narration language: Mandarin Chinese (Simplified)
- Cue count target: ~8–10 cues (40–60s with the slow voice)
