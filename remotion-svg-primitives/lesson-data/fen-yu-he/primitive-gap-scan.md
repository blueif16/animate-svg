# fen-yu-he — primitive gap-scan (Wave 3b)

Input (read-only): `lesson-data/fen-yu-he/visual-design.md` (Visual Contract + per-cue table),
cross-checked against this lesson's own `pedagogy.md` and `storyboard.md` for completeness of
the visual demands. Primitives surveyed **first-hand in code** (not via other lessons):
`src/shape-primitives/counting.tsx`, `.../sketch.tsx`, `.../index.ts`, `.../literacy.tsx`,
`src/motion-primitives/PopIn.tsx` + `index.ts`, `src/fx/index.ts`, `src/scenes/SceneFrame.tsx`,
`src/theme.ts`, and `.agents/CAPABILITIES.md`.

## Verdict (lead with it)

**NO new primitive ships. Every visual demand is covered by composing existing primitives.**
This is the good default per CLAUDE.md ("Default answer is *compose existing primitives*"). Zero
test stills were rendered because nothing was built. The one demand that warranted real scrutiny —
the CLAUDE.md-mandated topic-intro card — resolves to a composition of existing text primitives,
NOT a new primitive (decided explicitly in §3).

---

## 1. Every visual demand the lesson makes

