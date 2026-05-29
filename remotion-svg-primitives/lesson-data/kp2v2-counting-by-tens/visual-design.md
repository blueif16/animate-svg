# kp2v2-counting-by-tens — visual design

Five-cue rebuild against `pedagogy.md` Beats 1–5. Intent only — no absolute frame numbers. Wave 4 composer maps phases → frames using the ASR-aligned timing module.

---

## §0 Visual identity recall (inherited from KP1)

This lesson inherits visual identity wholesale from `ten-ones-make-one-ten` (KP1):

- **Sticks.** Every "一" is a `<SmallStick>` at the same orange (`reward`) tone, the same silhouette, the same outline. KP1's "the bundling moment is the proof" hinges on the unbroken stick identity from scatter → row → bundle; KP2 picks up that same stick and never re-colors, re-sizes, or re-shapes it across cues.
- **Bundles.** Every "1个十" is exactly the KP1 bundle: ten of the same orange sticks side-by-side under a single coral rope wrap with a top bow. KP2 *never* re-animates the bundling action — bundles 2 and 3 in this lesson arrive already tied (brief Continuity, pedagogy Beat 3/4). The wrap is given.
- **Ink.** Navy ink for everything that speaks: labels, count badges, step pills, sketch marks. No other ink color.
- **Background.** Same cream canvas as KP1. Under the `ink-wash` style overlay, cream is remapped to warm rice paper (`#F4ECDC`), orange/coral are de-saturated toward sumi tonal values, and `accent` (vermilion `#7A2E2A`) is the only warm color — used sparingly, never on the teaching unit itself.
- **What's new in KP2.** Nothing visual. KP2 introduces no new primitive, no new color, no new shape. The discovery is that the *bundle* (already a familiar object from KP1) can be *counted as a single thing* — and that counting bundles works just like counting ones. The visual job is to keep the inherited objects honest while letting the counting display do the new work.

This is the strongest possible application of `kids-eye` §4 identity-invariant: KP1 and KP2 share the same orange stick and the same coral-rope bundle as the same SVG primitives in the same configuration. The viewer recognizes them on sight.

---

## §1 Kids-eye measurement block

```
composition:             1280×720 @ 30fps   (from src/theme.ts video.{width,height,fps})
short-side:              720 px

teaching-unit:           single 小棒 (SmallStick)
teaching-unit-min:       ≥ 8% of short-side = 58 px  →  target 90–110 px length
teaching-unit-target:    ~12–15% of short-side = 86–108 px length (stickLength=100, thickness=14)

bundle-unit:             one tied bundle of 10 sticks
bundle-width-target:     ~22% of long-side = ~280 px (10 sticks at bundleGap=18, stickLength=100)
bundle-height-target:    ~14% of short-side = ~100 px (stickLength)

primary-label-min:       42 px rendered  (一个十 / 两个十 / 三个十; "十步" / "三步" tally text)
body-label-min:          32 px rendered  (CountStepIndicator numerals over sticks/bundles)
caption-line-min:        38 px rendered  (caption ribbon — load-bearing for ESL/accessibility at 720 px height)
chrome-label:            FORBIDDEN
```

Note on composition height: KP1 / kids-eye §1 was written assuming a 1080-px short-side. KP2v2 uses the project's actual 1280×720 frame (`src/theme.ts` `video.{width,height}`). Minimums scale down proportionally — 48 px primary at 1080 → 32 px primary at 720 is *too small*; we hold the line at 42 px (≥ 5.8% of short-side) which renders cleanly. If composition ever changes to 1920×1080 these minimums lift back to the kids-eye defaults.

## §1.5 Zones (1280 × 720 composition)

Zones are disjoint, declared in composition pixel coords (origin top-left, x right, y down).

```
zone-objects:    x=80,  y=200, w=1120, h=320   | holds: sticks (loose row) AND bundles (row of 1, 2, 3, or 3). NOTHING ELSE.
zone-badges:     x=80,  y=120, w=1120, h=72    | holds: CountStepIndicator badges directly above their referent — per-stick in Beat 1, per-bundle in Beats 2–4. NEVER over zone-labels.
zone-labels:     x=80,  y=540, w=1120, h=80    | holds: 一个十 / 两个十 / 三个十 LabelCallouts under their bundle. Never inside zone-objects.
zone-tally:      x=80,  y=110, w=1120, h=70    | holds: StepTally pills in Beat 5 ONLY. Co-shares Beat 5's top strip but never co-renders with zone-badges (Beats 1–4 have badges; Beat 5 has tallies; no cue ever has both).
zone-caption:    x=0,   y=640, w=1280, h=80    | holds: caption ribbon
zone-marks:      full-bleed                     | sketch marks. Marks may trace OVER zone-objects (e.g. underline a tally) but never sit inside zone-labels.
```

**Disjointness check.** zone-badges (y=120, h=72) and zone-tally (y=110, h=70) overlap vertically — that's intentional: they share the same "above the teaching object" spatial slot but are temporally disjoint (badges in cues 1–4, tally in cue 5). No frame ever renders both. The rule "every element belongs to a named zone, no two elements in the same zone occupy the same pixel rect at the same frame" is the spirit of kids-eye §1.5; the slot reuse is fine.

