// fen-yu-he — reconciled cue timeline (Wave 3.5, orchestrator-owned, mechanical).
//
// THE CUE IS THE UNIT OF COORDINATION. Each cue has exactly ONE timeline
// window shared by audio, visuals, and captions. There is no
// PADDED_CUE_DURATIONS_FRAMES table — the composer never re-pads.
//
// Reconcile math (docs/pipeline-architecture.md §2, §4 Wave 3.5):
//   motionFrames      = round(visualMotionSeconds * fps) + TAIL
//   audioSpan         = audioBoundaryFrame - cueStartFrame
//   cueFrames         = max(motionFrames, audioSpan)
//   cues chain end-to-end from the lead silence (frame 0).
//
// audioBoundaryFrame is the END of the real WAV silence sitting at the cue
// boundary (the genuine breath before the next sentence), found over the
// detected fenYuHeSilences. We pick the LATEST silence that ends at/before the
// next cue's audio onset and at/after this cue's motion minimum — this is
// robust to ASR overshoot on long cues (the ASR can run a cue's reported end
// PAST the real breath into the next sentence's first word, which makes a
// boundary-keyed lookup miss the breath; see the slide→ordered-column seam).
// findBoundarySilence is kept as a secondary fallback, then the next cue's ASR
// start. This snaps each visual cue end to the moment the speaker resumes, not
// to the ASR's phonetic-tail-padded end.
//
// Inputs (read, never hand-copied):
//   - src/lessons/generated/fenYuHeTiming.ts   (frozen ASR-aligned cues)
//   - src/lessons/generated/fenYuHeSilences.ts (ffmpeg-detected WAV silences)
//   - lesson-data/fen-yu-he/visual-design.md §3 (per-cue visualMotionSeconds)
//
// TAIL = 9 frames (0.3s) breathing room so a cue never slams into the next.

import {
  cueToCaption,
  findBoundarySilence,
  type AlignedLessonCue,
  type CaptionCue,
} from "@studio/narration-kit";

import {
  withCaptionKeywords,
  type CaptionKeywordMap,
} from "../lesson-media/captionKeywords";
import {
  fenYuHeAlignedCues,
  fenYuHeAlignedDuration,
} from "./generated/fenYuHeTiming";
import { fenYuHeSilences } from "./generated/fenYuHeSilences";

const FPS = 30;
const TAIL_FRAMES = 9;

// Per-cue visual motion budget (seconds) from lesson-data/fen-yu-he/visual-design.md §3.
// The MINIMUM time each cue's motion needs to land for a 6-year-old.
const VISUAL_MOTION_SECONDS: Record<string, number> = {
  "intro-title": 2.5,
  "five-whole": 2.5,
  "split-into-two": 2.5,
  "recombine-inverse": 2.0,
  "read-fen-he-shi": 4.0,
  "first-ordered-split": 3.0,
  // 6.5 (not 7.5): the slide cue's audio span to the real breath before the
  // next sentence is 207 frames (~6.9s); motionFrames at 6.5s = 204 < 207, so
  // the cue is AUDIO-bound and its end snaps to the 931–944 breath instead of
  // being pinned past it by the motion budget. The 4 candy-slides keep their
  // full room (audio span wins by 3 frames).
  "slide-one-at-a-time": 6.5,
  "ordered-column-complete": 3.0,
  "order-matters": 3.5,
};

// Source ASR cues in storyboard order — the frozen audio is canonical.
const sourceCues = fenYuHeAlignedCues as readonly AlignedLessonCue[];

// Pick the genuine breath before the next sentence: the LATEST detected silence
// whose END sits at/before the next cue's audio onset AND at/after this cue's
// motion minimum (so the cut never undercuts the motion budget). Walking from
// the next-onset backwards makes this robust to ASR overshoot — the real breath
// can end BEFORE the ASR's reported cue end, so a lookup keyed on that end
// misses it (see header). Returns undefined when no qualifying silence exists.
const findBreathBeforeNext = (
  motionMinFrame: number,
  nextNarrationStart: number,
): { endFrame: number } | undefined => {
  let best: { endFrame: number } | undefined;
  for (const silence of fenYuHeSilences) {
    if (
      silence.endFrame <= nextNarrationStart &&
      silence.endFrame >= motionMinFrame &&
      (!best || silence.endFrame > best.endFrame)
    ) {
      best = silence;
    }
  }
  return best;
};

