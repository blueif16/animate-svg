// kptest-fenyuhe-six — bbox manifest (W4a composer-owned).
// Imports layout constants and the reconciled cues; bboxAt per load-bearing
// element. Single source of truth for `npm run lesson:check`.

import type { Bbox, ZoneName } from "../manifestTypes";
import {
  ANNOUNCE_BOND_ONE_AND_FIVE_DURATION_FRAMES,
  ANNOUNCE_TITLE_DURATION_FRAMES,
  BOND_GLYPH_TARGET_SIZE,
  BOND_GLYPH_X,
  BOND_GLYPH_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CONSERVE_ONE_FIVE_BOND_HE_DURATION_FRAMES,
  CONSERVE_THREE_THREE_BOND_HE_DURATION_FRAMES,
  CONSERVE_TWO_FOUR_BOND_HE_DURATION_FRAMES,
  LEARNER_RESPONSE_QUESTION_DISPLAY_FRAMES,
  REVEAL_ANSWER_THREE_THREE_DISPLAY_FRAMES,
  RECAP_BEAT_ONE_AND_FIVE_FRAMES,
  RECAP_BEAT_THREE_AND_THREE_FRAMES,
  RECAP_BEAT_TWO_AND_FOUR_FRAMES,
  RECAP_BEAT_Y,
  RECAP_DOT_SIZE,
  SPLIT_THREE_THREE_BOND_THREE_AND_THREE_DURATION_FRAMES,
  SPLIT_TWO_FOUR_BOND_TWO_AND_FOUR_DURATION_FRAMES,
  TITLE_TARGET_SIZE,
  TITLE_X,
  TITLE_Y,
  ZONE_LABELS,
  ZONE_OBJECTS,
  ZONE_QUESTION,
  ZONE_RECAP_ROW,
  ZONE_TITLE,
  getRecapBeatX,
} from "./layout";
import { kptestFenyuheSixCues } from "../kptestFenyuheSixLessonTimeline";

// ---------------------------------------------------------------------------
// Cue lookup. Helpers in this file only ever consult the reconciled timeline.
// ---------------------------------------------------------------------------

const cueOf = (id: string) => {
  const c = kptestFenyuheSixCues.find((cue) => cue.id === id);
  if (!c) {
    throw new Error(`kptest-fenyuhe-six manifest: unknown cue "${id}"`);
  }
  return c;
};

// ---------------------------------------------------------------------------
// Per-element bboxAt functions. Each is a pure function of the master
// timeline frame; the bbox is [x, y, width, height] in composition pixel
// space. Returns null when the element is not mounted at this frame.
// ---------------------------------------------------------------------------

// Six dots (cues 1-8 main scene). bboxAt returns ZONE_OBJECTS, narrowed to
// the actual cluster envelope (the cluster's bounding box) when in a split
// layout, or the whole row when in WHOLE. The element is HIDDEN during
// cue-announce-split-1of5's title + bond phases (per the announce-topic +
// model-target-slow "nothing on top" requirements). It is also HIDDEN during
// the recap (cue-spaced-recap-all-three) where the recap sub-beats take
// over zone-objects.
function sixDotsBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  // The recap hides the main six dots; the recap sub-beats are the load-
  // bearing element in zone-objects for cue 9.
  const recap = cueOf("cue-spaced-recap-all-three");
  if (frame >= recap.startFrame) {
    return null;
  }

  // cue-announce-split-1of5 phases 1+2 (title + bond): dots not yet visible.
  const announce = cueOf("cue-announce-split-1of5");
  if (
    frame >= announce.startFrame &&
    frame < announce.startFrame +
      ANNOUNCE_TITLE_DURATION_FRAMES +
      ANNOUNCE_BOND_ONE_AND_FIVE_DURATION_FRAMES
  ) {
    return null;
  }

  // All other cues (and the motion phase of cue 1): dots are visible.
  // Approximate the bbox as ZONE_OBJECTS — the actual cluster envelope
  // is a subset of this zone, so a tight bbox would over-constrain the
  // collision check. The measured pass refines this if needed.
  const zone = ZONE_OBJECTS;
  return {
    bbox: [zone.x, zone.y, zone.width, zone.height],
    opacity: 1,
  };
}

