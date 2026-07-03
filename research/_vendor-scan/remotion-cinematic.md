# remotion-cinematic — vendor scan (2026-07-03)

`vendor/remotion-cinematic` @ 18dbb50ce797b778f0867a5dd7bac82b5ce105ac — Origin: https://github.com/codeverbojan/remotion-cinematic — a Remotion template for cinematic SaaS/product-demo videos (fake desktop windows, cursor-driven UI walkthroughs, headline cards) built around a declarative "smart motion engine."

## What this repo is

A single-purpose Remotion **template** (not a general video toolkit): one composition (`CinematicDemo`), five fixed scenes (`chaos`, `product-reveal`, `feature-showcase`, `headline-resolution`, `closer`), all window positions/cursor paths/camera keyframes/audio cues driven by a Zod-validated `CinematicProps` schema so Remotion Studio can edit them live. Its distinguishing architectural bet is the `src/engine/` layer: `layout` (zone-based auto-placement, unused by current scenes but present and tested), `choreography` (pure-function prop→pose resolvers), `camera`, `cursor`, `audio`, `ui-state` — every one of these consumes a shared `SceneTiming[]` array so cross-domain timing (camera moves, audio cues, scene entrances) can never drift apart. Maturity signals: MIT-licensed, single-author side project (built by Bojan Josifoski for his own product SampleHQ), 34 test files (mostly small, focused Vitest unit tests on pure functions: `zones.test.ts`, `resolveCues.test.ts`, `resolveWindowPose.test.ts`, `resolveTimeline.test.ts`), a GitHub Actions CI workflow (`.github/workflows/ci.yml`), `tsc --noEmit` gate. There is genuinely **no TTS/ASR/narration/caption system anywhere** in the source (verified below) — the "voice" side of this repo's audio story is entirely SFX/music, not spoken narration.

## A. Layout & overlay prevention

### A1. Zone-based layout engine with reserved-zone avoidance (push-down + clamp)

**Where:** `vendor/remotion-cinematic/src/engine/layout/zones.ts:38-140`

**What it does:** `defineZones(config)` builds a `ZoneSystem` from declared `slots` (named placement regions) and `reserved` zones (regions no window should cover, e.g. a headline). `placeWindow()` fits the requested `width`/`height` inside the slot (shrinking to `slot.region.w/h - margin*2` if too big), aligns it per `align.horizontal/vertical` (`start`/`center`/`end`), then for every rect in `avoidRects` checks `rectsOverlap` and — if it overlaps — pushes the candidate below the avoided rect (`avoid.y + avoid.h + margin`) or to its right, falling back to "push down" if neither fits. The final rect is always `clamp`ed back inside the slot bounds so a window can never escape its zone even after the avoidance push. `defineZones` itself throws at construction time if any slot or reserved zone's coordinates exceed the canvas (`zones.ts:107-119`), so an out-of-bounds layout is a hard authoring error, not a silent bug.

**Load-bearing code:**
```ts
for (const avoid of avoidRects) {
  const candidate: Rect = { x: left, y: top, w: fitW, h: fitH };
  if (rectsOverlap(candidate, avoid)) {
    if (avoid.y + avoid.h + margin + fitH <= slotBottom) {
      top = avoid.y + avoid.h + margin;
    } else if (avoid.x + avoid.w + margin + fitW <= slotRight) {
      left = avoid.x + avoid.w + margin;
    } else {
      top = avoid.y + avoid.h + margin;
    }
  }
}
left = clamp(left, slot.region.x + margin, Math.max(slot.region.x + margin, slotRight - fitW - margin));
top = clamp(top, slot.region.y + margin, Math.max(slot.region.y + margin, slotBottom - fitH - margin));
```
(exact excerpt, `zones.ts:77-91`)

