#!/usr/bin/env node
// check-lesson-primitives — the lesson↔registry gate.
//
// WHY: a wave (the W3b gap-scan, or the W4a composer scene) can NAME a component that does not
// exist — a confabulated REUSE. In the kptest-fenyuhe-six run the gap-scan asserted "REUSE
// `RecapSpotlight`" for a component that is in NO barrel, NO registry, NO catalog-digest; the
// composer then burned a 30-min node-timeout hunting a phantom. `registry:check` gates catalog↔CODE
// sync; it does NOT gate lesson↔registry. This is that missing gate.
//
// The registry (primitive-registry.json, generated from the barrels, zod-validated) is the oracle of
// "what components exist". This script extracts every component a lesson artifact NAMES and verifies
// it is a member. A name that is not in the registry is a GAP, not a REUSE — full stop. There is NO
// per-component or per-lesson special-casing here (no hard-coded names, no heuristics about a row's
// prose): the rule is pure set membership against the generated registry, so it generalizes to every
// future lesson and every future component without edits.
//
// USAGE:
//   node scripts/registry/check-lesson-primitives.mjs <gap-scan.md | scene.tsx | lesson-id> [more...]
//   npm run registry:check-lesson -- lesson-data/<id>/primitive-gap-scan.md
// Exit 0 = every named component is registered; exit 1 = at least one phantom (named loudly).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REGISTRY = path.join(REPO, "src/capabilities/primitive-registry.json");

// --- the universe: every registered component identifier (the .component field across the
// generated component sections) + the framework built-ins a scene may legitimately mount. The
// framework set is EXTERNAL (Remotion/React), not our craft surface, so it is not in the registry
// by design; it is the only exemption and it is a fixed, lesson-agnostic list, not an allowlist of
// our own components. As more of our barrels are swept into the registry, this universe only grows
// — the gate never needs editing.
const FRAMEWORK = new Set([
  // Remotion built-ins a lesson scene composes with.
  "AbsoluteFill", "Sequence", "Series", "Freeze", "Loop", "Still", "Composition", "Folder",
  "Img", "Audio", "Video", "OffthreadVideo", "IFrame", "Gif",
  // React.
  "Fragment", "Suspense",
]);

function registryComponents() {
  const r = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
  const out = new Set();
  for (const key of Object.keys(r)) {
    if (!Array.isArray(r[key])) continue;
    for (const e of r[key]) if (e && typeof e.component === "string") out.add(e.component);
  }
  return out;
}

// Extract the component identifiers an artifact NAMES, from the two unambiguous component-reference
// contexts (so prose words / type names / EASE.* vocabulary never false-flag):
//   1. JSX opens:            <PascalName        (what the composer will actually mount)
//   2. reuse-table id cells: (`PascalName`)     (the gap-scan's "kebab-id (`Component`)" convention)
// Both are deliberately narrow — a bare backticked word is NOT treated as a component claim.
function namedComponents(text) {
  const names = new Set();
  for (const m of text.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) names.add(m[1]);
  for (const m of text.matchAll(/\(`([A-Z][A-Za-z0-9]*)`\)/g)) names.add(m[1]);
  return names;
}

// Resolve a CLI arg to a file: a real path, or a lesson-id → its gap-scan.
function resolveTarget(arg) {
  if (fs.existsSync(arg) && fs.statSync(arg).isFile()) return arg;
  const guess = path.join(REPO, "lesson-data", arg, "primitive-gap-scan.md");
  if (fs.existsSync(guess)) return guess;
  return null;
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("usage: check-lesson-primitives <gap-scan.md | scene.tsx | lesson-id> [...]");
  process.exit(2);
}

const REGISTERED = registryComponents();
let failed = false;

for (const arg of args) {
  const file = resolveTarget(arg);
  if (!file) { console.error(`✕ cannot resolve "${arg}" to a file or a lesson gap-scan`); failed = true; continue; }
  const text = fs.readFileSync(file, "utf8");
  const named = [...namedComponents(text)].sort();
  const missing = named.filter((n) => !REGISTERED.has(n) && !FRAMEWORK.has(n));
  const rel = path.relative(REPO, file);
  if (missing.length) {
    failed = true;
    console.error(`✕ ${rel}: ${missing.length} named component(s) NOT in the registry — a phantom REUSE is a GAP, not a reuse:`);
    for (const m of missing) {
      // nearest-by-substring hint (the confab is often primed by a real neighbour, e.g. OrderedRowSpotlight).
      const lower = m.toLowerCase();
      const near = [...REGISTERED].filter((c) => {
        const cl = c.toLowerCase();
        return cl.includes(lower.slice(0, 4)) || lower.includes(cl.slice(0, 4));
      }).slice(0, 3);
      console.error(`    • ${m}${near.length ? `   (did you mean: ${near.join(", ")}? — else BUILD it as a named GAP)` : "   (no near match — BUILD it as a named GAP)"}`);
    }
  } else {
    console.log(`✓ ${rel}: all ${named.length} named component(s) are registered`);
  }
}

process.exit(failed ? 1 : 0);
