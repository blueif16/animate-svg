// The primitive-family map: shape-barrel source-module suffix -> primitive
// kind (the registry's discriminant), plus the canonical kind sort order.
//
// ONE shared copy, imported by BOTH build-registry.mjs (the generator/gate)
// and drift-report.mjs (the report-only mirror) — same rule as code-unions.mjs:
// any fact both scripts must agree on lives in one module. Proven necessary
// 2026-06-12: each script held a private copy, "./asset" was added only to the
// generator's, and the stale mirror false-flagged IconAsset as dangling +
// stranded while the real gate was green.
//
// Registering a NEW family = add it here AND to the `kind` union in
// src/capabilities/schema.ts. Nothing else to touch.

export const MODULE_KIND = {
  "./counting": "counting",
  "./literacy": "literacy",
  "./interaction": "interaction",
  "./sketch": "sketch",
  "./asset": "asset",
};

export const KIND_ORDER = ["counting", "literacy", "interaction", "sketch", "asset"];

// Motion-barrel exports that are COMPOSITE-tier — a self-contained teaching BEAT
// orchestrating atoms + assets + modifiers (count-and-mark, split-and-merge,
// match-pairs…) — rather than a MODIFIER-tier helper (entrance/idle/travel).
// Composites and modifiers share src/motion-primitives/, so there is NO code
// signal to split them; this curated set is the ONE shared tier authority (same
// shared-fact rule as MODULE_KIND), read by BOTH build-registry.mjs (routes these
// into specialComponents[]) and drift-report.mjs (unions both sections so the
// mirror never false-flags a moved composite). Keyed by the PascalCase export.
// Ship a new composite in the motion barrel? Add its component name here.
// See research/registry-exposure-and-taxonomy-2026-06-14.md §5.
export const MOTION_COMPOSITES = new Set([
  "AbstractionLadder",
  "AssetMorph",
  "ConservationMorphBundle",
  "DialogueExchange",
  "GlyphStrokeWriter",
  "MatchPairsBoard",
  "OrderedRowSpotlight",
  "PartWholeComposer",
  "PictographEvolution",
  "VocabFlashcard",
]);
