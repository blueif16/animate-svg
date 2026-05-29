# Audio & Captions Plan — kp1-fen-yu-he-intro

Wave 2b artifact. Narration text is authoritative in `script-cues.json` (do **not** edit). This document specifies pacing **intent**, captions, sfx, BGM, and ASR risk flags for Wave 3 (voice + ASR) and Wave 4 (composer + sketch-layer). All cue durations below are **estimates, not contracts** — only the post-ASR timing module (`src/lessons/generated/kp1FenYuHeIntroTiming.ts`) is authoritative for the composer.

---

## §1  Voice & tone direction

Voice settings come from `lesson-data/_shared/voice.json`:
- **Model**: `gemini-3.1-flash-live-preview`
- **Voice name**: `Aoede`
- **Mode**: `perCue` (one TTS clip per cue)
- **Inter-cue gap**: `0.25 s` (default)
- **Max clip duration**: `6.5 s` per cue (hard cap — narration per cue stays well under this)
- **Prompt template**: 温柔、清晰、面对6岁孩子，节奏适中偏慢，亲切，每个字发清楚 — unchanged from `_shared/voice.json`. Do not override.

Tone for KP1: this is the child's first encounter with formal mathematical notation. Voice must be warm, calm, unhurried — the *picture* does the work, and the voice is a gentle hand pointing at it. No excitement spikes, no question-rising intonation on the count chips. The load-bearing cue (`fenheshi-intro`) is the only place that earns a small note of "this is something new" — the rest of the lesson stays steady.

