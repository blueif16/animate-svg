# kp1-hello-greetings — Visual Design (Wave 2a)

The Visual Contract. INTENT ONLY — zero absolute frames, zero JSX. Every row below
references a named pedagogy discovery. Order of operations followed literally:
kids-eye §1 measurement block → §1.5 zones → palette + motion vocabulary →
visual-discipline §1 Contract → per-cue choreography intent + per-cue
`visualMotionSeconds` (the MOTION budget Wave 2b targets and Wave 3.5 reconciles).

**What kind of lesson this is.** This is a SPOKEN-ROUTINE language lesson, not an
early-math counting lesson. The "teaching unit" is not a countable — it is a *routine
performed in its real moment* (greet / name-self / part), surfaced two ways the kid's
eye can hold: (a) the speaking kid + the wave gesture, and (b) the speech bubble whose
short English utterance is swept by a moving read-along highlight. The kids-eye minimums
below are therefore reframed onto the SMALLEST signal-bearing marks of THIS lesson: the
read-along letter/word glyph and the bubble text. The math-specific examples in the
skills (sticks, bundles) do not apply; their DISCIPLINE does, unchanged.

---

## §1 — Kids'-eye measurement block (FIRST output, before anything else)

```
composition:             1920×1080 @ 30fps   (fixed; non-negotiable)
short-side:              1080 px

teaching-unit:           a spoken-routine utterance, surfaced as the read-along
                         highlight sweeping the English phrase the speaking kid says
                         (Hello! / Hi! / I'm Sam. / Goodbye! / Bye-Bye!). The smallest
                         signal-bearing mark is ONE swept word/segment inside that phrase.
teaching-unit-min:       the swept English phrase text ≥ 8% of short-side per glyph row
                         = 86 px cap-height MINIMUM. At ~8 chars the phrase row spans
                         well over 50% of the horizontal axis — comfortably above floor.
teaching-unit-target:    swept-phrase cap-height 12–15% of short-side = 130–160 px.
                         The "I'm" segment in intro-self is modeled BIGGER than its
                         neighbors (held + swelled by ReadAlongHighlight activeScale) so
                         the one hard sound is the largest mark in the lesson at its beat.

speaking-kid figure:     the two identity-invariant kid faces (GAP-2). Each face ≥ 12%
                         of short-side = ~130 px radius-equivalent so a 6yo reads it as a
                         PERSON, not a dot, and reads WHICH of the two is speaking.

speech-bubble:           caller-supplied rounded bubble-with-tail (DialogueExchange).
                         Its English text rides the teaching-unit minimum above; the
                         bubble box is sized so the text never falls below 86 px.

primary-label-min:       48 px rendered  (the intro title line; the recap arc labels
                         "meet / name / part" framing, if used as on-screen text)
body-label-min:          36 px rendered  (nameCard under a kid, e.g. "Sam"; section teaser)
caption-line-min:        56 px rendered  (Chinese teacher-narration caption ribbon —
                         load-bearing for the Mandarin-speaking learner; this is the
                         narration's home, NEVER the English answer)
chrome-label:            FORBIDDEN — no decorative headers, no "English lesson" banner,
                         no per-cue topic chrome. If a label is decoration, delete it.
```

Fit check: the two kid figures (~260 px wide each) + a speech bubble (~520 px) live
side-by-side in the 1920-wide frame with the caption ribbon docked at the bottom — all
minimums clear simultaneously inside the declared zones. Density is correct: at most
two bubbles visible at once (DialogueExchange caps to the two most-recent), two kids,
one caption. Nothing is sub-minimum; no rationalization needed.

---

## §1.5 — Spatial zones (disjoint; every element belongs to a named zone)

The picture is read LEFT-TO-RIGHT IN TIME (one encounter: meet → name → part → recap).
Left kid lives on the left, right kid on the right; bubbles open ABOVE their speaker so
a bubble never sits on a face. The Chinese narration caption is docked at the very
bottom and never enters the figure or bubble zones.

