# Flow B — Meaningless decoration / "feel-cool" effects crowd the scene

**Date:** 2026-06-12
**Status:** DIAGNOSIS + RESEARCH + PROPOSAL (no edits applied; human approves before anything lands)
**Investigator:** deep-dive diagnosis agent
**Scope:** ONE flow — the system inserts decorative effects/assets whose MEANING it does not
understand (concentric rings, sweep arrows, sparkles/glows), purely to "feel cool," crowding the
scene and reading as low quality. Generalizable root cause + enforceable fix. NOT a per-lesson patch.

---

## 1. Symptom (real output, two lessons)

**kptest-fenyuhe-six** — behind the six teaching dots: large faint **concentric ripple rings**.
Human: *"Circles, this is nonsense. I don't even know what it means at all."*

**kptest-first-second-third** — a large **arc/sweep arrow** across the row, plus glow/pulse/sparkle
accents on chips and animals. Human: *"Why are we inserting an arrow here? They are just making the
scene really crowded… a very low-quality behavior."*

Core charge: *"you are inserting a lot of the assets / effects, you do not know what does that mean?
You just randomly insert some of the effects to feel cool."* The fix must generalize — we will
generate hundreds of videos and need the workflow robust.

---

## 2. Root cause (file:line)

**One-liner:** The upstream Visual Contract restricts the TEACHING objects to "one element, one
signal" and an explicit decoration budget, but **no gate forces each AFFORDANCE / SIGNAL / EMPHASIS
element the composer draws to (a) trace to a named pedagogy discovery and (b) pass a legibility test
("a 5-year-old can say what this means")** — so the composer renders an *intent* ("your turn", "count
this row", "celebrate") as un-anchored visual noise (stacked rings, a default-on sweep arrow, glows),
and every downstream check is blind to it because the gates only measure **collision / contrast /
LUFS**, never **meaning**.

The flaw is NOT "the contract was sloppy." Both contracts are disciplined (they say "PulseCircle /
PointerHandArrow affordance", "ONE accent", "refuse a second sparkle"). The flaw is the **translation
step**: the composer is free to satisfy "your turn affordance" with raw concentric `<circle>` stacks,
and a registered primitive (`OrderedRowSpotlight`) ships a **direction arrow ON BY DEFAULT** — and
nothing in the skill chain re-asks "does a child know what this ring/arrow MEANS?"

### 2a. The affordance rendered as un-anchored concentric rings — the "nonsense circles"

`src/lessons/kptestFenyuheSixLessonScene.tsx`:
- **Pointer affordance, lines 739–769** — THREE nested `<circle r=200 / 150 / 100>` stacked, centered
  at `cx, cy` where **`cy = DOT_Y`** (line 411) — i.e. **directly on the dot row's vertical center**.
  Three concentric rings drawn around/behind the teaching dots = the "concentric ripple rings… I don't
  know what it means."
- **Aggregator prompt, lines 777–796** — same pattern: two more nested `<circle r=200 / 150>` at
  `QUESTION_PROMPT_X/Y`.
- **Recap, lines 844–864** — `RecapSpotlight` with `ringRadius = RECAP_RING_RADIUS = 180`
  (`kptestFenyuheSix/layout.ts:135`) around recap dots that are only `RECAP_DOT_SIZE = 42`
  (`layout.ts:245`) — a 180-radius ring around a 42px dot reads as a giant halo, not a "look here" cue.

The radii are the tell: `QUESTION_PROMPT_RING_RADIUS = 200`, `RECAP_RING_RADIUS = 180`
(`layout.ts:151,135`) vs `TEACHING_UNIT_TARGET_SIZE = 86`. The rings are **larger than the things they
point at**, centered ON them — the eye reads "decorative pulse wallpaper," not "respond now."

### 2b. The "your turn" intent itself comes from a real rule — but the rule's example produces noise

`.agents/skills/remotion-lesson-composer/SKILL.md:91` (the `learner-response` gap rule) mandates a
"LEGIBLE 'your turn' affordance" of THREE parts: a prompt LABEL, **"a `PulseCircle` or breathing ring
drawing the eye"**, and a glyph — and forbids "a bare low-opacity glow." This is correct in spirit, but
the literal phrase **"breathing ring"** is exactly what the composer turned into stacked concentric
circles with `opacity = ringProgress * 0.5 / 0.32 / 0.2` (scene lines 745/754/763) — a low-opacity
ring stack. The skill banned "a bare glow" and got a bare ring instead. **There is no legibility test on
the affordance**, so "ring drawing the eye" was satisfied by a ring that does not, in fact, read as
anything to a child.

### 2c. The sweep arrow is a primitive default, not a deliberate choice

`src/motion-primitives/OrderedRowSpotlight.tsx:171`:
```ts
const wantArrow = showDirectionArrow ?? hasOrdinalContext;
```
`showDirectionArrow` defaults to **on whenever an ordinal spotlight is in play**. The
first-second-third scene calls `OrderedRowSpotlight` with `spotlightOrdinal` set and never passes
`showDirectionArrow={false}` (scene lines 605–671), so a `TeacherMark` **label-arrow** is drawn across
the row on every count sweep (`OrderedRowSpotlight.tsx:277–290`). The composer never *decided* to add
an arrow — the primitive added it, and the composer didn't know to turn it off because **nothing asks
"what does this arrow tell the child that the moving finger + numbers don't already?"** (it is pure
redundancy — `kids-eye §2` "one element, one unique signal" would have deleted it, but `kids-eye §2` is
applied to the *contract's* element list, not to *primitive-internal* sub-elements the composer can't
see in the contract).

### 2d. The structural gap — three converging holes

1. **The "one element, one signal" / decoration-budget discipline targets the TEACHING-object list,
   not affordance/emphasis/primitive-internal chrome.** `visual-discipline §2/§3/§7`, `kids-eye §2`,
   and the contract's `decoration-budget` line all reason about the named teaching elements. Affordance
   rings, sweep arrows, glows, and sparkles are added at Wave 4 *below* the contract's resolution — the
   contract says "your turn affordance (one row)," the composer expands it into N circles, and no rule
   re-audits the expansion.

2. **No element-level "trace to a discovery" requirement.** CLAUDE.md says visual-design rows
   "reference a pedagogy discovery," but that is enforced per *contract row*, never per *rendered
   non-teaching element*. A ring/arrow/glow that the composer adds has no required justification line.

3. **No legibility/meaning gate anywhere.** `grep` across `.agents/skills/`, `CAPABILITIES.md`, and
   `docs/` for `legib|seductive|coherence|meaning|earns its place|trace to` returns **nothing**. The
   measured gate (`--measured`) checks `measuredCollisionCount`, contrast, LUFS, caption-redundancy,
   legibility-of-text — but **"is this decorative element meaningful?" is not a gate**. The composer
   self-grade (composer SKILL "Render-and-self-critique") asks "are zones respected / is the teaching
   unit big enough / is text occluded" — never "does every non-teaching mark mean something a child can
   name?" So stacked rings and a sweep arrow sail through every check that exists.

4. **`magic-fx-library` + `early-childhood-visual-taste` create POSITIVE pressure to add life.** The FX
   library is framed as the "add life / polish" toolkit (`CAPABILITIES.md:249–298`: Sparkle / ShineSweep
   / GlintFlash / GlowPulse / Breathe), and rule #6 *requires* a `<Breathe>` moving-hold on every
   load-bearing group. The skills do say "reserve emphasis for ONE moment" — but the affordance/ring
   noise is not "emphasis," it slips past that rule as "signaling," and the FX entries have **anti-pattern
   bullets about WHERE not to put FX (on the teaching primitive) but none about WHETHER an effect is
   meaningful at all.** The default posture is "add the polish," and the only brake is on the teaching
   object, not on chrome.

**Net:** the system reaches for decoration because (i) a real intent ("your turn", "count this") has no
*legible-rendering* contract, (ii) primitives volunteer chrome (default-on arrow) the composer doesn't
re-audit, and (iii) no gate — design-time or machine — ever asks the meaning question. The discipline
that *would* catch it (`kids-eye §2`, `visual-discipline §7`) is scoped to the teaching-object list and
never re-run against the composer's own added affordance/emphasis/primitive-internal elements.

---

## 3. Research synthesis (cited)

The pedagogy literature is unusually decisive here: **adding interesting-but-irrelevant visual material
hurts learning, and the effect is largest for exactly our audience (young / low-prior-knowledge /
low-working-memory learners).**

1. **Coherence principle — exclude extraneous material; it is one of the strongest, most replicated
   effects in multimedia learning.** Mayer's review: the coherence principle held in **23/23**
   experimental tests with a **median effect size 0.86** — "people learn more deeply… when extraneous
   material is excluded rather than included."
   → https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles/CD5B7AE1279A9AB81F8EEBB53DBEC86E
   "Avoid adding extraneous pictures… cute little stories and interesting pieces of trivia may seem like
   harmless embellishments [but] may depress learning compared to more concise lessons."
   → https://onlinelibrary.wiley.com/doi/10.1002/9781119239086.ch8

2. **Seductive-details effect — even *liked* graphics that aren't load-bearing fail to help and can
   hurt.** Sung & Mayer: students who got **instructive** graphics outperformed those who got
   **seductive** or **decorative** graphics on recall; all three graphic types raised *satisfaction*
   equally — i.e. decoration makes the video *feel* better while teaching *worse*. "Adding relevant
   graphics to words helps learning but adding irrelevant graphics does not."
   → https://nschwartz.yourweb.csuchico.edu/Sung%20&%20Mayer%202012.pdf
   Meta-analysis confirms the seductive-details effect on retention and transfer; the leading mechanism
   is **diversion/distraction + coherence disruption** — the learner spends effort trying (and failing)
   to integrate the irrelevant element into a mental model.
   → https://link.springer.com/article/10.1007/s10648-020-09522-4
   → https://pmc.ncbi.nlm.nih.gov/articles/PMC10176302/ (seductive details hamper learning even when
   they don't disrupt the flow — the cost is the element's mere presence)
   **Audience amplifier:** eye-tracking shows **low-working-memory learners are *particularly*
   distracted** by seductive graphics (Sanchez & Wiley 2006, summarized in Sung & Mayer) — i.e. 4–6yos
   are the worst case, not the safe case.

3. **Signaling principle — cue ONLY what matters, and the cue must read as a cue.** Signals *reduce*
   extraneous load by guiding attention to relevant elements — but the benefit is contingent on the cue
   highlighting *essential structure* (effect size ~0.38–0.41, smaller and more variable than coherence).
   A "signal" that does not legibly point at the right thing is not a signal; it is just more graphics
   = more extraneous load. The whole value of signaling is **subtractive** (fade the rest, ring the one
   spot), not additive.
   → https://link.springer.com/article/10.1007/s11423-020-09748-7
   → https://link.springer.com/article/10.1007/s10648-009-9098-7 (attention-cueing framework: cues work
   by reducing visual search; a cue that adds search is counter-productive)
   Practitioner statement of the same rule: *"instead of showing a whole complex map… have the rest fade
   slightly and a bright red circle animate around the specific area. You are literally guiding their
   eyes."* and the **"narration test": if the narrator isn't describing the motion, remove it.**
   → https://yourfuturecareer.org/how-to-use-animations-and-motion-graphics-in-course-videos
   → https://www.x-pilot.ai/blog/motion-graphics-course-videos-complete-guide-2026

