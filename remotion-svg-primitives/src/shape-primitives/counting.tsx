import type { ReactNode } from "react";
import { colors } from "../theme";
import {
  CARD_RADIUS,
  NAVY_STROKE,
  PlacedGroup,
  PrimitiveLabel,
  SelectionRing,
  StateBadge,
  clamp01,
  clampNumber,
  fontFamily,
  resolveColor,
  shadowStyle,
  starPath,
  stateOpacity,
  type PlacementProps,
  type PrimitiveGroupProps,
  type SelectionProps,
  type ThemeColor,
} from "./shared";

export type CountableObjectVariant =
  | "animal"
  | "banana"
  | "block"
  | "fish"
  | "fruit"
  | "star";

export type CountableObjectProps = PrimitiveGroupProps &
  PlacementProps & {
    color?: ThemeColor;
    dimmed?: boolean;
    label?: ReactNode;
    selected?: boolean;
    size?: number;
    variant?: CountableObjectVariant;
  };

const objectFallbackColor = (variant: CountableObjectVariant) => {
  if (variant === "fish") {
    return colors.sky;
  }

  if (variant === "block") {
    return colors.mint;
  }

  if (variant === "animal") {
    return colors.lavender;
  }

  return colors.sunshine;
};

const ObjectFace = ({ y = 5 }: { y?: number }) => (
  <g className="face" transform={`translate(0 ${y})`}>
    <circle cx={-14} cy={-8} fill={colors.textNavy} r={4} />
    <circle cx={14} cy={-8} fill={colors.textNavy} r={4} />
    <path
      d="M -13 9 Q 0 20 13 9"
      fill="none"
      stroke={colors.textNavy}
      strokeLinecap="round"
      strokeWidth={4}
    />
  </g>
);

const CountableShape = ({
  color,
  variant,
}: {
  color: string;
  variant: CountableObjectVariant;
}) => {
  if (variant === "fish") {
    return (
      <g className="body">
        <ellipse
          cx={-3}
          cy={0}
          fill={color}
          rx={40}
          ry={28}
          stroke={colors.textNavy}
          strokeWidth={NAVY_STROKE}
        />
        <path
          d="M 31 -3 L 61 -26 L 58 0 L 61 26 L 31 7 Z"
          fill={colors.coral}
          stroke={colors.textNavy}
          strokeLinejoin="round"
          strokeWidth={NAVY_STROKE}
        />
        <path
          d="M -12 -25 C -3 -42 18 -42 27 -25"
          fill="none"
          opacity={0.45}
          stroke={colors.white}
          strokeLinecap="round"
          strokeWidth={7}
        />
        <circle cx={-23} cy={-7} fill={colors.white} r={8} />
        <circle cx={-20} cy={-7} fill={colors.textNavy} r={4} />
      </g>
    );
  }

  if (variant === "star") {
    return (
      <g className="body">
        <path
          d={starPath(0, 0, 48)}
          fill={color}
          stroke={colors.textNavy}
          strokeLinejoin="round"
          strokeWidth={NAVY_STROKE}
        />
        <path
          d="M -14 -18 L -5 -10 M 16 -17 L 7 -9"
          opacity={0.42}
          stroke={colors.white}
          strokeLinecap="round"
          strokeWidth={6}
        />
        <ObjectFace y={7} />
      </g>
    );
  }

  if (variant === "block") {
    return (
      <g className="body">
        <rect
          fill={color}
          height={68}
          rx={14}
          stroke={colors.textNavy}
          strokeWidth={NAVY_STROKE}
          width={68}
          x={-34}
          y={-34}
        />
        <path
          d="M -34 -12 H 34 M -12 -34 V 34"
          opacity={0.28}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={3}
        />
        <ObjectFace y={10} />
      </g>
    );
  }

  if (variant === "animal") {
    return (
      <g className="body">
        <ellipse
          cx={-24}
          cy={-43}
          fill={colors.paleCream}
          rx={14}
          ry={26}
          stroke={colors.textNavy}
          strokeWidth={NAVY_STROKE}
          transform="rotate(-16 -24 -43)"
        />
        <ellipse
          cx={24}
          cy={-43}
          fill={colors.paleCream}
          rx={14}
          ry={26}
          stroke={colors.textNavy}
          strokeWidth={NAVY_STROKE}
          transform="rotate(16 24 -43)"
        />
        <circle
          cx={0}
          cy={0}
          fill={color}
          r={39}
          stroke={colors.textNavy}
          strokeWidth={NAVY_STROKE}
        />
        <ellipse cx={0} cy={10} fill={colors.white} rx={17} ry={13} />
        <ObjectFace y={4} />
      </g>
    );
  }

  if (variant === "fruit") {
    return (
      <g className="body">
        <path
          d="M 0 -42 C 22 -42 43 -20 43 8 C 43 38 23 55 0 55 C -23 55 -43 38 -43 8 C -43 -20 -22 -42 0 -42 Z"
          fill={color}
          stroke={colors.textNavy}
          strokeLinejoin="round"
          strokeWidth={NAVY_STROKE}
        />
        <path
          d="M -3 -40 C 6 -56 22 -60 37 -49 C 29 -35 13 -31 -3 -40 Z"
          fill={colors.mint}
          stroke={colors.textNavy}
          strokeLinejoin="round"
          strokeWidth={3}
        />
        <path
          d="M -10 -29 C -5 -18 8 -18 13 -29"
          fill="none"
          opacity={0.5}
          stroke={colors.white}
          strokeLinecap="round"
          strokeWidth={7}
        />
        <ObjectFace y={10} />
      </g>
    );
  }

  return (
    <g className="body">
      <path
        d="M -50 -6 C -25 43 42 43 66 -7 C 35 16 -16 16 -35 -20 Z"
        fill={color}
        stroke={colors.textNavy}
        strokeLinejoin="round"
        strokeWidth={NAVY_STROKE}
      />
      <path
        d="M -30 -2 C -4 20 34 20 53 2"
        fill="none"
        opacity={0.42}
        stroke={colors.white}
        strokeLinecap="round"
        strokeWidth={7}
      />
      <ellipse
        cx={-45}
        cy={-17}
        fill={colors.coral}
        rx={8}
        ry={11}
        stroke={colors.textNavy}
        strokeWidth={3}
        transform="rotate(-24 -45 -17)"
      />
      <ellipse
        cx={67}
        cy={-8}
        fill={colors.mint}
        rx={7}
        ry={10}
        stroke={colors.textNavy}
        strokeWidth={3}
        transform="rotate(22 67 -8)"
      />
    </g>
  );
};

