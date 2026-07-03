import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  FenHeDiagram,
  PartWholeBrace,
  StepTally,
  type ThemeColor,
} from "../shape-primitives";
import { colors } from "../theme";
import { fontFamily } from "../shape-primitives/shared";
import { EASE } from "./curves";
import { PopIn } from "./PopIn";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type PartWholeComposerMode = "enumerate" | "merge" | "split";

export type PartWholeComposerProps = {
  /**
   * The total number of concrete objects, N. The whole the child is composing
   * and decomposing. 2..~9 reads cleanly; the enumerate walk visits N-1 splits.
   */
  count: number;
  /**
   * Render ONE object given its array index (0..count-1) and the part it
   * currently belongs to (`'left'` | `'right'` for the two clusters, `'whole'`
   * before/after a split when it reads as one group). The caller owns the
   * object KIND and the two-color split (e.g. a CountableObject with
   * leftColor/rightColor by `part`) — the component bakes NO object. It only
   * positions `count` of them and animates the cluster move / migration.
   */
  renderItem: (i: number, part: "left" | "right" | "whole") => ReactNode;
  /**
   * Which 分与合 beat:
   *  • `'split'`  — a single whole group SEPARATES into left(k) + right(N-k)
   *    clusters moving apart (分). One move, paced by `perStepDurationFrames`.
   *  • `'merge'`  — two clusters left(k) + right(N-k) SLIDE TOGETHER into one
   *    whole (合并 / addition); the diagram cues the total N. One move.
   *  • `'enumerate'` — walk ALL ordered decompositions 1&(N-1), 2&(N-2), …,
   *    (N-1)&1. One item MIGRATES from the right cluster to the left per step,
   *    showing 不重不漏 and that swapped pairs (e.g. 2&3 vs 3&2) are DISTINCT.
   *    `partition` is ignored — k is derived per step from the step index.
   */
  mode: PartWholeComposerMode;
  /**
   * The split point k (left part gets `k`, right gets `count - k`) for `split`
   * and `merge`. Ignored for `enumerate` (k = stepIndex + 1, derived). Defaults
   * to `floor(count / 2)`.
   */
  partition?: { left: number };
  /**
   * Local (cue-relative) frame. The component derives EVERY step's progress by
   * index from `atFrame` + `perStepDurationFrames` (+ `interStepGapFrames`) —
   * ZERO frame literals. The composer passes `cues[id].startFrame + offset`;
   * this component never reads a master-timeline literal.
   */
  atFrame: number;
  /**
   * Frames for one move. `enumerate`: one step per decomposition (the migration
   * glide). `split` / `merge`: the single separate / combine move. Default 24.
   */
  perStepDurationFrames?: number;
  /**
   * Hold frames between enumerate steps (the pair rests so 不重不漏 is legible
   * before the next item migrates). Ignored for split/merge. Default 8.
   */
  interStepGapFrames?: number;
  /**
   * Overlay a {@link FenHeDiagram} (分合式) whose part numbers UPDATE with the
   * concrete move — the abstract bond stays synced to the objects. The whole is
   * `count`; parts are the live (k, count-k). Default true.
   */
  showDiagram?: boolean;
  /**
   * Bracket the whole row (split start / merge end) with a {@link PartWholeBrace}
   * carrying `wholeLabel`, and each cluster with its own brace. Default false.
   */
  showBrace?: boolean;
  /** Localized label node under the whole brace (e.g. the caller's '5' or '一共5'). */
  wholeLabel?: ReactNode;
  /** Surface a running {@link StepTally} of the enumerate walk as a small
   *  count-up of dots — which decomposition # we are on (1..count-1). Distinct
   *  from the part values (it counts SPLITS SEEN, not a part). Ignored for
   *  split/merge. Default false. */
  showTally?: boolean;
  /** Diagram width (local units), passed to FenHeDiagram. Default 220. */
  diagramWidth?: number;
  /** Per-object footprint radius — sets item spacing and the gap between
   *  clusters so objects never overlap. Default 52. */
  itemRadius?: number;
  /** Extra gap between the two clusters when separated, beyond `itemRadius`
   *  spacing (local units). Default 120. */
  clusterGap?: number;
  /** Ink color of the diagram lines + tally. Default textNavy. */
  inkColor?: ThemeColor;
  /** Center of the whole component in the parent coordinate system. */
  x?: number;
  y?: number;
};