**Transferable lesson:** For a lesson pipeline with load-bearing visual elements (teaching marks) and decoration, this is a working prototype of exactly the "collision handling" the project's own bbox-manifest gate wants to *detect* — here it's used to *prevent* collisions proactively at placement time via named avoid-zones + push-then-clamp, rather than measuring after the fact. Worth stealing the pattern (not the code): declare reserved "no-go" regions (captions safe-area, headline zone) once, and have every dynamically-placed element avoid them by construction instead of relying purely on a post-hoc bbox check.

### A2. Pure prop→pose resolver decoupled from any DOM/runtime state (`resolveWindowPose`)

**Where:** `vendor/remotion-cinematic/src/engine/choreography/resolveWindowPose.ts:40-94`

**What it does:** Given a declarative `WindowLayout` (start/end X/Y/W/H, `enterAt`/`enterDuration`/`enterFrom`, `animateAt`/`animateDuration`, `exitAt`/`exitDuration`) and a raw `frame` number, `resolveWindowPose` is a pure function returning `{left, top, width, height, opacity, scale, translateX, translateY, visible}` for that exact frame — no React state, no refs, no side effects. It early-returns a shared `HIDDEN` constant before `enterAt` or after `exitAt + exitDuration` (`:41-45`), computes an `easeOut` cubic for both the position/size animation window (`animStart`/`animEnd`, clamped via `Math.max(1, ...)` to avoid a zero-length division) and the entrance easing, and only lets scene code position an element as `left: pose.left, top: pose.top` etc. There is deliberately no absolute-frame literal anywhere in a *scene* — every scene calls this same function with `useCurrentFrame()` and the same declarative `WindowLayout` array.

**Load-bearing code:**
```ts
  if (frame < def.enterAt) return HIDDEN;

  if (def.exitAt !== undefined && frame >= def.exitAt + def.exitDuration) {
    return HIDDEN;
  }

  let x = def.startX;
  let y = def.startY;
  let w = def.startW;
  let h = def.startH;

  if (def.endX !== undefined || def.endY !== undefined || def.endW !== undefined || def.endH !== undefined) {
```
(exact excerpt, `resolveWindowPose.ts:41-52`)

**Transferable lesson:** This is the same discipline the project's CLAUDE.md already mandates ("ZERO FRAME LITERALS ... every frame derives from `cues[id].startFrame + offset`") — direct external validation that a pure `pose = resolveX(def, frame)` function, fed by a declarative per-element schedule and the current frame, is the right shape for "structured but flexible" layout: structure comes from the schema (`WindowLayout`), flexibility comes from every field being independently Studio/human-editable, and correctness comes from the function being unit-testable in total isolation from Remotion's render loop (see `resolveWindowPose.test.ts`).

### A3. Zod schema bounds as the "safe area" — validation at the prop boundary, not runtime measurement

**Where:** `vendor/remotion-cinematic/src/schema.ts:30-91`

**What it does:** Every layout-affecting numeric or string field is bounded directly in the Zod schema that Remotion Studio renders as editable controls: headline font sizes clamp to `[8, 400]`, scene duration to `[30, 900]` frames, window `rotation` to `[-180, 180]`, headline/window title strings to `.max(200)`, brand name/font names to `.max(100)`, sidebar width to `[100, 400]`. Because `DEFAULT_WINDOW_LAYOUT`/`DEFAULT_CURSOR_PATH` are themselves built via `z.array(...).parse([...])` (`schema.ts:122`, `:238`), even the shipped defaults are forced through the same validation as user edits — there is no code path that bypasses the bound. This is a "safe area" implemented as an input contract rather than a spatial region: it prevents pathological values (a 4000px rotation, a 10,000-frame scene) from ever reaching the layout/animation code, rather than clamping their visual consequences after the fact.

