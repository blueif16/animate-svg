# open-design — vendor scan (2026-07-03)

Repo: https://github.com/nexu-io/open-design @ 32011bdfcc271cc6f0cba3b341441e090f62870f (shallow clone, 1 commit visible). Purpose: a local-first, agentic design/coding platform (daemon + web + desktop Electron shell) that drives Claude/Codex/Gemini/etc. agents through a catalog of 259+ "skills" and 142+ brand "design systems" to generate web pages, decks, images, video, and audio — NOT a Remotion app itself.

## What this repo is

`open-design` is a TypeScript monorepo (pnpm workspaces: `apps/{daemon,web,desktop,packaged,landing-page,telemetry-worker}`, `packages/*`, `tools/*`, `e2e/`) whose product is an agent orchestration daemon (`apps/daemon`) plus a Next.js web UI (`apps/web`). Its content layers — `skills/` (agent-invocable playbooks), `design-systems/` (142+ scraped-brand `DESIGN.md` + `tokens.css` packages), `design-templates/`, and `craft/` — are prose/markdown "rule" repositories consumed by LLM agents at generation time, not a rendering engine. Maturity signals: real CI (`.github/workflows/ci.yml` + ~20 other workflows), package-scoped `tests/` dirs in `apps/daemon` and `apps/web`, a `pnpm guard` static-analysis gate (`scripts/guard.ts`, 1300+ lines, dozens of named checks) that machine-enforces the design-token schema. Video/audio generation is delegated almost entirely to external hosted models (Sora, Veo, Kling, Seedance, ElevenLabs, MiniMax, Kokoro) via `apps/daemon/src/media/models.ts`; the one non-trivial in-house video mechanism is a bundled reference bundle for the separate `heygen-com/hyperframes` CLI (`plugins/_official/examples/hyperframes/`), which the daemon shells out to (`npx hyperframes render`) rather than reimplementing.

## A. Layout & overlay prevention

### A1. Shrink-to-fit runtime measurement (deck slides)

**Where:** `vendor/open-design/apps/daemon/src/brands/engine/artifacts/deck.ts:25-33,83-88,198-216`

**What it does:** Every generated pitch-deck slide is a fixed `aspect-ratio: 16/9` "frame" with `container-type: size` (a CSS Container). Slide body content is wrapped in a `.f-fit` layer that is NOT measured against the viewport — after layout, a script measures the fit layer's natural (unshrunk) `offsetHeight`/`scrollWidth` against the frame's actual available height/width and, only if content overflows, applies a single `transform: scale()` about the center, with a 2% safety margin so descenders never touch the clip edge. This runs synchronously on load, on `resize`, and once more 150ms later (a "settle pass") to catch late web-font swaps/image loads — deliberately not on `requestAnimationFrame`, which the code notes is throttled while offscreen.

**Load-bearing code:**
```js
function fitFrame(body) {
  var fit = body.querySelector('.f-fit');
  if (!fit) return;
  fit.style.transform = 'none';
  var availH = body.clientHeight;
  var availW = fit.clientWidth;
  if (availH <= 0 || availW <= 0) return;
  var naturalH = fit.offsetHeight;
  var naturalW = fit.scrollWidth;
  var scale = Math.min(1, availH / naturalH, availW / naturalW);
  if (scale < 1) {
    // small safety margin so descenders never touch the clip edge
    fit.style.transform = 'scale(' + (scale * 0.98) + ')';
  }
}
```

