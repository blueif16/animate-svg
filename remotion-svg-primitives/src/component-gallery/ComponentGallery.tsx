import { AbsoluteFill } from "remotion";
import registry from "../capabilities/primitive-registry.json";
import { FXDefs } from "../fx";
import { colors, typography } from "../theme";
import { demoProps } from "./demoProps";

// =========================================================================
// ComponentGallery — a registry-DRIVEN gallery of every reusable component.
//
// It ENUMERATES from src/capabilities/primitive-registry.json (the source of
// truth) in family order — counting → literacy → interaction → sketch →
// motion → fx — so any future primitive auto-appears here. The registry stores
// only the component NAME (a string); the React prop VALUES live in
// `demoProps.ts`, looked up by `id`. A registry id with no demo entry renders a
// red "UNMAPPED: <id>" cell, so the gallery dogfoods its own completeness.
//
// Layout: a single tall sheet. Each family is a band with a header, then a grid
// of cells (one per component id). Cells are ≥ ~330px wide so glyph + variant
// strip + label stay legible at real render size.
// =========================================================================

const FONT = typography.fontFamily;

// ---- registry shape (only the fields we read) ----
type RegistryEntry = {
  kind?: string;
  id: string;
  component: string;
};

const familyOrder = [
  { key: "counting", label: "Counting & number", accent: colors.sunshine },
  { key: "literacy", label: "Literacy & pinyin", accent: colors.coral },
  { key: "interaction", label: "Interaction & sorting", accent: colors.sky },
  { key: "sketch", label: "Sketch / teacher marks", accent: colors.lavender },
  { key: "motion", label: "Motion components", accent: colors.mint },
  { key: "fx", label: "FX components", accent: colors.reward },
] as const;

type FamilyKey = (typeof familyOrder)[number]["key"];

// Group registry entries into the six families, preserving registry order.
const collectFamily = (key: FamilyKey): RegistryEntry[] => {
  if (key === "motion") {
    return (registry.motionComponents as RegistryEntry[]) ?? [];
  }
  if (key === "fx") {
    return (registry.fxComponents as RegistryEntry[]) ?? [];
  }
  return ((registry.primitives as RegistryEntry[]) ?? []).filter(
    (p) => p.kind === key,
  );
};

// ---- layout constants ----
const CANVAS_WIDTH = 2600;
const PAD_X = 60;
const COLUMNS = 3;
const COL_GAP = 30;
const CELL_W = (CANVAS_WIDTH - PAD_X * 2 - COL_GAP * (COLUMNS - 1)) / COLUMNS;
const CELL_H_NORMAL = 220;
const CELL_H_TALL = 320;
const ROW_GAP = 28;
const BAND_HEADER_H = 86;
const BAND_GAP = 36;
const TOP_TITLE_H = 130;

type PlacedCell = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  mapped: boolean;
};

type PlacedBand = {
  label: string;
  accent: string;
  count: number;
  y: number;
  height: number;
};

// Pack one family's cells into COLUMNS columns, row by row. A row's height is
// the max cell height in that row (tall cells bump their whole row).
const layoutAll = () => {
  const cells: PlacedCell[] = [];
  const bands: PlacedBand[] = [];
  let cursorY = TOP_TITLE_H;

  for (const fam of familyOrder) {
    const entries = collectFamily(fam.key);
    const bandTop = cursorY;
    const headerBottom = bandTop + BAND_HEADER_H;
    let rowTop = headerBottom + 12;

    for (let i = 0; i < entries.length; i += COLUMNS) {
      const rowEntries = entries.slice(i, i + COLUMNS);
      const rowHeight = rowEntries.some((e) => demoProps[e.id]?.tall)
        ? CELL_H_TALL
        : CELL_H_NORMAL;

      rowEntries.forEach((entry, col) => {
        cells.push({
          id: entry.id,
          x: PAD_X + col * (CELL_W + COL_GAP),
          y: rowTop,
          w: CELL_W,
          h: rowHeight,
          mapped: Boolean(demoProps[entry.id]),
        });
      });
      rowTop += rowHeight + ROW_GAP;
    }

    const bandHeight = rowTop - bandTop;
    bands.push({
      label: fam.label,
      accent: fam.accent,
      count: entries.length,
      y: bandTop,
      height: bandHeight,
    });
    cursorY = bandTop + bandHeight + BAND_GAP;
  }

  return { bands, cells, totalHeight: cursorY + 40 };
};

