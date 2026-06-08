import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Breathe, FXDefs } from "../fx";
import {
  DialogueExchange,
  PulseCircle,
  ReadAlongHighlight,
} from "../motion-primitives";
import { IconAsset, LessonIntroCard } from "../shape-primitives";
import { fontFamily } from "../shape-primitives/shared";
import { colors, typography } from "../theme";
import { kp1HelloGreetingsCues } from "./kp1HelloGreetingsLessonTimeline";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  EXCHANGE_REL_START,
  FACE_WIDTH,
  FIGURE_RADIUS,
  INTER_TURN_GAP,
  INTRO_CARD_DUR,
  INTRO_CARD_FADE_OUT_DUR,
  INTRO_CARD_REL_START,
  INTRO_CAST_DUR,
  INTRO_CAST_REL_START,
  INTRO_SELF_READALONG_REL_START,
  KID_LEFT_CX,
  KID_RIGHT_CX,
  NAMECARD_FONT,
  NAMECARD_H,
  NAMECARD_W,
  PER_TURN_FRAMES,
  READALONG_CY,
  READALONG_ITEM_GAP,
  READALONG_ITEM_RADIUS,
  READALONG_PER_BEAT_FRAMES,
  READALONG_REL_START,
  READALONG_WORD_SIZE,
  RECAP_ARC_REL_START,
  RECAP_CY,
  RECAP_ITEM_GAP,
  RECAP_ITEM_RADIUS,
  RECAP_LINE_GAP,
  RECAP_PER_BEAT_FRAMES,
  RECAP_PULSE_CX,
  RECAP_PULSE_CY,
  RECAP_PULSE_DUR,
  RECAP_PULSE_RADIUS,
  RECAP_PULSE_REL_START,
  RECAP_PULSE_REPEAT,
  RECAP_PULSE_SPREAD,
  RECAP_WORD_SIZE,
  STAGE_CX,
  STAGE_CY,
  STAGE_FADE_IN_DUR,
  SPEAKER_GAP,
  TITLE_CX,
  TITLE_CY,
  TITLE_SIZE,
} from "./kp1HelloGreetings/layout";
import { measureProps, useMeasureHook } from "./_measure/measureHook";
import { cueMap } from "./timingTypes";

// ---------------------------------------------------------------------------
// Cue lookup — every absolute frame below derives from cues[id].startFrame +
// a named *_REL_START constant from layout.ts. ZERO master-timeline literals.
// ---------------------------------------------------------------------------
const cues = cueMap(kp1HelloGreetingsCues);
const c = {
  intro: () => cues["intro"],
  meetHello: () => cues["meet-hello"],
  introSelf: () => cues["intro-self"],
  partGoodbye: () => cues["part-goodbye"],
  recap: () => cues["recap"],
};

// ---------------------------------------------------------------------------
// Interpolation helpers (named EASE.* from the kit are reached inside the
// reusable components; the scene's own fades use linear/clamped progress).
// ---------------------------------------------------------------------------
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const reveal = (frame: number, start: number, duration: number) =>
  clamp01((frame - start) / Math.max(1, duration));

// ---------------------------------------------------------------------------
// Identity-invariant cast — the SAME two IconAsset face nodes are reused every
// cue (intro cast reveal → live exchange → recap). The girl is the LEFT kid,
// the boy is the RIGHT kid. Their fills are on-palette and carry NO coral, so
// the only coral marks in the lesson are the two emphasis pulses.
// ---------------------------------------------------------------------------
const GIRL_FACE: ReactNode = (
  <IconAsset name="girl-face" variant="color" width={FACE_WIDTH} />
);
const BOY_FACE: ReactNode = (
  <IconAsset name="boy-face" variant="color" width={FACE_WIDTH} />
);

// A localized utterance node for a speech bubble — the caller owns the string.
const bubbleLine = (text: string): ReactNode => (
  <tspan fontFamily={fontFamily} fontWeight={900}>
    {text}
  </tspan>
);

// A localized name-card node — binds the name to the right kid at intro-self.
// One fact (the name); the bubble already says "I'm Sam" so the card does NOT
// repeat the utterance — it names the PERSON (visual-design text-budget).
const nameTag = (text: string): ReactNode => (
  <g>
    <rect
      fill={colors.paleCream}
      height={NAMECARD_H}
      rx={NAMECARD_H / 2}
      stroke={colors.textNavy}
      strokeWidth={3}
      width={NAMECARD_W}
      x={-NAMECARD_W / 2}
      y={-NAMECARD_H / 2}
    />
    <text
      dominantBaseline="middle"
      fill={colors.textNavy}
      fontFamily={fontFamily}
      fontSize={NAMECARD_FONT}
      fontWeight={900}
      textAnchor="middle"
      x={0}
      y={2}
    >
      {text}
    </text>
  </g>
);

