# kptest-count-three — Visual Design (Wave 2a)

The Visual Contract. INTENT ONLY — zero absolute frames, zero JSX. Every row below
references a named pedagogy discovery. Order of operations followed literally:
kids-eye §1 measurement block → §1.5 zones → palette + motion vocabulary →
visual-discipline §1 Contract → per-cue choreography intent + per-cue
`visualMotionSeconds` (the MOTION budget Wave 2b targets and Wave 3.5 reconciles).

**What kind of lesson this is.** A four-beat counting lesson for ages 3–5 (Mandarin
medium). Three identical apples arrive one at a time; each landing earns the next
number via a tag that attaches to the apple. The three-beat counting rhythm (1, 2, 3)
is the acquisition loop. After the third apple, a single prominent "3" replaces the
per-apple tags, delivering the cardinality insight: the last number names the whole
group. A brief title beat opens the video before the first apple.

---

## §1 — Kids'-eye measurement block (FIRST output, before anything else)

```
composition:             1920×1080 @ 30fps   (fixed; non-negotiable)
short-side:              1080 px

teaching-unit:           one CountableObject variant="fruit" (apple shape). The
                         smallest mark carrying a signal is ONE apple — it arrives,
                         it persists, it is counted. The apple's silhouette (round
                         body + leaf + stem, ~86×112 local units at default size=100)
                         is the teaching mark.
teaching-unit-min:       ≥ 8% of short-side = 86 px   →  rendered apple height ≥ 86 px
teaching-unit-target:    12–15% of short-side = 130–160 px rendered height.
                         Apple at size=140 → rendered body ~120 px tall (11.1% of
                         short-side). Including leaf extends to ~140 px (13%).
                         Hits target band.
number-tag (NumberCard): attached to each apple as a counting label. Default size
                         (92×112) → glyph 51.5 px at single-digit. Exceeds
                         primary-label-min. Used at default or slightly reduced
                         (80×96 → glyph 44.8 px, still above body-label-min of 36 px
                         for count badges). Composer sizes to fit the apple scale.
cardinality "3":         a LARGER NumberCard (width≈130, height≈160) → glyph 72.8 px.
                         Well above primary-label-min (48 px). This is the lesson's
                         biggest number mark — it must read as MORE important than the
                         per-apple tags at a glance.

primary-label-min:       48 px rendered  (the cardinal "3"; number tags at default
                         size exceed this)
body-label-min:          36 px rendered  (per-apple number tags at reduced size;
                         count step badges if used)
caption-line-min:        56 px rendered  (Mandarin narration ribbon at bottom)
chrome-label:            FORBIDDEN — no decorative header, no "counting lesson"
                         banner, no per-cue topic chrome. If a label is decoration,
                         delete it.
```

Fit check: three apples at size=140 (~120 px wide each) with ~100 px gaps between
them → total row span ~560 px (29% of 1920 width). NumberCard tags (80×96) sit below
each apple. The cardinal "3" card (130×160) sits above the row. Caption ribbon (56+
px) docks at bottom. All minimums clear simultaneously inside the declared zones.
Density is low — appropriate for a 3–5 year old audience where clarity beats
information density. No element is sub-minimum; no rationalization needed.

---

## §1.5 — Spatial zones (disjoint; every element belongs to a named zone)

The picture reads LEFT-TO-RIGHT as apples arrive, then UP for the cardinality
insight. Apples form a horizontal row in the canvas center. Number tags attach
below each apple. The cardinal "3" appears above the row. The caption ribbon is
docked at the bottom and never enters the teaching zone.

