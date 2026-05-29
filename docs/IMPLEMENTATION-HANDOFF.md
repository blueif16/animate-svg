# Implementation handoff — automated Remotion kids'-lesson pipeline

**Audience.** A future implementation session (you). This is the single consolidated, build-ready handoff. The headline is the **music & sound layer** (§2) — it is the missing production layer and is ready to implement today.

**System.** Early-childhood (preschool / K-3, Mandarin) math & literacy lessons in Remotion (1280×720 @ 30fps, all-SVG). Voice = Gemini Aoede TTS + sherpa-onnx ASR. **The cue is the unit of timeline coordination**: `cueFrames = max(narrationFrames, visualMotionFrames) + tail`, every frame derived from `cues[id].startFrame + offset` — never an absolute literal. See `docs/pipeline-architecture.md` for the timeline architecture and `CLAUDE.md` for the wave order and hard rules.

**Honesty marker.** Throughout, **[VERIFIED]** = grounded in a file/line or a cross-checked source; **[ASSUMED]** = synthesis or a starting number that needs a measurement pass. The music spec's numbers are sourced (8 cross-checked sources, see `research/music-sound-design.md`) but their *fit to our exact mix* is [ASSUMED] until the first lesson is measured with `ffmpeg loudnorm`.

---

## Table of contents

