# W3.5 Reconcile log — kptest-first-second-third

## INPUTS READ

- `lesson-data/kptest-first-second-third/visual-design.md` — §3 per-cue `visualMotionSeconds` table (13 cues)
- `src/lessons/generated/kptestFirstSecondThirdClips.ts` — 13 ClipCues with measured `narrationFrames`; 2 cues carry `gap: {seconds:4, reason:"learner-response"}` (ask-second, ask-third)
- `lesson-data/kptest-first-second-third/storyboard.md` — `exposures` ledger
- `shared-narration/src/reconcileTimeline.ts` — `reconcileClipTimeline` API (verified signature)

## OUTPUTS WRITTEN

- `src/lessons/kptestFirstSecondThirdLessonTimeline.ts` — exports `kptestFirstSecondThirdCues` (13 PlacedCues), `kptestFirstSecondThirdDuration` (2026 frames ≈ 67.5s), `kptestFirstSecondThirdVoiceClips` (13 VoiceClips), `kptestFirstSecondThirdLessonCaptionCues` (13 CaptionCues)
- `lesson-data/kptest-first-second-third/_logs/w3-5-reconcile.md` — this file

## COMMANDS RUN

```
npx eslint src/lessons/kptestFirstSecondThirdLessonTimeline.ts
# EXIT: 0 (clean)

npx tsc --noEmit --skipLibCheck  (filtered to kptestFirstSecondThird)
# EXIT: 0, no errors

npm run lesson:animatic -- --config lesson-data/kptest-first-second-third/pipeline.json
# EXIT: 0
# VERDICT: PASS — every clip fits its cue window
# 13 cues, 39 stills, animatic at out/kptest-first-second-third/kptest-first-second-third-animatic.png
```

## KEY DECISIONS

- FPS=30, TAIL_FRAMES=9 per spec.
- All 13 cue ids taken from the ClipCue module (canonical); all match the visual-design §3 table 1:1.
- `count-third` motion budget 8.0s → motionFrames=240 > narrationFrames=158 → motion drives the window (249 frames). This is intentional: the full 3-item sweep needs the visual floor.
- `ask-second` / `ask-third`: gap=4s → gapFrames=120; narrationFrames+gap=174 > motionFrames=60 → audio+gap drives (183 frames each). The 4s learner-response hold is free silence; composer will render a "your turn" affordance for that window.

## Reconcile table (FPS=30, tail=9)

| cue | narr | gapF | motionF | max | +tail | start | end |
|---|---|---|---|---|---|---|---|
| intro | 101 | 0 | 90 | 101 | 110 | 0 | 110 |
| arrive-first | 123 | 0 | 120 | 123 | 132 | 110 | 242 |
| name-first | 96 | 0 | 90 | 96 | 105 | 242 | 347 |
| arrive-second | 89 | 0 | 105 | 105 | 114 | 347 | 461 |
| count-second | 185 | 0 | 180 | 185 | 194 | 461 | 655 |
| arrive-third | 101 | 0 | 105 | 105 | 114 | 655 | 769 |
| count-third | 158 | 0 | 240 | 240 | 249 | 769 | 1018 |
| ask-second | 54 | 120 | 60 | 174 | 183 | 1018 | 1201 |
| reveal-second | 71 | 0 | 135 | 135 | 144 | 1201 | 1345 |
| ask-third | 54 | 120 | 60 | 174 | 183 | 1345 | 1528 |
| reveal-third | 78 | 0 | 120 | 120 | 129 | 1528 | 1657 |
| recap-invite | 81 | 0 | 60 | 81 | 90 | 1657 | 1747 |
| recap-count | 140 | 0 | 270 | 270 | 279 | 1747 | 2026 |

Total: 2026 frames (67.53s)

## ISSUES

- WARN: Comprehension-floor advisory — all acquisition targets below §8 floor (≥6–10 spaced exposures):
  - 第一: 4 exposures < floor 6
  - 第二: 5 exposures < floor 6
  - 第三: 4 exposures < floor 6
  - count-from-front-rule: 5 < floor 6
  These are advisory (non-blocking). W2b/W1 should revisit cue count or add repeat exposures in a future iteration.

## PIPELINE FINDINGS

- Exposure counts in the storyboard `exposures` ledger are consistently below the §8 floor for all four targets. The lesson structure (arrive→name/count pairs + 2 retrieval + 1 choral recap) structurally yields ~4–5 per target. To reach ≥6, either add a second retrieval round or a pre-recap echo cue. This is a lesson-structure design decision (W0/W1), not a reconcile or timeline issue — record as a systemic finding for the lesson-pedagogy skill to address in its pacing-floor guidance.
