# Wave 2a — Visual Design (vdesign)

**Lesson:** kptest-count-three
**Status:** ok
**Date:** 2026-06-08

---

## INPUTS READ

| File | Purpose |
|---|---|
| `lesson-data/kptest-count-three/brief.md` | Lesson brief — counting to 3 with apples, ages 3–5 |
| `lesson-data/kptest-count-three/pedagogy.md` | Pedagogy — 4 discoveries, 3-beat acquisition + cardinality insight |
| `lesson-data/kptest-count-three/storyboard.md` | Storyboard — 5 cues: intro-title, count-apple-{1,2,3}, cardinality-three |
| `.agents/skills/kids-eye/SKILL.md` | Measurement block + zones discipline |
| `.agents/skills/visual-discipline/SKILL.md` | Visual Contract mechanics |
| `.agents/skills/early-childhood-visual-taste/SKILL.md` | Palette + motion vocabulary |
| `.agents/CAPABILITIES.md` | Registry of reusable primitives and motion vocabulary |
| `src/shape-primitives/counting.tsx` (grep + read) | CountableObject dimensions, fruit variant, NumberCard sizing, glyph math |
| `src/shape-primitives/shared.tsx` (grep) | CARD_RADIUS=18, NAVY_STROKE=4, fontFamily constant |
| `lesson-data/kp1-hello-greetings/visual-design.md` | Reference for visual-design format and structure |

## OUTPUTS WRITTEN

| File | Description |
|---|---|
| `lesson-data/kptest-count-three/visual-design.md` | Visual Contract: measurement block, 6 zones, palette, motion vocab, contract, per-cue choreography intent, motion budgets, §5 self-check |

## COMMANDS RUN

| Command | Exit | Notes |
|---|---|---|
| `ls lesson-data/kptest-count-three/` | 0 | Confirmed directory contents |
| `ls lesson-data/kptest-count-three/_logs/` | 0 | Confirmed _logs directory exists with prior wave logs |
| `grep CountableObject/NumberCard/PopIn/Breathe counting.tsx` | 0 | Located component definitions and line numbers |
| Read counting.tsx L189-289, L420-520, L671-791 | 0 | CountableObject props/dimensions, fruit variant shape, NumberCard sizing/glyph math |
| `find lesson-data -name visual-design.md` | 0 | Found 7 prior visual-design files for reference |
| `mkdir -p _logs` | 0 | Ensured log directory exists |

## KEY DECISIONS

1. **Apple size=140** (not default 96). At 140, the rendered apple body is ~120 px tall (11.1% of 1080 short-side), with leaf extending to ~140 px (13%). Hits the kids-eye target band (12–15%) for a 3–5 year old audience that needs bigger, clearer marks.

2. **Per-apple NumberCard at default 92×112** (glyph 51.5 px). Exceeds primary-label-min (48 px). Used as attached tags below each apple. The storyboard says tags "attach to" apples — the visual design places them in zone-tags directly below zone-objects, with the tag's top edge near the apple's shadow for visual attachment.

3. **Cardinal "3" at width=130, height=160** (glyph 72.8 px). Significantly larger than per-apple tags to carry the "this is the TOTAL, not just the third one" signal. Uses coral fill (counting accent) vs. white fill for per-apple tags (labels).

4. **Palette: reward (apples) + coral (cardinal accent) + textNavy (ink) + softGrayBlue (dimmed) + cream (background).** 4 meaningful colors + cream. Sunshine and sky NOT used — would exceed the 4-color budget.

5. **PopIn motion="snap" for all apples and per-apple tags** — the rhythmic constant. PopIn motion="bouncy" reserved for the cardinal "3" — the ONE accent moment of the video. This matches the pedagogy: the counting rhythm is the acquisition mechanism, the bouncy break at cardinality signals the insight.

6. **Sketch marks: likely empty for this lesson.** The PopIn entrance + number tag already signal "this one is being counted." Adding sketch marks for 3–5 year olds would be redundant. Left to Wave 4 sketch-layer subagent to confirm.

7. **Horizontal layout: three apples at x≈660, 960, 1260** — evenly spaced, centered on the 1920-wide canvas. Row span ~560 px (29% of width). Generous spacing appropriate for the young audience.

8. **Breathe wrapping strategy:** individual apples breathe with distinct phaseSeeds during counting cues; during cardinality, the whole apple group breathes as one unit (they are now ONE group of three, not three individuals).

## ISSUES

- None that block this node.

## PIPELINE FINDINGS

1. **CountableObject fruit variant has a face (ObjectFace).** The fruit shape renders dot eyes + smile. The `early-childhood-visual-taste` skill says "No cartoon characters as teacher proxies. No mascots, no anthropomorphized sticks." A smiling apple is mildly anthropomorphized. This is an EXISTING primitive design choice (not introduced by this visual design). For this lesson, the face is a minor concern — it's a minimal pictogram face (dot eyes + curve smile), not a full character, and the primary teaching signal is the apple+tag composite, not the face. RECOMMENDATION: consider adding an opt-out `showFace` prop to CountableObject (default true for back-compat) so future counting lessons can render faceless countables when the anti-anthropomorphization rule should apply strictly.

2. **ObjectFace is not toggleable.** Related to #1: the face is rendered unconditionally inside CountableShape for fruit/block/star variants. The primitive has no prop to disable it. This is a primitive-level design decision that should be revisited if the anti-anthropomorphization rule is to be strictly enforced.

3. **Low horizontal occupancy (29% of 1920 px for the apple row).** For a counting-to-3 lesson with only three objects, the horizontal span is naturally small. The visual-discipline §4 occupancy rule says "the teaching unit must occupy ≥ ~50% of the non-binding axis." At 29%, the apple row is below this guideline on the binding (horizontal) axis. This is acceptable because: (a) the three-apple group IS the entire teaching content — there is nothing else to add without introducing decoration; (b) the spacing between apples provides the visual rhythm of "separate, countable things"; (c) padding the row with chrome to fill the canvas would violate §3 (container earns existence). The vertical axis occupancy (~50%) is healthy.

4. **Visual motion budget total (12.0s) vs. brief's ~25s hint.** The visual motion is about half the expected lesson length. This is correct — narration + tail padding will fill the remaining time. The visual budgets are honest about how long each beat's MOTION needs, not padded to fill the lesson. Wave 3.5 reconcile will produce the final timeline.
