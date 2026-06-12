# kptest-fenyuhe-six Storyboard

This lesson extends the 分/合 routine the child already knows from 5的分与合 to a new whole, 6. Nine beats: a routine-reprise opens the lesson (the row of six dots enters as one whole, recognizable from the prior lesson); then three co-equal split+recombine cycles (1和5, 2和4, 3和3) — each cycle is one model cue paired with one silent echo cue so the child can retrieve the bond; an aggregator prompt (the child is asked to recall the full set) and a canonical replay of the three splits in order close the loop. The 3和3 equal split is the lesson's highlight; it earns the same cue count as the other two splits, with extra dwell on the symmetric 3-3 hold (extra seconds, not extra cues — co-equal airtime is preserved per §8 "breadth before depth"). The six dots are identity-invariant across every split (same six dots 分 and 合, never destroyed), and the 分/合 motion vocabulary from 5的分与合 carries forward so the routine is recognizable. The voice names the whole and the parts ("6可以分成1和5；1和5合成6"); the picture delivers the concrete instance (the dots that move). Conservation of the whole is *seen* through the recombine motion, never lectured. No cue reaches symbolize — no digits, no equations, no on-screen Chinese text-as-glyph (counts are in the dot arrays and in the spoken Chinese).

### routine-reprise
- discovery ref: 6 will be split the same way 5 was — the child recognizes the 分/合 routine from 5的分与合 transferring to a new whole.
- stage: represent
- focal (carried from pedagogy): the six dots appear together as one whole (the row the child knows from the prior lesson, scaled to 6).
- teaching action(s): announce-topic
- narration beat intent: name the lesson topic ("6的分与合") and briefly invoke the familiar routine ("和5的分与合一样, 我们来分6") — the title reads alone first, the dots enter after. (Insight/setup — one pass is enough; the next 6 beats are the actual content.)
- required visual:
  - `LessonIntroCard` for the title (per announce-topic `requires`: title + section + KP teaser reads alone; cast and teaching objects **enter after** — never overlaid on the title).
  - The six dots then enter as a single row, identity-invariant from the kptest-fenyuhe-five row, scaled to 6 — held as one whole, not yet operated on. No digits, no Chinese text, no equations on screen (stage = represent; the row is read as a unit).

### split-1-and-5
- discovery ref: 6 can be split into 1 and 5, and 1 and 5 combine back into 6 — a new bond the child can produce on demand.
- stage: concrete
- focal (carried from pedagogy): one dot separates from the other five; the two groups then recombine into the six (split + 合 back as one continuous motion sequence).
- teaching action(s): model-target-slow → reveal
- narration beat intent: the teacher voices the COMPLETE bond, in its own breath-group — "6可以分成1和5" on the split, "1和5合成6" on the recombine. The voice names the whole being decomposed; the picture delivers the parts. (Per §4 carve-out: the child is *retrieving a memorized bond*, not *counting* — no fragment like "一和五" spoken without its whole.)
- required visual:
  - `PartWholeComposer` mode="split" then mode="merge" on the six identity-invariant dots (registered; same motion vocabulary from 5的分与合 so the routine is recognizable). The six dots separate into 1 (left) + 5 (right) and recombine into the row of six.
  - model-target-slow audio carries the target bond; the visual is the concrete instance (the dots), NOT a written Chinese glyph. The move's "big centered glyph, nothing on top" requirement is a misfit for math-acquisition (counts are in the dots and in the spoken Chinese, per pedagogy §3 stage ceiling — no on-screen text-as-glyph).

