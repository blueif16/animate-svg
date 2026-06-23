// captionBand.ts — the ONE lesson-agnostic caption-ribbon footprint.
//
// The narration caption is drawn by the SHARED LessonCaptionLayer (kit
// CaptionLayer): a bottom-anchored, horizontally-centered ribbon whose geometry
// is identical for every lesson. So the "caption band" is a single shared
// constant — NOT per-manifest data (the old per-lesson `zones.caption` was the
// same rectangle hand-copied into each manifest). The measured verification pass
// checks every teaching element against THIS band: a teaching mark inside the
// ribbon's footprint is the caption-collision defect.
//
// Derived from the kit CaptionLayer DEFAULT_CONTAINER + LessonCaptionLayer
// `kidsTheme` ribbon CSS on the shared 1280×720 canvas (`video`). Those two
// places are the only touch-points — if the ribbon CSS changes, update the
// mirrored constants below.

import { video } from "../theme";
import type { Bbox } from "../lessons/manifestTypes";

// --- mirror of the ribbon CSS (kit container + LessonCaptionLayer kidsTheme) --
const BOTTOM_MARGIN = 46; // container padding-bottom ("0 112px 46px")
const SIDE_MARGIN = 112; // container padding-left/right
const MAX_WIDTH = 860; // ribbon maxWidth
const FONT_SIZE = 34; // ribbon fontSize
const LINE_HEIGHT = 1.25; // ribbon lineHeight
const PAD_TOP = 16; // ribbon padding-top ("16px 28px 18px")
const PAD_BOTTOM = 18; // ribbon padding-bottom
const BORDER = 4; // ribbon border width
// Worst-case wrap: the ribbon grows to two lines before it would overflow the
// canvas — the band must bound that maximum footprint.
const MAX_LINES = 2;

const ribbonWidth = Math.min(MAX_WIDTH, video.width - SIDE_MARGIN * 2);
const ribbonHeight =
  BORDER * 2 + PAD_TOP + PAD_BOTTOM + Math.ceil(FONT_SIZE * LINE_HEIGHT) * MAX_LINES;
const bottomEdge = video.height - BOTTOM_MARGIN;

// [x, y, width, height] in composition px (top-left origin), centered &
// bottom-anchored. Worst-case (widest, two-line) ribbon footprint.
export const CAPTION_BAND: Bbox = [
  Math.round((video.width - ribbonWidth) / 2),
  Math.round(bottomEdge - ribbonHeight),
  ribbonWidth,
  ribbonHeight,
];
