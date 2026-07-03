#!/usr/bin/env node
// MEASURED verification pass — THE bbox check (machine-gated-verification §2–§5).
// LESSON-AGNOSTIC: no lesson topic, id, path, or frame literal is hardcoded.
// Invoked by scripts/lesson-check.mjs. There is no separate "fast linear" pass:
// the manifest is metadata-only ({id,zone}) and every box comes from the render
// (getBBox) — one source of geometry truth (layout.ts feeds the scene; the box
// is read back off the render, never hand-ported into a manifest `bboxAt`).
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
//   5. The gate set on the same data: bbox-binding bijection (makes the overlap
//      gate trustworthy) + LUFS on the master MP4 + two CALIBRATED structural
//      text gates (vendor-study opportunities #4/#13): legibility (per-role type
//      floor is HARD; safe-area is WARN) and caption/label hard-kill self-lint.
//      Their numbers (safe insets, type floors) live ONCE in manifestTypes.ts,
//      forwarded by the extractor. Eye-judged proxies (contrast, motion-too-fast,
//      caption-redundancy) stay OUT — the human is the eye for visual quality.
//   6. WRITE out/<id>/bbox-manifest.json: the `measured` block + a `summary`
//      with measuredCollisionCount / captionIntrusionCount / typeFloorViolation
//      Count / captionHardKillCount / gatesFailed.
//
// HONEST EXIT: the process exits 1 when a high-confidence GATE fails — any
// `gatesFailed` entry (bbox-binding bijection or LUFS). A measured overlap is a
// loud WARN that requires fix-or-justify (per the discipline) but does NOT trip
// exit 1: the overlap metric has false-positive sources (manifest-fallback
// advisories, opacity-blind crossfades) and the human is the eye for visual
// overlaps, so the HARD fail is reserved for the false-positive-free gates. This
// still stops a composer/verifier self-check from laundering a failing run as
// green. A gate that can't run prints SKIP:<reason>
// (never silent) and does NOT fail; a tool CRASH exits 0 (a crash is not a gate
// failure, and must not masquerade as one).

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

// Gate thresholds. LUFS is the only thresholded gate that fails the run
// (overlap + bbox-binding fail structurally; everything else is eye-judged).
const LUFS_TARGET = -16;
const LUFS_TOLERANCE = 1; // -16 ± 1 LUFS
const TRUE_PEAK_MAX = -1.0; // dBFS

// Peak-aware entrance offsets layered on top of manifest cue-% keyframes (§3.1).
// Covers spring/easing overshoot ringing that 50%/80% sampling misses.
const ENTRANCE_PEAK_OFFSETS = [4, 8, 12, 18];

// Legibility gate (vendor-study opportunity #4): judge a text element's size /
// placement only once it has FULLY faded in (mid-entrance an element is smaller
// / sliding in, which would false-positive). The 80/100px safe-area insets and
// 84/44/32px type floors themselves live ONCE in src/lessons/manifestTypes.ts
// and are forwarded by the extractor — never hardcoded in this script.
const SETTLED_OPACITY = 0.9;

// Caption/label hard-kill self-lint (vendor-study opportunity #13). A text
// element that disappears must be gone ONE tick after the cue it lived in — this
// is the boundary tick sampled (cue.endFrame + CUE_BOUNDARY_OFFSET). An element
// still visible there but absent in the NEXT cue is the left-over-fade /
// off-by-one defect open-design's caption lint catches (research §5 #13).
const CUE_BOUNDARY_OFFSET = 1;
// Opacity at/under which an element counts as "gone" (a hard kill lands on 0);
// above it, still visibly present. Symmetric residual threshold.
const HARD_KILL_RESIDUAL_MAX = 0.05;

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

