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
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--skip-build") {
      args.skipBuild = true;
    } else if (arg === "--skip-lint") {
      args.skipLint = true;
    } else if (arg === "--skip-voice") {
      args.skipVoice = true;
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
  return {
    ...args,
    composition: args.composition ?? config.composition,
    entry: args.entry ?? config.entry,
    output: args.output ?? config.output,
  };
};

const requireFields = (args, fields) => {
  const missing = fields.filter((field) => !args[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required option(s): ${missing.join(", ")}`);
  }
};

const run = (label, command, args) => {
  console.log(`\n== ${label}`);
  execFileSync(command, args, { stdio: "inherit" });
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

  if (!args.skipVoice) {
    if (!parsed.config) {
      throw new Error("Voice generation requires --config. Use --skip-voice for render-only runs.");
    }
    run("Voice generation + ASR alignment", "node", [
      "scripts/generate-gemini-voice.mjs",
      "--config",
      parsed.config,
      "--align",
    ]);
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
  console.log(`\nDone: ${output}`);
};

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
