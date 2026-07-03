# remotion — vendor scan (2026-07-03)

https://github.com/remotion-dev/remotion @ `8130c9d4575cb9a22162a483c238ad779c266472` — the Remotion framework monorepo itself: programmatic video in React, including the official layout-measurement, captions, and whisper-transcription packages plus the shipped agent skill (`packages/skills`).

## What this repo is

The upstream framework monorepo: 125 packages under `packages/`, Turborepo build graph (`turbo.json`), bun lockfile, GitHub Actions CI (`.github/workflows/push.yml`, `claude.yml`, etc.), and per-package unit tests (e.g. `packages/captions/src/test/tiktok.test.ts`, `packages/layout-utils/src/test/fit-text-on-n-lines.test.ts`, `packages/install-whisper-cpp/src/test/convert-to-captions.test.ts`). Scan was surgical per instructions: `layout-utils`, `captions`, `install-whisper-cpp`, `skills/skills/remotion/rules/*.md`, `docs/docs/layout-utils/best-practices.mdx`, and `core/src/use-current-scale.ts`; renderer/player/lambda internals skipped. Notably, this repo also ships its *practices* as code: `packages/skills/skills/remotion/` is a first-party agent skill with 40+ rule files — those rules are treated as mechanisms below, quoted with concrete numbers.

## A. Layout & overlay prevention

### A1. Off-screen DOM span measurement with a word cache (`measureText`)

**Where:** `vendor/remotion/packages/layout-utils/src/layouts/measure-text.ts:45-133`

**What it does:** Text is never sized by estimate. A hidden `<span>` is appended to `document.body` at `top: -10000px` with `display: inline-block` + `white-space: pre` and the exact font properties, then `getBoundingClientRect()` is read and the node removed. Results are memoized in a module-level `Map` keyed by text + font properties, so repeated per-word measurement during layout loops is cheap.

**Load-bearing code:** (lines 64-75, 103-106)

```ts
const node = document.createElement('span');
// ...
node.style.display = 'inline-block';
node.style.position = 'absolute';
node.style.top = `-10000px`;
node.style.whiteSpace = 'pre';
node.style.fontSize =
	typeof fontSize === 'string' ? fontSize : `${fontSize}px`;
// ...
document.body.appendChild(node);
const computedFontFamily = window.getComputedStyle(node).fontFamily;
const boundingBox = node.getBoundingClientRect();
document.body.removeChild(node);
```

**Transferable lesson:** Ground-truth text measurement is a throwaway DOM node with *identical* style props, not font metrics math. A lesson pipeline that pre-computes caption/label boxes should reuse this exact recipe (inline-block + pre + off-screen) and cache per (text, font-tuple).

### A2. Fallback-font detection — `validateFontIsLoaded` double measurement

**Where:** `vendor/remotion/packages/layout-utils/src/layouts/measure-text.ts:146-180`

**What it does:** The classic silent failure — measuring before the webfont loads, so the browser measures the fallback font — is detected by taking a *second* measurement with `fontFamily: null` (forcing the fallback). If both boxes are pixel-identical, the computed families differ, and the text has >4 unique characters (false-positive guard), it throws with an actionable error. Docs at `packages/docs/docs/layout-utils/best-practices.mdx:202-210` state this will become the default in v5.

**Load-bearing code:** (lines 161-170)

```ts
const sameAsFallbackFont =
	boundingBox.height === boundingBoxOfFallbackFont.height &&
	boundingBox.width === boundingBoxOfFallbackFont.width;

// Ensure there are at least 4 unique characters, with just a few, there is more likely to be a false positive
if (
	sameAsFallbackFont &&
	computedFallback !== computedFontFamily &&
	new Set(text).size > 4
) {
```

**Transferable lesson:** Any measurement-driven layout gate should self-verify the font actually loaded — a differential measurement against the fallback font is a zero-dependency runtime assertion. Directly applicable to our `--measured` gate: measure once with the declared font, once with fallback, fail loudly on equality.

### A3. `fitText` — proportional single-line font-size solve

**Where:** `vendor/remotion/packages/layout-utils/src/layouts/fit-text.ts:7-46`

