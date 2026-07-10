#!/usr/bin/env node
// setup-scaffold optimize.measure wrapper (piflow-overlord "building-measures.md" Part D — the thin op[]
// wrapper for the node-specific deterministic invariants a JSON schema/CHECK_KINDS regex can't express).
// Read by the out-of-band optimize substrate ONLY (`runSubstrateMeasure` fires this as a `run` op); it
// never touches the live node run and never blocks anything on its own. Best-effort throughout: a missing
// file or an unresolvable lessonId degrades to a `skipped` note, never a thrown error — the run op's own
// exit code stays 0 so a measure-script bug can never wedge the substrate stage (mirrors the sibling
// w2b-audio-captions/scripts/measure.mjs convention exactly).
//
// CLOSES two proven adversarial holes in this node's runway (see criteria.md + memory.md):
//
// (1) TRACE LIVENESS, paired with the sibling `regex-absent` gates in node.json. Those gates can only
//     assert "pattern X is absent from file Y" — if Y doesn't exist (or is empty), `regex-absent` tests an
//     empty string and VACUOUSLY PASSES (a missing/truncated trace reads as "clean"). This script's
//     `traceFound`/`traceTruncated` fields are the POSITIVE liveness assertion the runway law demands: an
//     explicit, non-vacuous 0 when the node's own trace cannot be found or is corrupt, so triage never reads
//     a sibling gate's silent "absent ⇒ pass" as a real clean bill. Checked across BOTH layouts this SDK has
//     used for a node's event trace: the CURRENT `.pi/nodes/<id>/events.jsonl`, and the LEGACY flat
//     `_pi/<id>.events.jsonl` (pre-re-point convention — see `packages/core/test/observability.test.ts`'s own
//     "before the re-point" comment) — a run captured under either layout reports `traceFound:1`, never a
//     false "missing" just because this SDK's layout moved.
//
// (2) PIPELINE.JSON FIDELITY — criteria.md's C2 ("pipeline.json content matches THIS lesson") and C3 ("no
//     leftover template tokens"), promoted from soft-only to a HARD measure now that they can be evaluated
//     safely (see the lessonId note below). Deliberately checks PROMOTE FIDELITY (does what state.json says
//     got promoted match what pipeline.json itself declares?), NOT "is constPrefix the mechanically-correct
//     camelCase transform of lessonId" — a scan of every real lesson-data/*/pipeline.json in this repo shows
//     3 of 21 (`comparison-5-gt-3`→"comparisonLesson", `make-10-6-and-4`→"makeTenLesson",
//     `pinyin-four-tones`→"pinyinToneLesson") use a deliberately SIMPLIFIED constPrefix that is NOT a literal
//     transform of the full lessonId. A hard gate recomputing the "correct" transform would false-fail on
//     those three legitimate, pre-existing lessons — exactly the per-input-constant trap the anti-Goodhart
//     law warns against. Promote-fidelity (state vs. file, both already-written strings) has no such trap.
//
// WHY the lessonId is derived HERE from `<run>/.pi/run.json`'s recorded artifact paths, never from
// `{{arg.lessonId}}` in the op's own `path`/`args`: every run sampled in this product repo (old and new)
// carries no persisted `.pi/run.json` `args` block, so a `{{arg.lessonId}}` token is REJECTED (dropped from
// evaluation, recorded in the substrate's `ops.rejected[]`) for every one of them — never a crash post-fix,
// but never evaluated either. `run.json`'s per-node `artifacts[].path` is, by contrast, always written (the
// runner stats each declared artifact at verdict time) and needs no arg at all (see the sibling
// w2b-audio-captions/scripts/measure.mjs `discoverLessonId`, the exact same pattern, independently applied).
//
// Usage: node hard-checks.mjs --run <RUN> --workspace <WORKSPACE> --out <reportPath> [--lessonId <id>]
// (`--lessonId` is a TEST/override hook; production discovers it from `<RUN>/.pi/run.json`.)

import { promises as fs } from 'node:fs';
import path from 'node:path';

const NODE_ID = 'setup-scaffold';

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

