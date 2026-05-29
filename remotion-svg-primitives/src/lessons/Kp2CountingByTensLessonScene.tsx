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
  type BoilConfig,
  type SettleConfig,
  type TeacherMarkAnchor,
  type TeacherMarkKind,
  type TeacherMarkPathParams,
} from "../shape-primitives";
import {
  INK_WASH_PALETTE,
  useStyle,
  useStyleFilter,
  useStylePalette,
} from "../styles";
import { colors, typography, video } from "../theme";
import { kp2CountingByTensAlignedCues } from "./generated/kp2CountingByTensTiming";
import { type AlignedLessonCue, cueMap } from "./timingTypes";

// ---------------------------------------------------------------------------
// Lesson identity (cue ids match script-cues.json + timing module).
// ---------------------------------------------------------------------------
type Kp2CueId =
  | "bundle-recall"
  | "untie-reveal"
  | "slow-count-ones"
  | "fast-vs-slow"
  | "two-tens"
  | "three-tens"
  | "recap";

// Cast at the boundary — the silencedetect-corrected `confidence` literal in
// kp2CountingByTensTiming.ts is not yet a recognized AlignmentConfidence
// member in @studio/narration-kit's type union; orchestrator decision is to
// keep the upstream artifact as-is. Functional fields (startFrame/endFrame)
// are unaffected.
const cues = cueMap(
  kp2CountingByTensAlignedCues as unknown as AlignedLessonCue[],
);

// ---------------------------------------------------------------------------
// Layout constants — every position/size in viewBox units. Zones from
// visual-design §1.5. No frame literals here; only spatial constants.
// ---------------------------------------------------------------------------
const CANVAS_WIDTH = video.width;
const CANVAS_HEIGHT = video.height;

const STICKS_ORIGIN_X = 640;
const STICKS_ORIGIN_Y = 330;
const STICK_COUNT = 10;

const STICK_LENGTH = 120;
const STICK_THICKNESS = 18;
const ROW_GAP = 100;
const BUNDLE_GAP = 18;

const BUNDLE_FINAL_WIDTH =
  (STICK_COUNT - 1) * BUNDLE_GAP + STICK_THICKNESS + 12;

// Zones — tally-left center x=370, tally-right center x=910 (per visual-design §1.5).
const TALLY_LEFT_CX = 370;
const TALLY_RIGHT_CX = 910;
const TALLY_Y = 535;

// vs-mark midpoint between tallies (per visual-design §3 fast-vs-slow).
const VS_MARK_X = 640;
const VS_MARK_Y = 535;

// Bundle horizontal positions for extension cues.
// In fast-vs-slow the bundle is centered.
// In two-tens: original slides to x≈530 left-of-center; bundle-B arrives at x≈750.
// In three-tens: shift further apart; ~90% of zone-stage (zone-stage 1040 wide centered at 640).
// At ~90% spread the three bundles span 940 → centers at 170, 470, 770 from zone-stage left
// = absolute 170+120, 470+120, 770+120 = 290, 590, 890. Re-center on x=640 →
// centers at 640-300, 640, 640+300 = 340, 640, 940.
const BUNDLE_TWO_LEFT_CX = 530;
const BUNDLE_TWO_RIGHT_CX = 750;
const BUNDLE_THREE_LEFT_CX = 340;
const BUNDLE_THREE_MID_CX = 640;
const BUNDLE_THREE_RIGHT_CX = 940;
const BUNDLE_OFFSCREEN_RIGHT_CX = 1480;

// Label position (zone-label center).
const LABEL_X = 640;
const LABEL_Y = 600;

// Badges sit above the bundle (zone-badges centered y≈130 per visual-design).
const BADGE_Y = 130;

// CountStepIndicator size = 60 (per visual-design §8.1 yellow finding —
// internal font ≈ 37px ≥ 36px body-label minimum).
const COUNT_BADGE_SIZE = 60;
const COUNT_BADGE_BIG_SIZE = 60;

// Per-stick walk inside slow-count-ones — paced across the 106f cue with
// 10 sticks. Stride 9f, flash 5f.
const SLOW_COUNT_STRIDE = 9;
const SLOW_COUNT_FLASH = 5;
const SLOW_COUNT_BADGE_FADE_DUR = 12;

