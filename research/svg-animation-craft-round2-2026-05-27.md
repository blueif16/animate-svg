# SVG animation craft — research brief, round 2
_scope: ~3yr window, motion-design + raster-hybrid + style-modifier lens, deep dive across Reddit + yt-rag + Exa • generated 2026-05-27 • continues `svg-animation-craft-2026-05-26.md`_

## TL;DR
- **Style overlay is feasible without forking.** Production prior art exists for both halves of the user's ask: (a) `kako-jun/blueprinter` ships a CLI that converts any SVG into sumi (ink wash), watercolor, or chalk by injecting a deterministic `feTurbulence + feDisplacementMap + feGaussianBlur + feColorMatrix` chain — proving the "modifier wraps any element" pattern is real, with concrete numeric ranges. (b) `React Rough Fiber` is the heavier-weight precedent — a custom React renderer that walks an existing SVG tree and rewrites primitives through rough.js without the consumer changing markup. Pick (a) for round-1 ink-wash; reserve (b) for if we ever need per-primitive rewrite. [E]
- **FX wrapping has a converged pattern — and it is NOT `cloneElement`.** Every production wrapper surveyed (`react-glass-ui`, `@gracefullight/liquid-glass`, `react-glow`) renders a sibling `<Defs>` component that injects `<filter>` / `<linearGradient>` / `<pattern>` definitions, then targets opt-in via `filter="url(#id)"` on the primitive — *or* a same-tree overlay-clone with `pointer-events:none` + CSS mask for highlight effects (shine, glint). `cloneElement` style-merge gets brittle when wrappers nest (React#32531). This dictates our `<FX>` and `<StylePreset>` shape. [E]
- **Secondary action is the next-biggest motion-smoothness lever.** Round 1 nailed easing+anticipation+overshoot+settle; the gap is "what happens at the *ends* of an action and on *appendages*." Frank/Ollie-style appendage drag (elbow leads forearm leads hand; tip is last to catch up + farthest to overshoot — Becker, Alan Becker Tutorials), looping micro-cycles (boil, breathing, eye blinks) on resting state, and offset start frames across stacked entries are the universal "feels alive" recipe. [Y]
- **Motion blur on programmatic SVG = use a smear, not a blur.** Becker's "smear frame" — single arc-shaped tinted shape drawn between the start and end pose, semi-transparent at the tail — is the 2D substitute for motion blur. Cheap to do in SVG with a `<path>` per fast-moving primitive; far cheaper than CSS `filter:blur()` per-frame, and stylistically richer. Saves CSS blur for "wet-edge" ink work, where it belongs. [Y]
- **Raster + SVG hybrid in Remotion is solved at the API layer.** `<Img src={staticFile('x.png')} />` is canonical (waits for load, deterministic), layer order via *nested `<AbsoluteFill>` — lower in tree renders on top, no z-index needed*, and PNG/JPG/WebP/SVG/GIF-first-frame are all supported up to 539MP (Chrome's decode limit). The unsolved layer is asset *prep*: BiRefNet/RemBG still leave halos, LayerDiffuse SDXL produces "dirty" alpha. Two-step matting (generate opaque → matt with BiRefNet) is the practitioner consensus. [E][R]

## What's working (claimed)

### A. Smoother motion (continuation)
- **Appendage drag (Frank-and-Ollie).** Every joint chain in an organic motion should ripple: elbow leads forearm leads hand; the tip is last to arrive *and* farthest to overshoot. In SVG terms: stagger start frames by 2–4 frames down a chain and graduate the overshoot amplitude. Direct application to our counting primitives — when a row of dots enters, the trailing-direction dot should arrive last and overshoot most. [Y — Alan Becker Tutorials, https://youtu.be/uDqjIdI4bF4?t=538]
- **Smear frames replace motion blur on 2D.** A single in-between frame drawn as an arc shape connecting the start and end pose, fill-colored same as the object, semi-transparent toward the tail. Cheap in SVG: emit a single `<path>` per fast-mover during the high-velocity window, mask or fade at endpoints. [Y — Alan Becker Tutorials, https://youtu.be/uDqjIdI4bF4?t=808]
- **Loop boil as default "alive" state.** Marriott's recipe extended: pick a 4–8-frame loop, faster cycle = chaotic/energetic, slower cycle = calm/contemplative. Combine with `feTurbulence` `<animate attributeName="seed" calcMode="discrete">` for SVG-native frame-keyed perturbation — no per-frame React re-render needed. [Y — Ben Marriott, https://youtu.be/OlGjmrB__cM?t=0]
- **Splash secondary-action recipe.** Pen-tool a blob path, animate 3 keyframes peak-then-collapse half-second offset from the primary action. Sells weight without rigging. Maps directly to our PopIn: pair the dot's pop with a "ground impact" blob 8–12 frames later. [Y — Ben Marriott, https://youtu.be/a7Nyzqy9_I0?t=184]
- **Walk-cycle keyframe sliding.** ECAbrams: never start every joint on the same frame — slide shoulder, hip, knee, ankle each by ±2 frames. For our purposes: when 5 dots enter together, treat them as a chain, not 5 copies of the same animation. Already partially in the kit via stagger; the new lever is *also* offsetting the *peak* (overshoot crest) per item, not just the start. [Y — School of Motion]

### B. Liveliness "magic" FX library on SVG
- **Sparkle = animated turbulent-displace on a glitter layer + card-wipe shards.** Marriott's "born" puff recipe: a small glitter texture displaced by `feTurbulence` (animated seed), masked through card-wipe shards with random rotation/shrink. In SVG: one `<filter>` with animated seed + a handful of `<polygon>` shards each with random `transform-origin` + scale/rotate keyframes. [Y — Ben Marriott, https://youtu.be/QJ9ZE6BEkNU?t=184]
- **Cinematic shine sweep.** SonduckFilm's recipe: CC Radial Fast Blur on an adjustment layer over screen blend + curves to harness streaks. SVG translation: `<linearGradient>` with offset-animated stops on a white-to-transparent strip + `mix-blend-mode: screen` + a clip path matching the underlying primitive's bounding shape. [Y — SonduckFilm, https://youtu.be/JHeMJ_l2iNA?t=366]
- **Production FX wrapping converges on "sibling Defs + filter URL."** `react-glass-ui` and `@gracefullight/liquid-glass` both render a `<LiquidGlassFilters />` component once at the root that injects `<defs>`, then consumers opt in by referencing `filter="url(#liquid-glass)"` on the target element. `react-glow` is the alternative: overlay-clone with `pointer-events:none` + CSS mask. **Do NOT use `cloneElement` to inject FX props** — nested wrappers break style-merge (React#32531). [E]
- **CRT/RGB-haze overshoot for "magic" text reveal.** Pure CSS+SVG technique: three offset color channels (red/green/blue) animate-in with slight x-offset, then converge. Useful as a "reveal" treatment for the answer in a math lesson. [R — r/webdev, https://reddit.com/r/webdev/comments/1s8vqyc/]
- **Smart Ticker char-diff text animation.** Levenshtein-diff React component for SVG text — animates only the characters that change between renders. Direct fit for showing partial answers as the lesson progresses. [R — r/reactjs, https://reddit.com/r/reactjs/comments/1pyrc4f/]

### C. Raster + SVG hybrid in Remotion
- **Remotion's canonical raster API.** `<Img src={staticFile('x.png')} />` waits for image load before the frame is captured — required for deterministic rendering. Native `<img>` is forbidden (race-condition prone). Layer order works via *nested `<AbsoluteFill>` — the deeper child renders on top* (no z-index needed). Supports PNG, JPG, WebP, SVG-as-img, GIF (first frame only). Hard cap: 539 megapixels per image (Chrome decode limit). [E — https://www.remotion.dev/docs/img]
- **Painted-bg + vector character pipeline (canonical workflow).** Photoshop-isolate every element to its own PNG with transparency, place each on a classic-3D Z-position layer, motion-tile with `time*-1500` expression for infinite scroll. In Remotion: each asset is its own `<Img>` inside a parallax layer; depth determines speed. [Y — SonduckFilm, https://youtu.be/2bYK8h-4aR4?t=3]
- **Parallax rule of thumb.** Foreground faster, background slower; reverse directions = camera rotation/boom. For a lesson, this means painted background drifts at 0.1–0.3× the primary action's velocity. [Y — Toniko Pantoja, https://youtu.be/phB-renvGa8?t=196]
- **Paper-texture overlay (raster-on-SVG).** Wimshurst's recipe: scan/source a watercolor or paper texture, set brightness -100, blend mode `overlay`, then dial brightness back up. Preserves underlying fill values, adds animated grain. SVG translation: `<image>` with `style={{ mixBlendMode: 'overlay', filter: 'brightness(...)' }}` layered above the primitive group. [Y — Howard Wimshurst, https://youtu.be/t6Cd3-bwNlU?t=550]
- **Two-step matting beats native-alpha diffusion.** LayerDiffuse for SDXL keeps getting recommended for transparent-PNG output but practitioners report "dirty" edges. Consensus: generate opaque with SDXL/Imagen → matte with BiRefNet (state of art) or RemBG (good enough, faster). Topaz/aiarty are pay-to-play with marginal gains. [R — r/StableDiffusion]

### D. Ink wash style modifier (the crux)
- **`kako-jun/blueprinter` is the existence proof.** Production CLI that takes any input SVG and emits sumi (ink wash), watercolor, or chalk variants with `--seed` for deterministic jitter. The filter chains are public:
  - Sumi: grayscale palette + `feGaussianBlur stdDeviation=2–4` + stroke opacity 0.6–1.0
  - Watercolor: pastel palette + `feGaussianBlur stdDeviation=4–8` + `feColorMatrix saturation=0.9` + fill alpha 0.5–0.9
  - Chalk: `feTurbulence + feDisplacementMap + light feGaussianBlur` + stroke opacity 0.7–0.95 (jittered per stroke)
  - All three accept `--jitter-amplitude`, `--jitter-frequency`, `--jitter-stroke-width-var` knobs.
  Critical: pure-SVG, no raster, no canvas — fully compatible with Remotion's frame-deterministic model. [E — https://github.com/kako-jun/blueprinter]
- **Rough.js is deterministic.** `seed` option (default 0); when `seed !== 0`, `Math.random()` is replaced by a seeded PRNG. Same seed + same params = byte-identical output SVG. `roughness`, `bowing` are the two visual knobs. For ink-wash, use rough.js to perturb path control points before applying the filter chain — gets you wobbly strokes AND wet bleed. [E — https://github.com/rough-stuff/rough]
- **React Rough Fiber — heavy precedent for tree rewrite.** Custom React renderer that swaps every SVG primitive (`<rect>`, `<circle>`, `<path>`) for rough.js-rendered equivalents. Handles inherited `fill` via SVG `<pattern>` workaround. Heavyweight, but proves the "modifier converts every child" architecture is achievable in React. Reserve for a future style that needs per-primitive rewrite (e.g., a hand-drawn style where every dot becomes a distinct sketched circle). [E — https://bowencodes.com/post/react-rough-fiber]
- **CSS-Tricks pencil/squiggle.** `feTurbulence + feDisplacementMap` chain — same family as ink-bleed, lower scale (3–6 instead of 10–25). [E — https://css-tricks.com/creating-a-pencil-effect-in-svg/]
- **Codrops rough-paper texture.** `feTurbulence type=fractalNoise baseFrequency=0.04 numOctaves=5` + `feDiffuseLighting surfaceScale=2` + `feDistantLight azimuth=45 elevation=60`. This is the *paper background*, not the *ink* — use for the style's underlying texture, not the strokes. [E — https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/]
- **andyjakubowski crispness restore.** After Gaussian blur, run `feComponentTransfer feFuncA type="discrete" tableValues="0 1 1 1"` to threshold alpha back to crisp — gives ink-bleed wet edges without the whole image going soft. [E — https://andyjakubowski.com/tutorial/ink-bleed-effect-with-svg-filters]

## What's broken / contested
- **`feDisplacementMap` is Chromium-only in 2026.** Multiple r/webdev threads confirm it works in Chromium and breaks in Safari/Firefox. Not a problem for Remotion (Chrome-only render) but it WILL break if we ship the style modifier to the web preview / studio in a non-Chrome browser. [R — r/webdev, https://reddit.com/r/webdev/comments/1ld66hp/]
- **Native-alpha diffusion is contested.** LayerDiffuse top-of-thread recommendations get hammered by top comments — "transparent but dirty," semi-transparent halos. Two-step (opaque generate → BiRefNet matte) wins on quality. Plan for it in the asset-prep pipeline. [R — r/StableDiffusion]
- **`cloneElement` style-merge gotcha.** React#32531 — nested wrappers must explicitly read `child.props.style` before merging or they clobber each other. This kills the "stack multiple FX HOCs" idea unless we centralize style-merge logic. The sibling-Defs pattern dodges this entirely. [E]
- **Motion blur ≠ CSS `filter:blur()`.** No source surfaced a perf comparison of CSS blur vs `feGaussianBlur` vs raster pre-comp inside Remotion's Chromium render. The animation community's answer is "don't use blur — use smear frames." We should follow that lead unless we measure otherwise. [Gap]
- **Auto-polish via plugin is mixed-reception.** AE plugins like "Buoy" auto-apply overshoot/settle; r/AfterEffects threads are split between "great timesaver" and "feels mechanical / homogenizes everything." Argues for keeping our motion vocabulary opt-in per primitive, not blanket-applied. [R — r/AfterEffects]

## Numbers worth verifying

### Ink wash filter chain (blueprinter / Codrops / andyjakubowski composite)
| Layer | Filter | Concrete values |
|---|---|---|
| Wet edge | `feGaussianBlur stdDeviation` | 1–4 px (ink); 4–8 (watercolor); 12+ becomes defocus |
| Bleed displacement | `feTurbulence` | `baseFrequency=0.04–0.08`, `numOctaves=4–6`, `type=fractalNoise` |
| Bleed amplitude | `feDisplacementMap scale` | 10–25 (ink), 3–6 (pencil), 50+ for chaotic ripple |
| Crispness restore | `feComponentTransfer feFuncA type=discrete tableValues="0 1 1 1"` | threshold alpha after blur |
| Paper grain | `feTurbulence baseFrequency=0.8 numOctaves=6` + `feDiffuseLighting surfaceScale=2` | for the background, not the strokes |
| Color | `feColorMatrix saturation=0.9` (watercolor); grayscale matrix (sumi) | |
| Fill opacity | 0.5–0.9 (watercolor); 0.6–1.0 (sumi); 0.7–0.95 stroke (chalk) | |

### Motion / FX
- **Smear frame:** single arc `<path>`, fill-color = object color at 60–80% opacity, length = bounding box of motion path.
- **Boil loop:** 4 frames at 24fps = 6 fps effective (chaotic); 8 frames = 3 fps effective (calm).
- **Sparkle/glint loop interval:** 24–48 frames between sparkles at 30fps; vary by ±25% per emit so they don't sync.
- **Shine sweep opacity envelope:** 0 → 0.6 → 0 over 18–24 frames; gradient stop offset 0% → 120%.
- **Appendage drag stagger:** 2–4 frames per joint down the chain; overshoot amplitude graduates 1.0 → 1.06 → 1.12 from root to tip.

### Remotion raster API
- **Layer order:** nested `<AbsoluteFill>` — *deeper in tree renders on top*. No z-index.
- **Max image size:** 539 MP (Chrome decode limit).
- **Supported:** PNG, JPG, WebP, SVG (static), GIF (first frame only).
- **Forbidden:** native `<img>` — use `<Img>` to gate on load.

## Style overlay architecture options

The user's constraint: one main pipeline + opt-in style overlays + immediately-recognizable aesthetic + minimal new files per style + a modifier that converts existing elements where possible. Below are three concrete proposals, ordered by ambition.

### Proposal 1 — "Style preset = root wrapper + skill bundle" (recommended, minimal)
1. **`brief.md` gains one optional line:** `**Style.** <style-id | default>`. If absent or `default`, no overlay applied.
2. **Skill bundle per style** lives at `.agents/styles/<style-id>/`:
   - `palette.md` — token overrides (background, ink, accent, paper)
   - `animation.md` — motion-vocabulary tweaks (e.g., ink wash slows easing, prefers spring → settle over snap)
   - `background.md` — what fills the canvas (solid color, paper texture, painted raster)
   - `strokes.md` — stroke style declarations (width range, opacity, terminal shape)
   - `capabilities.md` — which existing capabilities this style overrides or extends
3. **Implementation lives at `src/styles/<style-id>/`:**
   - `StylePreset.tsx` — a single React component that:
     - Renders an `<svg width="0" height="0">` containing `<defs>` with the style's filter chain (e.g., `#style-ink-wash-bleed`, `#style-ink-wash-paper`, `<pattern>` brushes)
     - Sets CSS custom properties on the scene root (palette tokens)
     - Wraps `children` in a `<g filter="url(#style-ink-wash-bleed)">` — applies the modifier to everything below
   - `palette.ts` — typed export for code paths that need palette tokens
   - `index.ts` — re-exports
4. **Wave 2 (visual-design)** reads `.agents/styles/<style-id>/*` and incorporates palette/stroke/background into the Visual Contract. Identity-invariance still holds — primitives stay primitives; only their *aesthetic* shifts.
5. **Wave 4 composer** wraps the scene root: `<StylePreset name="ink-wash">{sceneContent}</StylePreset>`. Default lessons skip the wrapper entirely → zero-change behavior.
6. **New capability registered in `.agents/CAPABILITIES.md`:** `style-overlay-system` — points to `.agents/styles/` for adding new styles.

**Pros:** ~6 files per new style. No new wave. Default lessons stay pixel-identical. Style swaps in via `brief.md` field flip + one composer wrap. The filter-based modifier handles 80% of "convert any element to this style" automatically.

**Cons:** Some primitives may need style-aware rendering (e.g., a counting dot in ink-wash may want a brush-stroke variant, not a filtered circle). Covered by Proposal 2 below.

### Proposal 2 — "Style preset + opt-in primitive variants" (additive on top of #1)
Same as Proposal 1, plus: primitives subscribe to a `StyleContext` (`useStyle()`) and can branch on style ID for high-effort cases. Example: `<Dot>` checks `useStyle()`; under `ink-wash` it renders a brush-textured path instead of a filtered circle. Default → no branching, no behavior change. Each style declares which primitives it has hand-tuned variants for in `.agents/styles/<style-id>/capabilities.md`.

**When to escalate to #2:** only when a specific primitive looks bad under the filter modifier and a hand-tuned variant noticeably improves it. We start with #1 and add variants as needed.

### Proposal 3 — "React Rough Fiber-class tree rewrite" (deferred, do not build now)
A custom React renderer that walks the SVG tree and rewrites every primitive in the target style. Massive engineering investment, brittle to React renderer API changes. The blueprinter precedent shows we don't need this for ink-wash — filter chains are sufficient. Park for a hypothetical future "every element must be uniquely re-rendered" style.

### Magic FX library — separate capability
Independent of style overlays. Add `src/fx/` with:
- `<FX effect="sparkle|shine|glint|breathe|born-puff" />` — a sibling component (the `LiquidGlassFilters` pattern). Renders an invisible `<svg>` with `<defs>` for the requested effect, returns a hook value for the filter ID.
- Or: `<WithFX effect="sparkle" target="#dot-1">` — co-renders the overlay/filter and targets via SVG `filter="url(#id)"`. NOT a `cloneElement` HOC (see React#32531).
- Register as `magic-fx-library` in `.agents/CAPABILITIES.md`.

## Next moves

- **Build Proposal 1 first.** Add `.agents/styles/ink-wash/` with the five declarative files, `src/styles/ink-wash/StylePreset.tsx` with the blueprinter filter chain (sumi values: `stdDeviation=3`, `feTurbulence baseFrequency=0.06 numOctaves=5`, `displacementMap scale=15`, grayscale palette + paper-grain), and the `brief.md` schema addition. One lesson re-rendered in ink-wash mode is the verification artifact.
- **Add `<FX>` capability in parallel.** Five effects on day one: `sparkle`, `shine`, `glint`, `glow-pulse`, `breathe`. Use the sibling-Defs pattern. Document the anti-patterns (cloneElement, prop drilling).
- **Add `<Smear>` primitive for motion blur substitute.** Takes start pose, end pose, current progress; emits the arc-shape path automatically during high-velocity windows. Cheaper than CSS blur, stylistically richer.
- **Add `<Drag>` motion-vocabulary helper.** Takes a chain of children; staggers their start frames by N frames and graduates overshoot amplitude root→tip. Wraps the Frank-and-Ollie principle into one composable primitive.
- **Asset-prep skill addition** (small): document the two-step matting workflow (SDXL/Imagen opaque → BiRefNet matte) in the raster-asset capability when we add it. Don't build the pipeline yet; document the path.
- **Follow-up searches worth running:**
  - Color-grade matching raster↔SVG in Remotion (Exa came up empty)
  - Live anticipation-overshoot-settle stack-up patterns for *multiple* simultaneous primitives (motion-design canon, but no clean public recipe surfaced)
  - BiRefNet → Remotion pipeline glue code

## Sources

### Reddit [R]
- SVG `feDisplacementMap` Safari/Firefox warning — r/webdev 2025-06 — https://reddit.com/r/webdev/comments/1ld66hp/
- Kube.io CSS+SVG displacement-map recipe — r/webdev 2025-09 — https://reddit.com/r/webdev/comments/1nbfo11/
- Framer gooey/ink SVG filter preserving alpha — r/framer 2025-11 — https://reddit.com/r/framer/comments/1rsr59y/
- CRT/RGB-haze pure-CSS+SVG text effect — r/webdev 2025-11 — https://reddit.com/r/webdev/comments/1s8vqyc/
- Remotion + Claude long-form architecture parallels — r/reactjs 2025-11 — https://reddit.com/r/reactjs/comments/1qzadb5/
- React-component-per-scene from script (Framer Motion + Remotion) — r/reactjs 2026-01 — https://reddit.com/r/reactjs/comments/1q7hf0f/
- GSAP MorphSVGPlugin over Framer Motion for path morphs — r/reactjs 2025-05 — https://reddit.com/r/reactjs/comments/1kyy7p0/
- Illustrator Pathfinder + native filters for Voronoi/ink-blob — r/AdobeIllustrator 2026-01 — https://reddit.com/r/AdobeIllustrator/comments/1q6d75h/
- AE "Buoy" overshoot/settle auto-polish plugin reception — r/AfterEffects 2025-12 — https://reddit.com/r/AfterEffects/comments/1r487k8/
- Elastic pop between two keyframes (universal polish idiom) — r/AfterEffects 2025-10 — https://reddit.com/r/AfterEffects/comments/1okoevy/
- rembg/Topaz/aiarty alpha-matting halo complaints — r/StableDiffusion 2025-11 — https://reddit.com/r/StableDiffusion/comments/1s9oo6e/
- LayerDiffuse SDXL "dirty alpha" warning — r/StableDiffusion 2026-01 — https://reddit.com/r/StableDiffusion/comments/1q5d95j/
- Smart Ticker Levenshtein-diff char animation — r/reactjs 2025-12 — https://reddit.com/r/reactjs/comments/1pyrc4f/
- Sera UI smooth-animation component library — r/reactjs 2025-10 — https://reddit.com/r/reactjs/comments/1nwx3xn/
- Pokemon 12-principles study (ball bounce as unit) — r/animation 2025-09 — https://reddit.com/r/animation/comments/1n37pto/
- Lilo & Stitch primary→secondary→tertiary→quaternary motion stacking — r/animation 2025-06 — https://reddit.com/r/animation/comments/1l3pv9k/

### YouTube [Y] — MM:SS deep-links
- Alan Becker — Frank-and-Ollie appendage drag (elbow → forearm → hand) — https://youtu.be/uDqjIdI4bF4?t=538
- Alan Becker — Smear-frame cheat replaces motion blur — https://youtu.be/uDqjIdI4bF4?t=808
- Alan Becker — Slow-in/slow-out via spline curves on every keyframe — https://youtu.be/uDqjIdI4bF4?t=628
- Ben Marriott — Boil loop, 4–8 frames; faster=chaotic, slower=calm — https://youtu.be/OlGjmrB__cM?t=0
- Ben Marriott — Sparkle/"born" puff: turbulent-displace glitter + card-wipe shards — https://youtu.be/QJ9ZE6BEkNU?t=184
- Ben Marriott — Splash secondary action: pen-tool blob, 3 keyframes peak-then-collapse — https://youtu.be/a7Nyzqy9_I0?t=184
- Toniko Pantoja — Parallax rule of thumb (foreground faster, background slower) — https://youtu.be/phB-renvGa8?t=196
- Toniko Pantoja — Subtle master-frame rotation = believable camera tilt — https://youtu.be/phB-renvGa8?t=13
- SonduckFilm — Painted-bg + vector workflow: isolate PNG + 3D Z-layer + motion-tile — https://youtu.be/2bYK8h-4aR4?t=3
- SonduckFilm — Cinematic shine: CC Radial Fast Blur + screen blend + curves — https://youtu.be/JHeMJ_l2iNA?t=366
- Howard Wimshurst — Paper/watercolor texture as overlay (brightness -100 → overlay blend → brightness back up) — https://youtu.be/t6Cd3-bwNlU?t=550
- ECAbrams — Displacement-map theory: grayscale = pixel-shift instructions; blur the map first — https://youtu.be/Pq-QFJChhhs?t=183
- School of Motion — Delay Motion Pro auto-chain-parented follow-through — https://youtu.be/xXsuh4SSXuw?t=92

### Exa [E]
- kako-jun/blueprinter — production SVG→sumi/watercolor/chalk CLI with `--seed` — https://github.com/kako-jun/blueprinter
- rough.js — deterministic seed option in generator — https://github.com/rough-stuff/rough
- React Rough Fiber — custom React renderer for SVG tree rewrite — https://bowencodes.com/post/react-rough-fiber
- Remotion `<Img>` docs (`staticFile`, load gating) — https://www.remotion.dev/docs/img
- Remotion layer order docs (deeper child = on top) — https://www.remotion.dev/docs/layers
- andyjakubowski — ink-bleed via `feGaussianBlur` + `feComponentTransfer` alpha threshold — https://andyjakubowski.com/tutorial/ink-bleed-effect-with-svg-filters
- alexmwalker gist — paper-texture filter chain (`baseFrequency=0.8 numOctaves=6 scale=20`) — https://gist.github.com/alexmwalker/b404eaa69c458076b7662ddb11fc244f
- Codrops/Sara Soueidan — rough-paper texture via `feTurbulence + feDiffuseLighting` — https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/
- CSS-Tricks — pencil/squiggle effect on SVG — https://css-tricks.com/creating-a-pencil-effect-in-svg/
- react-glow — overlay-clone HOC with CSS mask — https://github.com/codaworks/react-glow
- React#32531 — `cloneElement` nested wrapper style-merge gotcha — https://github.com/facebook/react/issues/32531
- coolbutuseless/svgfilter — animated turbulence `<animate attributeName="seed" calcMode="discrete">` — (R port; pattern transfers)

## Method notes
- Legs run: Reddit + yt-rag + Exa. Skipped A/B vs WebSearch per round 1 commitment.
- yt-rag namespaces added in this round: `yt_howardwimshurst`, `yt_alanbeckertutorials`, `yt_tonikopantoja`, `yt_mtmograph`, `yt_ecabrams`, `yt_corridor`. Two intended additions failed: `@AaronBlaise` (channel has no videos tab) and `@JakeBartlett` (no auto-subs on recent uploads).
- Exa skipped Phase-3 fetches — Phase-1+2 search highlights contained the concrete numeric values needed. Re-run with `web_fetch_exa` if the architecture-implementation step needs source-level detail.
- Reddit rate-limited before two queries completed; the "React component wrapper sparkle effect" query specifically did not finish. The Exa leg covered that gap via the `react-glass-ui` / `LiquidGlassFilters` lineage.
- Exa gaps: color-grade matching raster↔SVG in Remotion (zero hits), BiRefNet→Remotion glue (zero hits), simultaneous-entry overshoot stack-up (motion-design canon, but no public code recipe surfaced).
