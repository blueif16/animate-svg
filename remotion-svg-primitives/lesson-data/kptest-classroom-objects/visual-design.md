composition:             1920×1080 @ 30fps   (fixed; non-negotiable)
short-side:              1080 px

teaching-unit:           classroom object icon (pencil, pen, or ruler)
teaching-unit-min:       ≥ 8% of short-side = 86 px   →  90 px (chosen)
teaching-unit-target:    12–15% of short-side = 130–160 px → 150 px (chosen)

primary-label-min:       48 px rendered  (signal labels: "pencil", "pen", "ruler")
body-label-min:          36 px rendered  (not used)
caption-line-min:        56 px rendered
chrome-label:            FORBIDDEN

zone-objects:            [400, 200, 1000, 500]  | holds: pencil/pen/ruler icon being presented. NOTHING ELSE.
zone-labels:             [400, 0, 1000, 180]  | holds: English word ("pencil"/"pen"/"ruler"). Never inside zone-objects.
zone-marks:              [400, 720, 1000, 180]  | holds: "your turn" gesture (for invite-echo) and live highlight (for recall-together).
zone-presenter-left:     [0, 200, 380, 600]    | holds: left kid presenter (IconAsset: boy-face or girl-face).
zone-presenter-right:    [1420, 200, 400, 600]  | holds: right kid presenter (IconAsset: boy-face or girl-face).

metaphor:        A presenter lifts each classroom object (pencil, pen, or ruler) from a case, says its English name, and invites the child to repeat it.
regions:         zone-objects holds the object; zone-labels holds the spoken English word; zone-marks holds the turn-taking cue and highlight; zone-presenter-left and zone-presenter-right hold the two kid presenters.
between-states:  The two kid characters persist on screen; the object icon and its English word change together per reveal cue; the "your turn" cue appears during invite-echo cues; during recall-together, a live highlight moves from object to object.
reading-order:   pencil-reveal: object → word; pencil-invite-echo: your-turn cue; pencil-replay: object → word; pen-reveal: object → word; pen-invite-echo: your-turn cue; pen-replay: object → word; ruler-reveal: object → word; ruler-invite-echo-first: your-turn cue; ruler-invite-echo-additional: your-turn cue; ruler-replay: object → word; recall-together: pointing gesture → highlighted object.
decoration-budget:  1 cream background (canvas) + 0 additional stacked surfaces = 1 surface total. Meaningful colors: reward for object icons, textNavy for English words, sunshine for highlights and "your turn" cue, coral for any accent (if needed).
text-budget:     "pencil", "pen", "ruler" are load-bearing (not implied by geometry/sequence/color/adjacency) — keep.
occupancy:       vertical axis is binding (objects lift vertically); non-binding axis is horizontal; teaching unit (one object icon) at 150 px width = 13.9% of short-side (within target) and grows to metaphor constraints; on non-binding axis (horizontal), the teaching content (object width) occupies sufficient space to avoid decorative whitespace — ensure ≥50% of horizontal axis is used by the object column in recall-together via appropriate scaling and spacing.
identity-invariant: the object icon is always an IconAsset at consistent scale and style (tinted reward); the English word is always rendered in textNavy at ≥48 px, centered; the kid characters persist as the same IconAsset instances (boy-face and girl-face) throughout.
motion-budget:   per cue: visualMotionSeconds — the MINIMUM time the cue's motion needs to land for a 6yo.
                  model-target-slow: 3.0s     (object lift + word appearance + hold for slow narration)
                  invite-echo: 5.0s     (invitation + ≥3s silent child-response gap)
                  replay: 3.0s     (reuse of reveal visuals)
                  spaced-recall: 6.0s     (pointing to three objects + brief wait-times after each)