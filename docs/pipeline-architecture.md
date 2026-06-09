# Pipeline Architecture — Timeline & Narration

Living document. Captures the lesson-pipeline architecture, the reasoning behind it, and the changes made over time. Reference this when changing how cues, audio, visuals, or captions are coordinated.

**Status:** v1 — first written 2026-05-28 after the kp1-fen-yu-he-intro post-mortem.
**Update protocol:** every time we change wave order, cue-timing semantics, or the audio/visual/caption contract, append a versioned "Changelog" entry at the bottom AND inline-edit the relevant section. Old language stays in changelog, not in the body.

---

## 1. The core principle

> **The cue is the unit of coordination. Each cue has ONE timeline window. Audio, visuals, and captions all share that window.**

There is no separate "audio timeline" and "visual timeline." A cue's `startFrame`/`endFrame` are the same for all three layers. If they ever diverge in code, that's a bug.

## 2. Who owns the cue length

The cue's length is decided **after** Wave 3a generates voice, not before. The decision is bounded by two facts:

1. **The audio is frozen.** Once Wave 3a generates a cue's audio, we never regenerate that take. The audio file's actual duration per cue (`narrationSeconds`) is locked.
2. **The visual choreography has an intrinsic motion duration** (`visualMotionSeconds`) — declared by Wave 2a (visual-design), reflecting how long the motion physically needs to land for a 6yo to read it.

The cue length is then:

```
cueSeconds = max(narrationSeconds, visualMotionSeconds) + tailSeconds
```

Where `tailSeconds` is a small buffer (≤ 0.3s) so the cue doesn't slam straight into the next. Captions read this window; the audio sits inside it; the visual motion plays through it.

If `narrationSeconds > visualMotionSeconds` → cue is narration-driven; visual holds final state briefly through the audio overrun.

If `visualMotionSeconds > narrationSeconds` → cue is visual-driven; narration sits inside the motion window; the picture is the teacher.

Both are fine. What's NOT fine is the old behavior: pick a target length unrelated to either, then pad with dead air.

## 3. Why visual-first, narration-as-commentary

A real teacher narrates what they're showing. The visual is the teaching tool; the words are commentary on the visual. Pedagogically this means:

- **Visual demands set the cue's MINIMUM length.** If the migration animation needs 4.5s to be readable for a 6yo, that's the floor. No narration shortcut lets us trim that.
- **Narration is written to fit the visual.** Wave 2b writes per-cue narration TARGETING the visual budget. Char-count math gives a rough estimate; calibrated voice rate gives better.
- **TTS comes out close to target.** If it's badly off (>30%), Wave 2b retightens the text and re-runs voice for that one cue. Once shipped, frozen.
- **No padding to hit a global target.** The lesson length is whatever the cues sum to. Period.

## 4. The wave order (current)

```
Wave 0   Pedagogy + brief                          (orchestrator-owned)
         Output: pedagogy.md (per-cue discoveries), brief.md.
         NO timing claims of any kind.

Wave 1   Storyboard
         Output: storyboard.md.
         Per-cue beat descriptions and required visuals.
         NO duration estimates. (They were guesses that mislead Wave 2b.)

Wave 2a  Visual design       ║   Wave 2b  Audio + captions (SERIAL after 2a)
         Output: visual-      ║   Reads visual-design's motion budgets.
         design.md            ║   Writes narration to FIT each cue's budget.
         Includes:            ║   Output: audio-captions.md, script-cues.json.
         - Visual Contract    ║   No §3 hold table — that mechanism is gone.
         - per-cue            ║
           visualMotion       ║
           Seconds            ║
         No frame numbers.    ║

Wave 3a  Voice + ASR
         Output: generated/<X>Timing.ts with raw aligned cues.
         These are the CANONICAL audio cue durations.
         Frozen from this point. Never regenerated.

Wave 3b  Primitive gap-scan + builder    (parallel with 3a)

Wave 3.5 Cue timeline reconcile          (orchestrator-owned)
         Reads: visual-design.md (visualMotionSeconds per cue) +
                Wave 3a timing module (narrationSeconds per cue).
         For each cue:
           cueSeconds = max(narrationSeconds, visualMotionSeconds) + tail
         Output: lesson-data/<id>/cue-timeline.json — single source of truth.
         Currently embedded directly into <X>LessonTimeline.ts as the
         exported `<X>Cues` array.

Wave 4a  Composer
         Reads: cue-timeline.json (or the timeline.ts export).
         Scene reads cue boundaries from there.
         layout.ts motion offsets are CUE-RELATIVE; visual motion must fit
         inside each cue's window. If it doesn't, composer trims non-load-
         bearing flourishes (sparkle, dot-dismiss) FIRST; never re-pads.
         Caption layer reads the same cue boundaries.
         Audio layer plays the WAV as one continuous Sequence — works
         correctly because visuals now match the audio.

Wave 4b  Sketch overlay layer            (parallel with 4a)

Wave 5   Render

Wave 6   Verification
         Reads the contact sheet (5 samples per cue) AND samples MP4
         frames. Grades against pedagogy.md.
```

