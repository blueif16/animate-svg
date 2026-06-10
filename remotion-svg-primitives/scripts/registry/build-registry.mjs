// STAGE 2 — tiny owned generator + hard gate for the capability registry.
//
// Capability-registry-harness, code/primitive-first stage. The CODE is the
// source of truth for WHAT EXISTS: the component barrels
// (src/shape-primitives/index.ts, motion-primitives/index.ts, fx/index.ts) and
// the EASE/SPRING object keys (curves.ts). This generator derives the
// STRUCTURAL fields of the catalog (component / kind / source / motion
// vocabulary) from that code, and CARRIES FORWARD the hand-authored prose
// (intent / useWhen / avoidWhen / variants) by component id — so adding a
// primitive can never leave it invisible, and authored taste is never lost on
// regenerate. Mirrors vlog_test's build-registry.mjs "carry brush tags forward
// by id" pattern, generalized to our SVG component library.
//
// Two modes:
//   (default / "build")  regenerate the 4 code-derived sections and WRITE the
//                         catalog back (whole-file, deterministic order).
//   "--check"            regenerate in memory and DIFF against the committed
//                        catalog. Exit non-zero if they differ — this IS the
//                        existence + structure gate: a barrel export missing
//                        from the catalog (or a dangling entry) makes the diff
//                        fail with "run registry:build". Never writes.
//
// Idempotent: build on a clean tree, then --check, is green. Prose is carried
// forward, so hand-editing useWhen/avoidWhen and re-running build is a no-op.
//
// Conventions: ESM, node:fs / node:path, standard library only — no deps.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {
  isComponentName,
  parseBarrelValueExports,
  parseObjectKeys,
} from "./code-unions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", ".."); // remotion-svg-primitives

const P = {
  registry: path.join(root, "src/capabilities/primitive-registry.json"),
  shapeBarrel: path.join(root, "src/shape-primitives/index.ts"),
  motionBarrel: path.join(root, "src/motion-primitives/index.ts"),
  fxBarrel: path.join(root, "src/fx/index.ts"),
  curves: path.join(root, "src/motion-primitives/curves.ts"),
  // Lesson-infra COMPONENT barrels (scene-mountable, non-teaching). Each is a
  // focused barrel re-exporting only the React components a scene mounts, so the
  // generator catalogs the scene-facing surface and not internal helpers/types.
  // The component-barrel `module` is irrelevant (these export from one file each);
  // sourceFor() resolves the real .tsx path from the module specifier.
  lessonMediaBarrel: path.join(root, "src/lesson-media/components.ts"),
  transitionsBarrel: path.join(root, "src/lessons/transitions/index.ts"),
  styleComponentsBarrel: path.join(root, "src/styles/components.ts"),
};

// Lesson-infra component families — one generated `lessonComponents[]` section,
// each entry tagged with its `family` discriminant. The barrel is the discovery
// selector (what a scene can mount); the family is for grouping in the digest.
const LESSON_COMPONENT_FAMILIES = [
  {family: "media", barrel: "lessonMediaBarrel"},
  {family: "transition", barrel: "transitionsBarrel"},
  {family: "style", barrel: "styleComponentsBarrel"},
];
const LESSON_FAMILY_ORDER = LESSON_COMPONENT_FAMILIES.map((f) => f.family);

const read = (p) => fs.readFileSync(p, "utf8");
const readJson = (p) => JSON.parse(read(p));

// Source-module suffix -> primitive kind (discriminant) + sort order.
const MODULE_KIND = {
  "./counting": "counting",
  "./literacy": "literacy",
  "./interaction": "interaction",
  "./sketch": "sketch",
  "./asset": "asset",
};
const KIND_ORDER = ["counting", "literacy", "interaction", "sketch", "asset"];

// PascalCase identifier -> kebab id. "FenHeDiagram" -> "fen-he-diagram",
// "FXDefs" -> "fx-defs", "PopIn" -> "pop-in".
const kebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

// Source path (repo-relative, posix) for an export, derived from its barrel
// module specifier. Shape components share a per-family file (./counting ->
// src/shape-primitives/counting.tsx); motion/fx are one file per component
// (./PopIn -> src/motion-primitives/PopIn.tsx).
const sourceFor = (barrelAbs, moduleSpec) => {
  const barrelDirRel = path.relative(root, path.dirname(barrelAbs));
  return `${barrelDirRel}/${moduleSpec.replace(/^\.\//, "")}.tsx`.split(path.sep).join("/");
};

