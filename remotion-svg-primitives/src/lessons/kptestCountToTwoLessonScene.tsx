// kptest-count-to-two — lesson scene (Wave 4a composer).
// ZERO frame literals: every frame = cues[id].startFrame + named layout offset.
// ZERO raw easing literals: every curve = EASE.* / SPRING.* from motion-primitives.
//
// CUE-ID TRUTH (self-scan C2): this lesson has THREE frozen cues — announce-topic
// / cue-1-count / cue-2-cardinality (kptestCountToTwoClips). cue-1-count narrates
// BOTH apples ("一个苹果来了——一;再来一个苹果——二"), so apple-1 and apple-2 are
// sub-beats INSIDE cue-1-count (anchored by layout offsets), not separate cues.
// The wrong 4-id vocabulary (lesson-intro / first-apple-one / second-apple-two /
// cardinality) is retired. Cue ids resolve through the throwing, union-typed
// accessors from the timeline module — a wrong id is a COMPILE error or THROWS,
// never a silent frame-0 fallback.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { AlignedLessonCue } from "@studio/narration-kit";
import {
  KPTEST_COUNT_TO_TWO_CUE_IDS,
} from "./kptestCountToTwoLessonTimeline";
import { makeCueAccessors } from "./_cues/cueAccessors";

import { colors } from "../theme";
import { EASE } from "../motion-primitives/curves";
import { PopIn } from "../motion-primitives/PopIn";
import { SparkleBurst } from "../motion-primitives/SparkleBurst";
import {
  CountableObject,
  CountStepIndicator,
  LessonIntroCard,
  NumberCard,
} from "../shape-primitives";
import { Breathe } from "../fx";
import { measureProps, useMeasureHook } from "./_measure/measureHook";

import {
  APPLE_1_CX,
  APPLE_1_POPIN_REL_START,
  APPLE_2_CX,
  APPLE_2_POPIN_REL_START,
  APPLE_CY,
  APPLE_SIZE,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CARDINAL_CX,
  CARDINAL_CY,
  CARDINAL_H,
  CARDINAL_POPIN_REL_START,
  CARDINAL_SPARKLE_REL_START,
  CARDINAL_W,
  INTRO_CARD_CX,
  INTRO_CARD_CY,
  INTRO_REVEAL_DUR,
  INTRO_REVEAL_START_REL,
  INTRO_TITLE_SIZE,
  TAG_1_CX,
  TAG_1_CY,
  TAG_1_POPIN_REL_START,
  TAG_2_CX,
  TAG_2_CY,
  TAG_2_POPIN_REL_START,
  TAG_DIM_DUR,
  TAG_DIM_FLOOR,
  TAG_DIM_REL_START,
  TAG_SIZE,
} from "./kptestCountToTwo/layout";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const progressBetween = (
  frame: number,
  startFrame: number,
  durationFrames: number,
): number =>
  clamp01(durationFrames <= 0 ? 1 : (frame - startFrame) / durationFrames);

// ─── APPLE ROW (identity-invariant cast) ─────────────────────────────────────
// Two CountableObject variant=fruit at the SAME reward tone + same size across
// the whole video. Each apple has ONE stable id for its whole life.
const AppleRow: React.FC<{
  apple1Visible: boolean;
  apple2Visible: boolean;
  apple1PopInAbs: number;
  apple2PopInAbs: number;
}> = ({ apple1Visible, apple2Visible, apple1PopInAbs, apple2PopInAbs }) => {
  // Wrap the identity-invariant cast in a single Breathe group so no frame is
  // frozen (rule #6). Single anchor at the row center keeps the breath
  // symmetric; phaseSeed desyncs it from the tag Breathe.
  return (
    <Breathe
      amplitudeScale={0.005}
      bpm={15}
      drift={0.5}
      originX={CANVAS_WIDTH / 2}
      originY={APPLE_CY}
      phaseSeed="kptest-count-to-two-apples"
    >
      {apple1Visible && (
        <g {...measureProps("apple-1")}>
          <PopIn
            delay={apple1PopInAbs}
            motion="snap"
            originX={APPLE_1_CX}
            originY={APPLE_CY}
          >
            <CountableObject
              color={colors.reward}
              size={APPLE_SIZE}
              variant="fruit"
              x={APPLE_1_CX}
              y={APPLE_CY}
            />
          </PopIn>
        </g>
      )}
      {apple2Visible && (
        <g {...measureProps("apple-2")}>
          <PopIn
            delay={apple2PopInAbs}
            motion="snap"
            originX={APPLE_2_CX}
            originY={APPLE_CY}
          >
            <CountableObject
              color={colors.reward}
              size={APPLE_SIZE}
              variant="fruit"
              x={APPLE_2_CX}
              y={APPLE_CY}
            />
          </PopIn>
        </g>
      )}
    </Breathe>
  );
};

