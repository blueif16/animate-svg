# fen-yu-he — sketch overlay (Wave 4b)

Inputs (read-only): `lesson-data/fen-yu-he/visual-design.md`, `pedagogy.md`, `storyboard.md`;
`src/lessons/fenYuHeLessonTimeline.ts` (canonical cue IDs only — never copied as absolute frames).
Output of this wave: teacher-mark overlays in **CUE-RELATIVE frames** (offsets from
`cues[id].startFrame`). The composer resolves them to real frames at scene-build time. NO
master-timeline absolutes anywhere in this file.

Canonical cue IDs (from `fenYuHeLessonTimeline.ts` `VISUAL_MOTION_SECONDS` / source order):
`intro-title` → `five-whole` → `split-into-two` → `recombine-inverse` → `read-fen-he-shi` →
`first-ordered-split` → `slide-one-at-a-time` → `ordered-column-complete` → `order-matters`.

Vocabulary surveyed first-hand in `src/shape-primitives/sketch.tsx`:
`TeacherMark` kinds = `underline | wrap-arc | label-arrow | vs-mark`. `label-arrow` and
`wrap-arc`/`underline` take a `span` anchor `{ start:{x,y}, end:{x,y} }`; `vs-mark` takes a
`point` anchor `{ x, y }`. `drawProgress` 0→1 drives the `strokeDashoffset` reveal (NOT a fade-in).
Opt-in `boil` (held jitter, decorative) and `settle` (end-of-draw grow-to-1.0, climax-only) per
`CAPABILITIES.md#sketch-boil` / `#sketch-settle`.

---

## Restraint ledger (kids-eye §2 / sketch-explainer-layer §"Restraint")

9 cues → mark cap = `floor(9 × 0.6) = 5`. This file ships **3 marks total**, across **2 cues**.
Seven cues carry ZERO marks. Each shipped mark passes the sentence
*"This mark carries signal X, which is not yet carried by Y or Z"*:

- **`read-fen-he-shi` — two `label-arrow` marks (read-direction).** Signal: the **direction**
  the 分合式 is read — top-down "五**分成**…和…" then bottom-up "…和…**组成**五". The static V of the
  diagram shows the *structure* (whole→two parts) but cannot show *which way to read it*; the two
  sequenced arrows are the only carrier of read-direction. Visual-design §Per-cue table explicitly
  asks for "emphasis traveling top→down then bottom→up" here — these arrows are that emphasis.
- **`order-matters` — one `vs-mark` (distinctness).** Signal: (1,4) and (4,1) are **not the same**
  split. Accent #2 (the sunshine highlight alternating the two rows) carries *"look at these two"*
  but NOT *"these are different"* — the crossing strokes assert the distinctness the highlight
  leaves implicit. Recap punctuation, climax cue, calm enough for a settled mark.

Marks REFUSED, with the duplicated carrier named:
- `ordered-column-complete` — NO mark. Visual-design assigns a navy emphasis **traveling down**
  the left-part numbers 1→2→3→4 (composer-owned motion). An `underline` under the column would be a
  second carrier of the same "read this column in order" signal. Dropped (kids-eye §2 duplicate).
- column-circle (orchestrator hint "circling the ordered left column") — REFUSED at the vocabulary
  level: circles-around-groups are explicitly NOT in the `TeacherMark` vocabulary
  (sketch-explainer-layer §"Mark vocabulary"). The down-travelling emphasis already groups+orders
  the column. No mark.
- `split-into-two` / `recombine-inverse` — NO mark. The coral divider line + the candy motion ARE
  the act; a mark would narrate motion the eye already follows (finger-cover: cover a mark → still
  teaches → the mark was decoration).
- `five-whole` — NO mark. The five candies count themselves; an underline-of-five would duplicate
  the visible heap (kids-eye §3).
- `intro-title` / `first-ordered-split` / `slide-one-at-a-time` — NO mark (see per-cue reasons).

---

## 1. Sketch language

- **Stroke color:** single ink — theme `textNavy` (`#24324B`), via `strokeColor="textNavy"`. The
  only "speaking ink" color in the lesson (visual-design palette). Never coral (reserved for the
  分/合 action), never sunshine (reserved for the transient highlight), never reward.
- **Stroke width:** `strokeWidth={4}` (primitive default / `NAVY_STROKE`) — reads as a teacher's
  felt-pen at 1280×720, clears the 4 px-min legibility for a stroke this length.
- **Opacity:** `opacity={0.92}` (default) — ink, not full-black, so it sits as overlay not as a
  drawn primitive.
