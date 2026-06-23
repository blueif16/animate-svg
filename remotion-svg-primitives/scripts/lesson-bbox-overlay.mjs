#!/usr/bin/env node
// Bounding-box OVERLAY review surface (LESSON-AGNOSTIC — no topic/id/frame
// literal). The companion to scripts/lesson-measured.mjs: that script DETECTS
// overlaps from the true getBBox of every registered element; this script DRAWS
// those same boxes onto the rendered frame so a human can verify, at a glance,
// that each box equals the element's TRUE rendered footprint.
//
// Why this exists. A measured collision is only trustworthy if each element's
// bounding box is its true footprint. The classic failure: a DECORATION shape
// (a pulse ring, glow, sparkle) nested INSIDE a load-bearing element's measured
// <g> inflates that element's getBBox — so the box no longer matches the thing
// it claims to bound, and a phantom collision (or a missed one) follows. The
// only reliable check is to SEE the box on the frame. That is the rule: every
// still shown for review carries its boxes (CLAUDE.md "Bounding-box discipline").
//
// What it draws, per frame:
//   • SOLID box = the MEASURED getBBox (the TRUE footprint), colored by zone.
//   • label     = "id · zone · W×H" so the eye binds box→element→size.
//   A measured id that the manifest does NOT declare is drawn red ("· UNDECLARED")
//   — a bijection break (the measured pass fails the run on it).
//
// The manifest is metadata-only ({id,zone}); there is no declared geometry to
// diverge from — the measured box is the single source of truth.
//
// Usage:
//   node scripts/lesson-bbox-overlay.mjs --config lesson-data/<id>/pipeline.json
//   node scripts/lesson-bbox-overlay.mjs --config <path> --frames 1258,1521
//
// With no --frames, samples each cue's 60%-point (one representative frame per
// cue). Output: out/<id>/bbox-overlay/f<frame>-bbox.png (+ a printed report).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const requireFromRoot = createRequire(
  pathToFileURL(path.join(process.cwd(), "package.json")),
);
const importFromRoot = async (specifier) => {
  const resolved = requireFromRoot.resolve(specifier);
  return import(pathToFileURL(resolved).href);
};

// Zone → outline color. Mirrors the manifest ZoneName union (manifestTypes.ts).
// Decoration is deliberately gray + thin: it is non-load-bearing and must never
// be the thing a collision is reported against (see CLAUDE.md).
const ZONE_COLOR = {
  objects: "#1f9d55", // green — the teaching object
  labels: "#2563eb", // blue — text labels
  badges: "#d97706", // amber — count step indicators
  tally: "#0891b2", // cyan — step-tally pills
  marks: "#7c3aed", // purple — sketch ink
  caption: "#db2777", // pink — caption ribbon
  decoration: "#9ca3af", // gray — non-load-bearing chrome
};
const UNDECLARED_COLOR = "#ef4444"; // red — measured but not declared (bijection break)
const colorFor = (zone, declared) =>
  declared ? ZONE_COLOR[zone] ?? UNDECLARED_COLOR : UNDECLARED_COLOR;

