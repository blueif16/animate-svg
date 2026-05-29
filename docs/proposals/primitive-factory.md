# Primitive factory (longer videos / own assets) — proposal

> Status: DRAFT for review. This is a STRUCTURAL change (new Workflow script, new skill, new
> capability-registry write protocol, new CLAUDE.md rules). Per CLAUDE.md "Feedback & Debugging
> Loop", structural changes require user approval before any edit ships. Nothing here is built yet.

## Problem (grounded in specific files/lines)

The system has a strategic need for **more primitives, faster, verified** — to make longer videos
(more distinct visuals per minute) and to "own our assets" (a deep SVG primitive library instead of
composing the same 28 shapes forever). Today primitive creation is a hand-authored, single-track,
human-gated bottleneck. Concretely:

1. **Creation is slow and serial.** Per the findings, one primitive is ~3.5–5h of hand-work:
   gap-scan doc → build `.tsx` → CAPABILITIES entry → per-lesson `primitiveChecks.tsx` →
   render stills → lint. CLAUDE.md assigns all of this to a single Wave-3 lane
   (`primitive-gap-scan → primitive-builder`) that runs **inside one lesson run**, so primitives are
   only ever born one-at-a-time, as a side effect of a lesson that happens to need one.

2. **The registry is a single mutable file with a fixed schema.** `.agents/CAPABILITIES.md` is one
   markdown file; every entry follows a fixed block (Code / Surface / Owned-by / Status / Added +
   Reach guide + Anti-patterns — verified at `.agents/CAPABILITIES.md:7-117`, protocol at
   `:119-127`). The barrel `src/shape-primitives/index.ts:6-11` is one `export *` list.
   **Two primitives built in parallel both append to these two files and collide on write.** There
   is no machine-writable registry — the schema lives only as prose, so a script cannot safely
   append an entry or detect a duplicate.

3. **Quality is human-in-the-loop and non-reproducible.** Per findings + the
   `machine-gated-verification` proposal (`docs/proposals/machine-gated-verification.md:5,12`),
   test stills are eyeballed and identity-preservation is checked by code review. There is **no
   automated visual gate for a primitive in isolation** — `scripts/lesson-check.mjs` and the contact
   sheet operate on a *whole rendered lesson*, not on a bare primitive at the hardest frame /
   worst-case multiplicity. So a primitive cannot be certified until a lesson is built around it,
   which inverts the dependency (you need the asset to build the lesson, but you can only verify the
   asset by building the lesson).

4. **Test stills are lesson-scoped, not primitive-scoped.** The composer skill
   (`.agents/skills/remotion-lesson-composer/SKILL.md:19`) puts `primitiveChecks.tsx` under
   `src/lessons/<camelId>/`. A primitive's proof-of-quality is therefore trapped inside whichever
   lesson first needed it; there is no standing, primitive-owned still that survives lesson churn,
   and **no golden-frame baseline** to detect drift when `theme.ts`, a base type, or the primitive
   itself changes.

5. **No demand signal, no backlog.** There is no artifact answering "which primitives does the
   curriculum need, and which do we have?" Gap-scan's "default answer is COMPOSE existing, ship new
   only when named" (CLAUDE.md, Wave 3) is the right *per-lesson* rule, but at the scale of thousands
   of lessons it produces no *cross-lesson* prioritization: the same gap can be discovered, rejected,
   re-discovered across dozens of runs with no memory.

Net: the asset library cannot scale because creation is serial, registration is write-unsafe under
parallelism, verification requires a host lesson, and there is no curriculum-level backlog to drive
what to build.

## Proposed design

A **Primitive Factory**: a reusable, lesson-agnostic `Workflow`-tool script that batch-creates
verified primitives from a typed spec, registers them write-safely, and certifies each through a
deterministic gate + adversarial critic + golden-frame baseline — *without* a host lesson. Plus a
**coverage map** artifact that is the factory's demand-driven backlog.

This is a sibling of the lesson Workflow, not a wave inside it. The existing per-lesson
`gap-scan → primitive-builder` lane (Wave 3) stays, but is **demoted to a fast path**: if a lesson
needs a primitive the coverage map already lists as `lack`, it enqueues a factory spec instead of
hand-building inline (see Migration).

