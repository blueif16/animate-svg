import { interpolate, useCurrentFrame } from "remotion";
import {
  DrawPath,
  FollowPath,
  PopIn,
  PulseCircle,
  SparkleBurst,
} from "../motion-primitives";
import type { CubicPath } from "../motion-primitives";
import { colors, typography, video } from "../theme";
import { SceneFrame } from "./SceneFrame";

const learningPath: CubicPath = {
  type: "cubic",
  from: { x: 168, y: 526 },
  control1: { x: 340, y: 170 },
  control2: { x: 678, y: 616 },
  to: { x: 1046, y: 252 },
};

const learningPathD = "M 168 526 C 340 170 678 616 1046 252";

const Bee: React.FC = () => (
  <g>
    <ellipse
      cx={0}
      cy={0}
      fill={colors.sunshine}
      rx={42}
      ry={30}
      stroke={colors.textNavy}
      strokeWidth={5}
    />
    <path
      d="M -12 -27 C -25 -70 24 -76 20 -24"
      fill={colors.sky}
      opacity={0.72}
      stroke={colors.textNavy}
      strokeWidth={4}
    />
    <path
      d="M 10 -24 C 24 -68 72 -56 42 -14"
      fill={colors.sky}
      opacity={0.72}
      stroke={colors.textNavy}
      strokeWidth={4}
    />
    <path d="M -14 -26 L -14 26" stroke={colors.textNavy} strokeWidth={5} />
    <path d="M 12 -26 L 12 26" stroke={colors.textNavy} strokeWidth={5} />
    <circle cx={33} cy={-9} fill={colors.textNavy} r={4} />
    <path
      d="M 38 -18 C 56 -28 58 -42 52 -54"
      fill="none"
      stroke={colors.textNavy}
      strokeLinecap="round"
      strokeWidth={4}
    />
    <path
      d="M 36 18 C 50 30 63 31 72 22"
      fill="none"
      stroke={colors.textNavy}
      strokeLinecap="round"
      strokeWidth={4}
    />
  </g>
);

export const PathFollowDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const cardOpacity = interpolate(frame, [74, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFrame
      accent={colors.sky}
      eyebrow="Path follow demo"
      title="A bee traces the curve"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <rect
          fill={colors.paleCream}
          height={380}
          rx={36}
          stroke={colors.white}
          strokeWidth={8}
          width={1040}
          x={120}
          y={206}
        />
        <path
          d={learningPathD}
          fill="none"
          opacity={0.18}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={28}
        />
        <DrawPath
          d={learningPathD}
          durationInFrames={76}
          startFrame={10}
          stroke={colors.sky}
          strokeWidth={18}
        />
        <PulseCircle
          color={colors.mint}
          cx={learningPath.from.x}
          cy={learningPath.from.y}
          radius={24}
          repeatCount={2}
          startFrame={8}
        />
        <PulseCircle
          color={colors.coral}
          cx={learningPath.to.x}
          cy={learningPath.to.y}
          radius={28}
          repeatCount={3}
          startFrame={90}
        />

        <PopIn
          delay={8}
          originX={learningPath.from.x}
          originY={learningPath.from.y}
        >
          <circle
            cx={learningPath.from.x}
            cy={learningPath.from.y}
            fill={colors.mint}
            r={22}
            stroke={colors.textNavy}
            strokeWidth={5}
          />
        </PopIn>
        <PopIn
          delay={82}
          originX={learningPath.to.x}
          originY={learningPath.to.y}
        >
          <path
            d="M 1046 203 L 1063 235 L 1098 242 L 1073 267 L 1078 302 L 1046 286 L 1014 302 L 1019 267 L 994 242 L 1029 235 Z"
            fill={colors.reward}
            stroke={colors.textNavy}
            strokeLinejoin="round"
            strokeWidth={5}
          />
        </PopIn>

        <FollowPath
          durationInFrames={92}
          path={learningPath}
          rotateToPath
          startFrame={16}
        >
          <Bee />
        </FollowPath>

        <SparkleBurst
          color={colors.reward}
          count={11}
          radius={86}
          startFrame={105}
          x={learningPath.to.x}
          y={learningPath.to.y}
        />

        <g opacity={cardOpacity}>
          <rect
            fill={colors.white}
            height={104}
            rx={26}
            stroke={colors.textNavy}
            strokeWidth={5}
            width={350}
            x={764}
            y={476}
          />
          <text
            fill={colors.textNavy}
            fontFamily={typography.fontFamily}
            fontSize={30}
            fontWeight={900}
            x={806}
            y={520}
          >
            Rotate to tangent
          </text>
          <text
            fill={colors.softGrayBlue}
            fontFamily={typography.fontFamily}
            fontSize={22}
            fontWeight={800}
            x={806}
            y={552}
          >
            Point math keeps it deterministic.
          </text>
        </g>
      </svg>
    </SceneFrame>
  );
};
