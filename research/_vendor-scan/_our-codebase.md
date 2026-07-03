# our codebase — self-scan (2026-07-03)

`/Users/tk/Desktop/animation-test` (`remotion-svg-primitives/` is the pipeline root) — the in-house kids-lesson-video pipeline: Remotion + TypeScript, one brief.md per lesson feeds a 14-wave subagent workflow (pedagogy → storyboard → visual-design → audio/captions → voice+ASR → cue reconcile → compose → render → verify), producing a per-cue-coordinated MP4. This scan applies the SAME two questions asked of the 13 vendor repos to our own code, honestly — including where our doctrine (CLAUDE.md) and our actual shipped code have drifted apart. Reference lesson: `kptest-count-to-two` (newest complete fixture, committed 2026-07-01, `remotion-svg-primitives/src/lessons/kptestCountToTwo{,LessonScene.tsx,LessonTimeline.ts}`), cross-checked against `kp2-counting-by-tens`, `kptest-fenyuhe-six`, and `kptest-first-second-third`.

## What this repo is

Not a template or a component library demo — a **production pipeline** whose product is "rules + a validator," not any one video (see user directive in memory: "videos disposable, system is the product"). Two audio/geometry truths are frozen by construction: (1) each cue owns one measured voice clip mounted in its own `<Sequence>` (v4 cue-anchored audio, no continuous WAV), and (2) every load-bearing visual element is measured off the real render (`getBBox`) rather than hand-mirrored into a manifest. Both mechanisms are real, tested, and load-bearing. The scan also surfaces that the pipeline's own newest fixture (`kptest-count-to-two`) currently ships in a broken, self-contradictory state — direct, verified evidence that automation here is stronger on the audio/geometry-truth side than on the cross-artifact-consistency side.

## A. Layout & overlay prevention

### A1. Geometric auto-size-to-zone — fit by construction, not detection

**Where:** `remotion-svg-primitives/src/layout/fitToZone.ts:98-129`

**What it does:** `fitUnitsToZone(zone, count, opts)` is a pure, deterministic function: given a declared zone rect and a unit count, it solves the largest unit size that (a) clears the kids-eye legibility floor (`sizing.teachingUnit.min`, 86px) and (b) fits the zone at that count, shrinking from a `target` (96px) toward `min` and never below it; if it still can't fit, it returns `fits:false` plus a numeric `overflowReason` instead of silently rendering sub-floor. The scene and the bbox manifest both call this with identical inputs, so on-canvas size and collision box agree by construction — this is layout *prevention*, not post-hoc collision detection.

**Load-bearing code:**
```ts
const unitFor = (perRow: number, rows: number): number => {
  const widthBudget = (zone.width - (perRow - 1) * gap) / perRow;
  const heightBudget = (zone.height - (rows - 1) * gap) / rows;
  return Math.min(targetUnit, widthBudget, heightBudget);
};

// 1–2. One row first.
const rowUnit = unitFor(count, 1);
if (rowUnit >= minUnit) {
  return buildResult(zone, count, 1, rowUnit, gap, align);
}
```

**Why we do it:** so unit size is *computed* from (zone, count) once, and the same computation is reused for the collision box — killing the class of bug where the scene renders one size and the manifest claims another. (Caveat — see C5: only one shipped lesson actually calls this helper.)

### A2. Metadata-only manifest + measured `getBBox()` as the single geometry truth

**Where:** `remotion-svg-primitives/src/lessons/manifestTypes.ts:22-30`, `remotion-svg-primitives/src/lessons/_measure/measureHook.ts:96-98,133-183`

**What it does:** A lesson manifest declares ONLY `{id, zone}` per load-bearing element — no `bboxAt(frame)`, no geometry. `measureProps(id)` tags the element's outermost `<g>` with `data-mid="<id>"`; under the opt-in measured pass, `measureAll()` walks every `[data-mid]` node, reads its true `getBBox()`, maps it through the element's and the root SVG's `getScreenCTM()` into composition pixels, and logs it. This is a **deliberate architecture change** ("Batch 5 manifest auto-derive") away from a hand-maintained `bboxAt` mirror of `layout.ts` math.

