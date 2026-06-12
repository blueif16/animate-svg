#!/usr/bin/env node
// Opt-in MEASURED verification pass (machine-gated-verification proposal §2–§5).
// LESSON-AGNOSTIC: no lesson topic, id, path, or frame literal is hardcoded.
// Invoked by scripts/lesson-check.mjs --measured AFTER the fast linear pass.
//
// What it does (proposal §2.1, §3, §4):
//   1. Bundle the Remotion entry once, select the lesson composition.
//   2. Derive PEAK-AWARE sample frames from the reconciled timeline cues
//      (entrance + [4,8,12,18] on top of the existing cue-% keyframes — §3.1).
//   3. renderStill each peak frame with inputProps.__measure=true so the
//      lesson-agnostic measure hook logs every [data-mid] element's TRUE,
//      transform-aware getBBox() in composition px. Capture via onBrowserLog.
//   4. Run the SAME AABB + ratio overlap math as scripts/lesson-manifest.mjs
//      (OVERLAP_RATIO_THRESHOLD 0.15) on the MEASURED bboxes.
//   5. Four cheap gates on the same data: LUFS, caption-redundancy, contrast,
//      legibility. Plus motion-too-fast as WARN-ONLY.
//   6. AUGMENT out/<id>/bbox-manifest.json with a new `measured` block —
//      leaving the existing keyFrames/summary shape untouched (§4.2).
//
// Advisory: a gate that can't run prints SKIP:<reason> (never silent); the
// process exits 0 even on WARN.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

// @remotion/bundler + @remotion/renderer are TRANSITIVE deps (via @remotion/cli)
// — hoisted into node_modules but not direct package.json entries, so a bare
// dynamic import from this subdirectory module fails to resolve. Resolve them
// against the project-root package.json (cwd), then import by absolute path.
const requireFromRoot = createRequire(
  pathToFileURL(path.join(process.cwd(), "package.json")),
);
const importFromRoot = async (specifier) => {
  const resolved = requireFromRoot.resolve(specifier);
  return import(pathToFileURL(resolved).href);
};

// ---------------------------------------------------------------------------
// Shared constants (kept in sync with scripts/lesson-manifest.mjs).
// ---------------------------------------------------------------------------
const OVERLAP_RATIO_THRESHOLD = 0.15;
const OPACITY_THRESHOLD = 0.3;

// Gate thresholds (proposal §4). Advisory.
const LUFS_TARGET = -16;
const LUFS_TOLERANCE = 1; // -16 ± 1 LUFS
const TRUE_PEAK_MAX = -1.0; // dBFS
const CAPTION_REDUNDANCY_WARN = 0.6; // jaccard > this warns (non-literacy)
const CONTRAST_MIN = 4.5; // WCAG AA normal text
const LEGIBILITY_MIN_PX = 24; // min glyph height for a 6yo

// Peak-aware entrance offsets layered on top of manifest cue-% keyframes (§3.1).
// Covers spring/easing overshoot ringing that 50%/80% sampling misses.
const ENTRANCE_PEAK_OFFSETS = [4, 8, 12, 18];

// Literacy / pinyin lessons legitimately show the spoken syllables as captions,
// so caption≈narration is EXPECTED, not clutter — exempt them (proposal §4).
const isLiteracyLesson = (lessonId) =>
  /pinyin|literacy|hanzi|tone|phon/iu.test(lessonId);

