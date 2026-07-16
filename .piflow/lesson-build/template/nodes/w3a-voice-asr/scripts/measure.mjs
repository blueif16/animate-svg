#!/usr/bin/env node
// w3a-voice-asr optimize.measure wrapper (piflow-overlord "building-measures.md" Part D — the thin
// op[] wrapper for the node-specific deterministic invariants a JSON schema can't express). Read by the
// out-of-band optimize substrate ONLY (`runSubstrateMeasure` fires this as a `run` op via node.json's
// `optimize.measure`); it never touches the live node run and never blocks anything on its own.
//
// Replaces two prior mechanisms that an adversarial verification pass proved GAMEABLE:
//   1. `audio-gate-pass-floor` / `audio-gate-truncation-never-blocks-silently` were `gate:{kind:
//      'regex-present'}` checks scanning audio-gate.json's RAW BYTES for `"pass":\s*true` /
//      `"truncationFails":\s*0` — a WHOLE-FILE substring match that would false-PASS on any nested
//      field of the same name anywhere in the report (a future per-finding "pass" key, or a
//      hand-edited artifact). Fixed here: JSON.parse the file and read the TOP-LEVEL `pass` /
//      `truncationFails` fields explicitly — never a byte-level scan.
//   2. `onset-augmentation-coverage` counted a cue as "carries tokenOnsets" merely because the string
//      "tokenOnsets" appeared on the SAME LINE as that cue's `id: "..."` — (a) breaks the moment the
//      generated Clips.ts is pretty-printed across multiple lines per cue, and (b) keys on FIELD
//      PRESENCE, so a gamed/hand-edited `tokenOnsets: []` (empty array) satisfied it. Fixed here:
//      object-scope the parse (a string-aware brace scanner extracts each cue's `{ ... }` literal
//      regardless of line breaks) and require the onset array to be NON-EMPTY, length-matched to
//      `targetTokens`, monotonic (non-decreasing, matching the generator's own projection rule), and
//      in-window (every cue-local frame within [0, narrationFrames)).
// All three also now FAIL-CLOSED: a missing/unreadable/unparseable audio-gate.json, asr-alignment.json,
// or Clips.ts module reports an explicit `error`/`asrError` string and a non-zero exit — never the
// silent `{totalCues:0}` a genuinely-empty-but-valid report would show. That distinction (instrument
// broke vs input genuinely has 0 cues) was the false-green this measure used to produce.
//
// This script does NOT rely on `{{arg.lessonId}}` resolving (optimize.measure ops can predate arg
// persistence on older runs — see this node's sibling w2b-audio-captions/scripts/measure.mjs "Wiring"
// comment for the same lesson): it discovers every path it needs directly from this node's OWN
// recorded artifacts in `<run>/.pi/run.json`, which are always absolute + always current for the run
// being measured, regardless of when that run happened.
//
// Usage: node measure.mjs --check <audio-gate-pass-floor|audio-gate-truncation-floor|onset-coverage>
//                          --run <RUN> --out <reportPath>

import { promises as fs } from 'node:fs';
import path from 'node:path';

const NODE_ID = 'w3a-voice-asr';

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
  if (!p) return null;
  try {
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch {
    return null;
  }
}

async function readText(p) {
  if (!p) return null;
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

async function writeReport(outPath, report) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
}

/** Recover this node's own artifact paths from `<run>/.pi/run.json` — no `{{arg.*}}` token needed
 *  (robust across runs that predate arg-persistence). All four contract artifacts are absolute paths
 *  the driver already stat()'d, so the lessonId + every sibling file (asr-alignment.json lives beside
 *  audio-gate.json) fall out of them directly — never reconstructed from a camelCase guess. */
function discoverArtifacts(runJson) {
  const node = runJson?.nodes?.[NODE_ID];
  const artifacts = Array.isArray(node?.artifacts) ? node.artifacts : [];
  const find = (re) => {
    for (const a of artifacts) {
      if (a && typeof a.path === 'string' && re.test(a.path)) return a.path;
    }
    return null;
  };
  const clipsPath = find(/Clips\.ts$/);
  const wavPath = find(/-voice\.wav$/);
  const gatePath = find(/audio-gate\.json$/);

  let lessonId = null;
  let m = wavPath && /\/([^/]+)-voice\.wav$/.exec(wavPath);
  if (m) lessonId = m[1];
  if (!lessonId) {
    m = gatePath && /\/out\/([^/]+)\/audio-gate\.json$/.exec(gatePath);
    if (m) lessonId = m[1];
  }
  return { clipsPath, wavPath, gatePath, lessonId };
}

