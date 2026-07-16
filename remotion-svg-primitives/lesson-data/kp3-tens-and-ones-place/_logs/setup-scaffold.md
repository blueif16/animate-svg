# setup-scaffold — kp3-tens-and-ones-place

## INPUTS READ
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp3-tens-and-ones-place/brief.md` (7434 B, present — KP3 数位与位置值)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp3-tens-and-ones-place/pipeline.json` (677 B, already scaffolded — valid JSON parse; no scaffold run needed)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/_template/pipeline.json` (read to confirm template differs from kp3 by `out/<id>/` vs `lesson-data/<id>/` output paths — kp3 pipeline intentionally keeps the lesson-data paths the brief was authored against)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/scripts/scaffold-lesson.mjs` (refuses overwrite without `--force`; respects driver spec's "if missing" guard)
- `/Users/tk/Desktop/animation-test/.agents/skills/complete-video-pipeline/SKILL.md` (orchestrator overview — confirms pipeline.json is the single source of truth, scaffold never clones a prior lesson)

## OUTPUTS WRITTEN
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kp3-tens-and-ones-place/_logs/setup-scaffold.md` (this file — tier-2 log per driver spec)
- (no edits to `brief.md` or `pipeline.json` — both already on disk and contractually correct)

## COMMANDS RUN
- `ls -la lesson-data/kp3-tens-and-ones-place/` — exit 0 (entries: `_logs/`, `brief.md`, `pipeline.json`, `storyboard.md`)
- `node -e "JSON.parse(...)" pipeline.json` — exit 0 (`valid JSON`)
- `node -e "assert(...constPrefix==='kp3TensAndOnesPlace' && composition==='CompleteKp3TensAndOnesPlaceLesson')"` — exit 0 (`OK`)
- NO `npm run lesson:scaffold` invoked — pipeline.json already exists and driver spec says scaffold only "if missing"

## KEY DECISIONS
- **NO scaffold re-run.** pipeline.json is on disk, valid, and its `constPrefix` / `composition` match the values the brief was authored against. Scaffold script also refuses without `--force`. Re-running would either no-op or overwrite a configuration the rest of the pipeline trusts.
- **STATE PROMOTE values lifted VERBATIM from pipeline.json** (single source of truth — not derived from lessonId):
  - `camelLessonId` ← `voice.constPrefix` = `kp3TensAndOnesPlace`
  - `composition` ← `composition` = `CompleteKp3TensAndOnesPlaceLesson`
- **Brief `Style.` value = `null`.** The kp3 brief organizes style content under `## Visual idiom` + `## Visual continuity with KP1 + KP2` instead of a literal `## Style.` heading. Surface the effective style summary; flag in ISSUES so downstream nodes that key on a literal `Style.` key fall back gracefully.
- **`output` field points to `lesson-data/...` not `out/...`.** The current `_template/pipeline.json` uses `out/<id>/`. The kp3 pipeline keeps the lesson-data convention. Reporting the path the pipeline actually declares — drivers downstream should treat the declared value as canonical for this lesson.
- **`timeline` path not declared by pipeline.json.** Derive from pascal(lessonId) per `complete-video-pipeline` SKILL §Wave 3.5: `src/lessons/Kp3TensAndOnesPlaceLessonTimeline.ts`. Reported alongside the declared paths.

## PIPELINE PATHS (verbatim from pipeline.json, +derived timeline)
| Field | Value |
|---|---|
| lessonId | `kp3-tens-and-ones-place` |
| fps | `30` |
| entry | `src/index.ts` |
| composition | `CompleteKp3TensAndOnesPlaceLesson` |
| cuePlan | `lesson-data/kp3-tens-and-ones-place/script-cues.json` |
| output (MP4) | `lesson-data/kp3-tens-and-ones-place/kp3-tens-and-ones-place.mp4` |
| voice.out (WAV) | `public/audio/kp3-tens-and-ones-place-voice.wav` |
| voice.metaOut | `lesson-data/kp3-tens-and-ones-place/gemini-voice.json` |
| voice.alignOutJson | `lesson-data/kp3-tens-and-ones-place/asr-alignment.json` |
| voice.alignOutTs (timing module) | `src/lessons/generated/kp3TensAndOnesPlaceTiming.ts` |
| voice.constPrefix | `kp3TensAndOnesPlace` |
| timeline (derived per Wave 3.5) | `src/lessons/Kp3TensAndOnesPlaceLessonTimeline.ts` |

## BRIEF STYLE SUMMARY (no literal `## Style.` — sub from `## Visual idiom` + `## Visual continuity with KP1 + KP2`)
Two-column counter (计数器) — left column labeled 十位, right column labeled 个位; per-column digit slot beneath; placeholder `0` visibly arrives with teacher arrow + line "0 表示个位上没有零散的一"; big slow motion; two emphasis beats allowed (bundle arrives in 十位; placeholder `0` explained). Canvas: cream + navy ink + navy `TeacherMark`. Identity-invariant with KP1/KP2 — orange `SmallStick` + coral rope-tied `BundleWrap` (top-center bow). Required NEW primitive: `PlaceValueCounter` / `TwoColumnAbacus` in `src/shape-primitives/counting.tsx`, fully prop-driven (column count, labels, content slot, digit slot, reveal progress).

## ISSUES
- **Brief has no literal `## Style.` heading.** Driver asks for "the brief **Style.** value" — kp3 brief uses `## Visual idiom` + `## Visual continuity with KP1 + KP2` instead. Style key resolved to `null`; effective style surfaced in this log's STYLE SUMMARY block.
- **Pipeline template drift.** `_template/pipeline.json` uses `out/<id>/...` for `output` / `voice.metaOut` / `voice.alignOutJson`; the kp3 pipeline.json uses `lesson-data/<id>/...`. Intentional for this lesson (brief was authored against the lesson-data form), but a follow-up run with a fresh scaffold would land on `out/...`. Pipeline json's own value remains canonical — leave as-is.
- **Sibling `storyboard.md` (14024 B) already present.** Not produced by this node — likely a prior run artifact. Driver-owns does NOT list it; this node neither reads nor edits it. Flagging in case orchestrator routing expects it under a different node.

## PIPELINE FINDINGS (workflow improvements)
- **Brief template needs a `## Style.` slot.** Many prior briefs (including kp3) put style content under ad-hoc headings (`Visual idiom`, `Visual continuity`, `Look & feel`). Adding a required `## Style.` block to the brief template — or amending the driver spec to fall back to `## Visual idiom` — would let every wave key on a single style field.
- **Pipeline.json convention drift.** `lesson-data/<id>/mp4` vs `out/<id>/mp4`. Either (a) update older pipelines to current convention, or (b) explicitly document that the declared `output` field is canonical per-lesson and downstream paths must read pipeline.json rather than assume `_template`.
- **state-promote is single-string-fragile.** `camelLessonId` and `composition` are copy-pasted into every downstream node's file paths (generated timing module, scene, Complete wrapper, registration). A typo in either field of pipeline.json silently breaks every later module path. Suggest a W0 sanity assertion: `voice.constPrefix` must equal `toCamel(lessonId)`; `composition` must equal `Complete${toPascal(lessonId)}Lesson`; reject the lesson if either mismatches.
