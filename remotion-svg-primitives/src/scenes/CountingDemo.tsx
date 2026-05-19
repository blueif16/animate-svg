import { interpolate, useCurrentFrame } from "remotion";
import { PopIn, SparkleBurst } from "../motion-primitives";
import { colors, shadows, typography, video } from "../theme";
import { SceneFrame } from "./SceneFrame";

type Banana = {
  x: number;
  y: number;
  rotate: number;
  delay: number;
};

const bananas: Banana[] = [
  { x: 238, y: 354, rotate: -16, delay: 10 },
  { x: 394, y: 298, rotate: 13, delay: 20 },
  { x: 548, y: 366, rotate: -8, delay: 30 },
  { x: 404, y: 476, rotate: 10, delay: 42 },
  { x: 624, y: 484, rotate: -13, delay: 54 },
];

const BananaShape: React.FC = () => (
  <g>
    <path
      d="M -92 -8 C -40 78 78 78 132 -10 C 76 30 -15 30 -58 -26 Z"
      fill={colors.sunshine}
      stroke={colors.textNavy}
      strokeLinejoin="round"
      strokeWidth={5}
    />
    <path
      d="M -54 -6 C -4 37 65 38 103 4"
      fill="none"
      opacity={0.45}
      stroke={colors.white}
      strokeLinecap="round"
      strokeWidth={10}
    />
    <ellipse
      cx={-77}
      cy={-21}
      fill={colors.coral}
      rx={12}
      ry={17}
      stroke={colors.textNavy}
      strokeWidth={4}
      transform="rotate(-28 -77 -21)"
    />
    <ellipse
      cx={131}
      cy={-11}
      fill={colors.mint}
      rx={10}
      ry={15}
      stroke={colors.textNavy}
      strokeWidth={4}
      transform="rotate(26 131 -11)"
    />
  </g>
);

export const CountingDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const cueOpacity = interpolate(frame, [78, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rewardScale = interpolate(frame, [94, 106], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFrame
      accent={colors.sunshine}
      eyebrow="Counting demo"
      title="Pop, count, celebrate"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <rect
          fill={colors.paleCream}
          height={384}
          rx={34}
          stroke={colors.white}
          strokeWidth={8}
          width={640}
          x={94}
          y={214}
        />
        <path
          d="M 154 570 C 266 624 566 626 690 568"
          fill="none"
          opacity={0.2}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={18}
        />

        {bananas.map((banana, index) => {
          const labelOpacity = interpolate(
            frame,
            [banana.delay + 8, banana.delay + 18],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          return (
            <g key={index}>
              <PopIn delay={banana.delay} originX={banana.x} originY={banana.y}>
                <g
                  transform={`translate(${banana.x} ${banana.y}) rotate(${banana.rotate})`}
                >
                  <BananaShape />
                </g>
              </PopIn>
              <text
                dominantBaseline="middle"
                fill={colors.textNavy}
                fontFamily={typography.fontFamily}
                fontSize={34}
                fontWeight={900}
                opacity={labelOpacity}
                textAnchor="middle"
                x={banana.x + 28}
                y={banana.y + 98}
              >
                {index + 1}
              </text>
            </g>
          );
        })}

        <g opacity={cueOpacity}>
          <rect
            fill={colors.white}
            height={252}
            rx={28}
            stroke={colors.textNavy}
            strokeWidth={5}
            width={356}
            x={842}
            y={250}
          />
          <rect
            fill={colors.mint}
            height={54}
            opacity={0.55}
            rx={20}
            width={284}
            x={878}
            y={278}
          />
          <text
            fill={colors.textNavy}
            fontFamily={typography.fontFamily}
            fontSize={42}
            fontWeight={900}
            textAnchor="middle"
            x={1020}
            y={356}
          >
            3 + 2 = 5
          </text>
          <g transform={`translate(1020 430) scale(${rewardScale})`}>
            <rect
              fill={colors.reward}
              height={58}
              rx={24}
              stroke={colors.textNavy}
              strokeWidth={5}
              width={220}
              x={-110}
              y={-29}
            />
            <text
              dominantBaseline="middle"
              fill={colors.textNavy}
              fontFamily={typography.fontFamily}
              fontSize={30}
              fontWeight={900}
              textAnchor="middle"
            >
              Five!
            </text>
          </g>
        </g>
        <SparkleBurst
          count={12}
          radius={84}
          startFrame={102}
          x={1020}
          y={278}
        />
      </svg>

      <div
        style={{
          background: colors.white,
          borderRadius: 24,
          boxShadow: shadows.small,
          color: colors.softGrayBlue,
          fontSize: 25,
          fontWeight: 800,
          left: 880,
          lineHeight: 1.28,
          padding: "22px 26px",
          position: "absolute",
          top: 534,
          width: 280,
        }}
      >
        Compare groups, then reward the correct total.
      </div>
    </SceneFrame>
  );
};