// ── object-scoped Clips.ts cue parsing (survives pretty-printing) ──────────────────────────────────

/** Extract every top-level `{ ... }` object literal from the exported `<prefix>Clips: ClipCue[] = [
 *  ... ]` array body, via a string-aware brace-depth scan — correct regardless of whether the
 *  generator emits one cue per line (today's format) or a future pretty-printed multi-line form. */
function extractCueObjects(src) {
  const marker = 'Clips: ClipCue[] = [';
  const markerAt = src.indexOf(marker);
  if (markerAt < 0) return [];
  const bodyStart = markerAt + marker.length - 1; // index of the '['
  const objs = [];
  let depth = 0;
  let inStr = null;
  let objStart = -1;
  for (let i = bodyStart; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') { i += 1; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') {
      if (depth === 0) objStart = i;
      depth += 1;
    } else if (c === '}') {
      depth -= 1;
      if (depth === 0 && objStart >= 0) {
        objs.push(src.slice(objStart, i + 1));
        objStart = -1;
      }
    } else if (c === ']' && depth === 0) {
      break; // end of the array body
    }
  }
  return objs;
}

function field(objSrc, name) {
  const m = new RegExp(`\\b${name}\\b\\s*:\\s*"([^"]*)"`).exec(objSrc);
  return m ? m[1] : null;
}

function numField(objSrc, name) {
  const m = new RegExp(`\\b${name}\\b\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`).exec(objSrc);
  return m ? Number(m[1]) : null;
}

/** `{present:false}` when the field is absent; `{present:true, value}` parsed; `{present:true,
 *  malformed:true}` when the field exists but its bracket contents don't parse as JSON — a distinct,
 *  reportable state from "absent", never silently coerced to either. */
function arrField(objSrc, name) {
  const m = new RegExp(`\\b${name}\\b\\s*:\\s*(\\[[^\\]]*\\])`).exec(objSrc);
  if (!m) return { present: false };
  try {
    return { present: true, value: JSON.parse(m[1]) };
  } catch {
    return { present: true, malformed: true, value: null };
  }
}

/** The VALIDITY rule the adversarial pass demanded: a cue only "carries onset-sync data" when
 *  `tokenOnsets` is present AND non-empty AND length-matched to `targetTokens` AND monotonic
 *  (non-decreasing — the generator's own `projectCueTokenOnsets` explicitly allows repeats, never
 *  strictly-increasing) AND every value falls in [0, narrationFrames). A `tokenOnsets: []` (the named
 *  evasion) fails at the non-empty check; any other field-presence-only reading previously passed it. */
function validateOnsets(objSrc) {
  const onsetsField = arrField(objSrc, 'tokenOnsets');
  if (!onsetsField.present) return { hasOnsetsField: false };

  const reasons = [];
  if (onsetsField.malformed || !Array.isArray(onsetsField.value)) {
    reasons.push('tokenOnsets present but not a parseable array');
    return { hasOnsetsField: true, valid: false, reasons };
  }
  const onsets = onsetsField.value;

  if (onsets.length === 0) {
    reasons.push('tokenOnsets is an EMPTY array — present but vacuous (the exact gamed evasion: field presence with no real data)');
  }

  const targetTokensField = arrField(objSrc, 'targetTokens');
  if (!targetTokensField.present || !Array.isArray(targetTokensField.value)) {
    reasons.push('targetTokens missing or unparseable (cannot verify onset/token length pairing)');
  } else if (onsets.length !== targetTokensField.value.length) {
    reasons.push(
      `tokenOnsets.length(${onsets.length}) != targetTokens.length(${targetTokensField.value.length})`,
    );
  }

  for (let i = 1; i < onsets.length; i++) {
    if (typeof onsets[i] !== 'number' || typeof onsets[i - 1] !== 'number' || onsets[i] < onsets[i - 1]) {
      reasons.push(`non-monotonic onset at index ${i} (${onsets[i - 1]} -> ${onsets[i]})`);
      break;
    }
  }

  const narrationFrames = numField(objSrc, 'narrationFrames');
  if (narrationFrames == null) {
    reasons.push('narrationFrames unreadable on this cue (cannot verify onsets are in-window)');
  } else {
    for (let i = 0; i < onsets.length; i++) {
      const v = onsets[i];
      if (typeof v !== 'number' || !(v >= 0 && v < narrationFrames)) {
        reasons.push(`onset[${i}]=${v} out of window [0,${narrationFrames})`);
        break;
      }
    }
  }

  return { hasOnsetsField: true, valid: reasons.length === 0, reasons };
}