export const CountableObject = ({
  color,
  dimmed,
  label,
  selected = false,
  size = 96,
  transform,
  variant = "banana",
  x = 0,
  y = 0,
  ...groupProps
}: CountableObjectProps) => {
  const fill = resolveColor(color, objectFallbackColor(variant));
  const scale = size / 100;

  return (
    <PlacedGroup
      {...groupProps}
      opacity={stateOpacity(undefined, dimmed)}
      transform={[`scale(${scale})`, transform].filter(Boolean).join(" ")}
      x={x}
      y={y}
    >
      <g className="shadow" opacity={0.18}>
        <ellipse cx={4} cy={45} fill={colors.textNavy} rx={44} ry={9} />
      </g>
      {selected ? (
        <circle
          className="select-ring"
          cx={0}
          cy={0}
          fill="none"
          r={58}
          stroke={colors.sky}
          strokeWidth={6}
        />
      ) : null}
      <CountableShape color={fill} variant={variant} />
      {label ? (
        <PrimitiveLabel fontSize={22} x={0} y={76}>
          {label}
        </PrimitiveLabel>
      ) : null}
    </PlacedGroup>
  );
};

export type UnitBlockVariant = "chip" | "cube" | "dot" | "rod";

export type UnitBlockProps = PrimitiveGroupProps &
  PlacementProps & {
    color?: ThemeColor;
    count?: number;
    size?: number;
    stacked?: boolean;
    value?: ReactNode;
    variant?: UnitBlockVariant;
  };

const unitPositions = (count: number, size: number, stacked: boolean) => {
  const gap = size * 0.16;
  const columns = stacked ? 2 : Math.min(count, 5);

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const totalColumns = Math.min(count, columns);
    const totalRows = Math.ceil(count / columns);

    return {
      x: (column - (totalColumns - 1) / 2) * (size + gap),
      y: (row - (totalRows - 1) / 2) * (size + gap),
    };
  });
};

