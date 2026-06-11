---
name: kids-eye
description: Viewer-first discipline for early-childhood Remotion lesson scenes. Before any choreography or JSX, the subagent must inhabit the kid's eye — measure how the smallest teaching mark and the smallest label actually render at the composition size, declare disjoint visual zones, refuse decoration. Pairs with visual-discipline (contract mechanics) and early-childhood-visual-taste (color/tone).
---

# Kids' Eye

`visual-discipline` enforces layout mechanics. `early-childhood-visual-taste` sets palette and tone. This file enforces **viewing**: the discipline of designing for the eye of a six-year-old, at the actual composition size, before any frame of motion is choreographed.

It exists because subagents keep producing scenes that pass the layout rules but **a child cannot see**. Symptoms: a label rendered on top of the bundle it names (or, inversely, a cast character pasted on top of the title text — see §1.5 z-order legibility); ten gray ticks meant to represent "ten ones" but reading as a barcode; a "tied bundle" that looks like a rod impaling sticks because no one tested whether the rope reads as a rope.

The root failure is not implementation. It is that the subagent never put itself inside the kid's eye. It added elements because it had props. It used the canvas as a stage instead of as a viewing distance.

**Read this BEFORE you write the Visual Contract in `visual-discipline` §1.** This file decides whether the contract you are about to write can ever succeed for the actual viewer.

## 1. Compute the kid's-eye measurement block FIRST

Your **first** output for any new or redesigned scene must be this block, in plain text, before the Visual Contract, before any per-cue choreography. The numbers must be measurements, not adjectives.

```
composition:             1920×1080 @ 30fps   (fixed; non-negotiable)
short-side:              1080 px

teaching-unit:           <name of the smallest mark that carries a signal — e.g. "single 小棒">
teaching-unit-min:       ≥ 8% of short-side = 86 px   →  <px figure if larger>
teaching-unit-target:    12–15% of short-side = 130–160 px

primary-label-min:       48 px rendered  (signal labels: "一个十", "10 步", takeaway lines)
body-label-min:          36 px rendered  (counts, badges)
caption-line-min:        56 px rendered
separation-gap-min:      ≥ 6% of short-side = 65 px  (readable gap between two co-present clusters when the object SPLITS — below this they read as one blob)
chrome-label:            FORBIDDEN — if a label is decoration, delete it
```

If the teaching unit + primary labels cannot fit at these minimums inside the 1920×1080 frame *with the declared zones below*, your scene density is wrong. Drop elements or simplify the metaphor. Do not ship at sub-minimum sizes and rationalize it ("readable enough" is a rationalization, not a defense).

Run this fit-check on the **densest** cue — the worst split / multiplicity, not just the whole row — and at the **delivery resolution**: the co-present clusters PLUS `separation-gap-min` between them must fit the binding axis at the minimum unit size. A split that does not clear the gap floor at delivery size is a sub-minimum render (the two groups read as one blob) — redesign, do not rationalize.

## 1.5. Declare the spatial zones

Right after §1's measurement block, declare the disjoint spatial zones of the picture in plain text. Any element that floats over the teaching-object area (a label, a badge, a tally, a caption, a sketch mark) must live in a **named zone** that does NOT overlap the object zone.

```
zone-objects:    <bounding box x,y,w,h>  | holds: sticks / bundle. NOTHING ELSE.
zone-badges:     <bounding box>          | holds: count step indicators above objects
zone-labels:     <bounding box>          | holds: 一个十 / takeaway / inline names. Never inside zone-objects.
zone-tally:      <bounding box>          | holds: step-tally pills
zone-caption:    <bounding box>          | holds: caption ribbon at bottom
zone-marks:      full-bleed               | sketch marks. Marks may TRACE OVER zone-objects (e.g. wrap-arc) but never SIT INSIDE zone-labels.
```

What this enforces:
- A label and the object it names use the **same idiom across all cues** — the label always lives in `zone-labels`, never floats into `zone-objects`. The composer cannot accidentally overlap them because the zones forbid it.
- An optional element can never use "place near the bundle" to position itself. It lives inside its declared zone and anchors there.
- If a designed element doesn't fit any of the named zones, the design is wrong — extend the zone list explicitly or change the element.

**Disjoint is COMPUTED, not asserted.** Before you write "disjoint", compute the pairwise bounding-box intersection of every pair of zones that can be CO-PRESENT in the same cue — each such intersection MUST be empty (show the px arithmetic, at the delivery frame). A zone whose box sits inside or overlaps a co-present zone's box is an automatic FAIL — move the coordinates apart; do not stamp "disjoint" on overlapping numbers. Overlap is permitted ONLY between zones that are never on screen together (time-disjoint); when you allow one, name the cue each zone is active in so the time-disjointness is auditable. A question / prompt / label zone that intersects the teaching-object zone while both are on screen is the canonical occlusion bug (the prompt text landing on the dots).

Overlap of a label and its referent (`一个十` rendered ON the bundle) is not a layout bug; it is a missing zone declaration.

