# claude-video-kit — vendor scan (2026-07-03)

https://github.com/runesleo/claude-video-kit @ a41b174 — a `script.json`-in, `.mp4`-out pipeline for branded 1080×1920 vertical "shorts" (and horizontal slide-deck) videos: TTS (Fish Audio or local IndexTTS2) → Whisper-based caption alignment → a fixed library of Remotion slide compositions.

## What this repo is

A single-operator (`@runes_leo` / leolabs.me) content-production tool, not a general framework: brand colors, watermark text, and even a P0-mandatory outro slide are hardcoded to one creator's identity. Architecture is a 4-stage shell pipeline (`scripts/render.sh`: TTS → Whisper align → Node metadata merge → `remotion render`) driving 8 slide-type React components under `remotion/src/compositions/`. Maturity signals are modest: shallow-cloned single squashed commit in this vendor copy, CI is `tsc --noEmit` only (`.github/workflows/ci.yml`) with **no test runner, no unit tests, no snapshot tests**; the real acceptance gate is a standalone `scripts/verify-shorts.mjs` that probes the *rendered* MP4 with ffprobe/ffmpeg rather than testing components. `docs/DESIGN.md` and `docs/SHORTS_PIPELINE.md` are unusually thorough, code-derived (not aspirational) style/ops contracts — the documentation discipline is the strongest asset in the repo, arguably stronger than the code itself.

## A. Layout & overlay prevention

### A1. Preset system — canvas/font/duration resolved once, multiplied everywhere (no fixed pixel grid)

**Where:** `vendor/claude-video-kit/remotion/src/presets.ts:31-84`, consumed at `remotion/src/Root.tsx:153-162, 302-318`

**What it does:** A `Preset` (`"shorts" | "mid" | "long"`) bundles `{width, height, fps, fontScale, motionIntensity, defaultDurationFrames, maxDurationSeconds}`. `resolvePreset()` is called both inside Remotion's `calculateMetadata` (to override composition width/height/fps before render) and inside the root `Main` component (to derive one `fontScale` number threaded as a prop into every slide type). No component hardcodes 1080×1920 — every font-size literal in every slide (`52 * fontScale`, `34 * fontScale`, etc.) is a multiply against this one preset-derived scalar, so swapping `preset: "shorts"` → `"mid"` reflows every slide's typography and canvas simultaneously instead of requiring a per-component pixel rewrite.

**Load-bearing code:**
```ts
export const PRESET_CONFIG: Record<Preset, PresetConfig> = {
  shorts: {
    width: 1080,
    height: 1920,
    fps: 30,
    fontScale: 1.3,
    motionIntensity: "high",
    defaultDurationFrames: 60,
    maxDurationSeconds: 60,
  },
  mid: { width: 1920, height: 1080, fps: 30, fontScale: 1.0, motionIntensity: "medium", defaultDurationFrames: 240, maxDurationSeconds: 1200 },
  long: { width: 1920, height: 1080, fps: 30, fontScale: 0.9, motionIntensity: "low", defaultDurationFrames: 480, maxDurationSeconds: 7200 },
};
```

**Transferable lesson:** A lesson pipeline's `fontScale`/canvas-size decisions are currently per-style, ad hoc. A single `PRESET_CONFIG` resolved once in `calculateMetadata` (Remotion's own hook) and threaded as one scalar prop is a cheap, real mechanism for keeping every primitive's text size in the same coordinate space without a global CSS rewrite.

### A2. `BrandedSlideLayout` — one shared chrome frame with a fixed content-padding box, not per-slide fixed pixels

**Where:** `vendor/claude-video-kit/remotion/src/compositions/BrandedSlideLayout.tsx:60-141`

