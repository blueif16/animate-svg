#!/usr/bin/env node
// Build 3x3 STAGE contact sheets for the vision critic from the native-res
// per-cue frames that make-contact-sheet.mjs already emitted.
//
// Why a separate sheet from the human contact sheet:
//   - The human mosaic packs ALL cues x 5 samples and downscales each tile to
//     ~320px — too small for the image model to resolve per-cell overlaps/halos.
//   - The critic instead wants FEW, LARGE tiles. The image model reads a 3x3 grid
//     well, so we put ONE representative frame per cue, 9 cues per sheet, at near-
//     render resolution. Cues are grouped in timeline order, so each sheet is one
//     "stage" of the lesson and a defect that repeats across sibling beats is
//     visible in a single call → one fix covers the group.
//
// Resolution policy (picked deliberately):
//   - 3 cols x 3 rows = up to 9 tiles per sheet.
//   - Tile width default 960px (16:9 -> 960x540). Floor 640 (below that the model
//     starts missing); the sheet long side lands ~2.9k px, under the model's
//     comfortable single-image budget, so tiles are NOT re-shrunk by the model.
//   - Number of sheets (== critic tool calls) = ceil(cueCount / 9).
//
// Inputs:  pipeline.json (lessonId)  +  out/<id>/<id>-contact.json (legend with
//          each cue's samples[].critiqueFrame)  +  out/<id>/critique-frames/*.png
// Output:  out/<id>/critic-sheets/stage-NN.png  (+ stage index printed)
//
// Usage:
//   node scripts/lesson-critic-sheets.mjs --config lesson-data/<id>/pipeline.json
//   flags: --tag <start|narr-mid|narr-end|hold-mid|cue-end>  (default narr-end)
//          --tile-width <px>  (default 960, floor 640)

import fs from "node:fs";
import path from "node:path";

const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const escapeSvg = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Match a requested tag against the legend's tag strings (which use "·").
const tagMatches = (tag, want) => {
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z]/g, "");
  return norm(tag) === norm(want);
};

