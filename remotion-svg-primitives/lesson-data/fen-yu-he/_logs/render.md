# Wave 5 — Render (fen-yu-he)

## INPUTS READ
- remotion-svg-primitives/lesson-data/fen-yu-he/pipeline.json
- remotion-svg-primitives/src/lessons/fenYuHeLessonTimeline.ts (own lesson artifact, read-only)
- remotion-svg-primitives/scripts/make-contact-sheet.mjs (lesson-agnostic, read-only)
- node_modules/.bin/tsx scripts/_padded-cues-extract.ts fenYuHe (extracted padded cues)

## OUTPUTS WRITTEN
- remotion-svg-primitives/out/fen-yu-he/fen-yu-he.mp4 (4.6 MB, 1178 frames, 39.27s) — SUCCESS
- remotion-svg-primitives/out/fen-yu-he/fen-yu-he-contact.png — NOT WRITTEN (auto-build failed)
- remotion-svg-primitives/lesson-data/fen-yu-he/_logs/render.md (this log)
- Side effect (script-owned): src/lessons/generated/fenYuHeSilences.ts re-written (24 silence intervals)

## COMMANDS RUN
1. `npm run lesson:render -- --config lesson-data/fen-yu-he/pipeline.json` — exit 0 (script does not propagate contact-sheet failure to its own exit code)
   - Voice auto-skipped (timing module exists).
   - Lint+tsc passed. Bundle OK. Render OK: `Rendered 1178/1178`, `Encoded 1178/1178`.
   - `+ out/fen-yu-he/fen-yu-he.mp4 4.6 MB`
   - Media streams: video h264 duration=39.266667; audio aac duration=39.317333
   - Contact-sheet auto-build FAILED, verbatim:
     ```
     == Contact-sheet build (source: padded, 9 cues × 5 samples = 45 tiles)
     Input file is missing: /tmp/claude-501/contact-sheet-7YUOf6/order-matters-2.png
     Contact sheet skipped: Command failed: node scripts/make-contact-sheet.mjs --config lesson-data/fen-yu-he/pipeline.json
     ```
   - Benign: Remotion version mismatch warning (4.0.462 vs @remotion/three 4.0.464); render succeeded regardless.
2. `node_modules/.bin/tsx scripts/_padded-cues-extract.ts fenYuHe` — exit 0; confirmed final cue boundaries.

## KEY DECISIONS
- MP4 render is a clear SUCCESS; the only failure is the auto contact-sheet step → status=partial (not failed).
- Did NOT edit scene code, timeline, or the contact-sheet script (out of Wave 5 scope; this is a seam bug in shared pipeline components).
- Did NOT re-run the contact sheet with a workaround flag — reporting the defect verbatim is the correct test outcome.
- The stale `out/fen-yu-he/contact-sheet.png` (20:28) is from a PRIOR run, not this render, and is NOT the expected `fen-yu-he-contact.png`.

## ROOT CAUSE
Final cue `order-matters` has `narrationEndFrame = endFrame = 1178 = totalDuration`. make-contact-sheet.mjs sample idx 2 (`narr-end`) seeks ffmpeg to `narrationEndFrame/fps = 1178/30 = 39.2667s`, exactly the video duration — one frame past the last decodable frame (1177 ≈ 39.233s). ffmpeg exits 0 but writes no PNG; `sharp(tilePath)` then throws "Input file is missing". (idx 3 hold-mid=1179 and any sample at the duration boundary share the fault; idx 2 fails first.) The final cue has zero hold tail because reconcile chains `endFrame = cursor + cueFrames` and the last cue's narrationEndFrame is spread unchanged from the source ASR cue, landing on the composition end.

## ISSUES
- Contact sheet not produced; Wave 6 verification's primary review surface (`fen-yu-he-contact.png` + `.json`) is missing for this run.

## PIPELINE FINDINGS
- make-contact-sheet.mjs (lesson-agnostic) does not clamp seek targets to `< totalDuration - 1 frame`; any cue whose `narrationEndFrame`/`hold-mid` lands at or past the final frame yields a silent ffmpeg no-write → sharp "Input file is missing". The last cue is the systematic trigger because its window ends at the composition end.
- The render script swallows the contact-sheet failure ("Contact sheet skipped: ...") and still exits 0 + prints "Done". A downstream wave that trusts exit code would wrongly believe the contact sheet exists. The skip is logged but not surfaced as a non-zero status.
- The Wave 3.5 reconcile (`fenYuHeLessonTimeline.ts`) leaves the final cue with `narrationEndFrame == endFrame` (no tail), which is what pushes the contact-sheet seek to EOF. CLAUDE.md mandates a tail ≤ 9 frames per cue, but the final cue here has effectively zero hold, so `narr-end`, `hold-mid`, and `cue-end` collapse onto the boundary.
