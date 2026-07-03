# template-tiktok — vendor scan (2026-07-03)

https://github.com/remotion-dev/template-tiktok @ `386ec6a` — Remotion's official TikTok-caption template: whisper.cpp word-timestamps → paged, per-token-highlighted captions over a vertical video.

## What this repo is

The canonical Remotion caption template, maintained by the Remotion team (vendored as a shallow single commit, last touched 2026-02-20). Architecture: an offline transcription script (`sub.mjs`, whisper.cpp via `@remotion/install-whisper-cpp`) writes a `Caption[]` JSON next to each video in `public/`; the composition (`src/CaptionedVideo/`) fetches that JSON at render time, pages it with `createTikTokStyleCaptions`, and mounts one `<Sequence>` per page with per-token highlight. Maturity: first-party code quality (strict TS, zod-typed props, eslint+tsc lint script), but no tests and no CI config in the repo; total app code is ~350 lines across 9 files. It solves caption layout + word-sync narrowly and completely; it is NOT a general layout system.

## A. Layout & overlay prevention

### A1. `fitText` — measure-then-shrink font sizing so a caption page never overflows horizontally

**Where:** `vendor/template-tiktok/src/CaptionedVideo/Page.tsx:34-41`

**What it does:** Every caption page measures its own full text with `@remotion/layout-utils`' `fitText` (real DOM text measurement using the actual `fontFamily` and `textTransform: "uppercase"`) and receives the font size at which the string exactly fits the target width. The result is capped by a desired maximum (`DESIRED_FONT_SIZE = 120`, `Page.tsx:23`), so short pages render at the big TikTok size and long pages shrink instead of wrapping or clipping. Because measurement happens per page at render, no page can ever overflow the horizontal bounds regardless of transcript content.

**Load-bearing code:**
```tsx
const fittedText = fitText({
  fontFamily,
  text: page.text,
  withinWidth: width * 0.9,
  textTransform: "uppercase",
});

const fontSize = Math.min(DESIRED_FONT_SIZE, fittedText.fontSize);
```

**Transferable lesson:** Any text whose content is data-driven (narration captions, titles from a brief) should be sized by measurement (`fitText` / `measureText`), never by a constant — the constant is only the *ceiling*. This is the DOM-text equivalent of our bbox-manifest discipline: measure, don't assume.

### A2. Composition-relative safe width (`width * 0.9` from `useVideoConfig`)

**Where:** `vendor/template-tiktok/src/CaptionedVideo/Page.tsx:31,37`

**What it does:** The fit target is not a pixel constant but 90% of the live composition width read from `useVideoConfig()`. That gives a symmetric 5%-per-side horizontal safe margin and makes the caption sizing automatically correct if the composition is re-rendered at a different width. It is the only dimension in the caption layout that scales with the composition.

**Load-bearing code:**
```tsx
const { width, fps } = useVideoConfig();
...
    withinWidth: width * 0.9,
```

**Transferable lesson:** Express safe areas as fractions of `useVideoConfig()` dimensions, not absolute pixels, so one scene definition survives resolution changes. Our zones declarations could carry the same convention (`width * 0.9` rather than `972`).

### A3. Bottom-anchored fixed caption band as a vertical safe zone

**Where:** `vendor/template-tiktok/src/CaptionedVideo/Page.tsx:15-21`

**What it does:** Captions live in a dedicated horizontal band: an `AbsoluteFill` whose `top` is unset and which is pinned `bottom: 350` with `height: 150`, contents flex-centered. 350px above the bottom of a 1920px-tall frame clears the region where TikTok's own UI (buttons, description) overlays the video, and the fixed-height band + single-line fitText guarantees the caption never wanders over the rest of the picture. Overlay prevention here is *reservation* (a zone nothing else uses), not collision detection.

**Load-bearing code:**
```tsx
const container: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
  top: undefined,
  bottom: 350,
  height: 150,
};
```

