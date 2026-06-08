# W0 — Pedagogy Gate (ped)

## INPUTS READ
- `lesson-data/kptest-count-three/brief.md` — knowledge point, one beat, out-of-scope, continuity, narration notes
- `.agents/skills/lesson-pedagogy/SKILL.md` — full pedagogy skill (12 sections)
- `lesson-data/kptest-count-three/pedagogy.md` — existing artifact from prior run (audited in-place)

## OUTPUTS WRITTEN
- `lesson-data/kptest-count-three/pedagogy.md` — per-cue discovery list (4 cues); verified in-place, no changes needed

## COMMANDS RUN
- `ls lesson-data/kptest-count-three/` — confirmed existing artifacts
- `ls lesson-data/kptest-count-three/_logs/` — confirmed existing log

## KEY DECISIONS
1. **4 cues, not 3.** The brief's "one beat" (three apples appear one at a time, tags attach, final "3" for group) was decomposed into 3 counting cues + 1 cardinality cue. Three counting beats are the minimum to establish a counting *pattern* the child can anticipate (1→2 is a single step; 1→2→3 is a pattern). Two counting cues would be insufficient for acquisition.
2. **Cue 4 is a stage jump (represent → symbolize).** Cues 1–3 operate at concrete→represent (real apple + numeral tag). Cue 4's solitary large "3" is a pure symbol standing for the group total — this is the cardinality principle and requires the symbolize stage.
3. **No setup beat.** The brief "builds on nothing" and there is no prior counting state to contrast against. A setup beat (e.g. "look, some apples!") would be decoration — the child discovers counting by *doing* it, not by being told they're about to count.
4. **Reinforcement = three-beat practice loop (acquisition) + one insight hold.** Counting is a skill (acquisition), not a flash insight. Three exposures (one per apple) is proportional to a brand-new skill for ages 3–5. The cardinality cue is an insight beat — one clean delivery with a hold, no replay.
5. **Narration-leakage guard declared.** Specified correct/incorrect narration patterns per §4: the narrator names the action ("再来一个"); the visual delivers the count (tag attaches). Narrator must not count ahead of the visual.
6. **Language note:** Mandarin-medium counting lesson, not L2. §9 carve-out correctly excluded.

## FULL AUDIT (skill §1–§10)
| Skill section | Check | Result |
|---|---|---|
| §1 Teaching question | Each cue's discovery fits one of the four shapes | ✅ Cues 1-3 = new operation; Cue 4 = relation |
| §2 Teaching vs correct | Cues teach counting activity, not abstract theory | ✅ No equations, no "1+1+1=3" |
| §3 Cognitive ladder | No stage-skipping | ✅ concrete→represent (1-3), symbolize (4) |
| §4 Narration leakage | Guard section present with good/bad examples | ✅ |
| §5 One task per beat | Each cue has one cognitive task | ✅ |
| §6 Visual change | Focal element is the changing element in each cue | ✅ |
| §7 Spoken/visual match | Covered in leakage guard examples | ✅ |
| §8 Reinforcement | Reasoned per cue, not templated | ✅ |
| §9 Language/L2 | Declared not-L2 | ✅ |
| §10 Output format | Lesson kind header + per-cue paragraphs in correct order | ✅ |

## ISSUES
- None.

## PIPELINE FINDINGS
- The brief's "one beat" description maps to what pedagogy decomposes into 4 cues. Future briefs might benefit from explicitly noting when a single beat contains multiple discoveries that warrant cue-level splitting, so the storyboard wave has a head start on cue boundaries.
- The ~25s length hint is tight for 4 cues with adequate holds. The storyboard wave should verify this is achievable without rushing the counting rhythm.