// ---------------------------------------------------------------------------
// Arg parsing (mirrors the sibling scripts).
// ---------------------------------------------------------------------------
const parseArgs = (argv) => {
  const args = { config: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
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

const toCamel = (kebab) =>
  kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

// ---------------------------------------------------------------------------
// AABB overlap math — IDENTICAL to scripts/lesson-manifest.mjs.
// ---------------------------------------------------------------------------
const intersectArea = (a, b) => {
  const x1 = Math.max(a[0], b[0]);
  const y1 = Math.max(a[1], b[1]);
  const x2 = Math.min(a[0] + a[2], b[0] + b[2]);
  const y2 = Math.min(a[1] + a[3], b[1] + b[3]);
  if (x2 <= x1 || y2 <= y1) return 0;
  return (x2 - x1) * (y2 - y1);
};
const bboxArea = (b) => b[2] * b[3];

// Keep in sync with scripts/lesson-manifest.mjs ALLOWED_OVERLAPS.
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
  // APEX-STACK (objects:labels) is NO LONGER blanket-exempt — the predicted
  // misdetection class appeared (kptest-fenyuhe-six question-text-on-dots went
  // vacuously green). Intentional overlaps are declared per element-id PAIR on
  // the manifest (`allowedOverlaps`), forwarded by _measured-extract.ts.
  // Keep in sync with manifestTypes.ts ALLOWED_OVERLAPS.
  "decoration:decoration",
]);
const isZoneOverlapAllowed = (a, b) => {
  if (a === "caption" || b === "caption") return true;
  return ALLOWED_OVERLAPS.has(`${a}:${b}`);
};
// Manifest-declared intentional overlaps: element-id pairs, order-insensitive.
// A zone tag never grants a collision exemption — only an explicit pair does.
const buildAllowedPairSet = (pairs) => {
  const set = new Set();
  for (const [a, b] of pairs || []) {
    set.add(`${a}:${b}`);
    set.add(`${b}:${a}`);
  }
  return set;
};

