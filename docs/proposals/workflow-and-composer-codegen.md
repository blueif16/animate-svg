# Real Workflow + composer codegen (throughput) — proposal

**Status:** draft for review. Author: staff-eng review pass, 2026-05-29.
**Scope:** make the pipeline a single self-contained `Workflow` script (today it is hand-spawned wave-by-wave), and remove the dominant wall-clock cost (hand-authored Wave 4 composer JSX) via deterministic codegen. Plus three supporting throughput levers: prompt caching, voice batching, per-wave wall-clock instrumentation.

This proposal changes **how the pipeline runs**, not the cue-as-unit timeline architecture. Every hard rule in `docs/pipeline-architecture.md` and `CLAUDE.md` is preserved (cue is the unit of coordination; audio frozen after Wave 3a; zero frame literals; zero raw motion literals; bbox manifest derived from `layout.ts`; lesson-agnostic scripts; capability-registry protocol). Where a rule must be amended, it is listed explicitly in "Structural changes requiring approval".

---

## Problem (grounded in specific files/lines)

**1. The promised Workflow does not exist.** `CLAUDE.md` ("Subagent Workflow (wave order)") states the entire loop "is owned by **one self-contained workflow** (the `Workflow` tool)… The orchestrator's only job is to spawn that workflow." In reality there is no workflow script anywhere in the repo. The only automation is `remotion-svg-primitives/package.json` scripts (`lesson:scaffold`, `lesson:voice`, `lesson:render`, `lesson:check`, `lesson:contact-sheet`, `lesson:animatic`) and the wave order is enforced by a human spawning each subagent and eyeballing the gate between. Consequences: (a) no parallelism across lessons; (b) no machine-readable record of which wave ran / passed; (c) Wave 0 pedagogy and Wave 3.5 reconcile are "orchestrator-owned" (`pipeline-architecture.md` §4 "What orchestrator-owned means here") meaning *a human does them by hand every time*.

**2. Wave 4 composer is hand-authored JSX and is the dominant cost.** The three shipped scenes are hand-written React: `src/lessons/ComparisonLessonScene.tsx` (239 lines), `MakeTenLessonScene.tsx` (283), `PinyinToneLessonScene.tsx` (265). Reading `ComparisonLessonScene.tsx` shows the shape: a per-lesson `ZONES` const (L13-16), a `type CueId = keyof typeof ComparisonCues` (L18), an inlined `cueFrames(id)` helper that converts a generated cue to `{from, durationInFrames}` (L20-23), the `<AbsoluteFill>/<SceneFrame>` wrapper, one `<Sequence {...cueFrames("x")}>` per cue, and the fixed `<LessonAudioLayer/> <LessonCaptionLayer/>` tail (L36-37). **Of those ~240 lines, the imports, CueId type, cueFrames helper, AbsoluteFill/SceneFrame wrapper, audio+caption layers, and the per-cue `<Sequence>` wrappers are 100% mechanical** — derivable from the reconciled cue list + the Visual Contract. Only the *body inside each Sequence* (which primitive, which props) is creative. The composer subagent currently re-types all the boilerplate by hand, every lesson. This is the 2-4h wall-clock wave.

**3. `manifest.ts` is also boilerplate the composer hand-writes.** `manifestTypes.ts` defines `LessonManifest = { lessonId, elements: ManifestElement[] }` where each element has `{ id, loadBearing, bboxAt: (frame)=>Bbox|null }` (L5-19), and the contract comment says `bboxAt` must be "derived from the SAME layout.ts constants the scene uses." Every load-bearing element in the Visual Contract needs a registration entry. The *list of elements* and their *zone anchors* come straight from the Visual Contract + `layout.ts`; only the per-element bbox math is judgement. Today this is hand-written and frequently drifts from the scene (the `bbox-manifest doesn't register child glyphs` known limitation, `pipeline-architecture.md` §8, is exactly this drift).

**4. The Wave 3.5 reconcile artifact is described but not implemented.** `pipeline-architecture.md` §4 Wave 3.5 says the output is `lesson-data/<id>/cue-timeline.json`, "currently embedded directly into `<X>LessonTimeline.ts`". Neither exists: `find` returns no `cue-timeline.json` and no `*Timeline*` file, and `src/lessons/generated/` is **empty**. The shipped scenes instead import the raw timing module directly (`ComparisonLessonScene.tsx` L3-6 imports `ComparisonCues, COMPARISON_FPS` from `./generated/comparisonTiming`) and inline the `cueFrames` math. So the reconcile (`cueFrames = max(narrationFrames, motionFrames) + tail`) is currently done **in a human's head**, not in code, and `visualMotionSeconds` is not mechanically combined with `narrationSeconds` anywhere. This is a latent regression risk against the §6 "three timelines" post-mortem.