```
zone-stage:      x 0,   y 120,  w 1920, h 720   | the encounter stage. Holds the TWO
                                                  kid figures + their speech bubbles.
                                                  This is the "object" zone — the routine
                                                  is performed here. NOTHING textual that
                                                  isn't a spoken utterance lives here.
zone-kid-left:   x 360,  y 430, w 320, h 360    | the LEFT kid figure + optional nameCard.
zone-kid-right:  x 1240, y 430, w 320, h 360    | the RIGHT kid figure + optional nameCard.
                                                  (the two kid zones are disjoint and
                                                  ~880 px apart — they read as two PEOPLE
                                                  with room to wave and lean toward each
                                                  other, never overlapping.)
zone-bubble-left:  x 300, y 150, w 560, h 300   | the LEFT kid's speech bubble, opening
                                                  ABOVE-and-toward-center, tail pointing
                                                  down at zone-kid-left. Never over a face.
zone-bubble-right: x 1060,y 150, w 560, h 300   | the RIGHT kid's speech bubble, mirror.
zone-title:      x 260, y 200, w 1400, h 420    | intro ONLY: the topic-intro title card
                                                  (title + Unit 1 "Hello!" teaser). After
                                                  intro this zone is empty (the card has
                                                  resolved out / handed off to the stage).
zone-readalong:  x 360, y 760, w 1200, h 140    | the ReadAlongHighlight phrase row — the
                                                  trackable spoken form. Sits BELOW the
                                                  stage, ABOVE the caption. In recap it
                                                  holds the three phrases stacked as the
                                                  beginning→middle→end arc.
zone-caption:    x 160, y 940, w 1600, h 120    | Chinese teacher-narration caption ribbon.
                                                  Bottom-docked. The narration's ONLY home.
zone-marks:      full-bleed                      | optional teacher ink / FocusPointer +
                                                  the two allowed PulseCircle emphasis
                                                  rings. May TRACE OVER zone-stage (e.g. a
                                                  pointer toward the speaking kid) but
                                                  never SIT INSIDE zone-readalong/zone-title
                                                  or duplicate what a label/highlight says.
```

Zone rules enforced:
- A speech bubble and the face it belongs to use the SAME idiom every cue: bubble in its
  `zone-bubble-*`, tail pointing down at its `zone-kid-*`. The composer cannot overlap
  text-on-face because the zones forbid it. (kids-eye §1.5)
- The English answer NEVER appears in `zone-caption`; the Chinese narration NEVER appears
  in `zone-bubble-*` or `zone-readalong`. This is the pedagogy §4 division of labor made
  spatial: the picture (bubble + read-along) delivers English, the ribbon frames the
  moment in Chinese. If the two ever shared a zone the picture would become decoration.
- The recap arc lives in `zone-readalong` (the three phrases), NOT as three new cards in
  `zone-stage` — the two kids STAY on stage so the arc reads as THEIRS.

---

## Palette (theme tokens from `src/theme.ts` via `resolveColor` — never inline hex)

At most 4 meaningful colors + cream. This language lesson re-maps the early-math channels
onto its own semantics (no sticks/rope here), staying within the 4-color budget:

- **`cream` `#FFF7E6`** — canvas background. Warm, never competes with the kids or bubbles.
- **`reward` `#FFB84D`** — the SPEAKING accent: the active speaker's wave + their bubble
  fill tint / read-along active-highlight. "This kid is talking right now / this is the
  word being said." (the teaching-unit color, exactly as sticks were in math.)
- **`coral` `#FF8A65`** — the EMPHASIS accent, reserved for the ONE hard sound: the
  `intro-self` "I'm" PulseCircle ring + its swelled read-along segment, and the closing
  recap punctuation pulse. Coral = "pay special attention to THIS beat." (the transient
  action-accent, as rope was in math — here the action is "say it carefully.")
- **`textNavy` `#24324B`** — ink: all text (bubble English, captions, nameCards, title),
  bubble outlines, read-along inactive glyphs, sketch marks. Anything that "speaks on paper."
- **`softGrayBlue` `#6B7280`** — DIMMED state ONLY: an older bubble that DialogueExchange
  has demoted (no longer the two most-recent), or a not-yet/already-swept read-along glyph
  fading back. Never a replacement identity color for a kid or a phrase. (kids-eye §4.)

`sunshine` and `sky` are NOT used — adding them would be a 5th/6th meaningful color and
signal decorating, not teaching. The kid faces (GAP-2) carry their own on-palette skin/
hair fills authored by W3b within these tokens; they are fixed identity, not a meaning
channel, so they do not consume the 4-color budget (same status as the cream background).

---

## Motion vocabulary (intent — named curves; concrete API in CAPABILITIES.md)

Slow, big, readable; when in doubt, slower. Every move below names an existing curve —
the composer reaches `EASE.*` / `<PopIn motion=…>` / `<PulseCircle>` from the catalog,
zero raw motion literals.

- **Bubble entrance:** `<PopIn motion="bouncy">` (DialogueExchange already composes this) —
  the bubble pops in ON the wave, three-stop bell timing, reads as speech arriving. The
  "bouncy" accent is justified per-bubble because each is a discrete spoken event, not a
  counted rhythm; it is NOT the once-per-video accent — the two PulseCircles are.
