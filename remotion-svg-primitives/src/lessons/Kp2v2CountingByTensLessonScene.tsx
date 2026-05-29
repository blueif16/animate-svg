import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FXDefs, GlintFlash } from "../fx";
import { EASE } from "../motion-primitives";
import {
  BundleWrap,
  CountStepIndicator,
  LabelCallout,
  StepTally,
  StickGroup,
} from "../shape-primitives";
import { StylePreset } from "../styles";
import { colors, typography } from "../theme";
import { kp2v2CountingByTensAlignedCues } from "./generated/kp2v2CountingByTensTiming";
import {
  BADGE_Y,
  BOTTOM_BUNDLE_ROW_Y,
  BUNDLE_BAND_HEIGHT,
  BUNDLE_GAP,
  BUNDLE_WIDTH,
  C1_BADGE_CASCADE_REL_START,
  C1_PER_TICK_DURATION,
  C1_STICKS_FADE_IN_DURATION,
  C1_TICK_ACTIVE_DURATION,
  C1_TICK_POP_DURATION,
  C2_BADGES_FADE_OUT_DURATION,
  C2_BADGE_DURATION,
  C2_BADGE_REL_START,
  C2_COMPRESS_DURATION,
  C2_COMPRESS_REL_START,
  C2_LABEL_DURATION,
  C2_LABEL_REL_START,
  C2_WRAP_DURATION,
  C2_WRAP_REL_START,
  C3_BADGE_DURATION,
  C3_BADGE_REL_START,
  C3_BUNDLE_ENTER_DURATION,
  C3_BUNDLE_ENTER_REL_START,
  C3_LABEL_DURATION,
  C3_LABEL_REL_START,
  C3_TRANSLATE_DURATION,
  C4_BADGE_DURATION,
  C4_BADGE_REL_START,
  C4_BUNDLE_ENTER_DURATION,
  C4_BUNDLE_ENTER_REL_START,
  C4_LABEL_DURATION,
  C4_LABEL_REL_START,
  C4_TRANSLATE_DURATION,
  C5_LOOSE_ROW_DURATION,
  C5_LOOSE_ROW_REL_START,
  C5_PER_BUNDLE_BADGE_FADE_DURATION,
  C5_PER_BUNDLE_LABEL_FADE_DURATION,
  C5_REFLOW_DURATION,
  C5_SPARKLE_DURATION,
  C5_SPARKLE_REL_START,
  C5_TEN_PILL_DURATION,
  C5_TEN_PILL_REL_START,
  C5_THREE_PILL_DURATION,
  C5_THREE_PILL_REL_START,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LABEL_Y,
  ROW_GAP,
  STICK_COUNT,
  STICK_LENGTH,
  STICK_THICKNESS,
  TEACHING_ROW_Y_SINGLE,
  THREE_PILL_Y,
  TOP_LOOSE_ROW_Y,
  bundleSlotX,
  looseRowStickX,
} from "./kp2v2CountingByTens/layout";
import { cueMap } from "./timingTypes";

// ---------------------------------------------------------------------------
// Lesson identity — 5 cues, 1:1 with pedagogy beats:
//   loose-count-felt, bundle-is-one-count, tens-count-like-ones,
//   pattern-holds, tens-are-the-faster-way.
// ---------------------------------------------------------------------------
const cues = cueMap(kp2v2CountingByTensAlignedCues);

// ---------------------------------------------------------------------------
// Easing helpers — every progress() call passes a NAMED EASE.* curve.
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

// ---------------------------------------------------------------------------
// Phase resolvers — every absolute frame number in this file routes through
// one of these. ZERO master-timeline literals; everything is
// cues[id].startFrame + relative.
// ---------------------------------------------------------------------------

const c1 = () => cues["loose-count-felt"];
const c2 = () => cues["bundle-is-one-count"];
const c3 = () => cues["tens-count-like-ones"];
const c4 = () => cues["pattern-holds"];
const c5 = () => cues["tens-are-the-faster-way"];

