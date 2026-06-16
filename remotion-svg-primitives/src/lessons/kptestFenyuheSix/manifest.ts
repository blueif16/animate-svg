// kptest-fenyuhe-six — bbox manifest (W4a composer-owned).
// v4 cue-anchored: 6 cues (routine-reprise / split-1-and-5 / split-2-and-4 /
// split-3-and-3 / aggregator-prompt / recap). The 9 visual storyboard beats
// are folded into these 6 cue windows; the echo's held silence lives in
// each split cue's typed `gap: { reason: "learner-response" }`.
//
// Imports layout constants and the reconciled cues; bboxAt per load-bearing
// element. Single source of truth for `npm run lesson:check`.

import type { Bbox } from "../manifestTypes";
import {
  AGGREGATOR_PROMPT_FADE_IN_FRAMES,
  BOND_FADE_IN_FRAMES,
  BOND_FADE_OUT_FRAMES,
  BOND_GLYPH_TARGET_SIZE,
  BOND_GLYPH_X,
  BOND_GLYPH_Y,
  BOND_HOLD_AFTER_SPLIT_FRAMES,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CLIMAX_GLIN_DURATION_FRAMES,
  RECAP_BEAT_ONE_AND_FIVE_FRAMES,
  RECAP_BEAT_THREE_AND_THREE_FRAMES,
  RECAP_BEAT_TWO_AND_FOUR_FRAMES,
  RECAP_BEAT_Y,
  RECAP_DOT_SIZE,
  ROUTINE_REPRISE_TITLE_DURATION_FRAMES,
  SPLIT_MOTION_DURATION_FRAMES,
  SPLIT_START_FRAMES,
  TITLE_TARGET_SIZE,
  TITLE_X,
  TITLE_Y,
  ZONE_CAPTION,
  ZONE_LABELS,
  ZONE_OBJECTS,
  ZONE_PROMPT,
  ZONE_RECAP_ROW,
  ZONE_TITLE,
  dotSize,
  getRecapBeatX,
  sixDotsBboxRect,
  splitCueSchedule,
} from "./layout";
import { kptestFenyuheSixCues } from "../kptestFenyuheSixLessonTimeline";
import { kptestFenyuheSixClips } from "../generated/kptestFenyuheSixClips";

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

const clipOf = (id: string) => {
  const c = kptestFenyuheSixClips.find((x) => x.id === id);
  if (!c) {
    throw new Error(`kptest-fenyuhe-six manifest: unknown clip "${id}"`);
  }
  return c;
};

// ---------------------------------------------------------------------------
// Per-element bboxAt functions. Each is a pure function of the master
// timeline frame; the bbox is [x, y, width, height] in composition pixel
// space. Returns null when the element is not mounted at this frame.
// ---------------------------------------------------------------------------

// Six dots (cues 1-5 main scene). bboxAt returns ZONE_OBJECTS when the
// dots are visible; null otherwise. The recap (cue 6) hides the main six
// dots; the recap sub-beats are the load-bearing element in zone-objects.
function sixDotsBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  const routineReprise = cueOf("routine-reprise");
  const aggregator = cueOf("aggregator-prompt");
  // Dots not yet visible during the title phase of routine-reprise.
  if (
    frame >= routineReprise.startFrame &&
    frame < routineReprise.startFrame + ROUTINE_REPRISE_TITLE_DURATION_FRAMES
  ) {
    return null;
  }
  // Dots hidden during the recap (cue 6); recap sub-beats take over.
  if (frame >= aggregator.endFrame) {
    return null;
  }
  // The six dots' real footprint — the union envelope across all layouts the
  // dots occupy (WHOLE + the three splits), derived in layout.ts from the SAME
  // helper `dotSize` / `dotCenters` the scene renders. Mirrors the scene BY
  // CONSTRUCTION (was the loose full-ZONE_OBJECTS rect).
  return {
    bbox: sixDotsBboxRect,
    opacity: 1,
  };
}