- **Speaker lean / bob + wave gesture:** DialogueExchange's `gesture:'wave'` + lean toward
  the other kid, driven by named `EASE.*` (the component owns this) — the routine PERFORMED
  in its moment (pedagogy "concrete" stage for meet/part).
- **Read-along sweep:** `ReadAlongHighlight` advances the active glow item-by-item via its
  derived cursor, `EASE.outCubic` per step; the active segment swells (`activeScale`). For
  "I'm" the single weighted `beats[]` entry holds longer and swells more — the one hard
  sound is the slowest, biggest sweep in the lesson.
- **Title card resolve-in (intro):** the topic-intro card (GAP-1) settles via its own
  entrance (`EASE.enter` / `PopIn motion="settle"`), calm — it sets up, it does not accent.
- **Emphasis pulses (the ENTIRE emphasis budget — exactly 2):** `<PulseCircle>` in coral,
  fired ONCE on "I'm" (`intro-self`, via DialogueExchange `emphasis:true`) and ONCE as the
  closing recap punctuation. No sparkle, no glow, no third pulse anywhere. (taste two-pulse.)
- **Moving-hold (rule #6):** each cue's primary load-bearing group (the speaking kid +
  active bubble, or the read-along row) is wrapped in `<Breathe>` with a unique `phaseSeed`
  during its STATIC stretches so no frame is truly frozen. Decorative-only; never deforms
  identity. Distinct seeds per group (e.g. `"kp1-kid-left"`, `"kp1-kid-right"`,
  `"kp1-readalong"`).

Sketch tone (if any mark is used): one ink color `textNavy`, ≤ 1 mark per cue, most cues
ZERO marks. A `FocusPointer` toward the speaking kid is the only likely mark, and only if
the wave + bubble do not already make "this one is talking" obvious (run the §3 test first).

---

## §1 Visual Contract (visual-discipline §1 — concrete, no fuzzy lines)