### Directory layout (new)

```
remotion-svg-primitives/
  src/
    shape-primitives/
      _registry.json            # NEW machine-writable registry (source of truth; CAPABILITIES.md generated from it)
    primitive-checks/           # NEW primitive-owned, lesson-agnostic test compositions
      <PrimitiveName>.checks.tsx
  scripts/
    primitive-factory.mjs       # NEW Workflow node runner (build → stills → gate → critic → golden)
    primitive-gate.mjs          # NEW deterministic gate for a single primitive PNG (reuses machine-gate checks)
    primitive-register.mjs      # NEW serial registrar: append _registry.json, regen CAPABILITIES.md, edit barrel
    primitive-golden.mjs        # NEW golden-frame store + diff
  golden/
    primitives/<PrimitiveName>/<checkId>.png   # NEW committed baselines
.agents/
  skills/
    primitive-factory/SKILL.md  # NEW skill: the spec contract + critic rubric + build rules
specs/
  primitives/<primitive-id>.spec.json          # NEW typed primitive specs (the factory's input)
docs/
  coverage-map.md (+ coverage-map.json)        # NEW curriculum→primitive backlog
```

Why `scripts/` even though Bash access to it was restricted in this review session: it is the only
home consistent with the existing pipeline (`lesson:render`, `lesson:check`, `lesson:contact-sheet`
all live there per CLAUDE.md "Dev"). The factory must reuse, not fork, that script surface. The
restriction is a review-session sandbox detail, not a design constraint.

### Stage 0 — the primitive spec contract (`specs/primitives/<id>.spec.json`)

The single lesson-agnostic input. A JSON object so the factory can validate it and a subagent can
author it. Shape:

```jsonc
{
  "id": "ten-frame",                       // kebab-case, unique; becomes <TenFrame> + registry key
  "componentName": "TenFrame",             // PascalCase React export
  "home": "shape-primitives/counting",     // which file/barrel section it joins
  "claims": "A 2x5 grid of cells that fill with counters; the canonical make-10 surface.",
  "extendsBaseTypes": ["PrimitiveGroupProps"],   // MUST extend a base type from baseTypes.ts
  "props": [                               // typed prop list → drives .tsx interface + checks
    {"name": "filled", "type": "number", "required": true, "doc": "How many cells are filled (0..10)."},
    {"name": "colorToken", "type": "keyof typeof colors", "default": "accentBlue"}
  ],
  "themeTokensOnly": true,                  // gate asserts no raw hex in the .tsx
  "hardestFrame": {                         // worst single still the critic/gate must pass
    "props": {"filled": 7}, "scale": 1, "note": "asymmetric fill reads correctly"
  },
  "worstMultiplicity": {                    // worst-case crowding still
    "instances": 3, "props": {"filled": 10}, "layout": "row",
    "note": "3 full ten-frames side by side at native size still legible"
  },
  "kidsEyeClaims": {                        // numeric promises the gate enforces (from kids-eye skill)
    "minStrokePx": 3, "minFocalDimPx": 80, "minContrast": 4.5
  },
  "coverageRefs": ["kp4-make-ten", "kp5-teen-numbers"],  // lessons that justify this spec (>=2 to build)
  "novelty": "compose|new"                  // "compose" = recipe over existing prims; "new" = net-new SVG
}
```

The factory rejects a spec that (a) names no base type in `extendsBaseTypes`, (b) lists fewer than 2
`coverageRefs` AND is not flagged `spine` in the coverage map (the demand gate, see Q1), or (c)
duplicates an existing `_registry.json` id.

### Stage 1 — build (`.tsx`, prop-driven, base types, theme tokens only)

A `build` subagent (clean-room, per node) receives the spec + read-only `baseTypes.ts` +
`theme.ts` + the `primitive-factory` skill, and writes one `.tsx` exporting `componentName`. Hard
rules carried from CLAUDE.md and `baseTypes.ts:7-32`:

- The props interface `extends` the declared base type(s); placement via `cx/cy/scale/rotation`,
  selection via `selected/dimmed`, identity via `id` — never re-invented.
