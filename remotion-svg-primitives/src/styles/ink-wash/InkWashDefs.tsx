import { useCurrentFrame } from "remotion";
import { INK_WASH_DEFAULT_SEED } from "./palette";

type InkWashDefsProps = {
  /** Base seed for feTurbulence. Frame-aware boil reseeds every `boilStrideFrames`. */
  seed?: number;
  /**
   * Frames between turbulence reseeds. Lower = faster shimmer.
   * 5 ≈ canonical hand-drawn "boil" at 30fps (6Hz). 0 disables the boil.
   */
  boilStrideFrames?: number;
};

/**
 * Renders the hidden <svg> containing the ink-wash filter chain in <defs>.
 *
 * Calibration (2026-05-27): displacement `scale=4` matches the research demo
 * (see research/ink-wash-demo-2026-05-27/). Higher values destroy thin-stroke
 * silhouettes — primitives like rope ties and number glyphs read as ink spatter.
 *
 * Frame-aware boil: feTurbulence `seed` advances every `boilStrideFrames` so
 * wet edges shimmer subtly through the lesson. Without this, the entire wash
 * is frozen and the medium reads as dead.
 */
export const InkWashDefs = ({
  seed = INK_WASH_DEFAULT_SEED,
  boilStrideFrames = 5,
}: InkWashDefsProps) => {
  const frame = useCurrentFrame();
  const liveSeed =
    boilStrideFrames > 0 ? seed + Math.floor(frame / boilStrideFrames) : seed;

  return (
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
            numOctaves="3"
            seed={liveSeed}
            stitchTiles="stitch"
            type="fractalNoise"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.5" result="bled" />
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
            seed={liveSeed + 1}
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
};

export const INK_WASH_FILTER_IDS = {
  primary: "style-ink-wash-primary",
  paper: "style-ink-wash-paper",
  brush: "style-ink-wash-brush",
} as const;