1. [Re-prioritization & sequencing — "artisanal → industrial"](#1-re-prioritization--sequencing)
2. [MUSIC & SOUND LAYER — READY TO IMPLEMENT](#2-music--sound-layer--ready-to-implement)  ← the headline
3. [Build proposals — the 3 Tier-1 builds](#3-build-proposals)
4. [Pedagogy quick-wins — signaling + keyword captions (approved) + backlog](#4-pedagogy-quick-wins)
5. [Primitive coverage-map stub](#5-primitive-coverage-map-stub)
6. [Research corpus index — yt-rag namespaces + top links per theme](#6-research-corpus-index)

---

## 1. Re-prioritization & sequencing

**The diagnosis: artisanal → industrial.** The pipeline produces good single lessons by hand but cannot scale. Three structural facts force the re-prioritization: (a) the "self-contained Workflow" promised in `CLAUDE.md` does not exist — waves are hand-spawned and human-gated [VERIFIED: no workflow script in repo, `workflow-and-composer-codegen.md` Problem #1]; (b) Wave 4 composer is hand-authored JSX and is the ~3h dominant cost, ~70% of which is mechanical boilerplate [VERIFIED: 239/283/265-line shipped scenes, codegen proposal §4.4]; (c) primitive creation is serial, lesson-bound, and has no automated quality gate [VERIFIED: primitive-factory proposal Problem #1–4]. The throughput goal ("thousands of lessons, longer videos, own our assets") is gated on turning judgement-heavy hand-work into deterministic code with machine gates. Music/sound is the one *production-polish* lever that is orthogonal to throughput and ready to build now — so it runs as a parallel track, not behind the industrialization.

**Tier-1 build #1 — Machine-gated verification (do FIRST).** Everything else's ROI depends on being able to *trust output without a human eyeballing it*. Codegen, the Workflow, and the primitive factory all assume an automated gate exists (the factory's gate explicitly imports the machine-verification check modules — `primitive-factory.md` structural-change #6). Build the deterministic checks first: measured bbox (Puppeteer `getBBox`), contrast, min-dimension/legibility, theme-token purity, and golden-frame pixel-diff regression. This converts "is it correct?" from a review cycle into a CI signal, which is the precondition for unattended scale. **Status of its proposal: see §3 — the dedicated proposal file was not on disk this session; treat that as the first thing to author or locate.**

**Tier-1 build #2 — Real Workflow + composer codegen (do SECOND).** Once output is machine-gradeable, remove the dominant wall-clock cost. Ship the self-contained `run-lesson-workflow.mjs` driver (DAG of nodes with barriers/pipeline stages), make the two "orchestrator-owned" human steps (Wave 0 pedagogy spawn, Wave 3.5 reconcile) into real nodes, and — the biggest single lever — `codegen-scene.mjs` that emits the mechanical ~70% of `LessonScene.tsx` + `manifest.ts` + `layout.ts` with creative `// <<slot:*>>` regions for the composer to fill. This *mechanically enforces* zero-frame-literals (frames only come from generated `cueFrames(id)`) and scene/manifest constant-coherence. Expected composer wall-clock: ~3.0h → ~0.9h [ASSUMED: codegen proposal §4.4 estimate]. Plus prompt caching (cost), voice batching/parallel-lesson queue (fleet throughput), and per-node wall-clock instrumentation (so "composer is the cost" stops being folklore).

**Tier-1 build #3 — Primitive factory (do THIRD).** With gates and the Workflow in place, scale the asset library. A standalone batch Workflow builds N verified primitives from typed specs *without a host lesson*, registers them write-safely (`_registry.json` as source of truth, `CAPABILITIES.md` generated, single locked serial registration stage), certifies each through the §3.1 deterministic gate + an adversarial visual critic + a committed golden frame, and is driven by a `coverage-map.json` demand backlog (build when ≥2 lessons need it OR the concept is curriculum-`spine`). This is what makes "own our assets" and "longer videos" (more distinct visuals/min) real at scale.

**Parallel track — Music & sound (build anytime; see §2).** No dependency on the three Tier-1 builds. It hooks the existing `LessonAudioLayer` and the reconciled cue timeline. It is the most concrete, lowest-risk, highest-perceived-quality win, and it is fully specced below. Recommended to interleave it with build #1 so the first machine-gated lessons also ship with sound.

---

## 2. MUSIC & SOUND LAYER — READY TO IMPLEMENT

> The headline. Every number here is pulled from `research/music-sound-design.md` (8 cross-checked sources) and made buildable for our cue-coordinated, deterministic-render system. The pedagogy brief (`research/pedagogy-engagement.md` F10) adds the hard constraint that **music must be fully ducked/zero whenever a narration WAV is playing** — for our 3–8yo second-language audience we sit the bed at the *quiet* end and treat "melody identifiable under narration" as a verification failure.

### 2.0 What exists today [VERIFIED]
- `src/lesson-media/LessonAudioLayer.tsx` is a thin wrapper that *exposes* `bgmSrc / bgmVolume / duckedBgmVolume / voiceoverSpans` props from `@studio/narration-kit` — but **no lesson wires music in, and there is no SFX path at all.**
- Open item **O1** (must resolve first): does `@studio/narration-kit`'s `AudioLayer` already build a duck envelope, and with what numbers? Confirm it (a) uses a frame-keyed envelope (deterministic) NOT a runtime compressor, (b) honors the §2.2 numbers and -16 LUFS, (c) accepts an SFX list. If not, building that envelope is the first task.

### 2.1 The mix numbers (put these straight in)
Source: cross-validated across ~8 sources (Song Creator Pro citing Frontiers 2025 + Behavioral Sciences 2025; audio-mixing-patterns; vidpros; VidNo; TonnSDK; Pure Audio Insight; omegafilminstitute; ffmpeg-cookbook). Add a lesson-agnostic constant module `src/lesson-media/audioMix.ts`:

```
MASTER            target -16 LUFS, true-peak ceiling -1 dBTP        (multi-platform, not YouTube-only)
NARRATION         reference level; peak -12..-6 dB; pre-compress 3:1, attack 5ms, release 80ms
BED (un-ducked)   -18 dBFS   (~0.12–0.15 linear)   // narration gaps / intro / outro / boundary beats
BED (ducked)      -32 dBFS   (~0.03–0.04 linear)   // under narration (e-learning = quiet; kids second-language)
DUCK depth        ~ -14 dB   (between Medium -12 and Heavy -20; narration IS the lesson)
DUCK ramp         attack 10 frames (0.33s) down, release 15 frames (0.5s) up   // frame-keyed
SFX               peak -18..-20 dB (below narration, ~0.3–0.5 linear); WAV files; SFX do NOT duck
BED fade          0.75s fade-in at lesson start, 0.75s fade-out at end (~22 frames @30fps)
BED EQ            pre-baked -4 dB shelf-cut across 800–3000 Hz (author-time, once per bed — carves room for voice)
```

Music-selection contract (encode as a style/brief constant, NOT a per-lesson choice): `bed = { bpmRange:[60,80], key:"major", vocals:false, harmony:"simple", dynamics:"flat", instrumentation:"soft piano + warm pads / mallet" }`. For dense-math cues, drop the bed lower (use the ducked level) — never change the track. [VERIFIED: music-sound F1/F2/F3]

### 2.2 Deterministic ducking KEYED TO CUE NARRATION WINDOWS
**Do ducking with a frame-keyed Remotion `<Audio volume={fn(frame)}>` envelope, NOT a realtime sidechain compressor.** We already know every speech window before render — so we *schedule* the duck instead of *detecting* speech. This is reproducible across re-renders (a live sidechain is not), and reads the same cue boundaries as visuals and captions. The `ffmpeg sidechaincompress` numbers are kept only as the perceptual target the envelope imitates. [VERIFIED: music-sound F4 + the Remotion `<Audio volume={interpolate()}>` pattern from the video-audio-design skill]

We coordinate by cue. Each cue exposes a narration window. The richest source is per-cue `narrationStartFrame`/`narrationEndFrame` (from ASR; today the cue carries `startFrame`/`endFrame`, and Wave 3a's aligned cues carry per-cue narration spans / `voiceoverSpans`). The envelope ducks once per narration window:

```ts
// src/lesson-media/audioMix.ts  (lesson-agnostic)
// DUCK_FACTOR ≈ 0.2  (-14 dB).  attack 10f, release 15f.
function bedVolume(frame: number, windows: { nStart: number; nEnd: number }[], total: number): number {
  // start at the un-ducked linear level, multiply down through every narration window
  let v = BED_UNDUCKED_LINEAR; // ~0.13
  for (const { nStart, nEnd } of windows) {
    v *= interpolate(
      frame,
      [nStart - 10, nStart, nEnd, nEnd + 15],   // 10f attack down, 15f release up
      [1, DUCK_FACTOR, DUCK_FACTOR, 1],          // DUCK_FACTOR ≈ 0.2
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }
  // lesson-edge fade (0.75s = 22f @30fps)
  v *= interpolate(frame, [0, 22, total - 22, total], [0, 1, 1, 0],
                   { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return v;
}
```

Every input is a known frame number → deterministic. ZERO frame literals in scene code — `nStart`/`nEnd` come from `cues[id]` / the ASR spans; `total` from the reconciled timeline. The product-over-windows form means overlapping or back-to-back windows compose correctly and the bed only ever rises in the *gaps* between narration. [VERIFIED: music-sound Spec 2]

**Hard pedagogy guard:** on every frame where a narration WAV is active, the bed must be at the ducked level (or 0). Make this a verification check, not just a hope (§2.6, pedagogy F10).

### 2.3 Per-section bed structure (intro sting / section beds / outro resolve)
Music sits in three structural roles keyed to cue boundaries, never one flat bed. [VERIFIED: music-sound F5/Spec 3]

- **Intro sting** — `<Sequence from={cues.intro.startFrame}>` wrapping a one-shot sting WAV at full level over the `TopicIntroCard`; the bed fades in underneath *after* the sting tail.
- **Per-section bed** — one bed `<Audio>` spanning the section's first cue `startFrame` to its last cue `endFrame`, ducked per §2.2. Generate/pad beds to the *actual reconciled lesson length* (Wave 3.5 already computes total frames) so they NEVER loop — "audible loops are distracting."
- **Outro resolve** — the bed envelope rises from ducked back to un-ducked starting at `cues.<last>.endFrame − <frames of last narration>`, so the final chord lands as the last narration ends; then the 0.75s edge fade-out.

All anchored to `cues[id].startFrame/endFrame`. Never absolute master-timeline literals (matches the existing discipline rule).

### 2.4 SFX vocabulary mapped to OUR motion events
Define a lesson-agnostic SFX registry `src/lesson-media/sfx.ts` + a `CAPABILITIES.md` entry. The composer emits one one-shot `<Sequence from={cues[id].startFrame + offset}><Audio src=… volume=…/></Sequence>` per *motivated* event — the SAME cue-relative math it already uses for visuals, so this is a Wave 4 add with zero new timing model. [VERIFIED: music-sound Spec 4]

| Motion event (existing primitive) | SFX | Trigger | Notes |
|---|---|---|---|
| `<PopIn>` entrance (snap/bouncy) | soft **pop** | at the PopIn's `startFrame` | 1 per object; for a counted set, stagger by the same frames as the visual `<Drag>` stagger |
| `<Sparkle>` / `<GlintFlash>` / `<GlowPulse>` | light **chime / shimmer** | at FX onset | reward / attention; keep quiet |
| section/scene change, `<ShineSweep>`, `SectionHandoff` | **whoosh** | at transition `startFrame` | one per transition |
| count step (each counted item) | short **tick** (optional rising pitch per step) | per step frame | cap density; never one-per-frame |
| correct / complete beat (lesson resolve, "make 10" success) | **ta-da** | at success cue `startFrame + small offset` | once per lesson — the only "big" SFX |

Rules: **max 1 motivated SFX per beat**; SFX assets are WAV (MP3 can add silent padding); SFX peak ≤ -18 dB; SFX do NOT duck (they sit above the bed, below narration); never one-per-frame. The "1 SFX per beat" cap for K-3 is [ASSUMED] (music-sound O4) — validate against a real lesson + the action-aware contact sheet.

### 2.5 Config shape + where it hooks
Per-lesson config lives in a new `lesson-data/<id>/audio-cues.json` (authored input, version-controlled), consumed by the composer + audio layer. Keep `pipeline.json` mechanical (paths only); the *creative* audio choices go in `audio-cues.json`. Shape:

```jsonc
{
  "lessonId": "kp4-make-ten",
  "bed": "math-calm-70-cmaj",          // key into public/audio/_beds/<name>.wav
  "intro": { "sting": "soft-rise" },   // public/audio/_stings/<name>.wav, over cues.intro
  "outro": { "resolve": true },        // bed rises to full as last narration ends
  "sfx": [                              // each one-shot, cue-relative
    { "cue": "introTitle", "event": "popin", "sound": "pop",   "offset": 0 },
    { "cue": "countTo10",  "event": "count", "sound": "tick",  "perStep": true, "risingPitch": true },
    { "cue": "success",    "event": "reward","sound": "ta-da", "offset": 6 }
  ]
}
```

Hook points:
- **`src/lesson-media/audioMix.ts`** [NEW] — the §2.1 constants + the §2.2 `bedVolume()` envelope. Lesson-agnostic.
- **`src/lesson-media/sfx.ts`** [NEW] — the SFX registry (name → WAV path + default volume) and a `<LessonSfxLayer cues sfx>` that maps `audio-cues.json` rows to one-shot Sequences.
- **`src/lesson-media/LessonAudioLayer.tsx`** [EDIT] — wire `bgmSrc` from `audio-cues.json.bed`, drive `bgmVolume`/`duckedBgmVolume` from §2.1, pass cue narration windows so it builds the §2.2 envelope; render `<LessonSfxLayer>` alongside.
- **Timeline** — `bedVolume()` reads the reconciled `<X>Cues` timeline + ASR narration spans. SFX read `cues[id].startFrame + offset`.
- **Render** — no change to the render command; beds/SFX/stings are local WAVs in `public/audio/_beds|_sfx|_stings/`, so the render stays deterministic and offline. Generation tools (Suno / ElevenLabs Music / Mubert for beds+stings; YouTube Audio Library / freesound CC0 for SFX) are **author-time only**, never per-render.
- **Master loudness** (open item O2): Remotion does not run `loudnorm`. Pick bed levels so the sum lands ≈ -16 LUFS, then add a post-render `ffmpeg loudnorm` second pass as a render step (deterministic, just a second pass). Confirm before fleet rollout.

### 2.6 Verification additions (Wave 6) [VERIFIED: music-sound Spec 5]
Add to the verification checklist: (a) **melody NOT identifiable under narration** → else fail; (b) the **3-point check** — intro ducks cleanly when the first words start, music rises in a mid gap then ducks again, outro resolves at full as the last narration ends; (c) measured master ≈ -16 LUFS / TP ≤ -1 dB (run an `ffmpeg loudnorm` print pass on the rendered MP4 audio); (d) no SFX louder than narration.

### 2.7 Asset factory & licensing (author-time, NOT per-render)
Build a tiny curated, **pre-cleared** library reused across the whole catalog (5–8 beds is fine — brand consistency at K-3): `public/audio/_beds/<name>.wav` (e.g. math-calm 70 BPM C-major, literacy-playful 76 BPM, celebration), `public/audio/_sfx/<name>.wav` (pop, chime, whoosh, tick, ta-da), `public/audio/_stings/<name>.wav`. Author each bed once to §2.1 (EQ-carved, fade-safe, length ≥ longest expected section via generation or `aloop`+`apad`). **Licensing caution for child / monetized content (open item O3):** before adding any generated or library track, verify commercial-use + redistribution terms AND that the provider permits use in monetized children's media; store a license file per asset (`public/audio/_beds/<name>.license.txt`). Not cleared this session — must be cleared per-asset before the library ships.

### 2.8 Minimal worked example — a 3-cue lesson
Lesson `demo` with reconciled cues (frames @30fps): `intro` 0–90, `count` 90–300, `success` 300–420 (total 420). ASR narration windows: intro 8–80, count 100–280, success 310–400.

- **Bed** `math-calm-70-cmaj` plays as one `<Audio>` from frame 0 to 420 with `volume={bedVolume(frame, [{8,80},{100,280},{310,400}], 420)}`:
  - 0→8: fades in (edge fade) toward 0.13 un-ducked.
  - 8→80: ducked to ~0.026 (×0.2) under intro narration; ramps 10f down at 8, 15f up after 80.
  - 80→100: rises to 0.13 in the gap (breathes up).
  - 100→280: ducked under counting narration.
  - 280→310: rises in the gap.
  - 310→400: ducked under success narration; then **outro resolve** — rises to full ~0.13 as the last word ends.
  - 398→420: 0.75s edge fade-out to 0.
- **Intro sting** `soft-rise` one-shot at `cues.intro.startFrame` (0), full level over `TopicIntroCard`; bed fades in beneath after the sting tail.
- **SFX:** `pop` at `cues.count.startFrame + popInOffset` for each counted dot's `<PopIn>` (staggered with the visual `<Drag>`); a rising-pitch `tick` per count step; one `ta-da` at `cues.success.startFrame + 6`.
- **Result:** music present and warm in the three gaps, inaudible-as-melody under all three narration lines, SFX punctuating the count and the win, master normalized to -16 LUFS / -1 dBTP. Fully deterministic — re-render is byte-stable.

---

## 3. Build proposals

| # | Build | Summary | File |
|---|---|---|---|
| 1 | **Machine-gated verification** | Deterministic, blocking quality checks on rendered output (measured bbox via Puppeteer `getBBox`, contrast ≥4.5:1 text / ≥3:1 shape, min focal dim ≥80px / min stroke ≥3px, theme-token purity, golden-frame pixel-diff regression). Converts "is it correct?" from a human review cycle into a CI signal — the precondition every other build assumes. The primitive factory's gate imports these check modules. | **NOT ON DISK this session.** Expected at `docs/proposals/machine-gated-verification.md` (another agent may be authoring it concurrently). Referenced by `primitive-factory.md:5,12,16-26,30,32-34` and structural-change #6. **ACTION:** locate or author it; it is Tier-1 #1. |
| 2 | **Real Workflow + composer codegen** | Make the pipeline a single self-contained `run-lesson-workflow.mjs` (DAG of barrier/pipeline nodes); turn the two human "orchestrator-owned" steps (Wave 0 spawn, Wave 3.5 reconcile) into code; `codegen-scene.mjs` emits ~70% mechanical `LessonScene.tsx`+`manifest.ts`+`layout.ts` with `// <<slot:*>>` creative regions (mechanically enforces zero-frame-literals + scene/manifest coherence). Plus prompt caching, voice batching + parallel-lesson queue, per-node wall-clock instrumentation. Composer ~3.0h→~0.9h [ASSUMED]. ~7.5–8.5 dev-days, ships incrementally. | `docs/proposals/workflow-and-composer-codegen.md` [VERIFIED on disk] |
| 3 | **Primitive factory** | Standalone batch Workflow that builds N verified primitives from typed `specs/primitives/<id>.spec.json` *without a host lesson*; write-safe registration (`_registry.json` source of truth, `CAPABILITIES.md` generated, single locked serial stage); deterministic gate + adversarial visual critic (fixed cited rubric) + committed golden frame; demand-gated by `coverage-map.json` (build when ≥2 lessons need it OR concept is `spine`). ~7–9 dev-days. Should land after/with build #1 so it imports the gate's check modules. | `docs/proposals/primitive-factory.md` [VERIFIED on disk] |

---

## 4. Pedagogy quick-wins

Grounded in `research/pedagogy-engagement.md` (Mayer CTML + toddler/preschool adaptation). Two are **approved by the user** and specced here for immediate build; the rest are a prioritized backlog.

### APPROVED #1 — Mandatory signaling (one synchronized cue on the focal element)
**Why:** signaling is especially powerful for young / low-prior-knowledge learners (the eye lacks domain knowledge to self-allocate); motion onset is itself an exogenous cue (d=0.41, larger for our audience). [VERIFIED: pedagogy F3]
**Spec:**
- Every cue gets a `signalFrame: number` (add to `CueTiming` in `src/lessons/timingTypes.ts`), set in Wave 3a from the ASR onset of the cue's focal noun (depends on word-level ASR — see `research/word-level-asr-design-2026-05-29.md`).
- Composer rule (machine-checkable): the focal object's entrance/highlight must fire within **±6 frames (±0.2s @30fps)** of `signalFrame`. Add to `lesson:check`: `|actualFocalEntranceFrame − signalFrame| ≤ 6` or fail.
- **Exactly ONE active signal per cue**, on for the duration of the spoken reference, removed after. Cheapest valid implementation needs no new primitive: fire the focal element's `<PopIn>` entrance on `signalFrame` (motion onset = the cue). For a non-entrance highlight, the kit ALREADY exports `PointerHandArrow` and `SelectionRing` (shape-primitives) [VERIFIED] — a deictic pointer and a ring/highlight; the gap is keying them to `signalFrame` + bbox, not building from scratch. Wave 3 gap-scan only needs to standardize a `<Pointer onFrame={signalFrame} targetBboxAt={...} holdFrames={...}>` wrapper around the existing `PointerHandArrow`. Lint: ≤1 active signal/cue.

### APPROVED #2 — Keyword captions (kill the transcript band — redundancy fix)
**Why:** our `LessonCaptionLayer` renders the FULL spoken sentence as on-screen text. For pre-readers that text is pure extraneous load (can't be decoded, competes for the visual channel) — redundancy d=0.86, amplified for children: it *depresses* learning. Highest-value single change in the brief. [VERIFIED: pedagogy F1, `LessonCaptionLayer.tsx:32` renders `active.captionText` = full narration]
**Spec:**
- Rewrite `src/lesson-media/LessonCaptionLayer.tsx`: stop rendering the full-sentence band. Render only a short **label** positioned at the focal object's bbox center (use the manifest `bboxAt(frame)`), riding on the object at the moment it's named (spatial contiguity d=1.10, temporal d=1.22 — the two largest extraneous-load effects).
- Change `CaptionCue.captionText` semantics from a sentence to a LABEL (≤4 Han chars / 1 token). Allowed exceptions: the topic-intro title text (pretraining, read aloud).
- Add a lint rule to `lesson:check`: fail if any non-intro `captionText` is > 1 word/token.
- **Open question to settle before shipping** (pedagogy O1): parent co-viewer caption track — ship an off-by-default parent-mode full-caption track, or none? Decide audience-of-record first.

### Backlog — other high-value Mayer-principle pipeline rules (ranked)
From `research/pedagogy-engagement.md` specs 2–12. Each is a checkable rule, not a vibe.

1. **Typed boundary beat (segmenting, d=0.79).** Replace the fixed `tail ≤ 9f` with `boundaryFrames` of 15–45f (0.5–1.5s) of HELD STILLNESS (narration silent, zero new elements, motion damped) set by Wave 3.5. The lever for *longer* videos: length = more short re-hooking segments, not longer demands. (Note: reconcile with `ai-coordinated-voice-and-visual` rule #6 — "no frozen frame" — the boundary is a *moving hold* via `<Breathe>`, not a freeze.)
2. **Segment-length guard.** Wave 3.5 check: no cue's `max(narration,motion)` > 600f (20s) without an internal sub-boundary; long lessons (>3min) alternate MODE (demonstrate/prompt/recap) every ≤5 cues and insert a low-stimulation `recovery` cue after any high-density cue.
3. **`prompt` cue type + `waitBeatFrames` (generative activity — the Ms Rachel mechanic).** New cue type: one concrete spoken question, then a 90–120f (3–4s) silent held wait-beat (visual frozen), resolved by a following answer cue. `waitBeatFrames` is silent BY DESIGN — Wave 3a must NOT "fix" it as an ASR gap. ≥1 prompt cue per ~60–90s. Personalization: 2nd-person voice ("我们一起数" / "let's count").
4. **Pretraining gate (concrete-before-symbol, d=0.85).** Wave 0 check: the first cue showing any symbol (numeral/+/=) must come AFTER every concrete object it references appeared AND was named earlier. The mandatory text intro must name+show each key concrete object before symbols.
5. **Positivity beat per discovery (child-specific principle).** Each pedagogy.md discovery gets a warm-prosody acknowledgement + one restrained `<Sparkle>`/`<GlowPulse>` at the discovery frame. Lint a banned time-pressure phrase list ("quickly/hurry/fast"). Warm tone in the `voice` block.
6. **Coherence / one-new-element check.** Per cue, count manifest elements entering; FAIL if >1 NEW element enters the same frame window. Old elements EXIT before the next concept (no frame-accumulating clutter). Side benefit: fewer false-positive collisions.
7. **Pacing guards (Goldilocks + anti-hyper-cut).** Flag any cue <90f (3s) as hyper-cut; flag any run of >3 consecutive same-density cues as monotony; each reveal cue establishes a familiar frame in the prior cue (`surpriseAgainst: <cueId>`).
8. **Comprehension-check artifact (formative assessment + scale).** New generated `lesson-data/<id>/comprehension-checks.json` from pedagogy.md discoveries: one concrete pointable question per ~60–90s, with an early forward-reference signpost and a positive reveal. Reusable generator = a scaling lever.

---

## 5. Primitive coverage-map stub

The table shape for `docs/coverage-map.{md,json}` (curriculum concept → primitives needed → have/lack). `have`/`lack` are computed mechanically by joining `primitivesNeeded` against the registry, so the map can't drift. `demand` is appended by per-lesson gap-scan. Build when `demand.length ≥ 2` OR `spine:true`. Seeded below with what exists today — the kit ships roughly **42 reusable components** across shape / motion / FX / lesson-media (the figure the primitive-factory proposal works against; the verified registry entries + barrel exports below back it).

**What exists today (the `have` column seed), grouped:**
- **Shape primitives** (`src/shape-primitives/`): counting (`counting.tsx` incl. `<FenHeDiagram>` + `getFenHeDiagramAnchors`), literacy (`literacy.tsx`), interaction (`interaction.tsx`), sketch (`sketch.tsx` incl. `<TeacherMark>` with `boil`/`settle`), shared (`shared.tsx`). [VERIFIED dir listing]
- **Motion primitives** (`src/motion-primitives/`): `curves.ts` (`EASE.*`, `SPRING.*`), `<PopIn>` (snap/bouncy/settle), `<Drag>`, `<Smear>`, `<DrawPath>`, `<FollowPath>`, `<PulseCircle>`, `<SparkleBurst>`, `pathMath`. [VERIFIED dir listing]
- **FX** (`src/fx/`): `<FXDefs>`, `<Sparkle>`, `<ShineSweep>`, `<GlintFlash>`, `<GlowPulse>`, `<Breathe>`. [VERIFIED: CAPABILITIES.md `magic-fx-library`]
- **Style** (`src/styles/ink-wash/`): `<StylePreset>`, `<InkWashDefs>`, `useStyle*` hooks. [VERIFIED: CAPABILITIES.md]
- **Lesson-media** (`src/lesson-media/`): `LessonAudioLayer`, `LessonCaptionLayer`, `mediaSrc`. [VERIFIED dir listing]
- **Transitions/intro:** `TopicIntroCard`, `SectionHandoff` (decorative 3D moments per CLAUDE.md).

```jsonc
// coverage-map.json (stub — ready to fill)
{
  "concepts": [
    {
      "concept": "make-ten",
      "spine": true,
      "primitivesNeeded": ["ten-frame", "number-bond", "counter-token", "arc-move"],
      "have":  ["counter-token", "number-bond"],          // number-bond ≈ FenHeDiagram
      "lack":  ["ten-frame", "arc-move"],                  // arc-move = §animation-brief new primitive #1
      "demand": []                                          // appended by gap-scan (lesson ids)
    },
    {
      "concept": "one-to-one-comparison",
      "spine": true,
      "primitivesNeeded": ["countable-row", "balance-scale", "pivot", "pointer-highlight"],
      "have":  ["countable-row"],
      "lack":  ["balance-scale", "pivot", "pointer-highlight"],   // pivot = animation-brief #2; pointer = pedagogy signaling
      "demand": []
    },
    {
      "concept": "pinyin-tones",
      "spine": false,
      "primitivesNeeded": ["tone-contour", "syllable-card", "pointer-highlight"],
      "have":  ["syllable-card"],
      "lack":  ["tone-contour", "pointer-highlight"],
      "demand": []
    }
  ]
}
```

Cross-cutting `lack` items that recur (build first under the factory): **`<Pointer>`/`<Highlight>`** (pedagogy signaling, §4 approved #1), **`<ArcMove>`** and **`<Pivot>`** (animation-craft brief new primitives), **`ten-frame`** (make-ten spine). Concept taxonomy is seeded from `pedagogy.md` files, then human-curated (primitive-factory Q2).

---

## 6. Research corpus index

### yt-rag namespaces now available
Confirmed via `list_repository` this session (24 namespaces / 633 videos / 7544 chunks total). The lesson-relevant ones:
- **`yt_svg_animation`** (5 videos) — SVG/motion craft: Hunor Márton Borbély "Learn SVG through 24 examples", SVGator "Animate an SVG Character with Rotation, Skew, and Easing" (grouped-pivot/easing), Maxon "Motion Graphics Fundamentals", StudioBinder "12 Principles of Animation", a Figma+Jitter SaaS-motion video. (Synthesized in `research/animation-asset-craft.md`.)
- **`yt_kids_music_sound`** (4 videos) — Brett Albano, Envato Tuts+, How To 1 Minute, Tech with Ayrass — ducking, music-choice, score-fast (feeds `research/music-sound-design.md`).
- **`yt_kids_pedagogy`** (3 videos) — Devlin Peck, Harvard, JHU School of Education — Mayer's multimedia principles, evidence-based instruction (feeds `research/pedagogy-engagement.md`). NOTE: the pedagogy brief's `kids_screens_NN` / `msrachel` / `pacing_seg` source IDs are synthetic placeholders, not real video IDs in this namespace — the real ingested videos are the three named here; re-derive deep-links from them if precise anchors are needed.
- **`yt_lesson_pacing`** (8 videos) — Kurzgesagt, 3Blue1Brown, ECAbrams, Bloop Animation, TomsProject, Vane Motion — explainer pacing / segmenting / animatic workflow.
- **Craft channels:** `yt_benmarriott` (286 chunks), `yt_alanbeckertutorials` (incl. the per-principle 12-principles series), `yt_schoolofmotion`, `yt_howardwimshurst`, `yt_tonikopantoja`, `yt_ecabrams`, `yt_sonduckfilm`, `yt_mtmograph`, `yt_corridor`, `yt_remotion_motion` (Hartquist / CodingMenace / chantastic — Remotion + Claude Code).

### Top source links per theme
**Music & sound** (`research/music-sound-design.md`):
- Song Creator Pro — research-backed kids/e-learning bed spec (60–80 BPM, major, no vocals, -10..-15 dB; cites Frontiers 2025 + Behavioral Sciences 2025): https://songcreator.pro/blog/ai-background-music-presentations-courses
- video-audio-design (AbsolutelySkilled) — Remotion `<Audio volume={interpolate()}>` ducking, 10–15-frame ramps, layer-volume + mistake tables, WAV-for-SFX: https://github.com/AbsolutelySkilled/AbsolutelySkilled/blob/main/skills/video-audio-design/SKILL.md
- VidNo — VAD auto-mix (speech -30..-35 dBFS, gaps -18..-22 dBFS, normalize -16 LUFS) + 3-point validation: https://vidno.ai/blog/auto-mix-voiceover-with-music
- TonnSDK — ducking presets (Light/Medium/Heavy depth+attack+release): https://tonn-portal.roexaudio.com/sdk/docs/post-production-features
- audio-mixing-patterns (orchestkit) — dB table + content-type mix ratios (E-learning music 8%) + ffmpeg sidechain/loudnorm: https://playbooks.com/skills/yonatangross/orchestkit/audio-mixing-patterns
- Envato Tuts+ — choosing music that doesn't compete with VO: https://youtu.be/oDjAiDUq-QY?t=550 ; Brett Albano — ducking defined: https://youtu.be/6-_TIanP9Co?t=1 ; Tech with Ayrass — score-in-60s pain points: https://youtu.be/5gUeH00rGZE?t=2

**Pedagogy** (`research/pedagogy-engagement.md`):
- Mayer's 12 principles + effect sizes: https://www.instructionaldesign.org/theories/cognitive-multimedia/
- Multimedia learning with young children (positivity, social contingency): https://www.frontiersin.org/articles/10.3389/fpsyg.2021.00345/full
- Signaling/cueing review (d=0.41, synchrony): https://www.sciencedirect.com/science/article/pii/S1041608019301234
- Background music in instructional video (harm under narration): https://www.sciencedirect.com/science/article/pii/S0360131520301234
- yt-rag deep-links: Ms Rachel held-pause `?t=128`/`?t=420`, empty-frame focal `?t=512`, deictic point `?t=640`; segmenting `pacing_seg?t=96`/`?t=288`; video-length-by-age `videolength_age?t=150`.

**Animation craft** (`research/animation-asset-craft.md` + the two svg-animation-craft briefs):
- StudioBinder — 12 principles: ARCS (the only mechanical kit gap) https://youtu.be/tYc1yUt0IeA?t=827 ; squash&stretch `?t=94` ; anticipation `?t=275`
- SVGator — grouped-pivot character workflow (origin-point per group → `<Pivot>`): https://youtu.be/T-Bb03-aiF8?t=5 and `?t=189`
- Alan Becker — appendage drag `?t=538`, smear-frame `?t=808`, slow-in/out `?t=628`: https://youtu.be/uDqjIdI4bF4
- Ben Marriott — easing `https://youtu.be/jFbRZZmMW7c?t=1458`, boil `https://youtu.be/OlGjmrB__cM?t=0`, anticipation `https://youtu.be/n24aTp1-jK4?t=1373`
- Remotion timing rules (curves + one-progress): https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/timing.md
- kako-jun/blueprinter (SVG→sumi/watercolor/chalk, deterministic seed): https://github.com/kako-jun/blueprinter

**Script↔animation coordination & ASR** (prior briefs):
- Starlog — TTS-first programmatic animation (video_explainer; `frame - wordStartMs*fps` anchoring): https://starlog.is/articles/ai-dev-tools/prajwal-y-video-explainer/
- Remotion captions/word-highlight (`token.fromMs` per-frame): https://www.remotion.dev/docs/captions/displaying
- Yu-kai Chou — the 200ms rule (show text 200ms before the word; fade-out at end-of-reference).
- sherpa-onnx native per-token `timestamps` (the phase-1 word-ASR fix): https://github.com/k2-fsa/sherpa-onnx

---

### Open items carried forward (must-resolve before the relevant build ships)
- **O1 (music):** does narration-kit `AudioLayer` already build a deterministic frame-keyed duck envelope with our numbers + accept SFX? Resolve before §2 build.
- **O2 (music):** master loudness — pick bed levels to sum to ≈ -16 LUFS vs add a post-render `ffmpeg loudnorm` pass (lean: post-pass, still deterministic).
- **O3 (music):** child/monetized licensing for Suno/ElevenLabs/Mubert/YT Audio Library — clear per-asset, store license files, before the library ships.
- **O4 (music):** "1 SFX per beat" K-3 density cap is assumed — validate with a real lesson.
- **Pedagogy O1:** parent co-viewer caption track — decide audience-of-record before the keyword-caption rewrite.
- **Verification proposal:** `docs/proposals/machine-gated-verification.md` was NOT on disk this session — locate or author it; it is Tier-1 build #1 and the factory depends on its check modules.
