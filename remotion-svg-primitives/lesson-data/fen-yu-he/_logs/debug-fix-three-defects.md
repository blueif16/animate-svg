# fen-yu-he — debug fix (post-render, 3 confirmed defects)

Date: 2026-05-28. Post-render lesson-debugger fix. Audio frozen; zero frame
literals; EASE.*/SPRING.* only. Owned files: `src/lessons/fenYuHe/layout.ts`,
`src/lessons/FenYuHeLessonScene.tsx`, `src/lessons/fenYuHe/manifest.ts`.

## INPUTS READ
- layout.ts, FenYuHeLessonScene.tsx, manifest.ts (owned)
- fenYuHeLessonTimeline.ts, generated timing (read-only, for cue frames)
- counting.tsx (FenHeDiagram, getFenHeDiagramAnchors, LabelCallout, NumberCard)
- sketch.tsx (TeacherMark label-arrow geometry)
- pedagogy.md (read-fen-he-shi: 分合式 reads two ways — 分成 / 组成)

## CUE WINDOWS (reconciled, read from timeline)
read-fen-he-shi 412–580 · first-ordered-split 580–720 · slide-one-at-a-time
720–954 (slideWindow≈56.25) · ordered-column-complete 954–1053 · order-matters
1053–1178.

## FIX 1 — read-direction arrows (both rode central axis over the "5")
- layout.ts `SKETCH.read`: replaced central-axis config with two-sided config
  (outwardX, topInsetY, bottomInsetY, labelFontSize, labelGapX, labelText
  {fen:"分成", zu:"组成"}). Added `readArrowGeometry(which)` helper computing
  per-side shaft + label points from `bigDiagramAnchors()`.
- FenYuHeLessonScene.tsx `SketchMarks`: rewrote read block — 分成 = DOWN arrow
  + label on LEFT limb (draws first, arrow1Start=30); 组成 = UP arrow + label
  on RIGHT limb (arrow2Start=66). Each label is a `LabelCallout` (navy, 38px)
  that fades with its arrow. Imported `readArrowGeometry`.
- manifest.ts `readArrow`: bbox now covers the outward shaft + label per side.
- RESULT: "5" fully unobscured; 分成/组成 clearly separated and readable.

## FIX 2 — left-part candies straddled the divider (states 3-2, 4-1)
- layout.ts: deleted hand-tuned `LEFT_STAGE.states` arrays. Added
  `leftStagePositions(leftCount)` + `leftStageStateX(key)` — computed packing:
  L left candies packed leftward from dividerX with a >=20px gap; (5-L) right
  candies packed rightward with the same gap. Added `CANDY.leftSize=76`,
  `CANDY.leftPitch=84` (4 fit left of the line at size>=72 with the gap).
- Scene + manifest `candyPositionsAt` now call `leftStageStateX`. Scene
  `CandyState` gained a `size` field; left-stage renders at leftSize (76),
  centered cues at size (96), first-ordered-split interpolates 96→76.
- RESULT: every state 1-4 / 2-3 / 3-2 / 4-1 shows exactly L left, 5−L right,
  none straddling, by construction.

## FIX 3 — results column diagrams overlapped (rowPitch < diagram height)
- layout.ts: added `fenHeDiagramHeight(width)`. COLUMN.width 140→100
  (glyph=36px, >=36 body-min), rowGap 18, `rowPitch = height + gap` (≈125.5,
  was 120 hardcoded < 150 height). topY 142→158 so the 4 rows centre in
  zone-column and bottom ink (~588) clears the caption (y<600) at the focal
  cues. columnRowY/columnCardSize/manifest bboxes auto-follow the constants.
- RESULT: 4 分合式 with >=16px gaps, none overlapping, top-to-bottom 1-2-3-4
  reading preserved, bottom row clear of caption at ordered-column-complete.

## COMMANDS RUN
- `npm run lint` → clean (eslint + tsc, exit 0).
- `npm run lesson:check -- --config lesson-data/fen-yu-he/pipeline.json` →
  11 keyframes, collisionCount 0.
- `npx remotion still ... CompleteFenYuHeLesson` → out/fen-yu-he/fix-*.png
  (read-mid/late, state-1-4/2-3/3-2/4-1, column-complete, order-matters).

## ISSUES / REMAINING CONCERN
- During slide-one-at-a-time only, the longest narration line wraps to 2 lines;
  the kit caption ribbon (maxWidth 860) then grows taller/wider and its right
  edge clips the bottom column row's part cards as that row finishes appearing.
  The column is non-focal during the slide cue (focal = sliding candy) and the
  bottom row is fully clear at its focal cue (ordered-column-complete, 1-line
  caption). Kept the vertical column per pedagogy (1-2-3-4 top-to-bottom climb);
  fully clearing the 2-line caption would force topY<=124 and crowd the top.

## PIPELINE FINDINGS
- Caption-ribbon vertical/horizontal extent (kit-owned) is not modelled by the
  bbox manifest, so column-vs-caption overlap during long 2-line cues is
  invisible to `lesson:check`. A future composer guard could reserve a
  caption-safe band (bottom ~165px, width to ~1070) when narration for a cue
  exceeds the 1-line character budget.
