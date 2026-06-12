# Primitive Gap Scan — kptest-fenyuhe-six

W3b — primitive gap-scan → build, run ∥ with the W3a voice pass. Per the W3b protocol
the DEFAULT answer is **compose existing primitives**; a new primitive ships only when a
gap is explicitly named. This document performs the REUSE/GAP diff from the **teaching
actions the storyboard used** against the **authoritative reuse menu**
(`src/capabilities/catalog-digest.md`, code-generated, drift-gated, never hand-edited).
Source discipline: I do not read primitive source code during the scan; the catalog is
the COMPLETE inventory of what exists, and reading family files would balloon context
without changing a single REUSE/GAP call.

## 0. Inputs read

- `lesson-data/kptest-fenyuhe-six/brief.md` — knowledge point, continuity directive, out-of-scope fence.
- `lesson-data/kptest-fenyuhe-six/storyboard.md` — 9 cues, each tagged with teaching actions.
- `lesson-data/kptest-fenyuhe-six/visual-design.md` — Visual Contract, zones, palette, motion vocabulary, §4 reuse map.
- `lesson-data/kptest-fenyuhe-six/pedagogy.md` — discovery per cue, reinforcement plan, audit checklist.
- `.agents/TEACHING-ACTIONS.md` — Index of moves + each move's `requires` (audio | visual/layout | component).
- `src/capabilities/catalog-digest.md` — authoritative reuse menu (every primitive + variants + useWhen).

## 1. Teaching actions used (from the storyboard)

Each cue's teaching actions, read straight off the storyboard's `teaching action(s):`
line. The gap-scan is **teaching-driven**: the move names what it needs, the catalog
says whether we already have it.

| cue | teaching actions (in order) | move's `component` requires (from TEACHING-ACTIONS.md) |
|---|---|---|
| `cue-announce-split-1of5` | announce-topic → model-target-slow → reveal | `LessonIntroCard` (announce-topic); large glyph (model-target-slow) |
| `cue-conserve-1of5` | model-target-slow → reveal | large glyph |
| `cue-split-2of4` | model-target-slow → reveal | large glyph |
| `cue-conserve-2of4` | model-target-slow → reveal | large glyph |
| `cue-split-3of3` | model-target-slow → reveal | large glyph |
| `cue-conserve-3of3` | model-target-slow → reveal | large glyph |
| `cue-learner-response-gap` | invite-echo → learner-response-gap | clear "your turn" cue (layout-level; no component named) |
| `cue-reveal-answer` | reveal | (no component; picture carries the discovery) |
| `cue-spaced-recap-all-three` | spaced-recall | recap stack + a single live marker |

The layout/audio legs of every move's `requires` are honored at W2a (the Visual
Contract) and W3a/W3.5 (audio plan + reconcile); the W3b node is concerned only with
**what component-level capability is needed** to satisfy the `component` line.

Unique component-level demands across the whole lesson:

1. **An intro-card primitive** that lays out a title (and optional eyebrow/teaser) with a write-on accent underline, prop-driven, lesson-agnostic — for `announce-topic` (cue 1).
2. **A large centered glyph primitive** that can hold a Chinese bond phrase ("一和五" / "二和四" / "三和三" / "合" / "6可以分成几和几?"), big and centered with nothing on top — for `model-target-slow` (cues 1, 3, 5) and for the `learner-response-gap` "your turn" prompt (cue 7).
3. **A 1-10 place-value unit primitive** with a `dot` variant — for the six dots that the whole video migrates.
4. **A part-whole concrete-object primitive** that drives the 分/合 motion vocabulary (whole → two clusters, two clusters → whole, with one item migrating per step in `enumerate` mode) — for every modeling + conservation + recap cue (cues 1, 2, 3, 4, 5, 6, 9).
5. **A 3-state dim+highlight recap primitive** that, given a `currentHighlight` index, dims previously-shown sub-beats, full-colors the active one, and (optionally) draws a single transient ring on the active sub-beat's center — for `spaced-recall` (cue 9).
6. **A moving-hold breath primitive** that wraps a held visual group with a frame-keyed ±0.5% scale pulse so no frame in the rendered video is zero per-frame change — for the rule-of-#6 wrap on every cue's load-bearing group.
7. **A hand-drawn teacher-mark primitive** for the optional sketch overlay — for any optional `TeacherMark` per `sketch-explainer-layer` (≤ 1 per cue, most cues zero).
8. **An entrance-physics primitive** with a `bouncy` accent variant for the single highlight moment (cue 5's "三和三" bond-glyph appearance is the ONE `motion="bouncy"` beat per `early-childhood-visual-taste`).

## 2. REUSE / GAP table (catalog-digest only — no source reads)

The catalog is the COMPLETE inventory. Each row diffs the demand against the catalog.
**REUSE = the catalog entry satisfies the demand. GAP = NO catalog entry satisfies it.
A gap is only real if NO teaching move's requirement is already satisfied by the catalog.**

| # | demand (from §1) | catalog entry | variants (catalog) | useWhen (catalog) | status |
|---|---|---|---|---|---|
| 1 | intro-card primitive (announce-topic) | `lesson-intro-card` (`LessonIntroCard`) | — | "Opening a lesson with the normalized topic-intro card… title + section/unit eyebrow + one-line KP teaser… reveals in via ONE progress (0..1). Lesson-agnostic & prop-driven: title/section/teaser are caller ReactNodes (bakes NO copy, NO topic, NO Chinese/English string). The card surface defaults OFF so the lesson canvas stays the only background (decoration budget)." | **REUSE** — the description names "the lesson canvas stays the only background" (matches §0.5 `cardFill={null}`); callers pass `title` as a ReactNode (matches the `6的分与合` requirement). |
| 2 | large centered glyph primitive (model-target-slow + learner-response prompt) | `label-callout` (`LabelCallout`) | `appearStyle: fade \| write-on` | "Dropping a centered word or phrase with an optional draw-on underline that fades in via progress to name what is on screen." | **REUSE** — "centered word or phrase… to name what is on screen" is exactly the `model-target-slow` `requires` ("target glyph big, centered, nothing on top, held at least its spoken length"). The same primitive drives both the bond-glyph appearances AND the "6可以分成几和几?" prompt (the prompt is a label, not a glyph; the catalog entry is "a centered word or phrase"). `appearStyle="fade"` matches the visual-design's default; `appearStyle="write-on"` is available for any cue that wants the draw-on accent. |
| 3 | 1-10 place-value unit with `dot` variant | `unit-block` (`UnitBlock`) | `variant: chip \| cube \| dot \| rod` | "Showing 1-10 place-value units as cubes, dots, chips, or a segmented rod, optionally stacked, with a value label." | **REUSE** — the `variant="dot"` line is the exact match for the six dots that migrate across the whole video. The 1-10 capacity matches the lesson's count of 6 with room to spare. |
| 4 | part-whole concrete-object primitive (split / merge / enumerate) | `part-whole-composer` (`PartWholeComposer`) | `mode: split \| merge \| enumerate` | "The concrete-object 分与合 beat: N caller-rendered countables laid out as a whole and SPLIT into two parts, MERGED back together (addition 合并), or walked through EVERY ordered decomposition… `count` is N; `renderItem(i, part)` lets the caller render ONE object given its index + which part… the caller owns the object KIND and the two-color split… `partition: {left:k}` sets k for split/merge (derived per step for enumerate); `atFrame` is cues[id].startFrame+offset… `mode='enumerate'` walks ALL ordered decompositions 1&(N-1), 2&(N-2), …, (N-1)&1." | **REUSE** — this is the canonical 分/合 primitive, and the catalog's useWhen language is *literally* "the concrete-object 分与合 beat" (the lesson's name). Mode coverage: `mode="split"` for the 1\|5, 2\|4, 3\|3 modeling beats and the recap's per-step 1\|5 → 2\|4 → 3\|3 cycle; `mode="merge"` for the conservation beats (1+5→6, 2+4→6, 3+3→6). The catalog explicitly names: "bakes NO topic, value, or Chinese string" and "Drives 人教版 G1 §1.4 分与合… AND §1.5 加法的含义 (合并 — physically move two groups together into one total)" — the same textbook family as this lesson's source. |
| 5 | 3-state dim+highlight recap primitive (spaced-recall) | `recap-spotlight` (`RecapSpotlight`) | — | "A 3-state dim+highlight on a recap stack driven by `currentHighlight`: the active sub-beat's items render in full color, previously-shown sub-beats' items render at `dimOpacity` (group-opacity wrap, the items keep their ACTIVE color), and not-yet-shown sub-beats are not rendered. A transient `<circle>` ring (stroke only, dashed) sits on the active sub-beat's `ringCenter` with `ringRadius` — the recap's ONE allowed emphasis (per the early-childhood palette: one moment, one beat, then clears). Drives 6的分与合's recap (1+5 → 2+4 → 3+3, the live highlight follows the spoken item)." | **REUSE** — the catalog's useWhen sentence is *literally* "Drives 6的分与合's recap (1+5 → 2+4 → 3+3, the live highlight follows the spoken item)." This is the exact demand the storyboard's `cue-spaced-recap-all-three` makes. **Key discovery for W2a**: the visual-design's §4 said "if the W3b gap-scan later decides to ship a `RecapSpotlight` primitive, that is its call (not W2a's)" — the W2a note was written defensively in case the primitive did not exist. The primitive DOES exist; the gap-scan RESOLVES the hedge: use `RecapSpotlight`, not a hand-rolled per-cue color override. |
| 6 | moving-hold breath primitive (rule-of-#6 wrap) | `breathe` (`Breathe`) | — | "Moving-hold idle breathing so held elements stay alive." With defaults: `bpm=15`, `amplitudeScale=0.005`, distinct `phaseSeed` per group. | **REUSE** — defaults match `CAPABILITIES.md#magic-fx-library` `<Breathe>` "moving-hold wrap convention" exactly. Wrap the six-dot group and the bond-glyph group, each with a distinct `phaseSeed`. |
| 7 | hand-drawn teacher-mark primitive (optional sketch) | `teacher-mark` (`TeacherMark`) | `kind: underline \| wrap-arc \| label-arrow \| vs-mark` | "Hand-drawn teacher ink (underline, wrap-arc, label-arrow, vs-mark) that draws on via drawProgress with optional boil wobble and pen-settle." | **REUSE** — restraint per `sketch-explainer-layer`: ≤ 1 mark per cue, most cues zero. The visual-design flags one wrap-arc above the title (announce phase) and one underline under the equal-split clusters (cue-split-3of3) as the only candidates worth a default presence; the composer authors them per `sketch-explainer-layer`. |
| 8 | entrance-physics with `bouncy` accent variant (the one highlight moment) | `pop-in` (`PopIn`) | `motion: snap \| bouncy \| settle` | "Entrance scale physics for any appearing element." `motion="bouncy"` reserved for "Introduction of a NEW concept — one accent moment per video" (`CAPABILITIES.md#popin-motion-variants`). | **REUSE** — `motion="bouncy"` on cue 5's "三和三" bond-glyph is the ONE accent moment per the Visual Contract's §3 palette/motion-vocabulary. Every other entrance is `motion="snap"` (the default). |

## 3. GAP-SCAN RESULT — no gap

**No GAP rows in §2's table. Every demand in §1 is satisfied by an existing catalog entry.**

The W3b protocol's "default = compose existing primitives" holds. The lesson will be
built from eight registered primitives: `LessonIntroCard`, `LabelCallout`, `UnitBlock`,
`PartWholeComposer`, `RecapSpotlight`, `Breathe`, `TeacherMark`, `PopIn` (the last is
in the motion-components barrel, surfaced in the catalog under the same id). No new
primitives ship. No family files in `src/shape-primitives/` are touched. No registry
rebuild is required (no new exports). No `demoProps.tsx` entry is required (no new
components). `npm run registry:check` will be green by inheritance (no source changes).

## 4. Resolution of the visual-design's defensive hedge

The visual-design §4 said: *"The recap's per-step dim+highlight is a hand-rolled per-cue
color override; if the W3b gap-scan later decides to ship a `RecapSpotlight` primitive,
that is its call (not W2a's)."*

The W3b gap-scan resolves the hedge: `RecapSpotlight` IS in the catalog (useWhen
explicitly names "Drives 6的分与合's recap"). The composer reaches for `<RecapSpotlight
currentHighlight={i} items={[...]} ringCenter={[cx,cy]} ringRadius={r} />` — three
items pre-positioned per sub-beat (1|5, 2|4, 3|3), `currentHighlight` driven by the
cue's `startFrame + offset` (NO frame literals). The hand-rolled per-cue color override
path is no longer needed.

This is a load-bearing simplification: the recap becomes a 1-line `<RecapSpotlight>`
mount under the existing `<PartWholeComposer mode="split">` sequence, with the
`currentHighlight` index advancing across the three sub-beats in lockstep with the
narration.

## 5. Title / intro layout (designed here, per W3b's owned scope)

The visual-design §4 prescribes: `<LessonIntroCard title="6的分与合" cardFill={null}
...>` with the card surface OFF (the cream canvas IS the background; per the Visual
Contract's §1 `decoration-budget = 1 cream + 1 caption ribbon = 2 surfaces total`).
The composer will pass:

```
<LessonIntroCard
  title="6的分与合"
  section=""                       // no section eyebrow — the title is the only text per the §0.5 zone-title declaration
  teaser=""                        // no teaser line — the brief is "model the three splits," not a teaser-driven opener
  cardFill={null}                  // surface OFF; cream canvas stays the only background
  cardStroke={null}                // no border — same
  titleSize={120}                  // per visual-design §0: title-target 120 px rendered
  titleColor={theme.colors.textNavy}
  accentColor={theme.colors.coral} // the write-on accent underline; matches the Visual Contract's `coral = action accent` line
  underline={true}                 // the write-on accent underline is the lesson's only chrome-free accent
  // atFrame derived cues["cue-announce-split-1of5"].startFrame + 0  — NEVER a frame literal in the source file
/>
```

The announce-phase then sequences:
1. **Title alone** — `<LessonIntroCard ... progress={0→1 across the first 60 frames} />` reads; the rest of the scene is empty cream (per `announce-topic` `requires`: "the title/teaser is the only readable thing on screen").
2. **Title fades** (`progress` returns to 0 across the next 18 frames) as the bond-glyph "一和五" enters (`<LabelCallout ... motion="bouncy">` is the one bouncy entrance — wait, that reservation is for cue 5's "三和三" not cue 1's "一和五"; cue 1's bond is `motion="snap"`).
3. **Bond-glyph held** for `model-target-slow`'s spoken length, then cleared as the six dots enter the `zone-objects` row.
4. **Reveal** — `<PartWholeComposer mode="split" count={6} partition={left:1} renderItem={...}>` runs across the cue's split window.

The intro layout is therefore fully specified, no composer improvisation required.

## 6. Hardest frame (pre-verification note for the composer)

The visual-design §6 / W2a's finger-cover test names **cue-split-3of3 mid-cue** as the
hardest frame. With this gap-scan's REUSE list, that frame is composed from:
- 6 `<UnitBlock variant="dot">` instances (the same React instances that lived the
  whole video; they migrate to a 3+3 cluster geometry, identity-preserved per
  `kids-eye` §4).
- 1 `<PartWholeComposer mode="split" count={6} partition={left:3}>` wrapping them.
- 1 `<LabelCallout word="三和三" motion="bouncy">` (the ONE `bouncy` moment per video).
- 1 `<Breathe>` wrap around the dot group (`bpm=15`, `amplitudeScale=0.005`,
  `phaseSeed="kp6-dot-group"`).
- 1 `<Breathe>` wrap around the bond glyph (`bpm=15`, `amplitudeScale=0.005`,
  `phaseSeed="kp6-bond-glyph-3of3"`).
- Cream background + caption ribbon = 2 stacked surfaces (matches decoration-budget).
- NO card behind the dots, NO panel, NO count badge, NO celebratory color shift
  (per Visual Contract §3 + §5 anti-patterns).

The composer renders the STILL frame at 30 fps mid-cue and grades against the Visual
Contract (climax frame per `visual-discipline` §8). The gap-scan has no primitive
self-check still to render — every primitive used is the registered, catalog-surfaced
component already in the barrel, and the Component Gallery's
`npm run gallery:build` covers their visual self-check at the framework level
(per the gallery gate referenced in the W3b protocol).

## 7. Pipeline findings (backlog for the workflow, not the lesson)

These are improvements to the workflow itself, surfaced by running this scan.

- **P1 — Visual-design's "if the W3b gap-scan later decides to ship" hedge is
  expensive in context.** A `RecapSpotlight` entry already existed when the W2a was
  written, but the visual-design author could not know that without diffing against
  the catalog themselves. The W3b protocol already names catalog-digest.md as the
  authoritative inventory for W3b, but the visual-design subagent is upstream of W3b
  and so the hedge was the only safe behavior. Consider exposing catalog-digest.md
  to the W2a subagent as a READ-ONLY reference (a single line in the W2a prompt:
  "consult the catalog; a primitive named for your beat may already exist, in which
  case say 'reuse <name>' instead of 'hand-roll'"). The cost is one file read in W2a
  context; the benefit is fewer downstream hedges and tighter visual-design specs.
- **P2 — `part-whole-composer`'s `mode="enumerate"` is the canonical 全列举 routine
  the brief's "spaced-recall" mechanic leans toward, but the recap is rendered as
  three sequential `mode="split"` calls per the visual-design §2. The composition is
  the right call (each split is a 6.5s spotlight beat, not a tight 列举 walk), but
  it would be worth a one-line note in the catalog's `useWhen` clarifying that
  `mode="enumerate"` is for ordered-decomposition lessons (the §1.4 routine) and
  `mode="split"` sequenced with `currentHighlight` is the recap mechanic. Filed as
  a catalog-doc update for the next registry:build pass.

## 8. Status

```
status:        ok  (no gap; pure REUSE)
new-primitives: 0
family-edits:   0
registry-build: not required (no source changes)
registry-check: green by inheritance
```

**The lesson ships with zero new primitives. The composer is handed a complete REUSE
list, the recap hedge is resolved, the title/intro layout is specified, and the W3b
node is done.**
