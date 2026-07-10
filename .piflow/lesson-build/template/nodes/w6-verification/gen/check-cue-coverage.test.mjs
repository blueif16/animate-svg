// Run: node --test .piflow/lesson-build/template/nodes/w6-verification/gen/check-cue-coverage.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCueCoverage } from "./check-cue-coverage.mjs";

const CUES = [{ id: "a" }, { id: "b" }, { id: "c" }];

test("every cue ordinal cited in a markdown table row → pass", () => {
  const text = "| cue | note |\n|---|---|\n| 1 | ok |\n| 2 | ok |\n| 3 | ok |\n";
  const r = checkCueCoverage({ cues: CUES, verificationText: text });
  assert.equal(r.verdict, "pass");
  assert.deepEqual(r.missing, []);
});

test("a silently-dropped cue is caught (the omission this measure exists for)", () => {
  const text = "| cue | note |\n|---|---|\n| 1 | ok |\n| 3 | ok |\n"; // cue 2 never addressed
  const r = checkCueCoverage({ cues: CUES, verificationText: text });
  assert.equal(r.verdict, "fail");
  assert.equal(r.missing.length, 1);
  assert.equal(r.missing[0].ordinal, 2);
  assert.equal(r.missing[0].id, "b");
});

test("an ordinal substring must NOT false-match (cue 1 does not satisfy cue 11)", () => {
  const manyCues = Array.from({ length: 11 }, (_, i) => ({ id: `c${i}` }));
  const rows = Array.from({ length: 10 }, (_, i) => `| ${i + 1} | ok |`).join("\n"); // 1..10 only, 11 missing
  const text = `| cue | note |\n|---|---|\n${rows}\n`;
  const r = checkCueCoverage({ cues: manyCues, verificationText: text });
  assert.equal(r.verdict, "fail");
  assert.equal(r.missing.length, 1);
  assert.equal(r.missing[0].ordinal, 11);
});

test("empty verification.md → every cue reports missing (an honest fail, not a crash)", () => {
  const r = checkCueCoverage({ cues: CUES, verificationText: "" });
  assert.equal(r.verdict, "fail");
  assert.equal(r.missing.length, 3);
});

test("no cues declared → not-applicable pass (never a false fail)", () => {
  const r = checkCueCoverage({ cues: [], verificationText: "anything" });
  assert.equal(r.applicable, false);
  assert.equal(r.verdict, "pass");
});

// ── the proven adversarial evasion: ANY numbered table, unrelated to cues, satisfying ordinals by chance ──

test("an unrelated numbered table with NO 'cue' header must NOT satisfy coverage (the proven evasion)", () => {
  const text = "| # | reference |\n|---|---|\n| 1 | some doc |\n| 2 | another doc |\n| 3 | a third doc |\n";
  const r = checkCueCoverage({ cues: CUES, verificationText: text });
  assert.equal(r.verdict, "fail");
  assert.equal(r.missing.length, 3);
  assert.deepEqual(r.missing.map((m) => m.ordinal), [1, 2, 3]);
});

test("a numbered TOC/frame-index section (no 'cue' column) does not launder coverage even alongside a real cue table", () => {
  const text = [
    "| # | frame |",
    "|---|---|",
    "| 1 | 18 |",
    "| 2 | 210 |",
    "| 3 | 640 |",
    "",
    "| cue | discovery | taught? |",
    "|---|---|---|",
    "| 1 | a | ✓ |",
    // cue 2 and 3 dropped from the REAL cue table — only the unrelated frame-index table has them
  ].join("\n");
  const r = checkCueCoverage({ cues: CUES, verificationText: text });
  assert.equal(r.verdict, "fail");
  assert.deepEqual(r.missing.map((m) => m.ordinal), [2, 3]);
});

test("real report shape: multiple genuine 'cue'-headed tables (§3 text-vs-audio + §5 pedagogy) both count → pass", () => {
  const text = [
    "| cue | spoken phrase | on-screen strings | ⊆? |",
    "|---|---|---|---|",
    "| 1 | a | a | ✓ |",
    "| 2 | b | b | ✓ |",
    "| 3 | c | c | ✓ |",
    "",
    "| cue | discovery | taught? | evidence |",
    "|---|---|---|---|",
    "| 1 | x | ✓ | e1 |",
    "| 2 | y | ✓ | e2 |",
    "| 3 | z | ✓ | e3 |",
  ].join("\n");
  const r = checkCueCoverage({ cues: CUES, verificationText: text });
  assert.equal(r.verdict, "pass");
  assert.deepEqual(r.missing, []);
});
