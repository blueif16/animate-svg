# W2b — Audio / Captions (kptest-fenyuhe-six)

## INPUTS READ

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/brief.md` — audience / length band / continuity / narration notes
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/pedagogy.md` — per-cue discovery list + reinforcement plan (§8); §4 acquisition carve-out for math
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/storyboard.md` — 9 visual beats (routine-reprise / split + echo × 3 / aggregator-prompt / recap) + narration beat intent per beat
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/visual-design.md` — per-cue `visualMotionSeconds` budget (the visual side of W3.5 reconcile)
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/_shared/voice.json` — Aoede / `maxClipSeconds` 6.5 / `asr.tokenPattern` `[㐀-鿿]|[A-Za-z']+` / per-cue generation mode / `scriptField: "narration"`
- SKILL: `/Users/tk/Desktop/animation-test/.agents/skills/lesson-audio-captions/SKILL.md` — narration-leakage rule + L2 carve-out + COMPLETE-UTTERANCE rule (post-mortem `522cfff` for the prior run's fragment defect) + ASR risk note + gap authoring (typed timeline HOLD, not baked WAV)
- SKILL: `/Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md` — CuePlan schema (`id` / `narration` / `phrase` / `caption` / optional `gap: { seconds, reason }`) + "never author silence as an empty spoken cue"
- POST-MORTEM (this lesson, for prior-run context): `/Users/tk/Desktop/animation-test/remotion-svg-primitives/out/kptest-fenyuhe-six/_w2b-scratch/w2b-postmortem-proposal.md` — identified the prior run's part-pair fragments + bare recap list as §4-acquisition-carve-out violations; the SKILL was patched to require complete utterances; this run is the clean-room re-run

## OUTPUTS WRITTEN

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/audio-captions.md` (4128 bytes) — lean per-cue table (6 audio cues × 9 columns) + ≤5-line ASR risk note; no per-cue "why this shape" rationale, no leakage audit, no totals in the artifact
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/script-cues.json` (1212 bytes) — canonical CuePlan, 6 cues; 4 carry a `gap: { reason: "learner-response" }` (3 echo + 1 aggregator)

## COMMANDS RUN

- `ls /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-fenyuhe-six/` — confirm inputs on disk
- `cat /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/_shared/voice.json` — read voice config (exit 0)
- `ls .../out/kptest-fenyuhe-six/_w2b-scratch/` — locate postmortem + PRE-W2BFIX artifacts for diagnosis context
- `write` audio-captions.md (exit 0)
- `write` script-cues.json (exit 0)
- `write` this log (exit 0)

## KEY DECISIONS

1. **6 audio cues, not 9.** The storyboard has 9 visual beats; 3 are silent "echo" beats (held split + pointer + recombine tail). Per `cue-plan-author` "never author silence as an empty spoken cue", the echoes are NOT cues — they live in the preceding model cue's typed `gap` (v4 cue-anchored audio: free silence, not baked WAV). Each model cue (split-1-and-5 / split-2-and-4 / split-3-and-3) covers BOTH the split visual beat AND the echo visual beat; the audio cue's window = max(visual, narration) + gap, and the W4 composer runs the visual through the gap. This is a single TTS prosody group per bond (no seam at the split→echo boundary).
2. **Complete utterances everywhere.** Every split line is `六可以分成X和Y` (names the whole being decomposed + the action + both parts); every conserve half is `X和Y合成六` (names both parts + the action + the recombined whole). The prior run's `一和五，分成。` / `一和五，合起来。` fragments are gone (they dropped the whole `六` — a §4 acquisition carve-out violation per the post-mortem `522cfff` SKILL patch).
3. **Recap is whole-framed.** `一和五。二和四。三和三。它们合起来，都是六。` — the bare list is followed by the binding sentence `它们合起来，都是六`, which names the whole the three splits aggregate to. This matches the storyboard's recap intent (`1+5 → 2+4 → 3+3 → 它们合起来都是6`) and passes the §4 "set framed by what binds it" exception. Prior run's bare list (no binding) is fixed.
4. **Digits spelled out in Chinese.** Cue 1's `和5的分与合一样` is written as `和五的分与合一样` (and `分6` → `分六`) so the `phrase` is fully matchable against the `asr.tokenPattern` `[㐀-鿿]|[A-Za-z']+` (digits are not in the pattern; Aoede speaks the digit as the Mandarin word anyway).
5. **Symmetric-dwell extra goes to the gap, not a new cue.** Cue 4 (split-3-and-3) carries a 5s `gap` (vs 4s for the other two model cues) — the 1s extra carries the symmetric hold dwell into the child's retrieval window per pedagogy §8 "extra dwell, not extra cues" / co-equal cue-counts rule.
6. **Co-equal model airtime preserved.** Cues 2 / 3 / 4 are identical in structure (14 CJK chars, 4.2s est, 4-5s gap) — the §8 "co-equal airtime" rule is honored at the audio level; the 3+3 highlight is expressed as the 1s extra gap on cue 4, not as a fourth model.
7. **Cue 1 deliberately single-cue.** Routine-reprise combines title + transfer callback (`和五的分与合一样`) + action (`我们来分六`) into one narration. The storyboard calls this one `announce-topic` beat; bundling matches the `announce-topic` shape. Watch-point in ASR note: if W3a flags a low-confidence match on the 18-char run, mitigation = split (cost: one TTS prosody reset).

## ISSUES

None. All required artifacts written; reconcile math in the 60-90s band; narration ≤ `maxClipSeconds` 6.5 on every cue; visual cue ID coverage is explicit in the table.

## REPORT-BACK

- **Total narration:** 85 CJK tokens / ~25.5s estimated (calibrated 0.30s/char for Aoede Mandarin slow pacing).
- **Per-cue chars / est sec / visual budget / signed delta (est sec − visualMotionSec, est = visual when binding):**
  - routine-reprise: 18 / 5.4s / 3.3s / +2.1s (voice longer than visual — visual-binding cue: the dots enter + hold; voice runs 2.1s into the held state)
  - split-1-and-5: 14 / 4.2s / 10.5s / −6.3s (visual binds; narration 40% of visual)
  - split-2-and-4: 14 / 4.2s / 10.5s / −6.3s
  - split-3-and-3: 14 / 4.2s / 12.5s / −8.3s
  - aggregator-prompt: 8 / 2.4s / 6.5s / −4.1s
  - recap: 17 / 5.1s / 10.0s / −4.9s
- **ASR risk flags + mitigations:** see ASR-risk note in the artifact (no single-char utterances; no in-text ellipsis; recap uses full stops; longest phrase 17 CJK tokens; cue 1 18-token run has a documented watch-point for W3a).
- **Narration-leakage fixes vs storyboard draft:** zero. The storyboard's beat-intent lines (`"6可以分成1和5；1和5合成6"` etc.) are carried verbatim as complete utterances — no fragment, no compressed tail, no dropped whole. (Prior run rewrote them as fragments; reverted here.)
- **Read-aloud confirmation:** every line read aloud as if to a 6-year-old:
  - cue 1: "Six's fen and he. Same as five's fen and he, let's split six." — complete, names the topic + the prior lesson + the action; no fragment, no dropped term. ✓
  - cue 2: "Six can be split into one and five. One and five combine into six." — two complete sentences; the first names the whole (六) being decomposed + the action (分成) + both parts (一和五); the second names both parts + the action (合成) + the recombined whole (六). No dangling verb, no dropped whole. ✓ (rewritten from prior run's fragment `一和五，分成。` + `一和五，合起来。`)
  - cue 3: same shape as cue 2 with 2 and 4. ✓ (rewritten)
  - cue 4: same shape as cue 2 with 3 and 3. ✓ (rewritten; `三和三` homophone repeat is a non-blocker per ASR risk note)
  - cue 5: "Six can be split into what and what?" — complete question, names the whole (六) and asks for the parts. ✓
  - cue 6: "One and five. Two and four. Three and three. They combine, all are six." — the list is bound by `它们合起来，都是六` (they combine, all are six), which names the whole. The closing sentence is the framing per §4 "set framed by what binds it". ✓ (rewritten from prior run's bare list `一和五。二和四。三和三。`)

## PIPELINE FINDINGS

1. **(low) The prior `_logs/w2b-audio-captions.md` KEY DECISION trail in the broken state should be considered when interpreting prior-run artifacts** — its KE #7 treated the part-pair + verb as a complete bond. Future diagnosis subagents should bias toward reading the SKILL's recent edit (the "complete utterance" subsection between L2 carve-out and ASR risk flags) before applying any prior-run patterns.
2. **(low) The visual cue ID set in `visual-design.md` §5 has 9 entries, but the natural CuePlan shape for this lesson is 6** (one per model+echo pair + title + aggregator + recap). The audio-captions.md table maps audio→visual explicitly so the W4 composer can disambiguate. If a future W2b wants a 1:1 visual↔audio mapping, it would need to either (a) split each model into voiced + silent (forbidden by `cue-plan-author` "never author silence as an empty spoken cue") or (b) accept the audio cue's window as covering multiple visual beats and let the W3.5 reconcile own the frame-level mapping. (b) is the current design and is consistent with the v4 cue-anchored audio contract.
3. **(medium) The storyboard's `routine-reprise` beat intent mixes title + transfer-callback + action in one beat** — fine for `announce-topic` per `TEACHING-ACTIONS.md`, but it does push cue 1 to 18 CJK tokens (the longest single breath-group in the lesson). The ASR risk note flags this as a W3a watch-point with a documented split-mitigation. No W2b change required; logging for downstream visibility.
