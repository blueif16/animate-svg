# Storyboard — kp3-tens-and-ones-place

Knowledge point: **数位与位置值** — a digit's POSITION carries meaning. The bundle from KP1 acquires a *home* (十位), and the placeholder 0 records "no leftover ones" in 个位. The video exists to make the written digit "10" visible as TWO characters in TWO slots.

Total: 9 cues, ~45–55s with natural pacing. This lesson is the unit's 重点 — two emphasis beats are budgeted: `bundle-into-tens-place` (the bundle arrives in 十位) and `placeholder-zero` (the 0 earns its slot).

Identity continuity from KP1 is mandatory: every stick is the same orange `SmallStick`; the bundle uses the same coral `BundleWrap` (rope style with top-center bow). Do NOT introduce a new bundle abstraction here — KP1 owns that. The counter (计数器) is the new visual idiom this lesson introduces; the bundle simply moves *into* it.

Visuals are described in terms of reusable primitive concepts only. Wave 2 (visual-design) choreographs the moves; Wave 3 (primitive-builder) builds the missing primitives under `src/shape-primitives/`.

---

## opening
- **Beat**: Re-enter the world of KP1 — a single tied bundle sits centered, familiar and quiet. No new vocabulary yet.
- **On-screen visual**: One bundle (10 orange `SmallStick` instances wrapped by a coral `BundleWrap` with top-center bow) settles at screen center on the cream canvas. Nothing else on screen.
- **Required primitive(s)**:
  - Reuse `StickGroup` in `layout: "bundle"` with `count: 10`.
  - Reuse `BundleWrap` (coral rope, top-center bow) — identity-preserved from KP1.
- **Sketch overlay needs**: none. Hold the bundle in stillness before introducing the counter.

## recall-bundle
- **Beat**: Anchor what we already know — this bundle is *一个十*. One short label, then move on.
- **On-screen visual**: The bundle holds its position. A small label "一个十" writes on directly beneath the bundle. Bundle gives a soft scale-pop (1.0 → 1.04 → 1.0) as the label lands.
- **Required primitive(s)**:
  - Reuse `StickGroup` (bundle layout) + `BundleWrap`.
  - Reuse `LabelCallout` with `text: "一个十"`, `appearStyle: "write-on"`, anchored below the bundle.
- **Sketch overlay needs**: a single short teacher underline beneath "一个十" (one stroke, `TeacherMark` kind `underline`).

## introduce-counter
- **Beat**: A new tool appears — a two-column counter (计数器). Two empty labeled columns, each with an empty digit slot below. The bundle slides aside to make room.
- **On-screen visual**: The bundle gently slides to the left edge of the canvas (small move, stays on screen). A two-column counter draws in to the right of it: left column header **十位**, right column header **个位**. Each column body is empty (a faint outlined slot). Beneath each column body sits an empty digit slot (faint outlined rectangle, no digit yet). Column headers write on first, then the empty content slots, then the empty digit slots — top to bottom.
- **Required primitive(s)**:
  - **NEW `PlaceValueCounter`** primitive (prop-driven, lesson-agnostic) — see Wave 3 summary below. This cue uses it in fully-empty state: `columns: [{ label, content: "empty", digit: "empty" }, { label, content: "empty", digit: "empty" }]`, with a `revealProgress` prop driving the top-down draw-in.
  - Reuse `StickGroup` + `BundleWrap` (the bundle parked at left).
- **Sketch overlay needs**: optional faint teacher tick at each column header as it writes on (two small ticks total). Do NOT label the counter "计数器" with sketch text — the visual *is* the counter.

## name-the-places
- **Beat**: Name the two new positions. 十位 on the left holds tens; 个位 on the right holds ones. Pair every utterance with the visible header.
- **On-screen visual**: The 十位 header gives a soft pulse as it is named; a thin teacher arc briefly traces under "十位". Then the 个位 header pulses; a thin teacher arc traces under "个位". Counter body stays empty. Bundle still parked at left.
- **Required primitive(s)**:
  - `PlaceValueCounter` in empty state with a `highlightColumn: 0 | 1 | null` prop driving the header pulse per beat.
  - Reuse `StickGroup` + `BundleWrap` (bundle parked, no motion).
- **Sketch overlay needs**: two short `TeacherMark` `underline` strokes, one under each header — sequenced (left first, then right). They persist faintly after the cue.

