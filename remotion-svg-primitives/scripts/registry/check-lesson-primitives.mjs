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

// The registry's kebab `id` → Pascal `component` map. A gap-scan may cite a primitive by its
// catalog id (the kebab handle, e.g. `comparison-symbol`) rather than the Pascal component name;
// this lets us RESOLVE such a citation to the component it names and membership-check it like any
// other. Built once from the same generated registry — no hard-coded ids, no per-lesson casing.
function registryIdToComponent() {
  const r = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
  const map = new Map();
  for (const key of Object.keys(r)) {
    if (!Array.isArray(r[key])) continue;
    for (const e of r[key]) {
      if (e && typeof e.id === "string" && typeof e.component === "string") map.set(e.id, e.component);
    }
  }
  return map;
}

// The DEPRECATED set: every registry entry with status:"deprecated", keyed by BOTH the kebab `id`
// and the PascalCase `component` (a lesson can cite either form), each mapped to that entry's
// supersededBy successor so the failure message tells the wave what to reach for instead. Same
// derivation as scripts/registry/check-deprecated-refs.mjs — derived from status, never hard-codes a
// name, so it generalizes to any future deprecation. WHY this is a SEPARATE gate from membership:
// a deprecated component is STILL in the registry (legacy imports must compile), so membership stays
// necessary but is no longer SUFFICIENT — a lesson citation must resolve to a LIVE entry. (The
// kp2-counting-by-tens run laundered a `bundle-wrap` REUSE through "ISSUES: None" precisely because
// membership EXIT-0'd it.)
function deprecatedTokens() {
  const r = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
  const map = new Map(); // token (kebab id OR Pascal component) -> { id, supersededBy }
  for (const key of Object.keys(r)) {
    if (!Array.isArray(r[key])) continue;
    for (const e of r[key]) {
      if (!e || e.status !== "deprecated") continue;
      const successor = typeof e.supersededBy === "string" && e.supersededBy
        ? e.supersededBy
        : "(supersededBy not set — set it on the deprecated registry entry)";
      if (typeof e.id === "string") map.set(e.id, { id: e.id, supersededBy: successor });
      if (typeof e.component === "string") map.set(e.component, { id: e.id, supersededBy: successor });
    }
  }
  return map;
}

const KEBAB_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/; // a multi-segment lowercase-kebab token

