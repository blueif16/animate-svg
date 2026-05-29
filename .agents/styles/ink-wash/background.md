# Ink-wash background

**Canvas.** `INK_WASH_PALETTE.background` (#F4ECDC) — warm rice-paper cream. Replaces `colors.cream` everywhere via the `useStylePalette()` hook in `<SceneFrame>`.

**Grain.** Paper grain is a `<rect>` covering the full canvas with `filter="url(#style-ink-wash-paper)"`. The composer can opt to add it or not; default is OFF (one filter per scene is sufficient; doubling the filter cost is unnecessary on a calm style).

**Border / mat.** None. Ink-wash sits on full-bleed paper.

**Decorative corner shapes.** SceneFrame's current corner circles (sunshine/mint/sky/coral) should be hidden under ink-wash. Achieve by gating them on `useStyle().activeStyle === "default"` in SceneFrame.tsx.
