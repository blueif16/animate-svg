# editor-pro-max — vendor scan (2026-07-03)

https://github.com/Hainrixz/editor-pro-max @ 743f46c719ad19ad15eb5b4aebcf6c0fa069ed54 — Claude-Code-driven natural-language → Remotion-MP4 "AI video editor": a component/template library plus a talking-head/podcast editing pipeline (Whisper transcription + ffmpeg silence detection), meant to be operated by an agent through a bundled `CLAUDE.md` + 8 vendored skills.

## What this repo is

A Remotion 4.0.440 component library (23 files under `src/components/`, one `TextStyles.ts` style-preset module, one `TransitionPresets.ts`) plus 9 ready-made templates (social/content/promo/editing) and 2 "editing" scripts pipelines (talking-head cut + podcast clip). It ships no tests and no CI (`find . -iname "*.test.*" -o -iname "*.spec.*"` → empty; `.github/` absent). The cloned history is a single commit (`git log --oneline` → 1 line), so no development trail to judge maturity from; the product markets itself at 195 stars but that is a claim, not evidence. The repo's `CLAUDE.md` (19KB) is the actual API reference an operating agent reads — it is more informative than `README.md` and is treated here as the map, not as evidence for any specific mechanism (each mechanism below is verified against the source file it claims to describe). Architecturally it is "props in, `<AbsoluteFill>`/`<Sequence>` out" — no dynamic-metadata layer, no measurement layer, no test harness; correctness is asserted by convention (matching literals across files) rather than enforced by code.

## A. Layout & overlay prevention

### A1. `SafeArea` — declarative content-safe inset, reused with different padding per platform

**Where:** `vendor/editor-pro-max/src/components/layout/SafeArea.tsx:11-27`

**What it does:** A single `<AbsoluteFill>` wrapper that applies `padding: verticalpx horizontalpx` to whatever children it wraps. It carries no knowledge of composition width/height or of what else is on screen — every template (`TikTokVideo`, `InstagramReel`, `YouTubeShort`, `Presentation`, `PodcastClip`, `Announcement`, `Testimonial`) picks its own `paddingHorizontal`/`paddingVertical` numbers by hand (e.g. TikTok `60/120`, YouTubeShort `60/200`, Presentation `100/100` — from `grep -n "SafeArea paddingHorizontal" src/templates/**/*.tsx`). There is no shared "safe-area token" — each template re-derives the right numbers for its own aspect ratio.

**Load-bearing code:**
```tsx
export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  paddingHorizontal = 60,
  paddingVertical = 60,
  style,
}) => {
  return (
    <AbsoluteFill
      style={{
        padding: `${paddingVertical}px ${paddingHorizontal}px`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
```

**Transferable lesson:** A named `SafeArea` primitive (rather than each scene hand-rolling `padding`) is a cheap, real convention win — but the per-platform numbers must live in ONE table (keyed by aspect ratio), not be re-typed per template; our pipeline's `layout.ts`-per-lesson + `manifest.ts` bbox contract is already the stronger version of this (declared boxes, not just padding).

### A2. `SplitScreen` — ratio/gap-driven partition, capped and non-overlapping by construction

**Where:** `vendor/editor-pro-max/src/components/layout/SplitScreen.tsx:12-83`

**What it does:** Takes 2–4 children, silently drops any beyond 4 (`React.Children.toArray(children).slice(0, 4)`), and lays out exactly 2 panels with flexbox (`width`/`height` driven by a single `ratio` prop, e.g. `50%`/`50%`) or 3–4 panels with a fixed 2×2 CSS grid. Each panel gets its own `overflow: "hidden"` div, so panels can never bleed into each other — the partition is structural (flex/grid math), not measured or literal-pixel.

**Load-bearing code:**
```tsx
const panels = React.Children.toArray(children).slice(0, 4);
const isHorizontal = direction === "horizontal";

if (panels.length === 2) {
  const firstSize = `${ratio * 100}%`;
  const secondSize = `${(1 - ratio) * 100}%`;
  return (
    <AbsoluteFill style={{display: "flex", flexDirection: isHorizontal ? "row" : "column", gap, ...style}}>
      <div style={{width: isHorizontal ? firstSize : "100%", height: isHorizontal ? "100%" : firstSize, position: "relative", overflow: "hidden"}}>
        {panels[0]}
      </div>
```

