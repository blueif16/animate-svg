import type { ReactNode } from "react";
import { EASE } from "../motion-primitives/curves";
import { colors } from "../theme";
import { IconAsset } from "./asset";
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

export type UnmatchedSlotState = "empty" | "ghost";

export type UnmatchedSlotProps = PrimitiveGroupProps &
  PlacementProps & {
    /** Color of the marker stroke. Defaults to softGrayBlue (a quiet
     *  "nobody here" gray) — the surplus item it sits under keeps the
     *  attention; this only names the absence. */
    color?: ThemeColor;
    /** Diameter of the slot in local SVG units. Match the partner item's
     *  visual size so the gap reads as "a missing one of THOSE". Default 92. */
    size?: number;
    /** `"ghost"` (default) — a dashed outline of the missing partner, the
     *  shape that WOULD pair here. `"empty"` — a struck/voided slot reading
     *  "no partner here". */
    state?: UnmatchedSlotState;
    /** 0..1 reveal. Fades and scales the marker in so it can appear in step
     *  with the surplus item being singled out. Default 1 (fully shown). */
    progress?: number;
  };

// =========================================================================
// UnmatchedSlot — the "no partner" mark in a compare-by-matching layout.
//
// In a one-to-one comparison (e.g. 5 > 3), `PairConnector` draws the lines
// between items that DO have a partner. UnmatchedSlot is its counterpart:
// it sits under each SURPLUS item — the ones with nobody across from them —
// so "5 is more than 3" reads concretely as "two of these have no partner."
//
// Lesson-agnostic: it knows nothing about counts or topics; the scene places
// one instance per overhanging item (see getPairedColumnPlacement, which
// returns exactly those overhang column centers).
// =========================================================================
export const UnmatchedSlot = ({
  color,
  progress = 1,
  size = 92,
  state = "ghost",
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: UnmatchedSlotProps) => {
  const reveal = clamp01(progress);
  const radius = size / 2;
  const stroke = resolveColor(color, colors.softGrayBlue);
  // Scale in from 0.86 so the marker "settles" under its surplus item
  // rather than popping at full size.
  const scale = 0.86 + reveal * 0.14;

  return (
    <PlacedGroup
      {...groupProps}
      opacity={reveal}
      transform={[`scale(${scale})`, transform].filter(Boolean).join(" ")}
      x={x}
      y={y}
    >
      {state === "ghost" ? (
        <g className="body">
          <circle
            cx={0}
            cy={0}
            fill="none"
            r={radius}
            stroke={stroke}
            strokeDasharray="12 10"
            strokeLinecap="round"
            strokeWidth={NAVY_STROKE}
          />
          {/* A faint dash where the connector WOULD land, reinforcing that a
              partner is what's missing — not the item itself. */}
          <line
            opacity={0.4}
            stroke={stroke}
            strokeDasharray="6 8"
            strokeLinecap="round"
            strokeWidth={3}
            x1={0}
            x2={0}
            y1={-radius - radius * 0.55}
            y2={-radius}
          />
        </g>
      ) : (
        <g className="body">
          <circle
            cx={0}
            cy={0}
            fill={colors.white}
            r={radius}
            stroke={stroke}
            strokeWidth={NAVY_STROKE}
          />
          {/* Diagonal strike — the universal "void / none here" mark. */}
          <line
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth={NAVY_STROKE}
            x1={-radius * 0.62}
            x2={radius * 0.62}
            y1={radius * 0.62}
            y2={-radius * 0.62}
          />
        </g>
      )}
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
    // The pointing-hand asset's index fingertip points RIGHT by default, so the
    // shared `directionRotation` (right=0, down=90, left=180, up=-90) orients it
    // exactly like the other variants — no per-direction art. The `color`
    // variant reads clearly as a friendly peach pointing hand (coral finger,
    // navy outline) at lesson scale, so it carries the signal on its own.
    // Sized to ~110 local units so the fingertip footprint matches the
    // procedural hand it replaces; the outer scale/nudge still come from
    // `size` + `progress`.
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
        <IconAsset className="body" name="pointing-hand" variant="color" width={110} />
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

export type PairedColumnPlacement = {
  /** Center x of every column, left→right. Length = max(topCount, bottomCount). */
  columnX: number[];
  /** Indices into `columnX` that have an item on ONE row only — the ragged
   *  overhang. Drop an UnmatchedSlot at each. Empty when the rows are equal. */
  overhangColumns: number[];
  /** The longer (overhanging) row: `"top"`, `"bottom"`, or `"none"` if equal. */
  overhangRow: "bottom" | "none" | "top";
  /** Bottom-row item centers, left→right (one per bottom item). */
  bottom: { x: number; y: number }[];
  /** Top-row item centers, left→right (one per top item). */
  top: { x: number; y: number }[];
};

type PairedColumnInput = {
  /** Horizontal spacing between adjacent column centers. Default 130. */
  columnGap?: number;
  /** Vertical gap between the two rows (top sits at -rowGap/2, bottom at
   *  +rowGap/2, so the pair is centered on local y=0). Default 150. */
  rowGap?: number;
};

/**
 * Aligns two rows of countables into shared vertical COLUMNS so partners sit
 * directly above/below each other and the surplus overhangs as a ragged edge —
 * the layout that makes "5 > 3" read as "two of these have no partner."
 *
 * Pure positioning, like `getStickPlacement` / `getFenHeDiagramAnchors`: it
 * RENDERS NOTHING and returns local-space placements the scene composes from.
 * Both rows are LEFT-aligned to column 0, so every overhanging item lands in a
 * column with no partner across from it (the comparison reads as "extra on the
 * end," never "shifted over"). The whole block is centered about local x=0.
 *
 * The scene then:
 *   - places one countable per `top[i]` / `bottom[i]`,
 *   - draws a `PairConnector` between `top[c]` and `bottom[c]` for each matched
 *     column (`c` < min(topCount, bottomCount)),
 *   - drops an `UnmatchedSlot` at each `columnX[c]` for `c` in `overhangColumns`,
 *     on the row OPPOSITE `overhangRow` (the empty side).
 *
 * Lesson-agnostic: counts and spacing come from the caller; no topic, value,
 * or absolute frame is baked in. Deterministic — same inputs, same output.
 */
export const getPairedColumnPlacement = (
  topCount: number,
  bottomCount: number,
  opts: PairedColumnInput = {},
): PairedColumnPlacement => {
  const { columnGap = 130, rowGap = 150 } = opts;
  const safeTop = Math.max(0, Math.floor(topCount));
  const safeBottom = Math.max(0, Math.floor(bottomCount));
  const columns = Math.max(safeTop, safeBottom);
  const matched = Math.min(safeTop, safeBottom);

  // Column centers, left→right, centered about x=0.
  const columnX = Array.from(
    { length: columns },
    (_, index) => (index - (columns - 1) / 2) * columnGap,
  );

  const topY = -rowGap / 2;
  const bottomY = rowGap / 2;
  const top = Array.from({ length: safeTop }, (_, index) => ({
    x: columnX[index],
    y: topY,
  }));
  const bottom = Array.from({ length: safeBottom }, (_, index) => ({
    x: columnX[index],
    y: bottomY,
  }));

  const overhangRow =
    safeTop === safeBottom ? "none" : safeTop > safeBottom ? "top" : "bottom";
  const overhangColumns = Array.from(
    { length: columns - matched },
    (_, index) => matched + index,
  );

  return { bottom, columnX, overhangColumns, overhangRow, top };
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
          style={{ fontVariantNumeric: "tabular-nums" }}
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

export type RecapSpotlightProps = PrimitiveGroupProps & {
  /** One pre-positioned node per recap sub-beat, in the order they were taught.
   *  The caller owns each sub-beat's layout, colors, and content — this only
   *  decides which are visible and which are dimmed. */
  subBeats: ReactNode[];
  /** Index of the ACTIVE sub-beat. Items at this index render in full color;
   *  index < this render dimmed (already seen); index > this are NOT rendered
   *  (not yet shown). */
  currentHighlight: number;
  /** ViewBox coords of the active sub-beat's emphasis ring center. */
  ringCenter: [number, number];
  /** Radius of the transient emphasis ring, in viewBox units. */
  ringRadius: number;
  /** Group opacity applied to previously-shown sub-beats. Default 0.3 — the
   *  items keep their own colors, just quieted. */
  dimOpacity?: number;
  /** 0..1 envelope for the ONE transient ring: it draws/fades IN over the first
   *  half and clears (fades out) over the second half — one moment, one beat,
   *  then gone. The caller derives this from the active cue's frames (e.g.
   *  interpolate(frame, [cue.startFrame, mid, cue.endFrame], [0, 0.5, 1])) —
   *  never a frame literal inside the component. Default 0 (ring hidden). */
  ringProgress?: number;
  /** Stroke color of the transient ring. Defaults to a theme token (reward),
   *  never a hardcoded hex. Accepts a theme key or a raw color string. */
  ringColor?: ThemeColor;
};

// =========================================================================
// RecapSpotlight — a recap stack with ONE live, moving highlight.
//
// A spaced-recall recap walks back through a sequence of sub-beats the lesson
// already taught, keeping each earlier one visible-but-quiet while the spoken
// one lights up. This primitive owns exactly that three-state visibility:
//   • index <  currentHighlight → DIMMED (group-opacity wrap; colors kept)
//   • index == currentHighlight → FULL COLOR (the live one)
//   • index >  currentHighlight → NOT RENDERED (not yet reached)
// plus the recap's single allowed emphasis: one transient dashed ring on the
// active sub-beat's center, which draws in and then clears within one beat
// (driven by `ringProgress`, never a frame).
//
// Lesson-agnostic & prop-driven: the caller renders + positions each sub-beat
// and supplies the active index, ring geometry, and the frame→progress mapping.
// It bakes NO topic, value, or string — any lesson with a "recap stack + a live
// moving highlight + a transient emphasis ring" reuses it as-is.
// =========================================================================
export const RecapSpotlight = ({
  currentHighlight,
  dimOpacity = 0.3,
  ringCenter,
  ringColor,
  ringProgress = 0,
  ringRadius,
  subBeats,
  ...groupProps
}: RecapSpotlightProps) => {
  const active = Math.round(currentHighlight);
  const ringStroke = resolveColor(ringColor, colors.reward);

  // The ring is the recap's ONE emphasis: it draws in over the first half of
  // `ringProgress` (eased entrance), holds at the crest, then clears over the
  // second half — so a single beat lands and releases. Symmetric triangle on a
  // named curve; the caller's 0..1 is the only timing input.
  const env = clamp01(ringProgress);
  const ringReveal =
    env <= 0.5 ? EASE.enter(env / 0.5) : EASE.enter(clamp01((1 - env) / 0.5));
  const [ringX, ringY] = ringCenter;
  const ringCircumference = 2 * Math.PI * ringRadius;

  return (
    <PlacedGroup {...groupProps}>
      {subBeats.map((node, index) => {
        // Not-yet-shown sub-beats are absent, not transparent — the recap only
        // ever reveals up to the live one.
        if (index > active) {
          return null;
        }

        const dimmed = index < active;

        return (
          <g key={index} opacity={dimmed ? clamp01(dimOpacity) : 1}>
            {node}
          </g>
        );
      })}

      {ringReveal > 0 ? (
        <circle
          className="recap-ring"
          cx={ringX}
          cy={ringY}
          fill="none"
          opacity={ringReveal}
          r={ringRadius}
          stroke={ringStroke}
          strokeDasharray={`${ringCircumference * 0.06} ${ringCircumference * 0.05}`}
          strokeLinecap="round"
          strokeWidth={NAVY_STROKE + 1}
        />
      ) : null}
    </PlacedGroup>
  );
};