**5. No prompt caching across waves.** Each wave subagent re-reads `CLAUDE.md` (~250 lines), `pipeline-architecture.md` (~190 lines), its skill (hundreds of lines), `CAPABILITIES.md`, and the upstream artifacts (`pedagogy.md`, `storyboard.md`, `visual-design.md`, …) from cold every spawn. Across 8+ waves × thousands of lessons this is the same large stable prefix re-paid every time.

**6. No wall-clock instrumentation.** `CLAUDE.md` "Observability" promises three tiers and per-node `_logs/<wave>.md`, but none record **duration**. There is no time-budget table, so "composer is the dominant cost" is folklore, not measured. `pipeline-architecture.md` §8 even lists "no automated test for X" repeatedly — the system is under-instrumented.

**7. Scaffold/config drift bug (found while grounding).** `scripts/scaffold-lesson.mjs` L58 writes `voice.script = "lesson-data/${id}/script-cues.json"`, but the live `lesson-data/comparison-5-gt-3/pipeline.json` has `voice.script = "lesson-data/comparison-5-gt-3/pipeline.json"` — pointing the voice generator at the pipeline file instead of the cue script. A real bug the Workflow's config-validation stage should catch (see Stage A below).

---

## Proposed design

Two new artifacts do the heavy lifting:

- **`scripts/run-lesson-workflow.mjs`** — the self-contained Workflow driver (one lesson), plus a thin `scripts/run-lessons-batch.mjs` fan-out for parallel lessons.
- **`scripts/codegen-scene.mjs`** — the deterministic composer codegen (the biggest lever).

Both are **lesson-agnostic** (CLAUDE.md hard rule): they take only `lesson-data/<id>/` paths + the reconciled cue list as input; no lesson topic, copy, timing, or path is hardcoded.

### 4.1 Workflow phase/stage structure

The driver models the pipeline as a DAG of **nodes**, where each node is either (a) a deterministic script call, (b) an "orchestrator-owned" mechanical computation now moved into code, or (c) an LLM subagent spawn. Nodes are grouped into **stages**; a stage is a **barrier** (all nodes in it must reach `status:"pass"` before the next stage starts) unless marked `pipeline:true` (nodes inside may overlap).

```
Stage A  config-validate            [deterministic, barrier]
         - validate pipeline.json (catch the script= bug, #7), kebab id,
           derived paths exist/creatable. No LLM.

Stage 0  pedagogy                    [LLM subagent, barrier]
         - input: brief.md   output: pedagogy.md
         - was "orchestrator-owned" by a human; now a real node.

Stage 1  storyboard                  [LLM subagent, barrier]
         - input: pedagogy.md   output: storyboard.md (cue ids, no durations)

Stage 2  visual-design  -> audio     [LLM subagents, SERIAL within stage, barrier]
         - 2a visual-design.md (Visual Contract + per-cue visualMotionSeconds)
         - 2b (depends 2a) audio-captions.md + script-cues.json

Stage 3  voice+ASR  ||  primitive    [pipeline: two lanes overlap, barrier on both]
         - 3a LLM subagent: runs `npm run lesson:voice`, audits ASR,
              re-rolls a single cue if matchScore<0.7, FREEZES audio.
              output: src/lessons/generated/<camel>Timing.ts (+Silences.ts)
         - 3b LLM subagent: primitive-gap-scan -> builder, emits test stills.

Stage 3.5 reconcile                  [DETERMINISTIC, barrier]   <-- now code
         - input: visual-design.md (visualMotionSeconds) + <camel>Timing.ts
                  (narrationSeconds) + <camel>Silences.ts
         - output: lesson-data/<id>/cue-timeline.json AND
                   src/lessons/generated/<camel>Timeline.ts (exported <Camel>Cues)
         - cueFrames = max(narrationFrames, motionFrames) + tail (tail<=9f)

Stage 3.6 codegen-scene              [DETERMINISTIC, barrier]   <-- NEW, the lever
         - input: cue-timeline.json + visual-design.md Visual Contract +
                  layout.ts (if present) 
         - output: scaffolded src/lessons/<Camel>LessonScene.tsx +
                   src/lessons/<camel>/manifest.ts + src/lessons/<camel>/layout.ts
                   with every mechanical part filled and creative slots marked.

Stage 4  composer  ||  sketch        [pipeline: two lanes overlap, barrier on both]
         - 4a LLM subagent: fills the creative deltas in the codegen output
              ONLY (primitive choice + props inside each <Sequence> slot,
              layout.ts zone constants, bbox math). Runs `npm run lesson:check`,
              reads bbox-manifest.json collisionCount, self-audits contact frame.
         - 4b LLM subagent: sketch-overlay.md (cue-relative marks).

Stage 5  render                      [deterministic, barrier]
         - `npm run lesson:render -- --config … --skip-voice` (audio frozen)

Stage 6  verification                [LLM subagent, terminal]
         - reads contact-sheet.png + bbox-manifest.json + MP4 vs pedagogy.md
```