// Vertical bands (local units), measured from the object row at y=0. The
// diagram sits ABOVE the objects (the abstract bond over the concrete heap);
// the whole brace + label sit BELOW. The enumerate tally rides the TOP-LEFT
// corner of the whole row, clear of the centered diagram. Disjoint bands keep
// the kids-eye zones from colliding.
const DIAGRAM_GAP = 250; // above the object row (abstract 分合式)
const BRACE_GAP = 56; // below the object row (whole/part brackets)
const TALLY_GAP = 116; // above the object row, near the row's left edge

/**
 * PartWholeComposer — the concrete-object 分与合 (decompose / compose) beat as
 * ONE self-contained, registered teaching unit.
 *
 * It owns the choreography that more than one lesson wants: N caller-rendered
 * objects laid out as a whole, SPLIT into two clusters, MERGED back together
 * (addition 合并), or walked through EVERY ordered decomposition (the 不重不漏
 * enumeration that fixes 列举分法遗漏中间项 / 交换顺序后认为是同一种分法 /
 * 操作跳跃无序). The abstract 分合式 numbers stay synced to the concrete move.
 *
 * It composes registered capabilities into a single frame-driven move:
 *   • the caller's `renderItem` objects (the component never bakes one),
 *   • {@link FenHeDiagram} for the abstract bond — its part numbers are DRIVEN
 *     by the live (k, count-k) of the current step (reuses
 *     {@link getFenHeDiagramAnchors}; no hand-drawn numerals),
 *   • {@link PartWholeBrace} for the optional whole / part brackets,
 *   • {@link StepTally} for the optional enumerate-progress count,
 *   • {@link PopIn} for the object entrance,
 * all with named `EASE.*` motion. The migrating item glides along an eased lerp
 * from its right-cluster slot to its new left-cluster slot.
 *
 * Lesson-agnostic + prop-driven: the object kind, the count, the colors, the
 * partition, and every label are ALL caller-supplied — it bakes no topic,
 * value, or Chinese string. ZERO frame literals (its public API takes `atFrame`
 * + per-step durations; each step's progress is derived BY INDEX), ZERO raw
 * motion literals (the only curves are named `EASE.*`).
 */