**What it does:** Every "rich" slide type (`ContentSlide`, `TableSlide`, `FormulaSlide`, `TransitionSlide`) wraps its unique content in this one layout component, which owns the outer `AbsoluteFill`, a `padding: "80px 120px"` content box, the top tri-color brand line, the bottom-left slide-counter, and the bottom-right watermark cluster — all positioned `absolute` and *outside* the flex content column so they can never be pushed around by variable-length slide content. The safe interior region for actual content is implicitly "whatever's left inside the 80/120 padding," and every child slide only lays out flex children inside that region; none of them re-declare the outer frame.

**Load-bearing code:**
```tsx
<div
  style={{
    padding: "80px 120px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transform: `scale(${enterScale})`,
    transformOrigin: "center",
  }}
>
  {children}
</div>
```

**Transferable lesson:** Fixing chrome (brand mark, counter, watermark) in one wrapper component with absolute positioning *outside* the flex content tree, then giving every slide a single shared padded flex box for its own content, is a cheap way to guarantee decoration never collides with content — the same principle the lesson pipeline's CLAUDE.md states as "decoration never inside a measured group," but implemented here structurally (physically outside the content subtree) rather than via a runtime bbox check.

### A3. CJK-character-counting text wrap with a hard 3-line cap (no DOM measurement)

**Where:** `vendor/claude-video-kit/remotion/src/compositions/CaptionsLayer.tsx:26-62`

**What it does:** `wrapText()` tokenizes a caption string into CJK-single-chars vs. atomic Latin words via regex, sums a naive `totalLen` (each CJK char = 1, each Latin word = its string length), and if under `maxCharsPerLine + 2` renders as one line. Otherwise it computes `targetLines = min(3, ceil(totalLen/maxChars))` and a `targetPerLine = ceil(totalLen/targetLines) + 2`, greedily packs tokens into lines, then hard-merges any 4th+ line back into line 3 so overflow is structurally impossible (caption box can never be more than 3 lines tall). This is a *character-count heuristic*, not actual text measurement (no canvas/DOM `measureText`, no font-metrics table) — it assumes monospaced-ish CJK glyph width.

**Load-bearing code:**
```ts
function wrapText(text: string, maxChars: number): string[] {
  const tokens = text.match(/[一-龥　-〿＀-￯]|[A-Za-z0-9]+|[^\s]/g) ?? [];
  const totalLen = tokens.reduce((s, t) => s + t.length, 0);
  if (totalLen <= maxChars + 2) return [text];
  const targetLines = Math.min(3, Math.ceil(totalLen / maxChars));
  const targetPerLine = Math.ceil(totalLen / targetLines) + 2;
  const lines: string[] = [];
  let current = "";
  for (const tok of tokens) {
    if (current.length + tok.length > targetPerLine && current.length > 0) {
      lines.push(current);
      current = tok;
    } else {
      current += tok;
    }
  }
  if (current.length > 0) lines.push(current);
  while (lines.length > 3) {
    const tail = lines.pop()!;
    lines[lines.length - 1] += tail;
  }
  return lines;
}
```
This exact rule (and its origin bug) is documented in `docs/SHORTS_PIPELINE.md:512`: `字幕被强制切 4 行 | wrap targetPerLine + 2 + 强制 merge 第 4 行回第 3 行`.

