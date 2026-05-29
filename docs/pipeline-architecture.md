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

- The WAV file at `public/audio/<id>-voice.wav` is the canonical audio. It plays once, top-to-bottom, as one `<Sequence>` in `LessonAudioLayer`.
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