**Transferable lesson:** A cheap, structural "no-clip guarantee" — measure real DOM extent vs. the fixed frame post-layout and downscale uniformly about center, rather than trying to pre-compute font sizes that will always fit. For a Remotion lesson pipeline this is a good LAST-RESORT safety net (distinct from, and cheaper than, the project's own `--measured` bbox pass) — it could run once per cue's hero frame in a headless pass and either auto-shrink or fail the cue if the required scale drops below a legibility floor.

### A2. Container-query typographic units (composition-relative type scale)

**Where:** `vendor/open-design/apps/daemon/src/brands/engine/artifacts/deck.ts:58-159`

**What it does:** Every font-size, gap, padding, and radius inside a deck slide is expressed in `cqi` (container query inline-size units), not `px`, `vw`, or `rem`. Because the `.frame` element declares `container-type: size` (deck.ts:61), 1cqi = 1% of the frame's own width — so the identical CSS renders correctly whether the frame is laid out at `min(1280px, 94vw, ...)` on a phone or a 4K monitor, with zero JS and zero media queries. This is the mechanism that makes "structured yet flexible" real: the same slide markup is reused across arbitrary output sizes without a fixed pixel grid.

**Load-bearing code:**
```css
.frame {
  position: relative; aspect-ratio: 16 / 9;
  width: min(1280px, 94vw, calc((100vh - 48px) * 16 / 9));
  container-type: size;
  ...
}
.s-title { font-family: var(--display-family); font-size: 4.6cqi; line-height: 1.1; letter-spacing: -0.02em; margin: 0; color: var(--brand-color-text); max-width: 82cqi; }
.s-card p { font-size: 1.55cqi; ...; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
```

**Transferable lesson:** For any Remotion composition that must render at more than one target resolution/aspect (or where a primitive is reused inside a smaller inset), size text/spacing in container-query units against a `container-type: size` ancestor instead of hardcoding px against the 1920×1080 frame. This is strictly more portable than vw/vh, which are output-viewport-relative, not component-relative.

### A3. Text overflow prevention via `max-width` + `line-clamp` + `clamp()` fluid type

**Where:** `vendor/open-design/apps/daemon/src/brands/engine/artifacts/_shared.ts:131-132`, `vendor/open-design/apps/daemon/src/brands/engine/artifacts/landing.ts:72,297,300,321,482,652,657`

**What it does:** Generated landing pages (a different artifact than the deck, sharing no runtime JS measurement) prevent both horizontal and vertical overflow declaratively: `-webkit-line-clamp` truncates any card/body copy to a fixed number of lines regardless of how long the brand copy is, and `clamp(min, preferred-vw, max)` bounds every hero/heading font-size and section padding between a floor and ceiling while scaling with viewport width in between — no runtime JS at all.

**Load-bearing code:**
```css
.clamp-2 { -webkit-line-clamp: 2; }
.clamp-3 { -webkit-line-clamp: 3; }
```
```css
.section { padding: clamp(64px, 9vw, 104px) 0; }
h1 { font-size: clamp(36px, 5.6vw, 64px); letter-spacing: -0.025em; line-height: 1.06; }
```

**Transferable lesson:** Two purely-declarative, zero-JS overflow guards worth stealing even outside CSS/Remotion contexts: (1) always cap "body copy of unknown length" fields at N lines rather than trusting the content author to stay short; (2) size type between a floor and ceiling as a function of frame size, so a single set of authored numbers survives a resize instead of needing per-breakpoint literals.

### A4. "Layout Before Animation" — build the static hero frame before any tween

**Where:** `vendor/open-design/plugins/_official/examples/hyperframes/SKILL.md:178-246`

**What it does:** The bundled HyperFrames video-authoring skill (for the external `heygen-com/hyperframes` HTML→MP4 renderer) makes overlap-catching a *process* rule, not a tool: for each scene, first identify the "hero frame" (the moment the most elements are simultaneously visible) and write plain static CSS for exactly that end-state, using `width:100%; height:100%; padding:Npx; display:flex; ...; box-sizing:border-box` on the content container — explicitly banning `position:absolute; top:Npx` for content containers because an absolutely-positioned box doesn't reflow when content is taller than expected, so overflow is invisible until render. GSAP entrance/exit tweens are only added afterward, animating FROM/TO that already-correct static position — never guessing a final layout from an animated start state.

**Load-bearing code:**
```
1. Identify the hero frame for each scene — the moment when the most elements are simultaneously visible. This is the layout you build.
2. Write static CSS for that frame. The `.scene-content` container MUST fill the full scene using
   `width: 100%; height: 100%; padding: Npx;` with `display: flex; flex-direction: column; gap: Npx; box-sizing: border-box`.
   Use padding to push content inward — NEVER `position: absolute; top: Npx` on a content container.
   Absolute-positioned content containers overflow when content is taller than the remaining space.
   Reserve `position: absolute` for decoratives only.
3. Add entrances with `gsap.from()` — animate FROM offscreen/invisible TO the CSS position.
4. Add exits with `gsap.to()` — animate TO offscreen/invisible FROM the CSS position.
```

**Transferable lesson:** Directly applicable to the lesson-composer's own "ZERO FRAME LITERALS" discipline: require every scene/cue's *load-bearing* elements to be laid out at their static rest-frame position (flex/grid, not absolute px) FIRST, and treat entrance/exit motion strictly as an animated delta from that known-good layout — this converts "does this overlap?" from a render-time surprise into a build-time CSS review.

### A5. Automated collision/overflow/offscreen detection via headless-Chrome inspection + an animation map

**Where:** `vendor/open-design/plugins/_official/examples/hyperframes/SKILL.md:412-476`

**What it does:** Two build-time gates, both driven by actually running the composition in headless Chrome rather than static analysis: `hyperframes inspect` seeks through the real GSAP timeline at N sample points and reports true bounding-box overflow/off-canvas issues per selector with timestamps and fix hints (with two named escape hatches, `data-layout-allow-overflow` for intentional mid-animation overflow and `data-layout-ignore` for decoratives that should never be audited); `hyperframes validate` separately screenshots 5 timestamps and samples background pixels behind every text node to compute a real WCAG contrast ratio. A companion `animation-map.mjs` script parses the authored tweens into per-tween English summaries, an ASCII Gantt timeline, and named flags (`offscreen`, `collision`, `invisible`, `paced-fast` <0.2s, `paced-slow` >2s, "dead zones" >1s with no animation).

**Load-bearing code:**
```
`hyperframes inspect` runs the composition in headless Chrome, seeks through the timeline, and maps
visual layout issues with timestamps, selectors, bounding boxes, and fix hints.
...
If overflow is intentional for an entrance/exit animation, mark the element or ancestor with
`data-layout-allow-overflow`. If a decorative element should never be audited, mark it with
`data-layout-ignore`.
```
```
Outputs a single `animation-map.json` with:
- Per-tween summaries ... - ASCII timeline ... - Stagger detection ...
- Dead zones: periods over 1s with no animation ...
- Flags: `offscreen`, `collision`, `invisible`, `paced-fast` (under 0.2s), `paced-slow` (over 2s)
```

**Transferable lesson:** This is structurally the same shape as the lesson pipeline's own `lesson:check --measured` + `lesson:bbox` gates (measured real pixels, not a linear estimate) — but the *named allow-list escape hatches* (`data-layout-allow-overflow`, `data-layout-ignore`) and the *animation map's pacing flags* (`paced-fast`/`paced-slow`/dead-zone) are a smaller, reusable idea worth lifting: a per-element intentional-overflow/decoration marker read directly by the checker, and a stagger/dead-zone/pace linter distinct from the collision linter.

### A6. Zero-DOM-reflow text measurement for per-frame layout (`pretext`)

**Where:** `vendor/open-design/plugins/_official/examples/hyperframes/references/dynamic-techniques.md:81-90`, `vendor/open-design/plugins/_official/examples/hyperframes/references/captions.md:75-92`

**What it does:** `window.__hyperframes.pretext` does pure-arithmetic text-width measurement (no DOM reflow, quoted at ~0.0002ms/call), and `fitTextFontSize()` is built on top of it to binary/linear-search the largest font size that still fits a given `maxWidth` on one line. Because it never touches layout, it is cheap enough to call per-frame (e.g. inside a shrinkwrap caption container), unlike `getBoundingClientRect`/`offsetWidth`-based measurement which forces a synchronous reflow. The caption-overflow doc adds the CSS-side safety net: never `overflow:hidden` (it would clip scaled emphasis words), always an explicit `height` + `max-width`, and when any per-word style scales a word above 1.0x, divide the safe container width by `maxScale` before computing font size.

**Load-bearing code:**
```js
var result = window.__hyperframes.fitTextFontSize(group.text.toUpperCase(), {
  fontFamily: "Outfit",
  fontWeight: 900,
  maxWidth: 1600,
});
el.style.fontSize = result.fontSize + "px";
```
```
| **pretext**         | Pure-arithmetic text measurement without DOM reflow. 0.0002ms per call.   | `window.__hyperframes.pretext.prepare(text, font)` / `.layout(prepared, maxWidth, lineHeight)` | Per-frame text reflow, shrinkwrap containers, computing layout before render |
```

**Transferable lesson:** If the lesson pipeline ever needs per-frame or per-cue text-fit decisions (a caption/label that must always be one line), a canvas/metrics-based width estimate (Node `canvas` package, or a precomputed glyph-width table) that avoids a real browser layout pass is far cheaper than spinning up Puppeteer per candidate size — worth it only if the current bbox-manifest measured pass becomes a bottleneck.

### A7. Same-track temporal collision is structural, not detected

**Where:** `vendor/open-design/plugins/_official/examples/hyperframes/SKILL.md:248-261`

**What it does:** Every HyperFrames clip declares `data-track-index` (an integer) and the contract states plainly that same-track clips cannot overlap in time — i.e. the authoring format makes a whole overlap class (two clips on the same track both visible at once) a schema violation rather than something a checker has to catch after the fact. Visual z-order is explicitly decoupled from track index ("does not affect visual layering — use CSS z-index"), so the track axis is purely a temporal-exclusivity lane, separate from stacking.

**Load-bearing code:**
```
| `data-track-index` | Yes | Integer. Same-track clips cannot overlap. |
`data-track-index` does **not** affect visual layering — use CSS `z-index`.
```

**Transferable lesson:** Mirrors the lesson pipeline's own cue model (`cues[id].startFrame`/`endFrame`, one `<Sequence>` per cue) but generalizes it to N independent lanes instead of one: worth adopting explicitly for the SFX/bed layer wired at Wave 4 — declare which "lane" each `<LessonSfxLayer>` cue belongs to, and treat within-lane overlap as a hard authoring error the composer must catch, the same way the narration track already is single-lane-exclusive by construction.

### A8. Machine-enforced, layered design-token contract

**Where:** `vendor/open-design/packages/contracts/src/design-systems/token-schema.ts:69-198,203-232,254-277`, `vendor/open-design/design-systems/_schema/AGENTS.md:58-164`, `vendor/open-design/scripts/check-tokens-fixture-sync.ts:302-331`

**What it does:** Every one of the 142+ brand `tokens.css` files must satisfy one shared `TOKEN_SCHEMA` (colors, 8-step type scale `--text-xs`..`--text-4xl`, spacing scale `--space-1`..`--space-12` at 4/8/12/16/20/24/32/48px, radius scale, elevation, motion durations, container/gutter widths) split into 4 layers by "who decides + what happens if omitted": `A1-identity` (brand-defining, no fallback possible, e.g. `--bg`/`--accent`), `A1-structure` (brand-authored structural values, e.g. type scale / section rhythm / container widths), `A2` (required-with-a-documented-fallback, e.g. `--space-4: 16px`), and `B-slot` (optional richer tier that must at minimum alias to a named sibling, e.g. `--fg-2: var(--fg)`). Brand-only tokens live in an explicit `BRAND_EXTENSIONS` allowlist until ≥2 brands need the same name, at which point there is a named promotion path (`C-extension → B-slot → A2`). `pnpm guard` runs `checkDesignSystemA2RequiredTokens`/`checkDesignSystemBSlotRequiredTokens`/`checkDesignSystemA2DefaultsParity` to fail CI the moment a brand's `tokens.css` is missing a required token or drifts from `_schema/defaults.css`.

**Load-bearing code:**
```ts
export type TokenLayer = "A1-identity" | "A1-structure" | "A2" | "B-slot";
...
{ name: "--space-4",  layer: "A2", description: "Base spacing — 16px tier.", fallback: "16px" },
...
{ name: "--fg-2",   layer: "B-slot", description: "Secondary text tier (kami dark-warm).", aliasTo: "var(--fg)" },
```
```ts
const missing = requiredA2.filter((name) => !declared.has(name));
if (missing.length > 0) {
  violations.push(`[${brand}] ${toRepositoryPath(tokensPath)} is missing ${missing.length} A2 token...`);
}
```

**Transferable lesson:** The "who decides + what happens if omitted" 2-question framing is a clean, reusable way to parameterize a design system so it stays both structured (every consumer can rely on every token resolving to *something*) and flexible (a brand/style with no opinion doesn't have to invent one) — directly analogous to how the lesson pipeline's `.agents/styles/<style-id>/` bundle could declare which tokens a style MUST override vs. may safely alias to the default theme, with a lint that fails the moment a style ships an incomplete `tokens.css`-equivalent.

## B. Voice-visual coordination

### B1. Word-level ASR alignment with a mandatory transcript quality gate

**Where:** `vendor/open-design/plugins/_official/examples/hyperframes/references/transcript-guide.md:1-102`

**What it does:** `npx hyperframes transcribe` wraps local `whisper.cpp` (default model `small.en`, size/speed/accuracy table for `tiny`→`large-v3`) or ingests an external word-timestamped transcript (OpenAI Whisper API `timestamp_granularities:["word"]`, Groq Whisper API, or a pre-normalized JSON array of `{text, start, end}`), and explicitly downgrades SRT/VTT imports as "phrase-level only, can't do per-word animation effects." Before any caption is built, the doc mandates a transcript quality check with concrete failure signals (music-note tokens `♪`/`�` >20% of entries, garbled words, spans `end-start < 0.05s`) and an automatic retry ladder (`small.en` fails → retry `medium.en` → still fails → ask the user for manual lyrics or an external API), plus a hard rule never to use `.en`-suffixed models on non-English audio because they translate instead of transcribing.

**Load-bearing code:**
```
| Format             | Extension | Source                                                                      | Word-level?       |
| whisper.cpp JSON   | .json     | `hyperframes init --video`, `hyperframes transcribe`                        | Yes               |
| OpenAI Whisper API | .json     | `openai.audio.transcriptions.create({ timestamp_granularities: ["word"] })` | Yes               |
| SRT subtitles      | .srt      | Video editors, subtitle tools, YouTube                                      | No (phrase-level) |
```
```
**If more than 20% of entries are `♪`/`�` tokens, or the transcript contains obvious nonsense words, the transcription failed.**
1. Retry with `medium.en` if the original used `small.en` or smaller
2. If `medium.en` also fails ... tell the user the audio is too noisy ...
```

**Transferable lesson:** The retry ladder + explicit quality-check signals (rather than trusting ASR blindly) is the same discipline the lesson pipeline already applies at Wave 3a ("VOICE OUTPUT IS VERIFIED, NOT TRUSTED"); the concrete signal list (music-token ratio, garbled-word heuristics, minimum span length) is a good template for hardening the pipeline's own matchScore/ASR audit with a few more named automatic red flags beyond matchScore alone.

### B2. Caption timing/paging derived from transcript timestamps, with a hard exit guarantee

**Where:** `vendor/open-design/plugins/_official/examples/hyperframes/references/captions.md:59-118`

**What it does:** Captions are grouped into 2-6 word chunks keyed off transcript timestamps (word count per group tuned by detected "energy": 2-3 words for high-energy content, 4-6 for measured/calm), broken preferentially at sentence boundaries or ≥150ms pauses found in the ASR data. Positioning is a fixed safe-zone (`Landscape 1920x1080: bottom 80-120px, centered`; `Portrait 1080x1920: ~600-700px from bottom`) with an explicit rule to never cover a face and to keep only one caption group visible at a time. Crucially, every caption group is required to have a deterministic hard kill exactly at its ASR-derived `group.end`, implemented as a GSAP `tl.set(...,{opacity:0,visibility:'hidden'}, group.end)` placed after the fade-out tween — with a self-lint pass that seeks the timeline to `group.end+0.01` and warns if `getComputedStyle` still shows the group visible.

**Load-bearing code:**
```js
tl.to(groupEl, { opacity: 0, scale: 0.95, duration: 0.12, ease: "power2.in" }, group.end - 0.12);
tl.set(groupEl, { opacity: 0, visibility: "hidden" }, group.end); // deterministic kill
```
```js
GROUPS.forEach(function (group, gi) {
  var el = document.getElementById("cg-" + gi);
  if (!el) return;
  tl.seek(group.end + 0.01);
  var computed = window.getComputedStyle(el);
  if (computed.opacity !== "0" && computed.visibility !== "hidden") {
    console.warn("[caption-lint] group " + gi + " still visible at t=" + (group.end + 0.01).toFixed(2) + "s");
  }
});
```

**Transferable lesson:** The "self-lint by seeking the timeline and asserting computed visibility at end+epsilon" pattern is a cheap, generalizable correctness check worth adding wherever the lesson composer builds a caption/label that must disappear exactly at a cue boundary — it catches an off-by-one/left-over-fade bug deterministically instead of relying on a human scrubbing the contact sheet.

### B3. Deterministic, pre-extracted audio-reactive modulation (no runtime Web Audio API)

**Where:** `vendor/open-design/plugins/_official/examples/hyperframes/references/audio-reactive.md:1-59,72-76`, `vendor/open-design/plugins/_official/examples/hyperframes/references/dynamic-techniques.md:21-73`

**What it does:** Music-reactive visuals never analyze audio at playback time; a companion Python script (`extract-audio-data.py`) pre-computes per-frame frequency-band amplitudes (`{fps, totalFrames, frames:[{bands:[...]}]}`, band 0 = bass … band 12-14 = treble) once, offline. At composition-build time, the authored GSAP timeline reads this static array — either sampled every frame via `tl.call()` inside a `for` loop keyed to `f/AUDIO_DATA.fps` for continuous reactivity, or (the caption-specific variant) by taking the peak bass/treble over each caption group's `[start,end]` time range and baking that peak into that group's one-time entrance tween (scale/glow proportional to loudness) — explicitly "shapes the animation at build time, not playback time — no per-frame callbacks... no async fetch timing issues" for the caption case. The doc bans `Math.random()`/`Date.now()`/live Web Audio analysis outright, for determinism (repeated renders of the same input must produce byte-identical frames).

**Load-bearing code:**
```js
for (var f = 0; f < AUDIO_DATA.totalFrames; f++) {
  tl.call((function (frame) { return function () { draw(frame); }; })(AUDIO_DATA.frames[f]), [], f / AUDIO_DATA.fps);
}
```
```js
var startFrame = Math.floor(group.start * AUDIO.fps);
var endFrame = Math.min(Math.floor(group.end * AUDIO.fps), AUDIO.totalFrames - 1);
var peakBass = 0, peakTreble = 0;
for (var f = startFrame; f <= endFrame; f++) {
  peakBass = Math.max(peakBass, AUDIO.frames[f].bands[0] || 0, AUDIO.frames[f].bands[1] || 0);
}
```

**Transferable lesson:** The "pre-extract once, sample deterministically at build time, never analyze audio live" split is exactly the same posture the lesson pipeline already takes for ASR (frozen per-cue clips + `tokenOnsets`), just applied to a different signal (loudness/frequency instead of word timing). If the pipeline ever wants motion to react to narration loudness (e.g. a mascot that "speaks" more emphatically on stressed syllables), this pre-extract-then-sample pattern — not a live Web Audio analyser — is the pattern to copy for determinism.

### B4. Duration-from-media + explicit multi-track timeline model for narration

**Where:** `vendor/open-design/plugins/_official/examples/hyperframes/references/tts.md:45-70`, `vendor/open-design/plugins/_official/examples/hyperframes/SKILL.md:301-323`

**What it does:** TTS narration is generated once, offline, via a local Kokoro-82M CLI (`npx hyperframes tts script.txt --voice af_heart --output narration.wav`, 54 voices across 8 languages selected by content type, e.g. `af_heart`/`af_nova` for product demos vs `bf_emma`/`bm_george` for documentation) and is then mounted as an `<audio>` clip with `data-duration="auto"` — the framework reads the real WAV duration rather than the author declaring a number — on its own `data-track-index`, separate from the video/visual track. The documented workflow chains TTS → transcription in two commands (`hyperframes tts` then `hyperframes transcribe narration.wav`) so word-level caption timing always derives from the actual rendered audio, never from the script text's estimated reading time.

**Load-bearing code:**
```html
<audio
  id="narration"
  data-start="0"
  data-duration="auto"
  data-track-index="2"
  src="narration.wav"
  data-volume="1"
></audio>
```
```bash
npx hyperframes tts script.txt --voice af_heart --output narration.wav
npx hyperframes transcribe narration.wav  # → transcript.json with word-level timestamps
```

**Transferable lesson:** `data-duration="auto"` reading real media duration (instead of trusting an authored estimate) is the same "measure, don't assume" law the lesson pipeline already enforces for its own per-cue voice clips — worth confirming the Remotion side never lets a `<Sequence>` duration diverge from the actual imported audio asset's real length either.

## C. Anti-patterns & gaps

- **Broken/stale cross-reference in the repo's OWN code, not a skill doc.** `apps/daemon/src/brands/engine/artifacts/deck.ts:32` says the shrink-to-fit no-clip mechanism "is audited at build time by `auditDeckLayout` (apps/daemon/src/brands/engine/deck-layout-guard.ts)." That file does not exist anywhere in the tree (`find . -iname "*layout-guard*"` and `grep -rn "layout-guard"` both return only the one comment line referencing it), and `grep -rn "auditDeckLayout"` across the whole repo returns only that same comment. The claimed build-time audit is either vaporware or was deleted without updating the comment — a reader trusting the comment would look for a guard that isn't there.

- **The three "video from HTML" surfaces in this repo disagree with each other on layout maturity.** The bundled `hyperframes` skill (`plugins/_official/examples/hyperframes/`) teaches container-relative flex layout, `fitTextFontSize`, and headless-Chrome collision detection (A4-A6 above). But the standalone video-template skills shipped in `skills/` — e.g. `skills/8-bit-orbit-video-template/assets/template.html` — ignore all of it: the canvas is a literal `1920px`/`1080px` fixed size (lines 24-33), content uses raw `position:absolute; left:548px` pixel offsets (lines 227-231), star-field decoration is placed with `Math.round(rand()*1920)+"px"` (lines 418-419), and scene-transition boundaries are bare numeric literals `var T12 = 2.8; var T23 = 5.6;` (line 432-433) with a hardcoded `data-duration="8.7"` (line 315) — the exact "frame literal" anti-pattern this project's own CLAUDE.md forbids. No overlap/collision check is run on these templates at all; their own checklist (`skills/8-bit-orbit-video-template/references/checklist.md`) only asserts scene count and hold duration, never layout safety.

- **No audio-ducking/volume-envelope mechanism exists anywhere in the audio model**, despite a full multi-track (`data-track-index`) timeline and a `data-volume` attribute. `data-volume` is a single static 0-1 value per clip (`SKILL.md:259`, `tts.md:61`); there is no keyframed gain automation, no "duck the music bed under narration" rule, and no mention of `duck`/`sidechain`/sidechained volume anywhere in the bundled hyperframes reference set (verified via `grep -rniE "duck|sidechain|volume|gain\b"` across `references/*.md` + `SKILL.md`, and `grep -rniE "\bduck(ing)?\b|sidechain|lower.*volume.*voice|gain.*envelope"` across the whole repo, which returns zero real hits — only an unrelated "Dewey - A tidy duck" pet-name string and a CSS "whisper shadow" token name). Anyone porting the multi-track model would have to add ducking themselves.

- **Most of the "video generation" surface is a thin advertising layer, not an implementation.** `skills/remotion/SKILL.md` and `skills/fal-video-edit/SKILL.md` are both literally templated "catalogue entries" whose entire body is "ask the agent to invoke this skill by name... open https://github.com/<upstream>" — there is no Remotion code in this repo at all (confirmed: `grep -rn "from 'remotion'" --include="*.tsx"` and equivalent across `apps/`, `packages/` return nothing outside these two doc stubs and the `VIDEO_MODELS`/`hyperframes` entries in `apps/daemon/src/media/models.ts`). Treat `open-design` as a curator/orchestrator of external video tools, not a source of Remotion implementation patterns.

## D. Verdict

Ranked by expected payoff for the lesson pipeline:

1. **Shrink-to-fit runtime measurement + container-query (`cqi`) typography (A1/A2)** — the single strongest, most directly portable idea: size type in container-relative units against a `container-type:size` ancestor, and add a last-resort measure-then-uniformly-scale safety net for the rare case content still doesn't fit. Cheap, framework-agnostic, and complementary to (not a replacement for) the pipeline's own bbox-manifest gate.
2. **"Layout Before Animation" as a mandatory authoring step (A4), plus its two collision-detector escape hatches (A5)** — codify "build the static hero-frame layout first, animate as a delta from it" as an explicit composer rule, and adopt the two named markers (`data-layout-allow-overflow` / `data-layout-ignore`-style) so intentional vs. accidental overlap is distinguishable to the checker without narration.
3. **The transcript quality-gate ladder (B1) and the caption hard-kill self-lint (B2)** — both are concrete, mechanical hardenings of disciplines the pipeline already has (ASR verification, cue-boundary exactness) with sharper, copy-pasteable acceptance signals (music-token ratio, span-length floor, seek-and-assert-invisible lint).
4. **The layered token-schema promotion path (A8)** — "who decides the value, what happens if it's omitted" as the organizing question for any shared config surface, with a concrete C→B-slot→A2 promotion rule keyed on "≥2 consumers need the same name" — directly reusable for the pipeline's own style-overlay token contracts.

Weakest part of this repo for this research question: everything under "video/audio generation" that isn't the bundled `hyperframes` reference bundle is either a call to a paid external model or a thin doc stub: no in-house Remotion usage, no ducking, and the repo's own hand-authored video templates (skills/*-video-template) actively contradict the layout discipline the bundled hyperframes skill teaches.
