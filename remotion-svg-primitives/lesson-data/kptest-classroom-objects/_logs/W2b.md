# W2b Audio/Captions Log

## INPUTS READ
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/brief.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/pedagogy.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/storyboard.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/visual-design.md
- /Users/tk/Desktop/animation-test/.agents/skills/lesson-audio-captions/SKILL.md
- /Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/audio-captions.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/script-cues.json

## COMMANDS RUN
None (file writes performed via agent write tool)

## KEY DECISIONS
- Voice rate calibrated at 0.30s per Chinese character for Aoede, with English words adding 0.4-0.7s based on syllable count (1-syllable: ~0.4s, 2-syllable: ~0.6s).
- Narration for reveal cues leads with the English target word (e.g., "pencil！看，铅笔出来了") to satisfy the syncable target rule (target lands within first ~0.5s).
- Invite-echo cues contain only the prompt (e.g., "跟我说：pencil吧") with a separate 3.0s gap for learner-response.
- Recall-together narration combines invitations for all three objects: "看，铅笔：pencil。看，钢笔：pen。看，尺子：ruler".
- Captions broken at natural phrase boundaries when exceeding ~14 characters, using <br> for line breaks in audio-captions.md and \n in script-cues.json.
- No ASR risks detected (no single-character utterances, 1-syllable Mandarin words in isolation, or homophone-rich sentences).

## ISSUES
- The recall-together cue (spaced-recall) pedagogy requires a brief wait-time after each object invitation, but the current cue plan structure only supports a single gap after the entire narration. This prevents representing distributed wait-times. Recommendation: split recall-together into three separate cues (one per object), each an invite-echo with its own learner-response gap, to align with pedagogy and visual-design motion-budget.

## PIPELINE FINDINGS
- All reveal and replay cues narration duration estimates (2.6-2.8s) are within their 3.0s visualMotionSeconds budget.
- Invite-echo cues narration (~2.0s) leaves sufficient time for the ≥3.0s learner-response gap within the 5.0s budget.
- Recall-together narration (~5.9s) fits within the 6.0s budget but lacks internal wait-times; this is a structural limitation requiring cue splitting.
- No hold timings were invented; narration strictly comments on the visual per skill guidelines.