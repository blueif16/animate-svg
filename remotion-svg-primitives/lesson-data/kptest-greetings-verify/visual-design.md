# Visual Design — kptest-greetings-verify

> Wave 2a artifact. INTENT ONLY — no absolute frames. Every frame reference derives from `cues[id].startFrame + offset` at composition time.

---

## 1. Kids'-Eye Measurement Block

```
composition:             1920×1080 @ 30fps   (fixed; non-negotiable)
short-side:              1080 px

teaching-unit:           English target word (the largest rendered token in the
                         ReadAlongHighlight or speech bubble — "Hello", "I'm Sam",
                         "Goodbye"). The smallest signal-carrying mark is a single
                         English letter at the cursor position.
teaching-unit-min:       ≥ 8% of short-side = 86 px   →  individual letter ≥ 86 px
teaching-unit-target:    12–15% of short-side = 130–160 px  (whole word "Hello"
                         rendered ≥ 300 px wide so each letter ≥ 86 px)

primary-label-min:       48 px rendered  (target English phrases in ReadAlongHighlight
                         and speech-bubble lines — "Hello", "Hi", "I'm Sam",
                         "Goodbye", "Bye-Bye")
body-label-min:          36 px rendered  (character name cards if used, count badges)
caption-line-min:        56 px rendered  (narration caption ribbon)
chrome-label:            FORBIDDEN — no decorative labels; every string is load-bearing
```

**Verification:** At 1920×1080, a "Hello" word at 48px primary-label-min renders each letter at ~60px. To hit the 86px teaching-unit-min, the RAH itemRadius must size each token so letters render ≥86px — set `itemRadius` accordingly (≈60px radius gives ~120px token width, letter width ~60–80px depending on glyph). The full word "Hello" at 5 letters × ~80px = ~400px wide = 37% of short-side. ✓ Hits target. Speech-bubble line text uses the same minimum — bubble `line` ReactNode sized to match.

---

## 2. Spatial Zones

```
zone-characters:   x:180, y:220, w:1560, h:520
                   Holds: Kid A (<IconAsset name='boy-face'/>) anchored left (~x:420),
                   Kid B (<IconAsset name='girl-face'/>) anchored right (~x:1500),
                   plus their lean/bob gestures.
                   NOTHING ELSE except speech-bubble tails pointing at speakers.

zone-bubbles:      x:280, y:60, w:1360, h:260
                   Holds: DialogueExchange speech bubbles. Tails point down into
                   zone-characters at the speaking figure. At most 2 visible bubbles
                   (older dims per DialogueExchange maxVisibleBubbles=2).

zone-text:         x:360, y:680, w:1200, h:140
                   Holds: ReadAlongHighlight text items (the target English phrases
                   as the cursor sweeps). ONE active line at a time. Never overlaps
                   zone-bubbles or zone-characters' faces.

zone-caption:      x:0, y:940, w:1920, h:140
                   Holds: narration caption ribbon. Full-width, bottom-anchored.

zone-intro:        centered on 960×540, w:~900, h:~480
                   Holds: LessonIntroCard. TEMPORAL zone — active only during
                   topic-intro, absent for all subsequent cues.

zone-recap:        x:360, y:160, w:1200, h:500
                   Holds: recap stack (three phrases, one active). TEMPORAL zone —
                   active only during recap. Replaces zone-bubbles + zone-text.

zone-marks:        full-bleed
                   Sketch marks may TRACE OVER zone-characters (e.g. a wave-arc
                   following a hand gesture) but never SIT INSIDE zone-text or
                   zone-caption.
```

### Z-order legibility (kids-eye §1.5)

- **topic-intro:** LessonIntroCard is the ONLY readable content. Cast enters AFTER the card has fully read (title + eyebrow + teaser + underline all settled). No characters, no gate, no bubbles overlay the card.
- **greet through farewell (C1–C5):** zone-bubbles is ABOVE zone-characters. Speech bubbles never occlude the character faces. zone-text is BELOW zone-characters. ReadAlongHighlight text never overlaps speech bubbles vertically (140px gap between zone-bubbles bottom at y:320 and zone-text top at y:680).
- **im-slow-model (C2):** The emphasis PulseCircle fires on the "I'm" token INSIDE the speech bubble in zone-bubbles. It does not extend into zone-characters or zone-text. The "big, centered, nothing on top" requirement is satisfied because the PulseCircle is the focal element and the only active motion — Kid A is quiet, the gate background is static, no other labels compete.
- **recap (C6):** zone-recap replaces zone-bubbles and zone-text. No characters are speaking; the recap stack is the only active text zone. Characters remain visible in zone-characters (holding, Breathe-wrapped) but are NOT speaking — no bubbles.

