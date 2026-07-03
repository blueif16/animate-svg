// kptest-count-to-two — METADATA-ONLY manifest (Batch 5 manifest auto-derive).
//
// Declares only which elements are load-bearing and their zone; the measured
// pass (`lesson:check`) reads each box off the render (getBBox). No bboxAt —
// the geometry is not mirrored here. Every { id, zone } is tagged once in the
// scene with measureProps("<id>"); the bijection gate fails on any mismatch.
//
// Registered = the load-bearing teaching marks (visual-design §3 Visual
// Contract). Decoration — the per-cue Sparkle accent, the cardinal's breathing
// pulse — is NOT registered and carries no measure tag.
//
// Each apple is ONE element with ONE stable id across its whole life (apple-1,
// apple-2 — never re-id'd on cue boundary). Each per-apple tag is ONE element
// with ONE stable id (tag-1, tag-2) — id never frame-flips (e.g. tag-1 in C2
// becoming tag-1-dimmed in C4). The cardinal NumberCard value=2 is ONE
// element, lives only in C4 onward.

import type { LessonManifest } from "../manifestTypes";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./layout";
import { kptestCountToTwoCues } from "../kptestCountToTwoLessonTimeline";

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kptest-count-to-two",
  composition: "CompleteKptestCountToTwoLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kptestCountToTwoCues,
  elements: [
    { id: "intro-card", zone: "labels" },
    { id: "apple-1", zone: "objects" },
    { id: "apple-2", zone: "objects" },
    { id: "tag-1", zone: "badges" },
    { id: "tag-2", zone: "badges" },
    { id: "cardinal", zone: "labels" },
  ],
};