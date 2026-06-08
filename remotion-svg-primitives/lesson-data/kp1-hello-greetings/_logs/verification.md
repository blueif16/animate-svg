# W6 verification — kp1-hello-greetings — process log

## INPUTS READ
- skill: `.agents/skills/lesson-verification/SKILL.md`
- `lesson-data/kp1-hello-greetings/pedagogy.md` (5 cues + cognitive-ladder + narration-discipline)
- `out/kp1-hello-greetings/kp1-hello-greetings-contact.png` (5×5 action-aware) + `-contact.json`
- `out/.../bbox-manifest.json` (linear 0 collisions; measured 2; gates lufs+captionRedundancy FAIL)
- `out/.../measured-frames/{f4,f52,f122,f533,f577}.png`
- `out/.../primitive-checks/{Hardest,Multiplicity}.png`, `climax-still.png`, `recap-still.png`
- `lesson-data/.../{audio-cues.json, script-cues.json}`, `visual-design.md §1`
- scene `src/lessons/kp1HelloGreetingsLessonScene.tsx` (intro-card block ~244, recap-pulse block ~511)
- layout `src/lessons/kp1HelloGreetings/layout.ts` (TITLE_CY=320, STAGE_CY=272, RECAP_PULSE_CY=480=middle row)

## OUTPUTS WRITTEN
- `lesson-data/kp1-hello-greetings/verification.md` (verdict YELLOW + per-cue audit + gates + punch list)

## COMMANDS RUN
- `ffprobe ... kp1-hello-greetings.mp4` → exit 0. 607 frames / 20.23s @ 30fps, 1280×720, h264 + AAC 48kHz stereo. Matches contact.json totalDuration=607.
- `ls` out/ + measured-frames/ + primitive-checks/ → exit 0.
- `grep` for scene/layout intro-card + recap-pulse symbols → exit 0.

## KEY DECISIONS
- Verdict YELLOW (not GREEN, not RED): arc teaches the KP; two polish defects + 1 cosmetic audio.
- intro PARTIAL: title "Hello & Greetings" occluded by the two kid faces at f52 (title y=320 under faces y=272). Title flanks unreadable. Gates missed it (linear keyframe sampled cast at 33% opacity; measured had no late-intro frame).
- recap PARTIAL: closing PulseCircle at RECAP_PULSE_CY=480 = middle row "I'm Sam." (stale/dimmed) while live sweep is on "Goodbye!" (row 552). Semantic mis-placement.
- Measured collision readalong-recap↔recap-pulse (f533/f577, ratio 1): RULED by-design adjacency (punctuation pulse over phrase stack, labels↔marks, thin translucent ring, text stays readable). Not a collision fix; the semantic placement is the real issue.
- lufs FAIL (−17.2 vs −16, TP −1.6): cosmetic, owned by W5 loudnorm.
- captionRedundancy FAIL (jaccard=1 all cues): JUSTIFIED EXEMPT — Chinese caption == Chinese narration by design; English read-along is a separate element; literacy/language carve-out in gate spec.
- meet-hello / intro-self / part-goodbye: PASS. I'm modeled as ONE swelling unit (match-the-spoken-count honored). Cast identity-invariant across all 5 cues.

## ISSUES
- Could not watch the MP4 (W6 constraint) → 3-point duck / melody-under-narration / SFX-vs-voice qualitative checks deferred to a human pass.
- Render is 1280×720 but visual-design §1 was authored against 1920×1080. Proportional 16:9, legibility gate passed on the 720 render — noted, not blocking.

## PIPELINE FINDINGS
- The bbox measured-frame sampler does NOT sample a late intro frame (after cast opacity ramps to 1). The intro title-occlusion class is invisible to BOTH passes. Add a per-cue "hold-mid" or "all-elements-opaque" sample to the measured set so opacity-ramp overlaps are caught.
- captionRedundancy gate fires jaccard=1 on every cue for language/literacy lessons (Chinese caption == Chinese narration). It should auto-exempt when audio-cues `toneSafe` OR a lesson is tagged literacy/language, or when the read-along element is distinct from the caption — otherwise the gate cries wolf on every language lesson and trains reviewers to ignore it.
- The linear manifest keyframe for intro samples frame 30 (cast at 33% opacity) and reports no collision; the real overlap is at full opacity ~f52. Linear keyframes should be chosen at each element's PEAK opacity/extent, not a fixed early offset.
- loudnorm 2nd pass landed −1.2 LU under the −16 target — the deterministic pass may need a measured-then-correct loop (or a wider tolerance band) so the lufs gate isn't a near-miss FAIL on otherwise-fine renders.
