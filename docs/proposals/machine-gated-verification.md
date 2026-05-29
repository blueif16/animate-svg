# Machine-Gated Verification — proposal

**Status:** draft for review (grounded in a de-risking spike).
**Owner:** orchestrator (pipeline infra).
**Date:** 2026-05-29.
**Spike scratch:** `remotion-svg-primitives/out/_spike/` (probe scripts; safe to delete).

> **Evidence provenance.** Every number tagged **[measured]** comes from a
> completed spike run with captured output: the analytical divergence (Exp B,
> `out/_spike/divergence.mjs`), the SSR cost model (Exp C, `ssr-timing.mjs`),
> ffmpeg `ebur128` (Exp D1), caption redundancy (Exp D4, `redundancy.mjs`), the
> sharp content-trim / contrast / motion-delta checks (Exp A, D2, D3,
> `measure-bbox.mjs` + `gates.mjs`), and the instrumented-render timing (Exp E,
> `lesson-data/fen-yu-he/_logs/render-timing.json`). Every architectural claim
> rests on source `file:line` evidence or a **[measured]** run; no number in this
> doc is an unverified estimate dressed as a measurement.

---

## 0. TL;DR

The collision gate (`npm run lesson:check`) is a **computed approximation**, not
pixel truth. It walks element pairs at ~11 named keyframes using bboxes that
mirror `layout.ts` with **linear** progress, while scenes animate with
**overshooting** easing (the migrating whole-card; `PopIn motion="bouncy"`). The
linear bbox is therefore **not** the "faithful conservative envelope"
`layout.ts:516-518` claims — it is an *under*-estimate at every overshoot peak.

**[measured]** At the migrating whole-card's overshoot peak (scale **1.0600**,
frame 450) the rendered card is **5.18 px wider × 6.11 px taller** than the
manifest bbox — it protrudes **~3.06 px past every edge**. A neighbour the
resting card clears by 2 px is overlapped by the overshot card (linear manifest
`collisions=0`; rendered overlap is real). For a **thin sketch-mark neighbour
(4 px) the missed overlap is ratio 0.264 > 0.15 → the verdict FLIPS to a
collision** the gate never sees; the flip persists for any resting gap ≤ 2.36 px
(all still clean manifest passes). **The whole-card is not even registered in the
manifest** (`manifest.ts:330-346`), so it is doubly invisible. `PopIn
motion="bouncy"` over-sizes **every** accent entrance by **4.6 %** (realized
spring peak, `out/_spike/divergence.mjs`).

Recommended architecture: keep the fast linear-manifest path as a cheap
pre-filter; add an **opt-in measured pass** that renders **motion-peak** frames
via SSR (**[measured]** bundle once **789 ms** warm + **~286–330 ms/frame**
steady-state, `out/_spike/ssr-timing.mjs`) and derives a TRUE bbox per
load-bearing element. Primary isolation: a tiny **`data-mid` + `getBBox()` hook**
captured via `renderStill`'s **`onBrowserLog`** (geometry truth, transform-aware
→ captures the 1.06 scale); pixel content-trim within the manifest-known crop is
the no-hook fallback (**[measured]** proven on an isolated candy; **proven to
fail** on the overlapping-sibling whole-card crop — exactly why the hook is
primary). Plus five cheap non-bbox gates (contrast, legibility, LUFS,
motion-too-fast, caption-redundancy) that reuse data we already produce, and
wiring the already-written-and-verified `assertAudioBreaths()`.

---

## 1. Problem (file:line refs + divergence numbers)

### 1.1 The named bug: "overlaps and misdetections"

- `scripts/lesson-check.mjs:40-54` runs three sub-steps; collision logic lives in
  `scripts/lesson-manifest.mjs`.
- `scripts/lesson-manifest.mjs:163-215` loops element **pairs** only at
  `extracted.keyFrames`, comparing rectangles with `OVERLAP_RATIO_THRESHOLD =
  0.15` (`:36`) and `OPACITY_THRESHOLD = 0.3` (`:37`).
