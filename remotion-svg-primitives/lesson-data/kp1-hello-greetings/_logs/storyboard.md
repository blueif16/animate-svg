# Wave 1 — Storyboard — _log

## INPUTS READ
- `lesson-data/kp1-hello-greetings/brief.md` — KP (3 spoken routines: Hello/Hi, I'm…, Goodbye/Bye-Bye), the one beat (one encounter between the same two kids), out-of-scope, continuity (DialogueExchange + ReadAlongHighlight named), narration notes (Chinese-medium + embedded English; I'm = key_difficult).
- `lesson-data/kp1-hello-greetings/pedagogy.md` — 5 cues with discovery + stage + focal each: intro, meet-hello, intro-self, part-goodbye, recap. Stage ceiling = represent (never symbolize). Two-pulse budget (I'm emphasis + recap punctuation). Narration discipline: Chinese names the moment, picture delivers the English word.
- `.agents/skills/lesson-storyboard/SKILL.md` — STUB (only TODO comments); fell back to CLAUDE.md W1 contract + pedagogy gate.
- `src/capabilities/catalog-digest.md` — confirmed `dialogue-exchange` (DialogueExchange) and `read-along-highlight` (ReadAlongHighlight) entries; both lesson-agnostic, bake no copy; gesture/emphasis/beats vocabulary captured.
- `src/capabilities/asset-catalog.json` — `character-face` category = boy-face, robot-face-round, robot-face-square, sad-cloud-face (only ONE kid face).

## OUTPUTS WRITTEN
- `lesson-data/kp1-hello-greetings/storyboard.md` — the cue spine: 5 cues (verbatim pedagogy ids, in order), each with discovery ref + stage + narration-beat INTENT (no copy) + required visual (real component vocabulary). NO durations, NO frames, NO code. Plus a Wave-3 gap-scan notes section naming demands only.

## COMMANDS RUN
- `grep -rl "DialogueExchange|ReadAlongHighlight" src/` → exit 0; both exist (motion-primitives/*.tsx, registered, demo scenes).
- `grep -A18 dialogue-exchange|read-along-highlight ... catalog-digest.md` → exit 0; captured prop/variant vocabulary.
- `grep ... character-face asset-catalog.json` → exit 0; only `boy-face` among kid faces.
- `grep -niE '[0-9]+(s|frame|...)' storyboard.md` → "NONE — clean" (no duration/frame literals).
- `grep '^### [0-9]' storyboard.md` → 5 cue headers in pedagogy order (intro, meet-hello, intro-self, part-goodbye, recap).

## KEY DECISIONS
- Kept the 5 pedagogy cue IDs verbatim and in order — they ARE the spine voice/visuals/timing bind to. Did not invent, merge, or reorder.
- Narration beats written as MOMENT-NAMING INTENT only (Chinese frames the moment; picture delivers English). No copy, no durations — copy is W2b, timing is W3.5.
- Bound teaching cues (meet-hello / intro-self / part-goodbye / recap) to the registered DialogueExchange + ReadAlongHighlight; explicitly marked REUSE (no new gap) since both are lesson-agnostic.
- Encoded the two-pulse budget explicitly (I'm emphasis = pulse #1; recap punctuation = pulse #2) and the stage ceiling (no cue above `represent`) as constraints for downstream waves.
- Flagged two real capability GAPS for W3b (named as demands, not built — out of W1 scope): GAP-1 topic-intro card primitive (CLAUDE.md mandates an intro card; none in catalog), GAP-2 a second identity-invariant kid face (catalog has only boy-face among kid faces).

## ISSUES
- The `lesson-storyboard` SKILL.md is a stub (TODO-only) and is math-comparison-specific in its description; it gave no usable guidance for a language lesson. Worked from CLAUDE.md + pedagogy.md instead.
- Asset gap: only one kid face exists; DialogueExchange needs two distinct kid speakers. Flagged GAP-2 for W3b; do NOT block W1.
- No topic-intro card capability in the catalog despite CLAUDE.md mandating one per lesson. Flagged GAP-1 for W3b.

## PIPELINE FINDINGS
- `lesson-storyboard` skill is a stub AND scoped only to "early math one-to-one comparison (5>3)". It does not cover language / routine lessons. The skill should be generalized (cue-id spine + narration-intent + required-visual + no-durations contract, subject-agnostic) so W1 has real per-domain guidance instead of falling back to CLAUDE.md.
- The topic-intro card mandated by CLAUDE.md is not yet a registered capability (no `topic-intro` in catalog-digest.md). Recurs for every new lesson until W3b ships + registers a normalized intro-card primitive once; consider pre-seeding it in the library.
- `character-face` asset pool is thin (one kid + robot/cloud faces). Multi-character lessons (this one, and later Unit 1 lessons reusing the same cast) need a small registered set of distinct kid figures. Worth a proactive capability-gap-filler pass rather than per-lesson reactive builds.