**Transferable lesson:** A hard cap on wrapped-line count with tail-merge is a cheap, deterministic overflow guard that needs zero DOM measurement — useful as a *pre-filter* before a real bbox check, but see C1 below for why char-counting alone is fragile (it is exactly the class of bug the lesson pipeline's own `measureProps`/`getBBox` law was built to avoid).

### A4. Full-bleed vs. inset padding + `maxWidth` caps as the only collision defense (constants, not measured)

**Where:** `vendor/claude-video-kit/remotion/src/compositions/CoverSlide.tsx:82-113`, `TextSlide.tsx:80-113`, `CodeSlide.tsx:14-31`, `ContentSlide.tsx:150-156`, documented centrally at `docs/DESIGN.md:127-133`

**What it does:** Every slide type declares an outer `padding` (`80px` full-bleed for Cover/Text, `60px` outer + `48px 56px` card for Code) and an inner `maxWidth` clamp on the text block (`1000` for cover title, `900`/`1000` for text-slide body, `960` for the code card, `1400` for content body) so long strings wrap inside a bounded box rather than running edge-to-edge or off-canvas. `DESIGN.md` centralizes these numbers as a contract table so a new slide type is expected to reuse one of the documented padding/maxWidth pairs rather than inventing pixel values. There is no runtime check that a given string actually fits — it's a static assumption backed only by font-size ladder discipline (§2 of DESIGN.md) and by the author eyeballing renders.

**Load-bearing code:**
```tsx
// CoverSlide.tsx
<div style={{ opacity: 1, transform: `scale(${0.96 + titleSpring * 0.04})`, textAlign: "center", color: "#fff", maxWidth: 1000 }}>
```
```md
### Page padding
- `BrandedSlideLayout`: `80px 120px` for the main content frame.
- `CoverSlide` / `TextSlide`: `80px` all around (full-bleed).
- `CodeSlide`: `60px` outer, `48px 56px` for the code card.
```

**Transferable lesson:** Centralizing every layout constant (padding, maxWidth, gap) into one markdown contract that new components are told to pull from (§7 "How AI should use this file" in DESIGN.md) is a lightweight, low-cost anti-drift mechanism for an agent-authored codebase — closer to a style-guide gate than a geometry gate, but cheap to add and directly analogous to the lesson repo's own `.agents/CAPABILITIES.md` registry pattern.

### A5. Verification is post-render, not pre-render: `verify-shorts.mjs` probes pixels/scene-changes, never DOM boxes

**Where:** `vendor/claude-video-kit/scripts/verify-shorts.mjs:30-34, 141-160`

**What it does:** After render, this script shells out to `ffprobe`/`ffmpeg` (via `spawn()` with arg arrays, explicitly **not** shell-interpolated, per the file's own safety comment at line 22-23) to assert 4 hard gates: exact canvas `1080×1920`, duration ≤60s, average scene-change interval ≤3.0s, and ≥1 scene change inside the first 2 seconds (the "hook must not be static" rule). This is the repo's only automated acceptance gate for visual output, and it checks *pixel-level scene dynamics*, not text overlap or bounding boxes — there is no analog anywhere in this repo to the lesson pipeline's `bbox-manifest.json`/`getBBox` collision detector.

**Load-bearing code:**
```js
const SHORTS_WIDTH = 1080;
const SHORTS_HEIGHT = 1920;
const MAX_DURATION_S = 60;
const MAX_AVG_SCENE_INTERVAL_S = 3.0;
const FIRST_HOOK_WINDOW_S = 2.0;
...
if (meta.width !== SHORTS_WIDTH || meta.height !== SHORTS_HEIGHT) {
  failures.push(`canvas ${meta.width}×${meta.height} ≠ ${SHORTS_WIDTH}×${SHORTS_HEIGHT}`);
}
if (avgInterval > MAX_AVG_SCENE_INTERVAL_S) {
  failures.push(`avg scene interval ${fmt(avgInterval)}s > ${MAX_AVG_SCENE_INTERVAL_S}s (too static)`);
}
```

**Transferable lesson:** A cheap ffprobe/ffmpeg-based "objective gate on the rendered artifact" (canvas dims, duration cap, motion-density heuristics) is a useful *cheap pre-filter* class distinct from bbox collision — worth having as a fast sanity check that runs before the expensive `--measured` pass, catching gross regressions (wrong canvas, frozen video) that a manifest-based check wouldn't catch.

## B. Voice-visual coordination

### B1. Per-slide WAV duration measured via `ffprobe`, drives `durationInFrames` directly (not estimated from text)

**Where:** `vendor/claude-video-kit/scripts/build-metadata.mjs:18-38, 57-77`

**What it does:** `build-metadata.mjs` is the mechanical join point between generated audio and the Remotion composition: for each slide it runs `ffprobe -show_entries format=duration` against `workspace/<NN>.wav`, converts to frames at the script's `fps`, and sets `durationInFrames = Math.ceil(seconds * fps) + BUFFER_FRAMES` (a fixed 15-frame / 0.5s pad "so audio doesn't clip"), with a `MIN_FRAMES = 45` floor for slides with no wav. The file's own comment records a prior bug: hand-parsing WAV header bytes 28/40 broke when TTS/ffmpeg inserted extra `LIST`/`INFO` chunks before `data`, silently reading a metadata-chunk length instead of the real duration and producing nonsense like 0.5s for a 5s clip — this is exactly the class of "MEASURE, DON'T ASSUME" bug the lesson pipeline's CLAUDE.md warns about, and the fix (ffprobe, not manual header parsing) is the correct one.

**Load-bearing code:**
```js
function wavDurationSeconds(wavPath) {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${wavPath}"`,
    { encoding: "utf8" }
  );
  const seconds = parseFloat(out.trim());
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`ffprobe returned invalid duration for ${wavPath}: ${out}`);
  }
  return seconds;
}
...
const BUFFER_FRAMES = 15; // ~0.5s pad so audio doesn't clip
const MIN_FRAMES = 45;
...
if (fs.existsSync(wav)) {
  const seconds = wavDurationSeconds(wav);
  durationInFrames = Math.ceil(seconds * fps) + BUFFER_FRAMES;
  audio = `${idx}.wav`;
}
```

**Transferable lesson:** `ffprobe`-measured WAV duration → `Math.ceil(seconds*fps) + fixed tail pad` is the exact same "cueFrames = measured-audio + tail" shape the lesson pipeline's Wave 3.5 reconcile already implements (`max(narrationFrames+gap, motionFrames) + tail`), and this repo's documented header-parsing failure mode is a concrete cautionary data point for why the lesson pipeline should keep using `ffprobe`/ASR-measured durations and never hand-parse audio containers.

### B2. Sequence-chaining from measured per-slide durations (audio ⟷ visuals share one clock, no separate timeline)

**Where:** `vendor/claude-video-kit/remotion/src/Root.tsx:163-179, 289-290, 302-318`

**What it does:** `Main` walks `meta.slides` accumulating a running `offset`, mounting each slide (and its `<Audio src={staticFile(slide.audio)}>`) inside a `<Sequence from={from} durationInFrames={slide.durationInFrames}>` where `from` is the cumulative sum of every prior slide's `durationInFrames`. The audio tag lives *inside the same Sequence* as the slide's visuals and captions, so audio, visual, and caption for a given slide share one Remotion `Sequence` boundary by construction — there is structurally no way for slide N's audio to play under slide N+1's visuals. `calculateMetadata` (`Root.tsx:302-318`) computes the composition's total `durationInFrames` as `calcDuration(meta) = sum(slide.durationInFrames)`, so the overall video length is *derived*, never hardcoded.

**Load-bearing code:**
```tsx
let offset = 0;
{meta.slides.map((slide, i) => {
  const from = offset;
  offset += slide.durationInFrames;
  return (
    <Sequence key={i} from={from} durationInFrames={slide.durationInFrames}>
      {slide.audio ? <Audio src={staticFile(slide.audio)} /> : null}
      {/* ...slide type + CaptionsLayer, all inside this Sequence... */}
    </Sequence>
  );
})}
```
```tsx
calculateMetadata={({ props }) => {
  ...
  return { durationInFrames: calcDuration(meta), fps: resolved.fps, width: resolved.width, height: resolved.height, props: meta };
}}
```

**Transferable lesson:** This is the same "cue is the unit of coordination" invariant the lesson pipeline's CLAUDE.md mandates (each cue owns one `<Sequence from={cue.startFrame}>` with its own audio clip, so audio can never cross a cue boundary) — direct architectural convergence, and evidence the pattern is a genuinely load-bearing one worth keeping, not idiosyncratic to the lesson repo.

### B3. Hybrid Whisper-timing + script-text caption alignment (word timestamps for TIME, authored text for CONTENT)

**Where:** `vendor/claude-video-kit/scripts/align.py:112-186, 240-250`

**What it does:** `captions_from_script_whisper_aligned()` is the production path (selected whenever `script.json` has `voice_text`/`caption_text` and `--legacy-char-ratio` isn't passed): it runs `faster_whisper` with `word_timestamps=True` against the *rendered* WAV to build a per-character cumulative-end-time array (`whisper_char_times`, one entry per character, built by uniformly distributing each Whisper word's `[start,end]` across its own character count), then linearly maps each authored `voice_text` chunk's character-offset range onto that Whisper-timed character array (`start_whisper = int(start_voice * whisper_total / voice_total)`) to read out real start/end times. This is explicitly a hybrid: Whisper supplies *measured* timing, the original `voice_text` supplies the *displayed text* (so Whisper's transcription errors on short Chinese phrases — flagged as a known pitfall in `SHORTS_PIPELINE.md` pitfall #2 — never leak into the caption text itself). A pure char-ratio fallback (`captions_from_script`, line 85-109) exists for when Whisper produces no words, and is documented as inaccurate for mixed CN/EN text (pitfall #14 in SHORTS_PIPELINE.md, which is the exact reason this hybrid function was introduced).

**Load-bearing code:**
```python
def captions_from_script_whisper_aligned(text, wav_path, fps, model, t2s=None):
    segments, _ = model.transcribe(str(wav_path), word_timestamps=True, vad_filter=False,
                                    language="zh", initial_prompt="以下是简体中文的内容。")
    whisper_char_times = []
    for seg in segments:
        for word in seg.words or []:
            wt = word.word.strip()
            n = len(wt)
            if n == 0: continue
            t_start, t_end = word.start, word.end
            for k in range(n):
                whisper_char_times.append(t_start + (t_end - t_start) * (k + 1) / n)
    pieces = split_by_punct(text)
    voice_total = sum(len(p) for p in pieces) or 1
    whisper_total = len(whisper_char_times)
    for piece in pieces:
        start_whisper = int(start_voice * whisper_total / voice_total)
        end_whisper = int(end_voice * whisper_total / voice_total)
        start_time = 0.0 if start_whisper == 0 else whisper_char_times[start_whisper - 1]
        end_time = whisper_char_times[end_whisper]
