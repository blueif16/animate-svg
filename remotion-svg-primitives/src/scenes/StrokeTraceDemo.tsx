import { interpolate, useCurrentFrame } from "remotion";
import {
  DrawPath,
  PopIn,
  PulseCircle,
  SparkleBurst,
} from "../motion-primitives";
import { colors, shadows, typography, video } from "../theme";
import { SceneFrame } from "./SceneFrame";

const strokeOne = "M 482 272 C 562 174 748 188 760 302";
const strokeTwo = "M 760 302 C 746 390 616 410 540 500";
const strokeThree = "M 540 500 C 628 508 710 508 792 500";

const strokes = [
  { d: strokeOne, startFrame: 28, labelX: 470, labelY: 250 },
  { d: strokeTwo, startFrame: 58, labelX: 782, labelY: 322 },
  { d: strokeThree, startFrame: 88, labelX: 535, labelY: 540 },
];

export const StrokeTraceDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const doneOpacity = interpolate(frame, [112, 126], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const penX = interpolate(frame, [28, 112], [482, 792], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const penY = interpolate(frame, [28, 112], [272, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFrame
      accent={colors.coral}
      eyebrow="Stroke trace demo"
      title="Reveal each stroke"
    >
      <div
        style={{
          backgroundColor: colors.white,
          border: `6px solid ${colors.textNavy}`,
          borderRadius: 34,
          boxShadow: shadows.soft,
          height: 440,
          left: 252,
          position: "absolute",
          top: 214,
          width: 776,
        }}
      />
      <div
        style={{
          color: colors.softGrayBlue,
          fontSize: 24,
          fontWeight: 900,
          left: 794,
          position: "absolute",
          top: 244,
        }}
      >
        Trace number 2
      </div>

      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <g opacity={0.18}>
          {strokes.map((stroke) => (
            <path
              d={stroke.d}
              fill="none"
              key={stroke.d}
              stroke={colors.textNavy}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={34}
            />
          ))}
        </g>

        {strokes.map((stroke, index) => (
          <g key={stroke.d}>
            <DrawPath
              d={stroke.d}
              durationInFrames={30}
              startFrame={stroke.startFrame}
              stroke={
                index === 0
                  ? colors.coral
                  : index === 1
                    ? colors.sky
                    : colors.mint
              }
              strokeWidth={30}
            />
            <PopIn
              delay={stroke.startFrame - 8}
              originX={stroke.labelX}
              originY={stroke.labelY}
              scaleFrom={0.5}
            >
              <circle
                cx={stroke.labelX}
                cy={stroke.labelY}
                fill={colors.paleCream}
                r={22}
                stroke={colors.textNavy}
                strokeWidth={4}
              />
              <text
                dominantBaseline="middle"
                fill={colors.textNavy}
                fontFamily={typography.fontFamily}
                fontSize={23}
                fontWeight={900}
                textAnchor="middle"
                x={stroke.labelX}
                y={stroke.labelY + 1}
              >
                {index + 1}
              </text>
            </PopIn>
          </g>
        ))}

        <PulseCircle
          color={colors.coral}
          cx={482}
          cy={272}
          radius={22}
          repeatCount={2}
          startFrame={22}
        />
        <PulseCircle
          color={colors.sky}
          cx={760}
          cy={302}
          radius={22}
          repeatCount={2}
          startFrame={54}
        />
        <PulseCircle
          color={colors.mint}
          cx={540}
          cy={500}
          radius={22}
          repeatCount={2}
          startFrame={84}
        />

        <g transform={`translate(${penX} ${penY}) rotate(-22)`}>
          <rect
            fill={colors.reward}
            height={72}
            rx={12}
            stroke={colors.textNavy}
            strokeWidth={4}
            width={28}
            x={-14}
            y={-70}
          />
          <path
            d="M -14 0 L 0 28 L 14 0 Z"
            fill={colors.paleCream}
            stroke={colors.textNavy}
            strokeLinejoin="round"
            strokeWidth={4}
          />
        </g>

        <g opacity={doneOpacity}>
          <rect
            fill={colors.sunshine}
            height={62}
            rx={24}
            stroke={colors.textNavy}
            strokeWidth={5}
            width={248}
            x={516}
            y={576}
          />
          <text
            dominantBaseline="middle"
            fill={colors.textNavy}
            fontFamily={typography.fontFamily}
            fontSize={30}
            fontWeight={900}
            textAnchor="middle"
            x={640}
            y={608}
          >
            Nice tracing!
          </text>
        </g>
        <SparkleBurst count={12} radius={96} startFrame={116} x={640} y={592} />
      </svg>
    </SceneFrame>
  );
};
