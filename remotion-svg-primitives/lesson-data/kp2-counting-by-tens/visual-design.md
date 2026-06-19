# Visual Design Contract — kp2-counting-by-tens

## 1. Kid's-Eye Measurement Block

```
composition:             1280×720 @ 30fps
short-side:              720 px

teaching-unit:           single 小棒 (SmallStick)
teaching-unit-min:       ≥ 8% of short-side = 58 px
teaching-unit-target:    12–15% of short-side = 86–108 px (use length 120 px = 16.7% for row and bundles)
teaching-unit-thickness: 18 px (reads as a stick, not a thin line)

child-readable-text-min: 36 px rendered (floor for small labels/counts)
primary-label-min:       48 px rendered (focus labels: 一个十, 两个十, takeaway)
body-label-min:          36 px rendered (badges, step-tally numbers; use CountStepIndicator size 60 to ensure 37 px text)
caption-line-min:        48 px rendered (caption ribbon)
separation-gap-min:      ≥ 6% of short-side = 43 px (minimum gap between co-present bundles to read as separate)
chrome-label:            FORBIDDEN
```

## 2. Spatial Zones
All bounding boxes are in 1280×720 composition space, with top-left origin.

- `zone-stage` (sticks/bundles): `x=120, y=180, w=1040, h=300`
- `zone-badges` (above-stick counts): `x=120, y=90, w=1040, h=80`
- `zone-tally-left` (slow-count tally): `x=120, y=500, w=500, h=70`
- `zone-tally-right` (fast-count tally): `x=660, y=500, w=500, h=70`
- `zone-label` (focus text callouts): `x=120, y=580, w=1040, h=60`
- `zone-caption` (narration/captions): `x=0, y=640, w=1280, h=80`
- `zone-marks` (sketch mark overlays): full-bleed (may trace over stage but never sit inside label/caption)

### Pairwise Disjoint 1D Verification
Vertical spans of all co-present zones are non-overlapping:
- `zone-badges` `[90, 170]` < `zone-stage` `[180, 480]` < `zone-tally-*` `[500, 570]` < `zone-label` `[580, 640]` < `zone-caption` `[640, 720]`
- Horizontally, `zone-tally-left` `[120, 620]` and `zone-tally-right` `[660, 1160]` are separated by a 40 px gap.
- All pairwise intersections are empty. Overlap is zero.

---

## 3. Global Visual Contract

- **Metaphor:** Ten loose sticks counted slowly one-by-one, contrasted against a single fast count of a bundled ten; as more pre-tied bundles arrive, each still costs exactly one count of 十.
- **Regions:** `zone-stage` holds stick row or bundles; `zone-badges` holds step indicators; `zone-tally-left` and `zone-tally-right` hold the slow (10 steps) and fast (1 step) tally comparison pills; `zone-label` holds unit names and takeaway.
- **Between-states:** The 10 sticks inside the persistent bundle live the entire video. The same `StickGroup` instance transitions from bundle to row (untie) and row to bundle (re-tie). Extension bundles are static siblings of the same primitive class.
- **Reading-order:** Caption → `zone-stage` (sticks/bundle) → `zone-badges` (numbers) → `zone-tally-*` (comparison) → `zone-label` (moral text).
- **Decoration-budget:** 1 cream background + 1 caption ribbon = 2 surfaces total. Max 4 meaningful colors.
- **Text-budget:** "一个十", "两个十", "三个十", "1..10" step badges, "数十次"/"数一次" pill labels, and takeaway "一捆一捆地数，更快。". No decorative headers or logos.
- **Occupancy:** Binding axis is horizontal. At fullest cue (`slow-count-ones`), 10 loose sticks span 1170 px (91% width). In extensions (`three-tens`), 3 bundles spaced 200 px apart span ~940 px (73% width). Non-binding vertical occupancy of teaching elements spans from `y=90` to `y=640` (76% of canvas height).
- **Identity-invariant:** Every stick is a `SmallStick` in `colors.reward` (orange). No repainting to gray or changing opacity across states; loose sticks and bundled sticks use the exact same color and width.

---

## 4. Per-Cue Visual Contract & Motion Budget

