# Auto-size-to-zone — components size themselves to (count + zone), deterministically

**Status:** PROPOSAL — awaiting approval (design-first; no code until approved). · 2026-06-14
**Owner waves:** visual-design (declares zones + counts) → composer (consumes the helper) ; manifest/gate (shares the helper).
**Motivation:** kill per-lesson size tuning AND make collision detection certain — without bumping component default values up and down.

## Problem

A component's on-canvas footprint is `unitSize × count`, and **count is the lesson's choice**. So:
- A single fixed default unit size can't be right for every cue — 6 dots fit at 96px, 12 dots at 96px overflow the band. A fixed number just *moves* the tuning into per-lesson `size=` overrides.
- Because sizes are hand-picked per lesson, the bbox manifest's `bboxAt()` is a hand-mirrored copy of the scene's math — two places that can drift, and the cheap **linear** collision pass is only as trustworthy as that mirror. Today the expensive **measured** Chromium pass exists largely to catch that drift.
- The result is exactly the churn we want gone: tuning `size=` per lesson, then re-checking collisions.

## Goal / non-goals

**Goal:** a lesson declares **intent** — *N units, in this zone* — and the unit size + positions are **computed** deterministically to (a) clear the kids-eye floors and (b) fit the zone, shrinking from target toward the floor only as needed; overflow at the floor is surfaced as a real density problem, not silently rendered too small. The **same** computation feeds the scene and the manifest, so collision boxes are exact by construction.

**Non-goals:** changing the cue timeline, audio, or removing the measured-render gate (it stays as the ground-truth backstop — it just stops catching size-mirror drift). Not every component is a uniform row (scatter/bundle/cluster keep their own internal layout — see *Layout modes*).

## Design

### 1. The pure helper — `fitUnitsToZone()`

A pure function (no DOM, no measurement) in a new `src/layout/fitToZone.ts`:

```ts
type ZoneRect = { x: number; y: number; w: number; h: number };
type FitOpts = {
  targetUnit?: number;  // default sizing.teachingUnit.target (96)
  minUnit?: number;     // default sizing.teachingUnit.min (86) — the floor
  minGap?: number;      // default sizing.separationGapMin (43)
  align?: "center" | "start";   // within the zone
  layout?: "row" | "grid";      // grid wraps into rows
  maxRows?: number;             // grid only
};
type FitResult = {
  unit: number;                          // resolved unit size (px == canvas units)
  gap: number;
  positions: { x: number; y: number }[]; // CENTER of each unit, in canvas coords
  rows: number;
  fits: boolean;                         // false => can't fit N at minUnit even wrapped
  overflowReason?: string;               // e.g. "12 units need 1320px > zone 1120px at 86px floor"
};

function fitUnitsToZone(zone: ZoneRect, count: number, opts?: FitOpts): FitResult;
```

Algorithm (row; grid is the same per row after choosing a row count):
1. Solve the largest unit that fits one row: `unit = min(targetUnit, (zone.w - (count-1)*minGap) / count, zone.h)`.
2. If `unit ≥ minUnit` → done at that size, `fits: true`.
3. Else (`layout: "grid"`): pick the fewest rows `r ≤ maxRows` so `ceil(count/r)` per row fits at `≥ minUnit`; recompute.
4. If still `< minUnit` → `fits: false` + `overflowReason`. **This is a real density signal** (kids-eye §1: "drop elements or simplify the metaphor"), surfaced LOUDLY, never rendered sub-floor.

`positions` are returned in **canvas coordinates** (anchored in the zone per `align`), so the scene maps `positions[i] → <Component size={unit} x={pos.x} y={pos.y}/>` with zero extra math.

### 2. Single source of truth for collisions

Both the **scene** and the **manifest** call `fitUnitsToZone(zone, count, opts)` with identical inputs:
- the scene renders each unit at `positions[i]` at `unit`;
- the manifest derives each unit's `bboxAt()` from the same `positions[i]` + `unit`.

→ bboxes are **exact by construction**; the linear collision pass is certain; the measured pass becomes a true backstop (catches easing overshoot / sub-element overlap, not size-mirror drift). This is the "declared contract over reactive guard" rule applied to sizing.

