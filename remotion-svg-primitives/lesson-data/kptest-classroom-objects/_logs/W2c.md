# W2c Sound Design Log

## INPUTS READ
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/brief.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/pedagogy.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/visual-design.md
- (Reference) /Users/tk/Desktop/shared-sound/public/audio/_beds/_index.json
- (Reference) /Users/tk/Desktop/shared-sound/public/audio/_stings/_index.json
- (Reference) /Users/tk/Desktop/shared-sound/public/audio/_sfx/_index.json

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/audio-cues.json

## COMMANDS RUN
- ls -la /Users/tk/Desktop/shared-sound/public/audio/
- read /Users/tk/Desktop/shared-sound/public/audio/_beds/_index.json
- read /Users/tk/Desktop/shared-sound/public/audio/_stings/_index.json
- read /Users/tk/Desktop/shared-sound/public/audio/_sfx/_index.json
- mkdir -p /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-classroom-objects/_logs
- write (to audio-cues.json and W2c.md)

## KEY DECISIONS
- Bed mood: selected "literacy-playful-76" from the shared beds library, toneSafe set to false (not a tone language lesson).
- Intro sting: selected "soft-rise" for a gentle uplifting opening.
- Outro resolve: selected "kids-outro-resolve" for a child-friendly closing.
- SFX mapping: derived 11 cue IDs from the reading-order in visual-design.md. For each cue, assigned sound effects based on sub-events:
  * Lift events: "whoosh"
  * Word appearance events: "chime"
  * Invite-echo start: "tick" (except for ruler's additional invite-echo which uses "chime" to emphasize difficulty)
  * Recall-together pointing: "pop"
  * Recall-together highlight: "sparkle"
  All SFX keys are from the shared library.

## ISSUES
- None.

## PIPELINE FINDINGS
- Consider automating the extraction of cue IDs from visual-design.md to reduce manual effort.
- The shared library indexing process could be made more discoverable (e.g., a helper script to list available keys by category).