# fen-yu-he — Wave 4a composer log

## INPUTS READ
- .agents/skills/{remotion-lesson-composer,kids-eye,visual-discipline,lesson-pedagogy}/SKILL.md
- .agents/CAPABILITIES.md
- src/lessons/{manifestTypes.ts,timingTypes.ts}; docs/pipeline-architecture.md (via skill refs)
- src/lesson-media/{LessonAudioLayer,LessonCaptionLayer}.tsx; src/scenes/SceneFrame.tsx
- lesson-data/fen-yu-he/{pedagogy,storyboard,visual-design,audio-captions,sketch-overlay,primitive-gap-scan}.md
- lesson-data/fen-yu-he/{script-cues.json,pipeline.json}
- src/lessons/fenYuHeLessonTimeline.ts; src/lessons/generated/{fenYuHeTiming,fenYuHeSilences}.ts
- Primitives: src/shape-primitives/{counting.tsx (FenHeDiagram, CountableObject, NumberCard, LabelCallout, getFenHeDiagramAnchors), sketch.tsx (TeacherMark), shared.tsx, index.ts}; src/motion-primitives/{PopIn,curves,index}; src/fx/{Breathe,index}; src/theme.ts
- @studio/narration-kit dist types (AudioLayer, CaptionLayer, cueHelpers, types)
- scripts/{lesson-check,lesson-manifest,lesson-contact-sheet,lesson-primitive-checks,_manifest-extract}.mjs/.ts
- src/{Root,Composition,index}.tsx (registration pattern only)

## OUTPUTS WRITTEN
- src/lessons/fenYuHe/layout.ts (pure constants + bbox/position helpers)
- src/lessons/fenYuHe/manifest.ts (LESSON_MANIFEST, pure TS)
- src/lessons/FenYuHeLessonScene.tsx (frame-driven, cue-bounded scene)
- src/lessons/CompleteFenYuHeLesson.tsx (scene + audio + caption wrapper)
- src/Composition.tsx (added CompleteFenYuHeLesson re-export)
- src/Root.tsx (added CompleteFenYuHeLesson <Composition> + imports)

## COMMANDS RUN
- `npm run lint` (eslint + tsc) — exit 0 after fixes.
  - First failures: TS2322 literal-type narrowing on `let x = CENTER_STAGE.dividerX` (640) reassigned to 470, and the `out`/`states` arrays inferring `as const` literal types. FIXED: `let x: number =`, explicit array element type + `as number` on seed values.
- `node_modules/.bin/tsx scripts/_manifest-extract.ts fenYuHe` — exit 0 (after layout.ts import fix). Emitted full keyFrame JSON.
- `npm run lesson:check -- --config lesson-data/fen-yu-he/pipeline.json` — exit 0.
  - First run FAILED: "Multiple versions of Remotion detected: 4.0.462 and 4.0.464" in the manifest-extract tsx subprocess. Root cause: `@remotion/three` is `^4.0.462` (resolved 4.0.464) while all other remotion pkgs are pinned 4.0.462 — a PRE-EXISTING repo dep drift, not introduced here. The pure manifest was dragging Remotion in transitively because layout.ts imported `getFenHeDiagramAnchors` from the shape-primitives BARREL (which re-exports sketch.tsx/literacy.tsx → "remotion").
  - FIX (in my scope): layout.ts now imports `getFenHeDiagramAnchors` from `../../shape-primitives/counting` (the Remotion-free module) instead of the barrel. Manifest extract then ran clean.
  - Final: `11 keyframes scanned, 0 collisions`. Contact sheet + bbox-manifest.json written. Primitive-checks step printed the @remotion/three version-mismatch as a non-fatal WARNING then continued ("no primitive checks defined for fen-yu-he" — expected, gap-scan shipped none).
