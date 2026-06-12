// kptest-fenyuhe-six — lesson scene (frame-driven, cue-bounded).
//
// Six dots split into two clusters (1|5, 2|4, 3|3) and recombine back into
// six — the part-whole routine for the number 6. The six dots are identity-
// invariant (same six React <UnitBlock> instances throughout cues 1–8, the
// same orange reward color/size, only the cluster layout and count change).
// Cue 9 is the spaced-recall recap, which renders three small cluster
// snapshots in a RecapSpotlight (the recap mechanic is structurally three
// side-by-side sub-beats, not a single live cluster, so sub-beats carry
// their own dot instances — visually identical to the corresponding main
// layouts).
//
// Every frame derives from cues[id].startFrame + a named layout.ts offset.
// Every easing uses EASE.* from the motion kit. Zero frame literals, zero
// raw motion literals, zero hardcoded color/typography.

import { interpolate, useCurrentFrame } from "remotion";
import { AbsoluteFill } from "remotion";
import { Breathe, FXDefs, GlintFlash } from "../fx";
import { EASE, PopIn } from "../motion-primitives";
import { IconAsset, LabelCallout, LessonIntroCard, RecapSpotlight, TeacherMark, UnitBlock } from "../shape-primitives";
import { colors, typography, video } from "../theme";
import { measureProps, useMeasureHook } from "./_measure/measureHook";
import { kptestFenyuheSixCues } from "./kptestFenyuheSixLessonTimeline";
import { cueMap } from "./timingTypes";
import {
  ANNOUNCE_BOND_ONE_AND_FIVE_DURATION_FRAMES,
  ANNOUNCE_TITLE_DURATION_FRAMES,
  BOND_GLYPH_TARGET_SIZE,
  BOND_GLYPH_X,
  BOND_GLYPH_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CLIMAX_SPLIT_MOTION_DURATION_FRAMES,
  CONSERVE_ONE_FIVE_BOND_HE_DURATION_FRAMES,
  CONSERVE_THREE_THREE_BOND_HE_DURATION_FRAMES,
  CONSERVE_TWO_FOUR_BOND_HE_DURATION_FRAMES,
  DOT_FADE_IN_FRAMES,
  DOT_Y,
  MERGE_MOTION_DURATION_FRAMES,
  QUESTION_PROMPT_MIC_SIZE,
  QUESTION_PROMPT_RING_RADIUS,
  QUESTION_PROMPT_X,
  QUESTION_PROMPT_Y,
  REVEAL_ANSWER_MOTION_START_FRAMES,
  REVEAL_ANSWER_RING_RADIUS,
  REVEAL_ANSWER_THREE_THREE_DISPLAY_FRAMES,
  RECAP_BEAT_ONE_AND_FIVE_FRAMES,
  RECAP_BEAT_THREE_AND_THREE_FRAMES,
  RECAP_BEAT_TWO_AND_FOUR_FRAMES,
  RECAP_BEAT_Y,
  RECAP_DOT_SIZE,
  RECAP_RING_RADIUS,
  SPLIT_MOTION_DURATION_FRAMES,
  SPLIT_THREE_THREE_BOND_THREE_AND_THREE_DURATION_FRAMES,
  SPLIT_TWO_FOUR_BOND_TWO_AND_FOUR_DURATION_FRAMES,
  TEACHING_UNIT_TARGET_SIZE,
  TITLE_TARGET_SIZE,
  TITLE_X,
  TITLE_Y,
  ZONE_OBJECTS,
  getRecapBeatX,
  mainDotPositionsForLayout,
  recapSubBeatDotPositions,
  type DotLayout,
} from "./kptestFenyuheSix/layout";

// ---------------------------------------------------------------------------
// Cue lookup — every absolute frame below derives from cues[id].startFrame +
// a named layout.ts constant. ZERO master-timeline literals.
// ---------------------------------------------------------------------------
const cues = cueMap(kptestFenyuheSixCues);

const c = {
  announce: () => cues["cue-announce-split-1of5"],
  conserve1: () => cues["cue-conserve-1of5"],
  split24: () => cues["cue-split-2of4"],
  conserve24: () => cues["cue-conserve-2of4"],
  split33: () => cues["cue-split-3of3"],
  conserve33: () => cues["cue-conserve-3of3"],
  learnerGap: () => cues["cue-learner-response-gap"],
  reveal: () => cues["cue-reveal-answer"],
  recap: () => cues["cue-spaced-recap-all-three"],
};