**Load-bearing code:**
```ts
export type SceneElement = {
  id: string;
  zone: ZoneName;
};
```
```ts
export const measureProps = (id: string): { "data-mid": string } => ({
  "data-mid": id,
});
```

**Why we do it:** a hand-mirrored `bboxAt` inevitably drifts from the scene's real layout math (two sources of truth for one geometry). Reading the box off the actual render means the manifest can never disagree with what's on screen — and it automatically captures spring/easing overshoot that a linear envelope would under-estimate.

### A3. Bijection gate — every measured id ⟺ every declared id

**Where:** `remotion-svg-primitives/scripts/lesson-measured.mjs:484-500`

**What it does:** After sampling every peak frame, the gate computes the SET of ids ever measured vs. the SET of ids declared in the manifest. Any id measured but undeclared (falls back to zone `"decoration"`, silently collision-exempt) or declared but never measured (untagged element, or an id typo) both FAIL the bijection — the real-world case that motivated this: a scene tagged one `"recap"` id while the manifest declared three separate `recap-beat-*` ids, silently voiding collision detection for all of them.

**Load-bearing code:**
```js
const measuredIdsAll = new Set();
const manifestIdsAll = new Set((extracted.elements || []).map((e) => e.id));
for (const frame of peakFrames) {
  for (const id of Object.keys(measuredByFrame[frame] || {})) measuredIdsAll.add(id);
}
const measuredNotInManifest = [...measuredIdsAll]
  .filter((id) => !manifestIdsAll.has(id))
  .sort();
const manifestNeverMeasured = [...manifestIdsAll]
  .filter((id) => !measuredIdsAll.has(id))
  .sort();
```

**Why we do it:** a collision check is worthless if the boxes it compares don't actually correspond to the declared elements — the bijection is the trust anchor underneath every other measured gate.

### A4. Zone-pair allow-list — collision exemption is a declared pair, never a zone-wide default

**Where:** `remotion-svg-primitives/src/lessons/manifestTypes.ts:62-85`

