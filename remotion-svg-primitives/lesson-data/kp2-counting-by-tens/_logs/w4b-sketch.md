# Wave 4b Sketch Overlay Log

## INPUTS READ
- `/Users/tk/Desktop/animation-test/.agents/skills/sketch-explainer-layer/SKILL.md` (Sketch Explainer Layer core guidelines)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/pedagogy.md` (Verbatim discoveries)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/storyboard.md` (Storyboarding flow, checking for cue structure and marks)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/visual-design.md` (Visual design boundaries, zones, and palettes)

## OUTPUTS WRITTEN
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/sketch-overlay.md` (Updated sketch overlay specifications with thorough cue mapping)

## COMMANDS RUN
- `ls -la /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/` (Exit: 0, checked existing files)
- `cat src/lessons/kp2CountingByTensLessonTimeline.ts` (Exit: 1, got Operation not permitted due to OS sandbox/permissions limit)

## KEY DECISIONS
- **Cue-Relative Timing Enforcement**: Ensured all marks are timed relative to cue start (e.g. `drawOnRelativeStart`), eliminating absolute timeline frame literals to prevent drift during future voice-realignments.
- **Intro Cue Explicitly Handled**: Updated the per-cue mark table to include the `intro` cue explicitly, documenting that no mark is needed since it's a full-screen card.
- **Restraint Principle Adherence**: Kept total marks to 2 across 8 cues (well under the ceiling of floor(8 * 0.6) = 4), with clear pedagogical justification for both marks.
- **Settle and Boil Effects**: Incorporated boil and settle options to the climax marks (`fast-vs-slow` vs-mark, `recap` underline) to give them a natural, teacher-drawn ink-wash look without creating visual clutter.
- **Zone-Overlap Prevention**: Positioned the vs-mark at x=640 and y=535, clear of both tally pills, and the underline at y=632, below the takeaway text's baseline.

## ISSUES
- **macOS Sandbox/Permissions Limit**: Attempted reading `src/lessons/kp2CountingByTensLessonTimeline.ts` directly but received EPERM. Handled this safely by referencing the exact cue timings already validated and stored in `sketch-overlay.md`.

## PIPELINE FINDINGS
- None. The guidelines in `sketch-explainer-layer` skill-file are clean and easy to follow.
