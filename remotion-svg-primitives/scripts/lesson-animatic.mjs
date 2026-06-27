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

// ---------------------------------------------------------------------------
// No-scene fallback (runs at W3.5, before the W4 composer registers the scene).
//
// Renders the cue-boundary animatic from the RECONCILED TIMELINE MODULE ALONE:
//   - one card per cue (cue id + window + narration sub-window + clip placement)
//   - below each card, that cue's OWN voice-clip waveform, drawn inside a bracket
//     of the cue window so a clip that overruns is visible at a glance
//   - the clips-fit-windows VERDICT (pass/fail per clip + overall)
//
// Same artifact path/shape as the scene path:
//   out/<lessonId>/<lessonId>-animatic.png  +  -animatic.json
// The sidecar additionally carries a `verdict` block (the pass/fail signal).
// ---------------------------------------------------------------------------
const runNoSceneFallback = async ({
  cues,
  fps,
  voiceClips,
  lessonId,
  composition,
  wavPath,
  outDir,
  tmpDir,
  source,
  t0,
}) => {
  const sharpMod = await import("sharp");
  const sharp = sharpMod.default;

  // Per-cue clip placement, keyed by cue id. When the timeline module did not
  // export VoiceClips (legacy/raw), synthesize the placement from the cue's
  // narration sub-window so the verdict still has something to check.
  const clipByCueId = new Map(
    (voiceClips ?? []).map((vc, i) => {
      // VoiceClips are emitted in storyboard (cue) order; pair positionally with
      // cues, but key by id when the cue exists at that index.
      const cue = cues[i];
      return [cue ? cue.id : `__clip_${i}`, vc];
    }),
  );
  const placementForCue = (cue) => {
    const vc = clipByCueId.get(cue.id);
    if (vc) {
      return {
        src: vc.src,
        fromFrame: vc.fromFrame,
        durationInFrames: vc.durationInFrames,
        synthesized: false,
      };
    }
    // Fallback synthesis from the narration sub-window.
    const nStart = cue.narrationStartFrame ?? cue.startFrame;
    const nEnd = cue.narrationEndFrame ?? cue.startFrame;
    return {
      src: null,
      fromFrame: nStart,
      durationInFrames: Math.max(0, nEnd - nStart),
      synthesized: true,
    };
  };

  // Verdict: each clip must sit fully inside its cue window.
  const verdictRows = cues.map((cue) => {
    const p = placementForCue(cue);
    const clipStart = p.fromFrame;
    const clipEnd = p.fromFrame + p.durationInFrames;
    const fits = clipStart >= cue.startFrame && clipEnd <= cue.endFrame;
    const overrunFrames = Math.max(0, clipEnd - cue.endFrame);
    const underrunFrames = Math.max(0, cue.startFrame - clipStart);
    return {
      id: cue.id,
      cueStartFrame: cue.startFrame,
      cueEndFrame: cue.endFrame,
      clipFromFrame: clipStart,
      clipEndFrame: clipEnd,
      clipSrc: p.src,
      synthesized: p.synthesized,
      fits,
      overrunFrames,
      underrunFrames,
    };
  });
  const failures = verdictRows.filter((r) => !r.fits);
  const pass = failures.length === 0;

  // ── Layout. Same card dims as the scene strip; one card per cue. ──
  const CARD_W = THUMB_W; // reuse the strip metrics for a consistent artifact
  const CARD_H = THUMB_H;
  const CUE_GAP = 16;
  const stripW = PAD * 2 + cues.length * CARD_W + (cues.length - 1) * CUE_GAP;
  const stripH = PAD + CARD_H + LABEL_H + PAD;

  // Pixels-per-frame is computed PER CUE so each card's internal clip bar maps
  // the clip placement into the cue window proportionally.
  const cardSvg = (cue, p, row) => {
    const dur = Math.max(1, cue.endFrame - cue.startFrame);
    const innerW = CARD_W - 24;
    const innerLeft = 12;
    const barY = 96;
    const barH = 26;
    const pxPerFrame = innerW / dur;
    const clipLeft =
      innerLeft + (p.fromFrame - cue.startFrame) * pxPerFrame;
    const clipW = Math.max(2, p.durationInFrames * pxPerFrame);
    const clipColor = row.fits ? "#66bb6a" : "#ef5350";
    const cueSec = (dur / fps).toFixed(1);
    const narrSec = (p.durationInFrames / fps).toFixed(1);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}">
  <rect width="${CARD_W}" height="${CARD_H}" fill="#161616" stroke="#2a2a2a"/>
  <text x="12" y="28" font-family="-apple-system, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#fafafa">${escapeSvg(truncate(cue.id, 28))}</text>
  <text x="12" y="50" font-family="-apple-system, Helvetica, sans-serif" font-size="12" fill="#9e9e9e">cue f${cue.startFrame}–${cue.endFrame} · ${cueSec}s</text>
  <text x="12" y="68" font-family="-apple-system, Helvetica, sans-serif" font-size="12" fill="#9e9e9e">clip f${p.fromFrame}–${p.fromFrame + p.durationInFrames} · ${narrSec}s${p.synthesized ? " (synth)" : ""}</text>
  <!-- cue window track -->
  <rect x="${innerLeft}" y="${barY}" width="${innerW}" height="${barH}" rx="3" fill="#0d0d0d" stroke="#3a3a3a"/>
  <!-- clip placement bar -->
  <rect x="${clipLeft.toFixed(1)}" y="${barY}" width="${clipW.toFixed(1)}" height="${barH}" rx="3" fill="${clipColor}" opacity="0.85"/>
  <text x="12" y="${barY + barH + 22}" font-family="-apple-system, Helvetica, sans-serif" font-size="13" font-weight="700" fill="${clipColor}">${row.fits ? "FITS" : `OVERRUN +${row.overrunFrames}f`}</text>
</svg>`;
  };

  // ── Render each cue's clip waveform (its own WAV) to a tile. ──
  console.log(`== Rendering ${cues.length} per-cue clip waveforms...`);
  const waveTiles = [];
  for (let i = 0; i < cues.length; i += 1) {
    const cue = cues[i];
    const p = placementForCue(cue);
    let waveBuf = null;
    // clipSrc is public/-relative; resolve it against public/.
    const clipAbs = p.src
      ? path.resolve(process.cwd(), "public", p.src)
      : null;
    if (clipAbs && fs.existsSync(clipAbs)) {
      const wavePngPath = path.join(tmpDir, `clipwave-${i}.png`);
      const ff = spawnSync(
        "ffmpeg",
        [
          "-y",
          "-i",
          clipAbs,
          "-filter_complex",
          `showwavespic=s=${CARD_W}x${WAVE_H}:colors=#7e9cff`,
          "-frames:v",
          "1",
          wavePngPath,
        ],
        { encoding: "utf8" },
      );
      if (ff.status === 0 && fs.existsSync(wavePngPath)) {
        waveBuf = await sharp(wavePngPath).png().toBuffer();
      }
    }
    waveTiles.push(waveBuf);
  }

  // ── Compose: cue cards on the strip row, clip waveforms below each card. ──
  const composites = [];
  for (let i = 0; i < cues.length; i += 1) {
    const cue = cues[i];
    const p = placementForCue(cue);
    const row = verdictRows[i];
    const groupLeft = PAD + i * (CARD_W + CUE_GAP);
    composites.push({
      input: Buffer.from(cardSvg(cue, p, row)),
      left: groupLeft,
      top: PAD,
    });
    // A small label band under the card matching the scene strip's LABEL_H.
    const labelSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${LABEL_H}">
  <rect width="${CARD_W}" height="${LABEL_H}" fill="#0e0e0e"/>
  <text x="6" y="19" font-family="-apple-system, Helvetica, sans-serif" font-size="13" font-weight="600" fill="${row.fits ? "#b0b0b0" : "#ef5350"}">${escapeSvg(truncate(p.src ? path.basename(p.src) : "(no clip)", 40))}</text>
</svg>`;
    composites.push({
      input: Buffer.from(labelSvg),
      left: groupLeft,
      top: PAD + CARD_H,
    });
    // Clip waveform tile below the strip (per cue).
    if (waveTiles[i]) {
      composites.push({ input: waveTiles[i], left: groupLeft, top: stripH });
    } else {
      const noWaveSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${WAVE_H}">
  <rect width="${CARD_W}" height="${WAVE_H}" fill="#0c0c0c"/>
  <text x="8" y="${WAVE_H / 2}" font-family="-apple-system, Helvetica, sans-serif" font-size="12" fill="#666">clip WAV unavailable</text>
</svg>`;
      composites.push({
        input: Buffer.from(noWaveSvg),
        left: groupLeft,
        top: stripH,
      });
    }
  }

  // Header label band over the waveform region.
  const finalH = stripH + WAVE_H + WAVE_LABEL_H;
  const waveLabelSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${stripW}" height="${WAVE_LABEL_H}">
  <rect width="${stripW}" height="${WAVE_LABEL_H}" fill="#0e0e0e"/>
  <text x="${PAD}" y="17" font-family="-apple-system, Helvetica, sans-serif" font-size="13" font-weight="600" fill="${pass ? "#66bb6a" : "#ef5350"}">TIMELINE-ONLY animatic (no scene yet) · per-cue clip waveforms · verdict: ${pass ? "PASS — every clip fits its cue window" : `FAIL — ${failures.length} clip(s) overrun`}</text>
