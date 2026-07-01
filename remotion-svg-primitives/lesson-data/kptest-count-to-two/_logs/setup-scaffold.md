# setup-scaffold (Wave: SETUP)

## INPUTS READ
- `.agents/skills/complete-video-pipeline/SKILL.md` (orchestrator overview — folder/command contract)
- `lesson-data/kptest-count-to-two/brief.md` (human input — present, non-empty, 911 bytes)
- `lesson-data/kptest-count-to-two/pipeline.json` (present, non-empty, 616 bytes)

## OUTPUTS WRITTEN
- `lesson-data/kptest-count-to-two/_logs/setup-scaffold.md` (this file)

(No files authored — brief + pipeline.json already existed; scaffold was a no-op confirmation.)

## COMMANDS RUN
- `ls -la lesson-data/kptest-count-to-two/` → confirmed brief.md + pipeline.json pre-exist (plus downstream artifacts from prior waves already present for this run); exit 0
- `read brief.md` → Style=`default`, lessonId context confirmed
- `read pipeline.json` → extracted `constPrefix` + `composition` verbatim (see KEY DECISIONS)

## KEY DECISIONS
- brief.md verified present → not blocked.
- pipeline.json verified present and non-empty → did NOT re-run `npm run lesson:scaffold` (already scaffolded; re-scaffolding could clobber the existing mechanical config the downstream waves already resolve against).
- STATE PROMOTE (copied VERBATIM from pipeline.json):
  - `camelLessonId` = `kptestCountToTwo`  (pipeline.json `voice.constPrefix`)
  - `composition` = `CompleteKptestCountToTwoLesson`  (pipeline.json `composition`)
- Paths pipeline.json declares:
  - timing module: `src/lessons/generated/kptestCountToTwoTiming.ts`
  - timeline (cuePlan): `lesson-data/kptest-count-to-two/script-cues.json`
  - composition entry: `src/index.ts` (composition id `CompleteKptestCountToTwoLesson`)
  - voice wav: `public/audio/kptest-count-to-two-voice.wav`
- brief **Style.** value = `default`

## ISSUES
- (none)

## PIPELINE FINDINGS
- The setup-scaffold node re-runs cleanly on a lesson whose pipeline.json already exists, but the prompt's STEP 2 ("if missing, scaffold") does not specify what to do when files are present — a no-op confirmation is the correct read, but making that explicit in the skill would reduce ambiguity for resumed runs.
