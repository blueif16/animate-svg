# Verification — kp2-counting-by-tens

**Render:** kp2-counting-by-tens.mp4 — 26.43s video, 26.50s audio, 793 frames @ 30fps, 1280×720, h264/aac, 3.2 MB.
**Date:** 2026-05-27
**Style:** ink-wash (style #1, landed — but see "Aesthetic findings" below)

ffprobe streams confirmed: video stream 1280×720, r_frame_rate 30/1, 793 frames, duration 26.4333s; audio stream AAC, 48 kHz stereo, duration 26.496s, 1242 packets. Video/audio drift ≈ 63 ms — within tolerance.

Midpoint stills extracted with `ffmpeg -ss <t> -i <mp4> -frames:v 1 -y <out>` to `lesson-data/kp2-counting-by-tens/verification-frames/`.

---

## Per-cue findings

### bundle-recall — 2.16 s (frame 65 of 16–113)
- **pass** Visual Contract elements: persistent-bundle in zone-stage centered (~x=640, y=315), BundleWrap rope+knot present, LabelCallout "一个十" mounted in zone-label (y≈600). Caption ribbon at bottom.
- **yellow** Identity-invariance: the SmallStick sticks read as ORANGE underneath (correct), but the ink-wash modifier filter is so aggressive that BundleWrap rope reads dark-brown/maroon (not the expected coral). The knot caps read as the same brown. The filter's wet-edge displacement at this magnitude blurs the "rope vs sticks" silhouette — at thumbnail size this could read as a single brown blob rather than "sticks tied with a rope". Visible across all bundle-bearing cues; same finding in fast-vs-slow / two-tens / three-tens / recap.
- **FAIL (red)** Caption visibility / Z-collision: the LabelCallout "一个十" is rendered UNDERNEATH the caption ribbon — the only part of the label visible is the dark top edges of the glyphs poking just above the ribbon's top stroke (around x=560–720, y=595). The label is effectively hidden. This confirms the Wave-4-flagged Z-collision (see "Flagged concerns").
- Notes: caption text "看，这是我们的一个十。" reads correctly. Bundle scale ≈ 1.0 (entry pulse complete).

### untie-reveal — 5.66 s (frame 170 of 122–218)
- **pass** Visual Contract: 10 SmallStick instances in a single row spanning zone-stage (x ≈ 180→1100, y ≈ 290), evenly spaced. BundleWrap and "一个十" label have faded out (correct — both faded by ~70%). Caption ribbon present.
- **pass** Identity-invariance: all 10 sticks are the same orange (reward) SmallStick with ink-wash wet-edge applied; visually homogeneous; row layout correct.
- **pass** Caption: "把它打开，里面有十根。" matches `caption` field.
- Notes: cleanest cue in the lesson — no chrome competing, just the row + caption.

### slow-count-ones — 9.66 s (frame 290 of 237–343)
- **pass with yellow** Visual Contract: the 10-stick row is present at zone-stage y. The 5th stick (index 4) is highlighted yellow (sunshine flash on `activeIndex`). However, only **4 CountStepIndicator badges** are visible (values 1, 2, 3, 4) at this midpoint — the `<Drag staggerFrames>` chain is mid-rollout. By 9.66 s into a 3.52 s cue (≈ 50% through), we'd expect ≈ 5 badges; 4 visible is close, consistent with stagger. PASS.
- **pass** Identity-invariance: 10 same-species sticks; the highlighted active stick is the same primitive, just `highlight="counted"` lit. Row layout intact.
- **pass** Caption: "一根一根地数，要数十次。" matches.
- **yellow** StepTally pill (`数十次`, steps=10) is NOT visible at this midpoint. visual-design §3 said it fades in ~85–100% of cue — so absence at 50% is correct, but the verifier should confirm at later frame; the `extra-fast-vs-slow-late.png` (14.6s) shows it landed and is now dimmed, which is downstream evidence the slow-tally pill DID mount before cue end. PASS.

### fast-vs-slow — 13.83 s (frame 414 of 372–458) [emphasis — climax]
- **pass** Visual Contract: persistent-bundle re-tied in zone-stage center (~x=640, y=315). Single CountStepIndicator "1" badge above the bundle (zone-badges, ~x=640, y=130). Slow tally pill "10 次" visible (dimmed) at lower-left (~x=370, y=535). **NOTE:** at this exact midpoint (13.83s, ~50% through cue) the FAST tally and the vs-mark are NOT yet visible — both arrive in the last ~25% of cue per sketch-overlay.md (drawOnRelativeStart=50f → ~14.07s). The supplementary still at 14.6s (`extra-fast-vs-slow-late.png`) confirms BOTH tally pills + vs-mark land later in the cue. PASS.
- **pass** Identity-invariance: bundle on stage is the same SmallStick+BundleWrap primitive; "1 次" pill (per late still) is the same StepTally primitive as the dimmed "10 次".
- **pass** Caption + emphasis: caption "捆起来，只要数一次。" is rendered in the **coral/orange emphasis color** (per audio-captions.md §4 emphasis cues use warmer accent). Visually distinct from non-emphasis cues. PASS.
- Notes: this is the strongest cue visually — the contrast lands.

### two-tens — 17.09 s (frame 512 of 467–558)
- **yellow** Visual Contract: TWO bundles in zone-stage, but they are touching/overlapping at the center (left bundle right-edge merging into right bundle left-edge around x=640). visual-design §3 says "original bundle slides ~120 px left" and "second bundle slides in from off-canvas right to position right-of-center" — at the midpoint (~50% through 91-frame cue) both bundles have arrived but the slide hasn't separated them. No clear gap between them; the two BundleWrap rope strokes merge into one continuous brown band. A 6yo may read this as "one weird bundle" not "two bundles".
- **yellow** Count badges: NO `CountStepIndicator value=1` badges visible above the bundles at this midpoint. visual-design §3 schedules them at 55–75% — at 50% they have not popped yet, but the absence is notable since the badges are part of the "we count it: 1 + 1" beat.
- **yellow** Identity-invariance: both bundles use identical primitive shape but the ink-wash filter on the touching/overlapping ropes creates a continuous dark mass — the two-units identity is muddier than the design intended.
- **pass** Caption: "再加一捆，就是两个十。" matches.
- Notes: supplementary still at 16.0 s (`extra-two-tens-early.png`) shows the second bundle still arriving — left bundle already centered/left, the right bundle pulled in slightly. By 17.09s they've collided rather than spread apart. Composer may have under-shot the slide-left distance.

### three-tens — 21.18 s (frame 635 of 592–679)
- **pass** Visual Contract: three distinct bundles in zone-stage, well-spread (~ x=190, x=640, x=1090). Spacing reads as "three units of the same kind" — much better separation than two-tens. Two CountStepIndicator "1" badges visible above the left two bundles (~x=200, x=640, y=90). Third badge not yet popped (cue ~50%, badges scheduled 55–70%).
- **pass** Identity-invariance: three bundles same scale, same primitive props, same orange + brown-rope reading. Visually siblings.
- **yellow** Label: the cross-fade from "两个十" to "三个十" is in mid-transition at this midpoint — both LabelCallout instances overlap behind the caption ribbon. The same Z-collision issue from cue 1 is present here too: only the top edges of the glyphs poke above the ribbon. Same root cause.
- **pass** Caption: "再加一捆，就是三个十。" matches.
- Notes: three-bundle horizontal occupancy ~ 89% of zone-stage — meets the visual-design §7.4 ~90% requirement.

### recap — 24.53 s (frame 736 of 698–775) [emphasis — takeaway]
- **pass** Visual Contract: three bundles held in zone-stage with identical layout to three-tens. Three CountStepIndicator "1" badges all visible above their bundles (good — held from three-tens). Label cross-fading (24.53s is ~50% into 77f cue; cross-fade window 10–45%, so by midpoint the new takeaway label should dominate).
- **pass** Identity-invariance: same three bundles, same scale. The visual-design §3 said `celebrate=true` staggered left→right over ~45–80% of cue (scale 1.0→1.04→1.0 per bundle). At 50% the left bundle should be mid-pulse — at this still, the three bundles look at very slightly different scales (left ≈ 1.0, middle ≈ 1.03–1.04, right ≈ 1.0). This is consistent with `<Breathe>` staggered phaseOffset 0/20/40 producing slightly different scales per bundle. PASS.
- **pass** Caption + emphasis: caption "一捆一捆地数，更快。" rendered in coral/orange emphasis color — matches audio-captions.md §4 emphasis pattern.
- **FAIL (red)** Z-collision: the takeaway label "一捆一捆地数，更快。" in zone-label (y≈600) is again drawn UNDER the caption ribbon (y≈640). Visible only as dark glyph-tops poking above the ribbon. This is the same Z-stack issue as cue 1.
- **yellow** Underline TeacherMark "更快": at the 24.53s midpoint the underline draws on at relativeStart=46f (~24.78s), so it is NOT yet drawn at this midpoint. See `extra-recap-late.png` at 25.5s for confirmation.

---

## Round-2 capability showcase

- **<Drag> in slow-count-ones**: Confirmed staggered entrance. `extra-slow-count-stagger.png` at 8.5 s shows only badge "1" arriving while sticks 2–10 are unbadged; midpoint frame at 9.66 s shows 4 badges (1–4) with stick 5 currently highlighted. The badges are not all entering on the same frame — they follow the `activeIndex` walk left-to-right. Stagger visible and correct.
- **<Smear> in two-tens**: NOT visibly observed at 17.09 s midpoint. By the time of the midpoint sample the second bundle has already arrived; the smear (high-velocity straight-line trail) would only be visible during the few frames of active slide. No translucent arc band detected at midpoint. Would need a frame in the 15.5–16.5 s window to confirm; the supplementary `extra-two-tens-early.png` at 16.0 s shows the second bundle mid-arrival but no obvious translucent trail behind it. **YELLOW** — cannot confirm `<Smear>` is being rendered; either it's running but below visual threshold, or the active window passes too quickly to catch in a still.
- **<Smear> in three-tens**: Same status — not visibly observed at 21.18 s midpoint. The third bundle has already settled. Would need an earlier frame.
- **<GlintFlash> in fast-vs-slow**: The vermilion 4-point star flash is a sub-12-frame event at the bow knot. At 13.83s midpoint, the bundle's bow knot is visible at top (~x=640, y=265) but no star flash is present at this instant. The `extra-fast-vs-slow-late.png` at 14.6s also shows no star (likely past the flash window). **YELLOW** — capability is plausibly firing in a 12-frame window between 13.5–14.0s but no midpoint still captured the moment. Not a fail (it's a one-shot 12-frame event by spec), but visual evidence is missing.
- **<Breathe> in recap**: Confirmed. Both `cue-recap-mid.png` (24.53s) and `extra-recap-late.png` (25.5s) show the three bundles at perceptibly different scales (left and right ≈ baseline, middle slightly larger; the phase shifts between stills). Consistent with phaseOffset 0/20/40 staggered breathing.
- **<StylePreset style="ink-wash">**: Confirmed across ALL 7 cues. Wet-edge displacement is visible on every primitive (sticks, rope, badges, tally pills, sketch marks). Background reads as paper-cream (`#FFF7E6` family). No SceneFrame decorative corner chrome visible in any frame — the `activeStyle` gate is doing its job. HOWEVER: the filter magnitude appears too aggressive on the BundleWrap rope — the rope reads dark-brown/blobby rather than the intended coral with a wet edge. See aesthetic findings below.