**What it does:** To fit one line of text into a target width, it measures the text once at a fixed `sampleSize = 100`px and scales linearly: `fontSize = (withinWidth / measuredWidth) * 100`. One measurement, no iteration. The companion rule (`packages/skills/skills/remotion/rules/measuring-text.md:50-53`) shows the required manual cap: `fontSize: Math.min(fontSize, 80)`.

**Load-bearing code:** (lines 7, 33-45)

```ts
const sampleSize = 100;
// ...
	const estimate = measureText({
		text,
		fontFamily,
		fontSize: sampleSize,
		// ...
	});

	return {fontSize: (withinWidth / estimate.width) * sampleSize};
```

**Transferable lesson:** For single-line titles (our lesson intros, big numerals), a one-shot proportional solve is enough — no binary search needed. But always cap the result; uncapped fitText makes short strings comically large.

### A4. `fillTextBox` — incremental word-wrap simulator with overflow signal

**Where:** `vendor/remotion/packages/layout-utils/src/layouts/fill-text-box.ts:3-98`

**What it does:** A stateful box (`maxBoxWidth`, `maxLines`) exposes `add(word)` returning `{exceedsBox, newLine}`. Each add re-measures the whole candidate line word-by-word (cache makes this cheap), compares `Math.ceil(width)` to the budget, wraps to the next line when full, and reports `exceedsBox: true` when out of lines *or* when a single word alone can't fit the width. Overflow becomes a queryable boolean *before* anything renders.

**Load-bearing code:** (lines 52-55, 87-91)

```ts
const widths = lineWithWord.map((w) => measureText(w).width);
const lineWidthWithWordAdded = widths.reduce((a, b) => a + b, 0);

if (Math.ceil(lineWidthWithWordAdded) <= maxBoxWidth) {
// ...
const wordAloneWidth = measureText(wordForNewLine).width;

if (Math.ceil(wordAloneWidth) > maxBoxWidth) {
	return {exceedsBox: true, newLine: false};
}
```

**Transferable lesson:** Overflow prevention as an API: simulate the fill, get a boolean, decide (shrink / split across cues / rewrite copy) before the frame exists. This is the primitive our caption/label components should call in dev-time checks instead of eyeballing contact sheets.

### A5. `fitTextOnNLines` — binary search over font size against the wrap simulator

**Where:** `vendor/remotion/packages/layout-utils/src/layouts/fit-text-on-n-lines.ts:20-101`

**What it does:** Finds the *largest* font size at which text fits within `maxBoxWidth` × `maxLines`: binary search over `fontSize * 100` (PRECISION=100, line 4) in `[0.1, maxFontSize ?? 2000]` (lines 34-38), running a full `fillTextBox` simulation per candidate. Returns both the optimal `fontSize` and the actual `lines: string[]` produced at that size, so the renderer lays out exactly what was measured.

**Load-bearing code:** (lines 84-90)

```ts
		// If text fits within the box and number of lines
		if (!exceedsBox && currentLine < maxLines) {
			optimalFontSize = fontSize;
			optimalLines = lines;
			left = mid + 1;
		} else {
			right = mid - 1;
		}
```

**Transferable lesson:** Deterministic "biggest text that fits N lines" is a solved problem: binary search + measured wrap simulation, ~11 iterations per solve. Steal wholesale for multi-line lesson copy — but see C3: the space-based word split must be replaced for Chinese.

### A6. `ensureMaxCharactersPerLine` — line budget with orphan-word prevention

**Where:** `vendor/remotion/packages/captions/src/ensure-max-characters-per-line.ts:32-66`

**What it does:** Splits captions into word tokens, then segments them so no line exceeds `maxCharsPerLine` — and additionally breaks early when 2-3 words remain and the current line is already more than half full, so the last line is never a lonely orphan word. Character count is the budget unit (not pixels; see C5).

**Load-bearing code:** (lines 48-56)

```ts
		const preventOrphanWord =
			remainingWords.length < 4 &&
			remainingWords.length > 1 &&
			filledCharactersInLine > maxCharsPerLine / 2;

		if (
			filledCharactersInLine + w.text.length > maxCharsPerLine ||
			preventOrphanWord
		) {
```

