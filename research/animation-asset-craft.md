# Animation asset craft — synthesis brief

_scope: ingested `yt_svg_animation` corpus (Learn SVG through 24 examples; SVGator grouped-pivot / easing character animation; Maxon motion-graphics fundamentals; StudioBinder "12 Principles of Animation") synthesized WITH the two prior SVG-animation-craft briefs, mapped onto OUR motion primitives and the NEW primitives the techniques imply • regenerated 2026-05-29 (the earlier write of this file failed; this is the canonical version)._

> **Read order.** This brief is the *consolidated craft layer*. It does NOT re-derive what `research/svg-animation-craft-2026-05-26.md` (round 1) and `research/svg-animation-craft-round2-2026-05-27.md` (round 2) already shipped — it folds those in by reference and adds only what the `yt_svg_animation` video corpus contributes on top. Where a technique is already in the kit, this brief says so and points at the capability id rather than re-prescribing it.

---

## TL;DR (what the video corpus adds on top of rounds 1–2)

1. **The 12 principles are the spine; we already cover ~8 of them.** StudioBinder's 12-principles breakdown maps cleanly onto kit capabilities: *squash&stretch / anticipation / follow-through / slow-in-slow-out / arcs / secondary action / timing / exaggeration / staging / appeal* are all expressible today via `PopIn` (anticipation+overshoot+settle), `EASE.*` / `SPRING.*` (slow-in-slow-out + timing), `Drag` (follow-through / overlapping action), `Smear` (timing of fast motion), `Breathe` (moving hold = the "appeal/aliveness" of stillness). The two principles we DON'T have a primitive for are **staging** (which is a composer/visual-design discipline, not a primitive) and **arcs** (a real gap — see new primitive #1 `<ArcMove>`).
2. **Grouped pivot / transform-origin is the single most underexploited SVG technique.** The SVGator-style character corpus is built almost entirely on *nested `<g>` groups each with its own pivot* (`transform-box: fill-box; transform-origin: …`), rotated/scaled about that pivot — a swinging arm pivots at the shoulder, not the canvas origin. Our primitives place via `cx/cy/scale/rotation` but there is no reusable "rotate this child about an arbitrary local pivot, staggered down a chain" helper beyond what `<Drag>` does for entrance stagger. This is the mechanism behind arcs, appendage motion, and any "jointed" reveal. See new primitive #2 `<Pivot>`.
3. **"Animate one property, drive many" + grouped pivots = the whole SVGator workflow.** Round 1's "one progress source, derive everything" is exactly how the SVGator corpus keys character motion: one timeline scalar drives a group's rotation, a child's counter-rotation, and an opacity — so the motion stays coherent. We already enforce this (cue-relative `progress`); the corpus validates it and shows the *nesting* discipline (each articulated part is its own `<g>` so pivots compose).
4. **Maxon motion-graphics fundamentals = staging + value hierarchy, not new mechanics.** The Maxon material is about *what to animate and in what order* (establish the frame, move one thing, let it rest, then move the next) — it reinforces the pedagogy brief's coherence/one-new-element rule and round-2's "rest beat", and adds nothing mechanically new. Its load-bearing contribution: **never animate position and scale and color simultaneously on first reveal** — pick the one that carries meaning; the others are secondary action layered later.
5. **Draw-on is a cliché unless paired with settle — already fixed; the corpus confirms the cure.** "Learn SVG through 24 examples" leans hard on `stroke-dasharray`/`stroke-dashoffset` draw-on (the canonical SVG-line reveal). Rounds 1–2 already flagged generic draw-on as visual cliché and shipped `sketch-settle` (pen-lands scale 92→100%). The corpus adds one concrete refinement we have NOT shipped: **`pathLength="1"` normalization** so draw-on timing is path-length-independent (a long underline and a short tick reveal at the same *rate* without per-mark math). Small, worth adding to `<TeacherMark>`/`<DrawPath>`. See new primitive #3 note.

---

## Principle-by-principle map: technique → OUR primitive → gap

| 12-principle (StudioBinder) | Corpus technique | Already in kit | Capability id | Gap / new primitive |
|---|---|---|---|---|
| **Squash & stretch** | transform-origin bottom, scaleY/scaleX inverse | partial (deliberately fenced for countables — deform implies the number changed) | — | NOT for teaching primitives (identity-invariance, `kids-eye`). OK on decorative FX only. No new primitive. |
| **Anticipation** | shrink ~90% before launch | yes | `popin-motion-variants` (`motion="bouncy"` three-stop 0→0.9→1.06→1) | none |
| **Staging** | empty frame, one focal object, lead the eye | discipline, not code | (pedagogy `kids-eye` / `visual-discipline`) | none (composer concern) |
| **Straight-ahead vs pose-to-pose** | keyframe interpolation | yes (we are pose-to-pose by construction — `interpolate` between keyed states) | `motion-vocabulary` | none |
| **Follow-through & overlapping action** | appendage drag, tip lags + overshoots most | yes (entrance stagger) | `motion-drag-stagger` (`<Drag>`) | `<Drag>` staggers *start frames*; corpus also offsets the *overshoot peak* per item and rotates about a *pivot*. See `<Pivot>`. |
| **Slow-in & slow-out** | eased curves on every keyframe | yes | `motion-vocabulary` (`EASE.*`, `SPRING.*`) | none |
| **Arcs** | motion follows a curved path, never a straight line | **NO** | — | **NEW `<ArcMove>`** (#1) — biggest mechanical gap |
| **Secondary action** | a splash/blob/glint accompanies the primary move | yes (FX) | `magic-fx-library` (`Sparkle`/`GlintFlash`/`GlowPulse`), `motion-smear` | partially — a "ground-impact" secondary blob on `PopIn` landing is not a primitive. Low priority. |
| **Timing** | frame counts set weight; fast motion needs a smear | yes | `motion-smear` (`<Smear>`), `motion-vocabulary` | none |
| **Exaggeration** | overshoot amplitude graduated to importance | yes | `popin-motion-variants`, `<Drag tipOvershootMultiplier>` | none |
| **Solid drawing (volume/weight)** | consistent light, grouped pivots imply structure | discipline + pivots | — | served by `<Pivot>` (#2) |
| **Appeal (aliveness)** | nothing is ever truly still; moving holds | yes | `magic-fx-library` (`<Breathe>`) | none — `<Breathe>` is exactly this (rule #6) |

**Net:** of the 12, the kit mechanically covers 10. The one real mechanical gap is **arcs** (`<ArcMove>`); the one underexploited-but-expressible technique is **grouped pivots** (`<Pivot>` would make it reusable instead of hand-rolled per scene).

---

## What the video corpus adds (concrete, lesson-agnostic)

### A. Grouped pivot is how articulated SVG motion actually works
The SVGator-style corpus animates a character by nesting `<g>` groups, each with `transform-box: fill-box; transform-origin: <local pivot>`, then rotating/scaling each group about its *own* pivot. A waving hand is: forearm `<g>` rotates at the elbow, hand `<g>` (child) rotates at the wrist, each on its own eased curve, staggered 2–4 frames (the Frank-and-Ollie chain from round 2). The key insight the corpus makes concrete: **pivot is a property of the group, composed by nesting** — you never compute global rotation math, you let SVG's transform stack do it. For us this is the missing reusable wrapper: a `<Pivot>` that takes a local `(px, py)` and an angle/scale and applies the correct `transform-origin`, so composer code can articulate a primitive (e.g. a balance-scale beam tilting at its fulcrum, a clock hand, a "lid opening") without per-scene transform-origin bookkeeping.

### B. Arcs: straight-line motion is the tell of amateur animation
Both the StudioBinder principles video and the Maxon fundamentals stress that natural motion follows an arc — a hand reaching, a ball thrown, an object settling all travel curved paths. Our `<FollowPath>` exists (motion along a supplied path) but there is no ergonomic "move from A to B along an arc with a sensible default curvature" primitive; composer code currently lerps `x`/`y` linearly between two points (a straight line). This is the highest-value *new* mechanic from the corpus.

### C. "Learn SVG through 24 examples" — the primitive vocabulary checklist
The 24-examples corpus is a tour of the SVG-animation toolbox; cross-checking it against our kit:
- `stroke-dasharray`/`dashoffset` draw-on → **have** (`<DrawPath>`, `<TeacherMark>`); add `pathLength="1"` normalization.
- `<animateMotion>` / motion path → **have** (`<FollowPath>`).
- `<feTurbulence>`+`<feDisplacementMap>` texture/bleed → **have** (ink-wash style, FX defs).
- gradient-stop animation (shine sweep) → **have** (`<ShineSweep>`).
- `<clipPath>`/`<mask>` reveal → **partial** (used inside primitives; no standalone "wipe-reveal" primitive — low priority).
- `<pattern>` fills → **have** (ink-wash brush).
- SMIL `<animate>` discrete seed (boil) → **have** (`sketch-boil`).
- viewBox animation (camera pan/zoom) → **NO standalone primitive** — composer does it ad hoc. Candidate `<ViewBoxCamera>` only if a lesson needs a true pan/zoom; defer (decorative, and `SceneFrame` already frames the canvas).

### D. Maxon: value hierarchy on first reveal
One load-bearing rule worth encoding as a composer discipline (not a primitive): **on an element's first entrance, animate exactly ONE of {position, scale, opacity, color} as the meaning-carrier; layer the rest as quieter secondary action.** This is the motion-side twin of the pedagogy brief's "one new element per cue" rule (F9) and round-2's rest beat. It prevents the "everything zooms-spins-fades at once" look that reads as busy to a 5-year-old.

---

## NEW reusable primitives the corpus implies (ranked)

1. **`<ArcMove>`** — move a child from `(x0,y0)` to `(x1,y1)` along a quadratic arc with a default perpendicular bulge (sign + magnitude proportional to distance), driven by one cue-relative `progress`. Closes the only mechanical 12-principles gap (arcs). Composes with `EASE.*`. Lesson-agnostic. Effort: small (it's `<FollowPath>` + an auto-generated control point). **Build when the first lesson needs A→B object travel** (e.g. moving a counter into a ten-frame, a chip into a fen-he diagram) — until then, `<FollowPath>` with a hand-supplied path covers it. Demand-gate it via the coverage map.
2. **`<Pivot>`** — wrap a child and rotate/scale it about a local `(px,py)` pivot using `transform-box: fill-box; transform-origin`. Makes articulated/jointed motion (balance beam, clock hand, opening lid, swinging pointer) reusable instead of per-scene transform-origin math. Composes with `<Drag>` for chains. Effort: small. **Build when the first "jointed" teaching object appears** (a balance scale for comparison lessons is the obvious first consumer). Demand-gate.
3. **`pathLength="1"` normalization on draw-on** — NOT a new primitive; a prop/behavior on `<DrawPath>` / `<TeacherMark>` so draw-on rate is path-length-independent. Effort: trivial. Ship opportunistically next time the sketch layer is touched. Low risk, default-off to keep existing marks pixel-identical.

Everything else the corpus shows is already shipped (rounds 1–2 + CAPABILITIES.md). **Default answer remains: compose existing primitives.** A new primitive ships only when a lesson names the gap (CLAUDE.md Wave 3 rule) — `<ArcMove>` and `<Pivot>` are *candidates with named near-term consumers*, not speculative builds.

---

## Cross-references (do not duplicate — these already shipped)

- Easing/anticipation/overshoot/settle, spring presets, boil, draw-on — round 1, all in kit (`motion-vocabulary`, `popin-motion-variants`, `sketch-boil`, `sketch-settle`).
- Appendage drag, smear-not-blur, sparkle/shine/glint FX, ink-wash style modifier, raster+SVG hybrid — round 2, all in kit (`motion-drag-stagger`, `motion-smear`, `magic-fx-library`, `style-ink-wash`).
- Moving holds / breathing / no-frozen-frames — `ai-coordinated-voice-and-visual-2026-05-28.md` rule #6 + `magic-fx-library`'s `<Breathe>`.
- Word-anchored visual leads (200ms rule) — `script-animation-coordination-2026-05-28.md` §3 + `word-level-asr-design-2026-05-29.md`.

## Deep-links (yt_svg_animation + craft channels)

> `yt_svg_animation` confirmed via `mcp__yt-rag__search` this run: 5 videos / 132 chunks (StudioBinder, SVGator, Maxon Training Team, Hunor Márton Borbély "Learn SVG through 24 examples", plus a Figma+Jitter SaaS-motion video). Timestamp anchors below are pulled live.

**yt_svg_animation (live-pulled anchors):**
- StudioBinder — "12 Principles of Animation Explained": squash&stretch + constant-volume rule — https://youtu.be/tYc1yUt0IeA?t=94 and `?t=184`
- StudioBinder — anticipation (windup precedes major action; legibility) — https://youtu.be/tYc1yUt0IeA?t=275
- **StudioBinder — slow-in/slow-out as an S-curve + ARCS ("most natural action moves in arcs", the only mechanical kit gap) — https://youtu.be/tYc1yUt0IeA?t=827**
- **SVGator — grouped-pivot workflow: group elements, place the group's origin point (shoulder/elbow/wrist), rotate about it; sync child groups via skew, stagger 2ms — https://youtu.be/T-Bb03-aiF8?t=5 and `?t=189`**
- SVGator — per-group easing applied across selected keyframes (ease-in-out-cubic), delay a child for sloshing secondary action — https://youtu.be/T-Bb03-aiF8?t=463
- Maxon Training Team — "Motion Graphics Fundamentals (1/4)" (staging, value hierarchy) — namespace `yt_svg_animation`, video `Motion Graphics Fundamentals (1/4) – Create with Maxon`
- Hunor Márton Borbély — "Learn SVG through 24 examples" (SVG-animation toolbox tour: dasharray draw-on, animateMotion, feTurbulence, gradient stops, clipPath, pattern) — namespace `yt_svg_animation`

**Craft channels (carried, verified):**
- Alan Becker — Frank-and-Ollie appendage drag (elbow→forearm→hand; tip lags + overshoots most) — https://youtu.be/uDqjIdI4bF4?t=538
- Alan Becker — smear-frame replaces motion blur on 2D — https://youtu.be/uDqjIdI4bF4?t=808
- Alan Becker — slow-in/slow-out via spline curves on every keyframe — https://youtu.be/uDqjIdI4bF4?t=628
- Ben Marriott — easing changes acceleration without changing duration (linear=robot) — https://youtu.be/jFbRZZmMW7c?t=1458
- Ben Marriott — boil loop, 4–8 frames; faster=chaotic, slower=calm — https://youtu.be/OlGjmrB__cM?t=0
- Ben Marriott — anticipation: shrink to 90% then overshoot then settle — https://youtu.be/n24aTp1-jK4?t=1373
- School of Motion — keyable sketchy-stroke path effect — https://youtu.be/IxbAukgSZHw?t=1999

> Note (corpus correction): the 4 corpus titles named in the task brief map onto the *actually-ingested* 5 videos above; "SVGator grouped-pivot/easing character animation" = SVGator's "Animate an SVG Character with Rotation, Skew, and Easing". The grouped-pivot evidence (origin-point placement per group) directly justifies new primitive `<Pivot>` (#2).

## Progress

- 2026-05-29 — brief regenerated (the earlier write failed to land). Synthesizes the `yt_svg_animation` corpus with the two prior svg-animation-craft briefs; mapped 12 principles → kit capabilities; identified two named-consumer new-primitive candidates (`<ArcMove>` for arcs, `<Pivot>` for grouped-pivot articulation) and one trivial enhancement (`pathLength="1"` draw-on normalization). No code changed. Next: demand-gate `<ArcMove>`/`<Pivot>` through the coverage map (see `docs/proposals/primitive-factory.md`) rather than speculatively building.
