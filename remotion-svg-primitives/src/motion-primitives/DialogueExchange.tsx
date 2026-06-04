import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";
import { fontFamily } from "../shape-primitives/shared";
import { PopIn } from "./PopIn";
import { PulseCircle } from "./PulseCircle";
import { EASE } from "./curves";

export type DialogueSide = "left" | "right";

export type DialogueSpeakerGesture =
  | "none"
  | "wave"
  | "point-self"
  | "point-other";

export type DialogueSpeaker = {
  /**
   * The caller-supplied face / character node (e.g. `<IconAsset name="boy-face"
   * />`). NEVER baked — the component only places it, faces it toward the other
   * speaker, and leans/bobs it on its turn. Drawn centered on the speaker slot.
   */
  figure: ReactNode;
  /**
   * Optional caller-supplied name-card node shown under the figure (e.g. a
   * `<NumberCard>` or a localized `<text>` with the speaker's name). Never baked.
   */
  nameCard?: ReactNode;
};

export type DialogueTurn = {
  /** Which speaker talks on this turn. */
  speaker: DialogueSide;
  /**
   * The localized utterance node — the line of dialogue. NEVER baked: the caller
   * passes `Hello!` / `你好` / `我叫…` / any `ReactNode`. The component lays it
   * inside an auto-sized speech bubble whose tail points at `speaker`.
   */
  line: ReactNode;
  /**
   * Flag this turn for pronunciation/emphasis: a `<PulseCircle>` ring fires at
   * the bubble and the figure gives a slightly bigger lean. Use for the tricky
   * sound (I'm [aɪm]/[em]) or the answer beat. Default false.
   */
  emphasis?: boolean;
  /**
   * Per-turn speaker gesture, so farewell waving and 你/我/他 pointing reuse the
   * SAME component — the gesture is a prop, not a baked behavior. `wave` rocks
   * the figure; `point-self` / `point-other` draw a small arm/arrow toward the
   * speaker itself / the other speaker. Default `none`.
   */
  gesture?: DialogueSpeakerGesture;
};

