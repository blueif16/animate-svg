import type { ReactNode, SVGProps } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { DrawPath } from "../motion-primitives";
import { colors } from "../theme";
import {
  CARD_RADIUS,
  NAVY_STROKE,
  PlacedGroup,
  PrimitiveLabel,
  SelectionRing,
  StateBadge,
  clamp01,
  fontFamily,
  resolveColor,
  shadowStyle,
  stateOpacity,
  type PlacementProps,
  type PrimitiveGroupProps,
  type SelectionProps,
  type ThemeColor,
} from "./shared";

export type HanziPictureVariant =
  | "book"
  | "heart"
  | "moon"
  | "person"
  | "sun"
  | "tree"
  | "water";

export type HanziCardProps = PrimitiveGroupProps &
  PlacementProps & {
    char: string;
    color?: ThemeColor;
    focused?: boolean;
    height?: number;
    picture?: HanziPictureVariant;
    pinyin?: string;
    selected?: boolean;
    width?: number;
    word?: string;
  };

const PictureGlyph = ({
  color,
  variant,
}: {
  color: string;
  variant: HanziPictureVariant;
}) => {
  if (variant === "sun") {
    return (
      <g className="picture">
        <circle
          cx={0}
          cy={0}
          fill={colors.sunshine}
          r={18}
          stroke={colors.textNavy}
          strokeWidth={3}
        />
        {Array.from({ length: 8 }, (_, index) => {
          const angle = (index * Math.PI) / 4;

          return (
            <line
              key={index}
              stroke={colors.textNavy}
              strokeLinecap="round"
              strokeWidth={3}
              x1={Math.cos(angle) * 25}
              x2={Math.cos(angle) * 32}
              y1={Math.sin(angle) * 25}
              y2={Math.sin(angle) * 32}
            />
          );
        })}
      </g>
    );
  }

  if (variant === "moon") {
    return (
      <path
        className="picture"
        d="M 17 -23 C -11 -19 -20 12 0 28 C -29 21 -36 -17 -8 -34 C 0 -38 10 -33 17 -23 Z"
        fill={colors.lavender}
        stroke={colors.textNavy}
        strokeLinejoin="round"
        strokeWidth={3}
      />
    );
  }

  if (variant === "tree") {
    return (
      <g className="picture">
        <rect
          fill={colors.reward}
          height={28}
          rx={5}
          stroke={colors.textNavy}
          strokeWidth={3}
          width={16}
          x={-8}
          y={2}
        />
        <circle
          cx={0}
          cy={-12}
          fill={colors.mint}
          r={25}
          stroke={colors.textNavy}
          strokeWidth={3}
        />
      </g>
    );
  }

  if (variant === "water") {
    return (
      <path
        className="picture"
        d="M -34 8 C -19 -8 -6 24 9 8 C 21 -5 29 0 37 8 M -31 25 C -15 10 -3 39 14 24 C 24 15 31 17 38 25"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={7}
      />
    );
  }

  if (variant === "person") {
    return (
      <g className="picture">
        <circle
          cx={0}
          cy={-18}
          fill={colors.paleCream}
          r={14}
          stroke={colors.textNavy}
          strokeWidth={3}
        />
        <path
          d="M -28 28 C -18 3 18 3 28 28"
          fill={color}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
      </g>
    );
  }

  if (variant === "heart") {
    return (
      <path
        className="picture"
        d="M 0 28 C -29 9 -36 -9 -25 -22 C -16 -33 -3 -25 0 -14 C 4 -25 17 -33 26 -22 C 37 -9 29 9 0 28 Z"
        fill={colors.coral}
        stroke={colors.textNavy}
        strokeLinejoin="round"
        strokeWidth={3}
      />
    );
  }

  return (
    <g className="picture">
      <path
        d="M -27 -28 H 18 C 28 -28 33 -22 33 -13 V 27 H -17 C -25 27 -33 19 -33 11 V -22 C -33 -25 -31 -28 -27 -28 Z"
        fill={colors.sky}
        stroke={colors.textNavy}
        strokeLinejoin="round"
        strokeWidth={3}
      />
      <path
        d="M -17 -19 H 20 M -17 -6 H 20 M -17 7 H 12"
        opacity={0.45}
        stroke={colors.white}
        strokeLinecap="round"
        strokeWidth={4}
      />
    </g>
  );
};