// A read-along word item — a full <text> node (W3b finding: a bare <tspan>
// renders invisible inside the component's wrapping <g>; it must be a <text>).
// The glyph fill is FIXED navy (high contrast on cream, ≥12:1) rather than
// currentColor: the orange "active" signal rides the cursor + glow ring + swell
// instead, so the word being said is marked by a moving orange highlight over
// always-legible navy text — the eye follows the bouncing spot. (Tinting the
// glyph itself orange would drop it to ~1.6:1 on cream — the contrast gate's
// flag — for the very word the child must read.)
const wordGlyph = (text: string, size: number): ReactNode => (
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
    {text}
  </text>
);

// ---------------------------------------------------------------------------
// Intro card opacity — resolves in over the intro cue, fades out before the
// stage exchange mounts at meet-hello.
// ---------------------------------------------------------------------------
const introCardProgress = (frame: number): number =>
  reveal(frame, c.intro().startFrame + INTRO_CARD_REL_START, INTRO_CARD_DUR);

const introCardOpacity = (frame: number): number => {
  const fadeOut =
    1 - reveal(frame, c.intro().endFrame - INTRO_CARD_FADE_OUT_DUR, INTRO_CARD_FADE_OUT_DUR);
  return clamp01(fadeOut);
};

// Intro cast — the two kid faces appear quiet beneath the card. They fade in
// during intro, then are HANDED OFF to the DialogueExchange at meet-hello (which
// renders the same faces). The standalone cast is only shown during the intro
// cue; from meet-hello on, DialogueExchange owns the figures.
const introCastOpacity = (frame: number): number => {
  if (frame >= c.meetHello().startFrame) return 0;
  const fadeIn = reveal(
    frame,
    c.intro().startFrame + INTRO_CAST_REL_START,
    INTRO_CAST_DUR,
  );
  return clamp01(fadeIn);
};

// Stage (DialogueExchange) opacity — ramps in at meet-hello start and holds 1
// through recap. The two kids are NEVER destroyed/recreated across the teaching
// cues; only which exchange (turns) is mounted changes.
const stageOpacity = (frame: number): number => {
  if (frame < c.meetHello().startFrame) return 0;
  return clamp01(reveal(frame, c.meetHello().startFrame, STAGE_FADE_IN_DUR));
};

// recap closing PulseCircle (pulse #2 of 2).
const recapPulseActive = (frame: number): boolean =>
  frame >= c.recap().startFrame + RECAP_PULSE_REL_START;

// ---------------------------------------------------------------------------
// Per-cue exchange rendering. ONE DialogueExchange per teaching cue; atFrame is
// cue-relative so each cue's turns play from that cue's start. The figures are
// the shared GIRL_FACE / BOY_FACE nodes (identity invariant). Only the visible
// cue's exchange is mounted (gated on the cue window) so bubbles never bleed
// across cue boundaries.
// ---------------------------------------------------------------------------
const cueActive = (id: keyof typeof c, frame: number): boolean => {
  const cue = c[id]();
  return frame >= cue.startFrame && frame < cue.endFrame;
};

