# node: w4b-sketch — SOFT criteria (the TEACHER'S-HAND quality bar)

<!-- Leg · OPTIMIZER-FACING JUDGING REFERENCE. Read by piflow-triage (name defects) and piflow-gate
     (judge a candidate). NEVER injected into w4b-sketch's own runtime prompt — seeing the bar
     teaches-to-the-test and voids the clean-room signal the loop depends on. The HARD floor
     (section-completeness, the cue-relative anti-pattern, the restraint-budget + vocabulary lint) is
     node.json's optimize.measure job — do NOT re-judge it here; this file judges only what code
     cannot reach. -->

## What this node is, and its LEVERAGE on the end product

`w4b-sketch` writes ONLY a prose spec — `sketch-overlay.md`, a per-mark table of hand-drawn
`<TeacherMark>` placements in cue-relative frames. It owns no scene code (the composer, `w4a`,
instantiates the actual components from this spec — see `[[sketch-overlay-marks]]`). So this node's
output is the SOLE determinant of WHERE a six-year-old's eye gets pointed, and WHEN.

**LEVERAGE (the one sentence every criterion serves):** *w4b-sketch sets the ATTENTION-DIRECTION
CEILING of the finished lesson — whether the one moment pedagogy.md names as the discovery is the
moment a child's eye is actually drawn to, or whether that signal is buried under decoration, pointed
at the wrong beat, or left to collide with a caption/label — and because the composer faithfully
instantiates whatever this spec says, no downstream node can recover a wrong pointing decision or undo
a decorative mark once it ships.*

## How to judge (blind judge — evidence-anchored, quote-required)

