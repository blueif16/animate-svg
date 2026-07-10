#!/usr/bin/env node
// w1-storyboard tools/storyboard-lint.mjs — the storyboard STRUCTURAL + cross-file invariant LINTER
// (measurement offload, mirrors game-omni's write-gdd/tools/assertion_lint). W1 hand-follows the
// lesson-storyboard SKILL's output contract (discovery ref / stage / teaching action(s) / narration
// beat intent / required visual per cue, plus a machine-readable `exposures` ledger) and the node
// prompt's "NO durations, no frames, no code" law on EVERY run. This is all DETERMINISTIC — every rule
// below is derived from lesson-storyboard/SKILL.md + the node prompt.md + a REAL, evidenced defect
// (lesson-data/kp1-fen-yu-he-intro/storyboard.md's per-cue "**Estimated duration**: 6–8s" literals; the
// documented PRE-W1FIX regression on kptest-fenyuhe-six — see memory.md). This tool MEASURES/ANSWERS: it
// never authors, blocks, or auto-fixes storyboard.md.
//
// CLI: node storyboard-lint.mjs lint --pedagogy <pedagogy.md> --storyboard <storyboard.md> [--report-out <path>]
//
// The report carries two arrays: `issues[]` (real invariant violations — this is what `ok` reflects) and
// `advisories[]` (soft guidance the SKILL doesn't hard-require — NEVER affects `ok`, never blocks).
//
// Exit codes: 2 + a usage line on stderr when a required path is missing/unreadable (nothing to
// measure); 0 in every other case — a lint report full of issues is a SUCCESSFUL run, never a failing
// one (report-only; consequence is the triage agent's job, not this script's).

import fs from "node:fs";

// ── shared CLI flag parser (the assertion-lint.mjs / harden-blueprint convention) ──
export function parseFlags(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

// ── generic markdown heading splitter: every heading line -> { level, title, body-until-next-heading } ──
export function splitHeadingBlocks(md) {
  const lines = (md || "").split("\n");
  const marks = [];
  lines.forEach((line, i) => {
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (m) marks.push({ line: i, level: m[1].length, title: m[2].trim() });
  });
  const blocks = [];
  for (let k = 0; k < marks.length; k++) {
    const start = marks[k].line + 1;
    const end = k + 1 < marks.length ? marks[k + 1].line : lines.length;
    blocks.push({ level: marks[k].level, title: marks[k].title, body: lines.slice(start, end).join("\n") });
  }
  return blocks;
}

// ── stage vocabulary (lesson-storyboard SKILL / pedagogy §3): concrete < represent < symbolize ──
export const STAGE_ORDER = { concrete: 0, represent: 1, symbolize: 2 };

// ── pedagogy.md: per-cue discovery + stage. w0-pedagogy's own output schema has drifted across the
//    corpus's history (4 real variants sampled) — tolerate all of them rather than pin one:
//      A. "### Cue N — Label" heading, plain "discovery:"/"stage:" lines (kptest-fenyuhe-six)
//      C. "## C1 — label" heading, "**discovery:**"/"**stage:**" bold lines (kptest-greetings-verify)
//      D. "## cue: <id>" heading wrapping a fenced discovery:/stage: block (kptest-first-second-third)
//      B. bare fenced ```\ncue: <id>\ndiscovery: ...\nstage: ...\n``` blocks under NO heading at all
//         (kptest-compare-more-fewer)
//    A/C/D all introduce a cue with a level-2 or level-3 HEADING; only B has none, so it is the
//    fallback. This is real-world tolerance, not guesswork — grounded in the 4 sampled pedagogy.md
//    files above. If pedagogy.md matches NONE of these, `parsePedagogyCues` returns [] and the caller
//    reports `pedagogy-unparseable` (an honest advisory, never a crash). ──
export function parsePedagogyCues(md) {
  const headingBlocks = splitHeadingBlocks(md).filter(
    (b) => (b.level === 2 || b.level === 3) && /^(C\d+\b|Cue\s+\d+|cue:\s*\S)/i.test(b.title),
  );
  if (headingBlocks.length) return headingBlocks.map((b) => extractDiscoveryStage(b.title, b.body));

  const fenced = [...(md || "").matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]);
  return fenced
    .filter((body) => /^\s*cue:\s*\S/im.test(body))
    .map((body) => extractDiscoveryStage(/^\s*cue:\s*(.+)$/im.exec(body)?.[1]?.trim() ?? "cue", body));
}

