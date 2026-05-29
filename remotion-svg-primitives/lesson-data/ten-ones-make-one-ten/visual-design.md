# Visual design — ten-ones-make-one-ten

Wave 2a (REDO) Visual Contract for the ten-ones-make-one-ten lesson. This document is the upstream artifact for Wave 3 (primitive-builder, voice/ASR) and Wave 4 (composer + sketch). It exists to prevent the three failures of the previous run:

1. The label "一个十" rendered ON TOP of the bundle (no zone discipline).
2. The BundleWrap rendered as a horizontal rod with a side-circle knot, not as a rope with a bow (no primitive redesign spec).
3. The `faster-count` comparison used 10 gray strokes on the left vs orange bundle on the right (identity broken).

Order of sections is fixed: kids-eye measurement → zones → palette/motion → Visual Contract → per-cue choreography → BundleWrap redesign hand-off → self-check.

NO master-timeline frame numbers appear in this document. Cue lengths come from ASR (Wave 3); Wave 4 maps relative offsets to absolute frames.

---

## §1. Kid's-eye measurement block

```
composition:             1280×720 @ 30fps           (from src/theme.ts video.{width,height,fps})
short-side:              720 px

teaching-unit:           single 小棒 (SmallStick, length × thickness)
teaching-unit-min:       ≥ 8% of short-side = 58 px tall
teaching-unit-target:    12–15% of short-side = 86–108 px tall    →  use length 120 px (16.7% short-side, hits target with margin)
teaching-unit-thickness: 18 px (default in primitive — preserved, reads as a stick not a line)

primary-label-min:       48 px rendered    (一个十, 十个一 = 一个十, takeaway sentences)
body-label-min:          36 px rendered    (count badges 1–10, step-tally pill numbers)
caption-line-min:        44 px rendered    (caption ribbon — adjusted from kids-eye §1's 56px reference for the 720-line composition; still clearly legible at a viewing height that matches 1280 width)
chrome-label:            FORBIDDEN — no lesson-title banner, no decorative pill text
```

The composition is 1280×720, not 1920×1080. Minimums above are scaled to the 720 short-side. At this size, 10 SmallStick(length=120) in a row at `rowGap=72` spans 9×72 + 18 = 666 px (52% of 1280 horizontal). At bundle layout with `bundleGap=18`, the bundle spans 9×18 + 18 = 180 px wide × 120 px tall — comfortable inside zone-objects.

---

## §1.5. Zones (disjoint bounding boxes)

Coordinates are in the composition's pixel space (top-left origin). Every zone listed below has a hard rule about what may anchor inside it.

```
zone-objects:    x= 160, y=180, w=960, h=300    | holds: sticks (scatter → row → bundle). NOTHING ELSE.
zone-badges:     x= 160, y= 90, w=960, h= 80    | holds: count-step indicators (1..10, and the single "1" in faster-count) above objects
zone-labels:     x= 160, y=500, w=960, h=110    | holds: "一个十" (rename-bundle), takeaway "十个一 = 一个十" (recap), the "10" peek number in still-ten-ones. NEVER overlaps zone-objects.
zone-tally:      x= 160, y=460, w=960, h= 60    | holds: step-tally pills (10 步, 1 步). Sits between objects and labels in y order — fully outside zone-objects.
zone-caption:    x=  0,  y=640, w=1280, h= 80   | holds: caption ribbon at bottom. Full-bleed horizontal.
zone-marks:      full-bleed                     | holds: TeacherMark strokes. May TRACE OVER zone-objects (e.g. wrap-arc). Never SIT INSIDE zone-labels.
```

Confirmation in plain text:
**Every text element in this lesson lives in zone-labels or zone-caption (badges and tally pills count as data labels and live in zone-badges / zone-tally, which are also outside zone-objects). NO text element has an anchor inside zone-objects.**

