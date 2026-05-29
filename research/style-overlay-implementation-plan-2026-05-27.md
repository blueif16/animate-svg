# Implementation plan — Style overlay system + Magic FX library + Motion smoothness primitives

**Owner of execution.** A single sub-agent (recommend `general-purpose`) reads this file end-to-end and implements every section under "Files to create / modify." This document is the contract: every path, prop, JSDoc, default value, filter constant, and capability-registry entry is specified. If the sub-agent finds a real obstacle (e.g., a path doesn't exist, an API signature doesn't match), it STOPS and reports — it does NOT improvise.

**Source of truth.** `research/svg-animation-craft-round2-2026-05-27.md` §"Style overlay architecture options" Proposal 1 and §"Magic FX library — separate capability." Numeric filter values from §"Numbers worth verifying." Pattern guidance from §"What's working" — particularly "FX wrapping convention is sibling-Defs + filter URL, NOT cloneElement."

**Scope.** Three additive capabilities, behind opt-in props/wrappers. Default lesson behavior is byte-for-byte identical.

1. **Style overlay system** — declarative bundle at `.agents/styles/<id>/`, runtime wrapper at `src/styles/<id>/`. Ships with one style: `ink-wash`.
2. **Magic FX library** — `src/fx/` with five effects (`sparkle`, `shine`, `glint`, `glow-pulse`, `breathe`). Sibling-Defs pattern.
3. **Motion smoothness primitives** — `<Smear>` (motion-blur substitute) and `<Drag>` (appendage stagger).

**Non-goals.**
- Implementing styles beyond `ink-wash`. Ink-wash is the round-1 deliverable. Other styles (e.g., chalk, watercolor) are explicitly deferred — the architecture must accept them without code change, but only ink-wash files ship now.
- Implementing per-primitive ink-wash variants (Proposal 2 in the research brief). Proposal 1 only — filter modifier wraps every child, no per-primitive branching this round.
- React-Rough-Fiber-class tree rewrite (Proposal 3). Explicitly deferred.
- AI-image-gen asset prep pipeline (BiRefNet integration, etc.). Documented in research brief as a separate follow-up; not in this plan.
- Migrating existing lessons to ink-wash. Build the system. Migration is a separate task, demoed in §"Verification" with ONE lesson re-rendered under ink-wash as the acceptance artifact.

**Disciplines (non-negotiable, enforced by the sub-agent).**
- Defaults preserve existing behavior. `<PopIn>` with no new props, `<TeacherMark>` with no new props, a lesson with no `Style.` field in brief.md, all render identically to today.
- Public types re-exported through barrel `index.ts` per the CAPABILITIES.md protocol (the sub-agent reads `.agents/CAPABILITIES.md` Protocol §1 before writing exports).
- JSDoc on every public surface (component, prop, type, hook).
- No frame literals introduced anywhere in scene code. Motion timing parameters in primitives are durations / frame-counts that derive from caller-supplied cue boundaries.
- Stable-seed determinism: anywhere a "random" value appears in style/FX rendering, it must be seeded via `mulberry32` (already at `src/shape-primitives/shared.tsx`) or a callsite-supplied `seed` prop. Remotion renders deterministically per frame; non-seeded `Math.random()` is forbidden.
- One unified barrel update: add new exports to the existing `motion-primitives/index.ts`, `shape-primitives/index.ts`, and create one NEW barrel `src/styles/index.ts` and `src/fx/index.ts`.
- No emoji in code or markdown unless quoting research-brief content.

---

## Architecture overview

