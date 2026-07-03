# remotion-superpowers — vendor scan (2026-07-03)

https://github.com/DojoCodingLabs/remotion-superpowers @ 9cd0466 — a Claude Code plugin (skills + slash-commands + agents, pure Markdown) codifying an agent-driven Remotion video-production practice: TTS-first timing, Whisper captions, music ducking, MCP-tool orchestration.

## What this repo is

A **practice-codification repo**: zero runnable source, no `src/`, no tests, no CI (`.github/` absent), shallow clone shows a single visible commit ("Bump version to 2.1.0 for marketplace update"). Contents: 1 production skill with 18 rule files (`skills/remotion-production/rules/*.md`), 13 slash-commands (`commands/*.md`), 3 agent prompts (`agents/*.md`), plus `hooks/hooks.json` PreToolUse guards that verify MCP API keys before any `generate_tts|generate_music|...` call. The "mechanisms" here are prose rules with embedded (never-compiled) TSX snippets — concrete numbers and orderings are the value; several snippets contain bugs that would fail Remotion's determinism rules (see §C). MIT, by Dojo Coding Labs, marketed as a Claude Code marketplace plugin.

## A. Layout & overlay prevention

**Coverage note / proven NONE for programmatic measurement.** This repo has NO text-measurement, no fit-to-box, no collision detection. Searches run over all `.md` in `skills/`, `commands/`, `agents/`:
- `grep -rniE "layout-utils|fitText|measureText|fillTextBox|text-wrap|clamp\(" ...` → **0 hits** (no `@remotion/layout-utils`, no canvas measurement).
- `grep -rniE "overflow|overlap|collision|bounding|getBBox" ...` → only prose hits: "Text in safe zones (not overlapping platform UI)" (`agents/post-producer.md:44`), "Transitions OVERLAP adjacent scenes" (`commands/add-transitions.md:102`), "Don't overlap UI" (`skills/remotion-production/rules/captions-workflow.md:167`).
Overlap prevention is done by **declarative safe-zone percentages + font-size floors + a post-render AI review loop**, never by measurement. The mechanisms that DO exist:

### A1. Platform safe-zone percentages for captions/text

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/captions-workflow.md:154-167` and `vendor/remotion-superpowers/commands/create-short.md:128,156`

**What it does:** Positions captions by platform-specific screen-percentage bands so text never collides with platform UI chrome (like/share buttons, subtitle areas). Vertical shorts additionally confine ALL text to the center 60% of the frame. These are the repo's only overlay-prevention rules — declared zones, not measured boxes.

**Load-bearing code:**
```
## Positioning for Platforms

- **TikTok/Reels**: Bottom 15-25% (above UI controls)
- **YouTube**: Bottom 5-10% (standard subtitle area)
- **YouTube Shorts**: Same as TikTok
- **General**: Center of screen for maximum impact
```
and (`create-short.md:128`): `- Keep text in the center 60% of screen (safe zone for platform UI)`

**Transferable lesson:** Encode safe zones as named percentage bands per output target (our zones declaration in visual-design already does this for teaching content; the per-platform band table is a cheap extension for any social-format export).

### A2. Font-size floors + typography scale per format

**Where:** `vendor/remotion-superpowers/commands/create-short.md:124-127`; `vendor/remotion-superpowers/skills/remotion-production/rules/captions-workflow.md:163-166`; `vendor/remotion-superpowers/agents/post-producer.md:98`

**What it does:** Instead of fitting text to a box, the repo commits to minimum/band font sizes per role and format, plus a contrast rule (shadow or highlight). Legibility failures are then caught in review ("Text too small → Increase fontSize, minimum 48px for mobile", post-producer.md:98).

**Load-bearing code:**
```
**Typography for vertical:**
- Title text: 72-96px bold (fills width)
- Body text: 48-64px
- Captions: 56-72px bold with shadow
```
and (`captions-workflow.md:164-165`):
```
2. **Font size matters** — At least 48px for mobile, 64px+ for TikTok style
3. **High contrast** — White text with dark shadow, or colored highlight on dark
```

**Transferable lesson:** A role-based type scale with hard px floors (48px mobile minimum) is a checkable gate — our `lesson:check` legibility gate could adopt the explicit per-role floor table rather than a single threshold.

### A3. Intrinsic flex/grid layouts instead of fixed pixel grids

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/data-visualization.md:31-47,152-166`; `vendor/remotion-superpowers/skills/remotion-production/rules/animation-presets.md:77`

