#!/usr/bin/env node
// w3b-primitive-build — HARD measure: lesson-registry-liveness WRAPPER.
//
// REWIRE (2026-07-09, `chore/lesson-build-standards-runway`): the op used to hand
// `lesson-data/{{arg.lessonId}}/primitive-gap-scan.md` straight to check-lesson-primitives.mjs.
// `{{arg.lessonId}}` is UNRESOLVABLE on most real runs — `runSubstrateMeasure` `resolveDeep`s the WHOLE op
// (every string field), and every historical `run.json` predates arg-persistence (`args:null`), so the token
// throws `MissingArgError` and the ENTIRE op is dropped into `ops.rejected`, never executed (see
// measurement-runway.md "the runway node-dir layout" §1; reproduced live against `runs/ctt-2`). The robust
// idiom — already proven by this node's `aesthetic-stills-floor` sibling op (check-aesthetic-stills.mjs) — is
// to accept ONLY `{{RUN}}`/`{{WORKSPACE}}` and derive the lessonId IN-SCRIPT from the run's own recorded
// artifact paths. This wrapper applies that same idiom, then hands a REAL, resolved argument to the actual
// product gate (`check-lesson-primitives.mjs`, remotion-svg-primitives/scripts/registry/ — out of this node's
// edit scope, never touched here).
//
// check-lesson-primitives.mjs already resolves a bare lesson-id to its own
// `lesson-data/<id>/primitive-gap-scan.md` (see its `resolveTarget`), so this wrapper passes the lessonId
// itself — no path construction, no duplicated knowledge of the gap-scan's filename.
//
// Invokes the gate via direct `node scripts/registry/check-lesson-primitives.mjs …` (never `npm run` — the
// sandbox-EPERM lesson recorded in this node's memory.md: `npm run` under `--sandbox local` hits a
// node_modules read-EPERM that a direct `node` invocation does not).
//
// Usage: node check-lesson-registry-liveness.mjs <runDir> <workspaceDir>
// Exit 0 = every named component in the lesson's gap-scan is a live registry member; exit 1 = a phantom /
// deprecated / vacuous citation in the gap-scan, OR a fail-closed resolution failure (never a silent skip).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const NODE_ID = 'w3b-primitive-build';

const [, , runDir, workspace] = process.argv;

function failClosed(reason) {
  process.stderr.write(`FAIL (fail-closed): ${reason}\n`.slice(0, 400));
  process.exit(1);
}

if (!runDir || !workspace) {
  failClosed('usage: check-lesson-registry-liveness.mjs <runDir> <workspaceDir>');
}

// ---- 1. discover this run's lessonId from the RECORDED artifact path (never {{arg.lessonId}} in the op's own
// path/args — see header). Same idiom as check-aesthetic-stills.mjs. ----
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

// ---- 2. invoke the real product gate directly via `node` (never `npm run`), passing the resolved lessonId. ----
const repoRoot = path.join(workspace, 'remotion-svg-primitives');
try {
  // stdio explicitly piped (never inherited) so the child's output is captured EXACTLY once, deterministic
  // across Node versions — Node's default sync-exec stdio can live-inherit stderr on a failing child IN
  // ADDITION to populating `e.stderr`, which would otherwise double-print the same failure message below.
  const out = execFileSync('node', ['scripts/registry/check-lesson-primitives.mjs', lessonId], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  process.stdout.write(out);
  process.exit(0);
} catch (e) {
  if (e.stdout) process.stdout.write(e.stdout);
  if (e.stderr) process.stderr.write(e.stderr);
  process.exit(typeof e.status === 'number' ? e.status : 1);
}
