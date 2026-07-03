#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const parseArgs = (argv) => {
  const args = { config: undefined, measured: false, adoptionLintOnly: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    // Boolean flag: opt-in MEASURED pass (additive; default path unchanged).
    if (arg === "--measured") {
      args.measured = true;
      continue;
    }
    // Boolean flag: run ONLY the static adoption lints below (no config, no
    // bundling/rendering) — fast standalone invocation for CI / a quick
    // red-green check on one or two lesson folders.
    if (arg === "--adoption-lint-only") {
      args.adoptionLintOnly = true;
      continue;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) =>
        char.toUpperCase(),
      );
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      args[key] = value;
      index += 1;
    }
  }
  return args;
};

const run = (label, command, args) => {
  console.log(`\n== ${label}`);
  execFileSync(command, args, { stdio: "inherit" });
};

// ─────────────────────────────────────────────────────────────────────────
// Adoption lints (research/remotion-vendor-best-practices-2026-07-03.md §5,
// opportunities #3 + #14) — lesson-agnostic, pattern-based static checks.
//
// Both lints share ONE shape: a JSX prop known to carry a specific kind of
// value (a spoken-sync step cadence; a countable-unit render size) feeds an
// IDENTIFIER; that identifier is defined in the lesson's OWN `layout.ts`;
// the check is whether that definition (or anything it transitively
// references) calls the sanctioned MEASURED helper this codebase already
// ships (`stepFramesFromOnsets`/`tokenOnsetFrame`; `fitUnitsToZone`) — never
// whether the identifier happens to be named a particular way. A lesson
// renaming its constant does not dodge this; a brand-new lesson is covered
// automatically (no per-lesson registration needed here).
//
// Escape hatch (CLAUDE.md "SPOKEN ENUMERATION BINDS TO TOKEN ONSETS" /
// "PRIMITIVE QUALITY..."): the measured data can be genuinely unavailable (no
// ASR onsets yet; a zone genuinely doesn't fit the auto-size model). Falling
// back to a plain constant is SANCTIONED as long as a pipelineFinding records
// WHY — either as a comment directly on the constant in layout.ts, or logged
// in the lesson's `lesson-data/<id>/_logs/*.md`. Recorded evidence => the
// lint treats the fallback as compliant, not a violation; an UNRECORDED
// fallback is exactly the regression this lint exists to catch.
// ─────────────────────────────────────────────────────────────────────────

// The known countable-unit teaching primitives — their `size` prop is a
// per-unit render size, the exact class of prop opportunity #14 is about.
// Extend this list when a new countable-unit primitive ships (mirrors the
// maintained-list style of manifestTypes.ts's ALLOWED_OVERLAP_PAIRS). These
// are shared CAPABILITY names, not lesson names.
export const COUNTABLE_UNIT_COMPONENTS = ["CountableObject"];

// The known spoken-sync step props (opportunity #3) — `stepDurationFrames` is
// the fixed-cadence FALLBACK prop; `stepFrames` is the measured-onset ARRAY
// prop (see OrderedRowSpotlight.tsx). Only the fallback prop is checked here:
// a bare identifier flowing into it must be derived from the onset API (or
// have a recorded pipelineFinding), same escape hatch as CLAUDE.md documents.
const STEP_PROP_RE = /\bstepDurationFrames\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g;
const SIZE_PROP_RE = /\bsize\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g;

