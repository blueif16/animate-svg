#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const parseArgs = (argv) => {
  const args = { config: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) =>
        char.toUpperCase(),
      );
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      args[key] = value;
      index += 1;
    }
  }
  return args;
};

const mergeConfig = (args) => {
  if (!args.config) {
    throw new Error("Missing required option: --config <path>");
  }
  const config = JSON.parse(fs.readFileSync(args.config, "utf8"));
  return { ...args, lessonId: config.lessonId, fps: config.fps };
};

const toCamel = (kebab) =>
  kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const OVERLAP_RATIO_THRESHOLD = 0.15;
const OPACITY_THRESHOLD = 0.3;

// node 24's native TS stripping conflicts with tsx's ESM hook on .ts modules
// that import via package aliases (@studio/narration-kit). Spawning tsx as a
// child process bypasses the native stripper entirely.
const extractManifest = (camelLessonId) => {
  const stdout = execFileSync(
    "node_modules/.bin/tsx",
    ["scripts/_manifest-extract.ts", camelLessonId],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 64 * 1024 * 1024 },
  );
  return JSON.parse(stdout);
};

const intersectArea = (a, b) => {
  const x1 = Math.max(a[0], b[0]);
  const y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[0] + a[2], b[0] + b[2]);
  const y2 = Math.min(a[1] + a[3], b[1] + b[3]);
  if (x2 <= x1 || y2 <= y1) return 0;
  return (x2 - x1) * (y2 - y1);
};
const bboxArea = (b) => b[2] * b[3];

// STRETCH (prototyped, NOT wired into lesson:check) — audio-breath assertion.
// Catches the "audio jumps straight to the next sentence / no breath at a cue
// boundary" class: every INTERNAL cue boundary (start of cue[i>0]) should have
// a detected silence whose interval contains, or lands within ±N frames of, the
// boundary frame. A boundary with no nearby silence means the TTS ran two cues
// together with no breath.
//
// This is an AUDIO check, not a bbox check — it really belongs in the voice/ASR
// wave (Wave 3) right after detect-silences writes <camelId>Silences.ts, or in
// the Wave 3.5 reconcile that already snaps boundaries to silences
// (src/lessons/<camelId>LessonTimeline.ts findBoundarySilence). Wiring it into
// THIS script needs the reconciled cues + the silences array to cross the tsx
// subprocess boundary; scripts/_manifest-extract.ts (NOT owned by this change)
// currently emits only keyFrames. TODO(extract-boundary): have
// _manifest-extract.ts also emit `cues: manifest.cues` and load+emit the
// `<camelId>Silences` array, then call assertAudioBreaths() below from main().
//
// VERIFIED against real fen-yu-he data (9 cues / 24 silences, N=6): 7/8 internal
// boundaries had a breath; boundary before "ordered-column-complete" @frame 954
// had NONE — exactly the defect class above.
const BREATH_TOLERANCE_FRAMES = 6; // ~0.2s @ 30fps
const assertAudioBreaths = (cues, silences, N = BREATH_TOLERANCE_FRAMES) => {
  const hasBreath = (boundary) =>
    silences.some((s) => boundary >= s.startFrame - N && boundary <= s.endFrame + N);
  const warnings = [];
  for (let i = 1; i < cues.length; i += 1) {
    const boundary = cues[i].startFrame;
    if (!hasBreath(boundary)) {
      warnings.push({
        kind: "no-breath",
        cueId: cues[i].id,
        boundaryFrame: boundary,
      });
    }
  }
  return warnings;
};
void assertAudioBreaths; // referenced by TODO above; dormant until wired.

// Keep in sync with src/lessons/manifestTypes.ts ALLOWED_OVERLAPS.
// same-zone (a === b) is NO LONGER blanket-allowed: two DISTINCT load-bearing
// elements sharing a zone and overlapping are a real defect (crammed columns,
// twin/duplicate cards, marks colliding). Only the explicit pairs below — plus
// non-load-bearing "decoration" overlapping itself — are exempt. The caller
// never compares an element to itself (pair loop starts at j = i + 1).
const ALLOWED_OVERLAPS = new Set([
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
  // APEX-STACK: a whole-number card (objects) sitting on the top row of its own
  // decomposition column (labels) is intentional fen-he layout, not crowding
  // (ruling 2026-05-29). Keep in sync with manifestTypes.ts + lesson-measured.mjs.
  // TRADEOFF: also exempts a label genuinely covering a countable elsewhere;
  // narrow to an element-id allow-list if that misdetection class appears.
  "objects:labels",
  "labels:objects",
  "decoration:decoration",
]);
const isZoneOverlapAllowed = (a, b) => {
  if (a === "caption" || b === "caption") return true;
  return ALLOWED_OVERLAPS.has(`${a}:${b}`);
};

