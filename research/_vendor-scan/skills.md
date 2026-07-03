# skills — vendor scan (2026-07-03)

https://github.com/remotion-dev/skills @ 8dad6ec5c5c7cedee4d2aa620bb68386f8fe8eb9 — Remotion's official agent-skill rules package ("docs-as-mechanisms"): 40 markdown rule files + 3 demo `.tsx` assets that teach an LLM how to build Remotion videos correctly.

## What this repo is

A read-only mirror of `packages/skills` from the remotion-dev/remotion monorepo (`vendor/skills/package.json:2-4` points `repository.url` at `remotion-dev/remotion/tree/main/packages/skills`; version `4.0.482`, `"private": true`). Architecture: one entry `skills/remotion/SKILL.md` that routes by topic to `skills/remotion/rules/*.md` (progressive disclosure — each rule loaded only when its topic arises), plus `rules/assets/*.tsx` demo components wired into a real `src/Root.tsx` so the examples compile and preview (`vendor/skills/src/Root.tsx:9-36`). Maturity: authored by the Remotion core team and versioned in lockstep with the framework (strong authority signal), but this extracted repo itself has no tests, no CI, and a README that says only "This is an internal package and has no documentation" (`vendor/skills/README.md:1-5`). The mechanisms here are RULES (prose + copy-paste code), not enforcement code — every number below is a convention an agent is told to follow, not a gate.

## A. Layout & overlay prevention

### A1. Safe areas + minimum text sizes, scaled with composition width

**Where:** `vendor/skills/skills/remotion/rules/video-layout.md:15` and `:44-48`
**What it does:** Commits to concrete pixel numbers for a 1080px-wide composition: key text at least 80px from the sides and 100px from top/bottom; minimum font sizes of 84px (headline), 44px (supporting), 32px (labels/callouts). Explicitly states the numbers are width-relative — a 1920px-wide composition needs proportionally larger text. Also: "If unsure, make it larger, not smaller" (`:42`) and small text is decorative-only unless the user explicitly needs it read (`:43`).
**Load-bearing code:**
```
- Keep important content inside a generous safe area. For 1080px-wide videos, keep key text at least 80px from the sides and 100px from the top and bottom.
...
- For 1080px-wide compositions, use these rough minimums:
  - Main headline: 84px
  - Important supporting text: 44px
  - Labels or short callouts: 32px
- Scale those values with the composition width. For example, a 1920px-wide composition needs larger text than a 1080px-wide composition.
```
**Transferable lesson:** Encode safe-area insets and per-role font minimums as width-relative constants (e.g. `80/1080 * width`) in the layout module, and make the bbox/legibility gate flag any load-bearing text below the role minimum or outside the safe rect — this turns Remotion's advisory numbers into a machine check.

### A2. Overlap prevention by construction — layout slots, absolute positioning for decoration only

**Where:** `vendor/skills/skills/remotion/rules/video-layout.md:30-38`
**What it does:** The core anti-collision doctrine: never hand-place every readable element with independent `top/left/right/bottom`; instead put readable content in normal flex/grid flow with `gap`, reserve a named slot per major element, and restrict absolute positioning to backgrounds/decoration that intentionally layers behind content. Animation must happen FROM the reserved slot (opacity/transform/scale), and an element flying in from offscreen must still land in a layout slot. Unknown-length text gets wrap room instead of a neighbor placed immediately below it.
**Load-bearing code:**
```
- Do not manually position every readable element with independent `top`, `left`, `right`, or `bottom` values.
- Put readable content in normal layout containers using `flex`, `grid`, `gap`, `justifyContent`, and `alignItems`.
- Use absolute positioning mainly for backgrounds, decorative shapes, glows, particles, and elements that are meant to layer behind the content.
- Reserve a slot for each major element in the scene. [...]
- Animate elements from their reserved slot using `opacity`, `transform`, and `scale`; do not animate them into a space occupied by another element.
- If an element enters from offscreen or from another part of the frame, its final resting position must still belong to a layout slot.
- When text length is unknown or user-provided, assume it may wrap. Give the text block enough width and vertical room instead of placing another object immediately under it.
```
**Transferable lesson:** This is the "layouts stay structured yet flexible" answer: collisions are prevented by ownership (each element owns a flow slot) rather than detected after the fact. Directly reusable as a composer law: absolute positioning only for `zone:"decoration"`; teaching marks live in flex/grid slots; entrance animations are transforms away from the slot, never a second occupancy.

