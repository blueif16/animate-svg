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

| # | Tier | Criterion | PASS looks like (quotable) | Failure signature | Hard-gate status |
|---|---|---|---|---|---|
| C1 | Required | **The state channels are populated from pipeline.json truth.** After the node exits ok, run-state `camelLessonId`/`composition` carry pipeline.json's own `voice.constPrefix`/`composition` verbatim. (RESTRUCTURED 2026-07-09: the promote is now FILE-SOURCED — `pipeline.json:voice.constPrefix` / `pipeline.json:composition` — the model no longer echoes these in its return, closing the 3-recurrence narrate-but-drop failure at the mechanism, not the prompt. `camelLessonId`/`composition` were dropped from the return schema's `required`; they remain allowed optional echoes.) | `state.json` (via the promote ledger in `io.json`) shows both channels set to strings byte-equal to pipeline.json's fields. | The promote throws (`resolved to undefined` / `source artifact unreadable`) → node downgraded to error — pipeline.json is missing/malformed, i.e. the scaffold step failed. | HARD-CAUGHT by the SDK promote itself (a promote of nothing throws, loudly) + `hard-checks.constPrefixPromoteFidelity`/`compositionPromoteFidelity` (state-vs-file, C2's ops). The old return-schema `required` gate is retired — see memory.md's `state-promote-fields-dropped` lesson + issues/baked-southern-tomato.md. |
| C2 | Required | **pipeline.json content matches THIS lesson, not a stale or copied one.** `pipeline.json`'s own `lessonId` field is the exact id of the lesson being built; its `voice.constPrefix`/`composition` are the correct camelCase/PascalCase transforms of that SAME id (not another lesson's). | Quote the `lessonId` line and the `constPrefix`/`composition` lines side by side — a reader can confirm all three names derive from ONE id. | `lessonId` names a different lesson than the run's own lesson-data directory, or `constPrefix`/`composition` derive from a different id than `lessonId` does. | HARD-GATED, PARTIAL (see "Substrate gap" UPDATE): `hard-checks.lessonIdMatches` (lessonId fidelity) + `hard-checks.constPrefixPromoteFidelity`/`compositionPromoteFidelity` (state-vs-file promote fidelity) are `optimize.measure` ops now. Judge's remaining job: is constPrefix/composition a REASONABLE name for this lesson (the "correct transform" half — deliberately NOT hard-gated; 3 real lessons use an intentional simplified name, not a literal transform). |
| C3 | Required | **No leftover template syntax.** pipeline.json contains zero unsubstituted `{{...}}` tokens anywhere. | A full-text scan of the file shows no `{{` sequence. | Any field still reads `{{lessonId}}`, `{{camelLessonId}}`, or `{{compositionName}}` literally — the substitution step was skipped or the file was hand-copied from `_template/`. | HARD-GATED: `hard-checks.noLeftoverTemplateTokens` (`optimize.measure`, `hard-checks` op). |
| C4 | Required | **The brief was never touched.** No `write`/`edit` tool call in the run's trace targets the brief.md path. | The trace shows only `read` calls against brief.md (or none, if pipeline.json alone needed scaffolding); the artifact's mtime/content is unchanged from before the run. | A `write` or `edit` call appears against the brief.md path — the node fabricated or altered the ONE human input, corrupting every downstream wave's teaching content invisibly. | HARD-GATED, TWO gates: `brief-not-authored-by-node` (write/edit tool events) + `brief-not-mutated-via-bash` (closes the PROVEN bash-redirect/tee/sed-i evasion — see node.json's gate notes for the live false-positive found + fixed while hardening this session). |
| C5 | Aspirational | **Deviations are surfaced, not swallowed.** When this lesson's pipeline.json legitimately departs from `_template/`'s default path convention (a different output root, a non-default composition name), the node's `issues`/`pipelineFindings` names the departure explicitly and states it's intentional. | A quoted `issues[]`/`pipelineFindings[]` entry names the specific field that deviates and why (e.g. "kp3 pipeline.json uses `lesson-data/<id>/` for output while `_template/` uses `out/<id>/` — intentional, kept canonical"). | The deviation exists in the file but nothing in the return calls it out — a future reader (or a fixer) has no way to tell "intentional" from "drifted." | Soft-only (a reasoned judgment call; not mechanically decidable). |
| C6 | Aspirational | **The Style value is faithfully recovered regardless of the brief's heading shape.** Different briefs spell out style under different headings (`**Style.** default`, `## Visual idiom`, `## Visual continuity with ...`); the node reports the EFFECTIVE style content either way, never a blank/default fallback when the brief clearly states something. | The reported Style value (or its tier-2-log elaboration) traces to an actual quoted line of the brief, even when that line isn't under a literal `## Style.` heading. | Style is reported as `null`/`default` with no elaboration, when the brief in fact describes a specific visual idiom elsewhere in its text. | Soft-only (a reasoned judgment call; not mechanically decidable). |
| C7 | Aspirational | **The `</item>` return-string leak never appears.** No string in the node's returned `issues[]`/`pipelineFindings[]` carries a stray `</item>` tag (an XML/HTML-list-authoring convention bleeding into a plain JSON string array). | The trace's `submit_result` payload strings are clean prose with no `</item>` fragment. | A returned string ends `...</item>\n` or similar — first observed on run `kp3-tens-and-ones-place-r3` (issues/zesty-caramel.md). | HARD-GATED: `no-item-tag-leak-in-return` (`optimize.measure`, `regex-absent` gate on the trace's `submit_result` line). |

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

## Substrate gap — UPDATE (2026-07-09 hardening pass)
C2/C3 are NOW hard-wired; read this before the stale history below (kept for provenance, corrected here rather
than deleted). The ORIGINAL finding below (a `{{arg.lessonId}}`-templated `optimize.measure` gate path/param crashes measurement
for the whole node) was real WHEN WRITTEN, but TWO things have since changed and the "C2/C3 live ONLY in this
rubric" conclusion no longer holds:
1. **The SDK itself was fixed upstream** (`@piflow/core`, commits `9442c31` "thread run args into the substrate
   measure ResolveCtx" then `7b97c14` "substrate measure degrades (not throws) on an unresolvable token") —
   `ResolveCtx` now carries `args` (read from `.pi/run.json`), and an unresolvable token is DROPPED into
   `ops.rejected[]` with a reason, never an uncaught crash. Live-reverified this session: `piflowctl optimize
   triage --node setup-scaffold --run <any real run> --dry-run` no longer crashes.
2. **A SEPARATE, still-real finding** (independently discovered by the `w2b-audio-captions` sibling lane's own
   `scripts/measure.mjs` and reconfirmed here): every run sampled in this repo — old AND new — has NO persisted
   `.pi/run.json` `args` block at all, so a `{{arg.lessonId}}` token would be REJECTED (silently dropped, never
   evaluated) for every one of them even post-fix. So `{{arg.*}}` tokens remain the wrong tool for THIS repo's
   runs, just for a different reason than originally written (rejected-and-skipped, not crashed).
**The fix actually shipped this session**: `scripts/measure/hard-checks.mjs`, wired as the `hard-checks`
`optimize.measure` op in `node.json`, derives the lessonId IN-SCRIPT from `<run>/.pi/run.json`'s own recorded
`artifacts[].path` (always written by the runner at verdict time, needs no arg at all — the exact pattern
`w2b-audio-captions`'s script independently converged on). This now HARD-GATES: C3 (no leftover `{{...}}`
template tokens in pipeline.json, `noLeftoverTemplateTokens`), C2's lessonId-fidelity half (pipeline.json's own
`lessonId` matches the run's actual lesson, `lessonIdMatches`), and C2's PROMOTE-FIDELITY half (does what
`state.json` says got promoted verbatim-match pipeline.json's own `constPrefix`/`composition` fields,
`constPrefixPromoteFidelity`/`compositionPromoteFidelity`) — plus a paired trace-liveness assertion
(`traceFound`/`traceTruncated`, checked across BOTH the current `.pi` and legacy `_pi` event-trace layouts) so a
missing/truncated trace can never vacuously pass the sibling regex-absent gates. **Deliberately NOT hard-gated**:
whether `constPrefix`/`composition` are the mechanically-"correct" camelCase/PascalCase TRANSFORM of the raw
lessonId — a scan of all 21 real `lesson-data/*/pipeline.json` files in this repo found 3
(`comparison-5-gt-3`→`comparisonLesson`, `make-10-6-and-4`→`makeTenLesson`, `pinyin-four-tones`→`pinyinToneLesson`)
that use a deliberately SIMPLIFIED constPrefix, not a literal transform — a hard gate recomputing "the correct"
transform would false-fail those three legitimate, pre-existing lessons. That residual judgment call (is THIS
particular constPrefix a reasonable name for THIS lesson, transform-literal or not) stays in C2's soft rubric row
below, by design, not as an unfinished wiring gap.

<details>
<summary>Original finding (2026-07-09, kept for provenance — see the UPDATE above for the current state)</summary>

Three of this node's real leverage points — C2 (lessonId/constPrefix fidelity) and C3 (no leftover template
tokens) — are checkable ONLY against this specific lesson's own `lesson-data/<id>/pipeline.json`, a path keyed
by the run's lesson-id ARG. They were **not** wired as `optimize.measure` ops (unlike C4, which is) because
`runSubstrateMeasure`'s `ResolveCtx` (`packages/core/src/optimize/substrate/measure.ts`) was built as
`{ run, workspace, state }` — it never loaded the run's args. Any `optimize.measure` gate whose `path`/`param`
embedded the run's lesson-id arg token threw `MissingArgError` (`workflow/resolver.ts:76`, uncaught inside
`resolveDeep`) and crashed measurement for the WHOLE node, not just that one check — confirmed LIVE, twice, that
session: once reading the resolver + the one real call site (`packages/cli/src/optimize-substrate.ts:445`,
`measure(runDir, a.node, { workspace })`), and once by an actual crash — this file's OWN first draft named the
token literally in this very paragraph, and because the assembled judge prompt is itself rendered through the
SAME generic node-prompt token resolver, `piflowctl optimize triage --node setup-scaffold` failed instantly
(`unresolved state channel "camelLessonId"`, 0 model calls) until the literal token syntax was scrubbed from
this file's prose — a second, independent confirmation that NO `{{...}}`-shaped text was safe here, even as a
description.
</details>
