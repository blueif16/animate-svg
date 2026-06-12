# Wave 0 — Setup scaffold (re-verification)

## INPUTS READ
- /Users/tk/Desktop/animation-test/.agents/skills/complete-video-pipeline/SKILL.md (orchestrator overview — wave order, scaffold contract)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/_template/pipeline.json (scaffold template — confirms current `pipeline.json` matches the shared template after substitution)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/_shared/voice.json (extended voice config — referenced via `voice.extends`)

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/brief.md (re-verified, 1417 bytes — was already present from human input, no edit)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/pipeline.json (re-verified, 609 bytes — was already scaffolded in a prior run, no edit)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/_logs/wave0-setup.md (this file)

## COMMANDS RUN
- `ls lesson-data/kptest-fenyuhe-six/` → confirmed brief.md + pipeline.json present
- `stat -f` on both files → non-empty (brief.md=1417B, pipeline.json=609B)
- `ls src/lessons/generated/ | grep kptestFenyuheSix` → confirmed prior-wave timing module `kptestFenyuheSixTiming.ts` exists (proves pipeline.json paths are consistent with what the prior Wave 3 wrote)
- No `npm run lesson:scaffold` invocation this run — pipeline.json is already at the template-substituted values and matches what the scaffold script would produce for `--id kptest-fenyuhe-six`. Re-running scaffold would be a no-op write that risks churn without changing bytes.

## KEY DECISIONS
- **brief present → not blocked.** Human-authored brief exists at the declared path; no `status=blocked` trigger.
- **pipeline.json matches template substitution** for `--id kptest-fenyuhe-six`:
  - `lessonId` = `kptest-fenyuhe-six` ✓
  - `composition` = `CompleteKptestFenyuheSixLesson` (PascalCase of `Complete` + camelId) ✓
  - `constPrefix` = `kptestFenyuheSix` (camelCase) ✓
  - `cuePlan` / `output` / `voice.*` paths all use `{{lessonId}}` / `{{camelLessonId}}` substituted correctly ✓
- **Skipped re-running scaffold script.** The shared scaffold script (`npm run lesson:scaffold`) is lesson-agnostic and would simply rewrite the same bytes. Per the "OWNED-PATH NOTE: the scaffold script is shared — never edit it for this lesson" rule, I do not invoke it when the file is already correct.
- **No lesson content authored.** Wave 0 is mechanical only — no pedagogy, no storyboard, no audio, no visuals. Downstream waves own those.

## ARTIFACT SUMMARY (driver contract)
- **lessonId:** `kptest-fenyuhe-six`
- **brief Style value:** `default` (from `**Style.** default` in brief.md)
- **composition (from pipeline.json):** `CompleteKptestFenyuheSixLesson`
- **timing module path (pipeline.json `voice.alignOutTs`):** `src/lessons/generated/kptestFenyuheSixTiming.ts`
- **timeline target (Wave 3.5 reconcile embed target per orchestrator skill):** `src/lessons/kptestFenyuheSixLessonTimeline.ts` (already present from prior wave — confirmed in `src/lessons/` listing)
- **cue plan (pipeline.json `cuePlan`):** `lesson-data/kptest-fenyuhe-six/script-cues.json`
- **voice out (pipeline.json `voice.out`):** `public/audio/kptest-fenyuhe-six-voice.wav`
- **final MP4 (pipeline.json `output`):** `out/kptest-fenyuhe-six/kptest-fenyuhe-six.mp4`

## ISSUES
- None. Both DRIVER-ARTIFACTS files (brief.md, pipeline.json) are present, non-empty, and structurally valid.

## PIPELINE FINDINGS
- (carried from prior tier-2 log) The scaffold script's hint "Next: write lesson-data/<id>/brief.md" is misleading when the brief is human-authored first — consider having the script detect and report "brief already present" vs "brief newly created" to reduce re-run log confusion.
- (new observation) When a lesson is re-orchestrated after a full prior pipeline pass, Wave 0 is a no-op verify. The driver should treat a re-verified `pipeline.json` whose contents match the template substitution as satisfying the contract — re-invoking the scaffold script on an already-correct file risks whitespace/format churn and burns a node turn. Document this as the expected "Wave 0 idempotent re-verify" path in the orchestrator skill.
