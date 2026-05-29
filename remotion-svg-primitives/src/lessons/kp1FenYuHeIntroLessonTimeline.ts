import type { AlignedLessonCue, CaptionCue } from "@studio/narration-kit";
import { cueToCaption, findBoundarySilence } from "@studio/narration-kit";
import {
  kp1FenYuHeIntroAlignedCues,
  kp1FenYuHeIntroAlignedDuration,
} from "./generated/kp1FenYuHeIntroTiming";
import { kp1FenYuHeIntroSilences } from "./generated/kp1FenYuHeIntroSilences";

// ---------------------------------------------------------------------------
// Reconciled cue boundaries — silence-aware (pipeline-architecture.md v2).
//
// The ASR aligner places each cue's endFrame at the matchText boundary,
// which routinely lags the actual next-word onset by 100–500ms. Using that
// boundary as the visual cue boundary makes the visual transition AFTER
// the next word has already started — perceived as "voice splits and stops".
//
// Fix: anchor each cue's endFrame to a real WAV silence detected by
// `ffmpeg silencedetect` at render time (see `bin/detect-silences.mjs` in
// `@studio/narration-kit`). For each cue, find the silence interval whose
// START falls within `[asrEndFrame - 6, nextAsrStartFrame]`. The cue's
// endFrame snaps to that silence's END — so the visual transitions
// exactly when the speaker finishes the breath and is about to resume.
//
// Fallback: if no real silence exists in the window (continuous speech),
// keep the previous behavior: `nextNarrationStartWav - cursor` audio span.
//
// Each cue's length:
//   cueFrames = max(motionFrames + TAIL_FRAMES, boundaryFrame - cursor)
//
//   - motionFrames    = round(VISUAL_MOTION_SECONDS * 30) — derived per cue
//                       from the LATEST `<CUE>_*_REL_START + <CUE>_*_DUR`
//                       constants in `kp1FenYuHeIntro/layout.ts`.
//   - TAIL_FRAMES     = 9 (0.3s breathing buffer).
//   - boundaryFrame   = silence.endFrame if a real silence sits at the
//                       cue boundary; else raws[i+1].startFrame (legacy).
//
// Motion-dominated cues (motionFrames+tail > audioSpan) keep their longer
// window; they push the cursor past the next narration start — a one-cue
// drift — which subsequent narration-driven cues absorb by shrinking
// their hold to catch back up.
//
// No `PADDED_CUE_DURATIONS_FRAMES` table. Audio, visuals, captions share
// ONE window per cue. Voiceover plays as ONE continuous Sequence (option
// (a) in the architecture doc).
// ---------------------------------------------------------------------------
const TAIL_FRAMES = 9;
const FPS = 30;

// Per-cue visual motion budget — derived from layout.ts latest motion-end.
// If you change a *_REL_START or *_DUR in layout.ts, update the matching
// entry here. Numbers are SECONDS (converted to frames at render time).
const VISUAL_MOTION_SECONDS: Record<string, number> = {
  // intro:            INTRO_PREVIEW_JOIN_REL_START (80) + INTRO_PREVIEW_JOIN_DUR (24) = 104f
  intro: 3.5,
  // fen-show:         FEN_SPLIT_REL_START (30) + FEN_SPLIT_DUR (24) = 54f
  "fen-show": 1.8,
  // fen-name:         FEN_NAME_TERM_REL_START (76) + FEN_NAME_TERM_DUR (14) = 90f
  "fen-name": 3.0,
  // he-show:          HE_SHOW_REJOIN_REL_START (12) + HE_SHOW_REJOIN_DUR (24) = 36f
  "he-show": 1.2,
  // he-name:          HE_NAME_HE_REL_START (70) + HE_NAME_HE_DUR (12) = 82f
  "he-name": 2.73,
  // fenheshi-intro:   FENHESHI_DOTS_DISMISS_REL_START (160) + FENHESHI_DOTS_DISMISS_DUR (16) = 176f
  //                   LOAD-BEARING — motion dominates narration (115f).
  "fenheshi-intro": 5.87,
  // fenheshi-read:    READ_UP_REL_START (100) + READ_UP_DUR (24) = 124f
  "fenheshi-read": 4.13,
  // five-1-4:         FIVE14_NEW_REL_START (32) + FIVE14_NEW_DUR (26) = 58f
  "five-1-4": 1.93,
  // five-3-2-and-4-1: FIVE32_UNDERLINE_REL_START (90) + FIVE32_UNDERLINE_DUR (24) = 114f
  "five-3-2-and-4-1": 3.8,
  // outro:            OUTRO_TITLE_REL_START (48) + OUTRO_TITLE_DUR (18) = 66f
  outro: 2.2,
};