- Color only via `keyof typeof colors` from `../../theme` (matches `counting.tsx:3,16`). No raw hex.
- No frame literals, no raw easing — entrance physics via `<PopIn>`, easing via `EASE.*`/`SPRING.*`
  (CLAUDE.md "ZERO RAW MOTION LITERALS").
- Output is the `.tsx` only; registration and stills are later stages (so a build failure never
  half-writes the registry).

### Stage 2 — auto-register (write-safe, SERIAL — `primitive-register.mjs`)

This is the crux of safe parallelism. **The registry source of truth moves from prose to JSON.**

- `_registry.json` is an array of typed entries (the CAPABILITIES schema as data: `code`, `surface`,
  `ownedBy`, `status`, `added`, `reachGuide`, `antiPatterns`, plus `id`, `componentName`, `home`,
  `goldenDir`). `primitive-register.mjs` reads it, rejects duplicate ids, appends, sorts, writes.
- `CAPABILITIES.md` becomes a **generated file** (`primitive-register.mjs` renders the exact existing
  block format from `_registry.json`, preserving `.agents/CAPABILITIES.md:7-117` byte-for-byte for
  existing entries). A header line marks it generated; the human-authored protocol section
  (`:119-127`) is a static footer the generator concatenates.
- Barrel edit: the registrar appends `export * from './<file>'` to the right section of
  `src/shape-primitives/index.ts` only if absent (idempotent).
- **Concurrency rule:** registration runs under a file lock (`_registry.json.lock`) so parallel
  factory nodes serialize *only this stage* — build/stills/gate/critic stay parallel; the ~2-second
  registration is the only serial section. This is the standard fix for the index.ts/CAPABILITIES.md
  write-collision named in Problem #2.
- **Worktree isolation (optional, for heavy batches):** each primitive node runs in its own git
  worktree via `EnterWorktree(path, branch=primitive/<id>, baseRef=main)`; the registrar runs on
  `main` after a node's worktree is verified, cherry-picking the `.tsx` + `.checks.tsx` + golden PNGs
  and doing the single serial registry/barrel edit centrally. This removes file-write contention
  entirely at the cost of a merge step per primitive.

### Stage 3 — render test-stills (primitive-owned, lesson-agnostic)

The factory generates `src/primitive-checks/<PrimitiveName>.checks.tsx` from the spec — a tiny
Remotion composition rendering exactly two stills:

- **hardest frame** — the `spec.hardestFrame` props at `scale`.
- **worst multiplicity** — `spec.worstMultiplicity.instances` copies in the declared layout.

These are rendered to `out/_primitives/<PrimitiveName>/{hardest,multiplicity}.png` by reusing the
existing still-render path (the same Remotion renderer `lesson:contact-sheet`/primitive-checks
already use). **This moves the proof-of-quality out of `src/lessons/<id>/primitiveChecks.tsx`** (the
lesson-trapped location at composer SKILL.md:19) into a standing, primitive-owned file — fixing
Problem #4.

### Stage 4 — AUTOMATED GATE (`primitive-gate.mjs`, deterministic, blocking)

Reuses the checks specified in `docs/proposals/machine-gated-verification.md:16-26`, but scoped to a
**single primitive PNG** instead of a whole lesson:

- **bbox-sanity** — the rendered element's measured `getBBox()` (via the Puppeteer pass the
  collision-overhaul proposal already specifies, `collision-detection-overhaul.md:19-21`) is on-
  canvas, w/h > 0, non-NaN.
- **contrast** — sample the PNG at the element bbox center vs local background; fail < 4.5:1 (text) /
  < 3:1 (shape), the kids-eye number (`kids-eye/SKILL.md:15`).
- **legibility / min-dimension** — measured focal dimension >= `spec.kidsEyeClaims.minFocalDimPx`
  (default 80px, kids-eye `:12`); rendered stroke >= `minStrokePx` (default 3px, kids-eye `:11`).