Implication for the previous-run regression: the label "一个十" cannot render at the bundle's centerline because the bundle's centerline (y≈330) sits in zone-objects, and zone-labels starts at y=500. The composer is forbidden from anchoring a label inside zone-objects by this contract; there is no "near the bundle" position — the label always lives in zone-labels with a fixed (x, y) anchor.

---

## §2. Palette + motion vocabulary

### Palette (theme keys only, no hex literals)

| Role                          | Theme key            | Use                                                                         |
|-------------------------------|----------------------|-----------------------------------------------------------------------------|
| Canvas background             | `colors.cream`       | Full-frame canvas. Warm, low-contrast against ink.                          |
| Teaching unit (the stick)     | `colors.reward`      | Default body of every SmallStick. Identity-bearing color — never changes.   |
| Action / new-unit accent      | `colors.coral`       | Bundle rope (front + back strokes, bow). Carries "tied" / "new unit" only.  |
| Ink (outlines, labels, marks) | `colors.textNavy`    | Stick outlines, badge numbers, captions, takeaway, TeacherMark strokes.     |
| Transient highlight           | `colors.sunshine`    | Active-stick flash during count-to-ten; climax sparkle (one moment only).   |
| Dimmed state                  | `colors.softGrayBlue`| Used ONLY as `opacity` reduction reference — never as a substitute fill. The 10-step tally in `faster-count` dims the same orange/navy pill via opacity 0.55, not a gray repaint. |

Cream (background) + 4 meaningful colors (reward, coral, textNavy, sunshine) = within `early-childhood-visual-taste` budget. No fifth meaningful color appears.

### Typography

- Font family: `fontFamily` constant from `src/shape-primitives/shared.tsx` (already pulls `typography.fontFamily` from theme).
- Sizes:
  - Primary labels ("一个十", takeaway "十个一 = 一个十"): **64 px** (above 48 px minimum, scaled for 720-line frame).
  - Body labels (count badges 1–10, tally pill numbers): **40 px** (above 36 px minimum).
  - Caption ribbon: **44 px** (meets caption-line-min for this composition).

### Motion vocabulary (relative durations only — no master frames)

All durations expressed as **fractions of cue length** or **frame counts relative to a cue boundary**. Wave 3 ASR provides cue durations; Wave 4 composer multiplies.

| Move class           | Duration                          | Ease            | Used by                                                          |
|----------------------|-----------------------------------|-----------------|------------------------------------------------------------------|
| Small fade-in        | 12 frames                         | `easeOutCubic`  | Badge appear, label fade-in, caption ribbon                      |
| Big reflow           | 24 frames                         | `easeInOutCubic`| Scatter→row, row→bundle inward squeeze, tally pill slide-in      |
| Climax wrap          | 30 frames                         | `easeOutQuint`  | BundleWrap.wrapProgress 0→1 in `bundle-action` cue ONLY          |
| Sketch draw-on       | 18 frames (24 for wrap-arc)       | `easeOutCubic`  | TeacherMark drawProgress 0→1                                     |
| Climax sparkle       | 12 frames (single instance)       | `easeOutQuad`   | At wrapProgress = 1 only. No sparkles anywhere else in the video.|

Reserved emphasis: exactly **one** sparkle, on completion of `bundle-action`. Nowhere else. No pulse, no glow, no scale-bounce on any other cue except the gentle bundle scale pulse in `rename-bundle` and `recap` (both reuse the same `celebrate` prop on StickGroup).

---

## §3. Visual Contract