// Bond glyph (visible during the bond phase of each modeling/conservation
// cue, AND during the bond+split phase of cue 1). Hidden elsewhere.
function bondGlyphBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  // Define each cue's bond-visible window (cue-relative start, duration).
  const windows: Array<{
    cueId: string;
    start: number;
    duration: number;
  }> = [
    {
      cueId: "cue-announce-split-1of5",
      start: ANNOUNCE_TITLE_DURATION_FRAMES,
      duration: ANNOUNCE_BOND_ONE_AND_FIVE_DURATION_FRAMES,
    },
    {
      cueId: "cue-conserve-1of5",
      start: 0,
      duration: CONSERVE_ONE_FIVE_BOND_HE_DURATION_FRAMES,
    },
    {
      cueId: "cue-split-2of4",
      start: 0,
      duration: SPLIT_TWO_FOUR_BOND_TWO_AND_FOUR_DURATION_FRAMES,
    },
    {
      cueId: "cue-conserve-2of4",
      start: 0,
      duration: CONSERVE_TWO_FOUR_BOND_HE_DURATION_FRAMES,
    },
    {
      cueId: "cue-split-3of3",
      start: 0,
      duration: SPLIT_THREE_THREE_BOND_THREE_AND_THREE_DURATION_FRAMES,
    },
    {
      cueId: "cue-conserve-3of3",
      start: 0,
      duration: CONSERVE_THREE_THREE_BOND_HE_DURATION_FRAMES,
    },
  ];

  for (const w of windows) {
    const cue = cueOf(w.cueId);
    const from = cue.startFrame + w.start;
    const to = from + w.duration;
    if (frame >= from && frame < to) {
      // Bond glyph is a square of size BOND_GLYPH_TARGET_SIZE centered on
      // (BOND_GLYPH_X, BOND_GLYPH_Y). The actual rendered text width may
      // be narrower (textNode width depends on glyph count), but the bbox
      // is the canonical size — the manifest gives a generous envelope so
      // it doesn't false-flag on the measured pass.
      const size = BOND_GLYPH_TARGET_SIZE;
      return {
        bbox: [
          BOND_GLYPH_X - size / 2,
          BOND_GLYPH_Y - size / 2,
          size,
          size,
        ],
        opacity: 1,
      };
    }
  }
  return null;
}

// Title "6的分与合" — visible during the title phase of cue-announce-split-1of5.
function titleBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  const cue = cueOf("cue-announce-split-1of5");
  if (
    frame < cue.startFrame ||
    frame >= cue.startFrame + ANNOUNCE_TITLE_DURATION_FRAMES
  ) {
    return null;
  }
  const size = TITLE_TARGET_SIZE;
  return {
    bbox: [TITLE_X - size / 2, TITLE_Y - size / 2, size, size],
    opacity: 1,
  };
}

// Question prompt "6可以分成几和几?" — visible during the question display
// phase of cue-learner-response-gap. Held through the entire gap window
// (the silence is the SIGNAL; the prompt label stays as the "your turn"
// affordance per the learner-response-gap composition rule).
function questionPromptBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  const cue = cueOf("cue-learner-response-gap");
  if (frame < cue.startFrame || frame >= cue.endFrame) {
    return null;
  }
  // Generous bbox — the text is "6可以分成几和几?" (8 chars), ~ width=480 at
  // 60px text size. The manifest uses the zone bounding box.
  const zone = ZONE_QUESTION;
  return {
    bbox: [zone.x, zone.y, zone.width, zone.height],
    opacity: 1,
  };
}

// Recap sub-beats — one bbox per sub-beat, visible only when its index is
// at or below currentHighlight. The current highlight is the ACTIVE sub-beat
// index, derived from the cue-relative frame.
function recapBeatBbox(beatIndex: 0 | 1 | 2) {
  return (
    frame: number,
  ): { bbox: Bbox; opacity: number } | null => {
    const cue = cueOf("cue-spaced-recap-all-three");
    if (frame < cue.startFrame || frame >= cue.endFrame) {
      return null;
    }
    // Active sub-beat from cue-relative frame.
    const local = frame - cue.startFrame;
    let active = 0;
    if (local < RECAP_BEAT_ONE_AND_FIVE_FRAMES) {
      active = 0;
    } else if (
      local <
      RECAP_BEAT_ONE_AND_FIVE_FRAMES + RECAP_BEAT_TWO_AND_FOUR_FRAMES
    ) {
      active = 1;
    } else {
      active = 2;
    }
    // The recap renders indices <= active (already-shown are dimmed; later
    // are not rendered). For collision-check purposes every visible sub-beat
    // reports a bbox.
    if (beatIndex > active) {
      return null;
    }
    const cx = getRecapBeatX(beatIndex);
    const cy = RECAP_BEAT_Y;
    // Sub-beat envelope: 6 recap dots + cluster gap. A square of side
    // ~2 × (cluster span / 2 + 30) centered on (cx, cy).
    const halfWidth = (3 * RECAP_DOT_SIZE + 2 * 8 + 28) / 2 + 24;
    return {
      bbox: [cx - halfWidth, cy - halfWidth, halfWidth * 2, halfWidth * 2],
      opacity: beatIndex === active ? 1 : 0.3,
    };
  };
}

