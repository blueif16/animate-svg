#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const parseArgs = (argv) => {
  const args = { config: undefined, measured: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    // Boolean flag: opt-in MEASURED pass (additive; default path unchanged).
    if (arg === "--measured") {
      args.measured = true;
      continue;
    }
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

const run = (label, command, args) => {
  console.log(`\n== ${label}`);
  execFileSync(command, args, { stdio: "inherit" });
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config) {
    throw new Error("Missing required option: --config <path>");
  }
  const config = JSON.parse(fs.readFileSync(args.config, "utf8"));
  if (!config.lessonId) {
    throw new Error(`pipeline.json missing lessonId: ${args.config}`);
  }

  run("Bbox manifest", "node", [
    "scripts/lesson-manifest.mjs",
    "--config",
    args.config,
  ]);
  run("Contact sheet", "node", [
    "scripts/make-contact-sheet.mjs",
    "--config",
    args.config,
  ]);
  run("Primitive checks", "node", [
    "scripts/lesson-primitive-checks.mjs",
    "--config",
    args.config,
  ]);

  const outDir = path.resolve(process.cwd(), "out", config.lessonId);
  const bboxPath = path.join(outDir, "bbox-manifest.json");
  const sheetPath = path.join(outDir, `${config.lessonId}-contact.png`);
  const primitivesDir = path.join(outDir, "primitive-checks");

  // Opt-in MEASURED pass — runs AFTER the unchanged fast linear path. Renders
  // motion-peak frames via SSR, captures real-pixel/getBBox geometry, runs the
  // overlap + cheap gates, and AUGMENTS bbox-manifest.json with a `measured`
  // block (machine-gated-verification proposal §5). Default run never invokes
  // it, so the fast path is byte-identical to before.
  if (args.measured) {
    run("Measured pass (--measured)", "node", [
      "scripts/lesson-measured.mjs",
      "--config",
      args.config,
    ]);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Lesson QC artifacts for ${config.lessonId}`);
  console.log("=".repeat(60));
  console.log(`  bbox manifest:    ${path.relative(process.cwd(), bboxPath)}`);
  console.log(`  contact sheet:    ${path.relative(process.cwd(), sheetPath)}`);
  console.log(`  primitive checks: ${path.relative(process.cwd(), primitivesDir)}`);
  if (args.measured) {
    console.log(`  measured block:   ${path.relative(process.cwd(), bboxPath)} → .measured`);
  }
};

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
