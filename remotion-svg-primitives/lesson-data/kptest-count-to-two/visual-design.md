# visual-design — kptest-count-to-two

Visual Contract for a two-count math-insight lesson (audience 3–5, Mandarin). One metaphor, two teaching cues + a topic-intro. Intent only — no absolute frames below; all motion is named (`EASE.*` / `PopIn` / `TeacherMark`) and timed to `cues[id].startFrame+offset`.

## kid's-eye measurement block

```
composition:             1280×720 @ 30fps   (src/theme.ts `video`)
short-side:              720 px

teaching-unit:           one apple (the countable)
teaching-unit-min:       ≥ 8% short-side = 58 px                → sized 220 px (≈30.6% short-side) — well over floor
teaching-unit-target:    86–108 px                             → 220 px exceeds target (2 items afford the size)

ordinal-tag-min:         36 px rendered (body-label floor, `sizing.minFontPx`)   → tags rendered 64 px
primary-label-min:       48 px (`sizing.captionFontPx`)          → group "2" cardinal glyph rendered 128 px (≥ primary; focal reveal)
caption-line-min:        48 px                                  → caption ribbon (reserved)
separation-gap-min:      ≥ 6% short-side = 43 px                 → apple-to-apple gap = 80 px (gap > floor at delivery)
chrome-label:            FORBIDDEN
```

Teaching unit + tags fit easily: 2×220 + 1×80 = 520 ≤ zone-objects.w (800). Densest cue (cue-2: two apples + two migrating tags + one arriving group "2") is checked per-zone below.

## zones (disjoint bounding boxes)

```
zone-objects:    x=240  y=198  w=800  h=300   | holds: the two apples (+ their in-place ordinal tags ride on top/side of each apple). NOTHING ELSE.
zone-labels:     x=440  y=520  w=400  h=120   | holds: the group "2" cardinal glyph (the consolidated total). Never overlaps zone-objects.
zone-tally:      (unused — insight lesson, no step tally)
zone-caption:    bottom ribbon (CAPTION_BAND, src/lesson-media/captionBand.ts) — reserved for the verbatim voice ALONE.
zone-marks:      full-bleed — sketch marks. May TRACE OVER zone-objects (e.g. a brace from the two apples converging onto the group "2"); never sit inside zone-labels.
zone-intro:      title/teaser surface for announce-topic — time-disjoint from zone-objects (apples enter AFTER the title reads). Only one of zone-intro / zone-objects is on screen at a time.
```

**Disjoint check (co-present pairs, delivery frame):**
- zone-objects vs zone-labels: objects spans y∈[198,498]; labels spans y∈[520,640]. y-gap = 22 px ❌ — UNDER the 43 px floor. Widen: move zone-labels down to y=545 (gap = 498→545 = 47 px ✓) keeping h=120 → y∈[545,665] which stays above the caption band (band sits in last ~64 px = y≥656). Tight. **Rework:** shift zone-objects up to y=170,h=300 → y∈[170,470]; zone-labels y=520,h=120 → y∈[520,640]. Gap = 50 px ✓; labels bottom 640 clears the caption band (656) ✓. Final: zone-objects y∈[170,470], zone-labels y∈[520,640].
- Apple-to-apple gap (inside zone-objects): 80 px ≥ 43 px floor ✓.
- zone-intro is time-disjoint from zone-objects (announces alone, apples enter after) — overlap permitted; active in announce-topic only.
- zone-caption never intersects any teaching box (band is the last ~64 px; zone-labels bottom 640 sits above it).
- zone-marks may trace over zone-objects but the brace's lower terminus lands on zone-labels' top edge, never inside it (the cardinal glyph stays unoccluded).

## palette (theme keys via resolveColor — no inline hex)

```
cream       canvas background
reward      the two apples (teaching unit) — identical tone, both cues, identity-invariant
textNavy    ordinal tags (1,2), group "2" glyph, sketch ink — anything that "speaks"
coral       the action / consolidation accent: the merge motion + brace strokes (the operator that combines)
sunshine    transient highlight — the ordinal tag actively attaching (the "this one now" pulse), + the end-recall pulse on the group "2"
```
4 meaningful colors + cream. No fifth. Apples stay reward-orange across both cues (no "celebratory" hue change on cardinality).

## motion vocabulary (intent; curves named, frames = cue-relative)