const main = () => {
  const parsed = parseArgs(process.argv.slice(2));
  const args = mergeConfig(parsed);
  if (!args.lessonId) {
    throw new Error(`pipeline.json missing lessonId: ${args.config}`);
  }
  const camelId = toCamel(args.lessonId);
  const manifestRel = path.join("src", "lessons", camelId, "manifest.ts");
  if (!fs.existsSync(path.resolve(process.cwd(), manifestRel))) {
    throw new Error(
      `Manifest module not found: ${manifestRel}. Lesson scene must export LESSON_MANIFEST from src/lessons/${camelId}/manifest.ts`,
    );
  }

  console.log(`\n== Extract manifest (${manifestRel})`);
  const extracted = extractManifest(camelId);

  // caption-safe-region (LIVE). The caption ribbon is the bottom-anchored band
  // where LessonCaptionLayer draws text; a teaching element (objects / labels /
  // badges / tally) intruding into it is the "caption-vs-column" overlap class.
  // The band geometry lives in the lesson's layout (ZONES.caption) and is
  // exported on the manifest as `manifest.zones.caption`, forwarded across the
  // tsx subprocess boundary by scripts/_manifest-extract.ts.
  //
  // Lesson-agnostic: we never fabricate a band. Manifests that do not declare
  // `zones.caption` leave `captionBand` null and this check no-ops (older
  // manifests stay valid). For 2-line captions, widen the band by setting a
  // taller ZONES.caption in the lesson layout; the check reads whatever band is
  // declared.
  const captionBand = extracted.zones?.caption ?? null;
  const CAPTION_INTRUSION_ZONES = new Set(["objects", "labels", "badges", "tally"]);

  const reportKeyFrames = [];
  let totalCollisions = 0;
  let totalWarnings = 0;
  for (const kf of extracted.keyFrames) {
    const collisions = [];
    const warnings = [];
    const els = kf.elements;
    for (let i = 0; i < els.length; i += 1) {
      for (let j = i + 1; j < els.length; j += 1) {
        const a = els[i];
        const b = els[j];
        if (a.opacity <= OPACITY_THRESHOLD || b.opacity <= OPACITY_THRESHOLD) continue;
        if (isZoneOverlapAllowed(a.zone, b.zone)) continue;
        const overlap = intersectArea(a.bbox, b.bbox);
        if (overlap <= 0) continue;
        const minArea = Math.min(bboxArea(a.bbox), bboxArea(b.bbox));
        if (minArea <= 0) continue;
        const ratio = overlap / minArea;
        if (ratio > OVERLAP_RATIO_THRESHOLD) {
          collisions.push({
            keyFrameId: kf.id,
            frame: kf.frame,
            a: a.id,
            b: b.id,
            zoneA: a.zone,
            zoneB: b.zone,
            overlapArea: overlap,
            ratio: Number(ratio.toFixed(3)),
          });
        }
      }
    }
    // caption-safe-region: any teaching element intruding into the ribbon band.
    if (captionBand) {
      for (const el of els) {
        if (el.opacity <= OPACITY_THRESHOLD) continue;
        if (!CAPTION_INTRUSION_ZONES.has(el.zone)) continue;
        const overlap = intersectArea(el.bbox, captionBand);
        if (overlap <= 0) continue;
        const ratio = overlap / bboxArea(el.bbox);
        if (ratio > OVERLAP_RATIO_THRESHOLD) {
          warnings.push({
            kind: "caption-intrusion",
            keyFrameId: kf.id,
            frame: kf.frame,
            element: el.id,
            zone: el.zone,
            ratio: Number(ratio.toFixed(3)),
          });
        }
      }
    }
    totalCollisions += collisions.length;
    totalWarnings += warnings.length;
    reportKeyFrames.push({ ...kf, collisions, warnings });
  }

  const outDir = path.resolve(process.cwd(), "out", args.lessonId);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "bbox-manifest.json");
  const payload = {
    lesson: args.lessonId,
    fps: extracted.fps ?? args.fps,
    generatedAt: new Date().toISOString(),
    keyFrames: reportKeyFrames,
    summary: {
      collisionCount: totalCollisions,
      warningCount: totalWarnings,
      keyFramesScanned: reportKeyFrames.length,
      captionSafeRegionChecked: Boolean(captionBand),
    },
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));

  console.log(`\n== bbox manifest`);
  for (const kf of reportKeyFrames) {
    console.log(
      `  ${kf.id.padEnd(28)} frame=${String(kf.frame).padStart(5)}  collisions=${kf.collisions.length}`,
    );
    for (const c of kf.collisions) {
      console.log(
        `      ! ${c.a} (${c.zoneA}) ∩ ${c.b} (${c.zoneB})  overlap/minArea=${c.ratio}`,
      );
    }
    for (const w of kf.warnings) {
      console.log(
        `      ⚠ ${w.element} (${w.zone}) intrudes caption ribbon  overlap/area=${w.ratio}`,
      );
    }
  }
  if (!captionBand) {
    console.log(
      `  (caption-safe-region check skipped: manifest declares no zones.caption band)`,
    );
  }
  console.log(
    `\n${reportKeyFrames.length} keyframes scanned, ${totalCollisions} collisions, ${totalWarnings} warnings`,
  );
  console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
};

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
