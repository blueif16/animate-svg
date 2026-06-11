# W2b audio/captions — post-mortem proposal (PENDING Gate-1 approval)

_Produced by a DIAGNOSIS subagent on 2026-06-11 (per `hermes-skill-system/references/node-validation-loop.md`). APPLIED + committed 2026-06-11 (Gate 1 approved; de-hardcoded per user review, read-aloud confirmation nit folded in), skillsys `<pending>`. Next: M3 re-run → independent judge → Gate 2._

## Verdict: FAIL (vs `.agents/skill-system-criteria.md` §"W2b audio/captions")

Every content cue is the broken-fragment pattern (whole/result dropped):
- `一和五，分成。` (×4 split cues) — whole `六` dropped, verb `分成` dangling. Should be `六可以分成一和五`.
- `一和五，合起来。` (×3 conserve cues) — conserved result `六` dropped. Should be `一和五合起来是六`.
- recap `一和五。二和四。三和三。` — bare token list, no whole. Should be `六可以分成一和五、二和四、三和三`.

Captions mirror the broken narration. (Also: cue 8 `是三和三。` is a stale reveal-answer beat the new spine dropped — auto-resolves on the new storyboard, not a W2b skill issue.)

**Exact flawed decision:** `_logs/w2b-audio-captions.md` KEY DECISION #7 — treated the part-pair `一和五` + verb `分成` as a complete bond ("names the action + result"); #2 debated `合起来` vs `合` but never noticed the whole `六` was absent; #3 authored the bare recap list. The node had READ the now-fixed complete-utterance upstream and fragmented anyway — the SKILL had no rule to stop it.

## Root cause (in the skill)

Owner = `.agents/skills/lesson-audio-captions/SKILL.md`. Its leakage carve-out only PERMITS naming an acquisition target; it never REQUIRES the voiced LINE to be a complete grammatical utterance. Fine for a lone word ("Hello"); for a RELATION target (a part-whole bond) it let parts-only fragments through. (`cue-plan-author` correctly stays schema-only — not its place.) The W2b-side twin of W0 `a3b38fe` + W1 `893e490`.

## Proposed fix — 2 surgical edits to `lesson-audio-captions/SKILL.md`

### Edit 1 — insert a new subsection between the L2 carve-out and `## ASR risk flags`
`old_string`:
```
 This is the natural shape; do not Chinese-only it.

## ASR risk flags
```
`new_string`:
```
 This is the natural shape; do not Chinese-only it.

## Every narration line is a complete, grammatical utterance

A narration line is one whole sentence a fluent speaker of that language would actually say aloud — correct word order, and the whole subject / object / result all present. Naming the target is necessary but NOT sufficient: the LINE must be complete, not a stranded token with a dangling verb.

This bites hardest when the teaching target is a RELATION (a part–whole bond, a transformation, a comparison), not a lone word. Voice the COMPLETE relation, in both directions, naming the whole it decomposes AND the result of recombining it — never the parts alone:

- Decompose: name the whole being split. `六可以分成一和五。` ✅  — not `一和五，分成。` ❌ (the whole 六 dropped, 分成 left dangling).
- Recombine / conserve: name the recombined whole. `一和五合起来是六。` ✅  — not `一和五，合起来。` ❌ (the conserved result dropped).
- Retrieve / recap: each item is a full utterance (or the set framed by its whole). `六可以分成一和五、二和四、三和三。` ✅  — not the bare list `一和五。二和四。三和三。` ❌.

The lone-word carve-out above is the special case where the target IS the whole utterance ("Hello"); a relation is not — speaking its parts without its whole is the broken-fragment defect, the same class as a leak in the opposite direction. If pedagogy/storyboard already state the bond as a complete utterance, carry it verbatim; never compress it to the parts to save characters.

**Read-aloud self-check (every cue, before you finalize):** read each `narration` line out loud as if you were the teacher. If it is not a sentence a person would actually say — a fragment, a dangling verb, a missing whole/result, scrambled order — it is broken; rewrite it complete. A line that only passes because the picture "fills in" the missing whole still fails: the spoken line itself must stand.

## ASR risk flags
```

### Edit 2 — add a read-aloud confirmation to Report-back
`old_string`:
```
- Any narration-leakage fixes you made vs the storyboard draft.
```
`new_string`:
```
- Any narration-leakage fixes you made vs the storyboard draft.
- Read-aloud confirmation: one line stating you read every cue's narration aloud and each is a complete, grammatical utterance (whole + parts + result present for any relation/bond beat) — naming any line you rewrote from a fragment to a complete sentence.
```

## Proposed commit message
`skillsys(lesson-audio-captions): every narration line is a complete grammatical utterance (whole + parts + result), + read-aloud self-check` — body: WHY (carve-out only permits naming a target, never requires a complete line) / LESSON (kptest-fenyuhe-six W2b: `一和五，分成。` fragments + bare recap list; fixture red flag "missing whole/result"; W2b twin of `a3b38fe`/`893e490`) / VERIFY (clean-room M3 W2b re-run on the fixed spine + independent judge: complete utterances, whole-framed recap, read-aloud confirmation in report-back; generalizes to any language).

## Proposed diagnostics-log line (fill sha on apply)
`- 2026-06-11 — lesson-audio-captions — EVERY narration line is a COMPLETE grammatical utterance, never a parts-only fragment: a relation/bond/retrieval beat voices the whole it decomposes AND the result of recombining it, both directions (六可以分成一和五 / 一和五合起来是六), never the stranded parts (一和五，分成。); lone-word carve-out is the special case where the target IS the whole utterance. + per-cue READ-ALOUD self-check + report-back line. (skillsys \`<pending>\`) — kptest-fenyuhe-six W2b: fragments dropping 六 + bare recap list, captions mirroring; fixture "missing whole/result". W2b twin of W0 a3b38fe + W1 893e490.`

## Latent-backstop note
Mostly a backstop (the fixed pedagogy/storyboard already supply complete-utterance intent, so a faithful re-run should produce complete lines) with a residual ACTIVE effect on the **recap** (steers the bare list → a whole-framed retrieval) and the report-back. Strongest signal the SKILL itself improved = the re-run cites the new rule back (as W1 did) + a whole-framed recap. Validate honestly as a backstop.
