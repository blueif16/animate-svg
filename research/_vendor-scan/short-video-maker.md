# short-video-maker — vendor scan (2026-07-03)

https://github.com/gyoridavid/short-video-maker @ 9bb9a21 — MCP/REST-driven faceless-shorts generator: Kokoro TTS → whisper.cpp alignment → Pexels b-roll → Remotion render.

## What this repo is

A self-hosted Node/TypeScript service (~1.2K stars) that turns `{text, searchTerms}` scene descriptions into finished vertical/horizontal shorts. Architecture: an Express server (REST + MCP routers) feeds a single `ShortCreator` queue which, per scene, runs Kokoro TTS in-process (`kokoro-js`), normalizes the WAV with fluent-ffmpeg, transcribes it with `@remotion/install-whisper-cpp` for word timestamps, fetches a matching Pexels clip, then renders one of two fixed Remotion compositions (`PortraitVideo` 1080×1920 / `LandscapeVideo` 1920×1080, both fps=25). Maturity: real production plumbing (Docker images incl. CUDA/tiny variants, render concurrency + OffthreadVideo cache knobs in `src/config.ts:51-52`) but **no CI** (no `.github/` directory), only 4 vitest tests across 2 files (queue behavior + Pexels filter; zero tests on caption paging or the compositions), and visible `// todo add mutex lock` comments (`src/short-creator/ShortCreator.ts:55`). Treat it as a working reference pipeline, not a hardened codebase.

## A. Layout & overlay prevention

### A1. Fixed canonical composition per orientation, selected by a config map

**Where:** `vendor/short-video-maker/src/components/utils.ts:132-147` (consumed by `src/short-creator/libraries/Remotion.ts:40-46`)

**What it does:** Layout flexibility is reduced to exactly two blessed canvases. A single `getOrientationConfig` map binds orientation → `{width, height, component}`; the renderer uses the same map to pick which Remotion composition ID to render, and the Pexels client uses it to know which asset dimensions to demand. There is no free-form resizing — every downstream sizing decision keys off this one table.

**Load-bearing code:**
```ts
const config: Record<OrientationEnum, OrientationConfig> = {
  portrait: {
    width: 1080,
    height: 1920,
    component: AvailableComponentsEnum.PortraitVideo,
  },
  landscape: {
    width: 1920,
    height: 1080,
    component: AvailableComponentsEnum.LandscapeVideo,
  },
};
```

**Transferable lesson:** One shared orientation/dimension table consumed by BOTH the renderer and the asset-sourcing layer prevents the classic drift where the composition and its media disagree about pixel size. Our pipeline's analog: derive zone geometry and any media-fetch constraints from the same `layout.ts` constants.

### A2. Fit-at-sourcing: background video filtered to EXACT composition dimensions (never scaled in-scene)

**Where:** `vendor/short-video-maker/src/short-creator/libraries/Pexels.ts:88-108`

**What it does:** Instead of letter-boxing/cropping/scaling in the composition, the Pexels search rejects any video file that is not `quality === "hd"` at exactly the composition's width×height, and rejects clips shorter than narration + 3s buffer (with an fps-based duration correction for sub-25fps clips). The scene then mounts `<OffthreadVideo src={video} muted />` with zero styling (`PortraitVideo.tsx:91`) — overlap/fit problems are solved before render time, at asset selection.

**Load-bearing code:**
```ts
const fps = video.video_files[0].fps;
const duration =
  fps < 25 ? video.duration * (fps / 25) : video.duration;

if (duration >= minDurationSeconds + durationBufferSeconds) {
  for (const file of video.video_files) {
    if (
      file.quality === "hd" &&
      file.width === requiredVideoWidth &&
      file.height === requiredVideoHeight
    ) {
```

**Transferable lesson:** Push fit constraints upstream into asset selection/generation so the composition never needs runtime scaling logic. For lesson videos: generate/scan assets at final render dimensions (our primitive-builder test stills "at real render size" rule is the same idea) rather than trusting CSS `object-fit` at render.

### A3. Character-budget caption paging (capacity proxy, no DOM measurement)