```
brief.md  ──(reads field "Style.")──►  Wave 2 visual-design  ──(declares in visual-design.md §StyleOverlay)──►  Wave 4 composer
                                                                                                                  │
                                                                                                                  ▼
                                                                                            <StylePreset style={...}>
                                                                                              ├── <StyleDefs/>             (renders <svg w=0 h=0><defs>...</defs>)
                                                                                              ├── <StyleContext.Provider>  (filterIds + palette)
                                                                                              └── children                 (the existing SceneFrame + lesson SVG)
                                                                                                       │
                                                                                                       └── lesson-internal:
                                                                                                            const filterId = useStyleFilter();
                                                                                                            <g filter={filterId ? `url(#${filterId})` : undefined}>
                                                                                                              {/* all teaching SVG below */}
                                                                                                            </g>
```

**Key shapes.**
- `<StylePreset style="ink-wash">` is a root wrapper, sits OUTSIDE `<SceneFrame>` in the lesson scene.
- It injects a hidden `<svg width="0" height="0">` containing all `<defs>` (filters, patterns, palette gradients) — this is the production-canon pattern (`react-glass-ui` `<LiquidGlassFilters>`).
- It provides a React context `StyleContext` with `{ activeStyle, filterIds, palette }`.
- The lesson scene's main `<svg>` body wraps its teaching content in a single `<g filter={...}>` keyed off `useStyleFilter()`.
- Default style (`"default"` or omitted): `<StylePreset>` is a passthrough; `useStyleFilter()` returns `undefined`; no filter attribute is emitted; behavior is identical to today.

**Why not auto-wrap inside `<StylePreset>`?** Because lessons mix HTML (SceneFrame's title) and SVG (the teaching <svg>); a wrapper that auto-emits a `<g filter>` would only apply to SVG and would have to inspect children. Cleaner: explicit opt-in at the SVG root via a `useStyleFilter()` hook. One line added per scene.

**Stable-seed determinism.** `feTurbulence` has an explicit `seed` attribute. Each style bundle declares its `seed` constants. Animated noise uses `<animate attributeName="seed" calcMode="discrete">` per the coolbutuseless/svgfilter pattern surfaced in the research brief — frame-keyed without React re-renders.

---

## Files to create / modify

### Section 1 — Style overlay system (runtime)

#### 1.1 `remotion-svg-primitives/src/styles/types.ts` (NEW)

```ts
// Public type surface for the style overlay system. All consumers reach for
// these types via the `src/styles` barrel.

/**
 * Identifier of a registered style overlay. "default" means no overlay (the
 * canonical lesson appearance). Adding a new style means adding a new
 * literal to this union AND a corresponding entry in `STYLE_REGISTRY`.
 */
export type StyleId = "default" | "ink-wash";

/**
 * Filter IDs published by a style for opt-in consumption via `filter="url(#id)"`.
 * Each style declares which IDs it publishes; consumers reach via `useStyleFilter()`
 * (single primary filter) or `useStyleFilters()` (full record, advanced).
 */
export type StyleFilterIds = {
  /** Primary modifier filter — wraps the entire teaching tree. */
  primary?: string;
  /** Optional secondary filters for callsite use (e.g., paper grain only). */
  [key: string]: string | undefined;
};

/**
 * Palette token overrides published by a style. Maps theme color keys to
 * style-tuned values. Consumers read via `useStylePalette()`.
 */
export type StylePalette = Partial<{
  background: string;
  ink: string;
  accent: string;
  paper: string;
  textNavy: string;
}>;

export type StyleContextValue = {
  activeStyle: StyleId;
  filterIds: StyleFilterIds;
  palette: StylePalette;
};
```

#### 1.2 `remotion-svg-primitives/src/styles/StyleContext.tsx` (NEW)

```tsx
import { createContext, useContext } from "react";
import type { StyleContextValue, StyleFilterIds, StylePalette } from "./types";

const defaultContext: StyleContextValue = {
  activeStyle: "default",
  filterIds: {},
  palette: {},
};

export const StyleContext = createContext<StyleContextValue>(defaultContext);

/** Read the full style context. Primary consumer hook. */
export const useStyle = (): StyleContextValue => useContext(StyleContext);

/**
 * Return the primary filter URL string (e.g., `url(#style-ink-wash-primary)`)
 * or `undefined` when no style is active. Designed to be dropped directly into
 * `filter={...}` on the scene's root `<g>`.
 */
export const useStyleFilter = (): string | undefined => {
  const { filterIds } = useContext(StyleContext);
  return filterIds.primary ? `url(#${filterIds.primary})` : undefined;
};

/** Return the full filterIds record for callsites that need a secondary filter. */
export const useStyleFilters = (): StyleFilterIds =>
  useContext(StyleContext).filterIds;

/** Return the active style's palette overrides. Empty object under "default". */
export const useStylePalette = (): StylePalette =>
  useContext(StyleContext).palette;
```

#### 1.3 `remotion-svg-primitives/src/styles/StylePreset.tsx` (NEW)

```tsx
import type { ReactNode } from "react";
import { StyleContext } from "./StyleContext";
import { InkWashDefs, INK_WASH_FILTER_IDS, INK_WASH_PALETTE } from "./ink-wash";
import type { StyleContextValue, StyleId } from "./types";

type StylePresetProps = {
  /** Style to apply. "default" or omitted = passthrough, zero behavior change. */
  style?: StyleId;
  /**
   * Optional per-instance seed override for procedural style elements (paper
   * grain, ink jitter). Same seed → byte-identical render. Defaults to the
   * style's bundled `defaultSeed`.
   */
  seed?: number;
  children: ReactNode;
};

const DEFAULT_CONTEXT: StyleContextValue = {
  activeStyle: "default",
  filterIds: {},
  palette: {},
};

/**
 * Root style overlay wrapper. Place OUTSIDE <SceneFrame> in the lesson scene.
 * Injects shared <defs> and publishes filter IDs + palette via StyleContext.
 * Default style is a passthrough — no DOM emitted, no context override.
 *
 * Pattern: sibling-Defs + filter URL. The "convert any child to target style"
 * effect is achieved by the lesson code reading useStyleFilter() and applying
 * it to the teaching <g>. See research/svg-animation-craft-round2-2026-05-27.md.
 */
export const StylePreset = ({
  style = "default",
  seed,
  children,
}: StylePresetProps) => {
  if (style === "default") {
    return <>{children}</>;
  }

  if (style === "ink-wash") {
    const value: StyleContextValue = {
      activeStyle: "ink-wash",
      filterIds: INK_WASH_FILTER_IDS,
      palette: INK_WASH_PALETTE,
    };
    return (
      <StyleContext.Provider value={value}>
        <InkWashDefs seed={seed} />
        {children}
      </StyleContext.Provider>
    );
  }

  // Exhaustiveness fence — surface unknown style at runtime.
  const exhaustive: never = style;
  throw new Error(`Unknown style: ${exhaustive}`);
};
```

#### 1.4 `remotion-svg-primitives/src/styles/index.ts` (NEW barrel)

```ts
export { StylePreset } from "./StylePreset";
export {
  StyleContext,
  useStyle,
  useStyleFilter,
  useStyleFilters,
  useStylePalette,
} from "./StyleContext";
export type {
  StyleContextValue,
  StyleFilterIds,
  StyleId,
  StylePalette,
} from "./types";
export { InkWashDefs, INK_WASH_FILTER_IDS, INK_WASH_PALETTE } from "./ink-wash";
```

#### 1.5 `remotion-svg-primitives/src/styles/ink-wash/palette.ts` (NEW)

```ts
import type { StylePalette } from "../types";

/**
 * Ink-wash palette: monochrome ink on warm paper. Tokens map to the same
 * semantic keys as `theme.colors`, but with style-tuned values. Sourced
 * from kako-jun/blueprinter sumi theme. See
 * research/svg-animation-craft-round2-2026-05-27.md §"Numbers worth verifying".
 */
export const INK_WASH_PALETTE: StylePalette = {
  background: "#F4ECDC", // warm rice-paper cream
  paper: "#EFE6D2",      // slightly darker grain
  ink: "#1F2230",        // near-black ink
  accent: "#7A2E2A",     // muted vermilion seal accent
  textNavy: "#1F2230",   // override of theme.colors.textNavy
};

/** Default deterministic seed for ink jitter / paper grain across this style. */
export const INK_WASH_DEFAULT_SEED = 17;
```

#### 1.6 `remotion-svg-primitives/src/styles/ink-wash/InkWashDefs.tsx` (NEW)

This is the core of the style. Filter constants come **verbatim** from the research brief.

```tsx
import { INK_WASH_DEFAULT_SEED } from "./palette";

type InkWashDefsProps = {
  /** Seed for feTurbulence. Default INK_WASH_DEFAULT_SEED for byte-identical renders. */
  seed?: number;
};

/**
 * Renders the hidden <svg> containing the ink-wash filter chain in <defs>.
 * Constants are sourced from kako-jun/blueprinter (sumi), andyjakubowski
 * (crispness restore), Codrops/Sara Soueidan (paper grain).
 * See research/svg-animation-craft-round2-2026-05-27.md §"Ink wash filter chain".
 */
export const InkWashDefs = ({ seed = INK_WASH_DEFAULT_SEED }: InkWashDefsProps) => (
  <svg
    aria-hidden="true"
    height={0}
    style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    width={0}
  >
    <defs>
      {/* Primary: ink bleed (turbulence-driven displacement + slight blur + crispness restore). */}
      <filter
        id="style-ink-wash-primary"
        x="-5%"
        y="-5%"
        width="110%"
        height="110%"
      >
        <feTurbulence
          baseFrequency="0.06"
          numOctaves="5"
          seed={seed}
          stitchTiles="stitch"
          type="fractalNoise"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="15"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        <feGaussianBlur in="displaced" stdDeviation="1.2" result="bled" />
        {/* Restore alpha crispness so the bleed reads as wet edges, not defocus. */}
        <feComponentTransfer in="bled" result="crisped">
          <feFuncA type="discrete" tableValues="0 1 1 1" />
        </feComponentTransfer>
      </filter>

      {/* Secondary: paper grain background (Codrops recipe). */}
      <filter
        id="style-ink-wash-paper"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
      >
        <feTurbulence
          baseFrequency="0.8"
          numOctaves="6"
          seed={seed + 1}
          stitchTiles="stitch"
          type="fractalNoise"
          result="grain"
        />
        <feDiffuseLighting in="grain" lightingColor="#FFFFFF" surfaceScale="2" result="lit">
          <feDistantLight azimuth="45" elevation="60" />
        </feDiffuseLighting>
        <feComposite in="lit" in2="SourceGraphic" operator="in" result="masked" />
        <feBlend in="SourceGraphic" in2="masked" mode="multiply" />
      </filter>

      {/* Brush stroke pattern — diagonal ink texture for stroked paths under ink-wash. */}
      <pattern
        id="style-ink-wash-brush"
        height="8"
        patternUnits="userSpaceOnUse"
        width="8"
      >
        <rect fill="#1F2230" height="8" width="8" />
        <path
          d="M0 4 L8 4"
          stroke="#000000"
          strokeOpacity="0.18"
          strokeWidth="0.8"
        />
      </pattern>
    </defs>
  </svg>
);

export const INK_WASH_FILTER_IDS = {
  primary: "style-ink-wash-primary",
  paper: "style-ink-wash-paper",
  brush: "style-ink-wash-brush",
} as const;
```

**Verbatim filter constants** (do NOT tune without re-running research):
- `feTurbulence baseFrequency=0.06 numOctaves=5 seed=<input> type=fractalNoise stitchTiles=stitch`
- `feDisplacementMap scale=15 xChannelSelector=R yChannelSelector=G`
- `feGaussianBlur stdDeviation=1.2` (sumi mid-range from blueprinter)
- `feComponentTransfer feFuncA type=discrete tableValues="0 1 1 1"` (andyjakubowski crispness restore)
- Paper: `baseFrequency=0.8 numOctaves=6` + `feDiffuseLighting surfaceScale=2` + `feDistantLight azimuth=45 elevation=60` (Codrops)

#### 1.7 `remotion-svg-primitives/src/styles/ink-wash/index.ts` (NEW barrel)

```ts
export { InkWashDefs, INK_WASH_FILTER_IDS } from "./InkWashDefs";
export { INK_WASH_PALETTE, INK_WASH_DEFAULT_SEED } from "./palette";
```

#### 1.8 `remotion-svg-primitives/src/index.ts` — re-export `src/styles` barrel

Append:
```ts
export * from "./styles";
```

---

### Section 2 — Magic FX library

Pattern: each FX is either (a) a sibling-Defs `<...Defs>` component that publishes filter IDs the consumer references, or (b) an overlay primitive that renders on top of the target. NO `cloneElement` HOC.

#### 2.1 `remotion-svg-primitives/src/fx/FXDefs.tsx` (NEW)

Single hidden `<svg>` containing all FX filter chains. Consumer renders ONCE at scene root.

```tsx
type FXDefsProps = {
  /** Deterministic seed for any turbulence-driven FX (glow noise, glint twinkle). */
  seed?: number;
};

/**
 * Renders shared filter/gradient defs for the magic FX library. Render ONCE
 * per scene at root (alongside or after <StylePreset>). Consumers then
 * reference filter IDs via `filter="url(#fx-...)"` on target SVG elements,
 * or by placing FX components (Sparkle, ShineSweep, GlintFlash, GlowPulse,
 * Breathe) which read these defs by name.
 *
 * Pattern: sibling-Defs + filter URL. See research brief §"FX wrapping
 * convention is sibling-Defs + filter URL, NOT cloneElement."
 */
export const FXDefs = ({ seed = 7 }: FXDefsProps) => (
  <svg
    aria-hidden="true"
    height={0}
    style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    width={0}
  >
    <defs>
      {/* Glow pulse: soft outer blur composited under the source. */}
      <filter id="fx-glow-pulse" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blurred" />
        <feMerge>
          <feMergeNode in="blurred" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Glint twinkle: animated turbulence to perturb a tiny star at random. */}
      <filter id="fx-glint" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence
          baseFrequency="0.4"
          numOctaves="2"
          seed={seed}
          type="fractalNoise"
          result="noise"
        >
          <animate
            attributeName="seed"
            calcMode="discrete"
            dur="0.6s"
            keyTimes="0;0.5;1"
            repeatCount="indefinite"
            values={`${seed};${seed + 31};${seed + 71}`}
          />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
      </filter>

      {/* Shine sweep gradient: white-to-transparent stop, animated offset. */}
      <linearGradient id="fx-shine-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="white" stopOpacity="0" />
        <stop offset="50%" stopColor="white" stopOpacity="0.65" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);