**Load-bearing code:**
```ts
const HeadlinesSchema = z.object({
  pain: z.array(z.string().max(200)).default(["Where did that", "request go?"]),
  painFontSize: z.number().int().min(8).max(400).optional(),
  ...
});
const SceneConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  durationInFrames: z.number().int().min(30).max(900),
  ...
});
const WindowLayoutSchema = z.object({
  ...
  rotation: z.number().min(-180).max(180).optional(),
  title: z.string().max(200).default("Window"),
  ...
});
```
(excerpt, `schema.ts:30-36, 50-53, 88-89`)

**Transferable lesson:** A lesson pipeline that generates props/config programmatically (pedagogy → storyboard → composer) could apply the same idea at the *authoring* boundary: bound narration string length, cue duration, and font-size fields in whatever schema feeds the composer, so a runaway LLM-generated value (a 1000-character caption, a negative duration) is rejected at parse time instead of silently overflowing a box at render time. This is a cheap first line of defense that composes with (does not replace) the project's own measured-bbox gate.

### A4. Studio-preview scale-factor correction for pixel-accurate drag/resize

**Where:** `vendor/remotion-cinematic/src/editor/EditorOverlay.tsx:39-41, 78-82, 181-183`

**What it does:** The visual editor (Studio-only, gated by `getRemotionEnvironment().isStudio`) lets a human drag/resize windows directly in the preview. Because the Remotion Studio preview pane renders the 1920×1080 composition scaled down to fit the browser window, a raw `clientX`/`clientY` mouse delta is in *screen* pixels, not *canvas* pixels. `getScaleFactor()` measures the actual rendered width of the composition container via `getBoundingClientRect().width` and divides by the logical `CANVAS_W = 1920` to get the live scale factor; every mouse-move handler then divides `dx`/`dy` by that factor before writing back to `startX`/`startY`/`startW`/`startH` props. This is the one place in the repo that does real DOM measurement (`getBoundingClientRect`) to reconcile "what the browser rendered" with "what the composition's logical coordinate space says," and it recomputes on every drag frame rather than caching a stale ratio.

**Load-bearing code:**
```ts
const CANVAS_W = 1920;
const CANVAS_H = 1080;
...
const getScaleFactor = useCallback(() => {
  const container = containerRef.current;
  if (!container) return 1;
  return container.getBoundingClientRect().width / CANVAS_W;
}, [containerRef]);
...
const scale = getScaleFactor();
const dx = (e.clientX - drag.startMouseX) / scale;
const dy = (e.clientY - drag.startMouseY) / scale;
```
(excerpt, `EditorOverlay.tsx:39-40, 78-82, 181-183`)

**Transferable lesson:** Any authoring/QA tool that overlays interactive controls on top of a Remotion preview (e.g. an interactive bbox-overlay editor, a manual cue-boundary scrubber) needs this exact correction — never assume `clientX`/`clientY` deltas map 1:1 to composition pixels; always divide by `renderedWidth / logicalWidth` measured live via `getBoundingClientRect`, because Studio's zoom level is not fixed and the lesson pipeline's own `lesson:bbox` overlay tool would need the same correction if it ever becomes interactive rather than a static PNG dump.

### A5. Alignment snap guides with a fixed pixel threshold (edge/center matching)

**Where:** `vendor/remotion-cinematic/src/editor/SnapGuides.tsx:1-87`

**What it does:** `computeSnapGuides(box, others, canvasW, canvasH)` builds two candidate-line arrays — one x-axis, one y-axis — seeded with the canvas center plus every other window's left/center/right (and top/center/bottom) edges, then keeps only the candidates within `SNAP_THRESHOLD = 6` px of the dragged box's own edges/center. `applySnap` then nudges the box's `x`/`y` by the smallest matching delta so the dragged edge lands exactly on the guide line (not just "close enough"). Both functions are pure and exported specifically for unit testing (confirmed independent of the `<SnapGuides>` render component, which just draws red 1px lines at the matched coordinates converted to `%` of canvas).