// Cue-relative timing constants. Each value is a named offset against either
// `cues[id].startFrame` or `cues[id].endFrame`. NO master-timeline literals.
//
// bundle-recall
const RECALL_BUNDLE_BOUNCY_DUR = 24;
const RECALL_LABEL_REL_START = 18;
const RECALL_LABEL_DUR = 16;

// untie-reveal
const UNTIE_OPEN_REL_START = 0;
const UNTIE_OPEN_DUR = 60; // ~70% of the 96f cue
const UNTIE_LABEL_EXIT_DUR = 24;

// slow-count-ones
const SLOW_BADGE_BASE_DELAY = 6; // ripple-in lead-in into Drag

// slow-tally appears at ~85% of cue (≥85f for 106f cue → just before climax handoff)
const SLOW_TALLY_REL_START = 78;
const SLOW_TALLY_DUR = 18;

// fast-vs-slow
const FAST_BADGES_FADE_DUR = 14;
const FAST_COMPRESS_REL_START = 12;
const FAST_COMPRESS_DUR = 28;
const FAST_WRAP_REL_START = 18;
const FAST_WRAP_DUR = 30;
const FAST_ONE_BADGE_REL_START = 50;
const FAST_ONE_BADGE_DUR = 12;
const FAST_SLOW_TALLY_SLIDE_DUR = 18;
const FAST_RIGHT_TALLY_REL_START = 48;
const FAST_RIGHT_TALLY_DUR = 16;
const FAST_GLINT_REL_START = 50;
const FAST_GLINT_DUR = 14;
const FAST_VS_MARK_REL_START = 50;
const FAST_VS_MARK_DUR = 14;

// two-tens
const TWO_EXIT_DUR = 14; // tallies + vs-mark + climax badge fade
const TWO_BUNDLE_A_SLIDE_REL_START = 4;
const TWO_BUNDLE_A_SLIDE_DUR = 20;
const TWO_BUNDLE_B_SLIDE_REL_START = 18;
const TWO_BUNDLE_B_SLIDE_DUR = 28;
const TWO_BADGE_A_REL_START = 48;
const TWO_BADGE_A_DUR = 12;
const TWO_BADGE_B_REL_START = 58;
const TWO_BADGE_B_DUR = 12;
const TWO_LABEL_REL_START = 66;
const TWO_LABEL_DUR = 18;
const TWO_SMEAR_REL_START = 18;
const TWO_SMEAR_REL_END = 46; // 28f window

// three-tens
const THREE_BUNDLE_SHIFT_REL_START = 4;
const THREE_BUNDLE_SHIFT_DUR = 20;
const THREE_BUNDLE_C_SLIDE_REL_START = 18;
const THREE_BUNDLE_C_SLIDE_DUR = 26;
const THREE_BADGE_C_REL_START = 46;
const THREE_BADGE_C_DUR = 12;
const THREE_LABEL_REL_START = 56;
const THREE_LABEL_DUR = 18;
const THREE_SMEAR_REL_START = 18;
const THREE_SMEAR_REL_END = 44;

// recap
const RECAP_LABEL_FADE_REL_START = 4;
const RECAP_LABEL_FADE_DUR = 18;
const RECAP_PULSE_REL_START = 28;
const RECAP_UNDERLINE_REL_START = 46;
const RECAP_UNDERLINE_DUR = 18;

