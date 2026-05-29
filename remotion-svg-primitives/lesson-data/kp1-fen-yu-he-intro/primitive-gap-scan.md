# Primitive gap-scan — kp1-fen-yu-he-intro

Wave 3b output. Walks every load-bearing visual demand from `visual-design.md` row by row, asks whether existing primitives suffice, and names new primitives only where composition genuinely fails. Default answer is COMPOSE EXISTING. New primitives ship only when the gap is explicit.

Composition resolution confirmed from `src/theme.ts`: **1280 × 720 @ 30 fps**. All test stills render at that resolution.

---

## Existing primitive inventory (relevant to this lesson)

From `src/shape-primitives/index.ts` and source survey:

- `CountableObject` (variants: animal / banana / block / fish / fruit / star) — single PlacedGroup countable with `x`, `y`, `size`, `color`, `dimmed`. Identity-preserved across position interpolation by virtue of being a `PlacedGroup` driven entirely by props.
- `NumberCard` — rounded card with a numeral, `x`, `y`, `width`, `height`, `value`, `color`. Pure prop-driven `PlacedGroup`. **Position is a prop**, so the same React instance (stable `key`) animates from zone-chips → zone-diagram by interpolating `x`/`y` — exactly the identity-preserved migration the visual-design §7.3 risk asks for.
- `LabelCallout` — text-on-fade label with `progress`, `fontSize`, `color`, optional `underline`. For 分 / 合 / 分合式 / 分成 / 组成 / "5 的分与合".
- `PartWholeBrace` — single curved brace (direction up/down/left/right) with `progress`. **Curved**, not diagonal. Not the right shape for the 分合式 diagonals.
- `EquationStrip` — horizontal arithmetic strip. Wrong shape for 分合式 (the diagonals are NOT a horizontal equation).
- `TeacherMark` — for the two sequential sweeps in `fenheshi-read`. Already covers that demand.
- `TopicIntroCard` (lesson-level wrapper in `src/lessons/transitions/`) — 3D ceramic card from `@studio/three-effects`. Decorative; renders no title text on its own.

---

## Visual demand walkthrough

For each row of the visual-design Visual Contract:

### 1. 5-dot row in zone-stage (`fen-show`, `fen-name`, `he-show`, `he-name`, dim-backed in `fenheshi-intro`)

