<!-- SOFT MEASURE for the `w5-render` node (the RENDER PRODUCER — the lesson's .mp4 + contact.png).
     JUDGE-FACING ONLY. Read verbatim into the triage judge (`buildJudgePrompt`) and the gate
     (`optimize verify`) as the shared quality bar; NEVER injected into any node's runtime prompt (w5-render
     has no prompt at all — it is `"programmatic": true` — but this file must also never leak into w6-
     verification's or any other node's prompt, which would teach-to-the-test and void the clean-room signal).
     Authored to the measurement-runway method: a CHECKLIST (coverage) + a tiered RUBRIC (graded) + an
     annotated off-distribution GOLD. Every row keys on OBSERVABLE, QUOTABLE evidence of RENDER FIDELITY —
     never on pedagogy/layout/sound DESIGN quality, which is w6-verification's job, and never on "the file
     exists", which the HARD floor in `optimize.measure` + `checks.post` already owns. -->

# w5-render — the render's quality bar (did the PROCESS faithfully deliver the frozen design, or did it corrupt it)

## The node's LEVERAGE on the end product (the seed of every criterion)
`w5-render` is `"programmatic": true` — it makes no creative decisions, only executes
`render-complete-lesson.mjs` (bundle → Remotion render → 2-pass ffmpeg loudnorm → contact sheet) against scene
code and audio that every upstream wave already froze. Because it makes no decisions, it is tempting to treat
it as unmeasurable except by "did the two files land" — but it is also the ONE node that turns the frozen
design into the actual pixels and waveform a learner will see and hear. **If the RENDER PROCESS ITSELF
corrupts, truncates, desyncs, or silently degrades that translation, the shipped lesson is broken in a way no
upstream node could have caught (they never see a render) and no downstream node reliably catches either** —
w6-verification's own prompt says outright "you CANNOT watch the mp4; judge from the contact sheet + frames",
and w6 inherits THIS node's own contact sheet, so a render-layer defect that also corrupts the contact sheet
can slip past both. So w5's bar is not "produced a file" (the hard floor's job) — it is *did the mechanical
render process deliver the design cleanly and completely, with nothing lost or corrupted in translation.*