**Where:** `vendor/short-video-maker/src/components/utils.ts:80-103`; budgets set at call sites `src/components/videos/PortraitVideo.tsx:65-70` (`lineMaxLength: 20`) and `src/components/videos/LandscapeVideo.tsx:65-70` (`lineMaxLength: 30`)

**What it does:** Word-level captions are greedily packed into lines by *character count*: a word joins the current line only if `currentLen + 1 + word.length <= lineMaxLength`; a full line closes the page when `lines.length >= lineCount` (both components use `lineCount: 1`). The per-orientation budget is hand-calibrated against the fixed font size (20 chars at `6em` on a 1080-wide portrait; 30 chars at `8em` on 1920 landscape) — overflow prevention by construction, not by measurement.

**Load-bearing code:**
```ts
const currentLineText = currentLine.texts.map((t) => t.text).join(" ");
if (
  currentLine.texts.length > 0 &&
  currentLineText.length + 1 + caption.text.length > lineMaxLength
) {
  // Line is full, add it to current page
  currentPage.lines.push(currentLine);
  currentLine = { texts: [] };
  // Check if page is full
  if (currentPage.lines.length >= lineCount) {
    pages.push(currentPage);
```

**Transferable lesson:** A per-canvas character budget tuned to a fixed font size is a cheap, deterministic overflow guard for caption tracks — it works because font size, width, and budget are pinned together as one contract. If you adopt it, keep our `~0.30s/char` narration-rate calibration idea: the budget must be re-derived whenever font/canvas changes, ideally by a one-time measured calibration rather than eyeballing.

### A4. Caption position presets with fixed edge insets (poor-man's safe area)

**Where:** `vendor/short-video-maker/src/components/videos/PortraitVideo.tsx:38-48` and the container at `:102-108` (identical in `LandscapeVideo.tsx:38-48`)

**What it does:** Caption placement is an enum (`top | center | bottom`), not a coordinate. `top` and `bottom` inset the full-width absolutely-positioned caption block 100px from the edge (clearing platform UI chrome), `center` uses `top: 50% / translateY(-50%)`. The block is always `width: 100%` with `textAlign: center`, so horizontal placement can never clip.

**Load-bearing code:**
```ts
let captionStyle = {};
if (captionPosition === "top") {
  captionStyle = { top: 100 };
}
if (captionPosition === "center") {
  captionStyle = { top: "50%", transform: "translateY(-50%)" };
}
if (captionPosition === "bottom") {
  captionStyle = { bottom: 100 };
}
```

**Transferable lesson:** Exposing placement as a small enum of pre-validated slots (instead of free coordinates) makes overlap a solvable design-time problem — each slot is verified once and reused. Matches our zones discipline; the 100px inset is a crude but real safe-area constant worth formalizing per canvas.

### A5. Reflow-free word highlight via negative-margin compensation

**Where:** `vendor/short-video-maker/src/components/videos/PortraitVideo.tsx:30-36`, applied at `:135-143`

**What it does:** The karaoke highlight adds a colored background with `padding: 10px` to the active word's `<span>`. To stop that padding from pushing neighboring words sideways (layout shift every time the active word changes → jittering line), it cancels the horizontal padding with equal negative margins, so the highlighted box grows visually without changing the line's flow width.

**Load-bearing code:**
```ts
const activeStyle = {
  backgroundColor: captionBackgroundColor,
  padding: "10px",
  marginLeft: "-10px",
  marginRight: "-10px",
  borderRadius: "10px",
};
```

**Transferable lesson:** Any per-word emphasis applied inside a text line must be geometry-neutral (negative-margin compensation, outline/box-shadow, or a separately positioned overlay) or the whole line reflows each frame the highlight moves. Directly applicable to our read-along/caption highlighting.

### A6. Legibility stack instead of collision avoidance against the video layer

**Where:** `vendor/short-video-maker/src/components/videos/PortraitVideo.tsx:112-125`

**What it does:** Captions render over arbitrary unknown stock footage, so instead of detecting conflicts with the background, every caption gets a belt-and-suspenders contrast stack: white fill + 2px black `WebkitTextStroke` + 10px black `textShadow` + uppercase + heavy condensed font (`Barlow Condensed` loaded via `@remotion/google-fonts`, `PortraitVideo.tsx:10,18`). The text stays readable on any luminance without ever measuring the background.

