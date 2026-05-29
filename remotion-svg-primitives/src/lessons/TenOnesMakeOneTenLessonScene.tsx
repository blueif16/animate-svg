import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE, PopIn } from "../motion-primitives";
import {
  BundleWrap,
  CountStepIndicator,
  LabelCallout,
  StepTally,
  StickGroup,
  TeacherMark,
  type BoilConfig,
  type TeacherMarkAnchor,
  type TeacherMarkKind,
  type TeacherMarkPathParams,
} from "../shape-primitives";
import { colors, typography } from "../theme";
import { tenOnesMakeOneTenAlignedCues } from "./generated/tenOnesMakeOneTenTiming";
import {
  BADGE_Y,
  BUNDLE_BADGE_FADE_DURATION,
  BUNDLE_COMPRESS_DURATION,
  BUNDLE_COMPRESS_REL_START,
  BUNDLE_FINAL_WIDTH,
  BUNDLE_GAP,
  BUNDLE_SPARKLE_DURATION,
  BUNDLE_SPARKLE_REL_START,
  BUNDLE_WRAP_DURATION,
  BUNDLE_WRAP_REL_START,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COUNT_FLASH_DURATION,
  COUNT_PER_STICK_DURATION,
  FASTER_GHOST_FADE_DURATION,
  FASTER_LABEL_EXIT_DURATION,
  FASTER_ONE_BADGE_DURATION,
  FASTER_ONE_BADGE_REL_START,
  FASTER_ONE_TALLY_DURATION,
  FASTER_ONE_TALLY_REL_START,
  FASTER_SLIDE_DURATION,
  FEELS_SLOW_TALLY_DURATION,
  FEELS_SLOW_TALLY_REL_START,
  LABEL_X,
  LABEL_Y,
  LEFT_HALF_CX,
  OPENING_ENTER_DURATION,
  PEEK_LABEL_X,
  PEEK_LABEL_Y,
  RECAP_PULSE_DURATION,
  RECAP_PULSE_REL_START,
  RECAP_SENTENCE_DURATION,
  RECAP_SENTENCE_REL_START,
  RECAP_SLIDE_BACK_DURATION,
  RECAP_UNDERLINE_DURATION,
  RECAP_UNDERLINE_REL_START,
  RENAME_LABEL_DURATION,
  RENAME_LABEL_REL_START,
  RENAME_PULSE_DURATION,
  RENAME_PULSE_REL_START,
  RIGHT_HALF_CX,
  ROW_GAP,
  SCATTER_RADIUS,
  SCATTER_TO_ROW_REL_START,
  STICK_COUNT,
  STICK_LENGTH,
  STICK_THICKNESS,
  STICKS_ORIGIN_X,
  STICKS_ORIGIN_Y,
  STILL_LABEL_DURATION,
  STILL_LABEL_REL_START,
  STILL_PEEK_HOLD_DURATION,
  STILL_PEEK_IN_DURATION,
  STILL_PEEK_OUT_DURATION,
  TALLY_X,
  TALLY_Y,
} from "./tenOnesMakeOneTen/layout";
import { cueMap } from "./timingTypes";

// ---------------------------------------------------------------------------
// Lesson identity
// ---------------------------------------------------------------------------
type TenOnesMakeOneTenCueId =
  | "opening"
  | "count-one-by-one"
  | "count-to-ten"
  | "feels-slow"
  | "bundle-action"
  | "rename-bundle"
  | "still-ten-ones"
  | "faster-count"
  | "recap";

const cues = cueMap(tenOnesMakeOneTenAlignedCues);

// Sketch marks — see sketch-overlay.md. Each entry is purely cue-relative;
// the scene resolves absolute frames via `cues[cueId].startFrame + relStart`
// and clamps against `cues[cueId].endFrame`. NO absolute frame literals here.
type SketchMarkSpec = {
  anchor: TeacherMarkAnchor;
  boil?: BoilConfig;
  cueId: TenOnesMakeOneTenCueId;
  drawDuration: number;
  drawRelStart: number;
  fadeOutRelStart: number;
  id: string;
  jitterSeed: number;
  kind: TeacherMarkKind;
  pathParams?: TeacherMarkPathParams;
};

