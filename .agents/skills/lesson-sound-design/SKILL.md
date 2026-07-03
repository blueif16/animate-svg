---
name: lesson-sound-design
description: Author the per-lesson sound manifest (audio-cues.json) — bed mood, intro sting, outro resolve, and the SFX→beat map. Wave 2c of the lesson pipeline, parallel with audio/captions. SEMANTIC only — declares moods and sound keys, never frames.
---

# Lesson Sound Design (Wave 2c)

Decide what the lesson SOUNDS like, not when sounds fire. You author one small JSON file; the composer (Wave 4) maps your semantic beats onto its own motion frames, and the sound-asset lane (Wave 3c) guarantees the assets exist. You touch no code and no WAVs.

**Run in parallel with 2b (audio/captions).** You depend on `visual-design.md` (Wave 2a) + `pedagogy.md` (Wave 0), NOT on voice. Music+SFX is a SECOND audio track that *consumes* the reconciled timeline — it never drives cue length and is never frozen at Wave 3a.

Research basis: `research/music-sound-design.md` (mix), `research/music-sound-palette-2026-05-29.md` (palette + SFX + the tone-language guard). Integration + schema: `docs/proposals/sound-layer-integration.md`. Code surface: `CAPABILITIES.md#lesson-music-bed`, `#lesson-sfx-layer`.

## Inputs (read before writing)
- `lesson-data/<id>/brief.md` — topic → bed mood + whether this is a tone/pinyin lesson.
- `lesson-data/<id>/pedagogy.md` — the discovery/reward beats → where the single `ta-da` lands.
- `lesson-data/<id>/visual-design.md` — per-cue SFX-worthy tags (entrance / count / transition / success).

## Output
- `lesson-data/<id>/audio-cues.json` — schema = `src/lesson-media/audioCuesTypes.ts` (`AudioCues`).
- `lesson-data/<id>/_logs/sound-design.md` — inputs read, decisions, the bed/SFX keys you chose and why.

## The bed (one per lesson)
Pick ONE bed key from the curated library by mood — never invent a track per lesson:

| Lesson kind | `bed` | `toneSafe` |
|---|---|---|
| Number / math (default) | `math-calm-68-cmaj` | false |
| Literacy / phonics | `literacy-playful-76` | false |
| **Pinyin / tone-teaching** | `tone-safe-pad` | **true** |
| (outro/celebration moments use the envelope's outro resolve, not a separate bed) | — | — |

**The tone-language guard (the rule unique to us).** When the child must hear a spoken lexical tone (pinyin lessons), a melodic bed pitch-contour competes with the tone. Set `toneSafe: true` → the bed is a flat pad/drone and NO melodic motif (sting/pentatonic accent) may play under narration. A pentatonic dizi/guzheng accent is welcome, but only in the intro or a narration GAP, never under tone-teaching words.

**Palette discipline (from research — do not re-litigate per lesson):** beds are calm, major/neutral, 60–80 BPM, no vocals. Western soft piano + warm pad is the safe default; Mandarin pentatonic instruments are a sparing ACCENT (intro/success/gaps), not the bed. Default to the existing library; if a needed mood is genuinely absent, NAME it for the Wave 3c sound-asset lane — do not describe a bespoke score.

## Intro / outro
- `intro.sting`: optional one-shot over the topic-intro card. A `mandarin-accent` sting is allowed for Mandarin topics (it sits over the intro card, before narration).
- `outro.resolve: true`: the bed rises to full as the last narration ends. Default on.

## SFX → beat map
Map only MOTIVATED beats, using the fixed vocabulary (`pop` / `chime` / `whoosh` / `tick` / `ta-da`). Each row is `{ cue, event, sound, perStep?, risingPitch? }` — semantic; the composer computes the frame.

| `event` | Fires on (composer's motion) | Typical `sound` |
|---|---|---|
| `popin` | a `<PopIn>` entrance | `pop` |
| `count` | each counted step (set `perStep: true`) | `tick` |
| `transition` | section/scene change, `<ShineSweep>`, `SectionHandoff` | `whoosh` |
| `reward` | a discovery/success beat | `chime` (small) or `ta-da` (the win) |

### Density discipline (hard rules)
- **≤ 1 motivated SFX per beat.** Never one-per-frame. When in doubt, leave it silent.
- **NO SFX over instruction words.** Reward/interaction sounds land in a narration GAP or after the line — never on top of the teaching narration (it measurably hurts young learners).
- **`ta-da` at most ONCE per lesson**, on the single success beat.
- **`risingPitch: true`** (with `perStep`) ascends pitch across a counted set — auditory magnitude. This is evidence-INFORMED, not proven for counting specifically; use it, flag it `[ASSUMED]` in your log, and expect Wave 6 to sanity-check it.

### Numeric mix bands (law)

The composer/kit (`@studio/sound-kit`) apply these as mechanical gain/frame constants — published here so your density and reward choices are grounded in the real mix, not adjectives. A motivated SFX still gets these exact numbers; density discipline above is what keeps them from stacking into noise, not the numbers alone.

| Band | Value | Why (one line) |
|---|---|---|
| Voice (narration) | 1.0 | The lesson IS the voice — every other layer is measured relative to it, never the reverse. |
| SFX one-shot | 0.4–0.8 | Loud enough to register as a motivated event; never loud enough to compete with the voice it must sit under. |
| Bed, under voice | 0.1–0.2 | High enough that the gap between utterances never reads as a dropped track; low enough that the melody stays unidentifiable under narration (the `toneSafe` guard depends on this floor holding). |
| SFX lead time | −5 frames before its beat | A one-shot's perceptual transient peaks a few frames after its own onset; leading the beat by 5 frames puts the PEAK on the beat, not the strike. |
| Duck ramp (down/up) | 8–15 frames | Under 8 frames a duck reads as an audible click; over 15 it reads as sluggish against a beat the child is watching land in real time. |
| Short-gap fallback | rise to the MIDPOINT, never full un-duck | When two narration windows sit closer together than a full ramp-down-then-up needs, forcing a full rise only to re-duck a few frames later is an audible pop; rising partway marks the pause as real without the pop. |

These are MIX numbers (gain + frame constants) — they never enter `audio-cues.json` (still SEMANTIC, still frame-free); the composer/kit read them from the kit's own `audioMix.ts`/`sfx.ts`, never from your JSON.

**Known kit gap (read-only audit — not yours to fix).** The shipped `DEFAULT_MIX_CONFIG` bed-under-voice level (`bedUnducked 0.13 × duckFactor 0.45 ≈ 0.06`, `@studio/sound-kit/src/audioMix.ts:56-63`) undershoots the 0.1–0.2 floor above, and `bedVolume` (`audioMix.ts:116-147`) has no explicit short-gap midpoint fallback — it composes each window's ramp multiplicatively with no gap-length check, which CAN dip below the ducked floor for closely-spaced narration windows instead of rising to a midpoint. Filed as a pipelineFinding for the kit owner (never patch `@studio/sound-kit` from this repo); if a rendered bed reads buried under voice, this is why.

## NEVER
- Write a frame number, offset, or duration into `audio-cues.json` (frames are the composer's; the schema has no frame field).
- Invent a new bed/SFX/sting asset or edit any code/WAV — naming a gap is the Wave 3c lane's job, building it is author-time.
- Put a melodic motif under tone-teaching narration when `toneSafe`.
- Add an SFX with no motivating motion event in `visual-design.md`.

## Report back
- Path to `audio-cues.json` + the bed/toneSafe choice with one-line reason.
- The SFX rows + a one-line density justification (how many sonified beats, why each is motivated).
- Any asset gap named for Wave 3c.
- Any `[ASSUMED]` choice (e.g. risingPitch) flagged for Wave 6.
