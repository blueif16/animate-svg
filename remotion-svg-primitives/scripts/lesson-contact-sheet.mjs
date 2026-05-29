#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const parseArgs = (argv) => {
  const args = { config: undefined, cols: undefined };
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
  return {
    ...args,
    lessonId: config.lessonId,
    composition: config.composition,
    entry: config.entry,
  };
};

const toCamel = (kebab) =>
  kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const run = (label, command, args) => {
  console.log(`\n== ${label}`);
  execFileSync(command, args, { stdio: "inherit" });
};

const extractManifest = (camelLessonId) => {
  const stdout = execFileSync(
    "node_modules/.bin/tsx",
    ["scripts/_manifest-extract.ts", camelLessonId],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 64 * 1024 * 1024 },
  );
  return JSON.parse(stdout);
};

const TILE_W = 480;
const TILE_H = 270;
const LABEL_H = 36;
const GAP = 12;
const PAD = 20;

const truncate = (text, max) => {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
};
const escapeSvg = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const main = async () => {
  const parsed = parseArgs(process.argv.slice(2));
  const args = mergeConfig(parsed);
  if (!args.lessonId || !args.composition || !args.entry) {
    throw new Error("pipeline.json missing lessonId/composition/entry");
  }
  const cols = args.cols ? Number(args.cols) : 3;
  if (!Number.isFinite(cols) || cols <= 0) {
    throw new Error(`Invalid --cols: ${args.cols}`);
  }
  const camelId = toCamel(args.lessonId);

  console.log(`\n== Extract manifest`);
  const extracted = extractManifest(camelId);

  const sharpMod = await import("sharp");
  const sharp = sharpMod.default;

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-contact-"));
  const tiles = [];
  try {
    for (const kf of extracted.keyFrames) {
      const tilePath = path.join(
        tmpDir,
        `${kf.id.replace(/[^a-z0-9_-]/gi, "_")}.png`,
      );
      run(`Still ${kf.id}@${kf.frame}`, "npx", [
        "remotion",
        "still",
        args.entry,
        args.composition,
        tilePath,
        `--frame=${kf.frame}`,
      ]);
      tiles.push({ keyFrame: kf, absFrame: kf.frame, tilePath });
    }

    const rows = Math.ceil(tiles.length / cols);
    const sheetW = PAD * 2 + cols * TILE_W + (cols - 1) * GAP;
    const sheetH = PAD * 2 + rows * (TILE_H + LABEL_H) + (rows - 1) * GAP;

    const composites = [];
    for (let i = 0; i < tiles.length; i += 1) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const left = PAD + col * (TILE_W + GAP);
      const top = PAD + row * (TILE_H + LABEL_H + GAP);

      const resized = await sharp(tiles[i].tilePath)
        .resize(TILE_W, TILE_H, { fit: "fill" })
        .png()
        .toBuffer();
      composites.push({ input: resized, left, top });

      const label = `${tiles[i].keyFrame.id}  f${tiles[i].absFrame}  —  ${tiles[i].keyFrame.label}`;
      const truncated = truncate(label, 64);
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${LABEL_H}">
  <rect width="${TILE_W}" height="${LABEL_H}" fill="#111"/>
  <text x="8" y="24" font-family="-apple-system, Helvetica, sans-serif" font-size="16" fill="#fff">${escapeSvg(truncated)}</text>
</svg>`;
      composites.push({
        input: Buffer.from(svg),
        left,
        top: top + TILE_H,
      });
    }

    const sheet = sharp({
      create: {
        width: sheetW,
        height: sheetH,
        channels: 3,
        background: { r: 24, g: 24, b: 24 },
      },
    }).composite(composites);

    const outDir = path.resolve(process.cwd(), "out", args.lessonId);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "contact-sheet.png");
    await sheet.png().toFile(outPath);
    console.log(`\n${outPath}`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
