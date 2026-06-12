# Sketch Overlay — kptest-fenyuhe-six

Wave 4b. CUE-RELATIVE frames only — no master-timeline absolutes. Restraint per `sketch-explainer-layer` SKILL §"Restraint principle". **Total marks: 1 of 9 cues** (11% — under the `floor(9 × 0.6) = 5` ceiling).

The single mark lands on `cue-split-3of3` — the lesson's NEW property (6 has an equal split, 5's splits did not). Every other cue gets `n` with a 1-line reason tied to which element already carries that cue's signal.

---

## 1. Sketch language

| property | value | source |
|---|---|---|
| stroke | `textNavy` (#24324B) | `visual-design.md` §3 — same ink as bond glyph / title / caption; single ink per lesson |
| strokeWidth | 4 viewBox units | scales to ≈ 6 rendered px on 1920×1080 |
| steady opacity | 0.9 | readable on cream + orange; headroom for built-in ±1.5u path jitter |
| jitter | baseline only (no boil) | see §1.1 |
| reveal | `stroke-dashoffset` draw-on (NEVER fade-in, per SKILL) | `<TeacherMark>` primitive |
| drawOnDuration | 18f default, **24f climax-gesture** | `visual-design.md` §3 |
| fadeOut | 8 frames before `endFrame` | per SKILL |

### 1.1 Boil — omitted

The mark is held `cueLength − drawOnRelativeStart − drawOnDuration − 8 = 159 − 105 − 24 − 8 = 22 frames` (≈ 0.73 s) after draw-on. `CAPABILITIES.md#sketch-boil` requires `held ≥ 1.5s` to read as handwork; 0.73 s is below the threshold. Boil on a mark the eye barely registers would read as a rendering bug, not craft.

### 1.2 Settle — used (climax-only, once in the video)

`settle={{ magnitude: 0.08 }}` — pen-settle at end of draw-on, per `CAPABILITIES.md#sketch-settle`. One settled mark in the video, on the one mark that earns it.

---

## 2. Per-cue mark table (CUE-RELATIVE frames)

| cue id | mark? | kind | anchor (zone-aware) | drawOnRelStart | drawOnDur | fadeOutRelStart | purpose |
|---|---|---|---|---|---|---|---|
| `cue-announce-split-1of5` | n | — | — | — | — | — | Three sequential one-signal phases (title → bond → split); one cognitive task at a time. No signal left for a mark. |
| `cue-conserve-1of5` | n | — | — | — | — | — | Identity-preserved 1+5→6 merge IS the conservation signal (`kids-eye` §4). A mark would compete. |
| `cue-split-2of4` | n | — | — | — | — | — | Cluster sizes carry the difference from 1\|5; narration has named the new bond. Picture + bond already carry the beat. |
| `cue-conserve-2of4` | n | — | — | — | — | — | Second conservation; the child now feels conservation as a routine, not a one-off. No mark needed. |
| `cue-split-3of3` | **y** | **underline** | span: bottom-left of left cluster → bottom-right of right cluster, slight arch dipping DOWN between them; both endpoints in `zone-objects`, never `zone-labels` | **105** | **24** | **151** | **CLIMAX** of the 3+3 equal split, the lesson's NEW property. See §3. |
| `cue-conserve-3of3` | n | — | — | — | — | — | Third conservation; closes the equal split the same way the others were closed. The §3 underline has already celebrated; a second mark would double up. |
| `cue-learner-response-gap` | n | — | — | — | — | — | Held silence ≥3s IS the signal (§8 acquisition floor). A mark on a held silence would compete with the silence itself. |
| `cue-reveal-answer` | n | — | — | — | — | — | 3+3 re-appears as the answer; a mark would (a) over-articulate 3+3 — the misreading the recap's first slot (1+5) is fighting against. The single transient sunshine highlight is the W2c celebration. |
| `cue-spaced-recap-all-three` | n | — | — | — | — | — | `RecapSpotlight` IS the signal — live highlight follows the spoken item. A teacher mark would compete and break the recap's "highlight follows the spoken item" requirement. |

---

## 3. Climax sketch

**Cue:** `cue-split-3of3` — `cueLength = max(narrationFrames=47, visualMotionFrames=5.0×30=150) + 9 = 159 frames`.

**Mark kind: `underline`** — the SKILL's "slight arch under a target span" gesture. A `wrap-arc` would arch OVER the clusters and read as "wraps around," not "groups these two as equal." An underline dipping DOWN between the two clusters visually groups them as one bound pair — the load-bearing gesture for "equal split." `visual-design.md` §4 prescribes "A single underline under cue-split-3of3's clusters is the only sketch worth a default."

**Anchor:** span from bottom-left of left cluster (3 dots) → bottom-right of right cluster (3 dots), slight arch dipping down between them. Both endpoints in `zone-objects` (cluster row), never in `zone-labels` (bond glyph zone) — `kids-eye` §1.5. Endpoints are **named element ids** (`kp6-cluster-left-bottom-left`, `kp6-cluster-right-bottom-right`) — composer resolves against live `PartWholeComposer` cluster bbox at scene-build time, no hand-coded x/y literals.

**Cue-relative timing (relative to `cue.startFrame`):**

- `drawOnRelativeStart = 105` — 15 frames into the post-climax dwell. The split motion (30f `EASE.outQuint` climax) ends at the motion-window boundary; the dwell lets the eye register the settled symmetry; the underline then arrives on the settled state, not on motion the eye is tracking.
- `drawOnDuration = 24` — climax-gesture duration.
- `fadeOutRelativeStart = 151` — `cueLength − 8 = 159 − 8`; 8-frame fade-out in the cue's 9-frame tail, clears before `cue-conserve-3of3` starts.

**Settle:** `settle={{ magnitude: 0.08 }}`. **No boil** — see §1.1.

**Co-times with the climax primitive:** the underline lands AS the `PartWholeComposer`'s 3+3 split reaches its final cluster positions (settled state, not mid-motion). The mark celebrates the equality the picture has just delivered.

---

## 4. Composer hand-off

### 4.1 Single `<TeacherMark>` instance

```tsx
<TeacherMark
  kind="underline"
  anchor={{
    kind: "span",
    start: { kind: "named", id: "kp6-cluster-left-bottom-left" },
    end:   { kind: "named", id: "kp6-cluster-right-bottom-right" },
  }}
  drawProgress={drawProgress}        // 0→1 over drawOnDuration, cue-relative
  settle={{ magnitude: 0.08 }}       // pen-settle, climax-only
  // NO boil — see §1.1
  stroke="textNavy"
  strokeWidth={4}
  opacity={0.9}
/>
```

### 4.2 Frame resolution (no literals)

```ts
const cue = kptestFenyuheSixCues.find((c) => c.id === "cue-split-3of3");
const drawStart = cue.startFrame + 105;
const drawEnd   = drawStart + 24;
const fadeStart = Math.min(cue.endFrame, cue.startFrame + 151);
const cueEnd    = cue.endFrame;
// drawOnProgress(t)  = clamp((t - drawStart) / (drawEnd - drawStart), 0, 1)
// fadeOutProgress(t) = clamp((t - fadeStart) / (cueEnd - fadeStart), 0, 1)
// visibleAlpha(t)    = drawOnProgress(t) * (1 - fadeOutProgress(t))
```

### 4.3 Manifest entry (required for `npm run lesson:check`)

Mark MUST appear in the lesson's `manifest.ts` as a `SceneElement`:
- `zone: "marks"`
- `bboxAt(frame)` = span bbox from `kp6-cluster-left-bottom-left` → `kp6-cluster-right-bottom-right` (resolved at scene-build time against live `PartWholeComposer` cluster positions) **padded** by strokeWidth (4u) + settle magnitude (8% of span width at the mark's centroid, per `CAPABILITIES.md#sketch-settle`).
- `opacityAt(frame)` = the same `drawOnProgress × (1 − fadeOutProgress)` math the `<TeacherMark>` itself uses.

Without this entry, the bbox check can't see the mark and a collision with `zone-recap-row` (or any future zone) goes unflagged.

### 4.4 Anchor resolution

Named anchors are produced by the composer's two `PartWholeComposer` instances at `mode="split", partition={left: 3}`. Composer exposes the cluster bbox as a callback/ref at scene-build time; the underline's span endpoints are computed from those bboxes. The underline tracks the live cluster geometry — a future tweak to cluster layout (wider gap, different dot size) does not require re-measuring the mark.

---

## Self-check

1. ✓ Every mark passes the §"Restraint principle" sentence (one mark; one signal; one moment).
2. ✓ Every mark uses cue-relative frames (105/24/151, no master-timeline absolutes).
3. ✓ Anchors respect `kids-eye` §1.5 zones (endpoints in `zone-objects`, never `zone-labels`).
4. ✓ Total marks (1) ≤ floor(cueCount × 0.6) = 5.
