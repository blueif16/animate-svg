// Thin wiring shim. The SFX layer itself lives in `@studio/sound-kit` as
// `SfxLayer`; call sites import it under the `LessonSfxLayer` name plus the
// `SfxEvent` type. This file ALSO owns the concurrent-audio-tag budget: a
// real ceiling browsers (and Remotion's own render pipeline) place on
// simultaneously-decoding <Html5Audio> elements — past it, extra tags
// silently fail to play instead of throwing, so the gap is invisible until a
// human notices a missing sound in the rendered MP4. Lesson-agnostic —
// every lesson's declared SFX schedule is checked against the SAME budget.
// Vendor precedent: github-unwrapped's `MAXIMUM_NUMBER_OF_AUDIO_TAGS`
// module-load assertion + event sampling
// (research/remotion-vendor-best-practices-2026-07-03.md §5 opportunity #8).
import { SfxLayer, type SfxEvent } from "@studio/sound-kit";

export type { SfxEvent };

/**
 * Hard ceiling on simultaneously-audible one-shot SFX.
 */
export const MAX_CONCURRENT_AUDIO = 6;

/**
 * Conservative assumed audible window (frames) for one SFX one-shot, used
 * ONLY to decide whether two events' windows overlap for the concurrency
 * count. Our library's assets are all short stingers/pops/chimes, well
 * under 1s (`@studio/sound-kit/src/sfx.ts` `SFX_REGISTRY`); there is no
 * static per-asset duration available at module-load time (no WAV probing
 * in the browser/bundler), so this is a deliberate, NAMED over-estimate
 * rather than a silent assumption. Pass a per-event `durationFrames` to
 * override.
 */
export const DEFAULT_SFX_WINDOW_FRAMES = 30;

export type BudgetedSfxEvent = SfxEvent & { durationFrames?: number };

/**
 * Throws SYNCHRONOUSLY if the declared SFX schedule would ever have more
 * than `max` one-shots audible at the same frame. Pure + deterministic (no
 * React, no DOM) — call it at the TOP LEVEL of a `Complete<X>Lesson.tsx`
 * module, immediately after building the `sfxEvents` const and BEFORE the
 * component/export:
 *
 *   const sfxEvents: SfxEvent[] = [ ... ];
 *   assertConcurrentAudioBudget(sfxEvents);   // throws AT MODULE LOAD
 *
 * so an over-budget schedule fails the moment the lesson module is
 * imported/bundled — never silently at render, where the browser's own
 * audio engine would just drop the excess tags with no error at all.
 */
export function assertConcurrentAudioBudget(
  events: ReadonlyArray<BudgetedSfxEvent>,
  max: number = MAX_CONCURRENT_AUDIO,
): void {
  if (events.length <= max) return; // fast path — can't possibly exceed max

  const starts = events.map((e) => e.fromFrame);
  const ends = events.map(
    (e) => e.fromFrame + (e.durationFrames ?? DEFAULT_SFX_WINDOW_FRAMES),
  );

  // A concurrency peak always lands on some event's own onset frame, so
  // sampling exactly those frames is sufficient (no need to scan every
  // frame of the composition).
  for (const frame of starts) {
    let active = 0;
    for (let i = 0; i < events.length; i += 1) {
      if (starts[i] <= frame && frame < ends[i]) active += 1;
    }
    if (active > max) {
      throw new Error(
        `[LessonSfxLayer] concurrent-audio budget exceeded: ${active} SFX ` +
          `events overlap at frame ${frame} (MAX_CONCURRENT_AUDIO=${max}). ` +
          `Thin the schedule with sampleAudioEvents(events, ${max}) or raise ` +
          `the budget deliberately with a recorded pipelineFinding.`,
      );
    }
  }
}

/**
 * Deterministic down-sample to at most `max` events, picked at an even
 * stride — never `Math.random()` (Remotion's determinism law) — so a dense
 * schedule (e.g. 100 per-item ticks) reproducibly thins to <= max sounds
 * instead of every one firing and blowing the budget.
 */
export function sampleAudioEvents<T>(
  events: ReadonlyArray<T>,
  max: number,
): T[] {
  if (max <= 0) return [];
  if (events.length <= max) return [...events];
  const stride = events.length / max;
  const sampled: T[] = [];
  for (let i = 0; i < max; i += 1) {
    sampled.push(events[Math.floor(i * stride)]);
  }
  return sampled;
}

export { SfxLayer as LessonSfxLayer };
