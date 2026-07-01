# w2a-visual-design log — kptest-count-to-two

## INPUTS READ
- /Users/tk/Desktop/animation-test/.agents/skills/kids-eye/SKILL.md (§1 measurement block, §1.5 zones, §1.6 true-size, §4 identity, §6 one-picture override)
- /Users/tk/Desktop/animation-test/.agents/skills/visual-discipline/SKILL.md (§1 Contract block, §2 one-metaphor, §4 occupancy/fit, §7 text-budget)
- /Users/tk/Desktop/animation-test/.agents/skills/early-childhood-visual-taste/SKILL.md (palette, motion vocab, sketch tone, anti-patterns)
- /Users/tk/Desktop/animation-test/.agents/TEACHING-ACTIONS.md (announce-topic requires = title reads alone; count-on requires = exactly one new item per spoken number + optional single count badge not badge+highlight; reveal requires = focal change carries discovery, narration must not pre-say; spaced-recall requires = punctuation lands on currently-spoken item)
- /Users/tk/Desktop/animation-test/.agents/CAPABILITIES.md (reuse vocabulary: fen-he-diagram migration, auto-size-to-zone, popin-motion-variants, motion-vocabulary, magic-fx-library <Breathe>, sketch <TeacherMark>, signal-focus-pointer, LessonIntroCard)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/brief.md (audience 3–5, Mandarin, ~20s hint, default style, count-and-total to two, identical apples keep identity)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/storyboard.md (announce-topic + cue-1-count [count-on] + cue-2-cardinality [reveal→spaced-recall]; gap flags: countables-plus-ordinal-tag, tag→cardinal consolidation)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/pedagogy.md (insight lesson, two cues, one end-recall doubling as §6 reserved pulse, no acquisition floors, identity-stability a precondition not a teaching element)

## OUTPUTS WRITTEN
- lesson-data/kptest-count-to-two/visual-design.md (Visual Contract: kid-eye measurement, disjoint zones w/ px arithmetic, palette, motion vocab, Contract block, per-cue visualMotionSeconds table, reuse-primitive table, anti-pattern list)

## COMMANDS RUN
(none — file-op node, no bash available)

## KEY DECISIONS
- **One metaphor:** "count tags each apple, then the last tag becomes one number for the whole group." Refused a side-by-side before/after (kids-eye §6).
- **teaching-unit = one apple, sized 220 px** (≈30.6% short-side, well over the 58→108 target). Only 2 items afford this size; apples are the focal object, not tiny.
- **Binding axis = horizontal** (apple pair spans width). zone-objects x=240 y=170 w=800 h=300 → apples 2×220+80gap=520 fit (65% of binding zone). Non-binding (vertical): ~73% of 300-px zone — no blank-float.
- **Zones y-disjoint computed live:** first draft put objects y∈[198,498] / labels y∈[520,640] = 22 px gap (under 43 floor). Reworked to objects y∈[170,470] / labels y∈[520,640] = 50 px gap ≥ floor; labels bottom 640 clears caption band (≥656).
- **Identity-invariant:** same reward-orange apple-countable in BOTH cues (no hue change on cardinality); the per-object tags "1","2" are the SAME ink-numerals that TRAVEL into the group "2" (fen-he-diagram anchor migration, no cross-fade) — the load-bearing "picture becomes symbol / glyph travels" mechanism.
- **Palette:** 4 meaningful + cream (reward apples, textNavy tags/glyph/ink, coral consolidation action, sunshine transient tag-attaching + recall pulse).
- **Motion budget (visualMotionSeconds):** announce 2.2s; cue-1 5.0s (≥2.5s dwell per counted apple, tags one-at-a-time in sync with count words); cue-2 6.0s (unanswered hold → consolidation climax → brace → end-recall pulse). Includes dwell + the cue-2 pulse as the re-engagement beat within ~14s teaching span.
- **One accent moment:** `motion="bouncy"` reserved for the group-"2" climax settle (cardinality is the new idea). All other entrances `motion="snap"`.
- **Signal discipline:** the tag-attaching highlight is ONE carrier (tag + transient sunshine pulse) — refuse a badge+highlight double (kids-eye §2, count-on requires). signal-focus-pointer at most on cue-1 attaching / cue-2 consolidation, not every spawn.

## ISSUES
- catalog-digest.md (`/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/capabilities/catalog-digest.md`) is OUTSIDE this node's DRIVER-READ-SCOPE and returns EPERM on read; the W2a prompt names it as the authoritative inventory but the read-scope (lesson-data + .agents + out) excludes `src/capabilities/`. Worked from CAPABILITIES.md (the W2a-declared reuse vocabulary) instead — which fully covers fen-he-diagram, auto-size-to-zone, popin, motion-vocab, magic-fx, sketch, signal-focus-pointer, LessonIntroCard. No reuse decision was made blindly; the gap-flagged demands (countables-plus-ordinal-tag, tag→cardinal consolidation) are storyboard-named and routed to W3b as required.

## PIPELINE FINDINGS
- **Read-scope / cited-source mismatch.** W2a's prompt instructs "consult catalog-digest.md — the COMPLETE authoritative inventory" but DRIVER-READ-SCOPE does not include `src/capabilities/`, so the digest is unreadable from this node. Either (a) add `src/capabilities/**` to the W2a read scope, or (b) reconcile the prompt wording so W2a draws the reuse vocabulary from CAPABILITIES.md alone (which is in-scope and sufficient for W2a's intent-level decisions). Catalog-digest is more relevant to W3b (primitive gap resolution) than to W2a (intent + reuse-table), so option (b) may be cleaner.
- **announce-topic has no place in the per-cue motion-budget table's pedagogy-ref column** — it carries no discovery and pedagogy.md does not list it. The composer still needs its visualMotionSeconds, so it is included as a row with a "—" discovery ref; downstream reconcile should treat announce-topic as a real cue window (its own measured clip). Confirm this is the intended contract for topic-intro cues across templates.
- **cue-2's role doubling (reveal's focal change + spaced-recall's punctuation pulse)** lands both teaching actions in ONE cue window. The motion-budget table splits cue-2 into (a..d) sub-beats so W2b/W3.5 can fit one narration clip to the window while the picture delivers the consolidation then the recall pulse. If W3.5 needs the recall as a SEPARATE cue for its own timing, the storyboard's "one cue, one recall pulse" intent should be rechecked — but the storyboard explicitly routes the recap INTO cue-2 to avoid a second retrieval cue, so this is correct as written.