**Transferable lesson:** Typographic quality rules can be mechanical: "never orphan the last word" is 4 lines of lookahead. Encode the same lookahead in our caption layout instead of trusting the wrap to land well.

### A7. Scale-corrected DOM measurement (`useCurrentScale`)

**Where:** `vendor/remotion/packages/core/src/use-current-scale.ts:54-121`; rule at `vendor/remotion/packages/skills/skills/remotion/rules/measuring-dom-nodes.md:10-33`

**What it does:** Remotion renders the composition inside a `scale()`-transformed container (Studio zoom / Player fit), so raw `getBoundingClientRect()` values are in *screen* pixels, not composition pixels. `useCurrentScale()` computes `min(canvasHeight/compositionHeight, canvasWidth/compositionWidth)` and every measurement must be divided by it. This is the framework's canonical answer to the coordinate-space-mixing bug class.

**Load-bearing code:** (`measuring-dom-nodes.md:25-30`)

```tsx
    const rect = ref.current.getBoundingClientRect();
    setDimensions({
      width: rect.width / scale,
      height: rect.height / scale,
    });
```

**Transferable lesson:** Any runtime bbox measurement (our `measureProps`/`getBBox` gate) must normalize into composition coordinates via one blessed scale source — identical to our existing "never mix client-rect pixels with viewBox coords" law; Remotion ships the hook that makes it one line.

### A8. Numeric safe areas and type-size floors (video-layout rule)

**Where:** `vendor/remotion/packages/skills/skills/remotion/rules/video-layout.md:15,44-48`

**What it does:** The first-party layout rule commits to concrete numbers, all expressed relative to a 1080px-wide frame and explicitly scaled with composition width: an 80px horizontal / 100px vertical safe area for key text, and minimum font sizes per text role. These are prose constraints for the generating agent, not runtime code (see C1).

**Load-bearing code:** (lines 15, 44-48)

```
- Keep important content inside a generous safe area. For 1080px-wide videos, keep key text at least 80px from the sides and 100px from the top and bottom.
...
- For 1080px-wide compositions, use these rough minimums:
  - Main headline: 84px
  - Important supporting text: 44px
  - Labels or short callouts: 32px
- Scale those values with the composition width.
```

**Transferable lesson:** Publish the numbers, normalized to a reference width, and scale linearly — a safe-area + type-floor table beats "make text big". Ours should live in `layout.ts` constants AND in the machine gate (legibility check), not only in skill prose as Remotion does.

### A9. "Prevent overlap by construction" — slot layout law

**Where:** `vendor/remotion/packages/skills/skills/remotion/rules/video-layout.md:30-38`

**What it does:** The rule's core overlap strategy is structural, not corrective: readable content lives in normal flow containers (flex/grid/gap) that *reserve a slot* per element; absolute positioning is reserved for backgrounds/decoration; animation happens from the reserved slot via opacity/transform, never *into* occupied space; unknown-length text gets wrapping room instead of a neighbor directly beneath it.

**Load-bearing code:** (lines 32-37)

```
- Do not manually position every readable element with independent `top`, `left`, `right`, or `bottom` values.
- Put readable content in normal layout containers using `flex`, `grid`, `gap`, `justifyContent`, and `alignItems`.
- Use absolute positioning mainly for backgrounds, decorative shapes, glows, particles, and elements that are meant to layer behind the content.
- Reserve a slot for each major element in the scene. For example, a vertical promo scene can use a centered column with `gap` for headline, card, and CTA.
- Animate elements from their reserved slot using `opacity`, `transform`, and `scale`; do not animate them into a space occupied by another element.
- If an element enters from offscreen or from another part of the frame, its final resting position must still belong to a layout slot.
```

**Transferable lesson:** Collision *prevention* beats collision *detection*: make overlap impossible by giving every teaching mark a flow-layout slot and demoting absolutes to decoration. This is the structural complement to our bbox gate — adopt it as a composer law so the gate catches exceptions, not the norm. The same file (lines 55-57) adds the temporal variant: "Let time solve layout problems … reveal them one after another."

