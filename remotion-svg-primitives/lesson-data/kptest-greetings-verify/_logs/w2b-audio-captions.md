# W2b — Audio / Captions

**Date:** 2026-06-08
**Node:** W2b audio/captions
**Status:** ok

---

## Inputs Read

| File | Path | Purpose |
|---|---|---|
| Skill: lesson-audio-captions | `.agents/skills/lesson-audio-captions/SKILL.md` | Narration authoring rules, targeting rule, ASR risk, caption rules |
| Skill: cue-plan-author | `/Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md` | CuePlan JSON schema, narration≠phrase rule, split guidance |
| Pedagogy | `lesson-data/kptest-greetings-verify/pedagogy.md` | Per-cue discovery, reinforcement reasoning, §4/§8/§9 rules |
| Storyboard | `lesson-data/kptest-greetings-verify/storyboard.md` | Cue IDs, narration beats, required visuals, reinforcement map |
| Visual Design | `lesson-data/kptest-greetings-verify/visual-design.md` | Per-cue visualMotionSeconds (THE BUDGET), visual contract |
| Brief | `lesson-data/kptest-greetings-verify/brief.md` | Lesson context, narration notes, knowledge point |
| Voice config | `lesson-data/_shared/voice.json` | Aoede voice, maxClipSeconds=6.5, gapSeconds=0.4, bilingual ASR |
| Capabilities | `.agents/CAPABILITIES.md` | Motion vocabulary, component APIs |
| Catalog digest | `src/capabilities/catalog-digest.md` | Component inventory verification |
| Teaching actions | `.agents/TEACHING-ACTIONS.md` | Move vocabulary, requires contracts |

## Outputs Written

| Artifact | Path | Size |
|---|---|---|
| Audio-captions | `lesson-data/kptest-greetings-verify/audio-captions.md` | 13,934 bytes |
| Script-cues JSON | `lesson-data/kptest-greetings-verify/script-cues.json` | 1,527 bytes |

## Commands Run

None (no shell commands needed for this node).

## Key Decisions

1. **Recap split into 2 CuePlan rows (recap-1, recap-2).** The full recap narration (~11.5s) exceeds `maxClipSeconds` (6.5s). Split at the natural pause between the greet+intro group and the farewell group. Both halves play within the single 13.0s visual recap cue. Composer must handle two sequential TTS clips.

2. **im-slow-model narration carries 2 slow "I'm" models in separate breath-groups.** "I'm…… Sam。I'm Sam。我是Sam。" — first "I'm" held (~1.2-1.5s) with predictive pause, second "I'm" at natural speed (~0.8s), then brief L1 gloss. Two exposures per pedagogy's reinforcement requirement. Emphasis flag set to `true`.

3. **im-learner-gap uses 4-second learner-response gap.** Per pedagogy §8 acquisition floor (≥3-5s for L2). Gap is baked into WAV at zero TTS cost via `gap: { "seconds": 4, "reason": "learner-response" }`. Total cue = 3.2s narration + 4.0s silence = 7.2s.

4. **L2 target words are NOT ASR risks.** Bilingual ASR + tokenPattern matches both scripts. English words (Hello, Hi, I'm, Sam, Goodbye, Bye-Bye) align with matchScores ≥0.87. No L2 word was stripped or modified for ASR reasons.

5. **No §3 hold table.** Per the deleted mechanism, no post-narration holds are authored. Cue durations emerge from max(narration, visual) + tail at reconcile.

6. **Narration-leakage rule respected with L2 carve-out.** All English target words are voiced because voicing them IS the teaching act (pedagogy §4/§9). Chinese frames the moment; English delivers the target. No narration announces what the picture should reveal.

## Issues

None.

## Pipeline Findings

1. **Recap split for maxClipSeconds** — Standard split mechanism, but the composer needs to handle two sequential TTS clips within one visual cue window. Consider whether `maxClipSeconds` should be adjustable per-cue or whether recap should be authored as two visual sub-cues.

2. **topic-intro narration/visual budget mismatch** — Card visual motion is 2.5s (write-on animation), but narration is 4.8s. The card holds for reading, so reconcile uses max(narration, visual) + tail. The visual-design budget could separate "animation" from "reading hold" for more accurate drift tracking.

3. **"Bye-Bye" hyphen tokenization** — The bilingual ASR tokenPattern `[A-Za-z']+` does not include hyphens. "Bye-Bye" may tokenize as "Bye" + "Bye" (two tokens). Phrase field uses "Bye-Bye" as written; W3a should verify token count matches ASR output. If misaligned, adjust phrase to "Bye Bye" (no hyphen).
