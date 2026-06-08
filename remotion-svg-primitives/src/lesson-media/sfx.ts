// Thin re-export shim. The SFX vocabulary + registry now live in
// `@studio/sound-kit`; this file preserves the local import path (`./sfx`) for
// existing call sites.
export {
  SFX_REGISTRY,
  sfxSrc,
  sfxDefaultVolume,
  semitonesToPlaybackRate,
} from "@studio/sound-kit";
export type { SfxSound } from "@studio/sound-kit";
