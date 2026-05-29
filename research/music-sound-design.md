# Music & sound design — research brief

**Date:** 2026-05-29
**Theme:** the MISSING production layer — music bed + SFX style guide AND an integration spec for our cue timeline.
**System target:** early-childhood (preschool/K-3, Mandarin) math & literacy lessons in Remotion (1280x720@30fps, all-SVG). Voice = Gemini Aoede TTS + sherpa-onnx ASR. The CUE is the unit of timeline coordination (`cueFrames = max(narrationFrames, visualMotionFrames) + tail`). Today there is NO music and NO SFX. The codebase already has a thin `LessonAudioLayer` wrapper (`src/lesson-media/LessonAudioLayer.tsx`) that *exposes* `bgmSrc / bgmVolume / duckedBgmVolume / voiceoverSpans` props from `@studio/narration-kit` — but no lesson wires music in, and there is no SFX path at all.

---

## TL;DR (5 bullets)

1. **Music bed: 60-80 BPM, major key, no vocals, simple harmony, low arousal.** This is the cross-validated empirical answer for music under cognitive tasks (Frontiers 2025; Behavioral Sciences 2025). For our youngest/complex-math cues, sit the bed even lower in the mix (e-learning convention = music at ~8% of narration level, i.e. roughly -22 dB under speech).
2. **Mix numbers are consistent across ~8 sources.** Narration normalized to -16 LUFS (we publish to multiple platforms, not only YouTube), narration peaks -12 to -6 dB. Music bed -10 to -15 dB below narration when no one speaks (≈ -18 to -22 dBFS); ducked to -30 to -35 dBFS under narration. Duck depth -12 dB (standard) to -20 dB (important narration). Attack 20-50 ms, release 400-600 ms. Final mix true-peak ceiling -1 dBTP.
3. **Do ducking DETERMINISTICALLY with Remotion `<Audio volume={fn(frame)}>`, NOT a real-time sidechain compressor.** We already know every speech window (`voiceoverSpans` / cue `startFrame`/`endFrame`), so we drive a frame-keyed volume envelope with `interpolate()`. Ramps 10-15 frames (~0.3-0.5 s). This is reproducible across renders; a live sidechain is not. (sidechain `ffmpeg` numbers are still useful as the *reference target* the envelope imitates.)
4. **Where music sits on OUR timeline, keyed to cues:** an intro sting over the topic-intro card (cue `intro`, full level), one calm per-section bed that ducks under every narrated cue and breathes up in the tail gaps, and an outro resolve over the closing cue (rises to full as the last narration ends). All anchored to `cues[id].startFrame`, never absolute literals.
5. **SFX vocabulary maps 1:1 onto motion events we already emit:** `<PopIn>` entrance → soft "pop"; `<Sparkle>`/`<GlintFlash>` → light "chime/shimmer"; section/scene change or `<ShineSweep>` → "whoosh"; each counting step → short "tick"; a correct/complete beat → "ta-da". Trigger each as a one-shot `<Sequence from={cues[id].startFrame + offset}>` wrapping `<Audio>`, the SAME cue-relative math the composer already uses for visuals. Keep SFX sparse (1 motivated sound per beat, never per frame).

---

## Findings (claim -> evidence -> SO WHAT)

### F1. Under cognitive tasks, low-arousal instrumental music helps; the parameters are specific.
- **Evidence:** "low-arousal instrumental music (60-80 BPM with steady tempos and minimal harmonic complexity) improved flow states during cognitive tasks" and music "aligned with the tone and pacing" raised engagement — citing a *Frontiers* (2025) and a *Behavioral Sciences* (2025) study. Track-design rules: "No vocals… No sudden dynamic changes… Steady tempo… Simple harmony. Minor keys and complex chord progressions draw more attention than simple major-key patterns." (Song Creator Pro, summarizing the 2025 research) https://songcreator.pro/blog/ai-background-music-presentations-courses
- **SO WHAT:** This is the music-selection contract for our beds. Encode it as a brief-level/style-level constant, not a per-lesson decision: `bed = { bpmRange: [60,80], key: "major", vocals: false, harmony: "simple", dynamics: "flat", instrumentation: "soft piano + warm pads / mallet" }`. For dense-math cues, drop the bed lower (F2) rather than changing the track.

