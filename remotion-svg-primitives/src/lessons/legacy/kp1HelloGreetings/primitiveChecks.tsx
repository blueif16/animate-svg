import { AbsoluteFill } from "remotion";
import { DialogueExchange, ReadAlongHighlight } from "../../../motion-primitives";
import { IconAsset } from "../../../shape-primitives";
import { fontFamily } from "../../../shape-primitives/shared";
import { colors, video } from "../../../theme";

// ---------------------------------------------------------------------------
// Primitive checks for kp1-hello-greetings — the W3b verification stills.
//
// This lesson ships NO new hand-coded primitive: every visual demand is met by
// REUSE (DialogueExchange + ReadAlongHighlight + LessonIntroCard + PulseCircle
// + PopIn + Breathe + IconAsset). The ONE new capability is a generated ASSET —
// `girl-face` — authored so the two identity-invariant kids read as two
// DISTINCT people (boy-face = green-shirt boy; girl-face = blue-shirt girl with
// pigtails) and so neither kid's fills collide with this lesson's reserved coral
// emphasis channel.
//
// Therefore these two stills exist to verify the NEW ASSET in this lesson's two
// hardest frames, rendered at the lesson's REAL composition resolution (the repo
// standard 1280×720 — see `src/theme.ts` `video`; no lesson renders at 1920):
//
//   1. Hardest — the `intro-self` beat: the right kid (boy) reply bubble
//      "Hi! I'm Sam." with the emphasis pulse on "I'm", the "Sam" name card, the
//      left kid (girl) present, and the read-along row swelling "I'm". The
//      densest, most accent-loaded single frame. Verifies the girl-face + the
//      boy-face + a bubble + a coral emphasis ring + a name card + the read-along
//      all read at once and the coral ring is unmistakably the only coral mark.
//   2. Multiplicity — the `part-goodbye` beat: BOTH kids waving with the two
//      farewell bubbles up at once (the DialogueExchange max-2-bubbles density)
//      + the farewell read-along. Verifies the two DISTINCT faces hold their
//      identity side-by-side, both waves read, and nothing crowds.
//
// Demo harness: explicit English/Chinese strings + face names are fine HERE (the
// lesson-agnostic law governs the COMPONENT/ASSET, not its verification scene).
// ---------------------------------------------------------------------------

export const PRIMITIVE_CHECK_KP1_HELLO_DURATION = 1;

const CANVAS_WIDTH = video.width;
const CANVAS_HEIGHT = video.height;

// figureRadius drives the slot/bubble/ring geometry; the IconAsset width is
// matched to ~2×radius so the face footprint equals the slot. Both kids use the
// SAME size so they read as same-scale people.
const FIGURE_RADIUS = 120;
const FACE_WIDTH = FIGURE_RADIUS * 2;

const girl = (
  <IconAsset name="girl-face" variant="color" width={FACE_WIDTH} />
);
const boy = <IconAsset name="boy-face" variant="color" width={FACE_WIDTH} />;

// A localized utterance node — the caller owns the string + styling.
const line = (text: string) => (
  <tspan fontFamily={fontFamily} fontWeight={900}>
    {text}
  </tspan>
);

// A localized name card node — caller-supplied (binds name↔person at intro-self).
const nameTag = (text: string) => (
  <g>
    <rect
      fill={colors.paleCream ?? colors.cream}
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
      fontSize={32}
      fontWeight={900}
      textAnchor="middle"
      x={0}
      y={2}
    >
      {text}
    </text>
  </g>
);

