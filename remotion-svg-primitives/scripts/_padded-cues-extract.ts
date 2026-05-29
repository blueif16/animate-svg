// Run via tsx as a subprocess from .mjs scripts.
// Args: <camelLessonId> [--raw]
// Stdout JSON: {
//   fps, totalDuration,
//   cues: [{ id, startFrame, endFrame, narrationStartFrame, narrationEndFrame, source: "padded" | "raw" }]
// }
//
// Resolution order for the cue source:
//   1) src/lessons/<camelLessonId>LessonTimeline.ts → export <camelLessonId>Cues (padded)
//      Narration window comes from the matching raw cue in the same module's
//      import of generated/<camelLessonId>Timing.ts.
//   2) src/lessons/generated/<camelLessonId>Timing.ts → <camelLessonId>AlignedCues (raw)
//      Narration window IS the cue window.
//
// Pass --raw to force #2.
import { pathToFileURL } from "node:url";
import path from "node:path";

const camelLessonId = process.argv[2];
const forceRaw = process.argv.includes("--raw");

if (!camelLessonId) {
  console.error("usage: _padded-cues-extract.ts <camelLessonId> [--raw]");
  process.exit(1);
}

const cwd = process.cwd();
const timelinePath = path.resolve(
  cwd,
  "src",
  "lessons",
  `${camelLessonId}LessonTimeline.ts`,
);
const rawPath = path.resolve(
  cwd,
  "src",
  "lessons",
  "generated",
  `${camelLessonId}Timing.ts`,
);

type Cue = {
  id: string;
  startFrame: number;
  endFrame: number;
};

const main = async () => {
  // Always load raw aligned cues for the narration-window reference.
  const rawMod = await import(pathToFileURL(rawPath).href);
  const rawCuesKey = `${camelLessonId}AlignedCues`;
  const rawDurationKey = `${camelLessonId}AlignedDuration`;
  const rawCues: Cue[] = rawMod[rawCuesKey];
  const rawDuration: number = rawMod[rawDurationKey];
  if (!Array.isArray(rawCues)) {
    throw new Error(`raw timing missing export ${rawCuesKey}`);
  }
  const narrationByCueId = new Map<string, [number, number]>(
    rawCues.map((c) => [c.id, [c.startFrame, c.endFrame]]),
  );

  let cues: Cue[] = rawCues;
  let totalDuration = rawDuration;
  let source: "padded" | "raw" = "raw";

  if (!forceRaw) {
    try {
      const timelineMod = await import(pathToFileURL(timelinePath).href);
      const paddedKey = `${camelLessonId}Cues`;
      const durKey = `${camelLessonId}Duration`;
      if (Array.isArray(timelineMod[paddedKey])) {
        cues = timelineMod[paddedKey];
        totalDuration = timelineMod[durKey] ?? cues[cues.length - 1].endFrame;
        source = "padded";
      }
    } catch {
      // Timeline file may not exist (lesson without padding). Fall back to raw.
    }
  }

  const out = {
    camelLessonId,
    fps: 30,
    totalDuration,
    source,
    cues: cues.map((cue) => {
      const narration = narrationByCueId.get(cue.id);
      // If padded, narration sits at the START of the padded window for an
      // equal length to the raw cue. If the cue id isn't in the raw map,
      // narration = full cue (best-guess fallback).
      let narrationStartFrame = cue.startFrame;
      let narrationEndFrame = cue.endFrame;
      if (narration && source === "padded") {
        const [rawStart, rawEnd] = narration;
        narrationStartFrame = cue.startFrame;
        narrationEndFrame = cue.startFrame + (rawEnd - rawStart);
      } else if (narration) {
        narrationStartFrame = narration[0];
        narrationEndFrame = narration[1];
      }
      return {
        id: cue.id,
        startFrame: cue.startFrame,
        endFrame: cue.endFrame,
        narrationStartFrame,
        narrationEndFrame,
      };
    }),
  };

  process.stdout.write(JSON.stringify(out));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
