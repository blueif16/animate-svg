import type { ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PopIn, PulseCircle, SparkleBurst } from "../motion-primitives";
import { SceneFrame } from "../scenes/SceneFrame";
import {
  AnswerTile,
  AnimatedStrokePath,
  ComparisonSymbol,
  CountableObject,
  EquationStrip,
  HanziCard,
  MouthShapeIcon,
  NumberCard,
  NumberLineTrack,
  PairConnector,
  PinyinSyllableCard,
  PointerHandArrow,
  RadicalTile,
  RewardProgressToken,
  SortingBin,
  StrokeGuideCell,
  TenFrameRod,
  ToneMarkGlyph,
  UnitBlock,
} from "../shape-primitives";
import { colors, typography, video } from "../theme";

export const educationSceneDuration = 120;
export const educationShowcaseDuration = educationSceneDuration * 5;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const reveal = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const fade = (frame: number, start: number, duration = 12) =>
  reveal(frame, start, duration);

const panel = ({
  accent,
  children,
  height = 468,
  title,
  width = 344,
  x,
  y,
}: {
  accent: string;
  children: ReactNode;
  height?: number;
  title: string;
  width?: number;
  x: number;
  y: number;
}) => (
  <g>
    <rect
      fill={colors.white}
      height={height}
      rx={24}
      stroke={colors.textNavy}
      strokeWidth={4}
      width={width}
      x={x}
      y={y}
    />
    <rect fill={accent} height={14} rx={7} width={92} x={x + 24} y={y + 24} />
    <text
      fill={colors.textNavy}
      fontFamily={typography.fontFamily}
      fontSize={30}
      fontWeight={900}
      x={x + 24}
      y={y + 72}
    >
      {title}
    </text>
    {children}
  </g>
);

const svgText = ({
  children,
  color = colors.softGrayBlue,
  size = 22,
  weight = 800,
  x,
  y,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  weight?: number;
  x: number;
  y: number;
}) => (
  <text
    fill={color}
    fontFamily={typography.fontFamily}
    fontSize={size}
    fontWeight={weight}
    textAnchor="middle"
    x={x}
    y={y}
  >
    {children}
  </text>
);

