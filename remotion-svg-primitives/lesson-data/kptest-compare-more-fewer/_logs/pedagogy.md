# W0 pedagogy — log

## INPUTS READ
- lesson-data/kptest-compare-more-fewer/brief.md (KP, the one beat, out-of-scope, continuity, narration notes)
- .agents/skills/lesson-pedagogy/SKILL.md (the wave's operating spec)
- src/capabilities/catalog-digest.md (to ground focal-element choices against real primitives — not to design layout)

## OUTPUTS WRITTEN
- lesson-data/kptest-compare-more-fewer/pedagogy.md (4913 chars; 7 cues: intro, two-groups, match, more-direction, fewer-direction, not-by-size, recap)

## COMMANDS RUN
- wc -c pedagogy.md + ls lesson dir → exit 0; file present, 4913 bytes, correct path; _logs/ pre-existing

## KEY DECISIONS
- lesson kind = math-insight WITH an L2-style acquisition layer. The matching insight is picture-delivered (§4: voice withholds which group is more); the two 比-utterances 五比三多 / 三比五少 are acquisition targets the voice names in full (§4 carve-out) + drills with wait-time. Declared both so downstream plans the spoken target + the heavier reinforcement.
- Brief's keystone ("more/fewer are two directions of the SAME comparison") = its own cue (fewer-direction) with the longest dwell and the picture explicitly UNCHANGED — only the reading flips. This is the lesson's one beat.
- The two phrases are treated as co-equal acquisition targets (§8 breadth): each gets a dedicated delivery cue + a learner-response gap + a recap slot — neither name-checked. Wait-time after each comparison is per the brief's explicit ask, encoded as learner-response gaps (≥3–5s).
- "Decided by matching, not by size/spread" is in the KP, so it earns one guard cue (not-by-size) — spreading the smaller row wide, re-match, surplus invariant. §4: voice asks, picture answers.
- intro + two-groups are framing/setup (no discovery) — kept because the topic-intro card is CLAUDE.md-mandated and two-groups is the concrete substrate the matching insight needs. Neither is padded.
- Focal elements named against catalog primitives that exist (countable-object/unit-block dot, pair-connector, unmatched-slot, comparison-symbol, recap-spotlight) so storyboard/visual-design can plan REUSE — but I specified intent only, no layout/frames.

## §11 SELF-AUDIT (reported here, NOT emitted into the artifact)
1. One discovery sentence per cue — PASS.
2. Every focal element supports a named cue's discovery, none for "the math behind" or decoration — PASS.
3. No cue reaches above its declared stage — PASS (symbolize only on the 比-utterance acquisition cues + recap, where naming the utterance IS the target; match/two-groups stay concrete/represent).
4. Narration prepares/names + picture delivers — PASS, with the §4 carve-out applied to the acquisition utterances (voice names them) and withheld for the matching insight + the size guard (voice asks, picture answers).
5. Focal element is the one that changes; supporting quiet — PASS.

## ISSUES
- none blocking. The lesson straddles math-insight and acquisition; I declared the hybrid explicitly rather than forcing one mold (§9 says don't force language content through the math mold). Downstream must honor BOTH the §4 carve-out (voice says the 比-phrases) AND §4 withholding (voice does not pre-name which is more).

## PIPELINE FINDINGS
- The lesson kind taxonomy in the skill's Wave-0 header (`math-insight | language/L2 | ...`) has no first-class slot for a HYBRID where the insight is picture-revealed but its NAMING is an acquisition target (compare-by-matching where the comparison PHRASE is drilled). I declared the hybrid in prose. The skill could name this "math-insight + acquisition-named-result" pattern explicitly so future comparison/relation lessons (more/fewer, longer/shorter, taller/heavier) plan the dual discipline (withhold the insight, voice the named result) without re-deriving it each run.
