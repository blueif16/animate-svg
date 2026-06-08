// kp1-hello-greetings — reconciled cue timeline (Wave 3.5, orchestrator-owned,
// mechanical). This is the ONE place cue durations are decided.
//
// THE CUE IS THE UNIT OF COORDINATION. Each cue has exactly ONE timeline window
// shared by audio, visuals, and captions. There is NO PADDED_CUE_DURATIONS_FRAMES
// table — the composer never re-pads.
//
// Reconcile math (docs/pipeline-architecture.md §2, §4 Wave 3.5; the kit owns it):
//   motionFrames    = round(visualMotionSeconds * fps) + TAIL
//   audioSpan       = audioBoundaryFrame - cueStartFrame
//   cueFrames       = max(motionFrames, audioSpan)
//   cues chain end-to-end from the lead silence (frame 0).
//
// audioBoundaryFrame is the END of the real WAV silence sitting at the cue
// boundary (the genuine breath before the next sentence), found over the detected
// kp1HelloGreetingsSilences. The kit picks the LATEST silence that ends at/before
// the next cue's audio onset AND at/after this cue's motion minimum — robust to
// ASR overshoot on long cues. This snaps each visual cue end to the moment the
// speaker resumes, not to the ASR's phonetic-tail-padded end.
//
// Inputs (read, never hand-copied):
//   - src/lessons/generated/kp1HelloGreetingsTiming.ts   (frozen ASR-aligned cues)
//   - src/lessons/generated/kp1HelloGreetingsSilences.ts (ffmpeg-detected breaths)
//   - lesson-data/kp1-hello-greetings/visual-design.md §1 (per-cue motion budget)
//
// CAPTIONS: this lesson's audio-captions.md (Wave 2b) caption plan = the spoken
// `narration` VERBATIM, one per cue. So captions ride the timing module's `caption`
// field straight through `cueToCaption` — no keyword-shrink map is applied (the
// English answer never enters the Chinese ribbon; that division is enforced by the
// scene's zones, not here). The brief Length (45–60s) is a HINT only; the true
// length is the last reconciled cue's endFrame — drift is accepted.
//
// TAIL = 9 frames (0.3s) breathing room so a cue never slams into the next.

import {
  cueToCaption,
  reconcileCueTimeline,
  type AlignedLessonCue,
  type CaptionCue,
} from "@studio/narration-kit";

import {
  kp1HelloGreetingsAlignedCues,
  kp1HelloGreetingsAlignedDuration,
} from "./generated/kp1HelloGreetingsTiming";
import { kp1HelloGreetingsSilences } from "./generated/kp1HelloGreetingsSilences";

const FPS = 30;
const TAIL_FRAMES = 9;

// Per-cue visual motion budget (seconds) from
// lesson-data/kp1-hello-greetings/visual-design.md §1 Visual Contract motion-budget.
// The MINIMUM time each cue's motion needs to read for an 8-year-old.
const VISUAL_MOTION_SECONDS: Record<string, number> = {
  intro: 3.0,
  "meet-hello": 2.5,
  "intro-self": 4.0,
  "part-goodbye": 3.0,
  recap: 3.5,
};

// Source ASR cues in storyboard order — the frozen audio is canonical.
const sourceCues = kp1HelloGreetingsAlignedCues as readonly AlignedLessonCue[];

// Reconcile the per-cue timeline via the shared kit. VISUAL_MOTION_SECONDS is the
// lesson-authored per-cue budget input; the kit owns the
// max(motion, audio-span-to-the-real-breath) chaining and the total duration.
const reconciled = reconcileCueTimeline({
  alignedCues: sourceCues,
  silences: kp1HelloGreetingsSilences,
  visualBudgets: VISUAL_MOTION_SECONDS,
  alignedDuration: kp1HelloGreetingsAlignedDuration,
  fps: FPS,
  tailFrames: TAIL_FRAMES,
});

// Reconciled cue list — the single source of truth for audio, visuals, captions.
export const kp1HelloGreetingsCues: AlignedLessonCue[] = reconciled.cues;

// Total composition length = the kit's reconciled duration (last cue endFrame).
export const kp1HelloGreetingsDuration: number = reconciled.durationFrames;

// One continuous voiceover span: lead-silence start (frame 0) → source audio end.
// The WAV plays top-to-bottom as one Sequence; the span is used for BGM ducking
// and to assert the audio sits inside the reconciled timeline.
export const kp1HelloGreetingsLessonVoiceoverSpans: Array<[number, number]> = [
  [0, kp1HelloGreetingsAlignedDuration],
];

// Audio defaults consumed by LessonAudioLayer. Remotion serves static media from
// public/, so the src is relative to public/.
export const kp1HelloGreetingsLessonAudioDefaults = {
  teacherAudioSrc: "audio/kp1-hello-greetings-voice.wav",
};

// Caption cues derived from the SAME reconciled windows — captions cannot drift
// from visuals because they read this timeline. Text = the verbatim Chinese
// narration carried on each cue's `caption` field (Wave 2b caption plan).
export const kp1HelloGreetingsLessonCaptionCues: CaptionCue[] =
  kp1HelloGreetingsCues.map(cueToCaption);
