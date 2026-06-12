// kptest-greetings-verify — lesson scene (frame-driven, cue-bounded).
//
// TWO kids meet at the school gate, exchange English greetings (Hello / Hi),
// one introduces themselves (I'm Sam — the key-difficult /aɪm/ sound), the child
// practices through echo then independent attempt, they part with farewells
// (Goodbye / Bye-Bye), and a final recap retrieves all three routines.
//
// Every frame derives from cues[id].startFrame + a named layout offset.
// Every easing uses EASE.* from the motion kit. Zero frame literals, zero
// raw motion literals.

import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Breathe, FXDefs } from "../fx";
import { EASE } from "../motion-primitives";
import { interpolate } from "remotion";
import {
  DialogueExchange,
  PulseCircle,
  ReadAlongHighlight,
} from "../motion-primitives";
import { IconAsset, LessonIntroCard } from "../shape-primitives";
import { fontFamily } from "../shape-primitives/shared";
import { colors, typography } from "../theme";
import { measureProps, useMeasureHook } from "./_measure/measureHook";
import { cueMap } from "./timingTypes";
import { kptestGreetingsVerifyCues } from "./kptestGreetingsVerifyLessonTimeline";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CHORAL_READALONG_REL_START,
  EXCHANGE_REL_START,
  FACE_WIDTH,
  FAREWELL_READALONG_REL_START,
  FIGURE_RADIUS,
  GATE_ARCH_HEIGHT,
  GATE_FADE_IN_DUR,
  GATE_FADE_REL_START,
  GATE_PILLAR_H,
  GATE_PILLAR_LEFT_X,
  GATE_PILLAR_RIGHT_X,
  GATE_PILLAR_W,
  GATE_TOP_Y,
  GAP_GLOW_REL_START,
  IM_SLOW_READALONG_REL_START,
  INTER_TURN_GAP,
  INTRO_CARD_DUR,
  INTRO_CARD_FADE_OUT_DUR,
  INTRO_CARD_REL_START,
  KID_A_CX,
  KID_B_CX,
  NAMECARD_CY,
  NAMECARD_FONT,
  NAMECARD_H,
  NAMECARD_W,
  PARTING_DISTANCE,
  PER_TURN_FRAMES,
  PREDICTIVE_PAUSE_FRAMES,
  READALONG_CY,
  READALONG_ITEM_GAP,
  READALONG_ITEM_RADIUS,
  READALONG_PER_BEAT_FRAMES,
  READALONG_REL_START,
  READALONG_WORD_SIZE,
  RECAP_CY,
  RECAP_ITEM_GAP,
  RECAP_ITEM_RADIUS,
  RECAP_LINE_GAP,
  RECAP_PER_BEAT_FRAMES,
  RECAP_PULSE_BELOW_OFFSET,
  RECAP_PULSE_CX,
  RECAP_PULSE_DUR,
  RECAP_PULSE_RADIUS,
  RECAP_PULSE_REL_START,
  RECAP_PULSE_REPEAT,
  RECAP_PULSE_SPREAD,
  RECAP_STACK_REL_START,
  RECAP_WORD_SIZE,
  SPEAKER_GAP,
  STAGE_CX,
  STAGE_CY,
  STAGE_FADE_IN_DUR,
  TITLE_CX,
  TITLE_CY,
  TITLE_SIZE,
  YOUR_TURN_GLOW_DUR,
  YOUR_TURN_GLOW_REL_START,
} from "./kptestGreetingsVerify/layout";

// ---------------------------------------------------------------------------
// Cue lookup — every absolute frame below derives from cues[id].startFrame +
// a named *_REL_* constant from layout.ts. ZERO master-timeline literals.
// ---------------------------------------------------------------------------
const cues = cueMap(kptestGreetingsVerifyCues);

// ---------------------------------------------------------------------------
// Interpolation helpers.
// ---------------------------------------------------------------------------
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const reveal = (frame: number, start: number, duration: number) =>
  clamp01((frame - start) / Math.max(1, duration));

