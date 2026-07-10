# W4a — composer — kptest-count-three

## INPUTS READ
- SKILL: `.agents/skills/remotion-lesson-composer/SKILL.md` (composer rules; ZERO frame/raw-motion literals; count-on spoken enumeration binds to `cue.tokenOnsets`; caption fade-anchor at onset; moving-hold `<Breathe>`).
- `.agents/TEACHING-ACTIONS.md` (announce-topic title-alone / cast-enters-after; count-on one-item-per-spoken-number in sync; reveal picture-leads voice).
- Reconciled timeline `src/lessons/kptestCountThreeLessonTimeline.ts` → 3 cues: `topic-intro` (0–114), `count-climb` (114–528), `cardinality` (528–760); `kptestCountThreeDuration=760`; `kptestCountThreeVoiceClips`; tokenOnsets present and CUE-LOCAL (verified by running the timeline under tsx).
- Generated clips `src/lessons/generated/kptestCountThreeClips.ts` (frozen). (The sibling `…Timing.ts` in `generated/` is DEAD — the timeline imports `…Clips` + `reconcileClipTimeline`, not the old ASR timing.)
- `lesson-data/kptest-count-three/{brief,storyboard,visual-design,audio-captions,audio-cues.json,primitive-gap-scan}.md` + `audio-cues.json`.
- `src/capabilities/catalog-digest.md` + `.agents/CAPABILITIES.md` (primitive intent + prop signatures; PopIn/NumberCard/CountableObject/LessonIntroCard/Breathe prop interfaces confirmed by reading the barrels + the exported Props types).
- `_cues/cueAccessors.ts`, `_measure/measureHook.ts`, `manifestTypes.ts`, `lessonRegistryTypes.ts`, `theme.ts`.