function extractDiscoveryStage(title, body) {
  const discovery = /\**discovery\**\s*:\s*(.+)$/im.exec(body)?.[1]?.trim() ?? null;
  const stageWord = /\**stage\**\s*:\s*(\w+)/im.exec(body)?.[1]?.toLowerCase() ?? null;
  return {
    title,
    discovery,
    stage: stageWord,
    stageOrdinal: stageWord && stageWord in STAGE_ORDER ? STAGE_ORDER[stageWord] : null,
  };
}

// ── storyboard.md: cue blocks. TWO more real-world drifts tolerated here, same evidence-first
//    discipline as parsePedagogyCues:
//    - HEADING LEVEL drifts `###` (SKILL.md's mandated level, e.g. kptest-fenyuhe-six) vs `##`
//      (kptest-count-to-two, kptest-whats-your-name). Rather than pin one level, a heading block
//      (level 2 OR 3) counts as a CUE only if its body's CONTENT carries at least 2 of the 5
//      contract fields — this content-signature test is what correctly excludes a real level-2 prose
//      section ("## Reinforcement cues (and reasoning)", "## exposures", "## Preceding beat —
//      topic-intro") from being misread as a cue, without needing to special-case section titles.
//    - FIELD SEPARATOR drifts ":" (e.g. "- stage: concrete") vs an em-dash (kptest-count-to-two:
//      "- **discovery ref** — \"...\""). Both accepted.
//    `discoveryRef` is EXEMPT for a cue whose ONLY teaching action is `announce-topic` — the
//    mandatory topic-intro opener legitimately carries no discovery of its own on several real, clean
//    runs (e.g. kptest-count-to-two: "the announce-topic opener ... precedes the discoveries and
//    carries no discovery of its own — it is NOT a third discovery"). Where pedagogy DOES assign the
//    opener a real discovery (e.g. kptest-fenyuhe-six's routine-reprise), the field is present anyway,
//    so this exemption never masks a genuine drop — it only forgives the legitimately discovery-less
//    case. ──
const REQUIRED_FIELDS = [
  { key: "discoveryRef", re: /discovery ref\**\s*(?::|—)/i },
  { key: "stage", re: /\**stage\**\s*(?::|—)/i },
  { key: "teachingAction", re: /teaching action\(s\)\**\s*(?::|—)/i },
  { key: "narrationBeat", re: /narration beat\b/i },
  { key: "requiredVisual", re: /required visual\**\s*(?::|—)/i },
];

export function parseStoryboardCues(md) {
  const cues = [];
  for (const b of splitHeadingBlocks(md).filter((x) => x.level === 2 || x.level === 3)) {
    const missingFieldsRaw = REQUIRED_FIELDS.filter((f) => !f.re.test(b.body)).map((f) => f.key);
    if (REQUIRED_FIELDS.length - missingFieldsRaw.length < 2) continue; // not structurally a cue (a prose section)
    const stageLine = /stage\**\s*(?::|—)\s*(\w+)/i.exec(b.body);
    const stageWord = stageLine?.[1]?.toLowerCase() ?? null;
    const isPureAnnounceTopic = /teaching action\(s\)\**\s*(?::|—)\s*`?announce-topic`?\s*[.)]?\s*$/im.test(b.body);
    const missingFields = isPureAnnounceTopic ? missingFieldsRaw.filter((k) => k !== "discoveryRef") : missingFieldsRaw;
    cues.push({
      id: b.title,
      stage: stageWord,
      stageOrdinal: stageWord && stageWord in STAGE_ORDER ? STAGE_ORDER[stageWord] : null,
      missingFields,
      hasInviteEcho: /invite-echo/i.test(b.body),
      hasLearnerGap: /learner-response-gap/i.test(b.body),
      isChoral: /choral/i.test(b.body),
    });
  }
  return cues;
}