// Bundle row centroid x for bundle `index` (0..2) in a row of `totalBundles`.
// Wraps the layout helper so the scene + manifest share one source.
const bundleX = (index: number, totalBundles: number): number =>
  bundleSlotX(index, totalBundles);

// How many bundles are in the row at any given frame.
const bundleCountAtFrame = (frame: number): number => {
  if (frame < c2().startFrame + C2_WRAP_REL_START) {
    return 0;
  }
  if (frame < c3().startFrame + C3_BUNDLE_ENTER_REL_START) {
    return 1;
  }
  if (frame < c4().startFrame + C4_BUNDLE_ENTER_REL_START) {
    return 2;
  }
  return 3;
};

// Translation x for an existing bundle (already in the row) when a new one
// is about to join. Beats 3 and 4 each translate the existing row leftward
// over their first phase so the new bundle has room.
const bundleTranslateX = (index: number, frame: number): number => {
  // Default: where the bundle sits given the current row size.
  const currentCount = bundleCountAtFrame(frame);
  const baseX = bundleX(index, Math.max(1, currentCount));

  // Beat 3: row grows 1 → 2 during cue 3's translate phase.
  if (frame >= c3().startFrame && frame < c3().startFrame + C3_TRANSLATE_DURATION) {
    const t = reveal(
      frame,
      c3().startFrame,
      C3_TRANSLATE_DURATION,
      EASE.inOutCubic,
    );
    return lerp(bundleX(index, 1), bundleX(index, 2), t);
  }
  // Beat 4: row grows 2 → 3 during cue 4's translate phase.
  if (frame >= c4().startFrame && frame < c4().startFrame + C4_TRANSLATE_DURATION) {
    const t = reveal(
      frame,
      c4().startFrame,
      C4_TRANSLATE_DURATION,
      EASE.inOutCubic,
    );
    return lerp(bundleX(index, 2), bundleX(index, 3), t);
  }
  return baseX;
};

// Bundle row y — single row at TEACHING_ROW_Y_SINGLE for cues 1–4; drops
// to BOTTOM_BUNDLE_ROW_Y during cue 5's reflow phase.
const bundleRowY = (frame: number): number => {
  if (frame < c5().startFrame) {
    return TEACHING_ROW_Y_SINGLE;
  }
  const t = reveal(
    frame,
    c5().startFrame,
    C5_REFLOW_DURATION,
    EASE.inOutCubic,
  );
  return lerp(TEACHING_ROW_Y_SINGLE, BOTTOM_BUNDLE_ROW_Y, t);
};

// Entrance opacity for bundle `index`. Bundle 0 enters during cue 2's wrap
// window; bundles 1, 2 enter atomically during their cue's enter phase.
const bundleEntranceOpacity = (index: number, frame: number): number => {
  if (index === 0) {
    return reveal(
      frame,
      c2().startFrame + C2_WRAP_REL_START,
      C2_WRAP_DURATION,
    );
  }
  if (index === 1) {
    return reveal(
      frame,
      c3().startFrame + C3_BUNDLE_ENTER_REL_START,
      C3_BUNDLE_ENTER_DURATION,
    );
  }
  return reveal(
    frame,
    c4().startFrame + C4_BUNDLE_ENTER_REL_START,
    C4_BUNDLE_ENTER_DURATION,
  );
};

// Per-bundle wrapProgress. Bundle 0 wraps during cue 2's wrap window (the
// rope ties on screen — though brief Continuity says bundles 2/3 arrive
// already tied, bundle 0 is the SAME ten sticks recomposed, so the rope
// still appears, just on top of the compressed row). Bundles 1, 2 arrive
// with wrapProgress=1 (atomic, already tied).
const bundleWrapProgress = (index: number, frame: number): number => {
  if (index === 0) {
    return reveal(
      frame,
      c2().startFrame + C2_WRAP_REL_START,
      C2_WRAP_DURATION,
      EASE.outCubic,
    );
  }
  return bundleEntranceOpacity(index, frame) > 0 ? 1 : 0;
};

