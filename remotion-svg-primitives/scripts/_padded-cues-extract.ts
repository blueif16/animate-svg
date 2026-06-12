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
  // v4 cue-anchored audio: the reconciled cue carries its EXACT narration
  // sub-window (clip start → clip end). When present, the contact sheet reads
  // these directly — no ASR-span derivation, so the narration-window markers
  // can no longer misalign for short-narration/long-hold cues.
  narrationStartFrame?: number;
  narrationEndFrame?: number;
};

// v4 per-cue voice placement (`<camel>VoiceClips`): which clip plays, at which
// composition frame, for how long. The animatic gate's no-scene fallback reads
// these to draw each per-cue clip waveform and to verdict clip-fits-window.
type VoiceClip = {
  src: string;
  fromFrame: number;
  durationInFrames: number;
};

const main = async () => {
  // v4: prefer the reconciled timeline's cues, which carry the exact narration
  // window. Only fall back to the raw ASR Timing module (legacy lessons) when a
  // cue does not carry narration fields.
  let timelineCues: Cue[] | undefined;
  let timelineDuration: number | undefined;
  let timelineVoiceClips: VoiceClip[] | undefined;
  if (!forceRaw) {
    try {
      const timelineMod = await import(pathToFileURL(timelinePath).href);
      const paddedKey = `${camelLessonId}Cues`;
      const durKey = `${camelLessonId}Duration`;
      const durFramesKey = `${camelLessonId}DurationFrames`;
      const voiceClipsKey = `${camelLessonId}VoiceClips`;
      if (Array.isArray(timelineMod[paddedKey])) {
        timelineCues = timelineMod[paddedKey];
        timelineDuration =
          timelineMod[durKey] ??
          timelineMod[durFramesKey] ??
          timelineCues![timelineCues!.length - 1].endFrame;
      }
      if (Array.isArray(timelineMod[voiceClipsKey])) {
        timelineVoiceClips = timelineMod[voiceClipsKey];
      }
    } catch {
      // Timeline file may not exist; fall back to raw below.
    }
  }

  const v4 =
    timelineCues !== undefined &&
    timelineCues.every(
      (c) =>
        typeof c.narrationStartFrame === "number" &&
        typeof c.narrationEndFrame === "number",
    );

  if (v4 && timelineCues) {
    process.stdout.write(
      JSON.stringify({
        camelLessonId,
        fps: 30,
        totalDuration: timelineDuration,
        source: "reconciled",
        cues: timelineCues.map((cue) => ({
          id: cue.id,
          startFrame: cue.startFrame,
          endFrame: cue.endFrame,
          narrationStartFrame: cue.narrationStartFrame,
          narrationEndFrame: cue.narrationEndFrame,
        })),
        voiceClips: timelineVoiceClips ?? [],
      }),
    );
    return;
  }

  // ── legacy path (pre-v4 lessons): derive narration from the raw ASR spans. ──
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

  const cues: Cue[] = timelineCues ?? rawCues;
  const totalDuration = timelineCues ? timelineDuration : rawDuration;
  const source: "padded" | "raw" = timelineCues ? "padded" : "raw";

  const out = {
    camelLessonId,
    fps: 30,
    totalDuration,
    source,
    // Legacy/raw lessons have no per-cue VoiceClips export; the animatic
    // fallback then derives windows from each cue's narration sub-span.
    voiceClips: timelineVoiceClips ?? [],
    cues: cues.map((cue) => {
      const narration = narrationByCueId.get(cue.id);
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
