# Verification — ten-ones-make-one-ten

Wave 5 audit of the rendered lesson. Reporting only — no code/spec edits performed.

## Summary

**Verdict: RED.** Ship blockers found:

1. **Voice clipped — cue 3 was not spoken.** `gemini-voice.json#transcriptText` shows only `"一，二，"` between cue 2 and cue 4; the Gemini TTS never read `一，二，三，一直数到十。`. The audio jumps directly from `count-one-by-one` to `feels-slow`. The whole "count 1 through 10" beat is missing as voice, captions still claim it for ~6.3s, and the scene's per-stick badge highlight runs against silence.
2. **Render is 28.4s, target was 60–90s.** Less than half the brief's floor. The 38% audio underrun (27.7s actual vs 45.4s estimated) compounds with the clipped cue 3 and lost inter-cue gaps.
3. **Scene reads sketch marks at the wrong frames.** `TenOnesMakeOneTenLessonScene.tsx` hardcodes sketch `drawStart` at the *audio-captions plan* absolute frames (694, 891, 1089, 1449, 1675) — but the actual ASR-derived cue boundaries are 314, 400, 488, 669, 765. Every TeacherMark fires far after its cue has ended (some after the video ends at frame 851), so most/all sketch overlays never appear.

## 1. Render readiness

- File: `out/ten-ones-make-one-ten/ten-ones-make-one-ten.mp4`, **2,234,907 bytes**, mtime 2026-05-19 21:23.
- ffprobe: container `mov,mp4`, duration **28.416s** (851 frames @ 30fps).
- Video: H.264 High, 1280×720, 30fps, yuvj420p, 851 frames, 303 kbps.
- Audio: AAC LC, 48 kHz stereo, 28.416s, 317 kbps.
- Status: OK as an artifact. **Resolution mismatch:** visual-design §1 declared 1920×1080; rendered output is 1280×720 (Remotion theme default). Primitives are vector and scale, so this is cosmetic but not what visual-design specced.

## 2. Duration vs target

- Brief target: **60–90s**.
- Rendered: **28.42s** (851 frames). `tenOnesMakeOneTenAlignedDuration = 851` matches.
- Gap to brief floor: **−31.6s (53% under)**.
- Root cause: Gemini voice produced 27.7s of audio (38% under the 45.4s narration estimate), the ASR-aligned cues collapsed inter-cue holds to ~0.5s, and `count-to-ten` was clipped to ~6.3s of silent placeholder time. **RED flag.**

## 3. ASR alignment fidelity (per cue)

| id | matchScore | start–end (frame) | duration (s) | phrase | asrText (head) | confidence |
|---|---|---|---|---|---|---|
| opening | 0.933 | 26–74 | 1.60 | 看这里有许多小棒 | 看 这 里 有 许 多 小 蹦 我 们 一 根 | asr-derived |
| count-one-by-one | 0.933 | 93–120 | 0.90 | 我们一根一根地数 | 许 多 小 蹦 我 们 一 根 一 根 的 数 一 数 了 十 | asr-derived |
| count-to-ten | **0.667** | 122–312 | **6.33** | 一二三一直数到十 | 我 们 一 根 一 根 的 数 一 数 了 十 次 才 数 完 | asr-derived |
| feels-slow | 1.0 | 314–382 | 2.27 | 数了十次才数完 | 根 的 数 一 数 了 十 次 才 数 完 我 们 把 这 | asr-derived |
| bundle-action | 1.0 | 400–467 | 2.23 | 我们把这十根捆在一起 | … 我 们 把 这 十 根 捆 在 一 起 … | asr-derived |
| rename-bundle | 1.0 | 488–563 | 2.50 | 这一捆就叫一个十 | … 这 一 捆 就 叫 一 个 十 … | asr-derived |
| still-ten-ones | 1.0 | 584–641 | 1.90 | 捆里还是十根小棒哦 | … 捆 里 还 是 十 根 小 棒 哦 … | asr-derived |
| faster-count | 1.0 | 669–746 | 2.57 | 现在数一捆只要数一次 | … 现 在 数 一 捆 只 要 数 一 次 … | asr-derived |
| recap | 1.0 | 765–833 | 2.27 | 十个一就是一个十 | … 十 个 一 就 是 一 个 十 | asr-derived |