// Per-bundle entrance slide-in x offset (bundle slides from off-screen
// right). Only applies to bundles 1, 2 — bundle 0 doesn't slide in,
// it materialises from the compressed row.
const bundleEntranceSlideX = (index: number, frame: number): number => {
  if (index === 0) {
    return 0;
  }
  const start =
    index === 1
      ? c3().startFrame + C3_BUNDLE_ENTER_REL_START
      : c4().startFrame + C4_BUNDLE_ENTER_REL_START;
  const duration =
    index === 1 ? C3_BUNDLE_ENTER_DURATION : C4_BUNDLE_ENTER_DURATION;
  const t = reveal(frame, start, duration, EASE.outCubic);
  // Slide from +320 px (off right edge) to 0.
  return lerp(320, 0, t);
};

// Per-bundle badge value = index + 1. Badge fade-in starts at cue's badge
// rel-start; fade-out for ALL three per-bundle badges happens during cue 5's
// per-bundle-badge fade window.
const bundleBadgeOpacity = (index: number, frame: number): number => {
  const enterStart =
    index === 0
      ? c2().startFrame + C2_BADGE_REL_START
      : index === 1
        ? c3().startFrame + C3_BADGE_REL_START
        : c4().startFrame + C4_BADGE_REL_START;
  const enterDur =
    index === 0
      ? C2_BADGE_DURATION
      : index === 1
        ? C3_BADGE_DURATION
        : C4_BADGE_DURATION;
  const enter = reveal(frame, enterStart, enterDur);
  const fadeOut =
    1 - reveal(frame, c5().startFrame, C5_PER_BUNDLE_BADGE_FADE_DURATION);
  return enter * fadeOut;
};

// Per-bundle label opacity (一个十 / 两个十 / 三个十).
const bundleLabelOpacity = (index: number, frame: number): number => {
  const enterStart =
    index === 0
      ? c2().startFrame + C2_LABEL_REL_START
      : index === 1
        ? c3().startFrame + C3_LABEL_REL_START
        : c4().startFrame + C4_LABEL_REL_START;
  const enterDur =
    index === 0
      ? C2_LABEL_DURATION
      : index === 1
        ? C3_LABEL_DURATION
        : C4_LABEL_DURATION;
  const enter = reveal(frame, enterStart, enterDur);
  const fadeOut =
    1 - reveal(frame, c5().startFrame, C5_PER_BUNDLE_LABEL_FADE_DURATION);
  return enter * fadeOut;
};

// ---------------------------------------------------------------------------
// Tally pill helpers (Beat 5).
// ---------------------------------------------------------------------------
const tenPillOpacity = (frame: number): number =>
  reveal(frame, c5().startFrame + C5_TEN_PILL_REL_START, C5_TEN_PILL_DURATION);

const threePillOpacity = (frame: number): number =>
  reveal(
    frame,
    c5().startFrame + C5_THREE_PILL_REL_START,
    C5_THREE_PILL_DURATION,
  );

// Sparkle opacity — single moment in the entire video (visual-design §4).
const sparkleOpacity = (frame: number): number => {
  const start = c5().startFrame + C5_SPARKLE_REL_START;
  const halfway = start + C5_SPARKLE_DURATION / 2;
  if (frame < start || frame > start + C5_SPARKLE_DURATION) {
    return 0;
  }
  if (frame <= halfway) {
    return progress(frame, start, halfway, EASE.outCubic);
  }
  return 1 - progress(frame, halfway, start + C5_SPARKLE_DURATION, EASE.outCubic);
};

// ---------------------------------------------------------------------------
// Cue 1 — loose-count-felt. Helpers for the 10-stick row and its cascade.
// ---------------------------------------------------------------------------

