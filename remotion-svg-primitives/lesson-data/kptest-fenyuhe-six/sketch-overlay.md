# Sketch Overlay — kptest-fenyuhe-six

Wave 4b. CUE-RELATIVE frames only — no master-timeline absolutes. Restraint per `sketch-explainer-layer` SKILL §"Restraint principle". **Total marks: 0 of 6 cues** (0% — under the `floor(6 × 0.6) = 3` ceiling; zero by upstream design, see §1).

---

## 1. Sketch language

**This lesson carries no teacher marks.** Per `visual-design.md` §3 (verbatim): *"Sketch tone: N/A — this lesson carries no teacher marks. The voice is the only 'teacher' channel; the picture carries the concrete instance (the dots that move)."* The "your turn" affordance on the echo + aggregator cues is signaling chrome (`<PointerHandArrow variant="hand">` or `<PulseCircle>`), not a sketch mark — also per `visual-design.md` §3 and §6.

§1.1 Boil and §1.2 Settle are NOT applicable (no marks). The single source of truth on stroke / width / opacity for IF a mark were ever needed is the `textNavy` ink (`#24324B`, per `visual-design.md` §3 palette) at `strokeWidth = 4 viewBox units` and steady opacity 0.9. No boil / settle reference is wired into the scene code.

---

## 2. Per-cue mark table (CUE-RELATIVE frames)

Cue ids + boundaries are the v4 reconcile output (`kptestFenyuheSixCues` in `src/lessons/kptestFenyuheSixLessonTimeline.ts`; per W3.5 reconcile log "key stdout-stderr"):

| cue id | start | end | length (fr) | narration | gap | mark? | 1-line reason |
|---|---|---|---|---|---|---|---|
| `routine-reprise` | 0 | 180 | 180 | 171 fr (5.7s) | 0 fr | n | `<LessonIntroCard>` (cue 1 Phase A, title alone) → six dots enter as a row (cue 1 Phase B) IS the routine-reprise signal. The voice names the routine ("六的分与合。和五的分与合一样，我们来分六。"). A mark on a title card violates `announce-topic` `requires`; a mark on the entering dots competes with the dots' identity-preserving entrance. |
| `split-1-and-5` | 180 | 494 | 314 | 185 fr (6.2s) | 120 fr (4s learner-response) | n | `<PartWholeComposer mode="split" then mode="merge">` on the same six identity-invariant dots IS the discovery. The voice names the COMPLETE bond ("六可以分成一和五。一和五合成六。") — the §4 acquisition carve-out's "name the whole being decomposed" rule. A mark on a working 1\|5 split is decoration over the picture's own delivery. The 4s tail is a typed learner-response gap (free silence), where a mark would compete with the silence itself. |
| `split-2-and-4` | 494 | 805 | 311 | 182 fr (6.1s) | 120 fr (4s learner-response) | n | Same shape as `split-1-and-5` (co-equal airtime per pedagogy §8). The dot migration IS the discovery; the bond glyph "二和四" + the voice name the bond; the picture delivers the parts. No signal left for a mark. |
| `split-3-and-3` | 805 | 1150 | 345 | 186 fr (6.2s) | 150 fr (5s learner-response, extra symmetric dwell per pedagogy §8) | n | The lesson's NEW property (the equal split 5's splits did not have). The 30f `EASE.outQuint` climax motion + the symmetric 3\|3 mirror placement + the 2s symmetric hold + the 5s extra-dwell gap = the picture's load-bearing celebration. The voice names the bond ("六可以分成三和三。三和三合成六。") — the equality is felt through the mirror placement, not lectured. A teacher underline would re-articulate a signal the picture has already delivered four times over (motion + mirror + hold + dwell). The W4a composer's prior-run underline helper is a drift from the visual-design's "N/A" — see pipelineFindings. |
| `aggregator-prompt` | 1150 | 1366 | 216 | 87 fr (2.9s) | 120 fr (4s learner-response) | n | The held six-dot row + `<PulseCircle>` IS the affordance. The voice asks "六可以分成几和几？" and bakes a 4s typed gap for the child to retrieve the full set. A mark on a held silence would (a) compete with the silence itself and (b) over-articulate the prompt the `<PulseCircle>` is already signaling. |
| `recap` | 1366 | 1675 | 309 | 173 fr (5.8s) | 0 fr | n | `<RecapSpotlight currentHighlight={i}>` with `currentHighlight` advancing 0→1→2 at the per-item boundaries IS the recap signal. The voice replays the three splits in canonical order ("一和五。二和四。三和三。它们合起来，都是六。") and the live highlight follows the spoken item. A teacher mark would (a) compete with the live-highlight mechanic, (b) over-articulate the item the highlight is already landing on, and (c) break the recap's "highlight follows the spoken item" requirement. |

