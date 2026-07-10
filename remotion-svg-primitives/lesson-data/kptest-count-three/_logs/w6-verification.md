# W6 — verification (tier-2 log)

## INPUTS READ
- `/Users/tk/Desktop/animation-test/.agents/skills/lesson-verification/SKILL.md` (operating prompt)
- `lesson-data/kptest-count-three/pedagogy.md` (DRIVER-INJECT) — two cues, count-climb (one-to-one + sequence) + cardinality (last-number = whole)
- `lesson-data/kptest-count-three/brief.md` — knowledge point: count three identical apples + cardinality synthesis
- `lesson-data/kptest-count-three/script-cues.json` — spoken phrases per cue
- `lesson-data/kptest-count-three/audio-cues.json` — bed/duck/SFX declarations
- `lesson-data/kptest-count-three/audio-captions.md` — pacing + coverage
- `lesson-data/kptest-count-three/visual-design.md` — §1.5 zones, §3 Visual Contract / text-budget, anti-patterns
- `out/kptest-count-three/bbox-manifest.json` — measured bboxes + opacity + gates + summary (FULL, via python parse)
- `out/kptest-count-three/audio-gate.json` — drone/dead-air/truncation + ASR text
- `out/kptest-count-three/kptest-count-three-contact.json` — cue framing (5 samples/cue, fps 30, total 760 frames)
- `out/kptest-count-three/kptest-count-three-contact.png` — FAILED to view (model cannot read images; "model does not support images")
- `out/kptest-count-three/kptest-count-three.mp4` — ffprobe only
- `out/kptest-count-three/primitive-checks/*.png` — ABSENT (dir does not exist)
- `out/kptest-count-three/critique-frames/` + `measured-frames/` — PNGs present but model-blind (images)

## OUTPUTS WRITTEN
- `lesson-data/kptest-count-three/verification.md` (9293 B) — verdict (YELLOW) + per-cue pedagogy table + gate table + text-vs-audio + sound + punch list

## COMMANDS RUN (exit / key stdout-stderr)
- `ffprobe` mp4 → h264 video + aac 48000 stereo, duration 25.386s, 510254 bps. exit 0.
- `ls` out/ , `ls` primitive-checks/ → ABSENT, `cat` contact.json → 3 cues × 5 samples. exit 0.
- `cat audio-gate.json` → pass:true, 0 drone/dead-air/truncation; ASR per-cue confirms spoken phrases. exit 0.
- `tail bbox-manifest.json` → summary.gatesFailed=[], measuredCollisionCount=0, captionIntrusionCount=0, safeAreaWarningCount=1 (total-three f714). exit 0.
- `python3` parse bbox-manifest elements grouped by frame → per-frame opacity + bbox table (apples/ord-tags/total-three/intro-card). Printed full timeline. exit 0.
- `ffmpeg loudnorm` on the deliverable mp4 → `input_i=-16.04, input_tp=-3.13, input_lra=3.00` (loudness PASS on ACTUAL master). exit 0.
- `read` contact.png → "model does not support images. The image will be omitted." → PRIMARY review surface unverifiable by this node.
- lesson:bbox NOT re-run — bbox-manifest already present (ranAt 2026-07-10T12:25 UTC ≈ render time), `collisionsMeasured=[]` (no collision to investigate) and overlay PNGs are model-blind anyway. lesson:check NOT re-run — its output (bbox-manifest) is already present; re-running past-passing checks is wasteful per node discipline.