// ---------------------------------------------------------------------------
// tsx subprocess: reconciled cues + per-frame manifest bboxes (lesson-agnostic).
// ---------------------------------------------------------------------------
const extractMeasured = (camelLessonId, frames) => {
  const stdout = execFileSync(
    "node_modules/.bin/tsx",
    ["scripts/_measured-extract.ts", camelLessonId, frames.join(",")],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  return JSON.parse(stdout);
};

// ---------------------------------------------------------------------------
// Peak-aware frame selection (§3.1). For each cue we sample its existing
// cue-% keyframes (mid 50% / late 80%, matching the manifest's relMid/relLate
// convention) PLUS entrance-peak offsets on cue start. De-duped, clamped into
// the cue window. Lesson-agnostic: derived purely from the reconciled cues.
// ---------------------------------------------------------------------------
const derivePeakFrames = (cues) => {
  const set = new Set();
  for (const c of cues) {
    const len = c.endFrame - c.startFrame;
    if (len <= 0) continue;
    const add = (f) => {
      const clamped = Math.max(c.startFrame, Math.min(c.endFrame - 1, Math.round(f)));
      set.add(clamped);
    };
    // existing cue-% keyframes
    add(c.startFrame + len * 0.5);
    add(c.startFrame + len * 0.8);
    // entrance-peak offsets layered on top (defeats easing overshoot)
    for (const off of ENTRANCE_PEAK_OFFSETS) {
      if (off < len) add(c.startFrame + off);
    }
  }
  return Array.from(set).sort((a, b) => a - b);
};

// ---------------------------------------------------------------------------
// Gate: LUFS / true-peak via ffmpeg ebur128 (proposal Exp D1).
// ---------------------------------------------------------------------------
const runLufsGate = (wavPath) => {
  if (!wavPath || !fs.existsSync(wavPath)) {
    return { ran: false, skipReason: `voice wav not found (${wavPath ?? "n/a"})` };
  }
  const res = spawnSync(
    "ffmpeg",
    ["-i", wavPath, "-af", "ebur128=peak=true", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  if (res.error) {
    return { ran: false, skipReason: `ffmpeg unavailable: ${res.error.message}` };
  }
  const full = `${res.stdout ?? ""}\n${res.stderr ?? ""}`;
  // IMPORTANT: parse the trailing "Summary:" block ONLY. The streaming progress
  // lines (`t: ... I: -70.0 LUFS`) report the running integrated loudness, which
  // starts at -70 during the lead-in silence — matching those first would report
  // -70 instead of the true integrated value. The final Summary block format is:
  //   Integrated loudness:
  //     I:         -17.0 LUFS
  //   Loudness range:
  //     LRA:         3.0 LU
  //   True peak:
  //     Peak:       -1.6 dBFS
  const summaryIdx = full.lastIndexOf("Summary:");
  const text = summaryIdx >= 0 ? full.slice(summaryIdx) : full;
  const grab = (re) => {
    const m = text.match(re);
    return m ? Number(m[1]) : null;
  };
  const integrated = grab(/I:\s*(-?\d+(?:\.\d+)?)\s*LUFS/);
  const lra = grab(/LRA:\s*(-?\d+(?:\.\d+)?)\s*LU/);
  // Last "Peak:" in the true-peak section is the integrated true peak.
  const peakMatches = [...text.matchAll(/Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS/g)];
  const truePeak = peakMatches.length
    ? Number(peakMatches[peakMatches.length - 1][1])
    : null;
  if (integrated === null) {
    return { ran: false, skipReason: "could not parse ebur128 integrated loudness" };
  }
  const loudOk = Math.abs(integrated - LUFS_TARGET) <= LUFS_TOLERANCE;
  const peakOk = truePeak === null ? true : truePeak <= TRUE_PEAK_MAX;
  const notes = [];
  if (!loudOk) {
    notes.push(
      `${(integrated - LUFS_TARGET).toFixed(1)} LU off ${LUFS_TARGET} target`,
    );
  }
  if (truePeak !== null && truePeak > TRUE_PEAK_MAX - 1 && peakOk) {
    notes.push(`true peak ${truePeak} near ${TRUE_PEAK_MAX} ceiling`);
  }
  return {
    ran: true,
    integrated,
    lra,
    truePeak,
    pass: loudOk && peakOk,
    note: notes.join("; ") || null,
  };
};

// ---------------------------------------------------------------------------
// Gate: caption-redundancy — char-set Jaccard caption vs narration per cue
// (proposal Exp D4 / spike redundancy.mjs). EXEMPT literacy/pinyin lessons,
// AND — generally, in ANY lesson/language — read-along ACQUISITION cues.
//
// On a read-along/acquisition beat the child is meant to READ the target phrase
// AS they hear it (e.g. on-screen `五比三多` while the voice says 五比三多), so
// caption == spoken target is CORRECT BY DESIGN, not redundancy. We detect this
// from metadata ALREADY on the cue — no lesson/cue/phrase literal:
//   1. the cue is `emphasis:true` (the author's design-intent acquisition flag
//      on a read-along / pronunciation beat), AND
//   2. the caption IS the literal spoken target — its char-set is a SUBSET of
//      the spoken phrase's char-set (the caption is a slice/repeat of what is
//      spoken, NOT a separate authored label).
// Genuine redundancy — a caption duplicating info shown ELSEWHERE on screen (a
// label/badge/number) on a non-read-along cue — is NOT emphasis-flagged as the
// spoken acquisition target and/or its caption is not a subset of the phrase, so
// it still WARNs. Exempted cues are RECORDED (`exempt: "read-along-target"`),
// never silently dropped.
// ---------------------------------------------------------------------------
const READ_ALONG_EXEMPT = "read-along-target";

const runRedundancyGate = (cues, lessonId) => {
  if (isLiteracyLesson(lessonId)) {
    return { ran: false, skipReason: `literacy/pinyin lesson — caption≈narration expected (${lessonId})` };
  }
  const strip = (s) => (s || "").replace(/[，。！？、,.!?\s·]/gu, "");
  const rows = [];
  for (const c of cues) {
    if (!c.caption || !c.phrase) continue;
    const cap = strip(c.caption);
    const nar = strip(c.phrase);
    const sCap = new Set(cap);
    const sNar = new Set(nar);
    let inter = 0;
    for (const ch of sCap) if (sNar.has(ch)) inter += 1;
    const union = new Set([...sCap, ...sNar]).size || 1;
    const jaccard = Number((inter / union).toFixed(2));
    // Read-along acquisition exemption: caption IS the spoken target on an
    // author-flagged pronunciation/read-along beat — design intent, not clutter.
    const captionIsSpokenTarget =
      sCap.size > 0 && [...sCap].every((ch) => sNar.has(ch)); // caption ⊆ phrase
    const exempt = c.emphasis === true && captionIsSpokenTarget;
    if (exempt) {
      rows.push({ cueId: c.id, jaccard, pass: true, exempt: READ_ALONG_EXEMPT });
    } else {
      rows.push({ cueId: c.id, jaccard, pass: jaccard <= CAPTION_REDUNDANCY_WARN });
    }
  }
  if (rows.length === 0) {
    return { ran: false, skipReason: "no cues carry both caption and phrase" };
  }
  return { ran: true, rows };
};

// ---------------------------------------------------------------------------
// Pixel helpers (sharp) for contrast + legibility, reusing spike gates.mjs.
// ---------------------------------------------------------------------------
const relLuminance = ([r, g, b]) => {
  const f = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrastRatio = (fg, bg) => {
  const Lf = relLuminance(fg);
  const Lb = relLuminance(bg);
  return (Math.max(Lf, Lb) + 0.05) / (Math.min(Lf, Lb) + 0.05);
};

// Sample a text element's glyph centroid vs its local background within its
// measured-bbox crop. Background = the modal corner pixel; foreground = the
// darkest-vs-bg pixel (the ink). Returns null if the crop is empty/off-frame.
const sampleContrast = async (sharp, pngPath, bbox, width, height) => {
  const margin = 6;
  const left = Math.max(0, Math.round(bbox[0] - margin));
  const top = Math.max(0, Math.round(bbox[1] - margin));
  const right = Math.min(width, Math.round(bbox[0] + bbox[2] + margin));
  const bottom = Math.min(height, Math.round(bbox[1] + bbox[3] + margin));
  const w = right - left;
  const h = bottom - top;
  if (w <= 1 || h <= 1) return null;
  const { data, info } = await sharp(pngPath)
    .extract({ left, top, width: w, height: h })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const bg = [data[0], data[1], data[2]];
  let darkest = bg;
  let dl = relLuminance(bg);
  for (let i = 0; i < data.length; i += ch) {
    const p = [data[i], data[i + 1], data[i + 2]];
    const l = relLuminance(p);
    if (l < dl) {
      dl = l;
      darkest = p;
    }
  }
  return contrastRatio(darkest, bg);
};

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config) throw new Error("Missing required option: --config <path>");
  const config = JSON.parse(fs.readFileSync(args.config, "utf8"));
  const lessonId = config.lessonId;
  if (!lessonId) throw new Error(`pipeline.json missing lessonId: ${args.config}`);
  const camelId = toCamel(lessonId);
  const composition = config.composition;
  const entry = config.entry ?? "src/index.ts";

  console.log(`\n${"=".repeat(60)}`);
  console.log(`MEASURED verification pass — ${lessonId}`);
  console.log("=".repeat(60));

  const ranAt = new Date().toISOString();
  const gateLines = [];
  const measured = {
    ranAt,
    method: "getBBox",
    skippedReason: null,
    framesSampled: [],
    bundleMs: null,
    perFrameMs: null,
    elements: [],
    collisionsMeasured: [],
    gates: {},
  };

  // --- Extract reconciled cues + per-frame manifest bboxes (peak frames) -----
  // First a cheap pull with NO frames to get the cue list, then derive peaks.
  const cueOnly = extractMeasured(camelId, []);
  const peakFrames = derivePeakFrames(cueOnly.cues);
  measured.framesSampled = peakFrames;
  const extracted = extractMeasured(camelId, peakFrames);
  const width = extracted.width ?? 1280;
  const height = extracted.height ?? 720;
  const allowedPairs = buildAllowedPairSet(extracted.allowedOverlaps);

  // --- SSR: bundle once, renderStill each peak frame with __measure flag -----
  const sharpMod = await import("sharp");
  const sharp = sharpMod.default;

  const outDir = path.resolve(process.cwd(), "out", lessonId);
  fs.mkdirSync(outDir, { recursive: true });
  const framesDir = path.join(outDir, "measured-frames");

  // measured bbox by frame: { [frame]: { [id]: bbox } }
  const measuredByFrame = {};

  // SSR strategy. Bundle once via @remotion/bundler, then drive renderStill via
  // @remotion/renderer — the only path that exposes onBrowserLog (the geometry
  // truth channel). Both are TRANSITIVE deps (via @remotion/cli); we resolve
  // them against the project-root package.json so the bare-specifier import
  // resolves from this subdir module.
  let bundler;
  let renderer;
  try {
    bundler = await importFromRoot("@remotion/bundler");
    renderer = await importFromRoot("@remotion/renderer");
  } catch (error) {
    measured.method = "skipped";
    measured.skippedReason = `remotion SSR modules unavailable: ${error.message || error}`;
    gateLines.push(`SKIP: overlap-measured — ${measured.skippedReason}`);
  }

  let serveUrl = null;
  if (bundler && renderer) {
    const tBundle = Date.now();
    try {
      serveUrl = await bundler.bundle({
        entryPoint: path.resolve(process.cwd(), entry),
      });
    } catch (error) {
      bundler = null;
      renderer = null;
      measured.method = "skipped";
      measured.skippedReason = `remotion bundle failed: ${error.message || error}`;
      gateLines.push(`SKIP: overlap-measured — ${measured.skippedReason}`);
    }
    measured.bundleMs = Date.now() - tBundle;
  }

  if (renderer && serveUrl) {
    fs.mkdirSync(framesDir, { recursive: true });
    const comp = await renderer.selectComposition({
      serveUrl,
      id: composition,
      inputProps: { __measure: true },
    });

    const perFrame = [];
    for (const frame of peakFrames) {
      const t0 = Date.now();
      const captured = [];
      await renderer.renderStill({
        composition: comp,
        serveUrl,
        output: path.join(framesDir, `f${frame}.png`),
        frame,
        imageFormat: "png",
        inputProps: { __measure: true },
        onBrowserLog: (log) => {
          const idx = log.text.indexOf("MEASURE_BBOX ");
          if (idx >= 0) {
            try {
              captured.push(...JSON.parse(log.text.slice(idx + "MEASURE_BBOX ".length)));
            } catch {
              // ignore malformed line
            }
          }
        },
      });
      perFrame.push(Date.now() - t0);
      const byId = {};
      // last log wins (the hook logs once per frame after layout commit)
      for (const m of captured) byId[m.id] = m.bbox;
      measuredByFrame[frame] = byId;
    }
    measured.perFrameMs = perFrame.length
      ? Math.round(perFrame.reduce((a, b) => a + b, 0) / perFrame.length)
      : null;
  }

  // --- Join measured bboxes to manifest, diff, and run overlap math ----------
  // zone lookup per element id from the manifest snapshots.
  const zoneOf = {};
  for (const frame of peakFrames) {
    for (const el of extracted.manifestByFrame[frame] || []) {
      zoneOf[el.id] = el.zone;
    }
  }

  if (measured.method === "getBBox") {
    for (const frame of peakFrames) {
      const measuredIds = measuredByFrame[frame] || {};
      const manifestEls = extracted.manifestByFrame[frame] || [];
      const manifestById = Object.fromEntries(manifestEls.map((e) => [e.id, e]));

      // record per-element divergence (manifest LINEAR vs measured TRUE)
      for (const [id, mbbox] of Object.entries(measuredIds)) {
        const man = manifestById[id];
        const entry = { id, frame, measuredBbox: mbbox.map((n) => Number(n.toFixed(2))) };
        if (man) {
          entry.manifestBbox = man.bbox.map((n) => Number(Number(n).toFixed(2)));
          entry.divergencePx = {
            dWidth: Number((mbbox[2] - man.bbox[2]).toFixed(2)),
            dHeight: Number((mbbox[3] - man.bbox[3]).toFixed(2)),
          };
        }
        measured.elements.push(entry);
      }

      // SAME AABB + ratio overlap math as lesson-manifest.mjs, on MEASURED set.
      // Use measured bbox when present; fall back to manifest bbox so an element
      // without a data-mid tag still participates (advisory).
      const ids = new Set([...Object.keys(measuredIds), ...manifestEls.map((e) => e.id)]);
      const list = [...ids].map((id) => {
        const man = manifestById[id];
        return {
          id,
          zone: zoneOf[id] ?? man?.zone ?? "decoration",
          bbox: measuredIds[id] ?? man?.bbox ?? null,
          opacity: man ? man.opacity : 1, // measured elements are mounted (opacity≈1)
          measured: Boolean(measuredIds[id]),
        };
      }).filter((e) => e.bbox);

      for (let i = 0; i < list.length; i += 1) {
        for (let j = i + 1; j < list.length; j += 1) {
          const a = list[i];
          const b = list[j];
          if (a.opacity <= OPACITY_THRESHOLD || b.opacity <= OPACITY_THRESHOLD) continue;
          if (isZoneOverlapAllowed(a.zone, b.zone)) continue;
          if (allowedPairs.has(`${a.id}:${b.id}`)) continue; // manifest-declared intentional pair
          const overlap = intersectArea(a.bbox, b.bbox);
          if (overlap <= 0) continue;
          const minArea = Math.min(bboxArea(a.bbox), bboxArea(b.bbox));
          if (minArea <= 0) continue;
          const ratio = overlap / minArea;
          if (ratio > OVERLAP_RATIO_THRESHOLD) {
            measured.collisionsMeasured.push({
              frame,
              a: a.id,
              b: b.id,
              zoneA: a.zone,
              zoneB: b.zone,
              ratio: Number(ratio.toFixed(3)),
              measuredPair: a.measured && b.measured,
            });
          }
        }
      }
    }
    const n = measured.collisionsMeasured.length;
    gateLines.push(
      `${n === 0 ? "PASS" : "WARN"}: overlap-measured — ${n} measured collision(s) (linear path missed)`,
    );
  }

  // --- Gate: LUFS ------------------------------------------------------------
  const wavPath = config.voice?.out
    ? path.resolve(process.cwd(), config.voice.out)
    : null;
  const lufs = runLufsGate(wavPath);
  if (!lufs.ran) {
    measured.gates.lufs = { skipped: lufs.skipReason };
    gateLines.push(`SKIP: lufs — ${lufs.skipReason}`);
  } else {
    measured.gates.lufs = {
      integrated: lufs.integrated,
      truePeak: lufs.truePeak,
      lra: lufs.lra,
      pass: lufs.pass,
      note: lufs.note,
    };
    gateLines.push(
      `${lufs.pass ? "PASS" : "WARN"}: lufs — I=${lufs.integrated} LUFS, truePeak=${lufs.truePeak} dBFS${lufs.note ? ` (${lufs.note})` : ""}`,
    );
  }

  // --- Gate: caption-redundancy ---------------------------------------------
  const redundancy = runRedundancyGate(extracted.cues, lessonId);
  if (!redundancy.ran) {
    measured.gates.captionRedundancy = { skipped: redundancy.skipReason };
    gateLines.push(`SKIP: caption-redundancy — ${redundancy.skipReason}`);
  } else {
    measured.gates.captionRedundancy = redundancy.rows;
    const failing = redundancy.rows.filter((r) => !r.pass);
    const exempted = redundancy.rows.filter((r) => r.exempt);
    gateLines.push(
      `${failing.length === 0 ? "PASS" : "WARN"}: caption-redundancy — ${failing.length}/${redundancy.rows.length} cue(s) jaccard>${CAPTION_REDUNDANCY_WARN}${exempted.length ? ` (${exempted.length} read-along-target exempt)` : ""}`,
    );
  }

  // --- Gate: contrast + legibility (need rendered frames + measured bboxes) ---
  if (measured.method !== "getBBox" || Object.keys(measuredByFrame).length === 0) {
    measured.gates.contrast = { skipped: "no measured frames (SSR unavailable)" };
    measured.gates.legibility = { skipped: "no measured frames (SSR unavailable)" };
    gateLines.push(`SKIP: contrast — no measured frames (SSR unavailable)`);
    gateLines.push(`SKIP: legibility — no measured frames (SSR unavailable)`);
  } else {
    // text/label elements only (zone "labels"). One sample per id at the frame
    // where it is largest (most legible reading of its rendered glyphs).
    const labelSamples = {};
    for (const frame of peakFrames) {
      for (const [id, bbox] of Object.entries(measuredByFrame[frame] || {})) {
        if ((zoneOf[id] ?? "") !== "labels") continue;
        const area = bbox[2] * bbox[3];
        if (!labelSamples[id] || area > labelSamples[id].area) {
          labelSamples[id] = { frame, bbox, area };
        }
      }
    }
    const contrastRows = [];
    const legibilityRows = [];
    for (const [id, s] of Object.entries(labelSamples)) {
      const pngPath = path.join(framesDir, `f${s.frame}.png`);
      const glyphPx = Number(s.bbox[3].toFixed(1));
      legibilityRows.push({
        id,
        frame: s.frame,
        glyphPx,
        pass: glyphPx >= LEGIBILITY_MIN_PX,
      });
      if (fs.existsSync(pngPath)) {
        try {
          const ratio = await sampleContrast(sharp, pngPath, s.bbox, width, height);
          if (ratio !== null) {
            contrastRows.push({
              id,
              frame: s.frame,
              ratio: Number(ratio.toFixed(2)),
              pass: ratio >= CONTRAST_MIN,
            });
          }
        } catch {
          // skip a single unreadable crop without failing the gate
        }
      }
    }
    if (contrastRows.length === 0) {
      measured.gates.contrast = { skipped: "no label elements with data-mid sampled" };
      gateLines.push(`SKIP: contrast — no label elements with data-mid sampled`);
    } else {
      measured.gates.contrast = contrastRows;
      const failing = contrastRows.filter((r) => !r.pass);
      gateLines.push(
        `${failing.length === 0 ? "PASS" : "WARN"}: contrast — ${failing.length}/${contrastRows.length} below ${CONTRAST_MIN}:1`,
      );
    }
    if (legibilityRows.length === 0) {
      measured.gates.legibility = { skipped: "no label elements with data-mid sampled" };
      gateLines.push(`SKIP: legibility — no label elements with data-mid sampled`);
    } else {
      measured.gates.legibility = legibilityRows;
      const failing = legibilityRows.filter((r) => !r.pass);
      gateLines.push(
        `${failing.length === 0 ? "PASS" : "WARN"}: legibility — ${failing.length}/${legibilityRows.length} below ${LEGIBILITY_MIN_PX}px`,
      );
    }
  }

  // --- Gate: motion-too-fast (WARN-ONLY, no hard threshold yet — proposal §4) -
  // Per-frame centroid delta of measured elements between consecutive sampled
  // frames. We print the max centroid jump; only an ABSURD jump warns. No fail.
  if (measured.method === "getBBox" && Object.keys(measuredByFrame).length >= 2) {
    const centroid = (byId) => {
      const vals = Object.values(byId);
      if (vals.length === 0) return null;
      let sx = 0;
      let sy = 0;
      for (const b of vals) {
        sx += b[0] + b[2] / 2;
        sy += b[1] + b[3] / 2;
      }
      return { x: sx / vals.length, y: sy / vals.length };
    };
    let maxDelta = 0;
    let maxPair = null;
    for (let i = 1; i < peakFrames.length; i += 1) {
      const a = centroid(measuredByFrame[peakFrames[i - 1]] || {});
      const b = centroid(measuredByFrame[peakFrames[i]] || {});
      if (!a || !b) continue;
      const df = Math.max(1, peakFrames[i] - peakFrames[i - 1]);
      const perFrame = Math.hypot(b.x - a.x, b.y - a.y) / df;
      if (perFrame > maxDelta) {
        maxDelta = perFrame;
        maxPair = [peakFrames[i - 1], peakFrames[i]];
      }
    }
    // No calibrated threshold yet; "absurd" = > 200 px/frame (off-screen jump).
    const absurd = maxDelta > 200;
    measured.gates.motionFast = {
      maxCentroidDeltaPxPerFrame: Number(maxDelta.toFixed(2)),
      framePair: maxPair,
      pass: !absurd,
      note: "WARN-ONLY (no calibrated threshold yet — proposal §4)",
    };
    gateLines.push(
      `${absurd ? "WARN" : "PASS"}: motion-too-fast — max ${maxDelta.toFixed(1)} px/frame${maxPair ? ` @${maxPair[0]}->${maxPair[1]}` : ""} (WARN-ONLY)`,
    );
  } else {
    measured.gates.motionFast = { skipped: "fewer than 2 measured frames" };
    gateLines.push(`SKIP: motion-too-fast — fewer than 2 measured frames`);
  }

  // --- AUGMENT bbox-manifest.json (additive; leave existing shape intact) -----
  const bboxPath = path.join(outDir, "bbox-manifest.json");
  let manifestJson = {};
  if (fs.existsSync(bboxPath)) {
    manifestJson = JSON.parse(fs.readFileSync(bboxPath, "utf8"));
  }
  manifestJson.measured = measured;
  // summary gains measured fields only (existing fields untouched).
  manifestJson.summary = manifestJson.summary || {};
  const gatesFailed = [];
  for (const [name, val] of Object.entries(measured.gates)) {
    if (Array.isArray(val)) {
      if (val.some((r) => r.pass === false)) gatesFailed.push(name);
    } else if (val && val.pass === false) {
      gatesFailed.push(name);
    }
  }
  manifestJson.summary.measuredCollisionCount = measured.collisionsMeasured.length;
  manifestJson.summary.gatesFailed = gatesFailed;
  fs.writeFileSync(bboxPath, JSON.stringify(manifestJson, null, 2));

  // --- Report ----------------------------------------------------------------
  console.log(`\nSampled ${peakFrames.length} peak frame(s): ${peakFrames.join(", ")}`);
  console.log(
    `bundle=${measured.bundleMs ?? "—"}ms  perFrame≈${measured.perFrameMs ?? "—"}ms  method=${measured.method}`,
  );
  console.log(`\nGate verdicts:`);
  for (const line of gateLines) console.log(`  ${line}`);
  console.log(
    `\nmeasured.collisionsMeasured = ${measured.collisionsMeasured.length}` +
      ` (linear summary.collisionCount = ${manifestJson.summary.collisionCount ?? "?"})`,
  );
  for (const c of measured.collisionsMeasured) {
    console.log(
      `  ! @${c.frame} ${c.a} (${c.zoneA}) ∩ ${c.b} (${c.zoneB})  ratio=${c.ratio}` +
        `${c.measuredPair ? "" : "  [advisory: one side fell back to manifest bbox]"}`,
    );
  }
  console.log(`\nAugmented ${path.relative(process.cwd(), bboxPath)} (measured block + summary.measured*)`);
  console.log("(advisory pass — exit 0 even on WARN)");
};

main().catch((error) => {
  // Advisory: a crash here must NOT fail the build. Print and exit 0.
  console.error("MEASURED pass error (advisory, non-blocking):");
  console.error(error);
  process.exitCode = 0;
});