### echo-1-and-5
- discovery ref: the child retrieves the 1和5 bond by saying it back to themselves.
- stage: concrete
- focal (carried from pedagogy): held silence; the 1-and-5 grouping remains on screen as the prompt.
- teaching action(s): invite-echo → learner-response-gap
- narration beat intent: NO voice — the prior cue's "6可以分成1和5；1和5合成6" IS the implicit prompt; this cue bakes a true ≥3–5s silent gap (audio-captions puts `gap: { reason: "learner-response" }` on it — baked into the WAV at zero TTS cost) for the child to say the bond back to themselves. The held visual IS the prompt.
- required visual: the 1-and-5 grouping held on screen through the silent gap (the model cue's end state may be the split OR the recombined six; the echo cue re-shows the split and holds it, OR the model cue ends in the split and the recombine happens in the echo's tail — composer decides). A clear "your turn" affordance through the hold — `PointerHandArrow variant="hand"` aimed at the grouping, or a gentle `PulseCircle` around the 1-and-5 split. No on-screen text for the prompt — the dots ARE the prompt.

### split-2-and-4
- discovery ref: 6 can be split into 2 and 4, and 2 and 4 combine back into 6.
- stage: concrete
- focal (carried from pedagogy): two dots separate from the other four; the groups recombine.
- teaching action(s): model-target-slow → reveal
- narration beat intent: voice names the COMPLETE bond — "6可以分成2和4" on the split, "2和4合成6" on the recombine. Identical shape to the 1和5 cue (co-equal airtime — no compression).
- required visual: identical structure to the split-1-and-5 cue: `PartWholeComposer mode="split"` then mode="merge" on the same six identity-invariant dots; the two dots on one side, the four on the other. No text, no digits.

### echo-2-and-4
- discovery ref: the child retrieves the 2和4 bond.
- stage: concrete
- focal (carried from pedagogy): held silence; the 2-and-4 grouping remains on screen as the prompt.
- teaching action(s): invite-echo → learner-response-gap
- narration beat intent: NO voice — held silence (≥3–5s) for the child to retrieve the 2和4 bond. Same shape as echo-1-and-5 (co-equal airtime).
- required visual: the 2-and-4 grouping held on screen through the silent gap; the same "your turn" affordance as the prior echo (the held grouping IS the prompt).

