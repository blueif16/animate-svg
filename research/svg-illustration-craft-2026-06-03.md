# SVG illustration craft — research brief
_scope: evergreen (bias 2018–2026), generic domain, deep dive • generated 2026-06-03_
_motivation: our prop-driven SVG primitives "look like flat circles pretending to be a rope." We ship what we can program, not what we know is beautiful. This brief is the missing technique vocabulary + the asset-import lever._

## TL;DR
1. **The flatness is fixable with SVG filters we don't yet use.** `feTurbulence`→`feDiffuseLighting`/`feSpecularLighting` turns a flat shape into a lit, dimensional surface (alpha channel = bump map); `feTurbulence`→`feDisplacementMap` roughens clean edges into organic/hand-drawn ones. We already use `feTurbulence` in ink-wash — we just never reached for lighting or displacement. [E][Y]
2. **Taste = a short, nameable vocabulary.** Pro illustration is: one light source from above → highlight / midtone / **core shadow (terminator)** / reflected light / **cast + occlusion shadow**; collapse values to ~3 groups; design the **silhouette/shapes first**; 60-30-10 palette with color judged *relative to neighbors*. This is programmable as layered fills + gradients, not magic. [Y]
3. **We don't have to hand-code every object.** For anything genuinely hard to draw procedurally (rope, knot, animal, complex props), **import from a curated open SVG set or generate an image → vectorize → compose**. Procedural craft and asset-import are two tracks; pick per object. (User directive — see §"Asset track".)

## What's working (claimed) — the programmable technique vocabulary
_Tags: [E]=Exa web, [Y]=YouTube/yt-rag. Reddit leg was dark this run (see Method notes)._

### A. SVG filter craft (depth, texture, material)
- **Bump-shade a flat shape into 3D:** `feTurbulence`/shape alpha → `feDiffuseLighting` (sun/outdoor) or `feSpecularLighting` (lamp/glossy) with `surfaceScale` (slope), `<feDistantLight azimuth elevation>`. Opaque = peak, transparent = flat. [E][Y] — freeCodeCamp/Sara Soueidan @36:34 `https://youtu.be/n7y0y_8zTo4?t=2286`
- **Procedural texture clipped to a shape:** `<feTurbulence type="fractalNoise" baseFrequency=0.01–0.9 numOctaves=1–5 seed=n>` + `<feComposite operator="in" in="SourceGraphic">`. Low baseFrequency = large blobs (marble/cloud); high = fine grain (paper/fabric/rope). [E] — Codrops/Soueidan `https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/`
- **Organic / hand-drawn edges:** `feTurbulence` (octaves 1–3, low freq) → `feDisplacementMap scale≈15–30`, `xChannelSelector`/`yChannelSelector`. Warps clean vector edges into wobbly ink. Add `stroke-dasharray`/`dashoffset` for draw-on. [E][Y] — Smashing `https://www.smashingmagazine.com/2021/09/deep-dive-wonderful-world-svg-displacement-filtering/`; Pixel ink @03:06 `https://youtu.be/eaH2mbCY9aw?t=186`
- **`seed` reuse** makes turbulence continuous/tileable across adjacent elements (so a row of sticks shares one grain). [Y, lone-wolf — verify]
- **Soft two-part drop shadow:** `feGaussianBlur` + `feOffset` + `feComposite`. Contact/occlusion shadow is the cheapest "grounds the object so it doesn't float" win. [E][Y]

### B. Shading & form WITHOUT filters (cheaper, more controllable)
- **Form ramp:** a `radialGradient` overlay on a circle fakes a sphere; a clipPath'd dark `radialGradient` underneath = cast shadow. [E] — Cloud Four `https://cloudfour.com/thinks/generating-solar-systems-part-2-filters-gradients-and-clip-paths/`
- **Name the zones, layer them as shapes:** highlight → midtone → core shadow (terminator, the *darkest* band) → reflected light → cast shadow → occlusion (darkest contact point). [Y] — Design Cuts @01:36 `https://youtu.be/_p_qMfnQvnY?t=96`
- **3-value collapse:** group everything into lights/mediums/darks; squint-test the grouping; softer edges read rounder. [Y] — Raminfard @07:42 `https://youtu.be/uy_CjLXIRXA?t=462`
- **Warm light / cool shadow**, with a saturation bump only at the light–shadow seam ("light falloff"). [Y, Proko — single source]

### C. Line craft (the "rope" problem)
- **Variable-width / tapered / calligraphic strokes:** `perfect-freehand` `getStroke()` returns a *fillable outline path* from points + pressure (thinning / streamline / taper / cap). Strokes become filled shapes, not 1px lines. [E] — `https://github.com/steveruizok/perfect-freehand`
- **Build a rope/braid/twist as REPEATED tapered-strand geometry along a path** — not two circles. Stroke-Based Rendering: place many short curved strokes that follow gradients, coarse→fine layers. [E] — Hertzmann SBR `https://dgp.toronto.edu/~hertzman/sbr02/hertzmann-cga03.pdf`

