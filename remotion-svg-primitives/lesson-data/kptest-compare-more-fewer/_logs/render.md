# W5 — render — kptest-compare-more-fewer

## INPUTS READ
- `lesson-data/kptest-compare-more-fewer/pipeline.json` — render config (composition `CompleteKptestCompareMoreFewerLesson`, fps 30, output path).
- `lesson-data/kptest-compare-more-fewer/pedagogy.md` — context only (named discoveries; no edits).
- Prerequisite presence checks (not modified): `src/lessons/kptestCompareMoreFewerLessonScene.tsx`, `src/lessons/kptestCompareMoreFewerLessonTimeline.ts`, `src/lessons/CompleteKptestCompareMoreFewerLesson.tsx`, `src/lessons/generated/kptestCompareMoreFewerClips.ts` + `...Timing.ts`, frozen `public/audio/kptest-compare-more-fewer-voice.wav`, all 11 per-cue clips under `public/audio/kptest-compare-more-fewer/clips/`, registry wiring in `src/lessons/_lessonRegistry.generated.tsx`.

## OUTPUTS WRITTEN
- `out/kptest-compare-more-fewer/kptest-compare-more-fewer.mp4` (5.8 MB, loudnorm-normalized final master)
- `out/kptest-compare-more-fewer/kptest-compare-more-fewer-contact.png` (955 KB, 11 cues × 5 samples = 55 tiles)
- `out/kptest-compare-more-fewer/kptest-compare-more-fewer-contact.json` (legend)
- `out/kptest-compare-more-fewer/bbox-manifest.json` (140 KB)
- (also produced by the render script: `gemini-voice.json`/`asr-alignment.json` were pre-existing from W3a; `_logs/render-timing.json`)

## COMMANDS RUN
- `RENDER_SCALE=1 npm run lesson:render -- --config lesson-data/kptest-compare-more-fewer/pipeline.json --skip-voice` — exit 0.
  - Audio gate PASS · Lesson registry PASS · Typecheck + lint PASS (4705 ms) · Bundle (2669 ms) · Render MP4 2068/2068 frames (20436 ms) · Loudnorm (2801 ms) · Contact sheet (9710 ms). Total 40522 ms.
- `ffprobe` on final master — exit 0.
- `ffmpeg loudnorm print_format=summary` on final master — exit 0.

## KEY DECISIONS
- Passed `--skip-voice` explicitly (voice frozen from W3a; timing module already on disk). No re-record, no re-roll — W5 is render-only.
- Did not pass `--skip-loudnorm`: this is the final 1.0 render, so the deterministic 2nd-pass normalization ran (required for the final master).
- No scene/timeline edits — mechanical node.

## RENDER FACTS (reported)
- Resolution 1280×720, fps 30/1, frames 2068, duration 69.0 s (counted frames = 2068).
- Video h264, audio aac 48000 Hz stereo.
- Measured loudness on FINAL master: Integrated -15.9 LUFS, True Peak -2.8 dBTP, LRA 4.9 LU (target -16 LUFS / -1 dBTP — on target; TP under ceiling).
- Temporary `.norm.mp4` promoted to final filename and cleaned up (no leftover).

## ISSUES
- None. Render clean, all OUTPUT-CONTRACT artifacts present and non-empty at exact paths; lint+typecheck green; master normalized.
- Note for W6: this node does NOT inspect collisionCount / measuredCollisionCount / gates — `bbox-manifest.json` was written by the composer's W4 `lesson:check`; W6 verification re-checks it against the contact sheet + MP4.

## PIPELINE FINDINGS
- The render script prints media-stream `duration` for both video (68.93 s) and audio (68.99 s) from the pre-norm probe, but the final on-disk `format.duration` reads 69.0 s. Minor cosmetic mismatch between the in-script probe line and the actual normalized master; not load-bearing, but a future tweak could re-probe the post-loudnorm file so the printed duration matches the shipped master exactly.
