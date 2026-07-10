// kptest-count-three — METADATA-ONLY manifest. Declares ONLY which elements
// are load-bearing + their zone; NO geometry. The measured pass
// (scripts/lesson-measured.mjs) reads each element's TRUE getBBox off the
// rendered scene (getBBox). The scene tags each declared id's outermost <g>
// with measureProps("<id>") — declared ⟺ measured is a HARD bijection gate.
//
// Element set (one physical <g> carries one STABLE id for its whole life — no
// frame-flipped ids): the 3 apples are ONE group element ("apples"); the 一,二
// per-item count tags are one group ("ord-tags") that recedes together in
// cardinality; the 三 glyph is ONE travelling instance named "total-three"
// (per-apple count tag #3 in count-climb → migrates up + rescales to the
// cardinal total in cardinality — same React instance, identity preserved, no
// cross-fade); the intro card rounds it out. NO your-turn affordance: this
// lesson's storyboard has no learner-response gap (every cue gapFrames=0), so
// there is no wait-time beat to afford — cardinality's reveal IS the landing.
//
// Decoration that carries NO measure tag and is NOT declared: the coral
// converging guide lines (the cardinality consolidation gesture) — chrome,
// sized off the render, never a load-bearing teaching mark.

import type { LessonManifest } from "../manifestTypes";
import { kptestCountThreeCues } from "../kptestCountThreeLessonTimeline";
import { video } from "../../theme";

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kptest-count-three",
  composition: "CompleteKptestCountThreeLesson",
  fps: video.fps,
  width: video.width,
  height: video.height,
  cues: kptestCountThreeCues,
  elements: [
    { id: "intro-card", zone: "labels" },
    { id: "apples", zone: "objects" },
    { id: "ord-tags", zone: "badges" },
    { id: "total-three", zone: "badges" },
  ],
  // No intentional overlaps are declared: every pair of declared elements is
  // either spatially disjoint whenever co-present (apples y≈322–478 vs tags
  // y≈210–306 = ≥14px gap; the three badges sit in distinct apple columns) or
  // time-disjoint (intro-card is intro-only and fades out before the apples
  // enter count-climb; apples are opacity-0 through the intro). The collision
  // gate must read 0 across the sampled frames.
  allowedOverlaps: [],
};