**What it does:** Every multi-element layout in the repo is flexbox/CSS-grid with fractional units (`flex: 1`, `1fr 1fr`, `flexWrap: "wrap"`), so element count changes redistribute space instead of overflowing. Bars normalize against `maxValue` so data range never breaks the layout; word-reveal text wraps via `flexWrap`.

**Load-bearing code:**
```tsx
const maxValue = Math.max(...data.map((d) => d.value));
return (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 400 }}>
    {data.map((item, i) => {
      ...
      <div style={{ height: height * (item.value / maxValue) * 300, ... }} />
```
and (`data-visualization.md:152-156`):
```tsx
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
  gridTemplateRows: "1fr 1fr", gap: 24, padding: 40,
  width: "100%", height: "100%" }}>
```

**Transferable lesson:** Normalize data to a max and let flex/grid own distribution — count/value changes cannot overflow. Matches our "layout is a small composition of primitives, not a fixed template" rule; validates fr-unit zones over absolute pixel slots.

### A4. Composition-size-driven sizing via `useVideoConfig()` + overlay layering discipline

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/3d-content.md:23,43`; `vendor/remotion-superpowers/skills/remotion-production/rules/visual-effects.md:21-29,178-179`

**What it does:** Anything full-bleed reads `width`/`height` from `useVideoConfig()` rather than hardcoding 1920×1080, so the same component renders correctly at 16:9 and 9:16. Decorative overlays (light leaks, grain, vignette) are always `position: absolute` + `pointerEvents: "none"` layers ON TOP, kept out of content flow so they can never displace content.

**Load-bearing code:**
```
1. **`<ThreeCanvas>` MUST have `width` and `height` props** — Use `useVideoConfig()` values
```
and (`visual-effects.md:178`):
```
- **Layer effects on top** — Use `position: absolute` and `pointerEvents: "none"`
```

**Transferable lesson:** "Decoration is an absolutely-positioned top layer, never in content flow" is the CSS-land twin of our decoration-outside-measured-groups law — same separation, enforced structurally.

### A5. Asset aspect-ratio matching matrix

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/image-generation.md:62-71`; `vendor/remotion-superpowers/commands/create-short.md:74`

**What it does:** Every sourced/generated asset must be requested at the composition's aspect ratio up front (a 4-row format table; Pexels searches forced to `orientation: portrait` for 9:16), preventing letterbox/crop overflow at composition time rather than fixing it in layout.

**Load-bearing code:**
```
| Format | Aspect Ratio | Dimensions | Use Case |
|---|---|---|---|
| Landscape (default) | 16:9 | 1920x1080 | YouTube, presentations |
| Portrait | 9:16 | 1080x1920 | TikTok, Reels, Shorts |
| Square | 1:1 | 1080x1080 | Instagram, thumbnails |

Always match the image aspect ratio to your Remotion composition's dimensions.
```

**Transferable lesson:** Push format constraints upstream into asset *acquisition* parameters (generation prompt / stock query), so layout never has to rescue a wrong-shaped asset.

