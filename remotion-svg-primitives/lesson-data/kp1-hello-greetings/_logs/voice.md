# W3a — VOICE + ASR — kp1-hello-greetings

STATUS: **ACCEPTED / FROZEN** — all 5 cues asr-derived (≥0.58), recap re-rolled once. WAV is canonical.

## INPUTS READ
- `lesson-data/kp1-hello-greetings/script-cues.json` — 5 cues (intro, meet-hello, intro-self[emphasis], part-goodbye, recap[emphasis]).
- `lesson-data/kp1-hello-greetings/pipeline.json` — voice block (out/metaOut/align/timing paths, constPrefix=kp1HelloGreetings).
- `lesson-data/_shared/voice.json` — Aoede, `gemini-3.1-flash-live-preview`, perCue, maxClipSeconds 6.5, gapSeconds 0.4, ASR tokenPattern `[㐀-鿿]` (CJK-only), apiKeyEnvFile `.env.local`.
- `lesson-data/kp1-hello-greetings/pedagogy.md` — §4 narration discipline (narration NAMES the moment in Chinese; the picture delivers Hello/I'm/Goodbye; narration speaks ZERO English target tokens).
- `lesson-data/kp1-hello-greetings/audio-captions.md` — W2b canonical narration table + ASR risk flag on recap's enumerated list cadence (proposed fix: soften so the list reads as one breath).
- `_logs/voice.md` (prior run) — was BLOCKED on a Google billing-dunning DENY.
- skills: tts-voice-direction, asr-cue-aligner.

## OUTPUTS WRITTEN
- `public/audio/kp1-hello-greetings-voice.wav` (971 KB, 20.24s) — FROZEN.
- `out/kp1-hello-greetings/gemini-voice.json`
- `out/kp1-hello-greetings/asr-alignment.json`
- `src/lessons/generated/kp1HelloGreetingsTiming.ts` (kp1HelloGreetingsAlignedDuration=620; kp1HelloGreetingsAlignedCues[5])
- `src/lessons/generated/kp1HelloGreetingsSilences.ts`
- `lesson-data/kp1-hello-greetings/script-cues.json` — RESTORED to W2b-canonical pure-Chinese narration (un-did a regression that had injected English into narration+caption), then recap narration softened for ASR.
- this log.

## COMMANDS RUN
1. `curl models.list?key=…` preflight — **HTTP 200** (prior run's billing DENY 403 is RESOLVED; `.env.local` key now points at a billed project).
2. `npm run lesson:voice -- --config lesson-data/kp1-hello-greetings/pipeline.json` — **exit 0**. Wrote 21.97s WAV. VERIFY found recap broken: transcriptText "见面、问见面、问好…" (TTS run-on/repeat of the enumerated list); recap matchScore 0.486 (asr-low-evidence); part-goodbye squeezed to 9 frames by the bleed.
3. (re-roll after softening recap) same command — **exit 0**. 20.24s WAV. transcriptText matches script verbatim across all 5 lines; recap matchScore 0.870 (asr-derived); part-goodbye healthy at 67f.
4. node sanity — exit 0: zero Latin/digit in any narration/phrase/caption; timing startFrames [8,112,228,372,468] / endFrames [94,199,334,439,602] monotonic, max 602 ≤ AlignedDuration 620.

## KEY DECISIONS
- **Restored W2b-canonical narration.** The live script-cues.json (touched 17:51, after the prior BLOCKED W3a) had English injected into `narration` AND `caption` (e.g. "看，他们见面，打招呼：Hello！"). That violates pedagogy §4 (narration leaks the English answer → bubble/wave/read-along become decoration) and the ASR contract (untokenizable Latin). UPSTREAM FLAGS ARE NOT ADVISORY → reverted narration+caption to the W2b table (pure Chinese, English delivered by the picture).
- **Applied the W2b ASR risk flag on recap.** First roll reproduced the exact predicted failure: enumerated list "见面、问好、再见，…" made the TTS run on / repeat / truncate the clip (ASR of the final WAV found only "见面"). Re-rolled with the softened breath-grouped form "见面问好，再见啦，一次小相遇" — fixed it (0.486 → 0.870, and freed part-goodbye from a 9-frame squeeze to 67 frames). Audio not yet frozen at the time of re-roll, so re-roll was legitimate.
- **Accepted homophone ASR substitutions as audio-correct, NOT re-rolled:** intro-self 他↔她 (tā), part-goodbye 啦→了 (le), recap 相遇→香芋 (xiāngyù) and 啦→了. All are perfect homophones — Aoede speaks the script glyphs; sherpa just prints a same-sound char. matchScores stay ≥0.87, so the frame timing is trustworthy and no re-roll is warranted.
- **FROZEN.** Every cue is asr-derived (≥0.58). WAV is canonical; no further regeneration for visual-fit reasons (CLAUDE.md audio-freeze law). Run may advance to W3.5 reconcile.

## PER-CUE AUDIT
| cue          | matchScore | confidence       | frames (dur)   | reRolled | note |
|--------------|:----------:|------------------|----------------|:--------:|------|
| intro        | 1.000      | asr-derived      | 8–94  (86f/2.87s)  | no  | clean |
| meet-hello   | 1.000      | asr-derived      | 112–199 (87f/2.90s)| no  | clean |
| intro-self   | 0.960      | asr-derived      | 228–334 (106f/3.53s)| no | 他↔她 homophone, audio correct |
| part-goodbye | 0.941      | asr-derived      | 372–439 (67f/2.23s)| no  | 啦→了 homophone, audio correct |
| recap        | 0.870      | asr-derived      | 468–602 (134f/4.47s)| YES | softened list cadence; 相遇→香芋 / 啦→了 homophones, audio correct |

AlignedDuration = 620 frames / 20.67s.

## ISSUES
- None blocking. All cues asr-derived; narration is pedagogy-§4-clean and ASR-clean.

## PIPELINE FINDINGS (workflow backlog)
- **script-cues.json was mutated between W2b and W3a, silently undoing the W2b/pedagogy contract.** A regression injected English into narration+caption. There is no gate that asserts the W3a-input script-cues.json still matches the W2b-canonical output (or that narration contains zero target-language tokens for a CJK-tokenizer lesson). Suggest a lesson:voice preflight lint: for a CJK tokenPattern, `narration`/`phrase`/`caption` must contain only CJK+punct (no Latin/digit) unless the lesson explicitly opts in — catches §4 leakage AND ASR-untokenizable text before a wasted TTS roll. (Mirrors W2b's own finding #3.)
- **The enumerated-list TTS hazard is real and predictable.** Aoede run-on/repeat/truncates 3-item comma lists ("A、B、C"). The W2b flag caught it; it cost one extra roll. Worth encoding in tts-voice-direction: for kids Mandarin, prefer 2 breath-groups over a 3-item 、-list; if a 3-item list is required, use 和 before the last item so it reads as one breath.
- **Prior-run BLOCK was a billing-dunning DENY that has since cleared** with no signal to the workflow. A cheap models.list preflight (the prior node already suggested this) would let a resumed run confirm account state in one HTTP call before generation — I used it manually here and it paid off (200 vs the prior 403).
- **The first roll's part-goodbye was squeezed to 9 frames purely because the adjacent recap clip was corrupt** — i.e. one bad cue's audio can corrupt a NEIGHBOR's alignment window, not just its own score. A per-cue duration sanity check in the aligner (flag any cue whose frame span is < ~0.5× its CJK-char count × min-char-rate) would surface this class of bleed even when the cue's own matchScore looks borderline-OK (part-goodbye was 0.941 yet 9 frames).