export type DialogueExchangeProps = {
  /** Left speaker (faces right, toward the other). */
  left: DialogueSpeaker;
  /** Right speaker (faces left, toward the other — mirrored). */
  right: DialogueSpeaker;
  /**
   * The ordered exchange, turn 0 first. Turn k's bubble pops in only after turn
   * k-1 (+ gap); at most the two most recent bubbles stay visible (earlier ones
   * fade) so the frame never crowds. 1..~6 turns.
   */
  turns: DialogueTurn[];
  /**
   * Local (cue-relative) frame. The component derives every turn's local
   * progress BY INDEX from `atFrame` + `perTurnDurationFrames` (+ gap) — ZERO
   * frame literals. The composer passes `cues[id].startFrame + offset`; this
   * component never reads a master-timeline literal.
   */
  atFrame: number;
  /** Frames each turn's bubble holds before the next begins. Default 40. */
  perTurnDurationFrames?: number;
  /** Extra frames between one turn ending its pop and the next beginning. Default 6. */
  interTurnGapFrames?: number;
  /**
   * How many of the most-recent bubbles stay on screen at once. Older bubbles
   * fade out. Default 2 (keeps the frame legible — a Q and its A). Max 2 is the
   * kids-eye recommendation; the component allows more but you own legibility.
   */
  maxVisibleBubbles?: number;
  /** Horizontal gap between the two speaker centers (px). Default 560. */
  speakerGap?: number;
  /** Per-speaker footprint radius — sizes the figure slot, bubble offset, and
   *  emphasis ring. Match your figure's visual radius. Default 110. */
  figureRadius?: number;
  /** Bubble fill. Default white. */
  bubbleFill?: string;
  /** Bubble stroke / tail color. Default textNavy. */
  bubbleStroke?: string;
  /** Ink color of the dialogue line text default + gestures. Default textNavy. */
  inkColor?: string;
  /** Emphasis ring color (pronunciation/answer flag). Default coral. */
  emphasisColor?: string;
  /** Center of the whole component in the parent coordinate system. */
  x?: number;
  y?: number;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Local layout offsets, measured from each speaker center. Bubbles float ABOVE
// the figures (kids-eye: face stays low/grounded, speech rises). The tail drops
// from the bubble's bottom toward its speaker. Name cards sit BELOW the figure.
const BUBBLE_RISE = 96; // gap from figure top to bubble bottom
const NAMECARD_DROP = 40; // gap from figure bottom to name card top
const TAIL_W = 30;
const TAIL_H = 26;

/**
 * DialogueExchange — a turn-taking spoken exchange between TWO caller-supplied
 * speakers. Each speaks in order: turn k's speech bubble pops in only after turn
 * k-1 (+ gap), its tail pointing at the speaker who said it, while the speaking
 * figure leans/bobs and (optionally) waves or points. At most the two most
 * recent bubbles stay up, so a question and its answer read together without
 * crowding.
 *
 * Lesson-agnostic & prop-driven — it bakes NO topic, NO English/Chinese string,
 * NO face: the caller passes `left.figure` / `right.figure`, each `turn.line` as
 * a localized ReactNode, and (for farewell waving / 你我他 pointing) a per-turn
 * `gesture`. The SAME component drives English greetings (Hello!/Hi!), farewells
 * (Goodbye!/Bye-Bye! with `gesture:'wave'`), name Q&A (What's your name?/My name
 * is ___, the answer turn `emphasis`-flagged), AND Chinese 你/我/他 person
 * reference (`gesture:'point-other'|'point-self'`) — the caller only varies props.
 *
 * Composes registered capabilities only — `<PopIn motion="bouncy">` for the
 * bubble entrance, `<PulseCircle>` for the emphasis/pronunciation flag — plus a
 * hand-drawn rounded bubble-with-tail and named `EASE.*` motion for the
 * lean/bob. ZERO frame literals (public API takes `atFrame` +
 * `perTurnDurationFrames`; every turn's progress derived BY INDEX), ZERO raw
 * motion literals.
 */
export const DialogueExchange: React.FC<DialogueExchangeProps> = ({
  left,
  right,
  turns,
  atFrame,
  perTurnDurationFrames = 40,
  interTurnGapFrames = 6,
  maxVisibleBubbles = 2,
  speakerGap = 560,
  figureRadius = 110,
  bubbleFill,
  bubbleStroke,
  inkColor,
  emphasisColor,
  x = 0,
  y = 0,
}) => {
  const frame = useCurrentFrame();
  const local = frame - atFrame;
  const D = Math.max(1, perTurnDurationFrames);
  const gap = Math.max(0, interTurnGapFrames);
  const step = D + gap; // one whole turn occupies D+gap before the next opens

  const fill = bubbleFill ?? colors.white;
  const stroke = bubbleStroke ?? colors.textNavy;
  const ink = inkColor ?? colors.textNavy;
  const accent = emphasisColor ?? colors.coral;

  // Speaker slot centers. Left faces right, right faces left (mirrored figure).
  const slotX = (side: DialogueSide) =>
    side === "left" ? -speakerGap / 2 : speakerGap / 2;

  // The currently-speaking turn index (the latest turn whose window has opened).
  const activeTurn = Math.min(
    turns.length - 1,
    Math.max(-1, Math.floor(local / step)),
  );

  // Per-side lean/bob: a figure leans toward the other + bobs while it is the
  // active speaker; a bigger lean on an emphasis turn. Derived from the active
  // turn's window — never a frame literal.
  const speakerMotion = (side: DialogueSide) => {
    if (activeTurn < 0 || turns[activeTurn]?.speaker !== side) {
      return { lean: 0, bob: 0, gesture: "none" as DialogueSpeakerGesture };
    }
    const turn = turns[activeTurn];
    const into = local - activeTurn * step; // frames into the active window
    // Lean rises over the first third of the window, holds, eases back at the end.
    const leanAmt = (turn.emphasis ? 16 : 10) * (side === "left" ? 1 : -1);
    const lean = interpolate(
      into,
      [0, D * 0.32, D * 0.7, D],
      [0, leanAmt, leanAmt, 0],
      { ...CLAMP, easing: EASE.outCubic },
    );
    // A gentle one-cycle bob (sin via a triangle of interpolate stops).
    const bob = interpolate(
      into,
      [0, D * 0.25, D * 0.5, D * 0.75, D],
      [0, -6, 0, -3, 0],
      { ...CLAMP, easing: EASE.inOutCubic },
    );
    return { lean, bob, gesture: turn.gesture ?? "none" };
  };

  const renderSpeaker = (side: DialogueSide, speaker: DialogueSpeaker) => {
    const cx = slotX(side);
    const facesRight = side === "left"; // both face the OTHER speaker (inward)
    const { lean, bob, gesture } = speakerMotion(side);
    // Mirror the right figure horizontally so the two characters face each other.
    const faceFlip = facesRight ? 1 : -1;
    return (
      <g key={side} transform={`translate(${cx + lean} ${bob})`}>
        {/* Figure — mirrored on the right so both look inward. The caller owns
            the art; we only place + flip + lean it. */}
        <g transform={`scale(${faceFlip} 1)`}>{speaker.figure}</g>

        {/* Gesture overlay (wave / point) — a prop, not baked. Points inward
            toward the other speaker by default; point-self curls back. */}
        {gesture !== "none" ? (
          <SpeakerGesture
            gesture={gesture}
            facesRight={facesRight}
            ink={ink}
            accent={accent}
            radius={figureRadius}
          />
        ) : null}

        {/* Name card under the figure. */}
        {speaker.nameCard ? (
          <g transform={`translate(0 ${figureRadius + NAMECARD_DROP})`}>
            {speaker.nameCard}
          </g>
        ) : null}
      </g>
    );
  };

  return (
    <g transform={`translate(${x} ${y})`}>
      {renderSpeaker("left", left)}
      {renderSpeaker("right", right)}

      {turns.map((turn, i) => {
        const turnStart = i * step;
        const into = local - turnStart;
        if (into < 0) {
          return null; // turn hasn't begun
        }
        // Visibility: keep only the maxVisibleBubbles most-recent OPENED turns.
        const opened = Math.floor(local / step); // index of latest opened turn
        const age = opened - i; // 0 = newest
        if (age >= Math.max(1, maxVisibleBubbles)) {
          return null;
        }
        // Older-but-still-visible bubbles dim so the newest reads as "current".
        const dim = age === 0 ? 1 : 0.5;
        const cx = slotX(turn.speaker);
        // Bubble sits above-and-inward of its speaker so the row's two bubbles
        // lean toward the conversation center, not off the canvas edge.
        const inward = turn.speaker === "left" ? 1 : -1;
        const bubbleX = cx + inward * (figureRadius * 0.2);
        const bubbleY = -(figureRadius + BUBBLE_RISE);
        return (
          <g key={i} opacity={dim}>
            <PopIn
              delay={atFrame + turnStart}
              motion="bouncy"
              originX={bubbleX}
              originY={bubbleY}
            >
              <SpeechBubble
                x={bubbleX}
                y={bubbleY}
                tailToX={cx}
                tailToY={-(figureRadius * 0.6)}
                fill={fill}
                stroke={stroke}
                ink={ink}
              >
                {turn.line}
              </SpeechBubble>
            </PopIn>
            {/* Emphasis / pronunciation flag — a self-contained ripple at the
                bubble. Only on the newest (active) emphasis turn. */}
            {turn.emphasis && age === 0 ? (
              <PulseCircle
                color={accent}
                cx={bubbleX}
                cy={bubbleY}
                durationInFrames={Math.round(D * 0.7)}
                radius={figureRadius * 0.92}
                repeatCount={2}
                spread={26}
                startFrame={atFrame + turnStart + Math.round(D * 0.18)}
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

type SpeechBubbleProps = {
  x: number;
  y: number;
  /** Tail target point (the speaker's mouth area), in the same local space. */
  tailToX: number;
  tailToY: number;
  fill: string;
  stroke: string;
  ink: string;
  children: ReactNode;
};

/**
 * SpeechBubble — a rounded bubble with a triangular tail pointing at its
 * speaker, auto-sized around a caller line node. Internal to DialogueExchange
 * (one concern: hold ONE localized utterance and point at who said it); it bakes
 * no string. The line node is centered; long lines should pre-wrap via the
 * caller's own <tspan>s.
 */
const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  x,
  y,
  tailToX,
  tailToY,
  fill,
  stroke,
  ink,
  children,
}) => {
  const w = 280;
  const h = 116;
  // Tail base sits on the bubble's bottom edge, nearest the speaker; its apex
  // reaches toward (tailToX, tailToY). Clamp the base x inside the bubble.
  const baseX = Math.max(
    x - w / 2 + TAIL_W + 12,
    Math.min(x + w / 2 - TAIL_W - 12, tailToX),
  );
  const baseY = y + h / 2;
  const apexX = baseX + (tailToX - baseX) * 0.5;
  const apexY = Math.min(baseY + TAIL_H, tailToY);
  return (
    <g>
      <path
        d={`M ${baseX - TAIL_W / 2} ${baseY} L ${apexX} ${apexY} L ${baseX + TAIL_W / 2} ${baseY} Z`}
        fill={fill}
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth={5}
      />
      <rect
        fill={fill}
        height={h}
        rx={h / 2}
        stroke={stroke}
        strokeWidth={5}
        width={w}
        x={x - w / 2}
        y={y - h / 2}
      />
      <text
        dominantBaseline="middle"
        fill={ink}
        fontFamily={fontFamily}
        fontSize={44}
        fontWeight={900}
        textAnchor="middle"
        x={x}
        y={y + 3}
      >
        {children}
      </text>
    </g>
  );
};

type SpeakerGestureProps = {
  gesture: DialogueSpeakerGesture;
  /** True when this speaker faces RIGHT (the left speaker) — the gesture's
   *  inward direction is +x; for a right speaker (facesRight=false) it is -x. */
  facesRight: boolean;
  ink: string;
  accent: string;
  radius: number;
};

/**
 * SpeakerGesture — the small per-turn gesture mark. `wave` is a raised open hand
 * beside the figure's head; `point-self` curls an arrow back at the figure (我);
 * `point-other` shoots an arrow toward the other speaker (你/他). Internal to
 * DialogueExchange; direction follows `facesRight` so it always reads inward /
 * back correctly on either side. Bakes no string.
 */
const SpeakerGesture: React.FC<SpeakerGestureProps> = ({
  gesture,
  facesRight,
  ink,
  accent,
  radius,
}) => {
  const inward = facesRight ? 1 : -1;
  if (gesture === "wave") {
    // Raised waving hand at the upper-inward of the head.
    const hx = inward * radius * 0.82;
    const hy = -radius * 0.62;
    return (
      <g transform={`translate(${hx} ${hy})`}>
        <circle cx={0} cy={0} fill={accent} r={radius * 0.2} />
        {[-1, 0, 1].map((k) => (
          <line
            key={k}
            stroke={accent}
            strokeLinecap="round"
            strokeWidth={6}
            x1={k * radius * 0.07}
            x2={k * radius * 0.1 + inward * radius * 0.04}
            y1={-radius * 0.14}
            y2={-radius * 0.3}
          />
        ))}
      </g>
    );
  }
  // Pointing arrow, kept clear of the face. point-other shoots inward-up toward
  // the other speaker (你/他); point-self points down-in at this figure's own
  // name card / chest (我), starting from beside the head — never across the
  // eyes.
  const toOther = gesture === "point-other";
  const startX = inward * radius * 0.95;
  const startY = -radius * 0.5;
  const endX = toOther ? inward * radius * 1.5 : inward * radius * 0.55;
  const endY = toOther ? -radius * 0.7 : radius * 0.55;
  const headSize = radius * 0.18;
  const ang = Math.atan2(endY - startY, endX - startX);
  return (
    <g>
      <line
        stroke={ink}
        strokeLinecap="round"
        strokeWidth={7}
        x1={startX}
        x2={endX}
        y1={startY}
        y2={endY}
      />
      <path
        d={`M ${endX} ${endY} L ${endX - headSize * Math.cos(ang - 0.5)} ${endY - headSize * Math.sin(ang - 0.5)} L ${endX - headSize * Math.cos(ang + 0.5)} ${endY - headSize * Math.sin(ang + 0.5)} Z`}
        fill={ink}
      />
    </g>
  );
};