const Cell = ({ cell }: { cell: PlacedCell }) => {
  const demo = demoProps[cell.id];
  const centerX = cell.x + cell.w / 2;
  const centerY = cell.y + cell.h / 2 + 8; // a touch low to leave room for label

  return (
    <g>
      <rect
        fill={cell.mapped ? colors.white : "#FFE2E2"}
        height={cell.h}
        rx={18}
        stroke={cell.mapped ? "#E3E8F0" : colors.coral}
        strokeWidth={cell.mapped ? 2 : 4}
        width={cell.w}
        x={cell.x}
        y={cell.y}
      />
      {/* id label, top-left of cell */}
      <text
        fill={cell.mapped ? colors.textNavy : colors.coral}
        fontFamily={FONT}
        fontSize={22}
        fontWeight={900}
        x={cell.x + 18}
        y={cell.y + 32}
      >
        {cell.id}
      </text>
      {cell.mapped ? (
        <g transform={`translate(${centerX} ${centerY})`}>{demo.render()}</g>
      ) : (
        <text
          dominantBaseline="middle"
          fill={colors.coral}
          fontFamily={FONT}
          fontSize={30}
          fontWeight={900}
          textAnchor="middle"
          x={centerX}
          y={centerY}
        >
          {`UNMAPPED: ${cell.id}`}
        </text>
      )}
    </g>
  );
};

const Band = ({ band }: { band: PlacedBand }) => (
  <g>
    <rect
      fill={band.accent}
      height={56}
      opacity={0.22}
      rx={14}
      width={CANVAS_WIDTH - PAD_X * 2}
      x={PAD_X}
      y={band.y}
    />
    <rect
      fill={band.accent}
      height={56}
      rx={8}
      width={14}
      x={PAD_X + 12}
      y={band.y}
    />
    <text
      dominantBaseline="middle"
      fill={colors.textNavy}
      fontFamily={FONT}
      fontSize={36}
      fontWeight={900}
      x={PAD_X + 42}
      y={band.y + 30}
    >
      {`${band.label}  ·  ${band.count}`}
    </text>
  </g>
);

export const ComponentGallery: React.FC = () => {
  const { bands, cells, totalHeight } = layoutAll();
  const mappedCount = cells.filter((c) => c.mapped).length;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.cream }}>
      <svg
        height={totalHeight}
        viewBox={`0 0 ${CANVAS_WIDTH} ${totalHeight}`}
        width={CANVAS_WIDTH}
      >
        <FXDefs />
        <text
          fill={colors.textNavy}
          fontFamily={FONT}
          fontSize={56}
          fontWeight={900}
          x={PAD_X}
          y={72}
        >
          Component Gallery — registry-driven QC sheet
        </text>
        <text
          fill={colors.softGrayBlue}
          fontFamily={FONT}
          fontSize={26}
          fontWeight={800}
          x={PAD_X}
          y={108}
        >
          {`${cells.length} components from primitive-registry.json · ${mappedCount} mapped · ${cells.length - mappedCount} unmapped`}
        </text>
        {bands.map((band) => (
          <Band band={band} key={band.label} />
        ))}
        {cells.map((cell) => (
          <Cell cell={cell} key={cell.id} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// The gallery still frame: high enough that frame-driven motion/fx (PopIn,
// PulseCircle, Smear, SparkleBurst, GlintFlash, GlowPulse, ShineSweep, Sparkle,
// Breathe, FollowPath/DrawPath/Drag chains) are visibly mid/!-effect, but low
// enough that one-shot bursts have not yet faded out.
export const COMPONENT_GALLERY_STILL_FRAME = 22;
export const componentGalleryDuration = 90;

// Composition canvas size — must equal the SVG so nothing clips. Width is fixed;
// height is derived from the same layout pass the component uses.
export const COMPONENT_GALLERY_WIDTH = CANVAS_WIDTH;
export const COMPONENT_GALLERY_HEIGHT = Math.ceil(layoutAll().totalHeight);
