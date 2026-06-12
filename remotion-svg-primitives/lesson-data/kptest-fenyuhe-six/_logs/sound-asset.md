# W3c — Sound-Asset Gap-Scan

**Node:** W3c sound-asset
**Lesson:** kptest-fenyuhe-six (6的分与合, grade-1 part–whole, Mandarin-narrated)
**Date:** 2026-06-09
**Status:** **ok** — every key in `audio-cues.json` resolves to a licensed WAV in the shared library; no new assets were minted, no `generate-sound-assets.mjs` invocation was needed.

## INPUTS READ

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/audio-cues.json` — Wave 2c manifest (bed + intro sting + outro + 8 SFX rows).
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/brief.md` — confirms 6的分与合 is a part–whole topic; the Chinese bond glyphs (一和五 / 二和四 / 三和三) and the 分/合 action words are the load-bearing verbal content, so `toneSafe: true` is the right guard.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/_logs/w2c-sound-design.md` — Wave 2c log (bed/sting/SFX selections and the density justification).
- `/Users/tk/Desktop/shared-sound/public/audio/_beds/_index.json` — 10 beds, incl. `tone-safe-pad` (the lesson's choice).
- `/Users/tk/Desktop/shared-sound/public/audio/_sfx/_index.json` — 38 SFX, incl. `pop`, `tick`, `ta-da` (the lesson's SFX).
- `/Users/tk/Desktop/shared-sound/public/audio/_stings/_index.json` — 11 stings, incl. `mandarin-accent` (the lesson's intro sting).

## OUTPUTS WRITTEN

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/_logs/sound-asset.md` — this file (key → resolved file table + on-disk verification).

## COMMANDS RUN

- `ls -la /Users/tk/Desktop/shared-sound/public/audio/_beds/_index.json _sfx/_index.json _stings/_index.json` — confirm library index files present.
- `read` of all three `_index.json` files — authoritative name → file + license map.
- `ls /Users/tk/Desktop/shared-sound/public/audio/_beds /Users/tk/Desktop/shared-sound/public/audio/_sfx /Users/tk/Desktop/shared-sound/public/audio/_stings` — confirm on-disk file presence matches the index.
- Per-key `stat -f%z` + license-sidecar check for every WAV this lesson needs (results in the table below) — every key on disk, every `.license.txt` present.
- (No `vlog_test/pipeline/sound-assets.manifest.json` row added; no `/Users/tk/Desktop/vlog_test/pipeline/generate-sound-assets.mjs` invocation — no genuine gaps.)

## KEY → FILE RESOLUTION

Every key in `audio-cues.json` is unique-or-reused; here is the complete key set, the on-disk WAV, its size, and its license sidecar:

| # | audio-cues.json key | role | resolved file | size (B) | lengthSeconds | license |
|---|---|---|---|---|---|---|
| 1 | `bed: "tone-safe-pad"` | continuous bed, flat pad / drone, no melody (the `toneSafe: true` guard) | `/Users/tk/Desktop/shared-sound/public/audio/_beds/tone-safe-pad.wav` | 32 633 934 | 185.00 | `tone-safe-pad.license.txt` — ElevenLabs Eleven Music / Sound Effects (API), commercial via paid plan |
| 2 | `intro.sting: "mandarin-accent"` | one-shot over topic-intro card; sits BEFORE narration (not under tone-teaching words) | `/Users/tk/Desktop/shared-sound/public/audio/_stings/mandarin-accent.wav` | 576 090 | 3.00 | `mandarin-accent.license.txt` — ElevenLabs, commercial via paid plan |
| 3 | `outro.resolve: true` | bed envelope — no separate asset; the composer (Wave 4) drives the bed's rise to full as the last narration ends | n/a (composer's envelope) | n/a | n/a | n/a |
| 4 | `sfx: cue-announce-split-1of5` → `pop` | PopIn entrance for the 1和5 split's *settle* | `/Users/tk/Desktop/shared-sound/public/audio/_sfx/pop.wav` | 17 358 | 0.18 | `pop.license.txt` — ElevenLabs, commercial via paid plan |
| 5 | `sfx: cue-conserve-1of5` → `pop` | PopIn entrance for the 1+5 合 back's *settle* | `pop.wav` (same) | 17 358 | 0.18 | (same) |
| 6 | `sfx: cue-split-2of4` → `pop` | PopIn entrance for the 2和4 split's *settle* | `pop.wav` (same) | 17 358 | 0.18 | (same) |
| 7 | `sfx: cue-conserve-2of4` → `pop` | PopIn entrance for the 2+4 合 back's *settle* | `pop.wav` (same) | 17 358 | 0.18 | (same) |
| 8 | `sfx: cue-split-3of3` → `pop` | PopIn entrance for the 3和3 split's *settle* (the highlight; SFX parity with prior splits — no louder variant) | `pop.wav` (same) | 17 358 | 0.18 | (same) |
| 9 | `sfx: cue-conserve-3of3` → `pop` | PopIn entrance for the 3+3 合 back's *settle* | `pop.wav` (same) | 17 358 | 0.18 | (same) |
| 10 | `sfx: cue-reveal-answer` → `ta-da` | the single reward / `ta-da` for the whole lesson (the 3和3 answer reveal) | `/Users/tk/Desktop/shared-sound/public/audio/_sfx/ta-da.wav` | 57 678 | 0.60 | `ta-da.license.txt` — ElevenLabs, commercial via paid plan |
| 11 | `sfx: cue-spaced-recap-all-three` → `tick` (perStep + risingPitch) | 3 ticks, ascending pitch — one per recap sub-beat (1和5 → 2和4 → 3和3) | `/Users/tk/Desktop/shared-sound/public/audio/_sfx/tick.wav` | 9 678 | 0.10 | `tick.license.txt` — ElevenLabs, commercial via paid plan |

