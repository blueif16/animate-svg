# w3a-voice-asr — judging criteria (soft measure)

_The per-node OUTPUT ACCEPTANCE fixture (piflow-overlord `building-measures.md` Parts B/C). JUDGING reference
ONLY — read by `piflowctl optimize triage --node w3a-voice-asr` (via `optimize.judge` in node.json) and by a
human reviewer. NEVER injected into this node's own runtime prompt — the prompt teaches the SKILL
(`tts-voice-direction`/`asr-cue-aligner`), not the rubric; seeing this file would let the node teach-to-the-test
and void the clean-room signal the loop depends on._

## Leverage (Law 5 — why this node's bar is a PRODUCT bar, not a format bar)
W3a is the LAST node that can catch a broken voice before it becomes permanent: "AUDIO FROZEN AFTER W3a" is a
project-wide law (prompt.md line 4) — every downstream wave (W3.5 reconcile, W4a composer, W4b sketch, W5
render) reads this node's per-cue clip timing as immutable ground truth and NEVER re-checks the spoken content.
So: **if this node's output is subtly wrong-but-schema-valid, the eventual lesson loses the ability to ever be
right again** — a silently-truncated word, a clobbered onset-sync signal, or a worst-cue score laundered by an
"ok" summary becomes a permanent, downstream-invisible defect. Every criterion below exists to catch exactly
that class of loss, not to check the artifact's shape (the hard measures in `node.json` `optimize.measure`
already own the shape floor).

## Checklist (coverage — did a great run engage EVERY dimension, not just the schema)
1. Every cue's spoken audio matches its script, verified from the rendered WAV via ASR — never a TTS
   self-report (the dedicated-TTS model emits no `transcriptText`).
2. Zero hard structural defects survive the freeze: no held-vowel drone, no empty/near-silent clip, no baked
   dead-air.
3. Truncation is REVIEWED, not ignored: any advisory-flagged clip gets a real spot-listen decision, recorded.
4. Alignment confidence is reported HONESTLY per cue — the WORST cue drives the verdict, not the best.
5. Spoken-enumeration cues (count-up / per-word pulse / read-along) carry the onset data the composer needs
   to sync a per-word/per-count animation.
6. Cue frame windows are monotonic, distinct, and exactly the trimmed length of real speech — no padding, no
   overlap, no collapsed/shared windows.
7. Any pause is a typed `gap:{seconds,reason}` field — never an in-text ellipsis, never baked silence.
8. The freeze-check cross-artifact consistency gate (Clips.ts vs the freeze record vs voice-clips.json /
   gemini-voice.json when present) is green before the node declares done.
9. A verification audit trail exists (`_logs/w3a-voice-asr.md`) that shows the audio was JUDGED, not trusted.

## Rubric

