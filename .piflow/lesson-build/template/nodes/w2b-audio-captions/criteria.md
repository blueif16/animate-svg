# w2b-audio-captions — measures (the optimization runway)

Built per `piflow-overlord` `references/measurement-runway.md` (the pre-flight) +
`references/building-measures.md` (the method). This is the JUDGE-FACING artifact — checklist + rubric +
gold exemplar for the soft measure, plus the hard-measure reuse/wiring summary. **Never inject this file, or
any part of it, into w2b-audio-captions' own runtime prompt** (`prompt.md`) — seeing the bar teaches-to-the-
test and voids the clean-room signal the loop depends on.

## 0 — Leverage (Part C step 2, the seed of every soft criterion)

w2b writes the narration that gets **frozen** after W3a (real TTS + ASR) and the cue text that **sets the
lesson's ONE unit of coordination** (the cue window). A wrong-but-schema-valid output is expensive precisely
because it is invisible to every check that only asks "did it write non-empty JSON": **if w2b's narration is
schema-valid but pedagogically leaky, flat/robotic, or ASR-fragile, the frozen voice track locks a wrong or
lifeless teaching moment into every downstream wave (real TTS spend, W3.5 reconcile, the composer, the render)
before a human ever hears it.** That is the leverage every soft criterion below keys on.

---

## PART A — HARD MEASURES (the floor)

### Reused (zero new code — Part D "what already exists")
- **`checks.post`** (node.json, already present): `non-empty` on both artifacts + `json-parses` on
  `script-cues.json` — the existence/parse floor, free.
- **Trace detectors + digest anomalies** (automatic, via the substrate `runSubstrateMeasure` — no per-node
  wiring needed): `thinkingStalls`, `toolLoops`, `tokenWaste`, `truncatedLines` from `analyzeTraceFile`, plus
  this node's `AnomalyKind`s (`failed`/`truncated`/`retries`/`cost-spike`/…) from `projectRunDigest`.
- **`deriveStatus`** (automatic): a clean exit missing `audio-captions.md` or `script-cues.json` on disk
  downgrades to `blocked`, never `ok` — the existence floor is enforced by the driver, not the model's word.
- **`piflowctl trace <run> w2b-audio-captions`** (agent-facing, no new code): did it actually READ
  `visual-design.md`/`storyboard.md`/`pedagogy.md` (the inject set) before writing? Blind-spot rollup catches a
  narration written without reading the budget it's supposed to target.

### Added — one reused check-kind, zero new code (`node.json` `checks.post`)
- **`regex-absent` on `script-cues.json`, param `\.\.\.|…`** (BLOCKING, `policy.fail:"block"`). The held-vowel
  DRONE precursor (`lesson-audio-captions`/`cue-plan-author` skills: an in-text ellipsis renders as a ~5s
  drone downstream) — this is a zero-legitimate-exception hard defect, so it blocks the live node, not just the
  offline substrate report. Pure reuse of the existing `CHECK_KINDS.regex-absent` predicate.

### Thin wrapper (Part D "propose, config not code") — `optimize.measure` → `scripts/measure.mjs`
The per-cue / cross-field invariants below need real iteration over the `cues[]` array and a second-file
cross-reference — no `CHECK_KINDS` predicate operates on more than one fixed path, so this is exactly the
"thin op[] wrapper" class Part D sanctions (config, not new SDK code). Wired as `node.json`
`optimize.measure: [{ id: "w2b-content-invariants", run: {...}, writes: [...] }]` — read **only** by the
out-of-band `runSubstrateMeasure` stage, never by the live node run.