Calibration (KP1's slow Mandarin voice): ~0.40–0.50s per Chinese character on conversational lines. A 12-char cue ≈ 5.0–5.5s spoken. We deliberately keep every cue's spoken narration under 6.5s to respect `maxClipSeconds`; the rest of each cue's duration is post-narration hold absorbed by the visual choreography.

---

## §2  Pedagogy §4 narration-leakage audit (drafted-in, not patched-after)

Pedagogy §4 forbids the narrator from announcing what the picture is supposed to make the child notice. Three storyboard drafts had this risk; the final script below was written to fix it at the drafting step rather than patching later.

| cue | storyboard draft (problematic phrase) | leakage problem | final narration fix |
| --- | --- | --- | --- |
| `fen-name` | "五个点点，分成两堆 — 这边二个，那边三个。这样把它们分开，就叫做『分』。" | Narrator announces the counts (五 / 二 / 三) while the picture is what should deliver them via the snap-on chips. Triple leak. | Drop all count announcements. Narrate only the named action: "把它们这样分开，就叫做分。" Picture delivers 5 / 2 / 3 via the chip snap-ons. |
| `fenheshi-intro` | "上面写整体的『五』，下面写两个部分『二』和『三』，中间用两条短线连起来。这张图叫做『分合式』。" | Narrator reads the diagram's contents aloud (五 / 二 / 三) while the labels are migrating into the diagram positions. The migration IS the lesson; reading the contents off-screen pulls the eye away from the migration. | Drop the per-position read-out. Narrate only the act of recording and the diagram's name: "把它画下来，这张图叫做分合式。" Picture delivers the migration. |
| `fenheshi-read` | "从上往下读 — 五分成二和三。再从下往上读 — 二和三组成五。" | Narrator reads the diagram fully (五 / 二 / 三) twice. The two sweeps are the focal change; the count is already on screen. | Replace the literal readings with the relation names only: "从上往下，是分成；从下往上，是组成。" The two sweeps deliver direction; "分成" / "组成" label the directions. |

The two cues where number-naming is **kept** intentionally:
- `five-1-4` — narration says "一和四" *after* the new 分合式 has landed. This is the "name AFTER the picture delivers" pattern from pedagogy §4 ("narrator says '一个十' *after* the rope ties"). The counts are confirmation, not announcement.
- `five-3-2-and-4-1` — same pattern: "还有三和二，四和一" lands as the two new diagrams arrive in sequence. The narration confirms what just appeared and then states the total ("一共四种") — a summary line, allowed because the four diagrams are visibly present.

The `outro` line "五的分与合，一共四种" is also restating only what is visibly on screen — pedagogy compliant.

---

## §3  Per-cue plan

Calibration: see §1. Spoken-narration estimates assume Aoede's slow Mandarin pacing (~0.42s per Chinese character including breath). Post-narration hold is **intent for the composer** — the composer either extends visual choreography to fill the hold, or the orchestrator inserts the silence via cue-boundary padding. Cue total = spoken narration + hold.

| cue id | narration (authoritative in script-cues.json) | chars | est. narration (s) | post-narration hold (s) | **est. cue total (s) — INTENT** | ASR risk |
| --- | --- | --- | --- | --- | --- | --- |
| intro | 今天，我们来认识分与合。 | 11 | 4.8 | 2.7 | **7.5** | Low |
| fen-show | 看，这一堆点点可以分开。 | 11 | 4.8 | 5.2 | **10.0** | Low |
| fen-name | 把它们这样分开，就叫做分。 | 12 | 5.4 | 6.6 | **12.0** | **Med** (bare `分` end-utterance — see §4.1) |
| he-show | 现在反过来，让它们合到一起。 | 13 | 5.7 | 3.3 | **9.0** | Low |
| he-name *(emphasis)* | 合到一起，就叫做合。分和合，方向相反。 | 17 | 6.4 | 5.5 | **11.9** | **Med** (bare `合` mid-utterance — see §4.2) |
| fenheshi-intro *(emphasis)* | 把它画下来，这张图叫做分合式。 | 14 | 6.0 | 9.0 | **15.0** | Low (3-char compound `分合式`) |
| fenheshi-read | 从上往下，是分成；从下往上，是组成。 | 16 | 6.4 | 6.6 | **13.0** | Low (2-char compounds throughout) |
| five-1-4 | 五还可以这样分 — 一和四。 | 11 | 4.9 | 5.6 | **10.5** | **Low-Med** (trailing `一和四` short final tokens — see §4.3) |
| five-3-2-and-4-1 | 还有三和二，四和一。一共四种。 | 14 | 6.0 | 8.0 | **14.0** | Low-Med (similar trailing-short-numbers pattern) |
| outro | 这就是五的分与合，一共四种。 | 13 | 5.5 | 2.9 | **8.4** | Low |

**Estimated total spoken narration**: 4.8 + 4.8 + 5.4 + 5.7 + 6.4 + 6.0 + 6.4 + 4.9 + 6.0 + 5.5 = **55.9 s**.
**Estimated total post-narration hold**: 2.7 + 5.2 + 6.6 + 3.3 + 5.5 + 9.0 + 6.6 + 5.6 + 8.0 + 2.9 = **55.4 s**.
**Estimated sum of cue totals**: **~111.3 s**.

**Inter-cue gaps**: 9 gaps × 0.25 s default = **2.25 s** total silence between cues.

**Estimated grand runtime**: 111.3 + 2.25 ≈ **~113.5 s**. Inside the 100–130s target band; well-positioned mid-band, leaving headroom on either side for ASR overruns or composer extensions.

Pacing notes:
- `fen-show` and `fen-name` together carry the first concrete→represent transition (separation → labels + 分 binding). The combined ~22s gives the slow split animation room to breathe; do not compress.
- `fenheshi-intro` gets the longest hold (9.0s) because it is the load-bearing migration — labels rising up, lines drawing in, parts settling. Choreography drives the duration; the narration is intentionally short so the spoken sentence does not interrupt the migration.
- `he-name` is `emphasis: true` because it makes the inverse relationship explicit (the only cue allowed by pedagogy to name a relation in words rather than have the picture deliver it alone).
- `fenheshi-intro` is `emphasis: true` because it is the lesson's pivot from concrete to symbolic — the moment naming a name has the most weight.
- `outro` is intentionally short (8.4s) — pedagogy says the outro is a hold for co-location of the three discoveries, not new content. Don't pad.

---

## §4  ASR risk decisions

Three risks identified; mitigations applied at the drafting step. Each risk has a clearly-stated trigger for fall-back action during Wave 3 verification.

### 4.1  `fen-name` — bare `分` at end-of-utterance — **MED risk**

- **Phrase**: `把它们这样分开就叫做分`
- **Why risky**: Single character `分` lands at the absolute end of the utterance. Aoede's slow Mandarin voice has been observed to soften the final character on short cues. If the trailing `分` energy drops, the ASR tokenizer may either skip it or merge it into the preceding `做` token.
- **Mitigation applied (drafted-in)**: Pair the bare `分` with the multi-character companion `分开` earlier in the same cue. The aligner now has two `分`-bearing tokens to lock onto. The `就叫做` pre-roll also adds 3 syllables of build-up so the bare `分` is the *resolution* of a setup, which tends to keep voice energy up.
- **Fall-back trigger (Wave 3)**: If `matchScore < 0.8` OR `分` audibly truncated OR cue duration < 4.0s → swap narration to "**把它们这样分开 — 这就叫做分开的分。**" (phrase: `把它们这样分开这就叫做分开的分`, 16 chars ≈ 6.7s — at edge but inside cap). This pairs the bare `分` with a self-referential `分开的分` so the aligner anchors on `分开` then locks `分` as the head of a 2-char compound the listener already heard. Caption updates to match.
- **Decision logged**: applied at draft; do not pre-emptively swap. Verify on first voice gen.

### 4.2  `he-name` — bare `合` mid-utterance, plus inverse-naming load — **MED risk**

- **Phrase**: `合到一起就叫做合分和合方向相反`
- **Why risky**: Three `合` tokens in the same utterance — first as compound (`合到一起`), second as bare resolution (`就叫做合`), third inside compound (`分和合`). The middle bare `合` is the load-bearing one (it binds the term). If the ASR tokenizer collapses two adjacent `合` references it may shift the cue's character span.
- **Mitigation applied (drafted-in)**: Lead with multi-character `合到一起` so the aligner already has a high-confidence `合` lock. The bare `合` mid-utterance is then a re-anchoring against an existing lock, not a cold introduction. The trailing `分和合` re-asserts both terms in close adjacency, which helps the aligner disambiguate.
- **Fall-back trigger (Wave 3)**: If `matchScore < 0.8` OR audible drop on the bare `合` OR duration < 5.5s → swap to "**合到一起，这样就叫合起来。分和合，方向相反。**" (phrase: `合到一起这样就叫合起来分和合方向相反`, 19 chars ≈ 7.5s — slightly over cap). If over-cap fires, fall back to splitting hold but never split the cue. Caption updates to match.
- **Decision logged**: applied at draft; do not pre-emptively swap.

### 4.3  `five-1-4` and `five-3-2-and-4-1` — trailing short-number tokens — **LOW-MED risk**

- **Phrases**: `五还可以这样分一和四` / `还有三和二四和一一共四种`
- **Why risky**: Short numeric tokens at end-of-cue can be soft in Aoede's slow voice — `四` at the very end of `five-1-4` and `一` at the end of the `四和一` pair in `five-3-2-and-4-1` are the lowest-energy positions. The `一一共` adjacency in the second cue (final `一` of `四和一` immediately before `一共`) is a `一`-collision pattern KP2 already documented as fragile.
- **Mitigation applied (drafted-in)**:
  - `five-1-4` uses an em-dash pause (` — `) before the numeric pair so Aoede inserts an audible breath. The numbers then ride on a fresh prosody arc, reducing the chance of final-token softening.
  - `five-3-2-and-4-1` separates the `四和一` from `一共四种` with a period + sentence break — Aoede's `perCue` mode treats the period as a clear pause, so the two `一`-bearing tokens are not in adjacent prosody.
- **Fall-back trigger (Wave 3)**:
  - For `five-1-4`: If `matchScore < 0.8` OR final `四` truncated → swap to "**五还可以分成 — 一和四。**" (phrase: `五还可以分成一和四`, 9 chars). The `分成` compound is more familiar to the aligner and lands the numeric pair earlier in the utterance.
  - For `five-3-2-and-4-1`: If `matchScore < 0.8` OR `一一` audibly collapses → swap to "**还可以是 — 三和二，四和一。一共有四种分法。**" (phrase: `还可以是三和二四和一一共有四种分法`, 16 chars ≈ 6.7s — at edge). Adds `有 ... 分法` so the trailing summary contains more anchor tokens.
- **Decision logged**: applied at draft; do not pre-emptively swap.

### Non-risks worth noting (no action required)

- `intro`, `fen-show`, `he-show`, `outro` — all use familiar compound words and have no bare single-character `分`/`合` utterances. Expected `matchScore` ≥ 0.95.
- `fenheshi-intro` and `fenheshi-read` — both use the 3-character compound `分合式` and 2-character compounds `分成` / `组成`. The compounds tokenize cleanly; ASR risk is low even though the lesson's vocabulary density is high. No mitigation needed.
- The repeated near-identical structure of `five-1-4` and `five-3-2-and-4-1` is intentional — repeated cue shape helps a 6yo hear the pattern, and the aligner benefits from the prior cue's prosody as a calibration reference.

---

## §5  Captions plan

Captions = the exact `caption` field from `script-cues.json` (punctuation preserved). Captions are identical to narration in every cue — they do not abridge, because the spoken lines are already short and every word carries pedagogical weight.

Caption styling (reuse KP1's lesson-agnostic styling shared with KP2 — do **not** introduce new tokens):

- **Source text**: render `caption` field including punctuation. Never the punctuation-stripped `phrase`.
- **Font**: warm rounded Chinese sans (PingFang SC / Source Han Sans Rounded equivalent). Weight: medium (500–600). Refer to `early-childhood-visual-taste` tokens.
- **Size**: ~64–72px on 1920×1080 (~3.5–4% of canvas height). All captions here are ≤18 chars; the two longest (`he-name`, `fenheshi-read`) may wrap to two lines if the chosen pill width is narrow. Composer to decide single-line vs. two-line at layout time — both are acceptable; the wrap point must be on a Chinese punctuation mark (period, semicolon, em-dash), never mid-clause.
- **Position**: bottom-center, baseline ~10% from bottom edge. Safe-area: ≥80px clearance from bottom. Lower band must not overlap the central diagram zone (the 分合式 occupies the central vertical band during cues 6–9 and must remain unobstructed).
- **Color**: dark neutral (#2A2A2A) on cream/off-white pill background (#FFF7EC at ~85% opacity), 12–16px rounded corners, ~24px horizontal padding. Subtle drop shadow (y:2px, blur:8px, 8% opacity).
- **Fade timing**: caption fades in 6 frames (0.2s) before its cue's narration starts, fades out 6 frames after narration ends — so it remains present through the post-narration hold but exits before the next caption appears. **All fade frames are cue-relative; composer derives them from `cues[id].startFrame` and `cues[id].endFrame`, never from master-timeline literals.**
- **Emphasis** (`he-name`, `fenheshi-intro`): size +10% (~72→80px), pill background to warmer accent (#FFEFD1), text weight 700. For `he-name`, underline the trailing clause `方向相反` (the inverse-relation statement). For `fenheshi-intro`, underline the final 3 characters `分合式` (the term being named).

No absolute frame numbers anywhere. Composer derives all caption timing from the ASR-aligned cue boundaries.

---

## §6  Background music intent

**Recommendation: voice-only, no BGM.** Consistent with KP1's *delivered* state (KP1 spec recommended BGM but the actual render shipped without). Rationale specific to kp1-fen-yu-he-intro:

1. This lesson teaches the child's first formal symbolization — the migration from dot row to 分合式 diagram is a quiet, attentive moment. Any BGM, however soft, competes with the visual transition. The `fenheshi-intro` cue is the load-bearing moment of the entire video; it needs silence under the voice.
2. KP1 of the prior unit shipped without BGM; this lesson is the first KP of a new unit but the same teacher voice. Audio continuity > unit boundary.
3. Total runtime is ~113s — well inside attention span for a 6yo when supported by visual variety. No music required for sustain.

If a future producer adds BGM to the 1.4 unit (KP1 + KP2 of this video, KP4–KP6 of the partner video), they should: (a) treat the unit as one BGM track with consistent loop and ducking; (b) duck heavily under `he-name` and `fenheshi-intro` (the two emphasis cues) — at least -8dB below baseline; (c) fade out entirely under the post-narration hold of `fenheshi-intro` so the migration animation lands in silence. Do not introduce BGM in this lesson alone.

---

## §7  Total estimated runtime

| component | est. seconds |
| --- | --- |
| Sum of cue totals (§3) | 111.3 |
| Inter-cue gaps (9 × 0.25s) | 2.25 |
| **Estimated grand runtime** | **~113.5 s** |

Target band: **100–130 s**. **Estimate sits at ~113.5 s — mid-band, with healthy headroom in both directions.**

If post-ASR the actual runtime drops below 100s (likely cause: Aoede running faster than estimated, or the storyboard's slow split / migration animations being compressible), the orchestrator should extend `fen-show` (slow separation needs room) and `fenheshi-intro` (the migration is the lesson's pivot) post-narration holds by +1–2s each before trimming anywhere else. Do **not** trim `fenheshi-intro` below 12s total — the migration animation needs the time.

If the actual runtime exceeds 130s (unlikely with this script), trim the `outro` post-hold from 2.9s → 1.5s (the outro is a quick co-location; no need for a long dwell), and reduce `fen-name`'s post-hold from 6.6s → 4.5s (the label snap-on is fast; the long hold is luxury, not load-bearing). Do not trim `fenheshi-intro` regardless of overage.

---

## §8  Handoff to Wave 3 (orchestrator must verify)

The orchestrator (not this subagent, not a downstream subagent) must, after `npm run lesson:voice` produces `gemini-voice.json` and the timing module:

1. Read `transcriptText` vs `script` in `lesson-data/kp1-fen-yu-he-intro/gemini-voice.json`. Confirm every cue's narration is present and recognizable; in particular, confirm both bare-character utterances `…就叫做分。` (cue `fen-name`) and `…就叫做合。` (cue `he-name`) are audibly complete.
2. Read `matchScore`, `asrText`, and `duration` for each cue in `src/lessons/generated/kp1FenYuHeIntroTiming.ts`.
3. Apply the per-cue fall-back triggers from §4:
   - `fen-name`: matchScore < 0.8 OR bare `分` truncated OR duration < 4.0s → swap narration per §4.1.
   - `he-name`: matchScore < 0.8 OR bare `合` truncated OR duration < 5.5s → swap narration per §4.2.
   - `five-1-4`: matchScore < 0.8 OR final `四` truncated → swap narration per §4.3.
   - `five-3-2-and-4-1`: matchScore < 0.8 OR `一一` collapses → swap narration per §4.3.
4. If any fix is applied, edit `script-cues.json` (with the orchestrator's explicit decision logged in the response), re-run `npm run lesson:voice`, and re-verify.
5. Silent passes (matchScore < 0.8 with no recorded decision) are forbidden by project rules.

This file is INTENT only. Wave 4 composer trusts only the ASR-aligned timing module.