**zone-labels under-bundle placement.** The 一个十/两个十/三个十 label sits in `zone-labels` below the bundle, *outside* the bundle's silhouette. Never on top. The label's centroid x-aligns with its bundle's centroid x — so when bundles enter from the right and the row slides left, the labels track them, but the zone itself is fixed below.

---

## §2 Palette + motion vocabulary

### Palette (4 meaningful colors + cream background)

Default (un-styled):

- **`cream`** `#FFF7E6` — canvas background.
- **`reward`** (orange) `#FFB84D` — every stick. The single teaching unit color. Never used for anything else.
- **`coral`** `#FF8A65` — the rope on each bundle. The bundling-action color, semantically frozen into "bound as one ten." In KP1 it was the verb (the rope tying); in KP2 it is the same rope still tying, just as a given.
- **`textNavy`** `#24324B` — all ink: labels, count badges, step pills, sketch marks, caption text.
- **`sunshine`** `#FFD85A` — transient highlight ONLY on the actively-counted item (one stick in Beat 1, one bundle as it enters in Beats 3–4). Resets to idle when count advances. Never persistent identity.

### Style overlay: ink-wash

Per `.agents/styles/ink-wash/`: the entire scene is wrapped in `<StylePreset style="ink-wash">`. Tonal effects:

- Cream becomes warm rice paper (`#F4ECDC`).
- Orange (`reward`) and coral both desaturate toward sumi tonal values; the stick / rope distinction survives via tonal weight, not hue. The orange stays slightly warmer than the rope; the rope reads as the wrapping action through its silhouette (band + bow) more than its color.
- Navy ink reads as sumi (`#1F2230`).
- `accent` (vermilion `#7A2E2A`) is reserved for the **closing seal-stamp** on Beat 5's takeaway moment — one tiny mark, ≤ 5% of frame area, placed as a sketch glyph (see §4 Beat 5). It is the lesson's single "ink-wash signature" and lives in `zone-marks`. No other use anywhere.

### Motion vocabulary (intent only — Wave 4 maps to frames)

Per `early-childhood-visual-taste` + ink-wash overrides (`.agents/styles/ink-wash/animation.md`):

- **Per-stick count tick (Beat 1).** Each tick is a CountStepIndicator's pop-on. Default small move (~12f, `EASE.outCubic`). Ten ticks are NOT all simultaneous — they cascade one-after-another, paced to the spoken count (Wave 3 owns the exact frames; Wave 2 says: the cascade rhythm IS the felt labor).
- **Stick highlight pulse (Beat 1).** As each count badge appears, the corresponding stick briefly switches to `highlight="active"` (the sunshine fill via `<SmallStick highlight="active" />`), then back to `idle`. Tiny, fast, no scale change — the badge does the work, the highlight just disambiguates "this one right now."
- **Bundle entrance (Beats 2, 3, 4).** Each bundle slides in from the right edge of zone-objects, settling into its row position. Default big move (~24f, `EASE.outCubic`; ink-wash prefers outCubic/outQuint over overshoot). Atomic — the bundle is already tied, never re-animated.
- **Tens-count badge advance (Beats 3, 4).** Above the newly-entered bundle, a CountStepIndicator pops on (value = bundle ordinal: 1, 2, 3). Default small move (~12f, `EASE.outCubic`). The previous badges stay on screen — the row of badges is the *visible advancing count*.
- **Beat 2 collapse.** The loose row's ten badges fade out together (~16f, `EASE.outCubic`). The ten loose sticks slide together to their bundle-row layout (`<StickGroup layout="row" → layout="bundle">` via the `compress` prop, or a coordinated stick-x interpolate). The rope/bow `<BundleWrap>` is the same KP1 bundle — but here it appears already complete (no wrapProgress animation; just opacity fade-in or scale settle ~16f). The single "1" badge pops on after the bundle is settled. Narrator names "一个十" AFTER the picture lands the unit.
- **Beat 5 side-by-side.** The single existing row reflows into two horizontally stacked rows: top row = 10 sticks loose, bottom row = 3 bundles. This reflow is the move (~24f, `EASE.inOutCubic`). After settle, two `<StepTally>` pills enter in zone-tally — one over each row — naming "十步" and "三步" (small move ~12f each, staggered to match narration).
- **Bouncy.** Reserved for ZERO cues (ink-wash caps bouncy at 1/video, and this lesson has no climax that wants overshoot — the comparison in Beat 5 lands through composition, not motion).

Sketch marks (Wave 4 sketch-layer owns the schedule; visual-design names intent only):
- Beat 5 only: a single `<TeacherMark kind="vs-mark">` or a small vermilion accent stroke at the join between "十步" and "三步" pills — the lesson's one allowed accent moment. Restraint over flourish.

---

## §3 Visual Contract block

