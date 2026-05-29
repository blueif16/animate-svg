# Script ↔ Animation Coordination — Research Brief

**Date.** 2026-05-28
**Trigger.** kp1-fen-yu-he-intro post-render review surfaced that voice-cuts and visual desync are not "small bugs" but structural — Wave 3.5's reconcile formula was wrong about what `tail` means. The user's restated pipeline frame: think → animate-plan → script → re-coordinate with per-cue gap policy. This brief audits how battle-tested explainer studios actually do this so we don't reinvent badly.

## Sources

**yt-rag (newly ingested namespace `yt_lesson_pacing`, 9 videos, 110 chunks):**
- Kurzgesagt — "How to Make a Kurzgesagt Video in 1200 Hours" + "Can You Trust Kurzgesagt" + "And We'll Do it Again"
- 3Blue1Brown — Manim demo with Ben Sparks (Grant Sanderson explaining his Manim workflow)
- TomsProject — in-depth interview with Veritasium's editor
- Bloop Animation — "Storyboard or script: Which comes first?"
- ECAbrams — "Audio Driven Workflows in Motion Design" (the canonical explainer-vid pacing tutorial)
- Tarzan's Ape — "How to make Explainer style videos FULL COURSE"
- Vane Motion — "My Documentary Animation Workflow"

**Exa web (high-signal articles, 2026):**
- Yu-kai Chou — "The 200ms Rule: Why Do Your Videos Feel Slightly Off?"
- Iron Mind — "Why We Generate Audio First in AI Video Pipelines"
- Editing Machine — "Algorithmic Pacing: How Editing Affects AVD"
- Channel Farm — "Optimize AI Voiceover Pacing for Long-Form YouTube"
- M Studio + Forge Clips — "How to Make an Animatic" guides
- BrainPOP (May 2026 interviews with their VP Design and head writers)
- Gisteo — "Professional Explainer Video Production: Complete Guide 2026"
- Hermes Agent — `manim-video` skill (3Blue1Brown-style explainer pipeline) — has explicit pause-after-each-animation timing table

**Reddit:** subreddit search hit an API error; non-blocking — yt-rag + Exa coverage was already saturated on the central questions.

---

## What the field actually does

### 1. Audio is the skeleton; visuals are flesh shaped to fit it

This is **the** dominant pattern. Every studio in the sample lands on some version of it.

> "The voiceover, once generated and transcribed with word-level timestamps, becomes a deterministic timeline that every downstream stage (storyboard segmentation, video clip duration, music score length) can derive its timing from programmatically. Generate the narration voiceover first, then run it through word-level transcription. Scene 3's duration isn't an estimate — it's measured from the actual audio that will play. Every scene now has a locked duration before a single image or video frame is generated. The audio timeline is the skeleton. Everything visual gets built around it." — Iron Mind, *Why We Generate Audio First* (Feb 2026)

ECAbrams says the same in motion-design language:

> "We get this lovely script and under ideal circumstances we've worked out an AV script so our visual concepts have been aligned from an early phase with what audio we're gonna hear… in motion design especially when driven by audio, we want to edit before we start building things. Since this is an audio-driven piece, the audio has to inform those cuts and inform those choices." — ECAbrams, `youtu.be/rpMGPhUER48?t=85` and `?t=536`

Kurzgesagt records the narration **after** the script + illustration are locked but **before** animation begins:

> "When the whole video is illustrated, the narration is recorded. It's important to keep the flow, so I try to get one version done and then go back through, retaking paragraphs and sentences until they feel right. Now the scenes and audio need to be animated." — Kurzgesagt, `youtu.be/uFk0mgljtns?t=96`

BrainPOP: script (editorial team) → storyboard with timing → "perfect first frame" pre-animatic for screening → puppet animation. Same script-then-audio-then-animate order.

**Implication for our pipeline.** Wave 3 (voice + ASR) being a hard freeze BEFORE Wave 4 (composer) is the right architectural call. The bug we hit in kp1 wasn't this; it was the inverse — Wave 3.5 reconcile pretended motion-and-narration could share a max() formula without respecting that the WAV has its own intrinsic inter-cue silences. Audio-as-skeleton would have caught this; the fix we just landed (cue ends at next narration start in WAV time) makes the skeleton actually load-bearing.

### 2. Gaps are deliberate beats, not padding to delete

Every studio explicitly fights the instinct to "tighten" silence out. The unifying principle: **silence is a tool whose use depends on what the visual is doing in that moment.**

BrainPOP (head animator + design director, May 2026):