### A10. Measurement-fidelity contract (match props, whitespace, outline-not-border)

**Where:** `vendor/remotion/packages/docs/docs/layout-utils/best-practices.mdx:212-250`; also `packages/skills/skills/remotion/rules/measuring-text.md:87-140`

**What it does:** Measurement is only honest if the measured node and the rendered node are styled identically. The doc commits to: share font variables between `measureText()` and markup; replicate the measurer's `display: inline-block` + `white-space: pre` in your markup; never use `padding`; use `outline` instead of `border` (outline doesn't affect layout); and only measure after fonts load (via `waitUntilDone()` / a `WaitForFonts` HOC wired to `delayRender`).

**Load-bearing code:** (`best-practices.mdx:241-250`)

```
Adding a `padding` or a `border` to a word will skew the measurements.
Avoid using `padding` altogether and use the natural spacing between words.
Instead of `border`, use an `outline` to add a line outside the text without affecting its layout.

## Whitespace

When measuring, the Layout utils will wrap the text in a `<span>` with `display: inline-block` and `white-space: pre` applied.
This will also measure the width of the whitespace characters.

Add those two CSS properties to your markup as well to match it with the measurements.
```

**Transferable lesson:** Treat "measured style ≡ rendered style" as a lintable contract: one shared style object, no padding/border on measured text, fonts gated before measurement. Our manifest `bboxAt()` vs scene divergence check is the same idea generalized — this list is the text-specific checklist to fold in.

## B. Voice-visual coordination

### B1. Word-level timestamps via whisper.cpp DTW (`transcribe`)

**Where:** `vendor/remotion/packages/install-whisper-cpp/src/transcribe.ts:96-116,167-185,330`

**What it does:** Token-level timing is not inferred — it's requested from whisper.cpp's dynamic-time-warping aligner. When `tokenLevelTimestamps: true`, the CLI is invoked with `--dtw <model>` (model name mapped at lines 98-116 because CLI naming differs, e.g. `large-v3-turbo` → `large.v3.turbo`) and `--max-len` is forced to 1 (line 330) so every transcription item is a single token carrying its own `t_dtw`. Output is full JSON (`-ojf`); a 16kHz WAV is a hard precondition (lines 312-316) with the exact ffmpeg command in the error.

**Load-bearing code:** (lines 167-176)

```ts
	const args = [
		'-f',
		fileToTranscribe,
		'--output-file',
		tmpJSONPath,
		'--output-json',
		tokensPerItem ? ['--max-len', tokensPerItem] : null,
		'-ojf', // Output full JSON
		tokenLevelTimestamps ? ['--dtw', modelToDtw(model)] : null,
		model ? [`-m`, `${modelPath}`] : null,
```

**Transferable lesson:** For word-synced visuals, use the ASR's *alignment* mode (DTW) rather than segment offsets, and force one-token-per-item so each word owns a timestamp. Mirrors our sherpa-onnx token-onset approach; the `--max-len 1` trick is the part worth remembering.

### B2. Normalization into the ms-based `Caption` interchange type (`toCaptions`)

**Where:** `vendor/remotion/packages/install-whisper-cpp/src/to-captions.ts:12-33`; type at `vendor/remotion/packages/captions/src/caption.ts:1-7`

**What it does:** Whisper's raw JSON is collapsed into a flat `Caption[]` where every token carries `startMs`/`endMs` (segment offsets), `timestampMs` (the DTW time, `t_dtw * 10` since DTW is in centiseconds; `null` when DTW returned -1), and `confidence` (token probability `p`). Everything downstream — paging, SRT import/export, display — speaks only this five-field, milliseconds-based type; frames appear only at render time.

**Load-bearing code:** (lines 22-29)

```ts
		captions.push({
			text: captions.length === 0 ? item.text.trimStart() : item.text,
			startMs: item.offsets.from,
			endMs: item.offsets.to,
			timestampMs:
				item.tokens[0].t_dtw === -1 ? null : item.tokens[0].t_dtw * 10,
			confidence: item.tokens[0].p,
		});
```

