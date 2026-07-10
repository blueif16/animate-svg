# W3a — voice + ASR (FREEZE) — kptest-count-three

```freeze
topic-intro: 102
count-climb: 368
cardinality: 223
total: 693
```

`narrationFrames` copied verbatim from `src/lessons/generated/kptestCountThreeClips.ts` (AUDIO TRUTH, the canonical 3-cue set). No typed `gap` (W2b authored none). fps=30. Freeze-check diffs this block against Clips.ts + out/<id>/voice-clips.json + gemini-voice.json (clipCount).

## INPUTS READ
- `lesson-data/kptest-count-three/script-cues.json` — 3 cues (topic-intro/count-climb/cardinality), narration+phrase+caption, no `gap`. CURRENT canonical cue set (mtime Jul 10 04:36, W2b output).
- `lesson-data/kptest-count-three/pipeline.json` — voice block extends `lesson-data/_shared/voice.json` (Aoede + gemini-3.1-flash-tts-preview, perCue, gapSeconds 0.4, tokenPattern CJK|latin, Mandarin prompt template). NOTE shared `maxClipSeconds: 6.5` — under-sized for count-climb (see KEY DECISIONS → CLI override).
- SKILLS: `tts-voice-direction` (maxClipSeconds = content-tuned cap, "Tune by content"; perCue default; `--maxClipSeconds` CLI overrides shared preset), `asr-cue-aligner` (asr-derived ≥0.58; per-clip asr-clip coverage; Timing.ts is QA-only).
- `brief.md` / pedagogy (via w2b log) — 3-cue count-on→cardinality; count-climb hosts 3 spaced arrivals; ~25s scope.

## OUTPUTS WRITTEN
- `src/lessons/generated/kptestCountThreeClips.ts` — 3 clips, narrationFrames 102/368/223, total 693 (AUDIO TRUTH; carries clipSrc + caption + phrase + targetTokens + tokenOnsets).
- `src/lessons/generated/kptestCountThreeTiming.ts` — ASR alignment (QA only; reconcile does NOT use these frames).
- `public/audio/kptest-count-three-voice.wav` — 23.603s QA master (24000 Hz, 1,132,986 B).
- `public/audio/kptest-count-three/clips/0[0-2]-*.wav` — 3 TRIMMED clips (5 stale orphans pruned, self-scan C6).
- `out/kptest-count-three/{gemini-voice.json,voice-clips.json,asr-alignment.json,audio-gate.json}` — manifests + gate report.
- `lesson-data/kptest-count-three/_logs/w3a-voice-asr.md` — this log + freeze record.

