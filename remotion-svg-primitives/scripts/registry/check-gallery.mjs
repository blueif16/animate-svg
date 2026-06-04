// GALLERY GATE — every registered component must have a Component Gallery demo.
//
// The Component Gallery (src/component-gallery) renders one QC cell per registered
// component by looking up its id in src/component-gallery/demoProps.tsx. An id with
// NO demoProps entry renders a red "UNMAPPED: <id>" cell — a silent gap that ships.
// This gate turns that into a HARD build failure: a registered component with no
// gallery demo FAILS `npm run registry:check` (the pre-commit gate), so the gallery
// is always complete and a new component auto-appears on it as a required step of
// authoring — never an afterthought.
//
// Read the registry → the full set of component ids (primitives + motionComponents
// + fxComponents). Read demoProps.tsx → its mapped keys. Any id with no demo is a
// failure. Hardcodes no id list — both sets are read from source.
//
// Conventions: ESM, node:fs / node:path, standard library only — no deps.

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const registryPath = path.join(root, "src/capabilities/primitive-registry.json");
const demoPropsPath = path.join(root, "src/component-gallery/demoProps.tsx");

// --- the registered component ids (source of WHAT MUST BE DEMOED) -----------
const reg = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const registeredIds = [
  ...reg.primitives,
  ...reg.motionComponents,
  ...reg.fxComponents,
].map((e) => e.id);

// --- the demoProps mapped keys (source of WHAT IS DEMOED) -------------------
// Isolate the body of the `export const demoProps: Record<string, GalleryDemo> = {
// ... };` object literal, then pull every top-level string-literal OR bare-ident
// key (`"<id>":` / `'<id>':` / `<id>:`). Component ids are kebab-case, but a few
// (drag, smear, sparkle, breathe) are single words written as bare identifiers, so
// match both forms. Restricting to keys that are also registered ids keeps any
// nested object keys from leaking in (the helper objects use camelCase props that
// are never registry ids).
const src = fs.readFileSync(demoPropsPath, "utf8");
const startMarker = "export const demoProps";
const startIdx = src.indexOf(startMarker);
if (startIdx === -1) {
  console.error(
    "check-gallery FAILED — could not find `export const demoProps` in " +
      path.relative(root, demoPropsPath) + ".",
  );
  process.exit(1);
}
// From the `{` after the marker to the matching closing brace (brace-counted so a
// stray `}` inside a string/JSX would have to be balanced — good enough for this
// well-formed literal, and we still intersect with registeredIds as a safety net).
const braceOpen = src.indexOf("{", startIdx);
let depth = 0;
let braceClose = -1;
for (let i = braceOpen; i < src.length; i++) {
  const ch = src[i];
  if (ch === "{") depth++;
  else if (ch === "}") {
    depth--;
    if (depth === 0) {
      braceClose = i;
      break;
    }
  }
}
const body = braceClose === -1 ? src.slice(braceOpen) : src.slice(braceOpen, braceClose + 1);

const mapped = new Set();
const keyRe = /(?:["']([a-z0-9-]+)["']|\b([a-z][a-z0-9]*))\s*:/g;
let m;
while ((m = keyRe.exec(body)) !== null) {
  mapped.add(m[1] ?? m[2]);
}

// --- the gate ---------------------------------------------------------------
const missing = registeredIds.filter((id) => !mapped.has(id));

if (missing.length) {
  console.error(
    `Gallery gate: ${missing.length} registered component(s) missing a demoProps entry: ` +
      `${missing.join(", ")}. Add them to src/component-gallery/demoProps.tsx.`,
  );
  process.exit(1);
}

console.log(
  `check-gallery ok — all ${registeredIds.length} registered components have a gallery demo.`,
);
process.exit(0);
