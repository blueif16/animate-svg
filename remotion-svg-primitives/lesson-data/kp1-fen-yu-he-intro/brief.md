# kp1-fen-yu-he-intro

**Audience.** 一年级 (6–7岁), Mandarin Chinese (Simplified)
**Length.** 100–130 seconds — 3 knowledge points share one video; each gets ~30–40s.
**Builds on.** none (foundational; 5以内数 unit, section 1.4)
**Style.** default

## Knowledge point

This video bundles the first three KPs of 1.4《分与合》:

- **KP1 — 分与合的含义.** A whole quantity can be SEPARATED into two parts (*分*), and two parts can be JOINED back into the whole (*合*). The two operations are inverses — same picture, opposite direction. Applies to 2–5 across this unit; today the demonstration uses 5.
- **KP2 — 分合式的认识.** The Chinese math notation for fen-yu-he: a single *whole* number on top, two diagonal short lines descending to two *part* numbers below. Read top-down = "X 分成 A 和 B." Read bottom-up = "A 和 B 组成 X."
- **KP3 — 5的组成.** Five has four splits: (1,4), (2,3), (3,2), (4,1). Today the child sees them as four 分合式 diagrams sitting side by side.

This is the first formal symbolization beat of the 5以内 unit. Everything earlier is counting; this is the child's first encounter with a small mathematical diagram. The video must keep the connection between concrete dots and the abstract diagram *visible* — never let the symbol replace the proof.

## The one beat

> **A row of 5 dots splits visibly into 2 dots + 3 dots, the count labels "5", "2", "3" snap on, then those labels migrate up into the formal 分合式 layout — top "5", two lines coming down to "2" and "3". The diagram is the same fact the child just watched, recorded in symbols.**

If this single transition lands, KP1 + KP2 are taught. KP3 is then a tidy enumeration of three more arrangements of the same diagram.

## Out of scope

- No 4的组成 / 2的组成 / 3的组成 — those belong to the **second** video in this pair (bottom 3 KPs).
- No 有序思考 ("ordered thinking") rule — we *show* the four splits of 5, but we do NOT teach the kid the meta-rule of "start from 1, add 1 each time." That's KP6, owned by the second video.
- No 加法 / 减法 symbols (+, −, =). 分合式 is a pre-arithmetic notation; introducing arithmetic operators here muddies the lesson.
- No 6以上的数. The whole video stays inside 2–5.

## Continuity

Standalone. Doesn't reuse identity-invariant primitives from earlier lessons. Once shipped, *this* lesson's countable (likely a CountableObject variant) and 分合式 visual are the canonical look for the rest of the 1.4 unit.

## Narration notes

- "分" (fēn) and "合" (hé) are 1-character utterances — ASR risks low-confidence alignment. Audio-captions should propose multi-character framings: "分开", "合起来", "分成", "组成". Per-cue narration should pair the single-character term with a clarifying companion the first time it appears.
- "分合式" (fēn-hé-shì) — 3-character technical noun. OK once paired with the visible diagram.
- "组成" (zǔ-chéng) — common, low risk.
- Avoid English code-switching ("five splits into two and three"). Stay in Mandarin.

## Required NEW primitive

Likely gap: a `FenHeDiagram` primitive in `src/shape-primitives/counting.tsx`:

- Props: `whole` (number), `parts: [number, number]`, optional `progress` (0–1) for animated reveal of lines + part numbers, optional `direction` reading hint, dimmed/active state.
- Renders the whole on top, two diagonal stroke-revealable lines descending, and two part numbers below. Lesson-agnostic: no hardcoded "5" / "2" / "3" / Chinese strings — caller passes them in.
- Composition of multiple diagrams (the four splits of 5) is the lesson scene's job, not the primitive's.

Wave 3 primitive-gap-scan confirms or rejects this. If composition of existing primitives (`NumberCard` + `PartWholeBrace`) suffices, no new primitive ships.

Also possibly needed: an intro card composition for a math topic (existing literacy intro primitives may not fit a math subject). Wave 3 gap-scan decides.

## Pipeline context

- Lesson ID: `kp1-fen-yu-he-intro`
- Pipeline config: `lesson-data/kp1-fen-yu-he-intro/pipeline.json` (scaffold this)
- Composition name: `CompleteKp1FenYuHeIntroLesson`
- Generated timing module: `src/lessons/generated/kp1FenYuHeIntroTiming.ts`
- FPS: 30
- Cue count target: 9–11 cues (intro + KP1×2 + bridge + KP2×2 + KP3×3 + outro)