**Total marks: 0.** All six cues get `n`. Every row's reason is a "signal X, which is not yet carried by Y or Z" check that fails — for every cue, the picture (dot migration / mirror placement / row / live highlight) + the voice (bond name / prompt / recall) already carry the signal. None is a load-bearing moment for ink.

---

## 3. Climax sketch

**None.** The lesson's climax is `split-3-and-3` (the equal split — the lesson's NEW property per pedagogy §"The one beat" + brief). The climax's picture-side celebration is:

1. The 30f `EASE.outQuint` climax motion (the one climax curve in the lesson's motion vocabulary, per `visual-design.md` §3 + §4).
2. The mirror placement (two groups of three, identical, evenly spaced — the equality is the picture's job per pedagogy §cue-split-3of3).
3. The 2s symmetric hold inside the cue (extra DWELL on the symmetric state, per pedagogy §8 + §6).
4. The 5s extra-dwell typed gap (extends the symmetric hold into the next cue's silence).
5. The `<Breathe>` wrap on the dot group + the bond glyph (moving-hold, per `CAPABILITIES.md#magic-fx-library`, default `bpm=15`, `amplitudeScale=0.005`).

A teacher underline on the symmetric hold would re-articulate a signal the picture's mirror placement + climax curve + hold + dwell + breathing have already delivered five times over. Per the W4b skill's restraint principle: *"This mark carries signal X, which is not yet carried by Y or Z."* — the sentence cannot be completed for `split-3-and-3`. Drop the mark.

---

## 4. Composer hand-off

**No `<TeacherMark>` instances in the scene.** The W4a composer must NOT mount a `<TeacherMark>` element for this lesson. Specifically:

- The previous-run W4a composer (which built an `underlineStateAt` helper for a `cue-split-3of3` underline) is drift from the v4 visual-design's "N/A" directive. The W4a re-run (after the W3.5 cue-id rename) must drop the underline helper AND not mount a `<TeacherMark>` element. The `underlineStateAt` helper should be removed from `kptestFenyuheSixLessonScene.tsx` and the `TeacherMark` import should be removed from the scene's import block.
- The `zone-objects` (the six-dot row, per `visual-design.md` §2) holds no marks. The `zone-labels` (the bond glyph) holds no marks. The `zone-caption` (the narration ribbon) holds no marks. The `zone-pointer` (the "your turn" affordance) holds signaling chrome (`<PointerHandArrow>` or `<PulseCircle>`), not ink.
- The manifest (`src/lessons/kptestFenyuheSix/manifest.ts`) has NO `SceneElement` entry for a `zone: "marks"` element. The manifest's `bboxAt` / `opacityAt` surface is therefore trivially clean for marks — there are no marks to collide with anything.

**If a future revision of the visual-design reverses the "N/A" call** (e.g. moves the lesson toward a different climax mechanic where ink earns its place), the W4b spec must be re-run with the new directive — never silently re-introduce the old underline from this spec. The current spec is bound to the current visual-design's "N/A"; a future W2a that adds ink MUST be followed by a W4b re-spec.

---

## Self-check

1. ✓ Every row of the per-cue table completes (or fails to complete) the §"Restraint principle" sentence in the "1-line reason" column. The fail-to-complete rows are exactly the rows where marks were considered and dropped.
2. ✓ Zero marks → trivially zero cue-relative-frame literals to verify.
3. ✓ No anchors to verify (no marks) → trivially zone-clean.
4. ✓ Total marks (0) ≤ `floor(cueCount × 0.6) = 3`.
5. ✓ Matches the upstream `visual-design.md` §3 directive ("Sketch tone: N/A — this lesson carries no teacher marks").
6. ✓ Uses the v4 cue ids from W3.5 reconcile (`routine-reprise`, `split-1-and-5`, `split-2-and-4`, `split-3-and-3`, `aggregator-prompt`, `recap`) — NOT the pre-rename 9-cue ids (`cue-announce-split-1of5`, `cue-split-3of3`, `cue-learner-response-gap`, etc.) that the previous-run W4b spec used.