const ONSET_API_NAMES = ["stepFramesFromOnsets", "tokenOnsetFrame"];
// "onset" alone is specific enough here — a comment attached to a spoken-sync
// step constant (proximity-scoped by `commentBlockAbove`) that talks about an
// onset fallback is unambiguous; the `_logs` path additionally requires the
// identifier's own name to co-occur (see `mentionsFindingForIdent`), which is
// what actually guards against an unrelated onset mention elsewhere in a log.
const ONSET_HINT_RE = /onset/i;
const ZONE_API_NAMES = ["fitUnitsToZone"];
// Deliberately NOT `/\bzone\b/` — "zone" is ubiquitous in this codebase's own
// layout comments (every zone-based constant's rationale mentions "zone"),
// so that alone would launder almost any hand-picked size. Require the
// LITERAL API name: a comment justifying "why not fitUnitsToZone here" must
// actually say so, not merely describe zone geometry in passing (the
// pre-fix APPLE_SIZE comment did the latter — "visual-design zone sizes vs.
// implementation" — and is correctly NOT an escape hatch).
const ZONE_HINT_RE = /fitunitstozone/i;

// camelCase lesson-folder name -> kebab-case lesson id (matches this repo's
// naming rule: folder `kptestFirstSecondThird` <-> `lesson-data/kptest-first-
// second-third`; `kp2CountingByTens` <-> `kp2-counting-by-tens`).
export const toKebabLessonId = (camelFolderName) =>
  camelFolderName.replace(/([A-Z])/g, "-$1").toLowerCase();

// Every self-closing JSX chunk `<Tag ...props.../>` whose tag is in
// `tagNames`, scanned across the WHOLE source. Regex-based (not a full JSX
// parser) — correct for this codebase's convention of props-only,
// self-closing usages of these primitives; a non-self-closing usage is
// simply not matched (SKIP, not a false flag).
export const extractSelfClosingTags = (source, tagNames) => {
  const alt = tagNames
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const re = new RegExp(`<(?:${alt})\\b[\\s\\S]*?/>`, "g");
  const chunks = [];
  let m;
  while ((m = re.exec(source))) {
    chunks.push({ text: m[0], index: m.index });
  }
  return chunks;
};

// Parse a scene file's `import { ...names } from "./<folder>/layout"`
// statements (this codebase's ZERO-frame-literal convention: every lesson
// scene imports its constants from a sibling `<folder>/layout.ts`). Returns
// one entry per matching import with the resolved layout.ts path.
export const resolveLayoutImports = (sceneSource, lessonsDir) => {
  const re = /import\s*\{([^}]*)\}\s*from\s*["']\.\/([\w-]+)\/layout["'];?/g;
  const out = [];
  let m;
  while ((m = re.exec(sceneSource))) {
    const names = m[1]
      .split(",")
      .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean);
    out.push({ names, folder: m[2], layoutPath: path.join(lessonsDir, m[2], "layout.ts") });
  }
  return out;
};

const lineNumberAt = (source, index) => source.slice(0, index).split("\n").length;

// Index of `const IDENT` / `export const IDENT` in `source`, or -1.
const findConstDeclIndex = (source, ident) => {
  const re = new RegExp(`(?:export\\s+)?const\\s+${ident}\\b`);
  const m = re.exec(source);
  return m ? m.index : -1;
};

// The FULL statement starting at `declIndex`, handling multi-line
// object/array literals and nested calls via a bracket-depth scan (this
// codebase's layout.ts constants are plain expressions terminated by a
// top-level `;` — a lightweight depth counter is enough, no parser needed).
export const extractStatement = (source, declIndex) => {
  const eqIndex = source.indexOf("=", declIndex);
  if (eqIndex === -1) return null;
  let depth = 0;
  let i = eqIndex + 1;
  for (; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "(" || ch === "{" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "}" || ch === "]") depth -= 1;
    else if (ch === ";" && depth <= 0) break;
  }
  return source.slice(declIndex, Math.min(i + 1, source.length));
};

// The contiguous `//`-comment block (blank lines included) directly ABOVE
// `declIndex` — the natural home for a recorded pipelineFinding, matching
// this codebase's existing convention (see kptestCountToTwo/layout.ts's
// APPLE_FIT history).
export const commentBlockAbove = (source, declIndex) => {
  const beforeLines = source.slice(0, declIndex).split("\n");
  let start = beforeLines.length;
  for (let i = beforeLines.length - 1; i >= 0; i -= 1) {
    const line = beforeLines[i].trim();
    if (line === "" || line.startsWith("//")) {
      start = i;
    } else {
      break;
    }
  }
  return beforeLines.slice(start).join("\n");
};

