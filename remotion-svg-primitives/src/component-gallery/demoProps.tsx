import type { ReactNode } from "react";
import {
  AnimatedStrokePath,
  AnswerTile,
  BundleWrap,
  ComparisonSymbol,
  ConservationBundle,
  CountStepIndicator,
  CountableObject,
  CountingBeadDevice,
  EquationStrip,
  FenHeDiagram,
  HanziCard,
  IconAsset,
  LabelCallout,
  LessonIntroCard,
  ListenIcon,
  MouthShapeIcon,
  NumberCard,
  NumberLineTrack,
  OrdinalLabelToken,
  PairConnector,
  PartWholeBrace,
  PinyinSyllableCard,
  PitchPlayhead,
  PlaceValueMat,
  PointerHandArrow,
  RadicalTile,
  RegionSplit,
  RewardProgressToken,
  SmallStick,
  SortingBin,
  StepTally,
  StickGroup,
  StrokeGuideCell,
  TeacherMark,
  TenFrameRod,
  ToneMarkGlyph,
  UnitBlock,
  UnmatchedSlot,
} from "../shape-primitives";
import {
  AbstractionLadder,
  AssetMorph,
  ConservationMorphBundle,
  DialogueExchange,
  Drag,
  DrawPath,
  FollowPath,
  GlyphStrokeWriter,
  MatchPairsBoard,
  OrderedRowSpotlight,
  PartWholeComposer,
  PictographEvolution,
  PopIn,
  PulseCircle,
  ReadAlongHighlight,
  SparkleBurst,
  Smear,
  VocabFlashcard,
  glyphStrokesFor,
} from "../motion-primitives";
import {
  Breathe,
  GlintFlash,
  GlowPulse,
  ShineSweep,
  Sparkle,
} from "../fx";
import { fontFamily } from "../shape-primitives/shared";
import { colors } from "../theme";

// =========================================================================
// demoProps — the id → { render } map the registry JSON cannot store.
//
// The registry stores a component's NAME as a string, not the import nor the
// React prop VALUES. This module holds exactly that missing piece: for each
// registry `id`, a `render(sub)` that mounts the component with representative
// props AND a small strip of its KEY variants, so a single still reads
// correctly. `sub` is an optional sub-cell width hint (each variant gets one).
//
// Progress-driven primitives are pinned to a meaningfully-complete state
// (~0.85–1.0) so the still shows them "done"; frame-driven motion/fx read
// `useCurrentFrame()` and are judged at the gallery's chosen still frame.
//
// If a registry id has NO entry here, the gallery renders a red
// "UNMAPPED: <id>" cell — it dogfoods its own completeness.
// =========================================================================

export type GalleryDemo = {
  /** Optional taller cell hint (some primitives are big). */
  tall?: boolean;
  /** Local-space render of the component(s), centered on (0,0) in the cell. */
  render: () => ReactNode;
};

// A small horizontal strip helper: lays out N nodes evenly about x=0 with an
// optional variant caption under each.
const Strip = ({
  gap = 150,
  items,
}: {
  gap?: number;
  items: { caption?: string; node: ReactNode }[];
}) => {
  const n = items.length;
  return (
    <>
      {items.map((item, i) => {
        const cx = (i - (n - 1) / 2) * gap;
        return (
          <g key={i} transform={`translate(${cx} 0)`}>
            {item.node}
            {item.caption ? (
              <text
                dominantBaseline="middle"
                fill={colors.softGrayBlue}
                fontFamily='"Arial Rounded MT Bold", system-ui, sans-serif'
                fontSize={16}
                fontWeight={800}
                textAnchor="middle"
                y={92}
              >
                {item.caption}
              </text>
            ) : null}
          </g>
        );
      })}
    </>
  );
};

