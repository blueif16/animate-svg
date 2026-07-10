#!/usr/bin/env node
// w0-pedagogy — HARD measure: does each mandated pedagogy.md field carry REAL content, not just its header
// token? De-games the old `regex-present "<field>:\s*\S"` ops (a header with an empty/TODO/placeholder value
// satisfied "\S", so presence-not-validity was the hole an adversarial pass proved). This script re-implements
// the SAME structural floor ("does the field exist") PLUS a real content-validity check, and is invoked as a
// `run` measure op from node.json `optimize.measure` (never a workflow gate — this is out-of-band, post-run,
// non-blocking to the run itself; it feeds the substrate `measure.w0-pedagogy.json` triage reads).
//
// WHY a script, not a tighter `regex-present` param: the shipped `CHECK_KINDS` regex predicates take exactly
// one `new RegExp(param)` with NO flags (no `/m`, no per-line anchoring) — a value-less field ("focal:\n") can
// let `\s*\S` bleed across the newline into the NEXT field's label and still "pass". A script gets real
// line-anchoring + a placeholder blocklist + (for `stage`) real enum validation, none of which the CHECK_KINDS
// registry can express without inventing a new kind (PART D: reuse first, add code only when nothing reuses).
//
// WHY the lessonId is derived HERE from `<run>/.pi/run.json`, never from `{{arg.lessonId}}` in the op's own
// `path`/`args`: the substrate measure stage resolves an op's tokens against the FINISHED run's persisted args
// (`readRunArgs`, measure.ts), and every run sampled in this product repo (old AND the newest, 2026-07-07)
// carries no persisted `args` block — `{{arg.lessonId}}` throws `MissingArgError` and the WHOLE op is dropped
// into `ops.rejected`, never evaluated at all. `run.json`'s per-node `artifacts[].path`, by contrast, is always
// written (the runner stats each declared artifact at verdict time) and needs no arg at all — deriving the
// artifact path from there is robust across every run in this repo's history, not just future arg-persisted
// ones. This op's own `args` is just `{{RUN}}`, which always resolves.
//
// Fail-CLOSED throughout: a missing run.json / node record / artifact / unreadable file is a FAILURE (nonzero
// exit + a written report with ok:false), never a silent pass and never a crash that vanishes without a trace.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const NODE_ID = 'w0-pedagogy';
const PER_CUE_FIELDS = ['discovery', 'stage', 'focal', 'reinforcement'];
const STAGE_ENUM = ['concrete', 'represent', 'symbolize'];
// Whole-value (after trim) placeholder tokens — case-insensitive. Deliberately generous: a real value that
// happens to equal one of these literally IS a placeholder, never genuine pedagogy prose.
const PLACEHOLDER_RE = /^(todo|tbd|fixme|xxx+|n\/?a|tk|wip|pending|none|-{1,3}|\.{2,}|\?+)$/i;

const runDir = process.argv[2];
const report = {
  node: NODE_ID,
  runDir: runDir ?? null,
  ok: false,
  reason: null,
  artifactPath: null,
  lessonKindOk: 0, // 1|0 — numeric so the substrate's graded-leaf fold picks it up
  fieldsChecked: 0,
  fieldsInvalid: 0,
  occurrencesChecked: 0,
  occurrencesInvalid: 0,
  detail: {},
};

