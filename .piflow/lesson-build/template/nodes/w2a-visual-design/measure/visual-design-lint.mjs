#!/usr/bin/env node
// w2a-visual-design HARD measure — thin wrapper (building-measures.md Part D).
// Report-only (ALWAYS exits 0 on a successful read; exits 1 only on a real tool error, e.g. missing
// file) — the same convention as game-omni's assertion-lint: this is a HARD signal feeding triage's
// substrate report, it never blocks the node itself (QUALITY judgment stays with criteria.md).
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
  issues.push(`char-ceiling: ${charCount} chars > severe threshold ${charSevere} (target <= ${charTarget}) — the artifact is stalling the downstream model (LEAN ARTIFACT rule, prompt.md).`);
} else if (charCount > charTarget) {
  charStatus = 'warn';
  advisories.push(`char-ceiling: ${charCount} chars > target ${charTarget} — trim toward the LEAN target.`);
}

// ---- 2. zone-disjointness (COMPUTED, not asserted) ----
// Matches both observed formats:
//   "zone-objects:    x= 160, y=180, w=960, h=300    | holds: ..."   (code-fence style)
//   "- `zone-stage` (sticks/bundles): `x=120, y=180, w=1040, h=300`" (bullet style)
const zoneLineRe = /`?(zone(?:-[a-zA-Z]+)+)`?[^\n]*?x=\s*(-?\d+)[^\d-]+y=\s*(-?\d+)[^\d-]+w=\s*(-?\d+)[^\d-]+h=\s*(-?\d+)/g;
const zoneNameOnlyRe = /`?(zone(?:-[a-zA-Z]+)+)`?/g;
const boxedZones = [];
let m;
while ((m = zoneLineRe.exec(text))) {
  boxedZones.push({ name: m[1], x: Number(m[2]), y: Number(m[3]), w: Number(m[4]), h: Number(m[5]) });
}
const allZoneNames = new Set();
while ((m = zoneNameOnlyRe.exec(text))) allZoneNames.add(m[1]);

// zone-marks is explicitly exempt (kids-eye S1.5: full-bleed, may trace over zone-objects).
const nonExemptBoxed = boxedZones.filter((z) => !/marks/i.test(z.name));
const unboxedNonExempt = [...allZoneNames].filter(
  (n) => !/marks/i.test(n) && !boxedZones.some((z) => z.name === n)
);

function overlaps(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

let zoneStatus;
const overlapPairs = [];
if (nonExemptBoxed.length < 3) {
  zoneStatus = 'inconclusive';
  advisories.push(
    `zone-disjoint: only ${nonExemptBoxed.length} boxed (non-marks) zone(s) parsed — too few for a pairwise check. ` +
      `Declared zone names seen: [${[...allZoneNames].join(', ') || 'none'}]. Unboxed: [${unboxedNonExempt.join(', ') || 'none'}].`
  );
} else {
  for (let i = 0; i < nonExemptBoxed.length; i++) {
    for (let j = i + 1; j < nonExemptBoxed.length; j++) {
      const a = nonExemptBoxed[i];
      const b = nonExemptBoxed[j];
      if (overlaps(a, b)) overlapPairs.push({ a: a.name, b: b.name, aBox: a, bBox: b });
    }
  }
  zoneStatus = overlapPairs.length ? 'fail' : 'pass';
  if (zoneStatus === 'fail') {
    for (const p of overlapPairs) {
      issues.push(
        `zone-disjoint: "${p.a}" (x${p.aBox.x},y${p.aBox.y},w${p.aBox.w},h${p.aBox.h}) overlaps "${p.b}" ` +
          `(x${p.bBox.x},y${p.bBox.y},w${p.bBox.w},h${p.bBox.h}) — disjoint was asserted but is not COMPUTED true (kids-eye S1.5).`
      );
    }
  }
  if (unboxedNonExempt.length) {
    advisories.push(`zone-disjoint: zone name(s) declared with no parsed box, skipped: [${unboxedNonExempt.join(', ')}].`);
  }
}

// ---- 3. cue-coverage (every storyboard cue addressed) ----
let cueCoverage = { status: 'skipped', reason: 'no --storyboard given' };
if (storyboardPath) {
  let sbText;
  try {
    sbText = readFileSync(storyboardPath, 'utf8');
  } catch (e) {
    cueCoverage = { status: 'skipped', reason: `cannot read --storyboard ${storyboardPath}: ${e.message}` };
  }
  if (sbText) {
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
    const missing = cues.filter((c) => !text.toLowerCase().includes(c.toLowerCase()));
    cueCoverage = { status: missing.length ? 'fail' : 'pass', total: cues.length, cues, missing };
    if (missing.length) {
      for (const c of missing) issues.push(`cue-coverage: storyboard cue "${c}" is not addressed anywhere in the visual-design artifact.`);
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
    exemptedZones: [...allZoneNames].filter((n) => /marks/i.test(n)),
    overlaps: overlapPairs.map((p) => [p.a, p.b]),
  },
  cueCoverage,
  motionBudgetAdvisory: { secondsTokens, cueCount },
  ok: zoneStatus !== 'fail' && cueCoverage.status !== 'fail',
  issues,
  advisories,
};

mkdirSync(dirname(reportOut), { recursive: true });
writeFileSync(reportOut, JSON.stringify(report, null, 2));
console.log(`w2a-visual-design lint: ok=${report.ok} issues=${issues.length} advisories=${advisories.length} -> ${reportOut}`);
process.exit(0);