**Transferable lesson:** Percentage/ratio-based flex partitioning + a hard cap on panel count + `overflow:hidden` per cell is a correct, simple way to guarantee zero spatial collision for N discrete regions without ever measuring anything — worth mirroring for any lesson layout that splits the frame into fixed zones (e.g. left-diagram / right-caption).

### A3. `PictureInPicture` — corner+margin floating region with a fixed footprint

**Where:** `vendor/editor-pro-max/src/components/layout/PictureInPicture.tsx:20-62`

**What it does:** Renders a `main` layer full-bleed and a `pip` layer in an absolutely-positioned box whose size (`pipWidth`/`pipHeight`) and corner (`margin` from one of 4 corners) are explicit props; the box gets `overflow: "hidden"` so oversized content is clipped rather than pushing other elements. Collision-avoidance here is "the box has a declared, fixed footprint, so callers just don't put another absolute element inside the same corner+margin."

**Load-bearing code:**
```tsx
const positionStyles: React.CSSProperties = {
  topLeft: {top: margin, left: margin},
  topRight: {top: margin, right: margin},
  bottomLeft: {bottom: margin, left: margin},
  bottomRight: {bottom: margin, right: margin},
}[corner];
```

**Transferable lesson:** The "declared box + overflow:hidden clip" pattern is the minimum viable collision guard when there is no measurement layer — but it is purely by-convention (see C4): nothing stops two components from choosing the same corner.

### A4. `BeforeAfter` template — `clipPath` wipe partitions the frame into two mutually exclusive regions

**Where:** `vendor/editor-pro-max/src/templates/promo/BeforeAfter.tsx:15-107`

**What it does:** Computes a single `wipeProgress` (0–100) from `interpolate(frame, [midpoint-15, midpoint+15], [0,100], {clamp})`, then clips the "before" layer with `inset(0 ${wipeProgress}% 0 0)` and the "after" layer with the complementary `inset(0 0 0 ${100 - wipeProgress}%)`. Because the two insets are always complements of the same number, the two label chips (`beforeLabel` pinned `top:40,left:40`; `afterLabel` pinned `top:40,right:40`) can never occupy the same pixels — the exclusivity is guaranteed algebraically, not by manual pixel-checking.

**Load-bearing code:**
```tsx
const midpoint = Math.floor(durationInFrames / 2);
const wipeProgress = interpolate(frame, [midpoint - 15, midpoint + 15], [0, 100], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
...
<AbsoluteFill style={{clipPath: `inset(0 ${wipeProgress}% 0 0)`}}>{children[0]}...</AbsoluteFill>
<AbsoluteFill style={{clipPath: `inset(0 0 0 ${100 - wipeProgress}%)`}}>{children[1]}...</AbsoluteFill>
```

**Transferable lesson:** "Derive both regions' clip boundaries from ONE shared progress value" is a reusable pattern for any split-reveal in a lesson (e.g. before/after place-value regrouping) — guarantees no double-counted pixels without a bbox check.

### A5. `GridPattern` / `ParticleField` — layout math driven by `useVideoConfig().width/height`, not hardcoded pixels

**Where:** `vendor/editor-pro-max/src/components/backgrounds/GridPattern.tsx:15-107`; `vendor/editor-pro-max/src/components/backgrounds/ParticleField.tsx:18-70` (`grep -n "useVideoConfig" src/components/backgrounds/ParticleField.tsx` → line 44)

**What it does:** `GridPattern` reads `{width, height} = useVideoConfig()` and computes `cols = Math.ceil(width/spacing)+2`, `rows = Math.ceil(height/spacing)+2` so the dot/line/cross grid always fully tiles whatever composition size is active (1080×1920 portrait vs 1920×1080 landscape) with no hardcoded `1920`/`1080` literal. `ParticleField.generateParticles(count, width, height)` seeds particle positions as `seededRandom(i)*width` / `*height`, and its per-frame wrap math (`(p.y - movement) % height`) also reads live `width`/`height` — so switching composition dimensions never needs a code change.

**Load-bearing code:**
```tsx
const {width, height} = useVideoConfig();
const offset = animate ? (frame * animateSpeed) % spacing : 0;
const cols = Math.ceil(width / spacing) + 2;
const rows = Math.ceil(height / spacing) + 2;
```

