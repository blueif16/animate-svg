#!/usr/bin/env node
// gen/check-bbox-overlay-produced.mjs — HARD floor MEASURE for w6-verification (a thin op[] wrapper,
// config not SDK code — piflow-overlord/references/building-measures.md Part D).
//
// The prompt's own REVIEW SURFACE law: "NEVER review a bare screenshot: (cd remotion-svg-primitives && npm
// run lesson:bbox -- --config lesson-data/<id>/pipeline.json) draws every registered element's MEASURED box
// ... review/attach THOSE boxed stills for any collision/size question, not a plain frame." This is the
// single highest-leverage PROCEDURAL gate for this node — did IT (w6-verification), not some other node,
// actually run that command before judging layout?
//
// HARDENED (closes the proven hole "mis-targeted to an upstream w4a side-effect"): `out/<id>/bbox-overlay/`
// is NOT this node's own artifact — w4a-composer's OWN self-check/fix loop runs the identical `npm run
// lesson:bbox -- --config ...` command against the SAME output path as part of its own review surface (see
// `nodes/w4a-composer/prompt.md` line 21 / `criteria.md` "the boxed `lesson:bbox` still ... is the review
// surface"). Since w4a-composer always finishes strictly BEFORE w6-verification starts (w6 depends on
// w5-render, which depends transitively on w4a-composer), a directory-existence + PNG-count check alone
// cannot tell "w6 ran the review command" from "w6 silently inherited w4a's leftover PNGs and never ran it
// itself" — the exact false-pass the adversarial pass proved. The fix retargets the measure to THIS node's
// own execution window: at least one bbox-overlay PNG's mtime must fall AT OR AFTER w6-verification's own
// `startedAt` (from `.pi/run.json`'s per-node record) — proof the files were (re)written DURING this node's
// own run, not merely reused from an ancestor. Fail-closed: if that timing can't be established, the measure
// FAILS rather than crediting bare directory presence as if it were this node's own signal.
//
// CLI: node check-bbox-overlay-produced.mjs --workspace <ws> --run <rundir> [--report-out <path>] [--json]

import fs from "node:fs";
import path from "node:path";
import { resolveLessonId, lessonPaths, nodeWindow, parseArgs } from "./lib-lesson-context.mjs";

const THIS_NODE_ID = "w6-verification";

function notApplicable(reason) {
  return { applicable: false, verdict: "pass", reason, pngCount: 0, freshCount: 0 };
}

/**
 * checkBboxOverlayProduced({ files, statTimes, nodeStartedAt }) — pure.
 * `files` = a directory listing (string[]) of out/<id>/bbox-overlay/, or null if the dir does not exist.
 * `statTimes` = { [filename]: mtimeMs } for entries in `files` (best-effort; a missing key is treated as
 * "unstattable", never fresh). `nodeStartedAt` = this run's w6-verification `startedAt` in epoch ms, or null
 * if unavailable.
 */
export function checkBboxOverlayProduced({ files, statTimes, nodeStartedAt }) {
  if (files == null) {
    return { applicable: true, verdict: "fail", pngCount: 0, freshCount: 0, reason: "bbox-overlay/ directory does not exist — lesson:bbox was not run" };
  }
  const pngs = files.filter((f) => f.toLowerCase().endsWith(".png"));
  if (pngs.length === 0) {
    return { applicable: true, verdict: "fail", pngCount: 0, freshCount: 0, reason: "bbox-overlay/ holds no PNGs" };
  }
  if (nodeStartedAt == null) {
    // Fail-closed (never fail-open): with no timing to compare against, PNG presence alone cannot
    // distinguish THIS node's own review run from a stale upstream (w4a-composer) side effect.
    return {
      applicable: true,
      verdict: "fail",
      pngCount: pngs.length,
      freshCount: 0,
      reason: `${THIS_NODE_ID}'s own startedAt is unavailable in .pi/run.json — cannot confirm bbox-overlay/ was produced by THIS node's own run rather than an upstream (e.g. w4a-composer) side effect`,
    };
  }
  const freshCount = pngs.filter((f) => (statTimes?.[f] ?? -Infinity) >= nodeStartedAt).length;
  if (freshCount === 0) {
    return {
      applicable: true,
      verdict: "fail",
      pngCount: pngs.length,
      freshCount: 0,
      reason: "every bbox-overlay PNG predates this node's own run — stale from an upstream producer (e.g. w4a-composer's own lesson:bbox side effect), not evidence THIS node ran the review command",
    };
  }
  return { applicable: true, verdict: "pass", pngCount: pngs.length, freshCount };
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
    const statTimes = {};
    try {
      files = fs.readdirSync(paths.bboxOverlayDir);
      for (const f of files) {
        try {
          statTimes[f] = fs.statSync(path.join(paths.bboxOverlayDir, f)).mtimeMs;
        } catch {
          // unstattable entry (e.g. a race with a concurrent writer) — leave absent, never "fresh" by default
        }
      }
    } catch {
      files = null;
    }
    const win = nodeWindow(runDir, THIS_NODE_ID);
    r = checkBboxOverlayProduced({ files, statTimes, nodeStartedAt: win?.startedAt ?? null });
  }

  if (reportOut) fs.writeFileSync(reportOut, JSON.stringify(r, null, 2) + "\n");
  if (asJson) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log(`[bbox-overlay-produced] ${r.verdict.toUpperCase()} — ${r.pngCount} png(s), ${r.freshCount} fresh (produced during this node's own run)${r.reason ? ` (${r.reason})` : ""}`);
  }
  process.exit(0); // report-only measure — never blocks the run
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
