import { AbsoluteFill } from "remotion";
import { PartWholeComposer } from "../motion-primitives";
import { CountableObject } from "../shape-primitives";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// PartWholeComposerDemo — verification scenes for the PartWholeComposer special
// component. Four compositions are derived off this:
//
//  • PartWholeComposerHardest      — THE HARDEST FRAME. N=5 enumerate, held mid
//    walk on the 2&3 step with the migrating item IN FLIGHT and the FenHeDiagram
//    showing 5 over 2 & 3. Verify the in-flight object reads cleanly between the
//    two clusters and the diagram numbers are synced.
//  • PartWholeComposerMultiplicity — WORST-CASE MULTIPLICITY. N=5 enumerate held
//    at a SETTLED split (4&1) so all five objects + the two clusters are
//    readable at once; eyeball that the walk 1&4 → 2&3 → 3&2 → 4&1 reads 不重不漏
//    and swapped pairs (2&3 vs 3&2) land as DISTINCT clusters.
//  • PartWholeComposerMerge        — the addition 合并 beat: two groups (3 + 2)
//    slide TOGETHER into one whole of 5, the diagram cueing the total.
//  • PartWholeComposerSplit        — the 分 beat: one whole of 5 SEPARATES into
//    2 + 3 clusters moving apart.
//
// Demo scene → explicit N + colors are fine HERE (the lesson-agnostic law
// governs the COMPONENT, not its demo harness; a real lesson passes its own
// object kind + colors + atFrame from cues[id].startFrame+offset).
// ---------------------------------------------------------------------------

const CX = video.width / 2;
const CY = video.height / 2;

export const PART_WHOLE_COMPOSER_DEMO_DURATION = 240;

// The caller owns the object KIND and the two-color split: a CountableObject
// whose color comes from which part it currently belongs to.
const renderApple = (_i: number, part: "left" | "right" | "whole") => (
  <CountableObject
    color={
      part === "left"
        ? colors.coral
        : part === "right"
          ? colors.sky
          : colors.sunshine
    }
    size={84}
    variant="fruit"
  />
);

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      {children}
    </svg>
  </AbsoluteFill>
);

// Step stride for the enumerate demo: perStep 24 + gap 8 = 32 frames/step.
// Step index 1 is the 2&3 decomposition. To freeze the migrating item IN FLIGHT
// at moveP≈0.5, the held frame (frame 0, since Remotion stills sample frame 0 of
// the composition unless offset) must land at local = 1*32 + 12 = 44. So
// atFrame = -44 puts local=44 at the rendered frame.
export const PartWholeComposerHardest = () => (
  <Stage>
    <PartWholeComposer
      atFrame={-44}
      clusterGap={140}
      count={5}
      interStepGapFrames={8}
      itemRadius={48}
      mode="enumerate"
      perStepDurationFrames={24}
      renderItem={renderApple}
      showDiagram
      showTally
      x={CX}
      y={CY + 30}
    />
  </Stage>
);

// WORST-CASE MULTIPLICITY — N=5 enumerate held at the LAST step (4&1) fully
// settled, so all five objects sit in two clean clusters and the walk's
// 不重不漏 coverage is checkable. local = 3*32 + 24 = 120 → atFrame = -120.
export const PartWholeComposerMultiplicity = () => (
  <Stage>
    <PartWholeComposer
      atFrame={-120}
      clusterGap={140}
      count={5}
      interStepGapFrames={8}
      itemRadius={48}
      mode="enumerate"
      perStepDurationFrames={24}
      renderItem={renderApple}
      showDiagram
      showTally
      x={CX}
      y={CY + 30}
    />
  </Stage>
);

// MERGE — the addition 合并 beat. Two groups (3 + 2) slide together into one
// whole of 5. Held near the end of the join (local = 20 of a 24-frame move).
export const PartWholeComposerMerge = () => (
  <Stage>
    <PartWholeComposer
      atFrame={-20}
      clusterGap={160}
      count={5}
      itemRadius={52}
      mode="merge"
      partition={{ left: 3 }}
      perStepDurationFrames={24}
      renderItem={renderApple}
      showBrace
      showDiagram
      wholeLabel="5"
      x={CX}
      y={CY + 30}
    />
  </Stage>
);

// SPLIT — the 分 beat. One whole of 5 separates into 2 + 3 clusters moving
// apart. Held near the end of the separation (local = 20 of a 24-frame move).
export const PartWholeComposerSplit = () => (
  <Stage>
    <PartWholeComposer
      atFrame={-20}
      clusterGap={160}
      count={5}
      itemRadius={52}
      mode="split"
      partition={{ left: 2 }}
      perStepDurationFrames={24}
      renderItem={renderApple}
      showBrace
      showDiagram
      wholeLabel="5"
      x={CX}
      y={CY + 30}
    />
  </Stage>
);