// ─── PER-APPLE TAG ROW (zone-counts, above each apple) ────────────────────────
// Each tag carries ONE stable id; the value is the per-apple count (1, then 2).
// In C4 tags dim to TAG_DIM_FLOOR (still visible, supporting context).
const TagRow: React.FC<{
  frame: number;
  tag1AttachAbs: number;
  tag2AttachAbs: number;
  tag1Visible: boolean;
  tag2Visible: boolean;
  tagDimStartAbs: number;
}> = ({
  frame,
  tag1AttachAbs,
  tag2AttachAbs,
  tag1Visible,
  tag2Visible,
  tagDimStartAbs,
}) => {
  // C4 dim factor: 1.0 → TAG_DIM_FLOOR across TAG_DIM_DUR from tagDimStartAbs.
  // Driven as a child opacity (not on the measureProps <g>) so the measure sees
  // the tag at its base bbox; the dim is a presentation layer.
  const dimFactor = interpolate(
    frame,
    [tagDimStartAbs + TAG_DIM_REL_START, tagDimStartAbs + TAG_DIM_REL_START + TAG_DIM_DUR],
    [1, TAG_DIM_FLOOR],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE.inOutCubic,
    },
  );

  return (
    <Breathe
      amplitudeScale={0.005}
      bpm={15}
      drift={0.3}
      originX={CANVAS_WIDTH / 2}
      originY={(TAG_1_CY + TAG_2_CY) / 2}
      phaseSeed="kptest-count-to-two-tags"
    >
      {tag1Visible && (
        <g {...measureProps("tag-1")}>
          <PopIn
            delay={tag1AttachAbs}
            motion="snap"
            originX={TAG_1_CX}
            originY={TAG_1_CY}
          >
            <g opacity={dimFactor}>
              <CountStepIndicator
                size={TAG_SIZE}
                value={1}
                x={TAG_1_CX}
                y={TAG_1_CY}
              />
            </g>
          </PopIn>
        </g>
      )}
      {tag2Visible && (
        <g {...measureProps("tag-2")}>
          <PopIn
            delay={tag2AttachAbs}
            motion="snap"
            originX={TAG_2_CX}
            originY={TAG_2_CY}
          >
            <g opacity={dimFactor}>
              <CountStepIndicator
                size={TAG_SIZE}
                value={2}
                x={TAG_2_CX}
                y={TAG_2_CY}
              />
            </g>
          </PopIn>
        </g>
      )}
    </Breathe>
  );
};

// ─── CARDINAL (C4 focal: NumberCard value=2 emerges over the whole group) ───
const Cardinal: React.FC<{
  cardinalPopInAbs: number;
}> = ({ cardinalPopInAbs }) => {
  return (
    <g {...measureProps("cardinal")}>
      <PopIn
        delay={cardinalPopInAbs}
        motion="bouncy"
        originX={CARDINAL_CX}
        originY={CARDINAL_CY}
      >
        <NumberCard
          color={colors.coral}
          height={CARDINAL_H}
          value={2}
          width={CARDINAL_W}
          x={CARDINAL_CX}
          y={CARDINAL_CY}
        />
      </PopIn>
    </g>
  );
};

// ─── MAIN SCENE ──────────────────────────────────────────────────────────────