Pipeline vs barrier rationale: the **spine is serial by data dependency** (each wave consumes the prior artifact), so within ONE lesson the only real overlap is Stage 3 (voice ∥ primitive) and Stage 4 (composer ∥ sketch) — already the documented weak parallelism. The throughput win for "thousands of lessons" comes from running **N lessons' spines concurrently** (Stage A of lesson 2 starts immediately; no shared mutable state except the `generated/` and `src/lessons/<camel>/` dirs, which are per-lesson by `camelLessonId`), NOT from more intra-lesson parallelism.

### 4.2 Structured return per node

Extends the existing `{ status, outputArtifact, summary, issues, pipelineFindings }` (CLAUDE.md "Observability" tier 1) with timing + gate fields:

```jsonc
{
  "node": "composer",            // wave/stage id
  "lessonId": "kp2-counting-by-tens",
  "status": "pass" | "fail" | "skipped",
  "startedAt": "2026-05-29T10:31:02.114Z",
  "endedAt":   "2026-05-29T10:48:55.902Z",
  "wallClockMs": 1073788,        // <-- NEW, drives the time-budget table
  "outputArtifact": ["src/lessons/Kp2.../...LessonScene.tsx"],
  "summary": "filled 7 cue slots; 0 collisions; contact self-audit pass",
  "issues": [],
  "pipelineFindings": [],        // unioned into the run's improvement backlog
  "gate": { "name": "collisionCount==0", "value": 0, "passed": true }
}
```

The driver aggregates all node returns into one run object `out/<id>/workflow-run.json` (the whole run at a glance) and appends `wallClockMs` to each `_logs/<wave>.md` (tier 2). The transcript dir (tier 3) is unchanged.

### 4.3 Where it hooks the existing npm scripts

The driver does **not** reimplement anything that already works — it shells out to the existing scripts and wraps each in a timed node:

| Node | Hooks |
|---|---|
| config-validate | reads `pipeline.json`; calls nothing |
| voice+ASR (3a) | `npm run lesson:voice -- --config <p>` (= `narration-kit/bin/generate-voice.mjs --align`) |
| reconcile (3.5) | new `scripts/reconcile-cues.mjs` (extracted from the human step) |
| codegen (3.6) | new `scripts/codegen-scene.mjs` |
| composer check (4a) | `npm run lesson:check -- --config <p>` → reads `out/<id>/bbox-manifest.json` |
| animatic gate (opt) | `npm run lesson:animatic -- --config <p>` (pre-Wave-4 gate, already exists) |
| render (5) | `npm run lesson:render -- --config <p> --skip-voice` (auto-skips since timing module exists; see `render-complete-lesson.mjs` L122-127) |
| contact sheet | built automatically inside `lesson:render` (L176-188); no extra call |
| verification (6) | reads `out/<id>/<id>-contact.png` + `bbox-manifest.json` + MP4 |

### 4.4 The composer codegen (`scripts/codegen-scene.mjs`) — the biggest lever

**Goal:** emit the mechanical 70-80% of `LessonScene.tsx` + `manifest.ts` + a `layout.ts` stub so the composer subagent only writes the creative 20-30% (which primitive in each slot, the zone constants, the per-element bbox formula).