**Transferable lesson:** The rule "any decorative background element derives its extent from `useVideoConfig()`, never from a literal composition size" is exactly the discipline our own `layout.ts` should hold for anything not already anchored to a manifest zone — this repo does it correctly for backgrounds even though (per C1–C3) it fails to do the equivalent for text/duration.

### A6. Codified-but-unused: `@remotion/layout-utils` `measureText`/`fitText`/`fillTextBox` (skill only)

**Where:** `vendor/editor-pro-max/.agents/skills/remotion-best-practices/rules/measuring-text.md:18-83` (symlinked into the repo at `skills/remotion-best-practices/rules/measuring-text.md`)

**What it does:** The bundled skill documents three real Remotion utilities: `measureText()` (width/height of a text run — cached, results are memoized), `fitText({text, withinWidth, fontFamily, fontWeight})` → returns the optimal `fontSize` for a given container width, and `fillTextBox({maxBoxWidth, maxLines})` → an incremental `box.add(word)` API that reports `exceedsBox: true` the moment appended text would overflow. This is the actual auto-sizing/overflow-detection mechanism Remotion ships — but it is NOT called anywhere in `src/` (`grep -rn "measureText|fitText|fillTextBox" src/ scripts/` → no matches) and `@remotion/layout-utils` is not even a `package.json` dependency (`package.json:15-32` lists `@remotion/captions`, `@remotion/media`, `@remotion/transitions`, etc., but not `@remotion/layout-utils`).

**Load-bearing code:**
```tsx
const { fontSize } = fitText({
  text: "Hello World",
  withinWidth: 600,
  fontFamily: "Inter",
  fontWeight: "bold",
});

return (
  <div style={{ fontSize: Math.min(fontSize, 80), fontFamily: "Inter", fontWeight: "bold" }}>
    Hello World
  </div>
);
```
```tsx
const box = fillTextBox({ maxBoxWidth: 400, maxLines: 3 });
for (const word of words) {
  const { exceedsBox } = box.add({ text: word + " ", fontFamily: "Arial", fontSize: 24 });
  if (exceedsBox) { break; }
}
```

**Transferable lesson:** `fitText`/`fillTextBox` is exactly the "text/DOM measurement" primitive our composer discipline should reach for whenever narration or a label's length is not author-controlled (e.g. a Chinese vs. English caption of unknown length) — cap the returned `fontSize` (as the skill itself shows: `Math.min(fontSize, 80)`) rather than letting it grow unbounded, and use `fillTextBox` to decide when to truncate/paginate instead of trusting `maxWidth` + `wordBreak: "break-word"` (which is all this repo's own `AnimatedTitle` uses — see C1).

### A7. Codified-but-unused: `useCurrentScale()` for correct `getBoundingClientRect` under Remotion's container scale

**Where:** `vendor/editor-pro-max/.agents/skills/remotion-best-practices/rules/measuring-dom-nodes.md:1-34`

**What it does:** Documents that Remotion applies a CSS `scale()` transform to the whole video container in Studio/preview, which means a raw `getBoundingClientRect()` on any DOM node returns SCALED pixel values; `useCurrentScale()` returns that scale factor so a component can divide it back out (`rect.width / scale`) to get true composition-space pixels. Not used anywhere in `src/` (no `getBoundingClientRect` or `useCurrentScale` call in `src/`), consistent with A6 — the repo's own components never measure themselves at all.

**Load-bearing code:**
```tsx
const ref = useRef<HTMLDivElement>(null);
const scale = useCurrentScale();
const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

useEffect(() => {
  if (!ref.current) return;
  const rect = ref.current.getBoundingClientRect();
  setDimensions({ width: rect.width / scale, height: rect.height / scale });
}, [scale]);
```

**Transferable lesson:** Any DOM-measurement code path in our own pipeline (e.g. a future `measureProps` extension that reads live DOM rather than the linear manifest) must divide by `useCurrentScale()` or it will silently misreport bbox sizes whenever Remotion Studio's preview is not rendered at 100% — a sharp, easy-to-miss correctness trap this repo's skill correctly flags but never has to actually apply.

### A8. Codified numeric layout/hierarchy thresholds (motion-designer skill — prose rules, not enforced code)

