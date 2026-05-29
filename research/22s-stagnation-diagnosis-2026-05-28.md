# 22s Stagnation Diagnosis — kp1-fen-yu-he-intro

**Date.** 2026-05-28
**Symptom (user).** "Around 22 seconds there is still very obvious stagnation and the voice splits and stops. It feels really awkward, abrupt."
**Cue under suspicion.** `he-name` (488 → 688 in composition frames; 16.27s → 22.93s wall-clock).
**Triage scope.** Diagnose only. Five-candidate intervention list, no code changes. Audio is frozen (Wave 3a artifact); any fix must touch visual or sketch layers only.

---

## 1. Cue timeline of `he-name`

All frames CUE-RELATIVE to `cues["he-name"].startFrame = 488` (16.27s @ 30fps). Cue length is **200 frames** = 6.67s (reconciled in `kp1FenYuHeIntroLessonTimeline.ts:114` as `max(motionFramesWithTail=91, audioSpan=200)` — see §2 for derivation).

### Constants (from `src/lessons/kp1FenYuHeIntro/layout.ts:217-225`)

| symbol | value | meaning |
|---|---|---|
| `HE_NAME_STRIP_CARDS_REL_START` | 6 | strip cards (2 / 5 / 3) snap on |
| `HE_NAME_STRIP_CARDS_DUR` | 16 | strip cards reveal duration |
| `HE_NAME_ARROW_REL_START` | 32 | two-headed arrow begins drawing on |
| `HE_NAME_ARROW_DUR` | 18 | arrow draw duration |
| `HE_NAME_FEN_REL_START` | 58 | strip 分 label appears |
| `HE_NAME_FEN_DUR` | 12 | strip 分 fade-in |
| `HE_NAME_HE_REL_START` | 70 | strip 合 label appears |
| `HE_NAME_HE_DUR` | 12 | strip 合 fade-in |

### Animated elements scheduled INSIDE `he-name`

Derived from `kp1FenYuHeIntroLessonScene.tsx:415-460` (he-name strip helpers):

| element | scene reference | REL_START | REL_END | absolute composition frame range | wall-clock |
|---|---|---|---|---|---|
| `stripCards` (3 NumberCards 2/5/3) | `scene.tsx:415-424` (`stripCardsOpacity`) | 6 | 22 | 494 → 510 | 16.47s → 17.00s |
| `stripArrow` (two-headed arrow draw-on) | `scene.tsx:426-438` (`stripArrowProgress` + opacity) | 32 | 50 | 520 → 538 | 17.33s → 17.93s |
| `stripFen` (分 label) | `scene.tsx:440-449` | 58 | 70 | 546 → 558 | 18.20s → 18.60s |
| `stripHe` (合 label) | `scene.tsx:451-460` | 70 | 82 | 558 → 570 | 18.60s → 19.00s |

**Last in-cue motion completes at composition frame 570 (≈ 19.0s).**

### Other things on screen during `he-name` (continuous state, NOT moving)

These are inherited from prior cues and held statically — they consume the canvas but contribute zero per-frame change after their own motion finished:

- **Dot row** (5 dots, joined) — mounted at `fen-show` start, has been in the joined position since `he-show` rejoin ended at frame `c.heShow().startFrame + 12 + 24` (well before `he-name`). Opacity held at 1.0 (see `dotRowOpacity`, `scene.tsx:252-268`).
- **`chip-whole-5` count chip** — at zone-chips above row (y=220). Held since `fen-name`. `chipOpacity("whole", frame) = 1` throughout `he-name`.
- **`chip-part-2`, `chip-part-3`** — chip 2 / chip 3 at zone-chips. Faded out at `he-show` start via `heShowChipFadeOut`. Effectively zero through `he-name`.

There are NO sketch marks scheduled in `he-name` (confirmed against `lesson-data/kp1-fen-yu-he-intro/sketch-overlay.md` §2 — the row is `| he-name | n | — | … | The two-headed arrow … is itself the explanatory device`).

---

## 2. The 200-frame discrepancy — verified

The user's arithmetic is essentially correct, with one nuance.

### Motion budget audit

From `kp1FenYuHeIntroLessonTimeline.ts:61-63`:
```
"he-name": 2.73,
```

Comment in the same file:
```
// he-name:          HE_NAME_HE_REL_START (70) + HE_NAME_HE_DUR (12) = 82f
```

