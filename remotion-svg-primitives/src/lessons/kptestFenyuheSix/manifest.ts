// kptest-fenyuhe-six — METADATA-ONLY manifest (Batch 5 manifest auto-derive).
//
// Declares only which elements are load-bearing and their zone; the measured
// pass (`lesson:check`) reads each box off the render (getBBox). No bboxAt — the
// geometry is not mirrored here. Every { id, zone } is tagged once in the scene
// with measureProps("<id>") (the recap beats via RECAP_BEAT_IDS); the bijection
// gate fails if a declared id is never measured or a measured id is undeclared.
//
// Dropped vs the pre-Batch-5 manifest: `glint-flash` (a <GlintFlash> sparkle —
// decoration, never tagged) and the per-cue keyFrames/zones/bboxAt machinery.

import type { LessonManifest } from "../manifestTypes";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./layout";
import { kptestFenyuheSixCues } from "../kptestFenyuheSixLessonTimeline";

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kptest-fenyuhe-six",
  composition: "CompleteKptestFenyuheSixLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kptestFenyuheSixCues,
  elements: [
    { id: "six-dots", zone: "objects" },
    { id: "bond-glyph", zone: "labels" },
    { id: "title", zone: "labels" },
    { id: "pointer", zone: "decoration" }, // affordance hand — its own decoration element
    { id: "aggregator-prompt", zone: "labels" },
    { id: "recap-beat-1-5", zone: "objects" },
    { id: "recap-beat-2-4", zone: "objects" },
    { id: "recap-beat-3-3", zone: "objects" },
    { id: "underline-3of3", zone: "marks" },
  ],
  allowedOverlaps: [
    // The affordance hand sits beside the dots / bond glyph inside the question
    // composition — intentional adjacency, not a teaching collision.
    ["pointer", "six-dots"],
    ["pointer", "bond-glyph"],
  ],
};
