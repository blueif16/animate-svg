# W2a — Visual Design (log)

## INPUTS READ
- /Users/tk/Desktop/animation-test/.agents/skills/kids-eye/SKILL.md (§1 measurement, §1.5 zones, §2 single-signal, §4 identity-invariant, §6 one-picture, z-order legibility)
- /Users/tk/Desktop/animation-test/.agents/skills/visual-discipline/SKILL.md (§1 Contract, §2 one-metaphor, §3 containers, §4 occupancy+fit-check, §5 semantic groups, §6 color channel, §7 text, §10 anti-patterns)
- /Users/tk/Desktop/animation-test/.agents/skills/early-childhood-visual-taste/SKILL.md (palette, motion vocab, sketch tone, form/shading)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-three/storyboard.md (cues: topic-intro announce-topic / count-climb count-on / cardinality reveal; named required visuals)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-three/pedagogy.md (2 cues' discoveries; no recap; built-in tri-repetition)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-three/brief.md (ages 3–5, Mandarin, ~25s hint, default style, KP = count-to-three + cardinality, no equation/no numeral>3, reusable counting primitives)
- /Users/tk/Desktop/animation-test/.agents/TEACHING-ACTIONS.md (announce-topic require = title reads alone + cast enters after; count-on require = one new item/spoken number in sync + per-item dwell ≥2-3s + sole badge not badge+highlight; reveal require = picture leads, audio does not pre-say)
- /Users/tk/Desktop/animation-test/.agents/CAPABILITIES.md (motion-vocabulary, popin-motion-variants, auto-size-to-zone/fitUnitsToZone, fit-text, fen-he-diagram identity-preservation law, magic-fx Breathe rule-#6, anti-patterns)

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-three/visual-design.md  (Visual Contract: measurement block, zones+disjoint arithmetic, palette+motion vocab, contract block, per-cue motion-budget table, reuse-primitive table, anti-pattern list)

## COMMANDS RUN
(none — this node is read/write/edit only; no bash available)

## KEY DECISIONS
- ONE metaphor, one picture: 3 identical apples arrive one-by-one (count-climb), then the "3" tag migrates up to become the whole-group cardinal glyph (cardinality). No before/after split, no second metaphor.
- Identity-invariant: the 3 apples = one countable-object row the WHOLE lesson (same orange, same silhouette; cardinality quietens, never reshapes). The "3" tag = one identity-preserved numeral migrating+rescaling (fen-he-diagram "one glyph travels" law — NO cross-fade). The 1 & 2 recede (fade) — not identity-bearing.
- Single count signal: per-apple count tag is the SOLE count mark; NO highlight ring, so sunshine is NOT used (kept to 3 meaningful colors: reward, textNavy, coral).
- Coral reserved for the ONE action accent: the converging guide lines inside CardinalConsolidation (the gather-three-counts operator); coral is the primitive's own graphic, NOT a sketch overlay → sketch teacher-mark budget = 0, no FocusPointer.
- Climax = the cardinal "3" bouncy settle-pop — the ONE accent moment per video (new-concept reveal = cardinality). Everything else snap.
- Teaching-unit raised to ~150–160px (above §1's 86–108 target): justified by (a) ages-3-5 legibility and (b) the non-binding vertical occupancy on a SPARSE 3-apple row (visual-discipline §4 "grow it" fix) — explicitly NOT chrome padding. fit-check against zone-objects.w=670: 3·160+2·95=670 ✓, gaps 95 ≥ 43 ✓.
- Occupancy honest arithmetic: binding (horizontal) 670/1280 = 52.3% ✓; non-binding (vertical) count-climb 254/720 = 35.3% (documented as the sparse-metaphor limit, mitigated by large focal apples) and cardinality fullest cue 444/720 = 61.7% ✓.
- Zones pairwise-disjoint computed: zone-total (top), zone-badges (above apples), zone-objects (apple row), zone-caption (reserved bottom band). Title reads ALONE first (announce-topic) — apples enter only at count-climb start; tags and cardinal glyph sit in their own zones above the apples (no occlusion).
- No on-screen takeaway line (would restate the spoken caption → duplication sin); the caption ribbon carries the verbatim voice, the cardinal glyph 3 carries the moral.
- visualMotionSeconds set with dwell: topic-intro 3.5s; count-climb 13.5s (3 × ~4.5s incl. ≥3s per-item dwell); cardinality 6.5s (converge + migrate + bouncy pop + picture-leads hold + final landing). ~23.5s + tails ≈ 25s.

## ISSUES
- catalog-digest.md (the operating prompt's REQUIRED authoritative primitive inventory) returned EPERM on both attempts — it sits outside this node's harness DRIVER-READ-SCOPE (lesson-data/kptest-count-three, out/kptest-count-three, .agents only). Proceeded using CAPABILITIES.md (the full registry with reach guides + Index, which IS in scope) plus the capabilities NAMED in storyboard.md; deferred exact per-primitive registered-variant confirmation (e.g. does number-card/count-step-indicator persist? does CardinalConsolidation exist at registry?) to the W3b gap-scan.
- src/lesson-media/captionBand.ts (CAPTION_BAND exact height) is also out of read-scope; declared zone-caption via the composer-resolved CAPTION_BAND constant with an illustrative 116px for the fit arithmetic. Disjointness is robust to the real value as long as CAPTION_BAND ≤ ~130px (objects bottom 480 vs caption top).

## PIPELINE FINDINGS
- Scope inconsistency: the staged operating prompt names catalog-digest.md as the ONLY permitted source for primitive usage ("consult THIS, never read primitive source or guess"), but the harness DRIVER-READ-SCOPE omits src/, so the read is denied (EPERM). Recommend either (a) add src/capabilities/** to the W2a read-scope, or (b) copy the relevant catalog rows into the .agents inputs at W2a. Same gap affects any future W2a needing primitive-variant confirmation; CAPABILITIES.md alone does not list the per-variant `useWhen` rows that catalog-digest carries.
- Confirm at W3b that fitUnitsToZone can actually GROW a unit to a lesson-declared `{target:160}` (the helper caps at target and shrinks toward min — does NOT auto-grow beyond default). If the registered apple primitive's DEFAULT is ~96px and the helper won't grow past target, the lesson MUST pass target=160 explicitly (as this contract specifies) for the occupancy/legibility fix to land; worth a one-line note in the composer/auto-size docs.
- The non-binding vertical occupancy during the MOST-action cue (count-climb) is ~35% — inherent to a 3-item horizontal-row metaphor. The fix chosen here (grow apples to ~160px) is sanctioned by §4, but a future very-sparse lesson (count-to-2) would hit this harder; consider whether the auto-size helper or a visual-discipline note should standardize "when count ≤ ~3 on a wide canvas, raise the unit + accept the sparse non-binding axis, do NOT pad chrome."
