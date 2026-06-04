<!-- GENERATED from src/capabilities/primitive-registry.json by `npm run registry:digest` (or registry:build). Do NOT hand-edit — edit the catalog's prose, then regenerate. -->

# Capability catalog — reusable craft menu

> Reusable craft catalog for the remotion-svg-primitives lesson pipeline. Source of truth for SHAPE is src/capabilities/schema.ts; source of truth for WHAT EXISTS is the code (barrels + unions). This JSON is a report-only baseline in cut 1.
>
> Source of truth for SHAPE: `src/capabilities/schema.ts`. Source of truth for WHAT EXISTS: the component barrels + `EASE`/`SPRING` keys. This menu is generated — never hand-edited.

**Coverage:** 55/55 catalog entries have hand-authored prose. Undocumented entries exist and are gated, but their menu text is pending.

## SVG teaching primitives

### Counting & number (`counting`)

| id | component | variants | use when |
| --- | --- | --- | --- |
| `answer-tile` | `AnswerTile` | — | A tappable answer or choice card holding a number, text, or icon child, with correct/wrong/selected/focused states and a state badge. |
| `bundle-wrap` | `BundleWrap` | style: rope \| band \| ribbon; knotPosition: top \| left \| right | Wrapping a row of ten sticks into a bundle with a rope, band, or ribbon that draws on via wrapProgress to show ten ones becoming one ten. |
| `comparison-symbol` | `ComparisonSymbol` | symbol: < \| = \| >; style: formal \| mouth | Placing a >, <, or = between two quantities, optionally as a hungry-mouth glyph or hidden behind a ? until revealed. |
| `conservation-bundle` | `ConservationBundle` | — | Proving a bundled ten still contains ten ones: xrayProgress fades the wrap to a ghost outline and reveals the count inner sticks inside, defusing the 'a ten is just one thing now' misconception. |
| `countable-object` | `CountableObject` | variant: animal \| banana \| block \| fish \| fruit \| star | A single cute countable thing (fish, star, fruit, etc.) to populate a counting or comparison set, with selected/dimmed/label states. |
| `counting-bead-device` | `CountingBeadDevice` | orientation: horizontal \| vertical | Making 'each next number is the previous plus one' physically visible on a single-rod bead counter (计数器): the displayed number is driven by count (0..capacity), and pulling one more bead onto the rod grows it by exactly one — 1→2→3→4→5. The newest bead (index count-1) slides into its seat via revealProgress (eased) and, when activeIndex points at it, swells a 'just-moved' ring via activePulse, while the value readout flips to the new count — so one more bead and a bigger number are one synchronized beat. Reach for it in any 1~N number-sequence / 接着数 / +1 lesson; horizontal grows left→right, vertical stacks bottom→top; beadColor/rodColor/capacity/beadRadius all vary by prop. |
| `count-step-indicator` | `CountStepIndicator` | — | A small circular badge that pops and fades in via progress to mark the running count at each step of a counting sequence. |
| `equation-strip` | `EquationStrip` | — | Laying out a horizontal number sentence (left op right = result) with an optional active or blank tile to spotlight a missing term. |
| `fen-he-diagram` | `FenHeDiagram` | — | Showing a whole splitting into two parts (分合式) or composing two parts into a whole; identity-preserving via getFenHeDiagramAnchors. |
| `label-callout` | `LabelCallout` | appearStyle: fade \| write-on | Dropping a centered word or phrase with an optional draw-on underline that fades in via progress to name what is on screen. |
| `number-card` | `NumberCard` | — | Showing a single digit or short value on a rounded card with optional blank line and correct/wrong/selected states, auto-sized so the glyph always insets cleanly. |
| `number-line-track` | `NumberLineTrack` | — | Showing position, ticks, highlights, and animated arc jumps along a min-to-max number line with a current-value badge. |
| `ordinal-label-token` | `OrdinalLabelToken` | — | Marking a POSITION (序数) rather than a quantity (基数) with a two-part label whose PREFIX is visually distinct from the digit — a NumberCard surface carrying a caller-supplied prefix glyph (第 or any locale prefix, default none) in a separate prefixColor/prefixWeight beside the value digit. Reach for it whenever the teaching point is 'same number, only the prefix tells position from count': stand a 第N token beside a bare same-height NumberCard so the digit reads identical and ONLY the 第 differs, label members of an ordered queue (第1..第N) above the row, or tag any labeled-sequence position. Prop-driven and lesson-agnostic — value:number\|string, prefix:ReactNode, prefixColor/prefixWeight emphasis, color for the digit, selected/focused/correct/wrong states, width/height + x/y/transform placement; bakes no Chinese, value, or topic. Entrance is the caller's PopIn at a cue offset; state is prop-driven (no own animation). |
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
| `abstraction-ladder` | `AbstractionLadder` | orientation: row \| column; stages: objects \| sticks \| dots \| numeral | Revealing ONE quantity surviving across an ordered ladder of representations — 实物 → 小棒(1:1) → 圆点 → 数字 — in one continuous left→right (or top→down) reveal, so the SAME count is seen conserved at every step of abstraction and the child stops splitting 'counting objects' from 'the number symbol'. Faint 1:1 connectors tie like-index units between adjacent rungs, and every unit converges on the single numeral card — the 'N个XX用N表示' cardinality payoff. Prop-driven: count:number; stages (caller picks/orders the rungs, defaults the full ladder); objectVariant for the objects rung; atFrame+perStageDurationFrames (cue-relative, the component derives each rung's local progress); orientation row\|column; tint; revealLabel per-stage caption nodes (caller passes the localized 'N个XX用N表示' string). A 6~10 lesson, or a same-count-across-different-kinds beat (label 2 geese AND 2 chairs with the same numeral), reuses it unchanged. |
| `asset-morph` | `AssetMorph` | direction: bundle \| unbundle | Transform a PARAMETRIC group the child has been reasoning about into its fixed-form generated IconAsset (or back) without a visible cut: a short FX-masked crossfade fires a SparkleBurst over the swap while the arriving element settles, so ten sticks BECOME one roped bundle (direction=bundle) or a bundle un-bundles into fanning sticks (direction=unbundle). Caller supplies from/to and a shared centerX/centerY (bbox-matched so identity is preserved); atFrame is cues[id].startFrame+offset. |
| `conservation-morph-bundle` | `ConservationMorphBundle` | — | The whole 'ten ones become one roped ten, that still IS ten ones' regrouping beat as ONE registered unit. Composes AssetMorph (the gathered parametric from BECOMES the held asset, FX-masked) + the held IconAsset + ConservationBundle (the x-ray peek): drive peekProgress 0..1 from the conservation cue and the held bundle crossfades down while the wrap ghosts to reveal the count ones living inside, then re-solidifies. Caller supplies from/asset/centerX/centerY (bbox-matched, like AssetMorph) and the count/colors of the inner ones; morphAtFrame + peekProgress are cue-relative. |
| `drag` | `Drag` | — | Stagger an appendage/child chain with trailing lag. |
| `draw-path` | `DrawPath` | — | Revealing any SVG path stroke-by-stroke via durationInFrames or an external progress, using a pathLength dash trick. |
| `follow-path` | `FollowPath` | — | Moving a child element along a path spec via progress, optionally rotating it to the path tangent, to animate something tracing a route. |
| `glyph-stroke-writer` | `GlyphStrokeWriter` | — | Teaching a child to WRITE a single glyph in the correct stroke order (笔顺) inside a writing cell — a numeral (1/2/3/4/5, or any digit) or a comparison symbol (= > <), or any future glyph. It traces the glyph stroke by stroke IN ORDER: stroke k starts only after stroke k-1 finishes (+ gap), each with a faint ghost-under guide, a moving pen cursor, and a 起笔/收笔 dot whose start marker pulses just before its stroke begins, so direction and order are unmistakable — the fix for the 2的弧线/3的两个半圆 写反/弧度变形 and the 把符号画成图/笔画不匀 misconceptions. Prop-driven and LESSON-AGNOSTIC: it bakes NO glyph — the caller passes the ordered `strokes` (looked up from the shared GLYPH_STROKES data keyed by the glyph char, via `glyphStrokesFor(char)`). `atFrame` is cues[id].startFrame+offset (the writer derives every stroke's local progress by index — ZERO frame literals); `perStrokeDurationFrames` + optional `interStrokeGapFrames` set the pace; `size` scales the normalized 0..100 stroke data to the cell; `grid`/`focusZone` pass through to StrokeGuideCell; `stroke`/`strokeWidth`/`cursor`/`showStartDots` style the pen. COMPOSES StrokeGuideCell (田字格/米字格 backdrop) + one AnimatedStrokePath per stroke (ghost + cursor + progress) + 起笔/收笔 dot markers. Drives 1–5 AND =,>,< AND any glyph with stroke data unchanged. |
| `ordered-row-spotlight` | `OrderedRowSpotlight` | direction: ltr \| rtl | Teaching the ordinal cluster on ONE ordered row of caller-supplied items (countables, faces, sticks): count the row 1→N with a moving finger (the 摆—数—说—写 count step), mark ONLY the Nth position as 第N (an ordinal spotlight ring + the 第N token), contrast circle-ALL ('一共5', a PartWholeBrace heap) vs spotlight-ONE ('第5'), and RENUMBER the row from the chosen end when a direction arrow flips — the same item gets its mirror position (第2 ↔ 第4) live, teaching relativity / 参照点变化 / turn-around. Prop-driven & LESSON-AGNOSTIC, bakes NO figure or string: items:ReactNode[] (the row members — identity is caller scene content); direction:'ltr'\|'rtl' (which END is position 1 — the SINGLE place direction enters; flipping it re-derives every position via posOf=ltr?i+1:n-i); spotlightOrdinal (a 1-based POSITION, so it tracks a flip automatically); showCardinalBracket + cardinalLabel (the '一共N' heap half of the contrast); ordinalLabel:(pos)=>node (caller localizes '第'+pos — never baked); countWalk / pointerIndex (opt-in 1→N finger + running tally; a static panel shows neither); atFrame + stepDurationFrames (cue-relative — the component derives the pointer walk, spotlight pop, and arrow draw-on by index, ZERO frame literals); rowGap/itemRadius/arrowColor/spotlightColor. COMPOSES PointerHandArrow(hand) + StepTally + CountStepIndicator (per-item position numbers) + PartWholeBrace(up) + TeacherMark(label-arrow) + an inline 第N token, with named EASE.* motion. Any N (2..~8), any item kind, either direction, cardinal OR ordinal mode — one component drives 摆数说写, ordinal spotlight, cardinal/ordinal contrast, relativity, and turn-around. |
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

