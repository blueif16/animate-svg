# W3a Voice+ASR Log

## INPUTS READ
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-whats-your-name/script-cues.json
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-whats-your-name/pipeline.json

## OUTPUTS WRITTEN
- src/lessons/generated/kptestWhatsYourNameClips.ts
- public/audio/kptest-whats-your-name-voice.wav
- out/kptest-whats-your-name/gemini-voice.json
- out/kptest-whats-your-name/asr-alignment.json
- src/lessons/generated/kptestWhatsYourNameTiming.ts

## COMMANDS RUN
cd /Users/tk/Desktop/animation-test/remotion-svg-primitives && npm run lesson:voice -- --config lesson-data/kptest-whats-your-name/pipeline.json

+exit 0

## KEY DECISIONS
- Accepted voice generation output after verifying ASR alignment
- All cues have matchScore >= 0.793 (4/5 at 1.0)
- No drone detected (no in-text dots in original script, audio gate passed)
- No re-rolls required as initial generation met quality bar

## ISSUES
- None

## PIPELINE FINDINGS
- The recap cue ("这样问答认识朋友") showed lower matchScore (0.793) possibly due to token bleed from adjacent cue endings, but core phrase was recognized correctly.
- Consider reviewing if the gap frames or cue boundaries need adjustment for better isolation in future lessons.