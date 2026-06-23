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

### Spoken enumeration binds to token onsets, never a step constant

Any animation that marks a SPOKEN enumeration or sequence — counting 1→N, pointing/circling once per number, a per-word pulse, a read-along step that advances word by word — MUST bind each step to that token's measured ASR onset frame (`cue.tokenOnsets`, cue-local, index-aligned to `cue.targetTokens`; read it via the kit `stepFramesFromOnsets(cue, n)` / `tokenOnsetFrame(cue, i)` helper and pass the result to the primitive's onset prop, e.g. `<OrderedRowSpotlight stepFrames={…}>`). A fixed step constant (`SWEEP_STEP_FRAMES`, an evenly-spaced grid stepped from the cue head, `cueStart + STEP*k`) is FORBIDDEN for spoken-synced stepping — it is the SAME class of bug as a frame literal, one level down: the inter-word interval is voice-dependent and already measured, so assuming it desyncs the mark from the word (a real shipped failure ran the circle ~1.5 s ahead of the spoken 第二/第三). Constants stay fine for NON-spoken motion (entrance pops, settles, breathe, decorative pacing) — the rule fires only when a visual step is meant to coincide with a specific uttered token.

**Before choosing a step source for ANY cue whose teaching action is a spoken count / enumeration / read-along (the storyboard tag — you do NOT improvise this from the layout), you MUST first READ `cue.tokenOnsets` from the reconciled timeline and STATE in the report-back which branch you took.** This is a forced decision keyed on an observable predicate, not a judgment call:

- **Onsets present** (`cue.tokenOnsets` non-empty) → bind via `stepFramesFromOnsets(cue, n)` / `tokenOnsetFrame(cue, i)` and pass the result to the primitive's onset prop. A fixed `*_STRIDE` / `*_STEP_FRAMES` grid (`cueStart + STEP*k`, an even cadence from the cue head, or a baked step array) for THIS cue is a contract breach.
- **Onsets absent** → (i) emit a `pipelineFinding` naming the cue id and the reason (`asr-low-evidence` | `onsets-missing-from-timeline`); AND (ii) check the cue's upstream ASR window: **if `asr-alignment.json` for this cue has a non-null `tokenStartIndex`** (a window DID score), then absent onsets in the timeline is the CLOBBER bug — a later non-`--align` voice roll overwrote the augmented clip module — so **HALT and signal to re-run W3a with `--align` (the LAST voice write must augment); do NOT substitute a constant cadence to paper over it.** Only a cue that is GENUINELY onset-less (a non-spoken count-walk, or a true `asr-low-evidence` window with null `tokenStartIndex`) uses the constant fallback.

A silent fixed cadence on a spoken-enumeration cue — `cue.tokenOnsets` never read, no branch stated in the report-back — FAILS the node (the same class as a frame literal, one level down). The inter-word interval is voice-dependent and already measured; assuming it desyncs the mark from the word (a real shipped failure ran the circle ~1.5 s ahead of the spoken 第二/第三).

## Sketch-overlay numbers are consumed VERBATIM

`sketch-overlay.md` is a numeric contract, not a suggestion. Every onset, duration, and anchor in a mark's spec is consumed VERBATIM (as the cue-relative value it states) — the composer never re-derives or "corrects" a spec number from its own reading of the motion phases. If a spec number disagrees with your layout's motion plan, that disagreement is a FLAGGED pipelineFinding stated in the report-back, never a silent substitution (shipped failure: spec onset 105 → the scene shipped `UNDERLINE_REL_START = 60` with a comment claiming 75 — three mutually contradictory numbers in one line — so the underline drew mid-motion under dots still in flight instead of on the settled state). When the spec marks a manifest `marks` entry as REQUIRED, omitting it is a contract breach — the linear pre-filter is blind to an unregistered mark.

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

**Identity is also temporal.** The persistent teaching unit fades in ONCE at its first mount and holds full opacity across every later cue boundary; each cue's motion starts from the PREVIOUS cue's settled positions. A per-cue opacity-0 re-entrance (each motion window ramping from 0) visually destroys and recreates the unit — the canvas plays empty under live narration for the pre-motion stretch of every cue (shipped failure: dots invisible through every conserve cue's bond phase and the reveal cue's opening). The manifest's `opacityAt` must mirror the scene's actual opacity — a manifest that says 1 while the scene renders 0 hides the blink from every check.

## Intro card choreography (don't stack the cast on the title)

Every lesson opens with a topic-intro beat (title + section + KP teaser). The classic failure — shipped and caught only by a human — is rendering the **intro card and the teaching cast in the same instant at overlapping positions**, so the figures sit on top of the title and hide its letters.

