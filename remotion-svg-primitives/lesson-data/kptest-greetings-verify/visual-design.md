# Visual Design — kptest-greetings-verify

## 1. Kids-eye measurement block

```
composition:             1280×720 @ 30fps   (repo standard; theme.ts video)
short-side:              720 px

teaching-unit:           English target phrase glyph (the word the child learns: "Hello", "I'm", "Goodbye")
teaching-unit-min:       ≥ 8% of short-side = 58 px
teaching-unit-target:    12–15% of short-side = 86–108 px  (read-along word size swells to this range)

character-face-min:      ≥ 15% of short-side = 108 px   (figures are scene context, not the teaching signal)
character-face-target:   25–33% of short-side = 180–240 px

bubble-text-min:         48 px rendered   (English phrase inside the speech bubble)
body-label-min:          36 px rendered   (name card, echo prompt)
caption-line-min:        56 px rendered   (Chinese narration ribbon)
chrome-label:            FORBIDDEN — if a label is decoration, delete it
```

All minimums are met by the zone declarations below. The prior kp1-hello-greetings lesson (same composition size, same component set) validates these thresholds at render: `FIGURE_RADIUS=120` → 240 px face = 33% of short-side; `READALONG_WORD_SIZE=50` with `activeScale` swell → ~64 px cap-height = 8.9%.

## 1.5. Spatial zones

```
zone-intro-card:  centered ~(640, 260), ~680×400    | LessonIntroCard (intro cue only). Fades out before meet-hello.
                                                   | NOTHING else renders inside this zone during intro.

zone-characters:  x∈[180,1100], y∈[130,440]         | Two kid figures (boy-face left, girl-face right) + name cards.
                                                   | DialogueExchange owns placement via speakerGap + figureRadius.
                                                   | Characters live here from meet-hello through recap — never destroyed.

zone-dialogue:    x∈[180,1100], y∈[0,180]            | Speech bubbles + emphasis PulseCircle. Above characters.
                                                   | DialogueExchange auto-places bubbles above each figure.
                                                   | At most 2 visible at once (maxVisibleBubbles=2).

zone-target:      centered ~(640, 500), ~1060×100    | ReadAlongHighlight phrase row (English target words).
                                                   | Below figures+bubbles, above caption ribbon.
                                                   | For im-echo: the zoomed "I'm" glyph uses this zone at enlarged scale.

zone-gloss:       centered ~(640, 430), ~500×60      | L1 gloss ("你好") and echo prompt ("跟我说：").
                                                   | Between dialogue and target zones. Never overlaps zone-dialogue.

zone-caption:     x∈[0,1280], y∈[620,720]            | Chinese narration ribbon (HTML overlay, outside SVG).
                                                   | All cues. Fixed position, full width.

zone-marks:       full-bleed                         | Sketch marks (TeacherMark). At most 1 per cue; most cues = 0.
                                                   | May trace zone-dialogue (emphasis arc); never sit inside zone-target.
```