```

#### 2.2 `remotion-svg-primitives/src/fx/Sparkle.tsx` (NEW)

Repeats `SparkleBurst` at a configurable interval — round-2 deliverable. Wraps existing primitive.

```tsx
import { useCurrentFrame } from "remotion";
import { SparkleBurst } from "../motion-primitives/SparkleBurst";
import { colors } from "../theme";

type SparkleProps = {
  /** Anchor x/y in viewBox units. */
  x: number;
  y: number;
  /** Frames between sparkle emits. Default 36 (≈ 1.2s @ 30fps). */
  intervalFrames?: number;
  /** Frames per individual sparkle burst. Default 24. */
  burstFrames?: number;
  /** Sparkle radius. Default 64. */
  radius?: number;
  /** Sparkle count per burst. Default 8. */
  count?: number;
  /** Sparkle color. Default colors.reward. */
  color?: string;
  /** Active window start frame (absolute). Default 0. */
  startFrame?: number;
  /** Active window end frame (absolute, exclusive). Default Infinity. */
  endFrame?: number;
};

/**
 * Recurring sparkle emitter over a frame window. Wraps SparkleBurst with a
 * frame-modulo trigger. Deterministic — same frame → same sparkle.
 *
 * Use to add "magic" presence on a resting primitive without changing its
 * identity. See research brief §"Sparkle = animated turbulent-displace on a
 * glitter layer + card-wipe shards".
 */
export const Sparkle = ({
  x,
  y,
  intervalFrames = 36,
  burstFrames = 24,
  radius = 64,
  count = 8,
  color = colors.reward,
  startFrame = 0,
  endFrame = Number.POSITIVE_INFINITY,
}: SparkleProps) => {
  const frame = useCurrentFrame();
  if (frame < startFrame || frame >= endFrame) return null;
  const localFrame = frame - startFrame;
  const cycleStart = Math.floor(localFrame / intervalFrames) * intervalFrames;
  return (
    <SparkleBurst
      color={color}
      count={count}
      durationInFrames={burstFrames}
      radius={radius}
      startFrame={startFrame + cycleStart}
      x={x}
      y={y}
    />
  );
};
```

#### 2.3 `remotion-svg-primitives/src/fx/ShineSweep.tsx` (NEW)

```tsx
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../motion-primitives/curves";

