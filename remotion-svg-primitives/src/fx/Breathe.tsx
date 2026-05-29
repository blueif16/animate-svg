import { useCurrentFrame, useVideoConfig } from "remotion";

type BreatheProps = {
  /** Anchor — child scales around this point. */
  originX: number;
  originY: number;
  /**
   * Cycle length in frames. If omitted, derived from `bpm` (default 15bpm).
   * Provided for backwards compatibility with the original API.
   */
  cycleFrames?: number;
  /**
   * Cycles per minute. Default 15bpm (one breath every 4s) — the calm end of
   * the AnimSchool / MoCap "moving hold" breathing range (15–25 bpm). Ignored
   * if `cycleFrames` is explicitly set.
   */
  bpm?: number;
  /**
   * Peak scale at the inhale crest, expressed as the absolute multiplier
   * (e.g. 1.035 = 3.5% bigger). Legacy API; prefer `amplitudeScale`.
   */
  amplitude?: number;
  /**
   * Peak scale DELTA — fraction above 1.0 at the inhale crest. 0.005 = 0.5%,
   * the kid-eye threshold (research/ai-coordinated-voice-and-visual-2026-05-28
   * §2a; rule #6). If both `amplitude` and `amplitudeScale` are provided,
   * `amplitudeScale` wins.
   */
  amplitudeScale?: number;
  /**
   * Starting phase offset in frames. Stagger multiple primitives by varying
   * this so they don't breathe in unison. Provided for back-compat — prefer
   * `phaseSeed`.
   */
  phaseOffset?: number;
  /**
   * Seed string or number — hashed to a deterministic phase offset so two
   * groups breathing at the same rate are visibly out of sync. Cheaper to
   * specify than hand-picked `phaseOffset` values. Ignored if `phaseOffset`
   * is explicitly set.
   */
  phaseSeed?: string | number;
  /**
   * Optional vertical drift in viewBox units at the breath crest. Adds a
   * sinusoidal y-translation in addition to the scale pulse. 0.5–1.5 maps
   * to MoCap's 1–2cm chest travel at kid-eye SVG scale. Default 0 (off).
   */
  drift?: number;
  children: React.ReactNode;
};

/**
 * Hash a string/number seed to a stable integer in [0, 1023]. Used to spread
 * `phaseSeed` values across the breath cycle so co-rendered groups don't sync.
 */
const hashSeed = (seed: string | number): number => {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h & 1023;
};

/**
 * Wraps children with a slow sinusoidal scale pulse (and optional y-drift)
 * around (originX, originY). Looks like idle breathing on a resting primitive —
 * the "moving hold" of the 12-principles canon (AnimSchool §2a). Use to make
 * a paused scene feel alive without changing identity.
 *
 * Default rate 15bpm + amplitudeScale 0.005 is below kids-eye's "do not
 * deform identity" threshold. Stagger phase across multiple breathing
 * primitives with `phaseSeed` so they don't sync.
 *
 * Frame-keyed: same composition frame → same scale, deterministic across
 * renders.
 */
export const Breathe = ({
  originX,
  originY,
  cycleFrames,
  bpm = 15,
  amplitude,
  amplitudeScale,
  phaseOffset,
  phaseSeed,
  drift = 0,
  children,
}: BreatheProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cycle length — explicit `cycleFrames` wins for back-compat, else derive
  // from `bpm` at the composition's fps.
  const cycle =
    cycleFrames !== undefined && cycleFrames > 0
      ? cycleFrames
      : Math.max(1, Math.round((60 / Math.max(1, bpm)) * fps));

  // Amplitude — `amplitudeScale` wins (modern API). Legacy `amplitude` is
  // an absolute multiplier; convert to delta. Default to kid-eye 0.5%.
  const amp =
    amplitudeScale !== undefined
      ? amplitudeScale
      : amplitude !== undefined
        ? amplitude - 1
        : 0.005;

  // Phase offset — explicit `phaseOffset` wins, else hash seed across cycle.
  const offset =
    phaseOffset !== undefined
      ? phaseOffset
      : phaseSeed !== undefined
        ? hashSeed(phaseSeed) % cycle
        : 0;

  const phase = (((frame + offset) % cycle) / cycle) * Math.PI * 2;
  const sin = Math.sin(phase);
  // Map sin(-1..1) → scale (1 .. 1+amp). Mean scale = 1 + amp/2, peak = 1+amp.
  const scale = 1 + amp * sin * 0.5 + amp * 0.5;
  const dy = drift * sin;

  return (
    <g
      transform={`translate(${originX} ${originY + dy}) scale(${scale}) translate(${-originX} ${-originY})`}
    >
      {children}
    </g>
  );
};
