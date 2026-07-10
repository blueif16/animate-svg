#!/usr/bin/env node
// gen/lib-lesson-context.mjs — shared helper for w6-verification's optimize.measure scripts.
//
// `optimize.measure` ops are resolved through a LEANER token context than a live node run — only
// {{RUN}}/{{WORKSPACE}}/{{state.*}} (packages/core/src/optimize/substrate/measure.ts: `ResolveCtx = {run,
// workspace, state}`), NOT {{arg.*}}. So a measure op cannot be handed `{{arg.lessonId}}` directly the way
// this node's own `contract.artifacts` can. Every measure script instead recovers the lessonId itself from
// data the run already wrote: every node's declared artifacts in `.pi/run.json` live under
// `lesson-data/<lessonId>/` or `out/<lessonId>/` — scan those paths for the first match.
//
// Never throws: an unresolvable lessonId degrades to `null` (the caller's job to no-op → not-applicable,
// never a false fail — the check-feasibility.mjs convention in game-omni's harden-blueprint/gen).

import fs from "node:fs";
import path from "node:path";

/** Scan a run's `.pi/run.json` node artifact paths for the lessonId path segment. */
export function resolveLessonId(runDir) {
  let runJson;
  try {
    runJson = JSON.parse(fs.readFileSync(path.join(runDir, ".pi", "run.json"), "utf8"));
  } catch {
    return null;
  }
  const nodes = runJson?.nodes && typeof runJson.nodes === "object" ? Object.values(runJson.nodes) : [];
  for (const node of nodes) {
    for (const a of node?.artifacts ?? []) {
      const m = /\/(?:lesson-data|out)\/([^/]+)\//.exec(String(a?.path ?? ""));
      if (m) return m[1];
    }
  }
  return null;
}

/** The [startedAt] execution window THIS run's `nodeId` itself ran in, read straight off `.pi/run.json`'s
 *  per-node record (`startedAt`/`endedAt`, ISO timestamps — populated once a node actually executes; a
 *  `dry`/`reused`/`pending` node record carries neither). Returns null when unavailable — the caller's job
 *  to treat that as "cannot verify", never as license to assume freshness (fail-closed, never fail-open). */
export function nodeWindow(runDir, nodeId) {
  let runJson;
  try {
    runJson = JSON.parse(fs.readFileSync(path.join(runDir, ".pi", "run.json"), "utf8"));
  } catch {
    return null;
  }
  const rec = runJson?.nodes?.[nodeId];
  if (!rec?.startedAt) return null;
  const startedAt = Date.parse(rec.startedAt);
  if (Number.isNaN(startedAt)) return null;
  const endedAt = rec.endedAt ? Date.parse(rec.endedAt) : null;
  return { startedAt, endedAt: Number.isNaN(endedAt) ? null : endedAt };
}

/** The lesson-scoped paths every w6-verification measure script reads. */
export function lessonPaths(workspace, lessonId) {
  const root = path.join(workspace, "remotion-svg-primitives");
  return {
    scriptCues: path.join(root, "lesson-data", lessonId, "script-cues.json"),
    verification: path.join(root, "lesson-data", lessonId, "verification.md"),
    bboxManifest: path.join(root, "out", lessonId, "bbox-manifest.json"),
    bboxOverlayDir: path.join(root, "out", lessonId, "bbox-overlay"),
  };
}

/** Shared CLI-arg reader (`--flag value` pairs + bare `--flag` booleans). */
export function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    get: (flag) => {
      const i = args.indexOf(flag);
      return i >= 0 ? (args[i + 1] ?? null) : null;
    },
    has: (flag) => args.includes(flag),
  };
}
