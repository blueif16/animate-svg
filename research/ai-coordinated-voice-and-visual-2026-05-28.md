# AI-Coordinated Voice + Visual — Research Brief

**Date.** 2026-05-28
**Trigger.** kp1-fen-yu-he-intro stagnates around 22s — cue `he-name`'s motion ends at frame 570 (19.0s) but its WAV-anchored boundary is frame 688 (22.9s), so the visual freezes for 3.9s while the WAV finishes `方向相反` (~22.3s) and waits in silence for the next narration `把它画下来这张图叫做分合式` at 22.95s. The existing audio-as-skeleton reconcile in `remotion-svg-primitives/src/lessons/kp1FenYuHeIntroLessonTimeline.ts` is correct about WHERE cues end; this brief pushes past that to ask what the visual track should DO during forced WAV inter-cue silence, and re-examines who should own the timeline when AI generates BOTH voice and visual.

**Companion to.** `script-animation-coordination-2026-05-28.md`. Do not re-read the audio-as-skeleton / 200ms / animatic-gate findings here; they're already in that brief.

---

## Sources

**yt-rag namespaces queried (existing corpus, 21 namespaces / 7262 chunks / 621 videos):**
- `yt_lesson_pacing` — 110 chunks, 8 videos (Kurzgesagt, 3Blue1Brown, ECAbrams, Bloop, Vane Motion, TomsProject) — re-queried beyond the prior brief
- `yt_remotion_motion` — 43 chunks, 3 videos (John Hartquist, CodingMenace, chantastic — all 2025-12 → 2026-03, all Remotion + Claude Code)
- `yt_alanbeckertutorials` — 132 chunks, 30 videos — for 12-principles "moving hold" coverage

