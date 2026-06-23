// fen-yu-he — bbox manifest (Wave 4 composer).
//
// PURE TS. No React, no Remotion imports — loaded directly by
// scripts/_manifest-extract.ts via dynamic import(). Every bboxAt() reads the
// SAME constants/helpers in ./layout.ts that the scene reads, so the manifest
// cannot silently drift from FenYuHeLessonScene.tsx. Only LOAD-BEARING
// elements (visual-design §3 Visual Contract + sketch-overlay marks) are
// registered — not every <g>.
//
// Zone choice (manifestTypes.ts ZoneName):
//   - intro title           -> "labels" (pure text, present only in intro)
//   - candy group           -> "objects" (the teaching object)
//   - divider line          -> "marks"   (coral action stroke; marks∩objects allowed)
//   - big 分合式 (read cue)  -> "objects" (the diagram being actively READ — marks
//                              may trace over it per kids-eye §1.5)
//   - 4 column 分合式 rows   -> "labels"  (the enumerated symbolic results)
//   - read arrows, vs-mark  -> "marks"
//   - read TEXT labels      -> "labels"  (分成 / 组成 — each its OWN component)
// marks∩labels is NOT allowed, so (a) the order-matters vs-mark colliding with
// a column numeral and (b) a read ARROW (marks) colliding with its read LABEL
// (labels) both get flagged. An arrow and its label are DIFFERENT components
// and MUST NOT overlap — that is exactly the defect this granular registration
// lets the gate SEE. marks∩marks is also flagged, so the two read arrows
// overlapping each other (or the divider) would be caught too. The arrows are
// each registered ALONE (shaft+bow+arrowhead, NOT bundled with their label).

import type {
  Bbox as ManifestBbox,
  ElementSnapshot,
  KeyFrame,
  LessonManifest,
  SceneElement,
} from "../../manifestTypes";

import { fenYuHeCues } from "../fenYuHeLessonTimeline";
import {
  BIG_DIAGRAM,
  COLUMN,
  CUE_TAIL_FRAMES,
  MOTION,
  SKETCH,
  SLIDE_SEQUENCE,
  ZONES,
  type CueWindow,
  candyGroupBboxAt,
  candyPositionsAt,
  columnRowY,
  fenHeDiagramBbox,
  progress,
  readArrowBbox,
  readLabelBbox,
  titleBbox,
  wholeGlyphBboxAt,
  TITLE,
} from "./layout";

const cues: Record<string, CueWindow> = Object.fromEntries(
  fenYuHeCues.map((c) => [c.id, { startFrame: c.startFrame, endFrame: c.endFrame }]),
);

const cue = (id: string): CueWindow => {
  const c = cues[id];
  if (!c) {
    throw new Error(`fen-yu-he manifest: unknown cue "${id}"`);
  }
  return c;
};

const snap = (
  bbox: ManifestBbox | null,
  opacity: number,
): ElementSnapshot | null => {
  if (!bbox || opacity <= 0.001) {
    return null;
  }
  return { bbox, opacity };
};

// --- intro title --------------------------------------------------------
const introTitle: SceneElement = {
  id: "intro-title",
  zone: "labels",
  bboxAt: (frame) => {
    const c = cue("intro-title");
    const appearFrom = c.startFrame + TITLE.appearStart;
    const appear = progress(frame, appearFrom, appearFrom + TITLE.appearDuration);
    const fadeFrom = c.endFrame - TITLE.fadeOutBeforeEnd;
    const fade = 1 - progress(frame, fadeFrom, fadeFrom + TITLE.fadeOutDuration);
    const reveal = Math.min(appear, fade);
    return snap(titleBbox(), reveal);
  },
};

// --- candy group --------------------------------------------------------
const candyGroup: SceneElement = {
  id: "candy-group",
  zone: "objects",
  bboxAt: (frame) => {
    const fiveWhole = cue("five-whole");
    const read = cue("read-fen-he-shi");
    const firstSplit = cue("first-ordered-split");
    const bbox = candyGroupBboxAt(frame, fiveWhole.startFrame, (f) =>
      candyPositionsAt(f, cues),
    );
    // opacity: dimmed (0.5) during the read-fen-he-shi drop, else full.
    let opacity = 1;
    if (frame >= read.startFrame && frame < firstSplit.startFrame) {
      const from = read.startFrame + MOTION.read.candyDropStart;
      opacity = 1 - progress(frame, from, from + MOTION.read.candyDropDuration) * 0.5;
    }
    return snap(bbox, frame >= fiveWhole.startFrame ? opacity : 0);
  },
};

