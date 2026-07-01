# primitive-gap-scan — kptest-count-to-two

## result

**zero gaps** — all teaching demands satisfied by existing catalog primitives.

## demand → primitive REUSE table

| demand | primitive (catalog id → component) |
|---|---|
| two identical countable objects (apples) that land one at a time | `countable-object` (`CountableObject`, variant=fruit) |
| per-item count tag (persistent digit on each apple) | `number-card` (`NumberCard`) |
| per-item tags → group-total glyph (cardinality consolidation, identity-preserving migration) | `cardinal-consolidation` (`CardinalConsolidation`) |
| topic intro (title alone, then objects enter) | `lesson-intro-card` (`LessonIntroCard`) |
| entrance physics (apples snap, tags snap, group "2" bouncy) | `pop-in` (`PopIn`) |
| sketch brace (cue-2, ties pair↔total) | `teacher-mark` (`TeacherMark`) |
| moving-hold on resting groups | `breathe` (`Breathe`) |
| signal focus on focal element | `pointer-hand-arrow` (`PointerHandArrow`) |
| highlight on actively-attaching tag | `glow-pulse` (`GlowPulse`) |

## storyboard gap flags — resolution

1. **countables-plus-ordinal-tag** → composed from `countable-object` + `number-card` (two catalog primitives composed into one beat; per W3b law, composing is not a gap).
2. **tag→cardinal consolidation** → satisfied by `cardinal-consolidation`. The registry confirms it has the exact identity-preserving migration mechanism the visual-design demands: `renderNumbers={false}` + `getCardinalConsolidationAnchors(width, count)` lets the composer place its OWN `NumberCard` instances so the same React instances travel (no cross-fade). The composer uses the same `NumberCard` instances for the per-item tags in cue-1 and animates them to migrate into the group glyph anchors in cue-2.

## implementation helpers (not catalog primitives — not cited in the table)

- `fitUnitsToZone` (auto-size-to-zone) — sizes the 2 apples to zone-objects
- `EASE.*` (motion-vocabulary) — named curves for entrances and consolidation
- `getCardinalConsolidationAnchors` (cardinal-consolidation helper) — anchor positions for tag migration
