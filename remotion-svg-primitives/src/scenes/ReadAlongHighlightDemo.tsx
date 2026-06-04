import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { ReadAlongHighlight } from "../motion-primitives";
import { fontFamily } from "../shape-primitives/shared";
import { colors, video } from "../theme";

// ---------------------------------------------------------------------------
// ReadAlongHighlightDemo — verification scenes for the ReadAlongHighlight
// special component. Four compositions are derived off this:
//
//  • ReadAlongHighlightHardest      — THE HARDEST FRAME. A multi-LINE poem
//    held mid-sweep: the current item glows + swells, the bouncing ball is
//    MID-ARC between two items, past items are dimmed back. Verify the arc
//    bounce reads + the active glyph stays legible against the glow ring.
//  • ReadAlongHighlightMultiplicity — WORST-CASE MULTIPLICITY. A long single
//    row (the 26 letters), held mid-sweep so the ball arcs across a dense row
//    and many items pack the line without overlap.
//  • ReadAlongHighlightChinese      — 对韵歌 CALLER. The SAME component with
//    hanzi items in short lines (云对雨 / 雪对风), beats weighting the held
//    对 syllable, the "filling trail" mode (dimPast=false).
//  • ReadAlongHighlightEnglish      — ABC-song CALLER. A row of letters with
//    the bouncing ball — the 字母歌 sing-along. Different props, zero
//    component change.
//
// Demo scene → explicit strings here are fine (the lesson-agnostic law governs
// the COMPONENT, not its demo harness; a real lesson passes localized item
// nodes + beats from its own data and atFrame from cues[id].startFrame+offset).
// ---------------------------------------------------------------------------

const CX = video.width / 2;
const CY = video.height / 2;

export const READ_ALONG_HIGHLIGHT_DEMO_DURATION = 260;

// A localized item node — the caller owns the string + styling. `fill="current
// Color"` lets the glyph ride ReadAlongHighlight's active tint (the highlight
// flows through `color` on the wrapping group); the resting/dim tint flows too.
const glyph = (text: string, size = 64) => (
  <text
    dominantBaseline="central"
    fill="currentColor"
    fontFamily={fontFamily}
    fontSize={size}
    fontWeight={900}
    textAnchor="middle"
    x={0}
    y={0}
  >
    {text}
  </text>
);

const letters = (s: string) => s.split("").map((c) => glyph(c, 60));
const hanzi = (s: string): ReactNode[] => s.split("").map((c) => glyph(c, 70));

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: colors.cream }}>
    <svg
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      viewBox={`0 0 ${video.width} ${video.height}`}
      width="100%"
    >
      {children}
    </svg>
  </AbsoluteFill>
);

// THE HARDEST FRAME — a 3-line poem held mid-sweep. atFrame chosen so the sweep
// has reached an item in the SECOND line while the ball is mid-arc toward it
// (between two items) and the first line's items are already dimmed past.
export const ReadAlongHighlightHardest = () => (
  <Stage>
    <ReadAlongHighlight
      atFrame={-78}
      cursor="ball"
      dimPast
      itemGap={150}
      lineGap={170}
      lines={[hanzi("天对地"), hanzi("雨对风"), hanzi("大陆对长空")]}
      perBeatDurationFrames={20}
      x={CX}
      y={CY}
    />
  </Stage>
);

// WORST-CASE MULTIPLICITY — the full 26-letter alphabet as one long row, held
// mid-sweep. The ball arcs across a dense line; verify items + glow rings stay
// clear at this packing.
export const ReadAlongHighlightMultiplicity = () => (
  <Stage>
    <ReadAlongHighlight
      atFrame={-150}
      cursor="ball"
      dimPast={false}
      itemGap={44}
      itemRadius={18}
      lines={[letters("ABCDEFGHIJKLMNOPQRSTUVWXYZ")]}
      perBeatDurationFrames={12}
      x={CX}
      y={CY}
    />
  </Stage>
);

// 对韵歌 CALLER — short hanzi lines, beats weighting the held 对 (a fermata),
// "filling trail" mode so the sung-so-far items stay lit. Held mid-second-line.
export const ReadAlongHighlightChinese = () => (
  <Stage>
    <ReadAlongHighlight
      atFrame={-70}
      // 云 对 雨 / 雪 对 风 — the 对 syllable is held (beat 2), the rest beat 1.
      beats={[1, 2, 1, 1, 2, 1]}
      cursor="underline"
      dimPast={false}
      highlightColorAlready={colors.mint}
      itemGap={150}
      lineGap={180}
      lines={[hanzi("云对雨"), hanzi("雪对风")]}
      perBeatDurationFrames={22}
      x={CX}
      y={CY}
    />
  </Stage>
);

// ABC-song CALLER — a letter row with the bouncing ball, the 字母歌 sing-along.
// Held early in the sweep so the ball sits on one of the first letters.
export const ReadAlongHighlightEnglish = () => (
  <Stage>
    <ReadAlongHighlight
      atFrame={-40}
      cursor="ball"
      dimPast
      itemGap={96}
      itemRadius={38}
      lines={[letters("ABCDEFG")]}
      perBeatDurationFrames={18}
      x={CX}
      y={CY}
    />
  </Stage>
);
