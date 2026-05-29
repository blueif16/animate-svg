import type { SfxSound } from "./sfx";

/**
 * Schema for `lesson-data/<id>/audio-cues.json` — the authored CREATIVE sound
 * manifest. It is SEMANTIC, not frame-bearing: it declares moods, asset keys,
 * and which beats are sonified. The composer maps each `event` to its own motion
 * frame. See `docs/proposals/sound-layer-integration.md` §3.
 */

/** Semantic motion beats the composer can sonify (maps to existing primitives). */
export type SfxEventType = "popin" | "count" | "transition" | "reward";

export type AudioCueSfx = {
  /** cue id (key into the reconciled `<X>Cues`). */
  cue: string;
  /** semantic beat; the composer maps this to its motion frame. */
  event: SfxEventType;
  /** sound key into the SFX registry. */
  sound: SfxSound;
  /** count beats: one tick per counted item. */
  perStep?: boolean;
  /** count beats: ascend pitch per step (auditory magnitude; [ASSUMED] — validate). */
  risingPitch?: boolean;
};

export type AudioCues = {
  lessonId: string;
  /** bed key into `public/audio/_beds/`. */
  bed: string;
  /** pinyin/tone lessons: flat pad bed + no melodic motif under narration. */
  toneSafe?: boolean;
  /** optional intro sting key into `public/audio/_stings/`. */
  intro?: { sting?: string };
  /** bed rises to full as the last narration ends. */
  outro?: { resolve?: boolean };
  sfx: AudioCueSfx[];
};