const UnitShape = ({
  color,
  size,
  variant,
}: {
  color: string;
  size: number;
  variant: Exclude<UnitBlockVariant, "rod">;
}) => {
  const half = size / 2;

  if (variant === "dot") {
    return (
      <circle
        className="body"
        cx={0}
        cy={0}
        fill={color}
        r={half * 0.66}
        stroke={colors.textNavy}
        strokeWidth={Math.max(2, size * 0.09)}
      />
    );
  }

  if (variant === "chip") {
    return (
      <rect
        className="body"
        fill={color}
        height={size * 0.62}
        rx={size * 0.18}
        stroke={colors.textNavy}
        strokeWidth={Math.max(2, size * 0.08)}
        width={size}
        x={-half}
        y={-size * 0.31}
      />
    );
  }

  return (
    <g className="body">
      <path
        d={`M ${-half} ${-half * 0.58} L 0 ${-half} L ${half} ${-half * 0.58} L 0 ${-half * 0.14} Z`}
        fill={colors.white}
        opacity={0.6}
      />
      <rect
        fill={color}
        height={size}
        rx={size * 0.14}
        stroke={colors.textNavy}
        strokeWidth={Math.max(2, size * 0.08)}
        width={size}
        x={-half}
        y={-half}
      />
      <path
        d={`M ${-half} ${-half * 0.5} L 0 ${-half * 0.1} L ${half} ${-half * 0.5}`}
        fill="none"
        opacity={0.32}
        stroke={colors.textNavy}
        strokeLinecap="round"
        strokeWidth={Math.max(1.5, size * 0.055)}
      />
    </g>
  );
};

export const UnitBlock = ({
  color,
  count = 1,
  size = 32,
  stacked = false,
  transform,
  value,
  variant = "cube",
  x = 0,
  y = 0,
  ...groupProps
}: UnitBlockProps) => {
  const normalizedCount = Math.round(clampNumber(count, 1, 10));
  const fill = resolveColor(
    color,
    variant === "dot" ? colors.coral : colors.mint,
  );

  if (variant === "rod") {
    const cell = size;
    const width = normalizedCount * cell;

    return (
      <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
        <g className="body" style={shadowStyle()}>
          <rect
            fill={colors.white}
            height={cell}
            rx={cell * 0.24}
            stroke={colors.textNavy}
            strokeWidth={Math.max(2, cell * 0.08)}
            width={width}
            x={-width / 2}
            y={-cell / 2}
          />
          {Array.from({ length: normalizedCount }, (_, index) => (
            <rect
              fill={fill}
              height={cell - 8}
              key={index}
              opacity={0.92}
              rx={cell * 0.16}
              width={cell - 8}
              x={-width / 2 + index * cell + 4}
              y={-cell / 2 + 4}
            />
          ))}
          {Array.from({ length: normalizedCount - 1 }, (_, index) => (
            <line
              key={index}
              opacity={0.3}
              stroke={colors.textNavy}
              strokeWidth={2}
              x1={-width / 2 + (index + 1) * cell}
              x2={-width / 2 + (index + 1) * cell}
              y1={-cell / 2 + 5}
              y2={cell / 2 - 5}
            />
          ))}
        </g>
        {value ? (
          <PrimitiveLabel fontSize={Math.max(16, size * 0.45)} x={0} y={size}>
            {value}
          </PrimitiveLabel>
        ) : null}
      </PlacedGroup>
    );
  }

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g className="body" style={shadowStyle()}>
        {unitPositions(normalizedCount, size, stacked).map(
          (position, index) => (
            <g key={index} transform={`translate(${position.x} ${position.y})`}>
              <UnitShape color={fill} size={size} variant={variant} />
            </g>
          ),
        )}
      </g>
      {value ? (
        <PrimitiveLabel
          fontSize={Math.max(16, size * 0.45)}
          x={0}
          y={Math.ceil(normalizedCount / (stacked ? 2 : 5)) * size * 0.76 + 26}
        >
          {value}
        </PrimitiveLabel>
      ) : null}
    </PlacedGroup>
  );
};

export type NumberCardValue = number | string;

export type NumberCardProps = PrimitiveGroupProps &
  PlacementProps &
  SelectionProps & {
    blank?: boolean;
    color?: ThemeColor;
    height?: number;
    value?: NumberCardValue;
    width?: number;
  };