### A6. Layout-shift prevention for animated numbers + overshoot clamping

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/data-visualization.md:141,172`; `vendor/remotion-superpowers/skills/remotion-production/rules/animation-presets.md:195`

**What it does:** Two micro-rules that stop animation-induced layout breakage: counters use `fontVariantNumeric: "tabular-nums"` so digit changes don't reflow neighbors, and every `interpolate` carries `extrapolateLeft/Right: "clamp"` so springs/eases can't push elements past their intended endpoint (off-screen or over a neighbor).

**Load-bearing code:**
```
- Use `fontVariantNumeric: "tabular-nums"` for counters (prevents layout shift)
```
and (`animation-presets.md:195`):
```
- **Always clamp** — Use `extrapolateLeft/Right: "clamp"` to prevent overshoot
```

**Transferable lesson:** Tabular-nums on any animated numeral is free insurance for our counting primitives; "always clamp" is the cheap complement to our measured-bbox gate (which exists precisely because easing overshoot escapes linear estimates).

### A7. Overlap detection outsourced to a post-render AI review loop

**Where:** `vendor/remotion-superpowers/agents/post-producer.md:42-46,94-105`; `vendor/remotion-superpowers/commands/review-video.md:110-125`

**What it does:** The only *check* that text is readable and in safe zones is post-render: TwelveLabs "watches" the MP4, an agent scores it /10 against a checklist ("Text in safe zones (not overlapping platform UI)", "Text is readable at target resolution"), and drives a Render → Review → Fix loop until 8+/10 and no CRITICAL/MAJOR issues.

**Load-bearing code:**
```
**Platform Readiness:**
- Correct aspect ratio for target platform
- Text in safe zones (not overlapping platform UI)
```
and (`post-producer.md:98,104`):
```
| Text too small | Increase fontSize, minimum 48px for mobile |
| Poor text contrast | Add text shadow or background behind text |
```

**Transferable lesson:** The issue→exact-Remotion-fix table (symptom to code-level remedy) is a good pattern for our verification node's report format; but relying ONLY on post-render vision review is what our bbox-manifest pre-filter exists to avoid.

## B. Voice-visual coordination

### B1. Voiceover-FIRST ordering — audio drives all timing

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/production-pipeline.md:20-33`; `vendor/remotion-superpowers/skills/remotion-production/SKILL.md:73`; `vendor/remotion-superpowers/agents/video-director.md:44-49`; `vendor/remotion-superpowers/skills/remotion-production/rules/voiceover-sync.md:94`

**What it does:** Hard pipeline ordering: generate TTS narration before any visual or music work; record its returned duration; the composition length and every scene budget derive from it. Music is explicitly generated AFTER voiceover ("you need to know the video duration", music-scoring.md:101) and made slightly longer, trimmed in composition.

**Load-bearing code:**
```
## Step 2: Generate Voiceover (if needed)

Voiceover drives the timing of everything else. Generate it first.
...
**Record the duration** — this determines the composition length.
```
and (`SKILL.md:73`):
```
1. **Audio drives timing** — Generate voiceover first, get its duration, then set composition length to match.
```

**Transferable lesson:** Independent confirmation of our frozen-audio-first architecture; the useful extra is the explicit *asset ordering* (voice → music → SFX → footage → images, video-director.md:44-49) as a one-line contract every node can check.

### B2. WPM estimation for scene segmentation (~150 WPM)

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/voiceover-sync.md:32-48`

**What it does:** Pattern 1 splits the script into sentences and budgets frames per scene from a words-per-minute constant BEFORE audio exists: ~150 WPM = 2.5 words/second, converted to frames at 30fps and laid end-to-end as a `SCENES` array with `startFrame`/`durationFrames` literals.

**Load-bearing code:**
```tsx
// Script: "Welcome to our app. It makes your life easier. Try it today."
// ~150 WPM = 2.5 words/second
// Segment 1: "Welcome to our app." (~1.5s = 45 frames at 30fps)
// Segment 2: "It makes your life easier." (~2s = 60 frames)
// Segment 3: "Try it today." (~1s = 30 frames)
const SCENES = [
  { text: "Welcome to our app.", startFrame: 0, durationFrames: 45 },
  { text: "It makes your life easier.", startFrame: 45, durationFrames: 60 },
  { text: "Try it today.", startFrame: 105, durationFrames: 30 },
];
```

**Transferable lesson:** Useful ONLY as a pre-audio drafting heuristic (our audio-captions wave's ~0.30s/Chinese-char is the same idea, calibrated). As a final sync mechanism it's an anti-pattern — see C1 — since measured timestamps exist one rule-file over.

### B3. `calculateMetadata` derives composition duration from real audio + padding rule

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/voiceover-sync.md:70-90`; `vendor/remotion-superpowers/skills/remotion-production/rules/audio-integration.md:84-99`; `vendor/remotion-superpowers/commands/add-voiceover.md:57-64`