// ---------------------------------------------------------------------------
// Label windows — when a teaching LabelCallout is on screen. Consumed by
// LessonCaptionLayer to suppress the caption ribbon for any narration cue
// whose midpoint falls inside one of these windows ("one on-screen
// representation per beat" — pedagogy rule, enforced programmatically).
// ---------------------------------------------------------------------------
export const getKp2CountingByTensLabelWindows = (
  cueArray: AlignedLessonCue[],
): { startFrame: number; endFrame: number }[] => {
  const map = cueMap(cueArray);
  const bundleRecall = map["bundle-recall"];
  const untieReveal = map["untie-reveal"];
  const twoTens = map["two-tens"];
  const threeTens = map["three-tens"];
  const recap = map["recap"];
  if (!bundleRecall || !untieReveal || !twoTens || !threeTens || !recap) {
    return [];
  }
  return [
    // "一个十" — recall, exits during untie-reveal
    {
      startFrame: bundleRecall.startFrame + RECALL_LABEL_REL_START,
      endFrame: untieReveal.startFrame + UNTIE_LABEL_EXIT_DUR,
    },
    // "两个十" — enters in two-tens, exits during three-tens
    {
      startFrame: twoTens.startFrame + TWO_LABEL_REL_START,
      endFrame:
        threeTens.startFrame + THREE_LABEL_REL_START + THREE_LABEL_DUR,
    },
    // "三个十" — enters in three-tens, exits during recap
    {
      startFrame: threeTens.startFrame + THREE_LABEL_REL_START,
      endFrame:
        recap.startFrame + RECAP_LABEL_FADE_REL_START + RECAP_LABEL_FADE_DUR,
    },
    // takeaway "一捆一捆地数，更快" — persists through end of recap
    {
      startFrame: recap.startFrame + RECAP_LABEL_FADE_REL_START,
      endFrame: recap.endFrame,
    },
  ];
};

// ---------------------------------------------------------------------------
// Sketch marks — cue-relative spec only. See sketch-overlay.md.
// vs-mark anchored at (640, 535); underline span under "更快" (right two
// glyphs of the takeaway sentence centered at x=640, y=600 at 56px). Two
// glyphs span ~120px; underline sits ~32px below the baseline.
// ---------------------------------------------------------------------------
type SketchMarkSpec = {
  anchor: TeacherMarkAnchor;
  boil?: BoilConfig;
  cueId: Kp2CueId;
  drawDuration: number;
  drawRelStart: number;
  fadeOutRelEnd: number; // counted backward from cueEnd
  id: string;
  jitterSeed: number;
  kind: TeacherMarkKind;
  pathParams?: TeacherMarkPathParams;
  settle?: SettleConfig;
};

