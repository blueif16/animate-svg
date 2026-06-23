// Lesson manifest contract — METADATA-ONLY (Batch 5 manifest auto-derive).
//
// A lesson manifest is a PURE TS module that exports `LESSON_MANIFEST`. It
// declares ONLY which elements are load-bearing and their zone — NOT their
// geometry. The measured pass (`scripts/lesson-measured.mjs`) reads each box off
// the rendered scene (getBBox). One source of geometry truth: layout.ts feeds
// the scene; the box is read back from the render, never mirrored here in a
// `bboxAt`. Each `{ id, zone }` is tagged once in the scene with
// measureProps("<id>") — the bijection gate enforces declared ⟺ measured.

import type { AlignedLessonCue } from "@studio/narration-kit";

export type ZoneName =
  | "objects" // sticks, bundle, countables — the teaching object
  | "badges" // count step indicators above objects
  | "tally" // step-tally pills (10 步, 1 步)
  | "labels" // text labels (一个十, peek 10, takeaway)
  | "caption" // caption ribbon (handled by LessonCaptionLayer, ignored here)
  | "marks" // sketch ink, full-bleed allowed
  | "decoration"; // background / non-load-bearing chrome — no collision rules

// [x, y, width, height] in composition pixel space (top-left origin).
export type Bbox = readonly [number, number, number, number];

// A load-bearing element: its id (== the scene's measureProps id) and its zone.
// No geometry — the measured pass supplies the box from the render.
export type SceneElement = {
  id: string;
  zone: ZoneName;
};

export type LessonManifest = {
  lessonId: string;
  composition: string;
  fps: number;
  width: number;
  height: number;
  cues: readonly AlignedLessonCue[];
  elements: readonly SceneElement[];
  zones?: Partial<Record<ZoneName, Bbox>>;
  // Intentional element overlaps, declared per element-id pair with the
  // manifest (e.g. the apex-stack whole-card on its own decomposition column).
  // Zone tags NEVER grant a collision exemption.
  allowedOverlaps?: ReadonlyArray<readonly [string, string]>;
};

// Which zone pairs may overlap without being flagged.
// marks ∩ objects is explicitly allowed (marks trace over teaching objects).
// Everything else is flagged when overlap_area / min(bbox_area) > threshold.
//
// NOTE: same-zone (a === b) is NO LONGER blanket-allowed. Two DISTINCT
// load-bearing elements that share a zone and overlap are a real defect
// (crammed column diagrams, twin/duplicate cards, two marks fighting over the
// same glyph). Only the explicitly-listed pairs below — plus the non-load-
// bearing "decoration" zone overlapping itself — are exempt. The caller is
// responsible for never comparing an element to itself.
// THE CANONICAL allowed-zone-pair list. This module is the SINGLE source of
// truth: the collision script (scripts/lesson-measured.mjs) runs under plain
// node and cannot import this .ts, so it receives this list FORWARDED through
// its tsx extractor's stdout (scripts/_measured-extract.ts imports this module).
// No script keeps its own copy — edit ONLY here.
export const ALLOWED_OVERLAP_PAIRS: readonly string[] = [
  "marks:objects",
  "objects:marks",
  "marks:badges",
  "badges:marks",
  "decoration:objects",
  "objects:decoration",
  "decoration:badges",
  "badges:decoration",
  "decoration:tally",
  "tally:decoration",
  "decoration:labels",
  "labels:decoration",
  "decoration:marks",
  "marks:decoration",
  // APEX-STACK (objects ∩ labels) is NO LONGER blanket-exempt. The predicted
  // misdetection class appeared (kptest-fenyuhe-six: question text ON the
  // dots, tagged labels:objects, both collision passes vacuously green) — an
  // intentional overlap (e.g. the apex-stack ruling 2026-05-29) is now
  // declared per element-id PAIR via LessonManifest.allowedOverlaps.
  // decoration is explicitly non-load-bearing chrome (see ZoneName) — it may
  // overlap itself freely. Every OTHER same-zone pair is now flagged.
  "decoration:decoration",
];

const ALLOWED_OVERLAPS = new Set<string>(ALLOWED_OVERLAP_PAIRS);

export const isZoneOverlapAllowed = (a: ZoneName, b: ZoneName): boolean => {
  if (a === "caption" || b === "caption") {
    return true;
  }
  return ALLOWED_OVERLAPS.has(`${a}:${b}`);
};

export const intersectArea = (a: Bbox, b: Bbox): number => {
  const x1 = Math.max(a[0], b[0]);
  const y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[0] + a[2], b[0] + b[2]);
  const y2 = Math.min(a[1] + a[3], b[1] + b[3]);
  if (x2 <= x1 || y2 <= y1) {
    return 0;
  }
  return (x2 - x1) * (y2 - y1);
};

export const bboxArea = (b: Bbox): number => b[2] * b[3];