**Transferable lesson:** Keep audio-truth in milliseconds in ONE canonical type and convert to frames only at the Sequence boundary; carry both segment bounds and the precise aligner timestamp (nullable), plus confidence for QA gating. Our `AlignedLessonCue` should keep confidence the same way.

### B3. Time-budget caption paging (`createTikTokStyleCaptions`)

**Where:** `vendor/remotion/packages/captions/src/create-tiktok-style-captions.ts:25-97`

**What it does:** Groups word-level captions into display "pages" (each with `text`, `startMs`, `durationMs`, and per-word `tokens`). A new page starts only when a token begins a new word (leading space) AND the current page has accumulated more than `combineTokensWithinMilliseconds` of speech — so page size is controlled by *time*, not word count (the rule file recommends 1200ms, `display-captions.md:73`). Each page's `durationMs` is assigned retroactively as `nextPage.startMs - page.startMs`, so pages abut with no gaps.

**Load-bearing code:** (lines 49-58)

```ts
	captions.forEach((item, index) => {
		const {text} = item;
		// If text starts with a space, push the currentText (if it exists) and start a new one
		if (
			text.startsWith(' ') &&
			currentTo - currentFrom > combineTokensWithinMilliseconds
		) {
			if (currentText !== '') {
				add();
			}
```

**Transferable lesson:** Page captions by elapsed-speech-time with a single tunable (ms), never by fixed word counts — reading rhythm follows the voice automatically. The retroactive "duration = next start − my start" trick guarantees gapless caption coverage.

### B4. Page→`<Sequence>` mounting + measured-token word highlighting

**Where:** `vendor/remotion/packages/skills/skills/remotion/rules/display-captions.md:96-121,143-172`

**What it does:** Each caption page becomes its own `<Sequence>` whose `from` and `durationInFrames` are derived from page ms-times × fps, clamped so a page never outlives the next page or the switch budget. Inside a page, the component converts the local frame back to absolute ms (`page.startMs + (frame/fps)*1000`) and highlights whichever token's measured `[fromMs, toMs)` window contains that instant — karaoke sync driven entirely by ASR timestamps, no step constants.

**Load-bearing code:** (lines 98-103, 156-157)

```tsx
        const startFrame = (page.startMs / 1000) * fps;
        const endFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          startFrame + (SWITCH_CAPTIONS_EVERY_MS / 1000) * fps,
        );
        const durationInFrames = endFrame - startFrame;
// ...
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
```

**Transferable lesson:** This is exactly our "spoken enumeration binds to token onsets" law in caption form: the active-word test is a half-open interval on measured ms, and the page window is clamped by its successor. The `Math.min(nextPage, budget)` clamp is a robustness detail worth copying (handles irregular ASR gaps).

### B5. Audio-driven composition duration (`calculateMetadata` + per-scene TTS)

**Where:** `vendor/remotion/packages/skills/skills/remotion/rules/voiceover.md:56-91`; `rules/calculate-metadata.md:29-42`; duration probe in `rules/get-audio-duration.md:14-28`

**What it does:** The canonical voiceover pattern: generate one TTS file *per scene* (ElevenLabs, written to `public/voiceover/<comp>/<scene>.mp3`), then in `calculateMetadata` measure every file's real duration (via mediabunny's `input.computeDuration()`) and set `durationInFrames = ceil(sum(durations) * fps)`, passing per-scene durations into the component as props so each scene's `<Sequence>` length equals its narration. Video length is thus *derived from measured audio*, never guessed.

**Load-bearing code:** (`voiceover.md:75-86`)

```tsx
  const durations = await Promise.all(
    SCENE_AUDIO_FILES.map((file) => getAudioDuration(staticFile(file))),
  );

  const sceneDurations = durations.map((durationInSeconds) => {
    return durationInSeconds * FPS;
  });

  return {
    durationInFrames: Math.ceil(sceneDurations.reduce((sum, d) => sum + d, 0)),
  };
```

**Transferable lesson:** Identical in spirit to our Wave 3.5 reconcile (`cueFrames = max(narrationFrames, motionFrames) + tail`) — per-scene clips, measure-don't-assume, chain end-to-end. Remotion's version lacks a motion budget (audio alone dictates length); ours is the stronger form, but their `calculateMetadata` placement (duration decided *before* render, alongside props) is the right integration point.

