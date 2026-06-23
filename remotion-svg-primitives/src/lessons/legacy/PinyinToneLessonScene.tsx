import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../motion-primitives";
import { SceneFrame } from "../../scenes/SceneFrame";
import {
  AnswerTile,
  MouthShapeIcon,
  PinyinSyllableCard,
  PointerHandArrow,
  ToneMarkGlyph,
  type MouthShapeState,
  type ToneNumber,
} from "../../shape-primitives";
import { colors, typography, video } from "../../theme";
import { pinyinToneLessonAlignedCues } from "./generated/pinyinToneLessonTiming";
import { cueMap } from "../timingTypes";

type PinyinToneCueId =
  | "opening"
  | "first-tone"
  | "second-tone"
  | "third-tone"
  | "fourth-tone"
  | "recap";

type ToneCard = {
  cueId: PinyinToneCueId;
  label: string;
  mouth: MouthShapeState;
  note: string;
  tone: ToneNumber;
  word: string;
  x: number;
};

const toneCards: ToneCard[] = [
  {
    cueId: "first-tone",
    label: "一声",
    mouth: "smile",
    note: "平",
    tone: 1,
    word: "mā",
    x: 236,
  },
  {
    cueId: "second-tone",
    label: "二声",
    mouth: "open",
    note: "扬",
    tone: 2,
    word: "má",
    x: 438,
  },
  {
    cueId: "third-tone",
    label: "三声",
    mouth: "round",
    note: "低起",
    tone: 3,
    word: "mǎ",
    x: 640,
  },
  {
    cueId: "fourth-tone",
    label: "四声",
    mouth: "teeth",
    note: "落",
    tone: 4,
    word: "mà",
    x: 842,
  },
];

const cues = cueMap(pinyinToneLessonAlignedCues);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const reveal = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: EASE.enter,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const cueProgress = (frame: number, id: PinyinToneCueId) => {
  const cue = cues[id];
  return clamp01((frame - cue.startFrame) / Math.max(1, cue.endFrame - cue.startFrame));
};

const activeToneIndex = (frame: number) => {
  let active = 0;
  toneCards.forEach((card, index) => {
    if (frame >= cues[card.cueId].startFrame) {
      active = index;
    }
  });
  return active;
};

const tonePath = (tone: ToneNumber) => {
  if (tone === 1) {
    return "M 0 0 H 138";
  }
  if (tone === 2) {
    return "M 0 54 L 138 0";
  }
  if (tone === 3) {
    return "M 0 12 C 38 74 96 74 138 12";
  }
  return "M 0 0 L 138 54";
};

export const PinyinToneLessonScene = () => {
  const frame = useCurrentFrame();
  const activeIndex = activeToneIndex(frame);
  const activeTone = toneCards[activeIndex];
  const recapProgress = cueProgress(frame, "recap");

  return (
    <SceneFrame
      accent={colors.lavender}
      eyebrow="听声调"
      title="拼音四声"
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <rect
          fill={colors.paleCream}
          height={360}
          rx={34}
          stroke={colors.white}
          strokeWidth={8}
          width={996}
          x={120}
          y={198}
        />

        <g opacity={reveal(frame, cues.opening.startFrame, 18)}>
          <text
            fill={colors.softGrayBlue}
            fontFamily={typography.fontFamily}
            fontSize={28}
            fontWeight={900}
            textAnchor="middle"
            x={620}
            y={244}
          >
            同一个 ma，声调一变，读音就变。
          </text>
        </g>

        {toneCards.map((card, index) => {
          const cue = cues[card.cueId];
          const selected = index === activeIndex && frame >= cue.startFrame;
          const progress = cueProgress(frame, card.cueId);
          const y = selected ? 356 - 12 * reveal(frame, cue.startFrame, 12) : 356;

          return (
            <g key={card.cueId} opacity={reveal(frame, cue.startFrame - 8, 14)}>
              <PinyinSyllableCard
                color={selected ? colors.paleCream : colors.white}
                final="a"
                focused={selected}
                height={126}
                highlight={selected ? "tone" : "none"}
                initial="m"
                selected={selected}
                tone={card.tone}
                width={166}
                x={card.x}
                y={y}
              />
              <AnswerTile
                color={selected ? colors.sunshine : colors.white}
                correct={selected && progress > 0.62}
                height={74}
                label={card.label}
                text={card.word}
                width={144}
                x={card.x}
                y={488}
              />
              <text
                fill={selected ? colors.coral : colors.softGrayBlue}
                fontFamily={typography.fontFamily}
                fontSize={26}
                fontWeight={900}
                textAnchor="middle"
                x={card.x}
                y={586}
              >
                {card.note}
              </text>
            </g>
          );
        })}

        <g opacity={reveal(frame, cues[activeTone.cueId].startFrame, 12)}>
          <rect
            fill={colors.white}
            height={300}
            rx={28}
            stroke={colors.textNavy}
            strokeWidth={4}
            width={220}
            x={982}
            y={250}
          />
          <ToneMarkGlyph
            color={colors.coral}
            progress={cueProgress(frame, activeTone.cueId)}
            size={84}
            tone={activeTone.tone}
            x={1092}
            y={314}
          />
          <MouthShapeIcon
            color={colors.mint}
            size={88}
            state={activeTone.mouth}
            x={1092}
            y={426}
          />
          <text
            fill={colors.textNavy}
            fontFamily={typography.fontFamily}
            fontSize={30}
            fontWeight={900}
            textAnchor="middle"
            x={1092}
            y={512}
          >
            {activeTone.label}
          </text>
        </g>

        <g
          opacity={reveal(frame, cues[activeTone.cueId].startFrame + 8, 10)}
          transform={`translate(${activeTone.x - 70} 266)`}
        >
          <path
            d={tonePath(activeTone.tone)}
            fill="none"
            pathLength={1}
            stroke={colors.sky}
            strokeDasharray={1}
            strokeDashoffset={1 - cueProgress(frame, activeTone.cueId)}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={10}
          />
        </g>

        <PointerHandArrow
          direction="right"
          progress={reveal(frame, cues[activeTone.cueId].startFrame + 6, 12)}
          size={72}
          variant="sparkle"
          x={activeTone.x - 86}
          y={274}
        />

        <g opacity={recapProgress}>
          <rect
            fill={colors.white}
            height={78}
            rx={24}
            stroke={colors.textNavy}
            strokeWidth={4}
            width={470}
            x={384}
            y={256}
          />
          <text
            dominantBaseline="middle"
            fill={colors.coral}
            fontFamily={typography.fontFamily}
            fontSize={34}
            fontWeight={900}
            textAnchor="middle"
            x={619}
            y={296}
          >
            看声调，读准拼音
          </text>
        </g>
      </svg>
    </SceneFrame>
  );
};