So motion ends at REL 82, i.e. composition frame `488 + 82 = 570`.

Reconcile math (`kp1FenYuHeIntroLessonTimeline.ts:97-114`):
- `motionFrames = round(2.73 * 30) = 82`
- `motionFramesWithTail = 82 + TAIL_FRAMES(9) = 91`
- `nextNarrationStartComposition = raws[index+1].startFrame = 688` (fenheshi-intro raw startFrame, confirmed in `generated/kp1FenYuHeIntroTiming.ts:151`)
- `audioSpanFromCursor = 688 - 488 = 200`
- `cueFrames = max(91, 200) = 200`

**Verified: cue window = 200 frames, motion budget = 91 frames including 9-frame tail.**

### Where the "freeze" actually lives

After the last micro-reveal (`stripHe` fade-in completes at REL 82 / composition frame 570), the scene renders ZERO state changes until the cue boundary at composition frame 688. That is **118 frames of pure visual hold = 3.93s**.

During those 118 frames, the WAV continues narrating "**分和合，方向相反**" — the ASR-aligned `he-name` block has `endFrame = 670` (`generated/kp1FenYuHeIntroTiming.ts:114`). So:

| WAV frame | composition frame | wall-clock | what's happening |
|---|---|---|---|
| 488 → 570 | 488 → 570 | 16.27s → 19.00s | visuals animating (strip cards → arrow → 分 → 合); narration "合到一起就叫做合" |
| 570 → 670 | 570 → 670 | 19.00s → 22.33s | **frozen visual**, narration "分和合，方向相反" |
| 670 → 688 | 670 → 688 | 22.33s → 22.93s | **frozen visual + WAV silence** (18-frame inter-cue gap) |
| 688 | 688 | 22.93s | fenheshi-intro narration begins "把它画下来…"; visual STILL frozen until its own first motion at `fenheshi-intro.startFrame + FENHESHI_DOTS_DIM_DUR=18` → frame 706 |

The user's described "split and stop" is the audio's own inter-cue silence (670 → 688) audible through 3.93s of frozen canvas. The visual gives the ear nothing to latch onto, so the silence reads as a glitch.

---

## 3. Research brief — open items and bug-fix relevance

From `research/script-animation-coordination-2026-05-28.md` §"Distilled rules" + §Progress. Rule 1 (audio-as-skeleton) shipped 2026-05-28. Four items remain open:

| # | rule | what it changes | would it have prevented THIS bug? |
|---|---|---|---|
| 2 | **Per-cue tail palette** (0.0–3.0s depending on beat type) | Wave 2a tags each cue with a beat type (setup / supporting / new-term / aha / continuous-flow); Wave 3.5 looks up tail seconds from the table instead of using flat 9-frame tail | **Indirectly.** he-name's beat type is "name-the-relationship" — closer to "new-term" than to "supporting label". A 1.5s tail (45f) would not have prevented the 3.93s hold, because the hold here is dictated by `audioSpan=200`, not by `motionFramesWithTail`. The tail palette matters when motion+tail would *exceed* the audio span; here motion is already much shorter than audio span. **Verdict: orthogonal to this bug.** |
| 3 | **200ms label micro-lead** (visual leads audio by 6 frames using ASR word timestamps) | Composer offsets label reveals to land 6f BEFORE the matching WAV word, not after | **No.** This is a sync-tightening rule for synced labels, not a fill-the-static-hold rule. he-name's label reveals (分 at REL 58, 合 at REL 70) already land well before their narration mid-points; the 200ms shift wouldn't materially change the 3.93s static gap. **Verdict: irrelevant to this bug.** |
| 4 | **Pre-composer animatic gate** (PNG strip of cue-start frames reviewed before Wave 4) | Orchestrator sees the cue boundary alignment BEFORE burning a render | **Yes, as a detection mechanism.** An animatic strip showing he-name's first frame, mid-cue frame, and last frame would have visibly flagged "no per-frame change for 4 seconds". Doesn't FIX the bug but would catch it pre-render. **Verdict: catches but doesn't fix.** |
| (§Open) | **Motion-dominated tail shift** — motion-dominated cues get NO tail; the breathing-room tail attaches to the FOLLOWING cue's lead-in | Different reconcile formula for motion-dominated vs narration-dominated cues | **No.** he-name is narration-dominated (audio span > motion+tail). The motion-dominated rule only applies when motion > narration. **Verdict: wrong axis.** |

