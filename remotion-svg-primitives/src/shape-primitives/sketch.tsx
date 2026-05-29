import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../motion-primitives/curves";
import { colors } from "../theme";
import {
  PlacedGroup,
  clamp01,
  mulberry32,
  resolveColor,
  type PlacementProps,
  type PrimitiveGroupProps,
  type ThemeColor,
} from "./shared";

export type TeacherMarkKind =
  | "underline"
  | "wrap-arc"
  | "label-arrow"
  | "vs-mark";

export type TeacherMarkAnchor =
  | { kind: "point"; x: number; y: number }
  | {
      end: { x: number; y: number };
      kind: "span";
      start: { x: number; y: number };
    };

export type TeacherMarkPathParams = {
  arcPeakOffset?: number;
  archHeight?: number;
  arrowheadSize?: number;
};

export type BoilConfig = {
  // How many frames to hold each jitter sample before resampling.
  // 4 at 30fps ≈ on-2s feel. Lower = jitterier (more frantic).
  holdFrames?: number;
  // Multiplier on the baseline jitter magnitude. 1 = same as today; >1 = more wobble.
  magnitude?: number;
};

// Tiny end-of-draw grow-to-1.0 that reads as a teacher lifting their pen.
// Pairs with the stroke-dashoffset reveal so the mark doesn't end with a CSS
// transition's flat finish. See research/svg-animation-craft-2026-05-26.md.
export type SettleConfig = {
  // Scale rise during the settle window. 0.08 = 92% → 100%.
  // Above ~0.15 reads as a deliberate squash, not a pen settle.
  magnitude?: number;
};

export type TeacherMarkProps = PrimitiveGroupProps &
  PlacementProps & {
    anchor: TeacherMarkAnchor;
    boil?: BoilConfig;
    drawProgress?: number;
    jitterSeed?: number;
    kind: TeacherMarkKind;
    pathParams?: TeacherMarkPathParams;
    settle?: SettleConfig;
    strokeColor?: ThemeColor;
    strokeWidth?: number;
  };

const requireSpan = (
  anchor: TeacherMarkAnchor,
  kind: TeacherMarkKind,
): { end: { x: number; y: number }; start: { x: number; y: number } } => {
  if (anchor.kind !== "span") {
    throw new Error(
      `TeacherMark kind "${kind}" requires a span anchor { start, end }.`,
    );
  }

  return { end: anchor.end, start: anchor.start };
};

const requirePoint = (
  anchor: TeacherMarkAnchor,
  kind: TeacherMarkKind,
): { x: number; y: number } => {
  if (anchor.kind !== "point") {
    throw new Error(
      `TeacherMark kind "${kind}" requires a point anchor { x, y }.`,
    );
  }

  return { x: anchor.x, y: anchor.y };
};

const jitter = (rand: () => number, magnitude: number = 1.5) =>
  (rand() * 2 - 1) * magnitude;