Flags:
- **`count-to-ten` matchScore 0.667** — below the 0.8 threshold. `matchText` is `一 根 的 数 一 数 了 十`, fragments stitched from neighboring cues' tokens because the aligner could not find `一 二 三 一 直 数 到 十`. The actual voice clip has none of `二`, `三`, `一直`, `到`. The aligner gave this cue 6.33s of empty span to bridge the silence/preceding-cue tail to the next confident match. (See §4.)
- **`opening` 1.60s and `count-one-by-one` 0.90s** — both under the 0.6s "too short to read caption" gate? Actually count-one-by-one (0.90s) is under the 1.0s caption-readability threshold from audit step 8. Flag.
- No cue has confidence other than `asr-derived` — clean on that axis.
- `phrase` vs `asrText` mismatches: aside from the cue-3 catastrophe, the aligner picked up `蹦` instead of `棒` in cues 1–2 (homophone substitution from the streaming ASR). The phrase text and captions still say `棒` — the visual will show the right character; only the alignment match text is wrong. Acceptable.

## 4. Cue 3 (`count-to-ten`) deep dive

**What was scripted:** `一，二，三，一直数到十。` (Gemini was sent the full line.)

**What the voice spoke** (per `gemini-voice.json#transcriptText`):
```
…我们一根一根地数。
一，二，
数了十次，才数完。
…
```
The voice produced only `一，二，` and then jumped to the next cue. The ASR confirms this: between the `count-one-by-one` tokens ending at `t=6.20s` (a stray `一`) and `feels-slow` tokens starting at `t=10.65s` (`数`), the only emitted tokens in the gap are the one stray `一` at 6.20s. There is no `二`, `三`, `一直`, `数到`, `十` in the audio for cue 3.

**ASR-aligned cue 3 details:** start 122 (4.05s), end 312 (10.40s). 190 frames, 6.33s — but the audio underneath those frames is *silence + the tail of cue 2 + the head of cue 4*. The caption "一，二，三，一直数到十。" stays on-screen for 6.33s with no matching speech.

**Diagnosis:** This is exactly the failure mode Wave 2b flagged in `audio-captions.md` §6 item 1 — the adjacent `一 一` tokens caused Gemini's TTS to short-circuit the line. The voice never produced cues 3 in full; the recommendation was to either reword (`一、二、三，数到十。`) or `phrase: 一 二 三 数 到 十`. Neither change was applied before render.

**Recommendation:** Re-record voice with the reworded narration (or split cue 3 into per-digit clips), then re-ASR-align and re-render.

## 5. Continuity / pedagogy check

Read `TenOnesMakeOneTenLessonScene.tsx`. Pedagogy invariants:

- **10 sticks live the whole video:** YES. One `Array.from({ length: STICK_COUNT }, ...)` group, sticks are React-keyed by `index`, blended through scatter → row → bundle layouts via `blendPlacement`. No destruction/recreation. PASS.
- **Bundling is the climax:** YES. Single `bundle-action` cue, `BundleWrap` mounted only at `frame >= bundleStart + 36`, `wrapProgress` 0→1 over 24f. One gesture. PASS.
- **No KP3 leakage:** PASS. No `数位`, `十位`, `个位`, no two-digit numeral, no place-value language. The label is `一个十`, recap is `十个一 = 一个十`. The scene's SceneFrame `eyebrow` reads `计数单位` which **is** a slightly clinical term — the brief said "Do not say 计数单位 out loud (too abstract for 6-year-olds)" but that constraint applied to *narration*. As an offscreen UI eyebrow tag it does not enter the audio. Still, flag for review — the eyebrow text is visible on screen and a 6-year-old can read it.
- **Recap presents "十个一，就是一个十":** YES. Scene renders `十个一 = 一个十` (equation form) at recap; caption text per `script-cues.json` is `十个一，就是一个十。` PASS for spoken/caption content; the on-screen sentence uses the `=` glyph rather than the comma form. Acceptable per visual-design §2 `recap`.

## 6. Coverage check

**TeacherMark instances:** Scene declares **5** SketchMarkSpec entries (feels-slow underline, bundle-action wrap-arc, rename-bundle label-arrow, faster-count vs-mark, recap underline). Matches sketch-overlay §2 / §5. PASS structurally. **But see §3 timing bug below — they're scheduled at the wrong absolute frames.**

**Primitives imported and used (from gap-scan §4):**
- `SmallStick` — used in live group + ghost. PASS.
- `getStickPlacement` (proxy for `StickGroup` layout helper) — used for scatter/row/bundle blends. PASS.
- `BundleWrap` — used. PASS.
- `CountStepIndicator` — used (10 badges + 1 badge in faster-count). PASS.
- `StepTally` — used live, ghost, faster-count. PASS.
- `LabelCallout` — used for `一个十`, peek `10`, recap sentence. PASS.
- `TeacherMark` — used for all 5 sketch marks. PASS.

