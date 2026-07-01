# _logs/w2b-audio-captions.md

## INPUTS READ
- /Users/tk/Desktop/animation-test/.agents/skills/lesson-audio-captions/SKILL.md (read FIRST, followed literally)
- /Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md → EPERM (out of this node's read scope) — NOT read; proceeded from the lesson-audio-captions SKILL's stated script-cues.json schema (id, narration, phrase, caption, + optional emphasis/gap/asrRisk). See PIPELINE FINDINGS.
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/visual-design.md (THE BUDGET: per-cue visualMotionSeconds + §7 count-match + leakage context)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/storyboard.md (cue IDs, narration-beat INTENT, reinforcement routing)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/pedagogy.md (per-cue discoveries + §7 + §8 insight + §6 reserved pulse)
- /Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/_shared/voice.json → EPERM (out of read scope); calibration taken from SKILL text (Aoede 0.30 s/char).

## OUTPUTS WRITTEN
- .../lesson-data/kptest-count-to-two/audio-captions.md (3066 B)
- .../lesson-data/kptest-count-to-two/script-cues.json (1077 B)

## COMMANDS RUN
none (file ops via write only; no bash, mkdir, ls, touch)

## KEY DECISIONS
- Insight lesson, NOT acquisition (pedagogy §8/§9 carve-out): no choral/echo/wait-time, no learner-response `gap`, no acquisition-floor sizing. Wrote three cues (announce-topic + two teaching cues). cue-2's §6 reserved recall pulse is absorbed INTO cue-2's narration as the re-voiced total (per storyboard "no second closing retrieval cue") — single clip.
- §7 count-match: cue-1 narration voices 一/二 at each apple's tag-attaching, in turn. Designed so the count word is head of its own breath-group after a `——` boundary (syncable target near cue-internal onset, not tail-buried): `一个苹果来了——一；再来一个苹果——二。`. Apple entrance animates during the carrier framing; tag attaches precisely at the count word after the em-dash.
- Leakage (§4): cue-2 question `一共有几个呢？` sets up WITHOUT pre-saying the total; the picture delivers the consolidation in the question→answer caesura; the recall `一共二个呀` re-voices the total naming the whole (the allowed teaching act, not leakage). cue-1 names the ARRIVAL action + count word, never the group count.
- Register: warm direct-address (你看 / 我们一起 / 呀 / 吧), a guiding question in cue-2 (law #2), varied connectives per beat (law #4, no stamp), short-concrete-positive particles (law #5).
- Completeness: every line is a full grammatical utterance naming every term its relation binds (cue-2 names the conserved whole `二个` + framing `一共`). No stranded token, no dangling verb.
- Kept `二个` (not the colloquial `两个`) to preserve §7 count-match with the count word / tag "2", consistent with pedagogy's stated "re-voice the total 二 naming the whole."
- ASR: bare count words kept (§7 requires) with `——`/`；`/`。` token boundaries as mitigation; low-risk (clean count words, not homophone-hazard); documented as reasoned ignore. No `……` (drone rule).

## ISSUES
- cue-2 timing tension (flagged for W3.5 reconcile, not blocking): the spoken cue-2 clip is ONE continuous read (~5.1s); the picture's consolidation reveal + recall pulse sit in the narration's question→answer caesura (TTS sentence-final pause, not a guaranteed 2.5s hold). The narration can only target cue length; the TRUE cue window is W3.5 reconcile (max(narration+gap, motion)+tail). If the reveal needs more silence than the natural caesura, W3.5 may add a free-silence `tail` (the cue window, not the narration length, stretches) — narration itself stays frozen at this clip. No re-record. (Consistent with the v4 "audio frozen after W3a" rule.)
- Could not read cue-plan-author SKILL (EPERM) nor voice.json (EPERM) — both outside this node's declared read scope. Proceeded from the lesson-audio-captions SKILL's own stated schema and calibration. No guesses about primitive usage were made (not this node's job).

## PIPELINE FINDINGS (workflow backlog — improve THIS node)
- The W2b prompt names the cue-plan-author SKILL as required (`/Users/tk/Desktop/shared-narration/.agents/skills/cue-plan-author/SKILL.md`), but that path is NOT in this node's DRIVER-READ-SCOPE (lesson-data/..., out/..., .agents/...) — it lives under a sibling repo and triggers EPERM. Either (a) add shared-narration/.agents to the W2b read scope, or (b) inline the canonical CuePlan JSON schema into the lesson-audio-captions SKILL so W2b is self-sufficient. Currently W2b depends on a SKILL it cannot open.
- The lesson-audio-captions SKILL references `lesson-data/_shared/voice.json` (for tokenPattern / voice config) but that file is outside the W2b read scope for THIS lesson's node. The voice config the W2b node needs (rate, voice id, tokenPattern) should be either injected or readable; today W2b relies on the SKILL's hard-coded "0.30 s/char Aoede" text. Fine for now, but brittle if a lesson uses a non-Aoede voice.
- The cue-2 "one clip, inner reveal-then-recall" pattern has no first-class mechanism in the SKILL for an insight cue (the `gap` field is described for echo/learner-response/animation-hold, but a gap is silence and cannot carry the trailing re-voice). The SKILL's "split into sub-beats" guidance is framed for acquisition; for an insight cue whose recall is absorbed into one cue, the canonical contract is "one narration clip, reveal timed to the natural caesura, real window = W3.5." Worth a one-line addition to the lesson-audio-captions SKILL clarifying the insight-cue-with-inner-recall pattern so W2b doesn't second-guess splitting.
