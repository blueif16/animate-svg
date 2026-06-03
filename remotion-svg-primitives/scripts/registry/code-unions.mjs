// Shared comment-stripping TS-source parsers for the capability registry.
//
// These read TypeScript SOURCE as text (no tsc) to extract the members of a
// string-literal union, the keys of an object literal, or the named VALUE
// exports of a barrel file. Ported from the vlog_test harness
// (pipeline/registry/code-unions.mjs) and extended with parseBarrelValueExports
// because this repo's "what exists" source of truth is its component barrels
// (src/shape-primitives/index.ts, motion-primitives/index.ts, fx/index.ts),
// not a kit registry JSON.
//
// Both drift-report.mjs and any later build-registry.mjs import this so the
// scripts can never drift in HOW they read the code — one parser, two consumers.
//
// Conventions: ESM, standard library only, no deps.

// Strip // line comments and /* */ block comments so a comment line that
// happens to contain a quoted word ("settle" prose, etc.) never pollutes a
// parsed union, and a commented-out `export { Foo }` is never discovered.
export const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");

export const quoted = (src) =>
  [...src.matchAll(/"([^"]+)"|'([^']+)'/g)].map((m) => m[1] ?? m[2]);

// Parse `export type Name = "a" | "b" | ...;` (multi-line tolerant). Returns
// the quoted union members, or null if the type isn't found.
export const parseUnion = (src, typeName) => {
  const clean = stripComments(src);
  const m = clean.match(new RegExp(`export type ${typeName}\\s*=([\\s\\S]*?);`));
  if (!m) return null;
  return quoted(m[1]);
};

// Parse the TOP-LEVEL keys of `export const NAME = { ... }`. Used for EASE /
// SPRING (keys are the curve / spring ids). Brace-matches the object body, then
// scans it tracking nesting depth so a NESTED key (e.g. the `mass`/`stiffness`
// inside `snappy: { damping, mass, stiffness }`) is never mistaken for a
// top-level entry. A naive comma/newline split silently captures nested keys.
export const parseObjectKeys = (src, constName) => {
  const clean = stripComments(src);
  const open = clean.match(new RegExp(`export const ${constName}\\s*=\\s*\\{`));
  if (!open) return null;

  // Brace-match from just after the opening `{` to its partner, collecting the
  // object body.
  let depth = 0;
  let body = "";
  for (let i = open.index + open[0].length; i < clean.length; i += 1) {
    const ch = clean[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      if (depth === 0) break;
      depth -= 1;
    }
    body += ch;
  }

  // Walk the body; record `identifier:` only when not inside a nested
  // {} / [] / () group (d === 0).
  const keys = [];
  let d = 0;
  const re = /([{[(])|([)\]}])|([A-Za-z_$][\w$]*)\s*:/g;
  let mm;
  while ((mm = re.exec(body)) !== null) {
    if (mm[1]) d += 1;
    else if (mm[2]) d -= 1;
    else if (mm[3] && d === 0) keys.push(mm[3]);
  }
  return keys;
};

// Parse the named VALUE exports of a barrel file. Matches
//   export { A, B, getC } from "./mod";
// but NOT `export type { ... } from "./mod"` (type-only re-exports) and NOT
// `export * from "./mod"` (star re-exports — handled separately by the caller).
// Returns [{name, module}] preserving the source module so the caller can
// attribute each export to a family (e.g. counting | literacy | interaction).
export const parseBarrelValueExports = (src) => {
  const clean = stripComments(src);
  const out = [];
  // `export\s*\{` deliberately does NOT match `export type {` (the word "type"
  // sits between `export` and `{`). `[^}]*` is safe — export blocks don't nest.
  const re = /export\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
  for (const m of clean.matchAll(re)) {
    const module = m[2];
    const names = m[1]
      .split(/[,\n]/)
      .map((e) => e.trim())
      // tolerate `Foo as Bar` aliases — the exported (public) name is the last.
      .map((e) => e.split(/\s+as\s+/).pop().trim())
      .filter((e) => /^[A-Za-z_$][\w$]*$/.test(e));
    for (const name of names) out.push({name, module});
  }
  return out;
};

// True for a PascalCase identifier (a React component) vs a camelCase helper
// (getStickPlacement, semitonesToPlaybackRate, …). The registry catalogs
// components; helpers are listed separately, not gated.
export const isComponentName = (name) => /^[A-Z]/.test(name);