// Bond glyph (visible during the bond phase of each split cue). Hidden
// elsewhere.
function bondGlyphBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  for (const cueId of ["split-1-and-5", "split-2-and-4", "split-3-and-3"]) {
    const cue = cueOf(cueId);
    const clip = clipOf(cueId);
    const schedule = splitCueSchedule(
      cueId,
      cue.endFrame - cue.startFrame,
      clip.narrationFrames,
      cueId === "split-3-and-3",
    );
    const local = frame - cue.startFrame;
    const fadeIn = Math.min(1, local / BOND_FADE_IN_FRAMES);
    const fadeOutStart = schedule.splitEnd + BOND_HOLD_AFTER_SPLIT_FRAMES;
    const fadeOutEnd = fadeOutStart + BOND_FADE_OUT_FRAMES;
    const fadeOut = Math.min(1, (fadeOutEnd - local) / BOND_FADE_OUT_FRAMES);
    const opacity = Math.min(fadeIn, fadeOut);
    if (local < 0 || local >= fadeOutEnd) continue;
    if (opacity <= 0) continue;
    const size = BOND_GLYPH_TARGET_SIZE;
    return {
      bbox: [BOND_GLYPH_X - size / 2, BOND_GLYPH_Y - size / 2, size, size],
      opacity,
    };
  }
  return null;
}

// Title "6的分与合" — visible during the title phase of routine-reprise.
function titleBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  const cue = cueOf("routine-reprise");
  if (
    frame < cue.startFrame ||
    frame >= cue.startFrame + ROUTINE_REPRISE_TITLE_DURATION_FRAMES
  ) {
    return null;
  }
  const size = TITLE_TARGET_SIZE;
  return {
    bbox: [TITLE_X - size / 2, TITLE_Y - size / 2, size, size],
    opacity: 1,
  };
}

// Pointer affordance — visible during the held silence of each split cue.
function pointerBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  for (const cueId of ["split-1-and-5", "split-2-and-4", "split-3-and-3"]) {
    const cue = cueOf(cueId);
    const clip = clipOf(cueId);
    const schedule = splitCueSchedule(
      cueId,
      cue.endFrame - cue.startFrame,
      clip.narrationFrames,
      cueId === "split-3-and-3",
    );
    const local = frame - cue.startFrame;
    const pointerStart =
      schedule.splitEnd + BOND_HOLD_AFTER_SPLIT_FRAMES + BOND_FADE_OUT_FRAMES;
    const pointerEnd = schedule.recombineStart;
    if (local < pointerStart || local >= pointerEnd) continue;
    // Pointer ring is a non-load-bearing "your turn" affordance. The ring
    // sits OVER the held split (the dots are in zone-objects). Manifest
    // zone = "decoration" so the overlap with six-dots is allowed
    // (decoration ∩ objects is in the kit's allow-list).
    const ringR = 200; // QUESTION_PROMPT_RING_RADIUS
    const cx = ZONE_OBJECTS.x + ZONE_OBJECTS.width / 2;
    const cy = ZONE_OBJECTS.y + ZONE_OBJECTS.height / 2;
    return {
      bbox: [cx - ringR, cy - ringR, ringR * 2, ringR * 2],
      opacity: 0.5,
    };
  }
  return null;
}

// Aggregator prompt — visible during the entire aggregator-prompt cue.
// ZONE_PROMPT (y=200-260) sits in the lower half of ZONE_LABELS, ABOVE the
// dot row (ZONE_OBJECTS y=267-520). The prompt and the held whole are
// visually disjoint, so the bbox check passes.
function aggregatorPromptBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  const cue = cueOf("aggregator-prompt");
  if (frame < cue.startFrame || frame >= cue.endFrame) {
    return null;
  }
  const zone = ZONE_PROMPT;
  return {
    bbox: [zone.x, zone.y, zone.width, zone.height],
    opacity: 1,
  };
}

