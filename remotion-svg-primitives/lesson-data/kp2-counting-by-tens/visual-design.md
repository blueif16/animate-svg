# Visual design — kp2-counting-by-tens

Wave 2a Visual Contract for KP2 of the "11~20的认识" sequence. Upstream artifact for Wave 3 (primitive-gap-scan, voice/ASR) and Wave 4 (composer + sketch-layer). NO master-timeline frame numbers anywhere — cue lengths come from ASR in Wave 3; Wave 4 maps relative offsets to absolute frames.

Order: identity recall → kids-eye measurement → zones → palette/motion → Visual Contract → per-cue choreography (cue-relative phases) → finger-cover test → one-metaphor check → risk flags → self-check.

---

## §0. Visual identity recall

KP2 inherits KP1's palette and primitive identity **unchanged**. The same `colors.cream` (`#FFF7E6`) canvas, the same `colors.reward` (`#FFB84D`) orange `SmallStick`, the same `colors.coral` (`#FF8A65`) rope on `BundleWrap`, the same `colors.textNavy` (`#24324B`) ink on captions, labels, and `TeacherMark` strokes. A KP2 bundle looks pixel-identical to a KP1 bundle. The child recognizes "these are the same sticks I just saw."

---

## §1. Kid's-eye measurement block

```
composition:             1280×720 @ 30fps           (from src/theme.ts video.{width,height,fps} — identical to KP1)
short-side:              720 px

teaching-unit:           single 小棒 (SmallStick: length × thickness)
teaching-unit-min:       ≥ 8% of short-side = 58 px tall
teaching-unit-target:    12–15% of short-side = 86–108 px tall    →  use length 120 px (16.7% short-side, identical to KP1) for the primary row/bundle.
teaching-unit-thickness: 18 px (primitive default — preserved; reads as a stick, not a line)

primary-label-min:       48 px rendered    (一个十, 两个十, 三个十, takeaway)
body-label-min:          36 px rendered    (1..10 count badges, step-tally pill numbers)
caption-line-min:        44 px rendered    (caption ribbon — same scaled minimum as KP1 for the 720-line composition; proportionally larger than kids-eye §1's 56/1080 reference)
chrome-label:            FORBIDDEN — no lesson-title banner, no decorative pill text

motion-budget (per cue type, MIN sustained on-screen so a 6yo can follow):
  slow-count cue (slow-count-ones):       ≥ 4.5 s — the ten counts must each breathe (~0.35 s per stick)
  climax cue   (fast-vs-slow, recap):     ≥ 3.5 s — re-bundle gesture + side-by-side hold
  extension cue (two-tens, three-tens):   ≥ 2.5 s — atomic bundle slides in, count badge pops, label settles
  setup/recall cue (bundle-recall, untie-reveal): ≥ 2.0 s — single gesture, then hold
  (Wave 3 ASR will produce the actual durations; these are the floor audio-captions must respect.)

max simultaneous semantic groups on screen:
  - 3 in extension cues   (3 bundles + count badges + 三个十 label is the upper bound; no contrast pills here)
  - 4 in the climax cue   (slow tally + bundle + fast tally + vs-mark — and only here; everything else is dropped)
  Hard cap: 4. If a cue needs a 5th group, something else must exit first.
```

KP1's 10 SmallStick(length=120) in a row at `rowGap=130` spans 9×130 = 1170 px (just inside 1280 horizontal with a 55 px margin each side). KP2 will only show the 10-row in `untie-reveal` and `slow-count-ones`; from `fast-vs-slow` onward the row collapses back into bundles and the canvas shows up to 3 bundles spaced apart (each bundle at `bundleGap=18` is ~180 px wide; 3 bundles × 180 + 2 gaps × 200 ≈ 940 px, fits comfortably).

---

## §1.5. Zones (disjoint bounding boxes, composition pixel space, top-left origin)

```
zone-stage:      x= 120, y=180, w=1040, h=300   | holds: SmallStick / StickGroup (row or bundles) + BundleWrap. NOTHING ELSE. Identity-invariant elements live here.
zone-badges:     x= 120, y= 90, w=1040, h= 80   | holds: CountStepIndicator above sticks/bundles (the 1..10 in slow count, and the per-bundle "1" badges).
zone-tally-left: x= 120, y=500, w= 500, h= 70   | holds: the slow StepTally pill (steps=10) — appears in slow-count-ones, persists into fast-vs-slow as the left contrast anchor.
zone-tally-right:x= 660, y=500, w= 500, h= 70   | holds: the fast StepTally pill (steps=1) — appears in fast-vs-slow only as the right contrast anchor.
zone-label:      x= 120, y=580, w=1040, h= 60   | holds: LabelCallout text (一个十 / 两个十 / 三个十 / takeaway). NEVER overlaps zone-stage.
zone-caption:    x=  0,  y=640, w=1280, h= 80   | holds: caption ribbon at bottom, full-bleed.
zone-marks:      full-bleed                     | holds: TeacherMark strokes. May TRACE OVER zone-stage (wrap-arc retie, dot above bundle). NEVER sits inside zone-label.
```

