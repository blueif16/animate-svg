// Generate src/shape-primitives/iconAssetData.ts AND src/capabilities/
// asset-catalog.json from public/icons/*.svg.
//
// Theme-tinting a generated+traced SVG asset requires the SVG MARKUP to be
// INLINE in the React tree (so its `var(--icon-*, #hex)` fills, or its
// `fill="currentColor"` in the mono variant, can be driven by CSS vars / the
// `color` property). An `<img src>` cannot expose those. Remotion's webpack
// config (remotion.config.ts) enables only Tailwind — there is no `?raw`
// loader and no svgr, and adding one would be a build-config spike. The
// deterministic, zero-runtime-fetch path is to inline the markup AT BUILD TIME
// as a static TypeScript data module: <IconAsset> then renders the inner markup
// via dangerouslySetInnerHTML inside an <svg viewBox=...>. Static data ⇒ same
// composition frame renders byte-identically, every time.
//
// For each `<name>.svg` in public/icons/ (color) with a matching
// public/icons/mono/<name>.svg (mono), this extracts the inner markup (the
// children of the root <svg>) and the viewBox, and emits one record per name.
// Each asset's <name>.meta.json (provenance) supplies category + a short
// description for the agent-facing asset-catalog.json (so the planner/composer
// can SEE which asset names exist — a 70-asset library is invisible otherwise).
//
// Two modes (mirroring the registry generators):
//   (default / "build")  regenerate both outputs and WRITE them.
//   "--check"            regenerate in memory and DIFF against the committed
//                        files; exit non-zero if either is stale. Never writes.
//
// Conventions: ESM, node:fs / node:path, standard library only — no deps.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", ".."); // remotion-svg-primitives

const ICONS_DIR = path.join(root, "public/icons");
const MONO_DIR = path.join(ICONS_DIR, "mono");
const OUT_DATA = path.join(root, "src/shape-primitives/iconAssetData.ts");
const OUT_CATALOG = path.join(root, "src/capabilities/asset-catalog.json");

const read = (p) => fs.readFileSync(p, "utf8");

// Pull the viewBox attribute off the root <svg ...>.
const viewBoxOf = (svg) => {
  const m = svg.match(/<svg[^>]*\bviewBox\s*=\s*["']([^"']+)["']/i);
  return m ? m[1] : "0 0 512 512";
};

// The inner markup = everything between the root <svg ...> open tag and its
// closing </svg>. We keep it verbatim (the traced paths) so the asset is
// pixel-faithful; only the outer <svg> wrapper is dropped (IconAsset supplies
// its own, sized/placed one).
const innerMarkupOf = (svg) => {
  const open = svg.match(/<svg[^>]*>/i);
  if (!open) throw new Error("no <svg> open tag found");
  const start = open.index + open[0].length;
  const end = svg.lastIndexOf("</svg>");
  if (end < 0) throw new Error("no </svg> close tag found");
  return svg.slice(start, end).trim();
};

const tsString = (s) => JSON.stringify(s);

// Short, single-line description for the agent menu (generated-asset prompts
// can be paragraphs; clamp them).
const shortDesc = (s) => {
  const one = String(s || "").replace(/\s+/g, " ").trim();
  return one.length > 140 ? one.slice(0, 137) + "…" : one;
};

const metaFor = (name) => {
  const p = path.join(ICONS_DIR, `${name}.meta.json`);
  if (!fs.existsSync(p)) return { category: "uncategorized", desc: "" };
  try {
    const m = JSON.parse(read(p));
    return {
      category: m.category || "generated",
      desc: shortDesc(m.desc || m.description || ""),
    };
  } catch {
    return { category: "uncategorized", desc: "" };
  }
};

