import { config } from "@remotion/eslint-config-flat";

// Lesson layout.ts / manifest.ts MUST stay pure-TS leaves. Importing the
// shape-primitives barrel (or anything that pulls Remotion) into them drags
// Remotion into the pure-TS measured-bbox extractor (scripts/_measured-extract.ts),
// which can trip Remotion's multi-version guard with an opaque error. Re-derive
// any geometry inline instead of reaching for the barrel.
export default [
  ...config,
  {
    files: ["src/lessons/*/layout.ts", "src/lessons/*/manifest.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/shape-primitives", "**/shape-primitives/**"],
              message:
                "layout.ts/manifest.ts must stay pure-TS leaves — the shape-primitives barrel pulls Remotion into the measured-bbox extractor (multi-version guard). Inline the geometry instead.",
            },
          ],
        },
      ],
    },
  },
];
