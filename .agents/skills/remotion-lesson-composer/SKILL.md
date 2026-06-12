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
- `lesson-data/<id>/script-cues.json` — narration text, phrase, caption, and any `gap` ({seconds, reason}) per cue
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

Every cue has `startFrame`, `endFrame` from the **reconciled** timeline (Wave 3.5 — see `docs/pipeline-architecture.md`). In v4 **cue-anchored audio** the reconciled cue length is `max(narrationFrames + gapFrames, visualMotionFrames) + tail`, and each cue's voice is its OWN measured clip mounted at `cue.startFrame` (the timeline also exports a `<X>VoiceClips` array). Motion within a cue is parameterized as named offsets relative to cue boundaries, never absolute frames.

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

// ✓ REQUIRED (v4) — the per-cue clip module is the audio truth; reconcile chains it
import { reconcileClipTimeline } from "@studio/narration-kit";
import { myLessonClips } from "./generated/myLessonClips"; // Wave 3a: clipSrc + exact narrationFrames + typed gap
const reconciled = reconcileClipTimeline({
  clips: myLessonClips,
  visualBudgets: VISUAL_MOTION,        // from visual-design.md motion-budget (seconds)
  fps: 30,
  tailFrames: 9,
});
export const myLessonCues = reconciled.cues;            // visuals + captions read this
export const myLessonVoiceClips = reconciled.voiceClips; // AudioLayer mounts one Sequence each
export const myLessonDuration = reconciled.durationFrames;
```

`reconcileClipTimeline` computes per-cue `endFrame = startFrame + max(narrationFrames + gapFrames, visualMotionFrames) + tailFrames`, then chains cues end-to-end. The clip plays at the cue start; the rest of the window is free silence (a motion hold and/or a typed gap). There is NO `<X>Timing.ts`/`Silences.ts` import in the timeline and NO ASR-boundary correction — that's all gone.

**Audio wiring:** pass `<X>VoiceClips` straight into `<LessonAudioLayer voiceClips={...}>` (the kit mounts one `<Sequence from={clip.fromFrame}>` per clip). NEVER wire a single `teacherAudioSrc`/continuous WAV. Derive the bed-duck windows from the clip spans (`spansToWindows(voiceClips.map(c => [c.fromFrame, c.fromFrame + c.durationInFrames]))`).

### Honor intentional silence — the gap reason

A cue may carry a `gap` ({seconds, reason}) — a stretch where the voice is deliberately empty (`docs/pipeline-architecture.md` §10). The silence is already in the WAV and in the cue window; the composer's job is to make that window **read as intentional, never as a frozen dead frame**:

- **`reason: "learner-response"`** (the wait-time after a "now you say it" prompt) — hold a **LEGIBLE "your turn" affordance** through the gap window, made of THREE readable parts: (1) a localized prompt LABEL the child can read (a "your turn" phrase in the lesson's framing language), (2) a `PulseCircle` or breathing ring drawing the eye to the read-along row the child should echo, and (3) a simple speech / mic glyph. A **bare low-opacity glow with no label and no icon is FORBIDDEN** — it reads as dead air, not an invitation. **Default = compose existing primitives** (`PulseCircle` + the prompt label + a glyph + `ReadAlongHighlight`), per the REUSE-first law; only if that composition genuinely cannot read at render size, flag a `<ResponseGapPrompt>` capability gap to Wave 3 — never hand-roll a one-off faint glow. Do **not** stack narration-driven motion or start the next target inside a response window.
- **`reason: "animation-hold"`** — let the focal visual *breathe* and complete; this is the picture teaching. Use the moving-hold wrap (rule #6) so a static stretch isn't dead-still.
- All gap frames are cue-relative (`cues['echo-hello'].startFrame + offset`) — zero literals, as everywhere.

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

Write exactly these files for your lesson. **The skeleton below IS the pattern — do NOT open another lesson to "see how it's done."** Reading any other `src/lessons/<other>*` or `lesson-data/<other>/` is a READING-LAW violation (under `--sandbox` it is an OS-level `EPERM`, not a style note): a prior lesson is presumed flawed, and copying its shape is hidden hard-coding that masks whether the skill itself is sufficient. Everything you need is in THIS skill + `catalog-digest.md` + your own lesson's artifacts. For lesson id `<lesson-id>` (kebab) → `<camelId>` → `<PascalId>`:

1. `src/lessons/<PascalId>LessonScene.tsx` — the scene (frame-driven, cue-bounded). Imports the reconciled `<camelId>Cues` from `./<camelId>LessonTimeline` (written by Wave 3.5 — you READ it, you do NOT author it), primitives from `../shape-primitives` / `../motion-primitives` / `../fx`, layout offsets from `./<camelId>/layout`, and `useMeasureHook` / `measureProps` from `./_measure/measureHook`.
2. `src/lessons/<camelId>/layout.ts` (offset constants) + `src/lessons/<camelId>/manifest.ts` (bboxAt per load-bearing element; contract `./manifestTypes.ts`).
3. `src/lessons/Complete<PascalId>Lesson.tsx` — the composition wrapper (scene + voice + caption + bgm/sfx layers), **and in this same file** the registration descriptor.

Minimal shape of the two `.tsx` files (fill in YOUR cues/primitives; every frame derives from `cues[id].startFrame + <layout offset>`):

```tsx
// <PascalId>LessonScene.tsx
export const <PascalId>LessonScene: React.FC<{ cues: CueMap }> = ({ cues }) => {
  const frame = useCurrentFrame();
  useMeasureHook();                                  // call ONCE at the scene root
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      {/* one cue-bounded group per beat; offsets are layout.ts constants, never literals */}
      <g {...measureProps("introTitle")}>
        <LessonIntroCard progress={spring({ frame: frame - cues.intro.startFrame, /* … */ })} />
      </g>
      {/* … */}
    </AbsoluteFill>
  );
};

