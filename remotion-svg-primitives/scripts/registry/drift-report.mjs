// CUT 1 — report-only drift mirror for the capability registry.
//
// Capability-registry-harness, report-only foundation (NO authority flip). This
// script is a MIRROR, not a guard: it ALWAYS exits 0. It diffs what the CODE
// can do today (component barrels, EASE/SPRING object keys, the StyleId union,
// the kids 3D preset) against what src/capabilities/primitive-registry.json
// advertises, and prints the gap. A later cut promotes selected kinds to a hard
// `process.exit(1)` gate (registry:check) once their authority is flipped.
//
// Three drift classes per kind:
//   (a) in code, MISSING from registry  — built-but-unwired (invisible to the
//       next workflow run). This is the textbook symptom.
//   (b) in registry, NO backing code    — dangling manifest entry.
//   (c) cross-source mismatch           — linked copies of the same fact disagree.
//
// Sound is intentionally OUT OF SCOPE here (owned/handled separately). The 3D
// kit catalog is owned by ../../shared-3d — we only report-only cross-check that
// OUR consumption (kidsPreset effectDefaults) resolves against it.
//
// Conventions: ESM, node:fs / node:path, standard library only — no deps.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {
  isComponentName,
  parseBarrelValueExports,
  parseObjectKeys,
  parseUnion,
  stripComments,
} from "./code-unions.mjs";
import {MODULE_KIND} from "./families.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", ".."); // remotion-svg-primitives
const repoRoot = path.resolve(root, ".."); // animation-test (holds .agents)
const desktop = path.resolve(root, "..", ".."); // siblings root (shared-3d, …)

const read = (p) => fs.readFileSync(p, "utf8");
const readJson = (p) => JSON.parse(read(p));
const exists = (p) => fs.existsSync(p);

const P = {
  registry: path.join(root, "src/capabilities/primitive-registry.json"),
  shapeBarrel: path.join(root, "src/shape-primitives/index.ts"),
  motionBarrel: path.join(root, "src/motion-primitives/index.ts"),
  fxBarrel: path.join(root, "src/fx/index.ts"),
  curves: path.join(root, "src/motion-primitives/curves.ts"),
  popIn: path.join(root, "src/motion-primitives/PopIn.tsx"),
  styleTypes: path.join(root, "src/styles/types.ts"),
  stylesDir: path.join(root, "src/styles"),
  agentStylesDir: path.join(repoRoot, ".agents/styles"),
  presetKids: path.join(root, "src/three-effects/preset-kids.ts"),
  kitTypes: path.join(desktop, "shared-3d/src/types.ts"),
};

// --- set diff (the report shape) --------------------------------------------
const diff = (codeIds, registryIds) => {
  const code = new Set(codeIds);
  const reg = new Set(registryIds);
  return {
    missingFromRegistry: [...code].filter((x) => !reg.has(x)).sort(),
    dangling: [...reg].filter((x) => !code.has(x)).sort(),
  };
};

// --- pretty printers --------------------------------------------------------
let sectionsInSync = 0;
let sectionsDrifted = 0;

const reportDiff = (label, codeIds, registryIds, {missingLabel, danglingLabel} = {}) => {
  const {missingFromRegistry, dangling} = diff(codeIds, registryIds);
  if (missingFromRegistry.length === 0 && dangling.length === 0) {
    sectionsInSync += 1;
    console.log(`  ✓ ${label} — in sync (${codeIds.length} in code, ${registryIds.length} in registry).`);
    return;
  }
  sectionsDrifted += 1;
  console.log(`  ✗ ${label} — DRIFT (${codeIds.length} in code, ${registryIds.length} in registry):`);
  if (missingFromRegistry.length)
    console.log(`      (a) ${missingLabel ?? "in code, MISSING from registry"} [${missingFromRegistry.length}]: ${missingFromRegistry.join(", ")}`);
  if (dangling.length)
    console.log(`      (b) ${danglingLabel ?? "in registry, NO backing code (dangling)"} [${dangling.length}]: ${dangling.join(", ")}`);
};

// ---------------------------------------------------------------------------
const registry = readJson(P.registry);
console.log("\n=== capability-registry drift report (CUT 1, report-only — always exit 0) ===\n");

