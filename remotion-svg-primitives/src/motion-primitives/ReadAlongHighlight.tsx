import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";
import { PopIn } from "./PopIn";
import { PulseCircle } from "./PulseCircle";
import { EASE } from "./curves";

export type ReadAlongCursor = "ball" | "underline" | "box" | "none";

export type ReadAlongHighlightProps = {
  /**
   * Rows of caller-supplied items, each inner array = ONE line of glyphs /
   * letters / words. The highlight sweeps item-by-item, line-by-line, in reading
   * order (line 0 left→right, then line 1, …). A single long row (the ABC song)
   * is `[[A, B, C, …]]`; a poem is several short lines (`[[云, 对, 雨], [雪, 对,
   * 风]]`). NEVER baked — every item is a localized ReactNode (a `<tspan>`, a
   * `<HanziCard>`, an `<IconAsset>`); the component only positions + highlights
   * them, it bakes no topic, value, or English/Chinese string.
   */
  lines: ReactNode[][];
  /**
   * FLAT per-item duration WEIGHTS in reading order across ALL lines (so a held
   * syllable / fermata gets a bigger beat). Length should equal the total item
   * count; missing/short entries default to 1. The component converts beats →
   * cumulative active windows scaled to fill `total = sum(beats) *
   * perBeatDurationFrames` — NO per-item frame literals. Default: every item = 1.
   */
  beats?: number[];
  /**
   * Local (cue-relative) frame. The component derives WHICH item is active, the
   * cursor position, and the active glow from `atFrame` + the cumulative beat
   * schedule — ZERO frame literals. The composer passes `cues[id].startFrame +
   * offset`; this component never reads a master-timeline literal.
   */
  atFrame: number;
  /**
   * Frames that one beat-weight of 1 maps to. The sweep's total length is
   * `sum(beats) * perBeatDurationFrames`. Default 16.
   */
  perBeatDurationFrames?: number;
  /**
   * The rhythm cursor that travels item→item:
   *  • `ball`      — a bouncing ball that ARCS up-and-over from one item to the
   *    next (the sing-along bouncing-ball, EASE-eased hop + parabolic arc).
   *  • `underline` — a sliding underline bar beneath the current item.
   *  • `box`       — a sliding rounded box framing the current item.
   *  • `none`      — no cursor (highlight only).
   * Default `ball`.
   */
  cursor?: ReadAlongCursor;
  /**
   * Color of the active-item highlight (the glow ring / fill swell), the cursor,
   * and the active glyph tint. Default coral.
   */
  highlightColor?: string;
  /**
   * Color an item keeps AFTER it has been read (the "already sung" trail). Only
   * used when `dimPast` is false (past items stay lit in this color). Default =
   * a calm settled tint (sky).
   */
  highlightColorAlready?: string;
  /**
   * When true (default), already-read items DIM back to the resting ink so only
   * the current item is lit — the eye tracks one moving spot (read-with-rhythm).
   * When false, past items STAY lit in `highlightColorAlready` — a filling-up
   * "we sang this far" trail (sing-along progress).
   */
  dimPast?: boolean;
  /** How much the current item swells (scale). Default 1.18; 1 disables. */
  activeScale?: number;
  /** Horizontal gap between adjacent item CENTERS within a line (px). Default 132. */
  itemGap?: number;
  /** Vertical gap between adjacent line CENTERS (px). Default 150. */
  lineGap?: number;
  /** Resting ink color of not-yet / no-longer active items. Default textNavy. */
  inkColor?: string;
  /**
   * Per-item footprint radius — sizes the glow ring, the cursor, and the row's
   * cell spacing floor. Match your item's visual radius. Default 46.
   */
  itemRadius?: number;
  /** Center of the whole block in the parent coordinate system. */
  x?: number;
  y?: number;
  /** Extra transform applied to the whole block (after x/y translate). */
  transform?: string;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * ReadAlongHighlight — a moving highlight (+ optional bouncing cursor) that
 * sweeps each item of a text IN TIME, marking rhythm for read-along / recite /
 * sing-along. The active item glows + swells while a cursor (a bouncing ball
 * that arcs item→item, a sliding underline, or a box) travels with it;
 * already-read items either dim back (one moving spot) or stay lit (a filling
 * trail). WHICH item is active at any frame is `cumulativeBeatWindow(index)`
 * derived from the per-item `beats` weights — ZERO frame literals.
 *
 * Lesson-agnostic & prop-driven — it bakes NO topic, NO English/Chinese string,
 * NO glyph: every item is a caller ReactNode in `lines`, the per-item rhythm is
 * the caller's `beats`, and pacing is `atFrame` + `perBeatDurationFrames`. The
 * SAME component drives 统编版 Chinese 朗读背诵《对韵歌》 (short hanzi lines, the
 * highlight reading WITH rhythm so 机械重复 becomes a song), AND the 人教版PEP
 * English ABC / 字母歌 (one long row of 26 letters, the bouncing ball arcing
 * across them) — the caller only varies props.
 *
 * Composes registered capabilities only — `<PopIn>` for each line's entrance,
 * `<PulseCircle>` for the active-item glow ripple — plus a derived cursor (an
 * EASE.outCubic hop + parabolic up-down arc for the ball, an interpolated slide
 * for the underline/box). ZERO frame literals (public API takes `atFrame` +
 * `perBeatDurationFrames`; the active window per item is the cumulative beat
 * schedule), ZERO raw motion literals (named `EASE.*`).
 */
export const ReadAlongHighlight: React.FC<ReadAlongHighlightProps> = ({
  lines,
  beats,
  atFrame,
  perBeatDurationFrames = 16,
  cursor = "ball",
  highlightColor,
  highlightColorAlready,
  dimPast = true,
  activeScale = 1.18,
  itemGap = 132,
  lineGap = 150,
  inkColor,
  itemRadius = 46,
  x = 0,
  y = 0,
  transform,
}) => {
  const frame = useCurrentFrame();
  const local = frame - atFrame;
  const D = Math.max(1, perBeatDurationFrames);

  const accent = highlightColor ?? colors.coral;
  const already = highlightColorAlready ?? colors.sky;
  const ink = inkColor ?? colors.textNavy;

  // ---- Flatten lines → a reading-order index, remembering (line, col). -------
  // The sweep is one cumulative timeline over the flat order; geometry comes
  // back from the (line, col) coordinates. Array order = caller scene content.
  const flat: { line: number; col: number; node: ReactNode; lineLen: number }[] =
    [];
  lines.forEach((row, li) => {
    row.forEach((node, ci) => {
      flat.push({ line: li, col: ci, node, lineLen: row.length });
    });
  });
  const total = flat.length;
  if (total === 0) {
    return null;
  }

  // ---- beats → cumulative active windows (ZERO per-item frame literals). -----
  // weight[i] (default 1) scaled by D gives item i's window length; the start of
  // item i is the running sum before it. cumulativeBeatWindow(i) = [start,end).
  const weights = flat.map((_, i) => {
    const w = beats?.[i];
    return w !== undefined && Number.isFinite(w) && w > 0 ? w : 1;
  });
  const starts: number[] = [];
  let acc = 0;
  for (let i = 0; i < total; i += 1) {
    starts.push(acc);
    acc += weights[i] * D;
  }
  const cumulativeBeatWindow = (i: number) => {
    const start = starts[i];
    return { start, end: start + weights[i] * D };
  };

  // The active item at `local`: the last item whose window has opened. Before
  // the sweep begins nothing is active (-1); after it ends the last item holds.
  const activeIndex = (() => {
    if (local < 0) {
      return -1;
    }
    for (let i = total - 1; i >= 0; i -= 1) {
      if (local >= starts[i]) {
        return i;
      }
    }
    return -1;
  })();

  // ---- Geometry: flat index ↔ local (x, y) center. ---------------------------
  // Each line is centered horizontally on its own item count; lines stack
  // vertically centered on the block. Cell width respects itemRadius so even a
  // tight itemGap never overlaps the glow rings.
  const nLines = lines.length;
  const cellW = Math.max(itemGap, itemRadius * 2 + 8);
  const colX = (col: number, lineLen: number) =>
    (col - (lineLen - 1) / 2) * cellW;
  const lineY = (li: number) => (li - (nLines - 1) / 2) * lineGap;
  const itemCenter = (i: number) => {
    const f = flat[i];
    return { x: colX(f.col, f.lineLen), y: lineY(f.line) };
  };

  // ---- Cursor position: arc from the PREVIOUS item to the active one. --------
  // Within the active item's window, the cursor travels prevCenter→activeCenter
  // over the first ~62% (EASE.outCubic), then rests on the item. The ball adds a
  // parabolic up-hop; underline/box just slide. No motion literals — EASE.* only.
  const cursorGeom = (() => {
    if (activeIndex < 0) {
      return null;
    }
    const cur = itemCenter(activeIndex);
    const prev = activeIndex > 0 ? itemCenter(activeIndex - 1) : cur;
    const { start, end } = cumulativeBeatWindow(activeIndex);
    const win = Math.max(1, end - start);
    // Hop fraction 0→1 across the first part of the window, eased; then 1 (rest).
    const hop = interpolate(local, [start, start + win * 0.62], [0, 1], {
      ...CLAMP,
      easing: EASE.outCubic,
    });
    const px = prev.x + (cur.x - prev.x) * hop;
    const py = prev.y + (cur.y - prev.y) * hop;
    // Parabolic up-hop, peaking at mid-flight (only meaningful for the ball).
    const arcLift = 4 * hop * (1 - hop); // 0 at ends, 1 at the middle
    const hopHeight = itemRadius * 1.15;
    return { px, py, cur, hop, lift: arcLift * hopHeight };
  })();

  // ---- Per-item visual state ------------------------------------------------
  // active = glowing + swelling; past = dimmed (dimPast) or held lit; future =
  // resting ink. Tint + scale + opacity derived purely from activeIndex.
  const itemState = (i: number) => {
    if (i === activeIndex) {
      // Settle the swell over the first part of the item's window.
      const { start, end } = cumulativeBeatWindow(i);
      const win = Math.max(1, end - start);
      const settle = interpolate(local, [start, start + win * 0.5], [0, 1], {
        ...CLAMP,
        easing: EASE.outCubic,
      });
      const scale = 1 + (activeScale - 1) * settle;
      return { tint: accent, scale, opacity: 1 };
    }
    if (i < activeIndex) {
      return dimPast
        ? { tint: ink, scale: 1, opacity: 0.42 }
        : { tint: already, scale: 1, opacity: 1 };
    }
    // Future — not yet reached; resting, slightly faint so the lit item leads.
    return { tint: ink, scale: 1, opacity: 0.72 };
  };

  return (
    <g transform={`translate(${x} ${y})${transform ? ` ${transform}` : ""}`}>
      {/* Lines enter as wholes (each line pops in once, in reading order) so a
          poem builds line-by-line rather than all at once. */}
      {lines.map((row, li) => (
        <PopIn
          key={`line-${li}`}
          delay={atFrame + li * Math.round(D * 0.5)}
          motion="settle"
          originX={0}
          originY={lineY(li)}
        >
          <g>
            {row.map((_, ci) => {
              // Recover this item's flat index from (line, col).
              const fi = flat.findIndex((f) => f.line === li && f.col === ci);
              const { x: ix, y: iy } = itemCenter(fi);
              const st = itemState(fi);
              const isActive = fi === activeIndex;
              return (
                <g key={`it-${li}-${ci}`} transform={`translate(${ix} ${iy})`}>
                  {/* Active glow ring — a self-contained ripple at the lit item. */}
                  {isActive ? (
                    <PulseCircle
                      color={accent}
                      cx={0}
                      cy={0}
                      durationInFrames={Math.max(
                        12,
                        Math.round(
                          (cumulativeBeatWindow(fi).end -
                            cumulativeBeatWindow(fi).start) *
                            0.85,
                        ),
                      )}
                      radius={itemRadius}
                      repeatCount={1}
                      spread={18}
                      startFrame={atFrame + cumulativeBeatWindow(fi).start}
                    />
                  ) : null}
                  {/* The caller item, tinted + swelled by state. We wrap in a
                      group that carries the active tint via currentColor so a
                      caller <tspan fill="currentColor"> rides the highlight; an
                      item with its own baked fill is untouched. */}
                  <g
                    color={st.tint}
                    opacity={st.opacity}
                    transform={`scale(${st.scale})`}
                  >
                    {flat[fi].node}
                  </g>
                </g>
              );
            })}
          </g>
        </PopIn>
      ))}

      {/* The rhythm cursor — drawn last so it sits over the items. */}
      {cursorGeom && cursor !== "none" ? (
        <Cursor
          accent={accent}
          geom={cursorGeom}
          itemRadius={itemRadius}
          kind={cursor}
        />
      ) : null}
    </g>
  );
};

type CursorGeom = {
  px: number;
  py: number;
  cur: { x: number; y: number };
  hop: number;
  lift: number;
};

type CursorProps = {
  kind: Exclude<ReadAlongCursor, "none">;
  geom: CursorGeom;
  accent: string;
  itemRadius: number;
};

/**
 * Cursor — the rhythm cursor that travels with the active item. `ball` is a
 * bouncing dot that arcs up-and-over above the items (the sing-along bouncing
 * ball); `underline` is a bar that slides beneath the current item; `box` is a
 * rounded frame that slides around it. Internal to ReadAlongHighlight (one
 * concern: mark WHERE the rhythm is right now); bakes no string. Position +
 * arc-lift come pre-derived in `geom` from the cumulative beat schedule.
 */
const Cursor: React.FC<CursorProps> = ({ kind, geom, accent, itemRadius }) => {
  if (kind === "ball") {
    // The ball rides ABOVE the items and dips down to "touch" each one at rest;
    // mid-flight it lifts (geom.lift) into the up-and-over bounce.
    const restY = geom.cur.y - itemRadius - 18;
    const ballY = geom.py - itemRadius - 18 - geom.lift;
    // Squash a touch on landing (hop near 1) for a bit of bounce life.
    const land = Math.max(0, geom.hop - 0.85) / 0.15; // 0→1 over the last 15%
    const squashY = 1 - 0.18 * land;
    const squashX = 1 + 0.18 * land;
    return (
      <g transform={`translate(${geom.px} ${ballY})`}>
        {/* faint contact shadow at the rest line */}
        <ellipse
          cx={0}
          cy={restY - ballY + 2}
          fill={accent}
          opacity={0.18}
          rx={14 * squashX}
          ry={4}
        />
        <circle
          cx={0}
          cy={0}
          fill={accent}
          r={14}
          transform={`scale(${squashX} ${squashY})`}
        />
        <circle cx={-4} cy={-4} fill={colors.white} opacity={0.55} r={4} />
      </g>
    );
  }
  if (kind === "underline") {
    return (
      <g transform={`translate(${geom.px} ${geom.cur.y})`}>
        <rect
          fill={accent}
          height={8}
          rx={4}
          width={itemRadius * 2 + 12}
          x={-(itemRadius + 6)}
          y={itemRadius + 6}
        />
      </g>
    );
  }
  // box
  return (
    <g transform={`translate(${geom.px} ${geom.cur.y})`}>
      <rect
        fill="none"
        height={itemRadius * 2 + 20}
        rx={18}
        stroke={accent}
        strokeWidth={6}
        width={itemRadius * 2 + 20}
        x={-(itemRadius + 10)}
        y={-(itemRadius + 10)}
      />
    </g>
  );
};
