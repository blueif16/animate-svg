#!/usr/bin/env node
// w2b-audio-captions optimize.measure wrapper (piflow-overlord "building-measures.md" Part D — the thin
// op[] wrapper for the node-specific deterministic invariants a JSON schema can't express). Read by the
// out-of-band optimize substrate ONLY (`runSubstrateMeasure` fires this as a `run` op); it never touches
// the live node run and never blocks anything on its own. Best-effort throughout: a missing file, an
// unresolvable lessonId, or a malformed input degrades to a `skipped` note, never a thrown error — the run
// op's own exit code stays 0 so a measure-script bug can never wedge the substrate stage.
//
// What this checks (each is a per-cue / cross-file invariant the CHECK_KINDS registry can't express —
// count-floor/field-present/regex-* all operate on ONE fixed path, not "for every cue in the array"):
//   emptyNarrationCount        — cue-plan-author: "a cue with empty narration throws" downstream.
//   captionMismatchCount       — lesson-audio-captions (THIS product, stricter than the generic cue-plan-
//                                author skill): caption must be the narration VERBATIM, never shortened.
//   phrasePunctuationViolations— cue-plan-author's narration≠phrase rule: `phrase` must be punctuation-
//                                stripped (residual ，。！？、 defeats the ASR aligner's token match).
//   ellipsisCount              — the held-vowel DRONE precursor (also reused as a blocking `regex-absent`
//                                check in node.json; recomputed here per-cue so triage gets the cue id).
//   budgetFit*                 — the node's CORE targeting rule (lesson-audio-captions "targeting rule"):
//                                per-cue narration length at the calibrated rate (~0.30s/CJK-char + an
//                                embedded-Latin-word allowance) must land within ±20% of visual-design.md's
//                                declared `visualMotionSeconds` for that cue id.
//
// visual-design.md budget format: TWO conventions are live across real lesson-data (the skill does not
// mandate one shape) — (1) a `motion-budget:` PROSE block of bare `<cueId>:  <N>s` lines (`parseMotionBudget`,
// the original/only format this script read), and (2) a markdown PIPE TABLE whose header names
// `visualMotionSeconds` (or whose bare `s`/`sec` column sits under a heading that names it) — `kp2-counting-
// by-tens`, `kptest-compare-more-fewer`, `kptest-count-to-two`, `kptest-first-second-third` all use this
// second shape (`parseTableMotionBudget`). Audited against every real lesson with both artifacts present
// (17 lessons): the prose-only reader silently returned `budgetFitCuesChecked:0` (and, worse, a
// zero-initialized `budgetFitWorstAbsPct:0` — a FALSE "perfectly on budget" reading) on 12/17, of which the
// 4 named above are the table format this script now also parses. Both parsers' results MERGE (same
// `{cueId: seconds}` shape); a lesson using neither convention still and correctly reports "no data" — see
// the fail-closed `budgetFitSkipped`/`budgetFitWorstAbsPct:null` contract below, never a false 0%.
//
// Usage: node measure.mjs --run <RUN> --workspace <WORKSPACE> --out <reportPath> [--lessonId <id>]
// (`--lessonId` is a TEST/override hook; production discovers it from `<RUN>/.pi/run.json`'s recorded
// artifact paths, since `optimize.measure` ops have no `{{arg.*}}` token — see this node's criteria.md
// "Wiring" section for why.)

import { promises as fs } from 'node:fs';
import path from 'node:path';

