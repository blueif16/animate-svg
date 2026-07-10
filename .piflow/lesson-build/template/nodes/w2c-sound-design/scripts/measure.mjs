#!/usr/bin/env node
// w2c-sound-design optimize.measure wrapper (piflow-overlord "building-measures.md" Part D — the thin op[]
// wrapper for the node-specific deterministic invariants a JSON schema can't express, mirroring the sibling
// w2b-audio-captions/scripts/measure.mjs convention). Read by the out-of-band optimize substrate ONLY
// (`runSubstrateMeasure` fires this as a `run` op); it never touches the live node run and never blocks
// anything on its own. Best-effort throughout: a missing file, an unresolvable lessonId, or a malformed
// input degrades to a `skipped` note + a `null` (never a `0`/`true`) sentinel on the affected metric — never
// a thrown error and never a silent false-pass. The run op's own exit code stays 0 (this is a substrate
// measure, not a live gate); the fail-closed contract lives in the WRITTEN REPORT's sentinel values, which is
// exactly the discipline this fixes: `criteria.md`'s three CHECK_KINDS-can't-express invariants were
// documented but unwired (registry-membership, the ≤1-per-cue/≤1-ta-da density ceilings, and the concurrent-
// audio-tag budget) — this script wires all three so a shape breach surfaces as a QUOTABLE hard axis
// (this file's own console.error summary + the numeric leaves folded into `graded`), not a generic `failed`
// digest-anomaly.
//
// What this checks (each a cross-file / cross-registry invariant a static JSON-Schema cannot express):
//   registryViolationCount   — every `bed`/`intro.sting`/`sfx[].sound` value must be a byte-identical member
//                              of the shared library's `_beds`/`_stings`/`_sfx` `_index.json` (criteria.md C5).
//                              An invented key silently fails to play with no error at render time.
//   densityMultiSfxCueCount  — ≤1 `sfx` row per `cue` (criteria.md C3's density-discipline floor).
//   tadaOverBudgetCount      — `ta-da` used at most ONCE across the whole file (criteria.md C2's Required
//                              count rule — the reward beat must stay singular).
//   concurrentBudgetBreach   — the ALREADY-EXISTING `assertConcurrentAudioBudget()` / `MAX_CONCURRENT_AUDIO`
//                              from `remotion-svg-primitives/src/lesson-media/LessonSfxLayer.tsx`
//                              ([[sound-design-sfx]] OKF slice), invoked directly — HARD reuse, never a
//                              reimplementation. `audio-cues.json`'s `sfx[]` rows carry a `cue` id, not a
//                              frame — real `fromFrame`s are only assigned downstream (w3-5-reconcile →
//                              w4a-composer), so this node cannot know true collision timing. The SOUND,
//                              CONSERVATIVE check available HERE is the worst case the function itself
//                              already treats as safe below its own fast path (`events.length <= max` ⇒
//                              return with no computation, `LessonSfxLayer.tsx:53`): map every declared row
//                              to the SAME instant (`fromFrame: 0`) and call the real function. A lesson
//                              within budget passes regardless of true timing (no false positive); a lesson
//                              that declares more one-shot SFX than the browser can EVER play at once — the
//                              genuine structural breach — throws here, before it ever reaches the composer.
//
// Usage: node measure.mjs --run <RUN> --workspace <WORKSPACE> --out <reportPath> [--lessonId <id>]
// (`--lessonId` is a TEST/override hook; production discovers it from `<RUN>/.pi/run.json`'s recorded
// artifact paths — an `optimize.measure` op has no `{{arg.*}}` token some historical runs never persisted
// anyway, per this node's criteria.md "Wiring + readiness". Robust across old runs by construction.)
// Invoked via `tsx` (not plain `node`) so the `assertConcurrentAudioBudget` import below can load the
// product's `.tsx` source directly — the registry/density checks are plain JSON logic and run identically
// under either runtime.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const NODE_ID = 'w2c-sound-design';

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

/** Recover the run's lessonId from `.pi/run.json`'s recorded artifact paths for THIS node — no `{{arg.*}}`
 *  token is available inside an `optimize.measure` op (see ResolveCtx in workflow/resolver.ts), but every
 *  artifact path the runner already stat()'d literally embeds `lesson-data/<lessonId>/audio-cues.json`. */