// ---------------------------------------------------------------------------
// Interpolation helpers — every progress() call passes a named EASE.* curve.
// ---------------------------------------------------------------------------
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// A progress with a named EASE applied — used everywhere we want the kid-eye
// motion to be on a named curve.
const eased = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number,
) =>
  interpolate(
    frame,
    [start, Math.max(start + 1, start + duration)],
    [0, 1],
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

// ---------------------------------------------------------------------------
// Per-cue motion-window table. Returns the cue-relative frame at which the
// dot layout transition starts, and how long it lasts. Single source of
// truth — the bond-glyph phase and the dot-motion phase are linked.
// ---------------------------------------------------------------------------
type MotionWindow = { start: number; duration: number };

const MOTION_WINDOWS: Record<string, MotionWindow> = {
  "cue-announce-split-1of5": {
    start:
      ANNOUNCE_TITLE_DURATION_FRAMES +
      ANNOUNCE_BOND_ONE_AND_FIVE_DURATION_FRAMES,
    duration: SPLIT_MOTION_DURATION_FRAMES,
  },
  "cue-conserve-1of5": {
    start: CONSERVE_ONE_FIVE_BOND_HE_DURATION_FRAMES,
    duration: MERGE_MOTION_DURATION_FRAMES,
  },
  "cue-split-2of4": {
    start: SPLIT_TWO_FOUR_BOND_TWO_AND_FOUR_DURATION_FRAMES,
    duration: SPLIT_MOTION_DURATION_FRAMES,
  },
  "cue-conserve-2of4": {
    start: CONSERVE_TWO_FOUR_BOND_HE_DURATION_FRAMES,
    duration: MERGE_MOTION_DURATION_FRAMES,
  },
  "cue-split-3of3": {
    start: SPLIT_THREE_THREE_BOND_THREE_AND_THREE_DURATION_FRAMES,
    duration: CLIMAX_SPLIT_MOTION_DURATION_FRAMES,
  },
  "cue-conserve-3of3": {
    start: CONSERVE_THREE_THREE_BOND_HE_DURATION_FRAMES,
    duration: MERGE_MOTION_DURATION_FRAMES,
  },
  "cue-reveal-answer": {
    start: REVEAL_ANSWER_MOTION_START_FRAMES,
    duration: SPLIT_MOTION_DURATION_FRAMES,
  },
};

// What layout the dots transition TO for each cue. The dots' previous layout
// is the previous cue's end layout (state chain).
const CUE_TARGET_LAYOUT: Record<string, DotLayout> = {
  "cue-announce-split-1of5": "SPLIT_1_5",
  "cue-conserve-1of5": "WHOLE",
  "cue-split-2of4": "SPLIT_2_4",
  "cue-conserve-2of4": "WHOLE",
  "cue-split-3of3": "SPLIT_3_3",
  "cue-conserve-3of3": "WHOLE",
  "cue-learner-response-gap": "WHOLE",
  "cue-reveal-answer": "SPLIT_3_3",
  // recap is driven by the per-sub-beat layout, not this table
};

// Per-cue easing curve for the dot motion. cue-split-3of3 is the climax
// (EASE.outQuint per visual-design §3 motion vocabulary); everything else
// is the standard EASE.inOutCubic.
const CUE_MOTION_EASING: Record<string, (t: number) => number> = {
  "cue-announce-split-1of5": EASE.inOutCubic,
  "cue-conserve-1of5": EASE.inOutCubic,
  "cue-split-2of4": EASE.inOutCubic,
  "cue-conserve-2of4": EASE.inOutCubic,
  "cue-split-3of3": EASE.outQuint,
  "cue-conserve-3of3": EASE.inOutCubic,
  "cue-reveal-answer": EASE.inOutCubic,
};

// ---------------------------------------------------------------------------
// Dot positions for the main scene's six-dot identity-invariant group.
// Returns null if the dots are not visible at this frame; otherwise returns
// six x positions and a per-group opacity.
// ---------------------------------------------------------------------------
type DotState = {
  xPositions: number[];
  opacity: number;
  // layout for the cluster envelope (used by the Breathe anchor)
  currentLayout: DotLayout;
};

function dotStateAt(frame: number): DotState | null {
  // The six dots are visible from the START of cue 1's motion phase through
  // the END of cue 8 (cue-reveal-answer). They are HIDDEN during:
  //   - cue 1's title + bond phases (per announce-topic + model-target-slow
  //     "nothing on top" requirement),
  //   - the entire recap (cue 9) where the recap sub-beats take over.
  const announce = c.announce();
  const recap = c.recap();

  if (frame >= recap.startFrame) {
    return null;
  }

  const dotMountFrame =
    announce.startFrame +
    ANNOUNCE_TITLE_DURATION_FRAMES +
    ANNOUNCE_BOND_ONE_AND_FIVE_DURATION_FRAMES;
  if (frame < dotMountFrame) {
    return null;
  }

  // Walk the cue list; find the cue containing this frame.
  const cueList = kptestFenyuheSixCues;
  let containingCueId: string | null = null;
  for (const cue of cueList) {
    if (frame >= cue.startFrame && frame < cue.endFrame) {
      containingCueId = cue.id;
      break;
    }
  }
  if (!containingCueId) {
    // Between cues (shouldn't happen — cues chain end-to-end); use the
    // previous cue's end layout.
    let prev: DotLayout = "WHOLE";
    for (const cue of cueList) {
      if (cue.endFrame <= frame) {
        prev = CUE_TARGET_LAYOUT[cue.id] ?? "WHOLE";
      }
    }
    return {
      xPositions: mainDotPositionsForLayout(prev),
      opacity: 1,
      currentLayout: prev,
    };
  }

  // For cues with an explicit target layout, compute the motion transition.
  const target = CUE_TARGET_LAYOUT[containingCueId];
  if (!target) {
    return null;
  }
  const cue = cueList.find((cue) => cue.id === containingCueId)!;
  const window = MOTION_WINDOWS[containingCueId];
  // Cues that declare a target layout but no motion window (currently
  // cue-learner-response-gap, which holds the WHOLE state statically during
  // the silent gap) render the target layout with opacity 1 and no
  // transition. Treating them as a 0-duration window is correct.
  if (!window) {
    return {
      xPositions: mainDotPositionsForLayout(target),
      opacity: 1,
      currentLayout: target,
    };
  }
  const easing = CUE_MOTION_EASING[containingCueId] ?? EASE.inOutCubic;
  const motionStart = cue.startFrame + window.start;
  const motionEnd = motionStart + window.duration;
  // Previous layout: the layout held BEFORE this cue's motion started.
  // For cue 1, the previous layout is "WHOLE" (the dots appear in a row
  // at the start of the motion, then split). For cues 2-6, the previous
  // layout is the previous cue's target layout.
  const previousLayout: DotLayout =
    containingCueId === "cue-announce-split-1of5"
      ? "WHOLE"
      : previousCueTargetLayout(containingCueId);

  // Motion progress (eased) within the window.
  const t =
    frame <= motionStart
      ? 0
      : frame >= motionEnd
        ? 1
        : clamp01(eased(frame, motionStart, window.duration, easing));

  const fromPositions = mainDotPositionsForLayout(previousLayout);
  const toPositions = mainDotPositionsForLayout(target);
  const positions = fromPositions.map((x, i) => lerp(x, toPositions[i], t));

  // Opacity: fade in across the first DOT_FADE_IN_FRAMES of the motion
  // window, then hold at 1.
  const opacity =
    frame <= motionStart
      ? 0
      : frame >= motionStart + DOT_FADE_IN_FRAMES
        ? 1
        : clamp01(
            (frame - motionStart) / Math.max(1, DOT_FADE_IN_FRAMES),
          );

  return {
    xPositions: positions,
    opacity,
    currentLayout: t < 1 ? previousLayout : target,
  };
}

// Previous cue's target layout (state chain).
const CUE_ORDER: readonly string[] = [
  "cue-announce-split-1of5",
  "cue-conserve-1of5",
  "cue-split-2of4",
  "cue-conserve-2of4",
  "cue-split-3of3",
  "cue-conserve-3of3",
  "cue-learner-response-gap",
  "cue-reveal-answer",
];

function previousCueTargetLayout(cueId: string): DotLayout {
  const idx = CUE_ORDER.indexOf(cueId);
  if (idx <= 0) return "WHOLE";
  const prev = CUE_ORDER[idx - 1];
  return CUE_TARGET_LAYOUT[prev] ?? "WHOLE";
}

// ---------------------------------------------------------------------------
// Bond glyph state. Returns the bond text + opacity for the frame, or null
// if no bond glyph is visible.
// ---------------------------------------------------------------------------
const BOND_TEXT_BY_CUE: Record<string, string> = {
  "cue-announce-split-1of5": "一和五",
  "cue-conserve-1of5": "合",
  "cue-split-2of4": "二和四",
  "cue-conserve-2of4": "合",
  "cue-split-3of3": "三和三",
  "cue-conserve-3of3": "合",
};

const BOND_DURATION_BY_CUE: Record<string, number> = {
  "cue-announce-split-1of5": ANNOUNCE_BOND_ONE_AND_FIVE_DURATION_FRAMES,
  "cue-conserve-1of5": CONSERVE_ONE_FIVE_BOND_HE_DURATION_FRAMES,
  "cue-split-2of4": SPLIT_TWO_FOUR_BOND_TWO_AND_FOUR_DURATION_FRAMES,
  "cue-conserve-2of4": CONSERVE_TWO_FOUR_BOND_HE_DURATION_FRAMES,
  "cue-split-3of3": SPLIT_THREE_THREE_BOND_THREE_AND_THREE_DURATION_FRAMES,
  "cue-conserve-3of3": CONSERVE_THREE_THREE_BOND_HE_DURATION_FRAMES,
};

// cue 1's bond starts AFTER the title phase.
const BOND_OFFSET_BY_CUE: Record<string, number> = {
  "cue-announce-split-1of5": ANNOUNCE_TITLE_DURATION_FRAMES,
  "cue-conserve-1of5": 0,
  "cue-split-2of4": 0,
  "cue-conserve-2of4": 0,
  "cue-split-3of3": 0,
  "cue-conserve-3of3": 0,
};

// cue 5 uses motion="bouncy" PopIn for the ONE bouncy entrance per video.
const BOUNCY_BOND_CUE = "cue-split-3of3";

type BondState = {
  text: string;
  opacity: number;
  isBouncy: boolean;
  cueId: string;
};

function bondStateAt(frame: number): BondState | null {
  for (const cueId of Object.keys(BOND_TEXT_BY_CUE)) {
    const cue = cues[cueId];
    if (!cue) continue;
    const offset = BOND_OFFSET_BY_CUE[cueId];
    const dur = BOND_DURATION_BY_CUE[cueId];
    const from = cue.startFrame + offset;
    const to = from + dur;
    if (frame >= from && frame < to) {
      // Opacity ramps 0→1 over the first 12f of the window (fade-in),
      // holds at 1, then 1→0 over the last 6f (fade-out before motion).
      const fadeIn = clamp01((frame - from) / 12);
      const fadeOut = clamp01((to - frame) / 6);
      const opacity = Math.min(fadeIn, fadeOut);
      return {
        text: BOND_TEXT_BY_CUE[cueId],
        opacity,
        isBouncy: cueId === BOUNCY_BOND_CUE,
        cueId,
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Title state (cue 1 only). The title reads alone during the announce phase,
// then fades out as the bond-glyph "一和五" enters. The LessonIntroCard's
// internal stagger drives the entrance (progress 0→1 over the first 12f),
// holds at 1, then the wrapper opacity ramps 1→0 across the last 18f so the
// title hands the canvas to the bond glyph without a hard cut.
// ---------------------------------------------------------------------------
const TITLE_FADE_OUT_FRAMES = 18;
type TitleState = { progress: number; opacity: number };

function titleStateAt(frame: number): TitleState | null {
  const cue = c.announce();
  const from = cue.startFrame;
  const to = from + ANNOUNCE_TITLE_DURATION_FRAMES;
  if (frame < from || frame >= to) return null;
  // Card progress: ramps 0→1 over the first 12f, holds at 1 for the middle.
  const progress = clamp01((frame - from) / 12);
  // Wrapper opacity: 1 from 12f through (duration - fadeOut), then 1→0.
  const fadeOutStart = Math.max(12, ANNOUNCE_TITLE_DURATION_FRAMES - TITLE_FADE_OUT_FRAMES);
  const opacity =
    frame <= fadeOutStart
      ? 1
      : clamp01((to - frame) / TITLE_FADE_OUT_FRAMES);
  return { progress, opacity };
}

// ---------------------------------------------------------------------------
// Question-prompt state (cue 7). Returns opacity + ringProgress for the
// PulseCircle, or null.
// ---------------------------------------------------------------------------
type QuestionState = { opacity: number; ringProgress: number };

function questionStateAt(frame: number): QuestionState | null {
  const cue = c.learnerGap();
  if (frame < cue.startFrame || frame >= cue.endFrame) return null;
  const local = frame - cue.startFrame;
  // Question display: held through the ENTIRE cue window (the silence is
  // the SIGNAL — the prompt label stays as the "your turn" affordance).
  const opacity = 1;
  // Ring envelope: pulse on, hold, pulse off. A 2-cycle breathe so the
  // ring draws the eye to the held silence without being twitchy.
  // 0..1..0 over 60f, repeated across the gap.
  const phase = (local / 60) % 1;
  const ringProgress = Math.sin(phase * Math.PI);
  return { opacity, ringProgress };
}

// ---------------------------------------------------------------------------
// Recap state (cue 9). Returns the active sub-beat index, the ring center
// (interpolated to the active sub-beat), and the ring's draw/fade progress.
// ---------------------------------------------------------------------------
type RecapState = {
  activeIndex: 0 | 1 | 2;
  ringX: number;
  ringY: number;
  ringProgress: number;
};

function recapStateAt(frame: number): RecapState | null {
  const cue = c.recap();
  if (frame < cue.startFrame || frame >= cue.endFrame) return null;
  const local = frame - cue.startFrame;
  // Active sub-beat from cue-relative frame.
  let activeIndex: 0 | 1 | 2 = 0;
  let subBeatStart = 0;
  if (local < RECAP_BEAT_ONE_AND_FIVE_FRAMES) {
    activeIndex = 0;
    subBeatStart = 0;
  } else if (
    local <
    RECAP_BEAT_ONE_AND_FIVE_FRAMES + RECAP_BEAT_TWO_AND_FOUR_FRAMES
  ) {
    activeIndex = 1;
    subBeatStart = RECAP_BEAT_ONE_AND_FIVE_FRAMES;
  } else {
    activeIndex = 2;
    subBeatStart =
      RECAP_BEAT_ONE_AND_FIVE_FRAMES + RECAP_BEAT_TWO_AND_FOUR_FRAMES;
  }
  const subBeatDur =
    activeIndex === 0
      ? RECAP_BEAT_ONE_AND_FIVE_FRAMES
      : activeIndex === 1
        ? RECAP_BEAT_TWO_AND_FOUR_FRAMES
        : RECAP_BEAT_THREE_AND_THREE_FRAMES;
  // Ring center: at the active sub-beat's x (no interpolation between
  // sub-beats — the ring snaps to the new active sub-beat on transition).
  // The first 6f of a sub-beat, the ring fades in from 0; the last 9f it
  // fades out.
  const inBeatLocal = local - subBeatStart;
  const ringProgress = Math.min(
    clamp01(inBeatLocal / 6),
    clamp01((subBeatDur - inBeatLocal) / 9),
  );
  return {
    activeIndex,
    ringX: getRecapBeatX(activeIndex),
    ringY: RECAP_BEAT_Y,
    ringProgress,
  };
}

// ---------------------------------------------------------------------------
// TeacherMark (cue 5 only) — the climax underline beneath the 3|3 clusters.
// The underline lands AS the 3|3 split reaches its final cluster positions
// (per sketch-overlay.md §3). The split motion ends at cue.startFrame +
// CLIMAX_SPLIT_MOTION_DURATION_FRAMES. The underline begins 15 frames into
// the post-climax dwell.
// ---------------------------------------------------------------------------
const UNDERLINE_REL_START = 60; // cue 5: motion end is 60, underline lands 15f into dwell = 75
const UNDERLINE_REL_DRAW_START = UNDERLINE_REL_START;
const UNDERLINE_DRAW_DURATION = 24;
const UNDERLINE_REL_FADE_START_FROM_END = 9; // 9 frames before cue end

type UnderlineState = {
  drawProgress: number;
  opacity: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
} | null;

function underlineStateAt(frame: number): UnderlineState {
  const cue = c.split33();
  if (frame < cue.startFrame || frame >= cue.endFrame) return null;
  // Anchor: from the bottom-left of the left cluster to the bottom-right
  // of the right cluster, with a slight dip DOWN (archHeight = -30) so the
  // underline reads as "groups these two as a bound pair" (sketch-overlay §3).
  const splitPositions = mainDotPositionsForLayout("SPLIT_3_3");
  // The first 3 indices are the left cluster; the last 3 are the right.
  const leftMostX = splitPositions[0];
  const rightMostX = splitPositions[5];
  const halfDot = TEACHING_UNIT_TARGET_SIZE / 2;
  const yBottom = DOT_Y + halfDot + 18;
  const start = { x: leftMostX - halfDot, y: yBottom };
  const end = { x: rightMostX + halfDot, y: yBottom };
  // Draw progress: 0→1 over UNDERLINE_DRAW_DURATION starting at +75.
  const drawFrom = cue.startFrame + UNDERLINE_REL_DRAW_START;
  const drawTo = drawFrom + UNDERLINE_DRAW_DURATION;
  const drawProgress =
    frame <= drawFrom
      ? 0
      : frame >= drawTo
        ? 1
        : clamp01((frame - drawFrom) / UNDERLINE_DRAW_DURATION);
  // Fade-out: UNDERLINE_REL_FADE_START_FROM_END frames before cue end.
  const fadeFrom = cue.endFrame - UNDERLINE_REL_FADE_START_FROM_END;
  const opacity =
    frame <= drawFrom
      ? 0
      : frame >= fadeFrom
        ? clamp01((cue.endFrame - frame) / UNDERLINE_REL_FADE_START_FROM_END)
        : 1;
  return { drawProgress, opacity, start, end };
}

// ---------------------------------------------------------------------------
// Sunshine transient ring (cue 8 only) — single transient highlight at the
// midpoint of cue-reveal-answer. A GlintFlash (one-shot flash) at the
// 3|3 cluster's center.
// ---------------------------------------------------------------------------
function sunshineRevealStartFrame(): number {
  return (
    c.reveal().startFrame +
    Math.floor(REVEAL_ANSWER_THREE_THREE_DISPLAY_FRAMES / 2) -
    9
  );
}

// ===========================================================================
// Scene component (PascalCase — required for react-hooks/rules-of-hooks).
// ===========================================================================
export const KptestFenyuheSixLessonScene: React.FC = () => {
  const frame = useCurrentFrame();
  // Inert in normal renders; under the --measured pass it logs each
  // [data-mid] element's true getBBox per frame.
  useMeasureHook();

  // ---- Derived scene state ----
  const dots = dotStateAt(frame);
  const bond = bondStateAt(frame);
  const title = titleStateAt(frame);
  const question = questionStateAt(frame);
  const recap = recapStateAt(frame);
  const underline = underlineStateAt(frame);
  const revealCue = c.reveal();
  const sunshineStartFrame = sunshineRevealStartFrame();
  const sunshineActive =
    frame >= sunshineStartFrame &&
    frame < sunshineStartFrame + 18 &&
    frame >= revealCue.startFrame &&
    frame < revealCue.endFrame;

  // ---- Dot breath anchor (centroid of live dots) ----
  const dotCentroidX =
    dots && dots.opacity > 0.05
      ? dots.xPositions.reduce((a, x) => a + x, 0) / dots.xPositions.length
      : ZONE_OBJECTS.x + ZONE_OBJECTS.width / 2;
  const dotCentroidY = DOT_Y;

  // ---- Recap sub-beat nodes (for the RecapSpotlight) ----
  // Each sub-beat is a static group of 6 dots in its X+Y layout, centered
  // on the sub-beat's x. The dots' COLOR is the same reward orange
  // (visual-design §3 palette) — identity preserved by type/color/size.
  const recapSubBeatNodes: React.ReactNode[] = ([0, 1, 2] as const).map(
    (beatIndex) => {
      const positions = recapSubBeatDotPositions(beatIndex);
      // 6 dots in their cluster layout, in zone-objects vertical center.
      return (
        <g key={`recap-beat-${beatIndex}`}>
          {positions.map((p, i) => (
            <UnitBlock
              color={colors.reward}
              key={`recap-${beatIndex}-dot-${i}`}
              size={RECAP_DOT_SIZE}
              variant="dot"
              x={p.x}
              y={p.y}
            />
          ))}
        </g>
      );
    },
  );

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
            SIX DOTS — identity-invariant for cues 1-8 (cue 9 = recap).
            Same six React <UnitBlock variant="dot"> instances throughout
            the main scene; positions interpolate per-frame from the cue's
            target layout + motion progress. The Breathe wrap gives the
            held cluster a rule-of-#6 moving-hold pulse.
            ================================================================ */}
        {dots && dots.opacity > 0.001 ? (
          <Breathe
            amplitudeScale={0.005}
            bpm={15}
            drift={0.4}
            originX={dotCentroidX}
            originY={dotCentroidY}
            phaseSeed="kp6-dot-group"
          >
            <g {...measureProps("six-dots")} opacity={dots.opacity}>
              {dots.xPositions.map((x, i) => (
                <UnitBlock
                  color={colors.reward}
                  key={`dot-${i}`}
                  size={TEACHING_UNIT_TARGET_SIZE}
                  variant="dot"
                  x={x}
                  y={DOT_Y}
                />
              ))}
            </g>
          </Breathe>
        ) : null}

        {/* =================================================================
            TITLE — cue-announce-split-1of5 phase 1. Reads ALONE first.
            LessonIntroCard with card surface OFF (cream canvas is the
            only background per Visual Contract §1 decoration-budget).
            ================================================================ */}
        {title ? (
          <g {...measureProps("title")} opacity={title.opacity}>
            <Breathe
              amplitudeScale={0.004}
              bpm={14}
              originX={TITLE_X}
              originY={TITLE_Y}
              phaseSeed="kp6-title"
            >
              <LessonIntroCard
                accentColor="coral"
                card={false}
                progress={title.progress}
                title="6的分与合"
                titleColor="textNavy"
                titleSize={TITLE_TARGET_SIZE}
                x={TITLE_X}
                y={TITLE_Y}
              />
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            BOND GLYPH — the Chinese bond phrase in zone-labels. Reads
            ALONE in cue 1 (announce-topic + model-target-slow require
            "nothing on top"). For cues 2-6, the bond glyph appears in
            zone-labels WHILE the dots are visible in zone-objects (the
            zones are disjoint; no occlusion). The bouncy PopIn entrance
            fires on cue 5's "三和三" (the ONE accent moment per video).
            ================================================================ */}
        {bond && bond.opacity > 0.001 ? (
          <g {...measureProps("bond-glyph")} opacity={bond.opacity}>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              originX={BOND_GLYPH_X}
              originY={BOND_GLYPH_Y}
              phaseSeed={`kp6-bond-${bond.cueId}`}
            >
              {bond.isBouncy ? (
                <PopIn
                  delay={cues[bond.cueId].startFrame + (BOND_OFFSET_BY_CUE[bond.cueId] ?? 0)}
                  motion="bouncy"
                  originX={BOND_GLYPH_X}
                  originY={BOND_GLYPH_Y}
                >
                  <LabelCallout
                    color="textNavy"
                    fontSize={BOND_GLYPH_TARGET_SIZE}
                    fontWeight={900}
                    progress={1}
                    text={bond.text}
                    x={BOND_GLYPH_X}
                    y={BOND_GLYPH_Y}
                  />
                </PopIn>
              ) : (
                <LabelCallout
                  color="textNavy"
                  fontSize={BOND_GLYPH_TARGET_SIZE}
                  fontWeight={900}
                  progress={1}
                  text={bond.text}
                  x={BOND_GLYPH_X}
                  y={BOND_GLYPH_Y}
                />
              )}
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            QUESTION PROMPT — cue-learner-response-gap. The prompt label
            "6可以分成几和几?" + a PulseCircle (eye-drawer) + a mic glyph.
            Three readable parts per the learner-response-gap rule; a bare
            low-opacity glow is FORBIDDEN. Held through the entire gap
            (the silence is the SIGNAL).
            ================================================================ */}
        {question ? (
          <g {...measureProps("question-prompt")}>
            {/* PulseCircle (eye-drawer) around the prompt */}
            <circle
              cx={QUESTION_PROMPT_X}
              cy={QUESTION_PROMPT_Y}
              fill="none"
              opacity={question.ringProgress * 0.4}
              r={QUESTION_PROMPT_RING_RADIUS}
              stroke={colors.sunshine}
              strokeWidth={5}
            />
            <circle
              cx={QUESTION_PROMPT_X}
              cy={QUESTION_PROMPT_Y}
              fill="none"
              opacity={question.ringProgress * 0.25}
              r={QUESTION_PROMPT_RING_RADIUS * 0.75}
              stroke={colors.sunshine}
              strokeWidth={4}
            />
            {/* Mic glyph (to the LEFT of the label) */}
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              originX={QUESTION_PROMPT_X - 240}
              originY={QUESTION_PROMPT_Y}
              phaseSeed="kp6-mic"
            >
              <g
                opacity={question.opacity}
                transform={`translate(${QUESTION_PROMPT_X - 240} ${QUESTION_PROMPT_Y})`}
              >
                <IconAsset
                  name="microphone"
                  variant="color"
                  width={QUESTION_PROMPT_MIC_SIZE}
                />
              </g>
            </Breathe>
            {/* Prompt label (centered) */}
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              originX={QUESTION_PROMPT_X}
              originY={QUESTION_PROMPT_Y}
              phaseSeed="kp6-prompt"
            >
              <LabelCallout
                color="textNavy"
                fontSize={60}
                fontWeight={900}
                progress={question.opacity}
                text="6可以分成几和几？"
                x={QUESTION_PROMPT_X}
                y={QUESTION_PROMPT_Y}
              />
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            RECAP — cue-spaced-recap-all-three. Three sub-beats (1|5, 2|4,
            3|3) side by side in zone-recap-row, dimmed/highlighted by the
            RecapSpotlight's currentHighlight. A sunshine transient ring
            (the recap's ONE allowed emphasis) sits on the active sub-beat
            and fades in/out across the sub-beat's window.
            ================================================================ */}
        {recap ? (
          <g {...measureProps("recap")}>
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              originX={recap.ringX}
              originY={recap.ringY}
              phaseSeed="kp6-recap"
            >
              <RecapSpotlight
                currentHighlight={recap.activeIndex}
                dimOpacity={0.32}
                ringCenter={[recap.ringX, recap.ringY]}
                ringColor="sunshine"
                ringProgress={recap.ringProgress}
                ringRadius={RECAP_RING_RADIUS}
                subBeats={recapSubBeatNodes}
              />
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            SUNSHINE TRANSIENT HIGHLIGHT — cue-reveal-answer midpoint
            (visual-design §2 "single transient sunshine highlight at
            midpoint"). A GlintFlash one-shot at the 3|3 cluster's center.
            ================================================================ */}
        {sunshineActive ? (
          <GlintFlash
            color={colors.sunshine}
            durationInFrames={18}
            size={REVEAL_ANSWER_RING_RADIUS}
            startFrame={sunshineStartFrame}
            x={ZONE_OBJECTS.x + ZONE_OBJECTS.width / 2}
            y={DOT_Y}
          />
        ) : null}

        {/* =================================================================
            TEACHERMARK UNDERLINE — cue-split-3of3 climax celebration
            (sketch-overlay.md §3). Drawn under the 3|3 clusters with a
            slight downward dip (archHeight = -32) to group them as a
            bound pair. Co-times with the 3|3 split's final positions.
            ================================================================ */}
        {underline ? (
          <g {...measureProps("underline-3of3")} opacity={underline.opacity * 0.92}>
            <TeacherMark
              anchor={{
                end: underline.end,
                kind: "span",
                start: underline.start,
              }}
              drawProgress={underline.drawProgress}
              jitterSeed={42}
              kind="underline"
              pathParams={{ archHeight: -32 }}
              settle={{ magnitude: 0.08 }}
              strokeColor="textNavy"
              strokeWidth={4}
            />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

// Re-export the video dims for callers (Complete wrapper may import).
export const KPTEST_FENYUHE_SIX_VIDEO = video;
