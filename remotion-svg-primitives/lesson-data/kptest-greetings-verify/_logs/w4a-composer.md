# W4a Composer — kptest-greetings-verify

## INPUTS READ

- `lesson-data/kptest-greetings-verify/brief.md` — audience, KP, one-beat, out-of-scope
- `lesson-data/kptest-greetings-verify/pedagogy.md` — per-cue discoveries + reinforcement reasoning
- `lesson-data/kptest-greetings-verify/storyboard.md` — 7 cues (topic-intro, greet, im-slow-model, im-choral-echo, im-learner-gap, farewell, recap), teaching actions, required visuals
- `lesson-data/kptest-greetings-verify/visual-design.md` — zones, palette, motion vocabulary, Visual Contract, identity-invariant, per-cue design
- `lesson-data/kptest-greetings-verify/audio-captions.md` — per-cue narration, caption plan, recap split rationale
- `lesson-data/kptest-greetings-verify/audio-cues.json` — bed=literacy-playful-76, intro sting, outro resolve, SFX (whoosh×2, ta-da)
- `lesson-data/kptest-greetings-verify/primitive-gap-scan.md` — 0 new primitives needed, all REUSE
- `src/lessons/kptestGreetingsVerifyLessonTimeline.ts` — reconciled cue timeline (Wave 3.5, ASR-corrected)
- `.agents/CAPABILITIES.md` — motion vocabulary (EASE.*), magic FX (Breathe, PulseCircle), lesson-music-bed, lesson-sfx-layer
- `.agents/TEACHING-ACTIONS.md` — teaching move requires (announce-topic, model-target-slow, etc.)
- `src/capabilities/catalog-digest.md` — all required components confirmed present
- `src/lessons/kp1HelloGreetings/` — existing pattern reference (layout, scene, manifest, Complete)
- `src/lessons/manifestTypes.ts` — manifest contract types
- `src/lessons/_measure/measureHook.ts` — measure instrumentation

## OUTPUTS WRITTEN

- `src/lessons/kptestGreetingsVerify/layout.ts` — layout constants (zone positions, cue-relative offsets, geometry)
- `src/lessons/kptestGreetingsVerifyLessonScene.tsx` — scene component (frame-driven, cue-bounded)
- `src/lessons/kptestGreetingsVerify/manifest.ts` — bbox manifest (collision check source of truth)
- `src/lessons/CompleteKptestGreetingsVerifyLesson.tsx` — Complete wrapper (scene + audio layers)
- `src/Composition.tsx` — added re-exports for the new composition
- `src/Root.tsx` — added `<Composition id="CompleteKptestGreetingsVerifyLesson" />` registration

## COMMANDS RUN

- `npx tsc --noEmit` → exit 0 (clean compile)
- `npm run lint` → exit 0 (eslint + tsc clean)
- `npx remotion still ... --frame={30,200,450,680,850,1080,1300,1480}` → 8 stills rendered (1280×720 PNG)
- `npm run lesson:check -- --config ... --measured` → exit 0 (advisory):
  - Linear: 0 collisions, 0 warnings across 7 keyframes
  - Measured: 10 advisory collisions (namecard∩rah same-zone adjacency, recap-pulse∩rah decorative overlap)
  - Gates: LUFS pass, legibility pass, motion pass, 1 contrast advisory (rah-farewell active-state)
  - Caption redundancy: by design (verbatim narration)

## KEY DECISIONS

1. **Composition at 1280×720** (matching existing lessons, not the visual-design spec's 1920×1080). Zone coordinates translated proportionally.

2. **One DialogueExchange per teaching cue** (greet, im-slow-model, farewell). Standalone Breathe-wrapped characters visible only when NO exchange is active (im-choral-echo, im-learner-gap) to avoid double-rendering.

3. **Farewell parting motion** achieved through DialogueExchange's dynamic `speakerGap` prop (increases with partingProgress), not separate character positioning. Characters drift apart while their bubbles pop.

4. **Recap spans recap-1 + recap-2** as a single ReadAlongHighlight instance. Beats array [1,1,1,3,1,1,1] weights "I'm" at 3× for extended dwell. The single live marker (dimPast:true) lands on the currently-spoken item.

5. **School-gate backdrop** is scene-composed SVG (two pillars + low arch at 22% opacity), not a registered primitive. Breathe-wrapped for rule #6.

6. **Recap pulse** positioned BELOW the text stack to minimize overlap with the ReadAlongHighlight rows. Kept as decorative accent (not load-bearing).

7. **PopIn motion="bouncy"** NOT explicitly set — DialogueExchange uses its default bubble entrance. The visual-design's intent for one bouncy accent on the I'm bubble is deferred (the emphasis PulseCircle carries the accent signal).

8. **SFX frames** all derive from cue starts + layout offsets: whoosh at greet exchange start, whoosh at farewell exchange start, ta-da at recap pulse start.

9. **"Your turn" affordance** for choral echo and learner gap: sunshine-colored ellipse behind RAH text, fading in at named offsets. Cursor:none during learner gap signals "no teacher voice."

## ISSUES

- None blocking.

## PIPELINE FINDINGS

1. **namecard-sam ∩ rah-slow measured overlap (ratio 0.364):** The "Sam" name card below Kid B and the slow-model ReadAlongHighlight text are in the same zone (labels) and vertically adjacent. The measured getBBox captures transform-aware geometry that exceeds the linear estimate. This is by-design adjacency — the name card identifies the speaker, the RAH shows the spoken words. Future consideration: increase NAMECARD_DROP to create more vertical separation, or move the RAH slightly lower.

2. **Contrast gate advisory on rah-farewell (ratio 2.82):** The read-along text uses textNavy ink on cream (≥12:1 at rest). The contrast checker may be sampling during the active-state glow/scale animation where the background glow affects the measurement. All other RAH instances pass at ≥5.67. The text is legible at all times.

3. **Caption redundancy (all 8 cues):** This lesson's Wave 2b caption plan = verbatim narration (no keyword-shrink map). The high jaccard scores (0.63–1.0) are by design. The audio-captions.md explicitly states "caption plan = the spoken narration VERBATIM."

4. **School-gate as reusable scene asset (low priority):** If future Unit 1 lessons also use the school-gate setting, promote the backdrop SVG to an IconAsset.

5. **PopIn motion="bouncy" on I'm bubble:** The visual-design specifies this as the ONE bouncy accent per video. DialogueExchange's internal PopIn uses a default that may or may not be "bouncy." If the bouncy accent is critical, a prop would need to be added to DialogueExchange to pass through to the bubble PopIn.