- `scripts/_manifest-extract.ts:36-57` builds those snapshots from
  `el.bboxAt(frame)` at **~11 frames/lesson** (`manifest.ts:308-320` defines
  exactly 11 keyFrames).
- Each `bboxAt` reads `layout.ts`, whose helpers use **linear** `progress()`
  (`layout.ts:34-39`). The bug's root rationalization is the module's own
  comment:

  > `layout.ts:516-518` — *"They use LINEAR progress (no easing) — the easing in
  > the scene is monotone with the same endpoints, so the bounding box is a
  > faithful conservative envelope."*

That premise is **false** wherever scene scale/position overshoots its endpoint:

1. **Migrating whole-card** — `FenYuHeLessonScene.tsx:499`
   `interpolate(wholeLand, [0,0.6,1], [0.7,1.06,1], outCubic)` → peaks at 1.06
   about the card centre. Not registered in the manifest at all
   (`manifest.ts:330-346` lists `bigDiagram` but no migrating `NumberCard`s).
2. **`PopIn motion="bouncy"`** — `PopIn.tsx:48`
   `interpolate(entrance, [0,0.5,0.8,1], [scaleFrom,0.9,1.06,1])`. `SPRING.bouncy`
   (`curves.ts:28`, `damping:8`) rings further past 1.0.

### 1.2 Sampling also misses the peak

Keyframe offsets are `relMid` (50 %) / `relLate` (80 %) of the cue
(`manifest.ts:299-306`). Entrance peaks land ~10–20 frames after cue start. For
`read-fen-he-shi` (reconciled `[432, 598]`, **[measured]** via the timeline
import), the whole-card overshoot peak is **frame 450** (`wholeLandFrom = 432+10`,
peak at 60 % of a 14-frame window). The cue's manifest keyframes sit at
offset 84 (frame 516) and 134 (frame 566). **The peak is never sampled.**

### 1.3 Divergence numbers **[measured]** (`out/_spike/divergence.mjs`)

Migrating whole-card, big-diagram width 240, card 86.40 × 101.95 px, centre
(640, 184):

| frame | scale | rendered bbox vs manifest |
| --- | --- | --- |
| 442 | 0.70 | (entrance start) |
| **450** | **1.0600** | **+5.18 px wide, +6.11 px tall → +3.06 px each edge** |
| 456 | 1.00 | settled |

- **Manifest verdict:** static card clears a neighbour 2 px above → `collisions=0`.
- **Rendered at peak:** real overlap. **Thin mark (4 px): ratio 0.264 > 0.15 →
  FLIPS to collision** (manifest passed). Tall card (40 px): ratio 0.026 — a real
  but sub-threshold miss. So overshoot ALWAYS produces a missed overlap; whether
  it crosses the 0.15 flag depends on neighbour size (thin marks flip readily).
- **Missed-collision band:** any element within **~3.06 px** of an overshooting
  element's resting edge is undetectable by the linear manifest *at any
  threshold*.
- **`PopIn bouncy`** realized peak **1.0460 → 4.6 %** over-size on *every* bouncy
  entrance, lesson-agnostic.

### 1.4 The contact sheet does not catch this

`make-contact-sheet.mjs` / `lesson-contact-sheet.mjs` are **visual-only** — they
extract + label frames, no measurement. A 3 px overshoot is invisible to a human
scanning a 320 px-wide tile.

---

## 2. Chosen real-bbox architecture (and the rejected alternative)

### 2.1 Decision

Add a **measured pass** alongside (not replacing) the fast linear path. It renders
**motion-peak** frames (§3) and derives a TRUE bbox per load-bearing element by
one of two isolation methods, in preference order:

**Primary — `getBBox()` geometry hook.** Tag each load-bearing SVG group with a
stable `data-mid="<elementId>"`. During a normal SSR render of the peak frame, a
small injected script walks `document.querySelectorAll("[data-mid]")`, calls
`el.getBBox()` (SVG user-space, **transform-aware** → captures the 1.06 scale),
and `console.log`s `MEASURE_BBOX {id, bbox}`. The harness captures these via
`renderStill`'s **`onBrowserLog`** callback (confirmed in the Remotion SSR API).
No pixel scanning, no per-element re-render.