**Load-bearing code:**
```ts
style={{
  fontSize: "6em",
  fontFamily: fontFamily,
  fontWeight: "black",
  color: "white",
  WebkitTextStroke: "2px black",
  WebkitTextFillColor: "white",
  textShadow: "0px 0px 10px black",
  textAlign: "center",
  width: "100%",
  textTransform: "uppercase",
}}
```

**Transferable lesson:** When a text layer floats over uncontrolled imagery, guarantee contrast intrinsically (stroke + shadow + weight) rather than positionally. For our lessons the contrast gate already measures this; the stroke+shadow recipe is the cheap fix when a caption must cross imagery.

### A7. Temporal multiplexing — one caption page mounted at a time

**Where:** `vendor/short-video-maker/src/components/videos/PortraitVideo.tsx:93-101`

**What it does:** Each caption page becomes its own nested `<Sequence>` whose `from`/`durationInFrames` derive from the page's `startMs/endMs`. Because pages are contiguous, non-overlapping time windows produced by `createCaptionPages`, at most one page (one line) exists in the DOM at any frame — spatial stacking of caption text is impossible by construction.

**Load-bearing code:**
```tsx
<Sequence
  key={`scene-${i}-page-${j}`}
  from={Math.round((page.startMs / 1000) * fps)}
  durationInFrames={Math.round(
    ((page.endMs - page.startMs) / 1000) * fps,
  )}
>
```

**Transferable lesson:** Convert would-be spatial conflicts into temporal ones: if two text blocks share a zone, give them disjoint Sequences derived from the same timing source. This is a structural overlap guarantee no bbox checker has to verify.

Exhaustion note for A: `grep -rn "fitText|measureText|getBBox|getBoundingClientRect|safeArea|safe-area|overflow|clamp|ellipsis|wordWrap|whiteSpace" src/ --include=*.ts --include=*.tsx` (excluding `src/ui/`) returned NOTHING except the volume functions — there is NO text measurement, NO `@remotion/layout-utils`, NO collision detection, NO responsive font scaling anywhere in the render path. The seven mechanisms above are the complete layout story.

## B. Voice-visual coordination

### B1. Measured TTS sample count is the root clock: audio length → scene length → composition length

**Where:** `vendor/short-video-maker/src/short-creator/libraries/Kokoro.ts:31-36` → `src/short-creator/ShortCreator.ts:110-121,177-201` → `src/components/root/Root.tsx:11-19`

**What it does:** Kokoro's streamed chunks are summed as `samples / sampling_rate` to get an exact `audioLength` in seconds — measured from the waveform, never estimated from text. `ShortCreator` stores it as `scene.audio.duration`, accumulates `totalDuration`, and passes `durationMs` into the render props; the Remotion root converts it once via `calculateMetadata` into the composition's `durationInFrames`. Every visual duration in the video is downstream of this measurement.

**Load-bearing code:**
```ts
// Kokoro.ts:31-36
let audioLength = 0;
for (const audio of output) {
  audioBuffers.push(audio.audio.toWav());
  audioLength += audio.audio.audio.length / audio.audio.sampling_rate;
}
```
```ts
// Root.tsx:11-19
export const calculateMetadata: CalculateMetadataFunction<...> =
  async ({ props }) => {
  const durationInFrames = Math.floor((props.config.durationMs / 1000) * FPS);
  return { ...props, durationInFrames };
};
```

**Transferable lesson:** Same law our pipeline codified as MEASURE, DON'T ASSUME — but note the Remotion-native delivery: `calculateMetadata` lets the composition length be a pure function of input props, so no hardcoded `durationInFrames` ever exists. Worth using in any lesson wrapper instead of a generated constant.

### B2. Per-scene whisper.cpp alignment on a normalized WAV, with sub-token merge

**Where:** `vendor/short-video-maker/src/short-creator/libraries/Whisper.ts:47-92`; input prep at `src/short-creator/libraries/FFmpeg.ts:23-39`