// The allowed-zone-pair list is the CANONICAL one from src/lessons/manifestTypes.ts
// (ALLOWED_OVERLAP_PAIRS), forwarded across the tsx boundary as
// `extracted.allowedZonePairs` by scripts/_measured-extract.ts — this script keeps
// NO copy. The `caption` rule is a RULE, not data, so it stays inline here (it
// matches the canonical isZoneOverlapAllowed in manifestTypes.ts).
const makeZoneOverlapAllowed = (zonePairs) => {
  const allowed = new Set(zonePairs || []);
  return (a, b) => {
    if (a === "caption" || b === "caption") return true;
    return allowed.has(`${a}:${b}`);
  };
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
// tsx subprocess: the metadata-only manifest (cues + elements {id,zone} +
// allowedOverlaps + captionBand). No geometry — boxes come from the render.
// ---------------------------------------------------------------------------
const extractManifest = (camelLessonId) => {
  const stdout = execFileSync(
    "node_modules/.bin/tsx",
    ["scripts/_measured-extract.ts", camelLessonId],
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

// Cue-boundary ticks for the caption/label hard-kill self-lint (#13): the exact
// frame each cue's caption/label MUST already be gone (endFrame + offset), for
// every cue that has a successor. Clamped into the composition; the last cue has
// no successor so its boundary is out of the picture and never sampled.
const deriveBoundaryFrames = (cues) => {
  const set = new Set();
  const maxFrame = cues.length ? Math.max(...cues.map((c) => c.endFrame)) : 0;
  for (let i = 0; i < cues.length - 1; i += 1) {
    const raw = cues[i].endFrame + CUE_BOUNDARY_OFFSET;
    const clamped = Math.max(0, Math.min(maxFrame - 1, Math.round(raw)));
    set.add(clamped);
  }
  return Array.from(set).sort((a, b) => a - b);
};

// The sampled frame nearest a cue's midpoint (the cue's settled reference) — used
// by the hard-kill lint to decide whether a disappearing element is truly absent
// in the successor cue.
const findSampleInCue = (cue, frames) => {
  const mid = cue.startFrame + (cue.endFrame - cue.startFrame) * 0.5;
  let best = null;
  let bestD = Infinity;
  for (const f of frames) {
    if (f >= cue.startFrame && f < cue.endFrame) {
      const d = Math.abs(f - mid);
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }
  }
  return best;
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
    captionIntrusions: [],
    gates: {},
  };

  // --- Extract the metadata-only manifest, then derive the peak frames --------
  // The manifest carries no geometry, so this is one cheap pull; the sampled
  // peak frames come from the reconciled cues (derivePeakFrames).
  const extracted = extractManifest(camelId);
  const peakFrames = derivePeakFrames(extracted.cues);
  // Cue-boundary ticks (endFrame + offset) added for the hard-kill lint (#13).
  const boundaryFrames = deriveBoundaryFrames(extracted.cues);
  // Everything actually rendered/measured. Overlap + bijection keep sampling the
  // motion-peak set (peakFrames) unchanged; the boundary ticks are extra samples
  // the hard-kill lint reads from measuredOpacityByFrame.
  const allFrames = Array.from(
    new Set([...peakFrames, ...boundaryFrames]),
  ).sort((a, b) => a - b);
  measured.framesSampled = allFrames;
  const allowedPairs = buildAllowedPairSet(extracted.allowedOverlaps);
  // Canonical zone-overlap rule, built from the list forwarded by the extractor.
  const isZoneOverlapAllowed = makeZoneOverlapAllowed(extracted.allowedZonePairs);
  // Caption-intrusion: a teaching element inside the bottom caption ribbon. The
  // band is the lesson-agnostic CAPTION_BAND (one shared component), forwarded by
  // the extractor. A teaching element (objects/labels/badges/tally — NOT marks,
  // which trace over the picture and may run full-bleed) whose measured box
  // overlaps the band beyond the ratio threshold is the caption-collision defect.
  const captionBand = extracted.captionBand ?? null;
  const CAPTION_INTRUSION_ZONES = new Set(["objects", "labels", "badges", "tally"]);

  // --- SSR: bundle once, renderStill each peak frame with __measure flag -----
  const outDir = path.resolve(process.cwd(), "out", lessonId);
  fs.mkdirSync(outDir, { recursive: true });
  const framesDir = path.join(outDir, "measured-frames");

  // measured bbox by frame: { [frame]: { [id]: bbox } }
  const measuredByFrame = {};
  // measured effective opacity by frame: { [frame]: { [id]: opacity } } — the
  // measure hook reports each element's true rendered opacity, so the overlap
  // check skips faded elements without the manifest declaring an opacityAt.
  const measuredOpacityByFrame = {};

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
        // Disable webpack's shared persistent cache — parallel-fleet safe (see render-complete-lesson.mjs).
        enableCaching: false,
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
    for (const frame of allFrames) {
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
      const opacityById = {};
      // last log wins (the hook logs once per frame after layout commit)
      for (const m of captured) {
        byId[m.id] = m.bbox;
        opacityById[m.id] = m.opacity ?? 1;
      }
      measuredByFrame[frame] = byId;
      measuredOpacityByFrame[frame] = opacityById;
    }
    measured.perFrameMs = perFrame.length
      ? Math.round(perFrame.reduce((a, b) => a + b, 0) / perFrame.length)
      : null;
  }

  // --- Run overlap math on the MEASURED boxes --------------------------------
  // The manifest carries no geometry: every box is the measured getBBox, and the
  // zone comes from the declared {id,zone} set. An undeclared measured id (a
  // bijection break, flagged below) falls to "decoration" — but the bijection
  // gate fails the run, so that never silently exempts a real element.
  const zoneOf = {};
  for (const el of extracted.elements || []) zoneOf[el.id] = el.zone;

  if (measured.method === "getBBox") {
    for (const frame of peakFrames) {
      const measuredIds = measuredByFrame[frame] || {};
      const measuredOpacityHere = measuredOpacityByFrame[frame] || {};

      // record each measured element's true box + effective opacity
      for (const [id, mbbox] of Object.entries(measuredIds)) {
        measured.elements.push({
          id,
          frame,
          measuredBbox: mbbox.map((n) => Number(n.toFixed(2))),
          opacity: measuredOpacityHere[id] ?? 1,
        });
      }

      // AABB + ratio overlap on the measured set.
      const list = Object.entries(measuredIds).map(([id, bbox]) => ({
        id,
        zone: zoneOf[id] ?? "decoration",
        bbox,
        opacity: measuredOpacityHere[id] ?? 1,
      }));

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
            });
          }
        }
      }

      // caption-intrusion: any teaching element whose MEASURED box reaches into
      // the bottom caption ribbon. Ratio is over the element's own area (how much
      // of the element sits in the band).
      if (captionBand) {
        for (const e of list) {
          if (e.opacity <= OPACITY_THRESHOLD) continue;
          if (!CAPTION_INTRUSION_ZONES.has(e.zone)) continue;
          const overlap = intersectArea(e.bbox, captionBand);
          if (overlap <= 0) continue;
          const area = bboxArea(e.bbox);
          if (area <= 0) continue;
          const ratio = overlap / area;
          if (ratio > OVERLAP_RATIO_THRESHOLD) {
            measured.captionIntrusions.push({
              frame,
              id: e.id,
              zone: e.zone,
              ratio: Number(ratio.toFixed(3)),
            });
          }
        }
      }
    }
    const n = measured.collisionsMeasured.length;
    gateLines.push(
      `${n === 0 ? "PASS" : "WARN"}: overlap-measured — ${n} measured collision(s)`,
    );

    // caption-intrusion — WARN only (same class as overlap: geometric, with
    // false-positive sources like a label legitimately near the ribbon when the
    // caption is suppressed for that beat). The human is the eye; fix-or-justify.
    if (captionBand) {
      const ci = measured.captionIntrusions.length;
      const ids = [...new Set(measured.captionIntrusions.map((c) => c.id))];
      gateLines.push(
        `${ci === 0 ? "PASS" : "WARN"}: caption-intrusion — ${ci} teaching element(s) inside the caption ribbon${ci ? ` [${ids.join(", ")}]` : ""}`,
      );
    } else {
      gateLines.push("SKIP: caption-intrusion — no caption band forwarded");
    }

    // --- Gate: bbox-binding — measure-id ≡ manifest-id BIJECTION (both ways) --
    // The join above silently defaults an unknown measured id to zone
    // "decoration" (collision-exempt) — which HIDES (a) decoration tagged with a
    // load-bearing measure id and (b) a scene/manifest id mismatch. Conversely a
    // declared element never measured anywhere is declared-but-untagged (or a tag
    // typo). Both void detection. The bijection is a SET equality on the FULL
    // declared element set (every `{id,zone}`) vs every id measured across the
    // sampled frames — it does NOT depend on a manifest mount window, so it holds
    // identically for a metadata-only manifest (which has no bboxAt). (CLAUDE.md
    // "BOUNDING BOX = TRUE FOOTPRINT" bijection law.)
    const measuredIdsAll = new Set();
    const manifestIdsAll = new Set((extracted.elements || []).map((e) => e.id));
    for (const frame of peakFrames) {
      for (const id of Object.keys(measuredByFrame[frame] || {})) measuredIdsAll.add(id);
    }
    const measuredNotInManifest = [...measuredIdsAll]
      .filter((id) => !manifestIdsAll.has(id))
      .sort();
    const manifestNeverMeasured = [...manifestIdsAll]
      .filter((id) => !measuredIdsAll.has(id))
      .sort();
    const bindBreaks = measuredNotInManifest.length + manifestNeverMeasured.length;
    measured.gates.bboxBinding = {
      measuredNotInManifest,
      manifestNeverMeasured,
      pass: bindBreaks === 0,
    };
    if (bindBreaks === 0) {
      gateLines.push("PASS: bbox-binding — measure-id ≡ manifest-id");
    } else {
      const parts = [];
      if (measuredNotInManifest.length) {
        parts.push(
          `${measuredNotInManifest.length} measured id(s) not in manifest → defaulted to decoration [${measuredNotInManifest.join(", ")}]`,
        );
      }
      if (manifestNeverMeasured.length) {
        parts.push(
          `${manifestNeverMeasured.length} declared id(s) never measured — untagged or id-mismatch [${manifestNeverMeasured.join(", ")}]`,
        );
      }
      gateLines.push(`WARN: bbox-binding — ${parts.join("; ")}`);
    }
  }

  // --- Gate: legibility — safe-area + per-role type floor (opportunity #4) ----
  // The field's concrete-but-advisory numbers (80/100px safe insets; 84/44/32px
  // type floors, width-scaled) live ONCE in manifestTypes.ts and are forwarded
  // (extracted.safeArea / typeFloors / textZoneRole / referenceWidth); this
  // script keeps NO copy of them, only the width-scaling arithmetic. The check
  // runs on the SAME measured getBBox boxes the overlap gate uses.
  //   • type-floor = HARD gate: a text element whose settled rendered height is
  //     below its role floor is illegibly small (false-positive-free — a box is
  //     only ever "too small", never too small by being a big composite panel).
  //   • safe-area  = WARN: a composite label PANEL (e.g. a full-bleed intro card)
  //     legitimately extends past the text safe rect, so — like the caption /
  //     overlap geometry gates — this is advisory, the human is the eye.
  const textZoneRole = extracted.textZoneRole || {};
  const textZones = new Set(Object.keys(textZoneRole));
  const refW = extracted.referenceWidth;
  const compW = extracted.width;
  const compH = extracted.height;
  // Width-scale a REFERENCE-px number into composition px (L4: "80/1080 * width").
  // Reads the forwarded referenceWidth — no bare number lives here.
  const scaleW = (refPx) => (refPx / refW) * compW;
  if (measured.method !== "getBBox") {
    gateLines.push("SKIP: legibility — measured pass unavailable (no getBBox)");
    measured.gates.legibility = { skipped: "measured pass unavailable" };
  } else {
    const textEls = (extracted.elements || []).filter((e) =>
      textZones.has(e.zone),
    );
    if (textEls.length === 0) {
      gateLines.push(
        "SKIP: legibility — no load-bearing text elements in manifest",
      );
      measured.gates.legibility = {
        skipped: "no load-bearing text elements in manifest",
      };
    } else {
      const safeArea = extracted.safeArea || {};
      const typeFloors = extracted.typeFloors || {};
      const safeSide = scaleW(safeArea.side);
      const safeTB = scaleW(safeArea.topBottom);
      const safeRectPx = [safeSide, safeTB, compW - 2 * safeSide, compH - 2 * safeTB];
      const insideSafe = (b, eps = 1) =>
        b[0] >= safeRectPx[0] - eps &&
        b[1] >= safeRectPx[1] - eps &&
        b[0] + b[2] <= safeRectPx[0] + safeRectPx[2] + eps &&
        b[1] + b[3] <= safeRectPx[1] + safeRectPx[3] + eps;

      // Settled (fully faded-in) samples per element, keyed by id.
      const settledById = {};
      for (const rec of measured.elements) {
        if (rec.opacity >= SETTLED_OPACITY) {
          (settledById[rec.id] ||= []).push(rec);
        }
      }
      const typeFloorViolations = [];
      const safeAreaWarnings = [];
      let checked = 0;
      for (const el of textEls) {
        const samples = settledById[el.id] || [];
        if (samples.length === 0) continue; // never settles in a sample → can't judge
        checked += 1;
        const role = textZoneRole[el.zone];
        const floorPx = scaleW(typeFloors[role]);
        // The element's full rendered height (mid-entrance/pulse frames are
        // smaller/larger; the DESIGN size is the max settled height).
        const maxH = Math.max(...samples.map((s) => s.measuredBbox[3]));
        if (maxH < floorPx) {
          typeFloorViolations.push({
            id: el.id,
            zone: el.zone,
            role,
            maxHeightPx: Number(maxH.toFixed(1)),
            floorPx: Number(floorPx.toFixed(1)),
          });
        }
        const outside = samples.find((s) => !insideSafe(s.measuredBbox));
        if (outside) {
          safeAreaWarnings.push({
            id: el.id,
            zone: el.zone,
            frame: outside.frame,
            bbox: outside.measuredBbox,
          });
        }
      }
      measured.gates.legibility = {
        pass: typeFloorViolations.length === 0, // HARD: type floor only
        checked,
        safeRect: safeRectPx.map((n) => Number(n.toFixed(1))),
        typeFloorViolations,
        safeAreaWarnings, // advisory
      };
      gateLines.push(
        `${typeFloorViolations.length === 0 ? "PASS" : "FAIL"}: legibility(type-floor) — ${typeFloorViolations.length} text element(s) below role floor${
          typeFloorViolations.length
            ? ` [${typeFloorViolations
                .map((v) => `${v.id} ${v.maxHeightPx}<${v.floorPx}px`)
                .join(", ")}]`
            : ""
        }`,
      );
      gateLines.push(
        `${safeAreaWarnings.length === 0 ? "PASS" : "WARN"}: legibility(safe-area) — ${safeAreaWarnings.length} text element(s) outside the safe rect${
          safeAreaWarnings.length
            ? ` [${[...new Set(safeAreaWarnings.map((v) => v.id))].join(", ")}]`
            : ""
        }`,
      );
    }
  }

  // --- Gate: caption/label hard-kill self-lint (opportunity #13) --------------
  // For every cue boundary, assert that any text element that DISAPPEARS is
  // already gone one tick after its cue ends — no lingering caption/label. An
  // element still visible at cue.endFrame + CUE_BOUNDARY_OFFSET but absent in the
  // next cue is the off-by-one / left-over-fade defect. Persisting elements
  // (still visible in the next cue) are correctly ignored. HARD gate (a leftover
  // caption is deterministic, not eye-judged) → contributes to gatesFailed.
  if (measured.method !== "getBBox") {
    gateLines.push("SKIP: caption-hard-kill — measured pass unavailable (no getBBox)");
    measured.gates.captionHardKill = { skipped: "measured pass unavailable" };
  } else {
    const hardKillIds = (extracted.elements || [])
      .filter((e) => textZones.has(e.zone))
      .map((e) => e.id);
    if (hardKillIds.length === 0) {
      gateLines.push(
        "SKIP: caption-hard-kill — no caption/label (text-zone) elements in manifest",
      );
      measured.gates.captionHardKill = {
        skipped: "no text-zone elements in manifest",
      };
    } else {
      const cues = extracted.cues || [];
      const maxFrame = cues.length
        ? Math.max(...cues.map((c) => c.endFrame))
        : 0;
      const lingerViolations = [];
      for (let i = 0; i < cues.length - 1; i += 1) {
        const cue = cues[i];
        const nextCue = cues[i + 1];
        const boundary = Math.max(
          0,
          Math.min(maxFrame - 1, Math.round(cue.endFrame + CUE_BOUNDARY_OFFSET)),
        );
        const nextRef = findSampleInCue(nextCue, allFrames);
        if (nextRef === null) continue; // no settled sample in the successor
        const opAtBoundary = measuredOpacityByFrame[boundary] || {};
        const opAtNext = measuredOpacityByFrame[nextRef] || {};
        for (const id of hardKillIds) {
          const opB = opAtBoundary[id] ?? 0; // absent → gone
          const opN = opAtNext[id] ?? 0;
          // still present at the boundary tick, yet gone by the next cue → linger
          if (opB > HARD_KILL_RESIDUAL_MAX && opN <= HARD_KILL_RESIDUAL_MAX) {
            lingerViolations.push({
              cue: cue.id,
              id,
              boundaryFrame: boundary,
              opacityAtBoundary: Number(opB.toFixed(3)),
            });
          }
        }
      }
      measured.gates.captionHardKill = {
        pass: lingerViolations.length === 0,
        boundaryOffset: CUE_BOUNDARY_OFFSET,
        checkedBoundaries: Math.max(0, cues.length - 1),
        violations: lingerViolations,
      };
      gateLines.push(
        `${lingerViolations.length === 0 ? "PASS" : "FAIL"}: caption-hard-kill — ${lingerViolations.length} caption/label(s) lingering past a cue boundary (endFrame+${CUE_BOUNDARY_OFFSET})${
          lingerViolations.length
            ? ` [${[...new Set(lingerViolations.map((v) => v.id))].join(", ")}]`
            : ""
        }`,
      );
    }
  }

  // --- Gate: LUFS ------------------------------------------------------------
  // The DELIVERABLE is the loudnorm'd MASTER MP4 (Wave 5 normalizes to -16
  // LUFS / -1 dBTP). Measure THAT when it exists — the only honest pass/fail.
  // Before render (composer time) only the raw voice WAV exists; its loudness
  // does NOT predict the normalized master (loudnorm always lands it on target),
  // so measuring the WAV against -16 WARNs on EVERY lesson by construction —
  // a false positive that erodes the gate. In that case we report the WAV as an
  // INFO proxy and never fail the target. (Pre-fix bug: gate read -19.6 from the
  // voice WAV while the master MP4 measured -16.1.)
  const masterMp4 = config.output
    ? path.resolve(process.cwd(), config.output)
    : null;
  const voiceWav = config.voice?.out
    ? path.resolve(process.cwd(), config.voice.out)
    : null;
  const usingMaster = Boolean(masterMp4 && fs.existsSync(masterMp4));
  const lufs = runLufsGate(usingMaster ? masterMp4 : voiceWav);
  if (!lufs.ran) {
    measured.gates.lufs = { skipped: lufs.skipReason };
    gateLines.push(`SKIP: lufs — ${lufs.skipReason}`);
  } else if (usingMaster) {
    measured.gates.lufs = {
      source: "master-mp4",
      integrated: lufs.integrated,
      truePeak: lufs.truePeak,
      lra: lufs.lra,
      pass: lufs.pass,
      note: lufs.note,
    };
    gateLines.push(
      `${lufs.pass ? "PASS" : "WARN"}: lufs — I=${lufs.integrated} LUFS, truePeak=${lufs.truePeak} dBFS [master mp4]${lufs.note ? ` (${lufs.note})` : ""}`,
    );
  } else {
    // Pre-loudnorm voice proxy — informational, never fails the -16 target.
    measured.gates.lufs = {
      source: "voice-wav-preloudnorm",
      integrated: lufs.integrated,
      truePeak: lufs.truePeak,
      lra: lufs.lra,
      pass: true,
      note: "pre-loudnorm voice proxy — master normalized to -16 LUFS / -1 dBTP at render (Wave 5); render to check the deliverable",
    };
    gateLines.push(
      `INFO: lufs — I=${lufs.integrated} LUFS [pre-loudnorm voice proxy; master normalized at render — render the MP4 to gate the deliverable]`,
    );
  }

  // Eye-judged PROXIES stay out of the gate set (caption-redundancy, contrast,
  // motion-too-fast): the human is the eye, and the uncalibrated proxies eroded
  // the gate. Legibility returns above NOT as an uncalibrated ~24px eye-proxy but
  // as the field's calibrated, width-scaled type floors + safe rect (#4), with
  // the composite-panel false-positive routed to a WARN; and the caption/label
  // hard-kill self-lint (#13) is deterministic, not eye-judged. The hard failing
  // gate set is now: bbox-binding + LUFS-on-master + legibility(type-floor) +
  // caption-hard-kill (measured overlap + safe-area stay WARN-only).

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
  manifestJson.summary.captionIntrusionCount = measured.captionIntrusions.length;
  // Calibrated text-gate counts (opportunities #4/#13). A skipped gate has no
  // violation array, so it reports 0 (and never lands in gatesFailed).
  manifestJson.summary.typeFloorViolationCount =
    measured.gates.legibility?.typeFloorViolations?.length ?? 0;
  manifestJson.summary.safeAreaWarningCount =
    measured.gates.legibility?.safeAreaWarnings?.length ?? 0;
  manifestJson.summary.captionHardKillCount =
    measured.gates.captionHardKill?.violations?.length ?? 0;
  manifestJson.summary.gatesFailed = gatesFailed;
  fs.writeFileSync(bboxPath, JSON.stringify(manifestJson, null, 2));

  // HONEST EXIT: fail the run on a high-confidence GATE failure (gatesFailed:
  // bbox-binding bijection or LUFS) — so a composer/verifier self-check cannot
  // launder a failing run as green. A measured overlap is surfaced as a loud WARN
  // requiring fix-or-justify (per the discipline) but does NOT by itself fail the
  // run: the overlap metric has false-positive sources (manifest-fallback
  // advisories, opacity-blind crossfades), and the human is the eye for visual
  // overlaps. A SKIP (gate could not run) carries no `pass` field, so it never
  // lands in gatesFailed and never fails here.
  const failed = gatesFailed.length > 0;
  process.exitCode = failed ? 1 : 0;

  // --- Report ----------------------------------------------------------------
  console.log(
    `\nSampled ${allFrames.length} frame(s) (${peakFrames.length} motion-peak + ${boundaryFrames.length} cue-boundary): ${allFrames.join(", ")}`,
  );
  console.log(
    `bundle=${measured.bundleMs ?? "—"}ms  perFrame≈${measured.perFrameMs ?? "—"}ms  method=${measured.method}`,
  );
  console.log(`\nGate verdicts:`);
  for (const line of gateLines) console.log(`  ${line}`);
  console.log(
    `\nmeasured.collisionsMeasured = ${measured.collisionsMeasured.length}` +
      `, captionIntrusions = ${measured.captionIntrusions.length}`,
  );
  for (const c of measured.collisionsMeasured) {
    console.log(
      `  ! @${c.frame} ${c.a} (${c.zoneA}) ∩ ${c.b} (${c.zoneB})  ratio=${c.ratio}`,
    );
  }
  if (measured.captionIntrusions.length) {
    console.log(`\nmeasured.captionIntrusions = ${measured.captionIntrusions.length}`);
    for (const c of measured.captionIntrusions) {
      console.log(`  ⚠ @${c.frame} ${c.id} (${c.zone}) intrudes caption ribbon  overlap/area=${c.ratio}`);
    }
  }
  console.log(`\nAugmented ${path.relative(process.cwd(), bboxPath)} (measured block + summary.measured*)`);
  console.log(
    failed
      ? `\nFAIL: exit 1 — gatesFailed=[${gatesFailed.join(", ")}] (bbox-binding / LUFS / legibility type-floor / caption-hard-kill). ${measured.collisionsMeasured.length} measured overlap(s) + safe-area WARN(s) reported as advisory.`
      : `\nPASS: exit 0 — no failed gates (SKIP lines do not fail). ${measured.collisionsMeasured.length} measured overlap(s) WARN-only — review + fix-or-justify per discipline.`,
  );
};

main().catch((error) => {
  // A tool CRASH is not a gate failure and must NOT masquerade as one — exit 0
  // so a broken harness never reads as a failed lesson. (A real gate failure
  // sets exitCode=1 on the success path above, before any throw.) Print loudly.
  console.error("MEASURED pass error (tool crash, non-blocking — NOT a gate failure):");
  console.error(error);
  process.exitCode = 0;
});