**What it does:** The composition's `durationInFrames` is computed at load time from the actual audio file via `getAudioDurationInSeconds`, plus a fixed tail: `+60 frames (+2s at 30fps)`; the best-practices list narrows this to "1-2 seconds of padding at start and end for breathing room" (voiceover-sync.md:95).

**Load-bearing code:**
```tsx
export const calculateMetadata: CalculateMetadataFunction<MyVideoProps> = async () => {
  const voiceoverDuration = await getAudioDurationInSeconds(
    staticFile("audio/voiceover.mp3")
  );
  return {
    durationInFrames: Math.ceil(voiceoverDuration * 30) + 60, // +2s padding
    fps: 30,
    width: 1920,
    height: 1080,
  };
};
```

**Transferable lesson:** `calculateMetadata` is the Remotion-native hook for measure-don't-assume total duration — our reconcile computes the same sum offline; wiring it through `calculateMetadata` would make the composition self-consistent even if a clip module changes.

### B4. Whisper word-level timestamps → `@remotion/captions` token pipeline

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/captions-workflow.md:22-50`; `vendor/remotion-superpowers/commands/transcribe.md:96-110`

**What it does:** Three interchangeable transcription backends (MCP Whisper → SRT; local `@remotion/install-whisper-cpp` with `tokenLevelTimestamps: true`; OpenAI Whisper API with `timestamp_granularities: ["word"]`) all normalize into `Caption` objects (`{text, startMs, endMs, confidence}` per word, transcribe.md:64-71) consumed by `@remotion/captions`. Rule 1: "Always use `@remotion/captions` — Don't build caption timing from scratch" (captions-workflow.md:163).

**Load-bearing code:**
```typescript
const { transcription } = await transcribe({
  inputPath: "public/audio/voiceover.mp3",
  whisperPath: ".whisper",
  model: "medium.en",
  tokenLevelTimestamps: true,
});
const captions = toCaptions({ transcription });
```

**Transferable lesson:** The per-word `Caption{startMs,endMs}` array as the ONE interchange format between ASR and rendering is the same role our `tokenOnsets` play; adopting `@remotion/captions`' shape would let us reuse its paging utilities for free.

### B5. Caption paging with `combineTokensWithinMilliseconds: 800` + per-token highlight

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/captions-workflow.md:54-67,73-120`; `vendor/remotion-superpowers/commands/add-captions.md:68-71,136-140`

**What it does:** `createTikTokStyleCaptions` groups word tokens into pages (words within 800ms merge onto one page); at render time the component converts `frame → currentTimeMs`, finds the active page, springs it in (spring keyed to the page-local frame), and colors the currently-spoken token by `fromMs <= t < toMs`. The tuning knob is explicit: "Words moving too fast? → Increase `combineTokensWithinMilliseconds`" (add-captions.md:138).

**Load-bearing code:**
```tsx
const { pages } = createTikTokStyleCaptions({
  captions,                             // Array of Caption objects
  combineTokensWithinMilliseconds: 800, // Group words within 800ms
});
...
const currentPage = pages.find(
  (p) => currentTimeMs >= p.startMs && currentTimeMs < p.startMs + p.durationMs
);
const pageFrame = Math.round(((currentTimeMs - currentPage.startMs) / 1000) * fps);
const scale = spring({ frame: pageFrame, fps, config: { damping: 200, mass: 0.5 } });
...
const isActive = currentTimeMs >= token.fromMs && currentTimeMs < token.toMs;
```

