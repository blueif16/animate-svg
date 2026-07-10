#!/usr/bin/env node
// w4b-sketch — HARD measure (piflow-overlord building-measures.md Part D: the thin deterministic op[]
// wrapper for the node-specific invariants a JSON schema can't express). Parses `sketch-overlay.md`
// and enforces the FOUR deterministic invariants this node's own SKILL (sketch-explainer-layer) states
// as hard rules, never left to the soft judge:
//   1. SECTION COMPLETENESS — all 4 required sections exist as REAL headings.
//   2. CUE-RELATIVE DISCIPLINE — the node's raison-d'être invariant: no per-mark timing cell is a bare
//      master-timeline absolute frame number.
//   3. RESTRAINT BUDGET — total marks (counting "×N" multi-instance rows) <= floor(cueCount * 0.6).
//   4. MARK VOCABULARY — every marked row names one of {underline, wrap-arc, label-arrow, vs-mark}.
//
// HARDENED (adversarial pass, 2026-07-09) — every prior floor gate here was PROVEN hollow. Four holes
// closed, all in this one script + its node.json wiring (no new SDK code):
//
//  (a) MARKEDNESS GAMING — the old row-marked filter was `/^y/i.test(cell)`, so any row using `✓`,
//      a bespoke token, or anything not literally starting with "y" was silently excluded from BOTH the
//      restraint-budget count AND the vocabulary check at once (undercounting marks *and* hiding an
//      off-vocabulary mark type behind the same token). Fixed to be NEGATIVE-token-gated: a row counts
//      as marked unless its `mark?` cell is an explicit no-mark token (`n`/`no`/`-`/`–`/`—`) — an
//      unrecognized token now counts TOWARD both checks (fail-closed), never silently away from them.
//  (b) "PROSE-TABLE" EVASION — a `sketch-overlay.md` that mentions "Per-cue mark table" but never
//      writes an actual pipe table (or writes one with zero parseable data rows) degraded the old script
//      to `cueCount:0, markCount:0, budget:0, overBudget:false` — a SILENT VACUOUS PASS on a surface the
//      node exists to grade. Now recorded explicitly as `ungradable:true` (heading absent, OR present
//      with zero data rows, OR the artifact itself unreadable) and GATED as a hard fail in node.json — an
//      ungradable restraint/vocab surface is a FAIL, never a pass.
//  (c) THE CUE-RELATIVE ANTI-PATTERN GATE WAS A SINGLE BRITTLE SHAPE — node.json used to run a bare
//      `regex-absent` for THREE consecutive bare-numeric pipe-columns (the skill's own literal forbidden
//      example, "| 891 | 24 | 1057 |"). Any different column count/order/spacing/formatting around an
//      absolute frame number evaded it entirely, and — because it addressed the WHOLE FILE, not a parsed
//      row — it could never reason about which columns are actually the TIMING cells. RELOCATED here: this
//      script now scans each row's THREE semantically-identified timing cells (drawOnRelativeStart /
//      drawOnDuration / fadeOutRelativeStart) for a bare (unqualified by a `cueLength`/`cue.`/`Math.`
//      relative-reference) integer >= FRAME_ABS_CEILING — a magnitude-based, column-position-agnostic
//      check that generalizes across formatting, never keys on one exact shape.
//  (d) AN ABSENT REPORT VACUOUSLY PASSED — the OLD op wiring templated `{{arg.lessonId}}` directly into
//      this script's own args AND into every companion `gate`'s `path` (see node.json history). The
//      out-of-band substrate measure stage resolves those tokens against the FINISHED run's PERSISTED
//      `args` (`readRunArgs`, packages/core `measure.ts`) — and every run sampled in this product repo
//      carries NO persisted `args` block, so `{{arg.lessonId}}` throws `MissingArgError` and the WHOLE op
//      (script AND gate) was silently dropped into `ops.rejected`, NEVER evaluated. The downstream
//      `regex-absent` gates then read an EMPTY (never-written) report and vacuously PASSED — the "hard
//      floor" never fired on a single real run. Fixed at the root, mirroring the w0-pedagogy /
//      w2b-audio-captions / w3a-voice-asr precedent: this script's own arg is JUST `{{RUN}}` (which
//      ALWAYS resolves — no persisted args needed), and it derives the lessonId + the `sketch-overlay.md`
//      path itself from `<run>/.pi/run.json`'s persisted per-node `artifacts[]` (always written — the
//      runner stats every declared artifact at verdict time). node.json's companion gates now ALSO carry
//      an `exists` check on the report path itself, so a report that never gets written (e.g. a future
//      wiring regression) is a hard fail, never a silent pass.
//
// Fail-CLOSED throughout: a missing run.json / node record / artifact / unreadable or ungradable file is
// a FAILURE (report written with ungradable:true + nonzero exit), never a silent pass and never a crash
// that vanishes without a trace.
//
// Usage: node measure.mjs <RUN>

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const NODE_ID = 'w4b-sketch';
const VOCAB = ['underline', 'wrap-arc', 'label-arrow', 'vs-mark'];
const NO_MARK_TOKENS = new Set(['n', 'no', '-', '–', '—']);
// A bare, unqualified frame count this large has no business inside a single cue's relative timing — the
// skill's own forbidden example (891, 1057) is comfortably past a lesson cue's plausible ~10-20s length
// (300-600 frames @30fps) while every real cue-relative value in this repo (12-66) sits far below it.
const FRAME_ABS_CEILING = 500;
const RELATIVE_REF_RE = /cueLength|cue\.(start|end)Frame|startFrame|endFrame|Math\.(round|floor|ceil|min|max)|\bcue\s*=/i;
const TIMING_COLS = [4, 5, 6]; // drawOnRelativeStart, drawOnDuration, fadeOutRelativeStart (0-indexed)

