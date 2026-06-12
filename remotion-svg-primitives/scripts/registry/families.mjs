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
