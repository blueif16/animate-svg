// Zod model of src/capabilities/primitive-registry.json — the single shared
// catalog of this repo's reusable craft surface (SVG teaching primitives,
// motion components, FX, motion vocabulary, styles, composite recipes).
//
// CUT 1 (report-only): this schema FAITHFULLY MODELS the catalog shape. It is
// NOT yet the authority — nothing flips here. The principle (per the
// capability-registry-harness skill): ONE Zod definition is the source of truth
// for the *shape*; the CODE (barrel exports + variant unions + EASE/SPRING
// keys) is the source of truth for *what exists*; the JSON catalog, the
// JSON-Schema, the planner digest, and the TS types are all GENERATED artifacts.
//
// Every id-bearing field is z.string() (NOT an enum) and every object is
// .passthrough() BY DESIGN: the schema models *structure*; the .mjs gates own
// *strict membership* against the live code unions/barrels. Adding a capability
// never requires touching this file.
//
// Loadable from plain node via native TS type-stripping (Node >= 22.6):
//   node --no-warnings=ExperimentalWarning scripts/registry/schema-check.mjs

import {z} from "zod";

// ---------------------------------------------------------------------------
// Shared capability shape — the SEMANTIC-tier prose carried by every primitive.
// `kind` is the discriminated-union tag so it lives on each member, not here.
// ---------------------------------------------------------------------------
const capabilityBase = {
  id: z.string(),
  // The exact exported identifier in code (e.g. "FenHeDiagram"). Membership is
  // gated on THIS, not the kebab id, so pascal->kebab derivation can't drift.
  component: z.string(),
  source: z.string(),
  intent: z.array(z.string()),
  useWhen: z.string(),
  avoidWhen: z.string(),
  // Pure-derivable prop variants (e.g. {motion: ["snap","bouncy","settle"]}).
  // Hand-authored in cut 1; cross-checked report-only against the source union.
  variants: z.record(z.string(), z.array(z.string())).optional(),
  status: z.string(),
} as const;

// ---------------------------------------------------------------------------
// primitives[] — discriminated on `kind` (the source-file family).
// Observed kinds: counting | literacy | interaction | sketch.
// ---------------------------------------------------------------------------
const countingPrimitiveSchema = z.object({kind: z.literal("counting"), ...capabilityBase});
const literacyPrimitiveSchema = z.object({kind: z.literal("literacy"), ...capabilityBase});
const interactionPrimitiveSchema = z.object({kind: z.literal("interaction"), ...capabilityBase});
const sketchPrimitiveSchema = z.object({kind: z.literal("sketch"), ...capabilityBase});

export const primitiveSchema = z.discriminatedUnion("kind", [
  countingPrimitiveSchema,
  literacyPrimitiveSchema,
  interactionPrimitiveSchema,
  sketchPrimitiveSchema,
]);

// ---------------------------------------------------------------------------
// motionComponents[] / fxComponents[] — reusable React components discovered
// from their barrels. Simpler than primitives (no kind/intent taxonomy).
// ---------------------------------------------------------------------------
export const reusableComponentSchema = z
  .object({
    id: z.string(),
    component: z.string(),
    source: z.string(),
    useWhen: z.string(),
    avoidWhen: z.string(),
    variants: z.record(z.string(), z.array(z.string())).optional(),
    status: z.string(),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// motionVocabulary — GENERATED, pure-derivable. curves = EASE object keys,
// springs = SPRING object keys (src/motion-primitives/curves.ts).
// ---------------------------------------------------------------------------
export const motionVocabularySchema = z
  .object({
    curves: z.array(z.string()),
    springs: z.array(z.string()),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// styles[] — MEMBERSHIP-GATED against the StyleId union, the src/styles/<id>/
// runtime dir, and the .agents/styles/<id>/ skill bundle (cross-source).
// ---------------------------------------------------------------------------
export const styleSchema = z
  .object({
    id: z.string(),
    useWhen: z.string(),
    status: z.string(),
    runtimeDir: z.string().optional(),
    skillBundle: z.string().optional(),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// recipes[] — MANIFEST-AUTHORED composite tier. Named compositions of lower
// entries; `items` are component identifiers that must resolve (dangling-ref
// gate, a later cut). No code union — the manifest IS the authority.
// ---------------------------------------------------------------------------
export const recipeSchema = z
  .object({
    id: z.string(),
    useWhen: z.string(),
    items: z.array(z.string()),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// Top-level registry.
// ---------------------------------------------------------------------------
export const primitiveRegistrySchema = z
  .object({
    version: z.number(),
    description: z.string(),
    // Self-documenting: which sections are regenerated from code/disk vs which
    // are hand-authored. Mirrors the README authority table.
    generatedSections: z.array(z.string()),
    membershipGatedSections: z.array(z.string()),
    manifestAuthoredSections: z.array(z.string()),
    primitives: z.array(primitiveSchema),
    motionComponents: z.array(reusableComponentSchema),
    fxComponents: z.array(reusableComponentSchema),
    motionVocabulary: motionVocabularySchema,
    styles: z.array(styleSchema),
    recipes: z.array(recipeSchema),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// Inferred types — the future single source of truth for capability types.
// ---------------------------------------------------------------------------
export type PrimitiveRegistry = z.infer<typeof primitiveRegistrySchema>;
export type RegistryPrimitive = z.infer<typeof primitiveSchema>;
export type RegistryReusableComponent = z.infer<typeof reusableComponentSchema>;
export type RegistryMotionVocabulary = z.infer<typeof motionVocabularySchema>;
export type RegistryStyle = z.infer<typeof styleSchema>;
export type RegistryRecipe = z.infer<typeof recipeSchema>;
