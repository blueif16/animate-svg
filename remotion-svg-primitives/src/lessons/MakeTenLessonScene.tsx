import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PulseCircle, SparkleBurst } from "../motion-primitives";
import {
  EquationStrip,
  NumberCard,
  PartWholeBrace,
  PointerHandArrow,
  TenFrameRod,
  type TenFrameRodProps,
} from "../shape-primitives";
import { SceneFrame } from "../scenes/SceneFrame";
import { colors, typography, video } from "../theme";
import { makeTenLessonAlignedCues } from "./generated/makeTenLessonTiming";
import { cueMap } from "./timingTypes";

type MakeTenCueId =
  | "opening"
  | "show-six"
  | "find-four"
  | "add-four"
  | "make-ten"
  | "equation";

type TenFrameSegment = NonNullable<TenFrameRodProps["segments"]>[number];

const cues = cueMap(makeTenLessonAlignedCues);

const tenFrame = {
  columns: 5,
  gap: 4,
  size: 76,
  x: 520,
  y: 362,
};

const tenFrameWidth =
  tenFrame.columns * tenFrame.size + (tenFrame.columns - 1) * tenFrame.gap;
const tenFrameHeight = 2 * tenFrame.size + tenFrame.gap;

const cellPosition = (index: number) => {
  const column = index % tenFrame.columns;
  const row = Math.floor(index / tenFrame.columns);
  const left =
    tenFrame.x - tenFrameWidth / 2 + column * (tenFrame.size + tenFrame.gap);
  const top =
    tenFrame.y - tenFrameHeight / 2 + row * (tenFrame.size + tenFrame.gap);

  return {
    cx: left + tenFrame.size / 2,
    cy: top + tenFrame.size / 2,
    left,
    top,
  };
};

const emptyCellIndexes = [6, 7, 8, 9];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const progress = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const reveal = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const steppedCount = (value: number, total: number) =>
  Math.min(total, Math.max(0, Math.round(clamp01(value) * total)));

const makeSegment = (
  count: number,
  color: NonNullable<TenFrameSegment["color"]>,
  oneColor: NonNullable<TenFrameSegment["oneColor"]>,
): TenFrameSegment | null => (count > 0 ? { color, count, oneColor } : null);

