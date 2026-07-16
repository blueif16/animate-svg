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
// Usage (WIRED, via node.json's `optimize.measure` op): node visual-design-lint.mjs --run <runDir>
//   --workspace <workspace> --report-out <path>
//   --file/--storyboard/--lessonId are OPTIONAL overrides for standalone/manual invocation (e.g. testing a
//   constructed fixture directly) — when --file is given it is used as-is and no derivation happens.
//
// ENGINE NOTE (why lessonId is recovered from run.json, never an `{{arg.*}}` token — measurement-runway.md
// "runway node-dir layout" item 1): `runSubstrateMeasure`'s `resolveDeep` walks EVERY string field of the
// WHOLE op object — id, note, writes[], run.cmd, run.args[] — and a SINGLE unresolved `{{arg.*}}` token
// anywhere in that tree throws and drops the ENTIRE op into `ops.rejected` before this script ever runs.
// Historical + most current runs of this workflow predate arg-persistence (`run.json`'s `args` block is
// `null`), so a `--file .../{{arg.lessonId}}/visual-design.md`-style op arg was DARK on every argless run —
// proven live against a real run dir. So the wired op now passes ONLY `--run {{RUN}}`/`--workspace
// {{WORKSPACE}}` (both always resolvable), and this script instead recovers lessonId from THIS node's own
// declared artifact path already in `<run>/.pi/run.json` (`nodes['w2a-visual-design'].artifacts[0].path`
// always embeds `.../lesson-data/<lessonId>/...`) — the exact pattern `w3c-sound-asset`'s
// `gap-scan-lint.mjs` uses, needing no new token and no dependency on arg-persistence ever landing.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? def : process.argv[i + 1];
}

const runDir = arg('run');
const workspace = arg('workspace');
const reportOut = arg('report-out');
const lessonIdArg = arg('lessonId');
let filePath = arg('file');
let storyboardPath = arg('storyboard', null);
const charTarget = Number(arg('char-target', 13000));
const charSevere = Number(arg('char-severe', 20000));

if (!reportOut) {
  console.error('usage: visual-design-lint.mjs --run <runDir> --workspace <workspace> --report-out <path> [--file <path>] [--storyboard <path>] [--lessonId <id>]');
  process.exit(1);
}

/** Writes the minimal fail-closed report this node's own discipline requires (a measure that cannot even
 *  read its input must emit a FAILING signal, never a silent/vacuous exit with no report — see the
 *  FAIL-CLOSED comment block below). Mirrors the shape of a real report's top-level numeric leaves so
 *  `runSubstrateMeasure`'s `graded` fold still has something to read. */
function failClosed(reason) {
  const report = {
    node: 'w2a-visual-design',
    error: reason,
    charCount: 0,
    overlapCount: 0,
    unboxedZoneCount: 0,
    cueTotal: 0,
    cueMissingCount: 0,
    ok: false,
  };
  mkdirSync(dirname(reportOut), { recursive: true });
  writeFileSync(reportOut, JSON.stringify(report, null, 2));
  console.error(`FATAL: ${reason}`);
  process.exit(1);
}