// Carry hand-authored prose forward by component id; (re)generate structure.
// supersededBy is hand-authored (the deprecation pointer) — carry it forward too,
// only when present, so a deprecated entry's replacement id survives regenerate.
const proseFields = (prior) => ({
  intent: prior?.intent ?? [],
  useWhen: prior?.useWhen ?? "",
  avoidWhen: prior?.avoidWhen ?? "",
  ...(prior?.variants ? {variants: prior.variants} : {}),
  status: prior?.status ?? "undocumented",
  ...(prior?.supersededBy ? {supersededBy: prior.supersededBy} : {}),
});

// --- primitives[] -----------------------------------------------------------
const buildPrimitives = (priorByComponent) => {
  const discovered = parseBarrelValueExports(read(P.shapeBarrel)).filter(
    (e) => isComponentName(e.name) && MODULE_KIND[e.module],
  );
  return discovered
    .map(({name, module}) => {
      const prior = priorByComponent.get(name);
      return {
        kind: MODULE_KIND[module],
        id: prior?.id ?? kebab(name),
        component: name,
        source: sourceFor(P.shapeBarrel, module),
        ...proseFields(prior),
      };
    })
    .sort(
      (a, b) =>
        KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
        a.component.localeCompare(b.component),
    );
};

// STRANDED shape exports — a PascalCase component re-exported from the shape
// barrel via a module that is NOT one of the known families (MODULE_KIND).
// buildPrimitives() can't place it (it has no kind), so without this check it
// would be SILENTLY DROPPED — a built-but-invisible primitive the gate never
// sees. The membership-completeness rule (account for EVERY code member or
// deliberately register it) closes that blind spot: a stranded export is hard
// drift. Fix = move it into a family file (counting/literacy/interaction/
// sketch) OR register a new family (MODULE_KIND + KIND_ORDER + the schema.ts
// `kind` union).
const strandedShapeExports = () =>
  parseBarrelValueExports(read(P.shapeBarrel))
    .filter((e) => isComponentName(e.name) && !MODULE_KIND[e.module])
    .map((e) => `${e.name} (from "${e.module}")`)
    .sort();

// --- motionComponents[] / fxComponents[] ------------------------------------
const buildReusable = (barrelAbs, priorByComponent) => {
  const discovered = parseBarrelValueExports(read(barrelAbs)).filter((e) =>
    isComponentName(e.name),
  );
  return discovered
    .map(({name, module}) => {
      const prior = priorByComponent.get(name);
      return {
        id: prior?.id ?? kebab(name),
        component: name,
        source: sourceFor(barrelAbs, module),
        ...proseFields(prior),
      };
    })
    .sort((a, b) => a.component.localeCompare(b.component));
};

// --- lessonComponents[] -----------------------------------------------------
// Sweep the lesson-infra component barrels into ONE generated section, each
// entry carrying its `family`. Same structure-from-code + carry-prose-forward
// rule as the other component sections: id/component/source/family are derived,
// intent/useWhen/avoidWhen are carried forward by component id on regenerate.
const buildLessonComponents = (priorByComponent) => {
  const out = [];
  for (const {family, barrel} of LESSON_COMPONENT_FAMILIES) {
    const barrelAbs = P[barrel];
    const discovered = parseBarrelValueExports(read(barrelAbs)).filter((e) =>
      isComponentName(e.name),
    );
    for (const {name, module} of discovered) {
      const prior = priorByComponent.get(name);
      out.push({
        family,
        id: prior?.id ?? kebab(name),
        component: name,
        source: sourceFor(barrelAbs, module),
        ...proseFields(prior),
      });
    }
  }
  return out.sort(
    (a, b) =>
      LESSON_FAMILY_ORDER.indexOf(a.family) - LESSON_FAMILY_ORDER.indexOf(b.family) ||
      a.component.localeCompare(b.component),
  );
};

// --- motionVocabulary (pure-derivable) --------------------------------------
const buildMotionVocabulary = () => {
  const curvesSrc = read(P.curves);
  return {
    curves: parseObjectKeys(curvesSrc, "EASE") ?? [],
    springs: parseObjectKeys(curvesSrc, "SPRING") ?? [],
  };
};

// --- assemble the next catalog ----------------------------------------------
const BANNER =
  "GENERATED STRUCTURE + carried-forward prose. component/kind/source and " +
  "motionVocabulary are DERIVED FROM CODE by `npm run registry:build` — do NOT " +
  "hand-edit them. intent/useWhen/avoidWhen/variants ARE hand-authored and are " +
  "carried forward by component id. After adding a primitive, run " +
  "`npm run registry:build`; `npm run registry:check` gates drift (regenerate-then-diff).";

const byComponent = (arr) => new Map((arr ?? []).map((e) => [e.component, e]));

