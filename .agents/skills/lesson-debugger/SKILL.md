---
name: lesson-debugger
description: Use when triaging user feedback on a rendered lesson MP4 — symptom→wave mapping, minimal re-run flags, and the structural-change approval protocol. Not for use during waves 1–5 video production.
---

# Lesson Debugger

Invoked only after the user reviews the rendered MP4 and reports an issue.

## Symptom → Owner

| Symptom                                          | Owner                                                      |
| ------------------------------------------------ | ---------------------------------------------------------- |
| Concept / learning goal wrong                    | W1 storyboard                                              |
| Confusing visuals / object choice                | W2 visual-design (Visual Contract)                         |
| Script content or narration pacing               | W2 audio/captions (script content) OR voice config         |
| Caption timing off                               | W3 voice/ASR — re-check transcript before adjusting        |
| Label overlaps art / element inside wrong region | W2 visual-design — zones not declared (kids-eye §1.5)      |
| Comparison sides don't match (different vocab)   | W2 visual-design — identity-preserved-transformation broken (kids-eye §4) |
| Teaching object doesn't read at glance           | W3 primitive-gap-scan — finger-cover test was skipped      |
| Teacher marks / pointer misaligned               | W4 sketch-layer (cue-relative offsets) OR composer (frame literal bug) |
| Sketch marks render past video end / wrong cue   | W4 composer — frame literals used instead of cue-relative  |
| Two marks overlap, or a mark covers the glyph it annotates | W4 composer/sketch — anchor geometry wrong (park the mark in the clear gap; not a frame-literal issue) |
| Duplicate / "twin" components stacked (e.g. a migrated glyph and its destination both rendered) | W4 composer — handoff visibility window + landing position (source must fade before/as destination lands) |
| Primitives crammed / overlapping with no gap inside one zone | W2 visual-design (multiplicity doesn't fit the canvas) + W4 composer (compute pitch ≥ size + gap) |
| Number / label overflows its card / wrapper (no padding) | W3 primitive — glyph inset on the wrapper (e.g. NumberCard) |
| Audio jumps straight to the next sentence / no breath at a cue boundary | W3 voice generation — enforce a min inter-cue silence in voice.json / generate-voice |
| Voice spoke wrong / truncated narration          | W3 voice — re-prompt with audio-captions ASR-flag fix      |
| Voice rushes / pacing mismatched to motion       | Wave-order failure — composer ran before voice + ASR existed; check Wave 3 happened |
| Voice ends mid-video / picture static after audio ends / captions linger past audio | Padded-hold regression — `<X>LessonTimeline.ts` re-introduced `PADDED_CUE_DURATIONS_FRAMES` or similar. Per docs/pipeline-architecture.md, the timeline must be the Wave 3.5 reconciled cues only. Fix: re-run Wave 3.5, ensure timeline file exports the reconciled cues directly. |
| Audio cue N plays while visual still shows cue N-1 | Same root cause as above — visual+caption on a padded timeline, audio on raw. Fix at Wave 3.5; no recomposition needed. |
| Broken shape, layout, scene mount                | W4 composer or W3 primitive build                          |
| Voice tone / language                            | pipeline.json voice config                                 |
| Render artifact                                  | render step — inspect ffprobe, re-run                      |

## Pick the smallest fix

1. Bad input → re-spawn the upstream subagent with corrected input (single wave re-run).
2. Skill incomplete → add a concise spec line to the skill.
3. Prompt missed an edge case → adjust the prompt template for that subagent, not the skill.
4. No skill or wave covers it → propose a structural change (see below).

## Re-run minimally

- **Visual fix, no script change:** re-spawn Wave 2 visual-design + Wave 4 composer. Voice/ASR untouched. Render with `--skip-voice`.
- **Script content change (a cue's narration):** re-spawn Wave 1 storyboard (cue edit only) → Wave 3 voice + ASR (REQUIRED) → my-eyes-on-transcript audit → Wave 4 composer + sketch-layer → render.
- **Pipeline config change (voice tone/voice name):** re-run Wave 3 voice → audit → re-render with `--skip-voice` on the existing scene (or re-spawn composer if cue lengths shifted significantly).
- **Frame-literal bug in composer:** re-spawn Wave 4 composer only. Voice/ASR untouched. Render with `--skip-voice`.

## Audit the transcript (orchestrator check, not delegated)

After ANY voice re-run, the orchestrator personally reads:
- `lesson-data/<id>/gemini-voice.json` → `transcriptText` and `script` (compare line by line)
- `src/lessons/generated/<camelId>Timing.ts` → matchScore, asrText per cue

For each cue, confirm:
1. The voice actually spoke the scripted narration (transcript text ≈ script).
2. ASR matchScore ≥ 0.8 (low scores hint at truncation, mishearing, or pace issues).
3. Cue durations are ≥ caption-readable minimum (1.0s).

If any cue fails, fix the upstream input (often a rewording per audio-captions §ASR concerns) and re-run voice. Do NOT proceed to composer with bad audio.

## Structural changes (need user approval)

Show the proposal in plain text and wait for approval before:
- creating a new skill
- adding, removing, or reordering a workflow wave
- changing subagent ownership or input contracts
- modifying CLAUDE.md project-rules sections

Spec edits inside existing skills do not need approval.

## Close

Verify the fix against the user's original report before declaring done. If a recurring pattern emerges across feedback, propose a CLAUDE.md update.

## Recurring patterns observed (update as we learn)

- **Frame literals in scene code** (KP1 round 1): composer ignored "use cue boundaries" rule for sketch marks. Fix: zero-frame-literal rule explicit in remotion-lesson-composer skill.
- **Voice-pace assumption** (KP1 round 1): composer wrote timing-dependent code from audio-captions estimates instead of ASR-aligned reality. Fix: wave reorder — voice + ASR before composer.
- **Label-on-art overlap** (KP1 round 1): visual-design said "next to" without coordinates. Fix: zones declaration required (kids-eye §1.5).
- **Comparison breaks identity** (KP1 round 1): visual-design specified different visual vocabulary on left vs right. Fix: identity-preserved-transformation rule (kids-eye §4).
- **Ignored upstream ASR flag** (KP1 round 1): audio-captions flagged cue 3 risk with a fix; orchestrator passed silently. Fix: FLAGS-NOT-ADVISORY in CLAUDE.md.
- **Audio/visual timeline desync** (kp1-fen-yu-he-intro, 2026-05-28): audio played raw ASR timing while visuals + captions played a composer-padded timeline; 62s of accumulated drift. Fix: introduced timeline-inversion architecture (visual-first → narration-as-commentary → frozen audio → Wave 3.5 reconcile). See `docs/pipeline-architecture.md` v1.
- **Element-blind bbox gate** (fen-yu-he, 2026-05-28): `npm run lesson:check` reported collisionCount 0 even with visible overlaps because it only checked zone-pair allow rules and treated same-zone (a===b) overlaps as always-allowed — letting overlapping marks, crammed column diagrams, twin/duplicate cards, and a mark-over-glyph all pass. Fix: the gate is now element-pair aware — at every keyFrame it compares each pair of distinct mounted elements and flags `intersectArea / min(bboxArea) > 0.15` unless the zone pair is in ALLOWED_OVERLAPS; the blanket same-zone exemption was removed (only `decoration:decoration` and any `caption` pair stay exempt). `scripts/lesson-manifest.mjs` + `src/lessons/manifestTypes.ts`.
