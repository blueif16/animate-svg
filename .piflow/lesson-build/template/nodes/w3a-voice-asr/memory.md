# node: w3a-voice-asr — memory
<!-- Leg A · OPTIMIZER-FACING. The Hermes fixer / reconcile node READS + UPDATES this from run traces.
     NEVER injected into w3a-voice-asr's runtime prompt — a node must not see its own failure history.
     Capped (~40 lines, top-loaded: the bottom truncates first). Maintenance contract = the optimizer skill. -->

_status: seeded from real run history (e10-w3a-1, mig-e2e-1, kptest-count-to-two, kptest-fenyuhe-six) — 2026-07-09_

## Current behavior
Generates one measured+trimmed voice clip per cue via the external `@studio/narration-kit` (dedicated TTS,
`gemini-3.1-flash-tts-preview`), then locally gates it (`lesson-audio-gate.mjs`: 3 hard checks + 1 advisory
truncation sidecar) and freezes (`lesson:freeze-check`) before returning. `[[voice-asr-pipeline]]` owns the
code map.

## Known failure modes

### sandbox write/exec fence blocks the whole node
sig: w3a-voice-asr::sandbox-exec-write-fence
recurrence: 3 (e10-w3a-1 5th invocation `blocked`; mig-e2e-1 4th invocation `blocked`; re-flagged a 3rd time,
"still unresolved", in kptest-count-to-two's own `_logs/w3a-voice-asr.md` PIPELINE FINDINGS)
[[voice-asr-pipeline]]
**Root:** the node's toolchain needs (a) a project-root `cwd` for `npm run lesson:voice`/`lesson:audio-gate`
child processes, (b) exec/read access to the external narration-kit at `../shared-narration` and the ASR
assets under `../Omniscience/agent/{.venv,models/voice/asr}`, and (c) child-process write access under the
product tree's `out/<id>/` — under `--sandbox local` these three were NOT durably granted together across
invocations, so the 4 driver artifacts got wiped/half-written between runs with no way to regenerate them.
**Prevention:** `contract.execCwd` (`{{WORKSPACE}}/remotion-svg-primitives`) + `contract.execReads`
(`../shared-narration`, `../Omniscience/agent/.venv`, `../Omniscience/agent/models/voice/asr`) are now ON the
node's contract — this is the fix for (a)/(b) and MUST NOT be removed. Two residual gaps observed, still open
as of this write: (1) `execReads` does not cover `../Omniscience/node_modules/@google/genai` — the TTS's own
genai import path — a node importing it directly (rather than through the narration-kit shim) can still EPERM;
(2) `contract.owns` lists `gemini-voice.json`/`asr-alignment.json`/`audio-gate.json` but NOT
`out/<id>/voice-clips.json`, which the historical logs specifically call out as the one child-process write
that kept EPERM'ing while sibling writes (Clips.ts, master WAV, per-cue clip WAVs) succeeded — the missing
`owns` entry is the most likely reason `--sandbox local` singles it out. Both are FIX candidates for the node's
`contract`, not something this node's own prompt can work around.

### ONSET CLOBBER — enumeration cue loses its tokenOnsets sync data
sig: w3a-voice-asr::onset-clobber
recurrence: 1 confirmed live instance (this session, kptest-count-to-two/cue-1-count) + the prompt's own STEP1
names this as a recognized regression class (documentation implies at least one prior occurrence motivated it)
[[voice-asr-pipeline]]
**Root:** a cue whose storyboard teaching action is a spoken enumeration (e.g. `role: "count-on"`) gets a
scored ASR window (`asr-alignment.json` `tokenStartIndex`/`tokenEndIndex` non-null) during `--align`, but a
LATER bare `generate-voice.mjs` roll without `--align` re-writes `<camel>Clips.ts` and silently drops the
augmented `tokenOnsets`/`targetTokens` fields — the frozen module then has no per-word sync data and the
composer falls back to a banned fixed cadence.
**Prevention:** always run `--align` as the LAST voice-generation call before freezing (prompt.md STEP1 already
says this — the discipline is documented, the lapse is in execution). The node's `optimize.measure`
`onset-augmentation-coverage` op now counts `{totalCues, cuesWithOnsets}` per run (NOT a pass/fail gate — see
`criteria.md` R4 for why a hard gate here would over-fire: every cue gets ASR-aligned regardless of whether it
is enumeration content, so "needs onsets" is a judgment call for the soft rubric, not a schema-checkable fact).
**Live evidence:** `kptest-count-to-two`'s committed `kptestCountToTwoClips.ts` has zero `tokenOnsets` fields
on any cue, while `cue-1-count` (`tokenStartIndex:8, tokenEndIndex:23`) is exactly the enumeration cue that
needs it — this instance is UNCORRECTED as of this write (see `criteria.md`'s Gold exemplar Calibration note).

## Active invariants
- `contract.execCwd`/`contract.execReads` must keep pointing at `../shared-narration` +
  `../Omniscience/agent/.venv` + `../Omniscience/agent/models/voice/asr` — removing any of them reopens the
  sandbox-exec-write-fence lesson above.
- The freeze is a ONE-WAY gate: once `lesson:freeze-check` passes, per-cue clips are canonical for the rest of
  the pipeline — never re-generate voice to fix a downstream visual-fit problem (cut/compress motion instead).
- Truncation is ADVISORY, never blocking (`truncationFails` must stay 0 even when `truncationAdvisories` is
  nonzero) — do not re-couple them without re-opening the `kptest-fenyuhe-six`-class over-blocking risk.

## Open threads
- `contract.owns` is missing `out/{{arg.lessonId}}/voice-clips.json` — a candidate fix for the
  sandbox-exec-write-fence lesson (see Root above); not applied here (out of this pass's scope — measurement
  runway, not a node-behavior fix).
- No hard/soft measure yet asserts `audio-gate.json`'s `pass` boolean at RUN time (only `optimize.measure`
  checks it out-of-band, post-hoc) — the node's own `checks.post` only verifies the file is non-empty/parses.
  Consider promoting `audio-gate-pass-floor` to a blocking `checks.post` entry once triage confirms it doesn't
  false-positive on a legitimately-accepted edge case.
- `criteria.md` A2 (natural prosody) has never been judged on a real rendered clip — no lesson has a recorded
  human-listen verdict yet.

## History
git log --grep '^skillsys(w3a-voice-asr)'
