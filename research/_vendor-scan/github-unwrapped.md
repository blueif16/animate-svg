# github-unwrapped — vendor scan (2026-07-03)

https://github.com/remotion-dev/github-unwrapped @ `ece8397` — the Remotion team's production "GitHub Unwrapped 2023" app: personalized year-in-review videos rendered at scale on Lambda from per-user GitHub stats.

## What this repo is

Full production stack from the Remotion authors: a Vite web app (`vite/`), an Express + MongoDB render backend (`src/`), and the video itself (`remotion/`, ~150 TSX files, Remotion 4.0.240 + `@remotion/transitions` + Lambda). This is the closest public thing to "how the Remotion team ships data-driven video": every scene length is a pure function of props, every unknown-length input (username, repo names, star/issue counts up to thousands) is handled with explicit strategies. Maturity signals: real deploy scripts, Sentry sourcemaps, ESLint gating the build (`package.json:8`), active PR merges at HEAD (`ece8397` merges a community fix). Weak signals: **zero test files** (vitest is a dependency but `find . -name "*.test.*"` returns nothing), no `.github/workflows` in the repo.

Two structural notes framing everything below: the video canvas is fixed 1080×1080@30 (`types/constants.ts:1-3`), and there is **no narration/TTS anywhere** — audio is music + SFX only (proof in section B).

## A. Layout & overlay prevention

### A1. Count-adaptive grid: breakpointed columns, scale derived from usable width, hard cap with correction factor

**Where:** `vendor/github-unwrapped/remotion/Issues/make-ufo-positions.tsx:35-49, 119-163`