- **Sequence, don't pile.** The title resolves and is **readable on its own first**; the cast/teaching objects enter **after** (a beat later), or live in a disjoint zone that never overlaps the title's box. A title and a figure must not share the same screen band at the same time.
- The intro is a tiny choreography (title in → hold to read → cast in), not one static frame with everything at once. If everything appears on frame 1, the title never gets its moment and you get the overlap.
- This is a layout/timing decision the composer owns, derived from cue-relative offsets like everything else (`introCardEnd`, `castEntranceStart = cues.intro.startFrame + AFTER_TITLE_FRAMES`). No frame literals.

## File outputs

Write exactly these files for your lesson. **The skeleton below IS the pattern — do NOT open another lesson to "see how it's done."** Reading any other `src/lessons/<other>*` or `lesson-data/<other>/` is a READING-LAW violation (under `--sandbox` it is an OS-level `EPERM`, not a style note): a prior lesson is presumed flawed, and copying its shape is hidden hard-coding that masks whether the skill itself is sufficient. Everything you need is in THIS skill + `catalog-digest.md` + your own lesson's artifacts. For lesson id `<lesson-id>` (kebab) → `<camelId>` → `<PascalId>`:

1. `src/lessons/<PascalId>LessonScene.tsx` — the scene (frame-driven, cue-bounded). Imports the reconciled `<camelId>Cues` from `./<camelId>LessonTimeline` (written by Wave 3.5 — you READ it, you do NOT author it), primitives from `../shape-primitives` / `../motion-primitives` / `../fx`, layout offsets from `./<camelId>/layout`, and `useMeasureHook` / `measureProps` from `./_measure/measureHook`.
2. `src/lessons/<camelId>/layout.ts` (offset constants) + `src/lessons/<camelId>/manifest.ts` (metadata-only `{ id, zone }` per load-bearing element + optional `allowedOverlaps`; contract `./manifestTypes.ts`).
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

## ZERO SIZE LITERALS — fit units to (count + zone)

The size-side analogue of the ZERO FRAME LITERALS rule. A teaching object laid out in a zone gets its unit size + center positions from `fitUnitsToZone(zone, count)` (`src/layout`) — NEVER a hand-picked pixel `size=` or a per-lesson `dotGap`. Why: hand-tuned sizes are exactly the per-lesson churn this kills — one default can't be right for every count.

The `zone` is the kids-eye §1.5 zone; the `count` is the Visual Contract's per-cue object count (visual-discipline §1). The scene renders each unit at `positions[i]` sized `unit`; the check then reads each element's TRUE box off the render (getBBox), so there is no hand-mirrored size to drift. If `fits` comes back `false`, that is a real density problem: surface `overflowReason` as a pipelineFinding (reduce count / wrap to grid / re-zone) — never render the unit sub-floor. Clusters that render their own multiplicity take a `clusterBudget(zone)` budget, not positions. Full reach guide + the cluster bounding-budget contract: `CAPABILITIES.md#auto-size-to-zone`; design: `docs/proposals/auto-size-to-zone.md`.

```ts
// ✗ FORBIDDEN — hand-picked pixel size + gap, tuned per lesson then re-checked for collisions
const DOT_SIZE = 96; const DOT_GAP = 40;

// ✓ REQUIRED — size + positions computed from (zone, count) in layout.ts
import { fitUnitsToZone } from "../../layout";
export const dotFit = fitUnitsToZone(ZONE_OBJECTS, DOT_COUNT);  // layout.ts — the ONE place geometry lives
// scene: <Dot x={dotFit.positions[i].x} y={dotFit.positions[i].y} size={dotFit.unit} />
// the box is read off the render — never mirrored in the manifest
```

## Bbox manifest — metadata-only (`{ id, zone }`)

The manifest declares ONLY which elements are load-bearing and their zone. It carries NO geometry: the check (`npm run lesson:check`) reads each element's TRUE box off the rendered scene (`getBBox`). One source of geometry truth — `layout.ts` feeds the scene; the box is read back from the render, never hand-ported into a `bboxAt`. (There is no fast/linear pass and no `bboxAt`/`keyFrames` — the `SceneElement` type is `{ id, zone }`.)

