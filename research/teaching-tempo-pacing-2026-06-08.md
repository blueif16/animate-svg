# Teaching tempo & time-budget for early-childhood L2 lesson videos

_Research brief, 2026-06-08. Two multi-source sub-agents (Exa/web evidence + Reddit/forum practitioner sentiment; no YouTube). Purpose: fix the comprehension-time-floor flaw — a 6-phrase English-greetings lesson for 8-yo Mandarin speakers planned out at **~26s** when the audience needs **~2 min**. These are research-backed DEFAULTS / time FLOORS to inform the pedagogy + teaching-action skills — **NOT per-lesson hard-codes.** Total length still EMERGES from real narration + motion at Wave 3.5; the per-behavior floors are the load-bearing constraint._

## Diagnosis
The pipeline has a strong **anti-padding** rule ("length emerges, don't pad, brief length is a hint, under is accepted drift") but **no comprehension floor**. So reinforcement gets *reasoned* (pedagogy §8 picks heavy/light) yet *starved of time*: 3 exposures crammed into one 5s cue, terse one-line narration, 2–5s motion budgets, zero wait-time. Reconcile (`max(narration,motion)+tail`) faithfully reports the starved result. The fix is a FLOOR that counterweights the ceiling — delivered as **real spaced reinforcement + wait-time**, never filler.

## Per-behavior time floors (the load-bearing deliverable)
Conservative floors for a teaching VIDEO (no live-class overhead), child-directed (slower) delivery. Encode as defaults the planner reasons from — not fixed values.

| Teaching behavior (per item) | Floor | Basis |
|---|---|---|
| **Model the target** (1 clear utterance) | ~3–5s × **2–3 models** → **~9–15s** | Listen-and-repeat model 3–9s (Pearson); 3×3 drill (Eslbase) |
| **Choral repeat** ("say it with me") | ~3–5s × 2 → **~6–10s** | Choral drill 2–3× (Eslbase) |
| **Individual response + WAIT-TIME** | prompt ~2s + **silent wait 3–5s** + reveal ~3s → **~8–10s** | Rowe wait-time 3–5s; reproduce window ≤15s (Pearson) |
| **Gloss / L1 translation** | **~3–4s** | short L1 utterance; L1 glosses aid retention (Teng) |
| **Per-new-word dwell** (hold on screen) | **≥2–3s** min; longer for harder items | child-directed speech = slower + longer pauses (Marklund) |
| **Recap** | ~3–5s/item; whole-set **~15–30s** | recap = spaced re-exposure (Eslbase) |
| **Strategic pause BEFORE revealing target** | brief predictive beat | IES WWC: pause-before > pause-after (preschool) |

**Per-phrase block** (model + choral + individual-with-wait + gloss) ≈ **~26–39s**; lean version (model 2× + 1 choral + 1 recap) ≈ **~12–15s**. → 6 phrases + intro + recap ≈ **~2 min floor**, confirming 26s is ~6× short.

## The principles behind the numbers
- **Repetition: 7–12 meaningful exposures per new word** (academic L2 ~8–12: Pellicer-Sánchez/Schmitt, Webb, Nation; practitioner 6–12, "3×3 drill"; young kids gain 12→24→36, Storkel). Model + choral + individual + recap all count.
- **Spacing > massing** (d≈0.54, holds for children: Sobel/Cepeda). In-video form = **interleave** repeats of a phrase with other phrases + an **end recap**; across-day spacing is a curriculum (cross-lesson) lever.
- **Wait-time ≥3–5s** of held silence after any "now you say it" prompt (Rowe; longer for L2 learners). Strongly supported; entirely missing from a 26s lesson. (This silent beat is the `learner-response-gap` move — see Implications.)
- **Few words, taught deeply: 2–5 new items** for ages 6–9 (Conti/Language Gym; TEFL.net). Recycle, don't add more.
- **Slower delivery for the target:** child-directed speech uses slower rate + longer post-utterance pauses; model the L2 target SLOWER than the ~0.30s/char narration default.
- **Engagement:** hook early; one concept; **variety within repetition** (same word, different game/visual) so drilling isn't monotonous; multimodal; call-and-response; a re-engagement beat every ~15–30s. Lose them via dead time / too fast / too many items.

## Guardrail (no hard-coding — Hermes Law 2)
Total length is **emergent**, not a target: the per-behavior floors are the constraint; ~2 min results for THIS lesson (6 first-English phrases, 8-yo) because honest reinforcement + wait-time demand it. A thinner topic stays shorter. The "age-in-minutes" / "six-minute" rules are widely cited but rest on thin attention-span data (Bradbury 2016 critique) — anchor on **per-behavior floors**, let total emerge. More time = more REAL reinforcement, never filler.

