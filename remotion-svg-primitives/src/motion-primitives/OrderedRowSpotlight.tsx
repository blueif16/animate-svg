import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  CountStepIndicator,
  PartWholeBrace,
  PointerHandArrow,
  StepTally,
  TeacherMark,
  type ThemeColor,
} from "../shape-primitives";
import { colors } from "../theme";
import { fontFamily } from "../shape-primitives/shared";
import { EASE } from "./curves";

export type OrderedRowDirection = "ltr" | "rtl";

export type OrderedRowSpotlightProps = {
  /**
   * The ordered row members, left→right in ARRAY order (array index is fixed
   * scene content — a countable, a face, a stick). Identity lives here; the
   * component never recreates them, it only re-NUMBERS them. 2..~8 items.
   */
  items: ReactNode[];
  /**
   * Which END is position 1. `"ltr"` (default): the leftmost item is 第1.
   * `"rtl"`: the rightmost item is 第1. Flipping this re-derives EVERY position
   * live (the same array index gets a mirror position) — the relativity /
   * 参照点变化 / turn-around payoff. Array order and identity never change.
   */
  direction?: OrderedRowDirection;
  /**
   * Run the 1→N finger count-walk: the finger steps across positions 1→N,
   * derived from `atFrame`/`stepDurationFrames`, the running tally counting up
   * as it goes. Opt-in (default false) so a static cardinal/ordinal panel shows
   * NO finger or tally. `pointerIndex` (below) pins the finger to one item
   * without time-stepping and implies the walk is on.
   */
  countWalk?: boolean;
  /**
   * Pin the finger to a specific item, as an ARRAY index (0..n-1) — the caller
   * drives the walk frame-by-frame (or freezes it on one item) instead of the
   * time-derived step. Implies the walk overlays (finger + tally) are shown.
   */
  pointerIndex?: number;
  /**
   * Mark ONLY this 1-based POSITION as 第N — an ordinal spotlight ring + the
   * OrdinalLabelToken below it. Because it is a POSITION (not an array index),
   * a `direction` flip moves the spotlight to the mirror item automatically
   * (第2 ↔ 第4). Omit for pure cardinal / count-walk mode.
   */
  spotlightOrdinal?: number;
  /**
   * Bracket ALL items with a PartWholeBrace(up) carrying `cardinalLabel` — the
   * cardinal ('一共N') half of the cardinal-vs-ordinal contrast. The spotlight
   * names ONE position; the bracket names the WHOLE heap. Default false.
   */
  showCardinalBracket?: boolean;
  /**
   * Caller localizes the ordinal token text from a 1-based position
   * (`(pos) => '第' + pos`). NEVER baked — the component knows no language.
   * Required whenever `spotlightOrdinal` is set.
   */
  ordinalLabel?: (pos: number) => ReactNode;
  /**
   * Caller-supplied cardinal-bracket label node (e.g. '一共5'). Shown only when
   * `showCardinalBracket` is true. Never baked.
   */
  cardinalLabel?: ReactNode;
  /**
   * Local (cue-relative) frame. The component derives the pointer-walk progress,
   * the spotlight pop, and the direction-arrow draw-on from `atFrame` +
   * `stepDurationFrames` — ZERO frame literals. The composer passes
   * `cues[id].startFrame + offset`; this component never reads a master literal.
   */
  atFrame: number;
  /**
   * Frames per pointer step of the 1→N walk (and the unit the spotlight pop /
   * arrow draw-on are paced against). Default 18. This is the FALLBACK cadence:
   * a fixed, voice-INDEPENDENT grid. For a SPOKEN enumeration (the finger lands
   * as the narration utters 第一/第二/第三) pass `stepFrames` instead so each step
   * binds to the measured ASR onset, never this assumed interval.
   */
  stepDurationFrames?: number;
  /**
   * MEASURED per-position step frames (cue-LOCAL, same space as `atFrame`'s
   * `local = frame - atFrame`): entry k is the local frame at which position k+1
   * becomes active — i.e. the ASR onset of the k-th spoken ordinal/number, from
   * `cue.tokenOnsets` via the kit `stepFramesFromOnsets` / `tokenOnsetFrame`
   * helper. When provided, the count-walk, the per-position spotlight pop, and
   * any per-step overlay advance on THESE onsets instead of the fixed
   * `stepDurationFrames` grid — so the mark lands when the word is spoken. When
   * ABSENT, the component falls back to the constant grid unchanged (no behavior
   * change for current consumers). Must be non-decreasing; length ≥ N is ideal
   * (a short array clamps the tail to its last onset).
   */
  stepFrames?: number[];
  /**
   * Draw the direction arrow (TeacherMark label-arrow) along the row toward the
   * position-1 end. On a `direction` flip the arrow re-points and re-draws — the
   * "set direction" half of the two-action set-then-count beat. Default true
   * whenever an ordinal context is in play; pass false for a bare count-walk.
   */
  showDirectionArrow?: boolean;
  /** Horizontal spacing between adjacent item centers (px). Default 150. */
  rowGap?: number;
  /** Ink color of the direction arrow + numbering. Default textNavy. */
  arrowColor?: ThemeColor;
  /** Spotlight ring + ordinal-token accent color. Default coral. */
  spotlightColor?: ThemeColor;
  /** Center of the whole component in the parent coordinate system. */
  x?: number;
  y?: number;
  /**
   * Per-item footprint radius used to size the spotlight ring and to keep the
   * pointer / brace / arrow clear of the items. Match your item's visual radius.
   * Default 64.
   */
  itemRadius?: number;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Vertical offsets (local units), measured from the item row at y=0. Each
// channel owns a disjoint band (kids-eye zone discipline) so nothing overlaps.
// ABOVE the row (negative y): tally (running count, top) → brace (cardinal heap)
// → arrow (direction), nearest the row. BELOW the row (positive y): per-item
// position number (nearest) → finger → ordinal token (the 第N spotlight, low).
const ARROW_GAP = 34; // above the items
const BRACE_GAP = 96; // above the arrow
const TALLY_GAP = 188; // above everything (running count, opposite the finger)
const POSNUM_GAP = 30; // below the items
const POINTER_GAP = 92; // below the position numbers (finger touches up at item)
const TOKEN_GAP = 232; // below the finger (clear of its downward reach)

/**
 * OrderedRowSpotlight — one ORDERED row of caller-supplied items with four
 * composable overlays that together teach the whole ordinal cluster: a moving
 * finger that counts the row 1→N, a single-position ordinal spotlight (mark ONLY
 * 第N), an optional cardinal bracket ('一共N') for the cardinal-vs-ordinal
 * contrast, and a direction arrow that RENUMBERS the row from the chosen end.
 *
 * The renumber is a pure function of `direction`: position(arrayIndex) =
 * ltr ? i+1 : n-i. Flip `direction` and the SAME item gets its mirror position
 * (第2 ↔ 第4) live, with array identity untouched — the relativity / 参照点变化 /
 * turn-around payoff. `spotlightOrdinal` is a POSITION, so the spotlight tracks
 * the flip automatically.
 *
 * Composes registered primitives only — PointerHandArrow (finger walk),
 * StepTally + CountStepIndicator (running tally + per-item position numbers),
 * PartWholeBrace(up) (cardinal heap), TeacherMark(label-arrow) (direction arrow)
 * — plus an inline OrdinalLabelToken for the 第N spotlight, all with named
 * `EASE.*` motion. ZERO frame literals (public API takes `atFrame` +
 * `stepDurationFrames`, the caller offsets from a cue), ZERO raw motion literals.
 *
 * Lesson-agnostic: any N (2..~8), any item kind, either direction, cardinal OR
 * ordinal mode. Drives 摆数说写, ordinal spotlight, cardinal/ordinal contrast,
 * relativity, and turn-around with the same component — the caller varies props.
 */
export const OrderedRowSpotlight: React.FC<OrderedRowSpotlightProps> = ({
  items,
  direction = "ltr",
  countWalk = false,
  pointerIndex,
  spotlightOrdinal,
  showCardinalBracket = false,
  ordinalLabel,
  cardinalLabel,
  atFrame,
  stepDurationFrames = 18,
  stepFrames,
  showDirectionArrow,
  rowGap = 150,
  arrowColor,
  spotlightColor,
  x = 0,
  y = 0,
  itemRadius = 64,
}) => {
  const frame = useCurrentFrame();
  const n = items.length;
  const local = frame - atFrame;
  const D = Math.max(1, stepDurationFrames);

  // ---- Measured per-step onsets (spoken-enumeration sync) -------------------
  // When the caller supplies `stepFrames` (cue-local ASR onset frames per
  // position), every spoken step binds to its MEASURED onset instead of the
  // fixed `D` grid. `onsetMode` gates all the onset-aware branches below; absent
  // → the existing constant-grid fallback runs unchanged.
  const onsetMode = Array.isArray(stepFrames) && stepFrames.length > 0;
  // The cue-local onset frame at which position `pos` (1-based) becomes active.
  // Clamps a short array to its last onset (never invents an interval) and a
  // long array to its tail, so it is total over any 1..N. Falls back to the
  // grid (`(pos-1)*D`) when not in onset mode.
  const stepOnset = (pos: number): number => {
    if (!onsetMode) {
      return (pos - 1) * D;
    }
    const idx = Math.min(stepFrames!.length - 1, Math.max(0, pos - 1));
    return stepFrames![idx];
  };
  // Which position is active at `local`: the highest position whose onset has
  // been reached (1..N). Pure linear scan — N is small (2..~8).
  const stepFromOnsets = (): number => {
    let active = 1;
    for (let pos = 1; pos <= n; pos += 1) {
      if (local >= stepOnset(pos)) {
        active = pos;
      }
    }
    return active;
  };
  const ltr = direction === "ltr";
  const ink = arrowColor ?? colors.textNavy;
  const accent = spotlightColor ?? colors.coral;
  const hasOrdinalContext =
    spotlightOrdinal !== undefined || showCardinalBracket;
  const wantArrow = showDirectionArrow ?? hasOrdinalContext;

  if (n === 0) {
    return null;
  }

  // Array index i → local-x center of that item. Array order is fixed scene
  // content; it never depends on direction.
  const itemX = (i: number) => (i - (n - 1) / 2) * rowGap;

  // The renumber engine. position(arrayIndex) and its inverse — the SINGLE
  // place `direction` enters. Flip direction → every position mirrors live.
  const posOf = (i: number) => (ltr ? i + 1 : n - i);
  const indexOfPos = (pos: number) => (ltr ? pos - 1 : n - pos);

  // Row horizontal extent (item centers), for sizing the brace + arrow.
  const leftX = itemX(0);
  const rightX = itemX(n - 1);

  // ---- Direction arrow (drawn FIRST on a flip — "set direction") -----------
  // It runs from the position-N end toward the position-1 end, so its head
  // points at 第1. ltr: head at the left end; rtl: head at the right end.
  const arrowDy = -(itemRadius + ARROW_GAP);
  const arrowHeadX = ltr ? leftX - rowGap * 0.32 : rightX + rowGap * 0.32;
  const arrowTailX = ltr ? rightX + rowGap * 0.1 : leftX - rowGap * 0.1;
  // The arrow draws on across the first step window so it LEADS the renumber.
  const arrowReveal = interpolate(local, [0, D], [0, 1], {
    ...CLAMP,
    easing: EASE.enter,
  });

  // ---- Pointer-walk (1→N finger) -------------------------------------------
  // The finger + tally overlays run ONLY when the caller opts in: `countWalk`
  // (time-derived 1→N stepping) or `pointerIndex` (caller-pinned item). A bare
  // cardinal/ordinal panel shows neither — no spurious finger or count pill.
  const derivedStep = Math.floor(local / D); // 0,1,2,... advancing each window
  const explicit = pointerIndex !== undefined;
  // The pointer counts by POSITION 1→N. In onset mode the active position is the
  // highest spoken onset reached (MEASURE, DON'T ASSUME); otherwise it advances
  // on the fixed `D` grid. When `pointerIndex` is given, that array index IS the
  // current item and its position drives the tally.
  const currentPos = explicit
    ? posOf(Math.min(Math.max(0, Math.round(pointerIndex)), n - 1))
    : onsetMode
      ? stepFromOnsets()
      : Math.min(n, Math.max(1, derivedStep + 1));
  // The walk only renders once it has begun (local >= 0) and the caller asked
  // for it.
  const walkActive = (countWalk || explicit) && local >= 0 && n >= 1;

  // Sub-step progress 0→1 within the current window (for finger glide + settle).
  // In onset mode the window opens at this position's measured onset and its
  // length is the gap to the NEXT onset (or `D` for the final position); the
  // finger settles within the first 70% of that window. Out of onset mode the
  // window is the fixed `D` grid, unchanged.
  const windowStart = onsetMode ? stepOnset(currentPos) : (currentPos - 1) * D;
  // Gap to the next onset; for the final position there is no next onset, so the
  // glide window falls back to the fixed `D` cadence.
  const nextOnsetGap =
    onsetMode && currentPos < n ? stepOnset(currentPos + 1) - windowStart : 0;
  const windowLen = onsetMode ? (nextOnsetGap > 0 ? nextOnsetGap : D) : D;
  const stepProgress = explicit
    ? 1
    : interpolate(local - windowStart, [0, windowLen * 0.7], [0, 1], {
        ...CLAMP,
        easing: EASE.outCubic,
      });

  // Finger x glides from the previous position's item to the current one.
  const curIdx = indexOfPos(currentPos);
  const prevIdx = indexOfPos(Math.max(1, currentPos - 1));
  const fingerX = explicit
    ? itemX(curIdx)
    : itemX(prevIdx) + (itemX(curIdx) - itemX(prevIdx)) * stepProgress;
  const pointerDy = itemRadius + POINTER_GAP;

  // ---- Ordinal spotlight ----------------------------------------------------
  const spotIdx =
    spotlightOrdinal !== undefined ? indexOfPos(spotlightOrdinal) : -1;
  const spotValid = spotIdx >= 0 && spotIdx < n;
  // The spotlight pops as the walk reaches its position. In onset mode that is
  // the MEASURED onset of the spotlit ordinal (so the ring lands when the word
  // is spoken); otherwise a beat after the grid step. At start when there is no
  // walk context.
  const spotStart =
    explicit || !walkActive
      ? 0
      : onsetMode
        ? stepOnset(spotlightOrdinal ?? 1)
        : (spotlightOrdinal ?? 1) * D;
  const spotReveal = interpolate(local, [spotStart, spotStart + D * 0.7], [0, 1], {
    ...CLAMP,
    easing: EASE.overshoot,
  });

  // ---- Cardinal bracket -----------------------------------------------------
  const braceWidth = rightX - leftX;
  const braceReveal = interpolate(local, [0, D * 1.2], [0, 1], {
    ...CLAMP,
    easing: EASE.enter,
  });

  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Cardinal bracket — the WHOLE-heap claim, top band. */}
      {showCardinalBracket ? (
        <g transform={`translate(${leftX} ${-itemRadius - BRACE_GAP})`}>
          <PartWholeBrace
            direction="up"
            label={
              cardinalLabel !== undefined ? (
                <tspan
                  fill={ink}
                  fontFamily={fontFamily}
                  fontWeight={900}
                >
                  {cardinalLabel}
                </tspan>
              ) : undefined
            }
            progress={braceReveal}
            width={braceWidth}
          />
        </g>
      ) : null}

      {/* Direction arrow — "set direction", drawn on first. */}
      {wantArrow ? (
        <TeacherMark
          anchor={{
            end: { x: arrowHeadX, y: arrowDy },
            kind: "span",
            start: { x: arrowTailX, y: arrowDy },
          }}
          drawProgress={arrowReveal}
          kind="label-arrow"
          strokeColor={ink}
          strokeWidth={5}
        />
      ) : null}

      {/* The ordered row of caller items — fixed array identity. */}
      {items.map((node, i) => (
        <g key={i} transform={`translate(${itemX(i)} 0)`}>
          {node}
        </g>
      ))}

      {/* Ordinal spotlight ring — marks ONLY the 第N item. */}
      {spotValid && spotReveal > 0 ? (
        <g transform={`translate(${itemX(spotIdx)} 0)`} opacity={spotReveal}>
          <circle
            cx={0}
            cy={0}
            fill="none"
            r={itemRadius + 14}
            stroke={accent}
            strokeDasharray="14 10"
            strokeLinecap="round"
            strokeWidth={6}
            transform={`scale(${interpolate(spotReveal, [0, 1], [0.82, 1], CLAMP)})`}
          />
        </g>
      ) : null}

      {/* Per-item POSITION numbers below each item — the ORDINAL device, shown
          only when a spotlight position is in play (a pure-cardinal bracket
          panel shows none, so the heap reads as "how many", not "ordered").
          They are what RE-NUMBERS on a direction flip; the spotlit one rides the
          accent, the rest stay faint context. */}
      {spotValid
        ? items.map((_, i) => {
            const pos = posOf(i);
            const isSpot = i === spotIdx;
            const numReveal = isSpot
              ? spotReveal
              : Math.min(1, spotReveal + 0.0001);
            if (numReveal <= 0) {
              return null;
            }
            return (
              <g key={`pos-${i}`} opacity={isSpot ? 1 : 0.4}>
                <CountStepIndicator
                  color={isSpot ? accent : ink}
                  outlineColor={isSpot ? accent : ink}
                  progress={numReveal}
                  size={isSpot ? 56 : 44}
                  value={pos}
                  x={itemX(i)}
                  y={itemRadius + POSNUM_GAP}
                />
              </g>
            );
          })
        : null}

      {/* Moving finger — the 1→N count-walk. */}
      {walkActive ? (
        <PointerHandArrow
          direction="up"
          progress={Math.min(1, stepProgress + 0.4)}
          size={86}
          variant="hand"
          x={fingerX}
          y={pointerDy}
        />
      ) : null}

      {/* Ordinal token — the localized 第N label under the spotlit item. */}
      {spotValid && spotReveal > 0 && ordinalLabel ? (
        <OrdinalLabelToken
          accent={accent}
          ink={ink}
          label={ordinalLabel(spotlightOrdinal as number)}
          progress={spotReveal}
          x={itemX(spotIdx)}
          y={itemRadius + TOKEN_GAP}
        />
      ) : null}

      {/* Running tally of the count-walk — the cardinal count SO FAR. Sits in
          the TOP band, opposite the finger, so it never collides with the
          below-row ordinal token. */}
      {walkActive ? (
        <StepTally
          progress={interpolate(local, [0, D * 0.5], [0, 1], CLAMP)}
          size={62}
          steps={currentPos}
          variant="numeric"
          x={0}
          y={-(itemRadius + TALLY_GAP)}
        />
      ) : null}
    </g>
  );
};

