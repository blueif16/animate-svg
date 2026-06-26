---
name: visual-discipline
description: Concrete visual discipline for Remotion lesson scenes — Visual Contract before choreography, one-metaphor rule, container earns existence, occupancy budget, semantic groups dominate visual groups, render-and-self-critique loop, iteration economy. Pairs with kids-eye (viewer-first) and early-childhood-visual-taste (color/tone).
---

# Visual Discipline

`kids-eye` enforces viewing. `early-childhood-visual-taste` sets palette and tone. This file enforces **what you do at your keyboard so the output actually teaches**.

It exists because subagents keep producing scenes that **look like a kids video** but do not **teach the math**. Symptoms: a label rendered ON the bundle it names; a "tied bundle" that reads as a horizontal rod; left/right comparison where the two sides use different visual vocabularies; sketch marks scheduled at frames that never play; whitespace acting as decoration.

If you are about to write the Visual Contract for a lesson (Wave 2 visual-design) or choreograph the scene (Wave 4 composer), follow this file literally.

## 1. Write the Visual Contract before any choreography

After the `kids-eye` §1 measurement block and §1.5 zones, output this block in plain text and stop. Do not start per-cue choreography until every line is concrete.

```
metaphor:        <one sentence — the single mental model of the whole video>
regions:         <each zone → what real-world or math thing it holds>
between-states:  <what visually moves / changes / persists across cues>
reading-order:   <eye lands on A, then B, then C — name elements per cue>
decoration-budget:  <max 2 stacked surfaces, max N meaningful colors>
text-budget:     <for each on-screen string: is it already implied by geometry / sequence / color / adjacency? if yes, drop NOW>
occupancy:       <which axis is binding; SHOW the arithmetic at the fullest cue — content ÷ its OWN axis length (a horizontal row is ÷ the canvas WIDTH, a vertical extent ÷ the SHORT-SIDE; NEVER divide a width by the short-side); use the kids-eye §1 composition (1280×720 per src/theme.ts `video`) as the denominator; teaching content occupies ≥ ~50% of the non-binding axis; if the binding axis is itself < ~50%, the object floats in an empty frame — grow it or widen the metaphor>
fit-check:       <densest cue FITS its ASSIGNED zone (not the canvas): N·unitSize+(N−1)·gap ≤ zone.w AND row x-extent ⊂ [zone.x, zone.x+zone.w] (vert. likewise vs zone.h); every co-present pair's gap ≥ separation-gap-min. Name the zone each number is measured against. See §4.>
identity-invariant: <what stays the same primitive across the transformation>
object-count:    <per cue: the number of teaching units present in each zone (e.g. dots: 6, cards: 2). The composer feeds (this count + the kids-eye §1.5 zone) to fitUnitsToZone to COMPUTE unit size + positions — so sizes are never hand-picked. State it per cue wherever a count changes; "0" for a cue with no countable. See CAPABILITIES.md#auto-size-to-zone.>
motion-budget:   <per cue: visualMotionSeconds — the MINIMUM time the cue's motion needs to land for a 6yo. e.g.
                  intro: 2.0s     (title write-on + mini-preview cycle)
                  fen-show: 2.0s  (cluster split eased to a stop)
                  fenheshi-intro: 4.5s  (sequenced migration + diagonals + settle)
                  ... per cue, NOT optional, NOT a hold guess.
                  Wave 2b narration is targeted to this budget. Wave 3.5 reconcile uses it as the visual side of max(narration, visual).>
```

If any line is fuzzy ("a friendly layout", "shows the change", "with some highlights"), the contract is not done. Tighten it. The Contract is the artifact upstream and downstream subagents read; vagueness propagates.

**The `motion-budget` line is load-bearing.** Wave 2b writes narration to fit it; Wave 3.5 reconciles each cue as `cueSeconds = max(narrationSeconds, visualMotionSeconds) + tail`. If you under-estimate visualMotionSeconds, the composer will be forced to rush the motion past readability. If you over-estimate, the cue holds in dead air past the audio. Be honest about how long the motion actually needs.

`visualMotionSeconds` must include **dwell/hold time** for the child to look at the result (per-item ≥2–3s; longer for harder items), not just the transition duration — and the lesson should land a **re-engagement beat every ~15–30s** so a long stretch of one move never goes static (basis: `research/teaching-tempo-pacing-2026-06-08.md`).