export const HanziCard = ({
  char,
  color,
  focused = false,
  height = 206,
  picture,
  pinyin,
  selected = false,
  transform,
  width = 168,
  word,
  x = 0,
  y = 0,
  ...groupProps
}: HanziCardProps) => {
  const fill = resolveColor(color, colors.white);

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g style={shadowStyle()}>
        <rect
          className="base"
          fill={fill}
          height={height}
          rx={CARD_RADIUS}
          stroke={colors.textNavy}
          strokeWidth={NAVY_STROKE}
          width={width}
          x={-width / 2}
          y={-height / 2}
        />
        <SelectionRing
          focused={focused}
          height={height}
          selected={selected}
          width={width}
          x={-width / 2}
          y={-height / 2}
        />
        {picture ? (
          <g
            transform={`translate(${width / 2 - 42} ${-height / 2 + 42}) scale(0.58)`}
          >
            <PictureGlyph color={colors.sky} variant={picture} />
          </g>
        ) : null}
        {pinyin ? (
          <PrimitiveLabel
            fill={colors.softGrayBlue}
            fontSize={22}
            fontWeight={800}
            x={0}
            y={-height / 2 + 32}
          >
            {pinyin}
          </PrimitiveLabel>
        ) : null}
        <text
          dominantBaseline="middle"
          fill={colors.textNavy}
          fontFamily={fontFamily}
          fontSize={92}
          fontWeight={900}
          textAnchor="middle"
          y={pinyin ? 12 : -2}
        >
          {char}
        </text>
        {word ? (
          <PrimitiveLabel
            fill={colors.softGrayBlue}
            fontSize={23}
            fontWeight={800}
            x={0}
            y={height / 2 - 28}
          >
            {word}
          </PrimitiveLabel>
        ) : null}
      </g>
    </PlacedGroup>
  );
};

export type RadicalTileProps = PrimitiveGroupProps &
  PlacementProps &
  SelectionProps & {
    color?: ThemeColor;
    height?: number;
    label?: ReactNode;
    radical: string;
    width?: number;
  };

export const RadicalTile = ({
  color,
  correct = false,
  disabled = false,
  focused = false,
  height = 118,
  label,
  radical,
  selected = false,
  transform,
  width = 118,
  wrong = false,
  x = 0,
  y = 0,
  ...groupProps
}: RadicalTileProps) => {
  const fill = resolveColor(color, colors.paleCream);

  return (
    <PlacedGroup
      {...groupProps}
      opacity={stateOpacity(disabled)}
      transform={transform}
      x={x}
      y={y}
    >
      <g style={shadowStyle()}>
        <rect
          className="base"
          fill={fill}
          height={height}
          rx={CARD_RADIUS}
          stroke={colors.textNavy}
          strokeWidth={NAVY_STROKE}
          width={width}
          x={-width / 2}
          y={-height / 2}
        />
        <SelectionRing
          correct={correct}
          disabled={disabled}
          focused={focused}
          height={height}
          selected={selected}
          width={width}
          wrong={wrong}
          x={-width / 2}
          y={-height / 2}
        />
        <StateBadge
          correct={correct}
          disabled={disabled}
          wrong={wrong}
          x={width / 2 - 12}
          y={-height / 2 + 12}
        />
        <text
          dominantBaseline="middle"
          fill={colors.textNavy}
          fontFamily={fontFamily}
          fontSize={56}
          fontWeight={900}
          textAnchor="middle"
          y={label ? -8 : 1}
        >
          {radical}
        </text>
        {label ? (
          <PrimitiveLabel
            fill={colors.softGrayBlue}
            fontSize={19}
            fontWeight={800}
            x={0}
            y={height / 2 - 21}
          >
            {label}
          </PrimitiveLabel>
        ) : null}
      </g>
    </PlacedGroup>
  );
};

export type StrokeGuideGrid = "half" | "mi" | "tian";

export type StrokeGuideFocusZone =
  | "bottom"
  | "center"
  | "left"
  | "right"
  | "top"
  | {
      height: number;
      width: number;
      x: number;
      y: number;
    };

