import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Drag,
  EASE,
  PopIn,
  Smear,
} from "../motion-primitives";
import { Breathe, FXDefs, GlintFlash } from "../fx";
import {
  BundleWrap,
  CountStepIndicator,
  LabelCallout,
  StepTally,
  StickGroup,
  TeacherMark,
  LessonIntroCard,
  type BoilConfig,
  type SettleConfig,
  type TeacherMarkAnchor,
  type TeacherMarkKind,
  type TeacherMarkPathParams,
} from "../shape-primitives";
import {
  useStyle,
  useStyleFilter,
  useStylePalette,
} from "../styles";
import { colors, typography } from "../theme";
import { cueMap, type AlignedLessonCue } from "@studio/narration-kit";
import { useMeasureHook, measureProps } from "./_measure/measureHook";
import {
  BADGE_Y,
  BUNDLE_FINAL_WIDTH,
  BUNDLE_GAP,
  BUNDLE_OFFSCREEN_RIGHT_CX,
  BUNDLE_THREE_LEFT_CX,
  BUNDLE_THREE_MID_CX,
  BUNDLE_THREE_RIGHT_CX,
  BUNDLE_TWO_LEFT_CX,
  BUNDLE_TWO_RIGHT_CX,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COUNT_BADGE_BIG_SIZE,
  COUNT_BADGE_SIZE,
  FAST_BADGES_FADE_DUR,
  FAST_COMPRESS_DUR,
  FAST_COMPRESS_REL_START,
  FAST_GLINT_DUR,
  FAST_GLINT_REL_START,
  FAST_ONE_BADGE_DUR,
  FAST_ONE_BADGE_REL_START,
  FAST_RIGHT_TALLY_DUR,
  FAST_RIGHT_TALLY_REL_START,
  FAST_SLOW_TALLY_SLIDE_DUR,
  FAST_VS_MARK_DUR,
  FAST_VS_MARK_REL_START,
  FAST_WRAP_DUR,
  FAST_WRAP_REL_START,
  getRowStickX,
  LABEL_X,
  LABEL_Y,
  RECALL_BUNDLE_BOUNCY_DUR,
  RECALL_LABEL_DUR,
  RECALL_LABEL_REL_START,
  ROW_GAP,
  SLOW_BADGE_BASE_DELAY,
  SLOW_COUNT_BADGE_FADE_DUR,
  SLOW_COUNT_FLASH,
  SLOW_COUNT_STRIDE,
  SLOW_TALLY_DUR,
  SLOW_TALLY_REL_START,
  STICKS_ORIGIN_X,
  STICKS_ORIGIN_Y,
  STICK_COUNT,
  STICK_LENGTH,
  STICK_THICKNESS,
  TALLY_LEFT_CX,
  TALLY_RIGHT_CX,
  TALLY_Y,
  THREE_BADGE_C_DUR,
  THREE_BADGE_C_REL_START,
  THREE_BUNDLE_C_SLIDE_DUR,
  THREE_BUNDLE_C_SLIDE_REL_START,
  THREE_BUNDLE_SHIFT_DUR,
  THREE_BUNDLE_SHIFT_REL_START,
  THREE_LABEL_DUR,
  THREE_LABEL_REL_START,
  THREE_SMEAR_REL_END,
  THREE_SMEAR_REL_START,
  TWO_BADGE_A_DUR,
  TWO_BADGE_A_REL_START,
  TWO_BADGE_B_DUR,
  TWO_BADGE_B_REL_START,
  TWO_BUNDLE_A_SLIDE_DUR,
  TWO_BUNDLE_A_SLIDE_REL_START,
  TWO_BUNDLE_B_SLIDE_DUR,
  TWO_BUNDLE_B_SLIDE_REL_START,
  TWO_EXIT_DUR,
  TWO_LABEL_DUR,
  TWO_LABEL_REL_START,
  TWO_SMEAR_REL_END,
  TWO_SMEAR_REL_START,
  UNTIE_LABEL_EXIT_DUR,
  UNTIE_OPEN_DUR,
  UNTIE_OPEN_REL_START,
  RECAP_LABEL_FADE_DUR,
  RECAP_LABEL_FADE_REL_START,
  RECAP_PULSE_REL_START,
  RECAP_UNDERLINE_DUR,
  RECAP_UNDERLINE_REL_START,
  VS_MARK_X,
  VS_MARK_Y,
} from "./kp2CountingByTens/layout";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Kp2CueId =
  | "intro"
  | "bundle-recall"
  | "untie-reveal"
  | "slow-count-ones"
  | "fast-vs-slow"
  | "two-tens"
  | "three-tens"
  | "recap";