**What it does:** Each scene's TTS output is first resampled to whisper's expected format (`pcm_s16le`, mono, 16kHz) via ffmpeg, then transcribed with `tokenLevelTimestamps: true`. The token loop drops whisper control tokens (`[_TT...`), and merges a token into the previous caption when neither side has a leading/trailing space (sub-word pieces), extending that caption's `endMs`. Output is a flat `Caption[] = {text, startMs, endMs}` local to the scene's audio.

**Load-bearing code:**
```ts
record.tokens.forEach((token) => {
  if (token.text.startsWith("[_TT")) {
    return;
  }
  if (
    captions.length > 0 &&
    !token.text.startsWith(" ") &&
    !captions[captions.length - 1].text.endsWith(" ")
  ) {
    captions[captions.length - 1].text += record.text;
    captions[captions.length - 1].endMs = record.offsets.to;
    return;
```

**Transferable lesson:** Two solid habits: (1) always normalize TTS audio to the ASR's native format before alignment (our sherpa-onnx path does the analog); (2) ASR tokens are not words — a whitespace-based merge pass into display words is mandatory before caption layout.

### B3. Scene-local timestamps + nested Sequences = no global offset arithmetic for captions

**Where:** `vendor/short-video-maker/src/components/videos/PortraitVideo.tsx:72-101`

**What it does:** Scene N's start frame is the cumulative sum of all previous scenes' *measured audio durations* times fps; the scene's video, narration `<Audio>`, and caption pages all mount inside that scene `<Sequence>`. Because whisper timestamps are relative to the scene's own WAV, page `from` values are used as-is inside the nested Sequence — Remotion's Sequence nesting performs the global offset, so caption timing code never touches master-timeline numbers.

**Load-bearing code:**
```ts
const startFrame =
  scenes.slice(0, i).reduce((acc, curr) => {
    return acc + curr.audio.duration;
  }, 0) * fps;
let durationInFrames =
  scenes.slice(0, i + 1).reduce((acc, curr) => {
    return acc + curr.audio.duration;
  }, 0) * fps;
if (config.paddingBack && i === scenes.length - 1) {
  durationInFrames += (config.paddingBack / 1000) * fps;
}
```

**Transferable lesson:** Keep ASR/caption timestamps in the unit's local coordinate system and let `<Sequence>` nesting do the translation — the same structural guarantee as our cue-anchored v4 audio (a clip cannot drift relative to its cue because it is mounted inside it).

### B4. Silence-gap paging: captions disappear during pauses

**Where:** `vendor/short-video-maker/src/components/utils.ts:58-78` (threshold set at call site, `maxDistanceMs: 1000`, `PortraitVideo.tsx:69`)

**What it does:** While packing words into pages, if the next word starts more than `maxDistanceMs` (1s) after the current page's `endMs`, the page is closed and a new one starts at the next word's `startMs`. Since each page's Sequence ends at its last word's `endMs`, no caption is mounted during the silence — on-screen text tracks actual speech presence, not scene extent.

**Load-bearing code:**
```ts
captions.forEach((caption, i) => {
  // Check if we need to start a new page due to time gap
  if (i > 0 && caption.startMs - currentPage.endMs > maxDistanceMs) {
    if (currentLine.texts.length > 0) {
      currentPage.lines.push(currentLine);
    }
    if (currentPage.lines.length > 0) {
      pages.push(currentPage);
    }
    // Start new page
    currentPage = { startMs: caption.startMs, endMs: caption.endMs, ... };
```

**Transferable lesson:** Derive caption *visibility windows* from measured word timing with a gap threshold, instead of stretching captions across a whole cue. Our typed intra-cue `gap` mechanism could drive the same "caption drops out during the hold" behavior for free.

### B5. Word-level karaoke highlight bound to measured word windows

**Where:** `vendor/short-video-maker/src/components/videos/PortraitVideo.tsx:128-146`

**What it does:** For every rendered word span, `active` is true exactly while the master frame sits inside that word's whisper window (`startMs/endMs` mapped to frames, offset by the scene's `startFrame` because `useCurrentFrame()` is read at the component root, outside the Sequences). The active word gets the background-box style from A5. This is spoken-enumeration-binds-to-token-onsets, implemented directly in the JSX.

