# W2c — sound-design (kptest-fenyuhe-six)

## Inputs read
- `lesson-data/kptest-fenyuhe-six/brief.md` — math-acquisition (6的分与合), Mandarin narration, builds on kp5 routine.
- `lesson-data/kptest-fenyuhe-six/pedagogy.md` — 9 discovery beats; the 3和3 equal-split is the single highlighted success; co-equal airtime across the three splits; echo/aggregator beats are learner-response gaps (held silence).
- `lesson-data/kptest-fenyuhe-six/visual-design.md` — SFX-worthy beats = routine-reprise entrance, three split→recombine motions, symmetric 3+3 hold (the ONE climax), recap walk. Identity-fence (six identity-invariant dots, no decoration).
- `@studio/sound-kit` `audioCuesTypes.ts` + `sfx.ts` — schema (`AudioCues`, `AudioCueSfx`, `SfxSound`) and the fixed SFX vocabulary.
- `shared-sound/public/audio/_beds/_index.json`, `_stings/_index.json`, `_sfx/_index.json` — every key in the manifest resolves here.

## Outputs written
- `lesson-data/kptest-fenyuhe-six/audio-cues.json`
- `lesson-data/kptest-fenyuhe-six/_logs/w2c-sound-design.md` (this file)

## Commands run
- (read-only listing/index reads of the shared-sound library and the sound-kit schema; no npm/bash execution — pure authoring node, per the SCOPE rule)

## Key decisions

### Bed
- `bed: "math-calm-68-cmaj"`, `toneSafe: false`.
- Reason: SKILL table maps "Number / math (default)" → `math-calm-68-cmaj` / `toneSafe: false`. This is a math-acquisition lesson (part–whole bonds for 6), not a pinyin/tone-teaching lesson. The brief's "No +/−/= symbols" and stage ceiling = concrete + represent keep the voice to concrete part–whole naming ("6可以分成1和5") — the child is not being asked to discriminate lexical tones, so a C-major piano bed does not compete with the teaching. The tone-language guard is **not** triggered.

### Intro
- `intro.sting: "mandarin-accent"`.
- Reason: SKILL explicitly allows a `mandarin-accent` sting for Mandarin topics, sitting over the intro card BEFORE narration. It is a sparing pentatonic accent, not a bed motif — it does not run under the voice, so the tone-guard (if it ever applied) is honored by placement.

### Outro
- `outro.resolve: true`.
- Reason: SKILL default; bed rises to full as the last narration ends. The recap (cue 9) closes with the whole set, which is a natural resolve beat.

### SFX → beat map (2 rows)
- `cue: "split-3-and-3"`, `event: "reward"`, `sound: "ta-da"` — the equal-split climax. This is the lesson's single success beat per pedagogy ("the 3和3 equal split is the highlight"). The visual reserves ONE climax move (`EASE.outQuint`, 30 fr) for this split and ONE `<Sparkle>` for its hold. The `ta-da` is the audio counterpart — the one "win" the skill budgets per lesson. Sits on the symmetric 3-3 hold so it lands in the held silence / the picture's settle, not on the narration of the bond.
- `cue: "recap"`, `event: "reward"`, `sound: "chime"` — the spaced-recall closure. The recap is the lesson's closing integration (cues 2/4/6 retrieved in order, 3+3 last so the highlight is preserved). A small `chime` (not a second `ta-da`) marks the closure of the set — quieter than the climax, distinct in role.

### Density justification (2 sonified beats out of 9)
- **Silent beats (7 of 9) — explicitly justified:**
  - `routine-reprise` (cue 1): setup beat, routine transferred from kp5. The six dots enter via `EASE.enter` stagger, not a `<PopIn>` component, so no `popin` event semantically exists. A `pop` on routine setup would over-sonify a moment the child already recognizes from kp5.
  - `split-1-and-5` (cue 2) and `split-2-and-4` (cue 4): the split+recombine motion IS the picture (continuous `EASE.inOutCubic`, 24 fr). A `popin` per split would sonify the same vocabulary beat three times (once per split cue) — violates "≤1 motivated SFX per beat" at the lesson scale, and "NO SFX over instruction words" (the voice names the bond across the motion).
  - `echo-1-and-5` (cue 3), `echo-2-and-4` (cue 5), `echo-3-and-3` (cue 7), `aggregator-prompt` (cue 8): these are **learner-response gaps** — held silence is the signal (pedagogy §"Reinforcement plan" + SKILL "NO SFX over instruction words"). Adding SFX would teach-against the retrieval beat.
- **Sonified beats (2 of 9):**
  - 1× `ta-da` on the 3+3 climax (the one win).
  - 1× `chime` on the recap closure (small reward, distinct from the climax).
- Total: well under the density ceiling; no two SFX share a beat; no SFX lands on instruction narration.

### Restraint checks
- No frame / offset / duration literals in the artifact (schema has no frame field; the composer maps `event` → motion frame).
- Every `sound` key resolves in the shared library (`ta-da`, `chime` ∈ `_sfx/_index.json`).
- No new asset invented; no WAV edited; no code touched.
- No melodic motif under tone-teaching narration — `toneSafe: false` is correct because this is a math lesson, not a pinyin lesson (see Bed reasoning above).

## `[ASSUMED]` flags for Wave 6
- None. I considered `risingPitch: true` for the recap (three sequential items 1+5 → 2+4 → 3+3) but rejected it: the recap is a `<RecapSpotlight>` walk over SPLITS, not a count primitive, and the child is retrieving a set, not counting. The `risingPitch` evidence is specifically for counted steps; reusing it on a 3-item split recap would be unmotivated.

## Asset gaps named for Wave 3c
- None. All keys (`math-calm-68-cmaj`, `mandarin-accent`, `ta-da`, `chime`) exist in the shared library.

## Issues
- None.

## Pipeline findings (workflow backlog)
- **Prior w2c artifact was wrong (cross-run, not cross-lesson).** The pre-existing `audio-cues.json` (from an earlier run of this same lesson) used `bed: "math-calm-68-cmaj"` and `toneSafe: false` (correct) but only 2 SFX rows with cue names that don't match this lesson's actual cue IDs (`cue-announce-split-1of5`, `cue-reveal-answer`). This is exactly the "prior artifact presumed flawed" risk the reading law warns about — a fresh author should re-derive from skills + inputs, not patch names. No action needed; flagged so the driver knows the prior run was overwritten by design, not by accident.
- **SKILL table's `toneSafe` rule could use a one-line carve-out for non-pinyin Mandarin narration.** The current rule ("Pinyin / tone-teaching → tone-safe-pad / toneSafe: true") is correct, but an early-childhood math lesson with Chinese narration sits in a gray zone — the voice IS Mandarin (lexical tones exist) but the teaching target is part–whole structure, not tone discrimination. The right answer (`math-calm-68-cmaj` / `toneSafe: false`) requires the author to reason about "is this a tone-TEACHING lesson?" not just "is the voice Mandarin?". Consider adding a one-sentence note to the SKILL table: "toneSafe applies when lexical-tone discrimination is the teaching target, not merely when the narration language has lexical tones."