// Anchors and timing come from sketch-overlay.md. y=420 keeps the feels-slow
// underline 30px below the stick row (bottom y=390) and 46px above the
// StepTally pill (top y=466), so the mark, the row, and the pill don't collide.
const SKETCH_MARKS: SketchMarkSpec[] = [
  {
    anchor: {
      end: { x: 940, y: 420 },
      kind: "span",
      start: { x: 340, y: 420 },
    },
    boil: { holdFrames: 6, magnitude: 3 },
    cueId: "feels-slow",
    drawDuration: 24,
    drawRelStart: 4,
    fadeOutRelStart: 80,
    id: "mark-feels-slow-row-underline",
    jitterSeed: 1,
    kind: "underline",
  },
  {
    anchor: {
      end: { x: 715, y: 330 },
      kind: "span",
      start: { x: 565, y: 330 },
    },
    boil: { holdFrames: 5, magnitude: 5 },
    cueId: "bundle-action",
    drawDuration: 22,
    drawRelStart: 14,
    fadeOutRelStart: 64,
    id: "mark-bundle-action-wrap-arc",
    jitterSeed: 2,
    kind: "wrap-arc",
    pathParams: { arcPeakOffset: 36 },
  },
  {
    anchor: {
      end: { x: 640, y: 420 },
      kind: "span",
      start: { x: 640, y: 520 },
    },
    boil: { holdFrames: 6, magnitude: 3 },
    cueId: "rename-bundle",
    drawDuration: 18,
    drawRelStart: 26,
    fadeOutRelStart: 90,
    id: "mark-rename-bundle-label-arrow",
    jitterSeed: 3,
    kind: "label-arrow",
    pathParams: { arrowheadSize: 14 },
  },
  {
    anchor: { kind: "point", x: 640, y: 360 },
    boil: { holdFrames: 6, magnitude: 2 },
    cueId: "faster-count",
    drawDuration: 12,
    drawRelStart: 50,
    fadeOutRelStart: 92,
    id: "mark-faster-count-vs",
    jitterSeed: 4,
    kind: "vs-mark",
    pathParams: { arrowheadSize: 16 },
  },
  {
    anchor: {
      end: { x: 800, y: 600 },
      kind: "span",
      start: { x: 680, y: 600 },
    },
    boil: { holdFrames: 6, magnitude: 4 },
    cueId: "recap",
    drawDuration: 18,
    drawRelStart: 78,
    fadeOutRelStart: 118,
    id: "mark-recap-final-phrase-underline",
    jitterSeed: 5,
    kind: "underline",
  },
];

// ---------------------------------------------------------------------------
// Easing + progress helpers
// ---------------------------------------------------------------------------
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

// Clamp a motion window against a cue boundary. If the requested motion
// would extend past `cueEnd`, the helper compresses it to fit.
const clampToCue = (start: number, duration: number, cueEnd: number) => {
  const cappedDuration = Math.max(1, Math.min(duration, cueEnd - start));
  return { duration: cappedDuration, start };
};