### F2. The single biggest lever is VOLUME, and e-learning wants it lower than general video.
- **Evidence:** "volume is the single most important factor. Background music in educational settings should be mixed at -10 dB to -15 dB below narration… if you can identify the melody… the music is too loud." (Song Creator Pro). The ffmpeg "audio-mixing-patterns" skill gives a content-type table: **E-learning = Narration 100% / Music 8% / SFX 40%**; Tutorial = Music 10%; Podcast = Music 5%. https://playbooks.com/skills/yonatangross/orchestkit/audio-mixing-patterns . W3C accessibility: non-speech sound should be ≥20 dB below foreground speech; BBC: mix normally then drop music a further 4 dB; e-learning during complex topics: up to **-22 dB** under narration. https://pureaudioinsight.com/blogs/content-production/background-music-volume-how-loud-should-it-be
- **SO WHAT:** Our default duck target should be at the *quiet* end because the audience is 3-8 yo learning a second-language math concept. Concrete starting envelope: bed un-ducked at -18 dBFS (≈ music 0.12-0.15 linear), ducked under narration to -32 dBFS (≈ 0.03-0.04 linear). Expose both as `bgmVolume` / `duckedBgmVolume` (props already exist on `LessonAudioLayer`). Add a verification check: "melody identifiable under narration → fail."

### F3. Mix-level targets converge across 8 independent sources.
- **Evidence:**
  - Narrator: peak -12 to -6 dB; loudness ≈ -16 LUFS for general online video; YouTube -14 LUFS. (vidpros) https://vidpros.com/fix-background-music-too-loud-video/
  - Music under narration -18 to -25 dB; music with no narration -12 to -14 dB; duck ramp ~0.5-1 s, not instantaneous; EQ-carve 800-3000 Hz by 3-6 dB. (vidpros, same)
  - dB relationships: Narration -14 LUFS, **Music bed -30 to -35 dBFS under narration, Music-only -16 LUFS, SFX -18 to -20 dB.** (audio-mixing-patterns skill)
  - VAD-driven auto-mix in production: speech → music -30 to -35 dBFS; gaps → -18 to -22 dBFS; final normalize -16 LUFS. (VidNo) https://vidno.ai/blog/auto-mix-voiceover-with-music
  - Ducking presets (TonnSDK): Light -6 dB / 50 ms / 500 ms; **Medium -12 dB / 30 ms / 400 ms; Heavy -20 dB / 20 ms / 600 ms.** https://tonn-portal.roexaudio.com/sdk/docs/post-production-features
  - Voice compression for consistency: ratio 3:1, attack 3-10 ms, release 50-100 ms; final limiter ceiling -1 dB. (omegafilminstitute) https://omegafilminstitute.com/voice-over-mixing/
- **SO WHAT:** These give us a defensible numeric config block (see Spec 1). Use **-16 LUFS** master (we are multi-platform, not YouTube-only), true-peak **-1 dBTP**, duck depth between Medium and Heavy because narration is the whole point of a lesson.