- **theme-token purity** — static scan of the `.tsx`: zero raw `#rrggbb` / `rgb(`; every color is
  `colors.<token>`. (This is a primitive-specific check the lesson gate doesn't do.)
- **multiplicity legibility** — re-run contrast + min-dimension on the worst-multiplicity PNG;
  crowded instances must still individually clear the thresholds.
- **count sanity** (for countables) — optional: assert the number of distinct filled marks equals the
  prop, catching silent render bugs.

Emits `out/_primitives/<PrimitiveName>/gate-report.json`; non-zero exit on any blocking fail. A
failing primitive is never registered as `status: stable` (it lands `status: rejected` with the
report attached).

### Stage 5 — ADVERSARIAL VISUAL CRITIC (subagent, looks at the PNG)

A critic subagent (mode of the new `primitive-factory` skill) receives the two PNGs + the spec's
`claims` + `gate-report.json`, and answers a FIXED rubric, returning structured JSON — never free
prose, never "looks good":

```jsonc
{
  "readsAsClaimed": true,        // does the hardest frame read as spec.claims to a 4-year-old?
  "readsAtMultiplicity": false,  // do N instances stay distinct, or mush together?
  "kidsTaste": true,             // palette/weight/roundness consistent with early-childhood-visual-taste
  "identityStable": true,        // does it keep its identity across the prop range (no morph-into-something-else)
  "cites": ["multiplicity.png: the 3rd ten-frame's cells touch; gap too small at native scale"],
  "verdict": "revise",           // pass | revise | reject
  "fixHint": "increase inter-instance gap default to >=24px, or cap worstMultiplicity at 2"
}
```

`verdict != pass` loops back to Stage 1 with `fixHint` appended to the spec (max 2 auto-revise
loops; then it parks as `status: needs-human`). The critic is the taste gate the deterministic gate
can't be (Problem #3); it must cite a specific PNG region, mirroring the verification skill's
"cite specific cues/elements" rule (`machine-gated-verification.md:30`).

### Stage 6 — golden-frame regression (`primitive-golden.mjs`)

On first `pass`, the two PNGs are committed to `golden/primitives/<PrimitiveName>/`. Thereafter the
factory (and a CI hook) re-renders and pixel-diffs against the baseline; a diff above a small
threshold (e.g. >0.5% changed pixels) flags drift and blocks until a human re-baselines. This is the
missing drift detector from Problem #4 — it fires when `theme.ts`, a base type, or the primitive
changes underneath. (Same mechanism the lesson gate proposes at
`machine-gated-verification.md:32-34`, here applied per-primitive.)

### The Workflow node graph

`primitive-factory.mjs` is the Workflow runner. For a batch of N specs:

```
for each spec (parallel, cap = MAX_CONCURRENCY):
    node: build  ──► node: render-stills ──► node: gate ──► node: critic
                                                              │ pass
                                                              ▼
                                            [SERIAL, locked] register + golden-baseline
```

Each node returns the standard digest CLAUDE.md "Observability" mandates
(`{ status, outputArtifact, summary, issues, pipelineFindings }`) and writes a tier-2 log to
`specs/primitives/_logs/<id>.md`. The runner aggregates into one final object: the whole batch at a
glance. `MAX_CONCURRENCY` defaults to 10 (see Q1).

### The coverage map (Q3) — `docs/coverage-map.{md,json}`

The factory's backlog and demand gate. A table keyed by curriculum concept:

```jsonc
// coverage-map.json
{
  "concepts": [
    {
      "concept": "make-ten",
      "spine": true,                      // curriculum-spine concept → may build at demand=1
      "primitivesNeeded": ["ten-frame", "number-bond", "counter-token"],
      "have":  ["counter-token"],         // present in _registry.json with status=stable
      "lack":  ["ten-frame", "number-bond"],
      "demand": ["kp4-make-ten", "kp5-teen-numbers", "kp6-add-within-20"]  // lessons referencing it
    }
  ]
}
```

- `have`/`lack` are computed mechanically by joining `primitivesNeeded` against `_registry.json` ids
  — so the map can't drift from reality.
- `demand` is appended to by the per-lesson gap-scan node (Wave 3): when a lesson names a missing
  primitive, it adds the lesson id to the concept's `demand` list instead of hand-building inline.
- The factory's default batch = "every `lack` primitive whose `demand.length >= 2` OR whose concept
  is `spine`." That is the COVERAGE-MAP-DRIVEN, DEMAND-GATED rule (Q1).

`coverage-map.md` is the human-readable view (generated from the JSON), so review is one glance.

## Why this fixes the named problem

| Problem | Fix |
|---|---|
| Serial, lesson-bound creation (#1) | Factory is a standalone batch Workflow; builds N primitives in parallel outside any lesson run. |
| Write-collision on registry + barrel (#2) | `_registry.json` machine-writable + single locked serial registration stage; optional worktree isolation. |
| Human-only, non-reproducible quality (#3) | Deterministic `primitive-gate.mjs` (reusing the machine-gate checks) + adversarial critic with a fixed cited rubric. |
| Lesson-trapped stills, no drift detection (#4) | Primitive-owned `src/primitive-checks/*.checks.tsx` + committed `golden/primitives/` baselines with pixel-diff. |
| No demand signal / backlog (#5) | `coverage-map.json` as the joined have/lack/demand backlog; demand gate decides what to build. |

Longer videos benefit because a richer, verified library means more distinct, correct visuals per
minute without per-lesson hand-authoring. "Own our assets" benefits because the factory is the
machine that grows the library deterministically.

## Migration / rollout (incremental, what ships first)

1. **Registry-as-data (no behavior change).** Add `_registry.json` derived from current
   `CAPABILITIES.md`; make `CAPABILITIES.md` a generated view via `primitive-register.mjs`. Verify
   byte-identical output for existing entries. This is the unlock for everything else and is
   independently useful (machine-readable registry).
2. **Primitive-owned stills + gate, on ONE existing primitive.** Write `<DotArray>.checks.tsx` under
   `src/primitive-checks/`, render it, run `primitive-gate.mjs` against it, commit its golden frames.
   Proves the gate + golden loop with zero new primitives.
3. **Coverage map, seeded from current lessons.** Generate `coverage-map.json` by scanning existing
   `lesson-data/*/primitive-gap-scan.md` + `_registry.json`. Read-only backlog at first.
4. **Critic subagent + `primitive-factory` skill.** Add the skill (spec contract + critic rubric);
   wire the critic stage. Run it advisory (logs verdict, doesn't block) for one batch.
5. **Full factory Workflow, demand-gated, critic blocking.** Run end-to-end on the first real batch
   (the highest-demand `lack` primitives). Worktree isolation only if batch > ~6.
6. **Demote per-lesson inline building.** Update Wave-3 gap-scan to enqueue a spec + append `demand`
   instead of hand-building, *unless* the lesson is blocked and the primitive is a one-off.

## Structural changes requiring approval (CLAUDE.md / skill / wave-contract edits — list exactly)

1. **CLAUDE.md "Capabilities" section** — add: registry source of truth is `_registry.json`;
   `CAPABILITIES.md` is generated; new capabilities are added via `primitive-register.mjs`, never by
   hand-editing the markdown. (Replaces the manual step in the current protocol
   `CAPABILITIES.md:119-127`.)
2. **CLAUDE.md "Subagent Workflow (wave order)" Wave 3** — amend the
   `primitive-gap-scan → primitive-builder` contract: default for a *named missing* primitive is now
   "append to coverage map `demand` + enqueue factory spec," not "hand-build inline." Inline build is
   the blocked-lesson exception.
3. **New skill `.agents/skills/primitive-factory/SKILL.md`** — the spec contract, build rules, gate
   thresholds, and critic rubric. Add to the CLAUDE.md "Skills" list and the
   `complete-video-pipeline` overview.
4. **New CLAUDE.md "Primitive factory" subsection** — document the standalone Workflow, the demand
   gate (`>=2` lessons or `spine`), `MAX_CONCURRENCY`, the serial-registration rule, and the
   golden-frame baseline location.
5. **Skill-ownership note** — the factory + coverage map are owned by `animation-test/.agents`
   (kids/lesson side), consistent with CLAUDE.md "Skill ownership."
6. **Dependency note (not a code edit, but a sequencing decision):** the primitive gate's measured
   bbox + contrast checks reuse the Puppeteer/getBBox pass from `collision-detection-overhaul` and
   the check definitions from `machine-gated-verification`. The factory should land *after* (or
   co-develop with) those two proposals so it imports their check modules rather than forking them.

## Effort estimate & risks

**Effort (engineering, rough):**
- Registry-as-data + generator (`primitive-register.mjs`, `_registry.json`): ~1 day.
- `primitive-gate.mjs` (if it imports machine-gate check modules): ~1 day; ~3 days if those modules
  don't exist yet and must be built here.
- Primitive-owned stills generator + `primitive-golden.mjs` + golden diff: ~1.5 days.
- `primitive-factory.mjs` Workflow runner + node graph + locking/worktree: ~2 days.
- `primitive-factory` skill (spec + build rules + critic rubric) + coverage-map generator: ~1.5 days.
- Total ~7–9 engineer-days, sequenced so steps 1–2 of rollout ship in the first ~2 days.

**Risks:**
- **Critic false-confidence.** A subagent looking at a PNG may pass a subtly-wrong primitive. Mitigate
  with the deterministic gate *first* (only PNGs that pass the gate reach the critic) and the fixed
  cited rubric; keep `needs-human` as a real terminal state, not a rubber stamp.
- **Golden-frame churn.** A legitimate `theme.ts` change will fail every golden diff at once.
  Mitigate with a `primitive-golden.mjs --rebaseline` batch mode gated behind human review, and by
  diffing only the focal bbox region, not the full 1280x720.
- **Registry generator regression.** If the generator's markdown output drifts from the hand-format,
  diffs become noise. Mitigate by snapshot-testing the generator against the current
  `CAPABILITIES.md` in rollout step 1 (must be byte-identical before proceeding).
- **Worktree merge overhead.** Per-primitive worktrees add a cherry-pick step; only worth it above
  ~6 parallel builds. Below that, file-lock serialization of the registration stage is simpler.
- **Spec authoring becomes the new bottleneck.** If a human must write every spec, we've moved the
  hand-work, not removed it. Mitigate: the coverage-map gap-scan can draft specs; humans review specs
  in batch (cheaper than reviewing code).

## Open questions (with recommended answers)

**Q1 — What is the limit on pre-spawning many primitives speculatively?**
Recommendation: **do not pre-spawn speculatively.** Generation is COVERAGE-MAP-DRIVEN and
DEMAND-GATED — build a primitive only when `demand.length >= 2` near-term lessons need it, OR the
concept is flagged `spine: true` (a curriculum backbone concept like make-ten, place-value, that we
know recurs). The real limits, in order of which binds first:
- **Verification throughput is the true cap.** You can only ship as many primitives per run as the
  gate + critic can *certify*. Each primitive needs 2 renders + a gate pass + a critic subagent
  turn; that, not build capacity, sets batch size. Measure certifications/hour and size batches to it.
- **Workflow concurrency cap ~10–16 nodes.** `MAX_CONCURRENCY` default 10; raise toward 16 only if
  render + critic latency stays bounded.
- **File-write conflicts on `index.ts` and `CAPABILITIES.md`.** Solved by making registration the
  single serial, locked stage (or per-primitive worktrees). This is *why* registration is carved out
  of the parallel section.
Speculative pre-building beyond demand wastes verification budget and grows a library of primitives
no lesson uses — the opposite of demand-gated.

**Q2 — Remaining design questions:**
- Where do *motion* and *FX* primitives fit? The factory as specced is shape-primitive-shaped
  (a static still proves a shape). Motion/FX need a *clip* baseline (a short rendered sequence), not
  a still. Recommend a v2 `motion-factory` variant that golden-baselines a 3-still strip
  (start/mid/end) rather than blocking v1 on it.
- Should `_registry.json` also drive a TS type so scenes get autocomplete of available primitives?
  Likely yes, but out of scope for v1.
- Coverage-map concept taxonomy: who owns the curriculum concept list (the `concept` keys)? Proposed:
  seeded from existing `pedagogy.md` files, then curated by hand — needs an owner decision.
