# kptest-first-second-third — Primitive gap-scan (W3b)

**Result: ZERO-GAP. All demands satisfied by existing catalog primitives.**

## Teaching-demand → REUSE table

| teaching action | demand | REUSE |
|---|---|---|
| `announce-topic` (intro) | topic-intro card | `lesson-intro-card` (`LessonIntroCard`) |
| `stage-the-moment` (arrive-*) | queue animals — 3 visually distinct countables | `countable-object` (`CountableObject`) × 3 variants (animal / fish / fruit) — three different variants are by definition visually distinct; each is a stable identity from arrive-first to recap-count |
| `stage-the-moment` (arrive-*) | ONE fixed front-of-queue marker + ground line | `icon-asset` (`IconAsset`) name=`journey-path-flag`, coral tint (D2) |
| `model-target-slow` (name-first, count-second, count-third) | ordinal chip — hanzi word form 第一/第二/第三, no digit | `ordinal-label-token` (`OrdinalLabelToken`) — `value="一"/"二"/"三"` (string), `prefix="第"` (D1: hanzi word form confirmed via `value:number\|string` prop) |
| `count-on` → `model-target-slow` (count-second, count-third, recap-count) | count/say sweep from the front marker — NO write step | `ordered-row-spotlight` (`OrderedRowSpotlight`) direction=ltr — `countWalk` is opt-in; write step is not forced (D3) |
| `learner-response-gap` (ask-second, ask-third) | "your turn" affordance | `icon-asset` (`IconAsset`) name=`question-mark-circle` + `pulse-circle` (`PulseCircle`) |
| `reveal` (reveal-second, reveal-third) | chip emphasis | `glow-pulse` (`GlowPulse`) |
| `reveal` (reveal-second only) | one-shot celebration accent | `sparkle-burst` (`SparkleBurst`) |
| `invite-echo` (recap-invite) | counting finger poised at flag | `pointer-hand-arrow` (`PointerHandArrow`) variant=hand |
| `spaced-recall` + `count-on` (recap-count) | same queue sweep with chip pulses | `ordered-row-spotlight` (`OrderedRowSpotlight`) (same instance as count-third sweep, slowed for chant pacing) |
| all cues | moving-hold on queue + chips | `breathe` (`Breathe`) + `fx-defs` (`FXDefs`) (phaseSeeds: `kptest-queue`, `kptest-chips`) |

## D-flag resolution

| D | demand | verdict | reason |
|---|---|---|---|
| D1 | ordinal chip renders 第一/第二/第三 in hanzi word form | REUSE `ordinal-label-token` | `value:string` accepts `"一"/"二"/"三"` alongside `prefix="第"` — no digit-only constraint in the registry entry |
| D2 | one legible front-of-queue marker | REUSE `icon-asset` `journey-path-flag` | asset exists in the icon library (object category); coral tint via `<IconAsset tint>` |
| D3 | sweep is count/say only — no write step | REUSE `ordered-row-spotlight` | `countWalk` is opt-in; the 摆—数—说—写 steps are individually controllable |
| D4 | 3 visually distinct, identity-stable animal countables | REUSE `countable-object` × 3 different variants | variant=animal / variant=fish / variant=fruit are visually distinct by definition; each instance is stable from its arrive-cue to the end; the composer assigns one variant per queue slot |

## Intro card layout

`LessonIntroCard` fits this subject (title + section eyebrow + order-question KP teaser). No new intro primitive needed. The card reads ALONE before any queue element appears (announce-topic law, time-disjoint with zone-objects).
