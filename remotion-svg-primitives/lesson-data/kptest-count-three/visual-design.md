# kptest-count-three — Visual Design (W2a)

Audience ages 3–5 (Mandarin). Default style (no `<StylePreset>`). Intent only — no frame literals; visualMotionSeconds are the motion budget, W3.5 reconciles `max(narration,visual)+tail`.

## Kids-eye §1 measurement
```
composition:    1280×720 @ 30fps  (src/theme.ts video; fixed)
short-side:     720px
teaching-unit:  the apple (countable-object, variant fruit=apple)
teaching-unit-min:    ≥8% short-side = 58px
teaching-unit-target: ~150–160px (~21–22% short-side) — raised above the 12–15% (86–108px) floor:
                      (a) ages-3-5 legibility ("bigger, slower"); (b) non-binding vertical occupancy
                      on a SPARSE 3-apple row — the visual-discipline §4 "grow it" fix, NOT chrome.
child-readable-text-min: 36px (theme sizing.minFontPx)
primary-label-min: 48px (theme sizing.captionFontPx) — count tags 1/2/3, cardinal glyph 3, title
body-label-min:   36px
caption-line-min: 48px — caption ribbon
separation-gap-min: ≥6% short-side = 43px (between co-present apple clusters)
chrome-label: FORBIDDEN
```

## §1.5 zones (1280×720; disjoint, computed)
```
zone-total:   x=520 y=36  w=240 h=140 | cardinal glyph "3" ABOVE the group. ACTIVE: cardinality only. (w tolerates the bouncy 1.06× overshoot)
zone-badges:  x=290 y=226 w=700 h=64  | per-apple count tags 1/2/3, one slot per apple column, above apples. ACTIVE: count-climb + cardinality start (1,2 recede; 3 migrates up → zone-total)
zone-objects: x=305 y=320 w=670 h=160| the 3 countable apples, ONE horizontal row. NOTHING ELSE. ACTIVE: count-climb + cardinality (carried quiet, same positions)
zone-caption: x=0   y=604 w=1280 h=116| verbatim-voice ribbon (CAPTION_BAND, composer-resolved constant). ACTIVE: all cues. RESERVED no-go.
```
Disjoint (co-present pairs, y-check): **count-climb** = badges∩objects 290<320 ✓gap30; badges∩caption 290<604 ✓; objects∩caption 480<604 ✓gap124. **cardinality mid** = total∩badges 176<226 ✓gap50 (the "3" migrates UP through this gap — one moving element, not a zone overlap); total∩objects 176<320 ✓; badges∩objects ✓; all∩caption ✓. **cardinality final** = total∩objects 176<320 ✓gap144; all∩caption ✓. No co-present zone-pair intersects. ✓