**Where:** `vendor/editor-pro-max/.agents/skills/motion-designer/rules/visual-hierarchy.md:17-19,424` and `.../scene-composition.md:218`

**What it does:** The bundled `motion-designer` skill commits to specific numeric floors an agent is expected to self-apply when composing a scene: a 3-tier size split ("Primary 10-20% of frame / Secondary 20-30% / Tertiary 50-70%"), a minimum negative-space floor ("Sufficient negative space (minimum 30% of frame)"), and a minimum contrast floor ("Contrast hierarchy: Primary highest (12:1+), Secondary medium (7:1), Tertiary lower (4.5:1)"). None of this is checked by any code — it is a checklist an LLM is trusted to self-audit against.

**Load-bearing code:**
```
1. **Primary (Hero)** — The star, what you want seen first (10-20% of frame)
2. **Secondary** — Supporting cast, contextual info (20-30% of frame)
3. **Tertiary** — Background, atmosphere (50-70% of frame)
```
```
- [ ] Sufficient negative space (minimum 30% of frame)
```
```
- [ ] Contrast hierarchy: Primary highest (12:1+), Secondary medium (7:1), Tertiary lower (4.5:1)
```

**Transferable lesson:** These are reasonable numeric anchors (frame-share bands, contrast floors) that a prompt/skill can cite verbatim as an acceptance bar — but as this repo demonstrates, prose-only thresholds with no automated check are exactly the kind of rule that silently rots; our own `--measured` bbox/contrast gate (`lesson:check`) is the strictly stronger version of the same intent (a gate that actually runs, per our CLAUDE.md's own "MEASURE, DON'T ASSUME" law) and should be preferred over porting the prose as-is.

## B. Voice-visual coordination

### B1. Whisper.cpp token-level transcription → `Caption[]` timestamps (the timing source)

**Where:** `vendor/editor-pro-max/scripts/transcribe.ts:21-59`

**What it does:** Installs Whisper.cpp (`installWhisperCpp`), downloads the `medium.en` model, transcribes the extracted audio with `tokenLevelTimestamps: true`, then converts the raw Whisper output to Remotion's canonical `Caption[]` shape via `toCaptions({whisperCppOutput})` and writes `public/captions.json`. This is the actual source of every downstream word timestamp in the repo (B2/B3 all consume its output).

**Load-bearing code:**
```ts
const whisperOutput = await transcribe({
  model: "medium.en",
  whisperPath,
  whisperCppVersion: "1.5.5",
  inputPath,
  tokenLevelTimestamps: true,
});

const {captions} = toCaptions({whisperCppOutput: whisperOutput});
writeFileSync(outputPath, JSON.stringify(captions, null, 2));
```

**Transferable lesson:** "Always request token-level (not segment-level) timestamps from the transcription step, then normalize into one canonical `{text,startMs,endMs}` shape immediately" mirrors our own `asr-cue-aligner` discipline — this repo's `Caption` type (`.agents/skills/remotion-best-practices/rules/subtitles.md:16-24`: `{text, startMs, endMs, timestampMs, confidence}`) is a clean minimal schema worth comparing against our `tokenOnsets` shape.

### B2. `createTikTokStyleCaptions()` paging + absolute-ms active-token highlight

**Where:** `vendor/editor-pro-max/src/components/text/CaptionOverlay.tsx:108-161,210-230`

**What it does:** Groups the flat `Caption[]` into `TikTokPage[]` via `@remotion/captions`' `createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds})` — a single tunable (default `1200`ms in this repo, same default the skill documents at `.agents/skills/remotion-best-practices/rules/display-captions.md:73`) that controls how many words are grouped per on-screen page. Each page is mounted in its own `<Sequence from={startFrame} durationInFrames={duration}>` where `startFrame`/`endFrame` are derived from `page.startMs`/next page's `startMs` (or a synthetic `page.startMs + combineTokensWithinMs` fallback for the last page) — never a literal frame number. Inside a page, the currently-spoken token is found by converting `useCurrentFrame()` back to an absolute timestamp (`page.startMs + (frame/fps)*1000`) and comparing against each `token.fromMs <= t < token.toMs`.

**Load-bearing code:**
```tsx
const pages = useMemo(() => {
  if (!captions) return [];
  const result = createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds: combineTokensWithinMs});
  return result.pages;
}, [captions, combineTokensWithinMs]);
...
const currentTimeMs = (frame / fps) * 1000;
const absoluteTimeMs = page.startMs + currentTimeMs;
...
const isActive = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
```

**Transferable lesson:** The "re-derive absolute time from `Sequence`-local frame + page offset, then half-open-interval-test the token span" is the exact pattern our onset-binding law (`cue.tokenOnsets` / `stepFramesFromOnsets`) already generalizes — worth cross-checking our token-onset primitive against this reference implementation for edge cases (e.g. this repo's `token.toMs > absoluteTimeMs` strict-inequality choice avoids double-highlighting at exact boundaries).

### B3. Silence detection → speech-segment cut list → `JumpCut` reassembly (voice drives visual sequencing)

**Where:** `vendor/editor-pro-max/scripts/detect-silence.ts:26-73`; `vendor/editor-pro-max/src/utils/editing.ts:3-40`; `vendor/editor-pro-max/src/components/media/JumpCut.tsx:20-73`

**What it does:** `detect-silence.ts` runs `ffmpeg -af silencedetect=noise=-30dB:d=0.5` (both thresholds overridable via CLI args) over the source video, parses `silence_start`/`silence_end` from stderr, and computes `speechSegments` as the literal inverse of the detected silences (walk a `cursor` forward, emit a speech segment whenever a silence gap starts after the cursor). `editing.ts` then pads each speech segment by `paddingSeconds` (default `0.1`) and drops any segment shorter than `minSegmentSeconds` (default `0.3`) via `buildCutList`, then coalesces segments separated by a small gap (`gapThresholdSeconds`, default `0.3`) via `mergeSegments`. `JumpCut` consumes the final `Segment[]` and renders one `<Series.Sequence durationInFrames={Math.round((end-start)*fps)}>` + trimmed `<VideoClip>` per segment — so the entire visual cut structure (how many scenes, how long each is) is DERIVED from the audio's speech/silence pattern, not authored.

**Load-bearing code:**
```ts
// detect-silence.ts — invert silence into speech segments
const speechSegments: Array<{start: number; end: number}> = [];
let cursor = 0;
for (const silence of silenceSegments) {
  if (silence.start > cursor) { speechSegments.push({start: cursor, end: silence.start}); }
  cursor = silence.end;
}
if (cursor < totalDuration) { speechSegments.push({start: cursor, end: totalDuration}); }
```
```ts
// editing.ts — pad, filter, then merge small gaps
export const buildCutList = (speechSegments, {paddingSeconds = 0.1, minSegmentSeconds = 0.3} = {}) =>
  speechSegments
    .map((seg) => ({startSeconds: Math.max(0, seg.startSeconds - paddingSeconds), endSeconds: seg.endSeconds + paddingSeconds}))
    .filter((seg) => seg.endSeconds - seg.startSeconds >= minSegmentSeconds);
```

**Transferable lesson:** This "detect → pad → filter-tiny → merge-close-gaps → derive Series durations" pipeline is a genuinely reusable recipe for turning a raw silence/VAD signal into a stable edit decision list; the specific thresholds (`0.1s` pad, `0.3s` minimum segment, `0.3s` merge gap, `-30dB` noise floor) are reasonable defaults to borrow if we ever need voice-activity-driven (rather than script-driven) cue boundaries.

### B4. `AudioTrack` — fade envelope + speech-segment ducking as one `volume` callback

**Where:** `vendor/editor-pro-max/src/components/media/AudioTrack.tsx:17-78`

**What it does:** A single per-frame `volumeCallback(frame)` composes THREE independent effects into one number: a linear fade-in over `fadeInDurationSeconds*fps` frames, a linear fade-out starting at `durationInFrames - fadeOutFrames`, and a hard duck to `duckVolume` whenever the current time falls inside any of the caller-supplied `duckDuringSegments` (typically the same speech segments from B3). Passed straight into `@remotion/media`'s `<Audio volume={volumeCallback}>`.

**Load-bearing code:**
```tsx
const volumeCallback = (frame: number): number => {
  let vol = volume;
  if (frame < fadeInFrames) { vol *= interpolate(frame, [0, fadeInFrames], [0, 1], {extrapolateRight: "clamp"}); }
  const fadeOutStart = durationInFrames - fadeOutFrames;
  if (frame >= fadeOutStart) { vol *= interpolate(frame, [fadeOutStart, durationInFrames], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}); }
  if (duckDuringSegments) {
    const currentSeconds = frame / fps;
    const isDucking = duckDuringSegments.some((seg) => currentSeconds >= seg.startSeconds && currentSeconds <= seg.endSeconds);
    if (isDucking) { vol = duckVolume; }
  }
  return vol;
};
```

**Transferable lesson:** Composing fade + duck as ONE callback (rather than two separate effects fighting over the same `<Audio>` node) is the right shape for a bed-envelope function — directly comparable to our own `LessonBgmLayer` bed envelope requirement ("bed envelope reads cue narration windows + total"); note this repo's duck is a hard step function (no ramp) while our sound-design skill's "3-point duck" implies a ramped transition — worth checking our implementation doesn't regress to this repo's harder cut.

### B5. `calculateMetadata` + `getAudioDuration` (mediabunny) — lock composition duration to real generated narration (skill-documented, unused in this repo's own templates)

**Where:** `vendor/editor-pro-max/.agents/skills/remotion-best-practices/rules/voiceover.md:56-91` (depends on `get-audio-duration.md:14-28` and `calculate-metadata.md:33-42`)

**What it does:** Documents the canonical Remotion "measure, don't assume" pattern for TTS-driven video: generate one MP3 per scene via ElevenLabs, then in the `<Composition>`'s `calculateMetadata` async function, call `getAudioDuration()` (backed by `mediabunny`'s `Input.computeDuration()`) for every scene file, convert each to frames at a fixed FPS, and return `durationInFrames: Math.ceil(sum(sceneDurations))` — i.e. the composition's total length is COMPUTED from real audio, never hardcoded. Verified absent from this repo's own code: `grep -rn "calculateMetadata" src/ scripts/` → no matches; every `<Composition>` in `Root.tsx` instead hardcodes a literal `durationInFrames` (e.g. `TikTok`: `270`, `TalkingHeadEdit`: `900`).

**Load-bearing code:**
```tsx
export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const durations = await Promise.all(
    SCENE_AUDIO_FILES.map((file) => getAudioDuration(staticFile(file))),
  );
  const sceneDurations = durations.map((durationInSeconds) => durationInSeconds * FPS);
  return {
    durationInFrames: Math.ceil(sceneDurations.reduce((sum, d) => sum + d, 0)),
  };
};
```

**Transferable lesson:** This is the same principle our CLAUDE.md already enforces more strictly (Wave 3.5's `cueFrames = max(narrationFrames+gapFrames, motionFrames) + tail`, computed from the ACTUAL per-cue clip module rather than a single composition-wide sum) — useful mainly as independent, external confirmation that "duration derives from measured audio, never a literal" is the field's own best-practice consensus, not an idiosyncrasy of our pipeline. See C3 for why this repo itself fails to apply its own documented pattern.

### B6. `offsetCaptions` / `offsetMs` — re-aligning caption timestamps when extracting a sub-clip

**Where:** `vendor/editor-pro-max/src/utils/editing.ts:46-57`; consumed at `vendor/editor-pro-max/src/templates/editing/PodcastClip.tsx:35-54`

**What it does:** When a template extracts a time-window from a longer source (`PodcastClip`'s `clipStartSeconds`/`clipEndSeconds`), the full-video `captions.json` timestamps are still relative to the ORIGINAL video, so `offsetCaptions(captions, offsetMs)` subtracts the clip's start offset from every caption's `startMs`/`endMs` and drops any caption that now falls before 0 or has non-positive duration. `CaptionOverlay` re-implements the identical shift inline (`offsetMs` prop, same filter logic) rather than importing the shared helper — two independent implementations of the same rule.

**Load-bearing code:**
```ts
export const offsetCaptions = <T extends {startMs: number; endMs: number}>(captions: T[], offsetMs: number): T[] =>
  captions
    .map((c) => ({...c, startMs: c.startMs - offsetMs, endMs: c.endMs - offsetMs}))
    .filter((c) => c.startMs >= 0 && c.endMs > 0);
```

**Transferable lesson:** Whenever a lesson-pipeline artifact re-slices a longer timeline (e.g. re-using one narration take across two cut points), timestamp re-basing + drop-if-negative is the correct minimal transform — but it should live in exactly ONE place; this repo's own duplication (`editing.ts` vs. inline in `CaptionOverlay.tsx:94-102`) is a small instance of the same "same rule, two copies" risk our capability-registry-harness exists to prevent.

## C. Anti-patterns & gaps

1. **The repo documents text auto-sizing/overflow tools it never uses, and its own component library ships the exact bug those tools would catch.** `@remotion/layout-utils` (`measureText`/`fitText`/`fillTextBox`, `.agents/skills/remotion-best-practices/rules/measuring-text.md:18-83`) is not a `package.json` dependency (`package.json:15-32`) and is never imported in `src/` (`grep -rn "measureText|fitText|fillTextBox" src/` → no hits). Meanwhile `AnimatedTitle` (`src/components/text/AnimatedTitle.tsx:41,54,145-176`) takes a caller-supplied `fontSize` (default `64`) and a `maxWidth = "80%"` and relies purely on CSS (`whiteSpace: "pre-wrap", wordBreak: "break-word"`) to avoid overflow — there is no code path that shrinks `fontSize` or truncates text if a longer `hook`/`title`/`quote` string is passed (every template's default props are short strings, e.g. `TikTokVideo`'s `hook = "Your hook here"`, so the bug is invisible until a real user supplies a long headline). This is the single biggest finding: SHIPPING the knowledge of the correct mechanism (in a skill) is not the same as the app USING it.

2. **`calculateMetadata` — the documented "duration derives from real audio" pattern (`.agents/skills/remotion-best-practices/rules/voiceover.md:56-91`) — is likewise never called** (`grep -rn "calculateMetadata" src/ scripts/` → no matches). Every composition duration in `src/Root.tsx:27-165` is a hand-picked literal (`TikTok`: 270 frames, `PodcastClip`/`TalkingHeadEdit`: 900 frames) with no relationship to the actual length of any voice/video asset a user supplies — if a user's talking-head video runs longer than 900 frames (30s) at the composition's declared `durationInFrames`, it will simply be cut off mid-sentence, silently.

3. **A hardcoded `fps=30` literal breaks the moment a template is reused at a different frame rate.** `TalkingHeadEdit.tsx:124-126` computes the CTA's entrance delay as `segments.reduce((sum, s) => sum + (s.endSeconds - s.startSeconds), 0) * 30` — the `* 30` is a bare frames-per-second literal instead of reading `useVideoConfig().fps`. `src/presets/dimensions.ts:7` defines a `youtube_short` platform at `fps: 60`; if `TalkingHeadEdit` (currently only wired into `Root.tsx` at `fps={30}`) were ever reused for a 60fps composition, this line would silently under-count the CTA's delay by half, entering it twice as early as intended — exactly the "frame literal / mixed coordinate space" bug class our own CLAUDE.md's "ZERO FRAME LITERALS" law exists to prevent.

4. **No spatial collision system across independently-positioned overlays — each corner/offset is a private literal, not a shared registry.** `CallToAction` (`src/components/overlays/CallToAction.tsx:48`: `bottom: {bottom: 80, left: 0, right: 0}`, i.e. a full-width band) and `LowerThird` (`src/components/text/LowerThird.tsx:68`: `bottomLeft: {bottom: 80, left: 60}`) both hardcode the identical `bottom: 80` offset independently; nothing in either component, or in any template, checks whether two overlays sharing a composition will collide if both are enabled (e.g. a caller combining `LowerThird` + `CallToAction` in one scene, which nothing in the type system or the templates forbids). `Watermark`, `ProgressBar`, `CaptionOverlay`, and `CountdownTimer` each separately hardcode their own margin/offset the same way — five independent "trust me, it won't collide" literals instead of one safe-zone table an overlay claims a slot from.

5. **Duplicated literals that must be kept in sync by hand, with no shared constant and no test to catch drift.** `Presentation.tsx` positions its `SafeArea` at `paddingVertical={100}` (`src/templates/content/Presentation.tsx:44`) and, completely independently, positions its decorative accent line at `top: 100, bottom: 100` (`src/templates/content/Presentation.tsx:104-107`) — two literal `100`s that happen to agree today only because whoever wrote the second one copied the first by eye. There is no test suite (`find . -iname "*.test.*"` → empty) and no CI (`.github/` absent) to catch the day someone changes one `100` and not the other.

6. **The AudioTrack duck is a hard step, not a ramp**, despite the bundled `motion-designer` skill explicitly prescribing a smoothed transition ("Transition: 5 frame fade down/up" — `.agents/skills/motion-designer/rules/audio-design.md:197`); `AudioTrack.tsx:61-63` sets `vol = duckVolume` unconditionally the instant `isDucking` flips true, with no interpolation window — an audible click at every duck boundary is possible, and the skill's own worked example is not honored by the shipped code.

## D. Verdict

Ranked, most worth stealing first:

1. **The silence-detect → pad/filter → merge → derive-`Series`-durations pipeline** (`detect-silence.ts` + `editing.ts`'s `buildCutList`/`mergeSegments` + `JumpCut`) is the most genuinely load-bearing, actually-used voice-drives-visual mechanism in the repo — a clean small library for turning a raw VAD/silence signal into a stable edit decision list, with sane default thresholds (`0.1s` pad / `0.3s` min-segment / `0.3s` merge-gap / `-30dB` floor) worth borrowing wholesale if we ever need voice-activity-driven (not script-driven) cue boundaries.
2. **`createTikTokStyleCaptions()` paging + absolute-ms token-highlight** (`CaptionOverlay.tsx`) is a clean minimal reference for turning flat word timestamps into karaoke-style highlighted pages — cross-check our own onset-binding primitive's boundary semantics (`token.fromMs <= t < token.toMs`, strict upper bound) against this.
3. **The single-callback fade+duck audio envelope** (`AudioTrack.tsx`'s `volumeCallback`) is the right SHAPE (one function composing fade-in/fade-out/duck) for our `LessonBgmLayer` — but note its duck is an un-ramped step (C6); take the shape, not the hard cutover.
4. **The meta-lesson, not a mechanism**: this repo proves that bundling a skill which correctly documents `fitText`/`fillTextBox`/`calculateMetadata`/`getAudioDuration` is worthless if the app's own components never call them (C1, C2) — a sharp cautionary data point for our own skill system: a mechanism only counts as "shipped" once a code path actually exercises it, exactly the "MEASURE, DON'T ASSUME" / "the check is advisory, not blocking — but a silent skip is forbidden" discipline our CLAUDE.md already enforces more strictly than this repo enforces its own documented best practices.

### Self-check (bar audit)

1. Every mechanism cites an exact path:line — PASS. All entries in A/B cite `vendor/editor-pro-max/<path>:<line-range>` obtained via `Read`/`grep -n` (line numbers re-verified against the tool outputs above, e.g. `SafeArea.tsx:11-27`, `JumpCut.tsx:20-73`, `voiceover.md:56-91`).
2. Every mechanism includes a verbatim quote from that exact location — PASS. Each of A1–A8 and B1–B6 has a fenced code block copied verbatim (spot-checked below).
3. Both A (8 mechanisms) and B (6 mechanisms) addressed with real code/skill evidence, well over the ≥4 floor — PASS.
4. Every mechanism states a transferable lesson — PASS, one paragraph each.
5. Section C names ≥1 real weakness — PASS, 6 distinct weaknesses cited with file:line.

Spot-check of 3 citations (re-read exact lines):
- `SplitScreen.tsx:19` → confirmed `const panels = React.Children.toArray(children).slice(0, 4);` matches quote in A2.
- `AudioTrack.tsx:61-63` (`if (isDucking) { vol = duckVolume; }` region, exact lines 61-63 of the read file) → confirmed hard-step duck assignment with no interpolation, matches C6/B4.
- `.agents/skills/remotion-best-practices/rules/voiceover.md:83-85` → confirmed `return { durationInFrames: Math.ceil(sceneDurations.reduce((sum, d) => sum + d, 0)) };` matches B5 quote.

Coverage note: no fixed-length skills/ subdirectory of "layout rules" existed as a standalone doc set beyond what's cited above (`skills/` is 8 symlinks into `.agents/skills/{awwwards-animations,playwright-mcp,ffmpeg,remotion-best-practices,explainer-video-guide,animated-component-libraries,remotion-render,motion-designer}` — `ls skills`), all read or grepped; `remotion-best-practices/rules/` (33 files) and `motion-designer/rules/` (9 files) were the two directories with layout/timing/audio content and both were sampled directly (not paraphrased from README).
