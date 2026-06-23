// manifest.ts — METADATA-ONLY (Batch 5 manifest auto-derive).
//
// The manifest no longer mirrors the scene's geometry. It declares ONLY which
// elements are load-bearing and their zone; the measured verification pass
// (`lesson:check --measured`) derives each element's TRUE box from the rendered
// scene via getBBox. One source of geometry truth: layout.ts feeds the SCENE,
// and the box is read back off the render — never hand-ported into a `bboxAt`.
//
// Contract: every `{ id, zone }` here is tagged with `measureProps("<id>")` on
// exactly one outermost `<g>` in the scene (bijection — the measured pass fails
// if a declared id is never measured, or a measured id is undeclared).
//
// Registered = the load-bearing teaching marks (visual-design §3 Visual
// Contract). Decoration — pulse rings, the your-turn cue, the recap spotlight —
// is NOT registered and carries no measure tag (it lives outside measured
// groups; tagging it would inflate a load-bearing box → phantom collisions).

import type { LessonManifest } from "../manifestTypes";
import { kptestCompareMoreFewerCues } from "../kptestCompareMoreFewerLessonTimeline";
import * as L from "./layout";

export const LESSON_MANIFEST: LessonManifest = {
  lessonId: "kptest-compare-more-fewer",
  composition: "CompleteKptestCompareMoreFewerLesson",
  fps: L.FPS,
  width: L.CANVAS_W,
  height: L.CANVAS_H,
  cues: kptestCompareMoreFewerCues,
  elements: [
    { id: "introCard", zone: "labels" },
    { id: "topRow", zone: "objects" },
    { id: "bottomRow", zone: "objects" },
    { id: "pairLines", zone: "marks" }, // connectors trace over the dots (marks∩objects allowed)
    { id: "surplusGhosts", zone: "marks" }, // dashed "no partner" annotation over the picture
    { id: "comparisonSymbol", zone: "labels" },
    { id: "phraseRow", zone: "labels" },
    { id: "amountTags", zone: "labels" },
    { id: "recapPhrase", zone: "labels" }, // the retrieved utterance row during recap
  ],
};
