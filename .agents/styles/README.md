# Style overlays

Opt-in aesthetic overlays applied on top of the default lesson pipeline. The default has no aesthetic identity; styles bring one.

Each style is a folder with six files (this is the contract — extending requires updating the docs and the registry):

- `STYLE.md` — one-page overview: aesthetic, when to choose, runtime location
- `palette.md` — color tokens and discipline rules
- `animation.md` — motion vocabulary tweaks vs default
- `background.md` — canvas, grain, decorative refusals
- `strokes.md` — stroke width / color / caps / patterns
- `capabilities.md` — inheritance + tuning + refusals

Runtime lives in `remotion-svg-primitives/src/styles/<style-id>/`. The composer wraps the scene root in `<StylePreset style="<id>">`.

**To add a new style:** copy this folder structure, add a `StyleId` literal in `src/styles/types.ts`, add a `<Defs>` component, extend `<StylePreset>`'s switch, register in CAPABILITIES.md.

**Style selection.** In `brief.md`, set `**Style.** <style-id>`. Omitting the field or setting `default` means no overlay.

**Current styles.**
- `ink-wash` — Sumi-e ink on warm rice paper.