**Load-bearing code:**
```tsx
const active =
  frame >=
    startFrame + (text.startMs / 1000) * fps &&
  frame <= startFrame + (text.endMs / 1000) * fps;
return (
  <>
    <span
      style={{
        fontWeight: "bold",
        ...(active ? activeStyle : {}),
      }}
```

**Transferable lesson:** Word highlight needs no per-word Sequences — one frame comparison per word against its measured window is simpler and exact. Confirms our onset-binding law; note their coordinate hygiene (scene-relative ms + explicit scene offset) is the fragile part our `tokenOnsetFrame` helper abstracts away.

### B6. B-roll fitted to narration length at fetch time (min duration = narration + 3s)

**Where:** `vendor/short-video-maker/src/short-creator/ShortCreator.ts:140-145` calling `src/short-creator/libraries/Pexels.ts:6-7,88-93`

**What it does:** The background clip for each scene is required to be at least `audioLength + durationBufferSeconds (3s)` long, so the muted `<OffthreadVideo>` can never run out of frames inside its scene Sequence — the video is trimmed implicitly by the Sequence's audio-derived duration, never looped or frozen. `excludeVideoIds` accumulates across scenes so the same clip is never reused within one short (`ShortCreator.ts:175`).

**Load-bearing code:**
```ts
const video = await this.pexelsApi.findVideo(
  scene.searchTerms,
  audioLength,
  excludeVideoIds,
  orientation,
);
```
```ts
const durationBufferSeconds = 3;
// Pexels.ts:93
if (duration >= minDurationSeconds + durationBufferSeconds) {
```

**Transferable lesson:** When narration length is the master clock, every co-timed media asset gets a *minimum-duration contract with a safety buffer* at sourcing time; the timeline then trims, never stretches. Same shape as our `cueFrames = max(narration, motion) + tail` — the buffer plays the role of tail.

### B7. Music policy: curated loop windows + stepped static volume + offline pre-attenuation (NO dynamic ducking)

**Where:** `vendor/short-video-maker/src/components/videos/PortraitVideo.tsx:54-61`; volume map `src/components/utils.ts:149-164`; curated windows `src/short-creator/music.ts:8-13` (per-track `start`/`end` seconds); offline normalization `src/scripts/normalizeMusic.ts:10-19`; mood pick `src/short-creator/ShortCreator.ts:239-247`

**What it does:** Music is one looping `<Audio>` over the whole composition, trimmed to a hand-curated `[start, end]` window per track (skipping weak intros), selected randomly by mood tag. "Ducking" is entirely static: a 4-step enum maps to constant volumes (muted/0.2/0.45/0.7), and an *author-time* ffmpeg pass (`loudnorm,volume=0.1`, i.e. loudness-normalize then −20dB) pre-attenuates every library track so even "high" sits under narration. There is no sidechain, no per-frame envelope, no narration-window awareness.

**Load-bearing code:**
```tsx
<Audio
  loop
  src={music.url}
  startFrom={music.start * fps}
  endAt={music.end * fps}
  volume={() => musicVolume}
  muted={musicMuted}
/>
```
```ts
.audioFilter("loudnorm,volume=0.1")   // normalizeMusic.ts:18
```

**Transferable lesson:** Normalizing the whole music library offline to a fixed headroom below speech is a robust zero-runtime-cost baseline — our loudnorm master pass plus curated `_beds` should keep this. But it is a floor, not a substitute for our 3-point duck; static volume can't open up in narration gaps.

### B8. paddingBack: explicit post-narration tail

**Where:** `vendor/short-video-maker/src/short-creator/ShortCreator.ts:118-121,189-191`; consumed at `src/components/videos/PortraitVideo.tsx:81-83`

**What it does:** A single config value (`paddingBack`, ms) extends the last scene's effective audio length and the total composition duration, so the video keeps playing b-roll + music after speech ends instead of hard-cutting on the final word.

**Load-bearing code:**
```ts
// add the paddingBack in seconds to the last scene
if (index + 1 === inputScenes.length && config.paddingBack) {
  audioLength += config.paddingBack / 1000;
}
```

**Transferable lesson:** The end-of-video breathing room is a first-class, single-sourced parameter added in exactly two places (last unit + total), not smeared across scenes — identical in spirit to our per-cue `tailFrames`, applied at video granularity.