### D. Composition / taste principles (bake into a skill, not code)
- **Design shapes, not objects** — lock a readable silhouette / big light+shadow shapes before any detail. [Y] — Marco Bucci @06:07 `https://youtu.be/-ZknWKTpc90?t=367`
- **Shape psychology**: square=stable, triangle=sharp/alert, circle=friendly — pick the silhouette for the feeling. [Y, Sawtyruk]
- **Draw with shapes via Boolean ops** (union/subtract/intersect), ONE global stroke width. [E] — linearity.io
- **Refactoring UI depth:** emulate one light source from above; lighter = raised, darker = inset; use overlap/occlusion for layering. [E] — `https://refactoringui.com/book`
- **Palette discipline:** 60-30-10 dominance; harmony types (mono/analogous/complementary/split-comp); color is *relative to neighbors* — always test in context. [Y] — Brooke Glaser @01:33 `https://youtu.be/HDUUt_JGCqQ?t=183`
- **Build illustrations bottom-up as layered atomic shapes**, big shapes first. [E] — CSS-Tricks

## The asset track — generate / import instead of hand-coding (user directive)
Procedural craft is not the only lever. For objects that are hard to draw convincingly in code (rope, knots, animals, hands, complex props), use assets:
- **Curated open SVG sets** (CC0/MIT icon + illustration libraries) imported and composed as primitives — recolored via `currentColor` / theme tokens, animated via our existing motion wrappers. (User: "I've done it already — we can have an outside SVG library to use and compose here." → NEED: where this lives / which library.)
- **Generate → vectorize:** produce an image (AI image gen — we have `gpt-image-2-prompting` skill in-repo) then convert raster→SVG (e.g. potrace/vtracer/`@neplex/vectorizer`), clean, tokenize colors, drop into a family file as an asset-backed primitive. "Not a big deal" per user; suitable for one-off complex art that doesn't need to morph.
- **Decision rule (proposed):** hand-code when the object must be *parametric* (counts, progress-driven morphs, identity-preserving transforms — e.g. sticks, ten-frames, fen-he). Import/generate when it's *decorative or fixed-form* and just needs to look real (rope wrap, mascot, scene prop). This maps onto the existing CLAUDE.md fence: teaching primitives stay parametric SVG; everything else can be an asset.

## What's broken / contested
- **Bundle-wrap rope** = the canonical failure: flat stroked geometry → reads as circles. Fix via §C (repeated tapered strands + form ramp + occlusion) OR §asset-track (import a real rope/knot SVG). [user]
- **PointerHandArrow "hand" variant unrecognizable** — silhouette fails the shape-readability test (§D). Redraw the silhouette or swap to an imported hand asset. [user + gallery QC]
- **Reddit practitioner sentiment is missing this run** — scraper returned 0 (block); the "just give up and use a real illustrator/AI" counter-camp is unsampled. Re-run later if sentiment matters.
- **YouTube has little TRUE programmatic-SVG-illustration craft** — it splits into SVG-filter coding (DesignCourse, freeCodeCamp) and traditional painting fundamentals (taste). The synthesis of the two is OUR job; the written sources (Codrops/Soueidan, Smashing, CSS-Tricks) carry the code.

## Numbers worth verifying
- `feTurbulence baseFrequency`: ~0.01–0.05 large texture, ~0.2–0.9 fine grain; `numOctaves` 1–5 (diminishing past 3). [E][Y]
- `feDisplacementMap scale`: ~15 dramatic edge warp; ~30 for hand-drawn ink stroke. [Y]
- `feDiffuseLighting`: `surfaceScale` = relief steepness; `<feDistantLight elevation>` high = top-down. [Y]
- Filter perf on many instances / Remotion determinism = UNVERIFIED — must test (filters can be expensive at multiplicity; seed must be fixed for deterministic renders).

## Next moves
- **Prototype 1 — shading filter capability:** a reusable `<SurfaceShade>` / filter that applies form-ramp + core-shadow + occlusion to any primitive (start by un-flattening one countable, e.g. a sphere/fruit). Measure render cost at 10× multiplicity.
- **Prototype 2 — fix bundle-wrap rope:** repeated tapered-strand geometry along the wrap path + displacement edge + occlusion shadow; A/B against an imported rope SVG asset.
- **Asset track spike:** confirm the user's existing SVG-library approach + a raster→SVG path; build ONE asset-backed primitive end-to-end to prove the compose+recolor+animate flow.
- **Record taste as a skill:** a `primitive-creation` / visual-quality skill encoding the §D vocabulary + the anti-duplication rule + hand-code-vs-import decision rule (structural — needs approval).
- **Follow-up search if needed:** "constructing a braid/knot/twist as repeated SVG geometry" (this brief had to infer it) and "SVG filter performance at high instance counts in React/Remotion."