### What "orchestrator-owned" means here

Wave 0 (pedagogy), Wave 3.5 (reconcile), and the orchestrator's pre-render review are NOT delegated to subagents. They are mechanical decisions or audits the orchestrator runs directly. Spawning a subagent for these adds round-trip cost and dilutes accountability.

## 5. The audio is frozen — explicitly

After Wave 3a generates voice:

- **[Superseded by v4 — see changelog.]** ~~The WAV file at `public/audio/<id>-voice.wav` is the canonical audio. It plays once, top-to-bottom, as one `<Sequence>` in `LessonAudioLayer`.~~ In v4 the audio is **per-cue clips**, each mounted in its own `<Sequence from={cue.startFrame}>`; the continuous WAV is QA-only. The freeze still holds (clips are canonical once accepted).
- If a cue's TTS comes out badly mis-aligned (e.g., ASR matchScore < 0.7 or audible truncation), Wave 2b may retighten THAT ONE CUE'S text and Wave 3a regenerates THAT ONE CUE. This is a re-take, not a re-design.
- Once Wave 3.5 emits the reconciled cue-timeline, the audio's per-cue durations are inputs to that file. Changing them later means re-running Wave 3.5.

The composer NEVER regenerates audio to hit a visual target. If visual motion overshoots a cue, composer cuts non-load-bearing motion — it does not lengthen the cue.

## 6. The dead idea: post-narration padding (REMOVED)

Pre-v1, Wave 2b shipped a §3 table allocating per-cue "post-narration hold" seconds. The composer applied these to pad cues. Result for kp1-fen-yu-he-intro:

- Audio runtime: 48.83s (raw).
- Padded visual runtime: 111.57s.
- 62.74s of static frames — picture frozen, captions lingering 3× their audio, audio played silently to no visible cue.

The §3 hold table was authored BEFORE narration existed, by a subagent guessing char-rate. The composer applied it AFTER narration existed, but never reconciled. The audio layer ignored both because it just plays the WAV continuously. Three timelines, two of them drifting.

**§3 is deleted from `lesson-audio-captions` skill.** The composer no longer accepts a hold table. The timeline file no longer defines `PADDED_CUE_DURATIONS_FRAMES`.

This section killed *accidental, uncoordinated* silence (padding nobody owned). It is **not** a ban on silence — its disciplined counterpart is **§10**, where silence is intentional, typed, and coordinated.

## 7. Contact sheet contract

The render-time contact sheet (`scripts/make-contact-sheet.mjs`) samples 5 frames per cue from the rendered MP4:

- `start` — cue's first frame
- `narr·mid` — middle of narration window
- `narr·end` — last frame with audio
- `hold·mid` — middle of any post-narration hold (small or zero)
- `cue·end` — last frame of cue

Each tile is labeled with cue id, frame, time-within-cue, and a `NARR` / `HOLD` marker. Identical adjacent tiles signal stagnation. With the inverted loop, holds should be ≤ 0.3s and `hold·mid` / `cue·end` should look essentially the same — that's fine, the cue is over.

The contact sheet is the primary review artifact for Wave 6 AND for the composer's own self-audit. The composer cannot declare done if the contact sheet shows >1s of unjustified stagnation in any cue.

## 8. Known limitations / future work

- **Voice-rate calibration not yet automated.** Wave 2b's char-rate estimates have a measured ±25% error against Aoede TTS reality. A 1-clip calibration pass at the start of each lesson would tighten this to ~10%. Not blocking but recommended next.
- **No automated test for "audio ends INSIDE its cue."** Wave 6 verification should check that every cue's audio terminates before `cueEndFrame`. If audio overruns the cue (visual ended early and we're not extending the cue), the next cue's audio truncates. Currently spotted by ear, not by tool.
- **Sketch-layer marks still ship without preview.** Like primitives, sketches should produce a test still before the composer wires them. Separate from this architecture change.
- **bbox-manifest doesn't register child glyphs.** A `FenHeDiagram` with parts=[2,3] should register `chip-part-2` / `chip-part-3` as children with derived bboxes so "child missing" is detectable. Separate concern but recorded here.