// Sticks fade in over the first C1_STICKS_FADE_IN_DURATION frames of the
// cue. They hold present for cues 1–4 (until cue 5 introduces a SECOND
// loose row above; the original 10-stick instance is recomposed into the
// bundle at cue 2 — see Beat 5's stick row note below).
const looseRowOpacityCue1 = (frame: number): number => {
  return reveal(frame, c1().startFrame, C1_STICKS_FADE_IN_DURATION);
};

// Cue 1 active stick + reveal walk. The 10-tick cascade fits in the cue's
// available length; we clamp against the cue endFrame.
const c1ActiveIndex = (frame: number): number | undefined => {
  if (frame < c1().startFrame + C1_BADGE_CASCADE_REL_START) {
    return undefined;
  }
  if (frame >= c1().endFrame) {
    return undefined;
  }
  const rel = frame - (c1().startFrame + C1_BADGE_CASCADE_REL_START);
  const idx = Math.floor(rel / C1_PER_TICK_DURATION);
  if (idx < 0 || idx >= STICK_COUNT) {
    return undefined;
  }
  const intoTick = rel - idx * C1_PER_TICK_DURATION;
  if (intoTick > C1_TICK_ACTIVE_DURATION) {
    return undefined;
  }
  return idx;
};

const c1RevealUpTo = (frame: number): number => {
  if (frame < c1().startFrame + C1_BADGE_CASCADE_REL_START) {
    return 0;
  }
  const rel = frame - (c1().startFrame + C1_BADGE_CASCADE_REL_START);
  const idx = Math.floor(rel / C1_PER_TICK_DURATION);
  return Math.min(STICK_COUNT, Math.max(0, idx + 1));
};

// Cue 1 per-stick badge progress.
const c1BadgeProgress = (index: number, frame: number): number => {
  const start =
    c1().startFrame + C1_BADGE_CASCADE_REL_START + index * C1_PER_TICK_DURATION;
  return reveal(frame, start, C1_TICK_POP_DURATION);
};

// Cue 1 badges fade out as a group at the start of cue 2.
const c1BadgesFadeOut = (frame: number): number =>
  1 - reveal(frame, c2().startFrame, C2_BADGES_FADE_OUT_DURATION);

// ---------------------------------------------------------------------------
// Compress factor — the same StickGroup compresses from row (compress=0) to
// bundle (compress=1) during cue 2's compress window. Once we're past that
// window we render the bundle layout directly (so the BundleWrap can sit
// over a properly-sized cluster).
// ---------------------------------------------------------------------------
const compressFactor = (frame: number): number => {
  if (frame < c2().startFrame + C2_COMPRESS_REL_START) {
    return 0;
  }
  return reveal(
    frame,
    c2().startFrame + C2_COMPRESS_REL_START,
    C2_COMPRESS_DURATION,
    EASE.inOutCubic,
  );
};

// Layout switches from "row" to "bundle" at the END of the compress window
// — once visually the sticks have already collapsed, the bundle layout
// kicks in with zero visual jump because compress=1 → bundleGap effective
// = bundleGap * 0.7.
const cue1StickGroupLayout = (frame: number): "row" | "bundle" => {
  if (frame >= c2().startFrame + C2_COMPRESS_REL_START + C2_COMPRESS_DURATION) {
    return "bundle";
  }
  return "row";
};

// ---------------------------------------------------------------------------
// Beat 5 loose row above — opacity only. Position is fixed at
// (640, TOP_LOOSE_ROW_Y). Same StickGroup props as cue 1's row.
// ---------------------------------------------------------------------------
const beat5LooseRowOpacity = (frame: number): number =>
  reveal(
    frame,
    c5().startFrame + C5_LOOSE_ROW_REL_START,
    C5_LOOSE_ROW_DURATION,
  );

