// Thin re-export shim. The music-bed layer now lives in `@studio/sound-kit` as
// `BgmLayer`; call sites import it as the named `LessonBgmLayer`, so re-export
// under that name. `BgmLayer` defaults to `DEFAULT_MIX_CONFIG` (= the original
// kids numbers), so no config needs passing and behavior is unchanged.
export { BgmLayer as LessonBgmLayer } from "@studio/sound-kit";
