# node: w2a-visual-design — GOLD CRITERIA (the QUALITY bar above the floor)
<!-- JUDGE / OPTIMIZER-FACING. Consumed by the verify-chain judge, the optimize loop's triage, and the
     human eye. NEVER injected into w2a-visual-design's runtime prompt — seeing the bar teaches-to-the-
     test and voids the clean-room signal (the same law as memory.md and the skill-system criteria).
     Authored via the method in piflow-overlord/references/building-measures.md. Maintenance = the
     optimize/enhance loop (piflow-triage names defects here; piflow-fixer never reads this file). -->

## What this file is (read before judging)

The **hard floor is a PRIOR, separate stage** — `measure/visual-design-lint.mjs` (wired via this node's
`optimize.measure`, and the `non-empty` gate in `node.json checks.post`) already confirms: the artifact
exists and is non-empty; it is under the LEAN char-ceiling (or is flagged if not); every zone declared
disjoint is ARITHMETICALLY disjoint (or the pair that isn't, is named); every storyboard cue is addressed
somewhere in the document. A Visual Contract that fails any of those never needs to reach this file for a
verdict — it is already a floor defect. **None of the marks below is a schema, existence, or arithmetic
check** — those already ran. This file judges the four things code cannot: whether the METAPHOR actually
holds, whether IDENTITY genuinely survives a transformation (a semantic/tone claim, not a geometry one),
whether the MOTION BUDGET is an honest forecast, and whether this Visual Contract sets up a video a
6-year-old will actually watch and understand — or has already foreclosed that outcome.

## 1. What w2a-visual-design is, and its LEVERAGE on the eventual video

**Core responsibility.** w2a-visual-design reads `storyboard.md` (the ordered cues, each tagged with a
teaching action and a required-visual note) and `pedagogy.md` (each beat's discovery) and writes ONE
artifact, `visual-design.md`: the kid's-eye measurement block, the disjoint spatial zones, the palette +
motion vocabulary, the Visual Contract (metaphor / regions / identity-invariant / occupancy), the per-cue
choreography with a `visualMotionSeconds` motion-budget, a reuse-primitive table, and a terse anti-pattern
list. It designs no code and no absolute frames — it is the single node that decides HOW the lesson will be
SEEN, before any of the timing, voice, primitive, or scene-code work begins.

**Expected outcome.** A Visual Contract precise enough that W4a/W4b (composer/sketch) can execute it
literally with no design judgment left to make, W3b (primitive-builder) knows exactly which primitives are
genuinely new, and W2b (audio-captions) + W3.5 (reconcile) can trust the per-cue `visualMotionSeconds` as the
honest floor for how long each cue's motion needs to read.

**Leverage on video quality (the one sentence that seeds every soft criterion).** *If w2a's Visual Contract is
subtly wrong-but-valid — zones asserted disjoint that are not, a metaphor that quietly splits into two
pictures for a comparison cue, an identity-invariant broken exactly where it matters, or a motion-budget that
lowballs what a 6-year-old actually needs to see the motion land — every downstream node (narration pacing,
reconcile timing, primitive-builder, composer, sketch) inherits and bakes in that flaw, with no mechanism to
catch it until a rendered frame shows a child-illegible video — by which point voice recording, timing
reconciliation, and scene code have all already been built on the broken spec.* w2a emits one markdown file,
but it is the highest-leverage node between "what the lesson teaches" (w0/w1) and "what gets rendered"
(w3-w5): it sets the ceiling every downstream node builds under.

**A concrete instance of this leverage, found while authoring these measures.** The real
`ten-ones-make-one-ten/visual-design.md` run (a documented "REDO" that explicitly set out to fix a prior
label-on-bundle occlusion) still declares `zone-tally` at `y=460..520` while also declaring `zone-objects`
at `y=180..480` and `zone-labels` at `y=500..610` — a genuine 20px overlap on BOTH sides, despite the
document's own S6 self-check narrating "zones declared, disjoint... PASS" for every pairing. The self-audit
prose was wrong; only the arithmetic (now the hard `zone-disjoint` check) catches it. This is exactly why
disjointness is a HARD measure and never a soft one, and exactly why Law 4 (quotable evidence) matters even
for the floor: a model's own narrated self-check is not evidence, computed geometry is.

## 2. HARD measures (the FLOOR — deterministic; wired in `node.json optimize.measure`)

Reused for free (zero new code): the `non-empty` post-check already in `node.json`; `deriveStatus`
existence/fill; the `return` schema (`node`/`status`/`outputArtifacts`/`summary`/`pipelineFindings`
required); the trace detectors (`thinkingStalls`/`toolLoops`/`tokenWaste`/`truncatedLines`) and digest
anomalies (`mega-think`/`slow`/`tool-loop`/`cost-spike`/`retries`) via `piflowctl telemetry`; and
`piflowctl trace`'s blind-spot + re-read rollup — did the node actually read `storyboard.md` /
`pedagogy.md` / `catalog-digest.md` (its declared `readScope`/`inject`), or did it re-read (over-think)?

The one thin wrapper, `measure/visual-design-lint.mjs` (report-only, always exits 0 — this is a HARD signal
only, QUALITY stays here), runs three checks a JSON schema cannot express:
1. **char-ceiling** — the LEAN ARTIFACT rule (prompt.md: "Target <= 13k chars"). `warn` at >13,000 chars,
   `severe` at >20,000. Validated against the real `ten-ones-make-one-ten` run (30,305 chars → `severe`)
   and the real `kp2-counting-by-tens` run (9,445 chars → `ok`) — it fires on the known-bad case and stays
   quiet on the known-good one.
2. **zone-disjoint** — parses every declared `zone-*` box (both the code-fence and the markdown-bullet
   formats observed in real runs) and computes pairwise AABB intersection, excluding `zone-marks` (the one
   explicitly full-bleed, trace-over-permitted zone per kids-eye S1.5). Validated against the same two real
   runs: `kp2-counting-by-tens` → `pass` (6 boxed zones, 0 overlaps); `ten-ones-make-one-ten` → `fail`,
   correctly naming the `zone-objects`/`zone-tally` and `zone-labels`/`zone-tally` overlaps above.
3. **cue-coverage** — every `## `/`### ` cue heading in `storyboard.md` (excluding ledger/summary headings)
   must appear somewhere in `visual-design.md`. Validated against both real storyboards — full coverage on
   both (9/9 and 8/8 cues addressed).
A bonus advisory (never blocking) counts second-value tokens against cue count as a coarse proxy for "did
every cue get a stated `visualMotionSeconds`."

**FAIL-CLOSED (2026-07-09 harden — read this before trusting a `report.ok:true`).** All three checks now
fold into the report's `ok`, and none can silently pass on an unresolved input: `char-ceiling` `severe`
(>20k) is a hard fail, not just an advisory; `zone-disjoint` reports `parse-fail` (a hard fail, not a
vacuous pass) whenever a declared zone name never resolves to a box or too few zones parsed to run the
pairwise check at all — a genuinely computed overlap still wins as `fail`; `cue-coverage` reports `fail`
(never a silent `skipped`) when `--storyboard` is missing/unreadable or parses zero cue headings, and a
cue only counts as covered if at least one mention carries real per-cue content — a bare name-drop glued
next to another cue name in a list (no real content between them) does not count.

**Honestly NOT hard (left to the soft judge below):** whether the metaphor is genuinely singular, whether
identity survives a transformation in more than geometry, whether a stated motion-budget number is a
believable forecast, whether every pedagogy discovery is served by a *specific* visual choice, and whether
the occupancy arithmetic uses the right denominator — all of these require reading MEANING, not just parsing
numbers.

## 3. The CHECKLIST — coverage (did the output ENGAGE each dimension at all?)

Run this FIRST, before grading. Not the graded bar; asks only *"did the Contract engage this dimension,
yes or no?"* — an omission is the cheapest, commonest defect and this is what surfaces it.

- [ ] **Worst-case fit** — the S1 measurement block is checked against the DENSEST cue (the worst split/
  multiplicity), not an average or a single easy cue.
- [ ] **Zones are a true partition** — every on-screen element (label, badge, tally, mark, caption) is
  assigned to exactly one named zone; nothing is positioned "near" something instead.
- [ ] **One metaphor, no exceptions** — the SAME mental model governs every cue, including any
  comparison/contrast cue.
- [ ] **Identity survives transformation** — the primitive, tone, and silhouette used in the "before" state
  are still the ones used in the "after"/comparison state; only count/scale/opacity/layout differ.
- [ ] **Every element earns its existence** — no element duplicates a signal another element already
  carries (kids-eye SS2's "carries signal X" sentence can be completed for each one).
- [ ] **Motion-budget is cue-specific** — the stated `visualMotionSeconds` varies with what the cue's
  motion actually has to do, not a single number copy-pasted down the table.
- [ ] **Reuse is disciplined** — every cited primitive is checked against the real catalog; a genuinely new
  one is named as a W3b hand-off, not silently assumed.
- [ ] **Every pedagogy discovery lands on a named visual choice** — not merely "the cue exists," but a
  specific element/motion is named as the thing that carries that discovery.
- [ ] **Occupancy uses the right denominator** — a stated occupancy % is measured against its OWN axis and
  its ASSIGNED zone, never the wrong axis or the whole canvas when the content lives in a narrower zone.
- [ ] **Lean, not padded** — every rule is stated once; no self-audit/checklist prose lives inside the
  artifact body.

## 4. The CRITERIA / RUBRIC (graded; Required = R, Aspirational = A)

**Aggregation.** All Required marks (C1, C2, C3, C4, C5, C7, C8) must PASS for a *sound* Contract — miss one
and the Contract is not good, revise it. The Aspirational marks (C6, C9) are the discriminators that
separate a correct, compliant Contract from one that sets a real ceiling for a great video; a good run is
*expected* to stall on them (SS5 Calibration note).

**How to score.** PASS requires quotable evidence in `visual-design.md` — the exact line, number, or named
cue. No quote, no PASS. Judge only what is observable in the artifact; never credit unstated intent.

### C1 · Metaphor singularity — no cue stages "two pictures stapled together" (**R**)
**PASS** — the whole video, INCLUDING any comparison/contrast cue, reads through one consistent mental
model; a comparison cue reuses the identical primitive/tone/silhouette on both sides, differing only in
count/scale/opacity. Quote the Contract's `between-states` (or equivalent) line proving the comparison cue
shares primitives with every other cue.
**FAIL** — a comparison/contrast cue introduces a second visual vocabulary (e.g. a different shape, a
repainted color standing in for "the same object, dimmed") — the exact historical defect this node's REDO
was written to fix ("10 gray strokes on the left vs orange bundle on right").

### C2 · Identity-invariant genuinely holds under transformation (**R**)
**PASS** — quote the sentence establishing that the SAME primitive, at the SAME tone, carries every state of
a transforming object; only count, scale, opacity, and layout are permitted to vary, and the Contract says so
explicitly for the specific transformation this lesson performs.
**FAIL** — a color hue change stands in for "before/after" or "dimmed," a different primitive silently
substitutes for one side, or the invariant is asserted generically ("identity is preserved") without pinning
it to THIS lesson's actual transforming object.

### C3 · Motion-budget is an honest, cue-specific forecast (**R**)
**PASS** — each `visualMotionSeconds` value is justified by what that cue's motion must actually accomplish
(transition + DWELL, not transition alone); the climax/densest cue is budgeted above a simple fade; a
re-engagement beat appears roughly every 15–30s across the sequence, not bunched at the start or absent.
Quote one cue's stated seconds and the choreography it must cover to justify that number.
**FAIL** — a flat, near-identical budget is applied regardless of a cue's complexity (a placeholder number);
the climax is under-budgeted relative to its own described choreography; or no cue past the midpoint
provides a re-engagement beat.

### C4 · Every pedagogy discovery is served by a NAMED visual choice (**R**)
**PASS** — for each Beat/discovery in `pedagogy.md`, the Contract or per-cue choreography names the SPECIFIC
element or motion carrying it. Quote the discovery and the element paired to it.
**FAIL** — a discovery is only implicitly covered (the cue exists, but nothing is named as carrying it), or
two discoveries collapse onto one generic element so neither reads clearly.

### C5 · Reuse discipline — no invented primitive where the catalog already serves (**R**)
**PASS** — every cited primitive/prop/variant is checked against `catalog-digest.md`'s real inventory; a
genuinely NEW primitive is named explicitly as a W3b hand-off, with a stated reason nothing existing serves.
**FAIL** — the Contract assumes a primitive or prop that isn't in the catalog without flagging it as new
(forcing W3b to discover the gap the hard way), or proposes a new primitive where an existing one with a
different prop would already serve.

### C6 · The climax is precise enough that two composer runs would look the same (**A**)
**PASS** — for the single hardest cue (the climax, or the densest comparison), the Contract pins the exact
phase-by-phase micro-sequencing — what fades/moves when, relative to what, in what order — tightly enough
that the composer has no meaningful staging decision left to invent. Quote the phase breakdown.
**FAIL** — the climax is described only at the "what happens" level ("sticks bundle, rope appears") with the
WHEN and the ORDER left to the composer's improvisation — complete, but under-specified exactly where
precision matters most.

### C7 · LEAN without loss — dense, not padded (**R**)
**PASS** — no rule is restated in two places; no self-audit/checklist/finger-cover-result prose appears
inside the artifact body (those live only in the structured return + the tier-2 log, per prompt.md); every
table row/line earns its space. Quote a rule that is stated exactly once and cross-referenced elsewhere,
never repeated.
**FAIL** — a rule already established upstream (or earlier in the same document) is restated; the artifact
carries an internal "Self-check: ✓ PASS" narrative walking through each element one by one — the char-ceiling
hard measure catches gross overflow, but this catches the specific historical failure mode even when an
artifact happens to land under the ceiling: a verbose per-element self-audit section that restates, for each
of a dozen-plus elements, the same "carries signal X — PASS" judgment already implied by the Contract itself.

### C8 · Occupancy honestly measured against the right denominator (**R**)
**PASS** — a stated occupancy percentage divides the teaching content by its OWN axis length (width÷width,
height÷height), against the zone that actually holds it — never the whole canvas when the content lives in a
narrower zone, and never the wrong axis. Quote the arithmetic.
**FAIL** — an occupancy % is computed against the wrong denominator (visual-discipline SS4's named classic
miss: "10 sticks at 1170px read as 91% of the 1280 canvas yet overflow a 1040px zone by 130px") — inflating
an actually-thin composition into a falsely "full" one.

### C9 · Evidence the child, not just the checklist, was considered (**A, the aspirational apex**)
**PASS** — at least one choreography decision reflects a non-obvious accommodation for the actual child
viewer beyond the stated floor minimums — e.g. an explicit re-engagement beat placed to counter a
predictable attention dip, a deliberate simplification traded against a richer-but-riskier layout, or a named
legibility accommodation beyond the px floors. Quote the decision and the child-specific reasoning behind it.
**FAIL** — every choreography decision is mechanically derivable from the floor rules and the storyboard
alone — competent and fully compliant, but with no evidence anyone reasoned about the viewing child beyond
satisfying the checklist.

## 5. Calibration note — which marks a typical current good run is expected to FAIL

A typical good Contract reliably clears the fidelity-and-hygiene cluster — **C1 (metaphor), C2 (identity),
C4 (discovery-coverage), C5 (reuse discipline), C8 (occupancy)** — because these are the failures the
existing skill files (kids-eye, visual-discipline) were written to fence after being found in real runs
(the label-on-bundle occlusion, the gray-vs-orange identity break). It is *expected to stall* on **C3
(honest per-cue motion-budget, as opposed to a plausible-looking flat number), C6 (climax precision), C7
(true leanness, as opposed to merely-under-the-char-ceiling), and C9 (evidence of child-specific reasoning)**
— these are the discriminators: the marks that separate "technically correct and compliant" from "actually
sets up a video a 6-year-old will watch and understand." When a run clears all nine, that cluster is what
changed, and that is the signal a genuinely great Contract was produced.

## 6. GOLD — an annotated exemplar (off-distribution, so the judge calibrates on the bar, not the answer)

> A Visual Contract for a lesson unlike any current test case — a shape-recognition lesson, not a
> counting/bundling one — condensed to the essence (not full length). Read it, then the quote-map.

**Given pedagogy (condensed):** Beat 1 — discovery: a shape is named a triangle by counting exactly 3
straight sides, not by how "pointy" it looks. Beat 2 — discovery: the SAME counting method, applied to a
4-sided shape, names it a square — the method generalizes, it isn't a triangle-only trick. Beat 3 —
discovery: a shape's side-count stays the same no matter its size, rotation, or color — the count IS the
identity, not the shape's appearance.

```
composition:             1280x720 @ 30fps
short-side:              720 px
teaching-unit:            single edge-highlight tick (marks one counted side)
teaching-unit-target:     96 px tick length = 13% of short-side
primary-label-min:        48 px    (the name: "三角形" / "四边形")
body-label-min:           36 px    (the running count badge: 1, 2, 3...)
chrome-label:             FORBIDDEN
```
```
zone-shape:      x=340, y=140, w=600, h=400   | holds: the ONE shape being counted. NOTHING ELSE.
zone-count:      x=340, y= 60, w=600, h= 70   | holds: the running side-count badge.
zone-label:      x=340, y=560, w=600, h= 70   | holds: the shape's name once counting completes.
zone-caption:    x=  0, y=640, w=1280, h= 80  | holds: caption ribbon.
zone-marks:      full-bleed                    | tick marks trace each counted edge; may cross zone-shape.
```
```
metaphor:           one shape at a time gets its edges counted, tick by tick, and the tick-count IS its name
between-states:     the SAME ShapeOutline primitive (same navy stroke, same fill) is reused for the
                    triangle in Beat 1 and the square in Beat 2 — only vertex-count and size differ; a
                    later "same triangle, rotated + shrunk + recolored" cue reuses the identical primitive
identity-invariant: every counted shape is a ShapeOutline at colors.textNavy stroke / colors.reward fill,
                    whatever its rotation, size, or accent color — the tick-count, never the appearance,
                    is what the child is asked to trust
occupancy:          zone-shape is the binding non-binding axis: the shape spans 520/600 = 87% of zone-shape's
                    width (not the 1280 canvas — the shape is deliberately smaller than full-frame so the
                    count badge above it has room to breathe)
```
| Cue | visualMotionSeconds | Choreography |
|---|---|---|
| count-triangle | **6.0s** — 3 ticks at 1.5s dwell each (a 6yo needs to SEE each tick land before the next) + 1.5s hold on the completed count | tick 1 draws on an edge (0–1.5s, hold), tick 2 (1.5–3.0s, hold), tick 3 (3.0–4.5s, hold), badge reads "3" and freezes (4.5–6.0s) — no two ticks draw concurrently |
| name-triangle | **3.0s** | the name "三角形" fades into zone-label directly below the completed 3-tick shape; a single sketch arrow ties badge "3" to the name (load-bearing: THIS is what makes "3 sides" mean "triangle") |
| count-square-generalize | **7.0s** — one extra tick over count-triangle's budget, because the discovery here is "the method repeats," which needs the SAME unhurried 1.5s-per-tick dwell one more time to land, not a compressed replay | same primitive, same tick cadence and per-tick dwell as count-triangle, now 4 ticks; re-engagement beat: badge briefly pulses "just like before!" between tick 3 and tick 4 to bridge the two beats |
| identity-check | **4.5s** | the SAME triangle from count-triangle re-enters rotated 40 degrees, at 70% scale, in a different accent color; ticks re-count 1-2-3 at the SAME 1.5s dwell; the name "三角形" reappears unprompted — proves the count, not the look, decided it |

**Anti-pattern list (terse):** no chrome header naming the lesson · no second shape competing for attention
while one is being counted · no tick appears without a spoken/count-badge correspondent · never recolor the
identity-invariant shape to signal "different" — rotation/scale/accent-color only.

| # | Mark | The line that earns the PASS |
|---|------|------------------------------|
| C1 | Metaphor singularity | Every cue — including `identity-check`, the closest thing to a comparison — reuses the same `ShapeOutline` primitive; there is no second vocabulary anywhere. |
| C2 | Identity-invariant | `identity-invariant` names the SAME primitive/stroke/fill across rotation, scale, and accent-color changes, and `identity-check`'s choreography exercises exactly that: rotated 40°, 70% scale, different accent color, same triangle. |
| C3 | Honest motion-budget | `count-square-generalize` is budgeted ONE full extra tick-dwell (7.0s vs 6.0s) over `count-triangle`, with the reasoning stated ("the discovery here is 'the method repeats,' which needs the SAME unhurried dwell") — not a copy-pasted number. |
| C4 | Discovery -> named choice | Beat 3's discovery ("the count IS the identity, not the shape's appearance") is carried by the *named* `identity-check` cue and its specific rotate/scale/recolor choreography — not merely "a cue exists for Beat 3." |
| C5 | Reuse discipline | `ShapeOutline` is asserted reused across all four cues with zero new primitives named — the table cites one primitive doing all the work, not four look-alikes. |
| C6 | Climax precision | `count-triangle`'s row pins the exact non-concurrent tick sequence (0–1.5, 1.5–3.0, 3.0–4.5, then a hold) — a composer cannot invent a different order or overlap the ticks and still match the row. |
| C7 | Lean without loss | The whole Contract states each rule once (the identity-invariant sentence is never repeated in the per-cue table; the table instead cites "same cadence as count-triangle" rather than re-explaining the dwell rule) — no self-audit section appears. |
| C8 | Occupancy denominator | `occupancy` explicitly names `zone-shape` (not the full 1280 canvas) as the denominator and states the percentage against it — "520/600 = 87% of zone-shape's width." |
| C9 | Child-specific reasoning | `count-square-generalize`'s re-engagement pulse ("just like before!") is a NAMED accommodation for the specific risk that a second, longer counting sequence right after the first will read as repetitive rather than a confirmed pattern — not something the floor rules would have forced. |

## 7. Self-check (before returning a verdict)
- [ ] I judged the CHECKLIST first, then the graded rubric — never skipped straight to grading.
- [ ] Every PASS cites a quoted line/number from `visual-design.md`; no PASS rests on unstated intent.
- [ ] I did not re-litigate anything the hard `visual-design-lint.mjs` report or the `non-empty` gate
  already decided (char-ceiling, zone arithmetic, cue-coverage are NOT re-judged here).
- [ ] I named which Required mark(s), if any, FAILED — a Contract with a Required FAIL is not sound
  regardless of how many Aspirational marks it clears.
- [ ] I treated a Required PASS + an Aspirational FAIL as "good, with a named weakness to route to" — not
  as gold and not as a failure.
