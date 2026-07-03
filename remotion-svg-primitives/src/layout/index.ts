// Public barrel for the layout helpers. Two concerns live here:
//  - auto-size-to-zone: PURE size math for countable UNITS (fitToZone).
//  - fitText: the SINGLE measured TEXT-fitting module (CJK-aware, role-floor
//    clamped, font-gated). Its pure wrap/clamp core is DOM-free; the production
//    glue (measureWithFont / useFontGate) only touches the browser when called.
// Later phases (scene + manifest) import from "../layout" so both call the SAME
// helpers.
export type {ZoneRect, FitOpts, FitResult, ClusterFit} from "./fitToZone";
export {fitUnitsToZone, clusterBudget, splitZone} from "./fitToZone";

export type {
  TextRole,
  Segment,
  MeasureFn,
  FontStyle,
  FitTextBoxOptions,
  FitTextBoxResult,
  FitTextLineOptions,
  FitTextLineResult,
} from "./fitText";
export {
  REFERENCE_WIDTH,
  ROLE_FLOORS,
  DEFAULT_LINE_HEIGHT,
  roleFloorPx,
  isCJK,
  segmentText,
  wrapSegments,
  fitTextBox,
  fitTextLine,
  measureWithFont,
  useFontGate,
} from "./fitText";
