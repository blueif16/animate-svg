# W2b Audio/Captions Log

## Inputs Read
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/pedagogy.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/storyboard.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/visual-design.md
- /Users/tk/Desktop/animation-test/.agents/skills/lesson-audio-captions/SKILL.md
- /Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md

## Outputs Written
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/audio-captions.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-five/script-cues.json

## Commands Run
No external commands were run; files were read and written using the agent's built-in tools.

## Key Decisions
1. Narration length targeting: Aimed for narration audio duration within ±20% of the per-cue visualMotionSeconds from visual-design.md, using a rate of ~0.30s per Chinese character for Aoede voice.
2. For very short cues (0.4s and 0.6s), used minimal narration (1-2 characters) to stay within range where possible, accepting slight under/over when unavoidable.
3. Added a learner-response gap of 3 seconds to cue-learner-response-gap as required by the storyboard's invite-echo → learner-response-gap sequence.
4. Avoided narration-leakage by naming actions or units (e.g., bond glyphs, verbs like "看", "想") rather than counts or relations that the picture delivers.
5. ASR risks: Flagged single-character narration in cue-learner-response-gap as medium risk; mitigation would be to pair with a companion but was not done due to extreme time constraints; noted for Wave 3a audit.
6. Caption text set verbatim to narration per skill requirement; acknowledged that this may limit instructional flexibility for invite-echo cue but follows the rule.

## Issues
- The narration for cue-learner-response-gap is a single character ("想") which is 0.3s, slightly below the 20% lower bound of 0.32s for its 0.4s visualMotionSeconds budget. This is due to the need to leave ample time for the learner-response gap; the discrepancy is small (6.25% under) and the gap carries the primary pedagogical wait-time.
- The caption for cue-learner-response-gap will display "想" for the entire cue window (narration + gap + tail), which may not be ideal for a "your turn" prompt but is required by the skill's caption-verbatim rule.

## Pipeline Findings
- The extreme time constraints in some cues (particularly 0.4s cues) reveal a potential mismatch between the visual motion budgets and the minimum viable narration length for clear instructional commentary. Consider adjusting visual motion budgets in Wave 2a to allow for at least 0.35s of narration (±20% of 0.35s is 0.28s–0.42s, accommodating one character at 0.30s) or using bilingual narration where English words can convey more meaning per syllable.
- The single-character ASR risk in cue-learner-response-gap should be monitored in Wave 3a; if alignment confidence is low, consider mitigation in a future lesson revision (e.g., slightly adjusting the visual motion budget to allow two-character narration if pedagogically possible).
- All other cues satisfy the narration length targeting rule and avoid leakage.