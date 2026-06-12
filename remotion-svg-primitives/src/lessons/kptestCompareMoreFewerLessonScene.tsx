import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { PlacedCue } from "@studio/narration-kit";

import { colors } from "../theme";
import { EASE } from "../motion-primitives/curves";
import {
  ComparisonSymbol,
  CountableObject,
  NumberCard,
  PairConnector,
  PointerHandArrow,
  RecapSpotlight,
  UnmatchedSlot,
  LessonIntroCard,
} from "../shape-primitives";
import { PopIn } from "../motion-primitives/PopIn";
import { PulseCircle } from "../motion-primitives/PulseCircle";
import { ReadAlongHighlight } from "../motion-primitives/ReadAlongHighlight";
import { Breathe } from "../fx/Breathe";
import { measureProps, useMeasureHook } from "./_measure/measureHook";
import * as L from "./kptestCompareMoreFewer/layout";

export type CueMap = Record<string, PlacedCue>;

// One phrase token rendered as a tinted glyph. `fill="currentColor"` lets
// ReadAlongHighlight ride the active-token tint onto the spoken glyph.
const PhraseGlyph = ({ ch }: { ch: string }) => (
  <text
    dominantBaseline="middle"
    fill="currentColor"
    fontFamily={
      '"Arial Rounded MT Bold", "PingFang SC", ui-rounded, system-ui, sans-serif'
    }
    fontSize={L.PHRASE_FONT}
    fontWeight={900}
    textAnchor="middle"
    y={0}
  >
    {ch}
  </text>
);

// The spoken 比-utterance row, swept token-by-token on the currently-spoken
// glyph. Mounted for the more/fewer model + replay reads (a live sweep synced
// to the voice).
const PhraseRow = ({
  tokens,
  atFrame,
}: {
  tokens: readonly string[];
  atFrame: number;
}) => (
  <ReadAlongHighlight
    activeScale={1.16}
    atFrame={atFrame}
    cursor="underline"
    highlightColor={colors.sunshine}
    inkColor={colors.textNavy}
    itemGap={L.PHRASE_ITEM_GAP}
    itemRadius={L.PHRASE_ITEM_RADIUS}
    lines={[tokens.map((ch, i) => <PhraseGlyph ch={ch} key={i} />)]}
    perBeatDurationFrames={L.READALONG_PER_BEAT}
    x={L.PHRASE_CX}
    y={L.PHRASE_CY}
  />
);

// The same 比-utterance row, fully legible and static (no sweep, no dimming) —
// for the echo-hold (phrase stays readable through the silent gap) and the
// recap retrieval (the whole utterance is the retrieved target).
const PhraseRowStatic = ({ tokens }: { tokens: readonly string[] }) => (
  <g transform={`translate(${L.PHRASE_CX} ${L.PHRASE_CY})`} color={colors.textNavy}>
    {tokens.map((ch, i) => (
      <g
        key={i}
        transform={`translate(${(i - (tokens.length - 1) / 2) * L.PHRASE_ITEM_GAP} 0)`}
      >
        <PhraseGlyph ch={ch} />
      </g>
    ))}
  </g>
);