**Load-bearing code:**
```ts
const SNAP_THRESHOLD = 6;
...
for (const cx of xCandidates) {
  for (const bx of boxEdgesX) {
    if (Math.abs(bx - cx) <= SNAP_THRESHOLD) {
      matchedX.push(cx);
      break;
    }
  }
}
```
(excerpt, `SnapGuides.tsx:4, 38-45`)

**Transferable lesson:** A concrete, tested "how close counts as aligned" number (6px at 1920-wide canvas, i.e. ~0.3% of width) for any tool that helps a human or agent align elements by eye — useful precedent for setting a similar tolerance in the lesson pipeline's own bbox-overlay review workflow if it ever grows an interactive "snap this teaching mark to that one" affordance.

## B. Voice-visual coordination

This repo has **no TTS/ASR/narration/caption system** — confirmed by exhaustive search (see `## C` for the exact commands). Its actual "voice" is background music + SFX, and the mechanisms below are how it keeps *that* audio locked to the visuals; they're documented here as the closest real analogue to "voice-visual coordination" this repo offers.

### B1. Single scene-timing source of truth shared by camera, audio, and scene mounting

**Where:** `vendor/remotion-cinematic/src/engine/types.ts:29-40` (resolver), consumed at `vendor/remotion-cinematic/src/CinematicDemo.tsx:71`, `vendor/remotion-cinematic/src/engine/camera/resolveTimeline.ts:5-38`, `vendor/remotion-cinematic/src/engine/audio/resolveCues.ts:5-26`

**What it does:** `getSceneStartFrame(scenes, sceneId, overlap)` walks the `SceneTiming[]` array (`{id, durationInFrames}[]`) once, subtracting `overlap` per transition, and returns the absolute frame a given scene starts at. This exact function is called from three independent places that must never drift relative to each other: `CinematicDemo.tsx` uses it to place each scene's own `<Sequence from={...}>`; `camera/resolveTimeline.ts` uses it to convert a `CameraKeyframe{scene, at: "start"|"end"|number}` into an absolute frame; `audio/resolveCues.ts` uses it to convert an `AudioCue{scene, at}` into an absolute frame. Because all three consume the identical function and the identical `scenes`/`overlap` values (passed down from the same `enabledScenes` computed once in `CinematicDemo.tsx:29-34`), a camera move, an SFX cue, and the scene's own mount frame are structurally incapable of disagreeing about "when does the `feature-showcase` scene begin."

**Load-bearing code:**
```ts
export function getSceneStartFrame(
  scenes: SceneTiming[],
  sceneId: string,
  overlap: number = 0,
): number {
  let frame = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].id === sceneId) return frame;
    frame += scenes[i].durationInFrames - overlap;
  }
  return -1;
}
```
(exact excerpt, `types.ts:29-40`)

**Transferable lesson:** This is the exact architectural shape the project's own "cue is the unit of coordination" rule wants — one resolver function, called by every subsystem that needs to place something relative to a named unit of time, instead of each subsystem (camera/audio/captions) re-deriving or hardcoding an offset. Confirms the project's existing discipline is sound and gives a second independent precedent for it (reduce-with-early-return over an ordered array, one function, multiple identical callers).

### B2. Three-stage music envelope: fade-in/out plus ramped ducking ranges

**Where:** `vendor/remotion-cinematic/src/engine/audio/resolveCues.ts:28-65`, wired at `vendor/remotion-cinematic/src/engine/audio/AudioManager.tsx:33-37`

**What it does:** `computeMusicVolume(frame, totalFrames, baseVolume, fadeInFrames, fadeOutFrames, duckingRanges)` layers three independent volume effects into one scalar per frame: a linear fade-in over the first `fadeInFrames`, a linear fade-out over the last `fadeOutFrames`, and — for any `DuckingRange{startFrame, endFrame, duckedVolume}` whose window (expanded by an 8-frame ramp on each side, `DUCK_RAMP = 8`) contains the current frame — a `Math.min(vol, target)` clamp toward `duckedVolume` that itself linearly ramps in/out over those 8 frames rather than snapping. `AudioManager` passes this as a `volume` **callback** to Remotion's `<Audio>` (not a static number), so Remotion re-evaluates it every frame; ducking windows are supplied by the composition (`CinematicDemo.tsx:83-86`: two ranges, `{150,260,0.12}` and `{565,685,0.12}`) covering exactly the scenes with UI-narration-equivalent action (feature callouts), i.e. the ducking windows are scene-timing-derived, tying back into B1.

