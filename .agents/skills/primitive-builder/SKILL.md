---
name: primitive-builder
description: Wave 3b — scan the lesson's TEACHING demands against the capability catalog, REUSE existing primitives by default, and ship a new prop-driven primitive ONLY when a gap is explicitly named. Owns primitive aesthetic quality (verified via test stills) and the topic-intro card layout. Lesson-agnostic — never bakes a topic, value, or string into a primitive.
---

# Primitive Builder

Name every visual demand the lesson makes; the default answer is **compose existing primitives**. A new primitive ships ONLY when an unmet capability is explicitly named. The gap-scan is **teaching-driven** — it starts from the storyboard's teaching ACTIONS, not from a drawn layout — so gaps read as "this lesson needs a *model-the-sound-slowly* move and no capability satisfies it," never "this scene references a missing component."

## Inputs (read all before scanning)

- `lesson-data/<id>/storyboard.md` — the teaching action(s) per cue. This is the demand source: scan starts from the moves, not a layout.
- `.agents/TEACHING-ACTIONS.md` — the teaching-move registry. Each move declares its `requires` (audio | visual/layout | component). The scan reads each used move's `requires` capability and diffs it against the catalog.
- `lesson-data/<id>/visual-design.md` — the Visual Contract; cross-check the per-cue required visuals against the moves' `requires`.
- The **catalog-digest** (`src/capabilities/catalog-digest.md`) — the GENERATED, code-derived inventory of every existing primitive + its variants + `useWhen`. For the SCAN this is your ONLY inventory source: it cannot lie. Decide REUSE vs GAP from the digest ALONE.
- `visual-discipline`, `kids-eye` SKILL.md (craft + viewer-first legibility), and the capability protocol in `CAPABILITIES.md` (how to register a new capability — see §"Registration protocol").

**Do NOT read primitive source during the scan.** Opening the family files (`counting.tsx` / `literacy.tsx` / …) balloons context until the scan cannot converge. You read or write `src/shape-primitives/` ONLY when building a named gap, and only the single family file you will edit.

## The teaching-driven gap-scan

1. For every TEACHING ACTION the storyboard used, read its `requires` capability from `TEACHING-ACTIONS.md`, then list the primitive(s)/component(s) it needs (cross-check the Visual Contract).
2. Mark each demand **REUSE** (name the existing catalog id) or **GAP** (explicitly named). A gap is real only if NO teaching move's requirement is already satisfied by the catalog.
3. If there is NO gap (**the common case**), write the reuse table and you are DONE — no source reads, no builds.

Decide REUSE/GAP from `catalog-digest.md` only. The diff is between the lesson's *teaching demands* and the *catalog*, never between a drawn scene and a missing import.

## REUSE is membership, not belief

A REUSE is valid ONLY if the component is a real id in the registry / catalog-digest. Membership, not vibes:

- An upstream-suggested name (e.g. visual-design saying "W3b may ship `<FooDiagram>`") is a **HINT, not proof** the thing exists. A name not in the registry is a GAP — build it, or keep the upstream-described mechanic as a hand-rolled composition — **never** a REUSE.
- After writing the reuse table, VERIFY it mechanically against the generated registry (the oracle that cannot lie): the per-lesson registry check diffs every component the table names against the registry. A phantom REUSE fails the node. Fix the table (real id, or mark GAP) and re-verify before finishing.

## Default = reuse / compose

The visual-source order is fixed: **reuse an existing primitive → compose existing primitives → hand-code a parametric primitive → generate a decorative asset.** Stop at the first hit. Most lessons stop at compose. Composing two catalog primitives into a beat is NOT a gap and ships no new code. A new primitive is the exception, justified by a named demand no catalog entry satisfies.

## Building a named gap — the two-step law

A new component is authorized ONLY after the scan names a gap no catalog entry satisfies. When that happens, **what the component is supposed to TEACH defines the component** — its one teaching intention is its whole reason to exist, and every visual element inside it must serve that one intention. Build in TWO steps, in order. Do not skip to drawing.