// ── duration/frame-literal detector, with a small, evidenced WHITELIST of legitimate citations —
//    tested against REAL fixtures both ways (kptest-fenyuhe-six, -compare-more-fewer, -greetings-verify,
//    -first-second-third all pass clean; kp1-fen-yu-he-intro's per-cue "**Estimated duration**: 6–8s"
//    literals still fire):
//    (a) the fixed "≥3–5s"/"3-5s" learner-response wait-time CONSTANT (TEACHING-ACTIONS.md's own
//        invite-echo/learner-response-gap `requires` value, cited to explain a beat — not a per-cue
//        estimate; appears verbatim in every clean fixture that has an echo cue);
//    (b) a whole line quoting the Wave-3.5 reconcile FORMULA verbatim (explains why NO duration is
//        decided here, e.g. "max(narrationFrames + gapFrames, visualMotionFrames) + tail (tail <= 9
//        frames)" — a citation of the mechanism, not a decision);
//    (c) a whole line citing a BACKWARD-looking spaced-recall INTERVAL ("ago" / "after their/its
//        delivery") — e.g. kptest-fenyuhe-six's "Spaced recall of the model cues from ~30–60s ago" and
//        "spaced recall of all three model cues ~30–60s after their delivery" are a pedagogical
//        retrieval-spacing citation (how long since an EARLIER cue), never a decision about THIS cue's
//        own duration — the exact distinction the node prompt's law targets.
//    Anything else matching digit+time/frame-unit is a real violation — proven against the actual
//    lesson-data/kp1-fen-yu-he-intro/storyboard.md regression (10 cues, each carrying its own
//    "**Estimated duration**: N–Ms" literal — the exact defect this rule exists to catch).
//    One more real false-positive found + fixed during authoring: bare singular "second" collides with
//    the ORDINAL word in a comma-separated list ("1和5 first, 2和4 second, 3和3 last" —
//    kptest-fenyuhe-six's recap cue) — "4 second," reads as digit+unit by the naive pattern. Excluded
//    by requiring the unit NOT be the bare singular "second" immediately followed by a comma. ──
const DURATION_RE = /(?:[≥>]=?\s*)?\d+(?:\s*[–-]\s*\d+)?\s*(s|sec|secs|seconds|second|frames?|fps|ms)\b/gi;
const FORMULA_CITATION_RE = /max\(\s*narrationFrames\s*\+\s*gapFrames\s*,\s*visualMotionFrames\s*\)\s*\+\s*tail/i;
const SPACING_INTERVAL_RE = /\bago\b|\bafter\s+(?:their|its)\s+deliver(?:y|ed)?\b/i;

function normalizeMatch(s) {
  return s.replace(/\s+/g, "").replace(/^>=/, "≥").toLowerCase();
}
const WHITELIST = new Set(["3-5s", "3–5s", "≥3-5s", "≥3–5s"].map(normalizeMatch));

export function findDurationLiterals(storyboardMd) {
  const hits = [];
  const lines = (storyboardMd || "").split("\n");
  lines.forEach((line, i) => {
    if (FORMULA_CITATION_RE.test(line)) return; // whole line cites the mechanism, not a decision
    if (SPACING_INTERVAL_RE.test(line)) return; // whole line cites a backward-looking recall interval
    let m;
    const re = new RegExp(DURATION_RE.source, "gi");
    while ((m = re.exec(line))) {
      if (WHITELIST.has(normalizeMatch(m[0]))) continue;
      const unit = m[1].toLowerCase();
      const trailing = line.slice(m.index + m[0].length);
      if (unit === "second" && /^\s*,/.test(trailing)) continue; // ordinal-list item ("... second, ..."), not a duration
      hits.push({ line: i + 1, text: m[0].trim() });
    }
  });
  return hits;
}

