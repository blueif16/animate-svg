<!-- SOFT MEASURE for the `w6-verification` node (the TERMINAL verify node — writes `verification.md`).
     JUDGE-FACING ONLY. Read verbatim by the triage judge (`buildJudgePrompt`) and the fix gate as the shared
     quality bar; NEVER injected into w6-verification's own runtime prompt (that teaches-to-the-test and
     voids the clean-room signal the loop depends on). Authored to the measurement-runway method
     (piflow-overlord/references/building-measures.md): a CHECKLIST (coverage) + a tiered RUBRIC (graded) +
     an annotated off-distribution GOLD. Pairs with the HARD floor in `optimize.measure`
     (bbox-overlay-produced · cue-coverage · gate-citations) + the reused substrate detectors; this file
     judges only what those deterministic gates CANNOT — whether the VERDICT itself is trustworthy. -->

# w6-verification — the verdict's quality bar (is it TRUE, not just present)

## What this node is, and its LEVERAGE on the end product
`w6-verification` is the LAST node in the pipeline (`phase: verify`, depending only on `w5-render`). Per the
one-node-one-job law, it creates NOTHING load-bearing — it reads the rendered MP4's contact sheet + bbox
overlays + measured-frame stills + pedagogy/audio artifacts and writes `verification.md`: a per-cue pedagogy
verdict, the sound/layout gate results, and a punch list mapped to the owning wave. Nothing downstream reads
its output programmatically; its entire value is a human (or a re-run decision) trusting the verdict.

**LEVERAGE (one sentence).** *Because w6 is the ONLY checkpoint left before delivery, a verdict that
rubber-stamps a proxy read, silently accepts a real defect, or misroutes a fix either ships a broken lesson
as "done" or wastes a re-render on a phantom — and there is no downstream node left to catch either mistake.*

