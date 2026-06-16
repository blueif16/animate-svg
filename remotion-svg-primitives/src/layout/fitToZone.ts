// Pure, deterministic, lesson-agnostic layout math for the auto-size-to-zone
// design (docs/proposals/auto-size-to-zone.md).
//
// A lesson declares INTENT — "N teaching units, in THIS zone" — and these
// functions COMPUTE the unit size + center positions deterministically:
//   1. clear the kids-eye legibility floors (theme.sizing.teachingUnit), and
//   2. fit the zone, shrinking from `target` toward `min` only as needed.
// Over-dense cases are surfaced as a real density problem (fits:false +
// overflowReason), never silently rendered below the floor.
//
// The SCENE and the bbox MANIFEST both call these helpers with identical
// inputs, so on-canvas sizes and collision boxes agree BY CONSTRUCTION — no
// hand-mirrored size math to drift. Therefore this module must stay PURE and
// DETERMINISTIC: no React, no DOM, no useCurrentFrame, no measurement, no
// Math.random / Date — identical inputs MUST yield byte-identical output.
//
// All coordinates and sizes are in canvas USER UNITS (== px at 1x) on the
// fixed 1280×720 composition, origin top-left — matching src/lessons/*/layout.ts.

import {sizing} from "../theme";

/**
 * A rectangular region of the canvas, in canvas user units (top-left origin).
 * Uses `width`/`height` (NOT w/h) to match the zone shape lessons declare in
 * src/lessons/<id>/layout.ts (e.g. ZONE_OBJECTS = { x, y, width, height }).
 */
export type ZoneRect = {x: number; y: number; width: number; height: number};

/**
 * Options for {@link fitUnitsToZone}. All sizes are in canvas user units.
 * Defaults are pulled from theme.sizing (the single source of truth for the
 * kids-eye floors), so callers normally pass only `zone` + `count`.
 */
export type FitOpts = {
  /** Largest a unit may render. Default sizing.teachingUnit.target (96). */
  targetUnit?: number;
  /** Smallest a fitted unit may render. Default sizing.teachingUnit.min (86).
   *  A FitResult with fits:true NEVER reports a unit below this. */
  minUnit?: number;
  /** Minimum gap between adjacent unit EDGES. Default sizing.separationGapMin
   *  (43). Adjacent unit CENTERS are spaced `unit + gap` apart. */
  minGap?: number;
  /** Anchor the laid-out block within the zone. "center" (default) centers the
   *  block on the zone center; "start" pins it to the zone's top-left. */
  align?: "center" | "start";
  /** "row" (default) lays out a single row. "grid" may wrap into multiple rows
   *  (up to maxRows) to fit a count that overflows one row at minUnit. */
  layout?: "row" | "grid";
  /** Grid only: the maximum number of rows to wrap into. Default 3. */
  maxRows?: number;
};

/**
 * The resolved layout. `positions[i]` is the CENTER of unit i in canvas
 * coordinates (length === count). `unit` is the resolved size (px == canvas
 * units); when `fits` is true it is guaranteed `>= minUnit`. When `fits` is
 * false the count cannot fit at minUnit even wrapped, and `overflowReason`
 * names the actual numbers (a real density signal for the composer).
 */
export type FitResult = {
  unit: number;
  gap: number;
  positions: {x: number; y: number}[];
  rows: number;
  fits: boolean;
  overflowReason?: string;
};

/**
 * The bounding budget a CLUSTER component (one that renders its OWN
 * multiplicity — stick-group, part-whole-composer, …) must render within.
 * `maxUnit` is the largest a sub-unit inside the cluster may be. A cluster
 * takes a budget, not positions — it lays out its own internals from
 * (budget, count, seed) so the scene and manifest reproduce it identically.
 */
export type ClusterFit = {width: number; height: number; maxUnit: number};

/**
 * Lay out `count` uniform teaching units inside `zone`, sizing the unit
 * deterministically to clear the kids-eye floors and fit the zone.
 *
 * Algorithm (per docs/proposals/auto-size-to-zone.md §Design.1):
 *  1. Solve the largest single-row unit that fits:
 *     unit = min(targetUnit, (zone.width - (count-1)*minGap)/count, zone.height).
 *  2. If unit >= minUnit → done, one row, fits:true.
 *  3. Else if layout==="grid": pick the FEWEST rows r <= maxRows so that
 *     ceil(count/r) units per row fit at >= minUnit (and rows fit zone.height);
 *     recompute unit at that row count.
 *  4. Else (still < minUnit) → fits:false + a concrete overflowReason naming
 *     the numbers. NEVER returns unit < minUnit with fits:true, and never
 *     renders sub-floor.
 *
 * `positions` are CENTERS in canvas coords, anchored in the zone per `align`
 * (default "center" — the laid-out block's bounding box is centered on the
 * zone center). count=0 → empty positions, fits:true. count=1 → one centered
 * position. Pure & deterministic: identical inputs → byte-identical output.
 */