**Inputs (all already-produced artifacts, no new authoring):**
- `lesson-data/<id>/cue-timeline.json` (from Stage 3.5) → ordered cue ids + `startFrame`/`endFrame`.
- `visual-design.md` Visual Contract → for each cue, the load-bearing element ids + zone hints. *(Requires the Visual Contract to be machine-readable; see Structural changes — we add a fenced ` ```yaml ` block, the prose stays.)*
- `src/lessons/generated/<camel>Timeline.ts` → the typed `<Camel>Cues` import.

**Output 1 — `src/lessons/<Camel>LessonScene.tsx`** with all mechanical parts generated and creative slots marked by a sentinel comment the composer fills:

```tsx
// AUTO-GENERATED SKELETON by codegen-scene.mjs — edit ONLY inside // <<slot ...>> regions.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Kp2Cues, KP2_FPS } from "./generated/kp2CountingByTensTimeline";
import { SceneFrame } from "../scenes/SceneFrame";
import { LessonAudioLayer } from "../lesson-media/LessonAudioLayer";
import { LessonCaptionLayer } from "../lesson-media/LessonCaptionLayer";
import { ZONES } from "./kp2CountingByTens/layout";
// <<slot:imports>>  add primitive + motion imports here (EASE.*, PopIn, CountRow, …)

type CueId = keyof typeof Kp2Cues;
const cueFrames = (id: CueId) => {
  const c = Kp2Cues[id];
  return { from: c.startFrame, durationInFrames: c.endFrame - c.startFrame };
};

export const Kp2CountingByTensLessonScene: React.FC = () => {
  useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#FDFBF4" }}>
      <SceneFrame>
        {/* cue: intro — visualMotionSeconds 2.0 — title intro (REQUIRED, every lesson) */}
        <Sequence {...cueFrames("intro")}>
          {/* <<slot:intro>> compose intro primitives — title + section + KP teaser */}
        </Sequence>

        {/* cue: showTens — visualMotionSeconds 4.5 — load-bearing: tensRod, onesDot */}
        <Sequence {...cueFrames("showTens")}>
          {/* <<slot:showTens>> place tensRod @ ZONES.left, onesDot @ ZONES.right */}
        </Sequence>
        {/* …one <Sequence> per cue, in cue order, with VC hints inlined… */}
      </SceneFrame>
      <LessonAudioLayer />
      <LessonCaptionLayer />
    </AbsoluteFill>
  );
};
```

Everything outside `// <<slot:*>>` is generated and **frozen** (lint rule + a codegen-hash header so re-running codegen detects manual edits to frozen regions). The composer touches only slot bodies, `layout.ts`, and the bbox formulas — it **cannot** introduce a frame literal because frames only ever come from `cueFrames(id)` which codegen wrote (this *mechanically enforces* the zero-frame-literals rule rather than relying on review).

**Output 2 — `src/lessons/<camel>/manifest.ts`** with one stub `ManifestElement` per load-bearing id from the Visual Contract, `loadBearing` pre-set, and `bboxAt` referencing `layout.ts` constants (formula body is a `// <<slot:bbox:tensRod>>`):

```tsx
import type { LessonManifest } from "../manifestTypes";
import { ZONES, SIZES } from "./layout";
import { Kp2Cues } from "../generated/kp2CountingByTensTimeline";

export const manifest: LessonManifest = {
  lessonId: "kp2-counting-by-tens",
  elements: [
    { id: "tensRod", loadBearing: true,
      bboxAt: (f) => { /* <<slot:bbox:tensRod>> derive from ZONES.left + SIZES.rod */ return null; } },
    // …one per VC load-bearing element…
  ],
};
```

**Output 3 — `src/lessons/<camel>/layout.ts`** stub: an empty `ZONES`/`SIZES` const with the zone names referenced by the scene + manifest pre-declared (so both files compile against the same single source — satisfies the "bbox derived from the SAME layout.ts constants" contract by construction).

**Quantifying the lever.** Measured against the three shipped scenes (239 / 283 / 265 = avg 262 lines): the mechanical scaffold is ~70% of lines (imports, CueId, cueFrames, wrapper, per-cue `<Sequence>` shells, audio/caption tail, manifest element list, layout zone declarations). Codegen writes those deterministically in <1s. The composer is left with slot bodies + bbox formulas ≈ 30% of the lines AND, more importantly, **zero of the error-prone wiring** (frame math, cue-id typos, missing audio layer, manifest/scene constant drift) — which is where the review/redo cycles inside the 2-4h actually go. Conservative expectation: composer wall-clock from **~3.0h → ~0.9h** (writing creative deltas into a compiling, frame-correct skeleton, not authoring + debugging wiring from scratch). That is the single largest line-item reduction in the run (see budget table).