// ---------------------------------------------------------------------------
// Sketch mark renderer — derives absolute frames from cue boundaries only.
// ---------------------------------------------------------------------------
const SketchMark = ({
  frame,
  spec,
}: {
  frame: number;
  spec: SketchMarkSpec;
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

  // Fade-out window — 8f, clamped so it always finishes by cueEnd.
  const fadeOutStart = Math.min(cueStart + spec.fadeOutRelStart, cueEnd - 8);
  const fadeOut = progress(frame, fadeOutStart, fadeOutStart + 8);

  if (frame < drawWindow.start || frame > cueEnd) {
    return null;
  }

  const opacity = (1 - fadeOut) * 0.92;
  if (opacity <= 0) {
    return null;
  }

  return (
    <g opacity={opacity / 0.92}>
      <TeacherMark
        anchor={spec.anchor}
        boil={spec.boil}
        drawProgress={drawProgress}
        jitterSeed={spec.jitterSeed}
        kind={spec.kind}
        pathParams={spec.pathParams}
        strokeColor={colors.textNavy}
        strokeWidth={4}
      />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Climax sparkle (one moment in the entire video — visual-design §3).
// ---------------------------------------------------------------------------
const Sparkle = ({
  cx,
  cy,
  opacity,
  radius,
}: {
  cx: number;
  cy: number;
  opacity: number;
  radius: number;
}) => {
  if (opacity <= 0) {
    return null;
  }
  const inner = radius * 0.46;
  const points: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? radius : inner;
    points.push(`${cx + Math.cos(angle) * r} ${cy + Math.sin(angle) * r}`);
  }
  const d = `M ${points.join(" L ")} Z`;
  return (
    <path
      d={d}
      fill={colors.sunshine}
      opacity={opacity}
      stroke={colors.textNavy}
      strokeLinejoin="round"
      strokeWidth={2}
    />
  );
};

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
export const TenOnesMakeOneTenLessonScene = () => {
  const frame = useCurrentFrame();
  const cue = (id: TenOnesMakeOneTenCueId) => cues[id];

  // Cue boundaries — every downstream frame derives from these.
  const opening = cue("opening");
  const countOneByOne = cue("count-one-by-one");
  const countToTen = cue("count-to-ten");
  const feelsSlow = cue("feels-slow");
  const bundleAction = cue("bundle-action");
  const renameBundle = cue("rename-bundle");
  const stillTenOnes = cue("still-ten-ones");
  const fasterCount = cue("faster-count");
  const recap = cue("recap");

  // -----------------------------------------------------------------------
  // Layout transitions (scatter → row → bundle), all on the SAME StickGroup
  // instance. We blend `compress` 0→1 during bundle-action so the row
  // collapses inward as the rope tightens (per visual-design §5).
  // -----------------------------------------------------------------------
  const showScatter = frame < countOneByOne.startFrame + SCATTER_TO_ROW_REL_START;
  const showBundle = frame >= bundleAction.startFrame + BUNDLE_WRAP_REL_START;

  let layout: "scatter" | "row" | "bundle";
  if (showScatter) {
    layout = "scatter";
  } else if (showBundle) {
    layout = "bundle";
  } else {
    layout = "row";
  }

  // Scatter → row scale-in over the opening.
  const openingEntryOpacity = reveal(
    frame,
    opening.startFrame,
    OPENING_ENTER_DURATION,
  );

  // Bundle compress 0→1 across bundle-action's first window.
  const compressWindow = clampToCue(
    bundleAction.startFrame + BUNDLE_COMPRESS_REL_START,
    BUNDLE_COMPRESS_DURATION,
    bundleAction.endFrame,
  );
  const compress = progress(
    frame,
    compressWindow.start,
    compressWindow.start + compressWindow.duration,
    EASE.inOutCubic,
  );

  // Wrap progress — drives the BundleWrap rope + bow.
  const wrapWindow = clampToCue(
    bundleAction.startFrame + BUNDLE_WRAP_REL_START,
    BUNDLE_WRAP_DURATION,
    bundleAction.endFrame,
  );
  const wrapProgress = progress(
    frame,
    wrapWindow.start,
    wrapWindow.start + wrapWindow.duration,
    EASE.outQuint,
  );

  // Climax sparkle.
  const sparkleWindow = clampToCue(
    bundleAction.startFrame + BUNDLE_SPARKLE_REL_START,
    BUNDLE_SPARKLE_DURATION,
    bundleAction.endFrame,
  );
  const sparkleRel = frame - sparkleWindow.start;
  let sparkleOpacity = 0;
  if (sparkleRel >= 0 && sparkleRel <= sparkleWindow.duration) {
    const halfway = sparkleWindow.duration / 2;
    sparkleOpacity =
      sparkleRel <= halfway
        ? sparkleRel / halfway
        : 1 - (sparkleRel - halfway) / halfway;
  }

  // -----------------------------------------------------------------------
  // Active-stick walk during count-to-ten. The cue is short (~77f), so we
  // pace the count-step across the cue's actual length.
  // -----------------------------------------------------------------------
  let activeIndex: number | undefined;
  let revealUpTo = STICK_COUNT;
  if (frame >= countToTen.startFrame && frame < feelsSlow.startFrame) {
    const rel = frame - countToTen.startFrame;
    const stepDur = COUNT_PER_STICK_DURATION;
    const idx = Math.min(STICK_COUNT - 1, Math.floor(rel / stepDur));
    activeIndex = idx;
    revealUpTo = Math.min(STICK_COUNT, idx + 1);
    if (rel - idx * stepDur > COUNT_FLASH_DURATION) {
      activeIndex = undefined;
    }
  } else if (frame < countToTen.startFrame) {
    activeIndex = undefined;
    revealUpTo = 0;
  } else {
    revealUpTo = STICK_COUNT;
  }

  // -----------------------------------------------------------------------
  // Stick group placement (group-level transform). Sticks live at center
  // for most of the video; during faster-count they slide to the right
  // half; in recap they slide back.
  // -----------------------------------------------------------------------
  const slideToRightT = reveal(
    frame,
    fasterCount.startFrame,
    FASTER_SLIDE_DURATION,
    EASE.inOutCubic,
  );
  const slideBackT = reveal(
    frame,
    recap.startFrame,
    RECAP_SLIDE_BACK_DURATION,
    EASE.inOutCubic,
  );

  let bundleGroupX = STICKS_ORIGIN_X;
  let bundleGroupScale = 1;
  if (frame >= recap.startFrame) {
    bundleGroupX = lerp(RIGHT_HALF_CX, STICKS_ORIGIN_X, slideBackT);
    bundleGroupScale = lerp(0.9, 1, slideBackT);
  } else if (frame >= fasterCount.startFrame) {
    bundleGroupX = lerp(STICKS_ORIGIN_X, RIGHT_HALF_CX, slideToRightT);
    bundleGroupScale = lerp(1, 0.9, slideToRightT);
  }

  // Gentle celebrate pulses at rename and recap (visual-design §4).
  const renamePulseT = reveal(
    frame,
    renameBundle.startFrame + RENAME_PULSE_REL_START,
    RENAME_PULSE_DURATION,
    EASE.inOutCubic,
  );
  const renamePulse =
    0.06 * Math.sin(renamePulseT * Math.PI);
  const recapPulseT = reveal(
    frame,
    recap.startFrame + RECAP_PULSE_REL_START,
    RECAP_PULSE_DURATION,
    EASE.inOutCubic,
  );
  const recapPulse = 0.06 * Math.sin(recapPulseT * Math.PI);
  const groupScale = bundleGroupScale + renamePulse + recapPulse;

  // -----------------------------------------------------------------------
  // Badges (1..10) above each row stick. Visible from count-to-ten through
  // feels-slow; fade out during the first 12f of bundle-action.
  // -----------------------------------------------------------------------
  const badgeFadeOut =
    1 -
    reveal(frame, bundleAction.startFrame, BUNDLE_BADGE_FADE_DURATION);
  const badgesVisible = frame >= countToTen.startFrame && badgeFadeOut > 0;

  // -----------------------------------------------------------------------
  // "10 步" tally — enters at feels-slow, fades out during bundle-action.
  // -----------------------------------------------------------------------
  const tallyEnter = reveal(
    frame,
    feelsSlow.startFrame + FEELS_SLOW_TALLY_REL_START,
    FEELS_SLOW_TALLY_DURATION,
    EASE.overshoot,
  );
  const tallyLiveOpacity = tallyEnter * badgeFadeOut;

  // Ghost tally during faster-count (left side, dimmed via opacity).
  const ghostFadeIn = reveal(
    frame,
    fasterCount.startFrame,
    FASTER_GHOST_FADE_DURATION,
  );
  const ghostFadeOut =
    1 - reveal(frame, recap.startFrame, FASTER_GHOST_FADE_DURATION);
  const ghostOpacity = ghostFadeIn * ghostFadeOut;

  // Label "一个十" — appears at rename-bundle, holds through still-ten-ones,
  // dissolves at the start of faster-count. The bundle's right-half position
  // and the "1 步" pill already encode the new unit; keeping the text label
  // during faster-count both clutters the contrast and overlaps the bow.
  const labelEnter = reveal(
    frame,
    renameBundle.startFrame + RENAME_LABEL_REL_START,
    RENAME_LABEL_DURATION,
  );
  const labelExit =
    1 - reveal(frame, fasterCount.startFrame, FASTER_LABEL_EXIT_DURATION);
  const labelOpacity = labelEnter * labelExit;
  const labelX = LABEL_X;
  const labelY = LABEL_Y;
  const labelFontSize = 64;

  // -----------------------------------------------------------------------
  // "10" peek label during still-ten-ones — fades in with the rope dim and
  // fades out as the rope re-solidifies.
  // -----------------------------------------------------------------------
  const stillStart = stillTenOnes.startFrame;
  const stillEnd = stillTenOnes.endFrame;
  const peekOutEnd = Math.min(
    stillStart + STILL_PEEK_OUT_DURATION,
    stillEnd,
  );
  const peekHoldEnd = Math.min(
    peekOutEnd + STILL_PEEK_HOLD_DURATION,
    stillEnd,
  );
  const peekInEnd = Math.min(peekHoldEnd + STILL_PEEK_IN_DURATION, stillEnd);

  let wrapOpacity = 1;
  let peekLabelOpacity = 0;
  if (frame >= stillStart && frame < fasterCount.startFrame) {
    if (frame <= peekOutEnd) {
      const t = progress(frame, stillStart, peekOutEnd, EASE.inOutCubic);
      wrapOpacity = lerp(1, 0.35, t);
    } else if (frame <= peekHoldEnd) {
      wrapOpacity = 0.35;
    } else if (frame <= peekInEnd) {
      const t = progress(frame, peekHoldEnd, peekInEnd, EASE.inOutCubic);
      wrapOpacity = lerp(0.35, 1, t);
    } else {
      wrapOpacity = 1;
    }

    const peekStart = stillStart + STILL_LABEL_REL_START;
    if (frame >= peekStart && frame <= peekHoldEnd) {
      peekLabelOpacity = reveal(frame, peekStart, STILL_LABEL_DURATION);
    } else if (frame > peekHoldEnd && frame <= peekInEnd) {
      peekLabelOpacity =
        1 - progress(frame, peekHoldEnd, peekInEnd, EASE.inOutCubic);
    }
  }

  // Once we reach bundle-action's wrap window, the rope exists.
  const tieVisible = frame >= bundleAction.startFrame + BUNDLE_WRAP_REL_START;

  // -----------------------------------------------------------------------
  // Faster-count right-side "1" badge + "1 步" tally.
  // -----------------------------------------------------------------------
  const oneBadgeEnter = reveal(
    frame,
    fasterCount.startFrame + FASTER_ONE_BADGE_REL_START,
    FASTER_ONE_BADGE_DURATION,
    EASE.overshoot,
  );
  const oneTallyEnter = reveal(
    frame,
    fasterCount.startFrame + FASTER_ONE_TALLY_REL_START,
    FASTER_ONE_TALLY_DURATION,
  );
  const oneSideExit =
    1 - reveal(frame, recap.startFrame, RECAP_SLIDE_BACK_DURATION);

  // -----------------------------------------------------------------------
  // Recap takeaway sentence + underline.
  // -----------------------------------------------------------------------
  const recapSentenceOpacity = reveal(
    frame,
    recap.startFrame + RECAP_SENTENCE_REL_START,
    RECAP_SENTENCE_DURATION,
  );
  const recapUnderlineProgress = reveal(
    frame,
    recap.startFrame + RECAP_UNDERLINE_REL_START,
    RECAP_UNDERLINE_DURATION,
  );

  // -----------------------------------------------------------------------
  // Per-stick row position (for badge anchoring above each stick).
  // -----------------------------------------------------------------------
  const rowStickX = (index: number) =>
    STICKS_ORIGIN_X + (index - (STICK_COUNT - 1) / 2) * ROW_GAP;

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
        {/* ===== Persistent 10-stick group (the lesson's identity unit) ===== */}
        <g
          opacity={openingEntryOpacity}
          transform={`translate(${bundleGroupX} ${STICKS_ORIGIN_Y}) scale(${groupScale})`}
        >
          <StickGroup
            activeIndex={activeIndex}
            bundleGap={BUNDLE_GAP}
            color={colors.reward}
            compress={compress}
            count={STICK_COUNT}
            layout={layout}
            revealUpTo={revealUpTo}
            rowGap={ROW_GAP}
            scatterRadius={SCATTER_RADIUS}
            scatterRotationRange={22}
            seed={7}
            stickLength={STICK_LENGTH}
            stickThickness={STICK_THICKNESS}
          />
          {tieVisible ? (
            <BundleWrap
              color={colors.coral}
              height={BUNDLE_FINAL_WIDTH * 0.32}
              knotPosition="top"
              opacity={wrapOpacity}
              outlineColor={colors.textNavy}
              style="rope"
              width={BUNDLE_FINAL_WIDTH}
              wrapProgress={wrapProgress}
            />
          ) : null}
          {sparkleOpacity > 0 ? (
            <PopIn
              delay={sparkleWindow.start}
              motion="bouncy"
              originX={0}
              originY={-BUNDLE_FINAL_WIDTH * 0.32 - 18}
            >
              <Sparkle
                cx={0}
                cy={-BUNDLE_FINAL_WIDTH * 0.32 - 18}
                opacity={sparkleOpacity}
                radius={20}
              />
            </PopIn>
          ) : null}
        </g>

        {/* ===== Left-side ghost row during faster-count (same primitive!) ===== */}
        {ghostOpacity > 0 ? (
          <g
            opacity={ghostOpacity * 0.55}
            transform={`translate(${LEFT_HALF_CX} ${STICKS_ORIGIN_Y}) scale(0.6)`}
          >
            <StickGroup
              bundleGap={BUNDLE_GAP}
              color={colors.reward}
              count={STICK_COUNT}
              layout="row"
              rowGap={ROW_GAP}
              seed={7}
              stickLength={STICK_LENGTH}
              stickThickness={STICK_THICKNESS}
            />
            <StepTally
              color={colors.textNavy}
              dimmed
              label="步"
              progress={1}
              size={44}
              steps={10}
              variant="numeric"
              x={0}
              y={120}
            />
          </g>
        ) : null}

        {/* ===== Count badges 1..10 (zone-badges) ===== */}
        {badgesVisible
          ? Array.from({ length: STICK_COUNT }, (_, index) => {
              const startFrame =
                countToTen.startFrame + index * COUNT_PER_STICK_DURATION;
              const appear = reveal(frame, startFrame, COUNT_PER_STICK_DURATION);
              const opacity = appear * badgeFadeOut;
              if (opacity <= 0) {
                return null;
              }
              return (
                <g key={index} opacity={opacity}>
                  <CountStepIndicator
                    background={colors.white}
                    color={colors.textNavy}
                    outlineColor={colors.textNavy}
                    progress={appear}
                    size={50}
                    value={index + 1}
                    x={rowStickX(index)}
                    y={BADGE_Y}
                  />
                </g>
              );
            })
          : null}

        {/* ===== "10 步" tally (zone-tally) — feels-slow → bundle-action fade ===== */}
        {tallyLiveOpacity > 0 ? (
          <g opacity={tallyLiveOpacity}>
            <StepTally
              color={colors.textNavy}
              label="步"
              progress={tallyEnter}
              size={48}
              steps={10}
              variant="numeric"
              x={TALLY_X}
              y={TALLY_Y}
            />
          </g>
        ) : null}

        {/* ===== Faster-count right-side "1" badge + "1 步" tally ===== */}
        {oneBadgeEnter > 0 ? (
          <g opacity={oneBadgeEnter * oneSideExit}>
            <CountStepIndicator
              background={colors.sunshine}
              color={colors.textNavy}
              outlineColor={colors.textNavy}
              progress={oneBadgeEnter}
              size={56}
              value={1}
              x={RIGHT_HALF_CX}
              y={BADGE_Y}
            />
          </g>
        ) : null}
        {oneTallyEnter > 0 ? (
          <g opacity={oneTallyEnter * oneSideExit}>
            <StepTally
              color={colors.textNavy}
              label="步"
              progress={oneTallyEnter}
              size={48}
              steps={1}
              variant="numeric"
              x={RIGHT_HALF_CX}
              y={TALLY_Y}
            />
          </g>
        ) : null}

        {/* ===== Label "一个十" (zone-labels — NEVER inside zone-objects) ===== */}
        {labelOpacity > 0 ? (
          <g opacity={labelOpacity}>
            <LabelCallout
              appearStyle="fade"
              color={colors.textNavy}
              fontSize={labelFontSize}
              progress={labelEnter}
              text="一个十"
              x={labelX}
              y={labelY}
            />
          </g>
        ) : null}

        {/* ===== Peek "10" label during still-ten-ones (zone-labels) ===== */}
        {peekLabelOpacity > 0 ? (
          <g opacity={peekLabelOpacity}>
            <LabelCallout
              appearStyle="fade"
              color={colors.textNavy}
              fontSize={40}
              progress={1}
              text="10"
              x={PEEK_LABEL_X}
              y={PEEK_LABEL_Y}
            />
          </g>
        ) : null}

        {/* ===== Recap takeaway sentence (zone-labels) ===== */}
        {recapSentenceOpacity > 0 ? (
          <g opacity={recapSentenceOpacity}>
            <LabelCallout
              appearStyle="fade"
              color={colors.textNavy}
              fontSize={64}
              progress={recapSentenceOpacity}
              text="十个一 = 一个十"
              underline={recapUnderlineProgress > 0}
              underlineColor={colors.textNavy}
              x={LABEL_X}
              y={LABEL_Y}
            />
          </g>
        ) : null}

        {/* ===== Sketch marks (cue-relative; resolved via cues[]) ===== */}
        {SKETCH_MARKS.map((spec) => (
          <SketchMark frame={frame} key={spec.id} spec={spec} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
