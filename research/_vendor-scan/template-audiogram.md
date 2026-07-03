# template-audiogram — vendor scan (2026-07-03)

https://github.com/remotion-dev/template-audiogram @ 24b1b26f495c4065e0306e004669bb6281083495 — official Remotion template that turns one audio file + word-timestamped captions into a 1080×1080 waveform/caption video.

## What this repo is

The canonical Remotion "audio drives everything" template, authored by the Remotion core team (Stenbeck, Burger, Fernandez per `package.json:11`). Architecture: one `<Composition>` whose duration is computed from the audio file at metadata time; a single flex-column scene (cover+title / visualizer / paginated captions); an offline `transcribe.ts` CLI that runs whisper.cpp with token-level timestamps and emits `public/captions.json`. Maturity: first-party template kept current (Remotion 4, React 19.2.3, the new `@remotion/media` Audio and `useWindowedAudioData` APIs), lint via `eslint src && tsc`, but **zero tests and no CI** (no `.github/`, no test files) — it is demonstration code, not a hardened library. Value is in the mechanisms, not robustness.

## A. Layout & overlay prevention

### A1. Measurement-driven caption line-breaking with `fillTextBox`

**Where:** `vendor/template-audiogram/src/Audiogram/get-number-of-lines-for-text.ts:17-47`

**What it does:** Instead of letting the browser wrap text unpredictably, the caption layout is computed *in code* with `@remotion/layout-utils`' `fillTextBox`, which measures each token at the real font family/size against a max box width and reports when a token would start a new line. The result is a deterministic `Caption[][]` (array of lines), so the component knows exactly how many lines exist and which words sit on which line — the precondition for paging (A5). A subtlety: when a token starts a line its leading space is trimmed, and the trimmed characters are re-added to the measurement box as literal spaces so measured state and rendered text stay in sync.

**Load-bearing code:**
```ts
const box = fillTextBox({
  maxBoxWidth: textBoxWidth,
  maxLines: 1_000,
});

const lines: Caption[][] = [[]];

for (const caption of captions) {
  const isFirstCaption = captions.indexOf(caption) === 0;
  const { newLine } = box.add({
    text: isFirstCaption ? caption.text.trimStart() : caption.text,
    fontFamily,
    fontSize,
  });
```

**Transferable lesson:** Text overflow is prevented by *measuring before rendering*, not by CSS. A lesson pipeline can use `fillTextBox`/`measureText` at composition time to know line counts for any caption/label and clamp or re-layout deterministically — the same idea as our bbox manifest, applied to text.

### A2. Text box width derived from composition width (safe-area by subtraction)

**Where:** `vendor/template-audiogram/src/Audiogram/Main.tsx:29,40` and `:108-127`

**What it does:** The caption container width is not a pixel literal; it is `useVideoConfig().width` minus twice the base spacing unit, and that *same number* is passed both to the CSS `width` of the caption `<div>` and to `layoutText`'s `maxBoxWidth`. Layout math and rendered box can never disagree, and changing the composition width rescales the safe area automatically.

**Load-bearing code:**
```ts
const { durationInFrames, fps, width } = useVideoConfig();
...
const textBoxWidth = width - BASE_SIZE * 2;
...
<div style={{ lineHeight: `${LINE_HEIGHT}px`, width: textBoxWidth,
    fontWeight: CAPTIONS_FONT_WEIGHT, fontSize: CAPTIONS_FONT_SIZE,
    marginTop: BASE_SIZE * 0.5 }}>
  <PaginatedCaptions ... textBoxWidth={textBoxWidth} />
```

**Transferable lesson:** One value, computed once from `useVideoConfig()`, feeds both the measurement pass and the style — the single-source-of-truth pattern our `layout.ts`/`manifest.ts` pairing already demands. Any width used for text measurement must be the identical expression used in the style.

### A3. `BASE_SIZE` design-token scale for all spacing/sizing

**Where:** `vendor/template-audiogram/src/Audiogram/constants.ts:1-5` (consumed at `Spectrum.tsx:11-13`, `AudioVizContainer.tsx:10-15`, `Main.tsx:40,115`)

**What it does:** Every dimension in the scene — caption font size, line height, spectrum bar width/radius/gap, visualizer slot height, margins — is a multiple of a single `BASE_SIZE = 48`. The layout is therefore a proportional system, not a pixel grid: retuning density means editing one constant.

