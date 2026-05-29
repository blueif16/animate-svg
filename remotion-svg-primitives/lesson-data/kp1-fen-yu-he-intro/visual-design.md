# Visual design — kp1-fen-yu-he-intro

Wave 2a Visual Contract for KP1 + KP2 + KP3 of 《分与合》 (5以内数, §1.4). Upstream artifact for Wave 3 (primitive-gap-scan, voice/ASR) and Wave 4 (composer + sketch-layer). NO master-timeline frame numbers anywhere — cue lengths come from ASR in Wave 3; Wave 4 maps cue-relative offsets to absolute frames.

Order: kids-eye measurement → zones → identity-invariant promises → palette/motion → Visual Contract → motion vocabulary picks → finger-cover test on the load-bearing cue → self-critique.

The load-bearing cue is `fenheshi-intro` — the moment a picture (dots) becomes a symbol (分合式). Every other cue earns its place by setting it up or extending it.

---

## §1. Kids-eye measurement block

```
composition:             1280×720 @ 30fps           (src/theme.ts video.{width,height,fps})
short-side:              720 px

teaching-unit:           single dot inside the 5-dot row (the countable)
teaching-unit-min:       ≥ 8% of short-side = 58 px diameter
teaching-unit-target:    11–13% of short-side = 80–94 px diameter   →  use 84 px diameter
dot-spacing (row gap):   140 px center-to-center  (5 dots span 4×140 = 560 px ≈ 44% of 1280)
cluster-gap (post-split): 240 px gap between the rightmost dot of the left cluster and the leftmost dot of the right cluster — wide enough to read as two groups, not a stretched row.

teaching-secondary:      a single part-number glyph inside a 分合式 (the "2" / "3" / "1" / "4") — this glyph is the SAME object that snapped on above the dot cluster in `fen-name` and then migrated up. It must read at both anchor points.
secondary-target:        80 px glyph height (well above the 48 px primary-label minimum). The "5" on top of the diagram also reads at 80 px so whole and parts are the same species.

primary-label-min:       48 px rendered    (分, 合, 分合式, "5 的分与合")
body-label-min:          36 px rendered    (count chips "5" / "2" / "3" / "1" / "4" — the migrating glyphs read well above this at 80 px)
caption-line-min:        44 px rendered    (caption ribbon at bottom — scaled minimum for the 720-line composition)
chrome-label:            FORBIDDEN — no decorative title pill, no "lesson 1.4" banner, no subject icons.

motion-budget (per cue type, MIN sustained on-screen so a 6yo can follow):
  load-bearing migration (fenheshi-intro):       ≥ 5.0 s — glyphs migrate, lines draw, settle
  concrete delivery (fen-show, he-show):         ≥ 3.0 s — separation / rejoin reads slow
  represent / name (fen-name, he-name):          ≥ 4.0 s — chips snap, term writes on
  read-the-diagram (fenheshi-read):              ≥ 4.0 s — TWO sequential sweeps, never simultaneous
  enumerate (five-1-4, five-3-2-and-4-1):        ≥ 3.5 s per diagram landing
  intro / outro:                                  ≥ 2.5 s
  (Wave 3 ASR will produce actual durations; these are the floor audio-captions must respect.)

max simultaneous semantic groups on screen:
  - 3 in concrete/name cues (dot row + count chips + the term being named)
  - 4 in fenheshi-intro mid-migration (dimmed dot row + migrating "5" + migrating "2"/"3" + drawing lines)
  - 4 in outro three-up (mini animation + four diagrams + title line + faint underline)
  Hard cap: 4. The four diagrams of 5 count as ONE semantic group ("the family of splits of 5"), not four.
```

Density check: the four 分合式 of `five-3-2-and-4-1` must coexist horizontally. Each diagram is ≈ 200 px wide (whole 80 px + two part glyphs 80 px each spread 160 px apart). Four diagrams × 200 + 3 gaps × 80 ≈ 1040 px ≈ 81% of 1280. Fits with a 120 px margin each side. PASS.

---

## §1.5. Zones (disjoint bounding boxes, composition pixel space, top-left origin)

```
zone-stage:        x=  140, y= 250, w=1000, h= 220   | holds: the dot row (split / rejoined) for cues `fen-show`, `fen-name`, `he-show`, `he-name`. Dimmed-backing dot strips in `fenheshi-intro` (during migration) and `five-1-4`. NOTHING ELSE.
zone-chips:        x=  140, y= 150, w=1000, h=  90   | holds: count-chip glyphs "5" / "2" / "3" above the dot row, BEFORE they migrate. The "5" chip lives center-top; "2" lives above the left cluster; "3" lives above the right cluster. After migration in `fenheshi-intro`, this zone is empty for the rest of the video.
zone-diagram:      x=  140, y= 110, w=1000, h= 380   | holds: the 分合式 diagram(s) — whole on top, two diagonal lines, two parts below. ONE diagram centered for `fenheshi-intro` and `fenheshi-read`; a horizontal row of up to FOUR diagrams left-aligned for `five-1-4` and `five-3-2-and-4-1`. Same vertical band the chips/dots vacate, so the migration reads as "stuff moves up into the recording shape."
zone-strip:        x=  140, y= 480, w=1000, h=  60   | holds: the count strip and two-headed arrow that appears in `he-name` ONLY — "5" centered, "2" left, "3" right, with the term "分" on the left head and "合" on the right head. After `he-name` this zone is empty until the outro mini-replay.
zone-label:        x=  140, y= 560, w=1000, h=  50   | holds: term LabelCallouts — 分 / 合 / 分合式 / "5 的分与合" / 分成 / 组成. NEVER overlaps zone-diagram, NEVER inside zone-stage.
zone-caption:      x=    0, y= 640, w=1280, h=  80   | holds: narration caption ribbon, full-bleed.
zone-marks:        full-bleed                        | holds: TeacherMark strokes (sweeps in `fenheshi-read`, optional underline in `outro`). May TRACE OVER zone-diagram. NEVER sits inside zone-label.
zone-intro:        x=  240, y= 180, w= 800, h= 360   | holds: intro title composition only (intro cue) — replaced/cleared by the time `fen-show` begins.
zone-outro:        the union of (left half: a compact replay of `he-name`'s strip; right half: the four diagrams from `five-3-2-and-4-1` shrunk to fit; bottom: title line "5 的分与合"). Outro is a re-arrangement of zones already declared above; no new zones invented for it.
```