## KEY DECISIONS
1. Verdict YELLOW (not GREEN): every hard gate PASSes + cardinality arc strongly supported by bbox migration data, but the canonical contact-sheet teach-test (image) and the qualitative sound ear-pass could not be performed by this node (model-blind to images + can't hear its mp4). YELLOW = verification-incomplete, NOT a lesson defect; punch-list items H-1/H-2 are human confirmations, no wave re-run.
2. Teach-test run by data-proxy: per-cue bbox opacity + geometry progression from bbox-manifest. Cardinality discovery PROVEN by data (total-three migrates y210/W96 → y35.8/W=H=140.5 across f644→714; ord-tags→H=0; apples held opacity=1). topic-intro PROVEN (intro-card only, W-growth). count-climb one-by-one arrival: data-CONSISTENT (ord-tags group W grows 255→270→294; total-three opacity=0 entire cue = no leakage) but group getBBox cannot prove apple-by-apple timing → reservation flagged for the human contact-sheet pass.
3. Deliverable loudness directly MEASURED (ffmpeg loudnorm): -16.04 LUFS / -3.13 dBTP — upgrades the bbox gate which only measured the pre-loudnorm voice proxy (-20.1 LUFS). Both within target.
4. The single advisory (safeAreaWarning total-three f714) ACCEPTED by-design: zone-total y=36 is the cardinal-glyph placement per visual-design §1.5, with 1.06× overshoot tolerance; 35.75px top margin on 720 frame not clipped. No re-run.
5. No learner-response gap exists (count-climb tri-rep is in-cue drill; cardinality no recap) → the "your-turn affordance" check is N/A.
6. Primitive-checks dir absent → N/A (REUSE-only lesson; no redesigned primitive to acceptance-check).

## ISSUES
1. **Model-blind to images.** `read(contact.png)` returns "model does not support images"; critique-frames + measured-frames PNGs likewise unviewable. The SKILL's canonical PRIMARY surface (the single contact image) is unverifiable by THIS verification node. Teach-test + stagnation run by bbox data-proxy. A non-multimodal verification model is structurally mismatched to this skill's primary-review surface.
2. **Scene-source text-audit out of read-scope.** `src/lessons/generated/*LessonScene.tsx` + `manifest.ts` omitted from DRIVER-READ-SCOPE. The skill's scene-source text-vs-audio (on-screen strings ⊆ spoken phrase) and raw-motion-literal grep (Easing.bezier / damping: → named EASE.*/SPRING.*) could NOT be run against source. Replaced by DECLARED-string proxy (visual-design §3 text-budget vs script-cues vs ASR). The hard-finding loop (an on-screen word the audio never speaks) is therefore only DECLARED-verified, not source-verified.
3. tail of bbox-manifest `gates.lufs.source` = "voice-wav-preloudnorm" (proxy, not the rendered master). The deliverable loudness was re-confirmed directly on the mp4 (see commands) — gates fine, but the gate's source should be the delivered master.

## PIPELINE FINDINGS (workflow backlog — about THIS node / the pipeline)
1. lesson-verification SKILL should define a machine-readable stagnation/motion proxy for the contact-sheet teach-test, so a non-multimodal verification model can certify "no hold-memory stagnation" + "one-by-one arrival" without the image. The bbox-manifest already records per-frame opacity+bbox per element; a derived per-cue "≥1 element changes across the 5 contact samples" boolean would let vision-blind nodes approximate the canonical review. Formalize that proxy in the SKILL (or run W6 on a vision-capable model).
2. W6 DRIVER-READ-SCOPE omits the generated scene + manifest + shared curves, but the SKILL's text-vs-audio + motion-literal checks require them. Either widen W6 read-scope to include this lesson's `src/lessons/generated/<camId>/*` + `manifest.ts` + `src/motion-primitives/curves.ts`, or have the SKILL canonize the bbox-manifest-derived text audit (declared visual-design §3 strings vs script-cues/ASR) as the in-scope proxy — and state that the scene-source grep is the optional confirmation.
3. The `lufs` gate should measure the RENDERED MASTER mp4 (the deliverable), not the pre-loudnorm voice proxy, to match the SKILL's stated gate ("loudness on the delivered master"). Currently the gate passes on a proxy and the node must hand-run ffmpeg loudnorm to confirm the deliverable.
4. geometry-group-bbox limitation: a parent group's getBBox returns the union of ALL child slots regardless of child opacity, so a staggered child-fade (count-climb apples arriving one-by-one) is INVISIBLE to bbox data — the group reads "opacity 1 / full width" from the moment the first child appears. bbox-binding should consider per-CHILD measurement (or the contact-sheet proxy above) where per-arrival timing must be verified.