export type StrokeGuideCellProps = PrimitiveGroupProps &
  PlacementProps & {
    focusZone?: StrokeGuideFocusZone;
    grid?: StrokeGuideGrid;
    height?: number;
    width?: number;
  };

const resolveFocusZoneRect = (
  focusZone: StrokeGuideFocusZone | undefined,
  width: number,
  height: number,
) => {
  if (!focusZone) {
    return undefined;
  }

  if (typeof focusZone !== "string") {
    return focusZone;
  }

  if (focusZone === "center") {
    return {
      height: height * 0.44,
      width: width * 0.44,
      x: width * 0.28,
      y: height * 0.28,
    };
  }

  if (focusZone === "top" || focusZone === "bottom") {
    return {
      height: height / 2,
      width,
      x: 0,
      y: focusZone === "top" ? 0 : height / 2,
    };
  }

  return {
    height,
    width: width / 2,
    x: focusZone === "left" ? 0 : width / 2,
    y: 0,
  };
};

export const StrokeGuideCell = ({
  focusZone,
  grid = "tian",
  height = 220,
  transform,
  width = 220,
  x = 0,
  y = 0,
  ...groupProps
}: StrokeGuideCellProps) => {
  const zone = resolveFocusZoneRect(focusZone, width, height);

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <rect
        className="base"
        fill={colors.white}
        height={height}
        rx={18}
        stroke={colors.textNavy}
        strokeWidth={NAVY_STROKE}
        width={width}
      />
      {zone ? (
        <rect
          className="focus-zone"
          fill={colors.sunshine}
          height={zone.height}
          opacity={0.28}
          rx={14}
          width={zone.width}
          x={zone.x}
          y={zone.y}
        />
      ) : null}
      <line
        className="grid"
        stroke={colors.softGrayBlue}
        strokeDasharray="8 8"
        strokeLinecap="round"
        strokeWidth={3}
        x1={width / 2}
        x2={width / 2}
        y1={12}
        y2={height - 12}
      />
      <line
        className="grid"
        stroke={colors.softGrayBlue}
        strokeDasharray="8 8"
        strokeLinecap="round"
        strokeWidth={3}
        x1={12}
        x2={width - 12}
        y1={height / 2}
        y2={height / 2}
      />
      {grid === "mi" ? (
        <>
          <line
            className="grid"
            stroke={colors.softGrayBlue}
            strokeDasharray="7 9"
            strokeLinecap="round"
            strokeWidth={3}
            x1={16}
            x2={width - 16}
            y1={16}
            y2={height - 16}
          />
          <line
            className="grid"
            stroke={colors.softGrayBlue}
            strokeDasharray="7 9"
            strokeLinecap="round"
            strokeWidth={3}
            x1={width - 16}
            x2={16}
            y1={16}
            y2={height - 16}
          />
        </>
      ) : null}
      {grid === "half" ? (
        <rect
          className="grid-half"
          fill="none"
          height={height / 2 - 18}
          opacity={0.55}
          rx={12}
          stroke={colors.sky}
          strokeDasharray="9 8"
          strokeWidth={3}
          width={width - 36}
          x={18}
          y={18}
        />
      ) : null}
    </PlacedGroup>
  );
};

export type StrokeCursor =
  | boolean
  | {
      color?: ThemeColor;
      radius?: number;
      x?: number;
      y?: number;
    };

export type AnimatedStrokePathProps = Omit<
  SVGProps<SVGPathElement>,
  | "cursor"
  | "d"
  | "pathLength"
  | "stroke"
  | "strokeDasharray"
  | "strokeDashoffset"
  | "strokeWidth"
> & {
  active?: boolean;
  cursor?: StrokeCursor;
  d: string;
  durationInFrames?: number;
  ghost?: boolean;
  progress?: number;
  startFrame?: number;
  stroke?: ThemeColor;
  strokeWidth?: number;
};

const pathEndpoints = (d: string) => {
  const numbers = d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number) ?? [];

  if (numbers.length < 4) {
    return undefined;
  }

  return {
    end: { x: numbers[numbers.length - 2], y: numbers[numbers.length - 1] },
    start: { x: numbers[0], y: numbers[1] },
  };
};