**Transferable lesson:** Two steals: (1) the single 800ms merge threshold as the ONE paging parameter (vs hand-chunking captions); (2) keying the entrance spring to the *page-local* frame so every page pops identically regardless of absolute position — the same cue-relative-offset discipline we enforce.

### B6. Music ducking envelope around the narration window

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/audio-integration.md:54-79`; `vendor/remotion-superpowers/skills/remotion-production/rules/music-scoring.md:51-53`; `vendor/remotion-superpowers/commands/add-music.md:60`

**What it does:** Music volume is a frame-interpolated envelope: 0.4 baseline, ducked to 0.1 while the voiceover plays, with 15-frame (0.5s) ramps on both sides, clamped. `add-music.md:60` states the ratio as a rule: "lower music to 0.1 during narration, 0.3 during silent parts." Fade-in/out for music start/end uses the same interpolate shape (1s in, 2s out, audio-integration.md:112-124).

**Load-bearing code:**
```tsx
const musicVolume = interpolate(
  frame,
  [
    voiceoverStartFrame - 15, // Fade down over 0.5s
    voiceoverStartFrame,
    voiceoverEndFrame,
    voiceoverEndFrame + 15, // Fade up over 0.5s
  ],
  [0.4, 0.1, 0.1, 0.4],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);
```

**Transferable lesson:** The exact envelope numbers (0.4→0.1, 15-frame ramps) are a sane default set for our `<LessonBgmLayer>` duck; the weakness (start/end frames passed by hand, see C5) is exactly what our cue narration windows already solve.

### B7. Volume hierarchy tables (voice > SFX > music > ambient)

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/voiceover-sync.md:99`; `vendor/remotion-superpowers/skills/remotion-production/rules/music-scoring.md:89-97`; `vendor/remotion-superpowers/skills/remotion-production/rules/sound-effects.md:122-132`

**What it does:** Three rule files commit to one numeric loudness hierarchy in Remotion `volume`-prop space: voiceover 0.9–1.0, SFX 0.4–0.8 (transition SFX 0.5–0.8), background music 0.1–0.25 under voice / 0.25–0.4 without voice, intro/outro music 0.3–0.5, ambient SFX 0.1–0.2, with the audibility rule "If you notice the SFX more than the content, lower the volume" (sound-effects.md:132).

**Load-bearing code:**
```
| Layer | Volume | Notes |
|---|---|---|
| Voiceover | 1.0 | Always the loudest |
| Sound effects | 0.5–0.8 | Prominent but not overwhelming |
| Background music (with voiceover) | 0.1–0.2 | Ducked when narration plays |
| Background music (no voiceover) | 0.25–0.4 | Can be louder when no one's talking |
| Intro/outro music (no voiceover) | 0.3–0.5 | Slightly louder for emphasis |
```

**Transferable lesson:** A single canonical layer/volume table referenced from every audio rule prevents drift; ours ("no SFX louder than narration") is qualitative — publishing the numeric bands would make the check mechanical. Caveat: these are gain multipliers, not loudness — see C6.

### B8. SFX fired at visual-event frames via `<Sequence from>`

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/sound-effects.md:69-120`

**What it does:** Every SFX mounts in its own `<Sequence from={eventFrame}>` at the frame of the visual event it marks: per-text-line pops reuse the SAME `staggerDelay` constant the visual stagger uses (so audio and visual stagger cannot drift apart), and scene-cut impacts lead the cut by 5 frames so the transient peaks on the cut.

**Load-bearing code:**
```tsx
// Each text line gets a pop sound
const textLines = ["Line One", "Line Two", "Line Three"];
const staggerDelay = 15; // frames between each line
{textLines.map((line, i) => (
  <Sequence key={i} from={i * staggerDelay}>
    <Audio src={staticFile("audio/pop.mp3")} volume={0.4} />
  </Sequence>
))}
...
// Bass hit right at the scene cut
<Sequence from={sceneChangeFrame - 5} durationInFrames={30}>
```

**Transferable lesson:** "SFX frame = the same constant/expression that drives the visual" is our composer-owned-SFX rule stated structurally; the −5-frame pre-roll for impact transients is a concrete number worth adopting.

### B9. Multi-voice scripts: per-line clips sequenced end-to-end

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/elevenlabs-advanced.md:95-120`; TTS pacing presets at `elevenlabs-advanced.md:79-93`

