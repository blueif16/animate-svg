# W4a composer — kptest-compare-more-fewer

## INPUTS READ
- SKILL: `.agents/skills/remotion-lesson-composer/SKILL.md`
- pedagogy.md, storyboard.md, visual-design.md, audio-captions.md, audio-cues.json, primitive-gap-scan.md
- `.agents/TEACHING-ACTIONS.md`, `.agents/CAPABILITIES.md`, `src/capabilities/catalog-digest.md`
- reconciled timeline `src/lessons/kptestCompareMoreFewerLessonTimeline.ts` + generated clips
- primitive sources (exact prop APIs only): interaction.tsx, counting.tsx, PopIn, PulseCircle, ReadAlongHighlight, Drag, Breathe, LessonIntroCard (literacy.tsx)
- kit layer signatures: LessonAudioLayer/CaptionLayer/BgmLayer/SfxLayer (re-exports of @studio/narration-kit + @studio/sound-kit), measureHook, manifestTypes, lessonRegistryTypes, SceneFrame, theme

## OUTPUTS WRITTEN
- `src/lessons/CompleteKptestCompareMoreFewerLesson.tsx` (wrapper + `lessonComposition` descriptor)
- `src/lessons/kptestCompareMoreFewerLessonScene.tsx` (scene; PascalCase `KptestCompareMoreFewerLessonScene`)
- `src/lessons/kptestCompareMoreFewer/layout.ts` (pure-TS offsets + placement; NO barrel import)
- `src/lessons/kptestCompareMoreFewer/manifest.ts` (8 load-bearing elements + 10 keyFrames)
- registry auto-discovered into `_lessonRegistry.generated.tsx` (no Root.tsx edit)

## COMMANDS RUN (+exit / key output)
- `npm run registry:check-lesson -- …/primitive-gap-scan.md` → exit0, all 11 named components registered (preflight PASS)
- `npm run lessons:registry` → exit0, discovered CompleteKptestCompareMoreFewerLesson
- `npx tsc --noEmit` (lesson files) → clean
- `npx eslint` (all 4 files) → exit0 clean
- `node scripts/lesson-manifest.mjs …` (linear) → **10 keyframes, 0 collisions, 0 warnings**
- `npm run lesson:check -- … --measured` (Node 22) → **overlap-measured PASS (0 measured collisions, 66 peak frames); legibility PASS; motion PASS; lufs WARN (-17.1, loudnorm fixes at W5); caption-redundancy WARN (by-design: caption=acquisition target); contrast WARN (quiet ghosts/dimmed recap)**
- rendered 10 QA stills @ cue keyframes (intro/two-groups/match/more/echo/fewer/not-by-size×2/recap×2), graded, then deleted (kept contact-sheet.png)

## KEY DECISIONS
- Composition is **1280×720** (theme.video), NOT the 1920×1080 visual-design assumed — rebuilt all zones/sizes proportionally in 1280×720 (dot Ø92 = 12.8% short side). The scene draws into a `viewBox=0 0 1280 720` SVG on a cream `AbsoluteFill` (no SceneFrame — its hardcoded eyebrow/title chrome would violate "no title chrome over the picture").
- ONE invariant picture: dots + 3 pair-lines + 2 ghosts + `>` mounted continuously from two-groups onward, parameterized per cue. match→more→echo→fewer→replay = NO re-layout (keystone honored — verified in stills f366/f500/f680/f1080 all show the identical pairing).
- Dot = `CountableObject variant="star"`, color = group ID (reward top / coral bottom), identical size — surplus shown ONLY via partnerlessness (`UnmatchedSlot` ghost), never size/hue.
- `>` gated to first appear at more-direction (NOT in match) so the picture reveals before any direction word (reveal.requires).
- echo cues: phrase held legible (static row) through the 120-frame learner-response gap + pointer-hand + "该你说啦" label + speech glyph (not bare glow).
- recap: `RecapSpotlight` ONE live ring walks surplus→short row; phrase row swaps 五比三多→三比五少 with the highlight.
- Audio: per-cue `voiceClips` (v4), captions per-cue narration window, BGM `math-calm-68-cmaj` with duck windows from clip spans, SFX pop@two-groups + chime@match-surplus + chime@not-by-size-repair — all frames = `cues[id].startFrame + layout offset`.
- ZERO frame literals (every frame from cue boundaries) and ZERO raw motion literals (EASE.*/named primitives) — confirmed.

## ISSUES (fixed during self-critique)
1. **layout.ts imported the shape-primitives barrel** (`getPairedColumnPlacement`) → dragged React/Remotion into the pure-TS manifest-extract harness → tripped Remotion's multi-version guard (shared kits bundle 4.0.464/4.0.471). FIX: inlined the paired-column formula in layout.ts; pure-TS now. (Manifest contract: layout.ts must be barrel-free.)
2. **Render blocked by corrupted `node_modules/.cache` webpack wasm-hash** (failed for ALL lessons, both Node 22 & 24). FIX: non-destructive `rm -rf node_modules/.cache` — bundling then succeeded. NOT a Node-version issue.
3. **not-by-size spread dot landed on the surplus ghost** (linear gate flagged it; geometry showed the fanned dot overlapping the ghost circle). FIX: capped SPREAD_GAP=165 + fan about the matched-3 center so the widest dot stays clear of the surplus columns; ghosts stay on the bottom-row line (not dropped into the caption band). Re-render confirmed clean (f1788).

## PIPELINE FINDINGS (workflow backlog)
- **visual-design used 1920×1080; the rig is 1280×720 (theme.video).** Every zone/size table in visual-design is in the wrong space — the composer must rescale silently. The visual-design / kids-eye skill should read the real composition dims from `theme.video` (or visual-design should state "express zones as % of short-side", not px) so the contract numbers transfer to the scene 1:1.
- **layout.ts purity is implicit, not enforced.** Importing the component barrel into the pure-TS layout silently breaks the manifest-extract harness with an opaque Remotion-multi-version error. The composer skill should state: "layout.ts/manifest.ts import NOTHING from `../../shape-primitives` (or any barrel that pulls remotion) — re-derive placement geometry inline." A lint rule (no barrel import under `<lesson>/layout.ts`) would make it self-enforcing.
- **Shared @studio kits bundle mismatched remotion** (narration 4.0.464, sound 4.0.471 vs repo 4.0.462) — a latent multi-version fault any pure-TS import chain can trip. Kits should declare remotion a peerDependency.
- **`node_modules/.cache` corruption silently breaks ALL renders** with an opaque webpack wasm-hash stack — the render/check scripts should `rm -rf node_modules/.cache` on this specific failure (or the env-setup should), so a node doesn't read it as "my scene is broken."
- **caption-redundancy gate over-fires on read-along acquisition lessons.** When the caption IS the acquisition target (五比三多/三比五少), caption≈narration is correct, not redundant. The gate should exempt cues flagged `emphasis`/target-bearing, else every L2 acquisition lesson WARNs falsely.