export const demoProps: Record<string, GalleryDemo> = {
  // ----------------------------------------------------------------- counting
  "answer-tile": {
    render: () => (
      <Strip
        gap={180}
        items={[
          { caption: "selected", node: <AnswerTile selected text="A" label="apple" /> },
          { caption: "correct", node: <AnswerTile correct number={5} /> },
          { caption: "wrong", node: <AnswerTile wrong text="B" /> },
        ]}
      />
    ),
  },
  "bundle-wrap": {
    render: () => (
      <Strip
        gap={220}
        items={[
          { caption: "rope", node: <BundleWrap style="rope" width={170} wrapProgress={1} /> },
          { caption: "band", node: <BundleWrap style="band" width={170} wrapProgress={1} /> },
          { caption: "ribbon", node: <BundleWrap style="ribbon" width={170} wrapProgress={1} /> },
        ]}
      />
    ),
  },
  "comparison-symbol": {
    render: () => (
      <Strip
        gap={120}
        items={[
          { caption: "<", node: <ComparisonSymbol symbol="<" /> },
          { caption: "=", node: <ComparisonSymbol symbol="=" /> },
          { caption: ">", node: <ComparisonSymbol symbol=">" /> },
          { caption: "mouth >", node: <ComparisonSymbol symbol=">" style="mouth" /> },
          { caption: "? hidden", node: <ComparisonSymbol symbol=">" revealed={false} /> },
        ]}
      />
    ),
  },
  "conservation-bundle": {
    render: () => (
      <Strip
        gap={360}
        items={[
          { caption: "xray 0 (wrapped)", node: <ConservationBundle count={10} xrayProgress={0} stickLength={120} /> },
          { caption: "xray 1 (ten ones)", node: <ConservationBundle count={10} xrayProgress={1} stickLength={120} highlightInside /> },
        ]}
      />
    ),
    tall: true,
  },
  "countable-object": {
    render: () => (
      <Strip
        gap={110}
        items={[
          { caption: "fish", node: <CountableObject variant="fish" /> },
          { caption: "star", node: <CountableObject variant="star" /> },
          { caption: "fruit", node: <CountableObject variant="fruit" /> },
          { caption: "banana", node: <CountableObject variant="banana" /> },
          { caption: "block", node: <CountableObject variant="block" /> },
          { caption: "animal", node: <CountableObject variant="animal" /> },
        ]}
      />
    ),
  },
  "count-step-indicator": {
    render: () => (
      <Strip
        gap={90}
        items={[
          { caption: "p .4", node: <CountStepIndicator value={1} progress={0.4} /> },
          { caption: "p .7", node: <CountStepIndicator value={2} progress={0.7} /> },
          { caption: "p 1", node: <CountStepIndicator value={3} progress={1} /> },
        ]}
      />
    ),
  },
  "counting-bead-device": {
    render: () => (
      <Strip
        gap={520}
        items={[
          {
            caption: "4→5 (newest mid-slide)",
            node: (
              <CountingBeadDevice
                count={5}
                capacity={5}
                activeIndex={4}
                activePulse={0.55}
                revealProgress={0.6}
                rodLength={520}
              />
            ),
          },
          {
            caption: "10 of 10 (full rod)",
            node: (
              <CountingBeadDevice
                count={10}
                capacity={10}
                beadRadius={26}
                rodLength={620}
              />
            ),
          },
        ]}
      />
    ),
    tall: true,
  },
  "equation-strip": {
    render: () => (
      <EquationStrip left={2} operator="+" right={3} result={5} activeIndex={4} blankIndex={4} />
    ),
  },
  "fen-he-diagram": {
    render: () => <FenHeDiagram whole={5} parts={[2, 3]} progress={1} diagramWidth={220} />,
    tall: true,
  },
  "label-callout": {
    render: () => (
      <Strip
        gap={320}
        items={[
          { caption: "fade", node: <LabelCallout text="一共五个" progress={0.9} appearStyle="fade" /> },
          { caption: "write-on + underline", node: <LabelCallout text="比一比" progress={0.9} appearStyle="write-on" underline /> },
        ]}
      />
    ),
  },
  "number-card": {
    render: () => (
      <Strip
        gap={130}
        items={[
          { caption: "value", node: <NumberCard value={7} /> },
          { caption: "selected", node: <NumberCard value={5} selected /> },
          { caption: "correct", node: <NumberCard value={12} correct /> },
          { caption: "blank", node: <NumberCard blank /> },
        ]}
      />
    ),
  },
  "number-line-track": {
    render: () => (
      <NumberLineTrack
        current={5}
        min={0}
        max={6}
        width={520}
        highlights={[2, { color: colors.mint, label: "+3", value: 5 }]}
        jumps={[{ color: colors.coral, from: 2, to: 5, progress: 1 }]}
      />
    ),
  },
  "ordinal-label-token": {
    // The 序数-vs-基数 contrast: a bare '5' NumberCard beside a same-size '第5'
    // OrdinalLabelToken — same digit, only the colored 第 prefix distinguishes
    // the ordinal. Mirrors OrdinalLabelTokenHardest.
    render: () => (
      <Strip
        gap={280}
        items={[
          { caption: "基数 · 5", node: <NumberCard value={5} height={160} width={132} /> },
          { caption: "序数 · 第5", node: <OrdinalLabelToken prefix="第" value={5} height={160} width={210} /> },
        ]}
      />
    ),
    tall: true,
  },
  "part-whole-brace": {
    render: () => (
      <Strip
        gap={210}
        items={[
          { caption: "down", node: <g transform="translate(-90 -20)"><PartWholeBrace direction="down" width={180} label="whole" progress={1} /></g> },
          { caption: "up", node: <g transform="translate(-90 30)"><PartWholeBrace direction="up" width={180} label="whole" progress={1} /></g> },
          { caption: "right", node: <g transform="translate(0 -90)"><PartWholeBrace direction="right" width={150} label="part" progress={1} /></g> },
        ]}
      />
    ),
    tall: true,
  },
  "place-value-mat": {
    render: () => (
      <PlaceValueMat
        columns={["tens", "ones"]}
        columnWidth={150}
        height={170}
        perColumnCount={[1, 4]}
        digits={[1, 4]}
        showDigits
        highlightColumn={0}
      />
    ),
    tall: true,
  },
  "region-split": {
    render: () => (
      <Strip
        gap={250}
        items={[
          { caption: "2 · cut .85", node: <RegionSplit parts={2} cutProgress={0.85} radius={74} /> },
          { caption: "3 · highlight 0", node: <RegionSplit parts={3} highlightPart={0} radius={74} /> },
          { caption: "4 · sep + labels", node: <RegionSplit parts={4} separation={1} showLabels highlightPart={1} radius={74} /> },
        ]}
      />
    ),
    tall: true,
  },
  "small-stick": {
    render: () => (
      <Strip
        gap={90}
        items={[
          { caption: "idle", node: <SmallStick highlight="idle" /> },
          { caption: "active", node: <SmallStick highlight="active" /> },
          { caption: "counted", node: <SmallStick highlight="counted" /> },
          { caption: "rotate 20", node: <SmallStick highlight="idle" rotation={20} /> },
        ]}
      />
    ),
    tall: true,
  },
  "step-tally": {
    render: () => (
      <Strip
        gap={220}
        items={[
          { caption: "numeric", node: <StepTally steps={5} variant="numeric" label="个" progress={1} /> },
          { caption: "dots", node: <StepTally steps={5} variant="dots" progress={1} /> },
        ]}
      />
    ),
  },
  "stick-group": {
    render: () => (
      <Strip
        gap={300}
        items={[
          { caption: "row", node: <g transform="scale(0.42)"><StickGroup count={5} layout="row" activeIndex={2} /></g> },
          { caption: "bundle", node: <g transform="scale(0.42)"><StickGroup count={10} layout="bundle" revealUpTo={10} /></g> },
          { caption: "scatter", node: <g transform="scale(0.42)"><StickGroup count={6} layout="scatter" seed={7} /></g> },
        ]}
      />
    ),
    tall: true,
  },
  "ten-frame-rod": {
    render: () => (
      <Strip
        gap={420}
        items={[
          { caption: "frame · 7", node: <TenFrameRod variant="frame" filled={7} ones={7} size={30} /> },
          { caption: "rod · 10", node: <TenFrameRod variant="rod" filled={10} ones={4} size={28} /> },
        ]}
      />
    ),
  },
  "unit-block": {
    render: () => (
      <Strip
        gap={170}
        items={[
          { caption: "cube", node: <UnitBlock variant="cube" count={4} size={30} value="4" /> },
          { caption: "dot", node: <UnitBlock variant="dot" count={4} size={30} value="4" /> },
          { caption: "chip", node: <UnitBlock variant="chip" count={3} size={30} value="3" /> },
          { caption: "rod", node: <UnitBlock variant="rod" count={5} size={28} value="5" /> },
        ]}
      />
    ),
  },

  // ----------------------------------------------------------------- literacy
  "animated-stroke-path": {
    render: () => (
      <g transform="translate(-90 -90)">
        <AnimatedStrokePath
          d="M 28 46 C 90 8 130 30 152 120"
          progress={0.85}
          cursor
          stroke={colors.coral}
          strokeWidth={22}
        />
      </g>
    ),
    tall: true,
  },
  "hanzi-card": {
    render: () => (
      <Strip
        gap={210}
        items={[
          { caption: "ri 日", node: <HanziCard char="日" pinyin="rì" word="sun" picture="sun" /> },
          { caption: "selected", node: <HanziCard char="月" pinyin="yuè" word="moon" picture="moon" selected /> },
          { caption: "focused", node: <HanziCard char="水" pinyin="shuǐ" word="water" picture="water" focused /> },
        ]}
      />
    ),
    tall: true,
  },
  "lesson-intro-card": {
    render: () => (
      <Strip
        gap={760}
        items={[
          {
            caption: "card off (settled)",
            node: (
              <LessonIntroCard
                section="Unit 1 · Hello!"
                teaser="say hello, say who you are, say goodbye"
                title="Hello & Greetings"
                titleSize={64}
              />
            ),
          },
          {
            caption: "card on",
            node: (
              <LessonIntroCard
                card
                cardWidth={680}
                section="第一单元"
                teaser="把五分开，再合起来"
                title="五的分与合"
                titleSize={64}
              />
            ),
          },
          {
            caption: "title only · p .6",
            node: (
              <LessonIntroCard
                progress={0.6}
                title="Today's Job"
                titleSize={64}
              />
            ),
          },
        ]}
      />
    ),
    tall: true,
  },
  "listen-icon": {
    render: () => (
      <Strip
        gap={130}
        items={[
          { caption: "idle", node: <ListenIcon state="idle" /> },
          { caption: "playing p.5", node: <ListenIcon state="playing" progress={0.5} /> },
        ]}
      />
    ),
  },
  "mouth-shape-icon": {
    render: () => (
      <Strip
        gap={130}
        items={[
          { caption: "open", node: <MouthShapeIcon state="open" /> },
          { caption: "round", node: <MouthShapeIcon state="round" /> },
          { caption: "smile", node: <MouthShapeIcon state="smile" /> },
          { caption: "teeth", node: <MouthShapeIcon state="teeth" /> },
        ]}
      />
    ),
  },
  "pinyin-syllable-card": {
    render: () => (
      <Strip
        gap={260}
        items={[
          { caption: "initial", node: <PinyinSyllableCard initial="m" final="a" tone={3} highlight="initial" /> },
          { caption: "final", node: <PinyinSyllableCard initial="m" final="a" tone={3} highlight="final" /> },
          { caption: "tone", node: <PinyinSyllableCard initial="m" final="a" tone={3} highlight="tone" /> },
        ]}
      />
    ),
  },
  "pitch-playhead": {
    render: () => (
      <Strip
        gap={150}
        items={[
          { caption: "t1", node: <g><ToneMarkGlyph tone={1} size={80} color={colors.softGrayBlue} progress={1} /><PitchPlayhead tone={1} size={80} progress={0.5} showTrail /></g> },
          { caption: "t2", node: <g><ToneMarkGlyph tone={2} size={80} color={colors.softGrayBlue} progress={1} /><PitchPlayhead tone={2} size={80} progress={0.6} showTrail /></g> },
          { caption: "t3", node: <g><ToneMarkGlyph tone={3} size={80} color={colors.softGrayBlue} progress={1} /><PitchPlayhead tone={3} size={80} progress={0.55} showTrail /></g> },
          { caption: "t4", node: <g><ToneMarkGlyph tone={4} size={80} color={colors.softGrayBlue} progress={1} /><PitchPlayhead tone={4} size={80} progress={0.6} showTrail /></g> },
        ]}
      />
    ),
  },
  "radical-tile": {
    render: () => (
      <Strip
        gap={150}
        items={[
          { caption: "label", node: <RadicalTile radical="口" label="mouth" /> },
          { caption: "selected", node: <RadicalTile radical="氵" selected /> },
          { caption: "correct", node: <RadicalTile radical="木" correct /> },
        ]}
      />
    ),
  },
  "stroke-guide-cell": {
    render: () => (
      <Strip
        gap={210}
        items={[
          { caption: "tian", node: <StrokeGuideCell grid="tian" width={160} height={160} /> },
          { caption: "mi · center", node: <StrokeGuideCell grid="mi" focusZone="center" width={160} height={160} /> },
          { caption: "half · top", node: <StrokeGuideCell grid="half" focusZone="top" width={160} height={160} /> },
        ]}
      />
    ),
    tall: true,
  },
  "tone-mark-glyph": {
    render: () => (
      <Strip
        gap={120}
        items={[
          { caption: "t1", node: <ToneMarkGlyph tone={1} size={80} progress={1} /> },
          { caption: "t2", node: <ToneMarkGlyph tone={2} size={80} progress={1} /> },
          { caption: "t3", node: <ToneMarkGlyph tone={3} size={80} progress={1} /> },
          { caption: "t4", node: <ToneMarkGlyph tone={4} size={80} progress={1} /> },
          { caption: "neutral", node: <ToneMarkGlyph tone={0} size={80} progress={1} /> },
        ]}
      />
    ),
  },

  // -------------------------------------------------------------- interaction
  "pair-connector": {
    render: () => (
      <Strip
        gap={300}
        items={[
          { caption: "solid · snap", node: <PairConnector x1={-90} y1={0} x2={90} y2={0} snap progress={1} /> },
          { caption: "dotted · p.6", node: <PairConnector x1={-90} y1={0} x2={90} y2={0} dotted progress={0.6} /> },
        ]}
      />
    ),
  },
  "pointer-hand-arrow": {
    render: () => (
      <Strip
        gap={150}
        items={[
          { caption: "arrow R", node: <PointerHandArrow variant="arrow" direction="right" progress={1} /> },
          { caption: "hand D", node: <PointerHandArrow variant="hand" direction="down" progress={1} /> },
          { caption: "sparkle U", node: <PointerHandArrow variant="sparkle" direction="up" progress={1} /> },
          { caption: "arrow L", node: <PointerHandArrow variant="arrow" direction="left" progress={1} /> },
        ]}
      />
    ),
  },
  "reward-progress-token": {
    render: () => (
      <Strip
        gap={130}
        items={[
          { caption: "star .7", node: <RewardProgressToken variant="star" progress={0.7} /> },
          { caption: "coin .5", node: <RewardProgressToken variant="coin" progress={0.5} /> },
          { caption: "badge OK", node: <RewardProgressToken variant="badge" collected /> },
          { caption: "node .85", node: <RewardProgressToken variant="node" progress={0.85} /> },
        ]}
      />
    ),
  },
  "sorting-bin": {
    render: () => (
      <Strip
        gap={230}
        items={[
          { caption: "basket idle", node: <SortingBin variant="basket" label="fruit" state="idle" /> },
          { caption: "basket accept", node: <SortingBin variant="basket" label="yes" state="accept" /> },
          { caption: "tray reject", node: <SortingBin variant="tray" label="no" state="reject" /> },
        ]}
      />
    ),
    tall: true,
  },
  "unmatched-slot": {
    render: () => (
      <Strip
        gap={170}
        items={[
          { caption: "ghost", node: <UnmatchedSlot state="ghost" progress={1} /> },
          { caption: "empty", node: <UnmatchedSlot state="empty" progress={1} /> },
        ]}
      />
    ),
    tall: true,
  },

  // ------------------------------------------------------------------- sketch
  "teacher-mark": {
    render: () => (
      <Strip
        gap={230}
        items={[
          { caption: "underline", node: <TeacherMark kind="underline" anchor={{ kind: "span", start: { x: -70, y: 0 }, end: { x: 70, y: 0 } }} drawProgress={1} strokeColor={colors.coral} strokeWidth={6} /> },
          { caption: "wrap-arc", node: <TeacherMark kind="wrap-arc" anchor={{ kind: "span", start: { x: -70, y: 20 }, end: { x: 70, y: 20 } }} drawProgress={1} strokeColor={colors.sky} strokeWidth={6} /> },
          { caption: "label-arrow", node: <TeacherMark kind="label-arrow" anchor={{ kind: "span", start: { x: -70, y: -40 }, end: { x: 60, y: 40 } }} drawProgress={1} strokeWidth={5} /> },
          { caption: "vs-mark", node: <TeacherMark kind="vs-mark" anchor={{ kind: "point", x: 0, y: 0 }} drawProgress={1} strokeColor={colors.coral} strokeWidth={6} /> },
        ]}
      />
    ),
  },

  // -------------------------------------------------------------------- asset
  "icon-asset": {
    render: () => (
      <Strip
        gap={210}
        items={[
          {
            caption: "stick-bundle-roped",
            node: <IconAsset name="stick-bundle-roped" variant="color" width={180} />,
          },
          {
            caption: "pointing-hand",
            node: <IconAsset name="pointing-hand" variant="color" width={180} />,
          },
          {
            caption: "mono · navy",
            node: <IconAsset name="pointing-hand" variant="mono" tint="textNavy" width={180} />,
          },
        ]}
      />
    ),
    tall: true,
  },

  // ------------------------------------------------------------------- motion
  "abstraction-ladder": {
    // The 实物→小棒→圆点→数字 ladder for count 5, parked PAST the last rung's
    // settle so all four rungs + the 1:1 conservation connectors read at once
    // (the cardinality payoff). Mirrors AbstractionLadderRow. perStage 30 × 4
    // rungs → fully settled by local ≈ 130 ⇒ atFrame = 22 − 130. Native span is
    // ~1060 wide; scaled to fit the cell.
    render: () => (
      <g transform="translate(0 14) scale(0.52)">
        <AbstractionLadder
          atFrame={22 - 130}
          count={5}
          objectVariant="fish"
          orientation="row"
          perStageDurationFrames={30}
          revealLabel={["5只鱼", "5根小棒", "5个圆点", "用 5 表示"]}
          span={1060}
          x={0}
          y={0}
        />
      </g>
    ),
    tall: true,
  },
  "conservation-morph-bundle": {
    // The "ten ones → one roped ten that still IS ten ones" beat, held AFTER the
    // morph with the conservation peek half-open (peekProgress 0.7) so the roped
    // bundle x-rays to reveal the ten ones still inside. Prop values mirror the
    // TenOnesMakeOneTen lesson. local must be past the morph: atFrame = 22 − 24.
    render: () => (
      <g transform="scale(0.72)">
        <ConservationMorphBundle
          asset={<IconAsset name="stick-bundle-roped" variant="color" width={300} />}
          centerX={0}
          centerY={0}
          count={10}
          from={
            <StickGroup
              bundleGap={18}
              color={colors.reward}
              count={10}
              layout="bundle"
              seed={7}
              stickLength={120}
              stickThickness={18}
            />
          }
          morphAtFrame={22 - 24}
          morphDurationInFrames={12}
          peekColor={colors.coral}
          peekHighlightInside
          peekProgress={0.7}
          peekStickColor={colors.reward}
          peekStickLength={120}
          peekStickThickness={18}
        />
      </g>
    ),
    tall: true,
  },
  drag: {
    // Drag staggers a chain of CountStepIndicators by startFrame. At the still
    // frame the staggered children are at different reveal phases.
    render: () => (
      <g transform="scale(1.2)">
        <Drag staggerFrames={6} delayProp="delay">
          <DraggablePop delay={0} value={1} x={-110} />
          <DraggablePop delay={0} value={2} x={-37} />
          <DraggablePop delay={0} value={3} x={37} />
          <DraggablePop delay={0} value={4} x={110} />
        </Drag>
      </g>
    ),
  },
  "draw-path": {
    render: () => (
      <g transform="translate(-110 -40)">
        <DrawPath
          d="M 0 60 C 60 -30 160 -30 220 60"
          progress={0.7}
          stroke={colors.sky}
          strokeWidth={8}
        />
      </g>
    ),
  },
  "follow-path": {
    render: () => (
      <g transform="translate(-110 -40)">
        <DrawPath
          d="M 0 60 C 60 -30 160 -30 220 60"
          progress={1}
          stroke={colors.softGrayBlue}
          strokeWidth={3}
        />
        <FollowPath
          path={{
            type: "cubic",
            from: { x: 0, y: 60 },
            control1: { x: 60, y: -30 },
            control2: { x: 160, y: -30 },
            to: { x: 220, y: 60 },
          }}
          progress={0.6}
        >
          <CountableObject variant="fish" size={56} />
        </FollowPath>
      </g>
    ),
  },
  "asset-morph": {
    // Frame-driven: atFrame/duration are tuned so the gallery still frame (22)
    // lands MID-SWAP — sticks fading out, the roped-bundle asset arriving, the
    // SparkleBurst masking the seam. See AssetMorphDemo for the full motion.
    render: () => (
      <AssetMorph
        atFrame={28}
        centerX={0}
        centerY={0}
        direction="bundle"
        durationInFrames={12}
        from={
          <StickGroup
            bundleGap={12}
            color={colors.reward}
            count={10}
            layout="bundle"
            seed={7}
            stickLength={84}
            stickThickness={12}
          />
        }
        fxRadius={96}
        to={<IconAsset name="stick-bundle-roped" variant="color" width={150} />}
      />
    ),
    tall: true,
  },
  "pop-in": {
    // PopIn is frame-driven; at the still frame each motion variant sits at a
    // different point on its spring (delays stagger so snap/bouncy/settle differ).
    render: () => (
      <Strip
        gap={170}
        items={[
          { caption: "snap", node: <PopIn motion="snap" delay={6}><NumberCard value={1} /></PopIn> },
          { caption: "bouncy", node: <PopIn motion="bouncy" delay={6}><NumberCard value={2} /></PopIn> },
          { caption: "settle", node: <PopIn motion="settle" delay={6}><NumberCard value={3} /></PopIn> },
        ]}
      />
    ),
  },
  "pulse-circle": {
    render: () => (
      <g>
        <CountableObject variant="star" size={70} />
        <PulseCircle cx={0} cy={0} radius={42} repeatCount={4} startFrame={0} color={colors.coral} />
      </g>
    ),
  },
  smear: {
    // Smear is visible only inside [startFrame, endFrame]; the gallery still
    // frame sits inside this window. A moving object is painted on top.
    render: () => (
      <g>
        <Smear startX={-120} startY={0} endX={120} endY={0} startFrame={0} endFrame={48} color={colors.sky} thickness={40} />
        <g transform="translate(40 0)">
          <CountableObject variant="fish" size={64} />
        </g>
      </g>
    ),
  },
  "sparkle-burst": {
    render: () => (
      <g>
        <CountableObject variant="star" size={64} />
        <SparkleBurst x={0} y={0} count={12} radius={90} startFrame={0} durationInFrames={60} />
      </g>
    ),
  },

  // ----------------------------------------------------------------------- fx
  breathe: {
    render: () => (
      <Breathe originX={0} originY={0} amplitudeScale={0.06}>
        <CountableObject variant="fruit" size={88} />
      </Breathe>
    ),
  },
  "fx-defs": {
    // FXDefs renders invisible filter defs (width/height 0). There is nothing to
    // show — this cell documents that and is the SINGLE root <FXDefs/> already
    // mounted by the gallery. We draw a small placeholder label.
    render: () => (
      <text
        dominantBaseline="middle"
        fill={colors.softGrayBlue}
        fontFamily='"Arial Rounded MT Bold", system-ui, sans-serif'
        fontSize={20}
        fontWeight={800}
        textAnchor="middle"
      >
        (invisible filter defs — mounted once at root)
      </text>
    ),
  },
  "glint-flash": {
    render: () => (
      <g>
        <NumberCard value={5} correct />
        <GlintFlash x={40} y={-40} startFrame={0} durationInFrames={60} size={28} />
      </g>
    ),
  },
  "glow-pulse": {
    render: () => (
      <GlowPulse startFrame={0} durationInFrames={48} pulses={1}>
        <CountableObject variant="star" size={84} />
      </GlowPulse>
    ),
  },
  "shine-sweep": {
    render: () => (
      <g transform="translate(-110 -55)">
        <HanziCard char="光" pinyin="guāng" word="shine" x={110} y={55} />
        <ShineSweep x={26} y={-48} width={168} height={206} startFrame={0} durationInFrames={60} />
      </g>
    ),
    tall: true,
  },
  sparkle: {
    render: () => (
      <g>
        <RewardProgressToken variant="star" collected size={70} />
        <Sparkle x={0} y={0} radius={70} count={9} startFrame={0} />
      </g>
    ),
  },

  // ----------------------------------------------- special components (composites)
  // Each is frame-driven (reads useCurrentFrame() = the gallery still frame, 22).
  // atFrame is chosen so `local = 22 - atFrame` lands on a SETTLED, representative
  // beat for a static QC sheet. Content is centered on origin and scaled down with
  // a wrapping <g transform="scale(...)"> so the native ~1280-wide layout fits a
  // cell. Demo content mirrors each component's Demo scene (the lesson-agnostic law
  // governs the COMPONENT, not this harness, so explicit strings are fine here).
  "dialogue-exchange": {
    // A greeting Q&A, held in turn 1's hold so BOTH bubbles read together (the
    // question + its emphasis-flagged answer). step = 48+6 = 54; local ≈ 90.
    render: () => (
      <g transform="translate(0 24) scale(0.5)">
        <DialogueExchange
          atFrame={22 - 90}
          figureRadius={104}
          left={{ figure: dialogueBoy, nameCard: dialogueName("Tom") }}
          perTurnDurationFrames={48}
          right={{ figure: dialogueRobot, nameCard: dialogueName("Robo") }}
          speakerGap={560}
          turns={[
            { speaker: "left", line: utterance("Hello!") },
            { speaker: "right", line: utterance("Hi! I'm Robo!"), emphasis: true },
          ]}
          x={0}
          y={0}
        />
      </g>
    ),
    tall: true,
  },
  "vocab-flashcard": {
    // A stationery flashcard settled past its reveal: picture + label + phonetic +
    // listen cue + the pronunciation pulse all up. local ≈ 40 (t = 1, faceUp).
    render: () => (
      <g transform="scale(0.82)">
        <VocabFlashcard
          atFrame={22 - 40}
          highlightLabel
          label={utterance("eraser")}
          listenCue
          mode="reveal"
          phonetic={utterance("[ɪˈreɪzə]")}
          picture={<IconAsset name="ruler-set-square" variant="color" width={150} />}
          x={0}
          y={0}
        />
      </g>
    ),
    tall: true,
  },
  "match-pairs-board": {
    // A 连一连 with 3 object↔汉字 pairs, held after all three link + the
    // all-matched celebration. step = 46+8 = 54; 3 pairs done by local 162.
    render: () => (
      <g transform="translate(0 18) scale(0.42)">
        <MatchPairsBoard
          atFrame={22 - 200}
          celebrateLabel={utterance("真棒！")}
          columnGap={600}
          itemGap={180}
          itemRadius={78}
          left={[matchPic("star"), matchPic("leaf-water-drop"), matchPic("owl-reading")]}
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
          x={0}
          y={0}
        />
      </g>
    ),
    tall: true,
  },
  "read-along-highlight": {
    // A 对韵歌 sweep (云对雨 / 雪对风) held mid-sweep so an item glows + swells and
    // the underline cursor sits on it. beats sum 8 × perBeat 22 = 176 total.
    render: () => (
      <g transform="scale(0.74)">
        <ReadAlongHighlight
          atFrame={22 - 96}
          beats={[1, 2, 1, 1, 2, 1]}
          cursor="underline"
          dimPast={false}
          highlightColorAlready={colors.mint}
          itemGap={150}
          lineGap={170}
          lines={[duiyunLine("云对雨"), duiyunLine("雪对风")]}
          perBeatDurationFrames={22}
          x={0}
          y={0}
        />
      </g>
    ),
    tall: true,
  },
  "part-whole-composer": {
    // N=5 分与合 enumerate, held at the LAST settled split (4&1) so all five
    // objects sit in two clean clusters with the synced 分合式 above. step =
    // 24+8 = 32; last step (index 3) settles at local 3*32+24 = 120.
    render: () => (
      <g transform="translate(0 10) scale(0.42)">
        <PartWholeComposer
          atFrame={22 - 120}
          clusterGap={140}
          count={5}
          interStepGapFrames={8}
          itemRadius={48}
          mode="enumerate"
          perStepDurationFrames={24}
          renderItem={renderPartWholeApple}
          showDiagram
          showTally
          x={0}
          y={0}
        />
      </g>
    ),
    tall: true,
  },
  "glyph-stroke-writer": {
    // The 火 glyph written stroke-by-stroke in 田字格, parked AFTER the last
    // stroke finishes so the whole character reads with its 起笔/收笔 dots.
    // Mirrors GlyphStrokeWriterHardest's setup with a clear glyph. 4 strokes ×
    // (26 draw + 8 gap) ⇒ all drawn by local ≈ 135 ⇒ atFrame = 22 − 135. Centered
    // by offsetting the cell by −size/2.
    render: () => {
      const size = 240;
      return (
        <g transform={`translate(${-size / 2} ${-size / 2})`}>
          <GlyphStrokeWriter
            atFrame={22 - 135}
            grid="tian"
            interStrokeGapFrames={8}
            perStrokeDurationFrames={26}
            size={size}
            strokes={glyphStrokesFor("火")?.strokes ?? []}
          />
        </g>
      );
    },
    tall: true,
  },
  "ordered-row-spotlight": {
    // A 5-item ordered row with the cardinal bracket ('一共5') over the whole heap
    // AND the ordinal spotlight ring + '第3' token on position 3 — the
    // cardinal-vs-ordinal contrast in one settled frame. Mirrors the demo's
    // bracket + spotlight props; both reveal off atFrame, so park past their
    // settle: atFrame = 22 − 60. Scaled to fit (the brace + below-row token make
    // it tall).
    render: () => (
      <g transform="translate(0 6) scale(0.6)">
        <OrderedRowSpotlight
          atFrame={22 - 60}
          cardinalLabel="一共5"
          direction="ltr"
          itemRadius={56}
          items={Array.from({ length: 5 }, (_, i) => (
            <CountableObject key={i} size={92} variant="star" />
          ))}
          ordinalLabel={(pos) => `第${pos}`}
          rowGap={150}
          showCardinalBracket
          showDirectionArrow
          spotlightOrdinal={3}
          stepDurationFrames={18}
          x={0}
          y={0}
        />
      </g>
    ),
    tall: true,
  },
  "pictograph-evolution": {
    // 日 字理演变: sun object → ancient 日 → modern 日, held AFTER the last stage
    // settles with the silhouette-overlap payoff (the modern 日 over the ghosted
    // sun). step = 48+16 = 64; last transition done at 128, ghost up by ~169.
    render: () => (
      <g transform="translate(0 -8) scale(0.7)">
        <PictographEvolution
          atFrame={22 - 180}
          centerX={0}
          centerY={0}
          interStageGapFrames={16}
          perStageDurationFrames={48}
          silhouetteOpacity={0.34}
          silhouetteOverlap
          stageLabels={[caption("实物"), caption("古文字"), caption("今字")]}
          stages={[pictographSun(), pictographAncient("ancient-glyph-sun"), pictographHanzi("日")]}
          stageSize={220}
          x={0}
          y={0}
        />
      </g>
    ),
    tall: true,
  },
};

