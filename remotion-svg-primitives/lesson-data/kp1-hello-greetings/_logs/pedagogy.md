# Wave 0 — Pedagogy Gate — kp1-hello-greetings

## INPUTS READ
- lesson-data/kp1-hello-greetings/brief.md (KP, the-one-beat, out-of-scope, continuity, narration notes)
- .agents/skills/lesson-pedagogy/SKILL.md (the operating contract for this node)
- src/capabilities/catalog-digest.md — grepped DialogueExchange + ReadAlongHighlight to confirm
  the two brief-referenced special components exist, are prop-driven / lesson-agnostic, and carry
  the exact mechanisms the focal lines depend on (DialogueExchange emphasis pulse on the I'm turn;
  ReadAlongHighlight swell on a single held unit). Both confirmed present.

## OUTPUTS WRITTEN
- lesson-data/kp1-hello-greetings/pedagogy.md — 5-cue discovery spine (intro / meet-hello /
  intro-self / part-goodbye / recap), each with discovery/stage/focal, plus a language-lesson
  adaptation header mapping skill §3 (ladder), §4 (narration leakage), §7 (match spoken→visual).

## COMMANDS RUN
- ls lesson-data/kp1-hello-greetings/ → exit 0 (no prior pedagogy.md; brief.md + pipeline.json + _logs present)
- grep DialogueExchange|ReadAlongHighlight catalog-digest.md → exit 0 (both rows returned)

## KEY DECISIONS
- Treated the "unit" being learned as a spoken SOCIAL ROUTINE (a thing you say at a moment),
  not vocabulary — so each phrase-cue is a §1 "new unit" discovery and the whole = ONE encounter.
- I'm cue (intro-self) is the lesson's key_difficult: discovery is the PRECISE SOUND (one syllable
  /aɪm/), carried by the DialogueExchange emphasis pulse + a single-unit ReadAlongHighlight swell.
  Explicitly NOT split into two ticks (skill §7 applied to sound).
- Stage ceiling = `represent`. No cue reaches `symbolize`: letters/spelling/IPA on screen would
  smuggle in §1.3 alphabet (out of scope). Recorded as a hard rule in the artifact header.
- Kept the recap cue: its discovery is the ARC-AS-WHOLE (three moments of one encounter) — a
  genuine new noticing per the brief's one-beat, not narration-only filler (§1 test passed).
- Pulse budget pinned to exactly two (intro-self emphasis + recap punctuation) to satisfy
  early-childhood-visual-taste's two-pulses-max rule; named WHICH two per skill §6.
- Narration framed Chinese-names-the-moment / picture-(kid)-delivers-the-English-routine (§4),
  matching the brief's Chinese-medium + embedded-English-token model.

## ISSUES
- None blocking. The brief's `**Builds on.** none` is consistent with intro = first cue. The two
  continuity characters must be established as identity-invariant here (brief) — flagged for W2a
  visual-design to pin the two kid identities, since later Unit 1 lessons reuse them.

## PIPELINE FINDINGS (workflow backlog for THIS node)
- lesson-pedagogy/SKILL.md is written almost entirely in MATH examples (tens/bundles/sticks). A
  language/English-routine lesson has to re-derive the §3 ladder and §7 count-match mappings by
  hand each time. Worth adding a short "language-lesson variant" sidebar to the skill (routine =
  unit; concrete = routine-in-its-moment; represent = read-along surfacing of the spoken form;
  symbolize = letters/spelling — usually out of scope for early oral-English KPs).
- The skill's §6 two-pulse rule is owned by early-childhood-visual-taste but pedagogy is asked to
  name WHICH two pulses. For lessons that lean on DialogueExchange's built-in emphasis pulse, it
  would help to state in the skill that a special-component's intrinsic emphasis pulse COUNTS
  against the two-pulse budget (I assumed it does and budgeted accordingly).