```
metaphor:        one tiny encounter between the SAME two kids at the school gate —
                 they meet and greet, one names herself, they part — and the three
                 English phrases are the three MOMENTS of that single meeting, not a
                 flashcard list. The picture (kid + wave + bubble) SAYS the English; the
                 Chinese narration only NAMES each moment.

regions:         zone-stage holds the two kids + their bubbles (the routine performed);
                 zone-bubble-* hold each spoken English utterance; zone-readalong holds
                 the trackable spoken form (sweeping highlight; in recap the 3-phrase arc);
                 zone-title holds the intro topic card (intro only); zone-caption holds the
                 Chinese teacher narration; zone-marks holds the ≤2 pulses + optional pointer.

between-states:  the SAME two kid figures live the WHOLE video (intro → recap), only their
                 gesture/lean and which bubble is up change. Bubbles accumulate then demote
                 (only the two most-recent stay lit; older dim to softGrayBlue). The three
                 phrases said across meet/intro-self/part are RECALLED in order at recap —
                 same phrases, now lined up as one arc. Identity is the two kids + each
                 phrase's text staying the same mark when it returns.

reading-order:   intro: title card → the two kid faces settling beneath it (cast reveal).
                 meet-hello: LEFT kid → her wave → her "Hello!" bubble pops → read-along
                   sweeps the greeting.
                 intro-self: RIGHT kid → his reply bubble "Hi! I'm Sam." → the coral pulse
                   on "I'm" → read-along swells "I'm" as ONE held unit.
                 part-goodbye: BOTH kids → both waves → the farewell bubbles → read-along
                   sweeps the farewell.
                 recap: the three phrases in zone-readalong, beginning→middle→end, the two
                   kids still present → the closing coral punctuation pulse.

decoration-budget:  1 cream background + 1 caption ribbon = 2 surfaces total. The speech
                 bubbles are NOT decoration — they are the teaching-unit container (a
                 bubble carries one spoken utterance; that is its semantic role). Kid
                 nameCards are a 3rd surface ONLY on the cue that introduces a name
                 (intro-self → "Sam"); elsewhere no nameCard. No card behind a kid, no
                 tinted box behind a bubble, no chrome header.

text-budget:     intro title line (load-bearing — announces the topic per CLAUDE.md
                   every-lesson-opens-with-a-title rule); Unit 1 "Hello!" section teaser
                   (load-bearing — places the lesson in the unit); the English utterances
                   in bubbles (load-bearing — they ARE the routine, delivered by the
                   picture); the read-along phrase glyphs (load-bearing — the trackable
                   spoken form, the "count display" for sound); "Sam" nameCard (load-bearing
                   ONCE — binds the name to the kid at intro-self; do NOT repeat the name as
                   a caption — the bubble already says "I'm Sam", the card names the person,
                   one fact each, no within-card duplication); Chinese caption ribbon
                   (load-bearing — accessibility + the moment-framing for the Mandarin
                   learner). NO chrome labels, NO "English" banner, NO per-cue topic text.
                   The English answer is NEVER duplicated into the caption (pedagogy §4).

occupancy:       horizontal axis is binding (the encounter is read left→right in time and
                 the two kids span the width). The two kids + the active bubble + the
                 read-along row together occupy well over 50% of BOTH axes at every teaching
                 cue — the stage is not a tiny figure in a wide empty canvas; the two kids
                 anchor the left and right thirds and the bubble/read-along fill the center
                 and lower band. Vertical: stage (≥720) + read-along (140) + caption (120)
                 spend the height top-to-bottom. No whitespace acting as decoration.

identity-invariant: the TWO kid figures are the same primitive (GAP-2 faces) at the same
                 tone, the same silhouette, the WHOLE video — intro through recap, whether
                 waving, leaning, or quiet. No kid is recolored/reshaped/swapped across
                 cues. Each English PHRASE is the same text mark when it returns at recap as
                 when first spoken (meet/intro-self/part) — recall, not a new species. The
                 "I'm" segment is the same read-along unit at intro-self and at recap, only
                 swelled at its emphasis beat. Forbidden: a flashcard-style different card
                 per phrase at recap (that would read as three separate words, breaking the
                 "one encounter" identity); a second/contradicting visual vocabulary for
                 the recap arc vs the live exchange.

motion-budget:   per-cue visualMotionSeconds — the MINIMUM time the cue's motion needs to
                 READ for an 8yo. Wave 2b writes Chinese narration to fit these; Wave 3.5
                 reconciles cueSeconds = max(narrationSeconds, visualMotionSeconds) + tail.
                 (NOTE: these are MOTION budgets, intent only — NOT hold guesses, NOT frames.)

                 intro:        3.0s  — title card resolves in (write-on / settle) + the two
                               kid faces appear quiet beneath it as the cast. Calm, no rush;
                               the child reads "today's job" + meets both kids.
                 meet-hello:   2.5s  — left kid's wave gesture + her "Hello!" bubble pops in
                               on the wave + the read-along sweeps the short greeting. One
                               wave, one bubble, one short phrase swept — needs to land
                               unhurried but it is brief copy.
                 intro-self:   4.0s  — the LONGEST teaching cue: right kid reply bubble
                               "Hi! I'm Sam." pops + ONE coral PulseCircle on "I'm" + the
                               read-along swells "I'm" as a single HELD unit, modeled BIG
                               and SLOW (pedagogy key_difficult). The held "I'm" beat plus
                               the surrounding phrase sweep is what costs the extra time —
                               never rush this one.
                 part-goodbye: 3.0s  — BOTH kids wave + begin to move apart + the
                               "Goodbye!" / "Bye-Bye!" bubbles pop on the waves + read-along
                               sweeps the farewell. Two waves + the gentle part motion read
                               a touch longer than the single-speaker greet.
                 recap:        3.5s  — the three phrases line up in order (sweep across the
                               three rows OR the three bubbles recalled) as beginning→middle
                               →end, the two kids staying present, closing with ONE coral
                               punctuation pulse. The arc needs time to read as ONE
                               connected sequence, not three flashes.
```

If the composer's motion overruns any budget above, it CUTS non-load-bearing flourishes
first (a wave bob, a breath drift), then compresses uniformly — it NEVER extends the cue
or re-records narration (audio frozen after W3a). These budgets are honest estimates of
how long each routine needs to be SEEN, not padding.

---

## Per-cue choreography intent (no frames; every row → a pedagogy discovery)

### intro  →  discovery: "today's job + meet the two kids"  (stage: represent)
- zone-title: topic-intro card (GAP-1) resolves in — lesson title + Unit 1 "Hello!" teaser.
- zone-stage: the TWO kid faces (GAP-2) appear quiet beneath the card as the cast — same
  two figures reused every later cue. Calm settle, no wave, no bubble yet.
- NO English target word shown yet (storyboard: intro only sets topic + cast).
- emphasis: none (pulse budget untouched). Breathe-wrap the title group during its hold.
- one-signal check: the title carries "topic", the two faces carry "cast" — distinct
  signals, neither duplicates the other.

### meet-hello  →  discovery: "greeting = Hello!/Hi!, said AT meeting"  (stage: concrete)
- zone-kid-left: LEFT kid waves (`gesture:'wave'`), leans toward center.
- zone-bubble-left: her "Hello!" / "Hi!" bubble pops in ON the wave (caller line node).
- zone-readalong: ReadAlongHighlight surfaces THAT greeting phrase as it lands, swept so
  the child tracks and says it along.
