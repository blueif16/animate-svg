composition:             1920×1080 @ 30fps   (fixed; non-negotiable)
short-side:              1080 px

teaching-unit:           emphasized syllable
teaching-unit-min:       ≥ 8% of short-side = 86 px   →  90 px
teaching-unit-target:    12–15% of short-side = 130–160 px   →  140 px

primary-label-min:       48 px rendered
body-label-min:          36 px rendered
caption-line-min:        56 px rendered
chrome-label:            FORBIDDEN

zone-objects:            x=0-1920, y=150-750   | holds: kid characters (left and right figures)
zone-labels:             x=0-1920, y=0-150     | holds: speech bubble text, read-along highlight
zone-badges:             x=0-1920, y=750-900   | holds: emphasis pulses (PulseCircle) on emphasized syllables
zone-tally:              x=0-0, y=0-0          | holds: (not used in this lesson)
zone-caption:            x=0-1920, y=900-1080  | holds: Chinese narration ribbon
zone-marks:              x=0-0, y=0-0          | holds: sketch marks (not used)

metaphor:        Two children meet and perform the name exchange ritual: one asks 'What's your name?' and the other answers 'My name's ___.'
regions:         zone-objects holds the two identity-invariant kid characters; zone-labels holds the speech bubble text (English phrases) and the read-along highlight tracking speech; zone-badges holds the emphasis pulses that highlight the key syllables "What's" and "name's"; zone-caption holds the Chinese narration ribbon that frames the moment (asking/answering/role-swap/recap); zone-tally and zone-marks are unused.
between-states:  The two kid characters persist throughout; which child is speaking alternates (left/right), the speech bubble content changes between question and answer, the read-along highlight sweeps across the spoken phrase, emphasis pulses occur on the stressed syllables, and the Chinese narration updates to frame the current moment.
reading-order:   Speaking child → speech bubble tail → speech bubble text (with focus on emphasized syllable) → read-along highlight movement → emphasis pulse on syllable → Chinese narration ribbon
decoration-budget:   Max 2 stacked surfaces (e.g., background + character surface); max 4 meaningful colors plus cream background (e.g., textNavy, sunshine, coral, reward)
text-budget:     All on-screen strings are load-bearing: the English phrases ("What's your name?", "My name's ___") are the core teaching content; the Chinese narration provides essential framing; the variable name in the answer is learnable content. No strings are redundant via implication to geometry, sequence, color, or adjacency.
occupancy:       horizontal axis is binding (the metaphor fixes left-right interaction); teaching content (character interaction zone) occupies approximately 600 px vertically, which is ~55.5% of the vertical axis (1080 px).
identity-invariant: the two kid characters (left and right figures) remain the same primitive throughout the lesson.
motion-budget:   ask: 1.8s     (character lean-in, bubble pop-in, read-along sweep start, emphasis pulse)
                    answer: 1.8s    (similar motions for right child)
                    ask‑swap: 1.8s  (replay of ask)
                    answer‑swap: 1.8s (replay of answer)
                    recap: 2.5s     (spaced-recall: highlighting four phrases in sequence with final emphasis pulse)