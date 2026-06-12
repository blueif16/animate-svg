# primitive-gap-scan — kptest-compare-more-fewer

W3b verdict: **ZERO new primitives.** Every teaching demand maps to an existing catalog component; the one layout need is a placement helper (no registry entry by design). Default = REUSE held.

## Teaching-demand → primitive (REUSE)

Scan is teaching-driven: each storyboard move → its `requires` → catalog id.

| teaching move (cue) | demand | primitive (catalog id → component) |
|---|---|---|
| `announce-topic` (intro) | topic-intro card, reads alone first | `lesson-intro-card` (`LessonIntroCard`) |
| `stage-the-moment` (two-groups) | the dots, color = group ID, identical size | `countable-object` (`CountableObject`) |
| `count`/amount tags (two-groups) | per-group count "5"/"3" | `number-card` (`NumberCard`) |
| `reveal` (match) | one-to-one match lines top→bottom | `pair-connector` (`PairConnector`) |
| `reveal` (match) | surplus dot has no partner (ghost) | `unmatched-slot` (`UnmatchedSlot`) |
| `reveal`/`model-target-slow` (more, fewer) | direction glyph between groups | `comparison-symbol` (`ComparisonSymbol`), `>`/formal |
| `track-read-along` (more, fewer) | live cursor on the spoken token | `read-along-highlight` (`ReadAlongHighlight`) |
| `model-target-slow`/surplus focus (more, fewer) | attention ripple on surplus / focus pair | `pulse-circle` (`PulseCircle`) |
| `invite-echo` + `learner-response-gap` (echo-more, echo-fewer) | "your turn" affordance through the gap | `pointer-hand-arrow` (`PointerHandArrow`), hand |
| `replay` (more-replay, fewer-replay) | identical re-meet of model cue | none — reuse the modeled clip + visual |
| `spaced-recall` (recap) | recap stack, ONE live moving highlight | `recap-spotlight` (`RecapSpotlight`) |
| moving-hold (echo gaps, dwell) | held picture stays alive | `breathe` (`Breathe`) |

## Layout helper (not a catalog component)

| demand | helper |
|---|---|
| 5-over-3 paired-column placement (top[c]↔bottom[c]) the whole spine reads off | `getPairedColumnPlacement(5,3,{columnGap,rowGap})` — lowercase placement helper in `interaction.tsx`, exported from the barrel; carries no registry entry by SKILL rule (placement helpers are not catalog components). REUSE if present; else the composer composes the two `countable-object` rows from `countable-object` positions directly (no new primitive either way). |

## Intro-card layout

`lesson-intro-card` fits this subject as-is (title + section eyebrow + one-line KP teaser, dots absent per `announce-topic.requires`). REUSE — no intro-primitive redesign.

## Verdict

No gap named. No source reads, no builds, no registry changes, no test stills required (zero new primitives). The reuse table above IS the artifact.
