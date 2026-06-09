# W2b — Audio / Captions Log

## INPUTS READ

| File | Purpose |
|---|---|
| `.agents/skills/lesson-audio-captions/SKILL.md` | Narration-authoring discipline — targeting rule, leakage, ASR risk, captions |
| `/Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md` | CuePlan schema — narration / phrase / caption separation, splitting rules |
| `lesson-data/kptest-greetings-verify/visual-design.md` | **THE BUDGET**: per-cue visualMotionSeconds (2.0, 3.5, 3.0, 4.5, 3.5, 5.0) |
| `lesson-data/kptest-greetings-verify/storyboard.md` | Cue IDs, narration beats (INTENT), teaching actions per cue |
| `lesson-data/kptest-greetings-verify/pedagogy.md` | Per-cue discovery, focal, reinforcement map, key_difficult (/aɪm/) |
| `lesson-data/kptest-greetings-verify/brief.md` | Audience, KP, narration notes (Chinese + embedded English, no harsh correction) |
| `lesson-data/kptest-greetings-verify/pipeline.json` | Voice config extends `_shared/voice.json`, lesson ID, composition |
| `lesson-data/_shared/voice.json` | Aoede voice, 0.30s/char calibration, tokenPattern `[㐀-鿿]\|[A-Za-z']+`, maxClipSeconds 6.5 |

## OUTPUTS WRITTEN

| File | Description |
|---|---|
| `lesson-data/kptest-greetings-verify/audio-captions.md` | Per-cue narration table + caption text + cue-boundary INTENT + ASR risk register + leakage audit + summary statistics |
| `lesson-data/kptest-greetings-verify/script-cues.json` | Canonical CuePlan JSON (6 cues: id, narration, phrase, caption, emphasis, notes) — the input the voice kit consumes |

## COMMANDS RUN

| Command | Exit | Notes |
|---|---|---|
| `mkdir -p lesson-data/kptest-greetings-verify/_logs` | 0 | Ensured log directory exists |
| `python3 -c "import json; ..."` (validate script-cues.json) | 0 | Valid JSON, 6 cues confirmed |
| `wc -l audio-captions.md script-cues.json` | 0 | 206 + 44 = 250 lines total |

## KEY DECISIONS

1. **Calibrated voice rate: 0.30 s/CJK char, ~0.50 s/short English word.** Empirical Aoede rate from skill (0.28–0.32 range, center estimate). Used for narration-length hints only — actual cue windows come from W3a+3.5.

2. **English target words are embedded in Chinese narration, not stripped.** Per pedagogy §9 L2 carve-out and the skill's explicit rule: "L2 / mixed-language is NOT an ASR risk to strip." The bilingual tokenPattern matches both scripts. "Hello", "I'm", "Sam", "Goodbye", "Bye-Bye" all appear in narration AND phrase fields.

3. **IPA /aɪm/ kept in narration but stripped from phrase.** The TTS (Gemini) can read IPA notation; the ASR aligner cannot match IPA slashes/diacritics. The phrase field uses "爱姆" (Chinese phonetic approximation) as the anchor instead. If this fails alignment, the fallback is replacing "爱姆" with "I'm" in the phrase only.

4. **"爱姆" chosen as Chinese phonetic approximation for /aɪm/.** "爱" (ài) approximates the /aɪ/ diphthong; "姆" (mǔ) provides the /m/ coda. This is standard Chinese ESL pedagogy for this sound. The two characters are common enough for TTS/ASR.

5. **Trailing "I'm……" in hi-intro narration.** The ellipsis cues the TTS to slow and hold the /aɪm/ sound, matching the emphasis PulseCircle moment. This is the in-context exposure before the isolated drill (im-echo).

6. **Recap narration is Chinese-only — no re-voiced English words.** The recap's discovery is "I did all three" (integration), not "hear the words again." English phrases appear visually via DialogueExchange replay + ReadAlongHighlight while Chinese narration names the structure.

7. **Three-item enumeration uses 顿号 (、), not 逗号 (，).** The skill warns that "a 3-item comma list runs on / repeats" for Aoede. Using 顿号 (the standard Chinese enumeration mark) should produce natural TTS pacing without the run-on risk. Flagged in pipeline findings for W3a verification.

8. **All narrations land within +5% to +20% of visual budget.** Every cue's estimated narration duration is at or slightly above the visualMotionSeconds — this is intentional. The narration should fill the visual window, not undershoot it (undershoot = dead air while the visual is still moving). The ±20% tolerance is respected.

9. **No cue exceeds maxClipSeconds (6.5 s).** Longest estimated narration is im-echo at ~5.10 s, well within the 6.5 s TTS clip limit.

10. **No narration-leakage violations.** Every cue passes the leakage check: narration names the action or voices the L2 target; the picture delivers the count/moment. Documented per-cue in the audio-captions leakage audit table.

## ISSUES

None. All inputs were present, consistent, and sufficient.

## PIPELINE FINDINGS

1. **顿号 (、) vs comma (，) TTS behavior untested.** The skill warns about Aoede's 3-item comma-list run-on, but 顿号 behavior is unverified. W3a should check that the TTS produces natural pauses for "打招呼、介绍自己、说再见" without running on. If it does run on, the fix is to split into separate sentences: "打招呼。介绍自己。说再见。"

2. **"爱姆" alignment confidence unknown.** This Chinese phonetic approximation is not a standard dictionary word. If the ASR produces "爱母" instead, the aligner's fuzzy match may still accept it (edit distance 1). But if it produces something more distant (e.g., "哀木"), the matchScore could drop below threshold. W3a should report the actual matchScore for this token and apply the fallback (replace with "I'm" in phrase) if needed.

3. **Estimated total lesson duration (30–40 s) is below the brief's 45–60 s HINT.** This is not a problem — the brief explicitly says the range is a scope hint, not a target to pad to, and the skill forbids total-runtime targeting. But the downstream team should be aware that the lesson will be shorter than the hint band. If the product team wants it longer, the pedagogical solution is additional reinforcement cues (e.g., a second echo round for "Hello"), not narration padding.

4. **part-goodbye narration at +20% of visual budget — boundary of tolerance.** The three English words ("Goodbye", "Bye-Bye", "Goodbye") add significant spoken time on top of the Chinese chars. If the actual TTS clip runs longer than estimated (English words can be slower at Aoede's pacing), it could exceed the +20% band. W3.5 reconcile will use `max(narration, visual) + tail`, so a slightly longer narration just extends the cue window — no visual breakage. But if it exceeds maxClipSeconds, the fix is to drop "Bye-Bye" from the narration and let the visual (Kid B's bubble) carry it silently.
