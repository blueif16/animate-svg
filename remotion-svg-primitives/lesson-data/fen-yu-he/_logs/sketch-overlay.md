# Wave 4b — sketch-overlay process log

## INPUTS READ
- .agents/skills/sketch-explainer-layer/SKILL.md
- .agents/skills/kids-eye/SKILL.md
- remotion-svg-primitives/lesson-data/fen-yu-he/visual-design.md
- remotion-svg-primitives/lesson-data/fen-yu-he/pedagogy.md
- remotion-svg-primitives/lesson-data/fen-yu-he/storyboard.md
- remotion-svg-primitives/src/lessons/fenYuHeLessonTimeline.ts (cue IDs only)
- remotion-svg-primitives/src/shape-primitives/sketch.tsx (TeacherMark API — lesson-agnostic)
- remotion-svg-primitives/src/shape-primitives/counting.tsx §getFenHeDiagramAnchors (lesson-agnostic)
- .agents/CAPABILITIES.md (#sketch-boil, #sketch-settle, #fen-he-diagram)

## OUTPUTS WRITTEN
- remotion-svg-primitives/lesson-data/fen-yu-he/sketch-overlay.md
- remotion-svg-primitives/lesson-data/fen-yu-he/_logs/sketch-overlay.md (this file)

## COMMANDS RUN
- grep TeacherMark/FenHeDiagram in counting.tsx — exit 0 — confirmed FenHeDiagram + getFenHeDiagramAnchors exist; TeacherMark NOT in counting.tsx.
- grep -rln TeacherMark src/ — exit 0 — TeacherMark defined in shape-primitives/sketch.tsx (lesson-agnostic). Other hits in *LessonScene.tsx NOT opened (clean-room).
- python3 anchor math (diagramWidth=240) — exit 0 — cardW=86.4, partAnchorX=76.8, verticalReach=156; whole local (0,-78), parts local (±76.8, 78).

## KEY DECISIONS
- Mark cap = floor(9×0.6)=5; shipped 3 marks across 2 cues (7 cues zero) — restraint-first.
- read-fen-he-shi: two sequenced label-arrow marks (top-down 分成 @ rel 30, bottom-up 组成 @ rel 66) — only carrier of READ-DIRECTION the static V can't show.
- order-matters: one settled vs-mark (@ ~55% cueLength) — carries DISTINCTNESS the sunshine highlight leaves implicit.
- Refused: column underline/circle (duplicates composer-owned down-travel emphasis; circle is non-vocabulary), and marks on split/recombine/five-whole/intro/first-split/slide (motion/heap already carries signal).
- All timings cue-relative; fadeOutRelativeStart = cueLength - 8 (formula, no absolutes).
- Anchors handed off as named getFenHeDiagramAnchors + diagram translation (composer resolves); vs-mark pinned to inter-row gap, verified by manifest collision check.
- boil: none (no mark lingers ≥1.5s static). settle: only the order-matters vs-mark (climax/recap).

## ISSUES
- order-matters vs-mark example point {x:1030,y:380} is illustrative; exact point depends on the composer's final row centers in zone-column. Flagged in output for composer to resolve + manifest-verify (gap, not on a card).

## PIPELINE FINDINGS
- Skill's CUE-RELATIVE example uses Math.min in fadeOutRelativeStart but gives no canonical formula for the common case; I standardized on `cueLength - 8`. Minor ambiguity.
- Skill mark vocabulary forbids "circles around groups" but the orchestrator prompt hint explicitly suggested "circling the ordered left column" — direct conflict between the prompt's example and the skill's vocabulary. I followed the skill (refused the circle). Worth reconciling the orchestrator hint wording with the vocabulary list.
- visual-design assigns the column down-travel emphasis and the order-matters highlight as composer-owned MOTION, not sketch — the boundary between "composer emphasis" and "sketch mark" for left-column emphasis is implicit; I inferred it to avoid duplicate carriers. A one-line ownership note in visual-design or the skill would remove the inference.
- I could not read fenYuHeTiming.ts / fenYuHeSilences.ts to confirm actual per-cue cueLengths (generated modules under src/lessons/generated/ are in the clean-room forbidden set as *Timing.ts). I relied on visualMotionSeconds budgets in the timeline file instead; all timings are cue-relative so this does not affect correctness, but I could not sanity-check that read-fen-he-shi's window holds two 18f draws + reads. Budget (4.0s ≈ 120f) makes it safe.