### A3. Solve crowding with time + a pre-render frame checklist

**Where:** `vendor/skills/skills/remotion/rules/video-layout.md:53-68` (also `:18`, `:26-28`)
**What it does:** When a frame is crowded, the prescribed fix order is temporal, not spatial: reveal elements one after another, remove an element, enlarge the focal element, or push the secondary element to another scene — never shrink everything to fit. Complemented by a scene-structure ceiling ("One main text message / One supporting visual / One or two background accents", `:24-27`) and a 4-question human inspection of a representative frame before rendering, including a sub-1-second comprehension test.
**Load-bearing code:**
```
Before rendering, inspect a representative frame at normal size:

- Can the main message be read quickly?
- Is there one obvious focal point?
- Are any objects touching, overlapping, or awkwardly sitting next to each other?
- Would the frame still make sense if seen for less than one second?
```
**Transferable lesson:** "Cut or defer, never shrink" is the same policy as our composer's "trim flourishes first, then compress motion, never extend the cue" — but applied to space. The 4-question checklist is a ready-made rubric for a vision-critic pass over contact-sheet frames.

### A4. Text measurement primitives — measureText / fitText / fillTextBox

**Where:** `vendor/skills/skills/remotion/rules/measuring-text.md:20-83`
**What it does:** Three `@remotion/layout-utils` functions cover the measurement space: `measureText()` returns exact width/height for a text+font tuple (cached); `fitText()` inverts the problem — returns the font size that fits a given width (recommended used with an explicit cap, `Math.min(fontSize, 80)`); `fillTextBox({maxBoxWidth, maxLines})` is an incremental word-feeder that reports `exceedsBox` per added word — i.e. overflow detection BEFORE render, usable for caption paging or truncation.
**Load-bearing code:**
```
const box = fillTextBox({ maxBoxWidth: 400, maxLines: 3 });

const words = ["Hello", "World", "This", "is", "a", "test"];
for (const word of words) {
  const { exceedsBox } = box.add({
    text: word + " ",
    fontFamily: "Arial",
    fontSize: 24,
  });
  if (exceedsBox) {
    // Text would overflow, handle accordingly
    break;
  }
}
```
**Transferable lesson:** `fitText` + a cap is the correct pattern for variable-length lesson titles/labels (auto-shrink long Chinese phrases without going below the A1 minimums — clamp between role-minimum and cap). `fillTextBox` can drive caption line-breaking deterministically at author time instead of trusting CSS wrap.

### A5. Measurement correctness preconditions — fonts loaded, props matched, no border

**Where:** `vendor/skills/skills/remotion/rules/measuring-text.md:87-141`
**What it does:** Three rules that make A4 honest: (1) only measure after `waitUntilDone()` resolves on the font load, and pass `validateFontIsLoaded: true` to throw instead of silently measuring fallback-font metrics; (2) share one style object between the `measureText` call and the rendered element so measured and rendered glyphs match; (3) use `outline` instead of `border` because border changes layout size ("Avoid padding and border", `:136-140`). Companion: `google-fonts.md:12` — `@remotion/google-fonts` "automatically blocks rendering until the font is ready."
**Load-bearing code:**
```
measureText({
  text: "Hello",
  fontFamily: "MyCustomFont",
  fontSize: 32,
  validateFontIsLoaded: true, // Throws if font not loaded
});
```
**Transferable lesson:** Any measurement-based gate (our bbox manifest, caption sizing) is garbage if it measures the fallback font — add a font-ready barrier before measuring, and derive measurement inputs and render styles from the same constant object so they cannot drift.

### A6. DOM measurement under the player scale transform — useCurrentScale()

**Where:** `vendor/skills/skills/remotion/rules/measuring-dom-nodes.md:10-30`
**What it does:** Remotion scales the composition container to fit the preview viewport, so raw `getBoundingClientRect()` values are in screen pixels, not composition pixels. The rule: divide rect dimensions by `useCurrentScale()` to recover composition-space measurements. This is a coordinate-space correctness rule for any runtime bbox reading.
**Load-bearing code:**
```
const rect = ref.current.getBoundingClientRect();
setDimensions({
  width: rect.width / scale,
  height: rect.height / scale,
});
```
**Transferable lesson:** Same bug class as our "client-rect pixels vs viewBox coords" law. Any measured-collision tooling that reads `getBoundingClientRect` in Studio/Player must normalize by `useCurrentScale()` or it will report phantom sizes that vary with window size.

