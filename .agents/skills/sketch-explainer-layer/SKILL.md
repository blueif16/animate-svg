---
name: sketch-explainer-layer
description: Specify teacher-mark overlays (Excalidraw-style hand-drawn ink) for a Remotion lesson scene. Wave 4 (parallel with composer). Marks are specified in CUE-RELATIVE frames, never master-timeline absolutes. Restraint is the rule.
---

# Sketch Explainer Layer

Add hand-drawn teacher explanation cues without overwhelming the lesson.

## Inputs (read all before writing)

- `lesson-data/<id>/brief.md`
- `lesson-data/<id>/storyboard.md` (sketch-overlay-need column per cue)
- `lesson-data/<id>/visual-design.md` (Visual Contract, zones — your marks must respect zone-marks rules from `kids-eye` §1.5)
- `src/lessons/<camelId>LessonTimeline.ts` (the RECONCILED cue boundaries — Wave 3.5; the single source of truth the composer also reads). The cue-relative offsets you author resolve against `cues[cueId].startFrame` from THIS module. (`<X>Timing.ts` is ASR-QA-only in v4 — never read it for cue timing.)
- `kids-eye` SKILL.md
- `visual-discipline` SKILL.md

## CUE-RELATIVE FRAMING RULE

Every mark's timing is specified as cue-relative offsets, NEVER as absolute master-timeline frames:

```
✗ FORBIDDEN — absolute master-timeline frames
| mark-bundle-wrap-arc | wrap-arc | 891 | 24 | 1057 |

✓ REQUIRED — cue-relative
| mark-bundle-wrap-arc | wrap-arc | cue=bundle-action | drawOnRelativeStart=12 | drawOnDuration=24 | fadeOutRelativeStart=Math.min(cueLength-8, ...) |
```

Why: ASR realignment changes absolute frame numbers between runs. A mark at absolute 891 may render past the end of the video if the cue moved. A mark at "12 frames after `bundle-action` starts" stays correct regardless.

The composer translates `{ cueId, drawOnRelativeStart, ... }` → real frames at scene-build time using `cues[cueId].startFrame`.

## Restraint principle (from `kids-eye` §2)

A teacher mark must clarify or celebrate; otherwise it does not exist. Most cues should have ZERO marks. **This skill owns the mark budget: total marks across the video ≤ floor(cueCount × 0.6)** (a 9-cue video at 5 is already the high end; at 9 it is decoration) — there is no separate per-cue cap.

Before adding a mark, complete the sentence:

> "This mark carries signal X, which is not yet carried by Y or Z."

If you can't complete it, drop the mark.

## Mark vocabulary (only what's authorized)

- **underline** — slight arch, under a target span
- **wrap-arc** — curved stroke tracing a wrap path around an object (climax-only)
- **label-arrow** — curved stroke from a label to a referent, with arrowhead
- **vs-mark** — short crossing strokes for contrast cues

NOT in this vocabulary (don't invent): circles around groups (the bundle already groups), ticks under each item (the count badges already say it), sparkles (composer/visual-design owns those), exclamation glyphs.

## Anchor discipline (zones from `kids-eye` §1.5)

- Marks may **trace over `zone-objects`** (e.g. a wrap-arc following the rope path) but never **sit inside `zone-labels`** (that creates a label-mark overlap).
- A label-arrow's `start` anchor is in `zone-labels`; its `end` anchor is in `zone-objects`. Both ends are explicit (x, y).
- Anchors are absolute coordinates OR named element ids (the composer resolves both at scene-build time).

## Output: `lesson-data/<id>/sketch-overlay.md`

Structure:

### 1. Sketch language
- Stroke color (single, from theme `textNavy`), width, opacity, jitter amount.
- Animation: stroke-on draw-on (never fade-in), fade-out 8 frames before cue end.

#### 1.1 Boil (optional, decorative-only)

`<TeacherMark>` accepts an opt-in `boil` prop that re-perturbs the mark's control points every N frames so a long-held mark reads as a teacher's hand. **Decorative-only — never on the teaching primitive.** At most one or two boiled marks per video.

Reach for boil ONLY when the mark stays on screen ≥ 1.5s after draw-on AND the cue is calm enough that the extra micro-motion won't compete with the teaching object.

Full reach guide, magnitude ranges, anti-patterns: `CAPABILITIES.md#sketch-boil`.

```tsx
<TeacherMark
  kind="wrap-arc"
  anchor={{ kind: "span", start, end }}
  drawProgress={drawProgress}
  boil={{ magnitude: 1, holdFrames: 4 }}
/>
```

#### 1.2 Settle (optional, climax-only)

`<TeacherMark>` accepts an opt-in `settle` prop that grows the mark from ~92% to 100% scale across the last 15% of draw-on so it lands like a teacher lifting their pen, not a CSS transition finishing. **Climax-only** — at most one settled mark per video, usually the wrap-arc or the punctuating underline. Don't settle short glance marks; the eye won't see it.

Full reach guide, magnitude ranges, anti-patterns: `CAPABILITIES.md#sketch-settle`.

```tsx
<TeacherMark
  kind="wrap-arc"
  anchor={{ kind: "span", start, end }}
  drawProgress={drawProgress}
  settle={{ magnitude: 0.08 }}
/>
```

### 2. Per-cue mark table (CUE-RELATIVE frames)

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |

For cues with no mark, write `n` and a 1-line reason (avoid clutter / signal already carried).

### 3. Climax sketch
The one mark that ties to the visual climax. Anchor + relative timing must align with the climax primitive (e.g. wrap-arc co-times with `BundleWrap.wrapProgress`).

### 4. Composer hand-off
Each mark spec becomes a `<TeacherMark>` instance in the scene. The composer reads `{ cueId, drawOnRelativeStart, ... }` and resolves to real frames via:
```ts
const cue = cues[mark.cueId];
const drawStart = cue.startFrame + mark.drawOnRelativeStart;
const drawEnd = drawStart + mark.drawOnDuration;
const fadeStart = cue.startFrame + mark.fadeOutRelativeStart;
// clamp against cue.endFrame
```

- Every `<TeacherMark>` MUST also be registered as a `SceneElement` in `src/lessons/<camelLessonId>/manifest.ts` (zone: `"marks"`, `bboxAt(frame)` = the anchor span padded by stroke width and any boil magnitude, `opacityAt(frame)` = the same draw-on × fade-out math the scene uses).
- This is what catches "mark drew over the StepTally" in `npm run lesson:check` before render — without a manifest entry, the bbox check can't see the mark and the collision goes unflagged.

## Self-check (run before reporting back)

1. Every mark passes the §"Restraint principle" sentence.
2. Every mark uses cue-relative frames (no master-timeline absolutes anywhere in the file).
3. Every mark anchor respects zones from kids-eye §1.5 (no marks inside zone-labels).
4. Total marks across the video ≤ floor(cueCount × 0.6). More than that is decoration.

If any check fails, redesign — do not ship a verbose mark table to compensate.
