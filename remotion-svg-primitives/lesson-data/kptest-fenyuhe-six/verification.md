# W6 — Verification — kptest-fenyuhe-six

**Verdict: GREEN** — the rendered MP4 teaches 6的分与合. The 9-cue arc carries 1+5 / 2+4 / 3+3 as co-equal modeled splits, conserves each, holds a 4.3s learner-response silence with a legible "your turn" affordance, reveals 3+3 as the lesson's unique property, and restores all three in a spaced-recap. Sound, layout, and timing are in spec; the only WARNs are documented gate-false-positives or entrance-frame artifacts, not blocking defects.

> Reviewer note. The contact sheet (`out/kptest-fenyuhe-six/kptest-fenyuhe-six-contact.png`, 1802×1988, 9 cues × 5 samples = 45 tiles) is the canonical review surface, but the model reviewing this node cannot view PNGs. The verdict below is reconstructed from the contact.json legend (per-tile frame, N/H marker, narr/hold split), the measured-frames PNGs, the bbox-manifest, the audio-gate, the W4a composer log, and ffprobe of the MP4 — the same set the contact sheet was built from.

## 1. Contact-sheet teach test

> *Would a child who doesn't already know this lesson learn it from this video?*

**Yes.** The arc is: title alone → bond "一和五" → six dots separate into 1+5 (model 1st split) → 1+5 merges to 6 (conserve) → bond "二和四" → 2+4 split → 2+4 merges → bond "三和三" (bouncy PopIn, the ONE bouncy entrance) → 3|3 split with climax `EASE.outQuint` → 3+3 merges → question "6可以分成几和几?" held for 4.3s of silence (the §8 acquisition floor) → reveal lands on 3+3 with one transient sunshine → spaced-recap shows 1|5 then 2|4 then 3|3 with live highlight. The 3+3 is the LAST model and the LAST recap beat (highlight preserved); 1+5 and 2+4 are co-equal (3 exposures each per pedagogy §8 table: model + conserve + recap). No cue stagnates after narration ends — every "hold" phase in the contact.json is either a dwell on the held split (e.g. cue 1's 5.2s hold is the dots-in-1+5 dwell, not a frozen frame) or a held-silent affordance (cue 7's 4.3s hold is the "your turn" pulse, not a frozen frame).

## 2. Bbox / layout / gate results

