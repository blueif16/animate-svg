# W2a visual-design — tier-2 log (kptest-first-second-third)

## INPUTS READ
- `.agents/skills/kids-eye/SKILL.md`, `.agents/skills/visual-discipline/SKILL.md`, `.agents/skills/early-childhood-visual-taste/SKILL.md` (operating skills, in the taste skill's order-of-operations)
- `lesson-data/kptest-first-second-third/storyboard.md` (13 cues + teaching actions + W3b demands D1–D4)
- `lesson-data/kptest-first-second-third/pedagogy.md` (discoveries, reinforcement plan, global constraints)
- `.agents/TEACHING-ACTIONS.md` (binding `requires` per move: announce-topic title-alone, model-target-slow big+nothing-on-top, count-on per-item dwell ≥2–3s, learner-response-gap static wait, spaced-recall single live marker)
- `.agents/CAPABILITIES.md` + `src/capabilities/catalog-digest.md` (reuse vocabulary; no primitive source read)

## OUTPUTS WRITTEN
- `lesson-data/kptest-first-second-third/visual-design.md` (9,844 chars ≤ 13k) — measurement block, zones (computed disjointness), Visual Contract, 13-row visualMotionSeconds table, palette/motion vocab, reuse table, anti-patterns.

## COMMANDS RUN
- `wc -c .../visual-design.md` → exit 0, 9844 chars.

## KEY DECISIONS
- **Layout:** horizontal queue, front marker (coral `journey-path-flag`) fixed at LEFT; animals enter from stage-RIGHT so "front = left = flag" never flips; `ordered-row-spotlight` direction=ltr.
- **Zones:** four disjoint horizontal bands (prompt y100–300 / chips y340–470 / objects y500–930 / caption y950–1080) + full-bleed time-disjoint intro title + full-bleed marks. Pairwise gaps 40/30/20 px, shown in the artifact.
- **Sizes:** animal 280 px tall (26% short-side, > 130–160 target); chip hanzi 72 px; densest cue (recap-count) spans 68% of the binding axis with all silhouette gaps ≥65 px.
- **Color semantics:** coral = count origin (flag), sunshine = transient live-count highlight, textNavy = everything that speaks, cream = canvas; animal species colors are primitive-internal identity (W3b's quality gate).
- **Emphasis budget:** sparkle-burst at reveal-second ONLY; reveal-third gets glow-pulse without sparkle; no `motion="bouncy"` anywhere. This DEVIATES from the storyboard (it listed sparkle on both reveals) — taste skill's one-emphasis-per-video rule wins; recorded as an explicit decision, not a silent pass.
- **Ask-cue budgets:** visualMotionSeconds = 2.0 (affordance pop + pulse only); the ≥3–5s wait is the typed learner-response gap on the AUDIO side — explicitly not double-counted, noted in the table for W3.5.
- **Motion floors sum ≈ 54.5s** → emergent ≈ 55–65s with narration, matching pedagogy's band without padding.

## SELF-AUDIT (kids-eye §5 — kept out of the artifact)
1. Measurement block written; every number ≥ minimum. ✓
2. Zones disjoint by computed y-interval arithmetic; chips/captions never occluded; intro card time-disjoint (announce-topic law). ✓
3. One-element-one-signal: sunshine highlight = "being counted" (on the animal), chip pulse = "its name word" (on the chip), affordance = "your turn"; no count badges (would duplicate the highlight). ✓
4. Finger-cover both directions: chips covered → sweep still teaches order; all-but-queue covered → arrive/count/reveal still reads. ✓
5. No before/after transformation in this lesson; identity-invariance declared for cast + chips + flag. ✓
One-metaphor: single accumulating queue picture; reveals restore; no second metaphor. ✓

## ISSUES
- Storyboard→contract deviation: sparkle-burst restricted to reveal-second (see KEY DECISIONS) — downstream waves should follow the contract, not the storyboard, on this point.
- D1–D4 remain W3b verification items (hanzi value on `ordinal-label-token`, flag reads "front", no-write sweep mode, three distinct animal looks); the contract assumes they verify and flags each in the reuse table.
- `pointer-hand-arrow` (recap-invite) vs `ordered-row-spotlight`'s own counting finger: the contract requires ONE finger idiom; whether the two components render compatible hands is not knowable from the digest — W3b should verify, W4a must not show two different hands.

## PIPELINE FINDINGS
- W1 storyboard prescribed an emphasis FX (`sparkle-burst`) per reveal cue, colliding with the taste skill's one-accent-per-video budget. Either `lesson-storyboard` should leave FX allocation to W2a (name the beat, not the effect), or note the single-accent budget when naming FX in "required visual".
- The catalog digest's one-liners don't describe a component's visual IDIOM (e.g. what `ordered-row-spotlight`'s finger looks like), so W2a cannot guarantee idiom consistency across components that must read as the same object — a short "idiom" field in the digest, or a standing W3b check, would close this without reading primitive source.