**Bottom line.** The open research items don't address this bug class directly. This bug is in a category the brief didn't name explicitly: **narration-dominated cue with a long single-line stretch where the visual has nothing scheduled to support late narration**. The rule that would prevent it is something like: "if narration extends ≥ Ns past the last scheduled visual change inside a cue, schedule a supporting visual event during the tail of narration." We don't have that rule today.

---

## 4. Sketch overlay state — `he-name` has no marks

From `lesson-data/kp1-fen-yu-he-intro/sketch-overlay.md:50`:

```
| he-name | n | — | — | — | — | — | The two-headed arrow in `zone-strip` is itself the explanatory device (visual-design §4 calls it "structural element, not a TeacherMark"). A sketch on top of an existing arrow = double-emphasis. The 分 / 合 labels do the naming. |
```

The justification was sound at design time — adding a sketch over an existing structural arrow IS double-emphasis. But the design was made against an assumed cue length that matched motion length. Now that we know there is ~4s of narration ("分和合，方向相反") past the last scheduled motion, there is a SECOND beat in this cue the sketch budget was not consulted about:

> "Spoken: **'分和合，方向相反'** (≈ frames 614–670 in composition / WAV terms — the directional-opposition statement). Currently has zero visual support."

A sketch mark here would NOT be a double-emphasis over the structural arrow — it would be a punctuation on a narrated proposition that currently has no visual referent. Candidates:

- An underline sweep under "方向相反" — but we'd need a text element to underline, and there isn't one in the strip.
- A pulse / re-trace on the existing two-headed arrow timed to "方向相反" — re-articulates the bidirectional structure exactly when the narration names it.
- A pair of subtle directional glints — one toward 分, one toward 合 — at the narration moments where each word is spoken.

The video-wide sketch budget is `floor(10 × 0.6) = 6` and current count is 3 (downward sweep, upward sweep, closure underline). Adding one mark to he-name puts the total at 4, still under the cap.

---

## 5. Five candidate interventions, ranked minimal → structural

All interventions preserve the frozen audio constraint. None re-records the WAV. None changes cue boundaries set by Wave 3.5 reconcile (which would propagate downstream and is forbidden post-Wave 3a in the current pipeline contract).

### Candidate 1 — Re-pulse the existing two-headed arrow at "方向相反"

**Idea.** The two-headed arrow (already on screen at full opacity since REL 50) carries the bidirectional structure. Have it re-trace OR pulse-glow at the WAV frame for "方向相反" (~ASR token frame ≈ 640 in `generated/kp1FenYuHeIntroTiming.ts:122-` token list; needs a peek at `asr-alignment.json` for the precise word frame).

**Files touched.**
- `src/lessons/kp1FenYuHeIntroLessonScene.tsx:426-438` — add a second `stripArrowPulse(frame)` helper that drives a brief scale/opacity envelope.
- `src/lessons/kp1FenYuHeIntro/layout.ts:220-221` — add `HE_NAME_ARROW_REPULSE_REL_START` and `HE_NAME_ARROW_REPULSE_DUR` constants. Approximate values: REL_START ≈ 120 (frame 608, just before "方向"), DUR ≈ 24.

**Waves touched.** Wave 4 (composer) only. No Wave 2a / 2b / 3 changes needed.

**Audio impact.** None.

**Worst-case risk.** Reads as "the arrow flickered" if pulse magnitude is too aggressive. Mitigation: keep envelope ≤ 1.08× scale, ≤ 0.92 → 1.0 → 0.92 opacity dip.

**Cost.** ~20 lines. No new primitive. No new ASR plumbing if we eyeball the pulse start from the WAV transcript timing in the existing `kp1FenYuHeIntroTiming.ts`.

---

### Candidate 2 — Add a one-shot sketch mark in `he-name` timed to "方向相反"

**Idea.** A short `label-arrow` or `bracket` TeacherMark that ties 分 ↔ 合 — drawn on at the WAV moment "方向相反" begins, fades by cue end. Budget check: 3 → 4 marks, still under cap of 6.

