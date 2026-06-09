import type React from "react";

// The uniform per-lesson registration descriptor. Every Complete<Pascal>Lesson.tsx that is
// finished and renderable exports `export const lessonComposition: LessonComposition = {...}`.
// The lesson-registry generator (scripts/build-lesson-registry.mjs) statically discovers every
// file that exports this symbol and emits _lessonRegistry.generated.tsx; Root.tsx maps over it.
//
// WHY THIS EXISTS: the composer (Wave 4a) must NOT hand-edit the shared src/Root.tsx +
// src/Composition.tsx registration lists — under worktree-isolated parallel runs those shared
// files are the merge-conflict surface. A lesson that only writes its OWN disjoint files
// (Complete<X>Lesson.tsx + scene + timeline + generated modules) merges back as a conflict-free
// union; registration is DISCOVERED, not appended. A half-built lesson that has not yet exported
// `lessonComposition` is simply not imported, so broken WIP never breaks the bundle.
export type LessonComposition = {
  /** Remotion composition id — conventionally the component name, e.g. "CompleteKp4MakeTenLesson". */
  id: string;
  component: React.FC<Record<string, unknown>>;
  /** Total frames — read from the lesson's reconciled timeline module (never a literal). */
  durationInFrames: number;
  defaultProps?: Record<string, unknown>;
  /** Optional overrides; default to the shared video dims (theme.video) when omitted. */
  width?: number;
  height?: number;
  fps?: number;
};
