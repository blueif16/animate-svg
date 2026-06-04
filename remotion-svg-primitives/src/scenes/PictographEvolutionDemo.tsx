import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { PictographEvolution } from "../motion-primitives";
import { IconAsset } from "../shape-primitives";
import { fontFamily } from "../shape-primitives/shared";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// PictographEvolutionDemo — verification scenes for the PictographEvolution
// special component (字理演变: 实物 → 古代象形字 → 现代汉字, with the
// 字形与事物相似 silhouette-overlap payoff). Four compositions:
//
//  • PictographEvolutionHardest      — THE HARDEST FRAME. Held mid-morph between
//    the ancient glyph and the modern char, so the AssetMorph sparkle mask is
//    live and BOTH forms are partially visible on the shared center. Verify the
//    bbox centers coincide (it reads as ONE thing reshaping, not a cut) and the
//    sparkle is legible.
//  • PictographEvolutionSunOverlap   — FULL 3-STAGE CALLER. sun object →
//    ancient 日 → modern 日, held AFTER the last stage settles with
//    silhouetteOverlap on, so the modern 日 glyph sits over the ghosted sun —
//    the 字形与事物形状相似 payoff.
//  • PictographEvolutionMountain     — SECOND-CHARACTER REUSE PROOF (山). The
//    SAME component, different props: mountain object → ancient 山 → modern 山.
//  • PictographEvolutionWaterCrossfade — THIRD-CHARACTER REUSE PROOF (水) in the
//    'crossfade' mode (plain dissolve, no sparkle mask), proving the variant.
//
// Demo scene → explicit object art + Chinese glyphs are fine HERE (the
// lesson-agnostic law governs the COMPONENT, not its demo harness; a real lesson
// passes its own stage nodes + atFrame from cues[id].startFrame+offset).
// ---------------------------------------------------------------------------

const CX = video.width / 2;
const CY = video.height / 2;

export const PICTOGRAPH_EVOLUTION_DEMO_DURATION = 220;

const Stage: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      {children}
    </svg>
  </AbsoluteFill>
);

// A caller-localized caption node (实物 / 古文字 / 今字 — never baked in the
// component; the demo owns these strings).
const caption = (text: string) => (
  <tspan fontFamily={fontFamily} fontWeight={900}>
    {text}
  </tspan>
);

// A bare modern-character GLYPH centered on the origin (no card surface) so the
// ghosted object silhouette can show THROUGH it for the overlap payoff. Caller
// scene content — the component bakes none of this.
const hanziGlyph = (char: string, size = 200): ReactNode => (
  <text
    dominantBaseline="central"
    fill={colors.textNavy}
    fontFamily={fontFamily}
    fontSize={size}
    fontWeight={900}
    textAnchor="middle"
    x={0}
    y={0}
  >
    {char}
  </text>
);

// --- Object pictures (the 实物 stage), hand-drawn demo art, each centered on
// the local origin so its visual center coincides with the shared morph center.

const sunObject = (size = 220): ReactNode => {
  const r = size * 0.32;
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <line
            key={i}
            stroke={colors.reward}
            strokeLinecap="round"
            strokeWidth={size * 0.05}
            x1={Math.cos(a) * r * 1.18}
            x2={Math.cos(a) * r * 1.5}
            y1={Math.sin(a) * r * 1.18}
            y2={Math.sin(a) * r * 1.5}
          />
        );
      })}
      <circle
        cx={0}
        cy={0}
        fill={colors.sunshine}
        r={r}
        stroke={colors.textNavy}
        strokeWidth={size * 0.04}
      />
    </g>
  );
};

const mountainObject = (size = 220): ReactNode => {
  const s = size * 0.5;
  return (
    <g>
      <path
        d={`M ${-s} ${s * 0.7} L ${-s * 0.35} ${-s * 0.55} L ${s * 0.05} ${s * 0.18} L ${s * 0.45} ${-s * 0.8} L ${s} ${s * 0.7} Z`}
        fill={colors.mint}
        stroke={colors.textNavy}
        strokeLinejoin="round"
        strokeWidth={size * 0.04}
      />
      <path
        d={`M ${s * 0.45} ${-s * 0.8} L ${s * 0.2} ${-s * 0.3} L ${s * 0.6} ${-s * 0.3} Z`}
        fill={colors.white}
        stroke={colors.textNavy}
        strokeLinejoin="round"
        strokeWidth={size * 0.03}
      />
    </g>
  );
};