4. **Respected children's / explainer practice — every element must earn its place; default to none.**
   Khan Academy explicitly builds on Mayer: limited on-screen text, narration-synced reveals, and a
   **single focus cue** ("that little circle or cross that follows along… showing users where to focus"
   — the signaling principle, ONE pointer, not a ring stack).
   → https://blog.khanacademy.org/how-khan-academy-videos-are-made-to-help-you-learn/
   Khan Academy **Kids** (our exact age band) states the discipline as a product rule: *"Designed to
   avoid excessive gamification and busy visual displays,"* "limits distractions," one corner guide
   character (Kodi), language-agnostic ding/bong feedback — restraint is the spec, not a nicety.
   → https://khankids.zendesk.com/hc/en-us/articles/48491584099355
   The motion-design rule of thumb, stated cleanly: *"motion must justify itself. Every animated element
   must answer: what does this movement tell the viewer that stillness could not? If the answer is
   nothing, the motion is decoration."* and *"Every single moving element must serve a purpose: to
   explain, to emphasize, or to transition. If it doesn't do one of those three things, delete it."*
   → https://www.ashortjourney.com/making-of/
   → https://yourfuturecareer.org/how-to-use-animations-and-motion-graphics-in-course-videos
   UCSD design guide: *"video content and decoration should be streamlined as much as possible";
   "maximize legibility of essential information; arrange information according to its importance."*
   → https://physicalsciences.ucsd.edu/academics/cal-teach/iuse-project/design-guide.html

