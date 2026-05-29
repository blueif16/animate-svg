# Wave 6 — verification (process log)

## INPUTS READ
- .agents/skills/lesson-verification/SKILL.md, .agents/skills/lesson-pedagogy/SKILL.md
- lesson-data/fen-yu-he/pedagogy.md, brief.md, visual-design.md, script-cues.json
- out/fen-yu-he/contact-sheet.png (primary), bbox-manifest.json, fen-yu-he-animatic.json
- out/fen-yu-he/gemini-voice.json, asr-alignment.json
- out/fen-yu-he/read-climax.png, col-complete.png + MP4 frames sampled from fen-yu-he.mp4
- src/lessons/FenYuHeLessonScene.tsx, fenYuHe/layout.ts, fenYuHe/manifest.ts (greps only)

## OUTPUTS WRITTEN
- lesson-data/fen-yu-he/verification.md
- lesson-data/fen-yu-he/_logs/verification.md (this file)
- out/fen-yu-he/_vframes/*.png (scratch MP4 frame extracts)

## COMMANDS RUN
- `ls` lesson-data + out + primitive-checks — exit0; primitive-checks/ does NOT exist; contact sheet is `contact-sheet.png` (no `fen-yu-he-contact.png`, no contact JSON — only `fen-yu-he-animatic.json`).
- `ffmpeg select` x2 — exit0; extracted intro, five-whole, split, read, slide (761/800/840/890/930), order-matters frames.
- python3 ASR-vs-window compare — exit0; every cue ASR endFrame <= reconciled endFrame; total 1178f = wav 39.28s.
- `grep Easing.bezier/damping/stiffness` in FenYuHeLessonScene.tsx — exit0; NONE (clean).
- `grep frame literals` — all comparisons via cues.X.startFrame/endFrame; zero absolute literals.

## KEY DECISIONS
- VERDICT YELLOW: arc teaches the KP; one real visual defect blocks GREEN.
- Defect: `read-fen-he-shi` two read arrows overlap (identical bbox [616,160,48,204]) over the "5" — read-both-directions not legible. Root cause layout.ts arrow1Start/arrow2Start on central axis.
- Audio frozen + clean (no overrun, total matches last cue end) — not re-recorded.
- Slide cue (ordered-enumeration heart) renders correctly: single-candy slide + sunshine highlight + column builds 1,4 / 2,3 / 3,2 / 4,1 in order.
- bbox collisionCount 0; manifest covers all §3 contract elements.
- Honored clean-room: did NOT open kp1-fen-yu-he-intro or any other lesson's files.

## ISSUES (in my own output)
- Contact sheet filename is `contact-sheet.png` not the prompt's `fen-yu-he-contact.png`; no
  per-tile contact JSON exists (only animatic JSON). Verified anyway against the real file.

## PIPELINE FINDINGS
- Skill names contact sheet `<lesson-id>-contact.png` + `<lesson-id>-contact.json`; actual render
  emits `contact-sheet.png` and only `fen-yu-he-animatic.json`. Naming/mapping drift between skill
  and pipeline scripts.
- bbox-manifest zero-collision did not catch the read-arrow overlap (both in zone-marks, allowed to
  trace over zone-diagram). The collision check cannot see "two marks rendered on top of each other"
  legibility defects — a known blind spot of the bbox gate.
- Two frozen-narration gaps vs brief (分合式 never read aloud; per-slide counts not spoken) reached
  Wave 6. The "AUDIO IS FROZEN" rule means Wave 6 can only record them — there is no defined cheap
  path to fix a narration/pedagogy gap discovered post-freeze short of a full re-record.