type OrdinalLabelTokenProps = {
  label: ReactNode;
  progress: number;
  accent: string;
  ink: string;
  x: number;
  y: number;
};

/**
 * OrdinalLabelToken — the 第N spotlight chip. A rounded accent-bordered pill
 * with a small upward connector to the item it names, popping in via `progress`.
 * The caller passes the already-localized label node ('第5', '第2' …); the token
 * bakes no string. Internal to OrderedRowSpotlight (one concern: name the single
 * spotlit position), not a standalone catalog entry.
 */
const OrdinalLabelToken: React.FC<OrdinalLabelTokenProps> = ({
  label,
  progress,
  accent,
  ink,
  x,
  y,
}) => {
  const pop = interpolate(progress, [0, 0.7, 1], [0.7, 1.06, 1], CLAMP);
  const w = 132;
  const h = 64;
  return (
    <g transform={`translate(${x} ${y})`} opacity={progress}>
      {/* connector up to the item */}
      <line
        stroke={accent}
        strokeLinecap="round"
        strokeWidth={5}
        x1={0}
        x2={0}
        y1={-h / 2 - 22}
        y2={-h / 2}
      />
      <g transform={`scale(${pop})`}>
        <rect
          fill={colors.white}
          height={h}
          rx={h / 2}
          stroke={accent}
          strokeWidth={5}
          width={w}
          x={-w / 2}
          y={-h / 2}
        />
        <text
          dominantBaseline="middle"
          fill={ink}
          fontFamily={fontFamily}
          fontSize={36}
          fontWeight={900}
          textAnchor="middle"
          x={0}
          y={2}
        >
          {label}
        </text>
      </g>
    </g>
  );
};
