// Self-contained runnable test for the adoption lints in lesson-check.mjs
// (research/remotion-vendor-best-practices-2026-07-03.md §5 opportunities
// #3 + #14). No test framework is installed; this uses node:assert/strict
// and runs via:
//   node scripts/lesson-check.test.mjs      (or: npm run test:adoption-lints)
// It exits non-zero on the first failed assertion (assert throws) and prints
// a one-line pass summary on success — same convention as
// src/layout/fitToZone.test.ts.

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  checkPropAdoption,
  commentBlockAbove,
  extractSelfClosingTags,
  extractStatement,
  hasEscapeHatchEvidence,
  resolveLayoutImports,
  resolvesViaApi,
  toKebabLessonId,
} from "./lesson-check.mjs";

let passes = 0;
const check = (label, fn) => {
  fn();
  passes += 1;
  // eslint-disable-next-line no-console
  console.log(`  ok  ${label}`);
};

// ─── toKebabLessonId ─────────────────────────────────────────────────────
check("toKebabLessonId converts camelCase folder names to kebab-case ids", () => {
  assert.equal(toKebabLessonId("kptestFirstSecondThird"), "kptest-first-second-third");
  assert.equal(toKebabLessonId("kp2CountingByTens"), "kp2-counting-by-tens");
  assert.equal(toKebabLessonId("kptestCountToTwo"), "kptest-count-to-two");
});

// ─── extractStatement ────────────────────────────────────────────────────
check("extractStatement captures a simple single-line statement", () => {
  const src = "export const FOO = 48; // trailing comment\nexport const BAR = 1;";
  const stmt = extractStatement(src, src.indexOf("export const FOO"));
  assert.equal(stmt, "export const FOO = 48;");
});

check("extractStatement handles a multi-line object literal (bracket depth)", () => {
  const src = [
    "const ZONE = {",
    "  x: 1,",
    "  y: 2,",
    "};",
    "export const NEXT = 1;",
  ].join("\n");
  const stmt = extractStatement(src, src.indexOf("const ZONE"));
  assert.equal(stmt, "const ZONE = {\n  x: 1,\n  y: 2,\n};");
});

check("extractStatement handles a nested call with commas/semicolons inside", () => {
  const src = 'export const FIT = fitUnitsToZone({x:1,y:2,width:3,height:4}, 2);\nexport const X = 1;';
  const stmt = extractStatement(src, src.indexOf("export const FIT"));
  assert.equal(stmt, "export const FIT = fitUnitsToZone({x:1,y:2,width:3,height:4}, 2);");
});

// ─── commentBlockAbove ───────────────────────────────────────────────────
check("commentBlockAbove captures a contiguous // block directly above the declaration", () => {
  const src = [
    "export const OTHER = 1;",
    "// PIPELINE FINDING: this is why.",
    "// second line of the finding.",
    "export const TARGET = 2;",
  ].join("\n");
  const comment = commentBlockAbove(src, src.indexOf("export const TARGET"));
  assert.ok(comment.includes("PIPELINE FINDING"));
  assert.ok(comment.includes("second line"));
  assert.ok(!comment.includes("OTHER"));
});

check("commentBlockAbove returns empty when the preceding line is code, not a comment", () => {
  const src = "export const OTHER = 1;\nexport const TARGET = 2;";
  const comment = commentBlockAbove(src, src.indexOf("export const TARGET"));
  assert.equal(comment.trim(), "");
});

// ─── resolvesViaApi (direct + transitive) ────────────────────────────────
const ONSET_API = ["stepFramesFromOnsets", "tokenOnsetFrame"];
const ZONE_API = ["fitUnitsToZone"];

check("resolvesViaApi is false for a bare hand-picked literal", () => {
  const src = "export const SWEEP_STEP_FRAMES = 48;";
  assert.equal(resolvesViaApi(src, "SWEEP_STEP_FRAMES", ONSET_API), false);
});

check("resolvesViaApi is true when the identifier's OWN statement calls the API", () => {
  const src = "export const APPLE_FIT = fitUnitsToZone(APPLE_ZONE, 2);";
  assert.equal(resolvesViaApi(src, "APPLE_FIT", ZONE_API), true);
});

