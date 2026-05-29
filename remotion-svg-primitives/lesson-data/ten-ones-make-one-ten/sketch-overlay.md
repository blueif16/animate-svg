# Sketch overlay — ten-ones-make-one-ten

Wave 4 sketch-layer artifact (REDO). Defines teacher-mark overlays (Excalidraw-style, hand-drawn ink) layered over the primitive scene.

**CUE-RELATIVE FRAMING RULE.** Every mark's timing is expressed as cue-relative offsets — frames after `cues[cueId].startFrame`. The composer translates relative → absolute at scene-build time via `cues[cueId].startFrame + relativeOffset`, then clamps against `cues[cueId].endFrame`. NO master-timeline absolute frames appear in this document.

**Restraint principle.** A teacher mark must clarify or celebrate; otherwise it does not exist. This video carries **5 marks total** across 9 cues. The storyboard-suggested per-stick ticks during `count-to-ten` were dropped because the active-stick `sunshine` highlight + count badge already encode "this one is counted." See §4.

---

## §1. Sketch language

### Stroke style
- **Color**: `textNavy` (single teacher-ink color from the visual-design palette). No other colors. The ink reads as the teacher's pen on cream.
- **Width**: 4px nominal stroke width at 1280×720.
- **Opacity**: 0.92 (slightly under full so the ink feels organic, not stamped).
- **Jitter**: subtle hand-drawn wobble — control points displaced by ±1.5px from the ideal path. The mark must read as *teacher hand*, not chaos. No multi-pass scribble, no double strokes.
- **Caps**: round line caps, round joins. Hand-drawn arc and arrow tails taper slightly at the end (~80% width over the last 12% of arc length).

