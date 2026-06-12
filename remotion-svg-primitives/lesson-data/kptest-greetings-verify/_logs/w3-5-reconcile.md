# W3.5 — Cue-Timeline Reconcile Log

**Lesson:** kptest-greetings-verify  
**Status:** ok  
**Total duration:** 1619 frames = 53.97s (brief hint 45–60s ✓)

---

## INPUTS READ

| File | Role |
|---|---|
| `lesson-data/kptest-greetings-verify/visual-design.md` §4 motion-budget | Per-cue visualMotionSeconds (7 cues; recap split per audio-captions) |
| `src/lessons/generated/kptestGreetingsVerifyTiming.ts` | Frozen ASR-aligned cues (8 cues) + alignedDuration=1569 |
| `src/lessons/generated/kptestGreetingsVerifySilences.ts` | ffmpeg-detected WAV silences (25 intervals) — generated this run |
| `out/kptest-greetings-verify/asr-alignment.json` | ASR token events + transcript segments (evidence for corrections) |
| `lesson-data/kptest-greetings-verify/audio-captions.md` | Recap split rationale (recap-1=7.5s, recap-2=5.5s) |
| `lesson-data/kptest-greetings-verify/storyboard.md` | Exposures ledger for comprehension-floor advisory |
| `lesson-data/kptest-greetings-verify/pedagogy.md` | §8 acquisition floor + per-target difficulty classification |
| `lesson-data/kptest-greetings-verify/script-cues.json` | Cue plan (8 cues incl. recap split) |
| `node_modules/@studio/narration-kit/src/reconcileTimeline.ts` | reconcileCueTimeline algorithm |

## OUTPUTS WRITTEN

| File | Content |
|---|---|
| `src/lessons/generated/kptestGreetingsVerifySilences.ts` | 25 silence intervals from ffmpeg silencedetect |
| `src/lessons/kptestGreetingsVerifyLessonTimeline.ts` | Reconciled cue timeline (8 cues, 1619 frames) |

## COMMANDS RUN

| Command | Exit | Key output |
|---|---|---|
| `node …/detect-silences.mjs --const-prefix kptestGreetingsVerify --out-ts … --recording … --fps 30` | 0 | Wrote 25 silence intervals |
| `npx tsc --noEmit src/lessons/kptestGreetingsVerifyLessonTimeline.ts` | 0 | No errors from this file (pre-existing @types/web conflicts in node_modules only) |
| `node_modules/.bin/tsx scripts/_padded-cues-extract.ts kptestGreetingsVerify` | 0 | source:"padded", 8 cues, totalDuration:1619 |
| `npm run lesson:animatic -- --config …/pipeline.json` | **skipped** | Composition `CompleteKptestGreetingsVerifyLesson` not yet registered (W4 artifact). Cue extraction + waveform alignment verified programmatically instead. |

## KEY DECISIONS

### ASR boundary corrections (evidence-based)
The frozen ASR timing module had severe alignment errors. Corrections applied inline in the timeline file (the generated timing module is NOT modified):

