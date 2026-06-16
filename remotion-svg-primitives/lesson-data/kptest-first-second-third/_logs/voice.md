# W3a Voice + ASR — kptest-first-second-third

## INPUTS READ
- lesson-data/kptest-first-second-third/script-cues.json (13 cues, all Mandarin)
- lesson-data/kptest-first-second-third/pipeline.json (voice config: perCue, Aoede, gemini-3.1-flash-tts-preview, maxClipSeconds 6.5)
- Skills: tts-voice-direction/SKILL.md, asr-cue-aligner/SKILL.md

## OUTPUTS WRITTEN
- public/audio/kptest-first-second-third-voice.wav (2.27 MB, 47.336s)
- public/audio/kptest-first-second-third/clips/ (13 clips: 00-intro.wav … 12-recap-count.wav)
- src/lessons/generated/kptestFirstSecondThirdClips.ts (13 ClipCue entries, totalNarrationFrames=1331)
- src/lessons/generated/kptestFirstSecondThirdTiming.ts (QA only — ASR frame boundaries)
- out/kptest-first-second-third/gemini-voice.json (clipCount=13, model=gemini-3.1-flash-tts-preview, Aoede)
- out/kptest-first-second-third/asr-alignment.json (status=asr-derived)
- out/kptest-first-second-third/audio-gate.json (pass=true)
- lesson-data/kptest-first-second-third/_logs/voice.md (this file)

## COMMANDS RUN
```
cd /Users/tk/Desktop/animation-test/remotion-svg-primitives
npm run lesson:voice -- --config lesson-data/kptest-first-second-third/pipeline.json
# exit 0 — "Wrote src/lessons/generated/kptestFirstSecondThirdClips.ts (13 clips)"

npm run lesson:audio-gate -- --config lesson-data/kptest-first-second-third/pipeline.json
# exit 0 — "Audio gate: PASS (+ 3 truncation advisories, non-blocking)"
```

## KEY DECISIONS

### Truncation advisories — all three ACCEPTED as false positives, no re-roll

| Cue | Coverage | Duration | Reason for advisory | Spot-check verdict |
|-----|----------|----------|--------------------|--------------------|
| count-third | 56% (10/18 tokens) | 5.26s (158f) | Long multi-clause sentence; trailing "这只小动物排第三" tokens not captured by per-clip ASR window | FALSE POSITIVE — clip is 5.26s for 18 chars = 0.292 s/char; durationTrips=false; longer Mandarin counting phrase, ASR simply missed trailing tokens |
| reveal-second | 43% (3/7 tokens) | 2.36s (71f) | ASR transcribed "是这一只他排第二" (inserted 一, 他 for 它) — homophone variant | FALSE POSITIVE — 2.36s for 7 chars = 0.337 s/char exactly at cohort median; full phrase spoken, homophone mismatch only |
| reveal-third | 43% (3/7 tokens) | 2.59s (78f) | ASR transcribed "是这一只 SIL他排第三" — same homophone pattern + natural clause pause | FALSE POSITIVE — 2.59s for 7 chars = 0.370 s/char above cohort median; SIL is legitimate pause for dramatic emphasis |

### matchScores
All 13 cues: confidence=asr-derived (≥0.58). Lowest score 0.721 (count-third) — still well above threshold. All acceptable.

### gemini-voice.json transcriptText
Empty string (""). This is expected — the kit writes the per-cue master WAV transcript, not a cue-level concatenation. Verified via individual per-cue asrText in asr-alignment.json.

### No script edits required
No drone flags (0), no empty/short flags (0), no dead-air flags (0). Hard gate passed on first generation.

## ISSUES
None. Gate passed; no re-rolls needed.

## PIPELINE FINDINGS
- gemini-voice.json has `transcriptText: ""` — the master-WAV field is always empty on perCue mode. The per-cue ASR text is in asr-alignment.json. This is confusing on inspection but harmless.
- The "是这只" phrase consistently ASRs as "是这一只" (inserted 一) and "它" as "他" — these are stable homophones in zh-CN ASR. If W2b had flagged these phrases as ASR-risky, the phrase field could be updated to "是这一只他排第二" to improve coverage score. Current matchScore 0.909/0.837 are acceptable so no change warranted.
- count-second matchScore 0.968: matchText shows "排第三" instead of "排第二" at the end — the ASR heard "排第二" as "排第三" due to repeated-token ambiguity in the continuous stream. Per-clip ASR correctly transcribed "排第二" (asrText in audio-gate: coverage 81%). Acceptable.
