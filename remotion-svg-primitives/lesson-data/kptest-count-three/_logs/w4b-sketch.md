# W4b Sketch Overlay — log (kptest-count-three)

## INPUTS READ
- `/Users/tk/.agents/skills/sketch-explainer-layer/SKILL.md` — operating skill (read first).
- `lesson-data/kptest-count-three/pedagogy.md` — discoveries: cue-1 count-climb (one-to-one in order 一二三), cue-2 cardinality (3 = whole group).
- `lesson-data/kptest-count-three/visual-design.md` — zones, palette (sketch ink = textNavy #24324B), per-cue motion budget, W2a sketch budget call ("budget 0; The gather action is CardinalConsolidation's own coral lines, so no sketch overlay is demanded. sketch-explainer-layer (W4) honors ≤1 ceiling; adds a mark only if a named gap surfaces."), anti-patterns (single-signal count-on; no decoration on climax).
- `src/lessons/kptestCountThreeLessonTimeline.ts` — **NOT READ: EPERM** (path is outside this node's DRIVER-READ-SCOPE, which covers only lesson-data/kptest-count-three + out/kptest-count-three + .agents). See PIPELINE FINDINGS.

## OUTPUTS WRITTEN
- `lesson-data/kptest-count-three/sketch-overlay.md` — budget-0 sketch overlay spec (0 marks; per-cue reasons; composer hand-off).

## COMMANDS RUN
- None. (Node has read/write/edit/submit_result only — no bash. The attempted `read` of the timeline file returned EPERM, logged above; no other commands invoked.)

## KEY DECISIONS
- **Budget = 0 marks.** cueCount = 3 → ceiling `floor(3×0.6)=1`. Evaluated every candidate against the SKILL §Restraint-principle sentence ("this mark carries signal X, not yet carried by Y or Z"):
  - topic-intro: LessonIntroCard already owns the write-on teaser underline (doubles it) → drop.
  - count-climb: tag attach is the SOLE count mark (count-on single-signal; visual-design anti-pattern); tick/underline-per-apple forbidden by SKILL vocabulary; order carried by L→R tags + spoken count → drop.
  - cardinality: coral converge lines (primitive's own) + migrating "3" + bouncy settle-pop + spatial position carry "3 = whole"; wrap-arc-around-apples = forbidden circle-around-group; wrap-arc-on-3 = decoration-on-climax (refused) → drop.
  - No candidate passes the sentence → 0 marks. This HONORS (not contradicts) visual-design's W2a budget-0 call; W4b owns the decision and independently confirmed no gap surfaces.
- Sketch language (§1) stated for parity/re-run only — single textNavy ink, stroke-on draw-on, fade-out `cueLength−8` per SKILL; boil/settle not used. Zero `<TeacherMark>` ⇒ zero manifest `SceneElement` mark entries.

## ISSUES
- None blocking. The EPERM on the timeline file did NOT block: budget-0 cue-relative marks need no absolute frames or cueLength (composer resolves cue-relative offsets at scene-build; cue IDs were derivable from pedagogy + visual-design as topic-intro/count-climb/cardinality). The artifact is complete and the DRIVER-CHECKS non-empty gate is satisfied.

## PIPELINE FINDINGS
- **READ-SCOPE / SKILL input mismatch:** the sketch-explainer-layer SKILL lists `src/lessons/<camelId>LessonTimeline.ts` (the reconciled cue boundaries) as a required input, but the harness DRIVER-READ-SCOPE for this node excludes `src/lessons` → the read EPERM'd. It happened not to matter here (budget 0 → no cueLength needed), but any W4b run that lands a real mark MUST compute `fadeOutRelativeStart = cueLength − 8`, which requires `cues[cueId].endFrame`. Recommend either (a) add `src/lessons/<camelId>LessonTimeline.ts` to the W4b DRIVER-READ-SCOPE, or (b) have the composer hand the W4b node a derived `cueLengths` table under `lesson-data/<id>/` (csv-handoff) so W4b can author cue-relative specs without opening src.
- The cross-wave "sketch budget" decision is currently made in W2a visual-design and re-confirmed (or potentially overridden) in W4b. Worth a single shared field name (`sketchBudget` / `sketchMaxMarks`) so the two waves don't drift; today it is only prose in each artifact.