```

**Transferable lesson:** "ASR gives timing, authored script gives text" is directly reusable when a lesson's ASR pass mis-transcribes proper nouns/pinyin — instead of trusting ASR's *text*, map the *known-correct* script text onto ASR's *measured* per-word/char timeline via linear character-position interpolation. Weaker than true per-word onset binding (see C2) but a cheap fallback when word-level onset-to-script alignment (e.g. DTW) isn't available.

### B4. Sentence-boundary punctuation split with a domain/decimal-dot guard (regex lookaround)

**Where:** `vendor/claude-video-kit/scripts/align.py:73-82`

**What it does:** `split_by_punct()` splits caption text into caption-chunk candidates on CJK/Latin sentence punctuation, but the regex specifically excludes a `.` that sits between two word/digit characters, so numeric decimals (`9.11`, `9.9`) and domain names (`leolabs.me`) survive as one token instead of being torn into `"9"`, `"11"` — a bug documented as having actually happened and fixed in production (`SHORTS_PIPELINE.md:517`, pitfall #15).

**Load-bearing code:**
```python
def split_by_punct(text: str):
    import re
    # Split on Chinese/English sentence punctuation, but DON'T split on:
    #   - "." between digits (e.g. 9.11, 9.9 — domain decimals)
    #   - "." between letters (e.g. leolabs.me, U.S. — domain dots, abbrevs)
    pattern = r"[，,。！!？?；;]|(?<![\w\d])\.|\.(?![\w\d])"
    parts = re.split(pattern, text)
    return [p.strip() for p in parts if p and p.strip()]
