// STAGE 5 — JSON-Schema export (generated artifact, regenerate-then-diff gated).
//
// Capability-registry-harness finish line. The Zod model in
// src/capabilities/schema.ts is the SOURCE OF TRUTH for the catalog shape. This
// script derives a JSON-Schema rendering of it
// (src/capabilities/primitive-registry.schema.json) so agents / editors / CI can
// validate the committed catalog without loading TypeScript. The .schema.json is
// a GENERATED artifact — never hand-edited; re-run `npm run registry:schema-export`
// (or registry:build) to regenerate.
//
// schema.ts is imported via Node's native TS type-stripping (Node >= 22.6), the
// same loader as scripts/registry/schema-check.mjs. The npm script silences the
// experimental warning (`node --no-warnings=ExperimentalWarning`).
//
// Two modes (mirroring build-registry.mjs):
//   (default / "build")  regenerate the schema and WRITE it to disk.
//   "--check"            regenerate in memory and DIFF against the committed
//                        file; exit non-zero (printing the first differing
//                        region) if they differ. Never writes.
//
// Idempotent: build on a clean tree, then again, produces no diff.
//
// Conventions: ESM, node:fs / node:path, standard library + zod (via schema.ts).

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {z} from "zod";
import {primitiveRegistrySchema} from "../../src/capabilities/schema.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const outPath = path.join(root, "src/capabilities/primitive-registry.schema.json");

const BANNER =
  "GENERATED from src/capabilities/schema.ts via z.toJSONSchema — do NOT hand-edit; " +
  "run `npm run registry:schema-export` (or registry:build) to regenerate.";

const buildSchemaText = () => {
  const schema = z.toJSONSchema(primitiveRegistrySchema);
  const withBanner = {$comment: BANNER, ...schema};
  return JSON.stringify(withBanner, null, 2) + "\n";
};

const firstDiffRegion = (committed, generated) => {
  const a = committed.split("\n");
  const b = generated.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) {
      const lines = [];
      if (a[i] !== undefined) lines.push(`  committed (line ${i + 1}): ${a[i]}`);
      if (b[i] !== undefined) lines.push(`  generated (line ${i + 1}): ${b[i]}`);
      return lines.join("\n");
    }
  }
  return "  (files differ only in length / trailing content)";
};

// --- main -------------------------------------------------------------------
const checkMode = process.argv.includes("--check");
const generated = buildSchemaText();

if (checkMode) {
  if (!fs.existsSync(outPath)) {
    console.error("registry:schema-export --check FAILED — the committed schema is missing:");
    console.error(`  ${path.relative(root, outPath)}`);
    console.error("\nRun `npm run registry:schema-export` to generate it.");
    process.exit(1);
  }
  const committed = fs.readFileSync(outPath, "utf8");
  if (committed === generated) {
    console.log(
      `registry:schema-export --check ok — ${path.relative(root, outPath)} in sync ` +
        "with src/capabilities/schema.ts (z.toJSONSchema).",
    );
    process.exit(0);
  }
  console.error(
    "registry:schema-export --check FAILED — the committed JSON-Schema is out of sync " +
      "with src/capabilities/schema.ts.",
  );
  console.error("Run `npm run registry:schema-export` to regenerate. First differing region:\n");
  console.error(firstDiffRegion(committed, generated));
  console.error("");
  process.exit(1);
}

// build mode
const prior = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : null;
if (prior === generated) {
  console.log(
    `registry:schema-export — no change. ${path.relative(root, outPath)} already in sync.`,
  );
} else {
  fs.writeFileSync(outPath, generated);
  console.log(
    `registry:schema-export — wrote ${path.relative(root, outPath)} from ` +
      "src/capabilities/schema.ts (z.toJSONSchema).",
  );
}
process.exit(0);
