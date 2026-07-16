#!/usr/bin/env node
// w4a-composer optimize.measure HARD FLOOR + anti-Goodhart GUARDS (piflow-overlord
// "building-measures.md" Part D — the thin op[] wrapper for node-specific deterministic invariants a
// JSON schema/gate can't close on its own). Read by the out-of-band optimize substrate ONLY
// (`runSubstrateMeasure` fires this as a `run` op); it never touches the live node run and never blocks
// anything on its own — this is the SUBSTRATE measure, parallel to (never part of) the run's own
// (blocking) `contract`/`checks.post`.
//
// WHY THIS SCRIPT EXISTS — three PROVEN holes from an adversarial pass, all closed here:
//
// 1. LESSONID DISCOVERY, never `{{arg.lessonId}}`. The old `optimize.measure` array keyed 3 of its 7
//    gates on `{{WORKSPACE}}/…/out/{{arg.lessonId}}/bbox-manifest.json`. `runSubstrateMeasure`'s
//    `{{arg.*}}` resolution reads ONLY the persisted `args` block off `<RUN>/.pi/run.json`
//    (`readRunArgs`) — a real, non-hypothetical condition in THIS repo: an OLDER run's run.json can be
//    argless (no `args.lessonId` ever persisted), which throws inside `resolveDeep` and REJECTS the op
//    (folds into `ops.rejected`, never a crash, but the check never fires — a silent-in-practice floor).
//    The other 4 gates keyed on `{{state.composition}}`/`{{state.camelLessonId}}` have the identical
//    failure mode whenever a run's `.pi/state.json` is `{}` — a REAL, confirmed condition across many
//    runs in this exact repo (see the sibling `w3-5-reconcile/scripts/measure.mjs`, which proved and
//    fixed the same class for its own node this session). This script resolves lessonId/camelLessonId/
//    every artifact path IN-SCRIPT from `<RUN>/.pi/run.json`'s own already-resolved
//    `nodes['w4a-composer'].artifacts[].path` (PRIMARY — immune to both gaps), falling back to
//    `.pi/state.json`'s `camelLessonId`/`composition` only when the run.json artifact list is itself
//    empty (a `reused` node with nothing re-recorded).
//
// 2. STALE-MANIFEST FALSE-GREEN (the sharpest hole). `scripts/lesson-measured.mjs`'s `main().catch`
//    swallows ANY crash to `process.exitCode = 0` WITHOUT ever reaching the "AUGMENT bbox-manifest.json"
//    write — so a render/extract crash leaves the PRIOR run's `bbox-manifest.json` sitting on disk,
//    already carrying `method:"getBBox"`, `measuredCollisionCount:0`, `captionIntrusionCount:0` from a
//    PAST success. The live node's POST `run` op is `onFailure:block`, but the *process* still exits 0,
//    so nothing blocks, and the 3 downstream regex checks (live + the old optimize.measure mirror) both
//    read the stale file and false-green. THE GUARD: a manifest counts as fresh only when
//    `measured.ranAt` falls at-or-after THIS run's OWN node window (`run.json`
//    `nodes['w4a-composer'].startedAt`) — never inferred from the numbers themselves. (The
//    `lesson-measured.mjs` exit-0-on-crash swallow is a PRODUCT defect, out of this node-dir's scope —
//    see this node's memory.md "Open threads" for the residual.)
//
// 3. VACUOUS GREEN from the composer's OWN exemption surface (the f1258 class documented in
//    criteria.md's red flags / gold section): `measuredCollisionCount`/`captionIntrusionCount` are
//    computed AFTER applying `manifest.ts`'s `allowedOverlaps` (id-pairs) and the canonical zone-pair
//    list — and an element whose scene `measureProps` id doesn't match its manifest-declared id falls
//    through to zone "decoration", silently exempting it from every collision/intrusion check. Neither
//    the live checks.post nor the old optimize.measure mirror ever read
//    `measured.gates.bboxBinding` (the bijection `lesson-measured.mjs` ALREADY computes) or the
//    exemption list itself — a 0-collision report was accepted at face value. THE GUARDS added here:
//    (a) `bboxBinding.pass` (measure-id ≡ manifest-id, BOTH directions) must hold — "every measureProps
//    id registered load-bearing"; (b) every `manifest.ts allowedOverlaps` id-pair must reference an id
//    that IS declared in that same manifest's `elements[]` — a phantom/typo'd exemption pair is dead
//    code that hints at drift, surfaced as a graded count so the judge (criteria.md's "Vacuous green"
//    red flag) has the exemption surface in view instead of nothing. This does NOT (and cannot, without
//    re-deriving the whole geometry pipeline — a new mechanism Part D warns against) prove a given
//    exemption is *unjustified*; that call stays the soft judge's, per criteria.md's gold/red-flag pair.
//
// FAIL-CLOSED CONTRACT (never a silent pass, per building-measures.md's "How"): a missing/unparseable
// bbox-manifest.json, a missing `measured.ranAt`, or a `ranAt` older than this run's own node window is a
// FAIL (`manifestFresh:0`), never an "unknown" that reads as clean. Genuinely nothing-to-check (node
// never ran; no artifacts AND no state) is an explicit `skipped[]` entry + exit 0 — a RECORDED skip, not
// an invented pass. Never THROWS — a bug here degrades to a written report + exit 1, never an unhandled
// crash that could wedge the substrate stage.
//
// Usage: node measure.mjs --run <RUN> --workspace <WORKSPACE> --out <reportPath>

