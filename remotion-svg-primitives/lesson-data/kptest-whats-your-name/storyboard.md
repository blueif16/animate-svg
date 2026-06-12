# kptest-whats-your-name — Storyboard (Wave 1)

The spine. The cue IDs and their order below are the contract every later wave binds to
(voice, visuals, timing, captions). They are taken VERBATIM from `pedagogy.md` so each cue
carries exactly one named discovery. NO durations and NO frames live here — cue windows are
decided ONLY by Wave 3.5 reconcile = max(narrationFrames + gapFrames, visualMotionFrames) + tail (tail ≤ 9 frames).

**Lesson shape.** ONE tiny encounter between the SAME two kids, read left-to-right in time:
ask → answer → role‑swap ask → role‑swap answer → recap. The two kid characters are identity-invariant: the same two figures persist from the first ask through the recap, and are reused by later Unit 1 lessons.

**Division of labor (pedagogy §4 narration discipline).** The English target word is delivered
BY THE PICTURE — the kid speaking, on the wave, inside the speech bubble (`DialogueExchange`
turns) and surfaced by `ReadAlongHighlight`. Chinese teacher narration only NAMES THE MOMENT
(asking / answering / role‑swap / recap); it never speaks the English answer, or the picture
becomes decoration. Every English token stays short and isolated (What's / name's) so TTS
pronounces it un-blended and it sets no cue boundary of its own.

**Stage ceiling (pedagogy §3).** No cue rises above `represent`. The spoken form is surfaced as
a trackable read-along highlight; spelling / letters / IPA on screen (stage `symbolize`) is §1.3
and NEVER appears here.

**Pulse budget (taste two-pulse rule).** Exactly TWO attention pulses in the whole lesson, both
load-bearing: (1) the `What's` emphasis pulse in `ask`, (2) the `name's` emphasis pulse in `answer`.
No other cue fires a pulse.

---

## Cue spine

### 1. `ask`
- **teaching actions:** stage-the-moment, model-target-slow, track-read-along, invite-echo
- **discovery (pedagogy):** The child discovers the English question for asking someone's name: "What's your name?" — and that "What's" is pronounced /wɒts/ as one syllable, not "what is".
- **stage:** represent
- **narration beat (intent, Chinese, NO copy):** name the asking moment — *listen, he is asking for a name; this is how you ask someone's name in English.* The Chinese frames "听，他在问名字"; the question itself is spoken by the picture, not the narrator.
- **required visual:** `DialogueExchange`, turn 1 — the LEFT kid leans in and her speech bubble pops in on the wave carrying the question utterance (caller-supplied line node, e.g. "What's your name?"; never baked into the component). `ReadAlongHighlight` surfaces that exact question phrase as it lands so the child can track and say it along, with emphasis on the "What's" unit (one beat in `beats[]`, weighted long), never split into two ticks — the match-the-spoken-count rule for sound. This is pulse #1 of the two-pulse budget.

### 2. `answer`
- **teaching actions:** stage-the-moment, model-target-slow, track-read-along, invite-echo
- **discovery (pedagogy):** The child discovers the English answer for stating one's name: "My name's ___." — and that "name's" is pronounced /neɪmz/ (the /mz/ cluster Mandarin phonology lacks), not "name is".
- **stage:** represent
- **narration beat (intent, Chinese, NO copy):** name the answering moment — *now she tells him her name; listen to this sound.* The Chinese frames "该说自己的名字啦"; the answer itself is spoken by the picture, not the narrator.
- **required visual:** `DialogueExchange`, turn 2 — the RIGHT kid replies with the answer utterance ("My name's Lily.", caller-supplied), `emphasis: true` firing ONE pulse (PulseCircle) on the "name's" segment. `ReadAlongHighlight` swells "name's" as a SINGLE held unit (one beat in `beats[]`, weighted long), never split into two ticks — the match-the-spoken-count rule for sound. This is pulse #2 of the two-pulse budget.

