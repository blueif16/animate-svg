#!/usr/bin/env node
// w2a-visual-design HARD measure — thin wrapper (building-measures.md Part D).
// Report-only (ALWAYS exits 0 on a successful read; exits 1 only on a real tool error, e.g. missing
// file) — the same convention as game-omni's assertion-lint: this is a HARD signal feeding triage's
// substrate report, it never blocks the node itself (QUALITY judgment stays with criteria.md).
//
// FAIL-CLOSED discipline (measurement-runway.md "VALIDITY" + building-measures.md Part A Law 3): a
// measure that CANNOT evaluate its input must emit a FAILING signal, never a silent/vacuous `ok:true`.
// This version closes four adversarially-proven fail-open holes (all reproduced live against real
// lesson-data fixtures before this fix — see the paired /tmp before/after reports the harden proved):
//   H1. `charCheck.status === 'severe'` (>20k chars) was computed and pushed to `issues`, but never
//       folded into the top-level `ok` — a `severe` artifact could still report `ok:true`. Reproduced
//       live on the real `fen-yu-he` run (20,912 chars, severe) which reported `ok:true`.
//   H2. `zone-disjoint` silently downgraded an unboxed declared zone name to an `advisories`-only note
//       (`inconclusive`/skip) and kept computing/pass-ing on whatever DID parse — so a zone that failed
//       to parse was silently DROPPED from the disjointness check instead of failing it. Reproduced live
//       on the real `kp2-counting-by-tens` run: it declares `zone-tally-left`/`zone-tally-right` boxed,
//       but also references a bare `zone-tally-*` wildcard with no box of its own — the old code silently
//       skipped it (`advisories`, `ok:true`); disjointness for that reference was never actually verified.
//   H3. `cueCoverage.status === 'skipped'` (no `--storyboard` given, or it failed to read) still reported
//       `ok:true` with zero issues/advisories — a measure that could not even ATTEMPT the check reported
//       the same as one that ran and passed. Reproduced live (baseline run with no `--storyboard`).
//   H4. `cue-coverage` used a bare `.toLowerCase().includes()` substring test with no notion of "real
//       content" — a producer could satisfy every cue by simply LISTING the cue names back-to-back
//       (e.g. "Cues addressed: intro, bundle-recall, ...") with zero actual per-cue design content, a
//       textbook presence-not-decision Goodhart surrogate (building-measures.md Part A Law 3).
// All four are now FAIL-CLOSED: `ok` folds `charCheck.status!=='severe'`, `zoneCheck.status==='pass'`
// (a `parse-fail` — an unboxed declared zone OR too few boxed zones to run the pairwise check — is a
// FAIL, not an advisory), and `cueCoverage.status==='pass'` (no more silent `skipped`).
//
// Three deterministic checks a JSON schema can't express, each named by real evidence:
//   1. char-ceiling   — the LEAN ARTIFACT rule in prompt.md ("Target <= 13k chars"). Evidenced by the
//      real ten-ones-make-one-ten/visual-design.md run, which shipped at 31042 chars (2.4x target).
//   2. zone-disjoint  — kids-eye SKILL.md S1.5: "Disjoint is COMPUTED, not asserted." Evidenced by the
//      real historical defect (same lesson's REDO note): "the label rendered ON TOP of the bundle."
//   3. cue-coverage   — every cue the storyboard declares must be addressed; a silently dropped cue is
//      the cheapest, most common omission (building-measures.md SS0 "Two soft artifacts").
//
// Usage: node visual-design-lint.mjs --file <visual-design.md> [--storyboard <storyboard.md>] --report-out <path>

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? def : process.argv[i + 1];
}

const filePath = arg('file');
const storyboardPath = arg('storyboard', null);
const reportOut = arg('report-out');
const charTarget = Number(arg('char-target', 13000));
const charSevere = Number(arg('char-severe', 20000));

if (!filePath || !reportOut) {
  console.error('usage: visual-design-lint.mjs --file <path> [--storyboard <path>] --report-out <path>');
  process.exit(1);
}

let text;
try {
  text = readFileSync(filePath, 'utf8');
} catch (e) {
  console.error(`FATAL: cannot read --file ${filePath}: ${e.message}`);
  process.exit(1);
}

const issues = [];
const advisories = [];

