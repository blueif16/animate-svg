// Self-contained runnable test for the pure layout helpers.
// No test framework is installed; this uses node:assert/strict and runs via
//   npx tsx src/layout/fitToZone.test.ts      (or: npm run test:layout)
// It exits non-zero on the first failed assertion (assert throws) and prints a
// one-line pass summary on success.

import assert from "node:assert/strict";

import {sizing} from "../theme";
import {
  clusterBudget,
  fitUnitsToZone,
  splitZone,
  type ZoneRect,
} from "./index";

let passes = 0;
const check = (label: string, fn: () => void): void => {
  fn();
  passes += 1;
  // eslint-disable-next-line no-console
  console.log(`  ok  ${label}`);
};

const target = sizing.teachingUnit.target; // 96
const min = sizing.teachingUnit.min; // 86
const minGap = sizing.separationGapMin; // 43

// A roomy zone shaped like a real ZONE_OBJECTS (kptest-fenyuhe-six).
const ROOMY: ZoneRect = {x: 80, y: 267, width: 1120, height: 253};

// (a) roomy zone, small count → unit === target, fits:true.
check("(a) roomy + small count → unit===target, fits", () => {
  const r = fitUnitsToZone(ROOMY, 6);
  assert.equal(r.fits, true);
  assert.equal(r.unit, target);
  assert.equal(r.positions.length, 6);
  assert.equal(r.rows, 1);
});

// (b) tight width, high count → unit shrinks below target but >= min,
//     fits:true, spacing math holds (adjacent centers spaced unit+gap).
check("(b) tight width → min<=unit<target, spacing===unit+gap", () => {
  // Width chosen so 11 units must shrink below 96 but stay >= 86.
  // unit = (width - 10*gap)/11. Pick width so unit lands ~90.
  const width = 11 * 90 + 10 * minGap; // 1420
  const zone: ZoneRect = {x: 0, y: 0, width, height: 253};
  const r = fitUnitsToZone(zone, 11);
  assert.equal(r.fits, true);
  assert.ok(r.unit < target, `unit ${r.unit} should be < target ${target}`);
  assert.ok(r.unit >= min, `unit ${r.unit} should be >= min ${min}`);
  assert.equal(r.positions.length, 11);
  // Adjacent centers are spaced exactly unit + gap.
  const dx = r.positions[1].x - r.positions[0].x;
  assert.ok(
    Math.abs(dx - (r.unit + r.gap)) < 1e-6,
    `center spacing ${dx} !== unit+gap ${r.unit + r.gap}`,
  );
});

// (c) over-dense, layout:"row" → fits:false + overflowReason naming numbers.
check("(c) over-dense row → fits:false + numeric overflowReason", () => {
  const zone: ZoneRect = {x: 0, y: 0, width: 600, height: 253};
  const r = fitUnitsToZone(zone, 12, {layout: "row"});
  assert.equal(r.fits, false);
  assert.equal(r.positions.length, 0);
  assert.ok(r.overflowReason && r.overflowReason.length > 0);
  // Names the actual numbers: count, the zone width, and the floor.
  assert.ok(r.overflowReason!.includes("12"), "reason names count");
  assert.ok(r.overflowReason!.includes("600"), "reason names zone width");
  assert.ok(r.overflowReason!.includes(String(min)), "reason names floor");
});

// (d) layout:"grid" with maxRows lets the SAME over-dense case fit:
//     rows>1, fits:true, unit >= min.
check("(d) grid wrap → rows>1, fits, unit>=min", () => {
  // 12 units in a band too narrow for one row but fine in 3 rows of 4.
  const zone: ZoneRect = {x: 0, y: 0, width: 600, height: 600};
  const r = fitUnitsToZone(zone, 12, {layout: "grid", maxRows: 3});
  assert.equal(r.fits, true);
  assert.ok(r.rows > 1, `rows ${r.rows} should be > 1`);
  assert.ok(r.unit >= min, `unit ${r.unit} should be >= min ${min}`);
  assert.equal(r.positions.length, 12);
});

// (e) count=1 → one position at zone center.
check("(e) count=1 → single position at zone center", () => {
  const r = fitUnitsToZone(ROOMY, 1);
  assert.equal(r.fits, true);
  assert.equal(r.positions.length, 1);
  const cx = ROOMY.x + ROOMY.width / 2;
  const cy = ROOMY.y + ROOMY.height / 2;
  assert.ok(Math.abs(r.positions[0].x - cx) < 1e-6, "x centered");
  assert.ok(Math.abs(r.positions[0].y - cy) < 1e-6, "y centered");
});

// (f) count=0 → positions empty, fits:true.
check("(f) count=0 → empty positions, fits:true", () => {
  const r = fitUnitsToZone(ROOMY, 0);
  assert.equal(r.fits, true);
  assert.equal(r.positions.length, 0);
  assert.equal(r.rows, 0);
});