export const PartWholeComposer: React.FC<PartWholeComposerProps> = ({
  count,
  renderItem,
  mode,
  partition,
  atFrame,
  perStepDurationFrames = 24,
  interStepGapFrames = 8,
  showDiagram = true,
  showBrace = false,
  wholeLabel,
  showTally = false,
  diagramWidth = 220,
  itemRadius = 52,
  clusterGap = 120,
  inkColor,
  x = 0,
  y = 0,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.round(count));
  const local = frame - atFrame;
  const D = Math.max(1, perStepDurationFrames);
  const ink = inkColor ?? colors.textNavy;

  if (n === 0) {
    return null;
  }

  // Per-object slot pitch — wide enough that two adjacent objects never touch.
  const pitch = itemRadius * 2 + 18;
  // Half-gap each cluster pulls away from the center line when separated.
  const separation = clusterGap / 2 + itemRadius;

  // The whole-row span (objects packed as ONE group, centered on x=0). Used as
  // the "joined" layout for split start / merge end.
  const wholeX = (i: number) => (i - (n - 1) / 2) * pitch;

  // Cluster layout: the left k objects pack to the LEFT of the center gap, the
  // right (n-k) pack to the RIGHT. Each cluster is centered within its own side
  // so a 1&(n-1) split still reads as two balanced groups, not one lonely dot.
  const leftClusterX = (slot: number, k: number) => {
    // slot 0..k-1, packed right-aligned against the gap then pushed left.
    const clusterWidth = (k - 1) * pitch;
    return -separation - clusterWidth + slot * pitch;
  };
  const rightClusterX = (slot: number) => {
    return separation + slot * pitch;
  };

  // ---- Derive the active partition k and the move progress p (0..1) ----------
  // EVERYTHING below is a pure function of the step INDEX — no frame literals.
  const stepCount = mode === "enumerate" ? Math.max(0, n - 1) : 1;
  const stepStride = D + Math.max(0, interStepGapFrames);

  // Which step we are in, and the eased progress THROUGH that step's move.
  const rawStep =
    stepStride > 0 ? Math.floor(Math.max(0, local) / stepStride) : 0;
  const stepIndex = Math.min(Math.max(0, rawStep), Math.max(0, stepCount - 1));
  const stepLocal = Math.max(0, local) - stepIndex * stepStride;
  const moveP = clamp01(
    interpolate(stepLocal, [0, D], [0, 1], { ...CLAMP, easing: EASE.inOutCubic }),
  );
  // Has the very first move started? (gates the diagram/brace reveal.)
  const started = local >= 0;
  const reveal = interpolate(local, [0, D * 0.5], [0, 1], CLAMP);

  // The active k.
  //  • enumerate: at step s the left part has (s+1) items — walk 1..n-1. During
  //    the MOVE, one item is migrating from right→left, so k transitions
  //    s_prevLeft → s_prevLeft+1 over moveP; the migrating item is rendered
  //    in flight (it belongs to NEITHER settled cluster mid-glide).
  //  • split: k is the caller partition; the move SEPARATES from whole.
  //  • merge: k is the caller partition; the move JOINS into whole.
  const defaultK = Math.floor(n / 2);
  const callerK = Math.min(
    Math.max(1, Math.round(partition?.left ?? defaultK)),
    Math.max(1, n - 1),
  );

  // Settled left-count BEFORE and AFTER the current enumerate step.
  const enumKBefore = stepIndex; // 0 before the walk's first item lands; 1,2,…
  const enumKAfter = stepIndex + 1; // 1,2,…,n-1
  // The item that migrates THIS step: it is the array item at array-index
  // (n-1) - stepIndex moving from the right cluster's first slot to the left
  // cluster's new last slot. (Walking from the RIGHT end inward each step so the
  // left cluster GROWS 1→n-1 left-to-right — 不重不漏, no item visited twice.)
  const migratingIndex = n - 1 - stepIndex;

  // ---- Per-object placement at the current frame ----------------------------
  // For every array index, compute its (x, part) at this frame. The migrating
  // item (enumerate) lerps between its old right slot and new left slot.
  type Placed = { ix: number; px: number; part: "left" | "right" | "whole" };

  const placed: Placed[] = [];

  if (mode === "enumerate") {
    // The left cluster GROWS from the array's RIGHT end inward, one item per
    // step, so no array index is ever visited twice (不重不漏). After step s the
    // left cluster holds the (enumKAfter) right-most indices {n-1, n-2, …}, laid
    // out left→right by landing order (earliest-migrated = leftmost slot).
    const leftSize = enumKAfter; // final left-cluster size THIS step
    // Indices already SETTLED in the left cluster (migrated before this step).
    const leftSettled: number[] = [];
    for (let s = 0; s < enumKBefore; s++) {
      leftSettled.push(n - 1 - s);
    }
    const leftOrder = [...leftSettled].reverse(); // slot 0 = first migrated
    for (let slot = 0; slot < leftSize; slot++) {
      const isMigrantSlot = slot === leftSize - 1;
      const ix = isMigrantSlot ? migratingIndex : leftOrder[slot];
      const landX = leftClusterX(slot, leftSize);
      if (isMigrantSlot) {
        // The migrating item glides from the right cluster's first slot (its old
        // home) to this landing slot. Mid-glide it belongs to NEITHER settled
        // cluster — its `part` flips at the halfway point so the caller's color
        // swaps as it crosses.
        const fromX = rightClusterX(0);
        const px = fromX + (landX - fromX) * moveP;
        const part: "left" | "right" = moveP > 0.5 ? "left" : "right";
        placed.push({ ix, px, part });
      } else {
        placed.push({ ix, px: landX, part: "left" });
      }
    }
    // Right cluster: indices that have NOT migrated, excluding the in-flight one.
    const rightIndices: number[] = [];
    for (let ix = 0; ix <= n - 1 - enumKAfter; ix++) {
      rightIndices.push(ix);
    }
    rightIndices.forEach((ix, slot) => {
      placed.push({ ix, px: rightClusterX(slot), part: "right" });
    });
  } else {
    // split / merge: a single move between WHOLE and the two clusters.
    // split: whole(p=0) → clusters(p=1). merge: clusters(p=0) → whole(p=1).
    const sepP = mode === "split" ? moveP : 1 - moveP;
    const k = callerK;
    for (let ix = 0; ix < n; ix++) {
      const inLeft = ix < k;
      const slot = inLeft ? ix : ix - k;
      const size = inLeft ? k : n - k;
      const joinedX = wholeX(ix);
      const apartX = inLeft
        ? leftClusterX(slot, size)
        : rightClusterX(slot);
      const px = joinedX + (apartX - joinedX) * sepP;
      const part: "left" | "right" | "whole" =
        sepP < 0.04 ? "whole" : inLeft ? "left" : "right";
      placed.push({ ix, px, part });
    }
  }

  // ---- Diagram (分合式) part numbers, synced to the live split ---------------
  // enumerate: parts are (enumKAfter, n-enumKAfter) — they tick with the walk.
  // split/merge: parts are the fixed (k, n-k); the whole is always n.
  const diagK = mode === "enumerate" ? enumKAfter : callerK;
  const diagParts: [number, number] = [diagK, n - diagK];
  // The diagram's diagonals draw on once the move passes the midpoint (the
  // numbers are "decided") for enumerate; for split they draw with the
  // separation, for merge they are present from the start (合并 → known total).
  const diagProgress =
    mode === "merge" ? reveal : mode === "split" ? moveP : clamp01(moveP);

  // ---- Brace geometry --------------------------------------------------------
  const wholeBraceWidth = (n - 1) * pitch + itemRadius * 2;
  const braceReveal = interpolate(local, [0, D * 0.8], [0, 1], {
    ...CLAMP,
    easing: EASE.enter,
  });

  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Abstract 分合式 — its part numbers tick with the concrete move. */}
      {showDiagram && started ? (
        <g transform={`translate(0 ${-DIAGRAM_GAP})`}>
          <FenHeDiagram
            diagramWidth={diagramWidth}
            lineColor={inkColor}
            numberColor={inkColor}
            parts={diagParts}
            progress={diagProgress}
            whole={n}
          />
        </g>
      ) : null}

      {/* Whole-row brace + label (split start / merge end). */}
      {showBrace ? (
        <g transform={`translate(${-wholeBraceWidth / 2} ${itemRadius + BRACE_GAP})`}>
          <PartWholeBrace
            direction="down"
            label={
              wholeLabel !== undefined ? (
                <tspan fill={ink} fontFamily={fontFamily} fontWeight={900}>
                  {wholeLabel}
                </tspan>
              ) : undefined
            }
            progress={braceReveal}
            width={wholeBraceWidth}
          />
        </g>
      ) : null}

      {/* The concrete objects — caller-rendered, positioned by the component. */}
      {placed.map(({ ix, px, part }) => (
        <g key={ix} transform={`translate(${px} 0)`}>
          {local < D * 0.4 && mode !== "enumerate" ? (
            <PopIn delay={Math.max(0, atFrame)} motion="settle">
              {renderItem(ix, part)}
            </PopIn>
          ) : (
            renderItem(ix, part)
          )}
        </g>
      ))}

      {/* Running tally of the enumerate walk — a row of dots counting the
          DECOMPOSITIONS SEEN so far (1..n-1). Dots (not a numeral) so it can
          never be misread as a part value. `maxSteps={n-1}` reserves the
          row's full width (the walk's true ceiling) from frame 0 — only the
          dots so far actually draw, filling in from the row's left edge, so
          the reserved span never resizes as more arrive. Rides the top-left
          corner of the row, clear of the centered diagram. */}
      {showTally && mode === "enumerate" && started ? (
        <g transform={`translate(${-wholeBraceWidth / 2 + itemRadius} ${-itemRadius - TALLY_GAP})`}>
          <StepTally
            dotColor={inkColor}
            maxSteps={Math.max(1, n - 1)}
            progress={reveal}
            size={28}
            steps={stepIndex + 1}
            variant="dots"
            x={0}
            y={0}
          />
        </g>
      ) : null}
    </g>
  );
};
