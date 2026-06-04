import { AbsoluteFill } from "remotion";
import { GlyphStrokeWriter, glyphStrokesFor } from "../motion-primitives";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// GlyphStrokeDataDemo — verification scenes for the EXTENDED GLYPH_STROKES data
// (基本笔画 + 统编版 G1 §1.1–1.5 汉字). These prove the SAME registered
// <GlyphStrokeWriter> writes the new glyphs in correct 笔顺 from the shared
// data — no new component. DEMO scenes, so explicit frame literals are allowed
// here (the zero-frame-literal law governs src/lessons/*LessonScene.tsx only).
//
// Three compositions, all driven by the same per-stroke timing so a single
// review frame is legible:
//   GlyphStrokeDataCharacters — the full §1.1–1.5 write-list, every cell drawn
//                               with the SAME atFrame so at a mid frame each
//                               glyph sits at the same stroke index → stroke
//                               ORDER is verifiable by which strokes are present.
//   GlyphStrokeDataBasics     — the seven 基本笔画, each a single-stroke glyph
//                               keyed by 笔画名 (横/竖/撇/捺/点/横折/弯钩).
//   GlyphStrokeDataHardest    — 火 alone, large, the 点撇撇捺 order case.
// ---------------------------------------------------------------------------

const PER_STROKE = 26;
const GAP = 8;

// Lay a list of glyph cells out on a centered grid, every cell sharing the same
// atFrame so a single review frame reads the same stroke index across the row.
// cellSize auto-fits the frame: derived from cols, gap and a side margin so the
// gallery never overflows 1280×720 regardless of glyph count.
const MARGIN = 48;

const Gallery = ({
  glyphs,
  grid,
  stroke,
  cols,
  gap,
  atFrame,
}: {
  glyphs: string[];
  grid: "tian" | "mi";
  stroke: string;
  cols: number;
  gap: number;
  atFrame: number;
}) => {
  const rows = Math.ceil(glyphs.length / cols);
  // Fit cells to BOTH axes so the grid never overflows the frame.
  const cellByWidth = (video.width - 2 * MARGIN - (cols - 1) * gap) / cols;
  const cellByHeight = (video.height - 2 * MARGIN - (rows - 1) * gap) / rows;
  const cellSize = Math.floor(Math.min(cellByWidth, cellByHeight));
  const totalW = cols * cellSize + (cols - 1) * gap;
  const totalH = rows * cellSize + (rows - 1) * gap;
  const startX = (video.width - totalW) / 2;
  const startY = (video.height - totalH) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        {glyphs.map((char, index) => {
          const data = glyphStrokesFor(char);
          const col = index % cols;
          const row = Math.floor(index / cols);

          return (
            <GlyphStrokeWriter
              atFrame={atFrame}
              grid={grid}
              interStrokeGapFrames={GAP}
              key={char}
              perStrokeDurationFrames={PER_STROKE}
              size={cellSize}
              stroke={stroke}
              strokes={data?.strokes ?? []}
              x={startX + col * (cellSize + gap)}
              y={startY + row * (cellSize + gap)}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// CHARACTERS: the full §1.1–1.5 write-list. 14 cells, 5 per row (3 rows). Same
// atFrame on every cell ⇒ at any review frame each glyph is at the SAME stroke
// index, so 笔顺 is checked by which strokes are drawn. The slowest glyph (虫,
// 6 strokes) finishes at atFrame + 6*(PER_STROKE+GAP) = 4 + 204 = 208.
export const GLYPH_DATA_CHARS_DURATION = 240;
const CHAR_GLYPHS = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "上",
  "下",
  "日",
  "田",
  "禾",
  "火",
  "云",
  "虫",
  "山",
];

export const GlyphStrokeDataCharacters = () => (
  <Gallery
    atFrame={4}
    cols={5}
    gap={28}
    glyphs={CHAR_GLYPHS}
    grid="tian"
    stroke={colors.coral}
  />
);

// BASIC STROKES: the seven 基本笔画, each a single-stroke glyph keyed by 笔画名.
export const GLYPH_DATA_BASICS_DURATION = 120;
const BASIC_STROKES = ["横", "竖", "撇", "捺", "点", "横折", "弯钩"];

export const GlyphStrokeDataBasics = () => (
  <Gallery
    atFrame={4}
    cols={4}
    gap={28}
    glyphs={BASIC_STROKES}
    grid="mi"
    stroke={colors.sky}
  />
);

// HARDEST: 火 alone, large — the 点、撇、撇、捺 order case (two top dots flanking
// the stem, then 先撇后捺 for the legs). A late frame shows all four drawn; a
// mid frame proves the dots precede the legs.
export const GLYPH_DATA_HARDEST_DURATION = 160;

export const GlyphStrokeDataHardest = () => {
  const data = glyphStrokesFor("火");
  const size = 420;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        <GlyphStrokeWriter
          atFrame={6}
          grid="tian"
          interStrokeGapFrames={GAP}
          perStrokeDurationFrames={PER_STROKE}
          size={size}
          strokes={data?.strokes ?? []}
          x={video.width / 2 - size / 2}
          y={video.height / 2 - size / 2}
        />
      </svg>
    </AbsoluteFill>
  );
};
