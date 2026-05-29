# Sketch overlay — kp2-counting-by-tens

Wave 4 sketch-layer artifact. Defines teacher-mark overlays (Excalidraw-style, hand-drawn ink) layered over the primitive scene. Style overlay: **ink-wash**, so every mark passes through the `style-ink-wash-primary` filter and reads with wet-edge displacement. No per-mark inline ink hex — strokes resolve via `useStylePalette().ink`.

**CUE-RELATIVE FRAMING RULE.** Every mark's timing is expressed as cue-relative offsets — frames after `cues[cueId].startFrame`. The composer translates relative → absolute at scene-build time via `cues[cueId].startFrame + relativeOffset`, then clamps against `cues[cueId].endFrame`. NO master-timeline absolute frames appear in this document.

**Restraint principle.** This video carries **2 marks total** across 7 cues. Per visual-design §7 "For Wave 4 sketch-layer": only `fast-vs-slow` (vs-mark) and `recap` (underline under 更快) get marks. The five other cues are intentionally clean — `bundle-recall`, `untie-reveal`, `slow-count-ones`, `two-tens`, `three-tens` all deliberately drop marks because the primitives already carry the signal (counting badges, label, tally, bundle slide-in).

---

## §1. Sketch language

### Stroke style
- **Color**: `useStylePalette().ink` (= `INK_WASH_PALETTE.ink` = `#1F2230`). Single teacher-ink color; no second ink.
- **Width**: 4 px nominal.
- **Opacity**: 0.92 (inherited from the SketchMark renderer).
- **Caps / joins**: round, round (per `.agents/styles/ink-wash/strokes.md`).
- **Jitter seed**: per-mark stable seed for deterministic wobble.

### Mark vocabulary (only what this lesson authorizes)
1. **vs-mark** — short crossing strokes forming an angled "vs" glyph. Used by `fast-vs-slow`.
2. **underline** — straight, slightly arched bottom-stroke under a target span. Used by `recap`.

Not used (deliberately): wrap-arc (the bundling action is KP1's, not KP2's), label-arrow (no rename moment in KP2), circles/brackets/sparkles/ticks.

### Animation
- **Draw-on**: stroke-on, 0 → 1 across `drawOnDuration` frames.
- **Hold**: at full opacity until the fade-out window.
- **Fade-out**: opacity 1 → 0 across the last 8 frames of the cue.
- **Boil**: bumped +25% over default per `.agents/styles/ink-wash/strokes.md` (e.g. default boil magnitude 4 → 5 for the underline; default 3 → 4 for the vs-mark). Compensates for the ink-wash filter softening edges.
- **Settle**: climax marks get `settle={{ magnitude: 0.08 }}` per `CAPABILITIES.md#sketch-settle` — the mark lands as a teacher lifting their pen.

---

## §2. Per-cue mark table (CUE-RELATIVE FRAMES)

Cue durations (from `kp2CountingByTensAlignedCues`):
bundle-recall=97, untie-reveal=96, slow-count-ones=106, fast-vs-slow=86, two-tens=91, three-tens=87, recap=77.

| cue id | mark? | mark type | anchor | drawOnRelativeStart (f) | drawOnDuration (f) | fadeOutRelEnd (f) | purpose |
|---|---|---|---|---|---|---|---|
| `bundle-recall` | n | — | — | — | — | — | Clean recall. The bundle's scale-pop entry + the "一个十" label fade-in already say "this is the same bundle from KP1". A mark here would crowd the moment. Skip. |
| `untie-reveal` | n | — | — | — | — | — | The untie gesture (rope wrapProgress 1→0, layout bundle→row) is the focus. A mark would compete. Skip. |
| `slow-count-ones` | n | — | — | — | — | — | Badge-per-stick (1..10) + the StepTally `数十次` pill already carry "ten counts". Per visual-design §3 slow-count-ones forbidden: the KP1-analogue underline was deliberately dropped — adding it would be redundant. Skip. |
| `fast-vs-slow` | y | vs-mark | point (640, 535) — between the two StepTally pills in zone-marks | 50 | 14 | 8 | Crystallizes the contrast: `10 次` (left, dimmed) vs `1 次` (right). Draws on after both tallies have landed (~last 25% of cue). Boil magnitude 4 (ink-wash +25% bump). Settle 0.08. |
| `two-tens` | n | — | — | — | — | — | Per visual-design §7 — the bundles + per-bundle "1" badges + label "两个十" already carry every signal a kid needs. A mark would clutter. Skip. |
| `three-tens` | n | — | — | — | — | — | Same logic as `two-tens`. Three bundles + three badges + "三个十" label — the unit-count of 十 is already legible. Skip. |
| `recap` | y | underline | span (640, 632) → (760, 632) — under the last two glyphs "更快" of the takeaway sentence centered at y=600 at 56px type. y=632 is the underline baseline ~32px below the glyph baseline. | 46 | 18 | 8 | Punctuates the punchline. Underlines just the comparative phrase, not the whole sentence (per visual-design §7.3). Boil magnitude 5 (ink-wash +25% bump). Settle 0.08. |