A correct contract for the `ten-ones-make-one-ten` lesson:

```
metaphor:        ten loose orange sticks gather and a single rope ties them into one bundle; the bundle is now called "1 ten"
regions:         zone-objects holds sticks (loose → row → bundle); zone-labels holds "一个十" / takeaway; zone-tally holds the 10-step / 1-step pills; zone-caption holds the narration ribbon
between-states:  the same 10 sticks live the whole video, only their layout changes (scatter → row → bundle). The rope appears at the climax and persists.
reading-order:   sticks → counting badges → tally → bundling motion → rope + bundle → label "一个十" → comparison → takeaway
decoration-budget:  1 cream background + 1 caption ribbon = 2 surfaces total. Stick orange, rope coral, ink navy, highlight sunshine = 4 meaningful colors.
text-budget:     "一个十" (load-bearing — names the new unit), "10 步" / "1 步" (load-bearing — the contrast), takeaway "十个一 = 一个十" (load-bearing — the moral), captions (load-bearing — accessibility). No chrome labels.
occupancy:       horizontal axis is binding (sticks → bundle moves horizontally); teaching unit (one stick) at ~96 px ≈ 13% of the 720 short-side, hits the kids-eye §1 target. Bundle uses ~720 px width, ~56% of the 1280-wide axis at the climax.
identity-invariant: every stick is a SmallStick at the same orange tone for the entire video, whether scattered, in a row, in a bundle, or dimmed in the comparison. No color changes across the transformation.
object-count:    zone-objects holds 10 sticks every cue (scatter → row → bundle is a relayout, not a recount); 1 bundle after the tie. The composer sizes them via fitUnitsToZone(zone-objects, 10).
```

## 2. The One-Metaphor Rule

A lesson video carries **one** visual metaphor. Pick it and discard the others.

Our first KP1 run failed §2 in two places:
- The "comparison" cue tried to be both "10 sticks vs 1 bundle" AND "old way snapshot vs new way bundle." Two metaphors. The eye reads it as "two unrelated pictures."
- The "tied bundle" tried to be both "a rope wrapping sticks" AND "a horizontal band across sticks." Two metaphors. Pick one — rope wrapping wins because it matches the kid's real-world mental model.

When you catch yourself reaching for a second metaphor, the first metaphor was wrong. Replace it, do not add to it.

## 3. Container Earns Its Existence

Every `border`, `background`, `borderRadius`, `boxShadow`, surface, pill, card, ribbon must answer: **what semantic role does this surface carry?**

If the answer is "it groups things that already group themselves" or "it makes it feel polished," delete it.

Allowed surface roles:
- distinguishes one teaching object from another (e.g. one tally vs another tally in a contrast cue)
- holds a state the rest of the screen does not (selected, active, dimmed)
- carries a reading affordance (caption ribbon, the takeaway emphasis box)

Forbidden:
- a card behind a stick that already has its own silhouette
- a tinted box behind the bundle that the bundle already announces with its tie
- decorative chrome around `一个十` that competes with the bundle for attention

**Layer budget:** at most two stacked surfaces between the canvas background and the teaching unit. Three is already wrong.

## 4. Occupancy: the canvas is a budget, not a stage

The 1280×720 canvas (kids-eye §1 / src/theme.ts `video`) is a budget that must be spent on the teaching object, not a stage with a tiny figure floating in the middle.

A scene that draws a 200 px bundle in the center of a 1280 px wide canvas with the rest empty is committing the same sin as a decorative container — the surrounding whitespace earned nothing. It reads as "the scene is too small for its canvas."

### Rules

