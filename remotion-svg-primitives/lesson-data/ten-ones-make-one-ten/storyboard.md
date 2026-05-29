# Storyboard — ten-ones-make-one-ten

Knowledge point: **10 个一 = 1 个十**. The whole video exists to make the bundling moment visible and memorable.

Total: 9 cues, ~60–75s with natural pacing. Climax beat is `bundle-action` (visual transition: 10 loose 小棒 → 1 tied 捆).

Visuals are described in terms of reusable primitive concepts only. Wave 2 (visual-design) choreographs the moves; Wave 3 (primitive-builder) turns the concepts below into prop-driven SVG primitives under `src/shape-primitives/`.

---

## opening
- **Beat**: Establish the scene — a small pile / loose arrangement of 小棒 on screen.
- **On-screen visual**: 10 small sticks arrive softly (scatter or gentle settle) into a loose, slightly playful arrangement near screen center. Title-style stillness, no counting yet.
- **Required primitive(s)**:
  - `small-stick` primitive (single 小棒, prop-driven: color, length, rotation, position).
  - `stick-group` arrangement helper that places N sticks in a "loose pile" layout (prop: `count`, `layout: "scatter" | "row" | "bundle"`).
- **Sketch overlay needs**: none.

## count-one-by-one
- **Beat**: Set up "the old way" — we are about to count one by one.
- **On-screen visual**: Sticks reflow from the loose pile into a neat horizontal row of 10, ready to be counted left-to-right.
- **Required primitive(s)**:
  - `stick-group` with `layout: "row"` (props: `count`, `gap`, `align`).
  - Reflow transition between layouts (prop on stick-group: animated layout change).
- **Sketch overlay needs**: none yet — keep the row clean before counting begins.

## count-to-ten
- **Beat**: Count the 10 sticks one-by-one out loud, slow enough that each "1" is visible.
- **On-screen visual**: As narration says 一、二、三…十, each stick in the row highlights / pops in turn left-to-right. A small number badge (1, 2, 3 … 10) appears above each stick as it is counted. The pacing is slow and deliberate.
- **Required primitive(s)**:
  - `small-stick` with a `highlight` state prop (e.g. `active`, `counted`).
  - `count-step-indicator` primitive — a small number badge that pops above a target stick (props: `value`, `anchor`, `appearFrame`).
  - Sequenced reveal: the stick-group exposes per-stick activation timings (prop: `activeIndex` or `revealUpTo`).
- **Sketch overlay needs**: optional thin teacher tick / dot under each stick as it is counted (small marks, not circles around the whole row).

## feels-slow
- **Beat**: Gentle pedagogical pause — that took 10 steps. The child feels the slowness.
- **On-screen visual**: All 10 badges (1–10) remain visible above the row. A subtle "step counter" total reads "10 步" (or 10 dots) appears, emphasizing how many counts were needed.
- **Required primitive(s)**:
  - `step-tally` primitive — shows N filled dots or a numeric badge for total count steps (prop: `steps`, `label`).
  - Reuse of `count-step-indicator` from previous cue (persistent state).
- **Sketch overlay needs**: a single teacher underline or bracket spanning the full row, conveying "all of this took 10 steps."

## bundle-action  *(emphasis — the climax beat)*
- **Beat**: THE moment. The 10 sticks are bundled into 1 tied group. This is the single visual the whole video exists for.
- **On-screen visual**: The row of 10 sticks slides/snaps together into a tight vertical bundle at screen center. A tie / rubber-band / string wraps around the middle of the bundle in one satisfying gesture. The 1–10 badges fade away during the wrap so attention is on the bundling action itself.
- **Required primitive(s)**:
  - `stick-group` `layout: "bundle"` (props: `count`, animated transition from `row` → `bundle`).
  - `bundle-wrap` primitive — a tie/band that animates around a group (props: `target`, `style: "rope" | "band" | "ribbon"`, `wrapProgress 0→1`).
  - Coordinated transition: stick-group reflow + bundle-wrap appear share a single timing curve.
