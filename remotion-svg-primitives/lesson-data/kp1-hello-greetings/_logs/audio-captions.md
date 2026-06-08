# W2b — audio / captions — node log (kp1-hello-greetings)

## INPUTS READ
- `.agents/skills/lesson-audio-captions/SKILL.md` (the targeting rule, leakage rule, ASR flags)
- `shared-narration/.agents/skills/cue-plan-author/SKILL.md` (narration≠phrase≠caption schema)
- `lesson-data/kp1-hello-greetings/visual-design.md` (THE BUDGET: per-cue visualMotionSeconds — intro 3.0 / meet-hello 2.5 / intro-self 4.0 / part-goodbye 3.0 / recap 3.5; pedagogy §4 division-of-labor made spatial)
- `lesson-data/kp1-hello-greetings/storyboard.md` (cue spine + order + per-cue narration intent, English-free)
- `lesson-data/kp1-hello-greetings/pedagogy.md` (per-cue discovery; §4 narration discipline)
- `lesson-data/_shared/voice.json` (Aoede, perCue, scriptField=narration, asr.tokenPattern=[㐀-鿿] → CJK-only ASR)
- 2 precedent script-cues.json (fen-yu-he, ten-ones-make-one-ten) for schema/field conventions

## OUTPUTS WRITTEN
- `lesson-data/kp1-hello-greetings/script-cues.json` — canonical CuePlan, 5 cues (id/narration/phrase/caption, +emphasis on intro-self & recap)
- `lesson-data/kp1-hello-greetings/audio-captions.md` — per-cue narration table, calibration note, leakage verification, ASR flags, caption plan

## COMMANDS RUN
- python3 char-rate calculator (iterated 3×) — exit 0. Final: all 5 cues within ±20% of motion budget (worst −10.0%); total 50 CJK chars ≈ 15.00s.
- python3 validator — exit 0. JSON valid; ids == spine order; ALL phrases pure CJK; emphasis on intro-self + recap.

## KEY DECISIONS
- Narration is PURE CHINESE, names the moment only, speaks ZERO English target tokens (pedagogy §4). The picture+read-along deliver Hello/I'm Sam/Goodbye.
- Calibration 0.30s/CJK-char (mid-band 0.28–0.32, NOT the deprecated 0.42).
- Sized each line to land inside ±20% of its visualMotionSeconds (intro 9ch/2.70 vs 3.0; meet-hello 8/2.40 vs 2.5; intro-self 13/3.90 vs 4.0 — the longest, the key_difficult; part-goodbye 9/2.70 vs 3.0; recap 11/3.30 vs 3.5). Trimmed meet-hello from a +32% draft back into band.
- intro-self narration "告诉他，自己叫什么名字" frames self-intro WARMLY (curriculum 应对建议: model, don't harsh-correct).
- `phrase` = punctuation-stripped CJK for every cue (narration≠phrase rule).
- emphasis:true ONLY on intro-self (pulse #1, "I'm") and recap (pulse #2, closing) — matches the two-pulse budget; no third.

## ISSUES
- None blocking. meet-hello at 2.40s is just under its 2.5s motion budget — fine, the cue window = max(narration, motion) so motion drives it; narration is a length hint, not a contract.

## PIPELINE FINDINGS (W2b node backlog)
- The skill's ±20% targeting rule and the cue-window formula max(narration,motion) are in slight tension: when motion is the longer track (as here for 4 of 5 cues), sizing narration UP toward the budget just to hit ±20% adds words that don't earn their keep. Suggest the skill state explicitly that under-budget narration is PREFERRED when motion is load-bearing, and ±20% is a ceiling not a floor.
- ASR `tokenPattern=[㐀-鿿]` (CJK-only) means any lesson whose narration deliberately keeps English in the picture (language lessons) is inherently ASR-clean on the narration track — but a FUTURE language lesson that DID need a Latin token spoken by the narrator would silently fail to align (aligner can't tokenize it). Worth a skill note: if narration ever must speak a Latin/numeral token, flag it as a hard ASR-alignment gap to Wave 3a, not a soft risk.
- No machine check exists that asserts `phrase` is pure-CJK for CJK-tokenizer lessons. A tiny lint in lesson:voice preflight (phrase must contain only tokenPattern glyphs) would catch leakage of Latin/punct into phrase before a wasted TTS+ASR roll.
