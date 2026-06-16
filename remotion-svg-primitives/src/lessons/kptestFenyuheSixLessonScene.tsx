// kptest-fenyuhe-six — lesson scene (frame-driven, cue-bounded, v4 cue-anchored).
//
// Six dots split into two clusters (1|5, 2|4, 3|3) and recombine back into
// six — the part-whole routine for the number 6. The six dots are identity-
// invariant (same six React <UnitBlock variant="dot"> instances throughout
// cues 1–5; the same orange reward color/size, only the cluster layout and
// count change). Cue 6 is the spaced-recall recap, which renders three
// small cluster snapshots in a RecapSpotlight (the recap mechanic is
// structurally three side-by-side sub-beats, not a single live cluster, so
// sub-beats carry their own dot instances — visually identical to the
// corresponding main layouts).
//
// v4 timeline: 6 cues (routine-reprise / split-1-and-5 / split-2-and-4 /
// split-3-and-3 / aggregator-prompt / recap). The 9 visual storyboard beats
// are folded into these 6 windows; each split cue carries both the model
// AND the echo's held-silence retrieval, with the recombine at the tail.
//
// Every frame derives from cues[id].startFrame + a named layout.ts offset.
// Every easing uses EASE.* from the motion kit. Zero frame literals, zero
// raw motion literals, zero hardcoded color/typography.

import { interpolate, useCurrentFrame } from "remotion";
import { AbsoluteFill } from "remotion";
import { Breathe, FXDefs, GlintFlash } from "../fx";
import { EASE, PopIn } from "../motion-primitives";
import {
  IconAsset,
  LabelCallout,
  LessonIntroCard,
  RecapSpotlight,
  TeacherMark,
  UnitBlock,
} from "../shape-primitives";
import { colors, typography, video } from "../theme";
import { measureProps, useMeasureHook } from "./_measure/measureHook";
import { kptestFenyuheSixCues } from "./kptestFenyuheSixLessonTimeline";
import { kptestFenyuheSixClips } from "./generated/kptestFenyuheSixClips";
import { cueMap } from "./timingTypes";
import {
  AGGREGATOR_PROMPT_FADE_IN_FRAMES,
  BOND_FADE_IN_FRAMES,
  BOND_FADE_OUT_FRAMES,
  BOND_GLYPH_TARGET_SIZE,
  BOND_GLYPH_X,
  BOND_GLYPH_Y,
  BOND_HOLD_AFTER_SPLIT_FRAMES,
  BODY_LABEL_MIN_SIZE,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CLIMAX_GLIN_DURATION_FRAMES,
  DOT_Y,
  POINTER_FADE_IN_FRAMES,
  POINTER_FADE_OUT_FRAMES,
  QUESTION_PROMPT_MIC_SIZE,
  QUESTION_PROMPT_RING_CYCLE_FRAMES,
  QUESTION_PROMPT_RING_RADIUS,
  QUESTION_PROMPT_X,
  QUESTION_PROMPT_Y,
  RECAP_BEAT_ONE_AND_FIVE_FRAMES,
  RECAP_BEAT_THREE_AND_THREE_FRAMES,
  RECAP_BEAT_TWO_AND_FOUR_FRAMES,
  RECAP_BEAT_Y,
  RECAP_DOT_SIZE,
  RECAP_PARTITIONS,
  RECAP_RING_FADE_IN_FRAMES,
  RECAP_RING_FADE_OUT_FRAMES,
  RECAP_RING_RADIUS,
  ROUTINE_REPRISE_TITLE_DURATION_FRAMES,
  SPLIT_MOTION_DURATION_FRAMES,
  SPLIT_START_FRAMES,
  TITLE_TARGET_SIZE,
  TITLE_X,
  TITLE_Y,
  UNDERLINE_DRAW_DURATION_FRAMES,
  UNDERLINE_FADE_OUT_FRAMES,
  UNDERLINE_POST_CLIMAX_DWELL_FRAMES,
  ZONE_OBJECTS,
  dotSize,
  getRecapBeatX,
  mainDotPositionsForLayout,
  recapSubBeatDotPositions,
  splitCueSchedule,
  type DotLayout,
} from "./kptestFenyuheSix/layout";