Confirmation: **every text element in this lesson lives in zone-label, zone-caption, zone-badges, zone-tally-left, or zone-tally-right.** Badge / pill text counts as data-label, anchored in its own zone (which is outside zone-stage). NO text element ever anchors inside zone-stage.

`zone-tally-left` and `zone-tally-right` are deliberately declared as two named zones (rather than one merged zone) — this hard-codes the side-by-side contrast at the contract level. The slow pill cannot drift into the right; the fast pill cannot drift into the left.

Identity-invariant elements (the bundles — both the persistent KP1 bundle and the two extension bundles) occupy `zone-stage` across cues `bundle-recall`, `untie-reveal` (the same sticks, just relaid out), `fast-vs-slow`, `two-tens`, `three-tens`, `recap`. Position inside zone-stage shifts (center → split-row → center → left-of-three → center-of-three → center) but the zone never changes.

---

## §2. Palette + motion vocabulary

### Palette (theme keys only; never inline hex)

| Role                          | Theme key            | Use                                                                         |
|-------------------------------|----------------------|-----------------------------------------------------------------------------|
| Canvas background             | `colors.cream`       | Full-frame canvas. Identical to KP1.                                        |
| Teaching unit (stick)         | `colors.reward`      | Every SmallStick body. Identity-bearing — NEVER changes hue across KP1↔KP2. |
| Action / new-unit accent      | `colors.coral`       | `BundleWrap` rope + bow. Same as KP1.                                       |
| Ink (outlines, labels, marks) | `colors.textNavy`    | Stick outlines, badge numbers, captions, labels, all TeacherMark strokes.   |
| Transient highlight           | `colors.sunshine`    | Active-stick flash during `slow-count-ones`; climax sparkle in `fast-vs-slow` (one moment only). |
| Dimmed reference (opacity ref)| `colors.softGrayBlue`| ONLY as an opacity reference for `StepTally` `dimmed=true`. Never repaints a stick. |

Cream + 4 meaningful colors (reward, coral, textNavy, sunshine) = within `early-childhood-visual-taste` budget. No fifth meaningful color appears.

### Typography (theme `fontFamily` from `src/shape-primitives/shared.tsx`)