**Sparkle at climax (frame bundleStart+72 → absolute 472):** Implemented inline as `SparkleStar` (path-based 10-point star at coordinates `cx = bundleWidth/2 + 8`, `cy = 0` in group-local space). Visual-design §3 Beat 3 specified absolute (1010, 540); scene anchors it relative to the group transform — visually equivalent because the group is centered at (960, 540). PASS. **Note:** sparkle absolute frame is **472**, not 927 as the verification prompt mentioned — the prompt computed 855+72=927 against the *audio-captions* timing; the scene correctly uses the ASR-aligned `bundleStart = 400`, so 400+72=**472**. The scene is right; the spec hand-off frame is stale.

**All 9 cues represented in choreography:** YES, every cue id is referenced. PASS.

## 7. Pacing realism

Per-cue estimated vs actual durations (cue-only, not counting gap):

| id | est. narration (s) | actual cue duration (s) | actual/est | flag |
|---|---|---|---|---|
| opening | 4.2 | 1.60 | 38% | **rushed (<60%)** |
| count-one-by-one | 4.2 | 0.90 | 21% | **rushed (<60%)** |
| count-to-ten | 11.0 | 6.33 | 58% | **rushed (<60%)** (and contains no actual narration — see §4) |
| feels-slow | 3.8 | 2.27 | 60% | borderline |
| bundle-action | 4.8 | 2.23 | 47% | **rushed (<60%)** |
| rename-bundle | 4.2 | 2.50 | 60% | borderline |
| still-ten-ones | 4.2 | 1.90 | 45% | **rushed (<60%)** |
| faster-count | 4.8 | 2.57 | 54% | **rushed (<60%)** |
| recap | 4.2 | 2.27 | 54% | **rushed (<60%)** |

