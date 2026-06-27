#!/usr/bin/env node
// Render the lesson's PrimitiveCheck* stills (if any) at real lesson scale.
// LESSON-AGNOSTIC: no topic/id/frame literal.
//
// Bundling goes through the @remotion/bundler + @remotion/renderer NODE API,
// NOT `npx remotion …`. The CLI path triggers webpack's persistent-cache
// wasm-hash on Node 24, which crashes (`wasm-hash.js:151 reading 'length'`);
// the programmatic bundle() avoids it. Every other pipeline script
// (make-contact-sheet, lesson-measured, lesson-bbox-overlay) bundles this way
// for the same reason — keep them consistent.
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

// @remotion/bundler + @remotion/renderer are TRANSITIVE deps (via @remotion/cli);
// resolve them against the project-root package.json so a bare import from this
// subdir module resolves.
const requireFromRoot = createRequire(
  pathToFileURL(path.join(process.cwd(), "package.json")),
);
const importFromRoot = async (specifier) =>
  import(pathToFileURL(requireFromRoot.resolve(specifier)).href);

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
  return { ...args, lessonId: config.lessonId, entry: config.entry };
};

const toCamel = (kebab) =>
  kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const toPascal = (kebab) => {
  const camel = toCamel(kebab);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

const main = async () => {
  const parsed = parseArgs(process.argv.slice(2));
  const args = mergeConfig(parsed);
  if (!args.lessonId || !args.entry) {
    throw new Error("pipeline.json missing lessonId/entry");
  }
  const prefix = `PrimitiveCheck${toPascal(args.lessonId)}`;

  console.log(`\n== List compositions (filter ${prefix}*)`);
  const bundler = await importFromRoot("@remotion/bundler");
  const renderer = await importFromRoot("@remotion/renderer");
  const serveUrl = await bundler.bundle({
    entryPoint: path.resolve(process.cwd(), args.entry),
    // Disable webpack's shared persistent cache — parallel-fleet safe (see render-complete-lesson.mjs).
    enableCaching: false,
  });
  const comps = await renderer.getCompositions(serveUrl);
  const matches = comps.filter((c) => c.id.startsWith(prefix));

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

  for (const comp of matches) {
    const bare = comp.id.slice(prefix.length) || "default";
    const outPath = path.join(outDir, `${bare}.png`);
    console.log(`\n== Still ${comp.id}`);
    await renderer.renderStill({
      composition: comp,
      serveUrl,
      output: outPath,
      imageFormat: "png",
    });
  }

  console.log(
    `\n${matches.length} primitive check(s) written to ${path.relative(process.cwd(), outDir)}`,
  );
};

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
