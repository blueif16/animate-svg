# Wave: Setup (scaffold) — kp1-hello-greetings

## INPUTS READ
- `.agents/skills/complete-video-pipeline/SKILL.md` — folder/command contract.
- `lesson-data/kp1-hello-greetings/brief.md` — human input (already present). Style = `default`.
- `lesson-data/kp1-hello-greetings/pipeline.json` — read back after scaffold to capture declared paths.
- `src/lessons/*LessonTimeline.ts` (listing only) — to confirm the timeline path convention.

## OUTPUTS WRITTEN
- `lesson-data/kp1-hello-greetings/pipeline.json` — scaffolded mechanically (NOT hand-edited).
- `lesson-data/kp1-hello-greetings/_logs/setup.md` — this log.

## COMMANDS RUN
- `npm run lesson:scaffold -- --id kp1-hello-greetings` — exit 0.
  - stdout: `Wrote lesson-data/kp1-hello-greetings/pipeline.json`
  - `lessonId: kp1-hello-greetings` / `composition: CompleteKp1HelloGreetingsLesson` / `constPrefix: kp1HelloGreetings`
- `ls src/lessons/*LessonTimeline.ts` — exit 0; confirms `<camelPrefix>LessonTimeline.ts` convention.
- `mkdir -p .../_logs` — exit 0.

## KEY DECISIONS
- Authored NO lesson content (mechanical setup node only).
- Did NOT hand-edit pipeline.json — it is the mechanical source of truth for later waves.
- Style from brief = `default` (no aesthetic overlay; composer wraps no `<StylePreset>`).
- Derived timeline path from constPrefix + observed convention (scaffold does not create the timeline file; W3.5/W4 do).

## DECLARED PATHS (from pipeline.json)
- lessonId: `kp1-hello-greetings`
- composition: `CompleteKp1HelloGreetingsLesson`
- constPrefix: `kp1HelloGreetings`
- cuePlan (script-cues): `lesson-data/kp1-hello-greetings/script-cues.json`
- output MP4: `out/kp1-hello-greetings/kp1-hello-greetings.mp4`
- voice WAV: `public/audio/kp1-hello-greetings-voice.wav`
- voice meta: `out/kp1-hello-greetings/gemini-voice.json`
- ASR align JSON: `out/kp1-hello-greetings/asr-alignment.json`
- timing module (W3a): `src/lessons/generated/kp1HelloGreetingsTiming.ts`
- timeline (W3.5/W4, derived from convention): `src/lessons/kp1HelloGreetingsLessonTimeline.ts`

## ISSUES
- None. Brief present, pipeline.json scaffolded clean.

## PIPELINE FINDINGS
- pipeline.json does NOT declare the timeline-file path (`src/lessons/<camelPrefix>LessonTimeline.ts`); it is only derivable from `constPrefix` + naming convention. Later nodes must infer it. Consider emitting an explicit `timeline` key from scaffold to remove the inference and harden the W3.5/W4 contract.
- Brief.md names two registered special components by id (`DialogueExchange`, `ReadAlongHighlight`) and asserts they exist. The W3b primitive node must confirm these are actually in the registry (catalog-digest) before W4 relies on them; if absent it is a named gap, not a composer patch.