## bundle-into-tens-place  *(emphasis — the climax beat)*
- **Beat**: THE moment. The bundle leaves its parking spot and slides into the 十位 column. One bundle in 十位 = 1 个十. The digit "1" writes on in the 十位 digit slot beneath the column.
- **On-screen visual**: The bundle lifts slightly, slides rightward in one slow, satisfying arc, and lands inside the 十位 column body. The column body's faint outline brightens to navy as the bundle settles (a "this slot is now occupied" signal). After the bundle settles, the digit "1" writes on inside the 十位 digit slot below the column. The 个位 column (both content slot and digit slot) remains empty/faint — do NOT fill it yet.
- **Required primitive(s)**:
  - `PlaceValueCounter`: transitions left column to `content: "bundle"` and `digit: "1"`; right column stays `content: "empty"`, `digit: "empty"`.
  - Reuse `StickGroup` + `BundleWrap` — same instances as before, just re-anchored into the 十位 column's content slot (identity preserved; not a new graphic).
  - `PlaceValueCounter` exposes a `digitRevealProgress` per column so the "1" writes on (not pops) into its slot.
- **Sketch overlay needs**: a single curved teacher arrow tracing the bundle's path from parking spot → 十位 column (one stroke, draws on with the motion). Optional small "✦" sparkle inside the 十位 digit slot as the "1" lands, to mark the climax.

## placeholder-zero  *(emphasis — the 0 must earn its place)*
- **Beat**: The 个位 column is empty — there are no leftover ones. We record that fact with a "0". The 0 is not nothing; it is a placeholder that holds the 个位 slot open.
- **On-screen visual**: Camera attention shifts to the right column (gentle dim on left side, keep visible). The 个位 content slot stays empty (no sticks arrive). A teacher arrow draws on, pointing from above to the empty 个位 digit slot. Then the digit "0" writes on slowly inside the 个位 digit slot. A small label line writes on beneath the counter: **"0 表示个位上没有零散的一."**
- **Required primitive(s)**:
  - `PlaceValueCounter`: right column transitions to `digit: "0"` while `content` stays `"empty"`. The primitive must support digit-without-content (i.e. a "0" displayed beneath an empty content slot is a valid, supported state).
  - `LabelCallout` with `text: "0 表示个位上没有零散的一."`, anchored beneath the counter, `appearStyle: "write-on"`.
- **Sketch overlay needs**: a `TeacherMark` arrow (kind `arrow`) drawing from above-right down to the 个位 digit slot, drawn on with the "0" reveal. Optional small navy underline beneath the label line on the final two characters "零散的一".

## read-the-ten
- **Beat**: Read the two digits together, left to right: "1" in 十位, "0" in 个位 — the written number "10". The "10" lives as two characters in two slots, not as a single glyph.
- **On-screen visual**: Both digit slots are now filled ("1" left, "0" right). A thin highlight sweeps left-to-right across the two digit slots in sequence: the "1" pulses, then the "0" pulses. The two slots stay in their separate cells — do NOT merge them into one combined "10" graphic. A faint connecting underline draws beneath both digit slots together, signaling "read these as one number, but they sit in two places."
- **Required primitive(s)**:
  - `PlaceValueCounter`: both digits filled (`["1", "0"]`); supports a `digitHighlightSequence` prop (e.g. `[0, 1]`) that pulses the left digit, then the right digit, on the cue timing.
  - Reuse `StickGroup` + `BundleWrap` parked inside the 十位 content slot.
- **Sketch overlay needs**: a single `TeacherMark` `underline` stroke spanning both digit slots, drawn on after the two pulses land. Sketch must NOT draw the glyph "10" anywhere — the digits live only in their slots.

## why-not-just-one
- **Beat**: Inoculation against the common mistake. If we dropped the 0 and wrote only "1", that would mean *one stick*, not *one ten*. The position is what makes it ten — and the 0 is what holds the position.
- **On-screen visual**: A small ghosted "1" (semi-transparent, navy outline only) appears off to the side of the counter, with no 个位 slot beside it — just a lone "1". A short, gentle red-tinted "x" or strike-through `TeacherMark` crosses it out. The real counter (bundle in 十位, "1" and "0" in their slots) keeps full opacity and gives a quiet confirming pulse on the "0" slot. No words on screen beyond the existing label from the previous cue.
- **Required primitive(s)**:
  - `PlaceValueCounter` in its current filled state (no change).
  - A small `LabelCallout` (or just `NumberCard` reused at ghosted opacity) to render the lone "1" off to the side — prop-driven opacity so it reads as a counter-example.
  - `TeacherMark` `strike` kind (if not present in current `TeacherMarkKind`, flag for Wave 3 — see primitive summary).
