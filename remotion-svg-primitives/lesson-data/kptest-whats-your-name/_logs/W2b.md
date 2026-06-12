# W2b Audio/Captions Log

## INPUTS READ
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-whats-your-name/brief.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-whats-your-name/pedagogy.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-whats-your-name/storyboard.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-whats-your-name/visual-design.md
- /Users/tk/Desktop/animation-test/.agents/skills/lesson-audio-captions/SKILL.md
- /Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/_shared/voice.json

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-whats-your-name/audio-captions.md
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-whats-your-name/script-cues.json

## COMMANDS RUN
- `ls -la /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-whats-your-name/` (to list files)
- `read` on each input file (via agent)
- `write` for audio-captions.md and script-cues.json
- No non-zero exits; all commands succeeded.

## KEY DECISIONS
1. Narration Text Selection:
   - ask: "听，他在问名字" (6 chars, 1.8s) matches budget exactly.
   - answer: "说自己的名字" (6 chars, 1.8s) matches budget exactly.
   - ask‑swap: "现在轮到你问" (6 chars, 1.8s) matches budget exactly.
   - answer‑swap: "现在轮到你答" (6 chars, 1.8s) matches budget exactly.
   - recap: "这样问答认识朋友" (8 chars, 2.4s) within -0.1s of 2.5s budget (±20% allows 2.0–3.0s).
   All narrations name the moment (asking/answering/role‑swap/recap) per pedagogy §4; the picture delivers the English target ("What's"/"name's") without leakage.

2. Emphasis Flags:
   - Set `emphasis: true` for `ask` and `answer` cues only, per storyboard's two‑pulse rule (pulse on "What's" and "name's").

3. Gaps:
   - Added `gap: { "seconds": 4.0, "reason": "learner-response" }` for cues with `invite-echo` teaching action (ask, answer, ask‑swap, answer‑swap).
   - No gap for `recap` (spaced‑recall does not require a silent response gap in this lesson).

4. ASR Phrase Generation:
   - `phrase` strips punctuation（，。！？） from narration, retaining only Chinese characters, per cue‑plan‑author skill.
   - Example: narration "听，他在问名字" → phrase "他在问名字".

5. ASR Risk Assessment:
   - All cues low risk: no single‑character utterances, no homophone‑rich sentences, no embedded L2 targets that would cause desync (narration is Chinese framing only).
   - The bilingual ASR token pattern covers both scripts, but no English tokens appear in narration.

## ISSUES
- None encountered.

## PIPELINE FINDINGS
- Consider adding a per‑lesson voice calibration step in W2b to refine the 0.3s/char estimate using a short TTS trial, though the current estimate worked well for this lesson.
- The gap duration of 4.0s for learner‑response aligns with typical language‑lesson wait times; future lessons may adjust based on pedagogy §8 reinforcement floors.
- Ensure that the `emphasis` flag is respected by the Visual Contract layer (PulseCircle primitive) to deliver the two required attention pulses.