// --- divider line -------------------------------------------------------
const divider: SceneElement = {
  id: "divider",
  zone: "marks",
  bboxAt: (frame) => {
    const split = cue("split-into-two");
    const recombine = cue("recombine-inverse");
    const read = cue("read-fen-he-shi");
    const firstSplit = cue("first-ordered-split");
    const yTop = 300;
    const yBot = 540;
    const halfW = 8; // strokeWidth 10 -> ~5, padded
    let x: number | null = null;
    let opacity = 0;
    if (frame >= split.startFrame && frame < read.startFrame) {
      x = 640; // CENTER_STAGE.dividerX
      if (frame < recombine.startFrame) {
        const from = split.startFrame + MOTION.split.dividerStart;
        opacity = progress(frame, from, from + MOTION.split.dividerDuration);
      } else {
        const from = recombine.startFrame + MOTION.recombine.dividerFadeStart;
        opacity =
          1 - progress(frame, from, from + MOTION.recombine.dividerFadeDuration);
      }
    } else if (frame >= firstSplit.startFrame) {
      x = 470; // LEFT_STAGE.dividerX
      const from = firstSplit.startFrame + MOTION.firstSplit.candyMoveStart;
      const draw = progress(frame, from, from + MOTION.split.dividerDuration);
      opacity = draw > 0 ? 1 : 0;
    }
    if (x === null) {
      return null;
    }
    return snap([x - halfW, yTop, halfW * 2, yBot - yTop], opacity);
  },
};

// --- big 分合式 diagram (read cue) --------------------------------------
const bigDiagram: SceneElement = {
  id: "big-diagram",
  zone: "objects",
  bboxAt: (frame) => {
    const read = cue("read-fen-he-shi");
    const firstSplit = cue("first-ordered-split");
    if (frame < read.startFrame || frame >= firstSplit.endFrame) {
      return null;
    }
    const lineFrom = read.startFrame + MOTION.read.lineStart;
    const lineProgress = progress(frame, lineFrom, lineFrom + MOTION.read.lineDuration);
    const migrateFrom = firstSplit.startFrame + MOTION.firstSplit.migrateStart;
    const migrateProgress = progress(
      frame,
      migrateFrom,
      migrateFrom + MOTION.firstSplit.migrateDuration,
    );
    const opacity = Math.min(lineProgress > 0 ? 1 : 0, 1 - migrateProgress);
    return snap(
      fenHeDiagramBbox(BIG_DIAGRAM.cx, BIG_DIAGRAM.cy, BIG_DIAGRAM.width),
      opacity,
    );
  },
};

// --- migrating WHOLE glyph card ----------------------------------------
// The "5" card that lands in the big diagram (bouncy overshoot to scale 1.06)
// then migrates into column row 0. Previously UNREGISTERED (machine-gated-
// verification §1.1) — registering it lets BOTH the fast path (linear resting
// envelope) and the --measured pass (true overshot getBBox) see it. Its scene
// <g> carries data-mid="glyph-whole" (matching this id).
const glyphWhole: SceneElement = {
  id: "glyph-whole",
  zone: "objects",
  bboxAt: (frame) => {
    const read = cue("read-fen-he-shi");
    const firstSplit = cue("first-ordered-split");
    const slide = cue("slide-one-at-a-time");
    const bbox = wholeGlyphBboxAt(
      frame,
      read.startFrame,
      firstSplit.startFrame,
      slide.startFrame,
    );
    // opacity mirrors the scene's Math.min(1, wholeLand) — 0 before land, →1.
    const wholeLandFrom = read.startFrame + MOTION.read.wholeLandStart;
    const wholeLand = progress(frame, wholeLandFrom, wholeLandFrom + 14);
    return snap(bbox, Math.min(1, wholeLand));
  },
};

