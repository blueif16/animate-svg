# Style: ink-wash

**Style ID.** `ink-wash`
**Aesthetic.** Sumi-e ink wash on warm rice paper. Monochrome ink, restricted palette, soft wet edges, paper grain.
**When to choose.** Calm, contemplative lessons. Chinese/Japanese language or cultural content. Single-narrator pacing. Avoid for high-energy comparison lessons where overshoot/snap reads against the medium.
**Modifier reach.** Applies a single SVG <filter> chain to all teaching content via `<StylePreset style="ink-wash">`. Default behavior of every primitive is preserved; only the visual surface changes.
**Companion files.** palette.md / animation.md / background.md / strokes.md / capabilities.md — all in this folder.
**Runtime.** `remotion-svg-primitives/src/styles/ink-wash/` — see CAPABILITIES.md#style-ink-wash.

**Studio preview note.** `feDisplacementMap` is Chromium-only in 2026; Remotion's MP4 render runs in Chromium so the rendered output is unaffected, but the Remotion Studio preview (`npm run dev`) requires Chromium to display the bleed correctly.