**What it does:** Dialogue is generated as one clip per line per voice, each mounted in its own `<Sequence from/durationInFrames>` — no single continuous multi-speaker WAV. The rule "Generate one sentence at a time for multi-voice scripts, then sequence in Remotion" (line 156). Companion presets set TTS `speed` per genre (explainer 0.7–0.8, social 1.2–1.3), i.e. pacing is chosen at *generation* time, not stretched at composition time.

**Load-bearing code:**
```tsx
<Sequence from={0} durationInFrames={3 * fps}>
  <Audio src={staticFile("audio/narrator-intro.mp3")} volume={1.0} />
</Sequence>
<Sequence from={3 * fps} durationInFrames={4 * fps}>
  <Audio src={staticFile("audio/interviewer-q1.mp3")} volume={1.0} />
</Sequence>
```

**Transferable lesson:** Independent arrival at our v4 per-cue-clip architecture (clip-per-utterance in its own Sequence ⇒ no cross-boundary drift); TTS-speed-at-generation matches our "never re-time audio in composition" freeze.

### B10. Narration-to-B-roll matching via semantic video search

**Where:** `vendor/remotion-superpowers/skills/remotion-production/rules/video-analysis.md:115-120,66-96`

**What it does:** For scripted narration over existing footage: generate the voiceover, break the script into segments, run a TwelveLabs semantic search per segment ("person presenting with slides"), assign returned timestamp ranges to segments, then mount each range with `OffthreadVideo startFrom/endAt` inside a narration-timed `<Sequence>`.

**Load-bearing code:**
```
### 3. "Match my narration to existing B-roll"
1. Generate voiceover from script
2. Break script into segments
3. For each segment, search indexed footage for matching visuals
4. Assign footage clips to script segments
5. Build composition with synced visuals + audio
```

**Transferable lesson:** Script-segment → semantic-search → timestamped clip is a scene-*selection* mechanism keyed off narration structure — irrelevant to SVG lessons today, but the per-segment visual-assignment loop is the same shape as our storyboard cue → required-visual mapping.

### B11. Transition-overlap duration accounting

**Where:** `vendor/remotion-superpowers/commands/add-transitions.md:100-111`

**What it does:** When hard-cut `<Sequence>`s become `<TransitionSeries>`, each transition overlaps its neighbors, so the composition total must be re-derived: `Total = Σ sequence durations − Σ transition durations`. Ignoring this desyncs the (already-frozen) audio from the shortened visual timeline.

**Load-bearing code:**
```
Total = Sum of all sequence durations - Sum of all transition durations

Example: 3 scenes × 90 frames + 2 transitions × 20 frames
Total = 270 - 40 = 230 frames
```

**Transferable lesson:** Any transition primitive we add between cues must feed its overlap back into the reconcile sum, or the cue chain silently shortens against the voice clips — worth a law in the composer skill before we ever adopt `@remotion/transitions`.

## C. Anti-patterns & gaps

