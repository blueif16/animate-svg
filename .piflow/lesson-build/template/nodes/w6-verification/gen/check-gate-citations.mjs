#!/usr/bin/env node
// gen/check-gate-citations.mjs — HARD floor MEASURE for w6-verification (a thin op[] wrapper, config not
// SDK code — piflow-overlord/references/building-measures.md Part D).
//
// The node-specific invariant: the `lesson-verification` SKILL explicitly forbids SILENT ACCEPTANCE of a
// bbox-manifest.json advisory signal — "Any failed gate, and any measured collision or caption intrusion,
// must either be fixed... or carry an explicit written justification quoting the exact failing row... silent
// acceptance is forbidden; a `SKIP: <reason>` is acceptable but must be acknowledged" (SKILL.md). This is a
// MECHANICAL completeness check ONLY: does verification.md so much as ACKNOWLEDGE each non-clean signal?
// Whether the justification is a GOOD one (a true false-positive vs. a real defect waved away) is
// criteria.md R2/R4's job (soft, judged) — this floor only catches the cheapest defects: an omission, OR an
// outright DENIAL of the signal ("no collisions found", "overlap: clear") — a denial is factually FALSE
// (bbox-manifest already measured the signal as non-clean) and must FAIL, not count as a citation. Keying on
// mere keyword PRESENCE let a report deny a real signal ("no collisions") and still "cite" it because the
// word "collision" appeared — this measure keys on the ACKNOWLEDGMENT DECISION instead (anti-Goodhart Law 3).
//
// CLI: node check-gate-citations.mjs --workspace <ws> --run <rundir> [--report-out <path>] [--json]

import fs from "node:fs";
import { resolveLessonId, lessonPaths, parseArgs } from "./lib-lesson-context.mjs";

function notApplicable(reason) {
  return { applicable: false, verdict: "pass", reason, signals: [], missing: [] };
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Denial vocabulary: words that, sitting immediately next to the signal's name, ASSERT the signal's
// ABSENCE rather than acknowledge it. Deliberately excludes a bare digit "0" (too easily false-matched
// against an unrelated decimal elsewhere on the same line, e.g. "ratio 0.364") — a literal zero-count
// denial is instead caught by the tight `${name} == 0` adjacency check below.
const DENY_WORDS = "(?:no|none|zero|clear|clean|resolved|n\\/a|not\\s+(?:found|detected|present|failing|applicable)|passed|passing)";

function lastWords(s, k) {
  return s.trim().split(/\s+/).filter(Boolean).slice(-k).join(" ");
}
function firstWords(s, k) {
  return s.trim().split(/\s+/).filter(Boolean).slice(0, k).join(" ");
}

/**
 * hasAcknowledgedMention(text, name) — true iff at least one occurrence of `name` in `text` (per LINE, so a
 * denial elsewhere in the doc can't launder an unrelated mention) sits OUTSIDE a denial context. A signal
 * with ZERO occurrences, or where EVERY occurrence is a denial ("no collisions" / "overlap: clear" / "0
 * collisions"), is NOT acknowledged — this is the DECISION the measure keys on, not bare substring presence.
 */
export function hasAcknowledgedMention(text, name) {
  const esc = escapeRe(name);
  const nameRe = new RegExp(`\\b${esc}s?\\b`, "gi");
  const denyWordRe = new RegExp(`\\b${DENY_WORDS}\\b`, "i");
  const lines = String(text ?? "").split(/\r?\n/);
  for (const line of lines) {
    let m;
    nameRe.lastIndex = 0;
    while ((m = nameRe.exec(line))) {
      const pre = line.slice(0, m.index);
      const post = line.slice(m.index + m[0].length);
      const wordDenial = denyWordRe.test(lastWords(pre, 4)) || denyWordRe.test(firstWords(post, 4));
      const lastWordOfPre = lastWords(pre, 1);
      const firstWordOfPost = firstWords(post, 1);
      const zeroDenial = /^0[:.,;]?$/.test(lastWordOfPre) || /^0[:.,;]?$/.test(firstWordOfPost);
      if (!wordDenial && !zeroDenial) return true; // a genuine, non-denied acknowledgment
    }
  }
  return false;
}

/**
 * checkGateCitations({ summary, verificationText }) — pure. `summary` = bbox-manifest.json's `summary`
 * block. A "signal" is any of: each string in `gatesFailed[]`; `measuredCollisionCount > 0`;
 * `captionIntrusionCount > 0`. Each signal must get at least one non-denied acknowledging mention.
 */
export function checkGateCitations({ summary, verificationText }) {
  const s = summary ?? {};
  const text = String(verificationText ?? "");
  const signals = [];
  for (const gate of Array.isArray(s.gatesFailed) ? s.gatesFailed : []) {
    signals.push({ kind: "gatesFailed", names: [String(gate)] });
  }
  if (typeof s.measuredCollisionCount === "number" && s.measuredCollisionCount > 0) {
    // Real reports phrase a measured overlap either way (kptest-greetings-verify's issues table says
    // "measured overlap", not "collision") — either keyword is a legitimate citation.
    signals.push({ kind: "measuredCollisionCount", names: ["collision", "overlap"] });
  }
  if (typeof s.captionIntrusionCount === "number" && s.captionIntrusionCount > 0) {
    signals.push({ kind: "captionIntrusionCount", names: ["caption"] });
  }
  if (signals.length === 0) {
    return { applicable: true, verdict: "pass", signals: [], missing: [], reason: "no non-clean signals in bbox-manifest.summary" };
  }
  const missing = signals.filter((sig) => !sig.names.some((n) => hasAcknowledgedMention(text, n)));
  return { applicable: true, verdict: missing.length === 0 ? "pass" : "fail", signals, missing };
}

// ── CLI ──
function main(argv) {
  const { get, has } = parseArgs(argv);
  const workspace = get("--workspace");
  const runDir = get("--run");
  const reportOut = get("--report-out");
  const asJson = has("--json");
  if (!workspace || !runDir) {
    console.error("usage: check-gate-citations.mjs --workspace <ws> --run <rundir> [--report-out <path>] [--json]");
    process.exit(2);
  }

  const lessonId = resolveLessonId(runDir);
  let r;
  if (!lessonId) {
    r = notApplicable("could not resolve lessonId from .pi/run.json");
  } else {
    const paths = lessonPaths(workspace, lessonId);
    let summary = null;
    try {
      summary = JSON.parse(fs.readFileSync(paths.bboxManifest, "utf8"))?.summary ?? null;
    } catch {
      r = notApplicable("bbox-manifest.json missing or unparseable");
    }
    let verificationText = "";
    try {
      verificationText = fs.readFileSync(paths.verification, "utf8");
    } catch {
      // degrade to empty text — an honest fail if there were signals to cite, never a crash
    }
    if (!r) r = checkGateCitations({ summary, verificationText });
  }

  if (reportOut) fs.writeFileSync(reportOut, JSON.stringify(r, null, 2) + "\n");
  if (asJson) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log(`[gate-citations] ${r.verdict.toUpperCase()} — ${r.signals?.length ?? 0} non-clean signal(s), ${r.missing?.length ?? 0} uncited`);
    for (const m of r.missing ?? []) console.log(`  · ${m.kind} (${m.names.join("/")}) not acknowledged in verification.md (absent, or only ever denied)`);
  }
  process.exit(0); // report-only measure — never blocks the run
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
