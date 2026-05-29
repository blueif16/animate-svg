import { createContext, useContext } from "react";
import type { StyleContextValue, StyleFilterIds, StylePalette } from "./types";

const defaultContext: StyleContextValue = {
  activeStyle: "default",
  filterIds: {},
  palette: {},
};

export const StyleContext = createContext<StyleContextValue>(defaultContext);

/** Read the full style context. Primary consumer hook. */
export const useStyle = (): StyleContextValue => useContext(StyleContext);

/**
 * Return the primary filter URL string (e.g., `url(#style-ink-wash-primary)`)
 * or `undefined` when no style is active. Designed to be dropped directly into
 * `filter={...}` on the scene's root `<g>`.
 */
export const useStyleFilter = (): string | undefined => {
  const { filterIds } = useContext(StyleContext);
  return filterIds.primary ? `url(#${filterIds.primary})` : undefined;
};

/** Return the full filterIds record for callsites that need a secondary filter. */
export const useStyleFilters = (): StyleFilterIds =>
  useContext(StyleContext).filterIds;

/** Return the active style's palette overrides. Empty object under "default". */
export const useStylePalette = (): StylePalette =>
  useContext(StyleContext).palette;