### A7. Sequences as layout citizens — layout="none" vs default AbsoluteFill

**Where:** `vendor/skills/skills/remotion/rules/sequencing.md:49-56` (used throughout `:30-46` and `SKILL.md:116-118`)
**What it does:** `<Sequence>` wraps children in an absolute-fill by default, which silently rips a timed element OUT of the flex/grid slot system of A2 (every sequenced element becomes a full-frame overlay — the overlap-by-default failure mode). The rule makes `layout="none"` the explicit opt-out so timed elements stay inline in their layout container; the SKILL.md main example applies it to every non-background sequence. Related: `premountFor` (`:59-67`, "Always premount any `<Sequence>`!") and nested sequences for hierarchical timing (`:120-131`).
**Load-bearing code:**
```
This will by default wrap the component in an absolute fill element.
If the items should not be wrapped, use the `layout` prop:

<Sequence layout="none">
  <Title />
</Sequence>
```
**Transferable lesson:** Time-structuring and space-structuring are orthogonal: sequences give an element its time window while `layout="none"` leaves its space ownership to the parent slot layout. Lesson scenes that mount per-cue elements in Sequences should default to `layout="none"` inside slotted containers, reserving the default AbsoluteFill for true full-frame layers.

### A8. Composition dimensions derived from content — calculateMetadata + media probing

**Where:** `vendor/skills/skills/remotion/rules/calculate-metadata.md:44-63`; `vendor/skills/skills/remotion/rules/images.md:56-71`
**What it does:** Instead of letterboxing/cropping media into a fixed canvas, `calculateMetadata` returns `width`/`height` probed from the actual asset (`getVideoDimensions()` via mediabunny, `getImageDimensions()` for stills), so the composition adapts to content rather than the content being squeezed into a grid. All metadata fields are overridable at this one pre-render hook (`calculate-metadata.md:124-134`).
**Load-bearing code:**
```
const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const dimensions = await getVideoDimensions(props.videoSrc);

  return {
    width: dimensions.width,
    height: dimensions.height,
  };
};
```
**Transferable lesson:** The composition itself is a measured artifact — one async pre-render hook owns duration/size/props. This is the framework-native place to inject our reconciled cue timeline (total `durationInFrames`) instead of hardcoding it in Root.tsx.

## B. Voice-visual coordination

### B1. One canonical caption data model — the `Caption` type with per-word ms timestamps

**Where:** `vendor/skills/skills/remotion/rules/subtitles.md:8-24`
**What it does:** Declares that ALL captions, regardless of origin (Whisper transcription, SRT import, hand-authored), must be normalized into one JSON shape before any display logic runs: `text`, `startMs`, `endMs`, a nullable `timestampMs` (word-level anchor), and nullable `confidence`. Downstream utilities (paging, highlighting) consume only this type; SRT files are converted in via `parseSrt()` (`import-srt-captions.md:41-51`).
**Load-bearing code:**
```
type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};
```
**Transferable lesson:** Milliseconds (not frames) as the storage unit, converted to frames only at the render boundary, keeps caption data fps-independent. The nullable `confidence` field flowing from ASR into the display type is a nice touch — our per-cue matchScore audit could ride the same record instead of a side file.

### B2. Word-timestamped transcription — Whisper.cpp with tokenLevelTimestamps

**Where:** `vendor/skills/skills/remotion/rules/transcribe-captions.md:25-68`
**What it does:** Author-time Node script (not in-composition): install whisper.cpp pinned to `1.5.5`, download `medium.en`, convert audio to a 16KHz wav first (`ffmpeg -ar 16000`, `:47-49`), transcribe with `tokenLevelTimestamps: true`, then normalize through `toCaptions()` into the B1 type and write JSON into `public/` for the composition to fetch. Final rule: "Transcribe each clip individually and create multiple JSON files" (`:68`) — per-clip alignment, never one giant transcript.
**Load-bearing code:**
```
const whisperCppOutput = await transcribe({
  model: "medium.en",
  whisperPath: to,
  whisperCppVersion: "1.5.5",
  inputPath: "/path/to/audio123.wav",
  tokenLevelTimestamps: true,
});

// Optional: Apply our recommended postprocessing
const { captions } = toCaptions({
  whisperCppOutput,
});
```
**Transferable lesson:** Same architecture as our voice lane (offline ASR → token timestamps → generated JSON module → composition consumes), independently converged on by the framework authors. The per-clip rule (`:68`) validates our v4 per-cue clip decision: alignment quality and drift containment come from clip-scoped transcription.

