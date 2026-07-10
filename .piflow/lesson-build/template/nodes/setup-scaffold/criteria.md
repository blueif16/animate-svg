# setup-scaffold — output acceptance criteria (the soft measure)

_Node-local fixture, wired via `optimize.criteria` in this dir's `node.json`. This is the JUDGING reference
`piflowctl optimize triage`/`gate` read for this node — NEVER inject it into the node's own `prompt.md` (that
teaches-to-the-test and voids the clean-room signal). Mirrors the shape of the shared
`.agents/skill-system-criteria.md` (which currently omits setup as "trivial scaffold" — see the Consolidation
note at the bottom for why that omission should be revisited)._

## Purpose
**Artifacts:** `lesson-data/<id>/brief.md` (verified pre-existing, never authored) · `lesson-data/<id>/pipeline.json`
(scaffolded, mechanical) · the promoted `camelLessonId`/`composition` state channels every downstream wave's file
paths resolve against.

**Downstream purpose.** Every later wave (W0–W6) opens `pipeline.json` for its own path slots and reads the
promoted `camelLessonId`/`composition` state channels for the generated-module/timing/composition names it writes.
`setup-scaffold` looks like a "trivial scaffold" (it authors no lesson content, runs a shared script), but it is
the SINGLE highest-leverage node in the DAG for one reason: **every other node's file paths are physically
constructed from what THIS node reports.** A subtly wrong lessonId, a stale/copied pipeline.json, or a
correct-file-but-wrong-return desyncs the entire rest of the pipeline against the wrong paths — silently, since
nothing downstream re-derives these values independently. (Leverage statement, Law 5 of the measurement-runway
method: "read ONLY this node's output — would a senior practitioner predict it forecloses the rest of the build?")

## Acceptance criteria (the checklist — coverage, not grading)
1. **Brief provenance** — brief.md is confirmed pre-existing human input; the node never authors, edits, or
   pads it. A missing brief ends in `status=blocked`, never a fabricated stand-in.
2. **Pipeline fidelity** — pipeline.json is either already valid, or freshly produced by the ONE shared
   `npm run lesson:scaffold` invocation — never hand-typed, never copy-pasted from `_template/` or another
   lesson's directory.
3. **No leftover template tokens** — pipeline.json contains no unsubstituted `{{...}}` placeholder anywhere.
4. **lessonId fidelity** — pipeline.json's own `lessonId` field names THIS run's actual lesson, not a stale or
   copied one.
5. **State-promote fidelity** — the returned `camelLessonId`/`composition` are copied VERBATIM from
   pipeline.json's `voice.constPrefix`/`composition` fields — never derived, guessed, or reconstructed from the
   lessonId string by the model itself.
6. **Return-schema completeness** — the structured return actually CARRIES `camelLessonId` + `composition` as
   real fields, not just narrated in the free-text `summary`. (This is the recurring real defect — see Red flags.)
7. **Path-convention honesty** — when a lesson's pipeline.json legitimately deviates from `_template/`'s default
   path shape (e.g. `lesson-data/<id>/...` instead of `out/<id>/...`), the deviation is reported as an explicit,
   reasoned call-out, not silently left inconsistent for the next wave to trip over.
8. **Scope discipline** — writes land ONLY inside the declared `owns` (brief.md, pipeline.json,
   `_logs/setup-scaffold.md`); no other lesson's files are read or touched.
9. **Blocking honesty** — a genuinely missing/unbuildable input is reported `status=blocked` with a clear reason,
   never papered over with an `ok` that hides a real gap.
10. **Tier-2 log completeness** — the log names inputs read, the exact command run (+ exit code) or the
    idempotent-skip reasoning, key decisions, and issues — enough for a human to audit the run without re-running it.

## Rubric (the graded bar)
Aggregation: **every Required row must PASS** for the artifact to be usable; **Aspirational** rows are the
discriminators between an acceptable run and an excellent one — headroom is intentional (a run clearing every
Aspirational row would be unusually thorough for a "mechanical setup" node).