> "We spend a disproportionate amount of time fussing over timing, cadence, and rhythm. The proper length of a pause can really do a lot to either help a joke land or help an idea stick. We make choices about how much time to give a moment, how long to hold on a beat, where to put the visual emphasis. We also keep kids' processing time in mind — using a pause for absorbing information." — BrainPOP interview, May 2026

Editing Machine's "Breath Edit" rule:

> "In the era of AI editing, silence is often auto-deleted. But sometimes, a breath is a powerful pacing tool. The scenario: you just delivered a hard truth. The edit: leave in a 2-second silence. This breaks the 'robotic' feel. It allows the emotion to land." — Editing Machine, Mar 2026

The Hermes-Agent `manim-video` skill (explicit table for 3Blue1Brown-style production):

```
Context                  run_time   self.wait() after
Title/intro appear       1.5s       1.0s
Key equation reveal      2.0s       2.0s
Transform/morph          1.5s       1.5s
Supporting label         0.8s       0.5s
FadeOut cleanup          0.5s       0.3s
"Aha moment" reveal      2.5s       3.0s
```

Note the **wait scales with the importance of what just landed**. An "aha moment" gets a 3-second silent hold; a supporting label gets 0.5s. The rule that matches the user's intuition exactly:

> "Every animation needs `self.wait()` after it. The viewer needs time to absorb what just appeared. Never rush from one animation to the next. A 2-second pause after a key reveal is never wasted." — Hermes Agent, manim-video skill

YouTube long-form editor guide:

> "Don't cut everything: After making a key point (2 second pause lets it sink in), before a big reveal (build tension), when showing complex visuals (give time to read)."

**Implication for our pipeline.** A flat `TAIL_FRAMES = 9` (0.3s) is one knob serving two different jobs and getting both wrong:
- For an "aha moment" cue (e.g. `fenheshi-intro` — the migration that names the 分合式), 0.3s is too short. The viewer needs 2-3s of static hold to let the new term land.
- For a "supporting label" cue (e.g. `fen-show` — already-loaded narration with a 2.5s reveal), 0.3s might be exactly right.

The right shape is **per-cue beat-type tagging** + a small lookup table, not a global tail constant.

### 3. The 200ms rule: visual leads audio by a tiny fraction of a second

This is the **micro-sync** rule for elements that appear during narration (text labels, callouts, chip labels).

> "Show the text, then say it. Never the reverse. When narration lands before the matching visual, the brain does extra work to sync channels and the viewer feels vague distrust. Show first, confirm second creates the 'I've heard this before' familiarity in 0.2 seconds. The fix is almost insultingly simple: drag the text element 200–500ms earlier on the timeline than you think it should be." — Yu-kai Chou, Apr 2026

ECAbrams says the same in tighter language:

> "Text should be appearing sort of as words are being said… you want to line up your animation of text so the words resolve and become readable JUST ahead of the words being said. That way people read and hear almost simultaneously." — ECAbrams `?t=536`

And the fade-out trap:

> "Fade-outs sync to the end of the audio reference, never to a default timer. Critical callouts (names, numbers, quotes) stay on screen until the narrator has fully finished saying them." — Yu-kai Chou

**Implication for our pipeline.** This is **not** a Wave 3.5 timeline issue — Wave 3.5 deals in cue boundaries. This is a Wave 4 composer concern: when a chip-label reveals via `<PopIn>` at `cues[id].startFrame + REL_OFFSET`, the offset should put the visual ~6 frames (200ms at 30fps) BEFORE the matching word's WAV frame, not after.

We have the data to do this: `kp1FenYuHeIntroAlignedCues[i].targetTokens` + ASR word-level timestamps. The composer skill doesn't currently consume this granularity. It could.

### 4. The motion-static gap policy is the user's principle, validated

> "When the narrator is explaining a complex concept, the visuals should hold steady. A slow Ken Burns zoom on a single image gives the viewer space to focus on the words. When the narration picks up energy for a list or series of points, the visuals should change more frequently to match." — Channel Farm, Mar 2026

> "Animatic stage: let a key UI shot linger briefly after narration ends so viewers can absorb it. You want a rhythm that feels intentional." — Forge Clips, Jan 2026

> "In areas where we want to do a large change in subject matter or emotional tone we should leave more space because that animation will likely take longer." — ECAbrams `?t=176`

This is **exactly** what the user articulated: gap length is a function of "what the visual is doing during this cue". The field calls it **rhythm**; we should call it the same.

### 5. Animatic-first as a low-cost iteration gate

This is the one stage we don't currently have. Every production studio uses it.

