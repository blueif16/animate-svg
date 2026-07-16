#!/usr/bin/env node
// w3-5-reconcile optimize.measure GUARD (piflow-overlord "building-measures.md" Part D — the thin op[]
// wrapper for a node-specific gap a JSON schema/gate can't close on its own). Read by the out-of-band
// optimize substrate ONLY (`runSubstrateMeasure` fires this as a `run` op); it never touches the live node
// run and never blocks anything on its own.
//
// WHY THIS EXISTS (the exact hole an adversarial pass proved): every OTHER `optimize.measure` entry in this
// node's node.json keys its `path` on `{{state.camelLessonId}}`. The SDK's runtime token resolver
// (`workflow/resolver.ts` `resolveTokens`) THROWS `MissingChannelError` when a run's `.pi/state.json` lacks
// that key. `runSubstrateMeasure` (`packages/core/src/optimize/substrate/measure.ts`) catches that PER-OP —
// it never crashes the whole measure report — but the net effect is that every one of those 13 checks lands
// in `ops.rejected` and NOT ONE of them actually fires. That is a silent-in-practice floor: the report still
// gets written, but it carries zero evidence about the artifact whenever state.json is empty. This is a REAL
// condition in THIS repo (not hypothetical) — confirmed by direct inspection, `.pi/state.json` is literally
// `{}` in `.piflow/lesson-build/runs/{count-to-two-001,dryrun-kp4,e10-dryrun,e10e11-accept-1,
// kp3-tens-and-ones-place-r1,kp3-tens-and-ones-place-r2,kp3-tens-and-ones-place-r3,prognode-validate,
// prognode-validate2,prognode-validate3,salted-zelnik}`.
//
// THE GUARD: this op is wired with ONLY `{{RUN}}`/`{{WORKSPACE}}` in its args — tokens `resolveTokens` NEVER
// throws for (only `{{state.*}}`/`{{arg.*}}` can throw) — so this op is never rejected. It derives the
// concrete `<Camel>LessonTimeline.ts` path itself, IN-SCRIPT, from `<RUN>/.pi/run.json`'s OWN already-resolved
// `nodes['w3-5-reconcile'].artifacts[].path` (the physical path the SDK computed successfully at real
// node-launch time — a fact recorded regardless of whether `state.json` still resolves later), falling back
// to `state.json`'s `camelLessonId` when run.json's own artifact entry is itself empty (a `reused` node with
// no recorded artifacts). This mirrors the SAME `discoverLessonId`-off-run.json move
// `w2b-audio-captions/scripts/measure.mjs` already uses for the identical class of gap (that script's own
// header cites the same `optimize.measure` ResolveCtx limitation).
//
// Once resolved, it RE-RUNS the same 13 mirrored invariants node.json's `optimize.measure` array declares
// (12 regex checks + the non-empty check; identical broadened patterns — keep the two lists in sync by hand
// if either changes), so the hard floor still FIRES even when every token-keyed check above it was rejected.
//
// FAIL-CLOSED CONTRACT (never a silent pass): exits 1 (`ops.runs[].failed:true`) when the artifact resolves
// but ANY re-checked invariant fails, or when a path was resolved but the file is missing on disk. Writes an
// explicit `resolved:false` (never a bare/implicit pass) when NEITHER run.json nor state.json yields a path —
// triage sees a recorded skip, never invented evidence. Never THROWS (best-effort throughout, per Part D) —
// a bug in this script degrades to a written report + exit 1, not an unhandled crash that could wedge the
// substrate stage.
//
// Usage: node measure.mjs --run <RUN> --workspace <WORKSPACE> --out <reportPath>

import { promises as fs } from 'node:fs';
import path from 'node:path';

const NODE_ID = 'w3-5-reconcile';