| # | Tier | Criterion | PASS looks like (quotable) | Failure signature |
|---|---|---|---|---|
| C1 | Required | **Return carries what the summary claims.** Every value the node's prose narrates as promoted (`camelLessonId=...`, `composition=...`) is ALSO present, verbatim, as a real field in the structured return. | The return JSON's `camelLessonId`/`composition` string values are quoted, non-empty, and match the summary's claimed values character-for-character. | The summary narrates the promoted values but the structured return is missing one or both fields (a schema-invalid return) — a self-report/reality split. |
| C2 | Required | **pipeline.json content matches THIS lesson, not a stale or copied one.** `pipeline.json`'s own `lessonId` field is the exact id of the lesson being built; its `voice.constPrefix`/`composition` are the correct camelCase/PascalCase transforms of that SAME id (not another lesson's). | Quote the `lessonId` line and the `constPrefix`/`composition` lines side by side — a reader can confirm all three names derive from ONE id. | `lessonId` names a different lesson than the run's own lesson-data directory, or `constPrefix`/`composition` derive from a different id than `lessonId` does. |
| C3 | Required | **No leftover template syntax.** pipeline.json contains zero unsubstituted `{{...}}` tokens anywhere. | A full-text scan of the file shows no `{{` sequence. | Any field still reads `{{lessonId}}`, `{{camelLessonId}}`, or `{{compositionName}}` literally — the substitution step was skipped or the file was hand-copied from `_template/`. |
| C4 | Required | **The brief was never touched.** No `write`/`edit` tool call in the run's trace targets the brief.md path. | The trace shows only `read` calls against brief.md (or none, if pipeline.json alone needed scaffolding); the artifact's mtime/content is unchanged from before the run. | A `write` or `edit` call appears against the brief.md path — the node fabricated or altered the ONE human input, corrupting every downstream wave's teaching content invisibly. |
| C5 | Aspirational | **Deviations are surfaced, not swallowed.** When this lesson's pipeline.json legitimately departs from `_template/`'s default path convention (a different output root, a non-default composition name), the node's `issues`/`pipelineFindings` names the departure explicitly and states it's intentional. | A quoted `issues[]`/`pipelineFindings[]` entry names the specific field that deviates and why (e.g. "kp3 pipeline.json uses `lesson-data/<id>/` for output while `_template/` uses `out/<id>/` — intentional, kept canonical"). | The deviation exists in the file but nothing in the return calls it out — a future reader (or a fixer) has no way to tell "intentional" from "drifted." |
| C6 | Aspirational | **The Style value is faithfully recovered regardless of the brief's heading shape.** Different briefs spell out style under different headings (`**Style.** default`, `## Visual idiom`, `## Visual continuity with ...`); the node reports the EFFECTIVE style content either way, never a blank/default fallback when the brief clearly states something. | The reported Style value (or its tier-2-log elaboration) traces to an actual quoted line of the brief, even when that line isn't under a literal `## Style.` heading. | Style is reported as `null`/`default` with no elaboration, when the brief in fact describes a specific visual idiom elsewhere in its text. |

## Red flags (what bad looks like)
- A `status=blocked` return whose ONLY problem is a missing required-return field the node's own summary shows
  it actually computed — a discipline lapse, not a capability miss (see the Red-flag exemplar).
- pipeline.json present and parseable but silently wrong (stale lessonId, leftover `{{...}}` token, or a
  constPrefix that doesn't derive from this lesson's id) — invisible to a naive "file exists + parses" check.
- Any write/edit tool call against brief.md's path, for any reason.
- A path-convention deviation left unexplained (next wave inherits an inconsistency with no context for why).
- A log that restates the artifact contents rather than the decisions/commands/issues.

## Exemplars

### 🟢 Gold — run `ctt-1` (kptest-count-to-two), VALIDATED against `.piflow/lesson-build/runs/ctt-1/.pi/run.json`
> summary: "Verified brief.md (Style=default) and pre-existing pipeline.json (valid JSON, all path slots
> populated) for kptest-count-to-two. No re-scaffold needed (idempotent skip). Promoted
> camelLessonId=kptestCountToTwo and composition=CompleteKptestCountToTwoLesson verbatim from pipeline.json for
> downstream waves."

