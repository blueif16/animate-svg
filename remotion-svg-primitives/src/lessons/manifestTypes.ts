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

// ───────────────────────────────────────────────────────────────────────────
// LEGIBILITY & SAFE-AREA constants (vendor-study opportunity #4).
//
// The field publishes concrete-but-advisory numbers — key text ≥80px from the
// sides / ≥100px top-bottom, and 84/44/32px type floors at a 1080px reference
// width, everything WIDTH-scaled (research §2 L4: `vendor/skills/.../rules/
// video-layout.md:15,44-48`; RemotionUI getSafeAreaPadding()/scaleFont()).
// Upstream keeps them prose-only; this repo is the only one with a measured
// gate that can RUN them.
//
// This module is the SINGLE SOURCE OF TRUTH. The measured pass runs under plain
// node and cannot import this .ts, so `scripts/_measured-extract.ts` (which does
// import it, under tsx) FORWARDS these raw numbers to `scripts/lesson-measured.mjs`
// exactly as it already forwards ALLOWED_OVERLAP_PAIRS — the gate script keeps
// NO copy of the numbers (only the width-scaling arithmetic, mirrored the same
// way intersectArea is). Values are REFERENCE pixels at REFERENCE_WIDTH; the gate
// scales each by the real composition width so a non-1080 canvas (ours is 1280)
// inherits the same proportions, never a bare hardcode.
// ───────────────────────────────────────────────────────────────────────────

// The reference canvas width the field's numbers are quoted at (1080px).
export const REFERENCE_WIDTH = 1080;

// Minimum inset of key text from the canvas edges, in REFERENCE px @1080w.
// Everything scales with WIDTH per L4 ("80/1080 * width"), including top/bottom.
export const SAFE_AREA = {
  side: 80, // ≥80px from left/right edges
  topBottom: 100, // ≥100px from top/bottom edges
} as const;

// Per-role minimum RENDERED text size, in REFERENCE px @1080w (L4).
export const TYPE_FLOORS = {
  headline: 84,
  supporting: 44,
  label: 32,
  mobile: 48,
} as const;

export type TypeRole = keyof typeof TYPE_FLOORS;

// Which manifest zones carry LOAD-BEARING TEXT, and each one's type-floor role.
// The measured legibility gate checks ONLY these zones (objects/marks/decoration
// are not text and are never legibility-checked); a zone absent here is not text.
// This same set defines the caption/label "hard-kill" zones (opportunity #13):
// any text element that disappears must vanish cleanly at the cue boundary.
export const TEXT_ZONE_ROLE: Partial<Record<ZoneName, TypeRole>> = {
  labels: "label",
  badges: "supporting",
  tally: "label",
  caption: "label",
};

// REFERENCE px → composition px, scaled by WIDTH (L4: "80/1080 * width").
export const scaleToWidth = (refPx: number, width: number): number =>
  (refPx / REFERENCE_WIDTH) * width;

// The safe rectangle [x, y, w, h] in composition px for a canvas. Key text must
// sit fully inside it.
export const safeRect = (width: number, height: number): Bbox => {
  const side = scaleToWidth(SAFE_AREA.side, width);
  const topBottom = scaleToWidth(SAFE_AREA.topBottom, width);
  return [side, topBottom, width - side * 2, height - topBottom * 2];
};

// A bbox is inside the safe rect when all four edges are within it (a small
// epsilon absorbs sub-pixel getBBox noise).
export const isInsideSafeRect = (
  box: Bbox,
  width: number,
  height: number,
  epsilon = 1,
): boolean => {
  const [sx, sy, sw, sh] = safeRect(width, height);
  return (
    box[0] >= sx - epsilon &&
    box[1] >= sy - epsilon &&
    box[0] + box[2] <= sx + sw + epsilon &&
    box[1] + box[3] <= sy + sh + epsilon
  );
};

// The rendered-text-size floor (composition px) for a zone at a given width, or
// null when the zone is not load-bearing text.
export const typeFloorForZone = (
  zone: ZoneName,
  width: number,
): number | null => {
  const role = TEXT_ZONE_ROLE[zone];
  return role ? scaleToWidth(TYPE_FLOORS[role], width) : null;
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