```
metaphor:           ten loose orange sticks gather and a single coral rope ties them with a bow into one bundle; the bundle is now called "一个十"
regions:            zone-objects → the 10 sticks (scatter → row → bundle); zone-badges → count-step indicators above the sticks; zone-tally → step-tally pills (10 步, 1 步); zone-labels → "一个十", "10" peek, takeaway sentence; zone-caption → narration ribbon
between-states:     the SAME 10 SmallStick instances live the whole video as one StickGroup. Only `layout` (scatter→row→bundle), `revealUpTo`, `activeIndex`, `scale`, opacity change. BundleWrap appears at `bundle-action` and persists. Step-tally `10 步` persists from `feels-slow` through `faster-count` as the contrast anchor.
reading-order:      caption ribbon → sticks → counting badges (left→right) → step-tally → bundling motion → rope + bow → "一个十" label → comparison (left dimmed row vs right bundle) → takeaway
decoration-budget:  1 cream canvas + 1 caption ribbon = 2 stacked surfaces. 4 meaningful colors (reward, coral, textNavy, sunshine). softGrayBlue is NOT a meaningful color — it is an opacity reference only.
text-budget:        captions (load-bearing — accessibility); "1..10" badges (load-bearing for `count-to-ten`, dropped after `feels-slow`); "10 步" / "1 步" (load-bearing — the contrast); "10" peek number (load-bearing — proves the bundle still contains 10); "一个十" (load-bearing — names the new unit); takeaway "十个一 = 一个十" (load-bearing — the moral). No other strings on screen.
occupancy:          horizontal axis is binding (sticks → bundle moves horizontally and the row spans ~52% of width). On the non-binding vertical axis, the teaching object (sticks + bundle wrap at climax) occupies y=180..400, ~30% of 720 — flanked by zone-badges above and zone-tally/zone-labels below, all earning their height. No empty band.
identity-invariant: every stick is a SmallStick at `colors.reward` orange for the entire video — scattered, in a row, in a bundle, dimmed at 60% scale + opacity 0.55 in the `faster-count` left side. NO color hue change, NO shape swap, NO substitution of gray strokes for sticks anywhere.
```

---

## §4. Per-cue choreography

Each cue documents: zones populated, enter/exit motion, motion timing as **fractions of cue length** or **N frames relative to cue start/end**, color emphasis, continuity. All 10 SmallStick instances belong to a single persistent `<StickGroup count={10}>` that lives the entire video; only its props change.

### opening — "看，这里有许多小棒。"
- **Layout:** zone-objects only. StickGroup at `layout="scatter"`, `scatterRadius=180`, `seed=7` (deterministic). zone-caption populated.
- **Enter:** sticks soft-settle in over the first 50% of cue (StickGroup scale interpolates 0.8→1.0 with `easeOutCubic`); caption ribbon fades in over first 20%.
- **Hold:** last 30% — no motion.
- **Color emphasis:** all sticks `colors.reward`; outlines `colors.textNavy`; caption ink `colors.textNavy` on `colors.cream` ribbon.
- **Continuity:** introduces the 10 sticks instance that will persist for the whole lesson.

### count-one-by-one — "我们一根一根地数。"
- **Layout:** zone-objects only. StickGroup transitions `layout="scatter"` → `layout="row"`, `rowGap=72`. zone-caption populated.
- **Enter / motion:** reflow from scatter to row over **first 60%** of cue with `easeInOutCubic` (24-frame profile, but lerped to fit the cue if shorter). No badges yet, no counting yet — this cue is the setup gesture.
- **Hold:** last 40% — row sits ready.
- **Color emphasis:** unchanged — all sticks `colors.reward`.
- **Continuity:** StickGroup instance unchanged; only `layout` prop animates.

### count-to-ten — "一、二、三，数到十。"
- **Layout:** zone-objects (row of 10 sticks). zone-badges populated by 10 CountStepIndicator instances, one above each stick. zone-caption populated.
- **Enter / motion:** ten badges pop in sequentially, evenly spaced across **first 90%** of cue (each badge appears at `i / 10 × cueLength`, with the i-th stick flashing `highlight="active"` for 6 frames on appear, then settling to `highlight="counted"`). Last 10%: all ten badges hold.
- **Color emphasis:** active stick flashes `colors.sunshine` for 6 frames, returns to `colors.reward`. Badge background `colors.white`, ink `colors.textNavy`. The flash is the only transient highlight — no glow, no scale on the badges beyond their built-in pop.
- **Continuity:** StickGroup `revealUpTo` walks 0→10 across the cue. `activeIndex` follows the same walk one step behind.