- emphasis: NONE (storyboard: no pulse here). Breathe-wrap the left-kid+bubble group.
- one-signal: the wave says "she's greeting", the bubble says "with this word", the
  read-along says "track/say it" — three distinct signals, no redundancy.

### intro-self  →  discovery: "name-self = I'm ___; the sound /aɪm/ as ONE beat"  (represent)
- zone-kid-right: RIGHT kid replies, leans toward the left kid.
- zone-bubble-right: his "Hi! I'm Sam." bubble pops (caller line), `emphasis:true`.
- zone-marks: ONE coral `<PulseCircle>` fires on the "I'm" segment — pulse #1 of 2.
- zone-readalong: ReadAlongHighlight swells "I'm" as a SINGLE held unit (one weighted
  `beats[]` entry, weighted LONG) — never split into two ticks (match-the-spoken-count for
  sound, pedagogy). Modeled BIG and SLOW; this is the lesson's key_difficult.
- zone-kid-right (nameCard): "Sam" nameCard appears under the right kid (binds name↔person)
  — the ONE cue a nameCard is allowed; not repeated as caption.
- This is the lesson's accent beat — the largest, slowest mark; warm, not a correct-drill.

### part-goodbye  →  discovery: "farewell = Goodbye!/Bye-Bye!, said AT parting"  (concrete)
- zone-kid-left + zone-kid-right: BOTH kids wave (`gesture:'wave'`) and begin to move apart.
- zone-bubble-left / zone-bubble-right: the "Goodbye!" / "Bye-Bye!" bubbles pop on the waves
  (caller lines).
- zone-readalong: ReadAlongHighlight surfaces the farewell phrase as it is spoken.
- emphasis: NONE (storyboard: no pulse). Breathe-wrap the parting group during holds.
- closes the encounter that opened with meet-hello — same two kids, same idiom.

### recap  →  discovery: "the three phrases are ONE encounter's begin→middle→end"  (represent)
- zone-readalong: the three phrases lined up in order — meet (Hello) → name (I'm…) →
  part (Goodbye) — surfaced via ReadAlongHighlight across the three phrase rows (the same
  text marks recalled, NOT new flashcards).
- zone-stage: the two kid figures STAY PRESENT so the arc reads as THEIRS.
- zone-marks: ONE coral `<PulseCircle>` closing punctuation pulse — pulse #2 of 2 (the
  final allowed emphasis).
- identity: each recalled phrase is the same mark as when first spoken; the arc is one
  connected sequence, never three separate words to drill.

---

## §5 Subagent self-check (kids-eye §5 — confirmed in my own words before reporting)

1. **§1 measurement block written, minimums met.** Yes — written FIRST. The teaching unit
   is reframed for a language lesson (swept English phrase ≥ 86 px, target 130–160; "I'm"
   modeled largest). Kid figures ≥ 130 px so each reads as a person. Caption ≥ 56 px. All
   clear simultaneously inside the zones.
2. **Zones declared, disjoint, every element belongs to one.** Yes — stage / kid-left /
   kid-right / bubble-left / bubble-right / title / readalong / caption / marks. Bubbles
   open above their speaker (never on a face); English never enters zone-caption; Chinese
   never enters bubble/readalong (pedagogy §4 made spatial).
3. **Every element answers §2's one-signal sentence; no duplicates/chrome.** Yes — wave vs
   bubble vs read-along carry distinct signals; nameCard appears once and doesn't repeat
   the bubble's text; no chrome header; English answer never duplicated into the caption.
4. **§3 finger-cover test simulated, both directions.** Cover the caption → the wave +
   bubble + read-along still teach the routine (picture delivers English, by design). Cover
   everything except the two kids + active bubble → the encounter still mostly survives
   ("two kids meeting and speaking"), so the teaching object (the performed routine) is
   strong, not propped by chrome. Cover the read-along → the bubble still says it but the
   "track/say it along" affordance is lost — confirming read-along is load-bearing, not
   redundant. No element is decoration.
5. **Identity preserved across transformation.** Yes — the two kid figures are the same
   primitive/tone/silhouette intro→recap; each phrase is the same text mark when recalled
   at recap as when first spoken; "I'm" is the same read-along unit, only swelled at its
   beat. No flashcard-species swap at recap, no recolor-on-success, no second visual
   vocabulary for the arc.

Contract is internally consistent; no line is fuzzy. Per-cue choreography is intent-only,
no frames, ready for Wave 2b (narration to the motion budgets) and Wave 2c (sound design).
```
