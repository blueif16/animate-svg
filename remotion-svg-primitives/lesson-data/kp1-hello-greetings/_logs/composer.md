# kp1-hello-greetings — W4a composer log

## INPUTS READ
- src/lessons/kp1HelloGreetingsLessonTimeline.ts — reconciled `kp1HelloGreetingsCues` (the cue windows; via reconcileCueTimeline over the frozen ASR + silences)
- src/lessons/generated/kp1HelloGreetingsTiming.ts — ASR-aligned cue boundaries (intro [8,94], meet-hello [112,199], intro-self [228,334], part-goodbye [372,439], recap [468,602]; audioDuration 620)
- lesson-data/kp1-hello-greetings/visual-design.md — Visual Contract, zones, per-cue motion budget, two-pulse rule
- lesson-data/kp1-hello-greetings/audio-captions.md — narration/caption plan, emphasis flags
- lesson-data/kp1-hello-greetings/audio-cues.json — bed `literacy-playful-76`, intro sting `kids-section-lift`, outro resolve, SFX→beat map (whoosh/pop×4/chime)
- lesson-data/kp1-hello-greetings/primitive-gap-scan.md — ZERO new primitives; ONE new asset `girl-face`; REUSE DialogueExchange + ReadAlongHighlight + LessonIntroCard + PulseCircle + Breathe + IconAsset
- lesson-data/kp1-hello-greetings/pedagogy.md — per-cue discoveries (audited against the render)
- src/lessons/kp1HelloGreetings/primitiveChecks.tsx — W3b verification stills (the exact wiring template: figureRadius 120, FACE_WIDTH 240, speakerGap 560, wordGlyph as <text> not <tspan>, nameTag pattern)
- Component sources: motion-primitives/{DialogueExchange,ReadAlongHighlight,PulseCircle}.tsx, shape-primitives/{literacy.tsx→LessonIntroCard, asset.tsx→IconAsset}
- Templates: Kp1FenYuHeIntroLessonScene/Complete + kp1FenYuHeIntro/{layout,manifest}.ts; CompleteComparisonLesson (the only Complete that wires bgm+sfx+stings)
- .agents/CAPABILITIES.md, src/capabilities/catalog-digest.md, manifestTypes.ts, _measure/measureHook.ts, theme.ts (video=1280×720)

## OUTPUTS WRITTEN
- src/lessons/kp1HelloGreetingsLessonScene.tsx — the scene (frame-driven, cue-bounded, ZERO frame literals / ZERO raw motion literals)
- src/lessons/CompleteKp1HelloGreetingsLesson.tsx — Complete wrapper: LessonAudioLayer + LessonBgmLayer (bed=literacy-playful-76, mechanical envelope over voiceover windows) + LessonSfxLayer (composer-owned frames) + intro/outro stings + LessonCaptionLayer
- src/lessons/kp1HelloGreetings/layout.ts — offset constants (geometry + cue-relative *_REL_START)
- src/lessons/kp1HelloGreetings/manifest.ts — LESSON_MANIFEST (load-bearing elements bboxAt + keyFrames)
- src/Composition.tsx — added CompleteKp1HelloGreetingsLesson re-export
- src/Root.tsx — added import + `<Composition id="CompleteKp1HelloGreetingsLesson">`

## COMMANDS RUN (+exit + key output)
- `npm run lint` (eslint + tsc) — exit 0 (clean; fixed: unused `interpolate`/`BUBBLE_CY`, duplicate measureProps import)
- `npm run lesson:check -- --config … --measured` — exit 0 (advisory). FINAL: linear summary.collisionCount=0; measured.collisionsMeasured=2 (by-design recap-pulse∩arc); gates: contrast PASS 0/5, legibility PASS 0/5, motion PASS; WARN lufs (pre-loudnorm) + caption-redundancy (false positive, see ISSUES)
- `npm run lesson:animatic -- --config …` — exit 0; cue-start markers align with audio onsets; total ~20.24s; no boundary misalignment
- `npm run lesson:render -- --config …` — exit 0; voice auto-skipped (frozen); 607-frame MP4; loudnorm pass applied
- `ffmpeg loudnorm print` on the final MP4 — Input Integrated -16.0 LUFS / True Peak -3.2 dBTP (on target)
- `npx remotion still … --frame=256` (intro-self climax) + `--frame=560` (recap) — graded against the Contract (PASS)

