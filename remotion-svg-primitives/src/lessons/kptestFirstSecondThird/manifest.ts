// kptest-first-second-third — METADATA-ONLY manifest (Batch 5 manifest auto-derive).
//
// Declares only which elements are load-bearing and their zone; the measured
// pass (`lesson:check`) reads each box off the render (getBBox). No bboxAt — the
// geometry is not mirrored here. Every { id, zone } is tagged once in the scene
// with measureProps("<id>") (animals/chips via the `animal-${n}` / `chip-${n}`
// row component); the bijection gate fails on any mismatch.

import type { LessonManifest } from "../manifestTypes";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./layout";
import { kptestFirstSecondThirdCues } from "../kptestFirstSecondThirdLessonTimeline";

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kptest-first-second-third",
  composition: "CompleteKptestFirstSecondThirdLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kptestFirstSecondThirdCues,
  elements: [
    { id: "intro-card", zone: "labels" },
    { id: "flag", zone: "objects" },
    { id: "animal-1", zone: "objects" },
    { id: "animal-2", zone: "objects" },
    { id: "animal-3", zone: "objects" },
    { id: "chip-1", zone: "labels" },
    { id: "chip-2", zone: "labels" },
    { id: "chip-3", zone: "labels" },
  ],
};