const NODE_ID = 'w2b-audio-captions';
const CJK_PUNCT = /[，。！？、]/;
const ELLIPSIS = /(…|\.\.\.)/; // the literal "…" or a 3-dot run — the held-vowel drone precursor
const CJK_CHAR = /[㐀-鿿]/g;
const LATIN_WORD = /[A-Za-z']+/g;
const CJK_RATE_SEC = 0.30; // lesson-audio-captions "targeting rule" — Aoede Mandarin slow, mid-calibration
const LATIN_WORD_SEC = 0.55; // mid-point of the skill's "0.4-0.7s per 1-2 syllable English word"
const BUDGET_TOLERANCE_PCT = 20; // the skill's own ±20% bar

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      out[argv[i].slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

async function readJson(p) {
  try {
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch {
    return null;
  }
}

async function readText(p) {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

/** Recover the run's lessonId from `.pi/run.json`'s recorded artifact paths for THIS node — no `{{arg.*}}`
 *  token is available inside an `optimize.measure` op (see ResolveCtx in workflow/resolver.ts), but every
 *  artifact path the runner already stat()'d literally embeds `lesson-data/<lessonId>/...`. */
function discoverLessonId(runJson) {
  const node = runJson?.nodes?.[NODE_ID];
  for (const a of node?.artifacts ?? []) {
    const m = /lesson-data\/([^/]+)\//.exec(a?.path || '');
    if (m) return m[1];
  }
  return null;
}

function estimateSeconds(narration) {
  const cjk = (narration.match(CJK_CHAR) || []).length;
  const latin = (narration.match(LATIN_WORD) || []).length;
  return cjk * CJK_RATE_SEC + latin * LATIN_WORD_SEC;
}

/** Parse visual-design.md's `motion-budget:` prose block into `{ cueId: seconds }`. Tolerant of the prose
 *  wrapper (skill-mandated shape, `visual-discipline/SKILL.md` §motion-budget) — a line that doesn't match
 *  `<id>: <N>s` is silently skipped, never a parse error. */
function parseMotionBudget(md) {
  const budgets = {};
  let inBlock = false;
  for (const line of md.split('\n')) {
    if (/^motion-budget:/.test(line.trim())) {
      inBlock = true;
      continue;
    }
    if (inBlock && /^```/.test(line.trim())) break;
    if (inBlock) {
      const m = /^\s*([\w-]+):\s+([\d.]+)s\b/.exec(line);
      if (m) budgets[m[1]] = parseFloat(m[2]);
    }
  }
  return budgets;
}

/** Parse a markdown PIPE TABLE convention for the per-cue motion budget — the second live authoring shape
 *  (see the header comment). Scans the WHOLE file for `| … |` blocks (a header row immediately followed by a
 *  `|---|---|` separator row); for each, the value column is the header cell matching `visualMotionSeconds`
 *  (any case/spacing), OR — only when the ~5 lines immediately above the table already name
 *  `visualMotionSeconds` in prose/heading — a bare `s`/`sec(s)`/`second(s)` column (`kptest-first-second-
 *  third`'s convention: the section heading carries the name, the column is just "s"). The id column is
 *  whichever header cell reads "cue"/"cue id" (case-insensitive), defaulting to column 0. Returns the SAME
 *  `{ cueId: seconds }` shape as `parseMotionBudget` so the two merge for free. Every step is best-effort: a
 *  table with neither column shape, or a row whose id/value cell doesn't parse to `<number>[s]`, is silently
 *  skipped — never a thrown error (this is a substrate measure op, not a live gate). */
function parseTableMotionBudget(md) {
  const budgets = {};
  const lines = md.split('\n');
  const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
  const isSeparatorRow = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
  const splitCells = (l) => {
    let s = l.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    return s.split('|').map((c) => c.trim());
  };
  const stripMarkup = (c) => c.replace(/\*\*/g, '').replace(/`/g, '').trim();

  let i = 0;
  while (i < lines.length) {
    if (isTableRow(lines[i]) && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const header = splitCells(lines[i]).map(stripMarkup);
      let valueCol = header.findIndex((h) => /visualmotionseconds/i.test(h.replace(/\s+/g, '')));
      if (valueCol === -1) {
        const contextNamesIt = lines.slice(Math.max(0, i - 5), i).some((l) => /visualmotionseconds/i.test(l));
        if (contextNamesIt) {
          valueCol = header.findIndex((h) => /^s(ec(s|onds?)?)?$/i.test(h));
        }
      }
      if (valueCol !== -1) {
        const idCol = header.findIndex((h) => /^cue(\s*id)?$/i.test(h));
        const idColResolved = idCol === -1 ? 0 : idCol;
        let j = i + 2;
        while (j < lines.length && isTableRow(lines[j]) && !isSeparatorRow(lines[j])) {
          const cells = splitCells(lines[j]).map(stripMarkup);
          const id = cells[idColResolved];
          const rawValue = cells[valueCol];
          if (id && rawValue) {
            const m = /^([\d.]+)\s*s?$/i.exec(rawValue);
            if (m) budgets[id] = parseFloat(m[1]);
          }
          j += 1;
        }
        i = j;
        continue;
      }
    }
    i += 1;
  }
  return budgets;
}

async function writeReport(outPath, report) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = args.run;
  const workspace = args.workspace;
  const outPath = args.out;
  if (!runDir || !workspace || !outPath) {
    console.error('measure.mjs: --run, --workspace, and --out are required');
    return; // best-effort: exit 0, no report — the substrate degrades gracefully on a missing report.
  }

  const report = {
    node: NODE_ID,
    generatedAt: new Date().toISOString(),
    lessonId: null,
    cueCount: 0,
    emptyNarrationCount: 0,
    captionMismatchCount: 0,
    phrasePunctuationViolations: 0,
    ellipsisCount: 0,
    budgetFitCuesChecked: 0,
    // Fail-CLOSED defaults (piflow-overlord building-measures.md): `null`, never `0` — a `0` here would read
    // as "measured, perfectly on budget" to any numeric consumer, when the truth is "not measured at all".
    // `budgetFitWorstAbsPct` only becomes a number once ≥1 cue is actually checked below; `budgetFitSkipped`
    // is the explicit graded flag (folds into the substrate `graded` map same as any other numeric leaf) that
    // triage sees whenever the core targeting invariant could not be evaluated this run.
    budgetFitWorstAbsPct: null,
    budgetFitWorstCue: null,
    budgetFitSkipped: 1,
    skipped: [],
  };

  let lessonId = args.lessonId || null;
  if (!lessonId) {
    const runJson = await readJson(path.join(runDir, '.pi', 'run.json'));
    lessonId = discoverLessonId(runJson);
  }
  report.lessonId = lessonId;
  if (!lessonId) {
    report.skipped.push('no lessonId discoverable (no --lessonId override and none found in .pi/run.json)');
    await writeReport(outPath, report);
    return;
  }

  const lessonDir = path.join(workspace, 'remotion-svg-primitives', 'lesson-data', lessonId);
  const cuePlan = await readJson(path.join(lessonDir, 'script-cues.json'));
  if (!Array.isArray(cuePlan?.cues) || cuePlan.cues.length === 0) {
    report.skipped.push('no script-cues.json / empty cues array');
    await writeReport(outPath, report);
    return;
  }
  report.cueCount = cuePlan.cues.length;

  for (const cue of cuePlan.cues) {
    if (typeof cue.narration !== 'string' || cue.narration.trim() === '') report.emptyNarrationCount += 1;
    if (typeof cue.caption === 'string' && typeof cue.narration === 'string' && cue.caption !== cue.narration) {
      report.captionMismatchCount += 1;
    }
    if (typeof cue.phrase === 'string' && CJK_PUNCT.test(cue.phrase)) report.phrasePunctuationViolations += 1;
    if (typeof cue.narration === 'string' && ELLIPSIS.test(cue.narration)) report.ellipsisCount += 1;
  }

  const visualDesignMd = await readText(path.join(lessonDir, 'visual-design.md'));
  if (!visualDesignMd) {
    report.skipped.push('no visual-design.md — budget-fit skipped');
  } else {
    // Merge BOTH budget-authoring conventions (see the header comment) — a lesson uses one or the other in
    // practice, so this is a safe union; a rare collision has the table source win (arbitrary, harmless).
    const budgets = { ...parseMotionBudget(visualDesignMd), ...parseTableMotionBudget(visualDesignMd) };
    let worst = 0;
    let worstCue = null;
    let checked = 0;
    for (const cue of cuePlan.cues) {
      const budget = budgets[cue.id];
      if (budget == null || typeof cue.narration !== 'string') continue;
      const est = estimateSeconds(cue.narration);
      const pct = ((est - budget) / budget) * 100;
      checked += 1;
      if (Math.abs(pct) > Math.abs(worst)) {
        worst = pct;
        worstCue = cue.id;
      }
    }
    report.budgetFitCuesChecked = checked;
    if (checked > 0) {
      report.budgetFitWorstAbsPct = Math.round(Math.abs(worst) * 10) / 10;
      report.budgetFitWorstCue = worstCue;
      report.budgetFitSkipped = 0;
    } else {
      // Fail-CLOSED: leave budgetFitWorstAbsPct/budgetFitSkipped at their "not measured" defaults above —
      // NEVER report a 0% ("perfectly on budget") for a cue that was never actually checked.
      report.skipped.push(
        'no motion-budget cue ids matched script-cues.json ids (checked both the prose id:Ns block and the markdown-table format)',
      );
    }
  }

  // A quick discriminating summary line for a human glancing at stdout (the JSON report is the real output).
  const overBudget = report.budgetFitWorstAbsPct != null && report.budgetFitWorstAbsPct > BUDGET_TOLERANCE_PCT;
  const worstFitDisplay = report.budgetFitWorstAbsPct == null ? 'n/a (skipped)' : `${report.budgetFitWorstAbsPct}%`;
  console.error(
    `w2b measure: ${report.cueCount} cues · empty=${report.emptyNarrationCount} · ` +
      `captionMismatch=${report.captionMismatchCount} · phrasePunct=${report.phrasePunctuationViolations} · ` +
      `ellipsis=${report.ellipsisCount} · worstBudgetFit=${worstFitDisplay}` +
      `${overBudget ? ` (OVER ±${BUDGET_TOLERANCE_PCT}% on ${report.budgetFitWorstCue})` : ''}`,
  );

  await writeReport(outPath, report);
}

main().catch((e) => {
  console.error(`measure.mjs: best-effort failure — ${e?.message || e}`);
  // never a non-zero exit: this is a substrate measure op, not a live gate.
});