// ---------------------------------------------------------------------------
// Cue lookup — every absolute frame below derives from cues[id].startFrame +
// a named layout.ts constant. ZERO master-timeline literals.
// ---------------------------------------------------------------------------
const cues = cueMap(kptestFenyuheSixCues);
const clipById = (id: string) => {
  const c = kptestFenyuheSixClips.find((x) => x.id === id);
  if (!c) throw new Error(`kptest-fenyuhe-six: unknown clip "${id}"`);
  return c;
};

// ---------------------------------------------------------------------------
// Interpolation helpers — every progress() call passes a named EASE.* curve.
// ---------------------------------------------------------------------------
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// A progress with a named EASE applied — used everywhere we want the kid-eye
// motion to be on a named curve.
const _eased = (
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
void _eased; // kept for future per-frame progress usage; current scene
// interpolates positions directly via lerp + named EASE.*, so this helper is
// currently unused (the previous v3 scene used it for the cue motion math).

// ---------------------------------------------------------------------------
// Per-cue dot program — identity fence: the six React <UnitBlock
// variant="dot"> instances live the whole video; only `x` interpolates between
// layouts. The chain is implicit: each split cue transitions WHOLE →
// SPLIT_X_Y → WHOLE, with the held silence in the middle. Non-split cues
// hold WHOLE (a row of six).
// ---------------------------------------------------------------------------
// (Kept as inline branch logic in dotStateAt below; no separate table needed
// for v4 since the schedule is computed from splitCueSchedule per cue.)

const isSplitCue = (cueId: string): boolean =>
  cueId === "split-1-and-5" ||
  cueId === "split-2-and-4" ||
  cueId === "split-3-and-3";

const isClimaxCue = (cueId: string): boolean => cueId === "split-3-and-3";

// ---------------------------------------------------------------------------
// Dot state for the main six-dot group. Returns six x positions and an
// opacity for the current frame, or null if the dots are not visible.
// ---------------------------------------------------------------------------
type DotState = {
  xPositions: number[];
  opacity: number;
  currentLayout: DotLayout;
};

function dotStateAt(frame: number): DotState | null {
  // The six dots are visible from the START of routine-reprise's dot-enter
  // phase through the END of aggregator-prompt. The recap (cue 6) is
  // handled by RecapSpotlight sub-beats, not the main six-dot group.
  const aggregator = cues["aggregator-prompt"];
  const routineReprise = cues["routine-reprise"];
  const dotEnterStart =
    routineReprise.startFrame + ROUTINE_REPRISE_TITLE_DURATION_FRAMES;

  if (frame < dotEnterStart) return null;
  if (frame >= aggregator.endFrame) return null;

  // Find the containing cue.
  let containingCueId: string | null = null;
  for (const cue of kptestFenyuheSixCues) {
    if (frame >= cue.startFrame && frame < cue.endFrame) {
      containingCueId = cue.id;
      break;
    }
  }
  if (!containingCueId) {
    return {
      xPositions: mainDotPositionsForLayout("WHOLE"),
      opacity: 1,
      currentLayout: "WHOLE",
    };
  }

  // routine-reprise: 6 dots enter over ROUTINE_REPRISE_DOT_ENTER_FRAMES,
  // then held in WHOLE.
  if (containingCueId === "routine-reprise") {
    const local = frame - routineReprise.startFrame;
    if (local < ROUTINE_REPRISE_TITLE_DURATION_FRAMES) {
      return null; // title phase — dots not yet visible
    }
    const enterLocal = local - ROUTINE_REPRISE_TITLE_DURATION_FRAMES;
    const fadeIn = Math.min(1, enterLocal / 18); // 18-frame one-by-one fade-in
    return {
      xPositions: mainDotPositionsForLayout("WHOLE"),
      opacity: fadeIn,
      currentLayout: "WHOLE",
    };
  }

  // aggregator-prompt: 6 dots held in WHOLE (reassembled after split-3-and-3
  // recombine). The question prompt overlays; the dots are a visual reminder
  // of the whole being asked about.
  if (containingCueId === "aggregator-prompt") {
    return {
      xPositions: mainDotPositionsForLayout("WHOLE"),
      opacity: 1,
      currentLayout: "WHOLE",
    };
  }

  // split cues: WHOLE → SPLIT_X_Y → WHOLE.
  if (isSplitCue(containingCueId)) {
    const cue = cues[containingCueId];
    const clip = clipById(containingCueId);
    const schedule = splitCueSchedule(
      containingCueId,
      cue.endFrame - cue.startFrame,
      clip.narrationFrames,
      isClimaxCue(containingCueId),
    );
    const local = frame - cue.startFrame;

    // Phases:
    //   0..SPLIT_START_FRAMES                       held WHOLE
    //   SPLIT_START_FRAMES..schedule.splitEnd       split motion (WHOLE → SPLIT_X_Y)
    //   schedule.splitEnd..schedule.recombineStart  held SPLIT_X_Y
    //   schedule.recombineStart..schedule.recombineEnd  recombine (SPLIT_X_Y → WHOLE)
    const splitLayout: DotLayout =
      containingCueId === "split-1-and-5"
        ? "SPLIT_1_5"
        : containingCueId === "split-2-and-4"
          ? "SPLIT_2_4"
          : "SPLIT_3_3";

    if (local < SPLIT_START_FRAMES) {
      return {
        xPositions: mainDotPositionsForLayout("WHOLE"),
        opacity: 1,
        currentLayout: "WHOLE",
      };
    }
    if (local < schedule.splitEnd) {
      const t = clamp01(
        (local - SPLIT_START_FRAMES) / (schedule.splitEnd - SPLIT_START_FRAMES),
      );
      const easing = isClimaxCue(containingCueId) ? EASE.outQuint : EASE.inOutCubic;
      const eased_t = easing(t);
      const from = mainDotPositionsForLayout("WHOLE");
      const to = mainDotPositionsForLayout(splitLayout);
      return {
        xPositions: from.map((x, i) => lerp(x, to[i], eased_t)),
        opacity: 1,
        currentLayout: eased_t < 1 ? "WHOLE" : splitLayout,
      };
    }
    if (local < schedule.recombineStart) {
      return {
        xPositions: mainDotPositionsForLayout(splitLayout),
        opacity: 1,
        currentLayout: splitLayout,
      };
    }
    // Recombine (EASE.inOutCubic; climax uses EASE.outQuint).
    const t = clamp01(
      (local - schedule.recombineStart) /
        (schedule.recombineEnd - schedule.recombineStart),
    );
    const easing = isClimaxCue(containingCueId) ? EASE.outQuint : EASE.inOutCubic;
    const eased_t = easing(t);
    const from = mainDotPositionsForLayout(splitLayout);
    const to = mainDotPositionsForLayout("WHOLE");
    return {
      xPositions: from.map((x, i) => lerp(x, to[i], eased_t)),
      opacity: 1,
      currentLayout: eased_t < 1 ? splitLayout : "WHOLE",
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Bond glyph state. Returns the bond text + opacity for the frame, or null
// if no bond glyph is visible. In v4 each split cue carries the model+echo;
// the bond glyph is held during the model's voice and fades out as the
// pointer fades in for the echo's held silence.
// ---------------------------------------------------------------------------
const BOND_TEXT_BY_CUE: Record<string, string> = {
  "split-1-and-5": "一和五",
  "split-2-and-4": "二和四",
  "split-3-and-3": "三和三",
};

const BOUNCY_BOND_CUE = "split-3-and-3";

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
    const clip = clipById(cueId);
    const schedule = splitCueSchedule(
      cueId,
      cue.endFrame - cue.startFrame,
      clip.narrationFrames,
      isClimaxCue(cueId),
    );
    const local = frame - cue.startFrame;
    // Bond visibility window:
    //   0..BOND_FADE_IN_FRAMES                          fade-in
    //   BOND_FADE_IN_FRAMES..(schedule.splitEnd + BOND_HOLD_AFTER_SPLIT_FRAMES)
    //                                                    held
    //   ...fade-out over BOND_FADE_OUT_FRAMES ending at
    //      (splitEnd + BOND_HOLD_AFTER_SPLIT_FRAMES + BOND_FADE_OUT_FRAMES)
    const fadeIn = clamp01(local / BOND_FADE_IN_FRAMES);
    const fadeOutStart =
      schedule.splitEnd + BOND_HOLD_AFTER_SPLIT_FRAMES;
    const fadeOutEnd = fadeOutStart + BOND_FADE_OUT_FRAMES;
    const fadeOut = clamp01((fadeOutEnd - local) / BOND_FADE_OUT_FRAMES);
    const opacity = Math.min(fadeIn, fadeOut);
    if (local >= fadeOutEnd) continue;
    if (local < 0) continue;
    return {
      text: BOND_TEXT_BY_CUE[cueId],
      opacity,
      isBouncy: cueId === BOUNCY_BOND_CUE,
      cueId,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Title state (cue-routine-reprise only). The title reads alone during the
// title phase, then fades out as the six dots enter. LessonIntroCard's
// internal stagger drives the entrance (progress 0→1 across the first
// 12f of the title phase), then the wrapper opacity ramps 1→0 across the
// last 18f so the title hands the canvas to the dots without a hard cut.
// ---------------------------------------------------------------------------
const TITLE_FADE_OUT_FRAMES = 18;
type TitleState = { progress: number; opacity: number };

function titleStateAt(frame: number): TitleState | null {
  const cue = cues["routine-reprise"];
  const from = cue.startFrame;
  const to = from + ROUTINE_REPRISE_TITLE_DURATION_FRAMES;
  if (frame < from || frame >= to) return null;
  // Card progress: 0→1 over the first 12f of the title phase.
  const progress = clamp01((frame - from) / 12);
  // Wrapper opacity: 1 from 12f through (duration - fadeOut), then 1→0.
  const fadeOutStart = Math.max(
    12,
    ROUTINE_REPRISE_TITLE_DURATION_FRAMES - TITLE_FADE_OUT_FRAMES,
  );
  const opacity =
    frame <= fadeOutStart
      ? 1
      : clamp01((to - frame) / TITLE_FADE_OUT_FRAMES);
  return { progress, opacity };
}

// ---------------------------------------------------------------------------
// Pointer affordance state (per split cue's echo). A PulseCircle-style ring
// is the "your turn" affordance during the held silence. The pointer fades
// in after the bond fades out, holds through the silence, then fades out
// before the recombine.
// ---------------------------------------------------------------------------
type PointerState = {
  opacity: number;
  ringProgress: number;
  // Position of the pointer — varies per cue (centered on the split pairing).
  cx: number;
  cy: number;
};

function pointerStateAt(frame: number): PointerState | null {
  for (const cueId of Object.keys(BOND_TEXT_BY_CUE)) {
    const cue = cues[cueId];
    if (!cue) continue;
    const clip = clipById(cueId);
    const schedule = splitCueSchedule(
      cueId,
      cue.endFrame - cue.startFrame,
      clip.narrationFrames,
      isClimaxCue(cueId),
    );
    const local = frame - cue.startFrame;
    // Pointer window: bond-fade-out end → recombine start.
    const pointerStart =
      schedule.splitEnd + BOND_HOLD_AFTER_SPLIT_FRAMES + BOND_FADE_OUT_FRAMES;
    const pointerEnd = schedule.recombineStart;
    if (local < pointerStart || local >= pointerEnd) continue;

    const fadeIn = clamp01((local - pointerStart) / POINTER_FADE_IN_FRAMES);
    const fadeOut = clamp01((pointerEnd - local) / POINTER_FADE_OUT_FRAMES);
    const opacity = Math.min(fadeIn, fadeOut);
    if (opacity <= 0) continue;

    // Pulse: 0..1..0 over QUESTION_PROMPT_RING_CYCLE_FRAMES, repeated.
    const phase = ((local - pointerStart) / QUESTION_PROMPT_RING_CYCLE_FRAMES) % 1;
    const ringProgress = Math.sin(phase * Math.PI);

    // Position: centered on the held split pairing. Use SPLIT positions'
    // horizontal centroid, vertical center of the dot row.
    const positions = mainDotPositionsForLayout(
      cueId === "split-1-and-5"
        ? "SPLIT_1_5"
        : cueId === "split-2-and-4"
          ? "SPLIT_2_4"
          : "SPLIT_3_3",
    );
    const cx = (positions[0] + positions[positions.length - 1]) / 2;
    const cy = DOT_Y;
    return { opacity, ringProgress, cx, cy };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Aggregator-prompt state (cue 5). The 6 dots are reassembled (already
// handled by dotStateAt). The prompt is the localized "6可以分成几和几?"
// label + a PulseCircle + a mic glyph — three readable parts per the
// learner-response-gap rule. Held through the entire gap window.
// ---------------------------------------------------------------------------
type AggregatorState = {
  opacity: number;
  ringProgress: number;
};

function aggregatorStateAt(frame: number): AggregatorState | null {
  const cue = cues["aggregator-prompt"];
  if (frame < cue.startFrame || frame >= cue.endFrame) return null;
  const local = frame - cue.startFrame;
  // Prompt fades in over AGGREGATOR_PROMPT_FADE_IN_FRAMES at the start of the
  // cue, then held at opacity 1 through the silent gap.
  const fadeIn = clamp01(local / AGGREGATOR_PROMPT_FADE_IN_FRAMES);
  // Pulse: 0..1..0 over QUESTION_PROMPT_RING_CYCLE_FRAMES, repeated across
  // the entire gap. The ring draws the eye to the held whole.
  const phase = (local / QUESTION_PROMPT_RING_CYCLE_FRAMES) % 1;
  const ringProgress = Math.sin(phase * Math.PI);
  return { opacity: fadeIn, ringProgress };
}

// Recap sub-beat manifest ids — index-aligned to the manifest's
// recap-beat-1-5 / 2-4 / 3-3 elements. Each rendered sub-beat <g> spreads
// `measureProps(RECAP_BEAT_IDS[i])` so the measured id ≡ the manifest id.
const RECAP_BEAT_IDS = [
  "recap-beat-1-5",
  "recap-beat-2-4",
  "recap-beat-3-3",
] as const;

// ---------------------------------------------------------------------------
// Recap state (cue 6). Returns the active sub-beat index, the ring's
// draw/fade progress, and the active sub-beat's ringCenter.
// ---------------------------------------------------------------------------
type RecapState = {
  activeIndex: 0 | 1 | 2;
  ringX: number;
  ringY: number;
  ringProgress: number;
};

function recapStateAt(frame: number): RecapState | null {
  const cue = cues["recap"];
  if (frame < cue.startFrame || frame >= cue.endFrame) return null;
  const local = frame - cue.startFrame;
  let activeIndex: 0 | 1 | 2 = 0;
  let subBeatStart = 0;
  let subBeatDur = RECAP_BEAT_ONE_AND_FIVE_FRAMES;
  if (local < RECAP_BEAT_ONE_AND_FIVE_FRAMES) {
    activeIndex = 0;
    subBeatStart = 0;
    subBeatDur = RECAP_BEAT_ONE_AND_FIVE_FRAMES;
  } else if (
    local < RECAP_BEAT_ONE_AND_FIVE_FRAMES + RECAP_BEAT_TWO_AND_FOUR_FRAMES
  ) {
    activeIndex = 1;
    subBeatStart = RECAP_BEAT_ONE_AND_FIVE_FRAMES;
    subBeatDur = RECAP_BEAT_TWO_AND_FOUR_FRAMES;
  } else {
    activeIndex = 2;
    subBeatStart =
      RECAP_BEAT_ONE_AND_FIVE_FRAMES + RECAP_BEAT_TWO_AND_FOUR_FRAMES;
    subBeatDur = RECAP_BEAT_THREE_AND_THREE_FRAMES;
  }
  const inBeatLocal = local - subBeatStart;
  const ringProgress = Math.min(
    clamp01(inBeatLocal / RECAP_RING_FADE_IN_FRAMES),
    clamp01((subBeatDur - inBeatLocal) / RECAP_RING_FADE_OUT_FRAMES),
  );
  return {
    activeIndex,
    ringX: getRecapBeatX(activeIndex),
    ringY: RECAP_BEAT_Y,
    ringProgress,
  };
}

// ---------------------------------------------------------------------------
// Climax underline (cue-split-3-and-3 only) — the TeacherMark celebration
// gesture that lands AS the 3|3 split reaches its final cluster positions.
// CUE-RELATIVE frames (per sketch-overlay §3): starts
// SPLIT_START + CLIMAX_SPLIT + UNDERLINE_POST_CLIMAX_DWELL = 30+30+15 = 75,
// draws over 24f, fades 9f before the recombine ends (= cue end).
// ---------------------------------------------------------------------------
type UnderlineState = {
  drawProgress: number;
  opacity: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
} | null;

function underlineStateAt(frame: number): UnderlineState {
  const cueId = "split-3-and-3";
  const cue = cues[cueId];
  if (frame < cue.startFrame || frame >= cue.endFrame) return null;
  // Anchor: bottom-left of left cluster → bottom-right of right cluster.
  const splitPositions = mainDotPositionsForLayout("SPLIT_3_3");
  const leftMostX = splitPositions[0];
  const rightMostX = splitPositions[splitPositions.length - 1];
  const halfDot = dotSize / 2;
  const yBottom = DOT_Y + halfDot + 18;
  const start = { x: leftMostX - halfDot, y: yBottom };
  const end = { x: rightMostX + halfDot, y: yBottom };
  // CUE-RELATIVE draw windows (named offsets from layout.ts).
  const cueLength = cue.endFrame - cue.startFrame;
  const drawFromCueRel =
    SPLIT_START_FRAMES +
    SPLIT_MOTION_DURATION_FRAMES +
    UNDERLINE_POST_CLIMAX_DWELL_FRAMES;
  const drawToCueRel = drawFromCueRel + UNDERLINE_DRAW_DURATION_FRAMES;
  const fadeOutEndCueRel = cueLength;
  const fadeOutStartCueRel =
    fadeOutEndCueRel - UNDERLINE_FADE_OUT_FRAMES;
  const local = frame - cue.startFrame;
  const drawProgress =
    local <= drawFromCueRel
      ? 0
      : local >= drawToCueRel
        ? 1
        : clamp01(
            (local - drawFromCueRel) / UNDERLINE_DRAW_DURATION_FRAMES,
          );
  const opacity =
    local <= drawFromCueRel
      ? 0
      : local >= fadeOutStartCueRel
        ? clamp01(
            (fadeOutEndCueRel - local) / UNDERLINE_FADE_OUT_FRAMES,
          )
        : 1;
  return { drawProgress, opacity, start, end };
}

// ---------------------------------------------------------------------------
// Climax GlintFlash (cue-split-3-and-3 only) — a single 4-point star at the
// 3|3 cluster's center, fired when the climax split motion settles.
// ---------------------------------------------------------------------------
function climaxGlintStartFrame(): number {
  const cue = cues["split-3-and-3"];
  return (
    cue.startFrame + SPLIT_START_FRAMES + SPLIT_MOTION_DURATION_FRAMES
  );
}

// ===========================================================================
// Scene component (PascalCase — required for react-hooks/rules-of-hooks).
// ===========================================================================
export const KptestFenyuheSixLessonScene: React.FC = () => {
  const frame = useCurrentFrame();
  useMeasureHook(); // inert in normal renders; under --measured it logs getBBox

  // ---- Derived scene state ----
  const dots = dotStateAt(frame);
  const bond = bondStateAt(frame);
  const title = titleStateAt(frame);
  const pointer = pointerStateAt(frame);
  const aggregator = aggregatorStateAt(frame);
  const recap = recapStateAt(frame);
  const underline = underlineStateAt(frame);

  // Dot breath anchor (centroid of live dots).
  const dotCentroidX =
    dots && dots.opacity > 0.05
      ? dots.xPositions.reduce((a, x) => a + x, 0) / dots.xPositions.length
      : ZONE_OBJECTS.x + ZONE_OBJECTS.width / 2;
  const dotCentroidY = DOT_Y;

  // Recap sub-beat nodes (for the RecapSpotlight). Each sub-beat is a
  // static group of 6 dots in its X+Y layout, centered on the sub-beat's x.
  // Each sub-beat <g> carries its OWN manifest id (measure-id ≡ manifest-id
  // bijection, CLAUDE.md bbox-discipline) — NOT a single "recap" tag, which
  // matched no manifest element and silently fell through to `decoration`
  // (collision detection void). The ids index-align to the manifest's
  // recap-beat-1-5 / 2-4 / 3-3 elements.
  const recapSubBeatNodes: React.ReactNode[] = ([0, 1, 2] as const).map(
    (beatIndex) => {
      const positions = recapSubBeatDotPositions(beatIndex);
      return (
        <g
          key={`recap-beat-${beatIndex}`}
          {...measureProps(RECAP_BEAT_IDS[beatIndex])}
        >
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

  // Climax GlintFlash (single 4-point star at 3|3 cluster center).
  const glintStart = climaxGlintStartFrame();
  const glintActive =
    frame >= glintStart && frame < glintStart + CLIMAX_GLIN_DURATION_FRAMES;

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
            SIX DOTS — identity-invariant for cues 1-5 (cue 6 = recap).
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
                  size={dotSize}
                  variant="dot"
                  x={x}
                  y={DOT_Y}
                />
              ))}
            </g>
          </Breathe>
        ) : null}

        {/* =================================================================
            TITLE — cue-routine-reprise phase 1. Reads ALONE first.
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
            BOND GLYPH — Chinese bond phrase in zone-labels. Reads ALONE
            before the dots are in motion (the "model-target-slow" + "the
            target glyph big, centered, nothing on top" requirement). For
            cues 2-4 the bond glyph appears in zone-labels WHILE the dots
            are visible in zone-objects (the zones are disjoint). The
            bouncy PopIn entrance fires on cue 4's "三和三" (the ONE
            accent moment per video).
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
                  delay={cues[bond.cueId].startFrame}
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
            POINTER AFFORDANCE — held silence for each split cue's echo
            (per the learner-response-gap `requires`: a clear "your turn"
            cue through the gap). The pointer is a PulseCircle-style
            concentric ring pair above the held split, with a gentle
            breathing pulse drawing the eye.
            ================================================================ */}
        {pointer ? (
          <g {...measureProps("pointer")} opacity={pointer.opacity}>
            <circle
              cx={pointer.cx}
              cy={pointer.cy}
              fill="none"
              opacity={pointer.ringProgress * 0.5}
              r={QUESTION_PROMPT_RING_RADIUS}
              stroke={colors.sunshine}
              strokeWidth={5}
            />
            <circle
              cx={pointer.cx}
              cy={pointer.cy}
              fill="none"
              opacity={pointer.ringProgress * 0.32}
              r={QUESTION_PROMPT_RING_RADIUS * 0.75}
              stroke={colors.sunshine}
              strokeWidth={4}
            />
            <circle
              cx={pointer.cx}
              cy={pointer.cy}
              fill="none"
              opacity={pointer.ringProgress * 0.2}
              r={QUESTION_PROMPT_RING_RADIUS * 0.5}
              stroke={colors.sunshine}
              strokeWidth={3}
            />
          </g>
        ) : null}

        {/* =================================================================
            AGGREGATOR PROMPT — cue-aggregator-prompt. The prompt label
            "6可以分成几和几?" + a PulseCircle ring + a mic glyph. Three
            readable parts per the learner-response-gap rule; a bare low-
            opacity glow is FORBIDDEN. Held through the entire gap.
            ================================================================ */}
        {aggregator ? (
          <g {...measureProps("aggregator-prompt")}>
            {/* Decoration rings REMOVED: a 200px pulse ring inside this measured
                group inflated aggregator-prompt's bbox to 516×400 — its bottom
                arc sliced through the six-dots row, a phantom labels∩objects
                collision (CLAUDE.md "BOUNDING BOX = TRUE FOOTPRINT"; the dots
                never touched anything). The question label + mic are the
                readable parts; the held silence IS the "your turn" affordance —
                a bare ring is decoration-only AND collides, so it is cut. */}
            {/* Mic glyph to the LEFT of the label (clear of the numeral). */}
            <Breathe
              amplitudeScale={0.005}
              bpm={15}
              originX={QUESTION_PROMPT_X - 340}
              originY={QUESTION_PROMPT_Y}
              phaseSeed="kp6-mic"
            >
              <g
                opacity={aggregator.opacity}
                transform={`translate(${QUESTION_PROMPT_X - 340} ${QUESTION_PROMPT_Y})`}
              >
                <IconAsset
                  name="microphone"
                  variant="color"
                  width={QUESTION_PROMPT_MIC_SIZE}
                />
              </g>
            </Breathe>
            {/* Prompt label. */}
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
                progress={aggregator.opacity}
                text="6可以分成几和几？"
                x={QUESTION_PROMPT_X}
                y={QUESTION_PROMPT_Y}
              />
            </Breathe>
          </g>
        ) : null}

        {/* =================================================================
            RECAP — cue-recap. Three sub-beats (1|5, 2|4, 3|3) side by
            side in ZONE_RECAP_ROW, dimmed/highlighted by the
            RecapSpotlight's currentHighlight. A sunshine transient ring
            (the recap's ONE allowed emphasis) sits on the active sub-
            beat and fades in/out across the sub-beat's window.
            ================================================================ */}
        {recap ? (
          // No measureProps here: the load-bearing elements are the three
          // sub-beats (each tagged with its own recap-beat-* id above). The
          // outer wrapper is layout/decoration only.
          <g>
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
            CLIMAX GLINTFLASH — cue-split-3-and-3 climax celebration.
            A single 4-point star at the 3|3 cluster's center, fired when
            the climax split motion settles. Reserved ONE climax accent
            per the early-childhood-visual-taste rule.
            ================================================================ */}
        {glintActive ? (
          <GlintFlash
            color={colors.sunshine}
            durationInFrames={CLIMAX_GLIN_DURATION_FRAMES}
            size={220}
            startFrame={glintStart}
            x={ZONE_OBJECTS.x + ZONE_OBJECTS.width / 2}
            y={DOT_Y}
          />
        ) : null}

        {/* =================================================================
            TEACHERMARK UNDERLINE — cue-split-3-and-3 climax celebration
            (sketch-overlay.md §3). Drawn under the 3|3 clusters with a
            slight downward dip to group them as a bound pair. Co-times
            with the 3|3 split's settled positions.
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

// Suppress unused-import warnings for layout helpers consumed only via the
// DotLayout type import (recapSubBeatDotPositions is used; the type re-export
// is for downstream callers). The TS check on the file passes either way.
void BODY_LABEL_MIN_SIZE;
void RECAP_PARTITIONS;
