<!-- GENERATED from src/capabilities/primitive-registry.json by `npm run registry:digest` (or registry:build). Do NOT hand-edit — edit the catalog's prose, then regenerate. -->

# Capability catalog — reusable craft menu

> Reusable craft catalog for the remotion-svg-primitives lesson pipeline. Source of truth for SHAPE is src/capabilities/schema.ts; source of truth for WHAT EXISTS is the code (barrels + unions). This JSON is a report-only baseline in cut 1.
>
> Source of truth for SHAPE: `src/capabilities/schema.ts`. Source of truth for WHAT EXISTS: the component barrels + `EASE`/`SPRING` keys. This menu is generated — never hand-edited.

**Coverage:** 70/70 catalog entries have hand-authored prose. Undocumented entries exist and are gated, but their menu text is pending.

## SVG teaching primitives

### Counting & number (`counting`)

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `answer-tile` | `AnswerTile` | — | A tappable answer or choice card holding a number, text, or icon child, with correct/wrong/selected/focused states and a state badge. |
| `comparison-symbol` | `ComparisonSymbol` | symbol: < \| = \| >; style: formal \| mouth | Placing a >, <, or = between two quantities, optionally as a hungry-mouth glyph or hidden behind a ? until revealed. |
| `conservation-bundle` | `ConservationBundle` | — | Proving a bundled ten still contains ten ones: xrayProgress fades the wrap to a ghost outline and reveals the count inner sticks inside, defusing the 'a ten is just one thing now'… |
| `countable-object` | `CountableObject` | variant: animal \| banana \| block \| fish \| fruit \| star | A single cute countable thing (fish, star, fruit, etc.) to populate a counting or comparison set, with selected/dimmed/label states. |
| `counting-bead-device` | `CountingBeadDevice` | orientation: horizontal \| vertical | Making 'each next number is the previous plus one' physically visible on a single-rod bead counter (计数器): the displayed number is driven by count (0..capacity), and pulling one mo… |
| `count-step-indicator` | `CountStepIndicator` | — | A small circular badge that pops and fades in via progress to mark the running count at each step of a counting sequence. |
| `equation-strip` | `EquationStrip` | — | Laying out a horizontal number sentence (left op right = result) with an optional active or blank tile to spotlight a missing term. |
| `fen-he-diagram` | `FenHeDiagram` | — | Showing a whole splitting into two parts (分合式) or composing two parts into a whole; |
| `label-callout` | `LabelCallout` | appearStyle: fade \| write-on | Dropping a centered word or phrase with an optional draw-on underline that fades in via progress to name what is on screen. |
| `number-card` | `NumberCard` | — | Showing a single digit or short value on a rounded card with optional blank line and correct/wrong/selected states, auto-sized so the glyph always insets cleanly. |
| `number-line-track` | `NumberLineTrack` | — | Showing position, ticks, highlights, and animated arc jumps along a min-to-max number line with a current-value badge. |
| `ordinal-label-token` | `OrdinalLabelToken` | — | Marking a POSITION (序数) rather than a quantity (基数) with a two-part label whose PREFIX is visually distinct from the digit — a NumberCard surface carrying a caller-supplied prefix… |
| `part-whole-brace` | `PartWholeBrace` | direction: down \| left \| right \| up | Drawing a curly brace that reveals via progress to bracket a span as one whole or one part, in any of four directions with an optional label. |
| `place-value-mat` | `PlaceValueMat` | — | Seating place-value contents in labeled tens/ones (optionally hundreds) columns under headers with a divider and optional written digit per column, to bridge a ten-bundle plus loo… |
| `region-split` | `RegionSplit` | — | Splitting ONE filled round region (a cookie/disk) into N equal-area parts to teach halves/thirds/quarters: cutProgress draws the cuts on, highlightPart shades one part, separation… |
| `small-stick` | `SmallStick` | highlight: idle \| active \| counted | A single counting stick with idle/active/counted highlight, rotation, and scale — the unit primitive for stick counting and bundling. |
| `step-tally` | `StepTally` | variant: dots \| numeric | Showing the running total as a numeric pill or a row of dots, with an optional unit label, that pops in via progress. |
| `stick-group` | `StickGroup` | layout: scatter \| row \| bundle | Laying out N counting sticks in a scatter, row, or bundle with per-index active highlight, reveal-up-to, and seeded scatter placement. |
| `ten-frame-rod` | `TenFrameRod` | variant: frame \| rod | Filling a 10-cell two-row ten-frame or one-row rod by count or colored segments to show how many make ten and the ones inside. |
| `unit-block` | `UnitBlock` | variant: chip \| cube \| dot \| rod | Showing 1-10 place-value units as cubes, dots, chips, or a segmented rod, optionally stacked, with a value label. |

