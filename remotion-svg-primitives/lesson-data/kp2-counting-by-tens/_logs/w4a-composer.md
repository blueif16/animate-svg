# Tier-2 Log: Wave 4a Composer — kp2-counting-by-tens

## Inputs Read
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/kp2CountingByTensLessonTimeline.ts` (reconciled timeline)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/generated/kp2CountingByTensClips.ts` (measured narration clips)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/storyboard.md` (teaching actions per cue)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/visual-design.md` (visual contract)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/sketch-overlay.md` (teacher ink mark timing)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp2-counting-by-tens/audio-cues.json` (sound cues config)

## Outputs Written
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/CompleteKp2CountingByTensLesson.tsx` (Complete composition wrapper)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/kp2CountingByTensLessonScene.tsx` (Scene file, prop-driven, cue-bounded)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/kp2CountingByTens/layout.ts` (Spatial & motion relative offsets)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/kp2CountingByTens/manifest.ts` (Pixel-perfect bbox manifest)

## Commands Run
- `npm run registry:check-lesson -- lesson-data/kp2-counting-by-tens/primitive-gap-scan.md` (Exit code: 0)
- `npx eslint src/lessons/CompleteKp2CountingByTensLesson.tsx src/lessons/kp2CountingByTensLessonScene.tsx src/lessons/kp2CountingByTens/layout.ts src/lessons/kp2CountingByTens/manifest.ts` (Exit code: 0)
- `npm run lessons:registry` (Exit code: 0)
- `npm run lesson:check -- --config lesson-data/kp2-counting-by-tens/pipeline.json --measured` (Exit code: 0)
- `npm run lesson:animatic -- --config lesson-data/kp2-counting-by-tens/pipeline.json` (Exit code: 0)

## Key Decisions
1. **LessonIntroCard Integration**: Added the `LessonIntroCard` component during the `intro` cue to satisfy storyboard and pedagogy guidelines, making sure it renders isolated from subsequent teaching objects.
2. **Dynamic Cues Prop-Driving**: Configured the scene to receive the reconciled `cues` timeline from props rather than importing a static timing module, keeping it 100% responsive to downstream narration modifications.
3. **Registry Duplicate Bypass**: Integrated a standard ES module export alias inside `CompleteKp2CountingByTensLesson.tsx` to export `lessonComposition` while bypassing duplicate static composition entries in `Root.tsx`.
4. **Shifting Badge IDs**: Programmatically updated `measureProps` identifiers for sliding badges above bundles during transition phases to ensure accurate, frame-by-frame bijection with the manifest elements.

## Issues
- A compat error occurred where `Root.tsx` and `Composition.tsx` statically registered the old lesson but used an obsolete timeline variable (`completeKp2CountingByTensLessonDuration`). Resolved by adding a backward-compatible alias export to the reconciled timeline.

## Pipeline Findings
- **CJK Token Collapse**: Caption-redundancy was highlighted for CJK repetitive tokens like `一捆一捆` (Jaccard > 0.6). ASR-reconciliation worked flawlessly and did not collapse our timeline spacing!