// ── the three checks ────────────────────────────────────────────────────────────────────────────

async function checkAudioGatePassFloor(gatePath) {
  const report = { check: 'audio-gate-pass-floor' };
  if (!gatePath) {
    report.error = 'audio-gate.json not discoverable from this run\'s recorded artifacts';
    return { report, hardFail: true };
  }
  const raw = await readText(gatePath);
  report.path = gatePath;
  if (raw == null) {
    report.error = `audio-gate.json missing or unreadable at ${gatePath}`;
    return { report, hardFail: true };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    report.error = `audio-gate.json does not parse: ${e.message}`;
    return { report, hardFail: true };
  }
  report.topLevelPass = parsed.pass;
  report.droneFails = typeof parsed.droneFails === 'number' ? parsed.droneFails : null;
  report.emptyClipFails = typeof parsed.emptyClipFails === 'number' ? parsed.emptyClipFails : null;
  report.deadAirWarns = typeof parsed.deadAirWarns === 'number' ? parsed.deadAirWarns : null;
  const ok = parsed.pass === true; // the exact top-level boolean — never a substring scan
  report.passFloorOk = ok;
  report.passFloorNumeric = ok ? 1 : 0;
  if (!ok) report.error = `top-level "pass" is ${JSON.stringify(parsed.pass)}, not true`;
  return { report, hardFail: !ok };
}

async function checkAudioGateTruncationFloor(gatePath) {
  const report = { check: 'audio-gate-truncation-never-blocks-silently' };
  if (!gatePath) {
    report.error = 'audio-gate.json not discoverable from this run\'s recorded artifacts';
    return { report, hardFail: true };
  }
  const raw = await readText(gatePath);
  report.path = gatePath;
  if (raw == null) {
    report.error = `audio-gate.json missing or unreadable at ${gatePath}`;
    return { report, hardFail: true };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    report.error = `audio-gate.json does not parse: ${e.message}`;
    return { report, hardFail: true };
  }
  report.topLevelTruncationFails = parsed.truncationFails;
  report.topLevelTruncationAdvisories = parsed.truncationAdvisories;
  const ok = parsed.truncationFails === 0; // top-level field only — never a substring scan
  report.truncationFloorOk = ok;
  report.truncationFloorNumeric = ok ? 1 : 0;
  if (!ok) report.error = `top-level "truncationFails" is ${JSON.stringify(parsed.truncationFails)}, expected 0`;
  return { report, hardFail: !ok };
}