// True if `ident`'s own definition, OR anything it transitively references
// (other ALL_CAPS consts in the SAME file, up to a small depth), calls one of
// `apiNames`. Depth-capped + visited-set guarded — this file's constants are
// a small, acyclic dependency graph in practice (e.g. APPLE_SIZE references
// APPLE_FIT, which calls fitUnitsToZone; SWEEP_STEP_FRAMES references
// COUNT_SECOND_STEPS, which calls stepFramesFromOnsets).
export const resolvesViaApi = (source, ident, apiNames, depth = 0, visited = new Set()) => {
  if (depth > 4 || visited.has(ident)) return false;
  visited.add(ident);
  const declIndex = findConstDeclIndex(source, ident);
  if (declIndex === -1) return false;
  const statement = extractStatement(source, declIndex);
  if (!statement) return false;
  if (apiNames.some((name) => statement.includes(`${name}(`))) return true;
  const refs = statement.match(/\b[A-Z][A-Z0-9_]*\b/g) || [];
  for (const ref of refs) {
    if (ref === ident) continue;
    if (resolvesViaApi(source, ref, apiNames, depth + 1, visited)) return true;
  }
  return false;
};

// A _logs/*.md file's evidence must be SPECIFIC to `ident` — a per-wave log
// almost always has a boilerplate "## PIPELINE FINDINGS" section header, and
// a long log frequently mentions the hint keyword (e.g. "onset") for a
// TOTALLY UNRELATED cue. Requiring the identifier's own name to co-occur
// with the finding marker + hint keyword (within the same heading-delimited
// section, or the same blank-line-delimited paragraph for an inline mention)
// stops that from silently laundering an unrecorded fallback.
const mentionsFindingForIdent = (text, ident, hintRe) => {
  const headingRe = /^#{1,6}.*pipeline finding.*$/gim;
  let m;
  while ((m = headingRe.exec(text))) {
    const rest = text.slice(m.index + m[0].length);
    const nextHeadingOffset = rest.search(/^#{1,6}\s+\S/m);
    const section = nextHeadingOffset === -1 ? rest : rest.slice(0, nextHeadingOffset);
    if (section.includes(ident) && hintRe.test(section)) return true;
  }
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.some(
    (p) => /pipeline finding/i.test(p) && p.includes(ident) && hintRe.test(p),
  );
};

// The CLAUDE.md-sanctioned escape hatch: a pipelineFinding recorded either as
// a comment directly on `ident`'s OWN declaration in layout.ts (proximity
// alone establishes relevance there — `commentBlockAbove` only ever returns
// the comment immediately attached to THIS declaration), or logged in the
// lesson's `lesson-data/<id>/_logs/*.md` (where relevance must be established
// explicitly — see `mentionsFindingForIdent`). `hintRe` disambiguates WHICH
// kind of finding counts (an onset finding shouldn't silence the zone lint
// and vice versa).
export const hasEscapeHatchEvidence = (source, ident, lessonDataDir, lessonKebabId, hintRe) => {
  const declIndex = findConstDeclIndex(source, ident);
  if (declIndex !== -1) {
    const comment = commentBlockAbove(source, declIndex);
    const lineEnd = source.indexOf("\n", declIndex);
    const ownLine = source.slice(declIndex, lineEnd === -1 ? source.length : lineEnd);
    const nearby = `${comment}\n${ownLine}`;
    if (/pipeline[\s_-]?finding/i.test(nearby) && hintRe.test(nearby)) {
      return { evidence: "layout.ts comment" };
    }
  }
  const logsDir = path.join(lessonDataDir, lessonKebabId, "_logs");
  if (fs.existsSync(logsDir)) {
    for (const f of fs.readdirSync(logsDir).filter((name) => name.endsWith(".md"))) {
      const text = fs.readFileSync(path.join(logsDir, f), "utf8");
      if (mentionsFindingForIdent(text, ident, hintRe)) {
        return { evidence: `lesson-data/${lessonKebabId}/_logs/${f}` };
      }
    }
  }
  return null;
};

const findSceneFile = (lessonsDir, folderName) => {
  const re = new RegExp(`^${folderName}LessonScene\\.tsx$`, "i");
  const match = fs.readdirSync(lessonsDir).find((entry) => re.test(entry));
  return match ? path.join(lessonsDir, match) : null;
};

// One adoption-lint pass over EVERY `src/lessons/<folder>/layout.ts` +
// sibling `<folder>LessonScene.tsx` — lesson-agnostic (the folder list is
// discovered by `fs.readdirSync`, never hardcoded).
export const checkPropAdoption = ({
  lessonsDir,
  lessonDataDir,
  label,
  propRe,
  tagNames,
  apiNames,
  hintRe,
}) => {
  const violations = [];
  let checked = 0;
  if (!fs.existsSync(lessonsDir)) return { label, violations, checked };

  const folders = fs
    .readdirSync(lessonsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => fs.existsSync(path.join(lessonsDir, name, "layout.ts")));

  for (const folder of folders) {
    const sceneFile = findSceneFile(lessonsDir, folder);
    if (!sceneFile) continue;
    const sceneSource = fs.readFileSync(sceneFile, "utf8");
    const ownLayoutPath = path.join(lessonsDir, folder, "layout.ts");
    const imports = resolveLayoutImports(sceneSource, lessonsDir).find(
      (imp) => imp.layoutPath === ownLayoutPath,
    );
    if (!imports) continue;

    let layoutSource;
    try {
      layoutSource = fs.readFileSync(ownLayoutPath, "utf8");
    } catch {
      continue;
    }
    const lessonKebabId = toKebabLessonId(folder);
    const chunks = tagNames
      ? extractSelfClosingTags(sceneSource, tagNames)
      : [{ text: sceneSource, index: 0 }];

    for (const chunk of chunks) {
      const re = new RegExp(propRe.source, propRe.flags);
      let m;
      while ((m = re.exec(chunk.text))) {
        const ident = m[1];
        if (!imports.names.includes(ident)) continue; // not from this lesson's layout.ts
        checked += 1;
        if (resolvesViaApi(layoutSource, ident, apiNames)) continue; // adopted
        const escapeHatch = hasEscapeHatchEvidence(
          layoutSource,
          ident,
          lessonDataDir,
          lessonKebabId,
          hintRe,
        );
        if (escapeHatch) continue; // sanctioned fallback, evidenced

        violations.push({
          label,
          sceneFile: path.relative(process.cwd(), sceneFile),
          sceneLine: lineNumberAt(sceneSource, chunk.index + m.index),
          identifier: ident,
          layoutFile: path.relative(process.cwd(), ownLayoutPath),
        });
      }
    }
  }

  return { label, violations, checked };
};

// Run both adoption lints against a lessons/lesson-data root pair (defaults
// to this repo's real layout). Returns `{ passed, results }`.
export const runAdoptionLints = ({
  lessonsDir = path.join(process.cwd(), "src", "lessons"),
  lessonDataDir = path.join(process.cwd(), "lesson-data"),
} = {}) => {
  const results = [
    checkPropAdoption({
      lessonsDir,
      lessonDataDir,
      label: "spoken-sync-step (stepDurationFrames without a measured onset)",
      propRe: STEP_PROP_RE,
      tagNames: null,
      apiNames: ONSET_API_NAMES,
      hintRe: ONSET_HINT_RE,
    }),
    checkPropAdoption({
      lessonsDir,
      lessonDataDir,
      label: "countable-unit-size (hand-picked size on a countable primitive)",
      propRe: SIZE_PROP_RE,
      tagNames: COUNTABLE_UNIT_COMPONENTS,
      apiNames: ZONE_API_NAMES,
      hintRe: ZONE_HINT_RE,
    }),
  ];
  const passed = results.every((r) => r.violations.length === 0);
  return { passed, results };
};

const printAdoptionLintResults = ({ results }) => {
  console.log(`\n${"=".repeat(60)}`);
  console.log("Adoption lints (research/remotion-vendor-best-practices-2026-07-03.md §5 #3 + #14)");
  console.log("=".repeat(60));
  for (const result of results) {
    console.log(`\n== ${result.label}`);
    if (result.violations.length === 0) {
      console.log(`  OK — 0 violations (${result.checked} usage(s) checked)`);
      continue;
    }
    for (const v of result.violations) {
      console.log(
        `  VIOLATION: ${v.sceneFile}:${v.sceneLine} passes ${v.identifier} ` +
          `(defined in ${v.layoutFile}) — hand-picked, not derived from the ` +
          `measured API, and no pipelineFinding recorded for a fallback.`,
      );
    }
  }
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));

  const lints = runAdoptionLints();
  printAdoptionLintResults(lints);

  if (args.adoptionLintOnly) {
    if (!lints.passed) {
      throw new Error("Adoption lint violations found (see above).");
    }
    return;
  }

  if (!args.config) {
    throw new Error("Missing required option: --config <path>");
  }
  const config = JSON.parse(fs.readFileSync(args.config, "utf8"));
  if (!config.lessonId) {
    throw new Error(`pipeline.json missing lessonId: ${args.config}`);
  }

  const outDir = path.resolve(process.cwd(), "out", config.lessonId);
  const bboxPath = path.join(outDir, "bbox-manifest.json");
  const sheetPath = path.join(outDir, `${config.lessonId}-contact.png`);
  const primitivesDir = path.join(outDir, "primitive-checks");

  // Review artifacts first (always produced), then the gate passes last so a
  // gate-fail exit still leaves the contact sheet + primitive stills to review.
  run("Contact sheet", "node", [
    "scripts/make-contact-sheet.mjs",
    "--config",
    args.config,
  ]);
  run("Primitive checks", "node", [
    "scripts/lesson-primitive-checks.mjs",
    "--config",
    args.config,
  ]);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Lesson QC artifacts for ${config.lessonId}`);
  console.log("=".repeat(60));
  console.log(`  bbox manifest:    ${path.relative(process.cwd(), bboxPath)} (.measured block)`);
  console.log(`  contact sheet:    ${path.relative(process.cwd(), sheetPath)}`);
  console.log(`  primitive checks: ${path.relative(process.cwd(), primitivesDir)}`);

  // The MEASURED pass IS the bbox check — there is no separate fast linear pass.
  // The manifest is metadata-only ({id,zone}); geometry comes from the render
  // (getBBox), one source of truth. It bundles the lesson, SSR-renders the
  // motion-peak frames, and runs the overlap + bijection + caption + LUFS gates,
  // writing bbox-manifest.json. Run LAST: it exits 1 on a hard-gate failure
  // (bbox-binding / LUFS), and that exit propagates through `run` so a failing
  // lesson cannot read as green. `--measured` is accepted for back-compat but is
  // now a no-op (this always runs).
  run("Measured pass", "node", [
    "scripts/lesson-measured.mjs",
    "--config",
    args.config,
  ]);

  // Adoption-lint violations are a hard gate too (deterministic static check,
  // sanctioned escape hatch already accounted for above) — but run LAST, same
  // reasoning as the measured pass: a failing lesson still leaves every review
  // artifact on disk.
  if (!lints.passed) {
    throw new Error(
      "Adoption lint violations found (see above) — fix or record a pipelineFinding.",
    );
  }
};

// Only auto-run when this file is the CLI entry point — importing it (e.g.
// from a test) must not trigger `main()`.
const isCliEntry =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCliEntry) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