// ── exposures ledger: "exposures:" then indented "key: value" lines (or the literal "exposures: {}"
//    empty form for a non-acquisition/insight lesson, per SKILL.md + the kptest-count-to-two precedent).
//    Format is lenient by design — real runs render it bare or inside a fenced block. ──
export function parseExposures(md) {
  const idx = (md || "").search(/exposures:/i);
  if (idx === -1) return { found: false, empty: false, entries: null };
  const head = md.slice(idx, idx + 60);
  if (/exposures:\s*\{\s*\}/i.test(head)) return { found: true, empty: true, entries: {} };
  const after = md.slice(idx).split("\n").slice(1);
  const entries = {};
  for (const line of after) {
    const stripped = line.replace(/#.*$/, "");
    const m = /^\s+([^\s:][^:]*):\s*(\S+)\s*$/.exec(stripped);
    if (!m) break; // first non-matching line (dedent / heading / fence / blank) ends the ledger
    entries[m[1].trim()] = m[2].trim();
  }
  return { found: true, empty: false, entries };
}

// ── the lint pass ──
export function lintStoryboard(pedagogyMd, storyboardMd) {
  const issues = [];
  const advisories = [];

  const pedagogyCues = parsePedagogyCues(pedagogyMd);
  const storyboardCues = parseStoryboardCues(storyboardMd);

  if (pedagogyCues.length === 0) {
    advisories.push({
      rule: "pedagogy-unparseable",
      detail: "no \"### Cue N — ...\" blocks found in pedagogy.md — the coverage-floor and stage-ceiling checks below degrade to no-ops (nothing to cross-reference). Confirm pedagogy.md matches the lesson-pedagogy SKILL's per-cue discovery-list shape.",
    });
  }

  // ISSUE: every cue carries all 5 output-contract fields (SKILL.md "Output").
  for (const cue of storyboardCues) {
    if (cue.missingFields.length) {
      issues.push({
        rule: "cue-missing-required-field",
        cue: cue.id,
        detail: `cue "${cue.id}" is missing: ${cue.missingFields.join(", ")}. lesson-storyboard SKILL.md's Output contract requires all five fields (discovery ref / stage / teaching action(s) / narration beat intent / required visual) on every cue — a cue missing one is structurally incomplete (often a "filler cue", SKILL.md Discipline: "no discovery, no reinforcement role ... fold or cut it").`,
      });
    }
  }

  // ISSUE: discovery-coverage floor (tolerates exactly ONE sanctioned closing-recap merge —
  // SKILL.md explicitly allows folding two closing beats that re-present the same full target set).
  const pedagogyCount = pedagogyCues.length;
  const storyboardDiscoveryCount = storyboardCues.filter((c) => !c.missingFields.includes("discoveryRef")).length;
  if (pedagogyCount > 0 && storyboardDiscoveryCount < pedagogyCount - 1) {
    issues.push({
      rule: "discovery-coverage-floor",
      detail: `pedagogy.md names ${pedagogyCount} discoveries but storyboard.md carries only ${storyboardDiscoveryCount} discovery-ref line(s) (floor: >= ${pedagogyCount - 1}, tolerating one sanctioned closing-recap merge). SKILL.md Discipline: "never invent a discovery or silently drop one." This is the COARSE count-based backstop for the documented PRE-W1FIX regression on kptest-fenyuhe-six, where the routine-reprise discovery was dropped entirely (memory.md). Whether the RIGHT discovery was kept, verbatim, is the soft judge's job (criteria.md) — this floor only catches gross undercounting.`,
    });
  }

  // ISSUE: stage ceiling — no storyboard cue may exceed the max stage pedagogy.md itself used
  // (SKILL.md: "stage — carried from pedagogy.md (no cue may exceed it)").
  const pedagogyMaxStage = pedagogyCues.reduce((mx, c) => (c.stageOrdinal != null ? Math.max(mx, c.stageOrdinal) : mx), 0);
  if (pedagogyCues.length > 0) {
    for (const cue of storyboardCues) {
      if (cue.stageOrdinal != null && cue.stageOrdinal > pedagogyMaxStage) {
        const ceilingWord = Object.keys(STAGE_ORDER).find((k) => STAGE_ORDER[k] === pedagogyMaxStage);
        issues.push({
          rule: "stage-ceiling-exceeded",
          cue: cue.id,
          detail: `cue "${cue.id}" declares stage "${cue.stage}", exceeding pedagogy.md's own per-cue ceiling ("${ceilingWord}", the highest stage any pedagogy discovery uses). SKILL.md: "stage — carried from pedagogy.md (no cue may exceed it)."`,
        });
      }
    }
  }

  // ISSUE: duration/frame literals (the node prompt's "NO durations, no frames, no code" law).
  for (const hit of findDurationLiterals(storyboardMd)) {
    issues.push({
      rule: "duration-or-frame-literal",
      line: hit.line,
      detail: `line ${hit.line} carries a duration/frame literal "${hit.text}". The node prompt's OWNED-PATH NOTE ("NO durations, no frames, no code") and lesson-storyboard SKILL.md ("No durations. No frames. No code.") forbid deciding timing at W1 — only Wave 3.5's reconcile sets cue windows. (Whitelisted: the fixed "3-5s"/"3–5s" wait-time constant and a verbatim citation of the reconcile formula — both explain the mechanism, not a per-cue decision.) Real historical instance this rule is grounded in: lesson-data/kp1-fen-yu-he-intro/storyboard.md's per-cue "**Estimated duration**: 6–8s" literals.`,
    });
  }

  // ISSUE: the exposures ledger must exist (SKILL.md "End the storyboard with a small exposures block" —
  // an insight lesson with no acquisition targets still carries the explicit empty form "exposures: {}").
  const exposures = parseExposures(storyboardMd);
  if (!exposures.found) {
    issues.push({
      rule: "exposures-ledger-missing",
      detail: 'no "exposures:" ledger found anywhere in storyboard.md. lesson-storyboard SKILL.md: "End the storyboard with a small exposures block" — every lesson, including a non-acquisition insight lesson, which uses the explicit empty form "exposures: {}" (see the kptest-count-to-two precedent).',
    });
  }

  // ADVISORY: an invite-echo cue without its own paired learner-response-gap (or an explicit choral note).
  for (const cue of storyboardCues) {
    if (cue.hasInviteEcho && !cue.hasLearnerGap && !cue.isChoral) {
      advisories.push({
        rule: "echo-without-gap-tag",
        cue: cue.id,
        detail: `cue "${cue.id}" carries invite-echo without a paired learner-response-gap tag (and no "choral" note). Every clean fixture pairs them on the SAME cue (a true >=3-5s silent retrieval window); the PRE-W1FIX regression instead bundled all wait-times into one shared cue (memory.md). Confirm this echo genuinely owns its own wait-time beat, or that it is the documented choral/count-along variant (no gap — TEACHING-ACTIONS.md's invite-echo has no blessed choral variant yet, a named skill gap per kptest-first-second-third's pipelineFindings).`,
      });
    }
  }

  // ADVISORY: an exposures value that isn't a plain non-negative integer (breaks the W3.5 machine read).
  if (exposures.found && !exposures.empty && exposures.entries) {
    for (const [target, val] of Object.entries(exposures.entries)) {
      if (!/^\d+$/.test(val)) {
        advisories.push({
          rule: "exposures-value-malformed",
          target,
          detail: `exposures["${target}"] = "${val}" is not a plain non-negative integer. SKILL.md's exposures block is machine-readable for the Wave-3.5 comprehension-floor advisory — a non-numeric value breaks that downstream read.`,
        });
      }
    }
  }

  return {
    ok: issues.length === 0,
    pedagogyDiscoveryCount: pedagogyCount,
    storyboardCueCount: storyboardCues.length,
    issues,
    advisories,
  };
}

// ── CLI ──
function usage() {
  return "usage: storyboard-lint.mjs lint --pedagogy <pedagogy.md> --storyboard <storyboard.md> [--report-out <path>]";
}

function main(argv) {
  const args = argv.slice(2);
  const hasPositionalSub = args.length > 0 && !args[0].startsWith("--");
  const sub = hasPositionalSub ? args[0] : "lint";
  const flags = parseFlags(hasPositionalSub ? args.slice(1) : args);

  if (sub !== "lint") {
    console.error(usage());
    process.exit(2);
  }

  const pedagogyPath = flags.pedagogy;
  const storyboardPath = flags.storyboard;
  if (!pedagogyPath || !storyboardPath) {
    console.error(usage());
    process.exit(2);
  }

  let pedagogyMd, storyboardMd;
  try {
    pedagogyMd = fs.readFileSync(pedagogyPath, "utf8");
  } catch (e) {
    console.error(`could not read --pedagogy ${pedagogyPath}: ${e.message}`);
    process.exit(2);
  }
  try {
    storyboardMd = fs.readFileSync(storyboardPath, "utf8");
  } catch (e) {
    console.error(`could not read --storyboard ${storyboardPath}: ${e.message}`);
    process.exit(2);
  }

  const result = lintStoryboard(pedagogyMd, storyboardMd);
  const json = JSON.stringify(result, null, 2);

  if (flags["report-out"]) {
    fs.writeFileSync(flags["report-out"], json + "\n");
    console.log(
      `[storyboard-lint] ok=${result.ok} cues=${result.storyboardCueCount} issues=${result.issues.length} advisories=${result.advisories.length} -> ${flags["report-out"]}`,
    );
  } else {
    console.log(json);
  }
  process.exit(0); // report-only: a lint report full of issues is still a SUCCESSFUL measurement.
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