// --- four column rows ---------------------------------------------------
const columnRowVisibility = (frame: number): number[] => {
  const firstSplit = cue("first-ordered-split");
  const slide = cue("slide-one-at-a-time");
  const vis = [0, 0, 0, 0];
  const migrateFrom = firstSplit.startFrame + MOTION.firstSplit.migrateStart;
  vis[0] = progress(
    frame,
    migrateFrom + MOTION.firstSplit.migrateDuration - 6,
    migrateFrom + MOTION.firstSplit.migrateDuration + 6,
  );
  if (frame >= slide.startFrame) {
    vis[0] = 1;
    const cueLen = slide.endFrame - slide.startFrame;
    const usable = cueLen - CUE_TAIL_FRAMES;
    const slideWindow = usable / SLIDE_SEQUENCE.length;
    const local = frame - slide.startFrame;
    for (let row = 1; row <= 3; row += 1) {
      const slideIdx = row - 1;
      const wStart = slideIdx * slideWindow;
      const freezeFrom = wStart + slideWindow * MOTION.slide.rowFreezeStartFrac;
      const freezeTo = wStart + slideWindow * MOTION.slide.rowFreezeEndFrac;
      vis[row] = progress(local, freezeFrom, freezeTo);
    }
  }
  return vis;
};

const columnRow = (row: number): SceneElement => ({
  id: `column-row-${row}`,
  zone: "labels",
  bboxAt: (frame) => {
    const firstSplit = cue("first-ordered-split");
    const orderMatters = cue("order-matters");
    if (frame < firstSplit.startFrame) {
      return null;
    }
    const reveal = columnRowVisibility(frame)[row];
    // order-matters dims non-contrasted rows
    let opacity = reveal;
    const omLen = orderMatters.endFrame - orderMatters.startFrame;
    if (frame >= orderMatters.startFrame) {
      const dimFrom =
        orderMatters.startFrame +
        Math.round(omLen * MOTION.orderMatters.dimStartFrac);
      const dim = progress(frame, dimFrom, dimFrom + MOTION.orderMatters.dimDuration);
      const isContrast = row === 0 || row === 3;
      if (!isContrast) {
        opacity = reveal * (1 - dim * 0.62); // dimmed stateOpacity ~0.38
      }
    }
    return snap(
      fenHeDiagramBbox(COLUMN.cx, columnRowY(row), COLUMN.width, COLUMN.reachRatio),
      opacity,
    );
  },
});

// --- sketch marks -------------------------------------------------------
// Shared visibility for one read mark (arrow OR its label) — they appear and
// fade together but are two SEPARATE registered components.
const readMarkOpacity = (frame: number, which: 1 | 2): number => {
  const read = cue("read-fen-he-shi");
  if (frame < read.startFrame || frame >= read.endFrame) {
    return 0;
  }
  const startOff = which === 1 ? SKETCH.read.arrow1Start : SKETCH.read.arrow2Start;
  const from = read.startFrame + startOff;
  const draw = progress(frame, from, from + SKETCH.read.drawDuration);
  const fadeFrom = read.endFrame - SKETCH.read.fadeBeforeEnd;
  const fade = 1 - progress(frame, fadeFrom, read.endFrame);
  return draw > 0 ? 0.92 * fade : 0;
};

// The read-direction ARROW alone (shaft + outward bow + arrowhead), NO label.
// 分成 = arrow 1 (down, LEFT); 组成 = arrow 2 (up, RIGHT). Zone "marks".
const readArrowMark = (which: 1 | 2): SceneElement => ({
  id: which === 1 ? "read-arrow-fen" : "read-arrow-zu",
  zone: "marks",
  bboxAt: (frame) => snap(readArrowBbox(which), readMarkOpacity(frame, which)),
});

// The read-direction LABEL alone (分成 / 组成 text glyphs), NO arrow. Zone
// "labels" so an arrow(marks)∩label(labels) overlap is FLAGGED — an arrow and
// its label are different components and must never overlap.
const readLabel = (which: 1 | 2): SceneElement => ({
  id: which === 1 ? "read-label-fen" : "read-label-zu",
  zone: "labels",
  bboxAt: (frame) => snap(readLabelBbox(which), readMarkOpacity(frame, which)),
});

