# Sketch overlay — kp1-fen-yu-he-intro

Wave 4b TeacherMark schedule. All frames are CUE-RELATIVE — the composer resolves them via `cues[id].startFrame + relativeOffset`. The orchestrator's emphasis budget (visual-design §3) reserves the climax accent for `fenheshi-intro` (sparkle / bouncy endpoint-land — NOT a TeacherMark). This schedule therefore lives in three earned beats only.

Total proposed marks: **3** (cap is `floor(10 × 0.6) = 6`; visual-design caps this lesson at 3).

---

## 1. Sketch language

- **Stroke color**: `colors.textNavy` (the only ink color in this lesson). Identity-invariant promise §5 forbids coral or sunshine on marks.
- **Stroke width**: `strokeWidth = 5` for the two reading sweeps (slightly thicker than the default 4 so they read over the diagram's diagonal lines), `strokeWidth = 4` for the closure underline (default — it sits below the row, no competing ink near it).
- **Opacity**: `0.92` (TeacherMark default — already calibrated for textNavy on cream).
- **Jitter**: default baseline `±1.5 vbu`. Hand-feel comes from boil where applied; static jitter is sufficient for short reading sweeps that don't linger.
- **Animation**: stroke-on draw via `drawProgress` (never opacity fade-in); fade-out 8 frames before cue end (or before the next mark begins, whichever is sooner).

### 1.1 Boil

Used on one mark only — the closure underline in `five-3-2-and-4-1`. It is the longest-held mark in the video (≥ 60 frames after draw-on completes) and the cue is calm (four diagrams holding, narration summarizing). The two reading sweeps in `fenheshi-read` are SHORT glance marks (≤ 18 frames held visible before fade) — per `CAPABILITIES.md#sketch-boil` reach guide, "brief glance-mark — omit `boil`." Static jitter only.

### 1.2 Settle

Per visual-design, the climax accent in `fenheshi-intro` is owned by sparkle/bouncy — not a TeacherMark, so no settle there. The closure underline in `five-3-2-and-4-1` is the only mark that could conceivably take settle, but it is decoration-territory (the set is already visibly complete by the time the underline lands) — settle adds nothing the eye will catch. Omit. No mark in this lesson uses `settle`.

---

## 2. Per-cue mark table (CUE-RELATIVE frames)

Cue lengths (from `kp1FenYuHeIntroTiming.ts`, end − start):

| cue | length (frames) |
|---|---|
| intro | 114 |
| fen-show | 66 |
| fen-name | 135 |
| he-show | 87 |
| he-name | 182 |
| fenheshi-intro | 115 |
| fenheshi-read | 193 |
| five-1-4 | 115 |
| five-3-2-and-4-1 | 153 |
| outro | 115 |

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| intro | n | — | — | — | — | — | The mini-preview plus the title are the entire teaching surface; a mark would compete with a write-on. No signal to add. |
| fen-show | n | — | — | — | — | — | The dot-row separation IS the discovery; the moving gap is the focal change. Sketch over moving objects = clutter (kids-eye §1.5 zone-marks is for traces of stable objects, not moving ones). |
| fen-name | n | — | — | — | — | — | Three chips snap on + 分 writes on. The proximity of 分 to the gap is already the explanatory device — adding a sketch underline under 分 or a label-arrow from 分 to the gap papers a redundant signal on top of an already-clear scene. Signal carried by `<PopIn motion="snap">` + LabelCallout. |
| he-show | n | — | — | — | — | — | Reverse motion is the entire teaching. Decorating with an arrow indicating "going back" would tell the kid what their eyes already see. |
| he-name | n | — | — | — | — | — | The two-headed arrow in `zone-strip` is itself the explanatory device (visual-design §4 calls it "structural element, not a TeacherMark"). A sketch on top of an existing arrow = double-emphasis. The 分 / 合 labels do the naming. |
| fenheshi-intro | n | — | — | — | — | — | **Climax cue — accent budget reserved.** Visual-design §3 spends the lesson's one accent on sparkle OR bouncy endpoint-land (composer's pick), neither of which is a TeacherMark. A sketch here would compete with the chosen accent and over-articulate the load-bearing migration. |
| fenheshi-read | **y** | `label-arrow` (downward sweep) | span: `start = anchorWhole` (the "5" center, in zone-diagram), `end = midpoint(anchorLeft, anchorRight)` (between the "2" and "3", in zone-diagram). Composer resolves via `getFenHeDiagramAnchors(diagramWidth)`. | 12 | 18 | 50 | Carries the top-down reading "5 分成 2 和 3." The directed sweep (with arrowhead landing between the two parts) is the load-bearing signal that "分成" means whole→parts direction. Without it, the kid sees a held diagram + a label and misses which way to read. |
| fenheshi-read | **y** | `label-arrow` (upward sweep) | span: `start = midpoint(anchorLeft, anchorRight)`, `end = anchorWhole`. | 110 | 18 | 175 | Carries the bottom-up reading "2 和 3 组成 5." Must run STRICTLY AFTER the downward sweep finishes (and after its fade) — visual-design §4 forbids simultaneous sweeps. Cue-relative start 110 ensures the first sweep has fully cleared (drawn by 30, faded by 58) before the second draws on. |
| five-1-4 | n | — | — | — | — | — | The (1,4) diagram drawing on next to the dimmed (2,3) is the discovery. A sketch comparing the two would be lecturing on a kid-discoverable difference. |
| five-3-2-and-4-1 | **y** | `underline` | span: `start = (leftEdgeOfFirstDiagram, underlineY)`, `end = (rightEdgeOfFourthDiagram, underlineY)`. Long horizontal span, in `zone-marks` tracing along the bottom of `zone-diagram`. Composer derives x-extents from the four diagrams' bbox row. | 100 | 24 | 130 | Signals "this set is now complete — four splits, done." The four diagrams alone read as a growing row, not a closed set; the underline punctuates closure. Earns its place because visual-design §4 listed it as OPTIONAL pending render check — proposing it ON because the four diagrams without a closure mark risk reading as "and there could be more." Boiled lightly (long held mark, calm cue). |
| outro | n | — | — | — | — | — | Visual-design §4 explicitly forbids a second underline in outro (semantic-group budget already at 4). Restraint says outro is a hold, not a flourish. |