- **Sketch overlay needs**: a brief teacher arc / loop gesture tracing the wrap motion (one stroke, draws on with the tie). Optional small "✦" sparkle at completion to mark the climax.

## rename-bundle
- **Beat**: Give the bundle its new name — "一个十".
- **On-screen visual**: The tied bundle sits centered. A label "一个十" writes on / fades in next to or under the bundle. Bundle has a soft glow or scale-pop to celebrate its new identity.
- **Required primitive(s)**:
  - `label-callout` primitive — text label that points to a target (props: `text`, `anchor`, `appearStyle: "fade" | "write-on"`).
  - Reuse `stick-group` in bundle layout with a `celebrate` state (gentle scale pulse).
- **Sketch overlay needs**: a teacher arrow from the label "一个十" to the bundle (single curved stroke). Optional underline beneath "一个十".

## still-ten-ones
- **Beat**: Reassure: the bundle still contains 10 ones. Same quantity, just grouped.
- **On-screen visual**: The tie briefly becomes semi-transparent (or the bundle "x-rays" open) so the 10 individual sticks inside are visible again, then re-seals. No re-counting — just a glimpse.
- **Required primitive(s)**:
  - `bundle-wrap` with an `opacity` / `peek` prop (animatable tie transparency).
  - `stick-group` retains its 10 children inside the bundle layout (the sticks are not destroyed when bundled — they are grouped).
- **Sketch overlay needs**: optional small "10" written above the bundle during the peek, fading with the reveal.

## faster-count
- **Beat**: Contrast — counting 1 ten is just 1 step.
- **On-screen visual**: The bundle is highlighted once; a single badge "1" pops above it. The earlier 10-step tally appears on the left (small, faded), and a new 1-step tally appears on the right, side-by-side. The contrast is unmistakable: 10 steps vs 1 step.
- **Required primitive(s)**:
  - Reuse `count-step-indicator` (single badge above the bundle).
  - Reuse `step-tally` primitive twice in a side-by-side comparison (prop: `steps: 10` vs `steps: 1`).
  - `comparison-row` layout helper for the two tallies (optional; can also be inline composition).
- **Sketch overlay needs**: a teacher arrow or "vs" mark between the two tallies, emphasizing the contrast.

## recap  *(emphasis — takeaway)*
- **Beat**: One-line takeaway the child can repeat: 十个一，就是一个十.
- **On-screen visual**: The bundle sits centered. The text "十个一 = 一个十" (or "十个一，就是一个十") appears large beneath it. A gentle highlight pulse on the bundle as the line lands.
- **Required primitive(s)**:
  - Reuse `stick-group` in bundle layout.
  - `label-callout` (or a simple large-text primitive) for the takeaway sentence.
- **Sketch overlay needs**: a teacher underline beneath the takeaway sentence on the final word "一个十".

---

## Primitive summary for Wave 3 (primitive-gap-scan + primitive-builder)

Likely new primitives needed under `src/shape-primitives/`:

1. **`small-stick`** — single 小棒. Props: `length`, `color`, `rotation`, `highlight` state.
2. **`stick-group`** — N sticks arranged in a layout. Props: `count`, `layout: "scatter" | "row" | "bundle"`, `gap`, `revealUpTo` (for sequenced reveal), `celebrate` state.
3. **`bundle-wrap`** — tie/band that wraps a group. Props: `wrapProgress`, `style`, `opacity` (for the peek).
4. **`count-step-indicator`** — number badge that pops above an anchor. Props: `value`, `anchor`, `appearFrame`.
5. **`step-tally`** — N-dot or numeric tally showing total count steps. Props: `steps`, `label`.
6. **`label-callout`** — text label that points to a target. Props: `text`, `anchor`, `appearStyle`.

Wave 3 primitive-gap-scan should check what already exists under `src/shape-primitives/` and only build what is missing. All primitives must be prop-driven and lesson-agnostic — no hardcoded "10", no hardcoded "一个十" copy inside primitives.