**Transferable lesson:** Reserving an exclusive band for captions (and keeping teaching visuals out of it by contract) is far cheaper than detecting caption/visual collisions after the fact — it matches our zones-declaration approach and shows the minimal viable version: one flex-centered `AbsoluteFill` strip. Note the pixel values are hardcoded to 1080×1920 (see C).

### A4. Paint-order text stroke for legibility over arbitrary video (no background box)

**Where:** `vendor/template-tiktok/src/CaptionedVideo/Page.tsx:47-50`

**What it does:** Instead of a background plate behind the caption (which would enlarge its footprint and create a real overlap surface), each page gets a 20px black `WebkitTextStroke` with `paintOrder: "stroke"`, so the stroke is drawn *behind* the white fill rather than eating into the glyphs. This keeps white text readable over any video frame while the caption's visual footprint stays the glyph outline itself.

**Load-bearing code:**
```tsx
style={{
  fontSize,
  color: "white",
  WebkitTextStroke: "20px black",
  paintOrder: "stroke",
```

**Transferable lesson:** `paintOrder: "stroke"` + heavy stroke is the standard way to make overlay text self-legible without adding a box that inflates the element's bounding footprint — directly usable for our caption layer and cheaper for the contrast gate than plates. Caveat: the stroke width should scale with the fitted font size (this repo doesn't — see C).

### A5. Font loaded before captions render → measurement is never done with fallback metrics

**Where:** `vendor/template-tiktok/src/CaptionedVideo/index.tsx:69-79` and `vendor/template-tiktok/src/load-font.ts:7-25`

**What it does:** `fetchSubtitles` awaits `loadFont()` (a `FontFace` load + `document.fonts.add`, itself wrapped in its own `delayRender`) *before* fetching the caption JSON and calling `continueRender`. Since `fitText` measures with the real font family, running it before the font is available would return wrong sizes from fallback-font metrics; the ordering guarantees every measurement and every rendered frame uses the loaded font.

**Load-bearing code:**
```tsx
const fetchSubtitles = useCallback(async () => {
  try {
    await loadFont();
    const res = await fetch(subtitlesFile);
    const data = (await res.json()) as Caption[];
    setSubtitles(data);
    continueRender(handle);
  } catch (e) {
    cancelRender(e);
  }
}, [continueRender, handle, subtitlesFile]);
```

**Transferable lesson:** Any measurement-based layout (fitText, getBBox on text) must be sequenced after font load via `delayRender`/`continueRender`, or the measured sizes silently disagree with the rendered pixels — the same class of bug as measuring with the wrong coordinate space.

### A6. `objectFit: "cover"` background scaling to composition

**Where:** `vendor/template-tiktok/src/CaptionedVideo/index.tsx:102-109`

**What it does:** The source video is mounted in an `AbsoluteFill` with `objectFit: "cover"`, so any input aspect ratio fills the 1080×1920 canvas without letterboxing or distortion; the caption layer is composited above it in a separate `AbsoluteFill`. Layering is done by stacking full-bleed layers, each owning its own region by convention.

**Load-bearing code:**
```tsx
<AbsoluteFill>
  <OffthreadVideo
    style={{
      objectFit: "cover",
    }}
    src={src}
  />
</AbsoluteFill>
```

**Transferable lesson:** Full-bleed layer stacking (`AbsoluteFill` per concern: media / captions / warnings) with `objectFit` handling media aspect is the simplest robust compositing scheme; the caption band never has to know anything about the video underneath.

**Coverage proof for A:** the above is the complete layout surface. `grep -rn "fitText\|measureText\|safe\|overflow\|clamp\|maxWidth\|withinWidth" src/ sub.mjs` returns only the three `fitText` lines in `Page.tsx` (3, 34, 37). There is no collision detection, no vertical-overflow handling, and no other measurement anywhere in the repo.

## B. Voice-visual coordination

### B1. whisper.cpp token-level timestamps → `Caption[]` (the timing ground truth)

