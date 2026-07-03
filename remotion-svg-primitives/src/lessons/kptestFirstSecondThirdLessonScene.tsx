// kptest-first-second-third — lesson scene (Wave 4a composer).
// ZERO frame literals: every frame = cues[id].startFrame + named layout offset.
// ZERO raw easing literals: every curve = EASE.* / SPRING.* from motion-primitives.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { AlignedLessonCue } from "@studio/narration-kit";
import { makeCueAccessors } from "./_cues/cueAccessors";

import { colors } from "../theme";
import { EASE } from "../motion-primitives/curves";
import { OrderedRowSpotlight } from "../motion-primitives/OrderedRowSpotlight";
import { PulseCircle } from "../motion-primitives/PulseCircle";
import { SparkleBurst } from "../motion-primitives/SparkleBurst";
import {
  CountableObject,
  IconAsset,
  LessonIntroCard,
  OrdinalLabelToken,
} from "../shape-primitives";
import { Breathe, FXDefs, GlowPulse } from "../fx";
import { measureProps, useMeasureHook } from "./_measure/measureHook";

import {
  ANIMAL_CX,
  ANIMAL_CY,
  ANIMAL_H,
  ANIMAL_STEP_FORWARD_DX,
  ANIMAL_WALK_DUR,
  ANIMAL_WALK_ENTER_FROM_X,
  ANIMAL_WALK_REL_START,
  ANIMAL_SETTLE_DUR,
  ASK_AFFORDANCE_PULSE_REL,
  ASK_AFFORDANCE_REL,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CHIP_ATTACH_REL_COUNT,
  CHIP_ATTACH_REL_NAME_FIRST,
  CHIP_H,
  CHIP_PULSE_DUR,
  CHIP_W,
  CHIP_Y,
  FLAG_CX,
  FLAG_CY,
  FLAG_H,
  FLAG_W,
  GROUND_Y,
  INTRO_CARD_CX,
  INTRO_CARD_CY,
  INTRO_REVEAL_DUR,
  INTRO_REVEAL_START_REL,
  RECAP_FINGER_REL,
  REVEAL_STEP_BACK_DUR,
  REVEAL_STEP_BACK_REL_OFFSET,
  REVEAL_STEP_DWELL,
  REVEAL_STEP_FORWARD_DUR,
  REVEAL_STEP_FORWARD_REL,
  SPARKLE_REL_REVEAL_SECOND,
  SWEEP_STEP_FRAMES,
  ZONE_PROMPT,
} from "./kptestFirstSecondThird/layout";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const clamp = (t: number): number => Math.min(1, Math.max(0, t));

const progressBetween = (
  frame: number,
  startFrame: number,
  durationFrames: number,
): number => clamp((frame - startFrame) / Math.max(1, durationFrames));

// Snap pop-in scale: 0→1 over `dur` frames from `relStart` after cueStart
const popScale = (
  frame: number,
  cueStart: number,
  relStart: number,
  dur: number,
): number => {
  const t = progressBetween(frame, cueStart + relStart, dur);
  return interpolate(t, [0, 1], [0, 1], { easing: EASE.outCubic });
};

// Chip word-pulse: a tiny scale-pulse (1→1.18→1) over `dur` frames from `absFrame`
const chipWordPulse = (frame: number, absFrame: number, dur: number): number => {
  const t = progressBetween(frame, absFrame, dur);
  return interpolate(t, [0, 0.4, 1], [1, 1.18, 1], { easing: EASE.balanced });
};

// Walk-in x: from stage-right into target x
const walkInX = (
  frame: number,
  cueStart: number,
  targetX: number,
): number => {
  const walkStart = cueStart + ANIMAL_WALK_REL_START;
  const walkEnd = walkStart + ANIMAL_WALK_DUR;
  const settleEnd = walkEnd + ANIMAL_SETTLE_DUR;
  if (frame < walkStart) return ANIMAL_WALK_ENTER_FROM_X;
  if (frame <= walkEnd) {
    const t = progressBetween(frame, walkStart, ANIMAL_WALK_DUR);
    return interpolate(t, [0, 1], [ANIMAL_WALK_ENTER_FROM_X, targetX], {
      easing: EASE.inOutCubic,
    });
  }
  if (frame <= settleEnd) {
    // tiny settle bounce (overcorrect slightly then back)
    const t = progressBetween(frame, walkEnd, ANIMAL_SETTLE_DUR);
    return interpolate(t, [0, 0.5, 1], [targetX, targetX - 8, targetX], {
      easing: EASE.outCubic,
    });
  }
  return targetX;
};