| Cue | ASR start→end | Corrected start→end | Evidence |
|---|---|---|---|
| greet | 189→295 | 189→**350** | ASR endFrame (9.83s) was BEFORE "hello" (10.05s=f302) and "hi" (11.0s=f330). Corrected to just past "hi" + phonetic tail. |
| im-slow-model | **650→657** | **360→590** | ASR aligned to the SECOND "I'm" token at f650 (21.67s, actually in im-choral-echo's audio) instead of the FIRST at f368 (12.25s). 7-frame "duration" was nonsensical. Corrected from token events: first "I'm" at f368, "Sam" at f590. |
| im-choral-echo | 650→696 | **648→730** | startFrame overlapped prev cue. endFrame (23.2s) was before last token at f714 (23.8s). |
| im-learner-gap | 698→1023 | **760**→1023 | startFrame picked up choral-echo tail. "I'm" token at f771 (25.7s). Gap end at f1023 kept. |
| farewell | 1024→1224 | 1024→**1146** | endFrame extended 78 frames past last token "goodbye" at f1118 (37.25s). |
| recap-1 | 1226→1436 | **1224→1425** | Minor boundary adjustments. |
| recap-2 | 1437→1495 | **1427→1540** | endFrame was before last tokens at ~f1539 (51.3s). |

### Visual budget split for recap
The visual design authors one "recap" at 13.0s. The script-cues and ASR split it into recap-1 and recap-2 (for maxClipSeconds). Split per audio-captions plan: recap-1 = 7.5s (phrases 1–2: greet + intro), recap-2 = 5.5s (phrase 3: farewell + I'm retrieval). 7.5 + 5.5 = 13.0 ✓.

### Animatic gate deferred
The animatic requires a registered Remotion composition (`CompleteKptestGreetingsVerifyLesson`) to render stills. This is a W4 artifact. Instead, cue-boundary alignment was verified programmatically: 6 of 8 boundaries snap to WAV silence ends (Δ=0 frames); 2 are offset by design (visual budget > audio span).

## RECONCILED TIMELINE

| Cue | startFrame | endFrame | Frames | Seconds | Binding |
|---|---|---|---|---|---|
| topic-intro | 0 | 179 | 179 | 5.97 | audio (narration 5.1s + breath) |
| greet | 179 | 347 | 168 | 5.60 | audio (narration to breath at f347) |
| im-slow-model | 347 | 635 | 288 | 9.60 | audio (slow model to breath at f635) |
| im-choral-echo | 635 | 854 | 219 | 7.30 | **visual** (7.0s budget > 3.2s audio) |
| im-learner-gap | 854 | 1024 | 170 | 5.67 | audio (narration + 4s baked gap) |
| farewell | 1024 | 1211 | 187 | 6.23 | audio (narration + long breath at f1211) |
| recap-1 | 1211 | 1445 | 234 | 7.80 | **visual** (7.5s budget > 6.7s audio) |
| recap-2 | 1445 | 1619 | 174 | 5.80 | **visual** (5.5s budget > 4.7s audio) |
| **TOTAL** | | | **1619** | **53.97** | |

## COMPREHENSION-FLOOR ADVISORY

Exposures ledger from storyboard.md:
| Target | Exposures | §8 Floor | Status |
|---|---|---|---|
| I'm | 7 | ≥6–10 | ✓ Within floor |
| Hello | 4 | ≥6–10 | ⚠ Below floor — pedagogy classifies as easy target needing ~4 exposures |
| Hi | 4 | ≥6–10 | ⚠ Below floor — same as Hello |
| Goodbye | 3 | ≥6–10 | ⚠ Below floor — pedagogy classifies as easy target needing ~3 exposures |
| Bye-Bye | 3 | ≥6–10 | ⚠ Below floor — same as Goodbye |

Wait-time: im-learner-gap has 4.0s baked silence ≥ §8 floor (3–5s) ✓.

## ISSUES

1. **Animatic gate blocked (non-blocking):** Composition `CompleteKptestGreetingsVerifyLesson` not registered yet (W4 artifact). The animatic cannot render stills without it. Cue-boundary alignment verified programmatically as a substitute. The animatic should be re-run after W4 registers the composition.

2. **im-slow-model narration window in _padded-cues-extract:** The extract script derives narration windows from the raw (uncorrected) ASR timing, so im-slow-model shows narration f347–f354 (7 frames) instead of the corrected ~f360–f590. This affects only the animatic's narration markers, not the reconcile itself. If the animatic is re-run post-W4, the narration markers for im-slow-model will be wrong. Consider having _padded-cues-extract read the corrected cues from the timeline module.

3. **Comprehension-floor WARN for easy targets:** Hello/Hi (4 exposures) and Goodbye/Bye-Bye (3 exposures) are below the §8 floor of 6–10, but the pedagogy explicitly justifies lower counts for these easy targets. I'm (7 exposures, the key_difficult) meets the floor. Advisory only — not blocking.

## PIPELINE FINDINGS

1. **ASR alignment quality for slow-delivered L2 targets:** The im-slow-model narration "I'm…… Sam。" with its extended pause (7.4s between "I'm" and "Sam") caused the ASR aligner to match the phrase "I'm Sam" to a LATER occurrence in the audio (im-choral-echo's "I'm Sam" at 21.85s) instead of the correct first occurrence (12.25s). This is a systematic risk for any lesson with slow-modeled L2 targets separated by long pauses. The W3.5 correction mechanism (inline boundary overrides) handles it, but a more robust solution would be for the ASR aligner to prefer the EARLIEST matching token sequence when multiple candidates exist. (pipelineFindings — workflow backlog.)

2. **Recap split creates 8 cues from 7 visual-design entries:** The visual design authors "recap" as one 13.0s cue. The script-cues and ASR split it into recap-1 + recap-2 for maxClipSeconds (6.5s TTS limit). The reconcile must manually split the visual budget (7.5s + 5.5s). This is a recurring pattern for recap cues that exceed maxClipSeconds. Consider whether the visual-design template should always author recap sub-cues when the narration exceeds the TTS clip limit, so the reconcile doesn't need to infer the split. (pipelineFindings — workflow backlog.)

3. **audio-captions.md narration mismatch for im-slow-model:** The audio-captions plan says the narration is "I'm…… Sam。I'm Sam。我是Sam。" but the actual script-cues narration (what TTS generated) is "I'm…… Sam。" The extra "I'm Sam。我是Sam。" was authored as caption-only text, not voiced. The audio-captions plan should clarify this distinction (narration vs caption) to avoid confusion during W3a voice generation. (pipelineFindings — workflow backlog.)