A concept-specific component is LEGITIMATE and expected: a gap is real precisely because no existing component could teach this concept, so a component built for one concept is correct. "Single-purpose for a concept" is the goal, not a smell. What is forbidden is the opposite — a component that bundles *unrelated* jobs, or that gets "drawn out based on whatever," merging other components and stray lines into a grab-bag. Single concept = good. Multiple unrelated jobs in one component = the bug.

### Step 1 — Ground in the craft AND the concept (load before drawing)

Before you design or draw anything, LOAD and internalize two things:

1. **The best way to build a component in THIS system.** Read the craft skills named in your SKILLS input and follow them literally:
   - `kids-eye/SKILL.md` — viewer-first legibility: the §1 measurement block (the smallest mark meets its minimum at real render size), §2 "one element, one unique signal," §3 the finger-cover test, §4 identity-preserved-across-transformation.
   - `visual-discipline/SKILL.md` — "container earns its existence," "semantic groups dominate visual groups," "color is a semantic channel, not decoration," "text earns its existence," and the anti-pattern catalogue (decoration "for emphasis," two pictures stapled together).
   - `early-childhood-visual-taste/SKILL.md` — palette (bounded set of meaningful colors), typography minimums, motion vocabulary.
   - The catalog-digest is the inventory of what already exists to compose; `CAPABILITIES.md` is the craft-technique reach-guide for named motion / fx / entrance helpers.
2. **The best way to TEACH this specific concept with a component.** Read this lesson's `pedagogy.md` (what the child discovers at the beat this gap serves) and the teaching MOVE(s) in `TEACHING-ACTIONS.md` whose `requires` named this gap. The concept's pedagogy — not a visual you already have in mind — is what the component must deliver.

Output of Step 1 (in your log / structured return, NOT baked into the component): one sentence — *"This component's ONE teaching intention is `<X>`: the single thing the child must see/understand that no existing component delivers."* If you cannot write that sentence in one clause, you do not yet understand the concept — re-read, do not start drawing. If the sentence contains an "and" joining two unrelated jobs, you are about to build a grab-bag — split it into the one intention this gap actually needs (the other job is a separate component, or is composed by the lesson).

### Step 2 — Design around the ONE teaching intention, then draw

Decide the component's single teaching intention (the Step-1 sentence), design the component to deliver EXACTLY that, and only THEN implement it.

**The single-intention test — apply to EVERY visual element before it goes in.** For each shape, line, ring, label, arrow, pointer, tally, bracket, glow, pop you are about to add, complete the sentence:

> *"This element is REQUIRED to deliver `<the one teaching intention>`, because without it the child would not see `<the specific thing>`."*

If you cannot complete it, the element does not belong in this component. It is either decoration (cut it) or a *different* job (a separate component, or composed by the lesson scene at cue-relative frames — never baked in here). This is the finger-cover test applied at the COMPONENT-AUTHORING boundary, not just the scene: cover any element — if the component still teaches its one intention, that element was decoration or an unrelated job; remove it.

**Forbidden when authoring a component (refuse on sight):**

- **Bolting on an uncorrelated overlay.** Any extra mark — an arrow, a celebration sparkle/burst, a ring, a pop, a glow, a running tally, a bracket — that does not serve THIS component's one intention must NOT be baked in. If a lesson wants a flourish, the LESSON composes it at cue-relative frames; the component does not carry it.
- **A default-on flourish the caller never requested.** A flourish/overlay may exist as an OPT-IN prop, but it defaults OFF, and it never auto-enables itself by inferring from some other prop or context. The caller opts in explicitly; a component that decides on its own to add an extra mark is the canonical instance of this bug — it draws decoration nobody asked for, uncorrelated with the component's teaching job.
- **"Drawing it out based on whatever."** Merging available components + stray lines into a grab-bag because they were on hand is not design. Every piece is included because the single-intention test passed for it, or it is not included.
- **Multiple unrelated jobs in one component.** If the thing would teach several unrelated concepts at once, those are several intentions. Build the ONE this gap named; let the others be separate components the lesson composes. A component is single-purpose for a concept; it is never multi-purpose across unrelated concepts.

