# w1-storyboard log — kptest-count-to-two

## INPUTS READ
- `/Users/tk/Desktop/animation-test/.agents/skills/lesson-storyboard/SKILL.md` — the W1 skill (read fully, followed literally).
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/pedagogy.md` — the gate: lesson kind = math-insight; two cues (cue-1-count concrete, cue-2-cardinality symbolize); insight-shaped §8, no §9 acquisition floors (一/二 near-known, not targets); cue-2 end-recall absorbs the recap role and is the §6 reserved pulse.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/brief.md` — audience 3–5 Mandarin; knowledge point = count-to-two + cardinality; out-of-scope fence; continuity = identical identity-invariant countables + number tags.
- `/Users/tk/Desktop/animation-test/.agents/TEACHING-ACTIONS.md` — teaching-move registry; tagged each cue with its move(s) and read required-visual OFF each move's `requires`.

## OUTPUTS WRITTEN
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/storyboard.md`

## COMMANDS RUN
- none (file-ops only; this node has read/write/edit, no bash — and none was needed).

## KEY DECISIONS
1. **Insight, not acquisition → no echo/wait-time cues.** Pedagogy explicitly carves out (§9 N/A): 一/二 are near-known Mandarin count words, not targets to acquire. So no `invite-echo`, no `echo-*` cues, no `learner-response-gap` beats, no choral repeats — the entire §9 rhythm is correctly absent. The `exposures` ledger is therefore `{}` (no acquisition targets), not the populated L2-style map.
2. **Three cues total: announce-topic + cue-1-count + cue-2-cardinality.** Pedagogy defines TWO teaching cues; the `announce-topic` opener is a skill discipline (every lesson opens with it), precedes the discoveries and carries no discovery of its own — it is NOT a third discovery and does not inflate the exposure/count.
3. **cue-1 = `count-on` only.** No `model-target-slow`: that move is for acquisition of a new word/sound; here the spoken count word must LAND IN SYNC with the tag attaching (§7 count-match), and tagging-in-turn IS the model. Required-visual read off `count-on.requires`: exactly one new item per spoken number, in sync; countables + per-item tag, NOT badge-and-highlight double.
4. **cue-2 = `reveal` → `spaced-recall`.** The two-tag→one-group-"2" consolidation IS the picture delivering the insight (`reveal`: narration must NOT pre-say it, §4 leakage). The end-re-voiced total naming the whole is a light `spaced-recall` — and per pedagogy it doubles as the lesson's one retrieval recap and §6 reserved pulse. Per the skill's "ship exactly ONE closing retrieval recap" rule, I did NOT emit a second closer; cue-2 owns both roles.
5. **Two named required-visual gaps flagged for W3b** (as demands, never built): (a) "countables + in-turn ordinal tag attaching in sync with the spoken count word"; (b) "per-object tags (1,2) consolidating into a single group-total glyph (2) representing the whole, apples quiet." Both sourced from the teaching actions' `requires`; W3b diffs them against the live catalog-digest (which I did not open — W3b's job, not W1's; W1 names the demand).
6. **reportable cue spine:** announce-topic → cue-1-count → cue-2-cardinality.

## ISSUES
- none blocking.

## PIPELINE FINDINGS (workflow backlog for THIS node)
- The W1 skill's `exposures` block example is L2-shaped ("I'm: 8, Hello: 7"). For a correctly-classified math-insight lesson with NO §9 targets, the meaningful content of `exposures` is "N/A — insight, no acquisition targets." A one-line note in the skill that the ledger is {} (or omitted) when pedagogy declares a non-acquisition lesson would prevent a future W1 from forcing an L2-style ledger onto an insight lesson.
- The skill resolves "two closing beats that each re-present the whole target set → ONE recap cue," but here pedagogy itself routes the recap role into cue-2's end-recall (cue-2 IS the recap). The skill's recap-merge rule is written for the case where pedagogy emits SEPARATE closers; when pedagogy instead FOLDS the recap into a teaching cue, W1 should honor that fold rather than treat it as two-closers-to-merge. A sentence acknowledging the "already-folded recap" case would help.