## Palette + motion vocabulary (taste)
Palette (resolveColor / theme.colors; ≤4 meaningful + cream):
```
cream      #FFF7E6  canvas background
reward     #FFB84D  the apples — identical countable-object, the whole lesson (teaching unit)
coral      #FF8A65  converging guide lines in cardinality (the gather-three-counts action accent) — primitive's own graphic, NOT a sketch overlay
textNavy   #24324B  count tags 1/2/3, cardinal glyph 3, title/teaser, captions, any sketch ink
— NOT used: sunshine (highlight ring FORBIDDEN by count-on single-signal, kids-eye §2); softGrayBlue (no dimming/comparison).
```
Motion vocabulary (named curves; CAPABILITIES#motion-vocabulary / #popin-motion-variants):
```
apple entrance:        PopIn motion="snap", ~16–20fr EASE.enter  (entrance — NOT a count signal)
tag attach:           12fr EASE.outCubic                  (the SOLE count mark on each apple; no ring)
converging lines:     18–24fr draw-on, stroke-on (coral)  (gather action inside CardinalConsolidation)
cardinal 3 settle-pop:PopIn motion="bouncy", ~30fr        (the ONE climax accent — new-concept reveal = cardinality)
re-engagement:        the 3 paced count-climb arrivals ARE the rhythm; no dead-air stretch ≥ ~15s.
moving-hold (rule #6): wrap each cue's load-bearing group in <Breathe bpm=15 amplitudeScale=0.005 phaseSeed=…> — apple row (count-climb), card (topic-intro), glyph+quiet-apples (cardinality); distinct phaseSeeds. FX on apples only via Breathe (≤0.01); no sparkle/ring.
sketch teacher-marks: budget 0 (restraint); focus-pointer: none. The gather action is CardinalConsolidation's own coral lines, so no sketch overlay is demanded. sketch-explainer-layer (W4) honors ≤1 ceiling; adds a mark only if a named gap surfaces.
```

## Visual Contract (visual-discipline §1)
```
metaphor:        three identical apples arrive one-by-one, each earning one count word + one count tag (1,2,3); then the last tag "3" lifts up and re-scopes to name the WHOLE group — 3 means "how many altogether".
regions:         zone-objects = the apples (countables); zone-badges = the per-apple one-to-one count tags; zone-total = the one cardinal glyph standing for the whole; zone-caption = the verbatim-voice ribbon.
between-states:  ONE countable-object row of 3 apples lives the WHOLE lesson: arrives one-by-one (count-climb), held identity-preserving, then carried QUIET underneath the cardinal glyph (cardinality). Count tags attach per-apple (count-climb) then consolidate: the "3" tag migrates up → cardinal glyph (identity-preserved, NO cross-fade); the 1 & 2 recede via converging coral guide lines. Coral lines appear only in cardinality (transient action).
reading-order:   topic-intro: title alone → teaser underline. count-climb: arriving apple (pop) → its tag attaches → hold → next apple. cardinality: quiet tags → coral lines gather → "3" migrates up + scales up → cardinal glyph bouncy settle-pop → eye reads "3 = whole group (3 apples below)" → caption names the total (voice confirms AFTER the picture).
decoration-budget: 2 surfaces (cream bg + caption ribbon). 3 meaningful colors (reward apples, textNavy numerals/text, coral gather-lines). No mascot, no scene chrome.
text-budget:     topic-intro TITLE + one-line teaser (names the topic; reads alone). count tags 1/2/3 (load-bearing: ARE the one-to-one). cardinal glyph 3 (load-bearing: the moral = the THIRD tag re-scoped, not a new string). caption ribbon (accessibility, the verbatim voice). NO chrome header, NO on-screen takeaway line (would restate the spoken total = duplication sin; glyph 3 + ribbon suffice).
occupancy:       binding = horizontal (apples line up L→R).
                 binding-axis: row 3·160 + 2·95 = 670px ÷ 1280 = 52.3% (✓ ≥50%).
                 non-binding (vertical) ÷ short-side 720: count-climb span 226–480 = 254px = 35.3% — the SPARSE 3-apple-metaphor limit; mitigated by raising apples to ~160px (the §4 grow-it fix), NOT by chrome. cardinality (FULLEST cue) span 36–480 = 444px = 61.7% (✓ ≥50%).
fit-check (against zone-objects.w=670, count=3, target=160): 3·160 + 2·95 = 670 ≤ 670 ✓; every co-present gap 95 ≥ 43 ✓; row x-extent ⊂ [305,975] ✓. Apples sized/ positioned via fitUnitsToZone(zone-objects, 3, {target:160}); badges slotted above the apple columns (same x from the fit).
identity-invariant: the 3 apples = one countable-object (fruit=apple, tone=reward) the entire lesson — same silhouette, same orange, only the count arrives & layout held; NO color/shape change across count-climb→cardinality. The "3" tag = ONE identity-preserved numeral that migrates+rescales (per-apple tag → whole-group cardinal glyph); NO fade-out/fade-in cross-fade (the fen-he-diagram "one glyph travels" law). The 1 & 2 tags recede (fade) as they gather — NOT identity-bearing, so fading is allowed.
object-count:    topic-intro: — (LessonIntroCard only, no apples). count-climb: zone-objects 3 (1→2→3 over the cue, positions FIXED, each keeps its tag). cardinality: zone-objects 3 (carried quiet, same positions) + zone-total 1 (the migrating "3").
```

## Per-cue motion budget (visualMotionSeconds — intent, incl. dwell; W3.5 reconciles max(narration,visual)+tail)
| cue | discovery-ref | visualMotionSeconds | motion notes |
|---|---|---|---|
| topic-intro | announce-topic (frames both discoveries) | 3.5s | LessonIntroCard: title write-on ~1.5 + read-alone ~2.0; title is the ONLY readable thing; apples enter NEXT cue. |
| count-climb | one object = one count word, in order (一,二,三) | 13.5s | 3 arrivals × ~4.5s: apple PopIn snap ~0.7 + tag attach 0.4 + count word (spoken) ~0.8 + per-item dwell ~3.0 (≥2–3s per count-on) + breath gap ~0.7; apples stay put, identity+tag preserved; NO total yet (leakage rule). |
| cardinality | last number said (3) = how many altogether | 6.5s | coral converge draw-on ~0.8 + "3" migrate/scale-up ~0.6 + cardinal glyph bouncy settle-pop ~1.0 (the ONE climax accent) + picture-leads hold while voice names total ~2.0 + final landing hold ~2.1; NO recap (cardinality IS the landing). |
| _total_ | | _~23.5s + cue tails ≈ 25s_ | (brief hint; not a pad target) |

## Reuse primitives (REUSE; confirm registry/variant at W3b gap-scan)
| capability | role | cue(s) | note |
|---|---|---|---|
| LessonIntroCard | topic-intro card (title + teaser, write-on underline) | topic-intro | announce-topic: title reads alone; apples enter AFTER. fit-text sizes the data-driven title. |
| countable-object (variant: fruit=apple) | the 3 apples (teaching unit) | count-climb, cardinality | identical reward-orange; fitUnitsToZone(zone-objects,3,{target:160}); identity-invariant across cues; PopIn snap entrance; NO highlight ring. |
| number-card OR count-step-indicator | per-apple count tag 1/2/3 (persistent) | count-climb, cardinality | numeral 1/2/3, textNavy, bare (no pill unless legibility needs); MUST persist (does NOT fade out in count-climb). W3b picks which + confirms persistence. |
| CardinalConsolidation | consolidate per-item tags → 1 cardinal-3 glyph | cardinality | owns the converge (coral guide lines) + the "3" migration (identity-preserved, NO cross-fade) + glyph bouncy settle-pop; per-item tags recede. |
| fitUnitsToZone (auto-size-to-zone) | size+place the 3 apples in zone-objects | count-climb, cardinality | scene AND manifest call with identical (zone-objects, 3, {target:160}) → unit + positions; sub-floor forbidden. |
| Breathe (magic-fx #rule-6) | moving-hold on each cue's load-bearing group | all | apple row / card / glyph+quiet-apples; distinct phaseSeeds; amplitudeScale 0.005. |
| motion-vocabulary / PopIn | named curves + entrance variants | all | EASE.* per moves; snap for apples/tags; bouncy ONLY for the cardinal glyph (one climax). |

## Anti-patterns refused (terse)
- Tag **and** a highlight ring on the same apple (count-on single-signal, kids-eye §2): the tag is the SOLE count mark; sunshine/ring NOT used.
- On-screen takeaway line restating the spoken total (duplication sin): the caption ribbon carries the voice; only the cardinal glyph 3 + ribbon.
- Chrome header / section frame / mascot / grass-sky: none (cream + apples + ink).
- Cross-fade for the identity-bearing "3": migrate+rescale ONE glyph, never fade-out/fade-in.
- Color/shape change across count-climb→cardinality: apples stay reward-orange; the "3" stays textNavy.
- Re-rendering the apples per cue: one countable-object row instance lives the lesson; cardinality QUIETS them, never reshapes.
- Two pictures stapled (before/after split): the picture is ONE continuous count → one migrating total.
- Decoration emphasis (sparkle/pulse) anywhere except the ONE cardinal-glyph bouncy settle-pop.
- Frame or raw-motion literals in scene code; chrome-labels; readable content under anything (title alone first; tags/glyph sit above apples in their own zones; caption band reserved no-go).
- Apples overlaid on the title (announce-topic binding): the title sequence reads alone FIRST; apples enter at count-climb start.
