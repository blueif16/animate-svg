# W2c Sound Design Log

## INPUTS READ
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/brief.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/pedagogy.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/visual-design.md

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/audio-cues.json
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/_logs/sound-design.md

## COMMANDS RUN
None (only reads and writes)

## KEY DECISIONS
- **Bed**: Selected `math-calm-68-cmaj` (default for number/math lessons) with `toneSafe: false` because the lesson is math insight, not tone/pinyin teaching, despite Mandarin narration.
- **Intro sting**: Set to `null` because no mandarin-accent sting was found in the shared library; optional sting omitted.
- **Outro resolve**: Set to `true` (default) to let the bed rise as the last narration ends.
- **SFX mapping**:
  - Assumed each loose stick addition (from 1 to 9) corresponds to a cue (cues 0–8).
  - For cues 0–8 (first 8 sticks): used `count` event with `sound: tick`, `perStep: true`, `risingPitch: true` to sonify each counting step, providing auditory magnitude.
  - For cue 8 (ninth stick): used `reward` event with `sound: ta-da` to mark the final discovery (十九) as the single success beat per lesson.
  - Density: exactly one motivated SFX per cue (either count or reward), satisfying ≤1 SFX/beat rule.
  - No SFX over instruction words: relied on narration gaps (to be verified in W4).
- **Assumptions**:
  - Each stick addition maps to a single cue (to be validated against W3.5 cue boundaries).
  - Rising pitch for counting steps is evidence-informed ([ASSUMED]); flag for Wave 6 sanity-check.

## ISSUES
- None blocking; all inputs present and readable.

## PIPELINE FINDINGS
- The shared library lacks a explicit "mandarin-accent" sting; if Mandarin-toned stings are desired for future Mandarin topics, consider adding one to Wave 3c sound-asset lane.
- The count/risingPitch assumption may need validation with actual learner testing; recommend Wave 6 to evaluate auditory magnitude effectiveness for counting.
- Consider verifying cue boundaries in W3.5 to ensure each stick addition aligns with a distinct cue; if not, adjust SFX mapping accordingly.