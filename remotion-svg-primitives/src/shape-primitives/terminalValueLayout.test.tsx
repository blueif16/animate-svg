// Self-contained runnable test for terminal-value layout (research
// remotion-vendor-best-practices-2026-07-03.md §5 opportunity #9): a
// primitive with a count/progress prop must reserve the footprint of its
// MAX value so layout never shifts mid-animation.
//
// No test framework is installed in this repo; this follows the established
// convention (see src/layout/fitToZone.test.ts) — node:assert/strict, run via
//   npx tsx src/shape-primitives/terminalValueLayout.test.tsx
// (or: npm run test:terminal-value). Exits non-zero on the first failed
// assertion; prints a one-line pass summary on success.
//
// StepTally is the one primitive in the catalog whose rendered footprint
// (pill width / dot-row width) is derived from the CURRENT `steps` value's
// digit-count / item-count rather than a caller-declared max — exactly the
// SevenSegmentNumber counter-reflow class the research brief names. Both its
// variants ("numeric" and "dots") compute width independently, so each is
// tested as its own representative fixed-primitive case.
//
// Renders the REAL component (react-dom/server, actual public props) rather
// than re-deriving the width formula — a refactor that keeps behavior
// identical must keep this test green.

import assert from "node:assert/strict";
// Ambient shorthand module declared in ./react-dom-server.d.ts (this repo's
// install carries no @types/react-dom).
import { renderToStaticMarkup } from "react-dom/server";

import { StepTally } from "./counting";

let passes = 0;
const check = (label: string, fn: () => void): void => {
  fn();
  passes += 1;
  // eslint-disable-next-line no-console
  console.log(`  ok  ${label}`);
};

// Extracts the numeric value of the first `attr="..."` match in `markup`.
const firstAttr = (markup: string, tag: string, attr: string): number => {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}="(-?[\\d.]+)"`);
  const m = markup.match(re);
  assert.ok(m, `expected a <${tag}> with a "${attr}" attribute in: ${markup}`);
  return Number(m![1]);
};

// (1) numeric variant — the pill's rendered width must be IDENTICAL whether
// `steps` is its min (1, a single digit) or its declared max (12, two
// digits), once `maxSteps` reserves the two-digit footprint from frame 0.
check(
  "(1) StepTally variant=numeric: pill width at steps=min === steps=maxSteps",
  () => {
    const widthAt = (steps: number) => {
      const markup = renderToStaticMarkup(
        <svg>
          <StepTally maxSteps={12} steps={steps} variant="numeric" />
        </svg>,
      );
      return firstAttr(markup, "rect", "width");
    };

    const widthAtMin = widthAt(1);
    const widthAtMax = widthAt(12);
    assert.equal(
      widthAtMin,
      widthAtMax,
      `pill width at steps=1 (${widthAtMin}) must equal steps=12 (${widthAtMax}) — the footprint must be reserved for the max, not the current value`,
    );
  },
);

// (2) dots variant — the first dot's rendered `cx` (the row's left anchor,
// derived from `-totalWidth/2 + dotSize/2`) must be IDENTICAL at steps=min
// vs steps=maxSteps: the row's reserved span doesn't shift as more dots
// appear, it only fills in.
check(
  "(2) StepTally variant=dots: first-dot anchor at steps=min === steps=maxSteps",
  () => {
    const firstDotCxAt = (steps: number) => {
      const markup = renderToStaticMarkup(
        <svg>
          <StepTally maxSteps={5} steps={steps} variant="dots" />
        </svg>,
      );
      return firstAttr(markup, "circle", "cx");
    };

    const cxAtMin = firstDotCxAt(1);
    const cxAtMax = firstDotCxAt(5);
    assert.equal(
      cxAtMin,
      cxAtMax,
      `first-dot cx at steps=1 (${cxAtMin}) must equal steps=5 (${cxAtMax}) — the row's left anchor must be reserved for the max, not the current value`,
    );
  },
);

// eslint-disable-next-line no-console
console.log(`\nterminalValueLayout: ${passes}/${passes} checks passing`);
