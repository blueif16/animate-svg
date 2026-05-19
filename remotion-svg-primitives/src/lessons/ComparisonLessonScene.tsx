import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PopIn, PulseCircle, SparkleBurst } from "../motion-primitives";
import {
  ComparisonSymbol,
  CountableObject,
  NumberCard,
  PairConnector,
  PointerHandArrow,
} from "../shape-primitives";
import { SceneFrame } from "../scenes/SceneFrame";
import { colors, typography, video } from "../theme";
import { comparisonLessonAlignedCues } from "./generated/comparisonLessonTiming";
import { cueMap } from "./timingTypes";

const leftObjects = [
  { x: 252, y: 278 },
  { x: 252, y: 410 },
  { x: 384, y: 278 },
  { x: 384, y: 410 },
  { x: 516, y: 344 },
];

const rightObjects = [
  { x: 782, y: 286 },
  { x: 782, y: 418 },
  { x: 914, y: 352 },
];

const formulaY = 530;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const fade = (frame: number, start: number, duration = 12) =>
  progress(frame, start, start + duration);

export const ComparisonLessonScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = cueMap(comparisonLessonAlignedCues);
  const objectStart = cues["left-five"].startFrame;
  const rightStart = cues["right-three"].startFrame;
  const pairingStart = cues.pairing.startFrame;
  const pairingEnd = cues.pairing.endFrame;
  const leftoverStart = cues.leftover.startFrame;
  const resultStart = cues.result.startFrame;
  const pairingProgress = progress(frame, pairingStart, pairingEnd);
  const symbolEntrance = spring({
    config: { damping: 13, mass: 0.55, stiffness: 180 },
    fps,
    frame: frame - resultStart,
  });
  const symbolScale = interpolate(symbolEntrance, [0, 1], [0.76, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFrame
      accent={colors.coral}
      eyebrow="Voice-aligned comparison lesson"
      title="一一配对比大小"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <rect
          fill={colors.paleCream}
          height={396}
          rx={34}
          stroke={colors.white}
          strokeWidth={8}
          width={1000}
          x={140}
          y={204}
        />
        <rect
          fill={colors.white}
          height={314}
          rx={30}
          stroke={colors.textNavy}
          strokeWidth={4}
          width={420}
          x={174}
          y={244}
        />
        <rect
          fill={colors.white}
          height={314}
          rx={30}
          stroke={colors.textNavy}
          strokeWidth={4}
          width={320}
          x={728}
          y={244}
        />

        {leftObjects.slice(0, 3).map((left, index) => {
          const right = rightObjects[index];
          const connectorProgress = clamp(pairingProgress * 3 - index);

          return (
            <PairConnector
              color={index % 2 === 0 ? colors.sky : colors.mint}
              key={index}
              progress={connectorProgress}
              snap
              strokeWidth={6}
              x1={left.x + 52}
              x2={right.x - 52}
              y1={left.y}
              y2={right.y}
            />
          );
        })}

        {leftObjects.map((item, index) => (
          <g key={index}>
            {index > 2 ? (
              <PulseCircle
                color={colors.coral}
                cx={item.x}
                cy={item.y}
                radius={42}
                repeatCount={2}
                startFrame={leftoverStart}
              />
            ) : null}
            <PopIn
              delay={objectStart + index * 4}
              originX={item.x}
              originY={item.y}
            >
              <CountableObject
                color={index > 2 ? colors.coral : colors.sunshine}
                selected={index > 2 && frame >= leftoverStart}
                size={76}
                variant="star"
                x={item.x}
                y={item.y}
              />
            </PopIn>
          </g>
        ))}

        {rightObjects.map((item, index) => (
          <PopIn
            delay={rightStart + index * 5}
            key={index}
            originX={item.x}
            originY={item.y}
          >
            <CountableObject
              color={colors.mint}
              size={78}
              variant="block"
              x={item.x}
              y={item.y}
            />
          </PopIn>
        ))}

        <PointerHandArrow
          direction="right"
          progress={progress(frame, pairingStart, pairingStart + 14)}
          size={72}
          variant="hand"
          x={610}
          y={350}
        />

        <g opacity={fade(frame, leftoverStart, 14)}>
          <rect
            fill={colors.white}
            height={64}
            rx={22}
            stroke={colors.textNavy}
            strokeWidth={4}
            width={248}
            x={516}
            y={302}
          />
          <text
            dominantBaseline="middle"
            fill={colors.textNavy}
            fontFamily={typography.fontFamily}
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            x={640}
            y={335}
          >
            还剩 2 个
          </text>
        </g>

        <NumberCard
          color={colors.sunshine}
          focused={frame >= cues["left-five"].startFrame}
          value={5}
          x={384}
          y={formulaY}
        />
        <g
          opacity={frame >= resultStart ? 1 : 0}
          transform={`translate(640 ${formulaY}) scale(${symbolScale}) translate(-640 -${formulaY})`}
        >
          <ComparisonSymbol
            selected
            size={84}
            style="formal"
            symbol=">"
            x={640}
            y={formulaY}
          />
        </g>
        <NumberCard
          color={colors.mint}
          focused={frame >= cues["right-three"].startFrame}
          value={3}
          x={896}
          y={formulaY}
        />

        <SparkleBurst
          count={10}
          radius={82}
          startFrame={cues.result.endFrame - 8}
          x={640}
          y={formulaY}
        />
      </svg>
    </SceneFrame>
  );
};
