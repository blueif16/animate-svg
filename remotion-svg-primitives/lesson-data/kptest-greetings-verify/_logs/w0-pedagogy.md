# W0 Pedagogy Gate — kptest-greetings-verify

## INPUTS READ
- lesson-data/kptest-greetings-verify/brief.md (present, read in full)
- .agents/skills/lesson-pedagogy/SKILL.md (present, read in full)
- .agents/TEACHING-ACTIONS.md (present, read in full — for teaching-move vocabulary referenced in reinforcement lines)

## OUTPUTS WRITTEN
- lesson-data/kptest-greetings-verify/pedagogy.md

## COMMANDS RUN
- ls -la lesson-data/kptest-greetings-verify/ → exit 0 (brief.md, pipeline.json, _logs/ present; no existing pedagogy.md)
- ls -la out/kptest-greetings-verify/ → exit 0 (run-status.json present, no prior outputs)

## KEY DECISIONS
- **Lesson kind: language/L2.** The discoveries ARE utterances; §9 applies in full. §4 narration-leakage carve-out active for all English target tokens.
- **6 cues, 3 target phrases.** Hello/Hi (1 greet cue), I'm Sam (3 cues: slow model → choral echo → learner gap), Goodbye/Bye-Bye (1 farewell cue), recap (1 spaced-recall cue).
- **I'm gets the full acquisition stack** (slow model + choral + gap + spaced recall = ~7 exposures). This is the `key_difficult` target — /aɪm/ is absent from Mandarin phonology.
- **Hello/Hi and Goodbye/Bye-Bye get minimal reinforcement** (~3–4 exposures each including recap). Low difficulty — familiar actions, new sounds only.
- **Spaced, not massed.** The farewell cue sits between the I'm learner gap (C4) and the recap (C6), providing natural spacing so the final I'm retrieval is genuine recall, not echo.
- **Encounter continuity preserved.** C1–C5 form one continuous gate encounter (meet → introduce → part). C6 is a brief recap montage — the same characters, same setting, no scene break.
- **Cognitive ladder: all cues at concrete stage.** No represent or symbolize stages — this is first-contact L2 acquisition; the child operates on the real encounter.
- **One cognitive task per cue.** C1 = hear and map the greeting sounds. C2 = hear the /aɪm/ sound. C3 = produce /aɪm/ with support. C4 = produce /aɪm/ alone. C5 = hear and map the parting sounds. C6 = retrieve all three.

## ISSUES
- None

## PIPELINE FINDINGS
- None — clean first wave, no friction in inputs or process.