// Drag needs children that accept a numeric `delay` prop and themselves entrance
// on it; a tiny PopIn-wrapped indicator satisfies the chain.
const DraggablePop = ({
  delay,
  value,
  x,
}: {
  delay: number;
  value: number;
  x: number;
}) => (
  <g transform={`translate(${x} 0)`}>
    <PopIn motion="bouncy" delay={delay}>
      <CountStepIndicator value={value} progress={1} size={48} />
    </PopIn>
  </g>
);

// ====================================================================
// Special-component demo helpers — caller scene content mirrored from each
// component's Demo scene. Explicit strings/faces are fine HERE (the
// lesson-agnostic law governs the COMPONENT, not this QC harness).
// ====================================================================

// A localized utterance / label node — a styled <tspan> the caller owns.
const utterance = (text: string): ReactNode => (
  <tspan fontFamily={fontFamily} fontWeight={900}>
    {text}
  </tspan>
);

// A caller-localized caption node (实物 / 古文字 / 今字).
const caption = (text: string): ReactNode => (
  <tspan fontFamily={fontFamily} fontWeight={900}>
    {text}
  </tspan>
);

// ---- DialogueExchange faces + name card (from DialogueExchangeDemo) ----
const dialogueBoy = <IconAsset name="boy-face" variant="color" width={180} />;
const dialogueRobot = (
  <IconAsset name="robot-face-round" variant="color" width={180} />
);
const dialogueName = (text: string): ReactNode => (
  <g>
    <rect
      fill={colors.paleCream}
      height={48}
      rx={24}
      stroke={colors.textNavy}
      strokeWidth={3}
      width={150}
      x={-75}
      y={-24}
    />
    <text
      dominantBaseline="middle"
      fill={colors.textNavy}
      fontFamily={fontFamily}
      fontSize={28}
      fontWeight={900}
      textAnchor="middle"
      x={0}
      y={2}
    >
      {text}
    </text>
  </g>
);