check("resolvesViaApi is true TRANSITIVELY (identifier references a helper that calls the API)", () => {
  // Mirrors the real kptestCountToTwo shape: APPLE_SIZE references APPLE_FIT,
  // which calls fitUnitsToZone — APPLE_SIZE's own statement never mentions
  // the API by name.
  const src = [
    "export const APPLE_FIT = fitUnitsToZone(APPLE_ZONE, 2);",
    "export const APPLE_SIZE = APPLE_FIT.unit;",
  ].join("\n");
  assert.equal(resolvesViaApi(src, "APPLE_SIZE", ZONE_API), true);
});

check("resolvesViaApi does not chase an identifier not defined in this file (no false positive)", () => {
  const src = "export const SWEEP_STEP_FRAMES = SOME_IMPORTED_CONST;";
  assert.equal(resolvesViaApi(src, "SWEEP_STEP_FRAMES", ONSET_API), false);
});

// ─── hasEscapeHatchEvidence ───────────────────────────────────────────────
let tmpRoot;
const makeTmpFixture = () => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-check-test-"));
  const lessonDataDir = path.join(tmpRoot, "lesson-data");
  return lessonDataDir;
};
const cleanupTmp = () => {
  if (tmpRoot) fs.rmSync(tmpRoot, { recursive: true, force: true });
  tmpRoot = undefined;
};

check("hasEscapeHatchEvidence finds a comment-recorded finding directly on the declaration", () => {
  const lessonDataDir = makeTmpFixture();
  const src = [
    "// PIPELINE FINDING: onsets unavailable for this fixture; fallback below.",
    "export const SWEEP_STEP_FRAMES = 48;",
  ].join("\n");
  const result = hasEscapeHatchEvidence(src, "SWEEP_STEP_FRAMES", lessonDataDir, "demo-lesson", /onset/i);
  assert.ok(result, "expected a comment-based escape hatch to be found");
  assert.equal(result.evidence, "layout.ts comment");
  cleanupTmp();
});

check("hasEscapeHatchEvidence returns null when nothing justifies the fallback", () => {
  const lessonDataDir = makeTmpFixture();
  const src = "export const SWEEP_STEP_FRAMES = 48; // just a comment, no finding";
  const result = hasEscapeHatchEvidence(src, "SWEEP_STEP_FRAMES", lessonDataDir, "demo-lesson", /onset/i);
  assert.equal(result, null);
  cleanupTmp();
});

check("hasEscapeHatchEvidence finds a finding logged in lesson-data/<id>/_logs/*.md", () => {
  const lessonDataDir = makeTmpFixture();
  const logsDir = path.join(lessonDataDir, "demo-lesson", "_logs");
  fs.mkdirSync(logsDir, { recursive: true });
  fs.writeFileSync(
    path.join(logsDir, "compose.md"),
    "## PIPELINE FINDINGS\n\n1. SWEEP_STEP_FRAMES falls back: onsets unavailable this run.\n",
  );
  const src = "export const SWEEP_STEP_FRAMES = 48;";
  const result = hasEscapeHatchEvidence(src, "SWEEP_STEP_FRAMES", lessonDataDir, "demo-lesson", /onset/i);
  assert.ok(result, "expected a _logs-based escape hatch to be found");
  assert.equal(result.evidence, "lesson-data/demo-lesson/_logs/compose.md");
  cleanupTmp();
});

check("hasEscapeHatchEvidence via _logs REQUIRES the identifier's own name (no laundering via an unrelated finding)", () => {
  // Regression case: a per-wave log almost always has a "## PIPELINE
  // FINDINGS" boilerplate heading, and frequently mentions the hint keyword
  // for a totally unrelated cue. Evidence for identifier X must not be
  // satisfied by a finding that never mentions X.
  const lessonDataDir = makeTmpFixture();
  const logsDir = path.join(lessonDataDir, "demo-lesson", "_logs");
  fs.mkdirSync(logsDir, { recursive: true });
  fs.writeFileSync(
    path.join(logsDir, "storyboard.md"),
    "## PIPELINE FINDINGS\n\n1. Some UNRELATED_CONSTANT has an onset timing risk.\n",
  );
  const src = "export const SWEEP_STEP_FRAMES = 48;";
  const result = hasEscapeHatchEvidence(src, "SWEEP_STEP_FRAMES", lessonDataDir, "demo-lesson", /onset/i);
  assert.equal(result, null, "an unrelated finding must not suppress this identifier's violation");
  cleanupTmp();
});

