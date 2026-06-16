# setup — tier-2 log (kptest-first-second-third)

## INPUTS READ
- /Users/tk/Desktop/animation-test/.agents/skills/complete-video-pipeline/SKILL.md (folder/command contract)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-first-second-third/brief.md (human input — verified present, non-empty)

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-first-second-third/pipeline.json (scaffolded, NOT hand-edited)
- this log

## COMMANDS RUN
- `cd remotion-svg-primitives && npm run lesson:scaffold -- --id kptest-first-second-third` — exit 0.
  Key stdout: `Wrote lesson-data/kptest-first-second-third/pipeline.json`, `lessonId: kptest-first-second-third`, `composition: CompleteKptestFirstSecondThirdLesson`, `constPrefix: kptestFirstSecondThird`.

## KEY DECISIONS
- brief.md already existed → no blocking; pipeline.json was missing → scaffolded from `_template/` + `_shared/voice.json` per skill (never cloned from another lesson).
- pipeline.json declared values (verbatim):
  - lessonId: `kptest-first-second-third`; fps 30; brief **Style.** = `default`
  - composition: `CompleteKptestFirstSecondThirdLesson`
  - cuePlan: `lesson-data/kptest-first-second-third/script-cues.json`
  - output: `out/kptest-first-second-third/kptest-first-second-third.mp4`
  - voice.out: `public/audio/kptest-first-second-third-voice.wav`
  - voice.metaOut: `out/kptest-first-second-third/gemini-voice.json`
  - voice.alignOutJson: `out/kptest-first-second-third/asr-alignment.json`
  - voice.alignOutTs (timing module): `src/lessons/generated/kptestFirstSecondThirdTiming.ts`
  - voice.constPrefix: `kptestFirstSecondThird` → derived timeline path for W3.5: `src/lessons/kptestFirstSecondThirdLessonTimeline.ts`; derived v4 clips module: `src/lessons/generated/kptestFirstSecondThirdClips.ts`

## ISSUES
- none

## PIPELINE FINDINGS
- pipeline.json declares the ASR timing module (`alignOutTs`) but not the v4 per-cue clips module nor the W3.5 timeline path — downstream waves derive both from `constPrefix` by convention. If the scaffold emitted them explicitly, later nodes would not need to re-derive the convention.
- Scaffold stdout says "Next: write brief.md and start Wave 1 (lesson-storyboard)" — stale message: brief.md precedes scaffold in this workflow and Wave 0 (pedagogy) precedes Wave 1. Cosmetic, but it contradicts the wave order a cheap executor might trust.
