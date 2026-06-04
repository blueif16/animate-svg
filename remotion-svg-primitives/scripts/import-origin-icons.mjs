// Import the Omniscience origin icon library into this repo's IconAsset set.
//
// Reads scripts/origin-icon-map.json (id → semantic name), copies each icon's
// COLOR + MONO traced SVG out of the origin library, renames it to the semantic
// name, and drops a provenance .meta.json. After this, run `npm run icons:build`
// to regenerate src/shape-primitives/iconAssetData.ts and pick the assets up.
//
// The origin library palette is byte-identical to theme.ts (var(--icon-*) /
// currentColor), so the color variant is on-palette with no recolor. We copy —
// not symlink — so the assets are self-contained + committed (the sharing model
// the user chose). Re-run any time the origin library updates; it's idempotent.
//
// Conventions: ESM, node:fs/path only — no deps.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, ".."); // remotion-svg-primitives

const MAP_PATH = path.join(here, "origin-icon-map.json");
const DEST_COLOR = path.join(root, "public/icons");
const DEST_MONO = path.join(DEST_COLOR, "mono");

const map = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
const originRoot = map.originRoot;
const srcColorDir = path.join(originRoot, "svg/color");
const srcMonoDir = path.join(originRoot, "svg/mono");

if (!fs.existsSync(srcColorDir)) {
  console.error(`import-origin-icons FAILED — origin color dir missing: ${srcColorDir}`);
  process.exit(1);
}
fs.mkdirSync(DEST_MONO, { recursive: true });

// Inner markup between the root <svg ...> and </svg>; "" for a self-closed
// <svg/> or an empty body. A degenerate trace (no paths) yields "" and would
// make IconAsset render nothing, so we skip such icons rather than ship blanks.
const innerMarkup = (svg) => {
  const open = svg.match(/<svg[^>]*?(\/)?>/i);
  if (!open) return "";
  if (open[1]) return ""; // self-closed <svg/>
  const start = open.index + open[0].length;
  const end = svg.lastIndexOf("</svg>");
  return end < 0 ? "" : svg.slice(start, end).trim();
};

let imported = 0;
const skipped = [];
for (const { id, name, category, desc } of map.icons) {
  const srcColor = path.join(srcColorDir, `${id}.svg`);
  const srcMono = path.join(srcMonoDir, `${id}.svg`);
  if (!fs.existsSync(srcColor) || !fs.existsSync(srcMono)) {
    skipped.push(`${id} (${name}) — missing color or mono source`);
    continue;
  }
  if (!innerMarkup(fs.readFileSync(srcColor, "utf8"))) {
    skipped.push(`${id} (${name}) — empty COLOR trace`);
    continue;
  }
  if (!innerMarkup(fs.readFileSync(srcMono, "utf8"))) {
    skipped.push(`${id} (${name}) — empty MONO trace (no silhouette)`);
    continue;
  }
  fs.copyFileSync(srcColor, path.join(DEST_COLOR, `${name}.svg`));
  fs.copyFileSync(srcMono, path.join(DEST_MONO, `${name}.svg`));
  fs.writeFileSync(
    path.join(DEST_COLOR, `${name}.meta.json`),
    JSON.stringify(
      {
        source: "omniscience-icon-library",
        originId: id,
        category,
        desc,
        track: "sheet→cut→vectorize (build_icon_library.py)",
        importedBy: "scripts/import-origin-icons.mjs",
      },
      null,
      2,
    ) + "\n",
  );
  imported += 1;
}

console.log(
  `import-origin-icons — imported ${imported} icon(s) into ${path.relative(root, DEST_COLOR)} ` +
    `(+ mono + .meta.json). Dropped by map: ${(map.dropped || []).length}. ` +
    `Skipped (missing source): ${skipped.length}.`,
);
for (const s of skipped) console.log(`  SKIP ${s}`);
console.log("Next: npm run icons:build");
