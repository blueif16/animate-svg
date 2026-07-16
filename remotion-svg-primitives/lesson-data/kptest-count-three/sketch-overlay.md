# kptest-count-three — Sketch Overlay (W4b)

**Budget = 0 marks.** cueCount = 3 (topic-intro, count-climb, cardinality) → ceiling `floor(3 × 0.6) = 1`; visual-design W2a set sketch budget 0 ("adds a mark only if a named gap surfaces"); W4b confirms **no named gap surfaces** — every candidate mark fails the §Restraint-principle sentence. Restraint governs; zero `<TeacherMark>` instantiated.

## 1. Sketch language (canonical ink — UNUSED this run, budget 0)
- Stroke color: single `textNavy` (#24324B) — the sole ink the palette.authorizes for sketch ink ("textNavy … any sketch ink", visual-design §palette).
- Animation: stroke-on draw-on (never fade-in); fade-out 8fr before cue end (`cueLength − 8`) — cue-relative.
- stroke width / opacity / jitter / boil / settle: per `CAPABILITIES.md#sketch-boil` / `#sketch-settle` defaults. NONE APPLIED — zero marks, zero primitives of this kind.

Declared for parity only. Zero `<TeacherMark>` ⇒ zero `SceneElement` mark entries in `manifest.ts`.

## 2. Per-cue mark table (cue-relative — all empty)

| cue id | mark? | reason |
|---|---|---|
| topic-intro | n | LessonIntroCard already emits the write-on teaser underline (visual-design reading-order: "title alone → teaser underline"); a second underline duplicates the card's own mark. |
| count-climb | n | tag attach IS the SOLE count mark (count-on single-signal, kids-eye §2; visual-design anti-patterns). An underline/tick-per-apple is forbidden by SKILL vocabulary ("ticks under each item — the count badges already say it"). The "in-order" / counted-up signal is carried by L→R tag slots + the spoken count word. No contrast cue ⇒ no vs-mark. |
| cardinality | n | coral converging guide lines (CardinalConsolidation's OWN graphic, NOT a sketch overlay) gather the counts; the identity-preserved "3" migrate+rescale + bouncy settle-pop (the ONE climax accent) + its spatial position ABOVE the 3-apple row already carry "3 = whole group". A wrap-arc around the apples = forbidden "circle around group"; a wrap-arc on the 3 glyph = decoration-emphasis-on-climax (visual-design refuses this). Voice names the total after the picture (ribbon carries it). No signal a mark would add. |

## 3. Climax sketch
None. The visual climax (cardinality) is delivered by the primitive's own graphics: coral converge draw-on + "3" migrate/scale-up + cardinal glyph bouncy settle-pop — visual-design declares this the ONE climax accent and forbids any other emphasis there. A sketch mark on the climax would be decoration-on-climax, refused. The §Restraint-principle sentence ("this mark carries signal X, not yet carried by Y or Z") cannot be completed for any candidate ⇒ none.

## 4. Composer hand-off
- **Zero `<TeacherMark>` instances** to author in the scene.
- **Zero mark `SceneElement` entries** in `src/lessons/<camelLessonId>/manifest.ts` (zone `"marks"`) — nothing to register; `npm run lesson:check` bbox-collision has no mark to see (and none needed).
- The coral converging lines are CardinalConsolidation's own graphic (zone-badges → zone-total), rendered by the primitive, NOT as TeacherMark ink.
- If a future re-run surfaces a named gap, mark specs MUST be cue-relative: `{ cueId, drawOnRelativeStart, drawOnDuration, fadeOutRelativeStart }`, resolved by the composer via `cues[cueId].startFrame` and `cueLength = endFrame − startFrame`, with `fadeOut` clamped to `endFrame − 8`. Anchors still obey kids-eye §1.5 (never inside `zone-labels`; label-arrow `start`∈zone-labels / `end`∈zone-objects; wrap-arc traces over `zone-objects`, not a circle around the group).