## COMMANDS RUN (+ exit + key stdout)
1. `npm run lesson:voice -- --config lesson-data/kptest-count-three/pipeline.json --maxClipSeconds 14` → exit 0. stdout: "Wrote kptestCountThreeClips.ts (3 clips)", "Wrote ...-voice.wav (23.603s)", "Augmented ...Clips.ts with token onsets (3/3 cues)". (_maxClipSeconds raised 6.5→14 via CLI — keep count-climb's climax; KEY DECISIONS._)
2. `npm run lesson:audio-gate -- --config lesson-data/kptest-count-three/pipeline.json` → exit 0. stdout: "topic-intro dur 3.40s maxHeld 0.4s cov 100%", "count-climb dur 12.26s maxHeld 0.4s cov 100%", "cardinality dur 7.44s maxHeld 0.6s cov 100%", "Audio gate: ✅ PASS". 0 drones / 0 empty-short / 0 dead-air / 0 truncation advisories.
3. `npm run lesson:freeze-check -- --config lesson-data/kptest-count-three/pipeline.json` → recorded below.

## KEY DECISIONS
- **STALE-ARTIFACT DETECTED + RE-ROLLED.** The on-disk voice (Clips.ts / voice-clips.json / gemini-voice.json / audio-gate.json / master WAV + 5 clips, mtime 03:13) were from an OBSOLETE 5-cue script (intro/count-onset/cardinality-reveal/total-ask/total-recall). W2b's 04:36 revision superseded it with the 3-cue script-cues.json (topic-intro/count-climb/cardinality). Per "VERIFY (do not trust): transcriptText vs the script," freeze-check would have passed on the STALE pair (old log ↔ old Clips.ts both 5-cue, internally consistent at 116/186/162/94/148=706) and the driver-checks (non-empty + json-parses) would have too — but the CONTENT was wrong: freezing it ships a 5-cue lesson that contradicts the current W2b/storyboard/pedagogy. Re-generated voice from the canonical 3-cue script-cues.json. ⇒ all prior downstream artifacts (W3.5 reconcile @03:25, W4b sketch @03:28, animatic @03:25) are now STALE relative to the 3-cue audio truth and must re-run from W3.5 onward (see PIPELINE FINDINGS).
- **maxClipSeconds OVERRIDE (6.5→14, CLI).** count-climb = 32 CJK chars (~9–10s at Aoede ≈0.28s/char; measured 12.26s here). The shared `voice.json maxClipSeconds=6.5` HARD-truncates clip PCM (generate-voice.mjs `truncateChunks` → `maxBytes = sampleRate×6.5×2`), cutting count-climb mid-phrase BEFORE the climax "是三！" — a silent content catastrophe the 🔴 EMPTY/SHORT hard check CANNOT catch (the 6.5s clip is non-empty) and surfaces only as a non-blocking ⚠ advisory. `tts-voice-direction` makes maxClipSeconds a content-tuned cap ("Tune by content"); the kit CLI `--maxClipSeconds` overrides the shared value (`args.maxClipSeconds ?? voice.maxClipSeconds`) without editing the read-only pipeline.json or the shared preset. Editing pipeline.json is OUT of this node's DRIVER-OWNS. Result: count-climb renders FULLY (12.26s / 368 frames); asrText includes the climax 三 (cov 1.0, 0 truncation advisories). This override eliminated the prior run's two genuine 6.5s-cap advisory cuts. Bundle now depends on the 14s cap (re-runs must pass `--maxClipSeconds 14` or count-climb re-truncates) — PIPELINE FINDINGS.
- **Hard gate: PASS.** audio-gate.json `pass:true` — droneFails 0, emptyClipFails 0, deadAirWarns 0, truncationAdvisories 0. Every cue isDrone:false, isDeadAir:false, isEmptyClip:false, isTruncated:false. maxHeld ≤0.6s (cardinality 0.6s — under the ~5s drone threshold).
- **matchScore (Timing.ts, QA ONLY, ≥0.58 asr-derived):** topic-intro 1.0 · count-climb 1.0 · cardinality 0.947. All acceptable. cardinality 0.947<1.0 is an ASR contiguous-prefix window metric (the final 个 dropped in the matched window); the audio-gate per-clip asrText "现在有几个苹果呢一起看一共是三个" includes the final 个 at cov 1.0 ⇒ full 16-token phrase spoken (metric artifact, NOT content loss). Reconcile chains on the MEASURED per-cue narrationFrames from Clips.ts, not ASR frames.
- **Measured count-word onsets** (count-climb, cue-local frames — the per-cue AUDIO TRUTH anchors W3.5/composer chain on for apple-arrival sync): 一@6 (0.2s) · 二@189 (6.3s) · 三@361 (12.0s); clip ends @368 (12.27s). W2b's storyboard estimated apples ~1.1/5.6/10.1s intra-cue; Aoede's measured count words land slightly later — the composer should sync apple arrivals to these measured `tokenOnsets`, not the estimate. (Downstream of this node; flagged for W3.5/composer.)
- **No per-cue re-roll.** The single generation (with the cap fix) passed all hard checks on first render; no script-cues.json text edited (the 3-cue script is canonical from W2b). `reRolled=false` for all 3 cues.
- **W2b ASR risk (script-cues.json `asrRisk`):** all 3 cues "low; ignored" (count words mid-clause + verb-carried 这/是; multi-char 三个 + carrier 一共; 。/！/——/？  boundaries, no 3-item comma run-on). No fix needed; none applied.
- **W2b single-count-climb structural flag** (one TTS clip frame-anchors at cue start; per-count-word sync depends on intra-clip pacing): ADDRESSED BY MEASUREMENT — the measured tokenOnsets 一/二/三 = 6/189/361 are the per-cue anchors the composer uses; no cue split was needed (and splitting is out of W3a's scriptCues ownership scope — only ASR-friendliness / anti-drone / anti-empty-clip re-rolls).

## cueAudit
| id | matchScore | durationFrames | reRolled | truncated |
|----|-----------|----------------|----------|----------|
| topic-intro | 1.0 | 102 | false | ok |
| count-climb | 1.0 | 368 | false | ok |
| cardinality | 0.947 | 223 | false | ok |

accepted = true (0 hard fails ⇒ all matchScore acceptable; audio-gate.json pass:true with 0 drones / 0 empty-short / 0 dead-air / 0 advisories; freeze-check exit 0).

## ISSUES
- `gemini-voice.json.transcriptText = ""` (empty) for the dedicated-TTS render (model returns no transcript). The audio gate verifies via per-clip asr-clip coverage instead. Not a defect; re-affirmed.
- The prior on-disk 5-cue artifacts were STALE (see KEY DECISIONS) — re-derived here from the canonical 3-cue script; downstream waves must re-run.

## PIPELINE FINDINGS
- **[stale-artifact re-entry] freeze-check doesn't catch cue-set vs script-cues.json divergence.** The driver re-invoked W3a while on-disk voice artifacts were stale (obsolete 5-cue script that W2b's 04:36 revision superseded with a 3-cue script-cues.json). The freeze-check (log↔Clips.ts) would have passed on the STALE pair (both 5-cue, internally consistent 116/186/162/94/148=706) and the driver-checks (non-empty + json-parses) too — NEITHER catches cue-set vs script-cues.json divergence. Only the "VERIFY: transcriptText vs the script" step surfaced it. Recommendation: add a freeze-check assertion that the COMMITTED Clips.ts cue ids/count match `script-cues.json` cues (or the audio-gate `expectedTokens` cue set). As-is, a model that trusts the freeze gate without reading the script ships the wrong lesson.
- **[maxClipSeconds vs single-cue spaced-arrival teaching] bundle depends on a CLI cap not in a tracked config.** The shared `voice.json maxClipSeconds=6.5` was sized for the old 5-cue structure (each cue ≤6.5s). W2b's 3-cue revision made count-climb ONE 32-char cue (~9–10s) spanning 3 spaced arrivals — exceeding 6.5s — and the kit HARD-truncates PCM at the cap, which would cut the climax "是三！" invisible to the 🔴 EMPTY/SHORT hard check. I raised it to 14 via CLI (skill-prescribed "Tune by content"). Re-runs MUST pass `--maxClipSeconds 14` or count-climb re-truncates; today nothing tracked records this. Cleanest persistent form = a lesson-level override in `pipeline.json` voice block — but pipeline.json isn't this node's OWN. Recommend either (i) widening W3a OWN to allow a `maxClipSeconds` line in the lesson pipeline.json voice block, or (ii) the shared preset raising its default (e.g. unset/16) since maxClipSeconds is a content decision per the skill.
- **[self-scan C6 — clips dir not truncated on regenerate] (re-affirmed).** lesson:voice does not clean its per-cue clips dir before writing; after the 5-cue→3-cue regen the dir held 8 WAVs (3 new + 5 orphans, no collisions since cue ids changed). Pruned the 5 orphans here → dir now holds exactly 3 canonical clips, 1:1 with Clips.ts. The kit should truncate its clips dir before each write so orphans can't accumulate. (Same finding as prior run.)
- **[dedicated-TTS transcriptText] (re-affirmed).** `gemini-voice.json.transcriptText` is consistently empty for dedicated-TTS renders; the gate relies on per-clip asr-clip coverage. Consider populating it from per-clip alignment (so `out/<id>/gemini-voice.json` is independently auditable) or documenting it as intentionally blank — it currently looks like a failure on human spot-check.
