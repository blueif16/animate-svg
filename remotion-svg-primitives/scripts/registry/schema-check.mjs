// Runnable check: loads primitive-registry.json and safeParses it against the
// Zod model in src/capabilities/schema.ts. Report-only sibling of the catalog —
// this is the canary that the schema still matches the current JSON shape.
//
// schema.ts is imported directly via Node's native TypeScript type-stripping
// (Node >= 22.6, default-on in >= 23). The schema is plain Zod (no enums /
// namespaces / decorators) so it strips cleanly with zero build step and no
// tsx/ts-node dependency. The npm script silences the experimental warning.
//
// Lives in scripts/registry/ (NOT src/) so `eslint src` — whose config targets
// browser/Remotion code — never lints this Node script. Mirrors the vlog_test
// layout (pipeline/registry/*.mjs separate from src).
//
// Run: npm run registry:schema-check
// Exits 1 on a parse failure so it can gate; exits 0 when the JSON matches.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {primitiveRegistrySchema} from "../../src/capabilities/schema.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", ".."); // remotion-svg-primitives
const registryPath = path.join(root, "src/capabilities/primitive-registry.json");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const result = primitiveRegistrySchema.safeParse(registry);

if (!result.success) {
  console.error("Registry schema check FAILED — schema.ts no longer matches the JSON:");
  for (const issue of result.error.issues) {
    console.error(`  - [${issue.path.join(".") || "<root>"}] ${issue.message}`);
  }
  console.error("\nFix schema.ts to match the JSON. Never edit the JSON to satisfy the schema.");
  process.exit(1);
}

const {primitives, motionComponents, fxComponents, lessonComponents, styles} = result.data;
console.log(
  `Registry schema check ok: ${primitives.length} primitives, ` +
    `${motionComponents.length} motion components, ${fxComponents.length} fx components, ` +
    `${lessonComponents.length} lesson-infra components, ${styles.length} styles — JSON matches schema.ts.`,
);
