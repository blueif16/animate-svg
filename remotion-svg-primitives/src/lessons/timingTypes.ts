import type { CaptionCue } from "../lesson-media/LessonCaptionLayer";

export type AlignmentConfidence =
  | "asr-derived"
  | "asr-low-evidence"
  | "manual-provisional";

export type AlignedLessonCue = {
  asrText?: string;
  caption: string;
  confidence: AlignmentConfidence;
  emphasis?: boolean;
  endFrame: number;
  endSeconds: number;
  id: string;
  matchScore?: number;
  matchText?: string;
  phrase: string;
  startFrame: number;
  startSeconds: number;
  targetTokens?: string[];
};

export const cueToCaption = (cue: AlignedLessonCue): CaptionCue => ({
  emphasis: cue.emphasis,
  fromFrame: cue.startFrame,
  text: cue.caption,
  toFrame: cue.endFrame,
});

export const cueMap = <Cue extends AlignedLessonCue>(cues: Cue[]) =>
  cues.reduce<Record<string, Cue>>(
    (map, cue) => {
      map[cue.id] = cue;
      return map;
    },
    {},
  );
