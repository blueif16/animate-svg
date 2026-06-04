import { AbsoluteFill } from "remotion";
import { OrderedRowSpotlight } from "../motion-primitives";
import { CountableObject } from "../shape-primitives";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// OrderedRowSpotlightDemo — verification scenes for the OrderedRowSpotlight
// special-component. Three compositions are derived off this:
//
//  • OrderedRowSpotlightSplit       — THE HARDEST FRAME. The same 5-item row
//    rendered twice: left half = PartWholeBrace over all 5 with '一共5'
//    (cardinal heap); right half = SAME row with position 5 spotlighted '第5'
//    (ordinal one). Identical digit 5 both ways — verify heap-vs-one reads
//    unmistakably and nothing overlaps.
//  • OrderedRowSpotlightMultiplicity — WORST-CASE MULTIPLICITY. An 8-item row
//    mid count-walk (finger on item 5) with the running tally badge, an ordinal
//    token, and the direction arrow all live at once.
//  • OrderedRowSpotlightFlip         — the relativity / turn-around beat: the
//    SAME row, direction flipped (rtl), so 第2 ↔ 第4 — the spotlight tracks the
//    flip because spotlightOrdinal is a POSITION, not an array index.
//
// Demo scene → explicit value props + Chinese label strings are fine HERE (the
// lesson-agnostic law governs the COMPONENT, not its demo harness; a real
// lesson drives items/direction/ordinal from its own data and atFrame from
// cues[id].startFrame+offset, and localizes 第N via ordinalLabel).
// ---------------------------------------------------------------------------

const CX = video.width / 2;
const CY = video.height / 2;

export const ORDERED_ROW_SPOTLIGHT_DEMO_DURATION = 200;

const ordinal = (pos: number) => `第${pos}`;

// A row of five identical countables (faces) — identity is the array content.
const fiveFaces = (size = 88) =>
  Array.from({ length: 5 }, (_, i) => (
    <CountableObject key={i} size={size} variant="star" />
  ));

const eightFruits = () =>
  Array.from({ length: 8 }, (_, i) => (
    <CountableObject key={i} size={92} variant="banana" />
  ));

// THE HARDEST FRAME — cardinal heap (left) vs ordinal one (right), same digit 5.
export const OrderedRowSpotlightSplit = () => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      {/* Left half — CARDINAL: bracket ALL five as '一共5'. */}
      <OrderedRowSpotlight
        atFrame={0}
        cardinalLabel="一共5"
        direction="ltr"
        itemRadius={48}
        items={fiveFaces(82)}
        rowGap={104}
        showCardinalBracket
        showDirectionArrow={false}
        stepDurationFrames={18}
        x={CX - 312}
        y={CY}
      />
      {/* Right half — ORDINAL: spotlight ONLY position 5 as '第5'. */}
      <OrderedRowSpotlight
        atFrame={0}
        direction="ltr"
        itemRadius={48}
        items={fiveFaces(82)}
        ordinalLabel={ordinal}
        rowGap={104}
        showDirectionArrow={false}
        spotlightOrdinal={5}
        stepDurationFrames={18}
        x={CX + 312}
        y={CY}
      />
    </svg>
  </AbsoluteFill>
);

// WORST-CASE MULTIPLICITY — 8-item row mid count-walk, pointer on item 5,
// tally + ordinal token + direction arrow all live.
export const OrderedRowSpotlightMultiplicity = () => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      <OrderedRowSpotlight
        atFrame={0}
        direction="ltr"
        itemRadius={50}
        items={eightFruits()}
        ordinalLabel={ordinal}
        pointerIndex={4}
        rowGap={140}
        showCardinalBracket={false}
        showDirectionArrow
        spotlightOrdinal={5}
        stepDurationFrames={18}
        x={CX}
        y={CY}
      />
    </svg>
  </AbsoluteFill>
);

// RELATIVITY / TURN-AROUND — same row, direction flipped to rtl; spotlight on
// position 2 now lands on the mirror item (第2 from the right end).
export const OrderedRowSpotlightFlip = () => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      <OrderedRowSpotlight
        atFrame={0}
        direction="rtl"
        itemRadius={56}
        items={fiveFaces()}
        ordinalLabel={ordinal}
        rowGap={150}
        showDirectionArrow
        spotlightOrdinal={2}
        stepDurationFrames={18}
        x={CX}
        y={CY}
      />
    </svg>
  </AbsoluteFill>
);