type ShineSweepProps = {
  /** Bounding box of the target — sweep is clipped to this. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Sweep cycle start frame (absolute). */
  startFrame: number;
  /** Total cycle duration (frames). One sweep per cycle. Default 60. */
  durationInFrames?: number;
  /** Tilt of the sweep band, degrees. Default -22 (top-right to bottom-left). */
  angleDeg?: number;
  /** Sweep band width as fraction of target width. Default 0.3. */
  bandWidth?: number;
};

/**
 * White diagonal shine sweep clipped to a rectangular target. Composes via
 * mix-blend-mode "screen" on the SVG <g>. References fx-shine-gradient from
 * <FXDefs>. See research brief §"Cinematic shine sweep" (SonduckFilm).
 *
 * Opacity envelope: 0 → 0.6 → 0 across the cycle; gradient offset slides
 * 0% → 120% so the shine exits past the target before resetting.
 */
export const ShineSweep = ({
  x,
  y,
  width,
  height,
  startFrame,
  durationInFrames = 60,
  angleDeg = -22,
  bandWidth = 0.3,
}: ShineSweepProps) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = interpolate(progress, [0, 0.25, 0.75, 1], [0, 0.6, 0.6, 0], {
    easing: EASE.outCubic,
  });
  const offsetPct = interpolate(progress, [0, 1], [-20, 120]);
  const bandPx = width * bandWidth;

  return (
    <g opacity={opacity} style={{ mixBlendMode: "screen" }}>
      <g transform={`translate(${x + width / 2} ${y + height / 2}) rotate(${angleDeg}) translate(${-(x + width / 2)} ${-(y + height / 2)})`}>
        <rect
          fill="url(#fx-shine-gradient)"
          height={height * 1.5}
          width={bandPx}
          x={x + (width * (offsetPct / 100))}
          y={y - height * 0.25}
        />
      </g>
    </g>
  );
};
```

#### 2.4 `remotion-svg-primitives/src/fx/GlintFlash.tsx` (NEW)

A tiny four-point star flash on a point. References `fx-glint` filter.

```tsx
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

type GlintFlashProps = {
  x: number;
  y: number;
  startFrame: number;
  durationInFrames?: number;
  size?: number;
  color?: string;
};

/**
 * Single glint flash — a 4-point star that grows in, holds, fades out.
 * Use sparingly to spark on an event ("answer found", "match made"). For
 * a recurring sparkle, use <Sparkle> instead.
 *
 * Total envelope: scale 0 → 1 → 0 across durationInFrames; opacity 0 → 1 → 0.
 */
export const GlintFlash = ({
  x,
  y,
  startFrame,
  durationInFrames = 18,
  size = 24,
  color = colors.sunshine,
}: GlintFlashProps) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const scale = interpolate(progress, [0, 0.4, 1], [0, 1, 0]);
  const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  // 4-point star path centered at origin.
  const s = size;
  const t = size * 0.18;
  const d = `M 0 ${-s} L ${t} ${-t} L ${s} 0 L ${t} ${t} L 0 ${s} L ${-t} ${t} L ${-s} 0 L ${-t} ${-t} Z`;

  return (
    <g
      filter="url(#fx-glint)"
      opacity={opacity}
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <path d={d} fill={color} />
    </g>
  );
};
```

#### 2.5 `remotion-svg-primitives/src/fx/GlowPulse.tsx` (NEW)

```tsx
import { interpolate, useCurrentFrame } from "remotion";

type GlowPulseProps = {
  /** Bounding box of target — used for opt-in opacity envelope only; filter applies via consumer's filter prop. */
  startFrame: number;
  durationInFrames?: number;
  /** Number of pulses across the duration. Default 1. */
  pulses?: number;
  children: React.ReactNode;
};

/**
 * Wraps children in a group that pulses via filter="url(#fx-glow-pulse)"
 * with an opacity envelope. The glow filter itself is static; the pulse is
 * delivered by opacity modulation.
 *
 * Children render normally; the glow is rendered as a sibling pre-pass via
 * `filter` on the wrapper group. Existing children render on top.
 */
export const GlowPulse = ({
  startFrame,
  durationInFrames = 36,
  pulses = 1,
  children,
}: GlowPulseProps) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const cycle = durationInFrames / pulses;
  const phase = ((localFrame % cycle) / cycle); // 0..1
  const opacity = interpolate(phase, [0, 0.5, 1], [0, 0.55, 0]);

  return (
    <>
      <g filter="url(#fx-glow-pulse)" opacity={opacity}>
        {children}
      </g>
      {children}
    </>
  );
};
```

#### 2.6 `remotion-svg-primitives/src/fx/Breathe.tsx` (NEW)

```tsx
import { interpolate, useCurrentFrame } from "remotion";

type BreatheProps = {
  /** Anchor — child scales around this point. */
  originX: number;
  originY: number;
  /** Cycle length in frames. Default 60 (2s @ 30fps). */
  cycleFrames?: number;
  /** Peak scale at the inhale crest. Default 1.035 (3.5% bigger). */
  amplitude?: number;
  /** Starting phase offset in frames. Stagger multiple primitives by varying this. */
  phaseOffset?: number;
  children: React.ReactNode;
};

/**
 * Wraps children with a slow sinusoidal scale pulse around (originX, originY).
 * Looks like idle breathing on a resting primitive. Use to make a paused
 * scene feel alive without changing identity.
 *
 * Default amplitude 1.035 is below kids-eye's "do not deform identity" threshold.
 * Stagger phase across multiple breathing primitives so they don't sync.
 */
export const Breathe = ({
  originX,
  originY,
  cycleFrames = 60,
  amplitude = 1.035,
  phaseOffset = 0,
  children,
}: BreatheProps) => {
  const frame = useCurrentFrame();
  const phase = (((frame + phaseOffset) % cycleFrames) / cycleFrames) * Math.PI * 2;
  const scale = 1 + (amplitude - 1) * Math.sin(phase) * 0.5 + (amplitude - 1) * 0.5;
  return (
    <g
      transform={`translate(${originX} ${originY}) scale(${scale}) translate(${-originX} ${-originY})`}
    >
      {children}
    </g>
  );
};
```

#### 2.7 `remotion-svg-primitives/src/fx/index.ts` (NEW barrel)

```ts
export { FXDefs } from "./FXDefs";
export { Sparkle } from "./Sparkle";
export { ShineSweep } from "./ShineSweep";
export { GlintFlash } from "./GlintFlash";
export { GlowPulse } from "./GlowPulse";
export { Breathe } from "./Breathe";
```

#### 2.8 `remotion-svg-primitives/src/index.ts` — re-export `src/fx` barrel

Append:
```ts
export * from "./fx";
```

---

### Section 3 — Motion smoothness primitives

#### 3.1 `remotion-svg-primitives/src/motion-primitives/Smear.tsx` (NEW)

```tsx
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "./curves";