function reportPath(dir) {
  return path.join(dir, 'optimize', 'substrate', 'w0-pedagogy-field-content.json');
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

if (!runDir) failClosed('no run dir argument supplied to check-field-content.mjs');

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

/** Real (non-empty, non-placeholder, non-trivial) content check for a free-text field value. */
function isRealContent(value, { minChars = 12, minWords = 2 } = {}) {
  const v = (value ?? '').trim();
  if (!v) return { ok: false, reason: 'empty' };
  if (PLACEHOLDER_RE.test(v)) return { ok: false, reason: `placeholder token "${v}"` };
  const words = v.split(/\s+/).filter(Boolean);
  const chars = v.replace(/\s+/g, '').length;
  if (chars < minChars || words.length < minWords) return { ok: false, reason: `too short to be real content ("${v.slice(0, 40)}")` };
  return { ok: true, reason: 'ok' };
}

/** Every line-anchored occurrence of `label: <value>` in `content` (multiline + case-insensitive; correctly
 *  per-line, unlike the old flag-less CHECK_KINDS regex — no cross-line bleed into the next field's label).
 *  NOTE: the whitespace after the colon is `[ \t]*` (same-line only), NEVER `\s*` — `\s` matches `\n` too, so
 *  a value-less line ("focal:\n") would otherwise let the "gap" run past the newline and capture the START of
 *  the NEXT line as if it were this field's value (the exact cross-line-bleed bug this script exists to fix,
 *  reproduced at the script level during authoring — caught by testing this script against a constructed
 *  blank-`focal:` fixture; see measures.md §4). */
function findLines(label) {
  const re = new RegExp(`^[ \\t]*${label}:[ \\t]*(.*)$`, 'gmi');
  const out = [];
  let m;
  while ((m = re.exec(content))) out.push(m[1]);
  return out;
}

// ---- `lesson kind:` — one top-level header line. Legit values are short compound tokens ("math-insight"),
// so it is checked for real (non-placeholder) content at a lower length floor, not the 2-word prose floor. ----
const lessonKindLines = findLines('lesson kind');
report.fieldsChecked += 1;
if (lessonKindLines.length === 0) {
  report.detail.lessonKind = { ok: false, reason: 'no "lesson kind:" header line found anywhere' };
  report.fieldsInvalid += 1;
} else {
  const r = isRealContent(lessonKindLines[0], { minChars: 6, minWords: 1 });
  report.detail.lessonKind = { ok: r.ok, value: lessonKindLines[0].trim().slice(0, 60), reason: r.reason };
  report.lessonKindOk = r.ok ? 1 : 0;
  if (!r.ok) report.fieldsInvalid += 1;
}

// ---- the four per-cue fields — validate EVERY occurrence, not just "does the label exist somewhere". ----
for (const label of PER_CUE_FIELDS) {
  const lines = findLines(label);
  report.fieldsChecked += 1;
  if (lines.length === 0) {
    report.detail[label] = { ok: false, occurrences: 0, invalid: [], reason: `no "${label}:" line found anywhere` };
    report.fieldsInvalid += 1;
    continue;
  }
  const invalid = [];
  lines.forEach((raw, i) => {
    report.occurrencesChecked += 1;
    let r;
    if (label === 'stage') {
      // `stage` is a closed enum (concrete|represent|symbolize, SKILL.md §3) that may carry a trailing
      // parenthetical annotation ("concrete (the dots are the focus...)") — validate the LEADING token only.
      const firstToken = raw.trim().split(/[\s(]/)[0].toLowerCase();
      r = STAGE_ENUM.includes(firstToken)
        ? { ok: true, reason: 'ok' }
        : { ok: false, reason: `"${raw.trim().slice(0, 40)}" is not concrete|represent|symbolize` };
    } else {
      r = isRealContent(raw);
    }
    if (!r.ok) {
      invalid.push({ occurrence: i + 1, value: raw.trim().slice(0, 60), reason: r.reason });
      report.occurrencesInvalid += 1;
    }
  });
  report.detail[label] = { ok: invalid.length === 0, occurrences: lines.length, invalid };
  if (invalid.length) report.fieldsInvalid += 1;
}

report.ok = report.fieldsInvalid === 0;
writeReport(runDir);

if (report.ok) {
  process.stdout.write(
    `OK: lesson-kind + ${PER_CUE_FIELDS.length} per-cue fields carry real content (${report.occurrencesChecked} occurrences checked)\n`.slice(0, 200),
  );
  process.exit(0);
} else {
  const bad = [];
  if (!report.detail.lessonKind.ok) bad.push(`lesson-kind: ${report.detail.lessonKind.reason}`);
  for (const label of PER_CUE_FIELDS) {
    const f = report.detail[label];
    if (!f.ok) bad.push(`${label}: ${f.invalid.length ? f.invalid.map((o) => o.reason).join('; ') : f.reason}`);
  }
  process.stderr.write(`FAIL: ${bad.join(' | ')}\n`.slice(0, 400));
  process.exit(1);
}