## Implications for the skills (the merge — pending approval)
- **`lesson-pedagogy` §8**: add the comprehension-time-FLOOR principle (a new acquisition target needs ≥~6–10 spaced exposures with dwell + a ≥3–5s wait-time gap + recap; crammed exposures don't count; "don't pad" never licenses starving comprehension; few-words-deep).
- **`.agents/TEACHING-ACTIONS.md`**: give each move a concrete TIME budget from the table above (model-target-slow ≥9–15s incl. repeats; invite-echo a real ≥3–5s silent gap; spaced-recall ~15–30s). Promote `learner-response-gap` from "future" to a real planned beat (it's the wait-time).
- **`lesson-audio-captions` + `visual-design`**: counterweight their "length emerges / don't pad" sections with the floor (narration carries model→repeat→pause→echo→wait; motion budgets include dwell/hold).
- **(chain, follow-up) `lesson-build.js` reconcile/animatic**: advisory flag if an acquisition lesson lands far under its per-behavior floor — and the true SILENT wait-gap needs a small reconcile change (a response-gap beat is neither narration nor motion; today reconcile only adds a ≤0.3s tail).

## Key sources
**Wait-time:** Rowe (ERIC ED370885, ED061103) — typical ~1s, target 3–5s, +300% response. ASCD "A New Rhythm for Responding." Colorín Colorado / Edutopia (ELL: double to 3s, longer for L2).
**Repetition:** Pellicer-Sánchez & Schmitt (SSLA) ~8–10; Uchihara/Green meta ~12; Storkel (PMC5547908) kindergartners 12→24→36; Nation 6–12; Webb ≥10.
**Spacing:** distributed-practice meta 2025 (PMC12189222) d=0.54; Sobel/Cepeda (Wiley acp.1747) children's vocab.
**Length/segmenting:** Guo et al. 2014 (edX, <6-min chunk); Brame 2016 (CBE-Life Sci); kids-content guides (3–5 min ages 4–6, 5–8 min 7–9; 15–30s re-engagement loop). Contested: "age-in-minutes" / "six-minute" rules (Bradbury 2016).
**L2 craft:** Eslbase 3×3 drilling; Pearson listen-and-repeat (3s countdown, 3–9s model, ≤15s reproduce); Colorín Colorado TPR (≤7 items); Conti/Language Gym (2–4 items/lesson ages 7–9).
**Delivery rate:** Marklund (JCL) child-directed speech longer pauses + shorter utterances.

## Progress

### 2026-06-08 — comprehension-time-FLOOR merged into the lesson-pipeline skills
Folded the per-behavior floors into existing skill owners (no new doc/skill). Edits:

- **Implications bullet "`lesson-pedagogy` §8"** → `.agents/skills/lesson-pedagogy/SKILL.md` §8: added the **Comprehension time-FLOOR (acquisition targets)** principle (≥6–10 spaced exposures with dwell + a ≥3–5s wait-time gap + recap; crammed ≠ counted; few-words-deep 2–5 items ages 6–9; spacing > massing; "don't pad" ≠ "starve") as a counterweight to the existing "Pace for absorption / length emerges" bullet; reasoning-based (planner decides amount from difficulty/novelty); cites this brief by path. Also promoted §8's "(Future) learner-response gap" bullet to a real planned beat = the wait-time, noting the true silent-timeline mechanism is a reconcile follow-up.
- **Implications bullet "`.agents/TEACHING-ACTIONS.md`"** → `.agents/TEACHING-ACTIONS.md`: gave the relevant moves concrete TIME budgets from the §"Per-behavior time floors" table — `model-target-slow` (~9–15s incl. 2–3 slower-than-default models + predictive pause-before-reveal), `gloss` (~3–4s), `invite-echo` (real ≥3–5s SILENT child-response gap), `spaced-recall` (~15–30s), `count-on` (per-item dwell ≥2–3s). Promoted `(future) learner-response-gap` → real `learner-response-gap` planned beat (the wait-time), with the SILENT-timeline mechanism marked as a reconcile follow-up.
- **Implications bullet "`lesson-audio-captions` + `visual-design`"** →
  - `.agents/skills/lesson-audio-captions/SKILL.md` "What this skill does NOT do anymore → No total-runtime targeting": added that acquisition cues carry the full model→repeat→pause→echo→(wait)→recap arc sized to the move floors and are NOT minimized; going far under the comprehension floor is **starvation, not "accepted drift"**; kept the anti-FILLER rule intact.
  - `.agents/skills/visual-discipline/SKILL.md` (the owner of `visualMotionSeconds`/`motion-budget`, per grep) "motion-budget is load-bearing" paragraph: one line that motion budgets must include dwell/hold (per-item ≥2–3s) + a re-engagement beat every ~15–30s.

**Verify-intent:** the next acquisition lesson's pedagogy.md + script-cues should show each new sound/word/phrase getting multiple SPACED exposures (model + choral + individual + recap), a real ≥3–5s wait-time gap, and dwell — landing in minutes, not tens of seconds, with length still emergent (no fixed total target).

### Deferred — CODE follow-ups (NOT implemented here; per the merge task, skills-only)
- **True silent wait-gap as a first-class timeline beat.** A `learner-response-gap` beat is neither narration nor motion; today `lesson-build.js` Wave 3.5 reconcile only adds a ≤0.3s tail. Making the held silence a real reconciled window needs a small reconcile change. Skills now PLAN it (via `invite-echo`'s held beat) and mark where the genuine gap belongs; the timeline mechanism is owed.
- **"Lesson under its floor" advisory flag.** An advisory (non-blocking) flag in reconcile/animatic when an acquisition lesson lands far under its summed per-behavior floors, so starvation is caught mechanically rather than only by the pedagogy reasoning. Not yet wired.