export const NumberCard = ({
  blank = false,
  color,
  correct = false,
  disabled = false,
  focused = false,
  height = 112,
  selected = false,
  transform,
  value = "",
  width = 92,
  wrong = false,
  x = 0,
  y = 0,
  ...groupProps
}: NumberCardProps) => {
  const fill = resolveColor(color, colors.white);

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
        {blank ? (
          <line
            className="blank"
            stroke={colors.softGrayBlue}
            strokeLinecap="round"
            strokeWidth={5}
            x1={-width * 0.22}
            x2={width * 0.22}
            y1={10}
            y2={10}
          />
        ) : (
          <text
            dominantBaseline="middle"
            fill={colors.textNavy}
            fontFamily={fontFamily}
            fontSize={typeof value === "number" && value >= 10 ? 50 : 58}
            fontWeight={900}
            textAnchor="middle"
            y={3}
          >
            {value}
          </text>
        )}
      </g>
    </PlacedGroup>
  );
};

export type AnswerTileProps = PrimitiveGroupProps &
  PlacementProps &
  SelectionProps & {
    children?: ReactNode;
    color?: ThemeColor;
    height?: number;
    label?: ReactNode;
    number?: number;
    text?: ReactNode;
    width?: number;
  };

export const AnswerTile = ({
  children,
  color,
  correct = false,
  disabled = false,
  focused = false,
  height = 104,
  label,
  number,
  selected = false,
  text,
  transform,
  width = 152,
  wrong = false,
  x = 0,
  y = 0,
  ...groupProps
}: AnswerTileProps) => {
  const content = children ?? text ?? number;
  const fill = resolveColor(color, colors.white);

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
        {typeof content === "string" || typeof content === "number" ? (
          <PrimitiveLabel fontSize={42} x={0} y={label ? -6 : 2}>
            {content}
          </PrimitiveLabel>
        ) : (
          <g className="icon-slot" transform={label ? "translate(0 -10)" : ""}>
            {content}
          </g>
        )}
        {label ? (
          <PrimitiveLabel
            fill={colors.softGrayBlue}
            fontSize={20}
            fontWeight={800}
            x={0}
            y={height / 2 - 22}
          >
            {label}
          </PrimitiveLabel>
        ) : null}
      </g>
    </PlacedGroup>
  );
};

export type ComparisonSymbolStyle = "formal" | "mouth";
export type ComparisonSymbolValue = "<" | "=" | ">";

export type ComparisonSymbolProps = PrimitiveGroupProps &
  PlacementProps & {
    revealed?: boolean;
    selected?: boolean;
    size?: number;
    style?: ComparisonSymbolStyle;
    symbol: ComparisonSymbolValue;
  };

