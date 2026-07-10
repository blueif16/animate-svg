#!/usr/bin/env node
// gap-scan-lint.mjs — w3c-sound-asset's HARD registry-membership measure, wired via this node's
// node.json `optimize.measure` (see the op's `note` for the full rationale). Read-only audit: never
// mutates audio-cues.json, the shared-sound library, or the vlog_test pipeline sidecars.
//
// WHY THIS SCRIPT EXISTS: the node's own contract is "every bed/intro.sting/sfx[].sound key in
// audio-cues.json resolves to a licensed WAV in the shared library (or is named + minted as a gap)" —
// but nothing ever CHECKED that mechanically. A real historical run of this node
// (lesson-data/kptest-compare-more-fewer/_logs/sound-asset.md) flagged exactly this absence as a
// pipelineFinding. A second real historical run (lesson-data/kptest-classroom-objects) shows the
// failure mode concretely: its audio-cues.json is both schema-malformed (bed/intro.sting/outro.resolve
// wrapped as `{key: "..."}` objects instead of plain strings/booleans) AND syntactically invalid JSON,
// yet the node's log claimed full success. This script is the deterministic catch.
//
// USAGE
//   node gap-scan-lint.mjs --run <runDir> --workspace <workspace> [--lessonId <id>]
//   --run and --workspace are the only args `optimize.measure` can supply today (see the ENGINE GAP
//   note below); --lessonId is an optional override for standalone/manual invocation.
//
// EXIT CODE: 1 iff the audio-cues.json fails to parse, a bed/sting/sfx value is schema-malformed
// (non-string), an outro.resolve is present but non-boolean, or a genuinely unresolved key remains
// (in neither the shared-sound index nor the vlog_test manifest/generated sidecars). 0 otherwise.
// logMissingKeys (does the node's own log ever mention each key) is ADVISORY — folded into the report,
// never fails the op; the log's evidence density is a SOFT (criteria.md) concern, not a hard floor.

import fs from 'node:fs';
import path from 'node:path';

function arg(name, argv) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