---

## 3. Climax sketch

There is no climax sketch. The lesson's climax is `fenheshi-intro`, and visual-design owns that emphasis via sparkle/bouncy on the diagonal endpoints — both NON-sketch primitives. Reading from the sketch layer, the highest-stakes mark is the downward sweep in `fenheshi-read`, which carries the first directional reading. Its timing is the only mark whose start is anchored to a structural moment inside the cue: the held 分合式 must have settled (carried over from `fenheshi-intro`) and the cue's "从上往下" narration must have begun. `drawOnRelativeStart = 12` (≈ 0.4s into the cue) gives the held diagram a beat to read before the sweep starts.

---

## 4. Composer hand-off

Three `<TeacherMark>` instances to wire into `src/lessons/kp1FenYuHeIntro/Kp1FenYuHeIntroLessonScene.tsx`. Each anchor uses absolute composition coordinates resolved at scene-build time from `kp1FenYuHeIntroLayout.ts` (the same layout file the diagram primitive reads), so the marks track any future layout adjustments without re-editing this spec.

### Mark 1: downward reading sweep

```tsx
{(() => {
  const cue = cues["fenheshi-read"];
  const drawStart = cue.startFrame + 12;
  const drawEnd = drawStart + 18;
  const fadeStart = cue.startFrame + 50;
  const fadeEnd = Math.min(fadeStart + 8, cue.endFrame);
  const drawProgress = interpolate(frame, [drawStart, drawEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = frame < drawStart ? 0
    : frame < fadeStart ? 0.92
    : interpolate(frame, [fadeStart, fadeEnd], [0.92, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <TeacherMark
      kind="label-arrow"
      anchor={{
        kind: "span",
        start: anchors.whole,            // (cx, cy) of the "5" glyph
        end: anchors.partsMidpoint,      // midpoint between (cx,cy) of "2" and "3"
      }}
      drawProgress={drawProgress}
      opacity={opacity}
      strokeColor="textNavy"
      strokeWidth={5}
    />
  );
})()}
```

### Mark 2: upward reading sweep

Identical structure to Mark 1 with `drawStart = cue.startFrame + 110`, `fadeStart = cue.startFrame + 175`, and `anchor` reversed: `start = anchors.partsMidpoint`, `end = anchors.whole`.