const waterObject = (size = 220): ReactNode => {
  const s = size * 0.5;
  return (
    <g>
      <path
        d={`M 0 ${-s * 0.85} C ${s * 0.7} ${-s * 0.05} ${s * 0.55} ${s * 0.7} 0 ${s * 0.7} C ${-s * 0.55} ${s * 0.7} ${-s * 0.7} ${-s * 0.05} 0 ${-s * 0.85} Z`}
        fill={colors.sky}
        stroke={colors.textNavy}
        strokeLinejoin="round"
        strokeWidth={size * 0.04}
      />
      <path
        d={`M ${-s * 0.3} ${s * 0.1} C ${-s * 0.12} ${s * 0.3} ${s * 0.05} ${-s * 0.05} ${s * 0.28} ${s * 0.15}`}
        fill="none"
        stroke={colors.white}
        strokeLinecap="round"
        strokeWidth={size * 0.04}
      />
    </g>
  );
};

const ancient = (name: string, size = 200): ReactNode => (
  <IconAsset name={name} variant="color" width={size} />
);

// THE HARDEST FRAME — held mid-morph between the ancient glyph (stage 1) and the
// modern char (stage 2) so the sparkle mask is live and both forms overlap on
// the shared center. With perStageDurationFrames=48 + interStageGapFrames=16,
// transition 2 COMPLETES at local 2*(48+16)=128; its morph window is the 16
// frames before. atFrame=-120 puts the held frame (local≈120) inside it.
export const PictographEvolutionHardest = () => (
  <Stage>
    <PictographEvolution
      atFrame={-120}
      centerX={0}
      centerY={0}
      interStageGapFrames={16}
      perStageDurationFrames={48}
      stages={[sunObject(), ancient("ancient-glyph-sun"), hanziGlyph("日")]}
      stageSize={220}
      x={CX}
      y={CY - 10}
    />
  </Stage>
);

// FULL 3-STAGE CALLER + the 字形与事物相似 payoff. Held well after stage 2
// settles (last transition completes at local 128; the ghost finishes fading by
// local ~128 + 48*0.85 ≈ 169). atFrame=-180 → local≈180, ghost fully up, modern
// 日 glyph over the ghosted sun.
export const PictographEvolutionSunOverlap = () => (
  <Stage>
    <PictographEvolution
      atFrame={-180}
      centerX={0}
      centerY={0}
      interStageGapFrames={16}
      perStageDurationFrames={48}
      silhouetteOpacity={0.34}
      silhouetteOverlap
      stageLabels={[caption("实物"), caption("古文字"), caption("今字")]}
      stages={[sunObject(), ancient("ancient-glyph-sun"), hanziGlyph("日")]}
      stageSize={220}
      x={CX}
      y={CY - 30}
    />
  </Stage>
);

// SECOND-CHARACTER REUSE PROOF (山). Same component, different props, with the
// overlap payoff. Held after settle.
export const PictographEvolutionMountain = () => (
  <Stage>
    <PictographEvolution
      atFrame={-180}
      centerX={0}
      centerY={0}
      interStageGapFrames={16}
      perStageDurationFrames={48}
      silhouetteOpacity={0.34}
      silhouetteOverlap
      stageLabels={[caption("实物"), caption("古文字"), caption("今字")]}
      stages={[
        mountainObject(),
        ancient("ancient-glyph-mountain"),
        hanziGlyph("山"),
      ]}
      stageSize={220}
      x={CX}
      y={CY - 30}
    />
  </Stage>
);

// THIRD-CHARACTER REUSE PROOF (水) in 'crossfade' mode — proving the variant
// (plain dissolve, no sparkle mask). Held mid-dissolve between the ancient glyph
// and the modern char.
export const PictographEvolutionWaterCrossfade = () => (
  <Stage>
    <PictographEvolution
      atFrame={-122}
      centerX={0}
      centerY={0}
      interStageGapFrames={16}
      mode="crossfade"
      perStageDurationFrames={48}
      stageLabels={[caption("实物"), caption("古文字"), caption("今字")]}
      stages={[waterObject(), ancient("ancient-glyph-water"), hanziGlyph("水")]}
      stageSize={220}
      x={CX}
      y={CY - 30}
    />
  </Stage>
);