_Why gold:_ `status=ok`, no `returnSchemaInvalid` — the return actually CARRIED `camelLessonId`/`composition`
(C1 PASS), and both trace back cleanly to pipeline.json's own `voice.constPrefix`/`composition` for the SAME
`kptest-count-to-two` id (C2 PASS). The brief's `**Style.** default` line was read, not touched (C4 PASS). Not a
perfect run: C5/C6 aren't exercised (this lesson has no path deviation and a literal Style line), so this gold is
a floor-clean example, not an Aspirational-clearing one — that headroom is intentional (Law 2).

### 🔴 Red-flag — run `kp3-tens-and-ones-place-r3`, surfaced directly by `run.json`'s `returnSchemaInvalid`
> `returnSchemaInvalid`: `["/ must have required property 'camelLessonId'", "/ must have required property 'composition'"]`
> summary (same run): "...Promoted `camelLessonId=voice.constPrefix=kp3TensAndOnesPlace` and
> `composition=CompleteKp3TensAndOnesPlaceLesson` verbatim from pipeline.json..."

_Why red:_ textbook C1 FAIL — the model's own prose shows it correctly computed both values (it even quotes them),
but the actual structured return omitted both required fields, so the SDK's return-schema gate correctly forced
`status=blocked`. **This is not a one-off**: the IDENTICAL signature (same two missing fields) recurs on run
`kp3-tens-and-ones-place-r2` of the same lesson — see `memory.md` `state-promote-fields-dropped-from-return`.
The hard floor (schema check) already catches this live; it is recorded here so the JUDGE can name the same
defect from the soft side too, and so a fixer sharpening the prompt has a concrete before/after target.

## Substrate gap (read before wiring any further hard measures on this node)
Three of this node's real leverage points — C2 (lessonId/constPrefix fidelity) and C3 (no leftover template
tokens) — are checkable ONLY against this specific lesson's own `lesson-data/<id>/pipeline.json`, a path keyed
by the run's lesson-id ARG. They are **not** wired as `optimize.measure` ops (unlike C4, which is) because
`runSubstrateMeasure`'s `ResolveCtx` (`packages/core/src/optimize/substrate/measure.ts`) is built as
`{ run, workspace, state }` — it never loads the run's args. Any `optimize.measure` gate whose `path`/`param`
embeds the run's lesson-id arg token throws `MissingArgError` (`workflow/resolver.ts:76`, uncaught inside
`resolveDeep`) and crashes measurement for the WHOLE node, not just that one check — confirmed LIVE, twice, this
session: once reading the resolver + the one real call site (`packages/cli/src/optimize-substrate.ts:445`,
`measure(runDir, a.node, { workspace })`), and once by an actual crash — this file's OWN first draft named the
token literally in this very paragraph, and because the assembled judge prompt is itself rendered through the
SAME generic node-prompt token resolver, `piflowctl optimize triage --node setup-scaffold` failed instantly
(`unresolved state channel "camelLessonId"`, 0 model calls) until the literal token syntax was scrubbed from
this file's prose — a second, independent confirmation that NO `{{...}}`-shaped text is safe here, even as a
description. This blocks EVERY node in this per-lesson-parameterized workflow from hard-gating any check on its
own real per-lesson artifact content, not just this one. **Consolidation item:** the fix is threading the run's own args into
`RunSubstrateMeasureOpts`/`ResolveCtx` (mirroring how `state` is already loaded via `loadState(runDir)` — the
run's invoked args are recoverable the same way, e.g. from `.pi/run.json` or a dedicated args record) — an
`@piflow/core` change, out of this node's scope; flagged to the orchestrator. Until then, C2/C3 live ONLY in this
rubric (a judge with real file-read access, not the constrained measure resolver, can check them directly).
