# Flow D — Counting/enumeration animation is out of sync with the spoken number (lags/leads by one)

Date: 2026-06-12
Diagnosis agent: deep-dive (read-only). No files edited. Human approves before anything lands.

## Symptom

Human, on the rendered `kptest-first-second-third` MP4:

> "Every time we do one, two, three, the animations always lag with the audio by one. For example at 二 the circling of objects already happened on number three. This looks really weird. I think there's an inherent bug in our system."

The enumeration spotlight (the count-walk finger + ordinal ring in `OrderedRowSpotlight`) steps 第一 → 第二 → 第三 on a clock that is **decoupled from the actual voice**. The visual "lands on" each ordinal at a time that has nothing to do with when the TTS utters that ordinal, so the mark and the spoken word read as two different events. It is not jitter — it is a systematic, compounding lead/lag.

## Root cause

**An enumeration animation steps on a FIXED frame grid (`SWEEP_STEP_FRAMES = 48`) anchored at the cue head, while the TTS utters 第一/第二/第三 at uneven, voice-dependent times that the system already measured per token but throws away.** This is the *exact* class the project laws forbid — "MEASURE, DON'T ASSUME" and "ZERO FRAME LITERALS" — applied at the per-token level: a hardcoded 48-frame step is an assumed inter-word interval, not a measured one.

### The fixed grid (the assumption)

`src/lessons/kptestFirstSecondThird/layout.ts:82-83`
```ts
export const SWEEP_REL_START = 0;
export const SWEEP_STEP_FRAMES = 48;    // ~1.6s per ordinal position (spacious dwell)
```

Every counting anchor is `cueStart + SWEEP_STEP_FRAMES * k`:
- `OrderedRowSpotlight` receives `atFrame = frame - cueStart` and `stepDurationFrames = SWEEP_STEP_FRAMES`; internally it advances `derivedStep = floor(local / D)` — a pure grid (`OrderedRowSpotlight.tsx:164-216`).
- The `spotlightOrdinal` prop is computed off the same grid in the scene, e.g. `countThirdLocal >= SWEEP_STEP_FRAMES*2 ? 3 : countThirdLocal >= SWEEP_STEP_FRAMES ? 2 : 1` (`kptestFirstSecondThirdLessonScene.tsx:636-642`).
- The chip word-pulses are on the same grid: `chip1PulseCountThird = cStart("count-third") + SWEEP_STEP_FRAMES`, `chip2PulseCountThird = cStart("count-third") + SWEEP_STEP_FRAMES*2` (`...Scene.tsx:371-373`).
- The count-step SFX too: `SFX_COUNT_STEP_OFFSETS = [STEP*0, STEP*1, STEP*2]` (`layout.ts:109-113`).

Step 1 fires at **local frame 0 (cue head)**. But in `count-second`/`count-third` the cue does **not** open with "第一" — it opens with the preamble "从前面数——" and only *then* says "第一". So step 1 is already ~1.5 s early before any compounding.

### The measured truth that is ignored (data exists)

`bin/asr-align.py` runs a streaming transducer that emits **per-token onset events with timestamps** and writes them to `out/<id>/asr-alignment.json → transcript.tokenEvents` (`asr-align.py:190-194`, `:293`). Each `{ "time": <seconds>, "token": "第" }` is a real measured onset on the master timeline. For `kptest-first-second-third` these are present and clean (matchScore 0.72–1.0 on the count cues).

Mapping the spoken 第N onsets to **cue-local frames** (masterFrame − cue.startFrame, @30fps) vs where the 48-frame grid puts each step:

| cue | step | spoken 第N local frame | grid local frame | Δ (grid − speech) | meaning |
|---|---|---|---|---|---|
| count-second | 第一 | 54 | 0 | −54 f / **−1800 ms** | spotlight fires 1.8 s BEFORE word |
| count-second | 第二 | 93 | 48 | −45 f / **−1500 ms** | fires 1.5 s before word |
| count-third | 第一 | 54 | 0 | −54 f / **−1800 ms** | fires 1.8 s before word |
| count-third | 第二 | 92 | 48 | −44 f / **−1467 ms** | fires 1.5 s before word |
| count-third | 第三 | 140 | 96 | −44 f / **−1467 ms** | fires 1.5 s before word |
| recap-count | 第一 | 6 | 0 | −6 f / −200 ms | near-aligned (no preamble) |
| recap-count | 第二 | 65 | 48 | −17 f / −567 ms | grid drifts ahead |

(Computed from `out/kptest-first-second-third/asr-alignment.json`; cue starts from the reconciled timeline match the ASR `startFrame`s.)

