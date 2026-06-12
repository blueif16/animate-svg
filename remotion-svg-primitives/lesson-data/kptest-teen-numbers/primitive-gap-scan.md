# Primitive Gap Scan for kptest-teen-numbers

## Teaching Actions from Storyboard

### announce-topic
- Requirements: 
  - visual/layout: while the title/teaser is reading, it is the only readable thing on screen; the cast and teaching objects enter after it has read (sequence in time — never overlay art on the title).
  - component: LessonIntroCard
- Reuse: `lesson-intro-card` (from literacy family)
- Gap: None

### model-target-slow
- Requirements:
  - audio: voice says the target slowly, isolated in its own breath-group.
  - visual/layout: the target glyph big, centered, nothing on top, held at least its spoken length.
  - component: a large glyph / DialogueExchange emphasis turn.
- Reuse: `target-word` (from literacy family) for the visual/layout and component (as a large glyph). The audio requirement is satisfied by the frozen voice clip.
- Gap: None

### invite-echo
- Requirements:
  - audio: model line + a held silent gap realized as the echo cue's gap: { reason: "learner-response" }.
  - visual/layout: a clear "your turn" cue.
- Reuse: None (no existing primitive for a clear "your turn" cue)
- Gap: Need a new primitive for "your turn" cue (to be named, e.g., `YourTurnCue`)

## Additional Scene Elements (from visual-design and lesson content)

### Bundle of ten sticks (fixed on left)
- Required by: all cues except announce-topic (since the bundle is present in the teaching visuals)
- Reuse: `stick-group` (with layout="bundle") from counting family
- Gap: None

### Loose stick (appearing on the right)
- Required by: cues that show loose sticks (11-model-slow through 19-invite-echo)
- Reuse: `small-stick` from counting family
- Gap: None

### Label "一个十" (in zone-labels)
- Required by: all cues that show the bundle (same as above)
- Reuse: `label-callout` from literacy family
- Gap: None

### Takeaway phrase "十个一=一个十" (in zone-labels)
- Required by: same as above
- Reuse: `label-callout` from literacy family
- Gap: None

### Count step indicators (above each loose stick)
- Required by: cues that show loose sticks (each loose stick gets a badge as it appears)
- Reuse: `count-step-indicator` from interaction family
- Gap: None

### Step-tally (running count of loose sticks)
- Required by: same as above
- Reuse: `step-tally` (variant: dots or numeric) from interaction family
- Gap: None

### Caption ribbon (at the bottom for narration text)
- Required by: all cues (since narration is present in every cue)
- Reuse: None (no existing primitive for a caption ribbon)
- Gap: Need a new primitive for caption ribbon (to be named, e.g., `CaptionRibbon`)

### Teacher marks (sketch)
- Required by: as per sketch-explainer-layer (wave 4, parallel with composer)
- Reuse: `teacher-mark` from sketch family
- Gap: None

## Summary of Gaps to Build
1. `YourTurnCue` - a primitive to display a clear "your turn" visual cue for the invite-echo teaching action.
2. `CaptionRibbon` - a primitive to render a ribbon-like background for narration text at the bottom of the scene.

Both primitives should be prop-driven, reusable, and lesson-agnostic. They will be added to the appropriate family files under `src/shape-primitives/` (likely `interaction.tsx` for both, given their nature).