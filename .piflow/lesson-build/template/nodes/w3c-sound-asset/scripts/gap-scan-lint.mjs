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
// HARDENING (adversarial-pass follow-up — closes three additional holes on top of the original gate):
//   1. MEMBERSHIP ALONE IS NOT RESOLUTION. A name present in an `_index.json` / the vlog_test GENERATED
//      sidecar is metadata, not proof a file exists — the manifest can carry a row for a mint that was
//      never actually run. Every key now must additionally `statSync` the REAL `.wav` (via the index
//      entry's own `file` field, or the sidecar's own `outputFile`) AND a sibling `.license.txt` before it
//      counts as resolved. A manifest-only row with no generated/backing file lands in `missingFileList`
//      (a hard fail), not `resolvedEvidence` — this is what closes the "never-produced gap passes today"
//      hole. (The `sound-assets.manifest.json` — the PLANNED-mint list — is no longer consulted for
//      resolution at all; only the GENERATED sidecar + a real file on disk counts as "minted".)
//   2. ZERO REQUESTED KEYS IS A HARD FAIL, NEVER A SILENT PASS. Every lesson's sound manifest carries at
//      least a `bed` key by contract (`lesson-sound-design` SKILL: "Pick ONE bed key... never invent a
//      track per lesson" — bed is never optional). A syntactically-valid but EMPTY `audio-cues.json`
//      (`{}`) previously produced `totalKeys:0` with nothing to fail on — a false green for an upstream
//      defect (w2c-sound-design never populated the manifest), not "nothing to do".
//   3. THE LOG'S CITED BYTE COUNT IS NOW A DETERMINISTIC FACT-CHECK, not merely a judge-quotable line.
//      For every key this script resolves with real evidence (a real stat() size), it also looks for a
//      plausible byte-count-shaped number on the log's line mentioning that key and cross-checks it
//      against the ACTUAL size. A log that cites a fabricated/incorrect byte count is now a hard fail
//      (`logByteMismatches`) independent of whatever a soft judge concludes from reading the prose.
//
// USAGE
//   node gap-scan-lint.mjs --run <runDir> --workspace <workspace> [--lessonId <id>]
//   --run and --workspace are the only args `optimize.measure` can supply today (see the ENGINE NOTE in
//   node.json's op `note`); --lessonId is an optional override for standalone/manual invocation.
//
// EXIT CODE: 1 iff the audio-cues.json fails to parse, requests ZERO bed/intro.sting/sfx keys, a
// bed/sting/sfx value is schema-malformed (non-string), an outro.resolve is present but non-boolean, a
// requested key resolves to NEITHER a registry entry NOR a minted sidecar entry, a resolved key's real
// `.wav`/`.license.txt` is missing on disk (membership without a backing file), or the log cites a real
// but WRONG byte count for a key it claims resolved. 0 otherwise.
// logMissingKeys (does the node's own log ever mention each key) stays ADVISORY — folded into the report,
// never fails the op; the log's evidence DENSITY is a SOFT (criteria.md) concern. A cited-but-WRONG number
// is different in kind (a fact-check, not a formatting nicety) and DOES fail — see logByteMismatches.

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

/** `statSync`'s size, or null on any error (missing file, not a file, permission) — never throws. This is
 *  the machinery that closes the "membership without a backing file" hole: an index/manifest row is a
 *  CLAIM, this is the PROOF. */
function statSize(p) {
  try {
    return fs.statSync(p).size;
  } catch {
    return null;
  }
}

function licensePathFor(wavPath) {
  return wavPath.replace(/\.wav$/i, '.license.txt');
}

/** Every entry of an `_index.json` array, keyed by `name` (best-effort — a missing/unreadable file is an
 *  empty registry, never a throw; this is a READ-ONLY audit over external, out-of-repo files). Keyed by
 *  the whole entry (not just presence) so the caller can read its `file` field for the real on-disk path. */
function registryEntries(indexPath) {
  const r = readJson(indexPath);
  return r.ok && Array.isArray(r.value) ? new Map(r.value.map((x) => [x?.name, x])) : new Map();
}

/** Every entry of the vlog_test pipeline's GENERATED sidecar, keyed by `id`. ONLY the generated sidecar
 *  counts toward "minted this run" — the PLANNED manifest (`sound-assets.manifest.json`) is deliberately
 *  no longer consulted for resolution: a manifest row means "queued to mint", not "actually produced", and
 *  treating it as resolved is exactly the never-produced-gap hole this hardening closes. */