// KIND 1 — SVG teaching primitives (barrel value exports, grouped by family).
{
  const barrel = parseBarrelValueExports(read(P.shapeBarrel));
  const components = barrel.filter((e) => isComponentName(e.name) && MODULE_KIND[e.module]);
  const helpers = barrel.filter((e) => !isComponentName(e.name) && MODULE_KIND[e.module]);
  // Stranded: a PascalCase component exported from an UNREGISTERED family module
  // — uncatalogued by buildPrimitives() and (registry:check) gate-failing.
  const stranded = barrel.filter((e) => isComponentName(e.name) && !MODULE_KIND[e.module]);
  const codeIds = components.map((e) => e.name);
  const regIds = (registry.primitives ?? []).map((p) => p.component);
  console.log("KIND 1 · SVG primitives  (src/shape-primitives/index.ts barrel ↔ primitives[].component)");
  reportDiff("primitives", codeIds, regIds);
  if (stranded.length) {
    sectionsDrifted += 1;
    console.log(
      `  ✗ STRANDED exports (PascalCase, UNREGISTERED family module — uncatalogued + registry:check-failing) [${stranded.length}]: ` +
        stranded.map((e) => `${e.name} (from "${e.module}")`).join(", "),
    );
    console.log("      fix: move into a family file, or register the module (families.mjs MODULE_KIND/KIND_ORDER + schema.ts kind union).");
  }
  // Per-family breakdown so the gap reads at a glance.
  const byKind = {};
  for (const c of components) (byKind[MODULE_KIND[c.module]] ??= []).push(c.name);
  console.log(
    "      families: " +
      Object.entries(byKind)
        .map(([k, v]) => `${k}=${v.length}`)
        .join("  "),
  );
  if (helpers.length)
    console.log(`      (helpers, not gated): ${helpers.map((h) => h.name).join(", ")}`);
}

// KIND 2 — motion components (barrel value exports; `export *` curves excluded).
{
  const codeIds = parseBarrelValueExports(read(P.motionBarrel))
    .filter((e) => isComponentName(e.name))
    .map((e) => e.name);
  // motionComponents (MODIFIER tier) + specialComponents (COMPOSITE tier) share
  // the one motion barrel — union both registry sections so a composite routed
  // out of motionComponents never reads as drift (the no-lying-mirror rule).
  const regIds = [
    ...(registry.motionComponents ?? []),
    ...(registry.specialComponents ?? []),
  ].map((m) => m.component);
  console.log("\nKIND 2 · motion barrel  (src/motion-primitives/index.ts barrel ↔ motionComponents[] ∪ specialComponents[])");
  reportDiff("motion barrel (modifiers + composites)", codeIds, regIds);
}

// KIND 3 — FX components (barrel value exports).
{
  const codeIds = parseBarrelValueExports(read(P.fxBarrel))
    .filter((e) => isComponentName(e.name))
    .map((e) => e.name);
  const regIds = (registry.fxComponents ?? []).map((f) => f.component);
  console.log("\nKIND 3 · FX components  (src/fx/index.ts barrel ↔ fxComponents[].component)");
  reportDiff("fxComponents", codeIds, regIds);
}

// KIND 4 — motion vocabulary (EASE / SPRING object keys, GENERATED-eligible).
{
  const curvesSrc = read(P.curves);
  const easeKeys = parseObjectKeys(curvesSrc, "EASE") ?? [];
  const springKeys = parseObjectKeys(curvesSrc, "SPRING") ?? [];
  console.log("\nKIND 4 · motion vocabulary  (curves.ts EASE/SPRING keys ↔ motionVocabulary)");
  reportDiff("motionVocabulary.curves", easeKeys, registry.motionVocabulary?.curves ?? []);
  reportDiff("motionVocabulary.springs", springKeys, registry.motionVocabulary?.springs ?? []);
}

