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

/**
 * The geometry of one Mandarin tone contour, in local coords (origin centered).
 * `start`/`end` are the two endpoints; `control` is the quadratic-Bézier control
 * point for the curved third tone (undefined for the straight contours). This is
 * the SINGLE source of truth for the contour shape — both `tonePath` (which draws
 * the stroke) and `tonePointAt` (which samples a point along it for PitchPlayhead)
 * read from it, so the drawn line and the playhead can never drift apart.
 */
const toneGeometry = (
  tone: ToneNumber,
  size: number,
):
  | {
      control?: { x: number; y: number };
      end: { x: number; y: number };
      start: { x: number; y: number };
    }
  | undefined => {
  const half = size / 2;

  if (tone === 1) {
    return { end: { x: half, y: 0 }, start: { x: -half, y: 0 } };
  }

  if (tone === 2) {
    return {
      end: { x: half, y: -half * 0.36 },
      start: { x: -half, y: half * 0.36 },
    };
  }

  if (tone === 3) {
    return {
      control: { x: 0, y: half * 0.5 },
      end: { x: half, y: -half * 0.18 },
      start: { x: -half, y: -half * 0.18 },
    };
  }

  if (tone === 4) {
    return {
      end: { x: half, y: half * 0.36 },
      start: { x: -half, y: -half * 0.36 },
    };
  }

  return undefined;
};

const tonePath = (tone: ToneNumber, size: number) => {
  const geom = toneGeometry(tone, size);

  if (!geom) {
    return "";
  }

  if (tone === 1) {
    return `M ${geom.start.x} ${geom.start.y} H ${geom.end.x}`;
  }

  if (geom.control) {
    return `M ${geom.start.x} ${geom.start.y} Q ${geom.control.x} ${geom.control.y} ${geom.end.x} ${geom.end.y}`;
  }

  return `M ${geom.start.x} ${geom.start.y} L ${geom.end.x} ${geom.end.y}`;
};

/**
 * The point at parameter `t` (0..1) along a tone contour — the position the
 * PitchPlayhead rides. Straight contours interpolate linearly between endpoints;
 * the curved third tone evaluates its quadratic Bézier. Returns the origin for
 * the neutral tone (no contour). Shares `toneGeometry` with `tonePath` so the dot
 * sits exactly on the stroke ToneMarkGlyph draws.
 */