function discoverLessonId(runJson) {
  const node = runJson?.nodes?.[NODE_ID];
  for (const a of node?.artifacts ?? []) {
    const m = /lesson-data\/([^/]+)\/audio-cues\.json$/.exec(a?.path || '');
    if (m) return m[1];
  }
  return null;
}

/** Registry-membership (criteria.md C5). Reads the shared library's three `_index.json` files under
 *  `<workspace>/../shared-sound/public/audio/`. Any registry file missing/unparseable degrades the WHOLE
 *  check to `skipped` (fail-closed — we cannot vouch for membership without the registry). */
async function checkRegistryMembership(workspace, cues) {
  const audioDir = path.resolve(workspace, '..', 'shared-sound', 'public', 'audio');
  const [beds, stings, sfx] = await Promise.all([
    readJson(path.join(audioDir, '_beds', '_index.json')),
    readJson(path.join(audioDir, '_stings', '_index.json')),
    readJson(path.join(audioDir, '_sfx', '_index.json')),
  ]);
  if (!Array.isArray(beds) || !Array.isArray(stings) || !Array.isArray(sfx)) {
    return { violationCount: null, violations: [], skipped: `shared-sound registry unreadable under ${audioDir}` };
  }
  const bedSet = new Set(beds.map((x) => x?.name));
  const stingSet = new Set(stings.map((x) => x?.name));
  const sfxSet = new Set(sfx.map((x) => x?.name));
  const violations = [];
  if (typeof cues.bed === 'string' && !bedSet.has(cues.bed)) violations.push(`bed="${cues.bed}" not in _beds`);
  const sting = cues.intro?.sting;
  if (typeof sting === 'string' && !stingSet.has(sting)) violations.push(`intro.sting="${sting}" not in _stings`);
  for (const [i, row] of (Array.isArray(cues.sfx) ? cues.sfx : []).entries()) {
    if (typeof row?.sound === 'string' && !sfxSet.has(row.sound)) {
      violations.push(`sfx[${i}].sound="${row.sound}" not in _sfx`);
    }
  }
  return { violationCount: violations.length, violations, skipped: null };
}

/** Density ceilings (criteria.md C2/C3): ≤1 `sfx` row per `cue`; `ta-da` used ≤1 time in the whole file. */
function checkDensity(cues) {
  const rows = Array.isArray(cues.sfx) ? cues.sfx : [];
  const byCue = new Map();
  for (const row of rows) {
    const cue = typeof row?.cue === 'string' ? row.cue : '(missing cue)';
    byCue.set(cue, (byCue.get(cue) || 0) + 1);
  }
  const multiSfxCues = [...byCue.entries()].filter(([, n]) => n > 1).map(([cue, n]) => `${cue}×${n}`);
  const tadaCount = rows.filter((r) => r?.sound === 'ta-da').length;
  return {
    multiSfxCueCount: multiSfxCues.length,
    multiSfxCues,
    tadaCount,
    tadaOverBudget: tadaCount > 1 ? 1 : 0,
  };
}

/** The concurrent-audio-tag budget — HARD reuse of the shipped `assertConcurrentAudioBudget()` (see the
 *  header comment for the worst-case-collision rationale). Dynamic-imports the product `.tsx` source
 *  directly (never reimplemented); any import failure degrades to `skipped` (fail-closed — we do not
 *  assume the schedule is safe when we could not even load the real checker). */