1. **Sync-by-guess promoted next to sync-by-measurement.** Pattern 1 (`rules/voiceover-sync.md:32-48`) times scenes from "~150 WPM = 2.5 words/second" hand math into hard-coded `startFrame` literals, while word-level Whisper timestamps (Pattern 2, same file, lines 52-68; `rules/captions-workflow.md:22-50`) are already in the toolchain. Nothing tells the agent to reconcile the guessed scene table against measured timestamps — a 10% TTS pace deviation compounds to seconds of drift by the last scene. Captions get real timestamps; *scenes* never do.
2. **Zero text/box measurement, zero collision checking.** Proven absence (greps in §A header): no `@remotion/layout-utils` (`fitText`, `measureText`, `fillTextBox` — official APIs for exactly this), no bbox math anywhere. A long title at the prescribed 72-96px in a 1080-wide short simply overflows; the only recourse is the post-render TwelveLabs review (`agents/post-producer.md:42-46`), i.e. render-fix-render at full render cost.
3. **The repo breaks its own determinism law.** `rules/data-visualization.md:5` demands all animation be driven by `useCurrentFrame()`, yet `commands/add-captions.md:102` styles the active caption token with `transition: "color 0.1s"` (CSS transitions don't advance in frame-rendered output) and `rules/visual-effects.md:166,171` uses raw `Math.random()` per frame (`top: ${Math.random() * 50}%`) — nondeterministic across render threads/retries; Remotion's seeded `random()` exists for this. Snippets were clearly never rendered.
4. **Per-frame recompute of caption pages.** `commands/add-captions.md:63-76` places `createTikTokStyleCaptions()` INSIDE the component body, so pagination re-runs on every frame render; `rules/captions-workflow.md` computes pages outside — the command contradicts the rule it says to load. Also `pages.find()` is a linear scan per frame (fine at 30s scale, wasteful pattern to teach).
5. **Ducking needs hand-fed narration bounds.** `rules/audio-integration.md:59-62` takes `voiceoverStartFrame/voiceoverEndFrame` as props with no mechanism to derive them from the audio; there's no silence detection, no multi-utterance support (one duck window per component), and no gap-rise behavior between sentences.
6. **Volume ratios are gain, not loudness.** All tables (§B7) are `volume`-prop multipliers; there is no LUFS normalization, no mention that a hot music master at 0.2 can still bury a quiet voice track. No render-side loudness gate at all (our `ffmpeg loudnorm` −16 LUFS pass has no counterpart).
7. **Frame literals everywhere; no single timing source of truth.** Examples hard-code `from={3 * fps}`, `from={5 * fps}`, `startFrame: 45/105` (`rules/audio-integration.md:39-46`, `rules/music-scoring.md:60-73`, `rules/voiceover-sync.md:43-47`) with no cue/scene table that audio, SFX, and visuals all read — the drift class our `cues[id].startFrame + offset` law exists to kill. The `+60` padding in `voiceover-sync.md:84` also bakes fps=30 into a literal.
8. **No provenance, no tests, no evals.** Single visible commit, no CI, no rendered example outputs, no verification that any snippet compiles. As practice-codification, the numbers are plausible but unproven within the repo itself.

## D. Verdict

Worth stealing, ranked:
1. **The numeric audio-mix contract (B6+B7):** duck 0.4→0.1 with 15-frame ramps around narration; voice 1.0 / SFX 0.4–0.8 / music-under-voice 0.1–0.2 / ambient 0.1–0.2; SFX impact leads a cut by 5 frames. Concrete defaults our sound-design and BgmLayer skills can cite as bands instead of adjectives.
2. **Caption paging via `@remotion/captions` (B4+B5):** word-level `Caption{startMs,endMs}` as the interchange format + `combineTokensWithinMilliseconds: 800` as the single paging knob + page-local spring entrance. Directly reusable if we ever surface word-synced captions beyond our current per-cue captions.
3. **`calculateMetadata`-from-audio + explicit padding rule (B3):** the Remotion-native way to make total duration self-derive from the frozen audio; cheap belt-and-suspenders under our reconcile.
4. **Platform safe-zone band table + font-size floors (A1+A2):** declarative, checkable numbers (bottom 15–25% TikTok, center-60% text, ≥48px mobile) for any social-format export target.
The repo's core ordering (voiceover FIRST, duration measured, music after, review loop last) independently confirms our architecture but adds nothing beyond it — and its two biggest silences (no text measurement, no measured scene sync) are precisely the two problems our bbox-manifest/`--measured` gate and ASR reconcile already solve. Treat it as a source of calibrated constants and caption plumbing, not architecture.