// (g) determinism: two identical calls deep-equal (byte-identical output).
check("(g) determinism → identical inputs deep-equal", () => {
  const a = fitUnitsToZone(ROOMY, 7, {layout: "grid", maxRows: 2});
  const b = fitUnitsToZone(ROOMY, 7, {layout: "grid", maxRows: 2});
  assert.deepStrictEqual(a, b);
});

// (h) gap >= minGap always (across a sweep of counts incl. fitting cases).
check("(h) gap >= minGap for all fitting cases", () => {
  for (let n = 0; n <= 10; n += 1) {
    const r = fitUnitsToZone(ROOMY, n, {layout: "grid", maxRows: 3});
    assert.ok(r.gap >= minGap, `count ${n}: gap ${r.gap} < minGap ${minGap}`);
  }
});

// (i) splitZone(zone, 2) → 2 sub-zones tiling EXACTLY with the gap.
check("(i) splitZone(zone,2) tiles exactly (sum widths + gap === zone.width)", () => {
  const parts = splitZone(ROOMY, 2);
  assert.equal(parts.length, 2);
  const sumW = parts[0].width + parts[1].width;
  assert.ok(
    Math.abs(sumW + minGap - ROOMY.width) < 1e-6,
    `sum(widths)+gap ${sumW + minGap} !== zone.width ${ROOMY.width}`,
  );
  // Sub-zones are contiguous: part1.x === part0.x + part0.width + gap.
  assert.ok(
    Math.abs(parts[1].x - (parts[0].x + parts[0].width + minGap)) < 1e-6,
    "sub-zones contiguous with the gap between them",
  );
  // y/height unchanged on the x axis.
  assert.equal(parts[0].y, ROOMY.y);
  assert.equal(parts[0].height, ROOMY.height);
});

// (i') splitZone exact tiling holds for parts=3 and axis "y" too.
check("(i') splitZone parts=3 + axis 'y' tile exactly", () => {
  const xs = splitZone(ROOMY, 3);
  const sumX = xs.reduce((s, z) => s + z.width, 0);
  assert.ok(Math.abs(sumX + 2 * minGap - ROOMY.width) < 1e-6);
  const ys = splitZone(ROOMY, 3, {axis: "y", gap: 10});
  const sumY = ys.reduce((s, z) => s + z.height, 0);
  assert.ok(Math.abs(sumY + 2 * 10 - ROOMY.height) < 1e-6);
});

// (j) clusterBudget(zone) → maxUnit===target by default; width/height within zone.
check("(j) clusterBudget → maxUnit===target, budget within zone", () => {
  const b = clusterBudget(ROOMY);
  assert.equal(b.maxUnit, target);
  assert.equal(b.width, ROOMY.width);
  assert.equal(b.height, ROOMY.height);
  const padded = clusterBudget(ROOMY, {pad: 20, maxUnit: 70});
  assert.equal(padded.maxUnit, 70);
  assert.equal(padded.width, ROOMY.width - 40);
  assert.equal(padded.height, ROOMY.height - 40);
});

// (Bar 4/5) NEVER unit < minUnit with fits:true; roomy single row is centered
// on the zone center within 1px (block bbox center === zone center).
check("(bar) fitting unit always >= minUnit; roomy row block-centered", () => {
  for (let n = 1; n <= 8; n += 1) {
    const r = fitUnitsToZone(ROOMY, n);
    if (r.fits) {
      assert.ok(r.unit >= min, `count ${n}: fits but unit ${r.unit} < min ${min}`);
    }
  }
  // Block bounding box of a roomy row is centered on the zone center.
  const r = fitUnitsToZone(ROOMY, 6);
  const left = r.positions[0].x - r.unit / 2;
  const right = r.positions[r.positions.length - 1].x + r.unit / 2;
  const blockCx = (left + right) / 2;
  const zoneCx = ROOMY.x + ROOMY.width / 2;
  assert.ok(
    Math.abs(blockCx - zoneCx) < 1,
    `block center ${blockCx} not within 1px of zone center ${zoneCx}`,
  );
  // Vertical center too.
  const zoneCy = ROOMY.y + ROOMY.height / 2;
  assert.ok(Math.abs(r.positions[0].y - zoneCy) < 1, "row y-centered");
});

// (Bar 7) Purity smoke: defaults come from theme (no hidden magic numbers).
check("(bar) defaults resolve from theme.sizing.teachingUnit", () => {
  const r = fitUnitsToZone(ROOMY, 2);
  assert.equal(r.unit, sizing.teachingUnit.target);
  assert.equal(r.gap, sizing.separationGapMin);
});

// eslint-disable-next-line no-console
console.log(`\nfitToZone: ${passes}/${passes} checks passing`);
