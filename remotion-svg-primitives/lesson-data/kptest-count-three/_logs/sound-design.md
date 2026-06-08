# Sound Design Log — kptest-count-three (Wave 2c)

## Inputs Read

| File | Key content consumed |
|---|---|
| `brief.md` | Ages 3–5 Mandarin-medium; counting to 3; ~25s. Math lesson, NOT pinyin/tone → `toneSafe: false`. |
| `pedagogy.md` | 4 cues: count-apple-1/2/3 (acquisition loop) + cardinality-three (insight beat). Single success beat = cardinality → the one `ta-da` lands there. |
| `visual-design.md` | Apple entrances via `<PopIn motion="snap">` (×3); tag attach via `<PopIn motion="snap">` (×3); cardinal "3" via `<PopIn motion="bouncy">` (×1). No `<ShineSweep>`, no `SectionHandoff`. Sketch budget left unused. |
| `_beds/_index.json` | `math-calm-68-cmaj` confirmed present (184.97s). |
| `_sfx/_index.json` | `tick` (0.1s), `ta-da` (0.6s) confirmed present. |
| `_stings/_index.json` | `soft-rise` (2.88s) confirmed present. |

## Key Decisions

### Bed: `math-calm-68-cmaj` / `toneSafe: false`
This is a Mandarin-medium math (counting) lesson, not a pinyin/tone-teaching lesson. The §9 tone-language carve-out does not apply (per pedagogy.md language note). Standard math bed is correct.

### Intro sting: `soft-rise`
The title card "数一数" resolves in via `EASE.enter` or `<PopIn motion="settle">` — a calm, gentle opener. `soft-rise` (2.88s) matches the settle-in tone and fits within the 2.0s title motion budget (the sting plays over the title card and fades before the first apple). No mandarin-accent sting is available in the shared library; `soft-rise` is the appropriate calm key.

### Outro: `resolve: true`
Default on. The bed rises to full as the last narration ("数完了，一共三个") ends, providing a natural musical close.

### SFX rows (4 events across 5 cues)

| # | cue | event | sound | perStep | risingPitch | Justification |
|---|---|---|---|---|---|---|
| 1 | count-apple-1 | count | tick | true | true | First count step — tag "1" attaches to apple #1. Tick marks the count advancing. |
| 2 | count-apple-2 | count | tick | true | true | Second count step — tag "2" attaches. Same event type, pitch ascends. |
| 3 | count-apple-3 | count | tick | true | true | Third count step — tag "3" attaches. Pattern confirmed, pitch highest. |
| 4 | cardinality-three | reward | ta-da | — | — | The insight/success beat — the single `ta-da` of the lesson. Fires after narration ends, during the absorption hold. |

**Density:** 4 SFX across 5 cues. Intro-title is silent (the sting + bed carry it). Counting cues get exactly 1 SFX each (tick on count advance). Cardinality gets 1 SFX (ta-da on reward). No cue has >1 SFX. No SFX fires over instruction words — the tick lands on the tag-attach visual moment, and the composer places it after the spoken number word. The ta-da fires during the post-narration hold.

**Why tick (not pop) for counting cues:** Both the apple PopIn and the tag PopIn are motivated entrances, but the pedagogical event is "the count advances by one." Using `tick` (the count event) directly sonifies the teaching signal. The apple PopIn is strong enough visually without a pop sound. One SFX per beat; tick > pop for a counting lesson.

**Why no SFX on tag dim or cardinal "3" entrance separately:** The tag dim is a quiet color recede (not a motivated SFX event). The cardinal "3" PopIn bouncy IS the ta-da moment — the reward sound covers it. Adding a separate popin SFX on the cardinal would be 2 SFX on one beat.

### `[ASSUMED]` — `risingPitch: true`
The ascending-pitch tick across the three count steps is evidence-INFORMED (auditory magnitude mapping: higher pitch = larger count), not proven specifically for counting acquisition in 3–5 year olds. Flagged for Wave 6 sanity-check.

## Commands Run
None (no shell commands needed — this is a semantic JSON authoring step).

## Issues
None. All required keys (`math-calm-68-cmaj`, `tick`, `ta-da`, `soft-rise`) resolve in the shared library. No asset gaps.

## Pipeline Findings
- A dedicated `mandarin-accent` sting key is referenced in the skill doc but does not exist in the shared stings library. `soft-rise` was used as the calm intro alternative. If a Mandarin-flavored sting is desired for future Mandarin-medium lessons, the Wave 3c sound-asset lane should author one.
- The `woodblock-count` SFX key exists in the library and could be an alternative to `tick` for counting lessons (more organic/tactile feel). Consider A/B testing in a future lesson.
