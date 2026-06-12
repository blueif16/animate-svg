# W3.5 — cue-timeline reconcile — kptest-compare-more-fewer

## INPUTS READ
- `lesson-data/kptest-compare-more-fewer/visual-design.md` — per-cue `visualMotionSeconds` (the §"Per-cue motion budget" table).
- `src/lessons/generated/kptestCompareMoreFewerClips.ts` — measured per-cue clips (the AUDIO TRUTH: exact `narrationFrames` + two typed `gap`s).
- `lesson-data/kptest-compare-more-fewer/pedagogy.md`, `storyboard.md` — acquisition targets + exposures ledger (comprehension-floor advisory).
- `node_modules/@studio/narration-kit/src/{reconcileTimeline,types}.ts` — confirmed the `reconcileClipTimeline` API + exported types.
- `lesson-data/kptest-compare-more-fewer/pipeline.json` — fps=30, composition `CompleteKptestCompareMoreFewerLesson`.

## OUTPUTS WRITTEN
- `src/lessons/kptestCompareMoreFewerLessonTimeline.ts` — imports `kptestCompareMoreFewerClips`, calls `reconcileClipTimeline({clips, visualBudgets, fps:30})`, exports:
  - `kptestCompareMoreFewerCues: PlacedCue[]`
  - `kptestCompareMoreFewerVoiceClips: VoiceClip[]`
  - `kptestCompareMoreFewerDurationFrames` + `kptestCompareMoreFewerFps`.
  No `PADDED_CUE_DURATIONS_FRAMES`, no continuous-WAV span, no Silences import, no ASR correction.

## COMMANDS RUN
- `npx eslint src/lessons/kptestCompareMoreFewerLessonTimeline.ts` → exit 0 (clean).
- `npx tsx -e <reconcile dry-run>` → printed every cue window; verified 0 clips overflow their window; total = 2068 frames (68.9s); 11 voiceClips.
- `npm run lesson:animatic -- --config lesson-data/kptest-compare-more-fewer/pipeline.json` → FAILED: "Could not find composition with ID CompleteKptestCompareMoreFewerLesson" (the scene composition is W4's output, does not exist pre-composer). Verified no scene/registry entry exists. Timeline correctness instead verified directly via `reconcileClipTimeline` (each clip sits inside its window) — the substantive check the animatic would render.

## RECONCILED WINDOWS (frames @30fps)
```
cue              start  end  len  narr  gap motion hold  driver
intro                0  110  110   101    0    75     9  AUDIO
two-groups         110  260  150   141    0   120     9  AUDIO
match              260  434  174   120    0   165    54  MOTION
more-direction     434  635  201   192    0   165     9  AUDIO
echo-more          635  809  174    29  120   165   145  MOTION (gap=learner-response 4s)
more-replay        809 1010  201   192    0   165     9  AUDIO
fewer-direction   1010 1229  219   195    0   210    24  MOTION (keystone, longest dwell)
echo-fewer        1229 1456  227    98  120   165   129  AUDIO (gap=learner-response 4s)
fewer-replay      1456 1660  204   195    0   165     9  AUDIO
not-by-size       1660 1849  189   162    0   180    27  MOTION
recap             1849 2068  219   192    0   210    27  MOTION
TOTAL = 2068 frames = 68.9s
```

## KEY DECISIONS
- visualBudgets map transcribed VERBATIM from visual-design.md §"Per-cue motion budget"; cue ids matched to clip ids exactly (kebab keys quoted).
- Used the kit's default `tailFrames=9` (≤0.3s) — every cue gets a ≥9-frame tail; intent-spec allows ≤9.
- The two `learner-response` gaps (echo-more, echo-fewer) are carried by the clip module and added as FREE silent holds by the kit (no audio scheduled across them) — composer fills with a "your turn" affordance.
- Brief Length is a HINT only — accepted emergent 68.9s; no padding table.

## ISSUES
- ANIMATIC GATE could not run: composition `CompleteKptestCompareMoreFewerLesson` is not registered yet (W4 composer produces the scene + Complete wrapper). Substituted direct `reconcileClipTimeline` verification (0 clip overflow). Re-run the animatic at the W3.5→W4 boundary once the scene composition exists.
- COMPREHENSION-FLOOR ADVISORY (WARN, non-blocking): storyboard `exposures` ledger declares 五比三多: 4 and 三比五少: 4 cue-level spaced encounters — both UNDER the lesson-pedagogy §8 floor (≥6–10). The storyboard note argues each target is also voiced ×2 within its model cue, but the cue-level spaced-encounter count is 4 < 6. Wait-time floor IS met (both echo cues carry 120-frame / 4s `learner-response` gaps, within §8's 3–5s). Recorded for upstream (storyboard/audio-captions), not fixed here — reconcile is mechanical.

## PIPELINE FINDINGS
- The ANIMATIC GATE is specified as a pre-W4 gate in the W3.5 node, but it renders the lesson scene composition, which only the W4 composer registers. As written the gate ALWAYS fails at W3.5 for a fresh lesson. Either: (a) move the animatic gate to the W3.5→W4 boundary / start of W4, or (b) give the animatic script a "no-scene" fallback that strips the reconciled cues + clip waveform from the timeline module alone (no composition lookup). Recommend (b) — the timeline module is self-sufficient and the gate's purpose (confirm each clip sits inside its window) needs no scene.
- The §8 exposures floor (≥6–10) and the storyboard's own ledger semantics (cue-level encounters, with ×2 in-cue models acknowledged separately) disagree numerically — every target lands at 4 and trips this advisory on every run. Either raise the cue-level encounter count in the storyboard skill (add a second replay / a mid-lesson interleave) or make §8 count in-cue model repetitions so the ledger and the floor speak the same units. This will WARN on every comparison-style lesson until reconciled.