const buildNext = () => {
  const current = readJson(P.registry);
  const next = {...current};
  next.$comment = BANNER;
  next.generatedSections = ["primitives", "motionComponents", "fxComponents", "lessonComponents", "motionVocabulary"];
  next.membershipGatedSections = ["styles"];
  next.manifestAuthoredSections = ["recipes"];
  next.primitives = buildPrimitives(byComponent(current.primitives));
  next.motionComponents = buildReusable(P.motionBarrel, byComponent(current.motionComponents));
  next.fxComponents = buildReusable(P.fxBarrel, byComponent(current.fxComponents));
  next.lessonComponents = buildLessonComponents(byComponent(current.lessonComponents));
  next.motionVocabulary = buildMotionVocabulary();
  return next;
};

const serialize = (obj) => JSON.stringify(obj, null, 2) + "\n";

// --- main -------------------------------------------------------------------
const checkMode = process.argv.includes("--check");
const committed = read(P.registry);
const generated = serialize(buildNext());

const undocumented = (next) =>
  [
    ...next.primitives,
    ...next.motionComponents,
    ...next.fxComponents,
    ...next.lessonComponents,
  ].filter((e) => e.status === "undocumented" || !e.useWhen).length;

const stranded = strandedShapeExports();
const printStranded = () => {
  console.error(
    "registry:check FAILED — shape-primitive component(s) exported from the barrel " +
      "but from an UNREGISTERED family module (silently uncatalogued otherwise):",
  );
  for (const s of stranded) console.error(`  - ${s}`);
  console.error(
    "\nFix: move the export into a family file (src/shape-primitives/{counting,literacy," +
      "interaction,sketch}.tsx), OR register a new family — add the module to MODULE_KIND + " +
      "KIND_ORDER in scripts/registry/build-registry.mjs AND the `kind` union in " +
      "src/capabilities/schema.ts. A primitive must belong to a known family to be catalogued.",
  );
};

if (checkMode) {
  let failed = false;
  if (committed !== generated) {
    failed = true;
    console.error(
      "registry:check FAILED — the catalog is out of sync with the code (a primitive/" +
        "component was added or removed in a barrel, or a structural field drifted).",
    );
    // Region-aware first-diff so the message points at the change.
    const a = committed.split("\n");
    const b = generated.split("\n");
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
      if (a[i] !== b[i]) {
        if (a[i] !== undefined) console.error(`  committed (line ${i + 1}): ${a[i]}`);
        if (b[i] !== undefined) console.error(`  generated (line ${i + 1}): ${b[i]}`);
        break;
      }
    }
    console.error("\nFix: run `npm run registry:build` to regenerate, then author prose for any new entry.");
  }
  if (stranded.length) {
    failed = true;
    printStranded();
  }
  if (!failed) {
    const next = JSON.parse(generated);
    console.log(
      `registry:check ok — catalog in sync with code ` +
        `(${next.primitives.length} primitives, ${next.motionComponents.length} motion, ` +
        `${next.fxComponents.length} fx, ${next.lessonComponents.length} lesson-infra, ` +
        `curves ${next.motionVocabulary.curves.length}/` +
        `springs ${next.motionVocabulary.springs.length}). ${undocumented(next)} entr(ies) still need prose.`,
    );
  }
  process.exit(failed ? 1 : 0);
}

// build mode — a stranded export is a hard error here too: it cannot be
// represented in the catalog, so building "succeeds" only for the known
// families and would leave the stranded primitive silently invisible.
if (stranded.length) {
  printStranded();
  process.exit(1);
}
if (committed === generated) {
  const next = JSON.parse(generated);
  console.log(
    `registry:build — no change (${next.primitives.length} primitives, ` +
      `${next.motionComponents.length} motion, ${next.fxComponents.length} fx, ` +
      `${next.lessonComponents.length} lesson-infra already in sync).`,
  );
} else {
  fs.writeFileSync(P.registry, generated);
  const next = JSON.parse(generated);
  console.log(
    `registry:build — regenerated catalog from code: ${next.primitives.length} primitives ` +
      `(${KIND_ORDER.map((k) => `${k}=${next.primitives.filter((p) => p.kind === k).length}`).join(" ")}), ` +
      `${next.motionComponents.length} motion components, ${next.fxComponents.length} fx components, ` +
      `${next.lessonComponents.length} lesson-infra components ` +
      `(${LESSON_FAMILY_ORDER.map((f) => `${f}=${next.lessonComponents.filter((c) => c.family === f).length}`).join(" ")}), ` +
      `motion vocabulary (curves ${next.motionVocabulary.curves.length}, springs ${next.motionVocabulary.springs.length}). ` +
      `${undocumented(next)} entr(ies) still need hand-authored prose.`,
  );
}
process.exit(0);