**Z-order legibility (checked across every cue's motion, not one keyframe):**
- zone-dialogue (bubbles) is ABOVE zone-characters — bubbles never occlude face silhouettes.
- zone-target (read-along text) is BELOW zone-characters — text never sits on figures.
- zone-gloss is BELOW zone-dialogue — gloss text never overlaps speech bubbles.
- zone-intro-card is exclusive to the intro cue — cast enters AFTER the card fades (announce-topic `requires`: title reads alone).
- zone-marks may TRACE zone-dialogue (a coral arc under the emphasis bubble) but never SIT INSIDE zone-target or zone-gloss.
- No readable content (title, bubble text, target phrase, gloss, caption) is ever occluded by any element drawn over it — across the cue's full motion, not just the start frame.

## 2. Palette & motion vocabulary

### Palette (theme.ts keys)

| Role | Token | Hex | Usage |
|---|---|---|---|
| Canvas background | `cream` | `#FFF7E6` | Scene background. Warm, never competes with teaching content. |
| Ink (text, outlines, sketch marks) | `textNavy` | `#24324B` | All readable text, figure outlines, bubble strokes, sketch ink. |
| Emphasis / action accent | `coral` | `#FF8A65` | DialogueExchange emphasis PulseCircle on "I'm", wave gesture arcs. |
| Transient highlight | `sunshine` | `#FFD85A` | ReadAlongHighlight active-item glow. Never persistent identity. |

**Max 4 meaningful colors + cream background.** No fifth color. Character faces (boy-face, girl-face) carry their own on-palette theme fills from the generated-asset system — these are representational, not meaning-bearing.

### Motion vocabulary (intent — frame counts per move type)

| Move type | Frames | Curve | Use |
|---|---|---|---|
| Character entrance | 16–20 | `EASE.enter` | Kids fade/slide in at meet-hello. |
| Speech bubble pop-in | 20 | `PopIn motion="bouncy"` | First bubble of each exchange (anticipation → overshoot → settle). ONE accent per video. |
| Subsequent bubbles | 16 | `PopIn motion="snap"` | Default entrance for non-accent bubbles. |
| Emphasis pulse | 24 | `PulseCircle` (internal) | DialogueExchange emphasis flag on "I'm" turn. |
| Read-along sweep | per-beat | internal `EASE.outCubic` | Cursor travels item-to-item; `perBeatDurationFrames` controls pace. |
| Gloss/prompt fade-in | 12 | `EASE.outCubic` | "你好" gloss, "跟我说：" echo prompt. |
| Title card write-on | 40 | progress 0→1 | LessonIntroCard reveal. Calm settle. |
| Echo invitation pulse | 16 | `EASE.enter` | PointerHandArrow or PulseCircle on child's side — "your turn." |
| Intro card fade-out | 14 | `EASE.outCubic` | Card clears before meet-hello mounts stage. |

**Reserve `motion="bouncy"` for ONE moment per video** — the first speech bubble pop-in at meet-hello (the concept of "someone is speaking English" being introduced). All other bubble entrances use `motion="snap"`.

## 3. Visual Contract

```
metaphor:           Two friends meet at the school gate; their speech bubbles carry the English words we're learning —
                    one continuous encounter where who speaks and what they say changes, but the friends stay the same.

regions:            zone-intro-card  → topic framing (intro only, then clears)
                    zone-characters  → the two identity-invariant kids (boy left, girl right) — continuous scene context
                    zone-dialogue    → speech bubbles above the speaking kid, pop in turn-by-turn
                    zone-target      → English target phrase as read-along text (swept word-by-word)
                    zone-gloss       → L1 meaning bridge (beside/under the target, never over it)
                    zone-caption     → Chinese narration ribbon (accessibility)

between-states:     The two characters and backdrop NEVER change across the 6 cues.
                    What changes: who speaks, what they say, where the emphasis lands, what the read-along highlights.
                    The encounter is ONE continuous scene — dialogue is layered on top, not a separate picture.

reading-order:      intro:        title → teaser → cast fades in beneath
                    dialogue cues: characters → speaking kid's bubble → target phrase (read-along) → gloss → caption
                    im-echo:      zoomed "I'm" in zone-target → echo prompt → caption
                    recap:        characters + sequential bubbles (Hello → I'm Sam → Goodbye) → highlight tracks each

decoration-budget:  1 cream background + 1 caption ribbon = 2 stacked surfaces total.
                    School-gate backdrop is a SINGLE simple SVG silhouette (fence + archway), opacity ~0.12,
                    warm gray — scene context, not decoration. Counts as part of the background, not a surface.
                    No cards behind characters. No containers around bubbles. No glow on the read-along
                    beyond the cursor's own sunshine tint.

text-budget:        English target words ("Hello!", "I'm Sam", "Goodbye!", "Bye-Bye!")
                      → LOAD-BEARING — the teaching content. Never implied by geometry alone.
                    L1 gloss ("你好") → LOAD-BEARING — bridges L2→L1 for first exposure. Shown once (meet-hello).
                    Echo prompt ("跟我说：") → LOAD-BEARING — signals the child's turn in the call-and-response.
                    Intro card (title + section + teaser) → LOAD-BEARING — announce-topic framing.
                    Captions → LOAD-BEARING — accessibility + ESL support.
                    Speaker name card ("Sam") → LOAD-BEARING — identifies Kid B for the introduction.
                    NO chrome labels. NO topic headers during dialogue. NO "Lesson 1" badges.

occupancy:          Characters: each face ~240 px diameter = 33% of 720 short-side (target range 25-33%).
                    Two characters together span ~560 px horizontal gap + 2×240 face = ~1040 px ≈ 81% of canvas width.
                    Speech bubble text: ~50 px base, ~64 px when swelled by read-along active scale (8.9% of short-side).
                    For im-echo: "I'm" in zone-target at enlarged scale (~96 px = 13.3%, within target range),
                      centered, nothing on top (model-target-slow requires: target big, centered, nothing on top).

identity-invariant: <IconAsset name="boy-face"/> (Kid A) and <IconAsset name="girl-face"/> (Kid B) are the SAME
                    ReactNode instances from meet-hello through recap-encounter — never destroyed, never recreated.
                    Characters' visual appearance (face design, hair, clothing colors, figure radius) is IDENTICAL
                    across all 6 cues. Only speech content, emphasis flag, and gesture prop change per cue.
                    The school-gate backdrop is also identity-invariant (same SVG, same position, all cues).
```

## 4. Per-cue visualMotionSeconds

visualMotionSeconds is the MINIMUM time each cue's visual motion needs to READ for a 6-year-old. Intent only — no absolute frames. Wave 2b narration targets this budget. Wave 3.5 reconcile uses it as the visual side of `max(narration, visual) + tail`.

| Cue | Pedagogy discovery | Visual beats (what moves) | visualMotionSeconds |
|---|---|---|---|
| `intro` | _(lesson-level framing)_ | Card reveal (write-on + stagger) → teaser settle → cast fade-in beneath. Title reads ALONE before cast enters (announce-topic requires). | **2.0s** |
| `meet-hello` | When I meet someone, I can greet them by saying "Hello" in English. | Characters mounted (fade-in from intro) → Kid A wave + bubble pop (bouncy, first accent) → ReadAlongHighlight "Hello!" begins sweep → gloss "你好" fades in below → echo prompt appears. 4 sequential visual beats: approach+wave, bubble, gloss, echo-invite. | **3.5s** |
| `hi-intro` | I can tell someone my name using "I'm ___" — /aɪm/ is one smooth sound. | Kid B lean + response bubble pop (snap) → emphasis PulseCircle fires on "I'm" → ReadAlongHighlight "Hi! I'm Sam" sweeps, cursor DWELLS on "I'm" to match slow model. 3 sequential beats: bubble, emphasis, read-along sweep. | **3.0s** |
| `im-echo` | "I'm" sounds like /aɪm/ — one glide. I can copy that sound. | Zoom-in on "I'm" bubble to zone-target scale (model-target-slow: big, centered, nothing on top) → slow model hold (text swells, emphasis pulse) → return to normal → echo invitation pulse. 3 exposures: slow model, normal replay, echo invite. Key-difficult gets the most visual time. | **4.5s** |
| `part-goodbye` | When I leave someone, I can say "Goodbye" or "Bye-Bye" in English. | Characters drift apart (parting motion) → Kid A bubble "Goodbye!" (snap) → Kid B bubble "Bye-Bye!" (snap) → both wave gestures → ReadAlongHighlight tracks both variants. 4 sequential beats. | **3.5s** |
| `recap-encounter` | Three things I can do in one English conversation — I just did all three. | Condensed replay of all 3 exchanges in sequence: Hello bubble → I'm Sam bubble (emphasis) → Goodbye bubble. ReadAlongHighlight tracks each phrase as it replays. Final celebration: one closing PulseCircle or SparkleBurst on the arc's center ("I'm Sam" row). 3 exchange replays + closing accent. | **5.0s** |

**Totals:** 2.0 + 3.5 + 3.0 + 4.5 + 3.5 + 5.0 = **21.5s** visual motion. With narration and tail, the lesson should land in the 45–60s band.

## 5. Capability inventory (for W3b gap scan)

### Existing — no gap

| Demand | Capability | Source |
|---|---|---|
| Kid A character | `<IconAsset name="boy-face"/>` | Generated asset library (character-face) |
| Kid B character | `<IconAsset name="girl-face"/>` | Generated asset library (generated) |
| Speech bubbles + turn-taking | `<DialogueExchange>` | Motion components (registered) |
| Emphasis pulse on "I'm" | `DialogueExchange` `emphasis: true` → internal `<PulseCircle>` | Composed by DialogueExchange |
| Read-along word sweep | `<ReadAlongHighlight cursor="ball">` | Motion components (registered) |
| Topic intro card | `<LessonIntroCard>` | Literacy primitives (registered) |
| Wave gesture | `DialogueExchange` `gesture: "wave"` | Prop on DialogueTurn |
| Point-self gesture | `DialogueExchange` `gesture: "point-self"` | Prop on DialogueTurn |
| Echo invitation pointer | `<PointerHandArrow>` | Interaction primitives (registered) |
| Closing celebration | `<SparkleBurst>` or `<PulseCircle>` | FX / Motion components |
| Moving-hold breath | `<Breathe>` | FX components (registered) |

### Flagged for W3b gap scan

| Demand | Status | Priority |
|---|---|---|
| **School-gate backdrop** | Not in asset library. Needs a simple SVG silhouette (fence posts + archway + "school" hint), warm gray at ~12% opacity, identity-invariant across all cues. Low complexity — may be a minimal inline SVG or a new `<IconAsset name="school-gate"/>`. | Medium |
| **"Your turn" visual cue** | `invite-echo` requires a clear "your turn" signal. May be satisfiable by composing existing `<PointerHandArrow variant="hand" direction="right">` pointing toward the child's side of the screen, or a `<PulseCircle>` on the read-along row. If neither reads clearly, a new minimal indicator. | Low |
| **Im-echo zoom-in** | The "zoom into the speech bubble" for the echo drill needs a scene-level scale transform centered on the bubble, with surrounding content dimming. This is a scene-level composition technique (interpolate the SVG group's scale + translate, fade siblings), not a new primitive. Flag for W4 composer awareness. | Low |

## 6. Finger-cover test (kids-eye §3)

| Cover this… | Does the picture still teach? | Verdict |
|---|---|---|
| Characters | The speech bubbles + read-along text still carry the English phrases. But the social context (WHO is speaking to WHOM) is lost — the lesson becomes floating text. Characters are load-bearing scene context. | **Keep** |
| Speech bubbles | Characters alone show two kids standing at a gate — no language content. The lesson's core (English phrases) is gone. | **Keep** — bubbles ARE the teaching content |
| ReadAlongHighlight | The speech bubbles still show the text, but the child loses the timing guide (which word is being said NOW). Without the sweep, the child hears the phrase but can't track which word matches the sound. | **Keep** — load-bearing for timing |
| Gloss "你好" | The English phrase still shows + sounds, but the first-time learner has no L1 bridge. Per pedagogy: gloss is shown ONCE (meet-hello). After that, the child has the meaning. | **Keep** — but only for meet-hello; drop for later cues |
| Echo prompt "跟我说：" | The child still hears the model and sees the text, but the call-and-response rhythm needs a visual "your turn" signal. Without it, the child doesn't know when to speak. | **Keep** — load-bearing for interaction rhythm |
| Caption ribbon | The visual + audio still teach without captions. But captions are load-bearing for accessibility and ESL learners (visual-discipline §7). | **Keep** — accessibility |
| School-gate backdrop | Characters + bubbles + text still teach perfectly. The gate is scene context that prevents "floating heads" but is not load-bearing for any discovery. | **Keep** — but minimal (silhouette only, ~12% opacity, single SVG) |
| ALL except speech bubble with "I'm" | During im-echo: the zoomed "I'm" alone, centered, with the teacher's slow model audio, IS the lesson. The child hears /aɪm/ and sees the glyph. This is the key-difficult — it survives isolation. | **Pass** ✓ |

## 7. Identity-invariant analysis (kids-eye §4)

This lesson does NOT show a mathematical transformation (no 10-ones → 1-ten). The identity-invariant rule applies differently here:

**What stays identical across all 6 cues:**
- `<IconAsset name="boy-face"/>` — same ReactNode, same position (left), same visual appearance
- `<IconAsset name="girl-face"/>` — same ReactNode, same position (right), same visual appearance
- School-gate backdrop SVG — same element, same position, same opacity
- DialogueExchange `speakerGap`, `figureRadius` — same geometry props across all cues

**What changes per cue (all via props, not identity):**
- `turns[]` — different utterance ReactNodes per cue (the dialogue content)
- `gesture` per turn — `"wave"` for greetings/farewells, `"point-self"` for introduction, `"none"` otherwise
- `emphasis` flag — `true` only on the "I'm Sam" turn (hi-intro) and the "I'm" echo turn (im-echo)
- ReadAlongHighlight `lines` — different phrase per cue
- Gloss text — present in meet-hello only

**No forbidden changes:**
- No color shift across cues (characters don't change color when they speak)
- No shape change (same face SVG throughout)
- No "celebratory" visual shift when the child "gets it"
- No different visual vocabulary between cues — it's ONE scene with layered dialogue

## 8. One-metaphor rule (visual-discipline §2)

**The metaphor:** Two friends at a gate — speech bubbles carry the English.

**Rejected alternatives:**
- ~~Flashcard-style: show each phrase on a separate card~~ — violates the brief's "one tiny encounter, not three flashcards."
- ~~Split-screen: teacher on left, kids on right~~ — introduces a second visual frame that fights the encounter metaphor.
- ~~Word-by-word build: each English word flies in from off-screen~~ — makes the phrase feel like a construction exercise, not a social moment.

**One metaphor, consistently applied:** Speech bubbles appear above the speaking character in turn order. The read-along highlight sweeps the same text below. This is the ONLY visual idiom for language delivery in this lesson.

## 9. Container audit (visual-discipline §3)

| Surface | Semantic role | Verdict |
|---|---|---|
| Cream background | Canvas — not a container | ✓ Allowed |
| Caption ribbon | Holds the Chinese narration — load-bearing reading affordance | ✓ Allowed |
| Speech bubble (white fill, navy stroke) | Distinguishes the speaker's words from the scene — carries the dialogue | ✓ Allowed (it IS the dialogue) |
| LessonIntroCard surface (optional card fill) | Holds the title/teaser during intro only | ✓ Allowed (cardFill defaults off — use only if needed for legibility) |

**Layer budget:** cream background → (gate silhouette at 12% opacity) → characters → bubbles → text. The gate silhouette is part of the background, not a stacked surface. Total stacked surfaces between canvas and teaching content: **1** (caption ribbon only, docked at bottom). Well within the 2-surface budget.

**Forbidden surfaces — NONE present:**
- No card behind a character (the face has its own silhouette)
- No tinted box behind a speech bubble (the bubble IS the container)
- No decorative chrome around "I'm" (the emphasis PulseCircle is the signal, not a background)
