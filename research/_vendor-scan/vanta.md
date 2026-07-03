# vanta — vendor scan (2026-07-03)

`vendor/vanta` @ `1923e9e` — https://github.com/itsjwill/vanta — a marketing/lead-magnet repo ("Open source video engine") that wraps 40+ *other* GitHub repos behind typed TS interfaces; almost none of the wrapped functionality is actually implemented.

## What this repo is

Vanta bills itself as a "free alternative to Adobe Creative Cloud, Synthesia, Runway ML, Descript, HeyGen, ElevenLabs, and the Remotion Pro Store" (`README.md:1-3`). In reality it is a Remotion project (`package.json`) with ~2,800 lines of TypeScript split into `src/scenes` + `src/components` (real, rendering React/Remotion code for a 15-second self-promotional showcase video) and `src/integrations/*.ts` (17 files that are almost entirely JSDoc + type declarations + a `fetch()` call to a hypothetical `localhost` server, describing what *other* npm/GitHub projects would do). Maturity signals are weak: the local clone has a single commit (`git log --oneline` → 1 line, `git rev-parse --is-shallow-repository` → `true`), there is no `.github/` CI, no test files anywhere (`find . -iname "*.test.*" -o -iname "*.spec.*"` → empty), and every integration file ends with an identical paid-community upsell link ("Join The Agentic Advantage… skool.com/ai-elite-9507"). `tsconfig.json` does set `"strict": true`, but several functions violate their own declared contracts (see Section C). Read as a whole, the repo's real deliverable is the 15-second showcase video + its supporting scene components; the "40+ integrations" are an annotated wishlist, not shipped code.

## A. Layout & overlay prevention

Coverage note up front: this repo has **no** measurement-based layout system — no `getBoundingClientRect`/text-measurement, no collision detection, no safe-area constant, no `ResizeObserver`, and no per-composition responsive scaling. Verified via `grep -rn "measureText|fitText|getBoundingClientRect|collision|overlap|bbox|safe.?[Aa]rea|Measure|ResizeObserver" src/` → zero hits, and `grep -rn "useVideoConfig|width\s*[:=]|height\s*[:=]" src/scenes/*.tsx src/components/*.tsx` → every `useVideoConfig()` call destructures only `fps`, never `width`/`height`. The four mechanisms below are the closest things to "layout discipline" that exist, and all four are informal (fixed pixel literals), not derived/measured.

### 1. Fixed lateral "safe margin" convention (paddingLeft/paddingRight)

**Where:** `vendor/vanta/src/scenes/KineticText.tsx:22-27` (also `src/scenes/DataVizScene.tsx:26` and `src/components/FeatureCards.tsx:21`)

**What it does:** Every full-bleed text scene wraps its content in an `<AbsoluteFill>` with `paddingLeft: 200, paddingRight: 200` and `justifyContent: "center"`, establishing a de-facto "safe area" so text never touches the 1920px-wide frame edge. It is applied identically (same 200px number) across three unrelated scene files, so it functions as an unwritten convention rather than a shared named constant.

**Load-bearing code:**
```tsx
<AbsoluteFill
  style={{
    justifyContent: "center",
    paddingLeft: 200,
    paddingRight: 200,
  }}
>
```

**Transferable lesson:** The *intent* (a consistent inset so text never rides the frame edge) is worth keeping, but it should be a single named export (e.g. `SAFE_MARGIN_PX`) derived from composition width, not a literal repeated verbatim in every scene file — exactly the kind of drift our own `bbox-manifest`/zone-declaration discipline is designed to prevent.

### 2. `overflow:hidden` + `clipPath: inset()` wipe-mask to contain reveal animations

**Where:** `vendor/vanta/src/scenes/KineticText.tsx:54-68` (identical pattern at `src/components/VantaLogo.tsx:84-97`)

**What it does:** Each word is wrapped in a `<div style={{overflow:"hidden"}}>` containing a `<span>` whose `clipPath` animates from `inset(0 100% 0 0)` to `inset(0 0% 0 0)` as `frame` advances. The outer `overflow:hidden` guarantees the animating inner span can never visually spill past its own box during the reveal, regardless of the interpolate() timing chosen — a cheap, GPU-friendly containment guarantee.

