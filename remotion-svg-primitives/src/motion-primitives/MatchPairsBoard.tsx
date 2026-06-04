import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  PairConnector,
  PointerHandArrow,
  RewardProgressToken,
} from "../shape-primitives";
import { colors } from "../theme";
import { EASE } from "./curves";
import { PopIn } from "./PopIn";
import { SparkleBurst } from "./SparkleBurst";

export type MatchPairsMode = "demonstrate" | "quiz";
export type MatchPairsConnectorStyle = "dotted" | "solid";

export type MatchPair = {
  /** Index into `left[]` — the left-column item this link starts at. */
  left: number;
  /** Index into `right[]` — the CORRECT right-column item this link ends at. */
  right: number;
  /**
   * QUIZ-ONLY, opt-in. An index into `right[]` of a WRONG right item the
   * learner "tries" first: in `mode='quiz'` a connector grows to this target,
   * snaps RED, and retracts BEFORE the correct connector draws. Ignored in
   * `demonstrate` mode and when equal to `right`. Keep it sparse — one wrong
   * attempt teaches "check, then fix"; many turn the board into noise.
   */
  wrongRight?: number;
};

export type MatchPairsBoardProps = {
  /**
   * The LEFT column nodes, top→bottom in array order (pictures, IconAssets,
   * VocabFlashcards, hanzi cards — ANY ReactNode). Identity is caller scene
   * content; the component only places them in an evenly-spaced column and
   * derives each one's center for the connector endpoints. NEVER baked.
   */
  left: ReactNode[];
  /**
   * The RIGHT column nodes, top→bottom in array order (words, characters,
   * targets — ANY ReactNode). Same contract as `left`. NEVER baked.
   */
  right: ReactNode[];
  /**
   * The CORRECT matches as index pairs into `left[]` / `right[]`. The component
   * draws ONE PairConnector per entry, IN ARRAY ORDER (pair 0 first), each
   * snapping its right endpoint dot GREEN on completion. A right index may be
   * the partner of exactly one left item — but the columns need not be the same
   * length and not every item must be paired. 1..~5 pairs stay legible.
   */
  pairs: MatchPair[];
  /**
   * `demonstrate` (default) — auto-draw the correct connectors one by one, the
   * teacher modeling the 连一连. `quiz` — for any pair carrying `wrongRight`,
   * show ONE wrong attempt (grows → snaps red → retracts) before the correct
   * connector draws, modeling self-correction. Pairs without `wrongRight` draw
   * straight through in either mode.
   */
  mode?: MatchPairsMode;
  /**
   * Local (cue-relative) frame. The component derives EVERY pair's local
   * progress BY INDEX from `atFrame` + `perPairDurationFrames` (+ gap) — ZERO
   * frame literals. The composer passes `cues[id].startFrame + offset`; this
   * component never reads a master-timeline literal.
   */
  atFrame: number;
  /** Frames each pair's connector takes to draw + settle before the next
   *  begins. Default 40. */
  perPairDurationFrames?: number;
  /** Extra frames between one pair finishing and the next starting. Default 8. */
  interPairGapFrames?: number;
  /**
   * Trace the ACTIVE link with a PointerHandArrow that rides along the growing
   * connector toward its right endpoint — the teacher's finger following the
   * line. Opt-in (default false) so a clean board shows no finger. */
  showPointer?: boolean;
  /**
   * Fire a celebration (SparkleBurst + a collected RewardProgressToken) once
   * EVERY pair has linked. Default true — the 连一连 "all matched!" payoff.
   */
  celebrateOnComplete?: boolean;
  /** Caller-supplied celebration label node under the reward token (e.g. a
   *  localized 'Great!' / '真棒！'). Never baked; omit for a bare token. */
  celebrateLabel?: ReactNode;
  /** Connector ink style. Default 'solid'. */
  connectorStyle?: MatchPairsConnectorStyle;
  /** Connector color while drawing / when correct-but-pending. Default sky. */
  connectorColor?: string;
  /** Wrong-attempt connector color (quiz mode). Default coral. */
  wrongColor?: string;
  /** Connector stroke width. Default 5. */
  connectorStrokeWidth?: number;
  /** Horizontal gap between the two column centers (px). Default 560. */
  columnGap?: number;
  /** Vertical gap between adjacent items WITHIN a column (px). Default 150. */
  itemGap?: number;
  /**
   * Per-item footprint radius (px). Sizes the gutter the connector endpoints
   * sit in (so lines touch the inner edge of each item, never pierce it) and
   * keeps the pointer clear. Match your item nodes' visual radius. Default 70.
   */
  itemRadius?: number;
  /** Center of the whole board in the parent coordinate system. */
  x?: number;
  y?: number;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A single pair's window is split: [draw → settle-hold]. The connector grows
// over the first DRAW_FRACTION of the window, then holds (snapped) for the rest
// so the green completion dot reads before the next pair opens.
const DRAW_FRACTION = 0.72;
// In quiz mode the wrong attempt consumes the FRONT of the window: grow to the
// wrong target, snap red, retract — then the correct connector draws in the
// remaining time. These fractions partition one pair window.
const WRONG_GROW = 0.22;
const WRONG_HOLD = 0.34;
const WRONG_RETRACT = 0.46;

/**
 * MatchPairsBoard — the 连一连 / "match the pairs" beat: two caller-supplied
 * columns (pictures one side, words the other) with a line drawn from each item
 * to the one it belongs with, IN ORDER, every correct link snapping its endpoint
 * dot GREEN on completion. When all pairs connect, an optional celebration fires.
 *
 * Lesson-agnostic & prop-driven — it bakes NO topic, value, or English/Chinese
 * string: `left`/`right` are caller ReactNode columns (IconAssets, VocabFlashcards,
 * hanzi cards, any node), `pairs` are the correct index→index matches, and the
 * celebration label is a caller node. The SAME component drives a 统编版 Chinese
 * 连一连 (object picture ↔ 汉字 card), a 人教版PEP English word↔picture match, and
 * any future item↔target pairing — the caller only varies props.
 *
 * Two modes: `demonstrate` (default) auto-draws the correct connectors one by
 * one (the teacher models the match); `quiz` lets any pair carry a `wrongRight`
 * index so a wrong attempt grows → snaps RED → retracts before the correct line
 * draws (the learner self-corrects). Quiz is minimal and opt-in.
 *
 * COMPOSES registered capabilities only — `PairConnector` for EVERY link (its
 * grow + snap-green is exactly this beat; never hand-roll a line), `PopIn` for
 * the column entrance, an opt-in `PointerHandArrow` tracing the active link, and
 * `SparkleBurst` + `RewardProgressToken` for the all-matched celebration — with
 * named `EASE.*` motion. The endpoints fed to PairConnector are derived from each
 * column item's COMPUTED center (layout math from props). ZERO frame literals
 * (public API takes `atFrame` + `perPairDurationFrames`; every pair's progress
 * derived BY INDEX), ZERO raw motion literals.
 */
export const MatchPairsBoard: React.FC<MatchPairsBoardProps> = ({
  left,
  right,
  pairs,
  mode = "demonstrate",
  atFrame,
  perPairDurationFrames = 40,
  interPairGapFrames = 8,
  showPointer = false,
  celebrateOnComplete = true,
  celebrateLabel,
  connectorStyle = "solid",
  connectorColor,
  wrongColor,
  connectorStrokeWidth = 5,
  columnGap = 560,
  itemGap = 150,
  itemRadius = 70,
  x = 0,
  y = 0,
}) => {
  const frame = useCurrentFrame();
  const local = frame - atFrame;
  const D = Math.max(1, perPairDurationFrames);
  const gap = Math.max(0, interPairGapFrames);
  const step = D + gap; // one whole pair occupies D+gap before the next opens

  const lineColor = connectorColor ?? colors.sky;
  const wrong = wrongColor ?? colors.coral;
  const dotted = connectorStyle === "dotted";

  // Column item centers. Each column is vertically centered about local y=0; the
  // two columns sit at ∓columnGap/2. Endpoints for the connectors live on the
  // INNER edge (toward the gutter) so a line touches the card, never pierces it.
  const colX = (side: "left" | "right") =>
    side === "left" ? -columnGap / 2 : columnGap / 2;
  const itemY = (count: number, i: number) => (i - (count - 1) / 2) * itemGap;
  const leftCenter = (i: number) => ({ x: colX("left"), y: itemY(left.length, i) });
  const rightCenter = (i: number) => ({
    x: colX("right"),
    y: itemY(right.length, i),
  });
  // Celebration sits in a clear band BELOW the taller column, so the sparkle +
  // reward token never overlap the cards or crossing connectors.
  const tallest = Math.max(left.length, right.length, 1);
  const celebrateY = itemY(tallest, tallest - 1) + itemRadius + 92;

  // Connector endpoint = item center nudged toward the gutter by itemRadius.
  const leftPort = (i: number) => ({
    x: leftCenter(i).x + itemRadius,
    y: leftCenter(i).y,
  });
  const rightPort = (i: number) => ({
    x: rightCenter(i).x - itemRadius,
    y: rightCenter(i).y,
  });

  // Index of the pair whose window is currently open (−1 before the first).
  const openedPair = Math.floor(local / step);
  const allLinked = openedPair >= pairs.length - 1 && local >= 0
    ? // the last pair's correct connector has finished drawing
      local - (pairs.length - 1) * step >= D * DRAW_FRACTION
    : false;

  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Left column — caller nodes, entering with a settle PopIn, top→bottom. */}
      {left.map((node, i) => {
        const c = leftCenter(i);
        return (
          <PopIn
            key={`l-${i}`}
            delay={atFrame - 18 + i * 4}
            motion="settle"
            originX={c.x}
            originY={c.y}
          >
            <g transform={`translate(${c.x} ${c.y})`}>{node}</g>
          </PopIn>
        );
      })}

      {/* Right column — same entrance, mirrored side. */}
      {right.map((node, i) => {
        const c = rightCenter(i);
        return (
          <PopIn
            key={`r-${i}`}
            delay={atFrame - 18 + i * 4}
            motion="settle"
            originX={c.x}
            originY={c.y}
          >
            <g transform={`translate(${c.x} ${c.y})`}>{node}</g>
          </PopIn>
        );
      })}

      {/* One connector per pair, drawn IN ORDER. Each pair's progress is derived
          BY INDEX from the local frame — never a literal. */}
      {pairs.map((pair, i) => {
        const into = local - i * step; // frames into THIS pair's window
        if (into < 0) {
          return null; // pair hasn't begun
        }
        const a = leftPort(pair.left);
        const b = rightPort(pair.right);

        // --- Quiz wrong attempt: a connector to the WRONG target that grows,
        // snaps red, then retracts, consuming the front of the window. Only when
        // mode='quiz' and a distinct wrongRight is given. ---------------------
        const hasWrong =
          mode === "quiz" &&
          pair.wrongRight !== undefined &&
          pair.wrongRight !== pair.right &&
          pair.wrongRight >= 0 &&
          pair.wrongRight < right.length;

        // The correct connector starts AFTER the wrong attempt clears (quiz) or
        // at the window start (demonstrate / no wrong).
        const correctStart = hasWrong ? D * WRONG_RETRACT : 0;
        const correctProgress = interpolate(
          into,
          [correctStart, correctStart + (D * DRAW_FRACTION - correctStart)],
          [0, 1],
          { ...CLAMP, easing: EASE.outCubic },
        );

        // Wrong-attempt local progress: grow 0→1, hold at 1, retract 1→0.
        let wrongProgress = 0;
        let wrongVisible = false;
        if (hasWrong) {
          const wb = rightPort(pair.wrongRight as number);
          wrongVisible = into < D * WRONG_RETRACT;
          if (into < D * WRONG_GROW) {
            wrongProgress = interpolate(into, [0, D * WRONG_GROW], [0, 1], {
              ...CLAMP,
              easing: EASE.outCubic,
            });
          } else if (into < D * WRONG_HOLD) {
            wrongProgress = 1;
          } else {
            wrongProgress = interpolate(
              into,
              [D * WRONG_HOLD, D * WRONG_RETRACT],
              [1, 0],
              { ...CLAMP, easing: EASE.outCubic },
            );
          }
          // The wrong dot reads red the whole time it is up (it never completes
          // green): PairConnector turns the end dot green only at progress>=1,
          // so we cap the wrong progress just under 1 during its red hold and
          // recolor the line via `color`. Snap dots stay; the end dot stays
          // white→red via the line color cue.
          if (wrongVisible) {
            return (
              <g key={`pair-${i}`}>
                <PairConnector
                  color={wrong}
                  dotted={dotted}
                  progress={Math.min(0.999, wrongProgress)}
                  snap
                  strokeWidth={connectorStrokeWidth}
                  x1={a.x}
                  x2={wb.x}
                  y1={a.y}
                  y2={wb.y}
                />
              </g>
            );
          }
        }

        // The correct connector. Its right endpoint dot snaps GREEN at
        // progress>=1 (PairConnector's built-in completion cue).
        const reached = correctProgress >= 1 - 1e-3;
        return (
          <g key={`pair-${i}`}>
            <PairConnector
              color={lineColor}
              dotted={dotted}
              progress={correctProgress}
              snap
              strokeWidth={connectorStrokeWidth}
              x1={a.x}
              x2={b.x}
              y1={a.y}
              y2={b.y}
            />
            {/* Pointer tracing the active link toward its right endpoint. */}
            {showPointer && !reached && correctProgress > 0 ? (
              <PointerHandArrow
                direction="right"
                progress={Math.min(1, correctProgress + 0.3)}
                size={70}
                variant="hand"
                x={a.x + (b.x - a.x) * correctProgress}
                y={a.y + (b.y - a.y) * correctProgress + itemRadius * 0.5}
              />
            ) : null}
          </g>
        );
      })}

      {/* All-matched celebration — a SparkleBurst + collected reward token at the
          board center, fired the moment the last pair's correct line completes. */}
      {celebrateOnComplete && allLinked ? (
        <g>
          <SparkleBurst
            durationInFrames={Math.round(D * 0.9)}
            radius={Math.max(120, columnGap * 0.24)}
            startFrame={atFrame + (pairs.length - 1) * step + Math.round(D * DRAW_FRACTION)}
            x={0}
            y={celebrateY}
          />
          <RewardProgressToken
            collected
            label={celebrateLabel}
            size={92}
            x={0}
            y={celebrateY}
          />
        </g>
      ) : null}
    </g>
  );
};