### B3. Caption paging — createTikTokStyleCaptions with a tunable ms window

**Where:** `vendor/skills/skills/remotion/rules/display-captions.md:63-121`
**What it does:** Groups word-level captions into display "pages" with one knob: `combineTokensWithinMilliseconds` (named `SWITCH_CAPTIONS_EVERY_MS = 1200`; "Higher values = more words per page / Lower values = fewer words"). Each page renders in its own `<Sequence>`; the page's end is `min(nextPage.startMs, page.startMs + SWITCH_MS)` converted to frames — so a page never outlives its window and never overlaps the next page's start, and zero/negative-duration pages are dropped (`:105-107`).
**Load-bearing code:**
```
const nextPage = pages[index + 1] ?? null;
const startFrame = (page.startMs / 1000) * fps;
const endFrame = Math.min(
  nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
  startFrame + (SWITCH_CAPTIONS_EVERY_MS / 1000) * fps,
);
const durationInFrames = endFrame - startFrame;

if (durationInFrames <= 0) {
  return null;
}
```
**Transferable lesson:** Paging is derived mechanically from measured word timings plus ONE semantic constant (1200ms) — no hand-tuned per-page timings. The `min(next start, window)` clamp is the overlap-free-by-construction pattern in the time domain, worth copying for any derived sub-cue schedule.

### B4. Spoken-word highlighting — token fromMs/toMs vs reconstructed absolute time

**Where:** `vendor/skills/skills/remotion/rules/display-captions.md:135-172`
**What it does:** Inside a page `<Sequence>`, `useCurrentFrame()` is sequence-local, so the component reconstructs absolute time as `page.startMs + (frame/fps)*1000` and marks a token active while `token.fromMs <= t < token.toMs` — karaoke highlighting driven purely by measured ASR onsets, never a fixed cadence. Includes a whitespace law: token `text` carries its leading space and the container uses `whiteSpace: "pre"` (`:126`) so joins render correctly.
**Load-bearing code:**
```
const currentTimeMs = (frame / fps) * 1000;
// Convert to absolute time by adding the page start
const absoluteTimeMs = page.startMs + currentTimeMs;
...
const isActive =
  token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
```
**Transferable lesson:** This is exactly our "spoken enumeration binds to token onsets" law, in caption form — and the local→absolute time reconstruction is the subtle bug our `cues[id].startFrame + offset` discipline also guards. The half-open interval (`<=` start, `>` end) avoids double-active tokens at boundaries.

### B5. Narration-driven composition duration — per-scene TTS clips summed in calculateMetadata

