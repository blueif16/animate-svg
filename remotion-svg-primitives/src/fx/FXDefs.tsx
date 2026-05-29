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
