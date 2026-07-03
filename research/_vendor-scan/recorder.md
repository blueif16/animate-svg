# recorder — vendor scan (2026-07-03)

https://github.com/remotion-dev/recorder @ 1512730 — Remotion's production app for talking-head + screen-recording videos: records webcam/display in-browser, transcribes with whisper.cpp, and auto-lays-out scenes with word-timed captions.

## What this repo is

First-party Remotion product (package `template-recorder`, version tracks Remotion `4.0.277`), maintained by the core team — it is the origin of the `loadFont`+`measureText` patterns cited in official Remotion docs. Architecture: a Vite/Bun recording UI (`src/`) writes webcam/display MP4s + whisper caption JSONs into `public/<folder>/`; the Remotion composition (`remotion/`) derives ALL timing and layout in `calculateMetadata` (async, before render) from the recorded media + captions, then renders scenes as a flat list of `<Sequence>`s. Maturity signals: shipped product used for Remotion's own channel, typed end-to-end with Zod-validated scene configs, `satisfies never` exhaustiveness checks; but only 4 small test files (`tests/` covers backticks/device-names/monospace — the layout engine has zero tests). Vendored as a shallow clone (1 commit visible).

## A. Layout & overlay prevention

### A1. Pure layout engine: one `Layout` rect type, computed once per scene before render

**Where:** `vendor/recorder/remotion/layout/get-layout.ts:278-316`, `vendor/recorder/remotion/layout/layout-types.ts:1-11`

**What it does:** Every visual box (webcam, display, B-roll, captions) is a plain `{left, top, width, height, borderRadius, opacity}` record. `getVideoSceneLayout` computes all of them per scene as a pure function of `(canvasLayout, measured video dimensions, webcamPosition)` — inside `calculateMetadata`, not inside components (`add-metadata-to-scene.ts:111-115` stores the result on the scene metadata). Scene components only ever *read* these rects; no component invents its own geometry. Overlap prevention is by construction: each box is derived from the remaining space after the previous one (see A3-A5).

**Load-bearing code:**
```ts
export const getVideoSceneLayout = ({ canvasLayout, videos, webcamPosition }): VideoSceneLayout => {
  const canvasSize = getDimensionsForLayout(canvasLayout);
  const { displayLayout, webcamLayout, bRollLayout, bRollEnterDirection } =
    getDisplayAndWebcamLayout({ canvasSize, webcamPosition, canvasLayout, videos });
  const subtitleLayout = getCaptionsLayout({
    canvasLayout, canvasSize, displayLayout, webcamLayout,
    webcamPosition: webcamPosition,
  });
```
(`get-layout.ts:278-303`; the `Layout` type is `layout-types.ts:8-11`)

**Transferable lesson:** This is the exact analogue of our `layout.ts`-per-lesson idea done right: geometry lives in one pure module keyed by declarative inputs, computed before any frame renders, and every consumer (scene, transitions, manifest) reads the same rects — so a bbox manifest could be derived from it mechanically instead of hand-mirrored.

### A2. Safe-space arithmetic: one constant, multiplied by the number of gaps

**Where:** `vendor/recorder/config/layout.ts:22-25`, `vendor/recorder/remotion/layout/get-safe-space.ts:4-10`

**What it does:** A single 30px `getSafeSpace(canvasLayout)` is the only margin unit. Every layout formula spaces boxes as `safeSpace * N` where N = number of gaps between canvas edge and boxes (×2 for edge-element-edge, ×3 when a third element sits between). Landscape reserves an extra 140px `bottomSafeSpace` so the display never collides with the SRT caption strip at the bottom. Because gaps are counted, not eyeballed, two adjacent boxes can never overlap: the second box's size is computed FROM the remaining space (A4).

**Load-bearing code:**
```ts
export const LANDSCAPE_DISPLAY_MAX_WIDTH_OF_CANVAS = 0.77;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getSafeSpace = (_canvasLayout: CanvasLayout) => 30;
```
(`config/layout.ts:22-25`) and
```ts
export const getBottomSafeSpace = (canvasLayout: CanvasLayout) => {
  if (canvasLayout === "landscape") {
    return 140;
  }
  return getSafeSpace(canvasLayout);
};
```
(`get-safe-space.ts:4-10`)

