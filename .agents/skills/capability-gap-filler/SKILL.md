---
name: capability-gap-filler
description: Curriculum-driven capability factory. Read the curriculum + lesson content, detect which visual capabilities the content needs but the registry lacks, and have one subagent per gap AUTHOR the missing capability — across three parallel layers (SVG assets, primitives, special components) — each reusable, prop-driven, frame-disciplined, and wired into the drift-gated registry. Use proactively to grow the shared library ahead of (and across) lessons, or whenever a content scan surfaces capability gaps. Pairs with capability-registry-harness (the registration gate), visual-discipline / kids-eye / early-childhood-visual-taste (craft), and reuses the lesson-build W3b protocol.
---

# Capability Gap-Filler

The library grows from what the **curriculum demands**, not from one-off scripts or per-lesson hand-patches. This skill is the methodology a subagent fleet uses to read content, find capability gaps, and BUILD the missing capabilities as reusable, registered craft.

It is orchestrated by `.claude/workflows/capability-gap-filler.js`. Each node here is a clean-room subagent given concrete inputs; this file is the operating contract.

---

## The three layers — parallel, not a hierarchy

A "capability" is reusable visual craft. It lives at exactly one of three layers. **None is lesser. They compose.**

| Layer | What it is | Has its own animation? | Home | Registered as |
|---|---|---|---|---|
| **SVG asset** | A fixed-form, on-palette illustrated object — a bundle, an animal, a prop. The visual *material*. | No (static art) | `public/icons/<name>.svg` (+ `mono/`) | `asset-catalog.json` (via `icons:build`) |
| **Primitive** | A prop-driven shape with self-contained animation — `count`/`progress`/`state` drive it. The teaching atom. | Yes | `src/shape-primitives/<family>.tsx` | `primitives[]` (family-gated) |
| **Special component** | A higher composite that COMBINES primitives + assets + motion into ONE self-contained animated teaching unit (e.g. ten sticks gather → become a roped bundle → conservation-peek, as a single reusable component). | Yes (and orchestrates others') | `src/special-components/<Name>.tsx` | `specialComponents[]` (barrel-gated) |

Assets are the substrate. Primitives and special components are built **on top of** assets and each other. A lesson scene then *composes registered capabilities at cue-relative frames* — it never reinvents this craft inline (a crossfade hand-rolled in a scene is a special-component gap in disguise).

> **AssetMorph** (`src/motion-primitives/AssetMorph.tsx`) is the reference special component: it composes `StickGroup` (primitive) + `IconAsset` (asset) + `SparkleBurst` (fx) into one frame-driven parametric→asset morph. New special components follow its shape.

---

## The decision rule (per visual demand)

For every visual a KP needs, walk the rule and STOP at the first hit:

1. **REUSE** — an existing catalog entry already covers it (name it from `src/capabilities/catalog-digest.md`, incl. the 70+ `<IconAsset>` names). Default answer.
2. **COMPOSE** — existing primitives/assets composed in the *lesson scene* cover it. No new capability; note the composition.
3. **BUILD a primitive** — the demand is a NEW teaching atom that must count / progress / preserve identity / morph. Hand-code it parametric.
4. **BUILD a special component** — the demand is a recurring *combination* of pieces + a self-contained animation (a beat that more than one lesson will want). Author it as a composite.
5. **MAKE an asset** — the demand is a fixed-form decorative/representational object (no count/progress/state). IMPORT from the library if present; else GENERATE (trace pipeline, author-time) OR compose existing primitives. Never an asset for a teaching atom.

A "gap" is only real when steps 1–2 miss. Over-building is the failure mode — most demands REUSE.

**Never reach for a `status: deprecated` capability** — it is quarantined into the digest's "Deprecated" section and the gallery's Legacy band precisely because it is *not* the right way; use its `supersededBy` replacement instead (e.g. `bundle-wrap` → `asset-morph`).

---

## Reading the curriculum (the demand source)

Content lives in `/Users/tk/Desktop/Omniscience/curriculum_snapshot/*.json` (人教版 Math G1–6, 统编版 Chinese G1–6, 人教版PEP English G3). Shape:

```
book { publisher, subject, grade, volume }
sections[] {
  section_code (e.g. "1.1"), title (e.g. "1~5的认识"), lesson_type,
  unit { title, summary },
  context {
    overview { overview (teaching goals), all_knowledge_points[], key_difficult_points[] },
    knowledge_points[] { title, content (the actual teaching text), importance, children[] },
    common_difficulties[] { kp_id, difficulties[] { content (misconception + 应对建议) } },
    exercises[], section_games{}
  }
}
```

To extract VISUAL DEMANDS from a KP: read its `content` + the matching `common_difficulties`. The content names what must be SHOWN (objects to count, a number to write, a comparison to make); the difficulty names what the visual must make *unmistakable* (e.g. "无法有序观察" → an ordered-counting pointer; "同一数字表示不同事物" → a one-to-one set across DIFFERENT object kinds → asset variety + a cardinality special component). Tie every demand to a `(sectionCode, kpTitle, importance, difficulty?)` so the gap is justified, never invented.

---

## The gap record (what each demand becomes)

```json
{
  "demand": "show N different objects, each tagged with its count, to teach cardinality is kind-independent",
  "from": { "section": "1.1", "kp": "1~5的基数含义", "importance": "key", "difficulty": "同一数字表示不同事物" },
  "decision": "reuse | compose | build-primitive | build-special-component | make-asset",
  "layer": "asset | primitive | special-component | (none if reuse/compose)",
  "reuseId": "<catalog id, if reuse>",
  "spec": "for a build: the component name, the prop-driven API (props that vary; NO baked topic), the pieces it composes, the self-contained animation, and the single hardest test frame + worst-case multiplicity to render."
}
```

---

## Authoring + registration (per layer) — REUSE the registry loop

The registry is **code-as-truth and drift-gated**: an exported-but-unregistered capability FAILS `npm run registry:check` and cannot be committed. Follow `capability-registry-harness` + the lesson-build **W3b** protocol exactly.

**Primitive** (`src/shape-primitives/`):
1. Implement in the right FAMILY file (`counting`/`literacy`/`interaction`/`sketch`.tsx) — prop-driven, lesson-agnostic (NEVER hardcode a topic, a Chinese string, or a specific value; everything comes from props). A brand-new standalone file is a stranded export that fails the gate; only add a family by registering `MODULE_KIND`+`KIND_ORDER` (`build-registry.mjs`) AND the `kind` union (`schema.ts`) AND `KIND_ORDER`/`KIND_TITLE` (`catalog-digest.mjs`).
2. Export the component + public types from `src/shape-primitives/index.ts`.
3. `npm run registry:build` → writes the catalog entry's structure + digest.
4. Author prose (`intent`/`useWhen`/`avoidWhen`/`variants`, flip `status` off `undocumented`) in `src/capabilities/primitive-registry.json`; re-run `registry:build`.
5. Add a `demoProps` entry for the component in `src/component-gallery/demoProps.tsx` (a centered render at the gallery still frame, with a short strip of its key variants) — a registered component with no demo FAILS `registry:check` via the gallery gate (`check-gallery.mjs`), so the Component Gallery is always complete.
6. `npm run registry:check` GREEN.

**Special component** (`src/special-components/<Name>.tsx`): same loop (incl. the step-5 `demoProps` entry), exported from `src/special-components/index.ts` and registered in the `specialComponents[]` tier. It COMPOSES registered primitives/assets/fx + named `EASE.*`/`SPRING.*` motion — ZERO raw motion literals, ZERO frame literals (its public API takes `atFrame`/`startFrame`/`progress` + cue-relative offsets from the caller; it never reads a master-timeline literal). Until the `specialComponents` tier exists, a composite MAY register through the `motion-primitives` barrel (the AssetMorph precedent) — name it in the spec.

**Asset** (`public/icons/`): IMPORT from the origin library if it exists (`scripts/import-origin-icons.mjs`) OR generate author-time (trace pipeline) OR compose. Land `<name>.svg` + `mono/<name>.svg` + `<name>.meta.json` (category + desc), then `npm run icons:build` (auto-emits `asset-catalog.json` + digest). Assets are committed (tiny + canonical).

---

## Self-verification (every builder, before declaring done)

- **Render test stills at REAL render size**: the single hardest frame AND the worst-case multiplicity (e.g. a primitive at 10×). A primitive that looks flat/ambiguous is a gap-filler bug — fix it here, never downstream. Use the gallery or a focused still.
- `npm run registry:check` GREEN (or `icons:build` for assets) — this now includes the gallery gate, so a missing `demoProps` entry fails the check.
- The capability is **lesson-agnostic and reusable**: prove a second imagined caller could use it with different props. If it only fits one lesson, it's mis-scoped — it's scene composition, not a capability.

---

## Workflow shape (how this skill is orchestrated)

`.claude/workflows/capability-gap-filler.js`: **Scope** (index curriculum → sections) → **Demand** (one subagent per section: KP content+difficulties → visual demands) → **Gap** (barrier: dedup demands, diff vs `catalog-digest.md` → classified gap set) → **Build** (one subagent per gap; DESIGN fans out in parallel, REGISTER is serial because the barrel + `registry:build` + `icons:build` write shared files and parallel builds race) → **Verify** (`registry:check` + gallery QC + a completeness critic that asks "what curriculum demand is still uncovered?" — its answer is the next run's input). `dryRun` stops after **Gap** with the report, building nothing.