---

## Sketch marks

- **vs-mark in fast-vs-slow**: CONFIRMED in `extra-fast-vs-slow-late.png` (14.6s). A short angled "vs" glyph (two crossing dark strokes) is rendered between the slow "10 次" pill (left) and fast "1 次" pill (right), at approximately x=640, y=525. Position matches the sketch-overlay.md anchor (640, 535) — slightly higher visually because the displacement filter shifts the centroid a touch. Mark is restrained, single-color (ink), and does not overlap either pill. PASS.
- **Underline "更快" in recap**: NOT observable at 24.53s midpoint (correct — draw-on starts at 46f relative = ~24.78s). Should appear in the 24.78–25.4s window. At `extra-recap-late.png` (25.5s) the underline is plausibly visible underneath the takeaway label but the caption ribbon Z-collision obscures the relevant glyphs (更快) along with the label itself. **YELLOW** — the underline anchor (y=632) sits BELOW the takeaway baseline (y≈610) and likely BELOW the caption ribbon top (y≈640); given the caption ribbon is opaque, the underline may be partially or fully hidden behind it.

---

## Audio / caption sync

- Audio stream present (AAC stereo 48 kHz), duration 26.496s — voice runs essentially the full video length.
- Each midpoint still shows a caption matching the cue's `caption` field in the timing module. Verified per cue above (PASS on all 7).
- Emphasis cues (`fast-vs-slow`, `recap`) show coral/orange-tinted caption text — matches audio-captions.md §4 emphasis treatment. PASS.
- Audio precedes/exceeds the visual length by 63 ms (within tolerance).