export const MakeTenLessonScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = (id: MakeTenCueId) => cues[id];
  const showSixStart = cue("show-six").startFrame;
  const findFourStart = cue("find-four").startFrame;
  const addFourStart = cue("add-four").startFrame;
  const makeTenStart = cue("make-ten").startFrame;
  const equationStart = cue("equation").startFrame;
  const sixCount =
    frame >= findFourStart
      ? 6
      : steppedCount(progress(frame, showSixStart, showSixStart + 30), 6);
  const fourCount =
    frame >= makeTenStart
      ? 4
      : steppedCount(progress(frame, addFourStart, addFourStart + 30), 4);
  const filledCount = sixCount + fourCount;
  const findFourOpacity =
    reveal(frame, findFourStart, 12) * (1 - reveal(frame, addFourStart, 10));
  const makeTenOpacity = reveal(frame, makeTenStart, 14);
  const makeTenDetailOpacity =
    makeTenOpacity * (1 - reveal(frame, equationStart, 10));
  const equationOpacity = reveal(frame, equationStart, 14);
  const sideNumberOpacity = 1 - reveal(frame, equationStart, 10);
  const totalEntrance = spring({
    config: { damping: 14, mass: 0.55, stiffness: 180 },
    fps,
    frame: frame - makeTenStart,
  });
  const totalScale = interpolate(totalEntrance, [0, 1], [0.84, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const activeEquationIndex =
    frame >= equationStart
      ? Math.min(
          4,
          Math.floor(
            progress(frame, equationStart, cue("equation").endFrame) * 5,
          ),
        )
      : undefined;
  const tenFrameSegments: TenFrameSegment[] = [
    makeSegment(sixCount, colors.sunshine, colors.coral),
    makeSegment(fourCount, colors.mint, colors.sky),
  ].filter((segment): segment is TenFrameSegment => segment !== null);
  const fourBraceStart = cellPosition(6);
  const fourBraceWidth = 4 * tenFrame.size + 3 * tenFrame.gap;

  return (
    <SceneFrame accent={colors.reward} eyebrow="凑十" title="6 和 4 凑成 10">
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <rect
          fill={colors.paleCream}
          height={386}
          rx={34}
          stroke={colors.white}
          strokeWidth={8}
          width={1040}
          x={120}
          y={206}
        />
        <rect
          fill={colors.white}
          height={262}
          rx={30}
          stroke={colors.textNavy}
          strokeWidth={4}
          width={520}
          x={260}
          y={254}
        />
        <text
          fill={colors.softGrayBlue}
          fontFamily={typography.fontFamily}
          fontSize={26}
          fontWeight={900}
          textAnchor="middle"
          x={520}
          y={236}
        >
          十格框
        </text>

        <TenFrameRod
          filled={filledCount}
          ones={filledCount}
          segments={tenFrameSegments}
          size={tenFrame.size}
          x={tenFrame.x}
          y={tenFrame.y}
        />

        <g opacity={findFourOpacity}>
          {emptyCellIndexes.map((index) => {
            const cell = cellPosition(index);

            return (
              <PulseCircle
                color={colors.mint}
                cx={cell.cx}
                cy={cell.cy}
                key={index}
                radius={28}
                repeatCount={2}
                spread={20}
                startFrame={findFourStart + (index - 6) * 4}
              />
            );
          })}
        </g>

        {Array.from({ length: 10 }, (_, index) => {
          const cell = cellPosition(index);
          const cellProgress =
            frame >= makeTenStart
              ? 1
              : index < 6
                ? reveal(frame, showSixStart + index * 3, 10)
                : reveal(frame, addFourStart + (index - 6) * 5, 10);
          const visible = index < filledCount ? cellProgress : 0;
          const color = index < 6 ? colors.sunshine : colors.mint;
          const dotColor = index < 6 ? colors.coral : colors.sky;
          const scale = 0.72 + visible * 0.28;
          const emptyHint =
            emptyCellIndexes.includes(index) && index >= filledCount
              ? findFourOpacity
              : 0;

          return (
            <g key={index}>
              <rect
                fill={colors.mint}
                height={tenFrame.size}
                opacity={emptyHint * 0.18}
                rx={8}
                stroke={colors.mint}
                strokeWidth={4}
                width={tenFrame.size}
                x={cell.left}
                y={cell.top}
              />
              <g
                opacity={visible}
                transform={`translate(${cell.cx} ${cell.cy}) scale(${scale}) translate(${-cell.cx} ${-cell.cy})`}
              >
                <rect
                  fill={color}
                  height={tenFrame.size}
                  rx={8}
                  stroke={colors.textNavy}
                  strokeWidth={3}
                  width={tenFrame.size}
                  x={cell.left}
                  y={cell.top}
                />
                <circle
                  cx={cell.cx}
                  cy={cell.cy}
                  fill={dotColor}
                  r={tenFrame.size * 0.2}
                  stroke={colors.textNavy}
                  strokeWidth={2}
                />
              </g>
            </g>
          );
        })}

        <g opacity={findFourOpacity}>
          <PointerHandArrow
            direction="down"
            progress={reveal(frame, findFourStart + 4, 12)}
            size={76}
            variant="hand"
            x={fourBraceStart.left + fourBraceWidth / 2}
            y={248}
          />
          <PartWholeBrace
            direction="down"
            label="4"
            progress={reveal(frame, findFourStart + 8, 16)}
            width={fourBraceWidth}
            x={fourBraceStart.left}
            y={fourBraceStart.top + tenFrame.size + 30}
          />
        </g>

        <g opacity={makeTenDetailOpacity}>
          <PartWholeBrace
            direction="down"
            label="4"
            progress={reveal(frame, makeTenStart + 8, 18)}
            width={fourBraceWidth}
            x={fourBraceStart.left}
            y={fourBraceStart.top + tenFrame.size + 30}
          />
        </g>

        <g opacity={reveal(frame, cue("opening").startFrame + 4, 16)}>
          <NumberCard
            color={colors.white}
            focused={frame >= cue("opening").startFrame}
            height={118}
            value={10}
            width={104}
            x={968}
            y={282}
          />
          <text
            fill={colors.softGrayBlue}
            fontFamily={typography.fontFamily}
            fontSize={24}
            fontWeight={900}
            textAnchor="middle"
            x={968}
            y={364}
          >
            目标
          </text>
        </g>

        <g opacity={reveal(frame, showSixStart, 14) * sideNumberOpacity}>
          <NumberCard
            color={colors.sunshine}
            focused={frame >= showSixStart && frame < addFourStart}
            value={6}
            x={886}
            y={454}
          />
        </g>

        <g opacity={reveal(frame, findFourStart, 14) * sideNumberOpacity}>
          <NumberCard
            color={colors.mint}
            focused={frame >= findFourStart && frame < makeTenStart}
            value={4}
            x={1048}
            y={454}
          />
        </g>

        <g
          opacity={makeTenOpacity}
          transform={`translate(968 282) scale(${totalScale}) translate(-968 -282)`}
        >
          <NumberCard
            color={colors.mint}
            correct={frame >= makeTenStart}
            focused={frame >= makeTenStart}
            height={118}
            value={10}
            width={104}
            x={968}
            y={282}
          />
        </g>

        <g
          opacity={equationOpacity}
          transform={`translate(0 ${interpolate(equationOpacity, [0, 1], [10, 0])})`}
        >
          <EquationStrip
            activeIndex={activeEquationIndex}
            color={colors.white}
            height={82}
            terms={[6, "+", 4, "=", 10]}
            tileWidth={88}
            x={640}
            y={520}
          />
        </g>

        <SparkleBurst
          count={12}
          radius={92}
          startFrame={equationStart + 26}
          x={840}
          y={520}
        />
      </svg>
    </SceneFrame>
  );
};
