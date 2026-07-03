// Self-contained runnable test for the concurrent-audio budget assertion.
// No test framework is installed; uses node:assert/strict and runs via
//   npx tsx src/lesson-media/LessonSfxLayer.test.ts   (or: npm run test:sfx-budget)
// Exits non-zero on the first failed assertion; prints a one-line pass
// summary + the verbatim throw message on success.

import assert from "node:assert/strict";
import type { SfxEvent } from "@studio/sound-kit";
import {
  assertConcurrentAudioBudget,
  MAX_CONCURRENT_AUDIO,
  sampleAudioEvents,
} from "./LessonSfxLayer";

let passes = 0;
const check = (label: string, fn: () => void): void => {
  fn();
  passes += 1;
  console.log(`  ok  ${label}`);
};

// (RED) A dense over-budget schedule: 20 "tick" events firing 1 frame apart
// (100..119) — the shape an UN-sampled per-item counted reveal would produce
// (e.g. one tick per counted object with no sampling). With the default
// DEFAULT_SFX_WINDOW_FRAMES=30 audible window, every one of these overlaps
// every other, so the peak concurrency (20) blows MAX_CONCURRENT_AUDIO (6).
const overBudget: SfxEvent[] = Array.from({ length: 20 }, (_, i) => ({
  sound: "tick" as const,
  fromFrame: 100 + i,
}));

check(
  "(red) throws on an over-budget schedule, naming frame + count + budget",
  () => {
    let thrown: Error | undefined;
    try {
      assertConcurrentAudioBudget(overBudget);
    } catch (e) {
      thrown = e as Error;
    }
    assert.ok(thrown, "expected assertConcurrentAudioBudget to throw");
    assert.match(thrown!.message, /concurrent-audio budget exceeded/);
    assert.match(
      thrown!.message,
      new RegExp(`MAX_CONCURRENT_AUDIO=${MAX_CONCURRENT_AUDIO}`),
    );
    console.log(`      verbatim: ${thrown!.message}`);
  },
);

// (GREEN) The schedule SHAPE our current wiring actually ships today —
// CompleteKptestFenyuheSixLesson.tsx builds exactly two motivated SFX
// (a "ta-da" reward + a "chime" at recap) spread hundreds of frames apart
// across the whole lesson, never concurrent. Reconstructed here (not a live
// import — sfxEvents is built inside that file's component function, not
// exported) from its real fromFrame/sound/volume shape.
const currentWiring: SfxEvent[] = [
  { sound: "ta-da", fromFrame: 512, volume: 0.55 },
  { sound: "chime", fromFrame: 890, volume: 0.5 },
];

check("(green) current wiring's sparse schedule passes the budget", () => {
  assert.doesNotThrow(() => assertConcurrentAudioBudget(currentWiring));
});

check(
  "(green) sampling a dense schedule down to the budget then re-checking passes",
  () => {
    const thinned = sampleAudioEvents(overBudget, MAX_CONCURRENT_AUDIO);
    assert.equal(thinned.length, MAX_CONCURRENT_AUDIO);
    assert.doesNotThrow(() => assertConcurrentAudioBudget(thinned));
  },
);

check(
  "(green) sampling is deterministic (no Math.random) — same input, same output",
  () => {
    const a = sampleAudioEvents(overBudget, MAX_CONCURRENT_AUDIO);
    const b = sampleAudioEvents(overBudget, MAX_CONCURRENT_AUDIO);
    assert.deepEqual(a, b);
  },
);

console.log(`\n${passes} check(s) passed.`);
