import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  CountableObject,
  LabelCallout,
  NumberCard,
  PairConnector,
  SmallStick,
  UnitBlock,
  type CountableObjectVariant,
  type ThemeColor,
} from "../shape-primitives";
import { colors } from "../theme";
import { EASE } from "./curves";

export type AbstractionStage = "objects" | "sticks" | "dots" | "numeral";

export type AbstractionLadderOrientation = "row" | "column";

const DEFAULT_STAGES: AbstractionStage[] = [
  "objects",
  "sticks",
  "dots",
  "numeral",
];

export type AbstractionLadderProps = {
  /**
   * The ONE quantity conserved across every rung. Drives how many units each
   * non-numeral rung draws and the digit the numeral rung shows. Lesson picks
   * the value — nothing baked. Clamped to >= 1.
   */
  count: number;
  /**
   * The ordered rungs of the ladder, left→right (row) or top→down (column).
   * The caller chooses the subset AND the order — a 6~10 lesson can drop
   * "objects", a recap can show only ["dots", "numeral"]. Defaults to the full
   * 实物 → 小棒 → 圆点 → 数字 ladder.
   */
  stages?: AbstractionStage[];
  /** Object kind for the "objects" rung (geese, chairs, fish…). Default fish. */
  objectVariant?: CountableObjectVariant;
  /**
   * Local (cue-relative) frame. The component derives each rung's own progress
   * from `atFrame` and `perStageDurationFrames` — ZERO frame literals. The
   * composer passes `cues[id].startFrame + offset`; this component never reads a
   * master-timeline literal.
   */
  atFrame: number;
  /**
   * Frames between consecutive rung reveals. Rung k starts revealing at
   * `k * perStageDurationFrames` (local) and is fully settled a beat later;
   * once rung k+1 begins, rung k dims to recede while staying on screen so the
   * conserved quantity reads across the whole ladder. Default 30.
   */
  perStageDurationFrames?: number;
  /**
   * `"row"` (default): rungs spread along X, units stack along Y within a rung,
   * connectors run horizontally between like-index units. `"column"`: rungs
   * spread along Y, units along X, connectors run vertically.
   */
  orientation?: AbstractionLadderOrientation;
  /** Teaching-unit tone for sticks + dots (objects/numeral keep their own). */
  tint?: ThemeColor;
  /**
   * Per-stage optional caption ("N个XX用N表示", "一样多" …). The caller passes
   * the localized node — never baked. Index aligns with the RESOLVED stages
   * array; a sparse array (only some rungs captioned) is fine.
   */
  revealLabel?: Array<ReactNode | undefined>;
  /** Overall placement of the ladder's center in the parent coordinate system. */
  x?: number;
  y?: number;
  /**
   * Long axis the ladder is laid out across (px). Rungs are spaced evenly
   * along it. Default 1180 (row) / 640 (column) — sized for a 1280×720 or
   * 1920×1080 canvas; the caller can shrink it.
   */
  span?: number;
  /** Draw the faint 1:1 conservation connectors between rungs. Default true. */
  connectors?: boolean;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Layout constants (local viewport units). One unit's footprint on the
// cross-axis (the axis units stack along WITHIN a rung) and visual sizes per
// rung, kept consistent so like-index units sit at the same cross-axis offset
// across rungs — that alignment is what lets the 1:1 connectors run straight.
const UNIT_PITCH = 116; // cross-axis spacing between units within a rung
const OBJECT_SIZE = 92; // CountableObject `size`
const STICK_LENGTH = 96; // SmallStick length (laid across cross-axis)
const STICK_THICKNESS = 16;
const DOT_SIZE = 70; // UnitBlock variant="dot" size
const NUMERAL_W = 132;
const NUMERAL_H = 156;

// Per-rung cross-axis offset for unit `index` of `n`, centered on the rung axis.
const crossOffset = (index: number, n: number) =>
  (index - (n - 1) / 2) * UNIT_PITCH;

/**
 * AbstractionLadder — reveals ONE quantity across an ordered list of
 * representation stages (实物 → 小棒 → 圆点 → 数字), the count CONSERVED at every
 * rung, in one continuous left→right (or top→down) reveal. Faint 1:1 connectors
 * tie like-index units between adjacent rungs so the eye tracks the SAME N
 * surviving each step of abstraction; the convergence into the single numeral
 * card is the cardinality payoff ("N个XX, 用 N 表示").
 *
 * Composes registered primitives only — CountableObject / SmallStick /
 * UnitBlock(dot) / NumberCard / PairConnector / LabelCallout — with named
 * `EASE.*` motion. ZERO frame literals (public API takes `atFrame` +
 * `perStageDurationFrames`, the caller offsets from a cue), ZERO raw motion
 * literals (curves come from `EASE`).
 *
 * Lesson-agnostic: any `count`, any subset/order of `stages`, any
 * `objectVariant`, any caption string. A 6~10 lesson, or a "same number across
 * different kinds" beat (label 2 geese AND 2 chairs), reuses it unchanged.
 */
export const AbstractionLadder: React.FC<AbstractionLadderProps> = ({
  count,
  stages = DEFAULT_STAGES,
  objectVariant = "fish",
  atFrame,
  perStageDurationFrames = 30,
  orientation = "row",
  tint,
  revealLabel,
  x = 0,
  y = 0,
  span,
  connectors = true,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(1, Math.round(count));
  const local = frame - atFrame;
  const D = Math.max(1, perStageDurationFrames);
  const rungs = stages.length > 0 ? stages : DEFAULT_STAGES;
  const isRow = orientation === "row";
  const longSpan = span ?? (isRow ? 1180 : 640);
  const stickTone = tint ?? colors.reward;
  const dotTone = tint ?? colors.coral;

  // Each rung sits at an even position along the LONG axis.
  const rungCount = rungs.length;
  const rungPos = (k: number) =>
    rungCount <= 1
      ? 0
      : (k / (rungCount - 1) - 0.5) * longSpan;

  // Per-rung reveal progress (0→1) and a dim factor once the NEXT rung lands.
  const revealOf = (k: number) =>
    interpolate(local, [k * D, k * D + D * 0.7], [0, 1], {
      ...CLAMP,
      easing: EASE.enter,
    });
  // A rung recedes (dims) once its successor has begun settling, but never
  // disappears — the conserved quantity must stay legible across the ladder.
  const dimOf = (k: number) =>
    k >= rungCount - 1
      ? 1
      : interpolate(
          local,
          [(k + 1) * D + D * 0.2, (k + 1) * D + D * 0.7],
          [1, 0.5],
          CLAMP,
        );

  // The center of unit `index` within rung `k`, in local coords. Long-axis from
  // rungPos; cross-axis from crossOffset. The numeral rung is a single card at
  // the rung's center (cross-offset 0).
  const unitCenter = (k: number, index: number, isNumeral: boolean) => {
    const along = rungPos(k);
    const cross = isNumeral ? 0 : crossOffset(index, n);
    return isRow ? { cx: along, cy: cross } : { cx: cross, cy: along };
  };

  const renderRung = (stage: AbstractionStage, k: number) => {
    const reveal = revealOf(k);
    if (reveal <= 0) {
      return null;
    }
    const dim = dimOf(k);
    const opacity = reveal * dim;
    // Settle: anticipation→overshoot→rest scale about the rung center.
    const settle = interpolate(reveal, [0, 0.7, 1], [0.84, 1.05, 1], CLAMP);
    const pos = rungPos(k);
    const groupTransform = isRow
      ? `translate(${pos} 0) scale(${settle}) translate(${-pos} 0)`
      : `translate(0 ${pos}) scale(${settle}) translate(0 ${-pos})`;

    const units = Array.from({ length: n }, (_, index) => {
      const { cx, cy } = unitCenter(k, index, false);
      if (stage === "objects") {
        return (
          <CountableObject
            key={index}
            size={OBJECT_SIZE}
            variant={objectVariant}
            x={cx}
            y={cy}
          />
        );
      }
      if (stage === "sticks") {
        // One stick per unit, 1:1. Rotated 90° so the stick lies ACROSS the
        // cross-axis (a tidy parade), its center on the unit center.
        return (
          <SmallStick
            color={stickTone}
            key={index}
            length={STICK_LENGTH}
            rotation={isRow ? 90 : 0}
            thickness={STICK_THICKNESS}
            x={cx}
            y={cy}
          />
        );
      }
      // dots
      return (
        <UnitBlock
          color={dotTone}
          count={1}
          key={index}
          size={DOT_SIZE}
          variant="dot"
          x={cx}
          y={cy}
        />
      );
    });

    return (
      <g key={`rung-${k}`} opacity={opacity} transform={groupTransform}>
        {stage === "numeral" ? (
          <NumberCard
            height={NUMERAL_H}
            value={n}
            width={NUMERAL_W}
            x={isRow ? pos : 0}
            y={isRow ? 0 : pos}
          />
        ) : (
          units
        )}
      </g>
    );
  };

  // Connectors between adjacent rungs k → k+1, one per unit index. They fade in
  // as the LATER rung settles, tracking the SAME unit across the abstraction
  // step. Into a numeral rung, every unit converges on the single card center —
  // the "all of these are counted by this one numeral" cardinality claim.
  const renderConnectors = () => {
    if (!connectors) {
      return null;
    }
    const lines: ReactNode[] = [];
    for (let k = 0; k < rungCount - 1; k += 1) {
      const fromNumeral = rungs[k] === "numeral";
      const toNumeral = rungs[k + 1] === "numeral";
      // Connector reveal rides the later rung's settle, lagging slightly.
      const cReveal = interpolate(
        local,
        [(k + 1) * D + D * 0.15, (k + 1) * D + D * 0.85],
        [0, 1],
        { ...CLAMP, easing: EASE.outCubic },
      );
      if (cReveal <= 0) {
        continue;
      }
      // The connectors fade when BOTH endpoints have receded.
      const fade = Math.min(dimOf(k), dimOf(k + 1));
      for (let index = 0; index < n; index += 1) {
        const a = unitCenter(k, fromNumeral ? 0 : index, fromNumeral);
        const b = unitCenter(k + 1, toNumeral ? 0 : index, toNumeral);
        lines.push(
          <g key={`c-${k}-${index}`} opacity={0.5 * fade}>
            <PairConnector
              color={colors.softGrayBlue}
              dotted
              progress={cReveal}
              strokeWidth={3}
              x1={a.cx}
              x2={b.cx}
              y1={a.cy}
              y2={b.cy}
            />
          </g>,
        );
      }
    }
    return lines;
  };

  // Per-rung caption, anchored on the FAR cross-axis side of the rung so it
  // never sits inside the units (kids-eye zone discipline). Fades with the rung.
  const renderLabels = () => {
    if (!revealLabel) {
      return null;
    }
    return rungs.map((stage, k) => {
      const node = revealLabel[k];
      if (node === undefined || node === null) {
        return null;
      }
      const reveal = revealOf(k);
      if (reveal <= 0) {
        return null;
      }
      const along = rungPos(k);
      // Push the caption clear of the unit column on the cross-axis so it never
      // sits inside the units (kids-eye zone discipline).
      const isNumeral = stage === "numeral";
      const halfSpan = isNumeral
        ? (isRow ? NUMERAL_H : NUMERAL_W) / 2
        : ((n - 1) / 2) * UNIT_PITCH + UNIT_PITCH * 0.55;
      const lx = isRow ? along : halfSpan + 60;
      const ly = isRow ? halfSpan + 44 : along;
      return (
        <g key={`lbl-${k}`} opacity={reveal * dimOf(k)}>
          <LabelCallout fontSize={34} progress={reveal} text={node} x={lx} y={ly} />
        </g>
      );
    });
  };

  return (
    <g transform={`translate(${x} ${y})`}>
      {renderConnectors()}
      {rungs.map((stage, k) => renderRung(stage, k))}
      {renderLabels()}
    </g>
  );
};
