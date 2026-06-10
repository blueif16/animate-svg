// STAGE 2 — recency generator for the registry-driven Component Gallery.
//
// The gallery's "Recently added / changed" band answers "what's newest?"
// without manual upkeep: this generator stamps EVERY catalogued component with
// a git-sourced recency timestamp, the gallery sorts by it, and the band /
// per-cell date chip fall out automatically. No hardcoded component list — it
// reads primitive-registry.json (the source of truth) and walks every entry's
// `source` path, so a new primitive auto-appears with a fresh date.
//
// Recency per component (deterministic, git-as-truth):
//   - DEFAULT: last commit time of the source file —
//       `git log -1 --format=%ct -- <source>` (unix seconds).
//   - FALLBACK to the file's mtime when the working tree has UNCOMMITTED
//     changes for that source (`git status --porcelain <source>` non-empty) OR
//     the file has no git history yet — so a just-edited / just-added component
//     floats to the top of the band immediately.
//
// Writes src/capabilities/recency.json:
//   { "<id>": { "ts": <unixSeconds>, "iso": "YYYY-MM-DD" }, ... }
// keyed by registry id, sorted by id for a stable, reviewable diff.
//
// NOTE: this is COMMITTED but UNGATED — timestamps move on every commit, so
// `registry:check` must NOT diff it (it would fail constantly). It regenerates
// as part of `registry:build`.
//
// Conventions: ESM, node:fs / node:path / node:child_process, standard library
// only — no deps. Mirrors build-registry.mjs's here/root + read pattern.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {spawnSync} from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", ".."); // remotion-svg-primitives

const P = {
  registry: path.join(root, "src/capabilities/primitive-registry.json"),
  out: path.join(root, "src/capabilities/recency.json"),
};

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

// Run a git command with cwd=root; return trimmed stdout ("" on any failure).
const git = (args) => {
  const r = spawnSync("git", args, {cwd: root, encoding: "utf8"});
  if (r.status !== 0 || r.error) return "";
  return (r.stdout ?? "").trim();
};

// File mtime in whole unix seconds (fallback when uncommitted / untracked).
const mtimeSeconds = (relSource) => {
  const abs = path.join(root, relSource);
  try {
    return Math.floor(fs.statSync(abs).mtimeMs / 1000);
  } catch {
    return 0;
  }
};

// Recency for one source file: committed time, unless the working tree has
// uncommitted changes or there is no git history — then the file mtime so a
// just-edited / just-added component floats to the top.
const recencyForSource = (relSource) => {
  const dirty = git(["status", "--porcelain", "--", relSource]) !== "";
  const committed = git(["log", "-1", "--format=%ct", "--", relSource]);
  if (dirty || !committed) return mtimeSeconds(relSource) || Number(committed) || 0;
  return Number(committed);
};

const isoDay = (ts) => new Date(ts * 1000).toISOString().slice(0, 10); // YYYY-MM-DD

// Every catalogued component across the generated component sections. No
// hardcoded list — the registry is the source of truth.
const allEntries = () => {
  const reg = readJson(P.registry);
  return [
    ...(reg.primitives ?? []),
    ...(reg.motionComponents ?? []),
    ...(reg.fxComponents ?? []),
    ...(reg.lessonComponents ?? []),
  ];
};

const buildRecency = () => {
  const map = {};
  for (const e of allEntries()) {
    if (!e.id || !e.source) continue;
    const ts = recencyForSource(e.source);
    map[e.id] = {ts, iso: isoDay(ts)};
  }
  // Sort by id for a deterministic, reviewable diff.
  const sorted = {};
  for (const id of Object.keys(map).sort()) sorted[id] = map[id];
  return sorted;
};

const serialize = (obj) => JSON.stringify(obj, null, 2) + "\n";

// --- main -------------------------------------------------------------------
const generated = serialize(buildRecency());
const prior = fs.existsSync(P.out) ? fs.readFileSync(P.out, "utf8") : null;

if (prior === generated) {
  console.log("registry:recency — no change.");
} else {
  fs.writeFileSync(P.out, generated);
  const n = Object.keys(JSON.parse(generated)).length;
  console.log(`registry:recency — wrote ${path.relative(root, P.out)} (${n} components stamped).`);
}
process.exit(0);
