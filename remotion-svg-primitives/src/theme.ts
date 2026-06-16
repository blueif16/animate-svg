export const colors = {
  cream: "#FFF7E6",
  paleCream: "#FFF1C7",
  sunshine: "#FFD85A",
  coral: "#FF8A65",
  sky: "#5EC8F8",
  mint: "#66DDAA",
  lavender: "#BFA7FF",
  reward: "#FFB84D",
  textNavy: "#24324B",
  softGrayBlue: "#6B7280",
  white: "#FFFFFF",
} as const;

export const video = {
  width: 1280,
  height: 720,
  fps: 30,
  sceneDuration: 140,
  showcaseDuration: 420,
} as const;

export const typography = {
  fontFamily:
    '"Arial Rounded MT Bold", "Avenir Next", "Trebuchet MS", "PingFang SC", ui-rounded, system-ui, sans-serif',
} as const;

export const shadows = {
  soft: "0 18px 40px rgba(36, 50, 75, 0.12)",
  small: "0 8px 18px rgba(36, 50, 75, 0.1)",
} as const;

// Sizing standard for the FIXED 1280x720 canvas — research/gallery-sizing-standard-2026-06-14.md.
// The whole scene renders through ONE viewBox="0 0 1280 720" root and scales
// uniformly, so every value here is in canvas USER UNITS (== px at 1x) and
// survives any upscale with zero relative-size drift. `minFontPx` is the
// legibility FLOOR any glyph a child must READ has to clear: 36 = 5.0% of frame
// height, ~1.8x the Latin broadcast minimum to honor the CJK-must-be-larger rule
// (ASA/BCAP, BBC, EBU R95/SMPTE). Reach for a named `typeScale`/`spacing` step
// instead of a magic number.
export const sizing = {
  minFontPx: 36,
  captionFontPx: 48,
  safeInsetPct: 0.05,
  // 5% graphics-safe rect on the 1280x720 canvas (x, y, w, h in user units).
  safeArea: {x: 64, y: 36, width: 1152, height: 648},
  // 1.25 major-third type ramp (canvas units).
  typeScale: {label: 36, body: 45, title: 56, display: 70, hero: 88},
  // 8px-base spacing scale.
  spacing: {xs: 8, sm: 16, md: 24, lg: 40, xl: 64},
  // Teaching-unit sizing floors (kids-eye §1), in canvas units on the 720
  // short side. `target` = the focal size a single teaching mark renders at
  // (13.3% of 720); `min` = the legibility floor a fitted unit may shrink to
  // (12% of 720); `hardMin` = the absolute ≥8% floor (58px) below which a mark
  // reads as noise. fitUnitsToZone shrinks from target toward min, never below.
  teachingUnit: {target: 96, min: 86, hardMin: 58},
  // Minimum readable gap between two co-present clusters when an object SPLITS
  // (6% of 720) — below this they read as one blob (kids-eye §1).
  separationGapMin: 43,
} as const;