type SmearProps = {
  /** Start of motion (viewBox coords). */
  startX: number;
  startY: number;
  /** End of motion. */
  endX: number;
  endY: number;
  /** Motion window — Smear is visible only during this range. */
  startFrame: number;
  endFrame: number;
  /** Stroke / fill color. Defaults to currentColor. */
  color?: string;
  /** Thickness of the smear band. Default 12. */
  thickness?: number;
  /** Tail opacity (head is at full color, tail fades). Default 0.65. */
  opacity?: number;
};

/**
 * Motion-blur substitute. Renders a single arc-shape <path> connecting start
 * and end positions during a high-velocity window. Cheaper and more
 * stylistically faithful to 2D animation than CSS filter:blur(). Becker's
 * "smear frame" technique — see research/svg-animation-craft-round2-2026-05-27.md.
 *
 * The smear's geometry is a stadium-shaped path:
 *   M startX startY L endX endY L endX+perpX*t endY+perpY*t L startX+perpX*t startY+perpY*t Z
 * tail opacity is achieved via a linearGradient along the band.
 *
 * Render this in addition to the moving primitive — the primitive paints on
 * top of the smear at the head end.
 */
export const Smear = ({
  startX,
  startY,
  endX,
  endY,
  startFrame,
  endFrame,
  color = "currentColor",
  thickness = 12,
  opacity = 0.65,
}: SmearProps) => {
  const frame = useCurrentFrame();
  if (frame < startFrame || frame > endFrame) return null;
  const localProgress = (frame - startFrame) / Math.max(1, endFrame - startFrame);
  const envelopeOpacity =
    interpolate(localProgress, [0, 0.2, 0.8, 1], [0, opacity, opacity, 0], {
      easing: EASE.outCubic,
    });

  const dx = endX - startX;
  const dy = endY - startY;
  const len = Math.max(1, Math.hypot(dx, dy));
  const px = (-dy / len) * (thickness / 2);
  const py = (dx / len) * (thickness / 2);

  const d = `M ${startX + px} ${startY + py} L ${endX + px} ${endY + py} L ${endX - px} ${endY - py} L ${startX - px} ${startY - py} Z`;

  return <path d={d} fill={color} opacity={envelopeOpacity} />;
};
```

#### 3.2 `remotion-svg-primitives/src/motion-primitives/Drag.tsx` (NEW)

```tsx
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type DragProps = {
  /** Frames to stagger each successive child by. Default 3. */
  staggerFrames?: number;
  /**
   * Overshoot graduation: tip-child gets `tipOvershootMultiplier`× the root
   * child's overshoot. Pass-through prop name customizable via `overshootProp`.
   */
  tipOvershootMultiplier?: number;
  /** Name of the prop on children to add stagger to. Default "startFrame". */
  delayProp?: string;
  /** Optional: name of the prop on children that controls overshoot amplitude. */
  overshootProp?: string;
  children: ReactNode;
};

/**
 * Frank-and-Ollie appendage drag helper. Takes an ordered chain of children
 * (root → tip) and stagger-shifts their `startFrame` prop by `staggerFrames`
 * each, optionally graduating overshoot amplitude root → tip.
 *
 * Caller passes children that accept the named delay prop (default `startFrame`).
 * Drag clones each with `delayProp += staggerFrames * index`.
 *
 * If an overshootProp is supplied AND the child has a numeric value for it,
 * the value scales linearly from 1.0× at root to `tipOvershootMultiplier`× at tip.
 *
 * See research/svg-animation-craft-round2-2026-05-27.md §"Appendage drag".
 */
export const Drag = ({
  staggerFrames = 3,
  tipOvershootMultiplier = 1.12,
  delayProp = "startFrame",
  overshootProp,
  children,
}: DragProps) => {
  const arr = Children.toArray(children);
  const n = arr.length;
  return (
    <>
      {arr.map((child, i) => {
        if (!isValidElement(child)) return child;
        const baseDelay = (child.props as Record<string, unknown>)[delayProp];
        const nextDelay =
          typeof baseDelay === "number" ? baseDelay + staggerFrames * i : staggerFrames * i;
        const overrides: Record<string, unknown> = { [delayProp]: nextDelay };
        if (overshootProp) {
          const baseOver = (child.props as Record<string, unknown>)[overshootProp];
          if (typeof baseOver === "number") {
            const tipFrac = n > 1 ? i / (n - 1) : 0;
            const mult = 1 + (tipOvershootMultiplier - 1) * tipFrac;
            overrides[overshootProp] = baseOver * mult;
          }
        }
        return cloneElement(child as ReactElement, overrides);
      })}
    </>
  );
};
```

**Note on `cloneElement`:** the research brief warns against `cloneElement` for FX *style merging*. `<Drag>` does NOT merge style props — it overrides numeric scalar props (`startFrame`, optional overshoot multiplier). The brittleness only applies to style/CSS prop merging across nested wrappers. Acceptable usage here.

#### 3.3 `remotion-svg-primitives/src/motion-primitives/index.ts` — update barrel

Append exports:
```ts
export { Smear } from "./Smear";
export { Drag } from "./Drag";
```

---

### Section 4 — Skill bundle (declarative side of the style)

#### 4.1 `.agents/styles/ink-wash/STYLE.md` (NEW)

Concise overview — readable by Wave 1/2 subagents and humans.

Required content (sub-agent writes this, do not modify):

```markdown
# Style: ink-wash

**Style ID.** `ink-wash`
**Aesthetic.** Sumi-e ink wash on warm rice paper. Monochrome ink, restricted palette, soft wet edges, paper grain.
**When to choose.** Calm, contemplative lessons. Chinese/Japanese language or cultural content. Single-narrator pacing. Avoid for high-energy comparison lessons where overshoot/snap reads against the medium.
**Modifier reach.** Applies a single SVG <filter> chain to all teaching content via `<StylePreset style="ink-wash">`. Default behavior of every primitive is preserved; only the visual surface changes.
**Companion files.** palette.md / animation.md / background.md / strokes.md / capabilities.md — all in this folder.
**Runtime.** `remotion-svg-primitives/src/styles/ink-wash/` — see CAPABILITIES.md#style-ink-wash.
```

#### 4.2 `.agents/styles/ink-wash/palette.md` (NEW)

```markdown
# Ink-wash palette

