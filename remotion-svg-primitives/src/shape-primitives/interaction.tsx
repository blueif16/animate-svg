import type { ReactNode } from "react";
import { colors } from "../theme";
import {
  CARD_RADIUS,
  NAVY_STROKE,
  PlacedGroup,
  PrimitiveLabel,
  clamp01,
  fontFamily,
  resolveColor,
  shadowStyle,
  starPath,
  type PlacementProps,
  type PrimitiveGroupProps,
  type ThemeColor,
} from "./shared";

export type PairConnectorProps = PrimitiveGroupProps & {
  color?: ThemeColor;
  dotted?: boolean;
  progress?: number;
  snap?: boolean;
  strokeWidth?: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export const PairConnector = ({
  color,
  dotted = false,
  progress = 1,
  snap = false,
  strokeWidth = 5,
  transform,
  x1,
  x2,
  y1,
  y2,
  ...groupProps
}: PairConnectorProps) => {
  const reveal = clamp01(progress);
  const endX = x1 + (x2 - x1) * reveal;
  const endY = y1 + (y2 - y1) * reveal;
  const stroke = resolveColor(color, colors.sky);

  return (
    <PlacedGroup {...groupProps} transform={transform}>
      <line
        className="body"
        stroke={stroke}
        strokeDasharray={dotted ? "10 9" : undefined}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        x1={x1}
        x2={endX}
        y1={y1}
        y2={endY}
      />
      {snap ? (
        <g className="snap">
          <circle
            cx={x1}
            cy={y1}
            fill={colors.white}
            r={strokeWidth * 1.5}
            stroke={colors.textNavy}
            strokeWidth={2}
          />
          <circle
            cx={x2}
            cy={y2}
            fill={reveal >= 1 ? colors.mint : colors.white}
            r={strokeWidth * 1.5}
            stroke={colors.textNavy}
            strokeWidth={2}
          />
        </g>
      ) : null}
    </PlacedGroup>
  );
};

export type SortingBinState = "accept" | "idle" | "reject";
export type SortingBinVariant = "basket" | "tray";

export type SortingBinProps = PrimitiveGroupProps &
  PlacementProps & {
    color?: ThemeColor;
    height?: number;
    label: ReactNode;
    state?: SortingBinState;
    variant?: SortingBinVariant;
    width?: number;
  };

const sortingStateColor = (state: SortingBinState) => {
  if (state === "accept") {
    return colors.mint;
  }

  if (state === "reject") {
    return colors.coral;
  }

  return colors.paleCream;
};

export const SortingBin = ({
  color,
  height = 130,
  label,
  state = "idle",
  transform,
  variant = "basket",
  width = 190,
  x = 0,
  y = 0,
  ...groupProps
}: SortingBinProps) => {
  const fill = resolveColor(color, sortingStateColor(state));
  const stateStroke =
    state === "accept"
      ? colors.mint
      : state === "reject"
        ? colors.coral
        : colors.textNavy;

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g style={shadowStyle()}>
        {variant === "tray" ? (
          <g className="body">
            <rect
              fill={fill}
              height={height}
              rx={CARD_RADIUS}
              stroke={stateStroke}
              strokeWidth={NAVY_STROKE}
              width={width}
              x={-width / 2}
              y={-height / 2}
            />
            <path
              d={`M ${-width / 2 + 22} ${-height / 2 + 24} H ${width / 2 - 22}`}
              opacity={0.35}
              stroke={colors.white}
              strokeLinecap="round"
              strokeWidth={7}
            />
          </g>
        ) : (
          <g className="body">
            <path
              d={`M ${-width / 2 + 18} ${-height / 2 + 24} H ${width / 2 - 18} L ${width / 2 - 34} ${height / 2 - 12} H ${-width / 2 + 34} Z`}
              fill={fill}
              stroke={stateStroke}
              strokeLinejoin="round"
              strokeWidth={NAVY_STROKE}
            />
            <path
              d={`M ${-width / 2 + 42} ${-height / 2 + 20} C ${-width / 2 + 52} ${-height / 2 - 28} ${width / 2 - 52} ${-height / 2 - 28} ${width / 2 - 42} ${-height / 2 + 20}`}
              fill="none"
              stroke={colors.textNavy}
              strokeLinecap="round"
              strokeWidth={NAVY_STROKE}
            />
            <path
              d={`M ${-width / 2 + 52} ${-height / 2 + 54} H ${width / 2 - 52} M ${-width / 2 + 46} ${-height / 2 + 82} H ${width / 2 - 46}`}
              opacity={0.28}
              stroke={colors.textNavy}
              strokeLinecap="round"
              strokeWidth={3}
            />
          </g>
        )}
        <PrimitiveLabel fontSize={24} x={0} y={height / 2 + 28}>
          {label}
        </PrimitiveLabel>
      </g>
    </PlacedGroup>
  );
};

export type PointerDirection = "down" | "left" | "right" | "up";
export type PointerHandArrowVariant = "arrow" | "hand" | "sparkle";

export type PointerHandArrowProps = PrimitiveGroupProps &
  PlacementProps & {
    direction?: PointerDirection;
    progress?: number;
    size?: number;
    variant?: PointerHandArrowVariant;
  };

const directionRotation = (direction: PointerDirection) => {
  if (direction === "down") {
    return 90;
  }

  if (direction === "left") {
    return 180;
  }

  if (direction === "up") {
    return -90;
  }

  return 0;
};

