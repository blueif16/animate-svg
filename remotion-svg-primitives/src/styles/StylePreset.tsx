import type { ReactNode } from "react";
import { StyleContext } from "./StyleContext";
import {
  InkWashBackground,
  InkWashDefs,
  INK_WASH_FILTER_IDS,
  INK_WASH_PALETTE,
} from "./ink-wash";
import type { StyleContextValue, StyleId } from "./types";

type StylePresetProps = {
  /** Style to apply. "default" or omitted = passthrough, zero behavior change. */
  style?: StyleId;
  /**
   * Optional per-instance seed override for procedural style elements (paper
   * grain, ink jitter). Same seed → byte-identical render. Defaults to the
   * style's bundled `defaultSeed`.
   */
  seed?: number;
  children: ReactNode;
};

/**
 * Root style overlay wrapper. Place OUTSIDE <SceneFrame> in the lesson scene.
 * Injects shared <defs> and publishes filter IDs + palette via StyleContext.
 * Default style is a passthrough — no DOM emitted, no context override.
 *
 * Pattern: sibling-Defs + filter URL. The "convert any child to target style"
 * effect is achieved by the lesson code reading useStyleFilter() and applying
 * it to the teaching <g>. See research/svg-animation-craft-round2-2026-05-27.md.
 */
export const StylePreset = ({
  style = "default",
  seed,
  children,
}: StylePresetProps) => {
  if (style === "default") {
    return <>{children}</>;
  }

  if (style === "ink-wash") {
    const value: StyleContextValue = {
      activeStyle: "ink-wash",
      filterIds: INK_WASH_FILTER_IDS,
      palette: INK_WASH_PALETTE,
    };
    return (
      <StyleContext.Provider value={value}>
        <InkWashDefs seed={seed} />
        <InkWashBackground />
        {children}
      </StyleContext.Provider>
    );
  }

  // Exhaustiveness fence — surface unknown style at runtime.
  const exhaustive: never = style;
  throw new Error(`Unknown style: ${exhaustive}`);
};
