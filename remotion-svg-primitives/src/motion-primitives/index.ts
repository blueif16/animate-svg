export { AbstractionLadder } from "./AbstractionLadder";
export type {
  AbstractionLadderOrientation,
  AbstractionLadderProps,
  AbstractionStage,
} from "./AbstractionLadder";
export { AssetMorph } from "./AssetMorph";
export type { AssetMorphDirection, AssetMorphProps } from "./AssetMorph";
export { ConservationMorphBundle } from "./ConservationMorphBundle";
export type { ConservationMorphBundleProps } from "./ConservationMorphBundle";
export { GlyphStrokeWriter } from "./GlyphStrokeWriter";
export type { GlyphStrokeWriterProps } from "./GlyphStrokeWriter";
// The shared stroke-order data is the reusable artifact that pairs with the
// writer. `glyphStrokesFor(char)` is the public accessor callers use (the
// writer bakes no glyph — the caller looks up the ordered strokes by char).
// The GLYPH_STROKES / GLYPH_BOX constants + types are importable directly from
// "./glyphStrokes" for advanced callers; they are data, NOT cataloged
// components, so they intentionally don't surface through this barrel (the
// registry parser treats every Capitalized barrel export as a component).
export { OrderedRowSpotlight } from "./OrderedRowSpotlight";
export type {
  OrderedRowDirection,
  OrderedRowSpotlightProps,
} from "./OrderedRowSpotlight";
export { glyphStrokesFor } from "./glyphStrokes";
export type {
  GlyphPoint,
  GlyphStroke,
  GlyphStrokeData,
} from "./glyphStrokes";
export { DrawPath } from "./DrawPath";
export { FollowPath } from "./FollowPath";
export { PopIn } from "./PopIn";
export { PulseCircle } from "./PulseCircle";
export { SparkleBurst } from "./SparkleBurst";
export { Smear } from "./Smear";
export { Drag } from "./Drag";
export * from "./curves";
export type {
  CubicPath,
  FollowPathSpec,
  Point,
  QuadraticPath,
} from "./pathMath";