// Build both output strings (pure — no writes). Returns { dataTs, catalogJson }.
const build = () => {
  if (!fs.existsSync(ICONS_DIR)) {
    console.error(`icons:build FAILED — ${path.relative(root, ICONS_DIR)} does not exist.`);
    process.exit(1);
  }

  const names = fs
    .readdirSync(ICONS_DIR)
    .filter((f) => f.endsWith(".svg"))
    .map((f) => f.replace(/\.svg$/, ""))
    .sort();

  if (!names.length) {
    console.error(`icons:build FAILED — no .svg files in ${path.relative(root, ICONS_DIR)}.`);
    process.exit(1);
  }

  const records = [];
  const catalog = [];
  for (const name of names) {
    const colorPath = path.join(ICONS_DIR, `${name}.svg`);
    const monoPath = path.join(MONO_DIR, `${name}.svg`);
    if (!fs.existsSync(monoPath)) {
      console.error(
        `icons:build FAILED — color asset ${name}.svg has no mono sibling at ` +
          `${path.relative(root, monoPath)}. Every asset needs both variants.`,
      );
      process.exit(1);
    }
    const colorSvg = read(colorPath);
    const monoSvg = read(monoPath);
    records.push({
      name,
      viewBox: viewBoxOf(colorSvg),
      color: innerMarkupOf(colorSvg),
      mono: innerMarkupOf(monoSvg),
    });
    const { category, desc } = metaFor(name);
    catalog.push({ name, category, desc });
  }

  const BANNER =
    "// GENERATED by `npm run icons:build` (scripts/registry/build-icon-assets.mjs)\n" +
    "// from public/icons/*.svg + public/icons/mono/*.svg. Do NOT hand-edit — re-run\n" +
    "// the generator after adding/retracing an icon asset.\n";

  const body = records
    .map(
      (r) =>
        `  ${tsString(r.name)}: {\n` +
        `    viewBox: ${tsString(r.viewBox)},\n` +
        `    color: ${tsString(r.color)},\n` +
        `    mono: ${tsString(r.mono)},\n` +
        `  },`,
    )
    .join("\n");

  const dataTs =
    BANNER +
    "\n" +
    "export type IconAssetMarkup = {\n" +
    "  /** The SVG viewBox the inner markup is authored in. */\n" +
    "  viewBox: string;\n" +
    '  /** Inner markup of the COLOR variant (var(--icon-*, #hex) fills). */\n' +
    "  color: string;\n" +
    '  /** Inner markup of the MONO variant (fill="currentColor"). */\n' +
    "  mono: string;\n" +
    "};\n\n" +
    "export const ICON_ASSETS: Record<string, IconAssetMarkup> = {\n" +
    body +
    "\n};\n\n" +
    "export type IconAssetName = keyof typeof ICON_ASSETS;\n";

  const byCategory = {};
  for (const a of catalog) (byCategory[a.category] ||= []).push(a.name);
  const catalogJson =
    JSON.stringify(
      {
        _comment:
          "GENERATED by `npm run icons:build`. Agent-facing index of available <IconAsset name=...> assets (the asset library is otherwise invisible to a planner). category/desc come from each public/icons/<name>.meta.json. Do NOT hand-edit.",
        count: catalog.length,
        byCategory: Object.fromEntries(
          Object.entries(byCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => [k, v.sort()]),
        ),
        assets: catalog,
      },
      null,
      2,
    ) + "\n";

  return { dataTs, catalogJson, count: records.length, names };
};

const checkMode = process.argv.includes("--check");
const { dataTs, catalogJson, count, names } = build();

if (checkMode) {
  const dataPrior = fs.existsSync(OUT_DATA) ? read(OUT_DATA) : null;
  const catPrior = fs.existsSync(OUT_CATALOG) ? read(OUT_CATALOG) : null;
  if (dataPrior === dataTs && catPrior === catalogJson) {
    console.log(`icons:build --check ok — ${count} asset(s) in sync.`);
    process.exit(0);
  }
  console.error(
    "icons:build --check FAILED — iconAssetData.ts or asset-catalog.json is stale. " +
      "Run `npm run icons:build` and commit the result.",
  );
  process.exit(1);
}

let wrote = 0;
if (fs.existsSync(OUT_DATA) ? read(OUT_DATA) !== dataTs : true) {
  fs.writeFileSync(OUT_DATA, dataTs);
  wrote += 1;
}
if (fs.existsSync(OUT_CATALOG) ? read(OUT_CATALOG) !== catalogJson : true) {
  fs.writeFileSync(OUT_CATALOG, catalogJson);
  wrote += 1;
}
console.log(
  wrote === 0
    ? `icons:build — no change (${count} asset(s)).`
    : `icons:build — wrote ${wrote} file(s) (${count} asset(s)): ${names.join(", ")}.`,
);
