<!-- GENERATED from src/capabilities/primitive-registry.json by `npm run registry:digest` (or registry:build). Do NOT hand-edit — edit the catalog's prose, then regenerate. -->

# Capability catalog — reusable craft menu

> Reusable craft catalog for the remotion-svg-primitives lesson pipeline. Source of truth for SHAPE is src/capabilities/schema.ts; source of truth for WHAT EXISTS is the code (barrels + unions). This JSON is a report-only baseline in cut 1.
>
> Source of truth for SHAPE: `src/capabilities/schema.ts`. Source of truth for WHAT EXISTS: the component barrels + `EASE`/`SPRING` keys. This menu is generated — never hand-edited.

**Coverage:** 49/49 catalog entries have hand-authored prose. Undocumented entries exist and are gated, but their menu text is pending.

## SVG teaching primitives

### Counting & number (`counting`)

| id | component | variants | use when |
| --- | --- | --- | --- |
| `answer-tile` | `AnswerTile` | — | A tappable answer or choice card holding a number, text, or icon child, with correct/wrong/selected/focused states and a state badge. |
| `bundle-wrap` | `BundleWrap` | style: rope \| band \| ribbon; knotPosition: top \| left \| right | Wrapping a row of ten sticks into a bundle with a rope, band, or ribbon that draws on via wrapProgress to show ten ones becoming one ten. |
| `comparison-symbol` | `ComparisonSymbol` | symbol: < \| = \| >; style: formal \| mouth | Placing a >, <, or = between two quantities, optionally as a hungry-mouth glyph or hidden behind a ? until revealed. |
| `conservation-bundle` | `ConservationBundle` | — | Proving a bundled ten still contains ten ones: xrayProgress fades the wrap to a ghost outline and reveals the count inner sticks inside, defusing the 'a ten is just one thing now' misconception. |
| `countable-object` | `CountableObject` | variant: animal \| banana \| block \| fish \| fruit \| star | A single cute countable thing (fish, star, fruit, etc.) to populate a counting or comparison set, with selected/dimmed/label states. |
| `count-step-indicator` | `CountStepIndicator` | — | A small circular badge that pops and fades in via progress to mark the running count at each step of a counting sequence. |
| `equation-strip` | `EquationStrip` | — | Laying out a horizontal number sentence (left op right = result) with an optional active or blank tile to spotlight a missing term. |
| `fen-he-diagram` | `FenHeDiagram` | — | Showing a whole splitting into two parts (分合式) or composing two parts into a whole; identity-preserving via getFenHeDiagramAnchors. |
| `label-callout` | `LabelCallout` | appearStyle: fade \| write-on | Dropping a centered word or phrase with an optional draw-on underline that fades in via progress to name what is on screen. |
| `number-card` | `NumberCard` | — | Showing a single digit or short value on a rounded card with optional blank line and correct/wrong/selected states, auto-sized so the glyph always insets cleanly. |
| `number-line-track` | `NumberLineTrack` | — | Showing position, ticks, highlights, and animated arc jumps along a min-to-max number line with a current-value badge. |
| `part-whole-brace` | `PartWholeBrace` | direction: down \| left \| right \| up | Drawing a curly brace that reveals via progress to bracket a span as one whole or one part, in any of four directions with an optional label. |
| `place-value-mat` | `PlaceValueMat` | — | Seating place-value contents in labeled tens/ones (optionally hundreds) columns under headers with a divider and optional written digit per column, to bridge a ten-bundle plus loose ones to the digits of a numeral; pass a child per column or perColumnCount placeholders, highlightColumn to focus one. |
| `region-split` | `RegionSplit` | — | Splitting ONE filled round region (a cookie/disk) into N equal-area parts to teach halves/thirds/quarters: cutProgress draws the cuts on, highlightPart shades one part, separation pulls the parts out to hand each to someone. |
| `small-stick` | `SmallStick` | highlight: idle \| active \| counted | A single counting stick with idle/active/counted highlight, rotation, and scale — the unit primitive for stick counting and bundling. |
| `step-tally` | `StepTally` | variant: dots \| numeric | Showing the running total as a numeric pill or a row of dots, with an optional unit label, that pops in via progress. |
| `stick-group` | `StickGroup` | layout: scatter \| row \| bundle | Laying out N counting sticks in a scatter, row, or bundle with per-index active highlight, reveal-up-to, and seeded scatter placement. |
| `ten-frame-rod` | `TenFrameRod` | variant: frame \| rod | Filling a 10-cell two-row ten-frame or one-row rod by count or colored segments to show how many make ten and the ones inside. |
| `unit-block` | `UnitBlock` | variant: chip \| cube \| dot \| rod | Showing 1-10 place-value units as cubes, dots, chips, or a segmented rod, optionally stacked, with a value label. |

