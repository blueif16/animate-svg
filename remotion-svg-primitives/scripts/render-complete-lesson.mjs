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

const deriveSilenceOutTs = (alignOutTs) =>
  alignOutTs ? alignOutTs.replace(/Timing\.ts$/u, "Silences.ts") : undefined;

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
    silenceOutTs:
      args.silenceOutTs ?? config.voice?.silenceOutTs ?? deriveSilenceOutTs(alignOutTs),
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

const main = () => {
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
  // Silence detection — runs every render. Cheap (<1s) and frees the timeline
  // reconcile from trusting ASR matchText offsets. Required for the
  // silence-aware reconcile pattern (docs/pipeline-architecture.md).
  if (args.recording && args.silenceOutTs && args.constPrefix && fs.existsSync(args.recording)) {
    run("Silence detection", "node", [
      "node_modules/@studio/narration-kit/bin/detect-silences.mjs",
      "--recording",
      args.recording,
      "--out-ts",
      args.silenceOutTs,
      "--const-prefix",
      args.constPrefix,
      "--fps",
      String(args.fps),
    ]);
  } else if (args.silenceOutTs) {
    console.log(
      `\n== Silence detection skipped (missing recording or constPrefix; expected ${args.recording})`,
    );
  }

  if (!args.skipLint) {
    run("Typecheck + lint", "npm", ["run", "lint"]);
  }
  if (!args.skipBuild) {
    run("Bundle", "npm", ["run", "build"]);
  }

  run("Render MP4", "npx", [
    "remotion",
    "render",
    args.entry,
    args.composition,
    output,
  ]);
  probe(output);

  // Master loudness — normalize the mix to -16 LUFS / -1 dBTP (single-pass
  // loudnorm, video copied so it stays byte-stable). Deterministic 2nd pass.
  // Non-fatal: skip silently if ffmpeg is unavailable or there is no audio.
  // See docs/proposals/sound-layer-integration.md §6 (resolves music open-item O2).
  if (!args.skipLoudnorm) {
    const normalized = output.replace(/\.mp4$/u, ".norm.mp4");
    try {
      run("Loudnorm (-16 LUFS / -1 dBTP)", "ffmpeg", [
        "-y",
        "-i",
        output,
        "-af",
        "loudnorm=I=-16:TP=-1.0:LRA=11",
        "-c:v",
        "copy",
        "-ar",
        "48000",
        normalized,
      ]);
      fs.renameSync(normalized, output);
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

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
