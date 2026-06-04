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
  ListenIcon,
  MouthShapeIcon,
  NumberCard,
  NumberLineTrack,
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
  AssetMorph,
  Drag,
  DrawPath,
  FollowPath,
  PopIn,
  PulseCircle,
  SparkleBurst,
  Smear,
} from "../motion-primitives";
import {
  Breathe,
  GlintFlash,
  GlowPulse,
  ShineSweep,
  Sparkle,
} from "../fx";
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
