#!/usr/bin/env node
// gen/check-bbox-overlay-produced.mjs — HARD floor MEASURE for w6-verification (a thin op[] wrapper,
// config not SDK code — piflow-overlord/references/building-measures.md Part D).
//
// The prompt's own REVIEW SURFACE law: "NEVER review a bare screenshot: (cd remotion-svg-primitives && npm
// run lesson:bbox -- --config lesson-data/<id>/pipeline.json) draws every registered element's MEASURED box
// ... review/attach THOSE boxed stills for any collision/size question, not a plain frame." This is the
// single highest-leverage PROCEDURAL gate for this node — did it actually run that command before judging
// layout? A deterministic side-effect check: `out/<id>/bbox-overlay/` must exist and hold ≥1 PNG.
//
// CLI: node check-bbox-overlay-produced.mjs --workspace <ws> --run <rundir> [--report-out <path>] [--json]

import fs from "node:fs";
import { resolveLessonId, lessonPaths, parseArgs } from "./lib-lesson-context.mjs";

function notApplicable(reason) {
  return { applicable: false, verdict: "pass", reason, pngCount: 0 };
}

/** checkBboxOverlayProduced({ files }) — pure. `files` = a directory listing (string[], as from
 *  fs.readdirSync) of out/<id>/bbox-overlay/, or null if the dir does not exist. */
export function checkBboxOverlayProduced({ files }) {
  if (files == null) {
    return { applicable: true, verdict: "fail", pngCount: 0, reason: "bbox-overlay/ directory does not exist — lesson:bbox was not run" };
  }
  const pngCount = files.filter((f) => f.toLowerCase().endsWith(".png")).length;
  return { applicable: true, verdict: pngCount > 0 ? "pass" : "fail", pngCount };
}

// ── CLI ──
function main(argv) {
  const { get, has } = parseArgs(argv);
  const workspace = get("--workspace");
  const runDir = get("--run");
  const reportOut = get("--report-out");
  const asJson = has("--json");
  if (!workspace || !runDir) {
    console.error("usage: check-bbox-overlay-produced.mjs --workspace <ws> --run <rundir> [--report-out <path>] [--json]");
    process.exit(2);
  }

  const lessonId = resolveLessonId(runDir);
  let r;
  if (!lessonId) {
    r = notApplicable("could not resolve lessonId from .pi/run.json");
  } else {
    const paths = lessonPaths(workspace, lessonId);
    let files = null;
    try {
      files = fs.readdirSync(paths.bboxOverlayDir);
    } catch {
      files = null;
    }
    r = checkBboxOverlayProduced({ files });
  }

  if (reportOut) fs.writeFileSync(reportOut, JSON.stringify(r, null, 2) + "\n");
  if (asJson) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log(`[bbox-overlay-produced] ${r.verdict.toUpperCase()} — ${r.pngCount} png(s)${r.reason ? ` (${r.reason})` : ""}`);
  }
  process.exit(0); // report-only measure — never blocks the run
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