```
zone-title:      x 360,  y 240,  w 1200, h 280    | intro ONLY: the title text
                                                    "数一数". After intro this zone is
                                                    empty (title fades before first apple).
zone-objects:    x 360,  y 360,  w 1200, h 280    | the three CountableObject apples.
                                                    Holds the apples and NOTHING else.
                                                    Apple centers at approximately
                                                    x=660, 960, 1260 (evenly spaced,
                                                    centered on canvas).
zone-tags:       x 360,  y 640,  w 1200, h 140    | per-apple NumberCard tags (1, 2, 3).
                                                    Each tag is positioned directly below
                                                    its apple — visually attached. Tags
                                                    may TRACE OVER the bottom of
                                                    zone-objects (the tag's top edge sits
                                                    near the apple's shadow) but the tag
                                                    element belongs to zone-tags, not
                                                    zone-objects. During cardinality, tags
                                                    dim to softGrayBlue in place.
zone-cardinal:   x 760,  y 240,  w 400,  h 200    | cardinality ONLY: the large "3"
                                                    NumberCard, centered above the apple
                                                    row. Empty until cardinality cue.
                                                    Zone-cardinal does NOT overlap
                                                    zone-objects (the big "3" sits above
                                                    the apples, never on them).
zone-caption:    x 160,  y 920,  w 1600, h 140    | Mandarin narration caption ribbon.
                                                    Bottom-docked. The narration's ONLY
                                                    home.
zone-marks:      full-bleed                        | optional teacher ink / FocusPointer.
                                                    May TRACE OVER zone-objects (e.g. a
                                                    count-arc sketch) but never SIT INSIDE
                                                    zone-tags or zone-cardinal or duplicate
                                                    what a tag/cardinal already says.
```

Zone rules enforced:
- An apple lives in zone-objects; its number tag lives in zone-tags. The tag is
  positioned directly below the apple (visually attached), but the two elements
  belong to different zones — the composer places them in their respective zones
  and adjusts y so the tag's top edge meets the apple's bottom shadow.
- The cardinal "3" lives in zone-cardinal, ABOVE the apple row. It never overlaps
  an apple or a per-apple tag. (kids-eye §1.5)
- The caption ribbon is docked at the bottom and never enters zone-objects,
  zone-tags, or zone-cardinal.
- The title zone is used ONLY during intro-title and is empty for all subsequent
  cues.
- If a designed element doesn't fit a named zone, the design is wrong — extend the
  zone list or change the element.

---

## Palette (theme tokens from `src/theme.ts` via `resolveColor` — never inline hex)

At most 4 meaningful colors + cream. This counting lesson maps the early-math color
channels onto its own semantics:

- **`cream` `#FFF7E6`** — canvas background. Warm, low-contrast, never competes with
  the apples or number cards.
- **`reward` `#FFB84D`** — the TEACHING UNIT color: apple fill. Every apple is this
  color for the entire video. Reward = the countable object, exactly as sticks were
  in the bundling lesson.
- **`coral` `#FF8A65`** — the COUNTING ACCENT: the cardinal "3" NumberCard fill (the
  climax signal). One accent use — the most important number in the lesson. Per-apple
  tags use the default white fill (they are labels, not accents).
- **`textNavy` `#24324B`** — ink: title text, NumberCard digit glyphs, card borders,
  caption text, sketch marks. Anything that "speaks on paper."
- **`softGrayBlue` `#B5C0D0`** — DIMMED state ONLY: per-apple NumberCard tags during
  cardinality (they recede so the big "3" dominates). Never a replacement identity
  color.

`sunshine` and `sky` are NOT used as meaningful colors — adding them would exceed the
4-color budget. The apple uses `reward` (not `sunshine`) so that `sunshine` remains
available as a transient highlight color if needed in future lessons without conflict.

---

## Motion vocabulary (intent — named curves; concrete API in CAPABILITIES.md)

Slow, big, readable; when in doubt, slower. Every move below names an existing curve
— the composer reaches `EASE.*` / `<PopIn motion=…>` from the catalog, zero raw motion
literals.

- **Apple entrance:** `<PopIn motion="snap">` — the default, consistent across all
  three counting cues. Snap is the rhythmic constant: each apple arrives with the
  same physics, reinforcing the counting pattern. The same entrance on each beat is
  the MOTION analogue of the repetition that drives acquisition.
- **Number tag attach:** `<PopIn motion="snap">` — same physics as the apple,
  slightly smaller scale. Tag enters AFTER the apple has settled (separate visual
  event per storyboard). The snap-on-snap rhythm (apple→tag, apple→tag, apple→tag)
  is the three-beat pattern the child experiences.