**Then draw, preserving every existing non-negotiable (all still binding):**

- **Lesson-agnostic + prop-driven.** Never hardcode this lesson's topic, count, value, or strings — those are props. Prove a second imagined caller could use the component with different props; if it only fits one lesson, it is scene composition mis-scoped as a capability.
- **ZERO frame literals.** The public API takes `atFrame` / `progress` / `startFrame` + cue-relative offsets; the component never bakes a master-timeline frame. Spoken-enumeration stepping binds to measured ASR onsets via the onset prop, never a fixed grid baked as the only path.
- **ZERO raw motion literals.** Every easing curve / spring reaches for a named export (`EASE.*` / `SPRING.*`); entrance physics and opt-in liveliness via the named motion primitives.
- **REUSE > compose > build-primitive > make-asset.** You are here only because the scan proved compose-existing could not deliver the intention. Inside the component, still compose registered primitives where they serve the one intention — do not re-draw what a primitive already draws.
- **Add it to the appropriate FAMILY file** under `src/shape-primitives/` (`counting` / `literacy` / `interaction` / `sketch`.tsx). The registry catalogues primitives BY FAMILY, so a brand-new standalone file is NOT discovered and FAILS the registry check as a stranded export. Prefer an existing family; introduce a new family only when genuinely needed (registering the family is extra work — see the capability protocol).
- A pure positioning/placement HELPER (a lowercase export like `getStickPlacement`) is not a catalog component and carries no registry entry — but it still lives in a family file and is exported from the barrel.

## Registration protocol (a new catalog component)

The registry is drift-gated: an exported-but-unregistered primitive FAILS the registry check and cannot be committed. Run the protocol from `CAPABILITIES.md` §"adding a new capability" — named generically here:

1. **Export** the new primitive + its public types from the shape-primitives barrel (`index.ts`), with inline JSDoc.
2. **Build the registry** (`registry:build`) — it discovers the component and writes its structural catalog entry (`component` / `kind` / `source`) + the agent digest. Never hand-edit those fields.
3. **Author the entry's prose** in `primitive-registry.json` — `intent` / `useWhen` / `avoidWhen` / `variants`, and flip `status` off `"undocumented"`. Re-run `registry:build` (prose is carried forward by component id).
4. **Add a gallery demo** — a `demoProps` entry: a centered `render()` (the demo + short key-variant strip) AND, for a primitive used in GROUPS, a `unit` (ONE instance at the component's DEFAULT size, no size override). The grid thumbnail scales the demo to FILL its cell (browse); the **true-size view** renders `unit` (one + the typical group) — or a composite's `render()` — at 1:1 inside the 1280×720 frame, so the real on-canvas size is verifiable (`kids-eye` §1.6). VERIFY size there: if the default reads too small, **raise the component's default size and re-render** — don't ship a speck, don't fake it with a `footprint` number. A registered component with no demo fails the gallery gate, so every component is auto-included in the Component Gallery.
5. **Confirm the registry check is GREEN** before finishing.

A `CAPABILITIES.md` markdown entry is OPTIONAL for a barrel component — add one only when it needs a richer reach-guide / anti-pattern table than the catalog's one-line prose. A technique / prop / JSON key with no barrel home gets a markdown entry INSTEAD (the protocol's path B).

## Aesthetic quality is YOURS (the W3→W4 boundary gate)

Primitive aesthetic quality is owned HERE, not by the composer. Does this thing **look like what it claims to be**, at real render size AND in the worst-case multiplicity? A bad-looking primitive surfaced at Wave 4 is a Wave 3 bug — kick it back, do not patch it in the scene.

- For every gap built, render test stills at REAL render size for **the single hardest frame AND the worst-case multiplicity** (e.g. the densest count, the most-crowded comparison row), and write them under the lesson's `primitive-checks/`.
- VERIFY the stills yourself before the composer consumes them. Apply the `kids-eye` finger-cover test: is the primitive still recognizable / legible at lesson scale and at multiplicity — AND does every element on screen still pass the single-intention test from "Building a named gap"? If a still shows a mark that serves no part of the one intention, that mark leaked in — cut it and re-render. If the primitive is not recognizable, redesign it — do not ship it and hope the composer compensates.
- This gate is the contract between W3b and W4a: the composer trusts the stills. If you didn't look, the gate didn't run.