// KIND 5 — styles (StyleId union ↔ registry ↔ runtime dir ↔ skill bundle).
{
  const unionIds = parseUnion(read(P.styleTypes), "StyleId") ?? [];
  const regIds = (registry.styles ?? []).map((s) => s.id);
  console.log("\nKIND 5 · styles  (StyleId union ↔ styles[] ↔ src/styles/<id> ↔ .agents/styles/<id>)");
  reportDiff("styles (StyleId ↔ registry)", unionIds, regIds);
  // (c) cross-source: every non-default style id should have a runtime dir + skill bundle.
  const crossNotes = [];
  for (const id of unionIds.filter((x) => x !== "default")) {
    if (!exists(path.join(P.stylesDir, id)))
      crossNotes.push(`StyleId "${id}" has NO runtime dir src/styles/${id}`);
    if (!exists(path.join(P.agentStylesDir, id)))
      crossNotes.push(`StyleId "${id}" has NO skill bundle .agents/styles/${id}`);
  }
  // Phantom-reference check: a doc-comment once claimed adding a style needs
  // an entry in a STYLE_REGISTRY const that never existed. Flag any styles
  // source that still MENTIONS STYLE_REGISTRY (comments included) without a
  // real declaration (scan comment-stripped source for the declaration so a
  // mention's own text doesn't fool us).
  const styleSrcs = styleSourceFiles();
  const mentions = styleSrcs.filter((f) => /STYLE_REGISTRY/.test(read(f)));
  const hasStyleRegistryConst = styleSrcs.some((f) =>
    /export const STYLE_REGISTRY\b/.test(stripComments(read(f))),
  );
  if (mentions.length && !hasStyleRegistryConst)
    crossNotes.push(
      `STYLE_REGISTRY is referenced in ${mentions.map((f) => path.relative(root, f)).join(", ")} but no \`export const STYLE_REGISTRY\` exists in src/styles/ (stale doc / phantom reference).`,
    );
  if (crossNotes.length) {
    console.log("      (c) cross-source notes:");
    for (const n of crossNotes) console.log(`          - ${n}`);
  }
}

// KIND 6 — 3D effects CONSUMPTION (report-only cross-source vs the shared-3d
// kit, which OWNS the catalog). We don't model 3D in the registry; we just
// check that what kidsPreset consumes resolves to a real kit EffectId.
{
  console.log("\nKIND 6 · 3D effects consumption  (kidsPreset.effectDefaults ↔ shared-3d EffectId) [report-only, kit-owned]");
  if (!exists(P.kitTypes)) {
    console.log(`      SKIP: shared-3d not found at ${path.relative(root, P.kitTypes)}`);
  } else {
    const kitEffectIds = parseUnion(read(P.kitTypes), "EffectId") ?? [];
    // effectDefaults keys = the quoted keys of the effectDefaults object.
    const presetSrc = read(P.presetKids);
    const m = presetSrc.match(/effectDefaults\s*:\s*\{([\s\S]*?)\n\s\s\},/);
    const consumed = m ? [...m[1].matchAll(/"([^"]+)"\s*:/g)].map((x) => x[1]) : [];
    const unresolved = consumed.filter((id) => !kitEffectIds.includes(id));
    if (unresolved.length === 0) {
      sectionsInSync += 1;
      console.log(`  ✓ consumption resolves — all ${consumed.length} kidsPreset effects ∈ kit EffectId (${kitEffectIds.length} kit effects): ${consumed.join(", ")}.`);
    } else {
      sectionsDrifted += 1;
      console.log(`  ✗ consumption DRIFT — kidsPreset effect(s) not in kit EffectId union: ${unresolved.join(", ")}.`);
    }
  }
}

// --- skip list (explicit, so a reviewer doesn't read it as missing coverage) -
console.log("\nSkipped (no code source / owned elsewhere):");
console.log("  - recipes[]            MANIFEST-AUTHORED (composite tier; refs will be dangling-ref-gated in a later cut).");
console.log("  - variant unions        report-only cross-check only in cut 1 (PopMotion/TeacherMarkKind/CountableObjectVariant).");
console.log("  - sound (beds/sfx/stings)  OUT OF SCOPE — handled separately.");
console.log("  - 3D kit catalog        OWNED by ../../shared-3d (+ vlog harness) — consumption cross-checked above, not modeled here.");

console.log(
  `\n=== summary: ${sectionsInSync} section(s) in sync, ${sectionsDrifted} drifted. ` +
    "Report-only — exit 0 regardless. Flip authority per the staged rollout. ===\n",
);

process.exit(0);

// Recursively collect .ts/.tsx files under src/styles/ for the cross-source
// STYLE_REGISTRY scan (the dir has a nested ink-wash/ folder).
function styleSourceFiles() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(e.name)) out.push(full);
    }
  };
  walk(P.stylesDir);
  return out;
}
