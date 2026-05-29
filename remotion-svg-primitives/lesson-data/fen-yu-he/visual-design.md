# fen-yu-he — visual design (Wave 2a)

Inputs (read-only): `lesson-data/fen-yu-he/pedagogy.md`, `lesson-data/fen-yu-he/storyboard.md`.
Output of this wave: the kids-eye measurement block, zone declaration, palette + motion
vocabulary, the Visual Contract, and **per-cue `visualMotionSeconds`** (the load-bearing line
Wave 2b targets and Wave 3.5 reconciles). NO absolute frame numbers — intent + seconds only.

Primitives surveyed first-hand in `src/shape-primitives/counting.tsx`:
- `FenHeDiagram` — the 分合式 part-whole diagram already exists (whole on top, two stroke-on
  diagonals, two part-numbers below). `progress` 0–1 draws the lines and fades the part cards.
  `renderNumbers={false}` + `getFenHeDiagramAnchors(width)` is the identity-preserved
  glyph-migration mechanism. `dimmed` for "previously seen" rows. (See CAPABILITIES.md#fen-he-diagram.)
- `CountableObject` (variants `fruit | star | banana | block | fish | animal`) — the candy.
  `dimmed`, `selected`, `size`, `x/y`, `color`. Identity-stable across cues (same instances move).
- `NumberCard` — the migrating numeral surface used by the diagram's `renderNumbers={false}` mode.
- `TeacherMark` (kinds `underline | wrap-arc | label-arrow | vs-mark`) — sketch marks, navy ink,
  stroke-on, optional `boil` / `settle`.
- `PartWholeBrace` — available, NOT used (the 分合式 already carries the whole→parts relation;
  a brace would be a second metaphor for the same idea — refused per one-metaphor rule).

No new primitive is required. The intro card layout is a composition of existing text/primitive
elements (see `intro-title` row) — flagged to the orchestrator, not designed here, but it does NOT
demand a new primitive beyond what ships.

---

## 1. Kids-eye measurement block (kids-eye §1)

**Composition is 1280×720 @ 30fps**, read from `src/theme.ts` `video` (the project default;
`SceneFrame.tsx` renders at `video.width`/`video.height`). The kids-eye skill's template numbers
assume 1920×1080 — they are recomputed below against the **actual 720 px short side**. Percentages
are kept; pixel figures are scaled to this canvas.

```
composition:             1280×720 @ 30fps   (project default, from theme.ts; non-negotiable)
short-side:              720 px

teaching-unit:           one candy (CountableObject) — the smallest mark carrying a count signal
teaching-unit-min:       ≥ 8% of short-side = 58 px
teaching-unit-target:    12–15% of short-side = 86–108 px  →  candy size ≈ 96 px (CountableObject default)

분합식-glyph-min:         ≥ 36 px rendered numeral (body-label). FenHeDiagram at diagramWidth 200
                          renders NumberCards at width 72 (= width*0.36) → glyph ≈ 60 px ✓.
                          During the single-large diagram cue (read-fen-he-shi) diagramWidth ≈ 240
                          → glyph ≈ 72 px (accent). In the four-row column, diagramWidth ≈ 150
                          → glyph ≈ 48 px, still above the 36 px body minimum ✓ (and above the
                          140 px diagramWidth floor in CAPABILITIES.md#fen-he-diagram).
primary-label-min:       48 px rendered   (intro title teaser; the "共四种" sense is read off the
                                           column, not a label — no standalone primary label elsewhere)
body-label-min:          36 px rendered   (the 分合式 numerals; left-part column emphasis numbers)
caption-line-min:        42 px rendered   (caption ribbon — scaled from the 56 px @1080 minimum to
                                           this 720 canvas at the same ~5.2% short-side ratio)
chrome-label:            FORBIDDEN — no lesson-title header sits beside the teaching stage after
                          intro-title; no decorative count chips; no "互逆"/"四种" definition chip.
```

Density check: at most **five candies + one 分合式 diagram** share the stage in the busiest
single-diagram cue, and **four small 分合式 + a quieted candy strip** in the column cues. Both fit
above the minimums inside 1280×720 with the zones below. If a later wave finds they do not, drop
density (e.g. shrink the candy strip), never the diagram glyph size.

## 1.5. Spatial zones (kids-eye §1.5)

Disjoint zones, in 1280×720 pixel space (origin top-left). Any floating element (numeral, sketch
mark, caption) lives in a named zone that does not overlap the candy/diagram object zone for its cue.

```
zone-title:    x 0,  y 40,  w 1280, h 200   | intro-title ONLY: lesson title + KP teaser. Empty after the card leaves.
zone-stage:    x 240, y 250, w 800, h 320   | the five candies live here (heap / split left+right / sliding). NOTHING ELSE sits inside.
zone-diagram:  x 440, y 120, w 400, h 300   | the SINGLE large 分合式 (read-fen-he-shi) draws ABOVE the candies. Disjoint from zone-stage (diagram bottom ≈ y420, candies top ≈ y250 only overlap-free because the candies quiet/shift down in that cue — see contract).
zone-column:   x 820, y 120, w 420, h 520   | the results column of four small 分合式 (first-ordered-split → order-matters). Right third of stage; the candy heaps occupy the left two-thirds during column cues.
zone-divider:  x 632, y 250, w 16,  h 320   | the vertical split line, on the candy stage centerline. Appears split-into-two, removed recombine-inverse, returns for the ordered-method cues.
zone-marks:    full-bleed                    | TeacherMark sketch (the read-direction emphasis, the order-matters contrast). May TRACE OVER zone-diagram / zone-column but never sit inside a numeral's box or duplicate a numeral.
zone-caption:  x 0, y 620, w 1280, h 100     | caption ribbon at the very bottom. Load-bearing for accessibility.
```

Enforcement: the numerals always live inside `zone-diagram` (large) or `zone-column` (small),
never floating onto a candy. The split line is its own thin `zone-divider`, never drawn through a
candy's body. During `read-fen-he-shi` the candy heaps shift down/quiet so `zone-diagram` and
`zone-stage` stay visually disjoint; during the column cues the candies hold the left two-thirds and
the column holds the right third — no overlap.

---

## Palette + motion vocabulary (early-childhood-visual-taste)

Colors pulled from `theme.colors` via `resolveColor`; never inline hex. **Four meaningful colors +
cream background:**

- **`cream`** `#FFF7E6` — canvas background (`SceneFrame` default).
- **`reward`** `#FFB84D` — the candy (teaching unit). One identity for all five candies, all cues.
- **`coral`** `#FF8A65` — the *action* accent: the split/divider line and the recombine motion (the
  "分 / 合" act). Reserved for the transformation, never a persistent label color.
- **`textNavy`** `#24324B` — ink: the 分合式 lines + numerals, the column emphasis, sketch marks,
  captions. Anything that "speaks."
- **`sunshine`** `#FFD85A` — transient highlight only: the single candy currently sliding
  (`highlight="active"` via the candy's `selected`/color), and the row being read in
  `order-matters`. Never a persistent identity.
- `softGrayBlue` is used ONLY for the `dimmed` state (quieted candies; dimmed column rows in
  `order-matters`), never as a replacement candy color (kids-eye §4).

Motion vocabulary (intent; concrete curves per CAPABILITIES.md#motion-vocabulary / #popin-motion-variants):
- Candy entrance (`five-whole`): `<PopIn motion="snap">`, ~16 frames, staggered slightly.
- Split / recombine slide (`split-into-two`, `recombine-inverse`): big move, `EASE.inOutCubic`,
  ~24 frames each direction; the divider line is a coral `EASE.outCubic` draw-on.
- 分합식 diagonals draw-on: the primitive's `progress` 0→1, eased `EASE.outCubic`, ~18–24 frames.
- One-candy slide (`slide-one-at-a-time`): `EASE.inOutCubic`, ~14 frames per slide, four slides.
- **Two accent pulses for the whole video (and only two)**, per pedagogy §5 / storyboard accent
  budget: (1) the first 分合식's entry — `motion="bouncy"` on the diagram's whole-card landing in
  `read-fen-he-shi`; (2) the recap contrast in `order-matters` — a `sunshine` highlight pulse on the
  two contrasted rows. No other cue gets an entrance accent.
- Sketch: `TeacherMark`, navy, one mark per cue maximum, most cues zero. `boil` only on the
  order-matters contrast if it lingers.
- Moving-hold (rule #6): each cue's primary load-bearing group is wrapped in `<Breathe>`
  (amplitudeScale ≤ 0.005, unique `phaseSeed`) so held frames are never truly frozen — flagged for
  the composer, not a contract obligation here.

---

## 2. Visual Contract (visual-discipline §1)

```
metaphor:        one group of five candies is taken apart into a left part and a right part and
                 pushed back together (分 / 合 on ONE set of candies); each split is then written
                 as a 分合式 and, by sliding one candy at a time, the splits are listed in order
                 so the child sees there are exactly four. ONE picture (the five candies) moves
                 through states; the 分合式 is its read-able stand-in, not a second picture.
regions:         zone-stage holds the five candies (heap → split → slide); zone-divider holds the
                 coral split line; zone-diagram holds the single large 分合式; zone-column holds the
                 four stacked small 分合式; zone-caption holds the narration ribbon; zone-marks holds
                 the (rare) sketch emphasis.
between-states:  THE SAME FIVE CANDIES live the entire video from five-whole onward — they only
                 change grouping (one heap → two heaps → recombined heap → 1|4 → 2|3 → 3|2 → 4|1).
                 No candy is added, removed, recolored, or resized across any cue. The first 分合式's
                 numerals are the same NumberCard instances that migrate into the diagram (identity-
                 preserved "picture becomes symbol", via FenHeDiagram renderNumbers={false}).
reading-order:   intro title → five candies → split line + two heaps → recombine → 分合式 draws above
                 → 1|4 split + first column row → one candy slides, each freezes a new row → completed
                 column read top-to-bottom → top vs bottom row contrast.
decoration-budget:  1 cream background + 1 caption ribbon = 2 surfaces total. reward / coral /
                 textNavy / sunshine = 4 meaningful colors (softGrayBlue is the dimmed STATE, not a
                 fifth meaning). No card behind the candies, no box behind the 分合式.
text-budget:     intro title + KP teaser (load-bearing — the mandated topic announce, intro only).
                 分合式 numerals (load-bearing — the symbolic form the lesson teaches; they ARE the
                 representation). Column left-part emphasis 1·2·3·4 (load-bearing — the visible
                 completeness). Captions (load-bearing — accessibility). NO "互逆" chip, NO "5=1+4"
                 equation, NO standalone "四种" counter symbol, NO lesson-title header beside the
                 stage. The count "four" is delivered by the four visible rows, not a chip (§4).
occupancy:       horizontal axis is binding in the candy cues (split is left↔right; slide is
                 right→left). Candies size ≈ 96 px = 13% of 720 short-side (target). The five-candy
                 heap + the split spread occupy ≈ 70% of zone-stage width. In the column cues the
                 vertical axis binds (four rows stack); the column fills ≈ 70% of zone-column height.
identity-invariant: every candy is the SAME CountableObject instance at the SAME reward tone for the
                 entire video — scattered, split, recombined, or sliding; only x/y, grouping, and
                 (transiently) the active-highlight change. The 分合式's whole/part numerals are the
                 same NumberCard instances migrating from the candy split into the diagram anchors;
                 no fade-out/fade-in cross-fade is allowed for them (kids-eye §4, §6).
one-metaphor:    REFUSED second metaphors: (a) a side-by-side "before heap vs after heap" panel —
                 the split IS one heap moving, not two pictures (kids-eye §6); (b) PartWholeBrace
                 alongside the 分合式 — both encode whole→parts, pick the 分合式; (c) an arithmetic
                 "1+4=5" strip — forbidden stage (pedagogy §3). The divider line + the 分合式 are the
                 only non-candy load-bearing objects.
semantic-groups: the five candies are ONE semantic group ("the whole five"); when split they read as
                 two SUB-heaps of one group (a gap, not a regrouping into different objects). They are
                 never reflowed into a grid that suggests a different grouping (visual-discipline §5).
                 The four 分合式 are ONE semantic group ("the four splits"), stacked in slide order.
```

### Per-cue load-bearing element table

Each row names the single pedagogy `discovery` it serves and the ONE element that changes (focal).
Supporting elements are quiet. (Cue ids are the storyboard's nine cues, in order.)

| cue | discovery it serves (pedagogy) | focal element (the one that CHANGES) | supporting (quiet) | stage | zone(s) |
|---|---|---|---|---|---|
| `intro-title` | (structural, none) | the title text + KP teaser appearing — text is focal ONLY here | clean stage, no candies, no 分合式 | represent | zone-title |
| `five-whole` | the five candies are one intact group of five — the whole to be taken apart | five candies arrive and settle as ONE centered heap | nothing else on screen | concrete | zone-stage |
| `split-into-two` | a line down the middle splits the five into a left part + a right part (same five, two heaps) | the coral divider line appears AND the candies separate left/right | the candies themselves (unchanged identity) | concrete | zone-stage + zone-divider |
| `recombine-inverse` | pushing the two heaps back makes five again — splitting can be undone | the two heaps slide inward into one heap (reverse of prior cue); divider fades | same candies, motion reversed | concrete | zone-stage + zone-divider |
| `read-fen-he-shi` | a split can be WRITTEN as a 分合式 and read both directions | the 分合式 draws in above the candies (whole on top, two diagonals, two parts) — **ACCENT #1** (`motion="bouncy"` on the whole card landing) | candy heaps quiet/shift down (dimmed-soft) | represent | zone-diagram (+ zone-stage quiet) |
| `first-ordered-split` | start the ordered hunt at the smallest left part — left 1, right 4 — freeze it as the first row | the 1\|4 split forms in candies AND its 分合式 settles into the TOP slot of the column | column scaffold shows room below | represent | zone-stage + zone-column |
| `slide-one-at-a-time` | move one candy right→left → next split; (1,4)→(2,3)→(3,2)→(4,1), each a new row | a SINGLE candy slides across the divider (active-highlight), left/right counts tick, each freeze adds the next column row | prior frozen rows hold quiet; divider holds | represent | zone-stage + zone-divider + zone-column |
| `ordered-column-complete` | read top→bottom: left parts climb 1,2,3,4 — none missed/repeated, so 5 has exactly four ways | a light navy emphasis travels DOWN the left-part numbers 1→2→3→4 in the held column | the four 分合式 held still; candy heaps quiet | represent | zone-column (+ zone-marks for the travelling emphasis) |
| `order-matters` | (1,4) and (4,1) are two different rows — order distinguishes them, so the count is four not two | the TOP row and BOTTOM row highlight in turn (sunshine) — **ACCENT #2** (recap punctuation) | every other column row dims (softGrayBlue) | represent | zone-column (+ zone-marks) |

Finger-cover test (kids-eye §3): cover the captions in every cue — the picture still teaches
(candies coming apart / pushing together; the 分合式 drawing; the column building row by row; two
rows lit against dimmed siblings). Cover everything except the candies in `five-whole`/`split`/
`recombine` — the lesson survives (the candy motion IS the teaching). Cover everything except the
column in `ordered-column-complete`/`order-matters` — survives (the sorted rows ARE the payoff). No
element is propping up a weak teaching object; no two elements say the same thing.

Identity-preservation (kids-eye §4, between-states): the candies are one stable
`CountableObject` set; the divider is one coral line toggled on/off; the first 分合式's numerals
migrate as the same `NumberCard` instances (`renderNumbers={false}` + `getFenHeDiagramAnchors`) from
the candy split into the diagram — never a cross-fade.

---

## 3. ★ Per-cue visualMotionSeconds ★ (the load-bearing output)

The MINIMUM seconds each cue's motion needs to physically LAND for a 6-year-old. Wave 2b writes
narration to fit these; Wave 3.5 reconciles `cueSeconds = max(narrationSeconds, visualMotionSeconds)
+ tail`. These are visual-motion budgets ONLY — not hold guesses, not narration lengths.

```
intro-title:               2.5s   title write-on + KP teaser settling; one read-beat for the topic.
five-whole:                2.5s   five candies pop in (staggered ~16f) and settle into one heap with a beat to register "this is five".
split-into-two:            2.5s   coral divider draws on (~12f) THEN the two heaps separate left/right (~24f) with a settle beat — the act must be watchable, not snapped.
recombine-inverse:         2.0s   two heaps slide back inward (~24f) + divider fade; slightly faster than the split because it reads as the reverse of a motion just seen.
read-fen-he-shi:           4.0s   ACCENT cue: whole card lands (bouncy ~18f), two diagonals draw on (~24f), two part numbers fade in, plus a beat to let the top-down→bottom-up read direction register. The lesson's central new representation — give it weight.
first-ordered-split:       3.0s   candies settle to 1|4 (~20f) + the 分合式 forms and travels into the top column slot (~24f) with a beat to register "this is the first, list starts here".
slide-one-at-a-time:       7.5s   the heaviest cue: FOUR one-candy slides (~14f each) + four freeze-into-row events + per-slide count tick + small settle between each. Four discrete read-and-freeze beats must each be legible; do NOT compress below this or the slides blur into one motion.
ordered-column-complete:   3.0s   emphasis travels down the four left-part numbers (1→2→3→4) at a readable cadence (~0.5s per number) + a beat on the completed column.
order-matters:             3.5s   ACCENT cue: top row lights (sunshine, beat), bottom row lights (beat), others dim — the contrast needs two clear read-beats plus a closing hold; this is the recap punctuation.
```

Notes for downstream:
- `slide-one-at-a-time` is by far the longest budget by design — four slides, each with its own
  count tick and row-freeze, cannot share one read-beat. If Wave 2b's narration runs longer than
  7.5s here, the cue grows to the narration (max); if motion overruns narration, Wave 4 trims the
  inter-slide settle FIRST, never a slide itself.
- The two accent cues (`read-fen-he-shi`, `order-matters`) carry the only two pulses; their budgets
  include the accent's settle time.
- All other cues are deliberately calm (2.0–3.0s) — they are single-change cues per pedagogy §6.

---

## Audit (kids-eye §5 + visual-discipline §3/§4/§7 + pedagogy §9)

1. **One discovery per cue.** Each table row maps to exactly one pedagogy `discovery` sentence; the
   intro carries none (structural). No cue carries two metaphors or two cognitive tasks.
2. **Every element serves a named discovery, not adjacent math.** No `+`/`−`/`=`, no "互逆" chip, no
   standalone "四种" counter, no lesson-title header beside the stage. The only symbolic object is the
   分合式 (first appears at `read-fen-he-shi`, stage `represent`); the four-count is delivered by the
   four visible rows (§4), not asserted.
3. **No cue reaches above its stage.** `five-whole`/`split`/`recombine` are `concrete` (candies only).
   The 分合식 and column are `represent`. Nothing reaches `symbolize`.
4. **Narration prepares/names; picture delivers.** Contract reserves the count payoff for the built
   column; the 分合式 read-directions name what the diagram shows. Recorded for Wave 2b: 分/合 always
   with a companion word (分开/分成, 合起来/组成); all-Mandarin, 五 spoken not "5"; top-down 分成 /
   bottom-up 组成; spoken count = on-screen count every slide.
5. **Focal element changes; supporting elements quiet.** Each row names one changing focal; the candy
   heaps stay still except on their own cue; the two pulses are reserved for `read-fen-he-shi` and
   `order-matters` only.
6. **Zones disjoint; every element in a named zone.** Numerals live in zone-diagram/zone-column,
   never on a candy; the divider is its own thin zone; sketch marks trace over but never sit inside a
   numeral. zone-diagram and zone-stage are kept visually disjoint by quieting the candies during the
   diagram cue.
7. **Identity preserved across transformation.** Same five `CountableObject` candies all video; same
   `NumberCard` instances migrate into the first 分合式 (no cross-fade); no candy recolor/resize/shape
   change; softGrayBlue is the dimmed STATE only, never a replacement candy color.
</content>
</invoke>