### Literacy & pinyin (`literacy`)

| id | component | variants | use when |
| --- | --- | --- | --- |
| `animated-stroke-path` | `AnimatedStrokePath` | — | Drawing a single hanzi stroke on via durationInFrames or progress, with a faint ghost guide underneath and an optional pen-tip cursor. |
| `hanzi-card` | `HanziCard` | picture: book \| heart \| moon \| person \| sun \| tree \| water | Presenting a Chinese character (one per card; compose several side by side for a contrasting SET — e.g. a tone minimal pair 妈/麻/马/骂) with optional pinyin, word, and a small pictograph hint, in selected/focused states. |
| `listen-icon` | `ListenIcon` | state: idle \| playing | Marking that a sound or syllable can be played — a small speaker icon whose sound arcs swell in state=playing (driven by progress) to signal audio is available here. |
| `mouth-shape-icon` | `MouthShapeIcon` | state: open \| round \| smile \| teeth | A face icon whose mouth shows the articulation (open, round, smile, teeth) for teaching a pinyin sound's lip position. |
| `pinyin-syllable-card` | `PinyinSyllableCard` | highlight: final \| initial \| none \| tone | Showing a pinyin syllable split into initial and final tiles plus a tone mark, with the initial, final, or tone segment highlightable. |
| `pitch-playhead` | `PitchPlayhead` | tone: 0 \| 1 \| 2 \| 3 \| 4 | Riding a moving dot along a Mandarin tone contour by progress (0..1) to show where the pitch is right now, layered over a ToneMarkGlyph of the same tone and size. |
| `radical-tile` | `RadicalTile` | — | A tile holding a single radical or character component with an optional label and correct/wrong/selected answer states. |
| `stroke-guide-cell` | `StrokeGuideCell` | grid: half \| mi \| tian; focusZone: bottom \| center \| left \| right \| top | A Chinese-writing practice cell (田/米/half grid) with dashed guides and an optional highlighted focus zone for where a stroke goes. |
| `tone-mark-glyph` | `ToneMarkGlyph` | tone: 0 \| 1 \| 2 \| 3 \| 4 | Drawing one of the four Mandarin tone contours (or the neutral dot) that strokes on via progress to teach pitch shape. |

### Interaction & sorting (`interaction`)

| id | component | variants | use when |
| --- | --- | --- | --- |
| `pair-connector` | `PairConnector` | — | Drawing a line that grows via progress between two points to pair or match items, optionally dotted with snap endpoint dots that turn green on completion. |
| `pointer-hand-arrow` | `PointerHandArrow` | variant: arrow \| hand \| sparkle; direction: down \| left \| right \| up | Pointing the child's attention at a target with an arrow, pointing hand, or sparkle that nudges and scales in via progress, in any of four directions. |
| `reward-progress-token` | `RewardProgressToken` | variant: badge \| coin \| node \| star | A star, coin, badge, or node token with a circular progress ring filled by progress, showing a percent or OK once collected. |
| `sorting-bin` | `SortingBin` | state: accept \| idle \| reject; variant: basket \| tray | A labeled basket or tray drop-target whose state (idle/accept/reject) recolors to show whether a sorted item belongs there. |
| `unmatched-slot` | `UnmatchedSlot` | state: empty \| ghost | Marking the absence of a pairing partner under a surplus item in a compare-by-matching layout, so 'more than' reads as 'these have nobody' — a dashed ghost of the missing partner or a struck empty slot. |

### Sketch / teacher marks (`sketch`)

| id | component | variants | use when |
| --- | --- | --- | --- |
| `teacher-mark` | `TeacherMark` | kind: underline \| wrap-arc \| label-arrow \| vs-mark | Hand-drawn teacher ink (underline, wrap-arc, label-arrow, vs-mark) that draws on via drawProgress with optional boil wobble and pen-settle. |

### Generated assets (traced flat SVG) (`asset`)

| id | component | variants | use when |
| --- | --- | --- | --- |
| `icon-asset` | `IconAsset` | variant: color \| mono | Render a generated+traced flat SVG asset for a fixed-form representational object — a bundle, mascot, prop — that's too complex to hand-code; pass the asset name, placement, scale/size, and (color variant) on-palette theme fills, or variant=mono tinted via a theme token. |

## Motion components