// ----------------------------------------------------------------------------
// The scene.
// ----------------------------------------------------------------------------
export const KptestCompareMoreFewerLessonScene: React.FC<{ cues: CueMap }> = ({
  cues,
}) => {
  const frame = useCurrentFrame();
  useMeasureHook(); // once at the scene root (inert outside the measured pass)

  const cue = (id: string): PlacedCue => cues[id];
  const startOf = (id: string): number => cue(id).startFrame;
  const endOf = (id: string): number => cue(id).endFrame;
  // True while the master frame is inside [start, end) of a cue.
  const inCue = (id: string): boolean =>
    frame >= startOf(id) && frame < endOf(id);
  // True from a cue's start to the end of the lesson (for picture persistence).
  const since = (id: string): boolean => frame >= startOf(id);

  // The invariant picture is alive from two-groups onward.
  const pictureLive = since("two-groups");

  // ---- intro card (alone first; dots absent) -------------------------------
  const introProg = L.progress(
    frame,
    startOf("intro"),
    L.INTRO_TITLE_IN_DUR,
  );
  const introOpacity = interpolate(
    frame,
    [endOf("intro") - 8, endOf("intro")],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ---- two-groups: which dots are revealed --------------------------------
  // Each dot pops in at its own offset; PopIn handles the per-dot opacity ramp.
  const topDelay = (c: number): number =>
    startOf("two-groups") + L.TWO_TOP_START + c * L.TWO_DOT_STAGGER;
  const bottomDelay = (c: number): number =>
    startOf("two-groups") + L.TWO_BOTTOM_START + c * L.TWO_DOT_STAGGER;
  const amountProg = L.progress(
    frame,
    startOf("two-groups") + L.TWO_AMOUNT_START,
    L.TWO_AMOUNT_DUR,
  );
  // Amount tags live ONLY during two-groups (dropped after match begins).
  const amountVisible = inCue("two-groups");

  // ---- match (and recap-restore): the 3 pair lines ------------------------
  // In `match` the lines draw on (staggered). From more-direction onward they
  // are simply held at full. not-by-size re-pairs them on the spread layout.
  const matchLineProgress = (c: number): number => {
    if (!since("match")) {
      return 0;
    }
    if (inCue("match")) {
      return L.progress(
        frame,
        startOf("match") + L.MATCH_LINE_START + c * L.MATCH_LINE_STAGGER,
        L.MATCH_LINE_DUR,
      );
    }
    return 1; // held drawn through every later cue
  };
  // Surplus ghosts: revealed at the end of match, held after.
  const ghostProgress = (): number => {
    if (!since("match")) {
      return 0;
    }
    if (inCue("match")) {
      return L.progress(
        frame,
        startOf("match") + L.MATCH_GHOST_START,
        L.MATCH_GHOST_DUR,
      );
    }
    return 1;
  };

  // ---- the > direction glyph (NOT before more-direction reveals it) -------
  const symbolLive = since("more-direction") && !since("recap")
    ? true
    : inCue("recap");
  const symbolProgress = since("more-direction")
    ? L.progress(
        frame,
        startOf("more-direction") + L.SYMBOL_IN_START,
        L.SYMBOL_IN_DUR,
      )
    : 0;

  // ---- not-by-size: bottom row spread amount (0 matched .. 1 spread) ------
  const spreadAmount = ((): number => {
    if (!inCue("not-by-size")) {
      return 0; // matched everywhere else (recap restores matched)
    }
    return interpolate(
      frame,
      [
        startOf("not-by-size") + L.SPREAD_START,
        startOf("not-by-size") + L.SPREAD_START + L.SPREAD_DUR,
      ],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE.inOutCubic,
      },
    );
  })();
  const bottomDotX = (c: number): number =>
    L.lerp(L.bottomDot(c).x, L.bottomDotSpreadX(c), spreadAmount);

  // not-by-size re-pair lines (drawn after the spread reads).
  const repairLineProgress = (c: number): number => {
    if (!inCue("not-by-size")) {
      return 0;
    }
    return L.progress(
      frame,
      startOf("not-by-size") + L.REPAIR_LINE_START + c * L.REPAIR_LINE_STAGGER,
      L.REPAIR_LINE_DUR,
    );
  };
  const repairGhostProgress = (): number => {
    if (!inCue("not-by-size")) {
      return 0;
    }
    return L.progress(
      frame,
      startOf("not-by-size") + L.REPAIR_GHOST_START,
      L.REPAIR_GHOST_DUR,
    );
  };

  // In not-by-size the matched lines/ghosts give way to the spread+re-pair set.
  const showMatchedLines = since("match") && !inCue("not-by-size");

  // ---- surplus pulse window (more model + replay) -------------------------
  const pulseCueId = inCue("more-direction")
    ? "more-direction"
    : inCue("more-replay")
      ? "more-replay"
      : null;

  // ---- keystone focus slide (fewer-direction / fewer-replay): surplus→short
  const fewerFocusCueId = inCue("fewer-direction")
    ? "fewer-direction"
    : inCue("fewer-replay")
      ? "fewer-replay"
      : null;
  const focusT = fewerFocusCueId
    ? L.progress(
        frame,
        startOf(fewerFocusCueId) + L.FOCUS_SLIDE_START,
        L.FOCUS_SLIDE_DUR,
      )
    : 0;
  const surplus = L.surplusCenter();
  const shortRow = L.shortRowCenter();
  const focusX = L.lerp(surplus.x, shortRow.x, focusT);
  const focusY = L.lerp(surplus.y, shortRow.y, focusT);

  // ---- phrase row (swept): the model + replay reads sync the sweep to voice.
  const sweptPhrase = ((): {
    tokens: readonly string[];
    atFrame: number;
  } | null => {
    if (inCue("more-direction"))
      return {
        tokens: L.MORE_PHRASE,
        atFrame: startOf("more-direction") + L.READALONG_START,
      };
    if (inCue("more-replay"))
      return {
        tokens: L.MORE_PHRASE,
        atFrame: startOf("more-replay") + L.READALONG_START,
      };
    if (inCue("fewer-direction"))
      return {
        tokens: L.FEWER_PHRASE,
        atFrame: startOf("fewer-direction") + L.READALONG_START,
      };
    if (inCue("fewer-replay"))
      return {
        tokens: L.FEWER_PHRASE,
        atFrame: startOf("fewer-replay") + L.READALONG_START,
      };
    return null;
  })();

  // ---- echo "your turn" affordance ----------------------------------------
  const echoCueId = inCue("echo-more")
    ? "echo-more"
    : inCue("echo-fewer")
      ? "echo-fewer"
      : null;
  const turnProgress = echoCueId
    ? L.progress(frame, startOf(echoCueId) + L.TURN_IN_START, L.TURN_IN_DUR)
    : 0;
  // The phrase the child is being asked to echo — stays fully legible through
  // the silent gap.
  const echoPhraseTokens =
    echoCueId === "echo-fewer" ? L.FEWER_PHRASE : L.MORE_PHRASE;

  // ---- recap: ONE live highlight walks surplus→五比三多, short→三比五少 ----
  const recapActive = inCue("recap");
  const recapHighlight = recapActive
    ? frame >= startOf("recap") + L.RECAP_BEAT_2_START
      ? 1
      : 0
    : 0;
  const recapRingProgress = ((): number => {
    if (!recapActive) {
      return 0;
    }
    const beatStart =
      recapHighlight === 1
        ? startOf("recap") + L.RECAP_BEAT_2_START
        : startOf("recap") + L.RECAP_BEAT_1_START;
    return L.progress(frame, beatStart, L.RECAP_RING_DUR);
  })();
  const recapRingCenter: [number, number] =
    recapHighlight === 1 ? [shortRow.x, shortRow.y] : [surplus.x, surplus.y];
  // The currently-retrieved utterance (swaps when the live highlight moves to
  // the short row). Rendered static-lit (no sweep) — the recap RING carries the
  // motion, the phrase is the retrieved target.
  const recapPhraseTokens =
    recapHighlight === 1 ? L.FEWER_PHRASE : L.MORE_PHRASE;

  // The breathing anchor for the held picture.
  const objectsBreathing =
    pictureLive &&
    !inCue("two-groups") &&
    !inCue("match") &&
    !inCue("not-by-size");

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height={L.CANVAS_H}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${L.CANVAS_W} ${L.CANVAS_H}`}
        width={L.CANVAS_W}
      >
        {/* ---- intro card (alone first; dots absent) ---- */}
        {!pictureLive || inCue("intro") ? (
          <g
            {...measureProps("introCard")}
            opacity={introOpacity}
            transform={`translate(${L.INTRO_CX} ${L.INTRO_CY})`}
          >
            <LessonIntroCard
              progress={introProg}
              section="比一比"
              teaser="谁多谁少，连一连就知道"
              title="谁多谁少"
              titleSize={L.INTRO_TITLE_SIZE}
            />
          </g>
        ) : null}

        {/* ---- the invariant teaching picture (two-groups onward) ---- */}
        {pictureLive ? (
          <Breathe
            amplitudeScale={objectsBreathing ? 0.005 : 0}
            bpm={15}
            originX={L.OBJECTS_CX}
            originY={L.OBJECTS_CY}
            phaseSeed="cmf-objects"
          >
            {/* pair-connector lines (matched layout) */}
            {showMatchedLines ? (
              <g {...measureProps("pairLines")}>
                {[0, 1, 2].map((c) => {
                  const t = L.topDot(c);
                  const b = L.bottomDot(c);
                  return (
                    <PairConnector
                      color={colors.textNavy}
                      key={c}
                      progress={matchLineProgress(c)}
                      x1={t.x}
                      x2={b.x}
                      y1={t.y}
                      y2={b.y}
                    />
                  );
                })}
              </g>
            ) : null}

            {/* not-by-size re-pair lines on the spread layout */}
            {inCue("not-by-size") ? (
              <g {...measureProps("pairLines")}>
                {[0, 1, 2].map((c) => {
                  const t = L.topDot(c);
                  const by = L.bottomDot(c).y;
                  return (
                    <PairConnector
                      color={colors.textNavy}
                      key={c}
                      progress={repairLineProgress(c)}
                      x1={t.x}
                      x2={bottomDotX(c)}
                      y1={t.y}
                      y2={by}
                    />
                  );
                })}
              </g>
            ) : null}

            {/* top row — 5 dots (group-A color) */}
            <g {...measureProps("topRow")}>
              {Array.from({ length: L.TOP_COUNT }, (_, c) => {
                const t = L.topDot(c);
                return (
                  <PopIn
                    delay={topDelay(c)}
                    key={c}
                    motion="snap"
                    originX={t.x}
                    originY={t.y}
                  >
                    <CountableObject
                      color={colors.reward}
                      size={L.DOT_DIAMETER}
                      variant="star"
                      x={t.x}
                      y={t.y}
                    />
                  </PopIn>
                );
              })}
            </g>

            {/* bottom row — 3 dots (group-B color), x may spread in not-by-size */}
            <g {...measureProps("bottomRow")}>
              {Array.from({ length: L.BOTTOM_COUNT }, (_, c) => {
                const by = L.bottomDot(c).y;
                const bx = bottomDotX(c);
                return (
                  <PopIn
                    delay={bottomDelay(c)}
                    key={c}
                    motion="snap"
                    originX={bx}
                    originY={by}
                  >
                    <CountableObject
                      color={colors.coral}
                      size={L.DOT_DIAMETER}
                      variant="star"
                      x={bx}
                      y={by}
                    />
                  </PopIn>
                );
              })}
            </g>

            {/* surplus ghosts — the 2 top dots with nobody below */}
            <g {...measureProps("surplusGhosts")}>
              {showMatchedLines
                ? L.OVERHANG_COLUMNS.map((c) => {
                    const t = L.topDot(c);
                    return (
                      <UnmatchedSlot
                        color={colors.softGrayBlue}
                        key={c}
                        progress={ghostProgress()}
                        size={L.DOT_DIAMETER}
                        state="ghost"
                        x={t.x}
                        y={L.bottomDot(0).y}
                      />
                    );
                  })
                : null}
              {inCue("not-by-size")
                ? L.OVERHANG_COLUMNS.map((c) => {
                    const t = L.topDot(c);
                    return (
                      <UnmatchedSlot
                        color={colors.softGrayBlue}
                        key={`r-${c}`}
                        progress={repairGhostProgress()}
                        size={L.DOT_DIAMETER}
                        state="ghost"
                        x={t.x}
                        y={L.bottomDot(0).y}
                      />
                    );
                  })
                : null}
            </g>
          </Breathe>
        ) : null}

        {/* ---- amount tags "5"/"3" (two-groups ONLY) ---- */}
        {amountVisible ? (
          <g {...measureProps("amountTags")} opacity={amountProg}>
            <NumberCard
              height={L.AMOUNT_CARD_H}
              value={L.TOP_COUNT}
              width={L.AMOUNT_CARD_W}
              x={L.AMOUNT_X}
              y={L.AMOUNT_TOP_Y}
            />
            <NumberCard
              height={L.AMOUNT_CARD_H}
              value={L.BOTTOM_COUNT}
              width={L.AMOUNT_CARD_W}
              x={L.AMOUNT_X}
              y={L.AMOUNT_BOTTOM_Y}
            />
          </g>
        ) : null}

        {/* ---- the > direction glyph (more-direction onward; recap too) ---- */}
        {symbolLive ? (
          <g {...measureProps("comparisonSymbol")} opacity={symbolProgress || 1}>
            <ComparisonSymbol
              size={L.SYMBOL_SIZE}
              style="formal"
              symbol=">"
              x={L.SYMBOL_CX}
              y={L.SYMBOL_CY}
            />
          </g>
        ) : null}

        {/* ---- surplus pulse (more model + replay) ---- */}
        {pulseCueId ? (
          <g {...measureProps("surplusPulse")}>
            <PulseCircle
              color={colors.sunshine}
              cx={surplus.x}
              cy={surplus.y}
              durationInFrames={34}
              radius={L.DOT_DIAMETER * 0.7}
              repeatCount={3}
              spread={26}
              startFrame={startOf(pulseCueId) + L.SURPLUS_PULSE_START}
            />
          </g>
        ) : null}

        {/* ---- keystone focus pulse: slides surplus→short row (fewer) ---- */}
        {fewerFocusCueId ? (
          <g {...measureProps("focusPulse")}>
            <PulseCircle
              color={colors.sunshine}
              cx={focusX}
              cy={focusY}
              durationInFrames={40}
              radius={L.DOT_DIAMETER * 0.8}
              repeatCount={4}
              spread={24}
              startFrame={startOf(fewerFocusCueId) + L.FOCUS_SLIDE_START}
            />
          </g>
        ) : null}

        {/* ---- spoken phrase row (more/fewer model + replay): live sweep ---- */}
        {sweptPhrase ? (
          <g {...measureProps("phraseRow")}>
            <PhraseRow atFrame={sweptPhrase.atFrame} tokens={sweptPhrase.tokens} />
          </g>
        ) : null}

        {/* ---- phrase held legible through the echo gap (your-turn) ---- */}
        {echoCueId ? (
          <g {...measureProps("phraseRow")}>
            <Breathe
              amplitudeScale={0.006}
              bpm={15}
              originX={L.PHRASE_CX}
              originY={L.PHRASE_CY}
              phaseSeed="cmf-phrase"
            >
              <PhraseRowStatic tokens={echoPhraseTokens} />
            </Breathe>
          </g>
        ) : null}

        {/* ---- echo "your turn" affordance (held through the gap) ---- */}
        {echoCueId ? (
          <g {...measureProps("turnCue")} opacity={turnProgress}>
            <PointerHandArrow
              direction="up"
              size={84}
              variant="hand"
              x={L.TURN_CX}
              y={L.TURN_CY}
            />
            <text
              dominantBaseline="middle"
              fill={colors.textNavy}
              fontFamily={
                '"Arial Rounded MT Bold", "PingFang SC", ui-rounded, system-ui, sans-serif'
              }
              fontSize={44}
              fontWeight={900}
              textAnchor="middle"
              x={L.TURN_CX}
              y={L.TURN_CY + 78}
            >
              该你说啦
            </text>
            {/* a small speech glyph so the prompt reads as "say it", not dead air */}
            <g transform={`translate(${L.TURN_CX + 150} ${L.TURN_CY})`}>
              <path
                d="M -34 -20 H 34 A 14 14 0 0 1 48 -6 V 12 A 14 14 0 0 1 34 26 H 4 L -14 42 V 26 H -34 A 14 14 0 0 1 -48 12 V -6 A 14 14 0 0 1 -34 -20 Z"
                fill={colors.white}
                stroke={colors.textNavy}
                strokeLinejoin="round"
                strokeWidth={4}
              />
              <circle cx={-16} cy={4} fill={colors.textNavy} r={4} />
              <circle cx={0} cy={4} fill={colors.textNavy} r={4} />
              <circle cx={16} cy={4} fill={colors.textNavy} r={4} />
            </g>
          </g>
        ) : null}

        {/* ---- recap: ONE live moving highlight over the picture ---- */}
        {recapActive ? (
          <g {...measureProps("recap")}>
            <RecapSpotlight
              currentHighlight={recapHighlight}
              ringCenter={recapRingCenter}
              ringColor={colors.sunshine}
              ringProgress={recapRingProgress}
              ringRadius={L.DOT_DIAMETER * 0.95}
              subBeats={[
                // sub-beat 0: a quiet marker on the surplus pair (五比三多).
                <circle
                  cx={surplus.x}
                  cy={surplus.y}
                  fill="none"
                  key="b0"
                  r={L.DOT_DIAMETER * 0.78}
                  stroke={colors.reward}
                  strokeWidth={5}
                />,
                // sub-beat 1: a quiet marker on the short bottom row (三比五少).
                <circle
                  cx={shortRow.x}
                  cy={shortRow.y}
                  fill="none"
                  key="b1"
                  r={L.DOT_DIAMETER * 0.78}
                  stroke={colors.coral}
                  strokeWidth={5}
                />,
              ]}
            />
          </g>
        ) : null}

        {/* ---- recap: the retrieved utterance row (swaps with the highlight) ---- */}
        {recapActive ? (
          <g {...measureProps("recapPhrase")}>
            <PhraseRowStatic tokens={recapPhraseTokens} />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
