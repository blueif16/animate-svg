import { Html5Audio, Sequence } from "remotion";
import {
  SFX_REGISTRY,
  semitonesToPlaybackRate,
  sfxSrc,
  type SfxSound,
} from "./sfx";

/**
 * One motivated SFX one-shot. `fromFrame` is computed by the COMPOSER from
 * `cueFrames(id) + layout.ts` offset constants — NEVER a frame literal here.
 * `semitones` (optional) pitch-shifts via `playbackRate` (rising-pitch counts).
 */
export type SfxEvent = {
  sound: SfxSound;
  fromFrame: number;
  /** override the registry default (linear, 0..1). */
  volume?: number;
  /** semitone pitch offset; omit for none. */
  semitones?: number;
};

/**
 * Renders each SFX event as a one-shot `<Sequence from><Html5Audio/></Sequence>`
 * — the same cue-relative model the composer uses for visuals. SFX do NOT duck.
 * Lesson-agnostic: it takes a pre-computed event list and renders it.
 */
export const LessonSfxLayer = ({ events }: { events: SfxEvent[] }) => (
  <>
    {events.map((e, i) => (
      <Sequence key={`${e.sound}-${e.fromFrame}-${i}`} from={e.fromFrame}>
        <Html5Audio
          src={sfxSrc(e.sound)}
          volume={() => e.volume ?? SFX_REGISTRY[e.sound].volume}
          playbackRate={
            e.semitones ? semitonesToPlaybackRate(e.semitones) : 1
          }
        />
      </Sequence>
    ))}
  </>
);
