import { AbsoluteFill } from "remotion";
import {
  FenHeDiagram,
  LabelCallout,
  NumberCard,
  getFenHeDiagramAnchors,
} from "../../shape-primitives";
import { colors, video } from "../../theme";

// Primitive checks for the FenHeDiagram capability.
//
// Two stills, both rendered at the lesson's real composition resolution
// (1280 × 720 — see `src/theme.ts`):
//
//   1. The single hardest frame — one large 分合式 with all three
//      numerals + both diagonals at the canvas center. Used by the
//      orchestrator to gate Wave 4 on aesthetic quality.
//   2. The worst-case multiplicity — four 分合式 in one row (the
//      climax of `five-3-2-and-4-1`). Verifies the primitive does not
//      collapse to barcode when spaced for in-row reading.
//
// These compositions are still-only (1 frame) and lesson-agnostic in
// the sense that they exercise the primitive's API, not any
// kp1-specific scene logic.

export const PRIMITIVE_CHECK_FEN_HE_DURATION = 1;

const CANVAS_WIDTH = video.width;
const CANVAS_HEIGHT = video.height;

// One large 分合式 centered. Diagram width chosen so the numerals
// hit the visual-design §1 secondary-target of 80 px (NumberCard
// inside FenHeDiagram sizes from diagramWidth * 0.48 → ≈ 110 px card
// edge at this width, glyph ≈ 64 px — keep diagram wide enough that
// the glyph reads at minimum body-label size).
export const PrimitiveCheckKp1FenHeDiagramHardest = () => {
  const diagramWidth = 280;
  const anchors = getFenHeDiagramAnchors(diagramWidth);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        <g transform={`translate(${CANVAS_WIDTH / 2} ${CANVAS_HEIGHT / 2})`}>
          <FenHeDiagram
            diagramWidth={diagramWidth}
            parts={[2, 3]}
            progress={1}
            whole={5}
          />
          {/* Below the diagram: the 分合式 label term, anchored in
              zone-label per the visual-design contract. Included here
              so the still demonstrates the primitive alongside its
              real-world label neighbor. */}
          <LabelCallout
            color={colors.textNavy}
            fontSize={56}
            progress={1}
            text="分合式"
            x={0}
            y={anchors.leftPart.y + 100}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Four 分合式 in a row — the worst-case multiplicity from
// `five-3-2-and-4-1`. Verifies the primitive holds up at the size
// required to fit four side-by-side inside 1280-wide canvas.
//
// Density calculation: four diagrams × 220 width + 3 gaps × 80 = 1120
// px (87% of 1280). Diagrams centered horizontally.
export const PrimitiveCheckKp1FenHeDiagramMultiplicity = () => {
  const diagramWidth = 220;
  const gap = 80;
  const totalWidth = 4 * diagramWidth + 3 * gap;
  const startX = (CANVAS_WIDTH - totalWidth) / 2 + diagramWidth / 2;
  const splits: Array<[number, number]> = [
    [2, 3],
    [1, 4],
    [3, 2],
    [4, 1],
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        {splits.map((parts, index) => {
          const cx = startX + index * (diagramWidth + gap);
          const cy = CANVAS_HEIGHT / 2;
          // First two are "previously seen" (dimmed); last two are
          // freshly arrived (full opacity). Mirrors the contract for
          // the climax frame of `five-3-2-and-4-1`.
          const dimmed = index < 2;

          return (
            <g key={index} transform={`translate(${cx} ${cy})`}>
              <FenHeDiagram
                diagramWidth={diagramWidth}
                dimmed={dimmed}
                parts={parts}
                progress={1}
                whole={5}
              />
            </g>
          );
        })}
        {/* Underline beneath the four diagrams — also part of the
            climax frame (the "this set is now complete" mark from
            visual-design's `five-3-2-and-4-1` contract). */}
        <line
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={5}
          x1={(CANVAS_WIDTH - totalWidth) / 2 - 20}
          x2={(CANVAS_WIDTH - totalWidth) / 2 + totalWidth + 20}
          y1={CANVAS_HEIGHT / 2 + 160}
          y2={CANVAS_HEIGHT / 2 + 160}
        />
      </svg>
    </AbsoluteFill>
  );
};

// Migration-mode still — renderNumbers={false} so the primitive
// shows only its line frame, then the composer places external
// NumberCard children at the exposed anchors. Demonstrates the
// identity-preserved migration API surface.
export const PrimitiveCheckKp1FenHeDiagramMigration = () => {
  const diagramWidth = 280;
  const anchors = getFenHeDiagramAnchors(diagramWidth);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        <g transform={`translate(${CANVAS_WIDTH / 2} ${CANVAS_HEIGHT / 2})`}>
          <FenHeDiagram
            diagramWidth={diagramWidth}
            parts={[2, 3]}
            progress={1}
            renderNumbers={false}
            whole={5}
          />
          {/* External NumberCards placed at the anchors — the same
              positions where renderNumbers=true would draw them. In
              the real `fenheshi-intro` cue these positions are
              interpolated TO from a zone-chips origin; here they sit
              at the final settled position to verify alignment. */}
          <NumberCard
            color={colors.white}
            height={119}
            value={5}
            width={101}
            x={anchors.whole.x}
            y={anchors.whole.y}
          />
          <NumberCard
            color={colors.white}
            height={119}
            value={2}
            width={101}
            x={anchors.leftPart.x}
            y={anchors.leftPart.y}
          />
          <NumberCard
            color={colors.white}
            height={119}
            value={3}
            width={101}
            x={anchors.rightPart.x}
            y={anchors.rightPart.y}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