// ---- 1. char-ceiling (LEAN artifact) ----
const charCount = text.length;
let charStatus = 'ok';
if (charCount > charSevere) {
  charStatus = 'severe';
  issues.push(`char-ceiling: ${charCount} chars > severe threshold ${charSevere} (target <= ${charTarget}) — the artifact is stalling the downstream model (LEAN ARTIFACT rule, prompt.md). FAIL-CLOSED: severe folds into ok:false.`);
} else if (charCount > charTarget) {
  charStatus = 'warn';
  advisories.push(`char-ceiling: ${charCount} chars > target ${charTarget} — trim toward the LEAN target.`);
}

// ---- 2. zone-disjointness (COMPUTED, not asserted; FAIL-CLOSED on any parse gap) ----
// Matches both observed formats:
//   "zone-objects:    x= 160, y=180, w=960, h=300    | holds: ..."   (code-fence style)
//   "- `zone-stage` (sticks/bundles): `x=120, y=180, w=1040, h=300`" (bullet style)
const zoneLineRe = /`?(zone(?:-[a-zA-Z]+)+)`?[^\n]*?x=\s*(-?\d+)[^\d-]+y=\s*(-?\d+)[^\d-]+w=\s*(-?\d+)[^\d-]+h=\s*(-?\d+)/g;
const boxedZones = [];
let m;
while ((m = zoneLineRe.exec(text))) {
  boxedZones.push({ name: m[1], x: Number(m[2]), y: Number(m[3]), w: Number(m[4]), h: Number(m[5]) });
}

// One single-pass, POSITION-SORTED scan of every zone-name mention (declaration or prose reference),
// captures an optional trailing "-*" (group 2) — a "zone-tally-*" reference is grouping SHORTHAND for an
// already-declared zone family (e.g. "zone-tally-left"/"zone-tally-right"), not a new declaration.
const zoneNameOnlyRe = /`?(zone(?:-[a-zA-Z]+)+)(-\*)?`?/g;
const occs = [];
while ((m = zoneNameOnlyRe.exec(text))) {
  occs.push({ name: m[1], isWildcard: !!m[2], start: m.index, end: m.index + m[0].length });
}

const allZoneNames = new Set();
const wildcardBases = new Set();
for (const o of occs) (o.isWildcard ? wildcardBases : allZoneNames).add(o.name);
// Resolve each wildcard base against the boxed set: if at least one already-boxed zone shares the
// prefix, the wildcard is satisfied shorthand for zones already verified — drop it. If NONE do, it is
// a genuine dangling reference to an undeclared/unboxed zone family, so fold it into the normal
// unboxed-detection path below (fail-closed, never silently dropped).
for (const base of wildcardBases) {
  const hasPrefixedBox = boxedZones.some((z) => z.name === base || z.name.startsWith(`${base}-`));
  if (!hasPrefixedBox) allZoneNames.add(base);
}

// A zone explicitly marked "(unused)" in the text GOVERNED by its own mention (up to the next zone-name
// mention or 200 chars, whichever is sooner — never a whole line, which can bundle several zones' prose
// together) has zero on-screen footprint THIS lesson (a documented "not present" placeholder). Scoped to
// UNBOXED names only — it can never override a zone that DID parse real coordinates, so a genuinely
// overlapping zone can't dodge the check by being name-dropped near an unrelated "(unused)" elsewhere.
const unusedZoneNames = new Set();
for (let i = 0; i < occs.length; i++) {
  const o = occs[i];
  if (o.isWildcard) continue;
  const govEnd = i + 1 < occs.length ? occs[i + 1].start : Math.min(text.length, o.end + 200);
  if (/\(unused\)/i.test(text.slice(o.end, govEnd))) unusedZoneNames.add(o.name);
}

function isMarksExempt(name) {
  return /marks/i.test(name);
}

// zone-marks is explicitly exempt (kids-eye S1.5: full-bleed, may trace over zone-objects) — even if it
// happens to parse a box, it is never pairwise-checked.
const nonExemptBoxed = boxedZones.filter((z) => !isMarksExempt(z.name));
const unboxedNonExempt = [...allZoneNames].filter(
  (n) => !isMarksExempt(n) && !unusedZoneNames.has(n) && !boxedZones.some((z) => z.name === n)
);

