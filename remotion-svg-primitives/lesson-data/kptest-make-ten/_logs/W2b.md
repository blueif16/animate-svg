# W2b Audio/Captions Log

## INPUTS READ
- pedagogy.md: Discovery statements for number bonds (9+1 through 5+5)
- visual-design.md: visualMotionSeconds budget per cue (announce-topic: 2.0s, bond-*: 3.0s, recap: 6.0s)
- storyboard.md: Cue structure and teaching actions ([invite-echo, learner-response-gap, reveal] for bonds)
- lesson-audio-captions skill: Narration writing guidelines and leakage rule
- cue-plan-author skill: CuePlan JSON structure and ASR requirements
- _shared/voice.json: Voice configuration (Aoede, Mandarin slow pacing)

## OUTPUTS WRITTEN
- lesson-data/kptest-make-ten/audio-captions.md: Per-cue narration + timing analysis + leakage compliance
- lesson-data/kptest-make-ten/script-cues.json: CuePlan JSON for TTS/ASR processing

## COMMANDS RUN
- ls and find commands to locate input files and voice.json
- read tool to examine all input documents
- write tool to create output artifacts

## KEY DECISIONS
1. **Narration Length Calibration**: Used Aoede Mandarin slow pacing rate of ~0.30s/char to estimate narration duration from character counts
2. **Leakage-Compliant Scripting**: All narration follows "narrator names action/unit, picture delivers count" principle:
   - Bond cues: Prompts ask "how many more?" without revealing specific needed quantity
   - Recap: Names addends (e.g., "九加一") while visualization shows completion to ten-frame
3. **Learner-Response Gaps**: Added 4s gap with reason "learner-response" after each bond cue's narration prompt
4. **Recap Narration Balance**: Chose concise number bond listing ("九加一，八加二，...") to fit 6.0s budget while maintaining educational value
5. **ASR Safety**: Verified all narration phrases avoid single-character utterances and homophone risks; no mitigations needed

## ISSUES
None encountered during audio/captions authoring.

## PIPELINE FINDINGS
- **Gap Duration Optimization**: Consider varying gap seconds based on cognitive load (e.g., 3s for bond-9-1, 5s for bond-5-5)
- **Emphasis Opportunity**: Recitation of number bonds could benefit from emphasis on numerical terms for auditory reinforcement
- **Calibration Validation**: Recommend validating actual voice generation timing against estimates during W3a
- **Language Consistency**: All narration remains in Mandarin as appropriate for math concept lesson (no L2 target words requiring special handling)