const orderVsMark: SceneElement = {
  id: "order-vs-mark",
  zone: "marks",
  bboxAt: (frame) => {
    const orderMatters = cue("order-matters");
    if (frame < orderMatters.startFrame || frame >= orderMatters.endFrame) {
      return null;
    }
    const omLen = orderMatters.endFrame - orderMatters.startFrame;
    const drawFrom =
      orderMatters.startFrame +
      Math.round(omLen * SKETCH.orderMatters.drawStartFrac);
    const draw = progress(frame, drawFrom, drawFrom + SKETCH.orderMatters.drawDuration);
    const fadeFrom = orderMatters.endFrame - SKETCH.orderMatters.fadeBeforeEnd;
    const fade = 1 - progress(frame, fadeFrom, orderMatters.endFrame);
    const midY =
      (columnRowY(SKETCH.orderMatters.vsRowA) +
        columnRowY(SKETCH.orderMatters.vsRowB)) /
      2;
    const arm = SKETCH.orderMatters.vsArmLength + 4;
    const bbox: ManifestBbox = [
      SKETCH.orderMatters.vsX - arm,
      midY - arm,
      arm * 2,
      arm * 2,
    ];
    return snap(bbox, draw > 0 ? 0.92 * fade : 0);
  },
};

// --- key frames (focal moment per cue; extra on the two accent cues) ----
const relMid = (id: string): number => {
  const c = cue(id);
  return Math.round((c.endFrame - c.startFrame) / 2);
};
const relLate = (id: string): number => {
  const c = cue(id);
  return Math.round((c.endFrame - c.startFrame) * 0.8);
};

const keyFrames: KeyFrame[] = [
  { id: "intro-title:read", cueId: "intro-title", offset: relMid("intro-title"), label: "title + KP teaser on screen" },
  { id: "five-whole:settled", cueId: "five-whole", offset: relLate("five-whole"), label: "five candies as one heap" },
  { id: "split:separated", cueId: "split-into-two", offset: relLate("split-into-two"), label: "divider + two heaps (1|4)" },
  { id: "recombine:merged", cueId: "recombine-inverse", offset: relLate("recombine-inverse"), label: "candies merged back to heap" },
  { id: "read:diagram", cueId: "read-fen-he-shi", offset: relMid("read-fen-he-shi"), label: "分合式 drawn, read arrows" },
  { id: "read:arrows-late", cueId: "read-fen-he-shi", offset: relLate("read-fen-he-shi"), label: "bottom-up read arrow" },
  { id: "first-split:column-top", cueId: "first-ordered-split", offset: relLate("first-ordered-split"), label: "row 0 in column, candies 1|4 left" },
  { id: "slide:mid", cueId: "slide-one-at-a-time", offset: relMid("slide-one-at-a-time"), label: "candy sliding, rows building" },
  { id: "slide:late", cueId: "slide-one-at-a-time", offset: relLate("slide-one-at-a-time"), label: "four rows, candies 4|1" },
  { id: "column-complete:emphasis", cueId: "ordered-column-complete", offset: relMid("ordered-column-complete"), label: "emphasis down left parts 1-2-3-4" },
  { id: "order-matters:contrast", cueId: "order-matters", offset: relLate("order-matters"), label: "top vs bottom row, vs-mark" },
];

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "fen-yu-he",
  composition: "CompleteFenYuHeLesson",
  fps: 30,
  width: 1280,
  height: 720,
  cues: fenYuHeCues,
  keyFrames,
  elements: [
    introTitle,
    candyGroup,
    divider,
    bigDiagram,
    glyphWhole,
    columnRow(0),
    columnRow(1),
    columnRow(2),
    columnRow(3),
    // Read arrows and their labels — each its OWN element (NOT bundled), so the
    // gate flags an arrow∩its-own-label overlap (marks∩labels).
    readArrowMark(1),
    readArrowMark(2),
    readLabel(1),
    readLabel(2),
    orderVsMark,
  ],
  zones: {
    // The column rows + read labels live in "labels"; publish the column zone
    // (the larger labels region this lesson uses) for the QC overlay.
    labels: ZONES.column,
    objects: ZONES.stage,
    marks: ZONES.divider,
    caption: ZONES.caption,
  },
  // APEX-STACK (explicit ruling 2026-05-29): the whole-number "5" glyph
  // (objects) sits directly on the top row of its OWN decomposition column
  // (labels) — intentional fen-he layout, not crowding. Declared per
  // element-id pair; the former blanket objects:labels zone exemption is dead.
  allowedOverlaps: [["glyph-whole", "column-row-0"]],
};
