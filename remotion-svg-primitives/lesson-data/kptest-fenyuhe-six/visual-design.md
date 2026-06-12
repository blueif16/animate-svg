# Visual Design — kptest-fenyuhe-six (6的分与合)

Visual Contract for the 6的分与合 lesson. Same routine as 5的分与合, extended to a new whole (6). Built from `brief.md` + `pedagogy.md` + `storyboard.md` (the only lesson-specific inputs). Per-cue discovery refs come from `pedagogy.md` §"Per-cue discovery list".

---

## 1. Kids-eye measurement block (kids-eye §1)

```
composition:             1920×1080 @ 30fps   (fixed)
short-side:              1080 px

teaching-unit:           single dot (one of the six identity-invariant dots)
teaching-unit-min:       ≥ 8% short-side = 86 px  → 130 px
teaching-unit-target:    12–15% short-side = 130–160 px  (we ship 130 px)

primary-label-min:       N/A  (no on-screen text-as-glyph — stage ceiling: concrete)
body-label-min:          N/A
caption-line-min:        56 px rendered  (LessonCaptionLayer ribbon; load-bearing for accessibility)
separation-gap-min:      ≥ 6% short-side = 65 px  (readable gap between the two groups when the six dots SPLIT; below this the two groups read as one blob of six)
chrome-label:            FORBIDDEN
```

Fit check (densest cue `split-3-and-3`): 3×130 + 2×30 + 65 gap + 3×130 + 2×30 = **965 px wide × 130 px tall** — both groups clear the 65 px split floor. Co-present `zone-objects` (y=475–605) + `zone-caption` (y=920–1040) + `zone-pointer` (y=350–450) all fit disjointly (see §2).

---

## 2. Spatial zones (kids-eye §1.5, disjoint computed)

| Zone | x, y, w, h (px) | Holds | Active in cues |
|---|---|---|---|
| `zone-title` | 300, 200, 1320, 360 | `<LessonIntroCard>` (title + section + KP teaser) | 1 Phase A only |
| `zone-objects` | 475, 475, 970, 130 | The six identity-invariant dots (row OR split) | 1 Phase B → 9 |
| `zone-pointer` | 860, 350, 200, 100  (or 475, 350, 130, 100 for 1-dot-group cues) | `<PointerHandArrow variant="hand">` / `<PulseCircle>` — "your turn" affordance | 3, 5, 7, 8 |
| `zone-caption` | 0, 920, 1920, 120 | `<LessonCaptionLayer>` ribbon | 1 Phase B → 9 |

**Disjointness (pairwise intersections, delivery frame):**

- `zone-title` ∩ `zone-objects` = `{}` **time-disjoint** — `zone-title` in cue 1 Phase A only (per `announce-topic` `requires`); `zone-objects` from cue 1 Phase B onward.
- `zone-objects` ∩ `zone-pointer` = `{}` (objects y=475–605; pointer y=350–450).
- `zone-objects` ∩ `zone-caption` = `{}` (objects y≤605; caption y≥920).
- `zone-pointer` ∩ `zone-caption` = `{}` (pointer y≤450; caption y≥920).
- `zone-title` ∩ `zone-caption` = `{}` (title y=200–560; caption y=920–1040).

**Z-order legibility (kids-eye §1.5):** nothing readable is occluded. Caption is bottom-anchored; the pointer lives in `zone-pointer` (never enters `zone-objects`, never sits on the dots). Title reads alone first, dots enter after — never overlaid.

---

## 3. Visual language (early-childhood-visual-taste)

**Palette (theme keys, via `resolveColor`):**

| Role | Token | Hex | Used for |
|---|---|---|---|
| Canvas background | `cream` | `#FFF7E6` | Whole scene (1 surface) |
| Teaching unit | `reward` | `#FFB84D` | The six identity-invariant dots (their only color across every cue) |
| Ink (readable + signaling) | `textNavy` | `#24324B` | Caption ribbon text; "your turn" pointer affordance |
| Dimmed / inactive | `softGrayBlue` | `#B5C0D0` | Reserved for the unrevealed side of a split only if a side is ever shown as "not yet active" — DEFAULTS TO NOT USED (identity fence: the dots keep their orange across the transformation; see §5 identity-invariant) |