export const ComparisonSymbol = ({
  revealed = true,
  selected = false,
  size = 84,
  style = "formal",
  symbol,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: ComparisonSymbolProps) => {
  const stroke = selected ? colors.sky : colors.textNavy;
  const scale = size / 84;

  if (!revealed) {
    return (
      <PlacedGroup
        {...groupProps}
        transform={[`scale(${scale})`, transform].filter(Boolean).join(" ")}
        x={x}
        y={y}
      >
        <circle
          fill={colors.white}
          r={36}
          stroke={colors.textNavy}
          strokeDasharray="8 7"
          strokeWidth={4}
        />
        <PrimitiveLabel fontSize={40} x={0} y={2}>
          ?
        </PrimitiveLabel>
      </PlacedGroup>
    );
  }

  if (style === "mouth" && symbol !== "=") {
    const flip = symbol === ">" ? 1 : -1;

    return (
      <PlacedGroup
        {...groupProps}
        transform={[`scale(${scale})`, transform].filter(Boolean).join(" ")}
        x={x}
        y={y}
      >
        <path
          className="mouth"
          d={`M ${-30 * flip} -32 Q ${34 * flip} 0 ${-30 * flip} 32`}
          fill={colors.coral}
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={8}
        />
        <path
          d={`M ${-19 * flip} -16 Q ${11 * flip} 0 ${-19 * flip} 16`}
          fill="none"
          opacity={0.55}
          stroke={colors.white}
          strokeLinecap="round"
          strokeWidth={5}
        />
      </PlacedGroup>
    );
  }

  return (
    <PlacedGroup
      {...groupProps}
      transform={[`scale(${scale})`, transform].filter(Boolean).join(" ")}
      x={x}
      y={y}
    >
      <text
        dominantBaseline="middle"
        fill={selected ? colors.sky : colors.textNavy}
        fontFamily={fontFamily}
        fontSize={78}
        fontWeight={900}
        textAnchor="middle"
        y={2}
      >
        {symbol}
      </text>
    </PlacedGroup>
  );
};

export type EquationTerm = number | string;

export type EquationStripProps = PrimitiveGroupProps &
  PlacementProps & {
    activeIndex?: number;
    blankIndex?: number;
    color?: ThemeColor;
    gap?: number;
    height?: number;
    left?: EquationTerm;
    operator?: EquationTerm;
    result?: EquationTerm;
    right?: EquationTerm;
    terms?: EquationTerm[];
    tileWidth?: number;
  };

export const EquationStrip = ({
  activeIndex,
  blankIndex,
  color,
  gap = 12,
  height = 78,
  left = "",
  operator = "+",
  result = "",
  right = "",
  terms,
  tileWidth = 74,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: EquationStripProps) => {
  const sequence = terms ?? [left, operator, right, "=", result];
  const totalWidth = sequence.length * tileWidth + (sequence.length - 1) * gap;
  const fill = resolveColor(color, colors.white);

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g className="base" style={shadowStyle()}>
        <rect
          fill={colors.paleCream}
          height={height + 24}
          rx={CARD_RADIUS}
          stroke={colors.white}
          strokeWidth={5}
          width={totalWidth + 28}
          x={-totalWidth / 2 - 14}
          y={-height / 2 - 12}
        />
        {sequence.map((term, index) => {
          const termX = -totalWidth / 2 + index * (tileWidth + gap);
          const isBlank = index === blankIndex;
          const isActive = index === activeIndex;
          const isOperator =
            term === "+" || term === "-" || term === "x" || term === "=";

          return (
            <g key={`${term}-${index}`} transform={`translate(${termX} 0)`}>
              <rect
                fill={isOperator ? colors.cream : fill}
                height={height}
                rx={16}
                stroke={isActive ? colors.sky : colors.textNavy}
                strokeDasharray={isBlank ? "8 8" : undefined}
                strokeWidth={isActive ? 5 : 3}
                width={tileWidth}
                y={-height / 2}
              />
              {isBlank ? null : (
                <PrimitiveLabel
                  fontSize={isOperator ? 34 : 38}
                  x={tileWidth / 2}
                  y={2}
                >
                  {term}
                </PrimitiveLabel>
              )}
            </g>
          );
        })}
      </g>
    </PlacedGroup>
  );
};

export type NumberLineHighlight =
  | number
  | {
      color?: ThemeColor;
      label?: ReactNode;
      value: number;
    };

export type NumberLineJump = {
  color?: ThemeColor;
  from: number;
  label?: ReactNode;
  progress?: number;
  to: number;
};

export type NumberLineTrackProps = PrimitiveGroupProps &
  PlacementProps & {
    current: number;
    height?: number;
    highlights?: NumberLineHighlight[];
    jumps?: NumberLineJump[];
    max: number;
    min: number;
    width?: number;
  };

const numberLineX = (
  value: number,
  min: number,
  max: number,
  width: number,
) => {
  const range = Math.max(1, max - min);

  return -width / 2 + ((value - min) / range) * width;
};

export const NumberLineTrack = ({
  current,
  height = 88,
  highlights = [],
  jumps = [],
  max,
  min,
  transform,
  width = 560,
  x = 0,
  y = 0,
  ...groupProps
}: NumberLineTrackProps) => {
  const safeMax = max > min ? max : min + 1;
  const tickEvery = Math.max(1, Math.ceil((safeMax - min) / 20));
  const ticks = Array.from(
    { length: Math.floor((safeMax - min) / tickEvery) + 1 },
    (_, index) => min + index * tickEvery,
  ).filter((value) => value <= safeMax);
  const currentX = numberLineX(
    clampNumber(current, min, safeMax),
    min,
    safeMax,
    width,
  );

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g className="track" style={shadowStyle()}>
        <line
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={6}
          x1={-width / 2}
          x2={width / 2}
          y1={0}
          y2={0}
        />
        {ticks.map((value) => {
          const tickX = numberLineX(value, min, safeMax, width);

          return (
            <g key={value} transform={`translate(${tickX} 0)`}>
              <line
                stroke={colors.textNavy}
                strokeLinecap="round"
                strokeWidth={4}
                x1={0}
                x2={0}
                y1={-14}
                y2={14}
              />
              <PrimitiveLabel fontSize={19} x={0} y={34}>
                {value}
              </PrimitiveLabel>
            </g>
          );
        })}
        {highlights.map((highlight, index) => {
          const value =
            typeof highlight === "number" ? highlight : highlight.value;
          const highlightColor = resolveColor(
            typeof highlight === "number" ? undefined : highlight.color,
            colors.sunshine,
          );
          const highlightX = numberLineX(
            clampNumber(value, min, safeMax),
            min,
            safeMax,
            width,
          );

          return (
            <g
              key={`${value}-${index}`}
              transform={`translate(${highlightX} 0)`}
            >
              <circle
                fill={highlightColor}
                opacity={0.65}
                r={18}
                stroke={colors.textNavy}
                strokeWidth={3}
              />
              {typeof highlight === "number" || !highlight.label ? null : (
                <PrimitiveLabel fontSize={18} x={0} y={-32}>
                  {highlight.label}
                </PrimitiveLabel>
              )}
            </g>
          );
        })}
        {jumps.map((jump, index) => {
          const fromX = numberLineX(
            clampNumber(jump.from, min, safeMax),
            min,
            safeMax,
            width,
          );
          const toX = numberLineX(
            clampNumber(jump.to, min, safeMax),
            min,
            safeMax,
            width,
          );
          const jumpHeight = -height * 0.55;
          const progress = clamp01(jump.progress ?? 1);
          const path = `M ${fromX} 0 Q ${(fromX + toX) / 2} ${jumpHeight} ${toX} 0`;

          return (
            <g className="jump" key={`${jump.from}-${jump.to}-${index}`}>
              <path
                d={path}
                fill="none"
                pathLength={1}
                stroke={resolveColor(jump.color, colors.coral)}
                strokeDasharray={1}
                strokeDashoffset={1 - progress}
                strokeLinecap="round"
                strokeWidth={5}
              />
              {jump.label ? (
                <PrimitiveLabel
                  fontSize={18}
                  x={(fromX + toX) / 2}
                  y={jumpHeight - 16}
                >
                  {jump.label}
                </PrimitiveLabel>
              ) : null}
            </g>
          );
        })}
        <circle
          className="state-badge"
          cx={currentX}
          cy={0}
          fill={colors.sky}
          r={14}
          stroke={colors.textNavy}
          strokeWidth={4}
        />
      </g>
    </PlacedGroup>
  );
};

