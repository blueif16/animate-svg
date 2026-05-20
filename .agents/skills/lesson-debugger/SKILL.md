---
name: lesson-debugger
description: Use when triaging user feedback on a rendered lesson MP4 — symptom→wave mapping, minimal re-run flags, and the structural-change approval protocol. Not for use during waves 1–4 video production.
---

# Lesson Debugger

Invoked only after the user reviews the rendered MP4 and reports an issue.

## Symptom → Owner

| Symptom                              | Owner                                          |
| ------------------------------------ | ---------------------------------------------- |
| Concept / learning goal wrong        | W1 storyboard                                  |
| Confusing visuals / object choice    | W2 visual-design                               |
| Script content or narration pacing   | W2 audio/captions                              |
| Caption timing off                   | audio/captions cue boundaries, then ASR fix    |
| Teacher marks / pointer misaligned   | W3 sketch-layer                                |
| Broken shape, layout, scene mount    | W4 composer or W3 primitive build              |
| Voice tone / language                | main agent's pipeline.json voice config        |
| Render artifact                      | render step — inspect ffprobe, re-run          |

## Pick the Smallest Fix

1. Bad input → re-spawn upstream sub with corrected input.
2. Skill incomplete → add a concise spec line to the skill.
3. Prompt missed an edge case → adjust the prompt template, not the skill.
4. No skill or wave covers it → propose a structural change (below).

## Re-Run Minimally

- `--skip-voice` — cue-timing fixes, visual changes, scene edits.
- `--skip-voice --skip-build` — pipeline.json-only changes (reuse bundle).
- Full run — voice script or voice config changed.

## Structural Changes (need user approval)

Show the proposal in plain text and wait for approval before:
- creating a new skill
- adding, removing, or reordering a workflow wave
- changing subagent ownership or input contracts

Spec edits inside existing skills do not need approval.

## Close

Verify the fix against the user's original report before declaring done. If a recurring pattern emerges across feedback, propose a CLAUDE.md update.