## Sources
### YouTube (ingested → `yt_svg_illustration_craft`, 16 vids / 193 chunks; deep-links keep MM:SS)
- freeCodeCamp/Sara Soueidan — SVG Filters Crash Course — `https://youtu.be/n7y0y_8zTo4?t=2286` (turbulence→lighting→displacement, the single best code segment)
- Pixel ink — hand-drawn SVG via feDisplacementMap — `https://youtu.be/eaH2mbCY9aw?t=186`
- Design Cuts — light/shadow zones incl. occlusion — `https://youtu.be/_p_qMfnQvnY?t=96`
- Marco Bucci — Good Shapes (design shapes not objects) — `https://youtu.be/-ZknWKTpc90?t=367`
- Raminfard — 3-value collapse / light logic — `https://youtu.be/uy_CjLXIRXA?t=462`
- Brooke Glaser — color harmony / 60-30-10 — `https://youtu.be/HDUUt_JGCqQ?t=183`
- DesignCourse — feTurbulence & displacement builds — `https://www.youtube.com/watch?v=XYdDiZa_O3k`, `https://www.youtube.com/watch?v=Nd70iyFT1r8`
- Proko / 21 Draw / Virtual Instructor / Michał Sawtyruk / Patt Vira (generative) — fundamentals + parametric
### Exa (web)
- Codrops/Soueidan feTurbulence texture — `https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/`
- Smashing feDisplacementMap deep dive — `https://www.smashingmagazine.com/2021/09/deep-dive-wonderful-world-svg-displacement-filtering/`
- Cloud Four gradients/clip-paths form+shadow — `https://cloudfour.com/thinks/generating-solar-systems-part-2-filters-gradients-and-clip-paths/`
- Refactoring UI (depth) — `https://refactoringui.com/book`
- perfect-freehand (variable-width strokes) — `https://github.com/steveruizok/perfect-freehand`
- Hertzmann Stroke-Based Rendering survey — `https://dgp.toronto.edu/~hertzman/sbr02/hertzmann-cga03.pdf`
- linearity.io draw-with-shapes / Boolean ops; CSS-Tricks layered-shape illustrations
### Reddit
- EMPTY this run (`macrocosmos/reddit-scraper` returned 0 across 3 calls — Reddit-side block, not query tuning).

## Method notes
- Legs run: Exa (web) ✓, YouTube (yt-rag, after curated 16-video ingest) ✓, Reddit ✗ (dark). No A/B WebSearch probe (deep dive).
- Enrichment: created namespace `yt_svg_illustration_craft` (global corpus — benefits all future runs).
- Two camps on YouTube: SVG-filter coding vs painting fundamentals; the written sources carry the actual filter code.

## Progress
- **2026-06-03 — BundleWrap rope un-flattened.** Addressed §C ("build a rope as repeated tapered-strand geometry along a path, not two circles") + §B (short-axis form-ramp + contact/occlusion shadow) + §A (fixed-seed `feTurbulence`→`feDisplacementMap`). Landed in `remotion-svg-primitives/src/shape-primitives/counting.tsx` (BundleWrap `rope` branch): interlocking two-ply twist (±32° tapered plies at fixed pitch) over a rounded capsule + `linearGradient` cylindrical ramp + blurred occlusion ellipse + `feDisplacementMap scale=3`. Deterministic (`ROPE_FIBER_SEED=7`; scoped filter/gradient ids). No new prop, no catalog change. Verified in the gallery still — reads as a twisted cord, not circles.
- **2026-06-03 — Decision: rope stays HAND-CODED, not traced.** It is parametric (animates on via `wrapProgress`, fits variable bundle widths), so it failed the "generate only fixed-form" test. The trace pipeline (`Omniscience/build_icon_svg_v2.py`) is reserved for fixed-form objects (e.g. the unrecognizable `PointerHandArrow` hand). See asset-track §.
- **2026-06-03 — Omniscience pipeline characterized** (3 explore subagents): it is a deterministic raster→SVG *tracer* (potrace+scour), NOT a generator; palette already = our `theme.ts`; needs a source PNG (GPT-Image→trace decided). End-to-end `name+description→GPT-Image→trace→SVG` CLI to be built on the Omniscience side and exposed as one command.
- **Pending:** extract a shared `<SurfaceShade>` (Prototype 1) so other flat primitives can un-flatten; build the end-to-end asset CLI; fix the hand via the trace pipeline; distribute the taste/anti-duplication rules into the skills.
