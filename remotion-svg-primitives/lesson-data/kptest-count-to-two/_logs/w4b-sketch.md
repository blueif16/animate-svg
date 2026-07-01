# W4b Sketch Overlay — kptest-count-to-two

## INPUTS READ
- `.agents/skills/sketch-explainer-layer/SKILL.md` — full skill read
- `lesson-data/kptest-count-to-two/visual-design.md` — zones, palette, motion vocabulary, sketch budget
- `lesson-data/kptest-count-to-two/pedagogy.md` — cue discoveries, C4 cardinality as climax
- `src/lessons/kptestCountToTwoLessonTimeline.ts` — reconciled cue structure
- `src/lessons/generated/kptestCountToTwoClips.ts` — narrationFrames per cue for window computation
- `.agents/CAPABILITIES.md` — TeacherMark, boil, settle specs

## OUTPUTS WRITTEN
- `lesson-data/kptest-count-to-two/sketch-overlay.md` — full sketch-overlay spec

## COMMANDS RUN
(none — spec-only node, no bash required)

## KEY DECISIONS

| Decision | Rationale |
|---|---|
| **1 mark total (underline on C4 only)** | Budget is floor(4 × 0.6) = 2; restraint principle says only add marks that carry unique signal. C2/C3 per-apple tags already spatially mark count positions via zone placement — no mark vocabulary (label-arrow, underline) would add signal without decoration. C4 underline is the only mark that passes the sentence test. |
| **Underline, not wrap-arc or label-arrow** | The relationship is "this number is the answer" — horizontal emphasis, not a path trace (wrap-arc) or a pointer to a referent (label-arrow). Underline is the minimal-vocabulary choice. |
| **Settle on C4 underline, no boil** | Settle (magnitude 0.08) makes the climax mark land as a pen lift — matches skill guidance for climax-only settled marks. Boil omitted: the hold is ~70 frames (~2.3s), borderline for boil benefit; static ±1.5px jitter suffices without competing with the PopIn at draw time. |
| **drawOnRelativeStart=18 (not 0)** | The underline should draw AFTER the NumberCard PopIn is ~60% settled so the child first sees the card land, then the teacher confirms with the underline. Drawing on frame 0 would compete with the bouncy PopIn. |
| **fadeOutRelativeStart = min(cueLength-8, 106)** | Skill mandates fade-out 8 frames before cue end; cue length is 114 frames, so fade at frame 106. The underline has held for ~70 frames by then — enough for a 3-5 year old to read "2 = altogether." |

## ISSUES
(none)

## PIPELINE FINDINGS
(none)
