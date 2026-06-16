# W3.5 — Cue-timeline reconcile (kptest-fenyuhe-six)

## INPUTS READ

- `lesson-data/kptest-fenyuhe-six/visual-design.md` §5 (per-cue motion budget)
- `src/lessons/generated/kptestFenyuheSixClips.ts` (the AUDIO TRUTH: 6 cues, per-cue trimmed clip + exact `narrationFrames` + typed `gap`)
- `node_modules/@studio/narration-kit/dist/reconcileTimeline.d.ts` + `src/reconcileTimeline.ts` (read for `reconcileClipTimeline` signature + behavior)
- `lesson-data/kptest-fenyuhe-six/storyboard.md` (exposures ledger)
- `lesson-data/kptest-fenyuhe-six/pedagogy.md` (per-cue discovery + wait-time floor)
- `lesson-data/kptest-fenyuhe-six/script-cues.json` (canonical narration — matches the clip module)
- `lesson-data/kptest-fenyuhe-six/audio-cues.json` (SFX keyed by clip cue ids)
- `lesson-data/kptest-fenyuhe-six/pipeline.json` (fps 30, constPrefix kptestFenyuheSix)
- `.agents/skills/lesson-pedagogy/SKILL.md` §8 (comprehension-floor: ≥6-10 spaced exposures, ≥3-5s wait-time per echo)

## OUTPUTS WRITTEN

- `src/lessons/kptestFenyuheSixLessonTimeline.ts` (2426 bytes; v4 cue-anchored, calls `reconcileClipTimeline`, keys visualBudgets by CLIP MODULE cue ids)
- This log file.

## COMMANDS RUN

- `npx eslint src/lessons/kptestFenyuheSixLessonTimeline.ts` — exit 0 (lint-clean; PascalCase N/A, ESM imports only, no unused vars).
- `npx tsc --noEmit -p tsconfig.json | grep kptestFenyuheSixLessonTimeline` — no output (no TS errors in this file). The pre-existing TS error in `src/lessons/CompleteKptestCompareMoreFewerLesson.tsx` (missing `audio-cues.json`) is unrelated to W3.5.
- `npx tsx scripts/_test-reconcile.mjs` (throwaway — confirmed the reconcile math) → deleted after verifying.

+exit 0
+key stdout-stderr (test reconcile):
```
cues.length: 6
  routine-reprise:     start=0    end=180   (6.00s)   narration=171  gap=0
  split-1-and-5:       start=180  end=494   (16.47s)  narration=185  gap=120
  split-2-and-4:       start=494  end=805   (26.83s)  narration=182  gap=120
  split-3-and-3:       start=805  end=1150  (38.33s)  narration=186  gap=150
  aggregator-prompt:   start=1150 end=1366  (45.53s)  narration=87   gap=120
  recap:               start=1366 end=1675  (55.83s)  narration=173  gap=0
voiceClips: 6 (one per clip, anchored to cue start)
durationFrames: 1675 (55.83s)
```

## KEY DECISIONS

1. **v4 cue-anchored reconcile (the only path).** Used the kit's `reconcileClipTimeline({ clips, visualBudgets, fps, tailFrames })`. NO `reconcileCueTimeline` (that one consumes ASR-aligned cues + a continuous WAV — superseded in v4). NO `PADDED_CUE_DURATIONS_FRAMES`, NO continuous-WAV span, NO detect-silences step. Each cue's clip plays at the cue START for `narrationFrames`; the rest of the window is FREE silence (motion hold + typed `gap`).

2. **Visual budget keys = CLIP MODULE cue ids, exactly the 6 ids in `kptestFenyuheSixClips`.** The 3 echo beats (`echo-1-and-5` / `echo-2-and-4` / `echo-3-and-3`) from the design's 9-cue storyboard were folded by W2b into typed gaps on the carrying split cues (per the v4 brief — the gap carries the learner-response hold). The W3.5 reconcile therefore has ONE row per CLIP cue, and the echo beats get NO row (their dwell lives in the carrying cue's `gapFrames`).

3. **Visual motion seconds (from visual-design §5 motion-budget table):**
   - `routine-reprise`: 3.3 s
   - `split-1-and-5`: 5.0 s
   - `split-2-and-4`: 5.0 s
   - `split-3-and-3`: 6.0 s
   - `aggregator-prompt`: 6.5 s
   - `recap`: 10.0 s