> "Animatic creation (storyboard timed to scratch VO). Last chance for major structural changes. Client response deadline: 3 business days. Impact if delayed: may require re-recording VO if script changes." — Gisteo, Mar 2026

> "An animatic is a low-fidelity prototype. It is a timed sequence of storyboard frames synced with a rough voiceover. Use a scratch voiceover to lock timing, then cut visuals to match." — Forge Clips

> "It's like another screening process to see if something should be cut or adjusted before you get too far into the animation process." — BrainPOP

Our equivalent today is the **contact sheet** that ships at end of `lesson:render`. But that's a *post*-render check, not a *pre*-composer check. The contact-sheet check after Wave 3.5 reconcile, before Wave 4 composer, would catch the same class of bug we just hit (visual-cue boundaries vs WAV narration boundaries) without burning a render.

---

## Distilled rules for our pipeline

1. **Audio is the skeleton.** Wave 3 freezes the WAV; Wave 3.5 reconciles cue windows to **the audio's intrinsic timeline**, not to nominal narration lengths. *(Status: just landed in kp1FenYuHeIntroLessonTimeline.ts — the algorithm now anchors cue ends to the next narration's WAV start.)*

2. **Tail is per-cue, not global.** Each cue's tail is selected from a small palette based on **beat type**:

   | Beat type                                  | Tail (s) | Why                                           |
   | ------------------------------------------ | -------- | --------------------------------------------- |
   | Setup / transition                         | 0.3      | minimal breath, keep momentum                 |
   | Supporting label / mid-step                | 0.5      | enough to read, not enough to drag            |
   | New term / definition land                 | 1.5      | the term needs to settle                      |
   | "Aha moment" / load-bearing reveal         | 2.5–3.0  | this is the whole point of the cue            |
   | Cue with continuous motion through to next | 0.0      | don't insert a fake hold mid-flow             |

   *Author at Wave 2a (visual-design) as a `beat: <type>` row in the Visual Contract. Wave 3.5 looks the tail up from the table.*

3. **200ms micro-lead for synced text.** Composer offsets text/label entrances 6 frames (≈200ms at 30fps) BEFORE the matching ASR word's WAV frame. Fade-outs pin to end-of-audio-reference, not to a default duration. *(New composer rule, should be added to `remotion-lesson-composer` skill.)*

4. **Animatic gate before composer.** Add a Wave 3.6 step: render a single PNG strip of cue-start frames (the contact sheet, but cheap and pre-composer). Orchestrator reviews it for "does the cue boundary land where the audio expects?" before greenlighting Wave 4. *(Today we only get this AFTER full render.)*

5. **Co-designed AV script (already what we do).** Wave 2a → 2b is "visual decides motion budget, narration writes to that budget" — this matches the AV-script pattern that Kurzgesagt + BrainPOP + ECAbrams all describe. Keep it.

## Open questions

- **How is "beat type" decided?** Proposal: orchestrator's pedagogy.md already identifies *which* cue is the "aha moment". That metadata can flow into visual-design.md as a `beat:` field per cue.
- **Should we adopt 200ms lead for label entrances retroactively?** kp1's chip labels currently use `+ REL_START` constants tuned by eye. Moving to ASR-word-anchored offsets is a real change. Worth a follow-up brief.
- **Does the motion-dominated cue (fenheshi-intro) want a different tail policy?** Field consensus: motion-dominated cues *don't need* a tail — the motion IS the beat. Should `cueFrames = motionFrames` (no tail) for those, with the "aha tail" attached to the FOLLOWING cue's lead-in? Worth testing in v3.

## Progress

(Section added per CLAUDE.md "Research → implementation logging" rule. Update when items below ship.)

- 2026-05-28 — Bug 1 fix (Wave 3.5 algorithm rewrite to anchor cue ends to next-narration WAV start) shipped in `remotion-svg-primitives/src/lessons/kp1FenYuHeIntroLessonTimeline.ts:68-100`. Addresses rule #1 (audio-as-skeleton). Total lesson duration unchanged at 1473f / 49.1s; he-name cut-off at 22-23s eliminated; one-cue motion-dominated drift (fenheshi-intro → fenheshi-read) absorbed by fenheshi-read's natural hold.
- *(future)* Per-cue beat-type tail palette (#2) — pending visual-design.md schema update + Wave 3.5 lookup.
- *(future)* 200ms label micro-lead (#3) — pending composer skill spec edit + ASR word-level data plumbing.
- *(future)* Pre-composer animatic gate (#4) — pending contact-sheet script split (pre-composer "boundary" sheet vs post-render "review" sheet).