**Transferable lesson:** Replace per-lesson zone padding literals with one `safeSpace(canvas)` unit and express every zone edge as `safeSpace * gapCount` — collisions between zones then become arithmetically impossible instead of gate-caught.

### A3. `fitElementSizeInContainer`: aspect-fit + center with a hard error guard

**Where:** `vendor/recorder/remotion/layout/fit-element.ts:6-36`

**What it does:** The one primitive for putting variable-aspect media into a fixed box: take min of width/height ratios, scale, center. Crucially it *throws* (with actual numbers in the message) if the result exceeds the container by more than 1e-6 — an overflow is a crash at metadata-computation time, not a silently clipped render.

**Load-bearing code:**
```ts
const heightRatio = containerSize.height / elementSize.height;
const widthRatio = containerSize.width / elementSize.width;
const ratio = Math.min(heightRatio, widthRatio);
const newWidth = elementSize.width * ratio;
const newHeight = elementSize.height * ratio;
if (newWidth > containerSize.width + 0.000001 ||
    newHeight > containerSize.height + 0.000001) {
  throw new Error(
    `Element is too big to fit into the container. Max size: ${containerSize.width}x${containerSize.height}, element size: ${newWidth}x${newHeight}`);
}
```
(`fit-element.ts:13-28`)

**Transferable lesson:** Make layout helpers fail loudly at compute time. Our reconcile/composer helpers should throw with measured numbers when a primitive's requested footprint exceeds its zone, instead of relying on the downstream `--measured` gate to notice.

### A4. Remaining-space allocation: display gets a budgeted fraction, webcam gets what's left

**Where:** `vendor/recorder/remotion/layout/get-display-size.ts:9-68`, `vendor/recorder/remotion/layout/get-webcam-size.ts:7-41`

**What it does:** The display (screen recording) is fitted into an explicit budget: at most 3/5 of the safe height in square, at most 0.77 of canvas width in landscape (`LANDSCAPE_DISPLAY_MAX_WIDTH_OF_CANVAS`). The webcam is then sized from the *leftover*: `canvas − display − 3×safeSpace`, capped at 350px wide in landscape, with a fixed 400/350 aspect. Because the second box is defined as the residual of the first, the pair plus gaps always sums to ≤ canvas — no overlap possible.

**Load-bearing code:**
```ts
if (canvasLayout === "square") {
  const remainingHeight =
    canvasSize.height - displaySize.height - getSafeSpace(canvasLayout) * 3;
  return { height: remainingHeight, width: remainingHeight * (1 / webcamRatio) };
}
if (canvasLayout === "landscape") {
  const remainingWidth =
    canvasSize.width - displaySize.width - getSafeSpace(canvasLayout) * 3;
  const maxWidth = 350;
  const width = Math.min(remainingWidth, maxWidth);
```
(`get-webcam-size.ts:16-30`; the 3/5 and 0.77 budgets are `get-display-size.ts:21-25,38-41`)

**Transferable lesson:** Size sibling zones as residuals of a budgeted primary zone rather than as independent constants — the "sum of parts fits" invariant then holds by definition and survives any change of media aspect ratio.

### A5. Captions zone = the space the webcam doesn't use (and text budgeted at 75%)

**Where:** `vendor/recorder/remotion/layout/get-captions-layout.ts:12-57`, `vendor/recorder/remotion/layout/get-layout.ts:38-40`

**What it does:** In square layout the caption box is computed from the webcam's rect: with no display it takes the vertical band the webcam doesn't occupy (`canvas − webcamHeight − 3×safe`); with a display it takes the horizontal band beside the webcam, on the opposite side of the webcam position. Related: the fullscreen-webcam path caps the video at 75% of the height explicitly "to leave place for the subtitles". Captions structurally cannot cover the face or the screen recording.

**Load-bearing code:**
```ts
return {
  height: webcamLayout.height,
  top: webcamLayout.top,
  left: isWebCamRight(webcamPosition)
    ? getSafeSpace(canvasLayout)
    : webcamLayout.width + getSafeSpace(canvasLayout) * 2,
  width:
    canvasSize.width - webcamLayout.width - getSafeSpace(canvasLayout) * 3,
  borderRadius,
  opacity: 1,
};
```
(`get-captions-layout.ts:46-56`; the 75% budget: `get-layout.ts:39-40` — `// Video can take up 75% of the height to leave place for the subtitles`)

