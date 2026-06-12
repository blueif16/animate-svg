# sketch-overlay — kptest-compare-more-fewer

Wave 4b teacher-mark overlay. CUE-RELATIVE frames only (composer resolves to `cues[id].startFrame + offset`). Restraint is the rule: **2 marks across 11 cues** — the picture-delivered surplus, and the keystone re-reading. Everything else is already inked by an existing primitive (pulse / > glyph / pointer-hand / spotlight), so it earns no mark. Each rule stated ONCE.

## 1. Sketch language

| prop | value |
|---|---|
| stroke color | theme `textNavy` (single) |
| stroke width | 5 px |
| opacity | 1.0 (on), 0 after fade |
| jitter | low — Excalidraw hand-drawn default |
| draw-on | stroke-on `drawProgress` 0→1 (NEVER fade-in) |
| fade-out | 8 frames before the mark's own off-point |

### 1.1 Boil — NONE.
No mark is held long enough on a calm-enough cue to justify boil, and `fewer-direction` (the only long dwell) carries the live reading-focus migration, so added micro-motion would compete with the teaching object. (Reach guide: `CAPABILITIES.md#sketch-boil`.)

### 1.2 Settle — `mark-fewer-arrow` ONLY (climax).
The keystone re-reading mark lands like a teacher lifting the pen. `settle={{ magnitude: 0.08 }}`. (Reach guide: `CAPABILITIES.md#sketch-settle`.)

## 2. Per-cue mark table (CUE-RELATIVE frames)

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| intro | n | — | — | — | — | — | framing only; no teaching object |
| two-groups | n | — | — | — | — | — | setup; comparison withheld, nothing to point at |
| match | y | underline | span under the **2 unmatched top dots** (`unmatched-slot` ghosts), in zone-objects | 6 frames after the last pair-line completes its grow (composer: pair-stagger end + 6) | 14 | `cueLength - 8` | inks "these two have NOBODY" — the surplus the picture delivers before any word |
| more-direction | n | — | — | — | — | — | `pulse-circle` + `>` glyph already carry the surplus & direction |
| echo-more | n | — | — | — | — | — | `pointer-hand-arrow` owns the your-turn signal |
| more-replay | n | — | — | — | — | — | identical to more-direction; signal already carried |
| fewer-direction | y | label-arrow | start in **zone-phrase** at the 三比五少 row, end at the **short bottom (3-dot) row** in zone-objects | 8 frames after the reading-focus begins migrating to the short row (composer: focus-slide start + 8) | 22 | `cueLength - 8` | makes the re-reading DIRECTION explicit — same picture, read the other way (keystone signal the unchanged picture cannot self-carry) |
| echo-fewer | n | — | — | — | — | — | `pointer-hand-arrow` owns the your-turn signal |
| fewer-replay | n | — | — | — | — | — | identical to fewer-direction; signal already carried |
| not-by-size | n | — | — | — | — | — | the re-pairing leaving 2 over IS the proof; a mark would pre-answer the guard question |
| recap | n | — | — | — | — | — | `recap-spotlight` already walks surplus → short row |

Marks total: **2** ≤ floor(11 × 0.6) = 6. (Most cues ZERO, per restraint.)

## 3. Climax sketch

`mark-fewer-arrow` (label-arrow, `fewer-direction`). It co-times with the keystone reading-focus migration: the arrow draws ONLY after the focus has begun sliding from the surplus to the short bottom row, so the ink confirms the same-picture-other-way reading rather than pre-announcing it. Carries `settle={{ magnitude: 0.08 }}` (the one settled mark). Start anchor sits in zone-phrase (at the 三比五少 phrase row), end anchor in zone-objects (short bottom row) — a cross-zone label→referent stroke, both ends explicit; it never sits inside zone-phrase, only departs from it.

## 4. Composer hand-off

Two `<TeacherMark>` instances; composer resolves cue-relative → real frames:

```ts
const cue = cues[mark.cueId];
const drawStart = cue.startFrame + mark.drawOnRelativeStart; // composer supplies the offset from the motion event named above
const drawEnd   = drawStart + mark.drawOnDuration;
const fadeStart = cue.startFrame + (cue.endFrame - cue.startFrame) + mark.fadeOutRelativeStart; // cueLength - 8
// clamp drawEnd / fadeStart against cue.endFrame
```

- `mark-match-underline` (`kind="underline"`, cue `match`): anchor = span under the 2 unmatched-slot columns; NO boil, NO settle.
- `mark-fewer-arrow` (`kind="label-arrow"`, cue `fewer-direction`): anchor = `{ start: <三比五少 phrase row, zone-phrase>, end: <short bottom row, zone-objects> }` with arrowhead; `settle={{ magnitude: 0.08 }}`.

Both relative onsets are anchored to a composer-owned MOTION event (pair-stagger end; focus-slide start), not a literal — the composer adds the fixed +6 / +8 offset at scene-build time. Each `<TeacherMark>` MUST also register a `SceneElement` in `src/lessons/kptestCompareMoreFewer/manifest.ts` (zone `"marks"`, `bboxAt` = anchor span padded by stroke width, `opacityAt` = the same draw-on × fade-out math), so `npm run lesson:check` can see the mark and flag any collision (e.g. arrow over a dot) before render.