export const ShapePrimitiveGallery = () => {
  const frame = useCurrentFrame();
  const connectorProgress = reveal(frame, 28, 28);
  const toneProgress = reveal(frame, 34, 22);

  return (
    <SceneFrame
      accent={colors.mint}
      eyebrow="Shape primitive lesson board"
      title="Shape primitives"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        {panel({
          accent: colors.sunshine,
          title: "Math",
          x: 80,
          y: 176,
          children: (
            <>
              <PopIn delay={8} originX={164} originY={288}>
                <CountableObject
                  selected={frame > 34}
                  size={78}
                  variant="fish"
                  x={164}
                  y={288}
                />
              </PopIn>
              <NumberCard
                color={colors.paleCream}
                focused={frame > 24}
                value={5}
                x={276}
                y={286}
              />
              <ComparisonSymbol
                revealed={frame > 42}
                selected={frame > 42}
                size={64}
                style="mouth"
                symbol=">"
                x={356}
                y={286}
              />
              <UnitBlock
                color={colors.mint}
                count={6}
                size={26}
                variant="cube"
                x={170}
                y={404}
              />
              <EquationStrip
                activeIndex={4}
                left={2}
                operator="+"
                result={5}
                right={3}
                tileWidth={50}
                x={292}
                y={402}
              />
              <NumberLineTrack
                current={5}
                highlights={[2, { color: colors.mint, label: "+3", value: 5 }]}
                jumps={[
                  {
                    color: colors.coral,
                    from: 2,
                    progress: connectorProgress,
                    to: 5,
                  },
                ]}
                max={6}
                min={0}
                width={244}
                x={252}
                y={506}
              />
              <TenFrameRod filled={6} ones={6} size={27} x={252} y={588} />
            </>
          ),
        })}

        {panel({
          accent: colors.coral,
          title: "Chinese",
          x: 468,
          y: 176,
          children: (
            <>
              <HanziCard
                char="日"
                color={colors.paleCream}
                focused={frame > 28}
                height={154}
                picture="sun"
                pinyin="ri"
                width={132}
                word="sun"
                x={560}
                y={300}
              />
              <RadicalTile
                color={colors.white}
                label="radical"
                radical="口"
                selected={frame > 40}
                x={700}
                y={292}
              />
              <PinyinSyllableCard
                color={colors.white}
                final="a"
                height={104}
                highlight={frame > 52 ? "tone" : "final"}
                initial="m"
                tone={3}
                width={216}
                x={640}
                y={422}
              />
              <StrokeGuideCell
                focusZone="center"
                grid="mi"
                height={128}
                width={128}
                x={526}
                y={490}
              />
              <g transform="translate(526 490)">
                <AnimatedStrokePath
                  d="M 28 46 C 56 20 98 25 100 62"
                  durationInFrames={30}
                  progress={reveal(frame, 54, 30)}
                  stroke={colors.coral}
                  strokeWidth={16}
                />
              </g>
              <ToneMarkGlyph
                color={colors.coral}
                progress={toneProgress}
                size={56}
                tone={3}
                x={716}
                y={526}
              />
              <MouthShapeIcon
                color={colors.mint}
                size={64}
                state="round"
                x={716}
                y={590}
              />
            </>
          ),
        })}

        {panel({
          accent: colors.sky,
          title: "Interaction",
          x: 856,
          y: 176,
          children: (
            <>
              <PairConnector
                color={colors.sky}
                progress={connectorProgress}
                snap
                x1={966}
                x2={1060}
                y1={326}
                y2={326}
              />
              <AnswerTile
                color={colors.paleCream}
                selected={frame > 24}
                text="A"
                x={936}
                y={326}
              />
              <SortingBin
                color={colors.mint}
                label="match"
                state={frame > 42 ? "accept" : "idle"}
                variant="tray"
                width={154}
                x={1086}
                y={326}
              />
              <PointerHandArrow
                direction="right"
                progress={reveal(frame, 48, 16)}
                size={78}
                variant="hand"
                x={948}
                y={482}
              />
              <RewardProgressToken
                progress={reveal(frame, 58, 28)}
                size={78}
                variant="badge"
                x={1090}
                y={482}
              />
              <SparkleBurst
                count={8}
                radius={60}
                startFrame={78}
                x={1090}
                y={482}
              />
              {svgText({
                children: "tap, pair, collect",
                x: 1024,
                y: 572,
              })}
            </>
          ),
        })}
      </svg>
    </SceneFrame>
  );
};

const fish = [
  { rotate: -10, x: 230, y: 330 },
  { rotate: 12, x: 370, y: 272 },
  { rotate: -4, x: 506, y: 356 },
  { rotate: 8, x: 650, y: 286 },
  { rotate: -12, x: 790, y: 380 },
  { rotate: 7, x: 910, y: 308 },
];