// A localized word item — a full <text fill="currentColor"> so the glyph rides
// ReadAlongHighlight's active tint (the highlight flows through `color` on the
// wrapping group). Centered so the sliding underline cursor tracks it.
const wordGlyph = (text: string, size = 60) => (
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

// One read-along phrase row (a single line of word items). Held mid-sweep so the
// active swell + underline cursor are visible in the still. itemGap is generous
// because the items are whole WORDS (wider than single glyphs); the gap scales
// with the longest word so 8-char farewells ("Goodbye!"/"Bye-Bye!") never touch.
const readAlongRow = (
  words: string[],
  atFrame: number,
  beats?: number[],
  itemGap = 280,
) => (
  <ReadAlongHighlight
    activeScale={1.18}
    atFrame={atFrame}
    beats={beats}
    cursor="underline"
    highlightColor={colors.reward}
    inkColor={colors.textNavy}
    itemGap={itemGap}
    itemRadius={70}
    lines={[words.map((w) => wordGlyph(w))]}
    perBeatDurationFrames={18}
  />
);

// 1. HARDEST — the intro-self frame, captured mid-emphasis. The DialogueExchange
//    is advanced to turn index 1 (the boy reply) with emphasis live, so the
//    bubble, the coral pulse ring, and the boy's lean are all present; the girl
//    is on-stage on the left. The "Sam" name card sits under the boy. The
//    read-along row below swells "I'm" as one held unit.
export const PrimitiveCheckKp1HelloGreetingsHardest = () => {
  // Two turns: turn 0 (girl "Hello!"), turn 1 (boy "Hi! I'm Sam." emphasis).
  // perTurn=40, gap=6 → turn 1 opens at local 46. Sample mid-turn-1 (local 64)
  // so the bubble has popped, the lean holds, and the pulse ring is mid-ripple.
  const atFrame = -64; // local = frame(0) - atFrame = 64
  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        <g transform={`translate(${CANVAS_WIDTH / 2} ${CANVAS_HEIGHT * 0.4})`}>
          <DialogueExchange
            atFrame={atFrame}
            emphasisColor={colors.coral}
            figureRadius={FIGURE_RADIUS}
            left={{ figure: girl }}
            right={{ figure: boy, nameCard: nameTag("Sam") }}
            speakerGap={560}
            turns={[
              { speaker: "left", line: line("Hello!"), gesture: "wave" },
              {
                speaker: "right",
                line: line("Hi! I'm Sam."),
                emphasis: true,
              },
            ]}
          />
        </g>
        {/* Read-along row docked low, swelling "I'm" via a weighted beat. */}
        <g transform={`translate(${CANVAS_WIDTH / 2} ${CANVAS_HEIGHT * 0.86})`}>
          {readAlongRow(["Hi!", "I'm", "Sam."], -30, [1, 2.4, 1])}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// 2. MULTIPLICITY — the part-goodbye frame: both kids wave, both farewell
//    bubbles up at once. Advance the exchange so turns 0 and 1 are the two most
//    recent (both visible; the component caps to 2). Sample at the start of the
//    SECOND turn's window so the first bubble is still up (dimmed) and the second
//    has just popped with the wave live — the worst-case two-bubble density.
export const PrimitiveCheckKp1HelloGreetingsMultiplicity = () => {
  // perTurn=40, gap=6 → turn 1 opens at local 46. Sample local 58 so turn 1's
  // bubble has popped + wave is live while turn 0's bubble is still visible.
  const atFrame = -58;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        <g transform={`translate(${CANVAS_WIDTH / 2} ${CANVAS_HEIGHT * 0.4})`}>
          <DialogueExchange
            atFrame={atFrame}
            figureRadius={FIGURE_RADIUS}
            left={{ figure: girl }}
            right={{ figure: boy }}
            speakerGap={560}
            turns={[
              { speaker: "left", line: line("Goodbye!"), gesture: "wave" },
              { speaker: "right", line: line("Bye-Bye!"), gesture: "wave" },
            ]}
          />
        </g>
        <g transform={`translate(${CANVAS_WIDTH / 2} ${CANVAS_HEIGHT * 0.86})`}>
          {readAlongRow(["Goodbye!", "Bye-Bye!"], -20, undefined, 420)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
