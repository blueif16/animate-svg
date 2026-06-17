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
  // SELECTION SIGNAL — the one field the composing model picks on. NEW form: ONE
  // complete, trigger-first sentence (was a keyword-tag array). z.union keeps the
  // legacy string[] valid during the per-category re-authoring sweep; tighten to
  // z.string() once every category is swept.
  intent: z.union([z.string(), z.array(z.string())]),
  useWhen: z.string(),
  avoidWhen: z.string(),
  // Pure-derivable prop variants (e.g. {motion: ["snap","bouncy","settle"]}).
  // Hand-authored in cut 1; cross-checked report-only against the source union.
  variants: z.record(z.string(), z.array(z.string())).optional(),
  // Lifecycle: "undocumented" (just discovered, no prose yet) | "experimental" |
  // "stable" | "deprecated" (superseded — quarantined into the gallery's Legacy
  // band ONLY; NEVER surfaced in the agent-facing catalog-digest.md, and no live
  // entry's prose may reference it — the registry:check no-dead-reference gate
  // redirects every reference to its supersededBy target). Kept a free string by
  // DESIGN (the schema models structure; the .mjs gates own membership) —
  // "deprecated" is just the sanctioned quarantine value.
  status: z.string(),
  // When status === "deprecated", the id of the capability to reach for instead
  // (e.g. bundle-wrap -> asset-morph). Optional; absent for non-deprecated entries.
  supersededBy: z.string().optional(),
} as const;

// ---------------------------------------------------------------------------
// primitives[] — discriminated on `kind` (the source-file family).
// Observed kinds: counting | literacy | interaction | sketch | asset.
// `asset` is the generated+traced flat-SVG family (src/shape-primitives/
// asset.tsx, IconAsset) — fixed-form representational objects, not parametric
// teaching primitives.
// ---------------------------------------------------------------------------
const countingPrimitiveSchema = z.object({kind: z.literal("counting"), ...capabilityBase});
const literacyPrimitiveSchema = z.object({kind: z.literal("literacy"), ...capabilityBase});
const interactionPrimitiveSchema = z.object({kind: z.literal("interaction"), ...capabilityBase});
const sketchPrimitiveSchema = z.object({kind: z.literal("sketch"), ...capabilityBase});
const assetPrimitiveSchema = z.object({kind: z.literal("asset"), ...capabilityBase});

export const primitiveSchema = z.discriminatedUnion("kind", [
  countingPrimitiveSchema,
  literacyPrimitiveSchema,
  interactionPrimitiveSchema,
  sketchPrimitiveSchema,
  assetPrimitiveSchema,
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
    // SELECTION SIGNAL — one trigger-first sentence (see capabilityBase.intent).
    intent: z.union([z.string(), z.array(z.string())]).optional(),
    useWhen: z.string(),
    avoidWhen: z.string(),
    variants: z.record(z.string(), z.array(z.string())).optional(),
    status: z.string(),
    // See capabilityBase.supersededBy — the replacement id when status is "deprecated".
    supersededBy: z.string().optional(),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// lessonComponents[] — GENERATED. The lesson-INFRA components a Complete<Lesson>
// wrapper / scene mounts but which are NOT teaching primitives, motion, or fx:
// the audio/caption layers (src/lesson-media/components.ts), the decorative 3D
// section transitions (src/lessons/transitions/index.ts), and the root style
// wrapper (src/styles/components.ts). Discovered from those component barrels so
// a scene can never name one that the registry doesn't know about (the
// lesson↔registry phantom gate's universe grows by sweeping these in). `family`
// is the discriminant (media | transition | style); the rest is the reusable
// component shape. NOTE styles[] (style IDS) is a DIFFERENT, membership-gated
// section — this entry is just the <StylePreset> wrapper component.
// ---------------------------------------------------------------------------
export const lessonComponentSchema = z
  .object({
    family: z.string(),
    id: z.string(),
    component: z.string(),
    source: z.string(),
    intent: z.union([z.string(), z.array(z.string())]),
    useWhen: z.string(),
    avoidWhen: z.string(),
    variants: z.record(z.string(), z.array(z.string())).optional(),
    status: z.string(),
    supersededBy: z.string().optional(),
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
    // specialComponents[] — the COMPOSITE tier: components that orchestrate
    // atoms + assets + modifiers into ONE self-contained teaching beat (AssetMorph,
    // PartWholeComposer, OrderedRowSpotlight…). Same reusable shape as motion/fx;
    // existence is still discovered from the motion barrel, but membership of THIS
    // section is owned by the MOTION_COMPOSITES set in scripts/registry/families.mjs
    // (one shared tier authority). Closes the unmodeled-tier gap the gap-filler
    // skill already referenced. See research/registry-exposure-and-taxonomy-2026-06-14.md §5.
    specialComponents: z.array(reusableComponentSchema),
    lessonComponents: z.array(lessonComponentSchema),
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
export type RegistryLessonComponent = z.infer<typeof lessonComponentSchema>;
export type RegistryMotionVocabulary = z.infer<typeof motionVocabularySchema>;
export type RegistryStyle = z.infer<typeof styleSchema>;
export type RegistryRecipe = z.infer<typeof recipeSchema>;