async function checkOnsetCoverage(clipsPath, gatePath) {
  const report = { check: 'onset-augmentation-coverage' };
  if (!clipsPath) {
    report.error = 'Clips.ts not discoverable from this run\'s recorded artifacts';
    return { report, hardFail: true };
  }
  report.clipsPath = clipsPath;
  let clipsSrc;
  try {
    clipsSrc = await fs.readFile(clipsPath, 'utf8');
  } catch (e) {
    report.error = `clips module unreadable at ${clipsPath}: ${e.message}`;
    return { report, hardFail: true };
  }

  if (!gatePath) {
    report.asrError = 'asr-alignment.json path not derivable (no audio-gate.json artifact recorded for this run)';
    report.error = report.asrError;
    return { report, hardFail: true };
  }
  const asrPath = path.join(path.dirname(gatePath), 'asr-alignment.json');
  report.asrPath = asrPath;
  let asrRaw;
  try {
    asrRaw = await fs.readFile(asrPath, 'utf8');
  } catch (e) {
    // FAIL-CLOSED, distinct from "genuinely 0 cues": an unreadable/absent instrument input is an
    // error, never a vacuous {totalCues:0} — the false-green the adversarial pass proved.
    report.asrError = `asr-alignment.json missing or unreadable at ${asrPath}: ${e.message}`;
    report.error = report.asrError;
    return { report, hardFail: true };
  }
  let asr;
  try {
    asr = JSON.parse(asrRaw);
  } catch (e) {
    report.asrError = `asr-alignment.json does not parse: ${e.message}`;
    report.error = report.asrError;
    return { report, hardFail: true };
  }
  const cues = Array.isArray(asr?.cues) ? asr.cues : null;
  if (!cues) {
    report.asrError = 'asr-alignment.json has no `cues` array';
    report.error = report.asrError;
    return { report, hardFail: true };
  }

  const cueObjs = extractCueObjects(clipsSrc);
  const byId = new Map();
  for (const o of cueObjs) {
    const id = field(o, 'id');
    if (id) byId.set(id, o);
  }

  const cueIds = cues.map((c) => c?.id).filter((id) => typeof id === 'string');
  let withOnsets = 0;
  const cueIdsWithOnsets = [];
  const malformedOnsets = [];
  const missingFromClipsModule = [];

  for (const id of cueIds) {
    const objSrc = byId.get(id);
    if (!objSrc) {
      missingFromClipsModule.push(id);
      continue;
    }
    const v = validateOnsets(objSrc);
    if (!v.hasOnsetsField) continue; // legitimately no onsets field — R4's soft judgment, not this hard check
    if (v.valid) {
      withOnsets += 1;
      cueIdsWithOnsets.push(id);
    } else {
      malformedOnsets.push({ id, reasons: v.reasons });
    }
  }

  // This stays a GRADED COUNT for raw coverage (memory.md's documented design: not every cue needs
  // onsets, so a low count alone never hard-fails — that judgment is criteria.md R4's, which can read
  // the storyboard's teaching actions). What DOES hard-fail is VALIDITY: a tokenOnsets field that is
  // present but objectively broken (empty / length-mismatched / non-monotonic / out-of-window) is a
  // mechanical defect regardless of whether the cue needed onsets in the first place.
  report.totalCues = cueIds.length;
  report.cuesWithOnsets = withOnsets;
  report.cueIdsWithOnsets = cueIdsWithOnsets;
  report.malformedOnsets = malformedOnsets;
  report.missingFromClipsModule = missingFromClipsModule;

  const hardFail = malformedOnsets.length > 0;
  if (hardFail) {
    report.error = `${malformedOnsets.length} cue(s) carry a MALFORMED tokenOnsets (${malformedOnsets
      .map((m) => m.id)
      .join(', ')}) — see malformedOnsets[].reasons`;
  }
  return { report, hardFail };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const check = args.check;
  const runDir = args.run;
  const outPath = args.out;
  if (!check || !runDir || !outPath) {
    console.error('measure.mjs: --check, --run, and --out are required');
    return; // measurement-infra wiring issue, not an artifact defect — degrade, never crash the substrate
  }

  const runJson = await readJson(path.join(runDir, '.pi', 'run.json'));
  const { clipsPath, gatePath, lessonId } = discoverArtifacts(runJson);

  let result;
  if (check === 'audio-gate-pass-floor') result = await checkAudioGatePassFloor(gatePath);
  else if (check === 'audio-gate-truncation-floor') result = await checkAudioGateTruncationFloor(gatePath);
  else if (check === 'onset-coverage') result = await checkOnsetCoverage(clipsPath, gatePath);
  else {
    console.error(`measure.mjs: unknown --check '${check}'`);
    return;
  }

  result.report.node = NODE_ID;
  result.report.lessonId = lessonId;
  result.report.generatedAt = new Date().toISOString();
  await writeReport(outPath, result.report);
  console.error(
    `w3a measure[${check}]: ${result.hardFail ? `FAIL — ${result.report.error || 'see report'}` : 'pass'}`,
  );
  if (result.hardFail) process.exitCode = 1;
}

main().catch((e) => {
  // An uncaught exception mid-measurement means this check genuinely could NOT evaluate its input —
  // fail-closed, never silent (distinct from the wiring-args-missing early return above, which is an
  // infra-level skip, not an artifact-defect signal).
  console.error(`measure.mjs: unexpected failure — ${e?.message || e}`);
  process.exitCode = 1;
});