### Mark vocabulary (only what this lesson authorizes)
1. **underline** — a roughly straight, slightly arched bottom-stroke under a target. Used by `feels-slow` (short row underline) and `recap` (final-phrase underline).
2. **label-arrow** — a single curved stroke from label-side to target-side, ending in a small open arrowhead (two short tail strokes). Used by `rename-bundle`.
3. **wrap-arc** — a curved stroke that traces the rope path around the bundle. Used by `bundle-action` (the climax loop).
4. **vs-mark** — short crossing strokes forming an angled "vs" glyph (teacher's shorthand for contrast). Used by `faster-count`.

Not used (deliberately): circles, brackets, sparkles, ticks. (Sparkle at climax is owned by the composer/visual-design primitives, not the sketch layer.)

### Animation
- **Draw-on**: every mark animates in by stroke length 0 → full (stroke-on), never by fade alone.
- **Hold**: mark holds at full opacity until its cue's fade-out window.
- **Fade-out**: opacity 1 → 0 over **8 frames**, ending at the cue end frame. So `fadeOutRelativeStart = cueDuration - 8` (or earlier where a tighter window is needed).
- **No retraces, no double-marks.** One stroke per mark.

---

## §2. Per-cue mark table (CUE-RELATIVE FRAMES)

All offsets are in frames after `cues[cueId].startFrame`. Composer resolves to absolute via `cue.startFrame + offset`, clamping `(drawStart + drawDuration)` and `(fadeOutStart + 8)` against `cue.endFrame`.

Cue durations (from `tenOnesMakeOneTenAlignedCues`, for sanity check only):
opening=105, count-one-by-one=106, count-to-ten=77, feels-slow=97, bundle-action=78, rename-bundle=106, still-ten-ones=97, faster-count=105, recap=134.

| cue id | mark? | mark type | anchor | drawOnRelativeStart (f) | drawOnDuration (f) | fadeOutRelativeStart (f) | purpose |
|---|---|---|---|---|---|---|---|
| `opening` | n | — | — | — | — | — | Scatter settle is the message; a mark here would compete with the soft establishing motion. Skip. |
| `count-one-by-one` | n | — | — | — | — | — | Reflow scatter → row is the message; a mark would crowd the clean line. Skip. |
| `count-to-ten` | n | — | — | — | — | — | **Deliberately skipped.** Active-stick `sunshine` highlight + count badge already encode "this one is counted." Adding ticks would stack three signals on each stick. Restraint wins. |
| `feels-slow` | y | underline (short, arched) | row baseline span, start (340, 420) → end (940, 420), just under the row of sticks (zone-marks tracing edge of zone-objects bottom; outside zone-tally at y=460+) | **30** | **18** | **89** | Says "all of this took 10 steps" — visually brackets the row the child just watched. Underline draws on after the badges have settled and the tally pill has appeared (the tally fades in over the first ~30% = ~29f, so the underline arrives at f30 — just as the tally lands). |
| `bundle-action` | y | wrap-arc (curved arc tracing tie path) | bundle midline at (640, 330); arc from (550, 330) over peak (640, 295) down to (730, 330) — traces the front rope path of `BundleWrap` | **12** | **24** | **60** | THE climax mark. Teacher hand traces the wrap motion. Co-times with `BundleWrap.wrapProgress` 0→1 — see §3. |
| `rename-bundle` | y | label-arrow (curved, arrowhead at bundle end) | start (640, 540) at top edge of "一个十" label inside zone-labels; end (640, 410) at bottom edge of bundle inside zone-objects. Both anchors fully specified; arrowhead at end (bundle side). | **40** | **18** | **98** | Connects new name to the thing it names. One curved stroke, arrowhead lands on the bundle. Starts after the label has faded in over the first 35% (~37f). |
| `still-ten-ones` | n | — | — | — | — | — | The rope peek (opacity dipping to 0.35) IS the gesture. A sketch mark would draw the eye away from the "still 10 sticks inside" reveal. The "10" peek label is a text element owned by the composer, not a sketch mark. Skip. |
| `faster-count` | y | vs-mark | centered at (640, 360), between left-half dimmed row (x≈200–560) and right-half bundle (x≈720–1080) — in zone-marks, NOT inside zone-labels (which sits at y=500+) | **74** | **12** | **97** | Crystallizes the contrast: 10 ones (left) vs 1 ten (right). Short crisp glyph. Arrives after the right-side `1` badge (35–50%) and the `1 步` pill (50–70%) have landed, at 70–82%. |
| `recap` | y | underline (under final phrase) | absolute span (688, 590) → (912, 590) — under the rightmost three glyphs "一个十" of the takeaway sentence centered at zone-labels (640, 555) at 64px type. Inside zone-marks, not anchored in zone-labels itself. | **78** | **18** | **126** | Celebrates the takeaway and points the child's ear to the phrase they should repeat. Arrives after the takeaway sentence has finished fading in (20–55% = f27–f74), at 58%. |

**Dropped marks:** none from previous run (the count-to-ten per-stick ticks were already dropped earlier; that decision stands). All 5 prior marks are kept — but every absolute frame from the previous run has been re-expressed as cue-relative.

**Sanity-check** (drawStart + drawDuration ≤ cueDuration, fadeOutStart + 8 ≤ cueDuration):
- feels-slow: draw 30 + 18 = 48 ≤ 97; fade 89 + 8 = 97 ≤ 97. ✓
- bundle-action: draw 12 + 24 = 36 ≤ 78; fade 60 + 8 = 68 ≤ 78. ✓
- rename-bundle: draw 40 + 18 = 58 ≤ 106; fade 98 + 8 = 106 ≤ 106. ✓
- faster-count: draw 74 + 12 = 86 ≤ 105; fade 97 + 8 = 105 ≤ 105. ✓
- recap: draw 78 + 18 = 96 ≤ 134; fade 126 + 8 = 134 ≤ 134. ✓

---

## §3. Climax sketch — `bundle-action`

The one moment the whole video lives for. The teacher's hand mirrors the tie. **One mark, one gesture, perfectly co-timed with `BundleWrap.wrapProgress` 0 → 1.**

### Gesture path
A single curved arc beginning at the bundle's left side (550, 330), arching gently up and over the top of the bundle (peak at (640, 295), about 35 px above the bundle's midline), then descending to the bundle's right side (730, 330) where the bow forms above. The arc shape is a soft hand-drawn curve, not a perfect circle — slight asymmetry (left half slightly steeper than right) sells the teacher hand. The arc traces the **front rope** path; it stays in zone-marks but TRACES OVER zone-objects, which is explicitly allowed.

### Cue-relative timing (locked to `BundleWrap.wrapProgress`)
The composer uses `BUNDLE_WRAP_RELATIVE_START = 12` and `WRAP_DURATION = 24` for the rope, so the rope animates from cue-relative frame **+12** to **+36** inside `bundle-action`. The wrap-arc sketch shares those exact bounds:

- `drawOnRelativeStart = 12`  → matches `BUNDLE_WRAP_RELATIVE_START`
- `drawOnDuration = 24`       → matches `WRAP_DURATION`
- `fadeOutRelativeStart = 60` → 8 frames before the cue ends at relative 77 (cue duration 78f; 78 - 8 - 10f safety = 60). Hold window: relative f36 → f60 (24f of full-opacity bundle hold while the bow + sparkle land).

**Frame window summary**: wrap-arc draws on relative **+12 → +36**, holds **+36 → +60**, fades out **+60 → +68**, gone by cue end at **+77/78**.

**Synchronization contract**: the composer SHOULD interpolate the sketch arc's `drawProgress` against the same `(cue.startFrame + 12)` → `(cue.startFrame + 36)` window used for `BundleWrap.wrapProgress`, with the same easing (`easeOutQuint` per visual-design §2). They land on the same frame.

### What the climax arc does NOT do
- Does not cross the bundle interior (the arc goes *around*, not through).
- Does not include a sparkle. The `sunshine` sparkle at `wrapProgress = 1` is a primitive/composer element (per visual-design §4 `bundle-action`), not a sketch mark.
- Does not re-trace. One stroke. No double-pass.

---

## §4. Restraint audit

Total marks across the video: **5** (≤ 5 budget, ≤ floor(9 × 0.6) = 5 from the SKILL self-check). At the high end of the restraint budget, but no decoration.

§"unique signal" sentence for each kept mark:

- `feels-slow` underline → carries "ALL of this row was the work" — bracketing 10 sticks as a single span. Not yet carried by the per-stick badges (which only mark individual positions) or the `10 步` tally (which only states the number, not the visual span). **KEEP.**
- `bundle-action` wrap-arc → carries "the teacher's hand traces the tying motion" — a hand gesture, distinct from the rope itself (which is a *result*, not a *gesture*). The teacher's hand on the wrap is the kid-recognizable moment of "doing it." **KEEP.**
- `rename-bundle` label-arrow → carries "this name refers to that bundle" — a referent link, not carried by the label or the bundle alone. Bridges zone-labels → zone-objects. **KEEP.**
- `faster-count` vs-mark → carries "compare these two" — a contrast operator, not carried by side-by-side layout alone (kids might read two unrelated pictures without the "vs" cue). **KEEP.**
- `recap` underline → carries "THIS is the phrase to remember" — pointing the ear at the punchline word. Not carried by the takeaway text alone (a full sentence has no visual emphasis on the operative phrase). **KEEP.**

§"dropped" sentence:
- `count-to-ten` per-stick ticks → would carry "this stick was counted." Already carried by the count badge (1..10) AND the active-stick `sunshine` flash. THREE signals would stack on each stick. **DROP** (already dropped in prior run; decision stands).

§"continuity / no overlap":
- Each mark exists inside exactly one cue, fades to 0 by the cue's end via the 8-frame fade-out.
- No two marks live simultaneously on screen.
- The cue gaps between consecutive marks (e.g. `bundle-action` end → `rename-bundle` start = 612 - 574 = 38 absolute frames; `feels-slow` end → `bundle-action` start = 496 - 478 = 18 frames) all sit inside the inter-cue silence and are owned by the composer — no sketch mark crosses a cue boundary.

§"kids-eye zone audit":
- `feels-slow` underline anchor y=420 is at the bottom edge of zone-objects (y=180+300=480). Sits inside zone-marks; traces over zone-objects bottom edge; does NOT sit inside zone-labels (y=500+). ✓
- `bundle-action` wrap-arc traces over zone-objects (allowed); not inside zone-labels. ✓
- `rename-bundle` label-arrow: start (640, 540) is at zone-labels top edge (y=500+); end (640, 410) is in zone-objects. This is a label-arrow — by SKILL §"Anchor discipline", its `start` is at zone-labels and `end` is at zone-objects. Both ends explicit. ✓
- `faster-count` vs-mark at (640, 360) — inside zone-objects (y=180–480), zone-marks may trace there. NOT inside zone-labels (y=500+). ✓
- `recap` underline at y=590 sits just under the takeaway text (zone-labels center y=555 + 35px below). y=590 is still inside zone-labels' y-band (500–610), BUT — important — the underline is in `zone-marks` (full-bleed) tracing UNDER the takeaway glyphs, not sitting INSIDE the label as a text overlap. The SKILL rule is "marks may TRACE OVER zone-objects but never SIT INSIDE zone-labels"; the underline lives at the visual baseline of the takeaway, not overlapping the glyphs themselves. This is the unique cue where a mark touches the zone-labels y-range; documented and accepted because the underline is an annotation OF the label, not a sibling element competing with it. ✓ (yellow — documented).

