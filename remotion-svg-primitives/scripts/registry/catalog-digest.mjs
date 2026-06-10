// STAGE 2 — agent-facing catalog digest (the planner/composer "visual menu").
//
// Renders src/capabilities/primitive-registry.json into a readable markdown
// menu so a workflow can SEE every built-and-wired primitive (and its variants
// / when-to-use) instead of parsing JSON or reading stale prose. All taste text
// is the catalog's OWN useWhen/avoidWhen, verbatim — never invented here. Entries
// without prose are shown honestly as "— needs prose —" so the gap is visible.
//
// Two modes (mirroring build-registry.mjs):
//   (default / "build")  regenerate the digest and WRITE it.
//   "--check"            regenerate in memory and DIFF against the committed
//                        digest; exit non-zero if stale. Never writes.
//
// Conventions: ESM, node:fs / node:path, standard library only — no deps.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const registryPath = path.join(root, "src/capabilities/primitive-registry.json");
const outPath = path.join(root, "src/capabilities/catalog-digest.md");

const reg = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const BANNER =
  "<!-- GENERATED from src/capabilities/primitive-registry.json by " +
  "`npm run registry:digest` (or registry:build). Do NOT hand-edit — edit the " +
  "catalog's prose, then regenerate. -->";

const cell = (s) => (s && String(s).trim() ? String(s).replace(/\|/g, "\\|").replace(/\n/g, " ") : "— needs prose —");
// The component menu is a PICK list: an agent needs name + variants + a one-line
// "what it's for" to choose. The full multi-sentence prose lives in
// src/capabilities/primitive-registry.json (the source); pasting it verbatim into
// a table cell bloated the digest to ~34k (73% useWhen), stalling cheap models.
// menuCell emits only the first sentence (≤180 chars). Recoverable depth = the JSON.
const MENU_CELL_MAX = 180;
const menuCell = (s) => {
  if (!s || !String(s).trim()) return "— needs prose —";
  const t = String(s).replace(/\n/g, " ").trim();
  let first = t.split(/(?<=[.;])\s+/)[0];
  if (first.length > MENU_CELL_MAX) first = `${first.slice(0, MENU_CELL_MAX - 1).trimEnd()}…`;
  return first.replace(/\|/g, "\\|");
};
const variantsCell = (v) =>
  v && Object.keys(v).length
    ? Object.entries(v)
        .map(([k, arr]) => `${k}: ${arr.join(" \\| ")}`)
        .join("; ")
    : "—";

const componentTable = (entries) => {
  const lines = ["| id | component | variants | use when (one-line; full prose in primitive-registry.json) |", "| --- | --- | --- | --- |"];
  for (const e of entries)
    lines.push(`| \`${e.id}\` | \`${e.component}\` | ${variantsCell(e.variants)} | ${menuCell(e.useWhen)} |`);
  return lines.join("\n");
};

const KIND_ORDER = ["counting", "literacy", "interaction", "sketch", "asset"];
const KIND_TITLE = {
  counting: "Counting & number",
  literacy: "Literacy & pinyin",
  interaction: "Interaction & sorting",
  sketch: "Sketch / teacher marks",
  asset: "Generated assets (traced flat SVG)",
};

const totalDocumented = (arr) => arr.filter((e) => e.useWhen && e.useWhen.trim()).length;
const lessonComponents = reg.lessonComponents ?? [];
const allEntries = [
  ...reg.primitives,
  ...reg.motionComponents,
  ...reg.fxComponents,
  ...lessonComponents,
];

const LESSON_FAMILY_ORDER = ["media", "transition", "style"];
const LESSON_FAMILY_TITLE = {
  media: "Audio & caption layers",
  transition: "Decorative 3D section transitions",
  style: "Style wrapper",
};

// Deprecated entries are QUARANTINED: dropped from every live family/component
// table (the reuse menu an agent reads must never list a superseded cap as a
// live option) and instead collected into the "Deprecated" section at the very
// bottom. `live` is the menu filter; `isDeprecated` collects the quarantine set.
const isDeprecated = (e) => e.status === "deprecated";
const live = (arr) => arr.filter((e) => !isDeprecated(e));
const deprecatedEntries = allEntries.filter(isDeprecated);

const out = [];
out.push(BANNER);
out.push("");
out.push("# Capability catalog — reusable craft menu");
out.push("");
out.push(
  `> ${reg.description}\n>\n> Source of truth for SHAPE: \`src/capabilities/schema.ts\`. ` +
    "Source of truth for WHAT EXISTS: the component barrels + \`EASE\`/\`SPRING\` keys. " +
    "This menu is generated — never hand-edited.",
);
out.push("");
out.push(
  `**Coverage:** ${totalDocumented(allEntries)}/${allEntries.length} catalog entries have ` +
    "hand-authored prose. Undocumented entries exist and are gated, but their menu text is pending.",
);

