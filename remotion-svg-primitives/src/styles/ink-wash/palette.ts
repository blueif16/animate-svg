import type { StylePalette } from "../types";

/**
 * Ink-wash palette: monochrome ink on warm paper. Tokens map to the same
 * semantic keys as `theme.colors`, but with style-tuned values. Sourced
 * from kako-jun/blueprinter sumi theme. See
 * research/svg-animation-craft-round2-2026-05-27.md §"Numbers worth verifying".
 */
export const INK_WASH_PALETTE: StylePalette = {
  background: "#F4ECDC", // warm rice-paper cream
  paper: "#EFE6D2",      // slightly darker grain
  ink: "#1F2230",        // near-black ink
  accent: "#7A2E2A",     // muted vermilion seal accent
  textNavy: "#1F2230",   // override of theme.colors.textNavy
};

/** Default deterministic seed for ink jitter / paper grain across this style. */
export const INK_WASH_DEFAULT_SEED = 17;