- **Sketch overlay needs**: the strike-through stroke itself is the sketch overlay (one short `TeacherMark` `strike`). Optional small confirming check or tick beneath the real "10" in the counter.

## recap
- **Beat**: One-line takeaway the child can repeat: **1 个十、0 个一，写成 "10"**.
- **On-screen visual**: The counter holds steady: bundle in 十位 content slot, "1" in 十位 digit slot, empty 个位 content slot, "0" in 个位 digit slot. Beneath everything, a large takeaway sentence writes on: **"1 个十、0 个一，写成 10"**. A gentle highlight pulse on the digit slots ("1" and "0") as the line lands. The bundle gives one final soft scale-pop.
- **Required primitive(s)**:
  - `PlaceValueCounter` in final filled state.
  - `LabelCallout` (or a simple large-text variant) for the takeaway sentence — `appearStyle: "write-on"`.
- **Sketch overlay needs**: a single teacher underline beneath the final "10" inside the takeaway sentence (one stroke). No new marks on the counter itself.

---

## Primitive summary for Wave 3 (primitive-gap-scan + primitive-builder)

Existing primitives to reuse as-is (identity-preserved from KP1):
- `SmallStick` (orange) — single 小棒.
- `StickGroup` with `layout: "bundle"` and `count: 10` — the 10-stick bundle.
- `BundleWrap` (coral rope, top-center bow) — the tie around the bundle.
- `LabelCallout` — text labels with `write-on` / `fade` appearance.
- `NumberCard` — used at ghosted opacity for the counter-example "1" in `why-not-just-one`.
- `TeacherMark` — `underline`, `arrow` kinds (already exist).

New primitive to build under `src/shape-primitives/counting.tsx`:

1. **`PlaceValueCounter`** (the only structurally new primitive this lesson needs)
   - **Purpose**: A horizontally-arranged labeled-column counter (计数器) where each column has (a) a header label, (b) a content slot for placing bundles or single sticks or nothing, and (c) a digit slot beneath for the written digit (or placeholder, or empty).
   - **Lesson-agnostic props** (do NOT hardcode "十位" / "个位" / "1" / "0" inside the primitive):
     - `columns: Array<{ label: string; content: "bundle" | "sticks" | "empty"; contentCount?: number; digit: string | "empty" }>` — N columns, ordered left-to-right.
     - `revealProgress: number` (0 → 1) — drives the top-down draw-in (headers → content slots → digit slots) when the counter first appears.
     - `digitRevealProgress?: Array<number>` — per-column write-on progress for the digit (0 → 1), so digits can write on independently and at different cue times.
     - `highlightColumn?: number | null` — soft pulse on a header (used by `name-the-places`).
     - `digitHighlightSequence?: Array<number>` — sequence of column indices whose digit slots should pulse in order (used by `read-the-ten`).
     - `connectorUnderline?: boolean` — render a single underline spanning all digit slots (used by `read-the-ten`).
     - `contentOccupiedPulse?: Array<number>` — column indices whose content-slot outline brightens to navy when the slot becomes occupied (used by `bundle-into-tens-place`).
   - **Rendering details the primitive owns** (but parameterized):
     - Column body outline style (faint when empty, brightened-navy when occupied).
     - Digit slot outline style (faint when empty; digit writes on as stroked text, then fills).
     - The header label and digit text use the lesson-agnostic typography from `shared.tsx` / `early-childhood-visual-taste`.
   - **Children-slot for content**: the content slot accepts a positioned child (the lesson scene passes the existing `StickGroup` + `BundleWrap` in as children, re-anchored into the slot). The primitive does NOT instantiate `StickGroup` itself — it provides the slot geometry and accepts whatever the lesson hands it. This preserves identity from KP1.
   - **Finger-cover test (Wave 3 must verify, per kids-eye §3)**: cover everything except this primitive. Can a 6-year-old see two labeled columns + understand "this column holds bundles; that column holds single sticks; the row beneath is for writing"? Two labels + two clearly distinct slot rows + two empty digit slots must satisfy that test on their own.

Possible small extension needed on existing `TeacherMark`:
2. **`TeacherMark` kind `strike`** — a short diagonal strike-through stroke for the `why-not-just-one` counter-example. If `TeacherMarkKind` already includes a strike/cross variant, reuse it; otherwise Wave 3 adds it as a new kind (not a new primitive). This is a tiny addition, not a structural one.

All other visual needs in this lesson are satisfied by existing primitives. Wave 3 primitive-gap-scan should confirm before building.
