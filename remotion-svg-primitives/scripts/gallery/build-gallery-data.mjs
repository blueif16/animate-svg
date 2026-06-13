// =========================================================================
// build-gallery-data.mjs — DERIVES the static gallery's data from the single
// source of truth (src/capabilities/primitive-registry.json) + the generated
// IconAsset SVGs on disk. Writes gallery/gallery-data.json.
//
// THIS INVENTS NO DATA MODEL. It only:
//   1. flattens the registry's existing sections into one card list, tagging
//      each card with the category it already lives in (kind / family / type),
//      reading ONLY existing fields (useWhen, intent, avoidWhen, variants,
//      component, source, status, supersededBy);
//   2. catalogs the 90 generated IconAsset SVGs (public/icons/*.svg) with the
//      category already recorded in each <name>.meta.json, and inlines the real
//      SVG markup so the page can show them live.
//
// Re-run any time the registry changes:  npm run gallery:data
// (gallery:data runs inside `npm run gallery` before serving.)
// =========================================================================

import {readFileSync, readdirSync, writeFileSync, existsSync} from "node:fs";
import {join, dirname, basename} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const REGISTRY = join(REPO, "src", "capabilities", "primitive-registry.json");
const ICONS_DIR = join(REPO, "public", "icons");
const OUT = join(REPO, "gallery", "gallery-data.json");

const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));

// ---- card shape: a thin VIEW over the registry's existing fields. No new
// semantic fields — `category` is just which section/discriminant it came from.
const card = (e, category, categoryGroup) => ({
  id: e.id,
  component: e.component ?? e.id,
  source: e.source ?? "",
  useWhen: e.useWhen ?? "", // FUNCTIONALITY — the primary field
  intent: Array.isArray(e.intent) ? e.intent : [], // TAGS
  avoidWhen: e.avoidWhen ?? "",
  variants: e.variants && Object.keys(e.variants).length ? e.variants : null,
  status: e.status ?? "stable",
  supersededBy: e.supersededBy ?? null,
  category, // the section/kind/family this entry already lives in
  categoryGroup, // coarse band for nav
});

const cards = [];

// primitives[] — grouped by their existing `kind` discriminant.
const KIND_LABEL = {
  counting: "Counting & number",
  literacy: "Literacy & pinyin",
  interaction: "Interaction & sorting",
  sketch: "Sketch / teacher marks",
  asset: "Generated-asset primitive",
};
for (const p of registry.primitives ?? []) {
  cards.push(card(p, KIND_LABEL[p.kind] ?? p.kind, "Teaching primitives"));
}

// motionComponents[] / fxComponents[]
for (const m of registry.motionComponents ?? []) cards.push(card(m, "Motion components", "Motion & FX"));
for (const f of registry.fxComponents ?? []) cards.push(card(f, "FX components", "Motion & FX"));

// lessonComponents[] — grouped by their existing `family` discriminant.
const FAMILY_LABEL = {
  media: "Audio & caption layers",
  transition: "Decorative 3D transitions",
  style: "Style wrapper",
};
for (const l of registry.lessonComponents ?? []) {
  cards.push(card(l, FAMILY_LABEL[l.family] ?? l.family, "Lesson infrastructure"));
}

// styles[] — id + useWhen + status only (no intent/avoidWhen in the model).
for (const s of registry.styles ?? []) {
  cards.push(card({...s, component: s.id}, "Styles", "Styles"));
}

// ---- motion vocabulary (EASE / SPRING keys) — surfaced as a compact panel,
// not cards. Carried straight from the registry.
const motionVocabulary = registry.motionVocabulary ?? {curves: [], springs: []};

// ---- IconAsset library: real SVGs on disk, category from each .meta.json. ----
const iconFiles = existsSync(ICONS_DIR)
  ? readdirSync(ICONS_DIR).filter((f) => f.endsWith(".svg")).sort()
  : [];
const icons = iconFiles.map((file) => {
  const name = basename(file, ".svg");
  const metaPath = join(ICONS_DIR, `${name}.meta.json`);
  let category = "other";
  let desc = "";
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, "utf8"));
      category = meta.category ?? "other";
      desc = meta.desc ?? "";
    } catch {
      /* leave defaults */
    }
  }
  // Inline the real color SVG so the page shows it live with zero extra fetches.
  const svg = readFileSync(join(ICONS_DIR, file), "utf8").trim();
  return {name, category, desc, svg};
});

// ---- rendered-preview manifest (poster + loop gif per id), produced by
// `npm run gallery:previews`. OPTIONAL: if absent, the page shows placeholders.
// We only flag which ids HAVE a poster / gif on disk — the files themselves live
// under gallery/previews/<id>/ and are loaded lazily by the page, not inlined.
const PREVIEWS_MANIFEST = join(REPO, "gallery", "previews", "manifest.json");
let previews = {hasPosters: false, withGif: [], posterOnly: [], dims: null};
if (existsSync(PREVIEWS_MANIFEST)) {
  try {
    const pm = JSON.parse(readFileSync(PREVIEWS_MANIFEST, "utf8"));
    previews = {
      hasPosters: true,
      ok: pm.ok ?? [],
      withGif: pm.withGif ?? [],
      posterOnly: pm.posterOnly ?? [],
      failed: pm.failed ?? [],
      noDemo: pm.noDemo ?? [],
      dims: pm.width && pm.height ? {w: pm.width, h: pm.height} : null,
      generatedAt: pm.generatedAt ?? null,
    };
  } catch {
    /* leave default (no previews) */
  }
}
// tag each card so the page renders poster/gif vs placeholder without a lookup.
const posterSet = new Set(previews.ok ?? []);
const gifSet = new Set(previews.withGif ?? []);
for (const c of cards) {
  c.hasPoster = posterSet.has(c.id);
  c.hasGif = gifSet.has(c.id);
}

// ---- coverage counts (reported on the page header; nothing computed beyond
// what the registry already states). ----
const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  registryVersion: registry.version,
  description: registry.description,
  cards,
  motionVocabulary,
  icons,
  previews,
  counts: {
    cards: cards.length,
    icons: icons.length,
    rendered: posterSet.size,
  },
};

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(
  `gallery-data.json written: ${cards.length} component cards + ${icons.length} icon assets ` +
    `(from primitive-registry.json v${registry.version}). ` +
    (previews.hasPosters
      ? `${posterSet.size} rendered previews wired (${gifSet.size} animated).`
      : `No rendered previews yet — run \`npm run gallery:previews\`.`),
);