// Lead silence kept identical to the raw aligned timing (8 frames) so the
// first cue's narration lands exactly where it does in the source audio.
const LEAD_SILENCE_FRAMES = kp1FenYuHeIntroAlignedCues[0]?.startFrame ?? 0;

// ASR cue boundaries reference the WAV's intrinsic timeline; with option (a)
// the WAV plays as a single continuous span, so the LAST frame of audio sits
// at LEAD_SILENCE_FRAMES + kp1FenYuHeIntroAlignedDuration on the composition
// timeline. The final cue must end at or after that frame.
const SOURCE_AUDIO_END_FRAME =
  LEAD_SILENCE_FRAMES + kp1FenYuHeIntroAlignedDuration;

const buildReconciledCues = (): AlignedLessonCue[] => {
  let cursor = LEAD_SILENCE_FRAMES;
  const raws = kp1FenYuHeIntroAlignedCues;
  return raws.map((raw, index) => {
    const motionSeconds = VISUAL_MOTION_SECONDS[raw.id];
    if (motionSeconds === undefined) {
      throw new Error(
        `kp1FenYuHeIntroLessonTimeline: missing VISUAL_MOTION_SECONDS for cue "${raw.id}"`,
      );
    }
    const motionFrames = Math.round(motionSeconds * FPS);
    const motionFramesWithTail = motionFrames + TAIL_FRAMES;

    // Composition frame at which the NEXT cue's narration begins per ASR.
    // The WAV plays with voiceFromFrame=0, so WAV-frame T == composition T.
    const nextAsrStart =
      index < raws.length - 1
        ? raws[index + 1].startFrame
        : SOURCE_AUDIO_END_FRAME;

    // Silence-aware boundary: snap to real WAV silence end if one exists at
    // the cue boundary; otherwise fall back to the ASR next-narration start.
    const boundarySilence =
      index < raws.length - 1
        ? findBoundarySilence(
            kp1FenYuHeIntroSilences,
            raw.endFrame,
            nextAsrStart,
          )
        : undefined;
    const boundaryFrame = boundarySilence?.endFrame ?? nextAsrStart;

    const audioSpanFromCursor = Math.max(0, boundaryFrame - cursor);
    const cueFrames = Math.max(motionFramesWithTail, audioSpanFromCursor);

    const startFrame = cursor;
    const endFrame = startFrame + cueFrames;
    const cue: AlignedLessonCue = {
      ...raw,
      startFrame,
      endFrame,
      startSeconds: startFrame / FPS,
      endSeconds: endFrame / FPS,
    };
    cursor = endFrame;
    return cue;
  });
};

export const kp1FenYuHeIntroCues: AlignedLessonCue[] = buildReconciledCues();

// Total reconciled duration — sum of cue lengths + lead silence.
export const kp1FenYuHeIntroDuration =
  kp1FenYuHeIntroCues[kp1FenYuHeIntroCues.length - 1]?.endFrame ??
  kp1FenYuHeIntroAlignedDuration;

// Voiceover span — option (a) in the architecture doc. The WAV plays as ONE
// continuous Sequence starting at LEAD_SILENCE_FRAMES. Inter-cue audio
// alignment drifts sub-second within each cue; the audio's last frame lines
// up with SOURCE_AUDIO_END_FRAME thanks to the outro absorption above.
export const kp1FenYuHeIntroLessonVoiceoverSpans: Array<[number, number]> =
  kp1FenYuHeIntroAlignedCues.length > 0
    ? [[LEAD_SILENCE_FRAMES, SOURCE_AUDIO_END_FRAME]]
    : [];

export const kp1FenYuHeIntroLessonAudioDefaults = {
  teacherAudioSrc: "audio/kp1-fen-yu-he-intro-voice.wav",
} satisfies {
  teacherAudioSrc: string | null;
};

// Caption cues — derived from the RECONCILED cue list, so captions share the
// new cue windows. Captions remain visible through each cue's small tail.
export const kp1FenYuHeIntroLessonCaptionCues: CaptionCue[] =
  kp1FenYuHeIntroCues.map(cueToCaption);