## 9. How to use this doc

- **Before changing wave order or cue-timing semantics**: read §4 and §5. If your change preserves the cue-as-unit invariant (§1), edit §4 inline and add a changelog entry. If it breaks the invariant, propose it explicitly — that's a real architecture change.
- **When debugging audio/visual sync issues**: §6 is the regression we already fixed. If you're seeing similar symptoms, the timeline file is probably re-introducing padding.
- **When briefing a new subagent**: point them at the relevant wave section AND this doc. The wave skills enforce contracts; this doc explains why those contracts exist.

---

## 10. Intentional silence is typed — the gap

§6 removed silence that *nobody owned*. This section is the opposite discipline: silence that someone owns, on purpose. **A lesson is never silent by accident.** When the voice goes empty, it is for a reason — and the reason is part of the data.

### 10.1 One generic mechanism, many reasons

Many different needs all reduce to the same thing — *the voice goes empty for a good reason*:

- the child is answering a "跟我说" prompt (the **wait-time** — `lesson-pedagogy` §8);
- a visual/animation needs to land and the picture should teach uninterrupted (**animation-hold**);
- a natural inter-sentence **breath**;
- a deliberate dramatic **beat**.

Because the mechanism is one, **the namespace is the generic `gap`, never one purpose.** The kit type (`@studio/narration-kit` `CueGap`) is `{ seconds, reason }`, and `reason` is an *open union* (`GapReason`): `learner-response | animation-hold | breath | beat | …`. A new reason **extends the union** — it never gets its own purpose-named field. (The first version of this work proposed `responseGapSeconds`; that baked one reason into the namespace and was rejected for exactly this reason — a later kind of silence couldn't reuse the name. See `docs/proposals/intentional-silence-timeline.md`.)

The `reason` is metadata: the synthesis step ignores it (it only needs `seconds`), but downstream artifacts **honor** it — the composer shows a "your turn" affordance for `learner-response` and nothing for `animation-hold`; the under-floor advisory counts `learner-response` gaps toward the §8 comprehension floor.

### 10.2 Silence is generated locally — it NEVER goes through TTS

**A gap is zero-cost.** It is a buffer of zero PCM samples (`silenceChunk` = `Buffer.alloc`), spliced into the WAV between clips. The TTS engine (Gemini / ElevenLabs) — billed by spoken duration — is **only** ever called for actual spoken text. We never pay an API to "say nothing." Authoring silence as an empty spoken cue is therefore forbidden: the voice generator throws and points you at the preceding cue's `gap` instead.

### 10.3 Two expressions of the same philosophy

Intentional silence reaches the timeline two ways, both reasoned, neither padding:

1. **A baked WAV gap** (`cue.gap`) — silence that must sit *inside the audio stream* (a wait-time after a spoken prompt, a beat between sentences). The voice generator splices `gap.seconds` of local silence after that cue's clip; `bin/detect-silences.mjs` finds it; the per-lesson reconcile (`reconcileCueTimeline`) absorbs it into the cue window via `audioSpanFrames` — **no reconcile-math change**. This is the seam that makes "audio is the skeleton" (§2, §5) and intentional silence coexist: the silence is *in* the skeleton.
2. **A motion-driven hold** (`visualMotionSeconds > narrationSeconds`, §2) — silence that exists because the *picture* needs the time. Reconcile already gives the cue `max(motion, audio)`; the voice simply finishes before the cue does and the visual holds.

Both keep the **one-timeline invariant** (§1): the silence lives in the shared cue window, so audio, visuals, and captions never disagree about it. The thing §6 forbade — a *second*, composer-private timeline of padding — stays forbidden.

### 10.4 What every artifact must respect

- **Voice (W2b/W3a)** authors silence as a `gap` on the preceding cue, never as an empty cue.
- **Reconcile (W3.5)** needs no change — it reads the WAV silence like any other.
- **Composer (W4)** reads the gap's `reason` (or the cue's teaching action) and fills a `learner-response` window with a held "your turn" affordance, an `animation-hold` window with the breathing visual — never dead-frozen frames, never narration-driven motion stacked onto a response window.
- **Captions** ride the cue window unchanged; they don't fight the gap.

---

## Changelog

### v1 — 2026-05-28 — Timeline inversion