function generatedEntries(sidecarPath) {
  const r = readJson(sidecarPath);
  return r.ok && Array.isArray(r.value) ? new Map(r.value.map((x) => [x?.id, x])) : new Map();
}

function writeReportAndExit(runDir, report, code) {
  const outPath = path.join(runDir, 'optimize', 'substrate', 'w3c-sound-asset.gap-scan.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  // stdout mirrors the report minus the verbose lists — the run op's own `stdout` capture stays terse.
  const { unresolvedList, schemaViolations, logMissingKeys, missingFileList, logByteMismatches, resolvedEvidence, ...terse } = report;
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

  // Recover lessonId from THIS node's own declared artifact path, already recorded in <run>/.pi/run.json
  // (populated regardless of node status) — a mechanical derivation, not a guess: contract.artifacts
  // always embeds `lesson-data/<id>/`. (See node.json's op `note` for why this — not an arg token — is the
  // recovery path.)
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
  // `sound-assets.generated.json`'s own `outputFile` is written by generate-sound-assets.mjs as
  // `path.relative(REPO_ROOT, wavPath)` where REPO_ROOT = the pipeline dir's PARENT (`vlog_test/`, not
  // `vlog_test/pipeline/`) — resolve outputFile against THIS root, never pipelineRoot, or every minted
  // path silently misses.
  const vlogRoot = path.join(workspace, '..', 'vlog_test');

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

  // ZERO-KEY HARD FAIL (hardening #2). `audio-cues.json` parsed as valid JSON but requested NOTHING —
  // every lesson's manifest carries at least a `bed` key by contract, so this is never legitimately
  // "nothing to do". Fires even when schemaViolations is also non-empty (both are real, independent
  // defects); it specifically closes the case a schema violation does NOT cover: a bare `{}` with no
  // malformed shape at all, just nothing in it (the historical kptest-compare-more-fewer input on disk).
  if (requested.length === 0) {
    report.zeroKeysUnexpected = true;
    report.totalKeys = 0;
    report.resolvedKeys = 0;
    report.unresolvedKeys = 0;
    report.missingFileCount = 0;
    report.logByteMismatchCount = 0;
    report.schemaViolations = schemaViolations;
    report.schemaViolationCount = schemaViolations.length;
    report.error =
      'audio-cues.json parses but requests ZERO bed/intro.sting/sfx keys -- every lesson requires at least a ' +
      'bed key (lesson-sound-design SKILL: "Pick ONE bed key... never invent a track per lesson"); an empty ' +
      'manifest is an upstream (w2c-sound-design) defect, not "nothing to do".';
    writeReportAndExit(runDir, report, 1);
    return;
  }

  const KIND_DIR = { bed: '_beds', sting: '_stings', sfx: '_sfx' };
  const registry = {
    bed: registryEntries(path.join(libRoot, KIND_DIR.bed, '_index.json')),
    sting: registryEntries(path.join(libRoot, KIND_DIR.sting, '_index.json')),
    sfx: registryEntries(path.join(libRoot, KIND_DIR.sfx, '_index.json')),
  };
  const generated = generatedEntries(path.join(pipelineRoot, 'sound-assets.generated.json'));

  const unresolvedList = [];   // key absent from every registry AND the generated sidecar
  const missingFileList = [];  // key found as an entry, but its real .wav/.license.txt is absent on disk
                                // -- the "never-produced gap" hardening (#1): membership is a claim, this
                                // is the proof, and a claim without proof is a hard fail, not a pass.
  const resolvedEvidence = []; // {type,key,resolvedFile,bytes,source} -- the deterministic oracle the log's
                                // own claims are cross-checked against below (hardening #3).

  for (const { type, key } of requested) {
    const entry = registry[type]?.get(key);
    if (entry) {
      const wavPath = path.join(libRoot, KIND_DIR[type], entry.file || `${key}.wav`);
      const licPath = licensePathFor(wavPath);
      const bytes = statSize(wavPath);
      const licBytes = statSize(licPath);
      if (bytes == null) {
        missingFileList.push({ type, key, reason: 'registry entry exists but .wav is missing on disk', path: wavPath });
      } else if (licBytes == null) {
        missingFileList.push({ type, key, reason: '.license.txt is missing on disk', path: licPath });
      } else {
        resolvedEvidence.push({ type, key, resolvedFile: path.relative(workspace, wavPath), bytes, source: 'registry' });
      }
      continue;
    }
    const gen = generated.get(key);
    if (gen && typeof gen.outputFile === 'string') {
      const wavPath = path.resolve(vlogRoot, gen.outputFile);
      const licPath = licensePathFor(wavPath);
      const bytes = statSize(wavPath);
      const licBytes = statSize(licPath);
      if (bytes == null) {
        missingFileList.push({ type, key, reason: 'minted (generated sidecar) but .wav was never produced on disk', path: wavPath });
      } else if (licBytes == null) {
        missingFileList.push({ type, key, reason: 'minted .wav present but .license.txt is missing on disk', path: licPath });
      } else {
        resolvedEvidence.push({ type, key, resolvedFile: path.relative(workspace, wavPath), bytes, source: 'minted-this-run' });
      }
      continue;
    }
    unresolvedList.push({ type, key });
  }

  // Log-completeness (ADVISORY only): does the node's own output log ever mention each requested key?
  // A key silently missing from the log is the format-inconsistency pattern seen across historical runs
  // (a bare "no gaps" prose assertion vs. a per-key evidence table) — real, but a SOFT (criteria.md)
  // concern, so it is recorded, not gated.
  const logText = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
  const uniqueKeys = [...new Set(requested.map((r) => r.key))];
  const logMissingKeys = uniqueKeys.filter((k) => !logText.includes(k));

  // DETERMINISTIC BYTE-COUNT CROSS-CHECK (hardening #3). For every key resolved with real evidence, look
  // for a plausible byte-count-shaped number on the log's line mentioning that key and require it to match
  // the ACTUAL stat() size. The candidate shape is DELIBERATELY NARROW — only a COMMA-GROUPED integer
  // (`\d{1,3}(,\d{3})+`, e.g. `32,881,004`) counts as a byte-count claim, because that comma-grouped form is
  // the convention every sampled real byte-count citation in this lane actually uses (kptest-compare-more-
  // fewer's log, the gold exemplar). A log that instead cites `lengthSeconds` (kp2-counting-by-tens: `184.97s`,
  // `3.00s`) has NO comma-grouped number on those lines, so it yields zero candidates and is correctly left
  // alone — this check must never punish a log for using a legitimate, different (non-byte) evidence unit. A
  // match against ANY candidate on the line passes (a log may cite more than one number); absence of any
  // comma-grouped number at all is `logMissingKeys`' concern (soft), not this check's (hard).
  const logByteMismatches = [];
  const logLines = logText.split('\n');
  for (const { type, key, bytes } of resolvedEvidence) {
    const keyLine = logLines.find((line) => line.includes(key));
    if (!keyLine) continue;
    const numberTokens = keyLine.match(/\d{1,3}(?:,\d{3})+/g) ?? [];
    const candidates = numberTokens.map((n) => Number(n.replace(/,/g, ''))).filter((n) => Number.isFinite(n));
    if (candidates.length === 0) continue;
    if (!candidates.includes(bytes)) {
      logByteMismatches.push({ type, key, claimedNumbers: candidates, actualBytes: bytes });
    }
  }

  report.totalKeys = requested.length;
  report.resolvedKeys = resolvedEvidence.length;
  report.unresolvedKeys = unresolvedList.length + missingFileList.length;
  report.unresolvedList = unresolvedList;
  report.missingFileList = missingFileList;
  report.missingFileCount = missingFileList.length;
  report.resolvedEvidence = resolvedEvidence;
  report.schemaViolations = schemaViolations;
  report.schemaViolationCount = schemaViolations.length;
  report.logMissingKeys = logMissingKeys;
  report.logMentionsAllKeys = logMissingKeys.length === 0;
  report.logByteMismatches = logByteMismatches;
  report.logByteMismatchCount = logByteMismatches.length;

  const failing =
    unresolvedList.length > 0 ||
    missingFileList.length > 0 ||
    schemaViolations.length > 0 ||
    logByteMismatches.length > 0;
  writeReportAndExit(runDir, report, failing ? 1 : 0);
}

main();