- Primary labels (一个十 / 两个十 / 三个十 / takeaway "一捆一捆地数，更快。"): **`LabelCallout` `fontSize=56`** (above 48 px minimum; matches KP1's identity scale for "一个十").
- Body labels (badges 1..10 in slow count, single "1" badges on bundles): **`CountStepIndicator` `size=56`** (font scales internally; >36 px minimum easily met).
- Step-tally pills: **`StepTally` `size=64`** with `label` slot ("数十次" / "数一次" — see §3 below) — pill numeric reads at ~40 px, well above the 36 px minimum.
- Caption ribbon: 44 px (load-bearing; matches KP1).

### Motion vocabulary (cue-relative durations only — NO master frames)

| Move class           | Duration              | Ease            | Used by                                                          |
|----------------------|-----------------------|-----------------|------------------------------------------------------------------|
| Small fade-in        | 12 frames             | `easeOutCubic`  | Badge appear, label fade-in, caption ribbon, count-step pop      |
| Big reflow           | 24 frames             | `easeInOutCubic`| Row→bundle re-tie squeeze, bundle slide-in, label cross-fade     |
| Climax re-tie        | 30 frames             | `easeOutQuint`  | BundleWrap.wrapProgress 0→1 in `fast-vs-slow` ONLY               |
| Sketch draw-on       | 18 frames (24 for arc)| `easeOutCubic`  | TeacherMark drawProgress 0→1                                     |
| Climax sparkle       | 12 frames (single)    | `easeOutQuad`   | `fast-vs-slow` re-tie completion. Nowhere else in the video.     |

Reserved emphasis: exactly **one** sparkle (`fast-vs-slow`, on re-tie completion) and exactly **two** gentle scale pulses (`bundle-recall` entry, and `recap` left→right pulse across the three bundles). No additional pulse/glow/flash on any other cue.

---

## §3. Visual Contract (per cue)

The metaphor and global contract:

```
metaphor:           the same 10 ones counted two ways — ten counts loose vs one count when bundled — then more bundles arrive and each one still costs only "one count of 十"
regions:            zone-stage → sticks (bundle ↔ row ↔ multi-bundle); zone-badges → CountStepIndicator; zone-tally-left → slow StepTally (steps=10); zone-tally-right → fast StepTally (steps=1); zone-label → LabelCallout text (一个十 / 两个十 / 三个十 / takeaway); zone-caption → narration ribbon
between-states:     the persistent bundle (the SAME StickGroup instance carrying KP1's identity) lives the whole video. Its `layout` and ancillary props change — it does NOT get destroyed and recreated. In extensions, additional StickGroup instances mount as pre-tied bundles (atomic, no re-bundling animation).
reading-order:      caption → bundle (or row) in zone-stage → count badges → step-tally → label
decoration-budget:  cream canvas + caption ribbon = 2 stacked surfaces. 4 meaningful colors. softGrayBlue is opacity reference only.
text-budget:        captions (load-bearing — accessibility); "1..10" badges (load-bearing in slow-count-ones, gone after fast-vs-slow); "10 步" / "1 步" (load-bearing — the contrast); "一个十" / "两个十" / "三个十" (load-bearing — names the unit count); takeaway "一捆一捆地数，更快。" (load-bearing — the moral). No other strings.
occupancy:          horizontal axis is binding (bundles spread, row spans). Bundle-only states: persistent bundle at ~180 px / 14% horizontal of zone-stage centered. Row state (untie-reveal, slow-count-ones): 1170 px / ~92% of zone-stage width. Three-bundle state (three-tens, recap): ~940 px / ~90% of zone-stage width. Non-binding vertical axis: zone-stage 300 px ≈ 42% of 720, flanked by badges above, tally + label + caption below. No empty band.
identity-invariant: every stick is a SmallStick at `colors.reward` for the entire video AND identical to KP1's stick. NO color hue change, NO opacity-as-substitute, NO different primitive on the comparison sides. The persistent KP1 bundle remains the same primitive instance through all 7 cues.
```

Per-cue contract rows (anchor element, semantic groups, allowed change, forbidden, identity-invariant carriers, primitive props):

### bundle-recall
- **Purpose**: Child recognizes "this is the same bundle from KP1 — 一个十".
- **Anchor element**: the tied bundle, centered in zone-stage.
- **Semantic groups on screen**: `persistent-bundle` (StickGroup `layout="bundle"` + BundleWrap), `label-一个十` (LabelCallout in zone-label).
- **Allowed change vs previous cue**: this is cue 1 — the bundle enters via a single gentle scale-pulse (scale 0.92→1.00) over the first ~25% of cue; label fades in middle 30%; hold last 45%.
- **Forbidden**: no counting badges, no tallies, no sketch marks. Clean recall only.
- **Identity-invariant**: the bundle that appears here IS the persistent bundle that lives every subsequent cue. Same SmallStick orange, same coral rope+bow.
- **Primitive props used**:
  - `StickGroup` `count={10}`, `layout="bundle"`, `bundleGap={18}`, `celebrate={true}` (driving the entry scale-pulse), `color="reward"`.
  - `BundleWrap` `style="rope"`, `width={ /* bundle width */ }`, `knotPosition="top"`, `wrapProgress={1}` (held), `opacity={1}`.
  - `LabelCallout` `text="一个十"`, `appearStyle="fade"`, `progress={ /* 0→1 */ }`, `fontSize={56}`.

### untie-reveal
- **Purpose**: Open the bundle, show 10 ones inside, set up the count.
- **Anchor element**: the rope (it disappears) and the sticks (they spread).
- **Semantic groups on screen**: `persistent-bundle` (the SAME StickGroup, transitioning `bundle → row`), `label-一个十` (still visible briefly, then fading).
- **Allowed change vs bundle-recall**: BundleWrap `opacity` 1→0 (or `wrapProgress` 1→0) AND StickGroup `layout="bundle" → "row"` happen in lockstep over the first ~70% of cue. The label "一个十" fades out across the first 40% (it has served its recall purpose — it returns in `fast-vs-slow` and beyond, but for the slow-count beats the row is unlabeled to keep the eye on the sticks). Last ~30% holds the row.
- **Forbidden**: no badges yet (counting hasn't started). No tally yet. No sketch marks.
- **Identity-invariant**: the 10 sticks visible at the end of this cue ARE the 10 sticks that were inside the bundle in `bundle-recall`. Same primitive instance, same orange.
- **Primitive props used**:
  - `StickGroup` animated `layout="bundle" → "row"`, `bundleGap={18}`, `rowGap={130}`. (Wave 3 must confirm this reverse-direction transition is supported prop-side; see §6.)
  - `BundleWrap` animated `wrapProgress: 1 → 0` (or `opacity: 1 → 0` — composer picks; both untie cleanly).
  - `LabelCallout` `progress: 1 → 0`.

### slow-count-ones
- **Purpose**: Establish "counting by ones is slow" — ten distinct counts.
- **Anchor element**: each stick as it lights, in turn, with its badge popping above.
- **Semantic groups on screen**: `persistent-row` (StickGroup `layout="row"` with sequenced `activeIndex` walking left→right), `count-badges-1..10` (10 CountStepIndicator instances), `slow-tally` (StepTally appearing near the end of this cue).
- **Allowed change vs untie-reveal**: `activeIndex` walks 0..9 across the cue at evenly-spaced moments; `revealUpTo` follows one step behind so counted sticks settle into `highlight="counted"` while only the active stick flashes `colors.sunshine`. Each CountStepIndicator pops in (12-frame small fade-in profile) anchored above its stick in zone-badges. At ~85% of cue, the StepTally pill `steps={10}`, `label="数十次"` fades in in zone-tally-left (centered horizontally inside the left half during this cue — it will hold position into `fast-vs-slow`).
- **Forbidden**: no second tally yet. No fast badge. No sketch mark yet (the underline considered in KP1's analogue cue is dropped here — the badges + tally already carry "ten counts"; an underline would be redundant per §2 of kids-eye).
- **Identity-invariant**: the 10 sticks counted here ARE the 10 sticks from `bundle-recall` / `untie-reveal`. Same primitive instance, same orange, same row layout.
- **Primitive props used**:
  - `StickGroup` `layout="row"`, `count={10}`, `rowGap={130}`, `activeIndex={ /* 0..9 walking */ }`, `revealUpTo={ /* 0..10 walking, one step behind */ }`.
  - `CountStepIndicator` ×10: `value={i+1}`, `size={56}`, `progress={ /* per-badge 0→1 with stagger */ }`, anchored at zone-badges centered over its stick.
  - `StepTally` `steps={10}`, `label="数十次"`, `variant="numeric"`, `progress={ /* 0→1 at ~85–100% of cue */ }`, anchored at zone-tally-left center.

### fast-vs-slow  *(emphasis — climax)*
- **Purpose**: Same quantity, one count. Make the speedup visible at a glance.
- **Anchor element**: the re-tying motion + the side-by-side tallies after re-tie.
- **Semantic groups on screen**: `persistent-bundle` (sticks re-bundling), `slow-tally` (`steps=10`, sliding left, dimming via `dimmed=true`), `fast-tally` (`steps=1`, fading in on the right), `count-badge-1` (single CountStepIndicator above the re-tied bundle), `vs-mark` (TeacherMark between the two tallies).
- **Allowed change vs slow-count-ones**: All 10 count-badges fade out across the first ~15% of cue (their job is done). StickGroup transitions `layout="row" → "bundle"` (the squeeze) with `compress: 0 → 1` lerped in lockstep; the row visibly tightens. BundleWrap mounts at the bundle center and `wrapProgress` interpolates 0→1 with the climax ease across the middle ~50% of cue, ending with the bow drawing on. A single `CountStepIndicator` `value={1}` pops above the re-tied bundle just after `wrapProgress=1`. The slow `StepTally` slides from its slow-count position into zone-tally-left's anchored center and dims (`dimmed={true}`). A new `StepTally` `steps={1}`, `label="数一次"` fades in at zone-tally-right's center at full opacity. A single sunshine sparkle blinks at the bow knot at re-tie completion. A `TeacherMark` `kind="vs-mark"` draws on at the midpoint between the two tallies during the last ~25% of cue.
- **Forbidden**: NO repainted gray sticks on the slow side (slow-tally carries the slowness via the *number* 10 + `dimmed`; the original loose sticks are gone — they're now the bundle). NO second sparkle. NO additional label appearing here ("一个十" returns silently with the bundle but does NOT animate in here — see continuity below). NO change of stick hue.
- **Identity-invariant**: The bundle on the right IS the same 10 SmallStick + BundleWrap that was untied in `untie-reveal`. Same primitive instance, just retied. The slow-tally pill that dims here is the SAME StepTally instance that filled in during `slow-count-ones` — its `dimmed` prop flips, it does NOT get destroyed.
- **Primitive props used**:
  - `StickGroup` animated `layout="row" → "bundle"`, `compress: 0 → 1`, `bundleGap={18}`, `rowGap={130}`.
  - `BundleWrap` `style="rope"`, `knotPosition="top"`, `wrapProgress: 0 → 1` (climax ease), `width={ /* bundle width */ }`.
  - `CountStepIndicator` `value={1}`, `size={56}`, `progress={ /* 0→1 just after wrapProgress=1 */ }`, anchored at zone-badges centered above the re-tied bundle.
  - `StepTally` (slow, existing instance): props update `dimmed={true}`, position interpolates into zone-tally-left center.
  - `StepTally` (fast, new instance): `steps={1}`, `label="数一次"`, `variant="numeric"`, anchored at zone-tally-right center, `progress: 0 → 1`.
  - `TeacherMark` `kind="vs-mark"`, `anchor={ kind:"point", x: 640, y: 535 }` (in zone-marks, between the two tally pills), `drawProgress: 0 → 1`.

### two-tens
- **Purpose**: Extend the unit — add one bundle, count "1, 1 → 两个十". Each bundle costs ONE count of 十, even though it carries 10 ones inside.
- **Anchor element**: the second bundle sliding in, then both bundles together.
- **Semantic groups on screen**: `persistent-bundle` (the original, now slid slightly left), `bundle-B` (new, atomic, pre-tied), `count-badge-1-A` and `count-badge-1-B` (above each bundle), `label-两个十` (zone-label).
- **Allowed change vs fast-vs-slow**: BOTH tally pills (`slow-tally` and `fast-tally`) and the `vs-mark` fade out across the first ~15% of cue — their job (the contrast) is done; carrying them into the extension cues would overload the eye (max 4 groups; without dropping them we hit 5+). The original bundle's `count-badge-1` from `fast-vs-slow` ALSO fades out at the same time so the new badges can pop sequentially in this cue. The original bundle slides ~120 px left over the first ~25%. A second StickGroup (`bundle-B`, `layout="bundle"`, `count=10`) + BundleWrap (`wrapProgress=1` from entry — atomic) slides in from off-canvas right to position right-of-center over ~25–55%. Two new `CountStepIndicator` `value={1}` badges pop in sequence above each bundle (left badge ~55–65%, right badge ~65–75%). `LabelCallout` `text="两个十"` fades in in zone-label over ~75–100%.
- **Forbidden**: NO re-bundling animation on `bundle-B` — it arrives already tied. NO label "一个十" reappearing (we've moved on to counting bundles as the unit). NO tally pills carried over.
- **Identity-invariant**: `bundle-B` is a NEW StickGroup instance, but it uses the IDENTICAL primitive props as `persistent-bundle` — same `color="reward"`, same `bundleGap=18`, same BundleWrap `style="rope"`, `knotPosition="top"`. Visually they are siblings of the same species.
- **Primitive props used**:
  - `StickGroup` (existing persistent): `layout="bundle"` held, position animated from center to left-of-center.
  - `StickGroup` (`bundle-B`, new): `count={10}`, `layout="bundle"`, `bundleGap={18}`, `color="reward"`, position animated from off-canvas right to right-of-center.
  - `BundleWrap` ×2: one on each StickGroup, both `wrapProgress={1}` held, `style="rope"`, `knotPosition="top"`.
  - `CountStepIndicator` ×2: `value={1}`, `size={56}`, staggered `progress: 0 → 1`.
  - `LabelCallout` `text="两个十"`, `appearStyle="fade"`, `progress: 0 → 1`, `fontSize={56}`.

### three-tens
- **Purpose**: One more bundle. Reinforce: each new bundle is still "one count of 十".
- **Anchor element**: the third bundle arriving, then the three bundles settled and counted.
- **Semantic groups on screen**: `persistent-bundle` (now slid further left), `bundle-B` (slid slightly left), `bundle-C` (new, atomic), three count-badges (one per bundle), `label-三个十` (cross-fades from "两个十").
- **Allowed change vs two-tens**: The two existing bundles slide left by ~150 px each over the first ~25% to make room. A third StickGroup (`bundle-C`, identical props) slides in from off-canvas right to right-of-center over ~25–55%. A third `CountStepIndicator` `value={1}` pops above `bundle-C` over ~55–70%. The "两个十" label cross-fades to "三个十" over ~70–100% (composer can use either a single `LabelCallout` instance with `text` swap mid-fade, OR two stacked instances with opposite progress curves — both are acceptable; the visual contract is "one label changes from 两个十 to 三个十"). The existing two count-badges stay visible (they continue to read "1" each — the third joins them; we're now showing 1+1+1 = three counts of 十).
- **Forbidden**: NO re-bundling animation on `bundle-C`. NO additional label or chrome. NO tally pills returning.
- **Identity-invariant**: `bundle-C` uses identical primitive props to the other two. All three bundles are visually siblings of the same species — same orange sticks, same coral rope+bow, same scale.
- **Primitive props used**:
  - `StickGroup` ×3 (persistent + B + C): `layout="bundle"` held; positions animated to evenly spaced across zone-stage center.
  - `BundleWrap` ×3, all `wrapProgress={1}`, `style="rope"`, `knotPosition="top"`.
  - `CountStepIndicator` ×3 above each bundle, all `value={1}`.
  - `LabelCallout` `text` transitions "两个十" → "三个十" via cross-fade (composer's choice of instancing).

### recap  *(emphasis — takeaway)*
- **Purpose**: Land the moral the child can repeat: 一捆一捆地数，更快。
- **Anchor element**: the three bundles together + the takeaway text underneath.
- **Semantic groups on screen**: three persistent bundles (held from `three-tens`), the three `count-badge-1` indicators (held, with a gentle left→right scale-pulse syncing to the takeaway phrase), `label-takeaway` (replaces "三个十" in zone-label).
- **Allowed change vs three-tens**: "三个十" label cross-fades to the takeaway "一捆一捆地数，更快。" over ~10–45% of cue. A gentle left→right pulse runs across the three bundles in turn over ~45–80% of cue (each bundle's StickGroup `celebrate=true` for one beat — scale 1.0→1.04→1.0 ~10-frame profile per bundle, staggered). A single `TeacherMark` `kind="underline"` draws on under the last two glyphs "更快" of the takeaway during ~70–95% of cue. Last ~5%: hold.
- **Forbidden**: NO sparkle (the climax sparkle was in `fast-vs-slow`; a second would dilute it). NO re-bundling, no new bundles. NO badge or tally reappearing.
- **Identity-invariant**: the three bundles are the same three StickGroup instances from `three-tens`. The underline TeacherMark uses the same `colors.textNavy` ink as all prior marks.
- **Primitive props used**:
  - `StickGroup` ×3 held in `layout="bundle"`; `celebrate={true}` staggered across the three.
  - `BundleWrap` ×3 held at `wrapProgress={1}`.
  - `CountStepIndicator` ×3 held.
  - `LabelCallout` text transitions "三个十" → "一捆一捆地数，更快。", `fontSize={56}`.
  - `TeacherMark` `kind="underline"`, `anchor={ kind:"span", start:{x:?,y:?}, end:{x:?,y:?} }` spanning under the takeaway's final two glyphs "更快" (concrete x/y resolved by composer from the rendered label width in zone-label).

---

## §4. Choreography (cue-relative phases only — NO frame numbers)

Each cue is described as fractions of its own duration ("first 25%", "middle 30%", "last 45%") or as relative phases ("after `wrapProgress=1`, the count badge pops"). Wave 3 ASR will supply each cue's absolute duration; Wave 4 composer will multiply.

Coordinated phases (same timing curve drives multiple props):
- **`untie-reveal`**: BundleWrap `wrapProgress: 1 → 0` AND StickGroup `layout="bundle" → "row"` AND LabelCallout `progress: 1 → 0` are all driven by a single shared `t: 0 → 1` curve across the first 70% of cue. They open in lockstep — the rope dissolves as the sticks spread as the label fades.
- **`fast-vs-slow`**: StickGroup `compress: 0 → 1` AND `layout` interpolated `row → bundle` AND BundleWrap `wrapProgress: 0 → 1` are all driven by a single shared `t: 0 → 1` curve (with climax ease) across ~15–75% of the cue. The squeeze, the layout snap, and the rope tie ARE one motion to the eye.
- **`two-tens` / `three-tens`**: Each new bundle's horizontal position interp and its `CountStepIndicator` `progress: 0 → 1` are SEQUENTIAL, not coordinated — the bundle arrives first (read "look, a new bundle"), then the count badge pops (read "and we count it: 1").

No cue draws a frame number. The composer derives every frame from `cues[id].startFrame + offset` (per CLAUDE.md "ZERO FRAME LITERALS in scene code").

---

## §5. Finger-cover test (kids-eye §3) — climax beat `fast-vs-slow`

Mentally simulate the climax frame at the moment the re-tie completes (the sparkle is mid-blink, the vs-mark is mostly drawn, both tallies are visible):

- **Cover the bundle (right side of zone-stage).** What remains: slow tally "10 步" (dimmed) on the left, fast tally "1 步" on the right, vs-mark between them, caption ribbon. Does the screen still tell the story? **No — and that is correct.** The bundle IS the teaching object on the right; covering it should break the contrast (the "1 步" no longer refers to anything visible). PASS — the bundle is load-bearing as it should be.
- **Cover the right tally (`steps=1`).** What remains: slow tally on the left, the bundle on the right, the vs-mark, the caption. Does the contrast still work? Marginal — the bundle is visible and the kid can intuit "this is fast because it's now one thing," but the explicit "1 步" makes the count-count contrast unambiguous. The fast tally is load-bearing — KEEP it.
- **Cover the slow tally (`steps=10`, dimmed) on the left.** What remains: the bundle on the right, fast tally, vs-mark. Does the contrast survive? **No** — without "10 步" hanging on the left, "1 步" loses its meaning (1 vs. what?). The slow tally is load-bearing — KEEP it persistent from `slow-count-ones`.
- **Cover the vs-mark.** What remains: slow tally on the left, bundle + fast tally on the right. Does the contrast survive? **Yes, mostly** — the two tallies side-by-side already carry "compare these." The vs-mark adds a small but clear punctuation; it earns its place because the contrast moment is the climax (one teacher mark per cue is the budget; spend it here).
- **Cover the caption.** What remains: the full visual. Does the teaching land? **Yes** — bundle on right, 10-step pill dimmed on left, 1-step pill bright on right, vs-mark between. The metaphor is visible without narration. PASS — visuals carry the lesson; caption is accessibility.

Design adjustments confirmed by the test:
- Slow tally MUST persist visible from `slow-count-ones` into `fast-vs-slow` (not destroyed/recreated). Without this persistence, the contrast collapses.
- No second tally beyond `steps=10` and `steps=1` — adding a `steps=3` later would mean "the slow side of the contrast is now 3" which contradicts the metaphor.
- The vs-mark stays — it's the climax's allowed sketch mark, restrained to one stroke.

---

## §6. One-metaphor check

**Single metaphor of KP2:** *Same quantity, fewer counts when the counting unit grows from "一" to "十" — and once we're counting bundles, each new bundle adds just one count of 十.*

Confirm no cue introduces a second metaphor:
- `bundle-recall`, `untie-reveal`, `slow-count-ones`, `fast-vs-slow` → all serve the unit-switch metaphor on the SAME 10 sticks.
- `two-tens`, `three-tens` → extension OF that metaphor, not a second one. Each extension bundle costs one count of 十 (the same unit established in the climax).
- `recap` → the moral OF the metaphor, not a new one.

No cue introduces place value, two-digit numbers, written "10", 十位/个位, the digits 20/30, or 计数单位 as vocabulary. All would be second metaphors; all are forbidden by the brief and absent from this design.

---

## §7. Risk flags for downstream waves

### For Wave 3 (`primitive-gap-scan` / `primitive-builder`)

1. **`StickGroup` `layout="bundle" → "row"` reverse transition**: KP1 uses `row → bundle`. KP2 needs `bundle → row` in `untie-reveal`. Verify the existing primitive lerps both directions cleanly when the composer interpolates `compress` and a `layoutMix` (or when the composer drives the layout transition via two stacked StickGroups with cross-faded opacity — composer's call). If the primitive can only animate one direction prop-side, extend it (prop-driven, lesson-agnostic) — do NOT introduce a one-off SVG in the scene.
2. **`StepTally` `dimmed` toggle without re-mount**: `fast-vs-slow` flips the slow tally's `dimmed` from `false` to `true` while the same instance keeps its position interpolating. Verify the existing primitive does not flicker on the toggle (it's driven by `stateOpacity(undefined, dimmed)` per `counting.tsx` line 1894, which should be stable). If a brief opacity hop appears at the flip, smooth it via composer-side opacity interpolation rather than re-rendering the primitive.
3. **`LabelCallout` text swap mid-cross-fade** (`two-tens → three-tens`, `three-tens → recap`): the primitive's `appearStyle` drives `progress`-based opacity, but doesn't itself coordinate a swap of `text`. Composer must instance two `LabelCallout`s with opposite `progress` curves OR briefly cross-fade via stacking. Either is acceptable; no primitive change needed.

### For Wave 4 composer

1. **Slow tally must persist visible from `slow-count-ones` into `fast-vs-slow`.** Treat it as one StepTally instance whose props (position, `dimmed`) change across the cue boundary — NOT a new instance mounted in `fast-vs-slow`. The finger-cover test (§5) shows that destroying it would break the climax.
2. **The persistent bundle is one StickGroup instance across all 7 cues**, NOT a fresh mount per cue. Its `layout`, `bundleGap`, `compress`, position, and `celebrate` change. Mounting fresh would break the identity-invariant: the kid must see "the same bundle from KP1 is the same bundle being untied, retied, then joined by two more."
3. **`zone-tally-left` and `zone-tally-right` are HARD-CODED to halves.** The slow pill cannot drift into x>640; the fast pill cannot drift into x<640. If the composer's automatic centering math drifts a pill across the divider, clamp it.
4. **Three bundles in extension cues must occupy ~90% of zone-stage horizontally** (per §3 occupancy). If the composer centers three bundles too tightly, the contrast with the row state (`slow-count-ones`) is lost — the kid won't read "the same bundle, plus more". Stretch the bundle spacing in `three-tens` / `recap` so the eye sees three clearly separated units.
5. **Bundle-B and bundle-C arrive ATOMIC** — `wrapProgress=1` from entry. Any draw-on of the rope on extension bundles is a second metaphor (it would re-teach the bundling action, which is KP1's, not KP2's).

### For Wave 4 sketch-layer

1. **One mark per cue ceiling, restraint is the rule.** This design schedules marks in only TWO cues:
   - `fast-vs-slow` → `vs-mark` (single TeacherMark, point anchor between tallies in zone-marks).
   - `recap` → `underline` under "更快" in the takeaway sentence (single TeacherMark, span anchor inside zone-label vertical band, in zone-marks).
   - `bundle-recall`, `untie-reveal`, `slow-count-ones`, `two-tens`, `three-tens` → ZERO sketch marks. Restraint clarifies. (Note: KP1's analogue cues had a wrap-arc and a label-arrow; KP2 deliberately drops those because the bundling action is KP1's lesson, not KP2's — adding a wrap-arc here would re-teach the wrong thing.)
2. **`vs-mark` anchor sits in zone-marks at composition center (~x=640, y≈535)** — between the two StepTally pills, NOT over either tally and NOT over the bundle. Sketch-layer must respect this zone — the mark traces between zones, never inside one.
3. **`recap` underline spans only the last two glyphs "更快"**, not the whole takeaway sentence. Spanning the whole sentence would be a second metaphor ("everything is the moral"); the underline punctuates the punchline word.
4. **All marks use `colors.textNavy`** — no second ink color.

---

## §8. Self-check

1. **§1 measurement block** — written. Teaching-unit 120 px = 16.7% > 8% min. Primary-label 56 px > 48 px min. Body-label (CountStepIndicator size=56, internal font ≈ 35 px — wait, verify: per `counting.tsx` line 1848, CountStepIndicator label fontSize = `size * 0.62` = 56 × 0.62 ≈ 35 px). **YELLOW: this falls 1 px below the 36 px body-label minimum.** Mitigation: composer should set `CountStepIndicator size={60}` instead of `{56}` for KP2 → label fontSize ≈ 37 px, comfortably above the floor. This adjustment is noted in §3's primitive-prop blocks and §7 risk flags; orchestrator should confirm Wave 4 applies `size={60}` to all CountStepIndicator instances. PASS with adjustment.
2. **§1.5 zones declared, disjoint, every element belongs** — six zones plus zone-marks; every per-cue element above is anchored to a named zone. zone-tally-left and zone-tally-right are deliberately split for the climax. PASS.
3. **"Carries unique signal X" audit** —
   - SmallStick (×10 persistent + ×10 in bundle-B + ×10 in bundle-C) → carries "a one." PASS.
   - BundleWrap (×3) → carries "tied together / this is a unit of 十." PASS.
   - CountStepIndicator 1..10 in slow-count-ones → carries "this stick is the N-th counted." Gone after climax. PASS.
   - CountStepIndicator value=1 in fast-vs-slow / two-tens / three-tens / recap → carries "this bundle costs ONE count of 十." PASS.
   - StepTally `steps=10` (slow) → carries "the count took 10 steps." Persists into the climax as the left contrast anchor. PASS.
   - StepTally `steps=1` (fast) → carries "the count now takes 1 step." PASS.
   - LabelCallout "一个十" / "两个十" / "三个十" → names the unit count. PASS.
   - LabelCallout takeaway → the moral. PASS.
   - TeacherMark vs-mark → carries "this is a comparison." PASS (climax only).
   - TeacherMark underline (recap) → carries "this is the punchline word." PASS.
   - Caption ribbon → accessibility. PASS.
   - Cream canvas + caption ribbon = 2 stacked surfaces. PASS.
4. **Finger-cover test** (§5 above) — simulated for `fast-vs-slow`. PASS with all noted persistence requirements.
5. **Identity preserved across transformation** — every stick is `SmallStick` at `colors.reward`. The persistent bundle is the same StickGroup instance across all 7 cues; bundle-B and bundle-C use IDENTICAL primitive props to it. No hue change, no shape swap, no different primitive on either side of any comparison. PASS.

No red findings. Contract is ready for Wave 3.

### Yellow findings (flagged for orchestrator)

- **CountStepIndicator size**: noted in §8.1 — use `size={60}` so internal label ≈ 37 px ≥ 36 px minimum.
- **`bundle → row` transition direction**: noted in §7 — Wave 3 must verify `StickGroup` lerps both directions cleanly. Likely already works (the primitive uses straight position lerp via `getStickPlacement` per `counting.tsx`), but confirm.
- **Three-bundle horizontal occupancy**: noted in §7.4 — composer must stretch spacing to ~90% of zone-stage in `three-tens` and `recap`, NOT center tightly.

---

## §9. Source-of-truth references

- Composition size, fps: `src/theme.ts` (`video.width = 1280`, `video.height = 720`, `video.fps = 30`) — identical to KP1.
- Color tokens: `src/theme.ts` (`colors.cream`, `colors.reward`, `colors.coral`, `colors.textNavy`, `colors.sunshine`, `colors.softGrayBlue`).
- Font family: `src/shape-primitives/shared.tsx` (`fontFamily`).
- Existing primitives referenced (all in `src/shape-primitives/counting.tsx` + `sketch.tsx`):
  - `SmallStick`, `StickGroup` (including `compress` prop), `BundleWrap` (including `knotPosition="top"`), `CountStepIndicator`, `StepTally` (including `dimmed` and `label`), `LabelCallout`, `TeacherMark` (kinds: `vs-mark`, `underline`).
- No new primitives. No primitive prop additions required for KP2 (the `compress` prop already exists from KP1's redesign; the `knotPosition="top"` bow already exists; `StepTally` `dimmed` already exists).