**Load-bearing code:**
```tsx
<div key={i} style={{ overflow: "hidden" }}>
  <span
    style={{
      display: "inline-block",
      fontSize: 96,
      fontWeight: i === 0 ? 100 : 700,
      letterSpacing: "-0.02em",
      clipPath: `inset(0 ${100 - reveal}% 0 0)`,
    }}
  >
    {word}
  </span>
</div>
```

**Transferable lesson:** Wrapping any entrance/reveal animation in an `overflow:hidden` container plus a `clipPath`-driven mask is a robust "can't overflow its own box" primitive — cheaper than measuring and clamping after the fact, and it composes well with our existing `measureProps` discipline (the clip container becomes the honest bounding box for the reveal).

### 3. Flexbox-delegated row/column composition instead of manual coordinate math

**Where:** `vendor/vanta/src/scenes/DataVizScene.tsx:52-63` (also `src/components/FeatureCards.tsx:21-23,42`)

**What it does:** Bar-chart rows and the two-column feature-card layout are built with `display:"flex"`, `gap`, `flex:1`, and `justifyContent:"space-between"` rather than absolute `x`/`y` pixel coordinates — the browser's flex algorithm resolves label-width vs. bar-width vs. percentage-label spacing, so growing a label string reflows the row instead of overlapping the bar.

**Load-bearing code:**
```tsx
<div style={{ display: "flex", alignItems: "center", marginBottom: 18, opacity: rowOpacity }}>
  <div style={{ width: 200, ... textAlign: "right", paddingRight: 24 }}>
    {item.label}
  </div>
  <div style={{ flex: 1, height: 20, background: "rgba(255,255,255,0.03)", borderRadius: 2, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${barWidth}%`, ... }} />
  </div>
  <div style={{ width: 60, textAlign: "right", ... }}>
    {Math.round(barWidth)}%
  </div>
</div>
```

**Transferable lesson:** Delegating same-row sizing to CSS flexbox (fixed label column + `flex:1` fill + fixed value column) is a legitimate "structured yet flexible" layout technique — it avoids hardcoding the *widths that depend on content length* even though the repo still hardcodes the *outer* frame margins. Worth reusing for any lesson row that mixes a fixed-width label with a variable-width bar/value.

### 4. Distance-threshold cutoff for particle connector lines

**Where:** `vendor/vanta/src/scenes/ParticleScene.tsx:51-59`

**What it does:** For each particle, the scene only draws a connecting `<line>` to its 3 nearest-index neighbors if their live (animated) Euclidean distance is `<= 280`; beyond that it returns `null` and fades the line's opacity toward 0 as distance approaches the 280 cutoff. It is the only place in the codebase where two elements' live positions are compared against each other at render time — a rudimentary "don't visually connect things that are too far apart" rule (not a true overlap/collision check, since it never test circles/text boxes for intersection).

**Load-bearing code:**
```tsx
const dist = Math.hypot(px - p2x, py - p2y);
if (dist > 280) return null;

const alpha = interpolate(dist, [0, 280], [0.12, 0], {
  extrapolateRight: "clamp",
});
```

**Transferable lesson:** This is the repo's only real "geometry-aware" runtime decision (as opposed to a static pixel literal) — the pattern of computing a live distance between two animated elements and gating a visual (opacity/existence) on a threshold is a useful building block for lightweight "fade connectors that would otherwise cross/clutter" logic, but it is not a substitute for real bbox collision detection (our `lesson:check --measured` gate is strictly more rigorous).

## B. Voice-visual coordination

### 1. Word-level timestamp schema (the ASR alignment contract)

**Where:** `vendor/vanta/src/integrations/auto-captions.ts:21-39`

**What it does:** Defines the canonical shape a transcription result must have to drive animation: a `CaptionWord{word,start,end,confidence}` (seconds), grouped into `CaptionSegment{text,start,end,words}`, wrapped in a `TranscriptionResult{segments,language,duration}`. This is the data contract every downstream caption function in the repo consumes — it is real, self-consistent TypeScript (unlike most of the file, the types themselves are usable), even though `transcribe()` itself only proxies to an assumed local Whisper server (`fetch("http://localhost:8000/transcribe", ...)`, line 51) and is never actually exercised.

**Load-bearing code:**
```ts
export interface CaptionWord {
  word: string;
  start: number; // seconds
  end: number;
  confidence: number;
}

