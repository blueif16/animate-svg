# W2a — Visual Design Log

## INPUTS READ

| File | Purpose |
|---|---|
| `.agents/skills/kids-eye/SKILL.md` | Viewer-first discipline: measurement block, zones, finger-cover, identity-invariant |
| `.agents/skills/visual-discipline/SKILL.md` | Visual Contract mechanics: one-metaphor, container budget, occupancy, motion-budget |
| `.agents/skills/early-childhood-visual-taste/SKILL.md` | Palette, typography, motion vocabulary for early-childhood lessons |
| `lesson-data/kptest-greetings-verify/brief.md` | Lesson brief: 三年级 L2 English greetings, 3 phrases, I'm key-difficult |
| `lesson-data/kptest-greetings-verify/pedagogy.md` | Per-cue discovery, stage, focal, reinforcement reasoning |
| `lesson-data/kptest-greetings-verify/storyboard.md` | Per-cue teaching actions, required visuals, cast, acquisition spine |
| `lesson-data/kptest-greetings-verify/pipeline.json` | Lesson config: fps=30, composition, cue plan, voice settings |
| `.agents/TEACHING-ACTIONS.md` | Teaching-move vocabulary with binding `requires` (layout/legibility constraints) |
| `.agents/CAPABILITIES.md` | Reusable craft registry: motion vocabulary, PopIn variants, Breathe, sketch-boil |
| `src/capabilities/catalog-digest.md` | Authoritative primitive/component inventory (62/62 documented) |
| `research/teaching-tempo-pacing-2026-06-08.md` | Per-behavior time floors for acquisition L2 lessons |

## OUTPUTS WRITTEN

| File | Description |
|---|---|
| `lesson-data/kptest-greetings-verify/visual-design.md` | Visual Contract: measurement block, zones, palette, metaphor, per-cue visualMotionSeconds, finger-cover test, component reuse map |

## COMMANDS RUN

No commands run — this is a design-intent artifact, no builds or renders.

## KEY DECISIONS

1. **Teaching unit = English target word letter at cursor position.** Not a math countable; the smallest signal-carrying mark is a single English letter in the ReadAlongHighlight. Sized at ≥86px (8% of 1080 short-side).

2. **Three temporal zone configurations.** C0 (intro card alone), C1–C5 (characters + bubbles + RAH in three horizontal bands), C6 (recap stack replaces bubbles + RAH). No zone overlap across configurations.

3. **Motion budgets honor comprehension-time floors.** Total visualMotionSeconds = 45.0s across 7 cues. Key-difficult "I'm" slow-model gets 9.0s (hitting the ~9–15s model-target-slow floor). Recap gets 13.0s (within the ~15–30s spaced-recall floor, adjusted for 3 phrases not 6). Learner gap gets 5.0s (the held scene through ≥3–5s silence).

4. **One accent moment: `PopIn motion="bouncy"` on the "I'm Sam" bubble in C2 only.** All other bubble entrances use the DialogueExchange default.

5. **No sketch marks planned.** Language lesson — characters + speech carry the teaching. Sketch marks would compete with spoken-word focus. Left the door open for W4 sketch-layer subagent to add at most one motivated mark.

6. **School-gate backdrop identified as asset gap for W3b.** NOT a registered primitive — either a scene-composed SVG or an IconAsset if one exists. Must be simple (two pillars + arch), no text, no decoration.

7. **ReadAlongHighlight cursor variant varies by cue** for visual variety: ball (C1, C5, C6), underline (C3), none (C4). This provides the "variety within repetition" the pacing research recommends.

8. **Characters Breathe-wrapped for rule #6.** Both Kid A and Kid B wrapped in `<Breathe>` with distinct phaseSeeds ("kid-a", "kid-b") for non-synced breathing during holds.

## ISSUES

None — all required components exist in catalog-digest.md. The school-gate backdrop is the only potential gap for W3b.

## PIPELINE FINDINGS

1. **School-gate IconAsset may need authoring.** The generated asset library (90 assets) does not include a school-gate background. W3b should either author one as a new IconAsset or compose it from simple SVG shapes in the scene. If authored as an IconAsset, it should be named `school-gate` and kept minimal (pillars + arch, no text, no decoration).

2. **Comprehension-time floor vs. brief length hint tension.** The brief suggests 45–60s; the research-backed per-behavior floors for this acquisition lesson (6 phrases, L2) suggest ~2 min. The visual motion budget (45s) plus narration (which will include slow models, choral invitations, and ≥3–5s silence) will likely land in the 75–120s range. The 45–60s hint is a scope guide, not a ceiling — the pipeline's "length emerges" principle resolves this at reconcile time. Flagging for awareness.

3. **ReadAlongHighlight `lines` array structure for multi-word tokens.** The RAH component sweeps item-by-item within a line. For the recap (lines:[["Hello / Hi"], ["I'm Sam"], ["Goodbye / Bye-Bye"]]), each line is a single-element array — the sweep activates the WHOLE line at once, not word-by-word within a line. This is intentional for the recap (each line is one retrieval unit). If finer-grained sweep is needed, the lines should be `[["Hello", "/", "Hi"], ["I'm", "Sam"], ["Goodbye", "/", "Bye-Bye"]]`. W4 composer should confirm the desired granularity.
