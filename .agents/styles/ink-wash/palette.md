# Ink-wash palette

| Token | Hex | Use |
|---|---|---|
| background | #F4ECDC | scene cream (overrides `colors.cream`) |
| paper | #EFE6D2 | secondary surface, card backgrounds |
| ink | #1F2230 | all stroke/ink (overrides `colors.textNavy`) |
| accent | #7A2E2A | vermilion seal — accent only, ≤ 5% of frame area |
| textNavy | #1F2230 | text override (same as ink) |

**Discipline.** No bright sunshine/sky/coral. Ink-wash is mono + accent. If a primitive renders in `colors.coral`, the modifier remaps it via the filter chain's `feColorMatrix` (de-saturation 0.0 for pure sumi). For brighter pop, the secondary palette `accent` is the ONLY warm color.

**Runtime constants.** `remotion-svg-primitives/src/styles/ink-wash/palette.ts` exports `INK_WASH_PALETTE`. Sourced from kako-jun/blueprinter sumi theme.