**Where:** `vendor/template-tiktok/sub.mjs:40-58` (audio extraction at `sub.mjs:24-30`)

**What it does:** The offline script extracts a 16 kHz WAV from each video (`npx remotion ffmpeg -i ... -ar 16000`, the rate whisper.cpp requires), then transcribes with `tokenLevelTimestamps: true` and `splitOnWord: true`, so every word carries a measured `fromMs`/`toMs`. `toCaptions` normalizes whisper's raw output into `@remotion/captions`' `Caption[]`, which is written as JSON into `public/` next to the video — the single timing artifact every visual reads. Transcription is idempotent (`sub.mjs:71-81` skips files whose JSON exists).

**Load-bearing code:**
```js
const whisperCppOutput = await transcribe({
  inputPath: filePath,
  model: WHISPER_MODEL,
  tokenLevelTimestamps: true,
  whisperPath: WHISPER_PATH,
  whisperCppVersion: WHISPER_VERSION,
  printOutput: false,
  translateToEnglish: false,
  language: WHISPER_LANG,
  splitOnWord: true,
});

const { captions } = toCaptions({
  whisperCppOutput,
});
```

**Transferable lesson:** This is the same measure-don't-assume pattern as our ASR lane: a build-time step produces a word-timestamp JSON artifact, and *all* runtime timing derives from it. The `Caption[]` shape (`{text, startMs, endMs, timestampMs, confidence}`) is a good minimal interchange format between an ASR lane and a composer.

### B2. Composition duration derived from the media, not declared

**Where:** `vendor/template-tiktok/src/CaptionedVideo/index.tsx:29-39`

**What it does:** `calculateMetadata` reads the actual video duration with `getVideoMetadata` and returns `durationInFrames = floor(durationInSeconds * fps)` — the composition length is a function of the narration-bearing media, never a hand-set number. Changing the input video automatically resizes the timeline.

**Load-bearing code:**
```tsx
export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  const fps = 30;
  const metadata = await getVideoMetadata(props.src);

  return {
    fps,
    durationInFrames: Math.floor(metadata.durationInSeconds * fps),
  };
};
```

**Transferable lesson:** `calculateMetadata` is the Remotion-native hook for "audio length drives timeline length" — the same contract as our Wave 3.5 reconcile (`sum(cueFrames)` becomes the composition duration) expressed as a first-class Remotion API instead of a generated module.

### B3. Temporal paging: `createTikTokStyleCaptions` groups word tokens into pages by a single time knob

**Where:** `vendor/template-tiktok/src/CaptionedVideo/index.tsx:49-53,93-98`

**What it does:** The word-level `Caption[]` is folded into *pages* (`TikTokPage { startMs, text, tokens[] }`) by one parameter, `combineTokensWithinMilliseconds` — tokens starting within 1200 ms of a page's start join that page. The knob doubles as the display-density control: 200 ms ≈ one word at a time, 1500 ms ≈ many words. Paging is therefore purely audio-derived; no manual "caption cue" authoring exists.

**Load-bearing code:**
```tsx
const SWITCH_CAPTIONS_EVERY_MS = 1200;
...
const { pages } = useMemo(() => {
  return createTikTokStyleCaptions({
    combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
    captions: subtitles ?? [],
  });
}, [subtitles]);
```

**Transferable lesson:** Deriving caption grouping mechanically from token timestamps with ONE density parameter removes an entire authoring surface; our caption layer could adopt `createTikTokStyleCaptions` (or its algorithm) directly on top of the per-cue ASR tokens instead of hand-chunking caption text.

### B4. One `<Sequence>` per caption page, end-clamped to the next page's start (structural non-overlap in time)

**Where:** `vendor/template-tiktok/src/CaptionedVideo/index.tsx:110-131`

**What it does:** Each page mounts as its own `<Sequence from={pageStartFrame}>` whose duration is `min(nextPage.startMs → frames, start + cap)` — a page is unconditionally cut when the next page begins, so two caption pages can never be on screen simultaneously; zero/negative durations are dropped. Frame positions convert from ms via the composition fps. (The `+ SWITCH_CAPTIONS_EVERY_MS` term in the clamp is a frames/ms unit bug — see C1 — but the next-page clamp dominates for all but the last page.)

