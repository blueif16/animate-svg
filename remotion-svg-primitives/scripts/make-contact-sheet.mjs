#!/usr/bin/env node
// Build a dense contact-sheet PNG from the rendered lesson MP4.
//
// Layout: rows = cues, columns = sample positions within each cue. Default
// 5 samples per cue at relative positions: start, narration-mid, narration-
// end, hold-mid, cue-end. Each tile is labeled with cue id, frame number,
// time-within-cue, and a narration vs hold marker. Stagnation is visible
// at a glance: if the four right-most tiles in a row look identical, the
// picture stopped moving once narration ended.
//
// Inputs:  pipeline.json (lessonId + composition + output path)
//          src/lessons/<camelLessonId>LessonTimeline.ts (padded cues — preferred)
//          src/lessons/generated/<camelLessonId>Timing.ts (raw fallback)
//
// Output:  <lesson-id>-contact.png  — human review mosaic (downscaled tiles)
//          <lesson-id>-contact.json — sidecar legend (+ critique-frames manifest)
//          critique-frames/*.png    — FULL-RES native per-cue frames for the
//                                     machine critic. The mosaic downscales tiles
//                                     to ~320px, which hides per-cell overlaps /
//                                     faint halos; the critic reads THESE instead.
//
// Usage:
//   node scripts/make-contact-sheet.mjs --config lesson-data/<id>/pipeline.json
//
// Flags:
//   --samples-per-cue N      default 5
//   --tile-width N           per-tile width in px (default 320; height auto from aspect)
//   --raw                    force raw ASR cue boundaries (skip padded)

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync, spawnSync } from "node:child_process";