export interface CaptionSegment {
  text: string;
  start: number;
  end: number;
  words: CaptionWord[];
}
```

**Transferable lesson:** A minimal, seconds-based `{word,start,end,confidence}` record is a clean, tool-agnostic contract for any word-level ASR output (Whisper, sherpa-onnx, etc.) — structurally compatible with what our own `asr-cue-aligner` produces per-cue; worth treating as a sanity-check schema when normalizing third-party ASR JSON.

### 2. `getActiveWordIndex` — mapping current audio time to the active caption word

**Where:** `vendor/vanta/src/integrations/animated-captions.ts:65-77`

**What it does:** Given the full `CaptionWord[]` array and the current playback time in seconds, scans for the word whose `[start,end]` window contains `currentTimeSeconds` and returns its index (or `-1` if between words). This is the single function every caption-highlighting call in the file depends on — it is the literal "voice time → visual state" bridge.

**Load-bearing code:**
```ts
export function getActiveWordIndex(
  words: CaptionWord[],
  currentTimeSeconds: number
): number {
  // Find which word should be highlighted at the current time.
  // Uses binary search for performance with long transcriptions.
  for (let i = 0; i < words.length; i++) {
    if (currentTimeSeconds >= words[i].start && currentTimeSeconds <= words[i].end) {
      return i;
    }
  }
  return -1;
}
```

**Transferable lesson:** The *shape* of the function — pure, takes an aligned word array + a time value, returns an index — is exactly the right interface for a "which token is being spoken right now" helper (comparable to our own `tokenOnsetFrame`/`stepFramesFromOnsets`). The *implementation* is not: see Section C for why the linear scan (mismatched against its own comment) would be a real bug at scale — copy the interface, not the body.

### 3. `getVisibleWords` — caption paging/windowing centered on the active word

**Where:** `vendor/vanta/src/integrations/animated-captions.ts:79-94`

**What it does:** Given the same word array + current time + a `maxWords` cap (default 8), first finds the active index via `getActiveWordIndex`, then computes a symmetric window (`halfWindow = floor(maxWords/2)`) clamped to the array bounds, and returns only that slice — i.e. captions never show the entire transcript at once, only a scrolling page of up to `maxWords` centered on what's currently being spoken.

**Load-bearing code:**
```ts
export function getVisibleWords(
  words: CaptionWord[],
  currentTimeSeconds: number,
  maxWords: number = 8
): CaptionWord[] {
  const activeIndex = getActiveWordIndex(words, currentTimeSeconds);
  if (activeIndex === -1) return [];

  const halfWindow = Math.floor(maxWords / 2);
  const start = Math.max(0, activeIndex - halfWindow);
  const end = Math.min(words.length, start + maxWords);

  return words.slice(start, end);
}
```

**Transferable lesson:** "Window size + center-on-active-index + clamp to array bounds" is a genuinely reusable caption-paging algorithm for any long-narration cue where showing the full transcript would overflow the frame — directly applicable to a keyword-caption or rolling-subtitle layer in our lesson pipeline (compare to the `pedagogy-quick-wins` FocusPointer/keyword-caption work already shipped).

### 4. `getCaptionStyleCSS` — active-word highlight styling driven by the audio-time boolean

**Where:** `vendor/vanta/src/integrations/animated-captions.ts:96-146` (excerpt below is lines 121-139)

**What it does:** Takes a `CaptionStyleConfig` (one of the named presets — `tiktok`, `karaoke`, `pop`, etc.) and an `isActive` boolean (produced by comparing the word's index against `getActiveWordIndex`'s result), and returns a CSS-properties object: active words get scaled up (`transform: scale(1.15)`), recolored to `activeColor`, and given a glow (`textShadow`); inactive words stay at the base color/scale. This is the actual "voice drives visual emphasis" wiring — narration timing decides which word is "hot," and this function turns that boolean into a style diff.

**Load-bearing code:**
```ts
const base: Record<string, string | number> = {
  fontFamily: config.fontFamily ?? "Inter, system-ui, sans-serif",
  fontSize: config.fontSize ?? 64,
  fontWeight: 800,
  display: "inline-block",
  margin: "0 6px",
  transition: "all 0.1s ease",
};