export const FishCountingLesson = () => {
  const frame = useCurrentFrame();
  const currentCount = clamp(
    fish.filter((_, index) => frame >= 12 + index * 12).length,
    0,
    fish.length,
  );
  const activeIndex = Math.max(0, currentCount - 1);
  const activeFish = fish[activeIndex];
  const pointerProgress = reveal(frame, 8, 14);
  const rewardProgress = currentCount / fish.length;
  const promptOpacity = fade(frame, 84, 12);

  return (
    <SceneFrame
      accent={colors.sky}
      eyebrow="1-6 counting lesson"
      title="数一数小鱼"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <rect
          fill={colors.paleCream}
          height={382}
          rx={34}
          stroke={colors.white}
          strokeWidth={8}
          width={920}
          x={104}
          y={204}
        />
        <path
          d="M 146 520 C 310 592 788 604 992 528"
          fill="none"
          opacity={0.15}
          stroke={colors.textNavy}
          strokeLinecap="round"
          strokeWidth={22}
        />
        {fish.map((item, index) => {
          const start = 12 + index * 12;
          const labelOpacity = fade(frame, start + 7, 9);

          return (
            <g key={index}>
              <PopIn delay={start} originX={item.x} originY={item.y}>
                <CountableObject
                  color={index % 2 === 0 ? colors.sky : colors.mint}
                  selected={index === activeIndex && frame < 86}
                  size={86}
                  transform={`rotate(${item.rotate})`}
                  variant="fish"
                  x={item.x}
                  y={item.y}
                />
              </PopIn>
              <text
                dominantBaseline="middle"
                fill={colors.textNavy}
                fontFamily={typography.fontFamily}
                fontSize={32}
                fontWeight={900}
                opacity={labelOpacity}
                textAnchor="middle"
                x={item.x}
                y={item.y + 78}
              >
                {index + 1}
              </text>
            </g>
          );
        })}
        <PointerHandArrow
          direction="down"
          progress={pointerProgress}
          size={72}
          variant="hand"
          x={activeFish.x}
          y={activeFish.y - 94 + Math.sin(frame / 5) * 5}
        />
        {Array.from({ length: fish.length }, (_, index) => (
          <NumberCard
            color={index < currentCount ? colors.sunshine : colors.white}
            correct={index < currentCount && frame > 86}
            focused={index === activeIndex && frame < 86}
            key={index}
            value={index + 1}
            x={194 + index * 116}
            y={620}
          />
        ))}
        <RewardProgressToken
          collected={currentCount === fish.length && frame > 92}
          label="6条"
          progress={rewardProgress}
          size={94}
          variant="star"
          x={1120}
          y={340}
        />
        <g opacity={promptOpacity}>
          <rect
            fill={colors.white}
            height={82}
            rx={24}
            stroke={colors.textNavy}
            strokeWidth={4}
            width={224}
            x={1008}
            y={486}
          />
          <text
            dominantBaseline="middle"
            fill={colors.textNavy}
            fontFamily={typography.fontFamily}
            fontSize={31}
            fontWeight={900}
            textAnchor="middle"
            x={1120}
            y={528}
          >
            一共 6 条
          </text>
        </g>
        <SparkleBurst count={12} radius={86} startFrame={96} x={1120} y={340} />
      </svg>
    </SceneFrame>
  );
};

const leftCompareObjects = [
  { x: 252, y: 278 },
  { x: 252, y: 410 },
  { x: 384, y: 278 },
  { x: 384, y: 410 },
  { x: 516, y: 344 },
];

const rightCompareObjects = [
  { x: 782, y: 286 },
  { x: 782, y: 418 },
  { x: 914, y: 352 },
];

