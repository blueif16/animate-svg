# W2c Sound Design Log - kptest-whats-your-name

## INPUTS READ
- brief.md: English lesson for Mandarin-speaking children teaching "What's your name?" / "My name's ___."
- pedagogy.md: Five cues with discoveries: ask, answer, ask-swap, answer-swap, recap; emphasis on "What's" and "name's" as key difficult contractions
- visual-design.md: Defines zones and motion budget showing character lean-in/bubble pop-in entrances and emphasis pulses

## DECISIONS

### BED SELECTION
- Chose: `literacy-playful-76`
- Reason: This is an English/literacy lesson (teaching English phrases), not a pinyin/tone lesson. The literacy bed is appropriate for language learning content.
- toneSafe: false - Not a tone-teaching lesson, so melodic bed is permissible.

### INTRO/OUTRO
- intro.sting: `mandarin-accent` - Appropriate for Mandarin audience topic, plays over intro card before narration
- outro.resolve: true - Standard envelope rise as lesson concludes

### SFX SELECTION
Applied density discipline (≤ 1 SFX per beat, motivated only, no SFX over instruction words):

1. { "cue": "intro", "event": "transition", "sound": "whoosh" }
   - Motivates: Topic/intro card appearance at lesson start
   - Why: Marks transition into lesson content; matches kp1-hello-greetings pattern

2-5. { "cue": "ask/answer/ask-swap/answer-swap", "event": "popin", "sound": "pop" } (each)
   - Motivates: Character lean-in and bubble pop-in entrance actions
   - Why: Coincides with visual entrances, not verbal instruction; follows kp1-hello-greetings pattern for section entrances

6. { "cue": "recap", "event": "reward", "sound": "ta-da" }
   - Motivates: Final demonstration of mastering full name exchange sequence
   - Why: Success milestone for lesson; only one ta-da used as required; placed in recap after all instruction

## OMITTED SFX
- Emphasis pulses on "What's" and "name's" syllables: Omitted to avoid potential SFX over instruction words (per skill guideline: "NO SFX over instruction words"). These mark key learning moments but coincide with verbal emphasis.
- Additional entrances/rewards: Omitted to maintain density discipline; one SFX per major lesson section is sufficient.

## ASSET GAPS
- All SFX sounds (whoosh, pop, ta-da) and beds (literacy-playful-76) exist in shared library per CAPACITIES.md
- No new assets named for Wave 3c lane

## ASSUMPTIONS
- None - all mappings based on explicit visual-design.md motion descriptions and established patterns from other lessons