### F4. Ducking is the load-bearing technique; the right way for US is a frame-keyed envelope, not live sidechain.
- **Evidence:** Every editor source says auto-duck fixes ~90% of "music too loud" complaints (vidpros). The mechanism is sidechain compression: voice present → squash music → voice stops → music returns; typical `ffmpeg sidechaincompress=threshold=0.015:ratio=10:attack=150:release=600` then `loudnorm=I=-16` (VidNo, ffmpeg-cookbook https://ffmpeg-cookbook.com/en/articles/add-bgm/ ). BUT a Remotion-native, deterministic alternative is documented: drive `<Audio volume={interpolate(frame,[start-ramp,start,end,end+ramp],[0.4,0.15,0.15,0.4])}>` with ramps of **10-15 frames (~0.3-0.5 s at 30 fps)**. (video-audio-design skill) https://github.com/AbsolutelySkilled/AbsolutelySkilled/blob/main/skills/video-audio-design/SKILL.md
- **SO WHAT:** We already know every narration window before render (ASR gives `voiceoverSpans`; the reconciled timeline gives `cues[id]`), so we don't need to *detect* speech — we *schedule* the duck. A frame-keyed `interpolate` envelope is (a) deterministic across re-renders, (b) reproducible (key requirement), (c) trivially correct because it reads the same cue boundaries as visuals/captions. Reserve the `ffmpeg` sidechain numbers only as the perceptual target. This matches the existing `voiceoverSpans` prop on `LessonAudioLayer` — the kit's `AudioLayer` likely already builds this envelope; we must verify it uses the F3 numbers and -16 LUFS, not defaults.

### F5. Music should be placed in three roles tied to structure, not one flat bed.
- **Evidence:** Track-type table: Intro theme 10-30 s "builds energy, establishes tone"; Outro 10-20 s "resolves, feels conclusive"; Background bed 1-5 min "low-key, unobtrusive, steady"; Module/section theme 15-30 s; generate a track LONGER than the section rather than looping ("Audible loops are distracting"). (Song Creator Pro). Validate the mix at exactly 3 points: opening (does intro duck cleanly when first words start), a mid transition (does music rise in the gap then duck again), the ending (does outro resolve at full level without awkward delay). (VidNo)
- **SO WHAT:** Map directly onto our wave/cue structure: intro sting over `TopicIntroCard` (cue `intro`), one section bed per section that ducks under each narrated cue, outro resolve over the final cue. Generate beds to the *actual reconciled lesson length* (Wave 3.5 already computes total frames) so we never loop. The 3-point validation becomes a Wave 6 verification checklist item.

### F6. Avoid the classic mistakes — they map to concrete guards.
- **Evidence:** Mistake table (video-audio-design): music same volume during narration → unintelligible; SFX louder than narration → distracting (SFX 0.3-0.5, narration 0.8-1.0); no fade on music start/end → "sounds like a bug" (add 0.5-1 s fade); use WAV for SFX (MP3 can add silence padding); two simultaneous voices/lyrics → cognitive interference. EQ: carve 2-4 kHz (or 800-3000 Hz) out of music by 3-6 dB to make room for voice. (multiple) Also "Match energy to content tone — upbeat music under calm narration creates cognitive dissonance." (VidNo)
- **SO WHAT:** Bake these as lint-style checks and capability rules: (1) music must have a 0.5-1 s fade-in/out (`interpolate` at lesson edges); (2) SFX assets are WAV; (3) SFX peak below narration; (4) no lyric/vocal beds, period (reinforces F1); (5) one-time EQ-carve baked into the bed asset at authoring time (we can pre-render beds through `ffmpeg` `equalizer` once, since beds are reusable across thousands of lessons).

### F7. Practitioner reality: finding/clearing music is the time sink; generation + a small curated library wins at scale.
- **Evidence:** "Creators are wasting more time finding music than making the actual content" and royalty-free libraries "all sound the same; trending sounds get copyright claimed 2 weeks later; custom tracks 200 bucks / 6 days minimum." (Tech with Ayrass, 2026) https://youtu.be/5gUeH00rGZE?t=2 . Generative tools (Mubert Fuse, Maraca, Suno) pitch one-toggle scoring + auto-duck. Mubert Fuse explicitly offers auto-duck via sidechain with "short-form-friendly defaults." https://mubert.com/tools/fuse/features/auto-duck
- **SO WHAT:** For thousands of lessons, do NOT license per-track. Build a **tiny curated, pre-cleared bed library** (5-8 beds covering math-calm / literacy-playful / celebration, each rendered to the F1+F2+F6 spec and length-padded with `aloop`+`apad` or generated long). Keep generation (Suno/ElevenLabs Music/Mubert) as an *authoring-time* asset factory, not a per-render call (renders must stay deterministic and offline). Reusing 5-8 beds across the whole catalog is fine and even desirable for brand consistency at K-3.

### F8. Reddit practitioner sentiment was unreachable this run.
- **Evidence:** `mcp__reddit__search_reddit` returned "Access forbidden — the requested content may be private or restricted" on both attempts.
- **SO WHAT:** The practitioner tier here is covered instead by the two creator YouTube transcripts (Tech with Ayrass, Brett Albano) plus production-tool docs (VidNo, Mubert, Tonn). Re-run Reddit when access is restored to confirm the "music too loud" / "loops are distracting" complaints, which the web tier already corroborates strongly.

---

## Concrete pipeline specs (numbered, actionable)

### Spec 1 — Audio mix config block (the numbers to put straight in)
Add a lesson-agnostic constant module (e.g. `src/lesson-media/audioMix.ts`) consumed by `LessonAudioLayer`:

```
MASTER:          target -16 LUFS, true-peak ceiling -1 dBTP   (multi-platform)
NARRATION:       reference level; peak -12..-6 dB; pre-compress 3:1, attack 5ms, release 80ms
BED (un-ducked): -18 dBFS  (~0.12-0.15 linear)   // in narration gaps / intro / outro
BED (ducked):    -32 dBFS  (~0.03-0.04 linear)   // under narration  (e-learning = quiet)
DUCK depth:      ~ -14 dB (between Medium -12 and Heavy -20; narration is the lesson)
DUCK ramp:       attack 10 frames (0.33s) down, release 15 frames (0.5s) up   // frame-keyed
SFX:             peak -18..-20 dB (below narration, ~0.3-0.5 linear); WAV files
BED fade:        0.75s fade-in at lesson start, 0.75s fade-out at end
BED EQ:          pre-baked -4 dB shelf-cut across 800-3000 Hz (author-time, once per bed)
```
Touches: `src/lesson-media/LessonAudioLayer.tsx` props `bgmVolume`/`duckedBgmVolume`; `@studio/narration-kit` `AudioLayer` (verify it honors these, not its own defaults).

### Spec 2 — Deterministic frame-keyed ducking (Remotion-native, reproducible)
The composer/audio layer builds ONE music `<Audio>` whose `volume` is an `interpolate()` over the union of cue narration windows — NOT a live sidechain. For each narrated cue with narration window `[nStart, nEnd]` (from ASR `voiceoverSpans`, already cue-relative-able):

```
musicVolume(frame) = BED_UNDUCKED * product over narrated windows of
   interpolate(frame,
     [nStart - 10, nStart, nEnd, nEnd + 15],   // 10f attack, 15f release
     [1, DUCK_FACTOR, DUCK_FACTOR, 1],           // DUCK_FACTOR ≈ 0.2  (-14 dB)
     { extrapolateLeft:'clamp', extrapolateRight:'clamp' })
```
Plus a lesson-edge fade: multiply by `interpolate(frame,[0,22, total-22,total],[0,1,1,0])` (0.75s at 30fps). Reproducible across renders because every input is a known frame number. Touches: audio layer; reads the reconciled `<X>Cues` timeline + ASR spans. ZERO frame literals — all from `cues[id]` and span data.

### Spec 3 — Music placement keyed to cue boundaries (Wave 4 composer)
- **Intro sting:** `<Sequence from={cues.intro.startFrame}>` one-shot sting WAV at full level over `TopicIntroCard`; bed fades in underneath after the sting tail.
- **Per-section bed:** one bed `<Audio>` spanning the section's first cue `startFrame` to its last cue `endFrame`, ducked per Spec 2.
- **Outro resolve:** bed envelope rises from DUCKED back to UN-DUCKED beginning at `cues.<last>.endFrame - nEndOfLastNarration`, so the last chord lands as narration ends; final fade-out at lesson end.
All anchored to `cues[id].startFrame/endFrame`; never absolute master-timeline literals (matches existing discipline rule).

### Spec 4 — SFX vocabulary mapped to motion events (one-shot Sequences)
Define a lesson-agnostic SFX registry (`src/lesson-media/sfx.ts`) + capability entry; composer emits a `<Sequence from={cues[id].startFrame + offset}><Audio src=... volume=...></Sequence>` per motivated event:

| Motion event (existing primitive) | SFX | Offset rule | Notes |
|---|---|---|---|
| `<PopIn>` entrance (snap/bouncy) | soft "pop" | at `popIn.startFrame` | 1 per object; for multiplicity, stagger by the same frames as the visual `<Drag>`/stagger |
| `<Sparkle>` / `<GlintFlash>` / `<GlowPulse>` | light "chime"/"shimmer" | at FX onset | reward/attention; keep quiet |
| Section/scene change, `<ShineSweep>`, `SectionHandoff` | "whoosh" | at transition `startFrame` | one per transition |
| count step (each counted item) | short "tick" | per step frame | pitch-rises optional; cap density |
| correct/complete beat (lesson resolve, "make 10" success) | "ta-da" | at success cue `startFrame + small offset` | once per lesson; the only "big" SFX |

Rules: max 1 motivated SFX per beat; SFX are WAV; SFX peak ≤ -18 dB; never one-per-frame; SFX do NOT duck (they sit above the bed but below narration). This reuses the exact `cues[id].startFrame + offset` math the composer already uses, so it's a Wave 4 add with zero new timing model.

### Spec 5 — New wave touch-points (no new wave; extend existing ones)
- **Wave 2a (visual-design):** when declaring per-cue motion, also tag which beats are SFX-worthy (entrance/transition/count/success). Lesson-agnostic tags, not sounds.
- **Wave 3b (primitive gap-scan):** owns the bed/sting/SFX *asset* gap — if a needed bed or SFX isn't in the curated library, it's named here (same way a missing SVG primitive is). Default answer: reuse an existing bed/SFX.
- **Wave 4 (composer):** wires Spec 2/3/4 from the reconciled timeline + ASR spans.
- **Wave 6 (verification):** new checklist: (a) melody NOT identifiable under narration; (b) 3-point check (intro duck, mid-gap rise, outro resolve) per F5; (c) measured master ≈ -16 LUFS / TP ≤ -1 dB (run `ffmpeg loudnorm` print pass on the rendered MP4 audio); (d) no SFX louder than narration.

### Spec 6 — Asset factory & sourcing (author-time, NOT per-render)
- Build a curated, pre-cleared library: `public/audio/_beds/<name>.wav` (5-8 beds: math-calm 70 BPM C-major, literacy-playful 76 BPM, celebration), `public/audio/_sfx/<name>.wav` (pop, chime, whoosh, tick, ta-da), `public/audio/_stings/<name>.wav`.
- Each bed authored once to Spec 1 (EQ-carved, fade-safe, length ≥ longest expected section via generation or `aloop`+`apad`).
- Generation tools are authoring-time only: Suno / ElevenLabs Music / Mubert for beds and stings; YouTube Audio Library + freesound (CC0) for SFX. **Licensing caution for child content (open question O3):** verify each generated track's commercial-use + redistribution terms and that the provider permits use in monetized children's media BEFORE adding to the library; store the license per asset (`public/audio/_beds/<name>.license.txt`). Determinism is preserved because renders only read local WAVs.

---

## Sources

**yt-rag (deep-links):**
- Envato Tuts+ — "How to Choose the Perfect Music for Your Videos" — music must not compete with VO; "set the volume to minus 40… present yet not obtrusive"; complement vs contrast; in-program mixing of voice/music/SFX. https://youtu.be/oDjAiDUq-QY?t=550 , https://youtu.be/oDjAiDUq-QY?t=1467
- Brett Albano — "How to Make Your Videos Sound Clear" — audio ducking defined (lower bg when dialogue present, restore after). https://youtu.be/6-_TIanP9Co?t=1
- How To 1 Minute — "How to Use Audio Ducking in OBS" — compressor params: ratio 10:1, threshold -80..-20, **attack 5-10 ms, release 200-500 ms**, sidechain = mic. https://youtu.be/T4cS2iA1eXs?t=3 , https://youtu.be/T4cS2iA1eXs?t=94
- Tech with Ayrass — "How I Score My Videos in 60 Seconds" — practitioner pain: finding music > making content; royalty-free sameness; copyright claims. https://youtu.be/5gUeH00rGZE?t=2

**Web (Exa):**
- Song Creator Pro — research-backed kids/e-learning bed spec (60-80 BPM, major, no vocals, -10..-15 dB; cites Frontiers 2025 & Behavioral Sciences 2025). https://songcreator.pro/blog/ai-background-music-presentations-courses
- audio-mixing-patterns (orchestkit) — dB table, content-type mix ratios (E-learning music 8%), ffmpeg sidechain + loudnorm patterns. https://playbooks.com/skills/yonatangross/orchestkit/audio-mixing-patterns
- vidpros — narrator -12..-6 dB / -16 LUFS; music -18..-25 dB under VO, -12..-14 dB clear; 0.5-1 s ramps; EQ 800-3000 Hz. https://vidpros.com/fix-background-music-too-loud-video/
- VidNo — VAD auto-mix: speech -30..-35 dBFS, gaps -18..-22 dBFS, normalize -16 LUFS; 3-point validation. https://vidno.ai/blog/auto-mix-voiceover-with-music
- TonnSDK — ducking presets (Light/Medium/Heavy depth+attack+release), per-platform LUFS table. https://tonn-portal.roexaudio.com/sdk/docs/post-production-features
- video-audio-design (AbsolutelySkilled) — **Remotion `<Audio volume={interpolate()}>` ducking, 10-15 frame ramps, layer volume table, mistake table, WAV-for-SFX.** https://github.com/AbsolutelySkilled/AbsolutelySkilled/blob/main/skills/video-audio-design/SKILL.md
- Pure Audio Insight — -18..-20 dB rule, W3C ≥20 dB, BBC -4 dB, e-learning -22 dB on complex topics. https://pureaudioinsight.com/blogs/content-production/background-music-volume-how-loud-should-it-be
- omegafilminstitute — VO compression (3:1, attack 3-10 ms, release 50-100 ms), limiter -1 dB, EQ carve 2-4 kHz. https://omegafilminstitute.com/voice-over-mixing/
- ffmpeg-cookbook — amix + sidechaincompress + normalize=0 + alimiter; tutorial BGM 0.15-0.25. https://ffmpeg-cookbook.com/en/articles/add-bgm/
- Mubert Fuse — one-toggle auto-duck (sidechain, short-form defaults). https://mubert.com/tools/fuse/features/auto-duck

**Reddit:** unreachable this run (access forbidden) — see F8.

---

## Open questions

- **O1 — Does `@studio/narration-kit` `AudioLayer` already build the duck envelope, and with what numbers?** The wrapper exposes `bgmSrc/bgmVolume/duckedBgmVolume/voiceoverSpans` but I did not read the kit's `AudioLayer` implementation. Confirm it (a) uses a frame-keyed envelope (deterministic) not a runtime compressor, (b) honors the Spec 1 numbers / -16 LUFS, (c) accepts an SFX list. If not, that's the first build.
- **O2 — Master loudness normalization in Remotion render.** Remotion mixes tracks but does not run `loudnorm`. Decide whether to (a) pre-normalize the voice WAV and pick bed levels so the sum lands ≈ -16 LUFS, or (b) post-process the rendered MP4 audio through `ffmpeg loudnorm` as a render step. (b) is more reliable; confirm it doesn't break the "deterministic render" guarantee (it's deterministic, just a second pass).
- **O3 — Licensing for child/monetized content** for Suno API / ElevenLabs Music / Mubert and YouTube Audio Library: exact commercial + redistribution terms, and whether each permits use in monetized children's media. Could not fully verify this run (transport flaky on the last calls). Must be cleared per-asset before the library ships (store a license file per asset).
- **O4 — SFX density for K-3.** Sources cover adult/general video; the "1 motivated SFX per beat" cap is my synthesis, not a measured K-3 number. Validate with a real lesson + the existing action-aware contact sheet / a viewer check.
- **O5 — Reddit practitioner pass** still owed (O8 outage). Re-run for real-world "music too loud" / "loops distracting" / kids-content gotchas to confirm the web-tier claims.

---

## Progress

- 2026-05-29 — brief authored, not yet implemented.
- 2026-05-29 — extended by `research/music-sound-palette-2026-05-29.md` (palette + SFX + sourcing pass). Resolves **O1** (kit `AudioLayer` DOES build a deterministic frame-keyed duck at 0.14/0.04, but **loops** the bed, has **no edge fade**, and **no SFX path** — see `shared-narration/src/AudioLayer.tsx:71`) and **O3** (per-provider licensing verdicts). **O4** validated-but-unmeasured (keep the "1 SFX/beat" lint). **O5** still blocked (Reddit 403). New constraint surfaced: a **tonal-language bed-pitch guard** — no melodic bed contour under pinyin/tone-teaching narration.