export type PartWholeBraceDirection = "down" | "left" | "right" | "up";

export type PartWholeBraceProps = PrimitiveGroupProps &
  PlacementProps & {
    direction?: PartWholeBraceDirection;
    label?: ReactNode;
    progress?: number;
    width: number;
  };

export const PartWholeBrace = ({
  direction = "down",
  label,
  progress = 1,
  transform,
  width,
  x = 0,
  y = 0,
  ...groupProps
}: PartWholeBraceProps) => {
  const depth = Math.min(42, Math.max(24, width * 0.16));
  const reveal = clamp01(progress);
  const path =
    direction === "up"
      ? `M 0 0 C ${width * 0.2} ${-depth} ${width * 0.35} ${-depth} ${width / 2} ${-depth} C ${width * 0.65} ${-depth} ${width * 0.8} ${-depth} ${width} 0`
      : direction === "left"
        ? `M 0 0 C ${-depth} ${width * 0.2} ${-depth} ${width * 0.35} ${-depth} ${width / 2} C ${-depth} ${width * 0.65} ${-depth} ${width * 0.8} 0 ${width}`
        : direction === "right"
          ? `M 0 0 C ${depth} ${width * 0.2} ${depth} ${width * 0.35} ${depth} ${width / 2} C ${depth} ${width * 0.65} ${depth} ${width * 0.8} 0 ${width}`
          : `M 0 0 C ${width * 0.2} ${depth} ${width * 0.35} ${depth} ${width / 2} ${depth} C ${width * 0.65} ${depth} ${width * 0.8} ${depth} ${width} 0`;
  const labelX =
    direction === "left"
      ? -depth - 26
      : direction === "right"
        ? depth + 26
        : width / 2;
  const labelY =
    direction === "up"
      ? -depth - 22
      : direction === "down"
        ? depth + 24
        : width / 2;

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <path
        className="body"
        d={path}
        fill="none"
        pathLength={1}
        stroke={colors.textNavy}
        strokeDasharray={1}
        strokeDashoffset={1 - reveal}
        strokeLinecap="round"
        strokeWidth={5}
      />
      {label ? (
        <PrimitiveLabel fontSize={22} x={labelX} y={labelY}>
          {label}
        </PrimitiveLabel>
      ) : null}
    </PlacedGroup>
  );
};

