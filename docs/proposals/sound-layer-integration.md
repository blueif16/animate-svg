# Sound layer integration (music bed + SFX) — proposal

**Status:** draft for review. Author: 2026-05-29.
**Scope:** integrate a music-bed + SFX layer into the lesson pipeline as a **dedicated sound lane** that runs parallel to the existing primitive lane, plus the runtime code, the curated asset library, and the verification additions. This is the "production-polish" track from `docs/IMPLEMENTATION-HANDOFF.md` §2 — orthogonal to the throughput builds, buildable now.

**Research basis:** `research/music-sound-design.md` (mix engineering — the dB/LUFS/ducking numbers, settled) and `research/music-sound-palette-2026-05-29.md` (palette + SFX vocabulary + sourcing/licensing; resolves O1/O3). This proposal does **not** re-derive those; it turns them into node contracts + code.

**Preserves every hard rule** in `docs/pipeline-architecture.md` and `CLAUDE.md`: the cue stays the unit of coordination; narration audio stays frozen after Wave 3a; zero frame literals in scene code; scripts stay lesson-agnostic; the CAPABILITIES protocol is followed. Where a wave contract changes, it is listed under "Structural changes requiring approval."

---

## 0. The one idea that decides the architecture

There are **two audio tracks with opposite lifecycles**:

| | Narration (voice) | Music + SFX |
|---|---|---|
| Role on the timeline | **drives** it — `narrationFrames` is an input to Wave 3.5 reconcile | **consumes** it — bed envelope reads cue narration windows; SFX read `cues[id].startFrame + offset` |
| Frozen when | after Wave 3a (`pipeline-architecture.md` §5) | n/a — added at Wave 4, changes no cue length |
| Source of truth for its frames | ASR alignment | the reconciled `<X>Cues` + the composer's own motion offsets |

