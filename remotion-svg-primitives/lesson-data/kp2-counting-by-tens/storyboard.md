# Storyboard: kp2-counting-by-tens

This lesson introduces counting by tens as a faster and more convenient method than counting by ones, using sticks and bundles. The cue sequence transitions from recalling a single bundle of sticks ("一个十"), untying it to reveal ten individual ones, demonstrating the tediousness of counting loose sticks one by one, contrasting it with the speed of counting them as a bundled unit, extending the counting sequence to two and three tens, and concluding with a comparative recap to solidify the core insight.

### intro
- **discovery ref**: None (Topic introduction)
- **stage**: represent
- **teaching action(s)**: `announce-topic`
- **narration beat (INTENT, no copy)**: Welcome the child and state the topic of the lesson: counting by tens. Tease the core insight that counting by tens is very fast and convenient when we have many objects.
- **required visual**: `LessonIntroCard` displaying the title and section text clearly first, alone. Once read, transition to the main background canvas where the initial single stick bundle (`StickGroup` with `BundleWrap`) fades or slides into view.

### bundle-recall
- **discovery ref**: The single bundle of sticks we learned about represents a single unified group called "一个十" (one ten).
- **stage**: represent
- **teaching action(s)**: `stage-the-moment` -> `model-target-slow`
- **narration beat (INTENT, no copy)**: Recall the stick bundle from the previous lesson, highlighting and modeling the target unit "一个十" (one ten) clearly and slowly as a single unified group.
- **required visual**: A single, pre-existing bundle of sticks (`SmallStick` inside `StickGroup` wrapped by `BundleWrap`) centered and highlighted on screen. A `LabelCallout` displaying the badge "1个十" next to it. No other background clutter.

### untie-reveal
- **discovery ref**: This unified group called "一个十" (one ten) is composed of exactly ten individual ones.
- **stage**: concrete
- **teaching action(s)**: `reveal`
- **narration beat (INTENT, no copy)**: Point out that inside this single group of "一个十" (one ten), there are actually individual ones, which we see as the rope unties.
- **required visual**: The rope (`BundleWrap`) unties and disappears, and the 10 sticks (`StickGroup`) fan out slightly to show they are 10 individual loose sticks. Highlighting the physical transformation with a `TeacherMark` or `Sketch` overlay.

### slow-count-ones
- **discovery ref**: Counting loose objects one by one is slow and repetitive because it requires ten separate counts.
- **stage**: concrete
- **teaching action(s)**: `count-on`
- **narration beat (INTENT, no copy)**: Count the 10 loose sticks slowly one-by-one, emphasizing through deliberate slow pacing how tedious and repetitive it is to count ten separate objects.
- **required visual**: The 10 loose sticks are highlighted one-by-one. A `CountStepIndicator` or `StepTally` displays ordinal markers/numbers (1 to 10) above each stick as it is counted. The highlight increments slowly.

### fast-vs-slow
- **discovery ref**: Bundling ten loose ones together lets us count them as a single group in only one count instead of ten.
- **stage**: represent
- **teaching action(s)**: `reveal`
- **narration beat (INTENT, no copy)**: Direct physical contrast. Group the ten loose sticks back together, tie them with a rope, and count them as "一个十" (one ten) in only one count instead of ten.
- **required visual**: The 10 loose sticks group back together into `StickGroup`, and the rope (`BundleWrap`) wraps and ties them. A single count badge (`LabelCallout`) showing "1个十" appears next to it.

### two-tens
- **discovery ref**: We can count bundles of tens using the same counting sequence as ones: adding one more bundle gives us "两个十" (two tens).
- **stage**: represent
- **teaching action(s)**: `count-on`
- **narration beat (INTENT, no copy)**: Add a second identical bundle of sticks, demonstrating that we count it as "两个十" (two tens) using the same simple sequence.
- **required visual**: A second identical bundle (`StickGroup` with `BundleWrap`) slides in atomically from the side next to the first bundle. The count badge (`LabelCallout` / `StepTally`) updates to show "2个十" (两个十).

### three-tens
- **discovery ref**: The same counting pattern continues: adding another bundle increments the count to "三个十" (three tens) while each bundle still holds ten ones inside.
- **stage**: represent
- **teaching action(s)**: `count-on`
- **narration beat (INTENT, no copy)**: Add a third identical bundle of sticks, incrementing the count to "三个十" (three tens) while emphasizing that each bundle still contains ten individual ones inside.
- **required visual**: A third identical bundle slides in atomically next to the first two. The count badge (`LabelCallout` / `StepTally`) updates to "3个十" (三个十). A `TeacherMark` briefly highlights the three bundles to reinforce the count.

### recap
- **discovery ref**: Counting by tens is much faster and more convenient than counting by ones when we have many objects.
- **stage**: represent
- **teaching action(s)**: `spaced-recall` -> `learner-response-gap`
- **narration beat (INTENT, no copy)**: Summary recap. Prompt the child to compare counting by tens vs counting by ones, solidifying the insight that counting by tens is much faster and more convenient when we have many objects.
- **required visual**: The final layout showing all three bundles together clearly visualized with their count indicators "1个十", "2个十", "3个十" (三个十). A comparative visual highlight (`TeacherMark` / `Sketch` or a ghosted group of 30 loose sticks) to contrast the 3 quick tens-counts vs 30 slow ones-counts.

---

## Exposures Ledger

exposures:
  一个十: 6
  两个十: 3
  三个十: 2