Why these zones:

- **zone-stage and zone-diagram share a vertical band by design.** The "5" / "2" / "3" glyphs migrating up in `fenheshi-intro` literally travel from `zone-chips` (above the dots) → settling positions inside `zone-diagram`. The dots fade to a quiet backing layer inside `zone-stage` during the migration, then are dismissed once the diagram has settled. This is the visual root of "the picture becomes a symbol" — the new container occupies the eye's existing focus.
- **zone-chips is empty for ~60% of the video.** That is fine — it exists to forbid any *other* element drifting into the area above the dot row. After migration, the diagram's whole-number "5" lives at the TOP of zone-diagram (higher than zone-chips), so the eye is led upward, not back down.
- **zone-strip is dedicated to the `he-name` count-strip + two-headed arrow** because that cue is the only place a horizontal "5 ↔ 2 和 3" reading line appears. Folding it into zone-diagram would force the diagram to fight a competing layout in the same band.
- **zone-label sits below zone-diagram, not above.** Reading order: dots/diagram (the math) → term ribbon (the name). The label always confirms what the picture already showed.

---

## §2. Identity-invariant promises

These are the hard contracts every downstream wave must preserve. Violations are bugs, not stylistic choices.

1. **The five dots are one identity, one species, one instance.** The same 5 dots that sit on screen in `fen-show` are the same 5 dots that separate in `fen-show`, get named in `fen-name`, rejoin in `he-show`, hold across `he-name`, and dim into a backing layer in `fenheshi-intro`. Same primitive (`CountableObject` dot variant), same `colors.reward` orange, same 84 px diameter. They are never destroyed and recreated; their position interpolates, their opacity interpolates, but the instance persists.
2. **The count-chip glyphs ARE the part-number glyphs in the 分合式.** The "5", "2", and "3" that snap on above the dot clusters in `fen-name` are the SAME glyph instances that lift up into zone-diagram during `fenheshi-intro` — re-anchored, NOT redrawn. Same font, same `colors.textNavy` ink, same 80 px size. The kid sees one glyph travel, not "a chip disappears and a new number appears."
3. **The 分合式 shape established in `fenheshi-intro` is the same shape reused in `five-1-4` and `five-3-2-and-4-1`.** Same whole-on-top, same two diagonal strokes, same two-parts-below geometry, same `colors.textNavy` strokes. Only the part numbers change. The "previously seen" diagram from `fenheshi-read` dims via opacity in `five-1-4` — it does NOT change color, scale, or shape.
4. **The terms 分 and 合 are written in the same `colors.textNavy` ink at the same primary-label size, both times.** When 分 reappears in `he-name`'s count strip, it is the SAME glyph instance that wrote on in `fen-name` — re-anchored to the left arrow head, not re-stroked. (Composer's call whether to literally persist the instance or cross-fade two stacked copies; the visual contract is "the eye reads continuity of the term.")
5. **Color is never repurposed.** `colors.reward` is the dot color and never appears on a label or a stroke. `colors.textNavy` is the ink color for every glyph and every line and never appears as a dot fill. `colors.coral` accents only the two-headed arrow in `he-name` and (faintly) the connecting lines of the 分合式 in `fenheshi-intro` — it carries "combining / relating," nothing else.
6. **No celebratory recoloring on the climax.** When the migration completes in `fenheshi-intro`, no dot turns gold, no glyph turns coral. Identity is preserved; the eye reads continuity. Emphasis is reserved for the climax `fenheshi-intro` and lives in motion + sketch, not in color.

---

## §3. Palette + motion vocabulary

### Palette (theme keys only; never inline hex)

| Role                                | Theme key            | Use                                                                              |
|-------------------------------------|----------------------|----------------------------------------------------------------------------------|
| Canvas background                   | `colors.cream`       | Full-frame canvas.                                                               |
| Teaching unit (dot)                 | `colors.reward`      | Every dot in the 5-dot row. Identity-bearing.                                    |
| Action / combine accent             | `colors.coral`       | The two-headed arrow in `he-name`. Faintly tinted connecting lines of the 分合式 (composer's call: pure navy lines are also acceptable — coral lines are the preferred treatment because they let the diagram's "combining role" read at a glance, but the lines MUST stay subordinate to the part-numbers and the whole-number). |
| Ink (outlines, labels, glyphs)      | `colors.textNavy`    | All numerals, all 字 (分 / 合 / 分合式), all 分合式 diagonal strokes, all TeacherMark strokes, dot outlines. |
| Transient highlight                 | `colors.sunshine`    | A single sparkle at the moment the 分合式 settles in `fenheshi-intro`. No other use. |
| Dimmed reference                    | `colors.softGrayBlue`| ONLY as an opacity reference for `dimmed` props on `LabelCallout`/`NumberCard` (the previously-seen diagram in `five-1-4`). Never repaints a dot. |

Cream + 4 meaningful colors (reward, coral, textNavy, sunshine) = within `early-childhood-visual-taste` budget. softGrayBlue is opacity reference only, not a meaningful color.

### Typography