**This is NOT hypothetical — it happened.** `kptest-fenyuhe-six` ran **W6-GREEN** (every gate passed, the
report cited real evidence), and the next session's post-mortem (commit `f24fe86`) recorded: **"the rendered
VIDEO QUALITY is bad (user's eye)."** The report itself was honest and evidence-cited — it explicitly said
*"the model reviewing this node cannot view PNGs… reconstructed from the contact.json legend… measured-frames
PNGs, bbox-manifest, audio-gate…"* — yet the actual watched video still read as bad to a sighted human. This
is the anchor for every criterion below: **a well-documented proxy review is not the same claim as a real
visual/aesthetic one, and the verdict must never blur the two.**

The judge is BLIND to the reviewer's reasoning process and reads this bar together with the run's hard
measure report (cue-coverage · gate-citations · bbox-overlay-produced). A clean hard report is NOT evidence
of a trustworthy verdict; cite BOTH fronts. Cite a quoted line/number/cue for every mark — **no quote ⇒ no
PASS.**

---

## THE CHECKLIST — coverage (did the verification engage this dimension AT ALL?)
Not grading — an omission scan. A dimension the report silently skips is the cheapest, most common defect.

1. **Per-cue pedagogy re-audit** — every cue gets an independent taught/not-taught verdict against
   `pedagogy.md`'s discoveries, not a single "the arc teaches overall" gloss.
2. **Every non-clean bbox-manifest signal is addressed** — a failed gate, a measured collision, a caption
   intrusion — fixed, or waived in writing with the specific quoted evidence.
3. **The verdict is honest about its OWN evidentiary basis** — real visual inspection vs. a documented proxy
   substitute — never a confident visual claim built silently on JSON alone.
4. **Text-vs-audio check walked per cue** (on-screen strings ⊆ spoken phrase) and the learner-response gap
   (if any) holds a legible affordance.
5. **Sound checks pushed as far as evidence allows** (melody-under-narration, 3-point duck, LUFS, SFX
   discipline) — a qualitative check that can't be verified is flagged advisory, never silently dropped.
6. **The punch list routes each defect to its correct owning wave** — a fix nobody can act on is worse than
   no punch list.
7. **A KNOWN gate false-positive family is correctly distinguished from a genuinely new defect**, in either
   direction — neither blindly failed nor used to wave away something real.
8. **Verdict severity matches the worst cited evidence** — no softening a real content defect, no inflating
   a calibration quirk.
9. **The report is a lean spec** — tables over prose, cited by id, no restatement of the skill or upstream
   docs (the prompt's own lean-artifact law).

---

## THE RUBRIC — the graded bar (one construct per row · PASS = quotable evidence · a failure signature)

**Aggregation.** ALL **Required** rows must PASS — R1–R5 — miss one and the verdict is not trustworthy yet,
revise. **Aspirational** rows — A1–A3 — are the discriminators that separate a technically-complete report
from one a senior reviewer would actually rely on; they sit ABOVE what a strong real run reaches, so there is
always headroom.

### Required — the floor of a TRUSTWORTHY verdict

| # | Criterion (one construct) | PASS = quotable observable evidence | Failure signature |
|---|---|---|---|
| R1 | **The verdict's confidence matches the DEPTH its evidence can actually support — it never extends proxy-derived certainty into a dimension only a real look could settle.** (Relation between claim and evidence-kind, not presence of citations.) | for any claim resting on structural/numeric proxies (bbox coords, contact.json timing, LUFS numbers, text-match), the report either (a) names the claim as proxy-derived and explains why the proxy is sufficient for THAT specific question, or (b) confines its confident language to what the proxy genuinely settles (layout/timing/text-audio/loudness) and does not silently extend the same confidence to a pure aesthetic/motion-feel/"does this look good" judgment it never actually made. Quote the proxy-basis statement and the claim it supports. | a verdict asserts "the arc teaches well" / "the layout reads cleanly" / "the motion feels good" as a flat conclusion with zero acknowledgment that the reviewer could not view the images — the exact `kptest-fenyuhe-six` shape (W6-GREEN, evidence-cited, still called bad by a sighted human). |
| R2 | **Every non-clean bbox-manifest signal is resolved OR waived in writing with the exact failing row quoted.** (Relation: signal → an addressed row, not a blanket mention.) | for each `gatesFailed[]` entry / nonzero `measuredCollisionCount` / nonzero `captionIntrusionCount`, the report either maps it to a fix + owning wave, or writes a `SKIP:`/justification quoting the element id, frame, and measured value — e.g. *"contrast (bond-glyph, f640) 1.37 WARN — fade-in entrance artifact… held-fully-visible state (f660–770) yields a high ratio"* (the real, PASS-worthy `kptest-fenyuhe-six` citation). | a nonzero signal goes unmentioned (silent acceptance — the skill's own explicit prohibition), or a waiver is asserted with no quoted row (e.g. "the collisions are fine" with no id/frame/value). |
| R3 | **Per-cue pedagogy verdict is complete — no cue silently folded into a group verdict.** | every cue in `script-cues.json` gets its own row/verdict against a named `pedagogy.md` discovery — quote one cue's discovery + its taught-evidence. | cues are collapsed into "the arc overall teaches X" with no independent per-cue row, or a cue present in `script-cues.json` never appears in the report at all. |
| R4 | **A KNOWN gate false-positive family is named as such WITH lesson-specific reasoning, never a blanket invocation.** (Decision, not a keyword.) | a captionRedundancy-subset / single-frame-contrast-entrance / pre-loudnorm-LUFS-style signal is waived by reasoning through THIS lesson's specific evidence (e.g. quoting the entrance-ramp math, or naming which cue's on-screen text is a true subset of its audio) — not by citing the family name alone as a magic exemption. | "captionRedundancy is a known false positive, ignore it" with no per-cue reasoning — the same keyword that would wave away a genuinely new redundancy defect next lesson (Goodhart risk: a rubber-stamped exemption phrase, not a re-derived judgment). |
| R5 | **The punch list routes each real defect to the wave that actually owns the offending artifact/contract.** | quote a punch-list item + the named owning wave, and confirm that wave's `contract.owns` is where the defect actually lives (e.g. a layout collision → W4a composer, a cue-timing drift → W3.5 reconcile, not W5 render). | a defect is filed with no owning wave (nobody can act on it), or routed to a wave that doesn't own the offending artifact — the real `kptest-greetings-verify` case got this RIGHT (rah-farewell contrast → W4a; ASR miss → W3a) — hold new runs to that bar. |

### Aspirational — the near-unachievable greatness marks (permanent headroom; do NOT award by default)

| # | Criterion (one construct) | PASS = quotable observable evidence | Failure signature |
|---|---|---|---|
| A1 | **Verdict severity is honestly calibrated to the single worst piece of cited evidence — never softened, never inflated.** | the top-line verdict (GREEN/YELLOW/RED) matches the worst individually-cited row; a genuine WCAG failure (e.g. 2.82:1 < 4.5:1) reads as at least YELLOW with a named blocking issue, not folded into an overall GREEN. | a real content defect gets buried under an aggregate GREEN, or a purely cosmetic/gate-calibration quirk gets escalated to a blocking RED that would trigger a wasted re-render. |
| A2 | **Sound checks reason from ARCHITECTURE, not silence, when the reviewer cannot literally listen.** | the 3-point-duck / melody-under-narration checks are reasoned from the wiring (e.g. "`<LessonBgmLayer windows={spansToWindows(voiceSpans)}>` derives duck windows from per-cue voice spans, so the bed MUST rise during cue N's silent gap") rather than the whole sound section defaulting to "cannot be verified." | the entire sound section is marked "advisory, unable to verify" with no attempt to reason from the composer's own wiring — a lazier report than the evidence allows. |
| A3 | **A capability wall in the verification METHOD ITSELF is surfaced as a pipeline finding, not silently worked around forever.** | when the reviewer cannot view an image, `pipelineFindings` NAMES it as a system gap (e.g. "this model cannot decode PNGs — the whole review is proxy-derived; a vision-capable route would close this") rather than only privately substituting evidence turn after turn with no upward signal. | the same capability wall recurs run after run (as it in fact has — `kptest-fenyuhe-six`, `kptest-greetings-verify`) with no `pipelineFindings` entry ever proposing to close it. |

**Calibration note (Law 2 — the marks a good run is EXPECTED to fail).** The real `kptest-fenyuhe-six` report
clears **R2** (every WARN quoted with its exact row), **R3** (a full 9-row per-cue table), and **R5**-equivalent
routing discipline — genuinely careful work. It also PASSES **A3** (its reviewer note names the image-viewing
gap plainly). But by the project's own later post-mortem it FAILS **R1**: the report's confidence in "the arc
teaches, layout is clean" was never distinguished from "I could not see any of this" strongly enough to stop a
human from later calling the actual video bad — R1 is deliberately the hardest mark, and today's best real run
is the evidence that it is not yet cleared. If a future run clears R1 — either by genuinely gaining image-view
capability, or by explicitly scoping every visual claim to what its proxies can prove — the verification's
trustworthiness will have genuinely surpassed today's best.

---

## THE GOLD — an annotated bar-clearing exemplar (OFF-distribution; calibrate on the BAR, not the answer)

Deliberately unlike any live lesson: a 4-cue counting lesson about frogs jumping on lily pads, reviewed by a
model that (like every real run to date) cannot decode PNGs.

**Excerpt (decision-bearing fields, abridged):**

> **Verdict: YELLOW.** *Evidentiary basis: this reviewer cannot decode PNGs (confirmed: the `read` tool
> returned no image content for `lily-pads-contact.png`). Every claim below is derived from
> `lily-pads-contact.json` (per-tile frame/hold data), `bbox-manifest.json`'s measured `getBBox()` block, and
> `ffprobe`; NO claim in this report is a first-hand visual read. Where the review touches a purely aesthetic
> question (does the jump read as delightful, is the frog's expression legible), this report says so and
> declines a confident verdict rather than inferring one from coordinates.*
>
> **§2 Bbox/gate results.** `gatesFailed: ["contrast"]`. **contrast (frog-eyes, f210) 2.1 FAIL** — the
> measured getBBox at f210 is 6 frames into the frog's landing squash, eyes at ~40% scale mid-squash; textNavy
> on lily-green yields 2.1:1, below the 4.5:1 floor. Re-measured at the settled pose (f225, full scale) the
> same colors yield 5.8:1 — **but f210 is not an entrance artifact like the known contrast-sample family; the
> squash pose is HELD for 8 frames as the comedic beat**, so a child WILL see the low-contrast moment, not
> just pass through it. → **mapped to W4a composer: either shorten the squash hold below the perception
> floor, or lighten the squash-pose eye fill.** (R2 ✓, R4 ✓ — reasoned per-frame, not a blanket exemption.)
>
> **§3 cue-coverage.** 4/4 cues addressed independently (cue 1 "jump" pedagogy discovery evidence quoted; cue
> 4 recap quoted separately, not folded into cue 1's verdict). (R3 ✓)
>
> **§4 Sound.** *Cannot listen; reasoned from wiring:* `<PondBgmLayer windows={spansToWindows(voiceSpans)}>`
> derives duck windows from voice-clip spans — cue 3's 2s learner-response gap has no voice window, so the bed
> MUST rise there per the architecture. (A2 ✓)
>
> **§5 Punch list.** `| 1 | frog-eyes contrast FAIL at f210 (held squash pose) | HIGH | W4a composer |` — names
> the artifact, the evidence, and the wave that owns the composer's fill choice. (R5 ✓)
>
> **pipelineFindings:** *"This review is 100% proxy-derived (no image-view capability in this environment) —
> the same gap recorded on kptest-fenyuhe-six and kptest-greetings-verify. A vision-capable model route for
> this node would let a future review confirm aesthetic/motion-feel claims this report explicitly declines to
> make."* (A3 ✓)

**Quote → criterion map (why this is gold):**
- R1 ✅ — the opening evidentiary-basis paragraph scopes every claim to proxy-provable dimensions and
  EXPLICITLY declines the aesthetic question rather than inferring a "looks great" from coordinates.
- R2 ✅ — the contrast FAIL is quoted with element/frame/measured-value AND correctly NOT waived as the
  familiar entrance-artifact pattern, because the evidence (an 8-frame HELD pose) doesn't match that pattern.
- R3 ✅ — 4/4 cues independently addressed.
- R4 ✅ — the report does not reach for the "known false positive" family here at all, because the evidence
  doesn't fit it; that restraint (not over-applying a familiar exemption) is itself the mark.
- R5 ✅ — the punch list names the exact defect + the correct owning wave (W4a owns composer fill choices).
- A2 ✅ — sound reasoned from the `spansToWindows` wiring, not silently skipped.
- A3 ✅ — the image-viewing capability wall is surfaced as a pipeline finding, not just quietly worked around.

---

## Anti-Goodhart self-check (run on every row before shipping — Part E)
- **Gameable?** No row rewards a keyword/count/filled field. R1 keys on a RELATION between a claim and the
  evidence-kind that could support it (not "did it mention the word proxy"); R4 keys on whether the
  lesson-specific evidence was actually reasoned through (not "did it say the magic phrase 'known false
  positive'"); R5 keys on whether the routed wave GENUINELY owns the defect (not "did it name any wave").
- **System-agnostic?** Every row survives deleting "node/schema/artifact": a senior reviewer of ANY rendered
  video would recognize "don't claim more than your evidence supports," "resolve every flagged issue in
  writing," "route the fix to whoever can act on it" as universal review discipline, not piflow jargon.
- **Observable + quotable?** Every PASS names the artifact line/frame/number that earns it; R1 in particular
  requires quoting the EVIDENTIARY-BASIS statement itself, not just the conclusion it supports.
- **One construct?** R2 (signal→addressed) is separate from R4 (a KNOWN-family waiver reasoned per-lesson) —
  a report can cite every signal (R2 ✓) while still rubber-stamping one via a blanket exemption (R4 ✗); the
  split lets a low score localize to which half failed.
- **Aspirational, not a ceiling?** A1–A3 sit above what real runs have reached; the Calibration note names R1
  as the mark the best real run to date FAILS (by the project's own later human judgment) — genuine headroom,
  not padding.
- **The honest external test:** would a senior reviewer, reading a HIGH-scoring report against this rubric,
  trust its verdict enough to ship the lesson without re-watching it themselves? If the honest answer is still
  "I'd want to check for myself," R1 has not really been earned — that is the exact gap `kptest-fenyuhe-six`
  left open.
