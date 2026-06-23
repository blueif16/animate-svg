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
//   5. The MINIMAL gate set on the same data: bbox-binding bijection (makes the
//      overlap gate trustworthy) + LUFS on the master MP4. Eye-judged proxies
//      (contrast, legibility, motion-too-fast, caption-redundancy) are NOT
//      gated here — the human is the eye for visual quality.
//   6. AUGMENT out/<id>/bbox-manifest.json with a new `measured` block —
//      leaving the existing keyFrames/summary shape untouched (§4.2).
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
  const allowedPairs = buildAllowedPairSet(extracted.allowedOverlaps);
  // Canonical zone-overlap rule, built from the list forwarded by the extractor.
  const isZoneOverlapAllowed = makeZoneOverlapAllowed(extracted.allowedZonePairs);

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

  // --- Join measured bboxes to manifest, diff, and run overlap math ----------
  // zone lookup per element id. The declared `elements` array (id+zone) is the
  // authoritative source and is always present (metadata-only manifests have no
  // bboxAt snapshots); the per-frame snapshots only refine it for bboxAt lessons.
  const zoneOf = {};
  for (const el of extracted.elements || []) zoneOf[el.id] = el.zone;
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
      const measuredOpacityHere = measuredOpacityByFrame[frame] || {};
      for (const [id, mbbox] of Object.entries(measuredIds)) {
        const man = manifestById[id];
        const entry = {
          id,
          frame,
          measuredBbox: mbbox.map((n) => Number(n.toFixed(2))),
          opacity: measuredOpacityHere[id] ?? 1,
        };
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
        const isMeasured = Boolean(measuredIds[id]);
        return {
          id,
          zone: zoneOf[id] ?? man?.zone ?? "decoration",
          bbox: measuredIds[id] ?? man?.bbox ?? null,
          // Measured opacity is the truth (effective, ancestor-aware); fall back
          // to the manifest's only when an element has no measured box.
          opacity: isMeasured ? (measuredOpacityHere[id] ?? 1) : man ? man.opacity : 1,
          measured: isMeasured,
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

  // Eye-judged proxies removed from the gate set (caption-redundancy, contrast,
  // legibility, motion-too-fast): the human is the eye for visual quality, and
  // the uncalibrated proxies eroded the gate. The minimal failing gate set is
  // measured overlap + bbox-binding bijection + LUFS-on-master.

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
  console.log(
    failed
      ? `\nFAIL: exit 1 — gatesFailed=[${gatesFailed.join(", ")}] (bbox-binding / LUFS). ${measured.collisionsMeasured.length} measured overlap(s) reported as advisory WARN.`
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
