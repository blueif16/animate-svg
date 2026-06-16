# W4b sketch-overlay log — kptest-first-second-third

## INPUTS READ

| file | path |
|---|---|
| SKILL | /Users/tk/Desktop/animation-test/.agents/skills/sketch-explainer-layer/SKILL.md |
| CAPABILITIES | /Users/tk/Desktop/animation-test/.agents/CAPABILITIES.md (sketch-boil, sketch-settle entries) |
| Timeline | /Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/kptestFirstSecondThirdLessonTimeline.ts |
| visual-design | /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-first-second-third/visual-design.md |
| pedagogy | /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-first-second-third/pedagogy.md |

## OUTPUTS WRITTEN

| file | path |
|---|---|
| sketch-overlay.md | /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-first-second-third/sketch-overlay.md |
| this log | /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-first-second-third/_logs/sketch-overlay.md |

## COMMANDS RUN

None (no npm/bash commands required for this node — pure spec authoring).

## KEY DECISIONS

1. **2 marks out of 13 cues (15%).** Ceiling is floor(13×0.6)=7. Applied restraint principle strictly: marks only where signal is NOT already carried by the scene's visual primitives.
2. **count-second — flag-origin underline.** The `ordered-row-spotlight` sweep launches from the flag but does not *declare* the flag as the rule's fixed origin. A short underline under the flag at the sweep's onset adds that explicit signal. Boil omitted (hold ≤1s, competing with sweep motion).
3. **count-third — full-queue wrap-arc (climax).** Appears AFTER all three chip pulses complete, arcing flag→animal-3. Signals "this whole queue, counted from the front, has three named positions." The per-chip pulses do not carry the group-as-unit signal alone. One climax mark per video. Boil magnitude:3/holdFrames:5 + settle magnitude:0.08 applied (held ≥2s post-draw; calm pedagogy stage).
4. **All other cues: no mark.** Each cue's pedagogy signal was already carried by a scene element (chip attach/pulse, sparkle, step-forward, pointer-hand-arrow, prompt affordance). Adding marks would duplicate.
5. **Zone discipline.** Both marks anchored entirely within zone-objects (flag area and queue spine, y≈510 and y≈600). The wrap-arc apex bows into the neutral gap between zone-chips (bottom ≈470) and zone-objects (top ≈500) — still within zone-marks full-bleed. Neither mark enters zone-chips or zone-caption.

## ISSUES

None.

## PIPELINE FINDINGS

- The skill spec says to read `lesson-data/<id>/storyboard.md` for the "sketch-overlay-need" column per cue; that column is not present in the storyboard for this lesson. The wave successfully derived marks from pedagogy + visual-design instead. **Recommend: add a `sketch-overlay-need` column to the storyboard artifact in W1 so W4b has an explicit upstream signal.** (Pipeline finding — future improvement.)
- Cue-relative `fadeOutRelativeStart` = `cueLength - 8` requires the composer to know each cue's total frame count. The skill spec provides the formula; no structural gap.
