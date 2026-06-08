# W2a — Visual Design — node log (kp1-hello-greetings)

## INPUTS READ
- `lesson-data/kp1-hello-greetings/pedagogy.md` — 5 cues (intro / meet-hello / intro-self / part-goodbye / recap); routine-as-unit; stage ceiling = represent; match-the-spoken-count for sound ("I'm" = ONE unit); narration discipline §4 (Chinese names the moment, picture delivers English).
- `lesson-data/kp1-hello-greetings/storyboard.md` — cue spine verbatim; division of labor; two-pulse budget (intro-self I'm + recap punctuation); GAP-1 topic-intro card, GAP-2 second kid face flagged for W3b.
- `lesson-data/kp1-hello-greetings/brief.md` — audience 三年级 ~8yo Mandarin, Chinese narration + English targets; one beat = two kids meet→name→part; reuse DialogueExchange + ReadAlongHighlight.
- skills: kids-eye, visual-discipline, early-childhood-visual-taste (read in mandated order).
- `.agents/CAPABILITIES.md` + `src/capabilities/catalog-digest.md` — confirmed dialogue-exchange, read-along-highlight, pulse-circle, pop-in, breathe exist and bake no copy.
- `src/theme.ts` — confirmed cream/reward/coral/textNavy/softGrayBlue/sunshine/sky token hex.

## OUTPUTS WRITTEN
- `lesson-data/kp1-hello-greetings/visual-design.md` — full Visual Contract: §1 measurement block (language-lesson reframe: swept English phrase as teaching unit ≥86px, target 130-160, "I'm" largest), §1.5 nine disjoint zones (stage / kid-left / kid-right / bubble-left / bubble-right / title / readalong / caption / marks), palette (4 meaningful colors + cream; reward=speaking accent, coral=emphasis/2-pulse, navy=ink, softGrayBlue=dimmed; sunshine+sky deliberately unused), motion vocabulary (named curves only), §1 Contract block, per-cue choreography intent, per-cue visualMotionSeconds (intro 3.0 / meet-hello 2.5 / intro-self 4.0 / part-goodbye 3.0 / recap 3.5), and the §5 self-check.

## COMMANDS RUN
- `grep` palette tokens in src/theme.ts → exit 0 (cream #FFF7E6, reward #FFB84D, coral #FF8A65, textNavy #24324B, softGrayBlue #6B7280, sunshine #FFD85A, sky #5EC8F8).
- frame-literal scan on visual-design.md → exit 0, "(none)" — ZERO absolute frames leaked.
- capability-id confirm in catalog-digest.md → exit 0 — all 5 referenced ids exist.

## KEY DECISIONS
- Reframed the kids-eye teaching-unit from a countable onto the SPOKEN ROUTINE: smallest signal mark = one swept word/segment of the English phrase via ReadAlongHighlight. Math examples (sticks/bundle) discarded; their discipline kept.
- English NEVER in zone-caption; Chinese NEVER in zone-bubble/zone-readalong — pedagogy §4 division of labor made SPATIAL so the picture can't become decoration.
- "I'm" modeled as the LARGEST + SLOWEST mark (held read-along beat + coral pulse) — key_difficult gets the longest budget (intro-self 4.0s).
- Pulse budget honored exactly: coral PulseCircle on "I'm" (#1) + recap punctuation (#2); no sparkle/glow/3rd pulse. PopIn motion="bouncy" per-bubble is NOT the once-per-video accent (each bubble is a discrete spoken event) — the two pulses are the emphasis budget.
- nameCard "Sam" allowed on intro-self ONLY (binds name↔person), not duplicated as caption (no within-card redundancy, Mayer).
- Recap arc lives in zone-readalong as the SAME recalled phrase marks (not new flashcards) with the two kids staying on stage — identity-invariance across the transformation.
- Kid figures + cream excluded from the 4-meaningful-color budget (fixed identity / background, not a meaning channel).

## ISSUES
- None blocking. visualMotionSeconds are honest motion-read estimates; actual cue windows are W3.5's (max(narration, motion)+tail). Brief Length hint (45-60s) — sum of motion budgets is 16.0s motion-side; final length emerges from reconcile against real narration, expected to land in-band.

## PIPELINE FINDINGS (workflow backlog for this node)
- The kids-eye §1 measurement-block template is written entirely in early-MATH vocabulary (teaching-unit examples = 小棒/bundle, primary-label examples = 一个十). A language/English-routine lesson has to re-interpret it on the fly. Worth a short "non-math lesson" addendum in kids-eye SKILL.md giving the language-form of the teaching unit (the swept spoken phrase) so future Unit-1 lessons don't each re-derive it.
- visual-discipline §1's motion-budget example block is also all math cues (fen-show, fenheshi-intro). A language example row (a dialogue turn / a read-along sweep) would speed W2a for the PEP-English track.
- The contract has hard dependencies on TWO unbuilt capabilities (GAP-1 topic-intro card, GAP-2 second kid face). W2a can only reference them by intent; if W3b declines to build either, the composer is blocked. The W2a→W3b handoff would be tighter if the storyboard's GAP notes were echoed into a machine-checkable "required-but-absent capability" list the reconcile/composer nodes can assert against, rather than living only as prose.
