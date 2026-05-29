# SVG animation craft — research brief
_scope: ~2yr window, generic / motion-design lens, deep dive across Reddit + yt-rag + Exa • generated 2026-05-26_

## TL;DR
- **Easing + anticipation + overshoot is the universal liveliness recipe.** Cross-validated by Marriott (YT) and Disney-12-principles articles (Exa). For Remotion specifically: `Easing.bezier(0.16, 1, 0.3, 1)` for enters, `(0.34, 1.56, 0.64, 1)` for pop/overshoot, `(0.45, 0, 0.55, 1)` for balanced. [Y][E]
- **Hand-drawn feel = imperfection re-keyed over time, not a one-shot filter.** Marriott's "boil" (redraw stroke every 4 frames on 2s), `wiggle(amplitude, frequency)` on a parent transform, and SVG `d`-attribute vertex jitter all express the same idea: animate the imperfection itself, slow (≈12fps), so the eye reads "alive" not "noisy". [Y]
- **The stack we're already on is correct.** Every Exa source converges on Remotion's `interpolate` + `spring` with bezier curves as the deterministic, frame-accurate choice for programmatic video — better than Framer Motion (UI-oriented) or GSAP (timeline-oriented) for our render-the-frame model. Reserve external libs for cases the kit can't express (path morphing → Flubber; complex draw-on stagger → Motion's `pathLength` API). [E]

## What's working (claimed)
- **One progress source, derive everything.** Compute one `progress = slideIn - slideOut` per beat, then re-`interpolate` it to drive `x`, `opacity`, `scale`, `stroke-dashoffset` independently. Keeps cues atomic and lets cue boundaries (our `cues[id].startFrame + offset` rule) own time. [E — Remotion timing rules]
- **Anticipation = shrink to ~90% before grow → overshoot → settle.** Single most-cited recipe for spawning a countable so it feels born, not popped in. Implement with `spring({damping: 8, stiffness: 200})` or hand-built three-stop interpolate. [Y][E]
- **Stagger via varying delay, not duration.** Consistent across motion-design canon (Marriott, Smashing). For multiple countables appearing: same per-item duration, offset the start by 3–6 frames. Keeps motion language unified. [Y][E]
- **Stroke draw-on via `pathLength: 1` + `stroke-dashoffset` interpolate.** Universal sketch-mark reveal — abstracts away path-length math, lets you stagger across paths with a single curve. [E — Motion docs, bitovi, dev.to]
- **For organic stroke variation:** mask-on-stroke (calligraphy effect) or variable-width via multiple parallel strokes with different `pathLength` offsets. [E — css-tricks, bitovi]
- **For sketchy/hand-drawn outlines:** Rive can run keyable jaggedness/segmentation params live. Outside Rive, the equivalent is procedural — perturb path control points every N frames. [Y — School of Motion, Marriott]
- **Squash & stretch via `--squash-ratio` / `--stretch-ratio` CSS vars** with `transform-origin: center bottom`. Translates directly to Remotion's style prop. [E — joshwcomeau]
- **Bell-style asymmetric keyframe timing (50/25/25 not 33/33/33).** Front-loaded then quick-settle reads as physical rather than mechanical. [E — dev.to/harijn72]
- **For React+SVG declarative UI work outside Remotion:** Motion (renamed Framer Motion) is the default. For complex SVG craft (morph, draw-on, scroll-scrubbed timelines): GSAP. Lottie is no longer the default for icons/loaders — SVG+CSS wins on bundle weight (~400 bytes vs 60KB Lottie runtime). [R][E]

## What's broken / contested
- **Library wars are workload-dependent.** Top-karma Reddit comments call Motion smooth for UI; same threads report Motion scroll jitter that GSAP doesn't show. Don't assume one wins everywhere. [R]
- **"Just use CSS keyframes" minority** insists most animation libraries are over-engineered for transform/opacity work. Holds for trivial reveals; doesn't hold for path morph, scrub, or anything cue-boundary-derived. [R]
- **Lottie's conversion-lift numbers come from vendor data.** A 25-year creative-dev warned in the same Reddit threads that animation often "provides no brand or UX value" — discipline test, not a license to add more. [R]
- **AI-smoothed hand-drawn motion is the new uncanny valley.** A Digimon Blu-ray complaint thread surfaced the taste signal: viewers — even kids — detect when organic grit gets sanitized. Don't auto-smooth our sketch layer. [R]
- **Generic stroke-dashoffset is now a "no" for animated icons.** Lucide-animated explicitly steers contributors toward scale-pulse, shake, trails — because draw-on has become visual cliché. [E]

## Numbers worth verifying
- **Bezier curves to copy-paste:** enter `(0.16, 1, 0.3, 1)`; balanced `(0.45, 0, 0.55, 1)`; overshoot `(0.34, 1.56, 0.64, 1)`. SMIL/CSS overshoot spring `0.22 1 0.36 1`. [E]
- **Spring presets (Remotion):** snappy `{damping: 20, stiffness: 200}`; bouncy `{damping: 8}`; smooth `{damping: 200}`. [E — Mintlify]
- **Hand-drawn frame rate:** animate "on 2s" → effective 12fps; redraw key strokes every 4 frames at 30fps. [Y — Marriott]
- **Bundle math:** SVG+CSS spinner ≈ 400 bytes; Lottie equivalent ≈ 60KB + runtime. [E — cssvg.com]