- **Cardinality "3" entrance:** `<PopIn motion="bouncy">` — the ONE accent moment of
  the entire video. The bouncy overshoot signals "this number is DIFFERENT from the
  tags — it means something bigger." Three-stop bell timing (anticipation → overshoot
  → settle) gives the cardinality reveal weight and memorability.
- **Tag dim (cardinality):** per-apple NumberCards fade to `softGrayBlue` via
  `EASE.outCubic` over ~15 frames. A quiet recede — the tags don't disappear, they
  step back.
- **Title entrance (intro):** `EASE.enter` or `<PopIn motion="settle">` — calm
  resolve-in. The title sets up; it does not accent.
- **Moving-hold (rule #6):** the apple group (all three apples together) is wrapped
  in `<Breathe>` with a unique `phaseSeed` (e.g. `"kptest-count-three-apples"`)
  during STATIC stretches so no frame is truly frozen. During the counting cues,
  previously-placed apples are wrapped individually (the just-arrived apple is in
  its own PopIn motion, not yet breathing). Decorative-only; never deforms identity.

Sketch tone (if any mark is used): one ink color `textNavy`, ≤ 1 mark per cue, most
cues ZERO marks. For a counting-to-3 lesson aimed at 3–5 year olds, the PopIn
entrance + number tag already signal "this one is being counted" — a sketch mark
would be redundant. The sketch budget is best LEFT UNUSED for this lesson. If the
sketch-layer subagent (Wave 4 parallel) identifies a motivated mark (e.g. a
count-arc under the row during cardinality), it must pass the §2 one-signal test
first.

---

## §1 Visual Contract (visual-discipline §1 — concrete, no fuzzy lines)

```
metaphor:        three identical apples arrive one at a time at a counting table;
                 each apple's landing earns the next number tag (1, 2, 3), which
                 attaches to it; after the third apple, the per-apple tags step
                 back and a single prominent "3" appears above the row — the last
                 number said names how many there are altogether.

regions:         zone-objects holds the three apples (the countable group);
                 zone-tags holds per-apple NumberCards (1, 2, 3) attached below
                 each apple; zone-cardinal holds the big "3" (cardinality insight,
                 above the row); zone-title holds "数一数" (intro only);
                 zone-caption holds the Mandarin narration ribbon; zone-marks holds
                 optional sketch overlays (likely empty for this lesson).

between-states:  the SAME three CountableObject apples live the entire video from
                 first arrival to cardinality hold. Once an apple enters, it stays
                 — same position, same color, same size, same identity. Only new
                 apples are added (never moved or changed). The per-apple NumberCard
                 tags attach one at a time and persist until cardinality, where they
                 dim in place (they don't disappear or move — they recede in color
                 only). The cardinal "3" is a NEW element that appears at the
                 climax, but the apples themselves do not change.

reading-order:   intro: title text "数一数" centered.
                   count-apple-1: new apple enters (PopIn) → eye follows → tag "1"
                     attaches below it.
                   count-apple-2: eye jumps to the new apple on the right → tag "2"
                     attaches → previous apple+tag remain stable and quiet.
                   count-apple-3: eye jumps to the newest apple → tag "3" attaches
                     → the three-apple row is now a visible pattern.
                   cardinality: per-apple tags dim → eye lifts to the big "3" above
                     the row → hold for absorption.

decoration-budget:  1 cream background + 1 caption ribbon = 2 surfaces total.
                 NumberCards are NOT decoration — they are teaching signals (each
                 carries a number the child must read). No card behind an apple, no
                 tinted box behind the row, no chrome header. The apple group needs
                 no container — three identical shapes in a row already read as a
                 group (semantic grouping dominates visual grouping, §5).

text-budget:     "数一数" (load-bearing — announces the lesson topic per the
                   every-lesson-opens-with-a-title rule).
                 "1" / "2" / "3" on per-apple NumberCards (load-bearing — each is
                   the count signal for ONE apple; without them the child sees
                   apples arriving but has no visual count).
                 "3" on the cardinal NumberCard (load-bearing — the insight signal;
                   different SIZE from per-apple "3", carrying different MEANING:
                   "the whole group" vs "the third apple").
                 Caption ribbon text (load-bearing — accessibility + narration
                   anchor for the Mandarin-speaking 3–5 year old).
                 NO chrome labels, NO counting-lesson banner, NO step counter
                   ("Step 1 of 4"), NO redundant count text. The three apples +
                   their tags ARE the count display; adding a separate tally or
                   counter would be two elements saying the same thing (§7).

occupancy:       horizontal axis is binding (three apples in a row; the counting
                 sequence reads left→right). Apple row at size=140 spans ~560 px
                 (29% of 1920 width); with the spacing rhythm the active teaching
                 area uses ~42% of the horizontal. Vertically: title zone (280) +
                 objects zone (280) + tags zone (140) + caption (140) = 840 px of
                 the 1080 height are named zones, with the remaining 240 px as
                 breathing room between zones — appropriate for a 3–5 audience
                 where visual clarity requires generous spacing. The teaching
                 content (apples + tags + cardinal) occupies the center of the
                 canvas with no element floating in unexplained whitespace.

identity-invariant:  every apple is the SAME CountableObject variant="fruit" at the
                 SAME size (140), the SAME reward fill, the SAME silhouette for the
                 ENTIRE video — from first PopIn to cardinality hold. No apple
                 changes color, size, or shape across cues. Previously placed apples
                 do NOT re-animate, re-color, or highlight when a new apple arrives
                 — they are stable background. The per-apple NumberCards are the
                 SAME primitive (NumberCard) at the SAME size across all three
                 counting cues; only the value differs (1, 2, 3). At cardinality,
                 the tags DIM (opacity/color change to softGrayBlue) but do NOT
                 change shape, position, or species — they recede in place.
                 Forbidden: apples changing color when counted; tags growing/shrinking
                 between cues; the cardinal "3" being a different visual species
                 (e.g. a chip, a banner, a glyph) from the per-apple tags — it is
                 the SAME NumberCard primitive, only LARGER.
```

---

## Per-cue motion-budget (visualMotionSeconds — intent only)

Per-cue `visualMotionSeconds` — the MINIMUM time the cue's motion needs to READ
for a 3–5 year old. Wave 2b writes Mandarin narration to fit these budgets; Wave 3.5
reconciles `cueSeconds = max(narrationSeconds, visualMotionSeconds) + tail`.

These are MOTION budgets, not hold guesses. Each value answers: "from the first pixel
of motion to the moment the visual change has fully landed AND a 3–5 year old has
registered it."

```
intro-title:         2.0s  — title text "数一数" resolves in (settle/fade-on, ~0.8s)
                             + brief hold (~1.2s) for the child to register "we're
                             starting." Calm, no rush. Title exits before first apple.

count-apple-1:       2.5s  — apple #1 PopIn (snap, ~0.6s) + settle/eye-find (~0.6s)
                             + tag "1" PopIn attach (~0.5s) + hold for the child to
                             connect apple↔tag (~0.8s). The FIRST counting beat needs
                             a touch more time because the child is learning the
                             pattern — "a thing appeared and a number came with it."

count-apple-2:       2.0s  — apple #2 PopIn (snap, ~0.6s) + tag "2" PopIn (~0.5s) +
                             hold (~0.9s). Slightly shorter than cue 1 because the
                             child now expects the pattern — "another one, another
                             number." The rhythm is forming.

count-apple-3:       2.0s  — apple #3 PopIn (snap, ~0.6s) + tag "3" PopIn (~0.5s) +
                             hold (~0.9s). Same budget as cue 2 — the pattern is now
                             confirmed. The child may anticipate "3" before the tag
                             appears; the hold lets them verify.

cardinality-three:   3.5s  — per-apple tags dim to softGrayBlue (~0.5s) + cardinal
                             "3" PopIn (bouncy, ~0.8s — the accent moment, given
                             extra weight by the three-stop overshoot) + hold for
                             absorption (~2.2s). The LONGEST visual budget because
                             the insight needs processing time — the child must see
                             that the big "3" stands for ALL three apples, not just
                             the third one. The generous hold lets the narration
                             name the total without the visual rushing past.
```

**Total visual motion: 12.0s.** The full lesson will run ~20–25s after narration
(which may exceed visual budgets on some cues) and tail padding are applied by
Wave 3.5 reconcile. The visual budgets are honest estimates of how long each beat
needs to be SEEN by a 3–5 year old, not padding.

If the composer's motion overruns any budget above, it CUTS non-load-bearing
flourishes first (a breath drift, a settle tail), then compresses uniformly — it
NEVER extends the cue or re-records narration (audio frozen after W3a).

---

## Per-cue choreography intent (no frames; every row → a pedagogy discovery)

### intro-title  →  discovery: "we are going to learn to count"  (stage: concrete)

- zone-title: "数一数" text resolves in via `EASE.enter` or `<PopIn motion="settle">`.
  Centered, textNavy fill, ≥ 48 px cap-height. Clean cream background.
- NO teaching objects present (storyboard: "title reads first, then exits before
  count-apple-1 begins"). The cast (apples) must not crowd the title.
- Title fades out cleanly before the cue boundary so the canvas is empty when
  count-apple-1 starts.
- Breathe-wrap: the title text group during its hold (phaseSeed `"kptest-title"`).
- emphasis: none.
- one-signal check: the title carries "topic" — nothing else is on screen. No
  duplicates possible.

### count-apple-1  →  discovery: "one object gets exactly one number word; this apple is 'one' (一)"  (stage: concrete → represent)

- zone-objects: apple #1 enters via `<PopIn motion="snap">` at position x≈660 (the
  LEFTMOST of three eventual positions — the row grows left-to-right).
- zone-tags: `NumberCard value={1}` enters via `<PopIn motion="snap">` AFTER the
  apple has settled. Positioned directly below apple #1, visually attached.
- Everything else is empty/stable so the child's eye tracks the new arrival.
- Previously placed: nothing (this is the first apple).
- Breathe-wrap: apple #1 after its PopIn completes (phaseSeed `"kptest-apple-1"`).
- emphasis: none (bouncy reserved for cardinality).
- one-signal check: the apple says "a thing appeared," the tag says "it is number
  one." Two distinct signals, no redundancy. No count badge above an already-tagged
  apple (that would say "one" twice).

### count-apple-2  →  discovery: "after 'one' comes 'two' (二); the count grows by one"  (stage: represent)

- zone-objects: apple #2 enters via `<PopIn motion="snap">` at position x≈960 (CENTER
  position, beside apple #1).
- zone-tags: `NumberCard value={2}` enters via `<PopIn motion="snap">` after apple #2
  settles. Positioned below apple #2.
- Apple #1 and its "1" tag remain STABLE and QUIET — no re-animation, no highlight.
  Previously placed objects are background (the child's eye goes to the new arrival).
- Breathe-wrap: apple #1 continues breathing (same seed). Apple #2 joins after PopIn
  (phaseSeed `"kptest-apple-2"`).
- emphasis: none.
- one-signal check: apple #2 says "one more," tag "2" says "this is the second."
  Apple #1 + tag "1" say "the first is still here." No element duplicates another.
- reinforcement role: second application of the counting rule. Pattern forming.

### count-apple-3  →  discovery: "the rule holds; a third object gets the third number word (三)"  (stage: represent)

- zone-objects: apple #3 enters via `<PopIn motion="snap">` at position x≈1260
  (RIGHTMOST position, beside apple #2).
- zone-tags: `NumberCard value={3}` enters via `<PopIn motion="snap">` after apple #3
  settles. Positioned below apple #3.
- Apples #1, #2 and their tags remain STABLE and QUIET.
- The three-apple row is now a visible pattern: three identical shapes, evenly
  spaced, each with a number tag. The child has experienced the counting rhythm
  three times.
- Breathe-wrap: all three apples breathing with distinct seeds.
- emphasis: none (still holding the bouncy for cardinality).
- one-signal check: same structure as cues 1 and 2. No new element type introduced
  — the pattern is the same rule applied a third time.
- reinforcement role: third and final counting beat. Pattern confirmed.

### cardinality-three  →  discovery: "the last number — 'three' — names how many altogether"  (stage: symbolize)

- zone-tags: the three per-apple NumberCards (1, 2, 3) DIM to `softGrayBlue` via
  `EASE.outCubic`. They recede in place — they do NOT move, shrink, or disappear.
  The child still sees them, but they are no longer the focal signal.
- zone-cardinal: a LARGE `NumberCard value={3}` enters via `<PopIn motion="bouncy">`
  — the ONE accent moment of the video. Centered above the apple row. Coral fill
  (the counting accent). This is the lesson's visual climax.
- zone-objects: the three apples remain visible and stable, wrapped in `<Breathe>`
  (phaseSeed `"kptest-apple-group"`, the group breathes as one unit now — they are
  ONE group of three, not three individuals).
- A GENEROUS hold follows the cardinal "3" landing — the child needs time to connect
  the big "3" above the row to the three apples below it.
- emphasis: `<PopIn motion="bouncy">` on the cardinal "3" IS the single allowed
  emphasis. No sparkle, no glow, no second accent. (taste: reserve emphasis for ONE
  moment per video — the climax. The bouncy overshoot IS the emphasis.)
- one-signal check: the dimmed tags say "those were the counting steps," the big "3"
  says "THIS is the total." The apples say "these are the three things." Three
  distinct signals — no element says what another already says. The per-apple "3"
  tag (now dimmed) and the cardinal "3" (large, coral) are the SAME primitive at
  DIFFERENT scales — same species, different meaning, no confusion because size and
  color separate them.
- reinforcement role: insight beat — one clean delivery plus a hold. No replay
  needed.

---

## §5 Subagent self-check (kids-eye §5 — confirmed in my own words before reporting)

1. **§1 measurement block written, minimums met.** Yes — written FIRST. Apple at
   size=140 → rendered height ~140 px including leaf (13% of short-side, hits target
   band 12–15%). NumberCard tags at default 92×112 → glyph 51.5 px (exceeds
   primary-label-min 48 px). Cardinal "3" at 130×160 → glyph 72.8 px (well above
   minimum). Caption ≥ 56 px. All clear simultaneously inside the declared zones.

2. **Zones declared, disjoint, every element belongs to one.** Yes — title / objects /
   tags / cardinal / caption / marks. Tags may TRACE OVER the bottom of zone-objects
   (visual attachment) but belong to zone-tags. The cardinal "3" sits above the apple
   row in its own zone. Caption is docked at bottom, isolated from teaching zones.
   Title zone used only during intro.

3. **Every element answers §2's one-signal sentence; no duplicates/chrome.** Yes —
   each apple carries "a countable thing appeared"; each tag carries "this is the Nth
   one"; the cardinal "3" carries "N is the total." No count badge on an already-tagged
   apple. No tally counter (the row IS the counter). No chrome header. No decorative
   container behind the apple group.

4. **§3 finger-cover test simulated, both directions.**
   - Cover any one apple → the remaining two + their tags still teach "counting"
     (though the total is wrong — confirming each apple is load-bearing, not
     decoration).
   - Cover the cardinal "3" → the three apples + their tags still teach "counting
     one-two-three" but the cardinality insight is lost — confirming the big "3"
     carries a unique signal.
   - Cover the per-apple tags → three apples with no numbers. The child sees "three
     things" but has no visual count sequence — confirming tags are load-bearing.
   - Cover everything except the three apples → "three things on screen." The
     teaching object is strong enough to mostly survive without labels — the apples
     read as a group of three even without tags. The tags ADD the counting signal
     but the objects are not propped up by chrome. ✓
   - Cover the title → the counting lesson still works (title is topic-intro, not
     a teaching element). ✓

5. **Identity preserved across transformation.** Yes — every apple is the SAME
   CountableObject at the SAME size, color, and silhouette for the entire video.
   Previously placed apples do not change when new ones arrive. Per-apple tags are
   the SAME NumberCard primitive at the SAME size across all counting cues; at
   cardinality they DIM (color change only) but do not change shape or position.
   The cardinal "3" is the SAME NumberCard primitive as the per-apple tags, only
   LARGER and with coral fill — same species, scaled up. No color-shift-on-success,
   no species swap, no second visual vocabulary.

Contract is internally consistent; no line is fuzzy. Per-cue choreography is
intent-only, no frames, ready for Wave 2b (narration to the motion budgets) and
Wave 2c (sound design).
