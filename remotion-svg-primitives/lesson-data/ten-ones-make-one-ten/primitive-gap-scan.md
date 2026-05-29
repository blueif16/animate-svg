# Primitive gap scan — ten-ones-make-one-ten

Wave 3b report. Compares storyboard primitive needs against `src/shape-primitives/`. Wave 3c (primitive-builder) consumes the build order in §4.

---

## 1. Inventory of existing primitives

All exports from `src/shape-primitives/index.ts`, grouped by file. None of the existing primitives draw a single 小棒 stick, an N-stick group with `scatter`/`row`/`bundle` layouts, a tie/wrap band, a transient number badge anchored above an object, a step-count tally, or a free-floating callout label with an arrow to a target. The closest reusable building blocks are listed under each entry.

### `counting.tsx`
- **`CountableObject`** — single themed character (`fish`, `banana`, `block`, `fruit`, `animal`, `star`). Props: `variant`, `color`, `size`, `selected`, `dimmed`, `label`, `x/y/transform`. Renders one stylized animal/object glyph with shadow + optional label. Not a stick. No rotation, no `length` axis. Not reusable for `small-stick`.
- **`UnitBlock`** — N small cubes / chips / dots / rods in a grid. Props: `variant: "chip" | "cube" | "dot" | "rod"`, `count` (1–10), `size`, `stacked`, `color`, `value`. The `rod` variant draws a single horizontal pill with sub-cells — closest in spirit to a wood stick but horizontal, multi-cell, and pinned to a 1–10 cell count. Not a vertical 小棒.
- **`NumberCard`** — pill-shaped card with one number/string. Props: `value`, `width`, `height`, `color`, `blank`, plus selection states. Could be repurposed as a count badge but its default 92×112 size, pill shape, and selection-ring overhead make it heavier than what `count-step-indicator` needs.
- **`AnswerTile`** — answer-card-with-state. Wider/heavier than `NumberCard`. Not a fit for a small count badge.
- **`ComparisonSymbol`** — `<`, `=`, `>` glyph with `formal` / `mouth` styles. Not relevant (lesson uses sketch "vs" mark, owned by sketch-layer).
- **`EquationStrip`** — multi-tile equation row. Not relevant; the takeaway "十个一 = 一个十" is plain large text via a label primitive, not an equation strip.
- **`NumberLineTrack`** — number line with ticks, highlights, jumps. Not relevant.
- **`PartWholeBrace`** — animated curved brace with `progress` 0→1 and an attached label. Bracket gesture only; cannot wrap horizontally around a bundle. Not reusable for `bundle-wrap`.
- **`TenFrameRod`** — 10-cell ten-frame with segment fills. Not relevant; we are not in ten-frame mental-model territory for this lesson.

### `interaction.tsx`
- **`PairConnector`** — straight line with `progress` 0→1 between two endpoints. Could in theory underlie an `arrow` overlay, but it has no arrowhead, no curve, and is straight-only. Not a fit for the curved label-to-bundle arrow in `rename-bundle`.
- **`SortingBin`** — basket/tray. Not relevant.
- **`PointerHandArrow`** — hand/arrow/sparkle pointer with `direction`, `progress`, `size`. Has a built-in arrowhead but is a stylized full-color pointer, not a teacher pen-stroke. The sketch-overlay needs (Wave 3a) draws ink strokes via the sketch layer's own primitives. `label-callout` may optionally use this as the arrow renderer, but visual-design hand-off specifies the arrow is a sketch mark owned by sketch-layer — so `label-callout` should NOT depend on `PointerHandArrow`. The label primitive only carries the text; the arrow comes from sketch-layer.
- **`RewardProgressToken`** — coin/star/badge with progress ring. Could be retrofitted into `step-tally` (numeric variant) but its progress-ring + collected/uncollected machinery is unrelated to a "N dots / 10 步" tally. Cleaner to build `step-tally` as a fresh primitive.