### split-3-and-3
- discovery ref: 6 can be split exactly in half — 3 and 3 — and 3 and 3 combine back into 6; the equal split is a new property of 6 felt as symmetry.
- stage: concrete
- focal (carried from pedagogy): the six dots break exactly down the middle; the two groups are visually mirror-symmetric.
- teaching action(s): model-target-slow → reveal
- narration beat intent: voice names the COMPLETE bond — "6可以分成3和3" on the split, "3和3合成6" on the recombine. The narration does NOT pre-announce "they are equal" (per §4 leakage rule — the equality is felt through the picture, not lectured). Same cue-count shape as 1和5 and 2和4 (co-equal airtime).
- required visual: identical structure to the other two split cues: `PartWholeComposer mode="split"` then mode="merge" on the same six identity-invariant dots; the two groups of three are visually mirror-symmetric (same size, same count, same color — the symmetry is the picture's job). No text, no digits.

### echo-3-and-3
- discovery ref: the child retrieves the 3和3 equal-split bond.
- stage: concrete
- focal (carried from pedagogy): held silence; the symmetric 3-3 grouping remains on screen longer than the prior two wait-time holds.
- teaching action(s): invite-echo → learner-response-gap
- narration beat intent: NO voice — held silence (≥3–5s, and the symmetric pairing's extra dwell carries into this hold — extra SECONDS, not extra CUES, to preserve co-equal cue counts per §8 "breadth before depth").
- required visual: the symmetric 3-3 grouping held on screen through the (longer) silent gap; the same "your turn" affordance as the prior echoes. The two groups stay mirror-symmetric through the entire hold (the equality stays visible while the child retrieves).

### aggregator-prompt
- discovery ref: the child retrieves the **set** of all three splits of 6 — 1和5, 2和4, 3和3 — in response to one prompt, demonstrating the part–whole structure as a whole.
- stage: represent
- focal (carried from pedagogy): the six dots reassembled as a single whole; the child is invited to name the splits aloud.
- teaching action(s): invite-echo → learner-response-gap
- narration beat intent: voice asks "6可以分成几和几?" (one short prompt) — then bakes a true ≥3–5s silent gap for the child to supply the set (all three splits, in any order; a 1和5-only or 3和3-only answer is partial and the design itself enforces co-equal retrieval). Distinct function from the recap: this is ACTIVE PRODUCTION from a blank prompt, not canonical replay.
- required visual: the six dots reassembled as a single row (represent — read as a unit, not operated on). The held six dots + the "your turn" affordance (same one used in the per-target echoes — `PointerHandArrow` or `PulseCircle`) IS the prompt. No on-screen text for the question — the audio IS the prompt and the held whole IS the visual.

### recap
- discovery ref: the child confirms the part–whole structure of 6 by seeing (or naming) all three splits in order, completing the routine.
- stage: represent
- focal (carried from pedagogy): the three splits replayed in canonical order — 1和5, then 2和4, then 3和3 — closing the loop to the routine reprise in cue 1.
- teaching action(s): spaced-recall
- narration beat intent: recall the three splits in canonical order — "1和5" → "2和4" → "3和3" → "它们合起来都是6". Each split named as the picture shows it; no new content. Closes the loop to routine-reprise (the child sees the routine is complete). Spaced recall of the model cues from ~30–60s ago.
- required visual: `RecapSpotlight` (registered) — a recap stack that walks the three splits in canonical order with ONE live, moving highlight that follows the currently-spoken item (the highlight must land on the currently-recalled item, never sit on a stale/earlier row). Each item shows the six dots in that split's X+Y grouping; earlier items stay visible-but-quiet while the current one is highlighted. Order: 1和5 first, 2和4 second, 3和3 last (3和3 lands LAST so the highlight is preserved — the recap is not a 3和3-only beat, the first slot is 1和5).

exposures:
  一和五: 3
  二和四: 3
  三和三: 3

exposures ledger rationale (machine-readable for the W3.5 reconcile's comprehension-floor advisory):
- 一和五: 3 spaced encounters — split-1-and-5 (model), echo-1-and-5 (learner-response retrieval), recap (spaced recall). The aggregator-prompt asks for the set as a whole, not for 1和5 specifically, so it does not add to this count.
- 二和四: 3 spaced encounters — same shape as 一和五.
- 三和三: 3 spaced encounters — same shape as 一和五 (split-3-and-3 model, echo-3-and-3 retrieval, recap). The 3和3 highlight is expressed as the echo-3-and-3's extra symmetric DWELL (extra seconds, realized at W3a/W3.5 in time, not at W1 in cue count) — the exposure count stays co-equal per §8 "breadth before depth". A child who can only retrieve 1和5 is visibly short of the aggregator's goal (which accepts the full set), so the design itself enforces co-equal retrieval without inflating the ledger.

## Reinforcement cues (report-back)

- **Per-target wait-time cues** (echo-1-and-5, echo-2-and-4, echo-3-and-3): each is a learner-response gap paired with the prior model cue — the held grouping IS the prompt, the silence IS the retrieval window. Echoes are NOT `replay of <cue-id>` (their audio is silence, not a re-voiced model).
- **Aggregator prompt** (aggregator-prompt): spaced retrieval of the full set, distinct from the recap (active production from a blank prompt vs. canonical replay for closure — the only case where two closers are warranted per the skill's recap rule).
- **Recap** (recap): spaced recall of all three model cues ~30–60s after their delivery. Reuses the same dot primitive and the same 分/合 motion vocabulary from each model cue — composer realizes this as three sequential `RecapSpotlight` items, not as three fresh `PartWholeComposer` runs.

## Required-visual gaps for Wave 3

No new primitive needed. The dot primitive + 分/合 motion vocabulary + identity-invariant six dots are registered (per the lesson's continuity line and the catalog's `PartWholeComposer` / `unit-block variant="dot"`). The "your turn" affordance for the echo/aggregator cues is a generic demand — `PointerHandArrow variant="hand"` and `PulseCircle` are registered candidates; W3 confirms or substitutes. `LessonIntroCard` and `RecapSpotlight` are registered and reused as-is.
