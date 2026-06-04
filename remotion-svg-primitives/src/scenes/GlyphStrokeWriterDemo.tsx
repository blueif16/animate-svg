import { AbsoluteFill } from "remotion";
import { GlyphStrokeWriter, glyphStrokesFor } from "../motion-primitives";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// GlyphStrokeWriterDemo — proof/check scenes for the per-glyph stroke-order
// writer. These are DEMO scenes, so explicit frame literals are allowed here
// (the zero-frame-literal law governs src/lessons/*LessonScene.tsx). The real
// lesson drives `atFrame` from `cues[id].startFrame + offset`.
//
// Two compositions:
//   GlyphStrokeWriterHardest      — the numeral '2' mid-second-stroke (bottom
//                                   horizontal sweeping right, top arc finished,
//                                   ghost visible, START dot consumed). THE
//                                   misconception target frame.
//   GlyphStrokeWriterMultiplicity — a row of all five numeral cells 1–5, each
//                                   mid-write at staggered progress (gallery
//                                   contact frame, worst-case multiplicity).
// ---------------------------------------------------------------------------

const PER_STROKE = 26;
const GAP = 8;

// HARDEST: park the playhead so '2' is mid its SECOND stroke (the bottom
// horizontal). Stroke 0 spans [atFrame, atFrame+PER_STROKE]; stroke 1 starts at
// atFrame + PER_STROKE + GAP. At the review frame the playhead sits ~mid stroke 1.
export const GLYPH_HARDEST_DURATION = 90;
const HARDEST_AT = 6; // stroke1 draws over [6+34, 6+34+26] = [40, 66]

export const GlyphStrokeWriterHardest = () => {
  const data = glyphStrokesFor("2");
  const size = 360;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        <GlyphStrokeWriter
          atFrame={HARDEST_AT}
          focusZone="bottom"
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

// COMPARISON SYMBOLS: the second curriculum demand (KP8 比较符号的书写). Three
// cells =, >, < each mid-write, proving the SAME writer drives non-numeral
// glyphs from different stroke data with no code change.
export const GLYPH_SYMBOLS_DURATION = 120;
const SYMBOLS = ["=", ">", "<"];

export const GlyphStrokeWriterSymbols = () => {
  const size = 230;
  const gap = 40;
  const total = SYMBOLS.length * size + (SYMBOLS.length - 1) * gap;
  const startX = (video.width - total) / 2;
  const cellY = video.height / 2 - size / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        {SYMBOLS.map((char, index) => {
          const data = glyphStrokesFor(char);
          const atFrame = 4 + index * 16;

          return (
            <GlyphStrokeWriter
              atFrame={atFrame}
              grid="mi"
              interStrokeGapFrames={GAP}
              key={char}
              perStrokeDurationFrames={PER_STROKE}
              size={size}
              stroke={colors.sky}
              strokes={data?.strokes ?? []}
              x={startX + index * (size + gap)}
              y={cellY}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// WORST-CASE MULTIPLICITY: five cells 1–5, each at a different stagger so the
// row shows the writer at every phase at once (some mid stroke 0, some between,
// some mid stroke 1, some finished).
export const GLYPH_MULTIPLICITY_DURATION = 120;
const GLYPHS = ["1", "2", "3", "4", "5"];

export const GlyphStrokeWriterMultiplicity = () => {
  const size = 200;
  const gap = 30;
  const total = GLYPHS.length * size + (GLYPHS.length - 1) * gap;
  const startX = (video.width - total) / 2;
  const cellY = video.height / 2 - size / 2 + 18;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        viewBox={`0 0 ${video.width} ${video.height}`}
        width="100%"
      >
        {GLYPHS.map((char, index) => {
          const data = glyphStrokesFor(char);
          // Stagger each cell's start so at a single review frame the whole row
          // sits at mixed progress — the multiplicity stress test.
          const atFrame = 4 + index * 12;

          return (
            <GlyphStrokeWriter
              atFrame={atFrame}
              grid="tian"
              interStrokeGapFrames={GAP}
              key={char}
              perStrokeDurationFrames={PER_STROKE}
              size={size}
              strokes={data?.strokes ?? []}
              x={startX + index * (size + gap)}
              y={cellY}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
