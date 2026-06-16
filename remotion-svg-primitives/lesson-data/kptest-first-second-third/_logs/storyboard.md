# W1 storyboard — tier-2 log (kptest-first-second-third)

## INPUTS READ

- /Users/tk/Desktop/animation-test/.agents/skills/lesson-storyboard/SKILL.md (wave skill — followed literally)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-first-second-third/pedagogy.md (7 beats: intro, line-first/second/third, ask-second, ask-third, recap-count + exposure plan)
- /Users/tk/Desktop/animation-test/.agents/TEACHING-ACTIONS.md (move menu + per-move requires)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-first-second-third/brief.md (KP, audience, out-of-scope fence)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/src/capabilities/catalog-digest.md (authoritative inventory — for required-visual naming)

## OUTPUTS WRITTEN

- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-first-second-third/storyboard.md — 13-cue spine + W3b demand table (D1–D4) + machine-readable exposures ledger
- this log

## COMMANDS RUN

- none (read/write only — no npm, no render; W1 owns no commands)

## KEY DECISIONS

1. **7 pedagogy beats → 13 cues, same discovery set + order.** Each split is a skill rule, not a re-decision of the teaching:
   - c2/c3/c4 → `arrive-*` + `name-first`/`count-*` pairs: SKILL "syncable target gets its onset at the cue start … carrier framing moved to a preceding beat". Making the count/naming phrase the cue's ENTIRE narration makes the §7 chip-per-spoken-word sync composable from cue boundaries alone (ASR is QA-only in v4 — no mid-cue token anchors exist).
   - c5/c6 → `ask-*` + `reveal-*` pairs: SKILL "make the prompt its own cue — the reveal is the following cue"; the typed learner-response gap rides the ask cue, the picture-answers-first reveal anchors at the next cue head.
   - c7 → `recap-invite` + `recap-count`: same syncable-head reasoning for the choral sweep; explicitly ONE retrieval recap split for mechanics, not two closers.
2. **Tail-anchoring for `name-first`:** natural Mandarin puts the ordinal at the utterance END ("…排第一"); pedagogy §4 forbids bare-token utterances. Resolved without unnatural word order: a dedicated short cue whose clip narrationFrames are exact lets the chip attach anchor to narration END.
3. **Choral close has NO silent gap** (pedagogy specifies gaps only on c5/c6; the slow sweep IS the child's count-along window) — tagged as invite-echo choral variant.
4. **Exposure ledger counts ask + reveal as separate spaced encounters** (question voices the word; confirm voices it again) → 第一 4 / 第二 5 / 第三 4 / rule 5, all inside pedagogy's planned ranges.
5. **Required visuals named from catalog only:** lesson-intro-card, countable-object(animal), ordinal-label-token, ordered-row-spotlight, pop-in, pulse-circle, glow-pulse, sparkle-burst, pointer-hand-arrow, icon-assets journey-path-flag / question-mark-circle. Four verify-demands (D1 hanzi-not-digit chips, D2 front marker legibility, D3 sweep without write step, D4 three distinct animal countables) flagged as named demands for W3b — no building here.

## SELF-CHECK (kept out of the artifact per lean-artifact law)

- Every cue carries ≥1 teaching action; no filler cues (arrive-* cues carry stage-the-moment framing, not empty narration).
- Discovery set complete: all 7 pedagogy discoveries present verbatim once; pair cues cross-reference instead of restating.
- No durations/frames/code/copy in the artifact (the ≥3–5s on gap cues is the move-registry requirement reference, not a cue-duration estimate).
- One closing retrieval recap (invite+sweep = one retrieval event); no duplicate closers.
- announce-topic ordering requirement (title reads alone, cast after) recorded as a binding beat-ordering note on `intro`.
- Front-marker invariant carried as a global line in the lesson-shape paragraph.

## ISSUES

- none blocking. D1–D4 are verify-demands for W3b, not failures.

## PIPELINE FINDINGS

1. **Mandarin tail-position targets vs the syncable-head rule:** lesson-storyboard's "target at the cue HEAD" rule assumes head-anchoring is the only reliable anchor, but for a dedicated short cue the per-cue clip's exact narrationFrames make narration-TAIL anchoring equally reliable — and natural Mandarin ordinal utterances end with the target. The skill could codify the tail-anchor alternative so future W1s don't force unnatural word order or over-split.
2. **No naming convention for retrieval-question prompt cues:** the skill blesses `echo-<target>` for echo cues; learner-response-gap QUESTION prompts (no echo) have no convention — used `ask-<target>`. Worth blessing in the skill so W2b reliably puts the gap on the prompt cue.
3. **invite-echo lacks a choral/count-along variant:** its `requires` mandates a ≥3–5s silent gap, but a choral close is simultaneous (no gap). TEACHING-ACTIONS could note the choral variant to avoid W2b inserting a spurious gap.
4. **catalog-digest one-liners truncate mid-sentence** (e.g. `ordinal-label-token`, `conservation-bundle`): forced verify-demands D1/D3/D4 that fuller digest prose might have answered. The digest generator should not truncate the use-when line — under the READING LAW the digest is the ONLY usage source, so truncation directly costs downstream certainty.
