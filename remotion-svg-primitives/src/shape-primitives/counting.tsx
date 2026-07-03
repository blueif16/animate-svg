import type { ReactNode } from "react";
import { colors } from "../theme";
import { EASE } from "../motion-primitives/curves";
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
  mulberry32,
  resolveColor,
  shadowStyle,
  starPath,
  stateOpacity,
  type PlacementProps,
  type PrimitiveGroupProps,
  type SelectionProps,
  type ThemeColor,
} from "./shared";

// RegionSplit — partition a single filled round region (a "cookie"/disk) into N
// EQUAL-AREA parts. This is the fraction/area-partition primitive (split ONE
// whole into equal regions), distinct from FenHeDiagram (a NUMBER bond) and
// PartWholeBrace (bracket a linear span). Pedagogy flow it supports: show the
// whole (cutProgress 0) → cut it (cutProgress 0→1 draws the radial cuts) →
// shade one part (highlightPart) → give the parts out (separation 0→1 pulls the
// wedges apart). Prop-driven + lesson-agnostic — no topic/copy baked in.
export type RegionSplitProps = PrimitiveGroupProps &
  PlacementProps & {
    accent?: ThemeColor;
    cutProgress?: number; // 0..1 reveal of the dividing cuts
    fill?: ThemeColor;
    highlightPart?: number; // 0-based part to emphasize, -1 = none
    label?: ReactNode;
    parts?: number; // equal parts to split into (1-8)
    radius?: number;
    separation?: number; // 0..1 how far the parts are pulled apart
    showLabels?: boolean; // render "1/parts" on each part when separated
  };

const regionPolar = (r: number, angle: number): readonly [number, number] => [
  Math.cos(angle) * r,
  Math.sin(angle) * r,
];

const regionSectorPath = (r: number, a0: number, a1: number) => {
  const [sx, sy] = regionPolar(r, a0);
  const [ex, ey] = regionPolar(r, a1);
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  return `M 0 0 L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(2)} ${ey.toFixed(2)} Z`;
};

export const RegionSplit = ({
  accent,
  cutProgress = 1,
  fill,
  highlightPart = -1,
  label,
  parts = 2,
  radius = 90,
  separation = 0,
  showLabels = false,
  x = 0,
  y = 0,
  ...groupProps
}: RegionSplitProps) => {
  const n = clampNumber(Math.floor(parts), 1, 8);
  const r = Math.max(8, radius);
  const cut = clamp01(cutProgress);
  const spread = clamp01(separation);
  const baseFill = resolveColor(fill, colors.sunshine);
  const accentFill = resolveColor(accent, colors.reward);
  const stroke = colors.textNavy;
  const step = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2;

  if (n === 1) {
    return (
      <PlacedGroup x={x} y={y} {...groupProps}>
        <circle
          cx={0}
          cy={0}
          fill={highlightPart === 0 ? accentFill : baseFill}
          r={r}
          stroke={stroke}
          strokeWidth={NAVY_STROKE}
        />
        {label != null ? (
          <PrimitiveLabel x={0} y={r + 36}>
            {label}
          </PrimitiveLabel>
        ) : null}
      </PlacedGroup>
    );
  }

  const sectors = Array.from({ length: n }, (_, i) => {
    const a0 = startAngle + i * step;
    const a1 = startAngle + (i + 1) * step;
    return { a0, a1, bisector: (a0 + a1) / 2, i };
  });

  return (
    <PlacedGroup x={x} y={y} {...groupProps}>
      {spread === 0 ? (
        <g>
          <circle cx={0} cy={0} fill={baseFill} r={r} />
          {highlightPart >= 0 && highlightPart < n ? (
            <path
              d={regionSectorPath(
                r,
                sectors[highlightPart].a0,
                sectors[highlightPart].a1,
              )}
              fill={accentFill}
            />
          ) : null}
          {sectors.map(({ a0, i }) => {
            const [ex, ey] = regionPolar(r * cut, a0);
            return (
              <line
                key={`cut-${i}`}
                stroke={stroke}
                strokeLinecap="round"
                strokeWidth={NAVY_STROKE}
                x1={0}
                x2={ex}
                y1={0}
                y2={ey}
              />
            );
          })}
          <circle
            cx={0}
            cy={0}
            fill="none"
            r={r}
            stroke={stroke}
            strokeWidth={NAVY_STROKE}
          />
        </g>
      ) : (
        sectors.map(({ a0, a1, bisector, i }) => {
          const [ox, oy] = regionPolar(r * 0.55 * spread, bisector);
          const isHighlighted = i === highlightPart;
          return (
            <path
              key={`part-${i}`}
              d={regionSectorPath(r, a0, a1)}
              fill={isHighlighted ? accentFill : baseFill}
              opacity={highlightPart < 0 || isHighlighted ? 1 : 0.55}
              stroke={stroke}
              strokeLinejoin="round"
              strokeWidth={NAVY_STROKE}
              transform={`translate(${ox.toFixed(2)} ${oy.toFixed(2)})`}
            />
          );
        })
      )}
      {showLabels && spread > 0
        ? sectors.map(({ bisector, i }) => {
            const [ox, oy] = regionPolar(r * 0.55 * spread, bisector);
            const [lx, ly] = regionPolar(r * 0.58, bisector);
            return (
              <PrimitiveLabel
                key={`lbl-${i}`}
                fontSize={Math.round(r * 0.3)}
                x={ox + lx}
                y={oy + ly}
              >
                {`1/${n}`}
              </PrimitiveLabel>
            );
          })
        : null}
      {label != null ? (
        <PrimitiveLabel x={0} y={r + 36}>
          {label}
        </PrimitiveLabel>
      ) : null}
    </PlacedGroup>
  );
};

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
  // Size the glyph as a fraction of the card's short side so there is ALWAYS
  // clear inset (>= ~16% of the card) between the digit and the border AT EVERY
  // SIZE — the previous fixed 50/58px font overflowed small (36px) cards. A
  // two-digit value gets a tighter ratio so the wider glyph still fits.
  const cardShortSide = Math.min(width, height);
  const isTwoDigit = typeof value === "number" && value >= 10;
  const glyphFontSize = cardShortSide * (isTwoDigit ? 0.46 : 0.56);

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
            fontSize={glyphFontSize}
            fontWeight={900}
            textAnchor="middle"
            y={glyphFontSize * 0.05}
          >
            {value}
          </text>
        )}
      </g>
    </PlacedGroup>
  );
};

// OrdinalLabelToken — a NumberCard surface carrying a TWO-PART label: a leading
// PREFIX glyph (themed separately) + the VALUE glyph. It exists because the
// 序数 vs 基数 contrast is carried ONLY by the prefix (第): "第5" and a bare
// "5" share the same numeral, so the digit MUST match a same-size NumberCard
// while the prefix reads as visually distinct (color + weight). NumberCard
// renders one bare value at one fill/weight and cannot do this; the distinct
// prefix IS the teaching point. Prop-driven + lesson-agnostic: the caller
// passes the prefix node ('第' or any locale prefix; default none), so nothing
// Chinese (or any topic/value) is baked in. NO time-based animation of its own
// — entrance is the caller's PopIn at a cue offset; state is prop-driven.
export type OrdinalLabelTokenProps = PrimitiveGroupProps &
  PlacementProps &
  SelectionProps & {
    color?: ThemeColor; // value-glyph fill (defaults to the NumberCard navy)
    height?: number;
    prefix?: ReactNode; // the distinguishing glyph; caller localizes '第'
    prefixColor?: ThemeColor; // emphasis fill on the prefix (default coral)
    prefixWeight?: number; // emphasis weight on the prefix (default 900)
    value?: NumberCardValue; // the digit — must read identical to a cardinal card
    width?: number;
  };

