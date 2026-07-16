#!/usr/bin/env node
// w3b-primitive-build — HARD measure: the AESTHETIC-STILLS FLOOR.
//
// PROVEN HOLE (adversarial pass, 2026-07-09): criteria.md C5 ("Aesthetic quality independently VERIFIED") was
// SOFT-ONLY — a text-only blind judge reading the artifact/tier-2-log prose has no way to SEE a PNG, so a
// fabricated claim like "stills rendered; finger-cover passed" sails through the judge on exactly the
// highest-stakes path: a NEW primitive shipped, the one place a bad/unverified look becomes a PERMANENT
// catalog defect every FUTURE lesson inherits (memory.md's own "Active invariants": "never committed without
// test stills the node itself looked at — declaring aesthetic quality from code alone is a hard-floor breach,
// not a judgment call"). This script IS that missing hard floor: it runs post-run, out-of-band, and FAILS,
// unconditionally, when a primitive was registered this run but zero stills exist on disk. A prose claim never
// substitutes for the file.
//
// STRUCTURAL gap-detection (never a prose regex over the artifact). "Did a primitive ship this run" is
// answered by diffing `primitive-registry.json`'s component ids NOW against the git HEAD revision of the SAME
// file — any id present now but absent from HEAD was registered by THIS run. This deliberately does NOT repeat
// the mistake in `check-lesson-primitives.mjs`'s own "ANTI-VACUOUS GUARD" (`REUSE_VERDICT`, a 5-alternative
// keyword regex — `REUSE|GAP|catalog id|catalog entry|→ component` — deciding "does this artifact name
// primitives" from the artifact's ENGLISH PROSE; that script is product code, out of this node's edit scope,
// so it is recorded as a residual product-hardening candidate, not fixed here). This measure instead reads the
// registry — the SAME code-as-truth oracle every other w3b measure already trusts (see the `primitive-registry`
// OKF slice) — never the gap-scan's prose. Zero ambiguity, zero keyword tuning, generalizes to any future gap.
//
// SURFACES A HARD AGGREGATE VERDICT. The two pre-existing w3b `optimize.measure` ops are bare `run` bodies with
// no declared `writes`, so the substrate's `graded` numeric map (`runSubstrateMeasure`, measure.ts) was
// structurally EMPTY for this node — triage's own harness is told to read `graded` (piflow-triage skill, Step
// 0: "the HARD measure report — the graded gate axes") but found nothing there. This op declares `writes`, so
// its numeric leaves (`stillsFloorPass` / `stillsFloorSkipped` / `newPrimitivesShipped` / `stillsCount`) fold
// straight into `graded` — a real aggregate number triage can finally act on, not just an `ops.runs[].failed`
// boolean buried in a sub-array.
//
// Fail-CLOSED throughout (piflow-overlord building-measures.md "HOW"): an unresolvable lessonId, an unreadable
// registry, or a `git show` failure are NEVER silently read as a pass — each reports `stillsFloorPass:0` +
// `stillsFloorSkipped:1` (a recorded, VISIBLE skip, never a vacuous `ok:true`) and exits 1, exactly like a
// genuine floor breach. Only a run that resolves everything AND either shipped nothing (the floor is N/A) or
// shipped a primitive with ≥1 real still on disk reports `stillsFloorPass:1`.
//
// Usage: node check-aesthetic-stills.mjs <runDir> <workspaceDir>

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const NODE_ID = 'w3b-primitive-build';
const REGISTRY_REL = 'remotion-svg-primitives/src/capabilities/primitive-registry.json';

const [, , runDir, workspace] = process.argv;

const report = {
  node: NODE_ID,
  generatedAt: new Date().toISOString(),
  runDir: runDir ?? null,
  workspace: workspace ?? null,
  lessonId: null,
  newPrimitiveIds: [],
  newPrimitivesShipped: 0, // count — numeric leaf, folds into the substrate `graded` map
  stillsDir: null,
  stillsCount: 0, // count of .png/.jpg stills found — numeric leaf
  stillsFloorSkipped: 1, // 1|0 — fail-closed DEFAULT; flips to 0 only once genuinely evaluated
  stillsFloorPass: 0, // 1|0 — fail-closed DEFAULT; flips to 1 only on a PROVEN pass
  reason: null,
};

function reportPath(dir) {
  return path.join(dir, 'optimize', 'substrate', 'w3b-primitive-build-stills.json');
}

function writeReport(dir) {
  try {
    const out = reportPath(dir);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2));
  } catch {
    /* a report-write failure must never mask the exit code below — best-effort only */
  }
}

function failClosed(reason) {
  report.reason = reason;
  if (runDir) writeReport(runDir);
  process.stderr.write(`FAIL (fail-closed): ${reason}\n`.slice(0, 400));
  process.exit(1);
}

