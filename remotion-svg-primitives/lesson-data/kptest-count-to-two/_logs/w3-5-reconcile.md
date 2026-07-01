# W3.5 — cue-timeline reconcile

node: `w3-5-reconcile`
lesson: `kptest-count-to-two`
fps: 30
status: ok

## INPUTS READ

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/generated/kptestCountToTwoClips.ts` — W3a measured ClipCue module (4 cues: lesson-intro / first-apple-one / second-apple-two / cardinality). narrationFrames = [77, 80, 98, 80]. No `gap` field on any cue.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/visual-design.md` — §5 per-cue motion budget table: C1=2.0s, C2=2.5s, C3=3.0s, C4=3.5s.
- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-count-to-two/storyboard.md` — cue spine + `exposures` ledger (一=2, 二=2, cardinal 2=1).
- `/Users/tk/Desktop/shared-narration/src/types.ts` + `reconcileTimeline.ts` + `cueHelpers.ts` — `reconcileClipTimeline`, `cueToCaption`, `CaptionCue`, `VoiceClip` API contract (read for shape, not for usage — usage from the prompt template).

## OUTPUTS WRITTEN

- `/Users/tk/Desktop/animation-test/remotion-svg-primitives/src/lessons/kptestCountToTwoLessonTimeline.ts` (1474 B) — imports `reconcileClipTimeline` + `cueToCaption` + `CaptionCue` + `VoiceClip` from `@studio/narration-kit` and `kptestCountToTwoClips` from `./generated/kptestCountToTwoClips`. One `VISUAL_MOTION_SECONDS` entry per ClipCue id (no design row was folded into a typed gap — every cue gets its own budget). Exports `kptestCountToTwoCues`, `kptestCountToTwoDuration`, `kptestCountToTwoVoiceClips`, `kptestCountToTwoLessonCaptionCues`.

## COMMANDS RUN

- `npx eslint src/lessons/kptestCountToTwoLessonTimeline.ts` — exit 0, no output.
- `npm run lesson:animatic -- --config lesson-data/kptest-count-to-two/pipeline.json` — exit 1 was expected to indicate failure; observed exit 0. No-scene fallback path (composition not registered yet — W4 hasn't run). Bundled in 1.1s, rendered 4 per-cue clip waveforms, animatic + sidecar written, **VERDICT: PASS — every clip fits its cue window**. Runtime 3.6s.

## KEY DECISIONS

- `VISUAL_MOTION_SECONDS` keys taken from ClipCue ids, not the design table — they match 1:1 here (4 cues ↔ 4 design rows), so no entries were dropped.
- No `gap` field on any ClipCue → all `gapFrames = 0`; the visual budget drives content where it exceeds narration (`cardinality`: motion 105 > narration 80 → motion wins).
- Brief `Length` ~20s is treated as a HINT per the prompt; emergent total = 13.2s (396f). Storyboard §"Reinforcement plan" explicitly says this is a math-insight lesson that ends at C4 with no later recall beat, so the short total is the design intent (no padding).
- `TAIL_FRAMES = 9` (0.3s @ 30fps) — the kit default per the prompt.

## Per-cue reconcile math (frames)

| cue id | narration | gap | visualMotion(s) | motion(f) | content = max(n+g, m) | cue (content+9) | start | end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lesson-intro | 77 | 0 | 2.0 | 60 | 77 | 86 | 0 | 86 |
| first-apple-one | 80 | 0 | 2.5 | 75 | 80 | 89 | 86 | 175 |
| second-apple-two | 98 | 0 | 3.0 | 90 | 98 | 107 | 175 | 282 |
| cardinality | 80 | 0 | 3.5 | 105 | 105 | 114 | 282 | 396 |

Total duration: **396 frames (13.2s)**.

## Verdict (animatic sidecar)

| cue | startFrame | endFrame | clipFrom | clipEnd | fits |
| --- | --- | --- | --- | --- | --- |
| lesson-intro | 0 | 86 | 0 | 77 | ✓ |
| first-apple-one | 86 | 175 | 86 | 166 | ✓ |
| second-apple-two | 175 | 282 | 175 | 273 | ✓ |
| cardinality | 282 | 396 | 282 | 362 | ✓ |

## COMPREHENSION-FLOOR ADVISORY (advisory, not blocking)

Exposures ledger from storyboard.md, against lesson-pedagogy §8 floors (≥6–10 spaced exposures; ≥3–5s wait-time per echo):

- `一` (count 1) = **2 exposures < 6 floor** — WARN. Storyboard §"Reinforcement plan" justifies: "Math-insight, not L2 acquisition … no later beat in THIS lesson to recall into → no recap, no echo, no learner-response-gap, no equation." Brief explicitly caps the count at 1→2.
- `二` (count 2) = **2 exposures < 6 floor** — WARN. Same justification.
- `cardinal 2` = **1 exposure < 6 floor** — WARN. Same justification (the cardinality insight is delivered by ONE sustained beat — C4 — which is the design intent for a count-to-two lesson).
- `一` echo wait-time = C2 duration = **89f ≈ 2.97s < 3s floor** — WARN (marginal). The "echo" here is the within-cue restate of C2's `一` in C3's first breath group; spacing is structural, not gated by an echo cue.

Total length: 13.2s vs brief ~20s hint — accepted drift per prompt. Not scored against the hint.

## ISSUES

None blocking. All 4 advisory WARNs recorded under PIPELINE FINDINGS so the lesson-debugger / lesson-verification passes see them, and the W4 composer can consciously hold the resolved beats long enough for a 3–5 year old to read (visual-design.md already names ≥1.5s per-item dwell per cue; C4's 3.8s cleared the 3–5s cardinality-beat floor).

## PIPELINE FINDINGS

1. **Exposures ledger under §8 floor for ALL acquisition targets in this lesson** — `一`=2, `二`=2, `cardinal 2`=1, all below the ≥6–10 floor. Storyboard explicitly designs this as a math-insight lesson (no later recall beat possible since the count is capped at 1→2 and out-of-scope forbids recap/comparison/equation), so the under-floor count is INTENTIONAL. If a future variation wants more spaced exposures, the cleanest in-lesson move is to add a learner-response-gap cue after each `count-on` so the child echoes the number; out-of-lesson recall is impossible per the brief.

2. **`一` echo wait-time 2.97s < 3s floor** — marginal. If the W4 composer tightens C2's per-item dwell below ~2.5s for any reason, this drops further. Flag for the composer: keep C2's effective dwell (post-motion) ≥ 3s.

3. **No-scene animatic fallback was taken (W4 composer hasn't registered `CompleteKptestCountToTwoLesson` yet)** — expected and correct at this wave. The gate still validated cue windows and clip placements from the reconciled module. The W4 composer will re-run this gate automatically after it registers the composition.

4. **`cardinality` cue is motion-driven, not narration-driven** (motion 105f > narration 80f → motion wins → 25f of free-silence tail inside the cue). Composer should treat this as a true picture-delivers-then-voice-names beat: the cardinal 2 emerges in the first 30f of motion (`<PopIn motion="bouncy">`) and the spoken `两个` lands at token onset ≈ f28 inside the cue (cumulative from C4's startFrame = 282+28 = 310). storyboard C4 explicitly says "voice names the total `两个` once, AFTER the picture shows the cardinal" — the W4 composer should consult `cue.tokenOnsets[0]` (cue-local) for the spoken onset, not an even grid.

5. **C3 `second-apple-two` carries an in-cue ASR-restate of C2's `一` (tokenOnsets index 0 = f6, identical to C2's first spoken token)** — this is per the storyboard's breath-group constraint ("use breath groups … so §7's count-match holds when the apple and tag enter on different frames within the cue"). The W4 composer should keep the second apple + tag 2 entering AS `又一个` is voiced (tokenOnsets indices 3–7 land between f54–f74 of the cue, cumulative f229–f249) — tag 2 must NOT pre-enter before f249, per `count-on` `requires` (tokenOnsets provide the measured cadence; this is the MEASURE-DON'T-ASSUME channel the prompt mandates for spoken-enumeration steps).