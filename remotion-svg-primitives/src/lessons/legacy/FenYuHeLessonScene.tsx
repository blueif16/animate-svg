import { interpolate, useCurrentFrame } from "remotion";

import {
  CountableObject,
  FenHeDiagram,
  LabelCallout,
  NumberCard,
  TeacherMark,
} from "../../shape-primitives";
import { Breathe } from "../../fx";
import { EASE } from "../../motion-primitives";
import { colors, typography, video } from "../../theme";

import { fenYuHeCues } from "./fenYuHeLessonTimeline";
import { measureProps, useMeasureHook } from "../_measure/measureHook";
import { FocusPointer } from "../_signal/FocusPointer";
import {
  BIG_DIAGRAM,
  CANDY,
  CENTER_STAGE,
  COLUMN,
  CUE_TAIL_FRAMES,
  LEFT_STAGE,
  MOTION,
  SKETCH,
  SLIDE_SEQUENCE,
  TITLE,
  bigDiagramAnchors,
  columnRowAnchors,
  columnRowY,
  leftStageStateX,
  lerp,
  progress,
  readArrowGeometry,
  type SlideStateKey,
} from "./fenYuHe/layout";

// Cue lookup. Every frame number below derives from one of these windows —
// ZERO master-timeline literals (CLAUDE.md "ZERO FRAME LITERALS").
const cueMap = Object.fromEntries(
  fenYuHeCues.map((c) => [c.id, c]),
) as Record<string, (typeof fenYuHeCues)[number]>;

const cueOf = (id: string) => {
  const c = cueMap[id];
  if (!c) {
    throw new Error(`fen-yu-he scene: unknown cue "${id}"`);
  }
  return c;
};

// ===========================================================================
// Intro title (zone-title) — two LabelCallout lines. Text is focal ONLY here.
// ===========================================================================
const IntroTitle = ({ frame }: { frame: number }) => {
  const cue = cueOf("intro-title");
  const appearFrom = cue.startFrame + TITLE.appearStart;
  const appearTo = appearFrom + TITLE.appearDuration;
  const fadeFrom = cue.endFrame - TITLE.fadeOutBeforeEnd;
  const fadeTo = fadeFrom + TITLE.fadeOutDuration;

  const appear = progress(frame, appearFrom, appearTo);
  const fade = 1 - progress(frame, fadeFrom, fadeTo);
  const reveal = Math.min(appear, fade);

  if (reveal <= 0) {
    return null;
  }

  return (
    <Breathe
      amplitudeScale={0.004}
      bpm={14}
      originX={TITLE.cx}
      originY={(TITLE.titleY + TITLE.teaserY) / 2}
      phaseSeed="fen-yu-he-title"
    >
      <g {...measureProps("intro-title")}>
        <LabelCallout
          color="textNavy"
          fontSize={TITLE.titleFontSize}
          fontWeight={900}
          progress={reveal}
          text="五的分与合"
          x={TITLE.cx}
          y={TITLE.titleY}
        />
        <LabelCallout
          color="softGrayBlue"
          fontSize={TITLE.teaserFontSize}
          fontWeight={800}
          progress={reveal}
          text="把五分开，再合起来"
          x={TITLE.cx}
          y={TITLE.teaserY}
        />
      </g>
    </Breathe>
  );
};

// ===========================================================================
// Candy stage. The SAME five CountableObject instances, parameterised per
// cue. This component computes each candy's (x, y, dimmed, selected) for the
// current frame and renders them once — never destroyed/recreated per cue.
// ===========================================================================

type CandyState = {
  x: number;
  y: number;
  opacity: number; // for entrance / dim
  selected: boolean;
  size: number; // centered-stage CANDY.size; shrinks to leftSize on ordered cues
};

const REST: CandyState = {
  x: 0,
  y: 0,
  opacity: 1,
  selected: false,
  size: CANDY.size,
};