| Cue | Pedagogy Discovery | visualMotionSeconds | Allowed Change | Forbidden | Primitive Props |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **intro** | None (Topic introduction) | **2.0s** | `LessonIntroCard` title fades in/out; main stage fades on showing the first centered bundle. | No characters or extra decorations. | `StickGroup`: `count=10, layout="bundle"`, `BundleWrap`: `wrapProgress=1, style="rope"` |
| **bundle-recall** | Bundle represents a single unified group "一个十". | **2.5s** | First bundle enters with a gentle scale-pulse (0.92→1.0); label "一个十" fades in. | No counts or tallies present. | `StickGroup`: `layout="bundle", celebrate=true`, `LabelCallout`: `text="一个十", progress=0→1` |
| **untie-reveal** | "一个十" is composed of exactly ten individual ones. | **3.0s** | Rope fades out and `StickGroup` layout transitions bundle→row in lockstep; label fades out. | No badges or tallies appear. | `StickGroup`: `layout="bundle"→"row"`, `BundleWrap`: `wrapProgress=1→0, opacity=1→0` |
| **slow-count-ones** | Counting loose objects one-by-one is slow and repetitive. | **5.0s** | `activeIndex` walks 0..9, count indicators pop 1..10; slow tally pill fades in left. | No second tally or fast badge. | `StickGroup`: `activeIndex=0..9`, `CountStepIndicator`: `value=i+1, size=60`, `StepTally`: `steps=10` |
| **fast-vs-slow** | Bundling ten loose ones lets us count them in only one count. | **4.0s** | Row squeezes to bundle, rope ties (0→1 climax ease); slow tally dims/slides left; fast tally + vs-mark appear. | No repainted gray sticks; only one climax sparkle at knot. | `StickGroup`: `compress=0→1, layout="bundle"`, `BundleWrap`: `wrapProgress=0→1`, `StepTally` (slow): `dimmed=true` |
| **two-tens** | Adding one more bundle gives us "两个十" using same sequence. | **3.0s** | Tallies/vs-mark/badges fade out; persistent bundle slides left, atomic second bundle slides in. | No re-bundling animation on bundle B. | `StickGroup` ×2: `layout="bundle"`, `CountStepIndicator` ×2: `value=1`, `LabelCallout`: `text="两个十"` |
| **three-tens** | Counting pattern continues: adding another bundle gives "三个十". | **3.0s** | Existing bundles slide left; atomic third bundle slides in; label cross-fades to "三个十". | No re-bundling animation on bundle C. | `StickGroup` ×3: `layout="bundle"`, `CountStepIndicator` ×3: `value=1`, `LabelCallout`: `text="三个十"` |
| **recap** | Counting by tens is much faster and more convenient than ones. | **4.0s** | Label cross-fades to takeaway; three bundles pulse sequentially; underline draws on "更快". | No new sparkles or tallies. | `StickGroup` ×3: `celebrate=true` (staggered), `TeacherMark`: `kind="underline"`, `LabelCallout`: `takeaway` |

---

## 5. Palette & Motion Vocabulary

### Palette (Theme Keys from `src/theme.ts`)
- **`cream`** (`#FFF7E6`): Warm, low-contrast canvas background.
- **`reward`** (`#FFB84D`): Orange. Teaching unit color for all `SmallStick` bodies.
- **`coral`** (`#FF8A65`): Action accent. Applied to `BundleWrap` rope and bow.
- **`textNavy`** (`#24324B`): Outlines, text labels, step indicators, and sketch marks.
- **`sunshine`** (`#FFD85A`): Transient highlight during counting; single climax sparkle.
- **`softGrayBlue`** (`#B5C0D0`): Opacity reference only for `StepTally` `dimmed={true}`.

### Motion Vocabulary
- **Small fade-in / pop:** 12 frames, `EASE.outCubic`. Used for count badges and label fade-ins.
- **Big reflow / slide:** 24 frames, `EASE.inOutCubic`. Used for stick layouts and bundle entrances.
- **Climax tie:** 30 frames, `EASE.outQuint`. Used only for `BundleWrap` wrapping in `fast-vs-slow`.
- **Sketch draw-on:** 18 frames default (24 frames for arc/underline), `EASE.outCubic`.
- **Moving-hold:** Every resting group uses `<Breathe>` (`bpm={15}, amplitudeScale={0.005}`) to prevent frozen frames.

---

## 6. Reuse-Primitive Inventory

We reuse registered components from the registry. No new primitives are authored.

- **`SmallStick`**: Represents a single orange unit stick.
- **`StickGroup`**: Groups 10 sticks and handles procedural layout (row ↔ bundle, spacing, activeIndex, compress).
- **`BundleWrap`**: Renders the rope + bow wrapping the sticks, driven by `wrapProgress` (0→1).
- **`CountStepIndicator`**: Displays numbers above active sticks or bundles. Mounted with `size={60}` to keep child text readable.
- **`StepTally`**: Rounded step pill showing "数十次" (steps=10) or "数一次" (steps=1). Supports `dimmed={true}`.
- **`LabelCallout`**: Focus label displaying Chinese text Callouts centered horizontally in `zone-label`.
- **`TeacherMark`**: Overlays ink strokes. Uses `kind="vs-mark"` (point-anchored) and `kind="underline"` (span-anchored).
- **`LessonIntroCard`**: Full-screen opening card presenting the topic text.
- **`<Breathe>`**: Wrap-helper providing subtle 15 bpm moving-hold scale-pulses for rule #6 compliance.

---

## 7. Terse Anti-Pattern List

- **Occluded text:** Never render sticks, characters, or sketch marks over readable text (labels, title, captions).
- **Stapled pictures:** Do not show "10 ones vs 1 ten" side-by-side using different shapes or colors; they must share stick primitive identity.
- **Frame literals:** No hardcoded frame numbers in scene code; every frame must derive from `cues[id].startFrame + offset`.
- **Emphasis saturation:** Do not add sparkles, glows, or scale pulses to every cue; reserve the single sparkle for the climax re-tie.
- **Re-rendering the teaching unit:** Do not destroy and recreate the ten sticks between cues; they must remain the same `StickGroup` instance.
- **Color as decoration:** Do not repaint the 10 sticks on the slow side to gray to represent "dimmed" or "inactive" status; keep them in `reward` orange.
- **Nested surfaces:** Do not exceed 2 stacked surfaces between the cream background and the teaching stick.