### `literacy.tsx`
- **`HanziCard`** — Hanzi character on a card with optional pinyin/picture/word. Could host "一个十" as a card label but the lesson's `label-callout` is a free-floating text node, not a card. Card chrome (border, rounded rect, selection ring) would be visually noisy next to the bundle.
- **`RadicalTile`** — radical tile. Not relevant.
- **`StrokeGuideCell`** — 田字格 cell. Not relevant.
- **`AnimatedStrokePath`** — animated stroke-on path with optional cursor, `progress` 0→1. This is the right utility for any "writes-on" gesture. The sketch-overlay primitive (Wave 3a's domain) will use this style of timing, but the sketch-overlay file lives in its own location per the `sketch-explainer-layer` skill, NOT under `shape-primitives/`. `label-callout`'s optional `write-on` style could call `AnimatedStrokePath` per glyph, but visual-design pins this lesson to `appearStyle: "fade"` only.
- **`ToneMarkGlyph`**, **`PinyinSyllableCard`**, **`MouthShapeIcon`** — not relevant.

### `shared.tsx` (helpers, not primitives — reuse extensively in Wave 3c)
- **`PlacedGroup`** — `<g>` with `x/y/transform` props. Every new primitive should wrap its render in this.
- **`PrimitiveLabel`** — centered SVG text with navy fill, rounded font. Use for badge numbers, tally label, callout text.
- **`SelectionRing`**, **`StateBadge`** — quiz-state chrome. Not needed for this lesson.
- **`resolveColor(color, fallback)`** — accepts `ThemeColor` key or raw hex. ALL color props in new primitives must go through this.
- **`clamp01`**, **`clampNumber`** — use for `wrapProgress`, `opacity`, `revealUpTo` clamping.
- **`shadowStyle()`** — drop-shadow for sticks and bundle.
- **`starPath(cx, cy, outer, inner?)`** — reuse for the optional climax sparkle in `bundle-action`.
- **`stateOpacity(disabled, dimmed)`** — returns `0.45` / `0.38` / `1`. `step-tally`'s `dimmed` prop should use this to match `CountableObject`'s convention.
- **Constants** `NAVY_STROKE = 4`, `CARD_RADIUS = 18`, `fontFamily` — reuse, do not redefine.
- **Types** `ThemeColor`, `PlacementProps`, `PrimitiveGroupProps` — every new primitive's prop type should extend `PrimitiveGroupProps & PlacementProps`, matching every existing primitive.

---

## 2. Storyboard requirements

Storyboard §"Primitive summary" lists six primitives; visual-design §5 hand-off refines props. One sketch-overlay primitive is also inferred from visual-design §5 sketch table (no `sketch-overlay.md` exists yet — Wave 3a's domain — but a primitive concept can be named so Wave 3c knows whether to build it).

### Definitely new
- `small-stick` — single vertical 小棒 with `highlight` state. No existing primitive draws this.
- `stick-group` — N sticks with `layout: "scatter" | "row" | "bundle"`, keyed children, `revealUpTo`, `celebrate`. No existing primitive places N children across multiple named layouts with stable identity.
- `bundle-wrap` — coral cord/band with `wrapProgress` and `opacity` peek. `PartWholeBrace` is the wrong gesture (brace under, not wrap around).
- `count-step-indicator` — small white pill with a navy number, anchored above a target. `NumberCard` is too heavy.
- `step-tally` — N dots OR a numeric "10 步" pill, with `dimmed` state. `RewardProgressToken` is the wrong gesture (progress ring + collected).
- `label-callout` — free-floating text node with `appearStyle: "fade" | "write-on"`. `HanziCard` is too heavy (card chrome).

### Extend existing
None. Every storyboard primitive is a clean greenfield concept that does not naturally fit inside an existing prop surface without bloating it.

### Reuse as-is
None directly. Existing primitives are used only as helpers — `PlacedGroup`, `PrimitiveLabel`, `resolveColor`, `clamp01`, `shadowStyle`, `starPath` from `shared.tsx`.

### Sketch-overlay primitive (Wave 3a)
Visual-design §5 lists six teacher marks: per-stick ticks, full-row underline, climax wrap arc, label-to-bundle curved arrow + label underline, "vs" mark, recap underline. These are sketch ink, not lesson primitives — they live under whatever directory the `sketch-explainer-layer` skill owns (per project rules, NOT under `src/shape-primitives/`). **Wave 3c does NOT build the sketch primitive.** This gap scan flags it so Wave 3c does not accidentally absorb sketch concerns into `shape-primitives/`. Wave 3a owns it.

---

## 3. Per-primitive gap report

### 3.1 `small-stick`

- **Status**: new
- **Target file**: `src/shape-primitives/counting.tsx` (math-lesson family — stays with `UnitBlock`, `TenFrameRod`)
- **Props (full TypeScript signature)**:
  ```ts
  export type SmallStickHighlight = "idle" | "active" | "counted";

  export type SmallStickProps = PrimitiveGroupProps &
    PlacementProps & {
      color?: ThemeColor;         // default colors.reward
      outlineColor?: ThemeColor;  // default colors.textNavy
      length?: number;            // default 120, height of the stick body in px
      thickness?: number;         // default 18, width of the stick body in px
      rotation?: number;          // default 0, degrees, applied around (x, y)
      highlight?: SmallStickHighlight; // default "idle"
      activeColor?: ThemeColor;   // default colors.sunshine, used when highlight === "active"
      scale?: number;             // default 1, used by stick-group for active 1.08x pop
    };
  ```
- **Animation surface**: `rotation`, `scale`, `highlight`, `color`, `opacity` (inherited from `PrimitiveGroupProps`) are timeline-driven. `length`/`thickness` are static per-instance (composer fixes per lesson).
- **Render shape**: A vertical rounded rectangle (rx = thickness × 0.5) filled with `color`, outlined `outlineColor` at `NAVY_STROKE`. Wrapped in `PlacedGroup` so `x/y/transform` work. Optional subtle drop shadow via `shadowStyle()`. When `highlight === "active"`, fill interpolates toward `activeColor` (composer handles the timing; the primitive just renders the fill it's told). When `highlight === "counted"`, renders identically to `idle` (visual-design §5 explicitly says no visual difference; the prop exists so the composer can reason about state).
- **Reuse opportunities**: `PlacedGroup`, `resolveColor`, `shadowStyle`, `NAVY_STROKE` constant. No need for `SelectionRing`/`StateBadge`.

### 3.2 `stick-group`

- **Status**: new
- **Target file**: `src/shape-primitives/counting.tsx`
- **Props (full TypeScript signature)**:
  ```ts
  export type StickGroupLayout = "scatter" | "row" | "bundle";

  export type StickGroupProps = PrimitiveGroupProps &
    PlacementProps & {
      count: number;                  // required, no default — caller passes 10
      layout: StickGroupLayout;       // required, no default
      color?: ThemeColor;             // default colors.reward, passed to every small-stick
      stickLength?: number;           // default 120
      stickThickness?: number;        // default 18
      // layout-specific spacing
      rowGap?: number;                // default 130, x-stride between sticks in "row"
      bundleGap?: number;             // default 18, x-stride between sticks in "bundle"
      scatterRadius?: number;         // default 220, half-extent for randomized scatter positions
      scatterRotationRange?: number;  // default 25, max abs(rotation) in degrees for scatter
      seed?: number;                  // default 0, deterministic seed for scatter positions/rotations
      // per-stick state
      activeIndex?: number;           // index currently highlighted "active" (timeline-driven)
      revealUpTo?: number;            // 0..count, how many sticks are "counted" (≤revealUpTo are counted, the rest idle)
      // group-level effects
      celebrate?: boolean;            // default false; composer animates a scale pulse externally
      scale?: number;                 // default 1, lets composer drive the celebrate pulse
    };
  ```
- **Animation surface**: `layout`, `activeIndex`, `revealUpTo`, `scale`, `opacity` are timeline-driven (composer interpolates `layout` transitions by passing intermediate prop snapshots — primitive renders whatever layout it's given each frame). `count`, `seed`, `stickLength`, `stickThickness` are static per scene.
  - **Critical**: layout transitions are NOT animated inside the primitive. The composer is responsible for interpolating per-stick `x/y/rotation` between two layouts. This primitive computes the *terminal* position for each stick in each layout via pure functions and exposes them as helpers (see §4). The composer reads helpers like `getStickPlacement(index, layout, props)` and interpolates between the `from` and `to` placements using Remotion's `interpolate`. This keeps the primitive lesson-agnostic and the composer in charge of the climax timing spine.
- **Render shape**: Renders `count` `small-stick` children, each keyed `key={index}` (stable identity per visual-design §4 invariant). Each child receives its computed `(x, y, rotation)` from the current `layout`, its `highlight` from `activeIndex`/`revealUpTo`, and the shared `color`/`stickLength`/`stickThickness`. Wrapped in `PlacedGroup` with `transform={scale(${scale})}` for the celebrate pulse.
- **Layout math (deterministic)**:
  - `scatter`: positions seeded by `seed` + index, x ∈ [−scatterRadius, scatterRadius], y ∈ [−scatterRadius × 0.55, scatterRadius × 0.55], rotation ∈ [−scatterRotationRange, scatterRotationRange]. Use a small PRNG (mulberry32 from `seed + index`) so the same seed always produces the same scatter.
  - `row`: x = (index − (count − 1) / 2) × rowGap, y = 0, rotation = 0.
  - `bundle`: x = (index − (count − 1) / 2) × bundleGap, y = 0, rotation = 0.
- **Reuse opportunities**: `PlacedGroup`, `clampNumber` for `revealUpTo` clamp, `resolveColor`. PRNG helper should go in `shared.tsx` (see §4).

### 3.3 `bundle-wrap`

- **Status**: new
- **Target file**: `src/shape-primitives/counting.tsx`
- **Props (full TypeScript signature)**:
  ```ts
  export type BundleWrapStyle = "rope" | "band" | "ribbon";

  export type BundleWrapProps = PrimitiveGroupProps &
    PlacementProps & {
      width: number;                 // required, horizontal extent of the bundle to wrap (px)
      height?: number;               // default width × 0.22, vertical thickness of the tie band
      wrapProgress?: number;         // default 1, 0..1 clamped, draw-on progress
      style?: BundleWrapStyle;       // default "rope"
      color?: ThemeColor;            // default colors.coral
      outlineColor?: ThemeColor;     // default colors.textNavy
      opacity?: number;              // default 1, 0..1 — for the still-ten-ones peek
      knotSide?: "left" | "right";   // default "right", which side gets the knot glyph
    };
  ```
- **Animation surface**: `wrapProgress`, `opacity`, `width` (composer can pulse width subtly for the settle) are timeline-driven. `style`, `color`, `height`, `knotSide` are static per scene.
- **Render shape**: A horizontal band centered at the primitive's origin. The band is drawn as a single `<path>` with `pathLength={1}` + `strokeDashoffset={1 - wrapProgress}`, so the cord appears to sweep from the `knotSide` opposite edge to the knot. At full wrap, a small circular knot glyph (~height × 0.7 radius) renders at the `knotSide` end. The `style` variants differ by stroke width and dash pattern:
  - `"rope"`: thick stroke (height × 0.6), solid, slight twist hatch via a second offset path at low opacity. This lesson uses `"rope"`.
  - `"band"`: filled rect with rounded ends (`rx = height / 2`), no twist.
  - `"ribbon"`: filled rect + a small tail flair on the knotSide.
- **Reuse opportunities**: `PlacedGroup`, `resolveColor`, `clamp01` (for `wrapProgress` and `opacity`). The `pathLength`/`strokeDashoffset` draw-on idiom matches `PartWholeBrace` and `NumberLineTrack`'s jump rendering — copy that pattern, don't import.

### 3.4 `count-step-indicator`

- **Status**: new
- **Target file**: `src/shape-primitives/counting.tsx`
- **Props (full TypeScript signature)**:
  ```ts
  export type CountStepIndicatorProps = PrimitiveGroupProps &
    PlacementProps & {
      value: number | string;        // required — the badge number/glyph
      size?: number;                 // default 56 (diameter of the pill)
      background?: ThemeColor;       // default colors.white
      color?: ThemeColor;            // default colors.textNavy (number ink)
      outlineColor?: ThemeColor;     // default colors.textNavy
      progress?: number;             // default 1, 0..1 — pop-in scale (0 = invisible, 1 = full)
    };
  ```
- **Animation surface**: `progress`, `value`, `background`, `opacity` are timeline-driven. `size`, `outlineColor` are static per-instance.
- **Render shape**: A circular pill (rounded rect with `rx = size / 2`, or `<circle>` of radius `size / 2`) filled with `background`, outlined `outlineColor`, with `value` rendered centered via `PrimitiveLabel` at `fontSize = size * 0.62`. Wrapped in `PlacedGroup` with a `scale(${0.6 + 0.4 * progress})` transform so the pop-in scale animates from 0.6 to 1.0 over the visual-design's 10f `easeOutBack` window. Opacity = `clamp01(progress * 2)` so the badge fades in over the first 50% of progress and is fully opaque thereafter.
- **Reuse opportunities**: `PlacedGroup`, `PrimitiveLabel`, `resolveColor`, `clamp01`, `NAVY_STROKE`, `shadowStyle`.

### 3.5 `step-tally`

- **Status**: new
- **Target file**: `src/shape-primitives/counting.tsx`
- **Props (full TypeScript signature)**:
  ```ts
  export type StepTallyVariant = "dots" | "numeric";

  export type StepTallyProps = PrimitiveGroupProps &
    PlacementProps & {
      steps: number;                 // required — the count to display
      label?: ReactNode;             // optional — e.g. "步"; rendered to the right of the value
      variant?: StepTallyVariant;    // default "numeric"
      // numeric variant
      size?: number;                 // default 64, pill height
      background?: ThemeColor;       // default colors.white
      color?: ThemeColor;            // default colors.textNavy (number + label ink)
      outlineColor?: ThemeColor;     // default colors.textNavy
      // dots variant
      dotSize?: number;              // default 18 (only used when variant === "dots")
      dotGap?: number;               // default 8
      dotColor?: ThemeColor;         // default colors.textNavy
      // shared
      dimmed?: boolean;              // default false; uses stateOpacity(undefined, dimmed)
      progress?: number;             // default 1, 0..1 for fade-in
    };
  ```
- **Animation surface**: `progress`, `dimmed`, `steps`, `opacity` are timeline-driven (composer can swap `steps: 10` ↔ `steps: 1` between cues). `variant`, `size`, colors are static per-instance.
- **Render shape**:
  - `numeric`: a horizontal pill (rounded rect, `rx = size / 2`) containing `steps` as a large numeral on the left and `label` (e.g. "步") as a smaller glyph on the right, both via `PrimitiveLabel`. Padding ~14px each side. Total width auto-fits text.
  - `dots`: a horizontal row of `steps` filled circles (`r = dotSize / 2`), each spaced `dotGap` apart, all filled `dotColor`. Useful for a denser visual; this lesson uses `numeric` per visual-design ("10 步" pill).
  - Both variants honor `dimmed` via `stateOpacity(undefined, dimmed)` on the `PlacedGroup` opacity (returns `0.38` when dimmed — matches `softGrayBlue` softness without recoloring). Visual-design §5 hand-off accepts either a `dimmed` boolean OR a color-prop override; the boolean is simpler and matches `CountableObject`'s convention.
- **Reuse opportunities**: `PlacedGroup`, `PrimitiveLabel`, `resolveColor`, `clamp01`, `stateOpacity`, `NAVY_STROKE`, `shadowStyle`.

### 3.6 `label-callout`

- **Status**: new
- **Target file**: `src/shape-primitives/counting.tsx` (this lesson family; the primitive is general enough that future lessons can lift it, but it co-locates with the rest of this lesson's new primitives)
- **Props (full TypeScript signature)**:
  ```ts
  export type LabelCalloutAppearStyle = "fade" | "write-on";

  export type LabelCalloutProps = PrimitiveGroupProps &
    PlacementProps & {
      text: ReactNode;               // required — the label content
      fontSize?: number;             // default 48
      color?: ThemeColor;            // default colors.textNavy
      fontWeight?: number;           // default 900
      appearStyle?: LabelCalloutAppearStyle; // default "fade"
      progress?: number;             // default 1, 0..1 — fade-in or write-on progress
      underline?: boolean;           // default false — renders a navy underline beneath text, also progress-driven
      underlineColor?: ThemeColor;   // default colors.textNavy
      maxWidth?: number;             // default undefined — optional wrap hint (not enforced at SVG level)
    };
  ```
- **Animation surface**: `progress`, `text`, `opacity`, `color`, `underline` are timeline-driven. `fontSize`, `fontWeight`, `appearStyle` are static per-instance.
- **Render shape**: A single SVG `<text>` rendered via `PrimitiveLabel` (or a thin local copy if `PrimitiveLabel`'s defaults don't fit), positioned at `(x, y)`. For `appearStyle: "fade"` (this lesson's default), opacity = `clamp01(progress)`. For `appearStyle: "write-on"`, the text is rendered as glyph paths with `pathLength`/`strokeDashoffset` — visual-design specifies this lesson uses `"fade"` only because Chinese glyph write-on is brittle, so the `"write-on"` branch can be a simple fallback to `"fade"` for v1 (Wave 3c can either implement the proper write-on or fall back; flag this in the build report). When `underline: true`, a line is drawn under the text baseline whose `strokeDashoffset` is driven by the same `progress`. No arrow is rendered — the curved arrow from label to bundle is owned by the sketch-overlay layer (Wave 3a), not by this primitive.
- **Reuse opportunities**: `PlacedGroup`, `PrimitiveLabel`, `resolveColor`, `clamp01`, `fontFamily`.

### 3.7 Sketch-overlay primitive (out of scope for Wave 3c, flagged here)

- **Status**: **out of scope for Wave 3c.** Sketch marks live under the `sketch-explainer-layer` skill's owned path, NOT under `src/shape-primitives/`. Visual-design §5 lists six marks (per-stick tick, row underline, climax wrap arc, label→bundle arrow + underline, "vs" mark, recap underline). Wave 3a (sketch-layer) owns this. Wave 3c should NOT add any `sketch-mark` primitive to `shape-primitives/`.
- Confirmation for Wave 3c: skip. The lesson-agnostic compliance check (§5) below applies to the six primitives above only.

---

## 4. Wave 3c build order

Build in this order — independents first, composites last. Each item's "depends on" is explicit so Wave 3c can parallelize where safe.

0. **Shared helper additions to `src/shape-primitives/shared.tsx`** (do first — used by step 2)
   - `mulberry32(seed: number): () => number` — deterministic PRNG factory. Used by `stick-group` `scatter` layout positions/rotations so the same `seed` always produces the same scatter (lesson invariant: 10 sticks have stable identity across renders).
   - No other shared helpers needed. Do NOT add a `comparison-row` primitive (visual-design §5 explicitly forbids it; composer handles side-by-side inline).

1. **`small-stick`** (independent) → `counting.tsx`. Foundation primitive; `stick-group` depends on it.

2. **`stick-group`** (depends on `small-stick`, depends on `mulberry32` in `shared.tsx`) → `counting.tsx`. Renders N `small-stick` children. Must expose pure layout helpers (`getStickPlacement(index, layout, props): { x, y, rotation }`) so the composer can interpolate between layouts; do not animate layout transitions inside the primitive.

3. **`bundle-wrap`** (independent) → `counting.tsx`. Pairs visually with `stick-group` `layout: "bundle"` but does not depend on it (composer positions both).

4. **`count-step-indicator`** (independent) → `counting.tsx`.

5. **`step-tally`** (independent) → `counting.tsx`.

6. **`label-callout`** (independent) → `counting.tsx`.

7. **Export everything from `index.ts`** — add the new types and components to `src/shape-primitives/index.ts` following the existing alphabetized pattern in the `./counting` block. New exports:
   - Components: `BundleWrap`, `CountStepIndicator`, `LabelCallout`, `SmallStick`, `StepTally`, `StickGroup`.
   - Types: `BundleWrapProps`, `BundleWrapStyle`, `CountStepIndicatorProps`, `LabelCalloutAppearStyle`, `LabelCalloutProps`, `SmallStickHighlight`, `SmallStickProps`, `StepTallyProps`, `StepTallyVariant`, `StickGroupLayout`, `StickGroupProps`.

Items 1, 3, 4, 5, 6 are mutually independent and can be built in parallel after step 0. Item 2 is the only blocker — it depends on items 0 (`mulberry32`) and 1 (`small-stick`).

Total: 6 new primitives + 1 shared PRNG helper + 1 `index.ts` export update. No existing primitive is modified.

---

## 5. Lesson-agnostic compliance check

Confirming none of the proposed primitives bake in lesson-specific values:

| Primitive | Lesson-specific value | How it stays out of the primitive |
|---|---|---|
| `small-stick` | `colors.reward` orange | `color` prop with `ThemeColor` type; default is a theme key, composer passes the actual color |
| `small-stick` | `colors.sunshine` active flash | `activeColor` prop; default is a theme key, not hardcoded literal |
| `stick-group` | `count: 10` | `count` is a required prop, no default — composer must pass `10` |
| `stick-group` | `layout: "scatter"` opening look | `layout` is required, no default; composer picks per cue |
| `stick-group` | scatter seed (must be deterministic) | `seed` prop, default `0`; composer fixes one seed for the lesson and the primitive computes positions from it. No `Math.random()` in the primitive. |
| `bundle-wrap` | `colors.coral` cord, `"rope"` style | `color` and `style` props with defaults; composer overrides per cue if needed |
| `count-step-indicator` | `"1"` … `"10"` badge values | `value` prop, no default — composer passes the digit |
| `count-step-indicator` | `colors.sunshine` background for the single `"1"` in `faster-count` | `background` prop with `white` default — composer overrides for that one badge |
| `step-tally` | `steps: 10` and `steps: 1` for the comparison | `steps` is required; both `10` and `1` come from the composer |
| `step-tally` | `"步"` Chinese label | `label` is a `ReactNode` prop — composer passes the text; primitive does not hardcode any Chinese string |
| `step-tally` | dimmed left-side ghost in `faster-count` | `dimmed` boolean prop; default `false` |
| `label-callout` | `"一个十"` text, `"十个一 = 一个十"` recap | `text` is a required `ReactNode` prop. No hardcoded Chinese strings. |
| `label-callout` | underline beneath "一个十" | `underline` boolean prop; composer enables per cue |
| All primitives | timings (8f / 24f / 30f) | NOT in primitives. Primitives expose `progress`, `wrapProgress`, `activeIndex`, `revealUpTo`, `scale` as numeric props. The composer interpolates them via Remotion's `interpolate` against the climax timing spine in visual-design §3. |
| All primitives | canvas size (1920×1080) | NOT in primitives. Primitives are vector. Composer sets composition size. |
| All primitives | palette hex values | NOT in primitives. All color props default to theme keys via `resolveColor`; primitive consumers can pass either a theme key or raw hex per the existing convention. |

Confirmed: zero lesson-specific copy, counts, colors, or timings are baked into the proposed primitive signatures. Every lesson-specific value is a prop the composer supplies at integration time.
