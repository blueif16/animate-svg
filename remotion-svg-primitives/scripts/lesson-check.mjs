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

  const outDir = path.resolve(process.cwd(), "out", config.lessonId);
  const bboxPath = path.join(outDir, "bbox-manifest.json");
  const sheetPath = path.join(outDir, `${config.lessonId}-contact.png`);
  const primitivesDir = path.join(outDir, "primitive-checks");

  // Review artifacts first (always produced), then the gate pass last so a
  // gate-fail exit still leaves the contact sheet + primitive stills to review.
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

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Lesson QC artifacts for ${config.lessonId}`);
  console.log("=".repeat(60));
  console.log(`  bbox manifest:    ${path.relative(process.cwd(), bboxPath)} (.measured block)`);
  console.log(`  contact sheet:    ${path.relative(process.cwd(), sheetPath)}`);
  console.log(`  primitive checks: ${path.relative(process.cwd(), primitivesDir)}`);

  // The MEASURED pass IS the bbox check — there is no separate fast linear pass.
  // The manifest is metadata-only ({id,zone}); geometry comes from the render
  // (getBBox), one source of truth. It bundles the lesson, SSR-renders the
  // motion-peak frames, and runs the overlap + bijection + caption + LUFS gates,
  // writing bbox-manifest.json. Run LAST: it exits 1 on a hard-gate failure
  // (bbox-binding / LUFS), and that exit propagates through `run` so a failing
  // lesson cannot read as green. `--measured` is accepted for back-compat but is
  // now a no-op (this always runs).
  run("Measured pass", "node", [
    "scripts/lesson-measured.mjs",
    "--config",
    args.config,
  ]);
};

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