// ---- MatchPairsBoard left-column picture node (from MatchPairsBoardDemo) ----
const matchPic = (name: string): ReactNode => (
  <IconAsset name={name} variant="color" width={132} />
);

// ---- ReadAlongHighlight item glyphs (from ReadAlongHighlightDemo) ----
// fill="currentColor" lets each glyph ride the active/dim highlight tint.
const duiyunGlyph = (text: string, size = 70): ReactNode => (
  <text
    dominantBaseline="central"
    fill="currentColor"
    fontFamily={fontFamily}
    fontSize={size}
    fontWeight={900}
    textAnchor="middle"
    x={0}
    y={0}
  >
    {text}
  </text>
);
const duiyunLine = (s: string): ReactNode[] =>
  s.split("").map((c) => duiyunGlyph(c, 70));

// ---- PartWholeComposer object (from PartWholeComposerDemo) ----
const renderPartWholeApple = (
  _i: number,
  part: "left" | "right" | "whole",
): ReactNode => (
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

// ---- PictographEvolution stages (from PictographEvolutionDemo) ----
const pictographHanzi = (char: string, size = 200): ReactNode => (
  <text
    dominantBaseline="central"
    fill={colors.textNavy}
    fontFamily={fontFamily}
    fontSize={size}
    fontWeight={900}
    textAnchor="middle"
    x={0}
    y={0}
  >
    {char}
  </text>
);
const pictographAncient = (name: string, size = 200): ReactNode => (
  <IconAsset name={name} variant="color" width={size} />
);
const pictographSun = (size = 220): ReactNode => {
  const r = size * 0.32;
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return (
          <line
            key={i}
            stroke={colors.reward}
            strokeLinecap="round"
            strokeWidth={size * 0.05}
            x1={Math.cos(a) * r * 1.18}
            x2={Math.cos(a) * r * 1.5}
            y1={Math.sin(a) * r * 1.18}
            y2={Math.sin(a) * r * 1.5}
          />
        );
      })}
      <circle
        cx={0}
        cy={0}
        fill={colors.sunshine}
        r={r}
        stroke={colors.textNavy}
        strokeWidth={size * 0.04}
      />
    </g>
  );
};