/** Every registry entry's `id` across ALL array-valued top-level sections (primitives / motionComponents /
 *  fxComponents / … — same generic iteration `check-lesson-primitives.mjs`'s `registryComponents()` uses, so a
 *  new registry section never needs this script edited). */
function collectIds(registryJson) {
  const ids = new Set();
  for (const key of Object.keys(registryJson)) {
    const section = registryJson[key];
    if (!Array.isArray(section)) continue;
    for (const e of section) if (e && typeof e.id === 'string') ids.add(e.id);
  }
  return ids;
}

if (!runDir || !workspace) failClosed('usage: check-aesthetic-stills.mjs <runDir> <workspaceDir>');

// ---- 1. discover this run's lessonId from the RECORDED artifact path (never {{arg.lessonId}} in the op's own
// path/args — an `optimize.measure` op resolves against the run's PERSISTED args, and no real run sampled in
// this repo persists an args block, so an arg-lessonId-keyed path silently drops into `ops.rejected`, never
// evaluated at all — see this node's sibling measures / w0-pedagogy's measures.md for the same finding). ----
let runJson;
try {
  runJson = JSON.parse(fs.readFileSync(path.join(runDir, '.pi', 'run.json'), 'utf8'));
} catch (e) {
  failClosed(`unreadable/unparseable .pi/run.json: ${e.message}`);
}
const nodeRec = runJson.nodes && runJson.nodes[NODE_ID];
const artifact = nodeRec && Array.isArray(nodeRec.artifacts)
  ? nodeRec.artifacts.find((a) => typeof a?.path === 'string' && a.path.includes('/lesson-data/'))
  : null;
const lessonMatch = artifact && /\/lesson-data\/([^/]+)\//.exec(artifact.path);
if (!lessonMatch) {
  failClosed(
    `no lesson-data artifact recorded for node "${NODE_ID}" in run.json (status=${nodeRec ? nodeRec.status : 'MISSING'})`,
  );
}
const lessonId = lessonMatch[1];
report.lessonId = lessonId;

// ---- 2. STRUCTURAL gap-detection: registry ids NOW vs the git HEAD revision of the SAME file. ----
const registryAbsPath = path.join(workspace, REGISTRY_REL);
let currentIds;
try {
  currentIds = collectIds(JSON.parse(fs.readFileSync(registryAbsPath, 'utf8')));
} catch (e) {
  failClosed(`unreadable/unparseable primitive-registry.json: ${e.message}`);
}

let headIds;
try {
  const headText = execFileSync('git', ['show', `HEAD:${REGISTRY_REL}`], {
    cwd: workspace,
    encoding: 'utf8',
  });
  headIds = collectIds(JSON.parse(headText));
} catch (e) {
  failClosed(
    `could not read git HEAD's primitive-registry.json (${e.message}) — cannot determine whether a primitive shipped this run`,
  );
}

const newIds = [...currentIds].filter((id) => !headIds.has(id)).sort();
report.newPrimitiveIds = newIds;
report.newPrimitivesShipped = newIds.length;

// ---- 3. the floor itself: a shipped primitive REQUIRES ≥1 rendered still under out/<lessonId>/primitive-checks/.
const stillsDir = path.join(workspace, 'remotion-svg-primitives', 'out', lessonId, 'primitive-checks');
report.stillsDir = stillsDir;
let stillsCount = 0;
try {
  stillsCount = fs.readdirSync(stillsDir).filter((f) => /\.(png|jpe?g)$/i.test(f)).length;
} catch {
  stillsCount = 0; // dir doesn't exist — zero stills; a zero-gap run legitimately never creates it
}
report.stillsCount = stillsCount;

// We RESOLVED everything needed to judge — this is a real verdict now, not a skip.
report.stillsFloorSkipped = 0;
if (newIds.length === 0) {
  report.stillsFloorPass = 1;
  report.reason = 'zero-gap this run (no new registry ids vs git HEAD) — the aesthetic-stills floor is N/A';
} else if (stillsCount > 0) {
  report.stillsFloorPass = 1;
  report.reason =
    `${newIds.length} new primitive(s) shipped (${newIds.join(', ')}) and ${stillsCount} still(s) found ` +
    `under ${path.relative(workspace, stillsDir)}`;
} else {
  report.stillsFloorPass = 0;
  report.reason =
    `${newIds.length} new primitive(s) shipped (${newIds.join(', ')}) but ZERO stills exist under ` +
    `${path.relative(workspace, stillsDir)} — a prose claim of "stills rendered" is not evidence; the render ` +
    `never happened (or never landed on disk)`;
}

writeReport(runDir);

if (report.stillsFloorPass) {
  process.stdout.write(`OK: ${report.reason}\n`.slice(0, 300));
  process.exit(0);
} else {
  process.stderr.write(`FAIL: ${report.reason}\n`.slice(0, 300));
  process.exit(1);
}