## KEY DECISIONS
- **Composition is 1280×720** (theme `video`), NOT the 1920×1080 visual-design assumed. kids-eye minimums are %-of-short-side so they translate; all geometry built at 1280×720 (W3b finding honored).
- **One DialogueExchange per teaching cue** (meet-hello / intro-self / part-goodbye), each gated to its cue window; the two figure nodes (GIRL_FACE girl-face, BOY_FACE boy-face) are the SAME shared instances every cue → identity invariant intro→recap. Component fires bubble pop (PopIn bouncy) + wave + the I'm emphasis PulseCircle BY INDEX from atFrame = cueStart + EXCHANGE_REL_START.
- **Two coral pulses total** (budget): #1 the intro-self I'm (DialogueExchange emphasis:true), #2 the recap closing PulseCircle. No third accent.
- **Read-along glyphs are fixed NAVY `<text>` nodes** (not currentColor): the orange "active" signal rides the cursor+glow+swell, so the word being said is a moving orange highlight over always-legible navy text. Tinting the glyph orange dropped it to ~1.6:1 on cream (the contrast gate flag) for the very word the child must read — navy keeps it ≥12:1 while the swell+ring still mark active.
- **Vertical stack budget** (lift STAGE_CY to 272): figure → "Sam" nameCard (intro-self only) → read-along row must all fit ABOVE the bottom-docked caption ribbon (HTML overlay, top ≈ y560). Tuned READALONG_CY=510 and RECAP_CY=480 so neither the swelled "I'm" nor the recap arc is occluded by the ribbon (an early draft put read-along at y600 → "I'm" hidden behind the ribbon; fixed).
- **Recap closing pulse** focused on the arc's middle row (smaller radius) so it punctuates without enveloping all three phrases.
- **SFX frames are composer-owned**, derived from cueStart + the SAME layout offsets the motion uses (whoosh on intro card resolve; pop on each bubble entrance incl. the 2nd farewell one turn-step later; chime on the recap close). Bed envelope is mechanical (literacy-playful-76, 185s ≥ 20.7s lesson, never loops).
- **Breathe wraps** the static load-bearing groups (title card, intro cast, recap cast) with distinct phaseSeeds (rule #6).

## ISSUES
- **caption-redundancy gate = FALSE POSITIVE for this lesson (5/5 jaccard=1.0).** The gate compares `caption` vs `phrase`, which for kp1-hello-greetings are the SAME Chinese narration (the Wave 2b caption plan = spoken narration verbatim; `phrase` = its ASR-stripped form). jaccard=1.0 is correct + expected — this is exactly the "caption≈narration expected" literacy case the gate's `isLiteracyLesson` exemption exists for. The pedagogy division of labor (English in the picture, Chinese in the ribbon) is enforced by the scene's ZONES, not by caption-vs-narration divergence. Justified ignore (the gate is advisory; exit 0). Fix is a shared-script change → pipelineFinding, NOT a lesson edit.
- **overlap-measured = 2 (recap-pulse ∩ readalong-recap, ratio=1) — BY DESIGN.** The closing coral PulseCircle (zone-marks) is specified by visual-design as the recap punctuation pulse fired OVER the arc (pulse #2 of 2). A punctuation ring MUST sit on the arc; moving it off breaks the "closing punctuation over the arc" pedagogy. Same intentional class as the allow-listed marks∩objects (a teacher mark tracing teaching content). The ring is thin (6px stroke, opacity ≤0.7, expanding) and does not obscure the glyphs — confirmed in the rendered recap still. Justified by-design adjacency, not crowding.
- **lufs WARN (-17.2) is the PRE-loudnorm source measurement.** The render's deterministic ffmpeg loudnorm 2nd pass normalized the final MP4 to -16.0 LUFS / -3.2 dBTP (verified post-render). Resolved at render.

## PIPELINE FINDINGS (W4a backlog)
- **`scripts/lesson-measured.mjs` `isLiteracyLesson` regex misses English-greetings lessons.** It matches `/pinyin|literacy|hanzi|tone|phon/` but not `kp1-hello-greetings` (PEP English Unit 1). Any lesson whose caption verbatim-equals its narration (the standard caption plan) trips caption-redundancy at jaccard=1.0. Extend the detector to cover English/greetings/PEP language lessons (e.g. add `hello|greet|english|pep|unit`), OR — more robustly — gate redundancy on caption-vs-ON-SCREEN-LABEL text, not caption-vs-narration (the real "is the ribbon just repeating what's drawn?" question), since for a divided-labor lesson the caption SHOULD equal the narration.
- **The contrast gate samples the ACTIVE read-along glyph tint.** A reward-orange-on-cream active word measures ~1.6:1 — below 4.5:1 — even though the swell+underline+glow mark it. Either the gate should treat a swelled+ringed+underlined glyph as exempt (it has multiple non-color affordances), or the kit's ReadAlongHighlight should default to keeping the glyph ink dark and signaling active via the cursor/glow only. This lesson worked around it by baking navy glyphs; the kit default (`currentColor` → active glyph takes highlightColor) is a latent contrast trap for any cream-canvas lesson using a light highlightColor.
- **No `lesson:contact-sheet` standalone without an MP4.** `npm run lesson:contact-sheet` errored "MP4 not found — render first"; only the `lesson:check`/`lesson:render` action-aware sheets work pre-render. A standalone composition-sampling contact sheet (no MP4 dependency) would help iterate before the multi-minute render.
- **DialogueExchange bubble can reach the frame top edge.** With the stage lifted to STAGE_CY=272, the bubble center is y≈56 and its top edge sits at ~y-2 (just at/above the frame top). It still renders fully here, but a taller bubble or larger figureRadius would clip. A `clampBubbleToFrame` or a min-Y guard in the component would make stage placement less fiddly.
- **primitiveChecks.tsx was the single most useful input** — it encoded the exact, verified wiring (sizes, the <text>-not-<tspan> rule, beat weights). Worth formalizing: W3b should always emit a "wiring recipe" the composer copies, not just verification stills.