```

**Transferable lesson:** Any caption/cue splitter that tokenizes on punctuation for a bilingual (CJK+Latin) or numeral-bearing script needs an explicit decimal/domain-dot guard; this exact regex (`(?<![\w\d])\.|\.(?![\w\d])`) is a drop-in fix for the same failure mode if the lesson pipeline's ASR-alignment tooling ever free-splits on `.`.

### B5. Per-caption spring "pop-in" keyed to that caption's own start frame, not the slide's

**Where:** `vendor/claude-video-kit/remotion/src/compositions/CaptionsLayer.tsx:108-133`

**What it does:** `CaptionsLayer` finds the single active caption whose `[from, to)` frame range contains `useCurrentFrame()`, then computes `spring({ frame: frame - active.from, fps, config: { damping: 8, stiffness: 180, mass: 0.4 } })` — i.e. the spring's local clock is re-zeroed at *that caption's own* start frame every time the active caption changes, producing a fresh bouncy scale/translate/opacity entrance (documented in `SHORTS_PIPELINE.md:250` as the "蹦" — bounce — effect, chosen over plain fade for punchier retention) each time captions switch mid-slide, not just once per slide mount.

**Load-bearing code:**
```tsx
const active = captions.find((c) => frame >= c.from && frame < c.to);
if (!active) return null;
const lines = wrapText(active.text, maxCharsPerLine);
const captionSpring = spring({
  frame: frame - active.from,
  fps,
  config: { damping: 8, stiffness: 180, mass: 0.4 },
});
```

**Transferable lesson:** Re-zeroing a spring's local frame at each caption/cue's own boundary (rather than the enclosing Sequence's frame 0) is the correct pattern for per-cue-relative animation inside a slide that hosts multiple captions — same "every frame derives from `cues[id].startFrame + offset`" discipline the lesson repo already enforces, confirming it independently in a different codebase.

### B6. `NumberTicker` count-up bound to `startFrame`/`durationFrames` props threaded from caller (not global elapsed time)

**Where:** `vendor/claude-video-kit/remotion/src/compositions/NumberTicker.tsx:49-98`, called with staggered offsets from `TableSlide.tsx:110-115, 149-150` and `NumberHero.tsx:57-58, 161-162`

**What it does:** Each `NumberTicker` instance receives its own `startFrame` (absolute-within-Sequence, computed by the caller from a per-row stagger like `rowStart = 30 + i * 12`) and rolls `value * easeOutCubic(progress)` where `progress = interpolate(frame, [startFrame, startFrame+durationFrames], [0,1], {clamp})`. This isn't audio-driven timing, but it is the same "compute each element's local animation window from a caller-supplied frame offset, never a hardcoded literal inside the primitive" discipline — the number-rolling animation's start is parameterized per call site, letting `TableSlide` stagger 12 frames/row and `NumberHero` start at a fixed `countUpStartFrame=8` independently, from the same reusable primitive.

**Load-bearing code:**
```tsx
const progress = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const eased = 1 - Math.pow(1 - progress, 3);
const current = value * eased;
```
```tsx
// TableSlide.tsx — per-row stagger computed by the caller, not the primitive
const rowStart = 30 + i * 12;
...
<NumberTicker ... startFrame={rowStart + 8} durationFrames={30} ... />
```

**Transferable lesson:** A reusable "roll a number" primitive that takes `startFrame`/`durationFrames` as props (rather than reading `useCurrentFrame()` directly against slide-mount time) is the right shape for a shared primitive whose call sites need independent stagger — matches the lesson repo's "every frame derives from `cues[id].startFrame + offset`" law, worth citing as convergent evidence from an unrelated codebase.

### B7. Music/BGM ducking — designed with concrete ffmpeg sidechain params, but NOT wired into the render pipeline (design doc only)

**Where:** `vendor/claude-video-kit/docs/bgm-library-and-mux-flow.md:273-341`; absence confirmed against `vendor/claude-video-kit/scripts/render.sh:1-48` (4 stages: TTS → Whisper align → metadata → Remotion render — no mux stage) and `remotion/src/Root.tsx` (single `<Audio>` per slide, no BGM track/props)

**What it does:** The doc specifies (but the repo does not implement) a 6-step ffmpeg mux chain that would run between "build metadata" and "Remotion render": concat all voice WAVs → read a `bgm` cue array from `script.json` (`{from_slide, to_slide, id, mode}`) → trim/loop the matched BGM category clip → pre-normalize BGM to `loudnorm=I=-26:TP=-3:LRA=8` (12 LU below the -14 LUFS voice target) → `sidechaincompress` keyed on voice (`threshold=0.05:ratio=8:attack=20:release=250`) to duck BGM −8dB under narration → `amix` voice:BGM at weights `1:0.6` → a second `loudnorm=I=-14:TP=-1.5:LRA=11` pass because summing raises peaks 1-3dB. The doc's own §4 explicitly lists this as unimplemented: "本文档只定了 schema 占位，**没改代码**" (this doc only defines the schema placeholder — no code changed).

**Load-bearing code:**
```md
| F | 侧链 ducking | `[voice][bgm]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=250` |
| G | 主混音 | `[voice][bgm_ducked]amix=inputs=2:duration=longest:weights=1 0.6` |
| H | 整体二次归一 | `loudnorm=I=-14:TP=-1.5:LRA=11`（与 voice-only 链路对齐） |
```
```md
2. `script.json` bgm 字段 + render.sh 第 [3.5/4] mux 阶段实装
   本文档只定了 schema 占位，**没改代码**。
