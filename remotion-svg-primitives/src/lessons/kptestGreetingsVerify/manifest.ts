// kptest-greetings-verify — METADATA-ONLY manifest (Batch 5 manifest auto-derive).
//
// Declares only which elements are load-bearing and their zone; the measured
// pass (`lesson:check`) reads each box off the render (getBBox). No bboxAt — the
// geometry is not mirrored here. Every { id, zone } is tagged once in the scene
// with measureProps("<id>"); the bijection gate fails on any mismatch.
//
// Dropped vs the pre-Batch-5 manifest: `recap-pulse` (a <PulseCircle> ring —
// decoration, now untagged in the scene) and the bboxAt/keyFrames/zones machinery.

import type { LessonManifest } from "../manifestTypes";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./layout";
import { kptestGreetingsVerifyCues } from "../kptestGreetingsVerifyLessonTimeline";

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kptest-greetings-verify",
  composition: "CompleteKptestGreetingsVerifyLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kptestGreetingsVerifyCues,
  elements: [
    { id: "intro-card", zone: "labels" },
    { id: "kid-a", zone: "objects" },
    { id: "kid-b", zone: "objects" },
    { id: "exchange-greet", zone: "objects" },
    { id: "exchange-slow", zone: "objects" },
    { id: "exchange-farewell", zone: "objects" },
    { id: "namecard-sam", zone: "labels" },
    { id: "rah-greet", zone: "labels" },
    { id: "rah-slow", zone: "labels" },
    { id: "rah-choral", zone: "labels" },
    { id: "rah-gap", zone: "labels" },
    { id: "rah-farewell", zone: "labels" },
    { id: "rah-recap", zone: "labels" },
    { id: "recap-kid-a", zone: "objects" },
    { id: "recap-kid-b", zone: "objects" },
  ],
};
