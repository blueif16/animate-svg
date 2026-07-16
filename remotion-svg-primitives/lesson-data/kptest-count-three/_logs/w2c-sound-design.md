# w2c-sound-design — log

## INPUTS READ
- SKILL: `.agents/skills/lesson-sound-design/SKILL.md`
- `lesson-data/kptest-count-three/brief.md`, `pedagogy.md`, `visual-design.md`
- Library indices (read tool, each enumerates every KEY): `_beds/_index.json`, `_sfx/_index.json`, `_stings/_index.json`

## OUTPUTS WRITTEN
- `lesson-data/kptest-count-three/audio-cues.json`

## KEY DECISIONS
- **bed = `math-calm-68-cmaj`, toneSafe = false.** Lesson kind = `math-insight` (counting + cardinality); per skill bed-table "Number/math (default)". Mandarin-medium, but the count words 一/二/三 are taught as count vocabulary + one-to-one, not as lexical tones to be discriminated → this is NOT a pinyin/tone-teaching lesson, so the tone-language guard does NOT flip. (toneSafe would be true only if the child had to perceive a spoken lexical tone contour.)
- **intro.sting = `mandarin-accent`.** Mandarin topic + the topic-intro LessonIntroCard; the skill sanctions a mandarin-accent sting "over the intro card, before narration." toneSafe=false so an intro melodic accent is allowed (and toneSafe=true would also permit it in the intro). Pentatonic accent = the skill's correct Mandarin-topic accent placement.
- **outro.resolve = true.** Bed rises to full as the last narration ends (default on); the cardinality cue IS the landing. No separate resolve STING and no celebration bed-switch (skill bed-table: outro/celebration uses the BED envelope's outro resolve) — avoids double-celebration with the single ta-da.
- **sfx[0] = count-climb / `count` / `tick` / perStep / risingPitch.** One 0.1s tick per counted apple (1,2,3), pitch ASCENDING = auditory magnitude toward 3 — directly serves the count-climb pedagogy (one-to-one + sequence). `risingPitch` flagged `[ASSUMED]` (evidence-informed, not counting-proven) → Wave 6 sanity-check. The tick lands on the count beat = visual-design's "SOLE count mark" (tag-attach / count-word onset); it is a transient, not a sustained masker (timing nuance noted in PIPELINE FINDINGS).
- **sfx[1] = cardinality / `reward` / `ta-da`.** The ONE win — `ta-da` exactly once per lesson, on the cardinal-glyph bouncy settle-pop (visual-design's "ONE climax accent"). Lands on the PICTURE-reveal, which precedes the voice naming the total (picture-leads hold, then voice), so it is NOT over instruction words. No `chime` (would double-reward).
- **Dropped (restraint, ≤1 SFX/beat):** apple-entrance `pop` (entrance is "NOT a count signal"; the count tick is the unambiguous audible count); no cue-boundary `transition` whoosh (no named SectionHandoff/ShineSweep in visual-design — a raw boundary whoosh would be unmotivated, forbidden by NEVER-list); no coral-converge whoosh (an in-cue gather action, not a scene transition).

## DENSITY JUSTIFICATION
1 tick per ~4.5s arrival (×3) + 1 ta-da at the climax + 1 intro sting + the bed outro envelope. ≤1 motivated SFX per beat; every sfx row is backed by a named motion event in visual-design.md (count mark per apple / cardinal-glyph settle-pop).

## KEYS CHECK (all resolve in the shared library)
`math-calm-68-cmaj` ✓ `_beds` · `mandarin-accent` ✓ `_stings` · `tick` ✓ `_sfx` · `ta-da` ✓ `_sfx`.

## `[ASSUMED]` CHOICES (for Wave 6)
- `risingPitch: true` on the count tick (ascending 1→2→3 = auditory magnitude; evidence-INFORMED, not proven for counting).

## ISSUES
None.

## PIPELINE FINDINGS
- **count→tick vs "NO SFX over instruction words":** I placed the count tick on the count beat (visual-design's defined count mark). The skill scopes the no-over-instruction rule to "reward/interaction sounds" (chime/ta-da) while separately listing the `count`→`tick` affordance, so the tick is plausibly in-scope as a count affordance rather than a masker — but the line is judgment-based. Recommend the composer/kit (a) place the tick via the kit's −5-frame SFX lead so its 0.1s transient PEAKS at the count onset and does NOT sustain over the spoken count vowel, and (b) confirm tick gain stays in the 0.4–0.8 SFX band. If Wave 6 finds the tick competes with the count word, fallback = move the audible-magnitude cue to the apple ENTRANCE (pre-count-word) — but that breaks visual-design's single-signal discipline (entrance ≠ count mark), so the on-count placement is preferred. The skill's already-filed `@studio/sound-kit` gaps (bed-under-voice floor + short-gap midpoint fallback) are noted in the SKILL and not re-litigated here.