// --- SVG primitives (the PRIMITIVE tier), grouped by family -----------------
out.push("\n## SVG teaching primitives\n");
for (const kind of KIND_ORDER) {
  const entries = live(reg.primitives.filter((p) => p.kind === kind));
  if (!entries.length) continue;
  out.push(`### ${KIND_TITLE[kind]} (\`${kind}\`)\n`);
  out.push(componentTable(entries));
  out.push("");
}

// --- motion + fx components -------------------------------------------------
out.push("## Motion components\n");
out.push(componentTable(live(reg.motionComponents)));
out.push("");
out.push("## FX components\n");
out.push(componentTable(live(reg.fxComponents)));
out.push("");

// --- lesson-infra components ------------------------------------------------
// The non-teaching components a Complete<Lesson> wrapper / scene mounts: audio &
// caption layers, decorative 3D section transitions, and the root style wrapper.
// Grouped by family so a composer sees the infra surface alongside the craft
// surface. (The `styles[]` IDS table below is a DIFFERENT thing — those are the
// aesthetic-overlay ids the <StylePreset> wrapper accepts.)
out.push("## Lesson-infra components\n");
for (const family of LESSON_FAMILY_ORDER) {
  const entries = live(lessonComponents.filter((c) => c.family === family));
  if (!entries.length) continue;
  out.push(`### ${LESSON_FAMILY_TITLE[family]} (\`${family}\`)\n`);
  out.push(componentTable(entries));
  out.push("");
}

// --- motion vocabulary ------------------------------------------------------
out.push("## Motion vocabulary\n");
out.push(`- **EASE** (\`src/motion-primitives/curves.ts\`): ${reg.motionVocabulary.curves.map((c) => `\`${c}\``).join(", ")}`);
out.push(`- **SPRING**: ${reg.motionVocabulary.springs.map((s) => `\`${s}\``).join(", ")}`);
out.push("");

// --- styles -----------------------------------------------------------------
out.push("## Styles\n");
out.push("| id | use when | status |");
out.push("| --- | --- | --- |");
for (const s of reg.styles) out.push(`| \`${s.id}\` | ${cell(s.useWhen)} | ${s.status} |`);
out.push("");

// --- generated asset library ------------------------------------------------
// The `icon-asset` primitive is ONE component; the actual library is dozens of
// named assets, invisible unless listed. asset-catalog.json is generated by
// `icons:build`; surface its names so a planner can reach for `<IconAsset
// name="owl-reading" />` instead of inventing one.
const assetCatalogPath = path.join(root, "src/capabilities/asset-catalog.json");
if (fs.existsSync(assetCatalogPath)) {
  const ac = JSON.parse(fs.readFileSync(assetCatalogPath, "utf8"));
  out.push(`## Generated asset library — \`<IconAsset name=... />\` (${ac.count})\n`);
  out.push(
    "Fixed-form decorative/representational objects (traced flat SVG, on-palette). " +
      "REUSE these before hand-coding or generating. Not teaching primitives — see `icon-asset` above for the fence.\n",
  );
  for (const [category, list] of Object.entries(ac.byCategory || {})) {
    out.push(`- **${category}** — ${list.map((n) => `\`${n}\``).join(", ")}`);
  }
  out.push("");
}

// --- deprecated (quarantine) ------------------------------------------------
// Superseded capabilities, pulled OUT of the live menu above and listed here so
// the reason + the replacement to reach for instead are both visible. An agent
// reading the menu never sees these as a live option; if it lands on one, this
// section tells it where to go.
if (deprecatedEntries.length) {
  out.push("## Deprecated — superseded, do not use\n");
  out.push(
    "These capabilities still exist in code (legacy callers compile) but are NOT " +
      "the right way to build new work. Reach for the `→ use` replacement instead.\n",
  );
  for (const e of deprecatedEntries) {
    const target = e.supersededBy ? `\`${e.supersededBy}\`` : "— (no replacement set) —";
    out.push(`- \`${e.id}\` → use ${target} — ${cell(e.avoidWhen)}`);
  }
  out.push("");
}

const generated = out.join("\n") + "\n";

// --- main -------------------------------------------------------------------
const checkMode = process.argv.includes("--check");
if (checkMode) {
  const committed = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : null;
  if (committed === generated) {
    console.log("registry:digest --check ok — catalog-digest.md in sync with the catalog.");
    process.exit(0);
  }
  console.error("registry:digest --check FAILED — catalog-digest.md is stale. Run `npm run registry:digest`.");
  process.exit(1);
}

const prior = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : null;
if (prior === generated) {
  console.log("registry:digest — no change.");
} else {
  fs.writeFileSync(outPath, generated);
  console.log(
    `registry:digest — wrote ${path.relative(root, outPath)} ` +
      `(${reg.primitives.length} primitives, ${reg.motionComponents.length} motion, ` +
      `${reg.fxComponents.length} fx, ${totalDocumented(allEntries)}/${allEntries.length} documented).`,
  );
}
process.exit(0);
