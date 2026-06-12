# _log — W4b sketch-overlay — kptest-compare-more-fewer

## INPUTS READ
- `.agents/skills/sketch-explainer-layer/SKILL.md` (my operating prompt)
- `lesson-data/kptest-compare-more-fewer/pedagogy.md` (the discovery each cue delivers)
- `lesson-data/kptest-compare-more-fewer/visual-design.md` (zones, mark vocabulary fence, anti-patterns, motion budgets)
- `src/lessons/kptestCompareMoreFewerLessonTimeline.ts` (reconciled `kptestCompareMoreFewerCues` — 11 cues, cue-relative source of truth)

## OUTPUTS WRITTEN
- `lesson-data/kptest-compare-more-fewer/sketch-overlay.md` (this node's artifact)
- `lesson-data/kptest-compare-more-fewer/_logs/sketch-overlay.md` (this log)

## COMMANDS RUN
None. (Spec-only node — no scaffold/voice/render commands in scope.)

## KEY DECISIONS
- **2 marks across 11 cues** (restraint floor is 6 = floor(11×0.6); most cues SHOULD be zero per kids-eye §2).
- `match` → **underline** beneath the 2 unmatched-slot ghosts: inks the picture-delivered surplus ("nobody") before any word — the `match` discovery. Onset = pair-stagger-end + 6 (cue-relative, composer-owned event), so the ink lands AFTER the matching completes, never pre-empting it.
- `fewer-direction` (keystone, longest dwell) → **label-arrow** from the 三比五少 phrase row (zone-phrase) down to the short bottom row (zone-objects): the one signal the unchanged picture cannot self-carry — "read the OTHER way." The single **settled** mark (`settle 0.08`), co-timed to draw only AFTER the reading-focus migration starts (focus-slide-start + 8).
- **NO boil anywhere**: the only long-dwell cue (fewer) carries a live focus migration; added micro-motion would compete with the teaching object (SKILL §1.1 reach gate not met).
- Marks REFUSED on: more-direction / more-replay (pulse + > already carry surplus+direction), echo-more / echo-fewer (pointer-hand owns your-turn), fewer-replay (same as fewer), not-by-size (a mark would pre-answer the guard question — visual-design anti-pattern), recap (recap-spotlight already walks). Each = "signal already carried."
- Stayed inside the authorized vocabulary (underline / label-arrow); did NOT reach for circles-around-groups, per-item ticks, or sparkles (excluded by SKILL §"Mark vocabulary" AND visual-design — the bundle/ghosts/pulse already group/count).

## ISSUES
None blocking. Both relative onsets reference a composer-OWNED motion event (pair-stagger end; focus-slide start) rather than a fixed cue-relative integer, because the exact stagger/slide frames are the composer's to own (visual-design gives intent, not frames). The composer adds the fixed +6 / +8 offset at scene-build — this keeps the mark co-timed to the real motion across any ASR re-roll. Flagged as a hand-off contract in artifact §4, not a defect.

## PIPELINE FINDINGS
- The mark table's `drawOnRelativeStart` column ideally wants a cue-relative INTEGER, but the load-bearing onset here is "after motion-event X," and only the composer knows X's frame. The SKILL's hand-off math (`cue.startFrame + drawOnRelativeStart`) assumes a literal offset. Suggest the SKILL document an explicit "onset = composer motion-event + fixed offset" form (named event + delta) as a first-class alternative to a bare integer, so W4b can co-time a mark to a stagger/slide it cannot itself frame-number. (Recorded here, not compensated for by guessing a literal.)