Judge `sketch-overlay.md` against the rows below, reading it alongside the SAME `pedagogy.md` and
`visual-design.md` the node itself read. A row PASSES only when you can QUOTE the specific sentence /
table cell that earns it — no quote ⇒ FAIL, and mechanically cap any high mark that lacks its quoted
evidence. Cite evidence, THEN mark. Judge as a senior children's-media director who has never seen
this pipeline would judge a storyboard's annotation pass — NOT whether the markdown table is
well-formed (that is the hard floor's job, already passed). State every judgement as a RELATION
between the mark and the lesson's own content, never as a per-input constant.

## CHECKLIST — coverage dimensions a great sketch-overlay spec engages (catch OMISSIONS)

A thin output silently skips one of these; the checklist is the "what full looks like" target it
fails against. Run this FIRST, before grading the rubric.

1. **Discovery anchoring** — the mark(s) target the same element/moment `pedagogy.md`'s discovery
   line names for that beat.
2. **Restraint reasoning, not just a count** — every shipped mark states the "carries signal X, not
   carried by Y/Z" sentence; every refused (`n`) cue names the specific carrier it would duplicate.
3. **Cue-relative discipline** — already HARD-gated (node.json); do not re-score it here.
4. **Zone-aware anchoring** — anchors are placed and REASONED against the actual `visual-design.md`
   zone layout, not a bare "zone-aware" label.
5. **Timing relation to the accompanying motion/highlight** — a mark's draw-on is timed relative to
   a real event in the scene (a diagram completing, an accent finishing), not an arbitrary offset.
6. **Climax coherence** — the climax mark's anchor/timing is coupled to the actual climax primitive's
   own state (a real function/value it reads), not merely co-located in the same cue.
7. **Vocabulary discipline** — already HARD-gated (node.json); do not re-score it here.
8. **Composer hand-off completeness** — every mark carries every field the resolution formula needs,
   and the manifest-registration requirement is carried forward, not silently dropped.
9. **Boil/settle restraint** — used sparingly, decorative-only (boil) / climax-only (settle), each
   with a stated reason tied to the lesson's own content.
10. **Negative-case honesty** — every `n` row's one-line reason is cue-specific, not boilerplate
    copy-pasted across rows.

## RUBRIC — the graded bar (one construct per row; PASS = quotable; a failure signature per row)

**Aggregation:** every **Required** row must PASS for the output to be *good* (miss one ⇒ revise).
The **Aspirational** rows are the discriminators that separate *good* from *great* and carry the
permanent headroom; they are NOT awarded by default.

### Required (the quality floor above the hard floor)

| # | Criterion (RELATION, one construct) | PASS — quotable evidence | Failure signature |
|---|---|---|---|
| R1 | **Discovery-anchored mark** — the marked cue(s)' anchor targets the SAME element/moment `pedagogy.md`'s `discovery:` line names for that beat, not a secondary or decorative element in the same frame. | Quote the `discovery:` line from `pedagogy.md` and the mark's anchor/purpose text; show they name the same referent. | The mark points at something present in the frame but NOT the thing the discovery line is about (a decorative flourish gets marked while the actual teaching moment goes unmarked). |
| R2 | **Restraint is REASONED, not merely counted** — every shipped mark's purpose cell states which signal it carries that nothing else on screen carries at that moment, AND every refused cue's one-line reason names the SPECIFIC existing carrier (a named motion, an existing accent, an existing label) it would duplicate — never a generic "not needed." | Quote one shipped mark's purpose sentence and one refused cue's reason sentence; both must name a specific carrier/signal, not an adjective. | A purpose cell that just says "emphasize" / "draw attention" with no named unique signal, or an `n` row reason that is interchangeable across cues ("no mark needed here"). |
| R3 | **Zone discipline is reasoned against the real layout** — for every anchor, the spec states which `visual-design.md` zone (or the kids-eye zone vocabulary) it lives in and confirms, referencing that zone's actual footprint, that it does not enter `zone-labels`/`zone-caption`. | Quote the zone name and the confirming sentence for at least the busiest/climax cue. | The spec says "zone-aware" or "respects zones" with no zone named, or names a zone without checking it against the real layout the node itself read. |

### Aspirational (near-unachievable greatness — the discriminators; do NOT award by default)

| # | Criterion (RELATION, one construct) | PASS — quotable evidence | Failure signature |
|---|---|---|---|
| A1 | **Parametric truth over tuned constants** — every anchor coordinate and every timing value that stands in for another primitive's own state is expressed as a REFERENCE to that primitive's real output (a named anchor function, a row-center formula, another cue's own measured offset) — never a hand-typed approximate point or a flat fraction chosen because "it looks right." | Quote the named function/formula/reference the anchor or timing resolves through. | An anchor given as a bare `{x, y}` guess marked "example" or "≈", or a timing value that is a flat percentage of cue length asserted to correspond to another event without naming that event's own output. |
| A2 | **Comparative leverage** — the spec argues, by NAMING the next-best candidate cue(s) and why they lose, that the marked cue(s) are the single HIGHEST-leverage moment(s) in the lesson — not merely a defensible choice among several equally justifiable ones. | Quote the sentence naming the runner-up cue and the reason it was passed over. | The spec justifies why the chosen cue earns a mark but never compares it against another plausible candidate — a defensible choice asserted, not argued as the best one. |
| A3 | **Whole-video rhythm is a deliberate decision** — the spec states, in one sentence, why the chosen mark(s)' POSITION across the full cue sequence (early/late, clustered/spread) is the right shape for THIS lesson's pacing — not merely the sum of independent per-cue yes/no calls. | Quote the sentence reasoning about mark position across the whole sequence, not within one cue. | The spec never steps back from the per-cue table to reason about the marks' distribution across the whole video. |

### Calibration note (Law 2 — the bar sits ABOVE a good run; name the marks a good run is expected to fail)

The strongest real output in this repo, `remotion-svg-primitives/lesson-data/fen-yu-he/sketch-overlay.md`
(9 cues, 3 marks, budget 5), clears **R1–R3** comfortably: its Restraint ledger names a specific
duplicated carrier for every one of the seven refused cues, its two shipped marks each state a
named unique signal, and its self-check explicitly confirms zone placement (`zone-marks` /
`zone-diagram` / `zone-column`, never a numeral card). It is EXPECTED to fail the aspirational
cluster, and does:
- **A1** — the `order-matters` `vs-mark`'s anchor is given as *"an example point ≈ `{ x: 1030, y:
  380 }`"* — a hand-typed approximate constant, exactly the "hand-computed anchors drift" anti-pattern
  its OWN climax section warns against for the diagram anchors. Its timing, `Math.round(cueLength *
  0.55)`, is a tuned fraction reasoned in prose to land "after both rows have lit" but not expressed as
  a reference to the highlight's own end offset.
- **A2** — the ledger justifies each shipped mark and names what each refused cue would duplicate, but
  never argues `read-fen-he-shi` and `order-matters` are the two HIGHEST-leverage cues against a named
  runner-up (e.g., why not `first-ordered-split`, the start of the ordered method).
- **A3** — no sentence reasons about why 2 marks landing at cue 5-of-9 and cue 9-of-9 (not earlier, not
  more spread) is the right whole-video shape.

## GOLD — annotated exemplar: "pattern-abab-necklace" (off-distribution — clears every mark)

> A lesson NOT in this repo (AB repeating-pattern completion via a beaded necklace), so the judge
> cannot pattern-match a live test input. 7 cues; mark cap = `floor(7 × 0.6) = 4`. This exemplar ships
> 2 marks across 2 cues — restraint is not "use the budget," it is "use only what earns its place."

**pedagogy.md excerpt (for reference):**
```
## predict-next-bead
discovery: The pattern lets YOU predict the next bead before it's revealed — red, blue, red, blue...
           you already know what comes next (a felt property: the child anticipates, doesn't just watch).
focal: the gap in the necklace where the next bead is about to be revealed.
```

**sketch-overlay.md (condensed):**

### 1. Sketch language
Single ink `textNavy`, `strokeWidth={4}`, `opacity=0.92`, draw-on via `drawProgress`, fade-out 8
frames before cue end — per sketch-explainer-layer §1.

#### 1.1 Boil
ONE boiled mark: the `underline` under the frozen AB-AB-AB run in `hold-the-pattern` (holds 2.1s while
the narrator names it aloud — clears the "≥1.5s + calm cue" reach bar; nowhere else qualifies).

#### 1.2 Settle
ONE settled mark: the `label-arrow` in `predict-next-bead` (`settle={{ magnitude: 0.08 }}`) — the
lesson's one anticipation climax.

### 2. Per-cue mark table (7 cues; 2 marked)

| cue id | mark? | mark type | anchor | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| `intro-title` | n | — | — | — | — | — | text card is focal; a mark on a title is decoration. |
| `show-necklace` | n | — | — | — | — | — | the beads arriving IS the act; nothing to point at yet. |
| `name-the-pattern` | n | — | — | — | — | — | the spoken "red, blue, red, blue" times to the beads lighting in turn — the sync already carries the signal. |
| `hold-the-pattern` | y | `underline` (boiled) | `beadRunAnchor(patternStart, patternEnd)` — the function the necklace primitive itself uses to bound its lit run, never a hand-typed span. | `12` | `20` | `cueLength - 8` | carries "THIS is the repeating unit" while the narrator names it — nothing else marks the unit's boundary. |
| `cover-the-gap` | n | — | — | — | — | — | the necklace's own gap-mask primitive already shows "something is hidden here"; a mark would duplicate it. |
| `predict-next-bead` | y | `label-arrow` (settled) | start = `beadSlotAnchor(patternIndex + 1)` (the SAME function the necklace primitive resolves the next slot from), end = the gap mask's own center, so the arrow always lands exactly on the hidden slot regardless of necklace length. | `beadRevealCue.startFrame - cue.startFrame - 10` (fires 10 frames BEFORE the reveal beat's own measured start, read from the reconciled timeline — not a flat fraction of this cue's length) | `16` | `cueLength - 8` | carries "predict before it's shown" — the one moment `pedagogy.md` names as the discovery. |
| `reveal-and-cheer` | n | — | — | — | — | — | the bead popping into the gap + the cheer sound ARE the payoff; a mark would compete with it. |

### 3. Climax sketch
`predict-next-bead` is the lesson's one anticipation climax: the settled `label-arrow` points at the
hidden slot via `beadSlotAnchor(patternIndex + 1)` — the SAME function the necklace component itself
uses — and fires 10 frames ahead of the reveal beat's own reconciled start, so the child is invited to
guess BEFORE the answer appears, never after.

### 4. Composer hand-off
Both marks carry `{ cueId, drawOnRelativeStart, drawOnDuration, fadeOutRelativeStart }`; the composer
resolves cue-relative → real frames per the standard formula. Each becomes a `SceneElement` in
`manifest.ts` (zone `"marks"`); `bboxAt(frame)` = the anchor span padded by stroke width, so
`npm run lesson:check` catches any collision with `zone-labels` before render.

**Quote-mapped to the rubric:**
- **R1 ✓** — pedagogy's discovery is *"the pattern lets YOU predict the next bead before it's
  revealed"*; the `predict-next-bead` mark's purpose is *"carries 'predict before it's shown' — the
  one moment pedagogy.md names as the discovery"* — same referent.
- **R2 ✓** — `hold-the-pattern`'s purpose names the unique signal (*"THIS is the repeating unit"*
  while nothing else marks the boundary); `name-the-pattern`'s refusal names the specific carrier
  (*"the spoken cadence times to the beads lighting in turn"*), not a generic "not needed."
- **R3** — (not shown in the condensed excerpt, but the full exemplar states each anchor's zone against
  `visual-design.md`'s declared `zone-necklace` / `zone-labels` footprint.)
- **A1 ✓** — BOTH marks resolve through the necklace primitive's OWN functions
  (`beadRunAnchor`/`beadSlotAnchor`) and the reveal's timing is read from `beadRevealCue.startFrame`
  (a real measured offset), never a hand-typed point or a tuned percentage.
- **A2 ✓** — `cover-the-gap` is explicitly named and refused (*"the gap-mask primitive already shows
  'something is hidden'; a mark would duplicate it"*) as the direct runner-up to `predict-next-bead`,
  arguing the latter is the higher-leverage moment.
- **A3 ✓** — the two marks land at cue 4-of-7 (teach the unit) and cue 6-of-7 (predict the payoff) —
  deliberately spread across the teach→apply arc, not clustered at either end; the Climax section
  states this shape directly.

## Hard-measure companion (do NOT re-judge these — the gate/lint owns them)

For the judge's orientation only: the FLOOR is enforced deterministically via `node.json`'s
`optimize.measure` — do NOT spend a soft mark on any of these:
- **Existence** — `sketch-overlay.md` is non-empty (`checks.post`, node-blocking).
- **Section completeness** — the artifact covers sketch language, per-cue mark table, climax sketch,
  and composer hand-off (`regex-present` lookahead gate).
- **Cue-relative discipline** — no bare three-numeric-column table row (the skill's own FORBIDDEN
  absolute-frame shape) (`regex-absent` gate).
- **Restraint budget** — `markCount <= floor(cueCount * 0.6)`, counting `×N` multi-instance rows
  (`mark-restraint-lint.mjs` + a `regex-absent` gate on its `overBudget` flag).
- **Mark vocabulary** — every marked row names one of `{underline, wrap-arc, label-arrow, vs-mark}`
  (`mark-restraint-lint.mjs` + a `regex-absent` gate on its `hasVocabViolation` flag).

Judge only the discovery-anchoring, restraint-reasoning quality, zone-reasoning, parametric-truth,
comparative-leverage, and whole-video-rhythm qualities above, which no code can reach.