export const OrdinalLabelToken = ({
  color,
  correct = false,
  disabled = false,
  focused = false,
  height = 112,
  prefix = null,
  prefixColor,
  prefixWeight = 900,
  selected = false,
  transform,
  value = "",
  width = 132,
  wrong = false,
  x = 0,
  y = 0,
  ...groupProps
}: OrdinalLabelTokenProps) => {
  // Match NumberCard's glyph-sizing contract so the DIGIT here reads identical
  // to a bare same-height NumberCard ("same number, only the prefix differs").
  const cardShortSide = Math.min(width, height);
  const isTwoDigit = typeof value === "number" && value >= 10;
  const valueFontSize = cardShortSide * (isTwoDigit ? 0.46 : 0.56);
  // The prefix is a label modifier: a touch smaller than the digit (so the
  // digit stays the hero) but colored + heavy so it pops as the distinguishing
  // mark. It scales with the card, never a literal.
  const prefixFontSize = valueFontSize * 0.74;

  const valueFill = resolveColor(color, colors.textNavy);
  const prefixFill = resolveColor(prefixColor, colors.coral);

  // Lay the two glyphs out as one centered cluster. SVG text advance widths are
  // not measurable at build time, so we approximate each glyph's advance from
  // its font size (full-width CJK ~1.0em; the value text-anchor handles its own
  // half). The gap keeps prefix and digit from kissing at every size.
  const hasPrefix = prefix !== null && prefix !== undefined && prefix !== "";
  const prefixAdvance = hasPrefix ? prefixFontSize * 1.0 : 0;
  const valueAdvance = String(value).length > 1 ? valueFontSize * 1.1 : valueFontSize * 0.62;
  const gap = hasPrefix ? valueFontSize * 0.12 : 0;
  const clusterWidth = prefixAdvance + gap + valueAdvance;
  const prefixCenterX = -clusterWidth / 2 + prefixAdvance / 2;
  const valueCenterX = clusterWidth / 2 - valueAdvance / 2;

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
          fill={colors.white}
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
        {hasPrefix ? (
          <text
            className="prefix"
            dominantBaseline="middle"
            fill={prefixFill}
            fontFamily={fontFamily}
            fontSize={prefixFontSize}
            fontWeight={prefixWeight}
            textAnchor="middle"
            x={prefixCenterX}
            y={valueFontSize * 0.05}
          >
            {prefix}
          </text>
        ) : null}
        <text
          className="value"
          dominantBaseline="middle"
          fill={valueFill}
          fontFamily={fontFamily}
          fontSize={valueFontSize}
          fontWeight={900}
          textAnchor="middle"
          x={hasPrefix ? valueCenterX : 0}
          y={valueFontSize * 0.05}
        >
          {value}
        </text>
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

export type SmallStickHighlight = "idle" | "active" | "counted";

export type SmallStickProps = PrimitiveGroupProps &
  PlacementProps & {
    activeColor?: ThemeColor;
    color?: ThemeColor;
    highlight?: SmallStickHighlight;
    length?: number;
    outlineColor?: ThemeColor;
    rotation?: number;
    scale?: number;
    thickness?: number;
  };

export const SmallStick = ({
  activeColor,
  color,
  highlight = "idle",
  length = 120,
  outlineColor,
  rotation = 0,
  scale = 1,
  thickness = 18,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: SmallStickProps) => {
  const restingFill = resolveColor(color, colors.reward);
  const activeFill = resolveColor(activeColor, colors.sunshine);
  const stroke = resolveColor(outlineColor, colors.textNavy);
  // Three distinct states: idle = warm resting fill (not yet counted),
  // active = bright accent (being counted now — the eye rests here),
  // counted = calm desaturated grey-blue "done" tone, quieter than active and
  // clearly NOT the idle orange so already-counted sticks read as settled.
  const countedFill = colors.softGrayBlue;
  const fill =
    highlight === "active"
      ? activeFill
      : highlight === "counted"
        ? countedFill
        : restingFill;
  const transforms = [
    rotation !== 0 ? `rotate(${rotation})` : undefined,
    scale !== 1 ? `scale(${scale})` : undefined,
    transform,
  ].filter(Boolean);

  return (
    <PlacedGroup
      {...groupProps}
      transform={transforms.length > 0 ? transforms.join(" ") : undefined}
      x={x}
      y={y}
    >
      <g className="body" style={shadowStyle()}>
        <rect
          fill={fill}
          height={length}
          rx={thickness * 0.5}
          stroke={stroke}
          strokeWidth={NAVY_STROKE}
          width={thickness}
          x={-thickness / 2}
          y={-length / 2}
        />
      </g>
    </PlacedGroup>
  );
};

export type StickGroupLayout = "scatter" | "row" | "bundle";

export type StickGroupProps = PrimitiveGroupProps &
  PlacementProps & {
    activeIndex?: number;
    bundleGap?: number;
    celebrate?: boolean;
    color?: ThemeColor;
    compress?: number;
    count: number;
    layout: StickGroupLayout;
    revealUpTo?: number;
    rowGap?: number;
    scale?: number;
    scatterRadius?: number;
    scatterRotationRange?: number;
    seed?: number;
    stickLength?: number;
    stickThickness?: number;
  };

type StickPlacement = {
  rotation: number;
  x: number;
  y: number;
};

type StickPlacementInput = {
  bundleGap?: number;
  compress?: number;
  count: number;
  rowGap?: number;
  scatterRadius?: number;
  scatterRotationRange?: number;
  seed?: number;
};

const effectiveBundleGap = (bundleGap: number, compress: number): number => {
  const c = clamp01(compress);

  return bundleGap * (1 - 0.3 * c);
};

export const getStickPlacement = (
  index: number,
  layout: StickGroupLayout,
  props: StickPlacementInput,
): StickPlacement => {
  const {
    bundleGap = 18,
    compress = 0,
    count,
    rowGap = 130,
    scatterRadius = 220,
    scatterRotationRange = 25,
    seed = 0,
  } = props;

  if (layout === "row") {
    return {
      rotation: 0,
      x: (index - (count - 1) / 2) * rowGap,
      y: 0,
    };
  }

  if (layout === "bundle") {
    const gap = effectiveBundleGap(bundleGap, compress);

    return {
      rotation: 0,
      x: (index - (count - 1) / 2) * gap,
      y: 0,
    };
  }

  const rand = mulberry32(seed + index * 2654435761);
  const rx = (rand() * 2 - 1) * scatterRadius;
  const ry = (rand() * 2 - 1) * scatterRadius * 0.55;
  const rr = (rand() * 2 - 1) * scatterRotationRange;

  return {
    rotation: rr,
    x: rx,
    y: ry,
  };
};

export const StickGroup = ({
  activeIndex,
  bundleGap = 18,
  celebrate = false,
  color,
  compress = 0,
  count,
  layout,
  revealUpTo,
  rowGap = 130,
  scale = 1,
  scatterRadius = 220,
  scatterRotationRange = 25,
  seed = 0,
  stickLength = 120,
  stickThickness = 18,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: StickGroupProps) => {
  const safeCount = Math.max(0, Math.floor(count));
  const clampedReveal =
    revealUpTo === undefined
      ? safeCount
      : Math.round(clampNumber(revealUpTo, 0, safeCount));
  // `celebrate` lets the composer reason about pulse intent; the actual
  // scale value is composer-driven via `scale` so the pulse can interpolate.
  void celebrate;
  const transforms = [
    scale !== 1 ? `scale(${scale})` : undefined,
    transform,
  ].filter(Boolean);

  return (
    <PlacedGroup
      {...groupProps}
      transform={transforms.length > 0 ? transforms.join(" ") : undefined}
      x={x}
      y={y}
    >
      {Array.from({ length: safeCount }, (_, index) => {
        const placement = getStickPlacement(index, layout, {
          bundleGap,
          compress,
          count: safeCount,
          rowGap,
          scatterRadius,
          scatterRotationRange,
          seed,
        });
        const isActive = activeIndex === index;
        const highlight: SmallStickHighlight = isActive
          ? "active"
          : index < clampedReveal
            ? "counted"
            : "idle";

        return (
          <SmallStick
            color={color}
            highlight={highlight}
            key={index}
            length={stickLength}
            rotation={placement.rotation}
            scale={isActive ? 1.08 : 1}
            thickness={stickThickness}
            x={placement.x}
            y={placement.y}
          />
        );
      })}
    </PlacedGroup>
  );
};

export type BundleWrapStyle = "rope" | "band" | "ribbon";

export type BundleWrapKnotPosition = "top" | "left" | "right";

export type BundleWrapProps = PrimitiveGroupProps &
  PlacementProps & {
    color?: ThemeColor;
    height?: number;
    /** @deprecated Use `knotPosition` instead. Ignored when `knotPosition` is provided. */
    knotSide?: "left" | "right";
    knotPosition?: BundleWrapKnotPosition;
    opacity?: number;
    outlineColor?: ThemeColor;
    style?: BundleWrapStyle;
    width: number;
    wrapProgress?: number;
  };

type BowKnotProps = {
  bandHeight: number;
  fill: string;
  ropeStroke: number;
  ropeStrokeWidth: number;
  stroke: string;
  subProgress: number;
};

const BundleWrapBowKnot = ({
  bandHeight,
  fill,
  ropeStroke,
  ropeStrokeWidth,
  stroke,
  subProgress,
}: BowKnotProps) => {
  void ropeStroke;
  const t = clamp01(subProgress);
  const popScale = 0.8 + 0.2 * t;
  const opacity = t;
  // Two flattened loops tilted out from a central pill knot — the whole bow
  // sits ABOVE the rope band so it never overlaps the rope's stroke width.
  // No tails: at lesson scale they previously collided with the rope and read
  // as arrow-shaped noise rather than a bow.
  const loopRx = bandHeight * 0.6;
  const loopRy = bandHeight * 0.34;
  const loopTilt = 24;
  const loopCenterX = bandHeight * 0.62;
  const loopCenterY = -bandHeight * 0.35;
  const knotWidth = bandHeight * 0.4;
  const knotHeight = bandHeight * 0.4;
  // Anchor so the bow's lowest ink (knot bottom) sits one rope-half above the
  // rope's top edge — leaves a clear visual gap between bow and rope.
  const ropeTop = -bandHeight * 0.3;
  const knotBottom = knotHeight / 2;
  const anchorY = ropeTop - knotBottom - bandHeight * 0.18;

  return (
    <g
      className="bow"
      opacity={opacity}
      transform={`translate(0 ${anchorY}) scale(${popScale})`}
    >
      <ellipse
        cx={-loopCenterX}
        cy={loopCenterY}
        fill={fill}
        rx={loopRx}
        ry={loopRy}
        stroke={stroke}
        strokeWidth={ropeStrokeWidth}
        transform={`rotate(${-loopTilt} ${-loopCenterX} ${loopCenterY})`}
      />
      <ellipse
        cx={loopCenterX}
        cy={loopCenterY}
        fill={fill}
        rx={loopRx}
        ry={loopRy}
        stroke={stroke}
        strokeWidth={ropeStrokeWidth}
        transform={`rotate(${loopTilt} ${loopCenterX} ${loopCenterY})`}
      />
      <rect
        fill={fill}
        height={knotHeight}
        rx={knotHeight / 2}
        stroke={stroke}
        strokeWidth={ropeStrokeWidth}
        width={knotWidth}
        x={-knotWidth / 2}
        y={-knotHeight / 2}
      />
    </g>
  );
};

export const BundleWrap = ({
  color,
  height,
  knotPosition,
  knotSide,
  opacity = 1,
  outlineColor,
  style = "rope",
  transform,
  width,
  wrapProgress = 1,
  x = 0,
  y = 0,
  ...groupProps
}: BundleWrapProps) => {
  const bandHeight = height ?? width * 0.22;
  const fill = resolveColor(color, colors.coral);
  const stroke = resolveColor(outlineColor, colors.textNavy);
  const reveal = clamp01(wrapProgress);
  const groupOpacity = clamp01(opacity);
  const half = width / 2;
  // `knotPosition` wins when provided. Otherwise fall back to legacy
  // `knotSide` ("left" | "right") for backwards compat. Default to "top".
  const resolvedKnotPosition: BundleWrapKnotPosition =
    knotPosition ?? (knotSide === undefined ? "top" : knotSide);
  const legacySide: "left" | "right" =
    resolvedKnotPosition === "left" ? "left" : "right";
  const knotX = legacySide === "right" ? half : -half;
  const startX = legacySide === "right" ? -half : half;
  const knotRadius = bandHeight * 0.7;

  if (style === "band") {
    return (
      <PlacedGroup
        {...groupProps}
        opacity={groupOpacity}
        transform={transform}
        x={x}
        y={y}
      >
        <g className="body" style={shadowStyle()}>
          <rect
            fill={fill}
            height={bandHeight}
            opacity={reveal}
            rx={bandHeight / 2}
            stroke={stroke}
            strokeWidth={NAVY_STROKE}
            width={width * reveal}
            x={legacySide === "right" ? -half : half - width * reveal}
            y={-bandHeight / 2}
          />
        </g>
      </PlacedGroup>
    );
  }

  if (style === "ribbon") {
    const tailDirection = legacySide === "right" ? 1 : -1;

    return (
      <PlacedGroup
        {...groupProps}
        opacity={groupOpacity}
        transform={transform}
        x={x}
        y={y}
      >
        <g className="body" style={shadowStyle()}>
          <rect
            fill={fill}
            height={bandHeight}
            opacity={reveal}
            rx={bandHeight / 3}
            stroke={stroke}
            strokeWidth={NAVY_STROKE}
            width={width * reveal}
            x={legacySide === "right" ? -half : half - width * reveal}
            y={-bandHeight / 2}
          />
          {reveal >= 0.95 ? (
            <path
              d={`M ${knotX} 0 L ${knotX + tailDirection * bandHeight * 1.2} ${-bandHeight * 0.9} L ${knotX + tailDirection * bandHeight * 1.2} ${bandHeight * 0.9} Z`}
              fill={fill}
              stroke={stroke}
              strokeLinejoin="round"
              strokeWidth={NAVY_STROKE}
            />
          ) : null}
        </g>
      </PlacedGroup>
    );
  }

  const ropeStroke = bandHeight * 0.6;
  // For the top-knot layout, the rope spans the full bundle width.
  // For legacy side-knot layouts, the rope still spans from one side to the other.
  const ropePath =
    resolvedKnotPosition === "top"
      ? `M ${-half} 0 L ${half} 0`
      : `M ${startX} 0 L ${knotX} 0`;
  // Back stroke is offset slightly downward so the kid reads it as the
  // rope curving around behind the sticks. Lower opacity so it sits "behind"
  // visually even though it is drawn in the same primitive layer.
  const backOffsetY = 6;
  const backRopePath =
    resolvedKnotPosition === "top"
      ? `M ${-half} ${backOffsetY} L ${half} ${backOffsetY}`
      : `M ${startX} ${backOffsetY} L ${knotX} ${backOffsetY}`;
  // The bow draws on in the last 20% of wrapProgress.
  const bowSubProgress = reveal <= 0.8 ? 0 : (reveal - 0.8) / 0.2;
  const renderBow = resolvedKnotPosition === "top" && bowSubProgress > 0;
  const renderSideCircle = resolvedKnotPosition !== "top" && reveal >= 0.9;

  return (
    <PlacedGroup
      {...groupProps}
      opacity={groupOpacity}
      transform={transform}
      x={x}
      y={y}
    >
      <g className="body" style={shadowStyle()}>
        {/* Back rope stroke — same coral, lower opacity, slightly offset. */}
        <path
          d={backRopePath}
          fill="none"
          opacity={0.35}
          pathLength={1}
          stroke={fill}
          strokeDasharray={1}
          strokeDashoffset={1 - reveal}
          strokeLinecap="round"
          strokeWidth={ropeStroke}
        />
        {/* Front rope stroke — full opacity, dominant rope visual. */}
        <path
          d={ropePath}
          fill="none"
          pathLength={1}
          stroke={fill}
          strokeDasharray={1}
          strokeDashoffset={1 - reveal}
          strokeLinecap="round"
          strokeWidth={ropeStroke}
        />
        <path
          d={ropePath}
          fill="none"
          opacity={0.35}
          pathLength={1}
          stroke={stroke}
          strokeDasharray="6 14"
          strokeDashoffset={1 - reveal}
          strokeLinecap="round"
          strokeWidth={ropeStroke * 0.45}
        />
        {renderBow ? (
          <BundleWrapBowKnot
            bandHeight={bandHeight}
            fill={fill}
            ropeStroke={ropeStroke}
            ropeStrokeWidth={NAVY_STROKE}
            stroke={stroke}
            subProgress={bowSubProgress}
          />
        ) : null}
        {renderSideCircle ? (
          <circle
            cx={knotX}
            cy={0}
            fill={fill}
            r={knotRadius}
            stroke={stroke}
            strokeWidth={NAVY_STROKE}
          />
        ) : null}
      </g>
    </PlacedGroup>
  );
};

export type CountStepIndicatorProps = PrimitiveGroupProps &
  PlacementProps & {
    background?: ThemeColor;
    color?: ThemeColor;
    outlineColor?: ThemeColor;
    progress?: number;
    size?: number;
    value: number | string;
  };

export const CountStepIndicator = ({
  background,
  color,
  outlineColor,
  progress = 1,
  size = 56,
  transform,
  value,
  x = 0,
  y = 0,
  ...groupProps
}: CountStepIndicatorProps) => {
  const reveal = clamp01(progress);
  const popScale = 0.6 + 0.4 * reveal;
  const fadeOpacity = clamp01(reveal * 2);
  const fill = resolveColor(background, colors.white);
  const stroke = resolveColor(outlineColor, colors.textNavy);
  const inkFill = resolveColor(color, colors.textNavy);
  const transforms = [`scale(${popScale})`, transform].filter(Boolean);

  return (
    <PlacedGroup
      {...groupProps}
      opacity={fadeOpacity}
      transform={transforms.join(" ")}
      x={x}
      y={y}
    >
      <g className="body" style={shadowStyle()}>
        <circle
          cx={0}
          cy={0}
          fill={fill}
          r={size / 2}
          stroke={stroke}
          strokeWidth={NAVY_STROKE}
        />
        <PrimitiveLabel fill={inkFill} fontSize={size * 0.62} x={0} y={2}>
          {value}
        </PrimitiveLabel>
      </g>
    </PlacedGroup>
  );
};

export type StepTallyVariant = "dots" | "numeric";

export type StepTallyProps = PrimitiveGroupProps &
  PlacementProps & {
    background?: ThemeColor;
    color?: ThemeColor;
    dimmed?: boolean;
    dotColor?: ThemeColor;
    dotGap?: number;
    dotSize?: number;
    label?: ReactNode;
    outlineColor?: ThemeColor;
    progress?: number;
    size?: number;
    steps: number;
    variant?: StepTallyVariant;
  };

export const StepTally = ({
  background,
  color,
  dimmed = false,
  dotColor,
  dotGap = 8,
  dotSize = 18,
  label,
  outlineColor,
  progress = 1,
  size = 64,
  steps,
  transform,
  variant = "numeric",
  x = 0,
  y = 0,
  ...groupProps
}: StepTallyProps) => {
  const safeSteps = Math.max(0, Math.floor(steps));
  const reveal = clamp01(progress);
  const dimOpacity = stateOpacity(undefined, dimmed);
  const fadeOpacity = clamp01(reveal) * dimOpacity;
  const inkFill = resolveColor(color, colors.textNavy);
  const stroke = resolveColor(outlineColor, colors.textNavy);
  const fill = resolveColor(background, colors.white);

  if (variant === "dots") {
    const dotFill = resolveColor(dotColor, colors.textNavy);
    const totalWidth =
      safeSteps > 0 ? safeSteps * dotSize + (safeSteps - 1) * dotGap : 0;

    return (
      <PlacedGroup
        {...groupProps}
        opacity={fadeOpacity}
        transform={transform}
        x={x}
        y={y}
      >
        <g className="body">
          {Array.from({ length: safeSteps }, (_, index) => (
            <circle
              cx={-totalWidth / 2 + dotSize / 2 + index * (dotSize + dotGap)}
              cy={0}
              fill={dotFill}
              key={index}
              r={dotSize / 2}
            />
          ))}
        </g>
      </PlacedGroup>
    );
  }

  const valueFontSize = size * 0.62;
  const labelFontSize = size * 0.42;
  const valueText = String(safeSteps);
  const approxValueWidth = valueText.length * valueFontSize * 0.62;
  const labelWidth = label ? labelFontSize * 1.2 : 0;
  const innerGap = label ? 10 : 0;
  const horizontalPadding = 28;
  const pillWidth =
    approxValueWidth + innerGap + labelWidth + horizontalPadding * 2;

  return (
    <PlacedGroup
      {...groupProps}
      opacity={fadeOpacity}
      transform={transform}
      x={x}
      y={y}
    >
      <g className="body" style={shadowStyle()}>
        <rect
          fill={fill}
          height={size}
          rx={size / 2}
          stroke={stroke}
          strokeWidth={NAVY_STROKE}
          width={pillWidth}
          x={-pillWidth / 2}
          y={-size / 2}
        />
        <PrimitiveLabel
          fill={inkFill}
          fontSize={valueFontSize}
          x={
            label
              ? -pillWidth / 2 + horizontalPadding + approxValueWidth / 2
              : 0
          }
          y={2}
        >
          {valueText}
        </PrimitiveLabel>
        {label ? (
          <PrimitiveLabel
            fill={inkFill}
            fontSize={labelFontSize}
            x={
              -pillWidth / 2 +
              horizontalPadding +
              approxValueWidth +
              innerGap +
              labelWidth / 2
            }
            y={3}
          >
            {label}
          </PrimitiveLabel>
        ) : null}
      </g>
    </PlacedGroup>
  );
};

export type LabelCalloutAppearStyle = "fade" | "write-on";

export type LabelCalloutProps = PrimitiveGroupProps &
  PlacementProps & {
    appearStyle?: LabelCalloutAppearStyle;
    color?: ThemeColor;
    fontSize?: number;
    fontWeight?: number;
    maxWidth?: number;
    progress?: number;
    text: ReactNode;
    underline?: boolean;
    underlineColor?: ThemeColor;
  };

export const LabelCallout = ({
  // appearStyle "write-on" currently falls back to "fade" — Chinese glyph
  // path write-on is brittle; composer can override in future non-CJK lessons.
  appearStyle = "fade",
  color,
  fontSize = 48,
  fontWeight = 900,
  maxWidth,
  progress = 1,
  text,
  transform,
  underline = false,
  underlineColor,
  x = 0,
  y = 0,
  ...groupProps
}: LabelCalloutProps) => {
  const reveal = clamp01(progress);
  const inkFill = resolveColor(color, colors.textNavy);
  const underlineStroke = resolveColor(underlineColor, colors.textNavy);
  // Both "fade" and "write-on" currently drive opacity off progress. See note above.
  const textOpacity = appearStyle === "fade" ? reveal : reveal;
  const approxTextWidth =
    typeof text === "string"
      ? text.length * fontSize * 0.62
      : maxWidth ?? fontSize * 4;
  const underlineWidth = maxWidth ?? approxTextWidth;
  const underlineY = fontSize * 0.62;

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g className="body" opacity={textOpacity}>
        <text
          dominantBaseline="middle"
          fill={inkFill}
          fontFamily={fontFamily}
          fontSize={fontSize}
          fontWeight={fontWeight}
          textAnchor="middle"
          y={0}
        >
          {text}
        </text>
      </g>
      {underline ? (
        <line
          pathLength={1}
          stroke={underlineStroke}
          strokeDasharray={1}
          strokeDashoffset={1 - reveal}
          strokeLinecap="round"
          strokeWidth={Math.max(3, fontSize * 0.08)}
          x1={-underlineWidth / 2}
          x2={underlineWidth / 2}
          y1={underlineY}
          y2={underlineY}
        />
      ) : null}
    </PlacedGroup>
  );
};

// =========================================================================
// FenHeDiagram — 分合式 (part-whole diagram).
//
// Whole-on-top, two diagonal stroke-revealable lines descending to two
// part numbers below. Lesson-agnostic: callers pass `whole` and
// `parts: [left, right]`; the primitive renders only geometry. No
// hardcoded Chinese strings, no hardcoded values.
//
// Two modes:
//  - `renderNumbers={true}` (default) — primitive renders its own NumberCards
//    at the three anchor positions. Use for `fenheshi-read`, `five-1-4`,
//    `five-3-2-and-4-1`, outro recap.
//  - `renderNumbers={false}` — primitive renders ONLY the two diagonal
//    lines (no numerals). The composer places external NumberCard
//    instances at the anchor positions returned by
//    `getFenHeDiagramAnchors(width)`. This mode enables identity-preserved
//    glyph migration: in `fenheshi-intro`, the same NumberCard React
//    instances from zone-chips interpolate their `x`/`y` to land exactly
//    on these anchors — same instance, no fade-out/fade-in cross-fade.
//
// `progress` (0–1) drives the two diagonal lines via `strokeDashoffset`,
// and (when `renderNumbers=true`) fades in the part-number cards once the
// lines have begun drawing. The whole-number card is always at full
// opacity when `renderNumbers=true` — it lands first, lines follow.
// =========================================================================

export type FenHeDiagramAnchors = {
  leftPart: { x: number; y: number };
  rightPart: { x: number; y: number };
  whole: { x: number; y: number };
};

/**
 * Returns the three numeral anchor positions for a FenHeDiagram of the
 * given width, in the primitive's LOCAL coordinate space (origin at the
 * group's transform). The diagram is symmetric about x=0.
 *
 * `width` is the OUTER bounding box of the diagram — the left and
 * right NumberCards (sized internally from `width`) sit so their
 * OUTER edges align with `±width/2`. Two diagrams placed at centers
 * `width + gap` apart will have a visible `gap` between their cards,
 * never an overlap. The composer uses this guarantee to lay out the
 * four-diagram row in `five-3-2-and-4-1` without manual offsets.
 *
 * The composer also uses this to compute migration targets in
 * `fenheshi-intro` — interpolate a NumberCard's `x`/`y` from its
 * zone-chips anchor TO `anchors.whole` (or `anchors.leftPart`, etc.)
 * expressed in the scene's outer coordinate space (add the diagram's
 * own translation).
 */
export const getFenHeDiagramAnchors = (
  width = 200,
  // Vertical reach of the diagonals as a fraction of `width`. Default 0.65
  // (slightly taller than half-width so the V reads as a "comes down from the
  // whole" gesture, not a flat triangle). A SMALLER ratio makes the diagram
  // vertically SHORTER (whole/parts closer) WITHOUT changing card size — used
  // by the compact column variant so more diagrams fit with padded glyphs.
  verticalReachRatio = 0.65,
): FenHeDiagramAnchors => {
  // Cards sit so their outer edge lines up with the diagram's outer
  // edge. Card width is `width * 0.36` (see FenHeDiagram body). The
  // part-anchor x is therefore `±(width/2 - cardWidth/2)`.
  const cardWidth = width * 0.36;
  const partAnchorX = width / 2 - cardWidth / 2;
  const verticalReach = width * verticalReachRatio;

  return {
    leftPart: { x: -partAnchorX, y: verticalReach / 2 },
    rightPart: { x: partAnchorX, y: verticalReach / 2 },
    whole: { x: 0, y: -verticalReach / 2 },
  };
};

export type FenHeDiagramValue = number | string;

export type FenHeDiagramProps = PrimitiveGroupProps &
  PlacementProps & {
    /** Diagram width in local SVG units. Default 200. The diagonal vertical
     *  reach scales from this. */
    diagramWidth?: number;
    /** Reduce opacity (per `shared.ts` `stateOpacity`). Used for the
     *  "previously seen" state in `five-1-4`. */
    dimmed?: boolean;
    /** Color of the two diagonal lines. Defaults to textNavy. The
     *  visual-design contract recommends navy unless the part-numbers
     *  visibly dominate; coral is allowed as a stylistic accent only. */
    lineColor?: ThemeColor;
    /** Color of the rendered NumberCard glyphs. Defaults to textNavy
     *  (passed through to NumberCard's text fill via the card surface
     *  color contract). */
    numberColor?: ThemeColor;
    /** Two part numbers, left and right. */
    parts: [FenHeDiagramValue, FenHeDiagramValue];
    /** 0..1. Drives stroke-on of the two diagonals AND (when
     *  `renderNumbers=true`) the part-number cards' opacity. The
     *  whole-number card lands at the start of the cue at full opacity. */
    progress?: number;
    /** When false, the primitive draws ONLY the two diagonal lines —
     *  the caller is responsible for placing the three NumberCards at
     *  `getFenHeDiagramAnchors(diagramWidth)`. Use for migration cues. */
    renderNumbers?: boolean;
    /** Vertical reach of the diagonals as a fraction of `diagramWidth`.
     *  Default 0.65. A smaller value makes the diagram vertically SHORTER
     *  (whole/parts closer) while keeping card size unchanged — enables a
     *  compact column variant. Must match the ratio passed to
     *  `getFenHeDiagramAnchors` when the caller places its own cards. */
    verticalReachRatio?: number;
    /** The whole value (top of the diagram). */
    whole: FenHeDiagramValue;
  };

export const FenHeDiagram = ({
  diagramWidth = 200,
  dimmed = false,
  lineColor,
  numberColor,
  parts,
  progress = 1,
  renderNumbers = true,
  transform,
  verticalReachRatio = 0.65,
  whole,
  x = 0,
  y = 0,
  ...groupProps
}: FenHeDiagramProps) => {
  const reveal = clamp01(progress);
  const stroke = resolveColor(lineColor, colors.textNavy);
  const cardSurface = resolveColor(numberColor, colors.white);
  const anchors = getFenHeDiagramAnchors(diagramWidth, verticalReachRatio);
  // NumberCard sized so two diagrams placed `diagramWidth + gap`
  // apart never overlap their part-cards: the part anchor sits at
  // `±(diagramWidth/2 - cardSize/2)`, so the outer card edge is
  // exactly `±diagramWidth/2`. The 0.36 ratio keeps the glyph at
  // ~60+ px on a diagram width of 200, which clears the
  // visual-design body-label minimum (36 px) and lands near the
  // secondary-target (80 px) when the diagram is rendered at the
  // larger `fenheshi-intro` size (≥ 220 px).
  const cardSize = diagramWidth * 0.36;
  const cardHeight = cardSize * 1.18;

  // The diagonals' visible endpoints sit at the edge of each
  // NumberCard, NOT at the center. Inset both ends by an amount that
  // matches half the card's height (rough projection along the line),
  // so the line doesn't crash into the numeral's bounding box.
  const inset = cardHeight * 0.45;
  // Original endpoints (corner-to-corner).
  const leftDx = anchors.leftPart.x - anchors.whole.x;
  const leftDy = anchors.leftPart.y - anchors.whole.y;
  const leftLen = Math.hypot(leftDx, leftDy);
  const leftUx = leftDx / leftLen;
  const leftUy = leftDy / leftLen;
  const leftStart = {
    x: anchors.whole.x + leftUx * inset,
    y: anchors.whole.y + leftUy * inset,
  };
  const leftEnd = {
    x: anchors.leftPart.x - leftUx * inset,
    y: anchors.leftPart.y - leftUy * inset,
  };

  const rightDx = anchors.rightPart.x - anchors.whole.x;
  const rightDy = anchors.rightPart.y - anchors.whole.y;
  const rightLen = Math.hypot(rightDx, rightDy);
  const rightUx = rightDx / rightLen;
  const rightUy = rightDy / rightLen;
  const rightStart = {
    x: anchors.whole.x + rightUx * inset,
    y: anchors.whole.y + rightUy * inset,
  };
  const rightEnd = {
    x: anchors.rightPart.x - rightUx * inset,
    y: anchors.rightPart.y - rightUy * inset,
  };

  const strokeWidth = Math.max(4, diagramWidth * 0.025);

  return (
    <PlacedGroup
      {...groupProps}
      opacity={stateOpacity(undefined, dimmed)}
      transform={transform}
      x={x}
      y={y}
    >
      <g className="lines">
        <line
          pathLength={1}
          stroke={stroke}
          strokeDasharray={1}
          strokeDashoffset={1 - reveal}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          x1={leftStart.x}
          x2={leftEnd.x}
          y1={leftStart.y}
          y2={leftEnd.y}
        />
        <line
          pathLength={1}
          stroke={stroke}
          strokeDasharray={1}
          strokeDashoffset={1 - reveal}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          x1={rightStart.x}
          x2={rightEnd.x}
          y1={rightStart.y}
          y2={rightEnd.y}
        />
      </g>
      {renderNumbers ? (
        <g className="numbers">
          <NumberCard
            color={cardSurface}
            height={cardHeight}
            value={whole}
            width={cardSize}
            x={anchors.whole.x}
            y={anchors.whole.y}
          />
          <g opacity={reveal}>
            <NumberCard
              color={cardSurface}
              height={cardHeight}
              value={parts[0]}
              width={cardSize}
              x={anchors.leftPart.x}
              y={anchors.leftPart.y}
            />
            <NumberCard
              color={cardSurface}
              height={cardHeight}
              value={parts[1]}
              width={cardSize}
              x={anchors.rightPart.x}
              y={anchors.rightPart.y}
            />
          </g>
        </g>
      ) : null}
    </PlacedGroup>
  );
};

// =========================================================================
// PlaceValueMat — a labeled multi-column place-value mat.
//
// Seats place-value CONTENTS in named columns (tens | ones by default,
// optionally hundreds) under drawn column headers and an optional written
// digit below each column. Bridges concrete material (a ten-bundle + loose
// ones) to the digits of a written numeral, e.g. "14" = 1 ten + 4 ones.
//
// Contents come from props, never baked in:
//  - `children` is an array, one entry per column (left→right). The composer
//    drops a <BundleWrap> (or <StickGroup>) into the tens slot and a row of
//    <SmallStick>s into the ones slot. Each entry is centered in its column.
//  - When a column has no child, `perColumnCount[i]` draws that many simple
//    unit dots as a placeholder so the mat still reads as occupied.
//
// `showDigits` + `digits` write the numeral under each column. `highlightColumn`
// (0-based, -1 = none) recolors one column's header + background to focus it.
// Lesson-agnostic: column names, counts, and digits are all props.
// =========================================================================

export type PlaceValueMatProps = PrimitiveGroupProps &
  PlacementProps & {
    /** Background fill of an un-highlighted column. */
    columnFill?: ThemeColor;
    /** Column header labels, left→right. Default ["tens", "ones"]. */
    columns?: string[];
    /** Per-column content. One ReactNode per column, centered in its body.
     *  A null/undefined entry falls back to `perColumnCount` placeholders. */
    children?: ReactNode[];
    /** Width of each column body in local SVG units. */
    columnWidth?: number;
    /** Written digit per column, left→right. Used when `showDigits`. */
    digits?: number[];
    /** Body height of each column (the region contents are seated in). */
    height?: number;
    /** Accent fill applied to the highlighted column's header + body. */
    highlightColor?: ThemeColor;
    /** 0-based column to focus; -1 = none. */
    highlightColumn?: number;
    /** Placeholder unit dots per column, used only where `children` is empty. */
    perColumnCount?: number[];
    /** Render a written digit under each column. */
    showDigits?: boolean;
  };

export const PlaceValueMat = ({
  children,
  columnFill,
  columns = ["tens", "ones"],
  columnWidth = 180,
  digits,
  height = 220,
  highlightColor,
  highlightColumn = -1,
  perColumnCount,
  showDigits = false,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: PlaceValueMatProps) => {
  const count = Math.max(1, columns.length);
  const headerHeight = 48;
  const digitHeight = showDigits ? 96 : 0;
  const matWidth = count * columnWidth;
  const surface = resolveColor(columnFill, colors.cream);
  const accent = resolveColor(highlightColor, colors.sunshine);
  const stroke = colors.textNavy;
  // Origin centers the whole mat on (0,0). Header sits on top, the column
  // bodies below it, and (when enabled) the written digits below the bodies.
  const left = -matWidth / 2;
  const headerTop = -(headerHeight + height + digitHeight) / 2;
  const bodyTop = headerTop + headerHeight;
  const bodyHeight = height;
  const dotRadius = Math.max(8, columnWidth * 0.06);

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g className="body" style={shadowStyle()}>
        {columns.map((columnLabel, index) => {
          const columnLeft = left + index * columnWidth;
          const columnCenter = columnLeft + columnWidth / 2;
          const focused = index === highlightColumn;
          const child = children?.[index];
          const placeholderCount = Math.max(
            0,
            Math.floor(perColumnCount?.[index] ?? 0),
          );

          return (
            <g key={`column-${index}`}>
              {/* Column body background. */}
              <rect
                fill={focused ? accent : surface}
                height={bodyHeight}
                opacity={focused ? 0.55 : 1}
                rx={CARD_RADIUS}
                stroke={stroke}
                strokeWidth={NAVY_STROKE}
                width={columnWidth}
                x={columnLeft}
                y={bodyTop}
              />
              {/* Header band. */}
              <rect
                fill={focused ? accent : colors.white}
                height={headerHeight}
                rx={CARD_RADIUS}
                stroke={stroke}
                strokeWidth={NAVY_STROKE}
                width={columnWidth}
                x={columnLeft}
                y={headerTop}
              />
              <PrimitiveLabel
                fontSize={Math.min(26, headerHeight * 0.5)}
                x={columnCenter}
                y={headerTop + headerHeight / 2 + 1}
              >
                {columnLabel}
              </PrimitiveLabel>
              {/* Contents: a passed child centered in the body, else dots. */}
              {child != null ? (
                <g
                  transform={`translate(${columnCenter} ${bodyTop + bodyHeight / 2})`}
                >
                  {child}
                </g>
              ) : (
                Array.from({ length: placeholderCount }, (_, dotIndex) => {
                  const perRow = Math.min(placeholderCount, 5);
                  const rows = Math.ceil(placeholderCount / perRow);
                  const column = dotIndex % perRow;
                  const row = Math.floor(dotIndex / perRow);
                  const totalRowDots = Math.min(
                    placeholderCount - row * perRow,
                    perRow,
                  );
                  const spacing = dotRadius * 2.6;

                  return (
                    <circle
                      cx={
                        columnCenter +
                        (column - (totalRowDots - 1) / 2) * spacing
                      }
                      cy={
                        bodyTop +
                        bodyHeight / 2 +
                        (row - (rows - 1) / 2) * spacing
                      }
                      fill={colors.coral}
                      key={`dot-${dotIndex}`}
                      r={dotRadius}
                      stroke={stroke}
                      strokeWidth={3}
                    />
                  );
                })
              )}
              {/* Written digit under the column. */}
              {showDigits ? (
                <PrimitiveLabel
                  fontSize={Math.min(72, digitHeight * 0.78)}
                  x={columnCenter}
                  y={bodyTop + bodyHeight + digitHeight / 2}
                >
                  {digits?.[index] ?? ""}
                </PrimitiveLabel>
              ) : null}
            </g>
          );
        })}
        {/* Dividers between adjacent columns. */}
        {columns.slice(1).map((_, index) => {
          const dividerX = left + (index + 1) * columnWidth;

          return (
            <line
              key={`divider-${index}`}
              stroke={stroke}
              strokeLinecap="round"
              strokeWidth={NAVY_STROKE}
              x1={dividerX}
              x2={dividerX}
              y1={headerTop}
              y2={bodyTop + bodyHeight}
            />
          );
        })}
      </g>
    </PlacedGroup>
  );
};

// =========================================================================
// ConservationBundle — an x-ray of a "1 ten" bundle.
//
// Proves the regrouping invariant: a bundled ten STILL CONTAINS ten ones.
// `xrayProgress` 0 = an opaque wrapped bundle; as it rises the wrap fades
// toward a ghost outline and the `count` inner sticks become visible inside.
// This defuses the "a ten is just one thing now" misconception by letting the
// child see the ones living inside the bundle.
//
// Distinct from BundleWrap: BundleWrap shows ten ones BECOMING one ten
// (wrapProgress draws the wrap on); ConservationBundle shows one ten still IS
// ten ones (xrayProgress reveals the contents). Lesson-agnostic — `count`,
// colors, and sizing are props.
// =========================================================================

export type ConservationBundleProps = PrimitiveGroupProps &
  PlacementProps & {
    /** Wrap (band) color. Defaults to coral, matching BundleWrap. */
    color?: ThemeColor;
    /** Inner stick count. Default 10 (one ten). */
    count?: number;
    /** Emphasize the revealed inner sticks (active highlight) once visible. */
    highlightInside?: boolean;
    /** Color of the ghosted inner sticks. */
    stickColor?: ThemeColor;
    /** Length of each inner stick. */
    stickLength?: number;
    /** Thickness of each inner stick. */
    stickThickness?: number;
    /** 0 = solid opaque bundle, 1 = wrap ghosted + inner sticks fully visible. */
    xrayProgress?: number;
  };

export const ConservationBundle = ({
  color,
  count = 10,
  highlightInside = false,
  stickColor,
  stickLength = 150,
  stickThickness = 18,
  transform,
  x = 0,
  y = 0,
  xrayProgress = 0,
  ...groupProps
}: ConservationBundleProps) => {
  const safeCount = Math.max(1, Math.floor(count));
  const reveal = clamp01(xrayProgress);
  const wrapFill = resolveColor(color, colors.coral);
  const stroke = colors.textNavy;
  // The inner sticks sit in a centered row; the wrap band crosses their middle.
  const gap = stickThickness * 0.9;
  const rowWidth =
    safeCount * stickThickness + (safeCount - 1) * gap;
  const bandHeight = stickLength * 0.34;
  // The wrap is opaque at xrayProgress 0 and fades to a faint ghost outline as
  // the x-ray rises; the inner sticks fade IN over the same window.
  const wrapBodyOpacity = 1 - 0.82 * reveal;
  const stickOpacity = clamp01((reveal - 0.1) / 0.9);

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      <g className="body" style={shadowStyle()}>
        {/* Inner sticks — revealed as the x-ray rises. */}
        <g className="inside" opacity={stickOpacity}>
          {Array.from({ length: safeCount }, (_, index) => (
            <SmallStick
              color={stickColor}
              highlight={highlightInside ? "active" : "counted"}
              key={index}
              length={stickLength}
              thickness={stickThickness}
              x={
                -rowWidth / 2 +
                stickThickness / 2 +
                index * (stickThickness + gap)
              }
              y={0}
            />
          ))}
        </g>
        {/* Wrap band — opaque at first, ghosted as the contents show through. */}
        <rect
          fill={wrapFill}
          height={bandHeight}
          opacity={wrapBodyOpacity}
          rx={bandHeight / 2}
          stroke={stroke}
          strokeOpacity={0.35 + 0.65 * (1 - reveal)}
          strokeWidth={NAVY_STROKE}
          width={rowWidth + stickThickness * 2}
          x={-(rowWidth + stickThickness * 2) / 2}
          y={-bandHeight / 2}
        />
      </g>
    </PlacedGroup>
  );
};

// CountingBeadDevice — a single-rod bead counter (计数器) whose DISPLAYED count is
// driven by a `count` prop, so pulling one more bead onto the rod makes the
// number grow by exactly one (1→2→3→4→5). It is the "+1 is physical" teaching
// atom for any 1~N number-sequence / 接着数 lesson: each next number is the
// previous count plus this one newest bead. NOT the static `abacus` IconAsset —
// that fixed-form decorative SVG has no count/progress/state prop; a count-driven
// teaching object the child REASONS about must be a primitive (the asset fence).
//
// Reads as beads, not flat dots: each bead is a circle lit from above (a top
// highlight + a seated contact shadow on the rod) with a navy outline, so the
// silhouette is unmistakably a threaded bead at render size. Empty slots up to
// `capacity` are faint ghost rings so the rod's room-to-grow is visible.
//
// One-more is unmistakable: the NEWEST bead (index = count-1) slides into place
// from the open end of the rod via `revealProgress` (eased with EASE.enter), and
// when `activeIndex` points at it a sunshine "just-moved" ring swells via
// `activePulse` (0..1) — earlier beads sit settled in the resting bead color.
// The optional value readout beside the rod (CountStepIndicator look) flips to
// `count`, so "one more bead → the number grew by one" is one synchronized beat.
//
// LESSON-AGNOSTIC + prop-driven: count/capacity/colors/orientation all vary by
// prop; NO baked value, topic, or Chinese string. ZERO frame literals + ZERO raw
// motion literals — the caller passes revealProgress/activePulse derived from
// atFrame (cue-relative offsets) and the only curve is the named EASE.enter.
export type CountingBeadDeviceOrientation = "horizontal" | "vertical";

export type CountingBeadDeviceProps = PrimitiveGroupProps &
  PlacementProps & {
    activeIndex?: number; // which bead just moved (0-based); -1/undefined = none
    activePulse?: number; // 0..1 swell of the one-more ring (caller drives from atFrame)
    beadColor?: ThemeColor; // resting bead fill (default reward orange)
    beadRadius?: number; // bead radius in viewbox units
    capacity?: number; // total slots on the rod (default 10)
    count: number; // beads pulled/active, 0..capacity — DRIVES the shown number
    highlightColor?: ThemeColor; // the just-moved ring + active bead accent (default sunshine)
    orientation?: CountingBeadDeviceOrientation;
    revealProgress?: number; // 0..1 newest bead sliding into place (caller drives from atFrame)
    rodColor?: ThemeColor; // the rod line (default navy ink)
    rodLength?: number; // length of the rod between its end caps
    showValueLabel?: boolean; // optional digit readout beside the rod (default true)
  };

export const CountingBeadDevice = ({
  activeIndex,
  activePulse = 0,
  beadColor,
  beadRadius = 30,
  capacity = 10,
  count,
  highlightColor,
  orientation = "horizontal",
  revealProgress = 1,
  rodColor,
  rodLength,
  showValueLabel = true,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: CountingBeadDeviceProps) => {
  const slots = Math.max(1, Math.round(capacity));
  const filled = Math.round(clampNumber(count, 0, slots));
  const r = Math.max(6, beadRadius);
  // The newest bead slides; EASE.enter shapes the raw 0..1 the caller passes so
  // the bead settles to a stop. activePulse stays raw (caller-driven) so a still
  // and a moving frame both read; this is the ONLY motion shaping here.
  const slide = EASE.enter(clamp01(revealProgress));
  const pulse = clamp01(activePulse);

  const restingFill = resolveColor(beadColor, colors.reward);
  const accent = resolveColor(highlightColor, colors.sunshine);
  const rodStroke = resolveColor(rodColor, colors.textNavy);
  const ghostStroke = colors.softGrayBlue;

  // Bead pitch packs beads snugly toward the seated (filled) end with a hair of
  // air between them so each stays its own circle. The rod spans all `slots`.
  const pitch = r * 2 + Math.max(6, r * 0.32);
  const span = rodLength ?? slots * pitch;
  const halfSpan = span / 2;
  const capOffset = r * 1.15; // end-cap knobs sit just past the bead row
  // Filled beads seat from the START end; the newest occupies index filled-1.
  const seatedCenter = (index: number) => -halfSpan + r + index * pitch;
  // The sliding bead enters from the OPEN end and travels to its seat.
  const openEnd = halfSpan - r;

  // Geometry along a 1-D axis; orientation maps that axis to x or y. Horizontal
  // grows left→right, vertical grows bottom→top (beads "stack up").
  const place = (along: number, across = 0): readonly [number, number] =>
    orientation === "vertical" ? [across, -along] : [along, across];

  const lightOffset = -r * 0.34; // top-left highlight: one light source from above
  const valueGap = r * 2.1; // readout sits clear of the rod, in its own zone

  const beadNodes = Array.from({ length: filled }, (_, index) => {
    const isNewest = index === filled - 1;
    const seat = seatedCenter(index);
    const along = isNewest ? openEnd + (seat - openEnd) * slide : seat;
    const [bx, by] = place(along);
    const isActive =
      activeIndex !== undefined && activeIndex >= 0 && index === activeIndex;
    // Active bead leans toward the accent as the pulse swells; the eye rests on
    // "this is the one that just made the number grow".
    const coreFill = isActive ? accent : restingFill;

    return (
      <g key={index} transform={`translate(${bx} ${by})`}>
        {/* one-more swell ring — only on the active (just-moved) bead */}
        {isActive && pulse > 0 ? (
          <circle
            cx={0}
            cy={0}
            fill="none"
            opacity={(1 - pulse) * 0.85}
            r={r + 4 + pulse * r * 0.9}
            stroke={accent}
            strokeWidth={5}
          />
        ) : null}
        {/* seated contact shadow on the rod — "it doesn't float" */}
        <ellipse
          cx={0}
          cy={r * 0.72}
          fill={colors.textNavy}
          opacity={0.16}
          rx={r * 0.82}
          ry={r * 0.26}
        />
        <circle
          cx={0}
          cy={0}
          fill={coreFill}
          r={r}
          stroke={colors.textNavy}
          strokeWidth={NAVY_STROKE}
        />
        {/* core-shadow band (inset, darker) keeps the sphere reading round */}
        <path
          d={`M ${-r * 0.7} ${r * 0.18} A ${r} ${r} 0 0 0 ${r * 0.7} ${r * 0.18}`}
          fill="none"
          opacity={0.22}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={r * 0.34}
        />
        {/* top highlight — single light source from above */}
        <ellipse
          cx={lightOffset}
          cy={lightOffset}
          fill={colors.white}
          opacity={0.55}
          rx={r * 0.4}
          ry={r * 0.28}
          transform={`rotate(-32 ${lightOffset} ${lightOffset})`}
        />
      </g>
    );
  });

  const ghostNodes = Array.from(
    { length: Math.max(0, slots - filled) },
    (_, i) => {
      const index = filled + i;
      const [gx, gy] = place(seatedCenter(index));

      return (
        <circle
          cx={gx}
          cy={gy}
          fill="none"
          key={`ghost-${index}`}
          opacity={0.5}
          r={r * 0.82}
          stroke={ghostStroke}
          strokeDasharray="5 7"
          strokeWidth={3}
        />
      );
    },
  );

  const [rodStartX, rodStartY] = place(-halfSpan - capOffset);
  const [rodEndX, rodEndY] = place(halfSpan + capOffset);
  const [valueCx, valueCy] = place(halfSpan + capOffset + valueGap, 0);

  return (
    <PlacedGroup {...groupProps} transform={transform} x={x} y={y}>
      {/* the rod the beads are threaded on */}
      <line
        stroke={rodStroke}
        strokeLinecap="round"
        strokeWidth={Math.max(6, r * 0.34)}
        x1={rodStartX}
        x2={rodEndX}
        y1={rodStartY}
        y2={rodEndY}
      />
      {/* end-cap knobs so it reads as a real rod, not a floating line */}
      <circle cx={rodStartX} cy={rodStartY} fill={rodStroke} r={r * 0.32} />
      <circle cx={rodEndX} cy={rodEndY} fill={rodStroke} r={r * 0.32} />
      <g className="ghosts">{ghostNodes}</g>
      <g className="beads">{beadNodes}</g>
      {showValueLabel ? (
        <CountStepIndicator
          progress={1}
          size={Math.max(44, r * 1.9)}
          value={filled}
          x={valueCx}
          y={valueCy}
        />
      ) : null}
    </PlacedGroup>
  );
};
// =========================================================================
// CardinalConsolidation — a many-count-tags → one-cardinal-total diagram.
//
// The cardinality teaching primitive: N per-item count tags (one per counted
// object) consolidate INTO a single cardinal-total glyph that names the WHOLE
// set — "the last number you say is how many there are altogether." The
// per-item tags sit in a row BELOW; N converging guide lines rise to ONE
// total-glyph anchor ABOVE-center. As `progress` runs 0→1 the lines draw on
// (the convergence gesture), the per-item tags recede, and the single total
// resolves (a settle pop) — so the child sees the count WORDS become THE ONE
// NUMBER for the whole group, NOT addition, NOT a part-whole bond.
//
// Distinct from FenHeDiagram: fen-he models whole = part + part (addition /
// 分合式) with one whole on top and two parts below. CardinalConsolidation
// models count-tags → cardinal-total (cardinality): there is NO addition, the
// parts are NOT addends, and the count of per-item tags is the COUNT (N), not
// a 2-part split. Reusing fen-he for cardinality would assert the false
// equation whole = parts summed (e.g. 2 = 1 + 2); this primitive exists to
// NOT do that.
//
// Two modes, mirroring FenHeDiagram so identity is preserved:
//  - `renderNumbers={true}` (default) — primitive renders its own NumberCards
//    at the per-item slots AND the total anchor. Use for self-contained recap
//    / gallery / read cues.
//  - `renderNumbers={false}` — primitive draws ONLY the N converging lines
//    (no numerals). The composer places EXTERNAL NumberCard instances at the
//    anchors returned by `getCardinalConsolidationAnchors(width, count)` and
//    interpolates each per-item tag's x/y TOWARD the total anchor — same React
//    instance travels, no fade-out/fade-in cross-fade (the load-bearing
//    identity-preservation mechanism for the consolidation cue). The total
//    glyph is the per-item tag itself enlarged + repositioned, not fresh ink.
// =========================================================================

export type CardinalConsolidationAnchors = {
  /** Per-item count-tag slot centres, in LOCAL coords, symmetric about x=0,
   *  ordered left→right. Length === `count`. */
  itemAnchors: { x: number; y: number }[];
  /** The cardinal-total-glyph anchor (above-center). */
  total: { x: number; y: number };
};

export type CardinalConsolidationValue = number | string;

/**
 * Returns the per-item tag slot centres and the single total-glyph anchor for
 * a CardinalConsolidation of `width` (outer bbox) and N `count` per-item
 * tags, in the primitive's LOCAL coordinate space (origin at the group's
 * transform). The N item slots form a row below, symmetric about x=0; the
 * total sits above-center. The composer interpolates external migrating
 * NumberCards from their per-item cue-1 positions to the total anchor here —
 * exactly as `getFenHeDiagramAnchors` does for the fen-he migration.
 *
 * `width` is the OUTER bounding box of the diagram — the item NumberCards
 * (sized internally from `width`) sit so the OUTER edges of the row align
 * with ±width/2, so two diagrams placed `width + gap` apart never overlap.
 */
export const getCardinalConsolidationAnchors = (
  width = 220,
  count = 2,
  // Vertical reach of the converging lines as a fraction of `width`. Default
  // 0.62 (the convergence reads as a "comes up to the total" gesture, not a
  // flat fan). A SMALLER ratio makes the diagram vertically SHORTER without
  // changing card size.
  verticalReachRatio = 0.62,
): CardinalConsolidationAnchors => {
  const n = Math.max(1, Math.floor(count));
  const cardWidth = width * 0.34;
  const cardGap = Math.max(cardWidth * 0.55, width * 0.06);
  const rowWidth = n * cardWidth + (n - 1) * cardGap;
  // If the natural row would exceed the outer width, compress the gap so the
  // row's outer edge still lines up with ±width/2 (never overflow the bbox).
  const clampedRowWidth = Math.min(rowWidth, width);
  const clampedGap =
    clampedRowWidth < rowWidth
      ? (clampedRowWidth - n * cardWidth) / Math.max(1, n - 1)
      : cardGap;
  const verticalReach = width * verticalReachRatio;
  const itemY = verticalReach / 2;
  const totalY = -verticalReach / 2;
  const rowLeft = -clampedRowWidth / 2 + cardWidth / 2;
  const itemAnchors = Array.from({ length: n }, (_, i) => ({
    x: rowLeft + i * (cardWidth + clampedGap),
    y: itemY,
  }));
  return { itemAnchors, total: { x: 0, y: totalY } };
};

export type CardinalConsolidationProps = PrimitiveGroupProps &
  PlacementProps & {
    /** Diagram width in local SVG units. Default 220. The vertical reach
     *  scales from this. */
    diagramWidth?: number;
    /** Reduce opacity (per `shared.ts` `stateOpacity`). */
    dimmed?: boolean;
    /** Color of the N converging guide lines. Defaults to textNavy. */
    lineColor?: ThemeColor;
    /** Color of the rendered NumberCard glyphs (passed through to NumberCard's
     *  card surface). Defaults to white. */
    numberColor?: ThemeColor;
    /** 0..1. Drives stroke-on of the N converging lines; recedes the per-item
     *  cards as they consolidate; resolves + settle-pops the total card in
     *  across the second half. */
    progress?: number;
    /** When false, the primitive draws ONLY the N converging lines — the
     *  caller places the per-item NumberCards AND the total NumberCard at
     *  `getCardinalConsolidationAnchors(diagramWidth, itemCount)` so the SAME
     *  card instances travel in (identity preserved, no cross-fade). */
    renderNumbers?: boolean;
    /** Vertical reach of the converging lines as a fraction of `diagramWidth`.
     *  Default 0.62. Must match the ratio passed to
     *  `getCardinalConsolidationAnchors` when the caller places its own cards. */
    verticalReachRatio?: number;
    /** How many per-item count tags (the count of items counted). Default 2. */
    itemCount?: number;
    /** The cardinal total glyph value (the last count word / how-many).
     *  Required when `renderNumbers` is true; ignored when false (caller's
     *  external card carries it). */
    total?: CardinalConsolidationValue;
  };

export const CardinalConsolidation = ({
  diagramWidth = 220,
  dimmed = false,
  itemCount = 2,
  lineColor,
  numberColor,
  progress = 1,
  renderNumbers = true,
  transform,
  total,
  verticalReachRatio = 0.62,
  x = 0,
  y = 0,
  ...groupProps
}: CardinalConsolidationProps) => {
  const reveal = clamp01(progress);
  const stroke = resolveColor(lineColor, colors.textNavy);
  const cardSurface = resolveColor(numberColor, colors.white);
  const anchors = getCardinalConsolidationAnchors(
    diagramWidth,
    itemCount,
    verticalReachRatio,
  );
  const cardSize = diagramWidth * 0.34;
  const cardHeight = cardSize * 1.18;

  // Motion schedule (all derived from `reveal`, never a frame literal):
  //   lines     0.00 → 0.60   draw on  (the convergence gesture)
  //   per-item  0.40 → 0.85   recede as they consolidate into the total
  //   total     0.55 → 1.00   settle-pop in (the cardinality reveal climax)
  const lineReveal = clamp01(reveal / 0.6);
  const itemFade = 1 - clamp01((reveal - 0.4) / 0.45);
  const totalReveal = clamp01((reveal - 0.55) / 0.45);
  // Settle pop: base scale 0.55→1.0 eased by outCubic, plus a tiny anticipation
  // overshoot (sin bulge) across the resolve for a bouncy-feel climax. Every
  // curve is a named EASE — no raw motion literal.
  const easedTotal = EASE.outCubic(totalReveal);
  const totalScale =
    0.55 + 0.45 * easedTotal +
    (totalReveal > 0 && totalReveal < 1 ? 0.06 * Math.sin(totalReveal * Math.PI) : 0);

  const strokeWidth = Math.max(4, diagramWidth * 0.022);
  // Inset each line endpoint by ~half the card's box so it meets the card edge,
  // not the numeral's centre (mirrors FenHeDiagram's inset convention).
  const topInset = cardHeight * 0.42;
  const bottomInset = cardHeight * 0.42;

  const lineSegs = anchors.itemAnchors.map((p) => {
    const dx = anchors.total.x - p.x;
    const dy = anchors.total.y - p.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    return {
      x1: p.x + ux * bottomInset,
      y1: p.y + uy * bottomInset,
      x2: anchors.total.x - ux * topInset,
      y2: anchors.total.y - uy * topInset,
    };
  });

  return (
    <PlacedGroup
      {...groupProps}
      opacity={stateOpacity(undefined, dimmed)}
      transform={transform}
      x={x}
      y={y}
    >
      <g className="lines">
        {lineSegs.map((seg, i) => (
          <line
            key={i}
            pathLength={1}
            stroke={stroke}
            strokeDasharray={1}
            strokeDashoffset={1 - lineReveal}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            x1={seg.x1}
            x2={seg.x2}
            y1={seg.y1}
            y2={seg.y2}
          />
        ))}
      </g>
      {renderNumbers ? (
        <g className="numbers">
          <g className="items" opacity={itemFade}>
            {anchors.itemAnchors.map((p, i) => (
              <NumberCard
                color={cardSurface}
                height={cardHeight}
                key={`item-${i}`}
                value={i + 1}
                width={cardSize}
                x={p.x}
                y={p.y}
              />
            ))}
          </g>
          <g
            className="total"
            opacity={clamp01(totalReveal * 1.6)}
            transform={`scale(${totalScale}) translate(${anchors.total.x / totalScale} ${anchors.total.y / totalScale})`}
          >
            <NumberCard
              color={cardSurface}
              height={cardHeight * 1.15}
              value={total ?? ""}
              width={cardSize * 1.15}
              x={0}
              y={0}
            />
          </g>
        </g>
      ) : null}
    </PlacedGroup>
  );
};