export const OneToOneCompareLesson = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surplusReveal = fade(frame, 70, 14);
  const symbolEntrance = spring({
    fps,
    frame: frame - 82,
    config: { damping: 13, mass: 0.55, stiffness: 180 },
  });
  const symbolScale = interpolate(symbolEntrance, [0, 1], [0.76, 1]);

  return (
    <SceneFrame
      accent={colors.coral}
      eyebrow="Compare quantities"
      title="一一配对比大小"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <rect
          fill={colors.paleCream}
          height={396}
          rx={34}
          stroke={colors.white}
          strokeWidth={8}
          width={1000}
          x={140}
          y={204}
        />
        <rect
          fill={colors.white}
          height={314}
          rx={30}
          stroke={colors.textNavy}
          strokeWidth={4}
          width={420}
          x={174}
          y={244}
        />
        <rect
          fill={colors.white}
          height={314}
          rx={30}
          stroke={colors.textNavy}
          strokeWidth={4}
          width={320}
          x={728}
          y={244}
        />
        {leftCompareObjects.slice(0, 3).map((left, index) => {
          const right = rightCompareObjects[index];
          return (
            <PairConnector
              color={index % 2 === 0 ? colors.sky : colors.mint}
              key={index}
              progress={reveal(frame, 26 + index * 12, 18)}
              snap
              strokeWidth={6}
              x1={left.x + 52}
              x2={right.x - 52}
              y1={left.y}
              y2={right.y}
            />
          );
        })}
        {leftCompareObjects.map((item, index) => (
          <g key={index}>
            {index > 2 ? (
              <PulseCircle
                color={colors.coral}
                cx={item.x}
                cy={item.y}
                radius={42}
                repeatCount={2}
                startFrame={74}
              />
            ) : null}
            <PopIn delay={8 + index * 5} originX={item.x} originY={item.y}>
              <CountableObject
                color={index > 2 ? colors.coral : colors.sunshine}
                selected={index > 2 && frame > 70}
                size={76}
                variant="star"
                x={item.x}
                y={item.y}
              />
            </PopIn>
          </g>
        ))}
        {rightCompareObjects.map((item, index) => (
          <PopIn
            delay={14 + index * 6}
            key={index}
            originX={item.x}
            originY={item.y}
          >
            <CountableObject
              color={colors.mint}
              size={78}
              variant="block"
              x={item.x}
              y={item.y}
            />
          </PopIn>
        ))}
        <NumberCard color={colors.sunshine} value={5} x={384} y={620} />
        <g
          opacity={frame > 82 ? 1 : 0}
          transform={`translate(640 620) scale(${symbolScale}) translate(-640 -620)`}
        >
          <ComparisonSymbol
            selected
            size={76}
            style="mouth"
            symbol=">"
            x={640}
            y={620}
          />
        </g>
        <NumberCard color={colors.mint} value={3} x={896} y={620} />
        <g opacity={surplusReveal}>
          <rect
            fill={colors.white}
            height={64}
            rx={22}
            stroke={colors.textNavy}
            strokeWidth={4}
            width={248}
            x={516}
            y={302}
          />
          <text
            dominantBaseline="middle"
            fill={colors.textNavy}
            fontFamily={typography.fontFamily}
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            x={640}
            y={335}
          >
            多 2 个
          </text>
        </g>
      </svg>
    </SceneFrame>
  );
};

const toneCards = [
  { final: "a", label: "一声", tone: 1, word: "mā", x: 244 },
  { final: "a", label: "二声", tone: 2, word: "má", x: 440 },
  { final: "a", label: "三声", tone: 3, word: "mǎ", x: 636 },
  { final: "a", label: "四声", tone: 4, word: "mà", x: 832 },
] as const;

export const PinyinToneLesson = () => {
  const frame = useCurrentFrame();
  const activeToneIndex = clamp(Math.floor((frame - 12) / 20), 0, 3);
  const activeTone = toneCards[activeToneIndex];
  const mouthState =
    activeTone.tone === 1
      ? "smile"
      : activeTone.tone === 2
        ? "open"
        : activeTone.tone === 3
          ? "round"
          : "teeth";
  const toneProgress = reveal(frame, 18 + activeToneIndex * 20, 14);

  return (
    <SceneFrame
      accent={colors.sunshine}
      eyebrow="Pinyin tone cards"
      title="拼音四声小卡"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <rect
          fill={colors.paleCream}
          height={370}
          rx={34}
          stroke={colors.white}
          strokeWidth={8}
          width={1010}
          x={92}
          y={214}
        />
        {toneCards.map((card, index) => {
          const selected = index === activeToneIndex;
          const cardReveal = fade(frame, 10 + index * 10, 10);

          return (
            <g key={card.tone} opacity={cardReveal}>
              <PinyinSyllableCard
                color={selected ? colors.paleCream : colors.white}
                final={card.final}
                focused={selected}
                height={122}
                highlight={selected ? "tone" : "none"}
                initial="m"
                selected={selected}
                tone={card.tone}
                width={166}
                x={card.x}
                y={338}
              />
              <AnswerTile
                color={selected ? colors.sunshine : colors.white}
                correct={selected && frame > 76}
                height={72}
                label={card.label}
                text={card.word}
                width={142}
                x={card.x}
                y={480}
              />
            </g>
          );
        })}
        <g>
          <rect
            fill={colors.white}
            height={276}
            rx={28}
            stroke={colors.textNavy}
            strokeWidth={4}
            width={212}
            x={984}
            y={268}
          />
          <ToneMarkGlyph
            color={colors.coral}
            progress={toneProgress}
            size={82}
            tone={activeTone.tone}
            x={1090}
            y={330}
          />
          <MouthShapeIcon
            color={colors.mint}
            size={88}
            state={mouthState}
            x={1090}
            y={430}
          />
          <text
            dominantBaseline="middle"
            fill={colors.textNavy}
            fontFamily={typography.fontFamily}
            fontSize={28}
            fontWeight={900}
            textAnchor="middle"
            x={1090}
            y={512}
          >
            {activeTone.label}
          </text>
        </g>
      </svg>
    </SceneFrame>
  );
};

