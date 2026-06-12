# Sketch Overlay — kptest-greetings-verify

> Wave 4b artifact. All timings are CUE-RELATIVE (offsets from `cues[id].startFrame`), never absolute master-timeline frames.

---

## 1. Sketch language

- **Stroke color:** `textNavy` (`#24324B`) — single ink color from theme, consistent with all readable text.
- **Stroke width:** 3 viewBox units (at 1920×1080 composition).
- **Opacity:** 0.85 (hand-drawn ink over scene).
- **Jitter:** baseline ±1.5 viewBox-unit control-point perturbation (built into `<TeacherMark>`).
- **Animation:** stroke-on draw-on via `drawProgress` (never fade-in). Fade-out 8 frames before cue end.

### 1.1 Boil

Not used. No marks are specified for this lesson (see §2 rationale).

### 1.2 Settle

Not used. No marks are specified for this lesson.

---

## 2. Per-cue mark table (CUE-RELATIVE frames)

| cue id | mark? | mark type | anchor (zone-aware) | drawOnRelativeStart | drawOnDuration | fadeOutRelativeStart | purpose |
|---|---|---|---|---|---|---|---|
| topic-intro | n | — | — | — | — | — | Card write-on is the sole visual; a sketch mark would compete with the card's own accent underline. |
| greet | n | — | — | — | — | — | Character approach + bubble pop-in + RAH cursor carry the greeting exchange. No signal gap. |
| im-slow-model | n | — | — | — | — | — | PulseCircle on "I'm" + slow cursor dwell + bouncy PopIn on bubble = three-layer emphasis already. A wrap-arc or underline would be a fourth signal on the same target (decoration, not clarification). |
| im-choral-echo | n | — | — | — | — | — | "Your turn" glow affordance on RAH text is the sole new signal; characters hold. A label-arrow from glow to text would restate what the glow already says. |
| im-learner-gap | n | — | — | — | — | — | The held silence IS the focal change. Any mark drawn during the gap would break the expectant stillness and distract from the child's production attempt. |
| farewell | n | — | — | — | — | — | Parting motion + wave gestures + bubble turns + RAH cursor carry the farewell. Signal complete. |
| recap-1 | n | — | — | — | — | — | Recap phrase cycling with single live marker is self-contained. A mark on the active phrase would compete with the RAH highlight. |
| recap-2 | n | — | — | — | — | — | Continuation of recap cycling. Same rationale as recap-1. |

**Total marks: 0 / 8 cues.**

---

## 3. Restraint rationale

The restraint principle test for every candidate mark:

> "This mark carries signal X, which is not yet carried by Y or Z."

**Candidate: wrap-arc on Kid B's wave gesture during im-slow-model (the climax cue).**
- Signal X = "this person is introducing themselves."
- Already carried by: Kid B's lean gesture (wave/point-self), the speech bubble with emphasis flag, the PulseCircle ripple on "I'm", the bouncy PopIn on the bubble, and the slow RAH cursor dwell.
- **Verdict:** Signal is quintuply carried. The mark is decoration. ✗ Drop.

**Candidate: underline beneath "I'm" in ReadAlongHighlight text zone during im-slow-model.**
- Signal X = "this is the hard sound — listen carefully."
- Already carried by: PulseCircle on the "I'm" token (emphasis flag), RAH cursor dwell (beat weight 3), DialogueExchange emphasis color (coral).
- Zone check: underline in zone-text is allowed (marks may trace over zone-characters and zone-text, but never sit inside zone-labels). So the zone is fine, but the signal is triply carried.
- **Verdict:** Signal is triply carried. The mark is decoration. ✗ Drop.

**Candidate: label-arrow from Kid B to "I'm Sam" text during im-slow-model.**
- Signal X = "this person said these words."
- Already carried by: speech bubble tail pointing at Kid B, DialogueExchange turn assignment (speaker:'right'), RAH cursor synchrony.
- **Verdict:** Signal is triply carried. ✗ Drop.

**Candidate: vs-mark between "Hello" and "Hi" during greet (showing they're equivalent).**
- Signal X = "these are two ways to do the same thing."
- Already carried by: both words appearing in the same exchange, both receiving equal visual weight, the narration saying they're both greetings.
- **Verdict:** Signal is carried by the exchange structure itself. ✗ Drop.

### Why zero is correct for this lesson

This is a **language/L2 lesson**, not a math/composition lesson. The teaching objects are:
1. **Characters** — their faces, gestures, and spatial relationship carry the social encounter.
2. **Speech bubbles** — DialogueExchange already annotates who said what with emphasis.
3. **ReadAlongHighlight** — the cursor already marks which word is active NOW.
4. **PulseCircle** — the emphasis flag already fires on the key-difficult /aɪm/ sound.
5. **"Your turn" glow** — the production affordance is already visible.

Sketch marks are a teacher's pen — they clarify spatial relationships, trace paths, or annotate structure that the teaching primitives alone don't make visible. In this lesson, every spatial relationship (who faces whom, who speaks, which word is active, which sound is hard) is already explicitly annotated by the teaching primitives themselves. There is no "invisible structure" that a pen stroke would reveal.

Adding marks would introduce a competing visual register (hand-drawn ink) over clean digital text (speech bubbles, RAH items), creating visual noise without adding signal. The visual design §10 confirms: "at most one mark in the entire video."

---

## 4. Climax sketch

No climax mark is specified. The visual climax is the im-slow-model cue where Kid B delivers "I'm Sam" with emphasis — the PulseCircle + bouncy PopIn + slow cursor dwell is the climax choreography. Adding a sketch mark to this moment would compete with the three existing emphasis signals rather than complement them.

---

## 5. Composer hand-off

No `<TeacherMark>` instances to register. No manifest entries required.

The composer (W4a) should proceed without any sketch overlay layer for this lesson.

---

## 6. Self-check

1. ✅ **Restraint principle** — every candidate mark fails the "signal not yet carried" test. Zero marks is the correct count.
2. ✅ **Cue-relative frames** — no master-timeline absolutes anywhere in this file (no marks = no frames to specify).
3. ✅ **Zone discipline** — no marks to violate zones. (If a mark were added, it would trace over zone-characters only, never sit inside zone-text, zone-caption, or zone-labels.)
4. ✅ **Total marks ≤ floor(8 × 0.6) = 4** — 0 ≤ 4. ✓
5. ✅ **Visual design §10 compliance** — "at most one mark in the entire video" — 0 ≤ 1. ✓
6. ✅ **Pedagogy alignment** — every discovery in pedagogy.md is served by the existing teaching primitives. No mark adds a discovery the primitives don't already deliver.
