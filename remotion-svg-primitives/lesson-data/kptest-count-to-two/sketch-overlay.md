# Sketch Overlay — kptest-count-to-two

## 1. Sketch language

| Property | Value | Rationale |
|---|---|---|
| stroke color | `textNavy` (#24324B) | Palette §3 — the only ink tone |
| stroke width | 4 px | Visibility at 1280-wide without dominating teaching primitives |
| opacity | 0.92 | Slightly translucent so ink reads as teacher overlay, not chrome |
| hand-jitter | ±1.5 px | Baseline (pre-boil); matches palette §3 spec |
| round caps | true | Hand-drawn warmth |
| animation | stroke-on draw-on (dashoffset), fade-out 8 frames before cue end | Skill §1 — never fade-in |

### 1.1 Boil

Not used. The single mark (C4 underline) draws on over ~18 frames and holds for ~70 frames before fading — the hold is calm enough that static jitter at ±1.5 px suffices; boil would compete with the cardinal PopIn at draw time. No mark in this video stays on screen ≥ 1.5s post-draw in a calm context where boil would add craft without distraction.

### 1.2 Settle

One settled mark: the C4 underline. `settle={{ magnitude: 0.08 }}` — 92% → 100% scale across the last 15% of draw-on (≈ frames 33–36 relative to cue start). This is the climax accent; settle makes it land as a pen lift, matching the skill's "climax-only" guidance.

---

## 2. Per-cue mark table (CUE-RELATIVE frames)

All offsets resolve against `cues[cueId].startFrame`. The composer translates to master-timeline frames at scene-build time.

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| lesson-intro | n | — | — | — | — | — | Title card reads alone; no teaching moment to annotate. |
| first-apple-one | n | — | — | — | — | — | Apple 1 + tag 1 carry their own spatial signal (tag sits above apple in zone-counts). The count badge already names the count position; an arrow or underline would decorate, not clarify. |
| second-apple-two | n | — | — | — | — | — | Same restraint logic as C2: tag 2's spatial position above apple 2 already marks the count position. Apple 1 stays visible-and-quiet; no new relationship to annotate. |
| cardinality | **✓** | underline | horizontal stroke beneath the cardinal "2" digit, centered, width ≈ digit width + 40 px padding. Anchor sits in zone-marks, below zone-cardinal, above zone-counts. | 18 | 18 | Math.min(cueLength − 8, 106) | Climax accent: "this is the answer." The underline carries signal X (the resolved cardinal is the lesson's single insight) that is not yet carried by any other element — the PopIn delivers the card, the Sparkle accents the reveal, but the underline is the teacher's deliberate "look here" on the resolved state. |

**Mark count: 1 / floor(4 × 0.6) = 2** ✓

---

## 3. Climax sketch

The C4 underline is the climax mark. It co-times with the cardinal NumberCard PopIn:

- **Anchor:** horizontal stroke centered beneath the digit "2" in zone-cardinal. Absolute anchor: `(x=640, y=240)` — below the NumberCard's baseline (card center at ~y=150, card height ~180, baseline at ~y=240), width ~160 px, within zone-marks.
- **Relative timing:** draws on starting at frame 18 of `cardinality` (the PopIn is ~60% settled by then; the underline confirms what just landed). Draws for 18 frames (ends at frame 36). Holds for ~70 frames. Fades at frame 106 (114 − 8 = 106).
- **Settle:** `magnitude: 0.08` — the last 3 frames of draw-on (frames 33–36) grow from 92% to 100% scale, landing the mark as a pen lift.
- **No boil:** the hold is calm but not long enough to benefit from jitter; static ±1.5 px jitter is sufficient.
- **No wrap-arc / label-arrow / vs-mark:** none of these carry signal that the underline doesn't already carry more simply. The relationship is "this number is the answer" — a horizontal emphasis stroke, not a path trace or a pointer.

---

## 4. Composer hand-off

Each mark becomes a `<TeacherMark>` instance in the scene. The composer resolves:

```ts
const cue = cues["cardinality"];
const drawStart = cue.startFrame + 18;          // relative start
const drawEnd = drawStart + 18;                  // draw duration
const fadeStart = cue.startFrame + Math.min(cue.length - 8, 106); // fade relative
// clamp fadeStart against cue.endFrame
```

**Manifest registration (required by skill §4):** The underline must be registered as a `SceneElement` in `src/lessons/kptestCountToTwo/manifest.ts`:

- zone: `"marks"`
- `bboxAt(frame)`: anchor span (centered at (640, 240), width ~160, height ~8) padded by stroke width (4 px) + settle magnitude (0.08 × 8 ≈ 1 px) = bbox ~(632, 231, 176, 18)
- `opacityAt(frame)`: draw-on progress (0→1 across frames 18–36 relative) × fade-out (1→0 at frame 106 relative), clamped to [0, 1]

Without this manifest entry, `npm run lesson:check` cannot see the mark and collision detection against zone-counts / zone-objects is blind to it.