// ---------------------------------------------------------------------------
// Manifest — the LESSON_MANIFEST contract.
// ---------------------------------------------------------------------------

export const LESSON_MANIFEST = {
  lessonId: "kptest-fenyuhe-six",
  composition: "CompleteKptestFenyuheSixLesson",
  fps: 30,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  cues: kptestFenyuheSixCues,
  keyFrames: [
    {
      id: "title-only",
      cueId: "cue-announce-split-1of5",
      offset: Math.floor(ANNOUNCE_TITLE_DURATION_FRAMES / 2),
      label: "Title '6的分与合' reads alone (no cast)",
    },
    {
      id: "split-1of5-mid-motion",
      cueId: "cue-announce-split-1of5",
      offset:
        ANNOUNCE_TITLE_DURATION_FRAMES +
        ANNOUNCE_BOND_ONE_AND_FIVE_DURATION_FRAMES +
        15,
      label: "1|5 split mid-motion (dots separating)",
    },
    {
      id: "equal-split-highlight",
      cueId: "cue-reveal-answer",
      offset: Math.floor(REVEAL_ANSWER_THREE_THREE_DISPLAY_FRAMES / 2),
      label: "3|3 revealed with single transient sunshine highlight",
    },
    {
      id: "learner-gap-silence",
      cueId: "cue-learner-response-gap",
      offset:
        LEARNER_RESPONSE_QUESTION_DISPLAY_FRAMES +
        Math.floor(60),
      label: "Held silence (≥3s) — child recalls the splits",
    },
    {
      id: "recap-3of3-active",
      cueId: "cue-spaced-recap-all-three",
      offset:
        RECAP_BEAT_ONE_AND_FIVE_FRAMES +
        RECAP_BEAT_TWO_AND_FOUR_FRAMES +
        Math.floor(RECAP_BEAT_THREE_AND_THREE_FRAMES / 2),
      label: "Recap: 3|3 active (highlighted, 1|5 and 2|4 dimmed)",
    },
  ],
  elements: [
    {
      id: "six-dots",
      zone: "objects" as const,
      bboxAt: sixDotsBbox,
    },
    {
      id: "bond-glyph",
      zone: "labels" as const,
      bboxAt: bondGlyphBbox,
    },
    {
      id: "title",
      zone: "labels" as const,
      bboxAt: titleBbox,
    },
    {
      id: "question-prompt",
      zone: "labels" as const,
      bboxAt: questionPromptBbox,
    },
    {
      id: "recap-beat-1-5",
      zone: "objects" as const,
      bboxAt: recapBeatBbox(0),
    },
    {
      id: "recap-beat-2-4",
      zone: "objects" as const,
      bboxAt: recapBeatBbox(1),
    },
    {
      id: "recap-beat-3-3",
      zone: "objects" as const,
      bboxAt: recapBeatBbox(2),
    },
  ],
  zones: {
    title: [ZONE_TITLE.x, ZONE_TITLE.y, ZONE_TITLE.width, ZONE_TITLE.height],
    labels: [ZONE_LABELS.x, ZONE_LABELS.y, ZONE_LABELS.width, ZONE_LABELS.height],
    objects: [
      ZONE_OBJECTS.x,
      ZONE_OBJECTS.y,
      ZONE_OBJECTS.width,
      ZONE_OBJECTS.height,
    ],
    question: [
      ZONE_QUESTION.x,
      ZONE_QUESTION.y,
      ZONE_QUESTION.width,
      ZONE_QUESTION.height,
    ],
    recapRow: [
      ZONE_RECAP_ROW.x,
      ZONE_RECAP_ROW.y,
      ZONE_RECAP_ROW.width,
      ZONE_RECAP_ROW.height,
    ],
  },
};

// Re-export for type-narrowing callers.
export type { Bbox, ZoneName };