### Mark 3: closure underline beneath the four diagrams (`five-3-2-and-4-1`)

```tsx
{(() => {
  const cue = cues["five-3-2-and-4-1"];
  const drawStart = cue.startFrame + 100;
  const drawEnd = drawStart + 24;
  const fadeStart = cue.startFrame + 130;
  const fadeEnd = Math.min(fadeStart + 8, cue.endFrame);
  const drawProgress = interpolate(frame, [drawStart, drawEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = /* same draw-on × fade-out shape as Mark 1 */;
  return (
    <TeacherMark
      kind="underline"
      anchor={{
        kind: "span",
        start: { x: rowLeftX, y: rowUnderlineY },
        end:   { x: rowRightX, y: rowUnderlineY },
      }}
      drawProgress={drawProgress}
      opacity={opacity}
      strokeColor="textNavy"
      strokeWidth={4}
      boil={{ magnitude: 4, holdFrames: 5 }}
    />
  );
})()}
```

`rowLeftX`, `rowRightX`, `rowUnderlineY` come from `kp1FenYuHeIntroLayout.ts` — the same constants the four `<FenHeDiagram>` instances use for their x positions and bottom edge. The underline sits in `zone-marks` (tracing the bottom of `zone-diagram`), well clear of `zone-label` (560–610) and `zone-caption` (640–720).

### Manifest registration (REQUIRED — per skill §4)

Every `<TeacherMark>` must register as a `SceneElement` in `src/lessons/kp1FenYuHeIntro/manifest.ts` with zone `"marks"`:

| element id | zone | `bboxAt(frame)` | `opacityAt(frame)` |
|---|---|---|---|
| `mark-fenheshi-read-downward` | marks | bbox = bounding rect of `(anchors.whole, anchors.partsMidpoint)` padded by `strokeWidth + 4` on all sides | matches the `opacity` ramp in Mark 1's snippet |
| `mark-fenheshi-read-upward` | marks | mirror of above with swapped endpoints | matches Mark 2's opacity ramp |
| `mark-five-splits-underline` | marks | `(rowLeftX − 4, rowUnderlineY − strokeWidth − boilMag − 4)` to `(rowRightX + 4, rowUnderlineY + strokeWidth + boilMag + 4)` | matches Mark 3's opacity ramp |

Without these entries, `npm run lesson:check` cannot detect a collision between any sweep and the diagram's diagonal lines (sweeps trace OVER the diagonals by design — visual-design §1.5 explicitly allows zone-marks to overlap zone-diagram, so the manifest annotates these as expected overlaps; the check should still see them).

---

## 5. Self-check

1. **Restraint sentence per mark:**
   - Mark 1 (downward sweep) — *"This mark carries signal 'whole→parts reading direction', which is not yet carried by the diagram (static), the held terms (sequential, not directional), or the narration (audio-only, ESL-vulnerable)."* PASS.
   - Mark 2 (upward sweep) — *"This mark carries signal 'parts→whole reading direction', which is not yet carried by any non-narration source. Without it the kid hears '组成' but doesn't see the inverse traversal."* PASS.
   - Mark 3 (closure underline) — *"This mark carries signal 'this set is now complete — there are four ways, not more', which is not yet carried by the row of four diagrams (which read as 'and possibly more') or the narration (which states the count but doesn't visually close it)."* PASS.
2. **Cue-relative frames:** all `drawOnRelativeStart` / `drawOnDuration` / `fadeOutRelativeStart` are offsets from `cue.startFrame`. Zero master-timeline literals in this file.
3. **Zones:** Mark 1 + Mark 2 anchor inside `zone-diagram` (their span endpoints), drawing through `zone-marks` — allowed by §1.5 ("Marks may trace over `zone-objects` (e.g. a wrap-arc following the rope path)" — same principle applies to zone-diagram). Mark 3 lives in `zone-marks` directly below `zone-diagram`, well clear of `zone-label` (no label-overlap). No mark sits inside `zone-labels`. PASS.
4. **Total marks (3) ≤ floor(10 × 0.6) = 6**, and ≤ the visual-design hard cap of 3. PASS.
5. **No invented mark types:** `label-arrow` and `underline` are both in the authorized vocabulary. No circles, brackets, ticks, or sparkles in this spec. PASS.
