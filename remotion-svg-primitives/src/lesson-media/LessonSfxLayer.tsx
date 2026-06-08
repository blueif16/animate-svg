// Thin re-export shim. The SFX layer now lives in `@studio/sound-kit` as
// `SfxLayer`; call sites import it as the named `LessonSfxLayer` plus the
// `SfxEvent` type, so re-export both under the names the call sites expect.
export { SfxLayer as LessonSfxLayer } from "@studio/sound-kit";
export type { SfxEvent } from "@studio/sound-kit";