check("hasEscapeHatchEvidence for the zone lint requires the literal API name, not just the word 'zone'", () => {
  // Regression case: this codebase's OWN pre-fix APPLE_SIZE comment said
  // "Recorded as a pipeline finding (visual-design zone sizes vs.
  // implementation)" — mentions "zone" but never names fitUnitsToZone. That
  // must NOT count as an escape hatch (the whole point of opportunity #14 is
  // that this exact comment was insufficient justification to skip adoption).
  const lessonDataDir = makeTmpFixture();
  const src = [
    "// Recorded as a pipeline finding (visual-design zone sizes vs. implementation).",
    "export const APPLE_SIZE = 115;",
  ].join("\n");
  const result = hasEscapeHatchEvidence(src, "APPLE_SIZE", lessonDataDir, "demo-lesson", /fitunitstozone/i);
  assert.equal(result, null, "a generic 'zone' mention must not excuse a hand-picked size");
  cleanupTmp();
});

// ─── extractSelfClosingTags ───────────────────────────────────────────────
check("extractSelfClosingTags finds a self-closing JSX element by tag name", () => {
  const src = [
    "<g>",
    '  <CountableObject variant="fruit" size={APPLE_SIZE} x={1} y={2} />',
    "</g>",
  ].join("\n");
  const chunks = extractSelfClosingTags(src, ["CountableObject"]);
  assert.equal(chunks.length, 1);
  assert.ok(chunks[0].text.includes("size={APPLE_SIZE}"));
});

check("extractSelfClosingTags ignores an unrelated component's size prop", () => {
  const src = '<NumberCard size={84} />';
  const chunks = extractSelfClosingTags(src, ["CountableObject"]);
  assert.equal(chunks.length, 0);
});

// ─── resolveLayoutImports ─────────────────────────────────────────────────
check("resolveLayoutImports parses a `from \"./<folder>/layout\"` import", () => {
  const src = 'import {\n  APPLE_SIZE,\n  APPLE_1_CX,\n} from "./kptestCountToTwo/layout";\n';
  const imports = resolveLayoutImports(src, "/repo/src/lessons");
  assert.equal(imports.length, 1);
  assert.deepEqual(imports[0].names, ["APPLE_SIZE", "APPLE_1_CX"]);
  assert.equal(imports[0].layoutPath, path.join("/repo/src/lessons", "kptestCountToTwo", "layout.ts"));
});

// ─── checkPropAdoption (end-to-end against a temp fixture tree) ──────────
const writeLessonFixture = (root, { folder, layoutSource, sceneSource, logs }) => {
  const lessonsDir = path.join(root, "lessons");
  fs.mkdirSync(path.join(lessonsDir, folder), { recursive: true });
  fs.writeFileSync(path.join(lessonsDir, folder, "layout.ts"), layoutSource);
  fs.writeFileSync(path.join(lessonsDir, `${folder}LessonScene.tsx`), sceneSource);
  if (logs) {
    const logsDir = path.join(root, "lesson-data", toKebabLessonId(folder), "_logs");
    fs.mkdirSync(logsDir, { recursive: true });
    for (const [name, content] of Object.entries(logs)) {
      fs.writeFileSync(path.join(logsDir, name), content);
    }
  }
  return lessonsDir;
};