export const AnimatedStrokePath = ({
  active = true,
  cursor = false,
  d,
  durationInFrames = 36,
  ghost = true,
  progress,
  startFrame = 0,
  stroke = colors.coral,
  strokeWidth = 28,
  ...pathProps
}: AnimatedStrokePathProps) => {
  const frame = useCurrentFrame();
  const reveal = active
    ? clamp01(
        progress ??
          interpolate(
            frame,
            [startFrame, startFrame + durationInFrames],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
      )
    : 0;
  const resolvedStroke = resolveColor(stroke, colors.coral);
  const endpoints = pathEndpoints(d);
  const cursorConfig: Exclude<StrokeCursor, boolean> =
    typeof cursor === "object" ? cursor : {};
  const cursorX =
    cursorConfig.x ??
    (endpoints
      ? endpoints.start.x + (endpoints.end.x - endpoints.start.x) * reveal
      : undefined);
  const cursorY =
    cursorConfig.y ??
    (endpoints
      ? endpoints.start.y + (endpoints.end.y - endpoints.start.y) * reveal
      : undefined);

  return (
    <g className="animated-stroke-path">
      {ghost ? (
        <path
          d={d}
          fill="none"
          opacity={0.16}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
        />
      ) : null}
      <DrawPath
        d={d}
        durationInFrames={durationInFrames}
        progress={reveal}
        startFrame={startFrame}
        stroke={resolvedStroke}
        strokeWidth={strokeWidth}
        {...pathProps}
      />
      {cursor && cursorX !== undefined && cursorY !== undefined ? (
        <circle
          className="cursor"
          cx={cursorX}
          cy={cursorY}
          fill={resolveColor(cursorConfig.color, colors.reward)}
          opacity={reveal > 0 ? 1 : 0}
          r={cursorConfig.radius ?? strokeWidth * 0.38}
          stroke={colors.textNavy}
          strokeWidth={3}
        />
      ) : null}
    </g>
  );
};

export type ToneNumber = 0 | 1 | 2 | 3 | 4;

export type ToneMarkGlyphProps = PrimitiveGroupProps &
  PlacementProps & {
    color?: ThemeColor;
    progress?: number;
    size?: number;
    tone: ToneNumber;
  };

const tonePath = (tone: ToneNumber, size: number) => {
  const half = size / 2;

  if (tone === 1) {
    return `M ${-half} 0 H ${half}`;
  }

  if (tone === 2) {
    return `M ${-half} ${half * 0.36} L ${half} ${-half * 0.36}`;
  }

  if (tone === 3) {
    return `M ${-half} ${-half * 0.18} Q 0 ${half * 0.5} ${half} ${-half * 0.18}`;
  }

  if (tone === 4) {
    return `M ${-half} ${-half * 0.36} L ${half} ${half * 0.36}`;
  }

  return "";
};

export const ToneMarkGlyph = ({
  color,
  progress = 1,
  size = 34,
  tone,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: ToneMarkGlyphProps) => {
  const stroke = resolveColor(color, colors.coral);
  const reveal = clamp01(progress);

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      {tone === 0 ? (
        <circle
          fill={stroke}
          opacity={0.45 + reveal * 0.55}
          r={size * 0.18}
          stroke={colors.textNavy}
          strokeWidth={2}
        />
      ) : (
        <path
          d={tonePath(tone, size)}
          fill="none"
          pathLength={1}
          stroke={stroke}
          strokeDasharray={1}
          strokeDashoffset={1 - reveal}
          strokeLinecap="round"
          strokeWidth={Math.max(4, size * 0.16)}
        />
      )}
    </PlacedGroup>
  );
};

export type PinyinHighlight = "final" | "initial" | "none" | "tone";

export type PinyinSyllableCardProps = PrimitiveGroupProps &
  PlacementProps &
  Pick<SelectionProps, "focused" | "selected"> & {
    color?: ThemeColor;
    final: string;
    height?: number;
    highlight?: PinyinHighlight;
    initial?: string;
    tone?: ToneNumber;
    width?: number;
  };

export const PinyinSyllableCard = ({
  color,
  final,
  focused = false,
  height = 126,
  highlight = "none",
  initial = "",
  selected = false,
  tone = 0,
  transform,
  width = 210,
  x = 0,
  y = 0,
  ...groupProps
}: PinyinSyllableCardProps) => {
  const fill = resolveColor(color, colors.white);
  const initialWidth = initial ? width * 0.38 : 0;
  const finalWidth = width - initialWidth - 18;
  const initialActive = highlight === "initial";
  const finalActive = highlight === "final";

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g style={shadowStyle()}>
        <rect
          className="base"
          fill={fill}
          height={height}
          rx={CARD_RADIUS}
          stroke={colors.textNavy}
          strokeWidth={NAVY_STROKE}
          width={width}
          x={-width / 2}
          y={-height / 2}
        />
        <SelectionRing
          focused={focused}
          height={height}
          selected={selected}
          width={width}
          x={-width / 2}
          y={-height / 2}
        />
        {initial ? (
          <rect
            fill={initialActive ? colors.sunshine : colors.cream}
            height={height - 26}
            rx={15}
            width={initialWidth}
            x={-width / 2 + 13}
            y={-height / 2 + 13}
          />
        ) : null}
        <rect
          fill={finalActive ? colors.mint : colors.cream}
          height={height - 26}
          rx={15}
          width={finalWidth}
          x={-width / 2 + 13 + initialWidth + (initial ? 8 : 0)}
          y={-height / 2 + 13}
        />
        {initial ? (
          <PrimitiveLabel
            fontSize={34}
            x={-width / 2 + 13 + initialWidth / 2}
            y={7}
          >
            {initial}
          </PrimitiveLabel>
        ) : null}
        <PrimitiveLabel
          fontSize={38}
          x={
            -width / 2 + 13 + initialWidth + (initial ? 8 : 0) + finalWidth / 2
          }
          y={7}
        >
          {final}
        </PrimitiveLabel>
        <ToneMarkGlyph
          color={highlight === "tone" ? colors.coral : colors.softGrayBlue}
          progress={highlight === "tone" ? 1 : 0.72}
          size={30}
          tone={tone}
          x={width / 2 - 34}
          y={-height / 2 + 28}
        />
      </g>
    </PlacedGroup>
  );
};

