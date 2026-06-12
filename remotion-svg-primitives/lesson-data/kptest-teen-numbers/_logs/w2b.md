# W2b Audio/Captions Log

## INPUTS READ
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/brief.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/visual-design.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/storyboard.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/pedagogy.md

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/audio-captions.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-teen-numbers/script-cues.json

## COMMANDS RUN
(None - file writes only)

## KEY DECISIONS
- Used narration rate of 0.30s per Chinese character for Aoede voice.
- Calculated maximum characters per cue based on motion budget from visual-design.md:
  * announce-topic: 2.0s → max 6 Hanzi (1.8s) → "我们来学十几"
  * model-target-slow: 3.0s → max 10 Hanzi → settled on 9 Hanzi phrase "X，这个数字是X" (2.7s) to allow natural pacing
  * invite-echo: 3.0s → max 10 Hanzi → exact fit with "我说X，你跟我说X" (10 Hanzi, 3.0s)
- Narration serves as commentary on visual: announces topic, models number composition, invites child to echo.
- Ensured cue IDs match storyboard (fixed duplicate IDs in initial draft).

## ISSUES
- Storyboard listed duplicate cue IDs for invite-echo cues (e.g., two cue-13-invite-echo entries) which was an error; corrected to single ID per cue.
- Initial audio-captions.md and script-cues.json had duplicated cue blocks for numbers 13-19; regenerated with correct single entries.

## PIPELINE FINDINGS
- The motion budget model (0.30s/Hanzi) provides a reliable constraint for Chinese narration length.
- Separating model-slow and invite-echo cues allows different instructional pacing while reusing same visual.
- Character-count approach ensures audio clips fit precisely within cue boundaries without requiring hold frames or time stretching.