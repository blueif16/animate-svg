---
name: complete-video-pipeline
description: Use when creating or regenerating a complete Remotion lesson video with storyboard, SVG/sketch visuals, teacher voice, ASR-derived alignment, captions, render checks, and subagent handoffs.
---

# Complete Video Pipeline

Use this skill to turn a lesson idea into a rendered Remotion video, not a primitive showcase.

## Single Entry

Run the deterministic pipeline from `remotion-svg-primitives/` with an explicit lesson config:

```bash
npm run lesson:render -- --config lesson-data/<lesson-id>/pipeline.json
```

The config owns every lesson-specific input and output: lesson ID, cue plan, Remotion entry, composition ID, audio output, ASR JSON output, generated timing file, final MP4 path, voice model, and voice name.

Use `-- --skip-voice` only when intentionally reusing an existing aligned voice file.

## Subagent Split

For non-trivial new lessons, explicitly ask for subagents before implementation. Keep each subagent scoped to one independent context and one artifact.

- Storyboard subagent: output cue IDs, narration beats, learning goal, and required visuals.
- Visual design subagent: output object choices, layout rules, tone/taste notes, and clarity risks for the target audience.
- Sketch layer subagent: output where teacher marks, pointers, or sketch-style cues clarify the concept.
- Audio/caption subagent: use `lesson-audio-captions`; output teacher script, caption text, and intended cue boundaries.
- Primitive gap subagent: inspect existing primitives and output the exact missing reusable components, props, and demo needs.
- Primitive builder subagent: when the needed SVG primitive does not exist, create or extend primitives in `src/shape-primitives/` with focused demos before lesson composition. Keep primitives prop-driven and lesson-agnostic.
- Composer subagent: use `remotion-lesson-composer`; implement only the approved lesson files and keep animation timing cue-driven from generated ASR timing.
- Verification subagent: review rendered stills/video for lesson correctness, visual clarity, audio-caption alignment, and render readiness.

The main agent owns integration: define the config, merge subagent artifacts, generate voice, inspect ASR products, correct cue timestamps from detected text/times, render, and report verification.

## Subagent Contract

Every subagent prompt must state:

- Input: the lesson idea or artifact it receives.
- Output: the exact file(s), JSON shape, or report it must produce.
- Ownership: the paths it may edit.
- Reuse rule: reusable scripts, shared components, and primitives must not hardcode lesson-specific topics, copy, timings, paths, prompts, or model settings.

## Primitive Provision

Composition starts only after the primitive gap is resolved. If a lesson needs visuals not covered by current primitives, run the primitive gap subagent first, then a primitive builder subagent with ownership of the primitive files. The composer consumes those primitives; it does not create one-off SVG art inside a lesson scene unless the visual is truly lesson-specific.

## Alignment Rule

Do not treat ASR as a pass/fail gate. Inspect the extracted transcript, token events, detected timestamps, tokenizer settings, and planned cue text. The final cue timing must point to the actual spoken words, even when the ASR output is imperfect.

## BGM Rule

Leave background music out unless the user explicitly asks for it. Voice, captions, and SVG timing come first.