### 3. The rule lives in `theme.ts` (centralized, no magic numbers)

Add to `sizing` the constants kids-eye §1 currently states in prose, so the helper's defaults are the single source:

```ts
teachingUnit: { target: 96, min: 86, hardMin: 58 }, // 12–15% / 8% of 720 short side
separationGapMin: 43,                                // 6% of 720 short side
```

Lessons and the helper read these; no lesson re-declares `TEACHING_UNIT_TARGET_SIZE`.

### 4. Component contract

- **Standalone default stays** — every component keeps a sensible default `size` (= `sizing.teachingUnit.target`) so single-use and the gallery render well with no props. This is the "built with good size in mind" default.
- **Atoms** (countable-object, small-stick, number-card, …) take a `size` and render one unit; the caller uses `fitUnitsToZone` to place N of them. No internal multiplicity.
- **Count-bearing / cluster components** (unit-block, stick-group, part-whole-composer, …) keep their own internal layout but accept a **bounding budget** (`fitWidth`/`fitHeight` or `maxUnit`) and self-size their internals deterministically from it (a seeded scatter must derive from the same seed+budget so scene and manifest agree).
- **Optional ergonomic wrapper** `<ZoneRow zone count renderItem/>` that calls the helper + places children, for the common row case.

### 5. Gallery tie-in

The true-size view's "group" row already shows the typical multiplicity; with the helper it shows the unit **fitted to a representative zone (e.g. `ZONE_OBJECTS`) at a representative count** — i.e. exactly the size a real cue would render. The gallery and the lessons then agree by construction.

## Rollout (incremental, each phase shippable)

1. **Helper + constants + unit tests** — `fitToZone.ts` (pure) + `theme.sizing.teachingUnit/separationGapMin` + tests for fit/shrink/wrap/overflow. No lesson touched.
2. **Prove on one lesson** — refactor `kptest-fenyuhe-six` `layout.ts` to derive dot size/positions from `fitUnitsToZone(ZONE_OBJECTS, 6)` instead of `TEACHING_UNIT_TARGET_SIZE`/`dotGap`; confirm the render is unchanged-or-better.
3. **Manifest shares the helper** — that lesson's `manifest.ts` derives bboxes from the same call; confirm linear `collisionCount` matches the measured pass (drift gone).
4. **Composer skill + CAPABILITIES** — `remotion-lesson-composer` + `CAPABILITIES.md` document "declare count+zone, never pixels; size is computed"; visual-design declares per-cue counts alongside zones.
5. **Component defaults → theme target** — set each atom's default `size` to `sizing.teachingUnit.target`; verify the ~10 default-reliant lesson usages still render (they now get a focal default for free).

## Performance

Pure arithmetic — negligible. Net **win**: deterministic sizes move collision resolution onto the cheap **linear** manifest pass and reduce reliance on the expensive **measured** Chromium pass. No render-time cost; the helper runs at module-eval / build, identical to the constants it replaces.

## Risks & limits

- **Non-row layouts** (scatter, bundle, clusters) aren't a single `fitUnitsToZone` row — they take a bounding budget and self-layout. The determinism rule: a component's internal layout MUST be a pure function of (size/budget, count, seed) so the manifest can reproduce it. Components that measure themselves at runtime break the certainty and stay on the measured pass.
- **Overflow is a feature, not a failure** — `fits:false` means the cue is over-dense; it must surface to the composer/verification as a density problem (reduce count, wrap, or re-zone), never render sub-floor.
- **Migration** — phased; existing explicit `size=` lessons keep working until refactored. Default bumps (phase 5) are the only ripple, gated on re-verifying the affected lessons.

## Open questions (for approval discussion)

1. Helper-only (`fitUnitsToZone` in `layout.ts`) vs also the `<ZoneRow>` wrapper — ship both, or start helper-only?
2. Do counts get declared in visual-design (per-cue `count`) as a first-class field, or inferred by the composer from the pedagogy/storyboard?
3. Cluster components (part-whole, bundle): budget-prop (`maxUnit`) now, or defer to a later phase?
