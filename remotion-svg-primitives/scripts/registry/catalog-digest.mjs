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

// Cut a string on a SENTENCE boundary only (./。) — never mid-";" (the old bug
// that left fen-he-diagram a dangling half-thought). Caps with an ellipsis.
const sentenceFirst = (s, n) => {
  const t = String(s).replace(/\n/g, " ").trim();
  let first = t.split(/(?<=[.。])\s+/)[0];
  if (first.length > n) first = `${first.slice(0, n - 1).trimEnd()}…`;
  return first;
};
const escPipe = (s) => s.replace(/\|/g, "\\|");

// intent = the SELECTION SIGNAL the model picks on: ONE complete sentence, shown
// WHOLE (≤200, effectively no cut). During the migration window an entry may still
// hold the legacy keyword-tag array — fall back to the useWhen first-sentence so
// the menu stays useful until that category is swept, flagged so the gap is visible.
const INTENT_MAX = 200;
const intentCell = (intent, useWhen) => {
  if (typeof intent === "string" && intent.trim()) {
    const t = intent.replace(/\n/g, " ").trim();
    return escPipe(t.length > INTENT_MAX ? `${t.slice(0, INTENT_MAX - 1).trimEnd()}…` : t);
  }
  return useWhen && String(useWhen).trim()
    ? `${escPipe(sentenceFirst(useWhen, INTENT_MAX))} _(needs intent sentence)_`
    : "— needs prose —";
};
// useWhen = the CONFIRM read (functionality detail) — secondary, first 1-2
// sentences, cap ~280. Full prose stays recoverable in primitive-registry.json.
const USE_WHEN_MAX = 280;
const useWhenCell = (s) => (s && String(s).trim() ? escPipe(sentenceFirst(s, USE_WHEN_MAX)) : "—");
// avoidWhen = the BOUNDARY / "use <sibling> instead" — newly on every live row;
// the single strongest defuser of sibling-confusion + duplicate-builds.
const AVOID_MAX = 180;
const avoidCell = (s) => {
  if (!s || !String(s).trim()) return "—";
  const t = String(s).replace(/\n/g, " ").trim();
  return escPipe(t.length > AVOID_MAX ? `${t.slice(0, AVOID_MAX - 1).trimEnd()}…` : t);
};
const variantsCell = (v) =>
  v && Object.keys(v).length
    ? Object.entries(v)
        .map(([k, arr]) => `${k}: ${arr.join(" \\| ")}`)
        .join("; ")
    : "—";

