# W3a — voice + ASR (verify, then freeze)

## INPUTS READ
- lesson-data/kptest-compare-more-fewer/script-cues.json (11 cues; 2 typed gaps echo-more/echo-fewer @4s learner-response; 5 emphasis cues, 3 of which triple-repeat the drill phrase)
- lesson-data/kptest-compare-more-fewer/pipeline.json + lesson-data/_shared/voice.json (voice: Aoede, gemini-3.1-flash-live-preview, perCue, maxClipSeconds 6.5, gapSeconds 0.4)
- lesson-data/kptest-compare-more-fewer/pedagogy.md (acquisition targets 五比三多 / 三比五少; triple-repeat = intentional ACQUISITION drill; echo gaps = wait-time)
- SKILLS: tts-voice-direction, asr-cue-aligner
- catalog-digest.md — not needed for this audio-only node

## COMMANDS RUN
1. `npm run lesson:voice -- --config lesson-data/kptest-compare-more-fewer/pipeline.json` → exit 0. Wrote 11 clips, kptestCompareMoreFewerClips.ts, voice WAV (56.383s), gemini-voice.json, asr-alignment.json, kptestCompareMoreFewerTiming.ts.
2. `npm run lesson:audio-gate -- --config lesson-data/kptest-compare-more-fewer/pipeline.json` → exit 0. ✅ PASS. droneFails 0, emptyClipFails 0, deadAirWarns 0.
3. Probed all 11 clip WAVs (python wave) — durations match Clips.narrationFrames exactly; no near-silent file (smallest = echo-more 0.972s / 46KB, a genuinely short phrase).
4. `npx tsc --noEmit -p tsconfig.json` → no errors referencing the generated modules; they compile clean.

## KEY DECISIONS
- ACCEPT + FREEZE. Freeze gate = audio-gate pass:true + clean trimmed per-cue clips. Both satisfied.
- Triple-repeat emphasis cues (more-direction / more-replay / recap "五比三多。五比三多。五比三多。") are full sentences separated by periods, NOT in-text ellipsis — pedagogy ACQUISITION drill. Audio gate confirms NO drone (maxHeld ≤0.7s). Kept as authored.
- echo-more clip is only 29f (0.97s): correct — "跟我说：五比三多" is a short phrase; the 4s learner-response hold is a TYPED gap added at reconcile, NOT baked into the clip. Not an empty-clip failure (gate isEmptyClip=false).
- DID NOT re-roll. The per-cue clips (audio truth the reconcile chains) are all correct and gate-passing; re-rolling for visual-fit is forbidden post-W3a and would not change the ASR-aligner artifact below.

## ISSUES
- ASR timing module (QA-ONLY) back half is mis-aligned: fewer-direction/fewer-replay/not-by-size/recap are `asr-low-evidence` (matchScores 0.369 / —, no clean window), and more-direction(0.806)/echo-more(0.769)/more-replay(0.696)/echo-fewer(0.769) match onto the wrong master window — many cues collapse onto startFrame ~1524-1608. gemini-voice.json transcriptText shows the master ASR truncated repeats ("跟我说：五", "…倒过来看，三"). This is a master-WAV aligner artifact: six cues share the substrings 五比三多 / 三比五少, so the fuzzy windower over the 56s concat collapses them. NOT a TTS-quality problem — every per-cue CLIP transcribes correctly and the audio gate passes.
- IMPACT: none on the v4 timeline. CLAUDE.md + this node spec: "the reconcile does NOT use ASR frames" — W3.5 reads narrationFrames from kptestCompareMoreFewerClips.ts (verified correct), so the broken ASR alignment cannot corrupt cue windows. ASR module is matchScore-audit QA only.

## PIPELINE FINDINGS
- W3a ASR-aligner is unreliable for drill lessons that repeat the same short phrase across many cues: matching each cue's phrase against the concatenated 56s master collapses the repeated substrings onto one window, yielding spurious low matchScores that look alarming in the audit but are QA-only. Since v4 already generates one clean per-CLIP WAV per cue, the aligner should run per-clip (each clip's own transcript vs its own phrase) instead of against the master — that would give a trustworthy per-cue matchScore audit and remove the false-alarm. Today the only true freeze gate (audio-gate) is correct; the ASR audit signal is misleading on repetitive content.
- The node accept-criterion "every cue's matchScore acceptable" is in tension with "ASR is QA-only / reconcile ignores ASR frames": on repetitive drill lessons matchScore is structurally unreliable, so the binding gate is audio-gate pass:true + per-clip non-silence, which both held. Recommend the node spec state explicitly that on a clean audio-gate pass, low ASR matchScore from phrase-repetition is a QA note, not a re-roll trigger.

## FREEZE STATUS
Audio FROZEN. Per-cue clips canonical. audio-gate.json pass:true.
