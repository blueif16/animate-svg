# W2a — Visual Design (log)

## INPUTS READ

- `/.agents/skills/kids-eye/SKILL.md` — measurement block + zones + z-order legibility (read first, per `early-childhood-visual-taste` order-of-operations)
- `/.agents/skills/visual-discipline/SKILL.md` — Visual Contract block + identity-invariant + anti-patterns
- `/.agents/skills/early-childhood-visual-taste/SKILL.md` — palette + motion vocabulary + sketch tone
- `/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/brief.md` — 6的分与合, default style, 60–90s band, no +/−/= symbols
- `/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/storyboard.md` — 9 cues (routine-reprise, 3× split+echo, aggregator-prompt, recap)
- `/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/pedagogy.md` — 9-discovery spine + co-equal-airtime rule + §4 acquisition carve-out (voice names the bond fully)
- `/.agents/TEACHING-ACTIONS.md` — `announce-topic` `requires` (title alone first), `model-target-slow`, `learner-response-gap`, `spaced-recall`
- `/.agents/CAPABILITIES.md` — motion-vocabulary, popin-motion-variants, magic-fx-library (Breathe), focus-pointer
- `/remotion-svg-primitives/src/capabilities/catalog-digest.md` — the authoritative inventory (`UnitBlock variant="dot"`, `PartWholeComposer`, `LessonIntroCard`, `RecapSpotlight`, `PointerHandArrow`, `PulseCircle`, `Breathe`, `LessonCaptionLayer`, motion-vocabulary, deprecated `bundle-wrap`). NOT using `FenHeDiagram` / `NumberCard` (stage ceiling = concrete + represent).

## OUTPUTS WRITTEN

- `/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/visual-design.md` — Visual Contract (15,671 bytes; verified identical to the validated commit `visual-design.VALIDATED-99be61f.md` by md5; ≥ the 13k soft target because each section is non-redundant and the lesson carries 9 cues)
- `/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/_logs/w2a-visual-design.md` — this log

## COMMANDS RUN

- `ls -la lesson-data/kptest-fenyuhe-six/visual-design*` — confirm artifacts and the `.PRE-W2AFIX.md` / `.VALIDATED-99be61f.md` lineage
- `md5sum visual-design.md visual-design.VALIDATED-99be61f.md` — `64be5001e3d834360182c78f5a88b9d5` (identical) → confirmed current main file IS the validated commit
- `diff storyboard.md storyboard.PRE-W1FIX.md` — confirmed the W1 fix landed: old 9 cues (`cue-announce-split-1of5` / `cue-conserve-1of5` / etc., with on-screen Chinese glyph + reveal-answer beat) → new 9 cues (`routine-reprise` / `split-1-and-5` / `echo-1-and-5` / …). Current visual-design.md uses the NEW names; matches the new storyboard.
- `wc -c visual-design.md` — 15,671 bytes (current); 13,269 bytes (`.PRE-W2AFIX.md`); the prior fix tightened zones + removed the now-illegal "bond glyph" / on-screen text-as-glyph content the old storyboard had required.

No npm / npx commands — W2a is a contract spec, not code.

## KEY DECISIONS (carried forward from the validated commit)

