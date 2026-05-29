// Public type surface for the style overlay system. All consumers reach for
// these types via the `src/styles` barrel.

/**
 * Identifier of a registered style overlay. "default" means no overlay (the
 * canonical lesson appearance). Adding a new style means adding a new
 * literal to this union AND a corresponding entry in `STYLE_REGISTRY`.
 */
export type StyleId = "default" | "ink-wash";

/**
 * Filter IDs published by a style for opt-in consumption via `filter="url(#id)"`.
 * Each style declares which IDs it publishes; consumers reach via `useStyleFilter()`
 * (single primary filter) or `useStyleFilters()` (full record, advanced).
 */
export type StyleFilterIds = {
  /** Primary modifier filter — wraps the entire teaching tree. */
  primary?: string;
  /** Optional secondary filters for callsite use (e.g., paper grain only). */
  [key: string]: string | undefined;
};

/**
 * Palette token overrides published by a style. Maps theme color keys to
 * style-tuned values. Consumers read via `useStylePalette()`.
 */
export type StylePalette = Partial<{
  background: string;
  ink: string;
  accent: string;
  paper: string;
  textNavy: string;
}>;

export type StyleContextValue = {
  activeStyle: StyleId;
  filterIds: StyleFilterIds;
  palette: StylePalette;
};