const candyStatesAt = (frame: number): CandyState[] => {
  const fiveWhole = cueOf("five-whole");
  const split = cueOf("split-into-two");
  const recombine = cueOf("recombine-inverse");
  const read = cueOf("read-fen-he-shi");
  const firstSplit = cueOf("first-ordered-split");
  const slide = cueOf("slide-one-at-a-time");
  const columnComplete = cueOf("ordered-column-complete");
  const orderMatters = cueOf("order-matters");

  const states: CandyState[] = Array.from({ length: CANDY.count }, () => ({
    ...REST,
  }));

  // Before the candies exist (intro), nothing.
  if (frame < fiveWhole.startFrame) {
    return states.map((s) => ({ ...s, opacity: 0 }));
  }

  // --- five-whole: staggered pop-in, settle into the centred heap row ---
  if (frame < split.startFrame) {
    for (let i = 0; i < CANDY.count; i += 1) {
      const start =
        fiveWhole.startFrame +
        MOTION.fiveWhole.popStart +
        i * MOTION.fiveWhole.popStagger;
      const p = progress(frame, start, start + MOTION.fiveWhole.popSpan);
      states[i] = {
        x: CENTER_STAGE.heapX[i],
        y: CANDY.baselineY,
        opacity: p,
        selected: false,
        size: CANDY.size,
      };
    }
    return states;
  }

  // --- split-into-two: candies separate centre -> 1|4 split ---
  if (frame < recombine.startFrame) {
    const from = split.startFrame + MOTION.split.separateStart;
    const p = progress(frame, from, from + MOTION.split.separateDuration);
    const e = interpolate(p, [0, 1], [0, 1], { easing: EASE.inOutCubic });
    for (let i = 0; i < CANDY.count; i += 1) {
      states[i] = {
        x: lerp(CENTER_STAGE.heapX[i], CENTER_STAGE.splitX[i], e),
        y: CANDY.baselineY,
        opacity: 1,
        selected: false,
        size: CANDY.size,
      };
    }
    return states;
  }

  // --- recombine-inverse: split -> back to the centred heap (reverse) ---
  if (frame < read.startFrame) {
    const from = recombine.startFrame + MOTION.recombine.mergeStart;
    const p = progress(frame, from, from + MOTION.recombine.mergeDuration);
    const e = interpolate(p, [0, 1], [0, 1], { easing: EASE.inOutCubic });
    for (let i = 0; i < CANDY.count; i += 1) {
      states[i] = {
        x: lerp(CENTER_STAGE.splitX[i], CENTER_STAGE.heapX[i], e),
        y: CANDY.baselineY,
        opacity: 1,
        selected: false,
        size: CANDY.size,
      };
    }
    return states;
  }

  // --- read-fen-he-shi: candies drop down + dim under the diagram ---
  if (frame < firstSplit.startFrame) {
    const from = read.startFrame + MOTION.read.candyDropStart;
    const p = progress(frame, from, from + MOTION.read.candyDropDuration);
    const e = interpolate(p, [0, 1], [0, 1], { easing: EASE.outCubic });
    for (let i = 0; i < CANDY.count; i += 1) {
      states[i] = {
        x: CENTER_STAGE.heapX[i],
        y: lerp(CANDY.baselineY, CANDY.readDropY, e),
        opacity: lerp(1, 0.5, e),
        selected: false,
        size: CANDY.size,
      };
    }
    return states;
  }

  // --- first-ordered-split: travel centre(dropped) -> left-stage 1|4 ---
  if (frame < slide.startFrame) {
    const from = firstSplit.startFrame + MOTION.firstSplit.candyMoveStart;
    const p = progress(frame, from, from + MOTION.firstSplit.candyMoveDuration);
    const e = interpolate(p, [0, 1], [0, 1], { easing: EASE.inOutCubic });
    const target = leftStageStateX("1-4");
    for (let i = 0; i < CANDY.count; i += 1) {
      states[i] = {
        x: lerp(CENTER_STAGE.heapX[i], target[i], e),
        // candies rise back up from the dropped/dim read position
        y: lerp(CANDY.readDropY, LEFT_STAGE.baselineY, e),
        opacity: lerp(0.5, 1, e),
        selected: false,
        // shrink from centered size to the left-stage packing size
        size: lerp(CANDY.size, CANDY.leftSize, e),
      };
    }
    return states;
  }

  // --- slide-one-at-a-time: 1|4 -> 2|3 -> 3|2 -> 4|1, one candy per slide ---
  if (frame < columnComplete.startFrame) {
    const cueLen = slide.endFrame - slide.startFrame;
    const usable = cueLen - CUE_TAIL_FRAMES;
    const slideWindow = usable / SLIDE_SEQUENCE.length; // 4 slides
    const local = frame - slide.startFrame;
    const idx = Math.min(
      SLIDE_SEQUENCE.length - 1,
      Math.floor(local / slideWindow),
    );
    const within = local - idx * slideWindow;
    const fromKey: SlideStateKey = SLIDE_SEQUENCE[idx];
    const toKey: SlideStateKey =
      SLIDE_SEQUENCE[Math.min(SLIDE_SEQUENCE.length - 1, idx + 1)];
    const crossTo = slideWindow * MOTION.slide.crossFrac;
    const p = progress(within, 0, crossTo);
    const e = interpolate(p, [0, 1], [0, 1], { easing: EASE.inOutCubic });

    const fromX = leftStageStateX(fromKey);
    const toX = leftStageStateX(toKey);
    // the candy that crosses on this slide is the one whose x changes most
    let crossingIndex = 0;
    let maxDelta = -1;
    for (let i = 0; i < CANDY.count; i += 1) {
      const d = Math.abs(toX[i] - fromX[i]);
      if (d > maxDelta) {
        maxDelta = d;
        crossingIndex = i;
      }
    }
    for (let i = 0; i < CANDY.count; i += 1) {
      states[i] = {
        x: lerp(fromX[i], toX[i], e),
        y: LEFT_STAGE.baselineY,
        opacity: 1,
        selected: i === crossingIndex && p > 0 && p < 1,
        size: CANDY.leftSize,
      };
    }
    return states;
  }

  // --- ordered-column-complete & order-matters: candies hold final 4|1 ---
  const finalKey: SlideStateKey = "4-1";
  const finalX = leftStageStateX(finalKey);
  const dimDuringOrder =
    frame >= orderMatters.startFrame
      ? 1 -
        progress(
          frame,
          orderMatters.startFrame +
            Math.round(
              (orderMatters.endFrame - orderMatters.startFrame) *
                MOTION.orderMatters.dimStartFrac,
            ),
          orderMatters.startFrame +
            Math.round(
              (orderMatters.endFrame - orderMatters.startFrame) *
                MOTION.orderMatters.dimStartFrac,
            ) +
            MOTION.orderMatters.dimDuration,
        ) *
          0.55
      : 1;
  for (let i = 0; i < CANDY.count; i += 1) {
    states[i] = {
      x: finalX[i],
      y: LEFT_STAGE.baselineY,
      opacity: dimDuringOrder,
      selected: false,
      size: CANDY.leftSize,
    };
  }
  return states;
};