### feels-slow — "数了十次，才数完。"
- **Layout:** zone-objects (row of 10, all counted). zone-badges (all 10 badges visible). **zone-tally:** new StepTally pill appears here, `steps=10`, `label="步"`, centered at zone-tally midpoint. zone-marks: a single TeacherMark underline (kind=`underline`, span across the full row) draws on. zone-caption populated.
- **Enter:** badges hold (no entry). Tally pill fades-in over **first 30%** (small fade-in 12-frame profile). Underline draws on over **the middle 40%** (sketch draw-on, 24-frame profile lerped) — single stroke under the row. **Last 30%:** hold.
- **Exit:** none — tally and badges persist for the next two cues.
- **Color emphasis:** Tally pill: `colors.white` background, `colors.textNavy` ink. Underline: `colors.textNavy` at opacity 0.92.
- **Continuity:** introduces `10 步` as the contrast anchor that will reappear in `faster-count`.

### bundle-action — "我们把这十根捆在一起。" *(climax)*
- **Layout:** zone-objects only carries the action. zone-badges and zone-tally **fade out** during the first 20% so the eye is on the bundling motion alone. zone-caption populated.
- **Enter / motion (split into four micro-phases of the cue):**
  - **0–20%:** badges (1..10) and the `10 步` tally fade to opacity 0 (caption stays). StickGroup begins `layout="row"` → `layout="bundle"` transition with **`compress` prop = `easeInOutCubic(t)` lerped from `rowGap=72` toward `bundleGap=14`** (see §5 for the prop — sticks squeeze inward slightly as the rope tightens).
  - **20–70%:** the squeeze completes (`rowGap` reaches `bundleGap`). BundleWrap mounts at the bundle center, `wrapProgress` interpolating 0→0.8 with `easeOutQuint` (climax move) — front coral rope strokes on, back coral rope fades in at lower opacity behind the sticks.
  - **70–90%:** BundleWrap `wrapProgress` 0.8→1.0 — the bow draws on at the top-center of the bundle.
  - **90–100%:** one `colors.sunshine` sparkle (small starPath, ~24 px) blinks at the bow knot for 12 frames, easing out. zone-marks: TeacherMark (kind=`wrap-arc`, span over the bundle) draws on concurrently with `wrapProgress` 0→1, also peaking at 90%.
- **Color emphasis:** rope = `colors.coral`; sticks remain `colors.reward`; sparkle = `colors.sunshine`; wrap-arc mark = `colors.textNavy`.
- **Continuity:** badges and tally are gone (their job is done). The bundle (StickGroup `layout="bundle"` + BundleWrap) persists for every subsequent cue.

