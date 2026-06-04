import { AbsoluteFill } from "remotion";
import { AbstractionLadder } from "../motion-primitives";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// AbstractionLadderDemo — verification scene for the AbstractionLadder
// special-component. Two compositions are derived off this:
//
//  • AbstractionLadderRow    — orientation="row", count=5, full ladder. The
//    hardest mid-transition frame (objects→sticks→dots partially visible with
//    1:1 connectors live AND the numeral popping) is sampled by rendering at a
//    `perStageDurationFrames`-derived frame.
//  • AbstractionLadderColumn — orientation="column", count=5, full ladder, the
//    densest worst-case multiplicity (all 4 rungs simultaneously on screen).
//
// Demo scene → explicit value props are fine here (the lesson-agnostic law
// governs the component, not its demo harness; a real lesson drives count and
// captions from its own data and atFrame from cues[id].startFrame+offset).
// ---------------------------------------------------------------------------

const CX = video.width / 2;
const CY = video.height / 2;

export const ABSTRACTION_LADDER_DEMO_DURATION = 150;

export const AbstractionLadderRow = () => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      <AbstractionLadder
        atFrame={0}
        count={5}
        objectVariant="fish"
        orientation="row"
        perStageDurationFrames={30}
        revealLabel={["5只鱼", "5根小棒", "5个圆点", "用 5 表示"]}
        span={1060}
        x={CX}
        y={CY}
      />
    </svg>
  </AbsoluteFill>
);

export const AbstractionLadderColumn = () => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      <AbstractionLadder
        atFrame={0}
        count={5}
        objectVariant="fish"
        orientation="column"
        perStageDurationFrames={30}
        span={560}
        x={CX}
        y={CY}
      />
    </svg>
  </AbsoluteFill>
);
