composition:             1920×1080 @ 30fps   (fixed; non-negotiable)
short-side:              1080 px

teaching-unit:           single dot
teaching-unit-min:       86 px   →  86 px
teaching-unit-target:    140 px   →  140 px

primary-label-min:       48 px rendered
body-label-min:          36 px rendered
caption-line-min:        56 px rendered
chrome-label:            FORBIDDEN

zone-objects:    bounding box covering the central area where dot groups appear (approx x=360, y=200, w=1200, h=500) | holds: dot groups (1,2,3,4,5 dots in various groupings). NOTHING ELSE.
zone-labels:     bounding box above zone-objects (approx x=360, y=50, w=1200, h=120) | holds: bond glyphs ("一和四", "合", "二和三") and topic title ("5的分与合"). Never inside zone-objects.
zone-badges:     bounding box below zone-objects (approx x=360, y=720, w=1200, h=100) | holds: count badges if any (none in this lesson).
zone-tally:      bounding box (unused) | holds: step-tally pills (none in this lesson).
zone-caption:    bounding box at bottom (approx x=0, y=900, w=1920, h=180) | holds: caption ribbon at bottom.
zone-marks:      full-bleed | sketch marks. Marks may TRACE OVER zone-objects (e.g. wrap-arc) but never SIT INSIDE zone-labels.

palette:
  canvas background: cream (#FFF7E6)
  teaching unit (dots): reward (#FFB84D)
  action/accent: coral (#FF8A65)
  ink (text, outlines, sketch marks): textNavy (#24324B)
  transient highlight: sunshine (#FFD85A)
  dimmed/inactive: softGrayBlue (#B5C0D0)

motion vocabulary:
  default small move: 12 frames, EASE.outCubic
  default big move: 24 frames, EASE.inOutCubic
  climax move: 30 frames, EASE.outQuint
  slide-in/fade-on entrance: 16-20 frames, EASE.enter
  sketch marks draw-on: 18 frames default, 24 for larger gestures

metaphor:        Five dots split into two groups and recombine, showing that the total remains five regardless of how it is split.
regions:         zone-objects → dot groups (1,2,3,4,5 dots in various groupings); zone-labels → bond glyphs ("一和四", "合", "二和三") and topic title ("5的分与合"); zone-badges → count badges (unused); zone-tally → step-tally pills (unused); zone-caption → narration ribbon; zone-marks → teacher's sketch marks (trace over objects but not labels)
between-states:  the same five dots persist throughout, only their arrangement changes (scattered → split into two groups → recombined into one group). The bond glyph changes per cue to reflect the current split or combine action. The title appears once at the beginning.
reading-order:   For announce-topic: title alone. For model-target-slow: bond glyph alone, big and centered. For reveal: dot groups motion → bond glyph → caption. For learner-response-gap: "your turn" prompt → hold. For reveal-answer: highlighting of answer dot groups → bond glyph. For spaced-recap: rapid alternation of dot groups → bond glyph.
decoration-budget:  1 cream background + 1 caption ribbon = 2 surfaces total. Dot reward, bond coral, ink navy, highlight sunshine = 4 meaningful colors.
text-budget:     "5的分与合" (load-bearing — lesson title), "一和四" / "合" / "二和三" (load-bearing — the mathematical expressions being taught), caption text (load-bearing — accessibility), "你的 turno" prompt (load-bearing — invites child response). No chrome labels.
occupancy:       vertical axis is binding (dot groups move up/down to split and combine); teaching unit (one dot) at 140 px = 13% of 1080 short-side, hits target. The dot group collection uses ~900 px width, ~83% of 1080 px short-side, well above 50% of the horizontal axis.
identity-invariant: every dot is a primitive circle at the same reward tone (#FFB84D) for the entire video, whether scattered, in a group, or highlighted. No color changes across the transformation.
motion-budget:   cue-announce-topic-split-1of4: 0.8s (reveal: five dots splitting into one and four)
                  cue-conserve-1of4: 0.8s (reveal: one+four groups combining into five)
                  cue-split-2of3: 0.8s (reveal: five dots splitting into two and three)
                  cue-conserve-2of3: 0.8s (reveal: two+three groups combining into five)
                  cue-learner-response-gap: 0.4s (invite-echo: "your turn" prompt appearance)
                  cue-reveal-answer: 0.4s (reveal: highlighting of answer dot groups)
                  cue-spaced-recap-both: 0.6s (spaced-recall: rapid transitions between splits)