**What it does:** The Issues scene lays out N UFOs (N = user's issue count, 1..thousands). Column count steps with N (3/4/6/8), per-item width is derived from the padded canvas, and the sprite's scale is computed from that width — so any N produces a full-bleed, non-overlapping grid. Above 100 items it clamps to 100 and keeps a `factor` so the on-screen counter still reports true numbers (`Issues/index.tsx:318-321` multiplies back by `1 / factor`). A vertical budget (`UFOS_MUST_BE_ABOVE_LINE = VIDEO_HEIGHT * 0.4`) computes a scroll offset when the grid would invade the rocket's zone.

**Load-bearing code:**
```ts
// make-ufo-positions.tsx:149-163
const columns = issuesPerRow(totalUfos);
const spaceInbetweenUfo = 30;

const ufoContainerWidth =
  (USABLE_CANVAS_WIDTH - (columns - 1) * spaceInbetweenUfo) / columns;
const ufoScale = 1 / (UFO_WIDTH / ufoContainerWidth);
const ufoHeight = UFO_HEIGHT * ufoScale;
const rowHeight = ufoHeight + 10;
const rows = Math.ceil(totalUfos / columns);

const totalHeight = rows * rowHeight + PADDING;
const offsetDueToManyUfos = Math.min(
  0,
  UFOS_MUST_BE_ABOVE_LINE - totalHeight,
);
```
(also `reduceTotalNumberOfUfos` at :119-128 — `maxUfos = 100`, returns `{ factor, numberOfUfos }`; last-row centering via `getExtraPaddingIfInOfLastRow` at :64-83.)

**Transferable lesson:** For countable teaching objects of unknown multiplicity: derive item scale from `usableWidth / columns(count)`, never from a constant; cap the drawn count and carry a correction factor so displayed numbers stay honest; give the grid an explicit vertical budget (a fraction of VIDEO_HEIGHT) with an overflow offset instead of letting it collide with the fixed element below.

### A2. Safe area as derived constants, not inline padding

**Where:** `vendor/github-unwrapped/remotion/Issues/constants.ts:4-9`

**What it does:** One module owns the scene's spatial contract: outer padding, usable width, and the rocket's anchor coordinates — all derived from `VIDEO_WIDTH`. Both the layout code (`make-ufo-positions.tsx`) and the shot-choreography code (`get-shots-to-fire.ts`) import the same constants, so the "where can things be" and "where do lasers start" questions can never drift apart.

**Load-bearing code:**
```ts
export const PADDING = 120;
export const USABLE_CANVAS_WIDTH = VIDEO_WIDTH - PADDING * 2;
export const ROCKET_ORIGIN_X = VIDEO_WIDTH / 2;
const ROCKET_ORIGIN_Y = VIDEO_WIDTH - 150;
export const ROCKET_TOP_Y = ROCKET_ORIGIN_Y - TL_ROCKET_HEIGHT / 2;
export const TIME_BEFORE_SHOOTING = 90;
```

**Transferable lesson:** This is the same one-module-per-shared-fact discipline as our `layout.ts` convention — the anchor a projectile animation targets and the anchor the sprite renders at must be the same exported constant. Worth noting they mix a timing constant into the same file (`TIME_BEFORE_SHOOTING`), keeping the scene's whole contract in one place.

### A3. Stepped font sizing by character/digit count (no text measurement anywhere)

**Where:** `vendor/github-unwrapped/remotion/StarsGiven/AmountOfStarsDisplay.tsx:9-24`; `remotion/StarsGiven/HeadsUpDisplay.tsx:32-38`; `remotion/Opening/Title.tsx:87`; `remotion/OgImage/Stars.tsx:45`

**What it does:** Every place unknown-length text appears (GitHub username, repo name, star count), the font size is chosen from a small hand-calibrated step table keyed on `String(x).length` — never measured. Verified exhaustively: `grep -rn "fitText\|measureText\|fillTextBox\|getBBox\|getBoundingClientRect\|textLength" remotion/ src/ types/` → zero hits in video code (the only `getBoundingClientRect` is a website hover effect, `vite/Button/HoverEffect.tsx:6`). The username case scales the whole pane instead of the font: `scale: String(login.length > 18 ? 0.75 : 1)`.

**Load-bearing code:**
```ts
// AmountOfStarsDisplay.tsx:9-24
const fontSizeOfSevenSegmentDisplay = useMemo(() => {
  const digits = Number(totalStarCount).toString().length;
  if (digits === 1) return 900;
  if (digits === 2) return 800;
  if (digits === 3) return 600;
  return 500;
}, [totalStarCount]);
```
```ts
// HeadsUpDisplay.tsx:32-38 — repo name of unknown length
fontSize: textToDisplay
  ? textToDisplay.text.length > 25 ? 22
    : textToDisplay.text.length > 15 ? 30 : 40
  : 40,
```

**Transferable lesson:** For a single known font, a 3–4 step lookup on character count is the entire text-fitting system a production app shipped with — cheap, deterministic, and render-farm-safe (no DOM measurement / no `delayRender` for layout). The step thresholds are per-font calibration debt; a pipeline should generate them once per typeface rather than hand-tuning per component (see C1).

### A4. Counter width reservation: pad to `max` digits + tabular-nums (zero reflow while counting)

**Where:** `vendor/github-unwrapped/remotion/SevenSegment/SevenSegmentNumber.tsx:33-35, 78-89`; `remotion/Contributions/ContributionNumber.tsx:14`

**What it does:** Animated count-up numbers are laid out at the width of their FINAL value from frame 0: the seven-segment display takes `max` alongside `num`, renders `String(max).length` digit cells, and left-pads with zeros whose glyphs are hidden but whose cells still occupy space. The HTML counters use `fontVariantNumeric: "tabular-nums"` for the same guarantee. Result: a counter animating 0→9489 never shifts its neighbors.

**Load-bearing code:**
```ts
// SevenSegmentNumber.tsx:33-35
const digits = max ? String(max).length : String(num).length;

const fullNum = String(num).padStart(digits, "0");
```
```ts
// SevenSegmentNumber.tsx:78 — leading zeros keep their cell but draw nothing
{allBeforeAreZeroes ? null : (
  <Img style={{ height: fontSize, opacity, ... }} ... />
)}
```

**Transferable lesson:** Any animated numeral in a lesson (count-up, score, cardinality reveal) should be laid out for its terminal value — pass `max` into the component and reserve that many digit slots, or at minimum set `tabular-nums`. This kills a whole class of mid-cue layout jitter that a per-frame bbox check only catches after the fact.

### A5. Geometric collision detection drives choreography (line-vs-rectangle with shrunken hitboxes)

**Where:** `vendor/github-unwrapped/remotion/Issues/is-line-intersecting-rectangle.ts:51-127`; `remotion/Issues/get-shots-to-fire.ts:30, 120-162`

**What it does:** Before any frame renders, the scene computes which laser shots intersect which UFO rectangles (line-segment vs 4 rect edges, exact algebra) and converts each intersection's position along the line into `explodeAfterProgress` — so a UFO grazed mid-beam explodes at the correct proportional time. Hitboxes are deliberately shrunk (`HIT_BOX_SCALE = 0.6`) so only visually convincing hits count. This is collision math used generatively (to plan the animation), not defensively (to detect overlap bugs).

**Load-bearing code:**
```ts
// get-shots-to-fire.ts:122-131
const intersection = findLineRectangleIntersection({
  startX: shot.startX,
  startY: shot.startY,
  endX: shot.endX,
  endY: shot.endY,
  centerX: otherUfo.x,
  centerY: otherUfo.y,
  width: UFO_WIDTH * otherUfo.scale * HIT_BOX_SCALE,
  height: UFO_HEIGHT * otherUfo.scale * HIT_BOX_SCALE,
});
```

**Transferable lesson:** Precompute interactions as pure data (`shots[]`, `explosions[]` with frame offsets) from the same position arrays the renderer uses; then visuals, timing, and audio all consume that one plan. Also: an intentionally under-sized hitbox (0.6×) is the inverse of our bbox honesty rule — fine for choreography, never for overlap gating.

### A6. Composition dimensions switched by prop via calculateMetadata (one component, N aspect ratios)

**Where:** `vendor/github-unwrapped/remotion/Root.tsx:944-960` (same pattern at :971-987); consumed in `remotion/PromoVideo/Title.tsx:71`, `remotion/PromoVideo/ChooseYourRocket.tsx:60`

**What it does:** The promo video renders as 1200×630 landscape or 1080×1920 short from the same component tree: `calculateMetadata` returns different `width`/`height` based on a `layout` prop, and leaf components branch a handful of style values (`fontSize: layout === "short" ? 120 : 90`). Not fluid responsiveness — a two-point discrete system, with everything else anchored by flex centering.

**Load-bearing code:**
```tsx
// Root.tsx:944-960
calculateMetadata={({ props: { layout } }) => {
  if (layout === "landscape") {
    return { width: 1200, height: 630 };
  }
  if (layout === "short") {
    return { width: 1080, height: 1920 };
  }
  throw new Error("invalid layout");
}}
```

**Transferable lesson:** `calculateMetadata` can set canvas SIZE, not just duration — the clean route to a 9:16 variant of a lesson without a second scene tree: a `layout` prop consumed at the few genuinely aspect-dependent style points, flex handling the rest.

### A7. Chart normalization to the data maximum, dimensions in percent of a fixed track

**Where:** `vendor/github-unwrapped/remotion/Productivity/Productivity.tsx:66-100`; same idea for grid-cell opacity at `remotion/Contributions/index.tsx:159-161, 68-75`

**What it does:** The productivity bar chart never overflows because each bar's height is `productivity / maxProductivity` of a fixed 480px track — the tallest bar exactly fills it for every possible user. The contributions heat-grid does the same for opacity (`data / maxContributions`, floored at 0.25 so light days stay visible). Combined with per-bar spring `mass: productivity * 10 + 0.1`, heavier bars visibly rise slower.

**Load-bearing code:**
```tsx
// Productivity.tsx:66-68, 94-100
const maxProductivity = Math.max(
  ...props.productivityPerHour.map((p) => p.productivity),
);
...
<Bar
  index={productivityPerHour.time}
  productivity={productivityPerHour.productivity / maxProductivity}
  mostProductive={
    productivityPerHour.productivity === maxProductivity && maxProductivity > 0
  }
/>
```

**Transferable lesson:** Any data-driven visual (bar rows, dot brightness) should be expressed as a fraction of the per-render maximum inside a fixed-size track, so no input distribution can overflow the zone; keep a visibility floor (their 0.25 opacity) so small values don't vanish.

## B. Voice-visual coordination

**TTS/narration/captions: NONE — proven.** Searches run over all video source: `grep -rniE "caption|\bsrt\b|tts|transcri|whisper|timestamp|voiceover|narrat|duck" remotion/ src/ vite/ types/` → single hit is website copy ("add a caption", `vite/Share/content.tsx:124`). No word timestamps, no caption paging, no music ducking, no audio-duration probing (`getAudioDurationInSeconds` absent). The video is music+SFX only. The mechanisms below are the repo's real audio↔visual and duration-coordination machinery.

### B1. Prop-driven total duration: every scene exports getXDuration(props), Main sums them minus transition overlaps

**Where:** `vendor/github-unwrapped/remotion/Main.tsx:42-76`; per-scene functions at `remotion/Issues/index.tsx:58-72`, `remotion/StarsGiven/index.tsx:40-49`, `remotion/StarsAndProductivity/index.tsx:24-34`, `remotion/TopLanguages/AllPlanets.tsx:40-67`

**What it does:** The master composition's length is a pure function of the user's data. Each scene co-locates its duration function with its component (e.g. `getIssuesDuration` returns `4 * VIDEO_FPS + 20 + getTotalShootDuration(issuesClosed)`; `getStarFlyDuration` returns `(actualStars - 1) * TIME_INBETWEEN_STARS + ANIMATION_DURATION_PER_STAR + ...`). `calculateDuration` sums them, subtracting each scene-to-scene overlap constant, and the exact same functions feed the `<Series.Sequence durationInFrames={...} offset={-OVERLAP}>` props — one source of truth for both metadata and mounting. Optional scenes contribute 0 (`topLanguages ? ... : 0`).

**Load-bearing code:**
```ts
// Main.tsx:55-66
return (
  topLanguagesScene +
  getIssuesDuration({ issuesClosed, issuesOpened }) -
  ISSUES_EXIT_DURATION +
  CONTRIBUTIONS_SCENE_DURATION -
  CONTRIBUTIONS_SCENE_ENTRANCE_TRANSITION +
  END_SCENE_DURATION -
  CONTRIBUTIONS_SCENE_EXIT_TRANSITION +
  getStarsAndProductivityDuration({ starsGiven }) +
  OPENING_SCENE_LENGTH -
  OPENING_SCENE_OUT_OVERLAP
);
```

**Transferable lesson:** This is the industrial version of our Wave 3.5 reconcile: scene length = f(content), overlaps as named exported constants subtracted in ONE place, and the same function used by `calculateMetadata` and the `<Series>` mount so they can never disagree. The co-location rule (duration function lives next to its component, named `getXDuration`) is worth adopting verbatim.

### B2. Transition timing objects queried for their frame cost (never hardcoded)

**Where:** `vendor/github-unwrapped/remotion/TopLanguages/AllPlanets.tsx:29-34, 47-53`

**What it does:** The planets sub-sequence uses `@remotion/transitions` with a spring-based timing; its duration in frames is not a literal but is asked from the timing object itself, then subtracted per optional language ("a transition eats N frames of the series"). If the spring config changes, every duration downstream updates automatically.

**Load-bearing code:**
```ts
const allPlanetsTransitionTiming = springTiming({
  config: { damping: 200 },
  durationInFrames: 15,
});
...
const transitionDuration = allPlanetsTransitionTiming.getDurationInFrames({
  fps,
});
const { language2, language3 } = topLanguages;
const transitionBetween1And2 = language2 ? -transitionDuration : 0;
```

**Transferable lesson:** When a transition's length is defined by physics (spring settle), read the length FROM the timing object (`timing.getDurationInFrames({fps})`) instead of duplicating the number — the same "measure, don't assume" law we apply to voice, applied to motion.

### B3. Duration-bucketed music library: pre-produced stems every 2s, pick the nearest to the computed video length

**Where:** `vendor/github-unwrapped/remotion/Main.tsx:78-112, 143-153`

**What it does:** Because the total duration is data-dependent (roughly 24–60s), they authored the soundtrack in 2-second-stepped lengths (24, 26, … 56s) per theme, presumably each with a proper musical ending. At runtime `getMusicDuration` walks the buckets and picks the one within 1s of the actual duration; the `<Audio>` src is chosen from `durationInFrames` via `useVideoConfig()`. Music always ends musically instead of being cut or faded by code.

**Load-bearing code:**
```ts
// Main.tsx:78-91
const getMusicDuration = (durationInSeconds: number) => {
  let sec = 24;
  if (durationInSeconds < 24) return 24;

  while (sec < 57) {
    if (Math.abs(sec - durationInSeconds) <= 1) {
      return sec;
    }
    sec += 2;
  }
  return 56;
};
```

**Transferable lesson:** For emergent-length videos, quantize the music problem at AUTHOR time: a small library of stems at fixed length steps + nearest-bucket selection beats runtime trimming/fading for musicality, and it is fully deterministic. Directly applicable to our bed/sting library (`_beds` today loop-and-duck; a length-bucketed outro-resolve variant set is this pattern).

### B4. SFX mounted from the same computed choreography data as the visuals, with an explicit audio-tag budget

**Where:** `vendor/github-unwrapped/remotion/Issues/index.tsx:280-287`; `remotion/Issues/get-audio-hits.ts:6-13, 27-42`; `remotion/audio-tags.ts:1`

**What it does:** The laser-shot SFX schedule is derived from the SAME `shots[]` array (with per-shot `shootDelay`) that drives the beam and explosion animations, so audio can never desync from picture: `delay: shots[index].shootDelay - 5` (fire the sound 5 frames early for perceived sync), mounted as `<Sequence from={audioHit.delay}><Audio .../></Sequence>`. Crucially, the number of simultaneous audio tags is a declared budget: max 5 shot sounds + 4 hits, asserted at module load against `MAXIMUM_NUMBER_OF_AUDIO_TAGS = 11` — sampled via `sampleUniqueIndices` so 100 explosions still produce ≤5 sounds.

**Load-bearing code:**
```ts
// get-audio-hits.ts:6-13
const MAX_SHOTS = 5;
const MAX_HITS = 4;

if (MAX_SHOTS + MAX_HITS > MAXIMUM_NUMBER_OF_AUDIO_TAGS - 1) {
  throw new Error(
    "MAX_SHOTS + MAX_HITS must be less than MAXIMUM_NUMBER_OF_AUDIO_TAGS -1",
  );
}
// :34-38  → delay: shots[index].shootDelay - 5
```

**Transferable lesson:** Two steals: (1) SFX frames must be READ from the choreography plan (our `audio-cues.json` → composer-owned motion frames rule is exactly this — validated here at production scale); (2) declare a hard concurrent-audio budget as a module-load assertion, and SAMPLE events down to it instead of stacking one `<Audio>` per event — N-per-event audio dies in the browser player.

### B5. On-screen text and counters keyed to computed hit frames (event→display sync)

**Where:** `vendor/github-unwrapped/remotion/StarsGiven/index.tsx:107-128, 130-162, 166-186`; hit-frame origin at `remotion/StarsGiven/Star.tsx:31-41`

**What it does:** As stars fly at the cockpit, the HUD shows WHICH repo each star represents and increments the star counter exactly when each star visually hits the windshield. The hit frames are computed from the same constants that animate the stars (`getStarBurstFirstFrame + index * TIME_INBETWEEN_STARS + STAR_ANIMATION_DELAY`), then the current frame is searched against that array (`findLastIndex(i => i < frame)`); text opacity dips near each hit (`interpolate(distanceToHit, [0, 2], [0, 1])`) so the label crossfades per event. The windshield "glockenspiel" sound mounts inside the star's own `<Sequence from={stop}>` (`Star.tsx:102`), so picture, label, counter, and sound all derive from one formula.

**Load-bearing code:**
```ts
// StarsGiven/index.tsx:115-127
const hits = useMemo(() => {
  return hitIndices
    .map((index) => {
      return (
        getStarBurstFirstFrame({
          duration: ANIMATION_DURATION_PER_STAR,
          hitSpaceship: true,
        }) +
        index * TIME_INBETWEEN_STARS +
        STAR_ANIMATION_DELAY
      );
    })
    .sort((a, b) => a - b);
}, [hitIndices]);
```

**Transferable lesson:** This is the SFX-free analog of token-onset binding: build the event-frame array ONCE from the motion formula, then drive counter increments, label swaps, opacity dips, and sounds off `findLastIndex(hit < frame)`. Our spoken-enumeration rule (`stepFramesFromOnsets`) generalizes to any event source — here the event source is choreography instead of ASR.

### B6. Content-scaled event counts with floors and ceilings (getActualStars / getTotalShootDuration)

**Where:** `vendor/github-unwrapped/remotion/StarsGiven/StarsFlying.tsx:4-11`; `remotion/Issues/constants.ts:11-13`

**What it does:** Time-consuming per-item animations clamp how the item count maps to events/time so pacing survives extreme inputs: stars shown = `max(5, min(starsGiven * 2, 20))` (a 1-star user still gets a show, a 9000-star user doesn't get 25 minutes), and total shooting time = `min(60, closedIssues * 10)` frames. Duration functions (B1) then consume these clamped values, so pacing and total length stay bounded.

**Load-bearing code:**
```ts
// StarsFlying.tsx:4-11
export const TIME_INBETWEEN_STARS = 10;
const MAX_STARS = 20;
export const STAR_ANIMATION_DELAY = 20;
const MAX_HITS = 8;

export const getActualStars = (starsGiven: number) => {
  return Math.max(5, Math.min(starsGiven * 2, MAX_STARS));
};
```

**Transferable lesson:** Every content→time mapping needs a floor AND a ceiling, expressed once in the same module as the animation constants — the equivalent of our pacing floor (≥ exposures) plus a ceiling we don't currently formalize per-primitive.

## C. Anti-patterns & gaps

1. **Text fitting is calibration debt, not a system.** The digit/length step tables (A3) are hand-tuned per component per font and duplicated — `fontSize: digits > 2 ? 55 : 65` appears in four files (`remotion/OgImage/Stars.tsx:45`, `OgImage/PullRequests.tsx:46`, `IGStory/Stars.tsx:77`, `IGStory/PullRequests.tsx:43`). Free-form strings can still overflow: `InnerLanguageDescription.tsx:64-68` renders `language.name` (arbitrary for `type: "other"`, e.g. "Jupyter Notebook") at fixed `fontSize: 74` inside a pane with no length guard or ellipsis; the HUD's fallback is truncation (`textOverflow: "ellipsis"`, `HeadsUpDisplay.tsx:53-56`), i.e. losing content rather than fitting it. Notably they did NOT use their own `@remotion/layout-utils` `fitText` (released before this repo's later commits).
2. **Absolute frame literals coupled by hand.** `<Sequence from={175}>` for weigh.mp3 (`PullRequests.tsx:71`), `<Sequence from={durationInFrames - 230}><Audio startFrom={170}>` (`Main.tsx:233-234`), rocket pinned at `top: 440 + TOP_OFFSET / 2` (`Contributions/index.tsx:293`) — the exact class of magic-number timing/position our zero-frame-literal law bans; several SFX would silently desync if a scene duration constant changed.
3. **Hidden time remapping breaks the frame contract.** `ContributionsScene` divides the clock: `const frame = f / 1.5;` then re-divides in `interpolate(frame / 0.5, ...)` (`Contributions/index.tsx:143-155`) — double speed-warping that makes every downstream number unreasonable-about; `spring({ fps, frame })` there receives the warped frame, so its perceived damping silently changes with the warp factor.
4. **Environment-dependent output.** `isMobileDevice()` (UA sniffing, `Opening/devices.tsx:14-21`) conditionally unmounts EVERY `<Audio>` in ~10 scenes at render time (`Issues/index.tsx:284`, `Star.tsx:101`, etc.). Intended for the in-browser `<Player>` preview, but it executes inside composition code, so preview-on-iPhone and the Lambda-rendered MP4 are different videos — an undocumented preview/render divergence. A prop (`muted`) or Remotion env API would express this honestly.
5. **Music has no relationship to SFX loudness** — no ducking, no bus, per-clip hand volumes (0.3–0.8 scattered across files); the bucket fallback `return 56` (`Main.tsx:90`) means any video over ~57s runs out of music with no handling (silent tail).
6. **Props mutation in a pure helper:** `rocketRotation` sorts its input array in place (`positions.sort(...)`, `make-ufo-positions.tsx:206`) — a React-props mutation landmine.
7. **No tests of any kind** for the duration algebra (B1) — the exact code most likely to break off-by-one when a constant changes; `calculateDuration`'s sum of nine terms has no golden-value check.

## D. Verdict

Ranked steals for our lesson pipeline:

1. **The duration algebra (B1+B2+B6):** every scene exports `getXDuration(props)` co-located with its component; `calculateMetadata` and `<Series.Sequence>` consume the same function; transitions report their own frame cost; every content→time mapping has floor+ceiling. This is our Wave 3.5 reconcile validated at production scale — adopt the co-location naming and the `timing.getDurationInFrames()` habit.
2. **Choreography-as-data (A5+B4+B5):** compute a plan array once (positions, shots, hit frames), then visuals, counters, labels, AND `<Sequence from={event}>` audio all read it. Plus the audio-tag budget assertion (`MAXIMUM_NUMBER_OF_AUDIO_TAGS`) with event SAMPLING — we have no concurrent-audio ceiling today and should.
3. **Terminal-value layout for counters (A4):** reserve digits from `max`, tabular-nums — eliminates count-up reflow, cheap to add to our number primitives.
4. **Count-adaptive grids with honest correction factor (A1):** breakpointed columns, scale from usable width, cap at 100 with `1/factor` counter correction, explicit vertical budget — a direct upgrade blueprint for countable-multiplicity primitives.

What NOT to copy: length-threshold font stepping as scattered inline ternaries (centralize or measure instead), UA-conditional audio inside compositions, and unmanaged absolute SFX frames. And the headline negative finding: even the Remotion team shipped a flagship with zero text measurement and zero narration timing — this repo contributes nothing for ASR/caption alignment; our token-onset machinery has no counterpart here.