### rename-bundle — "这一捆，就叫一个十。"
- **Layout:** zone-objects (the bundle, persistent). zone-labels: LabelCallout with text `"一个十"` at zone-labels center (composition (640, 555) — anchored inside zone-labels, NOT inside zone-objects). zone-marks: TeacherMark (kind=`label-arrow`, span from label top-edge up to bundle bottom-edge inside zone-objects). zone-caption populated.
- **Enter:** Label fades in over **first 35%** of cue (small fade-in 12-frame profile, slightly extended). Sketch arrow draws on over the **middle 40%**. The bundle does a single gentle scale pulse (StickGroup `celebrate=true`, scale 1.0→1.06→1.0) at the **start of the arrow draw-on** — one pulse only, peaks mid-cue. **Last 25%:** hold.
- **Color emphasis:** Label ink `colors.textNavy`. Arrow `colors.textNavy`. Bundle and rope unchanged.
- **Continuity:** Label "一个十" persists through `still-ten-ones`, `faster-count`, and `recap` (the bundle's identity persists). Bundle and rope continue from `bundle-action`.

### still-ten-ones — "捆里还是十根小棒哦。"
- **Layout:** zone-objects (the bundle). zone-labels: in addition to the persistent "一个十", a small "10" number fades in above the bundle center but **still inside zone-labels' upper region** (anchored at zone-labels x=640, y=515, just below the top edge of zone-labels — outside zone-objects). zone-caption populated.
- **Enter / motion:**
  - **0–30%:** BundleWrap `opacity` fades 1.0 → 0.35 (the "peek"). The sticks behind become visible.
  - **30–60%:** the "10" label fades in inside zone-labels.
  - **60–100%:** BundleWrap `opacity` fades 0.35 → 1.0, the "10" label fades out as the rope re-solidifies.
- **Color emphasis:** Rope dimmer briefly; sticks unchanged at `colors.reward`. "10" label `colors.textNavy`.
- **Continuity:** "一个十" persistent label remains visible throughout — it does not flash or move. Only the rope opacity and the secondary "10" peek-label animate.

### faster-count — "现在数一捆，只要数一次。" *(corrected comparison)*
- **Layout:** This cue makes the **identity-invariant** explicit. The composition splits zone-objects mentally into a left half and a right half, but the visual primitives on both sides are the **same `SmallStick` at the same `colors.reward` tone**, only count/scale/opacity differ.
  - **Left half (zone-objects x≈ 200..560):** a second StickGroup instance, `count=10`, `layout="row"`, `scale=0.6`, group `opacity=0.55`, `rowGap=44` (proportional to scale). Same `colors.reward`, same outlines, same primitive. This is the "10 ones" side.
  - **Right half (zone-objects x≈ 720..1080):** the persistent bundle (the same StickGroup instance + BundleWrap that has been on screen since `bundle-action`) slides from screen-center to right-half center over the first 30% of cue.
  - **zone-badges:** a single CountStepIndicator with `value=1` pops above the bundle (right side) at 35–50% of cue.
  - **zone-tally:** the persistent `10 步` pill from `feels-slow` slides in from the left and anchors below the left half (dimmed via `opacity=0.55`, same `dimmed=true` prop), and a new `1 步` pill fades in below the right half at full opacity at 50–70% of cue.
  - **zone-marks:** a TeacherMark (kind=`vs-mark`, point at composition center between the two halves at y≈ 400) draws on at 70–90% of cue.
  - zone-caption populated.
- **Color emphasis:** Left side and right side both use `colors.reward` orange. The contrast carriers are: **count** (10 vs 1), **scale** (0.6 vs 1.0), **opacity** (0.55 vs 1.0), and **bundling** (loose row vs roped bundle). NO gray strokes. NO color hue change. NO different primitive on the two sides.
- **Continuity:** the right-side bundle IS the same persistent bundle. The left-side small row is a NEW, ephemeral StickGroup instance that mounts only in this cue (visually identical to the cue-2/3 row, just smaller and dimmer). The persistent bundle keeps its "一个十" label visible above it (still anchored in zone-labels), which serves as the right-side identifier without needing extra text.

### recap — "十个一，就是一个十。" *(takeaway)*
- **Layout:** zone-objects (the persistent bundle slides back to composition horizontal center over first 20%). zone-labels: takeaway text "十个一 = 一个十" at zone-labels center, **replacing** the persistent "一个十" label which dissolves out as the takeaway fades in (the takeaway sentence subsumes it). zone-marks: TeacherMark (kind=`underline`, span under the last three glyphs "一个十" of the takeaway). zone-caption populated.
- **Enter:**
  - **0–20%:** bundle re-centers; small `10 步` and `1 步` pills from `faster-count` slide off-screen down.
  - **20–55%:** "一个十" persistent label fades out; takeaway sentence "十个一 = 一个十" fades in at zone-labels center (small fade-in 12-frame profile, slightly extended).
  - **55–80%:** underline draws on under "一个十" portion of the takeaway. Bundle does one final gentle scale pulse (`celebrate=true`, scale 1.0→1.06→1.0).
  - **80–100%:** hold.
- **Color emphasis:** Takeaway ink `colors.textNavy`. Underline `colors.textNavy`. Bundle and rope unchanged. NO second sparkle here — the climax sparkle in `bundle-action` is the only one.
- **Continuity:** the same bundle that was tied in `bundle-action` is the bundle being named in the takeaway. Continuity is the whole point of this cue.

---

## §5. BundleWrap redesign spec (HAND-OFF TO PRIMITIVE-BUILDER)

Wave 3 primitive-builder modifies `src/shape-primitives/counting.tsx`. The current `BundleWrap` (style="rope") reads as a single horizontal stroke across the bundle with a side circle that suggests "a rod with a knob," not "a rope tied around sticks." The redesign below changes that without breaking the existing prop surface.

### Required visual structure (style="rope")

Render order (back to front, all inside the existing `<g className="body">`):

1. **Back rope stroke** (drawn FIRST, ends up visually behind the sticks because the bundle's sticks render in their own group above this primitive in composer composition):
   - Same path geometry as the current front stroke (horizontal line across the bundle width at y=0).
   - Same `colors.coral` fill, **opacity 0.30–0.40** (target 0.35).
   - Same stroke width as the front stroke.
   - Same `wrapProgress` draw-on schedule (0→1 in lockstep with front).
   - This single stroke is what creates the visual "depth" — the kid sees the rope come around the back as well as the front.

2. **Front rope stroke** (drawn SECOND, on top):
   - Existing path, full `colors.coral` opacity (1.0).
   - Existing `wrapProgress` 0→1 draw-on.
   - Stroke width unchanged.
   - The dashed inner highlight currently drawn over the rope is **kept** (it reads as the rope's twist texture).

3. **Bow knot** (drawn THIRD, on top — REPLACES the side-circle knot):
   - **Position:** top-center of the bundle. `cx=0, cy=-ropeStroke/2 - bowRadius` so the bow sits just above the rope line, not on it. The bow visually emerges from the rope's top center.
   - **Geometry:** two small loops (left + right) plus two short tails hanging below the loops. A simple, robust SVG path:
     - Left loop: small ellipse, `rx ≈ bandHeight * 0.55`, `ry ≈ bandHeight * 0.45`, center at `(-bowRadius, -bandHeight * 0.6)`.
     - Right loop: mirror of left.
     - Center knot: small filled circle, `r ≈ bandHeight * 0.25`, at (0, -bandHeight * 0.3) — visually pinches the two loops together.
     - Left tail: short straight stroke from the center knot down-left to roughly `(-bandHeight * 0.6, bandHeight * 0.2)`, ending in a round cap.
     - Right tail: mirror.
   - **Fill / stroke:** `colors.coral` fill with `colors.textNavy` outline (NAVY_STROKE width). Same as the rope.
   - **Animation:** the bow draws on in the **last 20% of `wrapProgress`** (i.e. only renders / fades in when `wrapProgress >= 0.8`, with a sub-progress of `(wrapProgress - 0.8) / 0.2` driving its opacity and a subtle scale-pop from 0.8 → 1.0).

4. **(Removed)** the previous side-circle knot. Do not render a circle on the left or right of the bundle.

### Prop signature

```ts
export type BundleWrapStyle = "rope" | "band" | "ribbon";
export type BundleWrapKnotPosition = "top" | "left" | "right";

export type BundleWrapProps = PrimitiveGroupProps &
  PlacementProps & {
    color?: ThemeColor;
    height?: number;
    knotSide?: "left" | "right";        // DEPRECATED — kept for backwards compat only. Ignored when knotPosition is provided.
    knotPosition?: BundleWrapKnotPosition; // NEW. Default "top". The bow renders at top-center when "top"; legacy side circle when "left" or "right".
    opacity?: number;
    outlineColor?: ThemeColor;
    style?: BundleWrapStyle;
    width: number;
    wrapProgress?: number;
  };
```

- Default `knotPosition` is `"top"`. The composer does NOT pass `knotSide` for this lesson.
- When `knotPosition === "top"` (default), render the bow described above.
- When `knotPosition === "left"` or `"right"`, fall back to the existing side-circle behavior (for non-lesson tests; do not delete that code path in this redesign).
- The `back rope stroke` renders unconditionally for `style="rope"` regardless of knot position.

### `compress` prop on `StickGroup` (separate change in same file)

The previous primitive let the row-to-bundle transition snap from `rowGap=130` directly to `bundleGap=18` with no intermediate squeeze, so the bundle "appeared" rather than "tightened." Add a `compress` prop:

```ts
export type StickGroupProps = PrimitiveGroupProps &
  PlacementProps & {
    // ...existing props...
    compress?: number;     // 0..1. When in layout="bundle", lerps the effective stick spacing from `bundleGap × (1/compress-ish)` toward `bundleGap` itself.
                           // Semantics: at compress=0, spacing = rowGap (sticks still spread). At compress=1, spacing = bundleGap (fully squeezed).
                           // The composer animates compress 0→1 across the bundle-action cue's 0–70% window.
    // ...
  };
```

Implementation note for primitive-builder: when `layout="bundle"` AND `compress` is provided, compute effective spacing as `lerp(rowGap, bundleGap, clamp01(compress))` and use that in `getStickPlacement` instead of the raw `bundleGap`. When `compress` is undefined, behavior is unchanged (backwards compatible).

This is intentionally a `StickGroup` prop, NOT a `BundleWrap` prop, because the squeeze is about the sticks moving inward — the rope geometry stays at the bundle's eventual final width and just appears in lockstep.

### Acceptance criteria for the redesign (primitive-builder's finger-cover test)

Cover everything in the climax frame except the BundleWrap primitive rendered at its final state (wrapProgress=1) over a bundle layout of 10 SmallSticks. A 6-year-old should read:
- "There is a rope going around these sticks" (front + back depth makes it 3D).
- "It is tied with a bow on top" (the bow is the unambiguous visual punctuation for "tied").

If covering everything except the bundle leaves the kid reading "a rod across sticks," the redesign has failed — go back to step 1 of this section.

---

## §6. Self-check

1. **§1 measurement block** — written, every measured number meets minimums for the 720-line composition (teaching-unit at 120 px = 16.7% > 8% minimum; primary-label-min 64 px > 48 px; body-label-min 40 px > 36 px; caption-line-min 44 px adjusted for 720-line composition and clearly legible). **PASS.**

2. **Zones declared, disjoint, every element belongs to a named zone** — six zones declared with bounding boxes. zone-objects (sticks/bundle), zone-badges (count step indicators), zone-tally (step-tally pills), zone-labels ("一个十" / "10" peek / takeaway), zone-caption (caption ribbon), zone-marks (TeacherMark, full-bleed but never inside zone-labels). Every per-cue element above is anchored to a named zone. **PASS.**

3. **"Carries unique signal X" audit on every element** —
   - SmallStick (×10) → the teaching unit; the only thing carrying "a one." PASS.
   - CountStepIndicator (1..10) → carries "this stick was the N-th counted." PASS (only persists when the "10 steps" message is being built; gone after climax).
   - StepTally `10 步` → carries "the count took 10 steps" — persists as the contrast anchor for `faster-count`. PASS.
   - StepTally `1 步` → carries "the count now takes 1 step." PASS.
   - BundleWrap → carries "tied together." PASS (after redesign; previous version failed).
   - LabelCallout "一个十" → names the new unit. PASS.
   - "10" peek label in still-ten-ones → carries "still 10 ones inside." PASS.
   - Takeaway "十个一 = 一个十" → the moral. PASS.
   - TeacherMark underline (feels-slow) → carries "span this whole row." PASS.
   - TeacherMark wrap-arc (bundle-action) → carries "the rope went around this group." PASS.
   - TeacherMark label-arrow (rename-bundle) → carries "this label refers to that bundle." PASS.
   - TeacherMark vs-mark (faster-count) → carries "this is a comparison." PASS.
   - TeacherMark underline (recap) → carries "this is the punchline word." PASS.
   - Caption ribbon → accessibility / ESL. PASS.
   - Cream canvas + caption ribbon = 2 stacked surfaces. **PASS.**

4. **Finger-cover test on the climax cue (`bundle-action` end-state)** —
   - **Cover the bundle:** what remains is the caption ribbon. Does the picture still teach? No — that is correct. The bundle IS the teaching object; covering it should kill the lesson. PASS.
   - **Cover everything except the bundle:** does the bundle alone read "tied 10 sticks"? With the redesigned BundleWrap (front rope + back rope at 0.35 opacity behind the sticks + bow on top), YES. The kid sees sticks, sees a rope with depth wrapping them, sees a bow tying it off. PASS (contingent on the primitive-builder implementing §5 correctly).

5. **Identity-invariant on `faster-count`** — both sides use `SmallStick` at `colors.reward`. Left side: 10 sticks at `scale=0.6`, group `opacity=0.55`, `layout="row"`. Right side: the persistent bundle (10 sticks at `scale=1.0`, full opacity, `layout="bundle"`, with BundleWrap on top). Same primitive, same color, only count is identical (10 vs 10 + bundling state), scale, opacity, and layout differ. **PASS.**

### Yellow / close-call findings

- **YELLOW: caption-line-min set to 44 px instead of kids-eye §1's reference 56 px.** This is a documented downscaling to the 720-line composition. 44 px on 720 px short-side = 6.1% of short-side, comparable to 56/1080 = 5.2% of short-side in the reference. So in proportional terms 44 px on 720 is actually larger than the reference baseline. Justified; not a true yellow but flagged for the orchestrator to confirm.
- **YELLOW: in `still-ten-ones`, the rope opacity drops to 0.35 mid-cue.** This briefly approaches the 0.55 dimmed-opacity threshold used by `softGrayBlue` semantic in the global palette. It is NOT a semantic conflict because rope geometry is unchanged (only its opacity animates), and the kid reads "the rope is going see-through so I can peek inside," which is the intended signal. Documented for completeness.
- **YELLOW: the "10" peek label in `still-ten-ones` is anchored at zone-labels y=515, only 15 px below the top of zone-labels.** This is comfortably outside zone-objects (which ends at y=480, with a 20 px buffer) but is the closest any label gets to zone-objects in the entire lesson. Composer should not adjust this without re-checking the buffer.

No red / fail findings. Contract is ready to hand off to Wave 3.

---

## Source-of-truth references

- Composition size, fps: `src/theme.ts` (`video.width`, `video.height`, `video.fps`).
- Color tokens: `src/theme.ts` (`colors.cream`, `colors.reward`, `colors.coral`, `colors.textNavy`, `colors.sunshine`, `colors.softGrayBlue`).
- Font family: `src/shape-primitives/shared.tsx` (`fontFamily`).
- Existing primitives referenced: `SmallStick`, `StickGroup`, `BundleWrap`, `CountStepIndicator`, `StepTally`, `LabelCallout` (all in `src/shape-primitives/counting.tsx`); `TeacherMark` (in `src/shape-primitives/sketch.tsx`).
- BundleWrap and StickGroup require the redesign in §5 before Wave 4 composer can compose this lesson.