import { promises as fs } from 'node:fs';
import path from 'node:path';

const NODE_ID = 'w4a-composer';

// ranAt is realistically MINUTES after the node's own startedAt in a genuine regenerate (the model runs
// first, the POST run op fires after) — this slack only absorbs incidental clock rounding, never a
// loophole for a truly stale file (see validityProof: a manifest hours/days old still fails cleanly).
const FRESHNESS_SLACK_MS = 5000;

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

function toCamel(kebab) {
  return kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

// Best-effort inverse of `toCamel`, used ONLY in the state.json fallback path (no raw kebab lessonId is
// ever promoted to state — see setup-scaffold/node.json, only camelLessonId/composition are). Safe for
// this product's all-lowercase kebab lessonIds (no consecutive-hyphen / upper-after-hyphen inputs exist).
function camelToKebab(camel) {
  return camel.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}

/** PRIMARY resolution: this node's OWN artifact list in `.pi/run.json` — already absolute, fully-resolved
 *  paths recorded at real node-launch time, immune to a measure-time-only `{{arg.*}}`/`{{state.*}}`
 *  rejection. */
function artifactsFromRunJson(runJson) {
  const node = runJson?.nodes?.[NODE_ID];
  return (node?.artifacts ?? []).map((a) => a?.path).filter((p) => typeof p === 'string' && p.length > 0);
}

function findPath(paths, re) {
  return paths.find((p) => re.test(p)) ?? null;
}

/** Scan `text` for `<key>: [ ... ]` and return the balanced bracket substring (handles nested `[...]`
 *  pairs, e.g. `allowedOverlaps: [["a","b"], ["c","d"]]`) — a lightweight text scan, not a TS parse, in
 *  the same best-effort spirit as the sibling nodes' markdown parsers. */
function extractBalancedArray(text, key) {
  const km = new RegExp(`\\b${key}\\s*:`).exec(text);
  if (!km) return null;
  const start = text.indexOf('[', km.index);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === '[') depth += 1;
    else if (text[i] === ']') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
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
    resolvedVia: null,
    lessonId: null,
    camelLessonId: null,
    bboxManifestPath: null,
    checks: [],
    checksFailed: 0,
    checksTotal: 0,
    skipped: [],
    // Fail-CLOSED graded leaves (piflow-overlord building-measures.md): `null` means "not verified this
    // run" and is dropped by the substrate's numeric fold — NEVER read as a pass. A concrete 0/1 only
    // appears once the corresponding invariant was actually evaluated.
    manifestRanAt: null,
    nodeStartedAt: null,
    manifestFresh: null,
    manifestStalenessMs: null,
    measuredMethodOk: null,
    measuredCollisionCount: null,
    captionIntrusionCount: null,
    bboxBindingOk: null,
    measuredNotInManifestCount: null,
    manifestNeverMeasuredCount: null,
    allowedOverlapsCount: null,
    allowedOverlapsPhantomCount: null,
  };

  const addCheck = (id, pass, detail) => {
    report.checks.push({ id, pass, detail });
    report.checksTotal += 1;
    if (!pass) report.checksFailed += 1;
  };

  const runJson = await readJson(path.join(runDir, '.pi', 'run.json'));
  const state = await readJson(path.join(runDir, '.pi', 'state.json'));
  const nodeEntry = runJson?.nodes?.[NODE_ID];
  const nodeStartedAt = typeof nodeEntry?.startedAt === 'string' ? nodeEntry.startedAt : null;
  report.nodeStartedAt = nodeStartedAt;

  const runArtifacts = artifactsFromRunJson(runJson);
  let bboxManifestPath = findPath(runArtifacts, /out\/[^/]+\/bbox-manifest\.json$/);
  let manifestTsPath = findPath(runArtifacts, /\/manifest\.ts$/);
  let layoutTsPath = findPath(runArtifacts, /\/layout\.ts$/);
  let sceneTsxPath = findPath(runArtifacts, /LessonScene\.tsx$/);
  let compositionTsxPath = runArtifacts.find((p) => p.endsWith('.tsx') && p !== sceneTsxPath) ?? null;

  let resolvedVia = bboxManifestPath ? 'run.json' : null;
  let lessonId = null;
  if (bboxManifestPath) {
    const m = /out\/([^/]+)\/bbox-manifest\.json$/.exec(bboxManifestPath);
    lessonId = m ? m[1] : null;
  }

  if (!bboxManifestPath) {
    // FALLBACK: `.pi/state.json` — covers a `reused` node whose run.json artifact entry is itself empty.
    const camel = state?.camelLessonId;
    if (typeof camel === 'string' && camel) {
      resolvedVia = 'state.json';
      lessonId = camelToKebab(camel);
      const lessonsDir = path.join(workspace, 'remotion-svg-primitives', 'src', 'lessons');
      manifestTsPath = manifestTsPath ?? path.join(lessonsDir, camel, 'manifest.ts');
      layoutTsPath = layoutTsPath ?? path.join(lessonsDir, camel, 'layout.ts');
      sceneTsxPath = sceneTsxPath ?? path.join(lessonsDir, `${camel}LessonScene.tsx`);
      if (!compositionTsxPath && typeof state?.composition === 'string' && state.composition) {
        compositionTsxPath = path.join(lessonsDir, `${state.composition}.tsx`);
      }
      bboxManifestPath = path.join(workspace, 'remotion-svg-primitives', 'out', lessonId, 'bbox-manifest.json');
    }
  }

  report.resolvedVia = resolvedVia;
  report.lessonId = lessonId;
  report.camelLessonId = lessonId ? toCamel(lessonId) : (typeof state?.camelLessonId === 'string' ? state.camelLessonId : null);
  report.bboxManifestPath = bboxManifestPath;

  if (!lessonId || !bboxManifestPath) {
    report.skipped.push(
      'could not resolve lessonId / bbox-manifest.json path from run.json\'s recorded artifacts or ' +
        'state.json\'s camelLessonId — the node likely never ran (or is a reused node with no recorded ' +
        'artifacts and an empty state channel). Treat as UNMEASURED, never as a pass.',
    );
    await writeReport(outPath, report);
    return 0;
  }

  // --- file-existence floor (replaces the 4 old {{state.*}}-token gates; robust to empty state.json) ---
  for (const [id, p] of [
    ['composition-tsx-non-empty', compositionTsxPath],
    ['scene-tsx-non-empty', sceneTsxPath],
    ['layout-non-empty', layoutTsPath],
    ['manifest-ts-non-empty', manifestTsPath],
  ]) {
    if (!p) {
      addCheck(id, false, 'path unresolved');
      continue;
    }
    const text = await readText(p);
    addCheck(id, !!(text && text.trim().length > 0), text == null ? `missing: ${p}` : `${text.length} bytes`);
  }

  // --- bbox-manifest.json: the hard floor + the anti-Goodhart guards ---
  const bboxJson = await readJson(bboxManifestPath);
  if (!bboxJson) {
    addCheck('bbox-manifest-parses', false, `missing/unparseable: ${bboxManifestPath}`);
    report.manifestFresh = 0; // FAIL-CLOSED: no manifest at all is a fail, never "unknown"/pass.
    console.error(`w4a-composer measure: FAIL — no bbox-manifest.json at ${bboxManifestPath}`);
    await writeReport(outPath, report);
    return 1;
  }
  addCheck('bbox-manifest-parses', true, bboxManifestPath);

  const measured = bboxJson.measured || {};
  const summary = bboxJson.summary || {};

  // 1) FRESHNESS — hole #1. Fresh iff measured.ranAt falls at-or-after THIS run's own node window.
  const ranAtMs = typeof measured.ranAt === 'string' ? Date.parse(measured.ranAt) : NaN;
  report.manifestRanAt = measured.ranAt ?? null;
  if (!nodeStartedAt) {
    report.skipped.push(
      'no run.json nodes["w4a-composer"].startedAt — freshness unverifiable (recorded, never asserted as a pass)',
    );
  } else if (Number.isNaN(ranAtMs)) {
    report.manifestFresh = 0;
    addCheck(
      'manifest-fresh',
      false,
      'bbox-manifest.json has no parseable measured.ranAt — cannot prove THIS run regenerated it',
    );
  } else {
    const startedAtMs = Date.parse(nodeStartedAt);
    const stalenessMs = startedAtMs - ranAtMs; // positive => manifest OLDER than this node's own start => stale
    report.manifestStalenessMs = stalenessMs;
    const fresh = ranAtMs >= startedAtMs - FRESHNESS_SLACK_MS;
    report.manifestFresh = fresh ? 1 : 0;
    addCheck(
      'manifest-fresh',
      fresh,
      fresh
        ? `ranAt ${measured.ranAt} >= node startedAt ${nodeStartedAt}`
        : `STALE: ranAt ${measured.ranAt} predates node startedAt ${nodeStartedAt} by ${stalenessMs}ms — the ` +
            'measured pass likely crashed (lesson-measured.mjs\'s main().catch exit-0 swallow) and never ' +
            'regenerated this file during this run; the 0-collision/0-caption numbers below are UNVERIFIED for this run',
    );
  }

  // 2) The 3 floor mirrors — script-computed, never via the fragile {{arg.lessonId}} token path.
  report.measuredMethodOk = measured.method === 'getBBox' ? 1 : 0;
  addCheck('measured-pass-ran', measured.method === 'getBBox', `measured.method=${measured.method ?? 'missing'}`);

  const collisionCount = summary.measuredCollisionCount;
  report.measuredCollisionCount = typeof collisionCount === 'number' ? collisionCount : null;
  addCheck(
    'measured-collision-floor',
    collisionCount === 0,
    `summary.measuredCollisionCount=${collisionCount ?? 'missing'}`,
  );

  const captionCount = summary.captionIntrusionCount;
  report.captionIntrusionCount = typeof captionCount === 'number' ? captionCount : null;
  addCheck(
    'caption-intrusion-floor',
    captionCount === 0,
    `summary.captionIntrusionCount=${captionCount ?? 'missing'}`,
  );

  // 3) bboxBinding bijection — hole #2a. "Every measureProps id registered load-bearing": a broken
  // bijection silently falls to zone "decoration" and VOIDS that element's own collision/intrusion check.
  const binding = measured.gates && measured.gates.bboxBinding;
  if (binding && typeof binding.pass === 'boolean') {
    const notInManifest = Array.isArray(binding.measuredNotInManifest) ? binding.measuredNotInManifest : [];
    const neverMeasured = Array.isArray(binding.manifestNeverMeasured) ? binding.manifestNeverMeasured : [];
    report.bboxBindingOk = binding.pass ? 1 : 0;
    report.measuredNotInManifestCount = notInManifest.length;
    report.manifestNeverMeasuredCount = neverMeasured.length;
    addCheck(
      'bbox-binding-bijection',
      binding.pass,
      binding.pass
        ? 'measured id ≡ manifest id (both directions)'
        : `BROKEN: ${notInManifest.length} measured id(s) not in manifest [${notInManifest.join(', ')}], ` +
            `${neverMeasured.length} declared id(s) never measured [${neverMeasured.join(', ')}] — a real ` +
            'overlap/intrusion involving one of these ids can be silently exempted (falls to "decoration")',
    );
  } else {
    report.skipped.push('bbox-manifest.json has no measured.gates.bboxBinding — bijection unverifiable this run');
  }

  // 4) allowedOverlaps exemption-list guard — hole #2b. Surfaces the composer's OWN exemption surface
  // (dead/phantom ids are a concrete, checkable defect) so the judge sees it instead of nothing; it
  // cannot itself prove a given exemption is unjustified — that stays criteria.md's "Vacuous green" call.
  if (manifestTsPath) {
    const manifestSrc = await readText(manifestTsPath);
    if (manifestSrc) {
      const declaredIds = new Set();
      const elementsBlock = extractBalancedArray(manifestSrc, 'elements');
      if (elementsBlock) {
        const idRe = /\{\s*id:\s*"([^"]+)"\s*,\s*zone:\s*"([^"]+)"\s*\}/g;
        let m;
        while ((m = idRe.exec(elementsBlock))) declaredIds.add(m[1]);
      }
      const overlapsBlock = extractBalancedArray(manifestSrc, 'allowedOverlaps');
      const pairs = [];
      if (overlapsBlock) {
        const pairRe = /\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g;
        let m;
        while ((m = pairRe.exec(overlapsBlock))) pairs.push([m[1], m[2]]);
      }
      report.allowedOverlapsCount = pairs.length;
      const phantomIds = new Set();
      for (const [a, b] of pairs) {
        if (!declaredIds.has(a)) phantomIds.add(a);
        if (!declaredIds.has(b)) phantomIds.add(b);
      }
      report.allowedOverlapsPhantomCount = phantomIds.size;
      addCheck(
        'allowed-overlaps-no-phantom-ids',
        phantomIds.size === 0,
        phantomIds.size === 0
          ? `${pairs.length} intentional-overlap exemption pair(s), all reference declared elements`
          : `${phantomIds.size} exemption id(s) reference an element NOT declared in manifest.ts's elements[] ` +
              `[${[...phantomIds].join(', ')}] — a dead/typo'd exemption, or a stale copy-paste hinting the ` +
              'wrong ids were wired',
      );
    } else {
      report.skipped.push(`manifest.ts unreadable at ${manifestTsPath} — exemption-list guard skipped`);
    }
  } else {
    report.skipped.push('manifest.ts path unresolved — exemption-list guard skipped');
  }

  const pass = report.checksFailed === 0;
  console.error(
    `w4a-composer measure: lessonId=${lessonId} (via ${resolvedVia}) · ` +
      `${report.checksTotal - report.checksFailed}/${report.checksTotal} checks passed · ` +
      `fresh=${report.manifestFresh} · collisions=${report.measuredCollisionCount} · ` +
      `captionIntrusions=${report.captionIntrusionCount} · bboxBinding=${report.bboxBindingOk} · ` +
      `allowedOverlaps=${report.allowedOverlapsCount} (phantom=${report.allowedOverlapsPhantomCount})`,
  );

  await writeReport(outPath, report);
  return pass ? 0 : 1;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    // Never an unhandled crash — a bug in THIS script degrades to a loud stderr line + a non-zero exit,
    // never a wedged substrate stage and never a silently-missing report.
    console.error(`measure.mjs: best-effort failure — ${e?.message || e}`);
    process.exit(1);
  });