| signal | what it catches | source rule |
|---|---|---|
| `emptyNarrationCount` | a cue with blank `narration` (throws downstream) | cue-plan-author |
| `captionMismatchCount` | `caption !== narration` (this product requires VERBATIM, stricter than the generic skill) | lesson-audio-captions "Captions" |
| `phrasePunctuationViolations` | residual ，。！？、 in `phrase` (defeats the ASR aligner's token match) | cue-plan-author "narration ≠ phrase rule" |
| `ellipsisCount` | per-cue drone precursor (same defect as the blocking check above, cue-scoped for triage) | lesson-audio-captions |
| `budgetFitWorstAbsPct` / `budgetFitWorstCue` | the node's CORE targeting rule: per-cue narration length (CJK-chars×0.30s + embedded-Latin-words×0.55s) vs `visual-design.md`'s declared `visualMotionSeconds`, worst \|Δ\| over ±20% | lesson-audio-captions "targeting rule" |

**Wiring.** The `run` op writes `<RUN>/optimize/substrate/w2b-audio-captions.measure.json`; its numeric
top-level leaves (`emptyNarrationCount`, `captionMismatchCount`, `phrasePunctuationViolations`,
`ellipsisCount`, `budgetFitCuesChecked`, `budgetFitWorstAbsPct`) auto-fold into the substrate report's
`graded` map (`foldNumericLeaves`, `measure.ts`) — this is the number `piflow-triage` cites as its hard-front
"detector + evidence line." `budgetFitWorstCue`/`lessonId`/`skipped` stay string/array fields in the raw
report JSON for a human/triage glance, not auto-graded.

**A real SDK gap this surfaced (flag, don't route around silently):** `runSubstrateMeasure`'s `ResolveCtx`
(`measure.ts:126`) never supplies `args`, so `{{arg.lessonId}}` throws `MissingArgError` inside an
`optimize.measure` op — there is no token to name "which lesson is this run." The script works around it by
reading `<RUN>/.pi/run.json`'s already-recorded artifact paths for this node id and regex-extracting
`lesson-data/<id>/` (every `--lessonId`-parameterized node in this workflow has the same gap; this is a
**consolidation item**, not a per-node fix — see the report back to the orchestrator).

**Validity (test-the-measure, done at authoring time, not after a wasted loop round):**
- Ran against the real, shipped `kp1-hello-greetings` lesson (workspace-relative fixture): `cueCount:5,
  emptyNarrationCount:0, captionMismatchCount:0, phrasePunctuationViolations:0, ellipsisCount:0,
  budgetFitWorstAbsPct:24.3` on cue `recap`. This is a genuine, non-hallucinated finding: the node's own
  `audio-captions.md` self-audit reports "worst \|Δ\| = 10.0%" using a CJK-char-only estimate, but `recap`'s
  narration embeds three Latin words ("Hello"/"I'm"/"Goodbye") whose spoken time the self-audit's own math
  omits — accounting for them (per the skill's own calibration: "count them on top of the Chinese-char
  estimate") pushes the true estimate to +24.3%, over the stated ±20% bar. **This measure FIRES on a
  real artifact its own self-report called clean** — the calibration is a heuristic (0.55s/Latin-word is a
  mid-point estimate, not independently verified against real TTS timing), so this is reported as a
  *candidate* finding for triage to weigh, not an auto-fail; it is exactly why the measure earns its keep.
- Ran against a deliberately corrupted 3-cue fixture (empty narration, a caption that drops the ellipsis'd
  clause, a punctuated `phrase`, an in-text `……`, and a cue with no visual-motion match): every signal fired
  correctly — `emptyNarrationCount:1, captionMismatchCount:1, phrasePunctuationViolations:1, ellipsisCount:1,
  budgetFitWorstAbsPct:100` (the empty-narration cue, correctly the worst offender). **Confirms discrimination
  in both directions** (near-zero on a shipped artifact, correctly non-zero on an injected defect).

### Grounding
Every hard signal above keys on OBSERVABLE artifact bytes (`script-cues.json` field values, `visual-design.md`
prose the model itself must have read per `readScope`) — none asserts unobservable intent.

---

## PART B — SOFT MEASURES (the ceiling)

### Checklist (coverage — 10 dims a best-in-world w2b output addresses)
1. **Narration-leakage discipline** (pedagogy §4) — narrator names the moment, the picture delivers the
   answer/count, except the deliberate L2-target carve-out.
2. **Complete-utterance discipline** — every relation-bearing line names every term the relation binds; no
   stranded fragment.
3. **Register / warmth** — a teacher speaking TO one child, not a label being read; no stamped template.
4. **Reinforcement / replay realized** — an acquisition arc (model→repeat→gap→echo→recap) sized to the real
   teaching need, per pedagogy's floors — never padded, never starved.
5. **ASR-safety** — no bare unmitigated single-char utterances, no ellipsis/drone precursors (hard-floor
   overlaps this — the soft judge reads the MITIGATION reasoning, the hard check reads the bytes).
6. **Budget-fit** — every cue's narration lands inside ±20% of its visual motion budget (hard-floor computes
   the number; the soft judge reads whether a documented, reasoned exception is honest when one is taken).
7. **Syncable-target placement** — an L2/acquisition target's spoken onset sits near the cue's head.
8. **Caption fidelity** — the caption is the verbatim spoken line (hard-floor checks equality; soft judge
   catches a caption that IS equal but was clearly reverse-engineered to dodge the check rather than written
   as a real spoken line).
9. **Gap/silence authored correctly** — intentional pauses are typed `gap`s, never text padding.
10. **Cue-plan mechanical hygiene** — `narration`/`phrase`/`caption` each serve their own audience (TTS / ASR /
    viewer), not one field copy-pasted into the other two by default.

Dims 5/6/8/9 carry a hard-floor twin (Part A) — the graded rubric below does NOT re-score what code already
scores; it scores the JUDGMENT calls the floor cannot reach (dims 1/2/3/4/7 below).

### Criteria / rubric

**Required** (miss one ⇒ not good, revise):

| # | Criterion | PASS looks like (quotable) | FAIL signature |
|---|---|---|---|
| R1 | **Leakage discipline** — the narrator names the ACT/MOMENT, never the outcome the picture is about to reveal, except a deliberate L2 target | Cite the cue's Chinese narration and confirm the specific count/word/answer the picture delivers does NOT appear in it (or, for an L2 cue, confirm the target word IS the deliberate carve-out per pedagogy §9) | The Chinese narration states the numeric/verbal answer the picture was supposed to reveal — the "aha" is announced, not discovered |
| R2 | **No stranded relation** — a line naming a whole↔parts / before↔after / prompt↔reply relation states ALL the terms it binds, as one grammatical sentence | Quote the line and name every term the relation binds; confirm none is missing | A bare term list with the binding verb dropped (e.g. the parts named, the whole they sum to never spoken) |
| R3 | **Syncable-target placement** (when a cue carries an L2/acquisition target) | Quote the narration and confirm the target sits within the first ~0.5s-equivalent (target-led, framing/gloss after) | A carrier clause runs several seconds before a tail-buried target |

**Aspirational** (the near-unachievable greatness marks — headroom, do not award by default):

| # | Criterion | PASS looks like (quotable) | FAIL signature |
|---|---|---|---|
| A1 | **Register / no stamped template** — each cue reads as ONE particular moment the teacher is having with THIS child about THIS content right now, not a generic frame that could paste into any lesson; no connective/sentence-frame repeats verbatim across ≥2 cues | Quote two cues and show their framing/connective differ even though the pedagogy repeats | The same sentence template (only the noun swapped) appears in 2+ cues, or a line reads as a label rather than speech |
| A2 | **Reinforcement pacing earns its time** — where pedagogy marks reinforcement/acquisition, the narration's move sequence adds REAL teaching content (a fresh framing, a genuine echo, a real wait-time), not length for its own sake | Cite the SPECIFIC new content each additional move contributes (not just "it's longer") | A reinforcement cue restates the same content merely padded with filler words to fill time |

**Red flag** (negative criterion, Autorubric — counterbalances rubric sycophancy):
- **RF1 — Compressed-for-budget relation.** The narration drops a term a stated pedagogy/storyboard relation
  binds, specifically to shorten the line toward the budget-fit number. This is FAILING even if budget-fit
  (hard floor) then passes — a criterion this rubric exists to catch precisely because the floor cannot.

**Aggregation.** All Required must PASS for the output to be "good." Aspirational marks are the
discriminators that separate good from great — a good run is expected to miss at least one (see the
Calibration note below); do not treat a clean Required sweep as license to call the output done.

### Gold exemplar — "颜色 (colors)" — an OFF-DISTRIBUTION acquisition lesson

Authored fresh (not a copy of any live `lesson-data/*` dir) so the judge calibrates on the bar, not a
pattern-match. A 5-cue spoken-routine lesson teaching the color word "红色" (red) via a model→echo arc, then
recombining with "蓝色" (blue) at recap — the same acquisition shape as `kp1-hello-greetings` but a fresh
topic, quote-mapped against every criterion above.

```json
{
  "lessonId": "gold-colors-red-blue",
  "cues": [
    { "id": "intro",       "narration": "今天，我们要认识一种新颜色。",
      "phrase": "今天我们要认识一种新颜色", "caption": "今天，我们要认识一种新颜色。" },
    { "id": "notice",      "narration": "你看，它是什么颜色呀？",
      "phrase": "你看它是什么颜色呀", "caption": "你看，它是什么颜色呀？" },
    { "id": "model-red",   "narration": "红色！苹果是红色。",
      "phrase": "红色苹果是红色", "caption": "红色！苹果是红色。", "emphasis": true },
    { "id": "echo-red",    "narration": "跟我说：红色。",
      "phrase": "跟我说红色", "caption": "跟我说：红色。",
      "gap": { "seconds": 4, "reason": "learner-response" } },
    { "id": "recap",       "narration": "苹果是红色，天空是蓝色——颜色的世界真奇妙！",
      "phrase": "苹果是红色天空是蓝色颜色的世界真奇妙", "caption": "苹果是红色，天空是蓝色——颜色的世界真奇妙！" }
  ]
}
```

**Quote-mapped against the rubric:**
- **R1 (leakage)** — `notice` asks "它是什么颜色呀" (what color is it?) and does NOT say "红色" — the picture
  (a red apple appearing) delivers the color; the word is withheld until `model-red`. PASS.
- **R2 (no stranded relation)** — `recap` states BOTH terms the comparison binds — "苹果是红色" AND "天空是
  蓝色" — never the bare pair "红色，蓝色" with the copula dropped. PASS.
- **R3 (syncable-target)** — `model-red`'s narration OPENS on "红色" (the target, first ~1 char in), the
  carrier "苹果是红色" follows — target-led, not buried after a clause. PASS.
- **A1 (register / no stamped template)** — `intro` uses an inviting frame ("今天，我们要…"), `notice` shifts
  to a direct guiding question ("你看，…呀？"), `model-red` shifts again to an exclamatory model
  ("红色！…"), `recap` closes on a genuine-affect line ("…真奇妙！") — four DIFFERENT frames across four
  cues, not one template reused. **Not fully awarded**: `model-red`'s second sentence ("苹果是红色。") is
  correct and target-led but reads as flatly declarative rather than delighted — the near-unachievable top
  tier would want an audible spark bound to the reveal itself, and this line is merely correct. **Calibration
  note: A1 is the mark this gold exemplar is EXPECTED to miss** — even an authored-to-be-good sample stops at
  "correct and varied," not "every single beat delighted."
  A separate reason `model-red` is not asked to score higher: it is the shortest, highest-density cue in the
  set (the target-model beat), and packing register flourish into an already-dense 2-word teaching moment
  would risk crowding the one thing that line must do cleanly.
- **A2 (reinforcement earns its time)** — the arc `model-red → echo-red` is not "the same line twice": `model`
  gives the word IN context ("苹果是红色"), `echo` is a bare invitation with a real ≥3s silent wait-time
  (`gap.seconds:4`) for the child's OWN utterance — two different moves, each with its own content, not one
  cue's length padded. PASS.
- **RF1 (red flag)** — no term was dropped to hit a budget; not triggered.

### Part E anti-Goodhart self-check (run once per criterion)
| Criterion | Gameable? | System-agnostic? | Observable+quotable? | One construct? | Aspirational headroom? |
|---|---|---|---|---|---|
| R1 leakage | No — keyed on the specific outcome term's ABSENCE from narration + its presence in the visual, a relation not a presence | Yes — "did the picture or the voice give the answer" reads to any practitioner | Yes — quote the narration, name the withheld term | Yes | Required, not aspirational |
| R2 no stranded relation | No — keyed on ALL bound terms present, can't be farmed by adding unrelated words | Yes | Yes — quote + name every term | Yes | Required |
| R3 syncable-target | No — keyed on WORD ORDER/position, not mere presence of the target word | Yes | Yes — quote + position | Yes | Required |
| A1 register/no-stamp | Partially guardable — a model could insert one fixed "guiding question" token everywhere; the CROSS-CUE non-repetition half closes this (identical frames across cues fail outright) | Yes — "one warm moment vs a formula" reads to any teacher | Yes — quote 2 cues, contrast | Yes (variety, not "sounds nice") | Yes — top mark reserved, this gold sample itself misses it |
| A2 reinforcement pacing | No — keyed on a SPECIFIC new content contribution per move, explicitly rejecting "just longer" | Yes | Yes — cite the added content per move | Yes | Yes — the exemplar shows it can be earned, but only when content genuinely differs |
| RF1 compressed relation | N/A (negative criterion by design) | Yes | Yes — quote the dropped term | Yes | N/A |

**Whole-set check:** would optimizing every row to PASS produce a genuinely better lesson video, or a hollow
one? Yes with conviction — every Required row keys on a relation a viewer/listener would actually notice
missing (a leaked answer, a dropped term, a mistimed reveal), and the Aspirational pair keys on variety +
earned pacing, neither farmable by padding, keyword-stuffing, or reformatting. No row rewards "valid JSON" or
"followed the schema" — that is the hard floor's job (Part A), deliberately excluded here.

---

## Runway pre-flight (measurement-runway.md — confirm before any optimize loop touches this node)
- [x] **COVERAGE** — both a hard set (Part A) and a soft rubric+checklist+gold (Part B) exist.
- [x] **WIRING** — hard: `checks.post` (blocking, live) + `optimize.measure` (substrate `graded`, offline);
  soft: this file is the criteria fixture `piflow-triage`'s judge turn reads (per the shipped convention,
  `.piflow/lesson-build/template/nodes/w2b-audio-captions/criteria.md`).
- [x] **VALIDITY** — the thin wrapper was test-fired against a real shipped lesson (fired a genuine, non-zero
  finding) AND a deliberately corrupted fixture (all four per-cue signals discriminated correctly) — see Part
  A "Validity" above. The soft rubric was self-checked against Part E for every row.
- [x] **GROUNDING** — every hard signal reads artifact bytes; every soft criterion is anchored to quotable
  narration text, never an adjective or unstated intent.