**Exa web (high-signal, 2026 unless noted):**
- Iron Mind / Starlog — *Why We Generate Audio First in AI Video Pipelines* and *video_explainer: TTS-First Programmatic Animation* (Feb–May 2026) — explicit production architectures that generate TTS first to derive scene durations
- Synthesia Research — *Express-2* tech page (audio → Express-Animate → Express-Eval → Express-Render); production avatar pipeline conditions ALL visual on audio
- Tavus — *Phoenix-4* blog (Feb 2026); diffusion-based co-speech facial motion, streaming-friendly audio tokens drive frames
- HeyGen — *Avatar V* research page; video-reference DiT conditioned on driving audio
- Fora Soft — *AI Chatbot Video Integration: Complete Implementation Guide 2026* (Feb 2026); explicit latency budget table
- Remotion docs (`remotion.dev/docs/captions/displaying`, `remotion.dev/docs/media/audio`, `remotion-dev/remotion` PR #6930 `@remotion/elevenlabs`); Context7 `/remotion-dev/skills` returned canonical Audio + Sequence + Whisper + captions snippets
- CrePal — *TikTok-Style Captions in Remotion* (Feb 2026) — drift diagnosis (FPS mismatch, trim offsets, audio resampling)
- Yu-kai Chou — *The 200ms Rule* (Apr 2026) — referenced in prior brief; one chunk re-used here for fade-out anchoring
- ERIC EJ1480846 — *A Working Memory Reversal Effect on Design Principles? Evidence on Pauses in Video among Children* (Aug 2025) — randomized N=47, low-WMC kids benefit from imposed pauses; high-WMC don't
- AJET — *complexity-determined system pausing* (Liu et al. 2022, in 2025 follow-up); cognitive-load theory grounding for placing pauses AFTER high-element-interactivity sections
- Springer — *Strategies for facilitating processing and integration of transient information* (Liu 2022) — pauses give learners time to consolidate
- PMC — *The role of pause as a prosodic boundary marker* — German 3- and 6-year-olds; CPS develops between 3 and 6
- arXiv 2603.02655 — *Pause-Aware Decoding Strategies for Real-Time Video Commentary Generation using MLLMs* — dynamic interval-based decoding, model decides WAIT vs WRITE
- arXiv 2602.19163 — JavisDiT++, joint audio-video generation with TA-RoPE
- arXiv 2602.08682 — ALIVE (FoundationVision) — joint AV-DiT
- arXiv 2604.09057 — Tora3 — trajectory-shared kinematic prior across modalities
- Springer SyncDiT — audio-sync cross-attention 16-frame window
- ProsodyTalker (AAAI 2025) — head movements track F0, lips track content; explicit prosody decomposition
- AnimSchool — *Animating Nothing: Create Moving Holds* (Nov 2024); McWhinnie's 4 categories
- MoCap Online — *Idle Animation Game Dev Guide* (Apr 2026); 15–25 bpm breathing rate, 1–2 cm chest travel, 2–4s simple loops, 8–12s complex
- Grokipedia — *Idle animation* article (state-machine wiring, multi-cycle variation)
- Cursa — *Timing and Spacing* (start hold 4–8 frames, move 0.25–0.60s, end hold 6–12 frames)
- Brainy Papers — *Motion Design Principles* (Apr 2026); duration tiers (100ms / 400ms / 500ms) + reduced-motion swap
- ArtofStyleframe — *Visual Hierarchy in Motion Graphics* (May 2026); the "rest beat"
- Web search results for *RPM Rhythm Per Motion* (Sascha Becker, Feb 2026) — composite signals (Heaviness, Busyness, Sparkle, Beat Pulse) driving particle physics from RMS + spectral flux
- chromascope (GitHub Feb 2026) — *renderer-agnostic musical manifest* — section, key, F0, downbeats, onset_type, MFCC etc. as JSON consumed by visual layer
- AnimaSync (GoodGangLabs) — voice → ARKit blendshapes + bone idle via ONNX (V1 phonemes, V2 emotion FiLM)
- semantic-foragecast-engine — Blender Grease Pencil; LibROSA beat detection → JSON → Blender keyframes
- StudioBinder + slashfilm + VFX Science — *color script* primary sources (Lou Romano UP, Ralph Eggleston Incredibles 2)
- Studio Binder + Wikipedia + Pluralsight — 12 principles "moving hold" and "secondary action" canonical definitions
- Narration Box + SpeechGen + ElevenLabs docs + Google Cloud TTS docs — SSML `<break>` semantics, ElevenLabs `<break>` 3s cap and word-level `alignment` JSON
- Hermes `manim-video` skill (prior brief) and OrchestKit `narration-scripting` (Jan 2026) — explicit sync-symbol palette (`[!]` hard ±2 fr, `[~]` soft ±10 fr, `[>]` lead 100–300ms, `[<]` lag 100–500ms)

**Reddit.** API surfaced `Access forbidden` on r/MotionDesign, r/remotion, r/manim, r/3Blue1Brown, r/animation, r/educationaltech, r/VideoEditing — both subreddit-scoped and global search calls; we have NO Reddit signal in this brief. Don't infer practitioner sentiment from absence.

---

## Findings by focus area

### 1. AI-pipeline timeline ownership (2026)

The market has **converged on audio-first**. Every production AI explainer or talking-head stack we audited derives visual timing from the audio's intrinsic timeline, not the other way round. Differences live in *granularity* (sentence vs phoneme), not in direction.

#### 1a. TTS-first programmatic animation (the closest analogue to our pipeline)

> "video_explainer does the opposite [of most AI tools] — creating narration with word-level timestamps before a single frame exists ... it generates text-to-speech audio before creating any visuals. When you call ElevenLabs or Edge TTS APIs, modern services return not just an audio file but word-level timestamps ... a scene explaining 'neural network backpropagation' might need 8.4 seconds because that's how long the narration takes. This timestamp data becomes the ground truth for everything else."
> — Starlog, *Building an AI Video Pipeline: How video_explainer Orchestrates TTS-First Programmatic Animation* (2026-05-08, `starlog.is/articles/ai-dev-tools/prajwal-y-video-explainer/`)

> "video_explainer sends Claude the narration, visual cues, **word timestamps**, and examples of Remotion animation patterns. Claude outputs something like this ... `const attentionHighlight = spring({ frame: frame - (2.1 * fps), fps, ... });` ... When the narrator says 'attention' at 2.1 seconds, the highlight arrow animates in. No manual keyframing."
> — same article. Note the pattern: visual anchors compute `frame - (wordStartMs/1000) * fps`, which is **exactly the 200ms-rule plumbing** the prior brief flagged as missing in our composer skill.

> "Iron Mind — *Why We Generate Audio First in AI Video Pipelines*: the voiceover, once generated and transcribed with word-level timestamps, becomes a deterministic timeline that every downstream stage can derive its timing from programmatically."
> — quoted in prior brief, included here as anchor.

#### 1b. Talking-head avatar stacks: visual is a function of audio, full stop

> "At the core of Express-2 is a tightly-coupled architecture built from three advanced models: Express-Animate — a frontier foundation model for generating co-speech human gestures. Its core capability lies in producing anatomically accurate and temporally coherent motions **driven purely by audio input**. ... Express-Eval — a CLIP-like model that plays a crucial role in evaluating the alignment between input audio and the corresponding generated human motion."
> — Synthesia Research, *Express-2* (`synthesiaresearch.github.io/express-video/`)

> "an audio feature extractor analyzes audio frames and extracts tokens for the frames we want to generate. A long term memory module analyzes the incoming frame in conjunction with the past frames it saw and produces features that are passed to a diffusion head. The diffusion head takes noisy frames and generates plausible motion coefficients given the past audio features ..."
> — Tavus, *Phoenix-4: Real-Time Human Rendering with Emotional Intelligence* (Feb 2026, `tavus.io/post/phoenix-4-real-time-human-rendering-with-emotional-intelligence`)

> "Avatar V is the latest version of HeyGen's avatar video generation system. It produces high-resolution avatar videos of arbitrary length from a single reference video **and a driving audio signal**. ... Given a reference clip and an audio track, the model generates a talking-head video that preserves the speaker's identity while following the rhythm and content of the audio."
> — HeyGen Research, *Avatar V: Scaling Video-Reference Avatar Generation* (`heygen.com/research/avatar-v-model`)

#### 1c. Joint audio-video diffusion (where it goes when nobody has to own first)

> "TA-RoPE strategy to achieve explicit, frame-level synchronization between audio and video tokens ... Specifically, absolute temporal alignment is enforced along the first dimension (dimension 0) of the 3D position IDs for both audio and video tokens."
> — JavisDiT++, arXiv 2602.19163

> "MOVA: Moves beyond clunky cascaded pipelines. MOVA generates high-fidelity video and synchronized audio in a single inference pass, eliminating error accumulation. Asymmetric Dual-Tower Architecture: Leverages the power of pre-trained video and audio towers, fused via a **bidirectional cross-attention** mechanism."
> — OpenMOSS/MOVA (`github.com/OpenMOSS/MOVA`, 2026-01-29)

> "Tora3 ... uses object trajectories as a shared kinematic prior for both modalities."
> — Tora3, arXiv 2604.09057

**Implication for OUR pipeline.** Joint diffusion is academically dominant for *generative* AV, but it's the wrong tool for an *educational* pipeline whose visual is symbolic SVG (countables, axes, labeled groups) — joint AV models won't render a labeled `分合式` reliably. We are firmly in the **TTS-first programmatic animation** camp (video_explainer architecture), which validates Wave 3 (voice + ASR) → Wave 3.5 (reconcile) → Wave 4 (composer) ordering. The fix is downstream, not architectural.

#### 1d. Latency-budget pipelines (real-time talking heads) — not directly applicable but instructive

> "Latency budget (audio-in to video-out target = 800 ms): STT first-partial 120 ms — LLM turn 300 ms — TTS first chunk 130 ms — Avatar render first frame 150 ms — Network + jitter buffer 100 ms"
> — Fora Soft, *AI Chatbot Video Integration Complete Implementation Guide for 2026*

This is real-time avatar territory (Tavus CVI sub-600ms; HeyGen LiveAvatar 1–2s). Not us. But the architectural pattern "stream at every seam" reinforces that visual decisions condition on prior audio decisions — never the inverse.

### 2. WAV inter-cue silence handling — what should the visual DO?

This is where the existing brief's distilled rule #2 (per-cue beat-type tail palette) is necessary but not sufficient. The palette says how *long* the tail is; it doesn't say what *plays* during it. Four named techniques cluster from the sources:

#### 2a. Moving holds (12-principles canonical)

> "The 'moving hold' animates between two very similar positions; even characters sitting still, or hardly moving, can display some sort of movement, such as breathing, or very slightly changing position. **This prevents the animation from becoming 'lifeless'.**"
> — Wikipedia, *Twelve basic principles of animation* (May 2026 revision)

> "How do you animate a character that isn't doing much? Using moving holds! ... McWhinnie breaks down moving holds into four categories: **momentum, breathing, eye darts, and head support**."
> — AnimSchool, *Animating Nothing | Create Moving Holds* (`blog.animschool.edu/2024/11/27/`)

> "Living things are never truly still. They shift weight, breathe, notice, adjust. ... **Stillness in animation equals death.** Let your creatures breathe."
> — naturalistic-motion skill (Jan 2026, `playbooks.com/skills/dylantarre/animation-principles/naturalistic-motion`)

The 4 categories translate directly to our SVG primitives:
- **momentum drift** — the last motion's residual ease-out continues for ~10 frames into the tail, not a hard freeze
- **breathing** — 1–2 unit scale or y-translation cycle at 15–25 bpm (`yt_alanbeckertutorials` and MoCap Online numbers below)
- **eye dart** — for our pipeline this maps to *teacher mark*: a sketch-layer micro-stroke (underline, pulse) on the just-said term during the gap
- **head support** — N/A for our static SVG world, but maps to "everything in the cue's semantic group continues breathing in unison; nothing snaps to rigid"

> "Base idle loops ... Breathing animation motion is subtle — 1–2 cm of vertical travel, no more. A standing idle loop without visible breathing reads as a frozen statue, not a living character. ... 2–4 seconds for a simple breathing idle. 8–12 seconds for a more complex cycle that includes weight shift and subtle movement."
> — MoCap Online, *Idle Animation for Games* (`mocaponline.com/blogs/mocap-news/idle-animation-game-dev-guide`, Apr 2026)

For a 30fps math lesson at SVG vector scale, the analogous numbers are:
- breathing amplitude: ±0.5 to ±1.5 px (kid-eye scale) or ±0.5% scale
- breathing period: 2–4s (single layer); 8–12s if combined with secondary action

#### 2b. Rest beat / temporal whitespace (motion-design language for the same idea)

> "Motion designers refer to **'the rest beat'**, the still moment between two pieces of motion. It serves the same function as whitespace in UI: it gives the eye somewhere to recover before being asked to process the next thing. **Without rest beats, every element competes simultaneously and the viewer reads nothing.**"
> — Mira Telos, *Visual Hierarchy in Motion Graphics: 6 Key Lessons* (artofstyleframe.com, May 2026)

> "A hold is intentional stillness ... Holds are not 'dead time' — they are where comprehension happens. Use on key information so it can be read without competing motion. After a move to let the viewer register the new state (viewer confirms meaning). Before a move to build anticipation (viewer prepares for change)."
> — Cursa, *Timing and Spacing: Making Motion Graphics Feel Intentional*

This is important: **a rest beat is NOT a frozen hold**. Cursa's full table for explainer motion:
> "Set a start hold: keep it still for about 4–8 frames (at 24 fps) or 0.15–0.30 s. Move it to the new position over 0.25–0.60 s ... Set an end hold: keep it still for 6–12 frames (or longer for important text)."

So even at the motion-design level, the "hold" is 4–12 frames — NOT a 3-second freeze. At 30fps that's 0.13–0.40s. The 3.9s we saw in kp1 is 10× over the threshold at which a hold reads as a hold; past that, it reads as "broken video".

#### 2c. Anticipation toward the next cue (the cross-cue technique we explore in §5)

> "**Anticipation is a setup for the main action** in animation, which can be broken down into three elements: The setup — introducing subtle movements that signal a forthcoming major action. The build-up — increasing tension and directing viewer focus. The action — delivering the anticipated movement or event."
> — CGWire, *Anticipation in Animation (2026)*

> "Animators have a term for it: the anticipation principle. They use it to prepare the audience for an action ... A properly timed anticipation can enable the viewer to better understand a rapid action."
> — SIGGRAPH Education, *Anticipation*

This is the most underused technique in our pipeline: **the tail of cue N could host the lead-in / anticipation for the action that lands at the start of cue N+1**, transforming forced silence into a usable build-up.

#### 2d. Educational-research grounding: silence IS work for the learner

> "Pausing the parts of learning content with high element interactivity to give learners more time to deal with the information is undoubtedly the most direct way to reduce potential cognitive overload ... Inserting pauses after sections with high element interactivity could give participants sufficient time to search the parts of the paused screen mentioned in the previous narration, and then match and integrate the corresponding elements of the pictorial and verbal representations."
> — AJET, *complexity-determined system pausing* (Liu et al.)

> "Children with **low WMC had better learning outcomes when pauses were imposed**, while the imposed pauses had no effect on high-WMC learners ... [the] beneficial effect of imposed pauses depends on learners' WMC."
> — ERIC EJ1480846 (Aug 2025), randomized N=47 children

> "The 'moving hold' ... prevents the animation from becoming 'lifeless'."
> — Wikipedia (re-cited)

This is the empirical justification for keeping the tail at all — for young learners (our audience), pauses help. They do not, however, require frozen frames. The pause is **silence-of-narration plus continued-low-energy-visual**.

#### 2e. The ASR / TTS pause-aware decoding literature (LLM side of the question)

> "We propose two prompting-based decoding strategies: a fixed-interval approach, and a novel dynamic interval-based decoding approach that adjusts the next prediction timing based on the estimated duration of the previous utterance. Both methods enable pause-aware generation without any fine-tuning ... unlike fixed-interval decoding, which operates with a static number of input video frames, feedback-based decoding dynamically adjusts the length of the video segment according to the elapsed time since the last utterance."
> — arXiv 2603.02655, *Pause-Aware Decoding Strategies for Real-Time Video Commentary Generation*

The decoder DYNAMICALLY decides WAIT vs WRITE. Our analogue: the visual track should dynamically decide HOLD vs DRIFT vs ANTICIPATE based on the cue boundary type, not freeze by default.

### 3. Remotion + SVG specifically (what the framework actually wants)

Three patterns are canonical in Remotion 4.0.442+ (verified via Context7 against `/remotion-dev/skills`):

#### 3a. Audio-and-visual share a Sequence — single timeline

> "Wrap the audio in a `<Sequence>` to delay when it starts ... The audio will start playing after 1 second. ... `<Sequence>` is Remotion's general-purpose timing primitive — it offsets the `frame` value seen by all of its children."
> — `remotion.dev/docs/using-audio` and devsvideo.com (Mar 2026, both via Exa)

> "Calculate the start frame and duration from the page timing: `const startFrame = (page.startMs / 1000) * fps;` ... `<Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>`"
> — `remotion.dev/docs/captions/displaying` (May 2026)

This is the production pattern: one `<Sequence from={startFrame}>` per cue, with audio and visual children. Our composer already does this. **Confirmed: option (a) — single `<Audio src={fullNarration} />` at composition root — is fine because Remotion exposes per-Sequence frame offset; we do NOT need to split the WAV into per-cue chunks.** That had been an open question.

#### 3b. Word-highlighting reads ASR timestamps at every frame

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const currentTimeMs = (frame / fps) * 1000;
const absoluteTimeMs = page.startMs + currentTimeMs;

{page.tokens.map((token) => {
  const isActive = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
  // ... highlight if isActive
})}
```
> — `remotion.dev/docs/captions/displaying` and `remotion-dev/skills/rules/display-captions.md`

**For our pipeline this is the direct plumbing for the 200ms rule from the prior brief.** The composer can call this `isActive` check, anchor visual entrances `~6 frames` before `token.fromMs`. The data is already in `kp1FenYuHeIntroAlignedCues[i].targetTokens` — we just don't consume it yet.

#### 3c. Subtitle drift — the symptom we keep diagnosing under different names

> "Subtitle drift = captions slowly desyncing from audio. Common causes:
> 1. **FPS mismatch**: SRT generated at 30fps but rendering at 25fps causes drift. Always match FPS.
> 2. **Video trimming**: If you trimmed the start, offset caption times.
> 3. **Audio resampling**: Re-encoding audio can change duration slightly, causing long-term drift."
> — CrePal, *How to Create TikTok-Style Captions in Remotion* (Feb 2026)

We aren't hitting drift; we're hitting **freeze-during-silence**, which the same article doesn't address. Drift is a quantitative bug (off by X ms compounding); freeze is a qualitative one (visual stops being alive). These are different failure modes — keep them separate.

#### 3d. New 2026 Remotion APIs worth knowing about

- `@remotion/elevenlabs` (PR #6930 merged 2026-03-30) — `elevenLabsTranscriptToCaptions()` converts the ElevenLabs Speech-to-Text `timestamps_granularity: "word"` response directly into the `Caption[]` shape. Throws a helpful error if timing is missing.
- `@remotion/whisper-web` — in-browser local Whisper for transcription with no API key
- `@remotion/install-whisper-cpp` — Node-side Whisper.cpp install + `tokenLevelTimestamps: true` + `toCaptions()` postprocessing
- `remotion-captioneer` (community, neutral-Stage, Mar 2026) — adds `useBeatPulse()` / `useVolume()` / `useEnergy()` hooks via `<AudioSyncProvider>`. Direct mapping for our focus area 6.

#### 3e. Practitioner anecdotes from the yt-rag remotion namespace

> "Run the `/transcribe` command on each clip to generate **word-level timestamps**. Next, update the transition durations for each animation so that the different text fades in at the correct time. This command uses the **Deepgram API** to generate word-level timestamps."
> — John Hartquist, *How I Vibe Code Technical Videos With Claude Code and Remotion* (2025-12-06, `youtu.be/z7Bkf3Vc63U?t=373`)

This is independent confirmation of the video_explainer architecture from a different Remotion-using team. Word-level ASR → frame-derived animation timing is the dominant 2026 pattern. We are aligned.

> "[lilting.ch demo] The mechanism switches the character's mouth based on audio volume. `visualizeAudio` from `@remotion/media-utils` gets the volume level, and the mouth opens when it crosses a threshold ... Mouth switching too fast → Switch every few frames (6-frame interval) ... Volume smoothing → Average over 4 frames."
> — lilting.ch, *Making an Explainer Video with Remotion + VOICEPEAK* (Jan 2026)

Concrete data point: 4-frame smoothing window over `visualizeAudio` is the de-facto practitioner number for "real-time" audio-driven animation in Remotion. Useful when we wire focus area 6 (prosody-driven visuals).

### 4. Adaptive tail from script semantics — "is anyone inferring beat type?"

Yes, several pipelines do this, all in early 2026. The pattern is: LLM tags lines with sync semantics, downstream resolves tag → tail length.

#### 4a. Explicit sync-symbol palettes from LLM-narration skills

> "Type — Symbol — Usage — Precision
> Hard Sync — `[!]` — Word lands on action — ±2 frames
> Soft Sync — `[~]` — Word near action — ±10 frames
> Window Sync — `[...]` — Word during scene — Flexible
> **Lead Sync — `[>]` — Word before action — 100–300ms early**
> **Lag Sync — `[<]` — Word after action — 100–500ms late**
> ...
> Include pause time: Pauses: `[0:04.000] 300ms breath pause` ; `[0:08.500] 500ms dramatic pause`"
> — OrchestKit `narration-scripting` skill, *Hard Sync vs Soft Sync vs Lead Sync vs Lag Sync* (Jan 2026, `playbooks.com/skills/yonatangross/orchestkit/narration-scripting`)

This is the exact tag set our visual-design.md schema should adopt for per-cue beat marking. Note it explicitly distinguishes lead (visual leads audio) from lag (visual follows audio) — orthogonal to whether the cue is an aha-moment.

#### 4b. The Hermes `manim-video` rate table (prior brief)

Re-cited because it's the cleanest existing per-beat-type lookup table. Combined with §4a we get:
- pedagogy.md flags "this is the aha moment" → visual-design.md sets `beat: aha` and `sync: lead` → reconcile picks 2.5–3.0s tail + 200ms lead for label entrance
- pedagogy.md flags "transitional setup" → `beat: setup`, `sync: window` → 0.3s tail + flexible timing

#### 4c. Pause-aware MLLM decoding — LLM dynamically chooses to be silent

> "After generating an utterance at time t_i, we estimate its speaking duration based on word count and a fixed speech speed rate. The next prediction time t_{i+1} is then scheduled immediately after this delay. ... feedback-based decoding dynamically adjusts the length of the video segment according to the elapsed time since the last utterance. ... model with sufficient visual context to capture what has changed since the previous utterance — enabling more accurate and context-aware [generation that can] remain silent when appropriate."
> — arXiv 2603.02655

The directly transferable idea: the **LLM that writes our cue narration could also tag each cue with a beat-type AND a target tail**, so Wave 2b ships not just text but `(text, beat, syncOffsetMs, tailMs)` per cue, and reconcile is purely mechanical.

#### 4d. TTS-side pause control (we already half-do this; could go further)

> "Add a `<break>` SSML tag ... Break time should be described in seconds, and the AI can handle pauses of up to 3 seconds in length."
> — ElevenLabs Prompting Docs

> "Sets the strength of the output's prosodic break by relative terms. Valid values are: 'x-weak', 'weak', 'medium', 'strong', and 'x-strong' ... The stronger boundaries are typically accompanied by pauses."
> — Google Cloud TTS SSML docs (`docs.cloud.google.com/text-to-speech/docs/ssml`)

> "Pauses can be ANY length: 0.1s to 60s+ (yes, even a full minute!)"
> — Kokoro-TTS-Pause, GitHub (Oct 2025)

For Gemini TTS (our voice engine), SSML-style break tags are not the primary control surface. **Practitioner consensus from Narration Box (Nov 2025)**:
> "Enbee V2 voices ... automatically inserts pauses. It also provides one click pause insertion for extra control. This eliminates manual waveform editing entirely."

The pattern emerging is **let the TTS write the natural inter-sentence pause, then reconcile a small additional visual-only tail on top if the beat is an aha-moment**. NOT "force a 3s SSML break and try to hold a still frame through it" — the natural TTS inter-cue silence at end-of-sentence prosody already exists.

### 5. The novel question: cross-cue tail assignment

> "Motion-dominated cues don't need a tail — the motion IS the beat. Should `cueFrames = motionFrames` (no tail) for those, with the 'aha tail' attached to the FOLLOWING cue's lead-in?"
> — prior brief, open question 3

I could not find anyone doing this *exactly*, but the closest precedent is the **anticipation principle as a cross-cue tool**. Treat the next cue's lead-in (anticipation phase) as the previous cue's "tail". This swaps a stillness for a build-up.

> "Anticipation acts as a setup for the main action in animation ... The setup — introducing subtle movements that signal a forthcoming major action. The build-up — increasing tension and directing viewer focus. The action — delivering the anticipated movement or event."
> — CGWire (re-cited)

> "Most of the time, the anticipation matches the action. **Big anticipation — big action; small anticipation — small action.**"
> — Larry's Toon Institute, *Anticipation*

In our pipeline, this would mean:
- Cue N has `beat: motion-dominated`, `tail: 0` (motion is the beat, no static hold)
- Cue N+1 has `lead: anticipation-Xms` (the `Xms` lives at the END of cue N's window, before N+1's narration starts)
- The composer animates N+1's lead-in DURING N's tail-zero gap. Net result: no freeze, no pad, but a continuous build-up into the next cue.

The closest existing technique in motion-design language is the **moving hold's "drift / momentum" category** (AnimSchool §2a): the last motion's residual continues for ~10 frames before transitioning into the next cue's anticipation. This gives us a clean two-phase model for cross-cue tails:
- **drift phase** (frames 0..~10 of the tail): finish the previous motion's ease-out and decay
- **anticipation phase** (frames ~10..end of tail): start the next cue's lead-in / setup

The Cursa numbers are useful: "start hold 4–8 frames + move 0.25–0.60s" — that's the actual shape of an anticipation built across the cue boundary.

No source explicitly tells you "stop using a tail constant and use a lead-in on the next cue instead". But the principle is well-defined and the mechanics are uncontroversial. **This is a finding we can ship without further validation, but the prior brief's open question is correctly identified as new ground.**

### 6. Prosody-driven visuals — visuals condition on the WAV waveform, not just timestamps

This is where the AI-pipeline 2026 stack has the most novel-but-stable techniques.

#### 6a. ProsodyTalker — explicit F0 vs content decomposition

> "we discern that **head movements correlate with the fundamental frequency (F0) of speech prosody**, while **lip movements align with the language content**. These observations motivate us to propose a novel framework, dubbed ProsodyTalker, that concurrently synthesizes lip and head movements, grounded in the principles of prosody decomposition. The core idea is first to adopt information perturbation to **explicitly decompose the speech prosody into pose-related F0 and lip-related language content**."
> — Li/Lv/Liu/Meng/Sun/Zhang, *ProsodyTalker: 3D Visual Speech Animation via Prosody Decomposition*, AAAI 2025 (DOI 10.1609/aaai.v39i5.32542)

This is the cleanest published example of "different aspects of the visual track condition on different aspects of the audio track":
- **content (phonemes / words)** drives discrete events — chip labels, term reveals
- **F0 / prosody envelope** drives continuous expressive variation — breathing amplitude, slight scale pulse on emphasized syllables, sketch-mark wiggle strength

#### 6b. The Web Audio API + Remotion bridge already exists

> "Spectrum Bar Visualization: Use `visualizeAudio()` to get frequency data for bar charts. Bass-Reactive Effects: extract low frequencies for beat-reactive animations. `const lowFrequencies = frequencies.slice(0, 32); const bassIntensity = lowFrequencies.reduce((sum, v) => sum + v, 0) / lowFrequencies.length; const scale = 1 + bassIntensity * 0.5;`"
> — `remotion-dev/skills/rules/audio-visualization.md` (verified via Context7)

> "Frame-perfect animations synchronized to audio. No more manually timing keyframes. Beat-Reactive Hooks: `const pulse = useBeatPulse(); const volume = useVolume(); const energy = useEnergy();`"
> — remotion-captioneer (Mar 2026)

`@remotion/media-utils` already exposes `visualizeAudio()` (FFT bins) and `getWaveformPortion()` (RMS / volume). For our purposes:
- `volume` (RMS over the current Remotion frame's audio window) → continuous breathing-amplitude modulator
- `useBeatPulse` (decaying envelope on transient detection) → micro-flash on syllabic emphasis
- `frequencies.slice(low_band)` → loudness of emphasized syllables (useful for sketch-boil amplitude)

The `lilting.ch` Remotion+VOICEPEAK explainer (cited §3e) is the canonical practitioner data point. **6-frame switching interval, 4-frame smoothing window** — that's our defaults to start at.

#### 6c. The renderer-agnostic musical manifest pattern

> "Most visualizers bind an FFT snapshot directly to a visual frame. Chromascope builds a **musical manifest** — a versioned, frame-accurate JSON document that answers musical questions. ... The manifest is renderer-agnostic. One analysis pass powers all renderers."
> — chromascope, GitHub (`github.com/reversegremlin/chromascope`, Feb 2026)

Chromascope's manifest schema (for music; transferrable to speech):
- `f0_hz`, `f0_voiced`, `pitch_register`
- `onset_type` (transient / percussive / harmonic), `onset_sharpness`
- `percussive_impact`, `harmonic_energy`, 7 frequency bands (sub-bass → brilliance)
- `mfcc`, `mfcc_delta`
- normalized [0,1] **primitives**: `impact`, `fluidity`, `brightness`, `pitch_hue`, `texture`, `sharpness`

For speech the analogous primitives would be:
- `emphasis` (RMS spike vs running mean) — when narrator stresses a syllable
- `confidence` (ASR token confidence) — when the term is technical / phonologically uncertain
- `pitch` (F0 hz) — when prosody rises (question, surprise) vs falls (statement closure)
- `boundary` (pause-marker likelihood from voiced/unvoiced + F0 break) — natural sentence ends

These are computable post-Wave-3 from the WAV + ASR alignment. They could be added to `asr-alignment.json` as a `prosody[]` array indexed by ASR-frame, consumed by Wave 4 composer + sketch-layer.

#### 6d. AnimaSync — voice → full-body animation (one-shot for context)

> "Most lip sync engines stop at mouth shapes. AnimaSync goes further — it treats voice as the **complete animation source** ... Voice energy & pitch → expression mapping ... Facial Expression: Emotion-driven brows, cheeks, eyes — Voice energy & pitch → expression mapping ... Body Motion: Idle breathing, speaking gestures — Embedded VRMA bone clips with LoopPingPong idle + asymmetric crossfade (0.8s in, 1.0s out)"
> — GoodGangLabs/AnimaSync README (GitHub, 2026)

Notable: a one-shot from `voice energy + pitch` to **eye blinks (stochastic, 2.5–4.5s intervals, 15% double-blink)**, idle body pose, expressive amplitude. For our SVG kids-math world, the analogue is well-defined:
- voice RMS → breathing amplitude of the current cue's primary visual group
- voice F0 spike → micro-pulse on the just-named term
- voice silence (>200ms, voiced=false) → drift / hold-with-breath state

This is the clearest map from "AI controls voice and visual" to "the visual track listens to the WAV in real time during rendering, not just to the cue timestamps".

### 7. What's the AI-pipeline equivalent of a "color script"?

The color script (Pixar) is a *pre-production* artifact that lays out emotional arc, mood, and color tone across the entire film, before a single frame is animated. The closest 2026 AI-pipeline equivalents are:

#### 7a. The cue-table as emotional arc

> "A color script, in its simplest form, is a visual roadmap of a film's story, told through the strategic use of color ... Conveying emotional arc — Establishing narrative rhythm — Visualizing scene transitions"
> — StudioBinder, *What is a Color Script*

For us, the cue table in `visual-design.md` (cue ID → zones → motion budget → beat type → identity-invariant) IS the analogous artifact. The "rhythm" the color script encodes maps directly to our per-cue beat-type tagging from §4. **The brief's distilled rule #2 (beat-type palette) is structurally a color script for tempo instead of color.**

#### 7b. The "audio-led editing" → "AV-script-led pipeline"

> "in motion design especially when driven by audio, we want to edit before we start building things ... since this is an audio driven piece the audio has to inform those cuts and inform those choices."
> — ECAbrams, *Audio Driven Workflows in Motion Design* (re-cited from prior brief)

For us, the equivalent is the **pedagogy.md → script-cues.json → frozen WAV → reconciled cue timeline → composer** chain — every visual choice descends from a narration choice that descends from a pedagogy choice. We *already do* the audio-led equivalent of color-script planning; the gap is making it as readable-at-a-glance as a Pixar color script.

#### 7c. The "narration-as-source-of-truth" pattern (concrete 2026 instance)

> "Each chapter has a `narrations.ts`. It stores the step count and corresponding narration text. The skill requires the maximum step used in the chapter `.tsx` to align with `narrations.length`. This prevents drift across `script.md`, `outline.md`, chapter code, `chapters.ts`, and audio files. For video production, keeping narration, screen, audio, and step count aligned is essential."
> — `web-video-presentation` agent skill (knightli.com, May 2026)

This is the same insight, restated: **the narration file is the timeline contract; the visual file is the consumer**. Our `script-cues.json` → generated timing module → `LessonTimeline.ts` is structurally identical.

#### 7d. The musical-manifest pattern (already cited §6c)

Chromascope's renderer-agnostic manifest is the clearest current example of "compile audio to a structured visual-aware artifact, then let multiple visual layers read it". A speech-side equivalent would let composer, sketch-layer, and any future style-overlay all consume the same `asr-alignment.json + prosody` artifact without re-deriving it.

---

## Distilled rules (to fold into `script-animation-coordination-2026-05-28.md`)

These extend that brief's rules 1–5, NOT replace them. The audio-as-skeleton, per-cue tail palette, 200ms lead, animatic gate, and co-designed AV script all still stand.

### 6. **No frame is ever truly frozen — the tail is a moving hold.**

A "static hold" of more than ~12 frames (0.4s at 30fps) reads as broken video. Even an aha-moment 2.5-second tail must use a moving hold:
- **drift phase** (first ~6–10 frames): the last motion's ease-out residual decays — easing curve continues, doesn't snap
- **breathing phase** (rest of the tail): every load-bearing primitive in the cue's semantic group breathes at 15–25 cycles/min, amplitude 0.5–1.5px or ±0.5% scale (kid-eye scale; tune)
- **optional micro-mark** (during breathing): a sketch-layer mark (underline, faint pulse) on the just-named term, ≤0.6s, exits before next narration

Composer rule: the only literal frozen frame in a cue is the very last frame before the next cue's first motion. Everything else breathes. (Maps to the moving-hold 4-category canon from AnimSchool / 12 principles.)

### 7. **Cross-cue tail handoff: the next cue's lead-in IS the previous cue's tail.**

When cue N is motion-dominated (`beat: motion-dominated`), set `tailFrames = 0` in the reconcile. Push the tail budget to the START of cue N+1 as **anticipation / lead-in** — visual prep for the next narration's first word, executed during the natural WAV gap.

This collapses two failure modes:
- "motion-dominated cue freezes for 1–2s after its own motion ends" (kp1 fenheshi-intro)
- "next cue snaps in with no anticipation" (cognitive jolt)

into a continuous build-up. Visual-design.md gains a new field `leadInMs?: number` per cue; reconcile distributes any positive `leadInMs` of cue N+1 backward into cue N's window. Composer animates the anticipation in the cue-N owned frames just before the boundary.

### 8. **Visual track listens to the WAV in real time, not just to cue timestamps.**

Wave 3 already produces a WAV + ASR alignment. Extend it (cheaply) to compute a **per-frame prosody signal** at render-FPS resolution and store it alongside ASR alignment. Minimum useful signals:
- `rms[frame]` — Web Audio API getByteTimeDomainData RMS at the frame
- `f0Hz[frame]` — coarse F0 via autocorrelation or via Whisper-supplied tokens
- `voiced[frame]` — boolean from energy threshold
- `boundary[frame]` — heuristic: voiced→unvoiced transition + ASR token gap > 250ms

Composer + sketch-layer read these as continuous modulators:
- breathing amplitude scaled by `1 - voiced[frame]` (more breath in silence, less during speech)
- sketch-mark wiggle amplitude scaled by `rms[frame]` (lively during emphasis)
- micro-pulse on emphasized SVG elements when `rms[frame]` spike > rolling mean + 1σ

This is the `<AudioSyncProvider>` pattern from `remotion-captioneer` + `visualizeAudio()` from `@remotion/media-utils`. Existing Remotion idiom; no new dependency.

### 9. **Per-cue beat type comes from pedagogy.md, not eyeball — and includes a sync flag.**

Extend the visual-design.md per-cue row from the prior brief's rule #2 to include both a beat type AND a sync flag:

| Field          | Values                                                | Drives                                      |
| -------------- | ----------------------------------------------------- | ------------------------------------------- |
| `beat`         | setup / supporting / term-land / aha / motion-cont    | tail length (per prior brief rule #2)       |
| `sync`         | hard \| soft \| window \| lead \| lag                 | composer offset for label entrance         |
| `leadInMs?`    | ≥ 0 (default 0)                                       | anticipation phase consumed from prev tail |
| `breathScale?` | 0..1 (default 0.5)                                    | amplitude multiplier for moving-hold breath|

Borrowed sync-flag palette from OrchestKit `narration-scripting`; `leadInMs` is novel to this brief; `breathScale` lets quiet primitives (axes, the lesson title) breathe less than focal primitives (countables, the current term).

### 10. **`asr-alignment.json` is the speech-pipeline analogue of Chromascope's musical manifest.**

Treat it as the renderer-agnostic compiled-audio artifact. Composer reads it, sketch-layer reads it, future style-overlay reads it — none of them re-derive timing or prosody from the WAV. This is the "color script" equivalent: a static, versioned, frame-accurate, contract-shaped artifact between Wave 3 (audio) and Wave 4 (visual). Wave 3.5 reconcile is the function that compiles cue-level decisions into this manifest.

### 11. **Audio-first is the right architecture for symbolic SVG explainers; do not chase joint AV diffusion.**

JavisDiT++ / ALIVE / MOVA / SyncDiT / Tora3 / Sora-2 / Veo-3 produce excellent natural-video AV, but they cannot reliably render labeled symbolic vector content (axes, numerals, `分合式` as a typeset term). The TTS-first programmatic animation pattern (video_explainer, Hartquist's Claude+Remotion, lilting.ch, narrationscripting skill, web-video-presentation skill) is the right cluster for us. Our current architecture matches; this brief should be cited next time anyone proposes "let's let an AV model generate the whole lesson".

---

## Open questions (carry forward)

- **§6 prosody plumbing: build-time vs render-time.** Should `prosody[]` be precomputed at Wave 3 and serialized into `asr-alignment.json` (deterministic, render-cacheable), or computed at render time via `visualizeAudio()` (less plumbing, but couples render to Web Audio)? Lean: precompute; it's cheap, deterministic, and frees Wave 4 from owning DSP.
- **§7 cross-cue tail handoff: where does `leadInMs` live?** Naturally it's a property of cue N+1 (the next cue knows how long it needs to anticipate itself). But it consumes time from cue N's tail budget. Reconcile must own the math; cleanest API is probably "visual-design declares both `tailMs` per cue AND `leadInMs` per cue, reconcile redistributes". Worth a focused doc edit before implementation.
- **§8 listening-to-WAV-at-render-time bandwidth.** For a 49s 30fps lesson that's 1470 frames × 4–8 floats ≈ a few KB; trivially serializable. But this changes the WAV from "frozen contract" to "frozen WAV + derived prosody manifest" — make sure the verification skill knows to compare against the manifest, not just match-score the transcript.
- **§9 sync flag elicitation.** The OrchestKit sync palette presupposes a human or LLM author tags each cue. Where exactly does the tag come from? Proposal: Wave 2b (audio-captions) emits a per-cue `(beat, sync, leadInMs, breathScale)` annotation alongside narration. Means audio-captions reads pedagogy.md *more* carefully than today; need a spec edit to the `lesson-audio-captions` skill.
- **§5 versus §2a vocabulary collision.** "Tail" historically meant a held still after motion ends. With cross-cue handoff, "tail" is partly motion-residual + partly next-cue-anticipation. Worth re-naming in code — perhaps `holdFrames` for the literal still portion (≤12) and `bridgeFrames` for the rest of the cue-N → cue-N+1 window with explicit phases. Avoid the "tail" overload before it becomes a debug-time landmine.
- **Reddit signal is missing.** API failed on every subreddit attempt for this brief. If practitioner sentiment is important for future revisions, route via `mcp__reddit__browse_subreddit` instead of `search_reddit`, or use the Reddit public RSS / JSON endpoints via WebFetch as fallback. Don't infer consensus from absence.

---

## Progress

(Section added per CLAUDE.md "Research → implementation logging" rule. Update when items below ship.)

- *(future)* Rule #6 moving-hold tail (no frozen frames) — pending composer skill spec edit + breathing primitive (or `<Breathe>` capability reuse — already in CAPABILITIES.md).
- *(future)* Rule #7 cross-cue lead-in / anticipation handoff — pending visual-design.md schema edit + reconcile algorithm extension in `kp1FenYuHeIntroLessonTimeline.ts` + composer prop wiring.
- *(future)* Rule #8 prosody manifest + `<AudioSyncProvider>` plumbing — pending Wave 3 script extension to emit `prosody[]` + composer/sketch-layer consuming hooks.
- *(future)* Rule #9 per-cue `(beat, sync, leadInMs, breathScale)` annotation in visual-design.md and `lesson-audio-captions` skill — pending skill spec edits.
- *(future)* Rule #10 manifest as renderer-agnostic contract — partly already true; needs verification-skill update to inspect manifest, not just transcript.
- *(future)* Rule #11 architectural decision recorded — paste-friendly snippet ready for any future "should we use Sora/Veo for lessons" discussion.