- The teaching unit (a stick, the bundle) must size itself per the `kids-eye` §1 minimums and **grow** until it hits a real constraint — design-rhythm spacing to its neighbor, the metaphor's geometry, or the binding-axis bound.
- Audit occupancy IN THE CONTRACT (front-loaded, §9), with the px arithmetic shown — measure each axis against ITS OWN length (a horizontal row's occupancy is width ÷ the canvas WIDTH, NOT ÷ the short-side; the wrong denominator inflates an empty frame into a fake high %). On the **non-binding axis** the teaching content must occupy ≥ ~50%; a thin centered band with cream margins on the binding axis is whitespace acting as decoration — redesign or widen the metaphor, never defer it to a post-render audit.
- **FIT is checked against the ZONE; EMPTINESS against the axis — two different denominators, never confuse them.** The ≥50% emptiness rule above divides by the AXIS length. The OVERFLOW / fit rule divides by the content's **assigned ZONE box**: at the densest cue, `N·unitSize + (N−1)·gap ≤ zone.w`, and the placed row's x-extent must fall inside `[zone.x, zone.x + zone.w]` (vertical likewise vs `zone.h`). Quoting a span as a % of the full canvas while the content lives in a *narrower* zone is the classic miss — e.g. 10 sticks at 1170 px read as "91% of the 1280 canvas" yet overflow a 1040 px `zone-stage` by 130 px. **Always name the container each occupancy number is measured against**; an occupancy % whose denominator is not the zone that holds the content is void. And every **co-present** pair's gap must be ≥ the §1 `separation-gap-min` — DERIVE the zone boxes FROM that floor; never declare a zone gap that undercuts it (a 40 px gap under a 43 px floor is a self-contradiction). Self-check before you ship the Contract: for the densest cue, does `N·unit + (N−1)·gap` actually fit `zone.w`, and is every co-present gap ≥ the floor? If either fails, the geometry is wrong — fix the zone boxes, do not narrate it.

### When the canvas aspect fights the metaphor

If your metaphor forces a single tall bundle in a wide 1280×720 canvas with the rest blank, your metaphor and the aspect are mismatched. **Don't pad the metaphor with chrome to absorb the misfit.** Either widen the metaphor (e.g. add a paired tally that justifies the width) or pick a different metaphor.

## 5. Semantic Groups Dominate Visual Groups

If the math says "10 ones," the picture must show **10 ones grouped as one set**. The picture is allowed to scale, recolor (within identity), or relayout — but it is **never** allowed to reflow such that the visual grouping contradicts the math grouping.

Concrete failures to refuse:
- Reflowing 10 sticks into a 2-row 5×2 grid for a contrast cue when the math says "10 ones" — the kid reads the 2 rows as "two groups of 5," not "10 ones."
- Splitting the bundle midway through `still-ten-ones` so 5 sticks appear above the rope and 5 below — the math says "10 sticks tied together," the visual says "two halves of a bundle." Refuse.

Rule: if items have a single semantic identity (all "ones"), lay them out as one group. The grid can wrap, but a group never gets split across rows in a way that suggests a sub-grouping.

## 6. Color is a Semantic Channel, Not Decoration

Every meaningful color must answer **what does this color mean?**

For early-math lessons (palette per `early-childhood-visual-taste`):
- Stick/object orange = the teaching unit
- Rope coral = the bundling action / new-unit accent
- Ink navy = labels, marks, text — anything that "speaks"
- Highlight sunshine = "this one is being counted" (transient, never a persistent identity)
- Cream = canvas background

Never use a fifth meaningful color. Never repeat the same color for two different meanings. The container and the unit cannot both carry the meaning-bearing color — pick one channel for tone; the other is neutral.

## 7. Text Earns its Existence

Every visible string must carry information not already shown.

- A "10 步" pill below a row of 10 visibly-counted sticks is **load-bearing IF AND ONLY IF** it persists into the next cue as a comparison anchor. Otherwise it's redundant.
- A chrome header naming the lesson ("捆小棒练习") next to a video that already shows the bundling action is decoration. Drop it.
- The takeaway "十个一，就是一个十" IS load-bearing — it's the moral, the thing the child can repeat. Keep it.
- Captions are load-bearing for accessibility and ESL learners. Keep them.

Two strings saying the same thing in different formatting is the most common kid-component sin.

**Never duplicate the same information WITHIN a single component or card.** A number card shows its value once; a labeled tile does not repeat its label as caption; a focus card carries one piece of information, not the same fact twice. Decide the ONE thing each element communicates — redundant on-card text/number is noise, not reinforcement (Mayer redundancy/coherence). Example: a `<NumberCard value={5}>` already shows "5" — do not stack a "= 5" caption beneath it. **The same law holds across the whole screen, not just within a card: no on-screen text — a title or large label especially — restates the spoken caption line.** The spoken line lives only in the ribbon (the verbatim voice); on-screen text ADDS (names a new unit, points at a thing), it never echoes the caption. A big label repeating what the voice just said is the duplication sin at scene scale — cut it, or shrink it to a small pointed annotation (kids-eye §1.5).

## 8. Render and Self-Critique (mandatory for composer)

After Wave 4 composer writes the scene, the composer does not declare done from the JSX alone. It runs the loop:

1. Render **the single hardest frame** during iteration — usually the climax cue's mid-point and the comparison cue. Not the full video matrix; the hardest case fails first.
2. Take a screenshot via `npx remotion still` against the composition.
3. Grade the screenshot against the Visual Contract:
   - Is the metaphor legible at glance? (cover the captions — does it still teach?)
   - Does each visible element match its zone?
   - Does the eye land in the declared reading order?
   - Is the decoration budget respected?
   - Is any color or string doing double duty?
   - Is the teaching unit ≥ minimum size?
   - Is the identity-invariant respected across the transformation?
4. If any line fails, **redesign the failing region**. Do not patch with another wrapper. Do not lower the bar to match what you shipped.
5. Re-render. Re-grade. Stop only when the screenshot IS the contract.

If you cannot screenshot (no preview, no still command working), say so explicitly. Do not claim visual correctness from code inspection alone.

## 9. Iteration Economy

Each render-screenshot-grade round costs ~30s and ~3 tool calls. A 6-round design signals the contract was wrong. **Front-load the cost into the Contract (§1)** where it is cheap.

### Front-load the §3 / §4 / §7 audits

Round 0 (the Contract) is where decoration and chrome are cheapest to drop. Round 5 is where they are most expensive — you've already wired primitives, choreographed timing, hooked audio.

For your contract:
- every text-budget string → "implied by geometry / sequence / color / adjacency?" If yes, drop NOW.
- every region → "earns ≥ 50% of its non-binding axis?" If no, pick another metaphor NOW.
- every identity-invariant → "same primitive across the transformation?" If no, fix the contract NOW.

A correct Round 0 makes Round 1 work first try, with only minor tuning in Round 2.

### Defer the variant matrix

During iteration: ONE hardest frame.
At final delivery: the full sequence renders.

Iterating against the entire MP4 every round multiplies cost without changing decisions.

### Hard cap

- **Target:** 1 Contract round + 2 visual rounds = 3 rounds total.
- **Ceiling:** 5 rounds. If you hit 5, the contract was wrong. STOP. Rewrite the Contract with what you learned. Then ONE implementation round.
- 6+ rounds is not iteration; it's Contract debt being paid late.

## 10. Anti-pattern catalogue (refuse on sight)

- **Anything readable rendered under anything else.** A `一个十` label inside the bundle's bounding box — *or* a cast character / prop / card sitting over the title, a caption, or a read-along phrase. Nothing readable is ever occluded (text most of all): move the occluder to its own zone, or sequence it in time so the readable thing reads first/alone (kids-eye §1.5 z-order legibility). A fade-in occluder hides from the linear collision gate — refuse it at design time.
- **Two pictures stapled together.** A "10 ones vs 1 ten" comparison that uses different visual vocabularies on the two sides. Use the same primitive on both, only count/scale/opacity differ.
- **Frame literals.** Any number in scene code that isn't `cues[id].startFrame + offset` is a coordinate-space bug. Refuse.
- **Decoration "for emphasis."** A glow, a pulse, a sparkle on every cue. Reserve motion for the element that just changed. The climax gets ONE sparkle; the rest of the video earns its emphasis through composition, not effects.
- **Re-rendering the teaching unit per cue.** The 10 sticks live the whole video as one StickGroup instance. Destroying and recreating them per cue breaks continuity.
- **Treating the caption ribbon as a resizable / suppressible surface.** The ribbon is an INDEPENDENT channel: it ALWAYS shows the verbatim voice, in full, through the whole cue window — sized to the voice, never shrunk to a text-budget guess and never suppressed to make room for a label. Lay every other element out *around* it; the band is a reserved no-go (kids-eye §1.5).
- **Three nested gradients / surfaces.** Two stacked surfaces is the budget.

## 11. Final rule

The scene IS the picture, not the JSX. If the picture does not teach without the labels (cover the captions, cover the labels — does the bundling motion still teach "10 ones → 1 ten"?), the JSX is wrong. Redesign the picture, then write the JSX that draws it.