- **Demand.** Five identical 84-px dots that ease apart into a 2-cluster + 3-cluster, ease back together, hold, and dim to a backing layer.
- **Existing fit.** YES — compose 5 × `CountableObject` (variant pick is the lesson scene's call; brief implies "dot" not animal). Position is a prop on each one; identity-preserved across split/rejoin/dim because the composer keeps a stable `key` per index and interpolates `x`.
- **Verdict.** NO NEW PRIMITIVE. Wave 4 composes.

Note: `CountableObject` has no literal "dot" variant — closest matches are `fruit` / `star` / `banana`. For a strict round 84-px dot, the existing `UnitBlock variant="dot"` renders a plain circle with navy outline — that is the cleanest match for the brief's "5 identical dots". Composer picks UnitBlock(dot) over CountableObject for the 5-dot row.

### 2. Count chips "5" / "2" / "3" in zone-chips, migrating into zone-diagram in `fenheshi-intro`

- **Demand.** Three glyph instances appear above clusters, persist across cues, then literally travel into the 分合式 diagram positions while preserving instance identity (kids-eye §4 + visual-design §7.3 HIGH risk).
- **Existing fit.** YES — `NumberCard` accepts `x`, `y`, `value`. A composer-side `interpolate(frame, [migrateStart, migrateEnd], [chipX, diagramX])` swings the position. Same React `key` per glyph guarantees instance identity. No re-mount, no fade-out/fade-in.
- **Verdict.** NO NEW PRIMITIVE. The identity-preserved migration is satisfied by existing `NumberCard` + careful keying in Wave 4. Composer documentation: every migrating glyph gets a single stable key (`whole-5`, `part-2`, `part-3`) and is rendered as ONE element whose `x` / `y` interpolate. NEVER two stacked cross-faded copies.

### 3. 分合式 diagram — whole on top, two diagonal lines descending to two parts below

- **Demand.** A small math diagram with:
  - One numeral on top (the whole),
  - Two short diagonal stroke-revealable lines going down-left and down-right,
  - Two numerals at the bottom-left and bottom-right of the lines.
  - Stroke-on reveal via a `progress: 0–1` prop driving `strokeDashoffset`.
  - A `dimmed` state for the "previously seen" diagram in `five-1-4`.
  - Reused 4× in `five-3-2-and-4-1` and another 4× in the bigger follow-up lesson (4的组成 = 3 splits, 2/3 组成 = 1+2 splits → ≥ 8 future uses).
  - CRITICAL identity constraint: in `fenheshi-intro` the part-number glyphs ARRIVE from outside (migrating from zone-chips); in `fenheshi-read` / `five-*` they are owned by the diagram itself.
- **Composition attempt.** `NumberCard` × 3 (whole + 2 parts) + 2 × `<line pathLength={1} strokeDashoffset={1-progress} />` would work but forces the lesson scene to:
  - Repeat the geometry math (anchor positions for whole/left/right + line endpoints) **at every diagram instance**.
  - In `five-3-2-and-4-1` that geometry is repeated **4 times in one row**. Coordinate-space bugs at every repeat.
  - Across the next lesson (4的组成 + small-N composition lessons), the same geometry repeats 5+ more times.
  - `PartWholeBrace` is curved (single brace); diagonal lines are a structurally different shape. Composition of two `PartWholeBrace` rotated would look like wide curves, not the clean V-shape `分合式` notation requires.
- **Verdict.** **NEW PRIMITIVE — `FenHeDiagram` ships.** The gap is named: (a) demand = identity-stable two-diagonal-line frame with three anchored numeral slots, (b) no existing primitive draws diagonal stroke-revealable lines descending from a whole to two parts, (c) composition repeats the same geometry 8+ times across this lesson + the follow-up — encapsulation pays off after the second use.

  Design — lesson-agnostic, prop-driven:
  - Props: `whole: number | string`, `parts: [number | string, number | string]`, `progress?: number` (0–1, drives line draw-on AND part/whole numeral fade-in), `dimmed?: boolean`, `width?: number` (defaults to 200), `lineColor?: ThemeColor`, `numberColor?: ThemeColor`, `renderNumbers?: boolean` (default true — when `false`, the diagram renders ONLY the frame + lines so the composer can place migrating `NumberCard` children at the exposed anchor positions for `fenheshi-intro`).
  - Exposes anchor positions as named exports: `getFenHeDiagramAnchors(width)` → `{ whole: {x, y}, leftPart: {x, y}, rightPart: {x, y} }`. The composer uses these for the migration target positions in `fenheshi-intro`.
  - NEVER hardcodes Chinese strings, "5", "2", "3", or "分合式". Caller passes numbers/strings; the diagram only draws geometry.

### 4. Multi-diagram horizontal row (`five-3-2-and-4-1` — four diagrams in one row)

- **Demand.** Four 分合式 side-by-side, equally spaced, equally dim or active.
- **Existing fit.** Composition of four `<FenHeDiagram>` instances with manually-spaced `x` props. This is the lesson scene's composition responsibility, NOT a primitive (storyboard explicitly says "Wave 3 should not invent a `FenHeRow`").
- **Verdict.** NO NEW PRIMITIVE.

### 5. Bidirectional sweep / highlight in `fenheshi-read`

- **Demand.** Two sequential `TeacherMark` strokes (downward sweep over the diagram, then upward sweep) — never simultaneous.
- **Existing fit.** YES — `TeacherMark` already handles stroke-on reveal and supports cue-relative timing.
- **Verdict.** NO NEW PRIMITIVE.

### 6. Two-headed arrow in `he-name`'s count strip

- **Demand.** A horizontal strip with "5" / "2" / "3" and a two-headed arrow with 分 on the left head, 合 on the right head.
- **Existing fit.** Composition of `NumberCard` × 3 + two `TeacherMark` arrow-strokes (kind="label-arrow") or a single composed `<line>` with arrowheads. The two-headed arrow is a simple stroke + two small triangular arrowheads at each end; can be rendered as a small inline SVG composition inside the scene OR as two `TeacherMark` strokes.
- **Verdict.** NO NEW PRIMITIVE. Wave 4 composes from existing pieces. (If TeacherMark's `label-arrow` kind doesn't give a clean two-headed arrow, the composer renders raw `<line>` + two `<path>` arrowheads as part of the strip composition. Still no primitive needed — this is a one-off graphic local to `he-name`.)

### 7. Topic-intro card (`intro` cue) — title + subtitle + mini live preview of dot-split

- **Demand.** "Today: 5以内数 / 分与合" written on, with a small replay of the split-and-rejoin under the title.
- **Existing fit.** Yes — the existing 3D `TopicIntroCard` (in `src/lessons/transitions/`) provides the ceramic card backdrop but does NOT render title text. The brief's intro design is mostly **SVG** (title text via `LabelCallout`, subtitle via `LabelCallout`, mini-preview via small `UnitBlock` variant="dot" composition). The 3D TopicIntroCard is decorative and is NOT what this lesson needs for the intro — the math intro is 2D, with a tiny dot-preview that is meaningful (it telegraphs the lesson's central transformation).
- **Verdict.** NO NEW PRIMITIVE. The intro is a scene-level COMPOSITION of existing `LabelCallout` (title + subtitle) + 5 × `UnitBlock(dot)` (mini preview) at smaller size, choreographed by the Wave 4 composer. No 3D card needed for this lesson because the math intro idiom is SVG-flat (matches the rest of the video). If a future kids-math lesson wants a 3D-card opener with title text, a separate primitive can be designed then. For this lesson, an SVG intro composition is correct.

