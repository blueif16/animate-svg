# W0 — Pedagogy Gate (kptest-count-three)

## INPUTS READ
- /Users/tk/Desktop/animation-test/.agents/skills/lesson-pedagogy/SKILL.md (operating skill — read first, followed literally)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-three/brief.md (knowledge point / one beat / out-of-scope / continuity / narration notes)

## OUTPUTS WRITTEN
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-three/pedagogy.md (discovery spine: lesson kind + reinforcement plan + 2 cue blocks)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-three/_logs/w0-pedagogy.md (this log)

## COMMANDS RUN
- none (read/write only; no bash)

## KEY DECISIONS
- lesson kind = math-insight (NOT language/L2): the 一/二/三 count words are the child's L1 Mandarin, half-known; the target learning is one-to-one counting + cardinality, an insight the picture reveals. So §4 math asymmetry (picture delivers, voice prep/names) applies, with the per-apple count words handled as the count being modeled (voice delivers the count word, picture delivers the one-to-one) — voicing the count is the teaching here, not leakage.
- Two cues, matching the brief's "one beat" split: cue-1 count-climb (three apples arrive paced, each gets its count word + tag) and cue-2 cardinality (the 3 re-scopes to stand for the whole set, then the total is named).
- §1 four-shape fit: cue-1 = "a new operation on a unit they already have" (one-to-one counting up); cue-2 = "a relation between units" (last count = whole). Both honest; no narration-only cue; no two-metaphor cue.
- Setup beat (§1 fourth shape) deliberately DROPPED — counting to three is not a "labor of counting" that needs contrast for a later move; nothing follows that needs the setup.
- §3 staging: cue-1 concrete (apples) + represent (running tags 1/2/3); cue-2 represent (numeral 3 as the set's number). No symbolize (no equation, no "3=three" chip) — kept age-appropriate (3–5) and within out-of-scope (no numeral >3, no addition, no comparison).
- Reinforcement (§8, reasoned not templated): the count-climb's three paced arrivals are the built-in tri-repetition that drills the half-known sequence + one-to-one; cardinality is one clean insight delivery + the total named aloud. No separately-templated recap cue; the cardinality beat doubles as landing. Length (~25s) emerges from three paced arrivals + one cardinality landing.
- §4 ordering enforced in cue-2: picture shows 3→whole FIRST, THEN voice names the total — the cardinal word is acquired/produced by hearing it after seeing its instance.

## §11 AUDIT (run in head, pass/fail)
1. Each cue = exactly one discovery sentence — PASS (cue-1 one-to-one count; cue-2 cardinality).
2. Every element answers "what discovery does this support?" with one named cue — PASS (apples+running tags ⇒ counting; relocating 3 ⇒ cardinality; no decoration).
3. No element above the cue's stage — PASS (no numeral >3, no equation, no comparison anywhere).
4. Narration preps/names; picture delivers — PASS (cue-1 voice models count words while picture delivers one-to-one; cue-2 picture relocates 3→whole before voice names total).
5. Focal element is the one that changes; supporting quiet — PASS (cue-1 arriving apple+tag change, placed apples quiet; cue-2 the 3's role changes, apples quiet).

one-metaphor check: one metaphor per cue (count one-by-one / 3-stands-for-whole) — PASS.

## ISSUES
- none

## PIPELINE FINDINGS (workflow backlog)
1. The §4/§8 acquisition carve-out is framed around L2 acquisition (a foreign sound/word the child must produce). The common early-math case — modeling the L1 *counting words* with one-to-one correspondence (voice says 一/二/三 while the picture shows one-tag-per-object) — sits between the §4 insight rule and the §8 acquisition floor, and the skill doesn't explicitly cover it. A line in lesson-pedagogy noting that L1 count-sequence practice uses the same "voice delivers the count word, picture delivers the one-to-one" division (so voicing the count is teaching, not leakage) would prevent a future node from mis-flagging a counting cue as §4 leakage.
2. §8's comprehension time-FLOOR numbers (≥6–10 spaced exposures, ≥3–5s wait-time gaps) are sized for L2/acquisition and read as over-prescriptive for very short (~25s) early-math insight lessons, where tri-repetition inside a single count cue is the honest floor. A lighter early-math-insight note ("two-minute lessons can't hit the L2 floors; nuance here is sub-second pacing") would keep short math lessons from being over-padded.
3. lesson-pedagogy's lesson-kind enum lists `math-insight | language/L2 | ...`; an explicit `early-math-counting` flavor would let downstream waves distinguish count-to-N card lessons (where voice models the sequence) from insight-only math (where voice withholds the aha) at the header, avoiding downstream misreasoning.
