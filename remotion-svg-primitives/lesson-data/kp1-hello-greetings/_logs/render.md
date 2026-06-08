# W5 — Render — kp1-hello-greetings

## INPUTS READ
- `lesson-data/kp1-hello-greetings/pipeline.json` — composition `CompleteKp1HelloGreetingsLesson`, fps 30, output `out/kp1-hello-greetings/kp1-hello-greetings.mp4`.
- `public/audio/kp1-hello-greetings-voice.wav` (frozen, 971 KB) — narration, not re-generated.
- `src/lessons/kp1HelloGreetingsLessonTimeline.ts` — reconciled cues (intro, meet-hello, intro-self, part-goodbye, recap).
- `src/lessons/generated/kp1HelloGreetingsTiming.ts` + `kp1HelloGreetingsSilences.ts` — present, so voice auto-skips.
- `src/lessons/CompleteKp1HelloGreetingsLesson.tsx` + `kp1HelloGreetingsLessonScene.tsx` — composed scene.

## OUTPUTS WRITTEN (owned: out/kp1-hello-greetings/ + master mp4)
- `out/kp1-hello-greetings/kp1-hello-greetings.mp4` (2.12 MB)
- `out/kp1-hello-greetings/kp1-hello-greetings-contact.png` (446 KB, 1802×1116, 5 cues × 5 samples = 25 tiles)
- `out/kp1-hello-greetings/kp1-hello-greetings-contact.json` (5 rows, samplesPerCue 5, totalDuration 607, source padded)
- `out/kp1-hello-greetings/bbox-manifest.json` — fast linear pass refreshed by render (`collisionCount: 0`); the `measured` block is STALE from a prior W4 `--measured` pass (this node does not run `--measured`).
- `lesson-data/kp1-hello-greetings/_logs/render-timing.json` (written by render script)

## COMMANDS RUN
1. `RENDER_SCALE=1 npm run lesson:render -- --config lesson-data/kp1-hello-greetings/pipeline.json --skip-voice` — exit 0.
   - Silence detection 338 ms; Typecheck + lint 4384 ms (PASS); Bundle 2281 ms; Render MP4 8513 ms; Loudnorm (-16 LUFS / -1 dBTP) 978 ms; Contact sheet 5730 ms. Total 22224 ms.
   - Render emitted 607 frames (frame= 607 ... Lsize=2070KiB), loudnorm wrote `*.norm.mp4` then replaced master.
2. `ffprobe` master: video h264 1280×720, 30/1 fps, nb_read_frames=607; format duration 20.30 s, size 2,119,934 B, bit_rate 835 kb/s; audio aac 48000 Hz stereo.
3. `ffmpeg ... loudnorm=I=-16:TP=-1:LRA=11:print_format=summary -f null -` on the FINAL master → Input Integrated **-16.0 LUFS**, Input True Peak **-3.2 dBTP**, LRA 2.8 LU. PASS (at target, peak well under -1 dBTP ceiling).

## KEY DECISIONS
- Passed `--skip-voice` explicitly (voice frozen since W3a) and did NOT pass `--skip-loudnorm` (this is the final 1.0-scale render, must be normalized).
- Did not patch the stale `measured` block in bbox-manifest.json — `--measured` is W4/W6-owned; W5 is mechanical render only.

## ISSUES
- None blocking the render. Master is correct: 1280×720 @30fps, 607 frames / 20.3 s, h264 + aac stereo 48 kHz, -16.0 LUFS / -3.2 dBTP.

## PIPELINE FINDINGS
- The `measured` block in `bbox-manifest.json` is STALE relative to the render: it reports `gatesFailed: ["lufs","captionRedundancy"]` and `measuredCollisionCount: 2`, but (a) its `lufs` gate measured -17.2 LUFS / -1.6 dBTP from a PRE-loudnorm master — the freshly-normalized master directly measures -16.0 LUFS / -3.2 dBTP and passes; (b) its `collisionsMeasured` array is `[]` yet the summary says `measuredCollisionCount: 2` — an internal inconsistency. W6 must RE-RUN `lesson:check --measured` against the final normalized master rather than trust this block. Suggest the render script either invalidate (or annotate as stale) the `measured` block after it re-renders + loudnorms, since the master it measured no longer exists.
- `captionRedundancy` jaccard=1 across all 5 cues is a W2b/W4 content signal (caption text == narration text), not a render concern — flagged for W6, owned upstream.
