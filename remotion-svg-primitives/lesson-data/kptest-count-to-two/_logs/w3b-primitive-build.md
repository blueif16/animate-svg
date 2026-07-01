# w3b-primitive-build — kptest-count-to-two

## INPUTS READ

- `lesson-data/kptest-count-to-two/storyboard.md` — teaching actions per cue, gap flags for countables-plus-ordinal-tag and tag→cardinal consolidation
- `lesson-data/kptest-count-to-two/visual-design.md` — Visual Contract, zones, identity-invariant, reuse-primitive table
- `.agents/TEACHING-ACTIONS.md` — count-on requires (countables + optional count badge), reveal requires (focal change carries discovery), spaced-recall requires (visual punctuation on currently-spoken total)
- `src/capabilities/catalog-digest.md` — authoritative inventory for REUSE/GAP decisions
- `src/capabilities/primitive-registry.json` — confirmed liveness of all cited components; found `cardinal-consolidation` has `renderNumbers={false}` + `getCardinalConsolidationAnchors` for identity-preserving migration
- `.agents/skills/primitive-builder/SKILL.md` — REUSE-is-membership law, composing-is-not-a-gap, dual-form citation requirement
- `.agents/skills/visual-discipline/SKILL.md` — Visual Contract mechanics, identity-invariant
- `.agents/skills/kids-eye/SKILL.md` — viewer-first legibility, finger-cover test
- `.agents/CAPABILITIES.md` — capability protocol (path A: barrel component registration; path B: technique/helper markdown entry)

## OUTPUTS WRITTEN

- `lesson-data/kptest-count-to-two/primitive-gap-scan.md` — 9-row reuse table, zero gaps, storyboard gap flags resolved

## COMMANDS RUN

- `node scripts/registry/check-lesson-primitives.mjs lesson-data/kptest-count-to-two/primitive-gap-scan.md` → exit 0, "all 9 named component(s) are registered" ✓

## KEY DECISIONS

1. **countables-plus-ordinal-tag** — composed from `countable-object` (`CountableObject`, variant=fruit) + `number-card` (`NumberCard`). The storyboard's "ordinal tag" means a persistent count tag (1, 2) on each apple, not a transient badge or 序数 position label. `number-card` is persistent; `count-step-indicator` is transient (pops and fades) — wrong primitive. Two catalog primitives composed into one beat; per W3b law, composing is not a gap.

2. **tag→cardinal consolidation** — satisfied by `cardinal-consolidation` (`CardinalConsolidation`). The registry confirms it has the exact identity-preserving migration mechanism the visual-design demands: `renderNumbers={false}` + `getCardinalConsolidationAnchors(width, count)` lets the composer place its OWN `NumberCard` instances so the same React instances travel (no cross-fade). This resolves both the functional match (cardinality) and the identity-invariant (same glyph instances travel).

3. **Helpers excluded from reuse table** — `fitUnitsToZone`, `EASE.*`, `getCardinalConsolidationAnchors` are implementation details, not catalog primitives (no Pascal component name). The gate's dual-form requirement only applies to barrel components. Not cited in the table; noted in a separate section.

4. **Zero new primitives** — all teaching demands satisfied by existing catalog primitives. The "common case" per W3b skill: write the reuse table and you are DONE.

## ISSUES

- Initial gate failure: the table header `primitive (kebab-id (\`ComponentName\`))` was parsed by the gate as a component name "ComponentName". Fixed by replacing the header with `primitive (catalog id → component)`. Re-verified: pass.

## PIPELINE FINDINGS

- The gate's `\(` + Pascal + `)\`` regex picks up any `(\`Xxx\`)` pattern in prose, not just reuse-table id cells. Authors should avoid using the literal `ComponentName` or any PascalCase token in backtick-paren sequences outside the reuse-table rows. Consider documenting this in the primitive-builder skill or the gate's own docs.
