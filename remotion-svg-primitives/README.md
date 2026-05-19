# Remotion SVG Education Primitives

This project is a proof-of-concept for a reusable early-childhood education video system built with Remotion, React, and SVG.

The core idea is:

```txt
lesson intent -> shape primitives -> motion primitives -> Remotion composition -> stills / MP4
```

All animation should be deterministic and frame-addressed:

```txt
visual = f(frame, props, lesson data, design tokens)
```

Do not use CSS transitions, CSS animations, Tailwind animation classes, `requestAnimationFrame`, or browser-time timelines for video motion.

## What This System Supports

The system has two reusable sides.

### Motion Primitives

Motion primitives are the verbs. They describe how things move.

Location:

```txt
src/motion-primitives/
```

Current exports:

- `DrawPath`: reveals SVG strokes with deterministic path progress.
- `FollowPath`: moves an object along a sampled quadratic/cubic path.
- `PopIn`: springy entrance for cards, objects, and rewards.
- `PulseCircle`: attention ring for taps, active objects, or stroke starts.
- `SparkleBurst`: reward feedback.

Use these when a lesson needs pop, trace, path-following, attention, or celebration behavior.

### Shape Primitives

Shape primitives are the nouns. They are reusable SVG objects that appear across lessons.

Location:

```txt
src/shape-primitives/
```

Current exports:

- `CountableObject`: fruit, fish, star, block, animal.
- `UnitBlock`: cube, chip, dot, rod.
- `NumberCard`
- `AnswerTile`
- `HanziCard`
- `RadicalTile`
- `StrokeGuideCell`
- `AnimatedStrokePath`
- `PinyinSyllableCard`
- `ToneMarkGlyph`
- `MouthShapeIcon`
- `ComparisonSymbol`
- `EquationStrip`
- `NumberLineTrack`
- `PairConnector`
- `SortingBin`
- `PartWholeBrace`
- `TenFrameRod`
- `PointerHandArrow`
- `RewardProgressToken`

Most shape primitives support props such as `variant`, `color`, `size`, `state`, `selected`, `correct`, `disabled`, `label`, `count`, `value`, `tone`, `progress`, and placement props like `x` / `y`.

## Design Tokens

Shared visual language lives in:

```txt
src/theme.ts
```

Core palette:

```txt
cream       #FFF7E6
paleCream   #FFF1C7
sunshine    #FFD85A
coral       #FF8A65
sky         #5EC8F8
mint        #66DDAA
lavender    #BFA7FF
reward      #FFB84D
textNavy    #24324B
softGrayBlue #6B7280
```

The intended product style is warm, bright, safe, rounded, and suitable for Chinese 1-6 year-old education. Avoid dark tech palettes, full-screen neon, and overly decorative gradients.

## Current Demos

### Original Motion Showcase

Registered composition:

```txt
SvgPrimitiveShowcase
```

Source:

```txt
src/scenes/
```

Scenes:

- `CountingDemo`
- `PathFollowDemo`
- `StrokeTraceDemo`

Rendered outputs:

```txt
out/svg-primitives/svg-primitive-showcase.mp4
out/svg-primitives/showcase-frame-070.png
out/svg-primitives/showcase-frame-210.png
out/svg-primitives/showcase-frame-350.png
```

### Education Shape Showcase

Registered composition:

```txt
EducationShapeShowcase
```

Source:

```txt
src/shape-demos/index.tsx
```

Scenes:

- `ShapePrimitiveGallery`: reference board for math, Chinese, and interaction primitives.
- `FishCountingLesson`: `数一数小鱼`.
- `OneToOneCompareLesson`: `一一配对比大小`.
- `PinyinToneLesson`: `拼音四声小卡`.
- `HanziMatchLesson`: `汉字找朋友`.

Rendered outputs:

```txt
out/shape-demos/education-shape-showcase.mp4
out/shape-demos/frame-060.png
out/shape-demos/frame-180.png
out/shape-demos/frame-300.png
out/shape-demos/frame-420.png
out/shape-demos/frame-540.png
```

### Hybrid Sketch Motion Demo

Registered composition:

```txt
HybridSketchMotionDemo
```

Source:

```txt
src/scenes/HybridSketchMotionDemo.tsx
```

Purpose:

- Tests an Excalidraw-like rough sketch layer: hand-drawn paper, hachure texture, handwritten note reveal, sketch pen.
- Combines it with the existing SVG motion system: `DrawPath`, `FollowPath`, `PopIn`, `PulseCircle`, `SparkleBurst`, `NumberCard`, `PointerHandArrow`.
- Use this as the first testing ground for mixing agent-authored sketch drawings with deterministic Remotion animation.

Rendered outputs:

```txt
out/hybrid-sketch-motion-demo/demo.mp4
out/hybrid-sketch-motion-demo/frame-90.png
```

## Composition Rules

Use this pattern for new lesson videos:

1. Pick the lesson goal.
2. Choose shape primitives as the visual nouns.
3. Choose motion primitives as the visual verbs.
4. Keep timing in `useCurrentFrame()`, `interpolate()`, `spring()`, and `Sequence`.
5. Render stills at important frames before rendering MP4.

Example composition shape:

```tsx
<Sequence durationInFrames={sceneDuration}>
  <FishCountingLesson />
</Sequence>
<Sequence from={sceneDuration} durationInFrames={sceneDuration}>
  <OneToOneCompareLesson />
</Sequence>
```

For a new lesson scene, prefer composing existing primitives before creating a new primitive.