**Fallback — pixel content-trim within the manifest crop.** Where a scene has no
hook, render the peak frame once, crop the `manifest.bboxAt(frame)` rectangle +
margin, content-trim against the background colour with `sharp`. **[measured]**
(`out/_spike/measure-bbox.mjs`, `gates.mjs`): an isolated candy on cream trims to
a clean bbox in **~3 ms**; the whole-card crop at peak measured **96×114** vs
**92×106** at rest (the overshoot IS visible in pixels), but the crop is
**saturated by the sibling diagram lines + part-cards** so pixel-trim **cannot
isolate** the one card — confirming with rendered evidence why the `getBBox` hook
must be primary.

### 2.2 Rejected alternative — "solo-element" measurement composition

Render the scene once per element with only that element visible
(`inputProps.soloElementId`). Rejected because:

- **The scene takes no `inputProps` today.** `CompleteFenYuHeLesson`
  (`Root.tsx:124-129`) renders `<FenYuHeLessonScene/>` reading only
  `useCurrentFrame()`. Soloing needs every scene to thread a prop into every
  element's mount condition — invasive, per-lesson.
- **Cost is N×.** One render per element per peak frame, vs the hook's single
  render per peak frame for ALL elements.

### 2.3 The exact minimal scene/manifest hook required

1. **Scene (one line per load-bearing group):** add `data-mid="<elementId>"` to
   the outermost `<g>` of each registered element. In `FenYuHeLessonScene.tsx`:
   the migrating whole card's `<g>` (`:537`) → `data-mid="glyph-whole"`; each
   candy `<g>` (`:329`) → `data-mid={`candy-${i}`}`. **IDs must match
   `manifest.elements[].id`** (and the whole-card must be *added* to the manifest
   — it is missing today, §1.1).
2. **Measurement injector (shared, lesson-agnostic):** a `<MeasureProbe>` that,
   when `getInputProps().measure === true`, calls `delayRender()`, reads all
   `[data-mid]` bboxes, logs one `MEASURE_BBOX` line, then `continueRender()`.
   Wrapped around the scene root only under the flag — **zero effect on normal
   renders**.
3. **Manifest (contract unchanged):** the measured pass joins captured `getBBox`
   results to manifest elements **by id**.

Respects every hard rule: IDs derive from the manifest (→ `layout.ts`), the probe
is lesson-agnostic, and no frame literal is introduced (frames come from
`cues[id].startFrame + peakOffset`, §3).

---

## 3. Sampling strategy (peak-aware) that defeats easing overshoot

Linear keyframes at 50 %/80 % miss entrance peaks (§1.2). The measured pass
samples **motion-peak-aware** frames, all cue-relative:

For each cue, for each load-bearing element that **enters or transforms**:

1. **entrance peak** — `cues[id].startFrame + entranceDelay + round(0.6 ·
   springWindow)`. The 1.06 peak lands at ~60 % of the entrance window
   (**[measured-B]**: peak at frame 450 = start 432 + 10 + 0.57·14). A ±2-frame
   bracket covers spring ringing.
2. **settle frame** — `entrancePeak + springWindow` (cross-check the linear
   envelope is correct at rest).
3. **transform peaks** — for migrations/slides, the mid-transform frame where two
   elements pass closest.

Frame selection reads the motion config the scene already declares (`MOTION.*` in
`layout.ts`, `SPRING.*` in `curves.ts`). Default density: **~3 frames per entering
element**. The gate never hard-codes a frame; it computes peaks from `cues[]` +
the named motion config. This makes the very frame the linear envelope
under-estimates the frame we measure with truth.

---

## 4. Each added gate → failure mode → implementation

All gates are **advisory** (warn + record), never blocking, but a **silent skip is
forbidden** (CLAUDE.md): each gate runs and records a verdict, or records why it
was skipped. All write into `bbox-manifest.json` (schema §5).