---

## Aesthetic findings (ink-wash filter calibration)

This is a style-level finding that cuts across multiple cues, separated from per-cue notes for clarity:

- **Wet-edge magnitude is too high on the rope/knot.** BundleWrap reads as a heavy, dark-brown blob with chunky pixelated edges rather than a coral rope with a soft wet edge. The expected aesthetic per `.agents/styles/ink-wash/` is bleed at stroke perimeters, not silhouette dissolution. The orange sticks survive this OK (they're broad fills), but the rope is a thinner, more linear primitive where the displacement filter eats the silhouette. The base-frequency / scale on `style-ink-wash-primary` may be tuned to fills, not strokes — consider a separate `style-ink-wash-stroke` filter with reduced `scale` for `BundleWrap`.
- **Count badge "1" glyphs look like patchy ink-blots.** In `cue-recap-mid.png` and `cue-three-tens-mid.png`, the three "1" badges read more like inkspots than legible numerals (you can see *something* is written, but the "1" character is hard to recognize). Same root cause: thin-stroke glyphs being chewed by a fill-tuned filter.
- **Slow-tally pill "10 次" and "1 次" are partially legible** — the "10" is readable but the "次" reads as small ink-spatter rather than a clean glyph (visible in `extra-fast-vs-slow-late.png`).

These are not red findings (the lesson teaches), but the filter could be calibrated down by ~30% on `scale` or `baseFrequency` to land more on "wet edge" and less on "ink melted".

---

## Flagged concerns (orchestrator decides)

### RED — Z-collision: LabelCallout under caption ribbon (cues 1, 5, 6, 7)
- **bundle-recall (cue 1)**: "一个十" label is fully hidden behind caption ribbon. Only dark glyph-tops poke above the ribbon top edge. CONFIRMED — this matches the Wave-4 flag.
- **two-tens (cue 5)**: "两个十" label appears to be at the same y-band; visible only as dark fragments above the ribbon. CONFIRMED.
- **three-tens (cue 6)**: "三个十" label cross-fade hidden behind ribbon. CONFIRMED.
- **recap (cue 7)**: Takeaway label "一捆一捆地数，更快。" hidden behind ribbon. CONFIRMED — most damaging here because the takeaway IS the moral.
- **Reproduction**: any midpoint still in `verification-frames/` for the four affected cues shows the label at zone-label y≈600 being clipped at the top by the caption ribbon at y≈640. Zone-label declared height is 60px (y=580→640), zone-caption is y=640→720 — they SHOULD be disjoint, but the rendered ribbon's pill background appears to extend upward past y=640 (the rounded-corner padding plus drop-shadow bleed pushes the top edge to ~y=595). Combined with zone-label's text baseline at y≈610, the glyph descenders sit inside the caption ribbon's visible area.
- **Why this is load-bearing**: visual-design §3 says "一个十" / "两个十" / "三个十" / takeaway are load-bearing per the text-budget audit. If the kid can't read them, the lesson loses its unit-naming and its moral.
- **Fix proposal (NOT applied)**: orchestrator decision — either (a) raise zone-label y from 580 to ~540 so the label baseline clears the ribbon, or (b) shrink caption ribbon vertical padding, or (c) make the caption pill background semi-transparent so the label shows through. Option (a) preserves the caption styling and reflows the lowest band only.

### YELLOW — Two-tens bundle separation
- The two bundles in `cue-two-tens-mid.png` (17.09 s) are touching at center with no gap. visual-design §7.4 calls for clear separation. Composer may have under-shot the leftward slide of the persistent bundle or the rightward rest position of bundle-B. By three-tens (cue 6) the spread is correct — so the issue is two-tens specifically.

### YELLOW — Smear / GlintFlash visual evidence absent in stills
- `<Smear>` (two-tens, three-tens) and `<GlintFlash>` (fast-vs-slow) are short-window FX; their absence in midpoint stills does not prove they aren't firing. Recommend the orchestrator scrub through the actual mp4 in Remotion studio or extract additional frames inside the 6–12 frame active windows to confirm.

### YELLOW — Ink-wash filter calibration on thin strokes
- See "Aesthetic findings" above. BundleWrap rope, CountStepIndicator glyph, StepTally label "次", and sketch marks all show silhouette dissolution rather than wet-edge bleed. Not a fail, but worth a calibration pass before this becomes the default for KP3+.

---

## Overall

**Pass with one RED finding and three YELLOW findings.**

The lesson teaches its KP: same 10 sticks, slow-counted vs bundled, then extended to 2/3 bundles each costing one count of 十. Identity is preserved across cues; emphasis cues read distinctly; the climax contrast (10 次 vs 1 次 with vs-mark) is the strongest moment. The `<Drag>`, `<Breathe>`, and ink-wash style overlay are visibly working.

**Blocker to delivery (RED):** the Z-collision between LabelCallout (zone-label) and caption ribbon (zone-caption) hides four load-bearing labels — "一个十", "两个十", "三个十", and the takeaway "一捆一捆地数，更快。". This breaks visual-design §3's text-budget contract (those labels were declared load-bearing). The orchestrator should kick this back to the composer for a zone-y adjustment before sign-off.

**Non-blocking polish (YELLOW):** two-tens bundle spacing; smear/glint stills evidence; ink-wash filter calibration on thin strokes.
