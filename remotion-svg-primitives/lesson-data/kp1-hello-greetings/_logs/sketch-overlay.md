# Wave 4b — Sketch Overlay — node log

## INPUTS READ
- `.agents/skills/sketch-explainer-layer/SKILL.md` (operating system-prompt)
- `lesson-data/kp1-hello-greetings/pedagogy.md` (discovery per cue; match-the-spoken-count-for-sound rule)
- `lesson-data/kp1-hello-greetings/visual-design.md` (zones §1.5, palette, motion vocab, per-cue choreography, one-signal checks)
- `src/lessons/kp1HelloGreetingsLessonTimeline.ts` (reconciled `kp1HelloGreetingsCues` — 5 cues: intro, meet-hello, intro-self, part-goodbye, recap)
- `.agents/CAPABILITIES.md` — entries: sketch-boil, sketch-settle, signal-focus-pointer (grounding the mark API)
- `src/shape-primitives/sketch.tsx` — `TeacherMarkKind` ("underline"|"wrap-arc"|"label-arrow"|"vs-mark"), `TeacherMarkAnchor` (point|span), `BoilConfig`, `SettleConfig`, `drawProgress` prop (verified the real surface)

## OUTPUTS WRITTEN
- `lesson-data/kp1-hello-greetings/sketch-overlay.md` — per-mark spec, cue-relative frames. 2 marks total across 5 cues (3 cues mark-free).

## COMMANDS RUN
- `grep`/`sed` over CAPABILITIES.md and sketch.tsx to verify the TeacherMark/FocusPointer API surface (exit 0).
- `mkdir -p _logs` (exit 0).
- No build/render commands — this is a spec-only node.

## KEY DECISIONS
- **2 marks total**, cap = floor(5×0.6)=3. Restraint held; 3 of 5 cues get ZERO marks.
- **intro = no mark** — title carries topic, faces carry cast; no English word shown yet, nothing to point at.
- **meet-hello = FocusPointer (down) at the LEFT kid** — the FIRST single-speaker reveal; the distinct signal is WHICH of two on-stage kids is speaking. visual-design itself names this "the only likely mark." Signaling chrome, not a TeacherMark, not boiled.
- **intro-self = climax underline under the "I'm" read-along span** — the lesson's ONE climax mark; carries boil (mag 3, hold 5) + settle (0.08). Co-times with the ReadAlongHighlight swell on the single weighted "I'm" beat. Distinct from the composer-owned coral PulseCircle: pulse = "attention here"; underline = "this is ONE continuous beat /aɪm/" (pedagogy match-the-spoken-count-for-sound: never two ticks). Anchored ~14px BELOW the read-along baseline (under-traces zone-readalong, never sits on glyphs).
- **part-goodbye = no mark** — symmetric, both kids wave; no single focal target, a pointer at "both" carries no signal.
- **recap = no mark** — composer-owned closing coral pulse already punctuates; a sketch mark would be decoration competing with it.
- Used only authorized vocabulary (`underline`, `FocusPointer`). No invented circles/ticks/sparkles/exclamation glyphs.
- Manifest: Mark B (underline) registered as load-bearing `zone:"marks"` SceneElement with bbox padded for stroke + boil; Mark A (FocusPointer) is signaling chrome, self-tagged via measureProps, NOT a load-bearing manifest element.

## ISSUES
- None blocking. The underline's exact x-extent (`IM_SEG_LEFT_X`/`IM_SEG_RIGHT_X`) and `READALONG_BASELINE_Y` must come from the composer's `layout.ts` / the measured "I'm" segment extent in `ReadAlongHighlight` — handed off as named constants, not literals, per the zero-frame/zero-literal discipline. The composer owns resolving them.

## PIPELINE FINDINGS
- The sketch-explainer SKILL's mark vocabulary (underline / wrap-arc / label-arrow / vs-mark) is math/diagram-shaped; for language lessons the only fitting TeacherMark kind is `underline`, and the real "point at the speaker" need is served by `FocusPointer` (a separate signal component), not a TeacherMark. The SKILL should explicitly note that for language/routine lessons FocusPointer is the primary "point" tool and TeacherMark is rarely used beyond an underline-of-a-sound-span. Right now a node has to discover this by cross-reading CAPABILITIES.md#signal-focus-pointer.
- The SKILL §"Output" structure assumes the climax mark co-times with a math primitive (BundleWrap.wrapProgress). A one-line generalization ("co-time the climax mark with whatever the cue's climax primitive is — e.g. ReadAlongHighlight.activeScale for a sound span") would make §3 directly usable for non-math lessons without re-interpretation.
- The §"manifest registration" guidance covers TeacherMark but not the FocusPointer (which is chrome, not load-bearing). Folding the FocusPointer-is-not-load-bearing exception into the SKILL (it currently lives only in CAPABILITIES.md#signal-focus-pointer) would prevent a node from over-registering signaling chrome.
