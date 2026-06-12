# kptest-whats-your-name — Primitive Gap Scan (W3b)

Analysis of teaching actions from storyboard.md against TEACHING-ACTIONS.md requirements and existing catalog (src/capabilities/catalog-digest.md).

| Teaching Action | Required Capability (from TEACHING-ACTIONS.md) | Existing Catalog Entry | Decision | Notes |
|-----------------|------------------------------------------------|------------------------|----------|-------|
| stage-the-moment | `component` = `DialogueExchange` turn; identity-invariant cast | `dialogue-exchange` (Motion components) | REUSE | Supports turns, emphasis flag, gesture:'lean-in'. Identity-invariant kid characters reused from kp1-hello-greetings. |
| model-target-slow | **audio**: voice says target slowly, isolated<br>**visual/layout**: target glyph big, centered, nothing on top<br>`component` = large glyph / `DialogueExchange` emphasis turn | **audio**: handled by voice generation<br>`target-word` (Literacy)<br>`dialogue-exchange` (Motion components) | REUSE | `target-word` displays glyph big/centered/nothing on top.<br>`dialogue-exchange` emphasis turn triggers `PulseCircle` for syllable emphasis. |
| track-read-along | `component` = `ReadAlongHighlight`<br>**visual/layout**: phrase row legible at min type size | `read-along-highlight` (Motion components) | REUSE | Sweeps highlight across spoken phrase with cursor. Supports weighted beats[] for syllable emphasis. |
| invite-echo | **audio**: model line + silent gap (gap: { reason: "learner-response" })<br>**visual/layout**: clear "your turn" cue | **audio**: handled by voice generation + gap mechanism<br>Scene design using `dialogue-exchange` and visual positioning | REUSE | "Your turn" conveyed by showing which child is gesturing/speaking via `dialogue-exchange` gesture prop and layout. No additional component needed. |
| spaced-recall | **visual/layout**: live highlight / punctuation lands on currently-spoken item<br>`component` = recap stack + single live marker | `read-along-highlight` (Motion components)<br>`pulse-circle` (Motion components) | REUSE | `read-along-highlight` tracks current item across multiple lines (ask → answer → ask‑swap → answer‑swap).<br>`pulse-circle` provides closing punctuation pulse (lesson's second allowed pulse). |

## Gap Summary
**NO GAPS IDENTIFIED** — All teaching action requirements are satisfied by existing, registered primitives/components.

## Intro Card Check
Every lesson opens with a topic-intro card. The normalized `lesson-intro-card` primitive exists and fits this subject (no lesson-specific customization required). Reuse confirmed.

## Registry Impact
No new primitives to register. Existing components (`dialogue-exchange`, `read-along-highlight`, `target-word`, `pulse-circle`, `lesson-intro-card`) are already in the drift-gated registry and satisfy all lesson requirements.