### Literacy & pinyin (`literacy`)

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `animated-stroke-path` | `AnimatedStrokePath` | — | Drawing a single hanzi stroke on via durationInFrames or progress, with a faint ghost guide underneath and an optional pen-tip cursor. |
| `hanzi-card` | `HanziCard` | picture: book \| heart \| moon \| person \| sun \| tree \| water | Presenting a Chinese character (one per card; |
| `lesson-intro-card` | `LessonIntroCard` | — | Opening a lesson with the normalized topic-intro card CLAUDE.md mandates (title + section/unit eyebrow + one-line KP teaser): lays out an optional SECTION eyebrow, the TITLE (larg… |
| `listen-icon` | `ListenIcon` | state: idle \| playing | Marking that a sound or syllable can be played — a small speaker icon whose sound arcs swell in state=playing (driven by progress) to signal audio is available here. |
| `mouth-shape-icon` | `MouthShapeIcon` | state: open \| round \| smile \| teeth | A face icon whose mouth shows the articulation (open, round, smile, teeth) for teaching a pinyin sound's lip position. |
| `pinyin-syllable-card` | `PinyinSyllableCard` | highlight: final \| initial \| none \| tone | Showing a pinyin syllable split into initial and final tiles plus a tone mark, with the initial, final, or tone segment highlightable. |
| `pitch-playhead` | `PitchPlayhead` | tone: 0 \| 1 \| 2 \| 3 \| 4 | Riding a moving dot along a Mandarin tone contour by progress (0..1) to show where the pitch is right now, layered over a ToneMarkGlyph of the same tone and size. |
| `radical-tile` | `RadicalTile` | — | A tile holding a single radical or character component with an optional label and correct/wrong/selected answer states. |
| `stroke-guide-cell` | `StrokeGuideCell` | grid: half \| mi \| tian; focusZone: bottom \| center \| left \| right \| top | A Chinese-writing practice cell (田/米/half grid) with dashed guides and an optional highlighted focus zone for where a stroke goes. |
| `tone-mark-glyph` | `ToneMarkGlyph` | tone: 0 \| 1 \| 2 \| 3 \| 4 | Drawing one of the four Mandarin tone contours (or the neutral dot) that strokes on via progress to teach pitch shape. |

### Interaction & sorting (`interaction`)

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `pair-connector` | `PairConnector` | — | Drawing a line that grows via progress between two points to pair or match items, optionally dotted with snap endpoint dots that turn green on completion. |
| `pointer-hand-arrow` | `PointerHandArrow` | variant: arrow \| hand \| sparkle; direction: down \| left \| right \| up | Pointing the child's attention at a target with an arrow, pointing hand, or sparkle that nudges and scales in via progress, in any of four directions. |
| `recap-spotlight` | `RecapSpotlight` | — | A spaced-recall RECAP STACK with ONE live, moving highlight: walk back through a sequence of already-taught sub-beats keeping each earlier one visible-but-quiet while the current… |
| `reward-progress-token` | `RewardProgressToken` | variant: badge \| coin \| node \| star | A star, coin, badge, or node token with a circular progress ring filled by progress, showing a percent or OK once collected. |
| `sorting-bin` | `SortingBin` | state: accept \| idle \| reject; variant: basket \| tray | A labeled basket or tray drop-target whose state (idle/accept/reject) recolors to show whether a sorted item belongs there. |
| `unmatched-slot` | `UnmatchedSlot` | state: empty \| ghost | Marking the absence of a pairing partner under a surplus item in a compare-by-matching layout, so 'more than' reads as 'these have nobody' — a dashed ghost of the missing partner… |

### Sketch / teacher marks (`sketch`)

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `teacher-mark` | `TeacherMark` | kind: underline \| wrap-arc \| label-arrow \| vs-mark | Hand-drawn teacher ink (underline, wrap-arc, label-arrow, vs-mark) that draws on via drawProgress with optional boil wobble and pen-settle. |

### Generated assets (traced flat SVG) (`asset`)

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `icon-asset` | `IconAsset` | variant: color \| mono | Render a generated+traced flat SVG asset for a fixed-form representational object — a bundle, mascot, prop — that's too complex to hand-code; |

## Motion components

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `abstraction-ladder` | `AbstractionLadder` | orientation: row \| column; stages: objects \| sticks \| dots \| numeral | Revealing ONE quantity surviving across an ordered ladder of representations — 实物 → 小棒(1:1) → 圆点 → 数字 — in one continuous left→right (or top→down) reveal, so the SAME count is see… |
| `asset-morph` | `AssetMorph` | direction: bundle \| unbundle | Transform a PARAMETRIC group the child has been reasoning about into its fixed-form generated IconAsset (or back) without a visible cut: a short FX-masked crossfade fires a Sparkl… |
| `conservation-morph-bundle` | `ConservationMorphBundle` | — | The whole 'ten ones become one roped ten, that still IS ten ones' regrouping beat as ONE registered unit. |
| `dialogue-exchange` | `DialogueExchange` | gesture: none \| wave \| point-self \| point-other | A turn-taking spoken exchange between TWO caller-supplied speakers: each speaks in order, turn k's speech bubble pops in ONLY after turn k-1 (+ gap) with its tail pointing at the… |
| `drag` | `Drag` | — | Stagger an appendage/child chain with trailing lag. |
| `draw-path` | `DrawPath` | — | Revealing any SVG path stroke-by-stroke via durationInFrames or an external progress, using a pathLength dash trick. |
| `follow-path` | `FollowPath` | — | Moving a child element along a path spec via progress, optionally rotating it to the path tangent, to animate something tracing a route. |
| `glyph-stroke-writer` | `GlyphStrokeWriter` | — | Teaching a child to WRITE a single glyph in the correct stroke order (笔顺) inside a writing cell — a numeral (1/2/3/4/5, or any digit) or a comparison symbol (= > <), or any future… |
| `match-pairs-board` | `MatchPairsBoard` | mode: demonstrate \| quiz; connectorStyle: dotted \| solid | The 连一连 / 'match the pairs' beat: TWO caller-supplied columns (pictures one side, words/characters the other) with a line drawn from each item to the one it belongs with, IN ORDER… |
| `ordered-row-spotlight` | `OrderedRowSpotlight` | direction: ltr \| rtl | Teaching the ordinal cluster on ONE ordered row of caller-supplied items (countables, faces, sticks): count the row 1→N with a moving finger (the 摆—数—说—写 count step), mark ONLY th… |
| `part-whole-composer` | `PartWholeComposer` | mode: split \| merge \| enumerate | The concrete-object 分与合 beat: N caller-rendered countables laid out as a whole and SPLIT into two parts, MERGED back together (addition 合并), or walked through EVERY ordered decomp… |
| `pictograph-evolution` | `PictographEvolution` | mode: morph \| crossfade | Reveal that a Chinese character's SHAPE grew from the thing it pictures: walk an ordered list of representation stages — 实物(real object) → 古代象形字(ancient pictograph) → 现代汉字(modern… |
| `pop-in` | `PopIn` | motion: snap \| bouncy \| settle | Entrance scale physics for any appearing element. |
| `pulse-circle` | `PulseCircle` | — | Emitting expanding fading ripple rings from a point for a fixed repeatCount to draw a beat of attention to a spot. |
| `read-along-highlight` | `ReadAlongHighlight` | cursor: ball \| underline \| box \| none | Sweep a moving highlight (+ optional bouncing cursor) across each item of a text IN TIME, marking the rhythm for read-along / recite / sing-along — the active item glows + swells… |
| `smear` | `Smear` | — | Motion-blur substitute for fast straight-line travel (>180 vbu/frame). |
| `sparkle-burst` | `SparkleBurst` | — | Firing a one-shot radial burst of stars outward from a point to celebrate a correct answer or completed beat. |
| `vocab-flashcard` | `VocabFlashcard` | mode: reveal \| flip \| label-after | Bind a vocabulary WORD to the PICTURE of the thing it names, revealed as ONE beat (and optionally flipped picture↔word). |

## FX components

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `breathe` | `Breathe` | — | Moving-hold idle breathing so held elements stay alive. |
| `fx-defs` | `FXDefs` | — | Render once per scene root to publish the FX filter defs. |
| `glint-flash` | `GlintFlash` | — | Point flash at a moment of emphasis. |
| `glow-pulse` | `GlowPulse` | — | Pulsing aura wrapper to draw the eye. |
| `shine-sweep` | `ShineSweep` | — | Cinematic shine sweeping across a rectangle (card/title). |
| `sparkle` | `Sparkle` | — | One-shot sparkle particle accent on a reward/reveal. |

## Lesson-infra components

### Audio & caption layers (`media`)

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `lesson-audio-layer` | `LessonAudioLayer` | — | Mount once in the Complete<Lesson> wrapper to play the narration track. |
| `lesson-bgm-layer` | `LessonBgmLayer` | — | Mount in the Complete<Lesson> wrapper to play the background music bed as the SECOND audio track. |
| `lesson-caption-layer` | `LessonCaptionLayer` | — | Mount in the Complete<Lesson> wrapper to render the bottom caption ribbon from the lesson's caption cues (kids-cute cream/navy theme baked in). |
| `lesson-sfx-layer` | `LessonSfxLayer` | — | Mount in the Complete<Lesson> wrapper to fire discrete sound effects (a pop, a chime, a whoosh) at composer-owned motion frames. |

### Decorative 3D section transitions (`transition`)

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `section-handoff` | `SectionHandoff` | — | Mount between two major lesson sections for a decorative iridescent portal-ring pass-through (3D). |
| `topic-intro-card` | `TopicIntroCard` | — | Mount at lesson open (or a section transition) for the decorative ceramic 3D topic card landing with a slow push-in — carries the lesson title. |

### Style wrapper (`style`)

| id | component | variants | use when (one-line; full prose in primitive-registry.json) |
| --- | --- | --- | --- |
| `style-preset` | `StylePreset` | — | Wrap the scene root (OUTSIDE SceneFrame) to apply an aesthetic overlay; |

## Motion vocabulary

- **EASE** (`src/motion-primitives/curves.ts`): `enter`, `balanced`, `overshoot`, `outCubic`, `outQuint`, `inOutCubic`
- **SPRING**: `snappy`, `bouncy`, `smooth`

## Styles

| id | use when | status |
| --- | --- | --- |
| `default` | Canonical lesson appearance — no aesthetic overlay. | stable |
| `ink-wash` | Sumi-e ink on warm rice paper aesthetic overlay. | experimental |

## Generated asset library — `<IconAsset name=... />` (90)

Fixed-form decorative/representational objects (traced flat SVG, on-palette). REUSE these before hand-coding or generating. Not teaching primitives — see `icon-asset` above for the fence.

- **animal** — `owl-reading`, `paw-print`
- **celebration** — `award-ribbon`, `confetti-burst`, `shining-star-orbit`, `sparkle-star`, `star`
- **character-face** — `boy-face`, `robot-face-round`, `robot-face-square`, `sad-cloud-face`
- **generated** — `girl-face`, `pointing-hand`, `stick-bundle-roped`
- **literacy** — `ancient-glyph-ear`, `ancient-glyph-eye`, `ancient-glyph-field`, `ancient-glyph-fire`, `ancient-glyph-foot`, `ancient-glyph-grain`, `ancient-glyph-hand`, `ancient-glyph-moon`, `ancient-glyph-mountain`, `ancient-glyph-mouth`, `ancient-glyph-stone`, `ancient-glyph-sun`, `ancient-glyph-water`
- **math** — `abacus`, `add-blocks`, `balance-scale`, `bar-line-chart`, `basic-shapes`, `donut-chart`, `fraction-quarters`, `greater-less-compare`, `pattern-sequence`, `sort-shapes-bins`, `subtract-blocks`
- **nature** — `atom`, `flame`, `leaf-water-drop`, `planet-saturn`, `sprout`
- **object** — `bookmark`, `crayon`, `crystal-ball`, `dashboard-card`, `document-note`, `ear-listening`, `ear-soundwave`, `eraser`, `eye`, `flashcard-stack`, `gear`, `house`, `jigsaw-four-piece`, `journey-path-flag`, `layout-tiles`, `lightbulb-circuit`, `lightbulb-idea`, `magic-wand`, `magnet`, `microphone`, `open-book`, `pen`, `pencil`, `pencil-box`, `prism-rainbow`, `reward-chest-card`, `school-bag`, `scroll-document`, `shield-heart`, `stopwatch`, `treasure-chest`, `treasure-map`
- **symbol** — `checkmark-circle`, `pause-button`, `play-button`, `question-mark-circle`, `replay-arrow`, `sound-wave-bars`, `speaker-volume`, `speech-bubble-dots`, `sync-arrows`, `tap-gesture`, `upload-arrow`
- **tool** — `beaker`, `magnifying-glass`, `microscope`, `ruler-set-square`

## Deprecated — superseded, do not use

These capabilities still exist in code (legacy callers compile) but are NOT the right way to build new work. Reach for the `→ use` replacement instead.

- `bundle-wrap` → use `asset-morph` — DEPRECATED — the old procedural rope/ribbon wrap. Superseded by AssetMorph morphing the sticks into the stick-bundle-roped IconAsset (the FX-masked magic-transition), which reads cleaner at render size. Do not reach for it in new work; use asset-morph. Legacy Kp2 lessons still import it.