**Transferable lesson:** Give captions a first-class zone derived from the teaching-content rects (opposite side, residual width) instead of a fixed bottom strip — it repositions itself automatically when the layout flips.

### A6. Measured caption paging: `fillTextBox` decides how many words fit, then a balance pass

**Where:** `vendor/recorder/remotion/captions/processing/layout-captions.ts:71-158` (paging), `:14-69` (balancing)

**What it does:** Caption pages are not "N words per page": `fillTextBox({maxBoxWidth, maxLines})` from `@remotion/layout-utils` adds word after word with the *real* font metrics (`validateFontIsLoaded: true` — throws if the font isn't actually loaded) until `exceedsBox`, so a page is exactly what fits the measured box. `balanceCaptions` then cleans the cut: if >90% fit it pulls the cut back 5 words to avoid a hanging 2-word page, walks back up to 3 words to prefer cutting after `,`/`.`, and refuses to cut inside a monospace (code) span. Box width feeds in minus padding and border (`layoutCaptions:136-144`), and `maxLines` is itself derived from the box height (A7).

**Load-bearing code:**
```ts
const { add } = fillTextBox({ maxBoxWidth: boxWidth, maxLines });
let captionsFitted = 0;
for (const caption of captions) {
  ...
  const { exceedsBox } = add({
    text: removeMonospaceTicks(caption).text,
    fontFamily: fontFamily as string,
    fontWeight: fontWeight as string,
    fontSize,
    additionalStyles,
    validateFontIsLoaded: true,
  });
  if (exceedsBox) { break; }
```
(`layout-captions.ts:82-102`) and the anti-orphan rule:
```ts
if (captionsFitted / captions.length > 0.9) {
  // Prevent a few hanging words at the end
  bestCut = captions.length - 5;
}
for (let i = 1; i < 4; i++) {
  const index = bestCut - i;
  const caption = (captions[index] as Caption).text.trim();
  if (caption.endsWith(",") || caption.endsWith(".")) {
    bestCut = index + 1;
    break;
  }
}
```
(`layout-captions.ts:29-41`)

**Transferable lesson:** This is the canonical fix for caption overflow: measure with the real font into the real box, and post-process the cut point for linguistic quality (punctuation, orphans). Directly adoptable for our caption layer via `@remotion/layout-utils`.

### A7. Line count derived from box height; line-height constant shared between measure and render

**Where:** `vendor/recorder/remotion/captions/boxed/components/CaptionSentence.tsx:33-46`, `vendor/recorder/remotion/captions/boxed/components/SquareSubtitles.tsx:7-20`

**What it does:** `maxLines` for the text-fitting pass is not configured — it's `floor((boxHeight − 50) / (fontSize × LINE_HEIGHT))` from the computed caption rect. The same `LINE_HEIGHT = 1.2` constant is used both here (measurement) and as the CSS `lineHeight` + container `height` in `SquareSubtitles` (render), so what was measured is exactly what is drawn.

**Load-bearing code:**
```ts
export const getSubtitlesLines = ({ boxHeight, fontSize }) => {
  const boxPadding = 50;
  const nrOfLines = Math.floor(
    (boxHeight - boxPadding) / (fontSize * LINE_HEIGHT),
  );
  return nrOfLines;
};
```
(`CaptionSentence.tsx:33-46`; `export const LINE_HEIGHT = 1.2;` at `SquareSubtitles.tsx:7`, applied as `height: lines * fontSize * LINE_HEIGHT` at `:18` and `lineHeight: LINE_HEIGHT` at `:24`)

**Transferable lesson:** Any measure-then-render split must share its typography constants from one module; deriving `maxLines` from the zone height means a smaller zone silently gets fewer lines instead of overflowing.

### A8. Font-loaded-before-measure: `WaitForFonts` gate + top-level `delayRender`

**Where:** `vendor/recorder/remotion/helpers/WaitForFonts.tsx:5-43`, `vendor/recorder/config/fonts.ts:27-31,54-58`

**What it does:** All fonts load at module scope via `@remotion/google-fonts` `loadFont()`, exposed as one `waitForFonts()` promise; `config/fonts.ts` additionally holds a top-level `delayRender("Loading fonts")`. The `WaitForFonts` component renders `null` (with its own `delayRender`) until the promise resolves, and captions are mounted inside it (`BoxedCaptions.tsx:35`). The comment states the reason: measurement with a fallback font produces wrong caption layout. This is the pattern the official docs borrowed.

**Load-bearing code:**
```tsx
// Missing fonts can influence the layout calculation
// and cause the subtitles to be misaligned.

// Use this component to only mount components once all fonts are loaded
export const WaitForFonts: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() =>
    delayRender("Waiting for fonts to be loaded"),
  );
```
(`WaitForFonts.tsx:5-16`)

**Transferable lesson:** Wrap every component that measures text (fitText, fillTextBox, measureText) in a fonts-loaded gate, plus `validateFontIsLoaded: true` as a belt-and-braces check — otherwise measurements are non-deterministic between studio and Lambda renders.

### A9. `measureText` for stable widths: size a box to the widest content it will ever hold

**Where:** `vendor/recorder/remotion/chapters/landscape/ChapterTimestamp.tsx:10-17,26-37`

**What it does:** The chapter timestamp pill is sized by measuring the *last* chapter's timestamp string (the longest one, e.g. `12:34`) with `measureText`, so every chapter's pill has an identical width and nothing jitters or overflows as timestamps grow digits.

**Load-bearing code:**
```ts
const getChapterWidth = (text: string) => {
  return measureText({
    text,
    fontFamily: TITLE_FONT.fontFamily as string,
    fontWeight: TITLE_FONT.fontWeight as string,
    fontSize: chapterFontSize,
  }).width;
};
```
(`ChapterTimestamp.tsx:10-17`; used as `width: biggestWidth + PADDING_HORIZONTAL * 2` at `:37`)

**Transferable lesson:** For counters/labels whose text changes over time (counts 1→10, timers), measure the maximal string once and fix the box — kills both per-frame reflow and late-scene overflow.

### A10. Layout-to-layout interpolation: transitions animate between two *valid* layouts

**Where:** `vendor/recorder/remotion/animations/interpolate-layout.ts:4-62`

**What it does:** Scene transitions don't free-hand animate; they interpolate every field of the `Layout` record (left/top/width/height/borderRadius/opacity) between the previous scene's computed rect and the current one's. Since both endpoints are non-overlapping layouts from the engine, intermediate frames stay sane; `interpolateLayoutAndFade` adds a mid-point opacity cut for non-morphable content.

**Load-bearing code:**
```ts
export const interpolateLayout = (firstLayout: Layout, secondLayout: Layout, progress: number) => {
  const left = interpolate(progress, [0, 1], [firstLayout.left, secondLayout.left]);
  const top = interpolate(progress, [0, 1], [firstLayout.top, secondLayout.top]);
  const width = interpolate(progress, [0, 1], [firstLayout.width, secondLayout.width]);
  const height = interpolate(progress, [0, 1], [firstLayout.height, secondLayout.height]);
  const borderRadius = interpolate(progress, [0, 1],
    [firstLayout.borderRadius, secondLayout.borderRadius]);
```
(`interpolate-layout.ts:4-33`)

**Transferable lesson:** Store zone rects as data and tween rect→rect for scene changes — identity-preserving movement (our continuity invariant) falls out for free, and the animation can never leave the union of two valid layouts.

### A11. B-roll scheduling rules: clamp to scene end, resolve overlaps recursively

**Where:** `vendor/recorder/remotion/scenes/BRoll/apply-b-roll-rules.ts:42-80` (rules), `:4-40` (overlap fix)

**What it does:** User-placed B-roll inserts get normalized at metadata time: rule 1 clamps every B-roll to end before `sceneDuration − SCENE_TRANSITION_DURATION` (so it never bleeds into the next scene's transition); rule 2 (`ensureNoBRollOverlaps`, recursive) extends an earlier B-roll to outlast any later overlapping one, so stacked B-rolls never flash the base layer mid-overlap.

**Load-bearing code:**
```ts
const mustEndAt =
  sceneDurationInFrames -
  (willTransitionToNextScene ? SCENE_TRANSITION_DURATION : 0);

const bRollsEnsureSceneEnds = sortedBRolls.map((bRoll) => {
  if (bRoll.from + bRoll.durationInFrames > mustEndAt) {
    return { ...bRoll, durationInFrames: mustEndAt - bRoll.from };
  }
  return bRoll;
});
```
(`apply-b-roll-rules.ts:61-73`)

**Transferable lesson:** Encode temporal-overlay invariants ("must end before transition", "no mid-overlap gaps") as a normalization pass over declarative overlay data at reconcile time — same shape as our Wave 3.5 clamps, extended to overlays/sketch marks.

## B. Voice-visual coordination

### B1. Whisper.cpp transcription with token-level timestamps, cached per recording

**Where:** `vendor/recorder/scripts/captions/caption-file.ts:41,57-75`, `vendor/recorder/sub.ts:18-51`, `vendor/recorder/config/whisper.ts:5`

**What it does:** For every webcam recording, `sub.ts` extracts 16kHz WAV via ffmpeg, runs whisper.cpp (`medium.en` model) with `tokenLevelTimestamps: true`, converts to the `@remotion/captions` `Caption[]` shape (`{text, startMs, endMs, timestampMs}` per word/token) and writes `captions-*.json` next to the video. Already-transcribed files are skipped (`sub.ts:35-36`), making the word-timing artifact cached, versionable ground truth.

**Load-bearing code:**
```ts
const whisperCppOutput = await transcribe({
  inputPath: wavFile,
  model: WHISPER_MODEL,
  tokenLevelTimestamps: true,
  whisperPath: WHISPER_PATH,
  translateToEnglish: false,
  printOutput: true,
  ...
});
const { captions } = toCaptions({ whisperCppOutput: whisperCppOutput });
```
(`caption-file.ts:57-75`)

**Transferable lesson:** Same architecture as our sherpa-onnx ASR lane: word timestamps as a cached on-disk artifact keyed to the audio file. The `@remotion/captions` `Caption` shape is a good interchange format if we ever want to reuse Remotion's caption utilities directly.

### B2. Scene duration derived from speech: first/last word timestamps ± fixed padding

**Where:** `vendor/recorder/remotion/calculate-metadata/get-start-end-frame.ts:6-7,9-40,86-115`

**What it does:** A scene's visible window is computed from the transcript, not the raw recording: start = first word's `timestampMs` minus `START_FRAME_PADDING = ceil(FPS/4)` (0.25s pre-roll), end = last word's `timestampMs` plus `END_FRAME_PADDING = FPS/2` (0.5s tail), both clamped to `[0, mediaDuration]` and adjustable by per-scene `startOffset`/`endOffset`. Dead air before the first word and after the last word is trimmed automatically; `durationInFrames = derivedEndFrame − actualStartFrame` (`add-metadata-to-scene.ts:116`).

**Load-bearing code:**
```ts
const START_FRAME_PADDING = Math.ceil(FPS / 4);
const END_FRAME_PADDING = FPS / 2;

const deriveEndFrameFromSubs = (captions: Caption[] | null) => {
  ...
  const lastCaption = captions[captions.length - 1];
  ...
  const lastFrame = Math.floor((lastCaption.timestampMs / 1000) * FPS);
  return lastFrame;
};
```
(`get-start-end-frame.ts:6-21`)

**Transferable lesson:** Their `speech-end + 0.5s tail` is exactly our `narrationFrames + tail ≤ 9 frames` reconcile law, derived from ASR evidence rather than TTS request length — validates trimming TTS padding per clip and treating measured word timing as the duration authority.

### B3. Whole-timeline assembly in `calculateMetadata`: media-measured durations, transition overlap subtraction

**Where:** `vendor/recorder/remotion/calculate-metadata/calc-metadata.ts:10-50`, `vendor/recorder/remotion/calculate-metadata/add-durations-to-scenes.ts:20-82`, `vendor/recorder/remotion/calculate-metadata/add-metadata-to-scene.ts:52-59`

**What it does:** `calculateMetadata` (async) measures every recording with `parseMedia` (`durationInSeconds`, `dimensions`), fetches captions, derives per-scene durations (B2), then chains scenes: each scene's `from` is the running total, and when two scenes cross-transition the total is *reduced* by `SCENE_TRANSITION_DURATION` (15 frames) so transitions overlap instead of padding. The composition's `durationInFrames`, `width`, `height` all come out of this one pass — nothing about timing is hardcoded in components.

**Load-bearing code:**
```ts
if (isTransitioningIn) {
  totalDurationInFrames -= SCENE_TRANSITION_DURATION;
}

const from = totalDurationInFrames;
totalDurationInFrames += sceneAndMetadata.durationInFrames;
```
(`add-durations-to-scenes.ts:36-41`)

**Transferable lesson:** Their `calculateMetadata` is the in-Remotion equivalent of our Wave 3.5 reconcile — one mechanical pass that turns measured media into chained `from`/`duration` for every sequence. The overlap subtraction trick is worth stealing if we ever add cross-cue transitions.

### B4. Caption pages mounted as `<Sequence>`s at word-timestamp boundaries, with anti-flicker lead-in

**Where:** `vendor/recorder/remotion/captions/boxed/components/CaptionSentence.tsx:80-111`

**What it does:** Each measured caption page (A6) becomes its own `<Sequence from={startFrame - trimStart}>` where `startFrame` is the first word's `startMs` converted to frames and the end is the last word's `endMs`. The first page starts a full second early ("show it a bit earlier to avoid flicker of caption showing only shortly after the video") and the last page lingers 1s. A 5-frame opacity fade wraps each page (`FadeSentence`, `:52-69`).

**Load-bearing code:**
```tsx
const normalStartFrame = (getStartOfSegment(segment) / 1000) * fps;
// If first caption of a segment, show it a bit earlier to avoid flicker
// of caption showing only shortly after the video
const startFrame = isFirst ? normalStartFrame - fps : normalStartFrame;
...
<Sequence
  showInTimeline={false}
  from={startFrame - trimStart}
  durationInFrames={endFrame === null ? undefined : endFrame - startFrame}
  layout="none"
>
```
(`CaptionSentence.tsx:81-100`)

**Transferable lesson:** Page boundaries = measured token boundaries, mounted as Sequences (never per-frame string slicing); the deliberate lead-in/lag-out asymmetry at scene edges is a cheap polish rule our caption layer lacks.

### B5. Word-level highlight driven by `startMs`: 100ms color fade + active-word state

**Where:** `vendor/recorder/remotion/captions/boxed/components/SingleCaption.tsx:24,51-56,96-117`

**What it does:** Every word renders greyed until `current time ≥ its startMs`, with `interpolateColors` fading grey→appeared over a 100ms window ending exactly at the word's onset. A word is `active` from `startMs − 100` until `endMs − 100` (code tokens additionally get an accent background + a subtle 5% spring scale pop). Time is recovered as `((frame + startFrame) / fps) * 1000` so highlighting stays aligned to the trimmed recording.

**Load-bearing code:**
```ts
return interpolateColors(
  time,
  [caption.startMs - WORD_FADE_IN_DURATION_IN_MS, caption.startMs],
  [captionColor.greyed, captionColor.appeared],
);
...
const appeared = caption.startMs - 100 <= time;
const active =
  appeared &&
  (caption.endMs === null || caption.endMs - 100 > time || isLast);
```
(`SingleCaption.tsx:51-56,113-117`)

**Transferable lesson:** This is `stepFramesFromOnsets` for captions: anchor the *end* of a fixed-length fade at the token onset (not the start), so the word is fully lit exactly when it is spoken — a subtle ordering rule worth copying into our read-along primitives.

### B6. Music ducking via `loudParts`: one volume function per music clip, speech scenes duck the bed

**Where:** `vendor/recorder/remotion/audio/AudioTrack.tsx:24-74,97-160`, `vendor/recorder/config/sounds.ts:5-7`

**What it does:** Background music is declared per scene (`soft|epic|euphoric|none|previous`); consecutive `previous` scenes merge into one looping `<Audio>` clip. The clip's volume is a *function of frame*: base envelope fades 0→`BACKGROUND_VOLUME` (0.04) over 30 frames and back out at the end; `loudParts` intervals — scenes with no narration (title/endcard scenes: `isLoud = scene.type !== "video-scene"`, `:121`) — ramp up to `REGULAR_VOLUME` (1) and back down, with a midpoint-split special case when the interval is shorter than two fades. Ducking is thus data-driven from the same scene metadata that drives visuals.

**Load-bearing code:**
```ts
const regularVolume = interpolate(
  f,
  [0, AUDIO_FADE_IN_FRAMES, durationInFrames - AUDIO_FADE_IN_FRAMES, durationInFrames - 1],
  [0, BACKGROUND_VOLUME, BACKGROUND_VOLUME, 0],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);
if (isLoudPart) {
  ...
  return interpolate(
    f,
    [isLoudPart[0], firstKeyFrame, secondKeyFrame, isLoudPart[1]],
    [regularVolume, REGULAR_VOLUME, REGULAR_VOLUME, regularVolume],
  );
}
```
(`AudioTrack.tsx:42-70`; constants `AUDIO_FADE_IN_FRAMES = 30`, `BACKGROUND_VOLUME = 0.04`, `REGULAR_VOLUME = 1` at `config/sounds.ts:5-7`)

**Transferable lesson:** Their 3-point duck matches our `<LessonBgmLayer>` spec: express the bed as one volume *function* built from narration windows (our cue windows are richer than their scene-type heuristic), including the short-interval midpoint fallback for gaps shorter than two fade lengths. 0.04 under-speech vs 1.0 solo is a calibrated ratio worth noting.

### B7. Filler-token scrub before any timing is derived

**Where:** `vendor/recorder/remotion/captions/processing/postprocess-subs.ts:6-12,52-63`

**What it does:** Whisper artifacts (`[PAUSE]`, `[BLANK_AUDIO]`, `[Silence]`, `[INAUDIBLE]`), blank tokens, and multi-token bracket spans are stripped, then autocorrect rules apply, then backtick fixing — and this SAME pipeline runs both for display AND inside `getStartEndFrame` before duration derivation (`get-start-end-frame.ts:98`). So a trailing `[BLANK_AUDIO]` can't inflate a scene's duration and a phantom word can't get a highlight.

**Load-bearing code:**
```ts
const FILLER_WORDS = [
  "[PAUSE]",
  "[BLANK_AUDIO]",
  "[Silence]",
  "[silence]",
  "[INAUDIBLE]",
];
```
(`postprocess-subs.ts:6-12`; pipeline at `:52-63`)

**Transferable lesson:** Scrub ASR junk in ONE shared function consumed by both the timing deriver and the renderer — split pipelines drift and produce captions timed to tokens that no longer exist.

### B8. SRT sidecar computed from the same word timestamps (42-char lines, orphan prevention)

**Where:** `vendor/recorder/remotion/captions/srt/helpers/calculate-srt.ts:7-39,73-83`

**What it does:** For landscape videos an `.srt` is derived from the identical `Caption[]`: greedy line fill capped at the SRT-standard 42 chars, an orphan rule (if <4 captions remain and the line is >half full, break early so the last line isn't 1 word), and all timestamps re-based by `−startFrame/FPS` so the SRT matches the *trimmed* timeline, clamped at 0. Emitted during render via an artifact (`EmitSrtFile` mounted in `Main.tsx:90-92`).

**Load-bearing code:**
```ts
const MAX_CHARS_PER_LINE = 42;
...
const preventOrphanCaption =
  remainingCaptions.length < 4 &&
  remainingCaptions.length > 1 &&
  filledCharactersInLine > MAX_CHARS_PER_LINE / 2;
...
const offset = -(startFrame / FPS) * 1000;
const firstTimestampMs = Math.max(0, Math.round(firstSegment.startMs + offset));
```
(`calculate-srt.ts:9,22-25,73-77`)

**Transferable lesson:** Derive every caption surface (burned-in, SRT, editor) from one token array with per-surface pagination rules; remember to re-base timestamps when the visual timeline trims the audio head.

### B9. Transition sound effects keyed to the layout change type

**Where:** `vendor/recorder/remotion/scenes/VideoScene/SoundEffects.tsx:17-35`, mounted only when a scene transitions in (`Scene.tsx:207-212`)

**What it does:** The whoosh played at a scene boundary is chosen by *what the layout does*: webcam shrinking to a miniature → `shrink.m4a` (vol 0.2), growing from miniature → `grow.m4a` (0.2), any other transition → `whip.wav` (0.1). Audio-visual coupling is derived from the two scenes' computed layouts (`isShrinkingToMiniature` compares them), not hand-placed.

**Load-bearing code:**
```tsx
if (isShrinkingToMiniature({ firstScene: previousScene, secondScene: sceneAndMetadata })) {
  return <Audio src={staticFile("sounds/shrink.m4a")} volume={0.2} />;
}
if (isGrowingFromMiniature({ firstScene: previousScene, secondScene: sceneAndMetadata })) {
  return <Audio src={staticFile("sounds/grow.m4a")} volume={0.2} />;
}
return <Audio src={staticFile("sounds/whip.wav")} volume={0.1} />;
```
(`SoundEffects.tsx:17-35`)

**Transferable lesson:** SFX selection can be a pure function of the layout delta instead of an authored SFX→beat map entry — our composer could auto-fire grow/shrink sounds from zone-rect changes and reserve authored SFX for semantic beats.

## C. Anti-patterns & gaps

- **Layout correctness is asserted nowhere except `fitElementSizeInContainer`.** The residual-space formulas can go negative with no guard: `getCaptionsLayout` returns `height: canvasSize.height - webcamLayout.height - getSafeSpace(canvasLayout) * 3` (`get-captions-layout.ts:32-35`) and `getNonFullscreenWebcamSize` returns `remainingHeight` unchecked (`get-webcam-size.ts:17-23`). A tall display in square mode yields a negative-height webcam/caption box that renders garbage silently. Our `--measured` gate philosophy (verify, don't trust construction) is the missing complement.
- **Duplicated constant with drift risk:** the caption font size exists twice — `getSubtitlesFontSize = () => 56` (`CaptionSentence.tsx:29-31`, exported but unused by the main path) and `const SUBTITLES_FONT_SIZE = 56` (`AnimatedCaptions.tsx:25`). Editing one silently desyncs measurement from render. Same smell: `webcamRatio = 400/350` carries `// TODO: Use this also in the recording interface` (`get-webcam-size.ts:4-5`).
- **`balanceCaptions` is crash-prone on short inputs:** `const caption = (captions[index] as Caption).text.trim()` (`layout-captions.ts:36`) — `bestCut - i` can be negative when a page has <5 captions (bestCut set to `captions.length - 5` at `:31`), and the `as Caption` cast defeats the undefined check; `.text` would throw at metadata time. Cast-heavy style (`as Caption` ~10×) hides these.
- **Ducking granularity is scene-type, not speech:** `const isLoud = scene.type !== "video-scene"` (`AudioTrack.tsx:121`). Silence *inside* a talking scene never lifts the bed, and music stays at 0.04 through intra-scene pauses — no mid-gap rise like our 3-point duck. Word timestamps were available and unused here.
- **English-centric caption metrics:** `MAX_CHARS_PER_LINE = 42` (`calculate-srt.ts:9`), punctuation-based cut heuristics (`layout-captions.ts:37`), and `WHISPER_MODEL = "medium.en"` (`config/whisper.ts:5`) all assume space-separated Latin text; CJK would page wrongly (char-count ≠ width is partially saved by `fillTextBox` for burned-in, but SRT pagination is raw char counts).
- **No text-fitting for titles:** `Title.tsx:25-27` hardcodes `fontSize: 60` with `textWrap: "balance"` — a long title wraps to unbounded height with no measurement or fit; the repo owns `measureText` and doesn't use it here.
- **The layout engine has zero tests:** `tests/` contains 4 files (backticks, device names, monospace captions); none touch `layout/`, `calculate-metadata/`, or the caption paging math — the most intricate logic in the repo is verified only by eyeball.

## D. Verdict

Worth stealing, ranked:
1. **Measured caption paging (A6+A7+A8):** `fillTextBox` + `maxLines` derived from the zone rect + fonts-gated mounting + `validateFontIsLoaded` — the complete, production-proven answer to caption overflow; adoptable nearly verbatim via `@remotion/layout-utils`.
2. **Residual-space layout arithmetic (A2+A4+A5):** one safe-space unit × gap count, primary zone budgeted by fraction, siblings sized from the remainder — overlap-impossible-by-construction, and it composes with our measured-gate as defense in depth.
3. **Speech-derived durations in one async metadata pass (B2+B3):** first/last token ± 0.25s/0.5s padding, clamped, then chained `from` offsets with transition overlap subtracted — independently converges on our Wave 3.5 reconcile and confirms the cue-window law with a second production codebase.
4. **Volume-as-function ducking (B6):** the bed as a single frame→volume function assembled from timeline windows, with the short-interval midpoint fallback and the 0.04/1.0 calibration.
Skip: their scene-type ducking granularity, char-count SRT pagination for CJK, and the unguarded residual formulas — all three are the gaps our pipeline already closes with measured gates.