| Token | Hex | Use |
|---|---|---|
| background | #F4ECDC | scene cream (overrides `colors.cream`) |
| paper | #EFE6D2 | secondary surface, card backgrounds |
| ink | #1F2230 | all stroke/ink (overrides `colors.textNavy`) |
| accent | #7A2E2A | vermilion seal — accent only, ≤ 5% of frame area |
| textNavy | #1F2230 | text override (same as ink) |

**Discipline.** No bright sunshine/sky/coral. Ink-wash is mono + accent. If a primitive renders in `colors.coral`, the modifier remaps it via the filter chain's `feColorMatrix` (de-saturation 0.0 for pure sumi). For brighter pop, the secondary palette `accent` is the ONLY warm color.

**Runtime constants.** `remotion-svg-primitives/src/styles/ink-wash/palette.ts` exports `INK_WASH_PALETTE`. Sourced from kako-jun/blueprinter sumi theme.
```

#### 4.3 `.agents/styles/ink-wash/animation.md` (NEW)

```markdown
# Ink-wash motion vocabulary

**Inheritance.** Ink-wash inherits the full default motion vocabulary (`EASE.*`, `SPRING.*`, `<PopIn>`, `<TeacherMark>`). Identity-invariance still holds.

**Tweaks for this style.**
- Prefer `EASE.outCubic` / `EASE.outQuint` over `EASE.overshoot` for entrances. Wet-edge ink reads against snap accents.
- Prefer `SPRING.smooth` over `SPRING.snappy` for camera-class moves.
- `<PopIn motion="bouncy">` allowed, but cap to 1 per video — the bouncy three-stop interpolate's overshoot looks like ink splash if used liberally.
- Boil and settle on `<TeacherMark>` look excellent under ink-wash. Increase `boil.magnitude` by ~25% over default (e.g., 4 → 5) to compensate for the bleed softening edges.
- Breathing micro-loop (`<Breathe>`) at amplitude 1.02–1.025 — lower than default; the medium itself already implies softness.
```

#### 4.4 `.agents/styles/ink-wash/background.md` (NEW)

```markdown
# Ink-wash background

