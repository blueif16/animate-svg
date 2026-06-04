import { AbsoluteFill } from "remotion";
import { VocabFlashcard } from "../motion-primitives";
import { IconAsset } from "../shape-primitives";
import { fontFamily } from "../shape-primitives/shared";
import { FXDefs } from "../fx/FXDefs";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// VocabFlashcardDemo — verification scenes for the VocabFlashcard special
// component. Four compositions are derived off this:
//
//  • VocabFlashcardHardest      — THE HARDEST SINGLE CARD. One card with the
//    PICTURE + LABEL + PHONETIC + LISTEN CUE + HIGHLIGHT pulse all present at
//    once (the multi-syllable "say this tricky word" beat). Verify the picture,
//    the word, the pinyin, the speaker affordance, and the pulse ring never
//    overlap and the card reads clean.
//  • VocabFlashcardFlip         — A FLIP MID-ROTATION. Held at a frame where the
//    card is partway through its Y-axis turn (a narrow sliver), proving the
//    flip choreography (picture face → word face) is legible through the turn.
//  • VocabFlashcardMultiplicity — WORST-CASE MULTIPLICITY. A row of 4 cards
//    revealing in a stagger (a vocab SET — the caller maps several cards), held
//    mid-stagger so cards are at different reveal phases.
//  • VocabFlashcardChinese      — CROSS-SUBJECT PROOF. The SAME component with
//    Chinese 图文对照 props: an IconAsset object illustration + a hanzi label +
//    pinyin. Nothing about the component changes — only props.
//
// Demo scene → explicit value props + English/Chinese strings are fine HERE
// (the lesson-agnostic law governs the COMPONENT, not its demo harness; a real
// lesson passes localized label/phonetic nodes + a picture from its own data
// and atFrame from cues[id].startFrame+offset).
// ---------------------------------------------------------------------------

const CX = video.width / 2;
const CY = video.height / 2;

export const VOCAB_FLASHCARD_DEMO_DURATION = 90;

// A localized label / phonetic node — the caller owns the string + styling.
const word = (text: string) => (
  <tspan fontFamily={fontFamily} fontWeight={900}>
    {text}
  </tspan>
);

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      <FXDefs />
      {children}
    </svg>
  </AbsoluteFill>
);

// THE HARDEST SINGLE CARD — picture + label + phonetic + listen cue + highlight
// pulse all live. Held past the reveal so the face is settled and the ring fires.
export const VocabFlashcardHardest = () => (
  <Stage>
    <VocabFlashcard
      atFrame={-40}
      highlightLabel
      label={word("eraser")}
      listenCue
      mode="reveal"
      phonetic={word("[ɪˈreɪzə]")}
      picture={<IconAsset name="ruler-set-square" variant="color" width={150} />}
      x={CX}
      y={CY}
    />
  </Stage>
);

// A FLIP MID-ROTATION — held where the card is partway through its Y-axis turn.
// revealDurationFrames=48, atFrame chosen so the held frame lands ~75% through
// the reveal (flip rotation runs over the back 70%), i.e. mid-turn sliver.
export const VocabFlashcardFlip = () => (
  <Stage>
    <VocabFlashcard
      atFrame={-34}
      label={word("pencil")}
      mode="flip"
      phonetic={word("[ˈpensl]")}
      picture={<IconAsset name="ruler-set-square" variant="color" width={150} />}
      revealDurationFrames={48}
      x={CX}
      y={CY}
    />
  </Stage>
);

// WORST-CASE MULTIPLICITY — a row of 4 cards (a stationery vocab SET) revealing
// in a stagger. Each card's atFrame is offset so they pop in sequence; held
// mid-stagger so the cards sit at different reveal phases.
const SET = [
  { label: "pen", phon: "[pen]", icon: "ruler-set-square" },
  { label: "ruler", phon: "[ˈruːlə]", icon: "ruler-set-square" },
  { label: "book", phon: "[bʊk]", icon: "open-book" },
  { label: "bag", phon: "[bæɡ]", icon: "treasure-chest" },
] as const;

export const VocabFlashcardMultiplicity = () => {
  const cardW = 250;
  const gap = 36;
  const rowW = SET.length * cardW + (SET.length - 1) * gap;
  const startX = CX - rowW / 2 + cardW / 2;
  return (
    <Stage>
      {SET.map((item, i) => (
        <VocabFlashcard
          atFrame={-30 - i * 8}
          height={280}
          key={item.label}
          label={word(item.label)}
          listenCue={i === SET.length - 1}
          mode="reveal"
          phonetic={word(item.phon)}
          picture={
            <IconAsset name={item.icon} variant="color" width={132} />
          }
          width={cardW}
          x={startX + i * (cardW + gap)}
          y={CY}
        />
      ))}
    </Stage>
  );
};

// CROSS-SUBJECT PROOF — the SAME component, Chinese 图文对照: an IconAsset object
// illustration + a hanzi label + pinyin. Different props, zero component change.
export const VocabFlashcardChinese = () => (
  <Stage>
    <VocabFlashcard
      atFrame={-40}
      label={word("木")}
      listenCue
      mode="label-after"
      phonetic={word("mù")}
      picture={<IconAsset name="sprout" variant="color" width={150} />}
      x={CX}
      y={CY}
    />
  </Stage>
);
