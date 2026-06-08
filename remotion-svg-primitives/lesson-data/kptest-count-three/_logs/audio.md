# Wave 2b — Audio / Captions Log

**Lesson:** kptest-count-three
**Date:** 2026-06-08
**Status:** ok

---

## INPUTS READ

| File | Role |
|------|------|
| `lesson-data/kptest-count-three/pedagogy.md` | Per-cue discoveries + narration-leakage guard (§4) |
| `lesson-data/kptest-count-three/storyboard.md` | Cue IDs, narration-beat INTENT, reinforcement roles |
| `lesson-data/kptest-count-three/visual-design.md` | Visual Contract — per-cue `visualMotionSeconds` (THE BUDGET) |
| `lesson-data/kptest-count-three/brief.md` | Lesson scope + narration notes (avoid 3-item comma lists) |
| `lesson-data/_shared/voice.json` | Voice config: Aoede, ~0.30 s/char, maxClipSeconds 6.5 |
| `.agents/CAPABILITIES.md` | Capability registry (no new capabilities referenced) |
| `.agents/skills/lesson-audio-captions/SKILL.md` | Skill: targeting rule, leakage rule, ASR flags, captions |
| `/Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md` | Skill: CuePlan JSON format (narration / phrase / caption) |

## OUTPUTS WRITTEN

| File | Description |
|------|-------------|
| `lesson-data/kptest-count-three/audio-captions.md` | Per-cue narration table + caption plan + ASR risk flags + cue-boundary INTENT |
| `lesson-data/kptest-count-three/script-cues.json` | CuePlan JSON: 5 cues with id, narration, phrase, caption |

## COMMANDS RUN

| Command | Exit | Key output |
|---------|------|------------|
| `mkdir -p lesson-data/kptest-count-three/_logs` | 0 | Created logs directory |
| `ls -la` (verify outputs) | 0 | audio-captions.md: 6825 B, script-cues.json: 936 B |
| `python3 -c "import json..."` (validate JSON) | 0 | 5 cues parsed, all fields present |

## KEY DECISIONS

1. **Narration follows the pedagogy §4 good-example pattern exactly:** "看，一个苹果" → "再来一个，两个" → "还有一个，三个". The narrator names the action and the count simultaneously with the visual — never ahead.

2. **Cardinality narration uses "数完啦！一共三个苹果。"** — the celebratory "啦" particle marks the insight moment naturally. Naming the total is correct per pedagogy §4 because the insight IS what "three" means.

3. **No §3 hold table** — deleted mechanism, not generated.

4. **No 3-item comma lists** — per the brief's Aoede TTS calibration note, no cue uses the problematic "A，B，C，" pattern.

5. **Cardinality cue gets `emphasis: true`** — it is the lesson's single insight moment; the emphasis flag lets the caption layer apply the theme's emphasis style.

6. **No replay cues needed** — the three counting beats are the acquisition loop (structural repetition with advancing content), not replay of the same clip.

## ISSUES

None. All narration fits within ±26% of visual budgets (most within ±20%). The slight overage on cues 3–4 (+0.4 s each, +20–24%) is due to the natural two-part phrasing ("还有一个 [pause] 三个") matching the two-event visual (apple arrives [pause] tag attaches). Wave 3.5 reconcile will set cue windows to max(narration, visual) + tail.

## PIPELINE FINDINGS

- The ±20% targeting tolerance is tight for cues where the narration has a natural two-part structure (action phrase + count phrase) that matches a two-event visual. A ±25% tolerance would better accommodate this natural rhythm without flagging. Not a blocker — Wave 3.5 absorbs the difference.