**Load-bearing code:**
```tsx
const subtitleStartFrame = (page.startMs / 1000) * fps;
const subtitleEndFrame = Math.min(
  nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
  subtitleStartFrame + SWITCH_CAPTIONS_EVERY_MS,
);
const durationInFrames = subtitleEndFrame - subtitleStartFrame;
if (durationInFrames <= 0) {
  return null;
}

return (
  <Sequence key={index} from={subtitleStartFrame} durationInFrames={durationInFrames}>
```

**Transferable lesson:** Making each timed unit its own `<Sequence>` whose end is *derived from the successor's start* is the structural way to make temporal overlap impossible — the identical idea to our cue-anchored per-clip mounting ("a clip can never cross a cue boundary"), applied to captions.

### B5. Per-token highlight driven by measured word onsets (karaoke sync)

**Where:** `vendor/template-tiktok/src/CaptionedVideo/Page.tsx:32,67-87`

**What it does:** Inside a page, the current time is converted to ms (`timeInMs = (frame / fps) * 1000`, frame being *sequence-local* because the page is mounted in its own `<Sequence>`), and each token compares its whisper-measured `fromMs`/`toMs` — rebased to the page start — against it. The token whose window contains the playhead renders in the highlight color; everything else stays white. No step constant, no even grid: highlight cadence is exactly the speech cadence.

**Load-bearing code:**
```tsx
{page.tokens.map((t) => {
  const startRelativeToSequence = t.fromMs - page.startMs;
  const endRelativeToSequence = t.toMs - page.startMs;

  const active =
    startRelativeToSequence <= timeInMs &&
    endRelativeToSequence > timeInMs;
```

**Transferable lesson:** This is the cleanest published example of our "spoken enumeration binds to token onsets, never a step constant" law: token-local windows compared against sequence-local time. The rebase-to-sequence-start step (`t.fromMs - page.startMs`) is exactly our `cue.tokenOnsets` cue-local convention.

### B6. Page entrance animation keyed to sequence-local frame (audio-timed re-trigger for free)

**Where:** `vendor/template-tiktok/src/CaptionedVideo/SubtitlePage.tsx:15-22`

**What it does:** The pop-in spring uses `useCurrentFrame()` with no offset; because every page lives in its own `<Sequence>`, the frame counter restarts at 0 at each page's audio-derived start, so the entrance animation re-fires exactly on each spoken-page boundary without any explicit timing code. `durationInFrames: 5` bounds the spring so it settles quickly.

**Load-bearing code:**
```tsx
const enter = spring({
  frame,
  fps,
  config: {
    damping: 200,
  },
  durationInFrames: 5,
});
```

**Transferable lesson:** Put the timing in the `<Sequence>` mount and keep child animations naive (frame 0 = my start). Children written this way are automatically re-usable at any audio-derived boundary — the zero-frame-literals rule falling out of composition structure.

### B7. Dev-loop re-sync: `watchStaticFile` re-fetches captions when the ASR artifact changes

**Where:** `vendor/template-tiktok/src/CaptionedVideo/index.tsx:81-91`

**What it does:** In the studio, the composition watches the caption JSON with `watchStaticFile` and re-fetches on change, so re-running `node sub.mjs` (e.g. after changing whisper model or fixing audio) hot-reloads the timing into the preview without a restart. Combined with the `delayRender` handle it also blocks render until the captions exist.

**Load-bearing code:**
```tsx
useEffect(() => {
  fetchSubtitles();

  const c = watchStaticFile(subtitlesFile, () => {
    fetchSubtitles();
  });

  return () => {
    c.cancel();
  };
}, [fetchSubtitles, src, subtitlesFile]);
```