### 3. `ask‑swap`
- **teaching actions:** replay of `ask`
- **discovery (pedagogy):** The child discovers that they can be the one asking the question, using the correct pronunciation of "What's".
- **stage:** represent
- **narration beat (intent, Chinese, NO copy):** name the swapped asking moment — *now it's your turn to ask; listen to how you say it.* The Chinese frames "现在轮到你问了"; the question is spoken by the picture (the other kid), not the narrator.
- **required visual:** `DialogueExchange`, turn 3 — the RIGHT kid (now in the asking role) gestures and her speech bubble pops in on the wave carrying the question utterance (caller-supplied line node, e.g. "What's your name?"). `ReadAlongHighlight` surfaces the question phrase as it is spoken, with emphasis on "What's" as a single unit. No new pulse here; the emphasis pulses are only in the original `ask` and `answer` cues.

### 4. `answer‑swap`
- **teaching actions:** replay of `answer`
- **discovery (pedagogy):** The child discovers that they can answer the question with their own name, using the correct pronunciation of "name's".
- **stage:** represent
- **narration beat (intent, Chinese, NO copy):** name the swapped answering moment — *now it's your turn to answer; listen to how you say it.* The Chinese frames "现在轮到你回答了"; the answer is spoken by the picture (the first kid), not the narrator.
- **required visual:** `DialogueExchange`, turn 4 — the LEFT kid (now in the answering role) replies with the answer utterance ("My name's TK.", caller-supplied), `ReadAlongHighlight` surfaces the answer phrase as it is spoken, with emphasis on "name's" as a single unit. No new pulse here.

### 5. `recap`
- **teaching actions:** spaced-recall
- **discovery (pedagogy):** The child sees the whole name exchange as one connected sequence — ask → answer → role‑swap ask → role‑swap answer — confirming that both halves are usable moves in a real meeting, not isolated words to drill.
- **stage:** represent
- **narration beat (intent, Chinese, NO copy):** name the arc as a whole — *so: when we meet we ask, we answer, we swap roles and ask again, we answer again — one little meeting of four turns.* The Chinese frames "这样一问一答一问一答，就是认识朋友的方式了"; the English phrases are shown, not re‑spoken as the answer.
- **required visual:** the four speech bubbles lined up as the encounter's sequence → ask → answer → ask‑swap → answer‑swap (surfaced via `ReadAlongHighlight` across the four phrase rows, or the four settled bubbles recalled in order), with the closing punctuation pulse (PulseCircle) — the lesson's second and final allowed pulse. The same two kid figures STAY PRESENT so the arc reads as THEIRS, not as a flashcard list.

---

## Capability notes for Wave 3 gap-scan (NOT durations, NOT code — demands only)

These are required-visual demands this storyboard makes; the W3b primitive gap-scan owns deciding
build-vs-reuse and shipping any new capability (registered, lesson-agnostic). Naming them here so
no later wave is surprised. The teaching beats (cues 1–4) are already covered by the registered
`DialogueExchange` + `ReadAlongHighlight` — both are lesson-agnostic and bake no copy.

- **No new gap for the dialogue or read-along beats.** `DialogueExchange` (turns / emphasis flag /
  `gesture:'lean-in'`) and `ReadAlongHighlight` (lines + weighted `beats[]` + cursor) already exist
  and exactly cover ask / answer / ask‑swap / answer‑swap / recap. REUSE, do not build.

- **Note on pulses:** The lesson uses exactly two emphasis pulses, one on "What's" in cue `ask` and
  one on "name's" in cue `answer`. These are delivered via the `emphasis: true` flag on the
  corresponding `DialogueExchange` turn, which triggers a `PulseCircle` primitive. Ensure the
  primitive registry includes a `PulseCircle` that can be triggered by the emphasis flag.


exposures: { ask: 2, answer: 2 }