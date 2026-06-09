# W1 — Storyboard Log

## INPUTS READ

| File | Status |
|---|---|
| `lesson-data/kptest-greetings-verify/brief.md` | ✅ read fully |
| `lesson-data/kptest-greetings-verify/pedagogy.md` | ✅ read fully — 5 cues with discoveries |
| `.agents/TEACHING-ACTIONS.md` | ✅ read fully — teaching-move registry |
| `.agents/skills/lesson-storyboard/SKILL.md` | ✅ read fully |
| `src/capabilities/catalog-digest.md` | ✅ read fully — capability inventory |
| `.agents/CAPABILITIES.md` | ✅ read fully — technique/system registry |

## OUTPUTS WRITTEN

| File | Description |
|---|---|
| `lesson-data/kptest-greetings-verify/storyboard.md` | Cue spine: 6 cues (intro + 5 pedagogy cues), teaching actions, narration intent, required visuals |

## COMMANDS RUN

None (W1 is a pure reasoning node — no npm/bash required).

## KEY DECISIONS

1. **Added an `intro` cue** before pedagogy's first cue. The storyboard skill mandates: "Every lesson opens with a short topic-intro beat (the `announce-topic` move)." Pedagogy.md does not include one (it starts at meet-hello). The intro cue carries `announce-topic` and frames the lesson topic before the encounter begins.

2. **Preserved pedagogy's 5 cues exactly** — meet-hello, hi-intro, im-echo, part-goodbye, recap-encounter. No merging, splitting, or reordering. Pedagogy's reasoning for 5 cues (not 3) is sound: the key_difficult /aɪm/ needs its own practice beat separate from in-context exposure.

3. **Teaching action chain per cue** — each cue is tagged with the teaching verb(s) it performs, sourced from TEACHING-ACTIONS.md. The chain follows the pattern: stage → model → gloss → echo for acquisition beats; spaced-recall for the recap.

4. **No `replay of <id>` cues** — the recap replays phrases but re-authors the visual (condensed, sequentially highlighted), so it is not a verbatim replay of an earlier cue. Each cue delivers distinct teaching content.

5. **Two capability gap flags** for W3b: school-gate backdrop (no registered backdrop primitive) and "your turn" indicator (invite-echo requires a clear signal; may be composable from existing primitives). Both are low-severity and may be satisfiable without new primitives.

## ISSUES

None.

## PIPELINE FINDINGS

- **Pedagogy.md omits announce-topic.** The pedagogy skill does not include an intro/announce cue, but the storyboard skill mandates one. This is a minor friction point between the two skills — pedagogy treats announce-topic as implicit, storyboard treats it as explicit. Consider having pedagogy.md include a brief "intro" section, or having the storyboard skill auto-inject it. Low priority — the storyboard handles it correctly by adding the cue.
- **"Your turn" visual signal for invite-echo.** The teaching-action `invite-echo` requires "a clear 'your turn' cue" but no dedicated primitive exists. Existing primitives (PointerHandArrow, PulseCircle) may compose to satisfy this, but it's worth a W3b check. If this pattern recurs across L2 lessons, a small reusable "your turn" indicator could be worth authoring.
