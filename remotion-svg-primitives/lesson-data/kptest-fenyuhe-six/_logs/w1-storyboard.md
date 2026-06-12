# W1 — Storyboard log

## INPUTS READ
- /Users/tk/Desktop/animation-test/.agents/skills/lesson-storyboard/SKILL.md (full)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/pedagogy.md (full)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/brief.md (full)
- /Users/tk/Desktop/animation-test/.agents/TEACHING-ACTIONS.md (full)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/src/capabilities/catalog-digest.md (full — consulted to name the registered primitives correctly for the required-visual section: `LessonIntroCard`, `PartWholeComposer`, `RecapSpotlight`, `PointerHandArrow`, `PulseCircle`)

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/storyboard.md (12357 bytes, 9 cues + exposures ledger)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/_logs/w1-storyboard.md (this file)

## COMMANDS RUN
- `ls -la lesson-data/kptest-fenyuhe-six/ out/kptest-fenyuhe-six/ _logs/` — confirmed artifact paths, _logs dir pre-exists with W0..W6 entries.
- No other shell commands. W1 owns no npm/bash per the node's scope.

## KEY DECISIONS
1. **9 cues, 1:1 with pedagogy's 9 discoveries.** Cue ids carry the pedagogy's names (routine-reprise, split-1-and-5, echo-1-and-5, split-2-and-4, echo-2-and-4, split-3-and-3, echo-3-and-3, aggregator-prompt, recap).
2. **Bundled split+合 into one model cue per bond.** Pedagogy explicitly allows bundling ("W1 may bundle a split+合 model into one cue (picture does both motions, voice names the pair) or split them, as the choreography requires"). Bundling preserves co-equal cue counts across the three splits and lets the voice deliver the complete bond as a single utterance ("6可以分成1和5；1和5合成6") — satisfies the §4 acquisition carve-out.
3. **One echo cue per target, its own beat.** Per the skill ("An invite-echo gets its OWN cue — the wait-time is a real beat") and pedagogy's per-target wait-time floor (≥3–5s). Three echo cues, not one. The held visual IS the prompt; audio is silence (audio-captions bakes the `learner-response` gap into the WAV at zero TTS cost).
4. **Two closers, distinct functions** (aggregator-prompt + recap). Pedagogy emits both with distinct retrieval functions — active production from a blank prompt (aggregator) vs. canonical replay for closure (recap). The skill's recap rule explicitly allows this case.
5. **3和3 highlight expressed as extra DWELL on the echo, not as an extra cue.** Preserves co-equal cue counts (3 model + 3 echo + 1 reprise + 1 aggregator + 1 recap = 9, matching pedagogy's 9 discoveries) and co-equal exposure counts (3 each). Extra seconds are a W3a/W3.5 concern, not W1.
6. **No on-screen text-as-glyph.** Pedagogy's stage audit: "No digits (6, 1, 5, 2, 4, 3) appear as numerals on screen; counts are in the dot arrays and in the spoken Chinese." The model-target-slow move's "big centered glyph" requirement is a misfit for math-acquisition; flagged in pipelineFindings.
7. **Required visual names registered primitives only.** `PartWholeComposer mode="split"` then `mode="merge"` for the three split+recombine motions; `LessonIntroCard` for the topic opener (per announce-topic `requires`); `RecapSpotlight` for the recap (per spaced-recall `requires`); `PointerHandArrow`/`PulseCircle` as candidate "your turn" affordances. No new primitive demand.
8. **Stage ceiling honored.** routine-reprise = represent, aggregator-prompt = represent, recap = represent; the six split/echo cues = concrete. No cue reaches symbolize.

## ISSUES
- None. (See pipelineFindings for skill gaps the W1 protocol surfaced.)

## PIPELINE FINDINGS (workflow improvements)
- **Skill gap: model-target-slow is L2-flavored, misfit for math-acquisition.** The move's `requires` says "the target glyph big, centered, nothing on top, held at least its spoken length" — that's a written-glyph requirement. Math-acquisition targets are spoken bonds ("6可以分成1和5"), not written glyphs; the picture's job is the concrete instance (the dots), not a centered text. W1 used the move (the voice-carries-target spirit is right) and noted the misfit in required-visual. A future `lesson-pedagogy` or `TEACHING-ACTIONS` revision could add a math-acquisition model move (e.g. `model-bond-voice`) with `requires` scoped to "voice carries the bond; visual is the concrete instance" — this would let W1 name the move cleanly instead of overriding the `requires`.
- **Skill gap: stage-the-moment is L2/dialogue-flavored, misfit for math.** The move's `requires` mentions "who acts, to whom, when" — there are no actors in a part-whole beat. W1 used `announce-topic` alone for the routine-reprise (the title + cast-entering-after structure covers it), so this didn't bite the artifact. Same suggestion: a math-acquisition "stage the whole" move would be cleaner.
- **The previous storyboard (storyboard.PRE-W1FIX.md and the prior storyboard.md) violated the skill on multiple counts:** (a) missing the routine-reprise cue entirely; (b) stage = concrete for the recap and routine-reprise (pedagogy says represent); (c) bundled all three wait-times into ONE `cue-learner-response-gap` instead of three per-target echo cues; (d) had a `cue-reveal-answer` that revealed 3和3 ONLY (violates co-equal airtime; pedagogy's aggregator accepts the full set); (e) used `model-target-slow` with a written Chinese glyph "一和五" as the visual (violates the no-on-screen-text-as-glyph rule). The new storyboard fixes all of these. The PRE-W1FIX.md file is preserved as a diff reference; downstream waves should treat the new storyboard.md as canonical.
- **Continuity line in pedagogy is load-bearing for W3.** Pedagogy says "Reuse the registered dot primitive and the 分/合 motion vocabulary established in 5的分与合." W1 named `PartWholeComposer` and the identity-invariant six dots in required-visual so W3 can confirm reuse and not re-author. If W3 finds that the registered motion vocabulary does NOT carry the "same six dots 分 and 合, identity-invariant" guarantee, that's a W3 finding to surface, not a W1 fix.
