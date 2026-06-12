// manifest.ts — load-bearing element bboxes for the machine-gated check.
//
// PURE TS (no React/Remotion). Both the scene and the check scripts read the
// same layout.ts constants, so a drift between picture and bbox is a real
// defect (the check flags it). Each `bboxAt(frame)` returns the element's
// composition-pixel bbox + opacity, or null when the element is not mounted at
// that frame. The frame windows MUST match the scene's cue gating.
//
// Registered = the load-bearing elements from visual-design §3 Visual Contract:
// the two dot rows, the pair lines, the surplus ghosts, the > glyph, the phrase
// row, the amount tags, the intro card. Decorative/transient accents (pulse
// rings, turn-cue, recap rings) are NOT registered — they are chrome.

import type { LessonManifest, SceneElement } from "../manifestTypes";
import { kptestCompareMoreFewerCues } from "../kptestCompareMoreFewerLessonTimeline";
import * as L from "./layout";

const cueOf = (id: string) => kptestCompareMoreFewerCues.find((c) => c.id === id);
const startOf = (id: string): number => cueOf(id)?.startFrame ?? 0;
const endOf = (id: string): number => cueOf(id)?.endFrame ?? 0;
const between = (frame: number, a: number, b: number): boolean =>
  frame >= a && frame < b;
const sinceStart = (frame: number, id: string): boolean =>
  frame >= startOf(id);

// A square bbox centered on (cx, cy) with the given diameter.
const dotBox = (
  cx: number,
  cy: number,
  d: number,
): [number, number, number, number] => [cx - d / 2, cy - d / 2, d, d];

// Hull bbox over a set of [x,y] centers, padded by half a dot diameter.
const rowBox = (
  centers: { x: number; y: number }[],
  d: number,
): [number, number, number, number] => {
  const xs = centers.map((c) => c.x);
  const ys = centers.map((c) => c.y);
  const minX = Math.min(...xs) - d / 2;
  const maxX = Math.max(...xs) + d / 2;
  const minY = Math.min(...ys) - d / 2;
  const maxY = Math.max(...ys) + d / 2;
  return [minX, minY, maxX - minX, maxY - minY];
};

const PICTURE_START = startOf("two-groups");
const LESSON_END = endOf("recap");

const topRow: SceneElement = {
  id: "topRow",
  zone: "objects",
  bboxAt: (frame) => {
    if (!sinceStart(frame, "two-groups") || frame >= LESSON_END) {
      return null;
    }
    const centers = Array.from({ length: L.TOP_COUNT }, (_, c) => L.topDot(c));
    return { bbox: rowBox(centers, L.DOT_DIAMETER), opacity: 1 };
  },
};

const bottomRow: SceneElement = {
  id: "bottomRow",
  zone: "objects",
  bboxAt: (frame) => {
    if (!sinceStart(frame, "two-groups") || frame >= LESSON_END) {
      return null;
    }
    // not-by-size spreads the bottom row wide; reflect the widest extent so the
    // check sees the true footprint during the spread.
    const spread = between(frame, startOf("not-by-size"), endOf("not-by-size"));
    const centers = Array.from({ length: L.BOTTOM_COUNT }, (_, c) => ({
      x: spread ? L.bottomDotSpreadX(c) : L.bottomDot(c).x,
      y: L.bottomDot(c).y,
    }));
    return { bbox: rowBox(centers, L.DOT_DIAMETER), opacity: 1 };
  },
};

const pairLines: SceneElement = {
  id: "pairLines",
  // The connector lines are INK drawn over the teaching dots (they touch the
  // dots they connect by definition) — `marks`, not a second `objects` element.
  // marks∩objects is the explicitly-allowed "ink traces over teaching object"
  // pair, so the connector-touches-endpoint adjacency is not a false collision.
  zone: "marks",
  bboxAt: (frame) => {
    // Lines exist from match onward (matched), and on the spread layout in
    // not-by-size. Hull from the top dots to the (possibly spread) bottom dots.
    if (!sinceStart(frame, "match") || frame >= LESSON_END) {
      return null;
    }
    const spread = between(frame, startOf("not-by-size"), endOf("not-by-size"));
    const pts: { x: number; y: number }[] = [];
    for (let c = 0; c < L.BOTTOM_COUNT; c += 1) {
      pts.push(L.topDot(c));
      pts.push({
        x: spread ? L.bottomDotSpreadX(c) : L.bottomDot(c).x,
        y: L.bottomDot(c).y,
      });
    }
    return { bbox: rowBox(pts, 8), opacity: 1 };
  },
};

const surplusGhosts: SceneElement = {
  id: "surplusGhosts",
  // Dashed "no partner" ghosts are ink marking the EMPTY slots under the
  // surplus dots — annotation over the picture, same class as the connector
  // lines → `marks` (marks∩objects allowed).
  zone: "marks",
  bboxAt: (frame) => {
    // Ghosts appear at the end of match and persist; they sit on the bottom row
    // under the 2 surplus top columns.
    const visible =
      frame >= startOf("match") + L.MATCH_GHOST_START && frame < LESSON_END;
    if (!visible) {
      return null;
    }
    // Ghosts sit on the bottom-row line in the surplus columns (the spread is
    // capped so the fanned dots never reach these columns).
    const centers = L.OVERHANG_COLUMNS.map((c) => ({
      x: L.topDot(c).x,
      y: L.bottomDot(0).y,
    }));
    return { bbox: rowBox(centers, L.DOT_DIAMETER), opacity: 1 };
  },
};