// Step-forward x offset (reveal cues: animal dips out of line toward viewer)
const revealStepX = (
  frame: number,
  revealCueStart: number,
): number => {
  const fwdStart = revealCueStart + REVEAL_STEP_FORWARD_REL;
  const fwdEnd = fwdStart + REVEAL_STEP_FORWARD_DUR;
  const dwellEnd = fwdEnd + REVEAL_STEP_DWELL;
  const backStart = revealCueStart + REVEAL_STEP_BACK_REL_OFFSET;
  const backEnd = backStart + REVEAL_STEP_BACK_DUR;

  if (frame < fwdStart) return 0;
  if (frame <= fwdEnd) {
    const t = progressBetween(frame, fwdStart, REVEAL_STEP_FORWARD_DUR);
    return -interpolate(t, [0, 1], [0, ANIMAL_STEP_FORWARD_DX], { easing: EASE.inOutCubic });
  }
  if (frame <= dwellEnd) return -ANIMAL_STEP_FORWARD_DX;
  if (frame >= backStart && frame <= backEnd) {
    const t = progressBetween(frame, backStart, REVEAL_STEP_BACK_DUR);
    return -interpolate(t, [0, 1], [ANIMAL_STEP_FORWARD_DX, 0], { easing: EASE.inOutCubic });
  }
  if (frame > backEnd) return 0;
  // between dwell-end and back-start: still forward
  return -ANIMAL_STEP_FORWARD_DX;
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

// One queued animal with walk-in and optional reveal step
const QueuedAnimal: React.FC<{
  frame: number;
  animalIdx: number;
  variant: "animal" | "fish" | "fruit";
  arriveCueStart: number;
  revealCueStart: number | null;
  visible: boolean;
}> = ({ frame, animalIdx, variant, arriveCueStart, revealCueStart, visible }) => {
  if (!visible) return null;

  const targetX = ANIMAL_CX[animalIdx];
  const currentX = walkInX(frame, arriveCueStart, targetX);
  const stepOffset = revealCueStart !== null ? revealStepX(frame, revealCueStart) : 0;
  const finalX = currentX + stepOffset;

  return (
    <g
      {...measureProps(`animal-${animalIdx + 1}`)}
      transform={`translate(${finalX},${ANIMAL_CY})`}
    >
      <CountableObject
        variant={variant}
        x={0}
        y={0}
        size={ANIMAL_H}
      />
    </g>
  );
};

// An ordinal chip that pops in at a cue-relative offset and optionally pulses
const OrdinalChip: React.FC<{
  frame: number;
  animalIdx: number;
  ordinalValue: string;
  attachAbsFrame: number;
  pulseAbsFrame: number | null;
  visible: boolean;
}> = ({ frame, animalIdx, ordinalValue, attachAbsFrame, pulseAbsFrame, visible }) => {
  if (!visible || frame < attachAbsFrame) return null;

  const attachProgress = progressBetween(frame, attachAbsFrame, 9);
  const scale = interpolate(attachProgress, [0, 1], [0, 1], { easing: EASE.outCubic });

  // Word-pulse: fires when the word is spoken
  const pulse = pulseAbsFrame !== null ? chipWordPulse(frame, pulseAbsFrame, CHIP_PULSE_DUR) : 1;

  return (
    <g
      {...measureProps(`chip-${animalIdx + 1}`)}
      transform={`translate(${ANIMAL_CX[animalIdx]},${CHIP_Y}) scale(${scale * pulse})`}
    >
      <OrdinalLabelToken
        prefix="第"
        value={ordinalValue}
        width={CHIP_W}
        height={CHIP_H}
        x={0}
        y={0}
      />
    </g>
  );
};

// Your-turn affordance (ask cues): question-mark-circle + pulse-circle + prompt label
const YourTurnAffordance: React.FC<{
  frame: number;
  cueStart: number;
  visible: boolean;
}> = ({ frame, cueStart, visible }) => {
  if (!visible) return null;

  const scale = popScale(frame, cueStart, ASK_AFFORDANCE_REL, 9);
  if (scale === 0) return null;

  const cx = ZONE_PROMPT.x + ZONE_PROMPT.w / 2;
  const cy = ZONE_PROMPT.y + ZONE_PROMPT.h / 2;

  const pulseStart = cueStart + ASK_AFFORDANCE_PULSE_REL;

  return (
    <g style={{ opacity: scale }}>
      {/* Pulse circle draws the eye */}
      <PulseCircle
        cx={cx}
        cy={cy}
        radius={44}
        color={colors.coral}
        startFrame={pulseStart}
        repeatCount={8}
      />
      {/* Question-mark-circle icon */}
      <IconAsset
        name="question-mark-circle"
        x={cx - 40}
        y={cy - 40}
        width={80}
        height={80}
        tint={colors.coral}
      />
      {/* Prompt label: "轮到你了" */}
      <text
        x={cx}
        y={cy + 64}
        textAnchor="middle"
        fontSize={36}
        fill={colors.textNavy}
        fontFamily="Arial Rounded MT Bold, Avenir Next, system-ui"
        fontWeight={700}
      >
        轮到你了
      </text>
    </g>
  );
};

// Counting finger / pointer for recap-invite
const RecapPointer: React.FC<{
  frame: number;
  cueStart: number;
  visible: boolean;
}> = ({ frame, cueStart, visible }) => {
  if (!visible) return null;
  const progress = progressBetween(frame, cueStart + RECAP_FINGER_REL, 18);
  if (progress === 0) return null;

  return (
    <g style={{ opacity: progress }}>
      {/* Pointer hand arrow poised at the flag, ready to sweep right */}
      {/* Uses PointerHandArrow indirectly via the scene — pure SVG approach here
          for zone-marks context: pointer sits in zone-marks, pointing right. */}
      <text
        x={FLAG_CX + FLAG_W / 2 + 20}
        y={ANIMAL_CY - ANIMAL_H / 2 - 10}
        fontSize={48}
        fill={colors.textNavy}
        opacity={0.85}
      >
        👆
      </text>
    </g>
  );
};

// ─── MAIN SCENE ──────────────────────────────────────────────────────────────

export const KptestFirstSecondThirdLessonScene: React.FC<{
  cues: readonly AlignedLessonCue[];
}> = ({ cues: cuesArray }) => {
  const frame = useCurrentFrame();
  useMeasureHook();

  // Throwing cue accessors — a wrong/stale id THROWS (naming it + valid ids),
  // never a silent frame-0 fallback (self-scan C3).
  const { cStart, cEnd } = makeCueAccessors(cuesArray);

  // ─── VISIBILITY gates (each element is live once its arrive cue starts) ───
  const introVisible = frame >= cStart("intro") && frame <= cEnd("intro");
  const animal1Visible = frame >= cStart("arrive-first");
  const animal2Visible = frame >= cStart("arrive-second");
  const animal3Visible = frame >= cStart("arrive-third");

  // Chips: visible from attach point onward
  const chip1AttachAbs = cStart("name-first") + CHIP_ATTACH_REL_NAME_FIRST;
  const chip2AttachAbs = cStart("count-second") + CHIP_ATTACH_REL_COUNT;
  const chip3AttachAbs = cStart("count-third") + CHIP_ATTACH_REL_COUNT;

  const chip1Visible = frame >= chip1AttachAbs;
  const chip2Visible = frame >= chip2AttachAbs;
  const chip3Visible = frame >= chip3AttachAbs;

  // ─── SWEEP (count-second, count-third, recap-count) ──────────────────────
  // OrderedRowSpotlight takes atFrame = frame - cue start (local cue frame)
  const countSecondLocal = frame - cStart("count-second");
  const countThirdLocal = frame - cStart("count-third");
  const recapCountLocal = frame - cStart("recap-count");

  const showCountSecond =
    frame >= cStart("count-second") && frame < cStart("arrive-third");
  const showCountThird =
    frame >= cStart("count-third") && frame < cStart("ask-second");
  const showRecapCount =
    frame >= cStart("recap-count") && frame < cEnd("recap-count");

  // ─── REVEAL: animal 2 & 3 step-forward (only during their reveal cues) ───
  const revealSecondActive =
    frame >= cStart("reveal-second") && frame < cEnd("reveal-second");
  const revealThirdActive =
    frame >= cStart("reveal-third") && frame < cEnd("reveal-third");

  // ─── CHIP GLOW PULSE (reveal cues) ───────────────────────────────────────
  const chip2GlowActive = revealSecondActive;
  const chip3GlowActive = revealThirdActive;

  // ─── SPARKLE BURST (reveal-second only) ──────────────────────────────────
  const sparkle2Abs = cStart("reveal-second") + SPARKLE_REL_REVEAL_SECOND;

  // ─── INTRO REVEAL ────────────────────────────────────────────────────────
  const introProgress = progressBetween(
    frame,
    cStart("intro") + INTRO_REVEAL_START_REL,
    INTRO_REVEAL_DUR,
  );

  // ─── ASK AFFORDANCE ──────────────────────────────────────────────────────
  const askSecondActive =
    frame >= cStart("ask-second") && frame < cEnd("ask-second");
  const askThirdActive =
    frame >= cStart("ask-third") && frame < cEnd("ask-third");

  // ─── RECAP INVITE ────────────────────────────────────────────────────────
  const recapInviteActive =
    frame >= cStart("recap-invite") && frame < cStart("recap-count");

  // ─── CHIP WORD-PULSE ABS FRAMES (fired on spoken word) ───────────────────
  // name-first: "排第一" at narration tail — ~90% of narrationFrames=96 → frame 86
  const chip1PulseAbs = cStart("name-first") + 86;
  // count-second: "第一" ~ frame 48 into cue, "第二" at attach
  const chip1PulseCountSecond = cStart("count-second") + SWEEP_STEP_FRAMES;
  // count-second: "第二" spoken ~ 第一 step + step frames = first step + one more
  const chip2PulseAbs = cStart("count-second") + CHIP_ATTACH_REL_COUNT + 6;
  // count-third: chip pulses per spoken word
  const chip1PulseCountThird = cStart("count-third") + SWEEP_STEP_FRAMES;
  const chip2PulseCountThird = cStart("count-third") + SWEEP_STEP_FRAMES * 2;
  const chip3PulseAbs = cStart("count-third") + CHIP_ATTACH_REL_COUNT + SWEEP_STEP_FRAMES * 2 + 6;
  // reveal cues: chips pulse as confirm utterance
  const chip2RevealPulse = cStart("reveal-second") + 15;
  const chip3RevealPulse = cStart("reveal-third") + 15;
  // recap-count: three ordinals at choral pace (~46 frames apart)
  const chip1RecapPulse = cStart("recap-count") + SWEEP_STEP_FRAMES * 0;
  const chip2RecapPulse = cStart("recap-count") + SWEEP_STEP_FRAMES * 1;
  const chip3RecapPulse = cStart("recap-count") + SWEEP_STEP_FRAMES * 2;

  // Determine active pulse abs frame for each chip at this frame
  const chip1ActivePulse = [
    chip1PulseAbs,
    chip1PulseCountSecond,
    chip1PulseCountThird,
    chip1RecapPulse,
  ].find((abs) => Math.abs(frame - abs) <= CHIP_PULSE_DUR / 2) ?? null;

  const chip2ActivePulse = [
    chip2PulseAbs,
    chip2PulseCountThird,
    chip2RevealPulse,
    chip2RecapPulse,
  ].find((abs) => Math.abs(frame - abs) <= CHIP_PULSE_DUR / 2) ?? null;

  const chip3ActivePulse = [
    chip3PulseAbs,
    chip3RevealPulse,
    chip3RecapPulse,
  ].find((abs) => Math.abs(frame - abs) <= CHIP_PULSE_DUR / 2) ?? null;

  // OrderedRowSpotlight item array (built from currently visible animals)
  const spotlightItems2 = [
    <CountableObject key="a1" variant="animal" size={ANIMAL_H} x={0} y={0} />,
    <CountableObject key="a2" variant="fish" size={ANIMAL_H} x={0} y={0} />,
  ];
  const spotlightItems3 = [
    <CountableObject key="a1" variant="animal" size={ANIMAL_H} x={0} y={0} />,
    <CountableObject key="a2" variant="fish" size={ANIMAL_H} x={0} y={0} />,
    <CountableObject key="a3" variant="fruit" size={ANIMAL_H} x={0} y={0} />,
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* FX filter defs — required for GlowPulse, Sparkle (Breathe does not need it) */}
        <FXDefs />

        {/* ──── INTRO CARD (time-disjoint from queue) ──────────────────── */}
        {introVisible && (
          <g {...measureProps("intro-card")}>
            <LessonIntroCard
              x={INTRO_CARD_CX}
              y={INTRO_CARD_CY}
              title="排队——第几名？"
              section="认识序数"
              teaser="第一、第二、第三"
              progress={introProgress}
              card
              titleSize={72}
            />
          </g>
        )}

        {/* ──── QUEUE STAGE (arrive-first onwards) ─────────────────────── */}
        {animal1Visible && (
          <>
            {/* Ground line */}
            <line
              x1={FLAG_CX + FLAG_W / 2}
              y1={GROUND_Y}
              x2={CANVAS_WIDTH - 60}
              y2={GROUND_Y}
              stroke={colors.textNavy}
              strokeWidth={3}
              opacity={0.3}
            />

            {/* Front marker flag */}
            <g {...measureProps("flag")}>
              <IconAsset
                name="journey-path-flag"
                x={FLAG_CX - FLAG_W / 2}
                y={FLAG_CY - FLAG_H / 2}
                width={FLAG_W}
                height={FLAG_H}
                tint={colors.coral}
              />
            </g>

            {/* ──── CHIPS BREATHE GROUP ──────────────────────────────── */}
            {(chip1Visible || chip2Visible || chip3Visible) && (
              <Breathe
                originX={CANVAS_WIDTH / 2}
                originY={CHIP_Y}
                bpm={15}
                amplitudeScale={0.005}
                phaseSeed="kptest-chips"
                drift={0.3}
              >
                {/* Chip 1: 第一 */}
                <OrdinalChip
                  frame={frame}

                  animalIdx={0}
                  ordinalValue="一"
                  attachAbsFrame={chip1AttachAbs}
                  pulseAbsFrame={chip1ActivePulse}
                  visible={chip1Visible}
                />

                {/* Chip 2: 第二 — with optional GlowPulse on reveal */}
                {chip2Visible && (
                  chip2GlowActive ? (
                    <g {...measureProps("chip-2")} transform={`translate(${ANIMAL_CX[1]},${CHIP_Y})`}>
                      <GlowPulse startFrame={cStart("reveal-second")}>
                        <OrdinalLabelToken
                          prefix="第"
                          value="二"
                          width={CHIP_W}
                          height={CHIP_H}
                          x={0}
                          y={0}
                        />
                      </GlowPulse>
                    </g>
                  ) : (
                    <OrdinalChip
                      frame={frame}
    
                      animalIdx={1}
                      ordinalValue="二"
                      attachAbsFrame={chip2AttachAbs}
                      pulseAbsFrame={chip2ActivePulse}
                      visible
                    />
                  )
                )}

                {/* Chip 3: 第三 — with optional GlowPulse on reveal */}
                {chip3Visible && (
                  chip3GlowActive ? (
                    <g {...measureProps("chip-3")} transform={`translate(${ANIMAL_CX[2]},${CHIP_Y})`}>
                      <GlowPulse startFrame={cStart("reveal-third")}>
                        <OrdinalLabelToken
                          prefix="第"
                          value="三"
                          width={CHIP_W}
                          height={CHIP_H}
                          x={0}
                          y={0}
                        />
                      </GlowPulse>
                    </g>
                  ) : (
                    <OrdinalChip
                      frame={frame}
    
                      animalIdx={2}
                      ordinalValue="三"
                      attachAbsFrame={chip3AttachAbs}
                      pulseAbsFrame={chip3ActivePulse}
                      visible
                    />
                  )
                )}
              </Breathe>
            )}

            {/* ──── QUEUE ANIMALS (in a single Breathe group for rule #6) */}
            <Breathe
              originX={CANVAS_WIDTH / 2}
              originY={ANIMAL_CY}
              bpm={15}
              amplitudeScale={0.005}
              phaseSeed="kptest-queue"
              drift={0.5}
            >
              {/* Animal 1 (variant=animal) */}
              <QueuedAnimal
                frame={frame}
                animalIdx={0}
                variant="animal"
                arriveCueStart={cStart("arrive-first")}
                revealCueStart={revealSecondActive ? cStart("reveal-second") : null}
                visible={animal1Visible}
              />

              {/* Animal 2 (variant=fish) */}
              <QueuedAnimal
                frame={frame}
                animalIdx={1}
                variant="fish"
                arriveCueStart={cStart("arrive-second")}
                revealCueStart={revealSecondActive ? cStart("reveal-second") : null}
                visible={animal2Visible}
              />

              {/* Animal 3 (variant=fruit) */}
              <QueuedAnimal
                frame={frame}
                animalIdx={2}
                variant="fruit"
                arriveCueStart={cStart("arrive-third")}
                revealCueStart={revealThirdActive ? cStart("reveal-third") : null}
                visible={animal3Visible}
              />
            </Breathe>

            {/* ──── SPARKLE BURST (reveal-second ONLY) ──────────────── */}
            {frame >= sparkle2Abs && frame < sparkle2Abs + 40 && (
              <SparkleBurst
                x={ANIMAL_CX[1]}
                y={ANIMAL_CY - ANIMAL_H / 2}
                startFrame={sparkle2Abs}
                count={8}
                radius={60}
                color={colors.reward}
              />
            )}
          </>
        )}

        {/* ──── COUNT SWEEP OVERLAY (OrderedRowSpotlight) ────────────── */}
        {/* Center the spotlight on the persistent queue animals.
            2-item center: (ANIMAL_CX[0] + ANIMAL_CX[1]) / 2 = 526.5
            3-item center: (ANIMAL_CX[0] + ANIMAL_CX[2]) / 2 = 653.5
            rowGap matches actual animal spacing so spotlight items overlay queue animals. */}
        {showCountSecond && (
          <g transform={`translate(${(ANIMAL_CX[0] + ANIMAL_CX[1]) / 2},${ANIMAL_CY})`}>
            <OrderedRowSpotlight
              items={spotlightItems2}
              direction="ltr"
              countWalk
              atFrame={countSecondLocal}
              stepDurationFrames={SWEEP_STEP_FRAMES}
              rowGap={ANIMAL_CX[1] - ANIMAL_CX[0]}
              itemRadius={ANIMAL_H / 2}
              ordinalLabel={(pos) => `第${["一", "二"][pos - 1] ?? pos}`}
              spotlightOrdinal={
                countSecondLocal >= SWEEP_STEP_FRAMES ? 2 : 1
              }
              x={0}
              y={0}
            />
          </g>
        )}

        {showCountThird && (
          <g transform={`translate(${(ANIMAL_CX[0] + ANIMAL_CX[2]) / 2},${ANIMAL_CY})`}>
            <OrderedRowSpotlight
              items={spotlightItems3}
              direction="ltr"
              countWalk
              atFrame={countThirdLocal}
              stepDurationFrames={SWEEP_STEP_FRAMES}
              rowGap={ANIMAL_CX[1] - ANIMAL_CX[0]}
              itemRadius={ANIMAL_H / 2}
              ordinalLabel={(pos) => `第${["一", "二", "三"][pos - 1] ?? pos}`}
              spotlightOrdinal={
                countThirdLocal >= SWEEP_STEP_FRAMES * 2
                  ? 3
                  : countThirdLocal >= SWEEP_STEP_FRAMES
                  ? 2
                  : 1
              }
              x={0}
              y={0}
            />
          </g>
        )}

        {showRecapCount && (
          <g transform={`translate(${(ANIMAL_CX[0] + ANIMAL_CX[2]) / 2},${ANIMAL_CY})`}>
            <OrderedRowSpotlight
              items={spotlightItems3}
              direction="ltr"
              countWalk
              atFrame={recapCountLocal}
              stepDurationFrames={SWEEP_STEP_FRAMES}
              rowGap={ANIMAL_CX[1] - ANIMAL_CX[0]}
              itemRadius={ANIMAL_H / 2}
              ordinalLabel={(pos) => `第${["一", "二", "三"][pos - 1] ?? pos}`}
              spotlightOrdinal={
                recapCountLocal >= SWEEP_STEP_FRAMES * 2
                  ? 3
                  : recapCountLocal >= SWEEP_STEP_FRAMES
                  ? 2
                  : 1
              }
              x={0}
              y={0}
            />
          </g>
        )}

        {/* ──── YOUR-TURN AFFORDANCE (ask cues) ──────────────────────── */}
        <YourTurnAffordance
          frame={frame}
          cueStart={cStart("ask-second")}
          visible={askSecondActive}
        />
        <YourTurnAffordance
          frame={frame}
          cueStart={cStart("ask-third")}
          visible={askThirdActive}
        />

        {/* ──── RECAP INVITE POINTER ─────────────────────────────────── */}
        <RecapPointer
          frame={frame}
          cueStart={cStart("recap-invite")}
          visible={recapInviteActive}
        />
      </svg>
    </AbsoluteFill>
  );
};