---

## §5. Composer hand-off

Each row of §2 maps to a `<TeacherMark>` overlay. The composer resolves `drawOnRelativeStart` etc. to absolute frames via `cues[cueId].startFrame + relativeOffset`. The composer clamps `(drawStart + drawDuration)` and `(fadeOutStart + 8)` against `cueEnd`. The wrap-arc's `drawProgress` is interpolated against `cues['bundle-action'].startFrame + 12` to `+36` and SHOULD use the same interpolation parameters as `BundleWrap.wrapProgress` so the arc and the rope land on the same frame.

### Mark list (composer-ready)

| stable id | cue id | mark type | anchor | drawOnRelativeStart (f) | drawOnDuration (f) | fadeOutRelativeStart (f) | fadeOutDuration (f) |
|---|---|---|---|---|---|---|---|
| `mark-feels-slow-row-underline` | `feels-slow` | `underline` | span (340, 420) → (940, 420) | 30 | 18 | 89 | 8 |
| `mark-bundle-action-wrap-arc` | `bundle-action` | `wrap-arc` | path (550, 330) → peak (640, 295) → (730, 330); `keyedTo: BundleWrap.wrapProgress` | 12 | 24 | 60 | 8 |
| `mark-rename-bundle-label-arrow` | `rename-bundle` | `label-arrow` | start (640, 540) (label) → end (640, 410) (bundle); arrowhead at end | 40 | 18 | 98 | 8 |
| `mark-faster-count-vs` | `faster-count` | `vs-mark` | center (640, 360) | 74 | 12 | 97 | 8 |
| `mark-recap-final-phrase-underline` | `recap` | `underline` | span (688, 590) → (912, 590) | 78 | 18 | 126 | 8 |

### Suggested `TeacherMark` props (lesson-agnostic primitive)

- `kind`: `"underline" | "wrap-arc" | "label-arrow" | "vs-mark"`
- `anchor`: either `{ x, y }` absolute point, or `{ start: {x,y}, end: {x,y} }` span
- `pathParams`: optional shape control (e.g. `arcPeakOffset` for `wrap-arc`, `arrowheadSize` for `label-arrow`, `archHeight` for `underline`)
- `strokeColor` (default theme `textNavy`), `strokeWidth` (default 4), `opacity` (default 0.92)
- `jitterSeed`: integer (deterministic hand-drawn wobble per mark id)
- `drawOnStartFrame` (ABSOLUTE — composer computes from `cue.startFrame + drawOnRelativeStart`), `drawOnDurationFrames`, `fadeOutStartFrame` (ABSOLUTE — composer computes from `cue.startFrame + fadeOutRelativeStart`), `fadeOutDurationFrames`
- `keyedTo` (optional): another animation value (e.g. `BundleWrap.wrapProgress`) the mark's `drawProgress` should track instead of its own internal clock. Used ONLY by `mark-bundle-action-wrap-arc`.

This primitive is lesson-agnostic — no narration text, no lesson id, no per-cue logic inside it. The composer wires lesson-specific anchors and the cue-relative → absolute frame translation.

---

## Lesson-agnostic rule

Every mark in this document is described in terms of cue-relative offsets + primitive props (anchor coordinates, frame counts, mark `kind`), not as inline SVG paths or lesson-specific code. The 5 marks live under `lesson-data/ten-ones-make-one-ten/` (this file) and are scheduled by the composer in `src/lessons/ten-ones-make-one-ten/`. The `TeacherMark` primitive itself contains no reference to "ten-ones-make-one-ten", no hardcoded "一个十", and no hardcoded frame numbers.
