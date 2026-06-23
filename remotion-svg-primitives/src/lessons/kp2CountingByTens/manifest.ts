// kp2-counting-by-tens — METADATA-ONLY manifest (Batch 5 manifest auto-derive).
//
// Declares only which elements are load-bearing and their zone; the measured
// pass (`lesson:check`) reads each box off the render (getBBox). No bboxAt — the
// geometry is not mirrored here. Every { id, zone } is tagged once in the scene
// with measureProps("<id>"): the slow-count badges via `badge-${index}`, the
// sketch marks via `spec.id`, the per-bundle "1" badges as the stable badge-a/b/c.
// The bijection gate fails on any mismatch.
//
// One-stable-id fix (was the source of phantom badge overlaps): the two-tens /
// three-tens "1" badge on each bundle is ONE physical element, so it carries ONE
// stable id (badge-a/b/c) across the transition — not a frame-flipped pair
// (badge-two-a → badge-three-a) that the manifest then had to declare as two
// elements at one position.

import type { LessonManifest, SceneElement } from "../manifestTypes";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./layout";
import { kp2CountingByTensCues } from "../kp2CountingByTensLessonTimeline";

// Slow-count step badges (SlowBadge renders `badge-${index}` for index 0..9).
const slowCountBadges: SceneElement[] = Array.from({ length: 10 }, (_, i) => ({
  id: `badge-${i}`,
  zone: "badges",
}));

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kp2-counting-by-tens",
  composition: "CompleteKp2CountingByTensLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kp2CountingByTensCues,
  elements: [
    { id: "intro-card", zone: "labels" },
    { id: "bundle-a", zone: "objects" },
    { id: "bundle-b", zone: "objects" },
    { id: "bundle-c", zone: "objects" },
    ...slowCountBadges,
    { id: "climax-badge", zone: "badges" },
    // Per-bundle "1" badges — one stable id each across two-tens → three-tens.
    { id: "badge-a", zone: "badges" },
    { id: "badge-b", zone: "badges" },
    { id: "badge-c", zone: "badges" },
    { id: "slow-tally", zone: "tally" },
    { id: "fast-tally", zone: "tally" },
    { id: "label-recall", zone: "labels" },
    { id: "label-two", zone: "labels" },
    { id: "label-three", zone: "labels" },
    { id: "label-takeaway", zone: "labels" },
    { id: "mark-fast-vs-slow-vs", zone: "marks" },
    { id: "mark-recap-geng-kuai-underline", zone: "marks" },
  ],
  allowedOverlaps: [
    // Underlines / marks sit on or under text/shapes intentionally
    ["mark-recap-geng-kuai-underline", "label-takeaway"],
    ["mark-fast-vs-slow-vs", "slow-tally"],
    ["mark-fast-vs-slow-vs", "fast-tally"],
  ],
};
