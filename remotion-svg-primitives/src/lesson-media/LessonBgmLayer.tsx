import { Html5Audio } from "remotion";
import { mediaSrc } from "./mediaSrc";
import { bedVolume, type NarrationWindow } from "./audioMix";

type Props = {
  /** bed key/name under `public/audio/_beds/`, e.g. "math-calm-68-cmaj". */
  bed: string;
  /** narration windows in composition frames (from ASR spans / cues). */
  windows: NarrationWindow[];
  /** total composition frames (from the reconciled timeline). */
  totalFrames: number;
};

/**
 * The music bed. Deliberately NOT routed through the kit's `AudioLayer` (which
 * loops + lacks an edge fade — see `docs/proposals/sound-layer-integration.md`
 * §4): the bed asset is authored to ≥ lesson length, so it never loops, and the
 * §2.2 `bedVolume` envelope carries the duck + 0.75s edge fades.
 */
export const LessonBgmLayer = ({ bed, windows, totalFrames }: Props) => (
  <Html5Audio
    src={mediaSrc(`audio/_beds/${bed}.wav`)}
    volume={(frame) => bedVolume(frame, windows, totalFrames)}
  />
);