export const Kp1HelloGreetingsLessonScene = () => {
  useMeasureHook();
  const frame = useCurrentFrame();

  const introCardP = introCardProgress(frame);
  const introCardOp = introCardOpacity(frame);
  const introCastOp = introCastOpacity(frame);
  const stageOp = stageOpacity(frame);

  const meetActive = cueActive("meetHello", frame);
  const selfActive = cueActive("introSelf", frame);
  const partActive = cueActive("partGoodbye", frame);
  const recapActive = cueActive("recap", frame);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.cream,
        color: colors.textNavy,
        fontFamily: typography.fontFamily,
        overflow: "hidden",
      }}
    >
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        <FXDefs />

        {/* =================================================================
            INTRO — topic title card (zone-title). Breathe-wrapped during its
            hold so no frame is truly frozen (rule #6).
            ================================================================ */}
        {introCardOp > 0 ? (
          <g {...measureProps("intro-card")} opacity={introCardOp}>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.5}
              originX={TITLE_CX}
              originY={TITLE_CY}
              phaseSeed="kp1-hello-title"
            >
              <LessonIntroCard
                accentColor="reward"
                progress={introCardP}
                section="Unit 1 · Hello!"
                // subColor navy (not softGrayBlue) so the eyebrow + teaser clear
                // the 4.5:1 contrast floor on cream; weight/size keep them
                // subordinate to the 92px title (W3b/contrast-gate fix).
                subColor="textNavy"
                teaser="say hello · say who you are · say goodbye"
                title="Hello & Greetings"
                titleSize={TITLE_SIZE}
                x={TITLE_CX}
                y={TITLE_CY}
              />
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            INTRO CAST — the two kid faces settle quiet beneath the card. The
            SAME faces DialogueExchange uses from meet-hello on (identity
            invariant). Breathe-wrapped during the calm cast hold.
            ================================================================ */}
        {introCastOp > 0 ? (
          <g {...measureProps("kid-left")} opacity={introCastOp}>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.5}
              originX={KID_LEFT_CX}
              originY={STAGE_CY}
              phaseSeed="kp1-kid-left"
            >
              <g transform={`translate(${KID_LEFT_CX} ${STAGE_CY})`}>
                {GIRL_FACE}
              </g>
            </Breathe>
          </g>
        ) : null}
        {introCastOp > 0 ? (
          <g {...measureProps("kid-right")} opacity={introCastOp}>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.5}
              originX={KID_RIGHT_CX}
              originY={STAGE_CY}
              phaseSeed="kp1-kid-right"
            >
              {/* Right kid mirrored so the two face each other, matching the
                  DialogueExchange handoff. */}
              <g transform={`translate(${KID_RIGHT_CX} ${STAGE_CY}) scale(-1 1)`}>
                {BOY_FACE}
              </g>
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            STAGE — the live spoken exchange. ONE DialogueExchange per teaching
            cue; the two figures are the shared GIRL/BOY nodes (identity
            invariant). Bubbles + waves + the I'm emphasis pulse are owned by the
            component, fired BY INDEX from atFrame = cueStart + EXCHANGE_REL_START.
            ================================================================ */}
        <g opacity={stageOp}>
          {/* meet-hello — left kid (girl) waves + "Hello!" pops on the wave. */}
          {meetActive ? (
            <g {...measureProps("exchange-meet")}>
              <DialogueExchange
                atFrame={c.meetHello().startFrame + EXCHANGE_REL_START}
                emphasisColor={colors.coral}
                figureRadius={FIGURE_RADIUS}
                interTurnGapFrames={INTER_TURN_GAP}
                left={{ figure: GIRL_FACE }}
                perTurnDurationFrames={PER_TURN_FRAMES}
                right={{ figure: BOY_FACE }}
                speakerGap={SPEAKER_GAP}
                turns={[
                  { speaker: "left", line: bubbleLine("Hello!"), gesture: "wave" },
                ]}
                x={STAGE_CX}
                y={STAGE_CY}
              />
            </g>
          ) : null}

          {/* intro-self — right kid (boy) replies "Hi! I'm Sam." with the
              emphasis pulse on the turn (pulse #1 of 2) + "Sam" name card. */}
          {selfActive ? (
            <g {...measureProps("exchange-self")}>
              <DialogueExchange
                atFrame={c.introSelf().startFrame + EXCHANGE_REL_START}
                emphasisColor={colors.coral}
                figureRadius={FIGURE_RADIUS}
                interTurnGapFrames={INTER_TURN_GAP}
                left={{ figure: GIRL_FACE }}
                perTurnDurationFrames={PER_TURN_FRAMES}
                right={{ figure: BOY_FACE, nameCard: nameTag("Sam") }}
                speakerGap={SPEAKER_GAP}
                turns={[
                  {
                    speaker: "right",
                    line: bubbleLine("Hi! I'm Sam."),
                    emphasis: true,
                  },
                ]}
                x={STAGE_CX}
                y={STAGE_CY}
              />
            </g>
          ) : null}

          {/* part-goodbye — BOTH kids wave + farewell bubbles pop (max-2
              density: Goodbye! then Bye-Bye!). */}
          {partActive ? (
            <g {...measureProps("exchange-part")}>
              <DialogueExchange
                atFrame={c.partGoodbye().startFrame + EXCHANGE_REL_START}
                emphasisColor={colors.coral}
                figureRadius={FIGURE_RADIUS}
                interTurnGapFrames={INTER_TURN_GAP}
                left={{ figure: GIRL_FACE }}
                perTurnDurationFrames={PER_TURN_FRAMES}
                right={{ figure: BOY_FACE }}
                speakerGap={SPEAKER_GAP}
                turns={[
                  { speaker: "left", line: bubbleLine("Goodbye!"), gesture: "wave" },
                  { speaker: "right", line: bubbleLine("Bye-Bye!"), gesture: "wave" },
                ]}
                x={STAGE_CX}
                y={STAGE_CY}
              />
            </g>
          ) : null}

          {/* recap — the two kids STAY PRESENT so the arc reads as theirs.
              Quiet (no turns), Breathe-wrapped during the recap hold. */}
          {recapActive ? (
            <g {...measureProps("recap-cast")}>
              <Breathe
                amplitudeScale={0.005}
                bpm={15}
                drift={0.5}
                originX={STAGE_CX}
                originY={STAGE_CY}
                phaseSeed="kp1-recap-cast"
              >
                <g transform={`translate(${KID_LEFT_CX} ${STAGE_CY})`}>
                  {GIRL_FACE}
                </g>
                <g transform={`translate(${KID_RIGHT_CX} ${STAGE_CY}) scale(-1 1)`}>
                  {BOY_FACE}
                </g>
              </Breathe>
            </g>
          ) : null}
        </g>

        {/* =================================================================
            READ-ALONG — the swept English phrase row (zone-readalong). One
            ReadAlongHighlight per teaching cue, surfacing THAT cue's spoken
            phrase as it lands. The reward-orange highlight tints the active
            word; the "I'm" segment is weighted-LONG so it is the slowest,
            biggest sweep in the lesson (intro-self key_difficult).
            ================================================================ */}
        {meetActive ? (
          <g {...measureProps("readalong-meet")}>
            <ReadAlongHighlight
              activeScale={1.18}
              atFrame={c.meetHello().startFrame + READALONG_REL_START}
              cursor="underline"
              highlightColor={colors.reward}
              inkColor={colors.textNavy}
              itemGap={READALONG_ITEM_GAP}
              itemRadius={READALONG_ITEM_RADIUS}
              lines={[[wordGlyph("Hello!", READALONG_WORD_SIZE)]]}
              perBeatDurationFrames={READALONG_PER_BEAT_FRAMES}
              x={STAGE_CX}
              y={READALONG_CY}
            />
          </g>
        ) : null}

        {selfActive ? (
          <g {...measureProps("readalong-self")}>
            <ReadAlongHighlight
              activeScale={1.28}
              atFrame={c.introSelf().startFrame + INTRO_SELF_READALONG_REL_START}
              beats={[1, 2.6, 1]}
              cursor="underline"
              highlightColor={colors.reward}
              inkColor={colors.textNavy}
              itemGap={READALONG_ITEM_GAP}
              itemRadius={READALONG_ITEM_RADIUS}
              lines={[
                [
                  wordGlyph("Hi!", READALONG_WORD_SIZE),
                  wordGlyph("I'm", READALONG_WORD_SIZE),
                  wordGlyph("Sam.", READALONG_WORD_SIZE),
                ],
              ]}
              perBeatDurationFrames={READALONG_PER_BEAT_FRAMES}
              x={STAGE_CX}
              y={READALONG_CY}
            />
          </g>
        ) : null}

        {partActive ? (
          <g {...measureProps("readalong-part")}>
            <ReadAlongHighlight
              activeScale={1.18}
              atFrame={c.partGoodbye().startFrame + READALONG_REL_START}
              cursor="underline"
              highlightColor={colors.reward}
              inkColor={colors.textNavy}
              itemGap={READALONG_ITEM_GAP + 80}
              itemRadius={READALONG_ITEM_RADIUS}
              lines={[
                [
                  wordGlyph("Goodbye!", READALONG_WORD_SIZE),
                  wordGlyph("Bye-Bye!", READALONG_WORD_SIZE),
                ],
              ]}
              perBeatDurationFrames={READALONG_PER_BEAT_FRAMES}
              x={STAGE_CX}
              y={READALONG_CY}
            />
          </g>
        ) : null}

        {/* recap — the three phrases lined up as begin→middle→end, the SAME
            text marks recalled (not new flashcards). The sweep walks the three
            rows in order; the closing coral pulse punctuates the arc. */}
        {recapActive ? (
          <g {...measureProps("readalong-recap")}>
            <ReadAlongHighlight
              activeScale={1.16}
              atFrame={c.recap().startFrame + RECAP_ARC_REL_START}
              cursor="underline"
              highlightColor={colors.reward}
              inkColor={colors.textNavy}
              itemGap={RECAP_ITEM_GAP}
              itemRadius={RECAP_ITEM_RADIUS}
              lineGap={RECAP_LINE_GAP}
              lines={[
                [wordGlyph("Hello!", RECAP_WORD_SIZE)],
                [wordGlyph("I'm Sam.", RECAP_WORD_SIZE)],
                [wordGlyph("Goodbye!", RECAP_WORD_SIZE)],
              ]}
              perBeatDurationFrames={RECAP_PER_BEAT_FRAMES}
              x={STAGE_CX}
              y={RECAP_CY}
            />
          </g>
        ) : null}

        {/* recap closing PulseCircle — pulse #2 of 2, coral punctuation. */}
        {recapActive && recapPulseActive(frame) ? (
          <g {...measureProps("recap-pulse")}>
            <PulseCircle
              color={colors.coral}
              cx={RECAP_PULSE_CX}
              cy={RECAP_PULSE_CY}
              durationInFrames={RECAP_PULSE_DUR}
              radius={RECAP_PULSE_RADIUS}
              repeatCount={RECAP_PULSE_REPEAT}
              spread={RECAP_PULSE_SPREAD}
              startFrame={c.recap().startFrame + RECAP_PULSE_REL_START}
            />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
