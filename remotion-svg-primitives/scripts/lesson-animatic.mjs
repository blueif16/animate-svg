#!/usr/bin/env node
// Pre-render animatic gate (research brief rule #4).
//
// Renders THREE thumbnails per cue (start / mid / end-1), composes them into a
// horizontal strip, and stitches a waveform picture of the lesson's voice WAV
// below — with vertical lines at each cue's startFrame in WAV time so
// cue-boundary alignment is inspectable at a glance, BEFORE burning a full
// MP4 render.
//
// Inputs:
//   --config <path to pipeline.json>   (lessonId, composition, entry, voice.out)
//
// Outputs (created if missing):
//   out/<lessonId>/<lessonId>-animatic.png
//   out/<lessonId>/<lessonId>-animatic.json
//
// Why renderStill (programmatic) over `npx remotion still`:
//   The contact-sheet script shells out per frame, which spawns chrome per
//   call. Here we bundle once, selectComposition once, then loop renderStill —
//   ~30 stills in seconds rather than minutes.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

const escapeSvg = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const truncate = (text, max) => {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
};

// ---------------------------------------------------------------------------
// Tunables. Thumbnails small — the strip is wide (numCues * 3 * THUMB_W).
// ---------------------------------------------------------------------------
const THUMB_W = 320;
const THUMB_H = 180; // 16:9
const LABEL_H = 28;
const GAP = 4;
const PAD = 16;
const WAVE_H = 96;
const WAVE_LABEL_H = 24;

const loadReconciledCues = async (camelLessonId) => {
  const timelinePath = path.resolve(
    process.cwd(),
    "src",
    "lessons",
    `${camelLessonId}LessonTimeline.ts`,
  );
  if (!fs.existsSync(timelinePath)) {
    throw new Error(`Reconciled timeline missing: ${timelinePath}`);
  }
  // Reuse the existing tsx subprocess pattern from _padded-cues-extract.ts so
  // we don't fight TS imports in plain node.
  const stdout = spawnSync(
    "node_modules/.bin/tsx",
    ["scripts/_padded-cues-extract.ts", camelLessonId],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
      maxBuffer: 32 * 1024 * 1024,
    },
  );
  if (stdout.status !== 0) {
    throw new Error(`tsx extract failed for ${camelLessonId}`);
  }
  return JSON.parse(stdout.stdout);
};

