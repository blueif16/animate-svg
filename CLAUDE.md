# Project Rules

## Entry Point

All lesson video work runs through one command:

```bash
cd remotion-svg-primitives && npm run lesson:render -- --config lesson-data/<lesson-id>/pipeline.json
```

`pipeline.json` owns every lesson-specific input/output: lesson ID, cue plan, Remotion entry, composition ID, audio path, ASR JSON, generated timing, final MP4, voice model/name. Reusable scripts, primitives, and components stay lesson-agnostic — never hardcode lesson topics, copy, timings, or paths into them.

Use `-- --skip-voice` only when intentionally reusing an existing aligned voice file.

ASR alignment is an owned production artifact, not a pass/fail gate. Inspect the detected transcript, token events, timestamps, and tokenizer settings, then correct cue timing from evidence.

## Subagent Workflow

For a non-trivial lesson, the main agent orchestrates and does not implement directly. Work flows in waves so each subagent gets concrete inputs:

1. **storyboard** alone — defines cue IDs, narration beats, required visuals.
2. **visual-design** ∥ **audio/captions** — both depend on storyboard, run in parallel.
3. **sketch-layer** (needs visual-design + audio cue boundaries) ∥ **primitive-gap-scan → primitive-builder** (needs visual-design only). Sketch and primitive build overlap.
4. **composer** — integrates all upstream artifacts into the lesson scene.
5. **verification** — reviews the rendered MP4 post-render.

Every subagent prompt must state input, output artifact, owned paths, and the lesson-agnostic rule.

Primitives live in `remotion-svg-primitives/src/shape-primitives/` (prop-driven, reusable). The composer consumes existing primitives and generated timing — it does not create one-off SVG art inside lesson scenes.

## Skills

Use the matching skill at each step:

- `complete-video-pipeline` — orchestrator overview, when starting any lesson
- `lesson-storyboard` — cue IDs, narration beats, required visuals
- `early-childhood-visual-taste` — visual tone for math lessons
- `lesson-audio-captions` — teacher script, captions, cue boundaries
- `sketch-explainer-layer` — Excalidraw-style teacher marks over scenes
- `remotion-lesson-composer` — compose the lesson scene from approved artifacts
- `lesson-verification` — final check on rendered output

## Dev

- `npm run dev` — Remotion studio
- `npm run lint` — ESLint + tsc
