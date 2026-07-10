// Run: node --test .piflow/lesson-build/template/nodes/w6-verification/gen/check-bbox-overlay-produced.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkBboxOverlayProduced } from "./check-bbox-overlay-produced.mjs";

test("overlay pngs present → pass (lesson:bbox was run, per the real kptest-count-to-two fixture: 4 pngs)", () => {
  const r = checkBboxOverlayProduced({ files: ["f52-bbox.png", "f139-bbox.png", "f239-bbox.png", "f350-bbox.png"] });
  assert.equal(r.verdict, "pass");
  assert.equal(r.pngCount, 4);
});

test("directory does not exist → fail (the REVIEW SURFACE law was skipped, not silently passed)", () => {
  const r = checkBboxOverlayProduced({ files: null });
  assert.equal(r.verdict, "fail");
  assert.equal(r.pngCount, 0);
});

test("directory exists but is empty (or holds only non-png files) → fail, not a silent pass", () => {
  const r = checkBboxOverlayProduced({ files: ["report.json", "notes.txt"] });
  assert.equal(r.verdict, "fail");
  assert.equal(r.pngCount, 0);
});