## OUTPUTS WRITTEN (driver artifacts)
- `src/lessons/kptestCountThreeLessonScene.tsx` (full rewrite)
- `src/lessons/CompleteKptestCountThreeLesson.tsx` (full rewrite)
- `src/lessons/kptestCountThree/layout.ts` (full rewrite)
- `src/lessons/kptestCountThree/manifest.ts` (full rewrite)
- (prior run's stale 5-cue scene/wrapper/layout/manifest + `_qaStillEntry.tsx` were for an OLD storyboard with `count-onset/cardinality-reveal/total-ask/total-recall` + a your-turn gap; the current 3-cue / zero-gap timeline required a clean rewrite.)

## COMMANDS RUN (+exit, key stdout)
- `npm run registry:check-lesson -- …/primitive-gap-scan.md` → exit 0: all 8 named components registered (preflight).
- `npx eslint <my 4 files>` → exit 0, after the group-opacity fix too (lint-clean).
- `npm run lesson:check -- --config …/pipeline.json` → ABORTED at the contact-sheet step (needs the MP4 not yet rendered) before the measured pass; the measured pass runs separately.
- `node scripts/lesson-measured.mjs --config …/pipeline.json` → EPERM `mkdir out/kptest-count-three/measured-frames` (sandbox blocks NEW writes under `out/`), so bbox-manifest.json not written by my node.
- Diagnostic measured pass (a /tmp copy of `lesson-measured.mjs` with line 348 `outDir` redirected to `/tmp/kp3-measured`; the REAL script is untouched; same bundle/manifest via cwd=repo): `method=getBBox`, `measuredCollisionCount=0`, `captionIntrusionCount=0`, bbox-binding PASS, type-floor PASS, caption-hard-kill PASS; only WARN = legibility(safe-area) on `total-three` (advisory). First run flagged 16 collisions — all `apples/ord-tags/total-three ∩ intro-card` at intro frames 4–91 (the measured `<g>`s had opacity 1 while PopIn children were opacity 0); fixed by adding a group-visibility STEP opacity (0 until the group's first onset, 1 after) on each measured `<g>` — visually inert, makes the opacity-aware gate skip the not-yet-entrance bbox during the intro. Re-run → 0 collisions.

## KEY DECISIONS
- **count-on onset binding (the hard rule).** `cue.tokenOnsets` ARE present for count-climb (`一`@idx0=6, `二`@idx17=189, `三`@idx31=361, cue-local) → apples + tags + SFX ticks bind to `countStart + tokenOnsets[idx]` = absolute 120/303/475. Branch stated: **onsets present → bound** (no fallback cadence, no `pipelineFinding` needed). `COUNT_WORD_TOKEN_INDICES=[0,17,31]` distinguishes the count numerals from the classifier `一` (一个/又一个/最后一个).
- **identity-invariant 三.** ONE `NumberCard` instance `total-three` lives the whole video: per-apple count tag #3 at (apple3.x, TAG_Y card 96) through count-climb → migrates UP + rescales (×1.375) + bouncy settle-pop (×1.06 peak = card 140) to (TOTAL_X=640, TOTAL_Y=106) in cardinality. No fresh pop, no fade-out/fade-in (per visual-design binding identity-invariant). The 一/二 tags (`ord-tags`) recede (scale→0) as they consolidate; the coral converging guide lines are untagged/undeclared decoration that attach to the total's resting bottom (LINE_END_Y=172), never crossing its face.
- **No CardinalConsolidation / no your-turn.** The migration composition (W3b-endorsed: "reveal's requires is met either way") was used over `CardinalConsolidation`'s self-render so the carried `三` instance keeps identity; the coral lines are hand-rolled as decoration. The current storyboard has NO learner-response gap (every cue `gapFrames=0`), so there is no your-turn affordance (the prior run's `turn-marker` was removed) and no recap cue — cardinality's reveal IS the landing.
- **announce-topic.** Apples are mounted at the scene root but each `PopIn delay` is its count-word onset (≥120) → all apples are opacity-0 (scale 0.72) through the intro; the intro card reads ALONE (f57: intro op1, others op0), then fades out over [102,114] as the apples enter at 120+. Title never overlaid by art.
- **caption presence tracks speech.** A composer-derived `captionCues` array end-anchors each fade at the speech onset (`fromFrame = narrationStartFrame − 3`) and clamps `toFrame` to `narrationEndFrame` when `gapFrames>0` (a no-op here — all gaps 0).
- **SFX = composer-owned motion frames.** 3 rising-pitch `tick`s at the 3 count-word onsets (risingPitch `i*2`) + 1 `ta-da` at the cardinal climax pop peak (`revealStart + REVEAL_TA_DA_OFFSET`). Bed duck-windows from `spansToWindows(voiceClip spans)`.
- **Sizing via `fitUnitsToZone(zone-objects, 3, target 155)`** (no hand-picked dot size); tags 96-card / glyph 54 (≥48 primary floor); total 132-card / glyph 74 climax.

## ISSUES
- **Sandbox EPERM on new `out/` writes** blocked my node from creating `out/kptest-count-three/bbox-manifest.json` + `measured-frames/` (and from `npx remotion still` clearing the webpack cache). The real `bbox-manifest.json` is produced by the harness's DRIVER-OP post-run `lesson-measured.mjs` (its `outDir` is hardcoded to `out/<lessonId>`, needs a writable `out/` — the harness context). I verified the measured pass CLEAN via the /tmp-redirected diagnostic.
- **Model cannot display images** in this session, so the render-and-self-critique was graded against the measured per-frame geometry (bboxes + effective opacity) rather than pixel inspection; the measured stills exist on disk at `/tmp/kp3-measured/measured-frames/f{4..714}.png` for human review. Per-frame geometry confirms the Visual Contract (see report-back).

## PIPELINE FINDINGS
- `audio-cues.json` declares `intro.sting` ("mandarin-accent") and `outro.resolve` but the narration-kit's documented `LessonBgmLayer` surface (`CAPABILITIES#lesson-music-bed`) exposes only {bed, windows, totalFrames} — no intro/outro sting wiring; the sting is NOT mounted. Suggest documenting a sting layer / intro-outro props on the bed layer.
- The measured script's `outDir`/`framesDir` is hardcoded to `out/<lessonId>` with no override; under a sandbox that blocks new `out/` writes the measured pass EPERMs at `mkdir measured-frames` and leaves `method=skipped`. Consider reading `outDir` from `config.output` (or an env) so it can run against a writable dir.
- `tokenOnsetFrame`/`stepFramesFromOnsets` kit-helper return space (cue-local vs absolute) is not documented in `catalog-digest.md`; the scene binds via the documented `cue.tokenOnsets` (cue-local) + `cue.startFrame` (→ absolute) to remove the ambiguity.
- Advisory WARN (not a hard gate): `total-three` settles above the safe-area top (y 36 < 118) per visual-design's binding zone-total (y 36–176); lowering it to satisfy safe-area would hard-collide the badges band (y 210–306), so visual-design is honored.