**What changed**
- Removed `PADDED_CUE_DURATIONS_FRAMES` mechanism from lesson timeline files.
- Wave 2b no longer writes a §3 post-narration hold table. The skill section is deleted.
- Visual-design (Wave 2a) now declares per-cue `visualMotionSeconds` in the Visual Contract.
- New Wave 3.5 (orchestrator-owned) reconciles: `cueSeconds = max(narration, visualMotion) + tail`.
- Composer reads reconciled cue boundaries; never re-pads.
- Audio remains a single continuous `<Sequence>` — works correctly now that visuals share its timeline.
- New contact-sheet design: 5 samples per cue, NARR/HOLD markers, padded-cue-aware.

**Why**
- Pre-v1, audio played on raw ASR timing while visuals + captions played on a composer-padded timeline. The two diverged by up to 62 seconds in kp1-fen-yu-he-intro. The audio file, the visible animation, and the displayed caption were all referring to different cues at the same wall-clock moment.
- Root cause: nobody owned cue timing. Wave 2b invented holds before narration existed; composer applied them after narration existed; audio layer ignored both. The architecture had three timelines and one truth (the audio file).
- Fix principle (user-driven): the cue is the unit of coordination. Audio is the frozen input. Visual motion has intrinsic budgets. Cue length is the max of the two. Everything reads the same cue boundaries.

**Trade-offs accepted**
- Visual-design must now think in seconds (per-cue motion budget). This is a small ask — the Visual Contract already enumerates load-bearing elements per cue.
- Wave 2b writes to a budget, which is harder than writing freely. Calibration would help; deferred to a future version.
- Lesson length is whatever the audio+visual math produces. No top-down "target length" gate. The brief's length hint is just a hint; the actual length emerges.

**Files touched**
- `docs/pipeline-architecture.md` — this doc, new.
- `.agents/skills/lesson-audio-captions/SKILL.md` — drop §3.
- `.agents/skills/visual-discipline/SKILL.md` — add `visualMotionSeconds` declaration.
- `.agents/skills/complete-video-pipeline/SKILL.md` — new wave order, add Wave 3.5.
- `.agents/skills/remotion-lesson-composer/SKILL.md` — no padding; read reconciled cues.
- `.agents/skills/lesson-debugger/SKILL.md` — add "audio/visual desync" symptom row.
- `CLAUDE.md` — update Subagent Workflow + Discipline sections.
- `scripts/make-contact-sheet.mjs` — 5-sample-per-cue contact sheet (already shipped).
- `scripts/_padded-cues-extract.ts` — helper for contact-sheet tooling.

### v2 — 2026-05-29 — Sound layer (music bed + SFX)

**What changed**
- Added a **dedicated sound lane**: Wave **2c sound-design** (∥ 2b — authors `lesson-data/<id>/audio-cues.json`) and Wave **3c sound-asset gap-scan/factory** (∥ 3a/3b — verifies/sources the `public/audio/_beds|_sfx|_stings/` library; default REUSE; new assets author-time from CC0 freesound + Pixabay). Both freeze before Wave 4.
- Wave 4 composer now also wires the bed (`<LessonBgmLayer>`, mechanical) + SFX (`<LessonSfxLayer>`, composer-owned frames).
- Wave 5 render gained a post-render `ffmpeg loudnorm` pass (−16 LUFS / −1 dBTP; `--skip-loudnorm`); the measurement is the `lufs` gate in `lesson:check --measured`.
- Wave 6 gained qualitative sound checks (melody-under-narration, 3-point duck, SFX discipline).
- New code (lesson repo): `src/lesson-media/{audioMix,sfx,LessonSfxLayer,LessonBgmLayer,audioCuesTypes}.*`. New skill `lesson-sound-design`. Capabilities `lesson-music-bed` + `lesson-sfx-layer`.

**Why — the two-audio-track principle**
- Narration **drives** the timeline (`narrationFrames` → Wave 3.5 reconcile) and is frozen at 3a. Music + SFX **consume** the reconciled timeline (bed envelope reads cue narration windows; SFX read `cues[id].startFrame + offset`) and change no cue length.
- Therefore music/SFX are placed at Wave 4 (peers of the composer/sketch), NOT at Wave 3a, and adding them does **not** violate the audio freeze. The "AUDIO IS FROZEN AFTER 3a" rule governs the narration track only.
- SFX frames are owned by the COMPOSER's motion math (not the audio file), so a separate compose-time sound subagent was rejected — it would re-introduce the dual-timeline coupling v1 removed. The bed is mechanical; the parallelism win is the upstream lane (authoring + assets).

