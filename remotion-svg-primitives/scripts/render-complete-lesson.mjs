#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const parseArgs = (argv) => {
  const args = {
    composition: undefined,
    config: undefined,
    entry: undefined,
    output: undefined,
    skipBuild: false,
    skipLint: false,
    skipVoice: false,
    skipLoudnorm: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--skip-build") {
      args.skipBuild = true;
    } else if (arg === "--skip-lint") {
      args.skipLint = true;
    } else if (arg === "--skip-voice") {
      args.skipVoice = true;
    } else if (arg === "--skip-loudnorm") {
      args.skipLoudnorm = true;
    } else if (arg.startsWith("--")) {
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
    return args;
  }

  const config = JSON.parse(fs.readFileSync(args.config, "utf8"));
  const alignOutTs = args.alignOutTs ?? config.voice?.alignOutTs;
  return {
    ...args,
    composition: args.composition ?? config.composition,
    entry: args.entry ?? config.entry,
    output: args.output ?? config.output,
    lessonId: config.lessonId,
    alignOutTs,
    constPrefix: args.constPrefix ?? config.voice?.constPrefix,
    fps: args.fps ?? config.fps ?? 30,
    recording: args.recording ?? config.voice?.out,
  };
};

const requireFields = (args, fields) => {
  const missing = fields.filter((field) => !args[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required option(s): ${missing.join(", ")}`);
  }
};

// Per-step wall-clock timing (additive, reversible). run() records each step
// label + elapsed ms into stepTimings; main() flushes them to
// lesson-data/<id>/_logs/render-timing.json at the end. The wrapped command's
// stdio + exit behavior is unchanged — only timing is observed (recorded in a
// finally so a throwing step still logs). The subagent thinking-waves
// (pedagogy/storyboard/visual-design/audio/composer) are NOT script steps and
// can only be timed by the future Workflow orchestrator, not here.
const stepTimings = [];
const run = (label, command, args) => {
  console.log(`\n== ${label}`);
  const startedAt = Date.now();
  try {
    execFileSync(command, args, { stdio: "inherit" });
  } finally {
    stepTimings.push({ step: label, ms: Date.now() - startedAt });
  }
};

const flushTimings = (lessonId) => {
  if (!lessonId || stepTimings.length === 0) {
    return;
  }
  const logsDir = path.resolve(process.cwd(), "lesson-data", lessonId, "_logs");
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    const payload = {
      lessonId,
      generatedAt: new Date().toISOString(),
      totalMs: stepTimings.reduce((acc, t) => acc + t.ms, 0),
      steps: stepTimings,
    };
    fs.writeFileSync(
      path.join(logsDir, "render-timing.json"),
      `${JSON.stringify(payload, null, 2)}\n`,
    );
    console.log(
      `\n== Render timing (${payload.totalMs} ms total) -> ${path.relative(process.cwd(), path.join(logsDir, "render-timing.json"))}`,
    );
    for (const t of stepTimings) {
      console.log(`   ${String(t.ms).padStart(7)} ms  ${t.step}`);
    }
  } catch (error) {
    console.warn(`Render timing not written: ${error.message || error}`);
  }
};

const probe = (output) => {
  const result = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "stream=index,codec_type,codec_name,duration",
      "-of",
      "default=noprint_wrappers=1",
      output,
    ],
    { encoding: "utf8" },
  );

  if (result.error) {
    console.warn(`ffprobe unavailable: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    console.warn(result.stderr.trim() || "ffprobe failed");
    return;
  }

  console.log("\n== Media streams");
  console.log(result.stdout.trim());
};

// Bundle + render the lesson MP4 through the @remotion/bundler +
// @remotion/renderer NODE API — NOT the `remotion bundle`/`remotion render`
// CLI. The CLI path uses webpack's shared persistent cache
// (node_modules/.cache/webpack); written concurrently by the fleet's OTHER
// webpack invocations (lesson-measured, lesson:check) it deserializes an
// undefined buffer and crashes wasm-hash (wasm-hash.js:151 "reading 'length'")
// regardless of Node version. The programmatic bundle() uses a fresh temp
// bundle dir and never touches that shared cache — every other pipeline script
// (lesson-measured, make-contact-sheet, lesson-bbox-overlay,
// lesson-primitive-checks) already renders this way; this brings the full
// render into line with them so NOTHING in the pipeline reads the shared cache.
const renderLessonMedia = async ({ entry, composition, output }) => {
  const { bundle } = await import("@remotion/bundler");
  const { selectComposition, renderMedia } = await import("@remotion/renderer");
  const { enableTailwind } = await import("@remotion/tailwind-v4");

  const tBundle = Date.now();
  console.log("\n== Bundle");
  let serveUrl;
  try {
    serveUrl = await bundle({
      entryPoint: path.resolve(process.cwd(), entry),
      webpackOverride: enableTailwind,
    });
  } finally {
    stepTimings.push({ step: "Bundle", ms: Date.now() - tBundle });
  }

  const tRender = Date.now();
  console.log("\n== Render MP4");
  try {
    const comp = await selectComposition({
      serveUrl,
      id: composition,
      inputProps: {},
    });
    await renderMedia({
      serveUrl,
      composition: comp,
      codec: "h264",
      outputLocation: output,
      inputProps: {},
      imageFormat: "jpeg", // mirrors remotion.config.ts setVideoImageFormat
      overwrite: true, // mirrors remotion.config.ts setOverwriteOutput
    });
  } finally {
    stepTimings.push({ step: "Render MP4", ms: Date.now() - tRender });
  }
};

const main = async () => {
  const parsed = parseArgs(process.argv.slice(2));
  const args = mergeConfig(parsed);
  requireFields(args, ["composition", "entry", "output"]);
  const output = path.normalize(args.output);
  // All generated artifacts (mp4, contact sheet, manifests) live under
  // out/<lessonId>/. Ensure the directory exists before render so Remotion
  // can write the MP4 there.
  if (args.lessonId) {
    fs.mkdirSync(path.resolve(process.cwd(), "out", args.lessonId), {
      recursive: true,
    });
  } else {
    fs.mkdirSync(path.dirname(output), { recursive: true });
  }

  const timingExists = args.alignOutTs && fs.existsSync(args.alignOutTs);
  const shouldSkipVoice = args.skipVoice || timingExists;
  if (timingExists && !args.skipVoice) {
    console.log(`\n== Voice auto-skipped (timing module exists: ${args.alignOutTs})`);
    console.log("   Run `npm run lesson:voice -- --config <path>` to regenerate voice.");
  }
  if (!shouldSkipVoice) {
    if (!parsed.config) {
      throw new Error("Voice generation requires --config. Use --skip-voice for render-only runs.");
    }
    run("Voice generation + ASR alignment", "node", [
      "node_modules/@studio/narration-kit/bin/generate-voice.mjs",
      "--config",
      parsed.config,
      "--align",
    ]);
  }
  // v4 cue-anchored lessons reconcile from the per-cue clip module
  // (`<camelId>Clips.ts`). The pre-v4 ffmpeg silence-detection step is retired
  // from the render path (legacy lessons keep their already-generated
  // `<camelId>Silences.ts` under src/lessons/legacy/generated/; nothing
  // regenerates them here). `isV4` still gates the v4 audio gate below.
  const clipsModule =
    args.alignOutTs && args.alignOutTs.replace(/Timing\.ts$/u, "Clips.ts");
  const isV4 = clipsModule && fs.existsSync(clipsModule);

  // Deterministic audio gate (v4) — runs right after voice, before render, so a
  // held-vowel drone / untrimmed dead-air is caught by tool in seconds rather
  // than surfacing only when a human listens. Advisory (never blocks).
  if (isV4 && args.lessonId) {
    try {
      run("Audio gate", "node", [
        "scripts/lesson-audio-gate.mjs",
        "--lessonId",
        args.lessonId,
      ]);
    } catch (error) {
      console.warn(`Audio gate skipped: ${error.message || error}`);
    }
  }

  // Lesson registry — discover every Complete*Lesson.tsx that exports `lessonComposition`
  // and (re)write src/lessons/_lessonRegistry.generated.tsx BEFORE bundling, so a freshly
  // composed lesson is registered without anyone hand-editing Root.tsx. Deterministic + cheap.
  run("Lesson registry", "node", ["scripts/build-lesson-registry.mjs"]);

  if (!args.skipLint) {
    run("Typecheck + lint", "npm", ["run", "lint"]);
  }
  await renderLessonMedia({
    entry: args.entry,
    composition: args.composition,
    output,
  });
  probe(output);

  // Master loudness — normalize the mix to -16 LUFS / -1 dBTP via a TRUE
  // deterministic 2-pass loudnorm: pass 1 measures the master, pass 2 applies
  // LINEAR gain from the measured values (video copied so it stays
  // byte-stable), then a VERIFY re-measure prints the final file loudness.
  // NOTE on loudnorm print JSON: input_* IS the file being measured;
  // output_* describes a hypothetical further pass — NEVER report output_*
  // as the master's loudness.
  // Non-fatal: skip loudly if ffmpeg is unavailable or there is no audio.
  // See docs/proposals/sound-layer-integration.md §6 (resolves music open-item O2).
  if (!args.skipLoudnorm) {
    const normalized = output.replace(/\.mp4$/u, ".norm.mp4");
    const LOUDNORM = "I=-16:TP=-1.0:LRA=11";
    const measureLoudness = (label, file) => {
      console.log(`\n== ${label}`);
      const startedAt = Date.now();
      try {
        const res = spawnSync(
          "ffmpeg",
          [
            "-hide_banner",
            "-nostats",
            "-i",
            file,
            "-af",
            `loudnorm=${LOUDNORM}:print_format=json`,
            "-f",
            "null",
            "-",
          ],
          { encoding: "utf8" },
        );
        if (res.status !== 0) {
          throw new Error(
            `ffmpeg loudnorm measure failed (${res.status}): ${(res.stderr || "").slice(-400)}`,
          );
        }
        const text = `${res.stdout ?? ""}${res.stderr ?? ""}`;
        const json = text.slice(text.lastIndexOf("{"), text.lastIndexOf("}") + 1);
        return JSON.parse(json);
      } finally {
        stepTimings.push({ step: label, ms: Date.now() - startedAt });
      }
    };
    try {
      const m = measureLoudness("Loudnorm pass 1 (measure)", output);
      run("Loudnorm pass 2 (-16 LUFS / -1 dBTP, linear)", "ffmpeg", [
        "-y",
        "-i",
        output,
        "-af",
        `loudnorm=${LOUDNORM}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
        "-c:v",
        "copy",
        "-ar",
        "48000",
        normalized,
      ]);
      fs.renameSync(normalized, output);
      const v = measureLoudness("Loudnorm verify (re-measure)", output);
      console.log(
        `Loudnorm verified: I=${v.input_i} LUFS, TP=${v.input_tp} dBTP ` +
          `(target -16 LUFS / -1 dBTP; these input_* numbers ARE the master's loudness)`,
      );
    } catch (error) {
      console.warn(`Loudnorm skipped: ${error.message || error}`);
      try {
        if (fs.existsSync(normalized)) fs.unlinkSync(normalized);
      } catch {
        // best-effort cleanup
      }
    }
  }

  // Contact sheet — one PNG, every cue. Wave 6's primary review surface.
  // Non-fatal: skip silently if alignment isn't available (e.g., voice never ran).
  if (!args.skipContactSheet && parsed.config && args.alignOutTs) {
    try {
      run("Contact sheet", "node", [
        "scripts/make-contact-sheet.mjs",
        "--config",
        parsed.config,
      ]);
    } catch (error) {
      console.warn(`Contact sheet skipped: ${error.message || error}`);
    }
  }

  flushTimings(args.lessonId);

  console.log(`\nDone: ${output}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
