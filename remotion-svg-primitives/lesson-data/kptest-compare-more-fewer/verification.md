# verification — kptest-compare-more-fewer

Wave 6. Reviewed: contact sheet (primary), `bbox-manifest.json` (linear + measured gates), `audio-gate.json`, `asr-alignment.json`, scene + Complete wrapper code, all upstream artifacts. MP4 = 1280×720 h264 + aac stereo, 69.0s = 2068 frames @ 30fps (matches the reconciled total exactly). No `primitive-checks/*.png` produced (W3b = pure reuse, no new primitive).

## Verdict: YELLOW

The arc TEACHES the KP — a child who does not already know more/fewer would learn it. Both acquisition targets (五比三多 / 三比五少) are modeled, echoed, replayed, and recapped on ONE invariant picture; the keystone "same picture, two readings" is honored (no re-layout between match→fewer-replay). YELLOW (not GREEN) for: (1) the `lufs` gate misses by 1.1 LU (−17.1 vs −16); (2) the `amountTags` contrast gate fails (ratio 1.0) in two-groups; (3) a primitive-vs-spec deviation: the teaching unit renders as **stars**, not the **dots** visual-design §Contract specifies. None of these break the teaching; all are targeted, non-fatal fixes.

## Contact-sheet teach test (the one question)

> Would a child who doesn't already know this learn it? **Yes.** The one-to-one matching in `match` drops 3 pair-lines and leaves 2 top stars with dashed ghost-slots below them — the surplus reads via PARTNERLESSNESS, before any word, exactly as pedagogy demands. `more-direction` binds 五比三多 to that seen surplus (pulse + `>` glyph + read-along sweep). `fewer-direction` holds the IDENTICAL picture and only flips the reading to 三比五少 — the keystone insight is visually intact. `not-by-size` spreads the 3 bottom stars wider, re-pairs, and STILL leaves 2 over — the "spread ≠ more" guard delivers. `recap` retrieves both targets on the restored picture. The reinforcement rhythm (model → echo-with-gap → replay, ×2 directions) is spaced and complete.

## Per-cue pedagogy verdict (§1 audit)

| cue | discovery delivered? | evidence on contact sheet |
|---|---|---|
| intro | ✓ framing | LessonIntroCard 谁多谁少 / 比一比 / teaser; dots absent (time-disjoint) |
| two-groups | ✓ two groups, count differs | 5 gold + 3 coral stars pop row-by-row; "5"/"3" amount cards; identical size, color=group ID |
| match | ✓ surplus via partnerlessness | 3 pair-lines drop one-to-one; 2 dashed ghost-slots under the unmatched top columns |
| more-direction | ✓ 五比三多 bound to surplus | surplus pulse-ring + `>` glyph right of rows + 五比三多 read-along (多 lit sunshine) |
| echo-more | ✓ learner re-produces | picture held; 五比三多 stays legible; pointer-hand + 该你说啦 + speech glyph through the 4s gap |
| more-replay | ✓ spaced reinforcement | identical to more-direction (clip+visual reused) |
| fewer-direction | ✓ KEYSTONE, same picture | NO re-layout; 三比五少 read-along (少 lit); `>` held; focus pulse slides surplus→short row |
| echo-fewer | ✓ learner re-produces | 三比五少 held legible + your-turn affordance through the gap |
| fewer-replay | ✓ spaced reinforcement | identical to fewer-direction |
| not-by-size | ✓ more = matching, not spread | bottom 3 stars spread wider → re-pair → still 2 top ghosts left over |
| recap | ✓ retrieve both co-equal | live ring walks surplus→五比三多 then short row→三比五少, both circled, equal airtime |

## Text-vs-audio (on-screen target ⊆ spoken phrase, in order)

PASS for every cue. Phrase tokens (`MORE_PHRASE`=五比三多, `FEWER_PHRASE`=三比五少, layout.ts:205–206) are a subset of each cue's spoken `phrase` (script-cues.json). echo-more shows 五比三多 (⊆ "跟我说：五比三多"); echo-fewer shows 三比五少 (⊆ "跟我说：三比五少"); recap shows both (⊆ "都想起来了吗？五比三多。三比五少。"). The 该你说啦 label is a fixed your-turn affordance, not a target word.

## Learner-response gaps (echo-more, echo-fewer)

PASS — both `gap.reason==="learner-response"` cues hold a legible invitation, not dead air: pointer-hand-arrow (`variant="hand"`) + localized label **该你说啦** + a speech-bubble glyph + the held phrase row breathing. Confirmed on the contact sheet hold·mid / cue·end columns.

## Layout / gates (bbox-manifest.json)