**What it does:** `ALLOWED_OVERLAP_PAIRS` is the single source of truth (forwarded to the plain-node collision script since it can't import `.ts` directly) for which zone pairs may overlap without flagging (`marks:objects`, `decoration:*`, and same-zone `decoration:decoration` only). Same-zone overlap between two DISTINCT non-decoration elements is explicitly NOT exempt — the comment records a real regression (`objects:labels` question-text-on-dots) that a former blanket "apex-stack" exemption let through silently.

**Load-bearing code:**
```ts
export const ALLOWED_OVERLAP_PAIRS: readonly string[] = [
  "marks:objects",
  "objects:marks",
  "marks:badges",
  "badges:marks",
  "decoration:objects",
  "objects:decoration",
  "decoration:badges",
  "badges:decoration",
  "decoration:tally",
  "tally:decoration",
  "decoration:decoration",
];
```

**Why we do it:** an intentional overlap (e.g. a sketch-mark tracing over the teaching object) is a narrow, auditable exception, not a blanket "same zone is fine" rule that quietly swallows real defects.

### A5. Caption-band reserved rectangle + caption-intrusion gate

**Where:** `remotion-svg-primitives/scripts/lesson-measured.mjs:276-282`

**What it does:** The bottom caption ribbon's true footprint (`CAPTION_BAND`, one shared component) is forwarded from the extractor as `captionBand`. Any measured teaching element in zones `objects/labels/badges/tally` (never `marks`, which may run full-bleed) whose box overlaps that band beyond the ratio threshold is flagged as a caption-intrusion — WARN, not a hard exit, but printed with the offending element ids so a human sees exactly what's colliding with the accessibility ribbon.

**Load-bearing code:**
```js
const captionBand = extracted.captionBand ?? null;
const CAPTION_INTRUSION_ZONES = new Set(["objects", "labels", "badges", "tally"]);
```

**Why we do it:** the caption band belongs to verbatim narration alone; nothing load-bearing may creep into it, and this makes that a measured, evidenced check instead of an eyeball guess.

### A6. bbox overlay review tool — every reviewed still carries its boxes

**Where:** `remotion-svg-primitives/scripts/lesson-bbox-overlay.mjs:1-30`

**What it does:** Draws each registered element's MEASURED `getBBox()` (solid, colored by zone) plus its label (`id · zone · W×H`) onto the actual rendered frame; a measured id the manifest doesn't declare is drawn in red as `· UNDECLARED`. This exists because a measured collision is only trustworthy if a human can SEE that the box equals the element's true rendered footprint — the classic failure being a decoration ring nested inside a load-bearing `<g>` inflating that element's box.

**Why we do it:** CLAUDE.md's rule "NEVER review a bare screenshot" is enforced by giving reviewers a purpose-built tool, not just a written reminder — every review surface produced by `lesson:check` carries the boxes that justify its verdict.

### A7. Kids-eye finger-cover test — viewer-first discipline (manual, not code-run)

**Where:** `.agents/skills/kids-eye/SKILL.md:91-98`

**What it does:** Before approving any primitive or cue, the authoring subagent must simulate covering each element with a finger (does the picture still teach without it → delete if not) and covering everything EXCEPT the central teaching object (does the lesson survive → if not, the teaching object itself is too weak, fix the primitive not the chrome).

**Load-bearing code (prose, verbatim):**
```
- **Cover any one element.** Does the picture still teach? If yes, that element
  was either redundant or decoration. Delete it (or merge its role into
  another element).
- **Cover everything except the central teaching object.** Does the lesson
  still mostly survive? If no, the teaching object is too weak and you have
  been propping it up with chrome. Redesign the teaching object — do not add
  more chrome.
```

**Why we do it:** most decoration/duplication defects are invisible to any geometric check (two elements can be perfectly non-overlapping and still say the same thing twice) — this test targets *redundancy*, which bbox overlap cannot.

### A8. Text sizing — NO fitText/measureText anywhere (answered honestly)

**Where:** `remotion-svg-primitives/src/shape-primitives/literacy.tsx:1236,1244-1245,1253-1254`; confirmed absent via `grep -rn "fitText\|measureText" remotion-svg-primitives/src remotion-svg-primitives/scripts` → **zero matches**.

**What it does (actually):** Font sizes are fixed prop defaults or simple fixed ratios of another fixed default — never measured against the actual string. `LessonIntroCard`'s `titleSize` defaults to a literal `96`; `sectionSize`/`teaserSize` are just `titleSize * 0.34` / `titleSize * 0.44`; `cardWidth` defaults to a literal `1180`. Nothing checks whether a given title string, at that font size, actually fits inside that card width.

**Load-bearing code:**
```ts
  titleSize = 96,
  ...
  cardWidth = 1180,
  cardHeight = 360,
```
```ts
const sectionSize = Math.round(titleSize * 0.34);
const teaserSize = Math.round(titleSize * 0.44);
```

**Why we do it (or rather, don't):** the kids-eye SKILL's own "fit-check" (§1) is a *prose* discipline the authoring agent must compute by hand and "show the px arithmetic" for — it is not a runtime assertion. So a longer title/teaser string than any lesson has shipped so far could silently overflow `cardWidth` and nothing downstream (manifest, measured gate, or contact sheet) is specifically designed to catch it as a text-overflow defect (it would only show up as a generic bbox-vs-card collision if `cardWidth` were itself a measured element, which it currently is not tagged as). This is a genuine gap, not a design choice we're proud of — see C4.

## B. Voice-visual coordination

### B1. v4 cue-anchored audio — per-cue trimmed clips, no continuous WAV

**Where:** `remotion-svg-primitives/src/lessons/generated/kptestCountToTwoClips.ts:1-14`

**What it does:** `generate-voice.mjs` emits one `ClipCue` per cue — `clipSrc` (its own WAV), `narrationFrames` (exact, TTS-padding-trimmed length), `caption`, `phrase` — and the module header says explicitly **"DO NOT EDIT BY HAND — re-run `npm run lesson:voice`."** There is no master WAV that all cues slice into; each cue's audio is a physically separate file.

**Load-bearing code:**
```ts
// Generated by @studio/narration-kit generate-voice (v4 cue-anchored audio).
// Per-cue MEASURED audio clips — the AUDIO TRUTH the reconcile chains. Each
// clip is TRIMMED of TTS padding; narrationFrames is its exact length at 30fps.
// DO NOT EDIT BY HAND — re-run `npm run lesson:voice`.

export const kptestCountToTwoClips: ClipCue[] = [
  { id: "announce-topic", clipSrc: "audio/kptest-count-to-two/clips/00-announce-topic.wav", narrationFrames: 63, caption: "我们一起数到二吧。", phrase: "我们一起数到二吧" },
  ...
];
```

**Why we do it:** the pre-v4 architecture played one continuous WAV top-to-bottom while a SEPARATE composer-owned timeline decided cue boundaries — the two could and did drift (documented regression: 62.74s of dead-air padding on `kp1-fen-yu-he-intro`, `docs/pipeline-architecture.md` §6). Splitting audio into per-cue files makes that class of drift structurally impossible: a clip literally cannot play past its own cue.

### B2. Wave 3.5 reconcile — `cueFrames = max(narration+gap, motion) + tail`

**Where:** `/Users/tk/Desktop/shared-narration/src/reconcileTimeline.ts:244-253` (consumed via `@studio/narration-kit`, e.g. `remotion-svg-primitives/src/lessons/kptestCountToTwoLessonTimeline.ts:30-35`)

**What it does:** `reconcileClipTimeline` chains cues end-to-end from frame 0. For each clip: `motionFrames = round(visualBudgetSeconds*fps)`, `narrationFrames` comes straight from the measured `ClipCue`, `gapFrames` from a typed silent hold; the cue's content window is `max(narration+gap, motion)`, plus a fixed `tailFrames` (default 9 = 0.3s) so no cue slams into the next.

**Load-bearing code:**
```ts
const motionFrames = Math.round(budgetSeconds * fps);
const narrationFrames = Math.max(0, Math.round(clip.narrationFrames));
const gapFrames = clip.gap
  ? Math.max(0, Math.round(clip.gap.seconds * fps))
  : 0;

// The cue window must hold BOTH the narration + its typed silent gap AND the
// visual motion budget — whichever is longer — plus a small tail.
const contentFrames = Math.max(narrationFrames + gapFrames, motionFrames);
const cueFrames = contentFrames + tailFrames;
```

**Why we do it:** this is the ONE mechanical formula every downstream artifact (audio Sequences, scene motion offsets, caption windows) reads from — a single reconciled number instead of three independently-guessed timelines that can disagree.

### B3. Per-cue `<Sequence>` mount — audio can never cross a cue boundary

**Where:** `/Users/tk/Desktop/shared-narration/src/AudioLayer.tsx:96-105`

**What it does:** `AudioLayer` maps the reconciled `voiceClips` array (one entry per cue with non-zero narration) directly onto one Remotion `<Sequence from={clip.fromFrame} durationInFrames={clip.durationInFrames}>` per clip. Because each clip is a separate `<Sequence>` bounded to its own cue window, it is architecturally impossible for one cue's audio to bleed into the next cue's frames.

**Load-bearing code:**
```tsx
{useClips
  ? voiceClips!.map((clip, index) => (
      <Sequence
        key={`${clip.src}-${clip.fromFrame}-${index}`}
        from={clip.fromFrame}
        durationInFrames={clip.durationInFrames}
      >
        <Html5Audio src={mediaSrc(clip.src)} volume={voiceVolume} />
      </Sequence>
    ))
```

**Why we do it:** replaces one continuous-WAV `<Sequence>` (a single shared timeline that could desync from the visual cue boundaries) with N independently-bounded Sequences that are trivially provable to stay inside their cue.

### B4. `tokenOnsetFrame` / `stepFramesFromOnsets` — spoken-enumeration binds to measured ASR onsets

**Where:** `/Users/tk/Desktop/shared-narration/src/cueHelpers.ts:38-93`

**What it does:** `tokenOnsetFrame(cue, i)` returns the cue-local measured onset frame of the i-th spoken target token (or `null` if unavailable). `stepFramesFromOnsets(cue, count)` projects N step frames for an N-step spoken enumeration (e.g. count 1→N, per-ordinal pulse) from the cue's `tokenOnsets`, handling token-count ≠ step-count via even-spaced sampling, always monotonic non-decreasing, and returns `null` (never a guess) when onsets are unavailable so the caller falls back to a constant AND records a `pipelineFinding`.

**Load-bearing code:**
```ts
export const tokenOnsetFrame = (
  cue: TokenOnsetCue,
  i: number,
): number | null => {
  const onsets = cue.tokenOnsets;
  if (!onsets || i < 0 || i >= onsets.length) {
    return null;
  }
  const onset = onsets[i];
  return Number.isFinite(onset) ? Math.round(onset) : null;
};
```

**Why we do it:** the inter-word interval in TTS output is voice-dependent and NOT an even grid — a fixed-cadence `SWEEP_STEP_FRAMES`-style constant would put a per-number pulse audibly ahead of or behind the spoken word for any cue whose speech rate differs from the constant's assumption. Reading the ASR-measured onset is the only way to guarantee sync. (See C3 — this exists and is well-designed, but has essentially zero live callers.)

### B5. Deterministic per-cue audio gate — hard checks + advisory truncation signal

**Where:** `remotion-svg-primitives/scripts/lesson-audio-gate.mjs:89-93,500-506`

**What it does:** Runs immediately after voice generation (before render, before a human listens) with three HARD checks that set `pass:false` — held-vowel drone (Gemini renders an in-text ellipsis as a sustained drone), untrimmed dead-air (leading/trailing silence beyond a floor), empty/near-zero clip (TTS silently failed a cue) — plus one ADVISORY-only truncation signal (ASR-coverage + duration-ratio vs. this lesson's own cohort median) that flags a possibly-cut-off clip for human spot-check without ever blocking the freeze.

**Load-bearing code:**
```js
const MIN_DRONE_SECONDS = 1.5; // a held vowel beyond this is not natural speech
...
const MIN_CLIP_SECONDS = 0.25; // a cue with a phrase is always longer; near-zero = TTS silently failed to render it
...
const isDrone = a.droneSeconds >= MIN_DRONE_SECONDS;
const isDeadAir =
  a.leadSilence > EDGE_SILENCE_MAX || a.trailSilence > EDGE_SILENCE_MAX;
const isEmptyClip =
  phrase.length > 0 &&
  ((typeof clip.narrationFrames === "number" && clip.narrationFrames <= 1) ||
    a.durationSeconds < MIN_CLIP_SECONDS);
```

**Why we do it:** catching an "I'm…… Sam"-style drone or a silently-dropped cue by TOOL, in seconds, before a human ever has to listen through the whole master WAV — the real post-mortem (`kptest-fenyuhe-six`, 5/9 Mandarin cues silently cut mid-phrase and frozen) is exactly what motivated the advisory truncation signal.

### B6. Frozen-audio auto-skip — freeze is enforced by the render script, not just prose

**Where:** `remotion-svg-primitives/scripts/render-complete-lesson.mjs:213-218`

**What it does:** `lesson:render` checks whether the ASR timing module already exists on disk for this lesson; if so it auto-skips voice generation entirely (prints "Voice auto-skipped … Run `npm run lesson:voice` to regenerate voice" rather than silently regenerating).

**Load-bearing code:**
```js
const timingExists = args.alignOutTs && fs.existsSync(args.alignOutTs);
const shouldSkipVoice = args.skipVoice || timingExists;
if (timingExists && !args.skipVoice) {
  console.log(`\n== Voice auto-skipped (timing module exists: ${args.alignOutTs})`);
  console.log("   Run `npm run lesson:voice -- --config <path>` to regenerate voice.");
}
```

**Why we do it:** "audio is frozen after Wave 3a" (CLAUDE.md) needs to survive someone re-running the render command without reading the doctrine — making the default behavior (existing timing module present → skip) match the intended discipline means a composer/render re-run can't accidentally clobber accepted audio.

### B7. Bed + SFX as a second track — duck windows derived from the SAME per-cue clips

**Where:** `/Users/tk/Desktop/shared-narration/src/AudioLayer.tsx:77-82`

**What it does:** The background-music duck spans (when the bed should lower its volume so narration reads clearly) are NOT separately authored — they're derived mechanically from the same `voiceClips` array the narration Sequences use: `[fromFrame, fromFrame + durationInFrames]` per clip. `LessonBgmLayer`/`LessonSfxLayer` are thin re-exports of `@studio/sound-kit`'s `BgmLayer`/`SfxLayer`, wired at the composer as a track that *consumes* the reconciled timeline rather than participating in Wave 3.5's math.

**Load-bearing code:**
```ts
const duckSpans: VoiceoverSpan[] = useClips
  ? voiceClips!.map((c) => [c.fromFrame, c.fromFrame + c.durationInFrames])
  : voiceoverSpans;
```

**Why we do it:** ducking windows computed from a second, independently-authored spec could drift from where narration actually plays; deriving them from the exact same array the narration Sequences use makes the duck-vs-narration relationship correct by construction, and it means every silent hold (motion-hold or typed gap) automatically gets the bed lifted for free.

## C. Anti-patterns & gaps

### C1. Doctrine describes a system that no longer exists in code (fast-linear pre-filter)

CLAUDE.md's Discipline section states: *"BBOX MANIFEST IS A FAST PRE-FILTER; `--measured` IS GROUND TRUTH... the fast linear pass still writes `summary.collisionCount`; the opt-in measured pass renders motion-peak frames..."* — describing TWO passes. The actual code disagrees. `remotion-svg-primitives/scripts/lesson-check.mjs:70-77` says explicitly:

```js
// The MEASURED pass IS the bbox check — there is no separate fast linear pass.
// The manifest is metadata-only ({id,zone}); geometry comes from the render
// (getBBox), one source of truth. ... `--measured` is accepted for back-compat
// but is now a no-op (this always runs).
```

Similarly, CLAUDE.md's law says the manifest "registers ... with a `bboxAt(frame)` derived from the same constants in `layout.ts`" — but every currently-shipped `manifest.ts` (`kptestCountToTwo/manifest.ts:1-9`, `kp2CountingByTens/manifest.ts:1-8`) explicitly says **"No `bboxAt`"** in its own header comment; `manifestTypes.ts`'s `SceneElement` type has no bbox field at all. The architecture evolved (a good, deliberate change — see A2) but the doctrine file wasn't updated to match. A reader of CLAUDE.md alone would look for a fast linear collision pass and a `bboxAt` function that no longer exist.

### C2. The pipeline's own newest fixture ships in a broken, self-contradictory state

`kptest-count-to-two` — added in a single commit (`3bfba64`) 2026-07-01 — has THREE cue-id vocabularies that don't agree:
- `lesson-data/kptest-count-to-two/visual-design.md:85-87` and `script-cues.json` (Wave 2a/2b, canonical) use `announce-topic` / `cue-1-count` / `cue-2-cardinality`.
- The currently-committed `src/lessons/generated/kptestCountToTwoClips.ts:11-13` (Wave 3a AUDIO TRUTH) uses the SAME three ids — consistent with Wave 2.
- But `src/lessons/kptestCountToTwo/layout.ts:70-105` and `src/lessons/kptestCountToTwoLessonScene.tsx:265-267` (Wave 4 composer) reference FOUR different ids: `lesson-intro`, `first-apple-one`, `second-apple-two`, `cardinality`. And `src/lessons/kptestCountToTwoLessonTimeline.ts:23-28` (Wave 3.5, checked in alongside the composer) keys its `VISUAL_MOTION_SECONDS` map to those same four wrong ids.

I verified empirically (not by inspection alone) that this is currently fatal: running the reconcile's own lookup (`visualBudgets[clip.id]`) against the two id sets returns `undefined` for every single clip:
```
announce-topic -> budgetSeconds = undefined
cue-1-count -> budgetSeconds = undefined
cue-2-cardinality -> budgetSeconds = undefined
```
Since `reconcileClipTimeline` throws when `budgetSeconds === undefined` and no `defaultBudgetSeconds` is set (`reconcileTimeline.ts:235-242`), the checked-in `kptestCountToTwoLessonTimeline.ts` — imported by both the manifest and the registered composition (`_lessonRegistry.generated.tsx:6,13`) — would throw at import time in its current committed state. (The rendered MP4 in `out/kptest-count-to-two/` predates this commit by 4 days — `Jun 27 14:31` vs. the fixture's `Jul 1 15:52` — so it was rendered from an earlier, presumably-consistent revoicing before Wave 3a was re-run with a different cue split, and Wave 3.5/4 were never re-run to match.) This is the exact class of drift the pipeline's own discipline exists to prevent, currently present in the repo's own showcase fixture.

### C3. Cue-id lookups are stringly-typed with a silent zero-frame fallback

Compounding C2: `kptestCountToTwoLessonScene.tsx:70,261-262` types cue ids as `type CueKey = string;` and reads them as:
```ts
const cStart = (id: CueKey): number => c[id]?.startFrame ?? 0;
const cEnd = (id: CueKey): number => c[id]?.endFrame ?? 0;
```
A wrong or stale cue id is not a compile error (string is string) and not a runtime error (`?? 0` silently substitutes frame 0) — it's a rendering defect invisible until a human watches the video. This directly contradicts CLAUDE.md's own "Silent passes are forbidden" law; the fallback exists in the composer's own generated code, not in a third-party library.

### C4. `tokenOnsets`/`stepFramesFromOnsets` — a well-built API with ~zero live callers

B4's onset-binding kit is real and well-designed, but a repo-wide grep (`grep -rn "stepFramesFromOnsets\|tokenOnsetFrame" src/`) finds it referenced in exactly two non-comment places: the kit itself and `src/motion-primitives/OrderedRowSpotlight.tsx` (the one primitive built to consume a `stepFrames` prop). Of the two lessons that touch spoken enumeration:
- `kptestFirstSecondThirdLessonScene.tsx:612,632,656` — the ONE lesson using `<OrderedRowSpotlight>` — passes `stepDurationFrames={SWEEP_STEP_FRAMES}`, a literal fixed-cadence constant (`kptestFirstSecondThird/layout.ts:83`: `export const SWEEP_STEP_FRAMES = 48;    // ~1.6s per ordinal position`), NOT `stepFrames={stepFramesFromOnsets(cue, n)}`. This is exactly the violation CLAUDE.md names verbatim: *"A fixed cadence (`SWEEP_STEP_FRAMES`, an even grid from the cue head) is the SAME class as a frame literal — forbidden for spoken-synced stepping."* No `pipelineFinding` documents this fallback in that lesson's `_logs/compose.md` (grepped, zero hits for `onset`/`SWEEP`/`pipelineFinding`).
- `kptestCountToTwo/layout.ts:74-99` instead hand-computes onset-derived offsets ONCE at authoring time into literal constants (`TAG_1_POPIN_REL_START = 18`, comment: *"Spoken 一 onset is at tokenOnsetFrame(cue, 1) = 35"*) rather than calling `tokenOnsetFrame` at render time — so if voice is re-rolled (which it demonstrably was, per C2/C6) the pre-baked offsets silently go stale with no code path to re-derive or flag the drift.

The doctrine and the kit both correctly identify the risk; the shipped composer code consistently works around the kit instead of calling it.

### C5. `fitUnitsToZone` (A1) is adopted in exactly one lesson

Only `kptestFenyuheSix/layout.ts:13,195` (`const DOTS_FIT = fitUnitsToZone(ZONE_OBJECTS, 6);`) calls the auto-size-to-zone helper. `kptestCountToTwo/layout.ts:21-42` instead hand-derives a pixel constant (`APPLE_SIZE = 115`) via a documented trial-and-error narrative in the comments ("APPLE_SIZE=220 ... produced a 243-tall apple that intrudes both the caption band AND zone-objects ... APPLE_SIZE=115 ... gives an apple bbox ≈127×131 that fits cleanly ... Recorded as a pipeline finding"). The visual-discipline SKILL's own Visual Contract template claims *"sizes are never hand-picked"* (`.agents/skills/visual-discipline/SKILL.md`, `object-count` field description) — true of the mechanism's design intent, not yet true of the fleet.

### C6. Voice re-generation is empirically unstable across repeated invocations of the SAME lesson

`lesson-data/kptest-count-to-two/_logs/w3a-voice-asr.md` is labeled *"5th invocation — PASSED, FREEZE established"* and reports `narrationFrames` of `73/185/177`. The clips module actually committed to disk right now (`src/lessons/generated/kptestCountToTwoClips.ts:11-13`) reports `63/175/168` for the same three cues — a further, independent mismatch on top of C2's id mismatch, meaning the artifact the log claims to have frozen is not the artifact currently on disk. The log itself also documents child-process `EPERM` failures leaving `voice-clips.json`/`gemini-voice.json` stale relative to the regenerated `Clips.ts`. None of this is fatal per the audio gate (B5) in isolation, but it demonstrates the cross-artifact consistency guarantees this pipeline depends on (Wave 3.5 reading Wave 3a's exact output) are not yet reliably enforced across re-runs.

### C7. No automated text-fit anywhere (see A8) — layout auto-fit exists only for repeated countable units

`fitUnitsToZone` (A1) programmatically guarantees N countable units clear a legibility floor and fit their zone. Nothing analogous exists for TEXT: no `fitText`, no `measureText`, no SVG `getComputedTextLength()`-based shrink-to-fit anywhere in `remotion-svg-primitives/src` or `scripts` (confirmed by grep, zero matches). Title/section/teaser sizes are fixed ratios of a fixed default (A8); the kids-eye "fit-check" for text is a prose instruction the authoring agent must satisfy by hand-computed arithmetic, not a runtime assertion — so a title string longer than any lesson has shipped so far has no code-level protection against overflowing its card.

### C8. Only the LUFS gate hard-fails; overlap/bbox-binding/caption-intrusion are WARN-only by explicit design

`lesson-measured.mjs`'s own header states the tradeoff plainly: *"a measured overlap is a loud WARN that requires fix-or-justify... but does NOT trip exit 1: the overlap metric has false-positive sources... and the human is the eye for visual overlaps."* This is a reasoned, documented choice (not an oversight), but it means `npm run lesson:check` can exit 0 ("green") on a lesson with real, measured collisions — the gate that prevents bad layout from being *declared* done is a human looking at `bbox-overlay/*.png`, not a machine. Worth flagging precisely because C2 shows a case where the underlying module wouldn't even get that far (it throws before any gate runs) — for lessons that DO run, the safety net is advisory, not enforced.

## D. Verdict

The two headline mechanisms — v4 per-cue frozen audio clips (B1–B3) and measured-`getBBox` geometry truth (A2–A3) — are both genuinely strong: each replaces a class of bug that had already occurred in this repo's history (continuous-WAV drift; hand-mirrored bbox drift) with a construction that makes the old bug structurally impossible, and both are backed by real, evidenced post-mortems rather than speculative hardening. The auto-size-to-zone helper (A1) is a comparably strong idea — prevention by construction rather than post-hoc detection — but it, and the onset-binding API (B4), are both under-adopted: built once, documented well, and then worked around by hand in the very next lesson that needed them. The weakest link is NOT any single mechanism but the seams BETWEEN waves: cue-id vocabulary is passed as bare strings with no shared type or generated union, so nothing catches a composer inventing its own id namespace against an upstream artifact's real ids until a human watches a render — and the repo's own newest committed fixture (`kptest-count-to-two`) is live, verified proof that this exact failure mode currently ships. The most valuable next hardening step is mechanical, not aspirational: derive a branded/generated cue-id type from each lesson's reconciled timeline (killing `type CueKey = string`) and delete the `?? 0` fallback so a wrong id throws at build time instead of silently rendering at frame 0.

## Progress

- 2026-07-03 — self-scan authored per orchestrator request (compare our pipeline's own layout-prevention and voice-visual-coordination mechanisms against 13 external vendor repos); findings above (C1–C8) are candidates for `hermes-skill-system` OPTIMIZE passes — C1 (doctrine/code drift in CLAUDE.md's Discipline section) and C3 (silent `?? 0` fallback + `CueKey = string`) are the highest-leverage, lowest-risk fixes to route next.
