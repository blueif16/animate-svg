# W2a visual-design — kptest-compare-more-fewer

## INPUTS READ
- skills: kids-eye/SKILL.md, visual-discipline/SKILL.md, early-childhood-visual-taste/SKILL.md
- .agents/TEACHING-ACTIONS.md (move `requires` — announce-topic title-alone, model-target-slow target big/centered/nothing-on-top, invite-echo your-turn cue + learner gap, track-read-along cursor on spoken token, reveal no-pre-say, spaced-recall single live marker)
- .agents/CAPABILITIES.md (reuse vocabulary: paired-column-layout helper, popin-motion-variants, motion-vocabulary, signal-focus-pointer, breathe)
- lesson-data/.../storyboard.md, pedagogy.md
- src/capabilities/catalog-digest.md (authoritative primitive inventory)

## OUTPUTS WRITTEN
- lesson-data/kptest-compare-more-fewer/visual-design.md (12000 chars, ≤13k target)

## COMMANDS RUN
- `wc -c visual-design.md` → exit 0 → 12000 chars

## KEY DECISIONS
- ONE invariant teaching object: 5-over-3 paired picture via `getPairedColumnPlacement(5,3,{columnGap:130,rowGap:150})`. Dot = `countable-object` at 140 px (12.9% short-side, in target band).
- Surplus shown ONLY by partnerlessness (`unmatched-slot` ghost) — size + hue invariant across all readings. Top group `reward`, bottom group `coral`; color = group ID, never magnitude.
- Keystone honored by an explicit between-states rule + anti-pattern: NO re-layout/redraw match→fewer-replay; only focus highlight / surplus pulse / > glyph / phrase row change. not-by-size is the ONLY dot-moving cue; recap restores matched layout.
- Zones computed disjoint at delivery px: phrase row ABOVE objects (94 px gap), > glyph to the RIGHT (30 px gap, off dots), your-turn BELOW (30 px gap). zone-title time-disjoint (dots absent in intro per announce-topic).
- Motion budgets: keystone fewer-direction longest (7.0s) + recap (7.0s); echoes 5.5s including the held learner-response silence; intro 2.5 (title alone, no dots).
- ONE bouncy accent reserved for the surplus reveal at more-direction (the new concept); snap/settle elsewhere.
- 4 meaningful colors + cream. Read-along cursor + surplus pulse + recap highlight all = sunshine (transient only).
- Zero gap named — every demand maps to an existing catalog primitive → W3b default REUSE.

## kids-eye §5 self-check
1. §1 measurement block written, all numbers ≥ minimums (dot 140≥86, phrase 64≥48, gap-floor cleared by rowGap 150) ✓
2. Zones declared, co-present pairs computed empty-intersection; no readable content occluded (phrase/>/turn off the dots) ✓
3. Every element answers §2 (amount tags load-bearing only in two-groups then dropped; > carries direction so no redundant 多/少 word; surplus pulse = the active signal, ghost = the partnerless state — distinct signals) ✓
4. Finger-cover: cover phrase row → match motion still teaches surplus; cover all-but-dots → the partnerless pair still reads "more". ✓
5. Identity preserved — same dots same size same hue across every reading (explicit identity-invariant + anti-pattern) ✓

## ISSUES
- None blocking. The "5"/"3" amount tags in two-groups occupy zone-amount (12 px above objects) — disjoint because amounts are present only pre-match and dropped after; flagged for composer to NOT persist them.

## PIPELINE FINDINGS
- TEACHING-ACTIONS `model-target-slow.requires` says "target glyph big, centered, nothing on top" — written for a SINGLE glyph (pinyin/word lessons). Here the "target" is a multi-token 比-PHRASE (五比三多) bound to a SURPLUS on the picture, not a centered glyph. The move's requirement maps awkwardly: the phrase reads in zone-phrase (top), the referent surplus pulses in zone-objects (center). Consider a note in the move that for compare/L2 phrase-acquisition the "target" may be a phrase row + a pulsed picture-referent, not one centered glyph.
- No catalog primitive expresses "a held picture whose READING focus slides without the picture moving" (the keystone fewer-direction focus-slide). I specified it as a reading-focus highlight migrating via EASE.inOutCubic, but it leans on the composer to choreograph from existing parts (pulse-circle re-anchoring + read-along on a new row). If this pattern recurs across compare lessons, a `reading-focus-slide` capability may be worth naming for W3b.
