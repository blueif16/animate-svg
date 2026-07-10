# setup-scaffold — kptest-count-three

Mechanical setup node. Makes the lesson runnable; authors NO lesson content.

## INPUTS READ
- `.agents/skills/complete-video-pipeline/SKILL.md` (orchestrator overview — folder/command contract)
- `lesson-data/kptest-count-three/brief.md` (human input; **Style. = default**)
- `lesson-data/kptest-count-three/pipeline.json` (pre-existed; verified parse + promote fields)
- `lesson-data/_template/pipeline.json` + `scripts/scaffold-lesson.*` (confirm pipeline.json == scaffold output, not hand-edited)

## OUTPUTS WRITTEN
- Confirmed pre-existing (NOT re-authored): `lesson-data/kptest-count-three/brief.md`, `lesson-data/kptest-count-three/pipeline.json`
- Skeleton dirs ensured (`mkdir -p`, all pre-existed): `out/kptest-count-three`, `public/audio/kptest-count-three`, `lesson-data/kptest-count-three/_logs`
- Authored this turn: `lesson-data/kptest-count-three/_logs/setup-scaffold.md`

## COMMANDS RUN
- `mkdir -p out/kptest-count-three public/audio/kptest-count-three lesson-data/kptest-count-three/_logs` → exit 0 → `OK mkdir`
- `node -e "require pipeline.json"` → exit 0 → `parse:ok`; voice.constPrefix=`kptestCountThree`; composition=`CompleteKptestCountThreeLesson`
- `cat lesson-data/_template/pipeline.json` + scaffold script → field set matches actual pipeline.json exactly (un-hand-edited)

## KEY DECISIONS
- pipeline.json already existed (Jul 9 23:06) → STEP 2 condition ("if missing") not met → did NOT re-scaffold; verified parse + fields instead.
- Un-hand-edited: actual pipeline.json field set == `_template/pipeline.json` after `{{lessonId}}`/`{{camelLessonId}}`/`{{compositionName}}` substitution.
- **Style. = default** (from brief).
- Declared paths from pipeline.json:
  | thing | source field | value |
  |---|---|---|
  | timing module (ASR .ts) | `voice.alignOutTs` | `src/lessons/generated/kptestCountThreeTiming.ts` |
  | composition (registered name) | `composition` | `CompleteKptestCountThreeLesson` |
  | timeline | — (no field) | convention-derived (Wave 3.5) → `src/lessons/kptestCountThreeLessonTimeline.ts` |
- State-promote fields both present: `voice.constPrefix`=`kptestCountThree` (→ camelLessonId), `composition`=`CompleteKptestCountThreeLesson`.
- Other declared paths (for reference): `cuePlan`=lesson-data/kptest-count-three/script-cues.json; `voice.out`=public/audio/kptest-count-three-voice.wav; `output`=out/kptest-count-three/kptest-count-three.mp4.

## ISSUES
- (none blocking — all required artifacts exist)

## PIPELINE FINDINGS
- The setup prompt asks for "the exact paths pipeline.json declares for the timing module + timeline + composition," but pipeline.json has NO `timeline` field (template confirms). The reconciled timeline is convention-derived by Wave 3.5 (`src/lessons/<camel>LessonTimeline.ts`). Either the scaffold template should declare a timeline path, or downstream voids should stop asking setup for a declared timeline. Reported; handled by stating the derived path.
- Re-running setup-scaffold when pipeline.json + all skeleton dirs already exist is a no-op. Consider an engine-level short-circuit that skips dispatching setup-scaffold when the driver artifacts + dirs already exist — saves a node/tool pass on pipeline resume.