// ---------------------------------------------------------------------------
// Identity-invariant cast — the SAME two IconAsset face nodes are reused every
// cue (greet → farewell). Kid A = boy-face (left), Kid B = girl-face (right).
// ---------------------------------------------------------------------------
const KID_A_NODE: ReactNode = (
  <IconAsset name="boy-face" variant="color" width={FACE_WIDTH} />
);
const KID_B_NODE: ReactNode = (
  <IconAsset name="girl-face" variant="color" width={FACE_WIDTH} />
);

// ---------------------------------------------------------------------------
// Localized node helpers — bake no copy, the CALLER passes every string.
// ---------------------------------------------------------------------------
const bubbleLine = (text: string): ReactNode => (
  <tspan fontFamily={fontFamily} fontWeight={900}>
    {text}
  </tspan>
);

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

// ---------------------------------------------------------------------------
// Opacity / progress functions — all derived from cue boundaries.
// ---------------------------------------------------------------------------
const introCardProgress = (frame: number): number =>
  reveal(
    frame,
    cues["topic-intro"].startFrame + INTRO_CARD_REL_START,
    INTRO_CARD_DUR,
  );

const introCardOpacity = (frame: number): number => {
  const cue = cues["topic-intro"];
  const fadeOut =
    1 - reveal(frame, cue.endFrame - INTRO_CARD_FADE_OUT_DUR, INTRO_CARD_FADE_OUT_DUR);
  return clamp01(fadeOut);
};

// Stage (characters for greet–farewell): ramps in at greet start, holds 1.
const stageOpacity = (frame: number): number => {
  if (frame < cues["greet"].startFrame) return 0;
  return clamp01(
    reveal(frame, cues["greet"].startFrame, STAGE_FADE_IN_DUR),
  );
};

// Gate backdrop: fades in at greet start, holds through farewell.
const gateOpacity = (frame: number): number => {
  if (frame < cues["greet"].startFrame) return 0;
  return clamp01(
    reveal(
      frame,
      cues["greet"].startFrame + GATE_FADE_REL_START,
      GATE_FADE_IN_DUR,
    ),
  );
};

// Recap cast: visible during recap-1 + recap-2.
const recapCastOpacity = (frame: number): number => {
  if (frame < cues["recap-1"].startFrame) return 0;
  if (frame >= cues["recap-2"].endFrame) return 1;
  return 1;
};

// Parting progress: 0→1 during farewell cue's parting window.
const partingProgress = (frame: number): number => {
  const cue = cues["farewell"];
  if (frame < cue.startFrame || frame >= cue.endFrame) return 0;
  return clamp01(
    interpolate(
      frame - cue.startFrame,
      [EXCHANGE_REL_START, EXCHANGE_REL_START + 24],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOutCubic },
    ),
  );
};