const SKETCH_MARKS: SketchMarkSpec[] = [
  {
    anchor: { kind: "point", x: VS_MARK_X, y: VS_MARK_Y },
    boil: { holdFrames: 5, magnitude: 4 }, // ink-wash bump +25% over default 3
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
    boil: { holdFrames: 5, magnitude: 5 }, // ink-wash bump +25% over default 4
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

// ---------------------------------------------------------------------------
// Helpers
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
  strokeColor,
}: {
  frame: number;
  spec: SketchMarkSpec;
  strokeColor: string;
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
    <g opacity={opacity / 0.92}>
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

// ---------------------------------------------------------------------------
// Slow-count badge — wrapper so <Drag> can stagger via `startFrame` prop.
// ---------------------------------------------------------------------------
type SlowBadgeProps = {
  index: number;
  inkColor: string;
  rowStickX: (index: number) => number;
  startFrame: number;
  fadeOut: number;
  frame: number;
};

const SlowBadge = ({
  index,
  inkColor,
  rowStickX,
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
    <g opacity={opacity}>
      <CountStepIndicator
        background={colors.white}
        color={inkColor}
        outlineColor={inkColor}
        progress={appear}
        size={COUNT_BADGE_SIZE}
        value={index + 1}
        x={rowStickX(index)}
        y={BADGE_Y}
      />
    </g>
  );
};

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
export const Kp2CountingByTensLessonScene = () => {
  const frame = useCurrentFrame();
  const styleFilter = useStyleFilter();
  const palette = useStylePalette();
  const { activeStyle } = useStyle();

  // The teaching <g> takes the ink-wash modifier filter. Strokes/fills resolve
  // through the palette: under ink-wash, ink replaces textNavy, paper replaces
  // cream. We pass ink-wash palette tokens explicitly to primitives that need
  // an exact color (sketch marks, FX accents); the filter handles bulk colors.
  const inkColor = palette.ink ?? palette.textNavy ?? colors.textNavy;
  // Under ink-wash, StylePreset paints the paper backdrop (grain + seal) behind
  // this scene — keep the scene root transparent so the backdrop reads through.
  const bgColor =
    activeStyle === "ink-wash"
      ? "transparent"
      : palette.background ?? colors.cream;
  const accentColor = palette.accent ?? colors.coral;

  const cue = (id: Kp2CueId) => cues[id];

  const bundleRecall = cue("bundle-recall");
  const untieReveal = cue("untie-reveal");
  const slowCount = cue("slow-count-ones");
  const fastVsSlow = cue("fast-vs-slow");
  const twoTens = cue("two-tens");
  const threeTens = cue("three-tens");
  const recap = cue("recap");

  // -----------------------------------------------------------------------
  // Layout selection per phase.
  //   bundle-recall: bundle
  //   untie-reveal: bundle→row across UNTIE_OPEN_DUR
  //   slow-count-ones: row
  //   fast-vs-slow: row→bundle (compress 0→1, wrap 0→1)
  //   two-tens / three-tens / recap: bundle (held; multi-bundle)
  // -----------------------------------------------------------------------
  const untieOpenStart = untieReveal.startFrame + UNTIE_OPEN_REL_START;
  const untieOpenEnd = untieOpenStart + UNTIE_OPEN_DUR;
  const fastCompressStart = fastVsSlow.startFrame + FAST_COMPRESS_REL_START;
  const fastWrapEnd = fastVsSlow.startFrame + FAST_WRAP_REL_START + FAST_WRAP_DUR;

  let layout: "scatter" | "row" | "bundle";
  if (frame < untieOpenStart) {
    layout = "bundle";
  } else if (frame < untieOpenEnd) {
    // mid-transition — render row for the second half of the open window so
    // the StickGroup snaps once at midpoint. Composer choice per
    // visual-design §3 untie-reveal allowed-change: "in lockstep".
    layout = frame < untieOpenStart + UNTIE_OPEN_DUR / 2 ? "bundle" : "row";
  } else if (frame < fastCompressStart) {
    layout = "row";
  } else if (frame < fastWrapEnd) {
    // Mid re-tie: switch to bundle when wrap starts (the squeeze is in motion).
    const wrapStart = fastVsSlow.startFrame + FAST_WRAP_REL_START;
    layout = frame < wrapStart ? "row" : "bundle";
  } else {
    layout = "bundle";
  }

  // bundle-recall: bouncy scale-pop entry (the one accent moment per video).
  const recallScaleProgress = reveal(
    frame,
    bundleRecall.startFrame,
    RECALL_BUNDLE_BOUNCY_DUR,
    EASE.outQuint,
  );
  // Three-stop bouncy curve, applied only during the entry window.
  const recallBouncy = interpolate(
    recallScaleProgress,
    [0, 0.5, 0.8, 1],
    [0.92, 0.96, 1.06, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // untie-reveal: wrap fades / layout opens.
  const untieT = progress(
    frame,
    untieOpenStart,
    untieOpenEnd,
    EASE.inOutCubic,
  );

  // fast-vs-slow: compress 0→1 then wrap 0→1.
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

  // wrapProgress through the lesson: 1 (recall) → 0 across untie window →
  // hold 0 through slow-count → 0→1 during fast-vs-slow → 1 from there on.
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

  // -----------------------------------------------------------------------
  // Persistent bundle X position (the SAME StickGroup instance across the
  // entire lesson).
  //   bundle-recall, untie-reveal, slow-count, fast-vs-slow → x=640
  //   two-tens: slide to x=530
  //   three-tens: slide to x=340
  //   recap: hold at x=340
  // -----------------------------------------------------------------------
  const twoSlideAStart =
    twoTens.startFrame + TWO_BUNDLE_A_SLIDE_REL_START;
  const twoSlideA = reveal(
    frame,
    twoSlideAStart,
    TWO_BUNDLE_A_SLIDE_DUR,
    EASE.inOutCubic,
  );
  const threeShiftStart =
    threeTens.startFrame + THREE_BUNDLE_SHIFT_REL_START;
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

  // -----------------------------------------------------------------------
  // Bundle-B (atomic, slides in from off-canvas during two-tens; shifts in three-tens).
  // -----------------------------------------------------------------------
  const twoSlideBStart =
    twoTens.startFrame + TWO_BUNDLE_B_SLIDE_REL_START;
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

  // -----------------------------------------------------------------------
  // Bundle-C (atomic, slides in during three-tens).
  // -----------------------------------------------------------------------
  const threeSlideCStart =
    threeTens.startFrame + THREE_BUNDLE_C_SLIDE_REL_START;
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

  // -----------------------------------------------------------------------
  // Slow-count walk (activeIndex + revealUpTo for the row).
  // -----------------------------------------------------------------------
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
    revealUpTo = STICK_COUNT; // bundle/untie phases want all sticks revealed
  } else {
    revealUpTo = STICK_COUNT;
  }

  // Per-row stick x for badge anchoring.
  const rowStickX = (index: number) =>
    STICKS_ORIGIN_X + (index - (STICK_COUNT - 1) / 2) * ROW_GAP;

  // -----------------------------------------------------------------------
  // Slow-count badges + fade out at climax start.
  // -----------------------------------------------------------------------
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

  // -----------------------------------------------------------------------
  // Slow tally (StepTally steps=10) — enters near end of slow-count, persists
  // into fast-vs-slow (slides into tally-left + dimmed), then fades during two-tens.
  // -----------------------------------------------------------------------
  const slowTallyEnter = reveal(
    frame,
    slowCount.startFrame + SLOW_TALLY_REL_START,
    SLOW_TALLY_DUR,
    EASE.outCubic,
  );
  const slowTallyFadeOut =
    1 - reveal(frame, twoTens.startFrame, TWO_EXIT_DUR, EASE.outCubic);
  const slowTallyOpacity = slowTallyEnter * slowTallyFadeOut;

  // Position interp: from row-center (x=640) during slow-count to tally-left
  // center (x=370) during fast-vs-slow.
  const slowTallySlideT = reveal(
    frame,
    fastVsSlow.startFrame,
    FAST_SLOW_TALLY_SLIDE_DUR,
    EASE.inOutCubic,
  );
  const slowTallyX = lerp(640, TALLY_LEFT_CX, slowTallySlideT);
  // Dimmed flag flips at the climax — the toggle is opacity-driven via
  // `dimmed`, but to avoid an inflection hop, we cross-fade two stacked
  // tallies (one dimmed=false, one dimmed=true) during the slide.
  const slowTallyDimMix = slowTallySlideT;

  // -----------------------------------------------------------------------
  // Fast tally (steps=1) — fades in during fast-vs-slow at tally-right, then
  // fades out during two-tens.
  // -----------------------------------------------------------------------
  const fastTallyEnter = reveal(
    frame,
    fastVsSlow.startFrame + FAST_RIGHT_TALLY_REL_START,
    FAST_RIGHT_TALLY_DUR,
    EASE.outCubic,
  );
  const fastTallyFadeOut =
    1 - reveal(frame, twoTens.startFrame, TWO_EXIT_DUR, EASE.outCubic);
  const fastTallyOpacity = fastTallyEnter * fastTallyFadeOut;

  // -----------------------------------------------------------------------
  // Climax "1" badge — appears above the re-tied bundle just after wrap=1;
  // fades out at the start of two-tens.
  // -----------------------------------------------------------------------
  const climaxOneBadgeEnter = reveal(
    frame,
    fastVsSlow.startFrame + FAST_ONE_BADGE_REL_START,
    FAST_ONE_BADGE_DUR,
    EASE.outCubic,
  );
  const climaxOneBadgeFadeOut =
    1 - reveal(frame, twoTens.startFrame, TWO_EXIT_DUR, EASE.outCubic);
  const climaxOneBadgeOpacity = climaxOneBadgeEnter * climaxOneBadgeFadeOut;

  // -----------------------------------------------------------------------
  // two-tens / three-tens per-bundle "1" badges and labels.
  // -----------------------------------------------------------------------
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

  // Recall label "一个十" — fades in during bundle-recall, then exits during
  // untie-reveal.
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

  // -----------------------------------------------------------------------
  // BundleWrap shared props.
  // -----------------------------------------------------------------------
  const wrapRopeHeight = BUNDLE_FINAL_WIDTH * 0.32;

  // -----------------------------------------------------------------------
  // Persistent-bundle group scale (recall entrance + recap pulse).
  // -----------------------------------------------------------------------
  let bundleAScale = 1;
  if (frame < bundleRecall.startFrame + RECALL_BUNDLE_BOUNCY_DUR) {
    bundleAScale = recallBouncy;
  }

  // -----------------------------------------------------------------------
  // Persistent-bundle visibility threshold — the bundle starts on screen
  // from bundle-recall and lives the whole video.
  // -----------------------------------------------------------------------
  const bundleAVisible = frame >= bundleRecall.startFrame;

  // Recap breathing is active once the pulse window starts. Wrapping the
  // three bundles in <Breathe> makes them feel alive while the takeaway lands.
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
      {/* FXDefs is a sibling to the teaching <g> so its filter ids resolve. */}
      <FXDefs />

      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width="100%"
      >
        {/* === Teaching tree — ink-wash filter applies to everything inside. === */}
        <g filter={styleFilter}>
          {/* --- Persistent bundle A (lives whole video) --- */}
          {bundleAVisible ? (
            breathingActive ? (
              <Breathe
                amplitude={1.022}
                cycleFrames={60}
                originX={bundleAX}
                originY={STICKS_ORIGIN_Y}
                phaseOffset={0}
              >
                {bundleA}
              </Breathe>
            ) : (
              bundleA
            )
          ) : null}

          {/* --- Climax glint at re-tie completion (anchored at bow knot) --- */}
          <GlintFlash
            color={INK_WASH_PALETTE.accent ?? colors.coral}
            durationInFrames={FAST_GLINT_DUR}
            size={22}
            startFrame={fastVsSlow.startFrame + FAST_GLINT_REL_START}
            x={STICKS_ORIGIN_X}
            y={STICKS_ORIGIN_Y - wrapRopeHeight - 22}
          />

          {/* --- Bundle B (two-tens onward) --- */}
          {bundleB !== null ? (
            breathingActive && bundleBX !== null ? (
              <Breathe
                amplitude={1.022}
                cycleFrames={60}
                originX={bundleBX}
                originY={STICKS_ORIGIN_Y}
                phaseOffset={20}
              >
                {bundleB}
              </Breathe>
            ) : (
              bundleB
            )
          ) : null}

          {/* Smear under bundle-B slide-in (high-velocity window). */}
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
            breathingActive && bundleCX !== null ? (
              <Breathe
                amplitude={1.022}
                cycleFrames={60}
                originX={bundleCX}
                originY={STICKS_ORIGIN_Y}
                phaseOffset={40}
              >
                {bundleC}
              </Breathe>
            ) : (
              bundleC
            )
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
            <g opacity={recallLabelOpacity}>
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
                  rowStickX={rowStickX}
                  startFrame={
                    slowCount.startFrame +
                    SLOW_BADGE_BASE_DELAY +
                    index * SLOW_COUNT_STRIDE
                  }
                />
              ))}
            </Drag>
          ) : null}

          {/* --- Slow tally pill (cross-fade bright→dimmed across the climax slide) --- */}
          {slowTallyOpacity > 0 ? (
            <>
              <g opacity={slowTallyOpacity * (1 - slowTallyDimMix)}>
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
                <g opacity={slowTallyOpacity * slowTallyDimMix}>
                  <StepTally
                    color={inkColor}
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
            </>
          ) : null}

          {/* --- Fast tally pill (steps=1) --- */}
          {fastTallyOpacity > 0 ? (
            <g opacity={fastTallyOpacity}>
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
              <g opacity={climaxOneBadgeOpacity}>
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
          {twoBadgeA > 0 &&
          frame >= twoTens.startFrame &&
          bundleAX !== null ? (
            <g opacity={twoBadgeA}>
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
            <g opacity={twoBadgeB}>
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
            <g opacity={threeBadgeC}>
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
            <g opacity={labelTwoOpacity}>
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
            <g opacity={labelThreeOpacity}>
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
            <g opacity={takeawayOpacity}>
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
