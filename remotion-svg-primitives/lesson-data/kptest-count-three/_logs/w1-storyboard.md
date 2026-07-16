# W1 — storyboard — tier-2 log

## INPUTS READ
- `/Users/tk/Desktop/animation-test/.agents/skills/lesson-storyboard/SKILL.md` (this node's operating skill — read fully, followed)
- `/Users/tk/Desktop/animation-test/.agents/TEACHING-ACTIONS.md` (teaching-move registry — tagged each cue)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-three/pedagogy.md` (gate output; lesson kind = math-insight; two discovery cues set)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-three/brief.md` (knowledge point, audience 3–5 Mandarin, ~25s scope hint, out-of-scope fence, continuity note)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/capabilities/catalog-digest.md` (live catalog; resolved all required-visual to existing primitives — no new-primitive gaps)

## OUTPUTS WRITTEN
- `lesson-data/kptest-count-three/storyboard.md` (driver artifact — cue spine + exposures ledger)
- `lesson-data/kptest-count-three/_logs/w1-storyboard.md` (this log)

## COMMANDS RUN
- none (read/write only — no bash granted or needed)

## KEY DECISIONS
1. **3-cue spine: topic-intro → count-climb → cardinality.** Added the SKILL-mandated `announce-topic` opener ON TOP of pedagogy's two teaching-discovery cues. Rationale: SKILL requires every lesson open with announce-topic, whose binding layout require ("title reads alone first; cast/teaching objects enter after, never overlaid") is load-bearing here (the apples enter at count-climb's start). Keeping it a SEPARATE cue preserves count-climb's single clean focal ("the arriving apple") instead of folding a title-read sub-beat + a count sub-beat into one cue. Pedagogy's "Two cues" is read as the two TEACHING-discovery cues; the opener is a universal non-teaching beat the SKILL adds.
2. **No separate reinforcement / replay / recap cues — by pedagogy.** count-climb's reinforcement is internal (three paced arrivals = its own drill for the half-known sequence); cardinality clicks once and IS the closing landing ("no recap"). Honored "ship exactly ONE closing retrieval recap" by NOT adding a second — cardinality is the one. No `invite-echo`/`learner-response-gap` cues (this is not an L2 acquisition lesson; no choral echoes).
3. **Teaching verbs decided before layout** (the move menu): topic-intro=`announce-topic`; count-climb=`count-on`; cardinality=`reveal`. required-visual read off each move's `requires`.
4. **All required visuals map to LIVE catalog entries → no new-primitive gaps (reuse default satisfied):** open → `lesson-intro-card`; count-climb → `countable-object`(fruit=apple)×3 + per-apple count tag (`number-card` primary / `count-step-indicator` alt — W3 picks) + `pop-in` entrance; cardinality → `cardinal-consolidation` + the three carried `countable-object` apples.
5. **Cardinality total = the third apple's 3-tag re-scoped to the whole** (continuity): flagged as a W4 composer continuity note ("the 3 labeled the third apple now stands for the whole group" = ONE migrating 3, not a re-drawn glyph); cardinal-consolidation re-renders per-item tags, so composer should feed/equal the count-climb tags.
6. **Exposures 一:1 / 二:1 / 三:2** — honest voice-encounter tally; the count words are the only acquisition-ish targets and the sequence is HALF-KNOWN (reinforcement, not first-acquisition), so the low count is expected & acceptable for a math-insight lesson; this is NOT an L2 acquisition lesson subject to the comprehension floor.
7. **Syncable target at the cue head:** count-climb opens ON the first count word (no carrier intro — the opener already named the topic); per arrival the count word leads its apple.

## ISSUES
- **announce-topic has no single pedagogy discovery** (it frames the composite knowledge point = both discoveries). Tension with the INPUT annotation "each cue must carry a discovery." Resolved by reframing topic-intro's discovery ref to "frames the composite lesson knowledge point (both discoveries)" rather than forcing a fake per-cue discovery. No discovery invented or dropped; both pedagogy discoveries (count-climb, cardinality) preserved verbatim.
- **Tension: SKILL's universal `announce-topic` vs pedagogy's stated "Two cues."** Resolved as KEY-DECISION 1 (added opener → 3 cues) and flagged for adjudication. Fallback if the workflow wants strict 2 cues: fold announce-topic into count-climb as a chained opening move (title-read sub-beat → count sub-beat) — the spine's teaching intent is unchanged either way.

## PIPELINE FINDINGS (workflow backlog — improvements to THIS node's contract)
- The SKILL's universally-mandated `announce-topic` opener and pedagogy's per-lesson cue count can conflict (here: "Two cues" vs the opener). Suggest the storyboard skill state explicitly whether announce-topic is added ON TOP of pedagogy's discovery cues ("n teaching cues + 1 universal opener") OR whether pedagogy is expected to author the opener cue itself — to remove the ambiguity every lesson will hit.
- The "each cue must carry a discovery" check (INPUT annotation) vs the universally-mandated announce-topic (carries none): clarify in the storyboard skill whether the opener is exempt; otherwise the post-gate "storyboard.md non-empty" pass is fine but a stricter per-cue discovery check would spuriously flag the opener.
- Catalog: specify whether `count-step-indicator` PERSISTS or FADES OUT after its step. Its digest text ("pops and fades it in to punctuate one step") is ambiguous for the recurring requirement "each apple keeps its tag once placed — one-to-one stable & reusable." This matters for counting lessons using persistent per-object count tags; `number-card` (unambiguously persistent) is the safe fallback.
- `cardinal-consolidation` re-renders its own per-item count tags; continuity with a prior count-climb's tags (the "3 that labeled the third apple now stands for the whole" should be ONE migrating/re-scoped 3) is a W4 composer continuity question. Consider the cardinality skill/composer calling this out for "count-up → cardinality" beats so the total reads as the SAME third tag, not a fresh glyph.
- Exposures ledger: the reconcile should key the comprehension-floor advisory off pedagogy's `lesson kind` (math-insight here) — per-word count-sequence exposure is naturally low when the sequence is half-known, and must NOT be flagged as under-floor for a non-acquisition lesson.