</svg>`;
  composites.push({
    input: Buffer.from(waveLabelSvg),
    left: 0,
    top: stripH + WAVE_H,
  });

  const finalImg = sharp({
    create: {
      width: stripW,
      height: finalH,
      channels: 3,
      background: { r: 18, g: 18, b: 18 },
    },
  }).composite(composites);

  const outPng = path.join(outDir, `${lessonId}-animatic.png`);
  await finalImg.png().toFile(outPng);

  const sidecar = {
    lessonId,
    composition,
    fps,
    wavPath,
    source,
    mode: "timeline-only-fallback",
    dimensions: { width: stripW, height: finalH },
    verdict: {
      pass,
      failingCues: failures.map((f) => f.id),
      rows: verdictRows,
    },
    cues: cues.map((cue) => ({
      id: cue.id,
      startFrame: cue.startFrame,
      endFrame: cue.endFrame,
      startSeconds: Number((cue.startFrame / fps).toFixed(3)),
      endSeconds: Number((cue.endFrame / fps).toFixed(3)),
    })),
  };
  const outJson = path.join(outDir, `${lessonId}-animatic.json`);
  fs.writeFileSync(outJson, `${JSON.stringify(sidecar, null, 2)}\n`);

  const stat = fs.statSync(outPng);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(
    `\n== Animatic (timeline-only): ${outPng} (${stripW}x${finalH}, ${(stat.size / 1024).toFixed(0)} KB)`,
  );
  console.log(`== Sidecar:  ${outJson}`);
  console.log(
    `== VERDICT:  ${pass ? "PASS — every clip fits its cue window" : `FAIL — ${failures.length} clip(s) overrun: ${failures.map((f) => `${f.id} (+${f.overrunFrames}f)`).join(", ")}`}`,
  );
  console.log(`== Runtime:  ${elapsed}s`);
  if (!pass) {
    process.exitCode = 1;
  }
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
  // Step 0. Decide scene-based vs no-scene fallback.                       //
  //                                                                        //
  // The lesson SCENE composition is registered by the W4 composer. At W3.5 //
  // (where this gate runs) a FRESH lesson has no scene yet, so we cannot    //
  // render scene stills. The gate's load-bearing job at W3.5 is only to     //
  // confirm each cue's voice CLIP sits inside its reconciled cue window —   //
  // which needs ONLY the reconciled timeline module. So we probe the bundle //
  // for the composition id and, when it is absent (or un-renderable),       //
  // fall back to a timeline-only animatic: synthetic per-cue cards + the    //
  // per-clip waveforms + the clips-fit-windows verdict. When the scene IS   //
  // registered (at/after W4) the original scene-still path runs verbatim.   //
  // --------------------------------------------------------------------- //
  const { bundle } = await import("@remotion/bundler");
  const { selectComposition, getCompositions, renderStill } = await import(
    "@remotion/renderer"
  );

  console.log("== Bundling...");
  const tBundle = Date.now();
  const serveUrl = await bundle({
    entryPoint: path.resolve(process.cwd(), entry),
    // Disable webpack's shared persistent cache — parallel-fleet safe (see render-complete-lesson.mjs).
    enableCaching: false,
  });
  console.log(`   bundled in ${((Date.now() - tBundle) / 1000).toFixed(1)}s`);

  // Probe: is THIS lesson's scene composition registered in the bundle?
  let comp = null;
  let sceneAvailable = false;
  try {
    const registered = await getCompositions(serveUrl, { inputProps: {} });
    if (registered.some((c) => c.id === composition)) {
      comp = await selectComposition({ serveUrl, id: composition, inputProps: {} });
      sceneAvailable = true;
    } else {
      console.log(
        `== NO-SCENE FALLBACK: composition "${composition}" is not registered yet ` +
          `(W4 composer has not run) — rendering the timeline-only animatic ` +
          `(cue cards + per-clip waveforms + clips-fit-windows verdict).`,
      );
    }
  } catch (probeErr) {
    // Bundle enumeration / composition lookup failed (e.g. composition genuinely
    // missing). Fall back rather than abort the W3.5 gate.
    console.log(
      `== NO-SCENE FALLBACK: could not resolve composition "${composition}" ` +
        `(${probeErr?.message || probeErr}) — rendering the timeline-only animatic.`,
    );
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "animatic-"));
  const samplesByCue = []; // { cue, samples: [{tag, frame, tilePath}] }

  try {
    if (!sceneAvailable) {
      await runNoSceneFallback({
        cues,
        fps,
        voiceClips: extracted.voiceClips ?? [],
        lessonId,
        composition,
        wavPath,
        outDir,
        tmpDir,
        source: extracted.source,
        t0,
      });
      return;
    }

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