**Sanity-check** (drawStart + drawDuration ≤ cueDuration, fadeOutRelEnd ≤ holdRemaining):
- fast-vs-slow: draw 50 + 14 = 64 ≤ 86; fade-out 8 ≤ (86-64) = 22 ✓
- recap: draw 46 + 18 = 64 ≤ 77; fade-out 8 ≤ (77-64) = 13 ✓

---

## §3. Climax sketch — `fast-vs-slow`

The vs-mark is THE climax punctuation. The slow-tally pill on the left (10 次, dimmed) and the fast-tally pill on the right (1 次, bright) have already landed; the vs-mark draws on between them, completing the visual "compare these two" cue.

### Gesture
A short angled "vs" glyph — two crossing strokes, anchored at the midpoint between the two pills. Tracks the same timing band as the right-tally completion (the pill settles ~50f, the vs-mark draws on 50→64f, holds 64→78f, fades out 78→86f).

### Cue-relative timing
- `drawOnRelativeStart = 50` → arrives 50f into the 86f cue (~58%).
- `drawOnDuration = 14`
- `fadeOutRelEnd = 8` → fades out across the last 8f of the cue.
- `boil = { holdFrames: 5, magnitude: 4 }` (ink-wash bump from default 3).
- `settle = { magnitude: 0.08 }` per `CAPABILITIES.md#sketch-settle` reach guide for climax marks.

The vs-mark MUST not overlap either tally pill. The pills sit at zone-tally-left center x=370 (right edge ~470) and zone-tally-right center x=910 (left edge ~810). The vs-mark at x=640 sits dead-center in the 470→810 gap, well clear of both.

---

## §4. Recap underline

The underline punctuates the operative phrase "更快" of the takeaway sentence "一捆一捆地数，更快". Per visual-design §7.3, NOT the whole sentence — that would be a second metaphor.

### Anchor
The takeaway label is centered at (640, 600) at fontSize 56. At ~30px advance per CJK glyph, "更快" (last two glyphs) spans roughly x=580→x=720 on the baseline (y≈610). The underline sits at y=632, a clean 22-32px below the glyph baseline.

Composer note: the anchor x-range below (640→760) is slightly right-shifted because the comma "，" before 更快 takes ~20px of advance; the underline is calibrated to track the visible ink of "更快" only.

### Cue-relative timing
- `drawOnRelativeStart = 46` → arrives 46f into the 77f cue (~60%), after the takeaway label has fully faded in.
- `drawOnDuration = 18`
- `fadeOutRelEnd = 8`
- `boil = { holdFrames: 5, magnitude: 5 }` (ink-wash bump from default 4).
- `settle = { magnitude: 0.08 }`.

---

## §5. Restraint audit

Total marks across the video: **2** (well under floor(7 × 0.6) = 4 from the SKILL self-check).

§"unique signal" sentence for each kept mark:
- `fast-vs-slow` vs-mark → carries "compare these two pills" — a contrast operator not yet carried by side-by-side layout alone (kids might read two tally pills as unrelated artifacts; the vs-mark binds them as a comparison). **KEEP.**
- `recap` underline → carries "THIS is the operative phrase" — pointing the ear at the comparative word "更快" inside the longer takeaway sentence. Not carried by the takeaway text alone. **KEEP.**

§"dropped" sentence: per visual-design §7.4 and storyboard, the previous KP1's wrap-arc analogue (during the climax bundling) was deliberately dropped — KP2 does NOT re-teach the bundling action, so a wrap-arc tracing the rope here would be a second metaphor. The first wrap-arc in this curriculum belongs to KP1.

§"kids-eye zone audit":
- vs-mark at (640, 535) — inside zone-marks, NOT inside zone-tally-left (right edge x=620) and NOT inside zone-tally-right (left edge x=660). Vertically between zone-tally and zone-label (zone-label y=580+). ✓
- recap underline at y=632 — sits below the takeaway glyph baseline; tracks under the text rather than overlapping the glyphs. Inside zone-marks (full-bleed). ✓

---

## §6. Composer hand-off

Each mark below maps to a `<TeacherMark>` overlay rendered inside the teaching `<g>` (so the ink-wash modifier filter applies). The composer resolves `drawOnRelativeStart` → absolute frames via `cues[cueId].startFrame + relativeOffset`. The `<TeacherMark>` `strokeColor` is `useStylePalette().ink` (resolves to `#1F2230` under ink-wash).

### Mark list (composer-ready)

| stable id | cue id | mark type | anchor | drawOnRelativeStart (f) | drawOnDuration (f) | fadeOutRelEnd (f) | boil | settle |
|---|---|---|---|---|---|---|---|---|
| `mark-fast-vs-slow-vs` | `fast-vs-slow` | `vs-mark` | point (640, 535) | 50 | 14 | 8 | `{ magnitude: 4, holdFrames: 5 }` | `{ magnitude: 0.08 }` |
| `mark-recap-geng-kuai-underline` | `recap` | `underline` | span (640, 632) → (760, 632) | 46 | 18 | 8 | `{ magnitude: 5, holdFrames: 5 }` | `{ magnitude: 0.08 }` |

Lesson-agnostic rule: every mark in this document is described in cue-relative offsets + primitive props (anchor, mark kind, boil/settle config). No inline SVG, no master-timeline frame literals, no hard-coded hex. The `TeacherMark` primitive is reused unchanged from KP1.