export type TenFrameRodVariant = "frame" | "rod";

export type TenFrameRodSegment = {
  color?: ThemeColor;
  count: number;
  oneColor?: ThemeColor;
};

export type TenFrameRodProps = PrimitiveGroupProps &
  PlacementProps & {
    emptyColor?: ThemeColor;
    filled?: number;
    ones?: number;
    segments?: TenFrameRodSegment[];
    size?: number;
    variant?: TenFrameRodVariant;
  };

const tenFrameSegmentFallbackColors = [
  colors.sunshine,
  colors.sky,
  colors.mint,
  colors.coral,
  colors.lavender,
];

const buildTenFrameSegmentCells = (segments: TenFrameRodSegment[]) => {
  const cells: Array<{ color: string; oneColor: string }> = [];

  for (const [segmentIndex, segment] of segments.entries()) {
    if (cells.length >= 10) {
      break;
    }

    const count = Math.round(clampNumber(segment.count, 0, 10 - cells.length));
    const color = resolveColor(
      segment.color,
      tenFrameSegmentFallbackColors[
        segmentIndex % tenFrameSegmentFallbackColors.length
      ],
    );
    const oneColor = resolveColor(segment.oneColor, colors.white);

    cells.push(
      ...Array.from({ length: count }, () => ({
        color,
        oneColor,
      })),
    );
  }

  return cells;
};

export const TenFrameRod = ({
  emptyColor,
  filled = 0,
  ones = 0,
  segments,
  size = 34,
  transform,
  variant = "frame",
  x = 0,
  y = 0,
  ...groupProps
}: TenFrameRodProps) => {
  const filledCount = Math.round(clampNumber(filled, 0, 10));
  const onesCount = Math.round(clampNumber(ones, 0, 10));
  const segmentCells =
    segments === undefined ? undefined : buildTenFrameSegmentCells(segments);
  const emptyFill = resolveColor(emptyColor, colors.white);
  const gap = 4;
  const columns = variant === "frame" ? 5 : 10;
  const rows = variant === "frame" ? 2 : 1;
  const width = columns * size + (columns - 1) * gap;
  const height = rows * size + (rows - 1) * gap;

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g className="body" style={shadowStyle()}>
        {Array.from({ length: 10 }, (_, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          const cellX = -width / 2 + column * (size + gap);
          const cellY = -height / 2 + row * (size + gap);
          const segmentCell = segmentCells?.[index];
          const active =
            segmentCells === undefined ? index < filledCount : !!segmentCell;
          const hasOne =
            segmentCells === undefined ? index < onesCount : !!segmentCell;
          const fill =
            segmentCell?.color ?? (active ? colors.sunshine : emptyFill);
          const oneColor =
            segmentCell?.oneColor ?? (active ? colors.coral : colors.mint);

          return (
            <g key={index}>
              <rect
                fill={fill}
                height={size}
                rx={8}
                stroke={colors.textNavy}
                strokeWidth={3}
                width={size}
                x={cellX}
                y={cellY}
              />
              {hasOne ? (
                <circle
                  cx={cellX + size / 2}
                  cy={cellY + size / 2}
                  fill={oneColor}
                  r={size * 0.2}
                  stroke={colors.textNavy}
                  strokeWidth={2}
                />
              ) : null}
            </g>
          );
        })}
      </g>
    </PlacedGroup>
  );
};