```
metaphor:        the same 10 sticks counted two ways — first as 10 separate ones (a long walk), then as 1 bundle (one step) — and then that same bundle pattern repeated to make a row of bundles whose count-length is visibly shorter than the row-of-ones it replaces.
regions:         zone-objects holds the teaching unit (sticks in Beat 1; one bundle by Beat 2; row of bundles in Beats 3–5; both rows side-by-side in Beat 5). zone-badges holds per-item count numerals. zone-labels holds the unit names (一个十 / 两个十 / 三个十). zone-tally holds Beat 5's "十步" / "三步" pills. zone-caption holds the narration ribbon.
between-states:  the 10 sticks live the entire video as the same primitive instances. In Beat 1 they are in a horizontal row, loose. In Beat 2 they collapse into the first bundle. In Beats 3–4 two more bundles join — each new bundle is its own 10 fresh sticks (composed identically to the first), so the row grows from 1 → 2 → 3 bundles. In Beat 5, the lesson resurrects a parallel row of 10 loose sticks above the row of 3 bundles for the comparison; those loose sticks are the same orange SmallStick at the same scale.
reading-order:   per cue, eye lands on (a) the count-display change first (the new badge or the count-cascade), then (b) the object that change refers to (the active stick or the just-entered bundle), then (c) the named label below the bundle. Caption ribbon is steady at bottom, peripheral.
decoration-budget:  1 cream/paper background + 1 caption ribbon surface = 2 stacked surfaces. 4 meaningful colors (orange stick, coral rope, navy ink, sunshine transient) + cream background. Under ink-wash, vermilion accent appears for ≤ 5% of frame area on Beat 5's closing only.
text-budget:     "一个十", "两个十", "三个十" (load-bearing — they name the new unit per pedagogy Beats 2–4); count-step numerals 1..10 over sticks in Beat 1 and 1,2,3 over bundles in Beats 2–4 (load-bearing — they ARE the visible count); "十步", "三步" tally text in Beat 5 (load-bearing — they are the contrast the narration names aloud, matching the spoken count per pedagogy §7); captions (load-bearing — accessibility). NO digit "10", NO "20", "30", NO 十位/个位, NO 计数单位 written or spoken (brief out-of-scope).
occupancy:       horizontal axis is binding (sticks → bundles row grows left-to-right). Beat 1: 10 sticks in a row at rowGap≈110 occupy ~990 px = ~77% of 1280-px wide axis. Beat 5: 10-stick row (~990 px wide) above 3-bundle row (~860 px wide) — both rows occupy ≥ 65% of horizontal axis. Vertical axis: zone-objects is 320 px = 44% of 720-px short-side; teaching unit at 100-px stick length = 14% of short-side (within target).
identity-invariant: every stick is a SmallStick at color="reward" length=100 thickness=14 for the entire video. Every bundle is a StickGroup layout="bundle" of 10 SmallSticks at the same color/length/thickness, wrapped with a single BundleWrap style="rope" knotPosition="top" color="coral" wrapProgress=1. The bundle in KP1 and the bundle in KP2 render to byte-identical SVG at the same scale (no KP2-only props). No primitive's color, scale, or silhouette changes across cues — only count, layout, and opacity vary.
```

### Per-cue contract rows

#### Cue 1 — `loose-count-felt` (Beat 1)

- **Purpose.** Make the child *feel* that counting ten loose ones is ten separate counts — the count sequence is the long walk, the sticks are static (pedagogy Beat 1, focal: "the running count advancing one tick at a time across the ten loose sticks").
- **Anchor element.** The cascade of CountStepIndicator badges popping on, one per stick, paced to the spoken count.
- **Semantic groups on screen.** One group: 10 loose sticks as one set of "ones." Visually they're a row, but the math identity is "ten ones."
- **Allowed change vs previous cue (this is the opener).**
  - *First 25% (cue intro):* the 10 sticks are present from frame 0 of the cue (they fade in or hold-over from a precedent if needed; visual-design treats them as established). No badges yet.
  - *Middle 50%:* badges pop on one-by-one across the row, left to right, paced to the narrator counting 一、二、三… (Wave 3 owns the per-tick frame; Wave 2 says: the cascade IS the cue). Each new badge accompanies a brief `highlight="active"` flash on its stick that resets to `idle` (now showing as `counted`) when the next badge fires.
  - *Last 25%:* all 10 badges sit above all 10 sticks. The full row reads as "ten counts for ten things." Brief hold so the labor registers.
- **Forbidden.** No bundle, no rope, no 一个十 label, no tally, no digit "10". The cue is *purely* the felt cost of counting by ones.
- **Identity-invariant.** All 10 SmallSticks at `color="reward" length=100 thickness=14`, no scale changes, no color changes. The badges are CountStepIndicator at the same size for every tick (no growing-emphasis on the tenth — pedagogy §6: the labor is the point, not the punchline).
- **Primitive props used.**
  - `<StickGroup count={10} layout="row" rowGap={110} color="reward" stickLength={100} stickThickness={14} />` at zone-objects center.
  - `<SmallStick highlight="active" />` driven via StickGroup's `activeIndex` prop, advancing across [0..9] tied to the spoken count's per-tick frame.
  - 10 × `<CountStepIndicator value={i+1} progress={...} size={48} />` positioned above each stick's x in zone-badges; each `progress` interpolates 0→1 in ~12f around its tick frame.

#### Cue 2 — `bundle-is-one-count` (Beat 2)