// The PICK table. Columns ordered by the selection decision: intent (pick on this)
// leads; variants + the confirm-read useWhen + the avoid→use boundary follow.
// `source` and `status` are deliberately NOT columns (integration/noise — they
// stay in primitive-registry.json). See registry-exposure-and-taxonomy brief §3.
const componentTable = (entries) => {
  const lines = [
    "| id | component | intent — pick on this | variants | use when (confirm) | avoid → use instead |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const e of entries)
    lines.push(
      `| \`${e.id}\` | \`${e.component}\` | ${intentCell(e.intent, e.useWhen)} | ${variantsCell(e.variants)} | ${useWhenCell(e.useWhen)} | ${avoidCell(e.avoidWhen)} |`,
    );
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
const specialComponents = reg.specialComponents ?? [];
const allEntries = [
  ...reg.primitives,
  ...reg.motionComponents,
  ...specialComponents,
  ...reg.fxComponents,
  ...lessonComponents,
];

const LESSON_FAMILY_ORDER = ["media", "transition", "style"];
const LESSON_FAMILY_TITLE = {
  media: "Audio & caption layers",
  transition: "Decorative 3D section transitions",
  style: "Style wrapper",
};

// Deprecated entries are QUARANTINED OUT of the agent-facing digest entirely:
// dropped from every live family/component table AND never emitted in a bottom
// "Deprecated" section — a superseded capability must be invisible to the agents
// that read this menu (the "from the ground start" rule), not merely demoted.
// Deprecated entries still live in primitive-registry.json (status:"deprecated"
// + supersededBy) for the gallery's Legacy band ONLY; the redirect to the
// replacement is enforced for AGENTS by the registry:check gate that fails if any
// LIVE entry's prose still references a deprecated id/component (so no live menu
// row ever points an agent at a dead capability). `live` is the menu filter.
const isDeprecated = (e) => e.status === "deprecated";
const live = (arr) => arr.filter((e) => !isDeprecated(e));

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

// The catalog is organized by COMPOSITION TIER (the axis a composing model
// reasons on): ATOM → MODIFIER → COMPOSITE → INFRA. Subject is a sub-header inside
// ATOM only. Effects/3D/styles live in MODIFIER/INFRA — never ATOM — so a
// decorative effect can never be picked as the thing the child reasons about.
// See research/registry-exposure-and-taxonomy-2026-06-14.md §5.

// --- ATOM tier — teaching primitives (grouped by subject) -------------------
out.push("\n## ATOM — teaching primitives\n");
out.push("_The prop-driven shapes the child reasons about (count/progress/state drive them). Grouped by subject._\n");
for (const kind of KIND_ORDER) {
  const entries = live(reg.primitives.filter((p) => p.kind === kind));
  if (!entries.length) continue;
  out.push(`### ${KIND_TITLE[kind]} (\`${kind}\`)\n`);
  out.push(componentTable(entries));
  out.push("");
}

// --- MODIFIER tier — motion + fx (wrap/animate an element; no teaching content) -
out.push("## MODIFIER — motion & fx\n");
out.push("_Wrap or animate an existing element; carry no teaching content of their own._\n");
out.push("### Motion\n");
out.push(componentTable(live(reg.motionComponents)));
out.push("");
out.push("### FX\n");
out.push(componentTable(live(reg.fxComponents)));
out.push("");
out.push("### Motion vocabulary\n");
out.push(`- **EASE** (\`src/motion-primitives/curves.ts\`): ${reg.motionVocabulary.curves.map((c) => `\`${c}\``).join(", ")}`);
out.push(`- **SPRING**: ${reg.motionVocabulary.springs.map((s) => `\`${s}\``).join(", ")}`);
out.push("");

// --- COMPOSITE tier — special components (ONE self-contained teaching beat) --
out.push("## COMPOSITE — teaching beats\n");
out.push(
  "_Each orchestrates atoms + assets + modifiers into ONE self-contained teaching beat " +
    "(count-and-mark, split-and-merge, match-pairs…). Reach for these FIRST when a whole move is needed._\n",
);
out.push(componentTable(live(specialComponents)));
out.push("");

// --- INFRA tier — lesson plumbing + styles ----------------------------------
// Scene-mounted, non-teaching: audio/caption layers, decorative 3D section
// transitions, the root style wrapper, and the aesthetic-overlay style ids.
out.push("## INFRA — lesson plumbing\n");
out.push("_Scene-mounted, non-teaching. Decorative 3D / styles frame a moment; they are never the teaching object._\n");
for (const family of LESSON_FAMILY_ORDER) {
  const entries = live(lessonComponents.filter((c) => c.family === family));
  if (!entries.length) continue;
  out.push(`### ${LESSON_FAMILY_TITLE[family]} (\`${family}\`)\n`);
  out.push(componentTable(entries));
  out.push("");
}
out.push("### Styles\n");
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
// Deprecated entries are INTENTIONALLY NOT emitted here. A superseded capability
// must be invisible to the agents that read this digest — not listed in a bottom
// "Deprecated" section that an agent could still copy from. They stay in
// primitive-registry.json (status:"deprecated") for the gallery's Legacy band
// only; live entries never reference them (registry:check's no-dead-reference
// gate enforces that), so the digest never points an agent at a dead capability.

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