export const PointerHandArrow = ({
  direction = "right",
  progress = 1,
  size = 92,
  transform,
  variant = "arrow",
  x = 0,
  y = 0,
  ...groupProps
}: PointerHandArrowProps) => {
  const reveal = clamp01(progress);
  const scale = (size / 92) * (0.78 + reveal * 0.22);
  const nudge = (1 - reveal) * -18;

  if (variant === "sparkle") {
    return (
      <PlacedGroup
        {...groupProps}
        opacity={0.25 + reveal * 0.75}
        transform={[
          `rotate(${directionRotation(direction)})`,
          `translate(${nudge} 0)`,
          `scale(${scale})`,
          transform,
        ]
          .filter(Boolean)
          .join(" ")}
        x={x}
        y={y}
      >
        <path
          className="body"
          d={starPath(0, 0, 42, 17)}
          fill={colors.reward}
          stroke={colors.textNavy}
          strokeLinejoin="round"
          strokeWidth={NAVY_STROKE}
        />
        <circle cx={0} cy={0} fill={colors.white} opacity={0.55} r={8} />
      </PlacedGroup>
    );
  }

  if (variant === "hand") {
    return (
      <PlacedGroup
        {...groupProps}
        opacity={0.25 + reveal * 0.75}
        transform={[
          `rotate(${directionRotation(direction)})`,
          `translate(${nudge} 0)`,
          `scale(${scale})`,
          transform,
        ]
          .filter(Boolean)
          .join(" ")}
        x={x}
        y={y}
      >
        <path
          className="body"
          d="M -34 10 C -40 -2 -30 -12 -17 -6 L 8 5 L 2 -31 C 0 -44 17 -48 22 -34 L 38 18 C 44 37 30 50 9 47 L -10 44 C -22 42 -30 31 -34 10 Z"
          fill={colors.paleCream}
          stroke={colors.textNavy}
          strokeLinejoin="round"
          strokeWidth={NAVY_STROKE}
        />
        <path
          d="M -12 2 L 11 12 M 3 5 L 13 35"
          fill="none"
          opacity={0.34}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={3}
        />
      </PlacedGroup>
    );
  }

  return (
    <PlacedGroup
      {...groupProps}
      opacity={0.25 + reveal * 0.75}
      transform={[
        `rotate(${directionRotation(direction)})`,
        `translate(${nudge} 0)`,
        `scale(${scale})`,
        transform,
      ]
        .filter(Boolean)
        .join(" ")}
      x={x}
      y={y}
    >
      <path
        className="body"
        d="M -42 -16 H 11 V -34 L 44 0 L 11 34 V 16 H -42 Z"
        fill={colors.sky}
        stroke={colors.textNavy}
        strokeLinejoin="round"
        strokeWidth={NAVY_STROKE}
      />
      <path
        d="M -29 -5 H 9"
        opacity={0.45}
        stroke={colors.white}
        strokeLinecap="round"
        strokeWidth={7}
      />
    </PlacedGroup>
  );
};

export type RewardProgressTokenVariant = "badge" | "coin" | "node" | "star";

export type RewardProgressTokenProps = PrimitiveGroupProps &
  PlacementProps & {
    collected?: boolean;
    label?: ReactNode;
    progress?: number;
    size?: number;
    variant?: RewardProgressTokenVariant;
  };

export const RewardProgressToken = ({
  collected = false,
  label,
  progress = collected ? 1 : 0,
  size = 72,
  transform,
  variant = "star",
  x = 0,
  y = 0,
  ...groupProps
}: RewardProgressTokenProps) => {
  const reveal = clamp01(progress);
  const scale = size / 72;
  const fill = collected ? colors.reward : colors.white;

  return (
    <PlacedGroup
      {...groupProps}
      transform={[`scale(${scale})`, transform].filter(Boolean).join(" ")}
      x={x}
      y={y}
    >
      <g className="token" style={shadowStyle()}>
        <circle
          className="progress"
          cx={0}
          cy={0}
          fill="none"
          pathLength={1}
          r={38}
          stroke={colors.mint}
          strokeDasharray={1}
          strokeDashoffset={1 - reveal}
          strokeLinecap="round"
          strokeWidth={6}
          transform="rotate(-90)"
        />
        {variant === "coin" ? (
          <circle
            className="body"
            cx={0}
            cy={0}
            fill={fill}
            r={29}
            stroke={colors.textNavy}
            strokeWidth={NAVY_STROKE}
          />
        ) : variant === "badge" ? (
          <path
            className="body"
            d="M 0 -34 L 29 -16 L 29 18 L 0 36 L -29 18 L -29 -16 Z"
            fill={fill}
            stroke={colors.textNavy}
            strokeLinejoin="round"
            strokeWidth={NAVY_STROKE}
          />
        ) : variant === "node" ? (
          <rect
            className="body"
            fill={fill}
            height={54}
            rx={18}
            stroke={colors.textNavy}
            strokeWidth={NAVY_STROKE}
            width={54}
            x={-27}
            y={-27}
          />
        ) : (
          <path
            className="body"
            d={starPath(0, 0, 32, 14)}
            fill={fill}
            stroke={colors.textNavy}
            strokeLinejoin="round"
            strokeWidth={NAVY_STROKE}
          />
        )}
        <text
          dominantBaseline="middle"
          fill={colors.textNavy}
          fontFamily={fontFamily}
          fontSize={variant === "star" ? 22 : 24}
          fontWeight={900}
          textAnchor="middle"
          y={variant === "star" ? 3 : 2}
        >
          {collected ? "OK" : Math.round(reveal * 100)}
        </text>
      </g>
      {label ? (
        <PrimitiveLabel fontSize={20} x={0} y={58}>
          {label}
        </PrimitiveLabel>
      ) : null}
    </PlacedGroup>
  );
};
