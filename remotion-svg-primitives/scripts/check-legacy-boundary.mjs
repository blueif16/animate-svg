#!/usr/bin/env node
// LEGACY-QUARANTINE BOUNDARY GATE — keeps the v4 path slim by FAILING if a
// non-legacy module reaches back into the quarantined legacy lesson path.
//
// Two rules, both must hold (each prints offenders + a non-zero exit on breach):
//   (a) Nothing OUTSIDE src/lessons/legacy/ may import from src/lessons/legacy/.
//       (The Studio barrel src/Composition.tsx is the ONE sanctioned bridge so
//       legacy fixtures stay browsable — it is the documented exception.)
//   (b) No v4 lesson timeline (src/lessons/*Timeline.ts, excluding legacy/) may
//       import `reconcileCueTimeline`, `findBoundarySilence`, or a `*Silences`
//       module — those are the pre-v4 silence-reconcile path.
//
// Run by `npm run lint` (and the pre-commit gate). Pure fs walk, no deps.
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(process.cwd(), "src");
const LESSONS = path.join(SRC, "lessons");
const LEGACY_DIR = path.join(LESSONS, "legacy");

// The single sanctioned bridge: the Studio barrel re-exports legacy lessons so
// they remain browsable compositions. Everything else is a boundary breach.
const ALLOWED_LEGACY_BRIDGES = new Set([path.join(SRC, "Composition.tsx")]);

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walk(abs, out);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) {
      out.push(abs);
    }
  }
  return out;
};

const isUnderLegacy = (abs) =>
  abs === LEGACY_DIR || abs.startsWith(LEGACY_DIR + path.sep);

// match `from "...legacy/..."` and `import("...legacy/...")` style specifiers
const LEGACY_IMPORT = /(?:from\s+|import\s*\(\s*)["']([^"']*\/lessons\/legacy\/[^"']*)["']/g;

const V4_BANNED = [
  { re: /reconcileCueTimeline/, label: "reconcileCueTimeline (pre-v4 reconcile)" },
  { re: /findBoundarySilence/, label: "findBoundarySilence (pre-v4 silence snap)" },
  { re: /from\s+["'][^"']*Silences["']/, label: "*Silences generated module" },
];

const violations = [];

// Rule (a): no outside-legacy import of legacy
for (const file of walk(SRC)) {
  if (isUnderLegacy(file)) continue;
  if (ALLOWED_LEGACY_BRIDGES.has(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  let m;
  while ((m = LEGACY_IMPORT.exec(text)) !== null) {
    violations.push(
      `[a] ${path.relative(process.cwd(), file)} imports legacy: "${m[1]}"`,
    );
  }
}

// Rule (b): no v4 lesson timeline imports the pre-v4 silence path
for (const file of walk(LESSONS)) {
  if (isUnderLegacy(file)) continue;
  if (!/Timeline\.ts$/.test(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const { re, label } of V4_BANNED) {
    if (re.test(text)) {
      violations.push(
        `[b] v4 timeline ${path.relative(process.cwd(), file)} imports ${label}`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error("Legacy-boundary gate FAILED:");
  for (const v of violations) console.error("  " + v);
  console.error(
    "\nThe v4 path must not depend on src/lessons/legacy/ or the pre-v4 silence reconcile.",
  );
  process.exit(1);
}

console.log("Legacy-boundary gate OK (v4 path is clean of legacy).");