- Extract layout constants (positions, sizes, motion timings, anchor coords) into `src/lessons/<camelLessonId>/layout.ts` (pure TS, no React). The scene imports from it — it is the ONE place geometry lives.
- Create `src/lessons/<camelLessonId>/manifest.ts` exporting `LESSON_MANIFEST: LessonManifest` per the contract at `src/lessons/manifestTypes.ts`. `elements` is an array of `{ id, zone }`: register EVERY load-bearing element from visual-design §3 Visual Contract (including migrating/transforming cards) and ONLY those — a missing entry is invisible to the check, an extra one breaks the bijection.
- **Tag the scene = the only binding to geometry.** Spread `{...measureProps("<id>")}` (from `./_measure/measureHook`) onto the OUTERMOST `<g>`/wrapper of each registered element — the `<id>` MUST equal `manifest.elements[].id` — and call `useMeasureHook()` ONCE at the scene root. Both are inert on a normal render; under the check they read each element's TRUE `getBBox()`. The box is whatever the scene renders, so a scene change can never silently drift from a hand-mirrored box (there is none to mirror).
- **Intentional overlaps are manifest-declared element-id PAIRS.** An intentional overlap (e.g. a whole-number card sitting on its own decomposition column) is declared as an element-id pair in `LESSON_MANIFEST.allowedOverlaps` (`[["whole-card", "column-row-0"], …]`), one line of justification each. A zone tag never exempts a pair — if your green overlap count depends on a zone exemption, the green is vacuous (the shipped failure: question text ON the dots, tagged `labels`, blanket-exempt, green).
- **DECORATION CARRIES NO MEASURE TAG — the box must equal the true footprint.** A `measureProps(id)` `<g>` wraps ONLY the load-bearing teaching mark. Decoration — pulse/attention rings, glow halos, sparkles, `<Breathe>`/shimmer wrappers, the your-turn cue, a recap spotlight — is NOT a load-bearing element: leave it UNTAGGED (no `measureProps`) and UNDECLARED (not in `elements`). Tagging decoration as load-bearing either breaks the bijection or inflates the measured box (shipped failures: a `<GlintFlash>` declared but never tagged failed bbox-binding; a pulse ring nested inside a label's `<g>` measured 516×400 vs its honest 960×60 and phantom-collided the dots). Decoration that crosses/sits-on a teaching mark is a defect to CUT, not exempt — the `decoration` zone exemption is for real backgrounds. (If you genuinely must measure a decoration, give it its OWN `zone:"decoration"` element — never nest it inside a teaching `<g>`.)
- **measure-id ≡ manifest-id is a BIJECTION (both directions, HARD gate).** Every `measureProps("x")` has exactly one `manifest.elements[].id === "x"`, AND every declared id is tagged somewhere in the scene (measured across the sampled frames). A measured id the manifest never declares, OR a declared id never measured, FAILS the `bbox-binding` gate (exit 1) — both void detection (shipped failure: scene tagged one `"recap"` while the manifest declared `recap-beat-1-5/2-4/3-3`). **One physical `<g>` carries ONE stable id for its whole life** — never frame-flip the id (`frame >= X ? "badge-three-a" : "badge-two-a"`): that declares two elements at one position and phantom-collides them. Give the element one id (`badge-a`).
- Before declaring Wave 4 done, run `npm run lesson:check -- --config lesson-data/<id>/pipeline.json` and inspect:
  - `out/<id>/bbox-manifest.json` — the `measured` block + `summary`. The run exits 1 only on a HARD gate (`summary.gatesFailed`): **bbox-binding** (the bijection) and **lufs** (master ≈ −16 LUFS / TP ≤ −1 dB). `summary.measuredCollisionCount` (overlap) and `summary.captionIntrusionCount` (a teaching element in the caption ribbon) are WARN — surface + fix-or-justify, but they do NOT fail the run (geometric metrics with false-positive sources — opacity-blind crossfades, a label legitimately near the ribbon; the human is the eye). A justification MUST quote the exact failing row (element id + frame + measured value); naming an element the gate never flagged is a contract breach, not a justification (shipped failure: a `bond-glyph@640 ratio 1.37` "justified" as intentional dimming — an element the gate never flagged). For a measured collision, open `out/<id>/measured-frames/f<frame>.png` and rule it a true overlap or a by-design adjacency in writing.
  - `out/<id>/bbox-overlay/f<frame>-bbox.png` — **the review surface for anything bbox-related** (`npm run lesson:bbox -- --config lesson-data/<id>/pipeline.json [--frames a,b]`). Draws each element's MEASURED box (solid, by zone) with `id · zone · W×H` labels; a measured id the manifest doesn't declare draws RED (a bijection break). NEVER hand a human a bare screenshot when a collision/size is in question — hand the boxed still.
  - `out/<id>/<id>-contact.png` — visual sanity check on each cue.
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

**If the still-render path cannot run** (sandbox EPERM, env/webpack crash, missing browser), Wave 4 is **NOT done**: return `status="blocked"` naming the blocker. The stills are the load-bearing verification; the bbox/measured JSON is a pre-filter and is NEVER a substitute. Declaring `ok` on programmatic gates alone is the exact shipped failure — twice: the Node-24 wasm-hash crash (2026-06-09) and the sandbox `.env.local` EPERM (2026-06-10), both "green JSON" runs that shipped text-on-dots and empty frames.

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
- Per justified collision/gate failure: the exact failing JSON row quoted verbatim (element id + frame + measured value), then the by-design argument — never a re-narration from memory
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