4. **Math per cue (`cueFrames = max(narrationFrames + gapFrames, motionFrames) + tailFrames`, tail=9):**
   - `routine-reprise`: max(171 + 0, 99) + 9 = 180 fr (6.00 s) — narration drives
   - `split-1-and-5`: max(185 + 120, 150) + 9 = 314 fr (10.47 s) — narration + 4 s gap drives
   - `split-2-and-4`: max(182 + 120, 150) + 9 = 311 fr (10.37 s) — narration + 4 s gap drives
   - `split-3-and-3`: max(186 + 150, 180) + 9 = 345 fr (11.50 s) — narration + 5 s gap drives
   - `aggregator-prompt`: max(87 + 120, 195) + 9 = 216 fr (7.20 s) — narration + 4 s gap drives
   - `recap`: max(173 + 0, 300) + 9 = 309 fr (10.30 s) — motion drives
   - **Total: 1675 fr (55.83 s).**

5. **The emergent total (55.83 s) is BELOW the brief's 60-90 s band.** The brief is a HINT, not a target — per the v4 brief, "the true length is sum(cueFrames); accept drift." The drift comes from the lesson-pedagogy §8 minimums (3-5 s wait-time gaps) being a much larger floor than the brief's time band. The next wave (W4 composer) does NOT extend any cue; if it needs more motion, it cuts flourishes first.

6. **Exports unchanged from the v4 module shape:** `kptestFenyuheSixCues`, `kptestFenyuheSixDuration`, `kptestFenyuheSixVoiceClips`, `kptestFenyuheSixLessonCaptionCues`. The AudioLayer mounts one `<Sequence from={fromFrame}>` per voice clip; the CaptionLayer reads the same window; the scene reads the same window.

7. **No re-render of the audio file.** Per-cue clips are FROZEN at W3a (audio-gate passed). No W3.5 work touches `kptestFenyuheSixClips.ts` or the master WAV.

8. **Per-cue wait-time floor check (≥3-5 s, pedagogy §8):**
   - `split-1-and-5` echo gap: 4 s ✓
   - `split-2-and-4` echo gap: 4 s ✓
   - `split-3-and-3` echo gap: 5 s ✓
   - `aggregator-prompt` gap: 4 s ✓
   All four learner-response holds meet the ≥3-5 s floor.

## COMPREHENSION-FLOOR ADVISORY (pedagogy §8)

Storyboard `exposures` ledger (per-target spaced encounters: model + retrieval + recap):

| Target | Storyboard count | §8 floor | Status |
|---|---|---|---|
| 一和五 | 3 | ≥6-10 | **WARN — below floor (3/6)** |
| 二和四 | 3 | ≥6-10 | **WARN — below floor (3/6)** |
| 三和三 | 3 | ≥6-10 | **WARN — below floor (3/6)** |