**Synthesis for our system:** the default must be **zero decoration**; the only graphics/motion allowed
are (a) the teaching object, (b) a signal that legibly cues the ONE relevant spot, or (c) a transition.
Each must answer "what does this tell the child that stillness / its absence could not?" — and for our
audience the penalty for getting it wrong is maximal (low-WM learners are the most distracted). Our
current skills assert *most* of this for the teaching-object list, but never enforce it on the
composer's added affordance/emphasis/primitive-internal chrome, and never test legibility.

---

## 4. Proposed fix (generalizable, enforceable, not reward-hackable)

Principle: **every visual or motion element on screen must (a) trace to a named pedagogy discovery or
teaching-action it serves AND (b) pass the meaning/legibility test ("a 5-year-old, with the caption
covered, can say what this is for"). If it cannot do both, it is cut. Default = no decoration.** This
extends the existing "one element, one signal" discipline from the *teaching-object list* to **every
rendered element, including affordances, emphasis FX, and primitive-internal chrome.**

### 4.1 Where the rule lives (precise)

**A. `visual-discipline` SKILL — add a §7.1 "Element ledger: every element earns its place" (design-time
law, the cheap place).** New required block in the Visual Contract: an **Element Ledger** listing EVERY
element that will render — teaching objects, affordances, signals, emphasis FX, AND the
primitive-internal chrome a chosen primitive will draw (e.g. "OrderedRowSpotlight → also draws a
direction arrow + spotlight ring + per-item numbers + finger + tally"). Each row states two columns:
`discovery/teaching-action it serves` and `meaning test: a 5yo says "___"`. Any row that can't fill both
→ cut it or turn the primitive sub-element off. This is the single load-bearing edit — it forces the
composer to *enumerate primitive-internal chrome* (which is exactly what hid the default-on arrow) and
to *name the meaning* of every ring/glow before writing JSX. Cross-reference from `kids-eye §2`
(generalize "one element, one signal" to "every rendered element, incl. primitive-internal").

**B. `remotion-lesson-composer` SKILL — fold the Element Ledger into the render-and-self-critique loop
as a hard grading bullet.** Add to the self-critique grade (composer SKILL "Render-and-self-critique"):
*"For EVERY non-teaching element visible in the still (every ring, arrow, glow, sparkle, pulse), state
the discovery it serves and the one phrase a 5yo would say it means. If you cannot, you have inserted
decoration — delete it and re-render. A signal must legibly point at ONE spot and be smaller-or-tighter
than the thing it cues, never a ring larger than its referent centered on it."* This catches the
ring-on-dots and the redundant sweep arrow at the still, where the composer already looks.

**C. The affordance recipe (composer SKILL line ~91 `learner-response` gap) — replace "PulseCircle or
breathing ring" with a LEGIBLE-FOCUS spec.** The current wording ("a breathing ring drawing the eye")
is what produced the ring stack. Re-specify: the focus signal is **ONE `<FocusPointer>` / finger / arrow
that points AT the read-along row from outside it** (the Khan "little circle/cross that follows the
narration" model — a pointer, not a halo), plus the prompt label + glyph. **Forbid concentric/stacked
rings and any ring centered on the teaching object** — a focus cue is *subtractive* (dim the rest +
point), never a halo around what's already the only thing on screen. This converges on the existing
`signal-focus-pointer` capability (`CAPABILITIES.md:493`), which is the right legible idiom and is
already built.

### 4.2 magic-fx-library — usage-gate, not deletion

Do **not** delete the FX library (Breathe is load-bearing for rule #6; Sparkle/Glint are legitimately
the ONE-accent vocabulary). Instead **add a usage-gate to each FX entry's anti-patterns + one shared
line at the top of `magic-fx-library`**: *"An FX is allowed ONLY as the lesson's ONE reserved emphasis
accent (the climax) or as rule-#6 Breathe. It is NEVER a 'signal' or a 'your turn' cue — focus/affordance
is `FocusPointer` (a legible pointer), never a glow/pulse/ring. Before adding any Sparkle/Glint/Glow/
ShineSweep, name the single discovery it punctuates; if it is not the climax, cut it."* This kills the
"add a glow on every chip reveal" reflex (first-second-third's `GlowPulse` on chip-2/chip-3 reveals,
scene lines 489–542) without removing the accent tool.

### 4.3 OrderedRowSpotlight default — flip the arrow OFF (and document why)

`OrderedRowSpotlight.tsx:171` defaults `showDirectionArrow` ON. The arrow is the *redundant* element the
human flagged. Recommend: **change the default to `false`** (a primitive should not volunteer chrome the
composer must remember to suppress), and document in the primitive JSDoc + `primitive-registry.json`
prose that the arrow is opt-IN for the specific "set direction → renumber" beat only. This is a primitive
fix (Wave 3 domain), not a composer patch — but it is generalizable (every future ordinal lesson
benefits) and is the correct "default = no decoration" posture at the primitive layer.

### 4.4 Verification (how the gate is checked, and why it resists reward-hacking)

- **Design-time:** the Element Ledger is a written artifact in the Visual Contract; the orchestrator
  reviews it at the Wave-2 → Wave-3 boundary the same way it reviews zones. A ledger row with an empty
  "meaning" column is a visible contract defect.
- **Composer self-grade:** the render-and-self-critique still already exists; the new bullet runs against
  it. The composer must *quote the rendered element and its meaning phrase* in its report-back (same
  pattern as the existing "quote the failing gate row verbatim" rule), so a vague "it adds life" is a
  contract breach, not a pass.
- **Human eye is the ground truth (per skill-system stewardship):** meaning/legibility is not
  machine-measurable without reward-hacking (an automated "is this meaningful?" classifier would be
  gamed). The gate is therefore an **intent the next session/human checks**, encoded as a required
  written justification per element — exactly the model CLAUDE.md already uses for collision
  justifications. The contact sheet (Wave 6, 5 samples/cue) already surfaces every ring/arrow/glow at a
  glance for the human to veto.
- **Not reward-hackable because** it adds no pass/fail number to chase; it adds a *subtractive default*
  (zero decoration) + a *per-element written-meaning requirement*. The cheapest way to satisfy it is to
  draw fewer things — which is the goal.

### 4.5 Owning skills/files (summary)

| Edit | Owner skill/file | Kind |
|---|---|---|
| §7.1 Element Ledger (every element earns its place; enumerate primitive-internal chrome) | `.agents/skills/visual-discipline/SKILL.md` | spec edit |
| Generalize "one element, one signal" → every rendered element | `.agents/skills/kids-eye/SKILL.md` §2 (one line + xref) | spec edit |
| Element-Ledger meaning bullet in render-and-self-critique; affordance recipe → FocusPointer, ban ring-stacks/halo | `.agents/skills/remotion-lesson-composer/SKILL.md` | spec edit |
| FX usage-gate ("ONE accent or Breathe only; never a signal") | `.agents/CAPABILITIES.md#magic-fx-library` | spec edit |
| `showDirectionArrow` default → false + JSDoc/registry prose | `src/motion-primitives/OrderedRowSpotlight.tsx` + `primitive-registry.json` | primitive fix (Wave 3) |

All five are spec/primitive edits inside existing skills — **no new wave, no reordered waves, no changed
subagent contracts** — so per the CLAUDE.md structural-change rule they do not need structural approval
beyond the standard Hermes "human approves the diff" checkpoint. Route via `hermes-skill-system`
OPERATE as ONE atomic, revertible change (`skillsys(<owner>): <rule>`), and re-validate with a clean-room
pi run on a fresh ordinal/part-whole lesson (the human is the eye on the rendered rings/arrows).

---

## 5. The affordance problem, concretely: how "your turn" / focus SHOULD be done

The "your turn" intent is real and must stay — the failure is its *rendering*. Legible focus signaling,
per the research (signaling = subtractive, point at ONE spot) and Khan's shipped practice (a single
pointer that follows the narration):

- **Point, don't halo.** Use ONE `<FocusPointer>` / finger / arrow that sits *outside* the read-along
  row and points *at* it (already built: `signal-focus-pointer`, `CAPABILITIES.md:493`; the
  `RecapPointer` 👆 in first-second-third is the right idiom). A pointer has an unambiguous meaning
  ("look here / your turn"); a ring centered on the object does not.
- **Dim the rest.** The strongest legible "respond now" cue is to drop everything except the target to
  ~30% and leave the target full — the eye goes to the one bright thing. (This is what `RecapSpotlight`'s
  `dimOpacity` already does; the *ring* it adds on top is the noise — keep the dim, drop/​shrink the ring.)
- **Label + glyph carry the meaning, not the ring.** The localized "你来说" / "轮到你了" label + a mic/speech
  glyph already say "your turn" in words a child reads; these are the load-bearing parts of the existing
  three-part rule. The ring was the third part and the one that fails — replace "ring" with "pointer."
- **If a ring is used at all, it must be tighter than its referent and pulse once, not stack.** A single
  thin ring at `r = referent + small margin` that pulses *once* on the prompt onset reads as "this one."
  Three nested rings at `r = 200/150/100` around an 86px dot, looping forever, read as wallpaper. Size
  and count are the difference between a signal and decoration.

---

## Appendix — evidence index (file:line)

- Concentric-ring affordance (pointer): `kptestFenyuheSixLessonScene.tsx:739–769`, centered `cy=DOT_Y` (L411)
- Concentric-ring prompt (aggregator): `kptestFenyuheSixLessonScene.tsx:777–796`
- Recap ring (r=180 around 42px dots): `kptestFenyuheSixLessonScene.tsx:844–864`; `layout.ts:135,245`
- Ring radii > teaching unit: `layout.ts:135 (180)`, `:151 (200)` vs `:54 TEACHING_UNIT_TARGET_SIZE=86`
- Default-ON sweep arrow: `OrderedRowSpotlight.tsx:171`, drawn at `:277–290`; consumed w/o `showDirectionArrow={false}` at `kptestFirstSecondThirdLessonScene.tsx:605–671`
- Redundant glow-on-reveal: `kptestFirstSecondThirdLessonScene.tsx:489–542` (GlowPulse on chip reveals)
- Affordance recipe that seeded "ring": `remotion-lesson-composer/SKILL.md:91`
- FX "add life" framing, anti-patterns are placement-only (no meaning gate): `CAPABILITIES.md:249–298`
- "one element, one signal" scoped to teaching list: `kids-eye/SKILL.md §2`; `visual-discipline/SKILL.md §7`
- No legibility/meaning gate exists: `grep -ri 'legib|seductive|coherence|meaning|earns its place|trace to' .agents/skills .agents/CAPABILITIES.md docs` → empty