export const KptestGreetingsVerifyLessonScene = () => {
  useMeasureHook();
  const frame = useCurrentFrame();

  // ---- Cue activity windows ----
  const greetActive =
    frame >= cues["greet"].startFrame && frame < cues["greet"].endFrame;
  const slowActive =
    frame >= cues["im-slow-model"].startFrame &&
    frame < cues["im-slow-model"].endFrame;
  const choralActive =
    frame >= cues["im-choral-echo"].startFrame &&
    frame < cues["im-choral-echo"].endFrame;
  const gapActive =
    frame >= cues["im-learner-gap"].startFrame &&
    frame < cues["im-learner-gap"].endFrame;
  const farewellActive =
    frame >= cues["farewell"].startFrame &&
    frame < cues["farewell"].endFrame;
  const recap1Active =
    frame >= cues["recap-1"].startFrame && frame < cues["recap-1"].endFrame;
  const recap2Active =
    frame >= cues["recap-2"].startFrame && frame < cues["recap-2"].endFrame;
  const recapActive = recap1Active || recap2Active;

  // ---- Derived values ----
  const introCardP = introCardProgress(frame);
  const introCardOp = introCardOpacity(frame);
  const stageOp = stageOpacity(frame);
  const gateOp = gateOpacity(frame);
  const pProg = partingProgress(frame);

  // Kid positions — part during farewell.
  const kidAx = KID_A_CX - pProg * PARTING_DISTANCE;
  const kidBx = KID_B_CX + pProg * PARTING_DISTANCE;

  // "Your turn" glow for choral echo.
  const yourTurnGlowOp = choralActive
    ? reveal(
        frame,
        cues["im-choral-echo"].startFrame + YOUR_TURN_GLOW_REL_START,
        YOUR_TURN_GLOW_DUR,
      )
    : 0;

  // Learner gap glow.
  const gapGlowOp = gapActive
    ? clamp01(
        0.35 +
          0.2 *
            Math.sin(
              ((frame - cues["im-learner-gap"].startFrame) / 30) * Math.PI,
            ),
      )
    : 0;

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
            SCHOOL-GATE BACKDROP — subtle context (two pillars + low arch).
            Scene-composed SVG, not a registered primitive. Active C1–C5.
            Breathe-wrapped for rule #6 (no frozen frames).
            ================================================================ */}
        {gateOp > 0 ? (
          <g opacity={gateOp * 0.22}>
            <Breathe
              amplitudeScale={0.003}
              bpm={12}
              drift={0.3}
              originX={STAGE_CX}
              originY={STAGE_CY}
              phaseSeed="kpgv-gate"
            >
              {/* Left pillar */}
              <rect
                fill="#E8DCC8"
                height={GATE_PILLAR_H}
                rx={GATE_PILLAR_W / 2}
                width={GATE_PILLAR_W}
                x={GATE_PILLAR_LEFT_X - GATE_PILLAR_W / 2}
                y={GATE_TOP_Y}
              />
              {/* Right pillar */}
              <rect
                fill="#E8DCC8"
                height={GATE_PILLAR_H}
                rx={GATE_PILLAR_W / 2}
                width={GATE_PILLAR_W}
                x={GATE_PILLAR_RIGHT_X - GATE_PILLAR_W / 2}
                y={GATE_TOP_Y}
              />
              {/* Low arch connecting pillar tops */}
              <path
                d={`M${GATE_PILLAR_LEFT_X} ${GATE_TOP_Y} Q${STAGE_CX} ${GATE_TOP_Y - GATE_ARCH_HEIGHT} ${GATE_PILLAR_RIGHT_X} ${GATE_TOP_Y}`}
                fill="none"
                stroke="#E8DCC8"
                strokeWidth={GATE_PILLAR_W * 0.6}
                strokeLinecap="round"
              />
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            INTRO CARD — topic title (zone-intro). Reads ALONE first; cast
            does NOT appear during topic-intro (announce-topic requires).
            Breathe-wrapped for rule #6.
            ================================================================ */}
        {introCardOp > 0 ? (
          <g {...measureProps("intro-card")} opacity={introCardOp}>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.5}
              originX={TITLE_CX}
              originY={TITLE_CY}
              phaseSeed="kpgv-title"
            >
              <LessonIntroCard
                accentColor="coral"
                progress={introCardP}
                section="PEP English · Unit 1"
                subColor="textNavy"
                teaser="say hello · say who you are · say goodbye"
                title="Hello!"
                titleSize={TITLE_SIZE}
                x={TITLE_CX}
                y={TITLE_CY}
              />
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            CHARACTERS — identity-invariant cast for greet through farewell.
            The SAME two IconAsset nodes persist; only gestures change.
            During farewell, they part (x positions drift outward).
            HIDDEN when a DialogueExchange is active (the exchange renders
            its own figure slots — no double-rendering).
            Breathe-wrapped for rule #6.
            ================================================================ */}
        {stageOp > 0 && !recapActive && !greetActive && !slowActive && !farewellActive ? (
          <g opacity={stageOp}>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.5}
              originX={STAGE_CX}
              originY={STAGE_CY}
              phaseSeed="kpgv-cast"
            >
              {/* Kid A (boy-face, left) */}
              <g
                {...measureProps("kid-a")}
                transform={`translate(${kidAx} ${STAGE_CY})`}
              >
                {KID_A_NODE}
              </g>
              {/* Kid B (girl-face, right) */}
              <g
                {...measureProps("kid-b")}
                transform={`translate(${kidBx} ${STAGE_CY})`}
              >
                {KID_B_NODE}
              </g>
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            DIALOGUE EXCHANGES — one per teaching cue (greet, im-slow-model,
            farewell). Each is mounted ONLY during its active cue window.
            Figures use the SAME GIRL/BOY nodes (identity invariant).
            ================================================================ */}

        {/* greet — Kid A: "Hello!" (wave), Kid B: "Hi!" (wave) */}
        {greetActive ? (
          <g {...measureProps("exchange-greet")}>
            <DialogueExchange
              atFrame={cues["greet"].startFrame + EXCHANGE_REL_START}
              emphasisColor={colors.coral}
              figureRadius={FIGURE_RADIUS}
              interTurnGapFrames={INTER_TURN_GAP}
              left={{ figure: KID_A_NODE }}
              perTurnDurationFrames={PER_TURN_FRAMES}
              right={{ figure: KID_B_NODE }}
              speakerGap={SPEAKER_GAP}
              turns={[
                {
                  speaker: "left",
                  line: bubbleLine("Hello!"),
                  gesture: "wave",
                },
                {
                  speaker: "right",
                  line: bubbleLine("Hi!"),
                  gesture: "wave",
                },
              ]}
              x={STAGE_CX}
              y={STAGE_CY}
            />
          </g>
        ) : null}

        {/* im-slow-model — Kid B: "Hi! I'm… Sam" with emphasis on I'm turn.
            PopIn motion="bouncy" fires on this bubble (ONE accent per video).
            PulseCircle fires on "I'm" token inside the component. */}
        {slowActive ? (
          <g {...measureProps("exchange-slow")}>
            <DialogueExchange
              atFrame={
                cues["im-slow-model"].startFrame +
                PREDICTIVE_PAUSE_FRAMES +
                EXCHANGE_REL_START
              }
              emphasisColor={colors.coral}
              figureRadius={FIGURE_RADIUS}
              interTurnGapFrames={INTER_TURN_GAP}
              left={{ figure: KID_A_NODE }}
              perTurnDurationFrames={PER_TURN_FRAMES + 12}
              right={{ figure: KID_B_NODE, nameCard: nameTag("Sam") }}
              speakerGap={SPEAKER_GAP}
              turns={[
                {
                  speaker: "right",
                  line: bubbleLine("Hi! I'm… Sam"),
                  emphasis: true,
                  gesture: "point-self",
                },
              ]}
              x={STAGE_CX}
              y={STAGE_CY}
            />
          </g>
        ) : null}

        {/* farewell — Kid A: "Goodbye!" (wave), Kid B: "Bye-Bye!" (wave).
            Characters are at their PARTED positions (parting motion active). */}
        {farewellActive ? (
          <g {...measureProps("exchange-farewell")}>
            <DialogueExchange
              atFrame={cues["farewell"].startFrame + EXCHANGE_REL_START}
              emphasisColor={colors.coral}
              figureRadius={FIGURE_RADIUS}
              interTurnGapFrames={INTER_TURN_GAP}
              left={{ figure: KID_A_NODE }}
              perTurnDurationFrames={PER_TURN_FRAMES}
              right={{ figure: KID_B_NODE }}
              speakerGap={SPEAKER_GAP + PARTING_DISTANCE * 2 * pProg}
              turns={[
                {
                  speaker: "left",
                  line: bubbleLine("Goodbye!"),
                  gesture: "wave",
                },
                {
                  speaker: "right",
                  line: bubbleLine("Bye-Bye!"),
                  gesture: "wave",
                },
              ]}
              x={STAGE_CX}
              y={STAGE_CY}
            />
          </g>
        ) : null}

        {/* =================================================================
            NAME CARD — "Sam" tag under Kid B during im-slow-model.
            Appears with the dialogue exchange bubble.
            ================================================================ */}
        {slowActive ? (
          <g
            {...measureProps("namecard-sam")}
            opacity={reveal(
              frame,
              cues["im-slow-model"].startFrame +
                PREDICTIVE_PAUSE_FRAMES +
                EXCHANGE_REL_START,
              12,
            )}
          >
            <g transform={`translate(${KID_B_CX} ${NAMECARD_CY})`}>
              {nameTag("Sam")}
            </g>
          </g>
        ) : null}

        {/* =================================================================
            "YOUR TURN" GLOW — sunshine-colored glow behind RAH text during
            im-choral-echo (invitation) and im-learner-gap (silence hold).
            ================================================================ */}
        {yourTurnGlowOp > 0 ? (
          <g opacity={yourTurnGlowOp * 0.45}>
            <ellipse
              cx={STAGE_CX}
              cy={READALONG_CY}
              fill={colors.sunshine}
              rx={220}
              ry={44}
            />
          </g>
        ) : null}
        {gapGlowOp > 0 ? (
          <g opacity={gapGlowOp * 0.4}>
            <ellipse
              cx={STAGE_CX}
              cy={READALONG_CY}
              fill={colors.sunshine}
              rx={200}
              ry={40}
            />
          </g>
        ) : null}

        {/* =================================================================
            READ-ALONG HIGHLIGHTS — one per teaching cue. Cursor tracks the
            spoken tokens; beat weights control dwell per item.
            ================================================================ */}

        {/* greet — "Hello!" "Hi!" */}
        {greetActive ? (
          <g {...measureProps("rah-greet")}>
            <ReadAlongHighlight
              activeScale={1.18}
              atFrame={cues["greet"].startFrame + READALONG_REL_START}
              cursor="ball"
              highlightColor={colors.sunshine}
              inkColor={colors.textNavy}
              itemGap={READALONG_ITEM_GAP}
              itemRadius={READALONG_ITEM_RADIUS}
              lines={[
                [
                  wordGlyph("Hello!", READALONG_WORD_SIZE),
                  wordGlyph("Hi!", READALONG_WORD_SIZE),
                ],
              ]}
              perBeatDurationFrames={READALONG_PER_BEAT_FRAMES}
              x={STAGE_CX}
              y={READALONG_CY}
            />
          </g>
        ) : null}

        {/* im-slow-model — "Hi!" "I'm" "Sam" with beat weight 3 on "I'm".
            Cursor slows dramatically on the key-difficult diphthong. */}
        {slowActive ? (
          <g {...measureProps("rah-slow")}>
            <ReadAlongHighlight
              activeScale={1.28}
              atFrame={
                cues["im-slow-model"].startFrame + IM_SLOW_READALONG_REL_START
              }
              beats={[1, 3, 1]}
              cursor="ball"
              highlightColor={colors.sunshine}
              inkColor={colors.textNavy}
              itemGap={READALONG_ITEM_GAP}
              itemRadius={READALONG_ITEM_RADIUS}
              lines={[
                [
                  wordGlyph("Hi!", READALONG_WORD_SIZE),
                  wordGlyph("I'm", READALONG_WORD_SIZE),
                  wordGlyph("Sam", READALONG_WORD_SIZE),
                ],
              ]}
              perBeatDurationFrames={20}
              x={STAGE_CX}
              y={READALONG_CY}
            />
          </g>
        ) : null}

        {/* im-choral-echo — "I'm" "Sam" with underline cursor + your-turn glow. */}
        {choralActive ? (
          <g {...measureProps("rah-choral")}>
            <ReadAlongHighlight
              activeScale={1.2}
              atFrame={
                cues["im-choral-echo"].startFrame + CHORAL_READALONG_REL_START
              }
              cursor="underline"
              dimPast={false}
              highlightColor={colors.sunshine}
              inkColor={colors.textNavy}
              itemGap={READALONG_ITEM_GAP}
              itemRadius={READALONG_ITEM_RADIUS}
              lines={[
                [
                  wordGlyph("I'm", READALONG_WORD_SIZE),
                  wordGlyph("Sam", READALONG_WORD_SIZE),
                ],
              ]}
              perBeatDurationFrames={14}
              x={STAGE_CX}
              y={READALONG_CY}
            />
          </g>
        ) : null}

        {/* im-learner-gap — "I'm" "Sam" with cursor:none (inactive).
            Text stays visible as the "your turn" affordance through silence. */}
        {gapActive ? (
          <g {...measureProps("rah-gap")}>
            <ReadAlongHighlight
              activeScale={1.15}
              atFrame={
                cues["im-learner-gap"].startFrame + GAP_GLOW_REL_START
              }
              cursor="none"
              dimPast={false}
              highlightColor={colors.sunshine}
              inkColor={colors.textNavy}
              itemGap={READALONG_ITEM_GAP}
              itemRadius={READALONG_ITEM_RADIUS}
              lines={[
                [
                  wordGlyph("I'm", READALONG_WORD_SIZE),
                  wordGlyph("Sam", READALONG_WORD_SIZE),
                ],
              ]}
              perBeatDurationFrames={14}
              x={STAGE_CX}
              y={READALONG_CY}
            />
          </g>
        ) : null}

        {/* farewell — "Goodbye!" "Bye-Bye!" */}
        {farewellActive ? (
          <g {...measureProps("rah-farewell")}>
            <ReadAlongHighlight
              activeScale={1.18}
              atFrame={
                cues["farewell"].startFrame + FAREWELL_READALONG_REL_START
              }
              cursor="ball"
              highlightColor={colors.sunshine}
              inkColor={colors.textNavy}
              itemGap={READALONG_ITEM_GAP + 60}
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

        {/* =================================================================
            RECAP — single ReadAlongHighlight spanning recap-1 + recap-2.
            Three phrases as three lines; beat weights give "I'm" extra dwell.
            Single live marker on currently-spoken item (dimPast:true).
            ================================================================ */}
        {recapActive ? (
          <g {...measureProps("rah-recap")}>
            <ReadAlongHighlight
              activeScale={1.18}
              atFrame={cues["recap-1"].startFrame + RECAP_STACK_REL_START}
              beats={[1, 1, 1, 3, 1, 1, 1]}
              cursor="ball"
              dimPast={true}
              highlightColor={colors.sunshine}
              inkColor={colors.textNavy}
              itemGap={RECAP_ITEM_GAP}
              itemRadius={RECAP_ITEM_RADIUS}
              lineGap={RECAP_LINE_GAP}
              lines={[
                [
                  wordGlyph("Hello!", RECAP_WORD_SIZE),
                  wordGlyph("Hi!", RECAP_WORD_SIZE),
                ],
                [
                  wordGlyph("I'm", RECAP_WORD_SIZE),
                  wordGlyph("Sam", RECAP_WORD_SIZE),
                ],
                [
                  wordGlyph("Goodbye!", RECAP_WORD_SIZE),
                  wordGlyph("Bye-Bye!", RECAP_WORD_SIZE),
                ],
              ]}
              perBeatDurationFrames={RECAP_PER_BEAT_FRAMES}
              x={STAGE_CX}
              y={RECAP_CY}
            />
          </g>
        ) : null}

        {/* Recap emphasis pulse — positioned BELOW the recap text stack
            to avoid collision with the ReadAlongHighlight rows. Fires
            near the end of the recap as a coral punctuation accent. */}
        {recapActive &&
        frame >= cues["recap-1"].startFrame + RECAP_PULSE_REL_START ? (
          <g {...measureProps("recap-pulse")}>
            <PulseCircle
              color={colors.coral}
              cx={RECAP_PULSE_CX}
              cy={RECAP_CY + RECAP_LINE_GAP + RECAP_PULSE_BELOW_OFFSET}
              durationInFrames={RECAP_PULSE_DUR}
              radius={RECAP_PULSE_RADIUS}
              repeatCount={RECAP_PULSE_REPEAT}
              spread={RECAP_PULSE_SPREAD}
              startFrame={cues["recap-1"].startFrame + RECAP_PULSE_REL_START}
            />
          </g>
        ) : null}

        {/* =================================================================
            RECAP CAST — the two kids stay present during recap (continuity).
            Quiet — no speech bubbles. Breathe-wrapped for rule #6.
            At their PARTED positions (post-farewell).
            ================================================================ */}
        {recapActive ? (
          <g opacity={recapCastOpacity(frame)}>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              drift={0.5}
              originX={STAGE_CX}
              originY={STAGE_CY}
              phaseSeed="kpgv-recap-cast"
            >
              <g
                {...measureProps("recap-kid-a")}
                transform={`translate(${KID_A_CX - PARTING_DISTANCE} ${STAGE_CY})`}
              >
                {KID_A_NODE}
              </g>
              <g
                {...measureProps("recap-kid-b")}
                transform={`translate(${KID_B_CX + PARTING_DISTANCE} ${STAGE_CY})`}
              >
                {KID_B_NODE}
              </g>
            </Breathe>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