## Next moves (for the lesson pipeline)
- **Codify a "liveliness palette" in `src/lesson-media` or `src/shape-primitives/shared.tsx`** — three named Easing.bezier exports (`enter`, `balanced`, `overshoot`) and two named `spring` configs (`snappy`, `bouncy`), so composer and primitive code reach for named curves, not literals. Brings every countable / sketch / transition into one motion vocabulary.
- **Add a `boil` utility to the sketch-explainer-layer.** Given an SVG path `d`, return a frame-keyed perturbed `d` where vertices jitter by ±0.5–1.0 viewBox units every 4 frames. Slow noise is the goal — fast noise looks like a bug. Apply only to hand-drawn marks, never to the teaching primitive's identity.
- **Stop using stroke-dashoffset alone for sketch-mark reveals.** Pair the draw-on with a tiny anticipation (mark briefly grows from 90→100% scale at end) so it reads as a teacher's pen settling, not a CSS transition.
- **Audit current Wave 4 composer code for raw bezier literals** — once `enter`/`balanced`/`overshoot` exist, every `Easing.bezier(...)` call should reference a name, not numbers.
- **Follow-up search worth running:** rough.js-style procedural sketch jitter for React/SVG; specific TypeScript libraries that take an SVG path and return a hand-drawn variant with stable seed. (Exa gap explicitly noted this is uncovered.)

## Sources

### Reddit [R]
- Motion vs AnimeJS for React — Motion wins on integration, GSAP wins on craft — r/reactjs 2025-04 — https://reddit.com/r/reactjs/comments/1sfl34a/motion_vs_anime_js/
- Motion scroll jitter report — r/reactjs 2025-06 — https://reddit.com/r/reactjs/comments/1lgylud/how_has_your_experience_been_with_motionframer/
- 25-yr creative-dev (Pharma patient-education) on KISS + designer partnership — r/Frontend 2025-10 — https://reddit.com/r/Frontend/comments/1o4dukw/anyone_here_working_longterm_in_creative_frontend/
- Mascot expression — Rive state machines for idle/happy/sad — r/reactnative 2025-04 — https://reddit.com/r/reactnative/comments/1sentse/best_way_to_implement_highquality_mascot/
- Scrollytelling 2026 stack: IntersectionObserver + rAF, transform/opacity only — r/webdev 2025-02 — https://reddit.com/r/webdev/comments/1r7w7tv/scroll_based_interactive_animations_in_2026/

### YouTube [Y] — keep MM:SS deep-links
- Ben Marriott — Easing changes acceleration without changing duration (linear = robot, eased = organic) — https://youtu.be/jFbRZZmMW7c?t=1458
- Ben Marriott — Looping boil: redraw stroke every 4 frames on 2s for hand-drawn life — https://youtu.be/OlGjmrB__cM?t=0
- Ben Marriott — `wiggle(amplitude, frequency)` "gate weave" on parent comp as anti-digital shimmer — https://youtu.be/a7Nyzqy9_I0?t=274
- Ben Marriott — Anticipation: shrink to 90% then overshoot, then settle on morph — https://youtu.be/n24aTp1-jK4?t=1373
- Ben Marriott — Logo snap: linear opacity + anticipation/overshoot on position via graph-editor handles — https://youtu.be/ZwzvgbjRHV4?t=371
- Ben Marriott — Eye-tracing: lead viewer's gaze with a moving element so reveal lands where they look — https://youtu.be/a7Nyzqy9_I0?t=645
- Ben Marriott — Stop-motion hand reveal at 12fps with longer holds on rest — https://youtu.be/jFbRZZmMW7c?t=2184
- School of Motion — Rive sketchy-stroke path effect with keyable params — https://youtu.be/IxbAukgSZHw?t=1999

