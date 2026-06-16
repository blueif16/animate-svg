# Capabilities registry

This file is the **single registry of every reusable craft capability** the lesson pipeline ships with. CLAUDE.md and the skills index this file by capability id — they teach *when and why*, this file declares *what exists and where*.

> **If you are reading this for the first time:** skim the index, then read the entries for the capabilities you'll touch. Adding a new capability? Follow the protocol below.

---

## Protocol — adding a new capability

A capability is reusable craft behind a stable API: a named export, a component prop, a JSON key, a skill primitive. Bug fixes and one-off scene tweaks are NOT capabilities.

**There are two homes — pick by kind:**

### A. A barrel COMPONENT → the capability registry (source of truth, drift-gated)

A new SVG primitive (`src/shape-primitives/`), motion component (`src/motion-primitives/`), or FX component (`src/fx/`). The machine catalog `src/capabilities/` owns these — it is generated from the barrels and **gated by `.githooks/pre-commit`**, so an exported-but-unregistered component **cannot be committed**. Do NOT hand-write a markdown entry for these; register them like this:

1. **Implement + export from the barrel `index.ts`** with inline JSDoc. Opt-in features default OFF, opt-out default to legacy. A component the registry can't see via the barrel does not exist. **SVG primitives live in a FAMILY file** (`counting`/`literacy`/`interaction`/`sketch`.tsx) — a brand-new standalone shape file is a "stranded export" that *fails* `registry:check` unless you register a new family (`MODULE_KIND` + `KIND_ORDER` in `build-registry.mjs` + the `kind` union in `schema.ts` + the `KIND_ORDER` / `KIND_TITLE` in `scripts/registry/catalog-digest.mjs` — omitting this third edit silently drops the new family from the digest menu while `registry:check` still passes). Motion/fx components are one file each — any file in their barrel works.
2. **`npm run registry:build`** — discovers it and writes the catalog entry's STRUCTURE (`component`/`kind`/`source`) + the agent digest. Never hand-edit those fields.
3. **Author the entry's prose** in `src/capabilities/primitive-registry.json` — `intent`, `useWhen`, `avoidWhen`, `variants`, and flip `status` off `"undocumented"`. Re-run `npm run registry:build` (prose is carried forward by component id).
4. **`npm run registry:check`** must be green (the pre-commit hook runs it). The capability now appears in `catalog-digest.md`, visible to the next workflow run.

**Sizing — build it in, verify at true size.** A component ships a DETERMINED DEFAULT size (its `size`/`width`/`height` prop defaults); a lesson usually uses that default and only overrides to fit a tight zone — so "good size in mind" is a property of the DEFAULT, not something a lesson or a viewer tool adds later. The default must read as a **focal element at its typical multiplicity** and clear the `src/theme.ts` `sizing` floors (teaching unit ≈ 86–108px, any child-readable text ≥ 36px). Give the demo a `unit` (one instance at default size) for any primitive used in GROUPS so the gallery's **true-size view** renders one unit + the typical group at 1:1 inside the 1280×720 frame — that is where you VERIFY the real on-canvas size. If it reads too small there, **raise the component's default size and re-render** — never fake the size with a parallel `footprint` number (that approach drifted from the real default and was removed) and never just flag it. See `kids-eye` §1.6.

A `## <id>` markdown entry below is OPTIONAL for a barrel component — add one only when it needs a richer reach-guide / anti-pattern table than the catalog's one-line prose (e.g. `fen-he-diagram`).

### B. A TECHNIQUE / prop / system / JSON key → a markdown entry in this file

A new prop (`<PopIn motion>`, `<TeacherMark boil>`), a style overlay, an audio-layer key, a signal component — anything with no catalogued-barrel home. The registry only catalogs barrel components, so these live here:

1. **Implement the code** with inline JSDoc; export public types through the relevant barrel `index.ts`.
2. **Add one entry to this file** using the fixed entry schema below. Backdate `Added:` to today.
3. **Update the owning skill(s)** with a one-paragraph reach guide referencing the entry id (e.g. `see CAPABILITIES.md#sketch-boil`).
4. **Add one line** to the index below — `- [capability-id](#capability-id) — one-line description`.
5. **If always-relevant** (every lesson scene must obey): add one line to CLAUDE.md `## Capabilities` block.

When deprecating a capability:
1. Markdown entry: set `Status:` to `deprecated`, add a `Migration:` line. Registry entry: set the catalog entry's `status` to `deprecated`.
2. Leave the entry. Removal happens after one full cycle of new lessons has migrated.

### Fixed entry schema

```markdown
## <capability-id>

**Code:** path to the canonical file(s)
**Surface:** exported names, prop names, JSON keys — the public API
**Owned by:** the skill(s) that teach when/why
**Status:** stable | experimental | deprecated
**Added:** YYYY-MM-DD

### Reach guide
| When | Reach for |
|---|---|
| ... | ... |

### Anti-patterns
- ...
```

`Reach guide` is a table, not prose. `Anti-patterns` is bullets, not paragraphs. If your capability needs more than this, split it into multiple entries.

---

## Index