- Primary labels (分 / 合 / 分合式 / "5 的分与合"): `LabelCallout` `fontSize=56` (above 48 px minimum).
- Count chips / part numbers / whole number (the migrating glyphs and the static numbers inside the four 分合式): `NumberCard`-style glyph at 80 px height — well above the 36 px body-label minimum and large enough to read as part of the teaching object, not decoration.
- Caption ribbon: 44 px (load-bearing accessibility).
- Two-headed arrow term anchors ("分" and "合" attached to the count strip in `he-name`): `fontSize=56` — same as the primary labels (they ARE the primary labels at that moment).

### Motion vocabulary (cue-relative durations only; named curves from `src/motion-primitives/curves.ts`)

| Move class           | Duration              | Curve                  | Used by                                                                          |
|----------------------|-----------------------|------------------------|----------------------------------------------------------------------------------|
| Small fade-in        | 12 frames             | `EASE.outCubic`        | Caption ribbon, label term fade-in, chip soft entries                            |
| Chip snap-on         | `SPRING.snappy`       | spring                 | Count chips ("5" / "2" / "3") snap above clusters in `fen-name`                  |
| Default big move     | 24 frames             | `EASE.inOutCubic`      | Dot cluster spread (`fen-show`), dot cluster rejoin (`he-show`), diagram slide-and-dim transitions (`five-1-4`) |
| Load-bearing migration| 30 frames per glyph (sequenced) | `EASE.outQuint` | The "5" / "2" / "3" glyphs travelling from `zone-chips` into `zone-diagram` in `fenheshi-intro` |
| Sketch draw-on       | 18 frames (24 for the two diagonal 分合式 strokes drawing the first time) | `EASE.outCubic` | TeacherMark sweeps in `fenheshi-read`; the 分合式 diagonal lines drawing for the first time in `fenheshi-intro`; underline in `outro` |
| Climax sparkle       | 12 frames (single)    | `EASE.outQuint`        | One sparkle at the moment the 分合式 settles in `fenheshi-intro`. Nowhere else.  |
| Slide-and-dim        | 20 frames             | `EASE.enter`           | The completed (2,3) diagram sliding leftward in `five-1-4`; subsequent diagrams sliding leftward as new ones arrive in `five-3-2-and-4-1` |
| `PopIn motion="bouncy"` | spring `SPRING.bouncy` | spring              | RESERVED — the diagonal-line endpoints "land" in `fenheshi-intro`. ONE accent per video; spent here. (Composer may instead use the climax sparkle as the single accent — the contract is "one accent in `fenheshi-intro`, nowhere else.") |

Reserved emphasis budget for the whole video: exactly **one** sparkle (`fenheshi-intro` settle), exactly **one** bouncy accent (`fenheshi-intro` line-endpoint land — composer can drop this if the sparkle is the chosen accent). No additional pulse / glow / flash on any other cue.

---

## §4. Visual Contract

The metaphor and global contract:

```
metaphor:           a small group of dots comes apart and goes back together (the action), and that action is recorded by a small diagram whose pieces are the SAME numbers the kid just saw above the dots.
regions:            zone-stage → dot row (5-dot row, split, rejoined); zone-chips → count-chip glyphs above clusters BEFORE they migrate; zone-diagram → the 分合式 (one centered for intro/read, up to four in a horizontal row for enumeration); zone-strip → the `he-name` count strip with two-headed arrow; zone-label → term LabelCallouts (分, 合, 分合式, "5 的分与合", 分成, 组成); zone-caption → narration ribbon; zone-marks → sketch sweeps.
between-states:     the 5 dots persist as one instance for the entire concrete-and-name arc (`fen-show` → `fen-name` → `he-show` → `he-name`), dimming to a backing layer in `fenheshi-intro` and dismissed before `fenheshi-read`. The count-chip glyphs (5, 2, 3) persist from `fen-name` through their migration into `zone-diagram` in `fenheshi-intro`. The 分合式 settled in `fenheshi-intro` persists in `fenheshi-read`, then slides-and-dims into the left of the row in `five-1-4` (still the same instance, opacity reduced), then holds through `five-3-2-and-4-1` and re-appears compact in the outro.
reading-order:      caption → dot row in zone-stage → count chips → term in zone-label → (migration phase) → diagram in zone-diagram → (subsequent cues) sweep marks → siblings to the right.
decoration-budget:  cream canvas + caption ribbon = 2 stacked surfaces. 4 meaningful colors (reward, coral, textNavy, sunshine). softGrayBlue is opacity reference only.
text-budget:        captions (load-bearing — accessibility); count-chip glyphs "5"/"2"/"3" (load-bearing — they ARE the migrating pieces of the diagram); term glyphs 分/合 (load-bearing — KP1's named operations); term 分合式 (load-bearing — KP2's named diagram); reading-direction terms 分成/组成 (load-bearing — KP2's bidirectional reading); part numbers in five-1-4 / five-3-2-and-4-1 (load-bearing — KP3's enumeration); outro title "5 的分与合" (load-bearing — the moral). No other strings. No "Lesson 1.4" banner. No "Today we learn" header.
occupancy:          horizontal axis is binding for the dot row (560 px / 44% of 1280 base, opens to ~800 px / 63% post-split) and for the four-diagram row (~1040 px / 81% in `five-3-2-and-4-1`). Non-binding vertical axis: zone-stage 220 px ≈ 31% of 720, zone-diagram 380 px ≈ 53%; together with zone-label and zone-caption, no empty band.
identity-invariant: the 5 dots are the SAME `CountableObject` dot instances across all dot-bearing cues (same orange, same diameter). The count-chip glyphs travel as the SAME glyph instances from zone-chips into zone-diagram. The 分合式 shape (whole-on-top + two diagonal strokes + two parts below) is the SAME geometry across `fenheshi-intro`, `fenheshi-read`, `five-1-4`, `five-3-2-and-4-1`, and the outro replay — only the part numbers and (in enumeration cues) the count of side-by-side diagrams change.
```