// ---------------------------------------------------------------------------
// Bundle 0 (the recomposed-from-row bundle) x-translate — during cue 3 and 4
// it translates leftward to make room for new bundles.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
export const Kp2v2CountingByTensLessonScene = () => {
  const frame = useCurrentFrame();

  // Cue 1 row state
  const c1Opacity = looseRowOpacityCue1(frame);
  const c1Active = c1ActiveIndex(frame);
  const c1Reveal = c1RevealUpTo(frame);
  const c1Fade = c1BadgesFadeOut(frame);

  // The recomposed bundle (bundle index 0) sits where the cue 1 row sat,
  // until cue 3 starts the leftward translation.
  const bundle0X = bundleTranslateX(0, frame);
  const bundle0Opacity = bundleEntranceOpacity(0, frame);
  const bundle0Wrap = bundleWrapProgress(0, frame);

  // Bundle 1 (joins at cue 3) and bundle 2 (joins at cue 4).
  const bundle1X = bundleTranslateX(1, frame) + bundleEntranceSlideX(1, frame);
  const bundle1Opacity = bundleEntranceOpacity(1, frame);
  const bundle1Wrap = bundleWrapProgress(1, frame);

  const bundle2X = bundleTranslateX(2, frame) + bundleEntranceSlideX(2, frame);
  const bundle2Opacity = bundleEntranceOpacity(2, frame);
  const bundle2Wrap = bundleWrapProgress(2, frame);

  // Bundle row y — single row through cue 4, reflows down during cue 5.
  const bundleY = bundleRowY(frame);

  // Compress factor — cue 1 row compresses into bundle 0 during cue 2.
  const compress = compressFactor(frame);
  const stickGroupLayout = cue1StickGroupLayout(frame);

  // After the compress finishes, the cue 1 row is GONE (it is the bundle).
  // Suppress the standalone row at that point so it doesn't double-render
  // with bundle 0.
  const c1RowVisible =
    frame < c2().startFrame + C2_COMPRESS_REL_START + C2_COMPRESS_DURATION;

  // Bundle 0 visibility — kicks in at the end of the compress (the row IS
  // the bundle from that point on; we just keep rendering the same 10
  // sticks under a `bundle` layout + wrap).
  const bundle0Visible =
    frame >= c2().startFrame + C2_COMPRESS_REL_START + C2_COMPRESS_DURATION;

  // Beat 5 loose row (the second, parallel row above the bundles).
  const c5RowOpacity = beat5LooseRowOpacity(frame);
  const c5RowVisible = c5RowOpacity > 0;

  // Tally pills
  const tenPill = tenPillOpacity(frame);
  const threePill = threePillOpacity(frame);

  // Sparkle (one moment)
  const sparkle = sparkleOpacity(frame);

  // Per-bundle badge / label opacities
  const b0Badge = bundleBadgeOpacity(0, frame);
  const b1Badge = bundleBadgeOpacity(1, frame);
  const b2Badge = bundleBadgeOpacity(2, frame);
  const b0Label = bundleLabelOpacity(0, frame);
  const b1Label = bundleLabelOpacity(1, frame);
  const b2Label = bundleLabelOpacity(2, frame);

  return (
    <StylePreset style="ink-wash">
      <AbsoluteFill
        style={{
          backgroundColor: "transparent",
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

          {/* ===== Cue 1 loose row (the original 10-stick instance) ===== */}
          {/* This is the SAME StickGroup that compresses into bundle 0 at the
              end of cue 2's compress window. Identity-invariant: same color,
              length, thickness, seed across the whole video. */}
          {c1RowVisible ? (
            <g
              opacity={c1Opacity}
              transform={`translate(640 ${TEACHING_ROW_Y_SINGLE})`}
            >
              <StickGroup
                activeIndex={c1Active}
                bundleGap={BUNDLE_GAP}
                color={colors.reward}
                compress={compress}
                count={STICK_COUNT}
                layout={stickGroupLayout}
                revealUpTo={c1Reveal}
                rowGap={ROW_GAP}
                stickLength={STICK_LENGTH}
                stickThickness={STICK_THICKNESS}
              />
            </g>
          ) : null}

          {/* ===== Cue 1 per-stick count badges 1..10 ===== */}
          {Array.from({ length: STICK_COUNT }, (_, index) => {
            const p = c1BadgeProgress(index, frame);
            const opacity = p * c1Fade;
            if (opacity <= 0) {
              return null;
            }
            return (
              <g key={`c1-badge-${index}`} opacity={opacity}>
                <CountStepIndicator
                  background={colors.white}
                  color={colors.textNavy}
                  outlineColor={colors.textNavy}
                  progress={p}
                  size={48}
                  value={index + 1}
                  x={looseRowStickX(index)}
                  y={BADGE_Y}
                />
              </g>
            );
          })}

          {/* ===== Bundle 0 (the recomposed-from-cue-1 bundle) =====
              Renders the same 10 sticks under `layout="bundle"` plus the
              BundleWrap. Same color/length/thickness as cue 1's row —
              identity-invariant. */}
          {bundle0Visible ? (
            <g opacity={bundle0Opacity} transform={`translate(${bundle0X} ${bundleY})`}>
              <StickGroup
                bundleGap={BUNDLE_GAP}
                color={colors.reward}
                count={STICK_COUNT}
                layout="bundle"
                stickLength={STICK_LENGTH}
                stickThickness={STICK_THICKNESS}
              />
              <BundleWrap
                color={colors.coral}
                height={BUNDLE_BAND_HEIGHT}
                knotPosition="top"
                outlineColor={colors.textNavy}
                style="rope"
                width={BUNDLE_WIDTH}
                wrapProgress={bundle0Wrap}
              />
            </g>
          ) : null}

          {/* ===== Bundle 1 — enters atomically at cue 3 ===== */}
          {bundle1Opacity > 0 ? (
            <g opacity={bundle1Opacity} transform={`translate(${bundle1X} ${bundleY})`}>
              <StickGroup
                bundleGap={BUNDLE_GAP}
                color={colors.reward}
                count={STICK_COUNT}
                layout="bundle"
                stickLength={STICK_LENGTH}
                stickThickness={STICK_THICKNESS}
              />
              <BundleWrap
                color={colors.coral}
                height={BUNDLE_BAND_HEIGHT}
                knotPosition="top"
                outlineColor={colors.textNavy}
                style="rope"
                width={BUNDLE_WIDTH}
                wrapProgress={bundle1Wrap}
              />
            </g>
          ) : null}

          {/* ===== Bundle 2 — enters atomically at cue 4 ===== */}
          {bundle2Opacity > 0 ? (
            <g opacity={bundle2Opacity} transform={`translate(${bundle2X} ${bundleY})`}>
              <StickGroup
                bundleGap={BUNDLE_GAP}
                color={colors.reward}
                count={STICK_COUNT}
                layout="bundle"
                stickLength={STICK_LENGTH}
                stickThickness={STICK_THICKNESS}
              />
              <BundleWrap
                color={colors.coral}
                height={BUNDLE_BAND_HEIGHT}
                knotPosition="top"
                outlineColor={colors.textNavy}
                style="rope"
                width={BUNDLE_WIDTH}
                wrapProgress={bundle2Wrap}
              />
            </g>
          ) : null}

          {/* ===== Beat 5 loose row of 10 sticks (above the bundle row) =====
              Same SmallStick instance shape, same color, same scale, same
              outline as cue 1's row — identity-invariant. New mount this
              time because the original instance is now the bundle. */}
          {c5RowVisible ? (
            <g
              opacity={c5RowOpacity}
              transform={`translate(640 ${TOP_LOOSE_ROW_Y})`}
            >
              <StickGroup
                bundleGap={BUNDLE_GAP}
                color={colors.reward}
                count={STICK_COUNT}
                layout="row"
                rowGap={ROW_GAP}
                stickLength={STICK_LENGTH}
                stickThickness={STICK_THICKNESS}
              />
            </g>
          ) : null}

          {/* ===== Per-bundle count badges (1, 2, 3) ===== */}
          {b0Badge > 0 ? (
            <g opacity={b0Badge}>
              <CountStepIndicator
                background={colors.white}
                color={colors.textNavy}
                outlineColor={colors.textNavy}
                progress={1}
                size={48}
                value={1}
                x={bundle0X}
                y={BADGE_Y}
              />
            </g>
          ) : null}
          {b1Badge > 0 ? (
            <g opacity={b1Badge}>
              <CountStepIndicator
                background={colors.white}
                color={colors.textNavy}
                outlineColor={colors.textNavy}
                progress={1}
                size={48}
                value={2}
                x={bundle1X}
                y={BADGE_Y}
              />
            </g>
          ) : null}
          {b2Badge > 0 ? (
            <g opacity={b2Badge}>
              <CountStepIndicator
                background={colors.white}
                color={colors.textNavy}
                outlineColor={colors.textNavy}
                progress={1}
                size={48}
                value={3}
                x={bundle2X}
                y={BADGE_Y}
              />
            </g>
          ) : null}

          {/* ===== Per-bundle name labels (一个十 / 两个十 / 三个十) ===== */}
          {b0Label > 0 ? (
            <g opacity={b0Label}>
              <LabelCallout
                appearStyle="fade"
                color={colors.textNavy}
                fontSize={44}
                progress={1}
                text="一个十"
                x={bundle0X}
                y={LABEL_Y}
              />
            </g>
          ) : null}
          {b1Label > 0 ? (
            <g opacity={b1Label}>
              <LabelCallout
                appearStyle="fade"
                color={colors.textNavy}
                fontSize={44}
                progress={1}
                text="两个十"
                x={bundle1X}
                y={LABEL_Y}
              />
            </g>
          ) : null}
          {b2Label > 0 ? (
            <g opacity={b2Label}>
              <LabelCallout
                appearStyle="fade"
                color={colors.textNavy}
                fontSize={44}
                progress={1}
                text="三个十"
                x={bundle2X}
                y={LABEL_Y}
              />
            </g>
          ) : null}

          {/* ===== Beat 5 tally pills =====
              "十步" above the top loose row (y ≈ TOP_LOOSE_ROW_Y - 70).
              "三步" between the two rows, above the bundle row
              (y ≈ BOTTOM_BUNDLE_ROW_Y - 90). Visual-design §5 finger-cover
              test: each pill names its row's count-length. ===== */}
          {tenPill > 0 ? (
            <g opacity={tenPill}>
              <StepTally
                color={colors.textNavy}
                label="步"
                progress={tenPill}
                size={52}
                steps={10}
                variant="numeric"
                x={640}
                y={TOP_LOOSE_ROW_Y - 70}
              />
            </g>
          ) : null}
          {threePill > 0 ? (
            <g opacity={threePill}>
              <StepTally
                color={colors.textNavy}
                label="步"
                progress={threePill}
                size={52}
                steps={3}
                variant="numeric"
                x={640}
                y={THREE_PILL_Y}
              />
            </g>
          ) : null}

          {/* ===== Single GlintFlash sparkle — visual-design §4: one moment
                   in the whole video. Lights the "三步" pill as the speed
                   argument lands. ===== */}
          {sparkle > 0 ? (
            <g opacity={sparkle}>
              <GlintFlash
                color={colors.sunshine}
                durationInFrames={C5_SPARKLE_DURATION}
                size={48}
                startFrame={c5().startFrame + C5_SPARKLE_REL_START}
                x={640}
                y={THREE_PILL_Y}
              />
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>
    </StylePreset>
  );
};