type SketchMarkSpec = {
  anchor: TeacherMarkAnchor;
  boil?: BoilConfig;
  cueId: Kp2CueId;
  drawDuration: number;
  drawRelStart: number;
  fadeOutRelEnd: number;
  id: string;
  jitterSeed: number;
  kind: TeacherMarkKind;
  pathParams?: TeacherMarkPathParams;
  settle?: SettleConfig;
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = (t) => t,
) =>
  interpolate(frame, [start, Math.max(start + 1, end)], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const reveal = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE.outCubic,
) => progress(frame, start, start + Math.max(1, duration), easing);

const clampToCue = (start: number, duration: number, cueEnd: number) => {
  const cappedDuration = Math.max(1, Math.min(duration, cueEnd - start));
  return { duration: cappedDuration, start };
};

// ─── SKETCH MARKS SPEC ───────────────────────────────────────────────────────
const SKETCH_MARKS: SketchMarkSpec[] = [
  {
    anchor: { kind: "point", x: VS_MARK_X, y: VS_MARK_Y },
    boil: { holdFrames: 5, magnitude: 4 },
    cueId: "fast-vs-slow",
    drawDuration: FAST_VS_MARK_DUR,
    drawRelStart: FAST_VS_MARK_REL_START,
    fadeOutRelEnd: 8,
    id: "mark-fast-vs-slow-vs",
    jitterSeed: 11,
    kind: "vs-mark",
    pathParams: { arrowheadSize: 16 },
    settle: { magnitude: 0.08 },
  },
  {
    anchor: {
      end: { x: 760, y: 632 },
      kind: "span",
      start: { x: 640, y: 632 },
    },
    boil: { holdFrames: 5, magnitude: 5 },
    cueId: "recap",
    drawDuration: RECAP_UNDERLINE_DUR,
    drawRelStart: RECAP_UNDERLINE_REL_START,
    fadeOutRelEnd: 8,
    id: "mark-recap-geng-kuai-underline",
    jitterSeed: 12,
    kind: "underline",
    settle: { magnitude: 0.08 },
  },
];

// ─── SKETCH MARK RENDERER ────────────────────────────────────────────────────
const SketchMark = ({
  frame,
  spec,
  strokeColor,
  cues,
}: {
  frame: number;
  spec: SketchMarkSpec;
  strokeColor: string;
  cues: Record<string, AlignedLessonCue>;
}) => {
  const cue = cues[spec.cueId];
  if (!cue) {
    return null;
  }
  const cueStart = cue.startFrame;
  const cueEnd = cue.endFrame;

  const drawWindow = clampToCue(
    cueStart + spec.drawRelStart,
    spec.drawDuration,
    cueEnd,
  );
  const drawProgress = progress(
    frame,
    drawWindow.start,
    drawWindow.start + drawWindow.duration,
  );

  const fadeOutStart = Math.max(drawWindow.start, cueEnd - spec.fadeOutRelEnd);
  const fadeOut = progress(frame, fadeOutStart, cueEnd);

  if (frame < drawWindow.start || frame > cueEnd) {
    return null;
  }

  const opacity = (1 - fadeOut) * 0.92;
  if (opacity <= 0) {
    return null;
  }

  return (
    <g opacity={opacity / 0.92} {...measureProps(spec.id)}>
      <TeacherMark
        anchor={spec.anchor}
        boil={spec.boil}
        drawProgress={drawProgress}
        jitterSeed={spec.jitterSeed}
        kind={spec.kind}
        pathParams={spec.pathParams}
        settle={spec.settle}
        strokeColor={strokeColor}
        strokeWidth={4}
      />
    </g>
  );
};

// ─── SLOW COUNT BADGE ────────────────────────────────────────────────────────
type SlowBadgeProps = {
  index: number;
  inkColor: string;
  startFrame: number;
  fadeOut: number;
  frame: number;
};

