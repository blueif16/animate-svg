# Lesson brief — ten-ones-make-one-ten

## Knowledge point
**10个一是1个十** — bundling 10 ones into 1 ten.

This is the foundational 重难点 of the unit "11~20的认识" (first-grade Chinese math). It is the child's first encounter with a counting-unit transition: from counting one-by-one to counting one-bundle-at-a-time. The "十" (ten) is introduced not as a number but as a *new counting unit*.

## Audience
- Age 6–7 (一年级 / first grade)
- Already knows 0–10 as quantities, 10以内 addition/subtraction, and 比大小
- Has not yet been taught place value, two-digit numbers, or counting units

## Target length
**60–90 seconds.** This is a focused micro-lesson on a single knowledge point, not a full classroom lesson. Cut anything that doesn't directly serve the bundling moment.

## Key teaching moment
The single moment the whole video exists for:

> **10 scattered ones → tied/bundled together → 1 bundle of ten. The bundle gets a new name: "一个十" (one "ten").**

The child must *see* the transition: 10 separate objects collapse visually into one grouped object, and that grouped object earns a new label.

## What the video must do
1. Open with scattered ones being counted one-by-one (slow, every count visible) — establishes "the old way."
2. Show the bundling action — visually unmistakable: a tie/rubber-band/box wraps the 10 ones into 1 group.
3. Rename it: the bundle is now "1个十" — one *ten*. Reinforce that the bundle still contains 10 ones, but we now count it as one thing.
4. Contrast the counts: counting 10 ones takes 10 steps; counting 1 ten takes 1 step. Same quantity, faster count.
5. End with a one-line takeaway the child can repeat.

## What the video must NOT do
- Do not introduce place value, the digit "10", 十位/个位, or two-digit writing — those are KP3 (a separate video).
- Do not compare to other counting units (百, 千) — out of scope.
- Do not introduce 11–20 — that's the next lesson, not this one.
- Do not say "计数单位" out loud (too abstract for 6-year-olds). Use "一组" / "一捆" / "打包".

## Visual idiom
- Concrete objects only — small sticks (小棒) are the canonical choice. Alternative: eggs in a 10-pack carton. Pick the one that makes the *bundling action* clearest.
- Big, slow motion. Each "1" being counted should be visible long enough for a 6-year-old to follow.
- The bundle action must read as a single, satisfying gesture (one tie, one snap, one box closing).
- Warm, friendly palette appropriate for early-childhood math (see `early-childhood-visual-taste` skill).

## Lesson-agnostic rule
Primitives produced for this lesson go in `remotion-svg-primitives/src/shape-primitives/` and must be prop-driven and reusable. Do not hardcode "ten-ones-make-one-ten" copy, timings, or paths into any primitive or shared component. Anything lesson-specific lives only under `lesson-data/ten-ones-make-one-ten/` or `src/lessons/ten-ones-make-one-ten/`.

## Pipeline context
- Lesson ID: `ten-ones-make-one-ten`
- Pipeline config: `lesson-data/ten-ones-make-one-ten/pipeline.json` (already scaffolded)
- Cue plan output (this wave): `lesson-data/ten-ones-make-one-ten/script-cues.json`
- Composition name (placeholder, composer can rename in Wave 4): `TenOnesMakeOneTenLesson`
- FPS: 30
- Narration language: Mandarin Chinese (Simplified)