const hanziChoices = [
  { label: "小鱼", variant: "fish", x: 696, y: 300 },
  { label: "苹果", variant: "fruit", x: 910, y: 300 },
  { label: "星星", variant: "star", x: 804, y: 500 },
] as const;

export const HanziMatchLesson = () => {
  const frame = useCurrentFrame();
  const matchProgress = reveal(frame, 46, 28);
  const matched = frame > 78;

  return (
    <SceneFrame
      accent={colors.mint}
      eyebrow="Hanzi matching"
      title="汉字找朋友"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <rect
          fill={colors.paleCream}
          height={402}
          rx={34}
          stroke={colors.white}
          strokeWidth={8}
          width={1000}
          x={140}
          y={204}
        />
        <HanziCard
          char="鱼"
          color={colors.white}
          focused={frame > 18}
          height={226}
          pinyin="yu"
          selected={matched}
          width={174}
          word="小鱼"
          x={330}
          y={390}
        />
        <PairConnector
          color={colors.sky}
          progress={matchProgress}
          snap
          strokeWidth={7}
          x1={420}
          x2={610}
          y1={382}
          y2={300}
        />
        <PointerHandArrow
          direction="right"
          progress={reveal(frame, 36, 14)}
          size={72}
          variant="arrow"
          x={496}
          y={338}
        />
        {hanziChoices.map((choice, index) => (
          <PopIn
            delay={18 + index * 10}
            key={choice.label}
            originX={choice.x}
            originY={choice.y}
          >
            <AnswerTile
              color={index === 0 ? colors.paleCream : colors.white}
              correct={index === 0 && matched}
              disabled={index !== 0 && matched}
              height={136}
              label={choice.label}
              selected={index === 0 && frame > 44}
              width={164}
              x={choice.x}
              y={choice.y}
            >
              <CountableObject
                color={index === 0 ? colors.sky : undefined}
                size={58}
                variant={choice.variant}
                y={-10}
              />
            </AnswerTile>
          </PopIn>
        ))}
        <g opacity={fade(frame, 84, 12)}>
          <rect
            fill={colors.sunshine}
            height={72}
            rx={24}
            stroke={colors.textNavy}
            strokeWidth={4}
            width={260}
            x={505}
            y={562}
          />
          <text
            dominantBaseline="middle"
            fill={colors.textNavy}
            fontFamily={typography.fontFamily}
            fontSize={30}
            fontWeight={900}
            textAnchor="middle"
            x={635}
            y={599}
          >
            鱼 和 小鱼
          </text>
        </g>
        <SparkleBurst count={10} radius={76} startFrame={82} x={696} y={300} />
      </svg>
    </SceneFrame>
  );
};