| # | Tier | Criterion | PASS looks like (quotable) | FAIL signature |
|---|---|---|---|---|
| R1 | Required | Script fidelity, ASR-verified | Every cue's ASR coverage/transcript over the RENDERED clip matches its script phrase — quote the per-cue coverage/matchScore from `asr-alignment.json` or the audio-gate `truncation.findings[]` (e.g. `cov 100%`, `matchScore 1.0`) | A truncated/dropped/swapped word, verified from the actual audio, accepted with no re-roll and no justification |
| R2 | Required | Zero hard structural defects | `audio-gate.json` reports `pass:true` with `droneFails:0, emptyClipFails:0, deadAirWarns:0` — quote the counts | Any of the three nonzero, or a `pass:true` claim that disagrees with the quoted counts (a laundered verdict) |
| R3 | Required | Worst-cue honesty | The returned status/summary reflects the WORST `cueAudit` entry; any low-confidence cue is re-rolled OR carries an explicit written justification (quote it) | An overall accept hiding a low-matchScore cue with no re-roll and no justification — "STATUS LAUNDERED FROM THE BEST CUE" |
| R4 | Required | Onset-sync completeness for enumeration cues | Every cue whose storyboard teaching action is a spoken count/enumeration/read-along carries `tokenOnsets`+`targetTokens` in the frozen `<camel>Clips.ts` — quote the cue id + field presence | A cue with a scored ASR window (`tokenStartIndex` non-null) AND an enumeration teaching action but NO `tokenOnsets` in the committed module — the ONSET CLOBBER regression (a later bare voice roll without `--align` overwrote the augmented module) |
| R5 | Required | Typed pauses, trimmed clips | Every pause is a structured `gap:{seconds,reason}`; every `narrationFrames` equals the trimmed clip length | An in-text ellipsis/dots pause, or dead air baked inside a clip |
| A1 | Aspirational | Truncation-free even on the advisory signal | `truncationAdvisories` is 0 — every clip a fluent listener would judge complete, no residue needing a spot-check | Any advisory present and merely noted rather than resolved or genuinely justified |
| A2 | Aspirational | Natural prosody beyond the mechanical floor | A fluent native listener would not wince at the cadence/emphasis/breath-groups — reads as a warm teacher (W2b's register law), judged on the RENDERED audio | Technically-passing audio that a human ear still flags as flat/robotic/oddly-paced |

**Aggregation.** All Required (R1-R5) must PASS for an `ok`-worthy freeze. A1/A2 are the discriminators between
good and great — reserve them for genuine excellence; do not award by default. The current best real run
(kptest-count-to-two, see Gold below) clears every Required row but FAILS R4, which is exactly the headroom
Law 2 wants: the bar sits above the best run we have, not at it.

## Red flags (what bad looks like, beyond the rubric's own FAIL signatures)
- A truncated clip frozen into the timeline and accepted without a re-roll or a written reason.
- Collapsed/shared frame windows — several cues sharing one startFrame/endFrame (the aligner found no distinct
  evidence and the timing is fiction).
- A held-vowel drone or in-text ellipsis producing smeared, unnatural delivery.
- A run-on or cross-cue clip — one clip containing more than its own cue's narration.
- Mismatched or missing outputs — clipCount/cue lists disagree, a referenced clip WAV missing, phrase tokens
  absent because the token pattern is wrong.
- Re-recording voice to fit motion after this node (the fix is cut/compress motion at W4, never re-voice).
- ONSET CLOBBER (see R4) — the telltale is the augment log reading `k/N` with `k` short of the enumeration
  count while `asr-alignment.json` shows scored windows for the missing cues.

## Exemplars

### 🟢 Gold — `kptest-count-to-two` (freeze `_logs/w3a-voice-asr.md`, REPAIR-confirmed 2026-07-03)
> `audio-gate.json`: `"pass": true, "droneFails": 0, "emptyClipFails": 0, "deadAirWarns": 0,
> "truncationAdvisories": 0, "truncationFails": 0`
> `asr-alignment.json` per-cue `matchScore`: `announce-topic 1.0`, `cue-1-count 1.0`, `cue-2-cardinality 0.949`
> Freeze record (`Clips.ts`, committed): `announce-topic: 63, cue-1-count: 175, cue-2-cardinality: 168, total: 406`

_Why gold:_ every Required hard-floor row is clean and independently quotable (R1 via matchScore, R2 via the
zeroed counts, R5 via the committed `narrationFrames`), and the tier-2 log shows a real re-derive-from-truth
repair (a stale `voice-clips.json` was caught and NOT hand-patched) — R8/checklist-9's audit-trail bar.

**Calibration note (Law 2 — the marks this SAME gold run is expected to fail):** this lesson FAILS **R4** —
`cue-1-count` (`role: "count-on"`, storyboard: "the spoken count word MUST land in sync with the tag attaching
(§7 count-match)") has `tokenStartIndex: 8, tokenEndIndex: 23` in `asr-alignment.json` (a scored ASR window) but
the committed `kptestCountToTwoClips.ts` carries **no `tokenOnsets` field on any cue** — a live, uncorrected
ONSET CLOBBER instance, not a hypothetical (the node's own `optimize.measure` `onset-augmentation-coverage`
reports `{totalCues:3, cuesWithOnsets:0}` against this exact artifact). It also has not been judged on A1/A2
(no rendered-audio human prosody review on file) — headroom by design, per Law 2.

### 🔴 Red-flag — `kptest-fenyuhe-six` (pre-fix era, surfaced by the 2026-06-11 W3a post-mortem)
> `_logs/w3a-voice-asr.md`: "cue-spaced-recap-all-three: script '一和五。二和四。三和三。' → TTS '一和五。二'
> (truncated after the first sub-beat) ... The decision is to ACCEPT the current voice, with the truncation
> documented as a pipeline finding (see P1) for the workflow backlog."

_Why red:_ **R1 fails** — a verified-truncated cue (confirmed from the actual ASR transcript, not assumed) was
accepted with no re-roll, only a backlog note. This is the exact historical failure the pipeline's
truncation-advisory architecture was later built to surface (see `.agents/okf/topics/voice-asr-pipeline.md`
evolution arc, commits `7bcc79d`/`6808fe7`/`0a0f3b8`) — the class is now structurally mitigated by the
dedicated-TTS model (`gemini-3.1-flash-tts-preview` cannot cut mid-utterance), but the R1/A1 rubric rows keep
the failure mode on file in case of a model regression or provider change.

## Anti-Goodhart self-check (Part E, run once over the whole set)
- **Gameable?** No criterion is satisfied by a keyword/count/field-presence alone — R1/R3/R4 all require a
  QUOTED number or field from an independently-computed artifact (ASR coverage, `cueAudit`, `tokenStartIndex`),
  not an assertion in the node's own summary prose.
- **System-agnostic?** Every Required row reads as a quality bar to an outside audio engineer ("does the
  spoken audio match the script", "is the timing honest") — none require piflow vocabulary to make sense.
- **Observable + quotable?** Every PASS anchors to a specific on-disk field (`audio-gate.json` counts,
  `asr-alignment.json` `tokenStartIndex`/`matchScore`, the committed `Clips.ts` module) — never an adjective.
- **One construct?** Each row is a single relation (fidelity / structural-cleanliness / honesty / onset-sync /
  pause-typing) — none conjoin two claims.
- **Aspirational, not a ceiling?** A1/A2 sit ABOVE the current best run (kptest-count-to-two clears A1 but is
  unjudged on A2; most historical lessons do not clear A1) — real headroom, not a rubber stamp.
- **Would optimizing every row actually produce a better lesson?** Yes: clearing R1-R5 removes the two
  documented real defect classes (truncation-accepted, onset-clobber) that otherwise ship silently into a
  FROZEN, unfixable downstream timeline; A1/A2 push toward genuinely natural teacher delivery, the actual
  product goal, not a formatting nicety.