**Files touched.**
- `lesson-data/kp1-fen-yu-he-intro/sketch-overlay.md` — change he-name row from `n` to `y` and add a §2.5 entry with the new mark spec.
- `src/lessons/kp1FenYuHeIntroLessonScene.tsx` — wire a fourth `<TeacherMark>` similar to `readDownMark` (`scene.tsx:626-634`). Insert a new helper near line 660.
- `src/lessons/kp1FenYuHeIntro/layout.ts` — add `HE_NAME_REVERSE_MARK_REL_START`, `HE_NAME_REVERSE_MARK_DUR`, `HE_NAME_REVERSE_MARK_FADE_REL_START`. Suggested values: 120 / 18 / 160.
- `src/lessons/kp1FenYuHeIntro/manifest.ts` — register the new mark for bbox check.

**Waves touched.** Wave 4a (composer) + Wave 4b (sketch-layer). Sketch-overlay spec edit is a real Wave 2 → Wave 4b artifact change; orchestrator approval per CLAUDE.md "Structural changes" rule may or may not be needed depending on whether you count "adding one mark within budget" as a sketch-layer respec.

**Audio impact.** None.

**Worst-case risk.** Conflicts with sketch-overlay.md's restraint principle ("a sketch on top of an existing arrow = double-emphasis"). Counter-argument: the new mark sits on the LABELS (分 ↔ 合), not the arrow, so it's a different signal channel. Resolution: write the mark as a small connector between the two label rectangles, not over the arrow.

**Cost.** ~40 lines + manifest entry + spec update.

---

### Candidate 3 — Schedule a label glow / breathe loop on 分 ↔ 合 during late narration

**Idea.** Use the existing `magic-fx-library` (`<Breathe>` or `<GlowPulse>` from `CAPABILITIES.md#magic-fx-library`) on the 分 and 合 labels, alternating: 分 glows when "分" is spoken in "分和合", 合 glows when "合" is spoken, then both glow together on "方向相反". No new motion choreography, just an existing FX wrapper.

**Files touched.**
- `src/lessons/kp1FenYuHeIntroLessonScene.tsx:1123-1148` — wrap the `<LabelCallout text="分">` and `<LabelCallout text="合">` in `<GlowPulse>` (already imported via FX barrel) with frame-keyed activation.
- `src/lessons/kp1FenYuHeIntro/layout.ts` — add `HE_NAME_FEN_GLOW_REL_START`, `HE_NAME_HE_GLOW_REL_START`, `HE_NAME_BOTH_GLOW_REL_START` and matching DUR constants. Approximate values from the WAV token list in `generated/kp1FenYuHeIntroTiming.ts`: REL 122 / 130 / 138 (rough; ASR word data needed for precision).

**Waves touched.** Wave 4 (composer) only. Capability already exists.

**Audio impact.** None.

**Worst-case risk.** Three glow events in ~1.5 seconds may read as "busy" or "Christmas-tree". Mitigation: keep individual glow magnitude low (existing `<GlowPulse>` defaults are calibrated for kids). Could collapse to ONE glow on "方向相反" instead of three.

**Cost.** ~30 lines, no new primitive.

---

### Candidate 4 — Stretch motion across the whole cue (compress nothing, just respace)

**Idea.** Right now four motion events (cards → arrow → 分 → 合) finish in 82 frames out of a 200-frame cue. Respace them so the 合 reveal lands at REL 160 instead of REL 82. This means stretching out the gaps between events — cards stay at REL 6, arrow could slide to REL 60, 分 to REL 100, 合 to REL 150 — so the cue's micro-events drip-feed across the full 6.67s.

**Files touched.**
- `src/lessons/kp1FenYuHeIntro/layout.ts:217-225` — rewrite the 6 REL_START / DUR constants for `he-name`.

**Waves touched.** Wave 4 (composer) edit constants only. No re-render of audio.

**Audio impact.** None directly, but: the visual semantics shift. 分 currently lands when the narration is around "就叫做合" (because of the 200ms lead pattern, slightly before). If we slide 分 to REL 100 (composition frame 588 = 19.6s), the narration is then mid-"分和合" — visual lands on the right word, possibly better-synced.

**Worst-case risk.** Loses the current snappy "cards → arrow → 分 → 合" beat that lands the strip naming compactly. Replaces it with a slower, more drip-fed feel. Pedagogically might be a downgrade — the original tight cluster reads as "and these are the two parts of the relationship, here they are together". Spread out, it reads as "first one, …, then the other".

