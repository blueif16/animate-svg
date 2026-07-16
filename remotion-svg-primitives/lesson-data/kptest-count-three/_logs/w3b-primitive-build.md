# W3b primitive build — kptest-count-three (tier-2 log)

## INPUTS READ
- SKILLS (read first, followed literally): `.agents/skills/primitive-builder/SKILL.md`, `.agents/skills/visual-discipline/SKILL.md`, `.agents/skills/kids-eye/SKILL.md`; `.agents/CAPABILITIES.md`
- `.agents/TEACHING-ACTIONS.md` — each move's `requires` (announce-topic → LessonIntroCard + title-reads-alone; count-on → countables + ONE count badge, NOT badge+highlight; reveal → focal change carries the discovery, no pre-say)
- `lesson-data/kptest-count-three/storyboard.md` — teaching actions: topic-intro=announce-topic, count-climb=count-on, cardinality=reveal; count-tag candidates named (storyboard asks W3b to "pick the badge + confirm it persists")
- `lesson-data/kptest-count-three/visual-design.md` — Visual Contract, zones, palette, motion budget, REUSE hints, identity-invariant (the "same 3 travels, no cross-fade")
- `src/capabilities/catalog-digest.md` — the ONLY inventory source for the scan (no primitive source read)
- `scripts/registry/check-lesson-primitives.mjs` + `package.json` — the verifier's extraction rules (JSX `<Pascal`; dual-form `(`Pascal`)` ; backticked multi-segment kebab → id→component; anti-vacuous guard + liveness/deprecated gate) and the npm script names

## OUTPUTS WRITTEN
- `lesson-data/kptest-count-three/primitive-gap-scan.md` — the reuse/gap table; ZERO-GAP verdict
- `lesson-data/kptest-count-three/_logs/w3b-primitive-build.md` — this log
- NOT written (zero-gap → none needed): no new primitive under `src/shape-primitives/`; no `primitive-registry.json` / `catalog-digest.md` regeneration (registry:build is only for a shipped gap); no test stills under `out/kptest-count-three/primitive-checks/`; no `demoProps`/gallery edits

## COMMANDS RUN
- `cd /Users/tk/Desktop/animation-test/remotion-svg-primitives && npm run registry:check-lesson -- lesson-data/kptest-count-three/primitive-gap-scan.md`
  - 1st run: EXIT 1 — `1 named component(s) NOT in the registry: Component` (a false extraction of my own table-header illustration `(`Component`)`). Fixed by removing the illustrative dual-form token from the header.
  - 2nd run: EXIT 0 — `✓ lesson-data/kptest-count-three/primitive-gap-scan.md: all 8 named component(s) are registered` (the 8: LessonIntroCard, CountableObject, NumberCard, PopIn, CardinalConsolidation, CountStepIndicator, Breathe, TeacherMark — all live, none deprecated).
  - `registry:check` NOT run — required only when a gap ships a primitive; this run is zero-gap.

## KEY DECISIONS
1. **ZERO-GAP (the common case).** All three teaching moves' `requires` map to live catalog components (decided from `catalog-digest.md`, not source). No new primitive ships.
2. **announce-topic → `lesson-intro-card` (`LessonIntroCard`)** — the normalized topic-intro card (announce-topic's `component=LessonIntroCard`). Title reads alone first; apples enter next cue (the move's binding = a W4 timing concern; the capability exists).
3. **count-on → `countable-object` (`CountableObject`) variant=fruit ×3 + `number-card` (`NumberCard`) tags + `pop-in` (`PopIn`) snap entrances.** The SOLE count mark per apple is the NumberCard; no highlight ring (count-on single-signal, kids-eye §2; sunshine deliberately not used).
4. **reveal → `cardinal-consolidation` (`CardinalConsolidation`)** — owns the consolidating beat (converging coral lines, per-item tags recede, one cardinal glyph settle-pops) = the focal change that carries the discovery. The glyph's `pop-in` (`PopIn`) motion="bouncy" is the ONE climax accent.
5. **Per-apple count tag = `number-card` (`NumberCard`), NOT `count-step-indicator` (`CountStepIndicator`).** NumberCard persists (stays once attached), is one addressable instance per apple (its "3" can migrate identity-preserved in cardinality, no cross-fade), and matches CardinalConsolidation's own per-item "cards"; its card surface is the legibility pill visual-design allowed ("no pill unless legibility needs"). CountStepIndicator is a transient step-punctuator ("pops and fades in to punctuate ONE step"), doesn't persist per-apple, and would double-signal beside the apple PopIn.
6. **Identity-invariant is composition, NOT a catalog gap.** visual-design's "same 3 travels, no cross-fade" is satisfiable within the catalog — CardinalConsolidation's self-render, OR the count-climb NumberCard "3" interpolated up+rescaled + converging lines. reveal's `requires` is met either way; the exact wiring is a W4 composer decision. Count-climb NumberCards are set one-per-apple + persistent to keep the migration option open.
7. **Sketch / focus-pointer budget = 0 from the capability side.** The coral converging lines are CardinalConsolidation's own graphic, not a sketch TeacherMark overlay; no `teacher-mark` (`TeacherMark`) gap named (W4 honors the ≤1 sketch ceiling).
8. **Verifier-discipline.** Non-catalog technique/helper ids (`fitUnitsToZone` = auto-size-to-zone, `EASE.*`/`SPRING.*` = motion-vocabulary) are listed by surface name ONLY, never as backticked kebab catalog ids (a backticked non-registry kebab would resolve to a phantom and fail the gate). The `(`Component`)` illustration in the table header was removed after the first verifier run flagged it as a false Pascal extraction.

## ISSUES
- None blocking. One self-caught verifier false-flag (the header's `(`Component`)` illustration) → fixed and re-verified green.

## PIPELINE FINDINGS
- `registry:check-lesson` matches the prose pattern `` `(`PascalWord`)` `` (backticked Pascal inside parens), so a gap-scan that ILLUSTRATES the dual-form convention in its own header ("`kebab-id` (`Component`)") self-triggers a phantom "Component". The primitive-builder SKILL tells the author to cite in dual form but does not warn against printing the convention itself as an example — so a wave that shows the convention will fail the mandated gate on first run. Suggested backlog item: add a one-line caution to `primitive-builder/SKILL.md` ("do not print the illustrative `(`Component`)` token in your own artifact prose — it extracts as a phantom Pascal component"), OR have `check-lesson-primitives.mjs` skip such tokens when they appear inside a markdown table-header / heading. Low-priority doc nudge; no behavioral change needed once the author knows.