// Complete<PascalId>Lesson.tsx
export const Complete<PascalId>Lesson: React.FC = () => (
  <AbsoluteFill>
    <<PascalId>LessonScene cues={<camelId>Cues} />
    <LessonAudioLayer voiceClips={<camelId>VoiceClips} />
    <LessonCaptionLayer captions={<camelId>Captions} />
    <LessonBgmLayer bed={audioCues.bed} windows={spansToWindows(voiceoverSpans)} totalFrames={<camelId>Duration} />
    <LessonSfxLayer events={sfxEvents} />
  </AbsoluteFill>
);
import type { LessonComposition } from "./lessonRegistryTypes";
export const lessonComposition: LessonComposition = {
  id: "Complete<PascalId>Lesson",
  component: Complete<PascalId>Lesson,
  durationInFrames: <camelId>Duration,              // from the reconciled timeline module — NEVER a literal
  defaultProps: complete<PascalId>LessonDefaultProps,
};
```

**Code hygiene — lint-clean is part of "done."** The Wave-5 render gate runs whole-repo `npm run lint` = `eslint src && tsc`, so a single dirty file in YOUR lesson blocks EVERY lesson's render. Three rules make your output pass first try:
- **The scene component is PascalCase** — `export const <PascalId>LessonScene: React.FC<…>` (wrapper: `Complete<PascalId>Lesson`). A lowercase component name (`<camelId>LessonScene`) makes every `useCurrentFrame()`/`useMeasureHook()` inside it a `react-hooks/rules-of-hooks` ERROR — React only treats Capitalized names as components/hooks.
- **ESM `import` only — never `require()`** anywhere (`no-require-imports` is an error). Import generated modules: `import { <camelId>Clips } from "./generated/<camelId>Clips"`.
- **No unused imports or vars** (`no-unused-vars` is an error) — import only what the scene actually renders; delete a constant the moment it stops being used.

**Registration is auto-discovered — NEVER hand-edit a shared file.** `npm run lessons:registry` (run automatically by `lesson:render` before bundling, and folded into `registry:build`/`registry:check`) statically discovers every `Complete*Lesson.tsx` that exports `lessonComposition`, writes `src/lessons/_lessonRegistry.generated.tsx`, and `Root.tsx` maps over it. So do **NOT** touch `src/Root.tsx` or `src/Composition.tsx` — under worktree-isolated parallel runs those shared lists are the merge-conflict surface, and a half-built lesson hand-wired into them breaks the whole bundle. Your lesson writes ONLY its own disjoint files; the merge-back is then a conflict-free union. (A lesson is EITHER hand-registered in Root.tsx OR auto-discovered, never both — Remotion throws on a duplicate id.)

Do NOT write or modify primitives. If a primitive is missing or wrong, FAIL and report back — primitive changes are Wave 3's domain.

## Sound layer (bed + SFX) — when `audio-cues.json` exists

Music+SFX is a SECOND audio track you ADD; it consumes the reconciled timeline and changes no cue length. Two halves, different owners of the frame:

> **Every key in `audio-cues.json` is already verified to resolve.** Wave 3c (`_logs/sound-asset.md`) confirmed each `bed` / `sting` / `sfx` key maps to a real WAV in the curated library (`public/audio/_beds|_stings|_sfx/`), and the `<LessonBgmLayer>` / `<LessonSfxLayer>` kit resolves the key string itself. **Pass the key through verbatim — do NOT locate, open, or verify the `.wav`, and NEVER search `node_modules`, `@studio/*`, or the filesystem for an audio asset.** The key IS the API; hunting for the file is the exact wasted spelunk this note prevents.

- **Bed = mechanical.** In the Complete wrapper, render `<LessonBgmLayer bed={audioCues.bed} windows={spansToWindows(voiceoverSpans)} totalFrames={durationInFrames} />`. The duck envelope + 0.75s edge fades come from `bedVolume` — you wire it, you don't tune it. If `audioCues.toneSafe`, the bed key is already a flat pad; do NOT add a melodic sting under narration. See `CAPABILITIES.md#lesson-music-bed`.
- **SFX = you own the frame.** For each row in `audioCues.sfx`, build an `SfxEvent` whose `fromFrame` is `cues[row.cue].startFrame + <named layout.ts offset>` — the SAME offset the triggering motion uses (a `pop` lands on its `<PopIn>`'s entrance frame; `count`+`perStep` emits one `tick` per counted item at each step frame, with ascending `semitones` if `risingPitch`). Pass the assembled array to `<LessonSfxLayer events={sfxEvents} />`. NEVER a frame literal. See `CAPABILITIES.md#lesson-sfx-layer`.

Discipline (inherited from `lesson-sound-design`): ≤1 motivated SFX per beat; NO SFX over instruction narration; the bed asset is ≥ lesson length so it never loops. Assert `bedSeconds ≥ totalSeconds` and FAIL if not. A lesson with no `audio-cues.json` ships silent — that is valid; do not invent a bed.

## Bbox manifest

- Extract layout constants (positions, sizes, motion timings, anchor coords) into `src/lessons/<camelLessonId>/layout.ts` (pure TS, no React). The scene imports from it. The manifest imports from it. One source.
- Create `src/lessons/<camelLessonId>/manifest.ts` exporting `LESSON_MANIFEST: LessonManifest` per the contract at `src/lessons/manifestTypes.ts`. Register only the load-bearing elements listed in visual-design §3 Visual Contract — not every `<g>`. Register EVERY load-bearing element, including migrating/transforming cards — a missing entry is invisible to BOTH check paths.
- Each element's `bboxAt(frame)` MUST use the same interpolation helpers as the scene (`lerp`, `progress`, `reveal`, `clampToCue`) wired to the same constants from `layout.ts`. Same in, same out. If the manifest and the scene drift, `npm run lesson:check` flags a false positive — that IS the desired behavior, since the drift means the scene changed without a manifest update.
- **Intentional overlaps are manifest-declared element-id PAIRS.** An intentional overlap (e.g. a whole-number card sitting on its own decomposition column) is declared as an element-id pair in `LESSON_MANIFEST.allowedOverlaps` (`[["whole-card", "column-row-0"], …]`), one line of justification each. A zone tag never exempts a pair — if your green collision count depends on a zone exemption, the green is vacuous (the shipped failure: question text ON the dots, tagged `labels`, blanket-exempt, both passes green).
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

1. Lints its OWN generated files clean and fixes EVERY error before declaring done — `npx eslint src/lessons/<PascalId>LessonScene.tsx src/lessons/Complete<PascalId>Lesson.tsx src/lessons/<camelId>/*.ts`. A lint error in your files is a contract breach (status=`blocked`), never a downstream surprise — see *Code hygiene* above for the three rules that make it pass. Do NOT gate yourself on whole-repo `npm run lint`: another half-built lesson's errors aren't your lane — lint only YOUR files; the render gate then passes once every lesson's composer does the same.
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

## On-screen target text must match the cue's own audio

Every on-screen target STRING — a `DialogueExchange` `line`, a `ReadAlongHighlight` word glyph, a name tag — must be a token the **current cue's own voice clip actually speaks**. Derive it from THAT cue's `phrase` / `narration` in `script-cues.json` (the frozen audio truth), NEVER re-author it from the brief's prose or from an adjacent cue. The failure mode is a bubble that shows a word this cue's audio never speaks — a phrase carried over from an earlier cue, or lifted from the brief — so the picture displays text the child does not hear (and the burned-in caption may show yet a third string). On-screen target strings must be a SUBSET of the cue's spoken phrase, in spoken order. A word that must appear on screen but is NOT in this cue's audio belongs in the cue where it IS spoken — or needs its own cue: kick back to storyboard / audio-captions, do not paper over it in the scene.

## What the composer must NOT do

- Modify any file under `src/shape-primitives/` (primitives are Wave 3's domain)
- Introduce new pedagogy / new copy / new cues not in script-cues.json
- Put a word on screen that the current cue's voice clip does not speak — on-screen target strings (bubble lines, read-along glyphs, name tags) ⊆ the cue's spoken `phrase` from script-cues.json
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