const CandyStage = ({ frame }: { frame: number }) => {
  const states = candyStatesAt(frame);
  // Breathe anchor: the centroid of the live candies.
  const live = states.filter((s) => s.opacity > 0.05);
  const cx =
    live.length > 0
      ? live.reduce((a, s) => a + s.x, 0) / live.length
      : CENTER_STAGE.dividerX;
  const cy =
    live.length > 0
      ? live.reduce((a, s) => a + s.y, 0) / live.length
      : CANDY.baselineY;

  return (
    <Breathe
      amplitudeScale={0.005}
      bpm={15}
      drift={0.5}
      originX={cx}
      originY={cy}
      phaseSeed="fen-yu-he-candies"
    >
      <g {...measureProps("candy-group")}>
        {states.map((s, i) =>
          s.opacity <= 0.001 ? null : (
            <g key={`candy-${i}`} opacity={s.opacity}>
              <CountableObject
                color={CANDY.color}
                selected={s.selected}
                size={s.size}
                variant={CANDY.variant}
                x={s.x}
                y={s.y}
              />
            </g>
          ),
        )}
      </g>
    </Breathe>
  );
};

// ===========================================================================
// Divider line (zone-divider) — coral action stroke. Draws on at split,
// fades on recombine, returns (left position) for the ordered cues.
// ===========================================================================
const Divider = ({ frame }: { frame: number }) => {
  const split = cueOf("split-into-two");
  const recombine = cueOf("recombine-inverse");
  const read = cueOf("read-fen-he-shi");
  const firstSplit = cueOf("first-ordered-split");
  const orderMatters = cueOf("order-matters");

  const yTop = 300;
  const yBot = 540;

  // Phase 1: centred divider during split-into-two -> recombine
  let x: number = CENTER_STAGE.dividerX;
  let drawProgress = 0; // stroke-on reveal 0..1
  let opacity = 0;
  let active = false;

  if (frame >= split.startFrame && frame < read.startFrame) {
    active = true;
    x = CENTER_STAGE.dividerX;
    if (frame < recombine.startFrame) {
      // draw on during split
      const from = split.startFrame + MOTION.split.dividerStart;
      drawProgress = progress(frame, from, from + MOTION.split.dividerDuration);
      opacity = drawProgress > 0 ? 1 : 0;
    } else {
      // fade out during recombine (line stays fully drawn, only opacity falls)
      const from = recombine.startFrame + MOTION.recombine.dividerFadeStart;
      drawProgress = 1;
      opacity =
        1 - progress(frame, from, from + MOTION.recombine.dividerFadeDuration);
    }
  } else if (frame >= firstSplit.startFrame) {
    // Phase 2: left-stage divider for the ordered cues
    active = true;
    x = LEFT_STAGE.dividerX;
    const from = firstSplit.startFrame + MOTION.firstSplit.candyMoveStart;
    drawProgress = progress(frame, from, from + MOTION.split.dividerDuration);
    // dim (opacity only) along with the column on order-matters
    opacity =
      frame >= orderMatters.startFrame
        ? lerp(
            1,
            0.45,
            progress(
              frame,
              orderMatters.startFrame,
              orderMatters.startFrame + MOTION.orderMatters.dimDuration,
            ),
          )
        : 1;
  }

  if (!active || opacity <= 0.001 || drawProgress <= 0.001) {
    return null;
  }

  return (
    <line
      {...measureProps("divider")}
      opacity={opacity}
      pathLength={1}
      stroke={colors.coral}
      strokeDasharray={1}
      strokeDashoffset={1 - Math.min(1, drawProgress)}
      strokeLinecap="round"
      strokeWidth={10}
      x1={x}
      x2={x}
      y1={yTop}
      y2={yBot}
    />
  );
};