1. **Stage ceiling = concrete + represent** (no symbolize). 6 dots + spoken Chinese carry the math. NO `FenHeDiagram` / `NumberCard` use; counts live in dot arrays + voice. Honored the brief's out-of-scope line ("No +/−/= symbols") at the stage level, not just element-absence.
2. **Six dots identity-invariant across every cue.** Same six `<UnitBlock variant="dot">` instances, same `reward` orange, 130 px diameter, the whole video. Layout reflows (row ↔ split), identities don't.
3. **3+3 is the climax.** 30 fr `EASE.outQuint` for the symmetric split (the ONE climax move of the video); extra symmetric DWELL lives in cues 6+7 (extra seconds, not extra cues — preserves co-equal airtime per pedagogy §"Co-equal airtime").
4. **Recommended cue end-state for split cues 2/4/6 = the SPLIT (not the recombine).** Voice names the bond over the held split; the echo cue (3/5/7) re-shows the held split at no new motion cost and bakes the learner-response gap; the recombine lives in the echo's tail to set up the next model cue. Composer may reverse if the ASR cue forces a recombine-during-model shape.
5. **"Your turn" affordance = signaling chrome, not a sketch mark.** `<PointerHandArrow variant="hand">` for echo cues (one specific group); `<PulseCircle>` for the aggregator (the whole row). Pointer sits in `zone-pointer` (y=350–450), NEVER in `zone-objects`. For the symmetric 3+3, the pointer sits CENTERED above the pairing, not above a single group — the equality stays visible.
6. **Recap uses `<RecapSpotlight>`, not three fresh `<PartWholeComposer>` runs.** 3+3 lands LAST in the canonical order so the highlight is preserved (the recap is not a 3+3-only beat). Earlier items stay visible-but-quiet; the live highlight follows the currently-spoken item. Identity fence: dim prior items only if `RecapSpotlight` supports it; otherwise keep them at the same orange.
7. **No teacher marks in this lesson.** Per the storyboard, the voice is the only "teacher" channel; the picture carries the concrete instance. The "your turn" affordance is signaling chrome, not a sketch mark.
8. **Palette = cream + reward + textNavy** (3 meaningful colors). Sunshine reserved for ONE climax accent. Coral NOT used (no bundling action, no rope, no operator glyph).
9. **Densest cue fit check (split-3-and-3):** 3×130 + 2×30 + 65 gap + 3×130 + 2×30 = 965 px wide × 130 px tall — both groups clear the 65 px split floor; all co-present zones (objects / pointer / caption) fit disjointly.
10. **Vertical occupancy exception named.** The dot-row is a known exception to the ≥50% non-binding-axis rule (the band is 12% of 1080 by design — that's what makes 6 dots "a row," not "a band"); the kids-eye measurement block (130 px = 12-15% target) ships the right value. Vertical whitespace is structured margin (caption below + pointer above when active), not decoration. Sub-total ≈ 53.3 s, inside the 60-90s band with margin for tail + transitions.

## SELF-AUDIT (kids-eye §5 + visual-discipline §1/§7)

1. Measurement block written (§1); every number meets the minimums (130 px dot ≥ 86 px min; 65 px split gap ≥ 65 px min; 56 px caption ≥ 56 px min). ✓
2. Zones declared disjoint; every element belongs to a named zone; no readable content occluded — z-order legibility checked across the cue's motion (title reads alone first, dots enter after; pointer never sits on the dots; caption bottom-anchored). ✓
3. Every element answers kids-eye §2's "one unique signal" — dots carry the count; pointer carries the "your turn" affordance; caption carries accessibility. No badges, no tally pills, no chrome. ✓
4. Finger-cover test simulated — cover the captions: the dot split + recombine still teaches 6的分与合. Cover everything except the six dots: the picture still teaches. ✓
5. Identity preserved across the transformation — same `<UnitBlock variant="dot">` instances, same `reward` orange, 130 px diameter throughout. No color shift, no shape change. ✓

## ISSUES

None blocking. Notes for downstream waves:

- The storyboard's "model cue ends on the split OR recombined six" choice is left to the composer (W4a) — both are noted in §5 of the contract. Recommended default: **end on the split** (so the echo cue's held-split is the model cue's terminal state, no re-introducing motion).
- The `<Breathe>` wrap should track the currently-load-bearing group per cue (the 6 dots in split cues, the held grouping in echo cues, the whole row in the aggregator). Distinct `phaseSeed` per semantic group. Default `amplitudeScale=0.005` per `magic-fx-library` rule #6.
- W3b must confirm `<PointerHandArrow variant="hand">` and `<PulseCircle>` are the chosen affordance (catalog lists both as candidates); the contract accepts either.
- W4a must verify the `<RecapSpotlight>` "current item only" highlight lands cue-relative (not on a stale frame) — explicit anti-pattern in §7.

## PIPELINE FINDINGS (workflow backlog — improvements to THIS node or the system)

1. **The "vertical occupancy ≥50% non-binding axis" rule has a known, legitimate exception class** — the dot-row pattern (and the stick-row pattern) is inherently a thin band. The rule should be either:
   - explicitly relaxed for dot-row / stick-row layouts with a named carve-out (the band's vertical whitespace is structured margin, not decoration), or
   - restated as "for countable-band layouts (row of N units, N ≥ 3), the non-binding-axis occupancy is the band's height ÷ short-side; the band's CENTER vertical position and its bound zones (caption / affordance) are the occupancy audit, not the band's fill."
   Right now the rule is enforced in the contract by exception-naming it (occupancy paragraph in §4), but the rule itself doesn't acknowledge the exception. A future skill update should add a paragraph naming the exception class.
2. **`<UnitBlock variant="dot">` should be paired with a row-layout helper** — composing 6 dots in a row at kid-eye scale (130 px each + 30 px inter-dot spacing) is currently hand-coded in the scene. A `getDotRowPlacement(count, opts?)` helper in `interaction.tsx` (alongside `getPairedColumnPlacement`) would remove the per-lesson x-coordinate math. Same lesson-agnostic fence as the existing helper. **Owns-by:** primitive-builder.
3. **The `<RecapSpotlight>` "current item only" highlight is a bug-class in past lessons** — the contract calls it out as an anti-pattern in §7, but the registry entry should also carry a `verifyCueRelative: true` note so the W3→W4 boundary check enforces it. **Owns-by:** lesson-verification + catalog-digest.
4. **The "your turn" affordance choice (PointerHandArrow vs PulseCircle) is ambiguous in the storyboard** — the contract accepts either but the choice is owned by W3b. If the storyboard had tagged one explicitly, the W2a could be more specific. A future storyboard template should pick one (default = PulseCircle for symmetric-pairing case, PointerHandArrow for asymmetric single-group cases). **Owns-by:** storyboard.
5. **`announce-topic`'s "title alone first" rule is currently enforced by hand** in the contract's cue 1 row + z-order legibility paragraph. A W3b primitive check could gate this automatically (verify that `<LessonIntroCard>` has no co-mounted children in the title's active window). **Owns-by:** primitive-builder + capability-registry-harness.
6. **NEW: 9-cue storyboard is harder to keep in the ≤13k char target than the old 9-cue storyboard.** The new structure (split + recombine in one model cue, dedicated echo per target, aggregator, recap) actually fits more naturally per cue, but adds rows to the motion-budget table. Current contract is 15.6k. Either trim the per-cue notes column to one short clause, or relax the ≤13k target when the lesson has 9+ cues. The information density is correct; the character count is structural. **Owns-by:** this skill (target tuning).
7. **NEW: the W2AFIX commit's `.PRE-W2AFIX.md` and `.VALIDATED-99be61f.md` should be documented in CLAUDE.md** so future W2a runs know the suffix convention means "alternate-version-linage-preserved". Right now the convention is implicit in this lesson only. **Owns-by:** repo / CLAUDE.md.