Create a new primitive only when:

- It appears in multiple lessons.
- It carries meaningful state, such as `selected`, `correct`, `disabled`, `tone`, `filled`, or `progress`.
- The same drawing would otherwise be copied across scenes.

## Commands

Install:

```bash
npm i
```

Start Remotion Studio:

```bash
npm run dev
```

If port `3000` is taken:

```bash
npm run dev -- --port=3011
```

Lint and typecheck:

```bash
npm run lint
```

Bundle:

```bash
npm run build
```

Render key stills:

```bash
npx remotion still src/index.ts EducationShapeShowcase out/shape-demos/frame-060.png --frame=60
npx remotion still src/index.ts EducationShapeShowcase out/shape-demos/frame-180.png --frame=180
npx remotion still src/index.ts EducationShapeShowcase out/shape-demos/frame-300.png --frame=300
npx remotion still src/index.ts EducationShapeShowcase out/shape-demos/frame-420.png --frame=420
npx remotion still src/index.ts EducationShapeShowcase out/shape-demos/frame-540.png --frame=540
```

Render the education shape showcase:

```bash
npx remotion render src/index.ts EducationShapeShowcase out/shape-demos/education-shape-showcase.mp4
```

Render the original motion showcase:

```bash
npx remotion render src/index.ts SvgPrimitiveShowcase out/svg-primitives/svg-primitive-showcase.mp4
```

Render the hybrid sketch motion demo:

```bash
npx remotion still src/index.ts HybridSketchMotionDemo out/hybrid-sketch-motion-demo/frame-90.png --frame=90
npx remotion render src/index.ts HybridSketchMotionDemo out/hybrid-sketch-motion-demo/demo.mp4
```

## Registered Compositions

The registered compositions are in:

```txt
src/Root.tsx
```

Current IDs:

```txt
SvgPrimitiveShowcase
CountingDemo
PathFollowDemo
StrokeTraceDemo
HybridSketchMotionDemo
EducationShapeShowcase
ShapePrimitiveGallery
FishCountingLesson
OneToOneCompareLesson
PinyinToneLesson
HanziMatchLesson
```

Use these IDs in Remotion Studio and CLI render commands.

## Agent Skills And Handoff Notes

This project was built with Remotion guidance plus Excalidraw/Excalimate agent skills for hand-drawn diagram authoring.

### Installed Skills

Available to Codex:

```txt
/Users/tk/.codex/skills/remotion/SKILL.md
/Users/tk/.codex/skills/frontend-design/SKILL.md
```

Shared agent skills installed under `/Users/tk/.agents/skills/`:

```txt
/Users/tk/.agents/skills/excalidraw-diagram-generator/SKILL.md
/Users/tk/.agents/skills/excalimate-core/SKILL.md
/Users/tk/.agents/skills/animation-patterns/SKILL.md
/Users/tk/.agents/skills/export-optimization/SKILL.md
/Users/tk/.agents/skills/explainer-animations/SKILL.md
/Users/tk/.agents/skills/diagram-theming/SKILL.md
```

Claude Code has symlinks for the Excalidraw/Excalimate skills plus the Remotion skill:

```txt
/Users/tk/.claude/skills/remotion -> /Users/tk/.codex/skills/remotion
/Users/tk/.claude/skills/excalidraw-diagram-generator -> /Users/tk/.agents/skills/excalidraw-diagram-generator
/Users/tk/.claude/skills/excalimate-core -> /Users/tk/.agents/skills/excalimate-core
```

Excalimate MCP is configured for animated Excalidraw-style scenes:

```txt
npx @excalimate/mcp-server --stdio
```

Restart Codex or Claude Code after changing skills/MCP config.

### If Switching To Claude Code

Keep this instruction set available:

```txt
For Remotion SVG education animation:
- Use Remotion best practices.
- Animate with useCurrentFrame(), interpolate(), spring(), and Sequence.
- Never use CSS transitions or browser-time animation for rendered video.
- Prefer src/motion-primitives before adding new motion logic.
- Prefer src/shape-primitives before drawing one-off SVGs inside scenes.
- Preserve the kid education palette from src/theme.ts.
- Use Excalidraw/Excalimate skills for rough sketch boxes, hand-drawn labels, and diagram planning.
- Keep Remotion as the final render timeline.
- Render stills at important frames before calling work complete.
```

Also make sure the next agent reads these files first:

```txt
README.md
src/theme.ts
src/Root.tsx
src/Composition.tsx
src/motion-primitives/index.ts
src/shape-primitives/index.ts
src/shape-demos/index.tsx
```

### Documentation References Already Used

Context7 was used for current Remotion API guidance with library ID:

```txt
/remotion-dev/remotion
```

The implemented rules match Remotion guidance:

- Drive animation from `useCurrentFrame()`.
- Use `interpolate()` / `spring()` for frame-derived timing.
- Use `Sequence` for timeline composition.
- Avoid CSS transitions and browser-time animation for rendered video.

## Adding The Next Lesson

Recommended workflow:

1. Add or reuse shapes in `src/shape-primitives/`.
2. Add the lesson scene in `src/shape-demos/` or `src/scenes/`.
3. Export/register the composition in `src/Composition.tsx` and `src/Root.tsx`.
4. Run:

```bash
npm run lint
npm run build
```

5. Render stills at key frames.
6. Fix visual layout before rendering the final MP4.

Do not call a scene done until there is at least one rendered still showing the important state.