**Scope fence (do not duplicate w6).** This file judges RENDER FIDELITY only — is the render process's OWN
output free of defects the process itself introduced. It never re-judges whether the pedagogy/layout/sound
DESIGN is good (w6-verification's `lesson-verification` skill owns that). A cell that faithfully renders a
bad design is a w6/upstream finding, not a w5 defect; a cell that renders a good design badly (glitched,
clipped, frozen, silently-skipped audio norm) is a w5 defect.

The judge is BLIND to the render process's own logs and reads this bar together with the run's hard
`measure.w5-render.json` (the `render-stream-sanity` ffprobe report + the loudnorm-completion gate — see
`node.json` `optimize.measure`). A clean hard report is NOT evidence the render is visually clean; cite BOTH
fronts. Cite a quoted cell/label/number for every mark — **no quote ⇒ no PASS.**

---

## THE CHECKLIST — coverage (did the render engage this dimension AT ALL, without a render-layer defect?)
Not grading — an omission/defect scan over the contact sheet (`<lessonId>-contact.png`, read as an image; every
sampled cue × 5 offsets: start / narr-mid / narr-end / hold-mid / cue-end) plus the deliverable mp4/logs.

1. **Full-frame, non-blank delivery** — every sampled cell shows a complete rendered frame filling the
   composition's declared canvas; none is black/blank/a stuck loading state.
2. **No frozen/duplicate render** — adjacent cells for DIFFERENT labeled offsets are visually distinct where
   the underlying cue calls for motion (a frozen render repeats the same pixels across offsets that should
   differ).
3. **No render-introduced visual corruption** — no banding/blocking/tearing/garbled or truncated text that the
   upstream scene code did not itself call for.
4. **Correct frame geometry** — full-bleed canvas at the declared aspect; no letterboxing, pillarboxing, or an
   element clipped at a frame edge that the manifest/geometry did not intend to clip.
5. **Every registered element actually rendered** — no primitive silently missing/blank where the scene code
   places one (the classic client-side-crash-renders-nothing failure mode).
6. **Prop-level fidelity** — a rendered element's color/scale/position/text matches its authored config, never a
   silent default-fallback appearance.
7. **Cue-to-frame fidelity** — each sampled cell plausibly shows the RIGHT moment for its labeled cue/offset (no
   off-by-one shift, no a stale prior-cue frame bleeding into the next slot).

*(Two further dimensions a great render must cover — audio normalization and deterministic step-completeness —
are DELIBERATELY excluded from this visual checklist: the judge here reads only the contact sheet image and
cannot itself listen to audio or read the render log, so both are HARD-measured instead; see Wiring below.)*

---

## THE RUBRIC — the graded bar (one construct per row · PASS = quotable evidence · a failure signature)

**Aggregation.** ALL **Required** rows (R1–R4) must PASS for the render to be *sound*. **Aspirational** rows
(A1–A2) are the discriminators that separate a merely-correct render from one that PROVES fidelity down to the
cue level — they sit above what a typical clean run needs to clear and create the loop's headroom. Note what is
DELIBERATELY absent here: "every pipeline step completed" and "audio is actually normalized within tolerance"
are NOT graded rows — both are now HARD measures (`render-loudnorm-completed`'s regex gate +
`measure-render.mjs`'s independent `lufsWithinTolerance` re-measurement, `node.json` `optimize.measure`); a
numeric/log comparison a machine decides for free is never re-paid to this judge (Part D's hard/soft boundary).

### Required — the floor of RENDER FIDELITY above the deterministic floor

| # | Criterion (one construct) | PASS = quotable observable evidence | Failure signature |
|---|---|---|---|
| R1 | **Full-frame render integrity — nothing blank, nothing frozen.** | every sampled cell in the contact sheet is a complete, non-black frame at full canvas, and cells across DIFFERENT offsets that the cue's motion calls for are visibly distinct — quote the cue/offset cells inspected and confirm none is blank or a duplicate-adjacent freeze. | any cell is black/blank/a stuck placeholder, or two adjacent cells for DIFFERENT offsets are pixel-identical where the cue's own timing implies motion between them. |
| R2 | **No render-introduced visual corruption.** | no cell shows encoding artifacts (banding/blocking/tearing) or garbled/cut-off text that the scene code itself did not call for — cite the specific cell and what it should have shown vs what rendered. | legible upstream text/shape renders garbled, truncated, or duplicated ONLY in the render output (the scene/composer artifacts show it correctly authored). |
| R3 | **Correct frame geometry — full-bleed, correct aspect, nothing wrongly clipped.** | the canvas fills the frame at the composition's declared aspect in every sampled cell, with no letterboxing/pillarboxing and no element cut at an edge the design did not intend — quote a cell and the expected vs observed framing. | a letterboxed/pillarboxed frame, a squashed/stretched aspect, or an element clipped at a canvas edge that the manifest places well inside bounds. |
| R4 | **Every registered element actually renders — no silent primitive drop.** | every element the scene code places for a sampled cue is visibly present in that cell (nothing renders as blank/missing where a primitive should be) — quote the cue's expected element(s) and confirm presence. | a primitive that the scene/manifest declares is silently absent from the rendered frame (the classic client-side-crash-renders-nothing Remotion failure). |

### Aspirational — the near-unachievable fidelity marks (permanent headroom; do NOT award by default)

| # | Criterion (one construct) | PASS = quotable observable evidence | Failure signature |
|---|---|---|---|
| A1 | **Cue-to-frame fidelity — every sampled offset shows the RIGHT moment, not an approximation.** | cross-referencing each cell's labeled cue + offset (start/narr-mid/narr-end/hold-mid/cue-end) against what that offset should show (narration progress, element entrance/hold state), every cell matches with no off-by-one shift or bleed from the adjacent cue — quote a specific offset and confirm the on-screen state matches its label exactly. | a cell labeled `narr-mid` shows the `start` state (or vice versa), or a `cue-end` cell still shows the PRIOR cue's content bleeding in — the render's own frame-offset math, not the timeline design, produced the mismatch. |
| A2 | **Prop-level render fidelity — an element renders with its AUTHORED look, never a silent default fallback.** | every element's rendered color/scale/position/text matches what the scene code authored for it (quote the element + the authored prop vs what appears on screen) — a step above mere presence (R4). | an element is present (R4's floor) but visibly using a generic/default appearance inconsistent with its authored config — the classic silent-fallback Remotion bug where a prop failed to resolve and the component rendered its default instead of erroring. |

**The aspirational apex (Law 2).** A1+A2 are deliberately above what a render with merely-present, merely-
non-corrupt content needs to clear — they require cross-checking cue labels against on-screen state (A1) and
authored props against rendered appearance (A2), not just "is something there." Expect a typical clean run to
pass R1–R4 and to be the discriminator that catches the rare frame-offset or silent-prop-fallback regression
A1/A2 are built to surface.

---

## THE GOLD — an annotated bar-clearing exemplar (a REAL past render, off-distribution from any live lessonId)

> `remotion-svg-primitives/out/fen-yu-he/fen-yu-he-contact.png` — the contact sheet for the **fen-yu-he**
> lesson ("五的分与合" / composing-and-decomposing five), a lesson this template is not currently instantiated
> against. Read it as *what clearing R1–R4 (and reaching for A1) looks like*, then judge THIS run's own contact
> sheet against the BAR below — never against this specific fiction/content.

**What the image shows (9 cue-rows × 5 offset-columns — start/narr-mid/narr-end/hold-mid/cue-end):**
- **R1 (full-frame, nothing frozen).** Every one of the 45 cells is a complete, non-black frame on the full
  cream canvas. Motion cues visibly progress across their row: e.g. `split-into-two`'s five columns show a
  divider line appearing (start: no divider) then holding in place (narr-mid → cue-end) while the caption box
  fades — no cell is blank, and no two DIFFERENT-offset cells in a motion cue are identical pixels.
- **R2 (no corruption).** Chinese title text (`五的分与合`), the caption ribbon, and the tree-diagram digits
  (`5` over `1`/`4`) are crisp and fully legible at every offset shown — no banding, no garbled glyphs, no
  truncated characters.
- **R3 (correct geometry).** Every cell fills its full canvas region edge-to-edge at a consistent aspect; no
  cell is letterboxed or has an element sliced off at a frame edge.
- **R4 (every element renders).** `five-whole`'s five orange/fruit icons, `first-ordered-split`'s numbered
  tree diagram, and `slide-one-at-a-time`'s growing numbered column all appear exactly where the scene places
  them — nothing is silently missing.
- **A1 (cue-to-frame fidelity, reached).** The `cue-end` column for `intro-title` shows the caption fading out
  (dimmed text, "hold" state) rather than still showing the fully-opaque `narr-end` caption — the offset labels
  and the on-screen fade state agree exactly, cell by cell, across all 9 rows.
- **A2 (prop fidelity, evaluated from the scene code, not the image alone).** Every fruit icon, divider line,
  and diagram digit's color/scale/position matches what the composer's scene code authored for it — none reads
  as a generic default standing in for a resolved prop. Confirm against the scene source when in doubt, never
  assert A2 from a glance at the still alone.
- **(hard, not judged here) deterministic completeness + audio normalization.** Both are confirmed separately
  from `measure.w5-render.json` (§ Wiring below) — this lesson's own `render-timing.json` and re-measured
  loudness are NOT part of this image-based judgment.

**Calibration note.** This lesson's contact sheet is a genuinely clean render — a realistic "R1–R4 all PASS,
A1 reached" bar, not a contrived best-case. Treat any run whose contact sheet falls visibly short of THIS
level of frame completeness/legibility/geometry as failing the corresponding row, and hold A1/A2 to the same
cell-by-cell standard shown here rather than a hunch. Visual cleanliness and audio normalization are INDEPENDENT
axes — this contact sheet being clean says nothing about whether the SAME lesson's audio actually landed the
loudnorm target (see the Wiring §'s LUFS finding on this exact lesson's own deliverable, below).

---

## Wiring + readiness (how these plug into triage, per the runway)
- **HARD** → `optimize/substrate/measure.w5-render.json` (via `runNodeMeasure`): the `render-stream-sanity`
  ffprobe + loudness + contact-correspondence report (mp4Exists · ffprobeRan · hasVideoStream · hasAudioStream ·
  durationFloorMet · lufsWithinTolerance · contactFreshness · contactDurationMatch) + the
  `render-loudnorm-completed` regex gate over `render-timing.json` + whatever digest anomalies/trace detectors
  fire for this node (mostly `slow`/`error`/`truncated` — w5 spawns no model, so `mega-think`/`tool-loop`/
  `cost-spike` do not apply here).
- **SOFT** → this file's checklist + rubric + gold (above) as the blind judge's references — a vision-capable
  read of the contact sheet PNG. JUDGING only, never injected into any node's prompt. The soft judge has NO way
  to tell a fresh contact sheet from a stale one left behind by a swallowed regen failure — that correspondence
  is exactly why `contactFreshness`/`contactDurationMatch` are HARD, not soft, checks (Part D's hard/soft
  boundary: a mtime/duration comparison is a `==`, never worth paying a judge for).
- **VALIDITY confirmed at authoring time (do NOT skip re-confirming after any change to `measure-render.mjs`
  or `render-complete-lesson.mjs`'s loudnorm block):** `measure-render.mjs` was run against the real
  `fen-yu-he.mp4` render (5/6 checks pass — it correctly FAILED `lufsWithinTolerance`, measuring I=-17.22 LUFS /
  TP=-4.56 dBTP against the documented -16±1/-1 target: a REAL historical case of a deliverable that never
  actually landed the loudnorm target, exactly the silent-degradation class this measure exists to catch) and
  against two deliberately-broken synthetic inputs — a missing file (0/6, correctly attributes `mp4Exists`) and
  a video-only/1s clip (3/6, correctly flags `hasAudioStream` + `durationFloorMet` + `lufsWithinTolerance` by
  name). All three runs confirm the hard measure FIRES and DISCRIMINATES rather than silently passing a broken
  or degraded artifact.
- **VALIDITY of `contactFreshness`/`contactDurationMatch` (closes the stale-clean-PNG hole an adversarial pass
  proved):** run against the real `fen-yu-he` artifact set with its OWN genuinely-corresponding contact PNG/JSON
  — both PASS (contact mtime 8s after the mp4's; legend-implied 40.07s vs ffprobe's measured 40.13s, well inside
  tolerance). Then run against a constructed evasion — the SAME good mp4 + contact PNG/JSON, but with the mp4
  `touch`ed to a fresh mtime (simulating "re-rendered this run") while the contact PNG/JSON keep their OLD
  mtimes (simulating "regen silently failed, stale PNG shipped," the exact swallowed-try/catch failure mode
  named above): `contactFreshness` correctly FAILS (PNG now far older than the mp4) while every OTHER check
  (mp4Exists/ffprobeRan/hasVideoStream/hasAudioStream/durationFloorMet/lufsWithinTolerance) still PASSES on the
  unchanged, genuinely-good mp4 — proving the new check is the ONE that fires on exactly this evasion, not a
  blunt instrument that also flags a good render. A second constructed evasion — the legend JSON's
  `totalDuration` overwritten to imply a wildly different length (a contact sheet built from a differently-cut
  render, mtime untouched) — correctly fails `contactDurationMatch` alone, independent of `contactFreshness`.
  See `validityProof` in the harden turn that landed this for the exact before/after run output.

## Open items owed to the runway (named, not silently left unbuilt — see `memory.md`)
- **No expected-duration cross-check.** `durationFloorMet` is a SANITY floor (≥ 2s), not a correctness oracle —
  it cannot catch a render that is real-but-truncated relative to the reconciled cue timeline. A real fix needs
  the expected duration from `w3-5-reconcile`'s output, a cross-node comparison intentionally deferred. (This is
  a DIFFERENT axis from `contactDurationMatch` below: that ties the contact PNG to THIS mp4's OWN duration, not
  to the reconciled timeline's EXPECTED duration — closing this item still needs the cross-node read.)
- ~~Stale-artifact risk on a failed contact-sheet regen~~ — **CLOSED.** `measure-render.mjs` now takes
  `--contact-png`/`--contact-json` and adds `contactFreshness` (PNG mtime vs mp4 mtime) +
  `contactDurationMatch` (the `-contact.json` legend's own totalDuration/fps vs the mp4's measured duration);
  `render-stream-sanity-gate`'s count-floor raised 6→8. See the VALIDITY bullet above + `memory.md`.
