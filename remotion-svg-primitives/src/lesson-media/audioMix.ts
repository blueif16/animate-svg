import { interpolate } from "remotion";

/**
 * Lesson-agnostic audio-mix constants + the deterministic music-bed volume
 * envelope. Every value here is a mix constant, never a per-lesson choice.
 *
 * Numbers are sourced (cross-validated across ~8 sources) in
 * `research/music-sound-design.md` §2.1. Integration design:
 * `docs/proposals/sound-layer-integration.md`.
 *
 * dBFS → linear ≈ 10^(dB/20). Linear gains live in [0, 1].
 */

/** Un-ducked bed level (~ -20 dBFS) — in narration gaps / intro / outro. */
export const BED_UNDUCKED_LINEAR = 0.1;

/**
 * Multiplier applied to the un-ducked level under narration (≈ -20 dB duck).
 * The voice is the lesson — keep the bed unmistakably beneath it. (Placeholder
 * beds are raw tones with energy in the speech band, so we duck deeper than the
 * research's -14 dB; EQ-carved real beds per _SOURCING.md can relax this.)
 */
export const DUCK_FACTOR = 0.1;

/** Default SFX peak (~ -18..-20 dB) — below narration; SFX do NOT duck. */
export const SFX_DEFAULT_LINEAR = 0.4;

/** Duck ramp DOWN into a narration window: 10 frames (0.33s @30fps). */
export const DUCK_ATTACK_FRAMES = 10;

/** Duck ramp UP after a narration window: 15 frames (0.5s @30fps). */
export const DUCK_RELEASE_FRAMES = 15;

/** Lesson-edge fade in/out: 22 frames (0.75s @30fps). */
export const EDGE_FADE_FRAMES = 22;

/** A narration window, in composition frames (from ASR spans / cues). */
export type NarrationWindow = { nStart: number; nEnd: number };

/**
 * Deterministic bed volume at `frame`. Starts at the un-ducked level and
 * multiplies DOWN through every narration window, then applies the lesson-edge
 * fade. The product-over-windows form means overlapping or back-to-back windows
 * compose correctly and the bed only rises in the gaps between narration.
 *
 * Pure function of known frame numbers → reproducible across re-renders (no live
 * sidechain). See `research/music-sound-design.md` §2.2.
 *
 * @param frame   current composition frame
 * @param windows narration windows in FRAMES (composition-absolute)
 * @param total   total composition frames (from the reconciled timeline)
 */
export function bedVolume(
  frame: number,
  windows: NarrationWindow[],
  total: number,
): number {
  let v = BED_UNDUCKED_LINEAR;

  for (const { nStart, nEnd } of windows) {
    v *= interpolate(
      frame,
      [nStart - DUCK_ATTACK_FRAMES, nStart, nEnd, nEnd + DUCK_RELEASE_FRAMES],
      [1, DUCK_FACTOR, DUCK_FACTOR, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }

  // Lesson-edge fade (0.75s in at the start, 0.75s out at the end).
  v *= interpolate(
    frame,
    [0, EDGE_FADE_FRAMES, total - EDGE_FADE_FRAMES, total],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return v;
}

/** Convert `voiceoverSpans` ([start, end] frame tuples) to `NarrationWindow[]`. */
export function spansToWindows(
  spans: ReadonlyArray<readonly [number, number]>,
): NarrationWindow[] {
  return spans.map(([nStart, nEnd]) => ({ nStart, nEnd }));
}