**Load-bearing code:**
```ts
const DUCK_RAMP = 8;
for (const range of duckingRanges) {
  if (frame >= range.startFrame - DUCK_RAMP && frame <= range.endFrame + DUCK_RAMP) {
    let target = range.duckedVolume;
    if (frame < range.startFrame) {
      const t = (range.startFrame - frame) / DUCK_RAMP;
      target = range.duckedVolume + (vol - range.duckedVolume) * t;
    } else if (frame > range.endFrame) {
      const t = (frame - range.endFrame) / DUCK_RAMP;
      target = range.duckedVolume + (vol - range.duckedVolume) * t;
    }
    vol = Math.min(vol, target);
    break;
  }
}
return Math.max(0, vol);
```
(exact excerpt, `resolveCues.ts:47-64`)

**Transferable lesson:** This is a directly applicable reference implementation for the project's own "3-point duck (intro duck / mid-gap rise / outro resolve)" verification requirement (`CLAUDE.md` §6) — a tested, pure, frame-pure function taking `(frame, ranges) → volume`, with an explicit ramp constant (8 frames ≈ 0.27s at 30fps) instead of an instant on/off, is exactly the shape `LessonBgmLayer`'s envelope math should have, and this repo's `resolveCues.test.ts` shows the test vocabulary for verifying it (`volRampIn` strictly between base and ducked, `volDuring` exactly at ducked floor, `volWellAfter` back to base).

### B3. Visual-event-anchored SFX firing (audio timing derived from the same action list that drives the animation)

**Where:** `vendor/remotion-cinematic/src/engine/cursor/Cursor.tsx:268-280`, `vendor/remotion-cinematic/src/primitives/ScenePush.tsx:67-71`

**What it does:** Rather than authoring SFX cues on a separate timeline, both the cursor system and scene-transition system fire their sound effects directly off the *same* declarative schedule that drives the visual motion. In `Cursor.tsx`, for every entry in the `actions: CursorAction[]` array (the same array `buildSegments()` consumes to compute cursor position/rotation), if `sfx[action.action]` exists, a `<Sequence from={action.at} durationInFrames={entry.durationInFrames ?? 30}>` mounts an `<Audio>` at that exact `action.at` frame — a click sound cannot be authored at a different frame than the click animation because they read the same `action.at`. `ScenePush`'s `enterSfx` similarly fires at `from={0}` inside a component that is itself always mounted inside the scene's own `<Sequence from={sceneStart}>` (`CinematicDemo.tsx:71`), so the whoosh always lands exactly on the scene's push-transition entrance frame with zero possibility of independent drift.

**Load-bearing code:**
```tsx
{sfx && actions.map((action, i) => {
  const entry = sfx[action.action];
  if (!entry) return null;
  return (
    <Sequence
      key={`sfx-${action.action}-${action.at}-${i}`}
      from={action.at}
      durationInFrames={entry.durationInFrames ?? 30}
      layout="none"
    >
      <Audio src={staticFile(entry.src)} volume={entry.volume ?? 0.5} />
    </Sequence>
  );
})}
```
(exact excerpt, `Cursor.tsx:268-280`)

