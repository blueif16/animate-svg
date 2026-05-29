#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const parseArgs = (argv) => {
  const args = { config: undefined };
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
    entry: config.entry,
  };
};

const toCamel = (kebab) =>
  kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const toPascal = (kebab) => {
  const camel = toCamel(kebab);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

const run = (label, command, args) => {
  console.log(`\n== ${label}`);
  execFileSync(command, args, { stdio: "inherit" });
};

// Parses remotion compositions table output and returns composition IDs.
// The table is rendered after a bundling progress section; each composition
// row begins with the ID as the first whitespace-separated token.
const parseCompositionIds = (stdout) => {
  const lines = stdout.split(/\r?\n/);
  const ids = [];
  const headerIdx = lines.findIndex((l) =>
    l.includes("The following compositions are available"),
  );
  const start = headerIdx === -1 ? 0 : headerIdx + 1;
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const token = line.split(/\s+/)[0];
    if (/^[A-Za-z][A-Za-z0-9]*$/.test(token)) {
      ids.push(token);
    }
  }
  return ids;
};

const main = async () => {
  const parsed = parseArgs(process.argv.slice(2));
  const args = mergeConfig(parsed);
  if (!args.lessonId || !args.entry) {
    throw new Error("pipeline.json missing lessonId/entry");
  }
  const prefix = `PrimitiveCheck${toPascal(args.lessonId)}`;

  console.log(`\n== List compositions (filter ${prefix}*)`);
  const stdout = execFileSync("npx", ["remotion", "compositions", args.entry], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const allIds = parseCompositionIds(stdout);
  const matches = allIds.filter((id) => id.startsWith(prefix));

  if (matches.length === 0) {
    console.log(`no primitive checks defined for ${args.lessonId}`);
    return;
  }

  const outDir = path.resolve(
    process.cwd(),
    "out",
    args.lessonId,
    "primitive-checks",
  );
  fs.mkdirSync(outDir, { recursive: true });

  for (const id of matches) {
    const bare = id.slice(prefix.length) || "default";
    const outPath = path.join(outDir, `${bare}.png`);
    run(`Still ${id}`, "npx", [
      "remotion",
      "still",
      args.entry,
      id,
      outPath,
    ]);
  }

  console.log(`\n${matches.length} primitive check(s) written to ${path.relative(process.cwd(), outDir)}`);
};

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