const main = async () => {
  const t0 = Date.now();
  const args = parseArgs(process.argv.slice(2));
  if (!args.config) {
    throw new Error("Missing --config <path to pipeline.json>");
  }
  const config = readJson(args.config);
  const lessonId = config.lessonId;
  const composition = config.composition;
  const entry = config.entry;
  if (!lessonId || !composition || !entry) {
    throw new Error("pipeline.json must define lessonId, composition, entry");
  }
  const wavPath = config.voice?.out;
  if (!wavPath) {
    throw new Error("pipeline.json must define voice.out");
  }
  if (!fs.existsSync(wavPath)) {
    throw new Error(`Voice WAV missing: ${wavPath} — run lesson:voice first`);
  }
  if (!which("ffmpeg")) {
    throw new Error("ffmpeg not on PATH");
  }

  const camelLessonId = toCamel(lessonId);
  const extracted = await loadReconciledCues(camelLessonId);
  const cues = extracted.cues;
  const fps = extracted.fps;
  if (!cues.length) {
    throw new Error("No cues resolved");
  }

  console.log(
    `\n== Animatic build (${cues.length} cues × 3 = ${cues.length * 3} stills, source: ${extracted.source})`,
  );

  // out/<lessonId>/ — match subagent A's convention. Create if absent.
  const outDir = path.resolve(process.cwd(), "out", lessonId);
  fs.mkdirSync(outDir, { recursive: true });

  // --------------------------------------------------------------------- //
  // Step 1. Bundle once, selectComposition once, loop renderStill.        //
  // --------------------------------------------------------------------- //
  const { bundle } = await import("@remotion/bundler");
  const { selectComposition, renderStill } = await import(
    "@remotion/renderer"
  );

  console.log("== Bundling (cached)...");
  const tBundle = Date.now();
  const serveUrl = await bundle({
    entryPoint: path.resolve(process.cwd(), entry),
    // Bundler picks up the same webpack config as `remotion still`.
  });
  console.log(`   bundled in ${((Date.now() - tBundle) / 1000).toFixed(1)}s`);

  const comp = await selectComposition({
    serveUrl,
    id: composition,
    inputProps: {},
  });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "animatic-"));
  const samplesByCue = []; // { cue, samples: [{tag, frame, tilePath}] }

  try {
    console.log("== Rendering thumbnails...");
    const tStills = Date.now();
    for (const cue of cues) {
      const start = cue.startFrame;
      const end = cue.endFrame;
      // Clamp end-1 to be ≥ start; mid is the integer midpoint.
      const lastFrame = Math.max(start, end - 1);
      const midFrame = Math.round((start + end) / 2);
      const sampleSpecs = [
        { tag: "start", frame: start },
        { tag: "mid", frame: midFrame },
        { tag: "end", frame: lastFrame },
      ];
      const samples = [];
      for (const spec of sampleSpecs) {
        const safeId = cue.id.replace(/[^a-z0-9_-]/gi, "_");
        const tilePath = path.join(
          tmpDir,
          `${safeId}-${spec.tag}-${spec.frame}.png`,
        );
        await renderStill({
          composition: comp,
          serveUrl,
          output: tilePath,
          frame: spec.frame,
          imageFormat: "png",
          // Small render size: comp.width is 1920; we want roughly THUMB_W on
          // disk to keep bundle/encode time low. scale < 1 multiplies the
          // composition dims, so THUMB_W / comp.width.
          scale: Math.max(0.1, Math.min(1, THUMB_W / comp.width)),
        });
        samples.push({ ...spec, tilePath });
      }
      samplesByCue.push({ cue, samples });
    }
    console.log(
      `   ${cues.length * 3} stills in ${((Date.now() - tStills) / 1000).toFixed(1)}s`,
    );

    // ------------------------------------------------------------------- //
    // Step 2. Compose the horizontal strip with sharp.                    //
    // ------------------------------------------------------------------- //
    const sharpMod = await import("sharp");
    const sharp = sharpMod.default;

    const tilesPerCue = 3;
    const cueGroupW = tilesPerCue * THUMB_W + (tilesPerCue - 1) * GAP;
    // Between cue-groups we want a bigger visual gap so the boundary reads.
    const CUE_GAP = 16;
    const stripW =
      PAD * 2 +
      cues.length * cueGroupW +
      (cues.length - 1) * CUE_GAP;
    const stripH = PAD + THUMB_H + LABEL_H + PAD;

    const composites = [];
    const cueGroupLefts = []; // left-x of each cue's first thumbnail
    for (let i = 0; i < samplesByCue.length; i += 1) {
      const { cue, samples } = samplesByCue[i];
      const groupLeft = PAD + i * (cueGroupW + CUE_GAP);
      cueGroupLefts.push(groupLeft);

      for (let j = 0; j < samples.length; j += 1) {
        const s = samples[j];
        const tileLeft = groupLeft + j * (THUMB_W + GAP);
        const tileBuf = await sharp(s.tilePath)
          .resize(THUMB_W, THUMB_H, { fit: "fill" })
          .png()
          .toBuffer();
        composites.push({ input: tileBuf, left: tileLeft, top: PAD });
      }

      // One label spanning the cue group: cue.id + cue frame range
      const cueSec = ((cue.endFrame - cue.startFrame) / fps).toFixed(1);
      const labelText = `${cue.id}  ·  f${cue.startFrame}–${cue.endFrame}  ·  ${cueSec}s`;
      const labelSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${cueGroupW}" height="${LABEL_H}">
  <rect width="${cueGroupW}" height="${LABEL_H}" fill="#0e0e0e"/>
  <text x="6" y="19" font-family="-apple-system, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#fafafa">${escapeSvg(truncate(labelText, 80))}</text>
</svg>`;
      composites.push({
        input: Buffer.from(labelSvg),
        left: groupLeft,
        top: PAD + THUMB_H,
      });
    }

    const stripBuf = await sharp({
      create: {
        width: stripW,
        height: stripH,
        channels: 3,
        background: { r: 18, g: 18, b: 18 },
      },
    })
      .composite(composites)
      .png()
      .toBuffer();

    // ------------------------------------------------------------------- //
    // Step 3. Waveform via ffmpeg's showwavespic, sized to the strip.     //
    // ------------------------------------------------------------------- //
    const wavePngPath = path.join(tmpDir, "waveform.png");
    const ff = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        wavPath,
        "-filter_complex",
        `showwavespic=s=${stripW}x${WAVE_H}:colors=#888888`,
        "-frames:v",
        "1",
        wavePngPath,
      ],
      { encoding: "utf8" },
    );
    if (ff.status !== 0) {
      console.error(ff.stderr);
      throw new Error("ffmpeg showwavespic failed");
    }

    // WAV duration → wav-frame width per composition-frame mapping.
    // ffprobe via ffmpeg -i ... stderr parse would also work; ffprobe is
    // typically present alongside ffmpeg.
    const probe = spawnSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        wavPath,
      ],
      { encoding: "utf8" },
    );
    const wavSeconds = Number(probe.stdout?.trim() || 0);
    if (!Number.isFinite(wavSeconds) || wavSeconds <= 0) {
      throw new Error(`Could not read WAV duration from ${wavPath}`);
    }
    // Pixels per second on the waveform image.
    const waveContentLeft = PAD;
    const waveContentW = stripW - PAD * 2;
    const pxPerSecond = waveContentW / wavSeconds;

    // Overlay vertical lines at each cue's startFrame.
    const cueLineSvgParts = cues
      .map((cue) => {
        const sec = cue.startFrame / fps;
        const x = Math.round(waveContentLeft + sec * pxPerSecond);
        return `<line x1="${x}" y1="0" x2="${x}" y2="${WAVE_H}" stroke="#ff8a65" stroke-width="2" opacity="0.85"/>
<text x="${x + 4}" y="14" font-family="-apple-system, Helvetica, sans-serif" font-size="11" fill="#ff8a65">${escapeSvg(cue.id)}</text>`;
      })
      .join("\n");

    const cueLineSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${stripW}" height="${WAVE_H}">
  ${cueLineSvgParts}