```

**Transferable lesson:** Even unimplemented, the concrete numbers are a usable reference for a lesson pipeline's own BGM-ducking mechanism (sidechain threshold/ratio/attack/release, the 12 LU voice/bed gap, the double-loudnorm-pass rationale for post-mix peak inflation) — cite it as a *numbers reference*, not as proof of a working mechanism; flag any claim that this repo "does" audio ducking as false (see C4).

## C. Anti-patterns & gaps

- **C1. No real text measurement anywhere — every overflow guard is a hardcoded constant or a character-count heuristic, never `getBBox`/`measureText`/`ResizeObserver`.** Exhaustive grep across the whole repo: `grep -rn "fitText|measureText|getBoundingClientRect|collision|safeArea|ResizeObserver" remotion/src/ scripts/` returned zero matches for any of those terms; the only hits for "clamp/maxWidth/overflow" were Remotion's own `interpolate(..., {extrapolateLeft:"clamp"})` calls (timing clamps, not layout clamps) plus a handful of `maxWidth: <literal>` CSS props (`CoverSlide.tsx:112`, `TextSlide.tsx:112`, `CodeSlide.tsx:29`, `ContentSlide.tsx:156`) and one `overflow: "hidden"` on the table card (`TableSlide.tsx:81`). `CaptionsLayer.wrapText()` (A3) assumes every CJK character occupies one uniform width unit and every Latin token is atomic — there is no fallback if a caption's rendered width still exceeds the frame at 3 lines (e.g., a very long untranslatable proper noun): text would simply overflow past `left:60/right:60` with no clamp on font-size or further line-count. This is architecturally weaker than the lesson pipeline's own `bboxAt(frame)` + `getBBox()` measured-collision gate.
- **C2. Caption timing is char-ratio math (even in the "hybrid" path), never true per-token onset binding.** `captions_from_script_whisper_aligned` (B3) *approximates* time-per-character by linearly distributing each Whisper word's `[start,end]` uniformly across its own character count, then linearly re-maps `voice_text` character offsets onto that array — two layers of linear-interpolation assumption stacked (uniform intra-word char timing, then uniform voice-text↔whisper-text character-position correspondence). This is fundamentally the same class of imprecision the lesson pipeline's CLAUDE.md explicitly forbids for "spoken enumeration" (`SPOKEN ENUMERATION BINDS TO TOKEN ONSETS, never a step constant`) — align.py has no equivalent of `tokenOnsetFrame`/`stepFramesFromOnsets` per real ASR-measured token; it is the "fixed cadence" anti-pattern's audio-alignment analog.
- **C3. `docs/SHORTS_PIPELINE.md:540` self-admits an unsolved drift problem: "字幕语速漂移补偿（IndexTTS2 不同 slide 语速 3.2-5.6 char/s 差异，目前接受）"** — i.e., different slides' narration speech-rate varies 3.2–5.6 characters/second under the same TTS voice, and the repo's own roadmap ("What's not in Phase 1") explicitly accepts this drift rather than compensating for it. Any downstream caption-pacing assumption (e.g. per-line minimum on-screen duration) that assumes a fixed chars/second rate would be wrong by up to ~75% slide-to-slide.
- **C4. The BGM-ducking mechanism (B7) is design-only vapor, not shipped code — a real risk if cited uncritically.** `docs/bgm-library-and-mux-flow.md` reads as a fully-specified implementation (mermaid pipeline, exact ffmpeg filter strings, a volume-normalization table) but `render.sh` has exactly 4 stages and no mux step, `Root.tsx`'s `Main` component mounts exactly one `<Audio>` per `<Sequence>` with no second BGM track prop, and the doc's own §4 lists "real tracks not yet licensed/downloaded" and "script.json bgm field + mux stage not yet implemented" as open blockers. A careless read of this repo would over-credit it with working audio ducking.
- **C5. No automated visual-regression or component test exists** — CI (`.github/workflows/ci.yml`) runs only `npx tsc --noEmit`; the only gate that touches rendered pixels is `verify-shorts.mjs`, which checks canvas size/duration/scene-change cadence, not text legibility, contrast, or overlap. A slide type could render badly (clipped text, colliding watermark) and pass CI cleanly.
- **C6. Pre-render human review is a documented convention, not a gate the code enforces** (`docs/pre-render-review.md`) — "hand the script.json to a second model" is process discipline living entirely in prose; nothing in `render.sh` or any script requires or checks that this happened before rendering.

## D. Verdict

Most worth stealing, ranked:

1. **Cue/Sequence-as-the-unit-of-audio-truth (B2)** — measured WAV duration (via `ffprobe`, not header-parsing) directly sets `durationInFrames`, and audio+visuals+captions for one slide share one `<Sequence>` boundary by construction. This independently converges on the lesson pipeline's own v4 cue-anchored-audio architecture — strong validating evidence the pattern is right, not idiosyncratic.
2. **Whisper-measured-timing + authored-text-for-content caption hybrid (B3)**, plus its decimal/domain-dot punctuation-split guard (B4) — directly reusable if the lesson pipeline's ASR pass ever mis-transcribes proper nouns/pinyin: trust ASR's timing, never its text.
3. **A markdown "layout contract" that's mechanically kept in sync with code** (`DESIGN.md`, self-described as "descriptive, not aspirational… grepped out of the actual code") — a cheap anti-drift device for an agent-authored component library, structurally similar to (and validating) the lesson repo's `.agents/CAPABILITIES.md` registry idea.
4. **Post-render ffprobe/ffmpeg acceptance gate as a fast pre-filter (A5)** (canvas size, duration cap, scene-change density) — worth having as a cheap sanity check ahead of the expensive `--measured` bbox pass, though it is not a substitute for real collision detection (C1/C5 show this repo has no such substitute either).

Weakest area, worth *avoiding*: this repo's entire layout-overlap defense is hardcoded constants + character counting, never real measurement — confirms rather than undermines the lesson pipeline's own `getBBox`-based measured-collision law is the harder, more correct approach.