- **Purpose.** The same ten things, recounted as one count of a new unit named "一个十" (pedagogy Beat 2, focal: "the bundled ten arriving as a single counted item with the count flipping from ten ticks to one count").
- **Anchor element.** The collapse — the 10 sticks compress together and the rope appears, and the badge display goes from ten back down to one. The new badge "1" attaching to the bundle, with the 一个十 label arriving under it.
- **Semantic groups on screen.** One group: the bundle (composed of 10 sticks, but read as "1 ten"). The 10 sticks become 1 bundle — same identity, recomposed.
- **Allowed change vs previous cue.**
  - *First 25%:* the 10 badges from Cue 1 fade out together (~16f, `EASE.outCubic`). The 10 sticks remain in their row, no badge above them yet.
  - *Middle 50%:* the sticks slide together into bundle layout (`compress` prop interpolates 0 → 1, or `<StickGroup layout="bundle">` via crossfade of layout-state). The `<BundleWrap>` fades on at `wrapProgress=1` — already tied (no re-animation of bundling; KP1 owned that moment; brief Continuity is explicit). After the rope lands, ONE `<CountStepIndicator value={1}>` pops on above the bundle in zone-badges.
  - *Last 25%:* the LabelCallout "一个十" appears in zone-labels under the bundle (fade-in ~16f). Narrator says "一个十" only here, *after* the rope and label are visible (pedagogy §4: picture delivers, narration names).