- **Jitter:** baseline static jitter (the primitive's built-in ±1.5 units). Distinct `jitterSeed`
  per mark so the two read-arrows don't wobble identically.
- **Animation:** stroke-on draw-on via `drawProgress` 0→1 (NEVER fade-in). Fade-out begins
  8 frames before the cue end (`fadeOutRelativeStart = cueLength - 8`), the composer ramps
  `opacity` 0.92→0 over those last 8 frames.
- **Direction convention for `label-arrow`:** `anchor.start` is the tail, `anchor.end` is the
  arrowhead. Top-down read → start = whole anchor, end = parts midpoint. Bottom-up read →
  start = parts midpoint, end = whole anchor.

### 1.1 Boil (decorative-only)
NOT used. Both shipped cues are short read-beats; the read-arrows are sequenced and fade within the
cue, the vs-mark lands and holds < 1.5s before fade. None lingers ≥ 1.5s static, so boil would be
imperceptible-to-distracting with no upside (`CAPABILITIES.md#sketch-boil` anti-pattern: boil that
can't be seen). Zero boiled marks.

### 1.2 Settle (climax-only)
ONE settled mark: the `order-matters` `vs-mark` (the lesson's recap punctuation). `settle={{ magnitude: 0.08 }}`
so the contrast cross "lands" like a teacher lifting the pen — appropriate for the single climax/recap
mark. The two read-arrows are NOT settled (they are sequenced direction cues, not a climax; a settle on
each would over-articulate, sketch-settle anti-pattern for non-climax marks).

---

## 2. Per-cue mark table (CUE-RELATIVE frames)

Frames are offsets from `cues[id].startFrame`. `cueLength = cues[id].endFrame - cues[id].startFrame`.
`fadeOutRelativeStart` is given as a formula against `cueLength` so it stays correct after any ASR
re-roll (NEVER a master-timeline absolute). All anchors are zone-aware (kids-eye §1.5): every mark
lives in `zone-marks`, traces over `zone-diagram` / `zone-column`, and never sits inside a numeral's
card box.

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| `intro-title` | n | — | — | — | — | — | text card is focal; a mark on a title is decoration. |
| `five-whole` | n | — | — | — | — | — | the five candies count themselves; mark would duplicate the heap. |
| `split-into-two` | n | — | — | — | — | — | coral divider + candy separation IS the act; nothing left to mark. |
| `recombine-inverse` | n | — | — | — | — | — | the inward motion carries "undo"; a mark narrates motion already seen. |
| `read-fen-he-shi` | y | `label-arrow` ×2 (sequenced) | **#1 top-down:** span start = diagram `whole` anchor, end = midpoint between `leftPart`/`rightPart` anchors. **#2 bottom-up:** span start = parts-midpoint, end = `whole` anchor. Anchors via `getFenHeDiagramAnchors(diagramWidth)` + the diagram's scene translation (composer resolves). | **#1:** `30` · **#2:** `66` | **#1:** `18` · **#2:** `18` | `cueLength - 8` (both fade together at cue end) | carries the two read-DIRECTIONS (分成 top-down / 组成 bottom-up) the static V cannot show. |
| `first-ordered-split` | n | — | — | — | — | — | the 1\|4 split + the diagram settling into the top column slot carry "first row, list starts here"; the column scaffold below carries "more coming". A mark adds nothing. |
| `slide-one-at-a-time` | n | — | — | — | — | — | four discrete slide→tick→freeze beats; a mark on any single slide implies one slide is special, contradicting the even +1 march. The motion is the whole signal. |
| `ordered-column-complete` | n | — | — | — | — | — | the navy emphasis traveling down 1→2→3→4 (composer-owned) already carries "read in order"; an underline/circle would duplicate it (and circle is non-vocabulary). |
| `order-matters` | y | `vs-mark` ×1 (settled) | `point` between the TOP row (1,4) and BOTTOM row (4,1) of the column — on the column centerline, vertically between the two contrasted rows. Resolved by the composer from the two row centers in `zone-column`; example point ≈ `{ x: 1030, y: 380 }` (centerline of `zone-column` x∈[820,1240], midway down the four-row stack). Sits in the inter-row GAP, never on a numeral card. | `Math.round(cueLength * 0.55)` (after BOTH rows have lit in turn) | `14` (two crossing strokes draw sequentially) | `cueLength - 8` | carries "these two rows are DIFFERENT splits" — the distinctness the sunshine highlight leaves implicit. |

Notes:
- **`read-fen-he-shi` sequencing:** arrow #1 (top-down 分成) draws 30→48, holds; arrow #2 (bottom-up
  组成) draws 66→84, holds; both fade together at `cueLength - 8`. The 18-frame gap between draw-ons
  lets the child read one direction before the other appears (the cue's 4.0s motion budget +
  `cues['read-fen-he-shi']` window comfortably holds two 18f draws + reads + an 8f fade). The
  draw-on of arrow #1 begins AFTER the diagram's diagonals have drawn on (visual-design: diagonals
  ~24f + whole-card bouncy land ~18f), so the arrow traces an already-present V, not an empty space.
- **`order-matters` timing:** the vs-mark draws at ~55% of the cue, i.e. AFTER the sunshine
  highlight has lit the top row then the bottom row (Accent #2's two read-beats). It punctuates the
  contrast the highlight set up, then both fade at cue end.

---

## 3. Climax sketch

The lesson has two visual moments a mark ties to:

- **Representation climax (`read-fen-he-shi`):** the two read-direction `label-arrow`s co-time with
  the 分合式 draw-on. They MUST anchor to the SAME `getFenHeDiagramAnchors(diagramWidth)` the
  `<FenHeDiagram>` uses (plus the diagram's scene translation), so the arrow tail/head land exactly
  on the whole numeral and the parts midpoint — not approximate offsets (CAPABILITIES anti-pattern:
  hand-computed anchors drift). The top-down arrow's draw-on starts after the diagram's
  `progress` reaches ~1.0 so it traces a completed V.
- **Recap/teaching climax (`order-matters`):** the single settled `vs-mark` is the one punctuating
  mark of the video. It co-times with Accent #2 — it draws AFTER both rows have been highlighted in
  turn, asserting "different" on the contrast the pulse just set up. `settle={{ magnitude: 0.08 }}`
  is reserved for exactly this mark.

---

## 4. Composer hand-off

Each row above becomes a `<TeacherMark>` instance. The composer resolves cue-relative → real frames:

```ts
const cue = cues[mark.cueId];                       // e.g. cues["read-fen-he-shi"]
const cueLength = cue.endFrame - cue.startFrame;
const drawStart = cue.startFrame + mark.drawOnRelativeStart;
const drawEnd   = drawStart + mark.drawOnDuration;
const fadeStart = cue.startFrame + (cueLength - 8); // fadeOutRelativeStart formula
// drawProgress = interpolate(frame, [drawStart, drawEnd], [0, 1], { extrapolate: "clamp" })
// opacity      = interpolate(frame, [fadeStart, cue.endFrame], [0.92, 0], { extrapolate: "clamp" })
// clamp the whole mark to [cue.startFrame, cue.endFrame] — never render outside the cue window.
```

Anchor resolution (read-fen-he-shi):
```ts
const a = getFenHeDiagramAnchors(diagramWidth);     // same width the <FenHeDiagram> uses
const tx = /* diagram scene translateX */, ty = /* diagram scene translateY */;
const whole = { x: tx + a.whole.x, y: ty + a.whole.y };
const partsMid = { x: tx + (a.leftPart.x + a.rightPart.x) / 2, y: ty + a.leftPart.y };
// arrow #1 (top-down 分成):  start = whole,     end = partsMid
// arrow #2 (bottom-up 组成): start = partsMid,  end = whole
```

Three `<TeacherMark>` instances total:
- `read-fen-he-shi` arrow #1 — `kind="label-arrow"`, `strokeColor="textNavy"`, `jitterSeed={1}`.
- `read-fen-he-shi` arrow #2 — `kind="label-arrow"`, `strokeColor="textNavy"`, `jitterSeed={2}`.
- `order-matters` vs-mark — `kind="vs-mark"`, `strokeColor="textNavy"`, `jitterSeed={3}`,
  `settle={{ magnitude: 0.08 }}`.

Manifest (per sketch-explainer-layer §4 + CLAUDE.md "BBOX MANIFEST AS GROUND TRUTH"):
- Register EACH `<TeacherMark>` as a `SceneElement` in `src/lessons/fenYuHe/manifest.ts`, zone
  `"marks"`. `bboxAt(frame)` = the anchor span bounding box padded by `strokeWidth` (4) — for the
  vs-mark, the `armLength = arrowheadSize + 6 ≈ 20`-radius box around the point. `opacityAt(frame)`
  = the SAME draw-on × fade-out math the scene uses (0 outside `[cue.startFrame, cue.endFrame]`).
- This is what lets `npm run lesson:check` catch a mark drawing over a numeral card BEFORE render.
  The `order-matters` vs-mark anchor MUST land in the inter-row GAP — the manifest collision check is
  how that is verified, not eyeballed.

---

## Self-check (sketch-explainer-layer §"Self-check")

1. **Restraint sentence** — both shipped cues pass (read-direction carrier; distinctness carrier);
   all refusals name the duplicated carrier. ✓
2. **Cue-relative frames only** — every offset is relative to `cues[id].startFrame`;
   `fadeOutRelativeStart` is a `cueLength` formula; ZERO master-timeline absolutes in this file. ✓
3. **Zone-aware anchors** — all three marks live in `zone-marks`, trace over `zone-diagram` /
   `zone-column`, none sits inside a numeral card; the vs-mark is pinned to the inter-row gap and
   verified by the manifest collision check. ✓
4. **Total marks ≤ floor(9 × 0.6) = 5** — 3 marks shipped, across 2 cues; 7 cues have zero. ✓
</content>
</invoke>