export function fitUnitsToZone(
  zone: ZoneRect,
  count: number,
  opts: FitOpts = {},
): FitResult {
  const targetUnit = opts.targetUnit ?? sizing.teachingUnit.target;
  const minUnit = opts.minUnit ?? sizing.teachingUnit.min;
  const gap = opts.minGap ?? sizing.separationGapMin;
  const align = opts.align ?? "center";
  const layout = opts.layout ?? "row";
  const maxRows = opts.maxRows ?? 3;

  // Empty group — nothing to place.
  if (count <= 0) {
    return {unit: targetUnit, gap, positions: [], rows: 0, fits: true};
  }

  // Largest unit that fits `perRow` units across the zone width AND a `rows`
  // stack down the zone height, capped at targetUnit. A row of `n` units +
  // (n-1) gaps spans `n*unit + (n-1)*gap`; a stack of `r` rows spans the same
  // vertically. Solve unit for both axes and the target, take the min.
  const unitFor = (perRow: number, rows: number): number => {
    const widthBudget = (zone.width - (perRow - 1) * gap) / perRow;
    const heightBudget = (zone.height - (rows - 1) * gap) / rows;
    return Math.min(targetUnit, widthBudget, heightBudget);
  };

  // 1–2. One row first.
  const rowUnit = unitFor(count, 1);
  if (rowUnit >= minUnit) {
    return buildResult(zone, count, 1, rowUnit, gap, align);
  }

  // 3. Grid wrap — fewest rows that clear the floor.
  if (layout === "grid") {
    for (let rows = 2; rows <= maxRows; rows += 1) {
      const perRow = Math.ceil(count / rows);
      const unit = unitFor(perRow, rows);
      if (unit >= minUnit) {
        return buildResult(zone, count, rows, unit, gap, align);
      }
    }
  }

  // 4. Cannot fit at the floor — surface the density problem with real numbers.
  // Report the single-row demand at the floor (the clearest signal): N units at
  // minUnit + (N-1) gaps need this many px vs the zone's width.
  const neededRowPx = count * minUnit + (count - 1) * gap;
  const triedRows = layout === "grid" ? Math.min(maxRows, count) : 1;
  const perRowAtMax = Math.ceil(count / triedRows);
  const neededPx = perRowAtMax * minUnit + (perRowAtMax - 1) * gap;
  const overflowReason =
    triedRows > 1
      ? `${count} units need ${perRowAtMax} per row across ${triedRows} rows = ` +
        `${neededPx}px > zone ${zone.width}px even at the ${minUnit}px floor`
      : `${count} units need ${neededRowPx}px > zone ${zone.width}px even at ` +
        `the ${minUnit}px floor`;

  return {
    unit: minUnit,
    gap,
    positions: [],
    rows: triedRows,
    fits: false,
    overflowReason,
  };
}

/**
 * Build the centered/anchored positions for a resolved (rows × perRow) grid.
 * Each row is filled left-to-right; the LAST row may be short. The whole block
 * (all rows) is anchored in the zone per `align`. Returns CENTERS in canvas
 * coords, length === count.
 */
function buildResult(
  zone: ZoneRect,
  count: number,
  rows: number,
  unit: number,
  gap: number,
  align: "center" | "start",
): FitResult {
  const perRow = Math.ceil(count / rows);
  const blockHeight = rows * unit + (rows - 1) * gap;

  // Vertical origin of the FIRST row's top edge.
  const blockTop =
    align === "center"
      ? zone.y + (zone.height - blockHeight) / 2
      : zone.y;

  const positions: {x: number; y: number}[] = [];
  let placed = 0;
  for (let r = 0; r < rows; r += 1) {
    const remaining = count - placed;
    const inThisRow = Math.min(perRow, remaining);
    const rowWidth = inThisRow * unit + (inThisRow - 1) * gap;
    const rowLeft =
      align === "center"
        ? zone.x + (zone.width - rowWidth) / 2
        : zone.x;
    const cy = blockTop + r * (unit + gap) + unit / 2;
    for (let i = 0; i < inThisRow; i += 1) {
      positions.push({
        x: rowLeft + i * (unit + gap) + unit / 2,
        y: cy,
      });
    }
    placed += inThisRow;
  }

  return {unit, gap, positions, rows, fits: true};
}

/**
 * Derive a single CLUSTER's bounding budget from a zone. A cluster component
 * renders its own multiplicity, so it takes a budget (width/height + maxUnit),
 * not positions. `maxUnit` defaults to sizing.teachingUnit.target; `pad` insets
 * the zone on all sides (default 0). Pure & deterministic.
 */
export function clusterBudget(
  zone: ZoneRect,
  opts: {maxUnit?: number; pad?: number} = {},
): ClusterFit {
  const pad = opts.pad ?? 0;
  const maxUnit = opts.maxUnit ?? sizing.teachingUnit.target;
  return {
    width: Math.max(0, zone.width - 2 * pad),
    height: Math.max(0, zone.height - 2 * pad),
    maxUnit,
  };
}

/**
 * Split a zone into `parts` equal sub-zones along `axis` (default "x"),
 * separated by `gap` (default sizing.separationGapMin). Used when multiple
 * clusters share one zone (e.g. part-whole's two clusters). The sub-zones tile
 * the zone EXACTLY: sum(sub-widths) + (parts-1)*gap === zone.width (axis "x"),
 * or the height equivalent for axis "y". Pure & deterministic. parts<=0 → [].
 */
export function splitZone(
  zone: ZoneRect,
  parts: number,
  opts: {gap?: number; axis?: "x" | "y"} = {},
): ZoneRect[] {
  if (parts <= 0) {
    return [];
  }
  const gap = opts.gap ?? sizing.separationGapMin;
  const axis = opts.axis ?? "x";

  const out: ZoneRect[] = [];
  if (axis === "x") {
    const subWidth = (zone.width - (parts - 1) * gap) / parts;
    for (let i = 0; i < parts; i += 1) {
      out.push({
        x: zone.x + i * (subWidth + gap),
        y: zone.y,
        width: subWidth,
        height: zone.height,
      });
    }
  } else {
    const subHeight = (zone.height - (parts - 1) * gap) / parts;
    for (let i = 0; i < parts; i += 1) {
      out.push({
        x: zone.x,
        y: zone.y + i * (subHeight + gap),
        width: zone.width,
        height: subHeight,
      });
    }
  }
  return out;
}