| Gate | Real failure it catches | Tool / command | Threshold |
| --- | --- | --- | --- |
| **overlap-measured** | Overshoot/spring collisions the linear envelope misses (§1.3). | SSR `renderStill` peak frame + `onBrowserLog` `getBBox` (fallback `sharp` crop-trim). | overlap/minArea > **0.15** on the *measured* bboxes. |
| **contrast** | Text/marks failing WCAG legibility on cream. | `sharp` sample the element's glyph pixels + bg from its `data-mid` crop → WCAG ratio. **[measured]** navy ink (35,49,74) on cream (255,247,230) = **12.24:1** (`out/_spike/gates.mjs`) → this lesson passes; the gate computes a real ratio. | text ≥ **4.5:1**; large text / marks ≥ **3.0:1**. |
| **legibility (min-size)** | Glyphs too small for a 6yo after a shrink/migration (the column-compress that caused the caption fix). | measured bbox height of `labels`-zone glyphs from the same render. **[measured]** `sharp` content-trim returns a real px bbox per isolated element (Exp A). | rendered glyph height ≥ **~24 px** (the column's own target, `layout.ts` COLUMN comment). |
| **LUFS / true-peak** | Voice too quiet/loud or clipping. | `ffmpeg -i <wav> -af ebur128=peak=true -f null -` → parse `I:` / `True peak`. **[measured]** fen-yu-he = **-17.0 LUFS, true peak -1.6 dBFS, LRA 3.0**. | integrated **-16 ± 2 LUFS** (fen-yu-he -17.0 is ~1 LU under target → a real "slightly quiet" warn); true peak ≤ **-1.0 dBFS** (-1.6 passes, but only by 0.6 dB → near-clip note). |
| **motion-too-fast** | A move so fast it strobes for a 6yo. | `sharp` raw pixel-delta between rendered frames. **[measured]** 8-frame entrance pair = **2.51 % changed**; 150-frame cross-cue pair = **8.76 %** (Exp D3, `gates.mjs`) — clean separation. | per-frame Δ > calibrated %; flag a single-frame spike, not sustained motion. Ship last, behind a flag, after a baseline sweep across lessons. |
| **caption-redundancy** | Caption is the narration verbatim → clutter, no added value. | char-set Jaccard of `caption` vs `phrase` from the timing module (**zero render cost**). | Jaccard ≥ **0.9** → warn. **[measured]** ALL 9 fen-yu-he cues are **identical (jaccard 1.00)** — every caption is the narration verbatim minus punctuation. A real repo-wide finding the gate flags today. |
| **audio-breath** (already written + verified) | TTS ran two cues together with no breath at the boundary. `assertAudioBreaths()` (`lesson-manifest.mjs:82-98`) is dormant but its header records a VERIFIED real-data result: 7/8 boundaries had a breath; the boundary @954 had none. | wire `_manifest-extract.ts` to also emit `cues` + the `<id>Silences` array, then call the existing fn (the TODO at `lesson-manifest.mjs:73-77`). | boundary within **±6 frames** of a detected silence (`BREATH_TOLERANCE_FRAMES`). |

Quality notes for whoever implements: **contrast** must sample the element's own
pixels via its `data-mid` crop (a naïve "darkest pixel in region" grabs the wrong
mark). **motion-too-fast** is least-calibrated — collect baseline deltas across
existing lessons first.

---

## 5. How it extends `lesson:check` without breaking the fast path

`lesson:check` keeps its three current steps unchanged. The measured pass is a
**new fourth step, opt-in**:

```
npm run lesson:check -- --config <cfg>            # unchanged: linear manifest + sheets
npm run lesson:check -- --config <cfg> --measured # also runs the measured pass
```

- **Default (no flag):** byte-identical to today. Zero added cost. The linear
  manifest is the cheap pre-filter.
- **`--measured`:** after the linear pass, bundle once (`@remotion/bundler`),
  `selectComposition`, render the §3 peak frames, capture `getBBox`/trim pixels,
  run the non-bbox gates, and **augment** `bbox-manifest.json`.

### Output schema additions to `bbox-manifest.json`

Additive only — existing `keyFrames`, `summary.collisionCount/warningCount`
unchanged. New top-level `measured` block (absent when the flag is off, so older
readers are unaffected):

```jsonc
{
  "lesson": "...", "fps": 30, "keyFrames": [ /* unchanged */ ],
  "summary": { "collisionCount": 0, "warningCount": 0 /* unchanged */ },
  "measured": {
    "ranAt": "2026-05-29T...",
    "method": "getBBox" | "pixel-trim" | "skipped",
    "skippedReason": null,
    "framesSampled": [450, 456, 837],
    "perFrameMs": 700, "bundleMs": 6500,
    "elements": [
      { "id": "glyph-whole", "frame": 450,
        "manifestBbox": [596.8,133.02,86.4,101.95],
        "measuredBbox":  [594.21,129.97,91.58,108.06],
        "divergencePx": { "dWidth": 5.18, "dHeight": 6.11 } }
    ],
    "collisionsMeasured": [
      { "frame": 450, "a": "glyph-whole", "b": "read-arrow-fen", "ratio": 0.264 }
    ],
    "gates": {
      "contrast":   [ { "id": "intro-title", "ratio": 12.24, "pass": true } ],
      "legibility": [ { "id": "column-row-3", "glyphPx": 25.2, "pass": true } ],
      "lufs":       { "integrated": -17.0, "truePeak": -1.6, "lra": 3.0, "pass": false, "note": "1 LU under -16 target" },
      "motionFast": [ { "framePair": [442,450], "deltaPct": 2.51, "pass": true } ],
      "captionRedundancy": [ { "cueId": "split-into-two", "jaccard": 1.0, "pass": false } ],
      "audioBreath": [ { "cueId": "ordered-column-complete", "boundaryFrame": 954, "pass": false } ]
    }
  }
}
```

`summary` gains `measuredCollisionCount` and `gatesFailed` when the pass runs.
Advisory: non-zero counts print a warning and require a written justification in
the composer/verification response — they do not fail the build.

---

## 6. Per-wave time-budget table

Experiment E adds reversible per-step timing to `render-complete-lesson.mjs`
(wraps `run()` to record `Date.now()` elapsed into `stepTimings`, flushes
`lesson-data/<id>/_logs/render-timing.json` at end). **[measured]** A full
instrumented render of fen-yu-he (1202 frames) completed and wrote
`render-timing.json`; the MP4 + contact sheet were produced unchanged — the patch
is behavior-preserving. Values below are read from that file:

| Script step | Cost **[measured]** | Target | Lever |
| --- | --- | --- | --- |
| Silence detection | **0.44 s** | — | already trivial |
| Bundle (inside Render MP4) | 0.8 s warm (Exp C SSR) | reuse | reuse one `serveUrl` across check+render |
| **Render MP4** (1202 frames, concurrency 5x) | **17.9 s** | ~12 s | raise `--concurrency` |
| Contact sheet (45 ffmpeg extracts) | **7.8 s** | ~5 s | batch ffmpeg seeks |
| **script total (no voice/lint/build)** | **26.1 s** | — | |
| **+ measured pass (new)** | **[measured]** bundle 0.8 s + select 0.3 s + **~0.3 s/frame** | — | peak-aware sampling, shared bundle |

Note the MP4 render at concurrency 5x is **17.9 s** for 1202 frames (~15 ms/frame)
— Remotion's batched renderer is far faster than per-frame SSR `renderStill`
(~300 ms/frame). The measured pass therefore deliberately samples only **peak
frames** (§3), not a full re-render.

Measured-pass cost model **[measured]** (`out/_spike/ssr-timing.mjs`: `bundle()`
**789 ms** warm, `selectComposition` **259 ms**, `renderStill` steady-state
**~286–330 ms/frame** — markedly cheaper than the 0.7 s/frame first guessed):

- Peak-aware (~30–60 frames): **~1.1 s + 30–60 × 0.3 s ≈ 10–19 s** added.
- Naïve every-6-frames (~200 frames): **~60 s** — still rejected; peak-aware wins
  ~3× and stays well under a render.

All figures above are **[measured]** — the instrumented run completed and wrote
`render-timing.json` (total 26.1 s); the measured-pass per-frame cost is from
Exp C (SSR).

**Subagent thinking-waves** (pedagogy/storyboard/visual-design/audio/composer)
are **not** script steps and cannot be timed here — only the future `Workflow`
orchestrator can wrap them. The instrumentation comment says so explicitly.

### Top-3 throughput levers

1. **Share one bundle** across `lesson:check`, the measured pass, and
   `lesson:render` (save the second-biggest fixed cost on every extra call).
2. **Peak-aware sampling** over uniform (~3× fewer measured frames).
3. **Concurrency on the MP4 render** (the single largest cost).

---

## 7. Migration / rollout

**Ships first (no scene edits, no approval needed):**

1. **caption-redundancy + LUFS + audio-breath** — pure data/ffmpeg, zero render.
   Wire the already-written-and-verified `assertAudioBreaths` by extending
   `_manifest-extract.ts` to emit `cues` + silences (the TODO at
   `lesson-manifest.mjs:73-77`). Lowest risk, immediate value.
2. **Peak-aware keyframes in the existing linear path** — add entrance-peak
   offsets to `manifest.ts` keyFrames so even the cheap path stops sampling only
   50 %/80 %. Catches some overshoot with no render.

**Ships second (the measured pass):**

3. `--measured` flag: SSR bundle + peak-frame render + **pixel-trim fallback** (no
   scene hook required) → `measured.elements` + `collisionsMeasured` +
   `contrast`/`legibility`/`motionFast`.
4. Add the `data-mid` + `<MeasureProbe>` hook to the composer skill so new lessons
   emit it by default; backfill fen-yu-he as the reference. **Register the
   migrating whole-card in the manifest** (currently missing, §1.1).

**Structural changes needing user approval (CLAUDE.md / skills):**

- **CLAUDE.md "BBOX MANIFEST AS GROUND TRUTH" bullet** currently blesses the
  linear bbox as ground truth. New wording: linear manifest is a *fast
  pre-filter*; `--measured` is ground truth for overshoot/contrast/legibility.
- **`remotion-lesson-composer` skill:** require `data-mid` on every registered
  element + emit `<MeasureProbe>`; run `lesson:check --measured` before done.
- **`lesson-verification` skill:** read `measured.*` + the new gate verdicts.
- **`layout.ts:516-518` comment** is now wrong and must be corrected (ships with
  the impl, not structural).
- **New wave?** No. The measured pass lives inside the existing composer +
  verification waves; no reordering.

---

## 8. Instrumentation patch (Experiment E)

Additive, reversible, intended to lint clean (`eslint` + `tsc`) and be
behavior-preserving (MP4 + contact sheet still produced). Diff:

- Wrap the existing `run(label, command, args)` to record `Date.now()` elapsed
  into a module-level `stepTimings` array (stdio + exit behavior unchanged;
  recorded in a `finally` so a throwing step still logs).
- Add `flushTimings(lessonId)` writing `lesson-data/<id>/_logs/render-timing.json`
  + a per-step table.
- Call `flushTimings(args.lessonId)` once at the end of `main()`.

> Applied to `scripts/render-complete-lesson.mjs` during the spike. `node --check`
> **passes**. Direct `eslint scripts/render-complete-lesson.mjs` floods
> `no-undef` for `console`/`process` — but so does an **unmodified** sibling
> (`scripts/lesson-check.mjs`, 14 identical errors), because the project lint
> target is `eslint src && tsc` (`package.json`): **`scripts/*.mjs` are out of
> lint scope**, so the direct-lint flood is a config-scope artifact, not a defect
> in the patch. The patch matches the file's existing `console`/`process`/`fs`
> usage style. **[measured]** A full functional run completed and wrote
> `render-timing.json` (Silence 0.44 s, Render MP4 17.9 s, Contact sheet 7.8 s,
> total 26.1 s) with the MP4 + contact sheet unchanged — confirming the wrapper
> is behavior-preserving. The change is small, non-fatal on write failure, and
> safe to leave in.

---

## 9. Effort, risks, open questions

**Effort.**
- Phase-1 gates (caption/LUFS/breath + peak keyframes): ~0.5 day.
- Measured pass with pixel-trim fallback: ~1 day (SSR harness, frame picker,
  schema, sharp trim — spike pieces in `out/_spike/`).
- `data-mid`/`MeasureProbe` + composer-skill update + fen-yu-he backfill: ~0.5–1 day.

**Risks.**
- **Pixel-trim can't isolate overlapping siblings.** The `getBBox` hook removes
  this; until a lesson has the hook, measured collision for overlap-heavy regions
  is *advisory-only* and must say so.
- **Threshold calibration** for motion-too-fast and contrast-on-glyph needs a
  baseline sweep across existing lessons.
- **Cost creep** if sampling density grows — peak-aware + shared bundle are the
  guardrails; cap measured frames per lesson (e.g. ≤ 60).
- **getBBox under SSR** returns SVG user-space coords; map to composition px (the
  fen-yu-he viewBox is 1:1 with composition size; a root transform would need
  accounting).

**Open questions.**
1. Block vs advisory: should a measured collision ever *fail* a render, or always
   stay advisory-with-justification (current CLAUDE.md stance)?
2. Where do non-bbox thresholds live — per-style in `theme.ts`, or a single
   `verification-config.json`?
3. Should the measured pass reuse the **MP4** (ffmpeg-extract peak frames, like
   the contact sheet) instead of SSR `renderStill`? Cheaper when the MP4 exists,
   but loses the `getBBox` hook (pixels only). Likely: SSR for `--measured`
   standalone; ffmpeg-extract as a post-render fast mode.

---

## Appendix — spike status & captured stdout

**Exp B — divergence [measured]** (`out/_spike/divergence.mjs`):
```
PEAK scale 1.0600 @ frame 450 | Δwidth 5.18px Δheight 6.11px (≈3.06px/edge)
[thin mark 4px]  manifest collisions=0 -> rendered ratio 0.264 > 0.15 -> FLIPS to collision
[tall card 40px] manifest collisions=0 -> rendered ratio 0.026 (real miss, sub-threshold)
flip persists for any resting gap <= 2.36px (all clean manifest passes)
PopIn bouncy realized peak scale 1.0460 -> 4.6% over-size every bouncy entrance
reconciled read-fen-he-shi = [432,598]; overshoot peak 450 sits BETWEEN manifest keyframes 516 & 566
```

**Exp C — SSR cost [measured]** (`out/_spike/ssr-timing.mjs`):
```
SSR_RESULT {"bundleMs":789,"selectMs":259,"perFrameMs":[532,304,375,285,319,393,303],"steadyAvgMs":330}
(a second run: bundleMs 2090 cold, steadyAvg 286) — 7 frames rendered to PNG, all valid.
```

**Exp A — TRUE bbox via sharp content-trim [measured]** (`out/_spike/measure-bbox.mjs`,
`gates.mjs`):
```
candy@190 (isolated, on cream) -> trimmed bbox [595,360,90,100], ~3ms measure  [pixel-trim WORKS]
wholecard region @450 -> trimmed [592,127,96,114]  vs  @456 rest [594,131,92,106]
  (overshoot visible: peak crop wider+taller) BUT crop saturated by sibling diagram
  lines/cards -> pixel-trim CANNOT isolate the single card -> getBBox hook required
```

**Exp D1 — LUFS [measured]** (ffmpeg ebur128 on `public/audio/fen-yu-he-voice.wav`):
```
Integrated I: -17.0 LUFS | LRA 3.0 LU | True peak -1.6 dBFS
```

**Exp D4 — caption redundancy [measured]** (`out/_spike/redundancy.mjs`):
```
all 9 cues: identical=true jaccard=1.00 (every caption == narration minus punctuation)
```

**Exp D2 — WCAG contrast [measured]** (`out/_spike/gates.mjs`):
```
navy ink (35,49,74) on cream (255,247,230) -> contrastRatio 12.24 (passes AA-normal 4.5)
```

**Exp D3 — motion pixel-delta [measured]** (`out/_spike/gates.mjs`):
```
entrance 442->450 (8f): {pctChanged:2.51, meanDelta:2.12}
cross-cue 700->850:     {pctChanged:8.76, meanDelta:9.54}
```

**Exp E — instrumentation [measured]** (`lesson-data/fen-yu-he/_logs/render-timing.json`):
```
{ totalMs: 26121, steps: [ Silence detection 439ms, Render MP4 17907ms, Contact sheet 7775ms ] }
MP4 + contact sheet produced unchanged -> the wrapper is behavior-preserving.
```

Environment [measured]: ffmpeg 8.0.1, node v24.1.0, remotion 4.0.462, sharp
0.34.5, tsx 4.22.x — all present (`ffmpeg -version`, `node --version` ran clean).

---

## Implementation result (2026-05-29) — honest reconciliation

Built and wired into `fen-yu-he`. What shipped: `src/lessons/_measure/measureHook.ts`
(`measureProps`/`useMeasureHook`), `scripts/lesson-measured.mjs` (+`_measured-extract.ts`),
`lesson-check.mjs --measured`, scene tagged + manifest now registers `glyph-whole`.
`npm run lint` exits 0; the fast path is byte-identical (writes the same
`summary.collisionCount`, no `measured` key); `--measured` augments cleanly and exits 0.

**Verified TRUE:**
- **Measurement correctness.** `glyph-whole` @frame 450 measured **+5.18px W × +6.11px H**
  vs the linear manifest — matches §1.3's analytical prediction to the decimal. The hook
  captures real overshoot geometry via `getBBox` + `getScreenCTM` (182 element-snapshots,
  ~258ms/frame, 0.9–1.9s bundle). 54 peak frames sampled.
- **Cheap gates catch real issues.** LUFS −17.0 (1 LU under target), caption-redundancy
  9/9 verbatim — both real repo-wide findings. contrast/legibility PASS, motion WARN-only.

**Softer than §0 implied — the "flip" on THIS lesson:**
- Linear path reports 3 collisions (incl. @709); measured reports 2 (@668, @709).
- **@709 is shared** (it's a linear keyframe) — not a flip.
- **@668 is measured-only** (between the 11 linear keyframes — the real "between-keyframe
  miss" class), but the rendered `measured-frames/f668.png` shows the whole-number "5" card
  stacked above its fen-he column — a by-design vertical adjacency, not an obvious visual bug.
- So the gate's value is proven as a **capability** (it measures overshoot exactly and
  surfaces an overlap the sparse linear sampler structurally cannot see) but on fen-yu-he it
  did **not** expose a brand-new *visual* bug; the flags are the `objects:labels` apex-stack.

**Follow-ups opened:**
1. **Zone-modeling decision:** should `objects:labels` apex-stacking (whole-card sitting on
   its diagram/column) be an allowed-overlap pair, or is the 0.971 a real crowding bug? Needs
   a visual ruling, then either add to `ALLOWED_OVERLAPS` or fix the layout.
2. **Manifest mis-models animated size:** `column-row-0` @668 manifest claims 125×93 but
   renders as a 46×6 sliver (mid-draw). The measured pass is right; the manifest `bboxAt`
   doesn't model draw-on progress. Low priority (measured path corrects it) but worth noting.
3. Backfill `measureProps` to the other 6 lessons; add the `data-mid`↔manifest-id lint rule.
4. Wire the dormant `assertAudioBreaths()` (proposal §7 phase-1).
