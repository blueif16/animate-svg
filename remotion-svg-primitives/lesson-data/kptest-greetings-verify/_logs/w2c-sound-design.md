# W2c — Sound Design Log

## INPUTS READ
- `lesson-data/kptest-greetings-verify/brief.md` — L2 English lesson, Mandarin-speaking 8-year-olds, three greeting phrases (Hello/Hi, I'm…, Goodbye/Bye-Bye). Chinese-medium narration with embedded English target words. NOT a pinyin/tone lesson.
- `lesson-data/kptest-greetings-verify/pedagogy.md` — 5 cues (intro, meet-hello, hi-intro, im-echo, part-goodbye, recap-encounter). Key-difficult is /aɪm/ in "I'm". Heavy reinforcement on hi-intro + im-echo. Recap is the integration/spaced-recall beat.
- `lesson-data/kptest-greetings-verify/visual-design.md` — Per-cue motion events: bouncy PopIn on first bubble (meet-hello), snap PopIn on subsequent bubbles, emphasis PulseCircle on "I'm", ReadAlongHighlight sweeps, SparkleBurst/PulseCircle closing celebration on recap.
- `@studio/sound-kit` types (`AudioCues`, `AudioCueSfx`, `SfxSound`) — schema constrains the JSON structure.
- `shared-sound/public/audio/_beds/_index.json` — available beds.
- `shared-sound/public/audio/_sfx/_index.json` — available SFX.
- `shared-sound/public/audio/_stings/_index.json` — available stings.
- `lesson-data/kp1-hello-greetings/audio-cues.json` — prior lesson on same topic, used as pattern reference.

## OUTPUTS WRITTEN
- `lesson-data/kptest-greetings-verify/audio-cues.json`

## KEY DECISIONS

### Bed: `literacy-playful-76`, toneSafe: false
- Lesson kind is L2 language acquisition (English phrases for Mandarin-speaking children). Matches "Literacy / phonics" row → `literacy-playful-76`.
- `toneSafe: false` — the lesson teaches English pronunciation, not Chinese lexical tones. No tone-contour conflict.
- Confirmed by prior `kp1-hello-greetings` using the same bed.

### Intro sting: `kids-section-lift`
- Gentle, kid-appropriate lift to open the lesson. Matches the intro card reveal → cast fade-in visual.
- No `mandarin-accent` sting in the library; `kids-section-lift` is the age-appropriate default.
- Confirmed by prior `kp1-hello-greetings`.

### Outro: resolve = true
- Bed rises to full as last narration ends. Standard for lesson closure.
- No sting field on the `outro` type — the bed's envelope handles the resolve.

### SFX (3 across 6 cues):

| # | Cue | Event | Sound | Motivation |
|---|---|---|---|---|
| 1 | meet-hello | popin | pop | First bouncy PopIn bubble accent — the concept of "someone speaks English" introduced. Only `motion="bouncy"` moment in the video. |
| 2 | hi-intro | reward | chime | Emphasis PulseCircle fires on "I'm" — the key-difficult discovery moment. Small chime rewards the child's attention to the hard sound. Lands on the visual emphasis beat, not over teaching narration. |
| 3 | recap-encounter | reward | ta-da | Closing SparkleBurst/PulseCircle celebration — "I just did all three." The single ta-da for the whole lesson, on the integration/success beat. |

### Cues with NO SFX and why:
- `intro` — The sting handles the opening. No additional SFX needed for the card reveal.
- `im-echo` — Practice/drill cue. No new popin or reward event. The emphasis pulse here is a repeat of hi-intro's; adding another chime would dilute the ta-da's uniqueness. Silence respects the practice mood.
- `part-goodbye` — Snap PopIn bubbles (not bouncy). Adding pop variants for snap entrances would over-sonify a routine moment. The scene's motion carries it.

### Density justification
3 sonified beats across 6 cues = 50% SFX coverage. Each is motivated by a distinct visual event (bouncy popin, emphasis pulse, closing celebration). No cue has more than 1 SFX. No SFX lands over instruction words. The ta-da fires exactly once.

## ISSUES
None.

## PIPELINE FINDINGS
- The `AudioCues.outro` type lacks a `sting` field. The `sting-outro-resolve` and `kids-outro-resolve` stings exist in the library but have no schema slot in `AudioCues`. Either the type should gain `outro.sting?: string` or those stings should be documented as composer-implicit (bed envelope handles it). Not blocking — just noting the gap.