```
apple entrance (per apple, as its count word lands):  PopIn motion="snap", entry curve EASE.enter (~16 frames)
ordinal tag attaches (sync to count word):           snap appear + 6-frame sunshine pulse, EASE.outCubic
group "2" consolidation migration:                    EASE.inOutCubic (~24 frames) — the two tags travel into one glyph (climax move)
climax reveal settle on group "2":                    PopIn motion="bouncy" (THE one accent moment of the video) — cardinality is the new idea
end-recall pulse on group "2":                        sunshine scale-pulse re-strike, ~12 frames EASE.outQuint (the §6 reserved pulse)
sketch brace (cue-2):                                 stroke-on draw, ~18 frames; optional boil if it lingers to the recall hold
moving-hold (rule #6):                                <Breathe bpm=15 amplitudeScale=0.005 phaseSeed="kpct2-apple-pair"> wraps the apple pair; <Breathe phaseSeed="kpct2-group-2"> wraps the group "2"> when at rest
```

## Visual Contract

```
metaphor:        two identical apples arrive one at a time, each tagged with the next number word (一, then 二); the last tag then lifts off the group as one "2" that stands for HOW MANY there are altogether.
regions:         zone-objects → the two apples + their in-place ordinal tags; zone-labels → the consolidated group "2" cardinal glyph; zone-intro → the topic title (alone, then cleared); zone-caption → verbatim voice ribbon; zone-marks → the brace that ties the pair to the total.
between-states:  the same two apples live the whole lesson (identity-invariant, same reward tone). What changes across cues is the NUMBERS around them: cue-1 attaches per-object tags 1,2 in turn; cue-2 merges those two tags into one group "2". The apples themselves never move after they land (cue-1) and stay quiet through cue-2.
reading-order:    announce: title → (title clears) → two apples enter in turn. cue-1: apple-1 lands → tag "1" attaches → apple-2 lands → tag "2" attaches. cue-2: the two tags converge → one group "2" settles below → brace ties pair↔total → end-recall pulse on the "2".
decoration-budget: 1 cream canvas + 1 caption ribbon = 2 surfaces. reward, textNavy, coral, sunshine = 4 meaningful colors.
text-budget:     ordinal tags "1","2" (load-bearing — the count action); group "2" (load-bearing — the cardinality reveal); takeaway/caption (verbatim voice, accessibility). NO chrome header, NO per-apple name, NO step tally, NO restatement of the caption on screen.
occupancy:       horizontal axis binding (apples pair across width). 2×220 + 80 gap = 520 px ÷ zone-objects.w 800 = 65% of its binding zone ✓; apple unit ≈ 220 px = 30.6% of the 720 short-side (well over §1 target); on the non-binding (vertical) axis, each apple (220 px tall ≈ 73%) fills ~73% of the 300-px-tall zone — does not float in blank. group "2" at 128 px uses ~32% of zone-labels.w 400 — focal.
fit-check:       densest cue = cue-2 climax (2 apples at rest + 2 migrating tags + arriving "2"): apples live zone-objects (520 ≤ 800 ✓, gap 80 ≥ 43 ✓); group "2" lives zone-labels (128 ≤ 400, centered, no overflow ✓); the two zones are y-disjoint (50 px gap ≥ floor ✓). No co-present box pair overlaps.
identity-invariant: every apple is the SAME reward-orange apple-countable primitive (W3b resolves the countables-plus-ordinal-tag gap) in BOTH cues — cue-1 places them, cue-2 only re-reads them; the per-object tags "1","2" are the SAME ink-numerals that migrate into the group "2" (no separate species, no cross-fade replacement — the same glyph instances travel: a fen-he-diagram-style anchor migration, not a fade-out/fade-in).
one-metaphor:    ONE metaphor — "count tags each apple, then the last tag becomes one number for the whole group." The consolidation IS the transformation; there is no side-by-side "before/after" card (kids-eye §6).
object-count:    zone-objects holds 2 apples every cue (cue-2 is a re-read, not a recount). per-object ordinal tags: 2 in cue-1, migrating-to-1 (the group "2") in cue-2. group "2": 1 in cue-2. Composer sizes apples via fitUnitsToZone(zone-objects, 2).
```

## per-cue motion budget (visualMotionSeconds — MOTION time to READ; intent, walls nit frames)

