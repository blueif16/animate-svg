# W2c sound-design — tier-2 log (kptest-first-second-third)

## INPUTS READ
- `.agents/skills/lesson-sound-design/SKILL.md` (operating skill)
- `lesson-data/kptest-first-second-third/brief.md` — topic: ordinals 第一/第二/第三, Mandarin (zh), 4–6岁
- `lesson-data/kptest-first-second-third/pedagogy.md` — reward beats: reveal-second (the inverse-mapping win), reveal-third (consolidation); two held-silence learner-response gaps (c5/c6)
- `lesson-data/kptest-first-second-third/visual-design.md` — §3 per-cue motion table (SFX-worthy beats), §4 motion vocabulary, §6 anti-patterns
- `/Users/tk/Desktop/shared-sound/public/audio/_beds/_index.json`, `_sfx/_index.json`, `_stings/_index.json` — key resolution
- `node_modules/@studio/sound-kit/src/audioCuesTypes.ts` + `sfx.ts` — schema confirmed (`lessonId` field, `woodblock-count` is valid `SfxSound`)

## OUTPUTS WRITTEN
- `lesson-data/kptest-first-second-third/audio-cues.json` (bed + toneSafe + intro sting + outro resolve + 11 sfx rows)
- this log

## COMMANDS RUN
- `find /Users/tk/Desktop/shared-sound/public/audio -name "_index.json"` — exit 0; 3 index files found, all keys confirmed present.
- `find …/sound-kit/src -name "*.ts"` — exit 0; schema files located and read.

## KEY DECISIONS
- **bed `math-calm-68-cmaj`, `toneSafe: false`** — skill table default for number/math lessons. This is a math-insight lesson (position→ordinal mapping) in L1 Mandarin, NOT pinyin/tone-teaching, so the tone-language guard does not trigger. The ordinal words carry lexical tones but tone discrimination is not the teaching object. `kids-counting-game` was considered and rejected — ordinal labeling is math-insight, not a counting game; calmer register better serves deliberate per-step pedagogy.
- **intro sting `mandarin-accent`** — skill-sanctioned for Mandarin topics; sits over the intro card (3.0s motion budget; sting is 3.0s), before any narration.
- **outro resolve: true** — default on; bed rises as recap-count's last choral word ends.
- **SFX density: 11 rows over 13 cues, every row tied to a named motion in visual-design §3, ≤1 per beat:**
  - 3× `popin`→`pop` on animal arrival settles (`<PopIn motion="settle">` landings, arrive-first/second/third).
  - 1× `popin`→`pop-2` on name-first chip attach (`<PopIn motion="snap">`); variant distinguishes chip-attach from animal-arrive acoustically.
  - 3× `count`→`woodblock-count` `perStep`+`risingPitch [ASSUMED]` on the three sweeps (count-second, count-third, recap-count). `woodblock-count` chosen over `tick` — more culturally consonant with the Mandarin lesson context and still within the valid `SfxSound` vocabulary.
  - 2× `popin`→`pop` on the ask-cue affordance pop-ins (your-turn signal at cue head); the held-silence gaps themselves stay SILENT — no sound during the child's thinking time.
  - 1× `reward`→`ta-da` on reveal-second — the lesson's SINGLE success beat (matches the visual's only sparkle-burst); fires at the step-forward before confirm narration.
  - 1× `reward`→`chime` (small) on reveal-third — accent budget already spent at reveal-second; smaller chime matches smaller emphasis.
  - NO `whoosh`/`transition` rows: one persistent picture, no scene changes (visual contract: "Nothing resets").
  - recap-invite silent (minor pose beat; "when in doubt, leave it silent").

## ISSUES
- none blocking. Composer note: ask-cue `pop` should fire on the affordance's own PopIn frame (cue head), not during the voiced question or the gap.

## PIPELINE FINDINGS
- Skill's fixed SFX vocabulary table (pop/chime/whoosh/tick/ta-da) lags the actual shared library, which carries richer kid-appropriate keys (`woodblock-count`, `sparkle`, `twinkle-reward`, `plop-soft`, `vox-yay`). This node used `woodblock-count` as it IS a valid `SfxSound` type — but the skill's own example table doesn't list it, creating uncertainty. Expand the skill's vocabulary table to match the live SFX registry, or explicitly mark the 5-key list as "examples, not exhaustive."
- Skill cites the schema at `src/lesson-media/audioCuesTypes.ts` as authoritative but that path is OUTSIDE this node's DRIVER-READ-SCOPE. The actual schema lives in `@studio/sound-kit` (a symlinked dependency). Skill should cite the sound-kit package path instead, or inline the key field names.
- Skill's "NO SFX over instruction words" vs the `count` event (ticks intentionally land ON spoken count words) reads as a contradiction on first pass — add one line to the skill clarifying that count ticks are the sanctioned exception (they are sub-narration accents, not competing sounds).
- `[ASSUMED]` `risingPitch: true` on all three count sweeps (auditory magnitude across 第一→第二→第三). Evidence-informed per skill spec; Wave 6 should verify it doesn't distract from the choral chant in recap-count.
- reveal-second's sparkle-burst visual would pair well with `sparkle` SFX (instead of `ta-da`) — but the skill vocabulary doesn't offer a sparkle-mapped event type. A `sparkle` or `magic` SFX event type would round out the vocabulary alongside the existing `reward` slot.