const comparisonSymbol: SceneElement = {
  id: "comparisonSymbol",
  zone: "labels",
  bboxAt: (frame) => {
    if (!sinceStart(frame, "more-direction") || frame >= LESSON_END) {
      return null;
    }
    return {
      bbox: dotBox(L.SYMBOL_CX, L.SYMBOL_CY, L.SYMBOL_SIZE),
      opacity: 1,
    };
  },
};

const phraseRow: SceneElement = {
  id: "phraseRow",
  zone: "labels",
  bboxAt: (frame) => {
    // The phrase row is on screen for every model/echo/replay/recap cue.
    const on =
      between(frame, startOf("more-direction"), endOf("fewer-replay")) ||
      between(frame, startOf("recap"), endOf("recap"));
    if (!on) {
      return null;
    }
    const tokenCount = 4;
    const w = (tokenCount - 1) * L.PHRASE_ITEM_GAP + L.PHRASE_FONT;
    const h = L.PHRASE_FONT + 24;
    return {
      bbox: [L.PHRASE_CX - w / 2, L.PHRASE_CY - h / 2, w, h],
      opacity: 1,
    };
  },
};

const amountTags: SceneElement = {
  id: "amountTags",
  zone: "labels",
  bboxAt: (frame) => {
    if (!between(frame, startOf("two-groups"), endOf("two-groups"))) {
      return null;
    }
    const top = L.AMOUNT_TOP_Y - L.AMOUNT_CARD_H / 2;
    const bottom = L.AMOUNT_BOTTOM_Y + L.AMOUNT_CARD_H / 2;
    return {
      bbox: [
        L.AMOUNT_X - L.AMOUNT_CARD_W / 2,
        top,
        L.AMOUNT_CARD_W,
        bottom - top,
      ],
      opacity: 1,
    };
  },
};

const introCard: SceneElement = {
  id: "introCard",
  zone: "labels",
  bboxAt: (frame) => {
    if (frame >= PICTURE_START) {
      return null;
    }
    // The intro card is roughly the title + teaser block centered on canvas.
    const w = 900;
    const h = 320;
    return {
      bbox: [L.INTRO_CX - w / 2, L.INTRO_CY - h / 2, w, h],
      opacity: 1,
    };
  },
};

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kptest-compare-more-fewer",
  composition: "CompleteKptestCompareMoreFewerLesson",
  fps: L.FPS,
  width: L.CANVAS_W,
  height: L.CANVAS_H,
  cues: kptestCompareMoreFewerCues,
  zones: {
    objects: [L.OBJECTS_CX - 360, L.OBJECTS_CY - 180, 720, 360],
    labels: [340, 90, 740, 140],
  },
  keyFrames: [
    { id: "intro:title", cueId: "intro", offset: L.INTRO_TITLE_IN_DUR, label: "intro title alone, no dots" },
    { id: "two-groups:both-rows", cueId: "two-groups", offset: L.TWO_AMOUNT_START + L.TWO_AMOUNT_DUR, label: "5 over 3 + amount tags" },
    { id: "match:surplus", cueId: "match", offset: L.MATCH_GHOST_START + L.MATCH_GHOST_DUR, label: "3 lines + 2 ghosts" },
    { id: "more:read", cueId: "more-direction", offset: L.SYMBOL_IN_START + L.SYMBOL_IN_DUR + 30, label: "> + 五比三多 sweep + pulse" },
    { id: "echo-more:turn", cueId: "echo-more", offset: L.TURN_IN_START + L.TURN_IN_DUR + 30, label: "your-turn cue held, phrase legible" },
    { id: "fewer:keystone", cueId: "fewer-direction", offset: L.FOCUS_SLIDE_START + L.FOCUS_SLIDE_DUR, label: "focus slid to short row, same picture" },
    { id: "not-by-size:spread", cueId: "not-by-size", offset: L.SPREAD_START + L.SPREAD_DUR, label: "bottom row spread wide" },
    { id: "not-by-size:repair", cueId: "not-by-size", offset: L.REPAIR_GHOST_START + L.REPAIR_GHOST_DUR, label: "re-paired, still 2 leftover" },
    { id: "recap:more", cueId: "recap", offset: L.RECAP_BEAT_1_START + 30, label: "surplus + 五比三多" },
    { id: "recap:fewer", cueId: "recap", offset: L.RECAP_BEAT_2_START + 30, label: "short row + 三比五少" },
  ],
  elements: [
    introCard,
    topRow,
    bottomRow,
    pairLines,
    surplusGhosts,
    comparisonSymbol,
    phraseRow,
    amountTags,
  ],
};