function readJson(p) {
  try {
    return { ok: true, value: JSON.parse(fs.readFileSync(p, 'utf8')) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Every top-level `name` in an `_index.json` array (best-effort — a missing/unreadable file is an
 *  empty registry, never a throw; this is a READ-ONLY audit over external, out-of-repo files). */
function registryNames(indexPath) {
  const r = readJson(indexPath);
  return r.ok && Array.isArray(r.value) ? new Set(r.value.map((x) => x?.name)) : new Set();
}

/** Every top-level `id` in the vlog_test pipeline's manifest/generated sidecars (a key legitimately
 *  named-and-minted THIS run, ahead of the frozen shared-sound index). */
function sidecarIds(sidecarPath) {
  const r = readJson(sidecarPath);
  return r.ok && Array.isArray(r.value) ? new Set(r.value.map((x) => x?.id)) : new Set();
}

function writeReportAndExit(runDir, report, code) {
  const outPath = path.join(runDir, 'optimize', 'substrate', 'w3c-sound-asset.gap-scan.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  // stdout mirrors the report minus the verbose lists — the run op's own `stdout` capture stays terse.
  const { unresolvedList, schemaViolations, logMissingKeys, ...terse } = report;
  console.log(JSON.stringify(terse));
  process.exit(code);
}

function main() {
  const argv = process.argv.slice(2);
  const runDir = arg('--run', argv);
  const workspace = arg('--workspace', argv);
  const lessonIdArg = arg('--lessonId', argv);
  if (!runDir || !workspace) {
    console.error('usage: gap-scan-lint.mjs --run <runDir> --workspace <workspace> [--lessonId <id>]');
    process.exit(2);
  }

  // ENGINE GAP WORKED AROUND: runSubstrateMeasure's ResolveCtx carries {run, workspace, state} but NOT
  // `args`, so an `optimize.measure` op cannot resolve `{{arg.lessonId}}` (packages/core/src/optimize/
  // substrate/measure.ts + workflow/resolver.ts's ResolveCtx). Recover it instead from THIS node's own
  // declared artifact path, already recorded in <run>/.pi/run.json (populated regardless of node status)
  // — a mechanical derivation, not a guess: contract.artifacts always embeds `lesson-data/<id>/`.
  let lessonId = lessonIdArg;
  if (!lessonId) {
    const runJson = readJson(path.join(runDir, '.pi', 'run.json'));
    const artifactPath = runJson.ok ? runJson.value?.nodes?.['w3c-sound-asset']?.artifacts?.[0]?.path : undefined;
    const m = typeof artifactPath === 'string' ? artifactPath.match(/lesson-data\/([^/]+)\//) : null;
    lessonId = m?.[1];
  }

  const report = { node: 'w3c-sound-asset', lessonId: lessonId ?? null, generatedAt: new Date().toISOString() };

  if (!lessonId) {
    report.error = 'could not derive lessonId: no --lessonId and no recoverable nodes["w3c-sound-asset"].artifacts[0].path in .pi/run.json';
    report.totalKeys = 0;
    report.resolvedKeys = 0;
    report.unresolvedKeys = 0;
    writeReportAndExit(runDir, report, 1);
    return;
  }

  const lessonDir = path.join(workspace, 'remotion-svg-primitives', 'lesson-data', lessonId);
  const audioCuesPath = path.join(lessonDir, 'audio-cues.json');
  const logPath = path.join(lessonDir, '_logs', 'sound-asset.md');
  const libRoot = path.join(workspace, '..', 'shared-sound', 'public', 'audio');
  const pipelineRoot = path.join(workspace, '..', 'vlog_test', 'pipeline');

  const cues = readJson(audioCuesPath);
  if (!cues.ok) {
    report.inputParseError = cues.error;
    report.totalKeys = 0;
    report.resolvedKeys = 0;
    report.unresolvedKeys = 0;
    writeReportAndExit(runDir, report, 1);
    return;
  }
  const cuesObj = cues.value ?? {};

  // Collect every requested key, TYPED (a bed key only ever resolves against the beds registry, etc.).
  // A non-string value at any of these three spots is exactly the kptest-classroom-objects defect shape
  // (`{key: "..."}` wrapper objects) — flagged, never silently unwrapped (that would mask the defect).
  const requested = []; // { type, key }
  const schemaViolations = [];

  function pushKey(type, v, where) {
    if (v == null) return;
    if (typeof v === 'string') {
      requested.push({ type, key: v });
      return;
    }
    schemaViolations.push(`${where}: expected a string key, got ${JSON.stringify(v)}`);
  }

  pushKey('bed', cuesObj.bed, 'bed');
  if (cuesObj.intro) pushKey('sting', cuesObj.intro.sting, 'intro.sting');
  if (cuesObj.outro && cuesObj.outro.resolve !== undefined && typeof cuesObj.outro.resolve !== 'boolean') {
    schemaViolations.push(`outro.resolve: expected a boolean flag, got ${JSON.stringify(cuesObj.outro.resolve)}`);
  }
  for (const [i, row] of (Array.isArray(cuesObj.sfx) ? cuesObj.sfx : []).entries()) {
    pushKey('sfx', row?.sound, `sfx[${i}].sound`);
  }

  const registry = {
    bed: registryNames(path.join(libRoot, '_beds', '_index.json')),
    sting: registryNames(path.join(libRoot, '_stings', '_index.json')),
    sfx: registryNames(path.join(libRoot, '_sfx', '_index.json')),
  };
  // A key legitimately named-and-minted THIS run lands in the manifest before (or alongside) the frozen
  // index — a manifest/generated hit counts as resolved same as a registry hit.
  const pending = new Set([
    ...sidecarIds(path.join(pipelineRoot, 'sound-assets.manifest.json')),
    ...sidecarIds(path.join(pipelineRoot, 'sound-assets.generated.json')),
  ]);

  const unresolvedList = [];
  for (const { type, key } of requested) {
    if (!registry[type]?.has(key) && !pending.has(key)) unresolvedList.push({ type, key });
  }

  // Log-completeness (ADVISORY only): does the node's own output log ever mention each requested key?
  // A key silently missing from the log is the format-inconsistency pattern seen across historical runs
  // (a bare "no gaps" prose assertion vs. a per-key evidence table) — real, but a SOFT (criteria.md)
  // concern, so it is recorded, not gated.
  const logText = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
  const uniqueKeys = [...new Set(requested.map((r) => r.key))];
  const logMissingKeys = uniqueKeys.filter((k) => !logText.includes(k));

  report.totalKeys = requested.length;
  report.resolvedKeys = requested.length - unresolvedList.length;
  report.unresolvedKeys = unresolvedList.length;
  report.unresolvedList = unresolvedList;
  report.schemaViolations = schemaViolations;
  report.schemaViolationCount = schemaViolations.length;
  report.logMissingKeys = logMissingKeys;
  report.logMentionsAllKeys = logMissingKeys.length === 0;

  const failing = unresolvedList.length > 0 || schemaViolations.length > 0;
  writeReportAndExit(runDir, report, failing ? 1 : 0);
}

main();
