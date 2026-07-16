// kptest-count-three — the lesson SCENE (frame-driven, cue-bounded).
//
// ZERO frame literals + ZERO raw motion literals: every frame is
// `cues[id].startFrame + <layout.ts offset>` (or the cue's measured count-word
// token onset); every curve is a named EASE.* or a <PopIn motion>. One
// cue-anchored timeline; motion clamped to its cue. The 3 apples live the
// whole video as ONE countable-object group; the 三 glyph is ONE travelling
// NumberCard instance (per-apple count tag #3 → cardinal total — identity
// preserved, no fresh pop / no fade-out-fade-in cross-fade).
//
// count-on (spoken enumeration): each apple + its count tag is bound to its
// measured count-word ASR onset (count-climb cue.tokenOnsets indices 0/17/31
// = 一/二/三), added to cue.startFrame → absolute frames. Onsets ARE present
// (verified), so the apple/tag/SFX-tick land together ON each spoken number
// — never a fixed step cadence from the cue head (the count-on hard rule).

import type { FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";
import { EASE } from "../motion-primitives/curves";
import { PopIn } from "../motion-primitives/PopIn";
import { Breathe } from "../fx";
import { CountableObject, LessonIntroCard, NumberCard } from "../shape-primitives";
import { kptestCountThreeCueAccessors } from "./kptestCountThreeLessonTimeline";
import {
  APPLE_ENTRANCE_LEAD,
  APPLE_FIT,
  APPLE_POSITIONS,
  APPLE_Y,
  COUNT_WORDS,
  COUNT_WORD_TOKEN_INDICES,
  INTRO_CX,
  INTRO_CY,
  INTRO_FADE_OUT_FRAMES,
  INTRO_REVEAL_FRAMES,
  INTRO_TEASER,
  INTRO_TITLE,
  LINE_END_Y,
  REVEAL_LINE_DRAW_FRAMES,
  REVEAL_LINE_DRAW_START,
  REVEAL_LINE_FADE_IN_FRAMES,
  REVEAL_LINE_FADE_OUT_FRAMES,
  REVEAL_LINE_FADE_OUT_START,
  REVEAL_ORD_RECEDE_FRAMES,
  REVEAL_ORD_RECEDE_START,
  REVEAL_THREE_MIG_FRAMES,
  REVEAL_THREE_MIG_START,
  REVEAL_THREE_POP_END,
  REVEAL_THREE_POP_PEAK,
  REVEAL_THREE_POP_START,
  ROW_CX,
  TAG_CARD,
  TAG_ENTRANCE_FRAMES,
  TAG_ENTRANCE_FROM_SCALE,
  TAG_TO_TOTAL_SCALE,
  TAG_Y,
  TOTAL_X,
  TOTAL_Y,
} from "./kptestCountThree/layout";
import { measureProps, useMeasureHook } from "./_measure/measureHook";

const clamp01 = (value: number): number =>
  value < 0 ? 0 : value > 1 ? 1 : value;

const { cStart, cEnd, cueOf } = kptestCountThreeCueAccessors;

// ── cue boundaries (the ONLY frame source for the scene) ────────────────────
const introStart = cStart("topic-intro");
const introEnd = cEnd("topic-intro");
const countCue = cueOf("count-climb");
const countStart = countCue.startFrame;
const revealStart = cStart("cardinality");

// ── count-climb count-word ABSOLUTE onset frames (cue-local tokenOnset + start).
// The kit's tokenOnsets are cue-local (verified: count-climb 一@idx0=6, 二@idx17=189,
// 三@idx31=361); adding cue.startFrame gives the master-timeline frame each
// counted apple + tag + tick lands on. Onsets present → bound (no fallback).
const appleOnset: number[] = COUNT_WORD_TOKEN_INDICES.map(
  (idx) => countStart + (countCue.tokenOnsets?.[idx] ?? 0),
);
const applePopDelay = (i: number): number => appleOnset[i] - APPLE_ENTRANCE_LEAD;
const threeOnset = appleOnset[COUNT_WORD_TOKEN_INDICES.length - 1];

export const KptestCountThreeLessonScene: FC = () => {
  const frame = useCurrentFrame();
  useMeasureHook(); // ONCE at the scene root — declared ⟺ measured bijection gate

  // Group-visibility steps. Each cue's load-bearing group <g> is opacity 0
  // BEFORE its content's first onset and 1 from that onset on. This is VISUALLY
  // INERT — 0 only while the children are already opacity 0 (PopIn / tag
  // entrance have not begun) — but it makes the opacity-aware overlap gate skip
  // the group's not-yet-entrance bbox during the intro, instead of flagging the
  // (invisible) apples/tags against the (alone-reading) intro card.
  const applesGroupOpacity = frame >= appleOnset[0] ? 1 : 0;
  const ordTagsGroupOpacity = frame >= appleOnset[0] ? 1 : 0;
  const threeGroupOpacity = frame >= threeOnset ? 1 : 0;

  // ── intro card (reads ALONE; apples enter only in count-climb) ─────────────
  const introReveal = clamp01(
    interpolate(frame, [introStart, introStart + INTRO_REVEAL_FRAMES], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE.enter,
    }),
  );
  const introFadeOut = interpolate(
    frame,
    [introEnd - INTRO_FADE_OUT_FRAMES, introEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── per-item ordinal tags 一,二 (recede together in cardinality) ──────────
  const ordRecede = interpolate(
    frame,
    [
      revealStart + REVEAL_ORD_RECEDE_START,
      revealStart + REVEAL_ORD_RECEDE_START + REVEAL_ORD_RECEDE_FRAMES,
    ],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic },
  );
  const ordTag = (i: number) => {
    const on = appleOnset[i];
    const entranceOpacity = clamp01(
      interpolate(frame, [on, on + TAG_ENTRANCE_FRAMES], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE.enter,
      }),
    );
    const entranceScale = interpolate(
      frame,
      [on, on + TAG_ENTRANCE_FRAMES],
      [TAG_ENTRANCE_FROM_SCALE, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.enter },
    );
    return { opacity: entranceOpacity * ordRecede, scale: entranceScale * ordRecede };
  };
  const ord0 = ordTag(0);
  const ord1 = ordTag(1);

  // ── the 三 glyph — per-apple count tag #3 → cardinal total (one instance) ───
  // Entrance (count-climb, as apple 3's tag) → migration (cardinality, up +
  // rescale) → bouncy settle-pop (the ONE climax accent). NO retire/recall:
  // cardinality's reveal IS the landing, so the 三 rests as the total through end.
  const threeOpacity = clamp01(
    interpolate(frame, [threeOnset, threeOnset + TAG_ENTRANCE_FRAMES], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE.enter,
    }),
  );
  const threeEntranceScale = interpolate(
    frame,
    [threeOnset, threeOnset + TAG_ENTRANCE_FRAMES],
    [TAG_ENTRANCE_FROM_SCALE, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.enter },
  );
  const migStart = revealStart + REVEAL_THREE_MIG_START;
  const migEnd = revealStart + REVEAL_THREE_MIG_START + REVEAL_THREE_MIG_FRAMES;
  const threeX = interpolate(frame, [migStart, migEnd], [APPLE_POSITIONS[2].x, TOTAL_X], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outQuint,
  });
  const threeY = interpolate(frame, [migStart, migEnd], [TAG_Y, TOTAL_Y], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outQuint,
  });
  const threeMigrationScale = interpolate(
    frame,
    [migStart, migEnd],
    [1, TAG_TO_TOTAL_SCALE],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outQuint },
  );
  const climaxStart = revealStart + REVEAL_THREE_POP_START;
  const climaxPeak = revealStart + REVEAL_THREE_POP_PEAK;
  const climaxEnd = revealStart + REVEAL_THREE_POP_END;
  const popBump = interpolate(
    frame,
    [climaxStart, climaxPeak, climaxEnd],
    [0, 0.06, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const threeScale = threeEntranceScale * threeMigrationScale * (1 + popBump);

  // ── converging coral guide lines (reveal consolidation gesture; untagged chrome) ─
  const lineReveal = clamp01(
    interpolate(
      frame,
      [revealStart + REVEAL_LINE_DRAW_START, revealStart + REVEAL_LINE_DRAW_START + REVEAL_LINE_DRAW_FRAMES],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outQuint },
    ),
  );
  const lineOpacity = interpolate(
    frame,
    [
      revealStart + REVEAL_LINE_DRAW_START,
      revealStart + REVEAL_LINE_DRAW_START + REVEAL_LINE_FADE_IN_FRAMES,
      revealStart + REVEAL_LINE_FADE_OUT_START,
      revealStart + REVEAL_LINE_FADE_OUT_START + REVEAL_LINE_FADE_OUT_FRAMES,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1280 720"
      style={{ backgroundColor: colors.cream, display: "block" }}
    >
      {/* apples — ONE horizontal group, identity-invariant; Breathe = moving hold */}
      <Breathe
        originX={ROW_CX}
        originY={APPLE_Y}
        bpm={15}
        amplitudeScale={0.005}
        phaseSeed="kptest-count3-apples"
        drift={0.5}
      >
        <g {...measureProps("apples")} opacity={applesGroupOpacity}>
          {APPLE_POSITIONS.map((pos, i) => (
            <PopIn
              key={i}
              delay={applePopDelay(i)}
              motion="snap"
              originX={pos.x}
              originY={APPLE_Y}
            >
              <CountableObject
                variant="fruit"
                color="reward"
                size={APPLE_FIT.unit}
                x={pos.x}
                y={APPLE_Y}
              />
            </PopIn>
          ))}
        </g>
      </Breathe>

      {/* converging coral guide lines — cardinality consolidation gesture. */}
      <g opacity={lineOpacity}>
        {APPLE_POSITIONS.map((pos, i) => (
          <line
            key={i}
            x1={pos.x}
            y1={TAG_Y}
            x2={TOTAL_X}
            y2={LINE_END_Y}
            stroke={colors.coral}
            strokeWidth={5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - lineReveal}
          />
        ))}
      </g>

      {/* per-item ordinal tags 一,二 — recede as they consolidate */}
      <g {...measureProps("ord-tags")} opacity={ordTagsGroupOpacity}>
        <NumberCard
          value={COUNT_WORDS[0]}
          width={TAG_CARD}
          height={TAG_CARD}
          x={APPLE_POSITIONS[0].x}
          y={TAG_Y}
          transform={`scale(${ord0.scale})`}
          opacity={ord0.opacity}
        />
        <NumberCard
          value={COUNT_WORDS[1]}
          width={TAG_CARD}
          height={TAG_CARD}
          x={APPLE_POSITIONS[1].x}
          y={TAG_Y}
          transform={`scale(${ord1.scale})`}
          opacity={ord1.opacity}
        />
      </g>

      {/* the 三 glyph — per-apple tag #3 → cardinal total, one travelling instance */}
      <Breathe
        originX={threeX}
        originY={threeY}
        bpm={15}
        amplitudeScale={0.005}
        phaseSeed="kptest-count3-total"
      >
        <g {...measureProps("total-three")} opacity={threeGroupOpacity}>
          <NumberCard
            value={COUNT_WORDS[2]}
            width={TAG_CARD}
            height={TAG_CARD}
            x={threeX}
            y={threeY}
            transform={`scale(${threeScale})`}
            opacity={threeOpacity}
          />
        </g>
      </Breathe>

      {/* intro card — reads ALONE first (apples enter only in count-climb) */}
      <g {...measureProps("intro-card")} opacity={introFadeOut}>
        <Breathe
          originX={INTRO_CX}
          originY={INTRO_CY}
          bpm={15}
          amplitudeScale={0.005}
          phaseSeed="kptest-count3-intro"
        >
          <LessonIntroCard
            x={INTRO_CX}
            y={INTRO_CY}
            title={INTRO_TITLE}
            teaser={INTRO_TEASER}
            titleSize={108}
            progress={introReveal}
          />
        </Breathe>
      </g>
    </svg>
  );
};
