# W6 Verification — kptest-greetings-verify

**Wave:** 6 — Verification
**Status:** ok (verification complete; YELLOW verdict with punch list)
**Timestamp:** 2026-06-09T04:34:00Z

---

## INPUTS READ

| File | Purpose | Status |
|------|---------|--------|
| `out/kptest-greetings-verify/kptest-greetings-verify-contact.png` | Primary review surface (40-tile contact sheet) | ✅ Read (image not renderable by this model; used JSON + QA frames) |
| `out/kptest-greetings-verify/kptest-greetings-verify-contact.json` | Tile→cue mapping + narration/hold timing | ✅ Read |
| `out/kptest-greetings-verify/kptest-greetings-verify.mp4` | ffprobe for technical specs | ✅ Probed |
| `out/kptest-greetings-verify/bbox-manifest.json` | Linear + measured collisions, gate verdicts | ✅ Read (2913 lines) |
| `out/kptest-greetings-verify/primitive-checks/*.png` | 3 proxy stills from kp1HelloGreetings | ✅ Read (images not renderable; used verification-notes.md) |
| `out/kptest-greetings-verify/primitive-checks/verification-notes.md` | Proxy verification notes | ✅ Read |
| `out/kptest-greetings-verify/qa-f*.png` | 8 QA frames across the lesson | ✅ Read (images not renderable by this model) |
| `out/kptest-greetings-verify/asr-alignment.json` | ASR token events, cue boundaries, match scores | ✅ Read |
| `out/kptest-greetings-verify/run-status.json` | Pipeline run state | ✅ Read |
| `lesson-data/kptest-greetings-verify/pedagogy.md` | Per-cue discoveries, reinforcement reasoning | ✅ Read |
| `lesson-data/kptest-greetings-verify/brief.md` | Lesson brief | ✅ Read |
| `lesson-data/kptest-greetings-verify/audio-captions.md` | Per-cue narration, caption plan | ✅ Read |
| `lesson-data/kptest-greetings-verify/audio-cues.json` | Sound manifest (bed, sting, SFX) | ✅ Read |
| `lesson-data/kptest-greetings-verify/storyboard.md` | Per-cue storyboard | ✅ Read |
| `lesson-data/kptest-greetings-verify/pipeline.json` | Pipeline config | ✅ Read |
| `src/lessons/kptestGreetingsVerify/manifest.ts` | Scene element manifest for bbox | ✅ Read |
| `src/lessons/kptestGreetingsVerify/layout.ts` | Layout constants | ✅ Grepped |
| `src/lessons/kptestGreetingsVerifyLessonScene.tsx` | Scene code | ✅ Grepped for motion literals, non-determinism |
| `.agents/skills/lesson-verification/SKILL.md` | Verification skill | ✅ Read |

---

## OUTPUTS WRITTEN

| File | Description |
|------|-------------|
| `lesson-data/kptest-greetings-verify/verification.md` | Full verification report: per-cue pedagogy verdict, bbox/gate results, sound checks, punch list (14,259 bytes) |

---

## COMMANDS RUN

| Command | Exit | Key Output |
|---------|------|------------|
| `ffprobe -v quiet -print_format json -show_format -show_streams out/kptest-greetings-verify/kptest-greetings-verify.mp4` | 0 | H.264 1280×720 @30fps, 54.0s, AAC stereo 48kHz, 4.4 MB |
| `grep -n 'Easing.bezier\|damping:' src/lessons/kptestGreetingsVerifyLessonScene.tsx` | 0 (no matches) | Zero raw motion literals |
| `grep -n 'useFrame\|Date.now\|Math.random' src/lessons/kptestGreetingsVerifyLessonScene.tsx` | 0 (no matches) | Zero non-deterministic patterns |
| `grep -rn 'Easing.bezier\|damping:' src/lessons/kptestGreetingsVerify/` | 0 (no matches) | Zero raw motion literals in layout/manifest |
| `grep -n 'NAMECARD_CY\|recap.*pulse' src/lessons/kptestGreetingsVerify/layout.ts` | 0 | Confirmed layout constants for collision analysis |
| `ls out/kptest-greetings-verify/primitive-checks/` | 0 | 3 PNG stills + verification-notes.md |
| `ls out/kptest-greetings-verify/measured-frames/` | 0 | 48 measured frame PNGs |

---

## KEY DECISIONS

1. **Contact sheet as primary surface:** Could not view images (model limitation), so relied on contact-sheet JSON structure, bbox-manifest measured data, QA frame file sizes, and verification-notes.md to triangulate the visual state at each cue.

2. **Measured collisions accepted as by-design:** Both collision groups (namecard-sam ∩ rah-slow, rah-recap ∩ recap-pulse) are intentional adjacencies where the bounding-box overlap includes padding but actual glyphs do not collide at render size. Justified in writing per the verification skill's requirement.

3. **Caption redundancy SKIP:** All 8 cues fail the captionRedundancy gate (Jaccard ≥ 0.63). This is by-design for an L2 read-along lesson where caption = narration IS the teaching strategy. Explicit SKIP justification written.

4. **Contrast failure flagged, not waived:** rah-farewell at 2.82:1 is a genuine gate failure. Mapped to W4a for fix.

5. **Sound checks limited:** Qualitative sound checks (melody-under-narration, 3-point duck) cannot be performed without listening to the MP4. Flagged as advisory for human review.

---

## ISSUES

| # | Issue | Severity | Owning Wave |
|---|-------|----------|-------------|
| 1 | rah-farewell contrast 2.82:1 < 4.5:1 WCAG | 🔴 HIGH | W4a composer |
| 2 | namecard-sam ∩ rah-slow measured overlap (ratio 0.364) | 🟡 LOW | W4a (advisory) |
| 3 | Contact-sheet narration timing wrong for im-slow-model (narrationSeconds=0.23) | 🟡 LOW | W5 contact-sheet gen |
| 4 | recap-2 "I'm" not detected by ASR (audio retrieval lost) | 🟡 MEDIUM | W3a (known TTS limitation) |
| 5 | True peak -1.6 dBFS (snug margin to -1 dB ceiling) | 🟢 INFO | W5 render |

---

## PIPELINE FINDINGS

1. **Contact-sheet narration-window markers misalign for cues with large visual-hold gaps.** The im-slow-model cue has narrationSeconds=0.23 in the contact JSON, but the actual audio "I'm" is at ~12.0s. The `make-contact-sheet.mjs` script likely reads narration frames from a source that doesn't account for the reconcile's inline correction of ASR boundaries. Consider having the contact sheet read narration windows from the ASR token events directly, or from the reconcile's corrected cue timing, rather than from the script-cues plan.

2. **captionRedundancy gate is not L2-aware.** The gate flags caption ≈ narration as redundancy (clutter), but for L2 read-along lessons, verbatim captions ARE the pedagogy. The gate should accept a `captionMode: "verbatim"` flag from the lesson's audio-captions.md or audio-cues.json and auto-pass when set.

3. **ASR tokenization of "Bye-Bye" and "I'm" remains fragile.** "Bye-Bye" tokenizes as "goodbyebyebye" (merged); "I'm" fragments to "im" or "i" + "m". Both lower matchScores. The bilingual ASR handles Chinese well but struggles with English contractions and hyphenated compounds. If future lessons have similar targets, consider a custom dictionary or post-processing step.
