# W4b Sketch Overlay Log

## INPUTS READ
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/brief.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/storyboard.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/pedagogy.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/visual-design.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/kptestFenyuheFiveLessonTimeline.ts
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/generated/kptestFenyuheFiveClips.ts
- /Users/tk/Desktop/animation-test/.agents/CAPABILITIES.md
- /Users/tk/Desktop/animation-test/.agents/skills/sketch-explainer-layer/SKILL.md

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/sketch-overlay.md

## COMMANDS RUN
- `ls -la /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/`
- `read` on each of the input files listed above
- `write` to produce sketch-overlay.md and this log file

## KEY DECISIONS
- Selected three marks based on restraint principle: two label-arrows (for conserve-1of4 and conserve-2of3) and one underline (for reveal-answer).
- Computed cue-relative timing using narrationFrames and motionFrames from clips and visual-design.md: drawOnRelativeStart = narrationFrames - motionFrames (when positive), drawOnDuration = motionFrames, fadeOutRelativeStart = cueLength - 8.
- Omitted `boil` and `settle` props because the mark's visible duration after draw-on is less than 1.5 seconds (hold time ≈ 1 frame before fade-out).
- Skipped marks for announce-topic, split-2of3, learner-response-gap, and spaced-recap-belts to avoid decoration and keep total marks ≤ floor(7 × 0.6) = 4.

## ISSUES
- Exact motion window start within each cue is not explicitly provided in inputs; inferred heuristic may misalign if narration includes trailing silence.
- Anchor descriptions rely on natural language; composer must resolve bond glyph center and dot-group center/layout data.

## PIPELINE FINDINGS
- Add explicit motion window start offsets (e.g., `visualStartFrame` per cue) to timeline data to eliminate guesswork.
- Consider exposing stable element IDs (e.g., `bond-glyph-id`, `dot-group-center-id`) in the scene layout for anchor specification in sketch overlays.
- Automate generation of cue-relative timing numbers from clips and visual budgets to reduce manual errors.