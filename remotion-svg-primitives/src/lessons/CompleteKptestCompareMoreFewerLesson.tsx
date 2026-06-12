import { AbsoluteFill } from "remotion";
import type { CaptionCue, PlacedCue, VoiceClip } from "@studio/narration-kit";

import {
  LessonAudioLayer,
  LessonBgmLayer,
  LessonCaptionLayer,
  LessonSfxLayer,
} from "../lesson-media/components";
import { spansToWindows } from "../lesson-media/audioMix";
import type { SfxEvent } from "../lesson-media/LessonSfxLayer";
import type { LessonComposition } from "./lessonRegistryTypes";

import {
  KptestCompareMoreFewerLessonScene,
  type CueMap,
} from "./kptestCompareMoreFewerLessonScene";
import {
  kptestCompareMoreFewerCues,
  kptestCompareMoreFewerDurationFrames,
  kptestCompareMoreFewerVoiceClips,
} from "./kptestCompareMoreFewerLessonTimeline";
import * as L from "./kptestCompareMoreFewer/layout";
import audioCues from "../../lesson-data/kptest-compare-more-fewer/audio-cues.json";

// cues[] → id-keyed map the scene reads.
const cueMap: CueMap = Object.fromEntries(
  kptestCompareMoreFewerCues.map((c) => [c.id, c]),
);
const cueOf = (id: string): PlacedCue | undefined => cueMap[id];

// Captions: one ribbon cue per reconciled cue, spanning its narration window.
const captionCues: CaptionCue[] = kptestCompareMoreFewerCues.map((c) => ({
  text: c.caption,
  fromFrame: c.startFrame,
  toFrame: c.startFrame + c.narrationFrames,
  emphasis: c.emphasis,
}));

// Bed-duck windows from the per-cue voice clip spans (mechanical).
const voiceSpans: [number, number][] = kptestCompareMoreFewerVoiceClips.map(
  (v: VoiceClip) => [v.fromFrame, v.fromFrame + v.durationInFrames],
);
const bedWindows = spansToWindows(voiceSpans);

// SFX — composer-owned frames: each fires at the layout offset its motion uses.
const sfxEvents: SfxEvent[] = [
  // dot PopIn pop — lands on the first top dot's entrance in two-groups.
  {
    sound: "pop",
    fromFrame:
      (cueOf("two-groups")?.startFrame ?? 0) + L.SFX_TWO_GROUPS_POP,
  },
  // chime — the surplus is revealed in match (ghosts land).
  {
    sound: "chime",
    fromFrame: (cueOf("match")?.startFrame ?? 0) + L.SFX_MATCH_CHIME,
  },
  // chime — the surplus SURVIVES the spread in not-by-size (re-pair ghosts land).
  {
    sound: "chime",
    fromFrame:
      (cueOf("not-by-size")?.startFrame ?? 0) + L.SFX_NOT_BY_SIZE_CHIME,
  },
];

export const CompleteKptestCompareMoreFewerLesson: React.FC = () => (
  <AbsoluteFill>
    <KptestCompareMoreFewerLessonScene cues={cueMap} />
    <LessonAudioLayer voiceClips={kptestCompareMoreFewerVoiceClips} />
    <LessonCaptionLayer cues={captionCues} />
    <LessonBgmLayer
      bed={audioCues.bed}
      totalFrames={kptestCompareMoreFewerDurationFrames}
      windows={bedWindows}
    />
    <LessonSfxLayer events={sfxEvents} />
  </AbsoluteFill>
);

export const completeKptestCompareMoreFewerLessonDefaultProps: Record<
  string,
  unknown
> = {};

export const lessonComposition: LessonComposition = {
  id: "CompleteKptestCompareMoreFewerLesson",
  component: CompleteKptestCompareMoreFewerLesson,
  durationInFrames: kptestCompareMoreFewerDurationFrames,
  defaultProps: completeKptestCompareMoreFewerLessonDefaultProps,
};
