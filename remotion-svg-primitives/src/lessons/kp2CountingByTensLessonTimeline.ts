import { cueToCaption, reconcileClipTimeline, type CaptionCue, type VoiceClip } from "@studio/narration-kit";
import { kp2CountingByTensClips } from "./generated/kp2CountingByTensClips";

const FPS = 30;
const TAIL_FRAMES = 9;

const VISUAL_MOTION_SECONDS: Record<string, number> = {
  intro: 2.0,
  "bundle-recall": 2.5,
  "untie-reveal": 3.0,
  "slow-count-ones": 5.0,
  "fast-vs-slow": 4.0,
  "two-tens": 3.0,
  "three-tens": 3.0,
  recap: 4.0,
};

const reconciled = reconcileClipTimeline({
  clips: kp2CountingByTensClips,
  visualBudgets: VISUAL_MOTION_SECONDS,
  fps: FPS,
  tailFrames: TAIL_FRAMES,
});

export const kp2CountingByTensCues = reconciled.cues;
export const kp2CountingByTensDuration: number = reconciled.durationFrames;
export const kp2CountingByTensVoiceClips: VoiceClip[] = reconciled.voiceClips;
export const kp2CountingByTensLessonCaptionCues: CaptionCue[] = reconciled.cues.map(cueToCaption);
export const completeKp2CountingByTensLessonDuration = kp2CountingByTensDuration;
