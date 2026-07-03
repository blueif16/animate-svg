---
name: lesson-verification
description: Use when checking a completed Remotion education video for lesson accuracy, visual clarity, narration, captions, music, and render readiness.
---

# Lesson Verification

Purpose: Verify the finished lesson before delivery.

<!-- TODO: Check the math story: one-to-one comparison clearly supports 5 > 3. -->
<!-- TODO: Confirm Remotion SVG primitives render cleanly and remain countable on screen. -->
<!-- TODO: Verify sketch/Skelly/Excalidraw-style teacher explanation does not obscure objects or captions. -->
<!-- TODO: Review teacher narration, captions, and background music for timing and clarity. -->
<!-- TODO: Run only the relevant render/test checks for the touched lesson files and report commands used. -->
<!-- TODO: Confirm scene code has no raw motion literals — grep for `Easing.bezier(` and `damping:` under src/lessons/<camelId>*; all should resolve to named exports from src/motion-primitives/curves.ts (EASE.* / SPRING.* / PopIn motion= / TeacherMark boil=). -->

## Primary review surface — the rendered contact sheet

**Load `lesson-data/<id>/<lesson-id>-contact.png` first and only.** This is one image containing the midpoint frame of every cue in narrative order — built automatically by `scripts/make-contact-sheet.mjs` at the end of `lesson:render`. The companion `<lesson-id>-contact.json` maps each tile (row, col, index) to its cue id and midpoint frame.

**Why one image, not per-cue PNGs:** an MP4 teaches across cues, not within a single frame. Reviewing per-cue PNGs in isolation lets aesthetic-checked-✓-per-frame results hide an arc that doesn't teach. Look at the whole strip and answer the one question that matters:

> *Would a child who doesn't already know this lesson learn it from this video?*

If the answer is yes, the lesson passes the contact-sheet check. If no, name the cue(s) that break the arc — only then drill into per-cue PNGs or scrub the MP4.

**Anti-pattern:** opening `verification-frames/cue-*.png` one at a time and writing a per-frame checklist. That's how the visual-bug class survives — every frame "looks fine in isolation" while the lesson fails to teach. Do not do this.

## Check artifacts (Wave 4 outputs)

After the contact-sheet review, cross-check the Wave 4 composer outputs:

- Read `out/<id>/bbox-manifest.json` — its `measured` block + `summary`. `npm run lesson:check -- --config <cfg>` ALWAYS runs the measured pass (there is no fast-linear pre-filter and no `--measured` opt-in — the legacy flag is an accepted no-op): it SSR-renders motion-peak frames and reads each element's TRUE `getBBox()`, catching easing-overshoot and between-keyframe overlaps. Gates split by confidence and the set GROWS over time — read `summary.gatesFailed` for what blocks THIS run, never assume a fixed list: STRUCTURAL, false-positive-free gates FAIL the run (exit 1) — today the declared⟺measured id bijection (`bbox-binding`) and loudness on the delivered master (`lufs`, voice ≈ −16 LUFS / true peak ≤ −1 dBFS); GEOMETRIC / eye-checkable findings are advisory WARN — `summary.measuredCollisionCount` (overlap) and `summary.captionIntrusionCount` (a teaching element in the caption ribbon) surface loudly but do NOT by themselves exit 1 (opacity-blind crossfades and a label legitimately near a suppressed ribbon are false-positive sources — the human is the eye). For any measured collision, open the matching `out/<id>/measured-frames/f<frame>.png` and rule it a true overlap or a by-design adjacency (a whole-card stacked on its diagram, etc.) IN WRITING. Any failed gate, and any measured collision or caption intrusion, must either be fixed (kick back to composer) or carry an explicit written justification quoting the exact failing row (element id + frame + measured value) — silent acceptance is forbidden; a `SKIP: <reason>` is acceptable but must be acknowledged.
- If `lesson-data/<id>/primitive-checks/*.png` exist, inspect each. Does the primitive read as the visual-design §5 acceptance criteria specify (e.g. "kid reads 'sticks tied with a bow'")?
- Cross-check that every element listed in visual-design §3 Visual Contract has a corresponding `SceneElement` entry in `src/lessons/<camelLessonId>/manifest.ts`.

## Per-cue text-vs-audio checks (scene strings against the spoken phrase)

A frame can look correct yet show a word the audio never speaks, or hold a learner-response beat as silent dead air. The contact sheet alone won't catch these — walk every cue against `lesson-data/<id>/script-cues.json`:

- **On-screen target text == the cue's spoken audio.** For each cue, compare every on-screen target STRING in `src/lessons/<camelLessonId>LessonScene.tsx` (`DialogueExchange` `line`s, `ReadAlongHighlight` word glyphs, name tags) against that cue's spoken `phrase` in `lesson-data/<id>/script-cues.json`. The on-screen target strings must be a SUBSET of the cue's spoken phrase, in spoken order. FLAG any on-screen word the cue's audio does not speak — e.g. a bubble that shows a word carried over from an earlier cue, or lifted from the brief, that this cue's audio never speaks. This is a HARD finding mapped to W4a composer.
- **Learner-response gap is a legible invitation, not dead air.** For any cue with `gap.reason === "learner-response"`, confirm the scene holds a READABLE "your turn" affordance during the gap window — a localized label ("你来说" / "Your turn") + a pulse/ring on the read-along row + a speech/mic glyph. A bare low-opacity glow with no label/icon FAILS (it reads as awkward silence, not an invitation to speak). HARD finding mapped to W4a composer.

## Sound checks (when the lesson has `audio-cues.json`)

The master loudness target (≈ −16 LUFS / TP ≤ −1 dBFS) is the `lufs` gate above — do not re-measure it by hand. These are the QUALITATIVE checks that gate can't make; scrub the MP4 with sound on:

- **Melody NOT identifiable under narration.** While any narration plays, the bed must read as warmth, not a tune you could hum. If you can follow the melody, the duck is too shallow → FAIL.
- **3-point duck.** Confirm the arc: intro bed ducks cleanly as the first words start; the bed rises in a mid narration GAP then ducks again; the outro resolves to full as the last narration ends.
- **No SFX over instruction words**, and **no SFX louder than narration.** Reward/interaction sounds land in gaps or after the line; `ta-da` fires once. SFX sit below the voice.
- **Tone lessons (`toneSafe`)**: the spoken tone is unmistakable over the bed — no melodic motif competes with the lexical pitch.

## Verdict

The final verdict (GREEN / YELLOW / RED) cites:
- **contact-sheet teach test** — does the arc teach the KP? (single paragraph)
- bbox-manifest `summary.gatesFailed` + `measuredCollisionCount`/`captionIntrusionCount` + any justified collisions or intrusions
- text-vs-audio checks — on-screen target strings ⊆ each cue's spoken phrase; learner-response gaps hold a legible "your turn" affordance
- primitive-check observations (per redesigned primitive)
- sound checks (if `audio-cues.json` present): melody-under-narration, 3-point duck, SFX discipline, `lufs` gate verdict
- pedagogy + pacing checks against `audio-captions.md` and `visual-design.md`

The contact sheet is the canonical review surface. The bbox/primitive artifacts complement it.