// ===========================================================================
// Big 分合式 diagram (zone-diagram) — read-fen-he-shi. renderNumbers=false;
// the three NumberCards are placed by MigratingGlyphs so they can travel into
// the column at first-ordered-split (identity-preserved "picture -> symbol").
// ===========================================================================
const BigDiagram = ({ frame }: { frame: number }) => {
  const read = cueOf("read-fen-he-shi");
  const firstSplit = cueOf("first-ordered-split");

  // Lines visible from read through the migration in first-ordered-split.
  if (frame < read.startFrame || frame >= firstSplit.endFrame) {
    return null;
  }

  // Line draw-on during read
  const lineFrom = read.startFrame + MOTION.read.lineStart;
  const lineProgress = progress(
    frame,
    lineFrom,
    lineFrom + MOTION.read.lineDuration,
  );

  // The whole diagram fades out as its glyphs migrate during first-ordered.
  const migrateFrom = firstSplit.startFrame + MOTION.firstSplit.migrateStart;
  const migrateProgress = progress(
    frame,
    migrateFrom,
    migrateFrom + MOTION.firstSplit.migrateDuration,
  );
  const linesOpacity = 1 - migrateProgress;

  if (linesOpacity <= 0.001) {
    return null;
  }

  return (
    <Breathe
      amplitudeScale={0.005}
      bpm={15}
      originX={BIG_DIAGRAM.cx}
      originY={BIG_DIAGRAM.cy}
      phaseSeed="fen-yu-he-big-diagram"
    >
      <g {...measureProps("big-diagram")} opacity={linesOpacity}>
        <FenHeDiagram
          diagramWidth={BIG_DIAGRAM.width}
          parts={BIG_DIAGRAM.parts}
          progress={lineProgress}
          renderNumbers={false}
          whole={BIG_DIAGRAM.whole}
          x={BIG_DIAGRAM.cx}
          y={BIG_DIAGRAM.cy}
        />
      </g>
    </Breathe>
  );
};

