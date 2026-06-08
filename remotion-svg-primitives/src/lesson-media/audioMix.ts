// Thin re-export shim. The mix engine now lives in `@studio/sound-kit`; this
// file preserves the local import path (`./audioMix`) for existing call sites.
// `DEFAULT_MIX_CONFIG` in the kit equals the original kids numbers, so behavior
// is unchanged.
export {
  bedVolume,
  spansToWindows,
  spokenSpansFromSilences,
  DEFAULT_MIX_CONFIG,
  BED_UNDUCKED_LINEAR,
  DUCK_FACTOR,
  SFX_DEFAULT_LINEAR,
  DUCK_ATTACK_FRAMES,
  DUCK_RELEASE_FRAMES,
  EDGE_FADE_FRAMES,
} from "@studio/sound-kit";
export type { MixConfig, NarrationWindow, SilenceFrames } from "@studio/sound-kit";