### 4.5 Prompt caching (lever #1)

Split every subagent prompt into a **stable cached prefix** + a **volatile suffix**, ordered so the longest-lived content is first (Anthropic prompt caching matches on exact prefix):

- **Cache tier 1 (changes ~never, cache across ALL lessons):** `CLAUDE.md`, `docs/pipeline-architecture.md`, `.agents/CAPABILITIES.md`, and the wave's own SKILL.md. These are identical for every lesson and every run. Cache TTL: long (5-min/1-hr cache). This is the bulk of the token weight (~250 + ~190 + skill hundreds of lines).
- **Cache tier 2 (changes per lesson, cache across waves OF one lesson):** the read-only upstream artifacts a given wave consumes — `pedagogy.md` is read by every downstream wave (CLAUDE.md: "loaded read-only by every downstream wave"); `visual-design.md` by 2b/3.5/4. Cache once per lesson, reuse across that lesson's waves.
- **Volatile suffix (never cached):** the wave's specific task instruction + its output-artifact contract.

Expected win: the stable prefix is re-paid at cache-read rates instead of full input on every wave after the first. With ~8 waves/lesson and a multi-hundred-line stable prefix, this is a large input-token reduction (cache reads are ~10% of base input cost on Anthropic). It does not change wall-clock much per node but materially cuts cost at thousands-of-lessons scale and slightly speeds first-token latency.

### 4.6 Voice pre-generation batching + parallel-lesson voice (lever #3)

Today `lesson:voice` is one network round to Gemini Aoede + local sherpa-onnx ASR per lesson, run inline in the spine (Stage 3a), serial. Two changes:

1. **Batch all cues of one lesson in one generation pass** (already mostly true via `script-cues.json`), and **pre-warm** — kick Stage 3a's voice generation the moment `script-cues.json` exists (end of Stage 2b), overlapping it with nothing-yet-running rather than gating Stage 3. (It already overlaps Stage 3b primitives; the win is starting it earlier.)
2. **Parallel-lesson voice queue.** Gemini TTS is network-bound (idle CPU) and sherpa ASR is local-CPU-bound. Run a small worker pool: TTS calls for lesson B fire while lesson A's ASR is crunching the CPU. A `scripts/voice-queue.mjs` with concurrency `--tts 4 --asr <ncpu>` keeps both resources saturated. This is the throughput unlock for "thousands of lessons" — voice stops being a serial-per-lesson bottleneck.

Hard rule preserved: **audio frozen after Wave 3a.** Batching changes *when/where* generation runs, never *whether it's re-run*. The single-cue re-roll on `matchScore<0.7` stays inside 3a and is the only regeneration path.

### 4.7 Instrumentation (lever #4)

`scripts/lib/timed-node.mjs` wraps every node: records `startedAt`/`endedAt`/`wallClockMs`, writes them into the node's structured return AND appends a `WALL CLOCK: <ms>` line to `_logs/<wave>.md`. The driver then emits `out/<id>/time-budget.md` — a real per-wave table per lesson — and a cross-lesson `out/_aggregate/time-budget.md` rolling median. This turns "composer is the dominant cost" from folklore into a measured number and tells us where the *next* lever should go.

---

## Per-wave time-budget table (estimated current vs target)

Per ONE lesson, wall-clock. "Current" = today's hand-spawned reality (estimates, to be replaced by lever #4's real numbers); "Target" = after this proposal.

| Wave / stage | Current | Target | How |
|---|---|---|---|
| A config-validate | (manual, ~0) | ~0.05 min | deterministic |
| 0 pedagogy | ~15 min | ~12 min | prompt cache trims read time |
| 1 storyboard | ~12 min | ~10 min | cache |
| 2a visual-design | ~20 min | ~16 min | cache + machine-readable VC block |
| 2b audio-captions | ~15 min | ~12 min | cache |
| 3a voice+ASR | ~12 min | ~6 min* | batched, pre-warmed; *overlaps 3b |
| 3b primitive | ~25 min | ~22 min | cache (overlaps 3a) |
| 3.5 reconcile | ~8 min (human) | ~0.1 min | now deterministic code |
| 3.6 codegen-scene | n/a | ~0.05 min | NEW deterministic |
| 4a composer | **~180 min** | **~55 min** | **codegen removes boilerplate + wiring** |
| 4b sketch | ~20 min | ~18 min | cache (overlaps 4a) |
| 5 render | ~15 min | ~15 min | unchanged (bundle+encode bound) |
| 6 verification | ~12 min | ~10 min | cache |
| **Serial critical path** | **~5.5–6.5 h** | **~2.3–2.6 h** | |