Per-cue contract rows. Every row references the pedagogy.md discovery sentence it serves.

### intro
- **Discovery served (pedagogy.md `intro`)**: "today's lesson has a name — 分与合 — and it is about taking a small group apart and putting it back together."
- **Load-bearing elements (semantic, NOT React component names)**:
  | element                  | what it teaches                                          | zone        | state changes across this cue                                                                 |
  |--------------------------|----------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
  | mini-preview dot strip   | hints "today is about a small group coming apart"        | zone-intro  | enters early, plays one quick split-and-rejoin in middle band, dismissed at cue end           |
  | title line "分与合"        | names the lesson                                         | zone-intro  | writes on after the mini-preview has played at least one cycle                                |
  | subject subtitle "5以内数" | locates the lesson in the unit                            | zone-intro  | quiet fade-in slightly before the title; remains until cue end                                |
- **Forbidden in this cue**: any full-size dot row in zone-stage (the mini-preview is a smaller distinct echo, not the load-bearing dot row); no count chips; no 分合式 of any kind.
- **Identity-invariant carriers**: none yet — this cue plants identity that subsequent cues fulfill.

### fen-show
- **Discovery served**: "a whole group of five dots can come apart into two smaller groups."
- **Load-bearing elements**:
  | element       | what it teaches                                            | zone       | state changes across this cue                                                                                                  |
  |---------------|------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------------------------------------------|
  | 5-dot row     | the whole quantity, presented as countable objects         | zone-stage | enters at cue start centered as a single row; in the middle band, the 2 leftmost dots ease leftward and the 3 rightmost dots ease rightward, opening a cluster gap; holds at "two visibly separate clusters" at cue end |
