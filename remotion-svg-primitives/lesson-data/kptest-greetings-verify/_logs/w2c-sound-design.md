# W2c — Sound Design Log

## Inputs Read

| File | Status |
|---|---|
| `lesson-data/kptest-greetings-verify/brief.md` | ✅ Read |
| `lesson-data/kptest-greetings-verify/pedagogy.md` | ✅ Read |
| `lesson-data/kptest-greetings-verify/visual-design.md` | ✅ Read |
| `.agents/skills/lesson-sound-design/SKILL.md` | ✅ Read |
| `shared-sound/public/audio/_beds/_index.json` | ✅ Read |
| `shared-sound/public/audio/_sfx/_index.json` | ✅ Read |
| `shared-sound/public/audio/_stings/_index.json` | ✅ Read |
| `shared-sound/src/audioCuesTypes.ts` | ✅ Read (AudioCues schema) |
| `shared-sound/src/sfx.ts` | ✅ Read (SfxSound type + registry) |

## Outputs Written

| File | Status |
|---|---|
| `lesson-data/kptest-greetings-verify/audio-cues.json` | ✅ Written |
| `lesson-data/kptest-greetings-verify/_logs/w2c-sound-design.md` | ✅ Written |

## Commands Run

None (this node authors one JSON file + log).

## Key Decisions

### Bed: `literacy-playful-76`, `toneSafe: false`

- **Lesson kind:** Language/L2 — Mandarin-speaking children (~8yo) learning three spoken English routines (Hello/Hi, I'm…, Goodbye/Bye-Bye). Teacher narration is Chinese-medium with embedded English target words.
- **Bed choice:** `literacy-playful-76` matches the "Literacy / phonics" row in the skill table. This is a language-acquisition lesson, not math or a narrative story.
- **toneSafe: false** — The tone-language guard applies when the child must hear a spoken *lexical tone* (pinyin lessons). Here the new sounds are English (non-tonal); the child already speaks Mandarin and does not need to acquire Chinese tones from this lesson. The calm literacy bed sits below Chinese narration without competing.

### Intro sting: `kids-section-lift`

- Short (1.41s), kid-appropriate lift that signals the lesson beginning over the LessonIntroCard. No `mandarin-accent` sting exists in the shared library; `kids-section-lift` is the best existing key for a children's language lesson opener.

### Outro resolve: `true`

- Default. Bed rises to full as the last narration ends after the recap.

### SFX density justification

**3 sonified beats across 7 cues — very sparse, by design.**

This is a language-acquisition lesson where the child must hear English target words cleanly. The "NO SFX over instruction words" rule is paramount: every English token (Hello, Hi, I'm, Sam, Goodbye, Bye-Bye) is an instruction word, and speech-bubble PopIns fire at the moment these words are spoken. Adding pops on bubble entrances would place percussive transients directly under the target sounds the child needs to hear clearly — especially "I'm" /aɪm/ (the key-difficult sound).

| # | Cue | Event | Sound | Motivation |
|---|---|---|---|---|
| 1 | `greet` | transition | `whoosh` | Scene change from topic-intro card to the school-gate encounter. Fires as the gate backdrop fades in and characters approach — BEFORE any target English words are spoken. Clear narration gap. |
| 2 | `farewell` | transition | `whoosh-2` | Parting motion — characters begin separating before the first farewell bubble. Variant `whoosh-2` for variety from C1. Fires in the motion onset, before "Goodbye" is spoken. |
| 3 | `recap` | reward | `ta-da` | The single success beat per lesson. Fires AFTER the last recap phrase ("Goodbye / Bye-Bye") has been retrieved — in the narration gap at the end of the recap, as the lesson closes. The child has completed the full encounter. |

**Cues intentionally left silent:**
- `topic-intro` — card write-on only, no motivated SFX event.
- `im-slow-model` — the key-difficult /aɪm/ cue. The child needs absolute sonic clarity for the slow model. The bubble PopIn fires during "Hi! I'm… Sam" and a pop would sit under the target words.
- `im-choral-echo` — the "your turn" glow is an invitation, not a reward/transition/popin.
- `im-learner-gap` — intentional silence (≥3–5s) is the pedagogical focal point. Any SFX would destroy the gap.

### No `[ASSUMED]` choices

No `risingPitch` or `perStep` used (this is not a counting lesson). All decisions are evidence-based per the skill rules.

### No asset gaps named

All keys resolve in the shared library. No new bed/SFX/sting needed.

## Issues

None.

## Pipeline Findings

None.