(*Stage-3 and Stage-4 lanes overlap, so the critical path is `max` of each lane, not the sum.) Headline: composer drops from ~3h to <1h and the human-in-the-loop reconcile vanishes; the new critical-path floor becomes render + the largest LLM waves.

---

## Top-3 interventions ranked by ROI

1. **Composer codegen (`codegen-scene.mjs`)** — biggest single win (~125 min/lesson off the critical path) AND it *mechanically enforces* zero-frame-literals + scene/manifest constant-coherence, killing a whole class of redo. Highest ROI: one ~1-2 day script, paid back on the first lesson.
2. **Real Workflow driver + deterministic reconcile (3.5) + instrumentation (4)** — converts the two "orchestrator-owned" human steps into code (~8 min/lesson saved + removes a human gate), makes the run machine-recorded, and unlocks parallel-lesson execution (the actual thousands-of-lessons lever). Medium effort, compounding return at scale.
3. **Voice batching + parallel-lesson queue + prompt caching** — caching is mostly a *cost* win (large at scale, small wall-clock); voice queue is a real wall-clock win once many lessons run concurrently. Lower per-lesson ROI than #1/#2 but essential for the fleet-scale goal.

---

## Why this fixes the named problem

- **Throughput / thousands of lessons:** the Workflow driver makes a lesson a single `node run-lesson-workflow.mjs --id <x>` call with no human gates, so `run-lessons-batch.mjs` can fan out N lessons; codegen removes the 3h hand-authoring that made each lesson expensive; the voice queue saturates network+CPU across lessons.
- **Longer videos:** longer = more cues = more `<Sequence>` blocks + manifest entries. Hand-authoring scales linearly with cue count (the pain grows with length); codegen is O(cues) at <1s, so length stops taxing the composer. The cue-as-unit timeline already handles arbitrary length; codegen makes the *authoring* scale with it.
- **Our own SVG assets/primitives:** unchanged and reinforced — Stage 3b (primitive lane) stays the home of new primitives, codegen consumes existing primitives into slots, and the CAPABILITIES.md protocol is untouched.
- **Preserves every hard rule:** codegen *generates* the `cueFrames(id)`-derived frames (no literals possible in slots), reads the SAME `layout.ts` into both scene and manifest (constant coherence by construction), never regenerates audio (frozen), and the scripts stay lesson-agnostic (id-parameterized only).

---

## Migration / rollout (incremental, what ships first)