- **Forbidden**: no count chips yet (the action delivers the separation; counting is the next cue's job); no 分 label; no diagram; no sketch mark.
- **Identity-invariant**: the row that enters here is THE row — the same 5 dot instances that will rejoin, get named, hold across `he-name`, and dim into a backing layer in `fenheshi-intro`.

### fen-name
- **Discovery served**: "the action you just watched has a name — 分 — and the parts have counts: 5 separated into 2 and 3."
- **Load-bearing elements**:
  | element                  | what it teaches                                          | zone       | state changes across this cue                                                                                              |
  |--------------------------|----------------------------------------------------------|------------|----------------------------------------------------------------------------------------------------------------------------|
  | 5-dot row (split)        | the picture the labels refer to                          | zone-stage | held in split state (carried in from `fen-show`)                                                                            |
  | count chip "5"            | names the whole quantity                                 | zone-chips | snaps on centered above the (still-visible-as-one-row) span; briefly highlights, then fades to neutral (it stays present)  |
  | count chip "2"            | names the left part                                      | zone-chips | snaps on above the left cluster center                                                                                       |
  | count chip "3"            | names the right part                                     | zone-chips | snaps on above the right cluster center                                                                                      |
  | term label "分"            | names the action                                         | zone-label | writes on in the middle of the cue, below the row, after "2" and "3" have landed                                            |
- **Allowed change**: chips snap on in sequence (5 first, then 2, then 3) so the eye lands in reading order; the 分 term writes on after all chips are settled. The chips are anchored by zone-chips for the duration of this cue and the next two — they are the glyph instances that will migrate in `fenheshi-intro`.
- **Forbidden**: no diagonal lines, no diagram (the diagram has not been introduced); no downward arrow as decoration — the proximity of "分" to the gap already says "this names what's happening here"; no second sketch mark.
- **Identity-invariant**: the chip glyphs created here are THE glyphs. They persist visually (held opacity) through `he-show` and `he-name` and then literally travel into zone-diagram in `fenheshi-intro`.

### he-show
- **Discovery served**: "two parts can move back together and remake the whole — the same picture, run backwards."
- **Load-bearing elements**:
  | element        | what it teaches                                          | zone       | state changes across this cue                                                                                       |
  |----------------|----------------------------------------------------------|------------|---------------------------------------------------------------------------------------------------------------------|
  | 5-dot row      | the whole reforming                                      | zone-stage | the left cluster eases rightward; the right cluster eases leftward; they reform a single contiguous row identical to `fen-show`'s start state |
- **Allowed change**: the 分 term in zone-label fades out at the start of the cue (the action is "un-naming" itself — the picture is doing the opposite). The "2" and "3" chips in zone-chips fade out across the first ~30% of the cue (they refer to the now-defunct cluster split). The "5" chip is NOT yet committed to migrate; brief fade in this cue is acceptable but composer may also keep it dim-on — the visual contract is "the parts disperse so the whole can read as one."
- **Forbidden**: NO new labels, NO 合 term (the term arrives in the NEXT cue, anchored to the reformed row); NO sketch marks.
- **Identity-invariant**: the row that reforms here is the SAME 5 dots in the SAME orange. The reverse motion is the same animation curve as `fen-show`, run backwards in dot positions — not a new graphic. (Two-pictures-stapled-together failure mode is forbidden by kids-eye §6.)

### he-name
- **Discovery served**: "joining two parts back has a name — 合. 分 and 合 are two directions of the same picture."
- **Load-bearing elements**:
  | element                              | what it teaches                                                     | zone        | state changes across this cue                                                                                                                                       |
  |--------------------------------------|---------------------------------------------------------------------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | 5-dot row                            | the rejoined whole                                                  | zone-stage  | held as one row                                                                                                                                                      |
  | count strip "5" / "2" / "3"           | the same three numbers, arranged in a horizontal reading line       | zone-strip  | "5" enters centered above (or starting the strip); "2" and "3" appear flanking it (with 2 on the left side, 3 on the right side); they enter mid-cue                |
  | two-headed arrow on the strip        | makes the inverse relationship explicit (same picture, both directions) | zone-strip  | draws on across the strip after the three numbers have landed; left head points toward the "2 + 3 spread out" reading, right head points toward the "5 unified" reading |
  | term label "分"                       | binds the leftward direction                                        | zone-strip  | re-attaches beside the left arrow head; this IS the same 分 glyph from `fen-name`, re-anchored                                                                          |
  | term label "合"                       | names the rightward direction                                       | zone-strip  | writes on beside the right arrow head, after the arrow has drawn on                                                                                                  |
- **Allowed change**: the chips from zone-chips (if still visible from `fen-name`) have fully cleared by the start of this cue; the count strip in zone-strip is a NEW reading line that uses the same three numbers in a horizontal arrangement. This is intentional — the kid sees the same three quantities in a new format that supports two-direction reading. The two-headed arrow is the load-bearing visual.
- **Forbidden**: NO 分合式 diagram (it arrives in the NEXT cue); NO sketch marks (the two-headed arrow is the explanatory device, not a TeacherMark — it is a structural element). NO third meaningful color on the arrow (coral, the action accent, is fine because the arrow is the named action; using sunshine here would be a second emphasis stealing from the climax).
- **Identity-invariant**: the 分 glyph here is the same `colors.textNavy` ink at the same size as in `fen-name`. The 合 glyph matches the 分 glyph in every visual property except position.

### fenheshi-intro  *(load-bearing cue — the picture becomes a symbol)*
- **Discovery served**: "there is a written shape that records what you just saw — top number is the whole, two short lines come down to the two part numbers. The shape is called 分合式."
- **Load-bearing elements**:
  | element                        | what it teaches                                                            | zone           | state changes across this cue                                                                                                                                                                                                                                |
  |--------------------------------|----------------------------------------------------------------------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | dot row (backing)              | the concrete proof of what the diagram records                              | zone-stage     | dims to a quiet backing layer (low opacity) at the start; held through migration; dismissed at cue end                                                                                                                                                          |
  | migrating "5" glyph            | the whole, moving into its diagram position                                 | zone-chips → zone-diagram | travels from its `fen-name`/he-name anchor up into the top center of zone-diagram; settles                                                                                                                                                       |
  | migrating "2" glyph            | the left part, moving into its diagram position                             | zone-chips → zone-diagram | travels from above-left-cluster into the bottom-left part position of zone-diagram; settles                                                                                                                                                     |
  | migrating "3" glyph            | the right part, moving into its diagram position                            | zone-chips → zone-diagram | travels from above-right-cluster into the bottom-right part position of zone-diagram; settles                                                                                                                                                   |
  | left diagonal stroke           | the visual recording of "5 contains a part — 2"                              | zone-diagram   | strokes on from the "5" position downward to the "2" position; begins drawing AFTER the "5" has settled and the "2" is in motion; completes when "2" settles                                                                                                  |
  | right diagonal stroke          | the visual recording of "5 contains a part — 3"                              | zone-diagram   | strokes on from the "5" position downward to the "3" position; begins drawing AFTER the "5" has settled and the "3" is in motion; completes when "3" settles                                                                                                  |
  | term label "分合式"               | names the diagram                                                          | zone-label     | writes on AFTER all migration is complete and both strokes have settled                                                                                                                                                                                          |
  | settle sparkle                 | the SINGLE accent in the entire video — marks the moment the diagram exists | zone-marks (or zone-diagram center) | one brief sparkle at the moment the second diagonal completes and the diagram has settled                                                                                                            |
- **Allowed change**: the three glyphs migrate in sequence (5 first, lifting upward; then 2 travelling down-and-leftward; then 3 travelling down-and-rightward). The two diagonal strokes draw on in the order their lower endpoints arrive (left first, then right). The "分合式" term writes on in zone-label only after settle. The settle sparkle (or `PopIn motion="bouncy"` accent on the diagonal endpoints — composer picks ONE of the two as the accent) plays once at settle and never again in the video.
- **Forbidden**: NO repainted dots (the dot row dims via opacity, never changes color). NO recoloring of the migrating glyphs (they stay `colors.textNavy` the entire travel). NO simultaneous migration of all three glyphs (sequenced — the kid must be able to track each piece). NO sparkle on any other cue. NO chrome card behind the diagram (the diagram is the teaching object; no surface earns existence around it).
- **Identity-invariant**: the migrating glyphs ARE the glyphs from `fen-name`. They do not pop in fresh; they travel.

### fenheshi-read
- **Discovery served**: "the diagram can be read in two directions — top-down is '5 分成 2 和 3', bottom-up is '2 和 3 组成 5'."
- **Load-bearing elements**:
  | element                  | what it teaches                                                      | zone         | state changes across this cue                                                                                                            |
  |--------------------------|----------------------------------------------------------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------|
  | the 分合式 (held)         | the artifact being read                                              | zone-diagram | held centered, same instance as `fenheshi-intro`                                                                                          |
  | downward sweep mark      | the top-down reading "5 分成 2 和 3"                                  | zone-marks   | strokes on from the "5" downward through both diagonal lines onto "2" and "3"; clears at end of first half of cue                          |
  | term "分成"               | confirms the verb of the downward reading                            | zone-label   | fades on alongside the downward sweep, fades off at end of first half                                                                       |
  | upward sweep mark         | the bottom-up reading "2 和 3 组成 5"                                | zone-marks   | strokes on from "2" and "3" upward through both diagonal lines into "5"; runs in the SECOND half of the cue, never overlapping the first   |
  | term "组成"               | confirms the verb of the upward reading                              | zone-label   | fades on alongside the upward sweep, fades off at end of cue                                                                                |
- **Allowed change**: the two sweeps run SEQUENTIALLY. The first sweep clears completely before the second begins; the corresponding terms in zone-label swap (分成 → 组成) in lockstep with the sweeps.
- **Forbidden**: NO simultaneous up + down sweep (the discovery is "two directions, one at a time"); NO second sparkle; NO new diagram in this cue (enumeration is the next two cues).
- **Identity-invariant**: the diagram is the SAME instance from `fenheshi-intro`. The sketch sweep ink is `colors.textNavy`.

### five-1-4
- **Discovery served**: "the same five dots can also split as 1 and 4."
- **Load-bearing elements**:
  | element                      | what it teaches                                                  | zone         | state changes across this cue                                                                                                                          |
  |------------------------------|------------------------------------------------------------------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
  | (2,3) diagram (held, slid)   | "we've already seen this one"                                    | zone-diagram | slides leftward into the left third of zone-diagram and dims (opacity reduced, never recolored); becomes the leftmost item of the row-of-diagrams forming |
  | (1,4) diagram (new)          | another way 5 splits                                             | zone-diagram | draws on to the RIGHT of the (2,3) diagram: whole "5" enters first, then parts "1" (left) and "4" (right), then the two diagonal strokes draw on between |
  | brief 1-dot + 4-dot strip    | concrete backing for the new diagram                              | zone-stage   | a tiny echo of the dot row appears briefly above-or-below the new diagram (composer's call) split as 1+4, then fades — anchors symbol to count           |
- **Allowed change**: the (2,3) diagram does NOT get destroyed and re-mounted as the leftmost item; it is the SAME instance whose position interpolates and whose opacity reduces. The new (1,4) diagram appears with the same internal geometry (whole on top, two diagonals, two parts below). The brief dot strip is a recall anchor — a quiet reminder that the diagram refers to concrete things — and fades before the next cue.
- **Forbidden**: NO new color on the dimmed (2,3) diagram (opacity only). NO simultaneous arrival of the new diagram with the dot-strip echo (sequenced — diagram first, then the dot strip backs it up, then the dot strip fades). NO sketch marks here (this cue is enumeration, not reading).
- **Identity-invariant**: the new (1,4) diagram uses IDENTICAL geometry, strokes, and ink to the (2,3) diagram. The two diagrams must read as siblings of the same species.

### five-3-2-and-4-1
- **Discovery served**: "there are still more ways — 3 and 2, and 4 and 1. Five has four splits in total."
- **Load-bearing elements**:
  | element                          | what it teaches                                              | zone         | state changes across this cue                                                                                                                |
  |----------------------------------|--------------------------------------------------------------|--------------|----------------------------------------------------------------------------------------------------------------------------------------------|
  | (2,3) diagram (held)             | "this set is now growing"                                    | zone-diagram | holds in the leftmost slot (dimmed from previous cue); no further change                                                                       |
  | (1,4) diagram (held, slid)       | "the second one is also already here"                         | zone-diagram | slides slightly leftward (composer's call: equal-spacing within zone-diagram) and dims to the same opacity as the (2,3) diagram                |
  | (3,2) diagram (new)              | a third split of 5                                            | zone-diagram | draws on to the right of (1,4): whole "5" first, then parts "3" (left) and "2" (right), then diagonals                                          |
  | (4,1) diagram (new)              | the fourth split of 5                                         | zone-diagram | draws on to the right of (3,2) after (3,2) settles: same construction pattern                                                                   |
  | row-spanning underline (optional) | "this set is now complete — there are four ways"             | zone-marks   | a quiet underline writes on beneath all four diagrams at cue end. OPTIONAL — composer may drop it if the row already reads as complete         |
- **Allowed change**: diagrams arrive sequentially (3,2 before 4,1); all four end the cue at equal opacity (composer may equalize the dim level across all four to read as one row of "splits of 5" rather than "two recent vs two old," but the kids-eye §4 identity rule says color must not vary — opacity equalization is fine because opacity is not color).
- **Forbidden**: NO sparkle (climax-only); NO recoloring; NO row title (the underline is the only allowed mark and it MUST stay subordinate); NO new label introducing "四种分法" — the picture says it, the narration confirms it, no zone-label string needed for the count.
- **Identity-invariant**: all four diagrams share the SAME whole-on-top + two-diagonals + two-parts-below geometry, SAME ink color, SAME stroke weight. They are four members of the same family.

### outro
- **Discovery served**: "three things from today — 分, 合, and 5 has four splits — fit on one screen at the same time."
- **Load-bearing elements**:
  | element                                | what it teaches                                                 | zone        | state changes across this cue                                                                                                                  |
  |----------------------------------------|-----------------------------------------------------------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------|
  | compact replay of `he-name` strip       | the inverse-direction relationship 分 ↔ 合                       | zone-outro (left half) | enters as a small replay of the count strip with the two-headed arrow and 分 / 合 already in place; holds                              |
  | compact row of four 分合式                | "5 has four splits"                                              | zone-outro (right half) | shrinks-and-slides from zone-diagram into the right half of zone-outro                                                              |
  | title line "5 的分与合"                   | the lesson's title, as moral                                     | zone-outro (bottom)     | writes on at the bottom after the two recap blocks have settled                                                                       |
- **Allowed change**: the recap is a *re-arrangement* of artifacts the kid already saw, not new content. Composer may use cross-fade or slide-and-shrink — both acceptable.
- **Forbidden**: NO new diagram; NO new term; NO sparkle (climax-only); NO second underline.
- **Identity-invariant**: the outro recap uses the SAME glyphs and the SAME diagram geometry seen in prior cues.

---

## §5. Motion vocabulary picks

Concrete name choices for the composer (from `src/motion-primitives/curves.ts`). Composer picks frame counts within the durations declared in §3.

- **Caption ribbon fade-in (every cue)** → `EASE.outCubic`, 12 frames.
- **Term labels writing on / fading in (分, 合, 分合式, 分成, 组成, "5 的分与合")** → `EASE.outCubic`, 12 frames.
- **Count chip snap-on in `fen-name`** → `<PopIn motion="snap">` (per `CAPABILITIES.md#popin-motion-variants`), using `SPRING.snappy`. Sequenced 5 → 2 → 3 with a small stagger so the kid can track each one.
- **Dot cluster spread in `fen-show`** → `EASE.inOutCubic`, 24 frames. Symmetric (left cluster mirrors right cluster).
- **Dot cluster rejoin in `he-show`** → `EASE.inOutCubic`, 24 frames. The exact reverse of `fen-show`.
- **Two-headed arrow draw-on in `he-name`** → `EASE.outCubic`, 18 frames. The strokes draw outward from the strip center.
- **Migrating glyphs ("5"/"2"/"3") in `fenheshi-intro`** → `EASE.outQuint`, 30 frames per glyph, sequenced (5 first, then 2, then 3). The slowest, weightiest motion in the video — it carries the load-bearing transition.
- **Diagonal 分合式 strokes drawing for the first time (in `fenheshi-intro`)** → `EASE.outCubic`, 24 frames each (longer than the default 18-frame sketch because they are structural lines, not transient sketch marks).
- **Bouncy accent on diagonal endpoints landing (`fenheshi-intro`)** → `<PopIn motion="bouncy">` with `SPRING.bouncy`. ONE accent in the video; if used, it replaces the sparkle. Composer picks one or the other, not both.
- **Settle sparkle (alternative to bouncy accent, `fenheshi-intro`)** → `EASE.outQuint`, 12 frames. Lives at the diagram's center or the lowest-rightmost diagonal-endpoint (composer's call).
- **Highlight sweeps in `fenheshi-read`** → `EASE.outCubic`, 18 frames each. Two sweeps SEQUENTIALLY, never overlapping.
- **Diagram slide-leftward-and-dim (`five-1-4`, `five-3-2-and-4-1`)** → `EASE.enter`, 20 frames.
- **New diagram arrival (`five-1-4` and onward)** → whole "5" enters via `<PopIn motion="snap">`; each part number enters with the same snap; diagonals draw on with `EASE.outCubic` 18 frames.
- **Optional underline in `five-3-2-and-4-1`** → `EASE.outCubic`, 24 frames (long mark, longer draw).
- **Outro slide-and-shrink** → `EASE.inOutCubic`, 24 frames.

Reserved emphasis budget for the whole video: ONE accent in `fenheshi-intro` (sparkle OR bouncy endpoint-land, composer picks one). No additional bouncy/sparkle/glow anywhere else. The intro's mini-preview animation uses the SAME `EASE.inOutCubic` 24-frame curve as `fen-show` to telegraph what the lesson will be — but uses no sparkle and no bouncy accent.

---

## §6. Finger-cover test on `fenheshi-intro` (the load-bearing cue)

Simulating the moment the diagram has just settled (all three glyphs are in their diagram positions, both diagonals are drawn, the sparkle/bouncy accent is at its peak, the term "分合式" has just begun writing on in zone-label, the dot row is dimmed to a backing layer at low opacity):

- **Cover the dimmed dot row.** Does the diagram still teach? **Yes, mostly** — the 分合式 with whole "5" on top and parts "2" and "3" below is intelligible on its own. But the *transition* — "this records what you just saw" — is the discovery; without the dimmed backing layer, the kid sees a diagram appear from nowhere and the symbol-from-picture moment is lost. KEEP the backing. The backing is load-bearing UNTIL the diagram has settled, then it can dismiss.
- **Cover the "5" at the top of the diagram.** What remains: two diagonal lines connecting nothing to "2" and "3", plus the dimmed dot row backing. Does the discovery survive? **No** — the diagram is no longer a 分合式; the whole-on-top is the structural anchor. The "5" is load-bearing. KEEP it.
- **Cover either part number ("2" or "3").** What remains: a diagram with a whole, one part, and one diagonal pointing nowhere. Does the discovery survive? **No** — the diagram by definition records TWO parts. Both part numbers are load-bearing. KEEP both.
- **Cover both diagonal strokes.** What remains: three numbers stacked vertically with no connecting lines, plus the dimmed dots. Does the discovery survive? **No** — the diagonals are what make this "a diagram" and not just three numbers floating. KEEP both diagonals.
- **Cover the "分合式" term label in zone-label.** Does the discovery survive? **Marginal** — the kid sees the diagram and (via the dimmed backing) understands what it records, but doesn't yet know the diagram has a NAME. The label is load-bearing because the cue's pedagogy includes naming. KEEP the label.
- **Cover the settle sparkle / bouncy accent.** Does the discovery survive? **Yes** — the diagram is fully built and intelligible; the accent is punctuation, not load-bearing pedagogy. The accent is allowed (it is the climax marker), but it earns its place by being the SINGLE accent in the video, not by being structurally necessary. PASS.
- **Cover the caption ribbon.** Does the discovery land? **Yes** — the migration motion + the diagram appearing + the term label below carry the lesson. The caption is accessibility (ESL + hearing accessibility) but not the sole carrier. PASS.

Design adjustments confirmed by the test:

- The dimmed backing dot row MUST persist visible (not destroyed) through the migration in `fenheshi-intro`. Without it, the "symbol-from-picture" moment collapses.
- All FIVE diagram pieces (whole "5", two parts "2" / "3", two diagonals) are load-bearing — none can be visually weak or omitted.
- The `分合式` term in zone-label is load-bearing (the cue's pedagogy includes naming, not just constructing).
- The accent (sparkle or bouncy endpoint-land) is decorative-but-allowed as the climax marker; ONE only, in this cue only.

---

## §7. Self-critique pass

Risks I am flagging now so downstream waves can audit / fix early.

1. **Coral on the 分合式 connecting lines is borderline.** The palette assigns coral to "combining / relating" and the diagonal lines do represent "the whole is related to its parts." But if the diagonals are too saturated, they compete with the part numbers and the "5" for the eye's attention, and the kids-eye §3 finger-cover test on `fenheshi-read` (where the sketch sweep traces over the diagonals) becomes harder — two coral strokes plus a navy sweep mark in the same band could read as visual clutter. **Mitigation:** composer should default to navy diagonals (`colors.textNavy`); coral is only acceptable if the part-numbers visibly dominate after a render check. Flagged for Wave 3 / Wave 4.

2. **The `he-name` count strip (zone-strip) is a NEW horizontal arrangement of "5", "2", "3" — distinct from the chips above the clusters in `fen-name`.** This risks reading as "two pictures stapled together" (kids-eye §6) — the chips in zone-chips and the strip in zone-strip are competing for the kid's "where do these numbers live" mental model. **Mitigation:** ensure the chips in zone-chips fade out completely before the count strip in zone-strip enters; the strip should be understood as "the same three numbers, re-arranged for inverse-reading," not as a new set of numbers. Composer must enforce the cross-fade. Flagged.

3. **The migration in `fenheshi-intro` requires identity-preserved glyph travel — the same instance moves from zone-chips to zone-diagram.** If the primitive layer (Wave 3) cannot animate a glyph from one absolute screen position to another while keeping its instance identity, the composer will be tempted to "fade chip out + fade diagram-glyph in" — which the kid reads as "the chip disappeared and a new number popped up," NOT as migration. This would break identity-invariant promise §2. **Mitigation:** Wave 3 primitive-gap-scan must confirm a path-based or two-anchor glyph primitive (a `NumberCard` with `from`/`to` props, or a glyph that accepts a position interp) is available. If not, this is a primitive gap that ships before Wave 4. Flagged as HIGH for Wave 3.

4. **`five-1-4`'s brief dot-strip echo (the "1+4" concrete backing) may be redundant.** Kids-eye §3 says "if you can cover this element and the picture still teaches, it's decoration." The new (1,4) diagram, after the kid has already seen the migration in `fenheshi-intro`, may not NEED a concrete dot-echo — the kid knows the diagram refers to dots; repeating it for every new enumeration risks over-explaining. **Mitigation:** composer renders both versions (with and without the dot strip) at the climax of `five-1-4` and applies the finger-cover test; drop the dot strip if the diagram alone reads. The contract above lists the dot strip as OPTIONAL backing. Flagged YELLOW for Wave 4.

5. **The four-diagram row in `five-3-2-and-4-1` risks the kids-eye §3 "barcode" failure mode.** Four small diagrams at ≈ 200 px wide each in a row could read as visual rhythm rather than as four distinct facts. **Mitigation:** ensure the part-number glyphs inside each diagram stay at the body-label target (80 px) — at 1280 width, 80 px glyphs are 6.25% of the canvas, large enough to read individually. The horizontal gaps between diagrams must be ≥ 80 px (declared above) — narrower and the row collapses to barcode. Composer must audit at render time. Flagged YELLOW.

6. **The outro three-up layout has FOUR semantic groups (replay-strip + four-diagram-row + title-line + optional underline carry-over).** This is right at the hard cap of 4 from §1's motion-budget. If the optional underline from `five-3-2-and-4-1` carries into the outro at all, the count is exceeded. **Mitigation:** the underline from `five-3-2-and-4-1` MUST clear before the outro begins, OR the title-line "5 的分与合" enters only AFTER the underline clears. Composer must enforce. Flagged YELLOW.

No red findings. Three yellow findings (1, 4, 5, 6) for orchestrator / Wave 3 / Wave 4. One HIGH-priority Wave 3 dependency (3 — identity-preserved glyph migration).

---

## §8. Source-of-truth references

- Composition size, fps: `src/theme.ts` (`video.width = 1280`, `video.height = 720`, `video.fps = 30`).
- Color tokens: `src/theme.ts` (`colors.cream`, `colors.reward`, `colors.coral`, `colors.textNavy`, `colors.sunshine`, `colors.softGrayBlue`).
- Font family: `src/shape-primitives/shared.tsx` (`fontFamily`).
- Motion curves and springs: `src/motion-primitives/curves.ts` (`EASE.outCubic`, `EASE.inOutCubic`, `EASE.outQuint`, `EASE.enter`, `SPRING.snappy`, `SPRING.bouncy`).
- `<PopIn>` variants: `src/motion-primitives/PopIn.tsx` and `CAPABILITIES.md#popin-motion-variants`.
- Existing primitives this design assumes (Wave 3 confirms or extends):
  - `CountableObject` (dot variant) — for the 5-dot row in zone-stage.
  - `NumberCard` — for the count chip glyphs in zone-chips and the part-numbers inside the 分合式. (Wave 3 must confirm that NumberCard glyphs can travel from one anchor to another preserving instance identity — see §7.3.)
  - `LabelCallout` — for term labels in zone-label (分, 合, 分合式, 分成, 组成, "5 的分与合").
  - `TeacherMark` — for the two sequential sweeps in `fenheshi-read` and the optional underline in `five-3-2-and-4-1`.
- Likely new primitive (Wave 3 decides):
  - A `FenHeDiagram` — whole on top, two diagonal stroke-revealable lines descending to two part numbers below. Lesson-agnostic props per brief.md (`whole`, `parts: [number, number]`, `progress` 0–1, `dimmed`). May be a composition of `NumberCard` + a generic line/brace instead — Wave 3 picks.
- Likely new composition (Wave 3 decides):
  - A topic-intro card for math subjects (the intro cue's mini-preview + title + subtitle composition). The existing literacy intro primitives likely don't fit. May be a composition of existing primitives or a new normalized intro layout.