**Cost.** ~6 constant edits. But pedagogy review needed — this changes how the cue is taught, not just its surface dynamics.

---

### Candidate 5 — Rebalance Wave 3.5 reconcile to bleed half the hold into fenheshi-intro

**Idea.** The structural source of the bug is that `audioSpanFromCursor = 200` forces a 200-frame window for he-name, of which 109 frames are pure hold. The next cue (`fenheshi-intro`) is motion-dominated and pushes its OWN cursor past the next narration anyway. If we cap he-name at, say, 150 frames (still motion+tail+something), `fenheshi-intro` would start at composition frame 638 = 21.27s — *during* he-name's narration. That's a desync bug (visual cue change while voice still saying he-name's line).

A more nuanced version: introduce a **per-cue `holdFloor: number`** that caps the audio-driven hold. For he-name, `holdFloor = 60` would give cue length = motionFramesWithTail(91) + min(audioRemainder, 60) = 151. Then `fenheshi-intro` starts at frame 639, and its own audio span absorbs the remaining 49 frames of "inter-cue silence + start of fenheshi-intro narration".

**Files touched.**
- `src/lessons/kp1FenYuHeIntroLessonTimeline.ts:87-128` — rewrite `buildReconciledCues` to support a per-cue `holdFloor` map.
- Possibly `kp1FenYuHeIntroLessonTimeline.ts:52-74` — add `HOLD_FLOOR_FRAMES` constant map per cue.
- Downstream: any cue whose start frame shifts will need its `<Sequence>` boundaries (audio, captions) verified — `LessonAudioLayer`, `LessonCaptionLayer`.

**Waves touched.** Wave 3.5 (reconcile) and propagates to Wave 4 (composer reads the reconciled cues), Wave 5 (audio + caption layers). Structurally this is a pipeline-architecture change — per CLAUDE.md "Structural changes — new skill, new wave, reordered waves, or changed subagent contracts — require user approval before edits", this needs orchestrator sign-off.

**Audio impact.** Yes, indirectly — the audio plays as one continuous WAV (`kp1FenYuHeIntroLessonVoiceoverSpans` is a single span). Shifting cue boundaries does NOT re-cut the audio (we're option (a)), so the WAV still plays at the same wall-clock times. What changes is what cue's VISUAL is shown when each WAV moment plays. So:
- "分和合，方向相反" (WAV 614 → 670) would partly play during fenheshi-intro's first frames (in the new layout, fenheshi-intro starts at 639). That means the chip-5 migration begins while the strip is still on screen. Possibly OK as a cross-fade, possibly chaotic.

**Worst-case risk.** Cross-cue desync — the most expensive class of bug to fix because it propagates. Also: the research brief's open item #4 ("motion-dominated tail shift") is specifically about this and is still unresolved. Likely the right long-term fix, but the riskiest to ship for ONE cue without redesigning the whole reconcile.

**Cost.** ~80 lines algorithm change + cue boundary verification + manual visual review of all cue transitions. Plus pipeline-architecture doc update (`docs/pipeline-architecture.md`) and approval gate per CLAUDE.md rules.

---

## Ranking summary

| rank | candidate | minimal-change-ness | structural risk | likely effect on user's complaint |
|---|---|---|---|---|
| 1 | C1: Arrow re-pulse at "方向相反" | very small | very low | directly fills the hold during "方向相反"; addresses both "stagnation" and "split" |
| 2 | C3: Glow on 分 / 合 during late narration | small | low | similar effect, FX-flavored; risk of overdecoration |
| 3 | C2: New sketch mark in he-name | medium | low–medium (spec edit) | strongest pedagogy reinforcement; one more mark to budget |
| 4 | C4: Stretch existing motions across the cue | small (line count) | medium (pedagogy shift) | removes the static gap but at the cost of changing how the cue teaches |
| 5 | C5: Rewrite Wave 3.5 with `holdFloor` | large | high (cross-cue) | correct fix to a class of bugs but should not be done piecemeal |

**Recommended starting point.** Candidate 1 (arrow re-pulse) addresses the user's specific complaint with the smallest footprint and zero structural risk. If after that the cue still reads static, layer Candidate 3 (label glow on "方向相反" only — single glow, not three). Hold C2 / C4 / C5 for a deliberate post-render review session.