### B6. Transition-aware timeline arithmetic (`TransitionSeries`)

**Where:** `vendor/remotion/packages/skills/skills/remotion/rules/transitions.md:144-173`

**What it does:** When scenes cross-fade, total length is NOT the sum of scene durations: each transition overlaps its neighbors, so `total = sum(scenes) − sum(transitions)`; overlays are explicitly excluded from the math. Physics-based timings expose `getDurationInFrames({fps})` because a spring's settle time depends on fps — duration is queried from the timing object, never hardcoded.

**Load-bearing code:** (lines 146-151)

```
Transitions overlap adjacent scenes, so the total composition length is **shorter** than the sum of all sequence durations. Overlays do **not** affect the total duration.

For example, with two 60-frame sequences and a 15-frame transition:

- Without transitions: `60 + 60 = 120` frames
- With transition: `60 + 60 - 15 = 105` frames
```

**Transferable lesson:** If we ever add cross-cue transitions, the reconcile must subtract overlap or narration will desync from the picture — and any spring-driven duration must be resolved via its `getDurationInFrames` equivalent at plan time, not eyeballed.

### B7. Adaptive silence detection (loudnorm → silencedetect → trim)

**Where:** `vendor/remotion/packages/skills/skills/remotion/rules/silence-detection.md:14-70`

**What it does:** Two-pass, content-adaptive silence trimming: pass 1 runs ffmpeg `loudnorm=print_format=json` to obtain the EBU R128 `input_thresh` gating threshold for *this* file; pass 2 feeds that measured value as the `noise` floor to `silencedetect` (min duration `d=0.5`), so the silence cutoff adapts to each recording instead of a fixed dB constant. Near-contiguous silences (<0.2s gap) merge into one block; detected bounds become `trimBefore={Math.floor(leadingEnd * fps)}` / `trimAfter={Math.ceil(trailingStart * fps)}`.

**Load-bearing code:** (lines 31-37)

```bash
npx remotion ffmpeg -i public/video.mov -map 0:a -af "silencedetect=noise=${THRESH}dB:d=0.5" -f null /dev/null
```
```
Parameters:
- `noise`: The threshold below which audio is considered silent. Use `input_thresh` from step 1.
- `d`: Minimum silence duration in seconds. `0.5` is a good default.
```

**Transferable lesson:** Never hardcode a silence dB threshold — derive it per file from loudnorm's measured gating threshold. Directly upgrades any TTS-padding trim step (our per-cue clip trimming) to be robust across voices and recording levels; note the asymmetric floor/ceil when converting to frames so speech is never clipped.

### B8. Per-frame volume automation (the ducking primitive)

**Where:** `vendor/remotion/packages/skills/skills/remotion/rules/audio.md:86-103`

**What it does:** `<Audio volume={...}>` accepts a callback receiving the *media-local* frame (0 at the moment this audio starts, not the composition frame), returning 0-1 per frame — arbitrary volume envelopes (fades, dips under narration) are expressed as `interpolate()` curves. This is the only shipped volume-coordination mechanism; no sidechain/auto-ducking exists (see C4).

**Load-bearing code:** (lines 94-99, 103)

```tsx
  <Audio
    src={staticFile("audio.mp3")}
    volume={(f) =>
      interpolate(f, [0, 1 * fps], [0, 1], { extrapolateRight: "clamp" })
    }
  />
```
`The value of f starts at 0 when the audio begins to play, not the composition frame.`

**Transferable lesson:** Music ducking must be hand-composed: feed the narration cue windows into the bed's volume callback as interpolate keyframes — which is exactly what our `<LessonBgmLayer>` envelope does. The local-frame semantics (f starts at 0 per clip) is the gotcha to encode in any wrapper.

## C. Anti-patterns & gaps