---

## 3. Palette & Motion Vocabulary (early-childhood-visual-taste)

### Palette (from `src/theme.ts` via `resolveColor`)

| Role | Theme key | Meaning |
|---|---|---|
| Canvas background | `cream` `#FFF7E6` | Warm, low-contrast vs ink |
| Teaching text / ink | `textNavy` `#24324B` | All readable text: speech-bubble lines, RAH items, caption ribbon, sketch marks |
| Emphasis accent | `coral` `#FF8A65` | Key-difficult /aɪm/ emphasis — PulseCircle on "I'm" turn, DialogueExchange emphasisColor |
| Transient highlight | `sunshine` `#FFD85A` | ReadAlongHighlight active-item glow, "your turn" prompt affordance. Never persistent. |
| Dimmed / inactive | `softGrayBlue` `#B5C0D0` | Past RAH items (dimPast=true), dimmed older speech bubble |

**4 meaningful colors + cream background. No fifth color.** Character face IconAssets use their own on-palette theme fills (natural skin tones within the warm palette — not counted as semantic colors since they are identity, not signal).

### Typography

- Sans-serif, rounded, friendly. Use `fontFamily` from `src/shape-primitives/shared.tsx`.
- Speech-bubble lines: ≥48px (primary-label-min). Bold for the target English word within a bubble line (e.g. the "Hello" in Kid A's greeting).
- ReadAlongHighlight items: ≥48px. Each token is a separate ReactNode in `lines[][]`.
- Caption ribbon: ≥56px (caption-line-min).
- LessonIntroCard title: largest line, sized per `LessonIntroCard` `titleSize` prop.

### Motion vocabulary (intent — named curves only)

| Move type | Frames | Curve |
|---|---|---|
| Character entrance (slide-in from off-screen) | 20 | `EASE.enter` |
| Speech-bubble pop-in | DialogueExchange default | `PopIn motion="bouncy"` (composed inside DialogueExchange) |
| Character lean/bob (speaking gesture) | 12 | `EASE.outCubic` |
| ReadAlongHighlight cursor (ball) | per-beat | `EASE.outCubic` hop + parabolic arc (composed inside RAH) |
| PulseCircle emphasis (I'm) | PulseCircle default | expanding ripple rings (composed inside DialogueExchange) |
| LessonIntroCard write-on + stagger | per `progress` | internal stagger (composed inside LessonIntroCard) |
| "Your turn" glow appear | 16 | `EASE.enter` |
| Recap phrase cycle (slide in/out) | 16 in / 16 out | `EASE.enter` / `EASE.outCubic` |
| Parting motion (farewell) | 24 | `EASE.inOutCubic` |
| `<Breathe>` on held groups | 4s cycle | bpm=15, amplitudeScale=0.005, per-group phaseSeed |

**One accent moment:** `PopIn motion="bouncy"` fires on the "I'm Sam" speech bubble in im-slow-model (C2) — the key-difficult sound's introduction is the ONE bouncy accent per video. All other bubble entrances use the DialogueExchange default.

---

## 4. Visual Contract

```
metaphor:        Two kids meet at the school gate — their spoken English words
                 surface naturally from the encounter as speech bubbles and
                 read-along text. One small social moment, not three flashcards.

regions:         zone-characters → the two kids (Kid A left, Kid B right),
                 identity-invariant, gestures change per cue.
                 zone-bubbles → DialogueExchange speech bubbles (who said what).
                 zone-text → ReadAlongHighlight (the target phrase as spoken).
                 zone-intro → LessonIntroCard (topic-intro only).
                 zone-recap → recap stack (recap only).
                 zone-caption → narration ribbon (every cue).
                 School-gate backdrop → subtle context behind zone-characters
                 (two pillars + low arch; soft tones, never competes with figures).

between-states:  Same two characters persist C1–C5 in the same positions.
                 Speech bubbles appear and dim per turn.
                 ReadAlongHighlight text changes per cue's target phrase.
                 School-gate backdrop holds throughout C1–C5.
                 C0 (intro) and C6 (recap) are visually distinct layouts.

reading-order:   C0: card eyebrow → title → teaser → underline.
                 C1–C5: character gesture (wave/lean) → speech bubble →
                 ReadAlongHighlight cursor → caption.
                 C6: active recap phrase → inactive phrases → caption.

decoration-budget:  1 cream canvas + 1 caption ribbon = 2 stacked surfaces.
                    School-gate backdrop is a scene element (not a surface).
                    No cards behind characters. No tinted boxes behind bubbles.

text-budget:     Speech-bubble lines — load-bearing (the target English).
                 ReadAlongHighlight items — load-bearing (read-along support).
                 Caption ribbon — load-bearing (accessibility + ESL).
                 LessonIntroCard title/section/teaser — load-bearing (announce-topic).
                 Recap stack phrases — load-bearing (spaced recall retrieval).
                 No chrome headers, no decorative labels, no count badges.

occupancy:       Horizontal axis is binding (two characters flanking center).
                 Characters at ~x:420 and ~x:1500 use ~1080px spread = 56% of
                 horizontal axis. Speech bubbles span ~800px center.
                 RAH text spans up to ~1000px for "Goodbye" / "Bye-Bye".
                 Vertical: three bands (bubbles / characters / text) fill ~80%
                 of 1080px height with the caption ribbon at bottom.

identity-invariant: The two kid characters (<IconAsset name='boy-face'/> and
                 <IconAsset name='girl-face'/>) are the SAME figures for the
                 entire lesson. Same face, same body, same colors. Only their
                 gestures (lean, wave) and speech change. The school-gate
                 backdrop holds C1–C5 unchanged.

motion-budget:   (per cue — visualMotionSeconds including dwell/hold)
                 topic-intro:     2.5s   (card write-on + stagger + settle)
                 greet:           4.0s   (approach + 2 bubble turns + RAH sweep)
                 im-slow-model:   9.0s   (emphasis pulse + 2 slow cursor sweeps
                                          with extended I'm dwell + settle)
                 im-choral-echo:  7.0s   (model sweep + your-turn prompt + hold)
                 im-learner-gap:  5.0s   (prompt text appear + glow through silence)
                 farewell:        4.5s   (parting motion + 2 bubble turns + RAH)
                 recap:          13.0s   (3-phrase cycle with extra I'm dwell)
                 ─────────────────────
                 TOTAL:          45.0s   (motion floor; reconcile uses
                                          max(narration, visual) + tail per cue)
```

### Identity-invariant detail

The two characters are identity-invariant across the lesson:

- **Kid A** (`<IconAsset name='boy-face' />`): positioned left in zone-characters. In greet and farewell, Kid A speaks first (Hello / Goodbye). In im-slow-model through im-learner-gap, Kid A is the LISTENER — quiet, Breathe-wrapped, no gesture.
- **Kid B** (`<IconAsset name='girl-face' />`): positioned right in zone-characters. In greet, Kid B responds (Hi). In im-slow-model, Kid B delivers "I'm Sam" with emphasis. In farewell, Kid B says "Bye-Bye".
- Both characters carry `<Breathe originX originY bpm={15} amplitudeScale={0.005} phaseSeed="kid-a"|"kid-b" drift={0.5}>` for rule #6 (no frozen frames during holds).

### School-gate backdrop

A subtle scene element establishing the "school gate" context. Two simple pillars with a low arch, rendered in soft tones (lighter cream/warm gray) that do NOT compete with the characters or text. The backdrop:

- Is NOT a registered primitive — it is a scene-composed SVG group or an `<IconAsset>` if one exists (W3b gap-scan will check).
- Holds static through C1–C5. Wrapped in `<Breathe>` with its own phaseSeed for rule #6.
- Absent in C0 (intro card occupies the canvas alone) and C6 (recap layout replaces the scene).
- Must NOT include decorative elements (trees, flowers, signs with text, birds). Just the gate structure.

### Re-engagement rhythm (research/teaching-tempo-pacing)

Every cue introduces new visual motion (character approach, bubble pop-in, cursor sweep, emphasis pulse, parting motion, recap cycling). The longest static holds are:

- im-learner-gap (C4): 5.0s of glow-hold through silence. The expectant social context and the "your turn" affordance carry the engagement; the silence IS the focal change.
- im-choral-echo (C3): 4.0s hold after prompt appear. The glow pulse on the text provides subtle motion.

No stretch exceeds 15s without a visual change. ✓ Within the 15–30s re-engagement window.

---

## 5. Per-Cue Visual Design

### C0 — topic-intro

**discovery:** This lesson is about three English routines for the school gate.
**teaching action(s):** `announce-topic`
**requires binding:** card reads alone first; cast and objects enter AFTER.

| Element | Zone | Signal | Entrance |
|---|---|---|---|
| LessonIntroCard (section eyebrow, title, one-line KP teaser) | zone-intro | Names what we'll learn | `PopIn motion="settle"`, progress-driven stagger |

**Motion intent:**
- Card appears centered, eyebrow fades + rises first, then title, then teaser, then accent underline draws on.
- All driven by one `progress` (0→1) derived from `cues["topic-intro"].startFrame + offset`.
- Cast does NOT appear. Gate does NOT appear. The card IS the picture.

**visualMotionSeconds: 2.5s**
- Card stagger + underline draw-on: ~50 frames (1.67s)
- Settle + brief hold for reading: ~25 frames (0.83s)

---

### C1 — greet

**discovery:** "Hello" and "Hi" are two English sounds for the same greeting action.
**teaching action(s):** `stage-the-moment` → `model-target-slow` (Hello, normal; Hi, normal) → `track-read-along`

| Element | Zone | Signal | Entrance |
|---|---|---|---|
| School-gate backdrop | behind zone-characters | Scene context (subtle) | Fade-in, EASE.enter |
| Kid A (boy-face) | zone-characters left | Who is speaking | Slide-in from left, EASE.enter, 20 frames |
| Kid B (girl-face) | zone-characters right | Who is responding | Slide-in from right, EASE.enter, 20 frames |
| DialogueExchange turn 1: Kid A "Hello" (gesture:wave) | zone-bubbles | The greeting word | PopIn (bouncy default), after Kid A settles |
| DialogueExchange turn 2: Kid B "Hi" (gesture:wave) | zone-bubbles | The response word | PopIn, after turn 1 + interTurnGap |
| ReadAlongHighlight lines:[["Hello", "Hi"]] cursor:"ball" | zone-text | Read-along tracking | PopIn line entrance, cursor tracks with spoken tokens |

**Motion intent:**
1. Gate backdrop fades in (background, not load-bearing).
2. Kid A slides in from left, Kid B slides in from right — they approach each other. Both wrapped in `<Breathe>` for rule #6.
3. Kid A's wave gesture (lean toward Kid B) + "Hello" bubble pops in above.
4. Kid B's wave gesture (lean toward Kid A) + "Hi" bubble pops in after gap.
5. RAH text enters below, cursor sweeps "Hello" then "Hi" synced with DialogueExchange turns.

**Reading order:** Kid A approach → Kid B approach → "Hello" bubble → "Hi" bubble → RAH cursor.

**visualMotionSeconds: 4.0s**
- Character approach + settle: ~20 frames (0.67s)
- Turn 1 bubble + lean: ~30 frames (1.0s) including dwell
- Turn 2 bubble + lean: ~30 frames (1.0s) including dwell
- RAH cursor sweep + final hold: ~39 frames (1.3s)

---

### C2 — im-slow-model

**discovery:** "I'm" is one smooth sound /aɪm/, followed by your name.
**teaching action(s):** `model-target-slow` (I'm, exaggerated, ~2 models) → `track-read-along`
**requires binding:** target glyph big, centered, nothing on top; predictive pause before reveal.

| Element | Zone | Signal | Entrance |
|---|---|---|---|
| School-gate backdrop (held from C1) | behind zone-characters | Scene context | Static (no re-entrance) |
| Kid A (held, listener) | zone-characters left | The person being introduced to | Static + Breathe |
| Kid B (held, speaker) | zone-characters right | The person introducing themselves | Static + Breathe |
| DialogueExchange: Kid B "Hi! I'm… Sam" (emphasis:true on I'm turn) | zone-bubbles | The self-introduction with I'm emphasis | PopIn on the bubble; PulseCircle fires on "I'm" token |
| ReadAlongHighlight lines:[["Hi!", "I'm", "Sam"]] beats:[1, 3, 1] cursor:"ball" | zone-text | Slow cursor with extended dwell on "I'm" | Cursor sweep slows on "I'm" (beat weight 3) |

**Motion intent:**
1. Brief predictive pause — scene holds, no new motion (~0.5s). Characters Breathe.
2. Kid B leans toward Kid A. Speech bubble pops in with "Hi! I'm… Sam" — the emphasis flag fires a PulseCircle ripple on the "I'm" token. This is the ONE accent moment: `PopIn motion="bouncy"` on this bubble only.
3. RAH cursor sweeps "Hi!" quickly, then SLOWS dramatically on "I'm" (beat weight 3× normal). The cursor dwells on "I'm" for the duration of the slow model.
4. Second model: a brief pause, then the PulseCircle fires again (repeatCount accommodates 2 pulses across the cue). Cursor sweeps "I'm" again at slow speed, then glides to "Sam".
5. Brief settle — cursor rests on "Sam", scene holds.

**Reading order:** predictive pause → Kid B lean → bubble pop + PulseCircle on "I'm" → RAH cursor slow on "I'm" → second pulse → cursor to "Sam" → settle.

**visualMotionSeconds: 9.0s**
- Predictive pause: ~15 frames (0.5s)
- First model (bubble + lean + PulseCircle + slow cursor on "I'm"): ~90 frames (3.0s)
- Inter-model pause: ~12 frames (0.4s)
- Second model (PulseCircle + slow cursor on "I'm" + glide to "Sam"): ~80 frames (2.7s)
- Settle + hold: ~72 frames (2.4s)

---

### C3 — im-choral-echo

**discovery:** The child can produce "I'm Sam" together with the teacher.
**teaching action(s):** `invite-echo` (model at natural speed + choral invitation) → `track-read-along`

| Element | Zone | Signal | Entrance |
|---|---|---|---|
| School-gate backdrop (held) | behind zone-characters | Scene context | Static |
| Kid A, Kid B (held from C2) | zone-characters | Characters hold positions | Static + Breathe |
| ReadAlongHighlight lines:[["I'm", "Sam"]] cursor:"underline" dimPast:false | zone-text | The target phrase, cursor sweeps at natural speed then holds | "Your turn" glow affordance appears after sweep |

**Motion intent:**
1. Teacher model: RAH cursor sweeps "I'm Sam" at natural speed (faster than C2 — this is the natural-speed model). Cursor: "underline" for variety from C2's "ball".
2. "Your turn" affordance: a soft sunshine-colored glow pulse appears on the RAH text after the sweep completes. The glow uses `<GlowPulse>` or the RAH's own active-item glow, triggered at the invitation point.
3. Hold: the text stays lit with the glow through the choral response window. Characters hold, Breathe-wrapped.

**No new scene elements.** The only change from C2 is the RAH text (now just "I'm Sam", not the full "Hi! I'm Sam") and the "your turn" affordance.

**Reading order:** RAH cursor sweep → glow appear → held text through echo window.

**visualMotionSeconds: 7.0s**
- Cursor sweep at natural speed: ~36 frames (1.2s)
- "Your turn" glow appear: ~16 frames (0.5s)
- Hold with glow through echo window: ~159 frames (5.3s) — includes dwell for the child's choral response

---

### C4 — im-learner-gap

**discovery:** The child can say "I'm Sam" on their own, without teacher support.
**teaching action(s):** `learner-response-gap`

| Element | Zone | Signal | Entrance |
|---|---|---|---|
| School-gate backdrop (held) | behind zone-characters | Scene context | Static |
| Kid A, Kid B (held) | zone-characters | Expectant social context — Kid A looks at Kid B | Static + Breathe |
| ReadAlongHighlight lines:[["I'm", "Sam"]] cursor:"none" | zone-text | "Your turn" text affordance — cursor inactive, text glowing | Hold from C3, cursor deactivates |

**Motion intent:**
1. Brief prompt: the RAH text "I'm Sam" brightens its glow (sunshine pulse) as the narrator says "你来试试".
2. Silence: the glow holds steady through the ≥3–5s silent gap. The cursor is INACTIVE (cursor:"none") — this signals "no teacher voice, your turn." Characters hold, Breathe-wrapped.
3. The held scene IS the focal change — the silence after sound. The expectant Kid A looking at Kid B provides social motivation.

**No new visual elements enter.** The scene holds. The focal change is the ABSENCE of motion and teacher voice.

**Reading order:** RAH glow brightens → held scene through silence.

**visualMotionSeconds: 5.0s**
- Glow brighten on prompt: ~18 frames (0.6s)
- Hold through silence (≥3–5s baked in audio): ~132 frames (4.4s)

---

### C5 — farewell

**discovery:** "Goodbye" and "Bye-Bye" are two English sounds for the same parting action.
**teaching action(s):** `stage-the-moment` → `model-target-slow` (Goodbye; Bye-Bye, both normal pace) → `track-read-along`

| Element | Zone | Signal | Entrance |
|---|---|---|---|
| School-gate backdrop (held) | behind zone-characters | Scene context | Static |
| Kid A (parting) | zone-characters left→further left | The parting motion | EASE.inOutCubic slide away |
| Kid B (parting) | zone-characters right→further right | The parting motion | EASE.inOutCubic slide away |
| DialogueExchange turn 1: Kid A "Goodbye" (gesture:wave) | zone-bubbles | The farewell word | PopIn, after parting begins |
| DialogueExchange turn 2: Kid B "Bye-Bye" (gesture:wave) | zone-bubbles | The response farewell | PopIn, after turn 1 + gap |
| ReadAlongHighlight lines:[["Goodbye", "Bye-Bye"]] cursor:"ball" | zone-text | Read-along tracking | Cursor tracks with spoken tokens |

**Motion intent:**
1. Parting begins: both characters start moving apart (EASE.inOutCubic, 24 frames). They wave (gesture:wave on both turns).
2. Kid A's "Goodbye" bubble pops in as they turn to wave.
3. Kid B's "Bye-Bye" bubble pops in after the interTurnGap.
4. RAH text enters below, cursor sweeps "Goodbye" then "Bye-Bye".
5. Characters continue separating through the cue — the growing distance is the focal change.

**Reading order:** characters start parting → "Goodbye" bubble → "Bye-Bye" bubble → RAH cursor → characters fully apart.

**visualMotionSeconds: 4.5s**
- Parting motion start + turn 1 bubble: ~42 frames (1.4s)
- Turn 2 bubble + lean: ~36 frames (1.2s)
- RAH cursor sweep + hold: ~42 frames (1.4s)
- Parting settle (characters at final distance): ~15 frames (0.5s)

---

### C6 — recap

**discovery:** The three routines form one complete encounter; the child can retrieve all of them.
**teaching action(s):** `spaced-recall`
**requires binding:** single live marker on currently-spoken item; marker on stale row = bug.

| Element | Zone | Signal | Entrance |
|---|---|---|---|
| Recap stack: three phrases vertically arranged | zone-recap | The three target phrases for retrieval | Each phrase slides in (EASE.enter) as it becomes active |
| ReadAlongHighlight (active phrase highlighting) | zone-recap (integrated) | Single live marker on current phrase | Cursor/highlight moves to active phrase |
| Kid A, Kid B (held, visible) | zone-characters | Scene continuity — characters resting after parting | Static + Breathe. No speech bubbles. |

**Motion intent:**
1. The recap stack appears with three rows: "Hello / Hi", "I'm Sam", "Goodbye / Bye-Bye". Initially all visible but dimmed (softGrayBlue).
2. Phrase 1 activates: "Hello / Hi" brightens to textNavy, RAH cursor sweeps it (~4s with dwell).
3. Phrase 1 dims back. Phrase 2 activates: "I'm Sam" brightens, cursor sweeps it with EXTRA dwell on "I'm" (~5s — the hardest target gets the most retrieval time).
4. Phrase 2 dims back. Phrase 3 activates: "Goodbye / Bye-Bye" brightens, cursor sweeps it (~4s).
5. Brief hold with all three phrases visible, the last one still lit.

**Single live marker rule:** ONLY the currently-spoken phrase is highlighted. When phrase 2 is active, phrase 1 is dimmed. No marker sits on a stale row. This is enforced by the ReadAlongHighlight `dimPast:true` across the recap lines, or by driving each phrase's active state explicitly.

**Reading order:** active phrase highlight → cursor sweep → dim → next phrase.

**visualMotionSeconds: 13.0s**
- Stack appear + first phrase activate: ~24 frames (0.8s)
- Phrase 1 "Hello / Hi" sweep + dwell: ~108 frames (3.6s)
- Transition + Phrase 2 "I'm Sam" sweep + extended I'm dwell: ~150 frames (5.0s)
- Transition + Phrase 3 "Goodbye / Bye-Bye" sweep + dwell: ~96 frames (3.2s)
- Final hold: ~12 frames (0.4s)

---

## 6. Finger-Cover Test (kids-eye §3)

### Cover each element

| Element covered | Does the picture still teach? | Verdict |
|---|---|---|
| School-gate backdrop | Yes — the characters and their words carry the lesson. | Backdrop is scene context, not load-bearing. ✓ |
| Speech bubbles (any) | No — the target English word is invisible. | Load-bearing. ✓ |
| ReadAlongHighlight | Partially — the bubble still shows the word, but the read-along support is gone. | Load-bearing for accessibility/ESL. ✓ |
| Kid A or Kid B | No — the social encounter collapses. One character = monologue, not dialogue. | Load-bearing. ✓ |
| Caption ribbon | Yes for the visual teaching; no for accessibility. | Load-bearing for accessibility. ✓ |
| PulseCircle on "I'm" (C2) | Partially — the word is still visible but the emphasis on /aɪm/ is lost. | Load-bearing for the key-difficult target. ✓ |
| "Your turn" glow (C3/C4) | Partially — the text is visible but the invitation to speak is weaker. | Load-bearing for the production prompt. ✓ |

### Cover everything except the teaching object

Cover all chrome, leaving only the characters and their speech:
- greet (C1): two kids facing each other, one says "Hello", the other says "Hi". The greeting moment is clear. ✓
- im-slow-model (C2): Kid B says "I'm… Sam" with emphasis. The self-introduction is clear. ✓
- farewell (C5): two kids waving and moving apart, saying "Goodbye" / "Bye-Bye". The parting is clear. ✓

**Verdict:** The teaching objects (characters + their spoken words) carry the lesson. No element is propping up a weak teaching object with chrome.

---

## 7. One Element, One Signal (kids-eye §2)

| Element | Signal | Already carried by? | Verdict |
|---|---|---|---|
| Kid A face | "This person is speaking / listening" | — | Unique signal. ✓ |
| Kid B face | "This other person is speaking / listening" | — | Unique signal. ✓ |
| Speech bubble | "The English words this person said" | — | Unique signal. ✓ |
| RAH text | "Follow along with the spoken words" | Speech bubble shows the words, but RAH adds the CURSOR (which word is active NOW) | Different signal: bubble = who said what; RAH = which word is being said at this moment. ✓ |
| PulseCircle on "I'm" | "This sound is the hard one — listen carefully" | RAH cursor already marks active word | Different signal: cursor = tracking; pulse = emphasis/difficulty. ✓ |
| "Your turn" glow | "Now YOU say it" | — | Unique signal. ✓ |
| School-gate backdrop | "This happens at school" | — | Scene context, not a teaching signal. Acceptable at scene level. ✓ |
| Caption ribbon | Accessibility read-along | — | Unique signal (accessibility). ✓ |

**No duplicates.** No two elements carry the same signal.

---

## 8. Asset Gap (for W3b gap-scan)

**School-gate backdrop:** The storyboard requires a school-gate context for C1–C5. This is NOT a registered primitive — it is either:
1. A scene-composed SVG group (two pillars + low arch in soft cream/warm gray), OR
2. An `<IconAsset name='school-gate'>` if one exists in the generated asset library.

W3b must check whether a suitable background asset exists. If not, the backdrop should be composed from simple SVG shapes (rectangles for pillars, arc for the gate top) — it does NOT need to be a registered primitive since it is scene-specific context, not a reusable teaching object.

**Constraint:** The backdrop must NOT include readable text (no "School" sign), decorative elements (trees, flowers, birds), or any element that would compete with zone-characters or zone-bubbles. Two pillars and a low arch, rendered in a tone close to cream (warm gray or light beige), is sufficient.

---

## 9. Component Reuse Map

All required components exist in `catalog-digest.md`:

| Cue | Component | Props (intent) |
|---|---|---|
| topic-intro | `LessonIntroCard` | title, section, teaser — caller ReactNodes. cardFill OFF (canvas is background). progress from cue offset. |
| greet | `DialogueExchange` | left:{figure:IconAsset boy-face}, right:{figure:IconAsset girl-face}, turns:[{speaker:'left', line:"Hello", gesture:'wave'}, {speaker:'right', line:"Hi", gesture:'wave'}]. atFrame from cue offset. |
| greet | `ReadAlongHighlight` | lines:[["Hello","Hi"]], cursor:"ball", dimPast:true. atFrame from cue offset. |
| im-slow-model | `DialogueExchange` | turns:[{speaker:'right', line:"Hi! I'm… Sam", gesture:'point-self', emphasis:true}]. emphasisColor:coral. atFrame from cue offset. |
| im-slow-model | `ReadAlongHighlight` | lines:[["Hi!","I'm","Sam"]], beats:[1,3,1], cursor:"ball", dimPast:true. atFrame from cue offset. |
| im-choral-echo | `ReadAlongHighlight` | lines:[["I'm","Sam"]], cursor:"underline", dimPast:false. "Your turn" glow via activeScale/highlightColor. |
| im-learner-gap | `ReadAlongHighlight` | lines:[["I'm","Sam"]], cursor:"none", dimPast:false. Text glowing (sunshine highlightColor). |
| farewell | `DialogueExchange` | turns:[{speaker:'left', line:"Goodbye", gesture:'wave'}, {speaker:'right', line:"Bye-Bye", gesture:'wave'}]. atFrame from cue offset. |
| farewell | `ReadAlongHighlight` | lines:[["Goodbye","Bye-Bye"]], cursor:"ball", dimPast:true. |
| recap | `ReadAlongHighlight` | lines:[["Hello / Hi"],["I'm Sam"],["Goodbye / Bye-Bye"]], beats:[1,1,1, 1,3,1, 1,1,1,1] (flat across lines), cursor:"ball", dimPast:true. Extra dwell on "I'm" via beat weight. |

All components are prop-driven and lesson-agnostic. No topic/copy/timing is hardcoded.

---

## 10. Sketch Marks (teacher-mark overlay)

**Intent: MINIMAL.** This is a language lesson, not a math lesson. Sketch marks are optional and should be used sparingly if at all.

| Cue | Mark | Kind | Signal |
|---|---|---|---|
| (none planned) | — | — | — |

**Rationale:** The teaching objects (characters, speech bubbles, RAH text) carry the lesson. Sketch marks would compete with the spoken-word focus. If the sketch-explainer-layer subagent (W4 parallel) identifies a motivated mark (e.g., a wave-arc tracing a character's hand gesture), it must:
- Use `textNavy` ink only.
- Trace OVER zone-characters, never sit inside zone-text or zone-caption.
- At most one mark in the entire video.
- Draw-on: 18 frames default, `EASE.enter`.

---

## 11. Self-Check (kids-eye §5)

1. ✅ **Measurement block** (§1): Written. Teaching-unit (English letter) ≥86px at itemRadius ~60px. Primary labels ≥48px. Caption ≥56px. All minimums met.

2. ✅ **Zones** (§2): Declared, disjoint. Every scene element belongs to a named zone. No readable content is occluded:
   - Speech bubbles in zone-bubbles (y:60–320) do not overlap character faces in zone-characters (y:220–740). Bubbles are ABOVE faces.
   - RAH text in zone-text (y:680–820) does not overlap bubbles (140px vertical gap).
   - Caption ribbon (y:940–1080) does not overlap RAH text (120px gap).
   - topic-intro: card reads alone, no overlay.
   - Z-order checked across cue motion (not just one keyframe): bubble pop-in does not occlude a face; character lean does not occlude a bubble.

3. ✅ **One element, one signal** (§7 above): Every element answers the signal sentence. No duplicates.

4. ✅ **Finger-cover test** (§6 above): Both directions pass. Teaching objects carry the lesson without chrome.

5. ✅ **Identity across transformation** (kids-eye §4): The two characters are the same IconAsset figures throughout. Same face, same colors. Only gestures and speech change. No color changes, no shape changes. The school-gate backdrop holds unchanged C1–C5.
