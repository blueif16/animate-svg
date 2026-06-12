# W1 Storyboard — kptest-greetings-verify

## INPUTS READ

- `lesson-data/kptest-greetings-verify/brief.md` — knowledge point (3 spoken routines), audience (三年级 ~8yo), the one beat (two kids at gate), out-of-scope fence, continuity notes (DialogueExchange + ReadAlongHighlight), narration notes (Chinese-medium + English targets, I'm is key_difficult)
- `lesson-data/kptest-greetings-verify/pedagogy.md` — lesson kind language/L2, 6 pedagogical cues (C1–C6), reinforcement reasoning with exposure targets (Hello/Hi ~4, I'm ~7, Goodbye/Bye-Bye ~3), acquisition spine with natural spacing via farewell interrupt
- `.agents/TEACHING-ACTIONS.md` — full teaching-move registry; tagged each cue with moves from the Index
- `src/capabilities/catalog-digest.md` — verified all required components exist (LessonIntroCard, DialogueExchange, ReadAlongHighlight, IconAsset boy-face/girl-face, PulseCircle, PopIn)
- `lesson-data/kptest-greetings-verify/pipeline.json` — lesson config (fps 30, voice config, composition name)

## OUTPUTS WRITTEN

- `lesson-data/kptest-greetings-verify/storyboard.md` — 7 cues in play order with teaching actions, narration beat intents, required visuals, reinforcement map, and exposures ledger

## COMMANDS RUN

- `ls lesson-data/kptest-greetings-verify/` — confirmed directory contents (brief.md, pedagogy.md, pipeline.json, _logs/)
- `grep -r "girl-face|boy-face|school-gate" src/capabilities/` — verified character IconAssets exist in asset catalog; confirmed no school-gate asset exists (flagged as gap for W3)

## KEY DECISIONS

1. **7 cues, not 6.** Added `topic-intro` (announce-topic) before pedagogy's C1, per the mandatory lesson-opening rule. Pedagogy's C1–C6 map to storyboard cues greet → im-slow-model → im-choral-echo → im-learner-gap → farewell → recap.
2. **Cue IDs are stable kebab-case, lesson-agnostic naming.** Used descriptive IDs (greet, im-slow-model, im-choral-echo, im-learner-gap, farewell, recap) rather than pedagogy's C1–C6 numbering, so the spine is readable without cross-referencing.
3. **Echo and gap are already separate cues.** Pedagogy's C3 (choral echo) and C4 (learner gap) naturally map to the SKILL rule "every invite-echo gets its OWN echo-<target> cue" — no splitting needed.
4. **No echo cues for farewell.** The farewell has low difficulty (familiar action, new label only) and pedagogy calls for "one clean pass" with no invite-echo. The two-variant echo rule applies only when invite-echo is used. Goodbye and Bye-Bye are modeled within a single DialogueExchange in the farewell cue.
5. **track-read-along added to im-choral-echo and im-learner-gap.** The ReadAlongHighlight text "I'm Sam" remains visible as a "your turn" affordance during both the choral invitation and the silent gap, even though the cursor is inactive during the gap.
6. **Recap is one cue, not three.** The spaced-recall move cycles through all three phrases within a single ReadAlongHighlight with a beats array that weights "I'm" for extra dwell. Splitting into three recap cues would over-fragment the closing bracket.
7. **Exposure counts match pedagogy targets.** I'm=7 (target ~7), Hello=4 (target ~4), Hi=4, Goodbye=3 (target ~3), Bye-Bye=3. The I'm count includes the extended dwell in recap as 2 retrievals.
8. **School-gate background flagged as asset gap.** No existing IconAsset for a school-gate scene background. Flagged for W3 gap-scan to resolve (author new asset or adapt existing).

## ISSUES

None.

## PIPELINE FINDINGS

- The `announce-topic` teaching move's `requires` says "the cast and teaching objects enter after it has read" — this is a temporal sequencing constraint, not just a z-order rule. The composer (W4) needs to enforce that the LessonIntroCard's full read completes before any DialogueExchange or character figure appears. Consider making this constraint more explicit in the move's `requires` or in a composer-facing note.
- The `learner-response-gap` move's `requires` says "a clear 'your turn' cue through the gap" but doesn't specify whether the ReadAlongHighlight should stay visible (cursor frozen) or fade. This storyboard chose "stays visible, cursor inactive, text glowing" — but the move's `requires` could be more explicit about the affordance behavior during silence.