Enumerated from the visual-design cue table, cross-checked against pedagogy/storyboard so no
demand is missed. For each: the cue(s) it serves, the existing primitive that covers it (with the
code line range I verified), and the finger-cover note (kids-eye §7/§3 — what unique signal does
this carry, and does it read as its teaching unit at the cue's render size on the 1280×720 canvas?).

| # | Visual demand | Cue(s) | Covered by (existing, verified) | Finger-cover note |
|---|---|---|---|---|
| 1 | Two-line topic-announce card: lesson title ("5 的分与合") + one-line KP teaser; focal text only here, then it clears before the candies arrive | `intro-title` | **Composition** of two `LabelCallout` instances (counting.tsx L1962–2022; barrel-exported via index.ts L8-ish in the `counting` export). `text`, `fontSize`, `color`, `fontWeight`, `progress` fade-in, optional `underline`. Title `fontSize ≥ 48` (primary-label-min), teaser `fontSize ≥ 36` (body-label-min). | The two lines carry the topic name + the promise of the task — nothing else on screen does. Centered navy text reads as "a title" at 1280×720. Build-vs-compose decided in §3. |
| 2 | Five identical countable candies arriving + settling as ONE centered heap; the stable identity reused for every later candy cue | `five-whole` (+ all later candy cues) | `CountableObject` (counting.tsx L267–312). variant `fruit`, `color="reward"`, `size` default 96 px (= 13% of 720 short-side = teaching-unit-target), composer-set `x/y`, supports `selected`/`dimmed`. Entrance via `<PopIn motion="snap">` (PopIn.tsx, `PopMotion` confirmed L5). | One candy carries "a countable unit" — nothing else does. 96 px clears teaching-unit-min (58 px) and hits target. Cover one candy → still a candy group; cover ALL candies → the `concrete` cues collapse, confirming the candy IS the teaching object, not chrome-propped. ✓ |
| 3 | A coral divider line on the heap centerline that draws on, separates the candies left/right, then disappears (and returns for the ordered cues) | `split-into-two`, `recombine-inverse`, returns for `slide-one-at-a-time` | **Scene-local composition** — one thin coral `<line>`/`<rect>` with a `strokeDashoffset` draw-on, placed in `zone-divider`. The candies' left/right migration is `EASE.inOutCubic` `x` interpolation of the SAME `CountableObject` instances. No new primitive (decision D2). | The divider carries "the cut" (the coral action accent). Nothing else carries that signal. A single styled stroke with a dash reveal is below primitive-grade — building a `DividerLine` primitive would be over-abstraction. |
| 4 | The 分合式 part-whole notation: whole on top, two slanting stroke-on lines, two part-numbers below; one large instance | `read-fen-he-shi` | `FenHeDiagram` (counting.tsx L2124–2255). `whole`, `parts:[l,r]`, `progress` 0→1 (two diagonals are `pathLength=1` `strokeDashoffset` reveals; whole card lands first, part cards fade with `progress`), `diagramWidth`, `dimmed`, `lineColor`, `numberColor`. At `diagramWidth ≈ 240`, card = `width*0.36 ≈ 86` → glyph ≈ 60–72 px ✓ (body-label-min 36). | Carries "the split written as a symbol" — the lesson's central new representation. Nothing else carries it. Verified the draw-on mechanism in code; reads as a 分合式 at ≥ 200 px. ✓ |
| 5 | Identity-preserved "picture becomes symbol": the first 分合式's numerals are the SAME `NumberCard` instances migrating from the candy split into the diagram anchors — no cross-fade | `read-fen-he-shi` → `first-ordered-split` | `FenHeDiagram renderNumbers={false}` + `getFenHeDiagramAnchors(diagramWidth)` (counting.tsx L2074–2090 helper; L2223–2252 the `renderNumbers` gate; both barrel-exported). Composer places external `NumberCard` and interpolates each card's `x/y` from a candy/chip anchor to the diagram anchor. | The load-bearing kids-eye §4/§6 mechanism. The anchor helper exists precisely so the composer never hand-reverses offsets. Confirmed the mode is real in code, not aspirational. Nothing else provides identity-preserved glyph migration. ✓ |
| 6 | A results column of four small 分合式 stacked in slide order; "previously seen" rows can dim | `first-ordered-split`, `slide-one-at-a-time`, `ordered-column-complete`, `order-matters` | **Composition** of four `FenHeDiagram` instances at `diagramWidth ≈ 150` (→ glyph ≈ 48 px ✓ ≥ 36; ≥ 140 px floor from CAPABILITIES.md#fen-he-diagram respected), manually-spaced `y` down `zone-column`. `dimmed` prop for quieted rows in `order-matters`. | CAPABILITIES.md#fen-he-diagram **explicitly forbids** abstracting the row/column into a `FenHeRow`/`FenHeColumn` primitive ("the row IS the lesson scene's composition — abstracting it hides per-lesson layout"). So composing four instances is the *required* approach, not a gap. ✓ |
| 7 | A single candy sliding right→left across the divider, active-highlighted, four times; left/right counts tick | `slide-one-at-a-time` | The SAME `CountableObject` instance with `x` interpolated `EASE.inOutCubic`, transient `sunshine` active state (per-instance `color`/`selected`, supported L267–312). The count "tick" is delivered by the candies + the freezing column rows — NO separate counter chip (contract §4 forbids a "四种" counter). | The sliding candy carries "+1 on the left → next split." `CountableObject` already supports per-instance color and composer-driven `x`. No `CountStepIndicator`/`StepTally` needed — the count is delivered by visible rows, per contract. ✓ |
| 8 | A light navy emphasis traveling DOWN the four left-part numbers (1→2→3→4) | `ordered-column-complete` | `TeacherMark` (sketch.tsx; kinds `underline`/`label-arrow`, L144–295) placed cue-relative under each left-part number in turn, navy, `drawProgress` staggered; OR a composer-driven sunshine highlight. Lives in `zone-marks`. | Carries "read the column in order, the climb is 1-2-3-4." `TeacherMark` traces over `zone-column` without sitting inside a numeral box. One mark per beat, restraint per contract. ✓ |
| 9 | Top row (1,4) and bottom row (4,1) highlight in turn (sunshine pulse); every other row dims | `order-matters` | `FenHeDiagram` `dimmed` (`stateOpacity` reduces opacity) on the non-contrasted rows; the two contrasted rows get a composer-driven `sunshine` pulse (scale/opacity interpolation — accent #2). Optional `TeacherMark vs-mark`/`underline` with `boil` if it lingers (CAPABILITIES.md#sketch-boil). | Carries "order distinguishes (1,4) from (4,1)." `dimmed` is the built-in quieted state. Nothing new needed. ✓ |
| 10 | Caption ribbon at the bottom (accessibility) | all cues | Lesson-media caption layer (`zone-caption`) — pipeline feature, not a shape-primitive demand. | Out of scope for the shape-primitive gap-scan; covered by the existing caption layer. |
| 11 | Moving-hold (rule #6): each cue's primary load-bearing group never truly frozen | all held cues | `<Breathe>` (src/fx, barrel-exported src/fx/index.ts L6; CAPABILITIES.md#magic-fx-library) wrapped at the rendering site, unique `phaseSeed`, `amplitudeScale ≤ 0.005`. | Existing capability; composer obligation, not a new primitive. Candy heap, diagram, and column each get a distinct `phaseSeed`. ✓ |

**Refused / explicitly-not-needed primitives** (one-metaphor + contract discipline; all confirmed to exist in code):
- `PartWholeBrace` (counting.tsx L1075) — the 分合式 already encodes whole→parts; a brace is a second metaphor for the same idea. Refused per one-metaphor rule. NOT a gap.
- `EquationStrip` / `ComparisonSymbol` (counting.tsx L810 / L704) — exist, but pedagogy §3 + brief forbid the equation / `+ − =` stage. Refused. NOT a gap.
- `CountStepIndicator` / `StepTally` (counting.tsx L1768 / L1831) — exist, but the contract delivers the four-count via visible rows, not a counter pill (kids-eye §2 "one element, one signal"). Refused. NOT a gap.
- `SmallStick` / `StickGroup` / `BundleWrap` / `TenFrameRod` / `UnitBlock` — exist (a sticks/place-value lesson's vocabulary); irrelevant to a candy-split lesson. Not used.

Every demand in the cue table maps to an existing primitive or a sanctioned composition. **No demand is unmet.**

---

## 2. Build-vs-compose decisions (the named-gap discipline)

The default answer is *compose existing*. A new primitive ships ONLY when the gap is named and
composition genuinely cannot cover it. Each candidate, walked:

- **D1 — 分合式 diagram → COMPOSE (already exists).** `FenHeDiagram` is in the library with the exact
  API the lesson needs, including `renderNumbers={false}` + `getFenHeDiagramAnchors` migration mode
  (load-bearing for demand #5). Verified line-by-line, counting.tsx L2074–2255. No build.
- **D2 — divider line → COMPOSE (scene-local `<line>`), do NOT build `DividerLine`.** A single coral
  stroke with a `strokeDashoffset` draw-on at the stage centerline is a one-property scene detail,
  below "reusable craft behind a stable API" (CAPABILITIES.md protocol). A primitive would be
  over-abstraction. Composer draws it inline in `zone-divider`.
- **D3 — results column of four diagrams → COMPOSE, do NOT build `FenHeColumn`.**
  CAPABILITIES.md#fen-he-diagram *explicitly forbids* this abstraction. Composing four `FenHeDiagram`
  is the required approach.
- **D4 — candy slide / split / recombine → COMPOSE.** Pure `x/y` interpolation of existing
  `CountableObject` instances with named curves (`EASE.inOutCubic`). Motion is the composer's job;
  no primitive carries motion.
- **D5 — topic-intro card → COMPOSE (see §3, the one demand that warranted real scrutiny).**

No candidate crosses the build threshold. **Nothing is built.**

---

## 3. The topic-intro card — assessed explicitly (kids-eye §7, CAPABILITIES protocol)

CLAUDE.md mandates every lesson open with a text intro (title + section + KP teaser) that is "a
small composition of primitives, not a fixed template," and states that designing the intro layout
"is the gap-scan's job, never the composer's." So this demand gets first-class scrutiny.

**What ships today that could serve an intro:**
- `LabelCallout` (counting.tsx L1962, barrel-exported) — a single centered text line with `fontSize`,
  `color`, `fontWeight`, `progress` fade-in, optional `underline`/`underlineColor`. The
  general-purpose text primitive.
- `SceneFrame` eyebrow/title chrome (scenes/SceneFrame.tsx L67–110) — a FIXED top-left eyebrow+title
  header. The Visual Contract explicitly FORBIDS a "lesson-title header beside the stage" during
  teaching, so this chrome is not the intro mechanism.
- literacy.tsx exports (`HanziCard`, `PinyinSyllableCard`, `RadicalTile`, `ToneMarkGlyph`, etc.) —
  all subject-specific (Chinese-literacy); none is a general title/intro card. Confirmed by reading
  the export list. So there is no math-subject intro-layout primitive that "fits."
- `PrimitiveLabel` (shared.tsx) — internal `<text>` helper, NOT barrel-exported, so a scene cannot
  import it. Unavailable to the composer directly.

**Decision: COMPOSE the intro from two `LabelCallout` instances. No new primitive.** The mandated
layout (title line ≥ 48 px + KP-teaser line ≥ 36 px, stacked in `zone-title`, fading in via
`progress`, then clearing before the candies arrive) is two `<LabelCallout>` at different
`y`/`fontSize`. This is exactly "a small composition of primitives."

**Why this is NOT a named gap:** a gap would exist only if no primitive could render a readable
multi-line title at 1280×720. `LabelCallout` renders one line; two stacked instances render two
lines; the kids-eye minimums (48/36 px) are hit by passing those `fontSize` values. The "small
composition of primitives" language in CLAUDE.md anticipates exactly this — composing existing text
primitives, not minting a `TitleCard` primitive (which would bake the fixed template CLAUDE.md warns
against).

**Caveat handed to the composer (a constraint, not a gap):** `LabelCallout`'s
`appearStyle="write-on"` currently falls back to `"fade"` for CJK (counting.tsx L1962–1965 comment:
"Chinese glyph path write-on is brittle"; verified — both branches drive opacity off `progress`,
L1983). The intro title is Chinese ("5 的分与合"), so any "title write-on" the visual-design motion
note mentions will render as a FADE, not a stroke write-on. This is acceptable (fade-in is a clean
intro reveal) but the composer must not promise a glyph-by-glyph write-on for the Chinese title.

---

## 4. Test stills

**None rendered — nothing was built.** The build-vs-compose discipline (§2) resolved every demand
to an existing primitive or a sanctioned composition, so there is no new primitive whose hardest
frame / worst-case multiplicity needs a still.

The worst-case multiplicity for THIS lesson — a column of four `FenHeDiagram` at `diagramWidth ≈ 150`
during `order-matters` — is a property of the already-shipped `FenHeDiagram`. Its anchor helper
guarantees that diagrams placed `diagramWidth + gap` apart never overlap their part-cards
(getFenHeDiagramAnchors comment + math, L2055–2090), and at width 150 the glyph is ≈ 48 px ≥ 36 px
body minimum. That multiplicity will be exercised and visually graded by the composer's
render-and-self-critique loop (visual-discipline §8) and the Wave 6 contact sheet — it is not a
Wave 3b primitive-quality question because no Wave 3b primitive exists for this lesson.

---

## 5. Self-check (kids-eye §5)

1. Measurement block / zones read from visual-design.md; every demand's primitive clears the
   recomputed-for-720 minimums (candy 96 px ≥ 58; large 分合式 glyph ≈ 60–72 px ≥ 36; column glyph
   ≈ 48 px ≥ 36; title ≥ 48; teaser ≥ 36). Verified each against the primitive's own sizing math in
   code. ✓
2. Every primitive answers kids-eye §2 (one element, one unique signal) — see the finger-cover
   column in §1; no two carry the same signal; the refused primitives were the redundant/forbidden
   ones. ✓
3. Finger-cover (§3) simulated per demand — covering any candy still reads as a candy group;
   covering all candies collapses the concrete cues (candy is genuinely the teaching object). ✓
4. Identity preserved (§4) — same `CountableObject` instances all video; same `NumberCard` instances
   migrate via `renderNumbers={false}` + anchors; no recolor/resize/shape change; `dimmed` is a
   state (softGrayBlue via `stateOpacity`), not a replacement color. Mechanism verified in code. ✓
5. No new primitive → no new finger-cover note to author. The good default holds. ✓
