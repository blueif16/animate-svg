---
name: remotion-lesson-composer
description: Compose the Remotion lesson scene from approved upstream artifacts (Visual Contract, audio-captions intent, ASR-aligned cue boundaries, sketch-overlay schedule). Wave 4 of the lesson pipeline. NEVER hardcodes frame numbers; every timing derives from cue boundaries.
---

# Remotion Lesson Composer

Compose, do not invent. Every visual concept comes from primitives in `src/shape-primitives/`. Every frame number comes from the timing module. The composer integrates — it does not author new pedagogy, new primitives, or new timing assumptions.

## Inputs (read all before writing code)

- `lesson-data/<id>/brief.md` — the knowledge point, target, audience
- `lesson-data/<id>/storyboard.md` — cue IDs, narration beats, required visuals
- `lesson-data/<id>/visual-design.md` — the Visual Contract: zones, regions, identity-invariant, motion vocabulary
- `lesson-data/<id>/audio-captions.md` — caption styling intent, SFX, music plan (NOT absolute frames)
- `lesson-data/<id>/audio-cues.json` — the sound manifest (bed key, intro/outro, SFX→beat map). SEMANTIC, no frames — you supply the frames. (Wave 2c; optional — a silent lesson has none.)
- `lesson-data/<id>/sketch-overlay.md` — teacher marks scheduled in CUE-RELATIVE frames
- `lesson-data/<id>/script-cues.json` — narration text, phrase, caption per cue
- `src/lessons/generated/<camelLessonId>Timing.ts` — ASR-aligned cue boundaries (MUST exist; produced by Wave 3 voice + ASR). If this file is a manual-provisional stub, the composer refuses and asks the orchestrator to run Wave 3 first.

## ZERO FRAME LITERALS RULE

This is the most-violated rule and the one with the largest blast radius.

Every frame number in scene code derives from the timing module:

```ts
// ✗ FORBIDDEN — absolute master-timeline literal
const wrapStart = 891;

// ✗ FORBIDDEN — bare offset disconnected from a cue
const wrapStart = bundleActionStart + 36;  // ok pattern, but 36 should be named

// ✓ REQUIRED — named relative offset, derived from cue boundaries
const BUNDLE_WRAP_RELATIVE_START_FRAMES = 12;  // ~0.4s after bundle cue starts
const bundleActionStart = cues['bundle-action'].startFrame;
const bundleActionEnd = cues['bundle-action'].endFrame;
const wrapStart = bundleActionStart + BUNDLE_WRAP_RELATIVE_START_FRAMES;
const wrapEnd = Math.min(wrapStart + WRAP_DURATION_FRAMES, bundleActionEnd);
```

**Always clamp relative offsets against `endFrame`.** Cue lengths shift with ASR realignment. If your motion needs 30 frames inside a cue that ends up 24 frames long, the motion clips. Don't blow past the boundary; either clamp or pick a smaller motion budget.

Same rule for sketch marks: every TeacherMark's `drawProgress` is interpolated against `[cueStart + relativeOffset, cueStart + relativeOffset + duration]`, then clamped against `cueEnd`. No `drawStart: 891` literals in the scene file.

## Cue-driven choreography

Every cue has `startFrame`, `endFrame` from the **reconciled** timeline (Wave 3.5 — see `docs/pipeline-architecture.md`). The reconciled cue length is `max(narrationSeconds, visualMotionSeconds) + tail`. Motion within a cue is parameterized as named offsets relative to cue boundaries, never absolute frames.

For each cue, the composer chooses motion that fits within `endFrame - startFrame`. If the visualMotionSeconds budget the composer chose (in `layout.ts` as relative offsets) overshoots the cue window, the composer:

1. First, **trim non-load-bearing flourishes** — sparkle, settle bounce, decorative dismissals. Cut these BEFORE compressing load-bearing motion.
2. Then, if still overrunning, COMPRESS the load-bearing motion uniformly (e.g., 30-frame migration → 24 frames). This must remain kid-readable; if you can't compress without losing the discovery, kick back to Wave 2a — the motion budget was wrong.
3. **NEVER extend the cue.** The cue length is reconciled by Wave 3.5; the composer does not insert padding.
4. **NEVER re-trigger Wave 3 voice generation.** Audio is frozen after Wave 3a.

### NO PADDED TABLE

The pre-v1 mechanism of `PADDED_CUE_DURATIONS_FRAMES` is DELETED. The lesson timeline file (`src/lessons/<X>LessonTimeline.ts`) exports the reconciled cues directly. Do not re-introduce a hold table.