// Recap sub-beats — one bbox per sub-beat, visible only when its index is
// at or below currentHighlight. The current highlight is the ACTIVE sub-
// beat index, derived from the cue-relative frame.
function recapBeatBbox(beatIndex: 0 | 1 | 2) {
  return (
    frame: number,
  ): { bbox: Bbox; opacity: number } | null => {
    const cue = cueOf("recap");
    if (frame < cue.startFrame || frame >= cue.endFrame) {
      return null;
    }
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

// TeacherMark underline — visible only during the climax (split-3-and-3)
// celebration window.
function underlineBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  const cue = cueOf("split-3-and-3");
  if (frame < cue.startFrame || frame >= cue.endFrame) return null;
  const local = frame - cue.startFrame;
  const drawFromCueRel =
    SPLIT_START_FRAMES +
    SPLIT_MOTION_DURATION_FRAMES +
    15; // UNDERLINE_POST_CLIMAX_DWELL_FRAMES
  const drawToCueRel = drawFromCueRel + 24;
  if (local < drawFromCueRel || local > drawToCueRel + 9) return null;
  // Underline span: from the leftmost SPLIT_3_3 dot to the rightmost.
  // Approximate by using the dot row's x-range + the helper-derived dotSize.
  const zoneCx = ZONE_OBJECTS.x + ZONE_OBJECTS.width / 2;
  const clusterHalfSpan =
    3 * dotSize + 2 * 22 + 56; // 3 dots + gaps + cluster gap
  const xLeft = zoneCx - clusterHalfSpan;
  const xRight = zoneCx + clusterHalfSpan;
  const yBottom = ZONE_OBJECTS.y + dotSize / 2 + 18;
  const padY = 6; // strokeWidth (4) + settle pad
  return {
    bbox: [xLeft, yBottom - padY, xRight - xLeft, padY * 2],
    opacity: 0.9,
  };
}

// GlintFlash — single transient at 3|3 cluster center.
function glintFlashBbox(
  frame: number,
): { bbox: Bbox; opacity: number } | null {
  const cue = cueOf("split-3-and-3");
  const start =
    cue.startFrame + SPLIT_START_FRAMES + SPLIT_MOTION_DURATION_FRAMES;
  if (frame < start || frame >= start + CLIMAX_GLIN_DURATION_FRAMES) return null;
  const cx = ZONE_OBJECTS.x + ZONE_OBJECTS.width / 2;
  const cy = ZONE_OBJECTS.y + ZONE_OBJECTS.height / 2;
  const size = 220; // matches the GlintFlash size prop in the scene
  return {
    bbox: [cx - size, cy - size, size * 2, size * 2],
    opacity: 0.6,
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
      cueId: "routine-reprise",
      offset: Math.floor(ROUTINE_REPRISE_TITLE_DURATION_FRAMES / 2),
      label: "Title '6的分与合' reads alone (no cast)",
    },
    {
      id: "split-1of5-mid-motion",
      cueId: "split-1-and-5",
      offset: SPLIT_START_FRAMES + Math.floor(SPLIT_MOTION_DURATION_FRAMES / 2),
      label: "1|5 split mid-motion (dots separating)",
    },
    {
      id: "split-3of3-climax",
      cueId: "split-3-and-3",
      offset: SPLIT_START_FRAMES + Math.floor(SPLIT_MOTION_DURATION_FRAMES / 2),
      label: "3|3 climax split mid-motion (bouncy entrance, GlintFlash at end)",
    },
    {
      id: "aggregator-silence",
      cueId: "aggregator-prompt",
      offset: Math.floor(AGGREGATOR_PROMPT_FADE_IN_FRAMES + 30),
      label: "Held silence ≥4s — child retrieves the SET of splits",
    },
    {
      id: "recap-3of3-active",
      cueId: "recap",
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
      id: "pointer",
      zone: "decoration" as const,
      bboxAt: pointerBbox,
    },
    {
      id: "aggregator-prompt",
      zone: "labels" as const,
      bboxAt: aggregatorPromptBbox,
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
    {
      id: "underline-3of3",
      zone: "marks" as const,
      bboxAt: underlineBbox,
    },
    {
      id: "glint-flash",
      zone: "decoration" as const,
      bboxAt: glintFlashBbox,
    },
  ],
  zones: {
    title: [ZONE_TITLE.x, ZONE_TITLE.y, ZONE_TITLE.width, ZONE_TITLE.height],
    labels: [
      ZONE_LABELS.x,
      ZONE_LABELS.y,
      ZONE_LABELS.width,
      ZONE_LABELS.height,
    ],
    objects: [
      ZONE_OBJECTS.x,
      ZONE_OBJECTS.y,
      ZONE_OBJECTS.width,
      ZONE_OBJECTS.height,
    ],
    prompt: [
      ZONE_PROMPT.x,
      ZONE_PROMPT.y,
      ZONE_PROMPT.width,
      ZONE_PROMPT.height,
    ],
    recapRow: [
      ZONE_RECAP_ROW.x,
      ZONE_RECAP_ROW.y,
      ZONE_RECAP_ROW.width,
      ZONE_RECAP_ROW.height,
    ],
    caption: [ZONE_CAPTION.x, ZONE_CAPTION.y, ZONE_CAPTION.width, ZONE_CAPTION.height],
  },
  allowedOverlaps: [
    // The aggregator prompt's mic glyph sits to the LEFT of the prompt
    // label, both inside ZONE_QUESTION. The two are intentionally in the
    // same zone — they're both inside the affordance composition.
    ["pointer", "six-dots"],
    ["pointer", "bond-glyph"],
  ],
};
