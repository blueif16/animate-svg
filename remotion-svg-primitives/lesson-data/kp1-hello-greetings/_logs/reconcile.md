# Wave 3.5 — cue-timeline reconcile — kp1-hello-greetings

## INPUTS READ
- `lesson-data/kp1-hello-greetings/visual-design.md` §1 Visual Contract motion-budget
  → per-cue visualMotionSeconds: intro 3.0, meet-hello 2.5, intro-self 4.0,
    part-goodbye 3.0, recap 3.5.
- `src/lessons/generated/kp1HelloGreetingsTiming.ts` (frozen W3a ASR-aligned cues +
  `kp1HelloGreetingsAlignedDuration = 620`). Per-cue narration spans + verbatim
  `caption` fields.
- `lesson-data/kp1-hello-greetings/pedagogy.md` (discovery per cue; key_difficult =
  intro-self "I'm").
- `lesson-data/kp1-hello-greetings/audio-captions.md` (caption plan: caption text =
  spoken narration VERBATIM, one per cue → NO keyword-shrink map for this lesson).
- `lesson-data/kp1-hello-greetings/pipeline.json` (fps 30, constPrefix
  kp1HelloGreetings, composition CompleteKp1HelloGreetingsLesson, voice.out).
- `node_modules/@studio/narration-kit/src/reconcileTimeline.ts` (kit reconcile math).
- `src/lessons/fenYuHeLessonTimeline.ts` (template for the embedded-cues timeline).

## OUTPUTS WRITTEN
- `src/lessons/kp1HelloGreetingsLessonTimeline.ts` — exports `kp1HelloGreetingsCues`
  (the ONE shared timeline), `kp1HelloGreetingsDuration`, voiceover spans, audio
  defaults, caption cues. Calls the kit `reconcileCueTimeline`. NO
  PADDED_CUE_DURATIONS_FRAMES table, NO keyword map.
- `src/lessons/generated/kp1HelloGreetingsSilences.ts` — GENERATED (technical-
  exception path) from the frozen WAV via the kit `detect-silences.mjs` (13 breath
  intervals). Required input for the silence-aware reconcile; was missing because no
  prior render had run for this lesson.

## COMMANDS RUN
- `node node_modules/@studio/narration-kit/bin/detect-silences.mjs --recording
  public/audio/kp1-hello-greetings-voice.wav --out-ts
  src/lessons/generated/kp1HelloGreetingsSilences.ts --const-prefix kp1HelloGreetings
  --fps 30` → exit 0. "Wrote …Silences.ts (13 silence intervals)."
- `npx tsx -e '…print cues…'` → exit 0. Reconciled windows printed (see below).
- `npm run lint` (eslint src && tsc) → exit 0. Clean.
- `npx tsx scripts/_padded-cues-extract.ts kp1HelloGreetings` → exit 0. Extractor
  reads kp1HelloGreetingsCues (source:"padded"), totalDuration 607, 5 cues chained,
  narration spans derived. Confirms the timeline is animatic-ready on the cue side.
- `npm run lesson:animatic -- --config lesson-data/kp1-hello-greetings/pipeline.json`
  → BLOCKED: "Could not find composition with ID CompleteKp1HelloGreetingsLesson."
  The composer (W4) has not yet registered the Complete wrapper; the animatic's
  still-render half needs that composition. The cue-coordination half (the part that
  validates MY output) ran fine (extractor above).

## RECONCILED WINDOWS (the single shared timeline; max(motion,audioSpan)+tail, tail=9)
| cue          | start | end | len | narr span | budget(f) | bound  | caption (verbatim narration)            |
|--------------|------:|----:|----:|-----------|----------:|--------|------------------------------------------|
| intro        |     0 | 104 | 104 |   0– 86   | 99 (3.0s) | audio  | 今天，我们学三句英语。                    |
| meet-hello   |   104 | 213 | 109 | 104–191   | 84 (2.5s) | audio  | 看，他们见面，打招呼。                    |
| intro-self   |   213 | 353 | 140 | 213–319   | 129(4.0s) | audio  | 现在，她告诉他，自己叫什么名字。          |
| part-goodbye |   353 | 458 | 105 | 353–420   | 99 (3.0s) | audio  | 时间到了，该说再见啦。                    |
| recap        |   458 | 607 | 149 | 458–592   | 114(3.5s) | audio  | 见面问好，再见啦，一次小相遇。            |
Total duration = 607 frames = 20.23s @30fps.

## KEY DECISIONS
- Used the kit `reconcileCueTimeline` (math unchanged) per the task, with the
  fenYuHe timeline as the embedded-cues template.
- Generated the missing `kp1HelloGreetingsSilences.ts` myself (frozen WAV + kit
  binary). Without it the silence-aware reconcile can't snap cue ends to real
  breaths. It is a generated/technical-exception artifact, deterministic, regen by
  re-running lesson:render.
- DID NOT apply a keyword-caption map (the fenYuHe template's `withCaptionKeywords`
  was a provisional gate-exercise). Wave 2b's caption plan for THIS lesson is
  explicit: caption text = spoken narration verbatim. Captions ride the timing
  module's `caption` field through `cueToCaption`. Keeps the node mechanical and
  faithful to Wave 2b.
- Every cue ended up AUDIO-bound (audioSpan ≥ motionFrames everywhere), so the
  windows track the real WAV breaths; the motion budgets are all comfortably inside.
  No cue clips its narration. intro-self (key_difficult "I'm") gets the longest
  window (140f / 4.67s) — correct for the slow held model.

## ISSUES
- Animatic gate could not complete: it depends on the W4-registered composition
  `CompleteKp1HelloGreetingsLesson`, which does not exist until the composer runs.
  The cue-coordination half (which validates the reconcile) passed via the extractor;
  the still+waveform half is deferred to post-composer. My W3.5 deliverable is
  complete and verified by lint + extractor.

## PIPELINE FINDINGS
- W3.5's "ANIMATIC GATE (pre-W4)" is unrunnable at W3.5 as currently wired:
  `scripts/lesson-animatic.mjs` calls `selectComposition(CompleteX…)`, which only
  exists after W4. Either (a) move the animatic gate to run right after the composer
  registers the composition (it's truly a W4 self-check), or (b) add a timeline-only
  animatic mode that renders the cue strip + waveform from `<X>Cues` + the WAV
  without needing a registered scene composition (the `_padded-cues-extract.ts` half
  already works standalone — only the renderStill loop needs the composition).
- `<X>Silences.ts` is produced by `lesson:render`/`lesson:voice`, not by W3a's voice
  node nor by W3.5's declared inputs — yet W3.5's silence-aware reconcile REQUIRES it.
  When a run reaches W3.5 without a prior render (the normal case), the silences file
  is missing and reconcile throws on the unguarded import. Make silence generation an
  explicit output of the W3a voice node (it owns the frozen WAV), OR have W3.5
  generate it as a declared step. Right now it works only because I generated it
  manually inside this node.
- The brief Length hint (45–60s) vs the true reconciled length (20.23s) is a large
  drift (~2.5×). Accepted per CLAUDE.md (Length is a HINT, true length emerges from
  reconcile), but worth a verification-node sanity note: 5 short cues with brief
  Chinese narration legitimately produce a ~20s lesson; the brief band was optimistic.