## C. Anti-patterns & gaps

1. **Scene `durationInFrames` is actually the scene's END frame — every scene Sequence overstays.** At `PortraitVideo.tsx:77-88` the value passed as `durationInFrames` is the cumulative sum through scene i+1 (an end time), while `from` is the cumulative sum through i. So scene N's Sequence lasts `startFrame` frames too long, overlapping all subsequent scenes. It ships anyway because later siblings paint over earlier ones, each scene's mp3 simply ends, and `calculateMetadata` clamps the composition — three accidents masking a semantic bug. Any reordering (z-index, transitions, un-muted video) would expose it.
2. **Token-level timestamps are requested but never used per-token.** `Whisper.ts:55` sets `tokenLevelTimestamps: true`, yet `Whisper.ts:83-87` stamps every caption with the enclosing *record's* `offsets.from/to`; word-accurate timing only works because whisper.cpp happens to emit near-one-word records here. Worse, the sub-token merge at `Whisper.ts:79` appends `record.text` (the whole record) instead of `token.text` — a latent text-duplication bug for multi-token records.
3. **No text measurement anywhere; character budgets are hand-tuned magic numbers.** `lineMaxLength: 20/30` (PortraitVideo.tsx:67, LandscapeVideo.tsx:67) is calibrated against `6em/8em` fonts by eyeball; a single long word (>20 chars, URLs, German compounds) or any font/size change silently overflows the 100%-width line. Nothing like `@remotion/layout-utils` `measureText`/`fitText` is used (grep proven, see A exhaustion note).
4. **No music ducking, and `findMusic` ignores its own duration argument.** `ShortCreator.ts:239-247` takes `videoDuration` and never reads it — mood filter + `Math.random()` only; narration/music balance rests entirely on the offline −20dB pass (B7). Also `volume={() => musicVolume}` (PortraitVideo.tsx:59) is a constant function — the callback form suggests an envelope was intended and never built.
5. **Float frame boundaries at scene level.** Scene `from`/`durationInFrames` are `seconds * fps` floats (PortraitVideo.tsx:73-83) while page Sequences are `Math.round`ed (`:97-99`) — inconsistent, and fractional `from` values invite off-by-one drift between audio and captions at cut points.
6. **The render depends on a live localhost server.** Scene assets are wired as `http://localhost:${port}/api/tmp/...` URLs (`ShortCreator.ts:179-183`) that the headless Remotion browser fetches during render — rendering breaks if the server restarts mid-queue, and temp files are deleted right after (`ShortCreator.ts:214-216`) with no retry story.
7. **Near-zero verification.** No CI workflows (no `.github/`), 4 tests total, none covering `createCaptionPages` (the only nontrivial pure function) or either video component; no rendered-output checks. The pipeline's correctness is manually observed, not gated.

## D. Verdict

Worth stealing, ranked:
1. **`calculateMetadata` as the single point where measured audio ms becomes composition frames** (Root.tsx:11-19) — the cleanest Remotion-native expression of "audio is the master clock"; our generated timelines could expose the same pure-function shape.
2. **Reflow-free word-highlight styling** (negative-margin compensation, PortraitVideo.tsx:30-36) plus the **frame-vs-word-window `active` comparison** (:128-146) — a complete, minimal karaoke recipe: one styled span, zero extra Sequences, zero layout shift.
3. **Silence-gap caption paging** (`maxDistanceMs`, utils.ts:58-78) — visibility windows derived from measured speech, so text vanishes during pauses; trivially portable onto our typed cue gaps.
4. **Fit-at-sourcing with a duration buffer** (Pexels.ts:88-108) — demand exact render dimensions and `narration + 3s` from every timed asset upfront; the composition then never scales or loops.
The layout story is the cautionary half: with no measurement and hand-tuned char budgets it survives only because the design space is frozen (2 canvases, 1 font, 1 line). The scene-duration bug (C1) is the sharpest lesson: cumulative-sum timeline math written inline in JSX, unreviewed and untested, ships wrong and gets masked — exactly what a reconcile step + zero-frame-literals discipline exists to prevent.