**Where:** `vendor/skills/skills/remotion/rules/voiceover.md:26-91`; `vendor/skills/skills/remotion/rules/get-audio-duration.md:14-28`
**What it does:** TTS (ElevenLabs, `eleven_multilingual_v2`, voice_settings stability 0.5 / similarity 0.75 / style 0.3) is generated PER SCENE into `public/voiceover/<comp>/<scene>.mp3`. Then `calculateMetadata` probes every clip's real duration with mediabunny (`input.computeDuration()`), converts to frames, and the composition's `durationInFrames` is the ceil of the sum — audio length drives video length, not vice versa. The measured `sceneDurations` array is passed back into the component as a prop so each scene knows its own window (`:89`), and transition overlap must be subtracted from the total (`:91`).
**Load-bearing code:**
```
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
**Transferable lesson:** "Measure, don't assume" as framework doctrine: the ONLY source of scene length is the probed audio file. Our Wave 3.5 reconcile generalizes this with `max(narration, motion) + tail`, but the mediabunny probe is a lighter-weight duration oracle than spawning ffprobe and works in-browser too.

### B6. Adaptive silence detection — loudnorm-derived threshold feeding silencedetect

**Where:** `vendor/skills/skills/remotion/rules/silence-detection.md:14-70`
**What it does:** Two-pass, content-adaptive silence trim: pass 1 runs `loudnorm=print_format=json` to get the file's own EBU R128 `input_thresh` (gating threshold); pass 2 feeds that value as `silencedetect=noise=${THRESH}dB:d=0.5` — so "silent" is defined relative to this recording's loudness, not a fixed -30dB guess. Interpretation rules commit to numbers: minimum silence duration 0.5s; no leading silence if first `silence_start` > 0.5s; merge near-contiguous silences when the gap < 0.2s. Detected boundaries become `trimBefore={Math.floor(leadingEnd * fps)}` / `trimAfter={Math.ceil(trailingStart * fps)}` on the media component — floor/ceil chosen conservatively so trimming never eats speech.
**Load-bearing code:**
```
npx remotion ffmpeg -i public/video.mov -map 0:a -af "silencedetect=noise=${THRESH}dB:d=0.5" -f null /dev/null
```
```
- **Leading silence**: Consecutive silence segments starting at or near 0. If the first `silence_start` is > 0.5s, there is no leading silence.
When multiple silences are nearly contiguous at the start or end (gap < 0.2s), treat them as a single leading/trailing silence block.
```
**Transferable lesson:** The adaptive-threshold trick (derive `noise` from the same file's loudnorm `input_thresh`) is directly better than any fixed dB constant for trimming TTS padding across voices/languages; the floor/ceil frame-rounding asymmetry is a small correctness detail worth stealing for our clip trimmer.

### B7. Frame-domain audio envelopes and delays — volume callbacks local to audio start

**Where:** `vendor/skills/skills/remotion/rules/audio.md:61-103`
**What it does:** Audio timing/level control lives in the same frame coordinate system as visuals: delay = wrap `<Audio>` in `<Sequence from={1 * fps}>`; fade = a `volume={(f) => interpolate(f, [0, 1*fps], [0,1], {extrapolateRight:"clamp"})}` callback. The critical coordinate rule is stated explicitly: "The value of `f` starts at 0 when the audio begins to play, not the composition frame" (`:103`). Trims are frame-valued (`trimBefore`/`trimAfter`, `:43-57`); loops can extend the volume-curve frame count via `loopVolumeCurveBehavior: "extend"` (`:140-151`).
**Load-bearing code:**
```
<Audio
  src={staticFile("audio.mp3")}
  volume={(f) =>
    interpolate(f, [0, 1 * fps], [0, 1], { extrapolateRight: "clamp" })
  }