// The SAME 12 invariants node.json's `optimize.measure` declares via `{{state.camelLessonId}}`-keyed gates —
// kept textually parallel so a future edit to one is easy to mirror to the other. `absent:true` means the
// check PASSES when the pattern is ABSENT (mirrors a `regex-absent` gate); otherwise it PASSES when PRESENT.
const CHECKS = [
  { id: 'reconcile-call-present', re: /reconcileClipTimeline\s*\(/, absent: false },
  { id: 'cue-accessors-call-present', re: /makeCueAccessors\s*\(/, absent: false },
  { id: 'no-legacy-timing-mechanisms', re: /PADDED_CUE_DURATIONS_FRAMES|detectSilenc|Silences|ASR_CORRECTIONS/, absent: true },
  // broadened (adversarial-pass finding): the node.json gate this mirrors used to read `\?\?\s*0` — evadable
  // by `?? -1` / `?? 0.0`. `-?\d` catches any signed numeric literal right after `??`, anywhere in the file.
  { id: 'no-silent-cue-fallback', re: /\?\?\s*-?\d/, absent: true },
  // broadened (adversarial-pass finding): the node.json gate this mirrors used to read
  // `Record<string,\s*number>` — evadable by extra whitespace (`Record< string , number >`) or by the
  // equivalent TS index-signature shape `{[k: string]: number}`, which erases the cue-id keys identically but
  // never spells `Record<`.
  { id: 'motion-budget-not-index-signature', re: /Record\s*<\s*string\s*,\s*number\s*>|\{\s*\[\s*[A-Za-z_$][\w$]*\s*:\s*string\s*\]\s*:\s*number\s*\}/, absent: true },
  { id: 'motion-budget-as-const', re: /\}\s*as const/, absent: false },
  { id: 'frozen-clip-crosscheck-present', re: /FROZEN_CLIP_IDS/, absent: false },
  { id: 'export-cues-present', re: /export const \w+Cues\b/, absent: false },
  { id: 'export-duration-present', re: /export const \w+Duration\b/, absent: false },
  { id: 'export-voiceclips-present', re: /export const \w+VoiceClips\b/, absent: false },
  { id: 'export-captioncues-present', re: /export const \w+LessonCaptionCues\b/, absent: false },
  { id: 'export-cueaccessors-present', re: /export const \w+CueAccessors\b/, absent: false },
];

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

/** PRIMARY resolution: this node's OWN artifact list in `.pi/run.json`, already an absolute, fully-resolved
 *  path recorded at real node-launch time — immune to a measure-time-only state.json regression. */
function artifactPathFromRunJson(runJson) {
  const node = runJson?.nodes?.[NODE_ID];
  const entry = (node?.artifacts ?? []).find(
    (a) => typeof a?.path === 'string' && /LessonTimeline\.ts$/.test(a.path),
  );
  return entry?.path ?? null;
}

/** FALLBACK resolution: this run's OWN `state.json` — covers a `reused` node whose run.json artifact entry
 *  is itself empty (e.g. `prognode-validate2`/`prognode-validate3` in this repo: `status:"reused"`,
 *  `artifacts:[]`), but the run's state channel still carries a real `camelLessonId`. */
function artifactPathFromState(state, workspace) {
  if (state && typeof state.camelLessonId === 'string' && state.camelLessonId && workspace) {
    return path.join(workspace, 'remotion-svg-primitives', 'src', 'lessons', `${state.camelLessonId}LessonTimeline.ts`);
  }
  return null;
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
    return 0; // best-effort: no report — the substrate degrades gracefully on a missing/malformed op wiring.
  }

  const report = {
    node: NODE_ID,
    generatedAt: new Date().toISOString(),
    resolved: false,
    resolvedVia: null,
    artifactPath: null,
    pass: false,
    checksTotal: CHECKS.length + 1, // + the non-empty check, pushed explicitly below either way
    checksFailed: 0,
    checks: [],
    skipped: [],
  };

  const runJson = await readJson(path.join(runDir, '.pi', 'run.json'));
  const state = await readJson(path.join(runDir, '.pi', 'state.json'));

  let artifactPath = artifactPathFromRunJson(runJson);
  let resolvedVia = artifactPath ? 'run.json' : null;
  if (!artifactPath) {
    artifactPath = artifactPathFromState(state, workspace);
    resolvedVia = artifactPath ? 'state.json' : null;
  }

  if (!artifactPath) {
    // FAIL-CLOSED, not a silent pass: neither source yielded a path. Record the honest skip and stop —
    // never assert `pass:true` for input we never actually read. Exit 0 (config-with-defaults; this run
    // genuinely never produced this node's artifact, e.g. a dry/prognode-validation pass with empty
    // artifacts[] AND an empty state.json — nothing to re-check, not a defect of a real execution).
    report.skipped.push(
      'could not resolve the LessonTimeline.ts path from either .pi/run.json\'s recorded artifacts ' +
        'or .pi/state.json\'s camelLessonId — camelLessonId was never promoted for this run (or the node ' +
        'never ran). Treat as UNMEASURED, never as a pass.',
    );
    await writeReport(outPath, report);
    return 0;
  }

  report.resolved = true;
  report.resolvedVia = resolvedVia;
  report.artifactPath = artifactPath;

  const src = await readText(artifactPath);
  if (src == null) {
    // A path was resolved but the file isn't actually there — a real, reportable gap (a `blocked` verdict
    // should already have caught this at the run level, but the measure pass must not stay silent either).
    report.skipped.push(`resolved artifact path does not exist on disk: ${artifactPath}`);
    await writeReport(outPath, report);
    return 1;
  }

  const nonEmpty = src.trim().length > 0;
  if (!nonEmpty) report.checksFailed += 1;
  report.checks.push({ id: 'timeline-non-empty', pass: nonEmpty, hit: nonEmpty });

  for (const c of CHECKS) {
    const hit = c.re.test(src);
    const pass = c.absent ? !hit : hit;
    if (!pass) report.checksFailed += 1;
    report.checks.push({ id: c.id, pass, hit });
  }

  report.pass = report.checksFailed === 0;

  console.error(
    `w3-5-reconcile artifact-guard: resolved via ${resolvedVia} · ${artifactPath} · ` +
      `${report.checksTotal - report.checksFailed}/${report.checksTotal} checks passed`,
  );

  await writeReport(outPath, report);
  return report.pass ? 0 : 1;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    // Never an unhandled crash — a bug in THIS script degrades to a loud stderr line + a non-zero exit,
    // never a wedged substrate stage and never a silently-missing report.
    console.error(`measure.mjs: best-effort failure — ${e?.message || e}`);
    process.exit(1);
  });
