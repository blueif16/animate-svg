# Visual Contract

## Kids-eye measurement block
composition:             1920×1080 @ 30fps   (fixed; non-negotiable)
short-side:              1080 px

teaching-unit:           single dot
teaching-unit-min:       ≥ 8% of short-side = 86 px   →  90 px
teaching-unit-target:    12–15% of short-side = 130–160 px → 140 px

primary-label-min:       48 px rendered  (signal labels: "一个十", "10 步", takeaway lines)
body-label-min:          36 px rendered  (counts, badges)
caption-line-min:        56 px rendered
chrome-label:            FORBIDDEN — if a label is decoration, delete it

## Kids-eye zones (disjoint)
zone-objects:    460,240,1000,600  | holds: ten-frame with dots. NOTHING ELSE.
zone-labels:     0,0,1920,200      | holds: title or instructional text. Never inside zone-objects.
zone-caption:    0,900,1920,180    | holds: caption ribbon at bottom
zone-marks:      full-bleed         | sketch marks. Marks may TRACE OVER zone-objects (e.g. wrap-arc) but never SIT INSIDE zone-labels.

## Early-childhood visual taste
Palette (from theme.colors):
- cream: #FFF7E6 — canvas background
- reward: #FFB84D — teaching unit color (dots)
- coral: #FF8A65 — action / transformation accent (sliding dots)
- textNavy: #24324B — ink: text, outlines, sketch marks
- sunshine: #FFD85A — transient highlight ("this one is being counted")
- softGrayBlue: #B5C0D0 — dimmed/inactive state ONLY

Motion vocabulary (intent):
- Default small move: 12 frames, EASE.outCubic
- Default big move: 24 frames, EASE.inOutCubic
- Climax move: 30 frames, EASE.outQuint (for the sliding dots reveal)
- Slide-in / fade-on entrance: 16–20 frames, EASE.enter
- Sketch marks draw-on: 18 frames default, 24 for larger gestures

## Visual Contract (visual-discipline)
metaphor:        A ten-frame shows some dots; the empty cells highlight and the missing dots slide in to fill the frame, revealing the number bond that makes ten.
regions:         zone-objects holds the ten-frame (math: the ten-frame structure); zone-labels holds title/instructional text; zone-caption holds caption ribbon for accessibility; zone-marks holds teacher sketch marks that trace over the ten-frame but never overlap labels.
between-states:  The ten-frame persists unchanged across cues. The number of visible dots increases per cue (9→10, 8→10, etc.). Highlight appears on empty cells during ask/gap, then missing dots slide in to complete the frame. After reveal, the completed ten-frame holds briefly.
reading-order:   Eye lands on the ten-frame → notices the highlight on empty cell(s) → watches the missing dots slide in → sees the completed ten-frame → reads any instructional text in zone-labels.
decoration-budget:  Max 2 stacked surfaces (cream background + caption ribbon). Max 4 meaningful colors: reward (dots), coral (sliding dots), textNavy (text/marks), sunshine (highlight).
text-budget:     Title in zone-labels (e.g., "凑十") is load-bearing — names the activity. Caption ribbon is load-bearing for accessibility. No other on-screen text is needed; any additional label would duplicate geometry or narration and should be dropped.
occupancy:       Horizontal axis is binding (ten-frame width fixed). Teaching unit (dot) at 140 px = 13% of short-side, meets minimum visibility. The ten-frame occupies ~60% of horizontal axis and ~50% of vertical axis, ensuring the teaching object dominates the canvas.
identity-invariant: The ten-frame is a single primitive instance that persists across all cues. Each dot is a SmallDot primitive of the same reward tone and appearance; only their visibility changes.
motion-budget:   visualMotionSeconds — minimum time the cue's motion needs to be readable by a 6‑year‑old, including dwell/hold for the result.
                 announce-topic: 2.0s   (title appears and settles)
                 bond-9-1:       3.0s   (highlight empty cell, one dot slides in, hold on completed ten)
                 bond-8-2:       3.0s   (highlight two empty cells, two dots slide in, hold)
                 bond-7-3:       3.0s   (highlight three empty cells, three dots slide in, hold)
                 bond-6-4:       3.0s   (highlight four empty cells, four dots slide in, hold)
                 bond-5-5:       3.0s   (highlight five empty cells, five dots slide in, hold)
                 recap:          6.0s   (sequence of five bonds, each with slide‑in and brief hold, synchronized to narration)