// Extract the component identifiers an artifact NAMES, from the unambiguous component-reference
// contexts (so prose words / type names / EASE.* vocabulary never false-flag):
//   1. JSX opens:            <PascalName        (what the composer will actually mount)
//   2. reuse-table id cells: (`PascalName`)     (the gap-scan's "kebab-id (`Component`)" convention)
//   3. backticked kebab id:  `kebab-id`         (the gap-scan's catalog-id handle — resolved to its
//                                                component via the registry id→component map below)
// (1)+(2) are deliberately narrow — a bare backticked PROSE word is never a component claim. (3)
// only fires on a multi-segment lowercase-kebab token (the catalog-id shape), so a backticked
// English word like `progress` or `mode` cannot false-flag.
//
// Returns { resolved, unresolvedKebab, citedKebab }:
//   resolved        — Set<Pascal component name> to membership-check (Pascal citations + every
//                     backticked kebab id that resolved through the registry id→component map)
//   unresolvedKebab — Set<kebab id> backticked-kebab citations that matched NO registry id (a
//                     PHANTOM kebab id — fails membership, exactly like a phantom Pascal name)
//   citedKebab      — Set<kebab id> every backticked-kebab catalog-id the artifact named (whether or
//                     not it resolved), so the liveness check can report the EXACT id the lesson cited
function namedComponents(text, idToComponent) {
  const resolved = new Set();
  const unresolvedKebab = new Set();
  const citedKebab = new Set();
  for (const m of text.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) resolved.add(m[1]);
  for (const m of text.matchAll(/\(`([A-Z][A-Za-z0-9]*)`\)/g)) resolved.add(m[1]);
  for (const m of text.matchAll(/`([a-z0-9][a-z0-9-]*)`/g)) {
    const id = m[1];
    if (!KEBAB_ID.test(id)) continue; // not a kebab catalog-id shape — ignore (prose/prop word)
    citedKebab.add(id);
    const comp = idToComponent.get(id);
    if (comp) resolved.add(comp);
    else unresolvedKebab.add(id);
  }
  return { resolved, unresolvedKebab, citedKebab };
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
const ID_TO_COMPONENT = registryIdToComponent();
const DEPRECATED = deprecatedTokens();
let failed = false;

// A gap-scan ROW that makes a REUSE/GAP claim about a primitive: a markdown table row carrying a
// reuse/gap verdict word or a "catalog id → component" column header. These are the rows the
// anti-vacuous guard treats as PROOF the file names primitives — so a file that has them but yields
// zero resolved component citations is a vacuous pass, not a clean bill.
const REUSE_VERDICT = /\b(REUSE|GAP|catalog id|catalog entry|→\s*component)\b/i;

for (const arg of args) {
  const file = resolveTarget(arg);
  if (!file) { console.error(`✕ cannot resolve "${arg}" to a file or a lesson gap-scan`); failed = true; continue; }
  const text = fs.readFileSync(file, "utf8");
  const { resolved, unresolvedKebab, citedKebab } = namedComponents(text, ID_TO_COMPONENT);
  const named = [...resolved].sort();
  const missing = named.filter((n) => !REGISTERED.has(n) && !FRAMEWORK.has(n));
  const rel = path.relative(REPO, file);

  // LIVENESS CHECK: a cited primitive that RESOLVES to a registry entry but that entry is
  // status:"deprecated" is a stale REUSE — membership is satisfied (legacy imports compile) but the
  // lesson must reach for the LIVE successor. Collect every deprecated citation in EITHER form (the
  // Pascal `component` among resolved names, or the kebab `id` among the cited kebab handles), keyed
  // by the deprecated entry's id so a dual-form citation reports once, with its supersededBy successor.
  const deprecatedHits = new Map(); // deprecated id -> { cited:Set<token>, supersededBy }
  const noteDeprecated = (token) => {
    const hit = DEPRECATED.get(token);
    if (!hit) return;
    const row = deprecatedHits.get(hit.id) ?? { cited: new Set(), supersededBy: hit.supersededBy };
    row.cited.add(token);
    deprecatedHits.set(hit.id, row);
  };
  for (const n of resolved) noteDeprecated(n);
  for (const id of citedKebab) noteDeprecated(id);

  // ANTI-VACUOUS GUARD: a gap-scan that clearly NAMES primitives (it carries reuse/gap table rows)
  // but from which the extractor pulled ZERO component citations is the silent vacuous pass this
  // gate exists to kill — "0 found" must NEVER read as "all good". The cause is a citation-FORMAT
  // hole: ids cited as BARE kebab (`comparison-symbol`) with no dual-form Pascal, so neither the
  // <Jsx nor the (`Pascal`) extractor matched and nothing got verified. (A real bare kebab that
  // happens to match a registry id DOES resolve above and is verified; this fires only when the
  // file names primitives yet resolved none — including a bare-kebab-only PHANTOM citation.)
  const namesPrimitives = REUSE_VERDICT.test(text);
  const vacuous = named.length === 0 && namesPrimitives;

  if (missing.length || vacuous || deprecatedHits.size) {
    failed = true;
    if (deprecatedHits.size) {
      console.error(`✕ ${rel}: ${deprecatedHits.size} cited primitive(s) resolve to a DEPRECATED registry entry — membership is not enough, a lesson must REUSE the LIVE successor:`);
      for (const [id, row] of deprecatedHits) {
        const cited = [...row.cited].map((t) => "`" + t + "`").join(" / ");
        console.error(`    • ${cited} is deprecated → reach for \`${row.supersededBy}\` instead (deprecated id: ${id})`);
      }
    }
    if (missing.length) {
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
    }
    if (vacuous) {
      console.error(`✕ ${rel}: 0 component citations extracted from a gap-scan that NAMES primitives (its rows carry REUSE/GAP verdicts) — a VACUOUS pass, not a clean bill. Fix the citation FORMAT: every reuse/gap row must cite the dual form  kebab-id (\`ComponentName\`)  so the gate can resolve + verify it.`);
      const phantomHints = [...unresolvedKebab].filter((id) => !ID_TO_COMPONENT.has(id)).slice(0, 8);
      if (phantomHints.length) {
        console.error(`    backticked kebab tokens seen but unresolved (cite each as  id (\`Component\`)  if it IS a primitive, else it is a GAP): ${phantomHints.map((id) => "`" + id + "`").join(", ")}`);
      }
    }
  } else {
    console.log(`✓ ${rel}: all ${named.length} named component(s) are registered`);
  }
}

process.exit(failed ? 1 : 0);