function overlaps(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

const overlapPairs = [];
if (nonExemptBoxed.length >= 2) {
  for (let i = 0; i < nonExemptBoxed.length; i++) {
    for (let j = i + 1; j < nonExemptBoxed.length; j++) {
      const a = nonExemptBoxed[i];
      const b = nonExemptBoxed[j];
      if (overlaps(a, b)) overlapPairs.push({ a: a.name, b: b.name, aBox: a, bBox: b });
    }
  }
}

const tooFewBoxed = nonExemptBoxed.length < 3;
const hasUnboxed = unboxedNonExempt.length > 0;

let zoneStatus;
if (overlapPairs.length) {
  // A genuine computed overlap is ALWAYS a fail, regardless of parse completeness elsewhere.
  zoneStatus = 'fail';
  for (const p of overlapPairs) {
    issues.push(
      `zone-disjoint: "${p.a}" (x${p.aBox.x},y${p.aBox.y},w${p.aBox.w},h${p.aBox.h}) overlaps "${p.b}" ` +
        `(x${p.bBox.x},y${p.bBox.y},w${p.bBox.w},h${p.bBox.h}) — disjoint was asserted but is not COMPUTED true (kids-eye S1.5).`
    );
  }
} else if (tooFewBoxed || hasUnboxed) {
  // FAIL-CLOSED: the check could not fully verify disjointness (too few parsed boxes to run a pairwise
  // comparison, or a declared zone name never resolved to a box) — that is a FAIL, not a vacuous pass
  // or a silent advisory-only skip (measurement-runway.md: "an absent/unparseable report is a FAIL").
  zoneStatus = 'parse-fail';
} else {
  zoneStatus = 'pass';
}

if (tooFewBoxed) {
  issues.push(
    `zone-disjoint: only ${nonExemptBoxed.length} boxed (non-marks) zone(s) parsed — too few for a pairwise check, so disjointness cannot be verified (FAIL-CLOSED, not a pass). ` +
      `Declared zone names seen: [${[...allZoneNames].join(', ') || 'none'}]. Unboxed: [${unboxedNonExempt.join(', ') || 'none'}].`
  );
}
if (hasUnboxed) {
  issues.push(
    `zone-disjoint: zone name(s) declared with no parsed box, so their disjointness could NOT be verified: [${unboxedNonExempt.join(', ')}] — FAIL-CLOSED (previously this was a silent advisory-only skip while ok stayed true; a declared-but-unboxed zone can hide a real overlap, as it did on the real kp2-counting-by-tens run's \`zone-tally-*\` wildcard reference).`
  );
}

// ---- 3. cue-coverage (every storyboard cue addressed; FAIL-CLOSED, never a silent skip) ----
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// A short run of connector-only characters (whitespace/punctuation/arrows, no letters or digits) — the
// signature of a bare enumeration ("A, B, C" or "A→B→C") with nothing else between two cue mentions.
const CONNECTOR = '[\\s,;:·•\\-–—→/.]{0,4}';

function findOccurrences(hay, needle) {
  const re = new RegExp(`\\b${escapeRegex(needle)}\\b`, 'gi');
  const out = [];
  let mm;
  while ((mm = re.exec(hay))) out.push({ start: mm.index, end: mm.index + mm[0].length });
  return out;
}

// De-game beyond substring `includes()` (building-measures.md Part A Law 3 — key on a RELATION/DECISION,
// never mere PRESENCE): an occurrence that is merely GLUED to another cue's name by nothing but connector
// characters — no real word of content between them — is the signature of a bare name-drop list
// ("Cues addressed: intro, bundle-recall, ...") rather than a real per-cue treatment. Such an occurrence
// does not count; a cue must have AT LEAST ONE occurrence that is NOT sandwiched this way.
function isGlued(hay, occ, otherNeedles) {
  const beforeWin = hay.slice(Math.max(0, occ.start - 40), occ.start);
  const afterWin = hay.slice(occ.end, occ.end + 40);
  for (const other of otherNeedles) {
    const beforeRe = new RegExp(`${escapeRegex(other)}${CONNECTOR}$`, 'i');
    const afterRe = new RegExp(`^${CONNECTOR}${escapeRegex(other)}\\b`, 'i');
    if (beforeRe.test(beforeWin) || afterRe.test(afterWin)) return true;
  }
  return false;
}

function cueIsCovered(hay, cue, allCues) {
  const occs = findOccurrences(hay, cue);
  if (!occs.length) return false;
  const others = allCues.filter((c) => c !== cue);
  return occs.some((occ) => !isGlued(hay, occ, others));
}

let cueCoverage;
if (!storyboardPath) {
  cueCoverage = {
    status: 'fail',
    total: 0,
    cues: [],
    missing: [],
    reason: 'no --storyboard given — cue coverage cannot be verified (FAIL-CLOSED, not a pass).',
  };
  issues.push('cue-coverage: no --storyboard given — cue coverage could not be verified (FAIL-CLOSED, not a pass).');
} else {
  let sbText = null;
  let readErr = null;
  try {
    sbText = readFileSync(storyboardPath, 'utf8');
  } catch (e) {
    readErr = e;
  }
  if (readErr) {
    cueCoverage = {
      status: 'fail',
      total: 0,
      cues: [],
      missing: [],
      reason: `cannot read --storyboard ${storyboardPath}: ${readErr.message}`,
    };
    issues.push(`cue-coverage: cannot read --storyboard ${storyboardPath}: ${readErr.message} (FAIL-CLOSED, not a pass).`);
  } else {
    const headingRe = /^#{2,3}\s+(.+)$/gm;
    const denyRe = /summary|ledger|primitive|source-of-truth/i;
    const cues = [];
    let hm;
    while ((hm = headingRe.exec(sbText))) {
      let raw = hm[1].trim();
      if (denyRe.test(raw)) continue;
      // strip trailing "*(emphasis ...)*", backticks, quoted narration after " -- "/" — "
      raw = raw.replace(/\*\(.*?\)\*/g, '').trim();
      raw = raw.split(/\s+--\s+|\s+—\s+/)[0].trim();
      raw = raw.replace(/`/g, '').trim();
      if (raw) cues.push(raw);
    }
    if (!cues.length) {
      cueCoverage = {
        status: 'fail',
        total: 0,
        cues: [],
        missing: [],
        reason: 'parsed ZERO cue headings from the storyboard — cannot verify coverage (FAIL-CLOSED, not a pass).',
      };
      issues.push('cue-coverage: parsed ZERO cue headings from the storyboard — cannot verify coverage (FAIL-CLOSED, not a pass).');
    } else {
      const missing = cues.filter((c) => !cueIsCovered(text, c, cues));
      cueCoverage = { status: missing.length ? 'fail' : 'pass', total: cues.length, cues, missing };
      if (missing.length) {
        for (const c of missing) {
          issues.push(
            `cue-coverage: storyboard cue "${c}" is not addressed anywhere in the visual-design artifact with real ` +
              `per-cue content (a bare name-drop glued next to another cue name does not count — Law 3 anti-Goodhart).`
          );
        }
      }
    }
  }
}

// ---- bonus advisory: motion-budget presence (never blocks) ----
const secondsTokens = (text.match(/\b\d+(\.\d+)?\s*s\b/g) || []).length;
const cueCount = cueCoverage.total ?? null;
if (cueCount != null && secondsTokens < cueCount) {
  advisories.push(
    `motion-budget: only ${secondsTokens} second-value token(s) found for ${cueCount} storyboard cue(s) — some cues may be missing a stated visualMotionSeconds.`
  );
}

const report = {
  node: 'w2a-visual-design',
  file: filePath,
  charCount,
  charCheck: { target: charTarget, severe: charSevere, status: charStatus },
  zoneCheck: {
    status: zoneStatus,
    boxedZones: nonExemptBoxed.map((z) => z.name),
    exemptedZones: [...new Set([...allZoneNames, ...boxedZones.map((z) => z.name)].filter((n) => isMarksExempt(n) || unusedZoneNames.has(n)))],
    unboxedZones: unboxedNonExempt,
    overlaps: overlapPairs.map((p) => [p.a, p.b]),
  },
  cueCoverage,
  motionBudgetAdvisory: { secondsTokens, cueCount },
  // top-level numeric leaves — folded into the substrate `graded` axis by measure.ts's
  // foldNumericLeaves ONLY when this op declares `writes[]` pointing at --report-out (node.json).
  overlapCount: overlapPairs.length,
  unboxedZoneCount: unboxedNonExempt.length,
  cueTotal: cueCoverage.total ?? 0,
  cueMissingCount: cueCoverage.missing ? cueCoverage.missing.length : 0,
  ok: charStatus !== 'severe' && zoneStatus === 'pass' && cueCoverage.status === 'pass',
  issues,
  advisories,
};

mkdirSync(dirname(reportOut), { recursive: true });
writeFileSync(reportOut, JSON.stringify(report, null, 2));
console.log(`w2a-visual-design lint: ok=${report.ok} issues=${issues.length} advisories=${advisories.length} -> ${reportOut}`);
process.exit(0);