- `node -e` read of bbox-manifest.json — `collisionCount: 0`, keyFramesScanned: 11.
- `npm run lesson:animatic -- --config …` — exit 0; 27 stills; cue-start markers align to waveform onsets.
- `npx remotion still …` for climax frames: read (f520), order-matters (f1140), slide-late (f940/945), ordered-column-complete (f1000), slide-mid (f800) — all rendered, inspected.

## KEY DECISIONS
- Stage modes: candies CENTRED for five-whole/split/recombine/read; LEFT-shifted for the ordered cues so the results column holds the right third (visual-design zones). Transition happens as first-ordered-split's motion.
- Demonstrated split = 1|4 (so the diagram = 5/[1,4] and the first ordered row both read 1|4; clean identity-preserved glyph migration big-diagram → column row 0). split-into-two shows 1|4 rather than a neutral split — coherent with "start at smallest left = 1".
- 分合式 numerals are zone "labels"; candies zone "objects"; big-diagram (being actively READ) zone "objects" so the read-arrows (marks) may trace over it (allowed); column rows "labels" so the order-matters vs-mark (marks) is COLLISION-CHECKED against numerals. vs-mark parked at x=878 in the clear gap LEFT of the column.
- SceneFrame chrome NOT used — its fixed top-left eyebrow/title header violates the "no lesson-title header beside the stage" contract. Scene draws its own cream background; the only title is the intro card (zone-title) which clears before candies.
- Column: 4 diagrams of ~150px cannot fit at full pitch above the caption; rows nest with a ~5px inner-corner touch (whole-card vs adjacent part-card) — legible because whole is centred, parts offset. topY=142, rowPitch=120 keep the bottom row clear of the 1-line caption; the 2-line slide caption near-touches the bottom-right card corner (see ISSUES).
- ZERO frame literals: every frame = `fenYuHeCues[id].startFrame/endFrame ± named offset` from layout.MOTION/SKETCH. ZERO raw motion literals: EASE.inOutCubic/outCubic, PopIn-style bouncy via overshoot scale, TeacherMark settle for the vs-mark.
- Slide highlight uses CountableObject `selected` (sky ring) — the primitive's built-in highlight; palette intent was sunshine but the ring color is owned by the primitive (Wave 3 domain), not patched in-scene.
- Moving-hold: <Breathe> wraps title, candy group, big diagram, and column with distinct phaseSeeds.

## ISSUES (inside my output)
- Transient cosmetic: during slide-one-at-a-time's 2-line caption, the bottom column row's "4|1" cards near-touch the caption ribbon's top-right corner (~22px). Caption is semi-transparent so the card edge shows through faintly. Resolves at the next cue (ordered-column-complete, 1-line caption, fully clear — verified). Not a collision (caption zone is excluded from the manifest by design). Teaching unaffected.
- Slide active-highlight is sky (primitive `selected` ring), not the sunshine the palette specified. Reads correctly as "this one moves"; color owned by the primitive.

## PIPELINE FINDINGS
- Remotion dep drift (`@remotion/three ^4.0.462` → 4.0.464 vs everything pinned 4.0.462) breaks the manifest-extract tsx subprocess for ANY lesson whose pure manifest transitively loads Remotion. The pipeline should pin @remotion/three and/or the gap-scan/composer skill should mandate importing pure helpers from their concrete module (not the React barrel) so manifests stay Remotion-free.
- The composer skill says "export it from src/index.ts" but the working pattern is re-export via Composition.tsx (imported by Root.tsx). src/index.ts only registerRoot + re-exports styles/fx. Followed the working pattern; skill wording is stale.
- manifestTypes ZoneName has no zone for "the symbolic representation being read" distinct from "teaching object" — I overloaded objects/labels to make marks∩labels catch the vs-mark while letting read-arrows trace the diagram. Worked, but the zone semantics for 分合式 (object vs label) are ambiguous in the skill.
- visual-design specified sunshine for the slide active-highlight, but CountableObject's only built-in highlight (`selected`) draws a sky ring. Palette intent and primitive capability diverge; neither skill flags that the highlight color is primitive-owned.
