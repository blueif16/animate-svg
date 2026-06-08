# kp1-hello-greetings — Storyboard (Wave 1)

The spine. The cue IDs and their order below are the contract every later wave binds to
(voice, visuals, timing, captions). They are taken VERBATIM from `pedagogy.md` so each cue
carries exactly one named discovery. NO durations and NO frames live here — cue windows are
decided ONLY by Wave 3.5 reconcile = max(narrationFrames, visualMotionFrames) + tail.

**Lesson shape.** ONE tiny encounter between the SAME two kids, read left-to-right in time:
title → they meet (Hello) → one names herself (I'm…) → they part (Goodbye) → the arc replayed
as one connected sequence. The two kid characters are identity-invariant: the same two figures
persist from `intro` through `recap`, and are reused by later Unit 1 lessons.

**Division of labor (pedagogy §4 narration discipline).** The English target word is delivered
BY THE PICTURE — the kid speaking, on the wave, inside the speech bubble (`DialogueExchange`
turns) and surfaced by `ReadAlongHighlight`. Chinese teacher narration only NAMES THE MOMENT
(meeting / introducing / parting / recap); it never speaks the English answer, or the picture
becomes decoration. Every English token stays short and isolated (Hello / Hi / I'm Sam /
Goodbye / Bye-Bye) so TTS pronounces it un-blended and it sets no cue boundary of its own.

**Stage ceiling (pedagogy §3).** No cue rises above `represent`. The spoken form is surfaced as
a trackable read-along highlight; spelling / letters / IPA on screen (stage `symbolize`) is §1.3
and NEVER appears here.

**Pulse budget (taste two-pulse rule).** Exactly TWO attention pulses in the whole lesson, both
load-bearing: (1) the `I'm` emphasis pulse in `intro-self`, (2) the closing recap punctuation
pulse in `recap`. No other cue fires a pulse.

---

## Cue spine

### 1. `intro`
- **discovery (pedagogy):** Today's job — learn to say hello, say who we are, and say goodbye in
  English — and meet the two kids who carry every phrase.
- **stage:** represent
- **narration beat (intent, Chinese, NO copy):** announce the lesson's topic and frame the job —
  *today we learn three English things to say: a greeting, telling who you are, and a farewell.*
  Names the moment "we're starting / here's what we'll learn"; speaks no English answer.
- **required visual:** the topic-intro title card resolving in — lesson title + Unit 1 "Hello!"
  section teaser. As it settles, the TWO kid faces appear quiet beneath it as the cast for what
  follows (the same two figures reused in every later cue). English target words are NOT shown
  yet — this cue only sets up topic + cast.
- **owned by W4 composer using:** the normalized topic-intro card primitive (see GAP-1) + the
  two identity-invariant kid figures (see GAP-2), placed via `layout.ts`.

### 2. `meet-hello`
- **discovery (pedagogy):** When you MEET someone, the English greeting is "Hello!" / "Hi!" — and
  the child sees it is the thing you say AT the moment of meeting (the greeting rides the wave).
- **stage:** concrete (a routine performed in its real moment)
- **narration beat (intent, Chinese, NO copy):** name the meeting moment — *look, they're meeting;
  this is how you greet someone.* The Chinese frames "打招呼 / 见面"; the greeting word itself is
  spoken by the picture, not the narrator.
- **required visual:** `DialogueExchange`, turn 1 — the LEFT kid waves (`gesture: 'wave'`) and her
  speech bubble pops in on the wave carrying the greeting utterance (caller-supplied line node,
  e.g. "Hello!" / "Hi!"; never baked into the component). `ReadAlongHighlight` surfaces that exact
  greeting phrase as it lands so the child can track and say it along. No emphasis pulse here.

### 3. `intro-self`
- **discovery (pedagogy):** After greeting, you tell someone WHO YOU ARE with "I'm ___" — and the
  child discovers the precise SOUND of "I'm": one syllable /aɪm/, modeled BIG and slow, not [em]
  and not two beats [ai-m]. (This is the lesson's `key_difficult`.)
- **stage:** represent
- **narration beat (intent, Chinese, NO copy):** name the self-introduction moment WARMLY —
  *now she tells him who she is; listen to this one sound.* Models it warmly, does NOT correct-drill
  harshly (per curriculum 应对建议). The "I'm" / "Sam" tokens are delivered by the picture.
- **required visual:** `DialogueExchange`, turn 2 — the RIGHT kid replies with the self-intro
  utterance ("Hi! I'm Sam.", caller-supplied), `emphasis: true` firing ONE pulse (PulseCircle) on
  the "I'm" segment. `ReadAlongHighlight` swells "I'm" as a SINGLE held unit (one beat in `beats[]`,
  weighted long), never split into two ticks — the match-the-spoken-count rule for sound. This is
  pulse #1 of the two-pulse budget.

### 4. `part-goodbye`
- **discovery (pedagogy):** When you LEAVE someone, the English farewell is "Goodbye!" / "Bye-Bye!"
  — said AT the moment of parting, closing the encounter that opened with Hello.
- **stage:** concrete
- **narration beat (intent, Chinese, NO copy):** name the parting moment — *time to go; this is how
  you say goodbye.* Frames "再见 / 该走了"; the farewell word is delivered by the picture.
- **required visual:** `DialogueExchange` farewell turns — BOTH kids wave (`gesture: 'wave'`) as
  they begin to move apart, the "Goodbye!" / "Bye-Bye!" bubbles popping in on the waves (caller
  lines). `ReadAlongHighlight` surfaces the farewell phrase as it is spoken. No emphasis pulse.

### 5. `recap`
- **discovery (pedagogy):** The whole social arc as ONE connected sequence — meeting (Hello) →
  naming (I'm…) → parting (Goodbye) — confirming the three phrases are three moments of one
  encounter, not three separate words to drill.
- **stage:** represent
- **narration beat (intent, Chinese, NO copy):** name the arc as a whole — *so: when we meet we say
  hello, we tell who we are, and when we leave we say goodbye — one little meeting.* Frames the
  beginning-middle-end; English phrases shown, not re-spoken as the answer.
- **required visual:** the three phrases lined up as the encounter's beginning → middle → end
  (surfaced via `ReadAlongHighlight` across the three phrase rows, or the three settled bubbles
  recalled in order), with the closing punctuation pulse (PulseCircle) — pulse #2 of the budget.
  The same two kid figures STAY PRESENT so the arc reads as THEIRS, not as a flashcard list.

---

## Capability notes for Wave 3 gap-scan (NOT durations, NOT code — demands only)

These are required-visual demands this storyboard makes; the W3b primitive gap-scan owns deciding
build-vs-reuse and shipping any new capability (registered, lesson-agnostic). Naming them here so
no later wave is surprised. The teaching beats (cues 2–4) are already covered by the registered
`DialogueExchange` + `ReadAlongHighlight` — both are lesson-agnostic and bake no copy.

- **GAP-1 — topic-intro card primitive.** CLAUDE.md mandates every lesson opens with a topic-intro
  card (title + section + KP teaser). The capability catalog (`src/capabilities/catalog-digest.md`)
  has no `topic-intro` / lesson-title card entry. Either a normalized intro-card primitive must be
  built/registered by W3b, or — if a fit already exists outside the digest — it must be confirmed.
  Designing the intro layout is the gap-scan's job, never the composer's. Lesson-agnostic: copy is
  a per-lesson prop, never baked.

- **GAP-2 — a SECOND identity-invariant kid face/figure.** `intro` (and every dialogue cue) needs
  TWO distinct kid characters who persist across the lesson and into later Unit 1 lessons. The asset
  catalog (`src/capabilities/asset-catalog.json`, category `character-face`) currently has only
  `boy-face` among kid faces (the others are robot/cloud faces). A second kid face (e.g. a girl /
  a contrasting kid) is needed so the two speakers in `DialogueExchange` read as two different
  people. Generated decorative SVG asset is the likely path (fixed-form, decorative cast member,
  not a teaching primitive) — owned by W3b primitive/asset gap-scan, not the composer.

- **No new gap for the dialogue or read-along beats.** `DialogueExchange` (turns / emphasis flag /
  `gesture:'wave'`) and `ReadAlongHighlight` (lines + weighted `beats[]` + cursor) already exist
  and exactly cover meet / intro-self / part / recap. REUSE, do not build.
