// Self-contained runnable test for the cue-id accessor factory.
// No test framework is installed; this uses node:assert/strict and runs via
//   npx tsx src/lessons/_cues/cueAccessors.test.ts   (or: npm run test:cues)
// It exits non-zero on the first failed assertion and prints a pass summary.
//
// THE BEHAVIOR UNDER TEST (self-scan C3): a wrong/stale cue id must THROW, not
// silently resolve to frame 0. Red demo: replace the throw in cueAccessors.ts
// with the old `?? 0` fallback and re-run — test (b)/(c) go red because the
// accessor returns 0 instead of throwing (captured in the lane's report).

import assert from "node:assert/strict";

import type { AlignedLessonCue } from "@studio/narration-kit";
import { makeCueAccessors } from "./cueAccessors";

let passes = 0;
const check = (label: string, fn: () => void): void => {
  fn();
  passes += 1;
  console.log(`  ok  ${label}`);
};

// A minimal reconciled-cue pair (only the fields the accessor reads matter).
const cue = (id: string, startFrame: number, endFrame: number): AlignedLessonCue => ({
  id,
  caption: id,
  phrase: id,
  confidence: "clip-measured",
  startFrame,
  endFrame,
  startSeconds: startFrame / 30,
  endSeconds: endFrame / 30,
});

const CUES: AlignedLessonCue[] = [
  cue("announce-topic", 0, 75),
  cue("cue-1-count", 75, 259),
  cue("cue-2-cardinality", 259, 448),
];

// (a) a present id resolves to its exact start/end frame (the happy path still works).
check("(a) present id → exact startFrame / endFrame", () => {
  const { cStart, cEnd, cueOf } = makeCueAccessors(CUES);
  assert.equal(cStart("cue-1-count"), 75);
  assert.equal(cEnd("cue-1-count"), 259);
  assert.equal(cueOf("cue-2-cardinality").startFrame, 259);
});

// (b) THE core guard: an absent id THROWS (does NOT return 0). This is the
//     assertion that goes RED against the old `?? 0` behavior.
check("(b) absent id THROWS instead of silently returning 0", () => {
  const { cStart } = makeCueAccessors(CUES);
  assert.throws(
    () => cStart("first-apple-one"),
    /unknown cue id "first-apple-one"/,
    "cStart must THROW on an unknown id, not resolve to frame 0",
  );
});

// (c) the throw NAMES the missing id AND LISTS the valid ids (so the failure is
//     self-diagnosing, per the discipline law "silent passes are forbidden").
check("(c) throw message names the missing id AND lists the valid ids", () => {
  const { cEnd } = makeCueAccessors(CUES);
  let message = "";
  try {
    cEnd("cardinality");
  } catch (error) {
    message = (error as Error).message;
  }
  assert.ok(message.includes("cardinality"), "names the missing id");
  assert.ok(message.includes("announce-topic"), "lists valid id announce-topic");
  assert.ok(message.includes("cue-1-count"), "lists valid id cue-1-count");
  assert.ok(message.includes("cue-2-cardinality"), "lists valid id cue-2-cardinality");
});

// (d) an explicit union list is exposed as `cueIds` (the emitted vocabulary),
//     and an absent id STILL throws even when the union claims it (drift guard).
check("(d) declared union id absent from cues still THROWS (drift guard)", () => {
  const validIds = ["announce-topic", "cue-1-count", "cue-2-cardinality", "ghost"] as const;
  const { cStart, cueIds } = makeCueAccessors(CUES, validIds);
  assert.deepEqual([...cueIds], [...validIds]);
  assert.throws(
    () => cStart("ghost"),
    /unknown cue id "ghost"/,
    "a well-typed id that is absent from the reconciled cues must still THROW",
  );
});

console.log(`\ncueAccessors: ${passes}/${passes} checks passing`);