So the grid runs **~1.5 s ahead of the voice on the load-bearing count cues**, and the lead is roughly one full step (48 f). That is precisely the human's report: "at 二 the circling already happened on number three" — the visual is a step ahead of the audio. The recap is less wrong only because it has no "从前面数" preamble.

### Where the data dies in the pipeline (the plumbing gap)

The per-token onsets are produced but **never plumbed past the raw ASR file**:

1. `out/<id>/asr-alignment.json` HAS `transcript.tokenEvents` (full onsets) and per-cue `tokenStartIndex`/`tokenEndIndex` into that array (`asr-align.py:243-253`). ← data exists here.
2. The generated **clip module** `src/lessons/generated/kptestFirstSecondThirdClips.ts` carries only `{ id, clipSrc, narrationFrames, caption, phrase, gap }` — **no token onsets, not even `targetTokens`**.
3. The kit reconcile (`shared-narration/src/reconcileTimeline.ts:218-293`, `reconcileClipTimeline`) copies `targetTokens` through (`:265`) but **drops every onset time**. `PlacedCue` / `AlignedLessonCue` (`types.ts:73-107`) have `targetTokens?: string[]` (the token *strings*) and **no per-token onset field**.
4. The scene therefore *cannot* see token onsets even if it wanted to — its only timing inputs are `cue.startFrame`/`endFrame`. So it falls back to a constant. The constant is the bug; the missing data path is *why* the constant exists.

No skill rule today says enumeration marks must bind to spoken-token onsets. `remotion-lesson-composer/SKILL.md` enforces ZERO FRAME LITERALS at the *cue* granularity (`cues[id].startFrame + offset`) but treats a per-cue grid constant like `SWEEP_STEP_FRAMES` as compliant — it is a named offset from a cue boundary. The law has a blind spot: a *named* constant that stands in for a *measured per-token interval* is the same "assume instead of measure" violation, one level down.

## Proposed fix

### Generalizable rule (the durable spec edit)

> **Any animation that marks a spoken enumeration or sequence — counting 1→N, pointing/circling once per number, a per-word pulse, a read-along highlight stepping word by word — MUST bind each step to that token's measured ASR onset frame. A fixed per-step constant (`SWEEP_STEP_FRAMES`, an evenly-spaced grid from the cue head) is FORBIDDEN for spoken-synchronized stepping. This is "MEASURE, DON'T ASSUME" / "ZERO FRAME LITERALS" applied at per-token granularity: the inter-word interval is voice-dependent and already measured by ASR — never assume it.**

Constants remain fine for motion that is NOT tied to a spoken token (an entrance pop, a settle bounce, a decorative breathe). The rule fires only when a visual step is meant to coincide with a specific uttered token.

### Concrete plumbing mechanism (ASR → token-onset map → composer anchor)

Plumb the onsets that already exist, end to end:

1. **Voice/ASR node (Wave 3a) emits per-cue token onsets into the clip module.** `bin/asr-align.py` already has `tokenEvents` + each cue's `tokenStartIndex/tokenEndIndex`. Extend the generated `ClipCue` (and the clip-module writer) to carry, per cue, a **`tokenOnsets`** array: cue-LOCAL onset frames for that cue's matched tokens — e.g. `tokenOnsets: { token: "第", localFrame: 54 }[]` or, more cheaply, an aligned `{ targetTokens, targetTokenOnsetsLocalFrames }` pair (local = masterFrame − cueStartFrame). Cue-local keeps it stable when the reconcile re-chains cue starts.
2. **Type carries it through.** Add `tokenOnsets?: TokenOnset[]` to `ClipCue`, `PlacedCue`, and `AlignedLessonCue` in `shared-narration/src/types.ts`, and copy it through `reconcileClipTimeline` next to the existing `targetTokens` passthrough (`reconcileTimeline.ts:265`). Onsets are cue-local, so re-chaining cue `startFrame`s does not invalidate them.
3. **Kit helper (reusable, the single read API).** Ship `tokenOnsetFrame(cue, tokenIndex)` (and a convenience `nthOrdinalOnsetFrame(cue, n)` that finds the n-th 第-prefixed ordinal) in `@studio/narration-kit`, returning `cue.startFrame + cue.tokenOnsets[i].localFrame`. The composer calls THIS instead of `cueStart + SWEEP_STEP_FRAMES*k`. One helper, every lesson.
4. **`OrderedRowSpotlight` accepts measured step frames.** Add an optional prop `stepFrames?: number[]` (cue-local onset frames per position). When present, the component advances the finger/ring/tally by "which onset window are we in" instead of `floor(local / D)`; `stepDurationFrames` stays the fallback for non-spoken count-walks. The scene passes `stepFrames = ["一","二","三"].map((_,i) => nthOrdinalOnsetFrame(cue, i+1) - cue.startFrame)`. Chip word-pulses and count-step SFX read the same onsets — one source.
5. **Graceful fallback.** If a cue has no usable onsets (low ASR evidence, a non-spoken count-walk, or an English lesson whose pattern didn't match), fall back to the existing constant grid AND surface a `pipelineFinding` so the gap is visible, never silently mis-synced.

### Owning skill / workflow node

- **Rule text** lands in **`remotion-lesson-composer/SKILL.md`** (a new short subsection under ZERO FRAME LITERALS: "Spoken enumeration binds to token onsets, never a step constant") — it is a composer discipline. Mirror one line into **`CLAUDE.md` → Discipline** so the ambient law matches.
- **The data path** is owned by the **voice/ASR node (Wave 3a)** + the **`asr-cue-aligner` SKILL** (emit `tokenOnsets` into the clip module) and the **kit** (`shared-narration` types + `reconcileClipTimeline` passthrough + the `tokenOnsetFrame` helper). Because `shared-narration` is a shared kit and `OrderedRowSpotlight` is a registered primitive, the primitive prop is a **capability change → Wave 3 / `capability-registry-harness`**, not a composer patch.
- This is a **structural change** (new kit field + new primitive prop + new helper across a skill boundary), so per CLAUDE.md it needs **human approval before edits**, then encode via **`hermes-skill-system`** as one atomic commit, and **re-validate with a clean-room pi run** of `kptest-first-second-third` (the count cues are the test).

### Why this generalizes (not a one-lesson patch)

The same helper + prop fixes any future counting lesson (`kptest-fenyuhe-six`, `kptest-compare-more-fewer`, any 摆数说写 / ordinal / cardinal-count beat), any language (onsets are language-agnostic; the ASR already runs zh+en), and any enumeration visual (finger walk, ordinal ring, per-word pulse, read-along highlight). It removes a whole *class* of "the count is a step ahead/behind" bugs by deleting the assumption that produced them.

## Where it lives (file index)

- Assumption / bug: `remotion-svg-primitives/src/lessons/kptestFirstSecondThird/layout.ts:82-83` (`SWEEP_STEP_FRAMES = 48`); consumers `kptestFirstSecondThirdLessonScene.tsx:367-380` (chip pulses), `:617,:636-642` (spotlightOrdinal), `layout.ts:109-113` (SFX); component grid `OrderedRowSpotlight.tsx:164,206-216,240`.
- Measured-but-ignored data: `remotion-svg-primitives/out/kptest-first-second-third/asr-alignment.json` (`transcript.tokenEvents`); producer `shared-narration/bin/asr-align.py:190-194,243-253,293`.
- Plumbing gap: `shared-narration/src/types.ts:73-107` (`ClipCue`/`PlacedCue`/`AlignedLessonCue` lack onset field); `shared-narration/src/reconcileTimeline.ts:218-293` (`reconcileClipTimeline` drops onsets); generated `remotion-svg-primitives/src/lessons/generated/kptestFirstSecondThirdClips.ts` (no `targetTokens`/onsets).
- Rule home: `.agents/skills/remotion-lesson-composer/SKILL.md` (+ `CLAUDE.md` Discipline mirror); data home: `.agents/skills/asr-cue-aligner/SKILL.md` (at `shared-narration/.agents/skills/asr-cue-aligner/`).

## External sync-tolerance anchor

How tight must a circling/pointing gesture align to the spoken number for a child to fuse them into one event?

- Adult audiovisual temporal binding window for speech: roughly **−90 ms (audio lead) to +180–240 ms (audio lag)** perceived as simultaneous; broadcast lip-sync "not consciously registered" only within ~−40 ms to +90 ms (ITU detectability ≈ 45 ms lead / 125 ms lag). Sources: Wikipedia "Audio-to-video synchronization" citing EBU R37 / ITU; ProSoundTraining "Typical Viewer Perception of Lip Sync Errors"; Frontiers Psychology 2021 (TWI / PSS).
- **Children's window is WIDER but still hundreds of ms, not seconds.** The audiovisual temporal binding window narrows through childhood; even young children's asynchrony-detection sits in the few-hundred-ms range (infant ITCW ≈ 350–666 ms; it tightens toward adult values with age). Source: PMC3954953, "The Audio-Visual Temporal Binding Window Narrows In Early Childhood."

**Implication.** Even the most generous early-childhood tolerance is a few hundred ms. The measured grid error here is **~1500–1800 ms** — 6×–8× past any binding window. The child cannot fuse the circle with the spoken number; they read two separate events, exactly as reported. Binding each step to the ASR onset drives the error to the per-token measurement resolution (well under one frame after rounding), inside the tolerance with large margin.
