import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { MatchPairsBoard } from "../motion-primitives";
import { IconAsset, NumberCard } from "../shape-primitives";
import { fontFamily } from "../shape-primitives/shared";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// MatchPairsBoardDemo — verification scenes for the MatchPairsBoard special
// component. Four compositions are derived off this:
//
//  • MatchPairsBoardHardest      — THE HARDEST FRAME. CROSSING pairs (the lines
//    tangle near the center): item 0 → word 2, item 1 → word 0, item 2 → word 1.
//    Held after the last line completes so all three connectors are up, every
//    right endpoint snapped GREEN. Verify the lines stay legible, the green dots
//    are unambiguous, and the crossings never read as one connector.
//  • MatchPairsBoardMultiplicity — WORST-CASE MULTIPLICITY. FIVE pairs, straight
//    1↔1, held at completion with the all-matched celebration up. Verify five
//    rows + five connectors + the reward token below never crowd.
//  • MatchPairsBoardChinese      — CHINESE 连一连 CALLER. Object-picture IconAssets
//    on the left ↔ 汉字 NumberCards on the right. Different props, zero component
//    change.
//  • MatchPairsBoardEnglish      — ENGLISH word↔picture CALLER + QUIZ MODE. The
//    SAME component, English word cards ↔ object pictures, with one pair carrying
//    a wrongRight so the quiz self-correction (red snap → retract) is exercised.
//
// Demo scene → explicit value props + English/Chinese strings are fine HERE
// (the lesson-agnostic law governs the COMPONENT, not its demo harness; a real
// lesson passes localized column nodes from its own data and atFrame from
// cues[id].startFrame+offset).
// ---------------------------------------------------------------------------

const CX = video.width / 2;
const CY = video.height / 2;

export const MATCH_PAIRS_BOARD_DEMO_DURATION = 320;

const Stage: React.FC<{ children: ReactNode }> = ({ children }) => (
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

// A caller picture node — an object icon sized to the column's item radius.
const pic = (name: string) => <IconAsset name={name} variant="color" width={132} />;

// A caller word-card node (English) — a rounded card holding a word string. The
// caller owns the surface + string; the component only places it.
const wordCard = (text: string): ReactNode => (
  <g>
    <rect
      fill={colors.white}
      height={104}
      rx={26}
      stroke={colors.textNavy}
      strokeWidth={4}
      width={224}
      x={-112}
      y={-52}
    />
    <text
      dominantBaseline="middle"
      fill={colors.textNavy}
      fontFamily={fontFamily}
      fontSize={40}
      fontWeight={900}
      textAnchor="middle"
      x={0}
      y={3}
    >
      {text}
    </text>
  </g>
);

// THE HARDEST FRAME — three CROSSING pairs, held after the last completes so all
// three green-snapped connectors tangle near the center.
export const MatchPairsBoardHardest = () => (
  <Stage>
    <MatchPairsBoard
      atFrame={-150}
      celebrateOnComplete={false}
      columnGap={620}
      itemGap={190}
      itemRadius={78}
      left={[pic("owl-reading"), pic("sprout"), pic("star")]}
      pairs={[
        { left: 0, right: 2 },
        { left: 1, right: 0 },
        { left: 2, right: 1 },
      ]}
      perPairDurationFrames={46}
      right={[
        <NumberCard key="a" value="A" width={132} />,
        <NumberCard key="b" value="B" width={132} />,
        <NumberCard key="c" value="C" width={132} />,
      ]}
      showPointer
      x={CX}
      y={CY}
    />
  </Stage>
);

// WORST-CASE MULTIPLICITY — FIVE straight pairs, held at completion with the
// all-matched celebration up.
export const MatchPairsBoardMultiplicity = () => (
  <Stage>
    <MatchPairsBoard
      atFrame={-280}
      celebrateLabel={
        <tspan fontFamily={fontFamily} fontWeight={900}>
          Great!
        </tspan>
      }
      columnGap={560}
      itemGap={118}
      itemRadius={54}
      left={[
        pic("owl-reading"),
        pic("sprout"),
        pic("star"),
        pic("house"),
        pic("leaf-water-drop"),
      ]}
      pairs={[
        { left: 0, right: 0 },
        { left: 1, right: 1 },
        { left: 2, right: 2 },
        { left: 3, right: 3 },
        { left: 4, right: 4 },
      ]}
      perPairDurationFrames={42}
      right={[
        <NumberCard key="1" value={1} width={92} />,
        <NumberCard key="2" value={2} width={92} />,
        <NumberCard key="3" value={3} width={92} />,
        <NumberCard key="4" value={4} width={92} />,
        <NumberCard key="5" value={5} width={92} />,
      ]}
      x={CX}
      y={CY - 90}
    />
  </Stage>
);

// CHINESE 连一连 CALLER — object pictures ↔ 汉字 cards. Held at completion with the
// celebration up. Different props, zero component change.
export const MatchPairsBoardChinese = () => (
  <Stage>
    <MatchPairsBoard
      atFrame={-200}
      celebrateLabel={
        <tspan fontFamily={fontFamily} fontWeight={900}>
          真棒！
        </tspan>
      }
      columnGap={600}
      itemGap={180}
      itemRadius={78}
      left={[pic("star"), pic("leaf-water-drop"), pic("owl-reading")]}
      pairs={[
        { left: 0, right: 1 },
        { left: 1, right: 2 },
        { left: 2, right: 0 },
      ]}
      perPairDurationFrames={46}
      right={[
        <NumberCard key="niao" value="鸟" width={128} />,
        <NumberCard key="xing" value="星" width={128} />,
        <NumberCard key="ye" value="叶" width={128} />,
      ]}
      x={CX}
      y={CY - 70}
    />
  </Stage>
);

// ENGLISH word↔picture CALLER + QUIZ MODE — word cards on the LEFT, object
// pictures on the RIGHT, with one pair carrying a wrongRight so the quiz
// self-correction (grow to wrong → red snap → retract → draw correct) runs.
// Held mid-run during the wrong attempt of pair 1.
export const MatchPairsBoardEnglish = () => (
  <Stage>
    <MatchPairsBoard
      atFrame={-62}
      celebrateOnComplete={false}
      columnGap={640}
      connectorStyle="dotted"
      itemGap={186}
      itemRadius={80}
      left={[wordCard("owl"), wordCard("star"), wordCard("leaf")]}
      mode="quiz"
      pairs={[
        { left: 0, right: 0 },
        { left: 1, right: 1, wrongRight: 2 },
        { left: 2, right: 2 },
      ]}
      perPairDurationFrames={48}
      right={[pic("owl-reading"), pic("star"), pic("leaf-water-drop")]}
      x={CX}
      y={CY}
    />
  </Stage>
);