**Trade-offs accepted**
- The kit's `AudioLayer` loops + lacks an edge fade; rather than patch a shared dependency, the bed is rendered by a lesson-repo `<LessonBgmLayer>` (non-looping) and the kit keeps handling voice only.
- The tone-language bed-pitch guard (`toneSafe`) is evidence-informed but unmeasured — flagged for a listen-test on `pinyin-four-tones`.

**Files touched**
- `CLAUDE.md` — Subagent Workflow (2c/3c, Wave 4/5/6 notes), AUDIO-FROZEN discipline clarification, Skills + ownership.
- `.agents/skills/lesson-sound-design/SKILL.md` — new (Wave 2c).
- `.agents/skills/remotion-lesson-composer/SKILL.md` — sound-layer wiring section + audio-cues input.
- `.agents/skills/lesson-verification/SKILL.md` — qualitative sound checks.
- `.agents/CAPABILITIES.md` — `lesson-music-bed` + `lesson-sfx-layer` entries.
- `remotion-svg-primitives/src/lesson-media/{audioMix,sfx,LessonSfxLayer,LessonBgmLayer,audioCuesTypes}.*` — new code.
- `remotion-svg-primitives/scripts/render-complete-lesson.mjs` — loudnorm pass + `--skip-loudnorm`.
- `remotion-svg-primitives/public/audio/_beds|_sfx|_stings/` — curated library (placeholders + `_SOURCING.md`).
- Design: `docs/proposals/sound-layer-integration.md`. Research: `research/music-sound-{design,palette-2026-05-29}.md`.

### v4 — 2026-06-08 — Cue-anchored audio (the audio reads the timeline)

**What changed**
- The narration is no longer ONE continuous WAV played from frame 0. Each cue owns its **own measured audio clip**, mounted in its own `<Sequence from={cue.startFrame}>` by the kit `AudioLayer` (new `voiceClips` prop). The §1 invariant — *the cue is the unit; audio shares its window* — is now **true for audio**, the way it was already true for captions.
- W3a voice generation TRIMS each clip's TTS padding and emits a per-cue **clip module** `src/lessons/generated/<X>Clips.ts` (`ClipCue[]`: `clipSrc` + EXACT `narrationFrames` + typed `gap`) — the audio truth. The continuous WAV is kept only as a QA/scrub master; ASR (`<X>Timing.ts`) demotes to QA (matchScore) — its frames are no longer used for timing.
- W3.5 reconcile becomes a trivial, deterministic chain via the new kit `reconcileClipTimeline`: `cueFrames = max(narrationFrames + gapFrames, motionFrames) + tail`. It also emits the `<X>VoiceClips` placement array. **Deleted:** `detect-silences` / `<X>Silences.ts` from the lesson path, the silence-boundary snapping, and the per-lesson `ASR_CORRECTIONS` table (the reconcile no longer guesses where a clip sits in a continuous WAV — it knows the exact length).
- A `gap` is now a **typed timeline HOLD**, not baked WAV silence: the clip plays at the cue start, then the window holds open for `gap.seconds` with NO audio scheduled across it (truly free — not even `Buffer.alloc`). v3's WAV-baked gap is gone.
- New **deterministic audio gate** (`npm run lesson:audio-gate`, auto-run after voice): a held-vowel **drone** detector (sustained loud low-zero-crossing audio — the `I'm…… Sam` ellipsis defect) + an untrimmed-dead-air check. Catches the defect in seconds, before render, by tool — never waiting for a human to listen.
- Held-vowel ellipsis is banned at the source: `lesson-audio-captions` / `cue-plan-author` / TEACHING-ACTIONS `model-target-slow` — an intra-cue pause is a typed gap or sub-beats, never in-text dots; the generator also collapses ellipsis runs defensively.

**Why**
- Despite v1's "reconcile the visual to the audio," the reconcile's own `max(motion, narration)` *created* motion-driven cues whose visual window exceeds the audio. A single continuous WAV has no idea where the cue boundaries are, so it played the next clip early — the exact kp1-fen-yu-he drift class returned (measured ~5s mid-lesson on `kptest-greetings-verify`: the "你来试试" prompt heard before its visual). v1 only ever worked when every cue was audio-driven. Anchoring each clip to its cue makes the drift **structurally impossible** — a clip cannot cross a boundary.
- Bonus: the fragile inference layer (silence detection + ASR-boundary correction) that existed *only* to locate clips in a continuous WAV is deleted; durations are now measured exactly at generation.