- [motion-vocabulary](#motion-vocabulary) — named easing curves and spring configs for scene code
- [popin-motion-variants](#popin-motion-variants) — entrance physics presets on `<PopIn>` (`"snap" | "bouncy" | "settle"`)
- [sketch-boil](#sketch-boil) — opt-in frame-keyed jitter on `<TeacherMark>` for hand-drawn liveliness
- [sketch-settle](#sketch-settle) — opt-in end-of-draw scale grow-to-1.0 on `<TeacherMark>` (pen-settle)
- [style-overlay-system](#style-overlay-system) — opt-in aesthetic overlays via <StylePreset> + skill bundle
- [style-ink-wash](#style-ink-wash) — sumi ink-wash filter chain (style #1)
- [magic-fx-library](#magic-fx-library) — sparkle / shine / glint / glow / breathe FX wrappers
- [motion-smear](#motion-smear) — <Smear> motion-blur substitute
- [motion-drag-stagger](#motion-drag-stagger) — <Drag> appendage stagger helper
- [asset-morph](#asset-morph) — `<AssetMorph>` parametric→asset magic-transition (FX-masked crossfade + unbundle reverse)
- [fen-he-diagram](#fen-he-diagram) — `<FenHeDiagram>` 分合式 part-whole notation primitive with anchor exports for identity-preserved glyph migration
- [paired-column-layout](#paired-column-layout) — `getPairedColumnPlacement()` pure helper aligning two rows into shared columns with a ragged surplus overhang
- [auto-size-to-zone](#auto-size-to-zone) — `fitUnitsToZone()` / `clusterBudget()` / `splitZone()` pure helpers computing unit size + positions from (count + zone), shared by scene and manifest
- [lesson-music-bed](#lesson-music-bed) — deterministic ducked music-bed envelope + non-looping `<LessonBgmLayer>`
- [lesson-sfx-layer](#lesson-sfx-layer) — SFX registry + `<LessonSfxLayer>` one-shot events (composer-owned frames)

---

## motion-vocabulary

**Code:** `remotion-svg-primitives/src/motion-primitives/curves.ts`
**Surface:** `EASE.{enter,balanced,overshoot,outCubic,outQuint,inOutCubic}`, `SPRING.{snappy,bouncy,smooth}`, types `EaseName` and `SpringName`
**Owned by:** `remotion-lesson-composer` (composer reach), `early-childhood-visual-taste` (intent / frame counts per move)
**Status:** stable
**Added:** 2026-05-26

### Reach guide

| When | Reach for |
|---|---|
| Default entrance / slide-in | `EASE.enter` |
| Symmetric value sweep (e.g. scale 0 → 1 → 0) | `EASE.balanced` |
| Snap accent — bounces past 1.0 before settling | `EASE.overshoot` |
| Smooth value sweep, no overshoot | `EASE.outCubic` |
| Tighter / faster-settling out | `EASE.outQuint` |
| Back-and-forth sweep | `EASE.inOutCubic` |
| Default appearance spring | `SPRING.snappy` |
| Accent moment only (countable spawn, new concept reveal) | `SPRING.bouncy` |
| Slow, camera-like move | `SPRING.smooth` |

### Anti-patterns

- Raw `Easing.bezier(0.16, 1, 0.3, 1)` literals in `src/lessons/*.tsx`. Use a name instead.
- Inline spring `config: { damping, stiffness, mass }` literals in scene code. Use `SPRING.*`.
- Reaching for `SPRING.bouncy` on every entrance — bouncy is for accent moments, not common appearances.

---

## popin-motion-variants

**Code:** `remotion-svg-primitives/src/motion-primitives/PopIn.tsx`
**Surface:** `<PopIn motion="snap" | "bouncy" | "settle">`, type `PopMotion`
**Owned by:** `remotion-lesson-composer`, `early-childhood-visual-taste`
**Status:** stable
**Added:** 2026-05-26

### Reach guide

| When | Variant |
|---|---|
| Default appearance (most countables, badges, labels) | `motion="snap"` (default — can be omitted) |
| Introduction of a NEW concept — one accent moment per video | `motion="bouncy"` (anticipation → overshoot → settle, three-stop scale 0 → 0.9 → 1.06 → 1.0) |
| Calm reveal where overshoot would feel jarring | `motion="settle"` |

`motion="bouncy"`'s three-stop interpolate `[0, 0.5, 0.8, 1] → [scaleFrom, 0.9, 1.06, 1]` is the **bell-style asymmetric keyframe distribution** (≈50/30/20 anticipation/launch/settle) that the SVG-animation research surfaced as the "physical, not mechanical" timing recipe. Don't re-key it to 50/25/25 without measuring — the existing distribution has shipped in multiple lessons.

### Anti-patterns

- `motion="bouncy"` on every countable in a counted set. Bouncy is for the one moment per video, not the rhythm.
- Hand-rolling a spring `config={{ damping, stiffness, mass }}` on PopIn. The variants already cover the cases — if none fit, add a new variant or use raw `spring()` and document.

---

## sketch-boil

**Code:** `remotion-svg-primitives/src/shape-primitives/sketch.tsx`
**Surface:** `<TeacherMark boil={{ magnitude?: number; holdFrames?: number }}>`, type `BoilConfig`
**Owned by:** `sketch-explainer-layer`, `early-childhood-visual-taste`
**Status:** stable
**Added:** 2026-05-26

### Reach guide

`magnitude` is a multiplier on the baseline ±1.5-viewBox-unit jitter. For typical mark spans (100-200 viewBox units on a 1280-wide canvas), magnitudes 3-5 give visible craft; below 2 is imperceptible. Calibrate per mark — short marks need lower magnitudes than long marks to look right.

| When | Reach for |
|---|---|
| Brief glance-mark (≤ 1.0s after draw-on completes) | omit `boil` — static jitter is fine |
| Small mark (vs-mark, short span) that lingers | `boil={{ magnitude: 2-3, holdFrames: 5-6 }}` |
| Medium mark (label-arrow, mid-length underline) | `boil={{ magnitude: 3-4, holdFrames: 5-6 }}` |
| Climax mark (wrap-arc, long underline) | `boil={{ magnitude: 4-6, holdFrames: 4-5 }}` |

`holdFrames` controls cadence. At 30fps: `4` ≈ 7.5Hz (close to Marriott's "on 2s"), `6` ≈ 5Hz (calmer). Below `3` reads as a rendering bug.

### Anti-patterns

- Boil on the teaching primitive (countables, sticks, place-value blocks). Decorative-only, same fence as 3D — identity-bearing elements stay stable.
- `magnitude ≥ 8` — wobble exceeds typical hand-drawn variation and reads as broken.
- `holdFrames ≤ 2` — dazzle, not handwork.
- `magnitude ≤ 1.5` — invisible at 1280-wide viewBox. The boil exists but cannot be seen.

---

## sketch-settle

**Code:** `remotion-svg-primitives/src/shape-primitives/sketch.tsx`
**Surface:** `<TeacherMark settle={{ magnitude?: number }}>`, type `SettleConfig`
**Owned by:** `sketch-explainer-layer`, `early-childhood-visual-taste`
**Status:** stable
**Added:** 2026-05-27

A tiny scale grow-to-1.0 across the last 15% of `drawProgress`, anchored at the mark's centroid (span midpoint or point). Pairs with the existing `stroke-dashoffset` reveal so the mark lands as a teacher lifting their pen, not a CSS transition completing. Source: `research/svg-animation-craft-2026-05-26.md` ("Pair the draw-on with a tiny anticipation").

`magnitude` is the scale rise during the settle window. `0.08` (default) = 92% → 100%. The eased ramp uses `EASE.outCubic`. Settle is **opt-in** — omitting the prop keeps the legacy linear-finish behavior for existing lessons.

### Reach guide

| When | Reach for |
|---|---|
| Climax mark (wrap-arc, the one underline that punctuates the answer) | `settle={{ magnitude: 0.08 }}` |
| Label-arrow whose tip needs to "land" on a referent | `settle={{ magnitude: 0.06 }}` |
| Glance underline that fades quickly | omit `settle` — the settle is below the perception threshold for short marks |
| vs-mark | usually omit — the two strokes already read as deliberate; settle on top is over-articulated |

Settle composes with `boil`: `boil` runs during the held portion (after `drawProgress` reaches 1.0), `settle` runs during the last 15% of the draw. They do not interfere.

### Anti-patterns

- `magnitude ≥ 0.15` — reads as a deliberate squash-and-pop, not a pen settle. Defeats the "tiny anticipation" intent.
- `settle` on a sketch mark that fades within 6 frames of `drawProgress=1` — the eye misses it.
- Combining `settle` with a non-default `pathParams.arrowheadSize` increase on `label-arrow` — the arrowhead head itself already animates in via `headReveal`; double-anticipation reads jittery.

---

## style-overlay-system

**Code:** `remotion-svg-primitives/src/styles/` (barrel `src/styles/index.ts`)
**Surface:** `<StylePreset style={...}>`, `useStyle()`, `useStyleFilter()`, `useStyleFilters()`, `useStylePalette()`, types `StyleId`, `StyleContextValue`, `StyleFilterIds`, `StylePalette`
**Owned by:** `remotion-lesson-composer`, `early-childhood-visual-taste`
**Status:** experimental
**Added:** 2026-05-27

### Reach guide

| When | Reach for |
|---|---|
| Default lesson, no aesthetic overlay | omit `<StylePreset>` — default behavior |
| Lesson wants a specific aesthetic identity | wrap scene root: `<StylePreset style="ink-wash">…</StylePreset>` |
| Scene SVG needs the modifier filter applied | `const f = useStyleFilter(); <g filter={f}>…teaching SVG…</g>` |
| Code path needs style palette tokens | `const palette = useStylePalette()` |

### Anti-patterns

- Wrapping individual primitives in `<StylePreset>`. It is a SCENE-level wrapper. One per scene.
- Hard-coding filter URLs like `filter="url(#style-ink-wash-primary)"` in scene code. Use `useStyleFilter()` so default lessons stay un-filtered.
- Adding a new style without adding the corresponding `StyleId` literal AND a `<Defs>` AND a branch in `<StylePreset>`'s switch. Pick all three or none.

---

## style-ink-wash

**Code:** `remotion-svg-primitives/src/styles/ink-wash/`
**Surface:** `<InkWashDefs seed={...}>`, `INK_WASH_FILTER_IDS`, `INK_WASH_PALETTE`, `INK_WASH_DEFAULT_SEED`
**Owned by:** `remotion-lesson-composer`, `early-childhood-visual-taste`; declarative bundle at `.agents/styles/ink-wash/`
**Status:** experimental
**Added:** 2026-05-27

### Reach guide

| When | Reach for |
|---|---|
| Lesson with calm pacing, ink/brush aesthetic intent | `<StylePreset style="ink-wash">` |
| Want paper grain on the background | add `<rect filter="url(#style-ink-wash-paper)" width=… height=…/>` |
| Need a textured ink fill on a countable | `fill="url(#style-ink-wash-brush)"` (sparingly) |
| Custom seed for procedural variation | pass `seed` to `<StylePreset>` — same seed → byte-identical render |

### Anti-patterns

- Adjusting the filter `baseFrequency`/`numOctaves`/`scale` constants without re-running source research. Numbers are sourced (blueprinter / andyjakubowski / Codrops); see `research/svg-animation-craft-round2-2026-05-27.md` §"Numbers worth verifying".
- Mixing ink-wash style with `EASE.overshoot` entrances. Snap reads against wet-edge.
- Sparkle FX in `colors.reward` under ink-wash. Use `INK_WASH_PALETTE.accent` or omit.

---

## magic-fx-library

**Code:** `remotion-svg-primitives/src/fx/` (barrel `src/fx/index.ts`)
**Surface:** `<FXDefs seed={...}>`, `<Sparkle>`, `<ShineSweep>`, `<GlintFlash>`, `<GlowPulse>`, `<Breathe originX originY bpm? amplitudeScale? phaseSeed? drift? cycleFrames? amplitude? phaseOffset?>`
**Owned by:** `remotion-lesson-composer`, `early-childhood-visual-taste`
**Status:** experimental
**Added:** 2026-05-27 (extended 2026-05-28: `<Breathe>` gained `bpm` / `amplitudeScale` / `phaseSeed` / `drift` for rule-#6 moving-hold coverage; legacy `cycleFrames` / `amplitude` / `phaseOffset` retained for back-compat)

### Reach guide

| When | Reach for |
|---|---|
| Recurring sparkle on a resting primitive | `<Sparkle x y intervalFrames=36 ... />` |
| One-shot star flash on event | `<GlintFlash x y startFrame=... />` |
| Cinematic shine across a button/card | `<ShineSweep x y width height startFrame=... />` |
| Pulsing aura under a primitive | `<GlowPulse startFrame={...}>{primitive}</GlowPulse>` |
| **Every cue's load-bearing visual group** (rule #6, no truly frozen frames) | `<Breathe originX originY bpm={15} amplitudeScale={0.005} phaseSeed="<group-id>" drift={0.5}>{group}</Breathe>` |
| Adding any FX | render `<FXDefs />` once at scene root before any FX consumer (`<Breathe>` does NOT need `<FXDefs />`) |

#### `<Breathe>` — moving-hold defaults for kids-math @ 30fps

| Param | Default | Why |
|---|---|---|
| `bpm` | 15 | One breath every 4s. Calm end of AnimSchool / MoCap 15–25 bpm range. `cycleFrames` (legacy) overrides if set. |
| `amplitudeScale` | 0.005 | 0.5% peak scale. At 1280-wide / kid-eye distance this is the visibility/identity boundary (research/ai-coordinated-voice-and-visual-2026-05-28 §2a). `amplitude` (legacy, absolute multiplier) overrides if set. |
| `phaseSeed` | none | Hashed to a deterministic phase offset so two groups breathing at the same bpm don't sync. Use the group's semantic id (e.g. `"kp1-dot-row"`, `"kp1-he-name-strip"`). `phaseOffset` (legacy, frames) overrides if set. |
| `drift` | 0 | Optional ±px y-translation at the breath crest. 0.4–0.6 maps MoCap's 1–2cm chest travel to SVG kid-eye scale. |

`<Breathe>` is **frame-keyed via `useCurrentFrame()` + `useVideoConfig()`** — same composition frame ⇒ same scale, deterministic across renders.

### Moving-hold wrap convention (rule #6)

**Every load-bearing visual group is wrapped in `<Breathe>` unless it is in active motion.** The visible result must satisfy: no frame in the rendered video has zero per-frame change.

- Identify each cue's PRIMARY load-bearing element (the thing the child is reading at that moment).
- Wrap it once at the rendering site with the defaults above and a unique `phaseSeed`.
- It is fine — and expected — to leave the wrap in place during the group's own motion: a 0.5% scale-pulse is masked by any larger animation. The wrap exists for the STATIC stretches.
- Pin `originX` / `originY` to the group's centre. For a group whose centre moves over time (e.g. a diagram that slides), pass the current centre coords each render; the breath then scales around the moving centre.

### Anti-patterns

- Wrapping a primitive in `<Sparkle>` (it's a free-standing emitter, not a wrapper). For wrapping aura, use `<GlowPulse>`.
- Forgetting `<FXDefs />` — filter IDs won't resolve.
- Stacking FX on the teaching primitive (kids-eye fence). FX is decorative-only — same fence as 3D and boil. **Exception: `<Breathe>` IS the way the teaching primitive obeys rule #6 — it does not deform identity at amplitudeScale ≤ 0.01.**
- Wrapping **non-load-bearing decoration** (sparkles, ribbons, glyph flourishes) in `<Breathe>`. They don't need breath — the eye reads them as accent, not "the thing being held still." Breath on accents looks twitchy.
- `amplitudeScale ≥ 0.015` — crosses the identity-deformation threshold; the dot looks like it's pulsing on purpose, which it isn't.
- Two breathing groups sharing the same `phaseSeed` (or omitting `phaseSeed` on both) — they sync and read as mechanical. Use distinct seeds per group.
- Multiple `<FXDefs />` in one scene — emits duplicate filter IDs (browser de-dupes silently but it's a smell).
- `cloneElement`-based FX wrappers — research brief warns this breaks style-merge under nesting (React#32531).

---

## motion-smear

**Code:** `remotion-svg-primitives/src/motion-primitives/Smear.tsx`
**Surface:** `<Smear startX startY endX endY startFrame endFrame ... />`
**Owned by:** `remotion-lesson-composer`, `early-childhood-visual-taste`
**Status:** experimental
**Added:** 2026-05-27

### Reach guide

| When | Reach for |
|---|---|
| Fast linear motion (>180 vbu/frame) that reads choppy | render `<Smear>` covering the high-velocity window in addition to the moving primitive |
| Bezier-path motion blur | not supported in this round — Smear is straight-line only |

### Anti-patterns

- `<Smear>` instead of (not in addition to) the primitive. The primitive paints on top of the smear.
- Long durations (>20 frames). Smear is a high-velocity tool; long active windows read as a translucent rectangle.
- `<Smear>` on slow moves. Below ~80 vbu/frame the smear is more distracting than the primitive's own arc.

---

## motion-drag-stagger

**Code:** `remotion-svg-primitives/src/motion-primitives/Drag.tsx`
**Surface:** `<Drag staggerFrames={...} tipOvershootMultiplier={...}>{chain of children}</Drag>`
**Owned by:** `remotion-lesson-composer`, `early-childhood-visual-taste`
**Status:** experimental
**Added:** 2026-05-27

### Reach guide

| When | Reach for |
|---|---|
| Row of countables entering together | wrap in `<Drag staggerFrames={3}>...</Drag>` |
| Appendage-like animation (tip lags root) | `<Drag staggerFrames={4} overshootProp="overshoot">…</Drag>` |

### Anti-patterns

- Children that don't accept a `startFrame` (or the configured `delayProp`). Drag is a no-op on them.
- Stagger > 8 frames per child. The chain reads as separate events, not a connected drag.
- Combining `<Drag>` with already-staggered `<PopIn>` delay props — they compound. Pick one.

---

## asset-morph

**Code:** `remotion-svg-primitives/src/motion-primitives/AssetMorph.tsx`
**Surface:** `<AssetMorph atFrame durationInFrames? direction? centerX? centerY? from to fx? fxColor? fxRadius? fxCount? settle? />`, types `AssetMorphProps`, `AssetMorphDirection`
**Owned by:** `remotion-lesson-composer` (wiring), `early-childhood-visual-taste` (when a morph earns its keep)
**Status:** experimental
**Added:** 2026-06-03

The parametric→asset magic-transition. The teaching mechanics stay PARAMETRIC (e.g. `<StickGroup>` counts and gathers); at the gather instant AssetMorph FX-masks a short crossfade into the fixed-form `<IconAsset>` so the child sees the cluster BECOME the object — and `direction="unbundle"` reverses it. Identity is preserved by co-locating `from`/`to` at one `centerX`/`centerY` with matched bbox; a `<SparkleBurst>` hides the ~10-frame seam. Lesson-agnostic: it owns ONLY the masked swap — the gather-before / fan-after motion is the caller's.

### Recipe — ten ones → one ten (and back)
1. **Gather (caller-owned, cue-relative):** drive `<StickGroup layout="bundle">`'s `bundleGap` from spread → tight across the cue's gather window.
2. **Morph:** `<AssetMorph direction="bundle" atFrame={cueOf("bundle").startFrame + GATHER_FRAMES} from={<StickGroup .../>} to={<IconAsset name="stick-bundle-roped" .../>} centerX={cx} centerY={cy} />`. Size `to`'s `width` so its visible bundle ≈ the gathered sticks' bbox.
3. **Hold:** after `atFrame` only the asset shows; wrap it in `<Breathe>` for rule #6.
4. **Unbundle:** `direction="unbundle"`, `atFrame={cueOf("unbundle").startFrame + offset}`, then fan `bundleGap` tight → spread after it. Pairs with `ConservationBundle`'s x-ray.

### Reach guide
| When | Reach for |
|---|---|
| Ten ones become one ten | `direction="bundle"`, StickGroup as `from`, `stick-bundle-roped` as `to` |
| A bundle opens back into units | `direction="unbundle"` |
| Composer fires its own SFX/FX at the swap | `fx={false}` so the SparkleBurst does not double |
| Calmer reveal, no pop | `settle={false}` |

### Anti-patterns
- A frame literal in `atFrame` — it is `cues[id].startFrame + offset`, like every other frame in scene code.
- Morphing a teaching primitive AT MULTIPLICITY where each unit still needs its own highlight — assets cannot per-index highlight; keep those parametric.
- `from`/`to` whose centers/bboxes do not match — the swap then reads as a cut, not a transformation (identity broken). Tune `width`/`centerX`/`centerY` against the render.
- `durationInFrames` > ~14 — the crossfade ghost becomes visible; the mask works only because the seam is brief.

---

## fen-he-diagram

**Code:** `remotion-svg-primitives/src/shape-primitives/counting.tsx`
**Surface:** `<FenHeDiagram whole parts={[l, r]} progress dimmed diagramWidth lineColor numberColor renderNumbers />`, helper `getFenHeDiagramAnchors(width)`, types `FenHeDiagramProps`, `FenHeDiagramAnchors`, `FenHeDiagramValue`
**Owned by:** `remotion-lesson-composer`, `early-childhood-visual-taste`
**Status:** stable
**Added:** 2026-05-27

Two-diagonal-line part-whole notation (分合式): one numeral on top, two stroke-revealable lines descending to two numerals below. Lesson-agnostic — caller passes `whole` and `parts: [left, right]`; never hardcodes Chinese strings or specific values. `progress` (0–1) drives line draw-on via `strokeDashoffset` and fades in the part-number cards. Symmetric about local x=0.

The critical capability is `renderNumbers={false}` + `getFenHeDiagramAnchors(width)`. In that mode the primitive draws ONLY the two diagonal lines and exports the three numeral anchor positions. The composer places external `<NumberCard>` instances at those anchors — by interpolating each card's `x`/`y` from a different earlier position, the same React instance migrates into the diagram. That is the load-bearing identity-preservation mechanism for "picture becomes symbol" cues (e.g. `fenheshi-intro` in kp1-fen-yu-he-intro): no fade-out/fade-in cross-fade is permitted because the kid must see ONE glyph travel, not "the chip disappears and a new number appears."

### Reach guide

| When | Reach for |
|---|---|
| Static or self-contained diagram (read cues, enumeration cues, recap) | `<FenHeDiagram whole={5} parts={[2, 3]} progress={lineProgress} />` (`renderNumbers` defaults true) |
| Diagram where numerals migrate in from elsewhere (load-bearing "picture becomes symbol" cue) | `<FenHeDiagram whole={5} parts={[2, 3]} renderNumbers={false} progress={lineProgress} />` + composer places `<NumberCard>` instances at `getFenHeDiagramAnchors(width)` |
| "Previously seen" diagram (dimmed sibling) | add `dimmed` prop |
| Row of four diagrams (e.g. 5的组成) | compose four `<FenHeDiagram>` in the scene with manually-spaced `x` props — no `FenHeRow` primitive ships, the row is a lesson-scene composition |
| Coral-tinted connecting lines (action-accent variant) | `lineColor="coral"` — only if the part-number glyphs still visibly dominate the diagram after render check |

### Anti-patterns

- Hardcoded Chinese strings or "5" / "2" / "3" inside the primitive — forbidden by the lesson-agnostic rule. Values come from props.
- Computing migration target positions by hand in the scene code instead of calling `getFenHeDiagramAnchors(diagramWidth)` — the anchor function exists exactly so reverse-engineered offsets do not drift.
- Cross-fade between an external migrating `NumberCard` and the primitive's own internally-rendered card on the same diagram. Pick one mode per glyph: external during migration (`renderNumbers={false}`) OR internal post-migration (`renderNumbers={true}`). Never both at once.
- A row of `<FenHeDiagram>` wrapped in a new `<FenHeRow>` primitive. The row IS the lesson scene's composition — abstracting it into a primitive hides per-lesson layout decisions.
- `diagramWidth < 140` at 1280-wide compositions — the numerals fall below the kids-eye body-label minimum.

---

## paired-column-layout

**Code:** `remotion-svg-primitives/src/shape-primitives/interaction.tsx`
**Surface:** `getPairedColumnPlacement(topCount, bottomCount, opts?)` → `{ top, bottom, columnX, overhangColumns, overhangRow }`; type `PairedColumnPlacement`; exported from `src/shape-primitives/index.ts`
**Owned by:** `remotion-lesson-composer` (placement reach), `visual-discipline` (when the ragged-edge layout is the right metaphor)
**Status:** experimental
**Added:** 2026-06-03

Pure positioning helper (renders nothing), in the same family as `getStickPlacement` / `getFenHeDiagramAnchors`. Aligns two rows of countables into shared vertical columns so partners sit above/below each other and the surplus overhangs as a ragged edge — the layout that makes "5 > 3" read as "two of these have no partner." Both rows are LEFT-aligned to column 0 so every overhanging item lands in a partnerless column; the whole block centers about local x=0. Deterministic and lesson-agnostic — counts and spacing come from the caller. Being a LOWERCASE export it is not a catalog component, so it carries no `primitive-registry.json` entry.

### Reach guide

| When | Reach for |
|---|---|
| Lay out a one-to-one comparison (the "more than" / "fewer than" beat) | `const p = getPairedColumnPlacement(top, bottom, { columnGap: 130, rowGap: 150 })` |
| Place the items | one countable per `p.top[i]` and `p.bottom[i]` |
| Draw the matches | `<PairConnector>` from `p.top[c]` to `p.bottom[c]` for each `c < min(top, bottom)` |
| Mark the surplus | one `<UnmatchedSlot>` at `p.columnX[c]` for `c` in `p.overhangColumns`, on the row opposite `p.overhangRow` |
| Custom spacing per lesson | pass `columnGap` / `rowGap` in `opts` — never edit the defaults |

### Anti-patterns

- Re-deriving overhang column centers by hand in scene code instead of reading `p.overhangColumns` + `p.columnX` — the helper exists so those offsets do not drift (same rule as `getFenHeDiagramAnchors`).
- Center-aligning the two rows so the surplus splits to both ends — the comparison must read as "extra on the end," not "shifted over." The helper left-aligns deliberately.
- Promoting this into a rendering `<PairedColumn>` component — the row IS the lesson scene's composition (it picks the countable, the connector style, the slot state); abstracting it hides per-lesson layout decisions, same trap as a `<FenHeRow>` primitive.
- Absolute x/y literals for the rows when this helper would compute them.

---

## auto-size-to-zone

**Code:** `remotion-svg-primitives/src/layout/fitToZone.ts` (barrel `src/layout/index.ts`)
**Surface:** `fitUnitsToZone(zone, count, opts?)` → `FitResult` ({ unit, gap, positions, rows, fits, overflowReason? }); `clusterBudget(zone, opts?)` → `ClusterFit` ({ width, height, maxUnit }); `splitZone(zone, parts, opts?)` → `ZoneRect[]`; types `ZoneRect` / `FitOpts` / `FitResult` / `ClusterFit`
**Owned by:** `remotion-lesson-composer` (calls it in layout.ts + manifest.ts), `visual-discipline` (the per-cue zone + count it consumes)
**Status:** experimental
**Added:** 2026-06-15

Pure, deterministic layout math (no React, no DOM, no measurement). A lesson declares INTENT — *N units, in THIS zone* — and `fitUnitsToZone` COMPUTES the unit size + center positions to (a) clear the kids-eye floors (`theme.sizing.teachingUnit` / `separationGapMin`) and (b) fit the zone, shrinking from `target` toward `min` only as needed; over-dense counts return `fits:false` + a concrete `overflowReason` (a real density signal — see kids-eye §1) and NEVER a sub-floor unit. The **scene and the manifest call it with identical inputs**, so on-canvas sizes and collision boxes agree by construction. This is the SIZE analogue of the component-default-size principle (kids-eye §1.6 / the §A "Sizing — build it in" clause): the default is the standalone/gallery size; this helper is how a lesson FITS that unit to a real zone+count without hand-picking pixels. Full design: `docs/proposals/auto-size-to-zone.md`.

### Reach guide

| When | Reach for |
|---|---|
| Place N uniform teaching units (a counted row, a set of dots/cards) in a zone | `fitUnitsToZone(ZONE, count)` → render each at `positions[i]` sized `unit` |
| The row overflows one line at the floor | `fitUnitsToZone(ZONE, count, { layout: "grid", maxRows: 3 })` |
| Pin the block to a zone edge instead of centering | `fitUnitsToZone(ZONE, count, { align: "start" })` |
| A CLUSTER component renders its OWN multiplicity (stick-group, part-whole) | `clusterBudget(ZONE, { pad })` → pass `{ width, height, maxUnit }` budget into the component |
| Two clusters share one zone | `splitZone(ZONE, 2)` → one sub-zone each, then a budget/fit per sub-zone |
| `fits` comes back `false` | surface `overflowReason` as a density problem to the composer/verification — reduce count, wrap, or re-zone; never render anyway |

**Cluster bounding-budget contract.** A cluster takes a BUDGET (`{ width, height, maxUnit }`), not positions, and lays out its own internals as a PURE function of (budget, count, seed) — a seeded scatter must derive from the same seed+budget so the scene and the manifest reproduce it identically. A cluster that measures itself at runtime breaks the by-construction guarantee and stays on the measured pass.

### Anti-patterns

- A hand-picked pixel `size=` / position literal for a unit that `fitUnitsToZone(zone, count)` would compute — that is the size-side frame literal (see the composer skill's layout-sizing rule).
- The manifest's `bboxAt` re-deriving sizes/positions from its OWN math instead of calling the SAME helper with the SAME inputs as the scene — that is exactly the size-mirror drift this helper removes.
- Rendering at `unit` when `fits:false` — sub-floor is forbidden; `overflowReason` is the signal, not a fallback.
- Adding React / `useCurrentFrame` / `Math.random` / measurement to `fitToZone.ts` — it must stay pure; identical inputs → byte-identical output, or scene and manifest diverge.
- Re-declaring the floors (`TEACHING_UNIT_TARGET_SIZE`, a per-lesson gap constant) — the defaults read `theme.sizing`; pass `opts` only for a genuine per-zone exception.

---

## lesson-music-bed

**Code:** `remotion-svg-primitives/src/lesson-media/audioMix.ts`, `src/lesson-media/LessonBgmLayer.tsx`
**Surface:** `bedVolume(frame, windows, total)`, `spansToWindows(spans)`, constants `BED_UNDUCKED_LINEAR` / `DUCK_FACTOR` / `DUCK_ATTACK_FRAMES` / `DUCK_RELEASE_FRAMES` / `EDGE_FADE_FRAMES` / `SFX_DEFAULT_LINEAR`, type `NarrationWindow`; `<LessonBgmLayer bed windows totalFrames />`
**Owned by:** `lesson-sound-design` (when / which bed), `remotion-lesson-composer` (wiring)
**Status:** experimental
**Added:** 2026-05-29

The music bed. `bedVolume` is a deterministic frame-keyed envelope: it starts at the un-ducked level, multiplies DOWN through every narration window (product-over-windows, so back-to-back windows compose and the bed only rises in gaps), then applies a 0.75s lesson-edge fade. `<LessonBgmLayer>` renders a NON-looping `<Html5Audio>` driven by it — deliberately bypassing the kit's looping `AudioLayer`. Numbers sourced in `research/music-sound-design.md` §2.1; design in `docs/proposals/sound-layer-integration.md` §4.

### Reach guide

| When | Reach for |
|---|---|
| Add a bed to a lesson (Complete wrapper) | `<LessonBgmLayer bed={audioCues.bed} windows={spansToWindows(voiceoverSpans)} totalFrames={total} />` |
| Convert ASR spans to windows | `spansToWindows(voiceoverSpans)` |
| Tune mix levels | edit the constants in `audioMix.ts` — lesson-agnostic, never per lesson |

### Anti-patterns

- Routing the bed through the kit's `AudioLayer` — it loops and has no edge fade. Use `<LessonBgmLayer>`.
- A bed asset SHORTER than the composition — it would loop / cut off audibly. Beds are authored ≥ lesson length.
- Frame literals in `windows` / `totalFrames` — they come from `voiceoverSpans` and the reconciled timeline.
- Editing the dB / ramp constants per lesson. They are mix constants; the only per-lesson choice is the bed KEY.

---

## lesson-sfx-layer

**Code:** `remotion-svg-primitives/src/lesson-media/sfx.ts`, `src/lesson-media/LessonSfxLayer.tsx`
**Surface:** `<LessonSfxLayer events={SfxEvent[]} />`, type `SfxEvent`, `SFX_REGISTRY`, `sfxSrc`, `sfxDefaultVolume`, `semitonesToPlaybackRate`, type `SfxSound` (`"pop" | "chime" | "whoosh" | "tick" | "ta-da"`)
**Owned by:** `lesson-sound-design` (which beats / sounds), `remotion-lesson-composer` (frames)
**Status:** experimental
**Added:** 2026-05-29

One-shot SFX. The composer builds an `SfxEvent[]` where each `fromFrame` derives from `cueFrames(id) + layout.ts` offsets (NEVER a literal); `<LessonSfxLayer>` renders each as a `<Sequence from><Html5Audio/></Sequence>`. SFX sit below narration and do NOT duck. `semitones` pitch-shifts via `playbackRate` (the rising-pitch-per-count effect). Vocabulary + levels: `research/music-sound-design.md` §2.4.

### Reach guide

| When | Reach for |
|---|---|
| Sonify a `<PopIn>` entrance | `{ sound: "pop", fromFrame: cueFrames("x").from + POP_OFFSET }` |
| Count steps, rising pitch | one event per step, `semitones` ascending (e.g. step `i` → `2 * i`) |
| Transition whoosh | `{ sound: "whoosh", fromFrame: transitionStart }` |
| The single win | `{ sound: "ta-da", fromFrame: cueFrames("success").from + OFFSET }` — once per lesson |

### Anti-patterns

- A `fromFrame` literal. It is `cueFrames(id) + named offset`, the same as visuals.
- More than one motivated SFX per beat, or any SFX over instruction narration.
- Ducking SFX — they sit above the bed, below narration; they do not duck.
- Adding a sound key not in `SfxSound` without also adding the asset + a `SFX_REGISTRY` row.

## signal-focus-pointer

**Code:** remotion-svg-primitives/src/lessons/_signal/FocusPointer.tsx
**Surface:** `<FocusPointer cueId anchorX anchorY direction? variant? onsetOffsetFrames? frame cueStartFrame cueEndFrame size? gap? id? />`; `FocusPointerSpec`
**Owned by:** lesson-pedagogy (signaling principle), remotion-lesson-composer
**Status:** stable
**Added:** 2026-05-29

Signaling-principle cue (Mayer): a finger/arrow that reveals toward a cue's focal
element ~6 frames after narration onset, holds, then fades before the cue ends.
Composes `<PointerHandArrow>` + `EASE.enter`; lives in `_signal/` (leaf) to avoid
the motion→shape import cycle. Tagged via `measureProps` so `--measured` confirms
it covers nothing; it is marks-zone chrome (marks∩objects allowed), NOT a
load-bearing manifest element.

### Reach guide
| When | Reach for |
| Direct the eye to the cue's focal object | `<FocusPointer cueId="x" anchorX={cx} anchorY={cy} direction="down" frame={frame} cueStartFrame={cueOf("x").startFrame} cueEndFrame={cueOf("x").endFrame} />` |
| Point from the side | `direction="left" \| "right" \| "up"` (pointer auto-offsets opposite the point dir) |

### Anti-patterns
- A pointer on EVERY cue — signaling competes with itself; one focal cue per beat.
- Absolute frame literals — always pass `cueOf(id).startFrame/.endFrame`.
- Registering it as a load-bearing manifest element — it is signaling chrome.
