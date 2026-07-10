#!/usr/bin/env node
// gen/check-cue-coverage.mjs — HARD floor MEASURE for w6-verification (a thin op[] wrapper, config not SDK
// code — piflow-overlord/references/building-measures.md Part D). The node-specific deterministic
// invariant a schema can't express: every cue `script-cues.json` declares must get an INDEPENDENTLY
// addressed verdict row in `verification.md` — a per-cue table that silently drops a cue is the cheapest,
// most common omission defect. This is a COVERAGE floor only: whether the cited VERDICT is correct is
// criteria.md R3's job (soft, judged) — this measure only catches the omission.
//
// Real-report convention (confirmed against the live `kptest-fenyuhe-six/verification.md`, a 9-cue lesson):
// cues are addressed by 1-based ORDINAL in a markdown table row (`| 3 | ... |`), matching `script-cues.json`
// `cues[]` array order — NOT the `id` string field. Validated live: 9/9 rows present in both its §3
// (text-vs-audio) and §5 (pedagogy verdict) tables.
//
// CLI: node check-cue-coverage.mjs --workspace <ws> --run <rundir> [--report-out <path>] [--json]

import fs from "node:fs";
import { resolveLessonId, lessonPaths, parseArgs } from "./lib-lesson-context.mjs";

/** An unresolvable input degrades to a clean not-applicable PASS, never a false fail (the
 *  check-feasibility.mjs `notApplicable` convention). */
function notApplicable(reason) {
  return { applicable: false, verdict: "pass", reason, totalCues: 0, missing: [] };
}

/**
 * checkCueCoverage({ cues, verificationText }) — pure. `cues` = script-cues.json's `cues[]` array;
 * `verificationText` = verification.md's raw bytes. Each cue's 1-based ordinal must appear as a markdown
 * table row `| N |` (whitespace-tolerant) somewhere in the report.
 */
export function checkCueCoverage({ cues, verificationText }) {
  if (!Array.isArray(cues) || cues.length === 0) return notApplicable("no cues declared in script-cues.json");
  const text = String(verificationText ?? "");
  const missing = [];
  cues.forEach((cue, i) => {
    const ordinal = i + 1;
    const rowPattern = new RegExp(`\\|\\s*${ordinal}\\s*\\|`);
    if (!rowPattern.test(text)) missing.push({ ordinal, id: cue?.id ?? null });
  });
  return { applicable: true, verdict: missing.length === 0 ? "pass" : "fail", totalCues: cues.length, missing };
}

// ── CLI ──
function main(argv) {
  const { get, has } = parseArgs(argv);
  const workspace = get("--workspace");
  const runDir = get("--run");
  const reportOut = get("--report-out");
  const asJson = has("--json");
  if (!workspace || !runDir) {
    console.error("usage: check-cue-coverage.mjs --workspace <ws> --run <rundir> [--report-out <path>] [--json]");
    process.exit(2);
  }

  const lessonId = resolveLessonId(runDir);
  let r;
  if (!lessonId) {
    r = notApplicable("could not resolve lessonId from .pi/run.json");
  } else {
    const paths = lessonPaths(workspace, lessonId);
    let cues = [];
    try {
      cues = JSON.parse(fs.readFileSync(paths.scriptCues, "utf8"))?.cues ?? [];
    } catch {
      r = notApplicable("script-cues.json missing or unparseable");
    }
    let verificationText = "";
    try {
      verificationText = fs.readFileSync(paths.verification, "utf8");
    } catch {
      // verification.md missing is caught by the node's own `checks.post` non-empty gate — degrade to empty
      // text here so this measure still fires (every cue reports missing, an honest fail, not a crash).
    }
    if (!r) r = checkCueCoverage({ cues, verificationText });
  }

  if (reportOut) fs.writeFileSync(reportOut, JSON.stringify(r, null, 2) + "\n");
  if (asJson) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    const covered = r.applicable ? r.totalCues - (r.missing?.length ?? 0) : null;
    console.log(`[cue-coverage] ${r.verdict.toUpperCase()} — ${r.applicable ? `${covered}/${r.totalCues} cues covered` : r.reason}`);
    for (const m of r.missing ?? []) console.log(`  · cue ${m.ordinal} (${m.id ?? "no id"}) not referenced in verification.md`);
  }
  process.exit(0); // report-only measure — never blocks the run
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
