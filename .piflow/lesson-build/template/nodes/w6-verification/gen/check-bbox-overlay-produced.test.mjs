// Run: node --test .piflow/lesson-build/template/nodes/w6-verification/gen/check-bbox-overlay-produced.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkBboxOverlayProduced } from "./check-bbox-overlay-produced.mjs";

test("overlay pngs present AND fresh (mtime >= this node's own startedAt) → pass (lesson:bbox ran DURING this node)", () => {
  const nodeStartedAt = 1_000_000;
  const r = checkBboxOverlayProduced({
    files: ["f52-bbox.png", "f139-bbox.png", "f239-bbox.png", "f350-bbox.png"],
    statTimes: {
      "f52-bbox.png": 1_000_500,
      "f139-bbox.png": 1_000_600,
      "f239-bbox.png": 1_000_700,
      "f350-bbox.png": 1_000_800,
    },
    nodeStartedAt,
  });
  assert.equal(r.verdict, "pass");
  assert.equal(r.pngCount, 4);
  assert.equal(r.freshCount, 4);
});

test("directory does not exist → fail (the REVIEW SURFACE law was skipped, not silently passed)", () => {
  const r = checkBboxOverlayProduced({ files: null, statTimes: {}, nodeStartedAt: 1_000_000 });
  assert.equal(r.verdict, "fail");
  assert.equal(r.pngCount, 0);
});

test("directory exists but is empty (or holds only non-png files) → fail, not a silent pass", () => {
  const r = checkBboxOverlayProduced({ files: ["report.json", "notes.txt"], statTimes: {}, nodeStartedAt: 1_000_000 });
  assert.equal(r.verdict, "fail");
  assert.equal(r.pngCount, 0);
});

// ── the proven adversarial evasion: PNGs exist but are an upstream (w4a-composer) side effect, never
// refreshed by w6-verification's OWN run — the mis-targeted-artifact hole named by the adversarial pass.

test("PNGs present but ALL predate this node's own run → fail (stale w4a-composer side effect, the proven evasion)", () => {
  const nodeStartedAt = 5_000_000; // w6-verification started AFTER these files were last written
  const r = checkBboxOverlayProduced({
    files: ["f52-bbox.png", "f139-bbox.png"],
    statTimes: {
      "f52-bbox.png": 1_000_000, // written by w4a-composer's own self-check, long before w6 ran
      "f139-bbox.png": 2_000_000,
    },
    nodeStartedAt,
  });
  assert.equal(r.verdict, "fail");
  assert.equal(r.pngCount, 2);
  assert.equal(r.freshCount, 0);
  assert.match(r.reason, /predates this node's own run/);
});

test("a mix of stale (upstream) and fresh (this node's own) PNGs still passes on the fresh evidence", () => {
  const nodeStartedAt = 5_000_000;
  const r = checkBboxOverlayProduced({
    files: ["f52-bbox.png", "f139-bbox.png"],
    statTimes: {
      "f52-bbox.png": 1_000_000, // stale, from w4a-composer
      "f139-bbox.png": 5_500_000, // fresh — w6-verification's own re-run of lesson:bbox
    },
    nodeStartedAt,
  });
  assert.equal(r.verdict, "pass");
  assert.equal(r.freshCount, 1);
});

test("this node's own startedAt is unavailable → fail-closed, never a silent pass on directory presence alone", () => {
  const r = checkBboxOverlayProduced({
    files: ["f52-bbox.png"],
    statTimes: { "f52-bbox.png": 1_000_000 },
    nodeStartedAt: null,
  });
  assert.equal(r.verdict, "fail");
  assert.match(r.reason, /startedAt is unavailable/);
});
