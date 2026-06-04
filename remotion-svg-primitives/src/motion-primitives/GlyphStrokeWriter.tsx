import { interpolate, useCurrentFrame } from "remotion";
import {
  AnimatedStrokePath,
  StrokeGuideCell,
  type StrokeGuideCellProps,
  type StrokeGuideFocusZone,
  type StrokeGuideGrid,
  type ThemeColor,
} from "../shape-primitives";
import { colors } from "../theme";
import { EASE } from "./curves";
import {
  GLYPH_BOX,
  type GlyphPoint,
  type GlyphStroke,
} from "./glyphStrokes";

export type GlyphStrokeWriterProps = {
  /**
   * The ORDERED stroke paths (笔顺), each in the normalized 0..100 box (see
   * `glyphStrokes.ts` → GLYPH_STROKES). The caller looks these up from the
   * shared GLYPH_STROKES data keyed by the glyph char — the writer bakes no
   * glyph. Strokes draw on IN ORDER: stroke k only begins after stroke k-1
   * finishes (+ gap).
   */
  strokes: GlyphStroke[];
  /**
   * Master frame at which the FIRST stroke begins drawing. The caller passes
   * `cues[id].startFrame + offset` — NEVER a literal. Every later stroke is
   * sequenced off this by index.
   */
  atFrame: number;
  /** Frames each stroke takes to draw. Default 26. */
  perStrokeDurationFrames?: number;
  /** Pause between strokes (after k finishes, before k+1 starts). Default 8. */
  interStrokeGapFrames?: number;
  /** Cell side length (the glyph scales to fit). Default 220. */
  size?: number;
  /** Writing-cell grid backdrop, passed through to StrokeGuideCell. */
  grid?: StrokeGuideGrid;
  /** Optional highlighted focus zone, passed through to StrokeGuideCell. */
  focusZone?: StrokeGuideFocusZone;
  /** Show the 起笔/收笔 dot markers (default true). */
  showStartDots?: boolean;
  /** Pen stroke color. Default coral. */
  stroke?: ThemeColor;
  /** Stroke thickness in CELL units (scaled with size). Default 16. */
  strokeWidth?: number;
  /** Show the moving pen-tip cursor on the active stroke (default true). */
  cursor?: boolean;
  /** Placement of the whole writer (cell top-left). */
  x?: number;
  y?: number;
  /** Pass-through group props (className/opacity/transform/aria). */
  groupProps?: Omit<StrokeGuideCellProps, "focusZone" | "grid" | "height" | "width" | "x" | "y">;
};

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scale a normalized 0..100 box point to cell coords.
const toCell = (p: GlyphPoint, size: number): GlyphPoint => ({
  x: (p.x / GLYPH_BOX) * size,
  y: (p.y / GLYPH_BOX) * size,
});

// Scale a normalized 0..100 path string to cell coords. The scale is UNIFORM
// (size/100 on both axes), so every numeric token rescales identically — no
// x/y bookkeeping needed. The SVG command letters (M/L/C/Q/Z) are left intact.
// The authored data uses only those absolute commands with explicit x,y pairs.
const scalePath = (d: string, size: number): string =>
  d.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (token) =>
    `${Number(((Number(token) / GLYPH_BOX) * size).toFixed(3))}`,
  );