**Trade-offs accepted**
- N small clip files per lesson (gitignored) instead of one WAV. Worth it: each cue is self-contained, ASR QA is per-clip (no cross-clip contamination), and the reconcile + timeline collapse to ~30 trivial lines.
- The legacy `reconcileCueTimeline` (+ `detect-silences`) stays in the kit for pre-v4 lessons (fen-yu-he) — both reconciles coexist; new lessons use `reconcileClipTimeline`.

**Files touched**
- `@studio/narration-kit`: `types.ts` (`ClipCue`, `VoiceClip`, `clip-measured`); `reconcileTimeline.ts` (`reconcileClipTimeline` + test); `AudioLayer.tsx` (`voiceClips` mount); `bin/generate-voice.mjs` (per-cue trimmed clips + `<X>Clips.ts` + ellipsis guard); skills `cue-plan-author`.
- Lesson repo: `<X>LessonTimeline.ts` (reconcileClipTimeline), `Complete<X>Lesson.tsx` + `LessonAudioLayer` (voiceClips), `scripts/lesson-audio-gate.mjs` (new) + `render-complete-lesson.mjs` (v4-aware, runs the gate) + `_padded-cues-extract.ts` (reads exact narration window — fixes the contact-sheet marker bug).
- Skills/laws: `.claude/workflows/lesson-build.js` (laws + W3a/W3.5/W4a), `lesson-audio-captions`, `remotion-lesson-composer`, `.agents/TEACHING-ACTIONS.md`, this doc.

### v3 — 2026-06-08 — Intentional silence is typed (the gap)

**What changed**
- New §10: silence is **first-class and typed**. The kit gains `GapReason` (open union) + `CueGap = { seconds, reason }`; `CuePlanItem` gains an optional `gap`.
- The voice generator's uniform inter-clip `gapSeconds` scalar becomes a **per-cue lookup**: `cue.gap.seconds ?? default breath`. Silence is `Buffer.alloc` zeros — **never a TTS call**. Authoring silence as an empty spoken cue now throws with a pointer to `gap`.
- Reconcile is **untouched** — the baked silence is a detected WAV silence it already absorbs into `audioSpanFrames`.
- Planning: the comprehension-floor **wait-time** (`lesson-pedagogy` §8) stops being a "reconcile follow-up / fake it" hedge and becomes the shipped mechanism — a `learner-response` gap. Storyboard emits the echo+wait as its own `echo-*` beat; audio-captions authors the `gap`; the composer holds a "your turn" affordance through the window; a reconcile-time advisory warns when an acquisition lesson lands under its floor.

**Why**
- The deferred follow-up logged in `.agents/skill-system-map.md` — planning prescribed a ≥3–5s wait-time that nothing downstream allocated, so it evaporated to a 0.4s breath at render.
- The naming/robustness correction (user-driven): silence has many legitimate reasons (response, animation-hold, breath, beat); a purpose-named field (`responseGapSeconds`) would have collided with the next reason. The generic `gap` + extensible `reason` is the durable shape. And silence must be **free** — locally generated, never billed by a TTS API.

**Trade-offs accepted**
- Echo-as-own-beat increases cue count for acquisition lessons (more, shorter cues). Accepted — it is the most faithful to §8 and makes every gap a boundary gap (no interior-gap plumbing).
- A truly standalone silent beat is authored as the *preceding* cue's `gap`, not as its own empty cue — keeps every cue ASR-visible so reconcile needs no cue-plan merge.

**Files touched**
- `@studio/narration-kit` (`~/Desktop/shared-narration`): `src/types.ts` (`GapReason`, `CueGap`, `CuePlanItem.gap`); `bin/generate-voice.mjs` + `bin/generate-voice-elevenlabs.mjs` (per-cue gap, zero-cost silence, error pointer).
- `.agents/skills/cue-plan-author/SKILL.md` (kit) — the `gap` field.
- `.agents/skills/{lesson-pedagogy,lesson-storyboard,lesson-audio-captions,remotion-lesson-composer}/SKILL.md` — author + respect the gap; drop the hedge; echo-as-own-beat; "your turn" affordance.
- `.agents/TEACHING-ACTIONS.md` — `learner-response-gap` = one `gap` reason; drop the follow-up hedge.
- `.claude/workflows/lesson-build.js` — reconcile-node under-floor advisory + storyboard `exposures`.
- Design: `docs/proposals/intentional-silence-timeline.md` (supersedes the single-purpose `learner-response-gap-timeline.md`).
