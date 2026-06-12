# W3b primitive-gap-scan — kptest-compare-more-fewer

## INPUTS READ
- `lesson-data/kptest-compare-more-fewer/storyboard.md` — teaching actions per cue (demand source)
- `.agents/TEACHING-ACTIONS.md` — each move's `requires`
- `lesson-data/kptest-compare-more-fewer/visual-design.md` — Visual Contract, per-cue required visuals
- `lesson-data/kptest-compare-more-fewer/pedagogy.md` — discoveries each visual must serve
- `src/capabilities/catalog-digest.md` — the ONLY inventory source for the scan
- SKILLs: primitive-builder, visual-discipline, kids-eye

## OUTPUTS WRITTEN
- `lesson-data/kptest-compare-more-fewer/primitive-gap-scan.md` — the REUSE table (zero-gap)
- this log

(No new primitives, no registry edits, no test stills — zero gap.)

## COMMANDS RUN
- `npm run registry:check-lesson -- lesson-data/kptest-compare-more-fewer/primitive-gap-scan.md`
  - exit 0 (after edit): `✓ all 11 named component(s) are registered`
  - first pass (pre-edit): exit 0 but `all 0 named` — table used bare kebab backticks; the checker
    only recognizes `(\`Pascal\`)` or `<JSXopen`, so it passed VACUOUSLY. Fixed table to the
    documented `kebab-id (\`Component\`)` convention; re-ran → 11 verified.
- `grep getPairedColumnPlacement src/shape-primitives/{index.ts,interaction.tsx}` — exit 0:
  exported `index.ts:107`, defined `interaction.tsx:473`. The placement helper is a real REUSE
  (lowercase helper, no registry entry by SKILL rule).

## KEY DECISIONS
- ZERO new primitives. Every teaching move (announce-topic, stage-the-moment, reveal,
  model-target-slow, track-read-along, invite-echo, learner-response-gap, replay, spaced-recall)
  maps its `requires` to an existing catalog component. Default = REUSE held; no source reads, no
  builds.
- The 11 components: lesson-intro-card, countable-object, number-card, pair-connector,
  unmatched-slot, comparison-symbol, read-along-highlight, pulse-circle, pointer-hand-arrow,
  recap-spotlight, breathe.
- `getPairedColumnPlacement` is a placement HELPER (not a catalog component) — verified present in
  the barrel; carries no registry entry by design, so it is not a phantom REUSE.
- Intro card: `lesson-intro-card` fits this subject as-is — no intro-primitive redesign.

## ISSUES
- None blocking. The gap-scan is zero-gap (the common case).

## PIPELINE FINDINGS
- `registry:check-lesson` PASSED VACUOUSLY on my first table: it exits 0 with "all 0 named" when a
  gap-scan cites catalog ids as bare kebab backticks (`` `comparison-symbol` ``) — the catalog-digest's
  own native id style — because the checker only matches `(\`Pascal\`)` or `<JSXopen`. A gap-scan
  that names every REUSE only in kebab form gets NO membership verification yet still shows a green
  ✓, which is the exact false-confidence the gate exists to kill. Two candidate fixes for the
  skill-system: (a) the primitive-builder SKILL §Output should mandate the `kebab-id (\`Component\`)`
  dual-form so the gate engages (currently the convention is only implied by the checker's regex,
  not stated in the SKILL); and/or (b) the checker should also recognize a backticked KEBAB id and
  resolve it to its registry component (the registry carries both the kebab `id` and the Pascal
  `component`), so a digest-native kebab citation is verified too instead of silently ignored. Today
  a clean ✓ does NOT prove the REUSEs were checked.