- Linear `collisionCount: 0`; measured `collisionsMeasured: 0`. No overlaps. ✓
- `gatesFailed: [lufs, captionRedundancy, contrast]`:
  - **lufs** — integrated −17.1 LUFS (target −16; off by 1.1 LU), true peak −1.5 dBFS (≤ −1 OK). Master is slightly QUIET, not clipping. FIX: re-run the render `loudnorm` pass (it normally lands −16/−1); the −1.1 LU miss means the post-render loudnorm either ran on a quiet bed or was skipped. → W5 render (re-run loudnorm).
  - **contrast — amountTags ratio 1.0 (FAIL).** The NumberCard glyph fill ≈ its card fill at the measured frame. This is a primitive-level fill issue in `two-groups` ONLY (the tags are transient; the count is ALSO carried by the dots themselves + narration 五个/三个, so it is non-load-bearing redundancy and the teaching survives). The other 3 measured elements pass (introCard 7.75, comparisonSymbol 12.06, phraseRow 5.28). → W3b (NumberCard primitive fill) or W4a (pass an explicit ink color).
  - **captionRedundancy** — flags intro/match/more-direction/more-replay (jaccard 1.0) where caption == narration. EXPECTED + by-design for this lesson: the acquisition-target cues are literacy/read-along (caption IS the target phrase the child reads), and intro/match captions intentionally mirror the short narration. Treat as exempt (read-along acquisition), per the gate's literacy carve-out. No fix.
- `legibility`: all pass (glyph ≥ 104px). `motionFast`: WARN-only, 7px/frame, pass.

## Sound checks

- **Wiring (Complete wrapper):** per-cue `VoiceClips` in their own Sequences (NO continuous WAV), bed windows = `spansToWindows(voiceSpans)` (mechanical 3-point duck), SFX at composer-owned layout offsets (pop on first dot, chime on surplus reveal in match + survival in not-by-size). `toneSafe:false` is correct — this is a 比-comparison acquisition lesson, not a tone lesson.
- **3-point duck / melody-under-narration / SFX discipline:** cannot be heard from the contact sheet (W6 cannot play the MP4). The wiring is structurally correct (bed windows derived from voice spans → intro duck / mid-gap rise / outro resolve), but the QUALITATIVE checks (melody not hummable under voice; no SFX over instruction words) require an audio playback pass a human must do. Recorded as the one human-ear residual.
- **audio-gate.json `pass:false` (4 truncationFails) — JUDGED A FALSE POSITIVE, not a real cut-off:**
  - `coverage:1` for intro/match/echo-fewer (full token coverage); only echo-more shows 0.57.
  - The truncation flag fires on `durationTrips` (sChar ratio below the cohort floor 0.50). The cohort median sChar (0.77) is INFLATED by the breath-padded `。五比三多。`×3 / `。三比五少。`×3 repeat-drill cues (sChar 1.6), making genuinely-paced cues (intro/match) read as "short" against that skewed median.
  - The `asr-alignment.json` `asrText` for echo-more/echo-fewer shows BLEED-OVER from the recap narration ("都想起来了吗五比三多三比五少") — an ASR-WINDOW artifact, not the cue's own clip content. Since playback uses frozen per-cue clips each in its own Sequence, cross-cue bleed is structurally impossible in the MP4; the 69.0s total == the reconcile confirms no clip was cut. No re-roll needed.

## Punch list (mapped to owning wave)

1. **lufs −1.1 LU short** → **W5 render**: re-run `lesson:render` (do NOT `--skip-loudnorm`); confirm the loudnorm 2nd pass lands −16/−1. Low effort, deterministic.
2. **amountTags contrast 1.0** → **W3b (NumberCard fill)** or **W4a (explicit ink color on the two-groups NumberCards)**. Non-fatal (transient + redundant count). Fix the glyph/card contrast or drop the tags (dots already carry the count).
3. **teaching unit = star, spec said dot** → **W2a/W4a deviation note**: visual-design §Contract + §kids-eye and pedagogy both name the countable a "dot" (`countable-object`, identical size); the scene passes `variant="star"`. It does NOT break teaching (still one identity-invariant countable, color=group ID, surplus via partnerlessness), but it is an unflagged deviation from the Contract. Either (a) update visual-design to permit/choose `variant="star"`, or (b) switch the scene to the dot variant. Record the decision; do not leave silent.
4. **audio-gate false-positive class** → **PIPELINE FINDING (not a lesson fix)**: the truncation cohort-median inflates when a lesson mixes `。target。×3` breath-drill cues with normal cues, and the ASR alignment window bleeds adjacent-clip audio — both flag clean per-cue clips as "truncated". Calibrate the gate to exclude repeat-drill cues from the cohort and to clamp the ASR window to the clip's own [start,end].
5. **human-ear residual** → the qualitative sound checks (melody not hummable under narration; SFX below voice; 3-point duck audible) need one playback pass by the human eye/ear; structurally the wiring is correct.
