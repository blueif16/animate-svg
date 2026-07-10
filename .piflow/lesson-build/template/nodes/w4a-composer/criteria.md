# node: w4a-composer — QUALITY BAR (the ceiling above the bbox-manifest floor)
<!-- JUDGE / OPTIMIZER-FACING. Consumed by `piflowctl optimize triage --node w4a-composer` (buildJudgePrompt
     reads this file VERBATIM as <the_bar>) and by `piflowctl optimize gate` (the fixer's candidate judge).
     NEVER injected into w4a-composer's runtime prompt — a producer that sees its own grading rubric teaches-
     to-the-test and voids the clean-room signal the loop depends on (same law as w0-classify/criteria.md and
     .agents/skill-system-criteria.md). Wired via node.json `optimize.criteria: "nodes/w4a-composer/criteria.md"`.

     PROVENANCE: this is a working copy of the W4a section already authored in the product-wide
     `.agents/skill-system-criteria.md` (lines ~295-335) — reused verbatim, not reinvented, per the
     "reuse over re-mint" rule. That consolidated file remains the human-facing reference used across the
     lesson-build map; THIS file is what the optimize substrate actually reads for w4a-composer today, since
     `optimize.criteria` takes ONE file's raw content as the bar (no per-node slicing of a multi-node file).
     Keep the two in sync by hand when either is edited — see the memory.md open thread. -->

## What this file is (read before judging)

The **bbox-manifest hard floor is a PRIOR, separate stage**: `node.json`'s POST checks assert
`measured.method === "getBBox"`, `summary.measuredCollisionCount === 0`, and `summary.captionIntrusionCount === 0`
directly off the regenerated `bbox-manifest.json` (never the model's self-report). `optimize.measure`
(`scripts/measure.mjs`) independently re-derives those SAME three facts in-script (never via the live run's
`checks.post`), PLUS three guards an adversarial pass proved this floor still lacked: a FRESHNESS check
(`measured.ranAt` must fall inside THIS run's own node window — a crashed `lesson-measured.mjs` exits 0 without
regenerating the file, so a stale prior-run manifest can otherwise false-green all three numbers); the
`measured.gates.bboxBinding` measure-id≡manifest-id bijection (a broken bijection is exactly how the f1258
case below fell through to zone "decoration" and voided detection); and a phantom/dead-id guard on
`manifest.ts`'s own `allowedOverlaps` exemption list. **None of the marks below is that floor** — passing it
earns nothing here, and none of the new guards can tell whether a *present-and-valid* exemption is *justified*
either — that judgment call is exactly what the marks below (esp. "Vacuous green"/"Justification laundering")
are for. These marks judge the one thing no hard gate can verify: whether the composed scene is genuinely
legible, honest, and teaches the discovery — as a senior Remotion/motion-design practitioner who has never
seen this pipeline would judge it.

**EVIDENCE LAW (anti-hallucination).** Every mark requires a QUOTED line/number from the artifact (the scene
file, `layout.ts`, `manifest.ts`, or the `lesson:bbox` boxed still) — no quote ⇒ FAIL. Cite the evidence BEFORE
marking. A 0-collision measure report is NOT itself evidence of good layout — see "Vacuous green" below; the
judge must confirm WHAT the gate actually compared, or look at the boxed still.

---

## Purpose
The renderable Remotion scene + its bbox manifest that turn the reconciled cue timeline and approved upstream
artifacts into the actual moving picture W5 renders and W6 verifies.

## Acceptance criteria (what good looks like)
- Zero frame literals and zero raw motion literals: every absolute frame derives from `cues[id].startFrame/endFrame` + a NAMED layout.ts offset (offsets clamped against endFrame so motion never overruns), and every easing/spring is a named EASE.*/SPRING.* (or PopIn/Breathe) — no bare Easing.bezier numbers, no {damping,stiffness,mass} literals, no PADDED_CUE_DURATIONS_FRAMES.
- Spoken-enumeration sync: any animation marking a spoken enumeration/sequence (count-up, per-number point/circle, per-word pulse, read-along step) binds each step to that token's ASR onset frame (`cue.tokenOnsets` / the `stepFramesFromOnsets` helper / the primitive's `stepFrames` prop), never a fixed step constant or even grid from the cue head; constants stay only for non-spoken motion (pops, settles, breathe). Onsets unavailable → constant fallback AND a logged `pipelineFinding`, never a silent fixed cadence.
- Spatially disjoint, render-verified layout: load-bearing elements CO-PRESENT on screen never overlap each other's drawn pixels (question/prompt text not on top of the teaching objects; split clusters gapped enough to read), CONFIRMED by actually rendering multiple stills (intro at full cast opacity, climax mid-frame, every peak-coexistence frame) and LOOKING at them — not inferred from JSON alone.
- Honors the reconciled timeline as-is: the scene only READS the cues/voiceClips/duration the timeline exports; when motion overruns a cue it trims non-load-bearing flourishes then compresses uniformly, never extends the cue, never re-pads, never re-triggers voice. durationInFrames comes from the timeline module, not a literal.
- Identity invariants enforced structurally: the teaching unit persists as ONE primitive instance across the transformation (positions/count/opacity interpolate; not destroyed and recreated per cue), color/size/type constant.
- On-screen target strings are a subset of the CURRENT cue's own spoken phrase, in spoken order (derived from that cue's script-cues.json text), so the child never reads a word this cue's audio does not speak.
- Intro is choreographed, not piled: the title resolves and is readable on its own before the teaching cast enters (or the cast lives in a band that never overlaps the title).
- Manifest fidelity AND true-footprint bbox hygiene: every load-bearing element in the Visual Contract registered with a bboxAt using the SAME layout.ts constants and interpolation as the scene; the scene tags each with matching measureProps('<id>') and calls useMeasureHook() once; **a measureProps `<g>` wraps ONLY the load-bearing teaching mark — every pulse/attention ring, glow, sparkle, Breathe/shimmer wrapper lives OUTSIDE it as its own `zone:"decoration"` element, and no decoration sits on/crosses a teaching mark; measure-id ≡ manifest element-id is a BIJECTION (one declared id per tagged id, both directions)**; `lesson:check --measured` ran with collisionCount/measuredCollisionCount/gatesFailed AND the `bbox-binding` gate all clean OR every nonzero/WARN justified in writing after opening the flagged frame; the boxed `lesson:bbox` still (each element's measured box ≈ its declared box, ≤8px) is the review surface for any size/collision question — never a bare screenshot.
- Composition lint-clean and self-contained: PascalCase scene/wrapper components, ESM imports only, no unused vars, theme tokens (no hardcoded hex) and named curves throughout; registers via its OWN Complete*Lesson.tsx descriptor with no edits to Root.tsx/Composition.tsx or any primitive file; bed wired mechanically and SFX fire at the composer's own cue-relative motion frames.

## Red flags (negative criteria — counterweight the positive-only bias)
- Self-graded GREEN from the bbox JSON / a measured-pass 0-collision report without ever rendering and visually inspecting a frame — the eye contradicts the numbers (the canonical sandbox-EPERM "I couldn't render so I trusted the JSON" miss).
- Overlapping zones used as a substitute for spatial separation: manifest zone rectangles intersect in coordinate space and the scene relies only on elements being temporally non-co-present, so any drift puts question/label text ON the teaching objects (the learner-gap text landing on the dots).
- A split/cluster gap (or teaching-unit size) too small to read at real render size — passes a loose bbox envelope but fails the finger-cover / kid-eye legibility test.
- Frame or motion literals leak in: a bare number, an inline Easing.bezier/spring literal, a re-introduced hold/padding table, or a cue extended/padded to fit overrunning motion.
- **Enumeration off-by-one** — a counting/pointing/per-word animation stepping on a fixed cadence (e.g. `SWEEP_STEP_FRAMES * k`, an even grid from the cue head, or a baked step array) so the mark leads/lags the spoken number, instead of reading the measured token onsets — the child cannot fuse the circle with the word.
- The scene re-authors upstream truth: new pedagogy/copy/cues not in script-cues.json, an on-screen word the current cue's audio never speaks, or re-generated/re-trimmed voice.
- Manifest drift or gaps: a load-bearing element missing from the manifest, or a bboxAt computed from different constants/easing than the scene; missing/mismatched measureProps ids.
- **Inflated measured box from nested decoration** — a pulse ring/glow/sparkle/Breathe wrapper nested INSIDE a load-bearing element's measured `<g>` blows its getBBox far past the teaching mark's true footprint (e.g. aggregator-prompt 516×400 from an in-group ring vs its honest 613×70 label+mic), producing a phantom collision with whatever the inflated box now overlaps — or hiding a real one. Equally: a scene measure-id with no matching manifest id (or vice-versa) falls silently through to `decoration` and voids that element's collision detection. Both are invisible on a bare screenshot; only the `lesson:bbox` boxed still shows them.
- Intro title-occlusion: title and cast rendered at the same instant in overlapping positions.
- Shared-file or primitive edits: touching Root.tsx/Composition.tsx, modifying a shape-primitive instead of kicking back to Wave 3, or hardcoding hex; or dead air in a learner-response gap (a bare low-opacity glow with no readable label/glyph).
- **Vacuous green** — a 0-collision report that never compared the failing pair: a blanket zone-pair exemption (or a missing manifest entry, or a wrong zone tag) swallows exactly the overlap on screen. A green count is only meaningful if the pair is actually checked — verify WHAT the gate compared, not just its number.
- **Justification laundering** — a collision/gate-failure "justification" that names an element, frame, or cause not present in the failing JSON row (e.g. attributing a contrast FAIL to a different element's intentional dimming).
- **Per-cue re-entrance blink** — the persistent teaching unit re-enters from opacity 0 inside each cue (motion-window fade-in), so the canvas is empty under live narration before every motion phase; often paired with a manifest that reports opacity 1 for the same frames.

## Exemplars
- 🟢 **Gold** — PENDING (slot reserved until a closing-run re-compose yields a validated scene worth quote-mapping; do NOT fabricate one — an invented exemplar the judge can't verify against a real render is worse than none).
- 🔴 **Red-flag** — `src/lessons/kptestFenyuheSix/manifest.ts` (the 2026-06-10 M3 re-compose) · surfaced by the 2026-06-12 W4a post-mortem
  > `{ id: "question-prompt", zone: "labels", … }` — bbox = ZONE_QUESTION ⊂ ZONE_OBJECTS; pair labels:objects blanket-exempt ⇒ measured pass green at frame 1061 while the prompt renders on the dots.
  > _Log:_ "contrast — the single failure is the dimmed recap sub-beat at dimOpacity=0.32" — the actual failing row is `bond-glyph@640 ratio 1.37`.
- 🔴 **Red-flag → fixed** — same lesson, 2026-06-16 bbox-discipline post-mortem (boxed proof `out/kptest-fenyuhe-six/bbox-overlay/f1258-{before,after}.png`)
  > BEFORE: a pulse ring nested in the `labels` group → `aggregator-prompt` measured **516×400**, its box reaching down through the dots → phantom labels∩objects collision (overlap-measured 6); one `recap` tag vs three `recap-beat-*` manifest ids → recap detection fell through to `decoration`, void. AFTER (ring out of the group, beats bound): **613×70** above the dots + three **298×28** dot-rows → overlap-measured 0, bbox-binding PASS. The defect was invisible until the boxes were drawn.

  _Why red:_ a vacuous green trusted in place of looking (the zone tag routed the one real overlap through a blanket exemption), plus a gate justification that names an element the gate never flagged.