export type MouthShapeState = "open" | "round" | "smile" | "teeth";

export type MouthShapeIconProps = PrimitiveGroupProps &
  PlacementProps & {
    color?: ThemeColor;
    size?: number;
    state?: MouthShapeState;
  };

export const MouthShapeIcon = ({
  color,
  size = 92,
  state = "open",
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: MouthShapeIconProps) => {
  const fill = resolveColor(color, colors.paleCream);
  const scale = size / 92;

  return (
    <PlacedGroup
      {...groupProps}
      transform={[`scale(${scale})`, transform].filter(Boolean).join(" ")}
      x={x}
      y={y}
    >
      <circle
        className="base"
        cx={0}
        cy={0}
        fill={fill}
        r={42}
        stroke={colors.textNavy}
        strokeWidth={NAVY_STROKE}
      />
      <circle cx={-15} cy={-12} fill={colors.textNavy} r={4} />
      <circle cx={15} cy={-12} fill={colors.textNavy} r={4} />
      {state === "round" ? (
        <ellipse
          className="mouth"
          cx={0}
          cy={15}
          fill={colors.white}
          rx={14}
          ry={18}
          stroke={colors.textNavy}
          strokeWidth={5}
        />
      ) : state === "smile" ? (
        <path
          className="mouth"
          d="M -21 11 Q 0 29 21 11"
          fill="none"
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={6}
        />
      ) : state === "teeth" ? (
        <g className="mouth">
          <rect
            fill={colors.white}
            height={20}
            rx={8}
            stroke={colors.textNavy}
            strokeWidth={5}
            width={44}
            x={-22}
            y={8}
          />
          <line
            stroke={colors.textNavy}
            strokeWidth={3}
            x1={0}
            x2={0}
            y1={9}
            y2={27}
          />
        </g>
      ) : (
        <ellipse
          className="mouth"
          cx={0}
          cy={16}
          fill={colors.coral}
          rx={17}
          ry={22}
          stroke={colors.textNavy}
          strokeWidth={5}
        />
      )}
    </PlacedGroup>
  );
};
