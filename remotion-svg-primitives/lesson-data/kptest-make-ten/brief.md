# kptest-make-ten

**Audience.** 一年级 (~6–7 years old), Mandarin-speaking children. Narration in Chinese.
**Length.** 60–90s band — HINT for scope only, not a target to pad to.
**Builds on.** ten-ones-make-one-ten (the child knows ten ones form one ten) and counting to ten.
**Style.** default

## Knowledge point
The child leaves knowing the **number bonds that make ten** — 9和1, 8和2, 7和3, 6和4, 5和5 — and that a ten-frame is "full" at ten. 凑十: given some dots, the child can find how many more make ten.

## The one beat
A ten-frame with some cells filled; the empty cells light up; the missing dots slide in to complete the ten — "9，再加1，就满十了。" The child SEES the bond complete and the frame snap to 满十, then predicts the next bond. The same ten-frame fills a different way for each bond.

## Out of scope
No addition notation (9+1=10 written as symbols). No carrying / regrouping / 进位. No numbers past ten. The discovery is the BOND that fills the frame, not the written equation.

## Continuity
Reuse the registered ten-frame / dot primitives (countables stay SVG). The ten-frame is ONE identity-invariant instance across all the bonds; only the fill changes — it is never destroyed and recreated per bond.

## Narration notes
Chinese only (no L2 target). Math-insight lesson: NAME the action ("再加几个就满十?") and let the PICTURE deliver the count — do not say the answer before the dots arrive (narration-leakage rule). One clean delivery per bond plus a recall recap; spacing/interleaving, not massing.
