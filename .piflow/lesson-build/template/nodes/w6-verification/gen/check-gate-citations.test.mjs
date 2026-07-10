// Run: node --test .piflow/lesson-build/template/nodes/w6-verification/gen/check-gate-citations.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkGateCitations } from "./check-gate-citations.mjs";

test("all-clean bbox-manifest summary → pass with zero signals (the common case)", () => {
  const r = checkGateCitations({
    summary: { gatesFailed: [], measuredCollisionCount: 0, captionIntrusionCount: 0 },
    verificationText: "nothing to say",
  });
  assert.equal(r.verdict, "pass");
  assert.deepEqual(r.signals, []);
});

test("a failed gate CITED in the report (real fenyuhe-six pattern) → pass", () => {
  const r = checkGateCitations({
    summary: { gatesFailed: ["captionRedundancy"], measuredCollisionCount: 0, captionIntrusionCount: 0 },
    verificationText: "| captionRedundancy | jaccard=1.0 for all 9 cues | WARN | false positive — on-screen bond glyphs are a SUBSET of the spoken phrase |",
  });
  assert.equal(r.verdict, "pass");
  assert.equal(r.missing.length, 0);
});

test("a failed gate SILENTLY ACCEPTED — never mentioned — is caught (the exact defect this measure exists for)", () => {
  const r = checkGateCitations({
    summary: { gatesFailed: ["contrast"], measuredCollisionCount: 0, captionIntrusionCount: 0 },
    verificationText: "Everything looks great, no issues here.",
  });
  assert.equal(r.verdict, "fail");
  assert.equal(r.missing.length, 1);
  assert.equal(r.missing[0].kind, "gatesFailed");
});

test("a measured collision must be mentioned (not just a gatesFailed string)", () => {
  const r = checkGateCitations({
    summary: { gatesFailed: [], measuredCollisionCount: 7, captionIntrusionCount: 0 },
    verificationText: "namecard-sam ∩ rah-slow measured overlap (ratio 0.364) — justified as by-design adjacency.",
  });
  assert.equal(r.verdict, "pass");
});

test("a nonzero caption-intrusion count with no mention at all fails", () => {
  const r = checkGateCitations({
    summary: { gatesFailed: [], measuredCollisionCount: 0, captionIntrusionCount: 29 },
    verificationText: "The lesson is great, ship it.",
  });
  assert.equal(r.verdict, "fail");
  assert.equal(r.missing[0].kind, "captionIntrusionCount");
});

test("no bbox-manifest summary at all → not-applicable, never a crash", () => {
  const r = checkGateCitations({ summary: null, verificationText: "" });
  assert.equal(r.verdict, "pass");
  assert.deepEqual(r.signals, []);
});
