# kptest-count-three — Verification (W6)

## Verdict: YELLOW

All hard gates PASS (bbox-binding, legibility, caption-hard-kill, lufs, truncation) and the cardinality discovery is strongly supported by the bbox migration arc; EMPTY punch-list of lesson defects. YELLOW is a VERIFICATION-COMPLETENESS caveat, not a lesson defect: this node's model cannot view image files, so the canonical contact-sheet teach-test was run by data-proxy (bbox-manifest opacity + geometry progression), and the qualitative SOUND ear-pass was run declaratively (audio-cues.json) + loudness-by-measurement — neither the visual teach-test nor the melody/SFX-under-narration ear checks were performed by eye/ear. Two human confirmations are requested below; no wave re-run is required because no data-driven failure exists.

## Verification constraints (shape the verdict)
- **Model is blind to images.** `read(kptest-count-three-contact.png)` returned "model does not support images"; the same holds for `critique-frames/` and `measured-frames/*.png`. The §1 teach-test and stagnation-at-a-glance were therefore performed INDIRECTLY from `bbox-manifest.json` per-frame opacity + bbox geometry (see per-cue table). A human should run the canonical single-image review.
- **Sound ear-pass deferred.** `audio-cues.json` declares duck/bed/SFX; loudness was directly measured on the deliverable mp4. The qualitative "melody not hummable under narration / duck depth / SFX below voice / ta-da once" checks need a human ear (node can't hear its mp4).
- **Scene-source text-audit out of read-scope.** `src/lessons/generated/*LessonScene.tsx` + `manifest.ts` are outside this node's DRIVER-READ-SCOPE, so the skill's scene-source text-vs-audio + raw-motion-literal greps were NOT run. Replaced by: declared on-screen strings (visual-design §3 text-budget) vs spoken phrases (script-cues.json) vs ASR (audio-gate.json) — DECLARED proxy, not source-verified.

## Per-cue pedagogy verdict (data-proxy teach-test)

| cue | discovery (pedagogy) | data evidence (bbox-manifest measured) | verdict |
|---|---|---|---|
| topic-intro | announce topic (frames both discoveries) | intro-card opacity 1, W grows 368→411–412 over f4→18→57→91 (title write-on animated); apples/ord-tags/total-three opacity **0 across f4–91** → title reads ALONE, no premature apples ✓ | PASS |
| count-climb | one apple = one count word (一,二,三), in order; tag attaches per-apple; apples stay put, identity+tag preserved; NO total yet | apples opacity 0→1 across f118→122 (entrance); ord-tags group grows 255→270→294 over f122→321 (tags attaching progressively); total-three opacity **0 across the ENTIRE cue (f115–445)** → no count-total leakage ✓; narration continuous 12.27s, no dead-air (audio-gate); ASR confirms spoken 一/是二/是三 + spoken numerals map to on-screen num tags 1/2/3 by design. Reservation: group getBBox is geometry-based, so bbox W can't prove apple-by-apple TIMING — the one-by-one arrival is DECLARED (visual-design reading-order) and pacing-plied by 12.27s tri-arrival narration, but the contact sheet is the sole proof | PASS w/ reservation |
| cardinality | last number (3) = how many altogether; "3" re-scopes from per-apple tag to whole-group cardinal; apples quiet underneath; picture shows 3→whole FIRST, then voice names total | total-three starts small at y=210/W=96 (zone-badges) f532–644, then **migrates UP to y=35.8 + scales to W=H=140.5** (zone-total) by f714; ord-tags collapses to H=0 at f714 (1&2 receded); apples stay opacity 1 W≈539 y≈314 (carried quiet underneath) → big "3" + 3 quiet-apples = the 3↔whole picture ✓. Migration done at f714; spoken "三个" lands late (narr-end f751) → picture-leads-voice ✓ (~37fr lead) | PASS (strong) |

## Layout / gate results (bbox-manifest.json `summary` + `gates`)

| gate | result | note / justification |
|---|---|---|
| bbox-binding (declared⟺measured) | PASS | measuredNotInManifest=[], manifestNeverMeasured=[] |
| legibility | PASS | typeFloorViolations=[]; 3 elements checked; **1 safeAreaWarning** → see below |
| caption-hard-kill | PASS | violations=[]; no element crosses caption band (y=604) |
| lufs | PASS (proxy) + **deliverable CONFIRMED** | bbox gate ran pre-loudnorm voice proxy (-20.1 LUFS / -4.3 TP). Direct `ffmpeg loudnorm` on the deliverable mp4: **-16.04 LUFS integrated / -3.13 dBTP / 3.0 LRA** — ≈-16 ✓ and TP≤-1 ✓ on the actual master |
| uint truncation (audio-gate) | PASS | droneFails=0, emptyClipFails=0, deadAirWarns=0, truncationFails=0; all 3 cues coverage=1 vs ASR |
| measuredCollisionCount | 0 | collisionsMeasured=[] |
| captionIntrusionCount | 0 | — |
| `summary.gatesFailed` | [] | no gate fails |

**Advisory justification (safeAreaWarning, total-three f714):** measured bbox [569.75, 35.75, 140.5, 140.5], a 140.5-tall cardinal glyph at y=35.75 (above the safe-rect top y=118.5). This is the INTENDED placement: visual-design §1.5 declares `zone-total x=520 y=36 w=240 h=140` (the cardinal glyph sits ABOVE the apple row to re-scope for the whole group), and explicitly tolerates the 1.06× bouncy overshoot (H=140.5 vs zone h=140). 35.75px top margin on a 720px frame (~5%) is not clipped. ACCEPTED by-design — not a defect, no re-run.

## Text-vs-audio (declared on-screen strings vs spoken phrase)

| cue | on-screen target strings (visual-design §3 text-budget) | spoken phrase (script-cues) | ⊆ spoken? | finding |
|---|---|---|---|---|
| topic-intro | LessonIntroCard title + 1-line teaser (reads alone; apples hidden) | "跟老师一起，数一数，到三。" | title is "names the topic"; declared a subset topic-line | PASS (declared); source-string confirmation deferred (scene src out of read-scope) |
| count-climb | count tags **1/2/3** (numerals, the one-to-one count tag) + caption ribbon (verbatim voice) | "...一...是二...是三！" | numeral tags 1/2/3 are the count-graphic for spoken 一/二/三 (one-to-one, by design); caption = spoken phrase verbatim | PASS (by-design numeral↔spoken-word mapping is the lesson's teaching, not leakage) |
| cardinality | cardinal glyph **3** (the migrated/recoped third tag) + caption ribbon (verbatim voice); NO on-screen takeaway line refating the total (anti-pattern refused) | "现在有几个苹果呢？一起看——一共——是三个！" | glyph "3" = spoken "三个/三" (cardinal total); caption verbatim | PASS; ASR "一起看一共是三个" = phrase ✓ |

Learner-response gap affordance check: **N/A** — no cue carries `gap.reason === "learner-response"` (count-climb's tri-repetition is built-in drill inside one cue; cardinality has no recap). No "your turn" affordance is required.

## Sound checks (audio-cues.json + delivered-master measurement)

| check | result | basis |
|---|---|---|
| Deliverable master loudness | PASS | `ffmpeg loudnorm` on mp4: -16.04 LUFS / -3.13 dBTP — meets ≈-16 / TP≤-1 ✓ |
| 3-point duck (intro duck / mid-gap rise / outro resolve) | DECLARED, ear-deferred | audio-cues: intro.sting="mandarin-accent" (intro), outro.resolve=true (outro), bed="math-calm-68-cmaj" — structurally present; depth not ear-verified |
| Melody not identifiable under narration | DEFERRED | bed is calm 68-BPM C-major warmth bed; cannot ear-verify hummability under voice |
| SFX below voice / not over instruction; ta-da once | DECLARED, ear-deferred | count-climb tick perStep risingPitch (3 ticks, one per count); cardinality reward ta-da (once at resolve). Declared in audio-cues.json; not ear-verified |
| toneSafe | N/A | toneSafe=false (counting lesson, not a tone lesson) |

## Primitive checks
`out/kptest-count-three/primitive-checks/` does not exist → N/A. No primitive was (re)designed for this lesson (REUSE-only per primitive-gap-scan.md: LessonIntroCard, countable-object apple, ord-tags/number-card, CardinalConsolidation, fitUnitsToZone, Breathe, PopIn). No acceptance stills to inspect.

## Pedagogy + pacing (vs audio-captions.md / visual-design.md)
- topic-intro 3.4s narr / 3.5s motion → cue 3.8s ✓; count-climb 12.27s narr / 13.5s motion → cue 13.8s (tri-arrival = pedagogy-earned practice, not pad) ✓; cardinality 7.43s narr / 6.5s motion → cue 7.73s ✓. Total 25.33s ≈ brief ~25s ✓ (ffprobe 25.386s ✓).
- Coverage of 三 = 2 spoken (count-climb 是三, cardinality 三个) + 1 numeral-on-screen (glyph 3); 一×2/二×1 in count-climb ✓ (matches audio-captions coverage).
- Two-cue structure holds (no recap cue; cardinality beat IS the landing/retrieval) ✓.

## Punch list (mapped to owner)

| # | item | owner | action |
|---|---|---|---|
| H-1 | Visual contact-sheet teach-test: confirm count-climb apples arrive one-by-one (NOT all-at-once) AND no hold-frame stagnation; confirm cardinal glyph reads cleanly atop quiet apples | W6 / human eye | single-image review of `kptest-count-three-contact.png`; no wave re-run (bbox data-consistent) |
| H-2 | Sound ear-pass: melody not hummable under narration; 3-point duck depth; tick not over 一/二/三 instruction words; ta-da fires once at cardinality resolve | W6 / human ear | scrub mp4 sound-on; no wave re-run (declarations + lufs pass support it) |
| — | No composer/layout fix required | — | all gates pass, 0 collisions, 0 intrusions, 0 truncated cues |

**No fixes owned by W2/W3/W4/W5 are triggered** — every data-driven gate passes and the bbox arc matches the pedagogy discoveries; the two H-items are human confirmations of checks this verification node physically cannot perform (vision/audio).