**Load-bearing code:**
```ts
export const BASE_SIZE = 48;
export const CAPTIONS_FONT_WEIGHT = 600;
export const CAPTIONS_FONT_SIZE = 1.5 * BASE_SIZE;
export const LINE_HEIGHT = 2 * BASE_SIZE;
export const LINES_PER_PAGE = 5;
```

**Transferable lesson:** A lesson theme should expose one spatial unit and derive font/line/gap sizes from it, so a composition-size change (or a 16:9 → 1:1 variant) is a one-constant retune instead of a literal hunt.

### A4. Font-load gate before any text measurement (`WaitForFonts` + `delayRender`)

**Where:** `vendor/template-audiogram/src/Audiogram/WaitForFonts.tsx:9-39`, `src/Audiogram/font.ts:3-11`, mounted at `Main.tsx:108`

**What it does:** `fillTextBox` measures text with canvas metrics, which are wrong until the webfont is actually loaded. The template blocks the *render* with `delayRender()` and returns `null` (so children never mount) until `loadFont(...).waitUntilDone()` resolves. Because `WaitForFonts` wraps the caption block in `Main.tsx`, the measurement in A1 can never run against a fallback font — eliminating a whole class of "wrapped differently in render than in preview" bugs.

**Load-bearing code:**
```tsx
const [handle] = useState(() =>
  delayRender("Waiting for fonts to be loaded"),
);
useEffect(() => {
  if (fontsLoaded) { return; }
  waitForFonts().then(() => { setFontsLoaded(true); })
    .catch((err) => { cancelRender(err); });
}, [fontsLoaded, handle, continueRender, delayRender]);
...
if (!fontsLoaded) { return null; }
```

**Transferable lesson:** Any pipeline that measures text (fitText, fillTextBox, our caption gates) must be font-gated: `delayRender` + don't-mount-children until `waitUntilDone()`. Measuring before fonts settle silently produces wrong line breaks only in some renders.

### A5. Vertical overflow control: page window of last N lines + `overflow: hidden`

**Where:** `vendor/template-audiogram/src/Audiogram/get-number-of-lines-for-text.ts:52-67` and `src/Audiogram/Captions.tsx:76-83`

**What it does:** Captions never grow past their slot because (a) only lines whose first word has already started speaking are "active", (b) only the last `LINES_PER_PAGE` (5) of those are rendered — a teleprompter-style rolling window — and (c) the container clips with `overflow: hidden` as a belt-and-braces guard. The caption block thus has a bounded worst-case height of `LINES_PER_PAGE * LINE_HEIGHT`, so it cannot collide with the visualizer above it.

**Load-bearing code:**
```ts
const currentlyActiveLines = lines.filter((line) => {
  return line.some((item) => {
    return msToFrame(item.startMs) < frame;
  });
});

// Return the last 4 lines
return currentlyActiveLines.slice(-LINES_PER_PAGE);
```

**Transferable lesson:** Give every text region a hard line budget and derive its reserved height as `linesPerPage × lineHeight`; page by dropping the oldest lines rather than shrinking text. That converts "unbounded text" into a fixed-size layout slot the rest of the frame can trust.

### A6. Resolution-independent waveform via SVG `viewBox` in composition coordinates

**Where:** `vendor/template-audiogram/src/Audiogram/Oscilloscope.tsx:23-32` and `:78-85`

**What it does:** The oscilloscope draws its path in a coordinate system of `0 0 width height` (composition width, fixed 120 design height), then renders the `<svg>` element at `width - padding * 2` on screen. Point x-positions are fractions of the sample index (`(i / (waveform.length - 1)) * width`), y is `height/2 ± amplitude`. The waveform therefore rescales with composition size and padding without touching the path math — the same viewBox-vs-client-rect separation our frame-discipline rules call a coordinate-space law.

**Load-bearing code:**
```tsx
<svg
  viewBox={`0 0 ${width} ${height}`}
  style={container}
  width={width - padding * 2}
  height={height}
>
```

**Transferable lesson:** Draw generated graphics in a stable viewBox space keyed to `useVideoConfig()` and let the SVG element do the on-screen scaling; padding becomes a render-time attribute rather than baked into path coordinates.

*(Layout coverage note: the flex-column stacking in `Main.tsx:46-129` — cover/title row, fixed-height viz slot (`AudioVizContainer.tsx:11` at `BASE_SIZE * 4`), caption block — is the passive skeleton the six mechanisms above hang on; it reserves a band per element rather than absolutely positioning them. Greps run for exhaustion: `grep -rn "fitText|measureText|safe|getBoundingClientRect|overflow" src/ transcribe.ts` → only `fillTextBox` + the two `overflow` styles cited above; no fitText, no DOM measurement, no explicit safe-area constants beyond A2.)*

