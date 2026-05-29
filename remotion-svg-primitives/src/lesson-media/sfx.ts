import { mediaSrc } from "./mediaSrc";
import { SFX_DEFAULT_LINEAR } from "./audioMix";

/**
 * Lesson-agnostic SFX vocabulary + registry. Sound keys are stable; the
 * composer references them by name from `audio-cues.json` and supplies the
 * FRAME (cue-relative) itself — never a frame literal here.
 *
 * Assets are author-time WAVs under `public/audio/_sfx/` (NOT committed yet —
 * see `docs/proposals/sound-layer-integration.md` §5). SFX sit below narration
 * and do NOT duck. Vocabulary + levels: `research/music-sound-design.md` §2.4.
 */

/** The motivated-SFX vocabulary mapped to existing motion primitives. */
export type SfxSound = "pop" | "chime" | "whoosh" | "tick" | "ta-da";

type SfxAsset = {
  /** public-relative path, resolved through `mediaSrc`. */
  file: string;
  /** default linear peak (0..1), below narration. */
  volume: number;
};

export const SFX_REGISTRY: Record<SfxSound, SfxAsset> = {
  pop: { file: "audio/_sfx/pop.wav", volume: SFX_DEFAULT_LINEAR },
  chime: { file: "audio/_sfx/chime.wav", volume: SFX_DEFAULT_LINEAR * 0.85 },
  // whoosh is low-passed at author-time and sits a touch quieter (~-15 dB).
  whoosh: { file: "audio/_sfx/whoosh.wav", volume: SFX_DEFAULT_LINEAR * 0.75 },
  tick: { file: "audio/_sfx/tick.wav", volume: SFX_DEFAULT_LINEAR * 0.7 },
  "ta-da": { file: "audio/_sfx/ta-da.wav", volume: SFX_DEFAULT_LINEAR },
};

/** Resolve a sound key to its static asset URL. */
export const sfxSrc = (sound: SfxSound): string =>
  mediaSrc(SFX_REGISTRY[sound].file);

/** Default linear volume for a sound key. */
export const sfxDefaultVolume = (sound: SfxSound): number =>
  SFX_REGISTRY[sound].volume;

/**
 * Semitone offset → `playbackRate` for pitch-shifted one-shots (the
 * rising-pitch-per-count-step effect). Remotion `playbackRate` resamples, so a
 * higher rate raises pitch. +12 semitones = one octave = rate 2.
 */
export const semitonesToPlaybackRate = (semitones: number): number =>
  Math.pow(2, semitones / 12);