const SlowBadge = ({
  index,
  inkColor,
  startFrame,
  fadeOut,
  frame,
}: SlowBadgeProps) => {
  const appear = reveal(frame, startFrame, SLOW_COUNT_BADGE_FADE_DUR, EASE.outQuint);
  const opacity = appear * fadeOut;
  if (opacity <= 0) {
    return null;
  }
  return (
    <g opacity={opacity} {...measureProps(`badge-${index}`)}>
      <CountStepIndicator
        background={colors.white}
        color={inkColor}
        outlineColor={inkColor}
        progress={appear}
        size={COUNT_BADGE_SIZE}
        value={index + 1}
        x={getRowStickX(index)}
        y={BADGE_Y}
      />
    </g>
  );
};

// ─── SCENE COMPONENT ─────────────────────────────────────────────────────────
export const Kp2CountingByTensLessonScene: React.FC<{
  cues: AlignedLessonCue[];
}> = ({ cues: rawCues }) => {
  const frame = useCurrentFrame();
  useMeasureHook();

  const styleFilter = useStyleFilter();
  const palette = useStylePalette();
  const { activeStyle } = useStyle();

  const cues = cueMap(rawCues);

  const inkColor = palette.ink ?? palette.textNavy ?? colors.textNavy;
  const bgColor =
    activeStyle === "ink-wash"
      ? "transparent"
      : palette.background ?? colors.cream;
  const accentColor = palette.accent ?? colors.coral;

  const cue = (id: Kp2CueId) => cues[id];

  const intro = cue("intro");
  const bundleRecall = cue("bundle-recall");
  const untieReveal = cue("untie-reveal");
  const slowCount = cue("slow-count-ones");
  const fastVsSlow = cue("fast-vs-slow");
  const twoTens = cue("two-tens");
  const threeTens = cue("three-tens");
  const recap = cue("recap");

  if (!intro || !bundleRecall || !untieReveal || !slowCount || !fastVsSlow || !twoTens || !threeTens || !recap) {
    return null;
  }

  // 1. Layout state selection
  const untieOpenStart = untieReveal.startFrame + UNTIE_OPEN_REL_START;
  const untieOpenEnd = untieOpenStart + UNTIE_OPEN_DUR;
  const fastCompressStart = fastVsSlow.startFrame + FAST_COMPRESS_REL_START;
  const fastWrapEnd = fastVsSlow.startFrame + FAST_WRAP_REL_START + FAST_WRAP_DUR;

  let layout: "scatter" | "row" | "bundle";
  if (frame < untieOpenStart) {
    layout = "bundle";
  } else if (frame < untieOpenEnd) {
    layout = frame < untieOpenStart + UNTIE_OPEN_DUR / 2 ? "bundle" : "row";
  } else if (frame < fastCompressStart) {
    layout = "row";
  } else if (frame < fastWrapEnd) {
    const wrapStart = fastVsSlow.startFrame + FAST_WRAP_REL_START;
    layout = frame < wrapStart ? "row" : "bundle";
  } else {
    layout = "bundle";
  }

  // 2. Bouncy scale physics for bundle-recall entry
  const recallScaleProgress = reveal(
    frame,
    bundleRecall.startFrame,
    RECALL_BUNDLE_BOUNCY_DUR,
    EASE.outQuint,
  );
  const recallBouncy = interpolate(
    recallScaleProgress,
    [0, 0.5, 0.8, 1],
    [0.92, 0.96, 1.06, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // 3. Untie transition progress
  const untieT = progress(
    frame,
    untieOpenStart,
    untieOpenEnd,
    EASE.inOutCubic,
  );

  // 4. Compress & wrap transitions in fast-vs-slow
  const compressWindow = clampToCue(
    fastCompressStart,
    FAST_COMPRESS_DUR,
    fastVsSlow.endFrame,
  );
  const compress = progress(
    frame,
    compressWindow.start,
    compressWindow.start + compressWindow.duration,
    EASE.inOutCubic,
  );
  const wrapWindow = clampToCue(
    fastVsSlow.startFrame + FAST_WRAP_REL_START,
    FAST_WRAP_DUR,
    fastVsSlow.endFrame,
  );
  const wrapProgressClimax = progress(
    frame,
    wrapWindow.start,
    wrapWindow.start + wrapWindow.duration,
    EASE.outQuint,
  );

  let wrapProgressMain: number;
  if (frame < untieOpenStart) {
    wrapProgressMain = 1;
  } else if (frame < untieOpenEnd) {
    wrapProgressMain = 1 - untieT;
  } else if (frame < fastVsSlow.startFrame + FAST_WRAP_REL_START) {
    wrapProgressMain = 0;
  } else {
    wrapProgressMain = wrapProgressClimax;
  }

  const wrapVisible = wrapProgressMain > 0.01;

  // 5. Persistent bundle A horizontal position
  const twoSlideAStart = twoTens.startFrame + TWO_BUNDLE_A_SLIDE_REL_START;
  const twoSlideA = reveal(
    frame,
    twoSlideAStart,
    TWO_BUNDLE_A_SLIDE_DUR,
    EASE.inOutCubic,
  );
  const threeShiftStart = threeTens.startFrame + THREE_BUNDLE_SHIFT_REL_START;
  const threeShift = reveal(
    frame,
    threeShiftStart,
    THREE_BUNDLE_SHIFT_DUR,
    EASE.inOutCubic,
  );

  let bundleAX: number;
  if (frame >= threeTens.startFrame) {
    bundleAX = lerp(BUNDLE_TWO_LEFT_CX, BUNDLE_THREE_LEFT_CX, threeShift);
  } else if (frame >= twoTens.startFrame) {
    bundleAX = lerp(STICKS_ORIGIN_X, BUNDLE_TWO_LEFT_CX, twoSlideA);
  } else {
    bundleAX = STICKS_ORIGIN_X;
  }

  // 6. Bundle B (slides in from off-canvas during two-tens)
  const twoSlideBStart = twoTens.startFrame + TWO_BUNDLE_B_SLIDE_REL_START;
  const twoSlideB = reveal(
    frame,
    twoSlideBStart,
    TWO_BUNDLE_B_SLIDE_DUR,
    EASE.outCubic,
  );
  let bundleBX: number | null = null;
  if (frame >= threeTens.startFrame) {
    bundleBX = lerp(BUNDLE_TWO_RIGHT_CX, BUNDLE_THREE_MID_CX, threeShift);
  } else if (frame >= twoTens.startFrame) {
    bundleBX = lerp(BUNDLE_OFFSCREEN_RIGHT_CX, BUNDLE_TWO_RIGHT_CX, twoSlideB);
  }

  // 7. Bundle C (slides in during three-tens)
  const threeSlideCStart = threeTens.startFrame + THREE_BUNDLE_C_SLIDE_REL_START;
  const threeSlideC = reveal(
    frame,
    threeSlideCStart,
    THREE_BUNDLE_C_SLIDE_DUR,
    EASE.outCubic,
  );
  let bundleCX: number | null = null;
  if (frame >= threeTens.startFrame) {
    bundleCX = lerp(
      BUNDLE_OFFSCREEN_RIGHT_CX,
      BUNDLE_THREE_RIGHT_CX,
      threeSlideC,
    );
  }

  // 8. Slow count walk indexing
  let activeIndex: number | undefined;
  let revealUpTo = STICK_COUNT;
  if (
    frame >= slowCount.startFrame &&
    frame < fastVsSlow.startFrame + FAST_COMPRESS_REL_START
  ) {
    const rel = frame - slowCount.startFrame - SLOW_BADGE_BASE_DELAY;
    if (rel >= 0) {
      const idx = Math.min(
        STICK_COUNT - 1,
        Math.floor(rel / SLOW_COUNT_STRIDE),
      );
      activeIndex = idx;
      revealUpTo = Math.min(STICK_COUNT, idx + 1);
      if (rel - idx * SLOW_COUNT_STRIDE > SLOW_COUNT_FLASH) {
        activeIndex = undefined;
      }
    } else {
      activeIndex = undefined;
      revealUpTo = 0;
    }
  } else if (frame < slowCount.startFrame) {
    activeIndex = undefined;
    revealUpTo = STICK_COUNT;
  } else {
    revealUpTo = STICK_COUNT;
  }

  // 9. Slow badges fade out at climax
  const slowBadgesFadeOut =
    1 -
    reveal(
      frame,
      fastVsSlow.startFrame,
      FAST_BADGES_FADE_DUR,
      EASE.outCubic,
    );
  const slowBadgesVisible =
    frame >= slowCount.startFrame + SLOW_BADGE_BASE_DELAY &&
    slowBadgesFadeOut > 0.001;

  // 10. Slow tally entering and fading
  const slowTallyEnter = reveal(
    frame,
    slowCount.startFrame + SLOW_TALLY_REL_START,
    SLOW_TALLY_DUR,
    EASE.outCubic,
  );
  const slowTallyFadeOut =
    1 - reveal(frame, twoTens.startFrame, TWO_EXIT_DUR, EASE.outCubic);
  const slowTallyOpacity = slowTallyEnter * slowTallyFadeOut;

  const slowTallySlideT = reveal(
    frame,
    fastVsSlow.startFrame,
    FAST_SLOW_TALLY_SLIDE_DUR,
    EASE.inOutCubic,
  );
  const slowTallyX = lerp(640, TALLY_LEFT_CX, slowTallySlideT);
  const slowTallyDimMix = slowTallySlideT;

  // 11. Fast tally
  const fastTallyEnter = reveal(
    frame,
    fastVsSlow.startFrame + FAST_RIGHT_TALLY_REL_START,
    FAST_RIGHT_TALLY_DUR,
    EASE.outCubic,
  );
  const fastTallyFadeOut =
    1 - reveal(frame, twoTens.startFrame, TWO_EXIT_DUR, EASE.outCubic);
  const fastTallyOpacity = fastTallyEnter * fastTallyFadeOut;

  // 12. Climax "1" badge
  const climaxOneBadgeEnter = reveal(
    frame,
    fastVsSlow.startFrame + FAST_ONE_BADGE_REL_START,
    FAST_ONE_BADGE_DUR,
    EASE.outCubic,
  );
  const climaxOneBadgeFadeOut =
    1 - reveal(frame, twoTens.startFrame, TWO_EXIT_DUR, EASE.outCubic);
  const climaxOneBadgeOpacity = climaxOneBadgeEnter * climaxOneBadgeFadeOut;

  // 13. Two-tens & three-tens bundle badges
  const twoBadgeA = reveal(
    frame,
    twoTens.startFrame + TWO_BADGE_A_REL_START,
    TWO_BADGE_A_DUR,
    EASE.outCubic,
  );
  const twoBadgeB = reveal(
    frame,
    twoTens.startFrame + TWO_BADGE_B_REL_START,
    TWO_BADGE_B_DUR,
    EASE.outCubic,
  );
  const threeBadgeC = reveal(
    frame,
    threeTens.startFrame + THREE_BADGE_C_REL_START,
    THREE_BADGE_C_DUR,
    EASE.outCubic,
  );

  // 14. Label opacities
  const labelTwoEnter = reveal(
    frame,
    twoTens.startFrame + TWO_LABEL_REL_START,
    TWO_LABEL_DUR,
    EASE.outCubic,
  );
  const labelTwoExit =
    1 -
    reveal(
      frame,
      threeTens.startFrame + THREE_LABEL_REL_START,
      THREE_LABEL_DUR,
      EASE.outCubic,
    );
  const labelTwoOpacity = labelTwoEnter * labelTwoExit;

  const labelThreeEnter = reveal(
    frame,
    threeTens.startFrame + THREE_LABEL_REL_START,
    THREE_LABEL_DUR,
    EASE.outCubic,
  );
  const labelThreeExit =
    1 -
    reveal(
      frame,
      recap.startFrame + RECAP_LABEL_FADE_REL_START,
      RECAP_LABEL_FADE_DUR,
      EASE.outCubic,
    );
  const labelThreeOpacity = labelThreeEnter * labelThreeExit;

  const takeawayEnter = reveal(
    frame,
    recap.startFrame + RECAP_LABEL_FADE_REL_START,
    RECAP_LABEL_FADE_DUR,
    EASE.outCubic,
  );
  const takeawayOpacity = takeawayEnter;

  const recallLabelEnter = reveal(
    frame,
    bundleRecall.startFrame + RECALL_LABEL_REL_START,
    RECALL_LABEL_DUR,
    EASE.outCubic,
  );
  const recallLabelExit =
    1 -
    reveal(
      frame,
      untieReveal.startFrame,
      UNTIE_LABEL_EXIT_DUR,
      EASE.outCubic,
    );
  const recallLabelOpacity = recallLabelEnter * recallLabelExit;

  // 15. Bundle wrap rope heights
  const wrapRopeHeight = BUNDLE_FINAL_WIDTH * 0.32;

  let bundleAScale = 1;
  if (frame < bundleRecall.startFrame + RECALL_BUNDLE_BOUNCY_DUR) {
    bundleAScale = recallBouncy;
  }

  const bundleAVisible = frame >= bundleRecall.startFrame;
  const breathingActive = frame >= recap.startFrame + RECAP_PULSE_REL_START;

  const bundleA = (
    <g transform={`translate(${bundleAX} ${STICKS_ORIGIN_Y}) scale(${bundleAScale})`}>
      <StickGroup
        activeIndex={activeIndex}
        bundleGap={BUNDLE_GAP}
        color={colors.reward}
        compress={frame >= fastVsSlow.startFrame ? compress : 0}
        count={STICK_COUNT}
        layout={layout}
        revealUpTo={revealUpTo}
        rowGap={ROW_GAP}
        seed={7}
        stickLength={STICK_LENGTH}
        stickThickness={STICK_THICKNESS}
      />
      {wrapVisible ? (
        <BundleWrap
          color={accentColor}
          height={wrapRopeHeight}
          knotPosition="top"
          opacity={wrapProgressMain}
          outlineColor={inkColor}
          style="rope"
          width={BUNDLE_FINAL_WIDTH}
          wrapProgress={wrapProgressMain}
        />
      ) : null}
    </g>
  );

  const bundleB =
    bundleBX !== null ? (
      <g transform={`translate(${bundleBX} ${STICKS_ORIGIN_Y})`}>
        <StickGroup
          bundleGap={BUNDLE_GAP}
          color={colors.reward}
          count={STICK_COUNT}
          layout="bundle"
          seed={11}
          stickLength={STICK_LENGTH}
          stickThickness={STICK_THICKNESS}
        />
        <BundleWrap
          color={accentColor}
          height={wrapRopeHeight}
          knotPosition="top"
          outlineColor={inkColor}
          style="rope"
          width={BUNDLE_FINAL_WIDTH}
          wrapProgress={1}
        />
      </g>
    ) : null;

  const bundleC =
    bundleCX !== null ? (
      <g transform={`translate(${bundleCX} ${STICKS_ORIGIN_Y})`}>
        <StickGroup
          bundleGap={BUNDLE_GAP}
          color={colors.reward}
          count={STICK_COUNT}
          layout="bundle"
          seed={19}
          stickLength={STICK_LENGTH}
          stickThickness={STICK_THICKNESS}
        />
        <BundleWrap
          color={accentColor}
          height={wrapRopeHeight}
          knotPosition="top"
          outlineColor={inkColor}
          style="rope"
          width={BUNDLE_FINAL_WIDTH}
          wrapProgress={1}
        />
      </g>
    ) : null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        color: inkColor,
        fontFamily: typography.fontFamily,
        overflow: "hidden",
      }}
    >
      <FXDefs />

      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        {/* === Intro Card === */}
        {frame < cues.intro.endFrame ? (
          <g {...measureProps("intro-card")}>
            <LessonIntroCard
              card
              progress={progress(frame, cues.intro.startFrame, cues.intro.endFrame - 9)}
              section="第一单元"
              teaser="数一数：十个一和一个十"
              title="一捆一捆地数，更快"
              titleSize={72}
              x={640}
              y={360}
            />
          </g>
        ) : null}

        {/* === Teaching tree — styleFilter applies ink-wash displacement === */}
        <g filter={styleFilter}>
          {/* --- Persistent bundle A (lives whole video after intro) --- */}
          {bundleAVisible ? (
            <g {...measureProps("bundle-a")}>
              {breathingActive ? (
                <Breathe
                  amplitudeScale={0.005}
                  bpm={15}
                  originX={bundleAX}
                  originY={STICKS_ORIGIN_Y}
                  phaseSeed="kp2-bundle-a"
                >
                  {bundleA}
                </Breathe>
              ) : (
                bundleA
              )}
            </g>
          ) : null}

          {/* --- Climax glint at re-tie completion (anchored at bow knot) --- */}
          <GlintFlash
            color={colors.coral}
            durationInFrames={FAST_GLINT_DUR}
            size={22}
            startFrame={fastVsSlow.startFrame + FAST_GLINT_REL_START}
            x={STICKS_ORIGIN_X}
            y={STICKS_ORIGIN_Y - wrapRopeHeight - 22}
          />

          {/* --- Bundle B (two-tens onward) --- */}
          {bundleB !== null ? (
            <g {...measureProps("bundle-b")}>
              {breathingActive && bundleBX !== null ? (
                <Breathe
                  amplitudeScale={0.005}
                  bpm={15}
                  originX={bundleBX}
                  originY={STICKS_ORIGIN_Y}
                  phaseSeed="kp2-bundle-b"
                >
                  {bundleB}
                </Breathe>
              ) : (
                bundleB
              )}
            </g>
          ) : null}

          {/* Smear under bundle-B slide-in (high-velocity window) */}
          <Smear
            color={inkColor}
            endFrame={twoTens.startFrame + TWO_SMEAR_REL_END}
            endX={BUNDLE_TWO_RIGHT_CX}
            endY={STICKS_ORIGIN_Y}
            startFrame={twoTens.startFrame + TWO_SMEAR_REL_START}
            startX={BUNDLE_OFFSCREEN_RIGHT_CX}
            startY={STICKS_ORIGIN_Y}
            thickness={18}
          />

          {/* --- Bundle C (three-tens onward) --- */}
          {bundleC !== null ? (
            <g {...measureProps("bundle-c")}>
              {breathingActive && bundleCX !== null ? (
                <Breathe
                  amplitudeScale={0.005}
                  bpm={15}
                  originX={bundleCX}
                  originY={STICKS_ORIGIN_Y}
                  phaseSeed="kp2-bundle-c"
                >
                  {bundleC}
                </Breathe>
              ) : (
                bundleC
              )}
            </g>
          ) : null}

          <Smear
            color={inkColor}
            endFrame={threeTens.startFrame + THREE_SMEAR_REL_END}
            endX={BUNDLE_THREE_RIGHT_CX}
            endY={STICKS_ORIGIN_Y}
            startFrame={threeTens.startFrame + THREE_SMEAR_REL_START}
            startX={BUNDLE_OFFSCREEN_RIGHT_CX}
            startY={STICKS_ORIGIN_Y}
            thickness={18}
          />

          {/* --- Recall label "一个十" --- */}
          {recallLabelOpacity > 0 ? (
            <g opacity={recallLabelOpacity} {...measureProps("label-recall")}>
              <LabelCallout
                appearStyle="fade"
                color={inkColor}
                fontSize={56}
                progress={recallLabelEnter}
                text="一个十"
                x={LABEL_X}
                y={LABEL_Y}
              />
            </g>
          ) : null}

          {/* --- Slow-count badges (ripple-in via <Drag> root→tip) --- */}
          {slowBadgesVisible ? (
            <Drag staggerFrames={3} tipOvershootMultiplier={1.0}>
              {Array.from({ length: STICK_COUNT }, (_, index) => (
                <SlowBadge
                  fadeOut={slowBadgesFadeOut}
                  frame={frame}
                  index={index}
                  inkColor={inkColor}
                  key={index}
                  startFrame={
                    slowCount.startFrame +
                    SLOW_BADGE_BASE_DELAY +
                    index * SLOW_COUNT_STRIDE
                  }
                />
              ))}
            </Drag>
          ) : null}

          {/* --- Slow tally pill --- */}
          {slowTallyOpacity > 0 ? (
            <g opacity={slowTallyOpacity} {...measureProps("slow-tally")}>
              <g opacity={1 - slowTallyDimMix}>
                <StepTally
                  color={inkColor}
                  label="次"
                  progress={slowTallyEnter}
                  size={56}
                  steps={10}
                  variant="numeric"
                  x={slowTallyX}
                  y={TALLY_Y}
                />
              </g>
              {slowTallyDimMix > 0 ? (
                <g opacity={slowTallyDimMix}>
                  <StepTally
                    dimmed
                    label="次"
                    progress={1}
                    size={56}
                    steps={10}
                    variant="numeric"
                    x={slowTallyX}
                    y={TALLY_Y}
                  />
                </g>
              ) : null}
            </g>
          ) : null}

          {/* --- Fast tally pill (steps=1) --- */}
          {fastTallyOpacity > 0 ? (
            <g opacity={fastTallyOpacity} {...measureProps("fast-tally")}>
              <StepTally
                color={inkColor}
                label="次"
                progress={fastTallyEnter}
                size={56}
                steps={1}
                variant="numeric"
                x={TALLY_RIGHT_CX}
                y={TALLY_Y}
              />
            </g>
          ) : null}

          {/* --- Climax "1" badge above the re-tied bundle --- */}
          {climaxOneBadgeOpacity > 0 ? (
            <PopIn
              delay={fastVsSlow.startFrame + FAST_ONE_BADGE_REL_START}
              motion="bouncy"
              originX={STICKS_ORIGIN_X}
              originY={BADGE_Y}
            >
              <g opacity={climaxOneBadgeOpacity} {...measureProps("climax-badge")}>
                <CountStepIndicator
                  background={colors.white}
                  color={inkColor}
                  outlineColor={inkColor}
                  progress={climaxOneBadgeEnter}
                  size={COUNT_BADGE_BIG_SIZE}
                  value={1}
                  x={STICKS_ORIGIN_X}
                  y={BADGE_Y}
                />
              </g>
            </PopIn>
          ) : null}

          {/* --- Two-tens / three-tens per-bundle "1" badges --- */}
          {twoBadgeA > 0 && frame >= twoTens.startFrame && bundleAX !== null ? (
            <g
              opacity={twoBadgeA}
              {...measureProps("badge-a")}
            >
              <CountStepIndicator
                background={colors.white}
                color={inkColor}
                outlineColor={inkColor}
                progress={twoBadgeA}
                size={COUNT_BADGE_BIG_SIZE}
                value={1}
                x={bundleAX}
                y={BADGE_Y}
              />
            </g>
          ) : null}

          {twoBadgeB > 0 && bundleBX !== null ? (
            <g
              opacity={twoBadgeB}
              {...measureProps("badge-b")}
            >
              <CountStepIndicator
                background={colors.white}
                color={inkColor}
                outlineColor={inkColor}
                progress={twoBadgeB}
                size={COUNT_BADGE_BIG_SIZE}
                value={1}
                x={bundleBX}
                y={BADGE_Y}
              />
            </g>
          ) : null}

          {threeBadgeC > 0 && bundleCX !== null ? (
            <g opacity={threeBadgeC} {...measureProps("badge-c")}>
              <CountStepIndicator
                background={colors.white}
                color={inkColor}
                outlineColor={inkColor}
                progress={threeBadgeC}
                size={COUNT_BADGE_BIG_SIZE}
                value={1}
                x={bundleCX}
                y={BADGE_Y}
              />
            </g>
          ) : null}

          {/* --- 两个十 / 三个十 / 一捆一捆地数，更快 labels --- */}
          {labelTwoOpacity > 0 ? (
            <g opacity={labelTwoOpacity} {...measureProps("label-two")}>
              <LabelCallout
                appearStyle="fade"
                color={inkColor}
                fontSize={56}
                progress={labelTwoEnter}
                text="两个十"
                x={LABEL_X}
                y={LABEL_Y}
              />
            </g>
          ) : null}

          {labelThreeOpacity > 0 ? (
            <g opacity={labelThreeOpacity} {...measureProps("label-three")}>
              <LabelCallout
                appearStyle="fade"
                color={inkColor}
                fontSize={56}
                progress={labelThreeEnter}
                text="三个十"
                x={LABEL_X}
                y={LABEL_Y}
              />
            </g>
          ) : null}

          {takeawayOpacity > 0 ? (
            <g opacity={takeawayOpacity} {...measureProps("label-takeaway")}>
              <LabelCallout
                appearStyle="fade"
                color={inkColor}
                fontSize={56}
                progress={takeawayEnter}
                text="一捆一捆地数，更快"
                x={LABEL_X}
                y={LABEL_Y}
              />
            </g>
          ) : null}

          {/* --- Sketch marks --- */}
          {SKETCH_MARKS.map((spec) => (
            <SketchMark
              cues={cues}
              frame={frame}
              key={spec.id}
              spec={spec}
              strokeColor={inkColor}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
