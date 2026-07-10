#!/usr/bin/env node
// w0-pedagogy — HARD measure: no leaked self-audit prose inside pedagogy.md itself.
// Catches prompt.md's own named anti-pattern ("Put ALL self-audit / self-check / ✓-checklist ... in your
// structured return ... NEVER as prose sections inside the artifact"). A verbose self-audit baked into the
// artifact stalls every downstream model that reads pedagogy.md as a spec (it has to skip past prose that
// isn't teaching content). Invoked as a `run` measure op from node.json `optimize.measure` (out-of-band,
// post-run, non-blocking to the run itself; folds into `measure.w0-pedagogy.json` for TRIAGE).
//
// REWIRE (2026-07-09, closing the residual gap this op's own history names): this was previously a `gate`
// whose `path` resolved `{{arg.lessonId}}` directly — the substrate measure stage resolves an op's tokens
// against the FINISHED run's persisted args (`readRunArgs`, measure.ts), and no run.json sampled in this repo
// (through the newest, 2026-07-09) persists an `args` block, so the op silently dropped into `ops.rejected` on
// every real run, never evaluated. Same fix as the sibling `pedagogy-field-content-valid` script
// (check-field-content.mjs): derive the pedagogy.md path IN-SCRIPT from `<run>/.pi/run.json`'s persisted
// `nodes.w0-pedagogy.artifacts[]` (always written — the runner stats every declared artifact at verdict time),
// never from an `{{arg.*}}` template token. This op's own `args` is just `{{RUN}}`, which always resolves.
//
// Fail-CLOSED throughout: a missing run.json/node-record/artifact/unreadable file is a nonzero-exit failure
// (never a silent pass); a match on any leakage pattern is ALSO a nonzero-exit failure (the gate's job).
//
// Usage: node check-self-audit-leakage.mjs <RUN>

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const NODE_ID = 'w0-pedagogy';
// Same substantive check as the replaced `regex-absent` gate
// ("[Aa]udit checklist|[Ss]elf-check|[Ss]elf-audit|✓|\\[[ xX]\\]"), expressed with a real `i` flag instead of
// hand-rolled character-class case-folding.
const LEAKAGE_RE = /audit checklist|self-check|self-audit|✓|\[[ xX]\]/i;

const runDir = process.argv[2];
const report = {
  node: NODE_ID,
  runDir: runDir ?? null,
  ok: false,
  reason: null,
  artifactPath: null,
  selfAuditLeakageOk: 0, // 1|0 — numeric so the substrate's graded-leaf fold picks it up
  matches: [],
};

function reportPath(dir) {
  return path.join(dir, 'optimize', 'substrate', 'w0-pedagogy-self-audit-leakage.json');
}

function writeReport(dir) {
  try {
    const out = reportPath(dir);
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(report, null, 2));
  } catch {
    /* a report-write failure must never mask the exit code below — best-effort only */
  }
}

function failClosed(reason) {
  report.reason = reason;
  if (runDir) writeReport(runDir);
  process.stderr.write(`FAIL: ${reason}\n`.slice(0, 400));
  process.exit(1);
}

if (!runDir) failClosed('no run dir argument supplied to check-self-audit-leakage.mjs');

let runJson;
try {
  runJson = JSON.parse(readFileSync(path.join(runDir, '.pi', 'run.json'), 'utf8'));
} catch (e) {
  failClosed(`unreadable/unparseable .pi/run.json: ${e.message}`);
}

const nodeRec = runJson.nodes && runJson.nodes[NODE_ID];
const artifact =
  nodeRec && Array.isArray(nodeRec.artifacts)
    ? nodeRec.artifacts.find((a) => typeof a?.path === 'string' && a.path.endsWith('/pedagogy.md'))
    : null;
if (!artifact || artifact.exists === false) {
  failClosed(`no recorded pedagogy.md artifact for node "${NODE_ID}" in run.json (status=${nodeRec ? nodeRec.status : 'MISSING'})`);
}
report.artifactPath = artifact.path;

let content;
try {
  content = readFileSync(artifact.path, 'utf8');
} catch (e) {
  failClosed(`recorded artifact path unreadable: ${artifact.path}: ${e.message}`);
}

const lines = content.split('\n');
lines.forEach((line, i) => {
  if (LEAKAGE_RE.test(line)) {
    report.matches.push({ line: i + 1, text: line.trim().slice(0, 100) });
  }
});

report.selfAuditLeakageOk = report.matches.length === 0 ? 1 : 0;
report.ok = report.selfAuditLeakageOk === 1;
writeReport(runDir);

if (report.ok) {
  process.stdout.write('OK: no self-audit / checklist prose leaked into pedagogy.md\n');
  process.exit(0);
} else {
  const preview = report.matches.map((m) => `L${m.line}: "${m.text}"`).join(' | ');
  process.stderr.write(`FAIL: self-audit leakage found in pedagogy.md — ${preview}\n`.slice(0, 400));
  process.exit(1);
}