/**
 * GlyphStrokeWriter — a self-contained, frame-driven per-glyph stroke-order
 * writer. It traces a numeral (or comparison symbol, or any future glyph)
 * INSIDE a writing cell (田字格/米字格), stroke by stroke, in the correct 笔顺,
 * with marked 起笔/收笔 dots and a moving pen cursor.
 *
 * COMPOSES registered pieces: `StrokeGuideCell` (the grid + focus zone backdrop)
 * + one `AnimatedStrokePath` per stroke (ghost-under guide + pen cursor +
 * progress draw-on) sequenced by index + small 起笔/收笔 dot markers. Stroke k
 * begins only after stroke k-1 finishes (+ `interStrokeGapFrames`); each stroke
 * gets its own ghost, draw-on, and cursor, and its START dot pulses just before
 * the stroke begins so the eye is led to the 起笔.
 *
 * LESSON-AGNOSTIC + prop-driven: it bakes NO glyph. The caller passes the
 * ordered `strokes` (from the shared GLYPH_STROKES lookup keyed by the glyph
 * char) — so the same component writes 1/2/3/4/5, =/>/<, or any glyph whose
 * stroke data exists. ZERO frame literals (all timing derives from `atFrame` +
 * index), ZERO raw motion literals (the start-dot pulse uses EASE.overshoot).
 *
 * The hardest test frame this targets is the numeral '2' mid-second-stroke (the
 * bottom horizontal sweeping right while the top arc sits finished) — the exact
 * 弧度变形/写反 misconception. The GLYPH_STROKES data fixes the arc direction;
 * this component animates it so the direction is unmistakable.
 */
export const GlyphStrokeWriter: React.FC<GlyphStrokeWriterProps> = ({
  strokes,
  atFrame,
  perStrokeDurationFrames = 26,
  interStrokeGapFrames = 8,
  size = 220,
  grid = "tian",
  focusZone,
  showStartDots = true,
  stroke = colors.coral,
  strokeWidth = 16,
  cursor = true,
  x = 0,
  y = 0,
  groupProps,
}) => {
  const frame = useCurrentFrame();
  const step = perStrokeDurationFrames + interStrokeGapFrames;
  const dotR = Math.max(4, (strokeWidth / 220) * size * 0.42);

  return (
    <g transform={x !== 0 || y !== 0 ? `translate(${x} ${y})` : undefined}>
      <StrokeGuideCell
        {...groupProps}
        focusZone={focusZone}
        grid={grid}
        height={size}
        width={size}
      />
      {strokes.map((s, index) => {
        const startFrame = atFrame + index * step;
        // Local progress of THIS stroke (0 before it starts, 1 once drawn).
        const progress = interpolate(
          frame,
          [startFrame, startFrame + perStrokeDurationFrames],
          [0, 1],
          CLAMP,
        );
        // The whole glyph is rendered at cell scale; ghost shows from the start
        // so the child sees where this stroke is headed.
        const d = scalePath(s.d, size);
        const startDot = s.startDot ? toCell(s.startDot, size) : undefined;
        const endDot = s.endDot ? toCell(s.endDot, size) : undefined;

        // The 起笔 dot PULSES in the ~6 frames before its stroke begins, then
        // settles — leading the eye to where the pen lands. EASE.overshoot
        // gives the little anticipation pop (no raw motion literal).
        const pulseT = interpolate(
          frame,
          [startFrame - 6, startFrame],
          [0, 1],
          { ...CLAMP, easing: EASE.overshoot },
        );
        const consumed = progress > 0;
        const pulseScale = consumed ? 1 : 1 + 0.5 * pulseT;
        const dotVisible = frame >= startFrame - 6;

        return (
          <g key={index}>
            <AnimatedStrokePath
              cursor={
                cursor && progress > 0 && progress < 1
                  ? { color: stroke }
                  : false
              }
              d={d}
              ghost
              progress={progress}
              stroke={stroke}
              strokeWidth={(strokeWidth / 220) * size}
            />
            {showStartDots && startDot && dotVisible ? (
              <circle
                cx={startDot.x}
                cy={startDot.y}
                fill={consumed ? colors.mint : colors.sunshine}
                opacity={consumed ? 0.9 : pulseT}
                r={dotR * pulseScale}
                stroke={colors.textNavy}
                strokeWidth={2}
              />
            ) : null}
            {showStartDots && endDot && progress >= 1 ? (
              <circle
                cx={endDot.x}
                cy={endDot.y}
                fill={colors.coral}
                opacity={0.9}
                r={dotR * 0.82}
                stroke={colors.textNavy}
                strokeWidth={2}
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
