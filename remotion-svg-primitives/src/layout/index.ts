// Public barrel for the auto-size-to-zone layout helpers. Later phases (scene
// + manifest) import from "../layout" so both call the SAME pure size math.
export type {ZoneRect, FitOpts, FitResult, ClusterFit} from "./fitToZone";
export {fitUnitsToZone, clusterBudget, splitZone} from "./fitToZone";