1. **Ship instrumentation first (lever #4).** `timed-node.mjs` + append wall-clock to `_logs`. Zero risk, and it *measures* the baseline so every later claim is verifiable. Run it under the current manual process for a few lessons → real budget table.
2. **Ship `reconcile-cues.mjs` (Stage 3.5) standalone.** Emit `cue-timeline.json` + `<camel>Timeline.ts`. Switch the three existing scenes to import the Timeline file instead of the raw timing module. Low risk, removes the human reconcile, and is a prerequisite for codegen.
3. **Ship `codegen-scene.mjs` behind a flag**, validate by regenerating skeletons for the three existing lessons and diffing against the hand-written scenes (must be slot-fillable to reproduce them). This is the big lever; gate it on a green diff.
4. **Ship the Workflow driver** wrapping the now-deterministic stages + LLM-node spawns, single-lesson first.
5. **Ship `run-lessons-batch.mjs` + `voice-queue.mjs`** for parallel lessons.
6. **Ship prompt-cache prefixing** in the subagent-spawn helper (cross-cutting, can land anytime after step 4).

Each step is independently useful and reversible; nothing requires a big-bang cutover.

---

## Structural changes requiring approval (CLAUDE.md / skill / wave-contract edits)

These touch wave contracts / skills and per CLAUDE.md "Structural changes… require user approval":

1. **CLAUDE.md "Subagent Workflow":** change Wave 3.5 reconcile and Wave 0/3.5 "orchestrator-owned" language from *human-performed* to *Workflow-node-performed*; add **Stage 3.6 codegen-scene** as a new deterministic node between reconcile and composer.
2. **`remotion-lesson-composer` SKILL.md:** change the composer's contract from "hand-author `LessonScene.tsx` + `manifest.ts` + `layout.ts`" to "**fill the `// <<slot:*>>` regions** of the codegen output + author `layout.ts` constants + bbox formulas; never edit frozen regions." This is a real wave-contract change.
3. **`visual-discipline` SKILL.md (Visual Contract):** require a machine-readable fenced block (` ```yaml ` per-cue: load-bearing element ids + zone hints + visualMotionSeconds) **in addition to** the prose Visual Contract, so codegen + reconcile can parse it. Prose stays; we add structure.
4. **`docs/pipeline-architecture.md`:** add a Changelog v2 entry documenting Stage 3.6 codegen, the deterministic 3.5, and that `cue-timeline.json` + `<camel>Timeline.ts` are now actually emitted (closing the §4 gap where they were described but absent).
5. **CAPABILITIES.md:** per its own protocol, register `codegen-scene` and `reconcile-cues` if we treat them as reusable craft tools (borderline — they are pipeline scripts, not scene-time primitives; flag for the owner to decide).
6. **`package.json` scripts:** add `lesson:workflow`, `lesson:reconcile`, `lesson:codegen`, `lesson:batch`, `lesson:voice-queue` (additive; existing scripts unchanged).

Non-structural (no approval needed): the new scripts themselves, the `timed-node.mjs` wrapper, fixing the scaffold `voice.script` bug (#7).

---

## Effort estimate & risks

**Effort:** instrumentation ~0.5d; reconcile ~1d; codegen-scene ~2-3d (the parser for the VC yaml block + the emitters + the frozen-region hash check + the 3-lesson diff validation is the bulk); Workflow driver ~2d; batch + voice-queue ~1.5d; prompt-cache prefixing ~0.5d. **Total ~7.5-8.5 dev-days**, shippable incrementally.

**Risks:**
- **VC machine-readability:** codegen depends on a parseable Visual Contract. If Wave 2a's yaml block is wrong/missing, codegen produces a thin skeleton. Mitigation: codegen degrades gracefully (emits the always-mechanical parts — imports, cueFrames, per-cue Sequence shells, audio/caption tail — even with no VC data) and flags missing VC rows in its node return.
- **Frozen-region drift:** if a composer hand-edits a frozen region, re-running codegen would clobber it or vice-versa. Mitigation: codegen-hash header + a lint rule that fails on frozen-region edits.
- **Codegen can't reproduce the three existing scenes' nuances** (they were authored before this convention; e.g. `MakeTenLessonScene` may have bespoke structure). Mitigation: rollout step 3 gates on the diff; lessons that don't round-trip stay hand-authored until codegen covers their shape.
- **Parallel-lesson dir collisions:** two lessons writing `src/lessons/generated/` concurrently. Mitigation: paths are keyed by `camelLessonId` (already unique per CLAUDE.md naming rule); the driver asserts no two in-flight lessons share a camel id.
- **Disk/CPU at fleet scale:** render is 10-20min and bundle is heavy; thousands of concurrent renders will saturate disk (this very environment hit ENOSPC). Mitigation: render is its own concurrency-limited stage; budget table will show when render becomes the floor.
- **Prompt-cache invalidation:** any edit to CLAUDE.md/skills busts tier-1 cache for all in-flight runs. Acceptable — those files change rarely.

---

## Open questions

1. Does the `Workflow` tool runtime expose a node-graph API (declare nodes + barriers + returns) or must the driver be a plain Node script that spawns subagents via the Task tool? The phase/stage shape above assumes the latter; if the former, map stages → workflow nodes 1:1.
2. Should Stage 3.6 codegen also emit the **sketch-overlay** skeleton (cue-relative mark stubs), or does Wave 4b stay fully hand-authored? (Sketch is lower volume; defer unless it shows up in the budget table.)
3. Visual Contract yaml schema: who owns it — `visual-discipline` skill or a new `manifestTypes`-style `visualContractTypes.ts` with a JSON schema codegen + reconcile both validate against? (Recommend the latter for a single source of truth.)
4. For parallel-lesson voice: is the Gemini Aoede quota/rate-limit high enough for `--tts 4`+ concurrency, or does the queue need backoff? Needs a quota check before fleet rollout.
5. The scaffold `voice.script` bug (#7) — fix in scaffold only, or also migrate existing `pipeline.json`s? (Recommend both; trivial.)