So music/SFX can only be **placed** correctly *after* Wave 3.5 — which makes them peers of the composer/sketch-layer (Wave 4), **not** peers of the voice node (Wave 3a). The "AUDIO IS FROZEN AFTER WAVE 3a" rule is about narration only; adding a music track at Wave 4 does not violate it because the track changes no cue length. This is worth stating explicitly in the architecture doc (see structural change #4) so a future reader doesn't think music must be frozen at 3a.

**Corollary — why music is NOT a separate Wave-4 sound-composer subagent.** SFX fire on motion events the **composer** owns (a "pop" must land on the `<PopIn>` entrance frame the composer placed at `cue.start + offset`). A parallel sound agent at compose time would have to either *dictate* that offset (inverting control — fragile) or *read the composer's emitted JSX* (serial, not parallel) — recreating the "audio on one timeline, visuals on another" bug the §6 post-mortem exists to prevent. So the parallelism win is **upstream**, at authoring + asset time. At compose time: the **bed is mechanical** (no agent), and **SFX are emitted by the composer** because it owns the frames.

---

## 1. Problem (grounded in files/lines)

1. **No lesson wires music in.** The kit's `AudioLayer` exposes `bgmSrc`/`bgmVolume`/`duckedBgmVolume`, and `LessonAudioLayer.tsx` forwards them, but `grep bgmSrc src/` shows the prop is referenced **only** in `LessonAudioLayer.tsx` — never passed by any of the 8 `Complete<X>Lesson.tsx` wrappers (e.g. `CompleteMakeTenLesson.tsx:32` passes `voiceoverSpans` but no `bgmSrc`). So no bed ever plays. [VERIFIED]
2. **No SFX path at all.** `shared-narration/src/AudioLayer.tsx` handles exactly `bgm` + `voice`; there is no SFX list, registry, or layer anywhere. [VERIFIED]
3. **The kit loops the bed against our own rule.** `AudioLayer.tsx:71` renders `<Html5Audio loop … />`. `research/music-sound-design.md` F5/§2.3 requires beds NEVER loop (generate to length). Ramps are symmetric `fadeFrames=8` (`AudioLayer.tsx:23`), not the spec's 10f-down/15f-up, and there is **no lesson-edge fade** (spec wants 0.75s/22f in+out). [VERIFIED: file:line]
4. **No master loudness pass.** Remotion mixes but does not run `loudnorm`; the render script (`render-complete-lesson.mjs`) goes render→probe→contact-sheet with no normalization step, so the -16 LUFS / -1 dBTP target is unmet. [VERIFIED]
5. **No curated asset library.** `public/audio/` holds only `*-voice.wav` files — no `_beds/`, `_sfx/`, `_stings/`. [VERIFIED]
6. **No creative sound artifact or node.** There is no `audio-cues.json`, no sound-design skill, and no wave that decides bed mood / SFX mapping. The handoff §2.5 named touch-points but no node owns them.

---

## 2. Proposed design — the dedicated sound lane

Two new LLM nodes (the lane) + mechanical consumption at Wave 4 + a render/verify addition. Inserted into the wave order from `pipeline-architecture.md` §4 (and composes cleanly with the Stage 3.6 codegen in `workflow-and-composer-codegen.md` — see §7):

```
Wave 2a  visual-design  ──(already) tags SFX-worthy beats per cue (entrance/count/transition/success)
Wave 2b  audio-captions          ║   Wave 2c  SOUND-DESIGN  (NEW, ∥ 2b; both depend on 2a + pedagogy)
                                  ║     author lesson-data/<id>/audio-cues.json
                                  ║     (bed mood, intro sting, outro, SFX→beat map, density, tone-guard)
Wave 3a  voice+ASR  ║  Wave 3b primitive gap-scan→build  ║  Wave 3c  SOUND-ASSET gap-scan/factory (NEW)
                                                          ║     does the curated library cover audio-cues.json?
                                                          ║     default REUSE; name+source+license any gap; verify WAVs; FREEZE
Wave 3.5 reconcile  (final cue boundaries — unchanged)
Wave 4a  composer  ──also reads audio-cues.json + frozen WAVs; wires bed in the Complete wrapper;
                     emits sfxEvents in the scene (cue-relative, its own offsets)   ║  Wave 4b sketch (unchanged)
Wave 5   render  ──+ post-render ffmpeg loudnorm pass (deterministic 2nd pass)
Wave 6   verification  ──+ 4 sound checks (melody-not-identifiable / 3-point duck / -16 LUFS / SFX≤narration)
```

The lane mirrors the **primitive lane** exactly: a creative authoring step (2c ≈ visual-design's role) → an asset gap-scan/factory (3c ≈ primitive-gap-scan→builder) that defaults to reuse and freezes before Wave 4. Once the ~5-bed/~5-SFX library exists, 3c is near-instant for every lesson (almost always "reuse"), exactly like the primitive factory's demand gate.

### 2.1 Wave 2c — sound-design node (LLM, ∥ 2b)
- **Input:** `brief.md` (topic → bed mood + tone-language flag), `pedagogy.md` (reward/discovery beats → where the single `ta-da` goes), `visual-design.md` (per-cue SFX-worthy tags).
- **Output artifact:** `lesson-data/<id>/audio-cues.json` (schema §3) + `_logs/sound-design.md`.
- **Owned paths:** `lesson-data/<id>/audio-cues.json` only.
- **Lesson-agnostic rule:** it writes lesson-SPECIFIC choices into the json; it never edits shared code, the library, or other lessons. Bed/SFX names are KEYS into the shared library, not new assets.
- **Skill:** new `lesson-sound-design` (see §8). Encodes the palette rules (calm-piano default; pentatonic accent only in gaps; **tone-safe-pad under pinyin/tone narration**; ≤1 SFX/beat; no SFX over instruction words; rising-pitch count is opt-in + flagged [ASSUMED]).
- **Does NOT depend on voice** — only on visual tags + pedagogy — so it runs fully parallel with 2b and the whole Wave 3 fan-out.

### 2.2 Wave 3c — sound-asset gap-scan / factory (LLM, ∥ 3a/3b)
- **Input:** `audio-cues.json` + the library index (`public/audio/_beds|_sfx|_stings/_index.json`).
- **Default answer = REUSE.** If every bed/sting/sfx key resolves to an existing licensed WAV, the node returns `{status:"pass", summary:"all assets in library"}` in ~seconds.
- **Gap path (rare, author-time):** if a needed mood/sound is absent (e.g. a new `tone-safe-pad`, a dizi `mandarin-accent-sting`), the node NAMES it (same as a missing SVG primitive). The actual asset is sourced **author-time from CC0 freesound + Pixabay Music** (the chosen sourcing — free, commercially cleared, multi-platform safe), normalized to the spec (mono/stereo, -4dB EQ shelf 800–3000Hz baked, length ≥ longest section, 0.75s-fade-safe), and committed with a `<name>.license.txt`. Gated like the primitive factory: build when ≥2 lessons need it OR it's a spine concept (e.g. `tone-safe-pad` is spine for the literacy track).
- **Output artifact:** verified WAV(s) under `public/audio/_beds|_sfx|_stings/`, each with `.license.txt`; updated `_index.json`; `_logs/sound-asset.md`. **Frozen before Wave 4**, like primitive test-stills.
- **Verification it owns:** every referenced key resolves to a file; each new asset has a license file; bed length ≥ reconciled total isn't knowable yet (3.5 hasn't run) so it pads to a generous max-section default and the composer asserts length at Wave 4.

### 2.3 Wave 4a — composer consumption (mechanical bed + composer-owned SFX)
- **Bed/sting/outro = mechanical.** The composer (or codegen, §7) wires the bed in the `Complete<X>Lesson.tsx` wrapper: `bgmSrc = library(audio-cues.bed)`, and the volume envelope from §4 reads the cue narration windows (already available as `voiceoverSpans` at `CompleteMakeTenLesson.tsx:35`) + total frames. No agent judgment — it's deterministic from the timeline.
- **SFX = composer-emitted in the scene.** For each SFX-tagged beat in `audio-cues.json`, the composer builds an `sfxEvents` array using the **same** `cueFrames(id)` + `layout.ts` offset constants the visual uses, and renders `<LessonSfxLayer events={sfxEvents} />` (§4). The FRAME comes from the composer's motion math; `audio-cues.json` supplies only WHICH sound + WHETHER (semantic, not frames). This keeps one source of truth for "when does the pop happen" and makes a frame literal impossible (offsets are `layout.ts` constants).
- The composer asserts each bed WAV's duration ≥ the reconciled total (so the kit's `loop` never fires audibly) and fails the node if not.