const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const which = (cmd) => {
  const r = spawnSync("which", [cmd], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
};

const toCamel = (kebab) =>
  kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const extractCues = (camelLessonId, forceRaw) => {
  const argv = ["scripts/_padded-cues-extract.ts", camelLessonId];
  if (forceRaw) argv.push("--raw");
  const stdout = execFileSync("node_modules/.bin/tsx", argv, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(stdout);
};

const escapeSvg = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildSampleFrames = (cue, samplesPerCue) => {
  const cueLen = cue.endFrame - cue.startFrame;
  const narrationLen = cue.narrationEndFrame - cue.narrationStartFrame;
  const holdLen = cue.endFrame - cue.narrationEndFrame;

  // The 5-sample default. For N != 5, fall back to even spacing across the cue.
  if (samplesPerCue !== 5) {
    return Array.from({ length: samplesPerCue }, (_, i) => {
      const t = samplesPerCue === 1 ? 0.5 : i / (samplesPerCue - 1);
      const frame = Math.round(cue.startFrame + t * cueLen);
      return {
        frame,
        tag: `${Math.round(t * 100)}%`,
        relSeconds: (frame - cue.startFrame) / 30,
        marker: frame < cue.narrationEndFrame ? "N" : "H",
      };
    });
  }

  const startFrame = cue.startFrame;
  const narrMid = Math.round(
    cue.narrationStartFrame + narrationLen / 2,
  );
  const narrEnd = cue.narrationEndFrame;
  // Hold-mid: midpoint between narration-end and cue-end. If the hold is
  // zero (rare), collapses onto narration-end — that's fine, the row still
  // reads.
  const holdMid =
    holdLen > 0 ? Math.round(narrEnd + holdLen / 2) : narrEnd + 1;
  const endFrame = cue.endFrame - 1; // last frame of the cue (inclusive)

  return [
    { frame: startFrame, tag: "start", marker: "N" },
    { frame: narrMid, tag: "narr·mid", marker: "N" },
    { frame: narrEnd, tag: "narr·end", marker: "N" },
    { frame: holdMid, tag: "hold·mid", marker: "H" },
    { frame: endFrame, tag: "cue·end", marker: "H" },
  ].map((s) => ({
    ...s,
    relSeconds: (s.frame - cue.startFrame) / 30,
  }));
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config) {
    throw new Error("Missing --config <path to pipeline.json>");
  }

  const config = readJson(args.config);
  const lessonId = config.lessonId;
  const mp4Path = config.output;
  if (!lessonId || !mp4Path) {
    throw new Error("pipeline.json must define lessonId and output");
  }
  if (!fs.existsSync(mp4Path)) {
    throw new Error(`MP4 not found: ${mp4Path} — render first`);
  }
  if (!which("ffmpeg")) {
    throw new Error("ffmpeg not on PATH");
  }

  const camelLessonId = toCamel(lessonId);
  const samplesPerCue = Number(args["samples-per-cue"] ?? 5);
  if (!Number.isInteger(samplesPerCue) || samplesPerCue < 1) {
    throw new Error(`invalid --samples-per-cue: ${args["samples-per-cue"]}`);
  }
  const tileWidth = Number(args["tile-width"] ?? 320);
  const tileHeight = Math.round((tileWidth * 9) / 16);
  const labelH = 32;
  const rowHeaderW = 140;
  const gap = 6;
  const padding = 16;

  const extracted = extractCues(camelLessonId, !!args.raw);
  const cues = extracted.cues;
  if (cues.length === 0) {
    throw new Error("No cues resolved for lesson");
  }
  const fps = extracted.fps;
  // Last decodable frame index. totalDuration is the composition's
  // durationInFrames (== final cue endFrame); frame durationInFrames itself is
  // one past EOF, so the highest seekable frame is durationInFrames - 1.
  const lastFrame = Math.max(0, extracted.totalDuration - 1);

  console.log(
    `\n== Contact-sheet build (source: ${extracted.source}, ${cues.length} cues × ${samplesPerCue} samples = ${cues.length * samplesPerCue} tiles)`,
  );

  const outDir = path.resolve(process.cwd(), "out", lessonId);
  fs.mkdirSync(outDir, { recursive: true });
  // FULL-RES per-cue frames for the machine critic. The mosaic below is for
  // humans; its downscaled tiles hide per-cell overlaps and faint halos, so the
  // critic gets the native frames instead. Rebuilt fresh each run.
  const critDir = path.join(outDir, "critique-frames");
  fs.rmSync(critDir, { recursive: true, force: true });
  fs.mkdirSync(critDir, { recursive: true });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "contact-sheet-"));

  const sharpMod = await import("sharp");
  const sharp = sharpMod.default;

  try {
    // Pass 1: extract every sample frame via ffmpeg at FULL native resolution
    // (no scale filter → the MP4's own pixels) into critique-frames/. The mosaic
    // tile is downscaled FROM this native frame in pass 2.
    const rows = [];
    for (const [rowIdx, cue] of cues.entries()) {
      const samples = buildSampleFrames(cue, samplesPerCue);
      const tiles = [];
      for (const [idx, sample] of samples.entries()) {
        // Clamp the seek to the last decodable frame. The final cue's
        // narr-end / hold-mid / cue-end can land on durationInFrames (one past
        // EOF); ffmpeg would then exit 0 writing no file and sharp() would throw
        // on the missing tile. Applies to every sample type, not just cue-end.
        const safeFrame = Math.min(sample.frame, lastFrame);
        const timeSeconds = safeFrame / fps;
        const cueSlug = cue.id.replace(/[^a-z0-9_-]/gi, "_");
        const tagSlug = String(sample.tag).replace(/[^a-z0-9]+/gi, "-");
        // Stable, sortable name: rNN-<cue>-<idx>-<tag>-f<frame>.png
        const nativePath = path.join(
          critDir,
          `r${String(rowIdx).padStart(2, "0")}-${cueSlug}-${idx}-${tagSlug}-f${safeFrame}.png`,
        );
        const ff = spawnSync(
          "ffmpeg",
          ["-y", "-ss", String(timeSeconds), "-i", mp4Path, "-frames:v", "1", nativePath],
          { encoding: "utf8" },
        );
        if (ff.status !== 0) {
          console.error(ff.stderr);
          throw new Error(
            `ffmpeg failed for cue ${cue.id} at frame ${sample.frame}`,
          );
        }
        tiles.push({ ...sample, nativePath });
      }
      rows.push({ cue, samples, tiles });
    }

    // Pass 2: stitch with sharp + per-tile SVG label.
    const sheetW =
      padding * 2 +
      rowHeaderW +
      samplesPerCue * tileWidth +
      (samplesPerCue - 1) * gap +
      gap; // gap between row-header and tiles
    const sheetH =
      padding * 2 +
      rows.length * (tileHeight + labelH) +
      (rows.length - 1) * gap;

    const composites = [];

    for (let r = 0; r < rows.length; r += 1) {
      const { cue, samples, tiles } = rows[r];
      const rowTop = padding + r * (tileHeight + labelH + gap);

      // Row header: cue id + cue duration + narration vs total
      const cueLen = cue.endFrame - cue.startFrame;
      const narrLen = cue.narrationEndFrame - cue.narrationStartFrame;
      const cueSec = (cueLen / fps).toFixed(1);
      const narrSec = (narrLen / fps).toFixed(1);
      const headerSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${rowHeaderW}" height="${tileHeight + labelH}">
  <rect width="${rowHeaderW}" height="${tileHeight + labelH}" fill="#1a1a1a"/>
  <text x="10" y="26" font-family="-apple-system, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#fafafa">${escapeSvg(cue.id)}</text>
  <text x="10" y="50" font-family="-apple-system, Helvetica, sans-serif" font-size="12" fill="#b0b0b0">cue ${cueSec}s</text>
  <text x="10" y="68" font-family="-apple-system, Helvetica, sans-serif" font-size="12" fill="#b0b0b0">narr ${narrSec}s</text>
  <text x="10" y="86" font-family="-apple-system, Helvetica, sans-serif" font-size="12" fill="${cueLen - narrLen > narrLen ? "#ff8a65" : "#7cb342"}">hold ${(cueLen / fps - Number(narrSec)).toFixed(1)}s</text>
  <text x="10" y="110" font-family="-apple-system, Helvetica, sans-serif" font-size="11" fill="#888">f ${cue.startFrame}–${cue.endFrame}</text>
</svg>`;
      composites.push({
        input: Buffer.from(headerSvg),
        left: padding,
        top: rowTop,
      });

      for (let c = 0; c < tiles.length; c += 1) {
        const tile = tiles[c];
        const tileLeft =
          padding +
          rowHeaderW +
          gap +
          c * (tileWidth + gap);

        // Defensive guard: the clamp above keeps every seek in range, but if a
        // frame is still missing (ffmpeg wrote nothing), fall back to the
        // previous tile in the row so one bad frame can't abort the whole sheet.
        let tileSrc = tile.nativePath;
        if (!fs.existsSync(tileSrc)) {
          const prev = tiles[c - 1];
          if (prev && fs.existsSync(prev.nativePath)) {
            tileSrc = prev.nativePath;
          } else {
            console.warn(
              `[contact-sheet] missing tile for cue ${cue.id} f${tile.frame}; skipping`,
            );
            continue;
          }
        }
        const tileBuf = await sharp(tileSrc)
          .resize(tileWidth, tileHeight, { fit: "fill" })
          .png()
          .toBuffer();
        composites.push({ input: tileBuf, left: tileLeft, top: rowTop });

        const markerColor = tile.marker === "N" ? "#7cb342" : "#ff8a65";
        const markerLabel = tile.marker === "N" ? "NARR" : "HOLD";
        const labelText = `${tile.tag}  ·  f${tile.frame}  ·  +${tile.relSeconds.toFixed(1)}s`;
        const labelSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${labelH}">
  <rect width="${tileWidth}" height="${labelH}" fill="#0e0e0e"/>
  <rect x="0" y="0" width="56" height="${labelH}" fill="${markerColor}"/>
  <text x="6" y="21" font-family="-apple-system, Helvetica, sans-serif" font-size="12" font-weight="700" fill="#0e0e0e">${markerLabel}</text>
  <text x="64" y="21" font-family="-apple-system, Helvetica, sans-serif" font-size="12" fill="#fafafa">${escapeSvg(labelText)}</text>
</svg>`;
        composites.push({
          input: Buffer.from(labelSvg),
          left: tileLeft,
          top: rowTop + tileHeight,
        });
      }
    }

    const sheet = sharp({
      create: {
        width: sheetW,
        height: sheetH,
        channels: 3,
        background: { r: 18, g: 18, b: 18 },
      },
    }).composite(composites);

    const outPath = path.join(outDir, `${lessonId}-contact.png`);
    await sheet.png().toFile(outPath);

    const legend = {
      lessonId,
      contactSheet: path.basename(outPath),
      critiqueFramesDir: path.relative(process.cwd(), critDir),
      fps,
      samplesPerCue,
      source: extracted.source,
      totalDuration: extracted.totalDuration,
      rows: rows.map((row, i) => ({
        rowIndex: i,
        cueId: row.cue.id,
        cueStartFrame: row.cue.startFrame,
        cueEndFrame: row.cue.endFrame,
        narrationStartFrame: row.cue.narrationStartFrame,
        narrationEndFrame: row.cue.narrationEndFrame,
        cueDurationSeconds: Number(
          ((row.cue.endFrame - row.cue.startFrame) / fps).toFixed(2),
        ),
        narrationSeconds: Number(
          (
            (row.cue.narrationEndFrame - row.cue.narrationStartFrame) /
            fps
          ).toFixed(2),
        ),
        holdSeconds: Number(
          ((row.cue.endFrame - row.cue.narrationEndFrame) / fps).toFixed(2),
        ),
        samples: row.tiles.map((s) => ({
          tag: s.tag,
          frame: s.frame,
          relSeconds: Number(s.relSeconds.toFixed(2)),
          marker: s.marker,
          critiqueFrame: path.basename(s.nativePath),
        })),
      })),
    };
    const legendPath = path.join(outDir, `${lessonId}-contact.json`);
    fs.writeFileSync(legendPath, `${JSON.stringify(legend, null, 2)}\n`);

    const stat = fs.statSync(outPath);
    const critCount = fs.readdirSync(critDir).filter((f) => f.endsWith(".png")).length;
    console.log(
      `\n== Contact sheet:   ${outPath} (${(stat.size / 1024).toFixed(0)} KB)`,
    );
    console.log(`== Legend:          ${legendPath}`);
    console.log(
      `== Critique frames: ${critDir} (${critCount} full-res frames for the critic)`,
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};

try {
  await main();
} catch (error) {
  console.error(error.message || error);
  process.exitCode = 1;
}
