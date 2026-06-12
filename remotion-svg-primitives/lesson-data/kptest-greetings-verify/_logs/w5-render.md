# W5 — Render

**Lesson:** kptest-greetings-verify  
**Status:** ok  
**Date:** 2026-06-08T21:32Z

## INPUTS READ

| File | Size | Source |
|------|------|--------|
| `lesson-data/kptest-greetings-verify/pipeline.json` | 679 B | Config |
| `public/audio/kptest-greetings-verify-voice.wav` | 2.5 MB | W3a frozen voice |
| `src/lessons/kptestGreetingsVerifyLessonTimeline.ts` | 9.1 KB | W3.5 reconciled timeline |
| `src/lessons/CompleteKptestGreetingsVerifyLesson.tsx` | 4.7 KB | W4a composition entry |
| `src/lessons/kptestGreetingsVerifyLessonScene.tsx` | 27.1 KB | W4a composed scene |
| `src/lessons/kptestGreetingsVerify/layout.ts` | 6.7 KB | W4a layout |
| `src/lessons/kptestGreetingsVerify/manifest.ts` | 13.5 KB | W4a manifest |

## COMMANDS RUN

### 1. `RENDER_SCALE=1 npm run lesson:render -- --config lesson-data/kptest-greetings-verify/pipeline.json --skip-voice`
- **Exit:** 0
- **Key stdout:**
  - Rendered 1619/1619 frames
  - Encoded 1619/1619 frames
  - `out/kptest-greetings-verify/kptest-greetings-verify.mp4` 5.7 MB (pre-loudnorm)
  - Video: h264, 1280x720, 30 fps, duration 53.97s
  - Audio: aac, 48000 Hz, stereo
  - Loudnorm 2nd pass: encoded to `.norm.mp4`, then replaced original
  - Contact sheet: `kptest-greetings-verify-contact.png` (699 KB), 8 cues × 5 samples = 40 tiles
  - Total render time: 38115 ms

### Render timing breakdown
| Step | Duration |
|------|----------|
| Silence detection | 393 ms |
| Typecheck + lint | 4897 ms |
| Bundle | 3144 ms |
| Render MP4 | 19375 ms |
| Loudnorm (-16 LUFS / -1 dBTP) | 2195 ms |
| Contact sheet | 8111 ms |
| **Total** | **38115 ms** |

## OUTPUTS WRITTEN

| File | Size | Description |
|------|------|-------------|
| `out/kptest-greetings-verify/kptest-greetings-verify.mp4` | 4.4 MB | Final loudnorm'd master |
| `out/kptest-greetings-verify/kptest-greetings-verify-contact.png` | 716 KB | Contact sheet (40 tiles) |
| `out/kptest-greetings-verify/kptest-greetings-verify-contact.json` | 7.7 KB | Contact sheet legend |
| `out/kptest-greetings-verify/bbox-manifest.json` | 53 KB | Bounding-box manifest (from W4) |
| `lesson-data/kptest-greetings-verify/_logs/render-timing.json` | auto | Render timing breakdown |

## FFPROBE REPORT

| Property | Value |
|----------|-------|
| Resolution | 1280×720 |
| Video codec | h264 (High) |
| FPS | 30/1 |
| Frame count | 1619 |
| Video duration | 53.967 s |
| Audio codec | aac (LC) |
| Audio sample rate | 48000 Hz |
| Audio channels | stereo |
| Audio duration | 54.100 s |
| File size | 4.4 MB |

## LOUDNESS MEASUREMENT

Post-loudnorm measurement (dynamic pass on the final mp4):

| Metric | Value |
|--------|-------|
| Integrated loudness (input_i) | -16.25 LUFS |
| True peak (input_tp) | -3.12 dBTP |
| Loudness range (input_lra) | 7.50 LU |
| Threshold (input_thresh) | -27.86 LUFS |

Target: -16 LUFS / -1 dBTP. Measured at -16.25 LUFS integrated — within acceptable tolerance of target.

## KEY DECISIONS

1. **--skip-voice passed** — voice WAV frozen from W3a; timing module already exists at `src/lessons/generated/kptestGreetingsVerifyTiming.ts`. No re-generation needed.
2. **Loudnorm enabled** (default) — final render at RENDER_SCALE=1 must be normalized per pipeline spec. 2nd-pass deterministic loudnorm ran inside `lesson:render`.
3. **RENDER_SCALE=1** — full resolution render for final output (1280×720 composition size).

## ISSUES

None. Render completed cleanly with zero errors.

## PIPELINE FINDINGS

1. **Pre-loudnorm vs post-loudnorm file size delta:** 5.7 MB → 4.4 MB (23% reduction). The loudnorm pass re-encodes audio at 128 kbps vs the original ~317 kbps, which accounts for most of the savings. Consider whether the script should preserve higher audio bitrate in the loudnorm pass for future lessons if audio fidelity is a concern.
2. **bbox-manifest.json and contact-sheet.png from W4 not replaced:** The W5 contact sheet is written as `kptest-greetings-verify-contact.png` (canonical name per spec), but a stale `contact-sheet.png` from W4 QA still exists in the output directory. Not harmful but could cause confusion. Consider cleaning up W4 QA artifacts after W5 or using distinct naming.