| id | component | variants | use when |
| --- | --- | --- | --- |
| `asset-morph` | `AssetMorph` | direction: bundle \| unbundle | Transform a PARAMETRIC group the child has been reasoning about into its fixed-form generated IconAsset (or back) without a visible cut: a short FX-masked crossfade fires a SparkleBurst over the swap while the arriving element settles, so ten sticks BECOME one roped bundle (direction=bundle) or a bundle un-bundles into fanning sticks (direction=unbundle). Caller supplies from/to and a shared centerX/centerY (bbox-matched so identity is preserved); atFrame is cues[id].startFrame+offset. |
| `drag` | `Drag` | — | Stagger an appendage/child chain with trailing lag. |
| `draw-path` | `DrawPath` | — | Revealing any SVG path stroke-by-stroke via durationInFrames or an external progress, using a pathLength dash trick. |
| `follow-path` | `FollowPath` | — | Moving a child element along a path spec via progress, optionally rotating it to the path tangent, to animate something tracing a route. |
| `pop-in` | `PopIn` | motion: snap \| bouncy \| settle | Entrance scale physics for any appearing element. |
| `pulse-circle` | `PulseCircle` | — | Emitting expanding fading ripple rings from a point for a fixed repeatCount to draw a beat of attention to a spot. |
| `smear` | `Smear` | — | Motion-blur substitute for fast straight-line travel (>180 vbu/frame). |
| `sparkle-burst` | `SparkleBurst` | — | Firing a one-shot radial burst of stars outward from a point to celebrate a correct answer or completed beat. |

## FX components

| id | component | variants | use when |
| --- | --- | --- | --- |
| `breathe` | `Breathe` | — | Moving-hold idle breathing so held elements stay alive. |
| `fx-defs` | `FXDefs` | — | Render once per scene root to publish the FX filter defs. |
| `glint-flash` | `GlintFlash` | — | Point flash at a moment of emphasis. |
| `glow-pulse` | `GlowPulse` | — | Pulsing aura wrapper to draw the eye. |
| `shine-sweep` | `ShineSweep` | — | Cinematic shine sweeping across a rectangle (card/title). |
| `sparkle` | `Sparkle` | — | One-shot sparkle particle accent on a reward/reveal. |

## Motion vocabulary

- **EASE** (`src/motion-primitives/curves.ts`): `enter`, `balanced`, `overshoot`, `outCubic`, `outQuint`, `inOutCubic`
- **SPRING**: `snappy`, `bouncy`, `smooth`

## Styles

| id | use when | status |
| --- | --- | --- |
| `default` | Canonical lesson appearance — no aesthetic overlay. | stable |
| `ink-wash` | Sumi-e ink on warm rice paper aesthetic overlay. | experimental |

## Generated asset library — `<IconAsset name=... />` (70)

Fixed-form decorative/representational objects (traced flat SVG, on-palette). REUSE these before hand-coding or generating. Not teaching primitives — see `icon-asset` above for the fence.

- **animal** — `owl-reading`, `paw-print`
- **celebration** — `award-ribbon`, `confetti-burst`, `shining-star-orbit`, `sparkle-star`, `star`
- **character-face** — `boy-face`, `robot-face-round`, `robot-face-square`, `sad-cloud-face`
- **generated** — `pointing-hand`, `stick-bundle-roped`
- **math** — `abacus`, `add-blocks`, `balance-scale`, `bar-line-chart`, `basic-shapes`, `donut-chart`, `fraction-quarters`, `greater-less-compare`, `pattern-sequence`, `sort-shapes-bins`, `subtract-blocks`
- **nature** — `atom`, `flame`, `leaf-water-drop`, `planet-saturn`, `sprout`
- **object** — `bookmark`, `crystal-ball`, `dashboard-card`, `document-note`, `ear-listening`, `ear-soundwave`, `eye`, `flashcard-stack`, `gear`, `house`, `jigsaw-four-piece`, `journey-path-flag`, `layout-tiles`, `lightbulb-circuit`, `lightbulb-idea`, `magic-wand`, `magnet`, `microphone`, `open-book`, `prism-rainbow`, `reward-chest-card`, `scroll-document`, `shield-heart`, `stopwatch`, `treasure-chest`, `treasure-map`
- **symbol** — `checkmark-circle`, `pause-button`, `play-button`, `question-mark-circle`, `replay-arrow`, `sound-wave-bars`, `speaker-volume`, `speech-bubble-dots`, `sync-arrows`, `tap-gesture`, `upload-arrow`
- **tool** — `beaker`, `magnifying-glass`, `microscope`, `ruler-set-square`