export const KptestCountToTwoLessonScene: React.FC<{
  cues: readonly AlignedLessonCue[];
}> = ({ cues: cuesArray }) => {
  const frame = useCurrentFrame();
  useMeasureHook(); // once at the scene root (inert outside the measured pass)

  const { cStart, cEnd } = makeCueAccessors(cuesArray, KPTEST_COUNT_TO_TWO_CUE_IDS);

  // ─── Cue window shorthands ───────────────────────────────────────────────
  // Three frozen cues; apple-1 and apple-2 are sub-beats of cue-1-count (both
  // apples are narrated there), anchored by layout offsets within that window.
  const introStart = cStart("announce-topic");
  const introEnd = cEnd("announce-topic");
  const firstAppleStart = cStart("cue-1-count");
  const secondAppleStart = cStart("cue-1-count");
  const cardinalityStart = cStart("cue-2-cardinality");

  // ─── Visibility gates (per-cue elements live across their cue window) ────
  // Intro card reads FIRST, ALONE (announce-topic requires) — it is the ONLY
  // element on stage until C1 ends. Cast (apples + tags) does NOT enter here.
  const introVisible = frame >= introStart && frame <= introEnd;

  // Apple 1: enters at C2 + APPLE_1_POPIN_REL_START, lives the rest of the
  // video (identity-invariant cast).
  const apple1PopInAbs = firstAppleStart + APPLE_1_POPIN_REL_START;
  const apple1Visible = frame >= apple1PopInAbs;

  // Apple 2: enters at C3 + APPLE_2_POPIN_REL_START, lives the rest of the
  // video. Apple 1 stays visible-and-quiet (no re-entry) — that's the cast
  // preserving identity across C2 → C4.
  const apple2PopInAbs = secondAppleStart + APPLE_2_POPIN_REL_START;
  const apple2Visible = frame >= apple2PopInAbs;

  // Tag 1: attaches AFTER apple 1 settles (C2 + APPLE_1_POPIN_REL_START +
  // APPLE_1_POPIN_DUR), lives through C4 (dimmed).
  const tag1AttachAbs = firstAppleStart + TAG_1_POPIN_REL_START;
  const tag1Visible = frame >= tag1AttachAbs;

  // Tag 2: attaches AFTER apple 2 settles (C3 + APPLE_2_POPIN_REL_START +
  // APPLE_2_POPIN_DUR = C3 + 48), lives through C4 (dimmed).
  const tag2AttachAbs = secondAppleStart + TAG_2_POPIN_REL_START;
  const tag2Visible = frame >= tag2AttachAbs;

  // Cardinal: emerges at C4 + CARDINAL_POPIN_REL_START (cue head) — visible
  // before the spoken 两 onset (frame 6 of C4). Lives through C4 end.
  const cardinalPopInAbs = cardinalityStart + CARDINAL_POPIN_REL_START;
  const cardinalVisible = frame >= cardinalPopInAbs;

  // C4 dim start (when cardinal begins — tags quiet into background).
  const tagDimStartAbs = cardinalityStart;

  // ─── Intro card progress (progress drives the card's write-on) ───────────
  const introProgress = progressBetween(
    frame,
    introStart + INTRO_REVEAL_START_REL,
    INTRO_REVEAL_DUR,
  );

  // ─── ONE Sparkle accent at the cardinal bouncy peak (C4 only) ─────────────
  // Decoration: NO measureProps (decoration carries no measure tag per the
  // manifest contract — FxDefs is not needed for SparkleBurst; the burst
  // renders its own star shapes).
  const sparkleStartAbs = cardinalityStart + CARDINAL_SPARKLE_REL_START;
  const sparkleVisible =
    frame >= sparkleStartAbs && frame < sparkleStartAbs + 36;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height={CANVAS_HEIGHT}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        width={CANVAS_WIDTH}
      >
        {/* ─── INTRO CARD (C1, reads ALONE first) ─────────────────────── */}
        {introVisible && (
          <g {...measureProps("intro-card")}>
            <LessonIntroCard
              card
              progress={introProgress}
              section="数苹果"
              teaser="最后一个数，就是一共多少个"
              title="数到二"
              titleSize={INTRO_TITLE_SIZE}
              x={INTRO_CARD_CX}
              y={INTRO_CARD_CY}
            />
          </g>
        )}

        {/* ─── CARDINAL (C4 focal — emerges over the whole group) ───── */}
        {cardinalVisible && (
          <Cardinal cardinalPopInAbs={cardinalPopInAbs} />
        )}

        {/* ─── APPLE ROW (identity-invariant cast, C2 onward) ──────────── */}
        {(apple1Visible || apple2Visible) && (
          <AppleRow
            apple1PopInAbs={apple1PopInAbs}
            apple1Visible={apple1Visible}
            apple2PopInAbs={apple2PopInAbs}
            apple2Visible={apple2Visible}
          />
        )}

        {/* ─── TAG ROW (per-apple count badges, C2 onward; dim in C4) ─── */}
        {(tag1Visible || tag2Visible) && (
          <TagRow
            frame={frame}
            tag1AttachAbs={tag1AttachAbs}
            tag1Visible={tag1Visible}
            tag2AttachAbs={tag2AttachAbs}
            tag2Visible={tag2Visible}
            tagDimStartAbs={tagDimStartAbs}
          />
        )}

        {/* ─── ONE Sparkle accent at the cardinal bouncy peak (decoration) */}
        {sparkleVisible && (
          <SparkleBurst
            color={colors.reward}
            count={8}
            durationInFrames={24}
            radius={80}
            startFrame={sparkleStartAbs}
            x={CARDINAL_CX}
            y={CARDINAL_CY}
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};