| cue | discovery ref (pedagogy) | visualMotionSeconds | motion intent (≤1 line/cue) |
|---|---|---|---|
| announce-topic | — (names the lesson, no discovery) | 2.2s | title reads ALONE (write-on + settle), THEN two apples fade-in UNDER it after it has read — beat-ordering enforced, never overlaid on title. |
| cue-1-count | action of counting — two identical apples arrive one-at-a-time, each tagged with the next number word (一,二) in sync | 5.0s | apple-1 lands + tag "1" attaches+pulse (≥2.5s dwell so the count word lands), THEN apple-2 lands + tag "2" attaches+pulse (≥2.5s dwell). Each spawn at its spoken count word; tags NEVER both at once. |
| cue-2-cardinality | cardinality — the last number (二/"2") names how many altogether; one "2" for the whole group | 6.0s | (a) narration sets up "how many altogether" WITHOUT pre-saying it (~1.5s hold, apples quiet) → (b) the two per-object tags migrate/merge into one group "2" with a bouncy-settle climax (~2.5s) → (c) brace draws tying pair↔total hold → (d) end-recall pulse on the "2" re-voicing the total (~1.5s; this IS the lesson's one reserved §6 pulse + retrieval recap). |

All three cues include dwell so a 6yo can look at each landed result. Re-engagement beat: the consolidation + recall pulse in cue-2 breaks the static counting rhythm within the ~14s teaching span.

## reuse-primitive table (consult CAPABILITIES.md; W3b resolves the gap-flagged demand)

| need | reach-for (capability id) | status |
|---|---|---|
| two identical countable objects that land one-at-a-time, each receiving an in-turn ordinal number tag in sync with the spoken count word | **countables-plus-ordinal-tag** — storyboard gap flag; not assumed present, W3b resolves against the live catalog | GAP (W3b) |
| per-object ordinal tags (1,2) migrating/merging into one group-total glyph "2" representing the whole set (identity-preserving, no cross-fade) | **fen-he-diagram** migration mode (`renderNumbers={false}` + `getFenHeDiagramAnchors`; allows the same NumberCard instances to TRAVEL into the cardinal glyph anchor) — the SAME glyph-identity-preservation mechanism used for "picture becomes symbol"; if the consolidation reads better as 2-tags→1-glyph than a fen-he part-whole diagram, W3b may instead resolve to a tag→cardinal consolidation capability | GAP (W3b) — fen-he-diagram is the closest existing primitive; confirm fit or name a new one |
| place 2 apples at zone ≥ floors | **auto-size-to-zone** — `fitUnitsToZone(zone-objects, 2)` computes the 220 px unit + 80 px gap + positions; scene + manifest call identically | REUSE |
| topic-intro title alone, then objects enter | **LessonIntroCard** (announce-topic requires) — no on-screen cast teaching object during title read | REUSE |
| entrance physics | **popin-motion-variants** `motion="snap"` (apples, tags); `motion="bouncy"` reserved for the ONE group-"2" climax reveal | REUSE |
| named curves | **motion-vocabulary** `EASE.enter` (entrances), `EASE.inOutCubic` (tag consolidation), `EASE.outQuint` (recall pulse) | REUSE |
| brace / consolidation sketch mark (cue-2 only) | **sketch** (`<TeacherMark>`, textNavy, stroke-on not fade-in; one mark only, optional `boil` if it lingers to the recall hold) | REUSE |
| moving-hold on the resting apple pair + resting group "2" | **magic-fx-library** `<Breathe>` with distinct `phaseSeed`s per group | REUSE |
| signal focus on the attaching tag / consolidating glyph | **signal-focus-pointer** `— at most ONE focal cue per beat; sparingly (cue-1 tag-attaching and/or cue-2 consolidation, not every spawn) | REUSE |
| highlight the actively-attaching tag | sunshine transient pulse via `<GlowPulse>` or a brief fill swap — ONE tag at a time, never both | REUSE |

## anti-patterns to refuse (this lesson)

- Two apples drawn as two different visual species (different colors/shapes "because apple 2"). They are identical; only the COUNT sequence differentiates them (kids-eye §4).
- Tags "1" and "2" appearing simultaneously in cue-1 — defeats the count-action; one at a time, each at its spoken count word (§7 count-match).
- Cross-fade replacing the migrating "1"/"2" tags with a separately-spawned "2". The tags must TRAVEL into the group glyph (fen-he anchor migration) — one identity, not a cut.
- A per-apple count BADGE on top of an already-pulsed attaching tag — double signal for "this one now" (kids-eye §2). One carrier: the tag + its transient sunshine pulse.
- Big on-screen text restating the spoken caption (a "数到二" header). The caption lives in the ribbon; on-screen text only ADDS (the group "2" names the new total, points at nothing already said).
- A decorated apple environment (grass, basket, sky). Cream canvas, the two apples, the ink — nothing else (taste anti-pattern).
- Numeric glyph hue change at the cardinality reveal (a "celebratory" rainbow). Group "2" stays textNavy (identity preserved; the reveal earns its weight from the bouncy-settle climax, not a color swap).
- Marks on more than cue-2 — most cues zero marks; the brace is the one restrained gesture.
