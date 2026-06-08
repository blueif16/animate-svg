// Thin re-export shim. The authored sound-manifest schema now lives in
// `@studio/sound-kit`; this file preserves the local import path
// (`./audioCuesTypes`) for existing call sites.
export type { AudioCues, AudioCueSfx, SfxEventType } from "@studio/sound-kit";
