# Wave 3a — Voice + ASR (fen-yu-he)

## INPUTS READ
- `.agents/skills/lesson-audio-captions/SKILL.md`
- `lesson-data/fen-yu-he/script-cues.json` (9 cues, scripted narration)
- `lesson-data/fen-yu-he/pipeline.json` (voice block, constPrefix=fenYuHe)
- `lesson-data/fen-yu-he/audio-captions.md` (ASR risk flags + Wave 3a handoff notes)
- `out/fen-yu-he/gemini-voice.json` (transcript vs script)
- `src/lessons/generated/fenYuHeTiming.ts` (per-cue ASR alignment)
- `out/fen-yu-he/asr-alignment.json` (raw ASR transcript w/ SIL markers)
- `node_modules/@studio/narration-kit/bin/generate-voice.mjs` + `package.json` (to verify outputs)

## OUTPUTS WRITTEN (by the command, verified present)
- `public/audio/fen-yu-he-voice.wav` (39.281s, 1,885,512 bytes)
- `out/fen-yu-he/gemini-voice.json`
- `out/fen-yu-he/asr-alignment.json`
- `src/lessons/generated/fenYuHeTiming.ts` (fenYuHeAlignedCues, fenYuHeAlignedDuration=1196)
- (this log)

## COMMANDS RUN
- `npm run lesson:voice -- --config lesson-data/fen-yu-he/pipeline.json` — exit 0
  - `Wrote public/audio/fen-yu-he-voice.wav (39.281s)`
  - `Wrote out/fen-yu-he/gemini-voice.json`
  - `out/fen-yu-he/asr-alignment.json`
  - `src/lessons/generated/fenYuHeTiming.ts`
- `grep` checks on generate-voice.mjs — confirmed `lesson:voice` = `generate-voice.mjs --align`; emits WAV+json+single alignOutTs only; never imports/invokes `detect-silences.mjs`; no `silencesOutTs` config key.

## KEY DECISIONS
- transcriptText is a perfect char-for-char match to script for all 9 cues — voice spoke the script.
- All 9 cues pass accept gate: matchScore >= 0.8 AND duration >= 1.0s. NO re-roll. Audio FROZEN.
- Low scores are Mandarin-homophone ASR mishears (五→舞, 合→和, 又→右, 每→美), NOT voice errors — pre-flagged in audio-captions.md as accepted risk. Did not apply risk #2 tail-particle edit (intro-title score 0.895 is healthy, edit was conditional on a BAD score).

## ISSUES
- five-whole matchScore 0.80 sits exactly at the floor (weakest cue); ASR dropped leading 先看, heard 堆糖→对藤. Voice itself is correct; window 122→218 (3.20s) sane. Accepted.

## PIPELINE FINDINGS
- `fenYuHeSilences.ts` is named as an expected output by the task brief AND CLAUDE.md ("Generated timing modules stay at ... and `<camelLessonId>Silences.ts`"), but `lesson:voice` does NOT produce it. The kit ships `bin/detect-silences.mjs` separately; pipeline.json `voice` block has no `silencesOutTs` key and generate-voice.mjs never calls it. Either a `lesson:silences` step / config key is missing, or the spec over-promises the output. Downstream waves expecting a Silences module will break.
- Audit thresholds (matchScore>=0.8, duration>=1.0s) came from the task prompt, not from the skill — `lesson-audio-captions` SKILL.md defines no numeric accept gate for Wave 3a, and there is no dedicated Wave-3a/voice skill. A `tts-voice-direction` / `asr-cue-aligner` skill exists but was not pointed at as MY skill for this role. Ambiguous which skill owns the Wave 3a audit contract.
