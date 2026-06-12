# _logs/audio-captions.md — Wave 2b (kptest-compare-more-fewer)

## INPUTS READ
- lesson-data/kptest-compare-more-fewer/visual-design.md (per-cue visualMotionSeconds budget; zones; identity-invariant)
- lesson-data/kptest-compare-more-fewer/storyboard.md (cue spine, teaching actions, replay/echo marks, exposure ledger)
- lesson-data/kptest-compare-more-fewer/pedagogy.md (per-cue discovery + §4 leakage carve-out for the two 比-targets)
- lesson-data/_shared/voice.json (Aoede, scriptField=narration, maxClipSeconds 6.5, gapSeconds 0.4, perCue, bilingual tokenPattern)
- SKILLS: .agents/skills/lesson-audio-captions/SKILL.md ; shared-narration/.agents/skills/cue-plan-author/SKILL.md

## OUTPUTS WRITTEN
- lesson-data/kptest-compare-more-fewer/audio-captions.md (lean per-cue table + ≤5-line ASR note)
- lesson-data/kptest-compare-more-fewer/script-cues.json (canonical CuePlan, 11 cues)

## COMMANDS RUN
- node -e "<schema/punctuation/replay/gap validator>" → exit 0. stdout: "cues: 11 / replay pair more: true / replay pair fewer: true / gaps: echo-more:learner-response4, echo-fewer:learner-response4 / VALID". No phrase punctuation, no ellipsis drones.

## KEY DECISIONS
- Two acquisition targets 五比三多 / 三比五少 are voiced IN FULL (pedagogy §4 carve-out) as complete comparison utterances binding both quantities + direction — never a stranded 多/少.
- §4 leakage held: `match` narrates the ACTION ("向下找一个朋友"), `not-by-size` asks the question — neither pre-says which group is more; the picture delivers the surplus.
- Target leads each model/keystone cue (onset ≤0.5s) so the read-along sweep stays synced; in `fewer-direction` keystone framing (同样的点，倒过来看) sits BETWEEN the two target says, keeping onset early.
- Acquisition model cues say the target ×3 in `。` breath-groups (dodges Aoede comma-list run-on); echo cues = prompt only + typed gap learner-response 4s (mid-band per §8; clear new-relation but in L1 syntax, not a brand-new foreign phoneme → 4s not 5s).
- more-replay / fewer-replay emit IDENTICAL narration/phrase/caption as their model cue → W3a/3.5 reuse the same voiced clip (no new roll).
- All model/keystone/recap cues marked emphasis:true (caption emphasis + composer focus). Captions trimmed to ≤14-char ribbon-friendly lines (full target shown on its model cues).
- All clips ≤ maxClipSeconds 6.5 (longest est = fewer-direction/replay ~5.4s). No total-runtime padding — length emerges from the 4+4 spaced exposures + 2 wait-time gaps.

## ISSUES
- none blocking. Estimated total spoken ≈ 45.6s across 11 cues (+ 8s gaps); real window from W3.5.

## PIPELINE FINDINGS
- visual-design more-direction budget 5.5s but a clean ×3 slow model of a 5-char target is only ~4.5s — the motion (pulse+>+read-along) sets the window, so OK, but the W2a budget for a pure-target model cue slightly over-counts vs. the calibrated say-it-thrice length. Minor; no fix needed this run.
- The echo wait-time band (3–5s) is left to W2b judgment; for an L1-syntax math-comparison target (not a foreign phoneme) 4s reads right, but TEACHING-ACTIONS / pedagogy §8 give no explicit per-target-difficulty mapping for wait-time — a one-line "L1 relation vs new phoneme → 4s vs 5s" hint in the audio-captions skill would make this deterministic instead of judged.