export const TeacherMark = ({
  anchor,
  boil,
  drawProgress = 1,
  jitterSeed = 0,
  kind,
  opacity = 0.92,
  pathParams,
  settle,
  strokeColor,
  strokeWidth = 4,
  transform,
  x = 0,
  y = 0,
  ...groupProps
}: TeacherMarkProps) => {
  const reveal = clamp01(drawProgress);
  const stroke = resolveColor(strokeColor, colors.textNavy);
  const groupOpacity = clamp01(opacity);
  const frame = useCurrentFrame();
  const holdFrames = boil?.holdFrames ?? 4;
  const windowIndex = boil ? Math.floor(frame / holdFrames) : 0;
  const effectiveSeed = (jitterSeed ^ (windowIndex * 0x9e3779b1)) | 0;
  const rand = mulberry32(effectiveSeed);
  const boilMag = boil?.magnitude ?? 1;
  const {
    arcPeakOffset = 35,
    archHeight = 2,
    arrowheadSize = 14,
  } = pathParams ?? {};

  // Pen-settle: tiny grow-to-1.0 across the last 15% of drawProgress. Origin is
  // the mark's centroid so it scales in place. Opt-in via `settle` prop.
  const settleMag = settle?.magnitude ?? 0.08;
  const settleScale = settle
    ? interpolate(reveal, [0.85, 1], [1 - settleMag, 1], {
        easing: EASE.outCubic,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const settleOriginX =
    anchor.kind === "span" ? (anchor.start.x + anchor.end.x) / 2 : anchor.x;
  const settleOriginY =
    anchor.kind === "span" ? (anchor.start.y + anchor.end.y) / 2 : anchor.y;
  const settleTransform = settle
    ? `translate(${settleOriginX} ${settleOriginY}) scale(${settleScale}) translate(${-settleOriginX} ${-settleOriginY})`
    : undefined;
  const wrapSettle = (children: React.ReactNode) =>
    settle ? <g transform={settleTransform}>{children}</g> : children;

  if (kind === "underline") {
    const span = requireSpan(anchor, kind);
    const midY = (span.start.y + span.end.y) / 2 - archHeight;
    const ctrl1X = span.start.x + (span.end.x - span.start.x) * 0.33 + jitter(rand) * boilMag;
    const ctrl1Y = midY + jitter(rand) * boilMag;
    const ctrl2X = span.start.x + (span.end.x - span.start.x) * 0.66 + jitter(rand) * boilMag;
    const ctrl2Y = midY + jitter(rand) * boilMag;
    const d = `M ${span.start.x} ${span.start.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${span.end.x} ${span.end.y}`;

    return (
      <PlacedGroup
        {...groupProps}
        opacity={groupOpacity}
        transform={transform}
        x={x}
        y={y}
      >
        {wrapSettle(
          <path
            d={d}
            fill="none"
            pathLength={1}
            stroke={stroke}
            strokeDasharray={1}
            strokeDashoffset={1 - reveal}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />,
        )}
      </PlacedGroup>
    );
  }

  if (kind === "wrap-arc") {
    const span = requireSpan(anchor, kind);
    const midX = (span.start.x + span.end.x) / 2;
    const peakY = (span.start.y + span.end.y) / 2 - arcPeakOffset;
    const ctrl1X = span.start.x + (midX - span.start.x) * 0.5 + jitter(rand) * boilMag;
    const ctrl1Y = peakY + jitter(rand) * boilMag;
    const ctrl2X = span.end.x - (span.end.x - midX) * 0.5 + jitter(rand) * boilMag;
    const ctrl2Y = peakY + jitter(rand) * boilMag;
    const d = `M ${span.start.x} ${span.start.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${span.end.x} ${span.end.y}`;

    return (
      <PlacedGroup
        {...groupProps}
        opacity={groupOpacity}
        transform={transform}
        x={x}
        y={y}
      >
        {wrapSettle(
          <path
            d={d}
            fill="none"
            pathLength={1}
            stroke={stroke}
            strokeDasharray={1}
            strokeDashoffset={1 - reveal}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
          />,
        )}
      </PlacedGroup>
    );
  }

  if (kind === "label-arrow") {
    const span = requireSpan(anchor, kind);
    const dx = span.end.x - span.start.x;
    const dy = span.end.y - span.start.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const perpX = -dy / length;
    const perpY = dx / length;
    const arc = Math.min(40, length * 0.22);
    const ctrl1X =
      span.start.x + dx * 0.33 + perpX * arc * 0.6 + jitter(rand) * boilMag;
    const ctrl1Y =
      span.start.y + dy * 0.33 + perpY * arc * 0.6 + jitter(rand) * boilMag;
    const ctrl2X =
      span.start.x + dx * 0.66 + perpX * arc + jitter(rand) * boilMag;
    const ctrl2Y =
      span.start.y + dy * 0.66 + perpY * arc + jitter(rand) * boilMag;
    const d = `M ${span.start.x} ${span.start.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${span.end.x} ${span.end.y}`;

    // Arrowhead: tangent at end is (end - ctrl2)
    const tdx = span.end.x - ctrl2X;
    const tdy = span.end.y - ctrl2Y;
    const tLen = Math.max(1, Math.hypot(tdx, tdy));
    const ux = tdx / tLen;
    const uy = tdy / tLen;
    const angle = Math.PI / 6; // 30deg open arrowhead
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const headLeftX =
      span.end.x - arrowheadSize * (ux * cosA + uy * sinA);
    const headLeftY =
      span.end.y - arrowheadSize * (uy * cosA - ux * sinA);
    const headRightX =
      span.end.x - arrowheadSize * (ux * cosA - uy * sinA);
    const headRightY =
      span.end.y - arrowheadSize * (uy * cosA + ux * sinA);
    const headReveal = clamp01((reveal - 0.85) / 0.15);

    return (
      <PlacedGroup
        {...groupProps}
        opacity={groupOpacity}
        transform={transform}
        x={x}
        y={y}
      >
        {wrapSettle(
          <>
            <path
              d={d}
              fill="none"
              pathLength={1}
              stroke={stroke}
              strokeDasharray={1}
              strokeDashoffset={1 - reveal}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
            />
            <g opacity={headReveal}>
              <line
                stroke={stroke}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                x1={span.end.x}
                x2={headLeftX}
                y1={span.end.y}
                y2={headLeftY}
              />
              <line
                stroke={stroke}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
                x1={span.end.x}
                x2={headRightX}
                y1={span.end.y}
                y2={headRightY}
              />
            </g>
          </>,
        )}
      </PlacedGroup>
    );
  }

  // vs-mark
  const point = requirePoint(anchor, kind);
  const armLength = arrowheadSize + 6;
  const tilt = Math.PI / 7;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const strokeAStartX = point.x - armLength * cosT + jitter(rand) * boilMag;
  const strokeAStartY = point.y - armLength * sinT + jitter(rand) * boilMag;
  const strokeAEndX = point.x + armLength * cosT + jitter(rand) * boilMag;
  const strokeAEndY = point.y + armLength * sinT + jitter(rand) * boilMag;
  const strokeBStartX = point.x + armLength * sinT + jitter(rand) * boilMag;
  const strokeBStartY = point.y - armLength * cosT + jitter(rand) * boilMag;
  const strokeBEndX = point.x - armLength * sinT + jitter(rand) * boilMag;
  const strokeBEndY = point.y + armLength * cosT + jitter(rand) * boilMag;
  const firstStrokeReveal = clamp01(reveal * 2);
  const secondStrokeReveal = clamp01(reveal * 2 - 1);

  return (
    <PlacedGroup
      {...groupProps}
      opacity={groupOpacity}
      transform={transform}
      x={x}
      y={y}
    >
      {wrapSettle(
        <>
          <line
            pathLength={1}
            stroke={stroke}
            strokeDasharray={1}
            strokeDashoffset={1 - firstStrokeReveal}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            x1={strokeAStartX}
            x2={strokeAEndX}
            y1={strokeAStartY}
            y2={strokeAEndY}
          />
          <line
            pathLength={1}
            stroke={stroke}
            strokeDasharray={1}
            strokeDashoffset={1 - secondStrokeReveal}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            x1={strokeBStartX}
            x2={strokeBEndX}
            y1={strokeBStartY}
            y2={strokeBEndY}
          />
        </>,
      )}
    </PlacedGroup>
  );
};