if (isActive) {
  base.color = config.activeColor ?? "#FFD700";
  base.transform = "scale(1.15)";
  if (config.shadow !== false) {
    base.textShadow = `0 0 20px ${config.activeColor ?? "#FFD700"}80`;
  }
} else {
  base.color = config.color ?? "#FFFFFF";
  base.transform = "scale(1)";
}
```
Presets are enumerated at `animated-captions.ts:151-201` (`CAPTION_PRESETS.tiktok/youtube/reels/karaoke`), each pairing a named social-media caption look with `fontSize`, `position`, `maxWordsPerLine`, and color values.

**Transferable lesson:** Separating "is this word active right now" (a pure function of audio time) from "what style does an active word get" (a pure function of a named preset config) is a clean two-stage design — worth mirroring if we ever add karaoke/word-highlight captions, keeping the audio-time logic independent of the visual preset dictionary.

### 5. `toSRT` / `formatSRTTime` — transcript segment timestamps to SRT time-coded captions

**Where:** `vendor/vanta/src/integrations/auto-captions.ts:63-79`

**What it does:** Converts a `TranscriptionResult`'s segments into the standard `.srt` subtitle format, computing `HH:MM:SS,mmm` timecodes per segment from the raw `start`/`end` seconds. Unlike almost everything else in `auto-captions.ts`, this is fully working, self-contained arithmetic (no network call, no stub) — hours/minutes/seconds/milliseconds are each derived correctly from the float-seconds input and zero-padded.

**Load-bearing code:**
```ts
function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}
```

**Transferable lesson:** A minimal, dependency-free seconds→SRT-timecode formatter is handy as a QA/export utility (e.g. exporting our own per-cue ASR alignment as an inspectable `.srt` sidecar for human review) — small enough to vendor directly rather than pull in a subtitle library.

## C. Anti-patterns & gaps

- **The documented public API doesn't exist in code.** `animated-captions.ts:12-13`'s usage docstring says `import { AnimatedCaption } from "./integrations/animated-captions"` and shows JSX usage (`<AnimatedCaption words={...} style="tiktok" .../>`), but `grep -rn "export const AnimatedCaption\|export function AnimatedCaption" src/` returns nothing — the component is never defined anywhere in the repository. Anyone following the file's own usage example gets an import error.
- **A comment claims an algorithm the code doesn't implement.** `animated-captions.ts:70` says "Uses binary search for performance with long transcriptions," but lines 71-76 are a plain `for` loop doing an O(n) linear scan. This is exactly backwards from a correctness/perf standpoint (the comment implies safety at scale that isn't there) and is a textbook case of "trust the code, not the comment."
- **`easing` is declared but silently ignored.** `motion-graphics.ts:45-53` types `EasingType` as `"linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring" | "bounce" | "elastic" | "back"`, and `AnimationConfig.easing?: EasingType` is a real field callers are meant to set — but `animateShape`'s `getPropsAtFrame` (line 110-130) only ever computes `fromVal + (toVal - fromVal) * progress`, i.e. pure linear interpolation; the `easing` value is read nowhere in the function body. Passing `easing: "spring"` produces a linear tween with no error or warning.
- **No responsive scaling with composition size, despite importing the hook that would enable it.** `Root.tsx:12-19` hardcodes every `<Composition>` to `width={1920} height={1080}`; `ParticleScene.tsx:1` imports `useVideoConfig` but only destructures `{ fps }` (line 39), then hardcodes `<svg width={1920} height={1080} viewBox="0 0 1920 1080">` (line 46) — the same `1920×1080` literal duplicated by hand instead of read from `useVideoConfig().width/height`. Re-rendering any composition at a different size (e.g. a vertical 1080×1920 export) would silently clip/misplace every particle.
- **Scene durations are frame literals with no relationship to any narration/audio measurement.** `VantaShowcase.tsx:32,47,61,75,89` hardcodes five `<Sequence from={0|90|180|270|360} durationInFrames={90}>` blocks (commented as "0-3s," "3-6s," etc. at lines 16-21) — there is no code path anywhere in the repo that derives a scene's length from a transcription's `duration` field, a voice-clone's returned audio length, or any ASR timestamp; `GeneratedTrack.duration` (`ai-music.ts:26`) and `GeneratedClip.duration` (`ai-video.ts:27`) are passed straight through from an assumed server JSON response and never consumed to size a `<Sequence>`. This is the opposite of "duration derivation from audio."
- **No music-ducking mechanism exists anywhere.** `grep -rn "duck|loudness|LUFS|volume|gain|sidechain" src/` finds exactly two hits, both just a passthrough numeric field: `timeline.ts:38` (`volume?: number; // 0-1 for audio tracks`) and its pass-through at `timeline.ts:170` (`if (clip.volume !== undefined) style.volume = clip.volume;`). Nothing ever computes or animates that value in response to narration presence — there is no ducking curve, sidechain, or ASR-derived mute/lower logic.
- **The "integrations" are largely non-functional stubs, not working code**, which caps how much of Section B/A can be trusted as proven-in-production: `booleanOperation` (`vector-graphics.ts:249-274`) literally `return pathA;` unchanged with the comment "Placeholder — real implementation uses paper.js"; `processImage`/`batchProcess` (`image-editor.ts:93-165`) return zeroed/empty results (`{width:0,height:0,size:0}`, `{processed:0,failed:0,totalSize:0}`); `removeBackground` (`background-removal.ts:35-38`) unconditionally `throw new Error("Install @imgly/background-removal to use this feature. ...")`. Combined with a repeated "Join The Agentic Advantage" paid-community link at the bottom of every single integration file's docblock, the repo reads as a lead-magnet index of other people's GitHub repos rather than a working "video engine."

