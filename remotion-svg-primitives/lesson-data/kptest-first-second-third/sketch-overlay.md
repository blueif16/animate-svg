# kptest-first-second-third — Sketch Overlay (W4b)

## 1. Sketch language

| param | value | reason |
|---|---|---|
| stroke color | `textNavy` (theme token) | single ink; no second ink color anywhere |
| stroke width | 4 vbu | readable at caption-ribbon scale without crowding chips |
| opacity | 0.82 | slightly transparent so marks read as added ink, not printed glyph |
| jitter | baseline (±1.5 vbu default) | visible at 1920-wide canvas |
| animation | stroke-on draw-on (dash-offset), fade-out 8 frames before cue end | per skill spec |

### 1.1 Boil

`mark-flag-underline` (count-second): mark holds ≥ 1.0s at narration pace — borderline; **omit boil** (short hold, competing with sweep motion).

`mark-full-queue-arc` (count-third, climax): holds ~2–3s after draw-on; cue is the learning climax; **boil applied** — `magnitude: 3, holdFrames: 5` (medium-length arc, calm pedagogy stage after the sweep completes).

### 1.2 Settle

`mark-full-queue-arc` (count-third, climax): **settle applied** — `settle={{ magnitude: 0.08 }}` (the one climax mark per video).

---

## 2. Per-cue mark table (cue-relative frames)

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| intro | n | — | — | — | — | — | title text carries everything; no mark adds signal |
| arrive-first | n | — | — | — | — | — | walk-in motion carries the moment |
| name-first | n | — | — | — | — | — | chip attach + pulse already embody the signal |
| arrive-second | n | — | — | — | — | — | plain arrival; no new concept to point at |
| count-second | **y** | underline | under the front marker (flag top, zone-objects — x₁≈180, x₂≈320, y≈510; mark traces below the flag base, never entering zone-chips) | 6 | 14 | `cueLength - 8` | marks the count's fixed origin at the instant the sweep starts — "this flag IS the front, count starts here." Signal not yet carried by sweep motion alone (sweep launches from flag but the mark declares the origin explicitly). |
| arrive-third | n | — | — | — | — | — | plain arrival; signal carried by queue accumulation |
| count-third | **y** | wrap-arc | traces the full queue spine: from flag head (x≈250, y≈600) curving over all three animals to the back of animal 3 (x≈1490, y≈600), passing through zone-objects only — never entering zone-chips (y<340) or zone-caption (y>950) | `cueLength - 75` | 30 | `cueLength - 8` | climax signal — "this whole line, counted from the front, is 第一、第二、第三." The wrap-arc appears AFTER the full sweep completes (all three chips pulsed), underlining the complete group as a unit. Signal not yet carried by the per-chip pulse sequence alone. |
| ask-second | n | — | — | — | — | — | prompt affordance in zone-prompt already signals the child's turn |
| reveal-second | n | — | — | — | — | — | sparkle-burst (accent budget spent) + step-forward already emphasize; a mark would stack |
| ask-third | n | — | — | — | — | — | same affordance pattern as ask-second |
| reveal-third | n | — | — | — | — | — | step-forward + chip pulse carry the answer |
| recap-invite | n | — | — | — | — | — | pointer-hand-arrow in zone-objects IS the signal |
| recap-count | n | — | — | — | — | — | sweep + chip pulses carry the choral signal; a mark would compete |

Total marks: **2** of 13 cues (15%). Ceiling = floor(13 × 0.6) = 7. ✓

---

## 3. Climax sketch

**mark-full-queue-arc** (cue: count-third)

- Type: `wrap-arc`
- Anchor: `{ kind: "span", start: { x: 250, y: 600 }, end: { x: 1490, y: 600 } }` — both ends in zone-objects; the arc bows upward into the mid-zone between zone-chips (bottom y≈470) and zone-objects (top y≈500), staying within zone-marks full-bleed.
- Timing: draws on over 30 frames (1.0s) starting at `cueLength - 75` (i.e., after the third chip has pulsed); fades out 8 frames before cue end.
- `boil={{ magnitude: 3, holdFrames: 5 }}` — activated during the held period after draw completes.
- `settle={{ magnitude: 0.08 }}` — pen-settle on the last 15% of draw-on.

---

## 4. Composer hand-off

```ts
// mark-flag-underline — count-second
const cue = cues["count-second"];
const drawStart = cue.startFrame + 6;
const drawEnd   = drawStart + 14;
const fadeStart = cue.startFrame + (cue.endFrame - cue.startFrame - 8);

// mark-full-queue-arc — count-third (climax)
const cueTh = cues["count-third"];
const arcDrawStart = cueTh.startFrame + (cueTh.endFrame - cueTh.startFrame - 75);
const arcDrawEnd   = arcDrawStart + 30;
const arcFadeStart = cueTh.startFrame + (cueTh.endFrame - cueTh.startFrame - 8);
```

`<TeacherMark>` usage:

```tsx
{/* mark-flag-underline */}
<TeacherMark
  kind="underline"
  anchor={{ kind: "span", start: { x: 180, y: 510 }, end: { x: 320, y: 510 } }}
  drawProgress={interpolate(frame, [drawStart, drawEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
  opacity={interpolate(frame, [arcFadeStart, arcFadeStart + 8], [0.82, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
/>

{/* mark-full-queue-arc (climax) */}
<TeacherMark
  kind="wrap-arc"
  anchor={{ kind: "span", start: { x: 250, y: 600 }, end: { x: 1490, y: 600 } }}
  drawProgress={interpolate(frame, [arcDrawStart, arcDrawEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
  opacity={interpolate(frame, [arcFadeStart, arcFadeStart + 8], [0.82, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
  boil={{ magnitude: 3, holdFrames: 5 }}
  settle={{ magnitude: 0.08 }}
/>
```

**Manifest requirement (per skill §4):** both marks must be registered as `SceneElement` entries in `src/lessons/kptestFirstSecondThird/manifest.ts` with `zone: "marks"`, `bboxAt(frame)` = anchor span padded by stroke half-width (2 vbu) + boil magnitude (3 vbu for arc), `opacityAt(frame)` reflecting the same draw-on × fade-out math above.