check("checkPropAdoption flags a hand-picked constant feeding stepDurationFrames", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-check-e2e-"));
  const lessonsDir = writeLessonFixture(root, {
    folder: "demoLesson",
    layoutSource: "export const SWEEP_STEP_FRAMES = 48;\n",
    sceneSource:
      'import { SWEEP_STEP_FRAMES } from "./demoLesson/layout";\n' +
      "<OrderedRowSpotlight stepDurationFrames={SWEEP_STEP_FRAMES} />;\n",
  });
  const result = checkPropAdoption({
    lessonsDir,
    lessonDataDir: path.join(root, "lesson-data"),
    label: "spoken-sync-step",
    propRe: /\bstepDurationFrames\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g,
    tagNames: null,
    apiNames: ONSET_API,
    hintRe: /onset/i,
  });
  assert.equal(result.checked, 1);
  assert.equal(result.violations.length, 1);
  assert.equal(result.violations[0].identifier, "SWEEP_STEP_FRAMES");
  fs.rmSync(root, { recursive: true, force: true });
});

check("checkPropAdoption is clean when the constant is derived from the sanctioned API", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-check-e2e-"));
  const lessonsDir = writeLessonFixture(root, {
    folder: "demoLesson",
    layoutSource:
      "export const FIT = fitUnitsToZone(ZONE, 2);\n" +
      "export const APPLE_SIZE = FIT.unit;\n",
    sceneSource:
      'import { APPLE_SIZE } from "./demoLesson/layout";\n' +
      "<CountableObject variant=\"fruit\" size={APPLE_SIZE} x={0} y={0} />;\n",
  });
  const result = checkPropAdoption({
    lessonsDir,
    lessonDataDir: path.join(root, "lesson-data"),
    label: "countable-unit-size",
    propRe: /\bsize\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g,
    tagNames: ["CountableObject"],
    apiNames: ZONE_API,
    hintRe: /fitunitstozone/i,
  });
  assert.equal(result.checked, 1);
  assert.equal(result.violations.length, 0);
  fs.rmSync(root, { recursive: true, force: true });
});

check("checkPropAdoption is clean when a recorded pipelineFinding justifies the fallback", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-check-e2e-"));
  const lessonsDir = writeLessonFixture(
    root,
    {
      folder: "demoLesson",
      layoutSource:
        "// PIPELINE FINDING: onsets unavailable this fixture; fallback cadence below.\n" +
        "export const SWEEP_STEP_FRAMES = 48;\n",
      sceneSource:
        'import { SWEEP_STEP_FRAMES } from "./demoLesson/layout";\n' +
        "<OrderedRowSpotlight stepDurationFrames={SWEEP_STEP_FRAMES} />;\n",
    },
  );
  const result = checkPropAdoption({
    lessonsDir,
    lessonDataDir: path.join(root, "lesson-data"),
    label: "spoken-sync-step",
    propRe: /\bstepDurationFrames\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g,
    tagNames: null,
    apiNames: ONSET_API,
    hintRe: /onset/i,
  });
  assert.equal(result.checked, 1);
  assert.equal(result.violations.length, 0);
  fs.rmSync(root, { recursive: true, force: true });
});

// ─── real-fixture smoke test (guards the ACTUAL two lesson files this fix
// landed in — a regression here would mean the repo's own fixtures broke) ──
check("the real kptestFirstSecondThird + kptestCountToTwo fixtures are adoption-lint clean", () => {
  const lessonsDir = path.join(process.cwd(), "src", "lessons");
  const lessonDataDir = path.join(process.cwd(), "lesson-data");
  if (!fs.existsSync(path.join(lessonsDir, "kptestFirstSecondThird", "layout.ts"))) {
    console.log("  SKIP (real fixture not present in this checkout)");
    return;
  }
  const onset = checkPropAdoption({
    lessonsDir,
    lessonDataDir,
    label: "spoken-sync-step",
    propRe: /\bstepDurationFrames\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g,
    tagNames: null,
    apiNames: ONSET_API,
    hintRe: /onset/i,
  });
  const zone = checkPropAdoption({
    lessonsDir,
    lessonDataDir,
    label: "countable-unit-size",
    propRe: /\bsize\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}/g,
    tagNames: ["CountableObject"],
    apiNames: ZONE_API,
    hintRe: /fitunitstozone/i,
  });
  assert.deepEqual(onset.violations, []);
  assert.deepEqual(zone.violations, []);
});

// eslint-disable-next-line no-console
console.log(`\n${passes} adoption-lint test(s) passed.`);