- **Forbidden.** No "10" digit anywhere. No equation chip "10 = 1个十" (KP1 owned that moment; pedagogy §2 anti-pattern: don't restate the proof the bundle motion just delivered). No sparkle/glow on the bundle (the new badge value "1" IS the punchline — no chrome).
- **Identity-invariant.** Same 10 sticks, just re-laid-out. Same color, same length, same thickness. The rope is the same coral BundleWrap KP1 used.
- **Primitive props used.**
  - `<StickGroup count={10} layout="bundle" bundleGap={18} compress={1} color="reward" />` — same instance promoted from Cue 1's row.
  - `<BundleWrap style="rope" knotPosition="top" color="coral" width={~280} wrapProgress={1} />` overlaid on the bundle.
  - `<CountStepIndicator value={1} progress={...} size={48} />` above the bundle's centroid in zone-badges.
  - `<LabelCallout text="一个十" fontSize={44} progress={...} />` in zone-labels, x-centered under the bundle.

#### Cue 3 — `tens-count-like-ones` (Beat 3)

- **Purpose.** Counting tens works the same way as counting ones — after 一个十 comes 两个十, just as after 一 comes 二 (pedagogy Beat 3, focal: "the second bundle entering and the tens-count advancing 1 → 2").
- **Anchor element.** The second bundle's entrance + the second tens-count badge popping on. The two badges sitting side-by-side over their two bundles is what shows "this is a count sequence."
- **Semantic groups on screen.** One group: a row of bundles (now 2 of them). Each bundle is one count of "ten." The 一个十 label from Cue 2 persists under its bundle; a 两个十 label arrives under the new bundle.
- **Allowed change vs previous cue.**
  - *First 25%:* the existing first bundle (with its "1" badge and 一个十 label) slides leftward in zone-objects to make room — a translation, not a recompose. The label tracks its bundle (label position is bundle-centroid-aligned).
  - *Middle 50%:* the second bundle slides in from the right of zone-objects, settling next to the first bundle (~24f, `EASE.outCubic`). The new bundle arrives already tied (`wrapProgress=1` from frame 0 of entrance — brief Continuity explicit). As it settles, a brief `highlight="active"` pulse on its sticks reads "this one is new" (resets to `idle` quickly).
  - *Last 25%:* a CountStepIndicator with `value={2}` pops on above the new bundle in zone-badges (~12f). The 两个十 LabelCallout appears in zone-labels under it. The badge row now reads `1` `2`. Narrator says "再来一捆 — 两个十" — the action ("再来一捆") prepares, the count ("两个十") names the picture's delivery.
- **Forbidden.** No re-animation of the bundling action on bundle 2. No "20" digit. No equation chip showing "1+1=2" (pedagogy §2 anti-pattern: that's unit-cost reading, not counting-by-tens reading — the badges count BUNDLES, not ones-per-bundle).
- **Identity-invariant.** Bundle 1 unchanged in form and identity, only translated. Bundle 2 is composed identically to Bundle 1 — same `<StickGroup>` + `<BundleWrap>` props, just at a different x. Badge `1` unchanged; badge `2` is a fresh CountStepIndicator with the same `size={48}` (no growing).
- **Primitive props used.**
  - Bundle 1: existing `<StickGroup count={10} layout="bundle">` + `<BundleWrap>` translated to new x.
  - Bundle 2 (new): identical props at the next bundle-row slot.
  - `<CountStepIndicator value={2} progress={...} size={48} />` in zone-badges above bundle 2.
  - `<LabelCallout text="两个十" fontSize={44} progress={...} />` in zone-labels under bundle 2.

#### Cue 4 — `pattern-holds` (Beat 4)

- **Purpose.** The rule generalizes — each new bundle adds exactly one to the tens-count. Three confirms what two suggested (pedagogy Beat 4, focal: "the third bundle entering and the tens-count advancing 2 → 3").
- **Anchor element.** The third bundle's entrance + the third tens-count badge popping on. The badge row reading `1` `2` `3` over three bundles is the visible "yes, a pattern."
- **Semantic groups on screen.** One group: a row of 3 bundles. Each bundle = one count of ten. Labels 一个十, 两个十, 三个十 stack under their bundles.
- **Allowed change vs previous cue.**
  - *First 25%:* the row of 2 bundles slides leftward (same translation logic as Cue 3), labels and badges tracking their bundles. The 一个十 label might also fade slightly to reduce reading load — but it stays present; the row of three labels is the "pattern made visible" so all three need to be readable.
  - *Middle 50%:* the third bundle slides in from the right, settling next to bundles 1 and 2 (~24f, `EASE.outCubic`). Already tied.
  - *Last 25%:* `<CountStepIndicator value={3}>` pops on above bundle 3 in zone-badges. The 三个十 LabelCallout appears in zone-labels under it. Badge row now reads `1` `2` `3`. Narrator: "再加一捆 — 三个十." Brief hold to let the row's *sameness* register (this is the cue where pattern-recognition lands; the child needs time to read the row, not be rushed).
- **Forbidden.** No "30" digit. No equation chip. No celebratory color shift on bundle 3 — bundle 3 is the same as bundle 1 in every respect (kids-eye §4 / pedagogy §2). No "1+1+1 = 3" badge group (the documented anti-pattern from pedagogy §2 — that reads unit-cost, not unit-count).
- **Identity-invariant.** Bundles 1, 2, 3 are pixel-identical except for x-position. Badges 1, 2, 3 are pixel-identical except for value and x-position. Labels are the same font, weight, color, size — only the text differs.
- **Primitive props used.**
  - Bundles 1, 2: existing instances translated.
  - Bundle 3 (new): identical props, next slot.
  - `<CountStepIndicator value={3} progress={...} size={48} />` in zone-badges above bundle 3.
  - `<LabelCallout text="三个十" fontSize={44} progress={...} />` in zone-labels under bundle 3.

#### Cue 5 — `tens-are-the-faster-way` (Beat 5)

- **Purpose.** Make the speed difference visible side-by-side: same total, far fewer counts on the bundle side. The new unit is the convenient unit when there are many things (pedagogy Beat 5, focal: "the side-by-side contrast between the long row of loose ones and the short row of bundles, with their respective counts visible at the same time").
- **Anchor element.** The two `<StepTally>` pills — "十步" over the loose row, "三步" over the bundle row — entering as the contrast narration names them. The pills are the literal speed argument: their numeric content matches what the mouth says (pedagogy §7).
- **Semantic groups on screen.** Two groups, deliberately:
  - Top group: 10 loose sticks in a row (same primitive, same color, same scale — this row exists because Beat 5 *needs* the comparison; it is not "two pictures stapled together" in the visual-discipline §10 sense because both rows are the SAME PRIMITIVES, only count and grouping differ — this is the kids-eye §4 / visual-discipline §10 fix, identity preserved across the comparison).
  - Bottom group: 3 tied bundles (the row from Cue 4, translated down and slightly left to make room for the loose row above).
- **Allowed change vs previous cue.**
  - *First 25%:* the row of 3 bundles from Cue 4 reflows downward to occupy the bottom half of zone-objects (~24f, `EASE.inOutCubic`). The badges 1, 2, 3 fade out (they did their job; in Beat 5 the *row-length* and the tally pills are the new readers). The labels 一个十/两个十/三个十 also fade — Beat 5 is about the count-length contrast, not the unit-name recall. *Caveat: if Wave 4 finds that fading the labels makes the bundles harder to read, the 一个十/两个十/三个十 labels MAY persist at half-opacity; treat as a Wave 4 tuning decision, not a Wave 2 mandate.*
  - *Middle 50%:* 10 loose sticks (identical SmallStick primitives) fade or slide in to occupy the top half of zone-objects, forming a row above the bundle row. They are the same orange stick, same scale, same outline as every previous stick in the lesson. ~20f entrance.
  - *Last 25%:* the two StepTally pills enter in zone-tally — "十步" pill over the loose row, "三步" pill over the bundle row — staggered to match narration "数 '一' 要走十步，数 '十' 只走三步" (Wave 3 owns the stagger). Both pills hold to end of cue so the child can read both at once. A single sketch mark may appear under "三步" or between the two pills as the lesson's closing accent (one mark, navy or vermilion-under-ink-wash, per ink-wash style overlay — sketch-layer owns the choice).
- **Forbidden.** No "10" digit. No "30" digit. The brief is unambiguous (the narration says "十步" and "三步", which are step-counts of the named units 一 and 十, NOT the numerical values of the things being counted). No equation between the rows. No arrow or "→" implying the two rows are an operation — they're a SIDE-BY-SIDE COMPARISON of two counting modes over the same total, not a transformation. No reflow of the 10 loose sticks into 2×5 grid (visual-discipline §5: 10 ones must read as one group of 10, not two groups of 5).
- **Identity-invariant.** The 10 loose sticks in the top row are the same `<SmallStick color="reward" length=100 thickness=14>` as every previous stick in the lesson. The 3 bundles in the bottom row are the same `<StickGroup layout="bundle">` + `<BundleWrap style="rope">` from Cues 2–4 — translated, not rebuilt. No color shift to mark "old way" vs "new way" (kids-eye §4 forbids "calm gray before, celebratory orange after"); both rows are the same orange sticks. The CONTRAST IS THE ROW-LENGTH AND THE TALLY COUNT, not the visual species.
- **Primitive props used.**
  - Top row: `<StickGroup count={10} layout="row" rowGap={110} color="reward" stickLength={100} stickThickness={14} />` at upper zone-objects.
  - Bottom row: existing 3 bundles `<StickGroup layout="bundle">` + `<BundleWrap>` instances translated to lower zone-objects.
  - `<StepTally steps={10} variant="numeric" label="步" size={56} />` in zone-tally above top row's centroid.
  - `<StepTally steps={3} variant="numeric" label="步" size={56} />` in zone-tally above bottom row's centroid.
  - Optional sketch mark (Wave 4 sketch-layer decides exact form): one `<TeacherMark kind="vs-mark">` or a vermilion accent stroke as the lesson's single ink-wash signature, anchored between the two pills or under "三步" — at most one mark in the entire video.

---

## §4 Cue-relative choreography phases

Phases are described as proportions of each cue's duration (first 25% / middle 50% / last 25%). Wave 4 composer maps these to absolute frames using ASR cue boundaries. No frame literals here.

| cue | first 25% | middle 50% | last 25% |
|---|---|---|---|
| 1 `loose-count-felt` | row of 10 sticks present, no badges | 10 CountStepIndicators cascade on, paced to narrator's 一、二、三…十; active-highlight walks the row | full row + 10 badges holds; brief settle so the labor registers |
| 2 `bundle-is-one-count` | 10 badges fade out; sticks remain in row | sticks compress into bundle layout; BundleWrap fades on (already tied); CountStepIndicator value=1 pops on above bundle | 一个十 LabelCallout fades on under bundle; narrator names "一个十" |
| 3 `tens-count-like-ones` | bundle 1 (+ label 一个十 + badge 1) translates leftward | bundle 2 slides in from right, settles next to bundle 1 (atomic — already tied) | CountStepIndicator value=2 pops on; 两个十 LabelCallout fades on |
| 4 `pattern-holds` | bundles 1, 2 (+ labels + badges) translate leftward | bundle 3 slides in, settles in row | CountStepIndicator value=3 pops on; 三个十 LabelCallout fades on; brief hold to read the row's sameness |
| 5 `tens-are-the-faster-way` | 3-bundle row reflows downward; per-bundle badges/labels fade | 10 loose sticks fade/slide in above the bundle row | "十步" StepTally enters above top row; "三步" StepTally enters above bottom row; hold to end; optional single sketch accent |

---

## §5 Finger-cover test on the climax beat (Beat 5)

Cue 5 is the climax — the comparison must teach without any one element. Run the test against the still frame at Beat 5's last-25% hold (both tally pills visible, both rows visible).

- **Cover the "十步" tally pill.** The picture shows a long row of 10 loose sticks above a short row of 3 bundles, with "三步" still readable above the bundles. The visible argument survives — the row-length contrast is the main signal. The pill enhances it, doesn't carry it alone. PASS.
- **Cover the "三步" tally pill.** Similar — the row-length contrast survives; "十步" labels the long row. PASS.
- **Cover BOTH tally pills.** Two rows visible: 10 vs 3, same orange sticks vs same coral-roped bundles. The child can see "left is many, right is few" — but the *named units* (步) require the pills to be explicit. The picture without the pills teaches "fewer things" but not specifically "fewer counts of the same total." So both pills together are load-bearing for the *count-length* argument (not just visible-quantity). KEEP both.
- **Cover the top row of 10 loose sticks.** Only the bundle row remains with "三步" pill. The lesson collapses to "three bundles, three counts" — the speed CONTRAST is gone. FAIL — confirms the top row is load-bearing.
- **Cover the bottom row of 3 bundles.** Only the loose row remains. The lesson collapses to "ten sticks, ten counts" — also no contrast. FAIL — confirms the bottom row is load-bearing.
- **Cover EVERYTHING except the bundle row.** A row of 3 tied bundles remains. A 6-year-old who has been through Beats 2–4 reads this as "three tens." The contrast is gone, but the unit identity survives — the bundle primitive carries "tied as one ten" cleanly at lesson scale. PASS (the teaching object itself is honest; the comparison adds the *speed*, not the *unit*).
- **Cover the BundleWrap rope and bow on each bundle.** The 3 bundles collapse visually into 3 dense groups of ten sticks each, no rope. A 6yo cannot tell at first read whether they are "3 groups of ten" or "30 loose sticks in tight rows." FAIL — confirms BundleWrap is the load-bearing carrier of the "bound as one unit" signal, and the rope+bow style is the right choice (the band variant would fail this same test by reading as a horizontal rod; the ribbon variant would add tail noise that competes with the pills above).

Climax verdict: the picture teaches the speed contrast through its composition (row-length + count-tally), not through any single chrome element. All visible elements are load-bearing. No decoration to delete.

---

## §6 One-metaphor check

The lesson has one metaphor: **"count the same ten two ways, then extend."** The Beat 1 row of ten, the Beat 2 bundle, the Beat 3/4 row-of-bundles, and the Beat 5 side-by-side comparison are all views of *the same teaching object — the bundle as a counting unit* — at different stages of the argument. They share the same primitive (orange stick, with or without rope) at the same scale and tone.

Anti-pattern check: is Beat 5 secretly "two pictures stapled together" (visual-discipline §10)?

No. Both rows in Beat 5 use the IDENTICAL primitives — same SmallStick instance shape, same orange tone, same outline — composed into different layouts (10 loose vs 3 bundled). The "stapling" anti-pattern is when "before" and "after" use *different visual vocabularies* (e.g. flat gray strokes on the left, colored sticks on the right). Here both sides are the same primitive species, only count and grouping differ. This is precisely the kids-eye §4 / visual-discipline §10 fix: when comparison is unavoidable, compose both sides from the same primitives.

The pill labels ("十步" / "三步") are the *names of the count-lengths* the narration says aloud — they are the contrast made explicit, not a second metaphor.

---

## §7 Risk flags for downstream waves

**For Wave 3 (primitive-builder + voice/ASR).**

1. **No new primitive required.** All existing primitives carry the lesson's signals cleanly. Primitive-builder's task is only to verify that `<BundleWrap style="rope" knotPosition="top" wrapProgress={1}>` renders cleanly at this lesson's specific bundle width (~280 px) — at very small widths the top-bow geometry can crowd; we're well above that, but the primitive-checks PNG should confirm. If the bow reads cramped at our bundle width, propose a `bowScale` prop or accept a slightly larger `bandHeight`. NOT a primitive replacement.
2. **Voice risk: enumerated 一、二、三…十 cascade in Cue 1.** Brief narration notes flagged Gemini's KP1 precedent of stuttering on enumerated 一一 repetition. Wave 2b owns the final phrasing, but visual-design depends on the spoken count matching the visible cascade (pedagogy §7). If Gemini cannot deliver clean enumeration, Wave 2b's fallback ("我们一根一根地数") is the safe path — the cascade can pace to a uniform tick rather than per-syllable alignment. **Visual-design accepts either narration style; the cascade pacing is what Wave 3 must inform.** A flagged Gemini result here is not a Wave 4 problem.
3. **Cue 5 narration timing for the two StepTally pills.** "十步" and "三步" must each enter when the narrator says that specific number-word, not as a pair. ASR cue-internal events are needed (or Wave 2b pre-splits Cue 5 into two micro-cues). Wave 4 composer needs per-pill enter frames, not a single cue boundary.

**For Wave 4 (composer + sketch-layer).**

4. **Identity-invariance enforcement across cues.** The same `<StickGroup>` instance lives across Cues 1 → 2 (row → bundle layout). Composer must use React component continuity (same key, same parent) and animate the layout transition via `compress`/`bundleGap` interpolation, NOT mount/unmount. Mounting fresh sticks for Cue 2 violates kids-eye §4.
5. **Bundle row translation across Cues 2 → 3 → 4 → 5.** Each new bundle joins an existing row, and the existing bundles translate to make room. Composer must use a single positioning function (e.g. `bundleRowX(index, totalBundles)`) so the row recenters consistently across cues — not three separate cue-local translations that don't line up.
6. **Sketch layer: ONE mark in the whole video, Cue 5 only.** Restraint (`early-childhood-visual-taste` motion section, ink-wash `.agents/styles/ink-wash/animation.md`). The mark is the lesson's vermilion accent (per ink-wash style budget ≤ 5% frame area). Sketch-layer must refuse to add per-cue marks anywhere else. If sketch-layer's first instinct is to add a mark to Cue 2 ("name the unit") or to Cue 4 ("pattern arrow"), it is overshooting the brief — refer back to this constraint.
7. **Caption ribbon height at 720-px composition.** zone-caption is 80 px tall — minimum caption-line at 38 px renders into it cleanly with 2-line wrap. Composer must NOT shrink the ribbon to "fit" estimated narration length (visual-discipline §10 anti-pattern). If a single line of narration is short, the ribbon stays sized to the contract; whitespace is the cue's responsibility, not the ribbon's.

---

## §8 Self-check

Running the kids-eye §5 + visual-discipline §1/§7/§8 + pedagogy §9 audits before reporting back:

1. **Kids-eye measurement block written.** Yes (§1). Numbers are measurements, not adjectives.
2. **Zones declared, disjoint, every element belongs to a named zone.** Yes (§1.5). The badges/tally zone-reuse is temporal-disjoint, not spatial-overlap, with the rule stated explicitly.
3. **Every element answers "what unique signal does this carry?"** Reviewed each (sticks = the ones; bundles = the tens; per-stick badges = the count-by-ones; per-bundle badges = the count-by-tens; 一个十/两个十/三个十 = the unit name in words; tally pills = the count-length contrast; sketch mark = the closing accent). No duplicates. No chrome.
4. **Finger-cover test simulated on the climax.** Yes (§5). All visible elements are load-bearing; none deletable.
5. **Identity preserved across transformation.** Yes (§3 identity-invariant, §6 one-metaphor check). Same SmallStick across all cues. Same BundleWrap across Cues 2–5. Bundle 1 = bundle 2 = bundle 3 pixel-identical except x.
6. **Pedagogy §1 discovery sentence per cue.** Each contract row's *Purpose* mirrors the pedagogy `discovery` line directly. No cue exists without a discovery.
7. **Pedagogy §3 stage discipline.** All cues at stage `represent` (per pedagogy.md). No cue introduces stage `symbolize` content — no digit "10/20/30", no 十位/个位, no equation form. Confirmed.
8. **Pedagogy §4 narration prepares, picture delivers.** Cue 2 explicitly: rope ties first, *then* narrator names "一个十". Cue 5: rows visible first, *then* "十步"/"三步" pills enter. No narration-leakage path.
9. **Pedagogy §5 one cognitive task per cue.** Each cue asks one mental thing: Cue 1 = count by ones; Cue 2 = recognize the new unit and its first count; Cue 3 = advance the new count; Cue 4 = generalize; Cue 5 = compare. No cue smuggles in a second task.
10. **Pedagogy §6 focal element changes.** Each cue's anchor element is the one that changes; supporting elements are quiet. The "previous label opacity stays at full vs fades to half" question in Cue 5 is left to Wave 4 because both readings preserve focal discipline — only the visual quietness threshold is tunable.
11. **Pedagogy §7 spoken count matches visible count.** Cue 1 = 10 said aloud, 10 ticks shown. Cue 2 = "一个十" said only after the unit is visible. Cue 3 = "两个十" said as badge `2` arrives. Cue 4 = "三个十" said as badge `3` arrives. Cue 5 = "十步" said when 步=10 pill is visible; "三步" said when 步=3 pill is visible.
12. **Visual-discipline §3 container earns existence.** Two surfaces: paper background + caption ribbon. No third surface anywhere. No card behind a bundle, no tinted box behind labels.
13. **Visual-discipline §7 text earns existence.** Every string named in text-budget is load-bearing. No chrome header. No redundant tally outside Cue 5.
14. **Visual-discipline §10 anti-patterns.** No frame literals (none — visual-design owns intent only). No "two pictures stapled" (Cue 5 fix in §6). No re-rendering the teaching unit per cue (§7 risk #4 calls this out for composer). No caption shrink-to-fit (§7 risk #7).

If any of the above fails Wave 4 grading, the contract — not the choreography — gets revised.

---

## §9 Source-of-truth references

- `lesson-data/kp2v2-counting-by-tens/brief.md` — lesson identity, continuity, style.
- `lesson-data/kp2v2-counting-by-tens/pedagogy.md` — per-beat discoveries (PRIMARY upstream).
- `lesson-data/kp2v2-counting-by-tens/storyboard.md` — 5 cue IDs, narration intent, visual-change descriptions.
- `.agents/skills/lesson-pedagogy/SKILL.md` — discovery shapes, narration-leakage, focal change, spoken=visible count.
- `.agents/skills/kids-eye/SKILL.md` — measurement, zones, one-signal, finger-cover, identity.
- `.agents/skills/visual-discipline/SKILL.md` — Visual Contract, container/text earns existence, render-and-critique.
- `.agents/skills/early-childhood-visual-taste/SKILL.md` — palette, motion vocabulary.
- `.agents/styles/ink-wash/` (STYLE.md, palette.md, animation.md, strokes.md, capabilities.md) — style overlay.
- `remotion-svg-primitives/src/shape-primitives/counting.tsx` — primitive prop surfaces (`SmallStick`, `StickGroup`, `BundleWrap`, `CountStepIndicator`, `StepTally`, `LabelCallout`).
- `remotion-svg-primitives/src/shape-primitives/sketch.tsx` — `TeacherMark` prop surface.
- `remotion-svg-primitives/src/theme.ts` — composition `video.{width:1280, height:720, fps:30}`, palette tokens.

---

## §New Primitive

None proposed. All five cues are carried honestly by existing primitives (`SmallStick`, `StickGroup`, `BundleWrap` with `style="rope" knotPosition="top"`, `CountStepIndicator`, `StepTally`, `LabelCallout`, `TeacherMark`). The brief's continuity list matched the pedagogy's needs without modification.

Notably, the bundle "tied as one unit" signal is carried by `<BundleWrap style="rope" knotPosition="top">` — the rope-with-top-bow variant. We evaluated all three style variants honestly:

- **rope (chosen).** A coral rope band running the full bundle width plus a small bow above it. The bow makes "tied" unambiguous — the rope alone could read as a stripe; the bow disambiguates. KP1 already proved this read at lesson scale (the bundle's appearance was the climax of KP1 and tested under that same finger-cover discipline).
- **band.** A simple rounded rectangle across the bundle. Reads as a horizontal rod or a sleeve, not a tie (the visual-discipline §2 anti-pattern documented in our own skill). Rejected.
- **ribbon.** Band plus a flag-shaped tail. The tail adds horizontal noise that competes with the per-bundle count badge directly above and the unit-name label directly below (zone-badges and zone-labels both occupy x-positions near the bundle). At a row-of-3 layout, three ribbons in a row plus three badges plus three labels makes the strip read busy. Rejected for KP2v2 specifically.

So the existing `rope` variant is the load-bearing pick. No new primitive needed.
