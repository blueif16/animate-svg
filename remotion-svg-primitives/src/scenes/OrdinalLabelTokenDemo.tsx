import { AbsoluteFill } from "remotion";
import {
  CountableObject,
  NumberCard,
  OrdinalLabelToken,
} from "../shape-primitives";
import { colors, typography, video } from "../theme";

// ---------------------------------------------------------------------------
// OrdinalLabelTokenDemo — verification scenes for the OrdinalLabelToken
// primitive. Two compositions are derived off this:
//
//  • OrdinalLabelTokenHardest      — THE HARDEST FRAME. A 第5 token beside a
//    bare '5' NumberCard at the SAME size. Verify the 第 reads as emphasized
//    (heavier + colored) and the DIGIT matches the cardinal card so
//    'same number, only 第 differs' is unmistakable.
//  • OrdinalLabelTokenMultiplicity — WORST-CASE MULTIPLICITY. A row of 第1..第5
//    tokens above a queue of items at render size — verify every token reads
//    cleanly with no crowding and the prefix stays distinct across the row.
//
// Demo scene → explicit value props + Chinese prefix strings are fine HERE (the
// lesson-agnostic law governs the COMPONENT, not its demo harness; a real
// lesson passes value/prefix from its own data and entrance via the caller's
// PopIn at cues[id].startFrame+offset).
// ---------------------------------------------------------------------------

const CX = video.width / 2;
const CY = video.height / 2;

export const ORDINAL_LABEL_TOKEN_DEMO_DURATION = 120;

const caption = (text: string, x: number, y: number) => (
  <text
    fill={colors.softGrayBlue}
    fontFamily={typography.fontFamily}
    fontSize={30}
    fontWeight={700}
    textAnchor="middle"
    x={x}
    y={y}
  >
    {text}
  </text>
);

// THE HARDEST FRAME — 第5 token vs a bare '5' NumberCard, same size.
export const OrdinalLabelTokenHardest = () => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      {/* CARDINAL — a bare digit on a plain NumberCard. */}
      <NumberCard height={160} value={5} width={132} x={CX - 200} y={CY} />
      {caption("基数 · 5", CX - 200, CY + 132)}

      {/* ORDINAL — same height/digit, but the 第 prefix is colored + heavy. */}
      <OrdinalLabelToken
        height={160}
        prefix="第"
        value={5}
        width={210}
        x={CX + 200}
        y={CY}
      />
      {caption("序数 · 第5", CX + 200, CY + 132)}

      {caption(
        "同一个 5 — 只有「第」区分位置与总数",
        CX,
        CY - 150,
      )}
    </svg>
  </AbsoluteFill>
);

// WORST-CASE MULTIPLICITY — a row of 第1..第5 tokens above a queue.
export const OrdinalLabelTokenMultiplicity = () => {
  const n = 5;
  const gap = 220;
  const rowWidth = (n - 1) * gap;
  const startX = CX - rowWidth / 2;
  const queueGap = 180;
  const queueWidth = (n - 1) * queueGap;
  const queueStartX = CX - queueWidth / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        {/* Position labels — 第1..第5 across the row. */}
        {Array.from({ length: n }, (_, i) => (
          <OrdinalLabelToken
            key={`tok-${i}`}
            height={120}
            prefix="第"
            value={i + 1}
            width={172}
            x={startX + i * gap}
            y={CY - 110}
          />
        ))}

        {/* The queue the labels mark — identical members, distinguished only by
            their POSITION label above. */}
        {Array.from({ length: n }, (_, i) => (
          <g key={`q-${i}`} transform={`translate(${queueStartX + i * queueGap} ${CY + 90})`}>
            <CountableObject size={104} variant="animal" />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