1. **No machine-checkable overlap gate.** The safe areas, type floors, and slot rules live only in skill prose (`packages/skills/skills/remotion/rules/video-layout.md:63-69` — the "Pre-render check" is literally "inspect a representative frame at normal size" by eye). Grep proof: `grep -rn "safe.area\|safeArea" packages/core/src packages/layout-utils/src` → no hits. Nothing renders a frame and asserts no two boxes intersect; layout-utils measures *text only*, never arbitrary elements. Our bbox-manifest + `--measured` gate is ahead of upstream here.
2. **`measureText` cache key omits `fontVariantNumeric`.** `measure-text.ts:129`: `` const key = `${text}-${fontFamily}-${fontWeight}-${fontSize}-${letterSpacing}-${textTransform}-${JSON.stringify(additionalStyles)}` `` — yet `fontVariantNumeric` (line 93-95) changes glyph widths (e.g. `tabular-nums`). Two calls differing only in that prop return the same cached box. Cache-poisoning bug; any port must key on every style input.
3. **Space-delimited word splitting breaks CJK.** `fit-text-on-n-lines.ts:52` (`const words = text.split(' ')`) and `createTikTokStyleCaptions`' page-break condition `text.startsWith(' ')` (`create-tiktok-style-captions.ts:53`) both assume space-separated words. Chinese text has no spaces: fitTextOnNLines treats the whole string as one unbreakable word (only ever one line), and TikTok paging never finds a break point, merging everything into a single page. For our zh lessons these algorithms need a tokenizer-aware split before reuse.
4. **No music ducking / sidechain anywhere.** Grep proof: `grep -rln "sidechain\|ducking" packages --include=*.ts --include=*.tsx --include=*.md --include=*.mdx` → zero hits; `grep -rn "duck" packages/skills` → zero; only unrelated hit is `packages/docs/docs/lambda/without-iam/ec2.mdx`. Bed-under-narration coordination is left entirely to the user via B8's volume callback.
5. **Caption line-length control is character-count, not measurement.** `ensure-max-characters-per-line.ts:44-54` budgets by `s.text.length` — inconsistent with the repo's own measure-don't-estimate philosophy in layout-utils, and wrong for proportional fonts and CJK (1 char ≈ 2 latin widths).
6. **`fitText`'s linear solve is unsound with fixed-unit styles.** `fit-text.ts:33-45` scales fontSize proportionally from a 100px sample, but a `letterSpacing: "2px"` passed at the sample size does not scale with the font, so the returned size over/under-shoots for spaced text; there is also no built-in max (docs punt to a manual `Math.min`).
7. **Fragile subprocess handling in transcription.** `transcribe.ts:206-209` kills whisper on the magic stderr string `'ggml_metal_free: deallocating'` ("Sometimes it hangs here"), and comments that whisper "sometimes fails also with error code 0" (lines 234-235) — success is determined by whether the output file exists, not exit status. Temp JSON goes to `process.cwd()/tmp` (line 318). Works, but every one of these is a latent portability trap.

## D. Verdict

Worth stealing, ranked:

1. **`fitTextOnNLines` binary-search-against-simulation (A4+A5)** — the complete "largest text that fits the box, returning the exact measured lines" solve in ~100 lines; drop-in for lesson titles/captions once the word splitter is CJK-aware (C3). This closes a real gap: our pipeline currently *checks* overflow after composing; this *solves* size before composing.
2. **`validateFontIsLoaded` differential measurement (A2)** — a 15-line runtime assertion that measurements weren't taken with a fallback font; cheapest possible hardening for every measurement our composer/gates make.
3. **Time-budget caption paging + interval-based token highlight (B3+B4)** — one ms tunable for paging, half-open-interval activation from measured token times, `Math.min(nextPage, budget)` clamping. Direct upgrade path for our caption layer; it matches our token-onset law exactly.
4. **The video-layout numeric law set (A8+A9)** — safe area 80/100px @1080w, type floors 84/44/32px scaled by width, slot-based overlap prevention, "let time solve layout." Encode these as `layout.ts` constants + gate thresholds; upstream keeps them prose-only (C1), we can make them executable.
Also notable: the adaptive silence threshold via loudnorm (B7) is a one-command improvement to any TTS trim step. What upstream does NOT have: any collision gate, any ducking mechanism, and any CJK-safe text handling — the three places our pipeline is already ahead or must stay hand-rolled.
