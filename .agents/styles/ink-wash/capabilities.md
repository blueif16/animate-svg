# Ink-wash capabilities map

**Inherits from.** All default capabilities — see `.agents/CAPABILITIES.md`.

**Tuning.**
| Capability | Ink-wash tuning |
|---|---|
| motion-vocabulary | Prefer `EASE.outCubic`, `SPRING.smooth`. Avoid `EASE.overshoot` for entrances. |
| popin-motion-variants | `motion="bouncy"` capped at 1/video. |
| sketch-boil | Boost `magnitude` ~25% to compensate for filter softening. |
| sketch-settle | Recommended on climax marks; reads as the brush lifting. |

**Style-only capabilities.**
- `style-ink-wash` (this file) — see CAPABILITIES.md#style-ink-wash.

**Refused.**
- Bright accent palettes (coral, sky, sunshine) outside the published palette tokens.
- Sparkle FX at default `colors.reward` — under ink-wash, sparkle uses `INK_WASH_PALETTE.accent` or is omitted entirely.
