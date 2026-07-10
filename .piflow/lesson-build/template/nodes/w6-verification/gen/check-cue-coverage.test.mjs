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
  const text = Array.from({ length: 10 }, (_, i) => `| ${i + 1} |`).join("\n"); // 1..10 only, 11 missing
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