**Transferable lesson:** The general pattern — "derive the audio Sequence's `from` directly from the same struct that drives the visual, never a parallel hand-authored timestamp" — is the SFX-side equivalent of the project's own `audio-cues.json` → composer-owned SFX-frame rule (`CLAUDE.md`: "SFX frames = composer-owned, derived from `cueFrames + layout.ts` offsets, never literals"). This repo demonstrates the pattern one level more tightly coupled (the visual primitive itself owns firing its accompanying SFX, rather than a separate layer reading the primitive's frames) — worth considering for cursor/pointer-style teaching gestures if the lesson pipeline ever adds them.

### B4. Mechanical total-duration derivation from declared scene config (`calculateMetadata`)

**Where:** `vendor/remotion-cinematic/src/Root.tsx:10-23`

**What it does:** Remotion's `calculateMetadata` hook is used to compute the actual composition `durationInFrames` from the *input props* rather than a hardcoded `Composition` value: `calculateDuration` filters `props.scenes` to `enabled` ones, sums their `durationInFrames`, and subtracts `overlap * (count - 1)` for the push-transition overlaps — i.e., total video length is a pure function of the same per-scene duration array that drives every `<Sequence>`, camera keyframe, and audio cue. There's no audio-waveform-driven duration here (no narration to measure), but it is a real "duration derivation" mechanism: the single declared timing source (`SceneTiming[]` + `overlap`) is authoritative for the *outer* composition length exactly as it is for every inner cue, so enabling/disabling a scene in Studio instantly and correctly reflows the total render length.

**Load-bearing code:**
```ts
export function calculateDuration(props: CinematicProps): number {
  const enabled = props.scenes.filter((s) => s.enabled);
  if (enabled.length === 0) return 30;
  const total = enabled.reduce((sum, s) => sum + s.durationInFrames, 0);
  return total - props.overlap * Math.max(0, enabled.length - 1);
}

const calculateMetadata: CalculateMetadataFunction<CinematicProps> = ({
  props,
}) => {
  return {
    durationInFrames: calculateDuration(props),
  };
};
```
(exact excerpt, `Root.tsx:10-23`)

**Transferable lesson:** Confirms `calculateMetadata` (a first-class Remotion API) is the right place to compute a composition's total length from whatever the pipeline's authoritative per-cue timing source is, instead of a separately-maintained duration constant that can go stale — directly relevant if the lesson pipeline ever wants Studio-side scrubbing of a lesson whose length is `sum(max(narrationFrames, motionFrames) + tail)` per the project's own Wave 3.5 reconcile formula.

## C. Anti-patterns & gaps

- **No narration/ASR/caption system exists at all**, despite this being the strongest layout-engine candidate in the vendor scan. Exhaustive proof — `grep -rniE "whisper|elevenlabs|\bASR\b|word.?timestamp|token.?timestamp|caption|subtitle|transcript|tts\b|text-to-speech|speech" src --include="*.ts" --include="*.tsx"` returns only four false-positive hits, all the unrelated `Panel`'s `subtitle` prop (`src/primitives/app-ui/Panel.tsx:7,23,53,59,69` and its three call sites in `ProductReveal.tsx`/`FeatureShowcase.tsx`) — zero real matches. `grep -rn "getAudioDurationInSeconds|getAudioData|@remotion/media-utils|durationInSeconds" src` also returns nothing: no audio-derived duration anywhere. Any "voice-visual coordination" claim about this repo has to be understood as SFX/music-visual coordination only.

- **Text has zero dynamic fitting/measurement despite variable-length, schema-permitted long strings.** `schema.ts:89` allows a window `title` up to 200 characters and `schema.ts:31/33/35` allows headline lines up to 200 characters each, but the only overflow handling anywhere is static CSS: `Window.tsx:61-63` (`whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"`) silently truncates a long title with no signal to the author that it was cut, and `Headline.tsx` renders headline lines at a fixed `fontSize` (default 88, schema-capped at 400) with no `measureText`/canvas-metrics/auto-shrink step — a headline author who fills the 200-char budget at `fontSize: 400` will overflow the `padding: "0 80px"` (`Headline.tsx:158`) safe margin with no warning, either in Studio or at render. Grep proof: `grep -rn "measureText|fitText|autoFit|useMeasure" src` → 0 matches anywhere in the repo.

