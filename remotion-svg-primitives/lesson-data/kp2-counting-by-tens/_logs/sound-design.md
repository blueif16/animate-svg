# Wave 2c Sound Design Log — kp2-counting-by-tens

## INPUTS READ
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/brief.md`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/pedagogy.md`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/visual-design.md`
- `/Users/tk/Desktop/shared-sound/public/audio/_beds/_index.json`
- `/Users/tk/Desktop/shared-sound/public/audio/_stings/_index.json`
- `/Users/tk/Desktop/shared-sound/public/audio/_sfx/_index.json`

## OUTPUTS WRITTEN
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/audio-cues.json`

## COMMANDS RUN
- `find /Users/tk/Desktop/shared-sound/public/audio -name "*_index.json" -o -name "_index.json"` (Exit code: 0)
- `ls -la /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/` (Exit code: 0)
- `ls -la /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/_logs/` (Exit code: 0)

## KEY DECISIONS
1. **Bed selection (`math-calm-68-cmaj`)**: Since this is a mathematics/number lesson (counting by tens), `math-calm-68-cmaj` is the standard calm major bed from the curated library.
2. **Tone-safe guard (`toneSafe: false`)**: This is a math lesson, not a tone-teaching or pinyin lesson. Therefore, we do not activate the flat drone/pad.
3. **Intro sting (`mandarin-accent`)**: Since the target audience is Age 6-7 with Mandarin Chinese narration, we set `intro.sting` to the beautiful Chinese-themed `mandarin-accent` sting, which overlays the topic intro card and completes before narration starts.
4. **Outro resolve (`outro.resolve: true`)**: The bed rises to full volume at the end of the final recap.
5. **Cue-SFX mapping**:
   - `bundle-recall`: `pop` for the gentle scale-pulse entrance of the first bundle.
   - `untie-reveal`: `whoosh` for the rope untying and transition to loose sticks layout.
   - `slow-count-ones`: Sequential `tick` counts across the ten loose sticks. Enabled `risingPitch: true` `[ASSUMED]` for auditory magnitude across the counted set.
   - `fast-vs-slow`: `sparkle` at the knot during the climax re-tie / wrap animation.
   - `two-tens`: `pop` for the atomic second bundle sliding in.
   - `three-tens`: `pop` for the atomic third bundle sliding in.
   - `recap`: `ta-da` as the single success/reward beat of the lesson, playing as the final takeaway is revealed and the three bundles pulse.

## DENSITY DISCIPLINE AUDIT
- At most 1 SFX row is defined per cue.
- All SFX elements are highly motivated by explicit visual transitions or counts in the visual-design.md/pedagogy.md.
- There is only one `ta-da` (success reward) in the entire lesson, placed at the final summary/recap cue.

## ISSUES
None.

## PIPELINE FINDINGS
- `[ASSUMED]` Flagged `risingPitch: true` for Wave 6 sanity-checking (auditory magnitude for counting sequence).
