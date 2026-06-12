# _logs/verification (W6)

## INPUTS READ
- SKILL: .agents/skills/lesson-verification/SKILL.md
- pedagogy.md (the 11 cue discoveries — §1 audit basis)
- out/kptest-compare-more-fewer/kptest-compare-more-fewer-contact.png (primary surface; 1802×2424, 11 rows × 5 samples) + its -contact.json (frame/cue map)
- out/.../bbox-manifest.json (summary + measured.gates)
- out/.../audio-gate.json
- out/.../asr-alignment.json (cue asrText / matchScore)
- lesson-data: visual-design.md, script-cues.json, audio-cues.json, audio-captions.md
- src/lessons/kptestCompareMoreFewerLessonScene.tsx + CompleteKptestCompareMoreFewerLesson.tsx + LessonTimeline.ts + kptestCompareMoreFewer/layout.ts (text-vs-audio, frame/motion-literal, audio-wiring checks)
- mp4 via ffprobe (no playback)

## OUTPUTS WRITTEN
- lesson-data/kptest-compare-more-fewer/verification.md (verdict YELLOW + per-cue + gates + punch list)
- this log

## COMMANDS RUN
- ffprobe mp4 → exit 0: 1280×720 h264 + aac stereo, duration 69.000s (= 2068 frames @30fps, == reconciled total)
- magick identify/crop ×4 → exit 0: cropped intro+two-groups, match+more, fewer, not-by-size+recap bands for close read
- node -e on bbox-manifest / asr-alignment → exit 0: gates + cue asrText
- grep MORE_PHRASE/FEWER_PHRASE/该你说啦 (layout) ; PADDED/VoiceClips/continuous (timeline) ; Sequence/BgmLayer/SfxLayer (wrapper) → exit 0

## KEY DECISIONS
- VERDICT YELLOW. Arc teaches the KP (one-to-one match → partnerlessness surplus → 五比三多/三比五少 on ONE invariant picture; keystone same-picture-two-readings intact; not-by-size spread-guard delivers; recap retrieves both).
- bbox linear+measured collisions = 0.
- gatesFailed = [lufs, captionRedundancy, contrast]: lufs −17.1 (off −16 by 1.1 LU) → W5 re-loudnorm; amountTags contrast 1.0 → W3b/W4a (transient+redundant, non-fatal); captionRedundancy on read-along acquisition cues = EXEMPT (literacy carve-out).
- text-vs-audio PASS every cue (phrase tokens ⊆ spoken phrase).
- learner-response gaps (echo-more/echo-fewer) PASS — pointer-hand + 该你说啦 + speech glyph + held phrase = legible invitation, not dead air.
- audio-gate pass:false (4 truncationFails) JUDGED FALSE POSITIVE: coverage=1 on the flagged cues; cohort sChar median inflated by `。target。×3` breath-drill cues; asrText shows recap-narration BLEED into echo cues = ASR-window artifact, impossible in frozen per-cue-clip playback (69.0s == reconcile confirms no cut).
- DEVIATION: teaching unit renders variant="star"; pedagogy + visual-design name it a "dot". Non-fatal (identity-invariant countable, color=group ID, surplus via ghost) but unflagged — recorded as punch-list #3.
- Audio wiring v4-correct: per-cue VoiceClips, no continuous WAV / PADDED_CUE_DURATIONS / Silences; bed windows from voice spans; SFX at composer layout offsets; toneSafe:false correct.
- Scene code clean: zero frame literals (all startOf/endOf+offset), named EASE.*, PopIn motion=, no Math.random/Date.now.

## ISSUES
- lufs gate −1.1 LU short (W5 re-loudnorm).
- amountTags contrast 1.0 fail (W3b NumberCard fill / W4a explicit ink).
- star-vs-dot Contract deviation (W2a/W4a — record the decision).
- Qualitative sound checks (melody-under-narration, 3-point duck audible, SFX < voice) could NOT be verified — W6 cannot play the MP4; one human playback pass needed.
- No primitive-checks/*.png (W3b pure reuse — expected, not an issue).

## PIPELINE FINDINGS
- audio-gate truncation gives FALSE POSITIVES when a lesson mixes `。target。×N` breath-drill cues with normal cues (cohort sChar median inflates → normal cues flagged "short"); AND the ASR alignment window bleeds adjacent-clip audio into a cue's asrText. Fix: exclude repeat-drill cues from the cohort baseline; clamp the ASR window to the clip's own [start,end]. Gate currently reads pass:false on a clean render.
- W6 has NO ear: the sound qualitative checks (the skill's whole "Sound checks" section) are unverifiable from the contact sheet. The pipeline needs either a machine melody-under-narration/duck measurement or an explicit human-playback handoff step — otherwise these checks are silently skipped every run.
- captionRedundancy gate fires (jaccard 1.0) on read-along ACQUISITION cues where caption==target phrase is correct-by-design; the gate should auto-exempt cues whose caption is the literacy target (the lesson already has the signal: emphasis:true + a read-along phrase row).
- Contract-vs-render drift (dot→star) reached W6 unflagged; a cheap W4 self-check could assert scene `variant` matches the visual-design Contract token and surface the deviation before render.
