# kptest-first-second-third — Visual Contract (W2a)

## 1. Kid's-eye measurement block

```
composition:          1920×1080 @ 30fps (fixed)
short-side:           1080 px

teaching-unit:        one queued animal (countable-object variant=animal)
teaching-unit-min:    ≥ 8% of 1080 = 86 px  →  rendered 280 px tall (~26%)
teaching-unit-target: 130–160 px  →  exceeded by design (280 px)
front-marker:         flag ≈140×200 px at queue head — must read "front" at a glance (demand D2)
ordinal-chip:         72 px per hanzi (≥48 px primary-label-min) → chip ≈210×110 px
caption-line-min:     56 px
separation-gap-min:   ≥ 65 px → animal-to-animal silhouette gap 120 px; marker-to-animal-1 gap 150 px; chip-to-chip gap 170 px
chrome-label:         none. NO digit glyphs anywhere (brief); NO on-screen question text (voiced only).
```

**Densest-cue fit (recap-count: marker + 3 animals + 3 chips + sweep finger), at delivery res:**
horizontal (binding axis): marker x180–320; animal centers x600 / x980 / x1360, width 260 → silhouette gaps 120 px; row span 180→1490 = 1310 px = **68% of 1920** ✓. Vertical: chips y340–470, bodies y570–850 standing on ground line y850 — every co-present gap clears 65 px ✓.

## 1.5 Zones

```
zone-title:    full-bleed             | lesson-intro-card. ACTIVE: intro ONLY (time-disjoint: queue + cast enter at arrive-first, never under/over the title — announce-topic law).
zone-prompt:   x560 y100 w800 h200    | "your turn" affordance (question-mark-circle + pulse-circle). ACTIVE: ask-second, ask-third.
zone-chips:    x140 y340 w1640 h130   | ordinal-label-token chips, each centered on its animal's x. NOTHING ELSE.
zone-objects:  x100 y500 w1720 h430   | ground line (y850) + front marker + 3 animals, incl. the reveal step-forward dip (bottom ≤ y930). No readable text inside, ever.
zone-caption:  x0   y950 w1920 h130   | caption ribbon.
zone-marks:    full-bleed             | counting-finger / poised pointer ink; may TRACE OVER zone-objects; never sits inside zone-chips or zone-caption.
```

Disjointness (computed, co-present pairs, y-intervals): prompt[100,300] ∩ chips[340,470] = ∅ (gap 40) · chips ∩ objects[500,930] = ∅ (gap 30) · objects ∩ caption[950,1080] = ∅ (gap 20). zone-title spans everything but is never co-present with any other zone (intro cue only). Chips + captions are readable content: nothing is ever drawn over them, in any frame of any cue's motion.

## 2. Visual Contract

```
metaphor:        ONE queue at a flag — three animals line up one at a time, and counting FROM the flag gives each place its name word (第一/第二/第三). One picture, whole video; it only accumulates.
regions:         zone-objects = the queue (flag = "the front", the rule's fixed origin; ground line = "a line"); zone-chips = each position's name word; zone-prompt = the child's-turn signal; zone-caption = narration ribbon; zone-marks = the counting finger.
between-states:  the SAME 3 animals + flag + ground line persist from arrive-first to the end; chips only accumulate (第一 from name-first, 第二 from count-second, 第三 from count-third) and never detach, move, or recolor. Reveals are temporary step-forward offsets that fully restore before the next ask. Nothing resets.
reading-order:   per concrete cue: flag (origin) → animal(s) → finger sweep L→R → chip pulse/attach. Ask cues: prompt affordance → (held silence) → stepped-forward animal → its chip.
decoration-budget: cream canvas + caption ribbon = 2 surfaces total. Flag, ground line, chips, affordance are teaching objects, not decoration.
text-budget:     intro title+teaser (announce-topic, load-bearing); 第一/第二/第三 chips (THE acquisition targets — persist as anchors); captions (accessibility). NOTHING else — no digits, no question text, no header.
occupancy:       binding axis = horizontal (the queue): 1310/1920 = 68% at the fullest cue. Non-binding vertical: chips-top y340 → ground y930 = 590/1080 = 55% ≥ 50% ✓.
identity-invariant: animal 1/2/3 are three visually DISTINCT, identity-stable countable-object species (D4) — the same three instances all video; only position, scale-on-step (≤1.12), and the transient sunshine sweep-highlight ever change. Chip↔animal binding is fixed (same x-center) from attach to end. The flag never moves.
motion-budget:   per-cue table in §3 (the reconcile's visual side).
```

## 3. Per-cue motion budget (`visualMotionSeconds` — minimum time the motion needs to READ; intent only, no frames)

