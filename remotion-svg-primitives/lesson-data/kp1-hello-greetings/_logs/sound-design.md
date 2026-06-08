# W2c — Sound Design — kp1-hello-greetings

## INPUTS READ
- `lesson-data/kp1-hello-greetings/brief.md` — topic (PEP English Unit 1 "Hello!", spoken-routine language lesson; Chinese-medium narration with embedded English target words; NOT a tone/pinyin lesson).
- `lesson-data/kp1-hello-greetings/pedagogy.md` — five cues (intro / meet-hello / intro-self / part-goodbye / recap); reward/closure beat is `recap` (the single closing punctuation pulse); `intro-self` "I'm" is the key_difficult instruction beat.
- `lesson-data/kp1-hello-greetings/visual-design.md` — per-cue choreography: bubble `<PopIn motion="bouncy">` entrances on meet-hello/intro-self/part-goodbye; two coral `<PulseCircle>` emphasis beats (intro-self "I'm" + recap closing); intro = topic-card resolve-in.
- Schema `@studio/sound-kit` → `src/audioCuesTypes.ts` (AudioCues, AudioCueSfx; `event` ∈ popin|count|transition|reward) and `src/sfx.ts` (SfxSound union).
- Shared library `/Users/tk/Desktop/shared-sound/public/audio/_{beds,sfx,stings}/_index.json`.

## OUTPUTS WRITTEN
- `lesson-data/kp1-hello-greetings/audio-cues.json` — bed + toneSafe + intro.sting + outro.resolve + 5 SFX rows.
- `lesson-data/kp1-hello-greetings/_logs/sound-design.md` — this file.

## COMMANDS RUN
- `node -e` validation (exit 0): "ALL KEYS RESOLVE — OK". Confirmed bed/sting/sound keys exist in both the type union and the shared-library index, all cue ids match the pedagogy cue set, event values are legal, ta-da count = 0.

## KEY DECISIONS
- **bed = `literacy-playful-76`, toneSafe = false.** Per skill bed table, literacy/phonics → `literacy-playful-76`. The tone-language guard applies ONLY to Mandarin lexical-tone teaching; here the target words are English (Hello/Hi/I'm/Goodbye) with no lexical tone, so a calm melodic literacy bed is correct and toneSafe stays false. (Narration is Chinese-medium, but no Mandarin tone is the *teaching content*.)
- **intro.sting = `kids-section-lift`.** A soft kid-tuned lift over the topic-intro card, before narration — on-brand for early childhood and the Mandarin-topic intro. Sits over the card, not under any teaching word.
- **outro.resolve = true.** Default on; bed rises to full as the recap narration ends — warm encounter-close.
- **SFX (5 rows, one motivated beat each):**
  - `intro / transition / whoosh` — soft transition under the GAP-1 title-card resolve-in (calm setup, lands over the card before narration).
  - `meet-hello / popin / pop` — the "Hello!" bubble `<PopIn motion="bouncy">` entrance (discrete spoken-event arrival).
  - `intro-self / popin / pop` — the "Hi! I'm Sam." bubble entrance. NOTE: deliberately NO chime/accent on the coral "I'm" PulseCircle — that pulse IS the instruction (the hard /aɪm/ model); per "no SFX over instruction words" it stays acoustically clean so the child hears the sound un-masked. The pop is on the bubble's arrival, not over the teaching word.
  - `part-goodbye / popin / pop` — the farewell bubbles pop on the waves (DialogueExchange caps to most-recent; composer fires on the bubble-entrance beat).
  - `recap / reward / chime` — small warm closure on the recap's closing coral punctuation pulse, in the narration GAP after the three-phrase arc lines up. Chose `chime` (small) over `ta-da` (the win): a hello/goodbye recap warrants gentle closure, not a math-victory fanfare. ta-da budget left unused.
- **Density:** 5 sonified beats across 5 cues = ≤1 per cue. No per-step counting (no countable in a language lesson, so no `count`/`tick`/`risingPitch`). No SFX over any teaching word.

## ISSUES
- None blocking. All keys resolve; schema validates.

## PIPELINE FINDINGS
- The skill's bed table has no explicit row for a CHINESE-MEDIUM lesson whose TARGET language is non-tonal English. I inferred "literacy, toneSafe=false" from the no-lexical-tone test, but a future maintainer could mis-read "Mandarin narration" → toneSafe. Worth a one-line clarification in the skill: toneSafe keys off the *taught* sound being a lexical tone, not the narration language.
- `event` is restricted to `popin|count|transition|reward` (no dedicated "emphasis"/"pulse" event), so the lesson's coral PulseCircle emphasis beats have no first-class SFX event — which is actually correct here (we WANT them silent), but means a lesson that DID want an emphasis sting would have to overload `reward`. Note for the schema backlog if emphasis-with-sound ever becomes a need.
- No frame fields written (correct — composer owns frames). Validation script is ad-hoc; a `npm run` validator for audio-cues.json against the SfxSound union + library index would catch typos earlier across lessons.
