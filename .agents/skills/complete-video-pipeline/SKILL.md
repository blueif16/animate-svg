---
name: complete-video-pipeline
description: Orchestrator overview of the lesson video pipeline. Use when starting any lesson. Documents the wave order, subagent contracts, and the orchestrator's responsibilities (most importantly: the LLM checks the transcript itself before composer runs).
---

# Complete Video Pipeline

The orchestrator's map of the lesson-video workflow. The orchestrator coordinates; subagents implement.

## Entry point

```bash
cd remotion-svg-primitives && npm run lesson:render -- --config lesson-data/<lesson-id>/pipeline.json
```

`pipeline.json` is the single source of lesson-specific inputs/outputs. Scaffold a new lesson's pipeline.json via:

```bash
cd remotion-svg-primitives && npm run lesson:scaffold -- --id <lesson-id>
```

The scaffold reads `lesson-data/_template/pipeline.json` and `lesson-data/_shared/voice.json` — never clone from an existing lesson.

## Wave order

```
Wave 0: lesson-pedagogy            ← FIRST. Orchestrator-owned. NOT a subagent.
       │ Output: lesson-data/<id>/pedagogy.md
       │ One paragraph per cue: { discovery, stage, focal }
       │ Decides WHAT the child discovers at each beat — before any visual choice.
       │ Every downstream wave reads this and refuses to advance without it.
                │
Wave 1: lesson-storyboard          defines cue IDs, narration beats, required visuals
       │ Loads pedagogy.md as input; each cue maps to one discovery sentence.
                │
Wave 2a: visual-design                                  (FIRST half of Wave 2)
       │ (lesson-pedagogy + kids-eye + visual-discipline + early-childhood-visual-taste)
       │ Output: Visual Contract — zones, identity-invariant, motion vocabulary,
       │         AND per-cue motion-budget (visualMotionSeconds).
       │ ★ The motion-budget line is the input Wave 2b targets. ★
       │ NO absolute frames yet — only intent + per-cue seconds.
                │
Wave 2b: audio/captions                                 (SERIAL after 2a, NOT parallel)
       │ Reads visual-design.md, especially the motion-budget block.
       │ Writes per-cue narration TO FIT each cue's visualMotionSeconds
       │ at the calibrated voice rate (Aoede ≈ 0.30s/Chinese-char).
       │ Output: audio-captions.md (NO §3 hold table) + script-cues.json.
                │
       ┌────────┴────────┐
Wave 3: voice + ASR     primitive-gap-scan → primitive-builder    (parallel)
       │ npm run lesson:voice -- --config <path>
       │ Output: src/lessons/generated/<camelId>Timing.ts (raw aligned cues).
       │ These are the FROZEN audio cue durations.
       │           +
       │   ★ ORCHESTRATOR AUDITS THE TRANSCRIPT ★
       │   Reads gemini-voice.json transcriptText vs script, per-cue
       │   matchScore + asrText. If a cue is truncated / misspoken / low-
       │   score, edit THAT ONE CUE'S text in script-cues.json and re-run
       │   voice for that one cue. Audio is locked once accepted.
       └────────┬────────┘
                │
Wave 3.5: cue-timeline reconcile                        (orchestrator-owned)
       │ Reads: visual-design.md (visualMotionSeconds per cue) +
       │        generated/<X>Timing.ts (narrationFrames per cue)
       │ Computes per-cue reconciled cue: cueFrames = max(narration, motion)
       │ + tail (≤ 0.3s). Chains cues end-to-end.
       │ Embeds the result directly into src/lessons/<X>LessonTimeline.ts
       │ as the exported `<X>Cues` array. No more PADDED_CUE_DURATIONS_FRAMES
       │ table. Audio, visuals, captions all read this single timeline.
       │ See docs/pipeline-architecture.md for full rationale.
                │
       ┌────────┴────────┐
Wave 4: composer       sketch-layer                     (parallel; both consume the RECONCILED timeline)
       │ Output: scene + timeline + Complete<X>Lesson + Root.tsx registration
       │ ZERO frame literals — every frame derives from cues[id].startFrame
       │ Composer renders ONE still of the climax + grades against Visual Contract
       │ AND reruns the pedagogy §1 question per cue: does the rendered frame
       │ still teach what pedagogy.md said it should? If no, redraw the picture —
       │ not the JSX, not the props, the picture.
       └────────┬────────┘
                │
Wave 5: render --skip-voice
       │ Voice already exists from Wave 3; render-only step
       │ npm run lesson:render -- --config <path>   (auto-skip-voice if timing exists)
                │
Wave 6: lesson-verification
       │ Audit alignment, durations, primitive coverage, pedagogy invariants
       │ Output: lesson-data/<id>/verification.md
                │
       (if user reports issue) → lesson-debugger
```

## Subagent input contracts

