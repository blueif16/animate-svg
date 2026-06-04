import { AbsoluteFill } from "remotion";
import { DialogueExchange } from "../motion-primitives";
import { IconAsset, NumberCard } from "../shape-primitives";
import { fontFamily } from "../shape-primitives/shared";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// DialogueExchangeDemo — verification scenes for the DialogueExchange special
// component. Three compositions are derived off this:
//
//  • DialogueExchangeHardest      — THE HARDEST FRAME. Both speakers visible,
//    each with a name card, a question bubble (left) and its answer bubble
//    (right) up together, the answer turn emphasis-flagged (the pronunciation
//    ring). Verify the two tail-pointing bubbles + name cards + faces never
//    overlap and read as one conversation.
//  • DialogueExchangeMultiplicity — WORST-CASE MULTIPLICITY. A 4-turn English
//    greeting→farewell exchange mid-run (on the 3rd turn) with a wave gesture
//    live, the two newest bubbles visible (older dimmed).
//  • DialogueExchangeChinese      — SECOND-CALLER PROOF. The SAME component,
//    different props: a Chinese 你/我/他 person-reference exchange using the
//    point-other / point-self gestures and Chinese line nodes. Nothing about
//    the component changes — only props.
//
// Demo scene → explicit value props + English/Chinese strings are fine HERE
// (the lesson-agnostic law governs the COMPONENT, not its demo harness; a real
// lesson passes localized line nodes + faces from its own data and atFrame from
// cues[id].startFrame+offset).
// ---------------------------------------------------------------------------

const CX = video.width / 2;
const CY = video.height / 2;

export const DIALOGUE_EXCHANGE_DEMO_DURATION = 220;

// A localized utterance node — the caller owns the string + styling.
const line = (text: string) => (
  <tspan fontFamily={fontFamily} fontWeight={900}>
    {text}
  </tspan>
);

const boy = <IconAsset name="boy-face" variant="color" width={180} />;
const robot = <IconAsset name="robot-face-round" variant="color" width={180} />;

// A localized name card node — caller-supplied.
const nameTag = (text: string) => (
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

// THE HARDEST FRAME — both speakers + name cards + a Q bubble and its emphasized
// A bubble up together. Held at a frame where turns 0 and 1 are both visible.
export const DialogueExchangeHardest = () => (
  <Stage>
    <DialogueExchange
      atFrame={-44}
      figureRadius={104}
      left={{ figure: boy, nameCard: nameTag("Tom") }}
      perTurnDurationFrames={48}
      right={{ figure: robot, nameCard: nameTag("Robo") }}
      speakerGap={620}
      turns={[
        { speaker: "left", line: line("What's your name?") },
        { speaker: "right", line: line("I'm Robo!"), emphasis: true },
      ]}
      x={CX}
      y={CY + 40}
    />
  </Stage>
);

// WORST-CASE MULTIPLICITY — a 4-turn greeting→farewell, held on the 3rd turn so
// turns 2 and 3 are visible (turn 3 a wave farewell), turns 0-1 already faded.
export const DialogueExchangeMultiplicity = () => (
  <Stage>
    <DialogueExchange
      atFrame={-150}
      figureRadius={104}
      left={{ figure: boy, nameCard: nameTag("Tom") }}
      perTurnDurationFrames={48}
      right={{ figure: robot, nameCard: nameTag("Robo") }}
      speakerGap={620}
      turns={[
        { speaker: "left", line: line("Hello!") },
        { speaker: "right", line: line("Hi!") },
        { speaker: "left", line: line("Goodbye!"), gesture: "wave" },
        { speaker: "right", line: line("Bye-Bye!"), gesture: "wave" },
      ]}
      x={CX}
      y={CY + 40}
    />
  </Stage>
);

// SECOND-CALLER PROOF — the SAME component, Chinese 你/我/他 person reference.
// point-other for 你, point-self for 我. Different props, zero component change.
export const DialogueExchangeChinese = () => (
  <Stage>
    <DialogueExchange
      atFrame={-44}
      figureRadius={104}
      left={{ figure: boy, nameCard: <NumberCard value="我" width={120} /> }}
      perTurnDurationFrames={48}
      right={{ figure: robot, nameCard: <NumberCard value="你" width={120} /> }}
      speakerGap={620}
      turns={[
        { speaker: "left", line: line("你好！"), gesture: "point-other" },
        { speaker: "right", line: line("我很好！"), gesture: "point-self" },
      ]}
      x={CX}
      y={CY + 40}
    />
  </Stage>
);
