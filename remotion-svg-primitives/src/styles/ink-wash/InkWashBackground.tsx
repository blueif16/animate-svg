import { AbsoluteFill } from "remotion";
import { video } from "../../theme";
import { INK_WASH_FILTER_IDS } from "./InkWashDefs";
import { INK_WASH_PALETTE } from "./palette";

type InkWashBackgroundProps = {
  /**
   * Optional glyph for the bottom-right seal (hanko). Default "学" (study).
   * Pass empty string to suppress the seal.
   */
  sealText?: string;
  /** Show the paper grain layer. Default true — gives the cream surface tooth. */
  showGrain?: boolean;
};

/**
 * Full-bleed paper backdrop for ink-wash scenes. Paints the cream background,
 * overlays a subtle paper grain via `style-ink-wash-paper`, and stamps a small
 * vermillion seal in the bottom-right. Sits BEHIND the teaching content — the
 * scene above must render with a transparent root background under ink-wash.
 */
export const InkWashBackground = ({
  sealText = "学",
  showGrain = true,
}: InkWashBackgroundProps) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        aria-hidden="true"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        {/* Base cream paper. */}
        <rect
          fill={INK_WASH_PALETTE.background}
          height={video.height}
          width={video.width}
          x={0}
          y={0}
        />

        {/* Grain. Cheap full-bleed turbulence multiplied with the base. */}
        {showGrain ? (
          <rect
            fill={INK_WASH_PALETTE.paper}
            filter={`url(#${INK_WASH_FILTER_IDS.paper})`}
            height={video.height}
            opacity={0.55}
            width={video.width}
            x={0}
            y={0}
          />
        ) : null}

        {/* Hanko seal — vermillion, bottom-right. ≤5% of frame area by spec. */}
        {sealText ? (
          <g transform={`translate(${video.width - 110}, ${video.height - 110})`}>
            <rect
              fill={INK_WASH_PALETTE.accent}
              height={72}
              opacity={0.92}
              rx={6}
              ry={6}
              width={72}
              x={0}
              y={0}
            />
            <text
              dominantBaseline="central"
              fill="#FBEEDC"
              fontFamily="'Noto Serif SC', 'Songti SC', serif"
              fontSize={46}
              fontWeight={700}
              textAnchor="middle"
              x={36}
              y={38}
            >
              {sealText}
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