```ts
// ✗ FORBIDDEN — old pattern, deleted from the architecture
const PADDED_CUE_DURATIONS_FRAMES: Record<string, number> = { ... };

// ✓ REQUIRED — reconciled cues are the timeline
export const myLessonCues: AlignedLessonCue[] = buildReconciledCues({
  alignedCues: myLessonAlignedCues,   // from generated/<X>Timing.ts (Wave 3a)
  visualMotionByCueId: VISUAL_MOTION,  // from visual-design.md motion-budget
  tailSeconds: 0.25,
});
```

The `buildReconciledCues` helper computes per-cue `endFrame = startFrame + max(narrationFrames, visualMotionFrames) + tailFrames`, then chains cues end-to-end. If `visualMotionByCueId` is undefined for a cue, the cue length = narration + tail (narration-driven cue).

## Named motion vocabulary

Every easing curve and spring config in scene code comes from `src/motion-primitives/curves.ts` — see `CAPABILITIES.md#motion-vocabulary` for the full reach guide. Raw `Easing.bezier(...)` numbers or inline `{ damping, stiffness, mass }` literals in a `LessonScene.tsx` are a smell — name it.

```ts
// ✗ FORBIDDEN — anonymous curve, no shared vocabulary
const x = interpolate(progress, [0, 1], [-200, 0], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
});

// ✓ REQUIRED — named curve from the kit
import { EASE } from "../motion-primitives";
const x = interpolate(progress, [0, 1], [-200, 0], { easing: EASE.enter });
```

For entrance physics on countables, prefer `<PopIn motion="snap" | "bouncy" | "settle">` over hand-rolled spring configs — see `CAPABILITIES.md#popin-motion-variants`. `motion="bouncy"` is for ONE moment per video (the new concept being introduced); default is `"snap"`.

The "one progress source, derive everything" pattern is still the rule: compute one `progress = ...` per beat from cue boundaries, then `interpolate(progress, ...)` it independently to drive `x`, `opacity`, `scale`. The named curves slot into that pattern — they don't replace it.

## Identity invariants from the Visual Contract

Read `visual-design.md` for the identity-invariant line. Common invariants for early-math:
- The teaching units (sticks) live the whole video as ONE primitive instance. The composer does not destroy and recreate them per cue.
- Color/tone of the teaching unit does not change across the transformation.
- The "before" and "after" of a comparison use the same primitive, only count/scale/opacity differ.

The composer enforces these by structure: one `<StickGroup count={10}>` mounted at the root of the scene, parameterized per cue by its `layout` and `revealUpTo` props. NOT ten `<StickGroup>`s per cue.

## Intro card choreography (don't stack the cast on the title)

Every lesson opens with a topic-intro beat (title + section + KP teaser). The classic failure — shipped and caught only by a human — is rendering the **intro card and the teaching cast in the same instant at overlapping positions**, so the figures sit on top of the title and hide its letters.

- **Sequence, don't pile.** The title resolves and is **readable on its own first**; the cast/teaching objects enter **after** (a beat later), or live in a disjoint zone that never overlaps the title's box. A title and a figure must not share the same screen band at the same time.
- The intro is a tiny choreography (title in → hold to read → cast in), not one static frame with everything at once. If everything appears on frame 1, the title never gets its moment and you get the overlap.
- This is a layout/timing decision the composer owns, derived from cue-relative offsets like everything else (`introCardEnd`, `castEntranceStart = cues.intro.startFrame + AFTER_TITLE_FRAMES`). No frame literals.

## File outputs

Mirror the existing lesson pattern. For lesson id `<lesson-id>` (kebab) → `<camelId>` → `<PascalId>`:

1. `src/lessons/<camelId>LessonTimeline.ts` — derives audio/caption/duration from generated timing
2. `src/lessons/<PascalId>LessonScene.tsx` — the scene (frame-driven, cue-bounded)
3. `src/lessons/Complete<PascalId>Lesson.tsx` — the composition wrapper (scene + voice + caption + bgm/sfx layers)
4. `src/Composition.tsx` — add re-exports alphabetically near `CompleteMakeTenLesson`
5. `src/Root.tsx` — add `<Composition id="Complete<PascalId>Lesson" .../>` block

Do NOT write or modify primitives. If a primitive is missing or wrong, FAIL and report back — primitive changes are Wave 3's domain.

## Sound layer (bed + SFX) — when `audio-cues.json` exists

Music+SFX is a SECOND audio track you ADD; it consumes the reconciled timeline and changes no cue length. Two halves, different owners of the frame:

- **Bed = mechanical.** In the Complete wrapper, render `<LessonBgmLayer bed={audioCues.bed} windows={spansToWindows(voiceoverSpans)} totalFrames={durationInFrames} />`. The duck envelope + 0.75s edge fades come from `bedVolume` — you wire it, you don't tune it. If `audioCues.toneSafe`, the bed key is already a flat pad; do NOT add a melodic sting under narration. See `CAPABILITIES.md#lesson-music-bed`.
- **SFX = you own the frame.** For each row in `audioCues.sfx`, build an `SfxEvent` whose `fromFrame` is `cues[row.cue].startFrame + <named layout.ts offset>` — the SAME offset the triggering motion uses (a `pop` lands on its `<PopIn>`'s entrance frame; `count`+`perStep` emits one `tick` per counted item at each step frame, with ascending `semitones` if `risingPitch`). Pass the assembled array to `<LessonSfxLayer events={sfxEvents} />`. NEVER a frame literal. See `CAPABILITIES.md#lesson-sfx-layer`.

Discipline (inherited from `lesson-sound-design`): ≤1 motivated SFX per beat; NO SFX over instruction narration; the bed asset is ≥ lesson length so it never loops. Assert `bedSeconds ≥ totalSeconds` and FAIL if not. A lesson with no `audio-cues.json` ships silent — that is valid; do not invent a bed.

## Bbox manifest

- Extract layout constants (positions, sizes, motion timings, anchor coords) into `src/lessons/<camelLessonId>/layout.ts` (pure TS, no React). The scene imports from it. The manifest imports from it. One source.
- Create `src/lessons/<camelLessonId>/manifest.ts` exporting `LESSON_MANIFEST: LessonManifest` per the contract at `src/lessons/manifestTypes.ts`. Register only the load-bearing elements listed in visual-design §3 Visual Contract — not every `<g>`. Register EVERY load-bearing element, including migrating/transforming cards — a missing entry is invisible to BOTH check paths.
- Each element's `bboxAt(frame)` MUST use the same interpolation helpers as the scene (`lerp`, `progress`, `reveal`, `clampToCue`) wired to the same constants from `layout.ts`. Same in, same out. If the manifest and the scene drift, `npm run lesson:check` flags a false positive — that IS the desired behavior, since the drift means the scene changed without a manifest update.
- **Tag the scene for the measured pass.** Spread `{...measureProps("<id>")}` (from `./_measure/measureHook`) onto the OUTERMOST `<g>`/wrapper of each registered element — the `<id>` MUST equal the `manifest.elements[].id` — and call `useMeasureHook()` ONCE at the top of the scene root component. `measureProps` returns an inert `data-mid` attribute; `useMeasureHook` is inert unless the measured pass sets its flag — zero effect on normal renders. This lets `--measured` read each element's TRUE rendered `getBBox()`.
- Before declaring Wave 4 done, run `npm run lesson:check -- --config lesson-data/<id>/pipeline.json --measured` and inspect:
  - `lesson-data/<id>/bbox-manifest.json` — fast `summary.collisionCount` must be `0`; the `measured` block's `summary.measuredCollisionCount` and `summary.gatesFailed` must be `0`/empty, OR every collision (linear AND measured) + failed gate explicitly justified in a paragraph in the report-back. The linear path uses LINEAR progress and ~11 keyframes, so it misses easing-overshoot and between-keyframe overlaps; the measured pass catches them via real `getBBox()`. For a measured-only collision, open `out/<id>/measured-frames/f<frame>.png` and rule it a true overlap or a by-design adjacency in writing.
  - `lesson-data/<id>/contact-sheet.png` — visual sanity check on each keyframe.
  - `lesson-data/<id>/primitive-checks/*.png` — finger-cover test on any redesigned primitive rendered alone at lesson scale.
- If any artifact flags an issue, iterate on the scene / manifest / primitive and re-run the check. Iteration is cheap (stills < 1s each; the measured pass adds ~10–19s for SSR peak frames); the full MP4 render is minutes — save it for after the check is clean. See `docs/proposals/machine-gated-verification.md` for the gate spec.

## Pre-render animatic gate

Before the full MP4 render, the composer runs `npm run lesson:animatic -- --config lesson-data/<id>/pipeline.json` and inspects `out/<lessonId>/<lessonId>-animatic.png` (cue-boundary thumbnails over a waveform with orange cue-start markers). The orchestrator reviews this animatic before greenlighting `lesson:render` — visible audio/visual misalignment at cue boundaries is cheaper to catch here than after a multi-minute render.

## Render-and-self-critique (mandatory)

After writing the scene, the composer:

1. Runs `npm run lint`. Must pass.
2. Renders **several** still frames — never just the climax. The climax-only still is how the intro title-occlusion shipped: a one-frame check is blind to overlaps that happen elsewhere or only at full opacity. At minimum render: the **intro at full cast opacity** (a late-intro frame, after every intro element has ramped to opacity 1 — NOT frame 30 when the cast is faint), the **climax cue mid-frame**, and **one peak-opacity frame per cue** where multiple load-bearing elements coexist:
   ```
   cd remotion-svg-primitives && npx remotion still src/index.ts Complete<PascalId>Lesson out/<lesson-id>/qa-f<frame>.png --frame=<frame>
   ```
3. Grades each still against the Visual Contract:
   - Are the zones respected? (cover the captions — does the picture still teach?)
   - Is the teaching unit ≥ minimum size from kids-eye §1?
   - Is the identity-invariant visible (e.g. same orange sticks before and after, just composed differently)?
   - **Is any load-bearing text/title occluded by a figure at full opacity?** (The intro title under the cast is the canonical miss — check it explicitly on the full-opacity intro frame.)
   - Is there any label overlapping the teaching object?
4. If the still fails the contract: **redesign the failing region.** Do not patch with a wrapper. Do not declare done from code inspection.
5. Re-render. Re-grade. Stop only when the still IS the contract.

The composer reports back with the path to the still and a 1-line grade per Contract bullet.

## What the composer must NOT do

- Modify any file under `src/shape-primitives/` (primitives are Wave 3's domain)
- Introduce new pedagogy / new copy / new cues not in script-cues.json
- Hardcode any hex color (use `colors.*` from theme)
- Hardcode any frame number not derived from `cues[id]`
- Hardcode any `Easing.bezier(...)` numbers or spring `{ damping, stiffness, mass }` literal in a scene file — use `EASE.*` / `SPRING.*` from `motion-primitives/curves.ts`
- Skip the render-and-critique step
- Claim visual correctness from code inspection alone

## Report back

- Files created/modified (full paths)
- Lint result (paste final summary)
- Path to climax still + per-Contract-bullet grade
- Any deviation from upstream specs with reason
- Any TODOs left for verification or future composer runs

## Style overlay (opt-in)

If `brief.md` declares `**Style.** <id>` (other than `default`), wrap the scene root in `<StylePreset style="<id>">` outside `<SceneFrame>`. Read the corresponding `.agents/styles/<id>/` bundle to choose palette/animation tweaks per `capabilities.md` in that bundle. Apply the modifier filter to the teaching `<g>` via `useStyleFilter()`:

```tsx
const filter = useStyleFilter();
return <g filter={filter}>{/* teaching SVG */}</g>;
```

Render `<FXDefs />` at scene root if any `<Sparkle>`/`<ShineSweep>`/`<GlintFlash>`/`<GlowPulse>` is used. `<Breathe>` does not require FXDefs. See CAPABILITIES.md#style-overlay-system, CAPABILITIES.md#magic-fx-library.

## Moving-hold wrap convention (rule #6)

**Rule:** Every cue's PRIMARY load-bearing visual group is wrapped in `<Breathe>` unless it is in active motion. The visible result must satisfy: no frame in the rendered video has zero per-frame change.

For each cue, identify the element the child is reading during the cue's static stretch — the dot row during fen-name, the count strip during he-name's hold, the 分合式 diagram during fenheshi-read's hold, the recap row during outro — and wrap it once at the rendering site:

```tsx
<Breathe
  amplitudeScale={0.005}        // 0.5% — kid-eye identity threshold
  bpm={15}                       // one breath per 4s
  drift={0.5}                    // optional ±px y-translation
  originX={GROUP_CX}             // group centre — moving values are fine
  originY={GROUP_CY}             // (the breath scales around current centre)
  phaseSeed="<lesson>-<group>"   // unique per group so they don't sync
>
  {/* the group's existing rendering — unchanged */}
</Breathe>
```

The wrap stays in place during the group's own motion: a 0.5% scale-pulse is masked by any larger animation, so the only visible effect is during static holds. No conditional gating on "is active" needed.

**Anti-pattern.** Wrapping non-load-bearing decoration (sparkles, ribbons, glyph flourishes) in `<Breathe>`. Accents don't need breath — breath on accents looks twitchy. Two groups sharing the same `phaseSeed` is also forbidden: they sync and read mechanical.

See CAPABILITIES.md#magic-fx-library for the full `<Breathe>` API, parameter defaults, and additional anti-patterns.