**4-meaningful-color budget:** cream + reward + textNavy = 3. A fourth (`sunshine`) is reserved for ONE climax accent (§5 motion-budget / §6 anti-patterns). Coral is **not** used — there is no bundling action, no rope, no operator glyph; the splits are concrete dot motion.

**Typography:** `fontFamily` from `src/shape-primitives/shared.tsx`. No decorative faces. Caption ribbon ≥ 56 px (load-bearing for accessibility — the spoken Chinese is the only "label" in this lesson).

**Motion vocabulary (frame counts = intent; W4a realizes per `EASE.*` / `SPRING.*`):**

| Move | Frames | Curve | Use in this lesson |
|---|---|---|---|
| Default small move | 12 | `EASE.outCubic` | Pointer affordance entrance, badge pop |
| Default big move | 24 | `EASE.inOutCubic` | Dot split (row → 1+5 / 2+4), dot recombine |
| Climax move (ONE per video) | 30 | `EASE.outQuint` | The 3+3 symmetric split (the lesson's highlight) + the symmetric hold's settle |
| Slide-in / fade-on entrance | 16–20 | `EASE.enter` | Six dots entering the row in `routine-reprise` Phase B |

**Sketch tone:** N/A — this lesson carries **no teacher marks**. The voice is the only "teacher" channel; the picture carries the concrete instance (the dots that move). Per the storyboard, the "your turn" affordance is `<PointerHandArrow variant="hand">` or `<PulseCircle>` (signaling chrome, not a sketch mark).

---

## 4. Visual Contract (visual-discipline §1)

```
metaphor:        six identity-invariant dots in a row 分 into two groups, then 合 back into the row; the routine transfers from 5的分与合 to a new whole (6)
regions:         zone-objects holds the six dots (row ↔ split); zone-pointer holds the "your turn" affordance (echo/aggregator only); zone-caption holds the narration ribbon; zone-title holds LessonIntroCard (cue 1 Phase A only, time-disjoint)
between-states:  the same six dots live the whole video; only the row↔split layout changes. The dots are never destroyed and recreated. The split is one continuous motion, not two pictures stapled together.
reading-order:   split cue:  row → group separates → both groups held (the bond reads) → recombine → row
                 echo cue:   held split (no new motion) + pointer affordance → recombine tail to row
                 aggregator: assembled row + PulseCircle + held silence
                 recap:      six dots stay visible while ONE live highlight walks 1+5 → 2+4 → 3+3
decoration-budget:  1 cream background + 1 caption ribbon = 2 surfaces. Reward orange + textNavy = 2 meaningful colors. Sunshine reserved for ONE climax accent.
text-budget:     ZERO on-screen text-as-glyph (no digits, no Chinese characters, no equation form, no FenHeDiagram — stage ceiling = concrete + represent). The only readable text is the spoken-Chinese caption ribbon. Counts live in the dots + the voice.
occupancy:       horizontal axis is binding. Row = 930 px / 1920 = 48%; split = 965 px / 1920 = 50%. Vertical (non-binding) hosts the dot band at 130 px = 12% of 1080. The vertical whitespace is structured margin (caption below + pointer above when active), not decoration — the dot-row is a known exception to the ≥50% non-binding-axis rule; the kids-eye target (130 px = 12-15%) ships the right value.
identity-invariant: the six dots are the same six `<UnitBlock variant="dot">` instances across the whole video, at the same `reward` orange, the same 130 px diameter, the same edge treatment, whether row, split, or held in the symmetric pairing. No color shift. No shape change. No re-creation per cue.
```

---

## 5. Per-cue motion budget (visualMotionSeconds — intent, no absolute frames)

W3.5 reconcile = `max(narrationSeconds, visualMotionSeconds) + tail`. The column below is the **visual side**; W2b narration is targeted to fit it, W3a measures the actual ASR cue, W3.5 picks the larger.

| # | Cue id | Discovery (pedagogy) | Stage | Visual motion (intent) | Frames (intent) | Notes |
|---|---|---|---|---|---|---|
| 1 | `routine-reprise` | 6 will be split the same way 5 was | represent | Phase A: title alone (≈ 1.8 s). Phase B: 6 dots enter as a row (16–20 fr `EASE.enter`, one-per-dot stagger) + hold (≈ 1.5 s). | ~3.3 s | `announce-topic` `requires`: title alone first, dots enter after. No dots / pointer / caption during Phase A. |
| 2 | `split-1-and-5` | 6 can be split into 1 and 5, and combined back | concrete | Row → split (24 fr `EASE.inOutCubic`) → hold (≈ 1.5 s, voice names the bond) → recombine (24 fr) → row. Cue ends ON THE SPLIT. | ~5.0 s | `model-target-slow → reveal`. Voice: "6可以分成1和5；1和5合成6" (complete bond, per §4 carve-out). End on split so cue 3 can hold without re-introducing motion. |
| 3 | `echo-1-and-5` | child retrieves the 1和5 bond | concrete | Held split + `<PointerHandArrow variant="hand">` above the "1" group (12 fr `EASE.outCubic`) + recombine tail (24 fr) → row. | ~5.5 s | `learner-response-gap` ≥ 3–5 s. The held grouping IS the prompt. No on-screen text. |
| 4 | `split-2-and-4` | 6 can be split into 2 and 4, and combined back | concrete | Row → 2+4 split (24 fr) → hold (≈ 1.5 s) → recombine (24 fr) → row. Ends on the split. | ~5.0 s | Co-equal airtime with cue 2. |
| 5 | `echo-2-and-4` | child retrieves the 2和4 bond | concrete | Held 2+4 split + pointer affordance + recombine tail. | ~5.5 s | Same shape as cue 3. |
| 6 | `split-3-and-3` | 6 splits exactly in half — the equal-split highlight | concrete | Row → 3+3 split (30 fr `EASE.outQuint` — the ONE climax move) → symmetric hold (≈ 2.0 s) → recombine (30 fr) → row. Ends on the symmetric split. | ~6.0 s | The climax (per pedagogy "Co-equal airtime"). Extra symmetric DWELL lives here AND extends into cue 7. |
| 7 | `echo-3-and-3` | child retrieves the 3+3 equal-split bond | concrete | Held 3+3 symmetric split (≈ 1.0 s) + pointer affordance (CENTERED above the pairing) + recombine tail. | ~6.5 s | "Extra dwell, not extra cues." Pointer sits above the symmetric pairing, not above a single group. |
| 8 | `aggregator-prompt` | child retrieves the SET of all three splits | represent | Assembled row (recombine from cue 7 lands) + `<PulseCircle>` around the row + held silence. | ~6.5 s | `invite-echo → learner-response-gap`. Held whole + affordance IS the prompt. Voice: "6可以分成几和几?". 1+5-only or 3+3-only answer is partial — design enforces co-equal retrieval. |
| 9 | `recap` | child confirms the part–whole structure of 6 | represent | `<RecapSpotlight>` walks 1+5 → 2+4 → 3+3 (3+3 last so the highlight is preserved). Per item: dots resolve into that X+Y grouping (≈ 1.0 s) + live highlight lands (≈ 1.0 s) + hold (≈ 1.0 s). Prior items visible-but-quiet; highlight on the current one. | ~10.0 s | `spaced-recall`. Three sequential `RecapSpotlight` items, NOT three fresh `PartWholeComposer` runs. Earlier items dim via `softGrayBlue` only if `RecapSpotlight` supports that; otherwise keep them at the same orange (identity fence) and let the highlight do the work. |

**Sub-total:** ≈ 53.3 s — inside the brief's 60–90 s band with margin for tail + transitions; W3.5 reconcile extends as needed (`max(narration, motion) + tail`). **Re-engagement:** recap (cue 9) is the major beat; cue 8's aggregator prompt is a structural re-engagement; cue 6–7's symmetric hold re-engages for the 3+3 highlight. No >30 s stretch goes static.

---

## 6. Reuse-primitive table (catalog-digest.md is the inventory)

| What | Capability id | Component | Why this, not a hand-roll |
|---|---|---|---|
| The six dots (whole lesson, identity-invariant) | `unit-block` | `<UnitBlock variant="dot">` × 6 | Registered primitive; `dot` variant. Caller renders N instances; never hardcoded as inline SVG. |
| The split → recombine motion (3 split cues) | `part-whole-composer` | `<PartWholeComposer mode="split" then mode="merge">` | Registered; wraps the 6 dots; the routine vocabulary from 5的分与合. NOT hand-rolled. |
| Title card (cue 1 Phase A) | `lesson-intro-card` | `<LessonIntroCard>` | Registered; `announce-topic` `requires` is met by its layout. |
| Recap stack (cue 9) | `recap-spotlight` | `<RecapSpotlight>` | Registered; ONE live moving highlight that lands on the current item (earlier items visible-but-quiet). |
| "Your turn" affordance (echo + aggregator cues) | `pointer-hand-arrow` / `pulse-circle` | `<PointerHandArrow variant="hand">` or `<PulseCircle>` | Registered; signaling chrome in `zone-pointer` (NOT in `zone-objects`). W3b confirms or substitutes — both are listed candidates. |
| Moving-hold wrap (rule #6) | `breathe` | `<Breathe phaseSeed="kp6-dots" amplitudeScale={0.005} bpm={15}>` around the 6-dot group | Rule #6 fence: no truly frozen frame. Default `phaseSeed` per group. Per-load-bearing-group — only the currently-load-bearing group breathes at a time. |
| Caption ribbon | `lesson-caption-layer` | `<LessonCaptionLayer>` | Registered; bottom-anchored; ≥ 56 px; the only readable text. |
| Motion curves | `motion-vocabulary` | `EASE.{enter, outCubic, inOutCubic, outQuint}`; `SPRING.*` (likely unused — no bouncy spring for this lesson) | Per the per-cue motion-budget table above. NO raw `Easing.bezier(...)` literals. NO inline `config: { damping, stiffness, mass }`. |
| Captions / SFX | `lesson-bgm-layer`, `lesson-sfx-layer` | W2c owns; W4a wires at composer-owned frames | `fromFrame` = `cueFrames(id) + named offset`, never a literal. |

**Not used (refusals — explicit):** `fen-he-diagram` + `number-card` (numerals, stage-ceiling violation); `count-step-indicator` + `step-tally` (re-badges an already-grouped set; kids-eye §2 — the grouping IS the signal); `bundle-wrap` (DEPRECATED — belongs to kp2's roped-bundle morph); `asset-morph` (no parametric→asset transition in this lesson); `<Sparkle>` / `<ShineSweep>` / `<GlintFlash>` / `<GlowPulse>` (at most ONE `<Sparkle>` reserved for the 3+3 climax); any decorative environment, mascot, or 3D card.

---

## 7. Anti-patterns to refuse (terse)

- **Two pictures stapled together.** Split + recombine is ONE continuous motion; the recombine is the picture's job.
- **On-screen numerals / Chinese glyphs / equation form.** Stage ceiling = concrete + represent. FenHeDiagram forbidden.
- **Color shift across the transformation.** Dots stay `reward` orange from cue 1 to cue 9.
- **Re-rendering the dots per cue.** Same six `<UnitBlock variant="dot">` instances live the whole video; layout reflows, identities don't.
- **A badge above a dot that's already in the highlighted group.** `PartWholeComposer` carries the split signal.
- **Pointer affordance on the title card.** `announce-topic` `requires` is "title alone first."
- **A pointer in the recap that doesn't follow the current item.** RecapSpotlight's "current item only" is a bug-class — verify cue-relative, not a stale frame.
- **Frame literals in scene code.** Every frame = `cues[id].startFrame + offset` (or `endFrame - offset`); every curve = a named `EASE.*` / `SPRING.*` / `<PopIn>`.
- **Multiple emphasis effects in one cue.** ONE `<Sparkle>` reserved for the 3+3 climax.
- **A `<Breathe>` on a non-load-bearing element.** Only the currently-load-bearing group breathes.
- **Three nested surfaces.** Two surfaces max (cream background + caption ribbon).
- **Any teacher mark / sketch ink in this lesson.** The "your turn" affordance is signaling chrome (PointerHandArrow / PulseCircle), not a sketch mark.

---

## 8. Cross-references (state each rule ONCE)

Discovery + reinforcement plan → `pedagogy.md`. Beat IDs + teaching-action tags → `storyboard.md`. `announce-topic` "title alone first" + z-order → `TEACHING-ACTIONS.md#announce-topic` + `kids-eye` §1.5. Identity fence → `kids-eye` §4. Palette + motion numbers → `early-childhood-visual-taste`. Reuse targets → `catalog-digest.md` (read-only; do not re-read primitive source). `motion-budget` is the visual side of W3.5 reconcile = `max(narration, visualMotionSeconds) + tail` — W2b writes narration to fit, W3a measures ASR, W3.5 picks.
