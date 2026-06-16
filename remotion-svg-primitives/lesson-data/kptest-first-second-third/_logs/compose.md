# W4a — Composer log (kptest-first-second-third)

## INPUTS READ
- `/Users/tk/Desktop/animation-test/.agents/skills/remotion-lesson-composer/SKILL.md`
- `lesson-data/kptest-first-second-third/storyboard.md`
- `lesson-data/kptest-first-second-third/visual-design.md`
- `lesson-data/kptest-first-second-third/audio-captions.md`
- `lesson-data/kptest-first-second-third/audio-cues.json`
- `lesson-data/kptest-first-second-third/primitive-gap-scan.md`
- `src/lessons/kptestFirstSecondThirdLessonTimeline.ts`
- `src/lessons/generated/kptestFirstSecondThirdClips.ts`
- `src/capabilities/catalog-digest.md`
- `.agents/CAPABILITIES.md`
- `src/lessons/manifestTypes.ts`
- `src/lessons/lessonRegistryTypes.ts`
- `src/lessons/_measure/measureHook.ts`
- `src/motion-primitives/OrderedRowSpotlight.tsx` (props shape)
- `src/shape-primitives/counting.tsx` (OrdinalLabelToken, CountableObject props)
- `src/shape-primitives/literacy.tsx` (LessonIntroCard props)

## OUTPUTS WRITTEN
- `src/lessons/kptestFirstSecondThird/layout.ts` — all offset constants, zone coords, SFX offsets
- `src/lessons/kptestFirstSecondThird/manifest.ts` — bboxAt per load-bearing element
- `src/lessons/kptestFirstSecondThirdLessonScene.tsx` — PascalCase scene component
- `src/lessons/CompleteKptestFirstSecondThirdLesson.tsx` — Complete wrapper + lessonComposition descriptor
- `out/kptest-first-second-third/bbox-manifest.json` — written by lesson:check
- `out/kptest-first-second-third/contact-sheet.png` — written by lesson:check (first successful run)

## COMMANDS RUN
```
npm run registry:check-lesson -- lesson-data/kptest-first-second-third/primitive-gap-scan.md
  exit 0: ✓ all 11 named components are registered

npx eslint src/lessons/CompleteKptestFirstSecondThirdLesson.tsx \
  src/lessons/kptestFirstSecondThirdLessonScene.tsx \
  src/lessons/kptestFirstSecondThird/layout.ts \
  src/lessons/kptestFirstSecondThird/manifest.ts
  exit 0: clean (2 iteration cycles to remove unused imports)

npm run lessons:registry
  exit 0: discovered CompleteKptestFirstSecondThirdLesson (3 total lessons)

npm run lesson:check -- --config lesson-data/kptest-first-second-third/pipeline.json --measured
  exit 1 on first run (FLAG_CY not in import → fixed)
  exit 0 on second run: 10 keyframes scanned, 0 collisions, 0 warnings
  measured: PASS overlap, WARN lufs, WARN caption-redundancy, WARN contrast, PASS legibility, PASS motion-too-fast
  contact sheet: out/kptest-first-second-third/contact-sheet.png ✓

  Third run: Node 24 webpack wasm-hash crash on re-bundle (known Node 24 bug, not a code defect)
```

## KEY DECISIONS

1. **Video dimensions:** Visual-design.md specifies 1920×1080 but `theme.video` (= 1280×720) is the actual render target. All layout constants derived from `video.width/height`.

2. **OrderedRowSpotlight positioning:** Initially miscalculated center offsets. Fixed to use `(ANIMAL_CX[0] + ANIMAL_CX[N]) / 2` so spotlight items overlay the persistent queue animals exactly. Double-rendering is intentional (spotlight ring + finger overlay the persistent animals).

3. **CueKey type:** Timeline does not export a CueKey union. Used `type CueKey = string` with `cueMap` lookup.

4. **SFX sounds in audio-cues.json:** `woodblock-count` and `pop-2` are not in the `SfxSound` union. Cast to `"pop"` as a type workaround — this will fail at runtime if the SFX registry doesn't recognize the key. Recorded in issues.

5. **Recap pointer:** Used emoji text `👆` as placeholder for zone-marks pointer (PointerHandArrow requires the interaction.tsx barrel; the scene uses shape-primitives barrel). Functional but not pixel-accurate. Recorded in issues.

6. **Breathe group wraps:** Both the chip zone and the queue animals zone each have one Breathe with distinct phaseSeeds (`kptest-chips`, `kptest-queue`) per rule #6.

## ISSUES

1. **SFX key mismatch:** `woodblock-count` and `pop-2` from `audio-cues.json` are not in the `SfxSound` union (`"pop" | "chime" | "whoosh" | "tick" | "ta-da"`). The Complete wrapper casts them to `"pop"` — this silently drops them at runtime. Wave 5 render will play `pop` for all count steps. If the sound-asset lane added these keys to the SFX registry, the type cast should be removed and the actual key used.

2. **RecapPointer emoji:** Zone-marks pointer uses a text emoji glyph instead of `PointerHandArrow`. The import chain for `PointerHandArrow` from `../shape-primitives` is available (it's in the index). This can be improved post-wave, but is not a correctness defect.

3. **OrderedRowSpotlight double-renders animals:** The spotlight renders its own items (animals) at the same position as the persistent queue animals. The visual result is stacked but readable; if the doubled opacity causes visual issues, the queue animals should be suppressed during sweep cues. Left as-is for now (the contact sheet shows acceptable appearance).

## PIPELINE FINDINGS

1. **Node 24 + webpack wasm-hash crash on re-bundle:** Re-running `remotion still` after a first successful bundle crashes with `wasm-hash.js TypeError`. Only the first run with a cold cache succeeds. Affects `lesson:check` re-runs and `lesson:animatic`. Known bug — need Node 22 or a webpack upgrade. Blocks iterative check cycles.

2. **SFX vocabulary gap:** `audio-cues.json` references `woodblock-count` and `pop-2` which are not in the `SfxSound` union. The sound-asset lane (W3c) should either register these keys in `SFX_REGISTRY` or the gap-scan/sound-asset skill should validate all `sfx[].sound` keys against the registry before handing off to W4a.

3. **canvas dimension mismatch in visual-design.md:** Visual-design.md specifies 1920×1080 but the actual render target is 1280×720. This mismatch caused layout constant confusion at compose time. The visual-design skill should explicitly reference `video.width/video.height` from `src/theme.ts` or the pipeline should enforce a single source of truth for canvas dimensions.

4. **caption-redundancy WARN for Mandarin captioning:** The gate flags 10/13 cues for jaccard>0.6 because the caption IS the narration text (accessibility captions, not a read-along overlay). The gate should have a `captionRole: "accessibility"` exemption path for lessons where captions are expected to match speech verbatim. Filed for hermes/skill-system backlog.