## Topic-intro card ownership

Every lesson opens with a short topic-intro card (title + section + KP teaser) — the `announce-topic` move. Designing that intro LAYOUT is W3b's job, never the composer's.

- If the normalized intro primitives already fit this subject, mark them REUSE and move on.
- If they don't fit (a new subject the existing card was never shaped for), DESIGN the intro layout here as a small composition of intro primitives — and if a needed intro primitive is missing, build it under the registration protocol. Once shipped it is reused by every later lesson; only the per-lesson copy changes.
- Honor the move's `requires`: the title/teaser **reads alone first**, the cast/teaching objects **enter after** (sequence in time — never overlay art on the title). This requirement is what prevents the cast-on-title occlusion; bake it into the intro composition, don't leave it to the composer to discover.

## Output (`lesson-data/<id>/primitive-gap-scan.md`)

A LEAN reuse/gap table — a 2-column `demand → primitive` REUSE table citing catalog ids. The reader has `catalog-digest.md`, so:

- NEVER paste a catalog `useWhen` blurb — cite the primitive by id.
- **Cite every reuse/gap row in the DUAL form `` kebab-id (`ComponentName`) ``** — the catalog id AND its Pascal component, e.g. `` `comparison-symbol` (`ComparisonSymbol`) ``. A BARE kebab id alone (`` `comparison-symbol` `` with no `` (`ComponentName`) ``) is forbidden: the membership gate (`registry:check-lesson`) cannot tell a bare-kebab primitive citation from a teaching-action / cue / skill id, so a bare-only table extracts ZERO components and the anti-vacuous guard FAILS the node. Dual form is the only machine-verifiable citation.
- NO upstream-hedge narration, NO intro-card prop re-spec, NO hardest-frame re-derivation.
- If zero-gap (the common case), the result line + the REUSE list IS the whole artifact.

When a gap ships a primitive, the artifact also points at: the new primitives under `src/shape-primitives/` (exported from the barrel), their registry entries (regenerated + prose authored, registry check green), and the test stills under `primitive-checks/`. The gap-scan table always ships; new primitives only when a gap is named.

## Separate the backlog from the verdict

Two different outputs, do not conflate them:

- The **per-lesson REUSE/BUILD verdict** is the gap-scan artifact above — what THIS lesson reuses or builds.
- A **workflow flaw** you hit while scanning (a catalog entry whose `useWhen` is wrong, a teaching move whose `requires` doesn't map cleanly, a recurring gap that should become a proactive library build) is a **pipeline finding** — it goes in the structured return's `pipelineFindings`, the workflow-improvement backlog, NOT in the gap-scan table. The artifact records the decision; the finding records the system flaw.

## What the primitive builder must NOT do

- Read primitive source, or any OTHER lesson's files, during the scan — the catalog-digest is the inventory; other lessons are presumed flawed and off-limits (a READING-LAW violation).
- Mark a REUSE for a name that is not a real registry id — that is a phantom; it is a GAP.
- Hardcode this lesson's topic / count / value / strings into a primitive (lesson-agnostic always).
- Put a frame literal in component code — the public API takes `atFrame` / `progress` / offsets.
- Hand-edit the generated registry files (`catalog-digest.md`, the structural fields of `primitive-registry.json`) — they are written by `registry:build`.
- Ship a new primitive without test stills, or declare aesthetic quality from code inspection alone.
- Build a primitive for a demand that composing existing primitives already satisfies.
- Bake in any element that does not serve the component's one teaching intention — an uncorrelated overlay/arrow/sparkle/ring/pop/glow/tally/bracket, a grab-bag of merged components + stray lines, or a flourish that defaults ON (or auto-enables from context) instead of being an explicit opt-in the caller requests.
