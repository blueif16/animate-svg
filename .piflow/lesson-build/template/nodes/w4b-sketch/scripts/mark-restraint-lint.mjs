// mark-restraint-lint.mjs — thin deterministic wrapper (piflow-overlord building-measures.md Part D:
// "the node-specific deterministic invariants a JSON schema can't encode"). Parses w4b-sketch's own
// `sketch-overlay.md` "Per-cue mark table" and checks the TWO invariants the sketch-explainer-layer
// skill states as hard numeric/vocabulary rules, never left to the soft judge:
//   1. RESTRAINT BUDGET — "total marks across the video ≤ floor(cueCount × 0.6)" (skill "Restraint
//      principle"). A row's mark-type cell may name a "×N" instance count (e.g. "label-arrow ×2");
//      the budget counts MARK INSTANCES, not marked cues (verified against the real fen-yu-he lesson's
//      own ledger: 9 cues, "×2" + "×1" rows → 3 instances, budget floor(9*0.6)=5 — matches exactly).
//   2. MARK VOCABULARY — only {underline, wrap-arc, label-arrow, vs-mark} are authorized (skill "Mark
//      vocabulary" — "NOT in this vocabulary (don't invent)"). A marked row whose mark-type cell names
//      none of the four is a violation.
// Best-effort, NEVER throws: any parse failure (missing file, no table found) writes parseError:true
// and still exits 0 — this op is report-only; a `gate` in the same optimize.measure array reads its
// output and is what actually fails. Never re-derive counts by eye; this exists so the optimizer
// doesn't have to.
import fs from 'node:fs';
import path from 'node:path';

const [, , srcPath, outDir] = process.argv;
const VOCAB = ['underline', 'wrap-arc', 'label-arrow', 'vs-mark'];

/** Extract the "Per-cue mark table" section's data rows (header + separator rows dropped). */
function parseTable(text) {
  const headingRe = /per-cue mark table/i;
  const lines = text.split('\n');
  const start = lines.findIndex((l) => headingRe.test(l));
  if (start === -1) return { rows: [], found: false };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{2,3}\s/.test(lines[i])) {
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

/** A mark-type cell may carry "×N" / "xN" for multi-instance rows (e.g. "label-arrow ×2"); default 1. */
function instanceCount(cell) {
  const m = cell.match(/[×x]\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : 1;
}

let report;
try {
  const text = fs.readFileSync(srcPath, 'utf8');
  const { rows, found } = parseTable(text);
  const cueCount = rows.length;
  const markRows = rows.filter((r) => /^y/i.test(r[1] || ''));
  const markCount = markRows.reduce((sum, r) => sum + instanceCount(r[2] || ''), 0);
  const budget = Math.floor(cueCount * 0.6);
  const overBudget = markCount > budget;
  const vocabViolations = markRows
    .filter((r) => !VOCAB.some((v) => (r[2] || '').toLowerCase().includes(v)))
    .map((r) => r[0] || '?');
  const hasVocabViolation = vocabViolations.length > 0;
  report = {
    tableFound: found,
    cueCount,
    markCount,
    budget,
    overBudget,
    vocabViolations,
    hasVocabViolation,
    parseError: false,
  };
} catch (e) {
  report = { parseError: true, error: String((e && e.message) || e) };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'w4b-sketch.mark-restraint.json'), JSON.stringify(report, null, 2));