const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${a}`);
      args[key] = value;
      i += 1;
    }
  }
  return args;
};

const toCamel = (kebab) => kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

// The metadata-only manifest (cues + declared {id,zone}). No frames arg — there
// is no per-frame geometry to extract; boxes come from the render below.
const extractManifest = (camelLessonId) => {
  const stdout = execFileSync(
    "node_modules/.bin/tsx",
    ["scripts/_measured-extract.ts", camelLessonId],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 64 * 1024 * 1024 },
  );
  return JSON.parse(stdout);
};

const xmlEscape = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Build the SVG overlay (same px space as the frame). Solid box per measured
// element + a "id · zone · W×H" label chip.
const buildOverlaySvg = (width, height, frame, rows) => {
  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  );
  parts.push(
    `<rect x="0" y="0" width="${width}" height="26" fill="#111827" opacity="0.82"/>`,
    `<text x="10" y="18" font-family="sans-serif" font-size="15" fill="#ffffff">frame ${frame}  ·  SOLID = measured true footprint (by zone)  ·  RED = measured but undeclared (bijection break)</text>`,
  );
  for (const r of rows) {
    const color = colorFor(r.zone, r.declared);
    const [x, y, w, h] = r.measured;
    const sw = r.zone === "decoration" ? 2 : 3;
    parts.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    );
    const label = `${r.id} · ${r.declared ? r.zone : "UNDECLARED"} · ${Math.round(w)}×${Math.round(h)}`;
    const chipW = label.length * 7.3 + 10;
    const chipY = y >= 20 ? y - 19 : y + h + 1; // above the box, or below if at top edge
    parts.push(
      `<rect x="${x}" y="${chipY}" width="${chipW}" height="18" fill="${color}" opacity="0.92"/>`,
      `<text x="${x + 5}" y="${chipY + 13}" font-family="sans-serif" font-size="12" fill="#ffffff">${xmlEscape(label)}</text>`,
    );
  }
  parts.push("</svg>");
  return parts.join("");
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config) throw new Error("Missing required option: --config <path>");
  const config = JSON.parse(fs.readFileSync(args.config, "utf8"));
  const lessonId = config.lessonId;
  if (!lessonId) throw new Error(`pipeline.json missing lessonId: ${args.config}`);
  const camelId = toCamel(lessonId);
  const composition = config.composition;
  const entry = config.entry ?? "src/index.ts";

  const extracted = extractManifest(camelId);
  const width = extracted.width ?? 1280;
  const height = extracted.height ?? 720;
  // Declared zone per id (the metadata-only manifest's source of truth).
  const zoneOf = {};
  for (const el of extracted.elements ?? []) zoneOf[el.id] = el.zone;

  // Frames: explicit --frames, else one representative frame per cue (60%).
  let frames;
  if (args.frames) {
    frames = args.frames.split(",").map((s) => Number(s.trim())).filter(Number.isFinite);
  } else {
    frames = extracted.cues
      .map((c) => Math.round(c.startFrame + (c.endFrame - c.startFrame) * 0.6))
      .filter((f) => Number.isFinite(f));
  }
  if (frames.length === 0) throw new Error("no frames to render");

  const sharpMod = await import("sharp");
  const sharp = sharpMod.default;
  const bundler = await importFromRoot("@remotion/bundler");
  const renderer = await importFromRoot("@remotion/renderer");

  console.log(`\n${"=".repeat(60)}`);
  console.log(`BBOX OVERLAY — ${lessonId}  ·  frames ${frames.join(", ")}`);
  console.log("=".repeat(60));

  const serveUrl = await bundler.bundle({ entryPoint: path.resolve(process.cwd(), entry) });
  const comp = await renderer.selectComposition({
    serveUrl,
    id: composition,
    inputProps: { __measure: true },
  });

  const outDir = path.resolve(process.cwd(), "out", lessonId, "bbox-overlay");
  fs.mkdirSync(outDir, { recursive: true });
  const written = [];

  for (const frame of frames) {
    const basePng = path.join(outDir, `f${frame}-base.png`);
    const captured = [];
    await renderer.renderStill({
      composition: comp,
      serveUrl,
      output: basePng,
      frame,
      imageFormat: "png",
      inputProps: { __measure: true },
      onBrowserLog: (log) => {
        const idx = log.text.indexOf("MEASURE_BBOX ");
        if (idx >= 0) {
          try {
            captured.push(...JSON.parse(log.text.slice(idx + "MEASURE_BBOX ".length)));
          } catch {
            /* ignore malformed line */
          }
        }
      },
    });
    // Measured boxes (last log wins — the hook logs once after layout commit).
    const measuredById = {};
    for (const m of captured) measuredById[m.id] = m.bbox;

    const rows = Object.entries(measuredById).map(([id, bbox]) => ({
      id,
      zone: zoneOf[id] ?? "decoration",
      measured: bbox,
      declared: Object.prototype.hasOwnProperty.call(zoneOf, id),
    }));
    // Stable draw order: decoration first (under), load-bearing on top.
    rows.sort((a, b) => (a.zone === "decoration" ? -1 : 0) - (b.zone === "decoration" ? -1 : 0));

    const svg = buildOverlaySvg(width, height, frame, rows);
    const outPng = path.join(outDir, `f${frame}-bbox.png`);
    await sharp(basePng).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).toFile(outPng);
    fs.rmSync(basePng, { force: true });
    written.push(outPng);

    // Per-frame report.
    console.log(`\nframe ${frame}:`);
    for (const r of [...rows].sort((a, b) => a.id.localeCompare(b.id))) {
      const m = `${Math.round(r.measured[2])}×${Math.round(r.measured[3])}`;
      const flag = r.declared ? "" : "  ⚠ UNDECLARED (bijection break)";
      console.log(`  ${r.id.padEnd(22)} ${String(r.zone).padEnd(11)} measured=${m}${flag}`);
    }
  }

  console.log(`\nWrote ${written.length} overlay still(s):`);
  for (const p of written) console.log(`  ${path.relative(process.cwd(), p)}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
