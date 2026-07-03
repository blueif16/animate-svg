// Cue-id accessor factory — the ONE place a lesson resolves a cue id to a frame.
//
// WHY THIS EXISTS: the pre-existing per-scene helper `const cStart = (id) =>
// c[id]?.startFrame ?? 0` silently substituted frame 0 for a wrong/stale cue id
// (self-scan C3). A wrong id was neither a compile error (`type CueKey = string`)
// nor a runtime error (`?? 0`) — it rendered at frame 0, invisible until a human
// watched the video, and it shipped in the repo's own newest fixture
// (kptest-count-to-two, C2). This factory replaces that fallback with a hard
// THROW that names the missing id AND lists the valid ids.
//
// The generic `Id` parameter carries a lesson's EMITTED cue-id union (e.g.
// `KptestCountToTwoCueId`, derived once in its `<X>LessonTimeline.ts`), so a
// typo is a COMPILE error; a stale-but-well-typed id (present in the union yet
// absent from the reconciled cues) THROWS at runtime. Pass no `validIds` to get
// a runtime-only guard (`Id = string`) whose valid set IS the reconciled cues.
//
// PURE: no fs / network / Date.now. Lesson-agnostic — never hardcodes a cue id.

import type { AlignedLessonCue } from "@studio/narration-kit";
import { cueMap } from "@studio/narration-kit";

export type CueAccessors<Id extends string> = {
  /** startFrame of `id`; THROWS (naming id + valid ids) if `id` is not present. */
  cStart: (id: Id) => number;
  /** endFrame of `id`; THROWS (naming id + valid ids) if `id` is not present. */
  cEnd: (id: Id) => number;
  /** the full cue record for `id`; THROWS if `id` is not present. */
  cueOf: (id: Id) => AlignedLessonCue;
  /** the valid cue-id vocabulary (the emitted union list, else the present ids). */
  cueIds: readonly Id[];
};

export const makeCueAccessors = <Id extends string = string>(
  cues: readonly AlignedLessonCue[],
  validIds?: readonly Id[],
): CueAccessors<Id> => {
  const map = cueMap([...cues]);
  const present = Object.keys(map);
  const resolve = (id: Id): AlignedLessonCue => {
    const cue = map[id];
    if (!cue) {
      throw new Error(
        `[cueAccessors] unknown cue id "${id}". Valid cue ids: ` +
          `${present.join(", ") || "(none — reconciled cues are empty)"}`,
      );
    }
    return cue;
  };
  return {
    cStart: (id) => resolve(id).startFrame,
    cEnd: (id) => resolve(id).endFrame,
    cueOf: resolve,
    cueIds: (validIds ?? (present as Id[])) as readonly Id[],
  };
};
