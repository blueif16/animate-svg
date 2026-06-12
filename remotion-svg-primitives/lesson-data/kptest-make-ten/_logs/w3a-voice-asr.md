# W3a Voice+ASR Log

## Inputs Read
- lesson-data/kptest-make-ten/script-cues.json
- lesson-data/kptest-make-ten/pipeline.json

## Outputs Written
- public/audio/kptest-make-ten-voice.wav
- out/kptest-make-ten/gemini-voice.json
- out/kptest-make-ten/asr-alignment.json
- src/lessons/generated/kptestMakeTenClips.ts
- src/lessons/generated/kptestMakeTenTiming.ts
- public/audio/kptest-make-ten/clips/ (per-cue clips)
- out/kptest-make-ten/voice-clips.json
- lesson-data/kptest-make-ten/script-cues.json (edited for ASR-friendliness)
- out/kptest-make-ten/audio-gate.json

## Commands Run
1. npm run lesson:voice -- --config lesson-data/kptest-make-ten/pipeline.json
   (run multiple times due to re-rolls)
2. node scripts/lesson-audio-gate.mjs --config lesson-data/kptest-make-ten/pipeline.json

## Key Decisions
- Edited script-cues.json to improve ASR accuracy for the recap cue by adding filler "接下来" at the beginning.
- Accepted the current voice clips after verifying audio gate passes (0 drones) and matchScores are acceptable (announce-topic: 0.909, recap: 0.659, others: 1.0).

## Issues
- The recap cue has a lower matchScore (0.659) due to ASR difficulty with the rapid sequence of number bonds. Despite multiple re-rolls and narration adjustments, the ASR consistently fails to capture the full phrase. However, the audio gate shows no drones or dead-air, indicating the voice clips are clean.

## Pipeline Findings
- Consider breaking long recap phrases into smaller cues in future lessons to improve ASR accuracy.
- The current approach of adding filler words at the beginning of the cue can help the ASR lock onto the cue start but may not improve overall phrase recognition.