const tonePointAt = (tone: ToneNumber, size: number, t: number) => {
  const geom = toneGeometry(tone, size);

  if (!geom) {
    return { x: 0, y: 0 };
  }

  if (geom.control) {
    const inv = 1 - t;
    const a = inv * inv;
    const b = 2 * inv * t;
    const c = t * t;

    return {
      x: a * geom.start.x + b * geom.control.x + c * geom.end.x,
      y: a * geom.start.y + b * geom.control.y + c * geom.end.y,
    };
  }

  return {
    x: geom.start.x + (geom.end.x - geom.start.x) * t,
    y: geom.start.y + (geom.end.y - geom.start.y) * t,
  };
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

export type PitchPlayheadProps = PrimitiveGroupProps &
  PlacementProps & {
    color?: ThemeColor;
    progress?: number;
    showTrail?: boolean;
    size?: number;
    tone?: ToneNumber;
  };

/**
 * A moving dot that traces a Mandarin tone contour — the "where the pitch is
 * right now" marker. It rides the SAME contour geometry `ToneMarkGlyph` draws
 * (via the shared `tonePointAt`), so the dot always sits on the stroke. Drive it
 * with `progress` (0..1 position along the contour); deterministic, no time
 * source. `showTrail` paints the already-traveled portion of the contour as a
 * faint wake behind the dot. Pair it OVER a `ToneMarkGlyph` of the same `tone` /
 * `size` — ToneMarkGlyph draws the shape, this animates a marker along it.
 */
export const PitchPlayhead = ({
  color,
  progress = 0,
  showTrail = false,
  size = 34,
  tone = 0,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: PitchPlayheadProps) => {
  const dotColor = resolveColor(color, colors.coral);
  const t = clamp01(progress);
  const point = tonePointAt(tone, size, t);
  const trail = tonePath(tone, size);

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      {showTrail && trail ? (
        <path
          className="trail"
          d={trail}
          fill="none"
          opacity={0.4}
          pathLength={1}
          stroke={dotColor}
          strokeDasharray={1}
          strokeDashoffset={1 - t}
          strokeLinecap="round"
          strokeWidth={Math.max(4, size * 0.16)}
        />
      ) : null}
      <circle
        className="playhead"
        cx={point.x}
        cy={point.y}
        fill={dotColor}
        r={Math.max(5, size * 0.2)}
        stroke={colors.textNavy}
        strokeWidth={3}
      />
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

export type ListenIconState = "idle" | "playing";

export type ListenIconProps = PrimitiveGroupProps &
  PlacementProps & {
    color?: ThemeColor;
    progress?: number;
    size?: number;
    state?: ListenIconState;
  };

/**
 * A small speaker "tap to hear" affordance — it signals that a sound/syllable
 * CAN be played, not how it is articulated. In `state="playing"` the two sound
 * arcs swell outward, driven deterministically by `progress` (0..1, no time
 * source); in `state="idle"` they rest at full reach so the icon still reads as
 * audio. This is an AFFORDANCE icon — for teaching lip position use
 * MouthShapeIcon, which shows articulation.
 */
export const ListenIcon = ({
  color,
  progress = 0,
  size = 64,
  state = "idle",
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: ListenIconProps) => {
  const tint = resolveColor(color, colors.sky);
  const scale = size / 64;
  // In `playing`, the two arcs swell out and back over the progress cycle; in
  // `idle` they rest at full reach. The triangular swell keeps the motion
  // deterministic and seamless when progress loops.
  const swell =
    state === "playing"
      ? 0.45 + 0.55 * (1 - Math.abs(clamp01(progress) * 2 - 1))
      : 1;

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
        fill={colors.white}
        r={30}
        stroke={colors.textNavy}
        strokeWidth={NAVY_STROKE}
      />
      <path
        className="speaker"
        d="M -16 -8 H -7 L 4 -17 V 17 L -7 8 H -16 Z"
        fill={tint}
        stroke={colors.textNavy}
        strokeLinejoin="round"
        strokeWidth={3}
      />
      <g className="waves" opacity={state === "playing" ? 1 : 0.55}>
        <path
          d="M 11 -9 Q 16 0 11 9"
          fill="none"
          opacity={swell}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={3}
        />
        <path
          d="M 18 -15 Q 26 0 18 15"
          fill="none"
          opacity={state === "playing" ? swell * swell : 0.55}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={3}
        />
      </g>
    </PlacedGroup>
  );
};

export type LessonIntroCardProps = PrimitiveGroupProps &
  PlacementProps & {
    /**
     * The lesson title — the largest line. A localized ReactNode (a string, or
     * a <tspan>-wrapped node for multi-line / styled titles). NEVER baked: the
     * caller passes "五的分与合" / "Hello & Greetings" / any node.
     */
    title: ReactNode;
    /**
     * Optional section / unit eyebrow above the title (e.g. "Unit 1 · Hello!"
     * or "第一单元"). Places the lesson in its curriculum slot. Omit for none.
     * Localized caller node — never baked.
     */
    section?: ReactNode;
    /**
     * Optional one-line KP teaser below the title (e.g. "say hello, say who you
     * are, say goodbye"). Localized caller node — never baked. Omit for none.
     */
    teaser?: ReactNode;
    /**
     * Reveal driver, 0..1 — derived by the caller from
     * `cues[id].startFrame + offset` (ZERO frame literals here). The three rows
     * fade+rise in a short stagger and the underline draws on as progress runs.
     * At 0 nothing shows; at 1 the card is fully settled.
     */
    progress?: number;
    /**
     * Title cap-height in px. Default 96 (well above the 48px primary-label
     * kids-eye minimum). The section + teaser scale relative to this.
     */
    titleSize?: number;
    /** Title ink color. Default textNavy. */
    titleColor?: ThemeColor;
    /** Section eyebrow + teaser ink color. Default softGrayBlue. */
    subColor?: ThemeColor;
    /**
     * Color of the write-on underline under the title — the teaching/speaking
     * accent. Default reward. Drop the underline entirely with
     * `underline={false}`.
     */
    accentColor?: ThemeColor;
    /** Draw the write-on underline under the title. Default true. */
    underline?: boolean;
    /**
     * Render a rounded card surface behind the text. Default false — most
     * lessons keep the canvas as the only background (decoration budget). Flip
     * on for a held title card.
     */
    card?: boolean;
    /** Card fill when `card` is on. Default white. */
    cardFill?: ThemeColor;
    /** Card stroke when `card` is on. Default textNavy. */
    cardStroke?: ThemeColor;
    /** Card width when `card` is on. Default 1180. */
    cardWidth?: number;
    /** Card height when `card` is on. Default 360. */
    cardHeight?: number;
  };

/**
 * LessonIntroCard — the normalized topic-intro card every lesson opens with
 * (CLAUDE.md: every lesson opens with a short text intro announcing the topic —
 * title + section + KP teaser). Lays out, centered top-to-bottom: an optional
 * SECTION / unit eyebrow, the TITLE (largest line), an optional one-line KP
 * TEASER, with a write-on accent underline under the title — all revealing in
 * via ONE `progress` (0..1): the three rows fade + rise in a short stagger and
 * the underline draws on.
 *
 * Lesson-AGNOSTIC & prop-driven — bakes NO copy, NO topic, NO Chinese/English
 * string: `title` / `section` / `teaser` are caller ReactNodes. ZERO frame
 * literals — the caller passes `progress` derived from `cues[id].startFrame +
 * offset`; this primitive reads no master-timeline frame. The card surface
 * defaults OFF so the lesson canvas stays the only background (decoration
 * budget); flip `card` on for a held title card. The SAME primitive drives a
 * Math title, a Chinese title, an English greetings title — only the props vary.
 *
 * Composes the shared text idiom (fontFamily) + a `<line>` draw-on underline
 * (the same write-on idiom as TeacherMark's underline, kept self-contained so
 * the intro card has no motion-primitive import cycle).
 */
export const LessonIntroCard = ({
  title,
  section,
  teaser,
  progress = 1,
  titleSize = 96,
  titleColor = "textNavy",
  subColor = "softGrayBlue",
  accentColor = "reward",
  underline = true,
  card = false,
  cardFill = "white",
  cardStroke = "textNavy",
  cardWidth = 1180,
  cardHeight = 360,
  x = 0,
  y = 0,
  ...groupProps
}: LessonIntroCardProps) => {
  const p = clamp01(progress);

  // Row vertical rhythm, measured from the card center (y = 0 local).
  const sectionSize = Math.round(titleSize * 0.34);
  const teaserSize = Math.round(titleSize * 0.44);
  const sectionY = section ? -titleSize * 0.86 : 0;
  const titleY = section ? -titleSize * 0.04 : -titleSize * 0.18;
  const underlineY = titleY + titleSize * 0.62;
  const teaserY = underlineY + teaserSize * 1.28;

  // Underline half-width derived from the title size (a heading-length rule),
  // so callers don't hand-tune it. The caller can still place the whole card.
  const underlineHalf = titleSize * 1.9;

  // Staggered per-row reveal — each row fades + rises within its own slice of
  // `progress` so the eye lands section → title → underline → teaser in order.
  // Pure functions of `p`; no frame literals.
  const rowReveal = (start: number, end: number) =>
    clamp01((p - start) / Math.max(0.0001, end - start));

  const sectionR = rowReveal(0, 0.4);
  const titleR = rowReveal(0.12, 0.62);
  const underlineR = rowReveal(0.5, 0.92);
  const teaserR = rowReveal(0.6, 1);

  const titleInk = resolveColor(titleColor, colors.textNavy);
  const subInk = resolveColor(subColor, colors.softGrayBlue);
  const accentInk = resolveColor(accentColor, colors.reward);

  const Row = ({
    reveal,
    children,
  }: {
    reveal: number;
    children: ReactNode;
  }) => (
    <g
      opacity={reveal}
      transform={`translate(0 ${interpolate(reveal, [0, 1], [14, 0])})`}
    >
      {children}
    </g>
  );

  return (
    <PlacedGroup transform={groupProps.transform} x={x} y={y} {...groupProps}>
      {card ? (
        <rect
          fill={resolveColor(cardFill, colors.white)}
          height={cardHeight}
          opacity={p}
          rx={CARD_RADIUS + 10}
          stroke={resolveColor(cardStroke, colors.textNavy)}
          strokeWidth={NAVY_STROKE}
          width={cardWidth}
          x={-cardWidth / 2}
          y={-cardHeight / 2}
        />
      ) : null}

      {section ? (
        <Row reveal={sectionR}>
          <text
            dominantBaseline="middle"
            fill={subInk}
            fontFamily={fontFamily}
            fontSize={sectionSize}
            fontWeight={800}
            letterSpacing={2}
            textAnchor="middle"
            x={0}
            y={sectionY}
          >
            {section}
          </text>
        </Row>
      ) : null}

      <Row reveal={titleR}>
        <text
          dominantBaseline="middle"
          fill={titleInk}
          fontFamily={fontFamily}
          fontSize={titleSize}
          fontWeight={900}
          textAnchor="middle"
          x={0}
          y={titleY}
        >
          {title}
        </text>
      </Row>

      {underline ? (
        <line
          opacity={underlineR}
          stroke={accentInk}
          strokeLinecap="round"
          strokeWidth={Math.max(6, titleSize * 0.09)}
          x1={-underlineHalf}
          x2={-underlineHalf + underlineHalf * 2 * underlineR}
          y1={underlineY}
          y2={underlineY}
        />
      ) : null}

      {teaser ? (
        <Row reveal={teaserR}>
          <text
            dominantBaseline="middle"
            fill={subInk}
            fontFamily={fontFamily}
            fontSize={teaserSize}
            fontWeight={800}
            textAnchor="middle"
            x={0}
            y={teaserY}
          >
            {teaser}
          </text>
        </Row>
      ) : null}
    </PlacedGroup>
  );
};