**Transferable lesson:** Treat the ASR artifact as a watched input in the preview loop — regenerate voice/alignment, see the retimed lesson instantly. Cheap to add wherever a generated timing artifact is fetched rather than imported.

**Coverage proof for B — music/ducking is NONE:** `grep -rn "volume\|duck\|Audio\|music" src/` returns zero audio-API hits (only `interpolate` matches on transform lines). There is no `<Audio>` tag, no music bed, and no ducking anywhere; the only audio is the embedded track of the `OffthreadVideo` itself, played untouched.

## C. Anti-patterns & gaps

1. **Frames+milliseconds unit-mismatch bug in the page-duration clamp** — `src/CaptionedVideo/index.tsx:113-116`: `subtitleStartFrame + SWITCH_CAPTIONS_EVERY_MS` adds `1200` (milliseconds) to a *frame* count. The intended 1.2 s cap (36 frames at 30 fps) is actually a 40 s cap, so the clamp is a no-op for interior pages and the *last* page lingers on screen up to 40 s after speech ends (until composition end). Correct would be `subtitleStartFrame + (SWITCH_CAPTIONS_EVERY_MS / 1000) * fps`. A textbook argument for typed frame/ms units.
2. **Hardcoded vertical layout** — `Page.tsx:15-21`: `bottom: 350, height: 150` are absolute pixels tuned to 1080×1920. Render the same composition at another height and the "safe" band lands somewhere else. Only the width axis is composition-relative.
3. **Stroke width not scaled with fitted font size** — `Page.tsx:41,49`: fontSize can shrink well below 120 for long pages while `WebkitTextStroke` stays `20px`, so shrunken text gets a proportionally enormous stroke that can swallow thin glyphs. Stroke should be a fraction of `fontSize`.
4. **No font-size floor / no re-paging on overflow** — `Page.tsx:34-41`: `fitText` will happily return an unreadably small size for a long page; nothing feeds back into paging ("split this page") when the fitted size drops below a legibility threshold. Layout and paging don't negotiate.
5. **Fractional frames passed to `<Sequence>`** — `index.tsx:112,125`: `(page.startMs / 1000) * fps` is not rounded, so `from`/`durationInFrames` are fractional; sub-frame offsets accumulate into off-by-one visual/audio boundaries. Our pipeline's explicit frame rounding at reconcile is the fix.
6. **No music/SFX track and no ducking** — proven NONE above; anyone adding a bed must invent the entire second-track architecture themselves.
7. **Fragile filename handling in the pipeline script** — `sub.mjs:89`: `entry.split(".")[0]` truncates any filename containing a dot (`my.take.2.mp4` → `my.wav`), silently colliding temp WAVs; the `"webcam"→"subs"` string replace (`sub.mjs:56,77`) only works for a specific folder convention and is a no-op otherwise.
8. **No tests, no CI** — only `lint: eslint src && tsc` (`package.json:9`); the unit bug in (1) is exactly the class a single timing test would have caught.

## D. Verdict

Worth stealing, ranked:

1. **`fitText` measure-then-shrink with a desired-size ceiling and composition-relative width (A1+A2)** — the single most transferable mechanism; it makes data-driven text structurally unable to overflow and belongs in any lesson title/caption path.
2. **Per-token highlight from ASR onsets rebased to sequence-local time (B5)** — a 10-line reference implementation of onset-bound enumeration; validates our token-onset law and shows the minimal form.
3. **Successor-clamped per-page `<Sequence>` mounting (B4) + naive sequence-local child animation (B6)** — temporal non-overlap and re-triggering entrance animation both fall out of structure, not timing code.
4. **Font-load-before-measure sequencing under `delayRender` (A5)** — a silent-corruption class our measurement gates should explicitly guard.

Equally instructive as a cautionary tale: even a first-party ~350-line template ships a frames-vs-ms unit bug (C1) and a pixel-hardcoded safe area (C2) — supporting typed time units and fraction-of-composition zones as pipeline-level invariants rather than per-scene discipline.
