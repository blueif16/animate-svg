import type { ReactNode } from "react";
import { colors, shadows, typography } from "../theme";

export type ThemeColor = keyof typeof colors | (string & {});

export type PrimitiveGroupProps = {
  "aria-label"?: string;
  className?: string;
  id?: string;
  opacity?: number;
  role?: string;
  transform?: string;
};

export type PlacementProps = {
  x?: number;
  y?: number;
};

export type SelectionProps = {
  correct?: boolean;
  disabled?: boolean;
  focused?: boolean;
  selected?: boolean;
  wrong?: boolean;
};

export const CARD_RADIUS = 18;
export const NAVY_STROKE = 4;

export const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const clamp01 = (value: number) => clampNumber(value, 0, 1);

export const resolveColor = (
  color: ThemeColor | undefined,
  fallback: string,
): string => {
  if (!color) {
    return fallback;
  }

  return color in colors ? colors[color as keyof typeof colors] : color;
};

export const shadowStyle = (shadow: string = shadows.small) => ({
  filter: `drop-shadow(${shadow})`,
});

export const fontFamily = typography.fontFamily;

export const toStateStroke = ({
  correct,
  disabled,
  focused,
  selected,
  wrong,
}: SelectionProps) => {
  if (disabled) {
    return colors.softGrayBlue;
  }

  if (wrong) {
    return colors.coral;
  }

  if (correct) {
    return colors.mint;
  }

  if (focused) {
    return colors.lavender;
  }

  if (selected) {
    return colors.sky;
  }

  return colors.textNavy;
};

export const stateOpacity = (disabled?: boolean, dimmed?: boolean) => {
  if (disabled) {
    return 0.45;
  }

  if (dimmed) {
    return 0.38;
  }

  return 1;
};

export const PlacedGroup = ({
  children,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: PrimitiveGroupProps &
  PlacementProps & {
    children: ReactNode;
  }) => {
  const transforms = [
    x !== 0 || y !== 0 ? `translate(${x} ${y})` : undefined,
    transform,
  ].filter(Boolean);

  return (
    <g
      {...groupProps}
      transform={transforms.length > 0 ? transforms.join(" ") : undefined}
    >
      {children}
    </g>
  );
};

export const SelectionRing = ({
  correct,
  disabled,
  focused,
  height,
  radius = CARD_RADIUS,
  selected,
  width,
  wrong,
  x = 0,
  y = 0,
}: SelectionProps & {
  height: number;
  radius?: number;
  width: number;
  x?: number;
  y?: number;
}) => {
  if (!selected && !correct && !wrong && !focused && !disabled) {
    return null;
  }

  return (
    <rect
      fill="none"
      height={height + 10}
      opacity={disabled ? 0.55 : 1}
      rx={radius + 5}
      stroke={toStateStroke({ correct, disabled, focused, selected, wrong })}
      strokeDasharray={focused && !selected ? "10 8" : undefined}
      strokeWidth={5}
      width={width + 10}
      x={x - 5}
      y={y - 5}
    />
  );
};

export const StateBadge = ({
  correct,
  disabled,
  wrong,
  x,
  y,
}: Pick<SelectionProps, "correct" | "disabled" | "wrong"> & {
  x: number;
  y: number;
}) => {
  if (!correct && !wrong && !disabled) {
    return null;
  }

  const label = correct ? "OK" : wrong ? "!" : "-";
  const fill = correct
    ? colors.mint
    : wrong
      ? colors.coral
      : colors.softGrayBlue;

  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        cx={0}
        cy={0}
        fill={fill}
        r={16}
        stroke={colors.textNavy}
        strokeWidth={3}
      />
      <text
        dominantBaseline="middle"
        fill={colors.textNavy}
        fontFamily={fontFamily}
        fontSize={correct ? 12 : 20}
        fontWeight={900}
        textAnchor="middle"
        y={correct ? 1 : 0}
      >
        {label}
      </text>
    </g>
  );
};

export const PrimitiveLabel = ({
  children,
  fill = colors.textNavy,
  fontSize = 24,
  fontWeight = 900,
  x,
  y,
}: {
  children: ReactNode;
  fill?: string;
  fontSize?: number;
  fontWeight?: number;
  x: number;
  y: number;
}) => (
  <text
    dominantBaseline="middle"
    fill={fill}
    fontFamily={fontFamily}
    fontSize={fontSize}
    fontWeight={fontWeight}
    textAnchor="middle"
    x={x}
    y={y}
  >
    {children}
  </text>
);

export const starPath = (
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius = outerRadius * 0.48,
) => {
  const points = Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;

    return `${centerX + Math.cos(angle) * radius} ${
      centerY + Math.sin(angle) * radius
    }`;
  });

  return `M ${points.join(" L ")} Z`;
};