// Derive filePath/storyboardPath from --run/--workspace + the recovered lessonId, UNLESS --file already
// pins it directly (the standalone/manual-fixture override).
if (!filePath) {
  if (!runDir || !workspace) {
    failClosed('no --file given and no --run/--workspace to derive one from (usage: --run <runDir> --workspace <workspace> --report-out <path>, or --file <path> --report-out <path> for standalone use)');
  }
  let lessonId = lessonIdArg;
  if (!lessonId) {
    try {
      const runJson = JSON.parse(readFileSync(join(runDir, '.pi', 'run.json'), 'utf8'));
      const artifactPath = runJson?.nodes?.['w2a-visual-design']?.artifacts?.[0]?.path;
      const m = typeof artifactPath === 'string' ? artifactPath.match(/lesson-data\/([^/]+)\//) : null;
      lessonId = m?.[1];
    } catch (e) {
      failClosed(`could not read ${join(runDir, '.pi', 'run.json')} to derive lessonId: ${e.message}`);
    }
  }
  if (!lessonId) {
    failClosed(`could not derive lessonId: no --lessonId and no recoverable nodes['w2a-visual-design'].artifacts[0].path in ${join(runDir, '.pi', 'run.json')}`);
  }
  const lessonDir = join(workspace, 'remotion-svg-primitives', 'lesson-data', lessonId);
  filePath = join(lessonDir, 'visual-design.md');
  if (!storyboardPath) storyboardPath = join(lessonDir, 'storyboard.md');
}

let text;
try {
  text = readFileSync(filePath, 'utf8');
} catch (e) {
  failClosed(`cannot read --file ${filePath}: ${e.message}`);
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
// NOTATION AUDIT (2026-07-09, closing an over-tightening the prior hardening introduced): a real audit of
// every visual-design.md this template's runs have actually shipped shows the model free-writes the box in
// several equally-legitimate shapes, not just "x=N y=N w=N h=N" — the prior regex fail-closed (parse-fail)
// on every one of these even though each carries real, computed coordinates:
//   - no '=' / no space:      "x140 y340 w1640 h130"                    (kptest-first-second-third)
//   - colon-separated:        "x:180, y:220, w:1560, h:520"              (kptest-greetings-verify)
//   - bracketed array:        "[400, 200, 1000, 500]"                    (kptest-classroom-objects)
//   - bare comma list:        "460,240,1000,600"                        (kptest-make-ten)
//   - corner-pair:            "(260,300)–(1660,780)  w1400 h480"        (kptest-compare-more-fewer)
//   - x/y RANGE (no w/h):     "x=0-1920, y=150-750"                     (kptest-whats-your-name)
// All six are genuinely PARSEABLE box declarations (real numbers, real geometry) — only a zone whose
// declaration carries NO numbers at all (a prose-only reference, e.g. a reserved system region, or a bare
// "full-bleed" outside the zone-marks exemption) is a true missing-box condition and stays correctly
// unboxed/fail-closed below; that is a missing-box gap, not a notation gap, and this fix does not touch it.
function tryLabeledXYWH(s) {
  // x/y/w/h in that order; separator is optional '='/':' and optional whitespace either side (covers
  // "x=N", "x: N", "x N", and "xN" glued with no separator at all).
  const re = /\bx\s*[:=]?\s*(-?\d+(?:\.\d+)?)[^\d.\-]+y\s*[:=]?\s*(-?\d+(?:\.\d+)?)[^\d.\-]+w\s*[:=]?\s*(-?\d+(?:\.\d+)?)[^\d.\-]+h\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i;
  const mm = re.exec(s);
  return mm ? { x: Number(mm[1]), y: Number(mm[2]), w: Number(mm[3]), h: Number(mm[4]) } : null;
}
function tryBracketArray(s) {
  const re = /\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/;
  const mm = re.exec(s);
  return mm ? { x: Number(mm[1]), y: Number(mm[2]), w: Number(mm[3]), h: Number(mm[4]) } : null;
}
function tryCornerPair(s) {
  // "(x1,y1)-(x2,y2)" (hyphen/en-dash/em-dash between the two corner points); a trailing redundant "wN hN"
  // is ignored — the corners are authoritative.
  const re = /\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*[-–—]\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;
  const mm = re.exec(s);
  if (!mm) return null;
  const [x1, y1, x2, y2] = mm.slice(1).map(Number);
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}
function tryRangeForm(s) {
  // "x=a-b, y=c-d" — two 1-D ranges, no w/h field at all.
  const re = /\bx\s*[:=]?\s*(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)[^\d.\-]+y\s*[:=]?\s*(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)/i;
  const mm = re.exec(s);
  if (!mm) return null;
  const [x1, x2, y1, y2] = mm.slice(1).map(Number);
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}
function tryBareList(s) {
  // An unlabeled "n, n, n, n" right at the start of the tail (only whitespace/colon may precede it) — a
  // bare box list with no letter labels at all. Anchored to the START so it can't false-match a random
  // 4-number run deep in unrelated prose.
  const re = /^[\s:]*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\b/;
  const mm = re.exec(s);
  return mm ? { x: Number(mm[1]), y: Number(mm[2]), w: Number(mm[3]), h: Number(mm[4]) } : null;
}
/** Tries every legitimate notation this template's real artifacts emit, in an order chosen so a range/
 *  corner-pair form (which a looser pattern could otherwise partially shadow) is tried first. Returns the
 *  first shape that parses, or null if the tail carries no recognizable box at all (a genuine missing-box
 *  condition, correctly left unboxed by the caller). */
function parseZoneBox(tail) {
  return tryRangeForm(tail) || tryCornerPair(tail) || tryLabeledXYWH(tail) || tryBracketArray(tail) || tryBareList(tail) || null;
}

function lineEnd(hay, from) {
  const nl = hay.indexOf('\n', from);
  return nl === -1 ? hay.length : nl;
}

// One single-pass, POSITION-SORTED scan of every zone-name mention (declaration or prose reference),
// captures an optional trailing "-*" (group 2) — a "zone-tally-*" reference is grouping SHORTHAND for an
// already-declared zone family (e.g. "zone-tally-left"/"zone-tally-right"), not a new declaration.
const zoneNameOnlyRe = /`?(zone(?:-[a-zA-Z]+)+)(-\*)?`?/g;
const occs = [];
let m;
while ((m = zoneNameOnlyRe.exec(text))) {
  occs.push({ name: m[1], isWildcard: !!m[2], start: m.index, end: m.index + m[0].length });
}

// One box PER zone name — only the FIRST occurrence that parses counts as the declaration (later prose
// mentions of the same name are references, not re-declarations; this also avoids a duplicate-self entry
// that could otherwise register a false self-overlap). The window is the current line (or up to the next
// zone mention, whichever is sooner) — every real notation above always puts the box on the same line as
// the zone name.
const boxedZones = [];
const boxedNames = new Set();
for (let i = 0; i < occs.length; i++) {
  const o = occs[i];
  if (o.isWildcard || boxedNames.has(o.name)) continue;
  const windowEnd = Math.min(lineEnd(text, o.end), i + 1 < occs.length ? occs[i + 1].start : Infinity);
  const box = parseZoneBox(text.slice(o.end, windowEnd));
  if (box) {
    boxedZones.push({ name: o.name, ...box });
    boxedNames.add(o.name);
  }
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

// A zone explicitly marked "(unused ...)" / "(not used ...)" in the text GOVERNED by its own mention (up to
// the next zone-name mention or 200 chars, whichever is sooner — never a whole line, which can bundle
// several zones' prose together) has zero on-screen footprint THIS lesson (a documented "not present"
// placeholder). NOTATION AUDIT: the marker is real free text ("(unused — insight lesson, no step tally)",
// "(not used in this lesson)"), not always the bare literal "(unused)" the prior match required exactly —
// broadened to match the marker WORDS regardless of trailing explanation, so this intentional escape hatch
// (memory.md: "a declared zone box that never parses is a hard fail UNLESS ... marked (unused)") actually
// fires on how the model really writes it. Scoped to UNBOXED names only — it can never override a zone that
// DID parse real coordinates, so a genuinely overlapping zone can't dodge the check by being name-dropped
// near an unrelated "(unused)" elsewhere.
const unusedZoneNames = new Set();
for (let i = 0; i < occs.length; i++) {
  const o = occs[i];
  if (o.isWildcard) continue;
  const govEnd = i + 1 < occs.length ? occs[i + 1].start : Math.min(text.length, o.end + 200);
  if (/\(\s*(?:not\s+used|unused)\b/i.test(text.slice(o.end, govEnd))) unusedZoneNames.add(o.name);
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