**Z-order legibility — the general law (runs in BOTH directions, for ALL readable content).** Not just labels-over-objects: **nothing readable is ever occluded by anything drawn on top of it — text most of all.** A decorative element (a cast character, a prop, a sticker, a 3D card) may never sit over a title, a caption, a label, a read-along phrase, or the teaching glyph. When two zones would overlap, the one carrying readable content wins z-order — the other moves to its own zone, or the two are **sequenced in time** so the readable one reads first/alone (the intro title reads *before* the cast enters — the `announce-topic` move's `requires` in `.agents/TEACHING-ACTIONS.md`). Note: the linear collision manifest can MISS this when the occluder fades in over the text (it samples a low-opacity keyframe and sees no overlap), so this is a **design-time discipline**, not something to leave to the gate.

## 2. One element, one unique signal

Before you add any element to the picture, complete this sentence:

> "This element carries **<signal X>**, which is **not yet** carried by **<existing elements Y, Z>**."

If you cannot complete the sentence, the element is decoration. Delete it.

Most common failures in our lessons:
- A count badge above a stick that's already highlighted active. The highlight already says "this one is being counted." Drop the badge or drop the highlight — not both.
- A label `一个十` next to a bundle when a sketch arrow already points label → bundle. Pick one signal carrier.
- A "10 步" tally below a row of 10 visibly-counted sticks. The sticks count themselves; the tally is redundant unless it persists into the next cue as a comparison anchor.

Two elements saying the same thing in different formatting is the single most common cheap-component failure.

## 3. The finger-cover test (run before approving any primitive or scene region)

Before declaring a primitive or a cue done, simulate covering each element with a finger:

- **Cover any one element.** Does the picture still teach? If yes, that element was either redundant or decoration. Delete it (or merge its role into another element).
- **Cover everything except the central teaching object.** Does the lesson still mostly survive? If no, the teaching object is too weak and you have been propping it up with chrome. **Redesign the teaching object — do not add more chrome.**

This is the test that catches "bundle reads as rod" failures: cover the badges and labels and ask, *with only the bundle visible, does a 6-year-old see "tied together"?* If not, the bundle primitive is wrong. Fix the primitive, not the surrounding scene.

## 4. Identity preserved across transformation

When a scene shows a transformation — 10 ones → 1 ten, 5 + 2 → 7, scattered → bundled — the units before and after must be **the same primitive with the same tone, only composed differently**.

Forbidden:
- 10 flat gray strokes on the left, 10 colored sticks bundled on the right. The kid sees three unrelated pictures with an arrow between them, not one transformation.
- A row of sticks "becoming" a single number chip or a different shape. The chip is a different visual species; the kid cannot see "these became that."
- Color changing across the transformation for no semantic reason (calm gray "before," celebratory orange "after"). Color is a semantic channel; transformation is not a celebration.

Required:
- If the primitive library carries the right object, **compose it**. 10 `<SmallStick tone="reward">` snap together inside a `<BundleWrap>` — same color, same stick silhouette, just composed.
- If the library does not yet carry the primitive, **extend it before drawing the scene**. Do not freestyle a one-off SVG inside the lesson scene.
- The "before" (10 ones row, e.g. dimmed for the contrast cue) and the "after" (1 ten bundle) must share at minimum: the same stick tone, the same edge treatment, the same unit silhouette. The only allowed differences are count, layout, scale, and opacity. Color hue change is forbidden. Shape change is forbidden.

## 5. Subagent self-check (run before reporting back)

Before any visual-touching subagent (visual-design, sketch-layer, primitive-builder, composer) reports back, confirm in its own words:

1. The kid's-eye measurement block from §1 has been written, and every measured number meets the minimums.
2. The zones from §1.5 are declared, disjoint, and every scene element belongs to a named zone — and no readable content (title, label, caption, read-along, teaching glyph) is occluded by any element drawn over it (§1.5 z-order legibility), checked across the cue's motion, not just one keyframe.
3. Every element answers §2's sentence. No duplicates, no chrome.
4. The §3 finger-cover test has been simulated — both directions (cover each, cover all-except-teaching-object).
5. If the scene shows a transformation, identity is preserved across it (§4).

If any of the five fails, redesign the contract — do not patch the choreography. Patching choreography against a broken contract is how lessons reach Round 5 still cheap.

## 6. The "two pictures, one teaching object" override

If a cue would render as two side-by-side pictures with chrome between them ("left card, bridge, right card"), stop. That layout is a confession that the metaphor failed — two pictures were found and stapled together instead of one picture for the teaching object.

A real transformation has **one** picture that moves through states. The middle "bridge" is the motion itself, not a third panel. Either:
- compose the before/after from the **same** primitives so the eye reads continuity (§4), or
- collapse to a single state that shows the result + the operation that produced it (e.g. don't show "10 ones vs 1 ten" side-by-side — show "10 sticks bundling into 1 ten" as a single motion the kid already watched, with a single highlight on the resulting bundle).

If neither is possible, the metaphor is wrong. Replace it.

## 7. Where this discipline lives in our pipeline

- **In visual-design (Wave 2).** §1 measurement block + §1.5 zones are the FIRST text the visual-design subagent emits — before per-cue choreography. The visual-discipline Visual Contract block comes second.
- **In primitive-gap-scan (Wave 3).** Every NEW primitive concept must include a finger-cover note: "what does this primitive carry that nothing else does? does it read as <teaching-unit-name> to a 6yo at 130 px wide?"
- **In composer (Wave 4).** The composer's self-critique step verifies the scene against the contract — same zone discipline, same finger-cover test against a still frame of the climax.
- **NOT in the orchestrator alone.** The orchestrator picks the metaphor and approves the contract; the subagents enforce the discipline against it. Discipline applied after JSX is written has already lost.

## 8. Final rule

The scene is what the kid sees, not what the props describe. If a kid cannot see the teaching unit clearly at 1920×1080, the scene does not exist — no matter how many primitives are composed or how clean the JSX reads. Design the picture for the eye that will actually look at it. Then write the JSX that draws it.
