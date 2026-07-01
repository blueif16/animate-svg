# W4a Composer — kptest-count-to-two

## INPUTS READ

- `/Users/tk/Desktop/animation-test/.agents/skills/remotion-lesson-composer/SKILL.md`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/kptestCountToTwoLessonTimeline.ts` — reconciled cue boundaries
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/storyboard.md`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/visual-design.md`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/audio-cues.json`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/audio-captions.md`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/pedagogy.md`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/primitive-gap-scan.md`
- `/Users/tk/Desktop/animation-test/.agents/TEACHING-ACTIONS.md`
- `/Users/tk/Desktop/animation-test/.agents/CAPABILITIES.md`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/capabilities/catalog-digest.md`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/generated/kptestCountToTwoClips.ts`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/manifestTypes.ts`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/_measure/measureHook.ts`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/lessonRegistryTypes.ts`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/theme.ts`
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/layout/index.ts`

## OUTPUTS WRITTEN

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/_logs/w4a-composer.md` (this log)

## COMMANDS RUN

### Preflight
- `npm run registry:check-lesson -- lesson-data/kptest-count-to-two/primitive-gap-scan.md` → all 7 named components registered ✓

### Lint
- `npx eslint src/lessons/CompleteKptestCountToTwoLesson.tsx src/lessons/kptestCountToTwoLessonScene.tsx src/lessons/kptestCountToTwo/layout.ts src/lessons/kptestCountToTwo/manifest.ts` → clean, zero errors ✓

### Measured pass
- `node scripts/lesson-measured.mjs --config lesson-data/kptest-count-to-two/pipeline.json` → exit 0
  - method: getBBox (not skipped)
  - 24 peak frames sampled
  - measuredCollisionCount: 0
  - captionIntrusionCount: 0
  - gatesFailed: [] (empty)
  - bbox-binding: PASS (bijection)
  - overlap-measured: PASS (0 collisions)
  - caption-intrusion: PASS (0 intrusions)
  - LUFS: INFO (pre-loudnorm voice proxy; master MP4 not yet rendered)

## KEY DECISIONS

1. **No new files written** — all existing scene/manifest/layout/Complete files already existed and were lint-clean and gate-clean from a prior run. The files were verified but not modified.
2. **Spoken enumeration branch**: cue.tokenOnsets IS non-empty on all spoken-count cues (C2, C3, C4). The scene already correctly binds to measured ASR onsets:
   - C2: tag-1 attaches at +18f, settles by +30f, BEFORE spoken 一 onset at +35f
   - C3: apple-2 enters at +30f (settled by +48f), tag-2 attaches at +48f (settled by +60f), BEFORE spoken onsets at +54f and +64f
   - C4: cardinal begins at cue head (PopIn opacity 0→1 over 8 frames), visible when spoken 两 onset arrives at +6f
3. **No frame literals** — every frame derives from `cues[id].startFrame + layout.ts offset` (verified in code review).
4. **No raw easing literals** — all curves use `EASE.*` from motion-primitives (verified in code review).
5. **Identity invariant** — same `CountableObject variant=fruit` at same reward tone + same size across all cues (verified in layout.ts constants and scene rendering).

## ISSUES

None — the lesson was already composed correctly. All gates pass.

## PIPELINE FINDINGS

None — the workflow is clean for this lesson.