const pickFrame = (cue, wantTag) => {
  const samples = cue.samples || [];
  const hit = samples.find((s) => tagMatches(s.tag, wantTag));
  // Fallback to the middle sample (the most-composed beat) if the tag is absent.
  return hit || samples[Math.floor(samples.length / 2)] || samples[0];
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config && !args.id) {
    throw new Error("Missing --config <pipeline.json> (or --id <lesson-id>)");
  }
  const lessonId = args.id || readJson(args.config).lessonId;
  if (!lessonId) throw new Error("could not resolve lessonId");

  const wantTag = args.tag && args.tag !== true ? args.tag : "narr-end";
  const labelH = 40;
  const gap = 10;
  const pad = 16;
  const perSheet = 9; // up to 9 cues per stage sheet (3x3 max)
  // Keep the sheet long-side within the model's single-image budget (~3000px) so
  // it does NOT re-downscale the teaching pixels, and cap tiles at native render
  // width. Few-cue stages use 2 columns → they get full native-res tiles; that's
  // what fixed the 4-cell sheet flip-flopping at 960px.
  const SHEET_BUDGET_W = 3000;
  const NATIVE_TILE_W = 1280;
  // Per-group layout: 2 cols for <=4 cells, else 3. Tile width from the budget,
  // capped at native and floored at 640 (below that the model starts missing).
  const layoutFor = (n) => {
    const cols = n <= 4 ? 2 : 3;
    const fromArg = args["tile-width"] && args["tile-width"] !== true
      ? Number(args["tile-width"])
      : Math.floor((SHEET_BUDGET_W - pad * 2 - (cols - 1) * gap) / cols);
    const tileW = Math.max(640, Math.min(NATIVE_TILE_W, fromArg));
    return { cols, tileW, tileH: Math.round((tileW * 9) / 16) };
  };

  const outDir = path.resolve(process.cwd(), "out", lessonId);
  const legendPath = path.join(outDir, `${lessonId}-contact.json`);
  if (!fs.existsSync(legendPath)) {
    throw new Error(
      `legend not found: ${legendPath} — run make-contact-sheet.mjs first`,
    );
  }
  const legend = readJson(legendPath);
  const critDir = path.resolve(
    process.cwd(),
    legend.critiqueFramesDir || path.join("out", lessonId, "critique-frames"),
  );

  // One representative native frame per cue, in timeline order.
  const cells = legend.rows
    .map((cue) => {
      const sample = pickFrame(cue, wantTag);
      if (!sample || !sample.critiqueFrame) return null;
      const framePath = path.join(critDir, sample.critiqueFrame);
      if (!fs.existsSync(framePath)) return null;
      return { cueId: cue.cueId, frame: sample.frame, tag: sample.tag, framePath };
    })
    .filter(Boolean);

  if (cells.length === 0) throw new Error("no critique frames resolved from legend");

  const sheetsDir = path.join(outDir, "critic-sheets");
  fs.rmSync(sheetsDir, { recursive: true, force: true });
  fs.mkdirSync(sheetsDir, { recursive: true });

  const sharpMod = await import("sharp");
  const sharp = sharpMod.default;

  const numSheets = Math.ceil(cells.length / perSheet);
  console.log(
    `\n== Critic sheets: ${cells.length} cues -> ${numSheets} stage sheet(s) (tag "${wantTag}")`,
  );

  const written = [];
  for (let s = 0; s < numSheets; s += 1) {
    const group = cells.slice(s * perSheet, s * perSheet + perSheet);
    const { cols, tileW, tileH } = layoutFor(group.length);
    const rows = Math.ceil(group.length / cols);
    const sheetW = pad * 2 + cols * tileW + (cols - 1) * gap;
    const sheetH = pad * 2 + rows * (tileH + labelH) + (rows - 1) * gap;

    const composites = [];
    for (let i = 0; i < group.length; i += 1) {
      const cell = group[i];
      const r = Math.floor(i / cols);
      const c = i % cols;
      const left = pad + c * (tileW + gap);
      const top = pad + r * (tileH + labelH + gap);

      const tileBuf = await sharp(cell.framePath)
        .resize(tileW, tileH, { fit: "fill" })
        .png()
        .toBuffer();
      composites.push({ input: tileBuf, left, top });

      const cellNo = s * perSheet + i + 1;
      const label = `[cell ${cellNo}]  ${cell.cueId}  ·  f${cell.frame}`;
      const labelSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${tileW}" height="${labelH}">
  <rect width="${tileW}" height="${labelH}" fill="#0e0e0e"/>
  <text x="10" y="26" font-family="-apple-system, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#fafafa">${escapeSvg(label)}</text>
</svg>`;
      composites.push({ input: Buffer.from(labelSvg), left, top: top + tileH });
    }

    const sheet = sharp({
      create: {
        width: sheetW,
        height: sheetH,
        channels: 3,
        background: { r: 18, g: 18, b: 18 },
      },
    }).composite(composites);

    const sheetPath = path.join(
      sheetsDir,
      `stage-${String(s).padStart(2, "0")}.png`,
    );
    await sheet.png().toFile(sheetPath);
    written.push({
      sheet: sheetPath,
      grid: `${cols}x${rows}`,
      tileW,
      cues: group.map((g) => g.cueId),
    });
    console.log(
      `   stage-${String(s).padStart(2, "0")}.png  ${cols}x${rows} tile${tileW}  ` +
        `(${sheetW}x${sheetH})  cues: ${group.map((g) => g.cueId).join(", ")}`,
    );
  }

  // Sidecar index so a critic driver knows the sheets + which cues each covers.
  const indexPath = path.join(sheetsDir, "index.json");
  fs.writeFileSync(
    indexPath,
    `${JSON.stringify({ lessonId, tag: wantTag, sheets: written.map((w) => ({ sheet: path.basename(w.sheet), grid: w.grid, tileW: w.tileW, cues: w.cues })) }, null, 2)}\n`,
  );
  console.log(`== Index: ${indexPath}`);
};

try {
  await main();
} catch (error) {
  console.error(error.message || error);
  process.exitCode = 1;
}
