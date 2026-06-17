// DEPRECATED-REFERENCE GATE — no LIVE catalog entry may point an agent at a
// DEPRECATED capability.
//
// The "from the ground start" rule: a deprecated capability must be invisible to,
// and unrecommended to, the agents that read the registry. catalog-digest.mjs
// already drops deprecated entries from the agent-facing digest, but a LIVE
// entry's own prose (useWhen / avoidWhen / a string intent) can still say
// "use `bundle-wrap`" — a dangling pointer at a dead capability that the agent
// reads as a live recommendation. This gate makes that a HARD `registry:check`
// failure: every reference to a deprecated id OR its component name, from any
// non-deprecated entry's prose, must be redirected to the deprecated entry's
// `supersededBy` target before the build is green.
//
// GENERAL by construction — hardcodes NO capability name. The deprecated set is
// derived from the catalog (every entry with status === "deprecated"), and BOTH
// its kebab `id` and its PascalCase `component` are forbidden tokens (a live row
// can reference a deprecated cap by either form — `bundle-wrap` OR `BundleWrap`).
// A deprecated entry referencing ITSELF (or its own supersededBy) is allowed; it
// is not a live menu option. So any FUTURE deprecation that leaves a dangling
// live reference fails here, not just today's bundle-wrap.
//
// Conventions: ESM, node:fs / node:path, standard library only — no deps.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const registryPath = path.join(root, "src/capabilities/primitive-registry.json");

const reg = JSON.parse(fs.readFileSync(registryPath, "utf8"));

// All prose-bearing entries across every section (lessonComponents/specialComponents
// may be absent on older catalogs — tolerate). styles[]/recipes[] carry no
// id/component cross-refs of this class, so they are out of scope.
const allEntries = [
  ...(reg.primitives ?? []),
  ...(reg.motionComponents ?? []),
  ...(reg.specialComponents ?? []),
  ...(reg.fxComponents ?? []),
  ...(reg.lessonComponents ?? []),
];

const isDeprecated = (e) => e.status === "deprecated";

// The forbidden token set: for every deprecated entry, BOTH forms it can be named
// by — the kebab id and the PascalCase component — each mapped back to that
// entry's redirect target so the failure message tells the author where to point.
const deprecated = allEntries.filter(isDeprecated);
const forbidden = new Map(); // token -> {id, supersededBy}
for (const e of deprecated) {
  const target = e.supersededBy || "(supersededBy not set — set it on the deprecated entry)";
  if (e.id) forbidden.set(e.id, {id: e.id, supersededBy: target});
  if (e.component) forbidden.set(e.component, {id: e.id, supersededBy: target});
}

// Match a token on identifier boundaries so a deprecated id/component can never
// hide as a substring of a longer name (e.g. `BundleWrap` must NOT match
// `ConservationMorphBundle`, and `bundle-wrap` must NOT match `bundle-wrapper`).
// Token chars are [A-Za-z0-9-]; a match requires a non-token char (or string
// edge) on both sides. Tokens are escaped though our ids/components never carry
// regex metachars.
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const referencesToken = (text, token) =>
  new RegExp(`(?<![A-Za-z0-9-])${escapeRe(token)}(?![A-Za-z0-9-])`).test(text);

// The prose an agent reads for a reuse decision. A string `intent` is included;
// the legacy keyword-array `intent` form holds no cross-refs, so skip arrays.
const proseOf = (e) =>
  [typeof e.intent === "string" ? e.intent : "", e.useWhen ?? "", e.avoidWhen ?? ""].join("\n");

const violations = [];
for (const e of allEntries) {
  if (isDeprecated(e)) continue; // a deprecated entry is not a live menu option
  const text = proseOf(e);
  for (const [token, {supersededBy}] of forbidden) {
    if (referencesToken(text, token)) {
      violations.push({entry: e.id || e.component, token, supersededBy});
    }
  }
}

if (violations.length) {
  console.error(
    `check-deprecated-refs FAILED — ${violations.length} live catalog entr(ies) reference a ` +
      "DEPRECATED capability in their prose (an agent reading the menu would be pointed at a dead " +
      "capability). Redirect each reference to the listed supersededBy target:",
  );
  for (const v of violations) {
    console.error(`  - \`${v.entry}\` references deprecated \`${v.token}\` → redirect to \`${v.supersededBy}\``);
  }
  console.error(
    "\nFix: edit the live entry's useWhen/avoidWhen/intent in src/capabilities/primitive-registry.json " +
      "to point at the supersededBy target, then run `npm run registry:build`.",
  );
  process.exit(1);
}

console.log(
  `check-deprecated-refs ok — no live entry references a deprecated capability ` +
    `(${deprecated.length} deprecated, ${forbidden.size} forbidden token(s) checked across ` +
    `${allEntries.length} entries).`,
);
process.exit(0);