// The three migrating glyph cards (whole, leftPart, rightPart). They land in
// the big diagram during read-fen-he-shi (bouncy whole-card accent), then
// travel into column row 0 during first-ordered-split. ONE set of instances.
const MigratingGlyphs = ({ frame }: { frame: number }) => {
  const read = cueOf("read-fen-he-shi");
  const firstSplit = cueOf("first-ordered-split");
  const slide = cueOf("slide-one-at-a-time");

  if (frame < read.startFrame || frame >= slide.startFrame) {
    return null;
  }

  const big = bigDiagramAnchors();
  const col0 = columnRowAnchors(0);

  // whole card lands first (bouncy-ish via overshoot scale), parts fade with
  // the line draw-on.
  const wholeLandFrom = read.startFrame + MOTION.read.wholeLandStart;
  const wholeLand = progress(frame, wholeLandFrom, wholeLandFrom + 14);
  const wholeScale = interpolate(wholeLand, [0, 0.6, 1], [0.7, 1.06, 1], {
    easing: EASE.outCubic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const partFrom = read.startFrame + MOTION.read.partFadeStart;
  const partFade = progress(frame, partFrom, partFrom + MOTION.read.partFadeDuration);

  // migration read -> column row 0
  const migrateFrom = firstSplit.startFrame + MOTION.firstSplit.migrateStart;
  const m = progress(
    frame,
    migrateFrom,
    migrateFrom + MOTION.firstSplit.migrateDuration,
  );
  const e = interpolate(m, [0, 1], [0, 1], { easing: EASE.inOutCubic });

  const sizeScale = lerp(1, COLUMN.width / BIG_DIAGRAM.width, e);

  const wholePos = {
    x: lerp(big.whole.x, col0.whole.x, e),
    y: lerp(big.whole.y, col0.whole.y, e),
  };
  const leftPos = {
    x: lerp(big.leftPart.x, col0.leftPart.x, e),
    y: lerp(big.leftPart.y, col0.leftPart.y, e),
  };
  const rightPos = {
    x: lerp(big.rightPart.x, col0.rightPart.x, e),
    y: lerp(big.rightPart.y, col0.rightPart.y, e),
  };

  const cardW = BIG_DIAGRAM.width * 0.36 * sizeScale;
  const cardH = cardW * 1.18;

  return (
    <>
      <g
        {...measureProps("glyph-whole")}
        opacity={Math.min(1, wholeLand)}
        transform={`translate(${wholePos.x} ${wholePos.y}) scale(${wholeScale}) translate(${-wholePos.x} ${-wholePos.y})`}
      >
        <NumberCard
          color="white"
          height={cardH}
          value={BIG_DIAGRAM.whole}
          width={cardW}
          x={wholePos.x}
          y={wholePos.y}
        />
      </g>
      <g opacity={Math.max(partFade, m)}>
        <NumberCard
          color="white"
          height={cardH}
          value={BIG_DIAGRAM.parts[0]}
          width={cardW}
          x={leftPos.x}
          y={leftPos.y}
        />
        <NumberCard
          color="white"
          height={cardH}
          value={BIG_DIAGRAM.parts[1]}
          width={cardW}
          x={rightPos.x}
          y={rightPos.y}
        />
      </g>
    </>
  );
};

// ===========================================================================
// Results column (zone-column) — four 分合式. Row 0's lines appear with the
// migration; rows 1..3 freeze in during the slide cue. ordered-column-complete
// holds them; order-matters lights row 0 and row 3 in turn and dims the rest.
// ===========================================================================

const columnRowVisibility = (frame: number): number[] => {
  // returns per-row reveal 0..1 (line/number draw-on)
  const firstSplit = cueOf("first-ordered-split");
  const slide = cueOf("slide-one-at-a-time");

  const vis = [0, 0, 0, 0];

  // Row 0 appears as the migration completes in first-ordered-split.
  const migrateFrom = firstSplit.startFrame + MOTION.firstSplit.migrateStart;
  vis[0] = progress(
    frame,
    migrateFrom + MOTION.firstSplit.migrateDuration - 6,
    migrateFrom + MOTION.firstSplit.migrateDuration + 6,
  );
  if (frame >= slide.startFrame) {
    vis[0] = 1;
  }

  // Rows 1..3 freeze in during their slide windows.
  if (frame >= slide.startFrame) {
    const cueLen = slide.endFrame - slide.startFrame;
    const usable = cueLen - CUE_TAIL_FRAMES;
    const slideWindow = usable / SLIDE_SEQUENCE.length;
    const local = frame - slide.startFrame;
    for (let row = 1; row <= 3; row += 1) {
      // row `row` freezes during slide index `row-1`
      const slideIdx = row - 1;
      const wStart = slideIdx * slideWindow;
      const freezeFrom = wStart + slideWindow * MOTION.slide.rowFreezeStartFrac;
      const freezeTo = wStart + slideWindow * MOTION.slide.rowFreezeEndFrac;
      vis[row] = progress(local, freezeFrom, freezeTo);
    }
  }
  return vis;
};

const ResultsColumn = ({ frame }: { frame: number }) => {
  const firstSplit = cueOf("first-ordered-split");
  const slide = cueOf("slide-one-at-a-time");
  const columnComplete = cueOf("ordered-column-complete");
  const orderMatters = cueOf("order-matters");

  if (frame < firstSplit.startFrame) {
    return null;
  }

  const vis = columnRowVisibility(frame);

  // order-matters: dim all rows except the two contrasted (0 and 3) when lit.
  const omLen = orderMatters.endFrame - orderMatters.startFrame;
  const dimFrom =
    orderMatters.startFrame +
    Math.round(omLen * MOTION.orderMatters.dimStartFrac);
  const dimAmt =
    frame >= orderMatters.startFrame
      ? progress(frame, dimFrom, dimFrom + MOTION.orderMatters.dimDuration)
      : 0;

  const topLightFrom =
    orderMatters.startFrame +
    Math.round(omLen * MOTION.orderMatters.topLightStartFrac);
  const botLightFrom =
    orderMatters.startFrame +
    Math.round(omLen * MOTION.orderMatters.bottomLightStartFrac);
  const topLight =
    frame >= orderMatters.startFrame
      ? progress(frame, topLightFrom, topLightFrom + MOTION.orderMatters.lightDuration)
      : 0;
  const botLight =
    frame >= orderMatters.startFrame
      ? progress(frame, botLightFrom, botLightFrom + MOTION.orderMatters.lightDuration)
      : 0;

  // ordered-column-complete: travelling emphasis underline down the left parts
  const ccLen = columnComplete.endFrame - columnComplete.startFrame;
  const ccUsable = ccLen - CUE_TAIL_FRAMES;
  const ccDwell = ccUsable / 4;

  return (
    <Breathe
      amplitudeScale={0.004}
      bpm={15}
      originX={COLUMN.cx}
      originY={columnRowY(1.5)}
      phaseSeed="fen-yu-he-column"
    >
      {COLUMN.rows.map((parts, row) => {
        const reveal = vis[row];
        if (reveal <= 0.001) {
          return null;
        }
        // dim / light state for order-matters
        const isContrast = row === 0 || row === 3;
        const lit = row === 0 ? topLight : row === 3 ? botLight : 0;
        const dimmed = dimAmt > 0.5 && !(isContrast && lit > 0.4);
        const cy = columnRowY(row);

        // Row 0 numerals are drawn by MigratingGlyphs until the slide cue
        // begins; after that the diagram renders its own numbers. This avoids
        // a double-card on row 0 (CAPABILITIES anti-pattern).
        const renderNumbers = !(row === 0 && frame < slide.startFrame);

        // sunshine highlight pulse on the contrasted rows
        const litColor = lit > 0 ? colors.sunshine : undefined;
        const litScale = isContrast ? lerp(1, 1.06, lit) : 1;

        return (
          <g
            key={`row-${row}`}
            {...measureProps(`column-row-${row}`)}
            transform={
              isContrast && lit > 0
                ? `translate(${COLUMN.cx} ${cy}) scale(${litScale}) translate(${-COLUMN.cx} ${-cy})`
                : undefined
            }
          >
            {litColor ? (
              <rect
                fill={litColor}
                height={COLUMN.rowPitch * 0.92}
                opacity={lit * 0.35}
                rx={18}
                width={COLUMN.width + 36}
                x={COLUMN.cx - (COLUMN.width + 36) / 2}
                y={cy - (COLUMN.rowPitch * 0.92) / 2}
              />
            ) : null}
            <FenHeDiagram
              diagramWidth={COLUMN.width}
              dimmed={dimmed}
              parts={parts}
              progress={reveal}
              renderNumbers={renderNumbers}
              verticalReachRatio={COLUMN.reachRatio}
              whole={COLUMN.whole}
              x={COLUMN.cx}
              y={cy}
            />
          </g>
        );
      })}

      {/* ordered-column-complete: navy emphasis travelling down the left parts */}
      {frame >= columnComplete.startFrame && frame < orderMatters.startFrame
        ? COLUMN.rows.map((_, row) => {
            const local = frame - columnComplete.startFrame;
            const from = row * ccDwell;
            const u = progress(local, from, from + MOTION.columnComplete.underlineDuration);
            if (u <= 0.001) {
              return null;
            }
            const a = columnRowAnchors(row);
            const halfW = (COLUMN.width * 0.36) / 2;
            return (
              <TeacherMark
                anchor={{
                  end: { x: a.leftPart.x + halfW, y: a.leftPart.y + halfW + 6 },
                  kind: "span",
                  start: {
                    x: a.leftPart.x - halfW,
                    y: a.leftPart.y + halfW + 6,
                  },
                }}
                drawProgress={u}
                jitterSeed={10 + row}
                key={`cc-${row}`}
                kind="underline"
                strokeColor="textNavy"
              />
            );
          })
        : null}
    </Breathe>
  );
};

// ===========================================================================
// Sketch marks (zone-marks). read-fen-he-shi: two sequenced read-direction
// arrows. order-matters: one settled vs-mark between the two contrasted rows.
// ===========================================================================
const SketchMarks = ({ frame }: { frame: number }) => {
  const read = cueOf("read-fen-he-shi");
  const orderMatters = cueOf("order-matters");

  const marks: React.ReactNode[] = [];

  // read-fen-he-shi: TWO spatially-distinct, text-labelled read-direction
  // arrows (a 分合式 reads two ways). 分成 = DOWN arrow + label on the LEFT
  // limb; 组成 = UP arrow + label on the RIGHT limb. Neither crosses the "5"
  // or any part card (shafts parked outward via readArrowGeometry). The label
  // appears/fades with its arrow. 分成 draws first, 组成 second (cue-relative).
  if (frame >= read.startFrame && frame < read.endFrame) {
    const fadeFrom = read.endFrame - SKETCH.read.fadeBeforeEnd;
    const fadeReveal = 1 - progress(frame, fadeFrom, read.endFrame);

    const arrowDefs: Array<{
      which: 1 | 2;
      startOff: number;
      labelText: string;
      jitterSeed: number;
    }> = [
      {
        which: 1,
        startOff: SKETCH.read.arrow1Start,
        labelText: SKETCH.read.labelText.fen,
        jitterSeed: 1,
      },
      {
        which: 2,
        startOff: SKETCH.read.arrow2Start,
        labelText: SKETCH.read.labelText.zu,
        jitterSeed: 2,
      },
    ];

    for (const def of arrowDefs) {
      const from = read.startFrame + def.startOff;
      const draw = progress(frame, from, from + SKETCH.read.drawDuration);
      if (draw <= 0.001) {
        continue;
      }
      const geo = readArrowGeometry(def.which);
      // Arrow and label are SEPARATE registered elements (manifest:
      // read-arrow-fen/zu vs read-label-fen/zu) — tag each independently so the
      // measured pass joins them to the right manifest id.
      const arrowId = def.which === 1 ? "read-arrow-fen" : "read-arrow-zu";
      const labelId = def.which === 1 ? "read-label-fen" : "read-label-zu";
      marks.push(
        <g key={`read-arrow-${def.which}`} opacity={0.92 * fadeReveal}>
          <g {...measureProps(arrowId)}>
            <TeacherMark
              anchor={{ end: geo.end, kind: "span", start: geo.start }}
              drawProgress={draw}
              jitterSeed={def.jitterSeed}
              kind="label-arrow"
              strokeColor="textNavy"
            />
          </g>
          <g {...measureProps(labelId)}>
            <LabelCallout
              color="textNavy"
              fontSize={SKETCH.read.labelFontSize}
              fontWeight={900}
              progress={draw}
              text={def.labelText}
              x={geo.label.x}
              y={geo.label.y}
            />
          </g>
        </g>,
      );
    }
  }

  // order-matters: vs-mark between row 0 and row 3 of the column.
  if (frame >= orderMatters.startFrame && frame < orderMatters.endFrame) {
    const omLen = orderMatters.endFrame - orderMatters.startFrame;
    const drawFrom =
      orderMatters.startFrame +
      Math.round(omLen * SKETCH.orderMatters.drawStartFrac);
    const draw = progress(
      frame,
      drawFrom,
      drawFrom + SKETCH.orderMatters.drawDuration,
    );
    const fadeFrom = orderMatters.endFrame - SKETCH.orderMatters.fadeBeforeEnd;
    const fadeReveal = 1 - progress(frame, fadeFrom, orderMatters.endFrame);
    if (draw > 0.001) {
      const midY =
        (columnRowY(SKETCH.orderMatters.vsRowA) +
          columnRowY(SKETCH.orderMatters.vsRowB)) /
        2;
      marks.push(
        <g key="order-vs" {...measureProps("order-vs-mark")} opacity={0.92 * fadeReveal}>
          <TeacherMark
            anchor={{ kind: "point", x: SKETCH.orderMatters.vsX, y: midY }}
            drawProgress={draw}
            jitterSeed={3}
            kind="vs-mark"
            settle={{ magnitude: SKETCH.orderMatters.settleMagnitude }}
            strokeColor="textNavy"
          />
        </g>,
      );
    }
  }

  return <>{marks}</>;
};

// ===========================================================================
// Scene root. SceneFrame chrome (eyebrow/title) is intentionally NOT used as
// the teaching header — the Visual Contract forbids a lesson-title header
// beside the stage. We render a bare cream AbsoluteFill-equivalent svg root
// so the only title is the intro card (zone-title), which clears before the
// candies. SceneFrame's fixed header would violate the contract, so the scene
// composes its own background instead.
// ===========================================================================
export const FenYuHeLessonScene: React.FC = () => {
  const frame = useCurrentFrame();
  // Inert in normal renders; under the --measured pass it logs each
  // [data-mid] element's true getBBox per frame (lesson-agnostic hook).
  useMeasureHook();

  return (
    <div
      style={{
        backgroundColor: colors.cream,
        fontFamily: typography.fontFamily,
        height: video.height,
        overflow: "hidden",
        position: "absolute",
        width: video.width,
      }}
    >
      <svg
        height={video.height}
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width={video.width}
      >
        <IntroTitle frame={frame} />
        <Divider frame={frame} />
        <CandyStage frame={frame} />
        <BigDiagram frame={frame} />
        <ResultsColumn frame={frame} />
        <MigratingGlyphs frame={frame} />
        <SketchMarks frame={frame} />
        {/* Signaling (Mayer): a finger to the candy heap as the narration
            "先看中间这一堆糖" begins. Cue-relative frames only; the pointer is
            marks-zone chrome (marks∩objects allowed), not a manifest element. */}
        <FocusPointer
          cueId="five-whole"
          anchorX={CENTER_STAGE.dividerX}
          anchorY={CANDY.baselineY}
          direction="down"
          variant="hand"
          frame={frame}
          cueStartFrame={cueOf("five-whole").startFrame}
          cueEndFrame={cueOf("five-whole").endFrame}
        />
      </svg>
    </div>
  );
};