### Exa [E]
- Remotion timing rules (canonical curves + one-progress pattern) — https://github.com/remotion-dev/skills/blob/main/skills/remotion/rules/timing.md
- Remotion spring presets (snappy / bouncy / smooth) — https://www.mintlify.com/remotion-dev/template-prompt-to-motion-graphics-saas/skills/spring-physics
- Disney 12 principles applied to SVG (case study, 2s/10-step grid, easeOutBack/Quint) — https://www.smashingmagazine.com/2016/07/an-svg-animation-case-study/
- SMIL step-by-step (keyTimes/keySplines, three-point overshoot, stagger via dur) — https://dev.to/angeloscle/smil-animations-in-svg-a-step-by-step-guide-using-a-real-wordmark-28dd
- Bell pendulum SMIL — asymmetric keyTimes (50/25/25) + additive sum — https://dev.to/harijn72/animated-bell-icon-anatomy-of-a-smil-ringing-animation-3c56
- Squash & stretch CSS vars pattern — https://www.joshwcomeau.com/animation/squash-and-stretch/
- Variable-stroke handwriting (clip-path stencils + GSAP drawSVG stagger) — https://www.bitovi.com/blog/svg-handwriting-animation-with-flair
- Motion `pathLength` + variants with `custom` stagger — https://motion.dev/tutorials/react-path-drawing
- Flubber organic path morph (overdamped spring required) — https://popmotion.io/learn/morph-svg/
- Lucide animated-icon rules (avoid generic stroke-dash) — https://pqoqubbw-icons.mintlify.app/contributing/animation-tips
- SVG+CSS vs Lottie (bundle weight, compositor thread) — https://cssvg.com/blog/svg-vs-lottie
- 2026 landscape — Lottie/Rive/CSS — https://www.pkgpulse.com/guides/lottie-vs-rive-vs-css-animations-web-animation-formats-2026
- Disney principles for eLearning specifically — https://elmlearnin1dev.wpengine.com/blog/disneys-principles-of-animation/
- Codrops creative SVG strokes (GSAP staggerFromTo + timeline.play() trick) — https://tympanus.net/codrops/2017/12/05/creative-svg-strokes-animation/

## Method notes
- Legs run: Reddit + yt-rag + Exa. Skipped the Exa-vs-WebSearch A/B probe (deep dive, overhead-prohibitive; user has already committed to Exa).
- yt-rag namespaces searched: yt_benmarriott, yt_schoolofmotion, yt_sonduckfilm, yt_remotion_motion + full-corpus queries. yt_sonduckfilm returned nothing in this scan (general-comparison content, not principles).
- Reddit gaps: no high-signal threads surfaced specifically for Remotion or for "early-childhood hand-drawn SVG craft" — that domain lives on YouTube and Smashing/Bitovi-style blogs, not Reddit.
- Exa gaps: no age-3–6-specific motion guidance, no benchmark data on Remotion interpolate vs GSAP visual parity, no TypeScript libraries surfaced for rough.js-style procedural hand-drawn perturbation. Run a follow-up Exa search if the boil utility needs prior art.

## Progress

### 2026-05-27 — gap audit + sketch-settle landing

**Status check on the original "What's working" claims:** all already in the kit at the time of this audit — `EASE.{enter,balanced,overshoot,outCubic,outQuint}` in `remotion-svg-primitives/src/motion-primitives/curves.ts`, `SPRING.{snappy,bouncy,smooth}` in the same file, anticipation in `<PopIn motion="bouncy">` via three-stop interpolate, frame-keyed boil in `<TeacherMark>`, draw-on via `pathLength:1` + `stroke-dashoffset`, cue-relative timing enforced by CLAUDE.md. No work needed — recorded so a future research pass doesn't re-prescribe what's already shipped.

**Bridged.**

- Addresses: "Stop using stroke-dashoffset alone for sketch-mark reveals. Pair the draw-on with a tiny anticipation (mark briefly grows from 90→100% scale at end) so it reads as a teacher's pen settling, not a CSS transition." (Next moves §3)
- Landed: `<TeacherMark settle={{ magnitude?: number }}>` — opt-in scale 92% → 100% over the last 15% of `drawProgress`, anchored at the mark's centroid, eased via `EASE.outCubic`. Code in `remotion-svg-primitives/src/shape-primitives/sketch.tsx` (settle math + per-branch `wrapSettle`), type exported via `shape-primitives/index.ts`. Capability registered as `CAPABILITIES.md#sketch-settle`, reach-guide added to `.agents/skills/sketch-explainer-layer/SKILL.md` §1.2.
- Default: off. Existing lessons stay pixel-identical.

**Documented (already implemented under a different name).**

- Addresses: "Bell-style asymmetric keyframe timing (50/25/25 not 33/33/33). Front-loaded then quick-settle reads as physical rather than mechanical." (What's working §)
- Landed: noted in `CAPABILITIES.md#popin-motion-variants` that the `motion="bouncy"` three-stop interpolate `[0, 0.5, 0.8, 1] → [scaleFrom, 0.9, 1.06, 1]` ≈ 50/30/20 IS the bell-style asymmetric distribution. No code change.

**Deferred / not bridged.**

- "rough.js-style procedural sketch jitter for React/SVG" (research's own follow-up TODO, Method notes §). Defer — `boil` already covers TeacherMark's perturbation need, and teaching primitives can't accept hand-drawn variation without breaking identity-invariance (`kids-eye` §1). Re-evaluate only if a future lesson needs hand-drawn-looking *teaching* art and we relax that fence.
- "Squash & stretch via CSS vars" (What's working §). Don't add — conflicts with identity-invariance for countables (a deformed dot implies the number changed). No current consumer; address as a one-off scene tweak if a specific lesson needs it.
- "`wiggle(amplitude, frequency)` parent shimmer" (TL;DR §). Don't add — `boil` already supplies "alive" feel scoped to the sketch layer where it's safe; whole-frame wiggle conflicts with `kids-eye` stability and harms caption legibility.