Every subagent prompt must state:
- Input artifacts (full paths)
- Output artifact (full path)
- Owned paths (where it may edit)
- The lesson-agnostic rule (primitives stay lesson-agnostic; lesson files stay in `lesson-data/<id>/` and `src/lessons/<camelId>/`)

## Orchestrator responsibilities (NOT delegated)

1. **Pedagogy decision (Wave 0).** Before spawning any subagent, the orchestrator writes `lesson-data/<id>/pedagogy.md` following `lesson-pedagogy` SKILL. One paragraph per cue: `discovery`, `stage`, `focal`. If `discovery` is fuzzy or doesn't fit one of the three shapes in `lesson-pedagogy` §1, the cue isn't done — tighten or fold it before proceeding. The §1 question is the orchestrator's first decision; never delegate it.

2. **Wave gating.** No wave runs before its inputs exist. Specifically: composer does not run before Wave 3 has produced the ASR-aligned timing module. Storyboard does not run before `pedagogy.md` exists.

3. **Transcript audit (between Wave 3 and Wave 4).** The LLM reads:
   - `lesson-data/<id>/gemini-voice.json` — `transcriptText` vs `script` line by line
   - `src/lessons/generated/<camelId>Timing.ts` — per-cue matchScore, asrText, startFrame/endFrame, duration

   For each cue, confirm: voice spoke the scripted narration, matchScore ≥ 0.8, cue duration ≥ 1.0s.

   If any cue fails → fix upstream input (often a rewording from audio-captions §ASR concerns), re-run Wave 3, audit again. Do not proceed to Wave 4 with bad audio.

4. **Flag triage.** When audio-captions (Wave 2b) flags an ASR risk with a proposed fix: apply it or record an explicit decision to ignore. Silent passes are forbidden.

5. **Cue-timeline reconcile (Wave 3.5).** Orchestrator-owned mechanical step. After Wave 3a's audio is accepted, read visualMotionSeconds from visual-design.md and narrationFrames from the generated timing module. Compute `cueFrames = max(narration, motion) + tail`. Embed the reconciled cue list into `<X>LessonTimeline.ts`. The composer reads from there. No padded-hold table. Audio is frozen.

6. **Structural-change approval.** Any wave reorder, new skill, or changed subagent contract requires user approval before implementation.

## Skills used per wave

| Wave | Skills loaded by the orchestrator / subagents |
|------|----------------------------------------------|
| 0 (pedagogy) | `lesson-pedagogy` — orchestrator-owned, never delegated |
| 1 | `lesson-storyboard` + `lesson-pedagogy` (read-only) |
| 2a (visual-design) | `lesson-pedagogy` (read-only), `kids-eye`, `visual-discipline`, `early-childhood-visual-taste` |
| 2b (audio/captions) | `lesson-audio-captions`, `lesson-pedagogy` (read-only — for §4 narration-leakage check) |
| 3 (voice+ASR, primitives) | none specific — orchestrator runs `npm run lesson:voice` and verifies; primitive subagents follow gap-scan and finger-cover discipline (`kids-eye` §3) |
| 4a (composer) | `remotion-lesson-composer`, `lesson-pedagogy` (read-only — final §1 audit), `kids-eye`, `visual-discipline` |
| 4b (sketch-layer) | `sketch-explainer-layer`, `kids-eye` |
| 5 (render) | none — `npm run lesson:render -- --skip-voice` |
| 6 (verification) | `lesson-verification`, `lesson-pedagogy` (read-only — does the MP4 deliver the declared discoveries?) |
| feedback (post-render) | `lesson-debugger` |

`lesson-debugger` is NEVER loaded during waves 1–5. It exists only for the post-render feedback loop.

## Feedback loop

After render + verification, the user reviews the MP4. If issues:
1. Orchestrator invokes `lesson-debugger` (symptom → owner mapping).
2. Smallest fix: re-spawn the responsible wave only.
3. Re-render with minimal flags (`--skip-voice` if voice is fine; full run if voice changed).
4. Verify against original feedback before declaring done.

## Project rule reminders

- All lesson video work runs through `npm run lesson:render`.
- Reusable scripts, primitives, components stay lesson-agnostic.
- Lesson-specific content lives only under `lesson-data/<id>/` and `src/lessons/<camelId>/`.
- Structural changes (new skill, new wave, reordered waves, changed subagent contracts) need user approval.
- The orchestrator never writes implementation code — it spawns subagents. Exceptions: infrastructure scripts (scaffold, lesson:voice runner) are orchestrator-direct work.
- **Capabilities registry is canonical.** Every reusable craft tool (motion vocabulary, PopIn variants, sketch boil, etc.) is declared in `.agents/CAPABILITIES.md`. Wave 4 subagent prompts must point to the relevant capability entry by id (e.g. "use `motion-vocabulary` and `sketch-boil` from CAPABILITIES.md"). Raw `Easing.bezier(...)` literals or inline spring configs in scene code are a regression. When the project ships a new reusable feature, follow the protocol at the top of CAPABILITIES.md.