### 2.4 Wave 5 / 6 additions
- **Render:** add a post-render `ffmpeg loudnorm` second pass on the MP4 audio, slotted after "Render MP4" / `probe` (`render-complete-lesson.mjs:215`). Deterministic (it's a fixed two-pass on a fixed input), preserving the offline/byte-stable guarantee. Resolves O2.
- **Verification (Wave 6):** add the 4 checks from `music-sound-design.md` §2.6 — (a) melody NOT identifiable under narration; (b) 3-point check (intro duck / mid-gap rise / outro resolve); (c) measured master ≈ -16 LUFS / TP ≤ -1 dB (a `ffmpeg loudnorm` print pass on the MP4); (d) no SFX louder than narration. The action-aware contact sheet already shows where SFX should land.

---

## 3. `audio-cues.json` schema (authored input, version-controlled)

Lives at `lesson-data/<id>/audio-cues.json`. **Semantic, not frame-bearing** — declares moods, sound keys, and which beats are sonified. `pipeline.json` stays mechanical (paths only); the creative choices live here.

```jsonc
{
  "lessonId": "kp4-make-ten",
  "bed": "math-calm-68-cmaj",          // key into public/audio/_beds/<name>.wav
  "toneSafe": false,                    // true → use a flat pad bed + ban melodic motifs under narration (pinyin/tone lessons)
  "intro": { "sting": "soft-rise" },    // public/audio/_stings/<name>.wav over cues.intro; optional
  "outro": { "resolve": true },         // bed rises to full as last narration ends
  "sfx": [                              // each row = a SEMANTIC beat; the composer computes the frame
    { "cue": "introTitle", "event": "popin",  "sound": "pop" },
    { "cue": "countTo10",  "event": "count",  "sound": "tick", "perStep": true, "risingPitch": true },
    { "cue": "success",    "event": "reward", "sound": "ta-da" }
  ]
}
```

Rules encoded as a `lesson:check` lint (advisory, non-blocking, per CLAUDE.md):
- `bed`/`sting`/`sound` keys must resolve in `_index.json`.
- ≤1 SFX row per cue per event-type (the "1 motivated SFX per beat" cap — [ASSUMED] per O4, flagged not enforced-hard).
- if `toneSafe:true`, `bed` must be a `*-pad`/drone bed and no `intro.sting` with a melodic motif may sit under narration.
- no `offset`/frame field is allowed (frames are the composer's) except a documented escape hatch for non-primitive-tied one-shots.

---

## 4. Runtime code (lesson repo; isolate from the shared kit)

**Decision: do NOT patch the shared `@studio/narration-kit` `AudioLayer`.** It's a shared dependency (also consumed elsewhere), and it loops + lacks edge-fade/SFX. Instead, isolate the changes in the lesson repo so the kit stays untouched:

- **`src/lesson-media/audioMix.ts`** [NEW, lesson-agnostic] — the §2.1 constants + the frame-keyed envelope:
  ```ts
  // BED_UNDUCKED_LINEAR ≈ 0.13, DUCK_FACTOR ≈ 0.2 (-14 dB), attack 10f, release 15f, edge-fade 22f.
  export function bedVolume(frame, windows: {nStart,nEnd}[], total): number  // product-over-windows + edge fade
  ```
  This is the §2.2 envelope verbatim — deterministic, zero frame literals (all inputs are cue/ASR frames + `total`).
- **`src/lesson-media/LessonBgmLayer.tsx`** [NEW] — renders our own non-looping `<Audio src volume={f=>bedVolume(...)}>` (a generated/long bed never loops; we also omit `loop`). Used by the wrapper instead of routing the bed through the kit. The kit's `AudioLayer` keeps handling **voice** only.
- **`src/lesson-media/sfx.ts`** + **`<LessonSfxLayer>`** [NEW] — a registry (`sound-key → {wav, defaultVolume}`) and a layer that maps an `sfxEvents: {sound, fromFrame, volume, pitch?}[]` array to one-shot `<Sequence from><Audio/></Sequence>`. SFX peak ≤ -18 dB; do NOT duck; `perStep`+`risingPitch` expand to N events with ascending `playbackRate`.
- **`src/lessons/Complete<X>Lesson.tsx`** [EDIT, per lesson] — render `<LessonBgmLayer bed=… windows=… total=…/>` and `<LessonSfxLayer events={sfxEvents}/>` alongside the existing voice `LessonAudioLayer`. The composer (or codegen) writes this wiring.

This keeps determinism (local WAVs only), respects zero-frame-literals (offsets are `layout.ts` constants), and touches no shared package.

---

## 5. Asset library + licensing (author-time, one-off; CC0 freesound + Pixabay)

Per the chosen sourcing. Built once, reused across the catalog; each asset carries a `<name>.license.txt`.

**Beds — `public/audio/_beds/` (~5):** `math-calm-68-cmaj`, `literacy-playful-76`, `tone-safe-pad` (flat/drone — tone lessons), `celebration-resolve`, optional `mandarin-accent-sting` (pentatonic, intro-only). All: no vocals, major/neutral, EQ-carved, length-padded ≥ longest expected section.
**SFX — `public/audio/_sfx/` (~5):** `pop`, `chime`, `whoosh` (low-pass, ~-15dB), `tick` (rising-pitch base), `ta-da`. All WAV, <1.5s, brighter pitch.
**Stings — `public/audio/_stings/` (~2):** `soft-rise`, optional `mandarin-accent`.

**Licensing checklist (gate before any asset ships — closes O3):**
- **freesound:** use **CC0 only** (CC-BY needs attribution; **CC BY-NC is NOT monetizable**). Save the sound page URL + license string in `.license.txt`.
- **Pixabay Music/SFX:** commercial embedded use OK, no attribution; **cannot redistribute standalone**; **some tracks still carry Content-ID** — verify per track and keep the download as dispute proof.
- Store `public/audio/_<kind>/<name>.license.txt` = {source URL, license, retrieval date, "cleared for monetized children's media: yes"}.
- **COPPA "made for kids"** governs data/ads, not audio — no music clause; just note that MFK disables personalized ads (RPM impact), unrelated to the sound.
- `_index.json` per kind lists `{name, file, license, lengthSeconds}` so the lint/factory can resolve keys mechanically.

(Generation tools — Suno/ElevenLabs Music/Mubert — are **out of scope** by the sourcing decision and **never** run at render time regardless.)

---

## 6. Verification & render details

- **Render loudnorm pass** (`render-complete-lesson.mjs`, after L215): `ffmpeg -i <render>.mp4 -af loudnorm=I=-16:TP=-1:LRA=11:print_format=summary -ar 48000 …` two-pass into the final MP4. Wrap as a timed step like the others; non-fatal-skippable behind `--skip-loudnorm` for fast iterations.
- **Wave 6 checks** become rows in the `lesson-verification` skill checklist + (where mechanizable) a `lesson:check` add-on: parse the loudnorm summary for I/TP; flag if |I+16|>1 or TP>-1.

---

## 7. Composition with the other proposals

- **Codegen (`workflow-and-composer-codegen.md` §4.4):** the sound layer rides the slot model cleanly. Codegen emits the **bed wiring** in the `Complete<X>Lesson.tsx` wrapper mechanically (it's deterministic from the timeline) and emits an empty `// <<slot:sfx>>` region + the `<LessonSfxLayer events={sfxEvents}/>` shell; the composer fills `sfxEvents` from `audio-cues.json` + its offset constants. No conflict — SFX frames stay composer-owned inside the slot.
- **Workflow driver (§4.1):** add Stage **2c sound-design** (∥ 2b) and Stage **3c sound-asset** (∥ 3a/3b) to the DAG; both return the standard `{status, outputArtifact, summary, issues, pipelineFindings, wallClockMs}`. The render node gains the loudnorm sub-step.
- **Machine-gated verification (Tier-1 #1):** the 4 sound checks (esp. -16 LUFS print + SFX≤narration) are natural deterministic gate modules.

---

## 8. Structural changes requiring approval (CLAUDE.md / skills / wave contracts)

Per CLAUDE.md "Structural changes… require user approval before edits":
1. **CLAUDE.md "Subagent Workflow":** add Wave **2c sound-design** (∥ 2b) and Wave **3c sound-asset gap-scan/factory** (∥ 3a/3b); note the bed-mechanical / SFX-composer-owned split at Wave 4; add the loudnorm step to Wave 5 and the 4 checks to Wave 6.
2. **New skill `lesson-sound-design`** (Wave 2c) under `.agents/skills/` (kids-taste ownership per CLAUDE.md "Skill ownership"); add to the Skills index.
3. **`remotion-lesson-composer` SKILL.md:** add the contract that the composer reads `audio-cues.json`, wires `<LessonBgmLayer>` in the wrapper, and emits `sfxEvents` with `layout.ts`-constant offsets (never frame literals).
4. **`lesson-verification` SKILL.md:** add the 4 sound checks.
5. **`docs/pipeline-architecture.md`:** Changelog v2 — document the two-audio-track distinction (§0), the sound lane, and that music/SFX are added at Wave 4 without violating the 3a freeze.
6. **`CAPABILITIES.md`:** register `bed-duck-envelope` (`audioMix.ts` / `bedVolume`), `lesson-sfx-layer` (`sfx.ts` / `<LessonSfxLayer>`), and `lesson-bgm-layer` per the capability protocol.
7. **`package.json`:** the loudnorm step is additive inside `lesson:render` (or a `--skip-loudnorm` flag); `lesson:scaffold` template gains an `audio-cues.json` stub.

Non-structural (no approval): the new `src/lesson-media/*` code, the asset library + license files, the scaffold stub, fixing nothing in the shared kit.

---

## 9. Effort & risks

**Effort:** `audioMix.ts` + `LessonBgmLayer` ~0.5d; `sfx.ts` + `<LessonSfxLayer>` ~0.5d; wrapper wiring + composer-skill contract ~0.5d; loudnorm render step ~0.25d; curated library sourcing + license clearance ~1–1.5d (the real cost — manual CC0/Pixabay curation); `lesson-sound-design` skill + `audio-cues.json` schema/lint ~1d; Wave 6 checks ~0.5d. **Total ~4.5–5 dev-days**, most of it the one-time asset library.

**Risks:**
- **Tone-language interference is [ASSUMED].** The "flat bed under tone narration" guard is inferred, not measured — validate by ear on `pinyin-four-tones` before generalizing. (Mitigation: `toneSafe` defaults conservative — pad bed, no melodic sting under narration.)
- **SFX density cap [ASSUMED] (O4).** Validate "1/beat" on a real lesson + the action-aware contact sheet; the lint is advisory, not blocking.
- **Pixabay Content-ID** on some tracks — verify per asset, keep download proof; prefer CC0 freesound where ambiguous.
- **Bed length vs lesson length:** if a bed is shorter than the reconciled total the kit/loop or our `<Audio>` end would be audible — the composer asserts `bedSeconds ≥ totalSeconds` at Wave 4 and fails otherwise; the factory pads beds to a generous default.
- **Reddit practitioner tier still unverified** (O5 — MCP 403 both passes); looping/too-loud field confirmations are owed but the web/pedagogy tiers corroborate the rules.

---

## 10. Open questions
1. **`toneSafe` default per topic** — auto-set from the brief (literacy/pinyin → true) or always explicit in `audio-cues.json`? (Lean: auto-suggest from topic, overridable.)
2. **Where does `sfxEvents` live** — inside the `<X>LessonScene` (next to motion) or assembled in the `Complete<X>Lesson` wrapper from exported offset constants? (Lean: assembled in the scene where the offsets are, passed up — keeps frames at their definition site.)
3. **Parent-mode full captions** (pedagogy O1) interacts with audio mode but is out of scope here — flag only.
4. **Per-section beds** for long videos — one bed for the whole lesson, or per-section with crossfades at section handoffs? (Lean: one bed until the segmenting/longer-video work lands; revisit with the pedagogy backlog item #1.)
```