## B. Voice-visual coordination

### B1. `calculateMetadata`: audio file is the master clock for composition duration

**Where:** `vendor/template-audiogram/src/Root.tsx:42-62`

**What it does:** The composition's `durationInFrames` is not authored — it is computed asynchronously at metadata time by parsing the actual audio file with `@remotion/media-parser` (`slowDurationInSeconds` = precise decode-based duration), minus the configured start offset, times FPS. The same hook fetches and parses the captions file and injects the parsed `Caption[]` into props, so the scene component receives ready data and throws if it is missing (`Main.tsx:31-35`).

**Load-bearing code:**
```ts
calculateMetadata={async ({ props }) => {
  const captions = await getSubtitles(props.captionsFileName);
  const { slowDurationInSeconds } = await parseMedia({
    src: props.audioFileUrl,
    acknowledgeRemotionLicense: true,
    fields: { slowDurationInSeconds: true },
  });
  return {
    durationInFrames: Math.floor(
      (slowDurationInSeconds - props.audioOffsetInSeconds) * FPS,
    ),
    props: { ...props, captions },
    fps: FPS,
  };
}}
```

**Transferable lesson:** Derive video length from measured audio, never from an estimate — the exact principle behind our Wave 3.5 reconcile, here implemented in ~15 lines with `parseMedia`. Also: `calculateMetadata` is the sanctioned place to load timing artifacts (captions/timing JSON) so scene code stays synchronous.

### B2. Whisper token-level timestamps → `Caption[]`, with speech-start offset shifting

**Where:** `vendor/template-audiogram/transcribe.ts:74-103`