const SECTIONS = [
  { key: 'sketchLanguage', re: /^#{1,6}\s+\d*\.?\s*sketch language\b/i },
  { key: 'perCueMarkTable', re: /^#{1,6}\s+\d*\.?\s*per-cue mark table\b/i },
  { key: 'climaxSketch', re: /^#{1,6}\s+\d*\.?\s*climax sketch\b/i },
  { key: 'composerHandoff', re: /^#{1,6}\s+\d*\.?\s*composer hand-?off\b/i },
];

const runDir = process.argv[2];

const report = {
  node: NODE_ID,
  generatedAt: new Date().toISOString(),
  runDir: runDir ?? null,
  ok: false,
  reason: null,
  artifactPath: null,
  // Fail-CLOSED defaults: gradable/ungradable default to the FAILING side until proven otherwise.
  gradable: false,
  ungradable: true,
  tableFound: false,
  cueCount: 0,
  markCount: 0,
  budget: 0,
  overBudget: false,
  vocabViolations: [],
  hasVocabViolation: false,
  cueRelativeViolations: [],
  hasCueRelativeViolation: false,
  sectionsFound: Object.fromEntries(SECTIONS.map((s) => [s.key, false])),
  sectionsMissing: SECTIONS.map((s) => s.key),
  hasMissingSection: true,
};

function reportPath(dir) {
  return path.join(dir, 'optimize', 'substrate', 'w4b-sketch.measure.json');
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

if (!runDir) failClosed('no run dir argument supplied to measure.mjs');

let runJson;
try {
  runJson = JSON.parse(readFileSync(path.join(runDir, '.pi', 'run.json'), 'utf8'));
} catch (e) {
  failClosed(`unreadable/unparseable .pi/run.json: ${e.message}`);
}

// Derive the artifact path from the run's OWN recorded artifacts — never `{{arg.lessonId}}` (see header
// note (d)): `run.json` per-node `artifacts[]` is always persisted, regardless of arg-persistence.
const nodeRec = runJson.nodes && runJson.nodes[NODE_ID];
const artifact =
  nodeRec && Array.isArray(nodeRec.artifacts)
    ? nodeRec.artifacts.find((a) => typeof a?.path === 'string' && a.path.endsWith('/sketch-overlay.md'))
    : null;
if (!artifact || artifact.exists === false) {
  failClosed(`no recorded sketch-overlay.md artifact for node "${NODE_ID}" in run.json (status=${nodeRec ? nodeRec.status : 'MISSING'})`);
}
report.artifactPath = artifact.path;

let text;
try {
  text = readFileSync(artifact.path, 'utf8');
} catch (e) {
  failClosed(`recorded artifact path unreadable: ${artifact.path}: ${e.message}`);
}

const lines = text.split('\n');

/** The first line index matching `re` that is ALSO an actual markdown heading line (starts with `#`,
 *  after trimming) — never a bare substring match anywhere in prose (closes the old lookahead gate's
 *  "mentions the phrase" loophole). */
function findHeadingLine(re) {
  return lines.findIndex((l) => re.test(l.trim()));
}

// ---- (1) section completeness — real headings, not a substring anywhere in the file ----
for (const { key, re } of SECTIONS) {
  report.sectionsFound[key] = findHeadingLine(re) !== -1;
}
report.sectionsMissing = SECTIONS.filter((s) => !report.sectionsFound[s.key]).map((s) => s.key);
report.hasMissingSection = report.sectionsMissing.length > 0;

// ---- (2) parse the "Per-cue mark table" section's data rows (header + separator rows dropped) ----
function parseTable() {
  const start = findHeadingLine(SECTIONS.find((s) => s.key === 'perCueMarkTable').re);
  if (start === -1) return { rows: [], found: false };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i].trim())) {
      end = i;
      break;
    }
  }
  const tableLines = lines
    .slice(start + 1, end)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|'))
    .filter((l) => !/^\|[\s|:-]+\|$/.test(l)); // drop the header-separator row (---|---|...)
  if (tableLines.length < 2) return { rows: [], found: true }; // header only, no data rows
  const dataLines = tableLines.slice(1); // drop the header row itself
  const rows = dataLines.map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
  return { rows, found: true };
}

const { rows, found } = parseTable();
report.tableFound = found;
report.cueCount = rows.length;
report.gradable = found && rows.length > 0;
report.ungradable = !report.gradable;

/** A row's `mark?` cell counts as MARKED unless it is an explicit no-mark token (fail-closed: an
 *  unrecognized token — "✓", "Yes", a bespoke marker, blank/malformed — counts TOWARD the checks below,
 *  never silently away from them; see header note (a)). */
function isMarked(cell) {
  const norm = (cell || '').trim().toLowerCase();
  return !NO_MARK_TOKENS.has(norm);
}

/** A mark-type cell may carry "×N" / "xN" for multi-instance rows (e.g. "label-arrow ×2"); default 1. */
function instanceCount(cell) {
  const m = (cell || '').match(/[×x]\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : 1;
}

/** RELOCATED cue-relative check (header note (c)): for a row's THREE semantically-identified timing
 *  cells, flag a bare integer >= FRAME_ABS_CEILING that is NOT qualified by a relative-reference keyword
 *  anywhere in the same cell — column-position-agnostic and format-agnostic, unlike the old whole-file
 *  3-consecutive-bare-numeric-columns regex it replaces. */
function cueRelativeViolationsFor(row) {
  const hits = [];
  for (const idx of TIMING_COLS) {
    const cell = row[idx] || '';
    if (RELATIVE_REF_RE.test(cell)) continue; // qualified by a real relative reference — not a bare absolute
    const nums = (cell.match(/\d+/g) || []).map(Number);
    if (nums.some((n) => n >= FRAME_ABS_CEILING)) hits.push({ col: idx, cell });
  }
  return hits;
}

if (report.gradable) {
  const markRows = rows.filter((r) => isMarked(r[1]));
  report.markCount = markRows.reduce((sum, r) => sum + instanceCount(r[2]), 0);
  report.budget = Math.floor(report.cueCount * 0.6);
  report.overBudget = report.markCount > report.budget;

  const vocabViolations = markRows
    .filter((r) => !VOCAB.some((v) => (r[2] || '').toLowerCase().includes(v)))
    .map((r) => r[0] || '?');
  report.vocabViolations = vocabViolations;
  report.hasVocabViolation = vocabViolations.length > 0;

  const cueRelativeViolations = [];
  for (const r of rows) {
    const hits = cueRelativeViolationsFor(r);
    if (hits.length) cueRelativeViolations.push({ cueId: r[0] || '?', hits });
  }
  report.cueRelativeViolations = cueRelativeViolations;
  report.hasCueRelativeViolation = cueRelativeViolations.length > 0;
}

report.ok =
  report.gradable && !report.overBudget && !report.hasVocabViolation && !report.hasCueRelativeViolation && !report.hasMissingSection;
if (!report.reason && !report.ok) {
  const bad = [];
  if (report.ungradable) bad.push('per-cue mark table ungradable (no heading, or heading with zero parseable rows)');
  if (report.hasMissingSection) bad.push(`missing section(s): ${report.sectionsMissing.join(', ')}`);
  if (report.overBudget) bad.push(`over restraint budget (${report.markCount} > ${report.budget})`);
  if (report.hasVocabViolation) bad.push(`vocabulary violation(s): ${report.vocabViolations.join(', ')}`);
  if (report.hasCueRelativeViolation) bad.push(`cue-relative violation(s): ${report.cueRelativeViolations.map((v) => v.cueId).join(', ')}`);
  report.reason = bad.join(' | ');
}

writeReport(runDir);

if (report.ok) {
  process.stdout.write(
    `OK: ${report.cueCount} cues, ${report.markCount} marks (budget ${report.budget}), all 4 sections present, no vocab/cue-relative violations\n`.slice(
      0,
      200,
    ),
  );
  process.exit(0);
} else {
  process.stderr.write(`FAIL: ${report.reason}\n`.slice(0, 400));
  process.exit(1);
}