7 of 9 cues are rushed; 2 are borderline. The Gemini voice ran ~38% under the pacing plan globally, and the visual choreography (designed against the plan's frame counts) now overshoots its cue boundaries:
- `bundle-action` climax timing spine assumed ~96 frames of motion (visual-design §3). Actual cue duration is **67 frames** — the wrap (f36–f60) and settle (f60–f78) extend past `bundleStart+67=467`, the cue end. The sparkle at f472 fires *after* `rename-bundle` has already started at f488. PASS only because the timeline overlaps; nothing breaks, but the climax loses its "hold for 15f" beat.
- `count-to-ten` choreography sequences stick highlights at `i*12` frames from cue start. Cue is 190 frames long, sequence needs `9*12 + 16 = 124` frames — fits. But it plays against silence after `一，二，`.

## 8. Captions

Caption visibility windows (= cue duration, since captions are scheduled from `startFrame` to `endFrame`):

| id | window (s) | flag |
|---|---|---|
| opening | 1.60 | OK |
| count-one-by-one | **0.90** | **< 1.0s, too short to read** |
| count-to-ten | 6.33 | OK (but content mismatch — see §4) |
| feels-slow | 2.27 | OK |
| bundle-action | 2.23 | OK |
| rename-bundle | 2.50 | OK |
| still-ten-ones | 1.90 | OK |
| faster-count | 2.57 | OK |
| recap | 2.27 | OK |

One caption (`count-one-by-one` at 0.90s) is below the 1.0s readability minimum, well under the 0.8s hard-flag threshold border. A first-grader cannot read `我们一根一根地数。` (8 chars) in 0.9s. Flag.

## 9. Sketch-mark timing bug (newly discovered)

`TenOnesMakeOneTenLessonScene.tsx` lines 415–475 set sketch `drawStart` to absolute frames **694, 891, 1089, 1449, 1675** — these are the frame numbers from `sketch-overlay.md` §2, which were computed against the original audio-captions §5 plan (assumed 60.7s lesson, cues starting at 0, 159, 312, 690, 855, 1083, 1260, 1431, 1635).

The actual ASR-aligned cues start at **26, 93, 122, 314, 400, 488, 584, 669, 765**. The rendered video is only **851** frames long.

Consequence: every sketch mark is mis-timed.

- `mark-feels-slow-row-underline` draws at frame 694, but the rendered `feels-slow` cue is frames 314–382. The mark appears 312 frames *after* feels-slow has ended.
- `mark-bundle-action-wrap-arc` draws at frame 891 — **40 frames after the video ends**. Never rendered.
- `mark-rename-bundle-label-arrow` draws at 1089 — never rendered.
- `mark-faster-count-vs` draws at 1449 — never rendered.
- `mark-recap-final-phrase-underline` draws at 1675 — never rendered.

**Only one sketch mark (`feels-slow` underline) appears at all, and it does so during the recap silence at the end of the video.** The other four are scheduled past the timeline.

This is a composer bug — the scene should compute sketch `drawStart` relative to ASR-aligned cue start frames (e.g. `feelsSlowStart + 4`, `bundleStart + 36`, etc.), not hardcode the pre-render plan frames. Sketch-overlay.md is correct as a *spec*; the composer translation lost the rebinding to ASR-derived cue starts.

## 10. Lesson-agnostic guard

Spot-check: scene file contains the strings `计数单位`, `十个一 = 一个十`, `一个十`, `10`, `步`, `audio/ten-ones-make-one-ten-voice.wav` (referenced via timeline module). All Chinese strings live only in the lesson-specific scene file; primitives under `src/shape-primitives/` (verified via `Grep` for primitive exports) do not contain any lesson-specific copy. PASS — lesson-agnostic rule honored.

---

## Punch list (ordered by severity)

1. **[SEVERE — re-run pipeline]** Cue 3 `count-to-ten` was not spoken. Voice stops at `一，二，` and jumps to cue 4. Apply the Wave 2b recommendation: change `script-cues.json` cue 3 to either narration `一、二、三，数到十。` or phrase `一 二 三 数 到 十`, and re-record. **Triage: re-prompt the voice model and re-run the full pipeline.** (Or, optionally: re-storyboard the cue to per-digit micro-cues so each digit lands on its own clip and ASR alignment is unambiguous.)
2. **[SEVERE — re-run pipeline]** Sketch marks scheduled at stale absolute frames (694, 891, 1089, 1449, 1675). Only one of five marks falls inside the rendered 851-frame timeline. Rebind `drawStart` in `TenOnesMakeOneTenLessonScene.tsx` to per-cue offsets (`feelsSlowStart + 4`, `bundleStart + 36`, `renameStart + 6`, `fasterStart + 18`, `recapStart + 40` — exact offsets from sketch-overlay.md §2 timing column). **Triage: composer / `remotion-lesson-composer` fix, then re-render. Not a primitive bug.**
3. **[HIGH — re-record voice]** Total runtime 28.4s is 53% under the 60–90s brief floor. The Gemini voice paced ~38% under estimate. Re-prompt the voice with explicit "slower, leave 1s pause between sentences" instructions, or extend per-cue holds in `audio-captions.md` and re-render. **Triage: re-prompt the voice model with slower pacing + bigger gaps.**
4. **[HIGH — re-record voice]** `count-one-by-one` caption window is 0.90s, unreadable for a 6-year-old. This is downstream of issue 3 — fixing pacing fixes this. If pacing fix alone doesn't lift it above 1.2s, extend the cue's post-narration hold in `audio-captions.md`.
5. **[MEDIUM — lesson-debugger or accept]** Climax cue is 67 frames long; the visual-design §3 climax spine assumed 96f motion + 15f hold. The wrap finishes inside the cue but the settle / sparkle slip into `rename-bundle`. Acceptable if the visual still reads as one gesture; otherwise extend `bundle-action` hold to absorb the spine. **Triage: `lesson-debugger` candidate (post-render fix to either cue hold or climax timing spine).**
6. **[LOW — lesson-debugger]** `计数单位` shown as `SceneFrame` eyebrow contradicts brief's "Do not say 计数单位". Replace eyebrow with a child-friendly phrase like `打包小棒` or remove the eyebrow entirely. **Triage: `lesson-debugger`, single-line edit in scene file.**
7. **[LOW — cosmetic]** Rendered resolution is 1280×720, visual-design §1 declared 1920×1080. If the brief's target is HD, set composition size at render. **Triage: composer/pipeline config (`pipeline.json` / composition width/height).**
8. **[LOW — already noted in plan]** ASR substitutes `蹦` for `棒` in opening / count-one-by-one alignment. Visual captions and narration are unaffected. No action needed.

---

## Recommendation

**Do not ship.** The voice clip is missing the count-to-ten beat entirely (the second-most important visual beat after the bundle), and four of five teacher-mark overlays never appear because their absolute frames are past the end of the rendered video. Both are deterministic fixes upstream of the next render:

1. Apply the `count-to-ten` phrase/narration tweak from `audio-captions.md` §6 item 1 and re-record voice with slower pacing.
2. Have the composer (re-invoke `remotion-lesson-composer`) rebind sketch `drawStart` to per-cue offsets instead of hardcoded plan frames.
3. Re-run `npm run lesson:render -- --config lesson-data/ten-ones-make-one-ten/pipeline.json` (full pipeline, no `--skip-voice`).
4. Re-verify on the new MP4.

The pedagogy, primitive coverage, and continuity invariants are solid. The artifact engine is working; the inputs to this particular render were broken.