**What it does:** The offline transcription CLI trims the audio to the user-declared speech start (so music/noise intros don't produce garbage tokens), resamples to 16 kHz mono for whisper.cpp, transcribes with `tokenLevelTimestamps: true`, converts via `toCaptions`, then shifts every `startMs/endMs/timestampMs` forward by the trimmed-off milliseconds so caption time matches the *original* audio's timeline. Output is committed as `public/captions.json` — a frozen, versionable timing artifact.

**Load-bearing code:**
```ts
execSync(
  `npx remotion ffmpeg -i "${options.audioPath}" -ss ${options.speechStartsAtSecond} -ar 16000 -ac 1 "${tempAudioForWhisper}" -y`,
);
const whisperCppOutput = await transcribe({
  model: WHISPER_MODEL,
  whisperPath: WHISPER_PATH,
  inputPath: tempAudioForWhisper,
  tokenLevelTimestamps: true,
  language: options.language || "English",
  whisperCppVersion: WHISPER_VERSION,
});
```

**Transferable lesson:** Two ideas worth stealing: (1) let a human declare where speech starts and ASR only the speech, then re-offset timestamps — cheap accuracy win over feeding the full mix; (2) ASR output is an authored, committed artifact consumed at `calculateMetadata`, not recomputed at render.

### B3. Single ms→frame conversion boundary

**Where:** `vendor/template-audiogram/src/helpers/ms-to-frame.ts:1-5`

**What it does:** All caption data lives in milliseconds (ASR-native units); every visual decision lives in frames. Exactly one helper converts between them, and the FPS constant it owns is the same one `calculateMetadata` uses (`Root.tsx:6,54,60`) — so audio-time and frame-time can never use divergent frame rates.

**Load-bearing code:**
```ts
export const FPS = 30;

export const msToFrame = (time: number) => {
  return Math.floor((time / 1000) * FPS);
};
```

**Transferable lesson:** Keep timing artifacts in source units (ms) end-to-end and convert at a single audited chokepoint that owns the FPS constant. Scattered `* fps / 1000` expressions are where drift bugs breed.

### B4. Per-word reveal animation bound to each token's measured onset

**Where:** `vendor/template-audiogram/src/Audiogram/Word.tsx:11-30`

**What it does:** Every word fades in (15-frame opacity ramp) and settles up (10-frame 0.25em translateY with quad ease-out) starting exactly at `msToFrame(item.startMs)` — the ASR-measured onset of that word, not a cadence constant. The karaoke effect is thus voice-rate-proof: fast and slow speech both look right.

**Load-bearing code:**
```ts
const opacity = interpolate(
  frame,
  [msToFrame(item.startMs), msToFrame(item.startMs) + 15],
  [0, 1],
  {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
);
```

**Transferable lesson:** This is the minimal reference implementation of our "spoken enumeration binds to token onsets, never a step constant" law: element-enters-at-`onset`, animation duration is a constant, onset never is.

### B5. Sentence segmentation at runtime from punctuation + next-token onset

**Where:** `vendor/template-audiogram/src/Audiogram/sentence-to-display.ts:16-29`

**What it does:** To show only the sentence currently being spoken, the component walks the caption tokens for the last token that (a) ends with `? . !` and (b) whose *following* token has already started (`msToFrame(nextWord.startMs) < frame`), then slices from there. Sentence boundaries are derived from the text itself plus measured onsets — no separate sentence-timing artifact is needed.

**Load-bearing code:**
```ts
const indexOfCurrentSentence =
  windowedFrameSubs.findLastIndex((w, i) => {
    const nextWord = windowedFrameSubs[i + 1];

    return (
      nextWord &&
      (w.text.endsWith("?") ||
        w.text.endsWith(".") ||
        w.text.endsWith("!")) &&
      msToFrame(nextWord.startMs) < frame
    );
  }) + 1;
```

**Transferable lesson:** Higher-level narration structure (sentences, phrases) can be *derived* from word-level timestamps + punctuation at render time rather than authored as an extra artifact — one fewer file to keep in sync.

### B6. Frame-windowed audio data + amplitude/FFT-driven visuals

**Where:** `vendor/template-audiogram/src/Audiogram/Oscilloscope.tsx:57-85` and `src/Audiogram/Spectrum.tsx:38-73`

**What it does:** Both visualizers use `useWindowedAudioData({ fps, frame, src, windowInSeconds: 10 })`, which loads only a rolling 10-second window of PCM around the current frame (memory-safe on long podcasts) and returns a `dataOffsetInSeconds` to keep sample indexing correct. Oscilloscope feeds it to `visualizeAudioWaveform` (time-domain, smoothed into an SVG path); Spectrum feeds `visualizeAudio` (FFT) and maps `sqrt(v)` to bar heights, with an optional mirror by reflecting the low-frequency subset. Note `Main.tsx:102`: the FFT path multiplies `numberOfSamples * 4` because FFT needs more samples for the same visual resolution.

**Load-bearing code:**
```ts
const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
  fps,
  frame,
  src: audioSrc,
  windowInSeconds: 10,
});
...
const waveform = visualizeAudioWaveform({
  fps, frame: posterized, audioData, numberOfSamples,
  windowInSeconds: windowInSeconds, channel: 0,
  dataOffsetInSeconds: dataOffsetInSeconds,
});
```

**Transferable lesson:** For any audio-reactive element (voice-level meters, a "who is speaking" pulse), use `useWindowedAudioData` rather than `useAudioData` — it bounds memory on long narration and is the current first-party API. Render a placeholder container while `audioData` is null so layout doesn't jump.

### B7. Temporal quantization ("posterization") of audio-driven motion

**Where:** `vendor/template-audiogram/src/Audiogram/Oscilloscope.tsx:55` (schema default at `schema.ts:20`)

**What it does:** The waveform is *not* re-sampled every frame: the frame fed into `visualizeAudioWaveform` is quantized to steps of `posterization` (default 3), so the scope redraws ~10×/sec instead of 30×/sec. This is a deliberate taste decision — full-rate waveform motion reads as jitter; quantized motion reads as a stable, watchable pulse.

**Load-bearing code:**
```ts
const posterized = Math.round(frame / posterization) * posterization;
```

**Transferable lesson:** Audio-reactive decoration should be down-sampled in time, not rendered at full frame rate — one line buys calm. Directly applicable to any voice-level-reactive accent in a kids lesson where visual calm matters.

### B8. Audio trim via negative `<Sequence from>` with caption window shifted to match

**Where:** `vendor/template-audiogram/src/Audiogram/Main.tsx:37,44` and `:120-121`, consumed by `Captions.tsx:14-28`

**What it does:** To start playback N seconds into the audio, the whole scene (Audio + visuals) is mounted in `<Sequence from={-audioOffsetInFrames}>` — the negative offset shifts the audio's timeline left so frame 0 of the video is N seconds into the file. The caption component is then given `startFrame/endFrame = audioOffsetInFrames … audioOffsetInFrames + durationInFrames`, and `useWindowedFrameCaptions` filters captions to that window, keeping words aligned with the shifted audio.

**Load-bearing code:**
```tsx
const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);
...
<Sequence from={-audioOffsetInFrames}>
  <Audio src={audioFileUrl} />
  ...
  <PaginatedCaptions
    captions={captions}
    startFrame={audioOffsetInFrames}
    endFrame={audioOffsetInFrames + durationInFrames}
```

**Transferable lesson:** A negative `Sequence from` is the idiomatic Remotion way to trim media heads without re-encoding; whenever it is used, every timing consumer (captions, cue anchors) must be shifted by the same offset — the template shows the pattern of passing that offset explicitly rather than re-deriving it.

*(Audio coverage note: greps run for exhaustion — `grep -rn "volume|duck" src/` → NONE: there is no music bed and no ducking anywhere in this repo; narration is the only track.)*

## C. Anti-patterns & gaps

- **Title and cover have no overflow protection.** `Main.tsx:72-82` renders `titleText` at a fixed `fontSize: "48px"` with no `fillTextBox`/fitText pass and no line clamp, and the cover `<Img>` (`Main.tsx:65-71`) constrains only `maxHeight: "250px"`, not width. A long episode title or a wide cover pushes the visualizer and captions down; combined with the caption block's 5×96 px budget, total height can exceed 1080 and the captions clip at the frame bottom. The measurement discipline applied to captions (A1) is simply absent for the header row.
- **Spectrum bar height is unbounded relative to its slot.** `Spectrum.tsx:73` sets `height: 300 * Math.sqrt(v)` while its container is fixed at `BASE_SIZE * 4 = 192px` (`AudioVizContainer.tsx:11`) with no `overflow: hidden` — a hot mix (v→1 gives 300 px bars) overlaps the title above and captions below. Collision safety here depends on typical podcast levels, not on math.
- **React key collision on caption words.** `Captions.tsx:89-90` keys each word `<span>` by `item.startMs + item.endMs` — a *sum*, so two different words with equal sums (e.g. 100+300 and 200+200) collide, and repeated identical timestamps (common in dense token output) collide trivially; line keys (`Captions.tsx:86`) join word text and collide on repeated sentences. Wrong-key reuse can flash stale word animation state.
- **Sub-word tokens can line-break mid-word.** `public/captions.json` contains whisper *token* fragments (`"Sy"`, `"nt"`, `"ax"` at lines 17, 24, 31) and `layoutText` (`get-number-of-lines-for-text.ts:24-47`) adds each token to `fillTextBox` independently — nothing prevents a break between `Sy` and `nt`, splitting a word across lines; the per-token `Word` fade also animates mid-word fragments. A word-merge pass before layout is missing.
- **Boundary-crossing captions are dropped, not clipped.** `Captions.tsx:24-26` keeps only captions with `startMs >= windowStart && endMs <= windowEnd`; a word straddling the end of the video (or of the offset window) disappears entirely rather than being truncated.
- **No music/SFX story at all.** No second audio track, no `volume` automation, no ducking (grep proven above) — anyone extending this template with a bed must invent the entire mixing layer.
- **Residual pixel literals** undercut the token system: oscilloscope design height `120` and margins `40` (`Oscilloscope.tsx:9-15`), title `48px`/cover `250px` (`Main.tsx:68,78`), padding `"48px"` (`Main.tsx:53`) duplicating `BASE_SIZE` as a string literal.
- **No tests, no CI** — the layout math in `layoutText` (the trickiest code in the repo, with the trim-and-repad space dance at `get-number-of-lines-for-text.ts:36-44`) has no regression net.

## D. Verdict

Worth stealing, ranked:
1. **`calculateMetadata` + `parseMedia` duration derivation (B1)** — the cleanest possible statement of "measured audio is the master clock", plus async caption loading into props. Our pipeline does this at Wave 3.5 with more machinery; this is the reference shape for any one-shot audio-driven comp.
2. **Font-gated, measurement-driven caption paging (A1+A4+A5)** — `fillTextBox` line layout, `WaitForFonts`/`delayRender` before measuring, and a hard `LINES_PER_PAGE × LINE_HEIGHT` height budget. Together they make text a fixed-size layout citizen; the font gate is a correctness detail our own text gates should adopt verbatim.
3. **`useWindowedAudioData` + posterization (B6+B7)** — the current first-party, memory-bounded way to do audio-reactive visuals, and the one-line temporal quantization that keeps them calm. Directly reusable for narration-reactive accents.
4. **Single ms→frame chokepoint + onset-bound word reveal (B3+B4)** — small, but the exact minimal pattern behind our token-onset law; good citation for skill docs.
Skip: the header-row layout (unprotected title/cover) and the caption keying — both are the repo's own weak spots.