The storyboard explicitly reasons this as the "co-equal airtime" choice (3和3 does NOT earn extra cues; the highlight lives in echo-3-and-3's extra DWELL seconds). That is §8's "breadth before depth" rule, which protects the three splits from the bug of over-drilling the hard one and starving the others. But it lands the three targets at 3/6-10 = 50% of the §8 floor.

The lesson's emergent total (55.83 s) is also below the brief's 60-90 s band. There is room in the band to add exposures, but the v4 brief forbids W3.5 from re-opening the W2b plan (and W4a forbids extending cue windows; it can only cut flourishes then compress motion). So this advisory is REPORTED, not BLOCKING.

Recommended downstream follow-up (NOT a W3.5 fix — requires a W1 re-plan): bump the per-target ledger to ≥6 by adding one extra spaced-recall pass per target (a second recap OR a per-target spaced recall), OR by adding a "see the splits one more time" beat in the recap. The storyboard's co-equal-airtime argument is correct for the cue-count axis; the exposure-count axis is a separate question that §8's "breadth before depth" does NOT resolve (it can co-equalize AT 3 OR AT 6 OR AT 10 — the floor is the floor).

## ANIMATIC GATE — BLOCKED on a pre-existing, out-of-scope issue

`npm run lesson:animatic -- --config lesson-data/kptest-fenyuhe-six/pipeline.json` exited non-zero with:

```
Error: Module build failed: Error: EPERM: operation not permitted, open
'/Users/tk/Desktop/animation-test/remotion-svg-primitives/lesson-data/kptest-compare-more-fewer/audio-cues.json'
```

This is the bundler trying to resolve a missing `audio-cues.json` for the **kptest-compare-more-fewer** lesson — a pre-existing data gap in a DIFFERENT lesson, not in kptest-fenyuhe-six. The animatic script bundles the full `Root.tsx`, which transitively imports every lesson's Complete*.tsx, and the kptest-compare-more-fewer import chain references the missing file. NOT a defect introduced by this W3.5 run; NOT a defect in the kptest-fenyuhe-six timeline; NOT something W3.5 owns. **The reconcile math is independently verified by the throwaway `npx tsx` run above (6 cues, 6 voice clips, 1675 fr total).** Pre-W4 composer should resolve the missing kptest-compare-more-fewer `audio-cues.json` (W1/W2c work) before running the animatic gate for this lesson; OR run the animatic in a sandbox that doesn't transitively import the broken lesson.

## ISSUES

- (WARN, advisory) Per-target exposures (一和五: 3, 二和四: 3, 三和三: 3) are below the lesson-pedagogy §8 floor of ≥6-10. The storyboard's co-equal-airtime choice is sound for cue-count balance, but does not satisfy the §8 exposure-count floor. W3.5 reports the ledger; the fix is a W1 re-plan (add a second spaced-recall pass) and is not in W3.5's scope. See "Comprehension-floor advisory" above.

- (informational, blocking the animatic gate) The pre-W4 animatic gate fails on a missing `audio-cues.json` in the kptest-compare-more-fewer lesson. The reconcile itself is verified independently (the kit function ran in a throwaway `tsx` test and produced the expected 6 cues / 6 voice clips / 1675 fr total). The composer can proceed; the kptest-compare-more-fewer gap is owned by that lesson's W1/W2c chain.

- (informational) Emergent total length 55.83 s is below the brief's 60-90 s band. Per the v4 brief, this is "accept drift" — the band is a HINT, not a target.

## PIPELINE FINDINGS

(workflow backlog — improvements to THIS node or the workflow as a whole)

- **P1 — The v4 migration's cue-id rename (W1 storyboard fix) means the previous W3.5 timeline was structurally broken.** The old `kptestFenyuheSixLessonTimeline.ts` used cue ids (`cue-announce-split-1of5` / `cue-conserve-1of5` / …) that the v4 clip module does not export. `reconcileClipTimeline` would have thrown "no visualBudget for cue" for every clip on first run. The W3.5 node needs a check: "the keys of `visualBudgets` must be a subset of `clips.map(c => c.id)`" — surfaced as a TS type narrowing, OR as a pre-call assertion. **Owns-by:** the W3.5 skill (assertion in the prompt) + the kit (a `validateVisualBudgets` helper).

- **P2 — The comprehension-floor advisory check (≥6-10 exposures per acquisition target) is structurally post-hoc.** The W3.5 node reads the storyboard's `exposures` ledger and the pedagogy §8 floor, but it can only WARN — it cannot FIX, because the fix is in the W1 plan (add beats). A cleaner pipeline has the §8 floor check run at W1 (storyboard) so the under-floor condition fails the W1 gate, not just gets warned at W3.5. **Owns-by:** lesson-pedagogy skill + the W1 storyboard skill.

- **P3 — The pre-W4 animatic gate runs `npm run lesson:animatic` which transitively bundles every lesson in `Root.tsx`.** Any pre-existing data gap in a sibling lesson blocks the animatic gate for this lesson. The animatic script should accept a `--only-this-lesson` flag (or a `--skip-broken` mode) so W3.5 can run the gate on the lesson it owns without being blocked by sibling-lesson data gaps. **Owns-by:** the animatic script.

- **P4 — The "above the band" vs "below the band" length drift is a clean v4 signal.** The brief's 60-90 s band is now reporting a known gap (this lesson: 55.83 s, ~4 s below the band's floor). Future W1 plans should treat the band as ±20% of the brief midpoint (i.e. 60-90 s → 48-108 s) and report drift against the band, not against the band's low end. **Owns-by:** brief template + the W1 storyboard skill.

- **P5 — The `WaitTimeFloor` per-cue check should be part of the kit's `reconcileClipTimeline` output, not a separate W3.5 hand-check.** The reconcile already knows each cue's `gapFrames`; returning `{ waitTimeSeconds, meetsWaitTimeFloor: boolean }` per cue would let the W3.5 log be a single line per cue (meets floor / gap = Xs / target = Y) and would surface a floor violation as a `kit:WARN` rather than a hand-rolled check. **Owns-by:** the kit (`reconcileClipTimeline`).