| cue | s | motion intent (pedagogy ref) |
|---|---|---|
| intro | 3.0 | title card write-on + teaser line reads ALONE; nothing else on stage (intro) |
| arrive-first | 4.0 | animal 1 walks in from stage-right, slow x-travel, settles exactly at the flag; 1s dwell (line-first) |
| name-first | 3.0 | 第一 chip attaches above animal 1 after its settle + pulses on the voiced word (anchor to clip narration TAIL); ≥2s readable hold (line-first) |
| arrive-second | 3.5 | animal 2 walks in, settles behind animal 1; queue + chip untouched (line-second) |
| count-second | 6.0 | finger sweep from the flag: position 1 (第一 chip pulses, sunshine) → position 2 (第二 chip attaches); per-item dwell ≥2.5s; ONE live highlight at any moment (line-second) |
| arrive-third | 3.5 | animal 3 walks in, settles at the back; everything else static (line-third) |
| count-third | 8.0 | full sweep from the flag across 3 positions; 第一/第二 pulse on their spoken words, 第三 attaches last; per-item dwell ≥2.5s (line-third) |
| ask-second | 2.0 | prompt affordance pops in zone-prompt + pulse-circle loops; line FROZEN (Breathe only) — the ≥3–5s wait arrives via the typed learner-response gap on the audio side; do NOT double-count it here (ask-second) |
| reveal-second | 4.5 | picture answers FIRST at cue head: animal 2 steps forward (settle physics), its 第二 chip glow-pulses, sparkle-burst (the video's ONE emphasis accent), dwell ≥2.5s, steps back (ask-second) |
| ask-third | 2.0 | same affordance pattern as ask-second, target 第三; line frozen through the gap (ask-third) |
| reveal-third | 4.0 | animal 3 steps forward + 第三 chip glow-pulses + dwell + steps back — NO sparkle (accent already spent) (ask-third) |
| recap-invite | 2.0 | counting finger poses at the flag, ready to sweep; line static (recap-count) |
| recap-count | 9.0 | ONE slow choral L→R sweep from the flag; each chip pulses exactly on its spoken word, ~3s per word for chant-along; ONE live highlight; nothing else moves (recap-count) |

Sum of motion floors ≈ 54.5s → emergent length with narration ≈ 55–65s, matching pedagogy. W2b writes narration TO these budgets (~0.30s/char); ask-cue gaps are typed audio gaps, not motion.

## 4. Palette + motion vocabulary

| channel | theme key | meaning |
|---|---|---|
| canvas | `cream` | background only |
| ink | `textNavy` | chips' hanzi, captions, finger/pointer ink, intro text |
| origin accent | `coral` | the front marker (flag) — the count's fixed origin |
| live-count highlight | `sunshine` | the ONE currently-counted animal under the sweep — transient, never persistent |

Animal species colors are primitive-internal identity (D4, judged by W3b at render size) — no scene-level meaning. No fifth meaningful color.

Motion vocabulary (named only — W4a derives all frames from cue boundaries): walk-in = big-move x-travel `EASE.inOutCubic` + `<PopIn motion="settle">` landing; chip attach = `<PopIn motion="snap">`; chip word-pulse = scale pulse, `EASE.outCubic` small move; sweep pacing = `ordered-row-spotlight` driven per spoken word; step-forward/back = `EASE.inOutCubic` + settle; affordance pop = `<PopIn motion="snap">` + `pulse-circle`. NO `motion="bouncy"` anywhere — the single allowed accent is the reveal-second `sparkle-burst`. Every load-bearing held group (queue, chips) wears `<Breathe>` with distinct phaseSeeds (`kptest-queue`, `kptest-chips`).

## 5. Reuse-primitive table (catalog ids; W3b verifies the D-flags)

| element | catalog id | note |
|---|---|---|
| intro card | `lesson-intro-card` | title + section eyebrow + order-question teaser |
| animals 1–3 | `countable-object` variant=animal | D4: three distinct identity-stable looks |
| front marker | `icon-asset` `journey-path-flag` (+ ground line) | D2: must read "front"; coral-tinted |
| ordinal chips | `ordinal-label-token` | D1: hanzi word form 第一/第二/第三, no digit |
| count sweep | `ordered-row-spotlight` direction=ltr | D3: count/say steps only, no write step |
| your-turn affordance | `icon-asset` `question-mark-circle` + `pulse-circle` | zone-prompt, both ask cues |
| poised counting finger | `pointer-hand-arrow` variant=hand | recap-invite; must read as the SAME finger idiom as the sweep's finger (one idiom for "the counting finger") |
| reveal accents | `glow-pulse` (chip) ; `sparkle-burst` (reveal-second ONLY) | one emphasis moment per video |
| moving hold | `breathe` + `fx-defs` once at root | rule #6 |

## 6. Anti-patterns (refuse on sight)

- A digit glyph anywhere, or the retrieval question rendered as text — voiced only; the affordance is the icon.
- Two live highlights during any sweep, or a chip pulsing while the finger is on another animal.
- Any queue motion during an ask-cue gap (motion leaks the answer) — Breathe ≤0.5% is the only life.
- A second sparkle/bouncy/color-flash — the accent budget is spent at reveal-second.
- Chips detaching, drifting, recoloring, or rendered on an animal's body; a chip outside zone-chips.
- The flag moving, dimming, or a sweep originating anywhere but the flag.
- Animals entering from stage-left (breaks "front = left = flag"); animal species/colors changing mid-video.
- Intro card co-present with any queue element.