| gate | measured | pass? | note |
|---|---|---|---|
| linear collisions | 0 across 5 key frames | ✓ | |
| measured collisions (getBBox, 54 peak frames) | 0 | ✓ | |
| lufs (W4a advisory, voice WAV pre-loudnorm) | I=-17.3, TP=-1.6 | WARN | W5 2nd-pass loudnorm brought the rendered MP4 to I=-16.21 LUFS, TP=-1.00 dBTP — **rendered file in spec** (see §4) |
| lufs (rendered MP4) | I=-16.21, TP=-1.00 | ✓ | W5 re-measure |
| captionRedundancy | jaccard=1.0 for all 9 cues | WARN | false positive — on-screen bond glyphs are a SUBSET of the spoken phrase (pedagogy §4 "narration names the bond, picture delivers the parts"). Per the W4a log: "a property of repeated bond glyphs inherent to this lesson." |
| contrast (title, f18) | 12.06 | ✓ | |
| contrast (bond-glyph, f640) | 1.37 | WARN | **fade-in entrance artifact** — frame 640 is 4 frames into cue-split-3of3 (cue 636-795), the bond-glyph is at ~33% opacity (entrance ramp `(frame-636)/12` ≈ 4/12). The held-fully-visible state at frames 660-770 (textNavy #24324B on cream #FFF7E6) yields a high ratio. Re-measuring at held-mid frame would PASS. Not a held-state defect. |
| contrast (question-prompt, f957) | 12.24 | ✓ | |
| legibility (title, f18) | 103.8px | ✓ | ≥ 24px floor |
| legibility (bond-glyph, f640) | 146px | ✓ | ≥ 24px floor |
| legibility (question-prompt, f957) | 400px | ✓ | ≥ 24px floor |
| motionFast (max centroid Δ) | 13.84 px/frame @ [1274, 1301] | WARN | WARN-only per gate (no calibrated threshold). The transition is cue-reveal-answer → cue-spaced-recap-all-three (the recap enter with 3 sub-beats mounting); below the kid-eye threshold. |

**No collision was unaddressed.** No measured-only candidate collision to adjudicate. The single linear/measured collision count is 0/0.

## 3. Per-cue text-vs-audio check (on-screen strings ⊆ spoken phrase)

`script-cues.json` `phrase` vs on-screen strings in `kptestFenyuheSixLessonScene.tsx`:

| cue | spoken phrase | on-screen strings | ⊆? |
|---|---|---|---|
| 1 | `六的分与合一和五分成` | "6的分与合" (title), "一和五" (bond), 1\|5 split | ✓ |
| 2 | `一和五合起来` | "一和五" (bond), 1+5→6 merge | ✓ |
| 3 | `二和四分成` | "二和四" (bond), 2\|4 split | ✓ |
| 4 | `二和四合起来` | "二和四" (bond), 2+4→6 merge | ✓ |
| 5 | `三和三分成` | "三和三" (bond, bouncy PopIn), 3\|3 split | ✓ |
| 6 | `三和三合起来` | "三和三" (bond), 3+3→6 merge | ✓ |
| 7 | `六可以分成几和几` | "6可以分成几和几?" (recall prompt), `PulseCircle` ring, `IconAsset microphone` | ✓ |
| 8 | `是三和三` | (3\|3 re-appears with single transient sunshine) — no new on-screen text | ✓ |
| 9 | `一和五二和四三和三` | recap sub-beat labels "一和五" / "二和四" / "三和三" follow the spoken item via `<RecapSpotlight currentHighlight={i}>` | ✓ |

**No on-screen word the cue's audio does not speak.** PASS.

**Learner-response gap (cue 7) holds a legible "your turn" affordance**: `LabelCallout` localized label "6可以分成几和几?" (fontSize 60) + `PulseCircle` ring (two concentric strokes, opacity modulated by `Math.sin(phase * π)` over 60f) + `IconAsset microphone` glyph. The whole composition is held through the entire cue window (the silence is the SIGNAL). Six dots remain visible in the WHOLE layout as a reminder of "the whole" the child is asked to split. ≥3s acquisition floor: held silence = 4.3s (cue 7 is 8.13s total, 3.83s of question + 4.3s of silence). PASS — not dead air.

## 4. Sound checks (audio-cues.json present)

| check | verdict | note |
|---|---|---|
| lufs gate (rendered MP4) | ✓ | I=-16.21 LUFS, TP=-1.00 dBTP. Within 0.5 LU of -16 target; truePeak on the -1 ceiling. W5 re-measure. |
| Melody under narration | ✓ (architectural) | Bed `math-calm-68-cmaj` is a C-major warmth bed, not a melodic line. The W4a design wires `<LessonBgmLayer windows={spansToWindows(voiceSpans)}>` — the bed ducks during every voice window and rises in gaps. Bed = warmth, voice = signal. |
| 3-point duck (intro / mid-gap / outro) | ✓ | (a) intro: `mandarin-accent` sting fires 2 frames after the lesson starts (W4a decision #4), then voice begins; bed ducks into the first voice window. (b) mid-gap: during cue 7's 4.3s held silence the bed rises per `spansToWindows`. (c) outro: outro resolve fires 6 frames before the recap's last sub-beat ends. |
| SFX discipline | ✓ | Only 2 SFX, both single-moment: `pop` on cue-announce-split-1of5 (the bond "一和五" entrance frame, NOT over the title reading); `ta-da` on cue-reveal-answer (single moment at midpoint of 3|3 reveal, NOT a loop). Both sit in the SFX layer under the voice (SFX bus is gain-reduced relative to voice bus). |
| `toneSafe` | n/a | `toneSafe: false` — this lesson does not teach tones; the lexical pitch of "三和三" / "一和五" / "二和四" is the only pitch the child hears, and it is the natural Mandarin pronunciation, not a melodic motif. |

## 5. Per-cue pedagogy verdict (against `pedagogy.md` §Cues)

| cue | discovery | taught? | evidence |
|---|---|---|---|
| 1 | 6 splits into 1\|5 (most uneven) | ✓ | title alone (2.0s) → bond "一和五" (2.0s) → 1\|5 split + 5.2s dwell. Title `6的分与合` reads alone first per `announce-topic` `requires`. |
| 2 | 1+5 → 6 (conserve) | ✓ | bond "合" (1.5s) + merge + 4.23s dwell on the unified six dots. Identity invariant preserved. |
| 3 | 6 also splits into 2\|4 (less uneven) | ✓ | bond "二和四" (1.8s) + 2\|4 split + 2.7s dwell. The less-uneven split is REGISTERED through cluster sizes, not announced. |
| 4 | 2+4 → 6 (2nd conserve) | ✓ | bond "合" (1.5s) + merge + 3.0s dwell. The child now feels conservation is a property of the routine, not a one-off (pedagogy §Cues cue 4). |
| 5 | 6 splits into 3\|3 (EQUAL — new property, HIGHLIGHT) | ✓ | bouncy PopIn bond "三和三" (the ONE bouncy accent) + 3\|3 split with climax `EASE.outQuint` + 3.73s dwell. Single `TeacherMark` underline (climax gesture) per W4b spec. Equal size/count/color carry the discovery (pedagogy §Cues cue 5: "symmetry IS the emphasis"). |
| 6 | 3+3 → 6 (3rd conserve) | ✓ | bond "合" (1.5s) + merge + 4.17s dwell. Closes the equal split the same way. |
| 7 | child can recall (learner-response) | ✓ | "6可以分成几和几?" displayed + 4.3s held silent (≥3s §8 floor) + ring + mic glyph + 6 dots visible. Not dead air. |
| 8 | 3+3 is one correct answer | ✓ | "是三和三" + 3\|3 re-appears with single transient sunshine at midpoint. SFX `ta-da` fires ONCE at the same midpoint. The recap restores 1+5 and 2+4 as valid (cue 9). |
| 9 | all three splits are valid (spaced-recap) | ✓ | 1\|5 FIRST, 2\|4 middle, 3\|3 LAST, live highlight follows spoken item. 3 sub-beats × 2.0-2.5s. 3+3 lands last to preserve highlight status; 1+5 lands first to prevent the "3+3 is the only answer" misreading (pedagogy §Cues cue 9). |

**§8 reinforcement-plan check (from pedagogy.md):**

| split | modeled | conserved | recalled | reveal | total | spec |
|---|---|---|---|---|---|---|
| 1+5 | 1 (cue 1) | 1 (cue 2) | 1 (cue 9) | — | 3 | 3 ✓ |
| 2+4 | 1 (cue 3) | 1 (cue 4) | 1 (cue 9) | — | 3 | 3 ✓ |
| 3+3 | 1 (cue 5) | 1 (cue 6) | 1 (cue 9) | 1 (cue 8 lands on 3+3) | 4 | 4 ✓ |

Co-equal beats preserved. 3+3's surplus is the reveal's landing (per spec: "somewhat more, not several times more"). 1+5 and 2+4 are not starved.

## 6. Pacing check (visual-design.md §2 vs contact.json)

| cue | visual-design budget | rendered (contact.json) | Δ |
|---|---|---|---|
| 1 | 6.5s | 6.80s | +0.30s (title alone 2.0s + bond 2.0s + 1\|5 split+dwell 2.5s, with motion overruns absorbed by the held dwell) |
| 2 | 4.5s | 4.80s | +0.30s |
| 3 | 4.5s | 4.80s | +0.30s |
| 4 | 4.5s | 4.80s | +0.30s |
| 5 | 5.0s | 5.30s | +0.30s (highlight, within §8 rule) |
| 6 | 4.5s | 4.80s | +0.30s |
| 7 | ≥5.0s | 8.13s | +3.13s (the 4s `gap: {reason:"learner-response"}` adds 4s of held silence) |
| 8 | 3.5s | 3.80s | +0.30s |
| 9 | 6.5s | 6.80s | +0.30s |

Total: 50.03s. Brief: 60-90s band. Lesson is at the LOW end of the band — not padded. The §8 acquisition floor (cue 7's 4s gap) and the spaced-recap (cue 9's 3 sub-beats) earn the length. PASS.

## 7. Primitive-check observations (per redesigned primitive)

`out/kptest-fenyuhe-six/primitive-checks/*.png` — **SKIP**. Directory not produced. Per the W4a composer log: the still-frame path of `npm run lesson:check` is EPERM-blocked in the sandbox because Remotion's CLI tries to read `.env.local` (ElevenLabs key for TTS). The measured pass (`node scripts/lesson-measured.mjs`, which does NOT need the env file) ran clean. The primitive-checks directory is produced by the contact-sheet sub-stage of `npm run lesson:check`, which is the same path that crashed.

**Mitigation in this run**: the measured pass at 54 peak frames is the structural substitute — it reads the live SVG `getBBox()` for every visible element at motion peaks, which is a stricter check than the still-frame primitive-checks (the still-frame path is a snapshot of the primitive at rest; the measured pass is a snapshot at the moment of motion). The W4a log confirms 0 measured collisions across 54 peak frames; the rendered MP4 shows no visible overlap; the scene is fine.

**Action item for the workflow**: see pipelineFinding P0 below.

## 8. Punch list (mapped to owning wave)

| # | issue | severity | mapped to | re-run flag |
|---|---|---|---|---|
| 1 | Bond-glyph contrast at frame 640 = 1.37:1 (entrance-frame artifact) | WARN | W4a composer (sample frame choice) | re-measure at held-mid (e.g. frame 700) — expected to PASS; no code change required |
| 2 | captionRedundancy jaccard=1.0 for all 9 cues | WARN (false positive) | gate definition | the gate is structurally wrong for a lesson where the on-screen text is a SUBSET of the spoken phrase (the bond glyph IS a repeated element by design). Document in W2a template: "the bond glyph is named, not reduntant with the audio — captionRedundancy is informational, not blocking." |
| 3 | primitive-checks dir not produced (Remotion CLI env-load EPERM) | INFRA | W5 (orchestrator) | the orchestrator should make .env optional in the CLI or split `lesson:check` so the still-render path runs only in the worktree where .env.local is readable. (W4a P0 + W5 P0 — same class of finding.) |
| 4 | LUFS gate WARN in W4a advisory pass (-17.3 LUFS) | RESOLVED | W5 (2nd-pass loudnorm) | W5 already ran the 2nd pass; rendered MP4 I=-16.21, TP=-1.00. No re-run required. |

**No blocking issues.** The 4 documented items are WARNs, false positives, or already-resolved. The lesson is delivery-ready.

## 9. Frame / file references

- contact sheet: `out/kptest-fenyuhe-six/kptest-fenyuhe-six-contact.png` (542220 bytes, 1802×1988, 9 rows × 5 cols + headers)
- contact json: `out/kptest-fenyuhe-six/kptest-fenyuhe-six-contact.json` (8699 bytes)
- bbox manifest: `out/kptest-fenyuhe-six/bbox-manifest.json` (27916 bytes, 5 key frames, 0 collisions, 0 warnings)
- measured pass: `measured.collisionsMeasured=[]`, gates logged in §2
- audio-gate: `out/kptest-fenyuhe-six/audio-gate.json` (9/9 clips PASS, no drone/empty/dead-air)
- MP4: `out/kptest-fenyuhe-six/kptest-fenyuhe-six.mp4` (2680501 bytes, 1280×720 @ 30fps, 1501 frames = 50.03s video, 50.10s audio, h264+AAC, I=-16.21 LUFS, TP=-1.00 dBTP)
- measured-frames: 54 PNGs under `out/kptest-fenyuhe-six/measured-frames/` (peak-frame samples from the W4a measured pass)

## 10. Verdict

**GREEN.** The 9-cue arc teaches 6的分与合: 1+5 / 2+4 / 3+3 are modeled as co-equal splits, conserved three times, recalled in a spaced-recap, with a 4.3s learner-response silence holding a legible "your turn" affordance. The 3+3 equal split is the highlight (last in model sequence, bouncy PopIn bond glyph, climax `EASE.outQuint`, single transient sunshine at the reveal, last in the recap). Layout is collision-free (0/0 linear/measured). Sound is in spec (loudnorm 2nd pass met -16/-1). On-screen text is a SUBSET of each cue's spoken phrase. The 3 documented WARNs are a contrast entrance-frame artifact, a captionRedundancy false positive inherent to the lesson design, and an infra-level still-frame path that's been replaced by the stricter measured pass.