/>
```
**Transferable lesson:** Volume envelopes are per-clip-local functions of frame — the same local-vs-absolute frame trap as B4. Our `<LessonBgmLayer>` duck envelope should be expressed as such a callback keyed off cue narration windows translated into clip-local frames.

### B8. Audio-reactive visuals — windowed audio data with a shared parent frame

**Where:** `vendor/skills/skills/remotion/rules/audio-visualization.md:18-87` (bass extraction `:139-158`, log scaling `:186-198`)
**What it does:** `useWindowedAudioData({src, frame, fps, windowInSeconds: 30})` streams only a 30s window of samples; `visualizeAudio()` yields per-frame FFT bins (`numberOfSamples` must be a power of 2; bass = left of array). Bass-reactive motion averages `frequencies.slice(0, 32)` into a 0-1 intensity mapped to scale/opacity. Two correctness rules: pass the PARENT's `frame` into children rather than calling `useCurrentFrame()` inside `<Sequence>`-offset children ("this causes discontinuous visualization", `:87`), and apply dB log scaling (`minDb -100 / maxDb -30`) because "Low frequencies naturally dominate" (`:188-198`).
**Load-bearing code:**
```
**Important:** When passing `audioData` to child components, also pass the `frame` from the parent. Do not call `useCurrentFrame()` in each child - this causes discontinuous visualization when children are inside `<Sequence>` with offsets.
```
**Transferable lesson:** If we ever add a narration-waveform or beat-reactive accent, the parent-frame rule prevents the sequence-local-frame discontinuity bug, and the log-domain normalization numbers (-100/-30 dB) are a usable default.

## C. Anti-patterns & gaps

- **No music ducking anywhere.** `grep -rn "duck" skills/` → 0 hits; grep for `music|bgm|background audio` only hits a tag line in `audio-visualization.md:5`. The repo teaches layering multiple `<Audio>` tracks (`audio.md:39`) and per-clip volume callbacks (`audio.md:86-103`) but never composes them into a narration-over-bed policy (no sidechain, no duck-on-speech, no LUFS target). A pipeline mixing voice + music gets zero guidance.
- **Overlap prevention is entirely advisory; there is no detection or enforcement mechanism.** The strongest guard is a human eyeballing "a representative frame" (`video-layout.md:63-68`). Nothing connects the measurement primitives (`measuring-text.md`, `measuring-dom-nodes.md`) back to the safe-area/overlap rules — `fillTextBox` exists but no rule says "verify the headline fits the safe area before render." The numbers (80px/100px/84px/44px/32px) are also called "rough minimums" and exist only as prose an agent may ignore.
- **`display-captions.md` violates the repo's own layout rules.** The caption page renders `fontSize: 80` hardcoded with `whiteSpace: "pre"` (no wrapping) centered in a full-frame `AbsoluteFill` (`display-captions.md:153-154`) — no `fitText`, no safe-area margin, no `fillTextBox` paging by width. A long page (e.g. `combineTokensWithinMilliseconds` grouping several long words) walks straight off the 80px safe area the layout rule mandates.
- **Fractional frames passed to `<Sequence>`.** `const startFrame = (page.startMs / 1000) * fps` (`display-captions.md:98`) is not rounded before being handed to `from={startFrame}` (`:111-112`); `Math.round` is absent, so page boundaries land between frames (Remotion tolerates but timing gates comparing integers will drift). Contrast with `silence-detection.md:68-69`, which correctly floors/ceils.
- **Voice-visual sync is duration-granular only.** `voiceover.md` sizes scenes from clip durations (B5) but never links its own TTS output to the transcription pipeline (B2) — there is no rule saying "transcribe the generated voiceover to get word timings for in-scene animation." Word-onset binding exists only for captions; visuals (typewriter `CHAR_FRAMES = 2` in `assets/text-animations-typewriter.tsx:14`, highlight `HIGHLIGHT_START_FRAME = 30` in `assets/text-animations-word-highlight.tsx:18`) run on fixed cadences/literals — exactly the step-constant anti-pattern our onset law forbids.
- **`measuring-dom-nodes.md` measures in `useEffect` + `setState` with no `delayRender()`** (`measuring-dom-nodes.md:23-30`): the first rendered frame uses `{width: 0, height: 0}` before the effect commits — in a real render that frame can be captured wrong; the rule never mentions the hazard.
- **No tests/CI in the mirror; assets only partially demoed.** Only 3 of 40 rules have compilable assets wired into `src/Root.tsx`; everything else is unexecuted markdown that can silently rot against the API it documents (mitigated only by living in the monorepo upstream).

## D. Verdict

Worth stealing, ranked:
1. **Overlap-by-construction slot doctrine (A2) + safe-area/text-minimum numbers (A1).** The single best "structured yet flexible" layout policy in circulation: flow slots own space, absolute positioning is decoration-only, and 80/100px insets + 84/44/32px role minimums (width-scaled) are concrete enough to become machine gates in our `lesson:check`.
2. **Caption paging + token highlighting stack (B1/B3/B4).** Canonical ms-based `Caption` type → `createTikTokStyleCaptions(1200ms)` → per-page `<Sequence>` with `min(nextStart, window)` clamp → half-open `fromMs/toMs` active-token test with local→absolute time reconstruction. A complete, reimplementable spoken-word→visual sync recipe.
3. **Adaptive silence threshold (B6).** Deriving `silencedetect noise=` from the same file's `loudnorm input_thresh` (plus d=0.5s, 0.2s merge gap, floor/ceil trim rounding) beats every fixed-dB trimmer; drop-in improvement for TTS padding trims.
4. **fitText-with-cap + measurement preconditions (A4/A5).** Auto-size variable text between a role minimum and cap, only after a font-ready barrier, from the same style object used to render.
Biggest holes to NOT copy: advisory-only layout rules with no enforcement loop, zero music-ducking guidance, and fixed-cadence text animations that ignore the repo's own word-timestamp machinery.