## D. Verdict

Ranked by what is actually worth stealing (in descending order):

1. **The `getActiveWordIndex` → `getVisibleWords` → `getCaptionStyleCSS` pipeline shape** (`animated-captions.ts:65-146`) — three small pure functions chaining "audio time → active index → windowed word slice → per-word CSS" is a clean, reusable interface for any word-highlight/paging caption feature, even though the linear-scan body and missing `AnimatedCaption` component mean none of it should be copied verbatim — only the function signatures and the windowing algorithm in `getVisibleWords` are worth lifting directly.
2. **`overflow:hidden` + animated `clipPath: inset()` as a cheap overflow-containment primitive** (`KineticText.tsx:54-68`, `VantaLogo.tsx:84-97`) — guarantees a text reveal can never visually spill outside its own box without any measurement step; complements (does not replace) our `bbox-manifest`/`measureProps` discipline.
3. **`toSRT`/`formatSRTTime`** (`auto-captions.ts:63-79`) — the one fully-working, dependency-free utility in the repo; small enough to vendor as a QA sidecar exporter for our own per-cue ASR alignment.
4. **Negative lesson, strongly reinforcing our existing rules**: vanta is the cautionary tale for exactly the two disciplines our own CLAUDE.md already enforces — "ZERO FRAME LITERALS" (its `VantaShowcase.tsx` scene durations are hardcoded frame constants with zero connection to actual narration length) and "responsive scaling from composition config" (it imports `useVideoConfig` but hardcodes `1920×1080` in child SVGs anyway). Worth citing as a concrete "this is what drift looks like" example the next time either rule needs re-justifying to a new contributor.

Search commands run to establish exhaustion/NONE claims (all zero-hit or as noted): `grep -rn "measureText|fitText|getBoundingClientRect|collision|overlap|bbox|safe.?[Aa]rea|Measure|ResizeObserver" src/`; `grep -rn "useVideoConfig|width\s*[:=]|height\s*[:=]" src/scenes/*.tsx src/components/*.tsx`; `grep -rn "duck|loudness|LUFS|volume|gain|sidechain" src/`; `grep -rn "confidence" src/`; `grep -rn "export const AnimatedCaption|export function AnimatedCaption" src/`.