async function checkConcurrentBudget(workspace, cues) {
  const modPath = path.join(workspace, 'remotion-svg-primitives', 'src', 'lesson-media', 'LessonSfxLayer.tsx');
  let mod;
  try {
    mod = await import(pathToFileURL(modPath).href);
  } catch (e) {
    return { breach: null, error: null, skipped: `could not import LessonSfxLayer.tsx: ${e?.message || e}` };
  }
  if (typeof mod.assertConcurrentAudioBudget !== 'function') {
    return { breach: null, error: null, skipped: 'assertConcurrentAudioBudget export not found on LessonSfxLayer.tsx' };
  }
  const rows = Array.isArray(cues.sfx) ? cues.sfx : [];
  // Worst-case collision probe: every declared row at the SAME instant (fromFrame:0) — see header comment.
  const events = rows.map((r) => ({ ...r, fromFrame: 0 }));
  try {
    mod.assertConcurrentAudioBudget(events);
    return { breach: 0, error: null, skipped: null, max: mod.MAX_CONCURRENT_AUDIO ?? null, n: events.length };
  } catch (e) {
    return { breach: 1, error: e?.message || String(e), skipped: null, max: mod.MAX_CONCURRENT_AUDIO ?? null, n: events.length };
  }
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
    return; // best-effort: exit 0, no report — the substrate degrades gracefully on a missing report.
  }

  // Fail-CLOSED defaults throughout: `null` (never `0`/`true`) means "not measured", distinct from a
  // measured `0` ("measured, zero violations"). A numeric consumer (the substrate's `graded` fold) must
  // never mistake "we couldn't check" for "it passed".
  const report = {
    node: NODE_ID,
    generatedAt: new Date().toISOString(),
    lessonId: null,
    evaluated: 0,
    skipped: [],
    registryViolationCount: null,
    registryViolations: [],
    densityMultiSfxCueCount: null,
    densityMultiSfxCues: [],
    tadaCount: null,
    tadaOverBudget: null,
    concurrentBudgetBreach: null,
    concurrentBudgetError: null,
    concurrentBudgetChecked: null,
    concurrentBudgetMax: null,
  };

  let lessonId = args.lessonId || null;
  if (!lessonId) {
    const runJson = await readJson(path.join(runDir, '.pi', 'run.json'));
    lessonId = discoverLessonId(runJson);
  }
  report.lessonId = lessonId;
  if (!lessonId) {
    report.skipped.push('no lessonId discoverable (no --lessonId override and none found in .pi/run.json)');
    console.error('w2c hard-checks: SKIPPED — no lessonId discoverable');
    await writeReport(outPath, report);
    return;
  }

  const cuesPath = path.join(workspace, 'remotion-svg-primitives', 'lesson-data', lessonId, 'audio-cues.json');
  const cues = await readJson(cuesPath);
  if (!cues || typeof cues !== 'object') {
    // Fail-CLOSED, not a vacuous pass: an absent/unparseable audio-cues.json means every downstream check
    // below is meaningless — leave all three at their `null`/"not measured" defaults, never a false `0`.
    report.skipped.push(`audio-cues.json missing or unparseable at ${cuesPath}`);
    console.error(`w2c hard-checks: SKIPPED — audio-cues.json missing/unparseable for lessonId=${lessonId}`);
    await writeReport(outPath, report);
    return;
  }
  report.evaluated = 1;

  const registry = await checkRegistryMembership(workspace, cues);
  report.registryViolationCount = registry.violationCount;
  report.registryViolations = registry.violations;
  if (registry.skipped) report.skipped.push(registry.skipped);

  const density = checkDensity(cues);
  report.densityMultiSfxCueCount = density.multiSfxCueCount;
  report.densityMultiSfxCues = density.multiSfxCues;
  report.tadaCount = density.tadaCount;
  report.tadaOverBudget = density.tadaOverBudget;

  const budget = await checkConcurrentBudget(workspace, cues);
  report.concurrentBudgetBreach = budget.breach;
  report.concurrentBudgetError = budget.error;
  report.concurrentBudgetChecked = budget.breach == null ? 0 : 1;
  report.concurrentBudgetMax = budget.max ?? null;
  if (budget.skipped) report.skipped.push(budget.skipped);

  const registrySummary = registry.skipped
    ? 'registry=SKIPPED'
    : `registry=${registry.violationCount === 0 ? 'ok' : `FAIL(${registry.violations[0]})`}`;
  const densitySummary =
    density.multiSfxCueCount === 0 && density.tadaOverBudget === 0
      ? 'density=ok'
      : `density=FAIL(${[
          density.multiSfxCueCount > 0 ? `${density.multiSfxCueCount} cue(s) >1 sfx e.g. ${density.multiSfxCues[0]}` : null,
          density.tadaOverBudget ? `ta-da×${density.tadaCount}` : null,
        ]
          .filter(Boolean)
          .join('; ')})`;
  const budgetSummary = budget.skipped
    ? 'budget=SKIPPED'
    : `budget=${budget.breach === 0 ? `ok(${budget.n}/${budget.max})` : `FAIL(${budget.error})`}`;
  console.error(`w2c hard-checks: lessonId=${lessonId} · ${registrySummary} · ${densitySummary} · ${budgetSummary}`);

  await writeReport(outPath, report);
}

main().catch((e) => {
  console.error(`measure.mjs: best-effort failure — ${e?.message || e}`);
  // never a non-zero exit: this is a substrate measure op, not a live gate.
});