const reconcile = (): AlignedLessonCue[] => {
  const out: AlignedLessonCue[] = [];
  // Chain from the lead silence: the WAV opens with silence before the first
  // word (ASR onset at frame 8), so the shared timeline starts at frame 0.
  let cursor = 0;

  for (let index = 0; index < sourceCues.length; index += 1) {
    const cue = sourceCues[index];
    const budgetSeconds = VISUAL_MOTION_SECONDS[cue.id];
    if (budgetSeconds === undefined) {
      throw new Error(
        `fen-yu-he reconcile: no visualMotionSeconds for cue "${cue.id}"`,
      );
    }

    const motionFrames = Math.round(budgetSeconds * FPS) + TAIL_FRAMES;

    // Where the next word starts (next cue's ASR start), or source audio end
    // for the final cue. This bounds the silence search and is the fallback.
    const nextNarrationStart =
      index + 1 < sourceCues.length
        ? sourceCues[index + 1].startFrame
        : fenYuHeAlignedDuration;

    // Primary: the latest real breath before the next sentence, at/after the
    // motion minimum (robust to ASR overshoot). Secondary: a silence keyed on
    // the ASR end (back-compat for cues where ASR aligns cleanly). Final
    // fallback: the next cue's ASR start.
    const motionMinFrame = cursor + motionFrames;
    const breath =
      findBreathBeforeNext(motionMinFrame, nextNarrationStart) ??
      findBoundarySilence(fenYuHeSilences, cue.endFrame, nextNarrationStart);
    const audioBoundaryFrame = breath ? breath.endFrame : nextNarrationStart;

    // The cue window must hold the audio through the boundary AND give the
    // motion its full budget — whichever is longer wins.
    const audioSpanFrames = audioBoundaryFrame - cursor;
    const cueFrames = Math.max(motionFrames, audioSpanFrames);

    const startFrame = cursor;
    const endFrame = cursor + cueFrames;

    out.push({
      ...cue,
      startFrame,
      endFrame,
      startSeconds: Number((startFrame / FPS).toFixed(3)),
      endSeconds: Number((endFrame / FPS).toFixed(3)),
    });

    cursor = endFrame;
  }

  return out;
};

// On-screen caption KEYWORD per cue (redundancy principle — see
// ../lesson-media/captionKeywords). The spoken narration is unchanged (frozen
// WAV); only the on-screen text shrinks from the full sentence to a short
// anchor a 6-year-old's co-viewer can scan without competing with the visual.
// PROVISIONAL: these anchors should be owned/pedagogy-reviewed by Wave 2b
// (audio/captions); authored here to wire fen-yu-he and exercise the gate.
const FEN_YU_HE_CAPTION_KEYWORDS: CaptionKeywordMap = {
  "intro-title": "5 的分与合",
  "five-whole": "5",
  "split-into-two": "分开",
  "recombine-inverse": "合起来",
  "read-fen-he-shi": "分合式",
  "first-ordered-split": "从少排起",
  "slide-one-at-a-time": "一次一个",
  "ordered-column-complete": "排好了",
  "order-matters": "顺序不同",
};

// Reconciled cue list — the single source of truth for audio, visuals, captions.
// Keyword captions are baked in here so BOTH the caption layer and the
// verification redundancy gate (which reads manifest.cues[].caption) see the
// short anchor, not the verbatim narration.
export const fenYuHeCues: AlignedLessonCue[] = withCaptionKeywords(
  reconcile(),
  FEN_YU_HE_CAPTION_KEYWORDS,
);

// Total composition length = last reconciled cue's endFrame.
export const fenYuHeDuration: number =
  fenYuHeCues[fenYuHeCues.length - 1].endFrame;

// One continuous voiceover span: lead-silence start (frame 0) → source audio
// end. The WAV plays top-to-bottom as one Sequence; the span is used for BGM
// ducking and to assert the audio sits inside the reconciled timeline.
export const fenYuHeLessonVoiceoverSpans: Array<[number, number]> = [
  [0, fenYuHeAlignedDuration],
];

// Audio defaults consumed by LessonAudioLayer. Remotion serves static media
// from public/, so the src is relative to public/.
export const fenYuHeLessonAudioDefaults = {
  teacherAudioSrc: "audio/fen-yu-he-voice.wav",
};

// Caption cues derived from the SAME reconciled windows — captions cannot
// drift from visuals because they read this timeline.
export const fenYuHeLessonCaptionCues: CaptionCue[] =
  fenYuHeCues.map(cueToCaption);