- **The zone-based collision-avoidance engine (`A1`) is built, tested, and completely unused by production code.** The repo's own `.claude/CLAUDE.md` states outright: *"The zone-based layout engine (`defineZones`, `LayoutProvider`, `LayoutWindow`) still exists in `src/engine/layout/` but is not used by any current scene."* All five real scenes use the choreography layer (`resolveWindowPose`, hand-placed absolute `startX/startY`) instead, meaning the one mechanism that actually *prevents* overlaps by construction was abandoned in favor of manually-tuned coordinates that a human eyeballed — the five scenes' `DEFAULT_WINDOW_LAYOUT` entries in `schema.ts:122-237` are hardcoded pixel positions with no automated proof they don't collide with each other or the headline text.

- **The collision-avoidance algorithm in `zones.ts` itself is a first-fit heuristic, not a real solver, and can still produce overlaps in a case its own tests don't cover.** `placeInSlot` (`zones.ts:38-94`) only tries "push below" then "push right" for a *single* avoid rect at a time in the order given, with no re-check against *earlier* avoid rects after a push (a push to clear avoid-rect #2 can re-enter avoid-rect #1's region) and no re-check against *other windows already placed in the same slot* at all — `avoidRects` only comes from named `reserved` zones, never from sibling `LayoutWindow`s, so two ordinary windows placed in the same zone can still overlap each other; only zone↔headline-style collisions are handled.

- **The music-ducking ranges are hand-authored absolute frame literals in `CinematicDemo.tsx:83-86`** (`{startFrame: 150, endFrame: 260, ...}`), not derived from the same `SceneTiming`/scene-id abstraction the rest of the audio/camera system uses (contrast with `AudioCue{scene, at}` and `CameraKeyframe{scene, at}`, both scene-relative). This is the one audio mechanism in the repo that violates its own "never a literal, always scene-relative" pattern (B1) — if scene durations change, these two ranges silently stop lining up with the scenes they were tuned for.

## D. Verdict

Ranked by transfer value for the lesson pipeline:

1. **B1 (single scene-timing resolver shared by every subsystem)** is the single best finding — independent, tested, external validation that "one resolver function + one shared timing array, called identically by camera/audio/mount code" is the correct shape for cue-anchored coordination; it's effectively a smaller-scope proof of the project's own Wave 3.5 reconcile philosophy.
2. **B2 (three-stage music envelope: fade-in/out + ramped ducking, `computeMusicVolume`)** is directly reusable as a reference implementation for `LessonBgmLayer`'s envelope math — pure, frame-in/volume-out, with a concrete ramp constant (8 frames) and a test suite whose assertion vocabulary (before/ramp-in/during/ramp-out/after) maps 1:1 onto the project's "3-point duck" verification requirement.
3. **A2 (pure `resolveWindowPose(def, frame)` prop→pose resolver)** is worth citing as precedent when justifying the "zero frame literals, everything derives from `cues[id]` + a pure resolver" rule to a skeptical reviewer or a weaker pi-agent model — it's a second, independently-arrived-at implementation of the exact same idea.
4. **A1 (zone `avoidZones` push-then-clamp placement)**, despite being unused in this repo's own production scenes (a documented cautionary tale, see C), is still a legitimate small building block for a "declare a no-go region once, have elements avoid it by construction" primitive — worth stealing the *idea*, not the code, and worth noting its own gap (no sibling-window collision checking) so a lesson-pipeline port doesn't inherit that hole.

Weakest link: this repo is not a narration/ASR reference at all (see C) — nothing here should be cited as evidence for word-timestamp-driven caption/animation sync; its only real contribution to "B" is SFX/music-visual sync, and even that has one internal inconsistency (hardcoded ducking-range literals bypassing its own scene-relative convention).