async function readTextMaybe(p) {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

async function statMaybe(p) {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

/** Recover the run's lessonId from `.pi/run.json`'s recorded artifact paths for THIS node — no `{{arg.*}}`
 *  token is available inside an `optimize.measure` op for a run that predates arg-persistence (see header). */
function discoverLessonId(runJson) {
  const node = runJson?.nodes?.[NODE_ID];
  for (const a of node?.artifacts ?? []) {
    const m = /lesson-data\/([^/]+)\//.exec(a?.path || '');
    if (m) return m[1];
  }
  return null;
}

/** Every non-blank line of `text` must parse as JSON, or the trace is treated as TRUNCATED/corrupt — a
 *  truncated tail can hide the very evidence the sibling regex-absent gates look for, so this is a real
 *  failure signal, never a silent pass. */
function isWellFormedJsonl(text) {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  return lines.every((l) => {
    try {
      JSON.parse(l);
      return true;
    } catch {
      return false;
    }
  });
}

async function writeReport(outPath, report) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(report, null, 2));
  // Keep the LAST stdout line a single, terse summary — the substrate captures only the tail of stdout
  // (merge.ts: last 3 lines, 200 chars) into `ops.runs[].stdout`, so lead with the headline signal.
  console.log(
    `setup-scaffold hard-checks: allOk=${report.allChecksOk} trace=${report.traceFound ? report.traceLayout : 'MISSING'}` +
      ` truncated=${report.traceTruncated} lessonId=${report.lessonIdMatches} tokens=${report.noLeftoverTemplateTokens}` +
      ` constPrefix=${report.constPrefixPromoteFidelity} composition=${report.compositionPromoteFidelity}` +
      (report.skipped.length ? ` SKIPPED:${report.skipped.join(';')}` : ''),
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runDir = args.run;
  const outPath = args.out;
  if (!runDir || !outPath) {
    console.error('hard-checks.mjs: --run and --out are required');
    return; // best-effort: exit 0, no report — the substrate degrades gracefully on a missing report.
  }

  const report = {
    node: NODE_ID,
    generatedAt: new Date().toISOString(),
    lessonId: null,
    // ---- trace liveness (paired with node.json's sibling regex-absent gates) ----
    traceFound: 0,
    traceLayout: null, // '.pi' | '_pi-flat' | '_pi-nested' | null
    traceTruncated: 0,
    // ---- pipeline.json fidelity (C2 promote-fidelity + C3 no-leftover-tokens) ----
    pipelineReadable: 0,
    lessonIdMatches: null, // 1|0|null — null only when pipelineReadable=0 (can't be checked at all)
    noLeftoverTemplateTokens: null,
    constPrefixPromoteFidelity: null, // 1|0|null — null when state.json never promoted this channel this run
    compositionPromoteFidelity: null,
    allChecksOk: 0,
    skipped: [],
  };

  // ---- (1) trace liveness — BOTH the current `.pi` layout and the legacy `_pi` layout(s). Runs
  // UNCONDITIONALLY, independent of lessonId discovery below: a run that never reached a terminal verdict
  // (status:"running", e.g. an interrupted/killed node — `run.json`'s own `artifacts:[]` stays empty forever)
  // still has a real, inspectable trace file on disk, and liveness must not silently give up on it just
  // because the OTHER (lessonId-dependent) checks can't run. LIVE-VERIFIED this session: an earlier draft
  // gated this whole block behind lessonId discovery and so reported a FALSE `traceFound:0` on real run
  // kp3-tens-and-ones-place-r1 (status:"running", artifacts:[] — the sandbox-write-permission-friction
  // lesson in memory.md) even though its 470KB events.jsonl genuinely exists and is readable.
  const traceCandidates = [
    { layout: '.pi', p: path.join(runDir, '.pi', 'nodes', NODE_ID, 'events.jsonl') },
    { layout: '_pi-flat', p: path.join(runDir, '_pi', `${NODE_ID}.events.jsonl`) }, // pre-re-point legacy shape
    { layout: '_pi-nested', p: path.join(runDir, '_pi', NODE_ID, 'events.jsonl') }, // defensive 3rd candidate
  ];
  let traceText = null;
  for (const c of traceCandidates) {
    const st = await statMaybe(c.p);
    if (st && st.size > 0) {
      traceText = await readTextMaybe(c.p);
      if (traceText != null) {
        report.traceFound = 1;
        report.traceLayout = c.layout;
        break;
      }
    }
  }
  if (!report.traceFound) {
    report.skipped.push(`node trace not found (or empty) under any known layout: ${traceCandidates.map((c) => c.p).join(' | ')}`);
  } else if (!isWellFormedJsonl(traceText)) {
    report.traceTruncated = 1;
    report.skipped.push(`trace at layout "${report.traceLayout}" has an unparseable JSONL line — truncated/corrupt trace`);
  }

  // ---- (2) pipeline.json fidelity — needs a derivable lessonId; degrades independently of (1) above ----
  let lessonId = args.lessonId || null;
  let runJson = null;
  if (!lessonId) {
    runJson = await readJson(path.join(runDir, '.pi', 'run.json'));
    lessonId = discoverLessonId(runJson);
  }
  report.lessonId = lessonId;
  if (!lessonId) {
    report.skipped.push('no lessonId discoverable (no --lessonId override and none found in .pi/run.json) — pipeline fidelity not applicable, trace liveness above is unaffected');
    await writeReport(outPath, report);
    return;
  }

  const pipelineArtifact = (runJson?.nodes?.[NODE_ID]?.artifacts ?? []).find(
    (a) => typeof a?.path === 'string' && a.path.endsWith('/pipeline.json'),
  );
  const pipelinePath =
    pipelineArtifact?.path ??
    (args.workspace ? path.join(args.workspace, 'remotion-svg-primitives', 'lesson-data', lessonId, 'pipeline.json') : null);

  if (!pipelinePath) {
    report.skipped.push('no recorded pipeline.json artifact in run.json and no --workspace fallback available');
  } else {
    const pipelineRaw = await readTextMaybe(pipelinePath);
    if (pipelineRaw == null) {
      report.skipped.push(`pipeline.json unreadable at ${pipelinePath}`);
    } else {
      report.pipelineReadable = 1;
      report.noLeftoverTemplateTokens = pipelineRaw.includes('{{') ? 0 : 1;

      const pipelineJson = await readJson(pipelinePath);
      if (!pipelineJson) {
        report.skipped.push(`pipeline.json at ${pipelinePath} is not valid JSON`);
      } else {
        report.lessonIdMatches = pipelineJson.lessonId === lessonId ? 1 : 0;

        const stateJson = (await readJson(path.join(runDir, '.pi', 'state.json'))) ?? {};
        if (typeof stateJson.camelLessonId === 'string') {
          report.constPrefixPromoteFidelity = stateJson.camelLessonId === pipelineJson?.voice?.constPrefix ? 1 : 0;
        } else {
          report.skipped.push('state.json has no camelLessonId channel this run — promote-fidelity not applicable (likely the separately schema-gated state-promote-fields-dropped defect)');
        }
        if (typeof stateJson.composition === 'string') {
          report.compositionPromoteFidelity = stateJson.composition === pipelineJson?.composition ? 1 : 0;
        } else {
          report.skipped.push('state.json has no composition channel this run — promote-fidelity not applicable');
        }
      }
    }
  }

  report.allChecksOk =
    report.traceFound === 1 &&
    report.traceTruncated === 0 &&
    report.pipelineReadable === 1 &&
    report.lessonIdMatches !== 0 &&
    report.noLeftoverTemplateTokens !== 0 &&
    report.constPrefixPromoteFidelity !== 0 &&
    report.compositionPromoteFidelity !== 0
      ? 1
      : 0;

  await writeReport(outPath, report);
}

main().catch((e) => {
  console.error(`hard-checks.mjs: best-effort failure — ${e?.message || e}`);
  // never a non-zero exit: this is a substrate measure op, not a live gate.
});