---

## Summary — what ships

| Demand | Verdict | Owner |
|---|---|---|
| 5-dot row | Compose `UnitBlock variant="dot"` × 5 | Wave 4 |
| Count chips (5, 2, 3) | Compose `NumberCard` × 3 + interpolated `x`/`y` for migration | Wave 4 |
| 分合式 diagram | **NEW PRIMITIVE: `FenHeDiagram`** | Wave 3 (this doc) |
| Four-diagram row | Compose `FenHeDiagram` × 4 | Wave 4 |
| Bidirectional sweep | Compose `TeacherMark` × 2 | Wave 4 |
| Two-headed arrow | Compose `<line>` + arrowhead paths inside `he-name` scene region | Wave 4 |
| Topic-intro card | Compose `LabelCallout` + small `UnitBlock(dot)` mini-preview | Wave 4 |

**ONE new primitive ships: `FenHeDiagram`.** Lives in `src/shape-primitives/counting.tsx`; exported from `src/shape-primitives/index.ts`; documented in `CAPABILITIES.md` under id `fen-he-diagram`. Test stills at 1280×720 in `lesson-data/kp1-fen-yu-he-intro/primitive-checks/`.

---

## Identity-preservation contract for `fenheshi-intro` (the load-bearing migration)

This is the upstream HIGH-priority risk (visual-design §7.3). The contract Wave 4 composer must honor when wiring `FenHeDiagram` + migrating chips:

1. The three `NumberCard` instances created at `fen-name` are kept across cues via stable React `key` (`chip-whole-5`, `chip-part-2`, `chip-part-3`).
2. During `fenheshi-intro`, `<FenHeDiagram renderNumbers={false} progress={lineProgress} />` is rendered at the diagram's target position.
3. The composer interpolates each migrating `NumberCard`'s `x`/`y` from its zone-chips anchor to the FenHeDiagram anchor returned by `getFenHeDiagramAnchors(width)`. Same instance, same key, position is the only prop that animates.
4. After settle (`migrateEnd`), the migrating `NumberCard`s are at the same coordinates as where `FenHeDiagram(renderNumbers=true)` would draw them. From `fenheshi-read` onward, the composer can either keep rendering the external `NumberCard`s OR cross-fade to `FenHeDiagram(renderNumbers=true)` — visually identical because the anchor positions match.

This is the load-bearing constraint of the whole video. Primitive API exposes anchors so the composer doesn't reverse-engineer them.

---

## Lint / build

`npm run lint` passes after primitive ships. Test stills render at composition size.