**Unique keys referenced (5 total):** `tone-safe-pad` (bed), `mandarin-accent` (intro sting), `pop` (SFX, 1 unique file reused 6 times), `ta-da` (SFX × 1), `tick` (SFX × 1). All five unique file targets exist on disk; all five have matching `.license.txt` sidecars; all license = "ElevenLabs Eleven Music / Sound Effects (API) — commercial via paid plan".

**SFX count check (≤ 1 motivated SFX per beat, ≤ 1 `ta-da` per lesson):** 6 `pop` events (one per split/merge *settle* — the bigger motion, not the smaller glyph fade-in), 1 `ta-da` (cue-reveal-answer, the single win), 3 `tick`s (perStep on the recap). All `pop` events are on visual events (PopIn entrance), not on words. All five of the `pop` events sit on the *settle* of the motion (after the dot-cluster arrives), not on top of the teaching line.

**Not sonified (and why):**
- `cue-learner-response-gap` — the cue IS a ≥3 s real held silence (baked into the WAV at zero TTS cost); adding any SFX would violate the silence-is-the-beat rule and the NO-SFX-over-instruction-words rule.

## KEY DECISIONS

1. **No asset was minted.** Every key in `audio-cues.json` is already in the curated shared library. The default = REUSE path held — the gap-scan took seconds.
2. **`tone-safe-pad` is the correct bed** for this lesson. The flat-pad key explicitly exists in the library for the `toneSafe: true` guard (a non-pitch-contouring bed that does not mask the Mandarin lexical tones the child must hear to learn the names of the splits).
3. **`mandarin-accent` intro sting is the correct cultural accent** for a Mandarin topic. It plays over the topic-intro card — *before* any narration — so it is not under tone-teaching words, and the `toneSafe` guard is preserved.
4. **`pop` / `tick` / `ta-da` are the right SFX vocabulary** (matches the skill's fixed SFX vocabulary). `ta-da` appears exactly once — the single success beat — satisfying the ≤ 1 `ta-da`/lesson rule.
5. **All 6 `pop` events reuse the same `pop.wav`** — variant SFX (`pop-2`, `pop-3`) exist in the library and could give the 6 repeated PopIn events more auditory variety, but the skill's ≤ 1 SFX per beat rule and the pedagogy's co-equal-beats audit (#5 — modeling parity for all three splits) both argue for the same restrained `pop` across the modeling chain. The variety-via-variant-pop case is a W6 judgment, not a W3c gap.

## ISSUES

None. All assets present, all licensed, all on the offline render path (no network fetch at render time).

## PIPELINE FINDINGS

- (positive) The shared library is large enough that 6 of the 6 modeling+conservation `pop` events reuse one `pop.wav`. The library has `pop-2` / `pop-3` variants that *could* add auditory variety across the 6 splits, but the skill's density rule and the pedagogy's co-equal-beats audit both keep this out of scope. A W6 reviewer can re-open this if the rendered output feels over-sonified.
- (positive) The tone-language guard is structurally enforced by the `tone-safe-pad` asset existing in the library — a future `toneSafe: true` lesson cannot pick a melodic bed by accident. This is the right shape of the shared library for a part–whole pinyin/Mandarin lesson.
- (process) No manifest row was added and no `generate-sound-assets.mjs` was invoked because there were no genuine gaps. If a future lesson names a key not in the library, this W3c node will name the gap here and add a manifest row in the same pass.
- (process, echo from W2c) `toneSafe` should probably auto-default to `true` for any Mandarin-narrated lesson, not just explicit pinyin lessons — the principle ("bed must not pitch-contour against verbal lexical tones the child must hear") applies broadly. W2c flagged this as a skill-update candidate; repeating it here for the W3c perspective. This lesson's W2c author did the right call by following the principle; the skill text still uses the narrower "pinyin / tone-teaching" example and a future agent could read it as a narrower rule than it is.