</svg>`;

    // Compose: waveform PNG (full strip width) + cue-line overlay on top.
    const waveformWithLines = await sharp({
      create: {
        width: stripW,
        height: WAVE_H,
        channels: 3,
        background: { r: 12, g: 12, b: 12 },
      },
    })
      .composite([
        { input: await sharp(wavePngPath).png().toBuffer(), left: 0, top: 0 },
        { input: Buffer.from(cueLineSvg), left: 0, top: 0 },
      ])
      .png()
      .toBuffer();

    // Waveform label strip
    const waveLabelSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${stripW}" height="${WAVE_LABEL_H}">
  <rect width="${stripW}" height="${WAVE_LABEL_H}" fill="#0e0e0e"/>
  <text x="${PAD}" y="17" font-family="-apple-system, Helvetica, sans-serif" font-size="13" font-weight="600" fill="#b0b0b0">voice.wav  ·  ${wavSeconds.toFixed(2)}s  ·  cue.startFrame markers in orange</text>
</svg>`;

    // ------------------------------------------------------------------- //
    // Step 4. Final compose: strip on top, waveform below.                //
    // ------------------------------------------------------------------- //
    const finalH = stripH + WAVE_H + WAVE_LABEL_H;
    const finalImg = sharp({
      create: {
        width: stripW,
        height: finalH,
        channels: 3,
        background: { r: 18, g: 18, b: 18 },
      },
    }).composite([
      { input: stripBuf, left: 0, top: 0 },
      { input: waveformWithLines, left: 0, top: stripH },
      { input: Buffer.from(waveLabelSvg), left: 0, top: stripH + WAVE_H },
    ]);

    const outPng = path.join(outDir, `${lessonId}-animatic.png`);
    await finalImg.png().toFile(outPng);

    const sidecar = {
      lessonId,
      composition,
      fps,
      wavPath,
      wavSeconds,
      dimensions: { width: stripW, height: finalH },
      source: extracted.source,
      cues: samplesByCue.map(({ cue, samples }) => ({
        id: cue.id,
        startFrame: cue.startFrame,
        endFrame: cue.endFrame,
        startSeconds: Number((cue.startFrame / fps).toFixed(3)),
        endSeconds: Number((cue.endFrame / fps).toFixed(3)),
        sampledFrames: samples.map((s) => ({ tag: s.tag, frame: s.frame })),
      })),
    };
    const outJson = path.join(outDir, `${lessonId}-animatic.json`);
    fs.writeFileSync(outJson, `${JSON.stringify(sidecar, null, 2)}\n`);

    const stat = fs.statSync(outPng);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(
      `\n== Animatic: ${outPng} (${stripW}x${finalH}, ${(stat.size / 1024).toFixed(0)} KB)`,
    );
    console.log(`== Sidecar:  ${outJson}`);
    console.log(`== Runtime:  ${elapsed}s`);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};

try {
  await main();
} catch (error) {
  console.error(error?.stack || error?.message || error);
  process.exitCode = 1;
}