**Canvas.** `INK_WASH_PALETTE.background` (#F4ECDC) — warm rice-paper cream. Replaces `colors.cream` everywhere via the `useStylePalette()` hook in `<SceneFrame>`.

**Grain.** Paper grain is a `<rect>` covering the full canvas with `filter="url(#style-ink-wash-paper)"`. The composer can opt to add it or not; default is OFF (one filter per scene is sufficient; doubling the filter cost is unnecessary on a calm style).

**Border / mat.** None. Ink-wash sits on full-bleed paper.

**Decorative corner shapes.** SceneFrame's current corner circles (sunshine/mint/sky/coral) should be hidden under ink-wash. Achieve by gating them on `useStyle().activeStyle === "default"` in SceneFrame.tsx.
```

#### 4.5 `.agents/styles/ink-wash/strokes.md` (NEW)

```markdown
# Ink-wash strokes

**Stroke width.** Default `strokeWidth` of 4 (TeacherMark default) reads fine. Optionally bump to 5 for climax marks.
**Stroke color.** All strokes pass through the primary filter; original `stroke` color is displaced + blurred + alpha-thresholded. No per-stroke change needed.
**Stroke caps.** Keep `strokeLinecap="round"` and `strokeLinejoin="round"` everywhere — the filter chain assumes round terminals and edges artifact on miter joins.
**Brush pattern.** Available but not default. `INK_WASH_FILTER_IDS.brush` is a diagonal-line ink pattern usable as a `fill="url(#style-ink-wash-brush)"` on countables for the rare case a primitive wants a textured ink fill. Use sparingly.
```

#### 4.6 `.agents/styles/ink-wash/capabilities.md` (NEW)

```markdown
# Ink-wash capabilities map

**Inherits from.** All default capabilities — see `.agents/CAPABILITIES.md`.

**Tuning.**
| Capability | Ink-wash tuning |
|---|---|
| motion-vocabulary | Prefer `EASE.outCubic`, `SPRING.smooth`. Avoid `EASE.overshoot` for entrances. |
| popin-motion-variants | `motion="bouncy"` capped at 1/video. |
| sketch-boil | Boost `magnitude` ~25% to compensate for filter softening. |
| sketch-settle | Recommended on climax marks; reads as the brush lifting. |

**Style-only capabilities.**
- `style-ink-wash` (this file) — see CAPABILITIES.md#style-ink-wash.

**Refused.**
- Bright accent palettes (coral, sky, sunshine) outside the published palette tokens.
- Sparkle FX at default `colors.reward` — under ink-wash, sparkle uses `INK_WASH_PALETTE.accent` or is omitted entirely.
```

#### 4.7 `.agents/styles/README.md` (NEW)

```markdown
# Style overlays

Opt-in aesthetic overlays applied on top of the default lesson pipeline. The default has no aesthetic identity; styles bring one.

Each style is a folder with six files (this is the contract — extending requires updating the docs and the registry):

- `STYLE.md` — one-page overview: aesthetic, when to choose, runtime location
- `palette.md` — color tokens and discipline rules
- `animation.md` — motion vocabulary tweaks vs default
- `background.md` — canvas, grain, decorative refusals
- `strokes.md` — stroke width / color / caps / patterns
- `capabilities.md` — inheritance + tuning + refusals

Runtime lives in `remotion-svg-primitives/src/styles/<style-id>/`. The composer wraps the scene root in `<StylePreset style="<id>">`.

**To add a new style:** copy this folder structure, add a `StyleId` literal in `src/styles/types.ts`, add a `<Defs>` component, extend `<StylePreset>`'s switch, register in CAPABILITIES.md.

**Style selection.** In `brief.md`, set `**Style.** <style-id>`. Omitting the field or setting `default` means no overlay.

**Current styles.**
- `ink-wash` — Sumi-e ink on warm rice paper.
```

---

### Section 5 — brief.md schema + scaffold + skill updates

#### 5.1 `CLAUDE.md` — update brief schema

Edit `CLAUDE.md` lines 7–30 (the brief schema). Add the **Style.** field after **Continuity.** and before **Narration notes.**. Final schema:

```markdown
**Brief schema.** Seven sections, all unique info; trim or extend as needed but keep it minimal:

```markdown
# <lesson-id>

**Audience.** <age, language>
**Length.** <seconds band>
**Builds on.** <prior lesson ids | none>
**Style.** <style-id | default>   <!-- NEW -->

## Knowledge point
…
```
```

Then update lines 78–84 (`## Capabilities`) to add lines for the new capabilities, and add a new `## Styles` block AFTER `## Capabilities` and BEFORE `## 3D effects — decorative only`:

```markdown
## Styles

Optional aesthetic overlays on top of the default pipeline. Default lessons have no aesthetic identity; styles bring one. Pick at the brief level via `**Style.** <style-id>`. Skill bundle lives at `.agents/styles/<style-id>/`; runtime at `remotion-svg-primitives/src/styles/<style-id>/`. Composer wraps the scene root in `<StylePreset>`. Available styles:

- **ink-wash** — Sumi-e ink on warm rice paper.

See `.agents/styles/README.md` for the bundle contract.
```

Append to `## Capabilities` index:
- `**style-overlay-system** — <StylePreset> + StyleContext + skill bundle at .agents/styles/`
- `**style-ink-wash** — sumi ink filter chain (primary + paper grain + brush pattern)`
- `**magic-fx-library** — <Sparkle>/<ShineSweep>/<GlintFlash>/<GlowPulse>/<Breathe> + <FXDefs>`
- `**motion-smear** — <Smear> as motion-blur substitute`
- `**motion-drag-stagger** — <Drag> appendage stagger helper`

#### 5.2 `.agents/CAPABILITIES.md` — add five new entries

Sub-agent appends FIVE entries following the fixed schema in CAPABILITIES.md, in this order. Use today's date `2026-05-27` on every `Added:` line. Update the Index block first.

Index additions:
```markdown
- [style-overlay-system](#style-overlay-system) — opt-in aesthetic overlays via <StylePreset> + skill bundle
- [style-ink-wash](#style-ink-wash) — sumi ink-wash filter chain (style #1)
- [magic-fx-library](#magic-fx-library) — sparkle / shine / glint / glow / breathe FX wrappers
- [motion-smear](#motion-smear) — <Smear> motion-blur substitute
- [motion-drag-stagger](#motion-drag-stagger) — <Drag> appendage stagger helper
```

For each entry, follow the **Fixed entry schema** at CAPABILITIES.md lines 27–43:
- **Code:** path(s)
- **Surface:** exports
- **Owned by:** skill(s)
- **Status:** experimental (these are new — promote to stable after one lesson uses each in production)
- **Added:** 2026-05-27
- **Reach guide:** table
- **Anti-patterns:** bullets

Full bodies for each (sub-agent writes verbatim):

**style-overlay-system**
```markdown
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
```

**style-ink-wash**
```markdown
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
```

**magic-fx-library**
```markdown
## magic-fx-library

**Code:** `remotion-svg-primitives/src/fx/` (barrel `src/fx/index.ts`)
**Surface:** `<FXDefs seed={...}>`, `<Sparkle>`, `<ShineSweep>`, `<GlintFlash>`, `<GlowPulse>`, `<Breathe>`
**Owned by:** `remotion-lesson-composer`, `early-childhood-visual-taste`
**Status:** experimental
**Added:** 2026-05-27

### Reach guide

| When | Reach for |
|---|---|
| Recurring sparkle on a resting primitive | `<Sparkle x y intervalFrames=36 ... />` |
| One-shot star flash on event | `<GlintFlash x y startFrame=... />` |
| Cinematic shine across a button/card | `<ShineSweep x y width height startFrame=... />` |
| Pulsing aura under a primitive | `<GlowPulse startFrame={...}>{primitive}</GlowPulse>` |
| Idle breathing on resting primitive | `<Breathe originX originY>{primitive}</Breathe>` |
| Adding any FX | render `<FXDefs />` once at scene root before any FX consumer |

### Anti-patterns

- Wrapping a primitive in `<Sparkle>` (it's a free-standing emitter, not a wrapper). For wrapping aura, use `<GlowPulse>`.
- Forgetting `<FXDefs />` — filter IDs won't resolve.
- Stacking FX on the teaching primitive (kids-eye fence). FX is decorative-only — same fence as 3D and boil.
- Multiple `<FXDefs />` in one scene — emits duplicate filter IDs (browser de-dupes silently but it's a smell).
- `cloneElement`-based FX wrappers — research brief warns this breaks style-merge under nesting (React#32531).
```

**motion-smear**
```markdown
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
```

**motion-drag-stagger**
```markdown
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
```

#### 5.3 Scaffold + brief reader — NO code change required this round

The scaffold script (`scripts/lesson-scaffold.*`, locate in package.json) only writes `pipeline.json`. It does NOT need to know about the style. The composer reads `brief.md` directly (Wave 2/4 subagents already read brief.md). If the brief contains a `**Style.**` line, the composer wraps with `<StylePreset>`. If it doesn't, nothing changes. **Sub-agent action:** confirm scaffold doesn't currently touch brief and leave it untouched.

#### 5.4 Skill updates

Two skills get a one-paragraph reach guide each. Append to the bottom of these files:

**`.agents/skills/remotion-lesson-composer/SKILL.md`** — append a "Style overlay" section:

```markdown
## Style overlay (opt-in)

If `brief.md` declares `**Style.** <id>` (other than `default`), wrap the scene root in `<StylePreset style="<id>">` outside `<SceneFrame>`. Read the corresponding `.agents/styles/<id>/` bundle to choose palette/animation tweaks per `capabilities.md` in that bundle. Apply the modifier filter to the teaching `<g>` via `useStyleFilter()`:

```tsx
const filter = useStyleFilter();
return <g filter={filter}>{/* teaching SVG */}</g>;
```

Render `<FXDefs />` at scene root if any `<Sparkle>`/`<ShineSweep>`/`<GlintFlash>`/`<GlowPulse>` is used. `<Breathe>` does not require FXDefs. See CAPABILITIES.md#style-overlay-system, CAPABILITIES.md#magic-fx-library.
```

**`.agents/skills/early-childhood-visual-taste/SKILL.md`** — append a "Style overlays" subsection:

```markdown
## Style overlays

Default lessons have no aesthetic identity — that is intentional, not a gap. If a brief picks a style (e.g., `**Style.** ink-wash`), read `.agents/styles/<id>/` end-to-end. The bundle's `animation.md` declares motion tweaks that take precedence over the default vocabulary recommendations in this skill. Identity-invariance and kids-eye fences still apply unconditionally — styles modify appearance, not teaching semantics.

See CAPABILITIES.md#style-overlay-system for the full registry.
```

---

### Section 6 — SceneFrame palette-aware (minimal change)

`<SceneFrame>` currently inlines `colors.cream` and decorative circle hues. Make it palette-aware so ink-wash takes effect on the scene chrome (not just the teaching SVG).

#### 6.1 `remotion-svg-primitives/src/scenes/SceneFrame.tsx` — modify

At the top of the function body, before any JSX:
```tsx
import { useStylePalette, useStyle } from "../styles";
…
const palette = useStylePalette();
const { activeStyle } = useStyle();
const bg = palette.background ?? colors.cream;
const text = palette.textNavy ?? colors.textNavy;
```

Then:
- Replace `backgroundColor: colors.cream` with `backgroundColor: bg`.
- Replace `color: colors.textNavy` with `color: text`.
- Wrap the four decorative corner `<circle>`s + the 13-circle scatter in a guard: render only when `activeStyle === "default"`.

This is the minimal surgery to make the chrome respect the style. Title typography, eyebrow accent, and lesson SVG inside `{children}` are untouched.

---

## Verification

### Lint + type-check
```bash
cd remotion-svg-primitives && npm run lint
```
Must pass. The sub-agent does not commit if lint fails.

### Default-behavior regression test
Render an existing lesson WITHOUT touching its `brief.md`:
```bash
cd remotion-svg-primitives && npm run lesson:render -- --config lesson-data/comparison-5-gt-3/pipeline.json --skip-voice
```
The output MP4 must be byte-identical (or visually identical — file hash may differ due to render metadata) to the prior render. The sub-agent reports the file size + duration and verifies playback frames 1, 30, 60, 90 look unchanged via `ffmpeg` thumbnail extraction (use `ffmpeg -ss <t> -i <mp4> -frames:v 1 thumb<t>.png`).

### Ink-wash demo scene (the new artifact)
Create one tiny demo composition (NOT a full lesson) — `remotion-svg-primitives/src/scenes/InkWashDemo.tsx` — that:
1. Wraps content in `<StylePreset style="ink-wash">`.
2. Renders `<FXDefs />`.
3. Renders a `<g filter={useStyleFilter()}>` containing: one `<CountableObject>`, one `<TeacherMark kind="wrap-arc" boil={{ magnitude: 5 }} settle={{ magnitude: 0.08 }}>`, one `<Breathe>` wrapping a small countable, one `<GlintFlash>` triggering at frame 30.
4. Registers in `Root.tsx` as a 90-frame composition named `InkWashDemo`.

Open Remotion studio:
```bash
cd remotion-svg-primitives && npm run dev
```
Navigate to `InkWashDemo`. Confirm: ink bleed on edges, paper-cream background, no decorative corner circles, GlintFlash visible at frame 30, Breathe gently scaling, TeacherMark settle visible at end of draw.

If any of the above is missing/broken, the sub-agent investigates root cause (NOT patches the symptom) and reports the finding before further edits.

### Demo scene captures
Sub-agent runs `npx remotion still src/index.ts InkWashDemo out/ink-wash-frame-15.png --frame=15` and `--frame=60` to capture two still frames. Both stills get saved to `research/ink-wash-demo-2026-05-27/` (new folder).

---

## Order of operations

The sub-agent executes in this order. Each step is a checkpoint — if it fails, STOP and report.

1. **Read everything first.** `research/svg-animation-craft-round2-2026-05-27.md`, `research/svg-animation-craft-2026-05-26.md`, `.agents/CAPABILITIES.md`, `CLAUDE.md`. Confirm understanding before writing.
2. **Section 1.1–1.8** — style overlay runtime. Build bottom-up: types → context → ink-wash defs/palette → preset → barrels.
3. **Section 2.1–2.8** — FX library. Same pattern.
4. **Section 3.1–3.3** — motion primitives.
5. **Section 6** — SceneFrame palette-awareness (must come after 1, before lint).
6. **Section 4.1–4.7** — skill bundle markdown.
7. **Section 5.1–5.4** — CLAUDE.md, CAPABILITIES.md, skills.
8. **Verification §"Lint + type-check"** — must pass.
9. **Verification §"Default-behavior regression"** — render comparison lesson, confirm unchanged.
10. **Verification §"Ink-wash demo scene"** — create `InkWashDemo.tsx`, register in `Root.tsx`, capture stills.
11. **Final sweep** — re-read CAPABILITIES.md, confirm all five new entries follow the schema literally. Confirm CLAUDE.md `## Styles` block is in the correct position. Confirm no frame literals introduced anywhere.

---

## Risks and explicit non-decisions

- **`feDisplacementMap` Safari/Firefox bug.** Round-2 research surfaced this. Remotion renders in Chromium, so it doesn't affect the rendered MP4. It DOES affect `npm run dev` (Studio) in non-Chrome browsers. Sub-agent: don't fix, document. Add a note to `.agents/styles/ink-wash/STYLE.md` "Studio preview requires Chromium" if you find this isn't already documented elsewhere.
- **Palette discipline enforcement.** Nothing in code stops a lesson from using `colors.coral` under ink-wash. The filter chain's color-shift is light. This round, palette discipline is a SOFT contract (markdown + reach guides). Hardening (e.g., `colors` becoming `useStylePalette()`-aware at every callsite) is a future round.
- **`<Drag>` cloneElement caveat.** It clones for scalar-prop override, not style merging. Acceptable per research brief; if a future caller passes ref / key conflicts, that's a separate fix.
- **Animated `feTurbulence` seed.** `<FXDefs>` uses `<animate attributeName="seed">` on the glint filter. This works in Chromium-rendered Remotion. If `npm run lint` complains about the embedded `<animate>` typing, the sub-agent reports — do NOT silently drop the animation.
- **`<GlowPulse>` rendering children twice.** GlowPulse renders the children once filtered (the aura) and once normal (on top). Cheap because SVG, but watch for `id` collisions if children use `<defs>`. The aura's `opacity` modulates to invisible during off-phase. Acceptable; document if a consumer hits id conflict.

---

## Inputs the sub-agent must NOT need

If you find yourself needing one of these, STOP and report — it means this plan is incomplete:

- A second style beyond ink-wash. Only ink-wash this round.
- A migration of existing lessons. Only the demo scene this round.
- Network access. All filter constants are in this file; no live lookups.
- New npm dependencies. The plan uses only Remotion, React, and the existing repo. If a constant or pattern seems to require a new dep, the plan is wrong — report.
- A new wave in the pipeline. Style selection rides on existing brief.md → Wave 2 → Wave 4 flow.

---

## Acceptance

The sub-agent is done when:
1. All files in §"Files to create / modify" exist with the specified content (matching API surface; JSDoc preserved; constants verbatim).
2. `npm run lint` passes.
3. Default lesson regression renders unchanged.
4. `InkWashDemo` composition renders and produces the two still frames.
5. `.agents/CAPABILITIES.md` has five new entries in the correct schema.
6. `CLAUDE.md` has the new `**Style.**` brief field, the `## Styles` block, and updated `## Capabilities` index.
7. Two skill files (`remotion-lesson-composer`, `early-childhood-visual-taste`) have the added paragraphs.
8. The sub-agent posts a one-paragraph "what landed" summary linking each new capability id to its CAPABILITIES.md anchor.
