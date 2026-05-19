# Project Rules

## Video Pipeline Architecture

- Reusable video pipeline files must be lesson-agnostic. Put lesson IDs, scripts, prompts, voice names, ASR assets, token patterns, composition IDs, output paths, and FPS in `remotion-svg-primitives/lesson-data/<lesson-id>/pipeline.json`, not in shared scripts.
- Complete lesson videos must run through the single config entry:
  `cd remotion-svg-primitives && npm run lesson:render -- --config lesson-data/<lesson-id>/pipeline.json`
- Use `-- --skip-voice` only when intentionally reusing an existing aligned voice file.
- ASR alignment is an owned production artifact. Inspect detected transcript, token events, timestamps, tokenizer settings, and planned cue text, then correct cue timing from evidence. Do not treat ASR mismatch as a reject-only gate.

## Subagent Workflow

- For a new non-trivial lesson, the main agent orchestrates subagents instead of implementing everything in one context.
- Split work by artifact: storyboard, visual design, audio/captions, primitive gap scan, primitive/component creation, composition, and verification.
- Every subagent prompt must include its input contract, output artifact, owned files, and the rule that reusable files stay lesson-agnostic.
- If required primitives or components do not exist, run a primitive subagent before composition. The primitive subagent owns `remotion-svg-primitives/src/shape-primitives/` and any focused demo files, and must build reusable prop-driven primitives rather than one-off lesson art.
- The composer subagent composes only from existing lesson data, generated timing, and available primitives. It must not hardcode topic-specific values into reusable scripts or shared components.
